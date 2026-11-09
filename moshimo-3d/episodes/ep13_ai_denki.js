// ep13 (アームA 原因を拡大): もしもAIの電気が100倍になったら？
// 前提: データセンター電力 約415TWh(IEA 2024, 世界の約1.5%) ×100 = 41,500TWh / 世界の発電量 約3万TWh → 約1.4倍
// 平均電力 41,500TWh÷8766h ≒ 4.7TW = 100万kW原発 約4,700基(運転中の原発は約420基 IAEA → 約11倍)
// 太陽光 年250kWh/m2 → 約16.6万km2 = 日本(37.8万km2)の約44% / 供給そのままなら 3万÷(3万+4.1万)≒42%
// 熱: 4.7TW ≒ 人類の一次エネルギー約19TWの約1/4
import { run, THREE, box } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.9, 21.3, 26.7, 32.1, 37.5, 43.5, 47.5];
const mk = (time) => () => buildStreet({ time, seed: time === 'night' ? 161 : 171, reserve: [[-66, -8, -68, -30]], extra: ({ scene, camera }) => {
  const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
  const dcs = [];
  for (let i = 0; i < 48; i++) {
    const g = new THREE.Group(); g.position.set(-62 + (i % 8) * 7, 0, -64 + Math.floor(i / 8) * 6); scene.add(g);
    box(5, 4, 5, '#cfd5dc', 0, 2, 0, g); box(5.05, 0.3, 0.1, '#3cff8a', 0, 3.2, 2.52, g); box(5.05, 0.3, 0.1, '#3cff8a', 0, 1.2, 2.52, g);
    dcs.push(g);
  }
  return (lt, gt, shot) => {
    const op = shot.opt || {};
    let f = op.dc ?? 0.05;
    if (op.dcRamp) f = 0.04 + (1 - 0.04) * Math.min(1, Math.max(0, (lt - 5.0) / 1.6));
    dcs.forEach((g, i) => { const s = Math.min(1, Math.max(0, f * 48 - i)); g.visible = s > 0.02 || i < 2; g.scale.set(1, Math.max(0.05, s) * (1 + f * 2.2), 1); });
    const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, 0, pv?.walk ?? 0);
  };
} });

const shots = beats(B,
  { sc: 'day', opt: { dcRamp: true }, loc: 'いつもの交差点', capAt: 6.4,
    cam: { p0: [-10, 1.55, 10], p1: [-10.4, 1.55, 9], l0: [-36, 5, -40], l1: [-36, 7, -40], pov: { label: 'あなたの目線', walk: 0 } },
    cap: 'データセンターが、増殖した！', sub: ['AIの電気が100倍になる世界（空想）'],
    stamps: [{ t: 7.2, text: 'ドーン！', x: 600, y: 780, rot: -8, color: '#ffd23a' }], shake: [[5.0, 0.6, 0.6]], lines: [[5.0, 5.7]] },
  [
    ['day', '1', '年', 'データセンター街', '電気の量、世界の発電量の約1.4倍', ['今は約415TWh（IEA 2024）。×100で約41,500TWh（試算）'],
      { p0: [12, 34, 44], p1: [-4, 28, 28], l0: [-36, 2, -45], l1: [-36, 2, -45] }, { dc: 1 },
      { stamps: [{ t: 1.8, text: 'デカっ！', x: 560, y: 800, rot: -8, color: '#ffd23a' }], shake: [[0.2, 0.25, 3]] }],
    ['day', '3', '年', '発電所の前', '原発が、約10倍ほど足りない', ['必要な電力は約4.7TW＝100万kW原発 約4,700基。運転中は約420基（IAEA）'],
      { p0: [-74, 9, -16], p1: [-74, 8, -30], l0: [-38, 3, -48], l1: [-38, 3, -48] }, { dc: 1 },
      { stamps: [{ t: 1.6, text: '足りない！', x: 540, y: 800, rot: 8, color: '#ff6a5a' }] }],
    ['day', '5', '年', '町の上空', '太陽光なら、日本の約44%がパネル', ['年250kWh/m²で計算すると約16.6万km²（試算）'],
      { p0: [-60, 70, 50], p1: [-50, 62, 20], l0: [-30, 0, -40], l1: [-30, 0, -45] }, { dc: 1 },
      { stamps: [{ t: 1.5, text: '国が埋まる！', x: 500, y: 820, rot: -6, color: '#ff6a5a', size: 100 }] }],
    ['night', '6', '年', '夜の交差点', '電気の取り合いで、約42%しか届かない', ['供給は今のまま、ほかの需要も同じなら（試算）'],
      { p0: [-9, 1.55, 11], p1: [-9, 1.55, 3], l0: [0, 3, -10], l1: [0, 3, -14], pov: { label: '停電の夜のあなたの目線', walk: 1.8 } }, { dc: 1 },
      { stamps: [{ t: 1.6, text: 'プツン…', x: 560, y: 800, rot: -8, color: '#ffffff' }], dark: [0.6, 0.5], shake: [[0.6, 0.4, 2]] }],
    ['day', '10', '年', 'データセンター街', '熱だけで、人類の全エネルギーの約1/4', ['4.7TWはすべて熱になる。人類は約19TW使用（試算）'],
      { p0: [-2, 20, -8], p1: [-8, 17, -22], l0: [-38, 3, -48], l1: [-38, 3, -48] }, { dc: 1 },
      { stamps: [{ t: 2.0, text: 'アツっ！', x: 560, y: 800, rot: -10, color: '#ffd23a' }], lines: [[1.8, 2.3]] }],
  ],
  { sc: 'day', opt: { dc: 0.05 }, noCounter: true, loc: '',
    cam: { p0: [-10, 2.0, 12], p1: [-10, 2.4, 9], l0: [-36, 4, -40], l1: [-36, 4, -40] },
    cap: '結論：増やすより、省エネが先', sub: ['今のAIは世界の電気の約1.5%（IEA 2024）。賢く使えば100倍は不要'], gold: 'AIの未来は、省エネ次第', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [7.2, 'comic_jajean', -7],
  [12.2, 'comic_shock2', -7], [17.5, 'comic_surprise', -8],
  [22.8, 'comic_tsukkomi', -6], [27.7, 'comic_fall', -8], [28.0, 'whoosh_gust', -10],
  [33.2, 'comic_pico', -9], [34.1, 'comic_surprise', -7],
  [42.1, 'comic_chanchan', -5],
];
run({
  word: 'AIの電気', tail: 'が100倍になったら？', hookTail1: 'が', hookTail2: '100倍になったら？',
  hookSub: '町はずれの、データセンター', countdownLabel: 'AIの電気が100倍になるまで', label: '100倍になってから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { day: mk('noon'), night: mk('night') },
});
