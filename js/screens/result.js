// After the fight. Win or lose, the same card — what happened, what it earned,
// and the one obvious way onward.
import { starsFromMistakes, recordWin, nextLevel, isCleared } from '../state.js';
import { foeById } from '../data/campaign.js';
import { el, img } from '../dom.js';
import { t, localized } from '../i18n.js';
import { setTrack } from '../music.js';

const starRow = (n) => el('div', { class: 'stars stars-lg' },
  [0, 1, 2].map((i) => el('span', {
    class: `star${i < n ? ' is-on' : ''}`, text: '★', 'aria-hidden': 'true',
  })));

const stat = (label, value) => el('div', { class: 'stat' }, [
  el('b', { class: 'stat-value num', text: String(value) }),
  el('span', { class: 'stat-label', text: label }),
]);

export function renderResult(root, battle, { onRetry, onNext, onMap }) {
  const won = battle.over === 'win';
  const level = battle.level;
  const foe = foeById(level.foe);
  const firstWin = won && !isCleared(level.id);

  // recordWin is the only place progress is written, so it has to be called
  // exactly once per finished fight — here, not in the battle screen.
  const award = won
    ? recordWin(level.id, { mistakes: battle.mistakes, streak: battle.bestStreak })
    : { stars: 0, gained: 0 };

  const upcoming = won ? nextLevel(level.id) : null;

  const head = won
    ? [
      starRow(award.stars || starsFromMistakes(battle.mistakes)),
      el('h1', { class: 'result-title', text: t('victory') }),
      el('p', { class: 'result-line', text: localized(foe.beaten) }),
    ]
    : [
      img(foe.art, '', 'result-foe'),
      el('h1', { class: 'result-title', text: t(battle.over === 'lose' ? 'defeat' : 'outOfQuestions') }),
      el('p', { class: 'result-line', text: t('defeatHint') }),
    ];

  const actions = [];
  if (won && upcoming) {
    actions.push(el('button', {
      class: 'btn btn-primary', type: 'button', text: t('nextLevel'),
      onclick: () => onNext(upcoming),
    }));
  } else if (won) {
    actions.push(el('p', { class: 'result-line', text: t('allDone') }));
  } else {
    actions.push(el('button', {
      class: 'btn btn-primary', type: 'button', text: t('retry'), onclick: onRetry,
    }));
  }
  actions.push(el('button', {
    class: 'btn btn-ghost', type: 'button', text: t('toMap'), onclick: onMap,
  }));

  root.replaceChildren(el('div', { class: `screen screen-result ${won ? 'is-win' : 'is-lose'}` }, [
    el('div', { class: 'result-card' }, [
      ...head,
      el('div', { class: 'stats' }, [
        stat(t('mistakes'), battle.mistakes),
        stat(t('bestStreak'), battle.bestStreak),
        stat(t('parries'), battle.parries),
        stat(t('guards'), battle.guards),
      ]),
      award.gained
        ? el('div', { class: 'reward' }, [
          img('gem', '', 'reward-icon'),
          el('b', { text: t('reward', award.gained) }),
        ])
        : null,
      firstWin ? el('p', { class: 'result-line result-topic', text: localized(level.topic) }) : null,
      el('div', { class: 'result-actions' }, actions),
    ]),
  ]));

  setTrack(won ? 'music_victory' : 'music_story');
}
