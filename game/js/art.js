/* OxyNest Moon Base: original art, drawn in code as inline SVG. No image files.
   Status colours (#10b981, #f59e0b, #f97316, #ef4444) appear only in meters (statusIcon). */
window.OX_ART = (function () {
  'use strict';

  const N = '#1b2450';      // navy outline
  const CREAM = '#fff8e8';
  const SKY = '#38bdf8';
  const POWER = '#7c8cff', AIR = '#4fb3d9', FOOD = '#6fb7a0', RAD = '#b08cd9';
  const ROCK = '#a7abbe', STEEL = '#c7ccdb', WHITE = '#f4f6fb', SUN = '#ffd84d', PINK = '#ff7aa8';
  const PROC = '#ffd27a', ICE = '#d6f3ff', WATERC = '#4fb3d9';

  // ---------------------------------------------------------------- icons (24 x 24)
  const S = `stroke="${N}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
  const ICONS = {
    heart: `<path d="M12 20.5s-7.6-4.6-9.2-9.3C1.6 7.6 3.8 4.3 7.1 4.3c2 0 3.6 1.1 4.9 3 1.3-1.9 2.9-3 4.9-3 3.3 0 5.5 3.3 4.3 6.9C19.6 15.9 12 20.5 12 20.5z" fill="${PINK}"/><path d="M6.3 7.6c-.9.5-1.4 1.4-1.3 2.4" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>`,
    air: `<circle cx="9" cy="14.5" r="5.6" fill="#bfe8f7"/><circle cx="16.6" cy="8.4" r="4.1" fill="#bfe8f7"/><circle cx="17.4" cy="17.4" r="2.6" fill="#bfe8f7"/><path d="M6.6 12.4a3 3 0 0 1 2.4-1.6M15 6.6a2 2 0 0 1 1.6-.9" fill="none" stroke="#fff" stroke-width="1.4"/>`,
    bubbles: `<circle cx="9" cy="14.5" r="5.6" fill="#bfe8f7"/><circle cx="16.6" cy="8.4" r="4.1" fill="#bfe8f7"/><circle cx="17.4" cy="17.4" r="2.6" fill="#bfe8f7"/><text x="9" y="16.6" font-size="5.6" font-weight="700" text-anchor="middle" fill="${N}" stroke="none">O2</text>`,
    power: `<path d="M13.6 2.2 4.6 13.4h6.1L9.6 21.8l9.9-12.4h-6.2z" fill="${POWER}"/>`,
    water: `<path d="M12 2.6C8.1 7.9 5.6 11.3 5.6 14.5a6.4 6.4 0 0 0 12.8 0c0-3.2-2.5-6.6-6.4-11.9z" fill="${WATERC}"/><path d="M8.8 14.6a3.2 3.2 0 0 0 2.3 3.1" fill="none" stroke="#fff" stroke-width="1.5"/>`,
    food: `<path d="M5 19.2C5 10.5 10.4 5.1 19.4 4.6 18.9 13.6 13.6 19.2 5 19.2z" fill="${FOOD}"/><path d="M5 19.2 13.2 11" fill="none"/>`,
    rad: `<circle cx="12" cy="12" r="10" fill="${RAD}"/><path d="M12 12 8.7 6.3a6.6 6.6 0 0 1 6.6 0z" fill="${N}" stroke="none"/><path d="M12 12h6.6a6.6 6.6 0 0 1-3.3 5.7z" fill="${N}" stroke="none"/><path d="M12 12l-3.3 5.7A6.6 6.6 0 0 1 5.4 12z" fill="${N}" stroke="none"/><circle cx="12" cy="12" r="1.9" fill="${CREAM}"/>`,
    rock: `<path d="M3.6 17.4 6.2 9.6 11.8 6l6.4 2.4 2.4 7.4-3.8 3.4H8z" fill="${ROCK}"/><path d="M11.8 6 10.4 12.2l-4.2-2.6M10.4 12.2l6.4-.8 1.4-3" fill="none" stroke-width="1.2"/>`,
    star: `<path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="${SUN}"/><path d="M9.6 8.6l.9-1.9" fill="none" stroke="#fff" stroke-width="1.4"/>`,
    ice: `<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z" fill="${ICE}"/><path d="M4 7.5 12 12l8-4.5M12 12v9" fill="none"/><path d="M7 9.6v3.8" fill="none" stroke="#fff" stroke-width="1.6"/>`,
    gear: `<path d="M10.3 2.5h3.4l.5 2.4 1.9.8 2-1.4 2.4 2.4-1.4 2 .8 1.9 2.4.5v3.4l-2.4.5-.8 1.9 1.4 2-2.4 2.4-2-1.4-1.9.8-.5 2.4h-3.4l-.5-2.4-1.9-.8-2 1.4-2.4-2.4 1.4-2-.8-1.9-2.4-.5v-3.4l2.4-.5.8-1.9-1.4-2 2.4-2.4 2 1.4 1.9-.8z" fill="${PROC}"/><circle cx="12" cy="12" r="3.3" fill="${CREAM}"/>`,
    book: `<path d="M2.8 5.4c3.1-1.4 6.2-1.4 9.2.6 3-2 6.1-2 9.2-.6v13.2c-3.1-1.4-6.2-1.4-9.2.6-3-2-6.1-2-9.2-.6z" fill="${CREAM}"/><path d="M12 6v13.2" fill="none"/><path d="M15.5 5.2v5.6l1.6-1.2 1.6 1.2V5.1" fill="${SKY}" stroke-width="1.2"/>`,
    helmet: `<circle cx="12" cy="11" r="8.6" fill="${WHITE}"/><rect x="6.4" y="7.4" width="11.2" height="7.2" rx="3.6" fill="${N}"/><path d="M8.6 9.6h3" fill="none" stroke="#7fd7ff" stroke-width="1.7"/><path d="M6.8 19.8h10.4" fill="none"/>`,
    hammer: `<g transform="rotate(45 12 12)"><rect x="10.5" y="8.4" width="3" height="14" rx="1.4" fill="#e5c39a"/><rect x="4.6" y="2.6" width="14.8" height="6.4" rx="2.2" fill="${STEEL}"/><path d="M6.4 4.4h4" stroke="#fff" stroke-width="1.4"/></g>`,
    clock: `<circle cx="12" cy="12" r="9" fill="${CREAM}"/><path d="M12 7v5.2l3.4 2.1" fill="none" stroke-width="1.9"/>`,
    question: `<circle cx="12" cy="12" r="10" fill="${SKY}"/><path d="M9.2 9.3a2.9 2.9 0 1 1 4.1 2.6c-.9.4-1.3 1-1.3 1.9v.6" fill="none" stroke-width="2.1"/><circle cx="12" cy="17.6" r="1.25" fill="${N}" stroke="none"/>`,
    speaker: `<path d="M4 9.2h3.6L12.6 5v14l-5-4.2H4z" fill="${CREAM}"/><path d="M15.6 9a4.3 4.3 0 0 1 0 6M18.2 6.6a7.8 7.8 0 0 1 0 10.8" fill="none" stroke-width="1.8"/>`,
    speakerOff: `<path d="M4 9.2h3.6L12.6 5v14l-5-4.2H4z" fill="${CREAM}"/><path d="M15.6 9.4l5 5.2M20.6 9.4l-5 5.2" fill="none" stroke-width="1.9"/>`,
    lamp: `<path d="M2.8 9.6h7.6l3-2.6v10l-3-2.6H2.8z" fill="${POWER}"/><path d="M15.6 8.4 21.4 6v12l-5.8-2.4" fill="#fff3b0"/>`,
    glasses: `<path d="M2.6 9.6h7.6c0 3.6-1.6 5.4-3.8 5.4S2.6 13.2 2.6 9.6zM13.8 9.6h7.6c0 3.6-1.6 5.4-3.8 5.4s-3.8-1.8-3.8-5.4z" fill="${N}"/><path d="M10.2 10.4h3.6M2.6 9.6 1.4 8.4M21.4 9.6l1.2-1.2" fill="none"/><path d="M4.2 11l1.6-.6" fill="none" stroke="#7fd7ff" stroke-width="1.3"/>`,
    patch: `<rect x="2.4" y="8.4" width="19.2" height="7.2" rx="3.6" transform="rotate(-35 12 12)" fill="#ffd9b8"/><rect x="8.6" y="9.5" width="6.8" height="5" rx="1.2" transform="rotate(-35 12 12)" fill="${CREAM}" stroke-width="1.2"/>`,
    door: `<path d="M6 21V7.5a6 6 0 0 1 12 0V21z" fill="${STEEL}"/><circle cx="12" cy="8.6" r="2.4" fill="#bfe8f7"/><circle cx="15.2" cy="14.4" r="1.1" fill="${N}" stroke="none"/><path d="M3.5 21h17" fill="none"/>`,
    sock: `<path d="M8.8 2.6h6.2v9.6l3.4 3.4a3.6 3.6 0 0 1-5.1 5.1l-5.3-5.3a3.6 3.6 0 0 1 .8-1.4V2.6z" fill="#ff9bd2"/><path d="M8.8 6.2h6.2" fill="none"/>`,
    duck: `<path d="M5 13.6c0 4 3.2 6.4 7.6 6.4s7.4-2.4 7.4-5.6c0-2.2-1.4-3.6-3.4-3.6h-2a4.6 4.6 0 1 0-8.2 2.8H5z" fill="${SUN}"/><path d="M4.4 9.2H1.8l1.4 2h2.2" fill="#ffc2a1"/><circle cx="9.1" cy="7.1" r="1" fill="${N}" stroke="none"/><path d="M11 14.6c1.6 1.4 4 1.4 5.6 0" fill="none" stroke-width="1.3"/>`,
    shield: `<path d="M12 2.6 4.4 5.6v6c0 4.6 3.2 8.4 7.6 9.8 4.4-1.4 7.6-5.2 7.6-9.8v-6z" fill="${RAD}"/><path d="M8.6 12.1l2.4 2.4 4.4-4.6" fill="none" stroke="${CREAM}" stroke-width="2.2"/>`,
    pick: `<path d="M5 20.4 14.6 10.8" fill="none" stroke-width="3.6"/><path d="M5 20.4 14.6 10.8" fill="none" stroke="#e5c39a" stroke-width="1.8"/><path d="M8.6 4.8c4-1.6 8.6-.6 11.2 2.4l-1.6 1.6c-2.2-1.8-5.2-2.6-8.2-2.2z" fill="${STEEL}"/>`,
    panel: `<path d="M12 14.6V21M8 21h8" fill="none"/><path d="M3.2 6.8 20 4.4l.8 9.6L4 15.4z" fill="${POWER}"/><path d="M11.6 5.6l.4 9.2M3.6 11 20.4 9.2" fill="none" stroke="#3f4fc0" stroke-width="1.2"/>`,
    eye: `<path d="M1.8 12C4.4 7.6 8 5.6 12 5.6s7.6 2 10.2 6.4C19.6 16.4 16 18.4 12 18.4S4.4 16.4 1.8 12z" fill="#fff"/><circle cx="12" cy="12" r="3.6" fill="${AIR}"/><circle cx="12" cy="12" r="1.5" fill="${N}" stroke="none"/>`,
    dome: `<path d="M3 18.6a9 9 0 0 1 18 0z" fill="#cdeefa"/><path d="M2 18.6h20v2.4H2z" fill="${STEEL}"/><path d="M10 18.6v-3.4a2 2 0 0 1 4 0v3.4" fill="${STEEL}"/><path d="M7.4 12.4a5 5 0 0 1 2.6-2.6" fill="none" stroke="#fff" stroke-width="1.4"/>`,
    glove: `<path d="M7 21v-4.8L4.4 12.6a1.8 1.8 0 0 1 2.8-2.2L8.6 12V5.2a1.7 1.7 0 0 1 3.4 0V4a1.7 1.7 0 0 1 3.4 0v1.6a1.7 1.7 0 0 1 3.4 0V15c0 2.6-1.6 4.4-3.6 4.8V21z" fill="${WHITE}"/><path d="M12 5v5.4M15.4 5.6v4.8" fill="none" stroke-width="1.2"/>`,
    hourglass: `<path d="M6 2.8h12M6 21.2h12" fill="none" stroke-width="2"/><path d="M7 2.8h10c0 4.2-3 6.2-4.2 9.2 1.2 3 4.2 5 4.2 9.2H7c0-4.2 3-6.2 4.2-9.2C10 9 7 7 7 2.8z" fill="${CREAM}"/><path d="M9.2 19.6c.8-1.6 1.8-2.4 2.8-2.6 1 .2 2 1 2.8 2.6z" fill="${SUN}" stroke="none"/>`,
    bulb: `<path d="M8.4 15.6c-1.6-1.3-2.6-3.2-2.6-5.3a6.2 6.2 0 0 1 12.4 0c0 2.1-1 4-2.6 5.3V18H8.4z" fill="#fff3b0"/><path d="M9.2 20.8h5.6M10 15.4l-1-4 2 1 1-2 1 2 2-1-1 4" fill="none" stroke-width="1.3"/>`,
    flame: `<path d="M12 2.6c1 3.6 5.8 5.6 5.8 11a5.8 5.8 0 0 1-11.6 0c0-2.8 1.4-4.4 2.6-5.6.2 1.8 1 2.8 2 3.2-.6-3.2.2-6 1.2-8.6z" fill="${SUN}"/><path d="M12 13.4c1.4 1.2 2.4 2.4 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1.4.8-2.6 2.4-4z" fill="#ff9bd2"/>`,
    fan: `<circle cx="12" cy="12" r="9.6" fill="#bfe8f7"/><path d="M12 12c-1.4-3.6-.4-6.4 1.8-6.4 1.6 0 2 2.6-1.8 6.4zM12 12c3.8.6 5.6 3 4.4 4.8-.8 1.4-3.2.4-4.4-4.8zM12 12c-2.4 3-5.4 3.4-6.2 1.4-.6-1.6 1.6-3 6.2-1.4z" fill="${CREAM}"/><circle cx="12" cy="12" r="1.6" fill="${N}" stroke="none"/>`,
    candy: `<path d="M7.4 8.6 3 6.2v11.6l4.4-2.4M16.6 8.6 21 6.2v11.6l-4.4-2.4" fill="#ff9bd2"/><ellipse cx="12" cy="12" rx="5.6" ry="4.6" fill="${PINK}"/><path d="M9.6 9.6c1.4.8 3.4 3.8 4.8 4.8" fill="none" stroke="#fff" stroke-width="1.6"/>`,
    sprout: `<path d="M12 21v-8" fill="none" stroke-width="1.9"/><path d="M12 13.4C12 8.6 8.4 6 3.8 6.4c-.2 4.4 3.2 7.4 8.2 7z" fill="${FOOD}"/><path d="M12 11.6c0-4.4 3.2-7 7.8-6.8.2 4.2-3 7-7.8 6.8z" fill="#8fd1b9"/><path d="M6.4 21h11.2" fill="none" stroke-width="2"/>`,
    sun: `<circle cx="12" cy="12" r="5" fill="${SUN}"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1" fill="none" stroke-width="1.9"/>`,
    moon: `<path d="M19.6 15.2A8.4 8.4 0 1 1 9.2 3.6a6.8 6.8 0 0 0 10.4 11.6z" fill="#e4e6ef"/><circle cx="9.6" cy="14" r="1.5" fill="${ROCK}" stroke="none"/><circle cx="13.6" cy="17.4" r="1" fill="${ROCK}" stroke="none"/>`,
    dust: `<circle cx="7.6" cy="14" r="4.4" fill="#d9d4c7"/><circle cx="13.4" cy="10.4" r="5" fill="#e8e3d6"/><circle cx="17.2" cy="15.2" r="3.8" fill="#d9d4c7"/><path d="M3 20h18" fill="none"/>`,
    wind: `<path d="M3 8.6h10.6a2.8 2.8 0 1 0-2.8-2.8M3 13.2h15a3 3 0 1 1-3 3M3 17.6h6.4" fill="none" stroke-width="2"/>`,
    arm: `<path d="M3.4 16.4c0-3.8 2-6.4 4.6-7.2l1.6 2.6-1.6 1.8c1.2 1 3 1.4 4.8 1l1-3.4 3.2.6c1.2 3.6-.6 7.6-5 8.4H7.8c-2.6 0-4.4-1.4-4.4-3.8z" fill="${WHITE}"/><path d="M18.6 4.4l1.6-1.6M20.2 8l2-.4M16.4 3l.2-1.6" fill="none" stroke-width="1.5"/>`,
    zzz: `<path d="M3.4 9.6h5.4l-5.4 6.4h5.4M11.4 5.2h4.4l-4.4 5h4.4M16.6 13h4l-4 4.6h4" fill="none" stroke-width="1.9"/>`,
    trash: `<path d="M5.4 7.4h13.2l-1.2 13.2H6.6z" fill="${STEEL}"/><path d="M3.6 7.4h16.8M9.6 7.4V4.6h4.8v2.8M9.8 11v6.4M14.2 11v6.4" fill="none"/>`,
    recycle: `<path d="M7.4 9.4 10 5a2.4 2.4 0 0 1 4.1 0l1.3 2.2M18.4 11.6l1.5 2.6a2.4 2.4 0 0 1-2 3.6h-3.2M9.8 17.8H6.4a2.4 2.4 0 0 1-2.1-3.6l1.6-2.8" fill="none" stroke="${WATERC}" stroke-width="2.6"/><path d="M15.4 4.6l.4 3-3 .2M14.6 20l-2.2-2.2 2.2-2.2M3.6 11.4l2.6-1.4 1.2 2.8" fill="none" stroke-width="1.6"/>`,
    co2: `<path d="M6.4 18.6a4.4 4.4 0 0 1-.6-8.8 6 6 0 0 1 11.4-1.4 4.6 4.6 0 0 1 .8 9.2z" fill="#dfe3ee"/><text x="12" y="15.8" font-size="6" font-weight="700" text-anchor="middle" fill="${N}" stroke="none">CO2</text>`,
    flower: `<circle cx="12" cy="6.6" r="3.4" fill="#ff9bd2"/><circle cx="17" cy="10.4" r="3.4" fill="#ff9bd2"/><circle cx="15.2" cy="16" r="3.4" fill="#ff9bd2"/><circle cx="8.8" cy="16" r="3.4" fill="#ff9bd2"/><circle cx="7" cy="10.4" r="3.4" fill="#ff9bd2"/><circle cx="12" cy="11.6" r="2.6" fill="${SUN}"/>`,
    meteor: `<path d="M3 3.6l8.4 6.4M5.8 2.4l7.2 6M2.4 7l7.8 5" fill="none" stroke="#ffd9b8" stroke-width="2"/><circle cx="15.6" cy="15.2" r="6" fill="${ROCK}"/><circle cx="14" cy="13.6" r="1.4" fill="#8a8fa6" stroke="none"/><circle cx="17.6" cy="17" r="1.1" fill="#8a8fa6" stroke="none"/>`,
    home: `<path d="M3.4 11.2 12 3.6l8.6 7.6" fill="none" stroke-width="2"/><path d="M5.6 9.8V20h4.6v-5.2h3.6V20h4.6V9.8" fill="${CREAM}"/>`,
    play: `<path d="M7.4 4.6v14.8L19.4 12z" fill="${SKY}"/>`,
    pause: `<rect x="6" y="4.6" width="4.2" height="14.8" rx="1.4" fill="${CREAM}"/><rect x="13.8" y="4.6" width="4.2" height="14.8" rx="1.4" fill="${CREAM}"/>`,
    close: `<path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" fill="none" stroke-width="2.6"/>`,
    plus: `<circle cx="12" cy="12" r="9.6" fill="${SKY}"/><path d="M12 7.4v9.2M7.4 12h9.2" fill="none" stroke="${N}" stroke-width="2.4"/>`,
    up: `<path d="M12 3.4 4.4 11.4h4.8v9.2h5.6v-9.2h4.8z" fill="${SKY}"/>`,
    lock: `<rect x="5" y="10.4" width="14" height="10.4" rx="2.6" fill="${STEEL}"/><path d="M8.2 10.4V8a3.8 3.8 0 0 1 7.6 0v2.4" fill="none" stroke-width="1.9"/><circle cx="12" cy="15.4" r="1.4" fill="${N}" stroke="none"/>`,
    refresh: `<path d="M19.2 12a7.2 7.2 0 1 1-2.1-5.1" fill="none" stroke-width="2.2"/><path d="M19.6 3.6v4.6H15" fill="none" stroke-width="2.2"/>`,
    rocket: `<path d="M12 2.6c3.4 2.4 5 6 5 10.4l-2 3.4H9l-2-3.4c0-4.4 1.6-8 5-10.4z" fill="${WHITE}"/><circle cx="12" cy="9.6" r="2.1" fill="${AIR}"/><path d="M7 13l-3 3.6 3.6.4M17 13l3 3.6-3.6.4" fill="${POWER}"/><path d="M10.4 16.6 12 21.2l1.6-4.6" fill="#ffd9b8"/>`,
    sparkle: `<path d="M12 2.6l2.2 6.4 6.4 2.2-6.4 2.2L12 19.8l-2.2-6.4-6.4-2.2 6.4-2.2z" fill="${SUN}"/><path d="M19 17.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="${SUN}" stroke-width="1.1"/>`,
    idea: `<path d="M8.4 15.4c-1.6-1.3-2.6-3.2-2.6-5.3a6.2 6.2 0 0 1 12.4 0c0 2.1-1 4-2.6 5.3v2.4H8.4z" fill="#fff3b0"/><path d="M9.2 20.6h5.6" fill="none" stroke-width="1.8"/><path d="M12 6.6v3.6" fill="none" stroke-width="1.8"/><circle cx="12" cy="12.8" r=".9" fill="${N}" stroke="none"/>`,
    like: `<circle cx="7.6" cy="12" r="5.2" fill="${CREAM}"/><circle cx="16.4" cy="12" r="5.2" fill="#bfe8f7" fill-opacity=".85"/><path d="M11.4 10.6h1.2M11.4 13.4h1.2" fill="none" stroke-width="1.6"/>`,
    warn: `<path d="M12 3 22 20.4H2z" fill="${CREAM}"/><path d="M12 9.4v5.4" fill="none" stroke-width="2.4"/><circle cx="12" cy="17.6" r="1.3" fill="${N}" stroke="none"/>`,
    bag: `<path d="M5.4 9h13.2l-1.4 11.6H6.8z" fill="#e5c39a"/><path d="M8.6 9V7.2a3.4 3.4 0 0 1 6.8 0V9" fill="none" stroke-width="1.8"/>`,
    battery: `<rect x="5.6" y="5" width="12.8" height="16.4" rx="3" fill="${POWER}"/><rect x="9" y="2.4" width="6" height="3" rx="1" fill="${STEEL}"/><path d="M12.9 8.2 9.4 13.4h2.8l-1.1 4 3.6-5.2h-2.8z" fill="${SUN}" stroke-width="1.2"/>`,
    tick: `<path d="M4.6 12.6l4.6 4.6L19.6 6.8" fill="none" stroke-width="3"/>`,
    link: `<path d="M9.6 14.4l4.8-4.8M10.8 6.6l1.8-1.8a3.8 3.8 0 0 1 5.4 5.4l-1.8 1.8M13.2 17.4l-1.8 1.8a3.8 3.8 0 0 1-5.4-5.4l1.8-1.8" fill="none" stroke-width="2"/>`
  };

  function icon(name, cls) {
    const body = ICONS[name] || ICONS.question;
    return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g ${S}>${body}</g></svg>`;
  }

  // Status icons for meters only. Shape + colour, never colour alone.
  const STATUS = {
    ok: '#10b981', caution: '#f59e0b', warning: '#f97316', critical: '#ef4444'
  };
  function statusIcon(level, size) {
    const c = STATUS[level] || STATUS.ok;
    let body;
    if (level === 'caution') body = `<path d="M12 2.6 22.4 20.6H1.6z" fill="${c}" stroke="${N}" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 9v5.4" stroke="${N}" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.3" fill="${N}"/>`;
    else if (level === 'warning') body = `<circle cx="12" cy="12" r="10" fill="${c}" stroke="${N}" stroke-width="1.4"/><path d="M12 6.4v7.2" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.6" fill="#fff"/>`;
    else if (level === 'critical') body = `<circle cx="12" cy="12" r="10" fill="${c}" stroke="${N}" stroke-width="1.4"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>`;
    else body = `<circle cx="12" cy="12" r="10" fill="${c}" stroke="${N}" stroke-width="1.4"/><path d="M7.4 12.4l3 3 6.2-6.4" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    const wh = size ? ` width="${size}" height="${size}" x="${-size / 2}" y="${-size / 2}"` : '';
    return `<svg class="sico"${wh} viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  }
  function statusColor(level) { return STATUS[level] || STATUS.ok; }

  // ---------------------------------------------------------------- mascot: Orbi the robot astronaut
  function mascot(mood) {
    const E = '#7ff3ff';
    const eye = { s: `stroke="${E}" stroke-width="3.6" stroke-linecap="round" fill="none"` };
    let eyes, mouth, extra = '', armL, armR;
    armL = 'M37 74 Q26 80 23 90';
    armR = 'M83 74 Q94 80 97 90';
    switch (mood) {
      case 'cheer':
        eyes = `<path d="M47 43 q4.5 -6 9 0" ${eye.s}/><path d="M64 43 q4.5 -6 9 0" ${eye.s}/>`;
        mouth = `<path d="M51 48 h18 q0 9 -9 9 q-9 0 -9 -9 z" fill="${E}"/>`;
        armL = 'M37 72 Q26 62 22 50'; armR = 'M83 72 Q94 62 98 50';
        extra = `<g class="m-stars"><path d="M14 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="${SUN}" stroke="${N}" stroke-width="1.5"/><path d="M104 24l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="${SUN}" stroke="${N}" stroke-width="1.5"/></g>`;
        break;
      case 'worried':
        eyes = `<circle cx="51" cy="43" r="3.6" fill="${E}"/><circle cx="69" cy="43" r="3.6" fill="${E}"/><path d="M45 35 l9 3" ${eye.s} stroke-width="3"/><path d="M75 35 l-9 3" ${eye.s} stroke-width="3"/>`;
        mouth = `<path d="M51 53 q4.5 -3.5 9 0 q4.5 3.5 9 0" ${eye.s} stroke-width="3.2"/>`;
        break;
      case 'sad':
        eyes = `<path d="M47 41 q4.5 5 9 0" ${eye.s}/><path d="M64 41 q4.5 5 9 0" ${eye.s}/>`;
        mouth = `<path d="M52 55 q8 -6.5 16 0" ${eye.s} stroke-width="3.2"/>`;
        extra = `<path d="M47 48 q-1.8 3 0 4.6 q1.8 -1.6 0 -4.6z" fill="${E}"/>`;
        armL = 'M37 76 Q30 86 31 96'; armR = 'M83 76 Q90 86 89 96';
        break;
      case 'surprised':
        eyes = `<circle cx="51" cy="42" r="5" fill="none" stroke="${E}" stroke-width="3"/><circle cx="69" cy="42" r="5" fill="none" stroke="${E}" stroke-width="3"/>`;
        mouth = `<circle cx="60" cy="53" r="3.6" fill="none" stroke="${E}" stroke-width="3"/>`;
        armL = 'M37 72 Q24 70 20 62'; armR = 'M83 72 Q96 70 100 62';
        break;
      case 'point':
        eyes = `<circle cx="51" cy="42" r="3.6" fill="${E}"/><circle cx="69" cy="42" r="3.6" fill="${E}"/>`;
        mouth = `<path d="M52 50 q8 6 16 0" ${eye.s} stroke-width="3.2"/>`;
        armR = 'M83 72 Q98 66 108 58';
        break;
      case 'happy':
        eyes = `<path d="M47 44 q4.5 -5.5 9 0" ${eye.s}/><path d="M64 44 q4.5 -5.5 9 0" ${eye.s}/>`;
        mouth = `<path d="M52 50 q8 6.5 16 0" ${eye.s} stroke-width="3.2"/>`;
        break;
      default: // neutral
        eyes = `<circle cx="51" cy="43" r="3.6" fill="${E}"/><circle cx="69" cy="43" r="3.6" fill="${E}"/>`;
        mouth = `<path d="M54 51 h12" ${eye.s} stroke-width="3.2"/>`;
    }
    return `<svg class="mascot mood-${mood || 'neutral'}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <g stroke="${N}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="27" y="62" width="66" height="34" rx="12" fill="${STEEL}"/>
        <path class="m-flame" d="M44 96 q4 12 8 0 M68 96 q4 12 8 0" fill="#fff3b0" stroke-width="2.4"/>
        <path d="${armL}" fill="none" stroke-width="9"/><path d="${armL}" fill="none" stroke="${CREAM}" stroke-width="4.6"/>
        <path d="${armR}" fill="none" stroke-width="9"/><path d="${armR}" fill="none" stroke="${CREAM}" stroke-width="4.6"/>
        <rect x="37" y="62" width="46" height="40" rx="15" fill="${CREAM}"/>
        <circle cx="60" cy="82" r="7" fill="${SKY}" stroke-width="2.6"/>
        <path d="M60 12 V5" fill="none"/><circle cx="60" cy="5" r="4.6" fill="${PINK}" stroke-width="2.4"/>
        <circle cx="30" cy="42" r="5.4" fill="${STEEL}" stroke-width="2.6"/><circle cx="90" cy="42" r="5.4" fill="${STEEL}" stroke-width="2.6"/>
        <circle cx="60" cy="42" r="30" fill="#e9f4ff"/>
        <rect x="38" y="28" width="44" height="31" rx="13" fill="${N}" stroke="none"/>
        <path d="M40 22 q8 -8 18 -9" fill="none" stroke="#fff" stroke-width="3.4" opacity=".85"/>
      </g>
      ${eyes}${mouth}${extra}
    </svg>`;
  }

  // ---------------------------------------------------------------- buildings (origin = bottom centre)
  const O = `stroke="${N}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  function bSolar() {
    return `<g ${O}>
      <ellipse cx="0" cy="0" rx="34" ry="6" fill="#8d91a8" stroke="none"/>
      <rect x="-6" y="-60" width="12" height="58" rx="5" fill="${STEEL}"/>
      <rect x="-20" y="-10" width="40" height="11" rx="5" fill="${STEEL}"/>
      <g transform="translate(0,-70) rotate(-12)">
        <rect x="-45" y="-25" width="90" height="44" rx="9" fill="${POWER}"/>
        <path d="M-45 -3 H45 M-22 -25 V19 M0 -25 V19 M22 -25 V19" fill="none" stroke="#4d5fd1" stroke-width="2.4"/>
        <path d="M-38 -19 L-27 -19 L-35 12 L-41 12 Z" fill="#fff" stroke="none" opacity=".35"/>
      </g>
      <g class="glint"><path d="M30 -96 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fff" stroke="none"/></g>
    </g>`;
  }
  function bBattery() {
    return `<g ${O}>
      <ellipse cx="0" cy="0" rx="34" ry="6" fill="#8d91a8" stroke="none"/>
      <rect x="-13" y="-104" width="26" height="14" rx="5" fill="${STEEL}"/>
      <rect x="-32" y="-94" width="64" height="92" rx="16" fill="${POWER}"/>
      <rect x="-20" y="-82" width="40" height="18" rx="6" class="cell c3" fill="${CREAM}"/>
      <rect x="-20" y="-60" width="40" height="18" rx="6" class="cell c2" fill="${CREAM}"/>
      <rect x="-20" y="-38" width="40" height="18" rx="6" class="cell c1" fill="${CREAM}"/>
      <path d="M3 -78 -6 -64 h6 l-3 12 10 -15 h-6 z" fill="${SUN}" stroke-width="2"/>
      <path d="M-25 -86 v30" fill="none" stroke="#fff" stroke-width="3" opacity=".45"/>
    </g>`;
  }
  function bOxygen() {
    return `<g ${O}>
      <ellipse cx="0" cy="0" rx="34" ry="6" fill="#8d91a8" stroke="none"/>
      <rect x="-36" y="-12" width="72" height="12" rx="5" fill="${STEEL}"/>
      <rect x="-28" y="-98" width="56" height="88" rx="27" fill="${AIR}"/>
      <circle cx="0" cy="-58" r="16" fill="#e8f8ff"/>
      <text x="0" y="-52" font-size="15" font-weight="700" text-anchor="middle" fill="${N}" stroke="none">O2</text>
      <path d="M28 -40 h10 v-24" fill="none" stroke-width="5"/><path d="M28 -40 h10 v-24" fill="none" stroke="${STEEL}" stroke-width="2"/>
      <path d="M-20 -88 q-4 18 0 38" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
      <g class="bubbles-up"><circle cx="38" cy="-72" r="5" fill="#e8f8ff" stroke-width="2"/><circle cx="44" cy="-90" r="3.6" fill="#e8f8ff" stroke-width="2"/><circle cx="34" cy="-104" r="2.6" fill="#e8f8ff" stroke-width="2"/></g>
    </g>`;
  }
  function bCo2() {
    return `<g ${O}>
      <ellipse cx="0" cy="0" rx="36" ry="6" fill="#8d91a8" stroke="none"/>
      <rect x="-38" y="-80" width="76" height="76" rx="14" fill="#8fd3ee"/>
      <rect x="-30" y="-96" width="60" height="18" rx="6" fill="${STEEL}"/>
      <path d="M-20 -94 v14 M-10 -94 v14 M0 -94 v14 M10 -94 v14 M20 -94 v14" fill="none" stroke-width="2.2"/>
      <circle cx="0" cy="-42" r="24" fill="#e8f8ff"/>
      <g class="spin" style="transform-origin:0px -42px"><path d="M0 -42 c-3 -9 -1 -17 5 -17 c4 0 5 7 -5 17 z M0 -42 c9 2 14 8 11 12 c-2 4 -8 1 -11 -12 z M0 -42 c-6 7 -14 8 -16 3 c-2 -4 5 -8 16 -3 z" fill="${AIR}" stroke-width="2.2"/></g>
      <circle cx="0" cy="-42" r="4" fill="${N}" stroke="none"/>
    </g>`;
  }
  function bWater() {
    return `<g ${O}>
      <ellipse cx="0" cy="0" rx="36" ry="6" fill="#8d91a8" stroke="none"/>
      <rect x="-36" y="-88" width="72" height="84" rx="20" fill="#d4f0fb"/>
      <path d="M-35 -46 q9 -7 18 0 t18 0 t17 0 V-24 q0 20 -20 20 h-14 q-20 0 -20 -20 z" fill="${AIR}" stroke="none"/>
      <rect x="-36" y="-88" width="72" height="84" rx="20" fill="none"/>
      <g transform="translate(0,-60)"><path d="M-14 -2 a14 14 0 0 1 22 -10 M14 2 a14 14 0 0 1 -22 10" fill="none" stroke-width="3.4"/><path d="M8 -18 l1 6 -6 1 M-8 18 l-1 -6 6 -1" fill="none" stroke-width="3"/><path d="M0 -6 c-3 4 -5 6.4 -5 8.6 a5 5 0 0 0 10 0 c0 -2.2 -2 -4.6 -5 -8.6z" fill="${WATERC}" stroke-width="2"/></g>
      <path d="M-26 -78 v24" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
    </g>`;
  }
  function bGreenhouse(grown) {
    const s = grown ? 1 : 0.62;
    const plant = (x, k) => `<g transform="translate(${x},-14) scale(${s * k})"><path d="M0 0 V-22" fill="none" stroke="#3d7f6a" stroke-width="3"/><path d="M0 -14 C0 -26 -10 -32 -20 -30 C-20 -20 -12 -12 0 -14 z" fill="${FOOD}" stroke-width="2.4"/><path d="M0 -18 C0 -30 9 -36 19 -34 C19 -24 11 -17 0 -18 z" fill="#8fd1b9" stroke-width="2.4"/></g>`;
    return `<g ${O}>
      <ellipse cx="0" cy="0" rx="46" ry="6" fill="#8d91a8" stroke="none"/>
      <rect x="-46" y="-16" width="92" height="16" rx="6" fill="#a98763"/>
      <path d="M-44 -16 A44 44 0 0 1 44 -16 Z" fill="#dff6ff" fill-opacity=".92"/>
      <path d="M-44 -16 A44 44 0 0 1 44 -16" fill="none" stroke="#ff9bd2" stroke-width="2" opacity=".0" class="led"/>
      ${plant(-22, 0.9)}${plant(2, 1.1)}${plant(24, 0.85)}
      <path d="M-44 -16 A44 44 0 0 1 44 -16 Z" fill="none"/>
      <path d="M0 -60 V-16 M-31 -47 Q-20 -30 -22 -16 M31 -47 Q20 -30 22 -16" fill="none" stroke-width="2.2"/>
      <path d="M-30 -42 q6 -12 18 -16" fill="none" stroke="#fff" stroke-width="3.4" opacity=".8"/>
      <rect x="-24" y="-66" width="48" height="6" rx="3" fill="#ff9bd2" stroke-width="2"/>
    </g>`;
  }
  function bProcessor(active) {
    return `<g ${O} class="${active ? 'proc-on' : ''}">
      <ellipse cx="0" cy="0" rx="44" ry="6" fill="#8d91a8" stroke="none"/>
      <path d="M-44 -66 h26 l-6 -18 h-30 z" fill="${STEEL}"/>
      <rect x="-44" y="-68" width="88" height="64" rx="12" fill="${PROC}"/>
      <rect x="16" y="-100" width="18" height="34" rx="5" fill="${STEEL}"/>
      <g class="puffs"><circle cx="25" cy="-110" r="7" fill="#eef0f6" stroke-width="2"/><circle cx="34" cy="-124" r="5" fill="#eef0f6" stroke-width="2"/></g>
      <g class="spin" style="transform-origin:-12px -38px"><path d="M-16 -56 h8 l1 5 4 2 4 -3 6 6 -3 4 2 4 5 1 v8 l-5 1 -2 4 3 4 -6 6 -4 -3 -4 2 -1 5 h-8 l-1 -5 -4 -2 -4 3 -6 -6 3 -4 -2 -4 -5 -1 v-8 l5 -1 2 -4 -3 -4 6 -6 4 3 4 -2 z" fill="${CREAM}" stroke-width="2.4"/><circle cx="-12" cy="-38" r="5" fill="${PROC}" stroke-width="2.4"/></g>
      <rect x="12" y="-52" width="24" height="18" rx="5" fill="#2a3570"/>
      <circle cx="18" cy="-43" r="3" class="lamp-a" fill="#7ff3ff" stroke="none"/><circle cx="29" cy="-43" r="3" fill="${PINK}" stroke="none"/>
      <rect x="-36" y="-16" width="72" height="8" rx="4" fill="${STEEL}" stroke-width="2.2"/>
    </g>`;
  }
  function bShelter() {
    return `<g ${O}>
      <path d="M-48 0 Q-48 -86 0 -88 Q48 -86 48 0 Z" fill="#a3a7bb"/>
      <circle cx="-28" cy="-40" r="5" fill="#8f94aa" stroke="none"/><circle cx="26" cy="-56" r="6" fill="#8f94aa" stroke="none"/><circle cx="-10" cy="-70" r="4" fill="#8f94aa" stroke="none"/><circle cx="32" cy="-22" r="4" fill="#8f94aa" stroke="none"/>
      <path d="M-16 0 V-30 a16 16 0 0 1 32 0 V0 z" fill="${RAD}"/>
      <circle cx="9" cy="-14" r="2.4" fill="${N}" stroke="none"/>
      <g transform="translate(0,-62) scale(1.05)"><path d="M0 -14 -11 -10 v8 c0 7 5 12 11 14 c6 -2 11 -7 11 -14 v-8 z" fill="${RAD}" stroke-width="2.4"/><path d="M-5 -1 l3.5 3.5 6 -6.5" fill="none" stroke="${CREAM}" stroke-width="2.8"/></g>
      <path class="shield-glow" d="M-60 2 Q-60 -110 0 -112 Q60 -110 60 2" fill="${RAD}" fill-opacity=".18" stroke="${RAD}" stroke-width="3" stroke-dasharray="8 6" opacity="0"/>
    </g>`;
  }
  const BUILDERS = { solar: bSolar, battery: bBattery, oxygen: bOxygen, co2: bCo2, water: bWater, greenhouse: bGreenhouse, processor: bProcessor, shelter: bShelter };

  function lvBadge(label) {
    const safe = String(label).replace(/[&<>"']/g, '');
    return `<g class="lvbadge" transform="translate(30,-112)"><rect x="-22" y="-14" width="44" height="26" rx="10" fill="${CREAM}" stroke="${N}" stroke-width="2.4"/><text x="0" y="5" font-size="15" font-weight="700" text-anchor="middle" fill="${N}">${safe}</text></g>`;
  }
  function building(type, lv, opts) {
    opts = opts || {};
    const f = BUILDERS[type];
    if (!f) return '';
    const scale = lv >= 3 ? 1.1 : lv === 2 ? 1.05 : 1;
    return `<g class="bld bld-${type}" data-type="${type}"><g transform="scale(${scale})">${f(opts.grown || lv > 1)}</g>${lv ? lvBadge(opts.lvText || lv) : ''}</g>`;
  }
  function buildingSvg(type) {
    return `<svg class="bsvg" viewBox="-60 -128 120 136" aria-hidden="true" focusable="false">${building(type, 0)}</svg>`;
  }

  // ---------------------------------------------------------------- astronaut (origin = feet)
  function astronaut() {
    return `<g id="astro" transform="translate(690,580)">
      <g id="astroBody">
        <g class="lampbeam"><path d="M14 -70 L120 -104 L120 -30 Z" fill="url(#beam)"/></g>
        <g ${O}>
          <rect x="-26" y="-60" width="15" height="32" rx="6" fill="#d7dbe8"/>
          <g class="leg legL"><rect x="-12" y="-27" width="11" height="24" rx="5" fill="${WHITE}"/><rect x="-14" y="-8" width="15" height="9" rx="4" fill="#5b6490"/></g>
          <g class="leg legR"><rect x="2" y="-27" width="11" height="24" rx="5" fill="${WHITE}"/><rect x="0" y="-8" width="15" height="9" rx="4" fill="#5b6490"/></g>
          <rect x="-17" y="-52" width="34" height="30" rx="12" fill="${WHITE}"/>
          <rect x="-6" y="-45" width="12" height="9" rx="3" fill="${SKY}" stroke-width="2"/>
          <g class="arm armF"><rect x="9" y="-49" width="10" height="24" rx="5" fill="${WHITE}"/>
            <g class="shovel"><path d="M14 -28 L34 -6" fill="none" stroke-width="5"/><path d="M14 -28 L34 -6" fill="none" stroke="#e5c39a" stroke-width="2.4"/><path d="M30 -10 l12 -4 4 12 -10 6 z" fill="${STEEL}"/></g>
          </g>
          <circle cx="0" cy="-67" r="21" fill="${WHITE}"/>
          <rect x="-12" y="-77" width="26" height="19" rx="9" fill="${N}"/>
          <path d="M-6 -72 h6" fill="none" stroke="#7fd7ff" stroke-width="3"/>
          <circle cx="15" cy="-84" r="4.6" fill="#fff3b0" stroke-width="2.4"/>
        </g>
      </g>
      <g id="o2ring" transform="translate(0,-118)" class="hide">
        <circle r="24" fill="${CREAM}" stroke="${N}" stroke-width="2.6"/>
        <circle r="18" fill="none" stroke="#ece3cc" stroke-width="7"/>
        <circle id="o2arc" r="18" fill="none" stroke="${STATUS.ok}" stroke-width="7" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="113.1" stroke-dashoffset="0"/>
        <g transform="translate(-8,-8) scale(.68)"><g ${S}>${ICONS.air}</g></g>
        <g id="o2stat" transform="translate(12,-30)"></g>
      </g>
    </g>`;
  }

  // ---------------------------------------------------------------- scene
  // Fixed star field (a tiny deterministic generator, so it never changes between visits).
  function stars() {
    let seed = 7, out = '';
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 80; i++) {
      const x = Math.round(rnd() * 1280), y = Math.round(70 + rnd() * 400);
      if (x > 80 && x < 230 && y > 100 && y < 260) continue;      // keep the Sun clear
      if (x > 1040 && x < 1180 && y > 100 && y < 250) continue;   // and Earth
      const r = (0.8 + rnd() * 1.8).toFixed(1);
      const tw = i % 3 === 0 ? ` class="tw" style="animation-delay:${(i % 7) * 0.45}s"` : '';
      out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff8e8"${tw}/>`;
    }
    out += `<path class="tw" style="animation-delay:.8s" d="M420 120 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff8e8"/>`;
    out += `<path class="tw" style="animation-delay:2s" d="M900 300 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z" fill="#fff8e8"/>`;
    return out;
  }

  const SLOT_X = [330, 438, 546, 834, 942, 1050];
  const GROUND = 580;
  const DOME_X = 690;
  const SPOTS = [{ x: 226, y: 566 }, { x: 182, y: 553 }, { x: 138, y: 545 }, { x: 94, y: 553 }];
  const ICES = [{ x: 1150, y: 618 }, { x: 1192, y: 624 }, { x: 1234, y: 618 }];

  function slotsSvg() {
    return SLOT_X.map((x, i) => `<g class="slot" id="slot${i}" data-slot="${i}" transform="translate(${x},${GROUND})">
      <ellipse class="pad" cx="0" cy="2" rx="46" ry="10" fill="#9ea2b6" stroke="${N}" stroke-width="2.4" stroke-dasharray="7 6"/>
      <g class="plus" transform="translate(0,-26)"><circle r="17" fill="${SKY}" stroke="${N}" stroke-width="3"/><path d="M0 -8 V8 M-8 0 H8" stroke="${N}" stroke-width="3.6" stroke-linecap="round"/></g>
      <g class="bwrap" id="bw${i}"></g>
      <g class="ring hide" id="ring${i}" transform="translate(0,-56)">
        <circle r="36" fill="${CREAM}" stroke="${N}" stroke-width="3"/>
        <circle r="28" fill="none" stroke="#ece3cc" stroke-width="9"/>
        <circle class="ringarc" r="28" fill="none" stroke="${SKY}" stroke-width="9" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="175.9" stroke-dashoffset="175.9"/>
        <text class="ringnum" x="0" y="11" font-size="32" font-weight="700" text-anchor="middle" fill="${N}">3</text>
      </g>
      <rect class="hit" x="-52" y="-126" width="104" height="140" rx="16" fill="transparent"/>
    </g>`).join('');
  }

  function dome() {
    return `<g id="dome" transform="translate(${DOME_X},${GROUND})">
      <g ${O}>
        <rect x="-4" y="-152" width="8" height="40" rx="3" fill="${STEEL}"/>
        <g transform="translate(0,-150) rotate(-8)"><rect x="-40" y="-20" width="80" height="24" rx="6" fill="${POWER}"/><path d="M-40 -8 H40 M-20 -20 V4 M0 -20 V4 M20 -20 V4" fill="none" stroke="#4d5fd1" stroke-width="2"/></g>
        <path d="M74 -64 l22 -28" fill="none"/><circle cx="96" cy="-94" r="6" class="blink" fill="${PINK}"/>
        <rect x="-104" y="-20" width="208" height="22" rx="9" fill="#d4d8e6"/>
        <path d="M-92 -20 A92 92 0 0 1 92 -20 Z" fill="url(#glass)"/>
        <path d="M0 -112 C-34 -112 -50 -64 -50 -20 M0 -112 C34 -112 50 -64 50 -20 M-84 -58 Q0 -78 84 -58" fill="none" stroke-width="2.4"/>
        <circle cx="-62" cy="-44" r="13" fill="#2a3570"/><circle cx="62" cy="-44" r="13" fill="#2a3570"/>
        <path d="M-22 -20 V-52 A22 22 0 0 1 22 -52 V-20 Z" fill="${STEEL}"/>
        <circle cx="0" cy="-52" r="8" fill="#bfe8f7" stroke-width="2.4"/>
        <path d="M-70 -78 q14 -22 40 -28" fill="none" stroke="#fff" stroke-width="5" opacity=".75"/>
        <g id="crack" class="hide"><path d="M-48 -90 l8 7 -6 6 9 6 -5 7" fill="none" stroke-width="3"/></g>
        <g id="patch" class="hide" transform="translate(-44,-80) rotate(-30)"><rect x="-17" y="-7" width="34" height="14" rx="7" fill="#ffd9b8"/><rect x="-6" y="-5" width="12" height="10" rx="2" fill="${CREAM}" stroke-width="2"/></g>
      </g>
      <g id="puffs" class="hide"><circle class="puff p1" cx="-52" cy="-96" r="8" fill="#ffffff" opacity=".9"/><circle class="puff p2" cx="-56" cy="-100" r="6" fill="#ffffff" opacity=".9"/><circle class="puff p3" cx="-48" cy="-98" r="7" fill="#ffffff" opacity=".9"/></g>
    </g>`;
  }

  function pile() {
    const marks = SPOTS.map((p, i) => `<g class="spot" id="spot${i}" transform="translate(${p.x},${p.y})"><ellipse class="spot-hole" rx="15" ry="6.5" fill="#7d8199" stroke="${N}" stroke-width="2"/><g class="spot-rocks"><path d="M-9 -4 l4 -6 6 1 2 5z" fill="${ROCK}" stroke="${N}" stroke-width="1.6"/><path d="M2 -5 l5 -5 5 3 -1 4z" fill="#b9bccb" stroke="${N}" stroke-width="1.6"/></g><circle class="spot-ring" r="26" fill="none" stroke="${SKY}" stroke-width="4"/></g>`).join('');
    return `<g id="pile">
      <path d="M-2 ${GROUND + 4} Q16 540 72 530 Q126 498 182 526 Q238 540 270 ${GROUND + 4} Z" fill="#a69f97" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M36 548 q40 -30 90 -34" fill="none" stroke="#c4bdb4" stroke-width="5" stroke-linecap="round"/>
      <circle cx="96" cy="532" r="6" fill="#8f8880"/><circle cx="158" cy="520" r="5" fill="#8f8880"/><circle cx="216" cy="552" r="5" fill="#8f8880"/>
      ${marks}
      <g id="dustCloud" class="hide"><g class="dc"><circle cx="0" cy="0" r="22" fill="#e6e0d2" opacity=".95"/><circle cx="22" cy="-10" r="18" fill="#efe9dc" opacity=".95"/><circle cx="-20" cy="-8" r="16" fill="#ddd6c6" opacity=".95"/><circle cx="6" cy="-24" r="15" fill="#f3eee2" opacity=".95"/></g></g>
    </g>`;
  }

  function crater() {
    const chunks = ICES.map((p, i) => `<g class="icechunk" id="icec${i}" transform="translate(${p.x},${p.y})"><path d="M-12 0 l4 -14 8 -5 9 5 3 14z" fill="${ICE}" stroke="${N}" stroke-width="2"/><path d="M-4 -12 l3 8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path class="ice-spark" d="M10 -20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff"/><circle class="spot-ring" r="22" fill="none" stroke="${SKY}" stroke-width="4"/></g>`).join('');
    return `<g id="crater">
      <path d="M1092 ${GROUND} Q1100 584 1112 588 Q1190 650 1262 588 Q1276 584 1282 ${GROUND} Z" fill="#9ca0b4" stroke="none"/>
      <path d="M1100 ${GROUND + 2} Q1120 644 1190 644 Q1258 644 1278 ${GROUND + 2}" fill="url(#craterIn)" stroke="${N}" stroke-width="3"/>
      <path d="M1086 ${GROUND + 2} Q1094 572 1108 574 M1272 574 Q1284 572 1290 ${GROUND + 2}" fill="none" stroke="${N}" stroke-width="3" stroke-linecap="round"/>
      ${chunks}
      <path id="craterDark" d="M1100 ${GROUND + 2} Q1120 644 1190 644 Q1258 644 1278 ${GROUND + 2} Z" fill="#0b1026" opacity=".55"/>
    </g>`;
  }

  function earth() {
    return `<g id="earth" transform="translate(1110,172)">
      <circle r="46" fill="${AIR}" stroke="${N}" stroke-width="3"/>
      <path d="M-30 -22 q12 -10 22 -4 q6 10 -4 14 q-6 4 -2 12 q-10 6 -18 -4 q-6 -10 2 -18z" fill="${FOOD}" stroke="${N}" stroke-width="2"/>
      <path d="M8 6 q14 -6 22 4 q4 14 -10 20 q-10 2 -14 -8 q-4 -10 2 -16z" fill="${FOOD}" stroke="${N}" stroke-width="2"/>
      <path d="M-14 -36 q10 -4 18 0 M10 -20 q12 -2 20 4 M-34 18 q8 -2 14 2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>
      <path d="M22 -36 A46 46 0 0 1 34 30 A50 50 0 0 0 22 -36z" fill="#0b1026" opacity=".18"/>
    </g>`;
  }

  function sun() {
    let rays = '';
    for (let i = 0; i < 10; i++) rays += `<rect x="-5" y="-78" width="10" height="20" rx="5" fill="${SUN}" stroke="${N}" stroke-width="2.4" transform="rotate(${i * 36})"/>`;
    return `<g id="sun">
      <g id="sunBody">
        <circle r="96" fill="url(#sunGlow)"/>
        <g class="rays">${rays}</g>
        <circle r="46" fill="${SUN}" stroke="${N}" stroke-width="3"/>
        <path d="M-26 -16 a30 30 0 0 1 16 -22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
        <g id="flare" class="hide"><circle r="64" fill="none" stroke="#fff3b0" stroke-width="10" opacity=".8" class="flare-ring"/><path d="M30 -30 q40 -10 70 20 q-30 0 -50 20z" fill="#fff3b0" stroke="${N}" stroke-width="2.4"/></g>
      </g>
    </g>`;
  }

  function stormFx() {
    let s = '';
    for (let i = 0; i < 14; i++) {
      const y = 130 + (i * 37) % 300, x = 240 + (i * 83) % 260;
      s += `<path class="ray r${i % 4}" d="M${x} ${y} l70 22" stroke="#fff3b0" stroke-width="5" stroke-linecap="round" style="animation-delay:${(i % 5) * 0.22}s"/>`;
    }
    return `<g id="stormFx" class="hide">${s}</g>`;
  }
  function meteorFx() {
    const m = [[380, 0.0], [860, 0.7], [1000, 1.3], [250, 1.9], [760, 2.5]];
    return `<g id="meteorFx" class="hide">${m.map(([x, d]) => `<g class="meteor" style="--mx:${x}px;animation-delay:${d}s"><path d="M0 0 L-60 -60" stroke="#ffd9b8" stroke-width="8" stroke-linecap="round" opacity=".8"/><circle r="11" fill="${ROCK}" stroke="${N}" stroke-width="2.6"/></g>`).join('')}</g>`;
  }

  function scene() {
    return `<svg id="sceneSvg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset=".72" stop-color="#18224f"/><stop offset="1" stop-color="#26306a"/></linearGradient>
        <radialGradient id="sunGlow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset=".5" stop-color="#fff3b0" stop-opacity=".25"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
        <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3c6d3"/><stop offset="1" stop-color="#9599ae"/></linearGradient>
        <linearGradient id="farG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b90a9"/><stop offset="1" stop-color="#6f748f"/></linearGradient>
        <linearGradient id="craterIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5f7c"/><stop offset="1" stop-color="#2c3150"/></linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf8ff" stop-opacity=".95"/><stop offset="1" stop-color="#a9dcf2" stop-opacity=".9"/></linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3b0" stop-opacity=".85"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></linearGradient>
        <radialGradient id="warm"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#skyG)"/>
      <g id="stars">${stars()}</g>
      ${earth()}
      ${sun()}
      ${stormFx()}
      <path d="M0 520 Q120 470 260 500 Q380 520 470 488 Q600 446 760 494 Q880 520 1000 486 Q1130 452 1280 500 V720 H0 Z" fill="url(#farG)" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="380" cy="505" rx="34" ry="7" fill="#7b809b"/><ellipse cx="960" cy="498" rx="26" ry="6" fill="#7b809b"/>
      <path d="M0 566 Q160 548 330 570 Q520 590 700 568 Q880 548 1060 570 Q1180 584 1280 566 V720 H0 Z" fill="url(#groundG)" stroke="${N}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="760" cy="664" rx="70" ry="12" fill="#8a8ea4"/><ellipse cx="420" cy="690" rx="50" ry="9" fill="#8a8ea4"/><ellipse cx="160" cy="660" rx="36" ry="7" fill="#8a8ea4"/><ellipse cx="1000" cy="700" rx="44" ry="8" fill="#8a8ea4"/>
      ${crater()}
      ${pile()}
      ${dome()}
      <g id="slots">${slotsSvg()}</g>
      ${astronaut()}
      ${meteorFx()}
      <g id="impact" class="hide"><g class="imp"><circle r="10" fill="#efe9dc"/><circle cx="18" cy="-6" r="13" fill="#e6e0d2"/><circle cx="-16" cy="-4" r="11" fill="#ddd6c6"/></g></g>
      <rect id="nightOverlay" width="1280" height="720" fill="#03071a" opacity="0" pointer-events="none"/>
      <g id="lights" pointer-events="none">
        <g id="domeGlow" class="hide"><ellipse cx="${DOME_X}" cy="${GROUND - 50}" rx="110" ry="80" fill="url(#warm)" opacity=".75"/><circle cx="${DOME_X - 62}" cy="${GROUND - 44}" r="11" fill="#fff3c4"/><circle cx="${DOME_X + 62}" cy="${GROUND - 44}" r="11" fill="#fff3c4"/></g>
      </g>
      <g id="hits">
        <rect id="hitPile" x="0" y="490" width="272" height="96" rx="20" fill="transparent"/>
        <rect id="hitCrater" x="1090" y="560" width="190" height="80" rx="20" fill="transparent"/>
        <circle id="hitSpot" cx="250" cy="560" r="56" fill="transparent" class="hide"/>
      </g>
      <g id="hlRing" class="hide" pointer-events="none"><circle r="40" fill="none" stroke="${SKY}" stroke-width="5"/><circle r="40" fill="none" stroke="${CREAM}" stroke-width="2" stroke-dasharray="6 8"/></g>
    </svg>`;
  }

  // ---------------------------------------------------------------- badge and pointer
  function badge(tier) {
    const c = { gold: ['#ffd34d', '#e9b52d'], silver: ['#e1e5ee', '#b9bfcd'], bronze: ['#e2a676', '#c07f4f'] }[tier] || ['#e1e5ee', '#b9bfcd'];
    return `<svg class="badge" viewBox="0 0 140 160" aria-hidden="true" focusable="false"><g stroke="${N}" stroke-width="3.4" stroke-linejoin="round">
      <path d="M44 96 L30 150 L52 140 L62 158 L72 106z" fill="${SKY}"/><path d="M96 96 L110 150 L88 140 L78 158 L68 106z" fill="${POWER}"/>
      <circle cx="70" cy="70" r="56" fill="${c[0]}"/><circle cx="70" cy="70" r="44" fill="${c[1]}"/>
      <circle cx="70" cy="70" r="34" fill="#eceef5"/><circle cx="58" cy="60" r="8" fill="#c9ccd9" stroke-width="2.4"/><circle cx="82" cy="80" r="6" fill="#c9ccd9" stroke-width="2.4"/><circle cx="76" cy="54" r="4" fill="#c9ccd9" stroke-width="2"/>
      <path d="M40 40 q10 -14 26 -18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    </g></svg>`;
  }
  function pointer() {
    return `<svg viewBox="0 0 64 84" aria-hidden="true" focusable="false"><path d="M20 4 h24 v36 h14 L32 78 6 40 h14z" fill="${SKY}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/><path d="M27 10 v28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`;
  }

  return { icon, statusIcon, statusColor, mascot, building, buildingSvg, scene, badge, pointer,
           SLOT_X, GROUND, DOME_X, SPOTS, ICES, ICONS };
})();
