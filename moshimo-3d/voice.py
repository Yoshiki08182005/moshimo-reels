"""Narration for the "pop" style: episodes/<ep>.script.json -> episodes/<ep>_voice/<id>.mp3 + episodes/<ep>.voice.json

script.json: {"voice": "ja-JP-NanamiNeural", "rate": "+18%", "lines": [{"id": "hook", "text": "もしも、|反応速度が|[10倍]になったら？", "say": "(optional reading)"}]}
  "|" splits the caption into chunks shown one at a time, "[...]" is drawn in the accent colour. Neither is spoken.
voice.json: {"lines": {id: {"file", "dur", "chunks": [{"t", "text"}]}}}   (t = seconds from the start of the line's audio)

usage: python voice.py EP        (needs: pip install edge-tts, ffmpeg)
"""
import asyncio, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PUNCT = re.compile(r"[\s、。！？!?「」『』（）()・…,.\-ー〜~：:]")


def norm(s):
    return PUNCT.sub("", s)


async def synth(text, voice, rate, path):
    import edge_tts
    words = []
    com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    with open(path, "wb") as f:
        async for ev in com.stream():
            if ev["type"] == "audio":
                f.write(ev["data"])
            elif ev["type"] == "WordBoundary":
                words.append((ev["offset"] / 1e7, ev["duration"] / 1e7, ev["text"]))
    return words


def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                capture_output=True, text=True).stdout.strip())


def trim_tail(path):
    """cut the silence after the last word so lines can be packed tightly (leading silence is kept: word offsets stay valid)"""
    tmp = path + ".tmp.mp3"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-af",
                    "areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.06,areverse",
                    "-c:a", "libmp3lame", "-b:a", "128k", tmp], check=True)
    os.replace(tmp, path)


def chunk_times(chunks, words, dur):
    """start time of each caption chunk, from the word boundaries (falls back to proportional by characters)"""
    lens = [max(1, len(norm(c))) for c in chunks]
    total = sum(lens)
    starts = [sum(lens[:i]) / total for i in range(len(chunks))]  # 0..1 position in the text
    if not words:
        return [round(p * dur, 3) for p in starts]
    wl = [max(1, len(norm(w[2]))) for w in words]
    wt = sum(wl); acc = 0; marks = []  # (text position 0..1, time)
    for (off, d, _), n in zip(words, wl):
        marks.append((acc / wt, off)); acc += n
    marks.append((1.0, min(dur, words[-1][0] + words[-1][1])))
    out = []
    for p in starts:
        for (p0, t0), (p1, t1) in zip(marks, marks[1:]):
            if p0 <= p <= p1:
                out.append(round(t0 + (t1 - t0) * ((p - p0) / (p1 - p0) if p1 > p0 else 0), 3)); break
        else:
            out.append(round(p * dur, 3))
    out[0] = 0.0
    return out


def main():
    ep = sys.argv[1]
    sc = json.load(open(os.path.join(ROOT, "episodes", ep + ".script.json"), encoding="utf-8"))
    vdir = os.path.join(ROOT, "episodes", ep + "_voice"); os.makedirs(vdir, exist_ok=True)
    res = {"voice": sc["voice"], "rate": sc.get("rate", "+0%"), "lines": {}}
    total = 0
    for ln in sc["lines"]:
        chunks = [c for c in ln["text"].split("|") if c]
        plain = [c.replace("[", "").replace("]", "") for c in chunks]
        say = ln.get("say") or "".join(plain)
        path = os.path.join(vdir, ln["id"] + ".mp3")
        words = asyncio.run(synth(say, sc["voice"], sc.get("rate", "+0%"), path))
        trim_tail(path)
        dur = duration(path)
        ts = chunk_times(plain, [] if ln.get("say") else words, dur)
        res["lines"][ln["id"]] = {"file": f"{ep}_voice/{ln['id']}.mp3", "dur": round(dur, 3),
                                  "chunks": [{"t": t, "text": c} for t, c in zip(ts, chunks)]}
        total += dur
        print(f"{ln['id']:10s} {dur:5.2f}s  {say}")
    json.dump(res, open(os.path.join(ROOT, "episodes", ep + ".voice.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"total speech {total:.1f}s, {len(sc['lines'])} lines")


if __name__ == "__main__":
    main()
