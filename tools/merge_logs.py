"""Resolve a rebase conflict between two runs that both saved logs (used by the "Save" step).
usage: python tools/merge_logs.py <run commit> <upstream ref>
- posted.json: union of posts (by url / ep), upstream order first
- marketing/history.jsonl: union of lines
- any other conflicted file: keep the run's version (in a rebase, --theirs = the commit being replayed)"""
import json, subprocess, sys

MINE, UP = sys.argv[1], sys.argv[2]
P, H = "moshimo-3d/posted.json", "moshimo-3d/marketing/history.jsonl"


def show(ref, path):
    return subprocess.run(["git", "show", f"{ref}:{path}"], capture_output=True, text=True, encoding="utf-8").stdout


conf = subprocess.run(["git", "diff", "--name-only", "--diff-filter=U"], capture_output=True, text=True).stdout.split()
for f in conf:
    if f == P:
        up, mine = json.loads(show(UP, P) or '{"posts": []}'), json.loads(show(MINE, P) or '{"posts": []}')
        seen = {x.get("url") or x.get("ep") for x in up["posts"]}
        for x in mine["posts"]:
            k = x.get("url") or x.get("ep")
            if k not in seen:
                up["posts"].append(x); seen.add(k)
        json.dump(up, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    elif f == H:
        lines = list(dict.fromkeys(show(UP, H).splitlines() + show(MINE, H).splitlines()))
        open(H, "w", encoding="utf-8").write("\n".join(l for l in lines if l.strip()) + "\n")
    elif subprocess.run(["git", "checkout", "--theirs", "--", f]).returncode != 0:
        subprocess.run(["git", "rm", "-q", "--", f])
    subprocess.run(["git", "add", "-A", "--", f])
print("merged:", ", ".join(conf) or "nothing")
