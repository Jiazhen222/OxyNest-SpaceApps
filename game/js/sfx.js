/* OxyNest Moon Base: sound effects made with the Web Audio API (no sound files, nothing downloaded). */
window.OX_SFX = (function () {
  'use strict';
  let ctx = null, master = null, muted = false, noiseBuf = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.7;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      let s = 1;   // fixed noise pattern (no random numbers), same sound every time
      for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    } catch (e) { ctx = null; return false; }
    return true;
  }

  function tone(freq, start, dur, opts) {
    opts = opts || {};
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = opts.type || 'sine';
    const t0 = ctx.currentTime + start;
    o.frequency.setValueAtTime(freq, t0);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
    const v = opts.vol == null ? 0.18 : opts.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  function noise(start, dur, opts) {
    opts = opts || {};
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = opts.filter || 'lowpass';
    const t0 = ctx.currentTime + start;
    f.frequency.setValueAtTime(opts.freq || 1000, t0);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
    f.Q.value = opts.q || 1;
    const v = opts.vol == null ? 0.2 : opts.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + Math.min(0.04, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  const SOUNDS = {
    tap() { tone(560, 0, 0.07, { to: 700, vol: 0.12 }); },
    dig() { noise(0, 0.12, { freq: 900, vol: 0.28 }); tone(150, 0, 0.14, { to: 90, vol: 0.22 }); },
    rock() { tone(880, 0, 0.08, { type: 'triangle', vol: 0.16 }); tone(1320, 0.07, 0.1, { type: 'triangle', vol: 0.14 }); },
    ice() { tone(1568, 0, 0.1, { type: 'triangle', vol: 0.12 }); tone(2093, 0.06, 0.14, { type: 'triangle', vol: 0.1 }); },
    blow() { noise(0, 0.5, { filter: 'bandpass', freq: 400, to: 1800, q: 0.8, vol: 0.22 }); },
    right() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.16, { type: 'triangle', vol: 0.16 })); },
    wrong() { tone(392, 0, 0.18, { vol: 0.12 }); tone(330, 0.16, 0.24, { vol: 0.11 }); },
    build() { tone(300, 0, 0.3, { type: 'triangle', to: 900, vol: 0.14 }); },
    pop() { tone(620, 0, 0.09, { to: 1240, vol: 0.18 }); noise(0, 0.08, { filter: 'highpass', freq: 2000, vol: 0.08 }); },
    tick() { tone(1000, 0, 0.04, { type: 'square', vol: 0.05 }); },
    warn() { [660, 880, 660, 880].forEach((f, i) => tone(f, i * 0.2, 0.18, { vol: 0.1 })); },
    star() { tone(1568, 0, 0.08, { type: 'triangle', vol: 0.1 }); tone(2349, 0.06, 0.12, { type: 'triangle', vol: 0.08 }); },
    page() { noise(0, 0.14, { filter: 'highpass', freq: 1500, vol: 0.1 }); },
    hiss() { noise(0, 0.9, { filter: 'bandpass', freq: 3200, q: 0.6, vol: 0.07 }); },
    boom() { noise(0, 0.35, { freq: 380, vol: 0.3 }); tone(90, 0, 0.3, { to: 50, vol: 0.2 }); },
    whoosh() { noise(0, 0.5, { filter: 'bandpass', freq: 700, to: 2600, vol: 0.12 }); },
    night() { tone(440, 0, 0.7, { to: 220, vol: 0.1 }); },
    sunrise() { tone(330, 0, 0.7, { to: 660, vol: 0.1 }); tone(495, 0.2, 0.6, { to: 990, vol: 0.06 }); },
    fail() { [523, 440, 349].forEach((f, i) => tone(f, i * 0.22, 0.3, { vol: 0.12 })); },
    ding() { tone(988, 0, 0.18, { type: 'triangle', vol: 0.12 }); tone(1319, 0.12, 0.24, { type: 'triangle', vol: 0.1 }); },
    machine() { tone(110, 0, 0.6, { type: 'sawtooth', vol: 0.04 }); noise(0, 0.6, { filter: 'bandpass', freq: 600, vol: 0.06 }); }
  };

  function play(name) {
    if (muted || !ensure() || !SOUNDS[name]) return;
    try { SOUNDS[name](); } catch (e) { /* sound is optional */ }
  }
  function setMuted(m) {
    muted = !!m;
    if (master) master.gain.value = muted ? 0 : 0.7;
  }
  function unlock() { if (!muted) ensure(); }

  return { play, setMuted, unlock, isMuted: () => muted };
})();
