"""post-eps mode: render episodes prepared in moshimo-3d/queue/<ep>.json, then post each one (in order).
queue json: {ep, topic, arm, hypothesis, caption, cover: [clean_t, "もしも|<金>|<続き>", "<2行目>", "<スタンプ>"]}
env: EPS="epA,epB,..." plus the publish.py env. A failure on one episode does not stop the next."""
import json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M3D = os.path.join(ROOT, "moshimo-3d")
last_post = 0.0
failed = []
if os.environ.get("FROM_RUN"):  # reuse videos rendered by an earlier run (its "video" artifact) instead of rendering again
    subprocess.run(["gh", "run", "download", os.environ["FROM_RUN"], "-n", "video", "-D", os.path.join(M3D, "out")])
for ep in [e.strip() for e in os.environ.get("EPS", "").split(",") if e.strip()]:
    try:
        q = json.load(open(os.path.join(M3D, "queue", ep + ".json"), encoding="utf-8"))
        t, l1, l2, stamp = q["cover"]
        have = lambda f: os.path.exists(os.path.join(M3D, "out", ep, f))
        cmds = ([] if have("final.mp4") else [["python", "render.py", ep, "full"]]) +                ([] if have("cover.jpg") else [["python", "render.py", ep, "clean", str(t)], ["python", "cover.py", ep, l1, l2, stamp]])
        for cmd in cmds:
            subprocess.run(cmd, cwd=M3D, check=True)
        json.dump({k: q[k] for k in ("ep", "topic", "arm", "hypothesis", "caption") if k in q},
                  open(os.path.join(M3D, "out", "next.json"), "w", encoding="utf-8"), ensure_ascii=False)
        if q.get("post_at"):  # optional ISO time (e.g. "2026-11-13T12:00:00+09:00"): render first, then hold the post until then
            from datetime import datetime
            hold = datetime.fromisoformat(q["post_at"]).timestamp() - time.time()
            if hold > 0:
                print(f"holding {ep} for {hold / 60:.0f} min until {q['post_at']}", flush=True); time.sleep(hold)
        wait = 25 * 60 - (time.time() - last_post)  # keep posts at least ~25 min apart
        if last_post and wait > 0:
            time.sleep(wait)
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "publish.py")], check=True)
        last_post = time.time()
        os.remove(os.path.join(M3D, "queue", ep + ".json"))
    except Exception as e:
        print("FAILED", ep, e); failed.append(ep)
if failed:
    raise SystemExit("failed: " + ", ".join(failed))
