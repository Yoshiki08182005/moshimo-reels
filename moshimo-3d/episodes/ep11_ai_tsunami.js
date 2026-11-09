// ep11 (アームB 逆転の応用): もしもAIで津波を干上がらせたら？
// 前提: 波 = 幅1km×高さ10m×奥行き500m = 500万m3 = 50億L
// AIの水: 研究者の推計(2023)で1回約10〜50mL → 多めに25mL。OpenAIは約0.3mL(2025) / ChatGPT 1日約25億回(OpenAI 2025)
// 必要回数 50億L÷25mL = 2000億回 = 約80日分 / 蒸発の熱 (15→100℃ + 気化2257kJ/kg) ≒ 1.3×10^16J ≒ 3.6TWh ≒ 日本の発電量(年約1兆kWh)の約1.3日分
// 10分で: 約22兆W ≒ 世界の電気(年約3万TWh=平均約3.5兆W)の約6倍 / 波の速さ √(gh): 水深10mで約36km/h、4000mで約710km/h
import { run } from '../engine/core.js';
import { buildCoast } from '../engine/kit4.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 36.5, 41.7, 47.7, 51.7];
const shots = beats(B,
  { sc: 'coast', opt: { wave: 0.1, waveTo: 0.2, waveH: 14, racks: 'assemble' }, loc: '海辺の町', capAt: 6.4,
    cam: { p0: [0, 5.2, 26], p1: [0, 4.4, 21], l0: [0, 2.0, -60], l1: [0, 1.6, -60] },
    cap: 'AIで、海の水を減らせ！', sub: ['AIは冷やすのに水を使う。1回約25mL（多めの推計）'],
    stamps: [{ t: 7.6, text: '全力！', x: 600, y: 760, rot: -10 }], shake: [[5.0, 0.6, 0.6]], lines: [[5.0, 5.6]] },
  [
    ['coast', '1', '分', '防波堤の上', '波の水、約50億リットル', ['幅1km・高さ10m・奥行き500mの波（試算）'],
      { p0: [0, 4.25, -1.6], p1: [0, 4.25, -1.9], l0: [0, 3.5, -200], l1: [0, 4.5, -200], pov: { label: '防波堤のあなたの目線', walk: 0 } },
      { wave: 0.3, waveTo: 0.42, waveH: 14, racks: true, steam: 0.15 },
      { stamps: [{ t: 1.6, text: 'デカっ！', x: 560, y: 800, rot: -8, color: '#ffd23a' }], shake: [[0.2, 0.25, 4.5]] }],
    ['coast', '3', '分', 'AIサーバーの前', '必要な質問、約2000億回', ['50億L ÷ 1回25mL（試算）'],
      { p0: [3, 6.0, 27], p1: [2, 4.8, 22.5], l0: [0, 1.5, 2], l1: [-1, 2.0, -4] }, { wave: 0.42, waveTo: 0.5, waveH: 14, racks: true, steam: 0.35 },
      { stamps: [{ t: 1.4, text: '多すぎ！', x: 540, y: 790, rot: 8 }] }],
    ['coast', '5', '分', '町の上空', '世界のChatGPTの、約80日分', ['1日約25億回（OpenAI 2025）で割ると（試算）'],
      { p0: [-70, 42, 70], p1: [-55, 36, 48], l0: [0, 0, -110], l1: [0, -2, -130] }, { wave: 0.5, waveTo: 0.58, waveH: 14, racks: true, steam: 0.6 },
      { stamps: [{ t: 1.5, text: '間に合わない！', x: 520, y: 820, rot: -6, color: '#ff6a5a', size: 104 }] }],
    ['coast', '8', '分', '防波堤', '蒸発の熱、日本の電気の約1.3日分', ['水を100℃にして蒸発させる熱で（試算）'],
      { p0: [22, 3.8, -1.2], p1: [18, 4.4, -1.4], l0: [-20, 6, -45], l1: [-24, 9, -45] }, { wave: 0.58, waveTo: 0.64, waveH: 14, shrink: 0.9, racks: true, steam: 1 },
      { stamps: [{ t: 1.3, text: 'アツっ！', x: 560, y: 800, rot: -10, color: '#ffd23a' }], lines: [[1.2, 1.7]] }],
    ['coast', '10', '分', '防波堤', '10分でやるなら、世界の電気の約6倍', ['必要な力は約22兆W。世界の電気は平均約3.5兆W（試算）'],
      { p0: [4, 6.2, 0.5], p1: [3, 7.5, 2], l0: [0, -7, -30], l1: [0, -8, -34] }, { seaFrom: 0, sea: 1, drainDur: 3, racks: true, steam: 1 },
      { stamps: [{ t: 2.3, text: 'ピチピチ', x: 360, y: 760, rot: 6, color: '#9fd0ff', size: 92 }, { t: 3.6, text: 'ムリ〜！', x: 620, y: 860, rot: -8 }], shake: [[0.4, 0.5, 2.4]] }],
    ['coast', '1', '時間', '海辺の町', '蒸発した水は、雨で戻ってくる', ['水は消えない。空にのぼって雲になるだけ'],
      { p0: [-15, 4.3, -1.3], p1: [-11, 4.3, -1.3], l0: [-13, 10, -80], l1: [-9, 13, -80], pov: { label: '防波堤のあなたの目線', walk: 1.2 } },
      { sea: 0, clouds: true, rain: 1, racks: 'off', steam: 0.3, noPeople: true },
      { stamps: [{ t: 1.4, text: 'ザーッ', x: 520, y: 800, rot: 0, color: '#cfe3f5', size: 112 }], dark: [0.2, 0.25] }],
  ],
  { sc: 'coast', opt: { sea: 0, racks: 'off', noPeople: true, hands: 1 }, noCounter: true, loc: '',
    cam: { p0: [0, 1.6, 26], p1: [0, 13.5, 88], l0: [0, 6, 120], l1: [0, 22, 170], pov: { label: '高台へ走るあなたの目線', walk: 2.6, bob: 0.08 } },
    cap: '結論：津波には、AIより高台', sub: ['岸の近くでも波は時速約36km。走っても追いつかれる（試算）'], gold: '警報が出たら、すぐ高い所へ', goldAt: 3.0,
    stamps: [{ t: 4.5, text: 'すぐ高台へ！', x: 520, y: 860, rot: -4, color: '#ffffff', size: 96, dur: 1.5 }] });

const extra = [
  [0.3, 'quake', -16], [5.0, 'vanish_warp', -8], [7.6, 'comic_jajean', -8],
  [10.6, 'quake', -10], [12.1, 'comic_shock2', -7],
  [17.1, 'comic_surprise', -8],
  [22.4, 'comic_tsukkomi', -6],
  [27.4, 'whoosh_gust', -10], [27.4, 'comic_pico', -10],
  [33.6, 'comic_boyon', -9], [34.9, 'comic_fall', -7],
  [36.6, 'whoosh_gust', -9], [37.9, 'whoosh_slide', -12],
  [46.2, 'end_kira', -9],
];
run({
  word: 'AI', tail: 'で津波を干上がらせたら？', hookTail1: 'で', hookTail2: '津波を干上がらせたら？',
  hookSub: '海辺の町。沖に大きな波が見えた…', countdownLabel: 'AIフル稼働まで', label: 'フル稼働から',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_wind', 41.7]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[7], outro: B[8] },
  scenes: {
    coast: () => buildCoast({ time: 'noon', seed: 311, extra: ({ scene, camera }) => {
      const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
      return (lt, gt, shot) => { const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, 0, pv?.walk ?? 0); };
    } }),
  },
});
