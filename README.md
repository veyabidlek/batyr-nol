# БАТЫР ЖОЛЫ II — НӨЛ ХАН

A bilingual (Kazakh / Russian) grade-6 maths game, told as an anime. Ten
fights, nine heralds and a khan, and a twist that turns on one idea from the
mathematics itself.

**Play:** https://batyr-nol.pages.dev

Sequel to [Батыр жолы](https://batyr-quest.pages.dev), which is grade 5.

## What it is

The steppe is losing its numbers — a herd counted twice gives two answers, and
the stars are going out from the edge of the sky inward. You are the grandchild
of the batyr who sealed the void forty years ago, and every herald standing
between you and it has broken one law of arithmetic to become what they are.

Each fight is a maths topic with a rule bent around it. The Halver takes every
second blow at half strength. The Scales tip your damage the wrong way and back
again. The Endless cannot be finished by an ordinary hit at all — only by the
ultimate you charge with three correct answers in a row. Ten fights that have
to be *played* differently, rather than one fight ten times.

| Fight | Herald | Topic |
|---|---|---|
| 1 | Жарты — the Halver | fractions: × and ÷ |
| 2 | Тойымсыз — the Never-Full | fraction word problems |
| 3 | Таразы — the Scales | ratio and proportion |
| 4 | Жүзбасы — the Hundred-Chief | percent |
| 5 | Айна — the Mirror | scale, circle, circumference |
| 6 | Қарама-Қарсы — the Opposite | rational numbers |
| 7 | Тор — the Grid | the coordinate plane |
| 8 | Теңгерім — the Balance | linear equations |
| 9 | Шексіз — the Endless | inequalities, linear function |
| 10 | ХАН НӨЛ | everything, in three phases |

## What is new versus the first game

- **Parry.** A herald's heavy attack is telegraphed, not rolled: when the
  warning band appears, the next question *is* the counter. Get it right and
  you turn the blow aside for double damage. Every big threat in the game is
  survivable by knowing the maths.
- **Guard window.** A surprise attack can be blocked by tapping the shield
  inside 1.4 seconds. It is the only reflex check in the game and it can be
  switched off, along with the enemy clock.
- **Powers.** One bent rule per fight, shown permanently on a chip so it can be
  read at any moment rather than remembered.
- **Comic reader.** The story arrives as panels that slide in and type
  themselves out; a tap finishes the panel, a second tap moves on.
- **Two heroes**, chosen at the start and changeable at any time.

## Layout

```
index.html      entry point — no build step, no bundler, no framework
js/             game logic, plain ES modules
  battle.js       the combat model: pure state, no DOM, no timers
  powers.js       the ten bent rules
  data/           the campaign, the cast, the story, the question banks
  screens/        one file per screen
css/            tokens, then base, components, screens, effects
assets/         art, comics, backgrounds, music (generated — see tools/)
vendor/         KaTeX and the one webfont, self-hosted
tools/          the generation scripts and the smoke test
```

## Running it

```bash
python3 -m http.server 4173     # any static server; ES modules need http://
npm install && npm test         # jsdom smoke test — plays a whole fight
```

`npm test` is the gate worth caring about. It boots the game in jsdom, plays a
fight to its end state, and validates every question — 104 written and 3000
generated — against the rules the renderers assume: both languages present, no
duplicate options, no ambiguous matching pairs, numeric answers that are
actually numbers.

## Notes for anyone reading the code

**KaTeX ships no Cyrillic.** A unit written as `\text{см}` renders as tofu
boxes unless `.katex .text` is pointed at a font that has the glyphs. One line
in `css/base.css`; do not remove it.

**Sprite effects use independent transforms.** The hero is mirrored with
`scaleX(-1)`, so any effect that also writes `transform` must compose `scale`
and `translate` separately or the character flips mid-swing.

**The powers are pure functions.** `js/powers.js` has no DOM and no timers; the
fight screen reads `battle.powerState` and draws whatever the rule is currently
doing. Adding an eleventh power means adding an entry there and a label in
`screens/battle-feedback.js`.

**Generated questions are held to the same standard as written ones.** The
hand-written banks are used on a level's first run because their wording and
explanations are better; every replay is generated so a child is doing maths
again instead of remembering which tile was green.

## Regenerating the assets

The art, the comics and the music were generated through Vertex AI. The scripts
expect Application Default Credentials and your own project:

```bash
export VERTEX_PROJECT=your-gcp-project-id
gcloud auth application-default login
python3 tools/gen_art.py        # characters, objects, arenas, comic panels
python3 tools/gen_poses.py      # the three extra frames per fighter
python3 tools/gen_music.py      # four Lyria loops
```

`assets/raw/` (the uncompressed originals) is not committed — it is several
hundred megabytes and adds nothing to a clone.
