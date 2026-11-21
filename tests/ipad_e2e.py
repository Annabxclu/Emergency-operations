"""iPad layout: tab panels open as floating windows that stay open together.
Run after `node build.mjs` (serves dist/)."""
import os, sys, time, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from e2e import ROOT, STUB, osrm, nominatim, overpass
from playwright.sync_api import sync_playwright

def main():
    server = subprocess.Popen([sys.executable, '-m', 'http.server', '8125', '-d', os.path.join(ROOT, 'dist')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    errors = []
    check = lambda cond, msg: (print('ok -', msg) if cond else (_ for _ in ()).throw(AssertionError(msg)))
    shots = os.path.join(ROOT, 'tests', 'shots'); os.makedirs(shots, exist_ok=True)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            ctx = browser.new_context(viewport={'width': 1180, 'height': 820}, is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB))
            page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
            page.route('https://router.project-osrm.org/**', osrm)
            page.route('https://nominatim.openstreetmap.org/**', nominatim)
            page.route('https://overpass-api.de/**', overpass)
            page.goto('http://localhost:8125/index.html')
            page.fill('[data-testid=city-name]', 'Tulsa'); page.select_option('[data-testid=city-state]', 'Oklahoma'); page.click('[data-testid=city-go]')
            page.wait_for_selector('[data-testid=daily-bonus]', timeout=10000); page.click('text=Later')
            page.wait_for_selector('[data-testid=build-confirm], .buildbar', timeout=10000)
            for (x, y) in [(560, 380), (660, 330), (620, 470)]:
                page.mouse.click(x, y); page.click('[data-testid=build-confirm]'); page.wait_for_timeout(150)
            page.wait_for_timeout(400)
            if page.locator('text=Later').count(): page.click('text=Later')
            page.evaluate("() => { const g = window.__game; return g.spawnIncident(g.eligibleTypes().find(t => t.patients && t.patients[0] > 0)?.id); }"); page.wait_for_timeout(300)

            page.click('[data-testid=tab-dispatch]')
            page.click('[data-testid=tab-vehicles]')
            page.click('[data-testid=tab-radio]')
            check(all(page.locator(f'[data-testid=win-{k}]').count() == 1 for k in ['dispatch', 'vehicles', 'radio']), 'dispatch, vehicles and radio open together as windows')
            check(page.locator('[data-testid=sheet]').count() == 0, 'no phone-style sheet on iPad')
            check(page.locator('.win-x').count() == 0, 'tab windows have no X (close them from the tab bar)')
            b0 = page.locator('[data-testid=win-radio]').bounding_box()
            bar = page.locator('[data-testid=win-bar-radio]').bounding_box()
            page.mouse.move(bar['x'] + 60, bar['y'] + 15); page.mouse.down(); page.mouse.move(bar['x'] + 560, bar['y'] + 75, steps=8); page.mouse.up()
            b1 = page.locator('[data-testid=win-radio]').bounding_box()
            check(abs(b1['x'] - b0['x'] - 500) < 30 and abs(b1['y'] - b0['y'] - 60) < 30, f'radio window drags to a new spot ({round(b0["x"])},{round(b0["y"])} -> {round(b1["x"])},{round(b1["y"])})')
            sz = page.locator('[data-testid=win-size-radio]').bounding_box()
            page.mouse.move(sz['x'] + 10, sz['y'] + 10); page.mouse.down(); page.mouse.move(sz['x'] - 60, sz['y'] - 120, steps=6); page.mouse.up()
            b2 = page.locator('[data-testid=win-radio]').bounding_box()
            check(b2['width'] < b1['width'] - 40 and b2['height'] < b1['height'] - 80, 'radio window resizes from its corner')
            vbar = page.locator('[data-testid=win-bar-vehicles]').bounding_box()
            page.mouse.move(vbar['x'] + 60, vbar['y'] + 15); page.mouse.down(); page.mouse.move(vbar['x'] + 300, vbar['y'] + 15, steps=6); page.mouse.up()
            check(page.locator('[data-testid=win-dispatch] [data-testid=row-patients]').count() > 0, 'patients and their status show on the call list')
            page.locator('[data-testid=win-dispatch]').screenshot(path=os.path.join(shots, 'ipad-dispatch-list.png'))
            # Opening a call from the dispatch list stays inside the Dispatch window
            page.evaluate("() => { window.__focusCalls = 0; }")
            page.locator('[data-testid=win-dispatch] .row').first.click()
            page.wait_for_timeout(300)
            check('Received' in page.inner_text('[data-testid=win-dispatch]'), 'a call opens inside the Dispatch window')
            page.screenshot(path=os.path.join(shots, 'ipad-windows.png'))
            page.click('[data-testid=tab-vehicles]')
            check(page.locator('[data-testid=win-vehicles]').count() == 0 and page.locator('[data-testid=win-radio]').count() == 1, 'tapping a tab again closes just that window')
            page.evaluate("() => window.dispatchEvent(new Event('pagehide'))"); page.wait_for_timeout(500)
            page.reload(); page.wait_for_selector('.topbar'); page.wait_for_timeout(500)
            if page.locator('text=Later').count(): page.click('text=Later')
            b3 = page.locator('[data-testid=win-radio]').bounding_box()
            check(b3 and abs(b3['x'] - b2['x']) < 3 and abs(b3['width'] - b2['width']) < 3, 'open windows and their positions come back after reopening the app')
            check(not errors, f'no page errors {errors[:2]}')
            browser.close()
    finally:
        server.terminate()
    print('iPad e2e passed.')

if __name__ == '__main__':
    main()
