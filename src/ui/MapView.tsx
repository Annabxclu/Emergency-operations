import { useEffect, useRef } from 'react';
import type { Game } from '../engine/game';
import type { LatLng, Vehicle } from '../engine/types';
import { dept, stationType, vehicleType } from '../data/departments';
import { CATEGORY_DEPT } from '../data/incidents';
import { glyph } from './icons';

declare const L: any; // Leaflet, loaded from CDN in index.html

// Keyless tile sources only. (CARTO basemaps now require an API key.)
export const TILE_STYLES: Record<string, { name: string; url: string; attribution: string; maxZoom: number; subdomains?: string }> = {
  osm: {
    name: 'Standard (OpenStreetMap)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  hot: {
    name: 'Light (Humanitarian OSM)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', subdomains: 'abc', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by <a href="https://www.hotosm.org/">HOT</a> / <a href="https://openstreetmap.fr/">OSM France</a>',
  },
};
export const DEFAULT_TILE_STYLE = 'osm';

export interface MapApi { focus(p: LatLng, zoom?: number): void }
export type Selection = { kind: 'incident' | 'station' | 'vehicle'; id: string } | null;

interface Props {
  game: Game;
  selected: Selection;
  preview: { pos: LatLng; dept: string } | null;
  onSelect(sel: Selection): void;
  onMapClick(p: LatLng): void;
  onReady(api: MapApi): void;
  onTileTrouble(bad: boolean): void;
}

const MOVING = new Set(['enroute', 'returning', 'transporting']);

export function MapView(props: Props) {
  const el = useRef(null as HTMLDivElement | null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const { game } = props;
    const cityDef = game.cityDef;
    const map = L.map(el.current, { zoomControl: false, attributionControl: true, minZoom: 9, maxBoundsViscosity: 0.8 });
    const showCity = (d: typeof cityDef) => {
      map.setMaxBounds?.(null);
      map.setView(d.center, d.zoom);
      map.setMaxBounds?.([[d.bounds[0][0] - 0.15, d.bounds[0][1] - 0.2], [d.bounds[1][0] + 0.15, d.bounds[1][1] + 0.2]]);
    };
    showCity(cityDef);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a> | Routing <a href="https://project-osrm.org">OSRM</a>');

    // ---- tiles with failure detection
    let tiles: any = null, tileStyle = '', errors = 0, loaded = 0;
    const setTiles = (style: string) => {
      if (style === tileStyle) return;
      tileStyle = style;
      const def = TILE_STYLES[style] || TILE_STYLES.osm;
      if (tiles) tiles.remove();
      errors = 0; loaded = 0;
      tiles = L.tileLayer(def.url, { attribution: def.attribution, maxZoom: def.maxZoom, subdomains: def.subdomains || 'abc', detectRetina: false, referrerPolicy: 'strict-origin-when-cross-origin' });
      tiles.on('tileerror', () => { errors++; if (errors >= 4 && loaded === 0) propsRef.current.onTileTrouble(true); });
      tiles.on('tileload', () => { loaded++; if (loaded === 1) propsRef.current.onTileTrouble(false); });
      tiles.addTo(map);
    };

    const layers = {
      coverage: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map),
      stations: L.layerGroup().addTo(map),
      incidents: L.layerGroup().addTo(map),
      vehicles: L.layerGroup().addTo(map),
      preview: L.layerGroup().addTo(map),
      facilities: L.layerGroup().addTo(map),
    };
    const markers = { facilities: new Map<string, any>(), stations: new Map<string, any>(), incidents: new Map<string, any>(), vehicles: new Map<string, any>(), routes: new Map<string, any>(), coverage: new Map<string, any>() };
    const keys = new Map<any, string>(); // marker -> last icon key, to avoid needless DOM work
    let previewMarker: any = null;

    map.on('click', (e: any) => propsRef.current.onMapClick([e.latlng.lat, e.latlng.lng]));

    const clickable = (m: any, sel: Selection) => {
      m.on('click', (e: any) => { if (e?.originalEvent) L.DomEvent.stopPropagation(e); propsRef.current.onSelect(sel); });
      return m;
    };
    const setIcon = (m: any, key: string, make: () => any) => {
      if (keys.get(m) !== key) { m.setIcon(make()); keys.set(m, key); }
    };
    const sync = (store: Map<string, any>, layer: any, ids: Set<string>) => {
      for (const [id, m] of store) if (!ids.has(id)) { layer.removeLayer(m); store.delete(id); keys.delete(m); }
    };

    let lastState: unknown = null, lastCity = '';
    const reconcile = () => {
      const { game: g, selected } = propsRef.current;
      if (g.state !== lastState || g.state.activeCity !== lastCity) {
        // A different save or city: drop every marker so ids can't collide.
        lastCity = g.state.activeCity;
        if (lastState) {
          for (const [k, store] of Object.entries(markers)) { for (const m of (store as Map<string, any>).values()) (layers as any)[k].removeLayer(m); (store as Map<string, any>).clear(); }
          keys.clear();
          showCity(g.cityDef);
        }
        lastState = g.state;
      }
      const c = g.city;
      const rawFilt = g.state.settings.deptFilter;
      const filt = new Proxy(rawFilt, { get: (o, k: string) => o[k] !== false });
      setTiles(g.state.settings.tileStyle);

      // Hospitals
      const hIds = new Set<string>();
      for (const h of g.hospitals()) {
        hIds.add(h.id);
        if (!markers.facilities.has(h.id)) {
          const m = L.marker(h.pos, { zIndexOffset: 50, interactive: false, title: h.name });
          m.setIcon(L.divIcon({ className: '', iconSize: [20, 20], iconAnchor: [10, 10], html: `<div class="mk hosp" title="${h.name.replace(/"/g, '')}">${glyph('hospital', 13)}</div>` }));
          layers.facilities.addLayer(m); markers.facilities.set(h.id, m);
        }
      }
      sync(markers.facilities, layers.facilities, hIds);

      // Stations
      const sIds = new Set<string>();
      for (const s of c.stations) {
        if (!filt[s.dept]) continue;
        sIds.add(s.id);
        let m = markers.stations.get(s.id);
        if (!m) { m = clickable(L.marker(s.pos, { zIndexOffset: 100 }), { kind: 'station', id: s.id }); layers.stations.addLayer(m); markers.stations.set(s.id, m); }
        const isSel = selected?.kind === 'station' && selected.id === s.id;
        setIcon(m, `${s.dept}${isSel}`, () => L.divIcon({
          className: '', iconSize: [30, 30], iconAnchor: [15, 15],
          html: `<div class="mk st${isSel ? ' sel' : ''}" data-id="${s.id}" style="background:${dept(s.dept).color}">${glyph(s.dept, 17)}</div>`,
        }));
      }
      sync(markers.stations, layers.stations, sIds);

      // Coverage
      const cIds = new Set<string>();
      if (g.state.settings.showCoverage) for (const s of c.stations) {
        if (!filt[s.dept]) continue;
        cIds.add(s.id);
        if (!markers.coverage.has(s.id)) {
          const color = dept(s.dept).color;
          const circ = L.circle(s.pos, { radius: stationType(s.typeId).coverageKm * 1000, color, weight: 1, opacity: 0.5, fillColor: color, fillOpacity: 0.06, interactive: false });
          layers.coverage.addLayer(circ); markers.coverage.set(s.id, circ);
        }
      }
      sync(markers.coverage, layers.coverage, cIds);

      // Incidents
      const iIds = new Set<string>();
      for (const inc of c.incidents) {
        if (!filt[CATEGORY_DEPT[inc.category]]) continue;
        iIds.add(inc.id);
        let m = markers.incidents.get(inc.id);
        if (!m) { m = clickable(L.marker(inc.pos, { zIndexOffset: 300 }), { kind: 'incident', id: inc.id }); layers.incidents.addLayer(m); markers.incidents.set(inc.id, m); }
        const isSel = selected?.kind === 'incident' && selected.id === inc.id;
        setIcon(m, `${inc.status}${inc.severity}${isSel}`, () => L.divIcon({
          className: '', iconSize: [34, 34], iconAnchor: [17, 17],
          html: `<div class="mk inc sev${inc.severity} ${inc.status}${isSel ? ' sel' : ''}" data-id="${inc.id}">${glyph(inc.category, 17)}</div>`,
        }));
      }
      sync(markers.incidents, layers.incidents, iIds);

      // Vehicles (only those away from their station) and their routes
      const vIds = new Set<string>(), rIds = new Set<string>();
      for (const v of c.vehicles) {
        const t = vehicleType(v.typeId);
        if (!filt[t.dept]) continue;
        const away = ['enroute', 'onscene', 'returning', 'transporting', 'handover'].includes(v.status);
        if (away) {
          vIds.add(v.id);
          let m = markers.vehicles.get(v.id);
          if (!m) { m = clickable(L.marker(v.pos, { zIndexOffset: 500 }), { kind: 'vehicle', id: v.id }); layers.vehicles.addLayer(m); markers.vehicles.set(v.id, m); }
          m.setLatLng(v.pos);
          const isSel = selected?.kind === 'vehicle' && selected.id === v.id;
          setIcon(m, `${v.status}${isSel}`, () => L.divIcon({
            className: '', iconSize: [26, 26], iconAnchor: [13, 13],
            html: `<div class="mk veh ${v.status}${isSel ? ' sel' : ''}" data-id="${v.id}" style="--c:${dept(t.dept).color}">${t.short}</div>`,
          }));
        }
        if (v.route && ['enroute', 'returning', 'dispatched', 'transporting'].includes(v.status)) {
          rIds.add(v.id);
          let line = markers.routes.get(v.id);
          const key = `${v.route.coords.length}:${v.route.coords[0]}:${v.status}`;
          if (!line) { line = L.polyline(v.route.coords, { interactive: false }); layers.routes.addLayer(line); markers.routes.set(v.id, line); }
          if (keys.get(line) !== key) {
            line.setLatLngs(v.route.coords);
            line.setStyle({
              color: dept(t.dept).color, weight: v.status === 'returning' ? 2 : 3.5,
              opacity: v.status === 'returning' ? 0.35 : 0.75, dashArray: v.route.approximate ? '6 6' : v.status === 'returning' ? '2 6' : null,
            });
            keys.set(line, key);
          }
        }
      }
      sync(markers.vehicles, layers.vehicles, vIds);
      sync(markers.routes, layers.routes, rIds);

      // Placement preview
      const pv = propsRef.current.preview;
      if (pv) {
        if (!previewMarker) { previewMarker = L.marker(pv.pos, { zIndexOffset: 1000, interactive: false }); layers.preview.addLayer(previewMarker); }
        previewMarker.setLatLng(pv.pos);
        setIcon(previewMarker, pv.dept, () => L.divIcon({
          className: '', iconSize: [36, 36], iconAnchor: [18, 18],
          html: `<div class="mk st preview" style="background:${dept(pv.dept).color}">${glyph(pv.dept, 19)}</div>`,
        }));
      } else if (previewMarker) { layers.preview.removeLayer(previewMarker); keys.delete(previewMarker); previewMarker = null; }
    };

    const moveVehicles = () => {
      const c = propsRef.current.game.city;
      for (const v of c.vehicles as Vehicle[]) {
        if (!MOVING.has(v.status)) continue;
        const m = markers.vehicles.get(v.id);
        if (m) m.setLatLng(v.pos);
      }
    };

    let lastVersion = -1, lastSel = '', lastPreview = '', raf = 0;
    const loop = () => {
      const p = propsRef.current;
      const selKey = p.selected ? `${p.selected.kind}${p.selected.id}` : '';
      const pvKey = p.preview ? `${p.preview.pos}${p.preview.dept}` : '';
      if (p.game.version !== lastVersion || selKey !== lastSel || pvKey !== lastPreview) {
        lastVersion = p.game.version; lastSel = selKey; lastPreview = pvKey;
        reconcile();
      } else {
        moveVehicles();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    props.onReady({
      focus(p: LatLng, zoom?: number) {
        const z = Math.max(map.getZoom(), zoom ?? 14);
        map.flyTo ? map.flyTo(p, z, { duration: 0.6 }) : map.setView(p, z);
      },
    });

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); map.remove(); };
  }, []);

  return <div ref={el} className="map" />;
}
