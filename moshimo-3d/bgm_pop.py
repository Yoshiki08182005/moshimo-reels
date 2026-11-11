"""Procedural background music for the narrated "pop" style (no external samples).
Bouncy marimba in C major -> minor colour from the twist ("でも…") -> back to major for the closing question.
usage: bgm_pop.py out.wav DUR T_TWIST T_CTA"""
import numpy as np, wave, sys

SR = 44100
OUT = sys.argv[1]
DUR, T_TWIST, T_CTA = (float(x) for x in sys.argv[2:5])
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
BEAT = 60 / 116


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(t0, sig, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    L[i:j] += sig[: j - i] * (1 - pan); R[i:j] += sig[: j - i] * (1 + pan)


def marimba(m, vel=0.2, dur=0.7):
    t = np.arange(int(dur * SR)) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 22) + 0.12 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t * 40)
    return vel * s * np.minimum(1, t / 0.003)


def bass(m, vel=0.3, dur=0.45):
    t = np.arange(int(dur * SR)) / SR; f = hz(m)
    return vel * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 5) * np.minimum(1, t / 0.006)


def hat(vel=0.05):
    t = np.arange(int(0.05 * SR)) / SR
    n = np.random.default_rng(3).normal(0, 1, len(t)); n = n - np.convolve(n, np.ones(8) / 8, mode="same")
    return vel * n * np.exp(-t * 90)


MAJ = [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 59, 62, 67]]      # C  Am  F  G
MIN = [[45, 57, 60, 64], [41, 53, 57, 60], [38, 53, 57, 62], [40, 56, 59, 64]]      # Am F  Dm E
bar = 0; t0 = 0.0
while t0 < DUR - 0.5:
    dark = T_TWIST <= t0 < T_CTA
    ch = (MIN if dark else MAJ)[bar % 4]
    lvl = 0.75 if dark else 1.0
    for b in range(4):
        tb = t0 + b * BEAT
        if b in (0, 2):
            add(tb, bass(ch[0] - (12 if dark else 0), 0.26 * lvl))
        notes = [ch[1], ch[2], ch[3], ch[2]] if not dark else [ch[1], ch[3], ch[2], ch[3]]
        add(tb, marimba(notes[b] + 12, 0.17 * lvl), pan=-0.25 if b % 2 else 0.25)
        add(tb + BEAT / 2, marimba(notes[(b + 2) % 4] + (24 if b == 3 and not dark else 12), 0.1 * lvl), pan=0.3 if b % 2 else -0.3)
        if not dark:
            add(tb + BEAT / 2, hat())
    t0 += 4 * BEAT; bar += 1
# little rise into the closing question
for k, m in enumerate([72, 76, 79, 84]):
    add(T_CTA - 0.45 + k * 0.11, marimba(m, 0.16, 0.9))
fade = np.ones(N); fo = int(0.8 * SR); fade[-fo:] = np.linspace(1, 0, fo)
mx = max(np.abs(L).max(), np.abs(R).max(), 1e-9)
data = (np.stack([L / mx * 0.8 * fade, R / mx * 0.8 * fade], 1) * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print("bgm_pop", OUT, DUR)
