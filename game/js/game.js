/* OxyNest Moon Base: game logic. Plain JavaScript, no frameworks, no network requests.
   Saves only to localStorage. Every outcome is fixed (no random numbers anywhere). */
(function () {
  'use strict';
  const I = window.OX_I18N, C = window.OX_CONTENT, ART = window.OX_ART;
  const SFX = Object.freeze({play(){},unlock(){},setMuted(){},isMuted:()=>true});
  const P = window.OX_PROGRESS, SO=window.OX_SETTLEMENT;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const clone = o => JSON.parse(JSON.stringify(o));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const ABORT = { isAbort: true };

  const GROUND = ART.GROUND, DOME_X = ART.DOME_X, SPOTS = ART.SPOTS, ICES = ART.ICES, SLOT_X = ART.SLOT_X;
  const IDLE_X = 738;
  const DIG_STAND = SPOTS.map(p => ({ x: p.x + 36, y: GROUND }));
  const ICE_STAND = [{ x: 1124, y: 616 }, { x: 1166, y: 628 }, { x: 1208, y: 626 }];
  const CRATER_EDGE = { x: 1094, y: GROUND };
  const METERS = ['survival', 'air', 'power', 'water', 'food', 'rad'];
  const METER_ICON = { survival: 'heart', air: 'air', power: 'power', water: 'water', food: 'food', rad: 'rad' };
  const EVENT_NEED = { night: 'battery', storm: 'shelter' };
  const LEVEL_ICON = { explorer: 'star', engineer: 'gear', commander: 'rocket' };
  const LEVEL_CAT = { explorer: 'food', engineer: 'power', commander: 'rad' };

  // ------------------------------------------------------------------ saved preferences and games
  const KEY = 'oxynest-kids-v1';
  let store = {};
  try { store = window.OX_STATE.readStore(localStorage.getItem(KEY) || '{}'); } catch (e) { store = {}; }
  if (!store.saves || typeof store.saves !== 'object') store.saves = {};
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(store)); $('#storageNote').hidden = true; } catch (e) { $('#storageNote').hidden = false; } }

  // ------------------------------------------------------------------ text
  let lang = store.lang === 'zh' ? 'zh' : 'en';
  function has(key) { return (I[lang] && I[lang][key] != null) || I.en[key] != null; }
  function resolveVars(vars) {
    if (!vars) return vars;
    const out = {};
    for (const k in vars) {
      const v = vars[k];
      out[k] = v && typeof v === 'object' && v.k ? t(v.k, v.vars) : v;
    }
    return out;
  }
  function t(key, vars) {
    let s = I[lang] && I[lang][key];
    if (s == null) s = I.en[key];
    if (s == null) { console.warn('Missing text:', key); s = key; }
    if (vars) {
      const r = resolveVars(vars);
      s = s.replace(/\{(\w+)\}/g, (m, k) => (r[k] != null ? r[k] : m));
    }
    return s;
  }
  // Level-tiered text: .kid for Explorer, .pro for Commander, plain key otherwise.
  function tt(key, vars) {
    if (G.level === 'explorer' && has(key + '.kid')) return t(key + '.kid', vars);
    if (G.level === 'commander' && has(key + '.pro')) return t(key + '.pro', vars);
    return t(key, vars);
  }

  // ------------------------------------------------------------------ state
  const G = {
    screen: 'start', level: null, cfg: null, st: null,
    mode: 'base', modal: null, modalRender: null, modalOpts: null,
    run: 0, walkId: 0,
    busyKey: null, busyIcon: null,
    choice: null, dig: null, digTimer: 0, cd: null,
    lastInput: Date.now(),
    bubble: null, bubbleTimer: 0,
    hint: null, hintSig: '', hlEl: null,
    mood: null, moodTimer: 0,
    buildSlot: -1, buildPage: 0, buildNeed: false,
    infoSlot: -1, infoConfirm: false, infoNeed: false,
    procNeed: null, cardCtx: null, warn: null, summary: null, failed: false,
    scale: 1, astroX: IDLE_X, astroY: GROUND, facing: 1, startNew: null
  };

  function newState() {
    const s = C.START;
    return {
      v: 1, started: false, session: 0, step: 0,
      m: { survival: s.survival, air: s.air, power: s.power, water: s.water, food: s.food, rad: s.rad },
      rocks: s.rocks, ice: s.ice, stars: s.stars,
      slots: [null, null, null, null, null, null],
      book: [], done: {}, log: null, snap: null, freeIdx: 0, completedChoices: [], eventStarts: [], eventEnds: [],
      flags: { mine: false }, runs: { dig: 0, mine: 0 }, badges: [], patched: false, expedition: P.fresh()
    };
  }
  function saveGame() { if (G.st && G.level) { const bucket=isColony()?(store.colonies||(store.colonies={})):store.saves;bucket[G.level]=G.st;persist(); } }

  // ------------------------------------------------------------------ async helpers (every flow stops cleanly on restart)
  const waits = {};
  function waitAct(name) {
    const run = G.run;
    return new Promise((res, rej) => { waits[name] = { res, rej, run }; });
  }
  function act(name, val) {
    const w = waits[name];
    if (!w) return false;
    delete waits[name];
    if (w.run === G.run) w.res(val); else w.rej(ABORT);
    return true;
  }
  function clearWaits() { Object.keys(waits).forEach(k => { const w = waits[k]; delete waits[k]; w.rej(ABORT); }); }
  function sleep(ms) {
    const run = G.run;
    return new Promise((res, rej) => setTimeout(() => (run === G.run ? res() : rej(ABORT)), ms));
  }
  function flow(fn) {
    return Promise.resolve().then(fn).catch(e => { if (!e || !e.isAbort) console.error(e); });
  }

  // ------------------------------------------------------------------ elements
  const stage = $('#stage');
  $('#sceneWrap').innerHTML = ART.scene();
  $('#pointer').innerHTML = ART.pointer();
  const svg = $('#sceneSvg');
  const astro = $('#astro'), astroBody = $('#astroBody');

  function fit() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    G.scale = s;
    stage.style.setProperty('--s', s);
  }
  window.addEventListener('resize', fit);
  fit();

  // ------------------------------------------------------------------ astronaut
  function setAstro(x, y) {
    G.astroX = x; G.astroY = y;
    astro.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
  }
  function setFacing(f) {
    G.facing = f;
    astroBody.setAttribute('transform', f < 0 ? 'scale(-1,1)' : '');
  }
  function walkTo(x, y, speed) {
    const run = G.run, id = ++G.walkId;
    speed = speed || 175;
    return new Promise((res, rej) => {
      const sx = G.astroX, sy = G.astroY;
      const dist = Math.hypot(x - sx, y - sy);
      if (dist < 1) { setAstro(x, y); return res(); }
      const dur = dist / speed * 1000;
      if (Math.abs(x - sx) > 2) setFacing(x < sx ? -1 : 1);
      astro.classList.add('walking');
      const t0 = performance.now();
      function step(now) {
        if (run !== G.run) { astro.classList.remove('walking'); return rej(ABORT); }
        if (id !== G.walkId) return res();
        const k = Math.min(1, (now - t0) / dur);
        setAstro(sx + (x - sx) * k, sy + (y - sy) * k);
        if (k < 1) requestAnimationFrame(step);
        else { astro.classList.remove('walking'); res(); }
      }
      requestAnimationFrame(step);
    });
  }
  function astroHurt() { astro.classList.remove('hurt'); void astro.getBBox(); astro.classList.add('hurt'); setTimeout(() => astro.classList.remove('hurt'), 800); }

  // ------------------------------------------------------------------ scene helpers
  function bldEl(i) { return $(`#bw${i} .bld`); }
  function slotOf(type) { return G.st ? G.st.slots.findIndex(s => s && s.type === type) : -1; }
  function hasBuilding(type) { return slotOf(type) >= 0; }
  function bld(type) { const i = slotOf(type); return i >= 0 ? bldEl(i) : null; }
  function allBld(fn) { $$('#slots .bld').forEach(fn); }
  function firstEmptySlot() {
    for (const i of C.SLOT_PREF) if (!G.st.slots[i]) return i;
    return -1;
  }
  function renderSlot(i, pop) {
    const s = G.st.slots[i];
    const wrap = $('#bw' + i), g = $('#slot' + i);
    g.classList.toggle('filled', !!s);
    if (!s) { wrap.innerHTML = ''; }
    else {
      wrap.innerHTML = ART.building(s.type, s.lv, { grown: s.type === 'greenhouse' && G.st.done.plants, lvText: t('info.lv', { n: s.lv }) });
      const b = $('.bld', wrap);
      if (!pop) b.classList.add('nopop');
      if (s.type === 'greenhouse' && G.st.done.plants) b.classList.add('lit');
    }
    const hit = $('.hit', g);
    hit.setAttribute('aria-label', s ? `${t(`b.${s.type}.name`)} ${t('info.lv', { n: s.lv })}` : t('ui.slot', { n: i + 1 }));
  }
  function renderSlots() { for (let i = 0; i < 6; i++) renderSlot(i, false); }
  function darken(a) { $('#nightOverlay').setAttribute('opacity', a); }
  function show(sel, on) { const e = $(sel); if (e) e.classList.toggle('hide', !on); }
  function resetSceneFx() {
    darken(0);
    $('#sun').classList.remove('set', 'storm');
    show('#flare', false); show('#stormFx', false); show('#meteorFx', false); show('#puffs', false);
    show('#impact', false); show('#domeGlow', false); show('#dustCloud', false); show('#hitSpot', false);
    const patched = G.st && G.st.patched;
    show('#crack', patched); show('#patch', patched);
    $('#stormFx').classList.remove('strong'); $('#puffs').classList.remove('big');
    astro.classList.remove('inside', 'walking', 'digging', 'lamp', 'hurt', 'swing');
    G.walkId++;
    setAstro(IDLE_X, GROUND); setFacing(1);
    show('#o2ring', false);
    resetSpots();
    if (G.st) renderSlots();
  }
  function resetSpots() {
    $$('#pile .spot').forEach(s => s.classList.remove('active', 'done'));
    $$('#crater .icechunk').forEach(s => s.classList.remove('active', 'done'));
    const cr = $('#crater'); cr.classList.add('dark'); cr.classList.remove('lit');
  }

  // ------------------------------------------------------------------ HUD
  function statusOf(k, v) {
    if (k === 'rad') return v <= 30 ? 'ok' : v <= 50 ? 'caution' : v <= 70 ? 'warning' : 'critical';
    return v >= 60 ? 'ok' : v >= 40 ? 'caution' : v >= 20 ? 'warning' : 'critical';
  }
  // Explorer sees counts as dots (no numbers): big icons for each ten, dots for the rest.
  function countVis(n, kind) {
    if (G.cfg && G.cfg.numbers) return `<span class="val">${n}</span>`;
    const allTens = Math.floor(n / 10), tens = Math.min(2, allTens), ones = n - allTens * 10;
    const big = tens ? `<span class="bigs">${Array(tens).fill(ART.icon(kind === 'stars' ? 'star' : kind === 'ice' ? 'ice' : 'rock')).join('')}${allTens > 2 ? '<b class="more">+</b>' : ''}</span>` : '';
    let pips = '';
    const cells = tens ? ones : (ones <= 5 ? 5 : 10);
    for (let i = 0; i < cells; i++) pips += `<i class="${i < ones ? 'on' : ''}"></i>`;
    return `<span class="bigs">${big}<span class="pips ${kind === 'stars' ? 'star' : kind === 'ice' ? 'ice' : ''}">${pips}</span></span>`;
  }
  function renderHudStatic() {
    $$('#hud .stat').forEach(s => {
      const k = s.dataset.k;
      if (s.classList.contains('meter')) {
        s.innerHTML = `${ART.icon(METER_ICON[k])}<div class="col"><span class="lbl">${esc(t('hud.' + k))}</span><div class="barrow"><div class="bar" role="meter" aria-valuemin="0" aria-valuemax="100"><div class="fill"></div></div><span class="sic"></span></div></div>`;
      } else {
        s.innerHTML = `${ART.icon(k === 'rocks' ? 'rock' : 'star')}<div class="col"><span class="lbl">${esc(t('hud.' + k))}</span><span class="cnt"></span></div>`;
      }
      const help=document.createElement('button');help.className='stat-help';help.type='button';help.textContent='!';help.dataset.explain=k;help.setAttribute('aria-label',t('play.info',{name:t('hud.'+k)}));s.append(help);
    });
    updateHud();
  }
  function updateHud() {
    const st = G.st;
    if (!st) return;
    METERS.forEach(k => {
      const s = $(`#hud .stat[data-k="${k}"]`);
      const v = Math.round(st.m[k]), lv = statusOf(k, v);
      const fill = $('.fill', s), bar = $('.bar', s), sic = $('.sic', s);
      if (!fill) return;
      fill.style.width = v + '%';
      fill.style.backgroundColor = ART.statusColor(lv);
      if (sic.dataset.lv !== lv) { sic.innerHTML = ART.statusIcon(lv); sic.dataset.lv = lv; }
      const label = `${t('hud.' + k)}: ${t('st.' + lv)}`;
      bar.setAttribute('aria-valuenow', v);
      bar.setAttribute('aria-label', label);
      s.title = G.cfg && G.cfg.numbers ? `${label} (${v}%)` : label;
    });
    ['rocks', 'stars'].forEach(k => {
      const s = $(`#hud .stat[data-k="${k}"] .cnt`);
      if (s) s.innerHTML = countVis(st[k], k);
      const box = $(`#hud .stat[data-k="${k}"]`);
      if (box) box.title = `${t('hud.' + k)}: ${st[k]}`;
    });
  }
  function pulseStat(k) {
    const s = $(`#hud .stat[data-k="${k}"]`);
    if (!s) return;
    s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse');
  }
  function stagePoint(el) {
    const r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect(), s = G.scale;
    return { x: (r.left + r.width / 2 - sr.left) / s, y: (r.top + r.height / 2 - sr.top) / s, top: (r.top - sr.top) / s, bottom: (r.bottom - sr.top) / s, w: r.width / s, h: r.height / s };
  }
  function showDelta(k, d) {
    const s = $(`#hud .stat[data-k="${k}"]`);
    if (!s || !d) return;
    pulseStat(k);
    const p = stagePoint(s);
    const e = document.createElement('div');
    e.className = 'delta';
    const up = d > 0;
    const good = k === 'rad' ? !up : up;
    const num = G.cfg && G.cfg.numbers ? `${up ? '+' : ''}${Math.round(d)}` : '';
    e.innerHTML = `${ART.icon(up ? 'up' : 'up', up ? '' : 'flip')}${num}`;
    if (!up) e.querySelector('.ico').style.transform = 'rotate(180deg)';
    e.setAttribute('data-good', good ? '1' : '0');
    e.style.left = (p.x - 18) + 'px';
    e.style.top = (p.bottom + 4) + 'px';
    $('#fly').appendChild(e);
    setTimeout(() => e.remove(), 1500);
  }
  function applyEffects(fx) {
    if (!fx || !G.st) return;
    const st = G.st;
    Object.keys(fx).forEach(k => {
      const d = fx[k];
      if (!d) return;
      if (k === 'o2') { if (G.dig) { G.dig.o2 = clamp(G.dig.o2 + d, 0, 1); updateO2(); } return; }
      if (k === 'rocks' || k === 'ice' || k === 'stars') {
        const before = st[k];
        st[k] = Math.max(0, st[k] + d);
        if (k !== 'ice' && st[k] !== before) showDelta(k, st[k] - before);
        return;
      }
      if (st.m[k] == null) return;
      const before = st.m[k];
      st.m[k] = clamp(before + d, 0, 100);
      if (st.m[k] !== before) showDelta(k, st.m[k] - before);
    });
    updateHud(); renderMascot(); renderActions();
  }
  function flyStars(n) {
    const target = $('#hud .stat[data-k="stars"]');
    if (!target || !n) return;
    const tp = stagePoint(target);
    for (let i = 0; i < n; i++) {
      const f = document.createElement('div');
      f.className = 'flyer';
      f.innerHTML = ART.icon('star');
      f.style.left = (600 + i * 30) + 'px';
      f.style.top = '420px';
      $('#fly').appendChild(f);
      setTimeout(() => { f.style.left = (tp.x - 17) + 'px'; f.style.top = (tp.y - 17) + 'px'; f.style.transform = 'scale(.6)'; }, 60 + i * 140);
      setTimeout(() => { f.remove(); SFX.play('star'); pulseStat('stars'); }, 900 + i * 140);
    }
  }

  // ------------------------------------------------------------------ mascot, bubble
  function baseMood() {
    if (!G.st) return 'happy';
    const s = G.st.m.survival;
    return s >= 55 ? 'happy' : s >= 30 ? 'neutral' : 'worried';
  }
  function renderMascot() {
    const mood = G.mood || baseMood();
    const box = $('#gMascot');
    if (box.dataset.mood !== mood) { box.innerHTML = ART.mascot(mood); box.dataset.mood = mood; }
    box.classList.toggle('cheer', mood === 'cheer');
  }
  function setMascot(mood, ms) {
    G.mood = mood;
    clearTimeout(G.moodTimer);
    renderMascot();
    if (ms) G.moodTimer = setTimeout(() => { G.mood = null; renderMascot(); }, ms);
  }
  function say(key, vars, ms) {
    G.bubble = { key, vars };
    renderBubble();
    clearTimeout(G.bubbleTimer);
    const dur = ms == null ? 4500 : ms;
    if (dur) G.bubbleTimer = setTimeout(() => { G.bubble = null; renderBubble(); }, dur);
  }
  function renderBubble() {
    const b = $('#bubble');
    if (!G.bubble || G.modal) { b.hidden = true; return; }   // an open panel speaks for itself
    b.textContent = tt(G.bubble.key, G.bubble.vars);
    b.hidden = false;
  }

  // ------------------------------------------------------------------ the Next step banner and the arrow
  function digMoreHint() { return { icon: 'rock', key: 'hint.digMore', target: '#btnGo' }; }
  function slotTarget() { const i = firstEmptySlot(); return i >= 0 ? `#slot${i} .plus` : null; }
  function recipeShort(id) {
    const r = C.RECIPES[id];
    if (G.st.rocks < (r.use.rocks || 0)) return 'rocks';
    if (G.st.ice < (r.use.ice || 0)) return 'ice';
    if (G.st.m.power < (r.use.power || 0)) return 'power';
    return null;
  }
  function goalType() {
    const s = sessionDef();
    if (!s) return null;
    for (let i = G.st.step; i < s.steps.length; i++) {
      const p = s.steps[i];
      if (p.type === 'build' && !hasBuilding(p.b)) return p.b;
      if (p.type === 'pick') return i === G.st.step ? '*pick' : null;
    }
    return null;
  }
  function buildState(type) {
    if(isColony())return 'ok';
    if (hasBuilding(type)) return 'built';
    if (isFree()) return 'ok';
    const g = goalType();
    if (g === type) return 'ok';
    if (g === '*pick') { const step = currentStep(); if (step.from.includes(type)) return 'ok'; }
    return 'locked';
  }
  function buildableTypes() { return C.BUILD_ORDER.filter(b => buildState(b) === 'ok'); }

  function computeHint() {
    if (G.screen === 'start') return { icon: 'star', key: 'hint.pickLevel', target: '#levelCards .lvwrap:nth-child(1) .level-card' };
    if(isColony()&&['orders','industry','colonyWin'].includes(G.modal))return {icon:'dome',key:'colony.choose',target:null};
    if (G.modal === 'workshop') return {icon:'gear',key:'play.tools',target:'#playClose'};
    if (G.modal === 'minemap') return {icon:'pick',key:'play.choose',target:'#zone-0'};
    if (G.modal === 'fail') return { icon: 'refresh', key: 'hint.failed', target: '#failTry' };
    if (G.modal === 'card') return { icon: 'book', key: G.cardCtx && G.cardCtx.fromBook ? 'hint.goBackPage' : 'hint.card', target: '#cardOk' };
    if (G.modal === 'choice') {
      if (G.choice && G.choice.wrongOpt) return { icon: 'refresh', key: 'hint.retry', target: '#retryBtn' };
      // Neutral: point at the question, never at one answer. All answers pulse together.
      return { icon: 'question', key: 'hint.choose', target: '#choiceQ', side: 'left' };
    }
    if (G.modal === 'summary') return { icon: 'play', key: G.summary && G.summary.nextFree ? 'hint.keep' : 'hint.next', target: '#sumNext' };
    if (G.modal === 'book') return { icon: 'close', key: 'hint.close', target: '#bookClose' };
    if (G.modal === 'build') return buildHint();
    if (G.modal === 'info') return infoHint();
    if (G.modal === 'process') return procHint();
    if (G.mode === 'dig') return digHint();
    if (G.mode === 'busy' || !G.st) return { icon: G.busyIcon || 'helmet', key: G.busyKey || 'hint.working', target: null };
    return baseHint();
  }
  function baseHint() {
    if(isColony())return {icon:'dome',key:G.moveSlot>=0?'colony.pickPlot':'colony.choose',target:null};
    const step = currentStep(), st = G.st;
    if (!step) return { icon: 'play', key: 'hint.working', target: null };
    switch (step.type) {
      case 'dig': return { icon: 'pick', key: 'hint.dig', target: '#btnGo' };
      case 'mine': return { icon: 'ice', key: 'hint.mine', target: '#btnIce' };
      case 'build': {
        if (hasBuilding(step.b)) return { icon: 'hammer', key: 'hint.working', target: null };
        if (st.rocks < C.BUILDINGS[step.b].cost) return digMoreHint();
        return { icon: 'hammer', key: 'hint.build', vars: { b: { k: `b.${step.b}.a` } }, target: slotTarget() };
      }
      case 'pick': {
        const cheapest = Math.min.apply(null, step.from.map(b => C.BUILDINGS[b].cost));
        if (st.rocks < cheapest) return digMoreHint();
        return { icon: 'hammer', key: 'hint.pickOwn', target: slotTarget() };
      }
      case 'process': {
        const short = recipeShort(C.CHOICES[step.choice].recipe);
        if (short === 'rocks') return digMoreHint();
        if (short === 'ice') return { icon: 'ice', key: 'hint.needIce', target: '#btnIce' };
        return { icon: 'gear', key: 'hint.process', target: '#btnProc' };
      }
      default: return freeHint();
    }
  }
  function cheapestUpgrade() {
    let best = -1, cost = 1e9;
    G.st.slots.forEach((s, i) => {
      if (s && s.lv < C.MAX_LV) { const c = C.UPGRADE_COST[s.lv + 1]; if (c < cost) { cost = c; best = i; } }
    });
    return { i: best, cost };
  }
  function freeHint() {
    const st = G.st;
    if (hasBuilding('processor')) {
      if (st.m.air < 40 && !recipeShort('rocksAir')) return { icon: 'air', key: 'hint.makeAir', target: '#btnProc' };
      if (st.m.water < 40 && !recipeShort('iceWater')) return { icon: 'water', key: 'hint.makeWater', target: '#btnProc' };
    }
    const empty = firstEmptySlot();
    const unbuilt = C.BUILD_ORDER.filter(b => !hasBuilding(b));
    if (empty >= 0 && unbuilt.length) {
      const cheapest = Math.min.apply(null, unbuilt.map(b => C.BUILDINGS[b].cost));
      if (st.rocks >= cheapest) return { icon: 'hammer', key: 'hint.newBuilding', target: `#slot${empty} .plus` };
    }
    const up = cheapestUpgrade();
    if (up.i >= 0 && st.rocks >= up.cost) return { icon: 'up', key: 'hint.upgrade', target: `#bw${up.i}` };
    return digMoreHint();
  }
  function buildHint() {
    const st = G.st, goal = goalType();
    const single = goal && goal !== '*pick' && !isFree();
    if (G.buildNeed || (single && st.rocks < C.BUILDINGS[goal].cost)) return { icon: 'rock', key: 'hint.digMore', target: '#needGo' };
    if (single) {
      const page = C.BUILDINGS[goal].page;
      if (page !== G.buildPage) return { icon: 'plus', key: page > G.buildPage ? 'hint.seeMore' : 'hint.goBackPage', target: '#pageBtn' };
      return { icon: 'hammer', key: 'hint.tapBuild', target: `#bb-${goal}` };
    }
    const ok = buildableTypes().filter(b => st.rocks >= C.BUILDINGS[b].cost);
    const here = ok.filter(b => C.BUILDINGS[b].page === G.buildPage);
    if (here.length) return { icon: 'hammer', key: 'hint.tapBuild', target: `#bb-${here[0]}` };
    if (ok.length) return { icon: 'plus', key: G.buildPage === 0 ? 'hint.seeMore' : 'hint.goBackPage', target: '#pageBtn' };
    return { icon: 'rock', key: 'hint.digMore', target: '#needGo' };
  }
  function infoHint() {
    const s = G.st.slots[G.infoSlot];
    if (G.infoNeed) return { icon: 'rock', key: 'hint.digMore', target: '#needGo' };
    if (isFree() && s && s.lv < C.MAX_LV && G.st.rocks >= C.UPGRADE_COST[s.lv + 1] && !G.infoConfirm) {
      const fh = freeHint();
      if (fh.key === 'hint.upgrade' && fh.target === `#bw${G.infoSlot}`) return { icon: 'up', key: 'hint.tapUpgrade', target: '#upBtn' };
    }
    if (G.infoConfirm) return { icon: 'close', key: 'hint.close', target: '#removeNo' };
    return { icon: 'close', key: 'hint.close', target: '#infoClose' };
  }
  function procHint() {
    if (G.procNeed) return G.procNeed === 'ice' ? { icon: 'ice', key: 'hint.needIce', target: '#needGo' } : G.procNeed === 'rocks' ? { icon: 'rock', key: 'hint.digMore', target: '#needGo' } : { icon: 'close', key: 'hint.close', target: '#procClose' };
    const want = G.st.m.air <= G.st.m.water ? ['rocksAir', 'iceWater'] : ['iceWater', 'rocksAir'];
    for (const r of want) if (!recipeShort(r)) return { icon: 'gear', key: 'hint.pickRecipe', target: `#rc-${r}` };
    return { icon: 'close', key: 'hint.close', target: '#procClose' };
  }
  function digHint() {
    const D = G.dig;
    if (!D || D.walking || D.paused) return { icon: 'helmet', key: 'hint.walking', target: null };
    if (D.dust) return { icon: 'wind', key: 'hint.blow', target: '#btnBlow' };
    if (D.low) return { icon: 'dome', key: 'hint.goBack', target: '#btnBack' };
    return { icon: D.kind === 'dig' ? 'pick' : 'ice', key: D.kind === 'dig' ? 'hint.tapDig' : 'hint.tapIce', target: '#hitSpot' };
  }

  function refreshHint() {
    renderMission();
    const h = computeHint();
    G.hint = h;
    const sig = h ? `${h.icon}|${t(h.key, h.vars)}` : '';
    if (sig !== G.hintSig) {
      G.hintSig = sig;
      if (G.bubble && G.bubble.fromHint) { G.bubble = null; renderBubble(); }
      $('#bIcon').innerHTML = h ? ART.icon(h.icon) : '';
      $('#bText').textContent = h ? t(h.key, h.vars) : '';
      const g = $('#guide');
      g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash');
    }
  }
  function targetEl() {
    const h = G.hint;
    if (!h || !h.target) return null;
    const el = $(h.target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    return el;
  }
  function tickPointer() {
    requestAnimationFrame(tickPointer);
    const p = $('#pointer'), ring = $('#hlRing');
    const el = targetEl();
    if (G.hlEl && G.hlEl !== el) { G.hlEl.classList.remove('hl'); G.hlEl = null; }
    if (!el) { p.hidden = true; ring.classList.add('hide'); G.ptrEl = null; return; }
    // A new target: jump there at once instead of gliding across the screen.
    if (G.ptrEl !== el) { p.style.transition = 'none'; requestAnimationFrame(() => { p.style.transition = ''; }); G.ptrEl = el; }
    const pt = stagePoint(el);
    // Point from below when the target is near the top, or inside a panel (so the arrow never covers its text).
    const inPanel = !!el.closest && !!el.closest('#modal, #warn');
    const below = (G.hint.below || pt.top < 150 || inPanel) && pt.bottom + 82 <= 716;
    p.hidden = false;
    const left = G.hint.side === 'left';
    p.classList.toggle('left', left);
    p.classList.toggle('up', !left && below);
    if (left) {
      p.style.left = (pt.x - pt.w / 2 - 44) + 'px';
      p.style.top = (pt.y - 39) + 'px';
    } else {
      p.style.left = pt.x + 'px';
      p.style.top = (below ? pt.bottom + 4 : pt.top - 80) + 'px';
    }
    const inSvg = el instanceof SVGElement;
    if (inSvg) {
      if (G.hlEl) { G.hlEl.classList.remove('hl'); G.hlEl = null; }
      const m = svg.getScreenCTM();
      if (m) {
        const r = el.getBoundingClientRect();
        const q = svg.createSVGPoint();
        q.x = r.left + r.width / 2; q.y = r.top + r.height / 2;
        const s = q.matrixTransform(m.inverse());
        const rad = Math.max(26, Math.min(70, Math.max(r.width, r.height) / m.a / 2 + 10));
        ring.setAttribute('transform', `translate(${s.x.toFixed(1)},${s.y.toFixed(1)})`);
        $$('circle', ring).forEach(c => c.setAttribute('r', rad.toFixed(1)));
        ring.classList.remove('hide');
      }
    } else {
      ring.classList.add('hide');
      if (G.hlEl !== el && el.classList.contains('btn')) { el.classList.add('hl'); G.hlEl = el; }
    }
  }
  function pointAgain(fromHelp, keepBubble) {
    refreshHint();
    const h = G.hint;
    if (!h) return;
    const p = $('#pointer');
    p.classList.remove('nudge'); void p.offsetWidth; p.classList.add('nudge');
    setTimeout(() => p.classList.remove('nudge'), 1800);
    if (!keepBubble) {
      G.bubble = { key: h.key, vars: h.vars, fromHint: true };
      renderBubble();
      clearTimeout(G.bubbleTimer);
      G.bubbleTimer = setTimeout(() => { G.bubble = null; renderBubble(); }, 3500);
    }
    setMascot('point', 2000);
    const g = $('#guide');
    g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash');
    if (fromHelp || targetEl()) SFX.play('ding');
  }
  // Idle for 8 seconds: point again.
  document.addEventListener('pointerdown', () => { G.lastInput = Date.now(); SFX.unlock(); }, true);
  document.addEventListener('keydown', () => { G.lastInput = Date.now(); }, true);
  setInterval(() => {
    refreshHint();
    if (Date.now() - G.lastInput >= 8000) {
      G.lastInput = Date.now();
      if (targetEl() && !(G.cd && G.cd.paused)) pointAgain(false);
    }
  }, 500);

  // ------------------------------------------------------------------ modal manager
  function openModal(name, render, opts) {
    G.modal = name; G.modalRender = render; G.modalOpts = opts || {};
    const back = $('#modalBack');
    back.className = (opts && opts.mid) ? 'mid' : '';
    back.hidden = false;
    $('#sceneWrap').inert = true;
    render();
    renderActions();
    renderBubble();
    refreshHint();
    const first = $('#modal [data-focus]') || $('#modal .btn:not(:disabled)');
    if (first) try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function closeModal() {
    G.modal = null; G.modalRender = null;
    $('#modalBack').hidden = true;
    $('#modal').innerHTML = '';
    $('#sceneWrap').inert = false;
    renderActions();
    renderBubble();
    refreshHint();
  }
  $('#modal').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    onModalAct(b.dataset.act, b.dataset.val);
  });

  function onModalAct(a, v) {
    SFX.play('tap');
    switch (a) {
      case 'colonyStart': if(isColony()&&SO.start(G.st,G.infoSlot,v)){saveGame();updateHud();renderIndustry();renderMission();} return;
      case 'colonyCollect': if(isColony())collectColony(v);return;
      case 'colonyDeliver': if(isColony()){const [id,serial]=v.split(':');if(SO.deliver(G.st,id,Number(serial))){saveGame();updateHud();renderOrders();renderMission();checkColonyWin();}}return;
      case 'colonyExpand': if(isColony()&&SO.upgrade(G.st)){saveGame();renderOrders();renderMission();checkColonyWin();}return;
      case 'colonyUse': if(isColony()&&SO.use(G.st,v)){saveGame();updateHud();renderOrders();}return;
      case 'colonyMove': G.moveSlot=G.infoSlot;closeModal();refreshHint();return;
      case 'colonyLeave': closeModal();goStart();return;
      case 'tool': if(P.buy(G.st,v)){saveGame();updateHud();renderWorkshop();} return;
      case 'zone': if(P.unlocked(G.st,Number(v))){P.ensure(G.st).zone=Number(v);saveGame();closeModal();startDig('dig');} return;
      case 'pick': case 'retry': case 'cardOk': case 'sumNext': act(a, v); return;
      case 'close': closeModal(); return;
      case 'build': onBuildPick(v); return;
      case 'page': G.buildPage = G.buildPage ? 0 : 1; renderBuild(); refreshHint(); return;
      case 'goDig': closeModal(); startDig('dig'); return;
      case 'goMine': closeModal(); startDig('mine'); return;
      case 'upgrade': onUpgrade(); return;
      case 'remove': G.infoConfirm = true; renderInfo(); refreshHint(); return;
      case 'removeNo': G.infoConfirm = false; renderInfo(); refreshHint(); return;
      case 'removeYes': doRemove(); return;
      case 'proc': onProc(v); return;
      case 'learn': if (G.cardCtx) { G.cardCtx.src = !G.cardCtx.src; renderCard(); } return;
      case 'bookCard': G.cardCtx = { id: v, fromBook: true, review: true, src: false }; G.modal = 'card'; G.modalRender = renderCard; renderCard(); refreshHint(); SFX.play('page'); return;
      case 'bookBack': G.modal = 'book'; G.modalRender = renderBook; renderBook(); refreshHint(); return;
      case 'failTry': failTry(); return;
      case 'failQuit': failQuit(); return;
      default:
    }
  }

  // ------------------------------------------------------------------ bottom bar
  function renderActions() {
    const game = G.screen === 'game' && G.st;
    const baseOn = game && G.mode === 'base' && !G.modal;
    $('#actions').hidden = !baseOn;
    if (game) {
      const st = G.st;
      $('#btnOrders').hidden=!isColony();$('#btnOrders').textContent=t('colony.hub');
      $('#btnTools').hidden = !isColony()&&st.runs.dig===0;
      $('#btnTools').innerHTML=ART.icon('gear')+'<span>'+esc(t('play.tools'))+'</span>';
      $('#btnGo').hidden = false;
      $('#btnGo').innerHTML = `${ART.icon('helmet')}<span>${esc(t('btn.goOutside'))}</span>`;
      $('#btnIce').hidden = !st.flags.mine;
      $('#btnIce').innerHTML = `${ART.icon('ice')}<span>${esc(t('btn.mineIce'))}</span>`;
      $('#btnProc').hidden = isColony()||!hasBuilding('processor');
      $('#btnProc').innerHTML = `${ART.icon('gear')}<span>${esc(t('btn.process'))}</span><span class="badgecount" title="${esc(t('hud.ice'))}">${ART.icon('ice')}${countVis(st.ice, 'ice')}</span>`;
      $('#btnBook').hidden = st.book.length === 0;
      $('#btnBook').innerHTML = `${ART.icon('book')}<span>${esc(t('btn.book'))}</span>`;
    }
    $('#digbar').hidden = !(game && G.mode === 'dig' && G.dig && !G.modal);
    if (G.dig) renderDigbar();
    renderMineProgress();
  }
  function renderDigbar() {
    const D = G.dig;
    if (!D) return;
    $('#bag').innerHTML = `${ART.icon('bag')}<span>${esc(t('hud.bag'))}</span>${ART.icon(D.kind === 'dig' ? 'rock' : 'ice')}${countVis(D.bag, D.kind === 'dig' ? 'rocks' : 'ice')}`;
    const blow = $('#btnBlow');
    blow.hidden = !D.dust;
    blow.innerHTML = `${ART.icon('wind')}<span>${esc(t('btn.blow'))}</span>`;
    const back = $('#btnBack');
    back.innerHTML = `${ART.icon('dome')}<span>${esc(t('btn.goBack'))}</span>`;
    back.classList.toggle('secondary', !D.low);
  }
  $('#btnGo').addEventListener('click', () => { if(G.st.runs.dig===0)startDig('dig');else openModal('minemap',renderMineMap); });
  $('#btnTools').addEventListener('click',()=>{if(G.mode==='base'&&!G.modal)openModal('workshop',renderWorkshop);});
  $('#btnIce').addEventListener('click', () => { SFX.play('tap'); startDig('mine'); });
  $('#btnProc').addEventListener('click', () => { SFX.play('tap'); onProcessBtn(); });
  $('#btnBook').addEventListener('click', () => { SFX.play('tap'); openBook(); });
  $('#btnBlow').addEventListener('click', () => { SFX.play('tap'); blowDust(); });
  $('#btnBack').addEventListener('click', () => { SFX.play('tap'); if (G.dig && !G.dig.paused && !G.dig.walking) flow(() => endDig('home')); });

  // ------------------------------------------------------------------ top corner: home, sound, language
  function renderCorner() {
    const hb = $('#homeBtn');
    hb.innerHTML = ART.icon('home') + '<span>' + esc(t('btn.quit')) + '</span>';
    $('#playerName').textContent = store.nick || '';
    $('#playerName').hidden = !store.nick;
    hb.setAttribute('aria-label', t('ui.home')); hb.title = t('ui.home');
    const help = $('#helpBtn');
    help.innerHTML = ART.icon('question');
    help.setAttribute('aria-label', t('ui.help')); help.title = t('ui.help');
    $$('.lang button').forEach(b => { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    $('.lang').setAttribute('aria-label', t('ui.lang'));
  }
  $('#helpBtn').addEventListener('click', () => showExplanation());
  $('#homeBtn').addEventListener('click', () => { SFX.play('tap'); goStart(); });
  $$('.lang button').forEach(b => b.addEventListener('click', () => { SFX.play('tap'); setLang(b.dataset.lang); }));

  function applyStatic() {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
    document.title = `${t('app.name')} ${t('app.sub')}`;
    $$('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
    $('#nickInput').placeholder = t('start.nickPh');
    $('#hud').setAttribute('aria-label', `${t('hud.survival')}, ${t('hud.air')}, ${t('hud.power')}`);
    $('#hitPile').setAttribute('aria-label', t('ui.pile'));
    $('#hitCrater').setAttribute('aria-label', t('ui.crater'));
    $('#hitSpot').setAttribute('aria-label', t('ui.spot'));
  }
  function setLang(l) {
    lang = l === 'zh' ? 'zh' : 'en';
    store.lang = lang; persist();
    applyStatic(); renderCorner();
    if (G.screen === 'start') renderStart();
    else { renderHudStatic(); renderSlots(); renderActions(); }
    if (G.modalRender) G.modalRender();
    renderBubble(); renderWarn();
    G.hintSig = ''; refreshHint();
  }

  // ------------------------------------------------------------------ start screen
  function renderStart() {
    $$('[data-play-style]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.playStyle===(store.playStyle||'settlement')));b.classList.toggle('secondary',b.dataset.playStyle!==(store.playStyle||'settlement'));});
    const wrap = $('#levelCards');
    wrap.innerHTML = C.LEVEL_ORDER.map(lv => {
      const s = saveBucket()[lv];
      const started = s && s.started;
      const prog = s?.settlement ? t('colony.goal',{n:s.settlement.level}) : s?.campaignComplete ? t('play.complete') : started ? (s.session >= C.SESSIONS.length ? t('start.free') : t('start.mission', { n: s.session + 1 })) : '';
      const confirm = G.startNew === lv;
      return `<div class="lvwrap" style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <button class="level-card" type="button" data-level="${lv}">
          <span class="strip cat-${LEVEL_CAT[lv]}"></span>
          <span class="lvart">${ART.icon(LEVEL_ICON[lv])}</span>
          <span class="lvname">${esc(t('lv.' + lv))}</span>
          <span class="lvage">${esc(t('lv.' + lv + '.age'))}</span>
          <span class="lvdesc">${esc(t('lv.' + lv + '.desc'))}</span>
          ${prog ? `<span class="prog">${esc(prog)}</span>` : ''}
          <span class="go">${ART.icon('play')}${esc(t(started ? 'start.continue' : 'start.play'))}</span>
        </button>
        ${started ? `<button class="newg" type="button" data-new="${lv}">${esc(t(confirm ? 'btn.startOver' : 'start.new'))}</button>` : ''}
      </div>`;
    }).join('');
    $$('.level-card', wrap).forEach(b => b.addEventListener('click', () => { SFX.play('tap'); startGame(b.dataset.level); }));
    $$('.newg', wrap).forEach(b => b.addEventListener('click', () => {
      SFX.play('tap');
      const lv = b.dataset.new;
      if (G.startNew === lv) { delete saveBucket()[lv]; persist(); G.startNew = null; }
      else G.startNew = lv;
      renderStart();
    }));
    const chips = $('#start .chips');
    chips.innerHTML = [1, 2, 3, 4].map(i => `<button type="button" class="btn chip" data-chip="${i}">${esc(t('start.chip' + i))}</button>`).join('');
    $$('.chip', chips).forEach(b => b.addEventListener('click', () => { SFX.play('tap'); setNick(t('start.chip' + b.dataset.chip)); $('#nickInput').value = store.nick; }));
    const inp = $('#nickInput');
    if (document.activeElement !== inp) inp.value = store.nick || '';
  }
  // The nickname is optional, never sent anywhere, and only ever shown as plain text.
  function setNick(v) {
    store.nick = String(v || '').replace(/[\u0000-\u001f\u007f<>]/g, '').slice(0, 12).trim();
    persist();
  }
  $('#nickInput').addEventListener('input', e => setNick(e.target.value));
  $('#nickInput').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });

  function goStart() {
    if (G.st) saveGame();
    G.moveSlot=-1;
    G.run++; clearWaits(); stopCountdown(); stopDigTimer();
    closeExplanation();
    G.dig = null; G.choice = null; G.failed = false; G.mood = null;
    if (G.modal) closeModal();
    hideWarn();
    G.screen = 'start'; G.st = null; G.level = null; G.cfg = null; G.mode = 'base';
    stage.classList.add('on-start');
    resetSceneFx();
    renderStart(); renderActions(); renderMascot();
    say('start.hello', null, 6000);
    refreshHint();
  }

  // ------------------------------------------------------------------ sessions and steps
  function sessionDef() { if(isColony())return null;return G.st ? C.SESSIONS[G.st.session] || null : null; }
  function isFree() { if(isColony())return true;return !!G.st && G.st.session >= C.SESSIONS.length; }
  function currentStep() {
    const s = sessionDef();
    if (!s) return isFree() ? { type: 'free' } : null;
    return s.steps[G.st.step] || null;
  }

  function startGame(level) {
    G.level = level; G.cfg = C.LEVELS[level];
    const saved = saveBucket()[level];
    G.st = saved && saved.v === 1 && saved.m ? saved : newState();
    if(store.playStyle!=='guided'){if(!saved){G.st.rocks=16;G.st.settlement=SO.fresh();}SO.ensure(G.st);G.st.flags.mine=true;}
    P.ensure(G.st);
    G.screen = 'game';
    renderCorner();
    stage.classList.remove('on-start');
    G.run++; clearWaits();
    G.moveSlot=-1;
    G.mood = null; G.mode = 'base';
    resetSceneFx();
    renderHudStatic(); renderSlots(); renderActions(); renderMascot();
    if (!G.st.started || !G.st.log) beginSession();
    else {
      const s = sessionDef();
      say(s ? s.say : 'say.free', null, 5000);   // remind the child what this mission is about
      if (!checkFail()) enterStep();
    }
  }
  function beginSession() {
    const st = G.st;
    if(isColony()){st.started=true;st.log=st.log||{cards:[],stars:0,max:0};saveGame();enterStep();return;}
    st.started = true; st.step = 0;
    st.log = { cards: [], stars: 0, max: 0 };
    if (st.session >= 1) st.flags.mine = true;
    st.snap = null;
    st.completedChoices = []; st.eventStarts = []; st.eventEnds = [];
    saveGame();
    const s = sessionDef();
    say(s ? s.say : 'say.free', null, 6500);
    enterStep();
  }
  function enterStep() {
    G.mode = 'base';
    renderActions(); updateHud(); renderMascot();
    const step = currentStep();
    if (!step) { flow(endSession); return; }
    if (step.type === 'build' && hasBuilding(step.b)) { G.mode = 'busy'; flow(() => afterBuild(step.b, step)); return; }
    refreshHint();
  }
  function completeStep() {
    G.st.step++;
    saveGame();
    enterStep();
  }
  function onActionDone(kind, info) {
    if(isColony()){G.mode='base';renderActions();refreshHint();saveGame();return;}
    const step = currentStep();
    if (step) {
      if (step.type === 'dig' && kind === 'dig') { completeStep(); return; }
      if (step.type === 'mine' && kind === 'mine') { completeStep(); return; }
      if (kind === 'build') {
        if (step.type === 'build' && info.type === step.b) { flow(() => afterBuild(info.type, step)); return; }
        if (step.type === 'pick' && step.from.includes(info.type)) { flow(() => afterBuild(info.type, step)); return; }
        if (step.type === 'free') { flow(() => afterFreeBuild(info.type)); return; }
      }
      if (kind === 'upgrade' && step.type === 'free') { flow(runFreeEvent); return; }
    }
    G.mode = 'base'; renderActions(); refreshHint();
  }
  async function afterBuild(type, step) {
    G.mode = 'busy'; G.busyKey = 'hint.working'; G.busyIcon = 'sparkle'; renderActions();
    const thens = step.type === 'pick' ? ['quiz:' + C.QUIZ_OF[type]] : (step.then || []);
    for (const th of thens) {
      const parts = th.split(':');
      if (parts[0] === 'event') await runEvent(parts[1]);
      else await runChoice(parts[1], {});
    }
    completeStep();
  }
  async function afterFreeBuild(type) {
    G.mode = 'busy'; G.busyKey = 'hint.working'; G.busyIcon = 'sparkle'; renderActions();
    const q = C.QUIZ_OF[type];
    if (q && !G.st.done[q]) await runChoice(q, {});
    else await runEvent(nextFreeEvent());
    endFreeCheck();
  }
  async function runFreeEvent() {
    G.mode = 'busy'; renderActions();
    await runEvent(nextFreeEvent());
    endFreeCheck();
  }
  function nextFreeEvent() {
    for (let k = 0; k < C.FREE_EVENTS.length; k++) {
      const id = C.FREE_EVENTS[G.st.freeIdx % C.FREE_EVENTS.length];
      G.st.freeIdx++;
      if (!EVENT_NEED[id] || hasBuilding(EVENT_NEED[id])) return id;
    }
    return 'leak';
  }
  function endFreeCheck() {
    saveGame();
    if (G.st.log.cards.length >= C.FREE_SESSION_CHOICES) { flow(endSession); return; }
    enterStep();
  }

  // ------------------------------------------------------------------ digging and ice mining
  function stopDigTimer() { clearInterval(G.digTimer); G.digTimer = 0; }
  function showO2(on) { show('#o2ring', on); }
  function updateO2() {
    const D = G.dig;
    if (!D) return;
    const v = clamp(D.o2, 0, 1);
    const lv = v >= 0.6 ? 'ok' : v >= 0.4 ? 'caution' : v >= 0.2 ? 'warning' : 'critical';
    const arc = $('#o2arc');
    arc.setAttribute('stroke-dashoffset', (113.1 * (1 - v)).toFixed(1));
    arc.setAttribute('stroke', ART.statusColor(lv));
    const s = $('#o2stat');
    if (s.dataset.lv !== lv) { s.innerHTML = ART.statusIcon(lv, 18); s.dataset.lv = lv; }
  }
  function placeHitSpot() {
    const D = G.dig, hs = $('#hitSpot');
    if (!D || D.ended) { hs.classList.add('hide'); return; }
    const p = D.kind === 'dig' ? SPOTS[D.i] : ICES[D.i];
    hs.setAttribute('cx', p.x); hs.setAttribute('cy', p.y - 8);
    hs.classList.remove('hide');
    $$(D.kind === 'dig' ? '#pile .spot' : '#crater .icechunk').forEach((e, i) => e.classList.toggle('active', i === D.i));
  }
  async function startDig(kind) {
    if (G.screen !== 'game' || G.mode !== 'base' || G.modal) return;
    if (kind === 'mine' && !G.st.flags.mine) return;
    const st = G.st;
    const tool=P.stats(st);
    stage.dataset.site=String(kind==='dig'?tool.zone:0);
    G.mode = 'busy'; G.busyKey = 'hint.walking'; G.busyIcon = 'helmet';
    renderActions(); refreshHint();
    const D = G.dig = { kind, zone:kind==='dig'?tool.zone:0, capacity:tool.capacity, strength:tool.strength, drain:tool.drain, i: 0, prog: 0, bag: 0, o2: 1, dust: false, low: false, lowDone: false, ended: null, paused: true, walking: true, first: st.runs[kind] === 0, run: G.run, slowSaid: 0 };
    st.runs[kind]++;
    resetSpots();
    updateO2(); showO2(true);
    stopDigTimer();
    const run = G.run;
    G.digTimer = setInterval(() => digTick(run), 100);
    await flow(async () => {
      if (kind === 'dig') {
        D.paused = false;
        await walkTo(DIG_STAND[0].x, DIG_STAND[0].y);
        setFacing(-1);
      } else {
        await walkTo(CRATER_EDGE.x, CRATER_EDGE.y);
        if (!st.done.ice&&!isColony()) await runChoice('ice', {});
        lampOn();
        D.paused = false;
        await walkTo(ICE_STAND[0].x, ICE_STAND[0].y);
        setFacing(1);
      }
      if (D.ended) return;
      G.mode = 'dig';
      D.walking = false;
      astro.classList.add('digging');
      prepareSpot();
      renderActions(); refreshHint();
    });
  }
  function lampOn() {
    astro.classList.add('lamp');
    const cr = $('#crater'); cr.classList.remove('dark'); cr.classList.add('lit');
  }
  function digTick(run) {
    const D = G.dig;
    if (run !== G.run || !D || D.ended) { if (run !== G.run) stopDigTimer(); return; }
    if (document.hidden || !$('#explainPanel').hidden || D.paused || G.modal) return;
    D.o2 -= G.cfg.dig.drain * 0.1 * D.drain * (1+D.zone*.2);
    updateO2();
    checkO2();
  }
  function checkO2() {
    const D = G.dig;
    if (!D || D.ended || D.paused) return;
    if (D.o2 <= 0) { D.o2 = 0; updateO2(); say('say.noAir', null, 4000); flow(() => endDig('noAir')); return; }
    if (D.o2 <= 0.3 && !D.lowDone) {
      D.lowDone = true;
      if (!G.st.done.suitAir&&!isColony()) {
        D.paused = true;
        flow(async () => {
          await runChoice('suitAir', {});
          await endDig('home');
        });
      } else {
        D.low = true;
        say('say.lowAir', null, 4000);
        SFX.play('ding');
        renderDigbar(); refreshHint();
      }
    }
  }
  function onDigTap() {
    const D = G.dig;
    if (G.mode !== 'dig' || !$('#explainPanel').hidden || !D || D.paused || D.walking || D.ended || G.modal) return;
    const cfg = G.cfg.dig;
    D.prog += D.strength * (D.dust ? .5 : 1);
    D.o2 -= cfg.tapCost * D.drain * (1+D.zone*.2);
    astro.classList.remove('swing'); void astro.getBBox(); astro.classList.add('swing');
    SFX.play(D.kind === 'dig' ? 'dig' : 'ice');
    if (D.dust && Date.now() - D.slowSaid > 3500) { D.slowSaid = Date.now(); say('say.slow', null, 2500); }
    updateO2();
    renderMineProgress();
    if (D.prog >= cfg.taps + D.zone) { flow(spotDone); return; }
    checkO2();
  }
  async function spotDone() {
    const D = G.dig;
    if (!D || D.ended) return;
    const dig = D.kind === 'dig';
    const gain = Math.min(D.capacity-D.bag,dig ? C.SPOT_ROCKS[D.i]+D.zone+P.ensure(G.st).tools.drill : C.ICE_PER_CHUNK);
    D.bag += gain;
    const el = dig ? $('#spot' + D.i) : $('#icec' + D.i);
    el.classList.remove('active'); el.classList.add('done');
    SFX.play(dig ? 'rock' : 'ice');
    renderDigbar();
    D.i++; D.prog = 0; D.dust = false;
    renderMineProgress();
    if(D.bag>=D.capacity){checkO2();if(D.ended||D.paused)return;await endDig('full');return;}
    show('#dustCloud', false);
    const list = dig ? SPOTS : ICES;
    if (D.i >= list.length) {
      checkO2();
      if (D.ended || D.paused) return;
      say('say.noSpots', null, 3500); await endDig('spots'); return;
    }
    checkO2();
    if (D.ended || D.paused) return;
    D.walking = true;
    $('#hitSpot').classList.add('hide');
    refreshHint();
    if (D.i === 1) say('say.farther', null, 3000);
    const stand = dig ? DIG_STAND[D.i] : ICE_STAND[D.i];
    await walkTo(stand.x, stand.y);
    if (D.ended) return;
    setFacing(dig ? -1 : 1);
    D.walking = false;
    prepareSpot();
  }
  function prepareSpot() {
    const D = G.dig;
    if (!D || D.ended || (D.paused && D.lowDone && !G.st.done.suitAir)) return;
    placeHitSpot();
    const c = G.cfg.dig;
    const dusty = D.kind === 'dig' && c.dustSpots.includes(D.i) && (c.dustEveryRun || D.first);
    if (dusty) {
      D.dust = true;
      const p = SPOTS[D.i];
      const dc = $('#dustCloud');
      dc.setAttribute('transform', `translate(${p.x},${p.y - 18})`);
      dc.classList.remove('blowing', 'big');
      dc.classList.remove('hide');
      if (!G.st.done.dust && !D.paused&&!isColony()) {
        D.paused = true;
        flow(async () => {
          await runChoice('dust', {});
          if (G.dig === D && !D.ended) { D.paused = false; refreshHint(); checkO2(); }
        });
      } else {
        say('say.dust', null, 3000);
      }
    }
    renderActions(); refreshHint();
  }
  function blowDust() {
    const D = G.dig;
    if (!D || !D.dust) return;
    D.dust = false;
    if(isColony()){learnByDoing('dust');saveGame();}
    const dc = $('#dustCloud');
    dc.classList.remove('big'); dc.classList.add('blowing');
    SFX.play('blow');
    setTimeout(() => { dc.classList.add('hide'); dc.classList.remove('blowing'); }, 650);
    renderDigbar(); refreshHint();
  }
  async function endDig(reason) {
    const D = G.dig;
    if (!D || D.ended) return;
    D.ended = reason; D.paused = true; D.low = false;
    stopDigTimer();
    G.mode = 'busy'; G.busyKey = 'hint.walking'; G.busyIcon = 'helmet';
    $('#hitSpot').classList.add('hide');
    $$('#pile .spot, #crater .icechunk').forEach(e => e.classList.remove('active'));
    show('#dustCloud', false);
    astro.classList.remove('digging');
    renderActions(); refreshHint();
    if (D.kind === 'mine') await walkTo(CRATER_EDGE.x, CRATER_EDGE.y);
    await walkTo(IDLE_X, GROUND);
    setFacing(1);
    showO2(false);
    astro.classList.remove('lamp');
    resetSpots();
    const st = G.st;
    P.bank(st,D.kind,D.bag,D.zone);
    if(isColony()&&D.bag){learnByDoing(D.kind==='mine'?'ice':'suitAir');SO.upkeep(st,2);updateHud();saveGame();if(checkFail())return;}
    if(D.kind==='dig'&&D.bag)showDelta('rocks',D.bag);
    if (D.bag) SFX.play('pop');
    updateHud();
    say(D.bag ? (D.kind === 'dig' ? 'say.home' : 'say.homeIce') : 'say.homeEmpty', { n: D.bag }, 4000);
    if (D.bag) setMascot('cheer', 1800);
    G.dig = null;
    saveGame();
    G.mode = 'base';
    renderActions();
    onActionDone(D.kind === 'dig' ? 'dig' : 'mine');
  }

  // ------------------------------------------------------------------ scene taps
  function notYet() {
    const h = baseHint();
    say('say.notYet', { h: { k: h.key, vars: h.vars } }, 3500);
    pointAgain(false, true);
  }
  function onSlot(i) {
    if(isColony()&&G.moveSlot>=0&&!G.modal&&G.mode==='base'){if(SO.move(G.st,G.moveSlot,i)){G.moveSlot=-1;saveGame();renderSlots();refreshHint();}return;}
    if (G.screen !== 'game' || G.modal || G.mode !== 'base') return;
    SFX.play('tap');
    if (G.st.slots[i]) { openInfo(i); return; }
    openBuild(i);
  }
  function onPile() {
    if (G.mode === 'dig') { onDigTap(); return; }
    if (G.screen !== 'game' || G.modal || G.mode !== 'base') return;
    SFX.play('tap'); startDig('dig');
  }
  function onCrater() {
    if (G.mode === 'dig' && G.dig && G.dig.kind === 'mine') { onDigTap(); return; }
    if (G.screen !== 'game' || G.modal || G.mode !== 'base') return;
    if (!G.st.flags.mine) { notYet(); return; }
    SFX.play('tap'); startDig('mine');
  }
  function makeKey(el) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
  }
  $$('#slots .slot').forEach(g => { const hit = $('.hit', g); hit.addEventListener('click', () => onSlot(+g.dataset.slot)); makeKey(hit); });
  $('#hitPile').addEventListener('click', onPile); makeKey($('#hitPile'));
  $('#hitCrater').addEventListener('click', onCrater); makeKey($('#hitCrater'));
  $('#hitSpot').addEventListener('click', onDigTap); makeKey($('#hitSpot'));
  document.addEventListener('keydown', e => {
    if (e.key === ' ' && G.mode === 'dig' && !G.modal && (e.target === document.body || e.target === stage)) { e.preventDefault(); onDigTap(); }
  });

  // ------------------------------------------------------------------ cost row (icons; numbers only from Engineer up)
  function pips(n) { let s = ''; for (let i = 0; i < n; i++) s += '<i class="pip"></i>'; return s; }
  function costRow(type) {
    const b = C.BUILDINGS[type], cfg = G.cfg;
    const rocks = cfg.numbers ? `${b.cost}` : pips(b.cost);
    const time = cfg.numbers ? (cfg.units ? t('unit.s', { n: b.time }) : `${b.time}`) : pips(b.time);
    let pw, pwLabel;
    if (b.pw === 's') { pwLabel = t('build.powerStore'); pw = cfg.units ? b.kw : ART.icon('battery'); }
    else if (b.pw > 0) { pwLabel = t('build.powerMake'); pw = cfg.units ? b.kw : cfg.numbers ? `+${b.pw}` : ART.icon('up'); }
    else { pwLabel = t('build.powerUse'); pw = cfg.units ? b.kw : cfg.numbers ? `${b.pw}` : pips(-b.pw); }
    return `<span title="${esc(t('build.cost'))}" aria-label="${esc(t('build.cost'))}: ${b.cost}">${ART.icon('rock')}${rocks}</span>
      <span title="${esc(t('build.time'))}" aria-label="${esc(t('build.time'))}: ${b.time}">${ART.icon('clock')}${time}</span>
      <span title="${esc(pwLabel)}" aria-label="${esc(pwLabel)}">${ART.icon('power')}${pw}</span>`;
  }

  // ------------------------------------------------------------------ build pop-up
  function openBuild(slot) {
    G.buildSlot = slot; G.buildNeed = false;
    G.buildPage = 0;   // always open on the first 4; the arrow shows "See more" when needed
    openModal('build', renderBuild);
  }
  function renderBuild() {
    const st = G.st;
    const goal = goalType();
    const types = C.BUILD_ORDER.filter(b => C.BUILDINGS[b].page === G.buildPage);
    const single = goal && goal !== '*pick' && !isFree();
    const showNeed = G.buildNeed || (single && st.rocks < C.BUILDINGS[goal].cost) || (!single && buildableTypes().length && !buildableTypes().some(b => st.rocks >= C.BUILDINGS[b].cost));
    let h = `<div class="buildm"><div class="mhead"><span class="mtitle">${ART.icon('hammer')}<h2>${esc(t('build.title'))}</h2></span>
      <span class="mbtns"><button class="btn secondary" id="pageBtn" data-act="page">${ART.icon(G.buildPage ? 'refresh' : 'plus')}${esc(t(G.buildPage ? 'btn.back' : 'btn.seeMore'))}</button>
      <button class="btn secondary" data-act="close">${ART.icon('close')}${esc(t('btn.close'))}</button></span></div><div class="bgrid">`;
    types.forEach(type => {
      const b = C.BUILDINGS[type], state = buildState(type);
      h += `<div class="bcard ${state === 'locked' ? 'locked' : ''}"><span class="strip cat-${b.cat}"></span>${ART.buildingSvg(type)}
        <div class="bname">${esc(t(`b.${type}.name`))}</div><div class="bline">${esc(t(`b.${type}.line`))}</div>
        <div class="bcost">${costRow(type)}</div>`;
      if (state === 'ok') h += `<button class="btn" id="bb-${type}" data-act="build" data-val="${type}">${ART.icon('hammer')}${esc(t('btn.build'))}</button>`;
      else if (state === 'built') h += `<div class="state">${ART.icon('tick')}${esc(t('build.built'))}</div>`;
      else h += `<div class="state">${ART.icon('lock')}${esc(t('build.locked'))}</div>`;
      h += `</div>`;
    });
    h += `</div>`;
    if (showNeed) h += `<div class="needbox">${ART.icon('rock')}<span>${esc(t('build.need'))}</span><button class="btn" id="needGo" data-act="goDig">${ART.icon('helmet')}${esc(t('btn.goOutside'))}</button></div>`;
    h += `</div>`;
    $('#modal').innerHTML = h;
  }
  function onBuildPick(type) {
    const b = C.BUILDINGS[type];
    if (buildState(type) !== 'ok') return;
    if (G.st.rocks < b.cost) {
      G.buildNeed = true; renderBuild(); refreshHint();
      say('say.needRocks', null, 3500);
      return;
    }
    const slot = G.buildSlot;
    closeModal();
    flow(() => doBuild(slot, type));
  }
  async function ringCountdown(slot, secs) {
    const ring = $('#ring' + slot), arc = $('.ringarc', ring), num = $('.ringnum', ring);
    arc.style.transition = 'none';
    arc.setAttribute('stroke-dashoffset', '175.9');
    ring.classList.remove('hide');
    void arc.getBBox();
    arc.style.transition = '';
    for (let k = 0; k < secs; k++) {
      num.textContent = String(secs - k);
      SFX.play('tick');
      arc.setAttribute('stroke-dashoffset', (175.9 * (1 - (k + 1) / secs)).toFixed(1));
      await sleep(1000);
    }
    ring.classList.add('hide');
  }
  async function doBuild(slot, type) {
    const st = G.st, b = C.BUILDINGS[type];
    G.mode = 'busy'; G.busyKey = 'hint.building'; G.busyIcon = 'hammer';
    renderActions(); refreshHint();
    st.rocks -= b.cost;
    st.slots[slot] = { type, lv: 1 };
    applyEffects(b.bonus);
    saveGame();
    showDelta('rocks', -b.cost);
    updateHud();
    SFX.play('build');
    await ringCountdown(slot, b.time);
    renderSlot(slot, true);
    SFX.play('pop');
    setMascot('cheer', 2200);
    say('say.built', { b: { k: `b.${type}.one` } }, 3500);
    saveGame();
    await sleep(2000);   // hold 2 seconds before anything else happens
    onActionDone('build', { type, slot });
  }

  // ------------------------------------------------------------------ building info, upgrade, move out
  function openInfo(slot) { G.infoSlot = slot; G.infoConfirm = false; G.infoNeed = false; openModal(isColony()?'industry':'info',isColony()?renderIndustry:renderInfo); }
  function upgradeText(type) {
    if (type === 'processor') return t('info.upProc');
    const up = C.BUILDINGS[type].up, k = Object.keys(up)[0];
    if (!k) return '';
    return t(up[k] < 0 ? 'info.upLess' : 'info.upMore', { m: t('hud.' + k) });
  }
  function renderInfo() {
    if(isColony()){renderIndustry();return;}
    const s = G.st.slots[G.infoSlot];
    if (!s) { closeModal(); return; }
    const b = C.BUILDINGS[s.type];
    let h = `<div class="infom"><div class="strip cat-${b.cat}"></div>
      <div class="mhead"><span class="mtitle"><h2>${esc(t(`b.${s.type}.name`))}</h2><span class="lvbig">${esc(t('info.lv', { n: s.lv }))}</span></span>
      <span class="mbtns">${isFree() && !G.infoConfirm ? `<button class="btn secondary" data-act="remove">${ART.icon('trash')}${esc(t('btn.remove'))}</button>` : ''}
      <button class="btn secondary" id="infoClose" data-act="close">${ART.icon('close')}${esc(t('btn.close'))}</button></span></div>
      ${ART.buildingSvg(s.type)}<div class="iline">${esc(t(`b.${s.type}.line`))}</div>`;
    if (G.infoConfirm) {
      h += `<div class="iline">${esc(t('info.removeAsk'))}</div><div class="mfoot">
        <button class="btn" id="removeNo" data-act="removeNo">${ART.icon('tick')}${esc(t('btn.removeNo'))}</button>
        <button class="btn secondary" data-act="removeYes">${ART.icon('trash')}${esc(t('btn.removeYes'))}</button></div>`;
    } else {
      if (s.lv < C.MAX_LV) {
        const cost = C.UPGRADE_COST[s.lv + 1];
        h += `<div class="iline">${esc(upgradeText(s.type))}</div>
          <div class="mrow"><span class="bcost" style="display:inline-flex;gap:4px;align-items:center;font-size:19px;font-weight:700">${ART.icon('rock')}${G.cfg.numbers ? cost : pips(cost)}</span>
          <button class="btn" id="upBtn" data-act="upgrade">${ART.icon('up')}${esc(t('btn.upgrade'))}</button></div>`;
      } else {
        h += `<div class="iline"><b>${esc(t('info.top'))}</b></div>`;
      }
      if (G.infoNeed) h += `<div class="needbox">${ART.icon('rock')}<span>${esc(t('build.need'))}</span><button class="btn" id="needGo" data-act="goDig">${ART.icon('helmet')}${esc(t('btn.goOutside'))}</button></div>`;
    }
    h += `</div>`;
    $('#modal').innerHTML = h;
  }
  function onUpgrade() {
    const slot = G.infoSlot, s = G.st.slots[slot];
    if (!s || s.lv >= C.MAX_LV) return;
    const cost = C.UPGRADE_COST[s.lv + 1];
    if (G.st.rocks < cost) { G.infoNeed = true; renderInfo(); refreshHint(); say('say.needRocks', null, 3500); return; }
    closeModal();
    flow(() => doUpgrade(slot));
  }
  async function doUpgrade(slot) {
    const st = G.st, s = st.slots[slot];
    const cost = C.UPGRADE_COST[s.lv + 1];
    G.mode = 'busy'; G.busyKey = 'hint.building'; G.busyIcon = 'up';
    renderActions(); refreshHint();
    st.rocks -= cost; showDelta('rocks', -cost); updateHud();
    s.lv++;
    applyEffects(C.BUILDINGS[s.type].up);
    saveGame();
    SFX.play('build');
    await ringCountdown(slot, 3);
    renderSlot(slot, true);
    SFX.play('pop');
    setMascot('cheer', 2200);
    say('say.upgraded', { b: { k: `b.${s.type}.one` } }, 3500);
    saveGame();
    await sleep(1500);
    onActionDone('upgrade', { slot });
  }
  function doRemove() {
    const slot = G.infoSlot, s = G.st.slots[slot];
    if (!s||isColony()&&SO.ensure(G.st).jobs.some(j=>j.slot===slot)) return;
    const refund = Math.floor(C.BUILDINGS[s.type].cost / 2);
    G.st.slots[slot] = null;
    G.st.rocks += refund; showDelta('rocks', refund);
    renderSlot(slot, false); updateHud();
    SFX.play('whoosh');
    say('say.removed', null, 3000);
    saveGame();
    closeModal();
  }

  // ------------------------------------------------------------------ processor
  function onProcessBtn() {
    if (G.mode !== 'base' || G.modal || !hasBuilding('processor')) return;
    const step = currentStep();
    if (step && step.type === 'process' && !G.st.done[step.choice]) {
      const short = recipeShort(C.CHOICES[step.choice].recipe);
      if (!short) { flow(() => runProcessChoice(step)); return; }
      G.procNeed = short;
    } else G.procNeed = null;
    openModal('process', renderProc);
  }
  async function runProcessChoice(step) {
    G.mode = 'busy'; G.busyKey = 'hint.working'; G.busyIcon = 'gear'; renderActions();
    await runChoice(step.choice, {});
    completeStep();
  }
  function renderProc() {
    const recipe = id => {
      const r = C.RECIPES[id], short = recipeShort(id);
      const inIcon = id === 'rocksAir' ? 'rock' : 'ice', outIcon = id === 'rocksAir' ? 'air' : 'water';
      const qty = r.use.rocks || r.use.ice;
      const note = short ? t(short === 'rocks' ? 'proc.needRocks' : short === 'ice' ? 'proc.needIce' : 'proc.needPower') : '';
      return `<div class="recipe"><div class="eq">${ART.icon(inIcon)}${G.cfg.numbers ? qty : pips(qty)} ${ART.icon('power')} ${ART.icon('play')} ${ART.icon(outIcon)}</div>
        <div><b>${esc(t('proc.' + id))}</b></div><div class="note">${esc(note)}</div>
        <button class="btn" id="rc-${id}" data-act="proc" data-val="${id}" ${short ? 'disabled' : ''}>${ART.icon('gear')}${esc(t('btn.make'))}</button></div>`;
    };
    let h = `<div class="procm"><div class="mhead"><span class="mtitle">${ART.icon('gear')}<h2>${esc(t('proc.title'))}</h2></span>
      <span class="mbtns"><button class="btn secondary" id="procClose" data-act="close">${ART.icon('close')}${esc(t('btn.close'))}</button></span></div><div class="recipes">${recipe('rocksAir')}${recipe('iceWater')}</div>`;
    if (G.procNeed === 'rocks') h += `<div class="needbox">${ART.icon('rock')}<span>${esc(t('build.need'))}</span><button class="btn" id="needGo" data-act="goDig">${ART.icon('helmet')}${esc(t('btn.goOutside'))}</button></div>`;
    if (G.procNeed === 'ice') h += `<div class="needbox">${ART.icon('ice')}<span>${esc(t('say.needIce'))}</span><button class="btn" id="needGo" data-act="goMine">${ART.icon('ice')}${esc(t('btn.mineIce'))}</button></div>`;
    if (G.procNeed === 'power') h += `<div class="needbox">${ART.icon('power')}<span>${esc(t('say.needPower'))}</span></div>`;
    h += `</div>`;
    $('#modal').innerHTML = h;
  }
  function procBonus() { const i = slotOf('processor'); return i >= 0 ? (G.st.slots[i].lv - 1) * 5 : 0; }
  function applyRecipe(id) {
    const r = C.RECIPES[id], use = {}, gives = {};
    Object.keys(r.use).forEach(k => { use[k] = -r.use[k]; });
    Object.keys(r.gives).forEach(k => { gives[k] = r.gives[k] + procBonus(); });
    applyEffects(use); applyEffects(gives);
  }
  function onProc(id) {
    const short = recipeShort(id);
    if (short) { G.procNeed = short; renderProc(); refreshHint(); return; }
    closeModal();
    flow(() => doProcess(id));
  }
  async function procRunFx(ms) {
    const b = bld('processor');
    if (b) b.classList.add('on', 'shake');
    SFX.play('machine');
    await sleep(ms);
    if (b) b.classList.remove('on', 'shake');
  }
  async function doProcess(id) {
    G.mode = 'busy'; G.busyKey = 'hint.working'; G.busyIcon = 'gear';
    renderActions(); refreshHint();
    await procRunFx(1600);
    applyRecipe(id);
    say(id === 'rocksAir' ? 'say.madeAir' : 'say.madeWater', null, 3000);
    setMascot('cheer', 1600);
    saveGame();
    G.mode = 'base'; renderActions(); refreshHint();
  }

  // ------------------------------------------------------------------ choices
  function optionList(id, isEvent) {
    const ch = C.CHOICES[id];
    const n = isEvent ? G.cfg.eventOpts : G.cfg.opts;
    const keep = n >= 3 || C.CARDS[ch.card].only ? ['c', 'w', 't'] : ['c', 'w'];
    return ch.order.filter(o => keep.includes(ch.roles[o]));
  }
  function renderChoice() {
    const c = G.choice;
    if (!c) return;
    const ch = C.CHOICES[c.id];
    let h = `<div class="choice">`;
    if (c.wrongOpt) {
      h += `<div class="wrongbox"><div class="mini-m">${ART.mascot('worried')}</div><div class="wtext"><b>${esc(t('say.wrong'))}</b>${esc(tt(`ch.${c.id}.w.${c.wrongOpt}`))}</div></div>
        <div class="mfoot"><button class="btn" id="retryBtn" data-act="retry" data-focus="1">${ART.icon('refresh')}${esc(t('btn.tryAgain'))}</button></div>`;
    } else {
      if (c.late) h += `<div class="latemsg">${ART.icon('hourglass')}<span>${esc(t('say.timeUp', { e: { k: c.lateName || 'ev.night.name' } }))}</span></div>`;
      h += `<div class="qrow"><span id="choiceQ">${ART.icon(C.CARDS[ch.card].icon)}</span><div class="qtext">${esc(tt(`ch.${c.id}.q`))}</div></div><div id="choiceOpts">`;
      c.opts.forEach(o => {
        const tried = c.tried.includes(o);
        h += `<button class="btn opt ${tried ? 'tried' : ''}" data-act="pick" data-val="${o}" ${tried ? 'disabled aria-disabled="true"' : ''}>${ART.icon(ch.icons[o])}<span>${esc(tt(`ch.${c.id}.o.${o}`))}</span>${tried ? `<span class="triedTag">${ART.icon('close')}${esc(t('choice.tried'))}</span>` : ''}</button>`;
      });
      h += `</div>`;
    }
    h += `</div>`;
    $('#modal').innerHTML = h;
  }
  async function runChoice(id, opts) {
    opts = opts || {};
    const ch = C.CHOICES[id], st = G.st;
    const choiceKey = st.session + ':' + st.step + ':' + st.freeIdx + ':' + id;
    if (st.completedChoices.includes(choiceKey)) { await showCard(ch.card, {review:true}); return; }
    G.choice = { id, opts: optionList(id, !!opts.event), tried: [], wrongOpt: null, late: false, done: false };
    openModal('choice', renderChoice, { mid: true });
    if (opts.event && G.cfg.countdown > 0) startCountdown(G.cfg.countdown, opts.evName);
    for (;;) {
      const pick = await waitAct('pick');
      if (!G.choice || G.choice.tried.includes(pick) || !ch.roles[pick]) continue;
      if (ch.roles[pick] === 'c') break;
      G.choice.tried.push(pick);
      G.choice.wrongOpt = pick;
      SFX.play('wrong');
      setMascot('worried');
      applyEffects(C.REWARD.wrong);
      applyEffects(ch.wrong);
      wrongFx(id);
      renderChoice(); refreshHint(); renderWarn();
      const r = $('#retryBtn'); if (r) try { r.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      if (checkFail()) throw ABORT;
      await waitAct('retry');
      G.choice.wrongOpt = null;
      setMascot(null);
      renderChoice(); refreshHint(); renderWarn();
    }
    const first = G.choice.tried.length === 0 && !G.choice.late;
    G.choice.done = true;
    stopCountdown();
    if (opts.event) hideWarn();   // the danger is handled
    SFX.play('right');
    setMascot('cheer', 2600);
    say(first ? 'say.right1' : 'say.right2', null, 2600);
    closeModal();
    await rightFx(id);
    const rw = first ? C.REWARD.first : C.REWARD.later;
    applyEffects({ survival: rw.survival, rocks: rw.rocks });
    st.stars += rw.stars;
    flyStars(rw.stars);
    applyEffects(ch.right);
    if (ch.recipe) applyRecipe(ch.recipe);
    st.log.stars += rw.stars;
    st.log.max += C.REWARD.first.stars;
    st.done[id] = true;
    const review = st.book.includes(ch.card);
    if (!review) st.book.push(ch.card);
    st.log.cards.push({ id: ch.card, review });
    st.completedChoices.push(choiceKey);
    saveGame();
    await sleep(1100);
    await showCard(ch.card, { review });
    saveGame();
    renderActions();
    say('say.saved', null, 2400);
    G.choice = null;
  }

  // Visible changes in the base after each answer.
  async function rightFx(id) {
    switch (id) {
      case 'dust': blowDust(); await sleep(600); break;
      case 'ice': lampOn(); say('say.lampOn', null, 2500); await sleep(900); break;
      case 'night': allBld(b => b.classList.remove('dark')); { const b = bld('battery'); if (b) b.classList.add('glow'); } show('#domeGlow', true); await sleep(1200); break;
      case 'nightSave': { const b = bld('battery'); if (b) b.classList.remove('low'); } await sleep(800); break;
      case 'leak': show('#puffs', false); show('#patch', true); G.st.patched = true; SFX.play('pop'); await sleep(1000); break;
      case 'storm': {
        const i = slotOf('shelter');
        if (i >= 0) { await walkTo(SLOT_X[i], GROUND); astro.classList.add('inside'); const b = bldEl(i); if (b) b.classList.add('safe'); }
        await sleep(600); break;
      }
      case 'stormWait': await sleep(700); break;
      case 'meteor': await walkTo(DOME_X, GROUND); astro.classList.add('inside'); say('say.inside', null, 2500); await sleep(800); break;
      case 'rocksAir': case 'iceWater': await procRunFx(1600); break;
      case 'plants': {
        const i = slotOf('greenhouse');
        G.st.done.plants = true;
        if (i >= 0) { renderSlot(i, true); }
        await sleep(1000); break;
      }
      case 'oxygen': case 'solar': case 'co2': case 'waterRec': {
        const type = id === 'waterRec' ? 'water' : id;
        const b = bld(type);
        if (b) { b.classList.add('on', 'glow'); setTimeout(() => b.classList.remove('glow'), 2200); }
        await sleep(1100); break;
      }
      default: await sleep(500);
    }
  }
  function wrongFx(id) {
    switch (id) {
      case 'dust': { const d = $('#dustCloud'); d.classList.add('big'); setTimeout(() => d.classList.remove('big'), 1600); break; }
      case 'night': case 'nightSave': {
        const g = $('#domeGlow');
        g.classList.remove('hide', 'flicker'); void g.getBBox(); g.classList.add('flicker');
        setTimeout(() => { g.classList.add('hide'); g.classList.remove('flicker'); }, 1600);
        break;
      }
      case 'storm': case 'stormWait': { const f = $('#stormFx'); f.classList.add('strong'); astroHurt(); setTimeout(() => f.classList.remove('strong'), 1600); break; }
      case 'leak': { const p = $('#puffs'); p.classList.add('big'); SFX.play('hiss'); setTimeout(() => p.classList.remove('big'), 1600); break; }
      case 'meteor': {
        const imp = $('#impact');
        imp.setAttribute('transform', `translate(${G.astroX - 40},${GROUND - 6})`);
        const inner = $('.imp', imp), c = inner.cloneNode(true);
        inner.parentNode.replaceChild(c, inner);
        imp.classList.remove('hide');
        SFX.play('boom'); astroHurt();
        setTimeout(() => imp.classList.add('hide'), 800);
        break;
      }
      case 'ice': { const d = $('#craterDark'); d.style.opacity = '.85'; setTimeout(() => { d.style.opacity = ''; }, 1400); break; }
      case 'rocksAir': case 'iceWater': { const b = bld('processor'); if (b) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 1100); } break; }
      case 'plants': case 'oxygen': case 'solar': case 'co2': case 'waterRec': {
        const type = id === 'plants' ? 'greenhouse' : id === 'waterRec' ? 'water' : id;
        const b = bld(type); if (b) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 1100); }
        break;
      }
      default: astroHurt();
    }
  }

  // ------------------------------------------------------------------ learning cards and the Knowledge book
  async function showCard(id, opts) {
    G.cardCtx = { id, review: !!(opts && opts.review), fromBook: false, src: false };
    openModal('card', renderCard);
    SFX.play('page');
    await waitAct('cardOk');
    closeModal();
  }
  function renderCard() {
    const c = G.cardCtx;
    if (!c) return;
    const cd = C.CARDS[c.id];
    const sourced = window.OX_STATE.nasaLink(cd.source);
    const nasa = sourced ? esc(tt(`cd.${c.id}.nasa`)) : esc(t('card.placeholder'));
    let h = `<div class="lcard"><div class="strip cat-${cd.cat}"></div>
      <div class="lhead">${ART.icon(cd.icon)}<h2>${esc(t(`cd.${c.id}.title`))}</h2>
        ${c.fromBook ? '' : `<span class="tag">${ART.icon(c.review ? 'refresh' : 'sparkle')}${esc(t(c.review ? 'card.review' : 'card.new'))}</span>`}</div>
      <div class="lrow">${ART.icon('sparkle')}<div><div class="k">${esc(t('card.what'))}</div><div class="v">${esc(tt(`cd.${c.id}.what`))}</div></div></div>
      <div class="lrow">${ART.icon('idea')}<div><div class="k">${esc(t('card.why'))}</div><div class="v">${esc(tt(`cd.${c.id}.why`))}</div></div></div>
      <div class="lrow">${ART.icon('rocket')}<div><div class="k">${esc(t('card.nasa'))}</div><div class="v ${sourced ? '' : 'ph'}">${nasa}</div></div></div>
      <div class="lrow like">${ART.icon('like')}<div><div class="k">${esc(t('card.like'))}</div><div class="v">${esc(tt(`cd.${c.id}.like`))}</div></div></div>`;
    if (sourced && c.src) {
      const list = [{ url: cd.source, src: cd.src }].concat(cd.more || []).filter(item => window.OX_STATE.nasaLink(item.url));
      h += `<div class="srcbox"><b>${esc(t('card.source'))}:</b> ${list.map(s => `${esc(t('src.' + s.src))}<br><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${esc(s.url)}</a>`).join('<br>')}<br><span class="gu">${esc(t('card.grownup'))}</span></div>`;
    }
    h += `<div class="mfoot">${sourced ? `<button class="btn secondary" data-act="learn">${ART.icon('link')}${esc(t('btn.learnMore'))}</button>` : ''}
      <button class="btn" id="cardOk" data-act="${c.fromBook ? 'bookBack' : 'cardOk'}" data-focus="1">${ART.icon(c.fromBook ? 'book' : 'tick')}${esc(t(c.fromBook ? 'btn.back' : 'btn.gotIt'))}</button></div></div>`;
    $('#modal').innerHTML = h;
  }
  function bookCards() { return C.CARD_ORDER.filter(id => !C.CARDS[id].only || C.CARDS[id].only === G.level); }
  function openBook() {
    if (G.mode !== 'base' || G.modal) return;
    openModal('book', renderBook);
    SFX.play('page');
  }
  function renderBook() {
    const list = bookCards(), got = G.st.book;
    const n = list.filter(id => got.includes(id)).length;
    let h = `<div class="bookm"><div class="bookhead">${ART.icon('book')}<h2>${esc(t('book.title'))}</h2><span class="cnt">${esc(G.cfg.numbers ? t('book.count', { n, t: list.length }) : '')}</span></div>`;
    if (!G.cfg.numbers) h += `<div class="sub" style="margin-top:4px">${list.map(id => got.includes(id) ? '●' : '○').join(' ')}</div>`;
    h += `<div class="bgrid4">`;
    list.forEach(id => {
      const cd = C.CARDS[id];
      if (got.includes(id)) h += `<button class="mini" type="button" data-act="bookCard" data-val="${id}"><span class="strip cat-${cd.cat}"></span><span class="mrow">${ART.icon(cd.icon)}<span>${esc(t(`cd.${id}.title`))}</span></span></button>`;
      else h += `<div class="mini locked"><span class="strip" style="background:#d8cfb6"></span><span class="mrow">${ART.icon('question')}<span>${esc(t('book.locked'))}</span></span></div>`;
    });
    h += `</div><div class="mfoot"><button class="btn" id="bookClose" data-act="close">${ART.icon('close')}${esc(t('btn.close'))}</button></div></div>`;
    $('#modal').innerHTML = h;
  }

  // ------------------------------------------------------------------ incoming events
  function startCountdown(total, nameKey) {
    stopCountdown();
    const run = G.run;
    G.cd = { total, left: total, paused: false, nameKey, timer: 0 };
    renderWarn();
    G.cd.timer = setInterval(() => {
      const cd = G.cd;
      if (run !== G.run || !cd) { stopCountdown(); return; }
      if (document.hidden || !$('#explainPanel').hidden || cd.paused || G.modal !== 'choice' || (G.choice && G.choice.wrongOpt)) return;
      cd.left = Math.max(0, cd.left - 0.25);
      const whole = Math.abs(cd.left - Math.round(cd.left)) < 0.01;
      if (whole && cd.left > 0 && cd.left <= 5) SFX.play('tick');
      if (cd.left <= 0) { onTimeUp(); return; }
      if (whole) renderWarn();
    }, 250);
  }
  function stopCountdown() {
    if (G.cd) { clearInterval(G.cd.timer); G.cd = null; }
    renderWarn();
  }
  function onTimeUp() {
    const cd = G.cd;
    stopCountdown();
    if (!G.choice || G.choice.done) return;
    G.choice.late = true;
    G.choice.lateName = cd && cd.nameKey ? cd.nameKey : 'ev.night.name';
    SFX.play('wrong');
    setMascot('worried', 2600);
    applyEffects(C.REWARD.late);
    if (checkFail()) return;
    if (G.modal === 'choice') { renderChoice(); refreshHint(); }
  }
  function showWarn(key) { G.warn = { key }; stage.classList.add('has-warn'); renderWarn(); }
  function hideWarn() { G.warn = null; stage.classList.remove('has-warn'); renderWarn(); }
  function renderWarn() {
    const w = $('#warn');
    if (!G.warn) { w.hidden = true; w.innerHTML = ''; return; }
    let h = `<span class="wicon">${ART.icon('warn')}</span><span class="tag">${esc(t('ev.incoming'))}</span><span>${esc(t(G.warn.key))}</span>`;
    const cd = G.cd;
    if (cd) {
      const v = cd.left / cd.total;
      const lv = v > 0.5 ? 'ok' : v > 0.25 ? 'caution' : v > 0.1 ? 'warning' : 'critical';
      const off = (150.8 * (1 - v)).toFixed(1);
      h += `<span class="cd" role="timer" aria-label="${esc(t('unit.s', { n: Math.ceil(cd.left) }))}"><svg viewBox="0 0 58 58"><circle cx="29" cy="29" r="27" fill="#fff8e8" stroke="#1b2450" stroke-width="2"/><circle cx="29" cy="29" r="24" fill="none" stroke="#ece3cc" stroke-width="6"/><circle cx="29" cy="29" r="24" fill="none" stroke="${ART.statusColor(lv)}" stroke-width="6" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="${off}" transform="rotate(-90 29 29)"/></svg><span class="num">${Math.ceil(cd.left)}</span>${ART.statusIcon(lv)}</span>`;
      if (G.cfg.pause) h += `<button class="btn ${cd.paused ? '' : 'secondary'}" id="pauseBtn" type="button">${ART.icon(cd.paused ? 'play' : 'pause')}${esc(t(cd.paused ? 'btn.resume' : 'btn.pause'))}</button>`;
      if (cd.paused) h += `<span class="tag">${esc(t('warn.paused'))}</span>`;
    }
    w.innerHTML = h;
    w.hidden = false;
    const pb = $('#pauseBtn');
    if (pb) pb.addEventListener('click', () => {
      SFX.play('tap');
      if (!G.cd) return;
      G.cd.paused = !G.cd.paused;
      if (G.cd.paused) say('say.paused', null, 3500);
      renderWarn();
    });
  }
  async function eventStart(id) {
    switch (id) {
      case 'night':
        $('#sun').classList.add('set'); SFX.play('night');
        allBld(b => b.classList.add('dark')); show('#domeGlow', false);
        break;
      case 'storm': $('#sun').classList.add('storm'); show('#flare', true); show('#stormFx', true); break;
      case 'leak': show('#crack', true); show('#patch', false); show('#puffs', true); SFX.play('hiss'); break;
      case 'meteor': show('#meteorFx', true); SFX.play('whoosh'); break;
      default:
    }
  }
  async function eventEnd(id) {
    switch (id) {
      case 'night':
        $('#sun').classList.remove('set'); SFX.play('sunrise');
        allBld(b => b.classList.remove('dark', 'glow', 'low')); show('#domeGlow', false);
        break;
      case 'storm': {
        show('#flare', false); show('#stormFx', false); $('#sun').classList.remove('storm');
        const b = bld('shelter'); if (b) b.classList.remove('safe');
        astro.classList.remove('inside');
        await walkTo(IDLE_X, GROUND); setFacing(1);
        break;
      }
      case 'leak': show('#puffs', false); break;
      case 'meteor':
        show('#meteorFx', false);
        astro.classList.remove('inside');
        await walkTo(IDLE_X, GROUND); setFacing(1);
        break;
      default:
    }
  }
  async function runEvent(id) {
    const ev = C.EVENTS[id];
    G.mode = 'busy'; G.busyKey = 'hint.watch'; G.busyIcon = 'warn';
    renderActions(); refreshHint();
    if (G.astroX !== IDLE_X) { await walkTo(IDLE_X, GROUND); setFacing(1); }
    await sleep(300);
    darken(ev.dark);
    SFX.play('warn');
    showWarn(`ev.${id}.warn`);
    await eventStart(id);
    const eventKey = G.st.session + ':' + G.st.step + ':' + G.st.freeIdx + ':' + id;
    if (!G.st.eventStarts.includes(eventKey)) { applyEffects(ev.start); G.st.eventStarts.push(eventKey); saveGame(); }
    await sleep(1500);
    await runChoice(ev.choice, { event: true, evName: `ev.${id}.name` });
    hideWarn();
    if (G.cfg.chain && ev.follow) {
      showWarn(ev.follow.warn);
      SFX.play('warn');
      if (id === 'night') { const b = bld('battery'); if (b) b.classList.add('low'); }
      await sleep(1300);
      await runChoice(ev.follow.choice, { event: true, evName: ev.follow.name });
      hideWarn();
    }
    if (G.cfg.chain && ev.chainEvent) {
      await sleep(600);
      await runEvent(ev.chainEvent);
      darken(ev.dark);
    }
    await eventEnd(id);
    if (!G.st.eventEnds.includes(eventKey)) { applyEffects(ev.end); G.st.eventEnds.push(eventKey); saveGame(); }
    darken(0);
    say(ev.endSay, null, 3500);
    await sleep(1400);
  }

  // ------------------------------------------------------------------ end of a session
  async function endSession() {
    const st = G.st, log = st.log || { cards: [], stars: 0, max: 0 };
    const ratio = log.max ? log.stars / log.max : 1;
    const tier = ratio >= C.BADGE.gold ? 'gold' : ratio >= C.BADGE.silver ? 'silver' : 'bronze';
    if (!st.summaryPending) st.badges.push({ s: st.session, tier });
    st.summaryPending = true;
    G.summary = { tier, cards: log.cards.slice(), stars: log.stars, free: isFree(), nextFree: st.session + 1 >= C.SESSIONS.length };
    saveGame();
    G.mode = 'busy';
    openModal('summary', renderSummary);
    SFX.play('right');
    setMascot('cheer', 3200);
    await waitAct('sumNext');
    closeModal();
    st.summaryPending = false;
    st.session++;
    if(st.session===C.SESSIONS.length){st.campaignComplete=true;saveGame();goStart();return;}
    beginSession();
  }
  function renderSummary() {
    const s = G.summary;
    if (!s) return;
    const n = s.cards.length;
    const nick = store.nick;
    let h = `<div class="summ"><div class="sleft">${ART.badge(s.tier)}<div class="tier">${esc(t('sum.badge.' + s.tier))}</div></div><div class="sright">
      <h2>${esc(t(s.nextFree&&!s.free ? 'play.complete' : s.free ? 'sum.titleFree' : 'sum.title'))}</h2>${s.nextFree&&!s.free?'<p>'+esc(t('play.optional'))+'</p>':''}
      <div class="sub">${esc(nick ? t('sum.greatName', { name: nick }) : t('sum.great'))}</div>
      <div class="learned">${esc(n === 1 ? t('sum.learned1') : t('sum.learned', { n }))}</div><div class="llist">`;
    s.cards.forEach(c => {
      const cd = C.CARDS[c.id];
      h += `<div class="li"><span class="dot cat-${cd.cat}"></span>${ART.icon(cd.icon)}<span>${esc(t(`cd.${c.id}.title`))}</span>${c.review ? `<span class="rv">${esc(t('sum.review'))}</span>` : ''}</div>`;
    });
    h += `</div><div class="starsrow">${ART.icon('star')}<span>${esc(t('sum.stars'))}:</span><span>${G.cfg.numbers ? '+' + s.stars : countVis(s.stars, 'stars')}</span></div>
      <div class="mfoot"><button class="btn" id="sumNext" data-act="sumNext" data-focus="1">${ART.icon('play')}${esc(t(s.nextFree&&!s.free ? 'play.finish' : s.free ? 'play.sandbox' : 'btn.next'))}</button></div></div></div>`;
    $('#modal').innerHTML = h;
  }

  // ------------------------------------------------------------------ mission failed (never death: the astronaut flies home)
  function checkFail() {
    if (!G.st || G.st.m.survival > 0 || G.failed) return false;
    G.failed = true;
    G.run++; clearWaits(); stopCountdown(); stopDigTimer();
    G.dig = null; G.choice = null;
    hideWarn();
    if (G.modal) closeModal();
    G.mode = 'busy';
    setTimeout(() => {
      if (!G.failed || G.screen !== 'game') return;
      openModal('fail', renderFail);
      SFX.play('fail');
      setMascot('sad');
    }, 700);
    return true;
  }
  function renderFail() {
    $('#modal').innerHTML = `<div class="failm"><div class="mini-m">${ART.mascot('sad')}</div><div class="fbig">${esc(t('fail.title'))}</div>
      <div class="ftext">${esc(tt('fail.text'))}</div>
      <div class="mfoot"><button class="btn" id="failTry" data-act="failTry" data-focus="1">${ART.icon('refresh')}${esc(t('btn.tryAgain'))}</button>
      <button class="btn secondary" data-act="failQuit">${ART.icon('home')}${esc(t('btn.quit'))}</button></div></div>`;
  }
  function restoreSnapshot() { window.OX_STATE.recover(G.st); }
  function failTry() {
    restoreSnapshot();
    G.failed = false; G.mood = null;
    closeModal();
    G.run++;
    resetSceneFx();
    renderHudStatic(); renderSlots(); renderActions(); renderMascot();
    beginSession();
  }
  function failQuit() {
    G.failed = false;
    saveGame();
    closeModal();
    goStart();
  }

  document.addEventListener('keydown', e => {
    if (!$('#explainPanel').hidden && e.key==='Escape'){closeExplanation();return;}
    if (!$('#explainPanel').hidden && e.key==='Tab'){e.preventDefault();$('#explainClose').focus();return;}
    if (!G.modal || e.key !== 'Tab') return;
    const stops = [...$('#modal').querySelectorAll('button:not(:disabled),a[href]'), ...$('#corner').querySelectorAll('button:not(:disabled)')].filter(el => el.getClientRects().length);
    if (!stops.length) return;
    const index = stops.indexOf(document.activeElement);
    if (index < 0 || !e.shiftKey && index === stops.length-1 || e.shiftKey && index === 0) { e.preventDefault(); stops[e.shiftKey ? stops.length-1 : 0].focus(); }
  });

  // Mining choices, upgrades, readable goals and contextual explanations.
  function renderMission() {
    const el=$('#missionCard'),st=G.st;el.hidden=!st;$('#productionMarkers').hidden=!isColony();
    if(isColony()){renderColonyCard();return;}
    if(!st)return;
    const def=C.SESSIONS[st.session],count=def?def.steps.length:1;
    el.innerHTML='<strong>'+esc(t(def?'play.goal':'play.free',{n:st.session+1}))+'</strong><p>'+esc(t(def?'play.goal'+st.session:'play.optional'))+'</p>'+(def?'<progress max="'+count+'" value="'+Math.min(count,st.step)+'"></progress><small>'+esc(t('play.step',{n:Math.min(count,st.step+1),max:count}))+'</small>':'');
  }
  function renderMineProgress() {
    const el=$('#mineProgress'),D=G.dig;el.hidden=!D||G.mode!=='dig'||!!G.modal;
    if(el.hidden)return;
    const taps=G.cfg.dig.taps+D.zone;
    el.innerHTML='<strong>'+esc(t('play.zone'+D.zone))+'</strong><strong>'+esc(t('play.bag',{n:D.bag,max:D.capacity}))+'</strong><span>'+esc(t('play.spots',{n:D.i,max:D.kind==='dig'?SPOTS.length:ICES.length}))+'</span><label>'+esc(t('play.layer'))+'<progress max="'+taps+'" value="'+Math.min(taps,D.prog)+'"></progress></label>';
  }
  function renderWorkshop() {
    const st=G.st,p=P.ensure(st);
    $('#modal').innerHTML='<h2>'+esc(t('play.tools'))+'</h2><div class="tool-grid">'+P.TOOLS.map((k,i)=>{
      const cost=P.cost(st,k),short=cost!==null&&st.rocks<cost;
      return '<section class="tool-card">'+ART.icon(['pick','helmet','bag'][i])+'<h3>'+esc(t('play.'+k))+'</h3><strong>'+esc(t('play.level',{n:p.tools[k]+1}))+'</strong><p>'+esc(t('play.'+k+'.why'))+'</p><button class="btn" data-act="tool" data-val="'+k+'" '+(cost===null||short?'disabled':'')+'>'+esc(t(cost===null?'play.max':'play.upgrade',{n:cost}))+'</button>'+(short?'<p class="small">'+esc(t('play.short',{n:cost-st.rocks}))+'</p>':'')+'</section>';
    }).join('')+'</div><div class="mfoot"><button class="btn secondary" id="playClose" data-act="close">'+esc(t('play.close'))+'</button></div>';
  }
  function renderMineMap() {
    const st=G.st;
    $('#modal').innerHTML='<h2>'+esc(t('play.choose'))+'</h2><p>'+esc(t('play.discovery',{n:P.ensure(st).finds.length}))+'</p><div class="tool-grid">'+[0,1,2].map(z=>'<section class="tool-card zone-card">'+ART.icon('rock')+'<h3>'+esc(t('play.zone'+z))+'</h3><p>'+esc(t('play.zone'+z+'.why'))+'</p><button class="btn" id="zone-'+z+'" data-act="zone" data-val="'+z+'" '+(P.unlocked(st,z)?'':'disabled')+'>'+esc(t(P.unlocked(st,z)?'play.dig':'play.unlock',{n:[0,12,30][z]}))+'</button></section>').join('')+'</div><div class="mfoot"><button class="btn secondary" data-act="close">'+esc(t('play.close'))+'</button></div>';
  }
  let explainFocus=null;
  function showExplanation(key) {
    explainFocus=document.activeElement;
    let title=t('play.help'),body='',tip='';
    if(['survival','air','power','water','food','rad','rocks','stars'].includes(key)){
      title=t('hud.'+key);body=t('info.'+key+'.what');tip=t('info.'+key+'.tip');
    }else{
      body=isColony()?t('colony.plan'):G.hint?t(G.hint.key,G.hint.vars):t('play.hint.base');
      if(G.choice)tip=tt('cd.'+C.CHOICES[G.choice.id].card+'.why');
      else if(isColony())tip=t('colony.help');
      else tip=t(G.modal==='info'||G.hint?.key==='hint.upgrade'?'play.hint.upgrade':'play.hint.base');
    }
    const el=$('#explainPanel');el.innerHTML='<div class="explain-card card"><h2>'+esc(title)+'</h2><strong>'+esc(t('play.what'))+'</strong><p>'+esc(body)+'</p><strong>'+esc(t('play.tip'))+'</strong><p>'+esc(tip)+'</p><button class="btn" id="explainClose">'+esc(t('play.close'))+'</button></div>';el.hidden=false;
    $('#explainClose').addEventListener('click',closeExplanation);$('#explainClose').focus();
  }
  function closeExplanation() { const el=$('#explainPanel');if(el)el.hidden=true;if(explainFocus?.isConnected)explainFocus.focus();explainFocus=null; }
  $('#hud').addEventListener('click',e=>{const b=e.target.closest('[data-explain]');if(b)showExplanation(b.dataset.explain);});

  function isColony(){return !!G.st?.settlement;}
  function saveBucket(){const key=store.playStyle==='guided'?'saves':'colonies';return store[key]||(store[key]={});}
  function recipesFor(slot){return Object.entries(SO.RECIPES).filter(([,r])=>r.building===G.st.slots[slot]?.type);}
  function goodsVisual(need){return Object.entries(need).map(([k,n])=>'<span>'+ART.icon(({rocks:'rock',ice:'ice',air:'air',water:'water',food:'food',usedWater:'water',power:'power',cabin:'air'})[k]||'bag')+' '+n+' '+esc(t('colony.'+k))+'</span>').join(' ');}
  function goodsText(need){return Object.entries(need).map(([k,n])=>n+' '+t('colony.'+k)).join(' + ');}
  function renderColonyCard(){
    const el=$('#missionCard'),c=SO.ensure(G.st),sig=JSON.stringify([c.level,c.credits,c.orders,c.produced,G.moveSlot]);
    if(el.dataset.sig!==sig){el.dataset.sig=sig;el.innerHTML='<strong>'+esc(t('colony.goal',{n:c.level}))+'</strong><p>'+esc(t('colony.credits',{n:c.credits}))+'</p><small>'+esc(t('colony.deliveries',{n:Math.min(6,c.orders)}))+'<br>'+esc(t('colony.produced',{n:Math.min(6,c.produced)}))+'</small><p>'+esc(t(G.moveSlot>=0?'colony.pickPlot':'colony.plan'))+'</p><button class="btn small" data-colony-hub>'+esc(t('colony.hub'))+'</button>'+(G.moveSlot>=0?'<button class="btn secondary small" data-cancel-move>'+esc(t('colony.cancelMove'))+'</button>':'');}
    el.hidden=!!G.dig;renderJobs();
  }
  function renderOrders(){
    const c=SO.ensure(G.st),built=G.st.slots.filter(Boolean).length,cost=c.level===1?16:c.level===2?40:0,need=c.level===1?2:4;
    let html='<h2>'+esc(t('colony.hub'))+'</h2><div class="warehouse">'+SO.GOODS.map(k=>'<span><b>'+esc(t('colony.'+k))+'</b> '+c.stock[k]+(k!=='usedWater'?'<button class="btn small secondary" data-act="colonyUse" data-val="'+k+'" '+(!c.stock[k]||G.st.m[k]>=100?'disabled':'')+'>'+esc(t('colony.use'))+'</button>':'')+'</span>').join('')+'</div><div class="hq-tools"><button class="btn" data-act="colonyExpand" '+(!cost||c.credits<cost||built<need?'disabled':'')+'>'+esc(t(cost?'colony.upgrade':'colony.max',{n:cost}))+'</button>'+(cost?'<small>'+esc(t('colony.required',{n:need}))+'</small>':'')+'</div><div class="order-grid">';
    for(const[id,o]of Object.entries(SO.ORDERS)){
      const enough=Object.entries(o.need).every(([k,n])=>SO.amount(G.st,k)>=n);
      html+='<section class="order-card"><h3>'+esc(t('colony.order.'+id))+'</h3><p>'+goodsVisual(o.need)+'</p><button class="btn" data-act="colonyDeliver" data-val="'+id+':'+c.orders+'" '+(!enough?'disabled':'')+'>'+esc(t('colony.deliver',{n:o.credits}))+'</button>'+(!enough?'<small>'+esc(t('colony.need'))+'</small>':'')+'</section>';
    }
    html+='</div><div class="mfoot"><button class="btn secondary" data-act="close">'+esc(t('btn.close'))+'</button></div>';

    $('#modal').innerHTML=html;
  }
  function renderIndustry(){
    const slot=G.infoSlot,b=G.st.slots[slot];if(!b){closeModal();return;}
    const c=SO.ensure(G.st),job=c.jobs.find(x=>x.slot===slot);
    if(G.infoConfirm){$('#modal').innerHTML='<h2>'+esc(t('info.removeAsk'))+'</h2><div class="mfoot"><button class="btn" data-act="removeNo">'+esc(t('btn.removeNo'))+'</button><button class="btn secondary" data-act="removeYes">'+esc(t('btn.removeYes'))+'</button></div>';return;}
    let html='<div class="mhead"><h2>'+esc(t('b.'+b.type+'.name'))+'</h2><button class="btn secondary" data-act="close">'+esc(t('btn.close'))+'</button></div><p>'+esc(t('info.lv',{n:b.lv}))+'</p><div class="industry-layout">'+ART.buildingSvg(b.type)+'<div>';
    for(const[id,r]of recipesFor(slot)){
      const blocked=SO.canStart(G.st,slot,id);
      html+='<section class="recipe-card"><h3>'+esc(t('colony.'+id))+'</h3><p>'+esc(t('colony.explain.'+id))+'</p><p><b>'+esc(t('colony.input'))+':</b> '+goodsVisual(r.input)+(r.power?' + '+r.power+' '+esc(t('colony.power')):'')+'</p><p><b>'+esc(t('colony.output'))+':</b> '+goodsVisual(SO.outputs(G.st,slot,id))+'</p><button class="btn" data-act="colonyStart" data-val="'+id+'" '+(blocked?'disabled':'')+'>'+esc(t('colony.start'))+'</button>'+(blocked?'<small>'+esc(t('colony.reason.'+blocked))+'</small>':'')+'</section>';
    }
    if(!recipesFor(slot).length)html+='<p>'+esc(t('colony.service'))+'</p>';
    if(job)html+='<button class="btn" data-ready-job="'+job.id+'" data-act="colonyCollect" data-val="'+job.id+'"></button>';
    html+='</div></div><div class="mfoot"><button class="btn secondary" data-act="colonyMove">'+esc(t('colony.move'))+'</button><button class="btn secondary" data-act="remove" '+(job?'disabled':'')+'>'+esc(t('colony.remove'))+'</button>'+(b.lv<3?'<button class="btn" id="upBtn" data-act="upgrade" '+(G.st.rocks<C.UPGRADE_COST[b.lv+1]?'disabled':'')+'>'+esc(t('btn.upgrade'))+' · '+C.UPGRADE_COST[b.lv+1]+' '+esc(t('hud.rocks'))+'</button>':'')+'</div>';
    $('#modal').innerHTML=html;renderJobs();
  }
  function renderJobs(){
    const layer=$('#productionMarkers');layer.hidden=!isColony()||G.screen!=='game';if(layer.hidden)return;
    const c=SO.ensure(G.st),sig=c.jobs.map(j=>j.id+':'+j.slot).join(',');
    if(layer.dataset.sig!==sig){layer.dataset.sig=sig;layer.innerHTML=c.jobs.map(j=>'<button class="job-marker" style="left:'+(SLOT_X[j.slot]-50)+'px" data-ready-job="'+j.id+'" data-collect="'+j.id+'"></button>').join('');}
    for(const el of $$('[data-ready-job]')){const job=c.jobs.find(j=>j.id===Number(el.dataset.readyJob));if(!job)continue;const left=Math.max(0,Math.ceil((job.readyAt-Date.now())/1000));el.disabled=left>0;el.textContent=t(left?'colony.wait':'colony.collect',{n:left});el.classList.toggle('ready',left===0);}
  }
  function learnByDoing(id){if(!C.CARDS[id])return;if(!G.st.book.includes(id))G.st.book.push(id);if(C.CHOICES[id])G.st.done[id]=true;}
  function collectColony(id){const recipe=SO.ensure(G.st).jobs.find(j=>j.id===Number(id))?.recipe;if(!SO.collect(G.st,Number(id)))return;learnByDoing(({charge:'solar',rockAir:'rocksAir',iceWater:'iceWater',oxygen:'oxygen',garden:'plants',recycle:'waterRec',clean:'co2'})[recipe]);saveGame();updateHud();renderMission();if(G.modal==='industry')renderIndustry();say('colony.collected',null,2500);if(!checkFail())checkColonyWin();}
  function checkColonyWin(){const c=SO.ensure(G.st);if(!SO.won(G.st)||c.celebrated)return;c.celebrated=true;saveGame();openModal('colonyWin',()=>{$('#modal').innerHTML='<h2>'+esc(t('colony.ready'))+'</h2><p>'+esc(t('colony.win'))+'</p><div class="mfoot"><button class="btn" data-act="close">'+esc(t('colony.stay'))+'</button><button class="btn secondary" data-act="colonyLeave">'+esc(t('colony.leave'))+'</button></div>';});}
  $('#productionMarkers').addEventListener('click',e=>{const b=e.target.closest('[data-collect]');if(b&&!b.disabled&&!G.modal)collectColony(b.dataset.collect);});
  $('#btnOrders').addEventListener('click',()=>{if(isColony()&&G.mode==='base'&&!G.modal)openModal('orders',renderOrders);});
  $('#missionCard').addEventListener('click',e=>{if(e.target.closest('[data-cancel-move]')){G.moveSlot=-1;renderMission();}else if(e.target.closest('[data-colony-hub]')&&!G.modal&&G.mode==='base')openModal('orders',renderOrders);});
  $$('[data-play-style]').forEach(b=>b.addEventListener('click',()=>{store.playStyle=b.dataset.playStyle;persist();renderStart();}));

  // ------------------------------------------------------------------ start
  SFX.setMuted(store.muted !== false);
  setAstro(IDLE_X, GROUND);
  applyStatic();
  renderCorner();
  renderMascot();
  goStart();
  requestAnimationFrame(tickPointer);

  // A tiny hook for automated checks (read-only view of the state).
  window.OX_DEBUG = { get state() { return G.st; }, get mode() { return G.mode; }, get modal() { return G.modal; }, get hint() { return G.hint; }, get choice() { return G.choice ? {id:G.choice.id,wrongOpt:G.choice.wrongOpt,tried:G.choice.tried.slice()} : null; }, get countdown() { return G.cd ? {left:G.cd.left,paused:G.cd.paused} : null; }, get step() { return currentStep(); } };
})();
