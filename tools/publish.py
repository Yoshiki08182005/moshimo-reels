"""Post the episode described in moshimo-3d/out/next.json as an Instagram Reel.

Uses the Instagram Graph API via Facebook Login for Business (system-user token, graph.facebook.com)
with a resumable upload, so no public video hosting is needed.
The cover image is prepended as a 0.2s title card and selected with thumb_offset.

env: IG_USER_ID, IG_ACCESS_TOKEN (never printed), IG_API_VERSION (default v25.0), DRY_RUN=1 to skip posting
"""
import datetime, json, os, subprocess, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M3D = os.path.join(ROOT, "moshimo-3d")


def http(method, url, data=None, headers=None, raw=None):
    body = raw if raw is not None else (urllib.parse.urlencode(data).encode() if data else None)
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:600]); raise SystemExit(1)


def with_cover(video, cover, out):
    """prepend the cover as a 0.2s title card (used as the Reel thumbnail)"""
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-t", "0.2", "-i", cover, "-i", video, "-filter_complex",
                    "[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[c];[1:v]setsar=1,fps=30,format=yuv420p[v];"
                    "[c][v]concat=n=2:v=1:a=0[vv];[1:a]adelay=200|200[aa]",
                    "-map", "[vv]", "-map", "[aa]", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], check=True)


def post_reel(video, caption):
    ver = os.environ.get("IG_API_VERSION", "v25.0")
    api, uid, tok = f"https://graph.facebook.com/{ver}", os.environ["IG_USER_ID"], os.environ["IG_ACCESS_TOKEN"]
    auth = {"Authorization": f"OAuth {tok}"}
    c = http("POST", f"{api}/{uid}/media", {"media_type": "REELS", "upload_type": "resumable", "caption": caption,
                                            "share_to_feed": "true", "thumb_offset": "100"}, headers=auth)
    cid = c["id"]; print("container", cid)
    size = os.path.getsize(video)
    up = http("POST", c.get("uri") or f"https://rupload.facebook.com/ig-api-upload/{ver}/{cid}",
              headers={**auth, "offset": "0", "file_size": str(size), "Content-Type": "application/octet-stream"},
              raw=open(video, "rb").read())
    print("upload", "ok" if up.get("success") else up)
    for _ in range(80):
        st = http("GET", f"{api}/{cid}?fields=status_code,status", headers=auth)
        print("status", st.get("status_code"), str(st.get("status", ""))[:120])
        if st.get("status_code") == "FINISHED":
            break
        if st.get("status_code") in ("ERROR", "EXPIRED"):
            raise SystemExit("container failed")
        time.sleep(15)
    pub = http("POST", f"{api}/{uid}/media_publish", {"creation_id": cid}, headers=auth)
    info = http("GET", f"{api}/{pub['id']}?fields=permalink", headers=auth)
    return info.get("permalink", pub["id"])


def main():
    nxt = json.load(open(os.path.join(M3D, "out", "next.json"), encoding="utf-8"))
    ep = nxt["ep"]; out = os.path.join(M3D, "out", ep)
    video = os.path.join(out, "upload.mp4")
    with_cover(os.path.join(out, "final.mp4"), os.path.join(out, "cover.jpg"), video)
    print("video", round(os.path.getsize(video) / 1e6, 1), "MB")
    if os.environ.get("DRY_RUN") == "1":
        print("DRY_RUN: skip posting"); return
    url = post_reel(video, nxt["caption"])
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
