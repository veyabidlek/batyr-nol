// Background music: one looping track at a time, swapped per screen.
//
// Shares the single mute switch with the sound effects — a child who mutes the
// game means all of it, and two separate toggles is one toggle too many.
import { isMuted } from './audio.js';

const VOLUME = 0.32;
const FADE_MS = 400;

let current = null;      // track name
let audio = null;

function fadeOut(node) {
  const step = node.volume / (FADE_MS / 40);
  const timer = setInterval(() => {
    node.volume = Math.max(0, node.volume - step);
    if (node.volume <= 0.01) {
      clearInterval(timer);
      node.pause();
    }
  }, 40);
}

/** Play `name` on a loop; passing the same name again is a no-op. */
export function setTrack(name) {
  if (current === name) return refresh();
  current = name;

  if (audio) fadeOut(audio);
  if (!name) { audio = null; return; }

  audio = new Audio(`assets/${name}.mp3`);
  audio.loop = true;
  audio.volume = 0;
  if (isMuted()) return;

  // Autoplay is only allowed after a gesture; every entry point here follows a
  // tap, and a rejected play() is not worth surfacing to a ten-year-old.
  audio.play().then(() => {
    const step = VOLUME / (FADE_MS / 40);
    const timer = setInterval(() => {
      audio.volume = Math.min(VOLUME, audio.volume + step);
      if (audio.volume >= VOLUME - 0.01) clearInterval(timer);
    }, 40);
  }).catch(() => {});
}

/** Called after the mute button flips. */
export function refresh() {
  if (!audio) return;
  if (isMuted()) {
    audio.pause();
  } else if (audio.paused) {
    audio.volume = VOLUME;
    audio.play().catch(() => {});
  }
}

export const stopMusic = () => setTrack(null);
