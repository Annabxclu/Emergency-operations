# Emergency Operations

> **This page is the game's source code. To play, open: https://annabxclu.github.io/Emergency-operations/**
> (First time only: Settings → Pages → Branch `main`, folder `/docs` → Save, then wait 1–2 minutes.)

A map-based emergency services management game.
Atlanta map, real road routing, fire / police / EMS, dispatch, finances, saves.

## Play it on your iPhone

**Live:** https://annabxclu.github.io/Emergency-operations/ (GitHub Pages serves the `docs/` folder on `main`). After changing code, run `npm run build:pages` and commit `docs/`.

The `dist/` folder is the finished app. It needs to be served over HTTPS (any static host):

- **Netlify Drop** (easiest, from a computer): go to app.netlify.com/drop and drag the `dist` folder in. You get an https link.
- **GitHub Pages**: put the contents of `dist/` in a repo, then Settings → Pages → deploy from branch.
- **Local test on a computer**: `cd dist && python3 -m http.server 8000`, open http://localhost:8000.

On the iPhone, open the link in Safari → Share → **Add to Home Screen**. It then opens full-screen like an app.
Progress saves automatically on the device (IndexedDB). Use Settings → Export backup to keep a copy.

## How to play

1. On first launch, enter a city and choose its state (later games: Settings → Start new game). The game then always reopens straight into your city. Tap the map to place your first Fire Station, Police Precinct and EMS Station (free, already staffed and equipped).
2. Calls appear on the map and in **Dispatch**. Open one: recommended units are pre-checked; adjust and press **Dispatch**.
3. Units turn out, then drive along real roads. When all required units are on scene the crew works the call, then you get paid and earn XP.
4. Spend money in **Stations**: build more stations anywhere, buy vehicles, hire staff, upgrade buildings.
5. Control time with ⏸ / 1× / 4× / 8×. Nothing happens while the app is closed or paused.

Call outcomes: **Successful** (all units before the deadline, bonus if fast), **Delayed** (late),
**Escalated** (ignored → bigger, then handled), **Partial** (worked with missing units), **Failed** (small fine).

More systems:
- **Transport:** patients go to real hospitals, suspects to jail; each trip pays a fee.
- **9 departments** (Fire, Police, EMS, Public Works, Water Rescue, Air Support, Special Ops, Emergency Management, Disaster Response), 31 vehicle types, 73 call types including major events that spawn related calls.
- **Research** (Settings → Research), **station extensions**, **daily goals** (Dispatch tab), **regional agreements** (Finances).
- **Options** (Settings → Gameplay): alert sounds, auto-dispatch, realistic A/B/C shifts.

Extra cities: at levels 5, 10, 15 and 20 you can add another city (Settings → Cities), each with its own
stations, staff, calls and budget. Settings → Missions lists every call type with its requirements.

## Project layout

```
src/
  data/        departments, stations, vehicles, qualifications, incidents, cities  ← all content is data
  engine/      game.ts (simulation & rules, no UI), geo.ts, types.ts
  services/    routing.ts (OSRM client: queue, cache, fallback), storage.ts (IndexedDB, export/import)
  ui/          React components: App, MapView (Leaflet), panels/*
public/        index.html, styles.css, manifest, service worker, icons
tests/         engine.test.ts (headless loop), e2e.py (browser test with mocked map/routing)
```

Build: `npm install`, then `npm run build` (→ `dist/`) or `npm run build:pages` (→ `docs/`). Type-check: `tsc -p .`. In a normal setup run
`npm i react react-dom esbuild && npm i -D typescript @types/react @types/react-dom` and
replace `src/types/react-shim.d.ts` with the real React types.

Adding content: a new incident type, vehicle or department is a new entry in `src/data/*`.
Multiple cities: state is already keyed per city (`GameState.cities`) with its own money,
stations, vehicles, staff, incidents and finances; `src/data/cities.ts` lists the planned unlocks.

## Services and limits

- **Map tiles**: OpenStreetMap standard (default) or Humanitarian OSM (lighter) — both keyless; switch in Settings. Attribution is shown on the map.
- **City search**: OpenStreetMap Nominatim (search) and Overpass (neighborhood names) — keyless, used once per new city.
- **Routing**: the public OSRM demo server, limited to ~1 request/second and meant for light use. The game queues and caches
  requests. If routing fails it falls back to an approximate direct path (drawn dashed) and tells you. For heavy play,
  set your own OSRM server URL in Settings.
- **Leaflet** loads from unpkg.com; the service worker caches it after first launch.
