/* Bounded browser save validation and recovery. No DOM or network access. */
(function () {
  'use strict';
  const C = window.OX_CONTENT;
  const plain = x => x && typeof x === 'object' && !Array.isArray(x);
  const integer = (x, max = 1000000) => Number.isInteger(x) && x >= 0 && x <= max;
  const ids = (a, allowed, max) => Array.isArray(a) && a.length <= max && a.every(x => typeof x === 'string' && allowed.includes(x));
  function validState(s) {
    if (!plain(s) || s.v !== 1 || typeof s.started !== 'boolean' || !integer(s.session, 1000) || !integer(s.step, 100)) return false;
    if (s.session < C.SESSIONS.length && s.step > C.SESSIONS[s.session].steps.length) return false;
    if (!plain(s.m) || !['survival','air','power','water','food','rad'].every(k => Number.isFinite(s.m[k]) && s.m[k] >= 0 && s.m[k] <= 100)) return false;
    if (!['rocks','ice','stars','freeIdx'].every(k => integer(s[k]))) return false;
    if (!Array.isArray(s.slots) || s.slots.length !== 6 || !s.slots.every(x => x === null || plain(x) && C.BUILD_ORDER.includes(x.type) && integer(x.lv, C.MAX_LV) && x.lv >= 1)) return false;
    if (!ids(s.book, C.CARD_ORDER, C.CARD_ORDER.length) || new Set(s.book).size !== s.book.length) return false;
    if (!plain(s.done) || Object.keys(s.done).length > 50 || !Object.entries(s.done).every(([k,v]) => Object.hasOwn(C.CHOICES,k) && typeof v === 'boolean')) return false;
    if (!plain(s.flags) || typeof s.flags.mine !== 'boolean' || !plain(s.runs) || !integer(s.runs.dig) || !integer(s.runs.mine)) return false;
    if (typeof s.patched !== 'boolean' || !Array.isArray(s.badges) || s.badges.length > 1000 || !s.badges.every(x => plain(x) && integer(x.s,1000) && ['bronze','silver','gold'].includes(x.tier))) return false;
    if (s.log !== null && (!plain(s.log) || !integer(s.log.stars) || !integer(s.log.max) || !Array.isArray(s.log.cards) || s.log.cards.length > 100 || !s.log.cards.every(x => plain(x) && C.CARD_ORDER.includes(x.id) && typeof x.review === 'boolean'))) return false;
    if (s.summaryPending !== undefined && typeof s.summaryPending !== 'boolean') return false;
    for (const key of ['completedChoices','eventStarts','eventEnds']) if (s[key] !== undefined && (!Array.isArray(s[key]) || s[key].length > 100 || !s[key].every(x => typeof x === 'string' && /^[\w:]{1,100}$/.test(x)))) return false;
    if(s.expedition!==undefined&&!window.OX_PROGRESS.valid(s.expedition))return false;
    if(s.campaignComplete!==undefined&&typeof s.campaignComplete!=='boolean')return false;
    if(s.settlement!==undefined&&(!window.OX_SETTLEMENT.valid(s.settlement)||s.settlement.jobs.some(j=>window.OX_SETTLEMENT.RECIPES[j.recipe].building!==s.slots[j.slot]?.type)))return false;
    return true;
  }
  function readStore(raw) {
    try {
      if (typeof raw !== 'string' || raw.length > 1000000) return {};
      const value = JSON.parse(raw);
      if (!plain(value)) return {};
      const out = { lang: value.lang === 'zh' ? 'zh' : 'en', muted: value.muted !== false, playStyle:value.playStyle==='guided'?'guided':'settlement', colonies:{}, nick: String(value.nick || '').replace(/[\u0000-\u001f\u007f<>]/g,'').slice(0,12).trim(), saves: {} };
      for (const level of C.LEVEL_ORDER) {
        const s = value.saves?.[level];
        const colony=value.colonies?.[level];
        if(validState(colony)&&colony.settlement){colony.snap=null;window.OX_PROGRESS.ensure(colony);colony.completedChoices||=[];colony.eventStarts||=[];colony.eventEnds||=[];out.colonies[level]=colony;}
        if (validState(s)) {
          // Older session snapshots are intentionally discarded; they can contain nested saves.
          window.OX_PROGRESS.ensure(s);
          s.snap = null;
          s.completedChoices ||= []; s.eventStarts ||= []; s.eventEnds ||= [];
          out.saves[level] = s;
        }
      }
      return out;
    } catch { return {}; }
  }
  function recover(s) {
    for (const k of ['survival','air','power','water','food','rad']) s.m[k] = C.START[k];
    s.snap = null;
    return s;
  }
  function nasaLink(value) {
    try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && (u.hostname === 'nasa.gov' || u.hostname.endsWith('.nasa.gov')); } catch { return false; }
  }
  window.OX_STATE = Object.freeze({validState, readStore, recover, nasaLink});
})();
