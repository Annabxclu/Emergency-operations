// MissionChief-style hospitals the player builds and owns.
export const HOSPITAL = {
  name: 'Hospital',
  cost: 200000,
  baseBeds: 10,
  maxExtraBeds: 20,       // up to 30 beds
  bedCost: 20000,
  stayHours: 2,           // how long an admitted patient keeps a bed (real hours)
  admissionFee: 150,      // income per patient admitted to your own hospital
};

export const SPECIALTIES = [
  { id: 'internal', name: 'General Internal', cost: 10000 },
  { id: 'general_surgery', name: 'General Surgeon', cost: 10000 },
  { id: 'gynecology', name: 'Gynecology', cost: 70000 },
  { id: 'urology', name: 'Urology', cost: 70000 },
  { id: 'traumatology', name: 'Traumatology', cost: 70000 },
  { id: 'neurology', name: 'Neurology', cost: 70000 },
  { id: 'neurosurgery', name: 'Neurosurgery', cost: 70000 },
  { id: 'cardiology', name: 'Cardiology', cost: 70000 },
  { id: 'cardiac_surgery', name: 'Cardiac Surgery', cost: 70000 },
];
export const specialty = (id: string) => SPECIALTIES.find(s => s.id === id) ?? { id, name: id, cost: 0 };

/** Which specialist care a call's patients may need, by call category (about half need one). */
export const SPECIALTY_BY_CATEGORY: Record<string, string[]> = {
  fire: ['traumatology', 'general_surgery', 'internal'],
  ems: ['internal', 'cardiology', 'neurology', 'gynecology', 'urology'],
  rescue: ['traumatology', 'neurosurgery', 'general_surgery'],
  police: ['general_surgery', 'traumatology'],
  hazmat: ['internal'],
  water: ['internal', 'traumatology'],
  disaster: ['traumatology', 'neurosurgery', 'cardiac_surgery'],
  public_works: ['traumatology'],
  children: ['internal', 'traumatology'],
};
