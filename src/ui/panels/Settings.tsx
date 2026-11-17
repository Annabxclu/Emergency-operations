import { useRef, useState } from 'react';
import { xpForLevel } from '../../engine/game';
import { CITY_SLOT_LEVELS } from '../../data/cities';
import { INCIDENT_TYPES } from '../../data/incidents';
import { Btn, ConfirmBtn, Header, Section, useCtx } from '../common';
import { money } from '../format';
import { TILE_STYLES } from '../MapView';
import { exportJson } from '../../services/storage';

interface Props { onImport(text: string): void; onNewGame(): void; onMenu(): void; onAddCity(): void; onSwitchCity(id: string): void; onRoutingUrl(url: string): void; routingOk: boolean | null }

export function SettingsPanel(p: Props) {
  const { game, toast, act, push } = useCtx();
  const s = game.state.settings;
  const [url, setUrl] = useState(s.routingUrl);
  const [paste, setPaste] = useState('');
  const [exported, setExported] = useState('');
  const fileRef = useRef(null as HTMLInputElement | null);
  const lvl = game.state.level;
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
      <Header title="Settings" sub={`Level ${lvl} · ${game.state.xp}/${xpForLevel(lvl + 1)} XP`} />
      <div className="actions"><Btn kind="primary" onClick={p.onMenu} testid="to-menu">Main menu</Btn><span className="muted small">Game pauses while the menu is open.</span></div>

      <Section title="Gameplay">
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
            <div className="row-sub">{INCIDENT_TYPES.length} call types · {INCIDENT_TYPES.filter(t => t.unlockLevel <= lvl).length} unlocked</div></div>
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
          {!slots.canAdd && slots.nextLevel && <span className="muted small">Next city unlocks at level {slots.nextLevel}</span>}
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

      <Section title="Danger zone">
        <ConfirmBtn small onConfirm={p.onNewGame}>Start a new game in any city</ConfirmBtn>
      </Section>

      <Section title="About">
        <p className="hint">Emergency Operations prototype. All calls are fictional. Map data and tiles © OpenStreetMap contributors (Humanitarian style by HOT / OSM France); routing by OSRM. No API keys are used.</p>
      </Section>
    </div>
  );
}
