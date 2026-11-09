"""Download the SFX listed in sfx-library/sfx.json from their source (効果音ラボ) into sfx-library/files/.
Audio files are never committed (the license forbids redistributing the raw files)."""
import json, os, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "sfx-library")
lib = json.load(open(os.path.join(LIB, "sfx.json"), encoding="utf-8"))["sfx"]
os.makedirs(os.path.join(LIB, "files"), exist_ok=True)
got = 0
for key, v in lib.items():
    path = os.path.join(LIB, v["file"])
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        continue
    url = v["url"]
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (moshimo-reels builder)", "Referer": url.split("mp3/")[0]})
    with urllib.request.urlopen(req, timeout=60) as r, open(path, "wb") as f:
        f.write(r.read())
    got += 1
    time.sleep(0.4)
print(f"sfx ready: {len(lib)} ({got} downloaded)")
