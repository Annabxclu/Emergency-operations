import { specialty } from '../../data/hospitals';
import { STAFF_TRAININGS } from '../../data/staffRequirements';
import { useEffect, useState } from 'react';
import { missingRequirements } from '../../engine/game';
import { distanceM } from '../../engine/geo';
import type { Incident, Vehicle } from '../../engine/types';
import { useWide } from '../Windows';
import { DEPARTMENTS, capability, dept, vehicleType } from '../../data/departments';
import { CATEGORY_DEPT } from '../../data/incidents';
import { Btn, Chip, Dot, Empty, Header, Section, StatusCode, useCtx } from '../common';
import { INCIDENT_STATUS, OUTCOME, SEVERITY, dur, money } from '../format';
import { glyph } from '../icons';

function IncIcon({ inc }: { inc: Incident }) {
  return <span className={`inc-ico st-${useCtx().game.shownStatus(inc)}${inc.severity >= 3 ? ' major' : ''}`} dangerouslySetInnerHTML={{ __html: glyph(inc.category, 15) }} />;
}

/** Treatment still to do across all patients (100 = nobody treated yet). */
function patientLeftPct(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  const list = inc.patientList ?? [];
  const total = list.reduce((n, p) => n + p.treatSec, 0);
  if (!total) return 0;
  const now = game.state.time;
  const left = list.reduce((n, p) => n + (p.status === 'untreated' ? p.treatSec : p.status === 'treating' ? Math.max(0, (p.until ?? now) - now) : 0), 0);
  return (left / total) * 100;
}

function workPct(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  if (inc.workRemaining != null && inc.status !== 'working') {
    const total = inc.workRemaining + (inc.workDone ?? 0);
    return total > 0 ? ((inc.workDone ?? 0) / total) * 100 : 0;
  }
  if (inc.status !== 'working' || inc.workUntil == null || inc.workStartedAt == null) return 0;
  return Math.min(100, Math.max(0, ((game.state.time - inc.workStartedAt) / (inc.workUntil - inc.workStartedAt)) * 100));
}

export function timerText(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  const now = game.state.time;
  const waiting = game.untreated(inc);
  if (inc.status === 'working' && waiting > 0 && (inc.workUntil ?? 0) <= now) return `Waiting for ambulance · ${waiting} patient${waiting > 1 ? 's' : ''}`;
  if (inc.status === 'working') return `Working · ${dur((inc.workUntil ?? now) - now)} left${waiting ? ` · ${waiting} patient${waiting > 1 ? 's' : ''} waiting` : ''}`;
  if (inc.workRemaining != null) return `Paused · ${dur(inc.workRemaining)} left`;
  return `Received ${receivedText(game, inc)}`;
}

/** Date and time the call came in, e.g. "Nov 18, 7:12 AM". */
export function receivedText(game: ReturnType<typeof useCtx>['game'], inc: Incident) {
  const at = inc.receivedAt ?? Date.now() - (game.state.time - inc.createdAt) * 1000;
  return new Date(at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const SORTS = [
  { id: 'oldest', label: 'Oldest', cmp: (a: Incident, b: Incident) => a.createdAt - b.createdAt },
  { id: 'newest', label: 'Newest', cmp: (a: Incident, b: Incident) => b.createdAt - a.createdAt },
  { id: 'max', label: 'Most credits', cmp: (a: Incident, b: Incident) => b.reward - a.reward },
  { id: 'min', label: 'Fewest credits', cmp: (a: Incident, b: Incident) => a.reward - b.reward },
];
const VIEWS = [
  { id: 'all', label: 'All', test: (_s: string, _i: Incident) => true },
  { id: 'enroute', label: '🚨 En route', test: (st: string) => st === 'responding' || st === 'followup' },
  { id: 'missing', label: '⚠️ Missing', test: (st: string, i: Incident) => st === 'onscene' || (st === 'pending' && i.workRemaining != null) },
];
let lastSort = 'oldest'; // remembered while the app is open
let lastView = 'all';

/** Patient names with their treatment countdown, shown on the call list. */
function RowPatients({ inc, now }: { inc: Incident; now: number }) {
  const list = inc.patientList ?? [];
  const shown = list.slice(0, 6);
  return (
    <div className="row-patients" data-testid="row-patients">
      {shown.map(p => (
        <span key={p.id} className={`rp ${p.status}`}>
          {p.name}{' '}
          <b>{p.status === 'treating' ? dur(Math.max(0, (p.until ?? now) - now)) : p.status === 'untreated' ? 'waiting' : p.status === 'transport' ? 'hospital' : 'released'}</b>
        </span>
      ))}
      {list.length > shown.length && <span className="rp more">+{list.length - shown.length} more</span>}
    </div>
  );
}

export function DispatchList() {
  const { game, push } = useCtx();
  const c = game.city;
  const [sort, setSortState] = useState(lastSort);
  const setSort = (v: string) => { lastSort = v; setSortState(v); };
  const [view, setViewState] = useState(lastView);
  const setView = (v: string) => { lastView = v; setViewState(v); };
  const all = [...c.incidents].sort(SORTS.find(x => x.id === sort)!.cmp);
  const count = (id: string) => all.filter(i => VIEWS.find(v => v.id === id)!.test(game.shownStatus(i), i)).length;
  const active = all.filter(i => VIEWS.find(v => v.id === view)!.test(game.shownStatus(i), i));
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Dispatch</div>
        <div className="sub">{active.length}/{game.activeCap()} active · new call every {(game.state.settings.callIntervalMin ?? 3) < 1 ? `${(game.state.settings.callIntervalMin ?? 3) * 60} sec` : `${game.state.settings.callIntervalMin ?? 3} min`}</div></div></div>
      {!game.setupDone && <Empty>Place your three starter stations to begin receiving calls.</Empty>}
      {game.setupDone && !active.length && <Empty>No active calls. New calls will appear here and on the map.</Empty>}
      {all.length > 0 && (
        <div className="list-tools">
          <div className="seg views" data-testid="dispatch-views">
            {VIEWS.map(o => <button key={o.id} className={view === o.id ? 'on' : ''} onClick={() => setView(o.id)} data-testid={`view-${o.id}`}>{o.label} <b>{count(o.id)}</b></button>)}
          </div>
          <select className="sort-select" value={sort} onChange={(e: any) => setSort(e.target.value)} data-testid="dispatch-sort" aria-label="Sort calls">
            {SORTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      )}
      {all.length > 0 && !active.length && <Empty>No calls in this view.</Empty>}
      <div className="list">
        {active.map(inc => {
          const st = INCIDENT_STATUS[game.shownStatus(inc)];
          return (
            <button key={inc.id} className={`row mission-row st-${game.shownStatus(inc)}`} onClick={() => push({ kind: 'incident', id: inc.id })} data-testid="incident-row">
              <IncIcon inc={inc} />
              <div className="grow">
                <div className="row-title">{inc.name}{inc.escalated && <span className="tag bad">Escalated</span>}{inc.expandedFrom && <span className="tag warn">Expanded</span>}</div>
                <div className="row-sub">{inc.address} · {inc.district}</div>
                {inc.patientList && inc.patientList.length > 0 && <RowPatients inc={inc} now={game.state.time} />}
                {(inc.status === 'working' || inc.workRemaining != null) && (
                  <div className="bar-row"><span className="bar-label">Crew</span><div className={`progress ${inc.status !== 'working' ? 'paused' : ''}`}><span style={{ width: `${100 - workPct(game, inc)}%` }} /></div></div>)}
                {inc.patientList && inc.patientList.length > 0 && (
                  <div className="bar-row"><span className="bar-label">Patients</span><div className={`progress patients ${inc.patientList.some(p => p.status === 'treating') ? 'treating' : ''}`} data-testid="row-patient-bar"><span style={{ width: `${patientLeftPct(game, inc)}%` }} /></div></div>)}
              </div>
              <div className="row-right">
                <Chip tone={st.tone}>{st.label}</Chip>
                <div className="row-credits" data-testid="row-credits">{inc.reward ? money(inc.reward) : 'Paid at hospital'}</div>
                <div className="timer">{timerText(game, inc)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function IncidentDetail({ id }: { id: string }) {
  const { game, act, push, back, focus } = useCtx();
  const inc = game.incident(id);
  const [sel, setSel] = useState(() => new Set<string>());
  const [unitTab, setUnitTab] = useState('all');
  const [hidePatients, setHidePatients] = useState(false);

  // Phones jump the map to the call; on iPad the map stays put (tap the address to go there).
  const wide = useWide();
  useEffect(() => { if (inc && !wide) focus(inc.pos, 15); }, [id]);
  // Pre-select recommended units until the player changes the selection.
  const rec = inc ? game.recommend(inc.id) : { ids: [], unfilled: [] };

  if (!inc) return <div><Header title="Call not found" /></div>;
  const closed = inc.status === 'resolved';
  const attached = game.incidentVehicles(inc.id);
  const responding = attached.filter(v => v.status !== 'onscene');
  const onScene = attached.filter(v => v.status === 'onscene');
  const missingOnScene = missingRequirements(inc.requirements, onScene);
  const staffOnSceneMissing = game.missingStaff(inc, onScene);
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
    .sort((a, b) => (a.problem ? 1 : 0) - (b.problem ? 1 : 0) || a.eta - b.eta); // every unit, no distance limit

  const toggle = (v: Vehicle) => {
    const n = new Set(sel);
    if (n.has(v.id)) n.delete(v.id); else n.add(v.id);
    setSel(n);
  };
  const followCands = game.followUpCandidates(inc.id)
    .map(v => ({ v, d: distanceM(v.pos, inc.pos) }))
    .sort((a, b) => a.d - b.d);
  const queued = game.followUpsFor(inc.id);
  const selFollow = [...sel].filter(i => followCands.some(c => c.v.id === i));
  const allUnits = [...candidates.map(c => c.v), ...followCands.map(c => c.v)];
  const tabDepts = DEPARTMENTS.filter(d => allUnits.some(v => vehicleType(v.typeId).dept === d.id));
  const inTab = (v: Vehicle) => unitTab === 'all' || vehicleType(v.typeId).dept === unitTab;
  const selByDept: Record<string, number> = {};
  for (const v of allUnits) if (sel.has(v.id)) { const d = vehicleType(v.typeId).dept; selByDept[d] = (selByDept[d] || 0) + 1; }
  const selCount = [...sel].filter(i => candidates.some(c => c.v.id === i && !c.problem)).length + selFollow.length;
  const addVehicle = (v: Vehicle) => { setSel(new Set([...sel, v.id])); };
  // Quick buttons: add the nearest available unit of a type.
  const capsInFleet = [...new Set(candidates.filter(c => !c.problem).flatMap(c => vehicleType(c.v.typeId).caps))];
  const quick = capsInFleet.map(cap => {
    const pool = candidates.filter(c => !c.problem && vehicleType(c.v.typeId).caps.includes(cap));
    const next = pool.find(c => !sel.has(c.v.id))?.v ?? null;
    return { cap, next, left: pool.filter(c => !sel.has(c.v.id)).length, needed: missingAll.some(m => m.cap === cap) || (cap === 'ambulance' && game.patientAmbulanceNeed(inc) > 0) };
  }).sort((a, b) => Number(b.needed) - Number(a.needed));
  const quickShown = quick.filter(q => unitTab === 'all' || capability(q.cap).dept === unitTab);
  const dispatch = (andNext: boolean) => {
    const ids = [...sel].filter(i => candidates.some(c => c.v.id === i && !c.problem));
    const msg = [ids.length ? `Dispatched ${ids.length} unit${ids.length === 1 ? '' : 's'}` : '', selFollow.length ? `${selFollow.length} will follow up` : ''].filter(Boolean).join(' · ');
    if (!act(() => { if (ids.length) game.dispatch(inc.id, ids); if (selFollow.length) game.queueFollowUp(inc.id, selFollow); }, msg)) return;
    setSel(new Set());
    if (andNext) {
      const next = [...game.city.incidents].filter(i => i.id !== inc.id && game.shownStatus(i) === 'pending').sort((a, b) => a.createdAt - b.createdAt)[0];
      back();
      if (next) push({ kind: 'incident', id: next.id });
    }
  };
  const deptColor = dept(CATEGORY_DEPT[inc.category]).color;

  return (
    <div>
      <Header title={<><span className="inc-title-dot" style={{ background: deptColor }} />{inc.name}</>}
        sub={<span className="sub-row">{inc.number} · {SEVERITY[inc.severity]} {!closed ? <Chip tone={INCIDENT_STATUS[game.shownStatus(inc)].tone}>{INCIDENT_STATUS[game.shownStatus(inc)].label}</Chip> : <Chip tone={OUTCOME[inc.outcome!].tone}>{OUTCOME[inc.outcome!].label}</Chip>}</span>} />
      <div className="inc-info">
        <div className="addr" onClick={() => focus(inc.pos, 16)} title="Show on map" data-testid="incident-address"><span className="addr-pin">📍</span>{inc.address}<span className="muted"> · {inc.district}</span></div>
        <p className="desc">{inc.description}</p>
        {inc.expandedFrom && <p className="expanded-note" data-testid="expanded-from">↗ Expanded from {inc.expandedFrom}</p>}
        <div className="kv">
          {!closed && <span>{timerText(game, inc)}</span>}
          {closed ? <span className={inc.payout < 0 ? 'bad' : 'ok'}>{money(inc.payout)}</span> : <span>{inc.reward ? `Reward ${money(inc.reward)}` : 'No reward · your hospital earns per patient'}</span>}
          {inc.escalated && <span className="bad">Escalated</span>}
          {inc.patients > 0 && !inc.patientList && <span>🚑 {inc.patients} patient{inc.patients > 1 ? 's' : ''} to transport{inc.specialty ? ` · needs ${specialty(inc.specialty).name} (${money(specialty(inc.specialty).fee)} each at your hospital)` : ''}</span>}
          {inc.prisoners > 0 && <span>🚓 {inc.prisoners} suspect{inc.prisoners > 1 ? 's' : ''} to jail</span>}
        </div>
        {inc.parentId && game.incident(inc.parentId) && (
          <button className="linkish parent-link" onClick={() => push({ kind: 'incident', id: inc.parentId! })}>Part of major event: {game.incident(inc.parentId)!.name} ›</button>
        )}
      </div>

      {inc.patientList && inc.patientList.length > 0 && (() => {
        const list = inc.patientList;
        const now = game.state.time;
        const left = game.untreated(inc);
        return (
          <section className="patients" data-testid="patients">
            <div className="patients-head">
              <b>{list.length} Patient{list.length > 1 ? 's' : ''}</b>
              <span className={left ? 'bad' : 'ok'}> – {left} untreated</span>
              {inc.specialty && <span className="muted small" style={{ flexBasis: "100%" }}>Needs {specialty(inc.specialty).name} ({money(specialty(inc.specialty).fee)} each at your hospital)</span>}
              <button className="mini" onClick={() => setHidePatients(!hidePatients)}>{hidePatients ? 'Show' : 'Hide'}</button>
            </div>
            {!hidePatients && (
              <div className="patient-grid">
                {list.map(p => {
                  const pct = p.status === 'untreated' ? 100 : p.status === 'treating' ? Math.max(0, Math.min(100, ((p.until ?? now) - now) / p.treatSec * 100)) : 0;
                  const label = p.status === 'treating' ? 'Treating' : p.status === 'transport' ? 'To hospital' : p.status === 'released' ? 'Released' : 'Untreated';
                  const timer = p.status === 'treating' ? `${dur(Math.max(0, (p.until ?? now) - now))} left` : p.status === 'untreated' ? `${dur(p.treatSec)} to treat` : '';
                  return (
                    <div key={p.id} className={`patient ${p.status}`} data-testid="patient-card" data-status={p.status}>
                      <div className="pname">{p.name}</div>
                      <div className="pbar"><span style={{ width: `${pct}%` }} /></div>
                      <div className="pstate" data-testid="patient-state">{label}</div>
                      {timer && <div className="ptime">{timer}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })()}

      {!closed && inc.status === 'working' && (
        <div className="progress big"><span style={{ width: `${100 - workPct(game, inc)}%` }} /></div>
      )}
      {!closed && inc.status !== 'working' && inc.workRemaining != null && (
        <>
          <div className="progress big paused"><span style={{ width: `${100 - workPct(game, inc)}%` }} /></div>
          <div className="warnbox" style={{ marginTop: 8 }}>Work paused — a required unit left the scene. It resumes where it stopped once all required units are back.</div>
        </>
      )}

      {/* While units are still missing, the missing-units table below shows this instead. */}
      {!(!closed && inc.status !== 'working' && (missingOnScene.length > 0 || game.untreated(inc) > 0)) && reqRows.length > 0 && <Section title="Required">
        <div className="reqs">
          {reqRows.map(r => (
            <div key={r.cap} className={`req ${r.onScene >= r.count ? 'met' : r.short > 0 ? 'short' : 'coming'}`}>
              <span className="n">{r.onScene}/{r.count}</span>
              <span className="grow">{capability(r.cap).name}</span>
              {r.coming > 0 && <span className="muted">{r.coming} en route</span>}
            </div>
          ))}
        </div>
      </Section>}

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

      {!closed && (inc.status !== 'working' || game.untreated(inc) > 0) && (
        <Section title="Dispatch units">
          {(missingOnScene.length > 0 || staffOnSceneMissing.length > 0 || game.untreated(inc) > 0) && (() => {
            const selDirect = candidates.filter(c => sel.has(c.v.id)).map(c => c.v);
            const selFollowV = followCands.filter(c => sel.has(c.v.id)).map(c => c.v);
            const base = game.responding(inc);
            const afterSel = missingRequirements(inc.requirements, [...base, ...selDirect]);
            const afterFollow = missingRequirements(inc.requirements, [...base, ...selDirect, ...selFollowV, ...queued]);
            const rows = missingOnScene.map(m => {
              const miss = m.count;
              const a = missingAll.find(x => x.cap === m.cap)?.count ?? 0;
              const b = afterSel.find(x => x.cap === m.cap)?.count ?? 0;
              const still = afterFollow.find(x => x.cap === m.cap)?.count ?? 0;
              // Count every selected / follow-up unit of this type, so picking too many shows a minus number.
              const units = (vs: typeof selDirect) => vs.reduce((n, v) => n + (vehicleType(v.typeId).caps.includes(m.cap) ? (vehicleType(v.typeId).capCount?.[m.cap] ?? 1) : 0), 0);
              const enroute = miss - a;
              const selected = Math.max(a - b, units(selDirect));
              const follow = Math.max(b - still, units([...selFollowV, ...queued]));
              const extra = enroute + selected + follow - miss;
              return { cap: m.cap, miss, enroute, selected, follow, still: still > 0 ? still : -Math.max(0, extra) };
            });
            // Trained personnel the call needs (counted from the crews riding on the units)
            const enrouteV = base.filter(v => v.status !== 'onscene');
            const staffRows = staffOnSceneMissing.map(m => {
              const miss = m.count;
              const enroute = Math.min(miss, game.staffOn(m.training, enrouteV));
              const selected = Math.min(miss - enroute, game.staffOn(m.training, selDirect));
              const follow = Math.min(miss - enroute - selected, game.staffOn(m.training, [...selFollowV, ...queued]));
              return { key: m.training, name: `${STAFF_TRAININGS[m.training]?.name ?? m.training} trained staff`, miss, enroute, selected, follow, still: miss - enroute - selected - follow };
            });
            // Ambulances for untreated patients: one free ambulance takes one patient at a time.
            const untreated = game.untreated(inc);
            if (untreated > 0) {
              const busy = new Set((inc.patientList ?? []).filter(p => p.status === 'treating').map(p => p.vehicleId));
              const free = (vs: Vehicle[]) => vs.filter(v => game.isMedic(v) && !busy.has(v.id) && (v.patientLoad ?? 0) === 0).length;
              const miss = Math.max(0, untreated - free(base.filter(v => v.status === 'onscene')));
              const enroute = free(enrouteV);
              const selected = free(selDirect);
              const follow = free([...selFollowV, ...queued]);
              if (miss > 0) rows.unshift({ cap: 'patients', miss, enroute, selected, follow, still: miss - enroute - selected - follow });
            }
            const anyFollow = rows.some(r => r.follow > 0) || staffRows.some(r => r.follow > 0) || selFollowV.length > 0 || queued.length > 0;
            const allCovered = rows.every(r => r.still <= 0) && staffRows.every(r => r.still === 0);
            const tone = allCovered && !anyFollow ? 'covered' : anyFollow ? 'follow' : '';
            return (
              <div className={`missing-table ${tone}`} data-testid="missing">
                <table>
                  <thead><tr><th>Missing</th><th>On mission</th><th>En route</th><th>Selected</th><th>Follow-up</th><th>Still needed</th></tr></thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.cap} className={r.still < 0 ? 'done over' : r.still === 0 ? 'done' : ''}>
                        <td>{r.cap === 'patients' ? 'Ambulance (untreated patients)' : capability(r.cap).name}</td><td>{r.miss}</td><td>{r.enroute}</td><td>{r.selected}</td><td>{r.follow}</td><td className="still">{r.still}</td>
                      </tr>
                    ))}
                    {staffRows.map(r => (
                      <tr key={r.key} className={`staff ${r.still === 0 ? 'done' : ''}`}>
                        <td>{r.name}</td><td>{r.miss}</td><td>{r.enroute}</td><td>{r.selected}</td><td>{r.follow}</td><td className="still">{r.still}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
          {rec.unfilled.length > 0 && (
            <div className="warnbox">No available unit for: {rec.unfilled.map(u => `${u.count}× ${capability(u.cap).name}`).join(', ')}</div>
          )}
          {!candidates.length && <Empty>No units at stations. Buy vehicles in Stations.</Empty>}
          {tabDepts.length > 1 && (
            <div className="seg tabs" data-testid="dispatch-tabs">
              <button className={unitTab === 'all' ? 'on' : ''} onClick={() => setUnitTab('all')}>All</button>
              {tabDepts.map(d => (
                <button key={d.id} className={unitTab === d.id ? 'on' : ''} onClick={() => setUnitTab(d.id)} data-testid={`dispatch-tab-${d.id}`}>
                  <span className="dot" style={{ background: d.color }} /> {d.short}
                  {selByDept[d.id] ? <span className="cnt sel">{selByDept[d.id]}</span> : null}
                </button>
              ))}
            </div>
          )}
          <div className="list">
            {candidates.filter(c => inTab(c.v)).map(({ v, eta, problem }) => {
              const t = vehicleType(v.typeId);
              return (
                <label key={v.id} className={`row compact pick ${problem ? 'disabled' : ''}`} data-testid="dispatch-candidate">
                  <input type="checkbox" disabled={!!problem} checked={sel.has(v.id) && !problem} onChange={() => toggle(v)} />
                  <Dot color={dept(t.dept).color} />
                  <div className="grow">
                    <div className="row-title">{v.name}</div>
                    <div className="row-sub"><StatusCode status={v.status} label={false} /> {problem || `${t.name} · ${game.station(v.stationId)?.name ?? ''}`}</div>
                  </div>
                  <div className="row-right"><span className="eta">~{dur(eta)}</span><span className="muted small">{(distanceM(v.pos, inc.pos) * (t.air ? 1 : 1.35) / 1609).toFixed(1)} mi</span></div>
                </label>
              );
            })}
          </div>
          {followCands.length > 0 && (
            <>
              {followCands.some(c => inTab(c.v)) && <div className="subhead">Follow up — busy units go here straight after their current call</div>}
              <div className="list">
                {followCands.filter(c => inTab(c.v)).map(({ v, d }) => {
                  const t = vehicleType(v.typeId);
                  const cur = v.incidentId ? game.incident(v.incidentId) : null;
                  return (
                    <label key={v.id} className="row compact pick" data-testid="followup-candidate">
                      <input type="checkbox" checked={sel.has(v.id)} onChange={() => toggle(v)} />
                      <Dot color={dept(t.dept).color} />
                      <div className="grow">
                        <div className="row-title">{v.name}</div>
                        <div className="row-sub"><StatusCode status={v.status} label={false} /> {cur ? `At ${cur.name}` : v.cargo ? `Transporting to ${v.cargo.destName}` : t.name}</div>
                      </div>
                      <div className="row-right"><span className="muted small">{(d * 1.35 / 1609).toFixed(1)} mi</span></div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
          <div className="dispatch-footer">
          {quickShown.length > 0 && (
            <div className="aao" data-testid="aao">
              {quickShown.map(q => (
                <button key={q.cap} className={`aao-btn ${q.needed ? 'needed' : ''}`} disabled={!q.next} onClick={() => q.next && addVehicle(q.next)}>
                  + {capability(q.cap).name} <span className="muted">{q.left}</span>
                </button>
              ))}
            </div>
          )}
            <div className="actions">
              <Btn kind="primary" onClick={() => dispatch(false)} disabled={!selCount} testid="dispatch-btn">Dispatch</Btn>
              <Btn onClick={() => dispatch(true)} disabled={!selCount} testid="dispatch-next">Dispatch & next</Btn>
            </div>
          </div>
        </Section>
      )}
      {!closed && (
        <div className="actions"><Btn kind="ghost" small onClick={() => act(() => game.abandon(inc.id), 'Call closed as failed')}>Abandon call</Btn></div>
      )}
    </div>
  );
}
