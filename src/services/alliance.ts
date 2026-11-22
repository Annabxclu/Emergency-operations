// Alliances: friends' games share calls and hospitals through Firestore (REST, no SDK).
//
// alliances/{code}                 name, owner, ownerName
//   members/{uid}                  name, city, lat, lng, lastSeen
//   calls/{id}                     a shared call (owner's game decides when it's done)
//   hospitals/{uid_hid}            a shared hospital: free beds, specialties, fee %
//   payouts/{auto}                 admission cut + beds for a hospital owner (they collect and delete it)

import type { Game } from '../engine/game';
import type { AllyHospital, AllyUnit, LatLng, Requirement, SharedCall } from '../engine/types';
import { distanceM } from '../engine/geo';
import { authed, call, cloudUser, DOCS } from './cloud';

// ------------------------------------------------------------------ Firestore values
type Val = string | number | boolean | null | Val[] | { [k: string]: Val };
function enc(v: Val): any {
  if (v === null) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
}
function dec(v: any): any {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(dec);
  if ('mapValue' in v) return decFields(v.mapValue.fields ?? {});
  return null;
}
const decFields = (f: Record<string, any>) => Object.fromEntries(Object.entries(f).map(([k, x]) => [k, dec(x)]));
const fields = (o: Record<string, Val>) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, enc(x)]));

async function req(method: string, path: string, body?: any, query = '') {
  const u = await authed();
  return call(`${DOCS}/${path}${query}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${u.idToken}` },
    body: body ? JSON.stringify(body) : undefined,
  });
}
const getDoc = async (path: string): Promise<any> => { try { const d = await req('GET', path); return { id: d.name.split('/').pop(), ...decFields(d.fields ?? {}) }; } catch (e: any) { if (e.status === 404) return null; throw e; } };
const setDoc = (path: string, o: Record<string, Val>, mask?: string[]) =>
  req('PATCH', path, { fields: fields(o) }, mask ? `?${mask.map(m => `updateMask.fieldPaths=${encodeURIComponent(m)}`).join('&')}` : '');
const delDoc = (path: string) => req('DELETE', path).catch(() => undefined);
async function listDocs(path: string): Promise<any[]> {
  const out: any[] = [];
  let token = '';
  for (let i = 0; i < 5; i++) {
    const r = await req('GET', path, undefined, `?pageSize=300${token ? `&pageToken=${token}` : ''}`);
    for (const d of r.documents ?? []) out.push({ id: d.name.split('/').pop(), ...decFields(d.fields ?? {}) });
    if (!r.nextPageToken) break;
    token = r.nextPageToken;
  }
  return out;
}

// ------------------------------------------------------------------ joining
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export function playerName(game: Game) {
  return game.state.alliance?.me || (cloudUser()?.email ?? 'Player').split('@')[0];
}

async function writeMember(game: Game, aid: string, name: string) {
  const u = await authed();
  await setDoc(`alliances/${aid}/members/${u.uid}`, { name, city: game.cityDef.name, lat: game.cityDef.center[0], lng: game.cityDef.center[1], lastSeen: Date.now() });
}

export async function createAlliance(game: Game, name: string, me: string) {
  const u = await authed();
  const n = name.trim().slice(0, 40);
  if (!n) throw new Error('Give your alliance a name.');
  for (let i = 0; i < 5; i++) {
    const code = newCode();
    if (await getDoc(`alliances/${code}`)) continue;
    await req('PATCH', `alliances/${code}`, { fields: fields({ name: n, owner: u.uid, ownerName: me, createdAt: Date.now() }) }, '?currentDocument.exists=false');
    await writeMember(game, code, me);
    game.state.alliance = { id: code, name: n, me };
    game.changed();
    return code;
  }
  throw new Error('Could not create the alliance. Try again.');
}

export async function joinAlliance(game: Game, code: string, me: string) {
  const id = code.trim().toUpperCase();
  const a = await getDoc(`alliances/${id}`);
  if (!a) throw new Error('No alliance with that code.');
  await writeMember(game, id, me);
  game.state.alliance = { id, name: a.name, me };
  game.changed();
}

export async function leaveAlliance(game: Game) {
  const a = game.state.alliance;
  if (!a) return;
  const u = await authed();
  for (const h of game.city.hospitals ?? []) if (h.allianceFee != null) await delDoc(`alliances/${a.id}/hospitals/${u.uid}_${h.id}`);
  for (const inc of game.city.incidents) {
    if (inc.sharedId) await setDoc(`alliances/${a.id}/calls/${inc.sharedId}`, { status: 'cancelled' }, ['status']).catch(() => undefined);
    if (inc.mirror) game.resolveMirror(inc.mirror.callId, false);
    inc.sharedId = undefined;
  }
  await delDoc(`alliances/${a.id}/members/${u.uid}`);
  game.state.alliance = null;
  game.alliance.remote.clear();
  game.alliance.hospitals = [];
  game.changed();
}

export async function allianceMembers(aid: string) {
  return (await listDocs(`alliances/${aid}/members`)) as { id: string; name: string; city: string; lastSeen: number }[];
}

// ------------------------------------------------------------------ live sync
export const REACH_M = 48_000; // shared calls within ~30 miles of one of your stations

export class AllianceSync {
  /** Open calls other members shared that are near your stations (not joined yet). */
  calls: SharedCall[] = [];
  /** Members who joined each of your shared calls (by your incident id). */
  helpers = new Map<string, { name: string; units: number }[]>();
  error = '';
  private tickN = 0;
  private busy = false;
  private published = new Map<string, string>(); // doc path -> last json written
  private listeners = new Set<() => void>();

  constructor(private game: Game) {
    game.alliance.admit = (h, count, cut) => { this.sendPayout(h, count, cut).catch(() => undefined); };
  }
  on(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { for (const fn of this.listeners) fn(); }

  private async sendPayout(h: AllyHospital, count: number, cut: number) {
    const a = this.game.state.alliance;
    if (!a) return;
    await req('POST', `alliances/${a.id}/payouts`, { fields: fields({ to: h.owner, hid: h.hid, count, amount: cut, fromName: playerName(this.game), at: Date.now() }) });
  }

  private async write(path: string, o: Record<string, Val>, mask?: string[], key = path) {
    const json = JSON.stringify(o);
    if (this.published.get(key) === json) return;
    await setDoc(path, o, mask);
    this.published.set(key, json);
  }

  /** Called every ~15 s while the game is open. */
  async poll() {
    const g = this.game, a = g.state.alliance;
    if (!a || !cloudUser()) { this.calls = []; g.alliance.remote.clear(); g.alliance.hospitals = []; g.alliance.units = []; return; }
    if (this.busy) return;
    this.busy = true;
    const n = this.tickN++;
    try {
      const u = await authed();
      const me = playerName(g);
      const base = `alliances/${a.id}`;
      if (n % 20 === 0) await writeMember(g, a.id, me);

      // ---- units on the road: publish mine, read everyone else's (kept in the member docs)
      await this.write(`${base}/members/${u.uid}`, { units: JSON.stringify(g.unitsForAlliance()), unitsAt: Date.now() }, ['units', 'unitsAt'], `${base}/members/${u.uid}#units`).catch(() => undefined);
      const mem = await listDocs(`${base}/members`);
      const now = Date.now();
      const units: AllyUnit[] = [];
      // Only show members' units on shared calls you're part of (your shared calls, or ones you joined).
      const mine = new Set(g.city.incidents.flatMap(i => [i.sharedId, i.mirror?.callId]).filter(Boolean) as string[]);
      for (const m of mem) {
        if (m.id === u.uid || !m.units || now - (m.unitsAt ?? 0) > 3 * 60_000) continue;
        let list: any[] = [];
        try { list = JSON.parse(m.units); } catch { list = []; }
        const age = Math.max(0, now - (m.unitsAt ?? now));
        for (const x of list) {
          if (!x.sc || !mine.has(x.sc)) continue;
          units.push({ key: `${m.id}:${x.id}`, owner: m.id, ownerName: m.name ?? 'Ally', typeId: x.t, name: x.n, status: x.s,
            from: x.p, to: x.d, t0: now - Math.min(age, x.ms ?? 0), durMs: x.ms ?? 0 });
        }
      }
      g.alliance.units = units;

      // ---- calls
      const docs = await listDocs(`${base}/calls`);
      const byId = new Map(docs.map(d => [d.id, d]));
      // My shared calls: publish new ones, close finished ones, read members' units on scene.
      g.alliance.remote.clear();
      for (const inc of g.city.incidents.filter(i => i.sharedId)) {
        const id = inc.sharedId!;
        if (!byId.has(id) && !this.published.has(`${base}/calls/${id}`)) {
          await this.write(`${base}/calls/${id}`, {
            owner: u.uid, ownerName: me, incId: inc.id, typeId: inc.typeId, name: inc.name, lat: inc.pos[0], lng: inc.pos[1],
            address: inc.address, district: inc.district, reqs: JSON.stringify(inc.requirements), reward: inc.reward, status: 'open', createdAt: Date.now(),
          });
        }
        const d = byId.get(id);
        const units: string[] = [];
        const who: { name: string; units: number }[] = [];
        for (const [, hv] of Object.entries((d?.helpers ?? {}) as Record<string, string>)) {
          try { const h = JSON.parse(hv); units.push(...(h.units ?? [])); who.push({ name: h.name, units: (h.units ?? []).length }); } catch { /* ignore */ }
        }
        if (units.length) g.alliance.remote.set(inc.id, units);
        this.helpers.set(inc.id, who);
      }
      for (const inc of g.city.resolved.filter(i => i.sharedId && !i.sharedClosed)) {
        await setDoc(`${base}/calls/${inc.sharedId}`, { status: 'done', paid: inc.outcome !== 'failed', closedAt: Date.now() }, ['status', 'paid', 'closedAt']);
        inc.sharedClosed = true;
      }
      // Tidy up my old finished calls (kept a day so helpers' games can see the result).
      for (const d of docs) if (d.owner === u.uid && d.status !== 'open' && Date.now() - (d.closedAt ?? d.createdAt ?? 0) > 24 * 3600e3) await delDoc(`${base}/calls/${d.id}`);

      // Calls I joined: report my units on scene; finish when the owner does.
      for (const inc of g.city.incidents.filter(i => i.mirror)) {
        const d = byId.get(inc.mirror!.callId);
        if (!d || d.status !== 'open') { g.resolveMirror(inc.mirror!.callId, !!d && d.status === 'done' && d.paid !== false); continue; }
        const units = g.incidentVehicles(inc.id).filter(v => v.status === 'onscene').map(v => v.typeId);
        await this.write(`${base}/calls/${d.id}`, { helpers: { [u.uid]: JSON.stringify({ name: me, units }) } }, [`helpers.\`${u.uid}\``], `${base}/calls/${d.id}#me`)
          .catch(() => { this.published.delete(`${base}/calls/${d.id}#me`); });
      }
      // Open calls from others near my stations.
      const joined = new Set(g.city.incidents.filter(i => i.mirror).map(i => i.mirror!.callId));
      const near = (p: LatLng) => g.city.stations.some(s => distanceM(s.pos, p) < REACH_M);
      this.calls = docs.filter(d => d.owner !== u.uid && d.status === 'open' && !joined.has(d.id)).map(d => toShared(d)).filter(c => near(c.pos));

      // ---- hospitals
      {
        const hs = await listDocs(`${base}/hospitals`);
        g.alliance.hospitals = hs.filter(h => h.owner !== u.uid).map(h => ({
          key: `ally:${h.owner}:${h.hid}`, owner: h.owner, ownerName: h.ownerName, hid: h.hid, name: h.name, pos: [h.lat, h.lng] as LatLng,
          freeBeds: h.freeBeds ?? 0, specialties: String(h.specialties || '').split(',').filter(Boolean), feePct: h.feePct ?? 0,
        }));
        const mine = new Set<string>();
        for (const h of g.city.hospitals ?? []) {
          if (h.allianceFee == null) continue;
          mine.add(`${u.uid}_${h.id}`);
          await this.write(`${base}/hospitals/${u.uid}_${h.id}`, {
            owner: u.uid, ownerName: me, hid: h.id, name: h.name, lat: h.pos[0], lng: h.pos[1],
            freeBeds: g.hospitalFreeBeds(h), specialties: h.specialties.join(','), feePct: h.allianceFee,
          });
        }
        for (const h of hs) if (h.owner === u.uid && !mine.has(h.id)) { await delDoc(`${base}/hospitals/${h.id}`); this.published.delete(`${base}/hospitals/${h.id}`); }
      }

      // ---- payouts for me
      const pays = (await listDocs(`${base}/payouts`)).filter(p => p.to === u.uid);
      for (const p of pays) {
        await delDoc(`${base}/payouts/${p.id}`);
        g.allianceAdmitted(p.hid, p.count ?? 1, p.amount ?? 0, p.fromName ?? 'An alliance member');
      }
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    } finally {
      this.busy = false;
      this.emit();
    }
  }
}

function toShared(d: any): SharedCall {
  let requirements: Requirement[] = [];
  try { requirements = JSON.parse(d.reqs); } catch { /* ignore */ }
  const helpers: SharedCall['helpers'] = {};
  for (const [k, v] of Object.entries((d.helpers ?? {}) as Record<string, string>)) { try { helpers[k] = JSON.parse(v); } catch { /* ignore */ } }
  return {
    id: d.id, owner: d.owner, ownerName: d.ownerName, typeId: d.typeId, name: d.name, pos: [d.lat, d.lng], address: d.address, district: d.district,
    requirements, reward: d.reward ?? 0, status: d.status, paid: d.paid, helpers,
  };
}

