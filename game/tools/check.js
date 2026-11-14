// OxyNest Moon Base checks (Node.js, no packages): node tools/check.js
// Text in both languages, content references, Explorer text without numbers,
// status colours only in meters, and no network code.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const code = f => read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');   // without comments
const sandbox = { window: {}, console };
vm.createContext(sandbox);
['js/i18n.js', 'js/content.js', 'js/art.js'].forEach(f => vm.runInContext(read(f), sandbox, { filename: f }));
const I = sandbox.window.OX_I18N, C = sandbox.window.OX_CONTENT, ART = sandbox.window.OX_ART;

let errors = 0, warnings = 0;
const err = m => { errors++; console.log('ERROR  ' + m); };
const warn = m => { warnings++; console.log('warn   ' + m); };
const has = k => I.en[k] != null && I.zh[k] != null;
const need = (k, why) => { if (I.en[k] == null) err(`missing en text "${k}" (${why})`); if (I.zh[k] == null) err(`missing zh text "${k}" (${why})`); };

// 1. Both languages have the same keys.
Object.keys(I.en).forEach(k => { if (I.zh[k] == null) err(`zh is missing "${k}"`); });
Object.keys(I.zh).forEach(k => { if (I.en[k] == null) err(`en is missing "${k}"`); });
// Placeholders like {n} match.
Object.keys(I.en).forEach(k => {
  if (I.zh[k] == null) return;
  const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
  if (ph(I.en[k]) !== ph(I.zh[k])) err(`placeholders differ for "${k}": en ${ph(I.en[k])} / zh ${ph(I.zh[k])}`);
});

// 2. Content references.
const icons = ART.ICONS;
Object.keys(C.CHOICES).forEach(id => {
  const ch = C.CHOICES[id];
  const roles = Object.values(ch.roles);
  if (roles.filter(r => r === 'c').length !== 1) err(`choice ${id}: needs exactly one correct option`);
  if (!roles.includes('w') || !roles.includes('t')) err(`choice ${id}: needs a plain wrong (w) and a tempting wrong (t)`);
  if (ch.order.length !== Object.keys(ch.roles).length || ch.order.some(o => !ch.roles[o])) err(`choice ${id}: order and roles differ`);
  if (!C.CARDS[ch.card]) err(`choice ${id}: card ${ch.card} missing`);
  need(`ch.${id}.q`, 'question');
  ch.order.forEach(o => {
    need(`ch.${id}.o.${o}`, 'option');
    if (!icons[ch.icons[o]]) err(`choice ${id}: icon "${ch.icons[o]}" for ${o} is not drawn`);
    if (ch.roles[o] !== 'c') need(`ch.${id}.w.${o}`, 'gentle explanation');
  });
  // The correct answer is not always in the same place.
});
const firstPos = Object.values(C.CHOICES).map(ch => ch.order.filter(o => ch.roles[o] !== 't').indexOf(Object.keys(ch.roles).find(o => ch.roles[o] === 'c')));
if (new Set(firstPos).size < 2) err('the correct answer is always in the same place');

let sourced = 0, placeholders = 0;
Object.keys(C.CARDS).forEach(id => {
  const cd = C.CARDS[id];
  ['title', 'what', 'why', 'like'].forEach(p => need(`cd.${id}.${p}`, 'card line'));
  if (!['power', 'air', 'food', 'rad', 'explore'].includes(cd.cat)) err(`card ${id}: unknown category ${cd.cat}`);
  if (!icons[cd.icon]) err(`card ${id}: icon "${cd.icon}" is not drawn`);
  if (cd.source) {
    sourced++;
    need(`cd.${id}.nasa`, 'How NASA does it');
    need(`src.${cd.src}`, 'source name');
    [cd.source].concat((cd.more || []).map(m => m.url)).forEach(u => {
      if (!/^https:\/\/([a-z0-9-]+\.)*nasa\.gov(\/|$)/.test(u)) err(`card ${id}: source is not an https nasa.gov address: ${u}`);
    });
    (cd.more || []).forEach(m => need(`src.${m.src}`, 'extra source name'));
    if (!cd.data) warn(`card ${id}: no note of which team data file the fact came from`);
  } else {
    placeholders++;
    if (has(`cd.${id}.nasa`)) err(`card ${id}: has NASA text but no source (would show an unsourced fact)`);
  }
});
if (C.CARD_ORDER.length !== Object.keys(C.CARDS).length || C.CARD_ORDER.some(id => !C.CARDS[id])) err('CARD_ORDER does not list every card once');
need('card.placeholder', 'placeholder');

Object.keys(C.BUILDINGS).forEach(b => ['name', 'line', 'a', 'one'].forEach(p => need(`b.${b}.${p}`, 'building')));
if (C.BUILD_ORDER.length !== 8) err('there must be 8 buildings');
if (C.BUILD_ORDER.filter(b => C.BUILDINGS[b].page === 0).length !== 4) err('the build pop-up must show 4 buildings first');
Object.keys(C.EVENTS).forEach(e => {
  const ev = C.EVENTS[e];
  need(`ev.${e}.warn`, 'event warning'); need(`ev.${e}.name`, 'event name');
  if (!C.CHOICES[ev.choice]) err(`event ${e}: choice missing`);
  if (ev.follow) { need(ev.follow.warn, 'follow warning'); need(ev.follow.name, 'follow name'); if (!C.CHOICES[ev.follow.choice]) err(`event ${e}: follow choice missing`); }
  if (ev.chainEvent && !C.EVENTS[ev.chainEvent]) err(`event ${e}: chain event missing`);
  need(ev.endSay, 'event end');
});
C.SESSIONS.forEach((s, i) => {
  need(s.say, 'session intro'); need(`sess.${i + 1}`, 'session title');
  s.steps.forEach(p => {
    if (p.type === 'build' && !C.BUILDINGS[p.b]) err(`session ${i + 1}: unknown building ${p.b}`);
    if (p.type === 'process' && !(C.CHOICES[p.choice] && C.CHOICES[p.choice].recipe)) err(`session ${i + 1}: process step needs a recipe choice`);
    (p.then || []).forEach(th => { const [k, v] = th.split(':'); if (k === 'event' && !C.EVENTS[v]) err(`session ${i + 1}: unknown event ${v}`); if (k === 'quiz' && !C.CHOICES[v]) err(`session ${i + 1}: unknown quiz ${v}`); });
    if (p.type === 'pick') p.from.forEach(b => { if (!C.QUIZ_OF[b]) err(`pick ${b} has no quiz`); });
  });
});
const s1 = C.SESSIONS[0].steps.map(p => p.type + (p.b ? ':' + p.b : '') + (p.then ? '>' + p.then.join() : '')).join(' | ');
if (s1 !== 'dig | build:battery>event:night') err(`first session must be dig rocks, build a battery, lunar night (got ${s1})`);

// 3. Every literal text key used in game.js exists.
const game = read('js/game.js');
const used = new Set();
for (const m of game.matchAll(/\bt{1,2}\(\s*'([a-z][\w.]*)'(\s*\+)?/g)) if (!m[2] && !m[1].endsWith('.')) used.add(m[1]);
for (const m of game.matchAll(/\b(?:key|busyKey|nameKey|evName|warn)\s*[:=]\s*'([a-z][\w.]*)'/g)) used.add(m[1]);
for (const m of game.matchAll(/say\(\s*'([a-z][\w.]*)'/g)) used.add(m[1]);
used.forEach(k => { if (!has(k)) err(`game.js uses text "${k}" that is missing`); });

// 4. Explorer (ages 5-7) text: no numbers.
const tierEx = k => (I.en[k + '.kid'] != null ? k + '.kid' : k);
const digitFree = (k, where) => {
  ['en', 'zh'].forEach(l => {
    const s = (I[l][k] || '').replace(/CO2|O2|\{\w+\}/g, '');
    if (/[0-9]/.test(s)) err(`Explorer sees a number in ${where} (${l}): "${I[l][k]}"`);
  });
};
Object.keys(C.CHOICES).forEach(id => {
  const ch = C.CHOICES[id], cd = C.CARDS[ch.card];
  if (cd.only) return;
  digitFree(tierEx(`ch.${id}.q`), `ch.${id}.q`);
  ch.order.filter(o => ch.roles[o] !== 't').forEach(o => {
    digitFree(tierEx(`ch.${id}.o.${o}`), `option ${id}.${o}`);
    if (ch.roles[o] === 'w') digitFree(tierEx(`ch.${id}.w.${o}`), `explanation ${id}.${o}`);
  });
  ['what', 'why', 'like'].forEach(p => digitFree(tierEx(`cd.${ch.card}.${p}`), `card ${ch.card}.${p}`));
  if (cd.source) digitFree(tierEx(`cd.${ch.card}.nasa`), `card ${ch.card}.nasa`);
});

// 5. Status colours only on meters.
const STATUS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
const css = read('css/game.css').toLowerCase();
STATUS.forEach(c => { if (css.includes(c)) err(`game.css uses status colour ${c} (allowed only on meters)`); });
const art = code('js/art.js').toLowerCase();
STATUS.forEach(c => { const n = art.split(c).length - 1; if (n !== 1) err(`art.js uses status colour ${c} ${n} times (only in the STATUS table)`); });
STATUS.forEach(c => { if (game.toLowerCase().includes(c)) err(`game.js hard-codes status colour ${c}`); });

// 6. No network code, no external resources.
['js/game.js', 'js/art.js', 'js/sfx.js', 'js/i18n.js', 'index.html', 'css/game.css'].forEach(f => {
  const s = read(f);
  if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts/.test(s)) err(`${f} contains network code`);
  const urls = (s.match(/https?:\/\/[^\s"'`)<]+/g) || []).filter(u => !u.startsWith('http://www.w3.org/2000/svg'));   // the SVG namespace is a name, not a request
  if (urls.length) err(`${f} contains web addresses: ${urls.slice(0, 3).join(' ')}`);
});
const content = read('js/content.js');
(content.match(/https?:\/\/[^\s"'`)<]+/g) || []).forEach(u => { if (!/nasa\.gov/.test(u)) err(`content.js has a non-NASA address: ${u}`); });
if (!/connect-src 'none'/.test(read('index.html'))) err('index.html must block network requests (connect-src none)');
if (/Math\.random/.test(code('js/game.js') + code('js/content.js') + code('js/art.js') + code('js/sfx.js'))) err('random numbers are used somewhere');

// 7. The bundled Chinese font (fonts/) is there and covers every character the game needs.
const fontDir = path.join(root, 'fonts');
const FONT_FILES = ['NotoSansSC-Regular.subset.woff2', 'NotoSansSC-Bold.subset.woff2'];
FONT_FILES.concat(['OFL.txt', 'subset-chars.txt']).forEach(f => { if (!fs.existsSync(path.join(fontDir, f))) err(`fonts/${f} is missing`); });
FONT_FILES.forEach(f => { if (!css.includes(`../fonts/${f.toLowerCase()}`)) err(`game.css does not load fonts/${f}`); });
let fontMissing = [];
if (fs.existsSync(path.join(fontDir, 'subset-chars.txt'))) {
  const have = new Set(Array.from(fs.readFileSync(path.join(fontDir, 'subset-chars.txt'), 'utf8')));
  fontMissing = Array.from(require('./font-chars.js').fontChars()).filter(ch => !have.has(ch));
  if (fontMissing.length) err(`Chinese text uses characters not in the bundled font: ${fontMissing.join('')} (see fonts/README.md to rebuild it)`);
}

console.log(`\n${Object.keys(I.en).length} text keys in each language; ${Object.keys(C.CHOICES).length} choices; ${Object.keys(C.CARDS).length} cards (${sourced} with a NASA source from the team data, ${placeholders} showing [Fact to be added]).`);
console.log(`${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
