// The road. Ten stops down a steppe track, grouped into three chapters, with
// the crystal count, the daily trial and the two side doors at the top.
//
// A locked stop still shows its herald's silhouette and epithet: knowing who is
// next is most of what makes a child want to get there.
import { LEVELS, ACTS, foeById, HEROES } from '../data/campaign.js';
import {
  isUnlocked, isCleared, starsFor, getProgress, dailyDone, dailyStreak,
  totalStars, getProfile,
} from '../state.js';
import { el, img } from '../dom.js';
import { t, localized, getLang, toggleLang } from '../i18n.js';
import { setTrack } from '../music.js';

const starRow = (n) => el('span', { class: 'stars' },
  [0, 1, 2].map((i) => el('span', {
    class: `star${i < n ? ' is-on' : ''}`, text: '★', 'aria-hidden': 'true',
  })));

function levelCard(level, index, onPlay) {
  const unlocked = isUnlocked(level.id);
  const cleared = isCleared(level.id);
  const foe = foeById(level.foe);

  return el('button', {
    class: `stop${unlocked ? '' : ' is-locked'}${cleared ? ' is-cleared' : ''}${level.boss ? ' is-boss' : ''}`,
    type: 'button',
    disabled: !unlocked,
    onclick: () => unlocked && onPlay(level),
  }, [
    el('span', { class: 'stop-index num', text: String(index + 1) }),
    el('span', { class: 'stop-art' }, [
      img(foe.art, '', 'stop-foe'),
    ]),
    el('span', { class: 'stop-text' }, [
      el('span', { class: 'stop-name', text: localized(foe.name) }),
      el('span', { class: 'stop-epithet', text: localized(foe.epithet) }),
      el('span', { class: 'stop-topic', text: localized(level.topic) }),
    ]),
    el('span', { class: 'stop-meta' }, [
      unlocked ? starRow(starsFor(level.id)) : el('span', { class: 'stop-lock', text: '🔒' }),
    ]),
  ]);
}

export function renderPath(root, { onPlay, onDaily, onShop, onReport, onHero, rerender }) {
  const progress = getProgress();
  const hero = HEROES[getProfile().hero] ?? HEROES.aibyn;

  const chapters = ACTS.map((act) => el('section', { class: 'act' }, [
    el('h2', { class: 'act-title', text: localized(act.title) }),
    el('div', { class: 'stops' },
      act.range.map((id) => {
        const level = LEVELS.find((l) => l.id === id);
        return levelCard(level, LEVELS.indexOf(level), onPlay);
      })),
  ]));

  root.replaceChildren(el('div', { class: 'screen screen-path' }, [
    el('header', { class: 'path-top' }, [
      el('div', { class: 'brand' }, [
        el('h1', { class: 'brand-title', text: t('title') }),
        el('p', { class: 'brand-sub', text: t('subtitle') }),
      ]),
      el('div', { class: 'path-counts' }, [
        el('span', { class: 'count' }, [img('gem', '', 'count-icon'), el('b', { class: 'num', text: String(progress.gems) })]),
        el('span', { class: 'count' }, [img('star', '', 'count-icon'), el('b', { class: 'num', text: String(totalStars()) })]),
        el('button', {
          class: 'icon-btn lang-btn', type: 'button', 'aria-label': t('language'),
          text: getLang() === 'kk' ? 'ҚАЗ' : 'РУС',
          onclick: () => { toggleLang(); rerender(); },
        }),
      ]),
    ]),

    el('button', {
      class: 'hero-strip', type: 'button', onclick: onHero,
    }, [
      img(hero.id, '', 'hero-strip-art'),
      el('span', { class: 'hero-strip-text' }, [
        el('b', { text: localized(hero.name) }),
        el('span', { text: localized(hero.blurb) }),
      ]),
      el('span', { class: 'hero-strip-swap', text: '⇄', 'aria-hidden': 'true' }),
    ]),

    el('div', { class: 'path-side' }, [
      el('button', {
        class: `side-card${dailyDone() ? ' is-done' : ''}`, type: 'button', onclick: onDaily,
      }, [
        el('span', { class: 'side-icon', text: '🜂', 'aria-hidden': 'true' }),
        el('span', { class: 'side-text' }, [
          el('b', { text: t('daily') }),
          el('span', {
            text: dailyDone() ? t('dailyDone') : t('dailyStreak', dailyStreak()),
          }),
        ]),
      ]),
      el('button', { class: 'side-card', type: 'button', onclick: onShop }, [
        el('span', { class: 'side-icon', text: '⚱', 'aria-hidden': 'true' }),
        el('span', { class: 'side-text' }, [el('b', { text: t('shop') })]),
      ]),
      el('button', { class: 'side-card', type: 'button', onclick: onReport }, [
        el('span', { class: 'side-icon', text: '📊', 'aria-hidden': 'true' }),
        el('span', { class: 'side-text' }, [el('b', { text: t('report') })]),
      ]),
    ]),

    ...chapters,
  ]));

  setTrack('music_story');
}
