"""Procedural soundtrack for the reel (no external samples).
Calm piano before the blackout, power-down hit at T_B, sparse minor ambience, warmer restore, soft outro."""
import numpy as np, wave, os, sys

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "bgm.wav"
DUR, T_B, T_RESTORE, T_OUTRO = (float(x) for x in sys.argv[2:6]) if len(sys.argv) > 5 else (67.5, 4.0, 54.0, 62.5)
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rs = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, start, sig):
    i = int(start * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i]


def piano(m, dur=2.5, vel=0.25):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    s = np.zeros_like(t)
    for k, a in enumerate([1, 0.45, 0.22, 0.12, 0.06], 1):
        s += a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1.6 + 0.9 * k))
    s *= np.minimum(1, t / 0.004)
    return vel * s


def pad(ms, dur, vel=0.06, att=1.2, rel=1.5):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for m in ms:
        f = hz(m)
        for d in (-0.003, 0.0, 0.003):
            s += np.sin(2 * np.pi * f * (1 + d) * t) + 0.25 * np.sin(2 * np.pi * 2 * f * (1 + d) * t)
    env = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel)
    return vel * s * np.clip(env, 0, 1) / len(ms)


def note(t0, m, dur=2.5, vel=0.25, pan=0.0):
    s = piano(m, dur, vel)
    add(L, t0, s * (1 - pan) * 0.9); add(R, t0, s * (1 + pan) * 0.9)


def chord_pad(t0, ms, dur, vel=0.06):
    s = pad(ms, dur, vel)
    add(L, t0, s); add(R, t0, s)


# --- intro (0..T_B): calm major arpeggio
C = [60, 64, 67, 71]; Am = [57, 60, 64, 67]
seq = C + Am
for i in range(8):
    t = 0.15 + i * 0.45
    if t < T_B - 0.1:
        note(t, seq[i % len(seq)] + 12, 2.0, 0.16, pan=(-0.4 if i % 2 else 0.4))
chord_pad(0.0, [48, 55, 64], T_B + 0.3, 0.05)

# --- blackout hit
t = np.arange(int(2.6 * SR)) / SR
thump = 0.9 * np.sin(2 * np.pi * (55 * t - 18 * t ** 2)) * np.exp(-t * 2.2)
sweep_f = 420 * np.exp(-t * 3.2) + 35
sweep = 0.22 * np.sin(2 * np.pi * np.cumsum(sweep_f) / SR) * np.exp(-t * 1.6)
noise = rs.normal(0, 1, len(t)); noise = np.convolve(noise, np.ones(60) / 60, mode="same") * np.exp(-t * 4) * 0.6
hit = thump + sweep + noise
add(L, T_B, hit * 0.35); add(R, T_B, hit * 0.35)

# --- dark section: Am - F - C - G slow pads + sparse piano
prog = [[45, 52, 60, 64], [41, 48, 57, 60], [48, 55, 64, 67], [43, 50, 59, 62]]
t0 = T_B + 1.4; i = 0
while t0 < T_RESTORE - 0.5:
    ch = prog[i % 4]
    d = min(4.0, T_RESTORE - t0)
    chord_pad(t0, ch, d + 1.2, 0.055)
    tones = [c + 12 for c in ch[1:]] + [ch[-1] + 24]
    for k in range(4):
        if rs.random() < 0.75 and t0 + k < T_RESTORE - 0.3:
            note(t0 + k + rs.random() * 0.15, tones[rs.integers(len(tones))], 3.0, 0.12, pan=rs.uniform(-0.5, 0.5))
    t0 += 4.0; i += 1

# --- restore: rising tone + warm C - G - Am - F with arpeggios
t = np.arange(int(1.6 * SR)) / SR
rise = 0.12 * np.sin(2 * np.pi * np.cumsum(80 + 500 * (t / 1.6) ** 2) / SR) * np.minimum(1, t / 0.6) * np.exp(-np.maximum(0, t - 1.2) * 6)
add(L, T_RESTORE + 0.6, rise); add(R, T_RESTORE + 0.6, rise)
prog2 = [[48, 55, 64, 67], [43, 55, 59, 62], [45, 52, 60, 64], [41, 53, 57, 60]]
t0 = T_RESTORE + 1.2; i = 0
while t0 < T_OUTRO:
    ch = prog2[i % 4]
    chord_pad(t0, ch, 2.4, 0.06)
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 24]
    for k in range(4):
        tk = t0 + k * 0.5
        if tk < T_OUTRO + 0.5:
            note(tk, arp[k], 2.0, 0.15, pan=(-0.3 if k % 2 else 0.3))
    t0 += 2.0; i += 1

# --- outro: sustained C add9
chord_pad(T_OUTRO, [48, 55, 62, 64, 67], DUR - T_OUTRO, 0.07)
for k, m in enumerate([72, 74, 79]):
    note(T_OUTRO + 0.4 + k * 0.6, m, 3.5, 0.12)

# --- reverb (FFT convolution with decaying noise IR)
def reverb(x, seed):
    g = np.random.default_rng(seed)
    n = int(2.4 * SR); tt = np.arange(n) / SR
    ir = g.normal(0, 1, n) * np.exp(-tt * 2.6); ir[:int(0.012 * SR)] = 0; ir /= np.sqrt(np.sum(ir ** 2)) * 6
    m = len(x) + n
    nfft = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return x * 0.8 + y * 0.9

L = reverb(L, 1); R = reverb(R, 2)
fade = np.ones(N); fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo)
mx = max(np.abs(L).max(), np.abs(R).max())
L = L / mx * 0.85 * fade; R = R / mx * 0.85 * fade
data = (np.stack([L, R], 1) * 32767).astype(np.int16)
out = OUT
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print("bgm", out, DUR)
