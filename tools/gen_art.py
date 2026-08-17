#!/usr/bin/env python3
"""Generate every base image: characters, objects, arenas, comic panels.

Pose frames are a second pass (gen_poses.py) because they are generated *from*
the character images this script produces.

Usage:
    python3 gen_art.py                  # everything still missing
    python3 gen_art.py aibyn foe3       # force-regenerate these
    python3 gen_art.py --only comics    # one group
"""
from __future__ import annotations

import sys
import time

from roster import BACKGROUNDS, CHARACTERS, COMICS, OBJECTS
from style import OUT, RAW, access_token, finish, generate, key_out

# group -> (assets, cutout?, aspect)
GROUPS = {
    "characters": (CHARACTERS, True, "3:4"),
    "objects": (OBJECTS, True, "1:1"),
    "backgrounds": (BACKGROUNDS, False, "16:9"),
    "comics": (COMICS, False, "16:9"),
}


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    args = sys.argv[1:]
    only = None
    if args and args[0] == "--only":
        only, args = args[1], args[2:]
    forced = set(args)

    token = access_token()
    minted = time.time()

    for group, (assets, cutout, aspect) in GROUPS.items():
        if only and group != only:
            continue
        for key, prompt in assets.items():
            if forced and key not in forced:
                continue
            if (OUT / f"{key}.webp").exists() and not forced:
                print(f"  · {key}", flush=True)
                continue
            # The access token is good for an hour and a full run is longer.
            if time.time() - minted > 2400:
                token, minted = access_token(), time.time()
            print(f"  → {key}…", flush=True)
            raw = generate(token, key, prompt, cutout=cutout, aspect=aspect)
            if not raw:
                print(f"  ✗ {key}: gave up", flush=True)
                continue
            src = key_out(raw) if cutout else raw
            print(f"  ✓ {key}: {finish(src, key)} KB", flush=True)
            time.sleep(8)


if __name__ == "__main__":
    main()
