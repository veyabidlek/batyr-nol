// A rendered cutscene. Three of them: the opening, the moment the twist lands,
// and the ending.
//
// Two rules, both learned from watching children play games with cutscenes:
// it must be skippable from the first frame, and it must never be the thing
// standing between the player and the next fight if it fails to load. A video
// that 404s, refuses to decode, or is blocked from autoplaying calls `onDone`
// exactly as if it had finished.
import { el } from '../dom.js';
import { t } from '../i18n.js';
import { isMuted } from '../audio.js';
import { stopMusic } from '../music.js';

export function renderCinematic(root, src, { onDone }) {
  let finished = false;

  // Whatever happens — ended, error, stalled, skipped — this runs once.
  //
  // ⚠️ The stop is the load-bearing half. Removing a <video> from the DOM does
  // NOT stop it: a detached media element keeps playing, and these clips carry
  // their own generated score, so skipping the opening left its soundtrack
  // running underneath the fight music for the rest of the session. Clearing
  // `src` and calling load() releases the buffer as well as silencing it.
  const done = () => {
    if (finished) return;
    finished = true;
    try {
      video.pause();
      video.removeAttribute('src');
      video.load();
    } catch { /* a browser that dislikes any of that has still been paused */ }
    onDone();
  };

  const video = el('video', {
    class: 'cinematic-video',
    src,
    playsinline: true,
    autoplay: true,
    preload: 'auto',
    // Muted autoplay is the only kind a browser reliably allows without a
    // gesture, and every entry point here follows a tap anyway — so honour the
    // player's own sound switch and fall back to muted if play() is refused.
    muted: isMuted(),
    onended: done,
    onerror: done,
  });

  root.replaceChildren(el('div', { class: 'screen screen-cinematic' }, [
    el('div', { class: 'cinematic-frame' }, [video]),
    el('button', { class: 'btn btn-ghost', type: 'button', text: t('skip'), onclick: done }),
  ]));

  stopMusic();

  // `play()` returns undefined on older WebKit rather than a promise, so every
  // call here is optional-chained; an unhandled TypeError inside the opening
  // cutscene would be the worst possible place for one.
  video.play()?.catch(() => {
    // Refused with sound; try again silent, and give up gracefully if that
    // fails too rather than leaving a child staring at a still frame.
    video.muted = true;
    video.play()?.catch(done);
  });

  // A clip that never starts (no data, a proxy swallowing the range request)
  // would otherwise hold the campaign hostage.
  setTimeout(() => { if (video.readyState === 0) done(); }, 6000);
}
