// Two pieces of the fight screen that are pure functions of state, pulled out
// so battle.js stays about timing rather than wording.
import { BARYS_ON_WRONG, BARYS_ON_STREAK, BARYS_ON_PARRY, pickLine } from '../data/story.js';
import { el, img } from '../dom.js';
import { t, localized } from '../i18n.js';

/**
 * One short label per power, so the rule bending this fight is always legible
 * on the chip — "½" while the Halver is about to weaken you, "↑ ×1,5" while the
 * Scales are tipped your way.
 */
export function powerStateLabel(battle, power) {
  const s = battle.powerState || {};
  switch (power?.id) {
    case 'halve': return s.weakNext ? '½' : '1';
    case 'skew': return s.up ? '↑ ×1,5' : '↓ ×0,5';
    case 'scale': return s.big ? '⬆' : '⬇';
    case 'pin': return s.locked ? '🔒' : '🔓';
    case 'drain': return s.lastToll ? `−${s.lastToll}` : '';
    case 'devour': return s.eaten ? `+${s.eaten}` : '';
    case 'invert': return s.fed ? `+${s.fed}` : '±';
    case 'mirrorDamage': return s.returned ? `↩${s.returned}` : '↩';
    case 'asymptote': return '→ 1';
    case 'erase': return { clock: '⏱', option: '🞐', spirit: '⚡' }[s.erased] ?? '';
    default: return '';
  }
}

/** The card under the question: verdict, tags, worked explanation, companion. */
export function feedbackContent({ q, correct, answerNode, outcome }) {
  const bits = [];

  if (correct) {
    const tags = [];
    if (outcome.parried) tags.push(`🛡 ${t('parried')}`);
    if (outcome.ultimate) tags.push(`⚡ ${t('spirit')}`);
    if (outcome.crit) tags.push(`💥 ${t('crit')}`);
    if (outcome.fast) tags.push(`⏱ ${t('fast')}`);
    bits.push(el('div', {
      class: 'feedback-title',
      text: outcome.parried ? t('parried') : outcome.ultimate ? t('spiritHit') : t('correct'),
    }));
    if (tags.length) bits.push(el('div', { class: 'feedback-tags', text: tags.join(' · ') }));
  } else {
    bits.push(el('div', {
      class: 'feedback-title',
      text: outcome.specialLanded ? t('specialLanded') : t('wrong'),
    }));
    if (answerNode) bits.push(el('div', { class: 'feedback-answer' }, [answerNode]));
  }

  // The explanation shows on a win too. A child who guessed right still has
  // not seen the method, and this is the only place the method appears.
  if (q.exp) bits.push(el('p', { class: 'feedback-exp', text: localized(q.exp) }));

  const line = !correct ? pickLine(BARYS_ON_WRONG)
    : outcome.parried ? pickLine(BARYS_ON_PARRY)
      : outcome.ultimate ? pickLine(BARYS_ON_STREAK)
        : null;
  if (line) bits.push(el('p', { class: 'feedback-cub', text: `🐆 ${localized(line)}` }));
  bits.push(img('barys', '', 'feedback-mascot'));

  return bits;
}
