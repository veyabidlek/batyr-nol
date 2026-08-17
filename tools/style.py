#!/usr/bin/env python3
"""Shared Vertex plumbing + the one style prompt every image in the game shares.

Gemini API keys are blocked on this Google account by org policy, so everything
goes through Vertex AI with Application Default Credentials. The ADC file is an
`authorized_user` credential, so a plain OAuth refresh mints the token — no
google-auth dependency (it drags in cryptography, and this box is small).

Nano Banana never returns an alpha channel, so cut-out subjects are generated on
a flat field and keyed out here. It also does not reliably honour "chroma green"
— it paints some green of its own choosing — so the key samples the actual
corner colour and removes only the region connected to the border. That
connectivity check is what stops a pale robe or a white highlight from being
punched out along with the backdrop.
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import time
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageFilter
from scipy import ndimage

ADC = Path("/home/claude/.config/gcloud/application_default_credentials.json")
PROJECT = os.environ.get("VERTEX_PROJECT", "")
if not PROJECT:
    raise SystemExit("set VERTEX_PROJECT (your Google Cloud project id)")

MODEL = "gemini-2.5-flash-image"
URL = (f"https://aiplatform.googleapis.com/v1/projects/{PROJECT}"
       f"/locations/global/publishers/google/models/{MODEL}:generateContent")

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "raw"
OUT = ROOT / "assets"
COMPRESS = "/home/claude/scripts/compress-asset.py"

# ---------------------------------------------------------------- style

# The palette is described so the model matches it, and then explicitly
# forbidden from being drawn — an earlier project shipped a book spine with
# "1E68IFF" lettered onto it because the hex codes read as art direction.
STYLE = (
    "Modern anime key visual, television-anime production quality, in the style "
    "of a high-budget shonen fantasy series. Confident clean line art with "
    "varying line weight, cel shading with two shadow tones plus a bright rim "
    "light, vivid saturated colour, strong value contrast, painterly gradient "
    "background, subtle bloom on the brightest highlights. Expressive large eyes "
    "with detailed iris and catchlights, sharp readable silhouette, hair and "
    "cloth caught mid-motion. "
    "Kazakh steppe fantasy setting: nomadic lamellar armour, chapan robes, "
    "silver and turquoise jewellery, oyu ornament patterns, felt and tooled "
    "leather, curved sabres, horsehair plumes, fur trim. "
    "Colour direction only, never drawn or lettered: deep indigo night, steppe "
    "gold, crimson, pale bone white, teal-cyan magic light, void black-violet."
)

NEGATIVE = (
    "Absolutely no text of any kind: no letters, no words, no numbers, no digits, "
    "no kanji, no runes, no captions, no speech bubbles, no signature, no "
    "watermark, no logo, no colour codes. "
    "Avoid: photorealism, 3D render, western cartoon style, chibi proportions, "
    "blurry, muddy desaturated colour, extra limbs, deformed hands, comic panel "
    "gutters, UI elements, frames, borders, and more than one character when a "
    "single character is requested."
)

# "No background panel" is doing real work here: left to itself the model likes
# to paint a rectangle of sky behind the head, which survives the key (it is a
# separate colour region, not connected to the border) and ships as a coloured
# box floating behind the character in the fight.
CUTOUT = (
    "The subject is isolated on a completely flat, uniform, plain white field. "
    "No scenery, no horizon, no ground, no cast shadow on the field, no gradient, "
    "no paint splatter, no decorative marks, and absolutely no rectangle, panel, "
    "banner or block of colour anywhere behind the character. The field is one "
    "single flat colour, edge to edge."
)


def access_token() -> str:
    d = json.loads(ADC.read_text())
    r = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": d["client_id"], "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"], "grant_type": "refresh_token",
    }, timeout=30)
    r.raise_for_status()
    return r.json()["access_token"]


def _post(token: str, body: dict, key: str) -> Path | None:
    for attempt in range(5):
        try:
            r = requests.post(URL, headers={"Authorization": f"Bearer {token}"},
                              json=body, timeout=240)
        except requests.RequestException as exc:
            print(f"  ! {key}: {type(exc).__name__}", flush=True)
            time.sleep(10)
            continue
        if r.status_code in (429, 503):
            wait = 30 * (attempt + 1)
            print(f"  · {key}: {r.status_code}, waiting {wait}s", flush=True)
            time.sleep(wait)
            continue
        if r.status_code != 200:
            print(f"  ! {key}: HTTP {r.status_code} {r.text[:200]}", flush=True)
            time.sleep(6)
            continue
        for cand in r.json().get("candidates", []):
            for part in cand.get("content", {}).get("parts", []):
                data = part.get("inlineData") or part.get("inline_data")
                if data and data.get("data"):
                    path = RAW / f"{key}.png"
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_bytes(base64.b64decode(data["data"]))
                    return path
        print(f"  ! {key}: no image part (attempt {attempt + 1})", flush=True)
        time.sleep(3)
    return None


def generate(token: str, key: str, prompt: str, *, cutout: bool,
             aspect: str = "1:1") -> Path | None:
    """Text-to-image. The no-text rule is repeated at both ends on purpose —
    stated once, it loses to a prompt that mentions banners or ornament."""
    text = (f"{STYLE}\n\nNO TEXT ANYWHERE IN THE IMAGE.\n\n{prompt}.\n\n"
            f"{CUTOUT if cutout else ''}\n\n{NEGATIVE}")
    body = {
        "contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": aspect},
        },
    }
    return _post(token, body, key)


def generate_from(token: str, key: str, base_png: Path, prompt: str) -> Path | None:
    """Image-to-image, used for pose frames — this is what keeps a character's
    face, armour and proportions identical across four frames.

    ⚠️ The background instruction has to match what the BASE image actually has.
    Asking for "the same chroma green field" over a base that came back on white
    reads as a contradiction, and the model resolves it by inventing scenery —
    a painted sky and ground that survive the key and ship as a rectangle behind
    the fighter. Describe the field the base really has, and forbid scenery
    twice.
    """
    b64 = base64.b64encode(base_png.read_bytes()).decode()
    text = (f"{STYLE}\n\nNO TEXT ANYWHERE IN THE IMAGE.\n\n{prompt}.\n\n"
            "Same character, exactly the same age and face, same proportions, "
            "same costume, same colours, same art style, same framing and the "
            "same character size within the frame. "
            "The background stays a completely flat, uniform, plain white field: "
            "no sky, no ground, no horizon, no scenery, no shadow, no gradient, "
            "no rectangle or block of colour behind the character.\n\n"
            f"{NEGATIVE}")
    body = {
        "contents": [{"role": "user", "parts": [
            {"inlineData": {"mimeType": "image/png", "data": b64}},
            {"text": text},
        ]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }
    return _post(token, body, key)


def key_out(path: Path, tol: float = 105.0) -> Path:
    """Flat field to alpha, despill the fringe, crop to content."""
    img = Image.open(path).convert("RGB")
    a = np.asarray(img).astype(np.float32)

    corners = np.stack([a[:8, :8], a[:8, -8:], a[-8:, :8], a[-8:, -8:]])
    bg = np.median(corners.reshape(-1, 3), axis=0)

    similar = np.sqrt(((a - bg) ** 2).sum(axis=2)) < tol
    labels, _ = ndimage.label(similar)
    border = np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    bg_labels = [int(v) for v in np.unique(border) if v]
    is_bg = np.isin(labels, bg_labels) if bg_labels else np.zeros_like(similar)

    alpha = Image.fromarray(np.where(is_bg, 0, 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))

    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = g > np.maximum(r, b)
    g = np.where(spill, np.maximum(r, b), g)
    rgb = np.dstack([r, g, b]).astype(np.uint8)

    img = Image.fromarray(rgb, "RGB").convert("RGBA")
    img.putalpha(alpha)

    bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
        pad = int(max(img.size) * 0.04)
        padded = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
        padded.paste(img, (pad, pad))
        img = padded

    cut = path.with_name(f"{path.stem}_cut.png")
    img.save(cut)
    return cut


def finish(src: Path, key: str) -> int:
    """Compress into assets/<key>.webp; returns the size in KB."""
    final = OUT / f"{key}.webp"
    subprocess.run(["python3", COMPRESS, str(src), str(final)],
                   capture_output=True, text=True)
    return final.stat().st_size // 1024 if final.exists() else 0
