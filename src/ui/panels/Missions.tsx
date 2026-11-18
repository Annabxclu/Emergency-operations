import { useState } from 'react';
import { CAPABILITIES, VEHICLE_TYPES, dept, vehicleType } from '../../data/departments';
import { CATEGORY_DEPT, CATEGORY_NAMES, INCIDENT_TYPES, incidentType } from '../../data/incidents';
import { Chip, Header, Section, useCtx } from '../common';
import { SEVERITY, money } from '../format';
import { glyph } from '../icons';

const CATEGORIES = Object.entries(CATEGORY_NAMES).map(([id, name]) => ({ id, name }));

export function MissionsPanel() {
  const { game } = useCtx();
  const [filter, setFilter] = useState('all');
  const [showCaps, setShowCaps] = useState(false);
  const lvl = game.state.level;
  const fleet = game.city.vehicles;
  const have = (cap: string) => fleet.filter(v => vehicleType(v.typeId).caps.includes(cap)).length;

  const list = INCIDENT_TYPES.filter(t => filter === 'all' || (filter === 'unlocked' ? t.unlockLevel <= lvl : t.unlockLevel > lvl));

  return (
    <div>
      <Header title="Missions" sub={`${INCIDENT_TYPES.length} call types · you are level ${lvl}`} />
      <div className="seg">
        {[['all', 'All'], ['unlocked', 'Unlocked'], ['locked', 'Locked']].map(([k, l]) =>
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}
      </div>

      <button className="callout" onClick={() => setShowCaps(!showCaps)}>
        {showCaps ? '▾' : '▸'} Which vehicles count for each requirement
      </button>
      {showCaps && (
        <div className="list">
          {CAPABILITIES.map(c => (
            <div key={c.id} className="row compact">
              <span className="dot" style={{ background: dept(c.dept).color }} />
              <div className="grow"><div className="row-title">{c.name}</div>
                <div className="row-sub">{VEHICLE_TYPES.filter(v => v.caps.includes(c.id)).map(v => `${v.name} (Lv ${v.unlockLevel})`).join(' · ')}</div></div>
              <span className="muted small">you have {have(c.id)}</span>
            </div>
          ))}
        </div>
      )}

      {CATEGORIES.map(cat => {
        const items = list.filter(t => t.category === cat.id);
        if (!items.length) return null;
        return (
          <Section key={cat.id} title={<><span className="dot" style={{ background: dept(CATEGORY_DEPT[cat.id]).color }} /> {cat.name}</>}>
            <div className="list">
              {items.map(t => {
                const locked = t.unlockLevel > lvl;
                const ready = t.requirements.every(r => have(r.cap) >= r.count);
                return (
                  <div key={t.id} className={`mission ${locked ? 'locked' : ''}`} data-testid="mission">
                    <div className="mission-head">
                      <span className={`inc-ico sev${t.severity}`} dangerouslySetInnerHTML={{ __html: glyph(t.category, 14) }} />
                      <div className="grow"><div className="row-title">{t.name}</div>
                        <div className="row-sub">{SEVERITY[t.severity]} severity · {t.workMin[0]}–{t.workMin[1]} min on scene</div></div>
                      {locked ? <Chip tone="muted">Level {t.unlockLevel}</Chip> : ready ? <Chip tone="ok">Ready</Chip> : <Chip tone="warn">Need units</Chip>}
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
                      <span className="ok">≈{money(t.reward)} · {t.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })}
      <p className="hint">“Ready” means your fleet in this city has enough of each unit type — they still need to be crewed and available when the call comes in.</p>
    </div>
  );
}
