import type { IncidentTypeDef } from '../engine/types';

// Fictional call types. Requirements are expressed as capabilities, so any
// vehicle that provides the capability can fill the slot.

const R = (cap: string, count = 1) => ({ cap, count });

export const INCIDENT_TYPES: IncidentTypeDef[] = [
  // ---- Fire
  { id: 'fire_alarm', name: 'Fire Alarm', category: 'fire', severity: 1, unlockLevel: 1, weight: 10,
    descriptions: ['Automatic alarm activation at an office building.', 'Smoke detector sounding in an apartment hallway.', 'Commercial alarm panel reporting a zone fault.'],
    requirements: [R('engine')], escalation: [R('engine')], deadlineMin: 12, workMin: [4, 8], reward: 600, xp: 10 },
  { id: 'vehicle_fire', name: 'Vehicle Fire', category: 'fire', severity: 1, unlockLevel: 1, weight: 8,
    descriptions: ['Car engine compartment on fire in a parking lot.', 'Delivery van smoking heavily on the shoulder.', 'Vehicle fully involved on a side street.'],
    requirements: [R('engine')], escalation: [R('engine'), R('police')], deadlineMin: 12, workMin: [8, 15], reward: 900, xp: 14 },
  { id: 'outdoor_fire', name: 'Outdoor Fire', category: 'fire', severity: 1, unlockLevel: 1, weight: 6,
    descriptions: ['Dumpster fire behind a restaurant.', 'Brush fire spreading along a rail embankment.', 'Trash fire near a vacant lot.'],
    requirements: [R('engine')], escalation: [R('engine')], deadlineMin: 14, workMin: [6, 12], reward: 550, xp: 10 },
  { id: 'kitchen_fire', name: 'Residential Kitchen Fire', category: 'fire', severity: 2, unlockLevel: 1, weight: 6,
    descriptions: ['Grease fire spreading to cabinets; occupants evacuated.', 'Smoke showing from a single-family home kitchen.'],
    requirements: [R('engine'), R('police')], escalation: [R('engine'), R('ambulance')], deadlineMin: 11, workMin: [12, 20], reward: 1500, xp: 24 },
  { id: 'structure_fire', name: 'Structure Fire', category: 'fire', severity: 3, unlockLevel: 2, weight: 5,
    descriptions: ['Two-story home with flames showing from the second floor.', 'Apartment unit fire with smoke spreading to adjacent units.'],
    requirements: [R('engine', 2), R('ladder'), R('ambulance'), R('police')], escalation: [R('engine')], deadlineMin: 14, workMin: [25, 40], reward: 5200, xp: 70 },
  { id: 'commercial_fire', name: 'Commercial Building Fire', category: 'fire', severity: 3, unlockLevel: 4, weight: 3,
    descriptions: ['Warehouse fire with heavy smoke visible for miles.', 'Strip-mall fire spreading between storefronts.'],
    requirements: [R('engine', 3), R('ladder'), R('rescue'), R('ambulance'), R('police', 2)], escalation: [R('engine'), R('ladder')], deadlineMin: 16, workMin: [35, 55], reward: 11000, xp: 130 },

  // ---- Police
  { id: 'theft', name: 'Theft', category: 'police', severity: 1, unlockLevel: 1, weight: 9,
    descriptions: ['Shoplifter detained by store security.', 'Bicycle stolen from a rack; caller has a description.', 'Package theft reported by a resident.'],
    requirements: [R('police')], escalation: [R('police')], deadlineMin: 15, workMin: [6, 12], reward: 450, xp: 8 },
  { id: 'burglary', name: 'Burglary', category: 'police', severity: 2, unlockLevel: 1, weight: 7,
    descriptions: ['Resident returned home to find a door forced open.', 'Alarm company reports a break-in at a closed business.'],
    requirements: [R('police')], escalation: [R('police')], deadlineMin: 12, workMin: [10, 18], reward: 800, xp: 14 },
  { id: 'suspicious', name: 'Suspicious Activity', category: 'police', severity: 1, unlockLevel: 1, weight: 8,
    descriptions: ['Person checking car door handles in a parking deck.', 'Unknown vehicle idling outside a school after hours.'],
    requirements: [R('police')], escalation: [R('police')], deadlineMin: 15, workMin: [5, 10], reward: 400, xp: 8 },
  { id: 'disturbance', name: 'Public Disturbance', category: 'police', severity: 2, unlockLevel: 1, weight: 6,
    descriptions: ['Large argument spilling into the street outside a bar.', 'Crowd gathering after a dispute at a gas station.'],
    requirements: [R('police', 2)], escalation: [R('police'), R('ambulance')], deadlineMin: 12, workMin: [10, 18], reward: 1000, xp: 16 },
  { id: 'traffic_collision', name: 'Traffic Collision', category: 'police', severity: 1, unlockLevel: 1, weight: 9,
    descriptions: ['Two-car collision blocking a lane; no injuries reported.', 'Rear-end crash at an intersection.'],
    requirements: [R('police')], escalation: [R('police'), R('ambulance')], deadlineMin: 14, workMin: [8, 15], reward: 600, xp: 10 },
  { id: 'traffic_hazard', name: 'Traffic Signal Outage', category: 'police', severity: 1, unlockLevel: 2, weight: 4,
    descriptions: ['Signals dark at a busy intersection during rush hour.'],
    requirements: [R('traffic')], escalation: [R('police')], deadlineMin: 15, workMin: [15, 25], reward: 900, xp: 14 },
  { id: 'k9_track', name: 'Fleeing Suspect', category: 'police', severity: 2, unlockLevel: 3, weight: 3,
    descriptions: ['Suspect fled on foot into a wooded area after a break-in.'],
    requirements: [R('police'), R('k9')], escalation: [R('police')], deadlineMin: 12, workMin: [15, 25], reward: 2200, xp: 34 },
  { id: 'barricade', name: 'Barricaded Subject', category: 'police', severity: 3, unlockLevel: 6, weight: 2,
    descriptions: ['Armed subject barricaded inside a residence; perimeter needed.'],
    requirements: [R('swat'), R('police', 3), R('ambulance')], escalation: [R('police')], deadlineMin: 18, workMin: [40, 60], reward: 9000, xp: 120 },

  // ---- EMS
  { id: 'medical', name: 'Medical Emergency', category: 'ems', severity: 1, unlockLevel: 1, weight: 12,
    descriptions: ['Adult with difficulty breathing.', 'Diabetic patient, confused and sweating.', 'Elderly resident fell and cannot get up.'],
    requirements: [R('ambulance')], escalation: [R('engine')], deadlineMin: 11, workMin: [10, 18], reward: 700, xp: 12 },
  { id: 'cardiac_arrest', name: 'Cardiac Arrest', category: 'ems', severity: 3, unlockLevel: 2, weight: 4,
    descriptions: ['Unresponsive male, CPR in progress by bystander.', 'Collapsed patient at a gym, not breathing.'],
    requirements: [R('als'), R('engine')], escalation: [R('ambulance')], deadlineMin: 8, workMin: [15, 25], reward: 2400, xp: 40 },
  { id: 'mva_injuries', name: 'Traffic Accident with Injuries', category: 'ems', severity: 2, unlockLevel: 1, weight: 6,
    descriptions: ['Multi-vehicle crash with two patients complaining of neck pain.', 'Motorcycle down, rider conscious with a leg injury.'],
    requirements: [R('ambulance'), R('police')], escalation: [R('ambulance'), R('engine')], deadlineMin: 11, workMin: [15, 25], reward: 1600, xp: 26 },
  { id: 'workplace_injury', name: 'Workplace Injury', category: 'ems', severity: 1, unlockLevel: 1, weight: 5,
    descriptions: ['Worker fell from a ladder at a construction site.', 'Hand injury from machinery at a warehouse.'],
    requirements: [R('ambulance')], escalation: [R('engine')], deadlineMin: 12, workMin: [12, 20], reward: 800, xp: 14 },
  { id: 'critical_transfer', name: 'Critical Patient Transfer', category: 'ems', severity: 2, unlockLevel: 5, weight: 2,
    descriptions: ['Ventilated patient needs transfer to a trauma center.'],
    requirements: [R('ccu')], escalation: [R('als')], deadlineMin: 20, workMin: [20, 30], reward: 3500, xp: 50 },

  // ---- Rescue
  { id: 'entrapment', name: 'Vehicle Entrapment', category: 'rescue', severity: 3, unlockLevel: 3, weight: 3,
    descriptions: ['Driver pinned after a car struck a utility pole.', 'Rollover with occupant trapped inside.'],
    requirements: [R('rescue'), R('engine'), R('ambulance'), R('police')], escalation: [R('ambulance')], deadlineMin: 12, workMin: [20, 35], reward: 4800, xp: 70 },
  { id: 'water_rescue', name: 'Water Rescue', category: 'rescue', severity: 3, unlockLevel: 4, weight: 2,
    descriptions: ['Person in distress in a fast-moving creek after heavy rain.', 'Car stalled in rising floodwater with a driver inside.'],
    requirements: [R('rescue'), R('engine'), R('ambulance')], escalation: [R('engine')], deadlineMin: 12, workMin: [20, 35], reward: 5000, xp: 75 },
  { id: 'tech_rescue', name: 'Technical Rescue', category: 'rescue', severity: 3, unlockLevel: 4, weight: 2,
    descriptions: ['Worker trapped in a trench collapse.', 'Window washer stranded on a stalled rig.'],
    requirements: [R('rescue'), R('ladder'), R('ambulance')], escalation: [R('engine')], deadlineMin: 14, workMin: [30, 45], reward: 6000, xp: 85 },

  // ---- Hazmat
  { id: 'gas_leak', name: 'Gas Leak', category: 'hazmat', severity: 2, unlockLevel: 1, weight: 5,
    descriptions: ['Strong odor of natural gas in a residential street.', 'Contractor struck a gas line while digging.'],
    requirements: [R('engine'), R('police')], escalation: [R('engine')], deadlineMin: 12, workMin: [12, 22], reward: 1300, xp: 22 },
  { id: 'chemical_spill', name: 'Chemical Spill', category: 'hazmat', severity: 3, unlockLevel: 5, weight: 2,
    descriptions: ['Overturned truck leaking an unknown liquid.', 'Chemical drums leaking at an industrial site.'],
    requirements: [R('hazmat'), R('engine'), R('police')], escalation: [R('engine'), R('ambulance')], deadlineMin: 15, workMin: [30, 50], reward: 7000, xp: 95 },
];

export const incidentType = (id: string) => INCIDENT_TYPES.find(t => t.id === id)!;

export const CATEGORY_DEPT: Record<string, string> = { fire: 'fire', police: 'police', ems: 'ems', rescue: 'fire', hazmat: 'fire' };
