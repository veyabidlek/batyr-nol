// Generated fraction work: the four operations on ordinary fractions, and the
// two part-whole questions.
//
// Every template returns the same question shape the hand-written banks use, so
// a generated level plays identically to a written one. Distractors are the
// mistakes a child actually makes — adding the denominators, forgetting to
// invert, multiplying when the question asked to divide — not random numbers.
import { int, mcq, pick } from './rng.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** LaTeX for a fraction already in lowest terms, collapsing to an integer. */
function frac(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1;
  const [a, b] = [n / g, d / g];
  return b === 1 ? String(a) : `\\frac{${a}}{${b}}`;
}

const multiply = (rng, id) => {
  const [a, b] = [int(rng, 1, 5), int(rng, 2, 9)];
  const [c, d] = [int(rng, 1, 5), int(rng, 2, 9)];
  const answer = frac(a * c, b * d);
  return {
    id, type: 'mcq',
    q: { kk: 'Көбейтіндіні тап', ru: 'Найди произведение' },
    tex: `\\frac{${a}}{${b}} \\cdot \\frac{${c}}{${d}}`,
    ...mcq(rng, answer, [frac(a * d, b * c), frac(a + c, b + d), frac(a * c, b + d)]),
    exp: {
      kk: 'Алымдарды алыммен, бөлімдерді бөліммен көбейтіп, қысқартамыз.',
      ru: 'Умножаем числитель на числитель, знаменатель на знаменатель и сокращаем.',
    },
  };
};

const divide = (rng, id) => {
  const [a, b] = [int(rng, 1, 6), int(rng, 2, 9)];
  const [c, d] = [int(rng, 1, 6), int(rng, 2, 9)];
  const answer = frac(a * d, b * c);
  return {
    id, type: 'mcq',
    q: { kk: 'Бөліндіні тап', ru: 'Найди частное' },
    tex: `\\frac{${a}}{${b}} : \\frac{${c}}{${d}}`,
    ...mcq(rng, answer, [frac(a * c, b * d), frac(b * c, a * d), frac(a, b * c)]),
    exp: {
      kk: 'Бөлу — кері бөлшекке көбейту.',
      ru: 'Деление — это умножение на обратную дробь.',
    },
  };
};

const ofNumber = (rng, id) => {
  const d = pick(rng, [3, 4, 5, 6, 8]);
  const n = int(rng, 1, d - 1);
  const whole = d * int(rng, 3, 14);
  const answer = (whole / d) * n;
  return {
    id, type: 'numeric',
    q: {
      kk: `${whole} санының ${n}/${d} бөлігін тап`,
      ru: `Найди ${n}/${d} от числа ${whole}`,
    },
    tex: `${whole} \\cdot \\frac{${n}}{${d}}`,
    answer,
    exp: {
      kk: `Санды бөлімге бөліп, алымға көбейтеміз: ${whole}:${d} = ${whole / d}, ${whole / d}·${n} = ${answer}.`,
      ru: `Делим число на знаменатель и умножаем на числитель: ${whole}:${d} = ${whole / d}, ${whole / d}·${n} = ${answer}.`,
    },
  };
};

const byPart = (rng, id) => {
  const d = pick(rng, [3, 4, 5, 6, 8]);
  const n = int(rng, 1, d - 1);
  const unit = int(rng, 3, 15);
  const part = unit * n;
  const answer = unit * d;
  return {
    id, type: 'numeric',
    q: {
      kk: `Санның ${n}/${d} бөлігі ${part}-ге тең. Сол санды тап.`,
      ru: `${n}/${d} числа равны ${part}. Найди это число.`,
    },
    answer,
    exp: {
      kk: `Бөлігі бойынша бүтінді бөлу арқылы табамыз: ${part} : ${n}/${d} = ${answer}.`,
      ru: `Целое по его части находим делением: ${part} : ${n}/${d} = ${answer}.`,
    },
  };
};

const addSub = (rng, id) => {
  const d = pick(rng, [4, 6, 8, 10, 12]);
  const [a, b] = [int(rng, 1, d - 2), int(rng, 1, d - 2)];
  const plus = rng() < 0.5;
  const value = plus ? a + b : Math.abs(a - b);
  return {
    id, type: 'mcq',
    q: { kk: 'Есепте', ru: 'Вычисли' },
    tex: `\\frac{${Math.max(a, b)}}{${d}} ${plus ? '+' : '-'} \\frac{${Math.min(a, b)}}{${d}}`,
    ...mcq(rng, frac(value, d), [frac(value, d * 2), frac(a * b, d), frac(value + 1, d)]),
    exp: {
      kk: 'Бөлімдері бірдей болғандықтан алымдармен ғана амал жасаймыз.',
      ru: 'Знаменатели одинаковы, поэтому действие выполняем только с числителями.',
    },
  };
};

const reciprocal = (rng, id) => {
  const [a, b] = [int(rng, 2, 9), int(rng, 2, 9)];
  return {
    id, type: 'mcq',
    q: { kk: 'Бұл санға кері санды тап', ru: 'Найди число, обратное данному' },
    tex: `\\frac{${a}}{${b}}`,
    ...mcq(rng, frac(b, a), [`-\\frac{${a}}{${b}}`, frac(a, b), frac(1, a * b)]),
    exp: {
      kk: 'Кері санда алым мен бөлім орын ауыстырады, көбейтіндісі 1 болады.',
      ru: 'У обратного числа числитель и знаменатель меняются местами, произведение равно 1.',
    },
  };
};

export default [multiply, divide, ofNumber, byPart, addSub, reciprocal];
