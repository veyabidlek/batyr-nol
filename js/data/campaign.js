// The campaign: ten fights in order, and the two people the player can be.
//
// A level is a small contract between three files — this list gives the order,
// `foes.js` gives the character, `powers.js` gives the rule that bends. The
// level object itself owns only the numbers (health, timings) and the questions.
import level1 from './level1.js';
import level2 from './level2.js';
import level3 from './level3.js';
import level4 from './level4.js';
import level5 from './level5.js';
import level6 from './level6.js';
import level7 from './level7.js';
import level8 from './level8.js';
import level9 from './level9.js';
import level10 from './level10.js';

export { HEROES, FOES, foeById } from './foes.js';

export const LEVELS = [
  level1, level2, level3, level4, level5,
  level6, level7, level8, level9, level10,
];

export const levelById = (id) => LEVELS.find((l) => l.id === id);
export const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id);

/** The three acts, used by the map to group the road into chapters. */
export const ACTS = [
  {
    id: 'act1',
    range: ['l1', 'l2', 'l3'],
    title: { kk: 'І тарау · Шеп', ru: 'Глава I · Рубеж' },
  },
  {
    id: 'act2',
    range: ['l4', 'l5', 'l6', 'l7'],
    title: { kk: 'ІІ тарау · Ізденіс', ru: 'Глава II · Поиск' },
  },
  {
    id: 'act3',
    range: ['l8', 'l9', 'l10'],
    title: { kk: 'ІІІ тарау · Шындық', ru: 'Глава III · Истина' },
  },
];

export const actOf = (levelId) => ACTS.find((a) => a.range.includes(levelId));
