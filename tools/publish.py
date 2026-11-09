"""Publish the episode described in moshimo-3d/out/next.json.

1. push final.mp4 + cover.jpg to the public media repo (GitHub Pages) with the deploy key
2. wait until the Pages URL is live
3. post a Reel via the Instagram API (Instagram Login: graph.instagram.com)
4. append to moshimo-3d/posted.json

env: MEDIA_REPO (owner/name), MEDIA_DEPLOY_KEY, IG_USER_ID, IG_ACCESS_TOKEN, IG_API_VERSION (default v25.0), DRY_RUN=1 to skip posting
"""
import datetime, json, os, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M3D = os.path.join(ROOT, "moshimo-3d")


def sh(*cmd, **kw):
    print("+", " ".join(cmd)); subprocess.run(cmd, check=True, **kw)


def http(method, url, data=None):
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:800]); raise


def push_media(ep, files):
    repo = os.environ["MEDIA_REPO"]
    key = os.path.join(tempfile.mkdtemp(), "id")
    with open(key, "w") as f:
        f.write(os.environ["MEDIA_DEPLOY_KEY"].strip() + "\n")
    os.chmod(key, 0o600)
    env = dict(os.environ, GIT_SSH_COMMAND=f"ssh -i {key} -o StrictHostKeyChecking=accept-new")
    d = tempfile.mkdtemp()
    sh("git", "clone", "--depth", "1", f"git@github.com:{repo}.git", d, env=env)
    os.makedirs(os.path.join(d, ep), exist_ok=True)
    for f in files:
        shutil.copy(f, os.path.join(d, ep, os.path.basename(f)))
    sh("git", "-C", d, "add", "-A")
    sh("git", "-C", d, "-c", "user.name=moshimo-bot", "-c", "user.email=moshimo-bot@users.noreply.github.com", "commit", "-m", f"add {ep}")
    sh("git", "-C", d, "push", env=env)
    owner, name = repo.split("/")
    return f"https://{owner.lower()}.github.io/{name}/{ep}"


def wait_live(url, limit=900):
    t0 = time.time()
    while time.time() - t0 < limit:
        try:
            with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=30) as r:
                if r.status == 200:
                    print("live:", url); return
        except Exception as e:
            print("waiting for pages...", type(e).__name__)
        time.sleep(20)
    raise SystemExit(f"Pages URL not live: {url}")


def post_reel(video_url, cover_url, caption):
    ver = os.environ.get("IG_API_VERSION", "v25.0")
    api, uid, tok = f"https://graph.instagram.com/{ver}", os.environ["IG_USER_ID"], os.environ["IG_ACCESS_TOKEN"]
    c = http("POST", f"{api}/{uid}/media", {"media_type": "REELS", "video_url": video_url, "cover_url": cover_url,
                                             "caption": caption, "share_to_feed": "true", "access_token": tok})
    cid = c["id"]; print("container", cid)
    for _ in range(60):
        st = http("GET", f"{api}/{cid}?fields=status_code,status&access_token={tok}")
        print("status", st.get("status_code"), st.get("status", "")[:120])
        if st.get("status_code") == "FINISHED":
            break
        if st.get("status_code") in ("ERROR", "EXPIRED"):
            raise SystemExit(f"container failed: {st}")
        time.sleep(15)
    pub = http("POST", f"{api}/{uid}/media_publish", {"creation_id": cid, "access_token": tok})
    info = http("GET", f"{api}/{pub['id']}?fields=permalink&access_token={tok}")
    return info.get("permalink", pub["id"])


def main():
    nxt = json.load(open(os.path.join(M3D, "out", "next.json"), encoding="utf-8"))
    ep = nxt["ep"]; out = os.path.join(M3D, "out", ep)
    files = [os.path.join(out, "final.mp4"), os.path.join(out, "cover.jpg")]
    for f in files:
        if not os.path.exists(f):
            raise SystemExit(f"missing {f}")
    base = push_media(ep, files)
    wait_live(f"{base}/final.mp4"); wait_live(f"{base}/cover.jpg")
    if os.environ.get("DRY_RUN") == "1":
        print("DRY_RUN: skip posting", base); return
    url = post_reel(f"{base}/final.mp4", f"{base}/cover.jpg", nxt["caption"])
    print("posted:", url)
    pj = os.path.join(M3D, "posted.json")
    p = json.load(open(pj, encoding="utf-8"))
    p["posts"].append({"date": datetime.date.today().isoformat(), "ep": ep, "topic": nxt.get("topic", ""), "url": url, "via": "cloud"})
    json.dump(p, open(pj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
