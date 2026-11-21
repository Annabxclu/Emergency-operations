import { useEffect, useRef, useState } from 'react';
import type { Route } from './common';

// iPad / desktop: tab panels open as floating windows you can drag, resize and
// keep open side by side. Phones keep the single full-screen panel.

export interface Win { key: string; stack: Route[]; x: number; y: number; w: number; h: number; z: number }

const STORE = 'fr-windows';
const MIN_W = 300, MIN_H = 220;

export function useWide() {
  const q = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(min-width: 760px)') : null;
  const [wide, setWide] = useState(!!q?.matches);
  useEffect(() => {
    if (!q) return;
    const on = () => setWide(q.matches);
    q.addEventListener?.('change', on);
    return () => q.removeEventListener?.('change', on);
  }, []);
  return wide;
}

type Layout = Record<string, { x: number; y: number; w: number; h: number }>;
function readLayout(): { layout: Layout; open: string[] } {
  try { const v = JSON.parse(localStorage.getItem(STORE) || '{}'); return { layout: v.layout || {}, open: v.open || [] }; } catch { return { layout: {}, open: [] }; }
}
function writeLayout(wins: Win[], layout: Layout) {
  for (const w of wins) layout[w.key] = { x: w.x, y: w.y, w: w.w, h: w.h };
  try { localStorage.setItem(STORE, JSON.stringify({ layout, open: wins.map(w => w.key) })); } catch { /* ignore */ }
}

function bounds() {
  const top = 64, bottom = 72; // top bar / tab bar
  return { top, bottom, vw: window.innerWidth, vh: window.innerHeight };
}
function clamp(w: Win): Win {
  const b = bounds();
  const width = Math.min(Math.max(MIN_W, w.w), b.vw - 8);
  const height = Math.min(Math.max(MIN_H, w.h), b.vh - b.top - b.bottom - 8);
  const x = Math.min(Math.max(4, w.x), b.vw - Math.min(width, 120));
  const y = Math.min(Math.max(b.top + 4, w.y), b.vh - b.bottom - MIN_H - 4);
  // Keep the bottom edge (and its resize corner) above the tab bar.
  return { ...w, x, y, w: width, h: Math.min(height, b.vh - b.bottom - 4 - y) };
}

export function useWindows(rootFor: (key: string) => Route) {
  const saved = useRef(readLayout());
  const zTop = useRef(10);
  const place = (key: string, i: number): Win => {
    const b = bounds();
    const l = saved.current.layout[key];
    // New windows line up side by side, then wrap with a small offset.
    const perRow = Math.max(1, Math.floor((b.vw - 10) / 410));
    const def = { x: 10 + (i % perRow) * 410 + Math.floor(i / perRow) * 30, y: b.top + 10 + Math.floor(i / perRow) * 30, w: 400, h: b.vh - b.top - b.bottom - 24 };
    return clamp({ key, stack: [rootFor(key)], ...(l ?? def), z: ++zTop.current });
  };
  const [wins, setWins] = useState(() => saved.current.open.map((k: string, i: number) => place(k, i)) as Win[]);
  const list = wins as Win[];
  useEffect(() => { writeLayout(list, saved.current.layout); }, [wins]);

  const api = {
    wins: list,
    isOpen: (key: string) => list.some(w => w.key === key),
    /** Open (or bring forward) the window for this group, showing route r. */
    open(key: string, r?: Route) {
      setWins((ws: Win[]) => {
        const ex = ws.find((w: Win) => w.key === key);
        if (ex) return ws.map((w: Win) => w.key === key ? { ...w, stack: r ? [r] : w.stack, z: ++zTop.current } : w);
        const nw = place(key, ws.length);
        if (r) nw.stack = [r];
        return [...ws, nw];
      });
    },
    close(key: string) { setWins((ws: Win[]) => ws.filter((w: Win) => w.key !== key)); },
    toggle(key: string) { if (list.some(w => w.key === key)) api.close(key); else api.open(key); },
    closeAll() { setWins([]); },
    front(key: string) { setWins((ws: Win[]) => { const t = ws.find((w: Win) => w.key === key); return t && t.z === zTop.current ? ws : ws.map((w: Win) => w.key === key ? { ...w, z: ++zTop.current } : w); }); },
    push(key: string, r: Route) { setWins((ws: Win[]) => ws.map((w: Win) => w.key === key ? { ...w, stack: [...w.stack, r], z: ++zTop.current } : w)); },
    back(key: string) {
      setWins((ws: Win[]) => {
        const t = ws.find((w: Win) => w.key === key);
        if (t && t.stack.length <= 1) return ws.filter((w: Win) => w.key !== key);
        return ws.map((w: Win) => w.key === key ? { ...w, stack: w.stack.slice(0, -1) } : w);
      });
    },
    move(key: string, patch: Partial<Win>) { setWins((ws: Win[]) => ws.map((w: Win) => w.key === key ? clamp({ ...w, ...patch }) : w)); },
    /** The window on top (for map highlighting). */
    topmost(): Win | null { return list.reduce((a: Win | null, w) => (!a || w.z > a.z ? w : a), null); },
  };
  return api;
}

export type WindowsApi = ReturnType<typeof useWindows>;

/** A draggable, resizable floating panel. */
export function FloatingWindow(p: { win: Win; title: string; api: WindowsApi; closable?: boolean; children: any }) {
  const { win, api } = p;
  const drag = useRef(null as null | { mode: 'move' | 'size'; sx: number; sy: number; x: number; y: number; w: number; h: number });
  const start = (mode: 'move' | 'size') => (e: any) => {
    if (mode === 'move' && (e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    api.front(win.key);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: any) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (d.mode === 'move') api.move(win.key, { x: d.x + dx, y: d.y + dy });
    else api.move(win.key, { w: d.w + dx, h: d.h + dy });
  };
  const end = () => { drag.current = null; };
  return (
    <div className="win" style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: 1100 + win.z }}
      onPointerDown={() => api.front(win.key)} data-testid={`win-${win.key}`}>
      <div className="win-bar" onPointerDown={start('move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} data-testid={`win-bar-${win.key}`}>
        <span className="win-grip">⠿</span>
        <span className="win-title">{p.title}</span>
        {p.closable && <button className="win-x" aria-label={`Close ${p.title}`} onClick={() => api.close(win.key)}>×</button>}
      </div>
      <div className="win-body">{p.children}</div>
      <div className="win-size" onPointerDown={start('size')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label="Resize" data-testid={`win-size-${win.key}`} />
    </div>
  );
}
