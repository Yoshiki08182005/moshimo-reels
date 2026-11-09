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
