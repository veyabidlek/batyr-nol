// Generated ratio, proportion and percent work.
import { int, mcq, pick } from './rng.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const proportion = (rng, id) => {
  const k = int(rng, 2, 9);
  const [a, b] = [int(rng, 2, 9), int(rng, 2, 9)];
  const answer = a * k;
  return {
    id, type: 'numeric',
    q: { kk: 'Пропорцияны шеш', ru: 'Реши пропорцию' },
    tex: `\\frac{${a}}{${b}} = \\frac{x}{${b * k}}`,
    answer,
    exp: {
      kk: `Айқас көбейту: ${a}·${b * k} = ${b}·x, x = ${answer}.`,
      ru: `Крест-накрест: ${a}·${b * k} = ${b}·x, x = ${answer}.`,
    },
  };
};

const simplify = (rng, id) => {
  const g = int(rng, 2, 9);
  let [a, b] = [int(rng, 2, 9), int(rng, 2, 9)];
  while (gcd(a, b) !== 1) b = int(rng, 2, 9);
  const answer = `${a} : ${b}`;
  return {
    id, type: 'mcq',
    q: { kk: 'Қатынасты қысқарт', ru: 'Сократи отношение' },
    tex: `${a * g} : ${b * g}`,
    ...mcq(rng, answer, [`${b} : ${a}`, `${a * g} : ${b}`, `${a + 1} : ${b}`]),
    exp: {
      kk: `Екі мүшені де ${g}-ға бөлеміз.`,
      ru: `Делим оба члена на ${g}.`,
    },
  };
};

const share = (rng, id) => {
  const [p, q] = [int(rng, 1, 5), int(rng, 2, 7)];
  const unit = int(rng, 3, 20);
  const total = (p + q) * unit;
  const answer = Math.max(p, q) * unit;
  return {
    id, type: 'numeric',
    q: {
      kk: `${total} санын ${p}:${q} қатынасында бөл. Үлкен бөлігі қанша?`,
      ru: `Раздели ${total} в отношении ${p}:${q}. Чему равна большая часть?`,
    },
    answer,
    exp: {
      kk: `Барлығы ${p + q} үлес, бір үлес ${unit}. Үлкені ${Math.max(p, q)} үлес: ${answer}.`,
      ru: `Всего ${p + q} частей, одна часть ${unit}. Большая — ${Math.max(p, q)} частей: ${answer}.`,
    },
  };
};

const inverse = (rng, id) => {
  const workers = pick(rng, [2, 3, 4, 6]);
  const days = pick(rng, [6, 8, 12, 24]);
  const work = workers * days;
  const other = pick(rng, [2, 3, 4, 6].filter((w) => w !== workers && work % w === 0)) ?? 2;
  const answer = work / other;
  return {
    id, type: 'mcq',
    q: {
      kk: `${workers} шебер жұмысты ${days} күнде бітіреді. ${other} шебер қанша күнде бітіреді?`,
      ru: `${workers} мастера заканчивают работу за ${days} дней. За сколько дней справятся ${other}?`,
    },
    ...mcq(rng, String(answer), [String(days), String(work), String(Math.round(days * other / workers))]),
    exp: {
      kk: `Кері пропорционалдық: ${workers}·${days} = ${work} адам-күн, ${work}:${other} = ${answer}.`,
      ru: `Обратная пропорциональность: ${workers}·${days} = ${work} человеко-дней, ${work}:${other} = ${answer}.`,
    },
  };
};

const percentOf = (rng, id) => {
  const p = pick(rng, [5, 10, 15, 20, 25, 40, 50, 60, 75]);
  const base = int(rng, 2, 20) * 20;
  const answer = (base * p) / 100;
  return {
    id, type: 'numeric',
    q: { kk: `${base} санының ${p} пайызын тап`, ru: `Найди ${p}% от числа ${base}` },
    answer,
    exp: {
      kk: `1 пайыз = ${base / 100}. Сонда ${p} пайыз = ${answer}.`,
      ru: `1% = ${base / 100}. Значит ${p}% = ${answer}.`,
    },
  };
};

const percentBase = (rng, id) => {
  const p = pick(rng, [5, 10, 20, 25, 40, 50]);
  const answer = int(rng, 2, 20) * 20;
  const part = (answer * p) / 100;
  return {
    id, type: 'numeric',
    q: {
      kk: `Санның ${p} пайызы ${part}-ге тең. Сол сан нешеге тең?`,
      ru: `${p}% числа равны ${part}. Чему равно само число?`,
    },
    answer,
    exp: {
      kk: `${part} : 0,${String(p).padStart(2, '0')} = ${answer}.`,
      ru: `${part} : 0,${String(p).padStart(2, '0')} = ${answer}.`,
    },
  };
};

const percentChange = (rng, id) => {
  const p = pick(rng, [10, 20, 25, 50]);
  const base = int(rng, 4, 30) * 100;
  const up = rng() < 0.5;
  const answer = up ? base + (base * p) / 100 : base - (base * p) / 100;
  return {
    id, type: 'mcq',
    q: {
      kk: `Тауар ${base} теңге тұрған, бағасы ${p} пайызға ${up ? 'қымбаттады' : 'арзандады'}. Жаңа бағасы қандай?`,
      ru: `Товар стоил ${base} тенге и ${up ? 'подорожал' : 'подешевел'} на ${p}%. Какова новая цена?`,
    },
    ...mcq(rng, String(answer), [
      String(up ? base - (base * p) / 100 : base + (base * p) / 100),
      String((base * p) / 100),
      String(base),
    ]),
    exp: {
      kk: `Өзгеріс ${(base * p) / 100} теңге, жаңа баға ${answer} теңге.`,
      ru: `Изменение ${(base * p) / 100} тенге, новая цена ${answer} тенге.`,
    },
  };
};

export const RATIO_TEMPLATES = [proportion, simplify, share, inverse];
export const PERCENT_TEMPLATES = [percentOf, percentBase, percentChange];

export default RATIO_TEMPLATES;
