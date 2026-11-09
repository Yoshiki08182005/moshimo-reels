// ep15 (アームC ニュース起点・季節の天文イベント): もしも流れ星が燃え尽きずに落ちてきたら？
// 話題: 11月はしし座流星群の季節（毎年11月17日ごろ極大・国立天文台）。流星の速さ 約71km/s（国立天文台）
// 前提: 粒1g(明るい流れ星の目安) v=71km/s → KE=½mv²=2.52MJ / 時速100km乗用車1t=0.386MJ → 約6.5台
// TNT 1kg=4.184MJ → 約0.6kg / 東京〜大阪400km÷71=約5.6秒 / 71km/s=時速25.6万km=音速(340m/s)の約209倍
// 大気: 1m2あたり 101325Pa÷9.8 ≒ 10.3t / 1時間15個(極大時の目安)×0.6kg ≒ 9kg
import { run, THREE, box, basic } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { povHands, dustBurst, crater } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 16.0, 21.5, 27.0, 32.5, 38.0, 44.0, 48.0];
const SITES = [[0, -12], [-7, -22], [8, -24], [-15, -36], [13, -40]];
const D = new THREE.Vector3(0.55, -0.7, 0.45).normalize();

const mk = () => buildStreet({ time: 'night', seed: 181, extra: ({ scene, camera }) => {
  const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
  const N = 16, streaks = [];
  for (let i = 0; i < N; i++) {
    const m = box(0.4, 0.4, 18, basic('#fff1b8'), 0, 0, 0, scene, false); m.visible = false;
    streaks.push({ m, sx: -70 + ((i * 37) % 17) * 8, sz: -140 + ((i * 53) % 11) * 7, ph: (i * 0.618) % 1 });
  }
  const layer = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: '#6ab7ff', transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }));
  layer.rotation.x = Math.PI / 2; layer.position.y = 70; layer.visible = false; scene.add(layer);
  const sites = SITES.map(([x, z]) => {
    const ball = new THREE.Group(); scene.add(ball); ball.visible = false;
    box(1.6, 1.6, 9, basic('#ffb347'), 0, 0, 0, ball, false); box(0.8, 0.8, 22, basic('#fff1b8'), 0, 0, 12, ball, false);
    return { x, z, ball, dust: dustBurst(scene, x, z, 5, 60, 5 + x), cr: crater(scene, x, z, 5), flash: box(2.5, 2.5, 2.5, basic("#ffffff"), x, 2, z, scene, false) };
  });
  const dir = D.clone();
  return (lt, gt, shot) => {
    const op = shot.opt || {}, cnt = op.meteors ?? 0, burnY = op.burnY ?? 55, rate = op.rate ?? 0.7;
    layer.visible = !!op.layer;
    streaks.forEach((s, i) => {
      const ph = (lt * rate + s.ph) % 1, dist = ph * 190;
      const y = 110 + dir.y * dist;
      s.m.visible = i < cnt && y > burnY;
      s.m.position.set(s.sx + dir.x * dist, y, s.sz + dir.z * dist);
      s.m.lookAt(s.m.position.clone().add(dir));
    });
    const hits = op.hits || [];
    sites.forEach((st, k) => {
      const h = hits.find(a => a[0] === k), at = h ? h[1] : 1e9, u = (lt - (at - 0.45)) / 0.45;
      st.ball.visible = !!h && u > 0 && u < 1;
      if (st.ball.visible) { st.ball.position.set(st.x - dir.x * 70 * (1 - u), 70 * (1 - u), st.z - dir.z * 70 * (1 - u)); st.ball.lookAt(st.ball.position.clone().add(dir)); }
      st.dust(h ? lt - at : -1);
      st.cr.visible = !!h && lt >= at;
      st.flash.visible = !!h && lt >= at && lt < at + 0.07;
    });
    const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, 0, pv?.walk ?? 0);
  };
} });

const shots = beats(B,
  { sc: 'night', opt: { meteors: 5, rate: 0.5, hits: [[0, 5.0]] }, loc: 'いつもの交差点', capAt: 6.4,
    cam: { p0: [-10, 1.55, 10], p1: [-10, 1.55, 9.5], l0: [-2, 45, -45], l1: [0, 3, -12], hold: 5.0, pov: { label: 'あなたの目線', walk: 0 } },
    cap: '流れ星が、落ちてきた！', sub: ['11月はしし座流星群の季節（空想：燃え尽きなかったら）'],
    stamps: [{ t: 7.2, text: 'ドーン！', x: 600, y: 780, rot: -8, color: '#ffd23a' }], shake: [[5.0, 0.6, 0.8]], lines: [[5.0, 5.7]] },
  [
    ['night', '1', '秒', '夜空', '秒速71km。東京〜大阪が約6秒', ['しし座流星群の速さ（国立天文台）。時速約25万km（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 1.55, 9.6], l0: [-4, 40, -50], l1: [2, 48, -45], pov: { label: '空を見上げるあなたの目線', walk: 0 } }, { meteors: 16, rate: 1.1, burnY: 30 },
      { stamps: [{ t: 1.5, text: 'ヒュンッ！', x: 540, y: 800, rot: -8, color: '#ffd23a' }], lines: [[1.3, 1.9]] }],
    ['night', '2', '秒', '落下地点の前', '豆粒1gで、車約6.5台ぶんの衝撃', ['½mv²＝約250万J。時速100kmの乗用車(1t)と比較（試算）'],
      { p0: [-9, 1.6, 6], p1: [-9.5, 1.6, 4], l0: [0, 3, -12], l1: [0, 3, -12], pov: { label: '落下を見るあなたの目線', walk: 0 } }, { meteors: 4, hits: [[0, 2.0]] },
      { stamps: [{ t: 2.0, text: 'ズドン！', x: 540, y: 800, rot: 8, color: '#ff6a5a', size: 120 }], lines: [[1.9, 2.5]], shake: [[2.0, 0.5, 1.2]] }],
    ['night', '3', '秒', '大通り', 'TNT火薬に直すと、約0.6kg', ['TNT 1kg＝約420万Jで換算（試算）'],
      { p0: [-26, 14, 24], p1: [-18, 10, 16], l0: [0, 0, -16], l1: [0, 1, -20] }, { meteors: 2, hits: [[0, 1.4], [1, 2.2], [2, 3.0]] },
      { stamps: [{ t: 1.6, text: '地面にボコッ', x: 520, y: 820, rot: -6, color: '#ffd23a', size: 96 }], shake: [[1.4, 0.4, 1.0], [2.2, 0.4, 1.0], [3.0, 0.4, 1.0]] }],
    ['night', '4', '秒', '上空100km', '空気が、毎秒それを止めている', ['頭の上は1m²あたり約10tの空気。高度約100kmで燃え尽きる（試算）'],
      { p0: [-30, 40, 40], p1: [-20, 46, 30], l0: [0, 62, -60], l1: [5, 64, -60] }, { meteors: 16, rate: 0.9, burnY: 70, layer: true },
      { stamps: [{ t: 1.6, text: 'ジュッ！', x: 540, y: 800, rot: 6, color: '#ff9a3a', size: 100 }, { t: 3.3, text: '空気、ありがとう', x: 520, y: 880, rot: -4, color: '#9fd0ff', size: 80 }] }],
    ['night', '5', '時間', '交差点', '1時間15個、全部届くと約9kg分', ['極大時の目安15個/時×0.6kg（試算）。実際はほぼ空で燃え尽きる'],
      { p0: [-11, 1.55, 10], p1: [-11, 1.55, 9.2], l0: [0, 3, -22], l1: [0, 3, -28], pov: { label: '流星雨の下のあなたの目線', walk: 0 } }, { meteors: 3, hits: [[0, 0.8], [1, 1.5], [2, 2.1], [3, 2.8], [4, 3.4]] },
      { stamps: [{ t: 1.0, text: 'ドン！', x: 300, y: 800, rot: -10, color: '#ffffff', size: 90 }, { t: 2.8, text: '降りすぎ！', x: 540, y: 880, rot: 6, color: '#ff6a5a', size: 108 }], shake: [[0.8, 0.3, 1], [1.5, 0.3, 1], [2.1, 0.3, 1], [2.8, 0.3, 1], [3.4, 0.3, 1]], lines: [[2.7, 3.3]] }],
  ],
  { sc: 'night', opt: { meteors: 6, rate: 0.4, burnY: 55 }, noCounter: true, loc: '',
    cam: { p0: [-10, 1.7, 12], p1: [-10, 1.9, 11], l0: [-2, 45, -45], l1: [2, 50, -45] },
    cap: '結論：流れ星は、空気がくれた花火', sub: ['燃え尽きるから、安心して願いごとができる'], gold: '11月中旬は、しし座流星群', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [5.1, 'quake', -9], [7.2, 'comic_jajean', -7],
  [11.5, 'whoosh_gust', -10], [12.2, 'comic_shock2', -7],
  [18.0, 'impact_don', -8], [18.2, 'comic_fall', -8],
  [22.9, 'impact_don', -9], [23.6, 'comic_tsukkomi', -6], [24.4, 'impact_don', -9], [25.2, 'impact_don', -9],
  [29.0, 'flash', -12], [29.4, 'comic_surprise', -8],
  [33.3, 'impact_don', -9], [34.0, 'impact_don', -9], [34.6, 'impact_don', -9], [35.3, 'impact_don', -9], [35.9, 'impact_don', -9], [35.4, 'comic_pico', -9],
  [42.1, 'comic_chanchan', -5],
];
run({
  word: '流れ星', tail: 'が燃え尽きずに落ちたら？', hookTail1: 'が', hookTail2: '燃え尽きずに落ちたら？',
  hookSub: '11月は、しし座流星群の季節', countdownLabel: '流れ星が落ちてくるまで', label: '落ちてから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_night', 38]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { night: mk },
});
