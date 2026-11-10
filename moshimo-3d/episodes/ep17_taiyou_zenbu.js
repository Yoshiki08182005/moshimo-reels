// ep17 (アームB 逆転の応用): もしも太陽のエネルギーを全部使えたら？
// 前提: 太陽光度3.828e26W / 太陽定数1361W/m2 地球半径6371km → 地球が受ける1.74e17W
// 人類の消費: 592EJ/年(2024) ÷3.156e7s ≒ 18.8TW
// 地球に届く光=人類の約9,250倍(1時間で約1.05年分) / 太陽全出力=人類の約20兆倍 / 太陽1秒=約65万年分
// 80億人で等分 約4.7京W/人=今の人類の約2,500倍 / 海(1.37e21kg)を17℃→蒸発 3.6e27J=太陽の約9.3秒 / 地球が受けるのは太陽の約22億分の1
// 出典: Energy Institute Statistical Review of World Energy 2025(2024年の一次エネルギー592EJ)、国立天文台 理科年表(太陽)
import { run, THREE, box, basic } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.9, 21.3, 26.7, 32.1, 37.5, 43.5, 47.5];
const mk = (time) => () => buildStreet({ time, seed: time === 'night' ? 201 : 202, extra: ({ scene, camera }) => {
  const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(14, 20, 14), basic('#ffd23a')); scene.add(sun);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(14, 20, 14), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.35 })); scene.add(halo);
  const steam = [];
  for (let i = 0; i < 16; i++) {
    const m = box(1.2, 1.2, 1.2, '#ffffff', -18 + (i % 8) * 2.3, 0.6, -6 - Math.floor(i / 8) * 4, scene);
    steam.push({ m, x: m.position.x, z: m.position.z, k: 0.5 + (i * 0.37) % 1 }); m.visible = false;
  }
  return (lt, gt, shot) => {
    const op = shot.opt || {};
    let s = op.sunS ?? 0.7;
    if (shot.hook) s = lt < 5 ? 0.5 : 0.5 + Math.min(1, (lt - 5) / 1.5) * 1.3;
    sun.scale.setScalar(s); halo.scale.setScalar(s * 1.25);
    sun.position.set(0, 24 + s * 6, -140); halo.position.copy(sun.position);
    const st = op.steam ?? 0;
    steam.forEach((o) => { o.m.visible = st > 0; const u = (lt * 0.5 * o.k) % 1; o.m.position.y = 0.6 + u * 14 * st; o.m.scale.setScalar(1 + u * 2); });
    const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, op.reach ?? 0, pv?.walk ?? 0);
  };
} });

const C = (l, w = 0) => ({ p0: [-10, 1.55, 10], p1: [-10, 1.65, 9], l0: [0, 24, -100], l1: [0, 28, -100], pov: { label: l, walk: w } });
const shots = beats(B,
  { sc: 'day', loc: 'いつもの交差点', capAt: 6.4,
    cam: { p0: [0, 1.55, 14], p1: [0, 1.6, 13], l0: [0, 22, -100], l1: [0, 28, -100], pov: { label: 'あなたの目線', walk: 0 } },
    cap: '太陽がギラギラ巨大化！', sub: ['地球に届く光は人類の消費の約9,250倍（試算）'],
    stamps: [{ t: 7.2, text: 'ギラッ！', x: 560, y: 780, rot: -8, color: '#ffd23a' }], shake: [[5.0, 0.6, 0.6]], lines: [[5.0, 5.7]] },
  [
    ['day', '×9,250', '', '空を見上げる', '1時間の日光で人類の1年分', ['地球に届く光は約1.7×10^17W、人類は約19TW（試算）'],
      C('あなたの目線'), { sunS: 1.6 },
      { stamps: [{ t: 1.8, text: 'えっ！', x: 560, y: 800, rot: -8, color: '#ffd23a' }], shake: [[0.2, 0.25, 3]] }],
    ['day', '×20兆', '', '宇宙から見た太陽', '太陽の全出力は人類の約20兆倍', ['太陽の1秒で、人類の約65万年分（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 1.9, 9], l0: [0, 30, -100], l1: [0, 32, -100], pov: { label: 'あなたの目線', walk: 0 } }, { sunS: 2.2 },
      { stamps: [{ t: 1.6, text: 'ケタちがい', x: 520, y: 800, rot: 8, color: '#ff6a5a' }] }],
    ['day', '×2,500', '', '80億人で山分け', '1人あたり約4.7京ワット', ['今の人類全体の約2,500倍を、1人で使える（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 1.6, 9], l0: [0, 6, -10], l1: [0, 12, -30], pov: { label: '4.7京Wのあなたの目線', walk: 1.2 } }, { sunS: 2.4 },
      { stamps: [{ t: 1.5, text: 'つかいきれん！', x: 480, y: 820, rot: -6, color: '#6ab7ff', size: 96 }], lines: [[1.4, 2.0]] }],
    ['day', '9秒', '', '海のほとりで', '海を全部蒸発させるのに約9秒', ['海の水を沸かして蒸発させる熱は約3.6×10^27J（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 1.8, 9], l0: [0, 14, -40], l1: [0, 22, -60], pov: { label: '蒸発する海のあなたの目線', walk: 0 } }, { sunS: 2.6, steam: 1, reach: 0.8 },
      { stamps: [{ t: 1.6, text: 'ジュワ〜！', x: 540, y: 800, rot: -8, color: '#ffffff' }], shake: [[0.6, 0.4, 2]] }],
    ['day', '1/22億', '', '地球の位置', '地球が受けるのは太陽の22億分の1', ['それでも今の人類の約9,250倍。まだ使えていない（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 2.2, 9], l0: [0, 20, -100], l1: [0, 30, -100], pov: { label: 'あなたの目線', walk: 0 } }, { sunS: 1.0 },
      { stamps: [{ t: 2.0, text: 'ちょうどいい', x: 520, y: 800, rot: -10, color: '#ffd23a' }], lines: [[1.8, 2.3]] }],
  ],
  { sc: 'day', noCounter: true, loc: '',
    cam: { p0: [0, 2.0, 16], p1: [0, 2.4, 13], l0: [0, 20, -100], l1: [0, 24, -100] },
    cap: '結論：全部は要らない', sub: ['届く光のほんの一部で、文明は動かせる（出典：Energy Institute 2025）'], gold: '22億分の1で、生きている', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [7.2, 'comic_jajean', -7],
  [12.2, 'comic_shock2', -7], [17.5, 'comic_surprise', -8],
  [22.8, 'comic_tsukkomi', -6], [27.7, 'comic_fall', -8], [28.0, 'whoosh_gust', -10],
  [33.2, 'comic_pico', -9], [34.1, 'comic_surprise', -7],
  [42.1, 'comic_chanchan', -5],
];
run({
  word: '太陽のエネルギー', tail: 'を全部使えたら？', hookTail1: 'を', hookTail2: '全部使えたら？',
  hookSub: 'いつもの交差点で、空を見上げる', countdownLabel: '太陽が本気を出すまで', label: '全部使えてから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { day: mk('noon'), night: mk('night') },
});
