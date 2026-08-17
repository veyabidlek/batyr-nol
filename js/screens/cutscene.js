// The comic reader.
//
// Panels arrive one at a time: the art slides in, then the caption types itself
// out. Tapping once finishes the current panel instantly, tapping again moves
// on — the same contract every visual novel uses, and the reason a reader never
// feels held up by an animation they have already read past.
import { el, prefersReducedMotion } from '../dom.js';
import { t, localized } from '../i18n.js';
import { setTrack } from '../music.js';
import { sfx } from '../audio.js';

const TYPE_MS = 18;

export function renderCutscene(root, panels, { onDone }) {
  let index = 0;
  let typing = null;

  const art = el('img', { class: 'panel-art', alt: '', decoding: 'async' });
  const caption = el('p', { class: 'panel-text' });
  const dots = el('div', { class: 'panel-dots' },
    panels.map(() => el('span', { class: 'panel-dot' })));

  const hint = el('div', { class: 'panel-hint', text: t('tap') });

  function stopTyping(finishText) {
    if (!typing) return;
    clearInterval(typing);
    typing = null;
    if (finishText !== undefined) caption.textContent = finishText;
    hint.hidden = false;
  }

  function show(i) {
    const panel = panels[i];
    if (!panel) return onDone();

    art.classList.remove('is-in');
    art.src = `assets/${panel.art}.webp`;
    // Force the entrance animation to replay on a panel change.
    void art.offsetWidth;
    art.classList.add('is-in');

    dots.querySelectorAll('.panel-dot').forEach((d, n) =>
      d.classList.toggle('is-on', n <= i));

    const text = localized(panel.text);
    hint.hidden = true;

    if (prefersReducedMotion()) {
      caption.textContent = text;
      hint.hidden = false;
      return;
    }

    caption.textContent = '';
    let at = 0;
    typing = setInterval(() => {
      at += 1;
      caption.textContent = text.slice(0, at);
      if (at >= text.length) stopTyping();
    }, TYPE_MS);
  }

  function advance() {
    if (typing) return stopTyping(localized(panels[index].text));
    index += 1;
    if (index >= panels.length) return onDone();
    sfx.tick();
    show(index);
  }

  const stage = el('div', {
    class: 'screen screen-cutscene', role: 'button', tabindex: '0',
    onclick: advance,
    onkeydown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
    },
  }, [
    el('div', { class: 'panel' }, [
      art,
      el('div', { class: 'panel-caption' }, [caption, hint]),
    ]),
    el('footer', { class: 'panel-foot' }, [
      dots,
      el('button', {
        class: 'btn btn-ghost', type: 'button', text: t('skip'),
        onclick: (e) => { e.stopPropagation(); stopTyping(); onDone(); },
      }),
    ]),
  ]);

  root.replaceChildren(stage);
  setTrack('music_story');
  show(0);
  stage.focus({ preventScroll: true });
}
