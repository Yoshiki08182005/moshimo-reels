"""Render a moshimo episode.

  python render.py EP stills 1 6 12 ...   -> out/EP/stills/sheet.jpg
  python render.py EP full                -> out/EP/final.mp4 (frames + BGM + SFX cues, fitted under 9.6MB)
"""
import base64, functools, http.server, json, os, subprocess, sys, threading, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(os.path.dirname(ROOT), "sfx-library")
PORT = int(os.environ.get('MOSHIMO_PORT', 8765)); FPS = 30
MAX_MB = float(os.environ.get('MOSHIMO_MAX_MB', 9.6))  # cloud (API upload) can use more
SS = os.environ.get('MOSHIMO_SS', '1.5')
LINUX = sys.platform.startswith('linux')


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()


def open_page(p, ep):
    if LINUX:  # GitHub Actions: no GPU -> SwiftShader
        b = p.chromium.launch(headless=True, args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    else:
        b = p.chromium.launch(channel="msedge", headless=True, args=["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"])
    page = b.new_page(viewport={"width": 540, "height": 960})
    page.on("pageerror", lambda e: print("pageerror:", e))
    page.goto(f"http://127.0.0.1:{PORT}/index.html?ep={ep}&ss={SS}")
    page.wait_for_function("window.READY===true || !!window.ERR", timeout=300000)
    err = page.evaluate("window.ERR || null")
    if err:
        print("ERR", err); sys.exit(1)
    return b, page


def grab(page, t, q=0.95, clean=False):
    return base64.b64decode(page.evaluate(f"window.frameAt({t}, {q}, {'true' if clean else 'false'})").split(",", 1)[1])


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        print(r.stderr[-1500:]); sys.exit(1)
    return r.stdout


def mix_audio(meta, outdir):
    dur = meta["duration"]; mus = meta.get("music", {})
    bgm = os.path.join(outdir, "bgm.wav")
    pop = mus.get("style") == "pop"  # narrated style: light bouncy music kept under the voice
    if pop:
        run([sys.executable, os.path.join(ROOT, "bgm_pop.py"), bgm, str(dur), str(mus.get("twist", dur * 0.55)), str(mus.get("cta", dur - 4))])
    else:
        run([sys.executable, os.path.join(ROOT, "bgm.py"), bgm, str(dur), str(meta["T_B"]), str(mus.get("restore", dur - 10)), str(mus.get("outro", dur - 4))])
    lib = json.load(open(os.path.join(SFX, "sfx.json"), encoding="utf-8"))["sfx"]
    inputs, filt, labels = ["-i", bgm], [f"[0:a]volume={'-15dB' if pop else '-2dB'}[b0]"], ["[b0]"]
    for j, (t, rel) in enumerate(meta.get("voice", [])):  # narration lines: [time, path under episodes/]
        inputs += ["-i", os.path.join(ROOT, "episodes", rel)]; ms = int(t * 1000)
        filt.append(f"[{j + 1}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=4dB,adelay={ms}|{ms}[v{j}]")
        labels.append(f"[v{j}]")
    nv = len(meta.get("voice", []))
    for i, c in enumerate(meta["cues"], 1 + nv):
        t, key, gain = c[0], c[1], c[2]
        # a key that is not in the stock library is a file under episodes/ (episode-specific generated sounds)
        inputs += ["-i", os.path.join(SFX, lib[key]["file"]) if key in lib else os.path.join(ROOT, "episodes", key)]
        trim = f"atrim=0:{c[3]},afade=t=out:st={max(0, c[3] - 0.4)}:d=0.4," if len(c) > 3 else ""
        ms = int(t * 1000)
        filt.append(f"[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,{trim}volume={gain}dB,adelay={ms}|{ms}[c{i}]")
        labels.append(f"[c{i}]")
    filt.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=44100[a]")
    out = os.path.join(outdir, "audio.m4a")
    run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[a]", "-t", str(dur), "-c:a", "aac", "-b:a", "128k", out])
    return out


def encode(raw, audio, dur, outdir):
    vbit = int(min(8000, (MAX_MB * 8 * 1000 / dur) - 140))
    final = os.path.join(outdir, "final.mp4"); log = os.path.join(outdir, "x264")
    base = ["-c:v", "libx264", "-preset", "veryslow", "-tune", "animation", "-b:v", f"{vbit}k", "-pix_fmt", "yuv420p", "-passlogfile", log]
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, *base, "-pass", "1", "-an", "-f", "mp4", "NUL"])
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-i", audio, *base, "-pass", "2", "-profile:v", "high",
         "-movflags", "+faststart", "-c:a", "copy", "-shortest", final])
    print(f"final {final} {os.path.getsize(final) / 1e6:.2f}MB video {vbit}kbps")


def main():
    ep, mode = sys.argv[1], sys.argv[2]
    outdir = os.path.join(ROOT, "out", ep); os.makedirs(outdir, exist_ok=True)
    serve()
    with sync_playwright() as p:
        b, page = open_page(p, ep)
        meta = page.evaluate("window.META")
        if mode == "clean":  # 3D-only frame for custom covers: render.py EP clean T
            path = os.path.join(outdir, "clean.jpg"); open(path, "wb").write(grab(page, float(sys.argv[3]), 0.95, True)); print(path)
        elif mode == "stills":
            from PIL import Image
            ts = [float(x) for x in sys.argv[3:]]
            ims = []
            for t in ts:
                path = os.path.join(outdir, f"s_{t:05.1f}.jpg"); open(path, "wb").write(grab(page, t, 0.85))
                ims.append(Image.open(path).resize((270, 480)))
            cols = min(6, len(ims)); rows = (len(ims) + cols - 1) // cols
            sheet = Image.new("RGB", (270 * cols, 480 * rows))
            for i, im in enumerate(ims):
                sheet.paste(im, ((i % cols) * 270, (i // cols) * 480))
            sheet.save(os.path.join(outdir, "sheet.jpg"), quality=88)
            print("sheet", os.path.join(outdir, "sheet.jpg"))
        else:
            n = int(round(meta["duration"] * FPS)); raw = os.path.join(outdir, "raw.mp4")
            ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg",
                                   "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "12", "-pix_fmt", "yuv420p", raw], stdin=subprocess.PIPE)
            t0 = time.time()
            for i in range(n):
                ff.stdin.write(grab(page, i / FPS))
                if i % 300 == 0:
                    print(f"frame {i}/{n} {time.time() - t0:.0f}s", flush=True)
            ff.stdin.close(); ff.wait()
            print(f"frames done {time.time() - t0:.0f}s")
            b.close()
            json.dump(meta, open(os.path.join(outdir, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False)
            encode(raw, mix_audio(meta, outdir), meta["duration"], outdir)
            run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "0.6", "-i", raw, "-frames:v", "1", "-q:v", "2", os.path.join(outdir, "cover.jpg")])
            return
        b.close()


if __name__ == "__main__":
    main()
