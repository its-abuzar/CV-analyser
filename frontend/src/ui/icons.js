/**
 * Icon set — 24x24 grid, stroke-based, drawn to one consistent weight.
 * Kept in-repo (no icon-font dependency) so the app has zero install steps.
 *
 * icon(name, size) returns an <svg> string. Unknown names fall back to a dot,
 * which is visible in review rather than silently rendering nothing.
 */

const P = {
  /* --- measurement + analysis --- */
  gauge: '<path d="M4 18h16M8 18v-5M12 18v-9M16 18v-6"/><circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
  crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  activity: '<path d="M3 12h3.5l2.5-7 3.5 14 2.5-7H21"/>',
  chartBar: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  chartLine: '<path d="M3 3v18h18"/><path d="M7 15l3.5-4.5 3 2.5L20 7"/>',
  diff: '<path d="M7 4v10M7 20v-2M17 20V10M17 4v2"/><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="7" r="2.2"/>',
  layers: '<path d="M12 3l8 4.5-8 4.5-8-4.5L12 3Z"/><path d="M4 12.5 12 17l8-4.5"/><path d="M4 17 12 21.5 20 17"/>',
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  spectro: '<path d="M3 20h18"/><path d="M6 20v-6M10 20V8M14 20v-9M18 20v-4"/>',

  /* --- documents + sources --- */
  fileText: '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4M9 12h6M9 16h4"/>',
  fileUp: '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4M12 17v-5M9.5 14.5 12 12l2.5 2.5"/>',
  upload: '<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/>',
  download: '<path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/><path d="M12 4v12M7.5 11.5 12 16l4.5-4.5"/>',
  folder: '<path d="M3 7a1 1 0 0 1 1-1h5l2 2.5h9a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  template: '<path d="M4 5h16v14H4z"/><path d="M4 9h16M10 9v10"/>',
  quote: '<path d="M9 7H5v5h4c0 3-1.5 4.5-4 5M19 7h-4v5h4c0 3-1.5 4.5-4 5"/>',
  bookOpen: '<path d="M12 6.5C10.5 5 8.5 4.5 4 4.5V18c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2V4.5c-4.5 0-6.5.5-8 2Z"/><path d="M12 6.5V20"/>',
  clipboard: '<path d="M9 4h6v3H9z"/><path d="M9 5.5H6.5a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1H15"/><path d="M9 12h6M9 16h4"/>',
  copy: '<path d="M9 9h10v11H9z"/><path d="M15 6H5v10"/>',
  printer: '<path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2"/><path d="M7 14h10v6H7z"/>',

  /* --- brands (simplified glyphs) --- */
  github: '<path d="M9 20c-4 1-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.3-.3 4.5-1.2 4.5-5a4 4 0 0 0-1.1-2.8 3.7 3.7 0 0 0-.1-2.8s-1.2-.4-3.8 1.4a9.4 9.4 0 0 0-5 0C6.4 4.7 5.2 5.1 5.2 5.1a3.7 3.7 0 0 0-.1 2.8A4 4 0 0 0 4 10.7c0 3.8 2.2 4.7 4.5 5-.6.6-.6 1.2-.5 2V21"/>',
  linkedin: '<path d="M5 9v11M5 5.2v.1"/><path d="M11 20v-6.5a2.5 2.5 0 0 1 5 0V20"/><path d="M11 9v11"/><circle cx="5" cy="5" r="1.4" fill="currentColor" stroke="none"/>',
  code: '<path d="M9 17l-5-5 5-5M15 7l5 5-5 5"/>',
  gitBranch: '<circle cx="7" cy="6" r="2.2"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="9" r="2.2"/><path d="M7 8.2v7.6M17 11.2c0 3.3-3 3.8-7 3.8"/>',
  globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13 0 16M12 4c-2.5 2.5-2.5 13 0 16"/>',
  link: '<path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1 1"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1-1"/>',
  externalLink: '<path d="M13 5h6v6M19 5l-8 8"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',

  /* --- people + roles --- */
  userSquare: '<path d="M4 5h16v14H4z"/><circle cx="12" cy="10.5" r="2.4"/><path d="M7.5 17c.8-1.9 2.5-2.8 4.5-2.8s3.7.9 4.5 2.8"/>',
  users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.7-2.9 2.9-4.5 5.5-4.5S13.8 16.1 14.5 19"/><path d="M16 6.3a3 3 0 0 1 0 5.4M18 14.6c1.6.7 2.7 2 3 4.4"/>',
  briefcase: '<path d="M4 8h16v11H4z"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 12.5h16"/>',
  building: '<path d="M5 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M15 10h3a1 1 0 0 1 1 1v9M3 20h18"/><path d="M8 8h4M8 12h4M8 16h4"/>',
  award: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 21l4-2 4 2-1-7.5"/>',
  graduation: '<path d="M12 4 2 8.5l10 4.5 10-4.5z"/><path d="M6 10.7V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.3"/>',
  mic: '<rect x="9" y="3" width="6" height="10" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>',
  message: '<path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>',
  send: '<path d="M20 4 3 10.5l6.5 2.5L12 20z"/><path d="M20 4 9.5 13"/>',
  mail: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
  handshake: '<path d="m6 12 3-3 3 3 3-3 3 3"/><path d="M3 12h3l3 4 3-2 3 2 3-4h3"/>',

  /* --- actions --- */
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 13l4.5 4.5L19 7"/>',
  checkDouble: '<path d="M2 13l4 4 8-9M11 16l1.5 1.5L22 8"/>',
  pen: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14.5 5.5 18.5 9.5"/>',
  wand: '<path d="M5 19 16 8"/><path d="M15 3v3M19.5 4.5 17.5 6.5M21 9h-3M12 5H9M18 13v-2"/><path d="m14.5 6.5 3 3"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5 19 17l1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/>',
  repeat: '<path d="M4 9V7a2 2 0 0 1 2-2h12l-3-3M20 15v2a2 2 0 0 1-2 2H6l3 3"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  sort: '<path d="M7 4v16M4 17l3 3 3-3M14 7h6M14 12h5M14 17h3"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m15.5 15.5 4.5 4.5"/>',
  command: '<path d="M8 5a2 2 0 1 1-2 2h12a2 2 0 1 1-2-2v12a2 2 0 1 1 2-2H6a2 2 0 1 1 2 2z"/>',
  sliders: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2"/><circle cx="9" cy="16" r="2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3"/>',
  moreH: '<circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  drag: '<circle cx="9" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  maximize: '<path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5"/>',

  /* --- status --- */
  alertTriangle: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  alertCircle: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5M12 15.7v.1"/>',
  info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8.2v.1"/>',
  helpCircle: '<circle cx="12" cy="12" r="8"/><path d="M9.8 9.5a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2 1-1.2 2M12 16.8v.1"/>',
  shield: '<path d="M12 3 5 5.5v6c0 4.2 3 7.4 7 9.5 4-2.1 7-5.3 7-9.5v-6z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  eye: '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12"/><circle cx="12" cy="12" r="2.6"/>',
  eyeOff: '<path d="M4 4l16 16"/><path d="M9.5 6.9A9.6 9.6 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a17 17 0 0 1-2.6 3.2M6.4 8.6A16.7 16.7 0 0 0 2.5 12S6 17.5 12 17.5c1 0 1.9-.1 2.7-.4"/>',
  flag: '<path d="M6 21V4h12l-2 4 2 4H6"/>',
  bell: '<path d="M18 15V10a6 6 0 0 0-12 0v5l-1.5 2.5h15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  calendar: '<rect x="4" y="6" width="16" height="14" rx="1"/><path d="M4 10h16M8 3.5V7M16 3.5V7"/>',
  history: '<path d="M4 12a8 8 0 1 0 8-8 8 8 0 0 0-6.6 3.5"/><path d="M4 4v4h4M12 8v4.5l3.5 2"/>',
  zap: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  trend: '<path d="M3 17l5.5-5.5 3.5 3L21 6"/><path d="M15 6h6v6"/>',
  star: '<path d="m12 4 2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.8-5 2.8 1-5.6-4-3.9 5.5-.8z"/>',
  bookmark: '<path d="M7 4h10v17l-5-4-5 4z"/>',
  heart: '<path d="M12 20s-7.5-4.4-7.5-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.7C19.5 15.6 12 20 12 20"/>',
  thumbsUp: '<path d="M7 10h3l2.5-6a2.5 2.5 0 0 1 2 4l-.5 2h4a2 2 0 0 1 2 2.4l-1.2 5A2 2 0 0 1 17 19H7"/><path d="M7 10v9H4v-9z"/>',

  /* --- domain --- */
  kanban: '<path d="M4 4h16v16H4z"/><path d="M9.3 4v16M14.6 4v16"/>',
  cards: '<path d="M4 6h16v5H4zM4 14h16v5H4z"/>',
  compass: '<circle cx="12" cy="12" r="8"/><path d="m14.5 9.5-1.7 4.3-4.3 1.7 1.7-4.3z"/>',
  route: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 6h6a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h7.8"/>',
  mapPin: '<path d="M12 21s6-5.7 6-10a6 6 0 0 0-12 0c0 4.3 6 10 6 10"/><circle cx="12" cy="11" r="2.3"/>',
  dollar: '<path d="M12 3v18"/><path d="M16.5 7.5A3.5 3.5 0 0 0 13 5h-1.5a3 3 0 0 0 0 6h1.5a3.2 3.2 0 0 1 0 6.4H11A3.5 3.5 0 0 1 7.5 15"/>',
  lightbulb: '<path d="M9.5 17a6 6 0 1 1 5 0v2.5h-5z"/><path d="M10 21.5h4"/>',
  listCheck: '<path d="M4 7l1.8 1.8L9 5.5M4 16l1.8 1.8L9 14.5M12 7h8M12 16h8"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="m7 10 2.5 2.5L7 15M12.5 15H17"/>',
  database: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
  plug: '<path d="M9 4v5M15 4v5"/><path d="M6.5 9h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 17.5V21"/>',
  key: '<circle cx="8" cy="14" r="4"/><path d="m11 11 8-8 2 2-2 2 1.5 1.5-2 2L17 9l-2 2"/>',
  tag: '<path d="M12.5 3.5H20V11l-8.5 8.5a1.4 1.4 0 0 1-2 0L4 13a1.4 1.4 0 0 1 0-2z"/><circle cx="16.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/>',
  chevronR: '<path d="m9.5 5 7 7-7 7"/>',
  chevronL: '<path d="m14.5 5-7 7 7 7"/>',
  chevronD: '<path d="m5 9.5 7 7 7-7"/>',
  chevronU: '<path d="m5 14.5 7-7 7 7"/>',
  arrowR: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  arrowL: '<path d="M20 12H4M10 6l-6 6 6 6"/>',
  arrowUp: '<path d="M12 20V4M6 10l6-6 6 6"/>',
  arrowDown: '<path d="M12 4v16M6 14l6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  dot: '<circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>',

  /* --- data + money --- */
  table: '<path d="M4 5h16v14H4z"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
  coins: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
  hash: '<path d="M9 4 7.5 20M16.5 4 15 20M4.5 9h15M4 15h15"/>',
  scale: '<path d="M12 5v14M8.5 19h7M5 8h14M12 5h0"/><path d="M5 8l-2.5 5h5zM19 8l-2.5 5h5z"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 4v4M9 13v1.5M15 13v1.5M9.5 16.5h5"/>',
};

/**
 * @param {string} name key from the set above
 * @param {number} size pixel size (square)
 * @param {string} extraClass optional class on the svg
 */
export function icon(name, size = 16, extraClass = '') {
  const body = P[name] || P.dot;
  const cls = extraClass ? ` class="${extraClass}"` : '';
  return (
    `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.6" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`
  );
}

export const iconNames = Object.keys(P);

export function hasIcon(name) {
  return Object.prototype.hasOwnProperty.call(P, name);
}
