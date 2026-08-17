// Everything the player keeps between sessions: campaign progress, crystals,
// the hero they chose, what they own, the daily streak, and per-topic accuracy
// (which is what the grown-up report is built from).
//
// localStorage for now. When accounts arrive, this module is the only thing
// that has to start talking to an API.
import { LEVELS } from './data/campaign.js';

const KEY = 'batyrnol-progress-v1';

const EMPTY = {
  cleared: {},
  gems: 0,
  bestStreak: 0,
  profile: { hero: null, skin: 'none', owned: ['none'] },
  daily: { lastDay: null, streak: 0 },
  stats: {},                       // levelId -> { correct, total }
  seen: [],                        // cutscene ids already watched
};

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      ...EMPTY, ...saved,
      profile: { ...EMPTY.profile, ...(saved.profile || {}) },
      daily: { ...EMPTY.daily, ...(saved.daily || {}) },
      stats: { ...(saved.stats || {}) },
      seen: [...(saved.seen || [])],
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

let progress = read();

const write = () => localStorage.setItem(KEY, JSON.stringify(progress));

export const getProgress = () => progress;

// ---------------------------------------------------------------- campaign

export function isUnlocked(levelId) {
  const i = LEVELS.findIndex((l) => l.id === levelId);
  if (i <= 0) return true;
  return Boolean(progress.cleared[LEVELS[i - 1].id]);
}

export const isCleared = (levelId) => Boolean(progress.cleared[levelId]);
export const starsFor = (levelId) => progress.cleared[levelId]?.stars ?? 0;

/** Stars reward accuracy, not speed — nobody should be rushed into errors. */
export function starsFromMistakes(mistakes) {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

export function recordWin(levelId, { mistakes, streak }) {
  const stars = starsFromMistakes(mistakes);
  // The daily trial runs through the same battle and result screens but is not
  // a campaign level: it must not unlock anything or pay out twice, since
  // completeDaily() already granted its crystals.
  if (!LEVELS.some((l) => l.id === levelId)) {
    progress.bestStreak = Math.max(progress.bestStreak, streak);
    write();
    return { stars, gained: 0 };
  }
  const prev = progress.cleared[levelId];
  const gained = prev ? 5 : 12 + (stars === 3 ? 6 : 0);
  progress.cleared[levelId] = {
    stars: Math.max(stars, prev?.stars ?? 0),
    mistakes: Math.min(mistakes, prev?.mistakes ?? Infinity),
  };
  progress.gems += gained;
  progress.bestStreak = Math.max(progress.bestStreak, streak);
  write();
  return { stars, gained };
}

export const nextLevel = (levelId) => {
  const i = LEVELS.findIndex((l) => l.id === levelId);
  return i >= 0 && i + 1 < LEVELS.length ? LEVELS[i + 1] : null;
};

export const allCleared = () => LEVELS.every((l) => isCleared(l.id));
export const totalStars = () => LEVELS.reduce((sum, l) => sum + starsFor(l.id), 0);

// ------------------------------------------------------- per-topic accuracy

export function recordAnswer(levelId, correct) {
  const row = progress.stats[levelId] || { correct: 0, total: 0 };
  row.total += 1;
  if (correct) row.correct += 1;
  progress.stats[levelId] = row;
  write();
}

/** Topics sorted weakest first; only topics actually attempted. */
export function topicReport() {
  return LEVELS
    .map((level) => {
      const row = progress.stats[level.id];
      if (!row || !row.total) return null;
      return {
        id: level.id,
        topic: level.topic,
        correct: row.correct,
        total: row.total,
        rate: row.correct / row.total,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rate - b.rate);
}

// -------------------------------------------------------------- cutscenes

export const hasSeen = (id) => progress.seen.includes(id);

export function markSeen(id) {
  if (progress.seen.includes(id)) return;
  progress.seen.push(id);
  write();
}

// --------------------------------------------------------- profile + shop

export const getProfile = () => progress.profile;

export function setHero(hero) {
  progress.profile.hero = hero;
  write();
}

export function equipSkin(skin) {
  if (!progress.profile.owned.includes(skin)) return false;
  progress.profile.skin = skin;
  write();
  return true;
}

export function buySkin(skin, price) {
  if (progress.profile.owned.includes(skin)) return { ok: true, already: true };
  if (progress.gems < price) return { ok: false };
  progress.gems -= price;
  progress.profile.owned.push(skin);
  progress.profile.skin = skin;
  write();
  return { ok: true };
}

// ---------------------------------------------------------- daily trial

const today = () => new Date().toISOString().slice(0, 10);

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const dailyDone = () => progress.daily.lastDay === today();
export const dailyStreak = () => progress.daily.streak;

/** Finishing today's trial extends the streak; a missed day resets it to 1. */
export function completeDaily(gems = 10) {
  if (dailyDone()) return { gained: 0, streak: progress.daily.streak };
  progress.daily.streak = progress.daily.lastDay === yesterday()
    ? progress.daily.streak + 1
    : 1;
  progress.daily.lastDay = today();
  progress.gems += gems;
  write();
  return { gained: gems, streak: progress.daily.streak };
}

export function resetProgress() {
  progress = structuredClone(EMPTY);
  write();
}

// ------------------------------------------------------------- settings

const flag = (key, fallback = true) => (localStorage.getItem(key) ?? (fallback ? 'on' : 'off')) === 'on';

export const timerEnabled = () => flag('batyrnol-timer');
export const setTimerEnabled = (on) => localStorage.setItem('batyrnol-timer', on ? 'on' : 'off');

/** The one reflex check in the game, and therefore the one that can be off. */
export const surprisesEnabled = () => flag('batyrnol-surprise');
export const setSurprisesEnabled = (on) => localStorage.setItem('batyrnol-surprise', on ? 'on' : 'off');
