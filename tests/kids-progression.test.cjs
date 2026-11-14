'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box={window:{}};vm.runInNewContext(fs.readFileSync('game/js/progression.js','utf8'),box);const P=box.window.OX_PROGRESS;
const fresh=()=>({rocks:0,ice:0,expedition:P.fresh()});
test('mining sites unlock from collected material rather than spent inventory',()=>{
 const s=fresh();assert.equal(P.unlocked(s,1),false);P.bank(s,'dig',12,0);assert.equal(P.unlocked(s,1),true);s.rocks=0;assert.equal(P.unlocked(s,1),true);P.bank(s,'dig',18,1);assert.equal(P.unlocked(s,2),true);assert.equal(s.expedition.finds.join(','),'0,1');
});
test('tool upgrades have real mining effects and debit exactly once',()=>{
 const s=fresh();s.rocks=18;const base=P.stats(s);assert.equal(P.buy(s,'drill'),true);assert.equal(s.rocks,12);assert.ok(P.stats(s).strength>base.strength);assert.equal(P.buy(s,'tank'),true);assert.ok(P.stats(s).drain<base.drain);assert.equal(P.buy(s,'cargo'),true);assert.ok(P.stats(s).capacity>base.capacity);assert.equal(s.rocks,0);
});
test('unaffordable, unknown and maximum-level upgrades cannot charge material',()=>{
 const s=fresh();assert.equal(P.buy(s,'drill'),false);assert.equal(P.buy(s,'unknown'),false);s.rocks=100;for(let i=0;i<3;i++)assert.equal(P.buy(s,'drill'),true);assert.equal(s.rocks,70);assert.equal(P.buy(s,'drill'),false);assert.equal(s.rocks,70);
});
test('old saves gain defaults and malformed progression is rejected',()=>{
 const s={rocks:5,ice:2};P.ensure(s);assert.equal(s.expedition.total,0);assert.equal(P.valid(s.expedition),true);s.expedition.tools.drill=4;assert.equal(P.valid(s.expedition),false);assert.equal(P.bank(s,'dig',-1,0),false);assert.equal(s.rocks,5);
});
