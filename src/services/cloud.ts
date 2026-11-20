// Cloud save with Firebase (Email/Password auth + Firestore), using the REST APIs
// so no SDK is needed. Each player's save lives at saves/{uid} (metadata) with the
// compressed save split across saves/{uid}/chunks/c0, c1, ...

const CONFIG = {
  apiKey: 'AIzaSyAsqiMPcmCJY52bFYHPAKTt4j3t6OsaDRo',
  projectId: 'first-responders-78c42',
};

const AUTH = 'https://identitytoolkit.googleapis.com/v1/accounts';
const TOKEN = 'https://securetoken.googleapis.com/v1/token';
const DOCS = `https://firestore.googleapis.com/v1/projects/${CONFIG.projectId}/databases/(default)/documents`;
const DOC_NAME = `projects/${CONFIG.projectId}/databases/(default)/documents`;
const CHUNK = 700_000;
const KEY = 'fr-cloud';

export interface CloudUser { uid: string; email: string; refreshToken: string; idToken?: string; expiresAt?: number }
export interface CloudMeta { savedAt: number; device: string; chunks: number; encoding: string; city?: string; money?: number }

interface Stored { user?: CloudUser; syncedAt?: number }

function read(): Stored { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function write(s: Stored) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }

export function cloudUser(): CloudUser | null { return read().user ?? null; }
/** The cloud save time this device last uploaded or downloaded. */
export function lastSynced(): number { return read().syncedAt ?? 0; }
export function setLastSynced(t: number) { const s = read(); s.syncedAt = t; write(s); }
export function signOut() { write({}); }

export function deviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Macintosh/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows PC';
  return 'Browser';
}

const MESSAGES: Record<string, string> = {
  EMAIL_EXISTS: 'That email already has an account. Sign in instead.',
  EMAIL_NOT_FOUND: 'No account with that email. Create one first.',
  INVALID_PASSWORD: 'Wrong password.',
  INVALID_LOGIN_CREDENTIALS: 'Wrong email or password.',
  INVALID_EMAIL: 'That email address is not valid.',
  WEAK_PASSWORD: 'Password must be at least 6 characters.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Try again in a few minutes.',
  USER_DISABLED: 'This account has been disabled.',
  OPERATION_NOT_ALLOWED: 'Email sign-in is not turned on in Firebase (Authentication → Sign-in method).',
  PERMISSION_DENIED: 'Firebase refused access. Check the Firestore rules.',
};

async function call(url: string, init: RequestInit): Promise<any> {
  let res: Response;
  try { res = await fetch(url, init); } catch { throw new Error('No connection to the cloud. Check your internet.'); }
  const body = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw: string = body?.error?.message || body?.error?.status || `HTTP ${res.status}`;
    const code = raw.split(' ')[0].split(':')[0];
    const err = new Error(MESSAGES[code] ?? MESSAGES[body?.error?.status] ?? raw) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return body;
}

async function authWith(kind: 'signUp' | 'signInWithPassword', email: string, password: string): Promise<CloudUser> {
  const r = await call(`${AUTH}:${kind}?key=${CONFIG.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
  });
  const user: CloudUser = { uid: r.localId, email: r.email, refreshToken: r.refreshToken, idToken: r.idToken, expiresAt: Date.now() + (Number(r.expiresIn) - 60) * 1000 };
  write({ user, syncedAt: 0 });
  return user;
}
export const signUp = (e: string, p: string) => authWith('signUp', e, p);
export const signIn = (e: string, p: string) => authWith('signInWithPassword', e, p);

export async function resetPassword(email: string) {
  await call(`${AUTH}:sendOobCode?key=${CONFIG.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType: 'PASSWORD_RESET', email: email.trim() }),
  });
}

async function token(): Promise<CloudUser> {
  const s = read();
  const u = s.user;
  if (!u) throw new Error('Not signed in.');
  if (u.idToken && u.expiresAt && Date.now() < u.expiresAt) return u;
  const r = await call(`${TOKEN}?key=${CONFIG.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(u.refreshToken)}`,
  });
  u.idToken = r.id_token; u.refreshToken = r.refresh_token; u.expiresAt = Date.now() + (Number(r.expires_in) - 60) * 1000;
  s.user = u; write(s);
  return u;
}

// ------------------------------------------------------------ encoding
async function pack(json: string): Promise<{ data: string; encoding: string }> {
  const CS = (globalThis as any).CompressionStream;
  if (!CS) return { data: json, encoding: 'json' };
  const stream = new Blob([json]).stream().pipeThrough(new CS('gzip'));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000) as any);
  return { data: btoa(bin), encoding: 'gzip-b64' };
}
async function unpack(data: string, encoding: string): Promise<string> {
  if (encoding === 'json') return data;
  const DS = (globalThis as any).DecompressionStream;
  if (!DS) throw new Error('This browser cannot open compressed cloud saves. Update it and try again.');
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(new Blob([bytes]).stream().pipeThrough(new DS('gzip'))).text();
}

// ------------------------------------------------------------ firestore
const str = (v: string) => ({ stringValue: v });
const int = (v: number) => ({ integerValue: String(Math.round(v)) });

function parseMeta(doc: any): CloudMeta | null {
  const f = doc?.fields;
  if (!f) return null;
  return {
    savedAt: Number(f.savedAt?.integerValue ?? 0), device: f.device?.stringValue ?? '', chunks: Number(f.chunks?.integerValue ?? 0),
    encoding: f.encoding?.stringValue ?? 'json', city: f.city?.stringValue, money: f.money ? Number(f.money.integerValue) : undefined,
  };
}

/** The cloud save's metadata, or null if this account has no save yet. */
export async function cloudMeta(): Promise<CloudMeta | null> {
  const u = await token();
  try {
    return parseMeta(await call(`${DOCS}/saves/${u.uid}`, { headers: { Authorization: `Bearer ${u.idToken}` } }));
  } catch (e: any) { if (e.status === 404) return null; throw e; }
}

export async function uploadSave(json: string, info: { city?: string; money?: number }, prev: CloudMeta | null): Promise<CloudMeta> {
  const u = await token();
  const { data, encoding } = await pack(json);
  const parts: string[] = [];
  for (let i = 0; i < data.length; i += CHUNK) parts.push(data.slice(i, i + CHUNK));
  const meta: CloudMeta = { savedAt: Date.now(), device: deviceName(), chunks: parts.length, encoding, city: info.city, money: info.money };
  const base = `${DOC_NAME}/saves/${u.uid}`;
  const writes: any[] = parts.map((p, i) => ({ update: { name: `${base}/chunks/c${i}`, fields: { data: str(p) } } }));
  for (let i = parts.length; i < (prev?.chunks ?? 0); i++) writes.push({ delete: `${base}/chunks/c${i}` });
  const fields: any = { savedAt: int(meta.savedAt), device: str(meta.device), chunks: int(meta.chunks), encoding: str(encoding) };
  if (info.city) fields.city = str(info.city);
  if (info.money != null) fields.money = int(info.money);
  writes.push({ update: { name: base, fields } });
  await call(`${DOCS}:commit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${u.idToken}` },
    body: JSON.stringify({ writes }),
  });
  setLastSynced(meta.savedAt);
  return meta;
}

export async function downloadSave(meta: CloudMeta): Promise<string> {
  const u = await token();
  const parts: string[] = [];
  for (let i = 0; i < meta.chunks; i++) {
    const d = await call(`${DOCS}/saves/${u.uid}/chunks/c${i}`, { headers: { Authorization: `Bearer ${u.idToken}` } });
    parts.push(d?.fields?.data?.stringValue ?? '');
  }
  return unpack(parts.join(''), meta.encoding);
}
