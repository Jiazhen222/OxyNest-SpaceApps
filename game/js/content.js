/* OxyNest Moon Base: game rules and content (no text here; all text lives in i18n.js).
   Every outcome is fixed. Nothing in the game uses random numbers.

   NASA facts: each knowledge card has a "source" field. When it is empty, the card shows
   "[Fact to be added]" and hides "Learn more". Facts with a source were taken from the
   research references, named in "data", and are listed in docs/FACTS.md for checking. */
window.OX_CONTENT = (function () {
  'use strict';

  // Same game for every level; only these settings change.
  const LEVELS = {
    explorer: {
      opts: 2, eventOpts: 2, countdown: 0, pause: false, chain: false, numbers: false, units: false,
      dig: { taps: 2, tapCost: 0.09, drain: 0.008, dustEveryRun: false, dustSpots: [1] }
    },
    engineer: {
      opts: 2, eventOpts: 3, countdown: 30, pause: true, chain: false, numbers: true, units: false,
      dig: { taps: 3, tapCost: 0.06, drain: 0.010, dustEveryRun: true, dustSpots: [1] }
    },
    commander: {
      opts: 3, eventOpts: 3, countdown: 15, pause: false, chain: true, numbers: true, units: true,
      dig: { taps: 4, tapCost: 0.045, drain: 0.012, dustEveryRun: true, dustSpots: [1, 3] }
    }
  };
  const LEVEL_ORDER = ['explorer', 'engineer', 'commander'];

  // Meters run 0-100. For radiation, lower is better.
  const START = { survival: 70, air: 70, power: 60, water: 60, food: 70, rad: 15, rocks: 0, ice: 0, stars: 0 };

  // Fixed rewards. A right answer on the first try earns more than one after a wrong try.
  const REWARD = {
    first: { survival: 10, stars: 3, rocks: 2 },
    later: { survival: 4, stars: 1, rocks: 1 },
    wrong: { survival: -8 },
    late: { survival: -8 }
  };

  const SPOT_ROCKS = [3, 3, 3, 3];  // rocks from each dig spot, nearest first
  const ICE_PER_CHUNK = 2;           // ice from each chunk in the crater

  // Buildings. cost = rocks, time = seconds of the 3-2-1 build ring.
  // pw = power level for the cost row (+ makes, - uses, 's' stores).
  // kw = the power figure shown at Commander level: these are game-balance values from
  //      the research balance model, not NASA measurements (see docs/FACTS.md).
  const BUILDINGS = {
    solar:      { cat: 'power', cost: 6,  time: 3, pw: 2,   kw: '+25 kW',  page: 0, bonus: { power: 20 }, up: { power: 10 } },
    battery:    { cat: 'power', cost: 6,  time: 3, pw: 's', kw: '600 kWh', page: 0, bonus: { power: 15 }, up: { power: 10 } },
    oxygen:     { cat: 'air',   cost: 8,  time: 3, pw: -2,  kw: '3.5 kW',  page: 0, bonus: { air: 10 },   up: { air: 10 } },
    processor:  { cat: 'power', cost: 8,  time: 3, pw: -3,  kw: '6 kW',    page: 0, bonus: {},            up: {} },
    co2:        { cat: 'air',   cost: 8,  time: 3, pw: -1,  kw: '2 kW',    page: 1, bonus: { air: 10 },   up: { air: 10 } },
    water:      { cat: 'air',   cost: 8,  time: 3, pw: -1,  kw: '2.5 kW',  page: 1, bonus: { water: 15 }, up: { water: 10 } },
    greenhouse: { cat: 'food',  cost: 8,  time: 3, pw: -2,  kw: '4 kW',    page: 1, bonus: { food: 10 },  up: { food: 10 } },
    shelter:    { cat: 'rad',   cost: 10, time: 3, pw: -1,  kw: '0.5 kW',  page: 1, bonus: { rad: -5 },   up: { rad: -10 } }
  };
  const BUILD_ORDER = ['solar', 'battery', 'oxygen', 'processor', 'co2', 'water', 'greenhouse', 'shelter'];
  const UPGRADE_COST = { 2: 8, 3: 12 };  // rocks to reach Lv 2 and Lv 3
  const MAX_LV = 3;
  const SLOT_PREF = [2, 3, 1, 4, 0, 5];  // empty slot the arrow suggests first (next to the dome)

  // Processor recipes. Lv 2+ processors add +5 per level to what they make.
  const RECIPES = {
    rocksAir: { use: { rocks: 2, power: 10 }, gives: { air: 25 } },
    iceWater: { use: { ice: 2, power: 10 }, gives: { water: 25 } }
  };

  // Choices. Option roles: c = correct, w = plain wrong, t = tempting wrong.
  // Explorer sees c + w. Engineer sees c + w (c + w + t in events). Commander sees all three.
  // "order" is the fixed display order (never shuffled).
  // right / wrong = extra meter changes on top of REWARD (o2 = suit air in a dig).
  const CHOICES = {
    dust:      { card: 'dust',      order: ['harder', 'blow', 'wipe'],     roles: { blow: 'c', harder: 'w', wipe: 't' },
                 icons: { blow: 'wind', harder: 'arm', wipe: 'glove' }, right: {}, wrong: {} },
    suitAir:   { card: 'suitAir',   order: ['home', 'nap', 'oneMore'],     roles: { home: 'c', nap: 'w', oneMore: 't' },
                 icons: { home: 'dome', nap: 'zzz', oneMore: 'pick' }, right: {}, wrong: { o2: -0.08 } },
    night:     { card: 'night',     order: ['solar', 'battery', 'wait'],   roles: { battery: 'c', solar: 'w', wait: 't' },
                 icons: { battery: 'battery', solar: 'panel', wait: 'hourglass' }, right: {}, wrong: { power: -10 } },
    nightSave: { card: 'nightSave', order: ['heater', 'extras', 'air'],    roles: { extras: 'c', heater: 'w', air: 't' },
                 icons: { extras: 'bulb', heater: 'flame', air: 'fan' }, right: { power: 10 }, wrong: { power: -10 } },
    ice:       { card: 'ice',       order: ['lamp', 'glasses', 'panel'],   roles: { lamp: 'c', glasses: 'w', panel: 't' },
                 icons: { lamp: 'lamp', glasses: 'glasses', panel: 'panel' }, right: {}, wrong: {} },
    leak:      { card: 'leak',      order: ['door', 'moreAir', 'patch'],   roles: { patch: 'c', door: 'w', moreAir: 't' },
                 icons: { patch: 'patch', door: 'door', moreAir: 'bubbles' }, right: {}, wrong: { air: -10 } },
    rocksAir:  { card: 'rocksAir',  order: ['rocks', 'socks', 'ice'],      roles: { rocks: 'c', socks: 'w', ice: 't' },
                 icons: { rocks: 'rock', socks: 'sock', ice: 'ice' }, right: {}, wrong: { power: -5 }, recipe: 'rocksAir' },
    iceWater:  { card: 'iceWater',  order: ['duck', 'ice', 'rocks'],       roles: { ice: 'c', duck: 'w', rocks: 't' },
                 icons: { ice: 'ice', duck: 'duck', rocks: 'rock' }, right: {}, wrong: { power: -5 }, recipe: 'iceWater' },
    plants:    { card: 'plants',    order: ['dust', 'lightWater', 'dark'], roles: { lightWater: 'c', dust: 'w', dark: 't' },
                 icons: { lightWater: 'sprout', dust: 'dust', dark: 'moon' }, right: { food: 20, water: -5 }, wrong: {} },
    storm:     { card: 'storm',     order: ['shelter', 'dig', 'panel'],    roles: { shelter: 'c', dig: 'w', panel: 't' },
                 icons: { shelter: 'shield', dig: 'pick', panel: 'panel' }, right: {}, wrong: { rad: 20 } },
    stormWait: { card: 'stormWait', order: ['now', 'peek', 'wait'],        roles: { wait: 'c', now: 'w', peek: 't' },
                 icons: { wait: 'hourglass', now: 'door', peek: 'eye' }, right: {}, wrong: { rad: 10 } },
    meteor:    { card: 'meteor',    order: ['catch', 'inside', 'watch'],   roles: { inside: 'c', catch: 'w', watch: 't' },
                 icons: { inside: 'dome', catch: 'glove', watch: 'eye' }, right: {}, wrong: {} },
    oxygen:    { card: 'oxygen',    order: ['water', 'candy', 'rocks'],    roles: { water: 'c', candy: 'w', rocks: 't' },
                 icons: { water: 'water', candy: 'candy', rocks: 'rock' }, right: { air: 25, water: -10 }, wrong: {} },
    solar:     { card: 'solar',     order: ['night', 'sun', 'always'],     roles: { sun: 'c', night: 'w', always: 't' },
                 icons: { sun: 'sun', night: 'moon', always: 'clock' }, right: { power: 15 }, wrong: {} },
    co2:       { card: 'co2',       order: ['co2', 'smell', 'oxygen'],     roles: { co2: 'c', smell: 'w', oxygen: 't' },
                 icons: { co2: 'co2', smell: 'flower', oxygen: 'bubbles' }, right: { air: 15 }, wrong: {} },
    waterRec:  { card: 'waterRec',  order: ['throw', 'clean', 'freeze'],   roles: { clean: 'c', throw: 'w', freeze: 't' },
                 icons: { clean: 'recycle', throw: 'trash', freeze: 'ice' }, right: { water: 20 }, wrong: {} }
  };

  // Knowledge cards. cat picks the accent strip: power, air, food, rad, explore.
  // source '' = no NASA fact yet: the card shows "[Fact to be added]" and hides "Learn more".
  const CARDS = {
    dust:      { cat: 'explore', icon: 'wind',      source: '', src: '', data: '' },
    suitAir:   { cat: 'air',     icon: 'helmet',    source: 'https://www.nasa.gov/stem-content/artemis-generation-spacesuits-activity/',
                 src: 'spacesuits', data: 'failure_chains.json: chain_eva_oxygen_exhaustion' },
    night:     { cat: 'power',   icon: 'moon',      source: 'https://science.nasa.gov/moon/facts/',
                 src: 'moonfacts', data: 'consumption.json: lunar_environment_specs',
                 more: [{ url: 'https://www.nasa.gov/directorates/stmd/fission-surface-power/', src: 'fsp', data: 'wheel.json: slice_early_night_warning' }] },
    nightSave: { cat: 'power',   icon: 'bulb',      source: 'https://www.nasa.gov/directorates/stmd/fission-surface-power/',
                 src: 'fsp', data: 'wheel.json: slice_early_night_warning', only: 'commander' },
    ice:       { cat: 'air',     icon: 'ice',       source: 'https://science.nasa.gov/moon/moon-water-and-ices/',
                 src: 'moonwater', data: 'recipes.json: recipe_ice_thermal_extraction' },
    leak:      { cat: 'air',     icon: 'patch',     source: 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/',
                 src: 'issfacts', data: 'wheel.json: slice_micrometeoroid_alert' },
    rocksAir:  { cat: 'air',     icon: 'rock',      source: 'https://www.nasa.gov/space-technology-mission-directorate/lunar-surface-innovation-initiative/',
                 src: 'lsii', data: 'recipes.json: recipe_regolith_oxygen' },
    iceWater:  { cat: 'air',     icon: 'water',     source: 'https://science.nasa.gov/moon/moon-water-and-ices/',
                 src: 'moonwater', data: 'recipes.json: recipe_ice_thermal_extraction' },
    plants:    { cat: 'food',    icon: 'sprout',    source: 'https://science.nasa.gov/mission/veggie',
                 src: 'veggie', data: 'modules.json: greenhouse' },
    storm:     { cat: 'rad',     icon: 'shield',    source: 'https://srag.jsc.nasa.gov/SpaceRadiation/FAQ/FAQ.cfm',
                 src: 'srag', data: 'wheel.json: slice_spe_warning' },
    stormWait: { cat: 'rad',     icon: 'hourglass', source: 'https://srag.jsc.nasa.gov/SpaceRadiation/FAQ/FAQ.cfm',
                 src: 'srag', data: 'failure_chains.json: chain_spe_radiation_poisoning', only: 'commander' },
    meteor:    { cat: 'rad',     icon: 'meteor',    source: '', src: '', data: '' },
    oxygen:    { cat: 'air',     icon: 'bubbles',   source: 'https://www.nasa.gov/?p=407425',
                 src: 'oga', data: 'modules.json: oxygen_generator' },
    solar:     { cat: 'power',   icon: 'panel',     source: 'https://www.nasa.gov/space-technology-mission-directorate/lunar-surface-innovation-initiative/',
                 src: 'lsii', data: 'modules.json: solar_array' },
    co2:       { cat: 'air',     icon: 'co2',       source: 'https://ntrs.nasa.gov/citations/20150021777',
                 src: 'cdra', data: 'modules.json: co2_scrubber' },
    waterRec:  { cat: 'air',     icon: 'recycle',   source: 'https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station',
                 src: 'water98', data: 'modules.json: water_recycler' }
  };
  const CARD_ORDER = ['dust', 'suitAir', 'night', 'nightSave', 'ice', 'leak', 'rocksAir', 'iceWater',
                      'plants', 'storm', 'stormWait', 'meteor', 'oxygen', 'solar', 'co2', 'waterRec'];

  // Incoming events (they replace the attacks of a base-building game).
  // dark = how much the sky darkens. start/end = meter changes when the event begins/ends.
  // follow = Commander-only follow-up choice; chainEvent = Commander-only next event.
  const EVENTS = {
    night:  { choice: 'night',  dark: 0.62, start: { power: -10 }, end: { power: 30 }, endSay: 'say.morning',
              follow: { choice: 'nightSave', warn: 'ev.nightSave.warn', name: 'ev.nightSave.name' } },
    storm:  { choice: 'storm',  dark: 0.42, start: { rad: 10 },    end: { rad: -15 },   endSay: 'say.stormOver',
              follow: { choice: 'stormWait', warn: 'ev.stormWait.warn', name: 'ev.stormWait.name' } },
    leak:   { choice: 'leak',   dark: 0.30, start: { air: -10 },   end: {},             endSay: 'say.leakFixed' },
    meteor: { choice: 'meteor', dark: 0.45, start: {},             end: {},             endSay: 'say.meteorOver', chainEvent: 'leak' }
  };

  // The campaign. The first session is the guided one: dig rocks, build a battery, lunar night.
  // Step types: dig, mine, build (b), process (choice), pick (from). then = what runs after the build.
  const SESSIONS = [
    { say: 'say.s1', steps: [
      { type: 'dig' },
      { type: 'build', b: 'battery', then: ['event:night'] }
    ] },
    { say: 'say.s2', steps: [
      { type: 'mine' },
      { type: 'build', b: 'processor', then: ['event:leak'] },
      { type: 'process', choice: 'rocksAir' }
    ] },
    { say: 'say.s3', steps: [
      { type: 'process', choice: 'iceWater' },
      { type: 'build', b: 'greenhouse', then: ['quiz:plants'] },
      { type: 'build', b: 'shelter', then: ['event:storm'] }
    ] },
    { say: 'say.s4', steps: [
      { type: 'build', b: 'oxygen', then: ['event:meteor', 'quiz:oxygen'] },
      { type: 'pick', from: ['solar', 'co2', 'water'] }
    ] }
  ];

  // After the campaign: free building. Each new building asks its quiz once; after that,
  // every build or upgrade brings the next event in this fixed order.
  const FREE_EVENTS = ['night', 'storm', 'leak', 'meteor'];
  const QUIZ_OF = { solar: 'solar', co2: 'co2', water: 'waterRec', greenhouse: 'plants', oxygen: 'oxygen' };
  const FREE_SESSION_CHOICES = 3;

  // Badge: share of the stars that could have been earned this session.
  const BADGE = { gold: 0.85, silver: 0.5 };

  return { LEVELS, LEVEL_ORDER, START, REWARD, SPOT_ROCKS, ICE_PER_CHUNK, BUILDINGS, BUILD_ORDER,
           UPGRADE_COST, MAX_LV, SLOT_PREF, RECIPES, CHOICES, CARDS, CARD_ORDER, EVENTS, SESSIONS,
           FREE_EVENTS, QUIZ_OF, FREE_SESSION_CHOICES, BADGE };
})();
