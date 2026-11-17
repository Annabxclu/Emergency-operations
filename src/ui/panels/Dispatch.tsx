import { useEffect, useState } from 'react';
import { missingRequirements } from '../../engine/game';
import type { Incident, Vehicle } from '../../engine/types';
import { capability, dept, vehicleType } from '../../data/departments';
import { CATEGORY_DEPT } from '../../data/incidents';
import { Btn, Chip, Dot, Empty, Header, Section, useCtx } from '../common';
import { INCIDENT_STATUS, OUTCOME, SEVERITY, VEHICLE_STATUS, dur, money } from '../format';
import { glyph } from '../icons';

function IncIcon({ inc }: { inc: Incident }) {
  return <span className={`inc-ico sev${inc.severity}`} dangerouslySetInnerHTML={{ __html: glyph(inc.category, 15) }} />;
}

export function timerText(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  const now = game.state.time;
  if (inc.status === 'working') return `Working · ${dur((inc.workUntil ?? now) - now)}`;
  const left = inc.deadline - now;
  return `${inc.late ? 'Overdue' : 'Respond'} · ${dur(left)}`;
}

export function DispatchList() {
  const { game, push } = useCtx();
  const c = game.city;
  const active = [...c.incidents].sort((a, b) => (a.status === 'working' ? 1 : 0) - (b.status === 'working' ? 1 : 0) || a.deadline - b.deadline);
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Dispatch</div>
        <div className="sub">{active.length} active · {c.stats.calls} handled · {c.stats.successful} successful</div></div></div>
      {!game.setupDone && <Empty>Place your three starter stations to begin receiving calls.</Empty>}
      {game.city.goals && game.setupDone && (
        <div className="goals" data-testid="goals">
          <div className="goals-head">Today's goals</div>
          {game.city.goals.list.map(g => (
            <div key={g.id} className={`goal ${g.done ? 'done' : ''}`}>
              <div className="goal-top"><span>{g.done ? '✓ ' : ''}{g.label}</span><span className="muted small">{g.progress}/{g.target} · {money(g.reward)}</span></div>
              <div className="xpbar wide"><span style={{ width: `${(g.progress / g.target) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
      {game.setupDone && !active.length && <Empty>No active calls. New calls will appear here and on the map.</Empty>}
      <div className="list">
        {active.map(inc => {
          const st = INCIDENT_STATUS[inc.status];
          return (
            <button key={inc.id} className="row" onClick={() => push({ kind: 'incident', id: inc.id })} data-testid="incident-row">
              <IncIcon inc={inc} />
              <div className="grow">
                <div className="row-title">{inc.name}{inc.escalated && <span className="tag bad">Escalated</span>}</div>
                <div className="row-sub">{inc.address} · {inc.district}</div>
              </div>
              <div className="row-right">
                <Chip tone={st.tone}>{st.label}</Chip>
                <div className={`timer ${inc.late ? 'bad' : ''}`}>{timerText(game, inc)}</div>
              </div>
            </button>
          );
        })}
      </div>
      {c.resolved.length > 0 && (
        <Section title="Recent calls">
          <div className="list">
            {c.resolved.slice(0, 12).map(inc => (
              <button key={inc.id} className="row compact" onClick={() => push({ kind: 'incident', id: inc.id })}>
                <IncIcon inc={inc} />
                <div className="grow"><div className="row-title">{inc.name}</div><div className="row-sub">{inc.number} · {inc.district}</div></div>
                <div className="row-right"><Chip tone={OUTCOME[inc.outcome!].tone}>{OUTCOME[inc.outcome!].label}</Chip>
                  <div className={`amt ${inc.payout < 0 ? 'bad' : 'ok'}`}>{money(inc.payout)}</div></div>
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

export function IncidentDetail({ id }: { id: string }) {
  const { game, act, push, focus } = useCtx();
  const inc = game.incident(id);
  const [sel, setSel] = useState(() => new Set<string>());
  const [touched, setTouched] = useState(false);

  useEffect(() => { if (inc) focus(inc.pos, 15); }, [id]);
  // Pre-select recommended units until the player changes the selection.
  const rec = inc ? game.recommend(inc.id) : { ids: [], unfilled: [] };
  const recKey = rec.ids.join(',');
  useEffect(() => { if (!touched) setSel(new Set(rec.ids)); }, [recKey, touched]);

  if (!inc) return <div><Header title="Call not found" /></div>;
  const closed = inc.status === 'resolved';
  const attached = game.incidentVehicles(inc.id);
  const responding = attached.filter(v => v.status !== 'onscene');
  const onScene = attached.filter(v => v.status === 'onscene');
  const missingOnScene = missingRequirements(inc.requirements, onScene);
  const missingAll = missingRequirements(inc.requirements, game.responding(inc));

  // Requirement rows: needed, on scene, responding
  const reqRows = inc.requirements.map(r => {
    const miss = missingOnScene.find(m => m.cap === r.cap)?.count ?? 0;
    const missAll = missingAll.find(m => m.cap === r.cap)?.count ?? 0;
    return { ...r, onScene: r.count - miss, coming: miss - missAll, short: missAll };
  });

  const candidates = game.city.vehicles
    .filter(v => v.incidentId == null && (v.status === 'available' || v.status === 'returning' || v.status === 'out_of_service' || v.status === 'maintenance'))
    .map(v => ({ v, eta: game.etaEstimate(v, inc.pos), problem: game.dispatchProblem(v) }))
    .sort((a, b) => (a.problem ? 1 : 0) - (b.problem ? 1 : 0) || a.eta - b.eta)
    .slice(0, 30);

  const toggle = (v: Vehicle) => {
    setTouched(true);
    const n = new Set(sel);
    if (n.has(v.id)) n.delete(v.id); else n.add(v.id);
    setSel(n);
  };
  const dispatch = () => {
    const ids = [...sel].filter(i => candidates.some(c => c.v.id === i && !c.problem));
    if (act(() => game.dispatch(inc.id, ids), `Dispatched ${ids.length} unit${ids.length === 1 ? '' : 's'}`)) { setTouched(false); setSel(new Set()); }
  };
  const deptColor = dept(CATEGORY_DEPT[inc.category]).color;

  return (
    <div>
      <Header title={<><span className="inc-title-dot" style={{ background: deptColor }} />{inc.name}</>}
        sub={<span className="sub-row">{inc.number} · {SEVERITY[inc.severity]} {!closed ? <Chip tone={INCIDENT_STATUS[inc.status].tone}>{INCIDENT_STATUS[inc.status].label}</Chip> : <Chip tone={OUTCOME[inc.outcome!].tone}>{OUTCOME[inc.outcome!].label}</Chip>}</span>} />
      <div className="inc-info">
        <div className="addr" onClick={() => focus(inc.pos, 16)}>{inc.address}<span className="muted"> · {inc.district}</span></div>
        <p className="desc">{inc.description}</p>
        <div className="kv">
          {!closed && <span className={inc.late ? 'bad' : ''}>{timerText(game, inc)}</span>}
          {closed ? <span className={inc.payout < 0 ? 'bad' : 'ok'}>{money(inc.payout)}</span> : <span>Reward {money(inc.reward)} · {inc.xp} XP</span>}
          {inc.escalated && <span className="bad">Escalated</span>}
          {inc.patients > 0 && <span>🚑 {inc.patients} patient{inc.patients > 1 ? 's' : ''} to transport</span>}
          {inc.prisoners > 0 && <span>🚓 {inc.prisoners} suspect{inc.prisoners > 1 ? 's' : ''} to jail</span>}
        </div>
        {inc.parentId && game.incident(inc.parentId) && (
          <button className="linkish parent-link" onClick={() => push({ kind: 'incident', id: inc.parentId! })}>Part of major event: {game.incident(inc.parentId)!.name} ›</button>
        )}
      </div>

      <Section title="Required">
        <div className="reqs">
          {reqRows.map(r => (
            <div key={r.cap} className={`req ${r.onScene >= r.count ? 'met' : r.short > 0 ? 'short' : 'coming'}`}>
              <span className="n">{r.onScene}/{r.count}</span>
              <span className="grow">{capability(r.cap).name}</span>
              {r.coming > 0 && <span className="muted">{r.coming} en route</span>}
              {r.short > 0 && !closed && <span className="bad">{r.short} needed</span>}
            </div>
          ))}
        </div>
      </Section>

      {(responding.length > 0 || onScene.length > 0) && (
        <Section title="Assigned units">
          <div className="list">
            {[...onScene, ...responding].map(v => {
              const t = vehicleType(v.typeId);
              const eta = game.etaRemaining(v);
              return (
                <div key={v.id} className="row compact">
                  <Dot color={dept(t.dept).color} />
                  <button className="grow linkish" onClick={() => push({ kind: 'vehicle', id: v.id })}>
                    <div className="row-title">{v.name}</div><div className="row-sub">{t.name}</div>
                  </button>
                  <div className="row-right">
                    <Chip tone={VEHICLE_STATUS[v.status].tone}>{VEHICLE_STATUS[v.status].label}{eta != null ? ` · ${dur(eta)}` : ''}</Chip>
                    {!closed && <button className="mini" onClick={() => act(() => game.recall(v.id))}>Release</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {!closed && inc.status !== 'working' && (
        <Section title="Dispatch units" right={<button className="mini" onClick={() => { setTouched(false); setSel(new Set(rec.ids)); }}>Recommend</button>}>
          {rec.unfilled.length > 0 && (
            <div className="warnbox">No available unit for: {rec.unfilled.map(u => `${u.count}× ${capability(u.cap).name}`).join(', ')}</div>
          )}
          {!candidates.length && <Empty>No units at stations. Buy vehicles in Stations.</Empty>}
          <div className="list">
            {candidates.map(({ v, eta, problem }) => {
              const t = vehicleType(v.typeId);
              const useful = t.caps.some(cp => missingAll.some(m => m.cap === cp));
              return (
                <label key={v.id} className={`row compact pick ${problem ? 'disabled' : ''}`} data-testid="dispatch-candidate">
                  <input type="checkbox" disabled={!!problem} checked={sel.has(v.id) && !problem} onChange={() => toggle(v)} />
                  <Dot color={dept(t.dept).color} />
                  <div className="grow">
                    <div className="row-title">{v.name}{useful && !problem && <span className="tag ok">Needed</span>}</div>
                    <div className="row-sub">{problem || `${t.name} · ${game.station(v.stationId)?.name ?? ''}`}</div>
                  </div>
                  <div className="row-right"><span className="eta">~{dur(eta)}</span></div>
                </label>
              );
            })}
          </div>
          <div className="actions sticky">
            <Btn kind="primary" onClick={dispatch} disabled={![...sel].some(i => candidates.some(c => c.v.id === i && !c.problem))} testid="dispatch-btn">
              Dispatch {[...sel].filter(i => candidates.some(c => c.v.id === i && !c.problem)).length || ''}
            </Btn>
          </div>
        </Section>
      )}
      {!closed && (
        <div className="actions"><Btn kind="ghost" small onClick={() => act(() => game.abandon(inc.id), 'Call closed as failed')}>Abandon call</Btn></div>
      )}
    </div>
  );
}
