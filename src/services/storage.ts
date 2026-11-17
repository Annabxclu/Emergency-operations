import type { GameState } from '../engine/types';
import { migrate } from '../engine/game';

// Saves live in IndexedDB. A second slot keeps the previous save as a backup,
// and localStorage is used only if IndexedDB is unavailable.

const DB = 'emergency-operations';
const STORE = 'saves';
const MAIN = 'main';
const BACKUP = 'backup';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { resolve(req.result as T); db.close(); };
    tx.onerror = () => { reject(tx.error); db.close(); };
  });
}

let lastJson = '';

export async function saveGame(state: GameState): Promise<void> {
  const json = JSON.stringify(state);
  if (json === lastJson) return;
  try {
    const prev = await idb<string | undefined>('readonly', s => s.get(MAIN));
    if (prev) await idb('readwrite', s => s.put(prev, BACKUP));
    await idb('readwrite', s => s.put(json, MAIN));
  } catch {
    try { localStorage.setItem(`eo-${MAIN}`, json); } catch { /* storage full or blocked */ }
  }
  lastJson = json;
}

export async function loadGame(): Promise<GameState | null> {
  let json: string | null | undefined = null;
  try { json = await idb<string | undefined>('readonly', s => s.get(MAIN)); } catch { /* fall through */ }
  if (!json) { try { json = localStorage.getItem(`eo-${MAIN}`); } catch { json = null; } }
  if (!json) return null;
  try {
    return migrate(JSON.parse(json));
  } catch {
    try {
      const backup = await idb<string | undefined>('readonly', s => s.get(BACKUP));
      return backup ? migrate(JSON.parse(backup)) : null;
    } catch { return null; }
  }
}

export async function clearSave(): Promise<void> {
  lastJson = '';
  try { await idb('readwrite', s => s.clear()); } catch { /* ignore */ }
  try { localStorage.removeItem(`eo-${MAIN}`); } catch { /* ignore */ }
}

export function exportJson(state: GameState): string {
  return JSON.stringify({ app: 'emergency-operations', exportedAt: new Date().toISOString(), state });
}

export function importJson(text: string): GameState {
  let parsed: any;
  try { parsed = JSON.parse(text); } catch { throw new Error('That is not valid save data.'); }
  return migrate(parsed && parsed.state ? parsed.state : parsed);
}
