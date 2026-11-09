// ep14 (アームB 逆転の応用・ep11の改良版): もしもAIを連打して津波を止めたら？
// 参考: 海外リール「100ftの津波→ChatGPTを連打して水を使い切れ」→海が干上がるオチ（題材の発想のみ。台本・映像は独自）
// 改良点: 冒頭に30mの波を大きく見せる／到着までの実時間カウントダウン40秒を最後まで通す／0秒で津波が消えて回避（フック回収）
// 前提: 波 = 幅1km×高さ30m×奥行き200m = 600万m3 = 60億L（25mプール約40万L → 約1万5千杯）
// AIの水: Li et al.(2023) 1回の回答で約10〜50mL → 約25mL。60億L÷25mL = 2400億回
// 1人で1秒1回: 2400億秒 ≒ 約7600年 / 世界人口 約80億人 → 1人30回、1秒3回で10秒 / ChatGPT 1日約25億回(OpenAI 2025) → 約96日 ≒ 約3か月分
import { THREE, box } from '../engine/core.js';
import { run } from '../engine/core.js';
import { plane } from '../engine/kit2.js';
import { buildCoast } from '../engine/kit4.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const ARRIVE = 40.0; // the wave would hit at gt=40 (clock reads 0.00)
const B = [0, 10.5, 16.0, 21.0, 26.0, 31.5, 38.0, 46.0, 50.0];
const POVL = '防波堤の上のあなたの目線';
const shots = beats(B,
  { sc: 'coast', opt: { wave: 0.8, waveTo: 0.81, waveH: 30, racks: 'assemble', boat: true, steam: 0.05 }, loc: '防波堤の上', capAt: 6.2,
    cam: { p0: [-6, 4.3, -1.4], p1: [-3, 5.2, 21], l0: [-8, 17, -100], l1: [-1, 2.5, -30], hold: 5.0 },
    cap: 'AIに、津波の水を飲ませろ！', sub: ['AIはサーバーを冷やすのに水を使う', '1回で約25mL＝ひと口ぶん（研究者の推計）'],
    stamps: [{ t: 7.4, text: 'ゴクッ', x: 600, y: 800, rot: -8, color: '#5ad1ff' }], shake: [[0.0, 0.35, 5.0], [5.0, 0.6, 0.6]], lines: [[5.0, 5.6]] },
  [
    ['coast', undefined, '', '防波堤の上', '津波の水は、約60億リットル', ['25mプール、約1万5千杯分', '幅1km×高さ30m×奥行き200mで試算'],
      { p0: [-4, 4.25, -1.6], p1: [-4, 4.25, -1.9], l0: [-6, 4, -100], l1: [-6, 20, -100], pov: { label: POVL, walk: 0 } },
      { wave: 0.81, waveTo: 0.83, waveH: 30, racks: true, boat: true, steam: 0.1 },
      { stamps: [{ t: 1.6, text: 'デカっ！', x: 560, y: 820, rot: -8, color: '#ffd23a' }], shake: [[0.2, 0.22, 5.0]] }],
    ['coast', undefined, '', 'AIサーバーの前', '必要な連打、約2400億回', ['60億L ÷ ひと口25mL（試算）', 'ChatGPT全体の約3か月分（1日約25億回）'],
      { p0: [7, 3.0, 19], p1: [4, 4.2, 15.5], l0: [0, 2, 8], l1: [-3, 7, -40] }, { wave: 0.83, waveTo: 0.85, waveH: 30, racks: true, boat: true, steam: 0.3 },
      { stamps: [{ t: 1.4, text: '多すぎ！', x: 540, y: 800, rot: 8 }] }],
    ['coast', undefined, '', 'ノートPCで連打中', '1人で連打すると、約7600年', ['1秒に1回、寝ずに押し続けても（試算）'],
      { p0: [-4, 4.25, -1.4], p1: [-4, 4.2, -1.5], l0: [-6, 6, -100], l1: [-6, 4, -100], pov: { label: 'ノートPCで連打するあなたの目線', walk: 0 } },
      { wave: 0.85, waveTo: 0.87, waveH: 30, racks: true, boat: true, laptop: true, steam: 0.15 },
      { stamps: [{ t: 0.6, text: 'カタカタカタ', x: 520, y: 760, rot: 4, color: '#ffffff', size: 92, dur: 1.6 }, { t: 2.4, text: '間に合わない！', x: 520, y: 860, rot: -6, color: '#ff6a5a', size: 104 }], lines: [[2.3, 2.9]] }],
    ['coast', undefined, '', '世界中', '世界中の80億人で、一斉に連打！', ['1人30回。1秒3回なら、たった10秒（試算）'],
      { p0: [-50, 30, 60], p1: [-36, 25, 40], l0: [0, 8, -90], l1: [0, 6, -100] },
      { wave: 0.87, waveTo: 0.885, waveH: 30, shrink: 0.8, shrinkDur: 5.5, racks: true, boat: true, steam: 0.8 },
      { stamps: [
        { t: 0.3, text: '#津波を止めろ', x: 520, y: 700, rot: -5, color: '#5ad1ff', size: 84, dur: 1.6 },
        { t: 0.9, text: 'ポチッ', x: 300, y: 880, rot: -12, color: '#ffffff', size: 76, dur: 1.2 },
        { t: 1.1, text: 'ポチッ', x: 760, y: 820, rot: 10, color: '#ffffff', size: 76, dur: 1.2 },
        { t: 1.3, text: 'ポチッ', x: 420, y: 980, rot: 6, color: '#ffffff', size: 76, dur: 1.2 },
        { t: 1.5, text: 'ポチッ', x: 700, y: 1000, rot: -8, color: '#ffffff', size: 76, dur: 1.2 },
        { t: 2.2, text: '全人類で連打！', x: 520, y: 860, rot: -6, color: '#ffd23a', size: 108, dur: 2.4 },
      ], lines: [[2.1, 2.9]], shake: [[2.1, 0.4, 1.2]] }],
    ['coast', undefined, '', '防波堤', '津波が、みるみる縮んでいく！', ['飲んだ水は、湯気になって空へ'],
      { p0: [44, 15, 8], p1: [36, 12, 3], l0: [-8, 3, -50], l1: [-10, 2, -50] },
      { wave: 0.885, waveTo: 0.9, waveH: 24, shrink: 0.4, shrinkDur: 6.0, racks: true, boat: true, steam: 1 },
      { stamps: [{ t: 1.2, text: 'シュワ〜', x: 520, y: 780, rot: -4, color: '#cfe3f5', size: 104 }, { t: 3.8, text: 'いける…!?', x: 540, y: 880, rot: 6, color: '#ffd23a', size: 96 }] }],
  ],
  { sc: 'coast', loc: '防波堤の上', capAt: 2.3,
    opt: { wave: 0.9, waveTo: 0.91, waveH: 9.6, shrink: 0, shrinkAt: 0, shrinkDur: 2.0, seaFrom: 0, sea: 1, drainAt: 2.0, drainDur: 2.6, racks: 'off', boat: true, steam: 0.5 },
    cam: { p0: [-4, 4.25, -1.6], p1: [-4, 4.25, -1.7], l0: [-1, 5, -100], l1: [-9, -7, -45], hold: 2.4, dur: 6.0, pov: { label: POVL, walk: 0 } },
    cap: 'AI連打で、津波ストップ！', sub: ['…連打しすぎて、海まで干上がった'], gold: '※本物の津波は止められない。すぐ高台へ', goldAt: 4.8,
    stamps: [
      { t: 2.0, text: 'セーフ！！', x: 540, y: 800, rot: -6, color: '#ffd23a', size: 140, dur: 1.9 },
      { t: 4.0, text: 'え、海まで!?', x: 540, y: 860, rot: 6, color: '#9fd0ff', size: 92, dur: 1.6 },
      { t: 5.7, text: 'ピチピチ', x: 760, y: 900, rot: 6, color: '#ffffff', size: 84, dur: 1.8 },
    ], lines: [[2.0, 2.7]], shake: [[2.0, 0.3, 0.6]] });

// laptop held in the POV (screen = a generic chat app, no brand)
function povLaptop(camera) {
  const g = new THREE.Group(); camera.add(g); g.visible = false;
  g.position.set(0, -0.56, -1.0); g.rotation.x = 0.5;
  box(0.66, 0.025, 0.44, '#2b2d31', 0, 0, 0, g, false);
  box(0.58, 0.004, 0.2, '#141518', 0, 0.014, -0.04, g, false);
  box(0.2, 0.004, 0.1, '#3a3d42', 0, 0.014, 0.15, g, false);
  const lid = new THREE.Group(); lid.position.set(0, 0.012, -0.22); lid.rotation.x = -0.9; g.add(lid);
  box(0.66, 0.42, 0.015, '#2b2d31', 0, 0.21, 0, lid, false);
  const scr = plane(512, 320, 0.62, 0.38, (c) => {
    c.fillStyle = '#1e1f24'; c.fillRect(0, 0, 512, 320);
    c.fillStyle = '#2e3038'; c.fillRect(0, 0, 512, 44);
    c.fillStyle = '#ffffff'; c.font = 'bold 22px "BIZ UDPGothic", sans-serif'; c.textBaseline = 'middle'; c.fillText('AIチャット', 18, 22);
    const bub = (right, y, text, col) => { c.font = 'bold 20px "BIZ UDPGothic", sans-serif'; const w = c.measureText(text).width + 28, x = right ? 492 - w : 20;
      c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, 36, 14); c.fill(); c.fillStyle = '#ffffff'; c.fillText(text, x + 14, y + 18); };
    bub(true, 58, 'もう1回！', '#3b82f6'); bub(false, 100, 'はい、どうぞ！', '#3f414c');
    bub(true, 142, 'もう1回！', '#3b82f6'); bub(false, 184, 'はい、どうぞ！', '#3f414c'); bub(true, 226, 'もう1回！！', '#3b82f6');
    c.fillStyle = '#3f414c'; c.fillRect(16, 274, 420, 34); c.fillStyle = '#22c55e'; c.fillRect(446, 274, 50, 34);
    c.fillStyle = '#ffffff'; c.fillText('▶', 462, 291);
  }, true);
  scr.position.set(0, 0.21, 0.009); lid.add(scr);
  return (on) => { g.visible = !!on; };
}

const typing = (t0, n, gap = 0.13) => Array.from({ length: n }, (_, i) => [t0 + i * gap, 'text_touch', -15]);
const extra = [
  [0.2, 'quake', -13], [7.4, 'comic_eat', -8],
  [12.1, 'comic_shock2', -7], [17.4, 'comic_surprise', -8],
  ...typing(21.5, 12), [23.4, 'comic_fall', -7],
  [26.3, 'comic_pico', -11], [26.9, 'comic_pico', -12], [27.1, 'comic_pico', -12], [27.3, 'comic_pico', -12], [27.5, 'comic_pico', -12],
  [28.2, 'comic_jajean', -7],
  [32.0, 'whoosh_slide', -11], [32.7, 'vanish_hyun', -12], [35.3, 'comic_boyon', -10],
  [35.0, 'countdown_tick', -11, 5.0],
  [40.0, 'impact_don', -8], [40.05, 'comic_chanchan', -7], [40.3, 'emo_shine', -12],
  [42.0, 'comic_surprise', -9], [43.7, 'comic_boyon', -10], [44.6, 'end_kira', -10],
];
run({
  word: 'AIを連打', tail: 'して津波を止めたら？', hookTail1: 'して', hookTail2: '津波を止めたら？',
  hookSub: '高さ30mの津波。武器は、ノートPCだけ', countdownLabel: '津波の到着まで', label: '津波の到着まで',
  clock: (gt) => ARRIVE - gt,
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_wind', 40]], 4.8, 'comic_boyon').filter(c => c[1] !== 'emo_shine').concat(extra),
  music: { restore: ARRIVE, outro: B[7] },
  scenes: {
    coast: () => buildCoast({ time: 'storm', seed: 311, extra: ({ scene, camera }) => {
      const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
      const lap = povLaptop(camera);
      return (lt, gt, shot) => {
        const pv = shot.cam?.pov, typingNow = !!(pv && shot.opt?.laptop);
        lap(typingNow);
        hands(typingNow || (pv && pv.walk) ? 1 : 0, lt, typingNow ? 1 : 0, typingNow ? 14 : (pv?.walk ?? 0));
      };
    } }),
  },
});
