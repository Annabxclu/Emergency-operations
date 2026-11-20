import { useState } from 'react';
import { CAPABILITIES, VEHICLE_TYPES, dept, vehicleType } from '../../data/departments';
import { CATEGORY_DEPT, CATEGORY_NAMES, INCIDENT_TYPES, incidentType } from '../../data/incidents';
import { Chip, Header, useCtx } from '../common';
import { SEVERITY, money } from '../format';
import { glyph } from '../icons';

const CATEGORIES = Object.entries(CATEGORY_NAMES).map(([id, name]) => ({ id, name }));

export function MissionsPanel() {
  const { game } = useCtx();
  const [filter, setFilter] = useState('all');
  const [showCaps, setShowCaps] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const owned = game.stationCount();
  const wm = game.state.settings.workMult ?? 0.1;
  const fmtWork = (min: number) => { const sec = Math.max(20, min * 60 * wm); return sec < 90 ? `${Math.round(sec)}s` : `${Math.round(sec / 60)} min`; };
  const fleet = game.city.vehicles;
  const have = (cap: string) => fleet.filter(v => vehicleType(v.typeId).caps.includes(cap)).length;

  const ql = q.trim().toLowerCase();
  // A mission is unlocked (can come in) only with enough stations AND every vehicle it needs.
  const isUnlocked = (t: typeof INCIDENT_TYPES[number]) => t.unlockLevel <= owned && game.fleetCovers(t.requirements);
  const base = INCIDENT_TYPES.filter(t => (filter === 'all' || (filter === 'unlocked' ? isUnlocked(t) : !isUnlocked(t)))
    && (!ql || t.name.toLowerCase().includes(ql) || t.requirements.some(r => CAPABILITIES.find(c => c.id === r.cap)!.name.toLowerCase().includes(ql))));
  const counts: Record<string, number> = {};
  for (const t of base) counts[t.category] = (counts[t.category] ?? 0) + 1;
  const items = base.filter(t => cat === 'all' || t.category === cat)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }) || (a.id.endsWith('_tow') ? 1 : 0) - (b.id.endsWith('_tow') ? 1 : 0));

  return (
    <div>
      <Header title="Missions" sub={`${INCIDENT_TYPES.length} call types · a mission unlocks when you have enough stations (you have ${owned}) and own every vehicle it needs`} />
      <div className="seg">
        {[['all', 'All'], ['unlocked', 'Unlocked'], ['locked', 'Locked']].map(([k, l]) =>
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}
      </div>

      <input className="text" placeholder="Search missions or units (e.g. fire, foam, ambulance)" value={q} onChange={(e: any) => setQ(e.target.value)} data-testid="mission-search" />
      <div className="type-chips" data-testid="mission-types">
        <button className={`fchip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')} data-testid="mission-type-all">All types <em>{base.length}</em></button>
        {CATEGORIES.filter(c => counts[c.id]).map(c => (
          <button key={c.id} className={`fchip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(cat === c.id ? 'all' : c.id)} data-testid={`mission-type-${c.id}`}>
            <span className="dot" style={{ background: dept(CATEGORY_DEPT[c.id]).color }} />{c.name} <em>{counts[c.id]}</em>
          </button>
        ))}
      </div>
      <div className="muted small" style={{ margin: '4px 0 6px' }}>{items.length} missions{ql ? ' match' : ''}</div>
      <button className="callout" onClick={() => setShowCaps(!showCaps)}>
        {showCaps ? '▾' : '▸'} Which vehicles count for each requirement
      </button>
      {showCaps && (
        <div className="list">
          {CAPABILITIES.map(c => (
            <div key={c.id} className="row compact">
              <span className="dot" style={{ background: dept(c.dept).color }} />
              <div className="grow"><div className="row-title">{c.name}</div>
                <div className="row-sub">{VEHICLE_TYPES.filter(v => v.caps.includes(c.id)).map(v => `${v.name}${game.deptItemRequirement(v) > 1 ? ` (${game.deptItemRequirement(v)} ${dept(v.dept).short} stations)` : ''}`).join(' · ')}</div></div>
              <span className="muted small">you have {have(c.id)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="list">
      {items.map(t => {
        const needStations = t.unlockLevel > owned;
        const ready = game.fleetCovers(t.requirements);
        const locked = needStations || !ready;
        return (
          <div key={t.id} className={`mission ${locked ? 'locked' : ''}`} data-testid="mission">
            <div className="mission-head">
              <span className={`inc-ico sev${t.severity}`} dangerouslySetInnerHTML={{ __html: glyph(t.category, 14) }} />
              <div className="grow"><div className="row-title">{t.name}{t.id.endsWith("_tow") && <span className="muted small"> · tow version</span>}</div>
                <div className="row-sub">{SEVERITY[t.severity]} severity · {fmtWork(t.workMin[0])}–{fmtWork(t.workMin[1])} on scene</div></div>
              {needStations ? <Chip tone="muted">{t.unlockLevel} stations</Chip> : ready ? <Chip tone="ok">Unlocked</Chip> : <Chip tone="warn">Need units</Chip>}
            </div>
            <div className="mission-reqs">
              {t.requirements.map(r => {
                const n = have(r.cap);
                const c = CAPABILITIES.find(x => x.id === r.cap)!;
                return <span key={r.cap} className={`req-chip ${n >= r.count ? 'ok' : ''}`}>{r.count}× {c.name}<em>{n >= r.count ? ' ✓' : ` (have ${n})`}</em></span>;
              })}
            </div>
            {(t.patients || t.prisoners || t.children) && (
              <div className="mission-foot">
                <span>{[t.patients && t.patients[1] > 0 ? `${t.patients[0]}–${t.patients[1]} patients to hospital` : '', t.prisoners && t.prisoners[1] > 0 ? `${t.prisoners[0]}–${t.prisoners[1]} suspects to jail` : ''].filter(Boolean).join(' · ')}</span>
              </div>)}
            {t.children && <div className="mission-foot"><span className="warn">Major event: also triggers {t.children.count[0]}–{t.children.count[1]} calls ({t.children.types.map(id => incidentType(id).name).join(', ')})</span></div>}
            <div className="mission-foot">
              <span />
              <span className="ok">{t.reward ? `≈${money(t.reward)}` : 'Paid at hospital'}</span>
            </div>
          </div>
        );
      })}
      </div>
      <p className="hint">“Ready” means your fleet in this city has enough of each unit type — they still need to be crewed and available when the call comes in.</p>
    </div>
  );
}
