// Small inline SVG glyphs (white, 24×24 viewBox) used in map markers and UI.

const svg = (body: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${body}</svg>`;

const GLYPHS: Record<string, string> = {
  fire: '<path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.3 2.2-3.2C17.6 10.6 19 13 19 15.5 19 19.1 15.9 22 12 22s-7-2.9-7-6.5C5 10 10.5 7.5 12 2z"/>',
  police: '<path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z"/>',
  ems: '<path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z"/>',
  rescue: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.1-.6-.6-2.1z"/>',
  hazmat: '<path d="M12 2l10 18H2L12 2zm-1 7v5h2V9h-2zm0 7v2h2v-2h-2z"/>',
};

export function glyph(kind: string, size = 16) {
  return svg(GLYPHS[kind] || GLYPHS.fire, size);
}

export const TAB_ICONS: Record<string, string> = {
  map: '<path d="M9 3l6 2 6-2v18l-6 2-6-2-6 2V5l6-2zm0 2.2v13.6l6 2V7.2l-6-2z"/>',
  dispatch: '<path d="M12 2a7 7 0 0 1 7 7v5l2 3H3l2-3V9a7 7 0 0 1 7-7zm-2 17h4a2 2 0 0 1-4 0z"/>',
  stations: '<path d="M3 10l9-7 9 7v11h-6v-6H9v6H3V10z"/>',
  vehicles: '<path d="M3 13l2-6h10l4 4h2v6h-2a2.5 2.5 0 0 1-5 0H9a2.5 2.5 0 0 1-5 0H3v-4zm4-4l-1 3h5V9H7zm6 0v3h4l-3-3h-1z"/>',
  personnel: '<path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm-8 9c0-4 3.6-7 8-7s8 3 8 7H4z"/>',
  finances: '<path d="M4 20V10h3v10H4zm6 0V4h3v16h-3zm6 0v-7h3v7h-3z"/>',
};

export const tabIcon = (k: string) => svg(TAB_ICONS[k], 22);
