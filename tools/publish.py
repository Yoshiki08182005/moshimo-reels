"""Post the episode described in moshimo-3d/out/next.json as an Instagram Reel.

Uses the Instagram Graph API via Facebook Login for Business (system-user token, graph.facebook.com)
with a resumable upload, so no public video hosting is needed.
The cover image is prepended as a 0.2s title card and selected with thumb_offset.

env: IG_USER_ID, IG_ACCESS_TOKEN (never printed), IG_API_VERSION (default v25.0), DRY_RUN=1 to skip posting
"""
import datetime, json, os, re, subprocess, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M3D = os.path.join(ROOT, "moshimo-3d")


class ApiError(Exception):
    pass


def http(method, url, data=None, headers=None, raw=None):
    body = raw if raw is not None else (urllib.parse.urlencode(data).encode() if data else None)
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise ApiError(f"HTTP {e.code} {e.read().decode()[:600]}")


def with_cover(video, cover, out):
    """prepend the cover as a 0.2s title card (used as the Reel thumbnail)"""
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-t", "0.2", "-i", cover, "-i", video, "-filter_complex",
                    "[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[c];[1:v]setsar=1,fps=30,format=yuv420p[v];"
                    "[c][v]concat=n=2:v=1:a=0[vv];[1:a]adelay=200|200[aa]",
                    "-map", "[vv]", "-map", "[aa]", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], check=True)


HOSTED = []  # temporary release assets to delete after posting


def wait_ready(api, cid, auth):
    for _ in range(80):
        st = http("GET", f"{api}/{cid}?fields=status_code,status", headers=auth)
        print("status", st.get("status_code"), str(st.get("status", ""))[:120])
        if st.get("status_code") in ("FINISHED", "ERROR", "EXPIRED"):
            return st.get("status_code")
        time.sleep(15)
    return "TIMEOUT"


def post_by_url(api, uid, auth, video, caption):
    """fallback: host the file as a temporary GitHub release asset and let Instagram fetch it (video_url)"""
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not (repo and os.environ.get("GH_TOKEN")):
        raise SystemExit("upload failed 3 times (no GH_TOKEN for the video_url fallback)")
    tag = "ig-upload-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    subprocess.run(["gh", "release", "create", tag, video, "-R", repo, "--prerelease", "--title", tag,
                    "--notes", "temporary file for an Instagram upload (deleted after posting)"], check=True)
    HOSTED.append((repo, tag))
    url = f"https://github.com/{repo}/releases/download/{tag}/{os.path.basename(video)}"
    for attempt in range(2):
        try:
            c = http("POST", f"{api}/{uid}/media", {"media_type": "REELS", "video_url": url, "caption": caption,
                                                    "share_to_feed": "true", "thumb_offset": "100"}, headers=auth)
            print("url container", c["id"])
            if wait_ready(api, c["id"], auth) == "FINISHED":
                return c["id"]
        except ApiError as e:
            print("url attempt", attempt + 1, "failed:", e)
        time.sleep(30)
    raise SystemExit("upload failed (resumable x3 and video_url x2)")


def cleanup_hosted():
    for repo, tag in HOSTED:
        subprocess.run(["gh", "release", "delete", tag, "-R", repo, "--yes", "--cleanup-tag"])


def post_reel(video, caption):
    ver = os.environ.get("IG_API_VERSION", "v25.0")
    api, uid, tok = f"https://graph.facebook.com/{ver}", os.environ["IG_USER_ID"], "".join(os.environ["IG_ACCESS_TOKEN"].split())
    auth = {"Authorization": f"OAuth {tok}"}
    size = os.path.getsize(video)
    try:
        print("publishing limit", http("GET", f"{api}/{uid}/content_publishing_limit?fields=config,quota_usage", headers=auth))
    except ApiError as e:
        print("publishing limit: n/a", e)
    for attempt in range(6):  # rupload sometimes refuses (ProcessingFailedError) for a while -> new container, back off, retry
        try:
            c = http("POST", f"{api}/{uid}/media", {"media_type": "REELS", "upload_type": "resumable", "caption": caption,
                                                    "share_to_feed": "true", "thumb_offset": "100"}, headers=auth)
            cid = c["id"]; print("container", cid)
            up = http("POST", c.get("uri") or f"https://rupload.facebook.com/ig-api-upload/{ver}/{cid}",
                      headers={**auth, "offset": "0", "file_size": str(size), "Content-Type": "application/octet-stream"},
                      raw=open(video, "rb").read())
            print("upload", "ok" if up.get("success") else up)
            for _ in range(80):
                st = http("GET", f"{api}/{cid}?fields=status_code,status", headers=auth)
                print("status", st.get("status_code"), str(st.get("status", ""))[:120])
                if st.get("status_code") in ("FINISHED", "ERROR", "EXPIRED"):
                    break
                time.sleep(15)
            if st.get("status_code") == "FINISHED":
                break
            print("attempt", attempt + 1, "container", st.get("status_code"))
        except ApiError as e:
            print("attempt", attempt + 1, "failed:", e)
        time.sleep([30, 60, 120, 240, 300, 0][attempt])
    else:
        cid = post_by_url(api, uid, auth, video, caption)  # rupload kept refusing (ProcessingFailedError): let Instagram fetch it
    for attempt in range(3):
        try:
            pub = http("POST", f"{api}/{uid}/media_publish", {"creation_id": cid}, headers=auth); break
        except ApiError as e:
            print("publish attempt", attempt + 1, "failed:", e); time.sleep(20)
    else:
        raise SystemExit("media_publish failed 3 times")
    info = http("GET", f"{api}/{pub['id']}?fields=permalink", headers=auth)
    return info.get("permalink", pub["id"])


def fallback_next():
    """The AI sometimes ends right after writing the episode file: rebuild next.json from the newest unposted episode."""
    posted = {p["ep"] for p in json.load(open(os.path.join(M3D, "posted.json"), encoding="utf-8"))["posts"]}
    eps = [f[:-3] for f in os.listdir(os.path.join(M3D, "episodes")) if re.match(r"ep\d+_.*\.js$", f) and f[:-3] not in posted]
    if not eps:
        raise SystemExit("no out/next.json and no unposted episode")
    ep = max(eps, key=lambda e: int(re.match(r"ep(\d+)", e).group(1)))
    qj = os.path.join(M3D, "queue", ep + ".json")
    if os.path.exists(qj):  # a hand-written caption / cover is waiting for this episode
        print("fallback: queue json for", ep)
        return json.load(open(qj, encoding="utf-8"))
    src = open(os.path.join(M3D, "episodes", ep + ".js"), encoding="utf-8").read()
    g = lambda k: (re.search(k + r":\s*'([^']*)'", src) or [None, ""])[1]
    word, tail, t1, t2 = g("word"), g("tail"), g("hookTail1"), g("hookTail2")
    head = [l[2:].strip() for l in src.splitlines()[1:12] if l.startswith("//")]
    title = f"もしも{word}{tail}"; cover = [7.0, f"もしも|{word}|{t1}", t2, "本気で試算"]
    pop = re.search(r"title:\s*\[\s*'([^']*)'\s*,\s*'([^']*)'", src)
    if pop:  # narrated "pop" style: title: ['line1', '[accent]line2']
        l1, l2 = (re.sub(r"[\[\]]", "", x) for x in pop.groups())
        title = l1 + l2; cover = [1.5, l1 + "||", l2, ""]
    cap = (title + "\n科学で考えると…どうなると思う？\n\n🧪 試算の前提\n" + "\n".join("・" + h for h in head)
           + "\n\n※プログラムで作った3DCGの空想科学シミュレーションです\n\n#空想科学 #雑学 #シュミレーション #シミュレーション #もしもシリーズ #もしも #科学 #3DCG")
    print("fallback next.json for", ep)
    return {"ep": ep, "topic": title, "arm": (re.search(r"アーム([ABC])", src) or [None, ""])[1], "hypothesis": "",
            "caption": cap, "cover": cover}


def main():
    nj = os.path.join(M3D, "out", "next.json")
    nxt = json.load(open(nj, encoding="utf-8")) if os.path.exists(nj) else fallback_next()
    ep = nxt["ep"]; out = os.path.join(M3D, "out", ep)
    # render / cover here when the AI did not get that far
    if not os.path.exists(os.path.join(out, "final.mp4")):
        subprocess.run(["python", "render.py", ep, "full"], cwd=M3D, check=True)
    if not os.path.exists(os.path.join(out, "cover.jpg")):
        t, l1, l2, stamp = nxt.get("cover") or [7.0, f"もしも|{ep}|", "", ""]
        subprocess.run(["python", "render.py", ep, "clean", str(t)], cwd=M3D, check=True)
        subprocess.run(["python", "cover.py", ep, l1, l2, stamp], cwd=M3D, check=True)
    video = os.path.join(out, "upload.mp4")
    with_cover(os.path.join(out, "final.mp4"), os.path.join(out, "cover.jpg"), video)
    print("video", round(os.path.getsize(video) / 1e6, 1), "MB")
    if os.environ.get("DRY_RUN") == "1":
        print("DRY_RUN: skip posting"); return
    try:
        url = post_reel(video, nxt["caption"])
    finally:
        cleanup_hosted()
    print("posted:", url)
    pj = os.path.join(M3D, "posted.json")
    p = json.load(open(pj, encoding="utf-8"))
    p["posts"].append({"date": datetime.date.today().isoformat(), "ep": ep, "topic": nxt.get("topic", ""), "url": url, "via": "cloud",
                       "arm": nxt.get("arm", ""), "hypothesis": nxt.get("hypothesis", ""), "slot": os.environ.get("SLOT", "")})
    json.dump(p, open(pj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(M3D, "out", "posted_urls.txt"), "a", encoding="utf-8") as f:
        print(f"{nxt.get('topic', ep)}（アーム{nxt.get('arm', '-')}）: {url}", file=f)


if __name__ == "__main__":
    main()
