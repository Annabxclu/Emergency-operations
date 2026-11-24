// Headless test of the full gameplay loop with a fake road network.
import { Game, newGameState, missingRequirements, addEmsChief, xpForLevel, migrate } from '../src/engine/game';
import type { LatLng, RoutingProvider } from '../src/engine/types';
import { distanceM } from '../src/engine/geo';
import { vehicleType, VEHICLE_TYPES, QUALIFICATIONS } from '../src/data/departments';
import { INCIDENT_TYPES, incidentType } from '../src/data/incidents';
import { admissionFee } from '../src/data/hospitals';

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

Game.expansionChance = 0; // calls finish normally in tests (expansion is tested on its own)
(async () => {
  const g = new Game(newGameState(), fake);
  g.state.settings.runningCosts = true; // exercise the full economy
  const c = () => g.city;
  // Setup: place starter stations in required order.
  let threw = false;
  try { g.placeStation('police_precinct', [33.76, -84.39]); } catch { threw = true; }
  assert(threw, 'setup enforces fire station first');
  g.placeStation('fire_station', [33.755, -84.39]);
  g.placeStation('police_precinct', [33.77, -84.385]);
  g.placeStation('ems_station', [33.76, -84.37]);
  assert(g.setupDone, 'setup complete after three stations');
  assert(c().money === 0, 'new game starts at $0; starter stations are free');
  c().money = 200000; // test funds for the purchases below
  assert(c().vehicles.length === 4 && c().employees.length === 12, 'starter kit: 4 vehicles, 12 personnel');
  assert(c().vehicles.every(v => g.staffingProblem(v) === null), 'all starter vehicles staffed');

  // Build a second fire station and buy an engine.
  const st = g.placeStation('fire_station', [33.78, -84.40]);
  assert(c().money === 100000, 'fire station costs $100,000');
  assert(g.stationCapacity(st).bays === 1, 'a new station starts with 1 bay');
  const eng = g.buyVehicle('engine', st.id);
  assert(c().money === 95000, 'Type 1 engine costs $5,000');
  assert(g.stationStaff(st.id).length === 2 && g.staffingProblem(eng) === null, 'new fire station comes with 2 employees who crew the new engine');
  threw = false;
  try { g.buyVehicle('heavy_rescue', st.id); } catch { threw = true; }
  assert(threw, 'heavy rescue needs 4 fire stations');
  g.upgradeStation(st.id);
  assert(c().money === 85000 && g.stationCapacity(st).bays === 2, 'level 1 costs $10,000 and adds a bay');
  g.upgradeStation(st.id);
  assert(c().money === 35000 && g.stationCapacity(st).bays === 3, 'level 2 costs $50,000');
  assert(g.levelCost(3) === 100000 && g.levelCost(39) === 100000, 'levels 3+ cost $100,000');
  c().money = 100000;

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
  for (let i = 0; i < 120 && amb.status !== 'enroute'; i++) { g.tick(1); await flush(); }
  assert(amb.status === 'enroute' && amb.route && amb.route.coords.length === 3, 'en route on road geometry after turnout');
  const expect = amb.route!.distanceM / (55 * 0.44704) / g.state.settings.travelMult!;
  assert(Math.abs(amb.route!.durationS - expect) < 1, `fixed speed: ambulance at 55 mph × driving-speed setting (${Math.round(amb.route!.durationS)}s for ${Math.round(amb.route!.distanceM)}m)`);
  g.state.settings.travelModel = 'roads';
  assert(Math.abs(g.travelSeconds(vehicleType('bls'), 1000, 120) - 120 / 1.3 / g.state.settings.travelMult!) < 0.01, 'realistic option uses road time with lights & sirens factor');
  g.state.settings.travelModel = 'fixed';
  const p0 = amb.pos;
  g.tick(1);
  assert(distanceM(p0, amb.pos) > 1, 'vehicle position advances along route');
  await run(g, 3000);
  assert(c().resolved.some(i => i.id === inc!.id), 'incident resolved');
  const done = c().resolved.find(i => i.id === inc!.id)!;
  assert(done.outcome === 'successful', `outcome successful (${done.outcome})`);
  assert(amb.status === 'available', 'ambulance returned to station');
  assert(!c().finance.total.income['patient transport'], 'patient transport itself pays nothing (MissionChief style)');
  const rewards = c().finance.total.income['incident rewards'] || 0;
  assert(rewards > 0, `an EMS-only call pays its reward ($${rewards})`);
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
  const ignOpen = c().incidents.find(i => i.id === ign!.id);
  assert(ignOpen && !ignOpen.escalated && ignOpen.status === 'pending', 'no time limit: an ignored call waits (no escalation or failure)');
  g.abandon(ign!.id);

  // Missing-requirement matching.
  const miss = missingRequirements([{ cap: 'ambulance', count: 1 }, { cap: 'als', count: 1 }], []);
  assert(miss.length === 2, 'missingRequirements with no vehicles');
  assert(xpForLevel(2) > 0 && xpForLevel(3) > xpForLevel(2), 'xp curve increasing');

  // Hourly costs were posted.
  assert(!(c().finance.total.expense['payroll']), 'no payroll for staff');
  assert((c().finance.total.expense['station upkeep'] || 0) > 0, 'station upkeep charged when running costs are on');
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
  (g as any).deptRequirement = () => 0; (g as any).deptItemRequirement = () => 1; // unlock everything for these tests
  (g.city as any).money = 1e7;
  for (const d of ['emergency', 'public_works']) g.placeStation(d === 'emergency' ? 'eoc' : 'public_works_yard', [33.75, -84.38]);
  (g.city as any).money = 1e7;
  c().incidents.length = 0;
  for (let i = 0; i < 6; i++) g.placeStation('fire_station', [33.70 + i * 0.01, -84.45]);
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
  (g.city as any).money = 1e8;
  while (c().stations.filter(x => x.typeId === 'fire_station').length < 10) g.placeStation('fire_station', [33.68, -84.44]);
  const fireCount = c().stations.filter(x => x.typeId === 'fire_station').length;
  assert(fireCount >= 10, `have ${fireCount} fire stations`);
  g.buildExtension(fs.id, 'large');
  assert(g.stationCapacity(fs).bays === bays0 + 10, 'Large Station extension adds 10 bays');
  let threwL = false; try { g.buildExtension(c().stations.filter(x => x.typeId === 'fire_station')[1].id, 'large'); } catch { threwL = true; }
  assert(threwL === (fireCount < 20), 'only one Large Station per 10 fire stations');
  g.buildExtension(fs.id, 'ems_ext');
  const ambAtFire = g.buyVehicle('bls', fs.id);
  assert(ambAtFire.stationId === fs.id, 'Ambulance Extension lets a fire station house an ambulance');
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
  const offShift = (['A', 'B', 'C'] as const).find(x => x !== g.currentShift())!;
  g.crew(someEngine.id).forEach(e => (e.shift = offShift));
  assert(g.staffingProblem(someEngine) !== null, 'with shifts on, a single-shift crew is not enough');
  g.state.settings.shifts = false;

  // Call frequency and cap
  {
    const g3 = new Game(newGameState(), fake);
    g3.placeStation('fire_station', [33.755, -84.39]); g3.placeStation('police_precinct', [33.77, -84.385]); g3.placeStation('ems_station', [33.76, -84.37]);
    assert(g3.activeCap() === 2, 'cap with 1 station per department is 2');
    (g3.city as any).money = 1e7;
    for (let i = 0; i < 4; i++) g3.placeStation('fire_station', [33.7 + i * 0.01, -84.4]);
    g3.placeStation('police_precinct', [33.73, -84.36]);
    for (let i = 0; i < 3; i++) g3.placeStation('ems_station', [33.78 + i * 0.01, -84.35]);
    assert(g3.activeCap() === 6, '5 fire / 2 police / 4 EMS stations -> max 6 active calls');
    g3.state.settings.callIntervalMin = 0.5;
    g3.city.nextIncidentAt = g3.state.time;
    const times: number[] = [];
    for (let i = 0; i < 400; i++) { const n = g3.city.incidents.length; g3.tick(1); await flush(); if (g3.city.incidents.length > n) times.push(g3.state.time); }
    assert(times.length >= 5 && times.slice(1, 5).every((t, i) => Math.abs(t - times[i] - 30) <= 2), `30-second setting: calls every 30s (${times.length} in 400s)`);
    for (let i = 0; i < 600; i++) { g3.tick(1); if (i % 10 === 0) await flush(); }
    assert(g3.city.incidents.length <= 6, `active calls never exceed the cap (${g3.city.incidents.length})`);
  }

  // Daily login bonus: 1000 x day, up to 7, then back to day 1; once per calendar day.
  {
    const g4 = new Game(newGameState(), fake);
    const m0 = g4.city.money;
    const amounts: number[] = [];
    for (let d = 1; d <= 9; d++) amounts.push(g4.claimDailyBonus(`2026-11-${String(d).padStart(2, '0')}`));
    assert(amounts.join(',') === '1000,2000,3000,4000,5000,6000,7000,1000,2000', `daily bonus cycle ${amounts.join(', ')}`);
    assert(g4.city.money === m0 + 31000, 'bonuses credited');
    let threw = false; try { g4.claimDailyBonus('2026-11-09'); } catch { threw = true; }
    assert(threw && g4.dailyBonus('2026-11-09') === null, 'only one claim per day');
    // Simple economy: no running costs by default.
    g4.placeStation('fire_station', [33.755, -84.39]); g4.placeStation('police_precinct', [33.77, -84.385]); g4.placeStation('ems_station', [33.76, -84.37]);
    const m1 = g4.city.money;
    for (let i = 0; i < 3 * 3600; i += 30) { g4.tick(30); }
    assert(!(g4.city.finance.total.expense['payroll']) && g4.city.money >= m1, 'no payroll or upkeep with running costs off');
  }

  // Offline progress: everything keeps running except new calls.
  {
    const g5 = new Game(newGameState(), fake);
    g5.placeStation('fire_station', [33.755, -84.39]); g5.placeStation('police_precinct', [33.77, -84.385]); g5.placeStation('ems_station', [33.76, -84.37]);
    const call = await g5.spawnIncident('medical');
    g5.dispatch(call!.id, g5.recommend(call!.id).ids);
    const ignored = await g5.spawnIncident('theft');
    await flush();
    const r = g5.catchUp(3 * 3600);
    assert(g5.city.resolved.find(i => i.id === call!.id)?.outcome === 'successful', 'offline: dispatched call finished while away');
    assert(g5.city.incidents.some(i => i.id === ignored!.id), 'offline: unattended call still waiting');
    assert(r!.newCalls > 0 && g5.city.incidents.length > 1 && g5.city.incidents.length <= g5.activeCap(), `offline: new calls came in while away, up to the board limit (${r!.newCalls} new, ${g5.city.incidents.length} on the board)`);
    const fresh = g5.city.incidents.filter(i => i.id !== ignored!.id);
    assert(fresh.every(i => i.receivedAt < Date.now() - 60_000), 'offline: calls show the time they came in while you were away');
    assert(g5.city.vehicles.every(v => v.status === 'available'), 'offline: all units returned to their stations');
    assert(r!.calls === 1 && g5.state.time >= 8 * 3600 + 3 * 3600, `offline summary: ${r!.calls} calls, ${r!.successful} successful, money ${r!.money}`);
    g5.tick(g5.state.settings.callIntervalMin! * 60 + 1); await flush();
    assert(g5.city.incidents.length === 2, 'calls resume after returning');
  }

  // Follow-up: a busy unit goes straight to a queued call when its current one ends.
  {
    const g6 = new Game(newGameState(), fake);
    g6.placeStation('fire_station', [33.755, -84.39]); g6.placeStation('police_precinct', [33.77, -84.385]); g6.placeStation('ems_station', [33.76, -84.37]);
    const a = await g6.spawnIncident('suspicious');
    const b = await g6.spawnIncident('suspicious');
    const car = g6.city.vehicles.find(v => v.typeId === 'patrol')!;
    g6.dispatch(a!.id, [car.id]);
    assert(g6.followUpCandidates(b!.id).some(v => v.id === car.id), 'busy unit offered as a follow-up');
    g6.queueFollowUp(b!.id, [car.id]);
    let threw = false; try { g6.queueFollowUp(b!.id, [car.id]); } catch { threw = true; }
    assert(threw && !g6.followUpCandidates(b!.id).some(v => v.id === car.id), 'a unit can only be queued for one follow-up');
    let returnedHome = false, wentToB = false;
    for (let i = 0; i < 5000; i++) {
      g6.tick(1); if (i % 10 === 0) await flush();
      if (g6.city.resolved.some(x => x.id === a!.id) && !wentToB) {
        if (car.status === 'returning' || car.status === 'available') returnedHome = true;
        if (car.incidentId === b!.id) wentToB = true;
      }
      if (g6.city.resolved.some(x => x.id === b!.id)) break;
    }
    assert(wentToB && !returnedHome, 'after finishing call A the car drove straight to call B');
    assert(g6.city.resolved.find(x => x.id === b!.id)?.outcome === 'successful', 'follow-up call completed');
  }

  // Releasing a required unit pauses the work; sending one back resumes it.
  {
    const g7 = new Game(newGameState(), fake);
    g7.placeStation('fire_station', [33.755, -84.39]); g7.placeStation('police_precinct', [33.77, -84.385]); g7.placeStation('ems_station', [33.76, -84.37]);
    g7.state.settings.workMult = 1;
    const call = await g7.spawnIncident('fire_alarm');
    const medic = g7.city.vehicles.find(v => v.typeId === 'engine')!;
    g7.dispatch(call!.id, [medic.id]);
    for (let i = 0; i < 2000 && call!.status !== 'working'; i++) { g7.tick(1); if (i % 10 === 0) await flush(); }
    g7.tick(60);
    const leftBefore = call!.workUntil! - g7.state.time;
    g7.recall(medic.id);
    g7.tick(1);
    assert(call!.status !== 'working' && call!.workUntil == null, `work paused after the engine was released (status ${call!.status})`);
    g7.tick(600);
    assert(!g7.city.resolved.some(x => x.id === call!.id), 'call does not complete with no unit on scene');
    for (let i = 0; i < 3000 && medic.status !== 'available'; i++) { g7.tick(1); if (i % 10 === 0) await flush(); }
    g7.dispatch(call!.id, [medic.id]);
    for (let i = 0; i < 2000 && call!.status !== 'working'; i++) { g7.tick(1); if (i % 10 === 0) await flush(); }
    const leftAfter = call!.workUntil! - g7.state.time;
    assert(Math.abs(leftAfter - leftBefore) < 3, `work resumed with progress kept (${Math.round(leftBefore)}s -> ${Math.round(leftAfter)}s left)`);
  }

  // Patients: each ambulance treats one patient, then transports or releases them and takes the next.
  {
    const gp = new Game(newGameState(), fake);
    gp.placeStation('fire_station', [33.755, -84.39]); gp.placeStation('police_precinct', [33.77, -84.385]); gp.placeStation('ems_station', [33.76, -84.37]);
    const call = (await gp.spawnIncident('medical'))!;
    assert(call.patientList?.length === call.patients && call.patients > 0 && call.patientList.every(p => p.status === 'untreated'), 'patients appear as individual untreated patients');
    assert(!call.requirements.some(r => r.cap === 'ambulance') && gp.patientAmbulanceNeed(call) === call.patients, 'ambulances needed follow the untreated patients');
    const medic = gp.city.vehicles.find(v => v.typeId === 'bls')!;
    gp.dispatch(call.id, [medic.id]);
    let sawTreating = false;
    for (let i = 0; i < 3000 && !gp.city.resolved.some(x => x.id === call.id); i++) { gp.tick(1); if (call.patientList!.some(p => p.status === 'treating')) sawTreating = true; if (i % 10 === 0) await flush(); }
    assert(sawTreating, 'the ambulance treats a patient on scene');
    assert(gp.city.resolved.some(x => x.id === call.id), 'a one-patient call completes once its patient is treated');
    assert(call.patientList!.every(p => p.status === 'transport' || p.status === 'released'), 'patient was taken to hospital or released');
  }

  // Units on scene with patients still waiting for an ambulance show as yellow (on scene, missing units).
  {
    const gy = new Game(newGameState(), fake);
    gy.placeStation('fire_station', [33.755, -84.39]); gy.placeStation('police_precinct', [33.77, -84.385]); gy.placeStation('ems_station', [33.76, -84.37]);
    let call: any = null;
    for (const t of INCIDENT_TYPES) {
      if (!(t.patients && t.patients[0] > 0)) continue;
      const c = await gy.spawnIncident(t.id);
      if (c && c.patientList?.length && c.requirements.length) { call = c; break; }
    }
    if (call) {
      const rec = gy.recommend(call.id).ids.filter((id: string) => !gy.isMedic(gy.vehicle(id)!));
      if (rec.length) {
        gy.dispatch(call.id, rec);
        for (let i = 0; i < 3000 && !gy.incidentVehicles(call.id).some(v => v.status === 'onscene'); i++) { gy.tick(1); if (i % 10 === 0) await flush(); }
        gy.tick(1);
        assert(gy.shownStatus(call) === 'onscene', `units on scene but patients waiting for an ambulance shows yellow (${gy.shownStatus(call)})`);
      }
    }
  }

  // Radio: calls, dispatches, arrivals, clears are logged for the Radio tab.
  {
    const gr = new Game(newGameState(), fake);
    gr.placeStation('fire_station', [33.755, -84.39]); gr.placeStation('police_precinct', [33.77, -84.385]); gr.placeStation('ems_station', [33.76, -84.37]);
    const call = await gr.spawnIncident('fire_alarm');
    if (call) {
      gr.dispatch(call.id, gr.recommend(call.id).ids);
      for (let i = 0; i < 4000 && gr.incident(call.id); i++) { gr.tick(1); if (i % 10 === 0) await flush(); }
      for (let i = 0; i < 4000 && gr.city.vehicles.some(v => v.status !== 'available'); i++) { gr.tick(1); if (i % 10 === 0) await flush(); }
      const kinds = new Set(gr.radioLog().map(m => m.kind));
      assert(['call', 'dispatch', 'onscene', 'done', 'clear', 'available'].every(k => kinds.has(k as any)), `radio logs the whole call (${[...kinds].join(',')})`);
      assert(gr.radioLog()[gr.radioLog().length - 1].text.startsWith('New call'), 'radio log is newest first');
    }
  }

  // Offline: patients keep being treated and transported while the app is closed.
  {
    const go = new Game(newGameState(), fake);
    go.placeStation('fire_station', [33.755, -84.39]); go.placeStation('police_precinct', [33.77, -84.385]); go.placeStation('ems_station', [33.76, -84.37]);
    let call: any = null;
    for (const t of INCIDENT_TYPES) {
      if (!(t.patients && t.patients[0] > 0) || t.requirements.some(r => !['ambulance', 'als'].includes(r.cap))) continue;
      const c = await go.spawnIncident(t.id);
      if (c && c.patientList?.length) { call = c; break; }
    }
    if (call) {
      const medic = go.city.vehicles.find(v => go.isMedic(v) && v.status === 'available')!;
      go.dispatch(call.id, [medic.id]);
      for (let i = 0; i < 3000 && !call.patientList.some((p: any) => p.status === 'treating'); i++) { go.tick(1); if (i % 10 === 0) await flush(); }
      assert(call.patientList.some((p: any) => p.status === 'treating'), 'ambulance starts treating before going offline');
      go.catchUp(2 * 3600);
      assert(call.patientList.every((p: any) => p.status === 'transport' || p.status === 'released'), 'patients finish treatment while offline');
      assert(call.status === 'resolved', 'the call completes while offline');
      assert(go.city.vehicles.every(v => v.status === 'available'), `ambulance transports and returns while offline (${go.city.vehicles.map(v => v.status).join(',')})`);
    }
  }

  // MissionChief expansions: a finished call can turn into a bigger one at the same address.
  {
    const gx = new Game(newGameState(), fake);
    gx.placeStation('fire_station', [33.755, -84.39]); gx.placeStation('police_precinct', [33.77, -84.385]); gx.placeStation('ems_station', [33.76, -84.37]);
    const car = INCIDENT_TYPES.find(t => t.name === 'Burning car' && !t.id.endsWith('_tow'))!;
    const opts = gx.expansionsFor(car.id).map(t => t.name);
    assert(opts.includes('Burning trailer') || opts.includes('Garage fire'), `Burning car can expand into ${opts.join(', ') || 'nothing'}`);
    const call = (await gx.spawnIncident(car.id))!;
    const before = gx.city.incidents.length, id = call.id, addr = call.address;
    const ok = (gx as any).maybeExpand(call, true);
    assert(ok && call.id === id && call.address === addr && call.expandedFrom === 'Burning car' && call.name !== 'Burning car', `the call itself turns into the bigger mission (${call.name}, was ${call.expandedFrom})`);
    assert(gx.city.incidents.length === before && call.status !== 'resolved' && call.workUntil == null, 'it stays on the board and has to be worked again');
    assert(gx.radioLog()[0].text.includes('expanded into'), 'the radio announces it');
    const owned = new Set(gx.eligibleTypes().map(t => t.id));
    assert(owned.has(call.typeId), 'only expands into missions you can get');
  }

  // Addresses: a map lookup corrects the street and shows the real town when a call is outside the city.
  {
    const ga = new Game(newGameState(), fake);
    ga.placeStation('fire_station', [33.755, -84.39]); ga.placeStation('police_precinct', [33.77, -84.385]); ga.placeStation('ems_station', [33.76, -84.37]);
    const a = (await ga.spawnIncident('fire_alarm'))!;
    ga.applyPlace(a.id, { number: '77', road: 'Grand Street', area: 'Downtown', city: 'Jersey City', state: 'NJ' });
    assert(a.address === '77 Grand Street' && a.district === 'Jersey City, NJ' && a.addrChecked, `call outside the city shows its real town (${a.address} · ${a.district})`);
    const b = (await ga.spawnIncident('fire_alarm'))!;
    ga.applyPlace(b.id, { road: 'Peachtree Street', area: 'Midtown', city: 'Atlanta', state: 'GA' });
    assert(b.address.endsWith(' Peachtree Street') && b.district === 'Midtown', `call inside the city shows its neighborhood (${b.address} · ${b.district})`);
  }

  // Alliance: shared hospitals, shared calls and joined calls.
  {
    const ga = new Game(newGameState(), fake);
    ga.placeStation('fire_station', [33.755, -84.39]); ga.placeStation('police_precinct', [33.77, -84.385]); ga.placeStation('ems_station', [33.76, -84.37]);
    ga.state.alliance = { id: 'ABC123', name: 'Test', me: 'me' };
    const admits: number[] = [];
    ga.alliance.hospitals = [{ key: 'ally:u2:h1', owner: 'u2', ownerName: 'Sam', hid: 'h1', name: 'Sam General', pos: [33.765, -84.38], freeBeds: 10, specialties: [], feePct: 30 }];
    ga.alliance.admit = (_h, count, cut, fee) => { admits.push(count, cut, fee); };
    let call: any = null;
    for (const t of INCIDENT_TYPES) {
      if (!(t.patients && t.patients[0] > 0) || t.requirements.some(r => !['ambulance', 'als'].includes(r.cap))) continue;
      const c = await ga.spawnIncident(t.id);
      if (c && c.patientList?.some((p: any) => p.needsTransport) && !c.specialty) { call = c; break; }
    }
    if (call) {
      ga.dispatch(call.id, ga.city.vehicles.filter(v => ga.isMedic(v)).map(v => v.id));
      for (let i = 0; i < 6000 && !admits.length; i++) { ga.tick(1); if (i % 10 === 0) await flush(); }
      assert(admits.length === 3 && admits[1] === Math.round(admits[2] * 0.3), `patients go to an alliance member's hospital; they get their 30% cut (${admits.join(',')})`);
      const income = ga.city.ledger.filter((l: any) => l.cat === 'hospital admissions').reduce((n: number, l: any) => n + l.amount, 0);
      assert(income === admits[2] - admits[1], `you keep the admission fee minus their cut ($${income})`);
    }
    // Shared call: members' units on scene count toward your call.
    const own = (await ga.spawnIncident('fire_alarm'))!;
    ga.shareIncident(own.id);
    assert(!!own.sharedId, 'a call can be shared with the alliance');
    ga.alliance.remote.set(own.id, own.requirements.flatMap(r => Array(r.count).fill(VEHICLE_TYPES.find(v => v.caps.includes(r.cap))!.id)));
    ga.tick(1);
    assert(own.status === 'working', `alliance units on scene start the work on your shared call (${own.status})`);
    // Joined call: your units help; you get paid only if you had units there.
    const sc: any = { id: 'call-x', owner: 'u2', ownerName: 'Sam', typeId: 'fire_alarm', name: 'Fire alarm', pos: [33.756, -84.389], address: '1 Main St', district: 'Downtown', requirements: [{ cap: 'engine', count: 2 }], reward: 900, status: 'open', helpers: {} };
    const m = ga.joinSharedCall(sc);
    assert(!!m.mirror && ga.city.incidents.includes(m), 'joining a shared call puts it on your board');
    const before = ga.city.money;
    ga.resolveMirror('call-x', true);
    assert(m.status === 'resolved' && ga.city.money === before, 'no pay if none of your units were on scene');
    const m2 = ga.joinSharedCall({ ...sc, id: 'call-y' });
    m2.mirror!.helped = true;
    const b2 = ga.city.money;
    ga.resolveMirror('call-y', true);
    assert(ga.city.money - b2 >= 900, `helpers get the full reward when the owner finishes (+$${ga.city.money - b2})`);
    // A member brings patients to your shared hospital.
    ga.city.money = 1_000_000;
    const h = ga.buildHospital([33.75, -84.39]);
    ga.setHospitalShare(h.id, 10);
    const freeBefore = ga.hospitalFreeBeds(h), mb = ga.city.money;
    ga.allianceAdmitted(h.id, 2, 150, 'Sam');
    assert(ga.hospitalFreeBeds(h) === freeBefore - 2 && ga.city.money === mb + 150, 'members\' patients fill your beds and you collect your cut');
  }

  // Large-scale disasters need the Disaster Response Center and set off related calls.
  {
    const gd = new Game(newGameState(), fake);
    gd.placeStation('fire_station', [33.755, -84.39]); gd.placeStation('police_precinct', [33.77, -84.385]); gd.placeStation('ems_station', [33.76, -84.37]);
    const ids = ['ice_storm', 'blizzard', 'mudslide', 'train_derailment', 'industrial_explosion', 'earthquake', 'hurricane', 'dam_failure', 'wildfire_evacuation'];
    for (const id of ids) assert(incidentType(id).requirements.some(r => r.cap === 'heavy_equipment' || r.cap === 'relief'), `${incidentType(id).name} needs the Disaster Response Center`);
    gd.city.incidents = [];
    const quake = await gd.spawnIncident('earthquake');
    const kids = gd.city.incidents.filter(i => i.parentId === quake?.id).length;
    assert(!!quake && kids >= 1, `an earthquake sets off related calls (${kids})`);
  }

  // Moving a station: costs 10% of the build price; parked vehicles move with it.
  {
    const gm = new Game(newGameState(), fake);
    gm.placeStation('fire_station', [33.755, -84.39]); gm.placeStation('police_precinct', [33.77, -84.385]); gm.placeStation('ems_station', [33.76, -84.37]);
    const st = gm.city.stations[0];
    gm.city.money = 1_000_000;
    const m0 = gm.city.money, cost = gm.moveCost('station', st.id);
    gm.moveStation(st.id, [33.74, -84.41], '1 New Street');
    const parked = gm.city.vehicles.filter(v => v.stationId === st.id && v.status === 'available');
    assert(st.pos[0] === 33.74 && st.address === '1 New Street' && gm.city.money === m0 - cost && cost > 0, `station moved for ${cost}`);
    assert(parked.length > 0 && parked.every(v => v.pos[0] === 33.74 && v.pos[1] === -84.41), 'parked vehicles moved with the station');
  }

  // A newly built fire station comes with 2 employees.
  {
    const gs = new Game(newGameState(), fake);
    gs.placeStation('fire_station', [33.755, -84.39]); gs.placeStation('police_precinct', [33.77, -84.385]); gs.placeStation('ems_station', [33.76, -84.37]);
    gs.city.money = 1_000_000;
    const fs = gs.placeStation('fire_station', [33.74, -84.40]);
    assert(gs.stationStaff(fs.id).length === 2, `new fire station starts with 2 employees (${gs.stationStaff(fs.id).length})`);
    const ps = gs.placeStation('police_precinct', [33.73, -84.41]);
    const es = gs.placeStation('ems_station', [33.72, -84.42]);
    assert(gs.stationStaff(ps.id).length === 2 && gs.stationStaff(es.id).length === 2, 'new police and EMS stations start with 2 employees too');
  }

  // Old saves: station levels convert to one-bay-per-level without losing capacity.
  {
    const old = JSON.parse(JSON.stringify(newGameState()));
    old.schema = 1;
    const cs = old.cities[old.activeCity];
    cs.stations.push({ id: 's1', typeId: 'police_precinct', dept: 'police', name: 'P', pos: [33.7, -84.4], level: 1 });
    const m = migrate(old);
    assert(m.cities[m.activeCity].stations[0].level === 4, 'old police level 2 (5 bays) becomes level 4 (5 bays)');
  }

  // Mission catalog: early game only offers calls you can actually staff.
  {
    const g8 = new Game(newGameState(), fake);
    g8.placeStation('fire_station', [33.755, -84.39]); g8.placeStation('police_precinct', [33.77, -84.385]); g8.placeStation('ems_station', [33.76, -84.37]);
    const el = g8.eligibleTypes();
    const special = ['arff', 'foam', 'investigator', 'crane', 'riot', 'tow', 'rotator', 'flood', 'fireboat', 'coastal', 'coast_heli', 'federal', 'boat', 'air_police', 'game_warden', 'police_boat', 'drone'];
    assert(el.length > 60 && el.every(t => t.requirements.every(r => !special.includes(r.cap))), `${el.length} calls available at the start, none needing specialist units`);
    const fs = g8.city.stations[0];
    (g8.city as any).money = 1e7;
    let threw = false; try { g8.buyVehicle('arff', fs.id); } catch { threw = true; }
    assert(threw, 'airport crash tender needs the Airport Extension');
    g8.upgradeStation(fs.id); g8.buildExtension(fs.id, 'airport_ext');
    g8.buyVehicle('arff', fs.id);
    assert(!el.some(t => t.requirements.some(r => r.cap === 'rescue')), 'no heavy-rescue calls before you own a heavy rescue');
    assert(g8.eligibleTypes().every(t => missingRequirements(t.requirements, g8.city.vehicles).length === 0), 'every offered call can be fully staffed from your own fleet');
    const airport = INCIDENT_TYPES.filter(t => t.requirements.some(r => r.cap === 'arff')).sort((a, b) => a.requirements.length - b.requirements.length)[0];
    for (const r of airport.requirements) {
      const vt = VEHICLE_TYPES.find(v => v.caps.includes(r.cap))!;
      const have = g8.city.vehicles.filter(v => vehicleType(v.typeId).caps.includes(r.cap)).length;
      for (let i = have; i < r.count; i++) g8.city.vehicles.push({ ...g8.city.vehicles[0], id: 'tv' + r.cap + i, typeId: vt.id });
    }
    while (g8.stationCount() < airport.unlockLevel) g8.placeStation('fire_station', [33.75 + g8.stationCount() * 0.003, -84.39]);
    assert(g8.eligibleTypes().some(t => t.id === airport.id), `owning every unit unlocks airport calls (${airport.name})`);
  }

  // Real per-mission requirements and one ambulance per patient.
  {
    const methane = INCIDENT_TYPES.find(t => t.name === 'Methane explosion')!;
    const need = (cap: string) => methane.requirements.find(r => r.cap === cap)?.count;
    assert(need('engine') === 10 && need('ladder') === 2 && need('foam') === 3 && need('air_unit') === 2, 'Methane explosion uses the real requirements');
    const cpr = INCIDENT_TYPES.find(t => t.name === 'Carbon monoxide leak (large)')!;
    let inc = null;
    for (let i = 0; i < 20 && !(inc && inc.patients > 1); i++) inc = await g.spawnIncident(cpr.id);
    const amb = g.patientAmbulanceNeed(inc!) + g.responding(inc!).filter(v => g.isMedic(v)).length;
    const owned = g.city.vehicles.filter(v => vehicleType(v.typeId).caps.includes('ambulance')).length;
    assert(amb === inc!.patients && inc!.patients <= Math.max(owned, 1), `one ambulance per patient, never more patients than ambulances you own, never more than you own (${owned} owned, (${inc!.patients} patients -> ${amb} ambulances)`);
  }

  // Spreadsheet vehicles: a double boat trailer counts as 2 boats, and trailers need a tow vehicle.
  {
    const mk = (typeId: string, id: string) => ({ ...g.city.vehicles[0], id, typeId, status: 'available' as const, incidentId: null, route: null, followUp: null });
    assert(missingRequirements([{ cap: 'boat', count: 2 }], [mk('boat_trailer', 'bt1')]).length === 0, 'double light boat trailer covers 2 boats');
    assert(missingRequirements([{ cap: 'k9', count: 8 }], [mk('k9_large_carrier', 'k1')]).length === 0, 'large K9 carrier counts as 8 dogs');
    assert(VEHICLE_TYPES.length >= 85 && ['police_supervisor', 'fbi_wagon', 'crew_cab_semi', 'lifeguard_rescue', 'arff_small'].every(id => VEHICLE_TYPES.some(v => v.id === id)), 'spreadsheet vehicles are in the game');
    const gt = new Game(JSON.parse(JSON.stringify(g.state)), fake);
    const st = gt.city.stations.find(s => s.dept === 'fire')!;
    const trailer = mk('tanker_trailer', 'tt1'); trailer.stationId = st.id; trailer.pos = [...st.pos] as any;
    gt.city.vehicles.push(trailer as any);
    const target = gt.city.incidents[0] ?? (await gt.spawnIncident('theft'))!;
    let msg = '';
    try { gt.dispatch(target.id, ['tt1']); } catch (e) { msg = String((e as Error).message); }
    assert(/towing vehicle/i.test(msg), `a trailer can't be sent without its towing vehicle (${msg})`);
  }

  // Recruiting: a free recruit every 24 real hours up to the wanted number; instant hire costs money.
  {
    const gr = new Game(JSON.parse(JSON.stringify(g.state)), fake);
    const st = gr.city.stations.find(s => s.dept === 'fire')!;
    const before = gr.stationStaff(st.id).length;
    gr.city.money = 1_000_000;
    while (gr.stationCapacity(st).staff < before + 3) gr.upgradeStation(st.id);
    gr.setHireTarget(st.id, before + 2);
    const t0 = Date.now();
    gr.processRecruiting(t0 + 1000);
    assert(gr.stationStaff(st.id).length === before, 'no free recruit before 24 hours have passed');
    gr.processRecruiting(t0 + 24 * 3600 * 1000 + 5000);
    assert(gr.stationStaff(st.id).length === before + 1, 'one free recruit after 24 hours');
    gr.processRecruiting(t0 + 5 * 24 * 3600 * 1000);
    assert(gr.stationStaff(st.id).length === before + 2 && !st.nextHireAt, 'recruiting stops at the wanted number');
    const m = gr.city.money;
    const e = gr.hireNow(st.id);
    assert(gr.city.money === m - 2500 && e.quals.length === 0, 'instant hire costs the fee and the recruit is untrained');
    // Transfer only within the same department
    const fire2 = gr.placeStation('fire_station', [33.76, -84.37]);
    gr.moveEmployee(e.id, fire2.id);
    assert(gr.employee(e.id)!.stationId === fire2.id, 'staff can transfer between fire stations');
    // Moving staff away restarts the 24-hour clock (it used to stay stopped forever).
    const st2 = gr.city.stations.find(s => s.dept === 'fire' && s.id !== fire2.id)!;
    const n2 = gr.stationStaff(st2.id).length;
    const t1 = Date.now();
    for (const v of gr.city.vehicles) if (v.stationId === st2.id) { v.status = 'available'; v.incidentId = null; v.followUp = null; }
    gr.moveEmployee(gr.stationStaff(st2.id)[0].id, fire2.id);
    gr.processRecruiting(t1);
    assert(!!st2.nextHireAt, 'after a transfer leaves a station short, the free-recruit clock starts again');
    gr.processRecruiting(t1 + 24 * 3600 * 1000 + 5000);
    assert(gr.stationStaff(st2.id).length === n2, 'the station gets its free recruit back after 24 hours');
    // A station you never set a target for recruits toward full capacity on its own.
    const fresh = gr.placeStation('fire_station', [33.74, -84.40]);
    fresh.hireTarget = undefined;
    const nf = gr.stationStaff(fresh.id).length;
    const t2 = Date.now();
    gr.processRecruiting(t2);
    gr.processRecruiting(t2 + 24 * 3600 * 1000 + 5000);
    assert(nf < gr.stationCapacity(fresh).staff ? gr.stationStaff(fresh.id).length === nf + 1 : true, `a new station gets a free recruit every 24 hours without setting anything (${nf} -> ${gr.stationStaff(fresh.id).length}, cap ${gr.stationCapacity(fresh).staff})`);
    const pol = gr.city.stations.find(s => s.dept === 'police')!;
    let threw = false; try { gr.moveEmployee(e.id, pol.id); } catch { threw = true; }
    assert(threw, 'fire staff cannot transfer to a police station');
    // Academy
    threw = false; try { gr.train(e.id, 'hazmat_tech'); } catch { threw = true; }
    assert(threw, 'fire training needs a Fire Academy');
    gr.buildAcademy('fire');
    gr.train(e.id, 'hazmat_tech');
    const left = gr.employee(e.id)!.training!.until - gr.state.time;
    assert(Math.abs(left - 3 * 86400) < 5, `HazMat course takes 3 days (${left}s)`);
  }

  // Missions that need trained personnel (MissionChief "personnel_educations").
  {
    const dam = INCIDENT_TYPES.find(t => t.name === 'Dam break')!;
    assert(dam.staff?.some(s => s.training === 'hotshot' && s.count === 10), 'Dam break needs 10 Hotshot-trained staff');
    const leak = INCIDENT_TYPES.find(t => t.staff?.some(s => s.training === 'hazmat'))!;
    const gs = new Game(JSON.parse(JSON.stringify(g.state)), fake);
    for (const e of gs.city.employees) e.quals = e.quals.filter(q => q !== 'hazmat_tech');
    assert(!gs.eligibleTypes().some(t => t.id === leak.id), 'a HazMat-staff mission stays locked without HazMat-trained people');
    assert(QUALIFICATIONS.every(q => q.cost === 0), 'all training is free');
  }

  // More than 10 ambulances needs an EMS Chief.
  {
    const reqs = addEmsChief([{ cap: 'ambulance', count: 11 }, { cap: 'engine', count: 2 }]);
    assert(reqs.some(r => r.cap === 'ems_supervisor' && r.count === 1), '11 ambulances -> EMS Chief required');
    assert(!addEmsChief([{ cap: 'ambulance', count: 10 }]).some(r => r.cap === 'ems_supervisor'), '10 ambulances -> no EMS Chief needed');
    assert(INCIDENT_TYPES.every(t => t.requirements.filter(r => r.cap === 'ambulance').reduce((n, r) => n + r.count, 0) <= 10 || t.requirements.some(r => r.cap === 'ems_supervisor')), 'every mission listing 11+ ambulances includes an EMS Chief');
  }

  // MissionChief-style hospitals: build, beds, specialties.
  {
    const gh = new Game(JSON.parse(JSON.stringify(g.state)), fake);
    gh.city.money = 1_000_000;
    const h = gh.buildHospital([33.75, -84.38], 'Test Hospital');
    assert(gh.city.money === 950_000 && gh.hospitalBeds(h) === 10 && gh.hospitalFreeBeds(h) === 10, 'hospital costs $50,000 and starts with 10 beds');
    gh.addHospitalBed(h.id);
    gh.addSpecialty(h.id, 'cardiology');
    assert(gh.hospitalBeds(h) === 11 && h.specialties.includes('cardiology'), 'beds and specialties can be added');
    assert(gh.hospitals().some(f => f.id === h.id && f.owned), 'owned hospital is on the map list');
    const pick = (spec?: string) => (gh as any).hospitalFor([33.751, -84.381], 1, spec);
    assert(pick('cardiology').id === h.id, 'a cardiology patient goes to your hospital with cardiology');
    assert(pick('neurology').id !== h.id, 'a neurology patient goes to the public hospital when yours lacks it');
    h.occupied = Array(11).fill(gh.state.time + 9999);
    assert(pick().id !== h.id, 'a full hospital sends patients elsewhere');
    assert(admissionFee() === 500 && admissionFee('internal') === 600 && admissionFee('cardiac_surgery') === 1500, 'admission pays $500 for general patients and more per specialty');
  }

  // A slow routing service must not hold units at the station.
  {
    const stuck: RoutingProvider = { route: () => new Promise(() => undefined), nearest: async p => ({ pos: p, name: 'Peachtree St NE' }) };
    const gs = new Game(JSON.parse(JSON.stringify(g.state)), stuck);
    const free = gs.city.vehicles.find(v => v.status === 'available' && vehicleType(v.typeId).caps.includes('police'))!;
    const target = gs.city.incidents[0] ?? (await gs.spawnIncident('theft'))!;
    const start = [...free.pos];
    gs.dispatch(target.id, [free.id]);
    for (let i = 0; i < 120 && free.status !== 'enroute'; i++) gs.tick(1);
    gs.tick(5);
    assert(free.status === 'enroute' && (free.pos[0] !== start[0] || free.pos[1] !== start[1]), 'units start driving even while the road route is still loading');
  }

  // Save round trip.
  const json = JSON.stringify(g.state);
  const g2 = new Game(JSON.parse(json), fake);
  assert(g2.city.stations.length === c().stations.length, 'state serializes and reloads');
  console.log(`\nAll engine tests passed. Route requests: ${routeCalls}. Money: $${c().money}. Level ${g.state.level}, XP ${g.state.xp}`);
})();
