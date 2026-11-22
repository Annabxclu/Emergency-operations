"""Alliance between two players (two browsers) against an in-memory fake of Firebase.
Run after `node build.mjs` (serves dist/)."""
import json, os, sys, time, subprocess, uuid, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from e2e import ROOT, STUB, osrm, nominatim, overpass
from cloud_e2e import auth, users, H, reply
from playwright.sync_api import sync_playwright

docs = {}  # 'alliances/X/calls/Y' -> Firestore fields

def fs(route):
    req = route.request
    if req.method == 'OPTIONS': return route.fulfill(status=204, headers=H)
    uid = (req.headers.get('authorization') or '').replace('Bearer id-', '')
    if not uid: return reply(route, 403, {'error': {'status': 'PERMISSION_DENIED'}})
    u = urllib.parse.urlparse(req.url)
    path = urllib.parse.unquote(u.path.split('/documents', 1)[1]).lstrip('/')
    q = urllib.parse.parse_qs(u.query)
    if path == ':commit':
        for w in json.loads(req.post_data)['writes']:
            name = (w.get('update') or {}).get('name') or w.get('delete')
            p = name.split('/documents/', 1)[1]
            if 'update' in w: docs[p] = w['update']['fields']
            else: docs.pop(p, None)
        return reply(route, 200, {})
    segs = path.split('/')
    is_coll = len(segs) % 2 == 1
    if req.method == 'GET' and is_coll:
        out = [{'name': 'projects/x/databases/(default)/documents/' + k, 'fields': v} for k, v in docs.items() if k.startswith(path + '/') and k.count('/') == path.count('/') + 1]
        return reply(route, 200, {'documents': out} if out else {})
    if req.method == 'POST' and is_coll:
        k = f'{path}/{uuid.uuid4().hex[:12]}'
        docs[k] = json.loads(req.post_data)['fields']
        return reply(route, 200, {'name': 'x/documents/' + k, 'fields': docs[k]})
    if req.method == 'GET':
        if path not in docs: return reply(route, 404, {'error': {'status': 'NOT_FOUND'}})
        return reply(route, 200, {'name': 'projects/x/databases/(default)/documents/' + path, 'fields': docs[path]})
    if req.method == 'DELETE':
        docs.pop(path, None); return reply(route, 200, {})
    if req.method == 'PATCH':
        if q.get('currentDocument.exists') == ['false'] and path in docs: return reply(route, 409, {'error': {'status': 'ALREADY_EXISTS'}})
        body = json.loads(req.post_data)['fields']
        mask = q.get('updateMask.fieldPaths')
        if not mask: docs[path] = body
        else:
            cur = docs.setdefault(path, {})
            for m in mask:
                parts = [x.strip('`') for x in m.split('.')]
                src, dst = body, cur
                for i, part in enumerate(parts):
                    if i == len(parts) - 1: dst[part] = src[part]
                    else:
                        src = src[part]['mapValue']['fields']
                        dst = dst.setdefault(part, {'mapValue': {'fields': {}}})['mapValue']['fields']
        return reply(route, 200, {'name': 'x/documents/' + path, 'fields': docs[path]})
    reply(route, 400, {})

def device(browser, errors, tag):
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(f'{tag}: {e}'))
    page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB))
    page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    page.route('https://router.project-osrm.org/**', osrm)
    page.route('https://nominatim.openstreetmap.org/**', nominatim)
    page.route('https://overpass-api.de/**', overpass)
    page.route('https://photon.komoot.io/**', lambda r: r.fulfill(status=200, content_type='application/json', body='{"features":[]}'))
    page.route('https://identitytoolkit.googleapis.com/**', auth)
    page.route('https://securetoken.googleapis.com/**', auth)
    page.route('https://firestore.googleapis.com/**', fs)
    page.goto('http://localhost:8127/index.html')
    page.fill('[data-testid=city-name]', 'Tulsa'); page.select_option('[data-testid=city-state]', 'Oklahoma'); page.click('[data-testid=city-go]')
    page.wait_for_selector('[data-testid=daily-bonus]', timeout=10000); page.click('text=Later')
    page.wait_for_selector('[data-testid=build-confirm], .buildbar', timeout=10000)
    for (x, y) in [(170, 360), (250, 300), (215, 470)]:
        page.mouse.click(x, y); page.click('[data-testid=build-confirm]'); page.wait_for_timeout(150)
    page.wait_for_timeout(400)
    if page.locator('text=Later').count(): page.click('text=Later')
    return page

def main():
    server = subprocess.Popen([sys.executable, '-m', 'http.server', '8127', '-d', os.path.join(ROOT, 'dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    errors = []
    check = lambda cond, msg: (print('ok -', msg) if cond else (_ for _ in ()).throw(AssertionError(msg)))
    g = lambda page, js: page.evaluate(f'() => {{ const g = window.__game; return {js}; }}')
    poll = lambda page: page.evaluate('async () => { while (window.__ally.busy) await new Promise(r => setTimeout(r, 50)); await window.__ally.poll(); }')
    shots = os.path.join(ROOT, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            a = device(browser, errors, 'A'); b = device(browser, errors, 'B')
            for page, email in [(a, 'ann@example.com'), (b, 'ben@example.com')]:
                page.click('.gear'); page.click('[data-testid=group-cloud]')
                page.fill('[data-testid=cloud-email]', email); page.fill('[data-testid=cloud-password]', 'secret1'); page.click('[data-testid=cloud-signup]')
                page.wait_for_selector('[data-testid=cloud-account]', timeout=10000)
                page.click('[data-testid=group-cloud]'); page.click('[data-testid=group-alliance]')
            a.fill('[data-testid=alliance-me]', 'Ann'); a.fill('[data-testid=alliance-name]', 'Tulsa Mutual Aid'); a.click('[data-testid=alliance-create]')
            a.wait_for_selector('[data-testid=alliance-code]', timeout=10000)
            code = a.inner_text('[data-testid=alliance-code]').strip()
            check(len(code) == 6, f'alliance created with invite code {code}')
            b.fill('[data-testid=alliance-me]', 'Ben'); b.fill('[data-testid=alliance-code-input]', code); b.click('[data-testid=alliance-join-btn]')
            b.wait_for_selector('[data-testid=alliance-info]', timeout=10000)
            b.wait_for_function('() => document.querySelector("[data-testid=alliance-info]").innerText.includes("Ann")', timeout=10000)
            check('Ben' in b.inner_text('[data-testid=alliance-info]'), 'both members are listed')
            b.screenshot(path=os.path.join(shots, 'alliance-settings.png'))

            # Ann shares a call that needs 2 engines; she has only 1, so Ben's engine is needed.
            inc = a.evaluate("async () => { const g = window.__game; const i = await g.spawnIncident('fire_alarm'); i.requirements = [{ cap: 'engine', count: 2 }]; g.shareIncident(i.id); return i.id; }")
            poll(a); a.wait_for_timeout(300); poll(b); b.wait_for_timeout(300)
            b.click('.gear'); b.click('[data-testid=tab-dispatch]'); b.click('[data-testid=view-ally]')
            b.wait_for_selector('[data-testid=alliance-call]', timeout=5000)
            b.screenshot(path=os.path.join(shots, 'alliance-calls.png'))
            b.click('[data-testid=alliance-call-join]')
            b.wait_for_selector('[data-testid=mirror-note]', timeout=5000)
            check(g(b, 'g.city.incidents.some(i => i.mirror && i.mirror.ownerName === "Ann")'), "Ben joined Ann's call; it is on his board")
            a.evaluate(f"() => {{ const g = window.__game; g.state.settings.speed = 30; g.dispatch('{inc}', g.city.vehicles.filter(v => v.typeId === 'engine').map(v => v.id)); }}")
            b.evaluate("() => { const g = window.__game; g.state.settings.speed = 30; const m = g.city.incidents.find(i => i.mirror); g.dispatch(m.id, g.city.vehicles.filter(v => v.typeId === 'engine').map(v => v.id)); }")
            b.wait_for_function('() => window.__game.city.incidents.some(i => i.mirror && i.mirror.helped)', timeout=60000)
            check(True, "Ben's engine arrived at Ann's call")
            poll(b); b.wait_for_timeout(300); poll(a); a.wait_for_timeout(300)
            a.wait_for_function(f"() => window.__game.allianceUnits('{inc}').length > 0", timeout=10000)
            a.wait_for_function(f"() => ['working', 'resolved'].includes(window.__game.incident('{inc}').status)", timeout=60000)
            check(True, "Ben's engine counts on Ann's call: work starts")
            a.wait_for_function(f"() => window.__game.incident('{inc}').status === 'resolved'", timeout=90000)
            m0 = g(b, 'g.city.money')
            poll(a); a.wait_for_timeout(300); poll(b); b.wait_for_timeout(500)
            check(g(b, 'g.city.money') > m0 and not g(b, 'g.city.incidents.some(i => i.mirror)'), f"Ann finished it and Ben got the full reward (+${g(b, 'g.city.money') - m0})")

            # Ann shares a hospital with a 10% fee; Ben's ambulance uses it.
            hid = a.evaluate("() => { const g = window.__game; g.city.money = 1e6; const h = g.buildHospital([g.cityDef.center[0] + 0.01, g.cityDef.center[1]]); g.setHospitalShare(h.id, 10); return h.id; }")
            poll(a); a.wait_for_timeout(300); poll(b); b.wait_for_timeout(300); poll(b); b.wait_for_timeout(300)
            check(g(b, 'g.alliance.hospitals.length') == 1 and g(b, 'g.alliance.hospitals[0].feePct') == 10, "Ben sees Ann's shared hospital (10% fee)")
            am = g(a, 'g.city.money')
            b.evaluate("() => { const g = window.__game; g.alliance.admit(g.alliance.hospitals[0], 2, 100, 1000); }")
            b.wait_for_timeout(500); poll(a); a.wait_for_timeout(500)
            check(g(a, 'g.city.money') - am == 100 and g(a, f"g.hospitalFreeBeds(g.ownedHospital('{hid}'))") == 8, "Ann collects her 10% cut and Ben's patients use her beds")
            check(not errors, f'no page errors {errors[:3]}')
            browser.close()
    finally:
        server.terminate()
    print('Alliance e2e passed.')

if __name__ == '__main__':
    main()
