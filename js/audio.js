// Sound effects, synthesised in WebAudio rather than shipped as files.
// Nothing to download, nothing to cache, works offline — and the combo blip can
// be pitched per streak, which a fixed sample can't do.
//
// Browsers block audio until a gesture, so the context is created lazily on the
// first tap and every call is a no-op before that.

let ctx = null;
let muted = localStorage.getItem('batyrnol-muted') === '1';

export const isMuted = () => muted;

export function toggleMute() {
  muted = !muted;
  localStorage.setItem('batyrnol-muted', muted ? '1' : '0');
  return muted;
}

function audio() {
  if (muted) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** One shaped oscillator. Everything below is built from these. */
function tone({ freq, to, type = 'sine', dur = 0.18, gain = 0.25, delay = 0 }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Filtered white noise — the body of every impact and whoosh. */
function noise({ dur = 0.2, gain = 0.25, from = 1800, to = 260, q = 1, delay = 0 }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(t0);
}

export const sfx = {
  /** Sabre leaving its arc — plays on the wind-up, before contact. */
  swing() {
    noise({ dur: 0.16, gain: 0.16, from: 2600, to: 900, q: 0.7 });
  },

  /** The hit itself: a low thud with a bright transient on top. */
  hit(power = 1) {
    tone({ freq: 160 * power, to: 55, type: 'square', dur: 0.16, gain: 0.22 });
    noise({ dur: 0.13, gain: 0.24, from: 2200, to: 300 });
  },

  crit() {
    tone({ freq: 880, to: 1760, type: 'triangle', dur: 0.14, gain: 0.2 });
    tone({ freq: 1320, type: 'triangle', dur: 0.2, gain: 0.16, delay: 0.07 });
    noise({ dur: 0.25, gain: 0.22, from: 4000, to: 600 });
  },

  /** The streak payoff — a rising three-note figure over a swell. */
  ultimate() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.18, delay: i * 0.075 }));
    noise({ dur: 0.5, gain: 0.2, from: 3000, to: 200, delay: 0.2 });
    tone({ freq: 90, to: 40, type: 'sawtooth', dur: 0.5, gain: 0.2, delay: 0.2 });
  },

  /** Pitch climbs a semitone per correct answer — the actual hook. */
  combo(streak) {
    const semitone = Math.min(streak, 12);
    tone({ freq: 440 * Math.pow(2, semitone / 12), type: 'triangle', dur: 0.12, gain: 0.14 });
  },

  heal() {
    tone({ freq: 520, to: 880, type: 'sine', dur: 0.28, gain: 0.16 });
  },

  /** Taking damage: dull, downward, unmistakably bad. */
  hurt() {
    tone({ freq: 220, to: 70, type: 'sawtooth', dur: 0.3, gain: 0.2 });
    noise({ dur: 0.2, gain: 0.16, from: 700, to: 120 });
  },

  /** The enemy's charge meter filling — a tick that speeds up in the view. */
  tick() {
    tone({ freq: 660, type: 'square', dur: 0.05, gain: 0.06 });
  },

  /** A herald winding up its special: two low warning notes, unmistakable. */
  telegraph() {
    tone({ freq: 150, to: 110, type: 'sawtooth', dur: 0.34, gain: 0.2 });
    tone({ freq: 150, to: 110, type: 'sawtooth', dur: 0.34, gain: 0.2, delay: 0.4 });
    noise({ dur: 0.7, gain: 0.1, from: 300, to: 90, delay: 0.15 });
  },

  /** A countered special: the ring of a blade turning something aside. */
  parry() {
    tone({ freq: 1400, to: 2600, type: 'triangle', dur: 0.12, gain: 0.2 });
    tone({ freq: 2100, type: 'sine', dur: 0.4, gain: 0.12, delay: 0.05 });
    noise({ dur: 0.3, gain: 0.18, from: 6000, to: 1200, q: 3 });
  },

  /** The guard window opening — a short bright alarm, not a scare. */
  alert() {
    [880, 1174].forEach((f, i) =>
      tone({ freq: f, type: 'square', dur: 0.09, gain: 0.13, delay: i * 0.1 }));
  },

  /** A blocked surprise attack: a dull metal thud, no damage in it. */
  block() {
    tone({ freq: 320, to: 180, type: 'square', dur: 0.14, gain: 0.18 });
    noise({ dur: 0.18, gain: 0.2, from: 1200, to: 200, q: 2 });
  },

  /** The boss erasing something. Nothing lands — a thing simply stops. */
  erase() {
    tone({ freq: 700, to: 40, type: 'sine', dur: 0.6, gain: 0.16 });
    noise({ dur: 0.5, gain: 0.1, from: 200, to: 60 });
  },

  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone({ freq: f, type: 'triangle', dur: 0.34, gain: 0.18, delay: i * 0.11 }));
  },

  lose() {
    [392, 349, 294, 233].forEach((f, i) =>
      tone({ freq: f, type: 'sine', dur: 0.34, gain: 0.16, delay: i * 0.13 }));
  },
};
