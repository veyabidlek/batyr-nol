// Seeded randomness, so a daily challenge is identical for every player that
// day (which is what makes comparing results with a classmate mean anything)
// while a replayed level is different every time.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

/** Same seed for everyone on the same calendar day. */
export const daySeed = (date = new Date()) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

export const int = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

export function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build an mcq from the right answer plus candidate wrong ones. Distractors are
 * the mistakes a child actually makes, deduped and padded if a clash removes
 * too many.
 */
export function mcq(rng, correct, wrong) {
  const seen = new Set([String(correct)]);
  const options = [];
  for (const w of wrong) {
    const key = String(w);
    if (seen.has(key) || w === null || w === undefined) continue;
    seen.add(key);
    options.push(w);
    if (options.length === 3) break;
  }
  // Padding must terminate even when the answer is LaTeX rather than a number —
  // Number("\\frac{3}{4}") is NaN, and NaN ± pad is never > 0, which span an
  // infinite loop the first time a fraction template ran short on distractors.
  const numeric = Number(correct);
  let pad = 1;
  while (options.length < 3 && pad < 40) {
    const candidate = Number.isFinite(numeric)
      ? numeric + pad * (pad % 2 ? 1 : -1)
      : `${correct}\\;${'\\,'.repeat(pad)}`;
    const key = String(candidate);
    if (!seen.has(key) && (!Number.isFinite(numeric) || candidate > 0)) {
      seen.add(key);
      options.push(candidate);
    }
    pad += 1;
  }
  while (options.length < 3) options.push(`?${options.length}`);   // last resort
  const all = shuffle(rng, [correct, ...options]);
  return { opts: all.map(String), correct: all.findIndex((o) => String(o) === String(correct)) };
}
