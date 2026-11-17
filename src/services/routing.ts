import type { LatLng, RouteData, RoutingProvider } from '../engine/types';
import { directRoute } from '../engine/geo';

/**
 * OSRM client. The public demo server (router.project-osrm.org) asks for at most
 * one request per second and no heavy use, so requests are queued, spaced out,
 * and cached. If routing fails the caller gets an approximate direct route
 * flagged `approximate: true` so the game keeps working.
 */
export class OsrmRouting implements RoutingProvider {
  private cache = new Map<string, RouteData>();
  private queue: Promise<unknown> = Promise.resolve();
  private last = 0;
  failures = 0;
  onStatus?: (ok: boolean) => void;

  constructor(public baseUrl: string, private minIntervalMs = 1050, private timeoutMs = 9000) {}

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
    this.cache.clear();
  }

  private schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const wait = this.last + this.minIntervalMs - Date.now();
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      this.last = Date.now();
      return fn();
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async getJson(url: string): Promise<any> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 'Ok') throw new Error(json.code || 'Routing error');
      return json;
    } finally {
      clearTimeout(timer);
    }
  }

  private report(ok: boolean) {
    this.failures = ok ? 0 : this.failures + 1;
    this.onStatus?.(ok);
  }

  async route(from: LatLng, to: LatLng): Promise<RouteData> {
    const key = [from, to].map(p => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(';');
    const hit = this.cache.get(key);
    if (hit) return hit;
    const url = `${this.baseUrl}/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const json = await this.schedule(() => this.getJson(url));
        const r = json.routes[0];
        const coords: LatLng[] = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as LatLng);
        // Connect the exact start/end points to the snapped road geometry.
        const data: RouteData = { coords: [from, ...coords, to], distanceM: r.distance, durationS: r.duration, approximate: false };
        this.cache.set(key, data);
        if (this.cache.size > 400) this.cache.delete(this.cache.keys().next().value as string);
        this.report(true);
        return data;
      } catch {
        // retry once, then fall back
      }
    }
    this.report(false);
    return directRoute(from, to);
  }

  async nearest(p: LatLng): Promise<{ pos: LatLng; name: string } | null> {
    const url = `${this.baseUrl}/nearest/v1/driving/${p[1]},${p[0]}?number=1`;
    try {
      const json = await this.schedule(() => this.getJson(url));
      const w = json.waypoints[0];
      this.report(true);
      return { pos: [w.location[1], w.location[0]], name: w.name || '' };
    } catch {
      this.report(false);
      return null;
    }
  }
}
