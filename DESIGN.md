# БАТЫР ЖОЛЫ II — НӨЛ ХАН

Sequel to *Батыр жолы* (grade 5). Grade-6 maths, anime style, ten levels, nine
heralds and a boss, each with a power that breaks one law of arithmetic.

## The premise

Forty years after the first game. Qobylandy — the hero the player was — is
gone. The steppe is losing its numbers: a herd counted twice gives two answers,
a road measured today is longer tomorrow, and the stars are going out one at a
time, from the edge of the sky inward.

The player is his grandchild — **Айбын** or **Айсұлу** (chosen at the start).
Their weapon is the same as their grandfather's: a sabre and a reckoning.

## The nine heralds

Every herald has three things: a **power** (a passive rule that bends the fight),
a **special** (a telegraphed heavy attack the player parries by answering the
next question correctly), and a **surprise** (an unannounced interrupt with a
short guard window). Each is bound to one grade-6 topic — the power is that
topic's law being broken.

| # | Herald | Power | Topic |
|---|---|---|---|
| 1 | **Жарты** — the Halver | Halves every second hit you land | Fractions: × and ÷ |
| 2 | **Тойымсыз** — the Never-Full | Eats a part of the question | Fraction word problems |
| 3 | **Таразы** — the Scales | Forces a false ratio: your damage scales to the *wrong* side | Ratio and proportion |
| 4 | **Жүзбасы** — the Hundred-Chief | Drains 1% of your health per beat | Percent |
| 5 | **Айна** — the Mirror | Shrinks or magnifies whatever it reflects | Scale, circle, circumference |
| 6 | **Қарама-Қарсы** — the Opposite | Signs invert: a wrong answer *heals* it | Rational numbers, negatives |
| 7 | **Тор** — the Grid | Pins you to a coordinate plane; movement costs | Coordinate plane |
| 8 | **Теңгерім** — the Balance | Whatever you do to one side, it does to the other | Linear equations |
| 9 | **Шексіз** — the Endless | Never quite dies; the bar approaches but does not reach | Inequalities, linear function |
| 10 | **ХАН НӨЛ** | Erases. Three phases. | Everything |

## The twist

Revealed in the cutscene after herald 8, set up from herald 6 onwards:

**Хан Нөл is Qobylandy.** When he sealed the void at the end of the first war he
could not close it from the outside — a hole in the world needs something exactly
its own size to fill it, and the only number that fits a hole is zero. He became
the zero. He has been holding the world's arithmetic together from inside it for
forty years, and what looks like an attack is his grip failing.

The nine heralds are not conquering anything. They are trying to *break the seal
to let him out*, which would open the hole again. They think they are the heroes
of this story. From their side, they are.

**The resolution is the maths.** The seal needs a zero. The player has spent
level 6 learning that zero is not only a number you can *be* — it is a number you
can *make*: **+n and −n**, two opposites, sum to zero. So the seal can be held by
a pair instead of a prisoner. The player steps in as −n and pulls their
grandfather out as +n, and the two of them together are the zero the hole needs —
except that a pair can walk out together the moment a third opposite is found,
which is what the heralds, now nine allies, spend the epilogue doing.

Nobody dies. The villain was right. The maths is the plot.

## What is new versus game 1

- **Parry.** A telegraphed special is survivable by *knowing the maths*, not by
  reflexes: get the next question right and you counter it.
- **Guard window.** A surprise attack can be blocked by tapping the shield inside
  1.4 s. It is the only reflex check in the game, it is always survivable, and it
  can be switched off in settings along with the timer.
- **Powers.** Every fight has a rule the player has to notice and work around.
  This is what makes ten fights ten fights instead of one fight ten times.
- **Comic reader.** The story is told in panels with a reveal, not a wall of text.
- **Three-phase boss** with a scripted mid-fight turn.
- **Two heroes**, chosen at the start, each with their own ultimate.

## Constraints kept from game 1

No build step, no framework, no bundler. Plain HTML, CSS and ES modules; KaTeX
vendored. Bilingual Kazakh (primary) and Russian throughout. Everything works on
a phone, offline after first load, and honours `prefers-reduced-motion`.
