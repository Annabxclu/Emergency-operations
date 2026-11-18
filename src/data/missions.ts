import type { IncidentTypeDef, Requirement } from '../engine/types';
import { CATALOG } from './catalog';

// Turns the catalog (credits + station requirements + special units) into playable
// call types. All the rules for which vehicles a call needs live here.

const EXTRA_CAP: Record<string, string> = {
  fmo: 'investigator', tow: 'tow', rot: 'rotator', heli: 'air_police', wre: 'boat', rbd: 'boat', fbd: 'fireboat',
  airport: 'arff', foam: 'foam', forestry: 'brush', dre: 'heavy_equipment', crane: 'crane', tech: 'rescue',
  fed: 'federal', bomb: 'bomb', riot: 'riot', det: 'prisoner_transport', drone: 'drone', warden: 'game_warden',
  wpe: 'police_boat', csi: 'investigation', crs: 'coastal', chh: 'coast_heli', flood: 'flood',
};

const has = (name: string, words: string[]) => words.some(w => name.includes(w));

const HAZMAT = ['chemical', 'chlorine', 'ammonia', 'radioactive', 'cbrn', 'hazardous', 'hazmat', 'methane', 'propane', 'spill', 'leak', 'acid', 'decontamination', 'containment breach', 'unknown substance', 'dangerous goods', 'tanker', 'fuel'];
const RESCUE = ['trapped', 'entrapment', 'collapse', 'stuck', 'pinned', 'crushed', 'impalement', 'trench', 'confined', 'rescue', 'derail', 'caught in', 'under machine', 'under vehicle', 'under tree'];
const WATER = ['boat', 'ship', 'vessel', 'water', 'flood', 'swimmer', 'drown', 'river', 'lake', 'sea', 'coast', 'kayak', 'jet ski', 'jetski', 'surfer', 'tide', 'canal', 'dam ', 'dam break', 'yacht', 'ferry', 'pier', 'sailing', 'scuba', 'canoe', 'whaling', 'oil rig', 'beach'];
const DISASTER = ['tornado', 'earthquake', 'storm', 'landslide', 'avalanche', 'rockslide', 'sinkhole', 'hurricane', 'dam break', 'dam threatens'];
const TRAFFIC = ['traffic', 'speed radar', 'checkpoint', 'dui', 'drunk driving', 'wrong-way', 'street racing', 'stop operation', 'road block'];
const ARMED = ['warrant', 'raid', 'armed', 'shooter', 'hostage', 'kidnap', 'homicide', 'shots fired', 'assassination', 'weapon', 'cartel'];
const K9 = ['search for', 'fleeing', 'escape', 'drug', 'suspect', 'cannabis', 'trespasser'];
const ARREST = ['theft', 'robbery', 'burglary', 'shoplifting', 'assault', 'fight', 'brawl', 'warrant', 'dui', 'drunk', 'drug', 'suspect', 'pursuit', 'smuggling', 'raid', 'kidnap', 'homicide', 'shooting', 'stabbing', 'dodger', 'pickpocket', 'stolen', 'fraud', 'carjack', 'car jacking', 'jacking', 'violation', 'stalker', 'rioter', 'argument', 'dine and dash', 'intoxicated', 'aggressive', 'escaped', 'prisoner', 'arrest', 'dealer', 'deal', 'hunting', 'fishing', 'vandal', 'slash', 'hostage', 'shooter', 'attempted', 'smuggl', 'immigration'];
const CRITICAL = ['cardiac', 'stroke', 'respiratory', 'arrhythmia', 'tachycardia', 'seizure', 'chest pains', 'anaphylaxis', 'unconscious', 'hemorrhage', 'asthma', 'ischemic', 'spinal', 'electrocution', 'overdose', 'post-surgical', 'oxygen'];

function add(reqs: Requirement[], cap: string, count: number) {
  if (count <= 0) return;
  const ex = reqs.find(r => r.cap === cap);
  if (ex) ex.count = Math.max(ex.count, count); else reqs.push({ cap, count });
}

function parseExtras(s: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const tok of s.split(',').map(t => t.trim()).filter(Boolean)) {
    const [k, n] = tok.split(':');
    out[k] = Number(n || 1);
  }
  return out;
}

function deriveRequirements(name: string, f: number, a: number, p: number, extras: Record<string, number>): Requirement[] {
  const r: Requirement[] = [];
  const n = name.toLowerCase();
  // Fire
  if (f > 0) {
    const engines = f <= 2 ? 1 : f <= 5 ? 2 : f <= 9 ? 2 : f <= 14 ? 3 : f <= 24 ? 4 : 5;
    add(r, 'engine', engines);
    if (f >= 6) add(r, 'ladder', f >= 15 ? 2 : 1);
    if (f >= 10) add(r, 'chief', 1);
    if (f >= 10 && has(n, RESCUE)) add(r, 'rescue', f >= 25 ? 2 : 1);
    else if (f >= 3 && has(n, RESCUE)) add(r, 'rescue', 1);
    if (f >= 6 && has(n, HAZMAT)) add(r, 'hazmat', f >= 20 ? 2 : 1);
    if (f >= 25) add(r, 'water_supply', 1);
  }
  // EMS
  if (a > 0) {
    const emsOnly = f === 0 && p === 0;
    if (emsOnly && a <= 3) {
      if (a === 1) add(r, has(n, CRITICAL) ? 'als' : 'ambulance', 1);
      else { add(r, 'als', 1); if (a >= 3) add(r, 'ambulance', 2); }
    } else {
      add(r, 'ambulance', a <= 2 ? 1 : a <= 5 ? 2 : a <= 9 ? 3 : a <= 19 ? 4 : 5);
      if (a >= 6) add(r, 'ems_supervisor', 1);
      if (a >= 20) add(r, 'mci', 1);
    }
  }
  // Police
  if (p > 0) {
    let units = p <= 2 ? 1 : p <= 5 ? 2 : p <= 9 ? 3 : p <= 14 ? 4 : 5;
    if (has(n, TRAFFIC)) { add(r, 'traffic', 1); units = Math.max(0, units - 1); }
    if (p >= 8 && has(n, ARMED)) add(r, 'swat', 1);
    if (p >= 4 && has(n, K9)) add(r, 'k9', 1);
    add(r, 'police', units);
  }
  // Special units named by the catalog
  for (const [k, cnt] of Object.entries(extras)) {
    const cap = EXTRA_CAP[k];
    if (cap) add(r, cap, Math.min(cnt, k === 'tow' ? 4 : 3));
  }
  if (!r.length) add(r, 'police', 1);
  return r;
}

function category(name: string, f: number, a: number, p: number, extras: Record<string, number>): IncidentTypeDef['category'] {
  const n = name.toLowerCase();
  if (f === 0 && p === 0 && a > 0) return 'ems';
  if (extras.tow || extras.rot) { if (!f && !a) return 'public_works'; }
  if (has(n, DISASTER)) return 'disaster';
  if (extras.crs || extras.fbd || extras.wre || extras.wpe || has(n, WATER)) return 'water';
  if (f >= 6 && has(n, HAZMAT)) return 'hazmat';
  if (f > 0 && has(n, RESCUE)) return 'rescue';
  if (f > 0 || extras.fmo || extras.forestry || extras.foam || extras.airport) return 'fire';
  if (p > 0 || extras.fed || extras.csi || extras.warden) return 'police';
  return 'ems';
}

const slug = (s: string) => 'mc_' + s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export function buildCatalogMissions(existingNames: Set<string>): IncidentTypeDef[] {
  const out: IncidentTypeDef[] = [];
  const seen = new Set<string>();
  for (const line of CATALOG.split('\n')) {
    if (!line.trim()) continue;
    const [name, creditsS, fS, aS, pS, extrasS = ''] = line.split(';');
    const key = name.trim().toLowerCase();
    if (existingNames.has(key) || seen.has(key)) continue;
    seen.add(key);
    const credits = Number(creditsS) || 0;
    const f = Number(fS) || 0, a = Number(aS) || 0, p = Number(pS) || 0;
    const extras = parseExtras(extrasS);
    const n = key;
    const reward = credits || 300 + a * 100;
    const severity: 1 | 2 | 3 = reward < 1000 ? 1 : reward < 5000 ? 2 : 3;
    const patients = a > 0 ? Math.min(8, Math.max(1, Math.round(a / 2))) : 0;
    const arrests = p > 0 && has(n, ARREST) ? Math.min(4, Math.max(1, Math.ceil(p / 3))) : 0;
    const cat = category(name, f, a, p, extras);
    out.push({
      id: slug(name),
      name: name.trim(),
      category: cat,
      severity,
      descriptions: [`Caller reports: ${name.trim().toLowerCase()}.`],
      requirements: deriveRequirements(name, f, a, p, extras),
      escalation: [],
      deadlineMin: 12,
      workMin: [Math.max(4, Math.min(60, Math.round(reward / 400))), Math.max(6, Math.min(90, Math.round(reward / 250)))],
      reward,
      xp: Math.max(5, Math.round(reward / 50)),
      weight: reward < 1000 ? 5 : reward < 5000 ? 3 : reward < 15000 ? 1.5 : 0.6,
      unlockLevel: Math.max(1, f, a, p),
      patients: patients ? [Math.max(1, patients - 1), patients] : undefined,
      prisoners: arrests ? [arrests > 1 ? 1 : 0, arrests] : undefined,
    });
  }
  return out;
}
