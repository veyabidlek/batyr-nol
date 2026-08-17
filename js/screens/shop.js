// The treasury: spend crystals on a look. Nothing here changes the maths or
// the fight — a shop that sold power would turn a wrong answer into a purchase
// decision, which is the opposite of the point.
import { SKINS, skinById } from '../data/skins.js';
import { HEROES } from '../data/campaign.js';
import { getProgress, getProfile, buySkin, equipSkin } from '../state.js';
import { el, img } from '../dom.js';
import { t, localized } from '../i18n.js';

export function renderShop(root, { onBack }) {
  const draw = () => {
    const progress = getProgress();
    const profile = getProfile();
    const hero = HEROES[profile.hero] ?? HEROES.aibyn;

    const preview = img(hero.id, '', 'shop-preview');
    preview.style.filter = skinById(profile.skin).filter;

    const rows = SKINS.map((skin) => {
      const owned = profile.owned.includes(skin.id);
      const worn = profile.skin === skin.id;
      const swatch = img(hero.id, '', 'shop-swatch');
      swatch.style.filter = skin.filter;

      return el('div', { class: `shop-row${worn ? ' is-worn' : ''}` }, [
        swatch,
        el('div', { class: 'shop-text' }, [
          el('b', { text: localized(skin.name) }),
          el('span', {
            class: 'shop-price',
            text: owned ? t(worn ? 'equipped' : 'equip') : `${skin.price} ⟡`,
          }),
        ]),
        el('button', {
          class: `btn btn-small${worn ? ' is-disabled' : ''}`,
          type: 'button',
          disabled: worn,
          text: owned ? t('equip') : t('buy'),
          onclick: () => {
            if (owned) equipSkin(skin.id);
            else if (!buySkin(skin.id, skin.price).ok) return flash();
            draw();
          },
        }),
      ]);
    });

    const warning = el('p', { class: 'shop-warning', hidden: true, text: t('notEnough') });
    const flash = () => {
      warning.hidden = false;
      setTimeout(() => { warning.hidden = true; }, 1800);
    };

    root.replaceChildren(el('div', { class: 'screen screen-shop' }, [
      el('header', { class: 'sub-top' }, [
        el('button', { class: 'btn btn-ghost btn-small', type: 'button', text: `← ${t('back')}`, onclick: onBack }),
        el('h1', { class: 'sub-title', text: t('shop') }),
        el('span', { class: 'count' }, [img('gem', '', 'count-icon'), el('b', { class: 'num', text: String(progress.gems) })]),
      ]),
      el('div', { class: 'shop-stage' }, [preview]),
      warning,
      el('div', { class: 'shop-list' }, rows),
    ]));
  };

  draw();
}
