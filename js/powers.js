// One rule bent per herald.
//
// Ten fights only feel like ten fights if each one has to be *played*
// differently. Each power below is a small, legible, counterable change to the
// combat maths — legible because the fight screen shows its state, counterable
// because there is always a stake or a rhythm that beats it.
//
// Pure functions over the battle object. No DOM, no timers: the view reads
// `b.powerState` to draw whatever the current rule is doing.
//
// Hooks (all optional):
//   init(b)                     once, at the start of the fight
//   beforeQuestion(b)           each question, before it is asked
//   damage(b, dmg, outcome)     -> modified damage the hero deals
//   onCorrect(b, outcome)       after a landed hit
//   onWrong(b, outcome)         after a miss
//   floor(b)                    -> lowest enemy hp a normal hit may leave
//   locksAttack(b)              -> true while the stake cannot be changed

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const POWERS = {
  // 1 — Жарты. Every second hit lands at half strength.
  halve: {
    id: 'halve',
    name: { kk: 'Бөліну', ru: 'Деление' },
    hint: {
      kk: 'Әр екінші соққың екі есе әлсіз. Күшті соққыны кезекке дәл түсір.',
      ru: 'Каждый второй твой удар вдвое слабее. Подгадай сильный удар под нужный ход.',
    },
    init: (b) => { b.powerState = { hits: 0, weakNext: false }; },
    damage: (b, dmg) => (b.powerState.weakNext ? Math.round(dmg / 2) : dmg),
    onCorrect: (b) => {
      b.powerState.hits += 1;
      b.powerState.weakNext = b.powerState.hits % 2 === 1;
    },
  },

  // 2 — Тойымсыз. Eats a third of every blow and grows on it.
  devour: {
    id: 'devour',
    name: { kk: 'Жұту', ru: 'Поглощение' },
    hint: {
      kk: 'Соққыңның үштен бірін жеп, өзін емдейді. Аз соққы — аз ас.',
      ru: 'Съедает треть твоего удара и лечится им. Меньше удар — меньше еда.',
    },
    init: (b) => { b.powerState = { eaten: 0 }; },
    onCorrect: (b, outcome) => {
      const fed = Math.round(outcome.damage / 3);
      b.enemyHp = Math.min(b.enemyMaxHp, b.enemyHp + fed);
      b.powerState.eaten += fed;
      outcome.devoured = fed;
    },
  },

  // 3 — Таразы. The pans swing: one round your blows count for half again,
  // the next for half. The indicator is on screen the whole time.
  skew: {
    id: 'skew',
    name: { kk: 'Жалған таразы', ru: 'Ложная мера' },
    hint: {
      kk: 'Таразы кезек ауады: бірде соққың күшейеді, бірде әлсірейді.',
      ru: 'Чаши качаются: то удар усиливается, то слабеет.',
    },
    init: (b) => { b.powerState = { up: true }; },
    beforeQuestion: (b) => { b.powerState.up = !b.powerState.up; },
    damage: (b, dmg) => Math.round(dmg * (b.powerState.up ? 1.5 : 0.5)),
  },

  // 4 — Жүзбасы. A percent of your maximum, every single question.
  drain: {
    id: 'drain',
    name: { kk: 'Пайыз', ru: 'Процент' },
    hint: {
      kk: 'Әр сұрақ сайын күшіңнің 3 пайызын алады. Ұзаққа созба.',
      ru: 'С каждого вопроса забирает 3% твоих сил. Не затягивай.',
    },
    init: (b) => { b.powerState = { taken: 0 }; },
    beforeQuestion: (b) => {
      const toll = Math.max(1, Math.round(b.heroMaxHp * 0.03));
      b.heroHp = Math.max(1, b.heroHp - toll);   // never the killing blow
      b.powerState.taken += toll;
      b.powerState.lastToll = toll;
    },
  },

  // 5 — Айна. Grows and shrinks. Large takes half; small takes double.
  scale: {
    id: 'scale',
    name: { kk: 'Масштаб', ru: 'Масштаб' },
    hint: {
      kk: 'Үлкейгенде соққы аз тиеді, кішірейгенде — екі есе. Сәтін күт.',
      ru: 'Когда велик — урон вдвое меньше, когда мал — вдвое больше. Жди момента.',
    },
    init: (b) => { b.powerState = { big: true, turns: 0 }; },
    beforeQuestion: (b) => {
      b.powerState.turns += 1;
      if (b.powerState.turns % 2 === 1) b.powerState.big = !b.powerState.big;
    },
    damage: (b, dmg) => Math.round(dmg * (b.powerState.big ? 0.5 : 2)),
  },

  // 6 — Қарама-Қарсы. Signs invert: a miss feeds it, and the defensive stake
  // is worth twice as much. The level that teaches negatives.
  invert: {
    id: 'invert',
    name: { kk: 'Таңба бұрау', ru: 'Смена знака' },
    hint: {
      kk: 'Қате жауап оны емдейді, қалқан екі есе қалпына келтіреді. Таңбаға қара.',
      ru: 'Неверный ответ лечит его, а щит восстанавливает вдвое. Следи за знаком.',
    },
    init: (b) => { b.powerState = { fed: 0 }; },
    onWrong: (b, outcome) => {
      const fed = Math.round(b.enemyMaxHp * 0.05);
      b.enemyHp = Math.min(b.enemyMaxHp, b.enemyHp + fed);
      b.powerState.fed += fed;
      outcome.enemyHealed = fed;
    },
    onCorrect: (b, outcome) => {
      if (outcome.attack !== 'shield' || !outcome.heal) return;
      const extra = Math.min(outcome.heal, b.heroMaxHp - b.heroHp);
      b.heroHp += extra;
      outcome.heal += extra;
    },
  },

  // 7 — Тор. Pins the stake for two questions at a time.
  pin: {
    id: 'pin',
    name: { kk: 'Тор', ru: 'Сеть' },
    hint: {
      kk: 'Таңдауың екі сұраққа құлыпталады. Алдын ала ойлан.',
      ru: 'Твой выбор запирается на два вопроса. Думай наперёд.',
    },
    init: (b) => { b.powerState = { held: 0 }; },
    beforeQuestion: (b) => {
      b.powerState.held = b.powerState.held > 0 ? b.powerState.held - 1 : 2;
      b.powerState.locked = b.powerState.held > 0;
    },
    locksAttack: (b) => Boolean(b.powerState.locked),
  },

  // 8 — Теңгерім. Symmetry: a quarter of everything you deal comes back.
  mirrorDamage: {
    id: 'mirrorDamage',
    name: { kk: 'Тепе-теңдік', ru: 'Равновесие' },
    hint: {
      kk: 'Қандай соққы берсең, төрттен бірі өзіңе қайтады. Қалқан аман сақтайды.',
      ru: 'Четверть любого твоего удара возвращается тебе. Щит бережёт.',
    },
    init: (b) => { b.powerState = { returned: 0 }; },
    onCorrect: (b, outcome) => {
      const back = Math.round(outcome.damage / 4);
      b.heroHp = Math.max(1, b.heroHp - back);   // symmetry, not execution
      b.powerState.returned += back;
      outcome.reflected = back;
    },
  },

  // 9 — Шексіз. Ordinary blows approach but never arrive; only the ultimate
  // closes the gap. The whole fight is an argument for keeping a streak.
  asymptote: {
    id: 'asymptote',
    name: { kk: 'Жақындау', ru: 'Приближение' },
    hint: {
      kk: 'Кәдімгі соққы оны бітіре алмайды — тек батыр соққысы жеткізеді.',
      ru: 'Обычный удар его не добьёт — только удар батыра.',
    },
    init: (b) => { b.powerState = { blocked: 0 }; },
    floor: (b) => (b.lastOutcomeUltimate ? 0 : 1),
  },

  // 10 — Хан Нөл. Erases a different thing each phase; the view reads
  // `erased` and simply stops drawing it.
  erase: {
    id: 'erase',
    name: { kk: 'Өшіру', ru: 'Стирание' },
    hint: {
      kk: 'Ол әр кезеңде бір нәрсені өшіреді: сағатты, жауапты, рухыңды.',
      ru: 'В каждой фазе он стирает что-то: часы, ответ, твой дух.',
    },
    init: (b) => { b.powerState = { erased: 'clock' }; },
    beforeQuestion: (b) => {
      b.powerState.erased = ['clock', 'option', 'spirit'][clamp(b.phase, 1, 3) - 1];
    },
    onCorrect: (b) => {
      // Phase three keeps eating the streak, so the ultimate has to be earned
      // in a single clean run of three.
      if (b.powerState.erased === 'spirit' && b.streak >= 2) b.streak = 0;
    },
  },
};

export const powerById = (id) => POWERS[id] ?? null;
