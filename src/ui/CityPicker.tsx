import { useState } from 'react';
import type { CityDef } from '../engine/types';
import { CITIES } from '../data/cities';
import { buildCity, searchCities, type CityResult } from '../services/geocode';

interface Props {
  title: string;
  subtitle: string;
  existingIds: string[];
  onPick(def: CityDef): void;
  onCancel?: () => void;
}

const SUGGESTIONS = ['Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Charlotte, NC', 'Denver, CO', 'Seattle, WA', 'Miami, FL', 'Nashville, TN'];

export function CityPicker(p: Props) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null as CityResult[] | null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const search = async (text: string) => {
    if (!text.trim()) return;
    setQ(text); setBusy('Searching…'); setError(''); setResults(null);
    try {
      const r = await searchCities(text);
      setResults(r);
      if (!r.length) setError('No US city found. Try "City, ST", e.g. "Tulsa, OK".');
    } catch {
      setError('City search is unavailable right now. Check your connection and try again.');
    } finally { setBusy(''); }
  };

  const choose = async (r: CityResult) => {
    setBusy(`Mapping ${r.label} — finding neighborhoods…`); setError('');
    try {
      const def = await buildCity(r, p.existingIds);
      p.onPick(def);
    } catch {
      setError('Could not prepare that city. Try again.');
      setBusy('');
    }
  };

  const atlanta = CITIES[0];
  return (
    <div className="picker">
      <div className="picker-card">
        <div className="picker-brand">EMERGENCY OPERATIONS</div>
        <h1>{p.title}</h1>
        <p className="muted">{p.subtitle}</p>
        <form onSubmit={(e: Event) => { e.preventDefault(); search(q); }} className="picker-search">
          <input className="text" placeholder="City, State — e.g. Tulsa, OK" value={q} onChange={(e: any) => setQ(e.target.value)}
            autoCapitalize="words" autoCorrect="off" enterKeyHint="search" disabled={!!busy} data-testid="city-search" />
          <button className="btn primary" disabled={!!busy || !q.trim()}>Search</button>
        </form>
        {busy && <div className="picker-busy"><span className="spinner" />{busy}</div>}
        {error && <div className="warnbox">{error}</div>}
        {results && results.length > 0 && !busy && (
          <div className="list">
            {results.map((r: CityResult) => (
              <button key={r.label + r.center} className="row" onClick={() => choose(r)} data-testid="city-result">
                <div className="grow"><div className="row-title">{r.label}</div><div className="row-sub">{r.stateName}</div></div>
                <span className="muted">›</span>
              </button>
            ))}
          </div>
        )}
        {!results && !busy && (
          <>
            {!p.existingIds.includes(atlanta.id) && (
              <button className="row" onClick={() => p.onPick(atlanta)} data-testid="city-atlanta">
                <div className="grow"><div className="row-title">{atlanta.name}, {atlanta.state}</div><div className="row-sub">Preset city · {atlanta.districts.length} neighborhoods</div></div>
                <span className="muted">›</span>
              </button>
            )}
            <div className="picker-sugg">
              {SUGGESTIONS.map(s => <button key={s} className="fchip" onClick={() => search(s)}>{s}</button>)}
            </div>
          </>
        )}
        {p.onCancel && !busy && <button className="btn ghost picker-cancel" onClick={p.onCancel}>Cancel</button>}
        <p className="hint">City search © OpenStreetMap contributors (Nominatim, Overpass).</p>
      </div>
    </div>
  );
}
