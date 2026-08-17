// Question rendering + answer checking for the three exercise types.
// Each renderer returns the same little interface so the battle screen never
// needs to know which type it is showing.
import { localized, t } from './i18n.js';
import { texNode } from './tex.js';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** "0,6" and "0.6" are the same answer; a fifth-grader types whichever. */
const parseNumber = (raw) => {
  const cleaned = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
};

function tile(content, { latex = true } = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'tile';
  el.appendChild(latex ? texNode(content) : document.createTextNode(content));
  return el;
}

function renderMcq(q, root, onChange) {
  let picked = null;
  const order = shuffle(q.opts.map((opt, i) => ({ opt, i })));

  const bank = document.createElement('div');
  bank.className = 'tile-bank';
  order.forEach(({ opt, i }) => {
    const el = tile(localized(opt));
    el.addEventListener('click', () => {
      picked = i;
      bank.querySelectorAll('.tile').forEach((n) => n.classList.remove('is-picked'));
      el.classList.add('is-picked');
      onChange(true);
    });
    bank.appendChild(el);
  });
  root.appendChild(bank);

  return {
    check: () => ({
      correct: picked === q.correct,
      answerNode: texNode(localized(q.opts[q.correct])),
    }),
    lock: () => bank.querySelectorAll('.tile').forEach((n) => (n.disabled = true)),
  };
}

function renderNumeric(q, root, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'numeric-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.autocomplete = 'off';
  input.className = 'numeric-input';
  input.setAttribute('aria-label', t('typeAnswer'));
  input.placeholder = '…';
  input.addEventListener('input', () => onChange(input.value.trim().length > 0));

  wrap.appendChild(input);
  root.appendChild(wrap);

  return {
    check: () => {
      const value = parseNumber(input.value);
      const answer = Number(q.answer);
      return {
        correct: value !== null && Math.abs(value - answer) < 1e-6,
        answerNode: texNode(String(q.answer).replace('.', '{,}')),
      };
    },
    focus: () => input.focus(),
    lock: () => (input.disabled = true),
  };
}

function renderMatch(q, root, onChange) {
  const rights = shuffle(q.pairs.map((p, i) => ({ ...p, i })));
  const chosen = new Map();          // left index -> right index
  let activeLeft = null;

  const grid = document.createElement('div');
  grid.className = 'match-grid';

  const leftCol = document.createElement('div');
  leftCol.className = 'match-col';
  const rightCol = document.createElement('div');
  rightCol.className = 'match-col';

  const paint = () => {
    leftCol.querySelectorAll('.tile').forEach((el, i) => {
      el.classList.toggle('is-active', activeLeft === i);
      el.classList.toggle('is-paired', chosen.has(i));
      const badge = el.querySelector('.match-badge');
      const slot = chosen.has(i) ? [...chosen.keys()].indexOf(i) + 1 : null;
      badge.textContent = slot ? String(slot) : '';
      badge.hidden = !slot;
    });
    rightCol.querySelectorAll('.tile').forEach((el, i) => {
      const takenBy = [...chosen.entries()].find(([, r]) => r === i);
      el.classList.toggle('is-paired', Boolean(takenBy));
      const badge = el.querySelector('.match-badge');
      const slot = takenBy ? [...chosen.keys()].indexOf(takenBy[0]) + 1 : null;
      badge.textContent = slot ? String(slot) : '';
      badge.hidden = !slot;
    });
    onChange(chosen.size === q.pairs.length);
  };

  const withBadge = (el) => {
    const badge = document.createElement('span');
    badge.className = 'match-badge';
    badge.hidden = true;
    el.appendChild(badge);
    return el;
  };

  q.pairs.forEach((p, i) => {
    const el = withBadge(tile(localized(p.left)));
    el.addEventListener('click', () => {
      if (chosen.has(i)) chosen.delete(i);      // tap a pair again to undo it
      activeLeft = activeLeft === i ? null : i;
      paint();
    });
    leftCol.appendChild(el);
  });

  rights.forEach((p, i) => {
    const el = withBadge(tile(localized(p.right)));
    el.addEventListener('click', () => {
      const owner = [...chosen.entries()].find(([, r]) => r === i);
      if (owner) chosen.delete(owner[0]);
      if (activeLeft === null) return paint();
      chosen.set(activeLeft, i);
      activeLeft = null;
      paint();
    });
    rightCol.appendChild(el);
  });

  grid.append(leftCol, rightCol);
  root.appendChild(grid);
  paint();

  return {
    check: () => ({
      correct: [...chosen.entries()].every(([l, r]) => rights[r].i === l)
        && chosen.size === q.pairs.length,
      answerNode: null,
    }),
    lock: () => grid.querySelectorAll('.tile').forEach((n) => (n.disabled = true)),
  };
}

const RENDERERS = { mcq: renderMcq, numeric: renderNumeric, match: renderMatch };

export const promptFor = (q) => ({
  mcq: t('yourAnswer'), numeric: t('typeAnswer'), match: t('matchPairs'),
}[q.type]);

/** Render `q` into `root`; `onChange(ready)` fires when the answer becomes submittable. */
export function renderQuestion(q, root, onChange) {
  root.innerHTML = '';
  const render = RENDERERS[q.type] ?? renderMcq;
  return render(q, root, onChange);
}
