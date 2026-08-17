// Who you are. Shown once before the prologue, and reachable afterwards from
// the strip at the top of the road — a child who picked in three seconds at the
// start should be able to change their mind at any point.
import { HEROES } from '../data/campaign.js';
import { getProfile, setHero } from '../state.js';
import { el, img } from '../dom.js';
import { t, localized } from '../i18n.js';
import { setTrack } from '../music.js';

export function renderHeroSelect(root, { onDone }) {
  const current = getProfile().hero;

  const card = (hero) => el('button', {
    class: `hero-card${current === hero.id ? ' is-picked' : ''}`,
    type: 'button',
    onclick: () => { setHero(hero.id); onDone(hero); },
  }, [
    img(hero.id, localized(hero.name), 'hero-card-art'),
    el('div', { class: 'hero-card-text' }, [
      el('b', { class: 'hero-card-name', text: localized(hero.name) }),
      el('span', { class: 'hero-card-blurb', text: localized(hero.blurb) }),
      el('span', { class: 'hero-card-ult', text: `⚡ ${localized(hero.ultimate)}` }),
    ]),
  ]);

  root.replaceChildren(el('div', { class: 'screen screen-hero' }, [
    el('h1', { class: 'hero-title', text: t('chooseHero') }),
    el('div', { class: 'hero-cards' }, Object.values(HEROES).map(card)),
  ]));

  setTrack('music_story');
}
