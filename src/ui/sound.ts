// Tiny synthesized alert tones (no audio files). iOS only allows audio after a
// user gesture, so the context is created on the first tap.
let ctx: AudioContext | null = null;

export function unlockAudio() {
  if (ctx) return;
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AC) ctx = new AC();
  } catch { ctx = null; }
}

function tone(freq: number, start: number, len: number, vol = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + len);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + len + 0.05);
}

export function playAlert(kind: 'call' | 'major' | 'good' | 'bad') {
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  if (kind === 'call') { tone(880, 0, 0.18); tone(1175, 0.2, 0.22); }
  else if (kind === 'major') { for (let i = 0; i < 3; i++) { tone(660, i * 0.32, 0.14, 0.16); tone(990, i * 0.32 + 0.15, 0.14, 0.16); } }
  else if (kind === 'good') { tone(784, 0, 0.12, 0.08); tone(1047, 0.12, 0.2, 0.08); }
  else { tone(330, 0, 0.3, 0.1); }
}
