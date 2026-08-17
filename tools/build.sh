#!/bin/bash
# Assemble dist/ — the exact set of files that gets deployed.
#
# There is no bundler and nothing is compiled: this only decides what ships.
# node_modules (jsdom, for the smoke test) and tools/ (the generators, and the
# uncompressed art in assets/raw) are development-only and would multiply the
# upload for no benefit to a player.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist

cp index.html _headers dist/
cp -r js css vendor dist/

# assets/, but never assets/raw — the originals are hundreds of megabytes.
mkdir -p dist/assets
find assets -maxdepth 1 -type f \( -name '*.webp' -o -name '*.mp3' -o -name '*.mp4' \) \
  -exec cp {} dist/assets/ \;

echo "dist/ is $(du -sh dist | cut -f1) across $(find dist -type f | wc -l) files"
