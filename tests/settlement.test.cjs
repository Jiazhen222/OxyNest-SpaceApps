'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('game/js/settlement.js','utf8'),ctx);const S=ctx.window.OX_SETTLEMENT;
const state=()=>({rocks:30,ice:8,stars:0,m:{power:100,air:60,water:60,food:60,survival:70},slots:[{type:'processor',lv:1},{type:'solar',lv:1},null,null,null,null],settlement:S.fresh()});
test('production requires its own building and charges ingredients exactly once',()=>{
 const s=state();assert.equal(S.start(s,1,'rockAir',1000),false);assert.equal(S.start(s,0,'constructor',1000),false);
 assert.equal(S.start(s,0,'rockAir',1000),true);assert.equal(s.rocks,28);assert.equal(s.m.power,92);assert.equal(S.start(s,0,'iceWater',1000),false);assert.equal(s.ice,8);
});
test('unaffordable production leaves all state unchanged',()=>{
 const s=state();s.m.power=0;const before=JSON.stringify(s);assert.equal(S.start(s,0,'rockAir',1000),false);assert.equal(JSON.stringify(s),before);s.m.power=100;s.rocks=0;assert.equal(S.start(s,0,'rockAir'),false);assert.equal(s.settlement.jobs.length,0);
});
test('a finished batch can be collected only once and persists as stock',()=>{
 const s=state();S.start(s,0,'iceWater',1000);const j=s.settlement.jobs[0];assert.equal(S.collect(s,j.id,j.readyAt-1),false);assert.equal(S.collect(s,j.id,j.readyAt),true);assert.equal(s.settlement.stock.water,3);assert.equal(s.settlement.produced,3);assert.equal(S.collect(s,j.id,j.readyAt+100),false);assert.equal(s.settlement.stock.water,3);
});
test('moving or swapping buildings keeps concurrent jobs with the right building',()=>{
 const s=state();S.start(s,0,'rockAir',0);S.start(s,1,'charge',0);assert.equal(S.move(s,0,1),true);assert.equal(s.slots[1].type,'processor');assert.equal(s.settlement.jobs.find(j=>j.recipe==='rockAir').slot,1);assert.equal(s.settlement.jobs.find(j=>j.recipe==='charge').slot,0);assert.equal(S.move(s,9,0),false);assert.equal(S.valid(s.settlement),true);
});
test('orders accept different routes and reject a repeated request token',()=>{
 const s=state();assert.equal(S.deliver(s,'rocks',0),true);assert.equal(s.rocks,24);assert.equal(s.settlement.credits,8);assert.equal(S.deliver(s,'rocks',0),false);assert.equal(S.deliver(s,'constructor',1),false);s.settlement.stock.food=2;assert.equal(S.deliver(s,'food',1),true);assert.equal(s.settlement.credits,26);assert.equal(s.settlement.stock.food,0);
});
test('outpost expansion requires credits and buildings and victory includes real production',()=>{
 const s=state();assert.equal(S.upgrade(s),false);s.settlement.credits=60;assert.equal(S.upgrade(s),true);assert.equal(s.settlement.level,2);assert.equal(S.upgrade(s),false);s.slots[2]={type:'greenhouse',lv:1};s.slots[3]={type:'water',lv:1};assert.equal(S.upgrade(s),true);s.settlement.orders=6;assert.equal(S.won(s),false);s.settlement.produced=6;assert.equal(S.won(s),true);assert.equal(S.upgrade(s),false);
});
test('saved economy validation rejects corrupt queues and resupply spends stored goods',()=>{
 const s=state();s.settlement.stock.air=2;assert.equal(S.use(s,'air'),true);assert.equal(s.m.air,80);assert.equal(s.settlement.stock.air,1);S.upkeep(s,2);assert.equal(s.m.air,78);assert.equal(s.m.water,58);assert.equal(S.use(s,'unknown'),false);assert.equal(S.valid(s.settlement),true);s.settlement.jobs=[null];assert.equal(S.valid(s.settlement),false);s.settlement.jobs=[];s.settlement.stock.water=-1;assert.equal(S.valid(s.settlement),false);
});
test('a complete mixed production route can reach the goal from actual starting resources',()=>{
 vm.runInNewContext(fs.readFileSync('game/js/content.js','utf8'),ctx);
 vm.runInNewContext(fs.readFileSync('game/js/progression.js','utf8'),ctx);
 const C=ctx.window.OX_CONTENT,P=ctx.window.OX_PROGRESS,s=state();
 s.rocks=16;s.ice=0;s.m.power=C.START.power;s.slots=[null,null,null,null,null,null];
 const build=(slot,id)=>{const b=C.BUILDINGS[id];assert.ok(s.rocks>=b.cost);s.rocks-=b.cost;s.slots[slot]={type:id,lv:1};for(const[k,n]of Object.entries(b.bonus))s.m[k]=Math.min(100,s.m[k]+n);};
 const batch=(slot,id)=>{assert.equal(S.start(s,slot,id,1000),true,id);const j=s.settlement.jobs.find(x=>x.slot===slot);assert.equal(S.collect(s,j.id,j.readyAt),true);};
 const order=id=>assert.equal(S.deliver(s,id,s.settlement.orders),true,id);
 build(0,'solar');build(1,'processor');P.bank(s,'dig',C.SPOT_ROCKS.reduce((a,b)=>a+b,0),0);P.bank(s,'mine',C.ICE_PER_CHUNK*3,0);
 batch(1,'iceWater');batch(1,'iceWater');order('water');order('water');assert.equal(S.upgrade(s),true);
 build(2,'greenhouse');P.bank(s,'dig',12,0);build(3,'water');batch(2,'garden');batch(2,'garden');order('food');order('food');
 batch(1,'rockAir');batch(3,'recycle');order('mixed');assert.equal(S.upgrade(s),true);order('rocks');
 assert.equal(S.won(s),true);assert.ok(s.rocks>=0);assert.ok(s.m.power>=0);assert.ok(s.m.survival>0);
});
