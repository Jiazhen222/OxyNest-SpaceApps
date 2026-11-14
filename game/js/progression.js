/* Deterministic mining progression. All costs and bonuses are game rules. */
(function () {
  'use strict';
  const TOOLS = ['drill','tank','cargo'];
  function fresh() { return {total:0,zone:0,tools:{drill:0,tank:0,cargo:0},finds:[]}; }
  function valid(p) {
    return p && Number.isInteger(p.total) && p.total>=0 && p.total<=1000000 && Number.isInteger(p.zone) && p.zone>=0 && p.zone<=2 && p.tools && TOOLS.every(k=>Number.isInteger(p.tools[k])&&p.tools[k]>=0&&p.tools[k]<=3) && Array.isArray(p.finds) && p.finds.length<=3 && p.finds.every(x=>[0,1,2].includes(x)) && new Set(p.finds).size===p.finds.length;
  }
  function ensure(s) { if(!valid(s.expedition))s.expedition=fresh();return s.expedition; }
  function unlocked(s,z) { return Number.isInteger(z)&&z>=0&&z<=2&&ensure(s).total>=[0,12,30][z]; }
  function cost(s,k) { return TOOLS.includes(k)?[6,10,14][ensure(s).tools[k]]??null:null; }
  function buy(s,k) {
    const n=cost(s,k);if(n===null||s.rocks<n)return false;
    s.rocks-=n;ensure(s).tools[k]++;return true;
  }
  function stats(s) { const p=ensure(s);return {strength:1+p.tools.drill,capacity:12+p.tools.cargo*6,drain:Math.max(.55,1-p.tools.tank*.15),zone:p.zone}; }
  function bank(s,kind,amount,zone) {
    if(!Number.isInteger(amount)||amount<0||amount>1000||!['dig','mine'].includes(kind))return false;
    const p=ensure(s);s[kind==='dig'?'rocks':'ice']+=amount;
    if(kind==='dig') { p.total+=amount;if(amount>0&&unlocked(s,zone)&&!p.finds.includes(zone))p.finds.push(zone); }
    return true;
  }
  window.OX_PROGRESS=Object.freeze({TOOLS,fresh,valid,ensure,unlocked,cost,buy,stats,bank});
})();
