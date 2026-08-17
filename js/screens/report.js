// The grown-up screen: which topics are actually weak, weakest first.
//
// It is deliberately plain and deliberately not gamified. A parent opening this
// wants one thing — where does my child need help — and every star, badge or
// encouraging animation put between them and that answer is noise.
import { topicReport, getProgress, resetProgress, dailyStreak } from '../state.js';
import { el } from '../dom.js';
import { t, localized } from '../i18n.js';

const pctText = (rate) => `${Math.round(rate * 100)}%`;

function row(entry) {
  const level = Math.round(entry.rate * 100);
  const tone = level >= 80 ? 'is-good' : level >= 55 ? 'is-mid' : 'is-weak';
  return el('div', { class: `topic-row ${tone}` }, [
    el('div', { class: 'topic-head' }, [
      el('b', { class: 'topic-name', text: localized(entry.topic) }),
      el('span', { class: 'topic-rate num', text: pctText(entry.rate) }),
    ]),
    el('div', { class: 'topic-bar' }, [
      el('span', { class: 'topic-fill', style: `width:${level}%` }),
    ]),
    el('span', {
      class: 'topic-count num',
      text: `${entry.correct} / ${entry.total}`,
    }),
  ]);
}

export function renderReport(root, { onBack }) {
  const rows = topicReport();
  const progress = getProgress();

  const body = rows.length
    ? [
      el('p', { class: 'sub-intro', text: t('reportIntro') }),
      el('div', { class: 'topic-list' }, rows.map(row)),
    ]
    : [el('p', { class: 'sub-intro', text: t('reportEmpty') })];

  root.replaceChildren(el('div', { class: 'screen screen-report' }, [
    el('header', { class: 'sub-top' }, [
      el('button', { class: 'btn btn-ghost btn-small', type: 'button', text: `← ${t('back')}`, onclick: onBack }),
      el('h1', { class: 'sub-title', text: t('report') }),
      el('span'),
    ]),
    ...body,
    el('div', { class: 'report-foot' }, [
      el('span', { class: 'report-streak', text: t('dailyStreak', dailyStreak()) }),
      el('span', { class: 'report-streak', text: `${t('bestStreak')}: ${progress.bestStreak}` }),
      // Two taps to wipe everything: the first arms the button and relabels it,
      // and it disarms itself after four seconds. A confirm dialog for one
      // destructive action in the whole game is heavier than it needs to be.
      el('button', {
        class: 'btn btn-ghost btn-small', type: 'button', text: t('resetProgress'),
        onclick: (e) => {
          const btn = e.currentTarget;
          if (btn.dataset.armed !== '1') {
            btn.dataset.armed = '1';
            btn.textContent = t('resetConfirm');
            setTimeout(() => {
              btn.dataset.armed = '0';
              btn.textContent = t('resetProgress');
            }, 4000);
            return;
          }
          resetProgress();
          onBack();
        },
      }),
    ]),
  ]));
}
