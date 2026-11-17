import { useEffect, useState } from 'react';
import { MIN_CONDITION } from '../../engine/game';
import { DEPARTMENTS, capability, dept, qualification, vehicleType } from '../../data/departments';
import { Btn, Chip, ConfirmBtn, Dot, Empty, Header, Section, Stat, useCtx } from '../common';
import { VEHICLE_STATUS, dur, money } from '../format';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'busy', label: 'On calls' },
  { id: 'problem', label: 'Needs attention' },
];

export function VehiclesList() {
  const { game, push } = useCtx();
  const [filter, setFilter] = useState('all');
  const c = game.city;
  const match = (v: (typeof c.vehicles)[0]) => {
    if (filter === 'available') return v.status === 'available' && !game.dispatchProblem(v);
    if (filter === 'busy') return ['dispatched', 'enroute', 'onscene', 'transporting', 'handover', 'returning'].includes(v.status);
    if (filter === 'problem') return (v.status === 'available' && !!game.dispatchProblem(v)) || v.status === 'out_of_service' || v.condition < 50;
    return true;
  };
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Vehicles</div><div className="sub">{c.vehicles.length} in fleet</div></div></div>
      <div className="seg">
        {FILTERS.map(f => <button key={f.id} className={filter === f.id ? 'on' : ''} onClick={() => setFilter(f.id)}>{f.label}</button>)}
      </div>
      {!c.vehicles.length && <Empty>No vehicles. Buy them from a station.</Empty>}
      {DEPARTMENTS.map(d => {
        const list = c.vehicles.filter(v => vehicleType(v.typeId).dept === d.id && match(v));
        if (!list.length) return null;
        return (
          <Section key={d.id} title={<><Dot color={d.color} /> {d.short}</>}>
            <div className="list">
              {list.map(v => {
                const t = vehicleType(v.typeId);
                const prob = v.status === 'available' ? game.dispatchProblem(v) : null;
                const eta = game.etaRemaining(v);
                return (
                  <button key={v.id} className="row compact" onClick={() => push({ kind: 'vehicle', id: v.id })} data-testid="vehicle-row">
                    <span className="veh-badge" style={{ borderColor: d.color }}>{t.short}</span>
                    <div className="grow"><div className="row-title">{v.name}</div>
                      <div className="row-sub">{prob || `${t.name} · ${game.station(v.stationId)?.name ?? ''}`}</div></div>
                    <div className="row-right"><Chip tone={prob ? 'bad' : VEHICLE_STATUS[v.status].tone}>{prob ? 'Not ready' : VEHICLE_STATUS[v.status].label}{eta != null ? ` · ${dur(eta)}` : ''}</Chip></div>
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

export function VehicleDetail({ id }: { id: string }) {
  const { game, act, push, focus, back } = useCtx();
  const v = game.vehicle(id);
  useEffect(() => { if (v) focus(v.pos, 15); }, [id]);
  if (!v) return <div><Header title="Vehicle not found" /></div>;
  const t = vehicleType(v.typeId);
  const d = dept(t.dept);
  const st = game.station(v.stationId);
  const crew = game.crew(v.id);
  const staffProb = game.staffingProblem(v);
  const atStation = ['available', 'out_of_service', 'maintenance'].includes(v.status);
  const inc = v.incidentId ? game.incident(v.incidentId) : null;
  const eta = game.etaRemaining(v);
  const freeAtStation = game.stationStaff(v.stationId).filter(e => !e.vehicleId && e.status === 'on_duty');
  const otherStations = game.city.stations.filter(s => s.dept === t.dept && s.id !== v.stationId);

  return (
    <div>
      <Header title={v.name} sub={`${t.name} · ${st?.name ?? ''}`} right={<Chip tone={VEHICLE_STATUS[v.status].tone}>{VEHICLE_STATUS[v.status].label}</Chip>} />
      {inc && (
        <button className="callout" onClick={() => push({ kind: 'incident', id: inc.id })}>
          Assigned to <b>{inc.name}</b> · {inc.address}{eta != null ? ` · ETA ${dur(eta)}` : ''}
        </button>
      )}
      {v.cargo && <div className="callout">{v.status === 'handover' ? 'Handing over' : 'Transporting'} {v.cargo.count} {v.cargo.kind}{v.cargo.count > 1 ? 's' : ''} → {v.cargo.destName}{eta != null ? ` · ${dur(eta)}` : ''}</div>}
      {v.status === 'maintenance' && <div className="callout">In the shop · back in {dur(v.maintenanceUntil - game.state.time)}</div>}
      <div className="stats">
        <Stat label="Condition" value={`${Math.round(v.condition)}%`} tone={v.condition < MIN_CONDITION ? 'bad' : v.condition < 50 ? 'warn' : ''} />
        <Stat label="Crew" value={`${crew.length}/${t.maxCrew}`} tone={staffProb ? 'bad' : ''} />
        <Stat label="Speed" value={game.state.settings.travelModel === 'roads' && !t.air ? `${Math.round(t.speedFactor * 100)}%` : `${t.mph} mph`} />
        <Stat label="Calls" value={v.calls} />
      </div>

      <Section title="Capabilities">
        <div className="tags">{t.caps.map(c => <span key={c} className="tag">{capability(c).name}</span>)}</div>
        <div className="kv">
          <span>Crew {t.minCrew}–{t.maxCrew}</span>
          {t.quals.map(q => <span key={q.qual}>Needs {q.count}× {qualification(q.qual).name}</span>)}
          <span>Maintenance {money(t.maintenancePerHour)}/h</span><span>Fuel {money(t.fuelPerKm)}/km</span>
        </div>
      </Section>

      <Section title="Crew" right={atStation && <Btn small onClick={() => act(() => game.autoStaff(v.stationId), 'Crew assigned')}>Auto-assign</Btn>}>
        {staffProb && <div className="warnbox">{staffProb}. {freeAtStation.length ? `${freeAtStation.length} unassigned at station.` : 'Hire or train staff at this station.'}</div>}
        <div className="list">
          {crew.map(e => (
            <button key={e.id} className="row compact" onClick={() => push({ kind: 'employee', id: e.id })}>
              <div className="grow"><div className="row-title">{e.name}</div>
                <div className="row-sub">{d.ranks[e.rank]}{e.quals.length ? ` · ${e.quals.map(q => qualification(q).name).join(', ')}` : ''}</div></div>
              {e.status === 'training' && <Chip tone="warn">Training</Chip>}
            </button>
          ))}
        </div>
        {atStation && freeAtStation.length > 0 && crew.length < t.maxCrew && (
          <div className="list">
            {freeAtStation.slice(0, 6).map(e => (
              <div key={e.id} className="row compact">
                <div className="grow"><div className="row-title muted">{e.name}</div><div className="row-sub">{e.quals.map(q => qualification(q).name).join(', ') || 'Unassigned'}</div></div>
                <Btn small onClick={() => act(() => game.assignEmployee(e.id, v.id))}>Add</Btn>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Costs">
        <div className="kv"><span>Purchase {money(v.costs.purchase)}</span><span>Fuel {money(v.costs.fuel)}</span><span>Maintenance {money(v.costs.maintenance)}</span><span>{v.odometerKm.toFixed(1)} km driven</span></div>
      </Section>

      <Section title="Actions">
        <div className="actions wrap">
          {inc && <Btn small onClick={() => act(() => game.recall(v.id), `${v.name} released`)}>Release from call</Btn>}
          {atStation && v.condition < 100 && v.status !== 'maintenance' &&
            <Btn small onClick={() => act(() => game.sendToMaintenance(v.id), `${v.name} sent for service`)}>Service · {money(game.maintenanceCost(v))}</Btn>}
          {v.status === 'available' && <Btn small kind="ghost" onClick={() => act(() => game.setOutOfService(v.id, true))}>Take out of service</Btn>}
          {v.status === 'out_of_service' && <Btn small onClick={() => act(() => game.setOutOfService(v.id, false))}>Return to service</Btn>}
        </div>
        {v.status === 'available' && otherStations.length > 0 && (
          <div className="field">
            <label>Reassign to station</label>
            <select value="" onChange={(e: any) => e.target.value && act(() => game.reassignVehicle(v.id, e.target.value), `${v.name} reassigned`)}>
              <option value="">Choose…</option>
              {otherStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {atStation && v.status !== 'maintenance' && (
          <div className="actions"><ConfirmBtn small onConfirm={() => { if (act(() => game.sellVehicle(v.id), `${v.name} sold`)) back(); }}>Sell vehicle · {money(Math.round(t.price * 0.4 * v.condition / 100))}</ConfirmBtn></div>
        )}
      </Section>
    </div>
  );
}
