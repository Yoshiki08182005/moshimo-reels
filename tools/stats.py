"""Collect view stats for the marketing role (runs in its own step; the token never reaches the AI step).

writes moshimo-3d/marketing/stats.json  : latest numbers per post + account + benchmark accounts
appends moshimo-3d/marketing/history.jsonl : one compact snapshot per run (views over time)
env: IG_USER_ID, IG_ACCESS_TOKEN (never printed), IG_API_VERSION (default v25.0)
Never fails the workflow: errors are recorded in stats.json["errors"].
"""
import datetime, json, os, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MK = os.path.join(ROOT, "moshimo-3d", "marketing")
VER = os.environ.get("IG_API_VERSION", "v25.0")
API = f"https://graph.facebook.com/{VER}"
UID, TOK = os.environ.get("IG_USER_ID", ""), os.environ.get("IG_ACCESS_TOKEN", "")
errors = []


def get(path, **params):
    url = f"{API}/{path}?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"OAuth {TOK}"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        msg = e.read().decode()[:300]
        raise RuntimeError(f"{path.split('?')[0]} {e.code} {msg}")


def insights(mid):
    """reel insights; falls back metric-by-metric when one name is rejected"""
    metrics = ["views", "reach", "likes", "comments", "shares", "saved", "total_interactions",
               "ig_reels_avg_watch_time", "ig_reels_video_view_total_time"]
    out = {}
    try:
        for d in get(f"{mid}/insights", metric=",".join(metrics)).get("data", []):
            out[d["name"]] = d["values"][0]["value"]
        return out
    except RuntimeError as e:
        first = str(e)
    for m in metrics:
        try:
            for d in get(f"{mid}/insights", metric=m).get("data", []):
                out[d["name"]] = d["values"][0]["value"]
        except RuntimeError:
            pass
    if not out:
        errors.append("insights: " + first)
    return out


def main():
    os.makedirs(MK, exist_ok=True)
    now = datetime.datetime.now(datetime.timezone.utc)
    res = {"fetched_at": now.isoformat(timespec="minutes"), "account": {}, "posts": [], "benchmarks": [], "errors": errors}
    if not (UID and TOK):
        errors.append("IG_USER_ID / IG_ACCESS_TOKEN not set")
    else:
        try:
            res["account"] = get(UID, fields="username,name,biography,followers_count,follows_count,media_count")
        except RuntimeError as e:
            errors.append("account: " + str(e))
        try:
            media = get(f"{UID}/media", fields="id,caption,timestamp,permalink,media_product_type,like_count,comments_count", limit=60).get("data", [])
        except RuntimeError as e:
            media = []; errors.append("media: " + str(e))
        for m in media:
            ts = datetime.datetime.fromisoformat(m["timestamp"].replace("+0000", "+00:00"))
            p = {"id": m["id"], "posted": m["timestamp"], "hours": round((now - ts).total_seconds() / 3600, 1),
                 "url": m.get("permalink"), "type": m.get("media_product_type"),
                 "title": (m.get("caption") or "").split("\n")[0][:60],
                 "likes": m.get("like_count"), "comments": m.get("comments_count")}
            p.update(insights(m["id"]))
            res["posts"].append(p)
        # benchmark accounts (public business/creator accounts) for market positioning
        bench = os.path.join(MK, "benchmarks.json")
        names = json.load(open(bench, encoding="utf-8")).get("accounts", []) if os.path.exists(bench) else []
        for n in names[:8]:
            for media_fields in ("caption,timestamp,like_count,comments_count,media_product_type,view_count,permalink",
                                 "caption,timestamp,like_count,comments_count,media_product_type,permalink"):
                try:
                    bd = get(UID, fields=f"business_discovery.username({n}){{username,followers_count,media_count,media.limit(15){{{media_fields}}}}}")["business_discovery"]
                    res["benchmarks"].append({"username": bd.get("username"), "followers": bd.get("followers_count"),
                                              "media_count": bd.get("media_count"),
                                              "recent": [{k: x.get(k) for k in ("timestamp", "like_count", "comments_count", "view_count", "media_product_type", "permalink")}
                                                         | {"title": (x.get("caption") or "").split("\n")[0][:50]} for x in bd.get("media", {}).get("data", [])]})
                    break
                except RuntimeError as e:
                    if media_fields.endswith("permalink") and "view_count" not in media_fields:
                        errors.append(f"benchmark {n}: {e}")
    json.dump(res, open(os.path.join(MK, "stats.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    snap = {"t": res["fetched_at"], "followers": res["account"].get("followers_count"),
            "posts": {p["id"]: [p["hours"], p.get("views"), p.get("likes"), p.get("shares"), p.get("saved")] for p in res["posts"]}}
    with open(os.path.join(MK, "history.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(snap, ensure_ascii=False) + "\n")
    tot = sum((p.get("views") or 0) for p in res["posts"])
    print(f"stats: {len(res['posts'])} posts, total views {tot}, followers {res['account'].get('followers_count')}, errors {len(errors)}")
    for e in errors:
        print(" -", e[:200])


if __name__ == "__main__":
    main()
