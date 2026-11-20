import { useState } from 'react';
import { cloudUser, resetPassword, signIn, signOut, signUp, type CloudMeta } from '../services/cloud';
import type { CloudSync } from '../services/cloudSync';
import { money } from './format';

const when = (t: number) => {
  if (!t) return 'never';
  const d = new Date(t);
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const STATUS: Record<string, string> = {
  off: 'Not signed in', checking: 'Checking…', syncing: 'Saving…', ok: 'Up to date', error: 'Sync problem', conflict: 'Choose which save to keep',
};

/** Sign in / account box for cloud save. Used in Settings and on the first-run city picker. */
export function CloudAccount({ cloud, compact }: { cloud: CloudSync; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const user = cloudUser();

  const run = async (fn: () => Promise<unknown>, after?: () => void) => {
    setBusy(true); setErr(''); setMsg('');
    try { await fn(); after?.(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  if (user) {
    return (
      <div className="cloud" data-testid="cloud-account">
        <div className="kv"><span>Signed in as</span><b>{user.email}</b></div>
        <div className="kv"><span>Status</span><b className={cloud.status === 'error' ? 'bad' : cloud.status === 'ok' ? 'ok' : ''}>{STATUS[cloud.status]}</b></div>
        <div className="kv"><span>Last synced</span><b>{when(cloud.lastAt)}</b></div>
        {cloud.error && <div className="warnbox">{cloud.error}</div>}
        <div className="actions wrap">
          <button className="btn primary small" disabled={cloud.status === 'syncing' || cloud.status === 'checking'} onClick={() => cloud.upload()} data-testid="cloud-sync">Sync now</button>
          <button className="btn ghost small" onClick={() => { signOut(); cloud.signedOut(); }} data-testid="cloud-signout">Sign out</button>
        </div>
        <p className="hint">Progress uploads about once a minute and when you leave the app. Opening the game on another device signed in to this account loads the newest save.</p>
      </div>
    );
  }

  return (
    <form className="cloud" onSubmit={(e: Event) => { e.preventDefault(); run(() => signIn(email, password), () => cloud.check(true)); }} data-testid="cloud-form">
      {!compact && <p className="hint">Sign in on each device with the same email to keep one save across your phone, tablet and computer.</p>}
      <div className="field"><label>Email</label>
        <input className="text" type="email" autoComplete="email" autoCapitalize="off" value={email} onChange={(e: any) => setEmail(e.target.value)} data-testid="cloud-email" /></div>
      <div className="field"><label>Password</label>
        <input className="text" type="password" autoComplete="current-password" value={password} onChange={(e: any) => setPassword(e.target.value)} data-testid="cloud-password" /></div>
      {err && <div className="warnbox">{err}</div>}
      {msg && <p className="hint ok">{msg}</p>}
      <div className="actions wrap">
        <button className="btn primary small" disabled={busy || !email || !password} data-testid="cloud-signin">Sign in</button>
        <button type="button" className="btn small" disabled={busy || !email || password.length < 6}
          onClick={() => run(() => signUp(email, password), () => cloud.check(true))} data-testid="cloud-signup">Create account</button>
        <button type="button" className="btn ghost small" disabled={busy || !email}
          onClick={() => run(() => resetPassword(email), () => setMsg('Password reset email sent.'))}>Forgot password</button>
      </div>
      {!compact && <p className="hint">New here? Enter an email and a password (6+ characters) and tap Create account.</p>}
    </form>
  );
}

/** Shown when this device and the cloud both have progress the other doesn't. */
export function CloudConflict({ meta, onPick }: { meta: CloudMeta; onPick(k: 'cloud' | 'device'): void }) {
  return (
    <div className="modal-backdrop" style={{ position: 'fixed', zIndex: 5000 }}>
      <div className="modal" data-testid="cloud-conflict">
        <h2>Which save do you want?</h2>
        <p>Another device saved progress to your account.</p>
        <button className="btn primary big" onClick={() => onPick('cloud')} data-testid="cloud-keep-cloud">
          Load cloud save<small>{meta.device || 'Other device'} · {when(meta.savedAt)}{meta.city ? ` · ${meta.city}` : ''}{meta.money != null ? ` · ${money(meta.money)}` : ''}</small>
        </button>
        <button className="btn big" onClick={() => onPick('device')} data-testid="cloud-keep-device">
          Keep this device's progress<small>Replaces the cloud save</small>
        </button>
      </div>
    </div>
  );
}
