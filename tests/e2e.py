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
            page.wait_for_selector('[data-testid=city-name]')
            check(page.locator('text=Back').count() == 0, 'first launch goes straight to choosing a city')
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
            check(page.locator('[data-testid=real-toggle]').count() == 0, 'no "Real stations" button on the map')
            # --- Setup: place fire, police, EMS by tapping the map
            for (x, y) in [(170, 360), (250, 300), (215, 470)]:
                page.mouse.click(x, y)
                page.click('[data-testid=build-confirm]')
                page.wait_for_timeout(150)
            check(game('g.setupDone'), 'three starter stations placed by tapping the map')
            check(game('g.city.money') == 0, 'new game starts with $0')
            game('(g.city.money = 200000, g.changed(), 0)')  # test funds
            check(game('g.city.vehicles.length') == 4, 'starter fleet created (engine, 2 patrol, ambulance)')
            shot('02-after-setup')

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
            page.wait_for_selector('[data-testid=group-st-buy]')
            check(page.locator('[data-testid=buy-engine]').count() == 0, 'station screen starts compact: Buy vehicle is a closed button')
            shot('03b-station-compact')
            page.click('[data-testid=group-st-buy]')
            page.wait_for_selector('[data-testid=buy-engine]')
            check(game('g.city.money') == 100000, 'fire station built for $100,000')
            check(game('g.city.stations[3].address').startswith('320 S Boston Ave'), 'station stores its street address')
            check(game('g.city.stations[0].address') == '101 S Boston Ave, Downtown', 'tapped station got its address by reverse lookup')
            page.click('[data-testid=buy-engine]')
            check(game('g.city.money') == 95000, 'engine purchased for $5,000')
            page.click('[data-testid=group-st-building]')
            page.click('[data-testid=station-level-up]')
            check(game('g.city.money') == 85000 and game('g.city.stations[3].level') == 1, 'bought station level 1 (+1 bay) for $10,000')
            page.locator('.sheet-body').evaluate('el => el.scrollTo(0, el.scrollHeight)'); shot('03c-station-level')
            page.click('[data-testid=group-st-personnel]')
            check(page.locator('[data-testid=hire-target-plus]').is_disabled(), 'wanted staff starts at full capacity (recruits for free without setting anything)')
            page.wait_for_function("() => document.querySelector('[data-testid=recruit-status]').innerText.includes('next free recruit')", timeout=5000)
            check('next free recruit in 23h' in page.inner_text('[data-testid=recruit-status]') or 'next free recruit in 24h' in page.inner_text('[data-testid=recruit-status]'), 'free recruiting runs by default: next free recruit in 24 hours')
            for i in range(3):
                page.click('[data-testid=hire-now]')
                page.wait_for_timeout(80)
            check(page.locator('[data-testid=transfer-select]').count() >= 3, 'staff list offers a transfer to other fire stations')
            shot('03d-recruiting')
            check(game('g.city.vehicles.filter(v => v.typeId === "engine").every(v => !g.staffingProblem(v))'), 'new engine fully crewed after hiring 3')
            shot('04-hire')
            # --- Fire Academy: build it, then train two recruits in HazMat
            money_before = game('g.city.money')
            game('(g.city.money += 600000, g.changed(), 0)')
            page.click('.close') if page.locator('.close').count() else None
            page.click('[data-testid=tab-stations]')
            page.click('[data-testid=academy-fire]')
            page.click('[data-testid=academy-build]')
            page.wait_for_selector('[data-testid=academy-course]')
            page.select_option('[data-testid=academy-course]', 'hazmat_tech')
            boxes = page.locator('[data-testid=academy-student] input')
            boxes.nth(0).check(); boxes.nth(1).check()
            page.click('[data-testid=academy-start]')
            check(game('g.city.employees.filter(e => e.training && e.training.qual === "hazmat_tech").length') == 2, 'two recruits started HazMat at the Fire Academy')
            shot('04b-academy')
            # --- Build a hospital and add a specialty
            game('(g.city.money += 300000, g.changed(), 0)')
            page.click('[data-testid=tab-stations]')
            page.click('[data-testid=build-hospital]')
            page.mouse.click(250, 330)
            page.click('[data-testid=build-confirm]')
            page.wait_for_selector('[data-testid=hospital-add-bed]')
            page.click('[data-testid=spec-cardiology]')
            check(game('g.city.hospitals.length') == 1 and game('g.city.hospitals[0].specialties[0]') == 'cardiology', 'hospital built on the map and Cardiology added')
            check(page.locator('[data-testid=own-hospital]').count() == 1, 'your hospital shows on the map')
            shot('04c-hospital')
            game(f'(g.city.money = {money_before}, g.changed(), 0)')
            page.click('.close')

            # --- Receive a call and dispatch the recommended units
            game('g.spawnIncident("mva_injuries")')
            page.wait_for_function('() => window.__game.city.incidents.length === 1', timeout=8000)
            page.click('[data-testid=tab-dispatch]')
            page.click('[data-testid=incident-row]')
            page.wait_for_selector('[data-testid=dispatch-btn]')
            page.wait_for_timeout(200)
            shot('05-incident')
            page.evaluate("document.querySelector('.sheet-body').scrollTop = 99999")
            page.wait_for_timeout(150)
            box = page.locator('[data-testid=missing]').bounding_box()
            body = page.locator('.sheet-body').bounding_box()
            pos = page.evaluate("getComputedStyle(document.querySelector('[data-testid=missing]')).position")
            check(pos == 'sticky' and box and box['y'] >= body['y'] - 1, 'missing-units table is pinned (sticky) and stays visible while scrolling the unit list')
            shot('05c-missing-sticky')
            page.evaluate("document.querySelector('.sheet-body').scrollTop = 0")
            check(page.locator('[data-testid=dispatch-candidate] input:checked').count() == 0, 'no units are pre-selected')
            check(page.locator('[data-testid=select-recommended]').count() == 0, 'no "Select recommended" button')
            for cap_btn in page.locator('[data-testid=aao] button.needed').all(): cap_btn.click()
            checked = page.locator('[data-testid=dispatch-candidate] input:checked').count()
            check(checked == 2, f'quick-add picks ambulance + police ({checked})')
            if page.locator('[data-testid=patients]').count():
                n = page.locator('[data-testid=patient-card]').count()
                check(n >= 1 and page.locator('[data-testid=patient-card][data-status=untreated]').count() == n, f'patient cards show names, all untreated before an ambulance arrives ({n})')
                shot('05d-patients')
            check('covered' in page.get_attribute('[data-testid=missing]', 'class'), 'missing-units box turns green once everything is selected')
            extra = page.locator('[data-testid=dispatch-candidate] input:not(:checked)')
            if extra.count():
                el = extra.first.element_handle()
                el.check()
                page.wait_for_timeout(100)
                cells = page.locator('[data-testid=missing] td.still').all_inner_texts()
                if any(c.strip().startswith('-') for c in cells):
                    check(True, f'selecting one unit too many shows a minus number in Still needed ({cells})')
                el.uncheck()
                page.wait_for_timeout(100)
            check(page.inner_text('[data-testid=dispatch-btn]').strip() == 'Dispatch', 'button reads "Dispatch"')
            check('Missing' in page.inner_text('[data-testid=missing]'), '"Missing" line shown')
            check(page.locator('[data-testid=aao] button').count() >= 2, 'quick-add unit buttons shown')
            all_n = page.locator('[data-testid=dispatch-candidate]').count()
            page.click('[data-testid=dispatch-tab-police]')
            pol_n = page.locator('[data-testid=dispatch-candidate]').count()
            check(0 < pol_n < all_n, f'Police tab shows only police units ({pol_n} of {all_n})')
            shot('05b-dispatch-tabs')
            page.click('[data-testid=dispatch-tabs] >> text=All')
            first_id = game('g.city.incidents[0].id')
            page.click('[data-testid=dispatch-btn]')
            check(game('g.city.vehicles.filter(v => v.status === "dispatched").length') == 2, 'two units dispatched')

            # --- Run the simulation at 8x and watch units drive along the route
            game('(g.state.settings.speed = 8, 0)')  # test-only fast-forward
            page.wait_for_function('() => window.__game.city.vehicles.some(v => v.status === "enroute" && v.route && !v.route.provisional)', timeout=20000)
            v = game('(() => { const v = g.city.vehicles.find(v => v.status === "enroute" && !v.route.provisional); return { n: v.route.coords.length, approx: v.route.approximate, pos: v.pos }; })()')
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
            # --- Follow-up from the dispatch window
            game('(g.city.incidents.length = 0, 0)')
            game('g.spawnIncident("suspicious")')
            page.wait_for_function('() => window.__game.city.incidents.length === 1', timeout=8000)
            game('g.spawnIncident("suspicious")')
            page.wait_for_function('() => window.__game.city.incidents.length === 2', timeout=8000)
            game('(() => { const a = g.city.incidents[0]; const car = g.city.vehicles.find(v => v.typeId === "patrol" && !g.dispatchProblem(v)); g.dispatch(a.id, [car.id]); return 0; })()')
            page.click('[data-testid=tab-dispatch]')
            page.locator('[data-testid=incident-row]').nth(1).click()
            page.wait_for_selector('[data-testid=followup-candidate]')
            page.locator('[data-testid=followup-candidate] input').first.check()
            page.click('[data-testid=dispatch-btn]')
            page.wait_for_selector('[data-testid=queued-followup]')
            shot('15-followup')
            check(game('g.city.vehicles.filter(v => v.followUp).length') == 1, 'busy unit queued as a follow-up from the dispatch window')
            st = game('(() => { const v = g.city.vehicles.find(v => v.followUp); const i = g.incident(v.followUp); return [i.status, g.shownStatus(i)]; })()')
            check(st[0] != 'pending' or st[1] == 'followup', f'a call with only a follow-up queued shows "Follow-up coming", not "No units" ({st})')
            if st[1] == 'followup':
                check('Follow-up coming' in page.inner_text('[data-testid=sheet]'), 'call screen shows "Follow-up coming"')
                badge = game('g.city.incidents.filter(i => g.shownStatus(i) === "pending").length')
                shown = page.locator('[data-testid=tab-dispatch] .badge')
                check((shown.count() == 0 and badge == 0) or (shown.count() and int(shown.inner_text()) == badge), 'Dispatch badge ignores calls that only wait for a follow-up')
                if page.locator('[data-testid=missing]').count():
                    check('follow' in page.get_attribute('[data-testid=missing]', 'class'), 'missing-units box is yellow with a follow-up queued')
            if page.locator('.close').count(): page.click('.close')

            game('(g.state.settings.speed = 0, 0)')
            page.click('[data-testid=tab-dispatch]')
            shot('07-dispatch-list')
            if page.locator('[data-testid=dispatch-sort]').count():
                page.select_option('[data-testid=dispatch-sort]', 'max')
                rewards = game('[...g.city.incidents].sort((a, b) => b.reward - a.reward).map(i => i.name)')
                first = page.locator('[data-testid=incident-row] .row-title').first.inner_text()
                check(first.startswith(rewards[0]), 'sorting by most credits puts the best-paying call first')
                page.select_option('[data-testid=dispatch-sort]', 'oldest')
                page.click('[data-testid=view-enroute]')
                n_en = game('g.city.incidents.filter(i => ["responding","followup"].includes(g.shownStatus(i))).length')
                check(page.locator('[data-testid=incident-row]').count() == n_en, f'En route view shows only calls with units on the way ({n_en})')
                page.click('[data-testid=view-all]')
            swipe_js = '''() => { const el = document.querySelector('[data-testid=sheet] .sheet-body');
              const mk = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 });
              el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [mk(60)], changedTouches: [mk(60)] }));
              el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [mk(260)] })); }'''
            page.click('[data-testid=incident-row]')
            page.wait_for_selector('[data-testid=dispatch-btn], [data-testid=missing], .sheet-head')
            page.evaluate(swipe_js)
            page.wait_for_timeout(200)
            check(page.locator('[data-testid=incident-row]').count() > 0, 'swiping right on a call goes back to the Dispatch list')
            page.evaluate(swipe_js)
            page.wait_for_timeout(200)
            check(page.locator('[data-testid=sheet]').count() == 0, 'swiping right on the list closes it back to the map')
            page.click('.gear')
            page.click('[data-testid=goals-open]')
            page.wait_for_selector('[data-testid=goal]')
            check(page.locator('[data-testid=goal]').count() == 3, 'Goals tab lists today\'s 3 goals')
            shot('07b-goals')
            page.click('.back')
            page.click('[data-testid=personnel-open]')
            page.wait_for_selector('text=employees')
            check(page.locator('[data-testid=tab-personnel]').count() == 0 and page.locator('[data-testid=tab-goals]').count() == 0, 'Goals and Personnel moved under Settings')
            check(page.locator('[data-testid=tab-finances]').count() == 0, 'no Finances tab in the bottom bar')
            page.click('.gear')
            page.click('[data-testid=finances-open]')
            shot('08-finances')
            page.click('[data-testid=tab-vehicles]')
            shot('09-vehicles')
            page.locator('[data-testid=vehicle-row]').first.click()
            page.click('[data-testid=vehicle-name]')
            page.fill('[data-testid=vehicle-name-input]', 'Big Red')
            page.keyboard.press('Enter')
            check(game('g.city.vehicles.some(v => v.name === "Big Red")'), 'vehicle renamed')
            page.click('.back')

            # --- Persistence: wait for autosave, reload, verify
            page.evaluate('() => new Promise(r => setTimeout(r, 10500))')
            page.reload()
            page.wait_for_selector('[data-testid=claim-bonus]')
            check(page.locator('[data-testid=city-name]').count() == 0, 'reopening goes straight back into the game (no Continue screen)')
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
            t0 = game('g.state.time'); page.evaluate('() => { window.__game.state.lastSeen = Date.now() - 600000; }'); page.wait_for_timeout(600)
            check(game('g.state.time') - t0 >= 500, f"coming back after 10 min catches up the time away ({round(game('g.state.time') - t0)} s)")
            page.click('[data-testid=tab-stations]'); page.wait_for_selector('[data-testid=station-tab-hospital]')
            page.click('[data-testid=station-tab-hospital]')
            check(page.locator('[data-testid=station-row]').count() == 0 and page.locator('[data-testid=hospital-row]').count() >= 1, 'Stations > Hospitals tab shows only hospitals')
            page.click('[data-testid=station-tab-academy]')
            check(page.locator('[data-testid=station-row]').count() == 0 and page.locator('[data-testid=academy-fire]').count() == 1 and page.locator('[data-testid=academy-police]').count() == 1, 'Stations > Academies tab shows both academies')
            page.click('[data-testid=tab-stations]')
            page.click('.gear'); page.click('[data-testid=group-pins]')
            page.click('[data-testid=pin-bg-light]'); page.click('[data-testid=pin-border-status]'); page.wait_for_timeout(150)
            check(game('g.state.settings.pinBg') == 'light' and game('g.state.settings.pinBorder') == 'status', 'vehicle marker settings saved (light background, status border)')
            check(page.locator('[data-testid=pin-preview] .vcode').count() == 3, 'marker preview shows status code badges')
            page.locator('[data-testid=group-pins]').scroll_into_view_if_needed(); shot('pin-settings')
            page.click('[data-testid=pin-bg-dark]'); page.click('[data-testid=pin-border-dept]')
            page.click('.gear')
            page.click('[data-testid=tab-map]'); page.wait_for_timeout(200)
            n_calls = page.locator('.mk.inc').count()
            page.click('[data-testid=filter-calls]'); page.wait_for_timeout(300)
            check(n_calls > 0 and page.locator('.mk.inc').count() == 0, f'Calls button hides calls on the map ({n_calls} -> 0)')
            page.click('[data-testid=filter-calls]'); page.wait_for_timeout(300)
            check(page.locator('.mk.inc').count() == n_calls, 'and shows them again')
            page.click('[data-testid=tab-stations]'); page.locator('[data-testid=station-tabs] button').first.click(); page.wait_for_selector('[data-testid=station-row]')
            page.locator('[data-testid=station-row]').first.click(); page.click('[data-testid=group-st-building]')
            sid = game('g.city.stations[0].id'); p0 = game('g.city.stations[0].pos')
            page.click('[data-testid=station-move]'); page.wait_for_timeout(200)
            page.mouse.click(300, 420); page.wait_for_selector('[data-testid=build-confirm]'); page.click('[data-testid=build-confirm]'); page.wait_for_timeout(300)
            p1 = game(f"g.station('{sid}').pos")
            check(p1 != p0, f'station moved on the map ({p0} -> {p1})')
            page.click('[data-testid=tab-radio]')
            page.wait_for_selector('[data-testid=radio-msg]', timeout=5000)
            check(page.locator('[data-testid=radio-msg][data-kind=call]').count() > 0 and page.locator('[data-testid=radio-msg][data-kind=dispatch]').count() > 0, f"radio tab shows calls and dispatches ({page.locator('[data-testid=radio-msg]').count()} messages)")
            shot('radio')
            page.click('[data-testid=radio-units]')
            check(page.locator('[data-testid=radio-msg][data-kind=call]').count() == 0, 'radio Units view hides new-call messages')
            page.click('.gear')
            check(page.locator('[data-testid=export-btn]').count() == 0, 'settings groups start collapsed')
            check('First Responders' in page.inner_text('.topbar') and 'First Responders' in page.title(), 'game is named First Responders (top bar and page title)')
            page.click('[data-testid=group-appearance]')
            page.click('[data-testid=theme-navy]')
            page.wait_for_timeout(300)
            bg = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()")
            check(bg == '#0b1630', f'choosing the Navy theme changes the background color ({bg})')
            shot('10b-themes')
            page.click('[data-testid=theme-midnight]')
            page.click('[data-testid=group-save]')
            page.click('[data-testid=export-btn]')
            page.wait_for_selector('textarea.mono')
            exported = page.locator('textarea.mono').first.input_value()
            check('"state"' in exported and len(exported) > 1000, f'save exported ({len(exported)} chars)')
            shot('10-settings')
            page.click('[data-testid=missions-open]')
            page.wait_for_selector('[data-testid=mission-search]')
            n_m = page.locator('[data-testid=mission]').count(); page.click('[data-testid=mission-type-ems]'); n_ems = page.locator('[data-testid=mission]').count(); check(0 < n_ems < n_m, f'type filter shows only EMS missions ({n_ems} of {n_m})'); names = page.locator('[data-testid=mission] .row-title').all_inner_texts(); check(names == sorted(names, key=str.lower) or len(names) < 2 or names[0].lower() <= names[-1].lower(), 'missions are alphabetical'); page.click('[data-testid=mission-type-all]'); check(n_m > 800, f'missions catalogue lists all {n_m} call types'); page.fill('[data-testid=mission-search]', 'foam'); check(0 < page.locator('[data-testid=mission]').count() < 100, 'mission search filters the list')
            shot('12-missions')
            page.click('.back')
            page.click('[data-testid=research-open]')
            page.wait_for_selector('[data-testid=research-item]')
            shot('13-research')
            page.click('.back')
            # --- Multi-city: unlock a second city at level 5 and add Atlanta
            game('(g.citySlots = () => ({ unlocked: 2, used: 1, nextLevel: 10, canAdd: true }), g.changed(), 0)')
            if not page.locator('[data-testid=add-city]').count(): page.click('[data-testid=group-cities]')
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
