'use strict';
// Local structural validation only. Does not verify scientific claims or live URLs.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'data');
const expected = ['alarms.json','consumption.json','destinations.json','failure_chains.json','modules.json','quiz.json','recipes.json','reality_vs_game.json','wheel.json'];
const errors = [], warnings = [];
let sources = 0, validDomains = 0, parsedCount = 0;
function checkSource(source, where) {
  sources++;
  try {
    const u = new URL(source);
    if (u.protocol !== 'https:' || u.username || u.password) throw Error('not clean HTTPS');
    const h = u.hostname.toLowerCase();
    if (!(h === 'nasa.gov' || h.endsWith('.nasa.gov'))) throw Error('not a nasa.gov hostname');
    validDomains++;
  } catch (e) { errors.push(`${where}: invalid NASA source URL (${e.message})`); }
}
function walk(x, where) {
  if (!x || typeof x !== 'object') return;
  if (Object.prototype.hasOwnProperty.call(x,'source')) checkSource(x.source,where);
  for (const [k,v] of Object.entries(x)) if (v && typeof v === 'object') walk(v,`${where}.${k}`);
}
for (const f of expected) {
  const p = path.join(dir,f);
  if (!fs.existsSync(p)) { warnings.push(`MISSING ${f}: ask D for the original; not fabricated`); continue; }
  try { const d=JSON.parse(fs.readFileSync(p,'utf8')); parsedCount++; walk(d,f); }
  catch(e) { errors.push(`${f}: ${e.message}`); }
}
if (!fs.existsSync(path.join(root,'data.html'))) errors.push('data.html missing');
console.log(`JSON parsed: ${parsedCount}/${expected.length}; NASA-domain-formatted source fields: ${validDomains}/${sources}`);
for(const w of warnings) console.warn('WARNING:',w);
for(const e of errors) console.error('ERROR:',e);
console.log('NOTE: Passing checks do NOT establish URL availability, factual accuracy, privacy, XSS safety, or award eligibility.');
if (errors.length) process.exitCode=1;
else if (warnings.length) process.exitCode=2;
