// Headless test of the full gameplay loop with a fake road network.
import { Game, newGameState, missingRequirements, xpForLevel } from '../src/engine/game';
import type { LatLng, RoutingProvider } from '../src/engine/types';
import { distanceM } from '../src/engine/geo';
import { vehicleType } from '../src/data/departments';

let routeCalls = 0;
const fake: RoutingProvider = {
  async route(a: LatLng, b: LatLng) {
    routeCalls++;
    const mid: LatLng = [a[0], b[1]]; // L-shaped "road" path, never a straight line
    const d = distanceM(a, mid) + distanceM(mid, b);
    return { coords: [a, mid, b], distanceM: d, durationS: d / 13, approximate: false };
  },
  async nearest(p: LatLng) { return { pos: p, name: 'Peachtree St NE' }; },
};

const assert = (c: unknown, m: string) => { if (!c) { console.error('FAIL:', m); process.exit(1); } else console.log('ok -', m); };
const flush = () => new Promise(r => setTimeout(r, 0));
async function run(g: Game, seconds: number, step = 1) {
  for (let t = 0; t < seconds; t += step) { g.tick(step); if (t % 20 === 0) await flush(); }
  await flush();
}

(async () => {
  const g = new Game(newGameState(), fake);
  const c = () => g.city;
  // Setup: place starter stations in required order.
  let threw = false;
  try { g.placeStation('police_precinct', [33.76, -84.39]); } catch { threw = true; }
  assert(threw, 'setup enforces fire station first');
  g.placeStation('fire_station', [33.755, -84.39]);
  g.placeStation('police_precinct', [33.77, -84.385]);
  g.placeStation('ems_station', [33.76, -84.37]);
  assert(g.setupDone, 'setup complete after three stations');
  assert(c().money === 100000, 'starter stations are free; $100,000 remains');
  assert(c().vehicles.length === 4 && c().employees.length === 12, 'starter kit: 4 vehicles, 12 personnel');
  assert(c().vehicles.every(v => g.staffingProblem(v) === null), 'all starter vehicles staffed');

  // Build a second fire station and buy an engine.
  const st = g.placeStation('fire_station', [33.78, -84.40]);
  assert(c().money === 40000, 'fire station costs $60,000');
  const eng = g.buyVehicle('engine', st.id);
  assert(c().money === 15000, 'engine costs $25,000');
  assert(g.staffingProblem(eng) !== null, 'new engine with no staff is unstaffed');
  threw = false;
  try { g.buyVehicle('ladder', st.id); } catch { threw = true; }
  assert(threw, 'ladder locked at level 1');

  // Hire crew for it.
  for (let i = 0; i < 3; i++) g.hire(st.id, g.candidates(st.id)[0]);
  assert(g.staffingProblem(eng) === null, 'hired crew auto-assigned to the engine');

  // Spawn a medical call and dispatch recommended units.
  const inc = await g.spawnIncident('medical');
  assert(inc && inc.address.includes('Peachtree'), 'incident has a street address');
  const rec = g.recommend(inc!.id);
  assert(rec.ids.length === 1 && g.vehicle(rec.ids[0])!.typeId === 'bls', 'recommends the ambulance');
  const moneyBefore = c().money;
  g.dispatch(inc!.id, rec.ids);
  const amb = g.vehicle(rec.ids[0])!;
  assert(amb.status === 'dispatched', 'ambulance dispatched (turnout)');
  await run(g, 50);
  assert(amb.status === 'enroute' && amb.route && amb.route.coords.length === 3, 'en route on road geometry after turnout');
  const expect = amb.route!.distanceM / (55 * 0.44704);
  assert(Math.abs(amb.route!.durationS - expect) < 1, `Mission Chief-style fixed speed: ambulance at 55 mph (${Math.round(amb.route!.durationS)}s for ${Math.round(amb.route!.distanceM)}m)`);
  g.state.settings.travelModel = 'roads';
  assert(Math.abs(g.travelSeconds(vehicleType('bls'), 1000, 120) - 120 / 1.3) < 0.01, 'realistic option uses road time with lights & sirens factor');
  g.state.settings.travelModel = 'fixed';
  const p0 = amb.pos;
  await run(g, 5);
  assert(distanceM(p0, amb.pos) > 1, 'vehicle position advances along route');
  await run(g, 3000);
  assert(c().resolved.some(i => i.id === inc!.id), 'incident resolved');
  const done = c().resolved.find(i => i.id === inc!.id)!;
  assert(done.outcome === 'successful', `outcome successful (${done.outcome})`);
  assert(amb.status === 'available', 'ambulance returned to station');
  assert((c().finance.total.income['patient transport'] || 0) > 0, `patient transported to hospital (fee $${c().finance.total.income['patient transport']})`);
  assert(g.state.xp > 0, 'earned XP');
  const rewards = c().finance.total.income['incident rewards'] || 0;
  assert(rewards > 0, `earned reward $${rewards}`);
  void moneyBefore;

  // Multi-department call needing units the player can supply.
  const big = await g.spawnIncident('mva_injuries');
  const rec2 = g.recommend(big!.id);
  assert(rec2.ids.length === 2 && rec2.unfilled.length === 0, 'multi-department recommendation (ambulance + police)');
  g.dispatch(big!.id, rec2.ids);
  await run(g, 4000);
  assert(c().resolved.find(i => i.id === big!.id)?.outcome === 'successful', 'multi-department call successful');

  // Ignored call escalates then fails, but does not bankrupt.
  const ign = await g.spawnIncident('theft');
  await run(g, 60 * 60);
  const ignDone = c().resolved.find(i => i.id === ign!.id);
  assert(ignDone && ignDone.escalated && ignDone.outcome === 'failed', 'ignored call escalated then failed');

  // Missing-requirement matching.
  const miss = missingRequirements([{ cap: 'ambulance', count: 1 }, { cap: 'als', count: 1 }], []);
  assert(miss.length === 2, 'missingRequirements with no vehicles');
  assert(xpForLevel(2) > 0 && xpForLevel(3) > xpForLevel(2), 'xp curve increasing');

  // Hourly costs were posted.
  assert((c().finance.total.expense['payroll'] || 0) > 0, 'payroll charged');
  assert((c().finance.total.income['city contract'] || 0) > 0, 'city contract income paid');
  assert((c().finance.total.expense['fuel'] || 0) > 0, 'fuel charged');

  // Prisoner transport: burglary with a forced suspect.
  const burg = await g.spawnIncident('impaired_driver');
  assert(burg!.prisoners === 1, 'impaired driver call has a suspect to transport');
  // No traffic unit at level 1: dispatch a patrol car manually.
  const patrol = c().vehicles.find(v => v.typeId === 'patrol' && !g.dispatchProblem(v))!;
  burg!.requirements = [{ cap: 'police', count: 1 }];
  g.dispatch(burg!.id, [patrol.id]);
  let sawTransport = false;
  for (let i = 0; i < 6000; i++) { g.tick(1); if (patrol.status === 'transporting') sawTransport = true; if (i % 20 === 0) await flush(); }
  assert(sawTransport, 'patrol car transported the suspect to jail');
  assert((c().finance.total.income['prisoner transport'] || 0) > 0, 'prisoner transport fee paid');

  // Major event spawns child calls (force-unlock levels for the test).
  g.state.level = 12;
  (g.city as any).money = 1e7;
  for (const d of ['emergency', 'public_works']) g.placeStation(d === 'emergency' ? 'eoc' : 'public_works_yard', [33.75, -84.38]);
  (g.city as any).money = 1e7;
  const before = c().incidents.length;
  const storm = await g.spawnIncident('severe_storm');
  assert(storm && c().incidents.length - before >= 3, `major event created ${c().incidents.length - before - 1} related calls`);
  assert(c().incidents.filter(i => i.parentId === storm!.id).length >= 2, 'child calls linked to the event');

  // Helicopters fly straight.
  const air = g.placeStation('air_base', [33.80, -84.40]);
  for (let i = 0; i < 3; i++) g.hire(air.id, { ...g.candidates(air.id)[0], quals: ['pilot', 'flight_medic'] });
  const heli = g.buyVehicle('med_heli', air.id);
  assert(!g.staffingProblem(heli), 'medical helicopter crewed with pilot + flight medic');
  const trauma = await g.spawnIncident('remote_trauma');
  g.dispatch(trauma!.id, [heli.id]);
  assert(heli.route && heli.route.coords.length === 2 && !heli.route.approximate, 'helicopter flies a direct line, not a road route');

  // Batch 2: research, extensions, goals, agreements, auto-dispatch, shifts
  g.startResearch('cad');
  await run(g, 13 * 3600, 30);
  assert(g.state.research.done.includes('cad') && Math.abs(g.mod('turnout') - 0.85) < 1e-9, 'research completes and applies its modifier');
  const fs = c().stations.find(x => x.dept === 'fire')!;
  const bays0 = g.stationCapacity(fs).bays;
  g.buildExtension(fs.id, 'bays');
  assert(g.stationCapacity(fs).bays === bays0 + 2, 'bay extension adds 2 bays');
  assert(c().goals && c().goals!.list.length === 3, `3 daily goals: ${c().goals!.list.map(x => x.label).join('; ')}`);
  g.placeStation('fire_station', [33.70, -84.42]); g.placeStation('fire_station', [33.82, -84.36]);
  g.state.level = Math.max(g.state.level, 3);
  g.signAgreement('county_fire');
  const agBefore = c().finance.total.income['regional agreements'] || 0;
  await run(g, 2 * 3600, 30);
  assert((c().finance.total.income['regional agreements'] || 0) > agBefore, 'regional agreement pays hourly');
  g.state.settings.autoDispatch = 'all';
  c().incidents.length = 0;
  c().vehicles.forEach(v => { if (v.status !== 'available') { v.status = 'available'; v.incidentId = null; v.route = null; v.pos = g.station(v.stationId)!.pos; } });
  const auto = await g.spawnIncident('fire_alarm');
  for (let i = 0; i < 30; i++) g.tick(1);
  assert(g.incidentVehicles(auto!.id).length > 0, 'auto-dispatch sent units to a routine call');
  g.state.settings.autoDispatch = 'off';
  g.state.settings.shifts = true;
  const someEngine = c().vehicles.find(v => v.typeId === 'engine' && v.status === 'available')!;
  assert(g.staffingProblem(someEngine) !== null, 'with shifts on, a single-shift crew is not enough');
  g.state.settings.shifts = false;

  // Save round trip.
  const json = JSON.stringify(g.state);
  const g2 = new Game(JSON.parse(json), fake);
  assert(g2.city.stations.length === c().stations.length, 'state serializes and reloads');
  console.log(`\nAll engine tests passed. Route requests: ${routeCalls}. Money: $${c().money}. Level ${g.state.level}, XP ${g.state.xp}`);
})();
