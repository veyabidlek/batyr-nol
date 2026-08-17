// A fighter on screen: one <img> that swaps between generated pose frames.
//
// Four frames per character (idle / windup / strike / hurt) is the difference
// between "a picture that shakes" and "somebody swinging a sabre". Frames are
// preloaded on creation so the first swing doesn't flash an empty box.

const POSES = ['idle', 'windup', 'strike', 'hurt'];

const src = (name, pose) =>
  `assets/${name}${pose === 'idle' ? '' : `_${pose}`}.webp`;

export function createSprite(name, { alt = '', className = '' } = {}) {
  const img = document.createElement('img');
  img.className = `fighter-art ${className}`.trim();
  img.alt = alt;
  img.decoding = 'async';
  img.src = src(name, 'idle');

  // Warm the cache; a frame that fails to load simply never gets used, so a
  // character with no generated poses still plays as a (static) fighter.
  const available = new Set(['idle']);
  for (const pose of POSES.slice(1)) {
    const probe = document.createElement('img');
    probe.addEventListener('load', () => available.add(pose));
    probe.src = src(name, pose);
  }

  let holdTimer = null;

  /** Show a pose, optionally snapping back to idle after `ms`. */
  function setPose(pose, ms = 0) {
    clearTimeout(holdTimer);
    const usable = available.has(pose) ? pose : 'idle';
    img.src = src(name, usable);
    if (ms) holdTimer = setTimeout(() => { img.src = src(name, 'idle'); }, ms);
  }

  return {
    el: img,
    setPose,
    idle: () => setPose('idle'),
    dispose: () => clearTimeout(holdTimer),
  };
}
