// ep18 (アームA 原因を拡大): もしも雨の量が10倍になったら？
// 前提: 猛烈な雨=1時間80mm以上(気象庁) / 下水の排水能力の目安=時間50mm(自治体で異なる) / ×10=500mm/h
// 路上にあふれる量=500-50=450mm/h=7.5mm/分(流れ出ない単純計算) → 10cm:13分 30cm:40分 45cm:60分 60cm:80分 2.5m:約5.6時間
// 東京23区628km2(国土地理院) ×0.5m=3.14億m3 ÷ 東京ドーム124万m3 ≒ 253杯/時
// 車が浮く目安 水深約60cm(JAF)
import { run, THREE, box } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.9, 21.3, 26.7, 32.1, 37.5, 43.5, 47.5];
const mk = (time) => () => buildStreet({ time, seed: time === 'night' ? 211 : 212, extra: ({ scene, camera }) => {
  const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
  scene.background = new THREE.Color('#59636f');
  const water = new THREE.Mesh(new THREE.BoxGeometry(400, 1, 400), new THREE.MeshBasicMaterial({ color: '#2f7fc0', transparent: true, opacity: 0.8, toneMapped: false }));
  scene.add(water); water.visible = false;
  const N = 800, drops = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 1.3, 0.025), new THREE.MeshBasicMaterial({ color: '#d6e6ff', transparent: true, opacity: 0.7, toneMapped: false }), N);
  drops.frustumCulled = false; scene.add(drops);
  const seeds = Array.from({ length: N }, (_, i) => [((i * 7919) % 1000) / 1000, ((i * 104729) % 997) / 997, ((i * 15485863) % 991) / 991]);
  const cars = [];
  const cc = ['#d9453b', '#e8e8e8', '#3b6fd9', '#f0c43a', '#555a60'];
  [[3.5, 18], [-3.5, 24], [3.5, 30], [-3.5, 36], [3.5, 42]].forEach(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    box(1.8, 0.7, 4.2, cc[i % 5], 0, 0.55, 0, g); box(1.6, 0.6, 2.2, '#9fc4e0', 0, 1.15, -0.1, g);
    cars.push({ g, x, z, k: i });
  });
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(), cp = new THREE.Vector3();
  return (lt, gt, shot) => {
    const op = shot.opt || {};
    const [w0, w1] = op.wl || [0, 0];
    const wf = op.rainAt != null ? Math.max(0, (lt - op.rainAt) / 5.5) : Math.min(1, lt / 5.4);
    const wl = w0 + (w1 - w0) * Math.min(1, wf);
    water.visible = wl > 0.005; water.position.y = wl - 0.5;
    cars.forEach((c) => { const fl = wl > 0.5 ? (wl - 0.5) * 1.2 : 0; c.g.position.y = fl + (fl > 0 ? Math.sin(lt * 2 + c.k) * 0.06 : 0); c.g.rotation.y = fl > 0 ? Math.sin(lt * 0.8 + c.k) * 0.25 : 0; });
    const on = op.rainAt != null ? lt >= op.rainAt : true;
    drops.visible = on;
    if (on) {
      camera.getWorldPosition(cp);
      const tt = op.rainAt != null ? lt - op.rainAt : lt;
      for (let i = 0; i < N; i++) {
        const sd = seeds[i];
        const y = 24 - ((sd[2] * 24 + tt * 26) % 24);
        p.set(cp.x + (sd[0] - 0.5) * 34, y, cp.z + (sd[1] - 0.5) * 34 - 6);
        m.compose(p, q, s); drops.setMatrixAt(i, m);
      }
      drops.instanceMatrix.needsUpdate = true;
    }
    const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, op.reach ?? 0, pv?.walk ?? 0);
  };
} });

const shots = beats(B,
  { sc: 'day', opt: { rainAt: 5.0, wl: [0, 0.04] }, loc: 'いつもの交差点', capAt: 6.4,
    cam: { p0: [-10, 1.6, 10], p1: [-10, 1.65, 9.4], l0: [-6, 12, -20], l1: [-6, 8, -20], pov: { label: 'あなたの目線', walk: 0 } },
    cap: '空から、滝が降ってきた！', sub: ['雨が10倍＝1時間500mmの世界（空想）', '1分に約8mm。排水なしで1時間に50cm（試算）'],
    stamps: [{ t: 7.2, text: 'ザーッ！', x: 600, y: 780, rot: -8, color: '#9fd0ff' }], shake: [[5.0, 0.6, 0.6]], lines: [[5.0, 5.7]] },
  [
    ['day', '13', '分', '交差点の上空', '13分で、道路が水深10cm', ['下水の目安は時間50mm。', '残る450mm/hが道路へ（試算）'],
      { p0: [-18, 14, 24], p1: [-14, 12, 18], l0: [0, 0, 0], l1: [0, 0, -4] }, { wl: [0.02, 0.1] },
      { stamps: [{ t: 1.8, text: 'あふれた！', x: 560, y: 800, rot: -8, color: '#9fd0ff' }], shake: [[0.2, 0.25, 3]] }],
    ['day', '40', '分', '水の中を歩く', '40分で水深30cm。歩けない', ['ひざ下でも流れで転びやすい', '450mm/h÷60＝1分に7.5mm（試算）'],
      { p0: [-10, 1.55, 11], p1: [-10, 1.55, 4], l0: [0, 0.4, -6], l1: [0, 0.4, -10], pov: { label: '冠水した道を歩くあなたの目線', walk: 1.6 } }, { wl: [0.2, 0.3] },
      { stamps: [{ t: 1.6, text: 'ジャブジャブ', x: 520, y: 800, rot: 8, color: '#ffffff' }] }],
    ['day', '60', '分', '東京の上空', '1時間で東京ドーム約250杯', ['東京23区628km²×0.5m', '÷124万m³＝約250杯（試算）'],
      { p0: [-30, 90, 60], p1: [-20, 80, 40], l0: [0, 0, -20], l1: [0, 0, -25] }, { wl: [0.4, 0.45] },
      { stamps: [{ t: 1.5, text: 'ドバァ！', x: 520, y: 820, rot: -6, color: '#9fd0ff', size: 100 }] }],
    ['day', '80', '分', '冠水した大通り', '80分で水深60cm。車が浮く', ['JAFの目安：約60cmで浮き始める', '80分×7.5mm＝60cm（試算）'],
      { p0: [-10, 1.9, 10], p1: [-10, 2.0, 9], l0: [2, 0.6, 28], l1: [2, 0.8, 30], pov: { label: '歩道から見るあなたの目線', walk: 0 } }, { wl: [0.55, 0.62] },
      { stamps: [{ t: 2.0, text: 'プカァ…', x: 560, y: 800, rot: -10, color: '#ffd23a' }], lines: [[1.8, 2.3]], shake: [[1.8, 0.4, 2]] }],
    ['day', '5.5', '時間', 'ビルの街', '5.5時間で、1階が水没', ['天井2.5mまで2500÷450mm/h', '流れ出ない場合の単純計算（試算）'],
      { p0: [-12, 5, 16], p1: [-12, 4, 14], l0: [8, 2, -10], l1: [8, 2, -14] }, { wl: [1.2, 2.5] },
      { stamps: [{ t: 1.8, text: 'ざぶーん！', x: 540, y: 800, rot: -8, color: '#9fd0ff' }], lines: [[1.6, 2.2]] }],
  ],
  { sc: 'day', opt: { rainAt: 99 }, noCounter: true, loc: '',
    cam: { p0: [-10, 2.0, 12], p1: [-10, 2.4, 9], l0: [0, 6, -40], l1: [0, 8, -40] },
    cap: '結論：下水が毎日、守ってくれてる', sub: ['下水は時間50mm程度が目安（自治体で異なる）', '大雨の日は、早めの避難を'], gold: '雨の日は、早めの避難', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [7.2, 'comic_jajean', -7],
  [12.2, 'comic_shock2', -7], [17.5, 'comic_boyon', -8],
  [22.8, 'comic_surprise', -7], [27.7, 'comic_fall', -8], [28.0, 'whoosh_gust', -10],
  [33.2, 'comic_pico', -9], [34.1, 'comic_surprise', -7],
  [42.1, 'comic_chanchan', -5],
];
run({
  word: '雨の量', tail: 'が10倍になったら？', hookTail1: 'が', hookTail2: '10倍になったら？',
  hookSub: 'いつもの交差点で、空を見上げる', countdownLabel: '雨が10倍になるまで', label: '10倍になってから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_wind', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { day: mk('noon'), night: mk('night') },
});
