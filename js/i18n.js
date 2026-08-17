// Two languages, one dictionary. Kazakh is primary — the story is Kazakh, and
// a Kazakh-medium sixth-grader is the one person who still has no game like
// this at all.
const STRINGS = {
  title: { kk: 'Батыр жолы II', ru: 'Путь батыра II' },
  subtitle: { kk: 'Нөл хан · математика 6-сынып', ru: 'Хан Ноль · математика 6 класс' },

  start: { kk: 'Бастау', ru: 'Начать' },
  fight: { kk: 'Шайқасу', ru: 'В бой' },
  check: { kk: 'Тексеру', ru: 'Проверить' },
  next: { kk: 'Әрі қарай', ru: 'Дальше' },
  retry: { kk: 'Қайта көру', ru: 'Ещё раз' },
  toMap: { kk: 'Жолға', ru: 'На карту' },
  locked: { kk: 'Жабық', ru: 'Закрыто' },
  level: { kk: 'Деңгей', ru: 'Уровень' },
  skip: { kk: 'Өткізу', ru: 'Пропустить' },
  tap: { kk: 'Жалғастыру үшін бас', ru: 'Нажми, чтобы продолжить' },

  correct: { kk: 'Дәл тиді!', ru: 'В точку!' },
  wrong: { kk: 'Дұрыс жауабы:', ru: 'Правильный ответ:' },
  yourAnswer: { kk: 'Жауабыңды таңда', ru: 'Выбери ответ' },
  typeAnswer: { kk: 'Жауабын жаз', ru: 'Впиши ответ' },
  matchPairs: { kk: 'Жұптарын тап', ru: 'Найди пары' },

  victory: { kk: 'Жеңіс!', ru: 'Победа!' },
  defeat: { kk: 'Бұл жолы болмады', ru: 'В этот раз не вышло' },
  defeatHint: {
    kk: 'Күшің таусылды. Қайта шабуылда — енді оның тәсілін білесің.',
    ru: 'Силы кончились. Нападай снова — теперь ты знаешь его приём.',
  },
  outOfQuestions: {
    kk: 'Сұрақтар бітті, ал жау әлі тұр. Дәлірек соққы керек.',
    ru: 'Вопросы кончились, а враг ещё стоит. Нужны точные удары.',
  },

  // combat
  spirit: { kk: 'Батыр рухы', ru: 'Дух батыра' },
  spiritReady: { kk: 'Рух дайын!', ru: 'Дух готов!' },
  spiritHit: { kk: 'БАТЫР СОҚҚЫСЫ!', ru: 'УДАР БАТЫРА!' },
  spiritHint: { kk: 'қатарынан {n} дұрыс жауап — күшті соққы', ru: '{n} верных подряд — мощный удар' },
  crit: { kk: 'Дәл тиді!', ru: 'Точное попадание!' },
  fast: { kk: 'Жылдам!', ru: 'Быстро!' },
  pickAttack: { kk: 'Соққыңды таңда', ru: 'Выбери удар' },
  enemyCharge: { kk: 'Жау шабуылы', ru: 'Атака врага' },
  swordName: { kk: 'Қылыш', ru: 'Сабля' },
  swordHint: { kk: 'тепе-теңдік', ru: 'равновесие' },
  spearName: { kk: 'Найза', ru: 'Копьё' },
  spearHint: { kk: 'қатты соққы, қатты қауіп', ru: 'сильный удар, большой риск' },
  shieldName: { kk: 'Қалқан', ru: 'Щит' },
  shieldHint: { kk: 'аз соққы, күш қалпына келеді', ru: 'слабый удар, восстановление сил' },
  attackLocked: { kk: 'Таңдау құлыпталған', ru: 'Выбор заперт' },

  // specials, surprises, powers
  power: { kk: 'Қабілет', ru: 'Способность' },
  telegraph: { kk: '{name} дайындалуда!', ru: '{name} готовится!' },
  telegraphHint: {
    kk: 'Келесі жауап дұрыс болса — соққыны қайтарасың.',
    ru: 'Ответь верно на следующий вопрос — и отобьёшь удар.',
  },
  parried: { kk: 'ҚАЙТАРЫЛДЫ!', ru: 'ОТБИТО!' },
  specialLanded: { kk: 'Соққы тиді!', ru: 'Удар прошёл!' },
  guard: { kk: 'ҚОРҒАН', ru: 'ЗАЩИТА' },
  guarded: { kk: 'Тойтарылды!', ru: 'Отражено!' },
  surprise: { kk: 'Күтпеген шабуыл!', ru: 'Внезапная атака!' },
  phase: { kk: '{n}-кезең', ru: 'Фаза {n}' },

  // map + progress
  road: { kk: 'Жол', ru: 'Путь' },
  gems: { kk: 'Кристалл', ru: 'Кристаллы' },
  stars: { kk: 'Жұлдыз', ru: 'Звёзды' },
  daily: { kk: 'Күнделікті сынақ', ru: 'Ежедневное испытание' },
  dailyDone: { kk: 'Бүгін орындалды', ru: 'Сегодня пройдено' },
  dailyStreak: { kk: '{n} күн қатарынан', ru: '{n} дней подряд' },
  shop: { kk: 'Қазына', ru: 'Сокровищница' },
  report: { kk: 'Есеп', ru: 'Отчёт' },
  back: { kk: 'Артқа', ru: 'Назад' },
  chooseHero: { kk: 'Кім боласың?', ru: 'Кем ты будешь?' },
  heroChosen: { kk: 'Таңдау', ru: 'Выбрать' },
  equipped: { kk: 'Киілген', ru: 'Надето' },
  equip: { kk: 'Кию', ru: 'Надеть' },
  buy: { kk: 'Сатып алу', ru: 'Купить' },
  notEnough: { kk: 'Кристалл жетпейді', ru: 'Не хватает кристаллов' },

  // result
  mistakes: { kk: 'Қате', ru: 'Ошибок' },
  bestStreak: { kk: 'Ең ұзын қатар', ru: 'Лучшая серия' },
  parries: { kk: 'Қайтарылған соққы', ru: 'Отбито ударов' },
  guards: { kk: 'Тойтарылған шабуыл', ru: 'Отражено атак' },
  reward: { kk: '+{n} кристалл', ru: '+{n} кристаллов' },
  nextLevel: { kk: 'Келесі жау', ru: 'Следующий враг' },
  allDone: { kk: 'Жол аяқталды', ru: 'Путь пройден' },

  // report screen
  reportIntro: {
    kk: 'Қай тақырып қиын екенін көрсететін кесте. Ең әлсізі жоғарыда.',
    ru: 'Таблица показывает, какие темы даются труднее. Самая слабая — сверху.',
  },
  reportEmpty: {
    kk: 'Әзірге дерек жоқ. Бір-екі шайқастан кейін осында кесте пайда болады.',
    ru: 'Пока нет данных. После пары боёв здесь появится таблица.',
  },
  accuracy: { kk: 'Дәлдік', ru: 'Точность' },
  resetProgress: { kk: 'Барлығын өшіру', ru: 'Стереть всё' },
  resetConfirm: { kk: 'Шынымен өшіресің бе?', ru: 'Точно стереть?' },

  // settings
  sound: { kk: 'Дыбыс', ru: 'Звук' },
  timer: { kk: 'Жау сағаты', ru: 'Часы врага' },
  surpriseToggle: { kk: 'Күтпеген шабуыл', ru: 'Внезапные атаки' },
  language: { kk: 'Тіл', ru: 'Язык' },
};

const LANG_KEY = 'batyrnol-lang';

const detect = () => {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'kk' || saved === 'ru') return saved;
  return (navigator.language || '').startsWith('ru') ? 'ru' : 'kk';
};

let lang = detect();

export const getLang = () => lang;

export function setLang(next) {
  lang = next === 'ru' ? 'ru' : 'kk';
  localStorage.setItem(LANG_KEY, lang);
  return lang;
}

export const toggleLang = () => setLang(lang === 'kk' ? 'ru' : 'kk');

/** Resolve a {kk, ru} bag — or pass a plain string straight through. */
export function localized(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return value[lang] ?? value.kk ?? value.ru ?? '';
}

/** Look up a key, interpolating {n} / {name} from the second argument. */
export function t(key, vars) {
  const raw = localized(STRINGS[key]) || key;
  if (vars === undefined || vars === null) return raw;
  if (typeof vars !== 'object') return raw.replace('{n}', String(vars));
  return raw.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}
