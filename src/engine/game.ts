// Game engine: pure TypeScript, no UI or browser dependencies apart from the
// injected RoutingProvider. The UI calls actions and tick(); it never mutates
// state directly.

import type {
  CityState, Employee, FinanceBucket, GameEvent, GameState, Incident, LatLng, Outcome,
  Requirement, RoutingProvider, Station, Vehicle,
} from './types';
import {
  CAPABILITIES, DEPARTMENTS, QUALIFICATIONS, STARTER_KITS, STARTING_MONEY, STATION_TYPES, VEHICLE_TYPES,
  dept, qualification, stationType, stationTypeForDept, vehicleType,
} from '../data/departments';
import { INCIDENT_TYPES, incidentType } from '../data/incidents';
import { city as cityDef } from '../data/cities';
import { FIRST_NAMES, LAST_NAMES } from '../data/names';
import { destination, directRoute, distanceM, estimateEtaS, makeRoute, pointAlong } from './geo';

export const SCHEMA = 1;
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

export function newGameState(cityId = 'atlanta'): GameState {
  const deptFilter: Record<string, boolean> = {};
  DEPARTMENTS.forEach(d => (deptFilter[d.id] = true));
  return {
    schema: SCHEMA,
    createdAt: new Date().toISOString(),
    time: 8 * 3600, // Day 1, 08:00
    xp: 0, level: 1, activeCity: cityId,
    cities: { [cityId]: newCityState(cityId) },
    seq: 1,
    settings: { speed: 1, routingUrl: 'https://router.project-osrm.org', tileStyle: 'osm', showCoverage: false, deptFilter },
  };
}

/** Validate & upgrade a loaded/imported save. Throws on garbage. */
export function migrate(raw: unknown): GameState {
  const s = raw as GameState;
  if (!s || typeof s !== 'object' || typeof s.time !== 'number' || !s.cities || !s.activeCity || !s.cities[s.activeCity]) {
    throw new Error('This file is not an Emergency Operations save.');
  }
  if (s.schema > SCHEMA) throw new Error('This save was made by a newer version of the game.');
  const fresh = newGameState(s.activeCity);
  s.settings = { ...fresh.settings, ...(s.settings || {}) };
  s.settings.deptFilter = { ...fresh.settings.deptFilter, ...(s.settings.deptFilter || {}) };
  if (!['osm', 'hot'].includes(s.settings.tileStyle)) s.settings.tileStyle = 'osm'; // CARTO styles retired (need a key)
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
      pool.splice(best, 1);
      left--;
    }
    if (left > 0) missing.push({ cap: r.cap, count: left });
  }
  return missing;
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
  version = 0;

  constructor(state: GameState, public routing: RoutingProvider) {
    this.state = state;
  }

  get city(): CityState { return this.state.cities[this.state.activeCity]; }
  get cityDef() { return cityDef(this.state.activeCity); }
  get setupDone() { return this.city.setupStep >= SETUP_ORDER.length; }

  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  onEvent(fn: (e: GameEvent) => void) { this.eventListeners.add(fn); return () => { this.eventListeners.delete(fn); }; }
  changed() { this.version++; this.listeners.forEach(f => f()); }
  private emit(e: GameEvent) { this.eventListeners.forEach(f => f(e)); }
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
    for (const v of this.city.vehicles) {
      if (v.status === 'dispatched' && !v.route) {
        const inc = this.incident(v.incidentId || '');
        if (inc) this.requestRoute(v, inc.pos); else this.sendHome(v);
      } else if (v.status === 'returning' && !v.route) {
        this.sendHome(v);
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

  stationCapacity(s: Station) { return stationType(s.typeId).levels[s.level]; }

  /** Returns null if the vehicle has enough qualified, on-duty crew; otherwise a reason. */
  staffingProblem(v: Vehicle): string | null {
    const t = vehicleType(v.typeId);
    const crew = this.crew(v.id).filter(e => e.status === 'on_duty');
    if (crew.length < t.minCrew) return `Needs ${t.minCrew} crew (has ${crew.length})`;
    for (const q of t.quals) {
      const n = crew.filter(e => e.quals.includes(q.qual)).length;
      if (n < q.count) return `Needs ${q.count} × ${qualification(q.qual).name}`;
    }
    return null;
  }

  /** Null if the vehicle can be dispatched right now, else the reason. */
  dispatchProblem(v: Vehicle): string | null {
    if (v.status !== 'available' && v.status !== 'returning') {
      return { dispatched: 'Already dispatched', enroute: 'En route', onscene: 'On scene', out_of_service: 'Out of service', maintenance: 'In maintenance' }[v.status as string] || 'Unavailable';
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
    while (this.state.xp >= xpForLevel(this.state.level + 1)) {
      this.state.level++;
      this.emit({ type: 'level_up', level: this.state.level });
    }
  }

  // ------------------------------------------------------------ actions: stations
  placeStation(typeId: string, pos: LatLng, name?: string): Station {
    const c = this.city;
    const t = stationType(typeId);
    if (dept(t.dept).unlockLevel > this.state.level) throw new ActionError('Department not unlocked yet.');
    const setup = !this.setupDone;
    if (setup && SETUP_ORDER[c.setupStep] !== t.dept) throw new ActionError(`Place your ${stationTypeForDept(SETUP_ORDER[c.setupStep]).name} first.`);
    if (!setup) this.spend(t.cost, 'construction', t.dept, `Built ${t.name}`);
    const n = c.stations.filter(s => s.typeId === typeId).length + 1;
    const st: Station = { id: this.id('s'), typeId, dept: t.dept, name: name?.trim() || `${t.name} ${n}`, pos, level: 0 };
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
    const next = t.levels[s.level + 1];
    if (!next) throw new ActionError('Station is fully upgraded.');
    this.spend(next.upgradeCost, 'upgrades', s.dept, `Upgraded ${s.name}`);
    s.level++;
    this.changed();
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
    if (t.dept !== st.dept) throw new ActionError(`${t.name} must be assigned to a ${dept(t.dept).short} station.`);
    if (t.unlockLevel > this.state.level) throw new ActionError(`Unlocks at level ${t.unlockLevel}.`);
    if (this.stationVehicles(st.id).length >= this.stationCapacity(st).bays) throw new ActionError('No free vehicle bays. Upgrade the station.');
    this.spend(t.price, 'vehicles', t.dept, `Purchased ${t.name}`);
    const v = this.addVehicle(typeId, st, t.price);
    this.changed();
    return v;
  }

  reassignVehicle(vehicleId: string, stationId: string) {
    const v = this.vehicle(vehicleId), st = this.station(stationId);
    if (!v || !st) throw new ActionError('Not found.');
    if (st.dept !== vehicleType(v.typeId).dept) throw new ActionError('Wrong department for this station.');
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

  maintenanceCost(v: Vehicle) { return Math.round((100 - v.condition) * vehicleType(v.typeId).price * 0.002); }

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
    if (withQualChance && Math.random() < 0.3) {
      const options = QUALIFICATIONS.filter(q => q.dept === deptId && q.unlockLevel <= this.state.level);
      if (options.length) { quals.push(pick(options).id); salary *= 1.12; }
    }
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
      if (t.dept !== e.dept) throw new ActionError('Wrong department.');
      if (v.stationId !== e.stationId) throw new ActionError('Employee must be at the same station.');
      if (!this.vehicleAtStation(v)) throw new ActionError(`${v.name} is out on a call.`);
      if (this.crew(v.id).length >= t.maxCrew) throw new ActionError(`${v.name} is fully crewed.`);
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

  /** Fill empty crew seats at a station with unassigned staff, specialists first where needed. */
  autoStaff(stationId: string) {
    const vehicles = this.stationVehicles(stationId).filter(v => this.vehicleAtStation(v));
    const free = () => this.stationStaff(stationId).filter(e => !e.vehicleId);
    // Pass 1: satisfy qualification requirements.
    for (const v of vehicles) {
      const t = vehicleType(v.typeId);
      for (const q of t.quals) {
        let have = this.crew(v.id).filter(e => e.quals.includes(q.qual)).length;
        while (have < q.count && this.crew(v.id).length < t.maxCrew) {
          const cand = free().find(e => e.quals.includes(q.qual));
          if (!cand) break;
          cand.vehicleId = v.id; have++;
        }
      }
    }
    // Pass 2: reach minimum crew, preferring staff without specialist quals.
    for (const v of vehicles) {
      const t = vehicleType(v.typeId);
      while (this.crew(v.id).length < t.minCrew) {
        const f = free().sort((a, b) => a.quals.length - b.quals.length)[0];
        if (!f) break;
        f.vehicleId = v.id;
      }
    }
    this.changed();
  }

  train(empId: string, qualId: string) {
    const e = this.employee(empId);
    const q = qualification(qualId);
    if (!e || !q) throw new ActionError('Not found.');
    if (q.dept !== e.dept) throw new ActionError('Wrong department.');
    if (q.unlockLevel > this.state.level) throw new ActionError(`Unlocks at level ${q.unlockLevel}.`);
    if (e.quals.includes(qualId)) throw new ActionError('Already qualified.');
    if (e.training) throw new ActionError('Already in training.');
    const cur = e.vehicleId ? this.vehicle(e.vehicleId) : null;
    if (cur && !this.vehicleAtStation(cur)) throw new ActionError(`${cur.name} is out on a call.`);
    this.spend(q.cost, 'training', e.dept, `${q.name} training: ${e.name}`);
    e.status = 'training';
    e.training = { qual: qualId, until: this.state.time + q.hours * 3600 };
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

  etaEstimate(v: Vehicle, to: LatLng) {
    const t = vehicleType(v.typeId);
    return (v.status === 'returning' ? 0 : t.turnoutSec) + estimateEtaS(v.pos, to, t.speedFactor);
  }

  /** Remaining game seconds until arrival for a vehicle heading to a scene. */
  etaRemaining(v: Vehicle): number | null {
    if (v.status === 'enroute' && v.route) return Math.max(0, v.route.startAt + v.route.durationS - this.state.time);
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
    for (const v of sent) {
      const t = vehicleType(v.typeId);
      v.turnoutUntil = this.state.time + (v.status === 'returning' ? 5 : t.turnoutSec);
      v.status = 'dispatched';
      v.incidentId = inc.id;
      v.route = null;
      this.requestRoute(v, inc.pos);
    }
    if (inc.status === 'pending') inc.status = 'responding';
    this.changed();
  }

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
    const speed = vehicleType(v.typeId).speedFactor;
    this.routing.route(from, to)
      .catch(() => directRoute(from, to))
      .then(data => {
        if (this.state !== stateRef || v.routeReq !== req) return; // stale (state reloaded or re-routed)
        v.route = makeRoute(data, speed);
        if (data.approximate) this.emit({ type: 'routing_fallback' });
        this.changed();
      });
  }

  private sendHome(v: Vehicle) {
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
    v.condition = Math.max(0, v.condition - km * 0.35);
    const fuel = km * t.fuelPerKm;
    v.costs.fuel += fuel;
    this.city.accrual[`fuel|${t.dept}`] = (this.city.accrual[`fuel|${t.dept}`] || 0) + fuel;
  }

  // ------------------------------------------------------------ simulation
  tick(dt: number) {
    if (dt <= 0) return;
    this.state.time += dt;
    const c = this.city;
    this.accrue(dt);
    this.updateTraining();
    this.updateVehicles();
    if (this.setupDone) {
      this.updateIncidents();
      this.maybeSpawn();
    }
    const day = Math.floor(this.state.time / DAY);
    if (day !== c.finance.day) {
      c.finance.yesterday = c.finance.today;
      c.finance.today = emptyBucket();
      c.finance.day = day;
    }
  }

  private accrue(dt: number) {
    const c = this.city;
    const h = dt / 3600;
    const add = (k: string, n: number) => (c.accrual[k] = (c.accrual[k] || 0) + n);
    for (const e of c.employees) add(`payroll|${e.dept}`, e.salaryPerHour * h);
    for (const s of c.stations) {
      const t = stationType(s.typeId);
      add(`station upkeep|${s.dept}`, t.upkeepPerHour * (1 + s.level * 0.35) * h);
      if (this.setupDone) add(`city contract|${s.dept}`, -t.contractPerHour * h);
    }
    for (const v of c.vehicles) {
      const t = vehicleType(v.typeId);
      const m = t.maintenancePerHour * h;
      v.costs.maintenance += m;
      add(`maintenance|${t.dept}`, m);
    }
    const hour = Math.floor(this.state.time / 3600);
    if (hour !== c.lastHour) {
      c.lastHour = hour;
      for (const [k, amt] of Object.entries(c.accrual)) {
        const [cat, d] = k.split('|');
        if (Math.abs(amt) >= 1) this.post(-amt, cat, d, cat === 'city contract' ? 'City service contract' : `Hourly ${cat}`);
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
      }
    }
  }

  private arrive(v: Vehicle) {
    const r = v.route!;
    v.pos = r.coords[r.coords.length - 1];
    this.chargeTravel(v, r.distanceM);
    v.route = null;
    if (v.status === 'returning') {
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
      if (inc.status === 'working') {
        if (now >= (inc.workUntil ?? 0)) this.resolve(inc, this.outcomeFor(inc));
        continue;
      }
      const onScene = this.incidentVehicles(inc.id).filter(v => v.status === 'onscene');
      const missing = missingRequirements(inc.requirements, onScene);
      if (onScene.length > 0 && missing.length === 0) { this.startWork(inc); continue; }
      const prev = inc.status;
      inc.status = onScene.length ? 'onscene' : this.responding(inc).length ? 'responding' : 'pending';
      if (prev !== inc.status) this.changed();
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
    inc.workStartedAt = this.state.time;
    inc.workUntil = this.state.time + rand(t.workMin[0], t.workMin[1]) * 60 * (inc.partial ? 1.4 : 1);
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
      const base = Math.round(inc.reward * mult[outcome]);
      this.post(base, 'incident rewards', primary, `${inc.name} ${inc.number}`);
      payout = base;
      if (outcome === 'successful') {
        c.stats.successful++;
        if (this.fastResponse(inc)) {
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
      this.addXp(inc.xp * mult[outcome]);
      const onScene = this.incidentVehicles(inc.id).filter(v => v.status === 'onscene');
      for (const v of onScene) for (const e of this.crew(v.id)) e.xp += 5 * inc.severity;
    }
    c.stats.calls++;
    inc.status = 'resolved';
    inc.outcome = outcome;
    inc.resolvedAt = this.state.time;
    inc.payout = payout;
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
    return inc.workStartedAt != null && inc.workStartedAt - inc.createdAt <= t.deadlineMin * 60 * 0.5;
  }

  primaryDept(inc: Incident) {
    const cap = inc.requirements[0]?.cap;
    return CAPABILITIES.find(c => c.id === cap)?.dept || 'fire';
  }

  // ------------------------------------------------------------ incident generation
  activeCap() { return Math.min(20, 3 + this.city.stations.length); }

  private spawnInterval() {
    const n = Math.max(1, this.city.stations.length);
    return (420 / Math.sqrt(n)) * rand(0.5, 1.5);
  }

  private maybeSpawn() {
    const c = this.city;
    if (this.spawning || this.state.time < c.nextIncidentAt) return;
    if (c.incidents.length >= this.activeCap()) { c.nextIncidentAt = this.state.time + 30; return; }
    c.nextIncidentAt = this.state.time + this.spawnInterval();
    this.spawnIncident().catch(() => undefined);
  }

  /** Incident types the player can currently be sent (unlocked and staffed departments). */
  eligibleTypes() {
    return INCIDENT_TYPES.filter(t =>
      t.unlockLevel <= this.state.level &&
      t.requirements.every(r => this.hasDept(CAPABILITIES.find(c => c.id === r.cap)!.dept)));
  }

  async spawnIncident(typeId?: string): Promise<Incident | null> {
    if (this.spawning) return null;
    const types = this.eligibleTypes();
    const t = typeId ? incidentType(typeId) : this.weightedPick(types);
    if (!t || !this.city.stations.length) return null;
    this.spawning = true;
    const stateRef = this.state;
    try {
      const primary = CAPABILITIES.find(c => c.id === t.requirements[0].cap)!.dept;
      const anchors = this.city.stations.filter(s => s.dept === primary);
      const anchor = pick(anchors.length ? anchors : this.city.stations);
      const radius = stationType(anchor.typeId).coverageKm * 1000;
      const [[s, w], [n, e]] = this.cityDef.bounds;
      let pos: LatLng | null = null, street = '';
      for (let attempt = 0; attempt < 3; attempt++) {
        let p = destination(anchor.pos, rand(0, 360), Math.sqrt(Math.random()) * radius * 0.95 + 150);
        p = [Math.min(n, Math.max(s, p[0])), Math.min(e, Math.max(w, p[1]))];
        let snapped: { pos: LatLng; name: string } | null = null;
        try { snapped = await this.routing.nearest(p); } catch { snapped = null; }
        if (!snapped) { pos = pos || p; break; }          // routing service down: use the raw point
        pos = snapped.pos;
        if (snapped.name) { street = snapped.name; break; } // prefer named streets
      }
      if (this.state !== stateRef || !pos) return null;
      const c = this.city;
      const district = this.districtFor(pos);
      const num = (Math.floor(rand(1, 60)) * 2 + (Math.random() < 0.5 ? 1 : 0)) * 10 + Math.floor(rand(0, 9));
      const address = street ? `${num} ${street}` : `Near ${district}`;
      c.incidentCounter++;
      const inc: Incident = {
        id: this.id('i'), number: `${this.cityDef.prefix}-${String(c.incidentCounter).padStart(5, '0')}`,
        typeId: t.id, name: t.name, category: t.category, pos, address, district, severity: t.severity,
        description: pick(t.descriptions), requirements: t.requirements.map(r => ({ ...r })),
        createdAt: this.state.time, deadline: this.state.time + t.deadlineMin * 60,
        escalated: false, late: false, partial: false, status: 'pending', workUntil: null, workStartedAt: null,
        reward: Math.round(t.reward * rand(0.9, 1.15)), xp: t.xp, outcome: null, resolvedAt: null, payout: 0,
      };
      c.incidents.push(inc);
      this.emit({ type: 'incident_new', id: inc.id });
      this.changed();
      return inc;
    } finally {
      this.spawning = false;
    }
  }

  private weightedPick<T extends { weight: number }>(items: T[]): T | null {
    const total = items.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * total;
    for (const it of items) { r -= it.weight; if (r <= 0) return it; }
    return items[items.length - 1] || null;
  }

  districtFor(p: LatLng): string {
    const ds = this.cityDef.districts;
    if (!ds.length) return this.cityDef.name;
    return ds.reduce((best, d) => (distanceM(p, d.center) < distanceM(p, best.center) ? d : best)).name;
  }

  // ------------------------------------------------------------ reporting helpers
  hourlyCosts() {
    const c = this.city;
    let payroll = 0, upkeep = 0, maint = 0, contract = 0;
    c.employees.forEach(e => (payroll += e.salaryPerHour));
    c.stations.forEach(s => {
      const t = stationType(s.typeId);
      upkeep += t.upkeepPerHour * (1 + s.level * 0.35);
      contract += t.contractPerHour;
    });
    c.vehicles.forEach(v => (maint += vehicleType(v.typeId).maintenancePerHour));
    return { payroll, upkeep, maint, contract, net: contract - payroll - upkeep - maint };
  }
}

export { STATION_TYPES, VEHICLE_TYPES, DEPARTMENTS };
