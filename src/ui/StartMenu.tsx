import { useRef } from 'react';
import type { Game } from '../engine/game';
import { clock, money } from './format';

interface Props {
  game: Game;
  hasSave: boolean;
  onContinue(): void;
  onNewGame(): void;
  onImport(text: string): void;
}

export function StartMenu(p: Props) {
  const fileRef = useRef(null as HTMLInputElement | null);
  const g = p.game;
  const t = clock(g.state.time);
  const cities = Object.keys(g.state.cities);
  const c = g.city;
  return (
    <div className="picker menu" data-testid="start-menu">
      <div className="picker-card">
        <div className="menu-logo">
          <span style={{ background: '#d9463b' }} /><span style={{ background: '#2f6fe0' }} /><span style={{ background: '#e39a12' }} />
        </div>
        <div className="picker-brand">EMERGENCY OPERATIONS</div>
        <h1>Command Center</h1>
        <p className="muted">Build and run an emergency services network on real city streets.</p>

        {p.hasSave && (
          <button className="menu-continue" onClick={p.onContinue} data-testid="menu-continue">
            <div className="mc-label">Continue</div>
            <div className="mc-title">{g.cityDef.name}, {g.cityDef.state}</div>
            <div className="mc-sub">Day {t.day} · Level {g.state.level} · {money(c.money)} · {c.stations.length} stations{cities.length > 1 ? ` · ${cities.length} cities` : ''}</div>
          </button>
        )}

        <button className="btn primary big" onClick={p.onNewGame} data-testid="menu-new">New game</button>
        <button className="btn big" onClick={() => fileRef.current?.click()}>Load backup file</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e: any) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => p.onImport(String(r.result)); r.readAsText(f); } }} />
        {p.hasSave && <p className="hint">Starting a new game replaces your current save. Export a backup from Settings first if you want to keep it.</p>}
      </div>
    </div>
  );
}
