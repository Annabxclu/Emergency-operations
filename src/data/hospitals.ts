// MissionChief-style hospitals the player builds and owns.
export const HOSPITAL = {
  name: 'Hospital',
  cost: 200000,
  baseBeds: 10,
  maxExtraBeds: 20,       // up to 30 beds
  bedCost: 20000,
  stayHours: 1,           // how long an admitted patient keeps a bed (real hours)
  admissionFee: 500,      // per general patient (no specialty) admitted to your own hospital; specialties pay their own fee below
};

export const SPECIALTIES = [
  { id: 'internal', name: 'General Internal', cost: 10000, fee: 600 },
  { id: 'general_surgery', name: 'General Surgeon', cost: 10000, fee: 700 },
  { id: 'gynecology', name: 'Gynecology', cost: 70000, fee: 900 },
  { id: 'urology', name: 'Urology', cost: 70000, fee: 900 },
  { id: 'traumatology', name: 'Traumatology', cost: 70000, fee: 1000 },
  { id: 'neurology', name: 'Neurology', cost: 70000, fee: 1100 },
  { id: 'cardiology', name: 'Cardiology', cost: 70000, fee: 1200 },
  { id: 'neurosurgery', name: 'Neurosurgery', cost: 70000, fee: 1400 },
  { id: 'cardiac_surgery', name: 'Cardiac Surgery', cost: 70000, fee: 1500 },
];
export const specialty = (id: string) => SPECIALTIES.find(s => s.id === id) ?? { id, name: id, cost: 0, fee: HOSPITAL.admissionFee };
/** What one admitted patient earns your hospital. */
export const admissionFee = (spec?: string) => (spec ? specialty(spec).fee : HOSPITAL.admissionFee);

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
