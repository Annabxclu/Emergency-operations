import type { CapabilityDef, DepartmentDef, QualificationDef, StationTypeDef, VehicleTypeDef } from '../engine/types';

// Everything about departments, buildings, vehicles and certifications is data.
// To add a department: a DepartmentDef, a StationTypeDef, its VehicleTypeDefs,
// capabilities and qualifications. The engine and UI pick it up automatically.

export const DEPARTMENTS: DepartmentDef[] = [
  { id: 'fire', name: 'Fire Department', short: 'Fire', color: '#d9463b', unlockLevel: 1, empPrefix: 'FD', baseSalaryPerHour: 48, hireCost: 2500,
    ranks: ['Firefighter', 'Engineer', 'Lieutenant', 'Captain', 'Battalion Chief'] },
  { id: 'police', name: 'Police Department', short: 'Police', color: '#2f6fe0', unlockLevel: 1, empPrefix: 'PD', baseSalaryPerHour: 45, hireCost: 2000,
    ranks: ['Officer', 'Senior Officer', 'Sergeant', 'Lieutenant', 'Captain'] },
  { id: 'ems', name: 'Emergency Medical Services', short: 'EMS', color: '#e39a12', unlockLevel: 1, empPrefix: 'EMS', baseSalaryPerHour: 40, hireCost: 1800,
    ranks: ['EMT', 'Senior EMT', 'Field Supervisor', 'Operations Manager'] },
  { id: 'public_works', name: 'Public Works', short: 'Public Works', color: '#7a8b2e', unlockLevel: 3, empPrefix: 'PW', baseSalaryPerHour: 38, hireCost: 1500,
    ranks: ['Crew Member', 'Equipment Operator', 'Crew Leader', 'Superintendent'] },
  { id: 'water', name: 'Water Rescue', short: 'Water', color: '#0f9bb3', unlockLevel: 4, empPrefix: 'WR', baseSalaryPerHour: 50, hireCost: 2600,
    ranks: ['Rescuer', 'Boat Operator', 'Rescue Lieutenant', 'Marine Captain'] },
  { id: 'air', name: 'Air Support', short: 'Air', color: '#6d5bd0', unlockLevel: 6, empPrefix: 'AS', baseSalaryPerHour: 70, hireCost: 5000,
    ranks: ['Crew Member', 'Flight Officer', 'Senior Pilot', 'Chief Pilot'] },
  { id: 'special', name: 'Special Operations', short: 'Special Ops', color: '#3d4a5c', unlockLevel: 7, empPrefix: 'SO', baseSalaryPerHour: 60, hireCost: 4000,
    ranks: ['Operator', 'Senior Operator', 'Team Leader', 'Commander'] },
  { id: 'emergency', name: 'Emergency Management', short: 'Emerg. Mgmt', color: '#c2417a', unlockLevel: 8, empPrefix: 'EM', baseSalaryPerHour: 52, hireCost: 3000,
    ranks: ['Coordinator', 'Senior Coordinator', 'Duty Officer', 'Director'] },
  { id: 'disaster', name: 'Disaster Response', short: 'Disaster', color: '#a0522d', unlockLevel: 10, empPrefix: 'DR', baseSalaryPerHour: 46, hireCost: 2800,
    ranks: ['Responder', 'Specialist', 'Team Lead', 'Division Chief'] },
];

// Every level adds one vehicle bay: normal fire/police/EMS stations go to level 39 = 40 bays.
// Small stations are cheaper, stop at level 5 (6 bays), take no extensions and can be
// converted into a normal station later.
export const STATION_TYPES: StationTypeDef[] = [
  { id: 'fire_station', dept: 'fire', name: 'Fire Station', cost: 100000, maxLevel: 39, upkeepPerHour: 60, contractPerHour: 70, coverageKm: 3.5 },
  { id: 'fire_station_small', dept: 'fire', name: 'Fire Station (Small)', cost: 50000, maxLevel: 5, upkeepPerHour: 35, contractPerHour: 40, coverageKm: 3, small: true, upgradeTo: 'fire_station' },
  { id: 'police_precinct', dept: 'police', name: 'Police Station', cost: 100000, maxLevel: 39, upkeepPerHour: 50, contractPerHour: 60, coverageKm: 4 },
  { id: 'police_precinct_small', dept: 'police', name: 'Police Station (Small)', cost: 50000, maxLevel: 5, upkeepPerHour: 30, contractPerHour: 35, coverageKm: 3.5, small: true, upgradeTo: 'police_precinct' },
  { id: 'ems_station', dept: 'ems', name: 'EMS Station', cost: 100000, maxLevel: 39, upkeepPerHour: 40, contractPerHour: 50, coverageKm: 4.5 },
  { id: 'ems_station_small', dept: 'ems', name: 'EMS Station (Small)', cost: 50000, maxLevel: 5, upkeepPerHour: 25, contractPerHour: 30, coverageKm: 4, small: true, upgradeTo: 'ems_station' },
  { id: 'public_works_yard', dept: 'public_works', name: 'Public Works Yard', cost: 100000, maxLevel: 14, upkeepPerHour: 45, contractPerHour: 55, coverageKm: 6 },
  { id: 'water_rescue_station', dept: 'water', name: 'Water Rescue Station', cost: 150000, maxLevel: 14, upkeepPerHour: 55, contractPerHour: 60, coverageKm: 7 },
  { id: 'air_base', dept: 'air', name: 'Air Support Base', cost: 500000, maxLevel: 4, upkeepPerHour: 140, contractPerHour: 120, coverageKm: 20 },
  { id: 'special_ops_base', dept: 'special', name: 'Special Operations Base', cost: 250000, maxLevel: 9, upkeepPerHour: 90, contractPerHour: 90, coverageKm: 10 },
  { id: 'eoc', dept: 'emergency', name: 'Emergency Operations Center', cost: 300000, maxLevel: 4, upkeepPerHour: 100, contractPerHour: 110, coverageKm: 15 },
  { id: 'disaster_center', dept: 'disaster', name: 'Disaster Response Center', cost: 300000, maxLevel: 9, upkeepPerHour: 110, contractPerHour: 110, coverageKm: 15 },
];

export const CAPABILITIES: CapabilityDef[] = [
  { id: 'engine', name: 'Fire engine', dept: 'fire' },
  { id: 'ladder', name: 'Ladder truck', dept: 'fire' },
  { id: 'rescue', name: 'Heavy rescue', dept: 'fire' },
  { id: 'hazmat', name: 'Hazmat unit', dept: 'fire' },
  { id: 'brush', name: 'Brush truck', dept: 'fire' },
  { id: 'chief', name: 'Battalion chief', dept: 'fire' },
  { id: 'water_supply', name: 'Water tanker', dept: 'fire' },
  { id: 'police', name: 'Police unit', dept: 'police' },
  { id: 'traffic', name: 'Traffic unit', dept: 'police' },
  { id: 'k9', name: 'K-9 unit', dept: 'police' },
  { id: 'swat', name: 'SWAT team', dept: 'police' },
  { id: 'investigation', name: 'Detective unit', dept: 'police' },
  { id: 'prisoner_transport', name: 'Prisoner transport', dept: 'police' },
  { id: 'ambulance', name: 'Ambulance', dept: 'ems' },
  { id: 'als', name: 'ALS ambulance', dept: 'ems' },
  { id: 'ccu', name: 'Critical care unit', dept: 'ems' },
  { id: 'ems_supervisor', name: 'EMS supervisor', dept: 'ems' },
  { id: 'mci', name: 'Mass casualty unit', dept: 'ems' },
  { id: 'road_crew', name: 'Road crew', dept: 'public_works' },
  { id: 'tree_crew', name: 'Tree crew', dept: 'public_works' },
  { id: 'signal_crew', name: 'Signal crew', dept: 'public_works' },
  { id: 'boat', name: 'Rescue boat', dept: 'water' },
  { id: 'dive', name: 'Dive team', dept: 'water' },
  { id: 'air_medical', name: 'Medical helicopter', dept: 'air' },
  { id: 'air_police', name: 'Police helicopter', dept: 'air' },
  { id: 'bomb', name: 'Bomb squad', dept: 'special' },
  { id: 'usar', name: 'Urban search & rescue', dept: 'special' },
  { id: 'command', name: 'Mobile command', dept: 'emergency' },
  { id: 'logistics', name: 'Logistics unit', dept: 'emergency' },
  { id: 'heavy_equipment', name: 'Heavy equipment', dept: 'disaster' },
  { id: 'relief', name: 'Relief & shelter unit', dept: 'disaster' },
];

export const QUALIFICATIONS: QualificationDef[] = [
  { id: 'aerial_operator', name: 'Aerial Operator', dept: 'fire', cost: 3000, hours: 8, unlockLevel: 2 },
  { id: 'wildland', name: 'Wildland Firefighting', dept: 'fire', cost: 2500, hours: 8, unlockLevel: 2 },
  { id: 'tech_rescue', name: 'Technical Rescue', dept: 'fire', cost: 5000, hours: 16, unlockLevel: 3 },
  { id: 'fire_officer', name: 'Fire Officer', dept: 'fire', cost: 4500, hours: 12, unlockLevel: 4 },
  { id: 'hazmat_tech', name: 'Hazmat Technician', dept: 'fire', cost: 6000, hours: 16, unlockLevel: 5 },
  { id: 'traffic_enf', name: 'Traffic Enforcement', dept: 'police', cost: 2000, hours: 6, unlockLevel: 2 },
  { id: 'k9_handler', name: 'K-9 Handler', dept: 'police', cost: 5000, hours: 16, unlockLevel: 3 },
  { id: 'detective', name: 'Detective', dept: 'police', cost: 4000, hours: 12, unlockLevel: 3 },
  { id: 'swat', name: 'SWAT', dept: 'police', cost: 8000, hours: 24, unlockLevel: 6 },
  { id: 'paramedic', name: 'Paramedic', dept: 'ems', cost: 4000, hours: 12, unlockLevel: 2 },
  { id: 'ems_officer', name: 'EMS Officer', dept: 'ems', cost: 4000, hours: 12, unlockLevel: 4 },
  { id: 'critical_care', name: 'Critical Care', dept: 'ems', cost: 7000, hours: 20, unlockLevel: 5 },
  { id: 'mci_ops', name: 'Mass Casualty Operations', dept: 'ems', cost: 6000, hours: 16, unlockLevel: 7 },
  { id: 'cdl', name: 'Heavy Vehicle License', dept: 'public_works', cost: 2000, hours: 8, unlockLevel: 3 },
  { id: 'arborist', name: 'Arborist', dept: 'public_works', cost: 2500, hours: 8, unlockLevel: 3 },
  { id: 'boat_operator', name: 'Boat Operator', dept: 'water', cost: 3500, hours: 10, unlockLevel: 4 },
  { id: 'rescue_diver', name: 'Rescue Diver', dept: 'water', cost: 7000, hours: 20, unlockLevel: 6 },
  { id: 'pilot', name: 'Helicopter Pilot', dept: 'air', cost: 15000, hours: 30, unlockLevel: 6 },
  { id: 'flight_medic', name: 'Flight Medic', dept: 'air', cost: 8000, hours: 20, unlockLevel: 6 },
  { id: 'tactical_flight', name: 'Tactical Flight Officer', dept: 'air', cost: 6000, hours: 16, unlockLevel: 7 },
  { id: 'bomb_tech', name: 'Bomb Technician', dept: 'special', cost: 10000, hours: 30, unlockLevel: 8 },
  { id: 'usar_tech', name: 'USAR Technician', dept: 'special', cost: 8000, hours: 24, unlockLevel: 9 },
  { id: 'incident_command', name: 'Incident Command', dept: 'emergency', cost: 6000, hours: 16, unlockLevel: 8 },
  { id: 'heavy_operator', name: 'Heavy Equipment Operator', dept: 'disaster', cost: 6000, hours: 16, unlockLevel: 10 },
];

type V = Omit<VehicleTypeDef, 'quals'> & { quals?: VehicleTypeDef['quals'] };
const q = (qual: string, count = 1) => ({ qual, count });
const vt = (v: V): VehicleTypeDef => ({ quals: [], ...v });

export const VEHICLE_TYPES: VehicleTypeDef[] = [
  // Fire
  vt({ id: 'engine', dept: 'fire', name: 'Fire Engine', callsign: 'Engine', short: 'E', price: 25000, speedFactor: 1.15, minCrew: 3, maxCrew: 4, caps: ['engine'], maintenancePerHour: 8, fuelPerKm: 1.2, turnoutSec: 60, unlockLevel: 1 }),
  vt({ id: 'ladder', dept: 'fire', name: 'Ladder Truck', callsign: 'Truck', short: 'T', price: 45000, speedFactor: 1.05, minCrew: 3, maxCrew: 4, quals: [q('aerial_operator')], caps: ['ladder'], maintenancePerHour: 12, fuelPerKm: 1.6, turnoutSec: 70, unlockLevel: 2 }),
  vt({ id: 'brush', dept: 'fire', name: 'Brush Truck', callsign: 'Brush', short: 'BR', price: 20000, speedFactor: 1.15, minCrew: 2, maxCrew: 3, quals: [q('wildland')], caps: ['brush'], maintenancePerHour: 6, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 2 }),
  vt({ id: 'heavy_rescue', dept: 'fire', name: 'Heavy Rescue', callsign: 'Rescue', short: 'R', price: 40000, speedFactor: 1.1, minCrew: 3, maxCrew: 5, quals: [q('tech_rescue', 2)], caps: ['rescue'], maintenancePerHour: 11, fuelPerKm: 1.4, turnoutSec: 70, unlockLevel: 3 }),
  vt({ id: 'chief', dept: 'fire', name: 'Battalion Chief', callsign: 'Battalion', short: 'BC', price: 18000, speedFactor: 1.35, minCrew: 1, maxCrew: 2, quals: [q('fire_officer')], caps: ['chief'], maintenancePerHour: 4, fuelPerKm: 0.5, turnoutSec: 45, unlockLevel: 4 }),
  vt({ id: 'hazmat', dept: 'fire', name: 'Hazmat Unit', callsign: 'Hazmat', short: 'HM', price: 50000, speedFactor: 1.0, minCrew: 2, maxCrew: 4, quals: [q('hazmat_tech', 2)], caps: ['hazmat'], maintenancePerHour: 12, fuelPerKm: 1.5, turnoutSec: 90, unlockLevel: 5 }),
  vt({ id: 'tanker', dept: 'fire', name: 'Water Tanker', callsign: 'Tanker', short: 'TK', price: 35000, speedFactor: 0.95, minCrew: 1, maxCrew: 2, caps: ['water_supply'], maintenancePerHour: 8, fuelPerKm: 1.5, turnoutSec: 70, unlockLevel: 5 }),
  // Police
  vt({ id: 'patrol', dept: 'police', name: 'Patrol Car', callsign: 'Patrol', short: 'P', price: 8000, speedFactor: 1.35, minCrew: 1, maxCrew: 2, caps: ['police'], maintenancePerHour: 3, fuelPerKm: 0.4, turnoutSec: 30, unlockLevel: 1, transport: { kind: 'prisoner', capacity: 1 } }),
  vt({ id: 'traffic', dept: 'police', name: 'Traffic Enforcement', callsign: 'Traffic', short: 'TE', price: 11000, speedFactor: 1.4, minCrew: 1, maxCrew: 1, quals: [q('traffic_enf')], caps: ['police', 'traffic'], maintenancePerHour: 3, fuelPerKm: 0.45, turnoutSec: 30, unlockLevel: 2, transport: { kind: 'prisoner', capacity: 1 } }),
  vt({ id: 'k9', dept: 'police', name: 'K-9 Unit', callsign: 'K-9', short: 'K9', price: 15000, speedFactor: 1.35, minCrew: 1, maxCrew: 1, quals: [q('k9_handler')], caps: ['police', 'k9'], maintenancePerHour: 4, fuelPerKm: 0.45, turnoutSec: 40, unlockLevel: 3 }),
  vt({ id: 'detective', dept: 'police', name: 'Detective Unit', callsign: 'Detective', short: 'D', price: 12000, speedFactor: 1.25, minCrew: 1, maxCrew: 2, quals: [q('detective')], caps: ['investigation'], maintenancePerHour: 3, fuelPerKm: 0.4, turnoutSec: 60, unlockLevel: 3 }),
  vt({ id: 'prisoner_van', dept: 'police', name: 'Prisoner Transport Van', callsign: 'Transport', short: 'PV', price: 22000, speedFactor: 1.15, minCrew: 2, maxCrew: 2, caps: ['prisoner_transport'], maintenancePerHour: 5, fuelPerKm: 0.8, turnoutSec: 45, unlockLevel: 4, transport: { kind: 'prisoner', capacity: 4 } }),
  vt({ id: 'swat', dept: 'police', name: 'SWAT Vehicle', callsign: 'SWAT', short: 'SW', price: 40000, speedFactor: 1.1, minCrew: 4, maxCrew: 6, quals: [q('swat', 4)], caps: ['swat'], maintenancePerHour: 9, fuelPerKm: 1.0, turnoutSec: 120, unlockLevel: 6 }),
  // EMS
  vt({ id: 'bls', dept: 'ems', name: 'BLS Ambulance', callsign: 'Medic', short: 'M', price: 12000, speedFactor: 1.3, minCrew: 2, maxCrew: 2, caps: ['ambulance'], maintenancePerHour: 4, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 1, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'als', dept: 'ems', name: 'ALS Ambulance', callsign: 'ALS', short: 'A', price: 18000, speedFactor: 1.3, minCrew: 2, maxCrew: 2, quals: [q('paramedic')], caps: ['ambulance', 'als'], maintenancePerHour: 5, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 2, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'ems_supervisor', dept: 'ems', name: 'EMS Supervisor', callsign: 'EMS Sup', short: 'ES', price: 15000, speedFactor: 1.35, minCrew: 1, maxCrew: 1, quals: [q('ems_officer')], caps: ['ems_supervisor'], maintenancePerHour: 3, fuelPerKm: 0.45, turnoutSec: 40, unlockLevel: 4 }),
  vt({ id: 'ccu', dept: 'ems', name: 'Critical Care Unit', callsign: 'CCU', short: 'CC', price: 30000, speedFactor: 1.25, minCrew: 2, maxCrew: 3, quals: [q('critical_care'), q('paramedic')], caps: ['ambulance', 'als', 'ccu'], maintenancePerHour: 7, fuelPerKm: 0.7, turnoutSec: 60, unlockLevel: 5, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'mci_unit', dept: 'ems', name: 'Mass Casualty Unit', callsign: 'MCI', short: 'MCI', price: 60000, speedFactor: 1.0, minCrew: 2, maxCrew: 4, quals: [q('mci_ops')], caps: ['mci'], maintenancePerHour: 12, fuelPerKm: 1.3, turnoutSec: 120, unlockLevel: 7, transport: { kind: 'patient', capacity: 4 } }),
  // Public Works
  vt({ id: 'road_crew', dept: 'public_works', name: 'Road Crew Truck', callsign: 'Roads', short: 'RC', price: 28000, speedFactor: 0.95, minCrew: 2, maxCrew: 3, quals: [q('cdl')], caps: ['road_crew'], maintenancePerHour: 7, fuelPerKm: 1.2, turnoutSec: 120, unlockLevel: 3 }),
  vt({ id: 'tree_crew', dept: 'public_works', name: 'Tree Crew', callsign: 'Tree', short: 'TC', price: 32000, speedFactor: 0.95, minCrew: 2, maxCrew: 3, quals: [q('arborist')], caps: ['tree_crew'], maintenancePerHour: 7, fuelPerKm: 1.2, turnoutSec: 120, unlockLevel: 3 }),
  vt({ id: 'signal_crew', dept: 'public_works', name: 'Signal Crew', callsign: 'Signals', short: 'SC', price: 25000, speedFactor: 1.0, minCrew: 2, maxCrew: 2, caps: ['signal_crew'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 90, unlockLevel: 4 }),
  // Water Rescue
  vt({ id: 'rescue_boat', dept: 'water', name: 'Rescue Boat', callsign: 'Marine', short: 'B', price: 35000, speedFactor: 1.05, minCrew: 2, maxCrew: 3, quals: [q('boat_operator')], caps: ['boat'], maintenancePerHour: 9, fuelPerKm: 1.5, turnoutSec: 90, unlockLevel: 4 }),
  vt({ id: 'dive_team', dept: 'water', name: 'Dive Team', callsign: 'Dive', short: 'DV', price: 45000, speedFactor: 1.1, minCrew: 3, maxCrew: 4, quals: [q('rescue_diver', 2)], caps: ['dive'], maintenancePerHour: 10, fuelPerKm: 1.1, turnoutSec: 100, unlockLevel: 6 }),
  // Air Support (flies direct, no road routing)
  vt({ id: 'med_heli', dept: 'air', name: 'Medical Helicopter', callsign: 'Air Medic', short: 'H', price: 350000, speedFactor: 5.5, minCrew: 3, maxCrew: 3, quals: [q('pilot'), q('flight_medic')], caps: ['air_medical'], maintenancePerHour: 60, fuelPerKm: 6, turnoutSec: 240, unlockLevel: 6, air: true, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'police_heli', dept: 'air', name: 'Police Helicopter', callsign: 'Air', short: 'PH', price: 300000, speedFactor: 6, minCrew: 2, maxCrew: 2, quals: [q('pilot'), q('tactical_flight')], caps: ['air_police'], maintenancePerHour: 55, fuelPerKm: 5, turnoutSec: 180, unlockLevel: 7, air: true }),
  // Special Operations
  vt({ id: 'bomb_squad', dept: 'special', name: 'Bomb Squad', callsign: 'Bomb', short: 'BS', price: 70000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, quals: [q('bomb_tech', 2)], caps: ['bomb'], maintenancePerHour: 12, fuelPerKm: 1.1, turnoutSec: 120, unlockLevel: 8 }),
  vt({ id: 'usar', dept: 'special', name: 'USAR Unit', callsign: 'USAR', short: 'US', price: 90000, speedFactor: 1.0, minCrew: 4, maxCrew: 6, quals: [q('usar_tech', 2)], caps: ['usar'], maintenancePerHour: 15, fuelPerKm: 1.5, turnoutSec: 150, unlockLevel: 9 }),
  // Emergency Management
  vt({ id: 'mobile_command', dept: 'emergency', name: 'Mobile Command Post', callsign: 'Command', short: 'MC', price: 80000, speedFactor: 0.95, minCrew: 2, maxCrew: 3, quals: [q('incident_command')], caps: ['command'], maintenancePerHour: 14, fuelPerKm: 1.6, turnoutSec: 180, unlockLevel: 8 }),
  vt({ id: 'logistics', dept: 'emergency', name: 'Logistics Unit', callsign: 'Logistics', short: 'LG', price: 30000, speedFactor: 1.0, minCrew: 2, maxCrew: 2, caps: ['logistics'], maintenancePerHour: 6, fuelPerKm: 1.0, turnoutSec: 150, unlockLevel: 8 }),
  // Disaster Response
  vt({ id: 'heavy_equipment', dept: 'disaster', name: 'Heavy Equipment Unit', callsign: 'Heavy', short: 'HE', price: 120000, speedFactor: 0.85, minCrew: 2, maxCrew: 2, quals: [q('heavy_operator')], caps: ['heavy_equipment'], maintenancePerHour: 20, fuelPerKm: 2.5, turnoutSec: 200, unlockLevel: 10 }),
  vt({ id: 'relief_unit', dept: 'disaster', name: 'Relief & Shelter Unit', callsign: 'Relief', short: 'RU', price: 40000, speedFactor: 1.0, minCrew: 2, maxCrew: 4, caps: ['relief'], maintenancePerHour: 8, fuelPerKm: 1.1, turnoutSec: 150, unlockLevel: 10 }),
];

// Fixed driving speeds used by the fixed-speed travel model (mph).
const MPH: Record<string, number> = {
  engine: 45, ladder: 40, brush: 50, heavy_rescue: 45, chief: 60, hazmat: 40, tanker: 40,
  patrol: 65, traffic: 70, k9: 65, detective: 55, prisoner_van: 50, swat: 50,
  bls: 55, als: 55, ems_supervisor: 60, ccu: 50, mci_unit: 40,
  road_crew: 40, tree_crew: 40, signal_crew: 45, rescue_boat: 45, dive_team: 50,
  med_heli: 150, police_heli: 160, bomb_squad: 50, usar: 40, mobile_command: 40, logistics: 45, heavy_equipment: 30, relief_unit: 45,
};
VEHICLE_TYPES.forEach(v => { v.mph = MPH[v.id] ?? 45; });

// Units each department starts with when its first station is placed.
export const STARTER_KITS: Record<string, { vehicles: string[]; staff: number }> = {
  fire: { vehicles: ['engine'], staff: 5 },
  police: { vehicles: ['patrol', 'patrol'], staff: 4 },
  ems: { vehicles: ['bls'], staff: 3 },
};

import { TUNING } from './tuning';
export const STARTING_MONEY = TUNING.startingMoney;

export const dept = (id: string) => DEPARTMENTS.find(d => d.id === id)!;
export const stationType = (id: string) => STATION_TYPES.find(s => s.id === id)!;
export const vehicleType = (id: string) => VEHICLE_TYPES.find(v => v.id === id)!;
export const capability = (id: string) => CAPABILITIES.find(c => c.id === id)!;
export const qualification = (id: string) => QUALIFICATIONS.find(q => q.id === id)!;
export const stationTypeForDept = (d: string) => STATION_TYPES.find(s => s.dept === d && !s.small)!;
