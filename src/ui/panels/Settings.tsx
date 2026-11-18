import { useRef, useState } from 'react';
import { CITY_SLOT_LEVELS } from '../../data/cities';
import { INCIDENT_TYPES } from '../../data/incidents';
import { Btn, ConfirmBtn, Header, Section, useCtx } from '../common';
import { money } from '../format';
import { TILE_STYLES } from '../MapView';
import { exportJson } from '../../services/storage';

interface Props { onImport(text: string): void; onNewGame(): void; onAddCity(): void; onSwitchCity(id: string): void; onRoutingUrl(url: string): void; routingOk: boolean | null }

export function SettingsPanel(p: Props) {
  const { game, toast, act, push } = useCtx();
  const s = game.state.settings;
  const [url, setUrl] = useState(s.routingUrl);
  const [paste, setPaste] = useState('');
  const [exported, setExported] = useState('');
  const fileRef = useRef(null as HTMLInputElement | null);
  const slots = game.citySlots();

  const doExport = () => {
    const json = exportJson(game.state);
    setExported(json);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `emergency-operations-day${Math.floor(game.state.time / 86400) + 1}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch { /* fall back to copy */ }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(exported || exportJson(game.state)); toast('Save copied to clipboard', 'ok'); }
    catch { toast('Copy failed. Select the text below and copy it manually.', 'warn'); }
  };
  const readFile = (f: File) => { const r = new FileReader(); r.onload = () => p.onImport(String(r.result)); r.readAsText(f); };

  return (
    <div>
      <Header title="Settings" sub={`${game.cityDef.name}, ${game.cityDef.state} · ${game.stationCount()} stations`} />

      <Section title="Manage">
        <div className="list">
          <button className="row" onClick={() => push({ kind: 'goals' })} data-testid="goals-open">
            <div className="grow"><div className="row-title">Today's goals</div>
              <div className="row-sub">{game.city.goals ? `${game.city.goals.list.filter(g => g.done).length}/${game.city.goals.list.length} complete` : 'Available after setup'}</div></div>
            <span className="muted">›</span>
          </button>
          <button className="row" onClick={() => push({ kind: 'personnel' })} data-testid="personnel-open">
            <div className="grow"><div className="row-title">Personnel</div>
              <div className="row-sub">{game.city.employees.length} employees</div></div>
            <span className="muted">›</span>
          </button>
        </div>
      </Section>

      <Section title="Gameplay">
        <div className="field"><label>New call every</label>
          <div className="seg" role="group" aria-label="Call frequency">
            {[1, 3, 5].map(m => (
              <button key={m} className={(s.callIntervalMin ?? 3) === m ? 'on' : ''} data-testid={`interval-${m}`}
                onClick={() => { s.callIntervalMin = m; const c = game.city; c.nextIncidentAt = Math.min(c.nextIncidentAt, game.state.time + m * 60); game.changed(); }}>{m} min</button>
            ))}
          </div></div>
        <p className="hint">Real minutes. Active calls are capped at your largest department's station count + 1 — right now that's {game.activeCap()} calls.</p>
        <div className="field"><label>Travel times</label>
          <select value={s.travelModel ?? 'fixed'} onChange={(e: any) => { s.travelModel = e.target.value; game.changed(); }} data-testid="travel-model">
            <option value="fixed">Fixed vehicle speeds</option>
            <option value="roads">Road speed limits (realistic)</option>
          </select></div>
        <p className="hint">{(s.travelModel ?? 'fixed') === 'fixed'
          ? 'Each vehicle drives the real road route at its own constant speed (e.g. patrol car 65 mph, engine 45 mph). Faster, game-like.'
          : 'Travel time follows each road’s speed limit, sped up for lights and sirens. Slower, more realistic in dense cities.'} Applies to new trips.</p>
        <label className="check"><input type="checkbox" checked={s.sound} onChange={(e: any) => { s.sound = e.target.checked; game.changed(); }} /> Alert sounds for new calls</label>
        <div className="field"><label>Auto-dispatch</label>
          <select value={s.autoDispatch} onChange={(e: any) => { s.autoDispatch = e.target.value; game.changed(); }} data-testid="auto-dispatch">
            <option value="off">Off — I dispatch everything</option>
            <option value="low">Routine calls only (low severity)</option>
            <option value="all">All calls when fully covered</option>
          </select></div>
        <p className="hint">Auto-dispatch sends the recommended units only when every requirement can be covered.</p>
        <label className="check"><input type="checkbox" checked={s.shifts} onChange={(e: any) => { s.shifts = e.target.checked; Object.values(game.state.cities).length && game.city.stations.forEach(st => game.autoStaff(st.id)); game.changed(); }} /> Realistic shifts (A/B/C, 8 hours each)</label>
        <p className="hint">With shifts on, each vehicle needs a crew for every shift, so you need about three times the staff. Station staff capacity is tripled to match. Currently shift {game.currentShift()}.</p>
      </Section>

      <Section title="Tuning">
        <label className="check"><input type="checkbox" checked={s.runningCosts !== false} onChange={(e: any) => { s.runningCosts = e.target.checked; game.changed(); }} data-testid="running-costs" /> Running costs (station upkeep, fuel, maintenance)</label>
        <p className="hint">Off: you only spend money when you build, buy, hire or train.</p>
        <div className="field"><label>Driving speed</label>
          <div className="seg">
            {[1, 2, 3, 4].map(m => <button key={m} className={(s.travelMult ?? 2) === m ? 'on' : ''} onClick={() => { s.travelMult = m; game.changed(); }} data-testid={`travel-${m}`}>{m}×</button>)}
          </div></div>
        <div className="field"><label>Time on scene</label>
          <div className="seg">
            {[[0.05, 'Very short'], [0.1, 'Short'], [0.25, 'Medium'], [0.5, 'Long'], [1, 'Full']].map(([m, l]) =>
              <button key={m} className={(s.workMult ?? 0.1) === m ? 'on' : ''} onClick={() => { s.workMult = m as number; game.changed(); }}>{l}</button>)}
          </div></div>
        <p className="hint">Changes apply to new trips and to calls that start work after the change.</p>
        <div className="field"><label>Call rewards</label>
          <div className="seg">
            {[0.5, 1, 1.5, 2, 3].map(m => <button key={m} className={(s.rewardMult ?? 1) === m ? 'on' : ''} onClick={() => { s.rewardMult = m; game.changed(); }}>{m}×</button>)}
          </div></div>
        <p className="hint">Other numbers (starting money, daily bonus, call cap) live in src/data/tuning.ts.</p>
      </Section>

      <Section title="Research">
        <button className="row" onClick={() => push({ kind: 'research' })} data-testid="research-open">
          <div className="grow"><div className="row-title">Research projects</div>
            <div className="row-sub">{game.state.research.done.length} completed{game.state.research.active ? ' · 1 in progress' : ''}</div></div>
          <span className="muted">›</span>
        </button>
      </Section>

      <Section title="Missions">
        <button className="row" onClick={() => push({ kind: 'missions' })} data-testid="missions-open">
          <div className="grow"><div className="row-title">All missions & requirements</div>
            <div className="row-sub">{INCIDENT_TYPES.length} call types · {INCIDENT_TYPES.filter(t => game.stationCount() >= t.unlockLevel).length} unlocked</div></div>
          <span className="muted">›</span>
        </button>
      </Section>

      <Section title="Cities" right={<span className="muted small">{slots.used}/{CITY_SLOT_LEVELS.length} slots</span>}>
        <div className="list">
          {Object.keys(game.state.cities).map(id => {
            const d = game.defOf(id), cs = game.state.cities[id];
            const active = id === game.state.activeCity;
            return (
              <div key={id} className="row compact">
                <div className="grow"><div className="row-title">{d.name}, {d.state}</div>
                  <div className="row-sub">{cs.stations.length} stations · {cs.vehicles.length} vehicles · {money(cs.money)}{cs.incidents.length ? ` · ${cs.incidents.length} active calls` : ''}</div></div>
                {active ? <span className="chip ok">Active</span> : <Btn small onClick={() => p.onSwitchCity(id)}>Switch</Btn>}
              </div>
            );
          })}
        </div>
        <div className="actions">
          <Btn small kind="primary" disabled={!slots.canAdd} onClick={p.onAddCity} testid="add-city">+ Add a city</Btn>
          {!slots.canAdd && slots.nextLevel && <span className="muted small">Next city unlocks at {slots.nextLevel} total stations</span>}
        </div>
        <p className="hint">Each city has its own stations, staff, calls and budget. Cities you're not viewing keep running, but new calls only arrive in the city you're viewing.</p>
      </Section>

      <Section title="Map">
        <div className="field"><label>Map style</label>
          <select value={s.tileStyle} onChange={(e: any) => { s.tileStyle = e.target.value; game.changed(); }}>
            {Object.entries(TILE_STYLES).map(([k, t]) => <option key={k} value={k}>{t.name}</option>)}
          </select></div>
        <label className="check"><input type="checkbox" checked={s.showCoverage} onChange={(e: any) => { s.showCoverage = e.target.checked; game.changed(); }} /> Show station coverage areas</label>
      </Section>

      <Section title="Road routing">
        <p className="hint">Status: {p.routingOk == null ? 'not used yet' : p.routingOk ? 'working' : 'unreachable — vehicles use approximate direct paths (dashed)'}.</p>
        <div className="field"><label>OSRM server</label>
          <input value={url} onChange={(e: any) => setUrl(e.target.value)} spellCheck={false} autoCapitalize="off" /></div>
        <div className="actions"><Btn small onClick={() => p.onRoutingUrl(url)}>Save server</Btn>
          <Btn small kind="ghost" onClick={() => { setUrl('https://router.project-osrm.org'); p.onRoutingUrl('https://router.project-osrm.org'); }}>Use public demo</Btn></div>
        <p className="hint">The public OSRM demo server is shared and rate-limited (about one request per second). For heavy play, point this at your own OSRM server.</p>
      </Section>

      <Section title="Save data">
        <p className="hint">Progress saves automatically on this device. Export a backup to keep it safe or move it to another device.</p>
        <div className="actions wrap">
          <Btn small kind="primary" onClick={doExport} testid="export-btn">Export backup</Btn>
          <Btn small onClick={copy}>Copy save</Btn>
          <Btn small onClick={() => fileRef.current?.click()}>Import file</Btn>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e: any) => e.target.files?.[0] && readFile(e.target.files[0])} />
        </div>
        {exported && <textarea className="mono" readOnly value={exported} rows={3} onFocus={(e: any) => e.target.select()} />}
        <div className="field"><label>Or paste a save</label><textarea className="mono" rows={3} value={paste} onChange={(e: any) => setPaste(e.target.value)} placeholder="Paste exported save text" /></div>
        <div className="actions"><Btn small disabled={!paste.trim()} onClick={() => p.onImport(paste)}>Load pasted save</Btn></div>
      </Section>

      <Section title="Testing">
        <div className="actions wrap">
          <Btn small disabled={!game.setupDone} testid="test-call" onClick={() => act(() => { game.spawnIncident(); })}>Generate a call now</Btn>
          <select value="" disabled={!game.setupDone} onChange={(e: any) => e.target.value && act(() => { game.spawnIncident(e.target.value); })}>
            <option value="">Specific call type…</option>
            {INCIDENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </Section>

      <Section title="New game">
        <p className="hint">Start over in any city. This replaces your current game, so export a backup above first if you want to keep it.</p>
        <ConfirmBtn small onConfirm={p.onNewGame}>Start new game</ConfirmBtn>
      </Section>

      <Section title="About">
        <p className="hint">Emergency Operations prototype. All calls are fictional. Map data and tiles © OpenStreetMap contributors (Humanitarian style by HOT / OSM France); routing by OSRM. No API keys are used.</p>
      </Section>
    </div>
  );
}
