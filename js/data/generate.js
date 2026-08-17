// Endless questions.
//
// The hand-written banks are the best ones — clearest wording, most careful
// explanations — so a level's *first* run always uses them. Every run after
// that is generated, which means a child who replays is doing maths again
// rather than remembering which tile was green last time.
import fractions from './gen/fractions.js';
import { RATIO_TEMPLATES, PERCENT_TEMPLATES } from './gen/ratio.js';
import { GEOMETRY_TEMPLATES, COORD_TEMPLATES } from './gen/geometry.js';
import {
  RATIONAL_TEMPLATES, EQUATION_TEMPLATES, INEQUALITY_TEMPLATES,
} from './gen/algebra.js';
import { mulberry32, randomSeed, daySeed, shuffle } from './gen/rng.js';

const MIXED = [
  ...fractions, ...RATIO_TEMPLATES, ...PERCENT_TEMPLATES, ...GEOMETRY_TEMPLATES,
  ...COORD_TEMPLATES, ...RATIONAL_TEMPLATES, ...EQUATION_TEMPLATES,
  ...INEQUALITY_TEMPLATES,
];

const TEMPLATES = {
  l1: fractions,
  l2: fractions,
  l3: RATIO_TEMPLATES,
  l4: PERCENT_TEMPLATES,
  l5: GEOMETRY_TEMPLATES,
  l6: RATIONAL_TEMPLATES,
  l7: COORD_TEMPLATES,
  l8: EQUATION_TEMPLATES,
  l9: INEQUALITY_TEMPLATES,
  l10: MIXED,
};

/** Draw `count` generated questions for a level, cycling templates evenly. */
export function generateQuestions(levelId, count, seed = randomSeed()) {
  const templates = TEMPLATES[levelId] ?? MIXED;
  const rng = mulberry32(seed);
  const order = shuffle(rng, templates.map((_, i) => i));
  const out = [];
  for (let i = 0; i < count; i++) {
    const template = templates[order[i % order.length]];
    out.push(template(rng, `${levelId}g${seed}_${i}`));
  }
  return out;
}

/** The daily trial: the same questions for everyone on the same calendar day. */
export function dailyQuestions(count = 6, seed = daySeed()) {
  const rng = mulberry32(seed);
  const order = shuffle(rng, MIXED.map((_, i) => i));
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(MIXED[order[i % order.length]](rng, `daily${seed}_${i}`));
  }
  return out;
}

/**
 * The set a level should play right now. `fresh` (an already-cleared level, or
 * an explicit replay) swaps in generated work.
 */
export function questionsFor(level, { fresh = false } = {}) {
  if (!fresh) return level.questions;
  return generateQuestions(level.id, level.questions.length);
}
