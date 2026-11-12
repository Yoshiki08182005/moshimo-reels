"""Procedural burp sounds for sp_geppu2x (no samples): episodes/sp_geppu2x_sfx/b1..b6.wav, small -> planet-sized.
Jittered pulse train through three moving formants (FOF grains) + wet noise + sub-bass + drive + reverb.
usage: python episodes/sp_geppu2x_sfx.py"""
import numpy as np, wave, os, subprocess

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sp_geppu2x_sfx")


def grains(dur, f0a, f0b, seed, jit=0.2):
    r = np.random.default_rng(seed); n = int(SR * (dur + 0.06)); y = np.zeros(n)
    G = int(SR * 0.04); tau = np.arange(G) / SR; t = 0.0
    FA, FB, BW, AM = (720, 1250, 2600), (430, 880, 2300), (95, 120, 170), (1.0, 0.5, 0.22)
    while t < dur:
        u = t / dur; f0 = f0a + (f0b - f0a) * u; i = int(t * SR)
        g = np.zeros(G)
        for fa, fb, bw, am in zip(FA, FB, BW, AM):
            f = (fa + (fb - fa) * u) * (1 + 0.04 * r.standard_normal())
            g += am * np.exp(-np.pi * bw * tau) * np.sin(2 * np.pi * f * tau)
        m = min(G, n - i); y[i:i + m] += (0.55 + 0.45 * r.random()) * g[:m]
        t += (1 / f0) * (1 + jit * r.standard_normal() * 0.5 + (0.6 if r.random() < 0.07 else 0))
    return y


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x):
        s = a * s + (1 - a) * v; y[i] = s
    return y


def conv(x, ir):
    n = len(x) + len(ir) - 1; m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:n]


def burp(name, dur, f0a, f0b, sub, drive, rev, tail, seed):
    r = np.random.default_rng(seed + 100)
    y = grains(dur, f0a, f0b, seed); n = len(y); t = np.arange(n) / SR
    env = np.clip(t / 0.015, 0, 1) * np.clip((dur + 0.05 - t) / (dur * 0.3), 0, 1) * (1 + 0.22 * np.sin(2 * np.pi * 7.3 * t + seed))
    y = y / np.abs(y).max() * env
    y += lowpass(r.standard_normal(n), 1800) * env * 0.5          # wet, breathy part
    if sub:
        f = np.linspace(f0a * 0.8, f0b * 0.7, n); y += sub * np.sin(2 * np.pi * np.cumsum(f) / SR) * env
    y = np.tanh(y * drive) / np.tanh(drive)
    ch = []
    for k in (0, 1):
        if rev:
            m = int(SR * tail * 4); tt = np.arange(m) / SR
            ir = lowpass(np.random.default_rng(seed * 7 + k).standard_normal(m), 2400 - 1500 * min(1, tail)) * np.exp(-tt / tail)
            w = conv(y, ir); w = w / np.abs(w).max()
            d = np.zeros(len(w)); d[:n] = y; s = d * (1 - rev * 0.5) + w * rev
        else:
            s = y
        ch.append(s)
    st = np.stack(ch, 1); st = st / np.abs(st).max() * 0.9
    st[-int(SR * 0.03):] *= np.linspace(1, 0, int(SR * 0.03))[:, None]
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype("<i2").tobytes())
    w = os.path.join(OUT, name + ".wav")  # wav is gitignored: the episode uses the mp3
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", w, "-c:a", "libmp3lame", "-q:a", "2", w[:-4] + ".mp3"], check=True)
    print(f"{name} {len(st) / SR:.2f}s")


os.makedirs(OUT, exist_ok=True)
#     name  dur   f0a  f0b  sub  drive rev  tail seed
burp("b1", 0.32, 108, 82, 0.0, 1.2, 0.0, 0.0, 1)
burp("b2", 0.45, 94, 66, 0.0, 1.5, 0.15, 0.2, 2)
burp("b3", 0.60, 80, 55, 0.2, 1.9, 0.25, 0.3, 3)
burp("b4", 0.80, 68, 44, 0.45, 2.5, 0.35, 0.55, 4)
burp("b5", 1.05, 58, 36, 0.7, 3.2, 0.45, 0.9, 5)
burp("b6", 1.40, 48, 28, 1.0, 4.0, 0.55, 1.4, 6)
