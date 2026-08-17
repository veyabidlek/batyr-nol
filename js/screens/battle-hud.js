// The fight screen's DOM, built once and handed back as a bag of references.
//
// Kept apart from battle.js so that file can be read as the fight's logic
// rather than as a wall of createElement. Nothing here knows the rules; it
// draws what it is told.
import { ATTACKS } from '../battle.js';
import { el, img } from '../dom.js';
import { t, localized } from '../i18n.js';

const ATTACK_COPY = {
  sword: { name: 'swordName', hint: 'swordHint', icon: '🗡' },
  spear: { name: 'spearName', hint: 'spearHint', icon: '🏹' },
  shield: { name: 'shieldName', hint: 'shieldHint', icon: '🛡' },
};

export function buildHud({ level, foe, hero, power, heroSprite, enemySprite, handlers }) {
  const refs = {
    enemyFill: el('span', { class: 'hp-fill hp-fill-enemy' }),
    heroFill: el('span', { class: 'hp-fill hp-fill-hero' }),
    chargeFill: el('span', { class: 'charge-fill' }),
    spiritFill: el('span', { class: 'spirit-fill' }),
    track: el('span', { class: 'track-fill' }),
    heartValue: el('b', { class: 'hp-mini-value num' }),
    powerState: el('span', { class: 'power-state' }),
    phaseBadge: el('span', { class: 'phase-badge', hidden: true }),
  };

  refs.spiritBadge = el('div', { class: 'spirit-badge', hidden: true, text: `⚡ ${t('spiritReady')}` });

  refs.chargeBar = el('div', { class: 'charge' }, [
    el('span', { class: 'charge-label', text: `⚔ ${t('enemyCharge')}` }),
    el('div', { class: 'charge-track' }, [refs.chargeFill]),
  ]);

  // The power chip is permanent, not a toast: the rule is on for the whole
  // fight, so the player must be able to look it up at any moment.
  refs.powerChip = el('button', {
    class: 'power-chip', type: 'button',
    onclick: handlers.onPowerTap,
  }, [
    el('span', { class: 'power-name', text: `⟡ ${localized(power?.name) || '—'}` }),
    refs.powerState,
  ]);

  refs.qPrompt = el('div', { class: 'q-prompt' });
  refs.qTex = el('div', { class: 'q-tex' });
  refs.qBody = el('div', { class: 'q-body' });
  refs.feedback = el('div', { class: 'feedback', hidden: true });
  refs.action = el('button', { class: 'btn btn-primary', type: 'button', disabled: true });

  refs.attackRow = el('div', { class: 'attacks' },
    Object.values(ATTACKS).map((a) => {
      const copy = ATTACK_COPY[a.id];
      return el('button', {
        class: `attack${a.id === 'sword' ? ' is-picked' : ''}`,
        type: 'button',
        dataset: { attack: a.id },
        onclick: () => handlers.onPickAttack(a.id),
      }, [
        el('span', { class: 'attack-icon', text: copy.icon, 'aria-hidden': 'true' }),
        el('span', { class: 'attack-name', text: t(copy.name) }),
        el('span', { class: 'attack-hint', text: t(copy.hint) }),
        el('span', { class: 'attack-stat num', text: `+${a.damage} / −${a.selfDamage}` }),
      ]);
    }));

  // The guard button lives over the stage rather than in the action zone: it
  // has to be reachable by the thumb that is already on the answer tiles.
  refs.guardBtn = el('button', {
    class: 'guard-btn', type: 'button', hidden: true,
    onclick: handlers.onGuard,
  }, [
    el('span', { class: 'guard-icon', text: '🛡', 'aria-hidden': 'true' }),
    el('span', { class: 'guard-label', text: t('guard') }),
  ]);

  refs.stage = el('section', { class: 'stage', dataset: { bg: level.bg } }, [
    el('div', { class: 'stage-bg', style: `background-image:url(assets/${level.bg}.webp)` }),
    el('div', { class: 'fighter fighter-hero-slot' }, [
      heroSprite.el,
      el('div', { class: 'fighter-meta' }, [
        el('div', { class: 'fighter-name', text: localized(hero.name) }),
        el('div', { class: 'hp-bar' }, [refs.heroFill]),
        el('div', { class: 'spirit-meter' }, [refs.spiritFill]),
      ]),
    ]),
    el('div', { class: 'fighter fighter-enemy-slot' }, [
      enemySprite.el,
      el('div', { class: 'fighter-meta' }, [
        el('div', { class: 'fighter-name' }, [
          localized(foe.name),
          refs.phaseBadge,
        ]),
        el('div', { class: 'hp-bar' }, [refs.enemyFill]),
      ]),
    ]),
    refs.spiritBadge,
    refs.guardBtn,
  ]);

  refs.muteBtn = el('button', {
    class: 'icon-btn', type: 'button', 'aria-label': t('sound'),
    onclick: handlers.onMute,
  });
  refs.timerBtn = el('button', {
    class: 'icon-btn', type: 'button', 'aria-label': t('timer'), text: '⏱',
    onclick: handlers.onTimer,
  });
  // The surprise attack is the one thing in the game that asks for reflexes
  // rather than arithmetic, so it gets a switch of its own, next to the clock.
  refs.surpriseBtn = el('button', {
    class: 'icon-btn', type: 'button', 'aria-label': t('surpriseToggle'), text: '⚡',
    onclick: handlers.onSurprise,
  });

  refs.root = el('div', { class: 'screen screen-battle' }, [
    el('header', { class: 'ex-top' }, [
      el('button', {
        class: 'icon-btn', type: 'button', 'aria-label': t('toMap'), text: '✕',
        onclick: handlers.onExit,
      }),
      el('div', { class: 'track' }, [refs.track]),
      refs.timerBtn,
      refs.surpriseBtn,
      refs.muteBtn,
      el('div', { class: 'hp-mini' }, [img('heart', '', 'hp-mini-icon'), refs.heartValue]),
    ]),
    el('div', { class: 'battle-body' }, [
      refs.stage,
      refs.chargeBar,
      refs.powerChip,
      el('div', { class: 'attack-label', text: `${t('pickAttack')} · ${t('spiritHint', 3)}` }),
      refs.attackRow,
      el('section', { class: 'question' }, [refs.qPrompt, refs.qTex, refs.qBody]),
      refs.feedback,
    ]),
    el('div', { class: 'action-zone' }, [refs.action]),
  ]);

  return refs;
}
