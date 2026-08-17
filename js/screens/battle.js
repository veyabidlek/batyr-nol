// The fight: state from battle.js, DOM from battle-hud.js, choreography from
// hit-sequence.js. What lives here is everything with a clock attached —
// the herald's charge meter, the surprise-attack window, and the order the
// beats play in.
import {
  GUARD_WINDOW_MS, createBattle, currentQuestion, resolveAnswer,
  advance, enemyStrike, spiritCharge, ultimateReady, attackLocked, erased,
  beginQuestion, rollSurprise, surpriseStrike,
} from '../battle.js';
import { foeById, HEROES } from '../data/campaign.js';
import { KHAN_PHASES } from '../data/story.js';
import { powerById } from '../powers.js';
import { renderQuestion } from '../questions.js';
import { t, localized } from '../i18n.js';
import { el, pct, prefersReducedMotion } from '../dom.js';
import { tex } from '../tex.js';
import * as fx from '../fx.js';
import { attachFx } from '../fx.js';
import { createSprite } from '../sprite.js';
import { sfx, isMuted, toggleMute } from '../audio.js';
import { setTrack, refresh as refreshMusic } from '../music.js';
import {
  getProfile, recordAnswer, timerEnabled, setTimerEnabled, surprisesEnabled,
  setSurprisesEnabled,
} from '../state.js';
import { buildHud } from './battle-hud.js';
import { feedbackContent, powerStateLabel } from './battle-feedback.js';
import {
  playHit, playHurt, playEnemyStrike, playFinisher, playTelegraph,
  playSurprise, playGuard,
} from './hit-sequence.js';

export function renderBattle(root, level, { onExit, onEnd }) {
  const profile = getProfile();
  const hero = HEROES[profile.hero] ?? HEROES.aibyn;
  const foe = foeById(level.foe);
  const power = powerById(level.power);
  const battle = createBattle(level, hero);

  const enemySprite = createSprite(foe.art, {
    alt: localized(foe.name), className: 'fighter-art-enemy',
  });
  const heroSprite = createSprite(hero.id, {
    alt: localized(hero.name), className: 'fighter-art-hero',
  });

  // ------------------------------------------------------------ lifecycle
  let detachFx = null;
  let rafId = null;
  let chargeElapsed = 0;
  let lastFrame = 0;
  let clockRunning = false;
  let busy = false;
  let askedAt = 0;
  let handle = null;
  let alive = true;
  let surpriseTimer = null;
  let guardTimer = null;
  let clearWarning = null;

  const hud = buildHud({
    level, foe, hero, power, heroSprite, enemySprite,
    handlers: {
      onExit: () => { teardown(); onExit(); },
      onPickAttack: pickAttack,
      onPowerTap: showPowerHint,
      onGuard: () => resolveGuard(true),
      onMute: (e) => {
        e.currentTarget.textContent = toggleMute() ? '🔇' : '🔊';
        refreshMusic();
      },
      onSurprise: (e) => {
        const next = !surprisesEnabled();
        setSurprisesEnabled(next);
        e.currentTarget.classList.toggle('is-on', next);
        if (next) armSurprise(); else cancelSurprise();
      },
      onTimer: (e) => {
        const next = !timerEnabled();
        setTimerEnabled(next);
        e.currentTarget.classList.toggle('is-on', next);
        hud.chargeBar.hidden = !next;
        resetClock();
        if (next) startClock(); else stopClock();
      },
    },
  });

  hud.muteBtn.textContent = isMuted() ? '🔇' : '🔊';
  hud.timerBtn.classList.toggle('is-on', timerEnabled());
  hud.surpriseBtn.classList.toggle('is-on', surprisesEnabled());
  hud.chargeBar.hidden = !timerEnabled();

  // ---------------------------------------------------------------- clock
  function stopClock() { clockRunning = false; }

  function startClock() {
    if (!timerEnabled() || battle.over) return;
    clockRunning = true;
    lastFrame = performance.now();
    if (!rafId) rafId = requestAnimationFrame(tickClock);
  }

  function resetClock() { chargeElapsed = 0; hud.chargeFill.style.width = '0%'; }

  function tickClock(now) {
    rafId = null;
    if (!alive) return;
    const dt = now - lastFrame;
    lastFrame = now;
    if (clockRunning && !busy) {
      chargeElapsed += dt;
      const ratio = Math.min(1, chargeElapsed / battle.chargeMs);
      hud.chargeFill.style.width = `${ratio * 100}%`;
      hud.chargeFill.classList.toggle('is-imminent', ratio > 0.75);
      if (ratio >= 1) {
        chargeElapsed = 0;
        void enemyTurn();
      }
    }
    rafId = requestAnimationFrame(tickClock);
  }

  // ------------------------------------------------------------ the enemy
  async function enemyTurn() {
    if (busy || battle.over || !alive) return;
    busy = true;
    stopClock();
    cancelSurprise();
    const { damage, telegraph } = enemyStrike(battle);
    await playEnemyStrike({
      stage: hud.stage,
      enemy: enemySprite,
      hero: heroSprite,
      // The screen can be closed mid-animation; a strike that lands after that
      // must not keep mutating a view the player has already left.
      commit: () => {
        if (!alive) return;
        paint();
        floatNumber(heroSprite.el.parentElement, `−${damage}`, 'damage');
      },
    });
    if (alive && telegraph && !battle.over) await announceTelegraph();
    busy = false;
    if (!alive) return;
    if (battle.over) return finish();
    resetClock();
    startClock();
    armSurprise();
  }

  async function announceTelegraph() {
    await playTelegraph({ stage: hud.stage, enemy: enemySprite });
    if (!alive) return;
    clearWarning?.();
    clearWarning = fx.warningBand(hud.stage, `⚠ ${t('telegraph', { name: localized(foe.special) })}`);
    hud.stage.classList.add('is-telegraph');
    showBanner(t('telegraphHint'));
  }

  function clearTelegraph() {
    clearWarning?.();
    clearWarning = null;
    hud.stage.classList.remove('is-telegraph');
  }

  // -------------------------------------------------- the surprise attack
  function cancelSurprise() {
    clearTimeout(surpriseTimer);
    clearTimeout(guardTimer);
    surpriseTimer = null;
    guardTimer = null;
    hud.guardBtn.hidden = true;
    hud.guardBtn.classList.remove('is-open');
  }

  function armSurprise() {
    cancelSurprise();
    const plan = rollSurprise(battle, { enabled: surprisesEnabled() });
    if (!plan) return;
    surpriseTimer = setTimeout(openGuardWindow, plan.atMs);
  }

  function openGuardWindow() {
    if (!alive || busy || battle.over) return;
    sfx.alert();
    enemySprite.setPose('windup', GUARD_WINDOW_MS);
    hud.guardBtn.hidden = false;
    // Two frames later so the entrance animation actually plays.
    requestAnimationFrame(() => hud.guardBtn.classList.add('is-open'));
    guardTimer = setTimeout(() => resolveGuard(false), GUARD_WINDOW_MS);
  }

  async function resolveGuard(guarded) {
    if (!alive || hud.guardBtn.hidden) return;
    clearTimeout(guardTimer);
    hud.guardBtn.hidden = true;
    hud.guardBtn.classList.remove('is-open');
    busy = true;
    stopClock();
    const outcome = surpriseStrike(battle, { guarded });
    const play = guarded ? playGuard : playSurprise;
    await play({
      stage: hud.stage,
      enemy: enemySprite,
      hero: heroSprite,
      commit: () => {
        if (!alive) return;
        paint();
        floatNumber(
          heroSprite.el.parentElement,
          guarded ? t('guarded') : `−${outcome.damage}`,
          guarded ? 'guard' : 'damage',
        );
      },
    });
    busy = false;
    if (!alive) return;
    if (battle.over) return finish();
    startClock();
  }

  // -------------------------------------------------------------- drawing
  function paint() {
    hud.enemyFill.style.width = pct(battle.enemyHp, battle.enemyMaxHp);
    hud.heroFill.style.width = pct(battle.heroHp, battle.heroMaxHp);
    hud.track.style.width = pct(battle.index, battle.level.questions.length);
    hud.spiritFill.style.width = `${spiritCharge(battle) * 100}%`;
    hud.spiritBadge.hidden = !ultimateReady(battle);
    hud.heartValue.textContent = String(battle.heroHp);
    hud.stage.dataset.phase = String(battle.phase);
    hud.phaseBadge.hidden = battle.phase < 2;
    hud.phaseBadge.textContent = t('phase', battle.phase);
    hud.powerState.textContent = powerStateLabel(battle, power);
    hud.attackRow.classList.toggle('is-locked', attackLocked(battle));
    // The herald creeps closer as its meter fills — the threat is visible,
    // not just numeric.
    enemySprite.el.style.setProperty(
      '--advance', `${Math.round((chargeElapsed / battle.chargeMs) * 26)}px`);
    applyErasure();
  }

  /** Khan Zero's power removes a piece of the interface, phase by phase. */
  function applyErasure() {
    const gone = erased(battle);
    hud.chargeBar.classList.toggle('is-erased', gone === 'clock');
    hud.spiritFill.parentElement.classList.toggle('is-erased', gone === 'spirit');
  }

  function floatNumber(host, text, kind) {
    if (prefersReducedMotion()) return;
    const node = el('span', { class: `float-num float-${kind}`, text });
    host.appendChild(node);
    setTimeout(() => node.remove(), 950);
  }

  function pickAttack(id) {
    if (busy || attackLocked(battle)) {
      if (attackLocked(battle)) showBanner(t('attackLocked'));
      return;
    }
    battle.attack = id;
    hud.attackRow.querySelectorAll('.attack').forEach((n) =>
      n.classList.toggle('is-picked', n.dataset.attack === id));
  }

  // A declaration, not a const arrow: buildHud() runs before this line and
  // takes the reference as a handler.
  function showPowerHint() {
    showBanner(localized(power?.hint) || '');
  }

  function showBanner(text) {
    if (!text) return;
    const node = el('div', { class: 'stage-banner', text });
    hud.stage.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function showSpeech(text) {
    const bubble = el('div', { class: 'stage-speech', text });
    hud.stage.appendChild(bubble);
    setTimeout(() => bubble.remove(), 4600);
  }

  // ------------------------------------------------------- question cycle
  function askQuestion() {
    beginQuestion(battle);
    if (battle.over) return finish();

    const q = currentQuestion(battle);
    hud.feedback.hidden = true;
    hud.feedback.className = 'feedback';
    hud.qPrompt.textContent = localized(q.q);
    hud.qTex.replaceChildren(q.tex ? tex(q.tex, { display: true }) : '');
    hud.qTex.hidden = !q.tex;

    handle = renderQuestion(q, hud.qBody, (ready) => {
      hud.action.disabled = !ready || busy;
    });
    // Phase two of the boss erases one wrong option. It only ever removes a
    // wrong one, so the question stays answerable — it is theatre, not cruelty.
    if (erased(battle) === 'option') eraseOneOption(q);

    hud.action.textContent = t('check');
    hud.action.disabled = true;
    hud.action.onclick = submit;
    askedAt = performance.now();
    handle.focus?.();
    paint();
    resetClock();
    startClock();
    armSurprise();
  }

  function eraseOneOption(q) {
    if (q.type !== 'mcq') return;
    const tiles = [...hud.qBody.querySelectorAll('.tile')];
    const wrong = tiles.filter((_, i) => i !== q.correct);
    const victim = wrong[Math.floor(Math.random() * wrong.length)];
    if (!victim) return;
    sfx.erase();
    fx.erasePuff(victim);
    setTimeout(() => { victim.disabled = true; victim.classList.add('is-gone'); }, 400);
  }

  async function submit() {
    if (busy) return;
    busy = true;
    stopClock();
    cancelSurprise();
    hud.action.disabled = true;

    const q = currentQuestion(battle);
    const wasParry = battle.pendingSpecial;
    const { correct, answerNode } = handle.check();
    handle.lock?.();
    const outcome = resolveAnswer(battle, { correct, elapsedMs: performance.now() - askedAt });
    recordAnswer(level.id, correct);
    if (wasParry) clearTelegraph();

    if (correct) {
      await playHit({
        stage: hud.stage,
        attacker: heroSprite,
        target: enemySprite,
        outcome,
        rightward: true,
        cutInArt: `${hero.id}_strike`,
        commit: () => {
          paint();
          floatNumber(enemySprite.el.parentElement,
            `−${outcome.damage}${outcome.crit ? '!' : ''}`,
            outcome.ultimate ? 'ultimate' : outcome.crit ? 'crit' : 'damage');
          if (outcome.heal) floatNumber(heroSprite.el.parentElement, `+${outcome.heal}`, 'heal');
          if (outcome.reflected) {
            floatNumber(heroSprite.el.parentElement, `−${outcome.reflected}`, 'damage');
          }
          if (outcome.devoured) {
            floatNumber(enemySprite.el.parentElement, `+${outcome.devoured}`, 'heal');
          }
        },
      });
    } else {
      await playHurt({
        hero: heroSprite,
        commit: () => {
          paint();
          floatNumber(heroSprite.el.parentElement, `−${outcome.selfDamage}`, 'damage');
          if (outcome.enemyHealed) {
            floatNumber(enemySprite.el.parentElement, `+${outcome.enemyHealed}`, 'heal');
          }
        },
      });
    }

    if (outcome.phaseChanged) {
      fx.screenFlash('white');
      showBanner(t('phase', battle.phase));
      const line = KHAN_PHASES[battle.phase];
      if (line) showSpeech(localized(line));
    }

    showFeedback(q, correct, answerNode, outcome);
    busy = false;

    hud.action.textContent = t('next');
    hud.action.disabled = false;
    hud.action.onclick = async () => {
      if (battle.over) return finish();
      advance(battle);
      // With the clock switched off the herald would never act, and a fight
      // with no incoming blows has no telegraphs and therefore no parries —
      // the centrepiece of every fight would vanish for exactly the children
      // who turned the clock off. So it takes its turn on a question cadence
      // instead, between one question and the next.
      if (!timerEnabled() && battle.index > 0 && battle.index % 3 === 0) {
        await enemyTurn();
        if (!alive || battle.over) return;
      }
      askQuestion();
    };
  }

  function showFeedback(q, correct, answerNode, outcome) {
    hud.feedback.className = `feedback ${correct ? 'is-correct' : 'is-wrong'}`;
    hud.feedback.replaceChildren(...feedbackContent({ q, correct, answerNode, outcome }));
    hud.feedback.hidden = false;
    hud.feedback.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  async function finish() {
    stopClock();
    cancelSurprise();
    clearTelegraph();
    if (battle.over === 'win') {
      showSpeech(localized(foe.beaten));
      await playFinisher(hud.stage);
    } else {
      sfx.lose();
    }
    teardown();
    onEnd(battle);
  }

  function teardown() {
    alive = false;
    clockRunning = false;
    cancelSurprise();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    detachFx?.();
    heroSprite.dispose();
    enemySprite.dispose();
  }

  root.replaceChildren(hud.root);
  detachFx = attachFx(hud.stage);
  setTrack(level.boss ? 'music_boss' : 'music_battle');
  askQuestion();
  showSpeech(localized(foe.taunt));
  showBanner(`⟡ ${localized(power?.name)}: ${localized(power?.hint)}`);
}

