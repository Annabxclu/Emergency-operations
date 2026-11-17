import type { CityDef } from '../engine/types';

// Atlanta ships as a preset with hand-picked districts. Any other US city is
// generated at runtime from OpenStreetMap (see services/geocode.ts) and stored
// in the save as GameState.cityDefs.

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
];

export const city = (id: string) => CITIES.find(c => c.id === id)!;

/** Levels at which the player can run an additional city (first city is free). */
export const CITY_SLOT_LEVELS = [1, 5, 10, 15, 20];
