import type { CityDef, DistrictDef, Facility, LatLng } from '../engine/types';

// City search uses OpenStreetMap's Nominatim; neighborhoods come from the
// Overpass API. Both are free and keyless, with light-use policies (about one
// request per second), which fits a one-off lookup when starting a city.

export interface CityResult {
  name: string;
  state: string;      // two-letter code when available
  stateName: string;
  label: string;
  center: LatLng;
  bbox: [number, number, number, number]; // s, n, w, e
}

const STATE_CODES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR',
  Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY', 'Puerto Rico': 'PR',
};

async function getJson(url: string, init?: RequestInit, timeoutMs = 12000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

export const US_STATES = Object.entries(STATE_CODES).map(([name, code]) => ({ name, code })).sort((a, b) => a.name.localeCompare(b.name));

/** Structured search: a city name within a specific state. */
export async function searchCityState(city: string, state: string): Promise<CityResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&country=USA&city=${encodeURIComponent(city.trim())}&state=${encodeURIComponent(state)}`;
  const structured = await searchUrl(url);
  return structured.length ? structured : searchCities(`${city}, ${state}`);
}

export async function searchCities(query: string): Promise<CityResult[]> {
  const q = encodeURIComponent(query.trim());
  return searchUrl(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=us&q=${q}`);
}

async function searchUrl(url: string): Promise<CityResult[]> {
  const rows: any[] = await getJson(url, { headers: { 'Accept-Language': 'en' } });
  const out: CityResult[] = [];
  for (const r of rows) {
    const a = r.address || {};
    const name = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || r.name;
    if (!name) continue;
    const stateName = a.state || '';
    const iso = (a['ISO3166-2-lvl4'] || '').replace('US-', '');
    const state = iso || STATE_CODES[stateName] || stateName;
    const [s, n, w, e] = (r.boundingbox || []).map(Number);
    const label = `${name}${state ? `, ${state}` : ''}`;
    if (out.some(o => o.label === label)) continue;
    out.push({ name, state, stateName, label, center: [Number(r.lat), Number(r.lon)], bbox: [s, n, w, e] });
  }
  return out;
}

async function fetchNeighborhoods(bounds: [LatLng, LatLng]): Promise<DistrictDef[]> {
  const [[s, w], [n, e]] = bounds;
  const query = `[out:json][timeout:20];node["place"~"^(suburb|neighbourhood|quarter)$"]["name"](${s},${w},${n},${e});out 300;`;
  const json = await getJson('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }, 25000);
  const seen = new Set<string>();
  const list: DistrictDef[] = [];
  for (const el of json.elements || []) {
    const name = el.tags?.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    list.push({ name, center: [el.lat, el.lon] });
  }
  // Keep the list manageable while preserving spread.
  while (list.length > 80) list.splice(Math.floor(Math.random() * list.length), 1);
  return list;
}

/** Real hospitals with emergency care inside the play area (OpenStreetMap). */
export async function fetchHospitals(bounds: [LatLng, LatLng]): Promise<Facility[]> {
  const [[s, w], [n, e]] = bounds;
  const query = `[out:json][timeout:20];nwr["amenity"="hospital"]["name"](${s},${w},${n},${e});out center 60;`;
  const json = await getJson('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }, 25000);
  const out: Facility[] = [];
  for (const el of json.elements || []) {
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    const name = el.tags?.name;
    if (lat == null || !name || out.some(h => h.name === name)) continue;
    if (el.tags?.amenity !== 'hospital' || el.tags?.emergency === 'no') continue;
    out.push({ id: `h-${el.type}${el.id}`, kind: 'hospital', name, pos: [lat, lon] });
  }
  return out.slice(0, 25);
}

function compassDistricts(name: string, center: LatLng, bounds: [LatLng, LatLng]): DistrictDef[] {
  const dLat = (bounds[1][0] - bounds[0][0]) * 0.3, dLng = (bounds[1][1] - bounds[0][1]) * 0.3;
  const dirs: [string, number, number][] = [['Downtown', 0, 0], ['North', 1, 0], ['Northeast', 1, 1], ['East', 0, 1], ['Southeast', -1, 1],
    ['South', -1, 0], ['Southwest', -1, -1], ['West', 0, -1], ['Northwest', 1, -1]];
  return dirs.map(([d, a, b]) => ({ name: d === 'Downtown' ? `Downtown ${name}` : `${d} ${name}`, center: [center[0] + a * dLat, center[1] + b * dLng] as LatLng }));
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Build a playable city definition from a search result. */
export async function buildCity(r: CityResult, existingIds: string[]): Promise<CityDef> {
  const [s, n, w, e] = r.bbox.every(Number.isFinite) ? r.bbox : [r.center[0] - 0.1, r.center[0] + 0.1, r.center[1] - 0.1, r.center[1] + 0.1];
  // Size the play area from the city's boundary, within sensible limits.
  const halfLat = clamp((n - s) / 2 + 0.03, 0.06, 0.3);
  const halfLng = clamp((e - w) / 2 + 0.03, 0.07, 0.38);
  const center: LatLng = [(s + n) / 2, (w + e) / 2];
  const bounds: [LatLng, LatLng] = [[center[0] - halfLat, center[1] - halfLng], [center[0] + halfLat, center[1] + halfLng]];
  const span = Math.max(halfLat, halfLng);
  let districts: DistrictDef[] = [];
  try { districts = await fetchNeighborhoods(bounds); } catch { districts = []; }
  if (districts.length < 4) districts = compassDistricts(r.name, r.center, bounds);
  let hospitals: Facility[] = [];
  try { hospitals = await fetchHospitals(bounds); } catch { hospitals = []; }
  const base = `${r.name}-${r.state}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let id = base, i = 2;
  while (existingIds.includes(id)) id = `${base}-${i++}`;
  return {
    id, name: r.name, state: r.state, prefix: r.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'CTY',
    center: r.center, zoom: span < 0.1 ? 14 : span < 0.2 ? 13 : 12, bounds, districts, hospitals, unlockLevel: 1, population: 0, playable: true,
  };
}

export interface AddressResult { label: string; pos: LatLng }

const shortAddress = (a: any, fallback: string) => {
  const street = [a.house_number, a.road].filter(Boolean).join(' ');
  const place = a.neighbourhood || a.suburb || a.city || a.town || a.village || '';
  return [street || a.amenity || a.building || fallback.split(',')[0], place].filter(Boolean).join(', ');
};

/** Find an address or place inside the city's play area. */
export async function searchAddress(query: string, bounds: [LatLng, LatLng], cityLabel: string): Promise<AddressResult[]> {
  const [[s, w], [n, e]] = bounds;
  const base = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=us&viewbox=${w},${n},${e},${s}&bounded=1`;
  let rows: any[] = await getJson(`${base}&q=${encodeURIComponent(query.trim())}`, { headers: { 'Accept-Language': 'en' } });
  if (!rows.length) rows = await getJson(`${base}&q=${encodeURIComponent(`${query.trim()}, ${cityLabel}`)}`, { headers: { 'Accept-Language': 'en' } });
  return rows.map(r => ({ label: shortAddress(r.address || {}, r.display_name || query), pos: [Number(r.lat), Number(r.lon)] as LatLng }));
}

/** Street address for a point (used when a station is placed by tapping the map). */
export async function reverseAddress(p: LatLng): Promise<string | null> {
  try {
    const r = await getJson(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${p[0]}&lon=${p[1]}`, { headers: { 'Accept-Language': 'en' } });
    return r && r.address ? shortAddress(r.address, r.display_name || '') : null;
  } catch { return null; }
}
