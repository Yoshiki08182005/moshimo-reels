// ep16 (アームA 原因を拡大): もしも地球の自転が速くなったら？
// 前提: 半径6378km(赤道) 自転周期(恒星日)86164s 標準重力9.78m/s2 / 遠心加速度=(kω)²R
// x2: 1日約12h 赤道速度約3,350km/h 遠心0.136 → 重力の1.4%減 60kg→約59.2kg
// x5: 約4.8h 約8,370km/h 8.7%減 60→54.8kg / x10: 約2.4h 約16,700km/h 34.7%減 60→39.2kg
// x17: 約85分 赤道の遠心力＝重力(人工衛星の速さ約7.9km/s) → 赤道で無重力
// 出典: 国立天文台 理科年表(地球の大きさ・自転周期)
import { run, THREE, box, basic } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.9, 21.3, 26.7, 32.1, 37.5, 43.5, 47.5];
const mk = (time) => () => buildStreet({ time, seed: time === 'night' ? 191 : 192, extra: ({ scene, camera }) => {
  const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(14, 20, 14), basic('#ffd23a')); scene.add(sun); sun.visible = false;
  const items = [];
  for (let i = 0; i < 14; i++) {
    const m = box(0.7, 0.7, 0.7, i % 2 ? '#ff6a5a' : '#6ab7ff', -6 + (i % 7) * 2, 0.35, 4 + Math.floor(i / 7) * 3, scene);
    items.push({ m, x: m.position.x, z: m.position.z, k: 0.5 + (i * 0.37) % 1 });
  }
  return (lt, gt, shot) => {
    const op = shot.opt || {};
    const spin = op.spin ?? 0;
    sun.visible = spin > 0;
    if (spin > 0) {
      const ph = (op.sun0 ?? 0.3) + lt * spin * 0.12;
      const a = Math.PI * (0.1 + 0.8 * (ph % 1));
      sun.position.set(-Math.cos(a) * 55, Math.sin(a) * 40 + 12, -150);
    }
    const f = op.fl ?? 0;
    items.forEach((o) => { const u = Math.max(0, f * 1.2 - 0.1) * o.k; o.m.position.y = 0.35 + u * Math.min(lt, 4) * 3 * (1 + o.k); o.m.rotation.x = u * lt * 2; });
    const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, op.reach ?? 0, pv?.walk ?? 0);
  };
} });

const shots = beats(B,
  { sc: 'day', opt: { spin: 1, sun0: 0.05 }, loc: 'いつもの交差点', capAt: 6.4,
    cam: { p0: [0, 1.55, 14], p1: [0, 1.6, 13], l0: [-10, 22, -100], l1: [0, 26, -100], pov: { label: 'あなたの目線', walk: 0 } },
    cap: '太陽が、爆速で動き出した！', sub: ['地球の自転が2倍になる世界（空想）'],
    stamps: [{ t: 7.2, text: 'ビュン！', x: 600, y: 780, rot: -8, color: '#ffd23a' }], shake: [[5.0, 0.6, 0.6]], lines: [[5.0, 5.7]] },
  [
    ['day', '×2', '', '空を見上げる', '1日は12時間。赤道は時速約3,350km', ['今の約1,670km/hの2倍。朝も夜も2倍の速さ（試算）'],
      { p0: [0, 1.55, 14], p1: [0, 1.7, 13], l0: [-10, 28, -100], l1: [10, 32, -100], pov: { label: '2倍の世界のあなたの目線', walk: 0 } }, { spin: 2, sun0: 0.1 },
      { stamps: [{ t: 1.8, text: 'はやっ！', x: 560, y: 800, rot: -8, color: '#ffd23a' }], shake: [[0.2, 0.25, 3]] }],
    ['day', '×2', '', '体重計', '体重60kgが、約59.2kgに', ['遠心力で赤道の重力が約1.4%減る（試算）'],
      { p0: [0, 1.55, 14], p1: [0, 1.5, 13], l0: [0, 0.9, 0], l1: [0, 0.6, 0], pov: { label: 'あなたの目線', walk: 0 } }, { spin: 2, sun0: 0.4, reach: 0.6 },
      { stamps: [{ t: 1.6, text: 'ちょい軽い', x: 540, y: 800, rot: 8, color: '#6ab7ff' }] }],
    ['day', '×5', '', '町の上空', '1日は約4.8時間。体重は約9%減', ['60kg→約54.8kg。赤道は時速約8,370km（試算）'],
      { p0: [0, 1.55, 14], p1: [0, 1.6, 12], l0: [0, 6, -20], l1: [0, 9, -20], pov: { label: 'あなたの目線', walk: 1.2 } }, { spin: 5, sun0: 0.2, fl: 0.15 },
      { stamps: [{ t: 1.5, text: 'フワッ！', x: 500, y: 820, rot: -6, color: '#6ab7ff', size: 100 }], lines: [[1.4, 2.0]] }],
    ['day', '×10', '', '大通り', '体重は約35%減。60kgが約39kg', ['1日は約2.4時間。赤道は時速約16,700km（試算）'],
      { p0: [0, 1.55, 14], p1: [0, 1.8, 13], l0: [0, 6, -20], l1: [0, 10, -20], pov: { label: 'あなたの目線', walk: 0 } }, { spin: 10, sun0: 0.6, fl: 0.5 },
      { stamps: [{ t: 1.6, text: 'ういてる！', x: 560, y: 800, rot: -8, color: '#ffffff' }], shake: [[0.6, 0.4, 2]] }],
    ['day', '×17', '', '赤道の町', '約17倍で、赤道は無重力に', ['1日は約85分。遠心力＝重力（試算）'],
      { p0: [0, 1.55, 14], p1: [0, 3, 13], l0: [0, 8, -20], l1: [0, 16, -20], pov: { label: '浮かぶあなたの目線', walk: 0 } }, { spin: 17, sun0: 0.8, fl: 1, reach: 0.9 },
      { stamps: [{ t: 2.0, text: 'とんでく〜！', x: 560, y: 800, rot: -10, color: '#ffd23a' }], lines: [[1.8, 2.3]] }],
  ],
  { sc: 'day', opt: { spin: 0 }, noCounter: true, loc: '',
    cam: { p0: [0, 2.0, 16], p1: [0, 2.4, 13], l0: [0, 4, -40], l1: [0, 4, -40] },
    cap: '結論：今の自転は、ちょうどいい', sub: ['1日24時間は、奇跡のバランス（国立天文台のデータで試算）'], gold: '1日24時間に、感謝', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [7.2, 'comic_jajean', -7],
  [12.2, 'comic_shock2', -7], [17.5, 'comic_surprise', -8],
  [22.8, 'comic_tsukkomi', -6], [27.7, 'comic_fall', -8], [28.0, 'whoosh_gust', -10],
  [33.2, 'comic_pico', -9], [34.1, 'comic_surprise', -7],
  [42.1, 'comic_chanchan', -5],
];
run({
  word: '地球の自転', tail: 'が2倍速くなったら？', hookTail1: 'が', hookTail2: '2倍速くなったら？',
  hookSub: 'いつもの交差点で、空を見上げる', countdownLabel: '自転が2倍になるまで', label: '2倍になってから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { day: mk('noon'), night: mk('night') },
});
