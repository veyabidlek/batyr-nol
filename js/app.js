// Screen router. Screens are queued rather than called directly, because one
// tap on a stop can mean: hero choice → prologue → level intro → fight, and
// after a boss: four twist panels → epilogue → result.
import { renderPath } from './screens/path.js';
import { renderBattle } from './screens/battle.js';
import { renderResult } from './screens/result.js';
import { renderCutscene } from './screens/cutscene.js';
import { renderCinematic } from './screens/cinematic.js';
import { renderShop } from './screens/shop.js';
import { renderReport } from './screens/report.js';
import { renderHeroSelect } from './screens/hero-select.js';
import { LEVELS } from './data/campaign.js';
import { PROLOGUE, EPILOGUE, LEVEL_INTRO_ART, LEVEL_OUTRO } from './data/story.js';
import { isCleared, completeDaily, hasSeen, markSeen, getProfile } from './state.js';
import { questionsFor, dailyQuestions } from './data/generate.js';

const root = document.getElementById('app');

const toTop = () => window.scrollTo({ top: 0, behavior: 'auto' });

/** Run a list of screen-openers in order; each calls back when it is done. */
function queue(steps) {
  const next = () => {
    const step = steps.shift();
    if (step) step(next);
  };
  next();
}

const showScreen = (name, render) => {
  document.body.dataset.screen = name;
  render();
  toTop();
};

/** A cutscene that plays once ever, keyed by id. */
const cutsceneStep = (id, panels) => (done) => {
  if (!panels?.length || hasSeen(id)) return done();
  showScreen('cutscene', () => renderCutscene(root, panels, {
    onDone: () => { markSeen(id); done(); },
  }));
};

/** A rendered clip that plays once ever, keyed by id. */
const cinematicStep = (id, file) => (done) => {
  if (hasSeen(id)) return done();
  showScreen('cinematic', () => renderCinematic(root, `assets/${file}.mp4`, {
    onDone: () => { markSeen(id); done(); },
  }));
};

const heroStep = (done) => {
  if (getProfile().hero) return done();
  showScreen('hero', () => renderHeroSelect(root, { onDone: () => done() }));
};

function showPath() {
  showScreen('path', () => renderPath(root, {
    onPlay: startLevel,
    onDaily: startDaily,
    onShop: () => showScreen('shop', () => renderShop(root, { onBack: showPath })),
    onReport: () => showScreen('report', () => renderReport(root, { onBack: showPath })),
    onHero: () => showScreen('hero', () => renderHeroSelect(root, { onDone: showPath })),
    rerender: showPath,
  }));
}

/**
 * The daily trial: six generated questions from every topic, the same set for
 * everyone that calendar day, against a stand-in opponent.
 */
function startDaily() {
  const questions = dailyQuestions(6);
  const level = {
    ...LEVELS[0],
    id: 'daily',
    boss: false,
    phases: 0,
    hp: 6 * 12,                     // beatable with six clean sabre hits
    chargeMs: 42000,
    power: null,
    questions,
    title: { kk: 'Күнделікті сынақ', ru: 'Ежедневное испытание' },
    topic: { kk: 'Аралас тапсырмалар', ru: 'Смешанные задачи' },
  };
  showScreen('battle', () => renderBattle(root, level, {
    onExit: showPath,
    onEnd: (battle) => {
      if (battle.over === 'win') completeDaily();
      showScreen('result', () => renderResult(root, battle, {
        onRetry: startDaily,
        onNext: showPath,
        onMap: showPath,
      }));
    },
  }));
}

function startLevel(level) {
  const intro = LEVEL_INTRO_ART[level.id]
    ? [{ art: LEVEL_INTRO_ART[level.id], text: level.story }]
    : [];

  queue([
    heroStep,
    ...(level.id === 'l1' ? [
      cinematicStep('cinematic-intro', 'intro'),
      cutsceneStep('prologue', PROLOGUE),
    ] : []),
    cutsceneStep(`intro-${level.id}`, intro),
    // A cleared level replays with freshly generated questions, so the second
    // run is maths again rather than a memory test.
    () => showScreen('battle', () => renderBattle(root, {
      ...level,
      questions: questionsFor(level, { fresh: isCleared(level.id) }),
    }, {
      onExit: showPath,
      onEnd: endLevel,
    })),
  ]);
}

function endLevel(battle) {
  const won = battle.over === 'win';
  const firstWin = won && !isCleared(battle.level.id);
  const outro = LEVEL_OUTRO[battle.level.id];

  queue([
    ...(firstWin && outro ? [cutsceneStep(`outro-${battle.level.id}`, outro)] : []),
    // The two clips that sit inside the story rather than around it: the twist
    // plays after the Balance's four panels have set it up, and the ending
    // plays between the khan's two panels and the epilogue.
    ...(firstWin && battle.level.id === 'l8' ? [cinematicStep('cinematic-twist', 'twist')] : []),
    ...(firstWin && battle.level.boss ? [
      cinematicStep('cinematic-victory', 'victory'),
      cutsceneStep('epilogue', EPILOGUE),
    ] : []),
    () => showScreen('result', () => renderResult(root, battle, {
      onRetry: () => startLevel(battle.level),
      onNext: (level) => startLevel(level),
      onMap: showPath,
    })),
  ]);
}

// The hero choice comes before anything else on a fresh device: the road shows
// the chosen hero in its top strip, so an empty profile there would render a
// blank card.
queue([heroStep, () => showPath()]);
