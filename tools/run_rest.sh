#!/bin/bash
# Wait for the base art pass to finish, then poses, then music.
export VERTEX_PROJECT=project-34d17070-8e22-455e-a87
while pgrep -f "gen_art.py" > /dev/null; do sleep 30; done
echo "=== base art done, regenerating khan (background artefact) ==="
rm -f ../assets/khan.webp
python3 gen_art.py khan >> art.log 2>&1
echo "=== poses ==="
python3 gen_poses.py > poses.log 2>&1
echo "=== music ==="
python3 gen_music.py > music.log 2>&1
echo "=== all done ==="
