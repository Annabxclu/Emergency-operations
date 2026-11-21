import type { Settings, VehicleStatus, VehicleTypeDef } from '../engine/types';
import { VEHICLE_STATUS } from './format';

const lum = (h: string) => { const n = parseInt(h.slice(1), 16); return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255); };
const isHex = (h: string) => /^#[0-9a-f]{6}$/i.test(h);

/** The pin background chosen in Settings. */
export function pinBackground(s: Settings) { return s.pinBg === 'light' ? '#f8fafc' : s.pinBg && isHex(s.pinBg) ? s.pinBg : '#1c232c'; }

/** A vehicle pin: drawing on the chosen background, outlined by department or by radio status. */
export function pinHtml(art: Art, deptColor: string, status: VehicleStatus, s: Settings, extra = '') {
  const bg = pinBackground(s);
  const darkBg = lum(bg) < 110;
  let color = art === 'ambulance' ? '#dc2626' : deptColor;
  // Keep the drawing visible against the background.
  if (isHex(color) && darkBg && lum(color) < 70) color = '#9aa7b6';
  if (isHex(color) && !darkBg && lum(color) > 215) color = '#64748b';
  const st = VEHICLE_STATUS[status];
  const border = s.pinBorder === 'status' ? st.color : deptColor;
  const badge = s.pinBorder === 'status' ? `<b class="vcode" style="background:${st.color}">${st.code}</b>` : '';
  return `<div class="vpin ${status} ${darkBg ? 'on-dark' : 'on-light'}" style="--c:${border};--bg:${bg}" ${extra}>${vehicleSvg(art, color)}${badge}</div>`;
}

// Original side-view vehicle drawings for the map markers (viewBox 0 0 40 22, facing right).

const W = (cx: number) => `<circle cx="${cx}" cy="18" r="2.9" fill="#0b0e12" stroke="#6b7682" stroke-width=".8"/><circle cx="${cx}" cy="18" r="1.2" fill="#b8c1ca"/>`;
const LIGHTS = (x: number, y: number) => `<rect x="${x}" y="${y}" width="3" height="1.8" rx=".6" fill="#ff3b30"/><rect x="${x + 3}" y="${y}" width="3" height="1.8" rx=".6" fill="#3b82f6"/>`;
const GLASS = '#cfe9ff';

export type Art = 'engine' | 'ladder' | 'ambulance' | 'car' | 'suv' | 'van' | 'heli' | 'plane' | 'boat' | 'tow' | 'truck' | 'trailer';

export function artFor(t: VehicleTypeDef): Art {
  const c = t.caps, n = t.name.toLowerCase();
  if (t.towedBy) return 'trailer';
  if (t.air) return /plane|tanker|air attack|jet/.test(n) ? 'plane' : 'heli';
  if (c.some(x => ['boat', 'fireboat', 'police_boat', 'coastal', 'dive', 'lifeguard'].includes(x)) && /boat|cutter|vessel|launch|ski/.test(n) && !/\+|truck|rescue \+/.test(n) && !c.includes('engine')) return 'boat';
  if (c.includes('tow') || c.includes('rotator')) return 'tow';
  if (/semi|crane/.test(n)) return 'truck';
  if (/crew carrier|k-?9 carrier|prisoner/.test(n)) return 'van';
  if (/swat suv|federal agents|lifeguard/.test(n)) return 'suv';
  if (t.dept === 'ems') return c.some(x => ['ambulance', 'als', 'ccu', 'mci', 'air_medical'].includes(x)) ? 'ambulance' : 'suv';
  if (t.dept === 'fire') {
    if (c.includes('ladder')) return 'ladder';
    if (c.some(x => ['chief', 'command', 'investigator', 'fire_prevention', 'supervisor'].includes(x)) && !c.includes('engine')) return 'suv';
    return 'engine';
  }
  if (t.dept === 'police') {
    if (c.some(x => ['swat', 'riot', 'prisoner_transport', 'crime_scene', 'investigation', 'bomb', 'federal'].includes(x))) return 'van';
    if (c.some(x => ['police_command', 'supervisor', 'game_warden'].includes(x)) && !c.includes('police')) return 'suv';
    return 'car';
  }
  return 'truck';
}

export function vehicleSvg(art: Art, color: string): string {
  const body = (() => {
    switch (art) {
      case 'engine': return `
        <rect x="2" y="8" width="26" height="9" rx="1.2" fill="${color}"/>
        <rect x="27" y="6" width="10" height="11" rx="2" fill="${color}"/>
        <rect x="30" y="8" width="5.5" height="4" rx=".8" fill="${GLASS}"/>
        <rect x="3" y="5" width="23" height="2.2" rx=".6" fill="#d6dbe0"/>
        <path d="M6 5v2.2M10 5v2.2M14 5v2.2M18 5v2.2M22 5v2.2" stroke="#8c96a0" stroke-width=".7"/>
        <rect x="4" y="11" width="21" height="1.4" fill="#fff" opacity=".85"/>
        ${LIGHTS(29, 4)}${W(9)}${W(31)}`;
      case 'ladder': return `
        <rect x="2" y="9" width="27" height="8" rx="1.2" fill="${color}"/>
        <rect x="28" y="6" width="10" height="11" rx="2" fill="${color}"/>
        <rect x="31" y="8" width="5.5" height="4" rx=".8" fill="${GLASS}"/>
        <path d="M0 4.6L33 1.6" stroke="#d6dbe0" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M4 4.3l.1-1M9 3.8l.1-1M14 3.4l.1-1M19 2.9l.1-1M24 2.5l.1-1M29 2l.1-1" stroke="#8c96a0" stroke-width=".7"/>
        <rect x="4" y="12" width="22" height="1.4" fill="#fff" opacity=".85"/>
        ${LIGHTS(30, 4)}${W(8)}${W(14)}${W(32)}`;
      case 'ambulance': return `
        <rect x="2" y="5" width="25" height="12" rx="1.6" fill="#fff" stroke="#b9c1c9" stroke-width=".6"/>
        <path d="M26.5 8h6.5l4 4.5V17h-10.5z" fill="#fff" stroke="#b9c1c9" stroke-width=".6"/>
        <path d="M28 9.2h4.4l2.8 3.2H28z" fill="${GLASS}"/>
        <rect x="2" y="12.6" width="35" height="1.6" fill="${color}"/>
        <path d="M13 7.4h3v2.3h2.3v3h-2.3V15h-3v-2.3h-2.3v-3H13z" fill="${color}" transform="translate(0 -1.2) scale(1 .92)"/>
        ${LIGHTS(4, 3.4)}${W(9)}${W(31)}`;
      case 'car': return `
        <path d="M2.5 11.5c0-1.4 1-2.3 2.4-2.5l6-.7 3.6-3.4c.7-.6 1.5-.9 2.4-.9h7.2c1 0 1.9.4 2.6 1.1l3.2 3.3 4.7.9c1.3.3 2.2 1.4 2.2 2.7V16H2.5z" fill="${color}"/>
        <path d="M15.4 6.2h3.8v3.4h-6.9zM20.6 6.2h3.3c.6 0 1.1.2 1.5.6l2.6 2.8h-7.4z" fill="${GLASS}"/>
        <rect x="2.5" y="11.4" width="35" height="2.2" fill="#fff"/>
        ${LIGHTS(16, 2.4)}${W(9)}${W(30)}`;
      case 'suv': return `
        <path d="M2.5 9.5c0-1 .8-1.8 1.8-1.9l4.4-.3 2.8-3c.5-.5 1.2-.8 1.9-.8h14.3c.8 0 1.5.3 2 .9l3 3.3 3 .6c1.1.2 1.8 1.2 1.8 2.3V16H2.5z" fill="${color}"/>
        <path d="M12.6 5h5.6v3.6h-8.7zM19.6 5h6.3c.5 0 .9.2 1.2.5l2.8 3.1H19.6z" fill="${GLASS}"/>
        <rect x="2.5" y="11" width="35" height="1.6" fill="#fff" opacity=".9"/>
        ${LIGHTS(17, 1.8)}${W(9)}${W(30)}`;
      case 'van': return `
        <rect x="2" y="4.5" width="28" height="12.5" rx="1.6" fill="${color}"/>
        <path d="M29.5 7.5h4.2l3.6 4.4V17h-7.8z" fill="${color}"/>
        <path d="M30.6 8.8h2.6l2.6 3.2h-5.2z" fill="${GLASS}"/>
        <rect x="5" y="7" width="6" height="3" rx=".6" fill="${GLASS}" opacity=".8"/>
        <rect x="2" y="12" width="35" height="1.6" fill="#fff" opacity=".9"/>
        ${LIGHTS(10, 2.8)}${W(9)}${W(31)}`;
      case 'heli': return `
        <path d="M3 4h30" stroke="#b8c1ca" stroke-width="1.4" stroke-linecap="round"/>
        <rect x="17" y="4" width="2" height="3" fill="#b8c1ca"/>
        <path d="M12 9c0-1.8 1.5-3 3.4-3h8.4c3.6 0 7.2 2.4 7.2 5.6S28 16 24.6 16H15.4C13.5 16 12 14.6 12 12.8z" fill="${color}"/>
        <path d="M24 7.3c2.6.4 4.8 2 5.5 4.3h-5.5z" fill="${GLASS}"/>
        <path d="M12.5 10.5H2.5" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M2.4 7.6v5" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M14 19h16M17 16v3M27 16v3" stroke="#b8c1ca" stroke-width="1.2" stroke-linecap="round"/>`;
      case 'plane': return `
        <path d="M3 11.5c0-1 .8-1.7 1.8-1.7H31c3 0 5.6 1 6.6 2.2-1 1.2-3.6 2.2-6.6 2.2H4.8C3.8 14.2 3 13.4 3 12.4z" fill="${color}"/>
        <path d="M3.5 10l-1.5-6h3.5l4 6z" fill="${color}"/>
        <path d="M15 12.4l6 7h3.4l-2.4-7z" fill="${color}" opacity=".85"/>
        <path d="M31.5 10.6c1.6.1 3.6.6 4.7 1.4h-4.7z" fill="${GLASS}"/>
        <path d="M8 11h20" stroke="#fff" stroke-width=".9" opacity=".8"/>`;
      case 'boat': return `
        <path d="M1.5 12h37l-4.5 6.5H6z" fill="${color}"/>
        <rect x="12" y="6" width="14" height="6" rx="1.4" fill="#fff"/>
        <rect x="14" y="7.6" width="4" height="2.4" rx=".5" fill="${GLASS}"/><rect x="19.5" y="7.6" width="4" height="2.4" rx=".5" fill="${GLASS}"/>
        <path d="M2 14.5h36" stroke="#fff" stroke-width=".9" opacity=".85"/>
        ${LIGHTS(16, 4)}
        <path d="M0 20.5c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" stroke="#60a5fa" stroke-width="1" fill="none"/>`;
      case 'tow': return `
        <rect x="2" y="11.5" width="23" height="4" rx=".8" fill="#7b8794"/>
        <path d="M24.5 6h7.5l4.5 5.4V16h-12z" fill="${color}"/>
        <path d="M26 7.4h5.3l3.2 3.8H26z" fill="${GLASS}"/>
        <path d="M22 11L9 4.5" stroke="#9aa4ae" stroke-width="2" stroke-linecap="round"/>
        <path d="M9 4.5v5.5" stroke="#d6dbe0" stroke-width=".9"/><path d="M7.6 10.2h2.8" stroke="#d6dbe0" stroke-width="1.2" stroke-linecap="round"/>
        <rect x="27" y="4.2" width="5" height="1.8" rx=".6" fill="#f59e0b"/>
        ${W(8)}${W(31)}`;
      case 'trailer': return `
        <rect x="6" y="6" width="26" height="10" rx="1.4" fill="${color}"/>
        <rect x="6" y="11" width="26" height="1.4" fill="#fff" opacity=".85"/>
        <path d="M32 14h6" stroke="#9aa4ae" stroke-width="1.6" stroke-linecap="round"/>
        ${W(19)}`;
      default: return `
        <rect x="2" y="5" width="23" height="12" rx="1.2" fill="${color}"/>
        <path d="M24.5 7.5h7.5l4.5 4.6V17h-12z" fill="${color}"/>
        <path d="M26 8.8h5.4l3 3.2H26z" fill="${GLASS}"/>
        <rect x="2" y="11.5" width="34.5" height="1.4" fill="#fff" opacity=".85"/>
        <rect x="27" y="5.8" width="5" height="1.7" rx=".6" fill="#f59e0b"/>
        ${W(8)}${W(31)}`;
    }
  })();
  return `<svg viewBox="0 0 40 22" width="40" height="22" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
