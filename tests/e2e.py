"""End-to-end test of the playable loop in headless Chrome at iPhone size.

The sandbox has no internet, so Leaflet is replaced by tests/leaflet-stub.js,
OSRM responses are mocked (stair-stepped "road" geometry), and tiles are blank.
Everything else is the real built app from dist/.
"""
import json, math, os, random, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tests', 'shots')
os.makedirs(OUT, exist_ok=True)
STUB = open(os.path.join(ROOT, 'tests', 'leaflet-stub.js')).read()
STREETS = ['Peachtree St NE', 'Ponce de Leon Ave NE', 'North Ave NW', 'Spring St NW', 'Edgewood Ave SE', 'Boulevard NE', 'Juniper St NE']
route_calls = {'route': 0, 'nearest': 0}

def hav(a, b):
    R = 6371000
    dlat = math.radians(b[0] - a[0]); dlng = math.radians(b[1] - a[1])
    s = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlng / 2) ** 2
    return 2 * R * math.asin(math.sqrt(s))

def osrm(route):
    url = route.request.url
    path = url.split('?')[0]
    coords = path.rsplit('/', 1)[1]
    pts = [tuple(map(float, p.split(','))) for p in coords.split(';')]  # lng,lat
    if '/nearest/' in url:
        route_calls['nearest'] += 1
        lng, lat = pts[0]
        body = {'code': 'Ok', 'waypoints': [{'location': [lng, lat], 'name': random.choice(STREETS)}]}
    else:
        route_calls['route'] += 1
        (alng, alat), (blng, blat) = pts
        steps = [(alng, alat)]
        for i in range(1, 4):  # stair-step path to mimic a street grid
            f = i / 4
            steps.append((alng + (blng - alng) * f, steps[-1][1]))
            steps.append((steps[-1][0], alat + (blat - alat) * f))
        steps.append((blng, blat))
        d = sum(hav((steps[i][1], steps[i][0]), (steps[i + 1][1], steps[i + 1][0])) for i in range(len(steps) - 1))
        body = {'code': 'Ok', 'routes': [{'distance': d, 'duration': d / 12, 'geometry': {'type': 'LineString', 'coordinates': steps}}]}
    route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(body))

def nominatim(route):
    url = route.request.url
    if '/reverse' in url:
        body = {'address': {'house_number': '101', 'road': 'S Boston Ave', 'neighbourhood': 'Downtown'}, 'display_name': '101 S Boston Ave'}
        return route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(body))
    if 'viewbox=' in url:
        body = [{'lat': '36.1525', 'lon': '-95.9900', 'display_name': '320 S Boston Ave, Tulsa',
                 'address': {'house_number': '320', 'road': 'S Boston Ave', 'neighbourhood': 'Downtown', 'city': 'Tulsa'}}]
        return route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(body))
    body = [{'lat': '36.1540', 'lon': '-95.9928', 'boundingbox': ['36.00', '36.30', '-96.10', '-95.75'], 'name': 'Tulsa',
             'address': {'city': 'Tulsa', 'state': 'Oklahoma', 'ISO3166-2-lvl4': 'US-OK'}}]
    route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(body))

def overpass(route):
    q = route.request.post_data or ''
    if 'fire_station' in q:
        els = [{'type': 'node', 'id': 1, 'lat': 36.1560, 'lon': -95.9950, 'tags': {'amenity': 'fire_station', 'name': 'Tulsa Fire Station 1', 'addr:housenumber': '411', 'addr:street': 'S Frankfort Ave'}},
               {'type': 'way', 'id': 2, 'center': {'lat': 36.1480, 'lon': -95.9800}, 'tags': {'amenity': 'police', 'name': 'Tulsa Police Downtown Division'}},
               {'type': 'node', 'id': 3, 'lat': 36.1600, 'lon': -95.9700, 'tags': {'emergency': 'ambulance_station', 'name': 'EMSA Station'}}]
        return route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps({'elements': els}))
    names = ['Brady Arts District', 'Cherry Street', 'Brookside', 'Kendall-Whittier', 'Pearl District', 'Riverview', 'Maple Ridge']
    els = [{'type': 'node', 'lat': 36.154 + random.uniform(-0.05, 0.05), 'lon': -95.99 + random.uniform(-0.05, 0.05), 'tags': {'name': n, 'place': 'neighbourhood'}} for n in names]
    route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps({'elements': els}))

def main():
    server = subprocess.Popen([sys.executable, '-m', 'http.server', '8123', '-d', os.path.join(ROOT, 'dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB))
            page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
            page.route('https://router.project-osrm.org/**', osrm)
            page.route('https://nominatim.openstreetmap.org/**', nominatim)
            page.route('https://overpass-api.de/**', overpass)
            page.goto('http://localhost:8123/index.html')
            page.wait_for_selector('.topbar')
            check = lambda cond, msg: (print('ok -', msg) if cond else (_ for _ in ()).throw(AssertionError(msg)))
            game = lambda js: page.evaluate(f'() => {{ const g = window.__game; return {js}; }}')
            shot = lambda name: page.screenshot(path=os.path.join(OUT, name + '.png'))

            # --- Choose a city
            page.wait_for_selector('[data-testid=start-menu]')
            check(page.locator('[data-testid=menu-continue]').count() == 0, 'first launch shows start menu without Continue')
            shot('00-start-menu')
            page.click('[data-testid=menu-new]')
            page.fill('[data-testid=city-name]', 'Tulsa')
            page.select_option('[data-testid=city-state]', 'Oklahoma')
            shot('00b-city-state')
            page.click('[data-testid=city-go]')
            page.wait_for_selector('[data-testid=daily-bonus]', timeout=10000)
            shot('00d-daily-bonus')
            page.click('text=Later')
            page.wait_for_selector('[data-testid=build-confirm], .buildbar', timeout=10000)
            check(game('g.cityDef.name') == 'Tulsa' and game('g.cityDef.state') == 'OK', 'started a new game in Tulsa, OK via city search')
            check(game('g.cityDef.districts.length') >= 4, 'neighborhoods loaded for districts')
            shot('01-welcome')
            page.wait_for_selector('[data-testid=real-station]', timeout=10000)
            check(game('g.city.realStations.length') == 3, 'real fire/police/EMS stations loaded from OpenStreetMap')
            shot('01b-real-stations')
            # --- Setup: place fire, police, EMS by tapping the map
            for (x, y) in [(170, 360), (250, 300), (215, 470)]:
                page.mouse.click(x, y)
                page.click('[data-testid=build-confirm]')
                page.wait_for_timeout(150)
            check(game('g.setupDone'), 'three starter stations placed by tapping the map')
            check(game('g.city.money') == 0, 'new game starts with $0')
            game('(g.city.money = 100000, g.changed(), 0)')  # test funds
            check(game('g.city.vehicles.length') == 4, 'starter fleet created (engine, 2 patrol, ambulance)')
            shot('02-after-setup')

            # --- Build at a real station's location
            page.locator('[data-testid=real-station]').first.click()
            page.wait_for_selector('[data-testid=build-real]')
            shot('03b-real-panel')
            check(page.locator('[data-testid=build-real]').count() == 1, 'tapping a real station offers to build there')
            page.click('.close')
            # --- Build a second fire station
            page.click('[data-testid=tab-stations]')
            check(page.locator('[data-testid=station-row]').count() == 3, 'All tab lists every station')
            page.click('[data-testid=station-tab-police]')
            check(page.locator('[data-testid=station-row]').count() == 1, 'Police tab lists only police stations')
            shot('02b-station-tabs')
            page.click('[data-testid=station-tabs] >> text=All')
            page.click('[data-testid=build-open]')
            page.click('[data-testid=build-fire_station]')
            page.fill('[data-testid=addr-input]', '320 S Boston Ave')
            page.click('[data-testid=addr-find]')
            page.wait_for_selector('[data-testid=addr-picked]')
            check('320 S Boston Ave' in page.inner_text('[data-testid=addr-picked]'), 'station location found by typing an address')
            shot('03-placing-station')
            page.click('[data-testid=build-confirm]')
            page.wait_for_selector('[data-testid=buy-engine]')
            check(game('g.city.money') == 40000, 'fire station built for $60,000')
            check(game('g.city.stations[3].address').startswith('320 S Boston Ave'), 'station stores its street address')
            check(game('g.city.stations[0].address') == '101 S Boston Ave, Downtown', 'tapped station got its address by reverse lookup')
            page.click('[data-testid=buy-engine]')
            check(game('g.city.money') == 15000, 'engine purchased for $25,000')
            page.click('[data-testid=hire-open]')
            for i in range(3):
                page.locator('[data-testid=hire-btn]').first.click()
                page.wait_for_timeout(80)
            check(game('g.city.vehicles.filter(v => v.typeId === "engine").every(v => !g.staffingProblem(v))'), 'new engine fully crewed after hiring 3')
            shot('04-hire')

            # --- Receive a call and dispatch the recommended units
            game('g.spawnIncident("mva_injuries")')
            page.wait_for_function('() => window.__game.city.incidents.length === 1', timeout=8000)
            page.click('[data-testid=tab-dispatch]')
            page.click('[data-testid=incident-row]')
            page.wait_for_selector('[data-testid=dispatch-btn]')
            page.wait_for_timeout(200)
            shot('05-incident')
            checked = page.locator('[data-testid=dispatch-candidate] input:checked').count()
            check(checked == 2, f'recommended dispatch preselects ambulance + police ({checked})')
            check('Missing' in page.inner_text('[data-testid=missing]'), '"Missing" line shown')
            check(page.locator('[data-testid=aao] button').count() >= 2, 'quick-add unit buttons shown')
            first_id = game('g.city.incidents[0].id')
            page.click('[data-testid=dispatch-btn]')
            check(game('g.city.vehicles.filter(v => v.status === "dispatched").length') == 2, 'two units dispatched')

            # --- Run the simulation at 8x and watch units drive along the route
            game('(g.state.settings.speed = 8, 0)')  # test-only fast-forward
            page.wait_for_function('() => window.__game.city.vehicles.some(v => v.status === "enroute")', timeout=20000)
            v = game('(() => { const v = g.city.vehicles.find(v => v.status === "enroute"); return { n: v.route.coords.length, approx: v.route.approximate, pos: v.pos }; })()')
            check(v['n'] > 2 and not v['approx'], f'vehicle following road geometry ({v["n"]} points, not straight-line)')
            page.wait_for_timeout(1500)
            v2 = game('g.city.vehicles.find(v => v.status === "enroute" || v.status === "onscene").pos')
            check(v2 != v['pos'], 'vehicle marker moves over time')
            if page.locator('.close').count(): page.click('.close')
            shot('06-enroute-map')

            # fast-forward game time (let async route requests resolve between steps)
            for _ in range(80):
                page.evaluate('() => { for (let i = 0; i < 30; i++) window.__game.tick(1); }')
                page.wait_for_timeout(15)
                if game(f'g.city.resolved.some(i => i.id === "{first_id}") && g.city.vehicles.every(v => v.incidentId == null)'):
                    break
            res = game(f'g.city.resolved.find(i => i.id === "{first_id}")')
            check(res and res['outcome'] == 'successful', f'incident completed: {res and res["outcome"]}, payout ${res and res["payout"]}')
            check(game('g.city.finance.total.income["incident rewards"] > 0'), 'reward credited to finances')
            check(game('g.city.vehicles.every(v => v.incidentId == null)'), 'units released after the call')
            print('   other calls generated meanwhile:', game('g.city.resolved.map(i => i.name + ":" + i.outcome).join(", ")'))
            check(game('g.state.xp') > 0, 'player earned XP')

            game('(g.state.settings.speed = 0, 0)')
            page.click('[data-testid=tab-dispatch]')
            page.wait_for_selector('[data-testid=goals]')
            shot('07-dispatch-list')
            page.click('[data-testid=tab-finances]')
            shot('08-finances')
            page.click('[data-testid=tab-vehicles]')
            shot('09-vehicles')

            # --- Persistence: wait for autosave, reload, verify
            page.evaluate('() => new Promise(r => setTimeout(r, 10500))')
            page.reload()
            page.wait_for_selector('[data-testid=menu-continue]')
            shot('00c-continue-menu')
            page.click('[data-testid=menu-continue]')
            page.wait_for_selector('[data-testid=claim-bonus]')
            m_before = game('g.city.money')
            page.click('[data-testid=claim-bonus]')
            check(game('g.city.money') == m_before + 1000 and game('g.state.login.step') == 1, 'day-1 login bonus of $1,000 claimed')
            page.wait_for_timeout(400)
            check(game('g.city.stations.length') == 4, 'game restored from IndexedDB after reload')
            t0 = game('g.state.time')
            page.evaluate('() => { const g = window.__game; g.state.settings.speed = 1; g.state.lastSeen = Date.now() - 2 * 3600 * 1000; document.dispatchEvent(new Event("visibilitychange")); }')
            page.wait_for_selector('text=While you were away', timeout=5000)
            check(game('g.state.time') - t0 >= 2 * 3600 - 5, 'offline progress: 2 hours away advanced the game 2 hours')
            shot('14-offline')
            check(game('g.city.resolved.length') >= 1, 'call history restored')

            # --- Settings / export
            page.click('.gear')
            page.click('[data-testid=export-btn]')
            page.wait_for_selector('textarea.mono')
            exported = page.locator('textarea.mono').first.input_value()
            check('"state"' in exported and len(exported) > 1000, f'save exported ({len(exported)} chars)')
            shot('10-settings')
            page.click('[data-testid=missions-open]')
            page.wait_for_selector('[data-testid=mission]')
            n_m = page.locator('[data-testid=mission]').count(); check(n_m == game('0') + 73, f'missions catalogue lists all {n_m} call types')
            shot('12-missions')
            page.click('.back')
            page.click('[data-testid=research-open]')
            page.wait_for_selector('[data-testid=research-item]')
            shot('13-research')
            page.click('.back')
            # --- Multi-city: unlock a second city at level 5 and add Atlanta
            game('(g.state.level = 5, g.changed(), 0)')
            page.click('[data-testid=add-city]')
            page.fill('[data-testid=city-name]', 'Atlanta')
            page.select_option('[data-testid=city-state]', 'Georgia')
            page.click('[data-testid=city-go]')
            page.wait_for_selector('.buildbar')
            check(game('g.state.activeCity') == 'atlanta' and len(game('Object.keys(g.state.cities)')) == 2, 'second city added and active')
            check(game('g.city.money') == 0 and game('g.city.stations.length') == 0, 'new city has its own budget ($0) and network')
            page.mouse.click(170, 360); page.click('[data-testid=build-confirm]')
            game('g.switchCity("tulsa-ok")')
            page.wait_for_timeout(200)
            check(game('g.city.stations.length') == 4, 'switched back to Tulsa with network intact')

            # --- Routing failure falls back gracefully
            page.unroute('https://router.project-osrm.org/**')
            page.route('https://router.project-osrm.org/**', lambda r: r.fulfill(status=503, body='down'))
            if page.locator('.close').count(): page.click('.close')
            game('g.spawnIncident("theft")')
            page.wait_for_function('() => window.__game.city.incidents.length >= 1', timeout=15000)
            inc_id = game('g.city.incidents[g.city.incidents.length - 1].id')
            game(f'g.dispatch("{inc_id}", g.recommend("{inc_id}").ids)')
            page.wait_for_function('() => window.__game.city.vehicles.some(v => v.route && v.route.approximate)', timeout=15000)
            page.wait_for_selector('.toast.warn')
            check(True, 'routing outage: approximate path used and player warned')
            shot('11-routing-fallback')

            errors[:] = [e for e in errors if '503' not in e]
            check(not errors, f'no console errors apart from the simulated outage ({errors[:3]})')
            print('\nRoute requests:', route_calls)
            browser.close()
    finally:
        server.terminate()

if __name__ == '__main__':
    main()
