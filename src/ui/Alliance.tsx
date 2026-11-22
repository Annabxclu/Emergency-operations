import { useEffect, useState } from 'react';
import { allianceMembers, createAlliance, joinAlliance, leaveAlliance, playerName } from '../services/alliance';
import { cloudUser } from '../services/cloud';
import type { SharedCall } from '../engine/types';
import { Btn, useCtx } from './common';
import { money } from './format';

/** Settings → Alliance: create or join one, see members, leave. */
export function AlliancePanel() {
  const { game, toast } = useCtx();
  const a = game.state.alliance;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [me, setMe] = useState(playerName(game));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [members, setMembers] = useState([] as { id: string; name: string; city: string; lastSeen: number }[]);
  useEffect(() => { if (a) allianceMembers(a.id).then(setMembers).catch(() => undefined); }, [a?.id]);

  if (!cloudUser()) return <p className="hint">Sign in under <b>Cloud save</b> first. Every alliance member needs their own account.</p>;
  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setBusy(true); setErr('');
    try { await fn(); if (ok) toast(ok, 'ok'); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  if (a) {
    return (
      <div className="alliance" data-testid="alliance-info">
        <div className="kv"><span>Alliance</span><b>{a.name}</b></div>
        <div className="kv"><span>Invite code</span><b className="code" data-testid="alliance-code">{a.id}</b></div>
        <p className="hint">Friends join with this code (Settings → Alliance → Join). Share calls from the call screen, and share hospitals from each hospital's screen.</p>
        <div className="field"><label>Members</label>
          <div className="list">
            {members.map((m: { id: string; name: string; city: string }) => (
              <div key={m.id} className="row compact"><div className="grow"><div className="row-title">{m.name}</div><div className="row-sub">{m.city}</div></div></div>
            ))}
            {!members.length && <p className="muted small">Loading…</p>}
          </div></div>
        {err && <div className="warnbox">{err}</div>}
        <Btn small kind="ghost" disabled={busy} testid="alliance-leave" onClick={() => { if (confirm(`Leave ${a.name}? Your shared calls and hospitals stop being shared.`)) run(() => leaveAlliance(game), 'Left the alliance'); }}>Leave alliance</Btn>
      </div>
    );
  }

  return (
    <div className="alliance" data-testid="alliance-join">
      <div className="field"><label>Your name in the alliance</label>
        <input className="text" value={me} maxLength={24} onChange={(e: any) => setMe(e.target.value)} data-testid="alliance-me" /></div>
      <div className="field"><label>Join with an invite code</label>
        <div className="actions">
          <input className="text grow" value={code} maxLength={6} placeholder="ABC123" autoCapitalize="characters" onChange={(e: any) => setCode(e.target.value.toUpperCase())} data-testid="alliance-code-input" />
          <Btn small kind="primary" disabled={busy || code.length < 6 || !me.trim()} testid="alliance-join-btn" onClick={() => run(() => joinAlliance(game, code, me.trim()), 'Joined the alliance')}>Join</Btn>
        </div></div>
      <div className="field"><label>…or start a new alliance</label>
        <div className="actions">
          <input className="text grow" value={name} maxLength={40} placeholder="Alliance name" onChange={(e: any) => setName(e.target.value)} data-testid="alliance-name" />
          <Btn small disabled={busy || !name.trim() || !me.trim()} testid="alliance-create" onClick={() => run(() => createAlliance(game, name, me.trim()), 'Alliance created')}>Create</Btn>
        </div></div>
      {err && <div className="warnbox">{err}</div>}
    </div>
  );
}

/** Dispatch → 🤝 view: calls alliance members shared near your stations. */
export function AllianceCalls() {
  const { game, ally, act, push } = useCtx();
  const list: SharedCall[] = ally?.calls ?? [];
  if (!game.state.alliance) return <p className="muted" style={{ marginTop: 12 }}>Join an alliance in Settings → Alliance to see calls your friends share.</p>;
  if (!list.length) return <p className="muted" style={{ marginTop: 12 }}>No shared calls near your stations right now.</p>;
  return (
    <div className="list" data-testid="alliance-calls">
      {list.map(sc => {
        const helping = Object.values(sc.helpers).filter(h => h.units.length).length;
        return (
          <div key={sc.id} className="row" data-testid="alliance-call">
            <div className="grow">
              <div className="row-title">{sc.name} <span className="tag info">🤝 {sc.ownerName}</span></div>
              <div className="row-sub">{sc.address} · {sc.district}</div>
              <div className="row-sub">{sc.requirements.map(r => `${r.count}× ${r.cap.replace(/_/g, ' ')}`).join(', ')}{helping ? ` · ${helping} helping` : ''}</div>
            </div>
            <div className="row-right">
              <div className="row-credits">{money(sc.reward)}</div>
              <Btn small kind="primary" testid="alliance-call-join" onClick={() => { let id = ''; if (act(() => { id = game.joinSharedCall(sc).id; })) { ally!.calls = ally!.calls.filter(c => c.id !== sc.id); push({ kind: 'incident', id }); } }}>Join</Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}
