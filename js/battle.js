// Combat model — pure state. No DOM, no timers; the view owns the clock.
//
// Four things carry a fight: the stake you pick before answering, the streak
// that spends itself on an ultimate, the herald's power (js/powers.js) bending
// one rule for the whole fight, and the two ways a herald hits back —
//
//   the SPECIAL   telegraphed, unmissable, and beaten by getting the next
//                 question right. A heavy attack a learner can always survive
//                 by knowing the maths is a better threat than one that lands
//                 on a dice roll.
//   the SURPRISE  unannounced, blocked by tapping guard inside a short window.
//                 The one reflex check in the game, and it can be switched off.

import { powerById } from './powers.js';

export const ATTACKS = {
  sword: { id: 'sword', damage: 12, selfDamage: 8, heal: 0 },
  spear: { id: 'spear', damage: 26, selfDamage: 20, heal: 0 },
  shield: { id: 'shield', damage: 6, selfDamage: 4, heal: 14 },
};

export const SPIRIT_AT = 3;
export const ULTIMATE_MULTIPLIER = 2.5;
export const CRIT_CHANCE = 0.15;
export const CRIT_MULTIPLIER = 2;
export const FAST_ANSWER_MS = 15000;
export const FAST_BONUS = 4;

export const GUARD_WINDOW_MS = 1400;

const DEFAULT_CHARGE_MS = 40000;
const DEFAULT_ENEMY_DAMAGE = 10;
const DEFAULT_SPECIAL_EVERY = 3;      // enemy strikes between telegraphs
const DEFAULT_SURPRISE_CHANCE = 0.14;

/** Boss phase thresholds, front to back: 2/3 health, then 1/3. */
const PHASE_AT = [0.66, 0.33];

export function createBattle(level, hero) {
  const b = {
    level,
    hero,
    heroHp: hero.hp,
    heroMaxHp: hero.hp,
    enemyHp: level.hp,
    enemyMaxHp: level.hp,
    index: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: 0,
    guards: 0,                       // surprise attacks blocked
    parries: 0,                      // specials countered
    attack: 'sword',
    phase: 1,
    chargeMs: level.chargeMs ?? DEFAULT_CHARGE_MS,
    enemyDamage: level.enemyDamage ?? DEFAULT_ENEMY_DAMAGE,
    specialEvery: level.specialEvery ?? DEFAULT_SPECIAL_EVERY,
    specialDamage: level.specialDamage ?? Math.round((level.enemyDamage ?? DEFAULT_ENEMY_DAMAGE) * 2.6),
    surpriseChance: level.surpriseChance ?? DEFAULT_SURPRISE_CHANCE,
    surpriseDamage: level.surpriseDamage ?? Math.round((level.enemyDamage ?? DEFAULT_ENEMY_DAMAGE) * 0.8),
    strikes: 0,
    pendingSpecial: false,
    lastOutcomeUltimate: false,
    power: powerById(level.power),
    powerState: {},
    over: null,                      // 'win' | 'lose' | 'outOfQuestions'
  };
  b.power?.init?.(b);
  return b;
}

export const currentQuestion = (b) => b.level.questions[b.index];

export const spiritCharge = (b) => Math.min(1, b.streak / SPIRIT_AT);
export const ultimateReady = (b) => b.streak === SPIRIT_AT - 1;

/** True while the herald's power forbids changing the stake. */
export const attackLocked = (b) => Boolean(b.power?.locksAttack?.(b));

/** What the boss has erased this phase, or null. */
export const erased = (b) => (b.power?.id === 'erase' ? b.powerState.erased : null);

/** Called by the view before each question is put on screen. */
export function beginQuestion(b) {
  b.power?.beforeQuestion?.(b);
  if (b.heroHp <= 0) b.over = 'lose';
  return b;
}

/** Whether this question should be interrupted, and when inside it. */
export function rollSurprise(b, { enabled = true, roll = Math.random() } = {}) {
  if (!enabled || b.over || b.pendingSpecial) return null;
  if (roll >= b.surpriseChance) return null;
  // Somewhere in the thinking window, never in the first breath of it.
  return { atMs: 2600 + Math.floor(roll * 9000) };
}

export function surpriseStrike(b, { guarded }) {
  if (guarded) {
    b.guards += 1;
    return { damage: 0, guarded: true };
  }
  b.heroHp = Math.max(0, b.heroHp - b.surpriseDamage);
  if (b.heroHp <= 0) b.over = 'lose';
  return { damage: b.surpriseDamage, guarded: false };
}

function checkPhase(b) {
  if (!b.level.phases || b.phase >= b.level.phases) return false;
  const ratio = b.enemyHp / b.enemyMaxHp;
  const threshold = PHASE_AT[b.phase - 1];
  if (threshold === undefined || ratio > threshold) return false;
  b.phase += 1;
  b.chargeMs = Math.round(b.chargeMs * 0.75);
  b.enemyDamage = Math.round(b.enemyDamage * 1.3);
  return true;
}

function checkOver(b) {
  if (b.enemyHp <= 0) b.over = 'win';
  else if (b.heroHp <= 0) b.over = 'lose';
  else if (b.index + 1 >= b.level.questions.length) b.over = 'outOfQuestions';
}

/** Enemy hp after a hit, respecting a power that forbids the last point. */
function applyDamage(b, dmg) {
  const floor = b.power?.floor?.(b) ?? 0;
  b.enemyHp = Math.max(floor, b.enemyHp - dmg);
}

/**
 * Apply one answer. Returns everything the view needs to stage the hit, so the
 * animation layer never recomputes any of the arithmetic.
 */
export function resolveAnswer(b, { correct, elapsedMs, roll = Math.random() }) {
  const attack = ATTACKS[b.attack] ?? ATTACKS.sword;
  const parrying = b.pendingSpecial;
  const result = {
    correct, attack: attack.id, damage: 0, selfDamage: 0, heal: 0,
    crit: false, ultimate: false, fast: false, phaseChanged: false,
    parried: false, specialLanded: false, streak: b.streak,
  };

  b.pendingSpecial = false;

  if (correct) {
    b.streak += 1;
    b.bestStreak = Math.max(b.bestStreak, b.streak);
    result.streak = b.streak;
    result.fast = elapsedMs <= FAST_ANSWER_MS;

    let dmg = attack.damage;
    if (b.streak >= SPIRIT_AT) {
      // The streak spends itself on one big hit rather than sitting as a buff:
      // a payoff you can see beats a multiplier you have to be told about.
      result.ultimate = true;
      dmg = Math.round(dmg * ULTIMATE_MULTIPLIER);
      b.streak = 0;
    } else if (roll < CRIT_CHANCE) {
      result.crit = true;
      dmg *= CRIT_MULTIPLIER;
    }
    if (result.fast) dmg += FAST_BONUS;

    // A countered special is the biggest single hit in the game — the reward
    // for reading the telegraph and then doing the maths anyway.
    if (parrying) {
      result.parried = true;
      b.parries += 1;
      dmg = Math.round(dmg * 2);
    }

    b.lastOutcomeUltimate = result.ultimate;
    dmg = Math.max(1, Math.round(b.power?.damage?.(b, dmg, result) ?? dmg));

    result.damage = dmg;
    result.heal = Math.min(attack.heal, b.heroMaxHp - b.heroHp);
    applyDamage(b, dmg);
    b.heroHp = Math.min(b.heroMaxHp, b.heroHp + attack.heal);
    b.power?.onCorrect?.(b, result);
    result.phaseChanged = checkPhase(b);
  } else {
    // Failing the parry is what the telegraph was warning about.
    const self = parrying ? b.specialDamage : attack.selfDamage;
    result.specialLanded = parrying;
    result.selfDamage = self;
    b.heroHp = Math.max(0, b.heroHp - self);
    b.streak = 0;
    b.mistakes += 1;
    b.lastOutcomeUltimate = false;
    result.streak = 0;
    b.power?.onWrong?.(b, result);
  }

  checkOver(b);
  return result;
}

/** The enemy's charge meter filled while the learner was thinking. */
export function enemyStrike(b) {
  b.heroHp = Math.max(0, b.heroHp - b.enemyDamage);
  b.streak = 0;
  b.strikes += 1;
  // Every few strikes it winds up instead of hitting again — the next question
  // becomes the parry.
  const telegraph = b.strikes % b.specialEvery === 0 && !b.over;
  if (telegraph) b.pendingSpecial = true;
  if (b.heroHp <= 0) b.over = 'lose';
  return { damage: b.enemyDamage, telegraph };
}

export function advance(b) {
  if (!b.over) b.index += 1;
  return b;
}
