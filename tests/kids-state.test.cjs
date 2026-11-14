'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox={window:{},URL};vm.createContext(sandbox);
for(const file of ['content.js','progression.js','settlement.js','state.js'])vm.runInContext(fs.readFileSync(`game/js/${file}`,'utf8'),sandbox);
const C=sandbox.window.OX_CONTENT,S=sandbox.window.OX_STATE;
function fresh(){return {v:1,started:true,session:0,step:0,m:Object.fromEntries(['survival','air','power','water','food','rad'].map(k=>[k,C.START[k]])),rocks:14,ice:4,stars:3,slots:[{type:'battery',lv:2},null,null,null,null,null],book:['dust'],done:{dust:true},log:{cards:[{id:'dust',review:false}],stars:3,max:3},snap:null,freeIdx:0,flags:{mine:false},runs:{dig:1,mine:0},badges:[],patched:false};}
test('Kids saves accept valid states and sanitize browser preferences',()=>{
  const result=S.readStore(JSON.stringify({lang:'zh',nick:'<Nova>',muted:false,saves:{explorer:fresh()}}));
  assert.equal(result.nick,'Nova');assert.equal(result.lang,'zh');assert.equal(result.muted,false);assert.ok(S.validState(result.saves.explorer));
  assert.equal(result.saves.explorer.snap,null);
});
test('Kids save validation rejects corrupt, oversized and incompatible containers',()=>{
  for(const raw of ['null','[]','{broken','x'.repeat(1000001)])assert.equal(Object.keys(S.readStore(raw)).length,0);
  for(const change of [s=>s.m.air=-1,s=>s.slots[0].lv=99,s=>s.slots[0].type='unknown',s=>s.book=['unknown'],s=>s.done={constructor:true},s=>s.step=100,s=>s.log.cards=[{id:'dust'}],s=>s.rocks='100',s=>s.flags.mine='yes',s=>s.summaryPending='yes']){
    const s=fresh();change(s);assert.equal(S.validState(s),false);
    assert.equal(Object.keys(S.readStore(JSON.stringify({saves:{explorer:s}})).saves).length,0);
  }
});
test('Kids recovery restores reserves without rolling back buildings, materials or learning',()=>{
  const state=fresh();state.m.survival=0;state.m.air=0;state.m.rad=100;
  const before=JSON.stringify({slots:state.slots,rocks:state.rocks,ice:state.ice,stars:state.stars,book:state.book});
  S.recover(state);assert.equal(state.m.survival,C.START.survival);assert.equal(state.m.rad,C.START.rad);
  assert.equal(JSON.stringify({slots:state.slots,rocks:state.rocks,ice:state.ice,stars:state.stars,book:state.book}),before);
  S.recover(state);assert.equal(state.rocks,14);
});
test('Kids source links reject executable schemes and lookalike domains',()=>{
  for(const url of ['javascript:alert(1)','http://nasa.gov','https://nasa.gov.attacker.test','https://nasa.gov@attacker.test','https://user@nasa.gov'])assert.equal(S.nasaLink(url),false,url);
  assert.equal(S.nasaLink('https://science.nasa.gov/moon/'),true);
});
test('Kids levels keep fixed answer roles and documented age mechanics',()=>{
  assert.equal(C.LEVELS.explorer.opts,2);assert.equal(C.LEVELS.explorer.countdown,0);assert.equal(C.LEVELS.explorer.numbers,false);
  assert.equal(C.LEVELS.engineer.pause,true);assert.equal(C.LEVELS.commander.chain,true);
  for(const ch of Object.values(C.CHOICES)){assert.equal(Object.values(ch.roles).filter(x=>x==='c').length,1);assert.ok(ch.order.every(id=>Object.hasOwn(ch.roles,id)));}
  assert.ok(C.REWARD.first.stars>C.REWARD.later.stars);assert.ok(C.REWARD.wrong.survival<0);
});
