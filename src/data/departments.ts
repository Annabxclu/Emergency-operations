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
  { id: 'command', name: 'Mobile command', dept: 'fire' },
  { id: 'logistics', name: 'Logistics unit', dept: 'emergency' },
  { id: 'heavy_equipment', name: 'Heavy equipment', dept: 'disaster' },
  { id: 'relief', name: 'Relief & shelter unit', dept: 'disaster' },
  { id: 'arff', name: 'Airport crash tender', dept: 'fire' },
  { id: 'foam', name: 'Foam tender', dept: 'fire' },
  { id: 'investigator', name: 'Fire investigator', dept: 'fire' },
  { id: 'crane', name: 'Fire crane', dept: 'fire' },
  { id: 'riot', name: 'Riot police', dept: 'police' },
  { id: 'drone', name: 'Police drone', dept: 'police' },
  { id: 'game_warden', name: 'Game warden', dept: 'police' },
  { id: 'police_boat', name: 'Police boat', dept: 'police' },
  { id: 'tow', name: 'Tow truck', dept: 'public_works' },
  { id: 'rotator', name: 'Heavy rotator', dept: 'public_works' },
  { id: 'flood', name: 'Flood control unit', dept: 'public_works' },
  { id: 'fireboat', name: 'Fireboat', dept: 'water' },
  { id: 'coastal', name: 'Coastal rescue boat', dept: 'water' },
  { id: 'coast_heli', name: 'Coastal rescue helicopter', dept: 'air' },
  { id: 'federal', name: 'Federal agents', dept: 'special' },
  { id: 'air_unit', name: 'Mobile air unit', dept: 'fire' },
  { id: 'supervisor', name: 'Police supervisor', dept: 'police' },
  { id: 'police_command', name: 'Police mobile command', dept: 'police' },
  { id: 'crime_scene', name: 'Crime scene unit', dept: 'police' },
  { id: 'lifeguard', name: 'Lifeguard', dept: 'fire' },
  { id: 'lifeguard_supervisor', name: 'Lifeguard supervisor', dept: 'fire' },
  { id: 'crew_carrier', name: 'Crew carrier', dept: 'fire' },
  { id: 'semi', name: 'Crew cab semi', dept: 'fire' },
  { id: 'traffic_blocker', name: 'Traffic blocker', dept: 'fire' },
  { id: 'light_supply', name: 'Light tower', dept: 'fire' },
  { id: 'energy_supply', name: 'Generator', dept: 'fire' },
  { id: 'fire_prevention', name: 'Fire prevention', dept: 'fire' },
  { id: 'smoke_jumpers', name: 'Smoke jumper crew', dept: 'fire' },
  { id: 'riot_trailer', name: 'Riot police trailer', dept: 'police' },
  { id: 'coastal_plane', name: 'Coastal patrol plane', dept: 'air' },
  { id: 'fire_aviation', name: 'Fire aviation (air tanker)', dept: 'air' },
  { id: 'coastal_command', name: 'Coastal command', dept: 'water' },
  { id: 'air_attack', name: 'Air attack (brush air command)', dept: 'air' },
];

export const QUALIFICATIONS: QualificationDef[] = [
  { id: 'aerial_operator', name: 'Aerial Operator', dept: 'fire', cost: 3000, hours: 8, unlockLevel: 2 },
  { id: 'wildland', name: 'Wildland Firefighting', dept: 'fire', cost: 2500, hours: 8, unlockLevel: 2 },
  { id: 'tech_rescue', name: 'Technical Rescue Training', dept: 'fire', cost: 5000, hours: 16, unlockLevel: 3 },
  { id: 'fire_officer', name: 'Fire Officer', dept: 'fire', cost: 4500, hours: 12, unlockLevel: 4 },
  { id: 'hazmat_tech', name: 'HazMat', dept: 'fire', cost: 6000, hours: 16, unlockLevel: 5, neededAt: 11 },
  { id: 'mobile_command', name: 'Mobile Command', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1, neededAt: 13 },
  { id: 'fire_investigator', name: 'Law Enforcement for Arson Investigation', dept: 'fire', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'arff_training', name: 'ARFF Training', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'lifeguard', name: 'Lifeguard Training', dept: 'fire', cost: 3000, hours: 8, unlockLevel: 1 },
  { id: 'lifeguard_supervisor', name: 'Lifeguard Supervisor', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'swift_water', name: 'Swift Water Rescue', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'airborne_firefighting', name: 'Airborne Firefighting', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'heavy_machinery', name: 'Heavy Machinery Operating', dept: 'fire', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'hotshot', name: 'Hotshot Crew', dept: 'fire', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'fire_ocean_navigation', name: 'Ocean Navigation', dept: 'fire', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'search_rescue', name: 'Search and Rescue Training', dept: 'fire', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'wildland_lead_pilot', name: 'Wildland Lead Pilot Training', dept: 'fire', cost: 6000, hours: 12, unlockLevel: 1 },
  { id: 'wildland_mcc_training', name: 'Wildland Mobile Command Center Training', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'police_aviation', name: 'Police Aviation', dept: 'police', cost: 6000, hours: 12, unlockLevel: 1 },
  { id: 'sharpshooter', name: 'Sharpshooter Training', dept: 'police', cost: 0, hours: 12, unlockLevel: 1 }, // retired: no longer taught (kept so old saves still show it)
  { id: 'police_swift_water', name: 'Swift Water Rescue', dept: 'police', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'smoke_jumper', name: 'Smoke Jumper Training', dept: 'fire', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'truck_license', name: 'Truck Drivers License', dept: 'fire', cost: 2000, hours: 6, unlockLevel: 1 },
  { id: 'traffic_control', name: 'Traffic Control', dept: 'fire', cost: 2000, hours: 6, unlockLevel: 1 },
  { id: 'police_supervisor', name: 'Police Supervisor/Sheriff', dept: 'police', cost: 5000, hours: 12, unlockLevel: 1, neededAt: 7 },
  { id: 'ocean_navigation', name: 'Ocean Navigation', dept: 'police', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'game_warden_q', name: 'Environmental Game Warden', dept: 'police', cost: 3000, hours: 8, unlockLevel: 1 },
  { id: 'police_ops', name: 'Police Operation Management', dept: 'police', cost: 5000, hours: 12, unlockLevel: 1 },
  { id: 'police_traffic', name: 'Traffic Control', dept: 'police', cost: 2000, hours: 6, unlockLevel: 1 },
  { id: 'riot_training', name: 'Riot Police Training', dept: 'police', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'fbi_bomb_tech', name: 'FBI Bomb Technician', dept: 'police', cost: 6000, hours: 16, unlockLevel: 1 },
  { id: 'drone_operator', name: 'Drone Operator', dept: 'police', cost: 3000, hours: 8, unlockLevel: 1 },
  { id: 'csi', name: 'Crime Scene Investigation Training', dept: 'police', cost: 4000, hours: 12, unlockLevel: 1 },
  { id: 'motor_officer', name: 'Motor Officer', dept: 'police', cost: 2000, hours: 6, unlockLevel: 1 },
  { id: 'traffic_enf', name: 'Traffic Enforcement', dept: 'police', cost: 2000, hours: 6, unlockLevel: 2 },
  { id: 'k9_handler', name: 'K-9', dept: 'police', cost: 5000, hours: 16, unlockLevel: 3, neededAt: 6 },
  { id: 'detective', name: 'Detective Training', dept: 'police', cost: 4000, hours: 12, unlockLevel: 3 },
  { id: 'swat', name: 'SWAT', dept: 'police', cost: 8000, hours: 24, unlockLevel: 6, neededAt: 8 },
  { id: 'paramedic', name: 'Paramedic', dept: 'ems', cost: 4000, hours: 12, unlockLevel: 2 },
  { id: 'ems_officer', name: 'EMS Officer', dept: 'ems', cost: 4000, hours: 12, unlockLevel: 4 },
  { id: 'critical_care', name: 'Critical Care', dept: 'ems', cost: 7000, hours: 20, unlockLevel: 5 },
  { id: 'ems_mobile_command', name: 'EMS Mobile Command', dept: 'ems', cost: 0, hours: 12, unlockLevel: 1 },
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
  vt({ id: 'engine', dept: 'fire', name: 'Type 1 Fire Engine', callsign: 'Engine', short: 'E', price: 5000, speedFactor: 1.15, minCrew: 1, maxCrew: 6, caps: ['engine'], maintenancePerHour: 8, fuelPerKm: 1.2, turnoutSec: 60, unlockLevel: 1, neededAt: 0 }),
  vt({ id: 'ladder', dept: 'fire', name: 'Platform Truck', callsign: 'Truck', short: 'T', price: 10000, speedFactor: 1.05, minCrew: 1, maxCrew: 3, caps: ['ladder'], maintenancePerHour: 12, fuelPerKm: 1.6, turnoutSec: 70, unlockLevel: 2, neededAt: 3 }),
  vt({ id: 'brush', dept: 'fire', name: 'Type 5 Engine', callsign: 'Brush', short: 'BR', price: 8000, speedFactor: 1.15, minCrew: 1, maxCrew: 3, caps: ['brush'], maintenancePerHour: 6, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 2, needsExt: true }),
  vt({ id: 'heavy_rescue', dept: 'fire', name: 'Heavy Rescue Vehicle', callsign: 'Rescue', short: 'R', price: 12180, speedFactor: 1.1, minCrew: 1, maxCrew: 4, caps: ['rescue'], maintenancePerHour: 11, fuelPerKm: 1.4, turnoutSec: 70, unlockLevel: 3, neededAt: 4 }),
  vt({ id: 'chief', dept: 'fire', name: 'Battalion Chief Unit', callsign: 'Battalion', short: 'BC', price: 10000, speedFactor: 1.35, minCrew: 1, maxCrew: 3, caps: ['chief'], maintenancePerHour: 4, fuelPerKm: 0.5, turnoutSec: 45, unlockLevel: 4, neededAt: 6 }),
  vt({ id: 'hazmat', dept: 'fire', name: 'HazMat', callsign: 'Hazmat', short: 'HM', price: 19200, speedFactor: 1.0, minCrew: 1, maxCrew: 6, quals: [q('hazmat_tech')], caps: ['hazmat'], maintenancePerHour: 12, fuelPerKm: 1.5, turnoutSec: 90, unlockLevel: 5, neededAt: 11 }),
  vt({ id: 'tanker', dept: 'fire', name: 'Water Tanker', callsign: 'Tanker', short: 'TK', price: 17300, speedFactor: 0.95, minCrew: 1, maxCrew: 3, caps: ['water_supply'], maintenancePerHour: 8, fuelPerKm: 1.5, turnoutSec: 70, unlockLevel: 5, neededAt: 7 }),
  // Police
  vt({ id: 'patrol', dept: 'police', name: 'Patrol Car', callsign: 'Patrol', short: 'P', price: 5000, speedFactor: 1.35, minCrew: 1, maxCrew: 2, caps: ['police'], maintenancePerHour: 3, fuelPerKm: 0.4, turnoutSec: 30, unlockLevel: 1, transport: { kind: 'prisoner', capacity: 1 }, neededAt: 0 }),
  vt({ id: 'traffic', dept: 'police', name: 'Traffic Enforcement', callsign: 'Traffic', short: 'TE', price: 11000, speedFactor: 1.4, minCrew: 1, maxCrew: 1, quals: [q('police_traffic')], caps: ['police', 'traffic'], maintenancePerHour: 3, fuelPerKm: 0.45, turnoutSec: 30, unlockLevel: 2, transport: { kind: 'prisoner', capacity: 1 } }),
  vt({ id: 'k9', dept: 'police', name: 'K-9 Unit', callsign: 'K-9', short: 'K9', price: 7000, speedFactor: 1.35, minCrew: 1, maxCrew: 2, quals: [q('k9_handler')], caps: ['police', 'k9'], maintenancePerHour: 4, fuelPerKm: 0.45, turnoutSec: 40, unlockLevel: 3, neededAt: 6 }),
  vt({ id: 'detective', dept: 'police', name: 'Detective Vehicle', callsign: 'Detective', short: 'D', price: 5000, speedFactor: 1.25, minCrew: 1, maxCrew: 2, quals: [q('detective')], caps: ['investigation'], maintenancePerHour: 3, fuelPerKm: 0.4, turnoutSec: 60, unlockLevel: 3, needsExt: true }),
  vt({ id: 'prisoner_van', dept: 'police', name: 'Police Prisoner Van', callsign: 'Transport', short: 'PV', price: 25000, speedFactor: 1.15, minCrew: 2, maxCrew: 4, caps: ['prisoner_transport'], maintenancePerHour: 5, fuelPerKm: 0.8, turnoutSec: 45, unlockLevel: 4, transport: { kind: 'prisoner', capacity: 5 } }),
  vt({ id: 'swat', dept: 'police', name: 'SWAT Armored Vehicle', callsign: 'SWAT', short: 'SW', price: 10000, speedFactor: 1.1, minCrew: 6, maxCrew: 6, quals: [q('swat', 6)], caps: ['swat'], maintenancePerHour: 9, fuelPerKm: 1.0, turnoutSec: 120, unlockLevel: 6, neededAt: 8 }),
  // EMS
  vt({ id: 'bls', dept: 'ems', name: 'BLS Ambulance', callsign: 'Medic', short: 'M', price: 5000, speedFactor: 1.3, minCrew: 1, maxCrew: 2, caps: ['ambulance'], maintenancePerHour: 4, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 1, transport: { kind: 'patient', capacity: 1 }, neededAt: 0 }),
  vt({ id: 'als', dept: 'ems', name: 'ALS Ambulance', callsign: 'ALS', short: 'A', price: 5000, speedFactor: 1.3, minCrew: 1, maxCrew: 3, quals: [q('paramedic')], caps: ['ambulance', 'als'], maintenancePerHour: 5, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 2, transport: { kind: 'patient', capacity: 1 }, neededAt: 0 }),
  vt({ id: 'ems_supervisor', dept: 'ems', name: 'EMS Chief', callsign: 'EMS Chief', short: 'ES', price: 10000, speedFactor: 1.35, minCrew: 1, maxCrew: 2, caps: ['ems_supervisor'], maintenancePerHour: 3, fuelPerKm: 0.45, turnoutSec: 40, unlockLevel: 4, neededAt: 10 }),
  vt({ id: 'ccu', dept: 'ems', name: 'Critical Care Unit', callsign: 'CCU', short: 'CC', price: 30000, speedFactor: 1.25, minCrew: 2, maxCrew: 3, quals: [q('critical_care'), q('paramedic')], caps: ['ambulance', 'als', 'ccu'], maintenancePerHour: 7, fuelPerKm: 0.7, turnoutSec: 60, unlockLevel: 5, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'mci_unit', dept: 'ems', name: 'Mass Casualty Unit', callsign: 'MCI', short: 'MCI', price: 25000, speedFactor: 1.0, minCrew: 6, maxCrew: 6, caps: ['mci'], maintenancePerHour: 12, fuelPerKm: 1.3, turnoutSec: 120, unlockLevel: 7, transport: { kind: 'patient', capacity: 7 }, neededAt: 20 }),
  // Public Works
  vt({ id: 'road_crew', dept: 'public_works', name: 'Road Crew Truck', callsign: 'Roads', short: 'RC', price: 28000, speedFactor: 0.95, minCrew: 2, maxCrew: 3, quals: [q('cdl')], caps: ['road_crew'], maintenancePerHour: 7, fuelPerKm: 1.2, turnoutSec: 120, unlockLevel: 3 }),
  vt({ id: 'tree_crew', dept: 'public_works', name: 'Tree Crew', callsign: 'Tree', short: 'TC', price: 32000, speedFactor: 0.95, minCrew: 2, maxCrew: 3, quals: [q('arborist')], caps: ['tree_crew'], maintenancePerHour: 7, fuelPerKm: 1.2, turnoutSec: 120, unlockLevel: 3 }),
  vt({ id: 'signal_crew', dept: 'public_works', name: 'Signal Crew', callsign: 'Signals', short: 'SC', price: 25000, speedFactor: 1.0, minCrew: 2, maxCrew: 2, caps: ['signal_crew'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 90, unlockLevel: 4 }),
  // Water Rescue
  vt({ id: 'rescue_boat', dept: 'water', name: 'Rescue Boat', callsign: 'Marine', short: 'B', price: 35000, speedFactor: 1.05, minCrew: 2, maxCrew: 3, quals: [q('boat_operator')], caps: ['boat'], maintenancePerHour: 9, fuelPerKm: 1.5, turnoutSec: 90, unlockLevel: 4 }),
  vt({ id: 'dive_team', dept: 'water', name: 'Dive Team', callsign: 'Dive', short: 'DV', price: 45000, speedFactor: 1.1, minCrew: 3, maxCrew: 4, quals: [q('rescue_diver', 2)], caps: ['dive'], maintenancePerHour: 10, fuelPerKm: 1.1, turnoutSec: 100, unlockLevel: 6 }),
  // Air Support (flies direct, no road routing)
  vt({ id: 'med_heli', dept: 'air', name: 'Medical Helicopter', callsign: 'Air Medic', short: 'H', price: 350000, speedFactor: 5.5, minCrew: 3, maxCrew: 3, quals: [q('pilot'), q('flight_medic')], caps: ['air_medical'], maintenancePerHour: 60, fuelPerKm: 6, turnoutSec: 240, unlockLevel: 6, air: true, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'police_heli', dept: 'air', name: 'Police Helicopter', callsign: 'Air', short: 'PH', price: 300000, speedFactor: 6, minCrew: 1, maxCrew: 5, quals: [q('pilot'), q('tactical_flight')], caps: ['air_police'], maintenancePerHour: 55, fuelPerKm: 5, turnoutSec: 180, unlockLevel: 7, air: true }),
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

// Units added with the full mission catalog. Those marked needsExt can only be bought at a
// station that has the matching extension (see EXTENSIONS in progression.ts).
VEHICLE_TYPES.push(
  vt({ id: 'arff', dept: 'fire', name: 'Large ARFF Crash Tender', callsign: 'Crash', short: 'AR', price: 20000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, quals: [q('arff_training', 2)], caps: ['arff'], maintenancePerHour: 15, fuelPerKm: 2, turnoutSec: 45, unlockLevel: 1, needsExt: true }),
  vt({ id: 'foam_tender', dept: 'fire', name: 'Foam Tender', callsign: 'Foam', short: 'FT', price: 35000, speedFactor: 1.0, minCrew: 2, maxCrew: 3, caps: ['foam'], maintenancePerHour: 9, fuelPerKm: 1.5, turnoutSec: 70, unlockLevel: 1, needsExt: true }),
  vt({ id: 'fire_investigator', dept: 'fire', name: 'Fire Investigator Unit', callsign: 'Marshal', short: 'FI', price: 25000, speedFactor: 1.3, minCrew: 1, maxCrew: 2, quals: [q('fire_investigator')], caps: ['investigator'], maintenancePerHour: 3, fuelPerKm: 0.5, turnoutSec: 60, unlockLevel: 1, needsExt: true, transport: { kind: 'prisoner', capacity: 1 } }),
  vt({ id: 'fire_crane', dept: 'fire', name: 'Fire Crane', callsign: 'Crane', short: 'CR', price: 90000, speedFactor: 0.9, minCrew: 2, maxCrew: 2, caps: ['crane'], maintenancePerHour: 14, fuelPerKm: 2.2, turnoutSec: 90, unlockLevel: 1, needsExt: true }),
  vt({ id: 'riot_unit', dept: 'police', name: 'Riot Police Van', callsign: 'Riot', short: 'RT', price: 10000, speedFactor: 1.1, minCrew: 4, maxCrew: 12, quals: [q('riot_training', 4)], caps: ['riot'], maintenancePerHour: 6, fuelPerKm: 0.9, turnoutSec: 90, unlockLevel: 1, needsExt: true }),
  vt({ id: 'police_drone', dept: 'police', name: 'Police Drone Unit', callsign: 'Drone', short: 'DR', price: 15000, speedFactor: 1.3, minCrew: 1, maxCrew: 2, caps: ['drone'], maintenancePerHour: 3, fuelPerKm: 0.4, turnoutSec: 45, unlockLevel: 3 }),
  vt({ id: 'game_warden', dept: 'police', name: "Warden's Truck", callsign: 'Warden', short: 'GW', price: 15000, speedFactor: 1.2, minCrew: 1, maxCrew: 2, quals: [q('game_warden_q')], caps: ['game_warden'], maintenancePerHour: 3, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 1, needsExt: true }),
  vt({ id: 'police_boat', dept: 'police', name: 'Patrol Boat', callsign: 'Marine Unit', short: 'PB', price: 30000, speedFactor: 1.05, minCrew: 1, maxCrew: 2, quals: [q('ocean_navigation')], caps: ['police_boat'], maintenancePerHour: 8, fuelPerKm: 1.4, turnoutSec: 80, unlockLevel: 1, needsExt: true }),
  vt({ id: 'tow_truck', dept: 'public_works', name: 'Tow Truck', callsign: 'Tow', short: 'TW', price: 20000, speedFactor: 1.05, minCrew: 1, maxCrew: 1, caps: ['tow'], maintenancePerHour: 4, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 3 }),
  vt({ id: 'rotator', dept: 'public_works', name: 'Heavy Rotator', callsign: 'Rotator', short: 'RO', price: 70000, speedFactor: 0.9, minCrew: 1, maxCrew: 2, caps: ['rotator'], maintenancePerHour: 10, fuelPerKm: 2, turnoutSec: 90, unlockLevel: 4 }),
  vt({ id: 'flood_unit', dept: 'public_works', name: 'Flood Control Unit', callsign: 'Pumps', short: 'FL', price: 45000, speedFactor: 0.95, minCrew: 2, maxCrew: 3, caps: ['flood'], maintenancePerHour: 7, fuelPerKm: 1.3, turnoutSec: 90, unlockLevel: 4 }),
  vt({ id: 'fireboat', dept: 'water', name: 'Fireboat', callsign: 'Fireboat', short: 'FB', price: 150000, speedFactor: 1.0, minCrew: 3, maxCrew: 4, caps: ['fireboat'], maintenancePerHour: 18, fuelPerKm: 3, turnoutSec: 100, unlockLevel: 5 }),
  vt({ id: 'coastal_boat', dept: 'water', name: 'Coastal Rescue Boat', callsign: 'Coastal', short: 'CB', price: 120000, speedFactor: 1.1, minCrew: 3, maxCrew: 4, caps: ['coastal'], maintenancePerHour: 15, fuelPerKm: 2.5, turnoutSec: 90, unlockLevel: 4, transport: { kind: 'patient', capacity: 2 } }),
  vt({ id: 'coast_heli', dept: 'air', name: 'Coastal Rescue Helicopter', callsign: 'Coast Air', short: 'CH', price: 400000, speedFactor: 5.5, minCrew: 3, maxCrew: 4, quals: [q('pilot')], caps: ['coast_heli'], maintenancePerHour: 60, fuelPerKm: 6, turnoutSec: 240, unlockLevel: 6, air: true, transport: { kind: 'patient', capacity: 1 } }),
  vt({ id: 'fire_command', dept: 'fire', name: 'Mobile Command Vehicle', callsign: 'Command', short: 'MCV', price: 25500, speedFactor: 1.0, minCrew: 1, maxCrew: 6, quals: [q('mobile_command')], caps: ['command', 'chief'], maintenancePerHour: 8, fuelPerKm: 1.2, turnoutSec: 90, unlockLevel: 6, neededAt: 13 }),
  vt({ id: 'air_unit', dept: 'fire', name: 'Mobile Air', callsign: 'Air Unit', short: 'MA', price: 11680, speedFactor: 1.0, minCrew: 1, maxCrew: 3, caps: ['air_unit'], maintenancePerHour: 6, fuelPerKm: 1.1, turnoutSec: 80, unlockLevel: 5, neededAt: 5 }),
  // MissionChief additions
  vt({ id: 'type2_engine', dept: 'fire', name: 'Type 2 Fire Engine', callsign: 'Engine', short: 'E2', price: 5000, speedFactor: 1.15, minCrew: 1, maxCrew: 3, caps: ['engine'], maintenancePerHour: 6, fuelPerKm: 1.0, turnoutSec: 60, unlockLevel: 1, neededAt: 0 }),
  vt({ id: 'quint', dept: 'fire', name: 'Quint', callsign: 'Quint', short: 'Q', price: 19000, speedFactor: 1.05, minCrew: 1, maxCrew: 6, caps: ['engine', 'ladder'], maintenancePerHour: 12, fuelPerKm: 1.6, turnoutSec: 70, unlockLevel: 1, neededAt: 3 }),
  vt({ id: 'rescue_engine', dept: 'fire', name: 'Rescue Engine', callsign: 'Rescue Engine', short: 'RE', price: 19000, speedFactor: 1.1, minCrew: 1, maxCrew: 6, caps: ['engine', 'rescue'], maintenancePerHour: 11, fuelPerKm: 1.4, turnoutSec: 65, unlockLevel: 1, neededAt: 4 }),
  vt({ id: 'utility_unit', dept: 'fire', name: 'Utility Unit', callsign: 'Utility', short: 'U', price: 12180, speedFactor: 1.15, minCrew: 1, maxCrew: 4, caps: ['rescue'], maintenancePerHour: 6, fuelPerKm: 1.0, turnoutSec: 60, unlockLevel: 1, neededAt: 4 }),
  vt({ id: 'motorcycle', dept: 'police', name: 'Police Motorcycle', callsign: 'Motor', short: 'MO', price: 2500, speedFactor: 1.45, minCrew: 1, maxCrew: 1, caps: ['police'], maintenancePerHour: 2, fuelPerKm: 0.2, turnoutSec: 25, unlockLevel: 1, neededAt: 0 }),
  vt({ id: 'swat_suv', dept: 'police', name: 'SWAT SUV', callsign: 'SWAT', short: 'SS', price: 7000, speedFactor: 1.2, minCrew: 2, maxCrew: 4, quals: [q('swat', 2)], caps: ['swat'], maintenancePerHour: 5, fuelPerKm: 0.6, turnoutSec: 90, unlockLevel: 1, neededAt: 8 }),
  // ---- MissionChief vehicle list (from the player's spreadsheet)
  vt({ id: 'arff_medium', dept: 'fire', name: 'Medium ARFF Crash Tender', callsign: 'Crash', short: 'ARM', price: 16000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, caps: ['arff'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('arff_training', 2)], needsExt: true }),
  vt({ id: 'arff_small', dept: 'fire', name: 'Small ARFF Crash Tender', callsign: 'Crash', short: 'ARS', price: 12000, speedFactor: 1.1, minCrew: 2, maxCrew: 2, caps: ['arff'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('arff_training', 2)], needsExt: true }),
  vt({ id: 'type3_engine', dept: 'fire', name: 'Type 3 Engine', callsign: 'Brush', short: 'B3', price: 19000, speedFactor: 1.1, minCrew: 3, maxCrew: 5, caps: ['brush'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'type4_engine', dept: 'fire', name: 'Type 4 Engine', callsign: 'Brush', short: 'B4', price: 10000, speedFactor: 1.1, minCrew: 3, maxCrew: 5, caps: ['brush'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'type6_engine', dept: 'fire', name: 'Type 6 Engine', callsign: 'Brush', short: 'B6', price: 5000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['brush'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'type7_engine', dept: 'fire', name: 'Type 7 Engine', callsign: 'Brush', short: 'B7', price: 5000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['brush'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'wildland_mcc', dept: 'fire', name: 'Wildland MCC', callsign: 'Wildland Command', short: 'WMC', price: 20000, speedFactor: 1.1, minCrew: 1, maxCrew: 6, quals: [q('wildland_mcc_training')], caps: ['command'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'fire_prevention', dept: 'fire', name: 'Fire Prevention Unit', callsign: 'Prevention', short: 'FP', price: 15000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['fire_prevention'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'lifeguard_truck', dept: 'fire', name: 'Lifeguard Truck', callsign: 'Lifeguard', short: 'LG', price: 10000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, caps: ['lifeguard'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1 }),
  vt({ id: 'lifeguard_rescue', dept: 'fire', name: 'Lifeguard Rescue', callsign: 'Lifeguard Rescue', short: 'LR', price: 35000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, caps: ['lifeguard'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('lifeguard', 2)], needsExt: true }),
  vt({ id: 'lifeguard_supervisor', dept: 'fire', name: 'Lifeguard Supervisor', callsign: 'Lifeguard Sup', short: 'LS', price: 25000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['lifeguard_supervisor'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('lifeguard_supervisor')], needsExt: true }),
  vt({ id: 'heavy_rescue_boat', dept: 'fire', name: 'Heavy Rescue + Light Boat', callsign: 'Rescue Boat', short: 'HRB', price: 19000, speedFactor: 1.1, minCrew: 3, maxCrew: 5, caps: ['rescue', 'boat'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('swift_water', 3)], needsExt: true }),
  vt({ id: 'boat_trailer', dept: 'fire', name: 'Double Light Boat Trailer', callsign: 'Boat Trailer', short: 'BT', price: 60000, speedFactor: 1.1, minCrew: 0, maxCrew: 0, caps: ['boat'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, capCount: { boat: 2 }, towedBy: ['utility_unit', 'chief', 'type2_engine', 'brush', 'type6_engine', 'heavy_rescue'], needsExt: true }),
  vt({ id: 'tanker_trailer', dept: 'fire', name: 'Tanker Semi Truck Trailer', callsign: 'Tanker Trailer', short: 'TT', price: 20000, speedFactor: 1.1, minCrew: 0, maxCrew: 0, caps: ['water_supply'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, towedBy: ['crew_cab_semi'] }),
  vt({ id: 'flood_trailer', dept: 'fire', name: 'Flood Equipment Trailer', callsign: 'Flood Trailer', short: 'FT', price: 15000, speedFactor: 1.1, minCrew: 0, maxCrew: 0, caps: ['flood'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, towedBy: ['utility_unit', 'chief', 'type2_engine', 'brush', 'type6_engine', 'heavy_rescue'], needsExt: true }),
  vt({ id: 'light_trailer', dept: 'fire', name: 'Light Tower Trailer', callsign: 'Light Tower', short: 'LT', price: 10000, speedFactor: 1.1, minCrew: 0, maxCrew: 0, caps: ['light_supply'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, towedBy: ['utility_unit', 'chief', 'engine', 'type2_engine', 'heavy_rescue'], needsExt: true }),
  vt({ id: 'generator_trailer', dept: 'fire', name: 'Energy Generator Trailer', callsign: 'Generator', short: 'GT', price: 10000, speedFactor: 1.1, minCrew: 0, maxCrew: 0, caps: ['energy_supply'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, towedBy: ['utility_unit', 'chief', 'engine', 'type2_engine', 'heavy_rescue'], needsExt: true }),
  vt({ id: 'firewrecker', dept: 'fire', name: 'Firewrecker', callsign: 'Wrecker', short: 'FW', price: 15000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['tow'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'pumper_tanker', dept: 'fire', name: 'Pumper Tanker', callsign: 'Tanker', short: 'PT', price: 19000, speedFactor: 1.1, minCrew: 1, maxCrew: 6, caps: ['engine', 'water_supply'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1 }),
  vt({ id: 'crew_carrier', dept: 'fire', name: 'Crew Carrier', callsign: 'Crew', short: 'CC', price: 10000, speedFactor: 1.1, minCrew: 1, maxCrew: 12, quals: [q('smoke_jumper')], caps: ['smoke_jumpers'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1 }),
  vt({ id: 'crew_cab_semi', dept: 'fire', name: 'Crew Cab Semi', callsign: 'Semi', short: 'CS', price: 5000, speedFactor: 1.1, minCrew: 1, maxCrew: 3, caps: ['semi'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('truck_license')] }),
  vt({ id: 'fire_traffic_blocker', dept: 'fire', name: 'Fire Traffic Blocker Unit', callsign: 'Blocker', short: 'TB', price: 12000, speedFactor: 1.1, minCrew: 1, maxCrew: 6, caps: ['traffic_blocker'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('traffic_control')] }),
  vt({ id: 'police_supervisor', dept: 'police', name: 'Police Supervisor', callsign: 'Supervisor', short: 'SUP', price: 15000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['supervisor'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('police_supervisor')], neededAt: 7 }),
  vt({ id: 'police_crew_carrier', dept: 'police', name: 'Police Crew Carrier', callsign: 'Crew', short: 'PCC', price: 10000, speedFactor: 1.1, minCrew: 1, maxCrew: 12, caps: ['crew_carrier'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1 }),
  vt({ id: 'police_mcv', dept: 'police', name: 'Police MCV', callsign: 'Police Command', short: 'PMC', price: 20000, speedFactor: 1.1, minCrew: 1, maxCrew: 6, caps: ['police_command'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('police_ops')] }),
  vt({ id: 'police_traffic_blocker', dept: 'police', name: 'Police Traffic Blocker Unit', callsign: 'Blocker', short: 'PTB', price: 12000, speedFactor: 1.1, minCrew: 1, maxCrew: 6, caps: ['traffic_blocker'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('police_traffic')] }),
  vt({ id: 'k9_small_carrier', dept: 'police', name: 'Small K9 Carrier', callsign: 'K-9 Carrier', short: 'K9S', price: 30000, speedFactor: 1.1, minCrew: 1, maxCrew: 4, caps: ['k9'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('k9_handler')], capCount: { k9: 4 } }),
  vt({ id: 'k9_large_carrier', dept: 'police', name: 'Large K9 Carrier', callsign: 'K-9 Carrier', short: 'K9L', price: 45000, speedFactor: 1.1, minCrew: 1, maxCrew: 4, caps: ['k9'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('k9_handler')], capCount: { k9: 8 } }),
  vt({ id: 'riot_bus', dept: 'police', name: 'Riot Police Bus', callsign: 'Riot Bus', short: 'RB', price: 20000, speedFactor: 1.1, minCrew: 4, maxCrew: 24, caps: ['riot'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, capCount: { riot: 2 }, needsExt: true }),
  vt({ id: 'fbi_wagon', dept: 'police', name: 'FBI Investigation Wagon', callsign: 'FBI', short: 'FBI', price: 10000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, caps: ['federal'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'fbi_bomb_tech', dept: 'police', name: 'FBI Bomb Technician Vehicle', callsign: 'FBI Bomb', short: 'FBB', price: 35000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['bomb'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('fbi_bomb_tech')], needsExt: true }),
  vt({ id: 'fbi_drone', dept: 'police', name: 'FBI Surveillance Drone', callsign: 'FBI Drone', short: 'FBD', price: 25000, speedFactor: 1.1, minCrew: 1, maxCrew: 1, caps: ['drone'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('drone_operator')], needsExt: true }),
  vt({ id: 'police_wrecker', dept: 'police', name: 'Police Wrecker', callsign: 'Wrecker', short: 'PW', price: 15000, speedFactor: 1.1, minCrew: 1, maxCrew: 2, caps: ['tow'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, needsExt: true }),
  vt({ id: 'police_boat_trailer', dept: 'police', name: 'Police Water Rescue Double Boat Trailer', callsign: 'Boat Trailer', short: 'PBT', price: 60000, speedFactor: 1.1, minCrew: 0, maxCrew: 0, caps: ['boat'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, capCount: { boat: 2 }, towedBy: ['patrol', 'k9', 'police_crew_carrier', 'police_supervisor', 'game_warden', 'swat', 'swat_suv'] }),
  vt({ id: 'crime_scene_unit', dept: 'police', name: 'Crime Scene Unit', callsign: 'CSU', short: 'CSU', price: 10000, speedFactor: 1.1, minCrew: 2, maxCrew: 2, caps: ['crime_scene'], maintenancePerHour: 5, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1, quals: [q('csi', 2)], needsExt: true }),
  vt({ id: 'riot_trailer', dept: 'police', name: 'Riot Police Trailer', callsign: 'Riot Trailer', short: 'RPT', price: 10000, speedFactor: 1, minCrew: 0, maxCrew: 0, caps: ['riot_trailer'], maintenancePerHour: 2, fuelPerKm: 0.3, turnoutSec: 60, unlockLevel: 1, towedBy: ['riot_unit', 'riot_bus'], needsExt: true }),
  vt({ id: 'coastal_plane', dept: 'air', name: 'Coastal Patrol Plane', callsign: 'Coast Plane', short: 'CPL', price: 350000, speedFactor: 7, minCrew: 3, maxCrew: 5, quals: [q('pilot')], caps: ['coastal_plane'], maintenancePerHour: 60, fuelPerKm: 6, turnoutSec: 240, unlockLevel: 1, air: true }),
  vt({ id: 'air_tanker', dept: 'air', name: 'Fire Aviation Air Tanker', callsign: 'Tanker', short: 'AT', price: 400000, speedFactor: 7, minCrew: 2, maxCrew: 2, quals: [q('pilot')], caps: ['fire_aviation'], maintenancePerHour: 70, fuelPerKm: 7, turnoutSec: 240, unlockLevel: 1, air: true }),
  vt({ id: 'air_attack', dept: 'air', name: 'Air Attack (Brush Air Command)', callsign: 'Air Attack', short: 'AA', price: 300000, speedFactor: 7, minCrew: 2, maxCrew: 2, quals: [q('pilot')], caps: ['air_attack'], maintenancePerHour: 50, fuelPerKm: 5, turnoutSec: 200, unlockLevel: 1, air: true }),
  vt({ id: 'coastal_command', dept: 'water', name: 'Coastal Command Vehicle', callsign: 'Coastal Command', short: 'CCV', price: 30000, speedFactor: 1.1, minCrew: 2, maxCrew: 4, caps: ['coastal_command'], maintenancePerHour: 6, fuelPerKm: 0.9, turnoutSec: 60, unlockLevel: 1 }),
  vt({ id: 'federal_unit', dept: 'special', name: 'Federal Agents', callsign: 'Federal', short: 'FA', price: 30000, speedFactor: 1.3, minCrew: 2, maxCrew: 4, caps: ['federal'], maintenancePerHour: 5, fuelPerKm: 0.6, turnoutSec: 90, unlockLevel: 7 }),
);

// Fixed driving speeds used by the fixed-speed travel model (mph).
const MPH: Record<string, number> = {
  engine: 45, ladder: 40, brush: 50, heavy_rescue: 45, chief: 60, hazmat: 40, tanker: 40,
  patrol: 65, traffic: 70, k9: 65, detective: 55, prisoner_van: 50, swat: 50,
  bls: 55, als: 55, ems_supervisor: 60, ccu: 50, mci_unit: 40,
  road_crew: 40, tree_crew: 40, signal_crew: 45, rescue_boat: 45, dive_team: 50,
  med_heli: 150, police_heli: 160, bomb_squad: 50, usar: 40, mobile_command: 40, logistics: 45, heavy_equipment: 30, relief_unit: 45,
  arff: 55, foam_tender: 40, fire_investigator: 60, fire_crane: 35, riot_unit: 55, police_drone: 60, game_warden: 55, police_boat: 45,
  tow_truck: 50, rotator: 40, flood_unit: 40, fireboat: 40, coastal_boat: 45, coast_heli: 150, federal_unit: 60, fire_command: 45, air_unit: 45,
  type2_engine: 50, quint: 40, rescue_engine: 45, utility_unit: 50, motorcycle: 75, swat_suv: 60,
  arff_medium: 45, arff_small: 50, type3_engine: 50, type4_engine: 50, type6_engine: 55, type7_engine: 55, wildland_mcc: 45,
  fire_prevention: 55, lifeguard_truck: 50, lifeguard_rescue: 50, lifeguard_supervisor: 55, heavy_rescue_boat: 40, boat_trailer: 40,
  tanker_trailer: 40, flood_trailer: 40, light_trailer: 40, generator_trailer: 40, firewrecker: 45, pumper_tanker: 40, crew_carrier: 50,
  crew_cab_semi: 45, fire_traffic_blocker: 45, police_supervisor: 65, police_crew_carrier: 50, police_mcv: 45, police_traffic_blocker: 50,
  k9_small_carrier: 55, k9_large_carrier: 50, riot_bus: 45, fbi_wagon: 60, fbi_bomb_tech: 55, fbi_drone: 60, police_wrecker: 45,
  police_boat_trailer: 45, crime_scene_unit: 55, riot_trailer: 45, coastal_command: 55,
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

/** Courses taught at the Fire and Police Academies, with their length in (real) days. */
export const ACADEMY_COURSES: Record<string, Record<string, number>> = {
  fire: {
    arff_training: 3, airborne_firefighting: 5, hazmat_tech: 3, heavy_machinery: 3, hotshot: 3, fire_investigator: 4,
    lifeguard_supervisor: 5, lifeguard: 5, mobile_command: 5, fire_ocean_navigation: 5, search_rescue: 4, smoke_jumper: 3,
    swift_water: 4, tech_rescue: 4, traffic_control: 3, truck_license: 2, wildland_lead_pilot: 7, wildland_mcc_training: 5,
  },
  police: {
    csi: 5, detective: 5, drone_operator: 5, game_warden_q: 4, fbi_bomb_tech: 5, k9_handler: 5, ocean_navigation: 5,
    police_aviation: 7, police_supervisor: 5, riot_training: 3, swat: 5, police_swift_water: 4, police_traffic: 3,
    police_ops: 5,
  },
};
export const ACADEMIES: Record<string, { name: string; cost: number; classroomCost: number; maxExtraClassrooms: number; seatsPerClassroom: number }> = {
  fire: { name: 'Fire Academy', cost: 500000, classroomCost: 400000, maxExtraClassrooms: 3, seatsPerClassroom: 10 },
  police: { name: 'Police Academy', cost: 500000, classroomCost: 400000, maxExtraClassrooms: 3, seatsPerClassroom: 10 },
};
for (const [d, list] of Object.entries(ACADEMY_COURSES)) for (const [id, days] of Object.entries(list)) {
  const qd = QUALIFICATIONS.find(x => x.id === id && x.dept === d);
  if (qd) { qd.days = days; qd.hours = days * 24; delete qd.neededAt; qd.unlockLevel = 1; } // academy courses: open as soon as the academy exists
}
for (const qd of QUALIFICATIONS) qd.cost = 0; // all training is free

/** Can this training still be started (fire/police courses only at the academy)? */
export const isTrainable = (qd: QualificationDef) => !ACADEMY_COURSES[qd.dept] || qd.id in ACADEMY_COURSES[qd.dept];
