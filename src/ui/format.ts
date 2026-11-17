import type { IncidentStatus, Outcome, VehicleStatus } from '../engine/types';

export const money = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
export const moneyShort = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`;
  if (a >= 1e4) return `${s}$${(a / 1e3).toFixed(1)}k`;
  return `${s}$${Math.round(a).toLocaleString('en-US')}`;
};

export function clock(t: number) {
  const day = Math.floor(t / 86400) + 1;
  const s = t % 86400;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return { day, hm: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
}

export function dur(sec: number) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const km = (m: number) => `${(m / 1000).toFixed(1)} km`;

export const VEHICLE_STATUS: Record<VehicleStatus, { label: string; tone: string }> = {
  available: { label: 'Available', tone: 'ok' },
  dispatched: { label: 'Dispatched', tone: 'warn' },
  enroute: { label: 'En route', tone: 'warn' },
  onscene: { label: 'On scene', tone: 'info' },
  returning: { label: 'Returning', tone: 'muted' },
  out_of_service: { label: 'Out of service', tone: 'bad' },
  maintenance: { label: 'Maintenance', tone: 'bad' },
};

export const INCIDENT_STATUS: Record<IncidentStatus, { label: string; tone: string }> = {
  pending: { label: 'Awaiting units', tone: 'bad' },
  responding: { label: 'Units responding', tone: 'warn' },
  onscene: { label: 'Units on scene', tone: 'info' },
  working: { label: 'Working', tone: 'ok' },
  resolved: { label: 'Closed', tone: 'muted' },
};

export const OUTCOME: Record<Outcome, { label: string; tone: string }> = {
  successful: { label: 'Successful', tone: 'ok' },
  delayed: { label: 'Delayed', tone: 'warn' },
  partial: { label: 'Partial success', tone: 'warn' },
  escalated: { label: 'Escalated', tone: 'warn' },
  failed: { label: 'Failed', tone: 'bad' },
};

export const SEVERITY = ['', 'Low', 'Moderate', 'Major'];

export const cap1 = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
