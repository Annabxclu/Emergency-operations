import { useEffect, useState } from 'react';
import { DEPARTMENTS, STATION_TYPES, VEHICLE_TYPES, dept, qualification, stationType } from '../../data/departments';
import { Btn, Chip, Dot, Empty, Header, Section, Stat, useCtx } from '../common';
import { VEHICLE_STATUS, money } from '../format';
import { glyph } from '../icons';

export function StationsList() {
  const { game, push } = useCtx();
  const c = game.city;
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Stations</div><div className="sub">{c.stations.length} buildings · {c.vehicles.length} vehicles</div></div>
        {game.setupDone && <Btn kind="primary" small onClick={() => push({ kind: 'build' })} testid="build-open">+ Build</Btn>}</div>
      {!c.stations.length && <Empty>No stations yet.</Empty>}
      {DEPARTMENTS.map(d => {
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
                      <div className="row-sub">Level {s.level + 1} · {vs.length}/{cap.bays} vehicles · {game.stationStaff(s.id).length}/{cap.staff} staff</div></div>
                    <div className="row-right"><Chip tone={ready ? 'ok' : 'muted'}>{ready} ready</Chip></div>
                  </button>
                );
              })}
            </div>
          </Section>
        );
      })}
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
          const locked = d.unlockLevel > game.state.level;
          const lv = t.levels[0];
          return (
            <button key={t.id} className="row" disabled={locked || game.city.money < t.cost} onClick={() => startBuild(t.id)} data-testid={`build-${t.id}`}>
              <span className="st-ico" style={{ background: d.color }} dangerouslySetInnerHTML={{ __html: glyph(d.id, 15) }} />
              <div className="grow"><div className="row-title">{t.name}</div>
                <div className="row-sub">{lv.bays} bays · {lv.staff} staff · {t.coverageKm} km coverage · upkeep {money(t.upkeepPerHour)}/h</div></div>
              <div className="row-right"><div className="amt">{locked ? `Level ${d.unlockLevel}` : money(t.cost)}</div></div>
            </button>
          );
        })}
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
  const next = t.levels[s.level + 1];
  const vehicles = game.stationVehicles(s.id);
  const staff = game.stationStaff(s.id);
  const freeStaff = staff.filter(e => !e.vehicleId).length;
  const upkeep = t.upkeepPerHour * (1 + s.level * 0.35);
  const payroll = staff.reduce((a, e) => a + e.salaryPerHour, 0);
  const maint = vehicles.reduce((a, v) => a + VEHICLE_TYPES.find(x => x.id === v.typeId)!.maintenancePerHour, 0);

  return (
    <div>
      <Header title={renaming ? (
        <form onSubmit={(e: Event) => { e.preventDefault(); game.renameStation(s.id, name); setRenaming(false); }}>
          <input className="inline-input" value={name} autoFocus onChange={(e: any) => setName(e.target.value)} onBlur={() => { game.renameStation(s.id, name); setRenaming(false); }} />
        </form>) : <span onClick={() => { setName(s.name); setRenaming(true); }}>{s.name} <span className="muted small">✎</span></span>}
        sub={`${d.name} · Level ${s.level + 1}`} />
      <div className="stats">
        <Stat label="Vehicles" value={`${vehicles.length}/${cap.bays}`} />
        <Stat label="Staff" value={`${staff.length}/${cap.staff}`} />
        <Stat label="Unassigned" value={freeStaff} />
        <Stat label="Cost / hour" value={money(upkeep + payroll + maint)} />
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
                <div className="row-right"><Chip tone={prob ? 'bad' : VEHICLE_STATUS[v.status].tone}>{prob ? 'Unstaffed' : VEHICLE_STATUS[v.status].label}</Chip></div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Buy vehicle" right={<span className="muted small">Balance {money(game.city.money)}</span>}>
        <div className="list">
          {VEHICLE_TYPES.filter(v => v.dept === s.dept).map(vt => {
            const locked = vt.unlockLevel > game.state.level;
            const full = vehicles.length >= cap.bays;
            const quals = vt.quals.map(q => `${q.count}× ${qualification(q.qual).name}`).join(', ');
            return (
              <div key={vt.id} className={`row compact ${locked ? 'disabled' : ''}`}>
                <span className="veh-badge" style={{ borderColor: d.color }}>{vt.short}</span>
                <div className="grow"><div className="row-title">{vt.name}</div>
                  <div className="row-sub">Crew {vt.minCrew}–{vt.maxCrew}{quals ? ` · ${quals}` : ''} · {money(vt.maintenancePerHour)}/h</div></div>
                <div className="row-right">
                  {locked ? <span className="muted small">Level {vt.unlockLevel}</span> :
                    <Btn small kind="primary" disabled={full || game.city.money < vt.price} testid={`buy-${vt.id}`}
                      onClick={() => act(() => game.buyVehicle(vt.id, s.id), `${vt.name} purchased`)}>{money(vt.price)}</Btn>}
                </div>
              </div>
            );
          })}
        </div>
        {vehicles.length >= cap.bays && <p className="hint">All bays are full. Upgrade the station for more.</p>}
      </Section>

      <Section title="Personnel" right={<Btn small onClick={() => push({ kind: 'hire', stationId: s.id })} disabled={staff.length >= cap.staff} testid="hire-open">Hire</Btn>}>
        <div className="kv">
          <span>{staff.length} employees · {freeStaff} unassigned</span>
          <span>Payroll {money(payroll)}/h</span>
        </div>
        <div className="actions">
          <Btn small onClick={() => act(() => game.autoStaff(s.id), 'Crews assigned')}>Auto-assign crews</Btn>
          <Btn small kind="ghost" onClick={() => push({ kind: 'personnel' })}>View personnel</Btn>
        </div>
      </Section>

      <Section title="Building">
        <div className="kv"><span>Upkeep {money(upkeep)}/h</span><span>City contract +{money(t.contractPerHour)}/h</span><span>Coverage {t.coverageKm} km</span></div>
        {next ? (
          <div className="actions">
            <Btn kind="primary" small disabled={game.city.money < next.upgradeCost} onClick={() => act(() => game.upgradeStation(s.id), `${s.name} upgraded`)}>
              Upgrade to level {s.level + 2} · {money(next.upgradeCost)}
            </Btn>
            <span className="muted small">→ {next.bays} bays, {next.staff} staff</span>
          </div>
        ) : <p className="hint">Fully upgraded.</p>}
      </Section>
    </div>
  );
}
