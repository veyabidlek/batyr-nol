// Game feel. None of this changes what happens — it changes how hard it lands.
//
// The order matters more than the individual effects: wind-up (anticipation),
// contact, freeze (hitstop), then shake + particles (reaction). Skip the freeze
// and the same hit reads as a number changing on a screen.
import { prefersReducedMotion } from './dom.js';

const HITSTOP_MS = 100;

let canvas = null;
let ctx2d = null;
let particles = [];
let raf = null;

/** Mount the particle layer over the battle stage. */
export function attachFx(stage) {
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  stage.appendChild(canvas);
  ctx2d = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  return () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(raf);
    raf = null;
    particles = [];
    canvas = null;
    ctx2d = null;
  };
}

function resize() {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx2d?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const PALETTES = {
  hit: ['#FFC42E', '#FF9A00', '#FBF6EE'],
  crit: ['#FFC42E', '#FF4B4B', '#FFFFFF'],
  ultimate: ['#FFC42E', '#FF9A00', '#FFFFFF', '#C8894B'],
  heal: ['#4CB93E', '#C4EDA0', '#FFFFFF'],
};

/** Burst of sparks from a point inside the stage, in stage-local coordinates. */
export function burst(target, { count = 18, kind = 'hit', power = 1 } = {}) {
  if (!canvas || prefersReducedMotion()) return;
  const stage = canvas.parentElement.getBoundingClientRect();
  const box = target.getBoundingClientRect();
  const x = box.left - stage.left + box.width / 2;
  const y = box.top - stage.top + box.height / 2;
  const colors = PALETTES[kind] ?? PALETTES.hit;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.6 + Math.random() * 4.2) * power;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      life: 1,
      decay: 0.016 + Math.random() * 0.02,
      size: (2 + Math.random() * 4) * power,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  if (!raf) raf = requestAnimationFrame(step);
}

function step() {
  if (!ctx2d || !canvas) return;
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.14;              // gravity, so sparks arc instead of drifting
    p.vx *= 0.99;
    p.life -= p.decay;
    ctx2d.globalAlpha = Math.max(0, p.life);
    ctx2d.fillStyle = p.color;
    ctx2d.beginPath();
    ctx2d.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx2d.fill();
  }
  ctx2d.globalAlpha = 1;

  raf = particles.length ? requestAnimationFrame(step) : null;
}

/** Freeze every animation on the page for a beat. The single biggest win here. */
export function hitstop(ms = HITSTOP_MS) {
  if (prefersReducedMotion()) return Promise.resolve();
  document.body.classList.add('fx-freeze');
  return new Promise((done) => setTimeout(() => {
    document.body.classList.remove('fx-freeze');
    done();
  }, ms));
}

/** Re-triggerable CSS animation: strip the class, force reflow, put it back. */
function replay(node, cls, ms) {
  if (!node || prefersReducedMotion()) return;
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
  setTimeout(() => node.classList.remove(cls), ms);
}

export const shake = (level = 'sm') =>
  replay(document.getElementById('app'), `fx-shake-${level}`, level === 'lg' ? 520 : 320);

export const flash = (node, kind = 'white') => replay(node, `fx-flash-${kind}`, 220);

export const squash = (node) => replay(node, 'fx-squash', 380);

export const windUp = (node) => replay(node, 'fx-windup', 380);

/** Full-screen white wash — only for the ultimate and the killing blow. */
export function screenFlash(kind = 'gold') {
  if (prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = `fx-screen-flash fx-screen-${kind}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 520);
}

/** The blade's arc travelling from attacker to target — the hit's visible flight. */
export function arc(stage, { rightward = true, kind = 'hit' } = {}) {
  if (prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = `fx-arc fx-arc-${kind} ${rightward ? 'fx-arc-right' : 'fx-arc-left'}`;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 420);
}

/** Target slides away from the blow and settles back. */
export function knockback(node, rightward = true, heavy = false) {
  const cls = `fx-knock-${rightward ? 'right' : 'left'}${heavy ? '-lg' : ''}`;
  replay(node, cls, heavy ? 560 : 420);
}

/**
 * Anime-style close-up that slams in for the ultimate. The art is passed in —
 * this game has two heroes and eleven villains, and a hardcoded portrait was
 * exactly the bug the first game shipped with.
 */
export function cutIn(stage, art = 'aibyn_strike') {
  if (prefersReducedMotion()) return;
  const wrap = document.createElement('div');
  wrap.className = 'fx-cutin';
  const lines = document.createElement('div');
  lines.className = 'fx-cutin-lines';
  const img = document.createElement('img');
  img.src = `assets/${art}.webp`;
  img.alt = '';
  img.className = 'fx-cutin-art';
  wrap.append(lines, img);
  stage.appendChild(wrap);
  setTimeout(() => wrap.remove(), 900);
}

/** Radial speed lines — the cheapest way to make a still frame move. */
export function speedLines(stage, kind = 'gold') {
  if (prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = `fx-speed fx-speed-${kind}`;
  stage.appendChild(el);
  setTimeout(() => el.remove(), 640);
}

/**
 * One inverted frame at the moment of contact. Two frames of solid colour is
 * the oldest trick in television animation and still the most effective.
 */
export function impactFrame(stage) {
  if (prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = 'fx-impact-frame';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 130);
}

/** The band that warns a special is coming. Stays until it is answered. */
export function warningBand(stage, text) {
  const el = document.createElement('div');
  el.className = 'fx-warning';
  el.textContent = text;
  stage.appendChild(el);
  return () => el.remove();
}

/** An expanding ring where a surprise attack was blocked. */
export function guardRing(node) {
  if (prefersReducedMotion() || !node?.parentElement) return;
  const el = document.createElement('span');
  el.className = 'fx-guard-ring';
  node.parentElement.appendChild(el);
  setTimeout(() => el.remove(), 520);
}

/** The boss erasing a piece of the interface: it desaturates and goes. */
export function erasePuff(node) {
  if (!node) return;
  node.classList.add('fx-erased');
  setTimeout(() => node.classList.remove('fx-erased'), 900);
}

/** A sabre streak sweeping across the stage, used for the streak payoff. */
export function slash(stage) {
  if (prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = 'fx-slash';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 620);
}

/** Slow, heavy zoom for the final blow of a fight. */
export function finisher(stage) {
  if (prefersReducedMotion()) return Promise.resolve();
  stage.classList.add('fx-finisher');
  return new Promise((done) => setTimeout(() => {
    stage.classList.remove('fx-finisher');
    done();
  }, 900));
}

export const wait = (ms) => new Promise((done) => setTimeout(done, ms));
