// Research, station extensions, regional agreements and daily goal templates.
// All balancing lives here.

export type ModKey = 'turnout' | 'speed' | 'maintenance' | 'wear' | 'reward' | 'xp' | 'training' | 'salary' | 'contract' | 'transport';

export interface ResearchDef {
  id: string; name: string; desc: string; cost: number; hours: number; unlockLevel: number; requires?: string;
  effects: Partial<Record<ModKey, number>>;
}

export const RESEARCH: ResearchDef[] = [
  { id: 'cad', name: 'Computer-Aided Dispatch', desc: 'Crews get call details faster: turnout time −15%.', cost: 40000, hours: 12, unlockLevel: 2, effects: { turnout: 0.85 } },
  { id: 'curriculum', name: 'Training Curriculum', desc: 'Certification courses take 25% less time.', cost: 35000, hours: 12, unlockLevel: 2, effects: { training: 0.75 } },
  { id: 'gps', name: 'GPS Navigation', desc: 'Better routes: response driving speed +5%.', cost: 50000, hours: 16, unlockLevel: 3, effects: { speed: 1.05 } },
  { id: 'fleet', name: 'Fleet Management', desc: 'Vehicle maintenance costs −20% and wear −25%.', cost: 45000, hours: 16, unlockLevel: 3, effects: { maintenance: 0.8, wear: 0.75 } },
  { id: 'billing', name: 'Transport Billing Office', desc: 'Patient and prisoner transport fees +25%.', cost: 40000, hours: 12, unlockLevel: 3, effects: { transport: 1.25 } },
  { id: 'community', name: 'Community Programs', desc: 'City contract income +20%.', cost: 60000, hours: 20, unlockLevel: 4, effects: { contract: 1.2 } },
  { id: 'aar', name: 'After-Action Reviews', desc: 'Experience from calls +15%.', cost: 60000, hours: 16, unlockLevel: 4, effects: { xp: 1.15 } },
  { id: 'analytics', name: 'Performance Analytics', desc: 'Call rewards +10%.', cost: 80000, hours: 24, unlockLevel: 5, requires: 'cad', effects: { reward: 1.1 } },
  { id: 'wellness', name: 'Employee Wellness', desc: 'Lower turnover: payroll −8%.', cost: 70000, hours: 20, unlockLevel: 5, effects: { salary: 0.92 } },
  { id: 'alerting', name: 'Station Alerting System', desc: 'Automatic tones and lights: turnout time −20%.', cost: 90000, hours: 24, unlockLevel: 6, requires: 'cad', effects: { turnout: 0.8 } },
  { id: 'preemption', name: 'Traffic Signal Preemption', desc: 'Green lights for responders: driving speed +8%.', cost: 120000, hours: 30, unlockLevel: 7, requires: 'gps', effects: { speed: 1.08 } },
  { id: 'grants', name: 'Federal Grants Office', desc: 'City contract income +25%.', cost: 150000, hours: 36, unlockLevel: 8, requires: 'community', effects: { contract: 1.25 } },
  { id: 'predictive', name: 'Predictive Maintenance', desc: 'Vehicle wear −30%.', cost: 110000, hours: 30, unlockLevel: 8, requires: 'fleet', effects: { wear: 0.7 } },
  { id: 'excellence', name: 'Service Excellence Program', desc: 'Call rewards +15%.', cost: 200000, hours: 48, unlockLevel: 10, requires: 'analytics', effects: { reward: 1.15 } },
];

export interface ExtensionDef {
  id: string; name: string; desc: string; cost: number;
  bays?: number;                        // extra vehicle bays
  allowsDept?: string;                  // lets this station house another department's vehicles
  allowsVehicles?: string[];            // unlocks specific vehicle types at this station
  feature?: 'academy' | 'cells';
  perStations?: number;                 // limit: one per this many stations of the same type
}

const LARGE: ExtensionDef = { id: 'large', name: 'Large Station', desc: '+10 vehicle bays. One per 10 stations of this type.', cost: 1000000, bays: 10, perStations: 10 };
const TRAINING: ExtensionDef = { id: 'training_room', name: 'Training Room', desc: 'Staff based here train 30% faster.', cost: 25000, feature: 'academy' };

export const EXTENSIONS: Record<string, ExtensionDef[]> = {
  fire_station: [
    { id: 'ems_ext', name: 'Ambulance Extension', desc: 'House EMS vehicles (ambulances) at this fire station.', cost: 100000, allowsDept: 'ems' },
    { id: 'water_ext', name: 'Water Rescue Extension', desc: 'House rescue boats, dive teams, Heavy Rescue + Light Boat and boat trailers here.', cost: 200000, allowsDept: 'water', allowsVehicles: ['heavy_rescue_boat', 'boat_trailer'] },
    { id: 'pw_ext', name: 'Public Works Extension', desc: 'House public works crews here.', cost: 150000, allowsDept: 'public_works' },
    { id: 'airport_ext', name: 'Airport Extension', desc: 'House airport crash tenders for aviation emergencies.', cost: 300000, allowsVehicles: ['arff', 'arff_medium', 'arff_small'] },
    { id: 'foam_ext', name: 'Foam Extension', desc: 'House foam tenders for fuel and industrial fires.', cost: 150000, allowsVehicles: ['foam_tender'] },
    { id: 'fmo_ext', name: "Fire Marshal's Office", desc: 'House fire investigation units.', cost: 100000, allowsVehicles: ['fire_investigator', 'fire_prevention'] },
    { id: 'forestry_ext', name: 'Forestry Expansion', desc: 'House wildland engines (Type 3–7) and the Wildland MCC.', cost: 100000, allowsVehicles: ['brush', 'type3_engine', 'type4_engine', 'type6_engine', 'type7_engine', 'wildland_mcc'] },
    { id: 'lifeguard_ext', name: 'Lifeguard Expansion', desc: 'House Lifeguard Rescue and Lifeguard Supervisor units.', cost: 100000, allowsVehicles: ['lifeguard_rescue', 'lifeguard_supervisor'] },
    { id: 'flood_ext', name: 'Water Damage & Flood Expansion', desc: 'House flood equipment trailers.', cost: 100000, allowsVehicles: ['flood_trailer'] },
    { id: 'disaster_ext', name: 'Disaster Response Expansion', desc: 'House light tower and generator trailers.', cost: 100000, allowsVehicles: ['light_trailer', 'generator_trailer'] },
    { id: 'tow_ext', name: 'Tow Truck Expansion', desc: 'House a Firewrecker.', cost: 100000, allowsVehicles: ['firewrecker'] },
    { id: 'crane_ext', name: 'Crane Bay', desc: 'House a fire crane for heavy lifting rescues.', cost: 200000, allowsVehicles: ['fire_crane'] },
    LARGE, TRAINING,
  ],
  police_precinct: [
    { id: 'cells', name: 'Holding Cells', desc: 'Prisoner transports to this station pay 50% more.', cost: 25000, feature: 'cells' },
    { id: 'special_ext', name: 'Tactical Extension', desc: 'House Special Operations vehicles here.', cost: 250000, allowsDept: 'special' },
    { id: 'riot_ext', name: 'Riot Police Extension', desc: 'House riot control units.', cost: 200000, allowsVehicles: ['riot_unit', 'riot_bus', 'riot_trailer'] },
    { id: 'federal_ext', name: 'Federal Police Expansion', desc: 'House FBI investigation wagons, bomb technicians and surveillance drones.', cost: 200000, allowsVehicles: ['fbi_wagon', 'fbi_bomb_tech', 'fbi_drone'] },
    { id: 'police_tow_ext', name: 'Tow Truck Expansion', desc: 'House police wreckers.', cost: 100000, allowsVehicles: ['police_wrecker'] },
    { id: 'crime_ext', name: 'Crime Scene and Investigation Extension', desc: 'House detective vehicles and crime scene units.', cost: 100000, allowsVehicles: ['detective', 'crime_scene_unit'] },
    { id: 'warden_ext', name: 'Game Warden Office', desc: 'House game warden trucks.', cost: 80000, allowsVehicles: ['game_warden'] },
    { id: 'water_police_ext', name: 'Water Police Extension', desc: 'House police boats.', cost: 150000, allowsVehicles: ['police_boat'] },
    LARGE, TRAINING,
  ],
  ems_station: [LARGE, TRAINING],
};
export const extensionsFor = (stationTypeId: string): ExtensionDef[] => EXTENSIONS[stationTypeId] || (stationTypeId.endsWith('_small') ? [] : [TRAINING]);

export interface AgreementDef { id: string; name: string; desc: string; dept: string; stations: number; extraDept?: string; incomePerHour: number; signCost: number; unlockLevel: number }

export const AGREEMENTS: AgreementDef[] = [
  { id: 'county_fire', name: 'County Fire Mutual Aid', desc: 'Cover unincorporated county areas.', dept: 'fire', stations: 3, incomePerHour: 260, signCost: 15000, unlockLevel: 3 },
  { id: 'county_ems', name: 'County EMS Coverage', desc: 'Ambulance coverage for neighboring towns.', dept: 'ems', stations: 3, incomePerHour: 220, signCost: 12000, unlockLevel: 3 },
  { id: 'task_force', name: 'Regional Police Task Force', desc: 'Share officers with surrounding agencies.', dept: 'police', stations: 3, incomePerHour: 230, signCost: 14000, unlockLevel: 4 },
  { id: 'dot', name: 'State DOT Road Maintenance', desc: 'Maintain state highways in the region.', dept: 'public_works', stations: 1, incomePerHour: 280, signCost: 18000, unlockLevel: 4 },
  { id: 'lake_patrol', name: 'Lake & River Patrol', desc: 'Patrol regional waterways.', dept: 'water', stations: 1, incomePerHour: 320, signCost: 20000, unlockLevel: 5 },
  { id: 'airport', name: 'Airport Medical Contract', desc: 'Air medical standby for the regional airport.', dept: 'air', stations: 1, incomePerHour: 650, signCost: 40000, unlockLevel: 7 },
  { id: 'federal', name: 'Federal Security Support', desc: 'Bomb and tactical support for federal sites.', dept: 'special', stations: 1, incomePerHour: 600, signCost: 40000, unlockLevel: 8 },
  { id: 'fema', name: 'FEMA Regional Readiness', desc: 'Stand ready for regional disasters.', dept: 'disaster', stations: 1, extraDept: 'emergency', incomePerHour: 900, signCost: 60000, unlockLevel: 10 },
];

export type GoalMetric = 'success' | 'success_fire' | 'success_police' | 'success_ems' | 'patients' | 'prisoners' | 'major' | 'fast';

export const GOAL_TEMPLATES: { metric: GoalMetric; label: (n: number) => string; base: number; perLevel: number; minLevel: number }[] = [
  { metric: 'success', label: n => `Complete ${n} calls successfully`, base: 6, perLevel: 1, minLevel: 1 },
  { metric: 'success_fire', label: n => `Handle ${n} fire calls successfully`, base: 3, perLevel: 0.3, minLevel: 1 },
  { metric: 'success_police', label: n => `Handle ${n} police calls successfully`, base: 3, perLevel: 0.3, minLevel: 1 },
  { metric: 'success_ems', label: n => `Handle ${n} EMS calls successfully`, base: 3, perLevel: 0.3, minLevel: 1 },
  { metric: 'patients', label: n => `Transport ${n} patients to hospital`, base: 3, perLevel: 0.4, minLevel: 1 },
  { metric: 'prisoners', label: n => `Bring ${n} suspects to jail`, base: 2, perLevel: 0.2, minLevel: 1 },
  { metric: 'fast', label: n => `Earn ${n} fast-response bonuses`, base: 2, perLevel: 0.3, minLevel: 1 },
  { metric: 'major', label: n => `Resolve ${n} major (high-severity) call${n > 1 ? 's' : ''}`, base: 1, perLevel: 0.15, minLevel: 2 },
];
