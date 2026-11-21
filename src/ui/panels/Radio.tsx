import { useState } from 'react';
import type { RadioKind, RadioMsg } from '../../engine/types';
import { Header, useCtx } from '../common';

const KIND: Record<RadioKind, { label: string; color: string }> = {
  call: { label: 'New call', color: '#e5484d' },
  dispatch: { label: 'Responding', color: '#f5a524' },
  onscene: { label: 'On scene', color: '#3b82f6' },
  patient: { label: 'Patient', color: '#e879f9' },
  transport: { label: 'Transport', color: '#a78bfa' },
  clear: { label: 'Clear', color: '#30a46c' },
  available: { label: 'Available', color: '#30a46c' },
  done: { label: 'Complete', color: '#30a46c' },
  alert: { label: 'Alert', color: '#e5484d' },
};

const VIEWS: [string, string, RadioKind[] | null][] = [
  ['all', 'All', null],
  ['units', 'Units', ['dispatch', 'onscene', 'clear', 'available']],
  ['calls', 'Calls', ['call', 'done', 'alert']],
  ['ems', 'Patients', ['patient', 'transport']],
];

const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });

export function RadioPanel() {
  const { game, push } = useCtx();
  const [view, setView] = useState('all');
  const kinds = VIEWS.find(v => v[0] === view)?.[2];
  const log: RadioMsg[] = game.radioLog().filter(m => !kinds || kinds.includes(m.kind));
  const open = (m: RadioMsg) => {
    if (m.incidentId && game.incident(m.incidentId)) push({ kind: 'incident', id: m.incidentId });
    else if (m.vehicleId && game.vehicle(m.vehicleId)) push({ kind: 'vehicle', id: m.vehicleId });
  };

  return (
    <div>
      <Header title="Radio" sub="Live traffic from dispatch and your units" />
      <div className="seg">
        {VIEWS.map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)} data-testid={`radio-${k}`}>{l}</button>)}
      </div>
      {!log.length && <p className="muted" style={{ marginTop: 16 }}>Quiet on the radio. Messages appear here as calls come in and units respond.</p>}
      <div className="radio-log" data-testid="radio-log">
        {log.map((m, i) => {
          const k = KIND[m.kind];
          const live = (m.incidentId && game.incident(m.incidentId)) || (m.vehicleId && game.vehicle(m.vehicleId));
          return (
            <button key={`${m.at}-${i}`} className={`radio-msg ${live ? '' : 'static'}`} onClick={() => open(m)} data-testid="radio-msg" data-kind={m.kind}>
              <span className="radio-bar" style={{ background: k.color }} />
              <div className="grow">
                <div className="radio-top"><span className="radio-kind" style={{ color: k.color }}>{k.label}</span><span className="muted small">{time(m.at)}</span></div>
                <div className="radio-text">{m.unit && <b>{m.unit} </b>}{m.text}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
