import type { LatLng, Route, RouteData } from './types';

const R = 6371000;
const rad = (d: number) => (d * Math.PI) / 180;

export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function destination(p: LatLng, bearingDeg: number, distM: number): LatLng {
  const d = distM / R, b = rad(bearingDeg), lat1 = rad(p[0]), lng1 = rad(p[1]);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b));
  const lng2 = lng1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

export function cumulative(coords: LatLng[]): number[] {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + distanceM(coords[i - 1], coords[i]));
  return cum;
}

export function makeRoute(data: RouteData, speedFactor: number): Route {
  const coords = data.coords.length >= 2 ? data.coords : [data.coords[0], data.coords[0]];
  const cum = cumulative(coords);
  return {
    coords, cum,
    distanceM: data.distanceM,
    durationS: Math.max(15, data.durationS / speedFactor),
    approximate: data.approximate,
    startAt: -1,
  };
}

/** Position along a route after `frac` (0..1) of the travel time. */
export function pointAlong(route: Route, frac: number): LatLng {
  const { coords, cum } = route;
  const total = cum[cum.length - 1];
  if (total <= 0 || frac <= 0) return coords[0];
  if (frac >= 1) return coords[coords.length - 1];
  const target = total * frac;
  let lo = 0, hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= target) lo = mid; else hi = mid;
  }
  const seg = cum[hi] - cum[lo];
  const t = seg > 0 ? (target - cum[lo]) / seg : 0;
  const a = coords[lo], b = coords[hi];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Straight-line fallback used only when the routing service fails. */
export function directRoute(from: LatLng, to: LatLng): RouteData {
  const d = distanceM(from, to) * 1.35; // approximate road distance
  return { coords: [from, to], distanceM: d, durationS: d / 11, approximate: true };
}

/** Rough ETA (game seconds) used for recommendations before a real route is fetched. */
export function estimateEtaS(from: LatLng, to: LatLng, speedFactor: number): number {
  return (distanceM(from, to) * 1.35) / (11 * speedFactor);
}
