// ep12 (アームC ニュース起点): もしも散らかった部屋が勝手に片付いたら？
// ニュース: 理研などが「エントロピー増大則」を量子力学から証明（2026年11月4日発表、PRX Quantum）→ 逆にエントロピーが減ったら？
// コイン100枚全部オモテ: 2^100 ≒ 1.27×10^30 → 毎秒1回投げて約4×10^22年 ≒ 宇宙の年齢(138億年)の約2.9兆倍
// トランプ: 52! ≒ 8.07×10^67 / 6畳(約25m3)の空気の分子: PV/kT ≒ 6.3×10^26個 → 全部片側の確率 2^-(6.3×10^26)
// 片付け1時間: 体の発熱約100W×3600s = 36万J → 外のエントロピー +約1200J/K（部屋の並びの変化よりはるかに大きい）
import { run } from '../engine/core.js';
import { buildRoom } from '../engine/kit5.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.9, 21.3, 26.7, 32.1, 37.5, 43.5, 47.5];
const shots = beats(B,
  { sc: 'room', opt: { tidyFrom: 0, tidyTo: 1, tidyAt: 5.0, tidyDur: 1.8 }, loc: 'あなたの部屋', capAt: 6.6,
    cam: { p0: [-2.5, 1.35, 0.7], p1: [-2.45, 1.33, 0.65], l0: [-0.1, 0.45, -2.0], l1: [-0.05, 0.5, -2.0], pov: { label: 'ベッドの上のあなたの目線', walk: 0 } },
    cap: '部屋が、一瞬で片付いた！', sub: ['散らかり具合（エントロピー）が減る世界（空想）'],
    stamps: [{ t: 7.4, text: 'ピカーン！', x: 600, y: 780, rot: -8, color: '#ffd23a' }], lines: [[5.0, 5.7]] },
  [
    ['room', '1', '分', 'あなたの机', 'コイン100枚、全部オモテ！', ['ふつうは約1.3×10の30乗回に1回（2の100乗）'],
      { p0: [1.9, 1.5, -0.55], p1: [1.9, 1.35, -0.85], l0: [1.9, 0.72, -1.95], l1: [1.9, 0.72, -1.95] }, { tidy: 1, coins: 'flip' },
      { stamps: [{ t: 2.0, text: 'ありえん！', x: 560, y: 800, rot: -8 }], lines: [[1.7, 2.2]] }],
    ['room', '3', '分', 'あなたの机', '毎秒投げても、宇宙の年齢の約3兆倍', ['100枚を1秒に1回投げ続けた場合（試算）'],
      { p0: [0.8, 1.5, 2.0], p1: [0.8, 1.45, 1.6], l0: [0.8, 1.3, -2.6], l1: [0.8, 1.3, -2.6] }, { tidy: 1, coins: 'spin', clock: 4 },
      { stamps: [{ t: 1.6, text: '待てない！', x: 540, y: 820, rot: 6, color: '#ff6a5a' }] }],
    ['room', '5', '分', 'あなたの部屋', 'トランプが、勝手に新品の順番に', ['並び方は 52! ＝ 約8×10の67乗通り'],
      { p0: [1.0, 1.65, 1.3], p1: [1.3, 1.35, 0.5], l0: [1.7, 0.35, -1.0], l1: [2.0, 0.6, -1.4] }, { tidy: 1, coins: 'heads', cards: 0, cardsTo: 1 },
      { stamps: [{ t: 2.3, text: 'シャキーン！', x: 560, y: 790, rot: -6, color: '#9fd0ff' }] }],
    ['room', '10', '分', 'あなたの机', '冷めたコーヒーが、勝手に熱々に', ['現実の熱は、熱い方から冷たい方へしか流れない'],
      { p0: [1.25, 1.45, -0.95], p1: [1.25, 1.38, -1.1], l0: [1.25, 0.8, -1.65], l1: [1.25, 0.82, -1.65], pov: { label: 'あなたの目線', walk: 0 } },
      { tidy: 1, coins: 'heads', cards: 1, coffee: 0.1, coffeeTo: 1, hands: 0.3 },
      { stamps: [{ t: 2.8, text: 'アチッ！', x: 580, y: 800, rot: -10, color: '#ffd23a' }], shake: [[2.8, 0.06, 0.5]] }],
    ['room', '1', '時間', 'あなたの部屋', '部屋の空気が、片側に集まる', ['6畳の空気の分子は約6×10の26乗個（試算）', 'ぜんぶ片側にそろう確率は、ほぼゼロ'],
      { p0: [-0.4, 1.75, 3.6], p1: [-0.3, 1.6, 3.0], l0: [0.3, 1.1, -1.0], l1: [0.6, 1.1, -1.0] }, { tidy: 1, coins: 'heads', cards: 1, airTo: 1 },
      { stamps: [{ t: 2.6, text: '息が…！', x: 300, y: 820, rot: 8, color: '#ffffff', size: 104 }] }],
  ],
  { sc: 'room', opt: { tidyFrom: 1, tidyTo: 0, tidyAt: 0.4, tidyDur: 2.0, coins: 'random', cards: 0 }, noCounter: true, loc: '',
    cam: { p0: [0, 2.3, 3.6], p1: [0, 2.0, 2.8], l0: [0, 0.5, -0.8], l1: [-0.2, 0.4, -0.8] },
    cap: '結論：散らかるのは、宇宙のルール', sub: ['片付けるほど、体の熱で外が散らかる（エントロピーが増える）'], gold: '片付けられないのは、物理のせい（たぶん）', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [5.05, 'sparkle', -9], [7.4, 'comic_jajean', -7],
  [11.0, 'comic_pico', -10], [12.2, 'text_tin', -9], [12.5, 'comic_surprise', -7],
  [17.5, 'comic_tsukkomi', -6],
  [21.8, 'whoosh_slide', -10], [23.6, 'text_pa', -8],
  [29.5, 'comic_shock2', -6],
  [32.6, 'whoosh_gust', -10], [34.7, 'comic_surprise', -8],
  [37.9, 'comic_fall', -8], [42.1, 'comic_chanchan', -5],
];
run({
  word: '散らかった部屋', tail: 'が勝手に片付いたら？', hookTail1: 'が', hookTail2: '勝手に片付いたら？',
  hookSub: '理研などが「散らかる法則」を量子力学で証明', countdownLabel: '世界のルールが逆転するまで', label: '逆転してから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_country', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: {
    room: () => buildRoom({ time: 'morning', seed: 512, extra: ({ scene, camera }) => {
      const hands = povHands(scene, camera, { sleeve: '#8a5ab0' });
      return (lt, gt, shot) => hands(shot.opt?.hands !== undefined ? 1 : 0, lt, shot.opt?.hands || 0, 0);
    } }),
  },
});
