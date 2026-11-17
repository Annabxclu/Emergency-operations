// Test-only stand-in for Leaflet (the sandbox cannot reach the CDN or tile
// servers). Implements just the API surface MapView uses, with a real Web
// Mercator projection so markers, routes and clicks land in the right place.
(function () {
  const TILE = 256;
  const project = (lat, lng, z) => {
    const s = TILE * Math.pow(2, z);
    const x = ((lng + 180) / 360) * s;
    const sin = Math.sin((lat * Math.PI) / 180);
    const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * s;
    return [x, y];
  };
  const unproject = (x, y, z) => {
    const s = TILE * Math.pow(2, z);
    const lng = (x / s) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / s;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return [lat, lng];
  };
  const ll = p => (Array.isArray(p) ? p : [p.lat, p.lng]);

  function Evented() { this._h = {}; }
  Evented.prototype.on = function (t, f) { (this._h[t] ||= []).push(f); return this; };
  Evented.prototype.off = function () { return this; };
  Evented.prototype.fire = function (t, e) { (this._h[t] || []).forEach(f => f(e || {})); return this; };

  function MapC(el, opts) {
    Evented.call(this);
    this.el = el; this.center = [0, 0]; this.zoom = 13;
    el.style.position = el.style.position || 'absolute';
    el.style.overflow = 'hidden';
    el.style.background = 'repeating-linear-gradient(0deg,#ecebe6 0 39px,#dcdad3 39px 40px),#ecebe6';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(this.svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
    el.appendChild(this.svg);
    this.pane = document.createElement('div');
    Object.assign(this.pane.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
    el.appendChild(this.pane);
    this.layers = new Set();
    el.addEventListener('click', ev => {
      if (ev.target !== el && ev.target !== this.svg && ev.target !== this.pane) return;
      const r = el.getBoundingClientRect();
      const latlng = this.toLatLng(ev.clientX - r.left, ev.clientY - r.top);
      this.fire('click', { latlng: { lat: latlng[0], lng: latlng[1] } });
    });
    this.attributionControl = { setPrefix() {}, addAttribution() {} };
  }
  MapC.prototype = Object.create(Evented.prototype);
  MapC.prototype.toPoint = function (p) {
    const [cx, cy] = project(this.center[0], this.center[1], this.zoom);
    const [x, y] = project(p[0], p[1], this.zoom);
    return [x - cx + this.el.clientWidth / 2, y - cy + this.el.clientHeight / 2];
  };
  MapC.prototype.toLatLng = function (px, py) {
    const [cx, cy] = project(this.center[0], this.center[1], this.zoom);
    return unproject(px + cx - this.el.clientWidth / 2, py + cy - this.el.clientHeight / 2, this.zoom);
  };
  MapC.prototype.setView = function (c, z) { this.center = ll(c); if (z != null) this.zoom = z; this.redraw(); return this; };
  MapC.prototype.flyTo = function (c, z) { return this.setView(c, z); };
  MapC.prototype.getZoom = function () { return this.zoom; };
  MapC.prototype.setMaxBounds = function () { return this; };
  MapC.prototype.invalidateSize = function () { this.redraw(); return this; };
  MapC.prototype.remove = function () { this.el.innerHTML = ''; };
  MapC.prototype.addLayer = function (l) { this.layers.add(l); l._add(this); return this; };
  MapC.prototype.removeLayer = function (l) { this.layers.delete(l); l._remove(); return this; };
  MapC.prototype.redraw = function () { this.layers.forEach(l => l._draw && l._draw()); };

  function Layer() { Evented.call(this); }
  Layer.prototype = Object.create(Evented.prototype);
  Layer.prototype.addTo = function (m) { m.addLayer(this); return this; };
  Layer.prototype.remove = function () { if (this._map) this._map.removeLayer(this); return this; };

  function Group() { Layer.call(this); this.children = new Set(); }
  Group.prototype = Object.create(Layer.prototype);
  Group.prototype._add = function (m) { this._map = m; this.children.forEach(c => c._add(m)); };
  Group.prototype._remove = function () { this.children.forEach(c => c._remove()); this._map = null; };
  Group.prototype._draw = function () { this.children.forEach(c => c._draw()); };
  Group.prototype.addLayer = function (l) { this.children.add(l); if (this._map) l._add(this._map); return this; };
  Group.prototype.removeLayer = function (l) { this.children.delete(l); l._remove(); return this; };
  Group.prototype.clearLayers = function () { this.children.forEach(c => c._remove()); this.children.clear(); return this; };

  function Marker(p, o) { Layer.call(this); this.p = ll(p); this.o = o || {}; this.icon = null; }
  Marker.prototype = Object.create(Layer.prototype);
  Marker.prototype._add = function (m) {
    this._map = m;
    this.el = document.createElement('div');
    this.el.className = 'stub-marker';
    Object.assign(this.el.style, { position: 'absolute', pointerEvents: this.o.interactive === false ? 'none' : 'auto', zIndex: String(100 + (this.o.zIndexOffset || 0)) });
    this.el.addEventListener('click', ev => { ev.stopPropagation(); this.fire('click', {}); });
    m.pane.appendChild(this.el);
    this._render(); this._draw();
  };
  Marker.prototype._remove = function () { if (this.el) this.el.remove(); this.el = null; this._map = null; };
  Marker.prototype._render = function () {
    if (!this.el || !this.icon) return;
    this.el.innerHTML = this.icon.html || '';
    this.size = this.icon.iconSize || [20, 20];
    this.anchor = this.icon.iconAnchor || [this.size[0] / 2, this.size[1] / 2];
  };
  Marker.prototype._draw = function () {
    if (!this.el || !this._map) return;
    const [x, y] = this._map.toPoint(this.p);
    const a = this.anchor || [10, 10];
    this.el.style.left = `${x - a[0]}px`; this.el.style.top = `${y - a[1]}px`;
  };
  Marker.prototype.setIcon = function (i) { this.icon = i; this._render(); this._draw(); return this; };
  Marker.prototype.setLatLng = function (p) { this.p = ll(p); this._draw(); return this; };
  Marker.prototype.setZIndexOffset = function () { return this; };

  function Path(kind, data, o) { Layer.call(this); this.kind = kind; this.data = data; this.o = Object.assign({ color: '#3388ff', weight: 3, opacity: 1 }, o || {}); }
  Path.prototype = Object.create(Layer.prototype);
  Path.prototype._add = function (m) {
    this._map = m;
    this.el = document.createElementNS('http://www.w3.org/2000/svg', this.kind === 'circle' ? 'circle' : 'polyline');
    this.el.setAttribute('fill', this.kind === 'circle' ? (this.o.fillColor || this.o.color) : 'none');
    m.svg.appendChild(this.el);
    this._draw();
  };
  Path.prototype._remove = function () { if (this.el) this.el.remove(); this.el = null; this._map = null; };
  Path.prototype._draw = function () {
    if (!this.el || !this._map) return;
    const o = this.o;
    this.el.setAttribute('stroke', o.color); this.el.setAttribute('stroke-width', o.weight); this.el.setAttribute('stroke-opacity', o.opacity);
    if (o.dashArray) this.el.setAttribute('stroke-dasharray', o.dashArray); else this.el.removeAttribute('stroke-dasharray');
    if (this.kind === 'circle') {
      const [x, y] = this._map.toPoint(this.data);
      const mPerPx = (40075016 * Math.cos((this.data[0] * Math.PI) / 180)) / (TILE * Math.pow(2, this._map.zoom));
      this.el.setAttribute('cx', x); this.el.setAttribute('cy', y); this.el.setAttribute('r', o.radius / mPerPx);
      this.el.setAttribute('fill-opacity', o.fillOpacity ?? 0.2);
    } else {
      this.el.setAttribute('points', this.data.map(p => this._map.toPoint(ll(p)).join(',')).join(' '));
    }
  };
  Path.prototype.setLatLngs = function (d) { this.data = d; this._draw(); return this; };
  Path.prototype.setStyle = function (s) { Object.assign(this.o, s); this._draw(); return this; };

  function Tiles() { Layer.call(this); }
  Tiles.prototype = Object.create(Layer.prototype);
  Tiles.prototype._add = function (m) { this._map = m; setTimeout(() => this.fire('tileload'), 50); };
  Tiles.prototype._remove = function () { this._map = null; };

  window.L = {
    map: (el, o) => new MapC(el, o),
    tileLayer: () => new Tiles(),
    layerGroup: () => new Group(),
    marker: (p, o) => new Marker(p, o),
    divIcon: o => o,
    polyline: (d, o) => new Path('polyline', d, o),
    circle: (p, o) => new Path('circle', ll(p), o),
    DomEvent: { stopPropagation() {} },
  };
})();
