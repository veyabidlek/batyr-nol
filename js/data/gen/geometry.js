// Generated scale, circle and coordinate-plane work.
//
// π is 3,14 here, the way the grade-6 textbook takes it, and radii are chosen
// so the answers stay tidy.
import { int, mcq, pick } from './rng.js';

const PI = 3.14;
const round2 = (v) => Math.round(v * 100) / 100;

const circumference = (rng, id) => {
  const r = int(rng, 2, 15);
  const answer = round2(2 * PI * r);
  return {
    id, type: 'numeric',
    q: {
      kk: `Радиусы ${r} см шеңбердің ұзындығын тап (π ≈ 3,14)`,
      ru: `Найди длину окружности радиуса ${r} см (π ≈ 3,14)`,
    },
    tex: 'C = 2\\pi r',
    answer,
    exp: {
      kk: `C = 2·3,14·${r} = ${answer}.`,
      ru: `C = 2·3,14·${r} = ${answer}.`,
    },
  };
};

const circleArea = (rng, id) => {
  const r = int(rng, 2, 12);
  const answer = round2(PI * r * r);
  return {
    id, type: 'mcq',
    q: {
      kk: `Радиусы ${r} см дөңгелектің ауданын тап (π ≈ 3,14)`,
      ru: `Найди площадь круга радиуса ${r} см (π ≈ 3,14)`,
    },
    tex: 'S = \\pi r^{2}',
    ...mcq(rng, String(answer).replace('.', '{,}'), [
      String(round2(2 * PI * r)).replace('.', '{,}'),
      String(round2(PI * r)).replace('.', '{,}'),
      String(r * r),
    ]),
    exp: {
      kk: `S = 3,14·${r}² = ${answer}. Ұзындықпен шатастырма: онда радиус квадратталмайды.`,
      ru: `S = 3,14·${r}² = ${answer}. Не путай с длиной: там радиус не возводится в квадрат.`,
    },
  };
};

const scaleMap = (rng, id) => {
  const denom = pick(rng, [1000, 10000, 100000, 200000]);
  const cm = pick(rng, [2, 3, 4, 5, 6]);
  const metres = (cm * denom) / 100;
  const km = metres >= 1000;
  const answer = km ? metres / 1000 : metres;
  return {
    id, type: 'numeric',
    q: {
      kk: `Масштабы 1:${denom} картада кесінді ${cm} см. Нақты ұзындығы неше ${km ? 'километр' : 'метр'}?`,
      ru: `На карте масштаба 1:${denom} отрезок ${cm} см. Какова длина на местности в ${km ? 'километрах' : 'метрах'}?`,
    },
    answer,
    exp: {
      kk: `${cm} см · ${denom} = ${cm * denom} см = ${answer} ${km ? 'км' : 'м'}.`,
      ru: `${cm} см · ${denom} = ${cm * denom} см = ${answer} ${km ? 'км' : 'м'}.`,
    },
  };
};

const quadrant = (rng, id) => {
  const x = int(rng, 1, 9) * (rng() < 0.5 ? -1 : 1);
  const y = int(rng, 1, 9) * (rng() < 0.5 ? -1 : 1);
  const answer = x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III');
  return {
    id, type: 'mcq',
    q: {
      kk: `A(${x}; ${y}) нүктесі қай ширекте жатыр?`,
      ru: `В какой четверти лежит точка A(${x}; ${y})?`,
    },
    ...mcq(rng, answer, ['I', 'II', 'III', 'IV'].filter((q) => q !== answer)),
    exp: {
      kk: 'Ширектер сағат тіліне қарсы саналады: I(+;+), II(−;+), III(−;−), IV(+;−).',
      ru: 'Четверти считаются против часовой стрелки: I(+;+), II(−;+), III(−;−), IV(+;−).',
    },
  };
};

const symmetry = (rng, id) => {
  const x = int(rng, 1, 9) * (rng() < 0.5 ? -1 : 1);
  const y = int(rng, 1, 9) * (rng() < 0.5 ? -1 : 1);
  const about = pick(rng, ['Ox', 'Oy', 'O']);
  const target = about === 'Ox' ? [x, -y] : about === 'Oy' ? [-x, y] : [-x, -y];
  const label = ([a, b]) => `(${a}; ${b})`;
  const about_kk = { Ox: 'абсцисса осіне', Oy: 'ордината осіне', O: 'координаталар басына' }[about];
  const about_ru = { Ox: 'оси абсцисс', Oy: 'оси ординат', O: 'начала координат' }[about];
  return {
    id, type: 'mcq',
    q: {
      kk: `A(${x}; ${y}) нүктесіне ${about_kk} қарағанда симметриялы нүктені тап`,
      ru: `Найди точку, симметричную A(${x}; ${y}) относительно ${about_ru}`,
    },
    ...mcq(rng, label(target), [label([x, -y]), label([-x, y]), label([-x, -y]), label([y, x])]
      .filter((s) => s !== label(target))),
    exp: {
      kk: 'Ox осі ордината таңбасын, Oy осі абсцисса таңбасын, ал координаталар басы екеуін де ауыстырады.',
      ru: 'Ось Ox меняет знак ординаты, ось Oy — знак абсциссы, а начало координат — оба знака.',
    },
  };
};

const axisDistance = (rng, id) => {
  const y = int(rng, -6, 6);
  const [a, b] = [int(rng, -9, 0), int(rng, 1, 9)];
  return {
    id, type: 'numeric',
    q: {
      kk: `A(${a}; ${y}) және B(${b}; ${y}) нүктелерінің арақашықтығын тап`,
      ru: `Найди расстояние между точками A(${a}; ${y}) и B(${b}; ${y})`,
    },
    answer: b - a,
    exp: {
      kk: `Ординаталары бірдей, сондықтан кесінді көлденең: ${b} − (${a}) = ${b - a}.`,
      ru: `Ординаты равны, отрезок горизонтальный: ${b} − (${a}) = ${b - a}.`,
    },
  };
};

export const GEOMETRY_TEMPLATES = [circumference, circleArea, scaleMap];
export const COORD_TEMPLATES = [quadrant, symmetry, axisDistance];

export default GEOMETRY_TEMPLATES;
