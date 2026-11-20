// Game engine: pure TypeScript, no UI or browser dependencies apart from the
// injected RoutingProvider. The UI calls actions and tick(); it never mutates
// state directly.

import type {
  CityDef, CityState, Employee, Facility, IncidentTypeDef, Route, RouteData, VehicleTypeDef, FinanceBucket, GameEvent, GameState, Incident, LatLng, Outcome,
  Requirement, RoutingProvider, Station, Vehicle,
} from './types';
import {
  CAPABILITIES, DEPARTMENTS, STARTER_KITS, STARTING_MONEY, STATION_TYPES, VEHICLE_TYPES,
  dept, qualification, stationType, stationTypeForDept, vehicleType, ACADEMIES, isTrainable } from '../data/departments';
import { INCIDENT_TYPES, incidentType, CATEGORY_DEPT } from '../data/incidents';
import { STAFF_TRAININGS } from '../data/staffRequirements';
import { HOSPITAL, SPECIALTIES, SPECIALTY_BY_CATEGORY, admissionFee } from '../data/hospitals';
import { TUNING } from '../data/tuning';
import { AGREEMENTS, GOAL_TEMPLATES, RESEARCH, extensionsFor, type ModKey } from '../data/progression';
import { CITIES, CITY_SLOT_LEVELS } from '../data/cities';
import { FIRST_NAMES, LAST_NAMES } from '../data/names';
import { destination, directRoute, distanceM, estimateEtaS, makeRoute, pointAlong } from './geo';

export const SCHEMA = 2;
export const SETUP_ORDER = ['fire', 'police', 'ems'];
export const MIN_CONDITION = 25;
const DAY = 86400;

export class ActionError extends Error {}

const emptyBucket = (): FinanceBucket => ({ income: {}, expense: {}, byDept: {} });

export function xpForLevel(level: number): number {
  return level <= 1 ? 0 : Math.round(200 * Math.pow(level - 1, 1.6));
}

export function newCityState(cityId: string): CityState {
  return {
    cityId, money: STARTING_MONEY, stations: [], vehicles: [], employees: [], incidents: [], resolved: [], ledger: [],
    finance: { day: 0, today: emptyBucket(), yesterday: null, total: emptyBucket() },
    accrual: {}, lastHour: 8, nextIncidentAt: 0, incidentCounter: 0, setupStep: 0,
    stats: { calls: 0, successful: 0, failed: 0 },
  };
}

export function newGameState(def: CityDef = CITIES[0]): GameState {
  const cityId = def.id;
  const deptFilter: Record<string, boolean> = {};
  DEPARTMENTS.forEach(d => (deptFilter[d.id] = true));
  return {
    schema: SCHEMA,
    createdAt: new Date().toISOString(),
    time: 8 * 3600, // Day 1, 08:00
    xp: 0, level: 1, activeCity: cityId,
    cities: { [cityId]: newCityState(cityId) },
    cityDefs: CITIES.some(c => c.id === cityId) ? {} : { [cityId]: def },
    seq: 1,
    settings: { speed: 1, routingUrl: 'https://router.project-osrm.org', tileStyle: 'osm', showCoverage: false, deptFilter, sound: true, autoDispatch: 'off', shifts: false, travelModel: 'fixed', callIntervalMin: TUNING.defaultCallIntervalMin, runningCosts: TUNING.runningCostsDefault, rewardMult: TUNING.defaultRewardMultiplier, travelMult: TUNING.defaultTravelMult, workMult: TUNING.defaultWorkMult },
    research: { active: null, done: [] },
  };
}

/** Validate & upgrade a loaded/imported save. Throws on garbage. */
export function migrate(raw: unknown): GameState {
  const s = raw as GameState;
  if (!s || typeof s !== 'object' || typeof s.time !== 'number' || !s.cities || !s.activeCity || !s.cities[s.activeCity]) {
    throw new Error('This file is not an Authority: First Response save.');
  }
  if (s.schema > SCHEMA) throw new Error('This save was made by a newer version of the game.');
  s.cityDefs ||= {};
  s.research ||= { active: null, done: [] };
  if (s.settings && !s.settings.travelModel) s.settings.travelModel = 'fixed';
  s.settings.speed = 1; // game always runs in real time (speed options removed)
  if (s.settings && !s.settings.callIntervalMin) s.settings.callIntervalMin = 3;
  if (s.settings?.callIntervalMin === 1) s.settings.callIntervalMin = 0.5; // the 1-minute option became 30 seconds
  if (s.settings.runningCosts === undefined) s.settings.runningCosts = TUNING.runningCostsDefault;
  if (!s.settings.rewardMult) s.settings.rewardMult = TUNING.defaultRewardMultiplier;
  if (!s.settings.travelMult) s.settings.travelMult = TUNING.defaultTravelMult;
  if (!s.settings.workMult) s.settings.workMult = TUNING.defaultWorkMult;
  if (!s.cityDefs[s.activeCity] && !CITIES.some(c => c.id === s.activeCity)) throw new Error('This save references an unknown city.');
  const fresh = newGameState();
  s.settings = { ...fresh.settings, ...(s.settings || {}) };
  s.settings.deptFilter = { ...fresh.settings.deptFilter, ...(s.settings.deptFilter || {}) };
  for (const c of Object.values(s.cities)) for (const i of [...c.incidents, ...c.resolved]) { i.patients ??= 0; i.prisoners ??= 0; }
  if (!['osm', 'hot'].includes(s.settings.tileStyle)) s.settings.tileStyle = 'osm'; // CARTO styles retired (need a key)
  if ((s.schema ?? 1) < 2) {
    // Station levels used to index a small table; now every level is one bay.
    const OLD: Record<string, number[]> = { fire_station: [2, 3, 4, 6], police_precinct: [3, 5, 7, 10], ems_station: [2, 3, 4, 6], public_works_yard: [2, 4, 6],
      water_rescue_station: [2, 3, 4], air_base: [1, 2, 3], special_ops_base: [2, 3, 4], eoc: [2, 3, 4], disaster_center: [2, 3, 4] };
    for (const c of Object.values(s.cities)) for (const st of c.stations) {
      const bays = (OLD[st.typeId]?.[st.level] ?? 1) + (st.extensions?.includes('bays') ? 2 : 0);
      const vehicles = c.vehicles.filter(v => v.stationId === st.id).length;
      st.level = Math.max(bays, vehicles) - 1;
      st.extensions = (st.extensions || []).filter(x => x !== 'bays' && x !== 'quarters');
    }
  }
  s.schema = SCHEMA;
  return s;
}

// ---------------------------------------------------------------- matching

const capProviders: Record<string, number> = {};
CAPABILITIES.forEach(c => (capProviders[c.id] = VEHICLE_TYPES.filter(v => v.caps.includes(c.id)).length));

/** Which requirement slots are not covered by the given vehicles. Each vehicle fills one slot. */
export function missingRequirements(reqs: Requirement[], vehicles: Vehicle[]): Requirement[] {
  const pool = [...vehicles];
  const missing: Requirement[] = [];
  const ordered = [...reqs].sort((a, b) => (capProviders[a.cap] ?? 99) - (capProviders[b.cap] ?? 99));
  for (const r of ordered) {
    let left = r.count;
    while (left > 0) {
      let best = -1, bestCaps = 99;
      pool.forEach((v, i) => {
        const caps = vehicleType(v.typeId).caps;
        if (caps.includes(r.cap) && caps.length < bestCaps) { best = i; bestCaps = caps.length; }
      });
      if (best < 0) break;
      const [used] = pool.splice(best, 1);
      left -= vehicleType(used.typeId).capCount?.[r.cap] ?? 1;
    }
    if (left > 0) missing.push({ cap: r.cap, count: left });
  }
  return missing;
}

/** More than 10 ambulances on a call needs an EMS Chief on scene. */
export function addEmsChief(reqs: Requirement[], patients = 0) {
  const amb = Math.max(patients, reqs.filter(r => ['ambulance', 'als', 'ccu'].includes(r.cap)).reduce((n, r) => n + r.count, 0));
  if (amb > TUNING.emsChiefAboveAmbulances && !reqs.some(r => r.cap === 'ems_supervisor')) reqs.push({ cap: 'ems_supervisor', count: 1 });
  return reqs;
}

export function mergeRequirements(a: Requirement[], b: Requirement[]): Requirement[] {
  const out = a.map(r => ({ ...r }));
  for (const r of b) {
    const ex = out.find(x => x.cap === r.cap);
    if (ex) ex.count += r.count; else out.push({ ...r });
  }
  return out;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------------- Game

export class Game {
  state: GameState;
  private listeners = new Set<() => void>();
  private eventListeners = new Set<(e: GameEvent) => void>();
  private spawning = false;
  private noSpawn = false;
  version = 0;

  constructor(state: GameState, public routing: RoutingProvider) {
    this.state = state;
    this.dropUnstaffableCalls();
  }

  /** Remove untouched calls the player's fleet could never complete (from older versions). */
  dropUnstaffableCalls() {
    for (const id of Object.keys(this.state.cities)) {
      const c = this.state.cities[id];
      if (!c?.incidents || !c.vehicles) continue;
      delete (c as { realStations?: unknown }).realStations; // removed feature
      c.incidents = c.incidents.filter(inc =>
        inc.status !== 'pending' || inc.parentId != null ||
        c.vehicles.some(v => v.incidentId === inc.id || v.followUp === inc.id) ||
        missingRequirements(inc.requirements, c.vehicles).length === 0);
    }
  }

  /** City being simulated right now (background cities tick too). */
  private cur: string | null = null;
  get cityId(): string { return this.cur ?? this.state.activeCity; }
  get city(): CityState { return this.state.cities[this.cityId]; }
  get cityDef(): CityDef { return this.defOf(this.cityId); }
  defOf(id: string): CityDef { return this.state.cityDefs[id] || CITIES.find(c => c.id === id)!; }
  get setupDone() { return this.city.setupStep >= SETUP_ORDER.length; }

  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  onEvent(fn: (e: GameEvent) => void) { this.eventListeners.add(fn); return () => { this.eventListeners.delete(fn); }; }
  changed() { this.version++; this.listeners.forEach(f => f()); }
  private emit(e: GameEvent, cityId = this.cityId) { const ev = { ...e, cityId }; this.eventListeners.forEach(f => f(ev)); }
  private id(prefix: string) { return `${prefix}${this.state.seq++}`; }

  /** Replace the whole state (load / import / reset). */
  load(state: GameState) {
    this.state = state;
    this.spawning = false;
    this.resumeAfterLoad();
    this.changed();
  }

  /** Vehicles that were waiting on a route when the game was saved need a fresh request. */
  resumeAfterLoad() {
    for (const id of Object.keys(this.state.cities)) this.inCity(id, () => this.resumeCity());
  }

  private inCity<T>(id: string, fn: () => T): T {
    const prev = this.cur;
    this.cur = id;
    try { return fn(); } finally { this.cur = prev; }
  }

  private resumeCity() {
    for (const v of this.city.vehicles) {
      if (v.status === 'dispatched' && !v.route) {
        const inc = this.incident(v.incidentId || '');
        if (inc) this.requestRoute(v, inc.pos); else this.sendHome(v);
      } else if (v.status === 'returning' && !v.route) {
        this.sendHome(v);
      } else if (v.status === 'transporting' && !v.route) {
        const dest = v.cargo && [...this.hospitals(), ...this.jails()].find(f => f.id === v.cargo!.dest);
        // (an owned hospital is in hospitals() too)
        if (dest) this.requestRoute(v, dest.pos); else { v.cargo = null; this.sendHome(v); }
      }
    }
  }

  // ------------------------------------------------------------ lookups
  station(id: string) { return this.city.stations.find(s => s.id === id); }
  vehicle(id: string) { return this.city.vehicles.find(v => v.id === id); }
  incident(id: string) { return this.city.incidents.find(i => i.id === id) || this.city.resolved.find(i => i.id === id); }
  employee(id: string) { return this.city.employees.find(e => e.id === id); }
  stationVehicles(stationId: string) { return this.city.vehicles.filter(v => v.stationId === stationId); }
  stationStaff(stationId: string) { return this.city.employees.filter(e => e.stationId === stationId); }
  crew(vehicleId: string) { return this.city.employees.filter(e => e.vehicleId === vehicleId); }
  incidentVehicles(incId: string) { return this.city.vehicles.filter(v => v.incidentId === incId); }
  hasDept(d: string) { return this.city.stations.some(s => s.dept === d); }

  /** Bays = 1 + level (+ extensions). Personnel capacity scales with bays. */
  stationCapacity(s: Station) {
    let bays = 1 + s.level;
    for (const ext of extensionsFor(s.typeId)) if (s.extensions?.includes(ext.id)) bays += ext.bays || 0;
    return { bays, staff: bays * TUNING.staffPerBay * (this.state.settings.shifts ? 3 : 1) };
  }

  levelCost(targetLevel: number) {
    const c = TUNING.levelCosts;
    return c[Math.min(targetLevel - 1, c.length - 1)];
  }

  /** Price of the next station of a type: rises once you own many of that type. */
  stationPrice(typeId: string) {
    const t = stationType(typeId);
    const n = this.city.stations.filter(s => s.typeId === typeId).length;
    if (n < TUNING.priceRiseAfter) return t.cost;
    return Math.round(t.cost * TUNING.bigNetworkMultiplier + (n - TUNING.priceRiseAfter) * t.cost * 0.05);
  }

  /** Null if this station can house the vehicle type, else the extension it still needs. */
  vehicleExtNeeded(s: Station, vt: VehicleTypeDef): string | null {
    if (!vt.needsExt) return null;
    const exts = extensionsFor(s.typeId).filter(e => e.allowsVehicles?.includes(vt.id));
    if (exts.some(e => s.extensions?.includes(e.id))) return null;
    return exts.length ? `Needs ${exts[0].name}` : 'Not available at this station type';
  }

  /** Can this station house vehicles of a department (own dept or via an extension)? */
  hostsDept(s: Station, deptId: string) {
    return s.dept === deptId || extensionsFor(s.typeId).some(e => e.allowsDept === deptId && s.extensions?.includes(e.id));
  }

  // ------------------------------------------------------------ unlocks (by stations owned)
  stationCount(deptId?: string) {
    return this.city.stations.filter(s => !deptId || s.dept === deptId).length;
  }

  /** Stations (any type) you must own before you can build a department's first station. */
  deptRequirement(deptId: string) { return (dept(deptId).unlockLevel - 1) * 2; }

  /** Stations of its own department needed to buy a vehicle type / train a certification. */
  deptItemRequirement(item: { unlockLevel: number; dept: string; neededAt?: number }) {
    if (item.neededAt != null) return Math.max(1, item.neededAt);
    return Math.max(1, item.unlockLevel - dept(item.dept).unlockLevel + 1);
  }

  /** Null when unlocked, otherwise e.g. "Needs 3 Fire stations". */
  needStations(n: number, deptId?: string): string | null {
    if (n <= 0 || this.stationCount(deptId) >= n) return null;
    return `Needs ${n} ${deptId ? dept(deptId).short + ' ' : ''}station${n > 1 ? 's' : ''}`;
  }

  hasFeature(s: Station | undefined, feature: string) {
    return !!s && extensionsFor(s.typeId).some(e => e.feature === feature && s.extensions?.includes(e.id));
  }

  buildExtension(stationId: string, extId: string) {
    const s = this.station(stationId);
    const ext = s && extensionsFor(s.typeId).find(e => e.id === extId);
    if (!s || !ext) throw new ActionError('Not found.');
    if (s.extensions?.includes(extId)) throw new ActionError('Already built.');
    if (ext.perStations) {
      const sameType = this.city.stations.filter(x => x.typeId === s.typeId);
      const built = sameType.filter(x => x.extensions?.includes(extId)).length;
      const allowed = Math.floor(sameType.length / ext.perStations);
      if (built >= allowed) throw new ActionError(`One ${ext.name} per ${ext.perStations} stations of this type (you have ${sameType.length}).`);
    }
    this.spend(ext.cost, 'construction', s.dept, `${ext.name} at ${s.name}`);
    (s.extensions ||= []).push(extId);
    this.changed();
  }

  // ------------------------------------------------------------ research & modifiers
  mod(k: ModKey): number {
    let m = 1;
    for (const id of this.state.research.done) m *= RESEARCH.find(r => r.id === id)?.effects[k] ?? 1;
    return m;
  }

  startResearch(id: string) {
    const r = RESEARCH.find(x => x.id === id);
    if (!r) throw new ActionError('Not found.');
    const rs = this.state.research;
    if (rs.done.includes(id)) throw new ActionError('Already researched.');
    if (rs.active) throw new ActionError('Another project is in progress.');
    const needR = this.needStations(r.unlockLevel); if (needR) throw new ActionError(needR + '.');
    if (r.requires && !rs.done.includes(r.requires)) throw new ActionError(`Requires ${RESEARCH.find(x => x.id === r.requires)!.name}.`);
    this.spend(r.cost, 'research', null, `Research: ${r.name}`);
    rs.active = { id, until: this.state.time + r.hours * 3600 };
    this.changed();
  }

  // ------------------------------------------------------------ daily login bonus
  /** Which day of the 7-day cycle is claimable today (null if already claimed). */
  dailyBonus(today: string): { step: number; amount: number } | null {
    const l = this.state.login;
    if (l && l.last === today) return null;
    const step = l ? (l.step % TUNING.dailyBonusDays) + 1 : 1;
    return { step, amount: step * TUNING.dailyBonusBase };
  }

  claimDailyBonus(today: string): number {
    const b = this.dailyBonus(today);
    if (!b) throw new ActionError('Already claimed today.');
    this.post(b.amount, 'daily login bonus', null, `Daily bonus — day ${b.step}`);
    this.state.login = { last: today, step: b.step };
    this.changed();
    return b.amount;
  }

  // ------------------------------------------------------------ shifts
  currentShift(): 'A' | 'B' | 'C' { return (['A', 'B', 'C'] as const)[Math.floor(this.state.time / (8 * 3600)) % 3]; }
  onDuty(e: Employee) { return e.status === 'on_duty' && (!this.state.settings.shifts || e.shift === this.currentShift()); }
  crewCap(maxCrew: number) { return maxCrew * (this.state.settings.shifts ? 3 : 1); }

  // ------------------------------------------------------------ regional agreements
  agreementActive(id: string) {
    const a = AGREEMENTS.find(x => x.id === id)!;
    const n = this.city.stations.filter(s => s.dept === a.dept).length;
    return n >= a.stations && (!a.extraDept || this.hasDept(a.extraDept));
  }

  signAgreement(id: string) {
    const a = AGREEMENTS.find(x => x.id === id);
    if (!a) throw new ActionError('Not found.');
    const list = (this.city.agreements ||= []);
    if (list.includes(id)) throw new ActionError('Already signed.');
    if (!this.agreementActive(id)) throw new ActionError('Requirements not met yet.');
    this.spend(a.signCost, 'contracts', a.dept, `Signed: ${a.name}`);
    list.push(id);
    this.changed();
  }

  cancelAgreement(id: string) {
    this.city.agreements = (this.city.agreements || []).filter(x => x !== id);
    this.changed();
  }

  // ------------------------------------------------------------ daily goals
  private ensureGoals() {
    const c = this.city;
    const day = Math.floor(this.state.time / DAY);
    if (c.goals && c.goals.day === day) return;
    const lvl = 1 + Math.floor(this.stationCount() / 4);
    const pool = GOAL_TEMPLATES.filter(t => t.minLevel <= lvl).sort(() => Math.random() - 0.5).slice(0, 3);
    c.goals = {
      day,
      list: pool.map((t, i) => {
        const target = Math.max(1, Math.round(t.base + t.perLevel * (lvl - 1)));
        return { id: `g${day}-${i}`, metric: t.metric, label: t.label(target), target, progress: 0, reward: Math.round((1500 + lvl * 600) * (target / t.base) ** 0.5), xp: 25 + lvl * 6, done: false };
      }),
    };
    this.changed();
  }

  private progressGoal(metric: string, n = 1) {
    const g = this.city.goals;
    if (!g) return;
    for (const goal of g.list) {
      if (goal.done || goal.metric !== metric) continue;
      goal.progress = Math.min(goal.target, goal.progress + n);
      if (goal.progress >= goal.target) {
        goal.done = true;
        this.post(goal.reward, 'daily goals', null, `Goal: ${goal.label}`);
        this.addXp(goal.xp);
        this.emit({ type: 'goal_done', label: goal.label, reward: goal.reward });
      }
    }
  }

  /** Returns null if the vehicle has enough qualified, on-duty crew; otherwise a reason. */
  staffingProblem(v: Vehicle): string | null {
    const t = vehicleType(v.typeId);
    const crew = this.crew(v.id).filter(e => this.onDuty(e));
    if (crew.length < t.minCrew) return `Needs ${t.minCrew} crew on duty${this.state.settings.shifts ? ` (shift ${this.currentShift()})` : ''} (has ${crew.length})`;
    for (const q of t.quals) {
      const n = crew.filter(e => e.quals.includes(q.qual)).length;
      if (n < q.count) return `Needs ${q.count} × ${qualification(q.qual).name}`;
    }
    return null;
  }

  /** Null if the vehicle can be dispatched right now, else the reason. */
  dispatchProblem(v: Vehicle): string | null {
    if (v.status !== 'available' && v.status !== 'returning') {
      return { dispatched: 'Already dispatched', enroute: 'En route', onscene: 'On scene', transporting: 'Transporting', handover: 'At hospital / jail', out_of_service: 'Out of service', maintenance: 'In maintenance' }[v.status as string] || 'Unavailable';
    }
    if (v.condition < MIN_CONDITION) return 'Needs maintenance';
    return this.staffingProblem(v);
  }

  // ------------------------------------------------------------ money
  post(amount: number, cat: string, deptId: string | null, note: string) {
    const c = this.city;
    amount = Math.round(amount);
    if (amount === 0) return;
    c.money += amount;
    c.ledger.unshift({ t: this.state.time, amount, cat, note });
    if (c.ledger.length > 250) c.ledger.length = 250;
    for (const b of [c.finance.today, c.finance.total]) {
      const side = amount > 0 ? b.income : b.expense;
      side[cat] = (side[cat] || 0) + Math.abs(amount);
      if (deptId) {
        const d = (b.byDept[deptId] ||= { income: 0, expense: 0 });
        if (amount > 0) d.income += amount; else d.expense += -amount;
      }
    }
  }

  private spend(amount: number, cat: string, deptId: string | null, note: string) {
    if (this.city.money < amount) throw new ActionError(`Not enough money (need $${amount.toLocaleString()}).`);
    this.post(-amount, cat, deptId, note);
  }

  private addXp(n: number) {
    this.state.xp += Math.round(n);
    // Player levels are retired; unlocks now depend on the stations you own.
  }

  // ------------------------------------------------------------ actions: stations
  placeStation(typeId: string, pos: LatLng, name?: string, address?: string): Station {
    const c = this.city;
    const t = stationType(typeId);
    const needD = this.needStations(this.deptRequirement(t.dept)); if (needD) throw new ActionError(`${dept(t.dept).name}: ${needD.toLowerCase()} first.`);
    const setup = !this.setupDone;
    if (setup && SETUP_ORDER[c.setupStep] !== t.dept) throw new ActionError(`Place your ${stationTypeForDept(SETUP_ORDER[c.setupStep]).name} first.`);
    if (!setup) this.spend(this.stationPrice(typeId), 'construction', t.dept, `Built ${t.name}`);
    const n = c.stations.filter(s => s.typeId === typeId).length + 1;
    const st: Station = { id: this.id('s'), typeId, dept: t.dept, name: name?.trim() || `${t.name.replace(' (Small)', '')} ${n}`, pos, level: 0, address: address || undefined };
    if (setup) st.level = Math.max(0, STARTER_KITS[t.dept].vehicles.length - 1); // room for the starter fleet
    c.stations.push(st);
    if (setup) {
      const kit = STARTER_KITS[t.dept];
      for (let i = 0; i < kit.staff; i++) c.employees.push(this.makeEmployee(t.dept, st.id, false));
      kit.vehicles.forEach(vt => this.addVehicle(vt, st, 0));
      c.setupStep++;
      if (this.setupDone) {
        c.nextIncidentAt = this.state.time + 45;
        this.emit({ type: 'notice', text: 'Your network is online. Calls will start coming in.' });
      }
    }
    this.changed();
    return st;
  }

  upgradeStation(id: string) {
    const s = this.station(id);
    if (!s) throw new ActionError('Station not found.');
    const t = stationType(s.typeId);
    if (s.level >= t.maxLevel) throw new ActionError(t.small ? 'Small stations max out at 6 bays. Convert it to a full station to keep growing.' : 'Station is at the maximum level.');
    const cost = this.levelCost(s.level + 1);
    this.spend(cost, 'upgrades', s.dept, `${s.name}: level ${s.level + 1}`);
    s.level++;
    this.changed();
  }

  /** Turn a small station into a full one (keeps its level, vehicles and staff). */
  convertSmallStation(id: string) {
    const s = this.station(id);
    if (!s) throw new ActionError('Station not found.');
    const t = stationType(s.typeId);
    if (!t.small || !t.upgradeTo) throw new ActionError('Only small stations can be converted.');
    this.spend(t.cost, 'upgrades', s.dept, `${s.name}: converted to full station`);
    s.typeId = t.upgradeTo;
    this.changed();
  }

  renameVehicle(id: string, name: string) {
    const v = this.vehicle(id);
    const n = name.trim().slice(0, 40);
    if (v && n) { v.name = n; this.changed(); }
  }

  renameStation(id: string, name: string) {
    const s = this.station(id);
    if (s && name.trim()) { s.name = name.trim(); this.changed(); }
  }

  // ------------------------------------------------------------ actions: vehicles
  private addVehicle(typeId: string, st: Station, price: number): Vehicle {
    const t = vehicleType(typeId);
    const n = this.city.vehicles.filter(v => v.typeId === typeId).length + 1;
    const v: Vehicle = {
      id: this.id('v'), typeId, name: `${t.callsign} ${n}`, stationId: st.id, status: 'available', pos: [...st.pos] as LatLng,
      route: null, routeReq: 0, incidentId: null, turnoutUntil: 0, condition: 100, maintenanceUntil: 0, odometerKm: 0,
      costs: { purchase: price, fuel: 0, maintenance: 0 }, calls: 0,
    };
    this.city.vehicles.push(v);
    this.autoStaff(st.id);
    return v;
  }

  buyVehicle(typeId: string, stationId: string): Vehicle {
    const st = this.station(stationId);
    if (!st) throw new ActionError('Station not found.');
    const t = vehicleType(typeId);
    if (!this.hostsDept(st, t.dept)) throw new ActionError(`${t.name} needs a ${dept(t.dept).short} station (or a station extension that houses it).`);
    const needV = this.needStations(this.deptItemRequirement(t), t.dept); if (needV) throw new ActionError(needV + '.');
    const needE = this.vehicleExtNeeded(st, t); if (needE) throw new ActionError(`${t.name}: ${needE.toLowerCase()}.`);
    if (this.stationVehicles(st.id).length >= this.stationCapacity(st).bays) throw new ActionError('No free vehicle bays. Upgrade the station.');
    this.spend(t.price, 'vehicles', t.dept, `Purchased ${t.name}`);
    const v = this.addVehicle(typeId, st, t.price);
    this.changed();
    return v;
  }

  reassignVehicle(vehicleId: string, stationId: string) {
    const v = this.vehicle(vehicleId), st = this.station(stationId);
    if (!v || !st) throw new ActionError('Not found.');
    if (!this.hostsDept(st, vehicleType(v.typeId).dept)) throw new ActionError('That station cannot house this vehicle.');
    if (v.stationId === st.id) return;
    if (v.status !== 'available') throw new ActionError('Vehicle must be available at its station.');
    if (this.stationVehicles(st.id).length >= this.stationCapacity(st).bays) throw new ActionError('No free bays at that station.');
    this.crew(v.id).forEach(e => (e.vehicleId = null));
    v.stationId = st.id;
    this.sendHome(v);
    this.changed();
  }

  sellVehicle(vehicleId: string) {
    const v = this.vehicle(vehicleId);
    if (!v) return;
    if (v.status !== 'available' && v.status !== 'out_of_service') throw new ActionError('Vehicle must be at its station.');
    const t = vehicleType(v.typeId);
    this.crew(v.id).forEach(e => (e.vehicleId = null));
    this.city.vehicles = this.city.vehicles.filter(x => x !== v);
    this.post(Math.round(t.price * 0.4 * (v.condition / 100)), 'vehicle sales', t.dept, `Sold ${v.name}`);
    this.changed();
  }

  setOutOfService(vehicleId: string, oos: boolean) {
    const v = this.vehicle(vehicleId);
    if (!v) return;
    if (oos && v.status === 'available') v.status = 'out_of_service';
    else if (!oos && v.status === 'out_of_service') v.status = 'available';
    this.changed();
  }

  maintenanceCost(v: Vehicle) { return Math.round((100 - v.condition) * vehicleType(v.typeId).price * 0.002 * this.mod('maintenance')); }

  sendToMaintenance(vehicleId: string) {
    const v = this.vehicle(vehicleId);
    if (!v) return;
    if (v.status !== 'available' && v.status !== 'out_of_service') throw new ActionError('Vehicle must be at its station.');
    if (v.condition >= 100) throw new ActionError('Vehicle is already in perfect condition.');
    const cost = this.maintenanceCost(v);
    this.spend(cost, 'maintenance', vehicleType(v.typeId).dept, `Service: ${v.name}`);
    v.costs.maintenance += cost;
    v.status = 'maintenance';
    v.maintenanceUntil = this.state.time + Math.max(1800, (100 - v.condition) * 90);
    this.changed();
  }

  // ------------------------------------------------------------ actions: personnel
  private makeEmployee(deptId: string, stationId: string, withQualChance: boolean): Employee {
    const d = dept(deptId);
    const quals: string[] = [];
    let salary = d.baseSalaryPerHour * rand(0.92, 1.08);
    void withQualChance; // new hires always start untrained; training happens at the academy
    const count = this.city.employees.filter(e => e.dept === deptId).length + 1;
    return {
      id: this.id('e'), empNo: `${d.empPrefix}-${String(count + 1000).padStart(4, '0')}`,
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, dept: deptId, rank: 0, quals,
      salaryPerHour: Math.round(salary), xp: 0, stationId, vehicleId: null, shift: pick(['A', 'B', 'C'] as const),
      status: 'on_duty', training: null,
    };
  }

  /** Three hiring candidates for a station (not yet employed). */
  candidates(stationId: string): Employee[] {
    const st = this.station(stationId);
    if (!st) return [];
    const seq = this.state.seq;
    const out = [0, 1, 2].map(() => this.makeEmployee(st.dept, st.id, true));
    this.state.seq = seq + 10; // keep ids unique across rerolls
    return out;
  }

  hire(stationId: string, candidate: Employee) {
    const st = this.station(stationId);
    if (!st) throw new ActionError('Station not found.');
    if (this.stationStaff(st.id).length >= this.stationCapacity(st).staff) throw new ActionError('Station is at personnel capacity. Upgrade it.');
    const d = dept(st.dept);
    this.spend(d.hireCost, 'hiring', st.dept, `Hired ${candidate.name}`);
    const e: Employee = { ...candidate, id: this.id('e'), stationId: st.id, vehicleId: null };
    this.city.employees.push(e);
    this.autoStaff(st.id);
    this.changed();
    return e;
  }

  // ---- Recruiting: set how many staff a station should have; one free recruit arrives every 24 real hours.
  static HIRE_INTERVAL_MS = 24 * 3600 * 1000;

  setHireTarget(stationId: string, target: number) {
    const st = this.station(stationId);
    if (!st) throw new ActionError('Station not found.');
    const cap = this.stationCapacity(st).staff;
    const staff = this.stationStaff(st.id).length;
    st.hireTarget = Math.max(staff, Math.min(cap, Math.round(target))); // can't go below current staff
    if (st.hireTarget > staff) { if (!st.nextHireAt) st.nextHireAt = Date.now() + Game.HIRE_INTERVAL_MS; }
    else st.nextHireAt = undefined;
    this.changed();
  }

  /** Pay the hiring fee to get one untrained recruit right away. */
  hireNow(stationId: string) {
    const st = this.station(stationId);
    if (!st) throw new ActionError('Station not found.');
    if (this.stationStaff(st.id).length >= this.stationCapacity(st).staff) throw new ActionError('Station is at personnel capacity. Upgrade it.');
    this.spend(dept(st.dept).hireCost, 'hiring', st.dept, 'Instant hire');
    const e = this.makeEmployee(st.dept, st.id, false);
    this.city.employees.push(e);
    if (st.hireTarget != null && this.stationStaff(st.id).length >= st.hireTarget) { st.hireTarget = this.stationStaff(st.id).length; st.nextHireAt = undefined; }
    this.autoStaff(st.id);
    this.changed();
    return e;
  }

  /** Deliver free recruits that are due (runs for every city, also after time away). */
  processRecruiting(now = Date.now()) {
    for (const cid of Object.keys(this.state.cities)) this.inCity(cid, () => {
      for (const st of this.city.stations) {
        if (!st.hireTarget || !st.nextHireAt) continue;
        const cap = Math.min(st.hireTarget, this.stationCapacity(st).staff);
        let added = 0;
        while (st.nextHireAt && st.nextHireAt <= now && this.stationStaff(st.id).length < cap) {
          this.city.employees.push(this.makeEmployee(st.dept, st.id, false));
          added++;
          st.nextHireAt += Game.HIRE_INTERVAL_MS;
        }
        if (this.stationStaff(st.id).length >= cap) st.nextHireAt = undefined;
        if (added) { this.autoStaff(st.id); this.emit({ type: 'recruited', stationId: st.id, count: added }); }
      }
    });
  }

  // ---- Academies (fire / police): training for those departments happens here.
  academyOf(deptId: string) { return this.city.academies?.[deptId] ?? null; }
  academySeats(deptId: string) {
    const a = this.academyOf(deptId);
    return a ? (1 + a.classrooms) * ACADEMIES[deptId].seatsPerClassroom : 0;
  }
  inTraining(deptId: string) { return this.city.employees.filter(e => e.dept === deptId && e.training).length; }

  buildAcademy(deptId: string) {
    const def = ACADEMIES[deptId];
    if (!def) throw new ActionError('No academy for this department.');
    if (this.academyOf(deptId)) throw new ActionError(`${def.name} already built.`);
    this.spend(def.cost, 'stations', deptId, `Built ${def.name}`);
    this.city.academies = { ...(this.city.academies ?? {}), [deptId]: { classrooms: 0 } };
    this.changed();
  }

  addClassroom(deptId: string) {
    const def = ACADEMIES[deptId], a = this.academyOf(deptId);
    if (!def || !a) throw new ActionError('Build the academy first.');
    if (a.classrooms >= def.maxExtraClassrooms) throw new ActionError('All classrooms are built.');
    this.spend(def.classroomCost, 'stations', deptId, `${def.name}: extra classroom`);
    a.classrooms++;
    this.changed();
  }

  dismiss(empId: string) {
    const e = this.employee(empId);
    if (!e) return;
    this.city.employees = this.city.employees.filter(x => x !== e);
    this.changed();
  }

  private vehicleAtStation(v: Vehicle) { return v.status === 'available' || v.status === 'out_of_service' || v.status === 'maintenance'; }

  assignEmployee(empId: string, vehicleId: string | null) {
    const e = this.employee(empId);
    if (!e) throw new ActionError('Employee not found.');
    const cur = e.vehicleId ? this.vehicle(e.vehicleId) : null;
    if (cur && !this.vehicleAtStation(cur)) throw new ActionError(`${cur.name} is out on a call.`);
    if (vehicleId) {
      const v = this.vehicle(vehicleId);
      if (!v) throw new ActionError('Vehicle not found.');
      const t = vehicleType(v.typeId);
      if (v.stationId !== e.stationId) throw new ActionError('Employee must be at the same station.');
      if (!this.vehicleAtStation(v)) throw new ActionError(`${v.name} is out on a call.`);
      if (this.crew(v.id).length >= this.crewCap(t.maxCrew)) throw new ActionError(`${v.name} is fully crewed.`);
    }
    e.vehicleId = vehicleId;
    this.changed();
  }

  moveEmployee(empId: string, stationId: string) {
    const e = this.employee(empId), st = this.station(stationId);
    if (!e || !st) throw new ActionError('Not found.');
    if (st.dept !== e.dept) throw new ActionError('Wrong department.');
    if (e.stationId === st.id) return;
    if (this.stationStaff(st.id).length >= this.stationCapacity(st).staff) throw new ActionError('That station is at personnel capacity.');
    const cur = e.vehicleId ? this.vehicle(e.vehicleId) : null;
    if (cur && !this.vehicleAtStation(cur)) throw new ActionError(`${cur.name} is out on a call.`);
    e.vehicleId = null;
    e.stationId = st.id;
    this.changed();
  }

  /** Fill empty crew seats at a station with unassigned staff, specialists first where needed.
   *  With shifts on, each vehicle is crewed separately for shifts A, B and C. */
  autoStaff(stationId: string) {
    const vehicles = this.stationVehicles(stationId).filter(v => this.vehicleAtStation(v));
    const shifts: (string | null)[] = this.state.settings.shifts ? ['A', 'B', 'C'] : [null];
    for (const sh of shifts) {
      const inShift = (e: Employee) => sh == null || e.shift === sh;
      const free = () => this.stationStaff(stationId).filter(e => !e.vehicleId && inShift(e));
      const crewOf = (v: Vehicle) => this.crew(v.id).filter(inShift);
      for (const v of vehicles) {
        const t = vehicleType(v.typeId);
        for (const q of t.quals) {
          let have = crewOf(v).filter(e => e.quals.includes(q.qual)).length;
          while (have < q.count && crewOf(v).length < t.maxCrew) {
            const cand = free().find(e => e.quals.includes(q.qual));
            if (!cand) break;
            cand.vehicleId = v.id; have++;
          }
        }
      }
      for (const v of vehicles) {
        const t = vehicleType(v.typeId);
        while (crewOf(v).length < t.minCrew) {
          const f = free().sort((a, b) => a.quals.length - b.quals.length)[0];
          if (!f) break;
          f.vehicleId = v.id;
        }
      }
    }
    this.changed();
  }

  train(empId: string, qualId: string) {
    const e = this.employee(empId);
    const q = qualification(qualId);
    if (!e || !q) throw new ActionError('Not found.');
    if (!isTrainable(q)) throw new ActionError(`${q.name} is no longer taught.`);
    if (ACADEMIES[q.dept]) {
      if (!this.academyOf(q.dept)) throw new ActionError(`Build a ${ACADEMIES[q.dept].name} first.`);
      if (this.inTraining(q.dept) >= this.academySeats(q.dept)) throw new ActionError(`${ACADEMIES[q.dept].name} is full. Add a classroom or wait for a course to finish.`);
    }
    const needQ = this.needStations(this.deptItemRequirement(q), q.dept); if (needQ) throw new ActionError(needQ + '.');
    if (e.quals.includes(qualId)) throw new ActionError('Already qualified.');
    if (e.training) throw new ActionError('Already in training.');
    const cur = e.vehicleId ? this.vehicle(e.vehicleId) : null;
    if (cur && !this.vehicleAtStation(cur)) throw new ActionError(`${cur.name} is out on a call.`);
    this.spend(q.cost, 'training', e.dept, `${q.name} training: ${e.name}`);
    e.status = 'training';
    // Academy courses run for whole days; other departments keep their hour-based courses.
    e.training = { qual: qualId, until: this.state.time + (q.days ? q.days * 86400 : q.hours * 3600 * this.mod('training') * (this.hasFeature(this.station(e.stationId), 'academy') ? 0.7 : 1)) };
    this.changed();
  }

  promoteXp(e: Employee) { return (e.rank + 1) * 150; }

  promote(empId: string) {
    const e = this.employee(empId);
    if (!e) throw new ActionError('Not found.');
    const d = dept(e.dept);
    if (e.rank >= d.ranks.length - 1) throw new ActionError('Already at the highest rank.');
    if (e.xp < this.promoteXp(e)) throw new ActionError(`Needs ${this.promoteXp(e)} XP.`);
    e.rank++;
    e.salaryPerHour = Math.round(e.salaryPerHour * 1.12);
    this.changed();
  }

  // ------------------------------------------------------------ dispatch
  /** Vehicles currently attached to an incident and not yet released. */
  responding(inc: Incident) {
    return this.incidentVehicles(inc.id).filter(v => ['dispatched', 'enroute', 'onscene'].includes(v.status));
  }

  /** Suggest the closest eligible vehicles to cover what is still missing. */
  recommend(incId: string): { ids: string[]; unfilled: Requirement[] } {
    const inc = this.incident(incId);
    if (!inc || inc.status === 'resolved') return { ids: [], unfilled: [] };
    const missing = missingRequirements(inc.requirements, this.responding(inc));
    const ambNeed = this.patientAmbulanceNeed(inc);
    if (ambNeed > 0) missing.push({ cap: 'ambulance', count: ambNeed });
    const candidates = this.city.vehicles.filter(v => !this.dispatchProblem(v) && v.incidentId == null);
    const chosen: string[] = [];
    const unfilled: Requirement[] = [];
    const ordered = [...missing].sort((a, b) => (capProviders[a.cap] ?? 99) - (capProviders[b.cap] ?? 99));
    for (const r of ordered) {
      for (let i = 0; i < r.count; i++) {
        const best = candidates
          .filter(v => !chosen.includes(v.id) && vehicleType(v.typeId).caps.includes(r.cap))
          .map(v => ({ v, eta: this.etaEstimate(v, inc.pos) + vehicleType(v.typeId).caps.length * 5 }))
          .sort((a, b) => a.eta - b.eta)[0];
        if (best) chosen.push(best.v.id);
        else {
          const ex = unfilled.find(u => u.cap === r.cap);
          if (ex) ex.count++; else unfilled.push({ cap: r.cap, count: 1 });
        }
      }
    }
    return { ids: chosen, unfilled };
  }

  /** Seconds to drive a route: fixed per-vehicle speed or road speed limits. */
  travelSeconds(t: VehicleTypeDef, distanceM: number, roadDurationS: number) {
    const fixed = this.state.settings.travelModel !== 'roads' || t.air;
    const secs = fixed ? distanceM / ((t.mph ?? 45) * 0.44704) : roadDurationS / t.speedFactor;
    return Math.max(10, secs / this.mod('speed') / (this.state.settings.travelMult ?? TUNING.defaultTravelMult));
  }

  etaEstimate(v: Vehicle, to: LatLng) {
    const t = vehicleType(v.typeId);
    const d = distanceM(v.pos, to) * (t.air ? 1 : 1.35);
    const turnout = v.status === 'returning' ? 0 : t.turnoutSec * this.mod('turnout') * TUNING.turnoutMultiplier;
    return turnout + (this.state.settings.travelModel !== 'roads' || t.air ? this.travelSeconds(t, d, 0) : estimateEtaS(v.pos, to, t.speedFactor) / this.mod('speed') / (this.state.settings.travelMult ?? TUNING.defaultTravelMult));
  }

  /** Remaining game seconds until arrival for a vehicle heading to a scene. */
  etaRemaining(v: Vehicle): number | null {
    if ((v.status === 'enroute' || v.status === 'transporting') && v.route && v.route.startAt >= 0) return Math.max(0, v.route.startAt + v.route.durationS - this.state.time);
    if (v.status === 'dispatched') {
      const inc = v.incidentId ? this.incident(v.incidentId) : null;
      const turnout = Math.max(0, v.turnoutUntil - this.state.time);
      if (v.route) return turnout + v.route.durationS;
      return inc ? turnout + this.etaEstimate(v, inc.pos) - vehicleType(v.typeId).turnoutSec : null;
    }
    return null;
  }

  dispatch(incId: string, vehicleIds: string[]) {
    const inc = this.incident(incId);
    if (!inc || inc.status === 'resolved') throw new ActionError('This call is closed.');
    const sent: Vehicle[] = [];
    for (const id of vehicleIds) {
      const v = this.vehicle(id);
      if (!v) continue;
      const problem = this.dispatchProblem(v);
      if (problem) throw new ActionError(`${v.name}: ${problem}`);
      sent.push(v);
    }
    if (!sent.length) throw new ActionError('Select at least one vehicle.');
    // Trailers go only with a towing vehicle sent at the same time (one trailer per tow vehicle).
    const towers = sent.filter(v => !vehicleType(v.typeId).towedBy);
    const usedTow = new Set<string>();
    for (const tr of sent.filter(v => vehicleType(v.typeId).towedBy)) {
      const t = vehicleType(tr.typeId);
      const tow = towers.find(v => !usedTow.has(v.id) && t.towedBy!.includes(v.typeId));
      if (!tow) throw new ActionError(`${tr.name} needs a towing vehicle: ${t.towedBy!.map(id => vehicleType(id).name).join(', ')}.`);
      usedTow.add(tow.id);
    }
    for (const v of sent) {
      const t = vehicleType(v.typeId);
      v.turnoutUntil = this.state.time + (v.status === 'returning' ? 5 : t.turnoutSec * this.mod('turnout') * TUNING.turnoutMultiplier);
      v.status = 'dispatched';
      v.incidentId = inc.id;
      v.route = null;
      this.requestRoute(v, inc.pos);
    }
    if (inc.status === 'pending') inc.status = 'responding';
    this.changed();
  }

  /** Units busy on another job that could be queued to follow up to this call. */
  followUpCandidates(incId: string): Vehicle[] {
    return this.city.vehicles.filter(v =>
      !v.followUp && v.incidentId !== incId &&
      (['dispatched', 'enroute', 'onscene'].includes(v.status) && v.incidentId != null || v.status === 'transporting' || v.status === 'handover') &&
      !this.staffingProblem(v) && v.condition >= MIN_CONDITION);
  }

  /** Queue busy units to go straight to this call when their current job ends. Once per unit. */
  queueFollowUp(incId: string, vehicleIds: string[]) {
    const inc = this.city.incidents.find(i => i.id === incId);
    if (!inc) throw new ActionError('This call is closed.');
    const ok = this.followUpCandidates(incId).map(v => v.id);
    for (const id of vehicleIds) {
      const v = this.vehicle(id);
      if (!v) continue;
      if (v.followUp) throw new ActionError(`${v.name} already has a follow-up.`);
      if (!ok.includes(id)) throw new ActionError(`${v.name} can't follow up right now.`);
      v.followUp = inc.id;
    }
    this.changed();
  }

  cancelFollowUp(vehicleId: string) {
    const v = this.vehicle(vehicleId);
    if (v) { v.followUp = null; this.changed(); }
  }

  /** Status to show the player: a call with only follow-ups queued is no longer "No units". */
  shownStatus(inc: Incident): Incident['status'] | 'followup' {
    if (inc.status === 'pending' && this.city.vehicles.some(v => v.followUp === inc.id)) return 'followup';
    return inc.status;
  }

  followUpsFor(incId: string) { return this.city.vehicles.filter(v => v.followUp === incId); }

  /** Release a unit from a call and send it back to quarters. */
  recall(vehicleId: string) {
    const v = this.vehicle(vehicleId);
    if (!v || !['dispatched', 'enroute', 'onscene'].includes(v.status)) return;
    if (v.status === 'enroute' && v.route) this.chargeTravel(v, this.travelledM(v));
    this.sendHome(v);
    this.changed();
  }

  abandon(incId: string) {
    const inc = this.city.incidents.find(i => i.id === incId);
    if (inc) this.resolve(inc, 'failed');
  }

  private requestRoute(v: Vehicle, to: LatLng) {
    const req = ++v.routeReq;
    const from: LatLng = [...v.pos] as LatLng;
    const stateRef = this.state;
    const vt = vehicleType(v.typeId);
    const build = (data: RouteData): Route => {
      const r = makeRoute(data, 1);
      r.durationS = this.travelSeconds(vt, data.distanceM, data.durationS);
      return r;
    };
    if (this.noSpawn) {
      // Catching up after time away: nobody is watching, so skip the network and
      // use an estimated road distance for the trip.
      v.route = build(directRoute(from, to));
      return;
    }
    if (vt.air) {
      // Helicopters fly straight to the destination.
      const d = distanceM(from, to);
      v.route = build({ coords: [from, to], distanceM: d, durationS: d / 11, approximate: false });
      this.changed();
      return;
    }
    // Start moving right away on a straight-line estimate; swap in the road route
    // when the routing service answers (it is rate limited, so that can take a while).
    v.route = build(directRoute(from, to));
    v.route.provisional = true;
    this.routing.route(from, to)
      .catch(() => directRoute(from, to))
      .then(data => {
        if (this.state !== stateRef || v.routeReq !== req) return; // stale (state reloaded or re-routed)
        const old = v.route;
        if (!old) return; // already arrived on the estimate
        const next = build(data);
        if (old.startAt >= 0) {
          // Keep the share of the trip already driven.
          const frac = Math.min(0.99, (this.state.time - old.startAt) / old.durationS);
          next.startAt = this.state.time - frac * next.durationS;
        }
        v.route = next;
        if (data.approximate) this.emit({ type: 'routing_fallback' });
        this.changed();
      });
  }

  private sendHome(v: Vehicle) {
    // Follow-up: go straight to the queued call instead of returning to quarters.
    if (v.followUp) {
      const target = this.city.incidents.find(i => i.id === v.followUp);
      v.followUp = null;
      if (target && !this.staffingProblem(v)) {
        v.incidentId = target.id;
        v.status = 'dispatched';
        v.turnoutUntil = this.state.time + 5;
        v.route = null;
        this.requestRoute(v, target.pos);
        if (target.status === 'pending') target.status = 'responding';
        this.emit({ type: 'notice', text: `${v.name} is following up to ${target.name}.` });
        return;
      }
    }
    const st = this.station(v.stationId);
    v.incidentId = null;
    if (!st || distanceM(v.pos, st.pos) < 25) {
      v.status = 'available'; v.route = null; v.routeReq++;
      if (st) v.pos = [...st.pos] as LatLng;
      return;
    }
    v.status = 'returning';
    v.route = null;
    this.requestRoute(v, st.pos);
  }

  private travelledM(v: Vehicle) {
    if (!v.route || v.route.startAt < 0) return 0;
    const frac = Math.min(1, (this.state.time - v.route.startAt) / v.route.durationS);
    return v.route.distanceM * frac;
  }

  private chargeTravel(v: Vehicle, meters: number) {
    const t = vehicleType(v.typeId);
    const km = meters / 1000;
    v.odometerKm += km;
    if (this.state.settings.runningCosts === false) return;
    v.condition = Math.max(0, v.condition - km * 0.35 * this.mod('wear'));
    const fuel = km * t.fuelPerKm;
    v.costs.fuel += fuel;
    this.city.accrual[`fuel|${t.dept}`] = (this.city.accrual[`fuel|${t.dept}`] || 0) + fuel;
  }

  // ------------------------------------------------------------ simulation
  tick(dt: number) {
    if (dt <= 0) return;
    this.state.time += dt;
    this.processRecruiting();
    for (const id of Object.keys(this.state.cities)) this.inCity(id, () => this.tickCity(dt, id === this.state.activeCity));
    const rs = this.state.research;
    if (rs.active && this.state.time >= rs.active.until) {
      rs.done.push(rs.active.id);
      this.emit({ type: 'research_done', id: rs.active.id });
      rs.active = null;
      this.changed();
    }
  }

  /**
   * Offline progress: run the simulation forward for time spent away. Vehicles keep
   * driving, calls keep counting down and resolve, training/research/maintenance
   * finish and money moves — but no new calls are generated.
   */
  catchUp(gameSeconds: number) {
    const total = Math.min(gameSeconds, 30 * DAY);
    if (total < 1) return null;
    const before = Object.values(this.state.cities).map(c => ({ c, money: c.money, calls: c.stats.calls, ok: c.stats.successful, failed: c.stats.failed }));
    this.noSpawn = true;
    try {
      const step = total > 6 * 3600 ? 10 : 3;
      let left = total;
      while (left > 0) { const dt = Math.min(step, left); this.tick(dt); left -= dt; }
    } finally {
      this.noSpawn = false;
    }
    const sum = { seconds: total, money: 0, calls: 0, successful: 0, failed: 0 };
    for (const b of before) {
      sum.money += b.c.money - b.money; sum.calls += b.c.stats.calls - b.calls;
      sum.successful += b.c.stats.successful - b.ok; sum.failed += b.c.stats.failed - b.failed;
    }
    this.changed();
    return sum;
  }

  /** Send the recommended units to calls nobody is handling yet, when they can be fully covered. */
  autoDispatch() {
    const mode = this.state.settings.autoDispatch;
    for (const inc of this.city.incidents) {
      if (inc.status !== 'pending') continue;
      if (mode === 'low' && inc.severity > 1) continue;
      const rec = this.recommend(inc.id);
      if (rec.ids.length && !rec.unfilled.length) {
        try { this.dispatch(inc.id, rec.ids); } catch { /* unit became unavailable */ }
      }
    }
  }

  private tickCity(dt: number, active: boolean) {
    const c = this.city;
    if (c.setupStep < SETUP_ORDER.length) return; // city not set up yet: nothing runs
    this.ensureGoals();
    this.accrue(dt);
    this.updateTraining();
    this.updateVehicles();
    this.updateIncidents();
    if (active) this.maybeSpawn();
    if (this.state.settings.autoDispatch !== 'off' && this.state.time - (c.lastAutoCheck || 0) >= 20) { c.lastAutoCheck = this.state.time; this.autoDispatch(); }
    const day = Math.floor(this.state.time / DAY);
    if (day !== c.finance.day) {
      c.finance.yesterday = c.finance.today;
      c.finance.today = emptyBucket();
      c.finance.day = day;
    }
  }

  // ------------------------------------------------------------ cities
  citySlots() {
    const total = Object.values(this.state.cities).reduce((a, c) => a + c.stations.length, 0);
    const unlocked = CITY_SLOT_LEVELS.filter(l => l <= total).length;
    const used = Object.keys(this.state.cities).length;
    const nextLevel = CITY_SLOT_LEVELS[used] ?? null;
    return { unlocked, used, nextLevel, canAdd: used < unlocked };
  }

  addCity(def: CityDef) {
    if (!this.citySlots().canAdd) throw new ActionError(`Your next city unlocks at ${this.citySlots().nextLevel} total stations.`);
    if (this.state.cities[def.id]) throw new ActionError('You already run that city.');
    if (!CITIES.some(c => c.id === def.id)) this.state.cityDefs[def.id] = def;
    const cs = newCityState(def.id);
    cs.lastHour = Math.floor(this.state.time / 3600);
    cs.finance.day = Math.floor(this.state.time / DAY);
    this.state.cities[def.id] = cs;
    this.state.activeCity = def.id;
    this.changed();
  }

  switchCity(id: string) {
    if (!this.state.cities[id]) throw new ActionError('City not found.');
    this.state.activeCity = id;
    this.spawning = false;
    this.changed();
  }

  private accrue(dt: number) {
    const c = this.city;
    const h = dt / 3600;
    const add = (k: string, n: number) => (c.accrual[k] = (c.accrual[k] || 0) + n);
    const salary = this.mod('salary'), contract = this.mod('contract'), maintM = this.mod('maintenance');
    const costs = this.state.settings.runningCosts !== false;
    void salary; // payroll removed: staff have no wages
    for (const s of c.stations) {
      const t = stationType(s.typeId);
      if (costs) add(`station upkeep|${s.dept}`, t.upkeepPerHour * (1 + s.level * 0.05) * h);
      if (this.setupDone) add(`city contract|${s.dept}`, -t.contractPerHour * contract * h);
    }
    for (const id of c.agreements || []) {
      const a = AGREEMENTS.find(x => x.id === id);
      if (a && this.agreementActive(id)) add(`regional agreements|${a.dept}`, -a.incomePerHour * contract * h);
    }
    for (const v of c.vehicles) {
      const t = vehicleType(v.typeId);
      if (!costs) continue;
      const m = t.maintenancePerHour * maintM * h;
      v.costs.maintenance += m;
      add(`maintenance|${t.dept}`, m);
    }
    const hour = Math.floor(this.state.time / 3600);
    if (hour !== c.lastHour) {
      c.lastHour = hour;
      for (const [k, amt] of Object.entries(c.accrual)) {
        const [cat, d] = k.split('|');
        if (Math.abs(amt) >= 1) this.post(-amt, cat, d, cat === 'city contract' ? 'City service contract' : cat === 'regional agreements' ? 'Regional agreements' : `Hourly ${cat}`);
      }
      c.accrual = {};
      this.changed();
    }
  }

  private updateTraining() {
    for (const e of this.city.employees) {
      if (e.training && this.state.time >= e.training.until) {
        e.quals.push(e.training.qual);
        this.emit({ type: 'training_done', empId: e.id, qual: e.training.qual });
        e.training = null;
        e.status = 'on_duty';
        this.changed();
      }
    }
  }

  private updateVehicles() {
    const now = this.state.time;
    for (const v of this.city.vehicles) {
      switch (v.status) {
        case 'dispatched':
          if (now >= v.turnoutUntil && v.route) {
            v.route.startAt = now; v.status = 'enroute'; this.changed();
          }
          break;
        case 'returning':
        case 'transporting':
          if (v.route && v.route.startAt < 0) v.route.startAt = now;
        // falls through
        case 'enroute': {
          const r = v.route;
          if (!r || r.startAt < 0) break;
          const frac = (now - r.startAt) / r.durationS;
          if (frac >= 1) this.arrive(v);
          else v.pos = pointAlong(r, frac);
          break;
        }
        case 'maintenance':
          if (now >= v.maintenanceUntil) { v.condition = 100; v.status = 'available'; this.changed(); }
          break;
        case 'handover':
          if (now >= (v.busyUntil ?? 0)) { v.cargo = null; this.sendHome(v); this.changed(); }
          break;
      }
    }
  }

  private arrive(v: Vehicle) {
    const r = v.route!;
    v.pos = r.coords[r.coords.length - 1];
    this.chargeTravel(v, r.distanceM);
    v.route = null;
    if (v.status === 'transporting' && v.cargo) {
      const cg = v.cargo;
      const km = r.distanceM / 1000;
      const cells = cg.kind === 'prisoner' && this.hasFeature(this.station(cg.dest), 'cells') ? 1.5 : 1;
      // Patient transport itself pays nothing (MissionChief style); hospitals earn per admission below.
      cg.fee = cg.kind === 'patient' ? 0 : Math.round((200 + 80 * km) * cg.count * this.mod('transport') * cells);
      this.progressGoal(cg.kind === 'patient' ? 'patients' : 'prisoners', cg.count);
      if (cg.fee) this.post(cg.fee, 'prisoner transport', vehicleType(v.typeId).dept, `${v.name} → ${cg.destName}`);
      const oh = cg.kind === 'patient' ? this.ownedHospital(cg.dest) : null;
      if (oh) {
        cg.fee = admissionFee(cg.specialty) * cg.count;
        this.post(cg.fee, 'hospital admissions', 'ems', `${oh.name}: ${cg.count} admitted`);
        oh.occupied = oh.occupied.filter(t => t > this.state.time); // tidy up freed beds
      }
      v.status = 'handover';
      v.busyUntil = this.state.time + TUNING.handoverSeconds;
      this.emit({ type: 'transport_done', id: v.id, kind: cg.kind, count: cg.count, fee: cg.fee, dest: cg.destName });
    } else if (v.status === 'returning') {
      const st = this.station(v.stationId);
      if (st) v.pos = [...st.pos] as LatLng;
      v.status = 'available';
    } else {
      v.status = 'onscene';
      v.calls++;
      const inc = v.incidentId ? this.incident(v.incidentId) : null;
      if (inc) v.pos = this.scenePos(inc, v);
      this.emit({ type: 'vehicle_arrived', id: v.id, incidentId: v.incidentId || '' });
    }
    this.changed();
  }

  /** Spread units on scene slightly so they are visible as separate markers. */
  private scenePos(inc: Incident, v: Vehicle): LatLng {
    const n = this.incidentVehicles(inc.id).filter(x => x.status === 'onscene' && x !== v).length;
    return destination(inc.pos, (n * 67) % 360, 28 + 6 * Math.floor(n / 5));
  }

  private updateIncidents() {
    const now = this.state.time;
    for (const inc of [...this.city.incidents]) {
      if (inc.patients > 0 && !inc.patientList) this.ensurePatients(inc); // calls from before patient cards
      this.updatePatients(inc, now);
      const onScene = this.incidentVehicles(inc.id).filter(v => v.status === 'onscene');
      // All patients handled and nothing else to do (EMS-only call): done.
      if (inc.patientList && this.patientsDone(inc) && this.sceneReqs(inc).length === 0 && !(incidentType(inc.typeId).staff ?? []).length && inc.firstOnSceneAt != null) {
        this.resolve(inc, this.outcomeFor(inc)); continue;
      }
      if (inc.status === 'working') {
        // Work only continues while every required unit is still on scene.
        if (!inc.partial && (missingRequirements(this.sceneReqs(inc), onScene).length > 0 || this.missingStaff(inc, onScene).length > 0)) {
          inc.workRemaining = Math.max(0, (inc.workUntil ?? now) - now);
          inc.workDone = now - (inc.workStartedAt ?? now);
          inc.workUntil = null;
          inc.status = onScene.length ? 'onscene' : this.responding(inc).length ? 'responding' : 'pending';
          this.changed();
          continue;
        }
        // The call ends when the work is done and every patient has been treated.
        if (now >= (inc.workUntil ?? 0) && this.patientsDone(inc)) this.resolve(inc, this.outcomeFor(inc));
        continue;
      }
      if (onScene.length > 0 && inc.firstOnSceneAt == null) inc.firstOnSceneAt = now;
      const missing = missingRequirements(this.sceneReqs(inc), onScene);
      if (onScene.length > 0 && missing.length === 0 && this.missingStaff(inc, onScene).length === 0) { this.startWork(inc); continue; }
      const prev = inc.status;
      inc.status = onScene.length ? 'onscene' : this.responding(inc).length ? 'responding' : 'pending';
      if (prev !== inc.status) this.changed();
      if (!TUNING.responseTimeLimit) continue; // no time limit: the call waits for you
      if (now < inc.deadline) continue;
      const t = incidentType(inc.typeId);
      if (!inc.late && !inc.escalated && onScene.length === 0) {
        inc.escalated = true;
        inc.severity = Math.min(3, inc.severity + 1);
        inc.requirements = mergeRequirements(inc.requirements, t.escalation);
        inc.reward = Math.round(inc.reward * 1.6);
        inc.xp = Math.round(inc.xp * 1.5);
        inc.deadline = now + t.deadlineMin * 60 * 0.8;
        this.emit({ type: 'incident_escalated', id: inc.id });
      } else if (!inc.late) {
        inc.late = true;
        inc.deadline = now + Math.max(300, t.deadlineMin * 60 * 0.6);
        this.emit({ type: 'incident_late', id: inc.id });
      } else if (onScene.length > 0) {
        inc.partial = true;
        this.startWork(inc);
      } else {
        this.resolve(inc, 'failed');
      }
      this.changed();
    }
  }

  private startWork(inc: Incident) {
    const t = incidentType(inc.typeId);
    inc.status = 'working';
    const now = this.state.time;
    if (inc.firstOnSceneAt == null) inc.firstOnSceneAt = now;
    if (inc.workRemaining != null && inc.workStartedAt != null && inc.workUntil == null) {
      // Resume paused work: keep the progress already made.
      const total = inc.workRemaining + (inc.workDone ?? 0);
      inc.workStartedAt = now - (total - inc.workRemaining);
      inc.workUntil = now + inc.workRemaining;
      inc.workRemaining = null;
    } else {
      inc.workStartedAt = now;
      inc.workUntil = now + Math.max(20, rand(t.workMin[0], t.workMin[1]) * 60 * (this.state.settings.workMult ?? TUNING.defaultWorkMult) * (inc.partial ? 1.4 : 1));
    }
    this.changed();
  }

  private outcomeFor(inc: Incident): Outcome {
    if (inc.partial) return 'partial';
    if (inc.escalated) return 'escalated';
    if (inc.late) return 'delayed';
    return 'successful';
  }

  private resolve(inc: Incident, outcome: Outcome) {
    const c = this.city;
    const primary = this.primaryDept(inc);
    const mult: Record<Outcome, number> = { successful: 1, escalated: 0.8, delayed: 0.7, partial: 0.35, failed: 0 };
    let payout = 0;
    if (outcome === 'failed') {
      const fine = Math.round(inc.reward * 0.1);
      this.post(-fine, 'penalties', primary, `Failed response ${inc.number}`);
      payout = -fine;
      c.stats.failed++;
    } else {
      const base = Math.round(inc.reward * mult[outcome] * this.mod('reward') * (this.state.settings.rewardMult ?? 1));
      this.post(base, 'incident rewards', primary, `${inc.name} ${inc.number}`);
      payout = base;
      if (outcome === 'successful') {
        c.stats.successful++;
        this.progressGoal('success');
        const catDept = CATEGORY_DEPT[inc.category];
        if (['fire', 'police', 'ems'].includes(catDept)) this.progressGoal(`success_${catDept}`);
        if (inc.severity >= 3) this.progressGoal('major');
        if (this.fastResponse(inc)) {
          this.progressGoal('fast');
          const bonus = Math.round(inc.reward * 0.2);
          this.post(bonus, 'performance bonuses', primary, `Fast response ${inc.number}`);
          payout += bonus;
        }
      }
      if (inc.severity >= 3 && (outcome === 'successful' || outcome === 'escalated')) {
        const bonus = Math.round(inc.reward * 0.25);
        this.post(bonus, 'major incident bonuses', primary, `Major incident ${inc.number}`);
        payout += bonus;
      }
      this.addXp(inc.xp * mult[outcome] * this.mod('xp'));
      const onScene = this.incidentVehicles(inc.id).filter(v => v.status === 'onscene');
      for (const v of onScene) for (const e of this.crew(v.id)) e.xp += 5 * inc.severity;
    }
    c.stats.calls++;
    inc.status = 'resolved';
    inc.outcome = outcome;
    inc.resolvedAt = this.state.time;
    inc.payout = payout;
    for (const v of c.vehicles) if (v.followUp === inc.id) v.followUp = null;
    if (outcome !== 'failed') this.assignTransports(inc);
    for (const v of this.incidentVehicles(inc.id)) {
      if (v.status === 'enroute') this.chargeTravel(v, this.travelledM(v));
      this.sendHome(v);
    }
    c.incidents = c.incidents.filter(i => i !== inc);
    c.resolved.unshift(inc);
    if (c.resolved.length > 40) c.resolved.length = 40;
    this.emit({ type: 'incident_resolved', id: inc.id, outcome, payout });
    this.changed();
  }

  /** All units on scene within the first half of the original response window. */
  private fastResponse(inc: Incident) {
    const t = incidentType(inc.typeId);
    const first = inc.firstOnSceneAt ?? inc.workStartedAt;
    return first != null && first - inc.createdAt <= t.deadlineMin * 60 * 0.5;
  }

  primaryDept(inc: Incident) {
    const cap = inc.requirements[0]?.cap;
    return CAPABILITIES.find(c => c.id === cap)?.dept || 'fire';
  }

  // ------------------------------------------------------------ incident generation
  /** Max active calls = the most stations any one department has, plus one. */
  activeCap() {
    const counts: Record<string, number> = {};
    for (const s of this.city.stations) counts[s.dept] = (counts[s.dept] || 0) + 1;
    return Math.max(0, ...Object.values(counts)) + TUNING.callCapBonus;
  }

  /** A new call every 1, 3 or 5 game minutes (Settings). */
  private spawnInterval() {
    return (this.state.settings.callIntervalMin ?? 3) * 60;
  }

  private maybeSpawn() {
    const c = this.city;
    if (this.noSpawn) { c.nextIncidentAt = Math.max(c.nextIncidentAt, this.state.time + this.spawnInterval()); return; }
    if (this.spawning || this.state.time < c.nextIncidentAt) return;
    if (c.incidents.length >= this.activeCap()) { c.nextIncidentAt = this.state.time + 10; return; }
    c.nextIncidentAt = this.state.time + this.spawnInterval();
    this.spawnIncident().catch(() => undefined);
  }

  /** Incident types the player can currently be sent (unlocked and staffed departments). */
  eligibleTypes() {
    return INCIDENT_TYPES.filter(t => this.stationCount() >= t.unlockLevel && this.fleetCovers(t.requirements) &&
      (t.staff ?? []).every(r => this.trainedStaff(r.training) >= r.count));
  }

  /** People with a training (not currently in a course). */
  trainedStaff(training: string) {
    const quals = STAFF_TRAININGS[training]?.quals ?? [training];
    return this.city.employees.filter(e => !e.training && e.quals.some(q => quals.includes(q))).length;
  }

  /** Trained people riding on these vehicles (on-duty crew). */
  staffOn(training: string, vehicles: Vehicle[]) {
    const quals = STAFF_TRAININGS[training]?.quals ?? [training];
    let n = 0;
    for (const v of vehicles) n += this.crew(v.id).filter(e => !e.training && e.quals.some(q => quals.includes(q))).length;
    return n;
  }

  /** Trained personnel a call still lacks given these vehicles. */
  missingStaff(inc: Incident, vehicles: Vehicle[]) {
    const need = incidentType(inc.typeId).staff ?? [];
    return need.map(r => ({ training: r.training, count: r.count - this.staffOn(r.training, vehicles) })).filter(r => r.count > 0);
  }

  // ---- Individual patients
  static EMS_CAPS = ['ambulance', 'als', 'ccu', 'ems_supervisor', 'mci'];
  isMedic(v: Vehicle) { const t = vehicleType(v.typeId); return t.transport?.kind === 'patient' || ['ambulance', 'als', 'ccu'].some(c => t.caps.includes(c)); }

  ensurePatients(inc: Incident) {
    if (!inc.patients || inc.patientList) return;
    inc.patientList = Array.from({ length: inc.patients }, (_, i) => ({
      id: `${inc.id}-p${i}`, name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)[0]}.`,
      needsTransport: Math.random() < 0.75, treatSec: 40 + Math.floor(Math.random() * 80), status: 'untreated' as const,
    }));
  }
  /** Ambulances still wanted: untreated patients not yet covered by a medic on the way or free on scene. */
  patientAmbulanceNeed(inc: Incident, extra: Vehicle[] = []) {
    if (!inc.patientList) return 0;
    const busy = new Set(inc.patientList.filter(p => p.status === 'treating').map(p => p.vehicleId));
    const free = [...this.responding(inc), ...extra].filter(v => this.isMedic(v) && !busy.has(v.id) && (v.patientLoad ?? 0) === 0).length;
    return this.untreated(inc) - free; // negative = more ambulances than patients waiting
  }
  patientsDone(inc: Incident) { return !inc.patientList || inc.patientList.every(p => p.status === 'released' || p.status === 'transport'); }
  untreated(inc: Incident) { return (inc.patientList ?? []).filter(p => p.status === 'untreated').length; }

  /** Ambulances on scene treat one patient at a time; then transport or release and take the next. */
  private updatePatients(inc: Incident, now: number) {
    const list = inc.patientList;
    if (!list) return;
    const medics = this.incidentVehicles(inc.id).filter(v => v.status === 'onscene' && this.isMedic(v));
    // A medic that left mid-treatment hands the patient back.
    for (const p of list) if (p.status === 'treating' && !medics.some(v => v.id === p.vehicleId)) { p.status = 'untreated'; p.vehicleId = null; p.until = undefined; }
    for (const v of medics) {
      const cap = vehicleType(v.typeId).transport?.capacity ?? 1;
      let cur = list.find(p => p.status === 'treating' && p.vehicleId === v.id);
      if (cur && now >= (cur.until ?? 0)) {
        cur.status = cur.needsTransport ? 'transport' : 'released';
        if (cur.needsTransport) v.patientLoad = (v.patientLoad ?? 0) + 1;
        cur = undefined;
        this.changed();
      }
      if (cur) continue;
      const next = (v.patientLoad ?? 0) < cap ? list.find(p => p.status === 'untreated') : undefined;
      if (next) { next.status = 'treating'; next.vehicleId = v.id; next.until = now + next.treatSec; this.changed(); continue; }
      if ((v.patientLoad ?? 0) > 0) this.takeToHospital(v, inc);
    }
  }

  private takeToHospital(v: Vehicle, inc: Incident) {
    const n = v.patientLoad ?? 0;
    v.patientLoad = 0;
    const dest = this.hospitalFor(v.pos, n, inc.specialty);
    const oh = dest.owned ? this.ownedHospital(dest.id) : null;
    if (oh) for (let i = 0; i < n; i++) oh.occupied.push(this.state.time + HOSPITAL.stayHours * 3600);
    v.cargo = { kind: 'patient', count: n, dest: dest.id, destName: dest.name, fee: 0, specialty: inc.specialty };
    v.status = 'transporting';
    v.incidentId = null;
    v.route = null;
    this.requestRoute(v, dest.pos);
    this.changed();
  }

  /** Requirements still to meet: once every patient is handled, EMS units are no longer needed on scene. */
  private sceneReqs(inc: Incident) {
    return this.patientsDone(inc) && inc.patientList ? inc.requirements.filter(r => !Game.EMS_CAPS.includes(r.cap)) : inc.requirements;
  }

  /** True when the player's own fleet (busy or not) has every vehicle a call needs. */
  fleetCovers(reqs: Requirement[]) {
    return missingRequirements(reqs, this.city.vehicles).length === 0;
  }

  /**
   * Could the player field this capability? Fire/police/EMS basics only need the department;
   * specialist units (extension-only or from other departments) must actually be owned,
   * so those calls only appear once you have the unit.
   */
  canCover(cap: string) {
    const core = ['fire', 'police', 'ems'];
    const providers = VEHICLE_TYPES.filter(v => v.caps.includes(cap));
    if (providers.some(v => core.includes(v.dept) && !v.needsExt) && this.hasDept(CAPABILITIES.find(c => c.id === cap)!.dept)) return true;
    return this.city.vehicles.some(v => vehicleType(v.typeId).caps.includes(cap));
  }

  async spawnIncident(typeId?: string): Promise<Incident | null> {
    if (this.spawning) return null;
    const types = this.eligibleTypes();
    const t = typeId ? incidentType(typeId) : this.weightedPick(types);
    if (!t || !this.city.stations.length) return null;
    this.spawning = true;
    const c = this.city, def = this.cityDef;
    try {
      const primary = CAPABILITIES.find(x => x.id === t.requirements[0].cap)!.dept;
      const anchors = c.stations.filter(s => s.dept === primary);
      const anchor = pick(anchors.length ? anchors : c.stations);
      const parent = await this.createIncident(t, c, def, anchor.pos, stationType(anchor.typeId).coverageKm * 1000, null);
      if (parent && t.children) {
        // Major event: related calls appear around the main scene.
        const allowed = t.children.types.map(incidentType).filter(ct => this.fleetCovers(ct.requirements));
        const room = this.activeCap() - c.incidents.length;
        const n = Math.min(room, Math.round(rand(t.children.count[0], t.children.count[1])));
        let made = 0;
        for (let i = 0; i < n && allowed.length; i++) {
          const child = await this.createIncident(pick(allowed), c, def, parent.pos, t.children.radiusKm * 1000, parent.id);
          if (child) made++;
        }
        this.emit({ type: 'major_event', id: parent.id, children: made }, c.cityId);
      }
      return parent;
    } finally {
      this.spawning = false;
    }
  }

  private async createIncident(t: IncidentTypeDef, c: CityState, def: CityDef, around: LatLng, radius: number, parentId: string | null): Promise<Incident | null> {
    const stateRef = this.state;
    const [[s, w], [n, e]] = def.bounds;
    let pos: LatLng | null = null, street = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      let p = destination(around, rand(0, 360), Math.sqrt(Math.random()) * radius * 0.95 + 150);
      p = [Math.min(n, Math.max(s, p[0])), Math.min(e, Math.max(w, p[1]))];
      let snapped: { pos: LatLng; name: string } | null = null;
      try { snapped = await this.routing.nearest(p); } catch { snapped = null; }
      if (!snapped) { pos = pos || p; break; }          // routing service down: use the raw point
      pos = snapped.pos;
      if (snapped.name) { street = snapped.name; break; } // prefer named streets
    }
    if (this.state !== stateRef || !pos || !this.state.cities[c.cityId]) return null;
    const district = this.districtFor(pos, def);
    const num = (Math.floor(rand(1, 60)) * 2 + (Math.random() < 0.5 ? 1 : 0)) * 10 + Math.floor(rand(0, 9));
    const address = street ? `${num} ${street}` : `Near ${district}`;
    const range = (r?: [number, number]) => (r ? Math.round(rand(r[0], r[1])) : 0);
    c.incidentCounter++;
    const inc: Incident = {
      id: this.id('i'), number: `${def.prefix}-${String(c.incidentCounter).padStart(5, '0')}`,
      typeId: t.id, name: t.name, category: t.category, pos, address, district, severity: t.severity,
      description: pick(t.descriptions), requirements: t.requirements.map(r => ({ ...r })),
      createdAt: this.state.time, receivedAt: Date.now(), deadline: this.state.time + t.deadlineMin * 60,
      escalated: false, late: false, partial: false, status: 'pending', workUntil: null, workStartedAt: null,
      reward: Math.round(t.reward * rand(0.9, 1.15)), xp: t.xp, outcome: null, resolvedAt: null, payout: 0,
      patients: range(t.patients), prisoners: range(t.prisoners), parentId,
    };
    // Each ambulance carries one patient and each police car one suspect, so a call needs
    // one of each per person. Never generate more people than the player can move.
    const owned = (cap: string) => this.city.vehicles.filter(v => vehicleType(v.typeId).caps.includes(cap)).length;
    const carriers = this.city.vehicles.filter(v => { const t = vehicleType(v.typeId); return t.caps.includes('police') && t.transport?.kind === 'prisoner'; }).length;
    const chiefCap = owned('ems_supervisor') > 0 ? TUNING.maxPatientAmbulances : TUNING.emsChiefAboveAmbulances;
    inc.patients = Math.min(inc.patients, owned('ambulance'), chiefCap);
    inc.prisoners = Math.min(inc.prisoners, carriers, TUNING.maxPrisoners);
    const raise = (caps: string[], add: string, need: number) => {
      const have = inc.requirements.filter(r => caps.includes(r.cap)).reduce((n, r) => n + r.count, 0);
      if (have >= need) return;
      const r = inc.requirements.find(x => x.cap === add);
      if (r) r.count += need - have; else inc.requirements.push({ cap: add, count: need - have });
    };
    if (inc.prisoners > 0) raise(['police'], 'police', inc.prisoners);
    // Calls with no other work left can't ask for more units than the player owns.
    if (!this.fleetCovers(inc.requirements)) {
      for (const r of inc.requirements) if (r.cap === 'ambulance' || r.cap === 'police') r.count = Math.max(1, Math.min(r.count, owned(r.cap)));
    }
    addEmsChief(inc.requirements, inc.patients);
    // Patients are handled one by one by ambulances (see updatePatients), so plain
    // ambulances aren't a fixed requirement; ALS / critical care requirements stay.
    if (inc.patients > 0) { inc.requirements = inc.requirements.filter(r => r.cap !== 'ambulance'); this.ensurePatients(inc); }
    // About half of patient calls need specialist care at the hospital.
    if (inc.patients > 0 && Math.random() < 0.5) {
      const opts = SPECIALTY_BY_CATEGORY[inc.category] ?? [];
      if (opts.length) inc.specialty = opts[Math.floor(Math.random() * opts.length)];
    }
    c.incidents.push(inc);
    this.emit({ type: 'incident_new', id: inc.id }, c.cityId);
    this.changed();
    return inc;
  }

  // ------------------------------------------------------------ facilities & transport
  /** Public hospitals (always accept patients) plus the player's own hospitals. */
  hospitals(def: CityDef = this.cityDef): Facility[] {
    const own: Facility[] = def === this.cityDef ? (this.city.hospitals ?? []).map(h => ({ id: h.id, kind: 'hospital', name: h.name, pos: h.pos, owned: true })) : [];
    const pub: Facility[] = def.hospitals && def.hospitals.length ? def.hospitals : [{ id: 'h-general', kind: 'hospital', name: `${def.name} General Hospital`, pos: def.center }];
    return [...own, ...pub];
  }

  // ---- Player hospitals (MissionChief style)
  ownedHospital(id: string) { return this.city.hospitals?.find(h => h.id === id); }
  hospitalBeds(h: { extraBeds: number }) { return HOSPITAL.baseBeds + h.extraBeds; }
  hospitalFreeBeds(h: { extraBeds: number; occupied: number[] }) {
    const now = this.state.time;
    return this.hospitalBeds(h) - h.occupied.filter(t => t > now).length;
  }

  buildHospital(pos: LatLng, name?: string, address?: string) {
    this.spend(HOSPITAL.cost, 'stations', 'ems', 'Built a hospital');
    const list = (this.city.hospitals ??= []);
    const h = { id: this.id('hosp'), name: name?.trim() || `${this.cityDef.name} Hospital ${list.length + 1}`, pos, address, extraBeds: 0, specialties: [], occupied: [] };
    list.push(h);
    this.changed();
    return h;
  }

  addHospitalBed(id: string) {
    const h = this.ownedHospital(id);
    if (!h) throw new ActionError('Hospital not found.');
    if (h.extraBeds >= HOSPITAL.maxExtraBeds) throw new ActionError('This hospital has the most beds possible.');
    this.spend(HOSPITAL.bedCost, 'stations', 'ems', `${h.name}: extra bed`);
    h.extraBeds++;
    this.changed();
  }

  addSpecialty(id: string, spec: string) {
    const h = this.ownedHospital(id);
    const sp = SPECIALTIES.find(s => s.id === spec);
    if (!h || !sp) throw new ActionError('Not found.');
    if (h.specialties.includes(spec)) throw new ActionError(`${sp.name} is already here.`);
    this.spend(sp.cost, 'stations', 'ems', `${h.name}: ${sp.name}`);
    h.specialties.push(spec);
    this.changed();
  }

  renameHospital(id: string, name: string) {
    const h = this.ownedHospital(id);
    if (h && name.trim()) { h.name = name.trim().slice(0, 40); this.changed(); }
  }

  /** Nearest hospital that can take these patients: your own (free beds + right specialty) first, else a public one. */
  private hospitalFor(from: LatLng, count: number, spec?: string): Facility {
    const own = (this.city.hospitals ?? []).filter(h => this.hospitalFreeBeds(h) >= count && (!spec || h.specialties.includes(spec)));
    if (own.length) {
      const h = own.reduce((b, x) => (distanceM(from, x.pos) < distanceM(from, b.pos) ? x : b));
      return { id: h.id, kind: 'hospital', name: h.name, pos: h.pos, owned: true };
    }
    return this.nearestFacility(this.hospitals().filter(f => !f.owned), from);
  }

  jails(): Facility[] {
    const p = this.city.stations.filter(s => s.dept === 'police');
    if (p.length) return p.map(s => ({ id: s.id, kind: 'jail' as const, name: s.name, pos: s.pos }));
    return [{ id: 'jail-county', kind: 'jail', name: 'County Jail', pos: this.cityDef.center }];
  }

  private nearestFacility(list: Facility[], p: LatLng) {
    return list.reduce((best, f) => (distanceM(p, f.pos) < distanceM(p, best.pos) ? f : best));
  }

  /** After a call is worked, load patients and prisoners into suitable units on scene. */
  private assignTransports(inc: Incident) {
    const onScene = this.incidentVehicles(inc.id).filter(v => v.status === 'onscene');
    const left: Record<'patient' | 'prisoner', number> = { patient: inc.patientList ? 0 : inc.patients || 0, prisoner: inc.prisoners || 0 };
    // Largest carriers first so vans and MCI units take the bulk.
    const carriers = onScene.filter(v => vehicleType(v.typeId).transport)
      .sort((a, b) => vehicleType(b.typeId).transport!.capacity - vehicleType(a.typeId).transport!.capacity);
    for (const v of carriers) {
      const tr = vehicleType(v.typeId).transport!;
      const n = Math.min(tr.capacity, left[tr.kind]);
      if (n <= 0) continue;
      left[tr.kind] -= n;
      const dest = tr.kind === 'patient' ? this.hospitalFor(v.pos, n, inc.specialty) : this.nearestFacility(this.jails(), v.pos);
      // Reserve the beds now so two ambulances don't overfill one hospital.
      const oh = dest.owned ? this.ownedHospital(dest.id) : null;
      if (oh) for (let i = 0; i < n; i++) oh.occupied.push(this.state.time + HOSPITAL.stayHours * 3600);
      v.cargo = { kind: tr.kind, count: n, dest: dest.id, destName: dest.name, fee: 0, specialty: tr.kind === 'patient' ? inc.specialty : undefined };
      v.status = 'transporting';
      v.incidentId = null;
      v.route = null;
      this.requestRoute(v, dest.pos);
    }
    if (left.patient > 0) this.emit({ type: 'notice', text: `${left.patient} patient${left.patient > 1 ? 's' : ''} from ${inc.name} had no ambulance for transport — fee lost.` });
    if (left.prisoner > 0) this.emit({ type: 'notice', text: `${left.prisoner} suspect${left.prisoner > 1 ? 's' : ''} from ${inc.name} released — no unit to transport them.` });
  }

  private weightedPick<T extends { weight: number }>(items: T[]): T | null {
    const total = items.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * total;
    for (const it of items) { r -= it.weight; if (r <= 0) return it; }
    return items[items.length - 1] || null;
  }

  districtFor(p: LatLng, def: CityDef = this.cityDef): string {
    const ds = def.districts;
    if (!ds.length) return def.name;
    return ds.reduce((best, d) => (distanceM(p, d.center) < distanceM(p, best.center) ? d : best)).name;
  }

  // ------------------------------------------------------------ reporting helpers
  hourlyCosts() {
    const c = this.city;
    let payroll = 0, upkeep = 0, maint = 0, contract = 0;
    // staff have no wages
    c.stations.forEach(s => {
      const t = stationType(s.typeId);
      upkeep += t.upkeepPerHour * (1 + s.level * 0.05);
      contract += t.contractPerHour * this.mod('contract');
    });
    for (const id of c.agreements || []) { const a = AGREEMENTS.find(x => x.id === id); if (a && this.agreementActive(id)) contract += a.incomePerHour * this.mod('contract'); }
    c.vehicles.forEach(v => (maint += vehicleType(v.typeId).maintenancePerHour * this.mod('maintenance')));
    if (this.state.settings.runningCosts === false) { payroll = 0; upkeep = 0; maint = 0; }
    return { payroll, upkeep, maint, contract, net: contract - payroll - upkeep - maint };
  }
}

export { STATION_TYPES, VEHICLE_TYPES, DEPARTMENTS };
