/* A small autonomous production economy. Every number is a game-design rule. */
(function(){
 'use strict';
 const GOODS=['air','water','food','usedWater'];
 const RECIPES={
  charge:{building:'solar',seconds:5,power:0,input:{},output:{power:20}},
  rockAir:{building:'processor',seconds:8,power:8,input:{rocks:2},output:{air:2}},
  iceWater:{building:'processor',seconds:8,power:6,input:{ice:2},output:{water:3}},
  oxygen:{building:'oxygen',seconds:7,power:5,input:{water:1},output:{air:3}},
  garden:{building:'greenhouse',seconds:10,power:4,input:{water:1},output:{food:3,usedWater:1}},
  recycle:{building:'water',seconds:6,power:3,input:{usedWater:1},output:{water:1}},
  clean:{building:'co2',seconds:6,power:3,input:{},output:{cabin:15}}
 };
 const ORDERS={rocks:{need:{rocks:6},credits:8},air:{need:{air:2},credits:14},water:{need:{water:2},credits:14},food:{need:{food:2},credits:18},mixed:{need:{air:1,water:1,food:1},credits:30},ice:{need:{rocks:4,ice:2},credits:12}};
 const fresh=()=>({v:1,level:1,credits:0,stock:{air:0,water:0,food:0,usedWater:0},jobs:[],nextJob:1,orders:0,produced:0,celebrated:false});
 const int=(x,max=1000000)=>Number.isInteger(x)&&x>=0&&x<=max;
 function valid(c){return !!c&&c.v===1&&int(c.level,3)&&c.level>=1&&int(c.credits)&&int(c.orders)&&int(c.produced)&&typeof c.celebrated==='boolean'&&c.stock&&GOODS.every(k=>int(c.stock[k]))&&int(c.nextJob)&&Array.isArray(c.jobs)&&c.jobs.length<=6&&c.jobs.every(j=>j&&typeof j==='object')&&new Set(c.jobs.map(j=>j.slot)).size===c.jobs.length&&new Set(c.jobs.map(j=>j.id)).size===c.jobs.length&&c.jobs.every(j=>int(j.id)&&j.id<c.nextJob&&int(j.slot,5)&&Object.hasOwn(RECIPES,j.recipe)&&int(j.readyAt,100000000000000));}
 function ensure(s){if(!valid(s.settlement))s.settlement=fresh();return s.settlement;}
 function amount(s,key){return ['rocks','ice'].includes(key)?s[key]:ensure(s).stock[key]||0;}
 function debit(s,key,n){if(['rocks','ice'].includes(key))s[key]-=n;else ensure(s).stock[key]-=n;}
 function canStart(s,slot,id){
  const c=ensure(s),r=Object.hasOwn(RECIPES,id)?RECIPES[id]:null;
  if(!Number.isInteger(slot)||!r||s.slots[slot]?.type!==r.building)return 'building';
  if(c.jobs.some(j=>j.slot===slot))return 'busy';
  if(s.m.power<r.power)return 'power';
  if(Object.entries(r.input).some(([k,n])=>amount(s,k)<n))return 'input';
  return null;
 }
 function start(s,slot,id,now=Date.now()){
  if(canStart(s,slot,id))return false;
  const c=ensure(s),r=RECIPES[id];for(const[k,n]of Object.entries(r.input))debit(s,k,n);s.m.power-=r.power;
  c.jobs.push({id:c.nextJob++,slot,recipe:id,readyAt:now+Math.max(3000,Math.round(r.seconds*1000/(1+(s.slots[slot].lv-1)*.4+(c.level-1)*.15)))});return true;
 }
 function outputs(s,slot,id){
  if(!Object.hasOwn(RECIPES,id))return {};
  const bonus=s.slots[slot]?.lv||1;
  return Object.fromEntries(Object.entries(RECIPES[id].output).map(([k,n])=>[k,k==='power'?n+5*s.slots.filter(b=>b?.type==='battery').reduce((a,b)=>a+b.lv,0):k==='cabin'?n:n+Math.floor((bonus-1)/2)]));
 }
 function upkeep(s,n=1){
  n=n===2?2:1;
  for(const k of ['air','water','food'])s.m[k]=Math.max(0,s.m[k]-n);
  if(['air','water','food'].some(k=>s.m[k]===0))s.m.survival=Math.max(0,s.m.survival-4);
 }
 function collect(s,id,now=Date.now()){
  const c=ensure(s),j=c.jobs.find(x=>x.id===id);if(!j||now<j.readyAt)return false;
  for(const[k,n]of Object.entries(outputs(s,j.slot,j.recipe))){
   if(k==='power')s.m.power=Math.min(100,s.m.power+n);
   else if(k==='cabin')s.m.air=Math.min(100,s.m.air+n);
   else {c.stock[k]+=n;if(k!=='usedWater')c.produced+=n;}
  }
  c.jobs=c.jobs.filter(x=>x.id!==id);upkeep(s);return true;
 }
 function deliver(s,id,serial){
  const c=ensure(s),o=Object.hasOwn(ORDERS,id)?ORDERS[id]:null;if(!o||serial!==c.orders||Object.entries(o.need).some(([k,n])=>amount(s,k)<n))return false;
  for(const[k,n]of Object.entries(o.need))debit(s,k,n);c.credits+=o.credits;c.orders++;s.stars++;return true;
 }
 function upgrade(s){const c=ensure(s),cost=c.level===1?16:c.level===2?40:null;if(cost===null||c.credits<cost||s.slots.filter(Boolean).length<(c.level===1?2:4))return false;c.credits-=cost;c.level++;return true;}
 function move(s,a,b){if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||a>5||b<0||b>5||!s.slots[a])return false;[s.slots[a],s.slots[b]]=[s.slots[b],s.slots[a]];for(const j of ensure(s).jobs){if(j.slot===a)j.slot=b;else if(j.slot===b)j.slot=a;}return true;}
 function use(s,k){if(!['air','water','food'].includes(k)||amount(s,k)<1||s.m[k]>=100)return false;debit(s,k,1);s.m[k]=Math.min(100,s.m[k]+20);return true;}
 function won(s){const c=ensure(s);return c.level===3&&c.orders>=6&&c.produced>=6;}
 window.OX_SETTLEMENT=Object.freeze({GOODS,RECIPES,ORDERS,fresh,valid,ensure,amount,canStart,start,outputs,upkeep,collect,deliver,upgrade,move,use,won});
})();
