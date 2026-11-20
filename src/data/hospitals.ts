// MissionChief-style hospitals the player builds and owns.
export const HOSPITAL = {
  name: 'Hospital',
  cost: 50000,
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

/** Pick the specialty a call's patients need from what the call is about (none = general care). */
const SPECIALTY_KEYWORDS: [string, RegExp][] = [
  ['gynecology', /pregnan|giving birth|childbirth|\bbirth\b|\blabou?r\b|miscarri|obstetric|expectant mother/i],
  ['urology', /kidney|urinar|bladder|urolog/i],
  ['cardiac_surgery', /aortic|heart surgery/i],
  ['cardiology', /heart|cardiac|chest pain|\bcpr\b|palpitation/i],
  ['neurosurgery', /head (injury|trauma)|skull|spinal|spine|brain injury|fall from (a )?height/i],
  ['neurology', /(?<!heat ?)(?<!sun)stroke|seizure|unconscious|faint|dizz|headache|convuls|epilep/i],
  ['general_surgery', /stab|gunshot|shot\b|shooting|impal|appendic|abdominal|bleeding/i],
  ['internal', /poison|swallow|overdose|allerg|diabet|fever|sick|breath|asthma|inhal|hypotherm|heat ?stroke|dehydrat|vomit|food/i],
  ['traumatology', /\bhit\b|crash|accident|collision|\bfell\b|\bfall|fracture|broken|injur|struck|bitten|bite|assault|trapped|burn|cut\b|wound|mva|motorcycle|bike|biker/i],
];
export function specialtyForText(text: string): string | undefined {
  for (const [id, re] of SPECIALTY_KEYWORDS) if (re.test(text)) return id;
  return undefined;
}
