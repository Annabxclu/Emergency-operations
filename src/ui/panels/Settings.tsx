import { useRef, useState } from 'react';
import { xpForLevel } from '../../engine/game';
import { CITIES } from '../../data/cities';
import { INCIDENT_TYPES } from '../../data/incidents';
import { Btn, ConfirmBtn, Header, Section, useCtx } from '../common';
import { TILE_STYLES } from '../MapView';
import { exportJson } from '../../services/storage';

interface Props { onImport(text: string): void; onReset(): void; onRoutingUrl(url: string): void; routingOk: boolean | null }

export function SettingsPanel(p: Props) {
  const { game, toast, act } = useCtx();
  const s = game.state.settings;
  const [url, setUrl] = useState(s.routingUrl);
  const [paste, setPaste] = useState('');
  const [exported, setExported] = useState('');
  const fileRef = useRef(null as HTMLInputElement | null);
  const lvl = game.state.level;

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

      <Section title="Cities">
        <div className="list">
          {CITIES.map(c => (
            <div key={c.id} className={`row compact ${c.id !== game.state.activeCity ? 'disabled' : ''}`}>
              <div className="grow"><div className="row-title">{c.name}, {c.state}</div>
                <div className="row-sub">{c.id === game.state.activeCity ? 'Active city' : c.playable ? `Unlocks at level ${c.unlockLevel}` : `Planned · level ${c.unlockLevel}`}</div></div>
            </div>
          ))}
        </div>
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
        <ConfirmBtn small onConfirm={p.onReset}>Start a new game</ConfirmBtn>
      </Section>

      <Section title="About">
        <p className="hint">Emergency Operations prototype. All calls are fictional. Map data © OpenStreetMap contributors; tiles © CARTO (or OSM); routing by OSRM.</p>
      </Section>
    </div>
  );
}
