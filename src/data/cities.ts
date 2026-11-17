import type { CityDef } from '../engine/types';

// Each city is self-contained data. Only Atlanta is playable in this prototype;
// the others show how unlocks will work once multi-city play is enabled.

export const CITIES: CityDef[] = [
  {
    id: 'atlanta', name: 'Atlanta', state: 'GA', prefix: 'ATL', playable: true, unlockLevel: 1, population: 510000,
    center: [33.7550, -84.3900], zoom: 13,
    bounds: [[33.62, -84.56], [33.90, -84.28]],
    districts: [
      { name: 'Downtown', center: [33.7550, -84.3900] },
      { name: 'Midtown', center: [33.7838, -84.3830] },
      { name: 'Buckhead', center: [33.8400, -84.3790] },
      { name: 'Old Fourth Ward', center: [33.7635, -84.3700] },
      { name: 'Inman Park', center: [33.7590, -84.3530] },
      { name: 'Virginia-Highland', center: [33.7810, -84.3560] },
      { name: 'West End', center: [33.7360, -84.4130] },
      { name: 'Grant Park', center: [33.7380, -84.3700] },
      { name: 'East Atlanta', center: [33.7400, -84.3410] },
      { name: 'Kirkwood', center: [33.7530, -84.3180] },
      { name: 'Little Five Points', center: [33.7650, -84.3490] },
      { name: 'Home Park', center: [33.7860, -84.4030] },
      { name: 'West Midtown', center: [33.7810, -84.4120] },
      { name: 'Vine City', center: [33.7560, -84.4110] },
      { name: 'Adair Park', center: [33.7270, -84.4100] },
      { name: 'Lakewood', center: [33.7030, -84.3860] },
      { name: 'Cabbagetown', center: [33.7500, -84.3620] },
      { name: 'Ansley Park', center: [33.7950, -84.3770] },
      { name: 'Morningside', center: [33.7960, -84.3540] },
      { name: 'Peoplestown', center: [33.7340, -84.3880] },
      { name: 'Atlantic Station', center: [33.7920, -84.3970] },
      { name: 'Bankhead', center: [33.7710, -84.4370] },
      { name: 'Ormewood Park', center: [33.7300, -84.3490] },
      { name: 'Collier Hills', center: [33.8100, -84.4100] },
      { name: 'Lindbergh', center: [33.8230, -84.3690] },
      { name: 'Druid Hills', center: [33.7800, -84.3270] },
    ],
  },
  { id: 'charlotte', name: 'Charlotte', state: 'NC', prefix: 'CLT', playable: false, unlockLevel: 5, population: 880000, center: [35.2271, -80.8431], zoom: 13, bounds: [[35.0, -81.0], [35.4, -80.6]], districts: [] },
  { id: 'nashville', name: 'Nashville', state: 'TN', prefix: 'BNA', playable: false, unlockLevel: 10, population: 690000, center: [36.1627, -86.7816], zoom: 13, bounds: [[36.0, -87.0], [36.35, -86.55]], districts: [] },
  { id: 'orlando', name: 'Orlando', state: 'FL', prefix: 'ORL', playable: false, unlockLevel: 15, population: 310000, center: [28.5384, -81.3789], zoom: 13, bounds: [[28.35, -81.55], [28.7, -81.2]], districts: [] },
  { id: 'dallas', name: 'Dallas', state: 'TX', prefix: 'DAL', playable: false, unlockLevel: 20, population: 1300000, center: [32.7767, -96.7970], zoom: 13, bounds: [[32.6, -97.0], [33.0, -96.55]], districts: [] },
];

export const city = (id: string) => CITIES.find(c => c.id === id)!;
