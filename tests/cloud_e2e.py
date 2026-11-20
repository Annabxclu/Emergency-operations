"""Cloud save across two devices, against an in-memory fake of the Firebase REST APIs.

Run after `node build.mjs` (serves dist/). Device A starts a game and creates an
account; device B signs in on first launch and gets A's game; progress then moves
both ways, and a real conflict asks which save to keep.
"""
import json, os, sys, time, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from e2e import ROOT, STUB, osrm, nominatim, overpass
from playwright.sync_api import sync_playwright

users = {}   # email -> {uid, password}
docs = {}    # path under documents/ -> fields
H = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*'}

def reply(route, status, body):
    route.fulfill(status=status, content_type='application/json', headers=H, body=json.dumps(body))

def auth(route):
    if route.request.method == 'OPTIONS': return route.fulfill(status=204, headers=H)
    url = route.request.url
    if 'securetoken' in url:
        uid = route.request.post_data.split('refresh_token=')[1].split('&')[0].replace('rt-', '')
        return reply(route, 200, {'id_token': 'id-' + uid, 'refresh_token': 'rt-' + uid, 'expires_in': '3600'})
    b = json.loads(route.request.post_data)
    email = b.get('email', '')
    if ':signUp' in url:
        if email in users: return reply(route, 400, {'error': {'message': 'EMAIL_EXISTS'}})
        users[email] = {'uid': 'u%d' % (len(users) + 1), 'password': b['password']}
    elif ':signInWithPassword' in url:
        if email not in users or users[email]['password'] != b['password']:
            return reply(route, 400, {'error': {'message': 'INVALID_LOGIN_CREDENTIALS'}})
    u = users[email]
    reply(route, 200, {'localId': u['uid'], 'email': email, 'idToken': 'id-' + u['uid'], 'refreshToken': 'rt-' + u['uid'], 'expiresIn': '3600'})

def firestore(route):
    req = route.request
    if req.method == 'OPTIONS': return route.fulfill(status=204, headers=H)
    uid = (req.headers.get('authorization') or '').replace('Bearer id-', '')
    url = req.url.split('?')[0]
    base = url.split('/documents', 1)[1]
    if base == ':commit':
        for w in json.loads(req.post_data)['writes']:
            name = (w.get('update') or {}).get('name') or w.get('delete')
            path = name.split('/documents/', 1)[1]
            if path.split('/')[1] != uid: return reply(route, 403, {'error': {'status': 'PERMISSION_DENIED', 'message': 'Missing or insufficient permissions.'}})
            if 'update' in w: docs[path] = w['update']['fields']
            else: docs.pop(path, None)
        return reply(route, 200, {})
    path = base.lstrip('/')
    if path.split('/')[1] != uid: return reply(route, 403, {'error': {'status': 'PERMISSION_DENIED'}})
    if path not in docs: return reply(route, 404, {'error': {'status': 'NOT_FOUND'}})
    reply(route, 200, {'name': path, 'fields': docs[path]})

def device(browser, errors, tag):
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(f'{tag}: {e}'))
    page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB))
    page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    page.route('https://router.project-osrm.org/**', osrm)
    page.route('https://nominatim.openstreetmap.org/**', nominatim)
    page.route('https://overpass-api.de/**', overpass)
    page.route('https://identitytoolkit.googleapis.com/**', auth)
    page.route('https://securetoken.googleapis.com/**', auth)
    page.route('https://firestore.googleapis.com/**', firestore)
    page.goto('http://localhost:8124/index.html')
    page.wait_for_selector('.topbar')
    return page

def main():
    server = subprocess.Popen([sys.executable, '-m', 'http.server', '8124', '-d', os.path.join(ROOT, 'dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    errors = []
    check = lambda cond, msg: (print('ok -', msg) if cond else (_ for _ in ()).throw(AssertionError(msg)))
    g = lambda page, js: page.evaluate(f'() => {{ const g = window.__game; return {js}; }}')
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            # --- Device A: new game, create account
            a = device(browser, errors, 'A')
            a.fill('[data-testid=city-name]', 'Tulsa'); a.select_option('[data-testid=city-state]', 'Oklahoma'); a.click('[data-testid=city-go]')
            a.wait_for_selector('[data-testid=daily-bonus]', timeout=10000); a.click('text=Later')
            a.wait_for_selector('[data-testid=build-confirm], .buildbar', timeout=10000)
            for (x, y) in [(170, 360), (250, 300), (215, 470)]:
                a.mouse.click(x, y); a.click('[data-testid=build-confirm]'); a.wait_for_timeout(150)
            a.wait_for_timeout(500)
            if a.locator('text=Later').count(): a.click('text=Later')
            a.screenshot(path=os.path.join(ROOT, 'tests', 'shots', 'cloud-a.png'))
            g(a, 'g.city.money = 123456')
            a.click('.gear'); a.click('[data-testid=group-cloud]')
            a.fill('[data-testid=cloud-email]', 'me@example.com'); a.fill('[data-testid=cloud-password]', 'secret1')
            a.click('[data-testid=cloud-signup]')
            a.wait_for_selector('[data-testid=cloud-account] >> text=Up to date', timeout=10000)
            meta = docs.get('saves/u1')
            check(meta and int(meta['chunks']['integerValue']) >= 1 and meta['city']['stringValue'] == 'Tulsa', 'device A uploads its save after creating an account')
            check(int(meta['money']['integerValue']) == 123456, 'cloud save carries the money shown in the prompt')

            # --- Device B: first launch, sign in from the city picker, gets A's game
            b = device(browser, errors, 'B')
            b.click('[data-testid=picker-cloud] summary')
            b.fill('[data-testid=cloud-email]', 'me@example.com'); b.fill('[data-testid=cloud-password]', 'wrong')
            b.click('[data-testid=cloud-signin]')
            b.wait_for_selector('text=Wrong email or password.')
            check(True, 'wrong password shows a clear error')
            b.fill('[data-testid=cloud-password]', 'secret1'); b.click('[data-testid=cloud-signin]')
            b.wait_for_function('() => window.__game && window.__game.city && window.__game.city.money >= 123456', timeout=10000)
            check(b.locator('[data-testid=city-name]').count() == 0 and g(b, 'g.cityDef.name') == 'Tulsa', 'device B signs in on first launch and loads the Tulsa game')

            # --- B plays and syncs; A comes back to the app and picks it up without asking
            b.wait_for_timeout(500)
            if b.locator('text=Later').count(): b.click('text=Later')
            g(b, 'g.city.money = 777777')
            b.click('.gear'); b.click('[data-testid=group-cloud]'); b.click('[data-testid=cloud-sync]')
            b.wait_for_function('() => document.querySelector("[data-testid=cloud-account]").innerText.includes("Up to date")')
            time.sleep(0.3)
            check(int(docs['saves/u1']['money']['integerValue']) >= 777777, 'device B uploads its progress')
            a.evaluate('() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }')
            a.wait_for_function('() => window.__game.city.money >= 777777', timeout=10000)
            a.wait_for_timeout(300)
            if a.locator('text=Later').count(): a.click('text=Later')
            if a.locator('[data-testid=cloud-sync]').count() == 0:
                a.click('.gear'); a.wait_for_timeout(200)
                if a.locator('[data-testid=cloud-sync]').count() == 0: a.click('[data-testid=group-cloud]')
            check(a.locator('[data-testid=cloud-conflict]').count() == 0, 'device A loads the newer save from B without a prompt')

            # --- Both have new progress: B must choose
            g(a, 'g.city.money = 5000000')
            a.click('[data-testid=cloud-sync]')
            a.wait_for_function('() => document.querySelector("[data-testid=cloud-account]").innerText.includes("Up to date")')
            time.sleep(0.3)
            g(b, 'g.city.money = 42')
            b.click('[data-testid=cloud-sync]')
            b.wait_for_selector('[data-testid=cloud-conflict]', timeout=10000)
            check('iPhone' in b.inner_text('[data-testid=cloud-conflict]') or 'Browser' in b.inner_text('[data-testid=cloud-conflict]') or 'Android' in b.inner_text('[data-testid=cloud-conflict]'), 'conflict prompt names the other device')
            b.screenshot(path=os.path.join(ROOT, 'tests', 'shots', 'cloud-conflict.png'))
            b.click('[data-testid=cloud-keep-cloud]')
            b.wait_for_function('() => window.__game.city.money >= 5000000', timeout=10000)
            check(b.locator('[data-testid=cloud-conflict]').count() == 0, 'choosing the cloud save loads A\'s newer progress on B')
            b.screenshot(path=os.path.join(ROOT, 'tests', 'shots', 'cloud-settings.png'))
            check(not errors, f'no page errors ({errors[:3]})')
            browser.close()
    finally:
        server.terminate()
    print('Cloud e2e passed.')

if __name__ == '__main__':
    main()
