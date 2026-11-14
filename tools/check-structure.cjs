'use strict';
// Selected structural checks; no scientific or live-source verification.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const errors = [], warnings = [], data = {};
const shape = {alarms: ['alarm_levels','metrics'], consumption: ['crew_metabolic_rates','water_recovery_system','eva_spacesuit_specs','lunar_environment_specs'], destinations: ['destinations'], failure_chains: ['chains'], modules: ['modules'], quiz: ['tiles','difficulty_modes','total_tiles'], recipes: ['recipes','unit_system'], wheel: ['events'], reality_vs_game: ['entries','classification_definitions']};
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const arrayFields = new Set(['destinations.destinations','failure_chains.chains','modules.modules','quiz.tiles','recipes.recipes','wheel.events','reality_vs_game.entries']);
function requireFields(x, fields, at) { for (const f of fields) if (!object(x) || !Object.hasOwn(x,f) || x[f] === null || x[f] === '') errors.push(`${at}: missing ${f}`); }
for (const [name, fields] of Object.entries(shape)) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
    const initialErrors = errors.length;
    requireFields(d,['title','version',...fields],name);
    if(!object(d)) { errors.push(`${name}: expected object`); continue; }
    for(const k of fields) {
      if(k==='total_tiles') { if(!Number.isInteger(d[k])||d[k]<1) errors.push(`${name}.${k}: expected positive integer`); }
      else if(arrayFields.has(`${name}.${k}`)) {
        if(!Array.isArray(d[k])) errors.push(`${name}.${k}: expected array`);
        else for(const [i,row] of d[k].entries()) if(!object(row)) errors.push(`${name}.${k}[${i}]: expected object`);
      } else if(!object(d[k])) errors.push(`${name}.${k}: expected object`);
    }
    if(errors.length===initialErrors) data[name]=d;
  }
  catch(e) { errors.push(`${name}: ${e.message}`); }
}
const collections = {destinations:'destinations',failure_chains:'chains',modules:'modules',quiz:'tiles',recipes:'recipes',wheel:'events',reality_vs_game:'entries'};
for(const [name,key] of Object.entries(collections)) {
  const rows=data[name]?.[key];
  if(!Array.isArray(rows) || !rows.length) { errors.push(`${name}.${key}: expected nonempty array`); continue; }
  const ids=new Set();
  for(const [i,row] of rows.entries()) { requireFields(row,name==='quiz'?['index']:['id','source'],`${name}.${key}[${i}]`); if(name==='quiz' && !row?.source && !row?.card?.source) errors.push(`quiz tile ${row?.index}: missing source or card.source`); const id=row?.[name==='quiz'?'index':'id']; if(name==='quiz' ? !Number.isInteger(id)||id<1||id>data.quiz.total_tiles : typeof id!=='string'||!id.trim()) errors.push(`${name}.${key}[${i}]: invalid identity`); if(ids.has(id)) errors.push(`${name}: duplicate identity ${id}`); ids.add(id); }
}
const modules=new Set((data.modules?.modules||[]).map(x=>x.id));
for(const r of data.recipes?.recipes||[]) {
  requireFields(r,['name','inputs','outputs','power_kw','duration_hours','required_modules','parameter_status'],`recipe ${r.id}`);
  if(!Array.isArray(r.required_modules)) errors.push(`recipe ${r.id}: required_modules must be array`);
  else for(const id of r.required_modules) if(!modules.has(id)) errors.push(`recipe ${r.id}: unresolved module ${id}`);
  for(const key of ['inputs','outputs']) if(!object(r[key]) || !Object.keys(r[key]).length || Object.values(r[key]).some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0)) errors.push(`recipe ${r.id}: invalid ${key}`);
  for(const key of ['power_kw','duration_hours']) if(typeof r[key]!=='number'||!Number.isFinite(r[key])||r[key]<0) errors.push(`recipe ${r.id}: invalid ${key}`);
}
for(const c of data.failure_chains?.chains||[]) if(!Object.hasOwn(data.alarms?.metrics||{},c.terminal_metric)) errors.push(`chain ${c.id}: unresolved metric ${c.terminal_metric}`);
for(const e of data.wheel?.events||[]) {
  requireFields(e,['title','weight','choices','parameter_status'],`event ${e.id}`);
  if(!(typeof e.weight==='number' && e.weight>0)) errors.push(`event ${e.id}: invalid weight`);
  if(!Array.isArray(e.choices)||!e.choices.length) errors.push(`event ${e.id}: missing choices`);
  else { const ids=new Set(); for(const c of e.choices) { requireFields(c,['id','text','effects','feedback'],`event ${e.id} choice`); if(!object(c)) continue; if(ids.has(c.id)) errors.push(`event ${e.id}: duplicate choice ${c.id}`); ids.add(c.id); if(!object(c.effects)||Object.values(c.effects).some(v=>typeof v!=='number'||!Number.isFinite(v))) errors.push(`event ${e.id}: invalid effects`); } }
}
if(data.quiz && data.quiz.tiles?.length!==data.quiz.total_tiles) errors.push('quiz: total_tiles mismatch');
for(const tile of data.quiz?.tiles||[]) if(tile.type==='territory') {
  requireFields(tile.quiz,['question','explanation'],`quiz tile ${tile.index}`);
  for(const mode of Object.keys(data.quiz.difficulty_modes||{})) {
    const options=tile.quiz?.['options_'+mode];
    if(!Array.isArray(options)||options.length!==data.quiz.difficulty_modes[mode]?.options_count||options.filter(x=>x?.correct===true).length!==1||options.some(x=>!object(x)||typeof x.text!=='string'||typeof x.correct!=='boolean')) errors.push(`quiz tile ${tile.index}: invalid ${mode} options`);
  }
}
for(const r of data.reality_vs_game?.entries||[]) if(!Object.hasOwn(data.reality_vs_game?.classification_definitions||{},r.classification)) errors.push(`transparency ${r.id}: unknown classification`);
warnings.push('Engine state, inventory keys, quiz runtime and failure decision tags cannot be validated without B code.');
warnings.push('Source claims, legacy localized fields and physical/game-unit conversions require review.');
for(const e of errors) console.error('ERROR:',e);
for(const w of warnings) console.warn('WARNING:',w);
console.log(`Structural errors: ${errors.length}. No scientific verification performed.`);
process.exitCode=errors.length?1:0;
