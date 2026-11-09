"""Make a cover from a clean 3D frame (render.py EP clean T) + big hook title + optional stamp.

  python cover.py EP "もしも|身長40m|の" "ヒーローがいたら？" "重っ！"
  line1 is 'white|gold|white' parts; line2 is white; stamp is optional (red, tilted).
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
ep, line1, line2 = sys.argv[1], sys.argv[2], sys.argv[3]
stamp = sys.argv[4] if len(sys.argv) > 4 else ""
d0 = os.path.join(ROOT, "out", ep)
im = Image.open(os.path.join(d0, "clean.jpg")).convert("RGB")
W, H = im.size
shade = Image.new("L", (W, H), 0); sd = ImageDraw.Draw(shade)
for y in range(0, 900):
    sd.line([(0, y), (W, y)], fill=int(160 * (1 - y / 900)))
im = Image.composite(Image.new("RGB", (W, H), "black"), im, shade)
d = ImageDraw.Draw(im)
def _font(*cands):
    for c in cands:
        if os.path.exists(c):
            return c
    raise FileNotFoundError(cands)


SERIF = _font("C:/Windows/Fonts/yumindb.ttf", "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc")
GOTHB = _font("C:/Windows/Fonts/BIZ-UDGothicB.ttc", "/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc", "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc")


def fit(text, size, maxw=1000):
    f = ImageFont.truetype(SERIF, size)
    while d.textlength(text, font=f) > maxw and size > 40:
        size -= 4; f = ImageFont.truetype(SERIF, size)
    return f


p = line1.split("|") + ["", "", ""]
f = fit("".join(p[:3]), 136); f2 = fit(line2, 136); f = f if f.size < f2.size else f2
for y, parts in [(300, [(p[0], "white"), (p[1], "#f3c24f"), (p[2], "white")]), (470, [(line2, "white")])]:
    x = (W - sum(d.textlength(t, font=f) for t, _ in parts)) / 2
    for t, c in parts:
        d.text((x, y), t, font=f, fill=c, stroke_width=9, stroke_fill="black"); x += d.textlength(t, font=f)
if stamp:
    g = ImageFont.truetype(GOTHB, 160)
    s = Image.new("RGBA", (1000, 300), (0, 0, 0, 0)); ImageDraw.Draw(s).text((500, 150), stamp, font=g, fill="#ff3b30", anchor="mm", stroke_width=18, stroke_fill="white")
    s = s.rotate(10, expand=True, resample=Image.BICUBIC); im.paste(s, ((W - s.width) // 2, 980), s)
im.save(os.path.join(d0, "cover.jpg"), quality=92)
print(os.path.join(d0, "cover.jpg"))
