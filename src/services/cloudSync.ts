import type { GameState } from '../engine/types';
import { cloudMeta, cloudUser, downloadSave, lastSynced, setLastSynced, uploadSave, type CloudMeta } from './cloud';

// Keeps one device's game in step with the cloud save.
// - Uploads about once a minute while playing and whenever the app is hidden.
// - Before each upload it checks the cloud: if another device saved since this one
//   last synced, it stops and asks which save to keep (unless this device has
//   nothing unsaved, in which case it simply loads the newer save).

export type SyncStatus = 'off' | 'checking' | 'syncing' | 'ok' | 'error' | 'conflict';

const UNSYNCED = 'fr-cloud-unsynced';
const markUnsynced = (v: boolean) => { try { v ? localStorage.setItem(UNSYNCED, '1') : localStorage.removeItem(UNSYNCED); } catch { /* ignore */ } };
const isUnsynced = () => { try { return localStorage.getItem(UNSYNCED) === '1'; } catch { return false; } };

export class CloudSync {
  status: SyncStatus = cloudUser() ? 'checking' : 'off';
  error = '';
  conflict: CloudMeta | null = null;
  lastAt = lastSynced();
  /** False on a device with no game yet: a cloud save is loaded without asking. */
  hasLocal = true;
  private busy = false;
  private listeners = new Set<() => void>();

  constructor(private getState: () => GameState, private loadState: (json: string, from: CloudMeta) => void, private info: () => { city?: string; money?: number }) {}

  on(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { for (const fn of this.listeners) fn(); }
  private set(status: SyncStatus, error = '') { this.status = status; this.error = error; this.lastAt = lastSynced(); this.emit(); }

  /** Check the cloud when the app opens or comes back. `fresh` = this device just signed in. */
  async check(fresh = false) {
    if (!cloudUser() || this.busy) return;
    this.busy = true;
    this.set('checking');
    try {
      const meta = await cloudMeta();
      if (!meta) {
        this.busy = false;
        if (this.hasLocal) await this.upload(true); else this.set('ok');
        return;
      }
      if (!this.hasLocal) { await this.load(meta); return; }
      if (meta.savedAt === lastSynced()) { this.set('ok'); return; }
      // Another device saved since this one last synced.
      if (!fresh && lastSynced() > 0 && !isUnsynced()) { await this.load(meta); return; }
      this.conflict = meta;
      this.set('conflict');
    } catch (e) {
      this.set('error', (e as Error).message);
    } finally { this.busy = false; }
  }

  /** Upload this device's progress, unless another device has saved in the meantime. */
  async upload(force = false) {
    if (!cloudUser() || !this.hasLocal || this.busy || this.status === 'conflict') return;
    this.busy = true;
    markUnsynced(true);
    this.set('syncing');
    try {
      const meta = await cloudMeta();
      if (meta && !force && meta.savedAt !== lastSynced()) { this.conflict = meta; this.set('conflict'); return; }
      await uploadSave(JSON.stringify(this.getState()), this.info(), meta);
      markUnsynced(false);
      this.set('ok');
    } catch (e) {
      this.set('error', (e as Error).message);
    } finally { this.busy = false; }
  }

  private async load(meta: CloudMeta) {
    this.set('syncing');
    const json = await downloadSave(meta);
    setLastSynced(meta.savedAt);
    markUnsynced(false);
    this.conflict = null;
    this.loadState(json, meta);
    this.set('ok');
  }

  /** The player chose which save to keep. */
  async resolve(keep: 'cloud' | 'device') {
    const meta = this.conflict;
    if (!meta) return;
    this.busy = true;
    try {
      if (keep === 'cloud') await this.load(meta);
      else { this.conflict = null; this.status = 'syncing'; this.busy = false; await this.upload(true); }
    } catch (e) { this.set('error', (e as Error).message); } finally { this.busy = false; }
  }

  signedOut() { this.conflict = null; markUnsynced(false); this.set('off'); }
}
