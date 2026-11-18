import { useEffect, useState } from 'react';
import { missingRequirements } from '../../engine/game';
import { distanceM } from '../../engine/geo';
import type { Incident, Vehicle } from '../../engine/types';
import { capability, dept, vehicleType } from '../../data/departments';
import { CATEGORY_DEPT } from '../../data/incidents';
import { Btn, Chip, Dot, Empty, Header, Section, StatusCode, useCtx } from '../common';
import { INCIDENT_STATUS, OUTCOME, SEVERITY, dur, money } from '../format';
import { glyph } from '../icons';

function IncIcon({ inc }: { inc: Incident }) {
  return <span className={`inc-ico st-${inc.status}${inc.severity >= 3 ? ' major' : ''}`} dangerouslySetInnerHTML={{ __html: glyph(inc.category, 15) }} />;
}

function workPct(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  if (inc.status !== 'working' || inc.workUntil == null || inc.workStartedAt == null) return 0;
  return Math.min(100, Math.max(0, ((game.state.time - inc.workStartedAt) / (inc.workUntil - inc.workStartedAt)) * 100));
}

export function timerText(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  const now = game.state.time;
  if (inc.status === 'working') return `Working · ${dur((inc.workUntil ?? now) - now)} left`;
  return `Open ${dur(now - inc.createdAt)}`;
}

export function DispatchList() {
  const { game, push } = useCtx();
  const c = game.city;
  const active = [...c.incidents].sort((a, b) => (a.status === 'working' ? 1 : 0) - (b.status === 'working' ? 1 : 0) || a.createdAt - b.createdAt);
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Dispatch</div>
        <div className="sub">{active.length}/{game.activeCap()} active · new call every {game.state.settings.callIntervalMin ?? 3} min · {c.stats.successful}/{c.stats.calls} successful</div></div></div>
      {!game.setupDone && <Empty>Place your three starter stations to begin receiving calls.</Empty>}
      {game.setupDone && !active.length && <Empty>No active calls. New calls will appear here and on the map.</Empty>}
      <div className="list">
        {active.map(inc => {
          const st = INCIDENT_STATUS[inc.status];
          return (
            <button key={inc.id} className={`row mission-row st-${inc.status}`} onClick={() => push({ kind: 'incident', id: inc.id })} data-testid="incident-row">
              <IncIcon inc={inc} />
              <div className="grow">
                <div className="row-title">{inc.name}{inc.escalated && <span className="tag bad">Escalated</span>}</div>
                <div className="row-sub">{inc.address} · {inc.district}</div>
                {inc.status === 'working' && <div className="progress"><span style={{ width: `${workPct(game, inc)}%` }} /></div>}
              </div>
              <div className="row-right">
                <Chip tone={st.tone}>{st.label}</Chip>
                <div className="timer">{timerText(game, inc)}</div>
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
  const { game, act, push, back, focus } = useCtx();
  const inc = game.incident(id);
  const [sel, setSel] = useState(() => new Set<string>());

  useEffect(() => { if (inc) focus(inc.pos, 15); }, [id]);
  // Pre-select recommended units until the player changes the selection.
  const rec = inc ? game.recommend(inc.id) : { ids: [], unfilled: [] };

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
    const n = new Set(sel);
    if (n.has(v.id)) n.delete(v.id); else n.add(v.id);
    setSel(n);
  };
  const followCands = game.followUpCandidates(inc.id)
    .map(v => ({ v, d: distanceM(v.pos, inc.pos) }))
    .sort((a, b) => a.d - b.d).slice(0, 20);
  const queued = game.followUpsFor(inc.id);
  const selFollow = [...sel].filter(i => followCands.some(c => c.v.id === i));
  const selCount = [...sel].filter(i => candidates.some(c => c.v.id === i && !c.problem)).length + selFollow.length;
  const addVehicle = (v: Vehicle) => { setSel(new Set([...sel, v.id])); };
  // Quick buttons: add the nearest available unit of a type.
  const capsInFleet = [...new Set(candidates.filter(c => !c.problem).flatMap(c => vehicleType(c.v.typeId).caps))];
  const quick = capsInFleet.map(cap => {
    const pool = candidates.filter(c => !c.problem && vehicleType(c.v.typeId).caps.includes(cap));
    const next = pool.find(c => !sel.has(c.v.id))?.v ?? null;
    return { cap, next, left: pool.filter(c => !sel.has(c.v.id)).length, needed: missingAll.some(m => m.cap === cap) };
  }).sort((a, b) => Number(b.needed) - Number(a.needed));
  const dispatch = (andNext: boolean) => {
    const ids = [...sel].filter(i => candidates.some(c => c.v.id === i && !c.problem));
    const msg = [ids.length ? `Dispatched ${ids.length} unit${ids.length === 1 ? '' : 's'}` : '', selFollow.length ? `${selFollow.length} will follow up` : ''].filter(Boolean).join(' · ');
    if (!act(() => { if (ids.length) game.dispatch(inc.id, ids); if (selFollow.length) game.queueFollowUp(inc.id, selFollow); }, msg)) return;
    setSel(new Set());
    if (andNext) {
      const next = [...game.city.incidents].filter(i => i.id !== inc.id && i.status === 'pending').sort((a, b) => a.createdAt - b.createdAt)[0];
      back();
      if (next) push({ kind: 'incident', id: next.id });
    }
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
          {!closed && <span>{timerText(game, inc)}</span>}
          {closed ? <span className={inc.payout < 0 ? 'bad' : 'ok'}>{money(inc.payout)}</span> : <span>Reward {money(inc.reward)} · {inc.xp} XP</span>}
          {inc.escalated && <span className="bad">Escalated</span>}
          {inc.patients > 0 && <span>🚑 {inc.patients} patient{inc.patients > 1 ? 's' : ''} to transport</span>}
          {inc.prisoners > 0 && <span>🚓 {inc.prisoners} suspect{inc.prisoners > 1 ? 's' : ''} to jail</span>}
        </div>
        {inc.parentId && game.incident(inc.parentId) && (
          <button className="linkish parent-link" onClick={() => push({ kind: 'incident', id: inc.parentId! })}>Part of major event: {game.incident(inc.parentId)!.name} ›</button>
        )}
      </div>

      {!closed && inc.status === 'working' && (
        <div className="progress big"><span style={{ width: `${workPct(game, inc)}%` }} /></div>
      )}
      {!closed && inc.status !== 'working' && missingAll.length > 0 && (
        <div className="missing" data-testid="missing">Missing: {missingAll.map(m => `${m.count}× ${capability(m.cap).name}`).join(', ')}</div>
      )}

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
                    <span className="row-status"><StatusCode status={v.status} />{eta != null && <span className="eta">{dur(eta)}</span>}</span>
                    {!closed && <button className="mini" onClick={() => act(() => game.recall(v.id))}>Release</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {!closed && queued.length > 0 && (
        <Section title="Following up">
          <div className="list">
            {queued.map(v => (
              <div key={v.id} className="row compact" data-testid="queued-followup">
                <Dot color={dept(vehicleType(v.typeId).dept).color} />
                <div className="grow"><div className="row-title">{v.name}</div><div className="row-sub">Coming after its current call</div></div>
                <button className="mini" onClick={() => act(() => game.cancelFollowUp(v.id))}>Cancel</button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {!closed && inc.status !== 'working' && (
        <Section title="Dispatch units" right={<button className="mini" onClick={() => setSel(new Set(rec.ids))} data-testid="select-recommended">Select recommended</button>}>
          {rec.unfilled.length > 0 && (
            <div className="warnbox">No available unit for: {rec.unfilled.map(u => `${u.count}× ${capability(u.cap).name}`).join(', ')}</div>
          )}
          {!candidates.length && <Empty>No units at stations. Buy vehicles in Stations.</Empty>}
          {quick.length > 0 && (
            <div className="aao" data-testid="aao">
              {quick.map(q => (
                <button key={q.cap} className={`aao-btn ${q.needed ? 'needed' : ''}`} disabled={!q.next} onClick={() => q.next && addVehicle(q.next)}>
                  + {capability(q.cap).name} <span className="muted">{q.left}</span>
                </button>
              ))}
            </div>
          )}
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
                    <div className="row-sub"><StatusCode status={v.status} label={false} /> {problem || `${t.name} · ${game.station(v.stationId)?.name ?? ''}`}</div>
                  </div>
                  <div className="row-right"><span className="eta">~{dur(eta)}</span><span className="muted small">{(distanceM(v.pos, inc.pos) * (t.air ? 1 : 1.35) / 1609).toFixed(1)} mi</span></div>
                </label>
              );
            })}
          </div>
          {followCands.length > 0 && (
            <>
              <div className="subhead">Follow up — busy units go here straight after their current call</div>
              <div className="list">
                {followCands.map(({ v, d }) => {
                  const t = vehicleType(v.typeId);
                  const cur = v.incidentId ? game.incident(v.incidentId) : null;
                  return (
                    <label key={v.id} className="row compact pick" data-testid="followup-candidate">
                      <input type="checkbox" checked={sel.has(v.id)} onChange={() => toggle(v)} />
                      <Dot color={dept(t.dept).color} />
                      <div className="grow">
                        <div className="row-title">{v.name}{t.caps.some(cp => missingAll.some(m => m.cap === cp)) && <span className="tag ok">Needed</span>}</div>
                        <div className="row-sub"><StatusCode status={v.status} label={false} /> {cur ? `At ${cur.name}` : v.cargo ? `Transporting to ${v.cargo.destName}` : t.name}</div>
                      </div>
                      <div className="row-right"><span className="muted small">{(d * 1.35 / 1609).toFixed(1)} mi</span></div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
          <div className="actions sticky">
            <Btn kind="primary" onClick={() => dispatch(false)} disabled={!selCount} testid="dispatch-btn">Dispatch</Btn>
            <Btn onClick={() => dispatch(true)} disabled={!selCount} testid="dispatch-next">Dispatch & next</Btn>
          </div>
        </Section>
      )}
      {!closed && (
        <div className="actions"><Btn kind="ghost" small onClick={() => act(() => game.abandon(inc.id), 'Call closed as failed')}>Abandon call</Btn></div>
      )}
    </div>
  );
}
