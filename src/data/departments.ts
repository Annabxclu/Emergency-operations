import type { CapabilityDef, DepartmentDef, QualificationDef, StationTypeDef, VehicleTypeDef } from '../engine/types';

// To add a department (Water Rescue, Air Support, ...): add a DepartmentDef, a
// StationTypeDef, its VehicleTypeDefs, capabilities and any qualifications.
// The engine and UI read everything from these tables.

export const DEPARTMENTS: DepartmentDef[] = [
  { id: 'fire', name: 'Fire Department', short: 'Fire', color: '#d9463b', unlockLevel: 1, empPrefix: 'AFD', baseSalaryPerHour: 48, hireCost: 2500,
    ranks: ['Firefighter', 'Engineer', 'Lieutenant', 'Captain', 'Battalion Chief'] },
  { id: 'police', name: 'Police Department', short: 'Police', color: '#2f6fe0', unlockLevel: 1, empPrefix: 'APD', baseSalaryPerHour: 45, hireCost: 2000,
    ranks: ['Officer', 'Senior Officer', 'Sergeant', 'Lieutenant', 'Captain'] },
  { id: 'ems', name: 'Emergency Medical Services', short: 'EMS', color: '#e39a12', unlockLevel: 1, empPrefix: 'EMS', baseSalaryPerHour: 40, hireCost: 1800,
    ranks: ['EMT', 'Senior EMT', 'Field Supervisor', 'Operations Manager'] },
];

export const STATION_TYPES: StationTypeDef[] = [
  { id: 'fire_station', dept: 'fire', name: 'Fire Station', cost: 60000, upkeepPerHour: 60, contractPerHour: 70, coverageKm: 3.5,
    levels: [ { bays: 2, staff: 10, upgradeCost: 0 }, { bays: 3, staff: 14, upgradeCost: 25000 }, { bays: 4, staff: 18, upgradeCost: 40000 }, { bays: 6, staff: 26, upgradeCost: 65000 } ] },
  { id: 'police_precinct', dept: 'police', name: 'Police Precinct', cost: 50000, upkeepPerHour: 50, contractPerHour: 60, coverageKm: 4,
    levels: [ { bays: 3, staff: 8, upgradeCost: 0 }, { bays: 5, staff: 12, upgradeCost: 20000 }, { bays: 7, staff: 16, upgradeCost: 35000 }, { bays: 10, staff: 24, upgradeCost: 55000 } ] },
  { id: 'ems_station', dept: 'ems', name: 'EMS Station', cost: 35000, upkeepPerHour: 40, contractPerHour: 50, coverageKm: 4.5,
    levels: [ { bays: 2, staff: 6, upgradeCost: 0 }, { bays: 3, staff: 9, upgradeCost: 15000 }, { bays: 4, staff: 12, upgradeCost: 28000 }, { bays: 6, staff: 18, upgradeCost: 45000 } ] },
];

export const CAPABILITIES: CapabilityDef[] = [
  { id: 'engine', name: 'Fire engine', dept: 'fire' },
  { id: 'ladder', name: 'Ladder truck', dept: 'fire' },
  { id: 'rescue', name: 'Heavy rescue', dept: 'fire' },
  { id: 'hazmat', name: 'Hazmat unit', dept: 'fire' },
  { id: 'police', name: 'Police unit', dept: 'police' },
  { id: 'traffic', name: 'Traffic unit', dept: 'police' },
  { id: 'k9', name: 'K-9 unit', dept: 'police' },
  { id: 'swat', name: 'SWAT team', dept: 'police' },
  { id: 'ambulance', name: 'Ambulance', dept: 'ems' },
  { id: 'als', name: 'ALS ambulance', dept: 'ems' },
  { id: 'ccu', name: 'Critical care unit', dept: 'ems' },
];

export const QUALIFICATIONS: QualificationDef[] = [
  { id: 'aerial_operator', name: 'Aerial Operator', dept: 'fire', cost: 3000, hours: 8, unlockLevel: 2 },
  { id: 'tech_rescue', name: 'Technical Rescue', dept: 'fire', cost: 5000, hours: 16, unlockLevel: 3 },
  { id: 'hazmat_tech', name: 'Hazmat Technician', dept: 'fire', cost: 6000, hours: 16, unlockLevel: 5 },
  { id: 'traffic_enf', name: 'Traffic Enforcement', dept: 'police', cost: 2000, hours: 6, unlockLevel: 2 },
  { id: 'k9_handler', name: 'K-9 Handler', dept: 'police', cost: 5000, hours: 16, unlockLevel: 3 },
  { id: 'swat', name: 'SWAT', dept: 'police', cost: 8000, hours: 24, unlockLevel: 6 },
  { id: 'paramedic', name: 'Paramedic', dept: 'ems', cost: 4000, hours: 12, unlockLevel: 2 },
  { id: 'critical_care', name: 'Critical Care', dept: 'ems', cost: 7000, hours: 20, unlockLevel: 5 },
];

export const VEHICLE_TYPES: VehicleTypeDef[] = [
  // Fire
  { id: 'engine', dept: 'fire', name: 'Fire Engine', callsign: 'Engine', short: 'E', price: 25000, speedFactor: 1.15, minCrew: 3, maxCrew: 4, quals: [],
    caps: ['engine'], maintenancePerHour: 8, fuelPerKm: 1.2, turnoutSec: 60, unlockLevel: 1 },
  { id: 'ladder', dept: 'fire', name: 'Ladder Truck', callsign: 'Truck', short: 'T', price: 45000, speedFactor: 1.05, minCrew: 3, maxCrew: 4, quals: [{ qual: 'aerial_operator', count: 1 }],
    caps: ['ladder'], maintenancePerHour: 12, fuelPerKm: 1.6, turnoutSec: 70, unlockLevel: 2 },
  { id: 'heavy_rescue', dept: 'fire', name: 'Heavy Rescue', callsign: 'Rescue', short: 'R', price: 40000, speedFactor: 1.1, minCrew: 3, maxCrew: 5, quals: [{ qual: 'tech_rescue', count: 2 }],
    caps: ['rescue'], maintenancePerHour: 11, fuelPerKm: 1.4, turnoutSec: 70, unlockLevel: 3 },
  { id: 'hazmat', dept: 'fire', name: 'Hazmat Unit', callsign: 'Hazmat', short: 'HM', price: 50000, speedFactor: 1.0, minCrew: 2, maxCrew: 4, quals: [{ qual: 'hazmat_tech', count: 2 }],
    caps: ['hazmat'], maintenancePerHour: 12, fuelPerKm: 1.5, turnoutSec: 90, unlockLevel: 5 },
  // Police
  { id: 'patrol', dept: 'police', name: 'Patrol Car', callsign: 'Patrol', short: 'P', price: 8000, speedFactor: 1.35, minCrew: 1, maxCrew: 2, quals: [],
    caps: ['police'], maintenancePerHour: 3, fuelPerKm: 0.4, turnoutSec: 30, unlockLevel: 1 },
  { id: 'traffic', dept: 'police', name: 'Traffic Enforcement', callsign: 'Traffic', short: 'TE', price: 11000, speedFactor: 1.4, minCrew: 1, maxCrew: 1, quals: [{ qual: 'traffic_enf', count: 1 }],
    caps: ['police', 'traffic'], maintenancePerHour: 3, fuelPerKm: 0.45, turnoutSec: 30, unlockLevel: 2 },
  { id: 'k9', dept: 'police', name: 'K-9 Unit', callsign: 'K-9', short: 'K9', price: 15000, speedFactor: 1.35, minCrew: 1, maxCrew: 1, quals: [{ qual: 'k9_handler', count: 1 }],
    caps: ['police', 'k9'], maintenancePerHour: 4, fuelPerKm: 0.45, turnoutSec: 40, unlockLevel: 3 },
  { id: 'swat', dept: 'police', name: 'SWAT Vehicle', callsign: 'SWAT', short: 'SW', price: 40000, speedFactor: 1.1, minCrew: 4, maxCrew: 6, quals: [{ qual: 'swat', count: 4 }],
    caps: ['swat'], maintenancePerHour: 9, fuelPerKm: 1.0, turnoutSec: 120, unlockLevel: 6 },
  // EMS
  { id: 'bls', dept: 'ems', name: 'BLS Ambulance', callsign: 'Medic', short: 'M', price: 12000, speedFactor: 1.3, minCrew: 2, maxCrew: 2, quals: [],
    caps: ['ambulance'], maintenancePerHour: 4, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 1 },
  { id: 'als', dept: 'ems', name: 'ALS Ambulance', callsign: 'ALS', short: 'A', price: 18000, speedFactor: 1.3, minCrew: 2, maxCrew: 2, quals: [{ qual: 'paramedic', count: 1 }],
    caps: ['ambulance', 'als'], maintenancePerHour: 5, fuelPerKm: 0.6, turnoutSec: 45, unlockLevel: 2 },
  { id: 'ccu', dept: 'ems', name: 'Critical Care Unit', callsign: 'CCU', short: 'CC', price: 30000, speedFactor: 1.25, minCrew: 2, maxCrew: 3, quals: [{ qual: 'critical_care', count: 1 }, { qual: 'paramedic', count: 1 }],
    caps: ['ambulance', 'als', 'ccu'], maintenancePerHour: 7, fuelPerKm: 0.7, turnoutSec: 60, unlockLevel: 5 },
];

// Units each department starts with when its first station is placed.
export const STARTER_KITS: Record<string, { vehicles: string[]; staff: number }> = {
  fire: { vehicles: ['engine'], staff: 5 },
  police: { vehicles: ['patrol', 'patrol'], staff: 4 },
  ems: { vehicles: ['bls'], staff: 3 },
};

export const STARTING_MONEY = 100000;

export const dept = (id: string) => DEPARTMENTS.find(d => d.id === id)!;
export const stationType = (id: string) => STATION_TYPES.find(s => s.id === id)!;
export const vehicleType = (id: string) => VEHICLE_TYPES.find(v => v.id === id)!;
export const capability = (id: string) => CAPABILITIES.find(c => c.id === id)!;
export const qualification = (id: string) => QUALIFICATIONS.find(q => q.id === id)!;
export const stationTypeForDept = (d: string) => STATION_TYPES.find(s => s.dept === d)!;
