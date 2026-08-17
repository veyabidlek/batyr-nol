#!/usr/bin/env python3
"""Generate the game's music with Lyria on Vertex AI.

Four loops, a few cents each. Music is the cheapest production value in the
whole project — it does more for "this feels like a real game" than any single
visual effect.

⚠️ Lyria is served from the `global` location only; us-central1 404s.

Usage:
    python3 gen_music.py            # everything missing
    python3 gen_music.py boss
"""
from __future__ import annotations

import base64
import subprocess
import sys
import time
from pathlib import Path

import requests

from style import PROJECT, OUT, RAW, access_token

MODEL = "lyria-3-pro-preview"
URL = (f"https://aiplatform.googleapis.com/v1/projects/{PROJECT}"
       f"/locations/global/publishers/google/models/{MODEL}:generateContent")

# Anime scoring over Kazakh instruments: dombyra and kobyz carrying the melody,
# but arranged the way a television fantasy series would arrange them.
TRACKS = {
    "music_story": (
        "Instrumental anime fantasy score for a quiet story scene. Solo dombyra "
        "plucking a wandering melody over warm sustained strings, a distant kobyz "
        "drone and soft piano. Wistful, spacious, unhurried, slightly melancholy. "
        "No vocals, no lyrics, no singing. Loopable, about 60 seconds."
    ),
    "music_battle": (
        "Instrumental anime battle theme with Kazakh folk instruments. Driving "
        "dombyra ostinato, galloping frame drums, taiko hits, soaring string "
        "melody, low brass swells. Heroic, urgent, cinematic television-anime "
        "production. No vocals, no lyrics, no singing. Loopable, about 60 seconds."
    ),
    "music_boss": (
        "Instrumental anime final-boss theme. Ominous low choir-like synth pads, "
        "thunderous taiko and timpani, a distorted kobyz wailing over a relentless "
        "dombyra ostinato, brass stabs, a sense of vast empty space. Overwhelming "
        "and tragic rather than evil. No vocals, no lyrics, no singing. Loopable, "
        "about 60 seconds."
    ),
    "music_victory": (
        "Instrumental anime ending theme, warm and hopeful. Dombyra and acoustic "
        "guitar over lush strings and gentle piano, building to a bright open "
        "resolution. Peaceful, triumphant, a little tearful. No vocals, no lyrics, "
        "no singing. About 45 seconds."
    ),
}


def generate(token: str, name: str, prompt: str) -> bool:
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["AUDIO", "TEXT"]},
    }
    for attempt in range(4):
        r = requests.post(URL, headers={"Authorization": f"Bearer {token}"},
                          json=body, timeout=600)
        if r.status_code in (429, 503):
            wait = 30 * (attempt + 1)
            print(f"    {r.status_code}, waiting {wait}s", flush=True)
            time.sleep(wait)
            continue
        if r.status_code != 200:
            print(f"    HTTP {r.status_code} {r.text[:200]}", flush=True)
            time.sleep(5)
            continue
        for cand in r.json().get("candidates", []):
            for part in cand.get("content", {}).get("parts", []):
                data = part.get("inlineData") or part.get("inline_data")
                if data and data.get("data"):
                    raw = RAW / f"{name}.mp3"
                    raw.write_bytes(base64.b64decode(data["data"]))
                    # It loops in the background; 80k mono is plenty and keeps
                    # the download honest on a phone.
                    subprocess.run([
                        "ffmpeg", "-v", "error", "-y", "-i", str(raw),
                        "-ac", "1", "-b:a", "80k", str(OUT / f"{name}.mp3"),
                    ], capture_output=True)
                    return True
        print("    no audio part", flush=True)
        time.sleep(3)
    return False


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    wanted = sys.argv[1:] or list(TRACKS)
    token = access_token()
    for name in wanted:
        key = name if name.startswith("music_") else f"music_{name}"
        prompt = TRACKS.get(key)
        if not prompt:
            print(f"  ? {key}: unknown track", flush=True)
            continue
        final = OUT / f"{key}.mp3"
        if final.exists():
            print(f"  · {key}: already done", flush=True)
            continue
        print(f"  → {key}…", flush=True)
        if generate(token, key, prompt):
            print(f"  ✓ {key}: {final.stat().st_size // 1024} KB", flush=True)
        else:
            print(f"  ✗ {key}: gave up", flush=True)


if __name__ == "__main__":
    main()
