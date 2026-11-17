import { useMemo, useState } from 'react';
import type { Employee } from '../../engine/types';
import { DEPARTMENTS, QUALIFICATIONS, dept, qualification, vehicleType } from '../../data/departments';
import { Btn, Chip, ConfirmBtn, Dot, Empty, Header, Section, Stat, useCtx } from '../common';
import { dur, money } from '../format';

export function PersonnelList() {
  const { game, push } = useCtx();
  const [d, setD] = useState('all');
  const c = game.city;
  const list = c.employees.filter(e => d === 'all' || e.dept === d);
  const payroll = c.employees.reduce((a, e) => a + e.salaryPerHour, 0);
  return (
    <div>
      <div className="sheet-head"><div className="grow"><div className="title">Personnel</div>
        <div className="sub">{c.employees.length} employees · payroll {money(payroll)}/h</div></div></div>
      <div className="seg">
        <button className={d === 'all' ? 'on' : ''} onClick={() => setD('all')}>All</button>
        {DEPARTMENTS.map(x => <button key={x.id} className={d === x.id ? 'on' : ''} onClick={() => setD(x.id)}>{x.short} {c.employees.filter(e => e.dept === x.id).length}</button>)}
      </div>
      {!list.length && <Empty>No employees.</Empty>}
      <div className="list">
        {list.map(e => {
          const v = e.vehicleId ? game.vehicle(e.vehicleId) : null;
          return (
            <button key={e.id} className="row compact" onClick={() => push({ kind: 'employee', id: e.id })}>
              <Dot color={dept(e.dept).color} />
              <div className="grow"><div className="row-title">{e.name}</div>
                <div className="row-sub">{dept(e.dept).ranks[e.rank]} · {game.station(e.stationId)?.name}{v ? ` · ${v.name}` : ' · Unassigned'}</div></div>
              <div className="row-right">
                {e.status === 'training' ? <Chip tone="warn">Training</Chip> : e.quals.length ? <Chip tone="info">{e.quals.length} cert{e.quals.length > 1 ? 's' : ''}</Chip> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EmployeeDetail({ id }: { id: string }) {
  const { game, act, push, back } = useCtx();
  const e = game.employee(id);
  if (!e) return <div><Header title="Employee not found" /></div>;
  const d = dept(e.dept);
  const v = e.vehicleId ? game.vehicle(e.vehicleId) : null;
  const stationVehicles = game.stationVehicles(e.stationId);
  const stations = game.city.stations.filter(s => s.dept === e.dept);
  const need = game.promoteXp(e);
  const canPromote = e.rank < d.ranks.length - 1;

  return (
    <div>
      <Header title={e.name} sub={`${e.empNo} · ${d.ranks[e.rank]} · Shift ${e.shift}`} right={e.status === 'training' ? <Chip tone="warn">Training</Chip> : <Chip tone="ok">On duty</Chip>} />
      <div className="stats">
        <Stat label="Salary" value={`${money(e.salaryPerHour)}/h`} />
        <Stat label="Experience" value={`${e.xp} XP`} />
        <Stat label="Certs" value={e.quals.length} />
      </div>
      {e.training && <div className="callout">Training: {qualification(e.training.qual).name} · {dur(e.training.until - game.state.time)} left</div>}

      <Section title="Assignment">
        <div className="field">
          <label>Station</label>
          <select value={e.stationId} onChange={(ev: any) => act(() => game.moveEmployee(e.id, ev.target.value), 'Transferred')}>
            {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Vehicle</label>
          <select value={e.vehicleId || ''} onChange={(ev: any) => act(() => game.assignEmployee(e.id, ev.target.value || null), 'Assignment updated')}>
            <option value="">Unassigned</option>
            {stationVehicles.map(sv => <option key={sv.id} value={sv.id}>{sv.name} ({game.crew(sv.id).length}/{vehicleType(sv.typeId).maxCrew})</option>)}
          </select>
        </div>
        {v && <button className="linkish small" onClick={() => push({ kind: 'vehicle', id: v.id })}>View {v.name} ›</button>}
      </Section>

      <Section title="Qualifications">
        <div className="tags">{e.quals.length ? e.quals.map(q => <span key={q} className="tag ok">{qualification(q).name}</span>) : <span className="muted small">None yet</span>}</div>
        <div className="list">
          {QUALIFICATIONS.filter(q => q.dept === e.dept && !e.quals.includes(q.id)).map(q => {
            const locked = q.unlockLevel > game.state.level;
            return (
              <div key={q.id} className={`row compact ${locked ? 'disabled' : ''}`}>
                <div className="grow"><div className="row-title">{q.name}</div><div className="row-sub">{q.hours} h course</div></div>
                {locked ? <span className="muted small">Level {q.unlockLevel}</span> :
                  <Btn small disabled={!!e.training || game.city.money < q.cost} onClick={() => act(() => game.train(e.id, q.id), `${e.name} started ${q.name}`)}>Train · {money(q.cost)}</Btn>}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Career">
        {canPromote ? (
          <div className="actions">
            <Btn small kind="primary" disabled={e.xp < need} onClick={() => act(() => game.promote(e.id), `Promoted to ${d.ranks[e.rank + 1]}`)}>Promote to {d.ranks[e.rank + 1]}</Btn>
            <span className="muted small">{e.xp}/{need} XP · +12% salary</span>
          </div>
        ) : <p className="hint">Highest rank reached.</p>}
        <div className="actions"><ConfirmBtn small onConfirm={() => { if (act(() => game.dismiss(e.id), `${e.name} dismissed`)) back(); }}>Dismiss employee</ConfirmBtn></div>
      </Section>
    </div>
  );
}

export function HirePanel({ stationId }: { stationId: string }) {
  const { game, act } = useCtx();
  const [seed, setSeed] = useState(0);
  const s = game.station(stationId);
  const cands: Employee[] = useMemo(() => (s ? game.candidates(s.id) : []), [stationId, seed]);
  const [hired, setHired] = useState(() => new Set<string>());
  if (!s) return <div><Header title="Station not found" /></div>;
  const d = dept(s.dept);
  const cap = game.stationCapacity(s);
  const staff = game.stationStaff(s.id).length;
  return (
    <div>
      <Header title={`Hire · ${s.name}`} sub={`${staff}/${cap.staff} staff · hiring fee ${money(d.hireCost)}`}
        right={<Btn small kind="ghost" onClick={() => { setSeed(seed + 1); setHired(new Set()); }}>New candidates</Btn>} />
      <div className="list">
        {cands.map(c => (
          <div key={c.id} className="row compact">
            <div className="grow"><div className="row-title">{c.name}</div>
              <div className="row-sub">{d.ranks[0]} · {money(c.salaryPerHour)}/h{c.quals.length ? ` · ${c.quals.map(q => qualification(q).name).join(', ')}` : ''}</div></div>
            {hired.has(c.id) ? <Chip tone="ok">Hired</Chip> :
              <Btn small kind="primary" disabled={staff >= cap.staff || game.city.money < d.hireCost} testid="hire-btn"
                onClick={() => { if (act(() => game.hire(s.id, c), `${c.name} hired`)) setHired(new Set([...hired, c.id])); }}>Hire</Btn>}
          </div>
        ))}
      </div>
      {staff >= cap.staff && <p className="hint">This station is at personnel capacity. Upgrade it to hire more.</p>}
      <p className="hint">New hires are assigned to vehicles automatically when a seat is open.</p>
    </div>
  );
}
