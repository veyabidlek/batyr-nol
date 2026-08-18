#!/usr/bin/env python3
"""Generate the animated cinematics with Veo 3.1 Fast on Vertex AI.

Three eight-second clips: the opening, the moment the twist lands, and the
ending. They sit at the three points where the story asks the player to stop
playing and watch, and nowhere else — a cutscene the player cannot skip past
into the next fight is a tax, not a reward.

Veo is long-running: `:predictLongRunning` hands back an operation name, then
`:fetchPredictOperation` is polled until `done`. With no storageUri the mp4 comes
back inline as base64. ~90 s per clip.

⚠️ Model id and region both matter — only `veo-3.1-fast-generate-001` (and its
non-fast siblings) exist on this project, and only in us-central1. The veo-2 /
veo-3.0 / *-preview ids 404.

Usage:
    python3 gen_veo.py                # every missing clip
    python3 gen_veo.py twist
"""
from __future__ import annotations

import base64
import json
import subprocess
import sys
import time
from pathlib import Path

import requests

from style import OUT, PROJECT, RAW, access_token

LOCATION = "us-central1"
MODEL = "veo-3.1-fast-generate-001"
BASE = (f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}"
        f"/locations/{LOCATION}/publishers/google/models/{MODEL}")

# The same art direction as the stills, compressed to what a video model can
# actually hold on to. No text, because Veo letters gibberish onto banners.
STYLE = (
    "Modern 2D anime, television-anime production quality, cel shaded with clean "
    "line art and a bright rim light, deep indigo night and steppe gold palette "
    "with teal magic light. Kazakh steppe fantasy: nomadic lamellar armour, "
    "chapan robes, oyu ornament, curved sabres. Cinematic camera. "
    "No text on screen, no subtitles, no captions, no logos, no watermark."
)

CLIPS = {
    "intro": (
        "Cinematic anime opening. Night over an endless Kazakh steppe: the stars "
        "in the sky go out one by one, leaving clean black holes in the "
        "constellations. A great snow leopard with faintly glowing rosettes turns "
        "its head toward the camera. Cut to a seventeen-year-old batyr in gold "
        "and indigo lamellar armour riding hard across the dark grass, cloak "
        "streaming, a teal-edged sabre in one hand. Slow push in on their "
        "determined face as a vast ring of broken golden light rises on the "
        "horizon ahead."
    ),
    # ⚠️ The first take of this shot came back with gold "6", "2" and "@"
    # lettered across the armour plates — Veo reads "ornament" on a large metal
    # surface as an invitation to write. In a maths game a stray digit on screen
    # is worse than in most, so the ban is repeated inside the shot description
    # itself rather than left to the shared style block.
    "twist": (
        "Cinematic anime revelation shot. Inside a collapsed star: a colossal "
        "faceless armoured emperor of pure void sits motionless, a broken crown "
        "of gold shards orbiting his helmet. The dark inside the armour cracks "
        "open like a shell, teal light pouring from the seam, and the exhausted "
        "face of a very old white-bearded batyr looks out from within it. "
        "Slow dolly in. Heartbreak, not horror. "
        "The armour plates are plain riveted metal with smooth curved scrollwork "
        "only — absolutely no letters, no numbers, no digits, no symbols and no "
        "written characters anywhere on the armour, the crown or the background."
    ),
    "victory": (
        "Cinematic anime ending. Dawn over the Kazakh steppe: the stars come back "
        "on one by one in a paling sky. A young batyr and a very old "
        "white-bearded batyr walk down a hill side by side, seen from behind, a "
        "great snow leopard padding between them, white felt yurts and rising "
        "smoke in the valley below. The camera cranes up into the returning "
        "stars. Warm, peaceful, triumphant."
    ),
}


def encode(src: Path, dst: Path) -> None:
    """960px wide at CRF 28, with the moov atom moved to the front.

    Not the shared compress-asset helper: that targets 1280/CRF 20 for stills
    and leaves an eight-second clip at ~4.7 MB. These play once, inside a card
    no wider than a phone, over a Kazakh mobile connection — 1.2 MB each looks
    identical there and is four times faster to start. `+faststart` matters more
    than the bitrate does: without it the browser downloads the whole file
    before the first frame appears.
    """
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(src),
        "-vf", "scale=960:-2",
        "-c:v", "libx264", "-preset", "slow", "-crf", "28",
        "-c:a", "aac", "-b:a", "80k",
        "-movflags", "+faststart", str(dst),
    ], capture_output=True)
    if not dst.exists():
        dst.write_bytes(src.read_bytes())


def start(token: str, prompt: str) -> str:
    body = {
        "instances": [{"prompt": f"{prompt}\n\n{STYLE}"}],
        "parameters": {
            "sampleCount": 1,
            "durationSeconds": 8,
            "aspectRatio": "16:9",
            "generateAudio": True,
        },
    }
    r = requests.post(f"{BASE}:predictLongRunning",
                      headers={"Authorization": f"Bearer {token}"},
                      json=body, timeout=120)
    if r.status_code != 200:
        raise SystemExit(f"start failed: HTTP {r.status_code} {r.text[:400]}")
    return r.json()["name"]


def poll(token: str, operation: str, tries: int = 90) -> dict:
    for i in range(tries):
        time.sleep(10)
        r = requests.post(f"{BASE}:fetchPredictOperation",
                          headers={"Authorization": f"Bearer {token}"},
                          json={"operationName": operation}, timeout=120)
        if r.status_code != 200:
            print(f"  poll HTTP {r.status_code} {r.text[:200]}", flush=True)
            continue
        data = r.json()
        if data.get("done"):
            return data
        print(f"  … still rendering ({(i + 1) * 10}s)", flush=True)
    raise SystemExit("timed out waiting for Veo")


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or list(CLIPS)
    token = access_token()
    for name in names:
        prompt = CLIPS.get(name)
        if not prompt:
            print(f"  ? {name}: unknown clip", flush=True)
            continue
        final = OUT / f"{name}.mp4"
        if final.exists():
            print(f"  · {name}", flush=True)
            continue
        print(f"  → {name}: starting…", flush=True)
        data = poll(token, start(token, prompt))

        response = data.get("response", {})
        videos = response.get("videos") or response.get("generatedSamples") or []
        if not videos:
            print(f"  ✗ {name}: no video in response {json.dumps(data)[:400]}", flush=True)
            continue
        b64 = (videos[0].get("bytesBase64Encoded")
               or videos[0].get("video", {}).get("bytesBase64Encoded"))
        if not b64:
            print(f"  ✗ {name}: no inline bytes {json.dumps(videos[0])[:300]}", flush=True)
            continue

        raw = RAW / f"{name}.mp4"
        raw.write_bytes(base64.b64decode(b64))
        encode(raw, final)
        print(f"  ✓ {name}: {final.stat().st_size // 1024} KB", flush=True)


if __name__ == "__main__":
    main()
