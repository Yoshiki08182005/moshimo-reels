// Shared helpers for episode files.
// B = beat boundaries [0, hookEnd, ..., endingStart, outroStart, end]; amb = [[t, key, dur], ...]
export function stdCues(B, amb = [], goldAt = 3.4, capSfx = 'text_tin') {
  const end = B[B.length - 2], last = B[B.length - 3];
  const cues = [
    [0.02, 'text_impact', -6], [0.35, 'countdown_tick', -11, 4.65], [5.0, 'vanish_hyun', -3], [5.0, 'impact_don', -9], [5.08, 'sparkle', -11],
    [5.6, capSfx, -15], [last, 'emo_shine', -13], [last + goldAt, 'sparkle', -13], [end + 0.2, 'end_tirin', -9],
  ];
  for (let i = 1; i < B.length - 2; i++) { cues.push([B[i] - 0.18, i % 2 ? 'whoosh_switch1' : 'whoosh_switch2', -13]); cues.push([B[i] + 0.5, capSfx, -16]); }
  for (const [t, key, dur] of amb) cues.push([t, key, -27, dur]);
  return cues;
}
// build shots from compact rows: [sc, num, unit, loc, cap, sub[], cam, opt]
export function beats(B, hook, rows, ending) {
  const shots = [{ s: B[0], e: B[1], hook: true, capAt: 5.6, ...hook }];
  rows.forEach((r, i) => shots.push({ s: B[i + 1], e: B[i + 2], sc: r[0], num: r[1], unit: r[2], loc: r[3], cap: r[4], sub: r[5], cam: r[6], opt: r[7], ...(r[8] || {}) }));
  const n = rows.length + 1;
  shots.push({ s: B[n], e: B[n + 1], goldAt: 3.4, ...ending });
  shots.push({ s: B[n + 1], e: B[n + 2], sc: 'outro' });
  return shots;
}

// ---------- "pop" style (narrated): build the timeline from the narration audio ----------
// voice = the json written by voice.py. plan rows: { say: ['id', ...] (narration line ids), sfx: [[dt, key, gain], ...], pre, gap, hold, ...shot props }
// Each shot lasts as long as its lines. Returns { shots, narr, voice, cues }; every shot gets shot.lt = { lineId: start time inside the shot }.
export function narrate(voice, plan, { gap = 0.2, tail = 1.3 } = {}) {
  const shots = [], narr = [], vc = [], cues = []; let t = 0;
  plan.forEach((p, i) => {
    const s = t, lt = {}; t += p.pre ?? 0.1;
    for (const id of p.say || []) {
      const v = voice.lines[id]; lt[id] = t - s;
      narr.push({ id, t0: t, t1: t + v.dur, chunks: v.chunks.map(c => ({ t: t + c.t, text: c.text })) });
      vc.push([t, v.file]); t += v.dur + (p.gap ?? gap);
    }
    t += p.hold ?? 0;
    if (i === plan.length - 1) t += tail;
    for (const [dt, key, gain, dur] of p.sfx || []) cues.push(dur ? [s + dt, key, gain, dur] : [s + dt, key, gain]);
    shots.push({ ...p, s, e: t, lt });
  });
  return { shots, narr, voice: vc, cues };
}
