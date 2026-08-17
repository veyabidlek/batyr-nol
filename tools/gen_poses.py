#!/usr/bin/env python3
"""Generate the three extra animation frames for every fighter.

A still image being shaken is not an attack, no matter how much hitstop sits on
top of it. Each frame is generated *from the character's own base image*
(image-to-image) rather than from the prompt alone, which is what keeps the
face, the armour and the proportions identical across the four frames.

The source is the RAW png — still on its flat field — so the output comes back
on the same field and goes through the same key as the base art.

Usage:
    python3 gen_poses.py              # every missing frame
    python3 gen_poses.py foe3         # just this character
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

from style import OUT, RAW, access_token, finish, generate_from, key_out

# barys and khan2 never fight — the companion appears in the feedback card and
# the old batyr only in the comics, so neither needs a pose set.
CHARACTERS = [
    'aibyn', 'aisulu',
    'foe1', 'foe2', 'foe3', 'foe4', 'foe5', 'foe6', 'foe7', 'foe8', 'foe9',
    'khan',
]

POSES = {
    'windup': (
        "Only the pose changes: the character leans back and draws the weapon "
        "high and far behind the shoulder in a huge wind-up, weight on the back "
        "foot, cloak and hair thrown backwards, eyes locked forward, about to "
        "strike"
    ),
    'strike': (
        "Only the pose changes: the character lunges forward in a full attack, "
        "weapon swung all the way through in front of the body, front leg "
        "extended deep, cloak and hair streaming behind, mouth open in a shout"
    ),
    'hurt': (
        "Only the pose changes: the character recoils backwards from a blow, "
        "head tipped back, eyes squeezed shut, one arm flung outward, off "
        "balance and staggering. Knocked about, not injured: no blood, no wounds"
    ),
}


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    wanted = sys.argv[1:] or CHARACTERS
    token = access_token()
    minted = time.time()

    for name in wanted:
        base = RAW / f"{name}.png"
        if not base.exists():
            print(f"  ? {name}: no base image — run gen_art.py first", flush=True)
            continue
        for pose, prompt in POSES.items():
            key = f"{name}_{pose}"
            if (OUT / f"{key}.webp").exists():
                print(f"  · {key}", flush=True)
                continue
            if time.time() - minted > 2400:
                token, minted = access_token(), time.time()
            print(f"  → {key}…", flush=True)
            raw = generate_from(token, key, base, prompt)
            if not raw:
                print(f"  ✗ {key}: gave up", flush=True)
                continue
            print(f"  ✓ {key}: {finish(key_out(raw), key)} KB", flush=True)
            time.sleep(8)


if __name__ == "__main__":
    main()
