// Generated rational-number, equation and inequality work.
//
// Every equation is built backwards from a whole-number root, so a generated
// fight never asks a sixth-grader for x = 17/3.
import { int, mcq, pick } from './rng.js';

const sign = (rng) => (rng() < 0.5 ? -1 : 1);
const paren = (v) => (v < 0 ? `(${v})` : String(v));

// ---------------------------------------------------------------- rationals

const addSigned = (rng, id) => {
  const a = int(rng, 1, 20) * sign(rng);
  const b = int(rng, 1, 20) * sign(rng);
  const answer = a + b;
  return {
    id, type: 'numeric',
    q: { kk: 'Есепте', ru: 'Вычисли' },
    tex: `${a} + ${paren(b)}`,
    answer,
    exp: {
      kk: 'Таңбалары бірдей болса модульдерін қосамыз, әртүрлі болса азайтамыз да, үлкен модульдің таңбасын аламыз.',
      ru: 'При одинаковых знаках складываем модули, при разных — вычитаем и берём знак большего модуля.',
    },
  };
};

const subSigned = (rng, id) => {
  const a = int(rng, 1, 20) * sign(rng);
  const b = int(rng, 1, 20) * sign(rng);
  const answer = a - b;
  return {
    id, type: 'mcq',
    q: { kk: 'Есепте', ru: 'Вычисли' },
    tex: `${a} - ${paren(b)}`,
    ...mcq(rng, String(answer), [String(a + b), String(b - a), String(-a - b)]),
    exp: {
      kk: 'Азайту — қарама-қарсы санды қосу.',
      ru: 'Вычитание — прибавление противоположного числа.',
    },
  };
};

const mulSigned = (rng, id) => {
  const a = int(rng, 2, 12) * sign(rng);
  const b = int(rng, 2, 9) * sign(rng);
  const answer = a * b;
  return {
    id, type: 'numeric',
    q: { kk: 'Есепте', ru: 'Вычисли' },
    tex: `${paren(a)} \\cdot ${paren(b)}`,
    answer,
    exp: {
      kk: 'Таңбалары бірдей болса көбейтінді оң, әртүрлі болса теріс.',
      ru: 'При одинаковых знаках произведение положительно, при разных — отрицательно.',
    },
  };
};

const modulus = (rng, id) => {
  const a = int(rng, 1, 20) * -1;
  const b = int(rng, 1, 20);
  const answer = Math.abs(a) + Math.abs(b);
  return {
    id, type: 'mcq',
    q: { kk: 'Модульді есепте', ru: 'Вычисли модуль' },
    tex: `|${a}| + |${b}|`,
    ...mcq(rng, String(answer), [String(a + b), String(-answer), String(Math.abs(a + b))]),
    exp: {
      kk: 'Модуль — таңбасыз қашықтық, ол ешқашан теріс болмайды.',
      ru: 'Модуль — это расстояние без знака, он никогда не бывает отрицательным.',
    },
  };
};

const opposite = (rng, id) => {
  const a = int(rng, 2, 40) * sign(rng);
  return {
    id, type: 'mcq',
    q: {
      kk: `Қандай санды ${a}-ге қосқанда нөл шығады?`,
      ru: `Какое число нужно прибавить к ${a}, чтобы получить ноль?`,
    },
    ...mcq(rng, String(-a), [String(a), '0', String(2 * a)]),
    exp: {
      kk: 'Қарама-қарсы сандардың қосындысы әрқашан нөлге тең.',
      ru: 'Сумма противоположных чисел всегда равна нулю.',
    },
  };
};

// ---------------------------------------------------------------- equations

const linear = (rng, id) => {
  const root = int(rng, -9, 12);
  const k = int(rng, 2, 9);
  const b = int(rng, -20, 20);
  const rhs = k * root + b;
  return {
    id, type: 'numeric',
    q: { kk: 'Теңдеуді шеш', ru: 'Реши уравнение' },
    tex: `${k}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${rhs}`,
    answer: root,
    exp: {
      kk: `Алдымен ${Math.abs(b)} санын екі жақтан ${b < 0 ? 'қосамыз' : 'азайтамыз'}, сосын ${k}-ға бөлеміз.`,
      ru: `Сначала ${b < 0 ? 'прибавляем' : 'вычитаем'} ${Math.abs(b)} к обеим частям, затем делим на ${k}.`,
    },
  };
};

const bothSides = (rng, id) => {
  const root = int(rng, -8, 12);
  const [k1, k2] = [int(rng, 3, 9), int(rng, 1, 2)];
  const b1 = int(rng, -12, 12);
  const b2 = (k1 - k2) * root + b1;
  return {
    id, type: 'numeric',
    q: { kk: 'Теңдеуді шеш', ru: 'Реши уравнение' },
    tex: `${k1}x ${b1 < 0 ? '-' : '+'} ${Math.abs(b1)} = ${k2}x ${b2 < 0 ? '-' : '+'} ${Math.abs(b2)}`,
    answer: root,
    exp: {
      kk: 'Белгісізі бар мүшелерді бір жаққа, сандарды екінші жаққа жинаймыз.',
      ru: 'Собираем слагаемые с неизвестным в одной части, числа — в другой.',
    },
  };
};

const bracket = (rng, id) => {
  const root = int(rng, -6, 12);
  const k = int(rng, 2, 6);
  const b = int(rng, -9, 9);
  const rhs = k * (root + b);
  return {
    id, type: 'numeric',
    q: { kk: 'Теңдеуді шеш', ru: 'Реши уравнение' },
    tex: `${k}(x ${b < 0 ? '-' : '+'} ${Math.abs(b)}) = ${rhs}`,
    answer: root,
    exp: {
      kk: `Екі жағын ${k}-ға бөлсең, жақша ашылмай-ақ шешіледі.`,
      ru: `Если разделить обе части на ${k}, скобку раскрывать не придётся.`,
    },
  };
};

// -------------------------------------------------------------- inequalities

const inequality = (rng, id) => {
  const k = int(rng, 2, 6) * sign(rng);
  const bound = int(rng, -8, 8);
  const rhs = k * bound;
  const strict = rng() < 0.5;
  // Dividing by a negative turns the sign round — the whole point of the level.
  const shown = strict ? '>' : '\\geq';
  const flipped = k < 0 ? (strict ? '<' : '\\leq') : shown;
  const answer = `x ${flipped} ${bound}`;
  return {
    id, type: 'mcq',
    q: { kk: 'Теңсіздікті шеш', ru: 'Реши неравенство' },
    tex: `${k}x ${shown} ${rhs}`,
    ...mcq(rng, answer, [
      `x ${shown === '>' ? '<' : '\\leq'} ${bound}`,
      `x ${shown} ${-bound}`,
      `x ${shown} ${rhs}`,
    ]),
    exp: {
      kk: 'Теріс санға бөлгенде теңсіздік таңбасы ауысады — ең жиі кездесетін қате осы.',
      ru: 'При делении на отрицательное число знак неравенства меняется — это самая частая ошибка.',
    },
  };
};

const functionValue = (rng, id) => {
  const k = int(rng, 2, 7) * sign(rng);
  const b = int(rng, -9, 9);
  const x = int(rng, -6, 8);
  const answer = k * x + b;
  return {
    id, type: 'numeric',
    q: {
      kk: `y = ${k}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} функциясының x = ${x} болғандағы мәнін тап`,
      ru: `Найди значение функции y = ${k}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} при x = ${x}`,
    },
    answer,
    exp: {
      kk: `x орнына ${x} қоямыз: ${k}·${x} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${answer}.`,
      ru: `Подставляем ${x} вместо x: ${k}·${x} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${answer}.`,
    },
  };
};

const wholeCount = (rng, id) => {
  const lo = int(rng, -9, 2);
  const hi = lo + int(rng, 3, 9);
  return {
    id, type: 'numeric',
    q: {
      kk: `${lo} < x < ${hi} теңсіздігін қанағаттандыратын бүтін сандар нешеу?`,
      ru: `Сколько целых чисел удовлетворяют неравенству ${lo} < x < ${hi}?`,
    },
    answer: hi - lo - 1,
    exp: {
      kk: 'Шеттері кірмейді, сондықтан аралықтағы бүтін сандарды санаймыз.',
      ru: 'Границы не входят, поэтому считаем целые числа строго между ними.',
    },
  };
};

export const RATIONAL_TEMPLATES = [addSigned, subSigned, mulSigned, modulus, opposite];
export const EQUATION_TEMPLATES = [linear, bothSides, bracket];
export const INEQUALITY_TEMPLATES = [inequality, functionValue, wholeCount];

export default RATIONAL_TEMPLATES;
