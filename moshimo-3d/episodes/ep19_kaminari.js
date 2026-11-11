// ep19 (アームB 逆転の応用): もしも雷をためて使えたら？
// 前提: 1回の落雷放電 約15億J (気象庁「雷と雷雲の科学」引用) = 約417kWh
// スマホ(15Wh)約27,800台 / 蓄電池10kWh約42個 / EV電費0.15kWh/kmで約2,800km
// 日本の年間電力量を約9000億kWhと仮定 → 1日約25億kWh ÷417 = 約590万発(毎秒約68発)
// 仮に1ミリ秒で放電 → 1.5TW(瞬間出力)。 水4,500tを20→100℃(約4,490t)
// 出典: 気象庁 雷に関するQ&A(子ども向け)
import { run, THREE, box, basic } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { povHands } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.9, 21.3, 26.7, 32.1, 37.5, 43.5, 47.5];
const mk = (time) => () => buildStreet({ time, seed: time === 'night' ? 211 : 212, extra: ({ scene, camera }) => {
  const hands = povHands(scene, camera, { sleeve: '#3d5a80' });
  const bolt = [];
  let x = -4;
  for (let i = 0; i < 9; i++) {
    const nx = x + (i % 2 ? 2.2 : -2.2);
    const m = box(0.5, 6, 0.5, '#fff7a8', (x + nx) / 2, 40 - i * 4.6, -26, scene);
    m.rotation.z = (i % 2 ? 1 : -1) * 0.35; m.userData.b = true; bolt.push(m); x = nx;
  }
  const flash = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5 }));
  flash.position.set(x, 1, -26); scene.add(flash);
  return (lt, gt, shot) => {
    const op = shot.opt || {};
    let on = op.bolt ?? 0;
    if (shot.hook) on = lt >= 5 && lt < 7 ? 1 : 0;
    const fl = on && (Math.floor(lt * 14) % 4 !== 3);
    bolt.forEach((m) => { m.visible = !!fl; });
    flash.visible = !!fl;
    const pv = shot.cam?.pov; hands(pv && pv.walk ? 1 : 0, lt, op.reach ?? 0, pv?.walk ?? 0);
  };
} });

const C = (l, w = 0) => ({ p0: [-10, 1.55, 10], p1: [-10, 1.65, 9], l0: [-4, 14, -26], l1: [-4, 18, -26], pov: { label: l, walk: w } });
const shots = beats(B,
  { sc: 'night', loc: 'いつもの交差点', capAt: 6.4,
    cam: { p0: [0, 1.55, 14], p1: [0, 1.6, 13], l0: [-4, 16, -26], l1: [-4, 12, -26], pov: { label: 'あなたの目線', walk: 0 } },
    cap: 'ドーン！雷が落ちた！', sub: ['1発で約417kWh＝家庭の約2か月分の電気（気象庁）'],
    stamps: [{ t: 7.2, text: 'ピカッ！', x: 560, y: 780, rot: -8, color: '#ffd23a' }], shake: [[5.0, 0.6, 0.6]], lines: [[5.0, 5.7]] },
  [
    ['night', '×27,800', '', '雷の下で', 'スマホ約2.8万台を満充電', ['1発の約417kWh÷スマホ15Wh（試算）'],
      C('あなたの目線'), { bolt: 1 },
      { stamps: [{ t: 1.8, text: 'えっ！', x: 560, y: 800, rot: -8, color: '#ffd23a' }], shake: [[0.2, 0.25, 3]] }],
    ['night', '42個', '', '避雷針の先で', '家庭用蓄電池が42個ないと入らない', ['蓄電池1個10kWhとして、1発で約42個分（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 1.9, 9], l0: [-4, 10, -26], l1: [-4, 22, -26], pov: { label: 'あなたの目線', walk: 0 } }, { bolt: 0 },
      { stamps: [{ t: 1.6, text: 'ぎゅうぎゅう', x: 520, y: 800, rot: 8, color: '#6ab7ff' }] }],
    ['night', '2,800km', '', '充電した電気自動車で', '東京〜鹿児島を往復できる', ['電費0.15kWh/kmとして、約2,800km走れる（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 1.6, 9], l0: [0, 2, -30], l1: [0, 3, -60], pov: { label: '雷で走るあなたの目線', walk: 1.6 } }, { bolt: 1 },
      { stamps: [{ t: 1.5, text: 'ブ〜ン！', x: 480, y: 820, rot: -6, color: '#ffd23a', size: 96 }], lines: [[1.4, 2.0]] }],
    ['night', '590万発', '', '日本の1日', '日本の1日分は雷約590万発', ['年間約9000億kWhと仮定→1日約25億kWh÷417kWh＝毎秒約68発（試算）'],
      { p0: [0, 1.55, 14], p1: [0, 1.6, 13], l0: [-4, 8, -26], l1: [-4, 12, -26], pov: { label: 'あなたの目線', walk: 0 } }, { bolt: 1 },
      { stamps: [{ t: 1.6, text: 'ムリムリ！', x: 540, y: 800, rot: -8, color: '#ff6a5a' }], shake: [[0.6, 0.4, 2]] }],
    ['night', '1/1000秒', '', '落ちる一瞬', 'ためる前に、一瞬で終わる', ['仮に1ミリ秒で放電すると、瞬間出力は約1.5TW（試算）'],
      { p0: [-10, 1.55, 10], p1: [-10, 2.2, 9], l0: [-4, 12, -26], l1: [-4, 30, -26], pov: { label: 'あなたの目線', walk: 0 } }, { bolt: 1 },
      { stamps: [{ t: 2.0, text: 'ためられない', x: 520, y: 800, rot: -10, color: '#ffd23a' }], lines: [[1.8, 2.3]] }],
  ],
  { sc: 'night', noCounter: true, loc: '',
    cam: { p0: [0, 2.0, 16], p1: [0, 2.4, 13], l0: [-4, 14, -26], l1: [-4, 16, -26] },
    cap: '結論：雷は発電所にならない', sub: ['強すぎて一瞬。雷の日は屋内へ避難を（出典：気象庁）'], gold: 'ためるより、よける', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = [
  [5.0, 'vanish_warp', -8], [7.2, 'comic_jajean', -7],
  [12.2, 'comic_shock2', -7], [17.5, 'comic_surprise', -8],
  [22.8, 'comic_tsukkomi', -6], [27.7, 'comic_fall', -8], [28.0, 'whoosh_gust', -10],
  [33.2, 'comic_pico', -9], [34.1, 'comic_surprise', -7],
  [42.1, 'comic_chanchan', -5],
];
run({
  word: '雷', tail: 'をためて使えたら？', hookTail1: 'を', hookTail2: 'ためて使えたら？',
  hookSub: 'いつもの交差点で、夜空を見上げる', countdownLabel: '雷が落ちるまで', label: '落ちてから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { day: mk('noon'), night: mk('night') },
});
