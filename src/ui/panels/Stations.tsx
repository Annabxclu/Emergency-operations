import { useEffect, useState } from 'react';
import { HOSPITAL, SPECIALTIES, specialty } from '../../data/hospitals';
import { ACADEMIES, DEPARTMENTS, STATION_TYPES, VEHICLE_TYPES, capability, dept, qualification, stationType, vehicleType } from '../../data/departments';
import { Btn, Group, Chip, Dot, Empty, Header, Section, Stat, StatusCode, useCtx } from '../common';
import { extensionsFor } from '../../data/progression';
import { mi, money } from '../format';
import { glyph } from '../icons';

let rememberedTab = 'all'; // keeps the chosen tab when you open a station and come back

export function StationsList() {
  const { game, push, startBuild } = useCtx();
  const c = game.city;
  const depts = DEPARTMENTS.filter(d => c.stations.some(s => s.dept === d.id));
  const [tab, setTabState] = useState(depts.some(d => d.id === rememberedTab) ? rememberedTab : 'all');
  const setTab = (t: string) => { rememberedTab = t; setTabState(t); };
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Stations</div><div className="sub">{c.stations.length} buildings · {c.vehicles.length} vehicles</div></div>
        {game.setupDone && <Btn kind="primary" small onClick={() => push({ kind: 'build' })} testid="build-open">+ Build</Btn>}</div>
      {!c.stations.length && <Empty>No stations yet.</Empty>}
      {depts.length > 0 && (
        <div className="seg tabs" data-testid="station-tabs">
          <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>All <span className="cnt">{c.stations.length}</span></button>
          {depts.map(d => (
            <button key={d.id} className={tab === d.id ? 'on' : ''} onClick={() => setTab(d.id)} data-testid={`station-tab-${d.id}`}>
              <span className="dot" style={{ background: d.color }} /> {d.short} <span className="cnt">{c.stations.filter(s => s.dept === d.id).length}</span>
            </button>
          ))}
        </div>
      )}
      {DEPARTMENTS.filter(d => tab === 'all' || d.id === tab).map(d => {
        const list = c.stations.filter(s => s.dept === d.id);
        if (!list.length) return null;
        return (
          <Section key={d.id} title={<><Dot color={d.color} /> {d.name}</>}>
            <div className="list">
              {list.map(s => {
                const cap = game.stationCapacity(s);
                const vs = game.stationVehicles(s.id);
                const ready = vs.filter(v => v.status === 'available' && !game.dispatchProblem(v)).length;
                return (
                  <button key={s.id} className="row" onClick={() => push({ kind: 'station', id: s.id })} data-testid="station-row">
                    <span className="st-ico" style={{ background: d.color }} dangerouslySetInnerHTML={{ __html: glyph(d.id, 15) }} />
                    <div className="grow"><div className="row-title">{s.name}</div>
                      <div className="row-sub">Level {s.level} · {vs.length}/{cap.bays} vehicles · {game.stationStaff(s.id).length}/{cap.staff} staff</div></div>
                    <div className="row-right"><Chip tone={ready ? 'ok' : 'muted'}>{ready} ready</Chip></div>
                  </button>
                );
              })}
            </div>
          </Section>
        );
      })}
      {game.setupDone && (tab === 'all' || tab === 'ems') && (
        <Section title="Hospitals" right={<Btn small onClick={() => startBuild('hospital')} disabled={game.city.money < HOSPITAL.cost} testid="build-hospital">Build · {money(HOSPITAL.cost)}</Btn>}>
          {!(game.city.hospitals ?? []).length && <p className="hint">You don't own a hospital yet, so ambulances use the public hospital. Your own hospitals take patients nearby, earn {money(HOSPITAL.admissionFee)}–{money(Math.max(...SPECIALTIES.map(x => x.fee)))} per patient, and can add specialist care.</p>}
          <div className="list">
            {(game.city.hospitals ?? []).map(h => (
              <button key={h.id} className="row" onClick={() => push({ kind: 'hospital', id: h.id })} data-testid="hospital-row">
                <span className="st-ico" style={{ background: '#e02424' }} dangerouslySetInnerHTML={{ __html: glyph('hospital', 15) }} />
                <div className="grow"><div className="row-title">{h.name}</div>
                  <div className="row-sub">{game.hospitalFreeBeds(h)}/{game.hospitalBeds(h)} beds free · {h.specialties.length ? h.specialties.map(x => specialty(x).name).join(', ') : 'no specialties'}</div></div>
                <span className="muted">›</span>
              </button>
            ))}
          </div>
        </Section>
      )}
      {game.setupDone && (tab === 'all' || ACADEMIES[tab]) && (
        <Section title="Academies">
          <div className="list">
            {Object.entries(ACADEMIES).filter(([d]) => tab === 'all' || d === tab).map(([d, a]) => {
              const built = game.academyOf(d);
              return (
                <button key={d} className="row" onClick={() => push({ kind: 'academy', dept: d })} data-testid={`academy-${d}`}>
                  <span className="st-ico" style={{ background: dept(d).color }} dangerouslySetInnerHTML={{ __html: glyph(d, 15) }} />
                  <div className="grow"><div className="row-title">{a.name}</div>
                    <div className="row-sub">{built ? `${1 + built.classrooms} classroom${built.classrooms ? 's' : ''} · ${game.inTraining(d)}/${game.academySeats(d)} in training` : `Not built · ${money(a.cost)} · needed to train ${dept(d).short.toLowerCase()} staff`}</div></div>
                  <span className="muted">›</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

export function BuildChooser() {
  const { game, startBuild } = useCtx();
  return (
    <div>
      <Header title="Build a station" sub={`Balance ${money(game.city.money)}`} />
      <div className="list">
        {STATION_TYPES.map(t => {
          const d = dept(t.dept);
          const need = game.needStations(game.deptRequirement(d.id));
          const price = game.stationPrice(t.id);
          return (
            <button key={t.id} className="row" disabled={!!need || game.city.money < price} onClick={() => startBuild(t.id)} data-testid={`build-${t.id}`}>
              <span className="st-ico" style={{ background: d.color }} dangerouslySetInnerHTML={{ __html: glyph(d.id, 15) }} />
              <div className="grow"><div className="row-title">{t.name}</div>
                <div className="row-sub wrap">1 bay, expandable to {t.maxLevel + 1}{t.small ? ' · no extensions · can convert to full later' : ''} · {mi(t.coverageKm)} coverage</div></div>
              <div className="row-right"><div className="amt">{need ?? money(price)}</div></div>
            </button>
          );
        })}
      </div>
      <div className="list" style={{ marginTop: 8 }}>
        <button className="row" disabled={game.city.money < HOSPITAL.cost} onClick={() => startBuild('hospital')} data-testid="build-hospital-chooser">
          <span className="st-ico" style={{ background: '#e02424' }} dangerouslySetInnerHTML={{ __html: glyph('hospital', 15) }} />
          <div className="grow"><div className="row-title">Hospital</div><div className="row-sub wrap">{HOSPITAL.baseBeds} beds, up to {HOSPITAL.baseBeds + HOSPITAL.maxExtraBeds} · add specialist care</div></div>
          <div className="row-right"><div className="amt">{money(HOSPITAL.cost)}</div></div>
        </button>
      </div>
      <p className="hint">After choosing, tap anywhere on the map to place it. Stations can go anywhere in the city.</p>
    </div>
  );
}

export function StationDetail({ id }: { id: string }) {
  const { game, act, push, focus } = useCtx();
  const s = game.station(id);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(s?.name ?? '');
  useEffect(() => { if (s) focus(s.pos, 15); }, [id]);
  if (!s) return <div><Header title="Station not found" /></div>;
  const t = stationType(s.typeId);
  const d = dept(s.dept);
  const cap = game.stationCapacity(s);
  const canLevel = s.level < t.maxLevel;
  const nextCost = canLevel ? game.levelCost(s.level + 1) : 0;
  const vehicles = game.stationVehicles(s.id);
  const staff = game.stationStaff(s.id);
  const freeStaff = staff.filter(e => !e.vehicleId).length;
  const upkeep = t.upkeepPerHour * (1 + s.level * 0.05);

  return (
    <div>
      <Header title={renaming ? (
        <form onSubmit={(e: Event) => { e.preventDefault(); game.renameStation(s.id, name); setRenaming(false); }}>
          <input className="inline-input" value={name} autoFocus onChange={(e: any) => setName(e.target.value)} onBlur={() => { game.renameStation(s.id, name); setRenaming(false); }} />
        </form>) : <span onClick={() => { setName(s.name); setRenaming(true); }}>{s.name} <span className="muted small">✎</span></span>}
        sub={`${t.name} · Level ${s.level}/${t.maxLevel}${s.address ? ` · ${s.address}` : ''}`} />
      <div className="stats">
        <Stat label="Vehicles" value={`${vehicles.length}/${cap.bays}`} />
        <Stat label="Staff" value={`${staff.length}/${cap.staff}`} />
        <Stat label="Unassigned" value={freeStaff} />
        <Stat label="Level" value={`${s.level}/${t.maxLevel}`} />
      </div>

      <Section title="Vehicles">
        {!vehicles.length && <Empty>No vehicles assigned.</Empty>}
        <div className="list">
          {vehicles.map(v => {
            const vt = VEHICLE_TYPES.find(x => x.id === v.typeId)!;
            const prob = v.status === 'available' ? game.staffingProblem(v) : null;
            return (
              <button key={v.id} className="row compact" onClick={() => push({ kind: 'vehicle', id: v.id })}>
                <span className="veh-badge" style={{ borderColor: d.color }}>{vt.short}</span>
                <div className="grow"><div className="row-title">{v.name}</div><div className="row-sub">{prob || `${vt.name} · crew ${game.crew(v.id).length}/${vt.maxCrew}`}</div></div>
                <div className="row-right">{prob ? <Chip tone="bad">Unstaffed</Chip> : <StatusCode status={v.status} />}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Manage">
      <Group id="st-buy" title="Buy vehicle" sub={`${vehicles.length}/${cap.bays} bays used · balance ${money(game.city.money)}`}>
        <div className="list">
          {VEHICLE_TYPES.filter(v => game.hostsDept(s, v.dept)).map(vt => {
            const need = game.needStations(game.deptItemRequirement(vt), vt.dept) || game.vehicleExtNeeded(s, vt);
            const locked = !!need;
            const full = vehicles.length >= cap.bays;
            const quals = vt.quals.map(q => `${q.count}× ${qualification(q.qual).name}`).join(', ');
            return (
              <div key={vt.id} className={`row compact ${locked ? 'disabled' : ''}`}>
                <span className="veh-badge" style={{ borderColor: dept(vt.dept).color }}>{vt.short}</span>
                <div className="grow"><div className="row-title">{vt.name}</div>
                  <div className="row-sub wrap">Counts as {vt.caps.map(c => `${vt.capCount?.[c] ? `${vt.capCount[c]}× ` : ''}${capability(c).name}`).join(' or ')}{vt.towedBy ? ` · Trailer, towed by ${vt.towedBy.map(id => vehicleType(id).name).join(', ')}` : ''}</div>
                  <div className="row-sub wrap">{vt.maxCrew === 0 ? 'No crew' : `Crew ${vt.minCrew === vt.maxCrew ? vt.maxCrew : `${vt.minCrew}–${vt.maxCrew}`}`} · {quals ? `Training: ${quals}` : 'No training needed'}{game.deptItemRequirement(vt) > 1 ? ` · Needed at ${game.deptItemRequirement(vt)} ${dept(vt.dept).short} stations` : ''}</div></div>
                <div className="row-right">
                  {locked ? <span className="muted small">{need}</span> :
                    <Btn small kind="primary" disabled={full || game.city.money < vt.price} testid={`buy-${vt.id}`}
                      onClick={() => act(() => game.buyVehicle(vt.id, s.id), `${vt.name} purchased`)}>{money(vt.price)}</Btn>}
                </div>
              </div>
            );
          })}
        </div>
        {vehicles.length >= cap.bays && <p className="hint">All bays are full. Buy another level under "Building & levels" for another bay.</p>}
      </Group>

      <Group id="st-personnel" title="Personnel" sub={`${staff.length}/${cap.staff} employees · ${freeStaff} unassigned`}>
        <RecruitControls stationId={s.id} />
        <div className="kv">
          <span>{staff.length} employees · {freeStaff} unassigned</span>
        </div>
        <StaffTransfer stationId={s.id} />
        <div className="actions">
          <Btn small onClick={() => act(() => game.autoStaff(s.id), 'Crews assigned')}>Auto-assign crews</Btn>
          <Btn small kind="ghost" onClick={() => push({ kind: 'personnel' })}>View personnel</Btn>
        </div>
      </Group>

      <Group id="st-ext" title="Extensions" sub={`${(s.extensions ?? []).length} built`}>
        {t.small && <p className="hint">Small stations can't have extensions. Convert it to a full station below to add them.</p>}
        <div className="list">
          {extensionsFor(s.typeId).map(ext => {
            const built = s.extensions?.includes(ext.id);
            const sameType = game.city.stations.filter(x => x.typeId === s.typeId);
            const limitHit = !!ext.perStations && sameType.filter(x => x.extensions?.includes(ext.id)).length >= Math.floor(sameType.length / ext.perStations);
            return (
              <div key={ext.id} className="row compact">
                <div className="grow"><div className="row-title">{ext.name}</div><div className="row-sub wrap">{ext.desc}</div></div>
                {built ? <Chip tone="ok">Built</Chip> : limitHit ? <span className="muted small">Needs {(ext.perStations ?? 1) * (sameType.filter(x => x.extensions?.includes(ext.id)).length + 1)} stations</span> :
                  <Btn small disabled={game.city.money < ext.cost} onClick={() => act(() => game.buildExtension(s.id, ext.id), `${ext.name} built`)}>{money(ext.cost)}</Btn>}
              </div>
            );
          })}
        </div>
      </Group>

      <Group id="st-building" title="Building & levels" sub={`Level ${s.level}/${t.maxLevel} · ${cap.bays} bays`}>
        <div className="kv">{game.state.settings.runningCosts !== false && <span>Upkeep {money(upkeep)}/h</span>}<span>City contract +{money(t.contractPerHour)}/h</span><span>Coverage {mi(t.coverageKm)}</span></div>
        <div className="level-bar"><span style={{ width: `${(s.level / t.maxLevel) * 100}%` }} /></div>
        <div className="kv"><span>Level {s.level} of {t.maxLevel}</span><span>{cap.bays} bays</span><span>{cap.staff} staff capacity</span></div>
        {canLevel ? (
          <div className="actions">
            <Btn kind="primary" small disabled={game.city.money < nextCost} testid="station-level-up" onClick={() => act(() => game.upgradeStation(s.id), `${s.name}: level ${s.level + 1} (+1 bay)`)}>
              Buy level {s.level + 1} (+1 bay) · {money(nextCost)}
            </Btn>
          </div>
        ) : <p className="hint">{t.small ? 'Small station is full size (6 bays).' : `Maximum level — ${t.maxLevel + 1} bays.`}</p>}
        {t.small && t.upgradeTo && (
          <div className="actions">
            <Btn small disabled={game.city.money < t.cost} onClick={() => act(() => game.convertSmallStation(s.id), `${s.name} is now a full station`)}>
              Convert to full {stationType(t.upgradeTo).name} · {money(t.cost)}
            </Btn>
          </div>
        )}
        <p className="hint">Level 1 costs {money(game.levelCost(1))}, level 2 {money(game.levelCost(2))}, then {money(game.levelCost(3))} per level.</p>
      </Group>
      </Section>
    </div>
  );
}

/** Wanted staff (free recruit every 24 real hours) plus a paid instant hire. */
function RecruitControls({ stationId }: { stationId: string }) {
  const { game, act } = useCtx();
  const [, setNow] = useState(0);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const s = game.station(stationId)!;
  const cap = game.stationCapacity(s).staff;
  const staff = game.stationStaff(s.id).length;
  const target = Math.max(s.hireTarget ?? staff, staff);
  const fee = dept(s.dept).hireCost;
  const set = (n: number) => act(() => game.setHireTarget(s.id, n));
  const left = s.nextHireAt ? Math.max(0, s.nextHireAt - Date.now()) : 0;
  const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000);
  return (
    <div className="recruit">
      <div className="field"><label>Wanted staff at this station (max {cap})</label>
        <div className="stepper" data-testid="hire-target">
          <button onClick={() => set(target - 1)} disabled={target <= staff} aria-label="Fewer">−</button>
          <b data-testid="hire-target-value">{target}</b>
          <button onClick={() => set(target + 1)} disabled={target >= cap} aria-label="More" data-testid="hire-target-plus">+</button>
        </div>
      </div>
      <p className="hint" data-testid="recruit-status">{staff >= Math.min(target, cap) ? `All ${staff} wanted staff are here. Tap + to recruit more (free, one every 24 hours).` : `${target - staff} more wanted · next free recruit in ${h}h ${m}m (one every 24 hours).`}</p>
      <div className="actions">
        <Btn small kind="primary" disabled={staff >= cap || game.city.money < fee} testid="hire-now" onClick={() => act(() => game.hireNow(s.id), 'New recruit hired')}>Hire 1 now · {money(fee)}</Btn>
      </div>
    </div>
  );
}

/** Move staff to another station of the same department. */
function StaffTransfer({ stationId }: { stationId: string }) {
  const { game, act, push } = useCtx();
  const s = game.station(stationId)!;
  const others = game.city.stations.filter(x => x.dept === s.dept && x.id !== s.id);
  const staff = game.stationStaff(s.id);
  if (!staff.length) return null;
  return (
    <div className="list" data-testid="staff-list">
      {staff.map(e => (
        <div key={e.id} className="row compact">
          <button className="grow linkish-row" onClick={() => push({ kind: 'employee', id: e.id })}>
            <div className="row-title">{e.name}</div>
            <div className="row-sub">{e.training ? `Training: ${qualification(e.training.qual).name}` : e.quals.length ? e.quals.map(q => qualification(q).name).join(', ') : 'No training yet'}{e.vehicleId ? ` · ${game.vehicle(e.vehicleId)?.name}` : ''}</div>
          </button>
          {others.length > 0 && (
            <select className="mini-select" value="" aria-label={`Transfer ${e.name}`} data-testid="transfer-select"
              onChange={(ev: any) => ev.target.value && act(() => game.moveEmployee(e.id, ev.target.value), `${e.name} transferred`)}>
              <option value="">Transfer…</option>
              {others.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
