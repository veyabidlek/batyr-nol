// The nine heralds and the khan.
//
// One entry per fight, and the single source of truth for three separate
// things: who the player is looking at, which rule bends during that fight, and
// which art file to load. Keeping them together is deliberate — a herald whose
// power says "halves your damage" and whose portrait shows a whole man is a bug
// you only catch by reading two files side by side.
//
// `power` names an entry in js/powers.js. `special` is the telegraphed heavy
// attack, parried by answering the next question correctly. `surprise` is the
// unannounced interrupt, blocked inside the guard window.

export const HEROES = {
  aibyn: {
    id: 'aibyn',
    name: { kk: 'Айбын', ru: 'Айбын' },
    ultimate: { kk: 'ЖЕТІ ҚЫЛЫШ', ru: 'СЕМЬ КЛИНКОВ' },
    hp: 100,
    blurb: {
      kk: 'Қобыландының немересі. Қылышы да, есебі де тез.',
      ru: 'Внук Кобыланды. И клинок, и счёт — быстрые.',
    },
  },
  aisulu: {
    id: 'aisulu',
    name: { kk: 'Айсұлу', ru: 'Айсулу' },
    ultimate: { kk: 'АЙ ДОҒАСЫ', ru: 'ЛУННАЯ ДУГА' },
    hp: 100,
    blurb: {
      kk: 'Қобыландының немересі. Садақ атқанда да есептейді.',
      ru: 'Внучка Кобыланды. Даже стреляя из лука — считает.',
    },
  },
};

export const FOES = {
  halver: {
    id: 'halver',
    art: 'foe1',
    name: { kk: 'Жарты', ru: 'Полу' },
    epithet: { kk: 'Бөлуші', ru: 'Делящий' },
    power: 'halve',
    special: { kk: 'ЕКІГЕ БӨЛУ', ru: 'РАЗРУБ НАДВОЕ' },
    surprise: { kk: 'Жарты көлеңке', ru: 'Половинная тень' },
    taunt: {
      kk: 'Бүтін нәрсе жоқ, батыр. Бәрін бөлуге болады — сені де.',
      ru: 'Целого не бывает, батыр. Всё делится — и ты тоже.',
    },
    beaten: {
      kk: 'Бөлдім… бірақ бөлінген нәрсе жоғалмайды екен ғой.',
      ru: 'Я делил… но делённое, оказывается, не исчезает.',
    },
  },
  glutton: {
    id: 'glutton',
    art: 'foe2',
    name: { kk: 'Тойымсыз', ru: 'Ненасытный' },
    epithet: { kk: 'Жеуші', ru: 'Пожиратель' },
    power: 'devour',
    special: { kk: 'ТҰТАС ЖҰТУ', ru: 'ПОГЛОЩЕНИЕ' },
    surprise: { kk: 'Ашкөз тіс', ru: 'Жадный укус' },
    taunt: {
      kk: 'Есептің бір бөлігін жеп қойдым. Қалғанымен тап.',
      ru: 'Я съел часть задачи. Найди ответ по остатку.',
    },
    beaten: {
      kk: 'Тойдым… бірінші рет тойдым.',
      ru: 'Я сыт… впервые сыт.',
    },
  },
  scales: {
    id: 'scales',
    art: 'foe3',
    name: { kk: 'Таразы', ru: 'Весы' },
    epithet: { kk: 'Қатынас иесі', ru: 'Держащий отношение' },
    power: 'skew',
    special: { kk: 'ЖАЛҒАН ТАРАЗЫ', ru: 'ЛОЖНАЯ МЕРА' },
    surprise: { kk: 'Табақ ауды', ru: 'Чаша качнулась' },
    taunt: {
      kk: 'Үшке төрт — менде бес. Қатынасты мен шешемін.',
      ru: 'Три к четырём — у меня пять. Отношение решаю я.',
    },
    beaten: {
      kk: 'Тең… нағыз теңдікті ұмытып қалыппын.',
      ru: 'Равно… я и забыл, каково настоящее равенство.',
    },
  },
  centurion: {
    id: 'centurion',
    art: 'foe4',
    name: { kk: 'Жүзбасы', ru: 'Сотник' },
    epithet: { kk: 'Пайыз алушы', ru: 'Взимающий процент' },
    power: 'drain',
    special: { kk: 'ЖҮЗ ПАЙЫЗ', ru: 'СТО ПРОЦЕНТОВ' },
    surprise: { kk: 'Салық', ru: 'Подать' },
    taunt: {
      kk: 'Әр тыныстан бір пайыз. Аз ба? Жүз тыныс күт.',
      ru: 'С каждого вдоха — процент. Мало? Подожди сто вдохов.',
    },
    beaten: {
      kk: 'Жүзден бірі… бәрін алам деп, бәрін жоғалттым.',
      ru: 'Один из ста… хотел забрать всё и потерял всё.',
    },
  },
  mirror: {
    id: 'mirror',
    art: 'foe5',
    name: { kk: 'Айна', ru: 'Зеркало' },
    epithet: { kk: 'Масштаб', ru: 'Масштаб' },
    power: 'scale',
    special: { kk: 'МЫҢ ЕСЕ', ru: 'В ТЫСЯЧУ РАЗ' },
    surprise: { kk: 'Шағылысу', ru: 'Отражение' },
    taunt: {
      kk: 'Қашықтық — менің қиялым. Бір қадам мың шақырым болсын.',
      ru: 'Расстояние — моя выдумка. Пусть шаг станет тысячей вёрст.',
    },
    beaten: {
      kk: 'Мен үлкейттім, кішірейттім… ал шындық сол қалпы қалды.',
      ru: 'Я увеличивал, уменьшал… а истина осталась прежней.',
    },
  },
  opposite: {
    id: 'opposite',
    art: 'foe6',
    name: { kk: 'Қарама-Қарсы', ru: 'Противо' },
    epithet: { kk: 'Таңба бұрушы', ru: 'Меняющий знак' },
    power: 'invert',
    special: { kk: 'ТАҢБА БҰРАУ', ru: 'СМЕНА ЗНАКА' },
    surprise: { kk: 'Теріс соққы', ru: 'Обратный удар' },
    taunt: {
      kk: 'Мен сенің дәл кері мәніңмін. Қоссаң — нөл боламыз.',
      ru: 'Я — твоё противоположное. Сложи нас — получится ноль.',
    },
    beaten: {
      kk: 'Нөл… олай болса, сен де бір күні мұны түсінесің.',
      ru: 'Ноль… значит, однажды ты поймёшь и это.',
    },
  },
  grid: {
    id: 'grid',
    art: 'foe7',
    name: { kk: 'Тор', ru: 'Сеть' },
    epithet: { kk: 'Координата', ru: 'Координата' },
    power: 'pin',
    special: { kk: 'ТӨРТ ТҰСТАН', ru: 'С ЧЕТЫРЁХ СТОРОН' },
    surprise: { kk: 'Түйін', ru: 'Узел' },
    taunt: {
      kk: 'Әр нүктенің орны бар. Сенікі — менің торымда.',
      ru: 'У каждой точки есть место. Твоё — в моей сети.',
    },
    beaten: {
      kk: 'Сен орныңды өзің таптың. Мұны ешкім істей алмаған.',
      ru: 'Ты сам нашёл свою точку. Этого не удавалось никому.',
    },
  },
  balance: {
    id: 'balance',
    art: 'foe8',
    name: { kk: 'Теңгерім', ru: 'Равновесие' },
    epithet: { kk: 'Теңдеу иесі', ru: 'Хранящий уравнение' },
    power: 'mirrorDamage',
    special: { kk: 'ЕКІ ЖАҚҚА БІРДЕЙ', ru: 'ПОРОВНУ ОБЕИМ' },
    surprise: { kk: 'Тепе-теңдік', ru: 'Баланс' },
    taunt: {
      kk: 'Бір жаққа не істесең — екінші жаққа да сол болады. Ойлан.',
      ru: 'Что сделаешь одной стороне — то и другой. Подумай.',
    },
    beaten: {
      kk: 'Ол сенің атаң, бала. Біз оны босатпақшы едік…',
      ru: 'Это твой дед, дитя. Мы хотели его освободить…',
    },
  },
  endless: {
    id: 'endless',
    art: 'foe9',
    name: { kk: 'Шексіз', ru: 'Бесконечный' },
    epithet: { kk: 'Теңсіздік', ru: 'Неравенство' },
    power: 'asymptote',
    special: { kk: 'ЖАҚЫНДАУ', ru: 'ПРИБЛИЖЕНИЕ' },
    surprise: { kk: 'Соңғы қадам', ru: 'Последний шаг' },
    taunt: {
      kk: 'Маған жетесің, бірақ жете алмайсың. Айырмашылығын білесің бе?',
      ru: 'Ты дойдёшь до меня, но не дойдёшь. Чувствуешь разницу?',
    },
    beaten: {
      kk: 'Тең емес… бірақ жақын. Кейде жеткілікті.',
      ru: 'Не равно… но близко. Иногда этого хватает.',
    },
  },
  khan: {
    id: 'khan',
    art: 'khan',
    name: { kk: 'ХАН НӨЛ', ru: 'ХАН НОЛЬ' },
    epithet: { kk: 'Өшіруші', ru: 'Стирающий' },
    power: 'erase',
    special: { kk: 'ӨШІРУ', ru: 'СТИРАНИЕ' },
    surprise: { kk: 'Бос орын', ru: 'Пустота' },
    taunt: {
      kk: 'Сен де сан екенсің. Ал мен — саннан қалған орын.',
      ru: 'И ты — число. А я — место, что осталось от числа.',
    },
    beaten: {
      kk: 'Немерем… сен мені шығардың. Қалай?',
      ru: 'Внук мой… ты вытащил меня. Как?',
    },
  },
};

export const foeById = (id) => FOES[id];
