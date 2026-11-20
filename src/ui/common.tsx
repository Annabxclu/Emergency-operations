import { createContext, useContext, useEffect, useState } from 'react';
import type { Game } from '../engine/game';
import type { LatLng } from '../engine/types';
import { VEHICLE_STATUS } from './format';

export type Route =
  | { kind: 'dispatch' } | { kind: 'incident'; id: string }
  | { kind: 'stations' } | { kind: 'station'; id: string } | { kind: 'build' }
  | { kind: 'vehicles' } | { kind: 'vehicle'; id: string }
  | { kind: 'personnel' } | { kind: 'employee'; id: string } | { kind: 'hire'; stationId: string } | { kind: 'academy'; dept: string } | { kind: 'hospital'; id: string }
  | { kind: 'finances' } | { kind: 'settings' } | { kind: 'missions' } | { kind: 'research' } | { kind: 'goals' };

export interface Ctx {
  game: Game;
  push(r: Route): void;
  back(): void;
  toast(text: string, tone?: 'info' | 'ok' | 'warn' | 'bad', action?: () => void): void;
  act(fn: () => void, okText?: string): boolean;
  focus(p: LatLng, zoom?: number): void;
  startBuild(stationTypeId: string, at?: { pos: LatLng; name: string; address?: string }): void;
}

export const GameCtx = createContext(null as unknown as Ctx);
export const useCtx = (): Ctx => useContext(GameCtx);

export function Chip(p: { tone?: string; children: any }) {
  return <span className={`chip ${p.tone || ''}`}>{p.children}</span>;
}

export function Btn(p: { onClick?: () => void; kind?: 'primary' | 'ghost' | 'danger' | ''; disabled?: boolean; small?: boolean; children: any; title?: string; testid?: string }) {
  return (
    <button className={`btn ${p.kind || ''} ${p.small ? 'small' : ''}`} disabled={p.disabled} onClick={p.onClick} title={p.title} data-testid={p.testid}>
      {p.children}
    </button>
  );
}

export function Header(p: { title: any; sub?: any; right?: any }) {
  const { back } = useCtx();
  return (
    <div className="sheet-head">
      <button className="back" onClick={back} aria-label="Back">‹</button>
      <div className="grow">
        <div className="title">{p.title}</div>
        {p.sub && <div className="sub">{p.sub}</div>}
      </div>
      {p.right}
    </div>
  );
}

export function Section(p: { title?: any; right?: any; children: any }) {
  return (
    <section className="section">
      {(p.title || p.right) && <div className="section-head"><h3>{p.title}</h3>{p.right}</div>}
      {p.children}
    </section>
  );
}

export function Stat(p: { label: string; value: any; tone?: string }) {
  return <div className="stat"><div className="v" data-tone={p.tone}>{p.value}</div><div className="l">{p.label}</div></div>;
}

export function Dot(p: { color: string }) {
  return <span className="dot" style={{ background: p.color }} />;
}

export function Empty(p: { children: any }) {
  return <div className="empty">{p.children}</div>;
}

/** Destructive button that needs a second tap within a few seconds. */
export function ConfirmBtn(p: { onConfirm: () => void; children: any; confirmText?: string; small?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3500); return () => clearTimeout(t); }, [armed]);
  return (
    <button className={`btn danger ${p.small ? 'small' : ''}`} onClick={() => { if (armed) { setArmed(false); p.onConfirm(); } else setArmed(true); }}>
      {armed ? p.confirmText || 'Tap again to confirm' : p.children}
    </button>
  );
}

/** Numbered radio status badge. */
export function StatusCode(p: { status: string; label?: boolean }) {
  const st = (VEHICLE_STATUS as any)[p.status];
  if (!st) return null;
  return <span className="scode-wrap"><span className="scode" style={{ background: st.color }}>{st.code}</span>{p.label !== false && <span className="scode-l">{st.label}</span>}</span>;
}

// Buttons that expand when tapped (Settings, station screens). Open groups are
// remembered while the app is open (e.g. after visiting Missions and coming back).
const openGroups = new Set<string>();
export function Group({ id, title, sub, children }: { id: string; title: string; sub?: string; children: any }) {
  const [open, setOpen] = useState(openGroups.has(id));
  const toggle = () => { if (open) openGroups.delete(id); else openGroups.add(id); setOpen(!open); };
  return (
    <div className={`set-group ${open ? 'open' : ''}`}>
      <button className="set-group-head" onClick={toggle} data-testid={`group-${id}`} aria-expanded={open}>
        <div className="grow"><div className="row-title">{title}</div>{sub && <div className="row-sub">{sub}</div>}</div>
        <span className="chev">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="set-group-body">{children}</div>}
    </div>
  );
}

