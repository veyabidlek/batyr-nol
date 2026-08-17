// The choreography of a single blow, kept apart from the screen that owns state.
//
// Timing is the whole trick: anticipation (wind-up) → travel → contact → freeze
// → reaction. The HP bar deliberately does not move until after the freeze, so
// the number changing reads as a *consequence* of the hit rather than a
// coincidence — and the fighters swap pose frames throughout, because a still
// image that shakes is not an attack no matter how much polish sits on top.
import * as fx from '../fx.js';
import { sfx } from '../audio.js';

const WINDUP_MS = 260;
const TRAVEL_MS = 130;
const STRIKE_HOLD = 320;
const HURT_HOLD = 460;

/**
 * Play a landed hit.
 * @param {object} p
 * @param {HTMLElement} p.stage     battle stage (particle + projectile host)
 * @param {object} p.attacker       sprite controller that swings
 * @param {object} p.target         sprite controller that gets hit
 * @param {object} p.outcome        result from resolveAnswer()
 * @param {Function} p.commit       applies the damage to the UI (bars, numbers)
 * @param {boolean} p.rightward     true when the attack travels left → right
 */
export async function playHit({
  stage, attacker, target, outcome, commit, rightward = true, cutInArt,
}) {
  attacker.setPose('windup');
  sfx.swing();
  await fx.wait(WINDUP_MS);

  attacker.setPose('strike', STRIKE_HOLD);
  fx.arc(stage, { rightward, kind: outcome.ultimate ? 'ultimate' : outcome.crit ? 'crit' : 'hit' });
  await fx.wait(TRAVEL_MS);

  const heavy = outcome.ultimate || outcome.crit || outcome.parried;

  // A countered special gets its own opening beat so it never reads as an
  // ordinary hit that happened to be large.
  if (outcome.parried) {
    sfx.parry();
    fx.impactFrame(stage);
    fx.speedLines(stage, 'white');
  }

  if (outcome.ultimate) {
    fx.cutIn(stage, cutInArt);
    fx.slash(stage);
    fx.speedLines(stage, 'gold');
    fx.screenFlash('gold');
    sfx.ultimate();
  } else if (outcome.crit) {
    fx.screenFlash('white');
    sfx.crit();
  } else {
    sfx.hit();
  }

  target.setPose('hurt', HURT_HOLD);
  fx.flash(target.el, outcome.ultimate ? 'gold' : 'white');
  fx.knockback(target.el, rightward, heavy);
  fx.burst(target.el, {
    kind: outcome.ultimate ? 'ultimate' : outcome.crit ? 'crit' : 'hit',
    count: outcome.ultimate ? 52 : outcome.crit ? 32 : 20,
    power: outcome.ultimate ? 1.8 : outcome.crit ? 1.3 : 1,
  });
  fx.shake(heavy ? 'lg' : 'sm');

  await fx.hitstop(outcome.ultimate ? 180 : outcome.crit ? 130 : 100);
  commit();
  if (outcome.streak > 0) sfx.combo(outcome.streak);
  if (outcome.heal) sfx.heal();
}

/** The learner taking damage — from a wrong answer or from the enemy's clock. */
export async function playHurt({ hero, commit, rightward = false }) {
  sfx.hurt();
  hero.setPose('hurt', HURT_HOLD);
  fx.flash(hero.el, 'red');
  fx.knockback(hero.el, rightward, false);
  fx.burst(hero.el, { kind: 'crit', count: 16 });
  fx.shake('sm');
  await fx.hitstop(90);
  commit();
}

/** The enemy winding up and striking when its charge meter fills. */
export async function playEnemyStrike({ stage, enemy, hero, commit }) {
  enemy.setPose('windup');
  sfx.swing();
  await fx.wait(WINDUP_MS);
  enemy.setPose('strike', STRIKE_HOLD);
  fx.arc(stage, { rightward: false, kind: 'hit' });
  await fx.wait(TRAVEL_MS);
  await playHurt({ hero, commit, rightward: false });
}

/**
 * The wind-up for a special: the herald rears back and *stays* there. Nothing
 * lands here — the next answer decides whether it ever does, which is the whole
 * reason the attack is telegraphed rather than rolled.
 */
export async function playTelegraph({ stage, enemy }) {
  sfx.telegraph();
  fx.speedLines(stage, 'red');
  fx.shake('sm');
  enemy.setPose('windup');
  await fx.wait(520);
}

/** A surprise attack that got through the guard window. */
export async function playSurprise({ stage, enemy, hero, commit }) {
  fx.impactFrame(stage);
  enemy.setPose('strike', STRIKE_HOLD);
  fx.arc(stage, { rightward: false, kind: 'crit' });
  await fx.wait(90);
  await playHurt({ hero, commit, rightward: false });
}

/** A surprise attack the player blocked in time. */
export async function playGuard({ stage, enemy, hero, commit }) {
  sfx.block();
  enemy.setPose('strike', STRIKE_HOLD);
  fx.guardRing(hero.el);
  fx.flash(hero.el, 'gold');
  fx.shake('sm');
  await fx.hitstop(80);
  commit();
}

/** Last blow of the fight: slow zoom, wash, fanfare. */
export async function playFinisher(stage) {
  fx.screenFlash('gold');
  fx.speedLines(stage, 'gold');
  sfx.win();
  await fx.finisher(stage);
}
