import { useState } from 'react';
import { ACADEMIES, DEPARTMENTS, QUALIFICATIONS, dept, isTrainable, qualification, vehicleType } from '../../data/departments';
import { Btn, Chip, ConfirmBtn, Dot, Empty, Header, Section, Stat, useCtx } from '../common';
import { dur, money } from '../format';

export function PersonnelList() {
  const { game, push, back } = useCtx();
  const [d, setD] = useState('all');
  const c = game.city;
  const list = c.employees.filter(e => d === 'all' || e.dept === d);
  return (
    <div>
      <div className="sheet-head"><button className="back" onClick={back} aria-label="Back">‹</button><div className="grow"><div className="title">Personnel</div>
        <div className="sub">{c.employees.length} employees{game.state.settings.shifts ? ` · shift ${game.currentShift()} on duty` : ''}</div></div></div>
      <div className="seg">
        <button className={d === 'all' ? 'on' : ''} onClick={() => setD('all')}>All</button>
        {DEPARTMENTS.filter(x => c.employees.some(e => e.dept === x.id)).map(x => <button key={x.id} className={d === x.id ? 'on' : ''} onClick={() => setD(x.id)}>{x.short} {c.employees.filter(e => e.dept === x.id).length}</button>)}
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
          {QUALIFICATIONS.filter(q => q.dept === e.dept && !e.quals.includes(q.id) && isTrainable(q)).map(q => {
            const need = (ACADEMIES[q.dept] && !game.academyOf(q.dept) ? `Needs ${ACADEMIES[q.dept].name}` : null) || game.needStations(game.deptItemRequirement(q), q.dept);
            const locked = !!need;
            return (
              <div key={q.id} className={`row compact ${locked ? 'disabled' : ''}`}>
                <div className="grow"><div className="row-title">{q.name}</div><div className="row-sub">{q.days ? `${q.days} days` : `${q.hours} h`} course</div></div>
                {locked ? <span className="muted small">{need}</span> :
                  <Btn small disabled={!!e.training || game.city.money < q.cost} onClick={() => act(() => game.train(e.id, q.id), `${e.name} started ${q.name}`)}>{q.cost ? `Train · ${money(q.cost)}` : 'Train · Free'}</Btn>}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Career">
        {canPromote ? (
          <div className="actions">
            <Btn small kind="primary" disabled={e.xp < need} onClick={() => act(() => game.promote(e.id), `Promoted to ${d.ranks[e.rank + 1]}`)}>Promote to {d.ranks[e.rank + 1]}</Btn>
            <span className="muted small">{e.xp}/{need} XP</span>
          </div>
        ) : <p className="hint">Highest rank reached.</p>}
        <div className="actions"><ConfirmBtn small onConfirm={() => { if (act(() => game.dismiss(e.id), `${e.name} dismissed`)) back(); }}>Dismiss employee</ConfirmBtn></div>
      </Section>
    </div>
  );
}

export function AcademyPanel({ dept: deptId }: { dept: string }) {
  const { game, act } = useCtx();
  const def = ACADEMIES[deptId];
  const a = game.academyOf(deptId);
  const courses = QUALIFICATIONS.filter(q => q.dept === deptId && isTrainable(q));
  const [course, setCourse] = useState(courses[0]?.id ?? '');
  const [picked, setPicked] = useState(() => new Set<string>());
  const d = dept(deptId);
  if (!def) return <div><Header title="No academy" /></div>;
  if (!a) return (
    <div>
      <Header title={def.name} sub="Not built yet" />
      <p className="hint">New {d.short.toLowerCase()} recruits arrive untrained. Build the {def.name} to run courses for them. Each classroom trains up to {def.seatsPerClassroom} people at a time.</p>
      <div className="actions"><Btn kind="primary" disabled={game.city.money < def.cost} testid="academy-build" onClick={() => act(() => game.buildAcademy(deptId), `${def.name} built`)}>Build {def.name} · {money(def.cost)}</Btn></div>
      <Section title="Courses taught here"><div className="list">{courses.map(q => <div key={q.id} className="row compact"><div className="grow"><div className="row-title">{q.name}</div></div><span className="muted small">{q.days} days</span></div>)}</div></Section>
    </div>
  );
  const q = qualification(course);
  const seats = game.academySeats(deptId), used = game.inTraining(deptId), free = seats - used;
  const eligible = game.city.employees.filter(e => e.dept === deptId && !e.training && !e.quals.includes(course));
  const trainees = game.city.employees.filter(e => e.dept === deptId && e.training);
  const toggle = (id: string) => { const n = new Set(picked); if (n.has(id)) n.delete(id); else if (n.size < free) n.add(id); setPicked(n); };
  const start = () => {
    let ok = 0;
    for (const id of picked) if (act(() => game.train(id, course))) ok++;
    if (ok) setPicked(new Set());
  };
  return (
    <div>
      <Header title={def.name} sub={`${1 + a.classrooms} classroom${a.classrooms ? 's' : ''} · ${used}/${seats} seats in use`} />
      <Section title="Start a course">
        <div className="field"><label>Course</label>
          <select value={course} onChange={(ev: any) => { setCourse(ev.target.value); setPicked(new Set()); }} data-testid="academy-course">
            {courses.map(c => <option key={c.id} value={c.id}>{c.name} · {c.days} days{c.cost ? ` · ${money(c.cost)}/person` : ''}</option>)}
          </select></div>
        <p className="hint">Pick who should take {q.name} ({q.days} days). {free > 0 ? `${free} seat${free > 1 ? 's' : ''} free.` : 'No free seats — add a classroom or wait for a course to finish.'} People in training can't crew vehicles.</p>
        {!eligible.length && <Empty>Everyone has this training or is already in a course.</Empty>}
        <div className="list">
          {eligible.map(e => (
            <label key={e.id} className="row compact cand" data-testid="academy-student">
              <input type="checkbox" checked={picked.has(e.id)} onChange={() => toggle(e.id)} disabled={!picked.has(e.id) && picked.size >= free} />
              <div className="grow"><div className="row-title">{e.name}</div>
                <div className="row-sub">{game.station(e.stationId)?.name}{e.quals.length ? ` · ${e.quals.map(x => qualification(x).name).join(', ')}` : ''}</div></div>
            </label>
          ))}
        </div>
        <div className="actions"><Btn kind="primary" disabled={!picked.size || game.city.money < picked.size * q.cost} testid="academy-start" onClick={start}>
          Start {q.name} for {picked.size}{q.cost ? ` · ${money(picked.size * q.cost)}` : ' · Free'}</Btn></div>
      </Section>
      {trainees.length > 0 && (
        <Section title="In training">
          <div className="list">{trainees.map(e => (
            <div key={e.id} className="row compact"><div className="grow"><div className="row-title">{e.name}</div>
              <div className="row-sub">{qualification(e.training!.qual).name}</div></div>
              <span className="muted small">{dur(e.training!.until - game.state.time)} left</span></div>
          ))}</div>
        </Section>
      )}
      <Section title="Classrooms">
        {a.classrooms < def.maxExtraClassrooms ? (
          <div className="actions"><Btn small disabled={game.city.money < def.classroomCost} testid="academy-classroom" onClick={() => act(() => game.addClassroom(deptId), 'Classroom added')}>Add classroom (+{def.seatsPerClassroom} seats) · {money(def.classroomCost)}</Btn></div>
        ) : <p className="hint">All {1 + def.maxExtraClassrooms} classrooms built.</p>}
      </Section>
    </div>
  );
}
