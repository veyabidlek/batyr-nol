// Headless smoke test: boot the game in jsdom, play a whole fight, and assert
// the screens actually render. This catches the runtime errors a syntax check
// cannot — and, more usefully, it validates every question in the game,
// hand-written and generated, against the rules the renderers assume.
//
//     npm test
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = pathToFileURL(join(ROOT, 'js')).href + '/';

const dom = new JSDOM(readFileSync(join(ROOT, 'index.html'), 'utf8'), {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
// Node 22 defines a read-only global `navigator`, so i18n's language sniff has
// to be pointed at jsdom's copy rather than assigned over it.
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator, configurable: true,
});
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
// NOT `globalThis.performance = dom.window.performance` — jsdom's clock reads
// the global one, so aliasing them makes performance.now() recurse forever.

// jsdom ships none of these; browsers do.
dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.scrollTo = () => {};
dom.window.Audio = class {
  constructor() { this.volume = 0; this.paused = true; }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
};
globalThis.Audio = dom.window.Audio;
dom.window.HTMLCanvasElement.prototype.getContext = () => null;
dom.window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
dom.window.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame;
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The enemy clock and the guard window are tested at model level below; left on
// they would fire mid-assertion and make the screen test flaky.
localStorage.setItem('batyrnol-timer', 'off');
localStorage.setItem('batyrnol-surprise', 'off');
localStorage.setItem('batyrnol-muted', '1');

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };

const { renderPath } = await import(APP + 'screens/path.js');
const { renderBattle } = await import(APP + 'screens/battle.js');
const { renderResult } = await import(APP + 'screens/result.js');
const { renderCutscene } = await import(APP + 'screens/cutscene.js');
const { renderShop } = await import(APP + 'screens/shop.js');
const { renderReport } = await import(APP + 'screens/report.js');
const { renderHeroSelect } = await import(APP + 'screens/hero-select.js');
const { LEVELS, FOES, HEROES, ACTS } = await import(APP + 'data/campaign.js');
const { PROLOGUE, EPILOGUE, LEVEL_OUTRO, LEVEL_INTRO_ART } = await import(APP + 'data/story.js');
const { POWERS } = await import(APP + 'powers.js');
const {
  ATTACKS, SPIRIT_AT, ULTIMATE_MULTIPLIER, createBattle, resolveAnswer,
  enemyStrike, surpriseStrike, beginQuestion, attackLocked,
} = await import(APP + 'battle.js');
const {
  resetProgress, isUnlocked, starsFromMistakes, setHero, getProfile, getProgress,
  buySkin, equipSkin, recordAnswer, topicReport, completeDaily, dailyDone,
} = await import(APP + 'state.js');
const { generateQuestions, dailyQuestions } = await import(APP + 'data/generate.js');

resetProgress();
setHero('aibyn');
const root = document.getElementById('app');

// ---------------------------------------------------------------- content

const seenIds = new Set();

function checkQuestion(q, where) {
  ok(q.id && !seenIds.has(q.id), `${where}: duplicate or missing id (${q.id})`);
  seenIds.add(q.id);
  ok(q.q?.kk && q.q?.ru, `${q.id}: needs a kk and a ru prompt`);
  ok(q.exp?.kk && q.exp?.ru, `${q.id}: needs a kk and a ru explanation`);
  if (q.type === 'mcq') {
    ok(Array.isArray(q.opts) && q.opts.length === 4, `${q.id}: mcq needs exactly 4 options`);
    ok(Number.isInteger(q.correct) && q.opts?.[q.correct] !== undefined, `${q.id}: bad correct index`);
    const keys = (q.opts ?? []).map((o) => JSON.stringify(o));
    ok(new Set(keys).size === keys.length, `${q.id}: duplicate options`);
  } else if (q.type === 'numeric') {
    ok(Number.isFinite(Number(q.answer)), `${q.id}: numeric answer must be a number`);
  } else if (q.type === 'match') {
    ok(q.pairs?.length >= 3, `${q.id}: match needs at least three pairs`);
    const rights = (q.pairs ?? []).map((p) => JSON.stringify(p.right));
    ok(new Set(rights).size === rights.length,
      `${q.id}: duplicate right-hand values make the matching ambiguous`);
  } else {
    fails.push(`${q.id}: unknown question type ${q.type}`);
  }
}

ok(LEVELS.length === 10, `campaign should have 10 levels, has ${LEVELS.length}`);
ok(ACTS.flatMap((a) => a.range).length === 10, 'every level belongs to exactly one act');

let written = 0;
for (const level of LEVELS) {
  ok(FOES[level.foe], `${level.id}: unknown foe ${level.foe}`);
  ok(POWERS[level.power], `${level.id}: unknown power ${level.power}`);
  ok(LEVEL_INTRO_ART[level.id], `${level.id}: no intro art`);
  ok(Array.isArray(LEVEL_OUTRO[level.id]), `${level.id}: outro must be an array of panels`);
  ok(level.questions.length >= 10, `${level.id}: needs at least 10 questions`);
  for (const q of level.questions) { written += 1; checkQuestion(q, level.id); }
}

for (const [id, foe] of Object.entries(FOES)) {
  for (const field of ['name', 'epithet', 'special', 'taunt', 'beaten']) {
    ok(foe[field]?.kk && foe[field]?.ru, `foe ${id}: ${field} needs kk and ru`);
  }
}

for (const panels of [PROLOGUE, EPILOGUE, ...Object.values(LEVEL_OUTRO)]) {
  for (const panel of panels) {
    ok(panel.art, 'every comic panel needs art');
    ok(panel.text?.kk && panel.text?.ru, `panel ${panel.art}: text needs kk and ru`);
  }
}

// ------------------------------------------------------------ path screen

renderPath(root, {
  onPlay: () => {}, onDaily: () => {}, onShop: () => {}, onReport: () => {},
  onHero: () => {}, rerender: () => {},
});
ok(root.querySelectorAll('.stop').length === 10, 'the road shows ten stops');
ok(root.querySelectorAll('.stop.is-locked').length === 9, 'only the first stop is open at the start');
ok(root.querySelectorAll('.act').length === 3, 'the road is grouped into three chapters');
ok(isUnlocked('l1') && !isUnlocked('l2'), 'unlocking follows the campaign order');

// ------------------------------------------------------- the fight screen

let ended = null;
renderBattle(root, LEVELS[0], { onExit: () => {}, onEnd: (b) => { ended = b; } });
ok(root.querySelectorAll('.attack').length === 3, 'three stakes to choose from');
ok(root.querySelector('.q-prompt')?.textContent?.length > 0, 'the question prompt rendered');
ok(root.querySelector('.tile-bank, .numeric-input, .match-grid'), 'an answer area rendered');
ok(root.querySelector('.power-chip')?.textContent?.length > 0, 'the power chip names the rule');
ok(root.querySelector('.guard-btn')?.hidden, 'the guard button starts hidden');

let guard = 0;
while (!ended && guard++ < 40) {
  const bank = root.querySelector('.tile-bank');
  const input = root.querySelector('.numeric-input');
  const grid = root.querySelector('.match-grid');
  if (bank) {
    bank.querySelector('.tile').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  } else if (input) {
    input.value = '1';
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  } else if (grid) {
    const [left, right] = [...grid.querySelectorAll('.match-col')];
    const ls = [...left.querySelectorAll('.tile')];
    const rs = [...right.querySelectorAll('.tile')];
    ls.forEach((l, i) => {
      l.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
      rs[i].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
    });
  }
  const action = root.querySelector('.action-zone .btn');
  ok(action, 'the action button exists');
  if (action.disabled) { fails.push('the action button stayed disabled after answering'); break; }
  action.click();                       // check
  await sleep(750);                     // wind-up + hitstop + commit
  ok(!root.querySelector('.feedback').hidden, 'feedback shows after checking');
  root.querySelector('.action-zone .btn').click();   // next
  await sleep(40);
}
ok(ended, 'the fight reached an end state');

// -------------------------------------------------------- the other screens

renderCutscene(root, PROLOGUE, { onDone: () => {} });
ok(root.querySelectorAll('.panel-dot').length === PROLOGUE.length, 'the reader shows a dot per panel');

renderHeroSelect(root, { onDone: () => {} });
ok(root.querySelectorAll('.hero-card').length === Object.keys(HEROES).length, 'both heroes offered');

renderShop(root, { onBack: () => {} });
ok(root.querySelectorAll('.shop-row').length >= 5, 'the treasury lists its wares');

setHero('aisulu');
ok(getProfile().hero === 'aisulu', 'the hero choice sticks');
ok(!buySkin('void', 90).ok, 'armour cannot be bought without crystals');
getProgress().gems = 100;
ok(buySkin('dusk', 30).ok && getProfile().skin === 'dusk', 'buying armour equips it');
ok(getProgress().gems === 70, `crystals should be spent, got ${getProgress().gems}`);
ok(!equipSkin('ember'), 'armour you do not own cannot be equipped');

recordAnswer('l1', true); recordAnswer('l1', false); recordAnswer('l2', true);
const report = topicReport();
ok(report.length === 2, 'the report covers attempted topics only');
ok(report[0].rate <= report[1].rate, 'the report is sorted weakest first');
renderReport(root, { onBack: () => {} });
ok(root.querySelectorAll('.topic-row').length === 2, 'the report renders a row per topic');

ok(!dailyDone(), 'the daily trial starts undone');
ok(completeDaily().streak === 1 && dailyDone(), 'finishing the trial starts a streak');
ok(completeDaily().gained === 0, 'the trial cannot be farmed twice in one day');

if (ended) {
  renderResult(root, ended, { onRetry: () => {}, onNext: () => {}, onMap: () => {} });
  ok(root.querySelector('.result-title')?.textContent?.length > 0, 'the result screen renders');
}

// ------------------------------------------------------------ combat maths

const hero = { id: 'aibyn', hp: 100, name: { kk: 'a', ru: 'a' } };
const plain = LEVELS.find((l) => l.power === 'halve');

{
  const b = createBattle({ ...plain, power: null }, hero);
  b.attack = 'spear';
  // roll above CRIT_CHANCE so the crit roll cannot make this flaky
  const r = resolveAnswer(b, { correct: true, elapsedMs: 1000, roll: 0.9 });
  ok(r.damage === ATTACKS.spear.damage + 4, `spear plus the fast bonus should be ${ATTACKS.spear.damage + 4}, got ${r.damage}`);
  ok(!r.ultimate && !r.crit, 'the first correct answer is a plain hit');

  const miss = resolveAnswer(b, { correct: false, elapsedMs: 1000, roll: 0.9 });
  ok(miss.selfDamage === ATTACKS.spear.selfDamage && b.streak === 0, 'a miss costs health and breaks the streak');
}

{
  const b = createBattle({ ...plain, power: null }, hero);
  let last = null;
  for (let i = 0; i < SPIRIT_AT; i++) last = resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.9 });
  ok(last.ultimate, `${SPIRIT_AT} in a row should fire the ultimate`);
  ok(last.damage === Math.round(ATTACKS.sword.damage * ULTIMATE_MULTIPLIER), `ultimate damage wrong: ${last.damage}`);
  ok(b.streak === 0, 'the ultimate spends the streak');
}

{
  const b = createBattle({ ...plain, power: null }, hero);
  const crit = resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.01 });
  ok(crit.crit && crit.damage === ATTACKS.sword.damage * 2, `a crit should double damage, got ${crit.damage}`);
}

// the special: telegraphed by the enemy, parried by a correct answer
{
  const b = createBattle({ ...plain, power: null, specialEvery: 2 }, hero);
  ok(!enemyStrike(b).telegraph, 'the first strike does not telegraph');
  ok(enemyStrike(b).telegraph && b.pendingSpecial, 'every second strike winds up a special');

  const parried = resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.9 });
  ok(parried.parried && b.parries === 1, 'answering correctly parries the special');
  ok(parried.damage === ATTACKS.sword.damage * 2, `a parry should double the blow, got ${parried.damage}`);
  ok(!b.pendingSpecial, 'the telegraph clears once it is resolved');
}

{
  const b = createBattle({ ...plain, power: null, specialEvery: 1, specialDamage: 30 }, hero);
  enemyStrike(b);
  const before = b.heroHp;
  const landed = resolveAnswer(b, { correct: false, elapsedMs: 1000, roll: 0.9 });
  ok(landed.specialLanded && b.heroHp === before - 30, 'failing the parry takes the special in full');
}

// the surprise attack and its guard window
{
  const b = createBattle({ ...plain, power: null, surpriseDamage: 9 }, hero);
  const before = b.heroHp;
  ok(surpriseStrike(b, { guarded: true }).guarded && b.heroHp === before, 'a blocked surprise costs nothing');
  ok(b.guards === 1, 'blocks are counted');
  ok(surpriseStrike(b, { guarded: false }).damage === 9 && b.heroHp === before - 9, 'an unblocked surprise lands');
}

// every power initialises and survives a full exchange
for (const [id, power] of Object.entries(POWERS)) {
  const level = LEVELS.find((l) => l.power === id) ?? { ...plain, power: id };
  const b = createBattle(level, hero);
  ok(b.power?.id === id, `${id}: power should be attached to the battle`);
  for (let i = 0; i < 6; i++) {
    beginQuestion(b);
    resolveAnswer(b, { correct: i % 2 === 0, elapsedMs: 5000, roll: 0.9 });
  }
  ok(b.heroHp > 0, `${id}: a half-right run should not kill the hero outright`);
  ok(b.enemyHp >= 0 && b.enemyHp <= b.enemyMaxHp, `${id}: enemy health left the bar (${b.enemyHp})`);
  ok(typeof power.name?.kk === 'string' && typeof power.hint?.ru === 'string', `${id}: power needs bilingual copy`);
}

// the powers with a rule worth asserting outright
{
  const b = createBattle(LEVELS.find((l) => l.power === 'asymptote'), hero);
  b.enemyHp = 5;
  resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.9 });
  ok(b.enemyHp === 1, 'an ordinary blow cannot finish the Endless');
  b.streak = SPIRIT_AT - 1;
  resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.9 });
  ok(b.enemyHp === 0 && b.over === 'win', 'the ultimate closes the gap');
}

{
  const b = createBattle(LEVELS.find((l) => l.power === 'pin'), hero);
  beginQuestion(b);
  ok(attackLocked(b), 'the Grid pins the stake');
}

{
  const b = createBattle(LEVELS.find((l) => l.power === 'invert'), hero);
  b.enemyHp = b.enemyMaxHp - 40;
  const before = b.enemyHp;
  resolveAnswer(b, { correct: false, elapsedMs: 1000, roll: 0.9 });
  ok(b.enemyHp > before, 'a miss feeds the Opposite');
}

// the boss walks through three phases
{
  const boss = LEVELS.find((l) => l.boss);
  const b = createBattle(boss, hero);
  ok(b.phase === 1, 'the boss starts in phase one');
  b.enemyHp = Math.floor(b.enemyMaxHp * 0.6);
  ok(resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.9 }).phaseChanged && b.phase === 2,
    'the boss turns at two thirds');
  b.enemyHp = Math.floor(b.enemyMaxHp * 0.3);
  ok(resolveAnswer(b, { correct: true, elapsedMs: 60000, roll: 0.9 }).phaseChanged && b.phase === 3,
    'the boss turns again at one third');
}

ok(starsFromMistakes(0) === 3 && starsFromMistakes(2) === 2 && starsFromMistakes(5) === 1, 'star thresholds');

// ------------------------------------------------- the generated questions
// These have to be as valid as the written ones: the same renderers draw them.

let generated = 0;
for (const level of LEVELS) {
  for (let seed = 1; seed <= 30; seed++) {
    for (const q of generateQuestions(level.id, 10, seed)) {
      generated += 1;
      ok(q.q?.kk && q.q?.ru, `${q.id}: generated prompt needs kk and ru`);
      ok(q.exp?.kk && q.exp?.ru, `${q.id}: generated explanation needs kk and ru`);
      if (q.type === 'mcq') {
        ok(q.opts.length === 4, `${q.id}: needs 4 options, got ${q.opts.length}`);
        ok(new Set(q.opts.map(String)).size === 4, `${q.id}: duplicate options ${JSON.stringify(q.opts)}`);
        ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, `${q.id}: bad correct index`);
      } else if (q.type === 'numeric') {
        ok(Number.isFinite(Number(q.answer)), `${q.id}: answer is not a number (${q.answer})`);
      }
    }
  }
}

const day = dailyQuestions(6, 20260818);
ok(day.length === 6, 'the daily trial draws six questions');
ok(JSON.stringify(day) === JSON.stringify(dailyQuestions(6, 20260818)),
  'the same day must produce the same trial for everyone');

// ------------------------------------------------------------------ report

console.log(`checked ${written} written + ${generated} generated questions`);
if (fails.length) {
  console.error(`\n✗ ${fails.length} failure(s):`);
  for (const f of fails.slice(0, 40)) console.error('  ·', f);
  process.exit(1);
}
console.log('✓ all smoke checks passed');
process.exit(0);
