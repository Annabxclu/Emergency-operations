// Core type definitions. Everything the game knows about departments, vehicles,
// incidents and cities is described by these "Def" types and lives in src/data,
// so new content can be added without touching engine code.

export type LatLng = [number, number]; // [lat, lng]

export interface Requirement { cap: string; count: number }
export interface QualReq { qual: string; count: number }

export interface DepartmentDef {
  id: string;
  name: string;
  short: string;
  color: string;
  unlockLevel: number;
  ranks: string[];
  empPrefix: string;
  baseSalaryPerHour: number;
  hireCost: number;
}

export interface StationTypeDef {
  id: string;
  dept: string;
  name: string;
  cost: number;
  maxLevel: number;        // each level adds one vehicle bay (level 0 = 1 bay)
  upkeepPerHour: number;
  contractPerHour: number; // city contract income earned by having this station
  coverageKm: number;
  small?: boolean;         // small station: low max level, no extensions
  upgradeTo?: string;      // small station can be converted into this type
}

export interface VehicleTypeDef {
  id: string;
  capCount?: Record<string, number>; // one unit counts as N of a capability (e.g. a double boat trailer = 2 boats)
  towedBy?: string[];   // trailers: vehicle types that can tow it (must be dispatched together)
  dept: string;
  name: string;
  callsign: string;      // e.g. "Engine" -> "Engine 3"
  short: string;         // map label, e.g. "E"
  price: number;
  speedFactor: number;   // multiplier on normal road speed (lights & sirens)
  minCrew: number;
  maxCrew: number;
  quals: QualReq[];      // specialist staffing requirements
  caps: string[];        // capabilities this vehicle provides to incidents
  maintenancePerHour: number;
  fuelPerKm: number;
  turnoutSec: number;
  unlockLevel: number;
  neededAt?: number;     // own-department stations needed before it can be bought (MissionChief "needed at")
  air?: boolean;                                   // flies direct (helicopters)
  mph?: number;                                    // fixed driving speed (fixed-speed travel model)
  needsExt?: boolean;                              // only stations with the matching extension can house it
  transport?: { kind: 'patient' | 'prisoner'; capacity: number };
}

export interface QualificationDef { id: string; name: string; dept: string; cost: number; hours: number; unlockLevel: number; neededAt?: number; days?: number }
export interface CapabilityDef { id: string; name: string; dept: string }

export interface IncidentTypeDef {
  id: string;
  staff?: { training: string; count: number }[]; // trained personnel needed on scene (see data/staffRequirements.ts)
  name: string;
  category: 'fire' | 'police' | 'ems' | 'rescue' | 'hazmat' | 'water' | 'public_works' | 'disaster';
  severity: 1 | 2 | 3;
  descriptions: string[];
  requirements: Requirement[];
  escalation: Requirement[];   // added when the call escalates
  deadlineMin: number;         // game minutes to have all units on scene
  workMin: [number, number];   // game minutes on scene once fully staffed
  reward: number;
  xp: number;
  weight: number;
  unlockLevel: number;
  patients?: [number, number];   // patients needing hospital transport
  prisoners?: [number, number];  // suspects needing transport to jail
  children?: { types: string[]; count: [number, number]; radiusKm: number }; // major events spawn related calls
}

export interface Facility { id: string; kind: 'hospital' | 'jail'; name: string; pos: LatLng; owned?: boolean }

/** A hospital the player built (MissionChief style). */
export interface OwnedHospital { id: string; name: string; pos: LatLng; address?: string; extraBeds: number; specialties: string[]; occupied: number[] /* game time each bed frees up */ }

export interface DistrictDef { name: string; center: LatLng }

export interface CityDef {
  id: string;
  name: string;
  state: string;
  prefix: string;
  center: LatLng;
  zoom: number;
  bounds: [LatLng, LatLng];
  districts: DistrictDef[];
  hospitals?: Facility[];
  unlockLevel: number;
  population: number;
  playable: boolean;
}

export type VehicleStatus = 'available' | 'dispatched' | 'enroute' | 'onscene' | 'transporting' | 'handover' | 'returning' | 'out_of_service' | 'maintenance';

export interface Route {
  coords: LatLng[];
  cum: number[];          // cumulative distance (m) at each coord
  distanceM: number;
  durationS: number;      // game seconds for this vehicle
  approximate: boolean;   // true if routing failed and a direct path was used
  startAt: number;        // game time the vehicle started driving; -1 = not started
  provisional?: boolean;  // straight-line estimate used until the road route arrives
}

/** One patient at a call: treated by an ambulance, then taken to hospital or released on scene. */
export interface Patient {
  id: string;
  name: string;
  needsTransport: boolean;
  treatSec: number;
  status: 'untreated' | 'treating' | 'released' | 'transport';
  vehicleId?: string | null;
  until?: number;
}

export interface Vehicle {
  patientLoad?: number;   // patients on board waiting to leave for hospital
  id: string;
  typeId: string;
  name: string;
  stationId: string;
  status: VehicleStatus;
  pos: LatLng;
  route: Route | null;
  routeReq: number;
  incidentId: string | null;
  turnoutUntil: number;
  condition: number;      // 0-100
  maintenanceUntil: number;
  odometerKm: number;
  costs: { purchase: number; fuel: number; maintenance: number };
  calls: number;
  cargo?: { kind: 'patient' | 'prisoner'; count: number; dest: string; destName: string; fee: number; specialty?: string } | null;
  busyUntil?: number;
  followUp?: string | null; // incident to drive to straight after the current job
}

export interface Station {
  id: string;
  typeId: string;
  dept: string;
  name: string;
  pos: LatLng;
  level: number;          // bays = 1 + level (+ extensions)
  extensions?: string[];
  address?: string;
  hireTarget?: number;    // staff wanted; one free recruit arrives every 24 real hours until reached
  nextHireAt?: number;    // real time (ms) of the next free recruit
}

export interface Goal { id: string; metric: string; label: string; target: number; progress: number; reward: number; xp: number; done: boolean }

export interface Employee {
  id: string;
  empNo: string;
  name: string;
  dept: string;
  rank: number;
  quals: string[];
  salaryPerHour: number;
  xp: number;
  stationId: string;
  vehicleId: string | null;
  shift: 'A' | 'B' | 'C';
  status: 'on_duty' | 'training';
  training: { qual: string; until: number } | null;
}

export type IncidentStatus = 'pending' | 'responding' | 'onscene' | 'working' | 'resolved';
export type Outcome = 'successful' | 'delayed' | 'partial' | 'escalated' | 'failed';

export interface Incident {
  patientList?: Patient[]; // individual patients (shown as cards on the call screen)
  specialty?: string;     // specialist care the patients need (hospital must have it)
  id: string;
  number: string;
  typeId: string;
  name: string;
  category: string;
  pos: LatLng;
  address: string;
  district: string;
  severity: number;
  description: string;
  requirements: Requirement[];
  createdAt: number;
  receivedAt?: number;    // real-world time (ms) the call came in
  deadline: number;
  escalated: boolean;
  late: boolean;
  partial: boolean;
  status: IncidentStatus;
  workUntil: number | null;
  workStartedAt: number | null;
  workRemaining?: number | null; // seconds of work left when paused (a required unit left)
  workDone?: number;
  firstOnSceneAt?: number | null;
  reward: number;
  xp: number;
  outcome: Outcome | null;
  resolvedAt: number | null;
  payout: number;
  patients: number;
  prisoners: number;
  parentId?: string | null;
}

export interface LedgerEntry { t: number; amount: number; cat: string; note: string }

export interface FinanceBucket {
  income: Record<string, number>;
  expense: Record<string, number>;
  byDept: Record<string, { income: number; expense: number }>;
}

export type RadioKind = 'call' | 'dispatch' | 'onscene' | 'patient' | 'transport' | 'clear' | 'available' | 'done' | 'alert';
/** One line of radio traffic: what a unit or dispatch just did. */
export interface RadioMsg { at: number /* wall-clock ms */; kind: RadioKind; text: string; unit?: string; vehicleId?: string; incidentId?: string }

export interface CityState {
  cityId: string;
  radio?: RadioMsg[];
  hospitals?: OwnedHospital[];
  academies?: Record<string, { classrooms: number }>; // fire / police academies (classrooms beyond the first)
  money: number;
  stations: Station[];
  vehicles: Vehicle[];
  employees: Employee[];
  incidents: Incident[];
  resolved: Incident[];
  ledger: LedgerEntry[];
  finance: { day: number; today: FinanceBucket; yesterday: FinanceBucket | null; total: FinanceBucket };
  accrual: Record<string, number>;
  lastHour: number;
  nextIncidentAt: number;
  incidentCounter: number;
  setupStep: number; // 0..2 placing starter stations, 3 = running
  goals?: { day: number; list: Goal[] };
  agreements?: string[];
  lastAutoCheck?: number;
  stats: { calls: number; successful: number; failed: number };
}

export interface Settings {
  theme?: string;          // background color theme
  speed: number;
  routingUrl: string;
  tileStyle: string;
  showCoverage: boolean;
  deptFilter: Record<string, boolean>;
  sound: boolean;
  autoDispatch: 'off' | 'low' | 'all';
  shifts: boolean;
  travelModel?: 'fixed' | 'roads';
  callIntervalMin?: number; // minutes between new calls (0.5, 3 or 5)
  runningCosts?: boolean;   // payroll, upkeep, maintenance, fuel
  rewardMult?: number;
  travelMult?: number;
  workMult?: number;
}

export interface GameState {
  schema: number;
  createdAt: string;
  time: number;          // game seconds since start
  xp: number;
  level: number;
  activeCity: string;
  cities: Record<string, CityState>;
  cityDefs: Record<string, CityDef>;   // generated cities (presets live in data/cities)
  seq: number;
  settings: Settings;
  research: { active: { id: string; until: number } | null; done: string[] };
  login?: { last: string; step: number };
  lastSeen?: number; // wall-clock ms when the game was last running (for offline progress)
}

export interface RouteData { coords: LatLng[]; distanceM: number; durationS: number; approximate: boolean }

export interface RoutingProvider {
  route(from: LatLng, to: LatLng): Promise<RouteData>;
  nearest(p: LatLng): Promise<{ pos: LatLng; name: string } | null>;
}

export type GameEvent = { cityId?: string } & (
  | { type: 'incident_new'; id: string }
  | { type: 'incident_escalated'; id: string }
  | { type: 'incident_late'; id: string }
  | { type: 'incident_resolved'; id: string; outcome: Outcome; payout: number }
  | { type: 'vehicle_arrived'; id: string; incidentId: string }
  | { type: 'level_up'; level: number }
  | { type: 'transport_done'; id: string; kind: 'patient' | 'prisoner'; count: number; fee: number; dest: string }
  | { type: 'major_event'; id: string; children: number }
  | { type: 'research_done'; id: string }
  | { type: 'goal_done'; label: string; reward: number }
  | { type: 'training_done'; empId: string; qual: string }
  | { type: 'recruited'; stationId: string; count: number }
  | { type: 'routing_fallback' }
  | { type: 'notice'; text: string });
