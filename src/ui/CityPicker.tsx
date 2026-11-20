import { useState } from 'react';
import type { CityDef } from '../engine/types';
import { CITIES } from '../data/cities';
import { US_STATES, buildCity, searchCityState, type CityResult } from '../services/geocode';

interface Props {
  title: string;
  subtitle: string;
  existingIds: string[];
  onPick(def: CityDef): void;
  onCancel?: () => void;
  /** Optional extra block (cloud sign-in on first run). */
  footer?: any;
}

const QUICK: [string, string][] = [['Atlanta', 'Georgia'], ['Chicago', 'Illinois'], ['Houston', 'Texas'], ['Phoenix', 'Arizona'],
  ['Charlotte', 'North Carolina'], ['Denver', 'Colorado'], ['Seattle', 'Washington'], ['Miami', 'Florida']];

export function CityPicker(p: Props) {
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [results, setResults] = useState(null as CityResult[] | null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const choose = async (r: CityResult) => {
    setBusy(`Mapping ${r.label} — finding neighborhoods and hospitals…`); setError('');
    try {
      p.onPick(await buildCity(r, p.existingIds));
    } catch {
      setError('Could not prepare that city. Try again.');
      setBusy('');
    }
  };

  const search = async (city: string, state: string) => {
    if (!city.trim() || !state) return;
    // Atlanta has a hand-made preset with real hospitals and neighborhoods.
    const atl = CITIES[0];
    if (city.trim().toLowerCase() === 'atlanta' && state === 'Georgia' && !p.existingIds.includes(atl.id)) { p.onPick(atl); return; }
    setBusy('Searching…'); setError(''); setResults(null);
    try {
      const r = await searchCityState(city, state);
      if (r.length === 1) { await choose(r[0]); return; }
      setResults(r);
      if (!r.length) setError(`Couldn't find "${city}" in ${state}. Check the spelling, or try a nearby larger city.`);
      setBusy('');
    } catch {
      setError('City search is unavailable right now. Check your connection and try again.');
      setBusy('');
    }
  };

  return (
    <div className="picker">
      <div className="picker-card">
        <div className="brand">First <span>Responders</span></div>
        <h1>{p.title}</h1>
        <p className="muted">{p.subtitle}</p>
        <form className="picker-form" onSubmit={(e: Event) => { e.preventDefault(); search(cityName, stateName); }}>
          <div className="field"><label>City</label>
            <input className="text" placeholder="e.g. Tulsa" value={cityName} onChange={(e: any) => setCityName(e.target.value)}
              autoCapitalize="words" autoCorrect="off" disabled={!!busy} data-testid="city-name" /></div>
          <div className="field"><label>State</label>
            <select value={stateName} onChange={(e: any) => setStateName(e.target.value)} disabled={!!busy} data-testid="city-state">
              <option value="">Choose a state…</option>
              {US_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select></div>
          <button className="btn primary big" disabled={!!busy || !cityName.trim() || !stateName} data-testid="city-go">Start here</button>
        </form>
        {busy && <div className="picker-busy"><span className="spinner" />{busy}</div>}
        {error && <div className="warnbox">{error}</div>}
        {results && results.length > 1 && !busy && (
          <>
            <p className="muted small">Several matches — pick one:</p>
            <div className="list">
              {results.map((r: CityResult) => (
                <button key={r.label + r.center} className="row" onClick={() => choose(r)} data-testid="city-result">
                  <div className="grow"><div className="row-title">{r.label}</div><div className="row-sub">{r.stateName}</div></div>
                  <span className="muted">›</span>
                </button>
              ))}
            </div>
          </>
        )}
        {!busy && (
          <>
            <p className="muted small">Popular picks</p>
            <div className="picker-sugg">
              {QUICK.map(([c, s]) => <button key={c} className="fchip" onClick={() => { setCityName(c); setStateName(s); search(c, s); }}>{c}, {US_STATES.find(x => x.name === s)?.code}</button>)}
            </div>
          </>
        )}
        {p.footer && !busy && p.footer}
        {p.onCancel && !busy && <button className="btn ghost picker-cancel" onClick={p.onCancel}>Back</button>}
        <p className="hint">City search © OpenStreetMap contributors (Nominatim, Overpass).</p>
      </div>
    </div>
  );
}
