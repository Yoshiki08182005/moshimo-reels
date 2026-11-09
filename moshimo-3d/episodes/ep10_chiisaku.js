// ep10 (空想科学): もしも体が10cmに縮んだら？  character = channel mascot ギガもしも (original)
// 試算: 1.75m→10cm=1/17.5 / 体重70kg÷17.5^3≈13g / 体重あたりの熱の逃げやすさ×17.5 / 声120Hz×17.5≈2100Hz
// 歩く速さ∝√身長 → 1.4÷4.18≈0.33m/s、100mに約5分 / 体重あたりの必要エネルギー×17.5^(3/4)... 体重^-0.25 → 約8.6倍
import { run, CFG, V, clamp, ease, lerp, box } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { giantHero, soundRings } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const M = [-9.6, 0.25, 9], S = 0.057;
const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 36.5, 42.7, 46.7];
const shots = beats(B,
  { sc: 'city', opt: { mini: 'shrink' }, loc: 'お昼の歩道', capAt: 6.4,
    cam: { p0: [-11.6, 1.9, 14], p1: [-9.86, 0.31, 9.5], l0: [-9.6, 1.2, 9], l1: [-9.6, 0.3, 9], hold: 5.3 },
    cap: '体重、約13g！', sub: ['身長1/17.5なら体重は1/5,359（1円玉約13枚）'],
    stamps: [{ t: 5.05, text: 'ポンッ！', x: 560, y: 760, rot: -10, color: '#ffd23a' }], lines: [[5.0, 5.5]] },
  [
    ['city', '1', '分', 'お昼の歩道', 'とにかく、寒い！', ['体重あたり熱が逃げる速さは、人の約17倍（試算）'],
      { p0: [-9.83, 0.3, 9.4], p1: [-9.8, 0.31, 9.36], l0: [-9.6, 0.31, 9] }, { mini: 'shiver' },
      { stamps: [{ t: 1.2, text: 'さむっ！', x: 520, y: 800, rot: -8, color: '#9fd0ff' }] }],
    ['city', '10', '分', 'お昼の歩道', '声が、ピーピー高くなる', ['声の高さは約17倍、約2,100Hz（試算）'],
      { p0: [-9.83, 0.32, 9.42], p1: [-9.8, 0.34, 9.38], l0: [-9.6, 0.32, 9] }, { mini: 'voice' },
      { stamps: [{ t: 1.3, text: 'ピーッ！', x: 520, y: 800, rot: -8 }] }],
    ['city', '30', '分', 'お昼の歩道', 'コンビニまで、果てしない', ['歩く速さは約1/4。100mに約5分（試算）'],
      { p0: [-9.78, 0.2, 9.9], p1: [-9.78, 0.2, 11.4], l0: [-9.6, 0.22, 9.3], l1: [-9.6, 0.22, 10.9] }, { mini: 'walk' },
      { stamps: [{ t: 1.6, text: '遠っ！', x: 520, y: 800, rot: -10 }] }],
    ['city', '1', '時間', '公園のベンチ', 'ベンチから落ちても、平気', ['小さい体ほど、落ちたときの衝撃は小さい'],
      { p0: [-10.5, 0.62, 10.25], p1: [-10.5, 0.58, 10.2], l0: [-10.5, 0.45, 9.25] }, { mini: 'fall' },
      { stamps: [{ t: 1.7, text: 'ぽてっ', x: 520, y: 820, rot: -6, color: '#ffffff', size: 112 }] }],
    ['city', '1', '日', 'お昼の歩道', '体重あたり、人の約8.6倍食べる', ['代謝は体重の3/4乗に比例（クライバーの法則）で試算'],
      { p0: [-9.82, 0.33, 9.46], p1: [-9.78, 0.34, 9.42], l0: [-9.56, 0.3, 9] }, { mini: 'eat' },
      { stamps: [{ t: 1.4, text: 'でかっ！', x: 520, y: 800, rot: -10 }] }],
  ],
  { sc: 'city', opt: { mini: 'pose' }, noCounter: true, loc: '',
    cam: { p0: [-9.83, 0.3, 9.45], p1: [-12.5, 2.6, 14.5], l0: [-9.6, 0.3, 9], l1: [-9.6, 0.4, 9], hold: 0.5 },
    cap: '結論：小さすぎると、生きるのが大変', sub: ['大きさが変わると、体のルールも変わる'], gold: 'ちょうどいいサイズで、よかった', goldAt: 2.8,
    stamps: [{ t: 4.7, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = ({ scene }) => {
  const H = giantHero(scene, 1.0);
  const rings = soundRings(scene, V(M[0], 0.36, M[2]), 4, 0.012);
  const bench = new THREE_G(scene);
  box(1.6, 0.06, 0.45, '#8d6e4f', -10.6, 0.25 + 0.45, 9, bench); for (const x of [-11.3, -9.9]) box(0.08, 0.45, 0.4, '#555', x, 0.25 + 0.22, 9, bench);
  const oni = new THREE_G(scene); box(0.11, 0.1, 0.045, '#fbfaf5', 0, 0.05, 0, oni); box(0.065, 0.045, 0.05, '#1c2a1e', 0, 0.022, 0, oni); oni.position.set(-9.5, 0.25, 9.03);
  const base = () => { H.g.rotation.set(0, 0, 0); H.legL.rotation.x = H.legR.rotation.x = 0; H.armL.rotation.set(0, 0, 0); H.armR.rotation.set(0, 0, 0); H.mouth.scale.y = 0.03; H.head.rotation.set(0, 0, 0); };
  return (lt, gt, shot) => {
    const st = shot.opt?.mini || 'pose';
    base(); rings(lt, false); bench.visible = st === 'fall'; oni.visible = st === 'eat';
    H.g.position.set(...M); H.g.scale.setScalar(S);
    if (st === 'shrink') {
      const k = gt < CFG.T_B ? 0 : ease((gt - CFG.T_B) / 0.5);
      H.g.scale.setScalar(lerp(1, S, k)); if (gt < CFG.T_B) { H.armR.rotation.z = 0.3; }
      if (k >= 1) { H.mouth.scale.y = 0.03 * 3; H.armL.rotation.z = -2.2; H.armR.rotation.z = 2.2; }
    } else if (st === 'shiver') {
      H.g.rotation.z = Math.sin(lt * 70) * 0.05; H.armL.rotation.set(-0.6, 0, 0.9); H.armR.rotation.set(-0.6, 0, -0.9);
    } else if (st === 'voice') {
      H.mouth.scale.y = 0.03 * (3.5 + Math.sin(lt * 25)); H.head.rotation.x = -0.25; H.armL.rotation.z = -2.2; H.armR.rotation.z = 2.2; rings(lt, lt > 0.5);
    } else if (st === 'walk') {
      H.g.position.z = M[2] + lt * 0.33; const s = Math.sin(lt * 9); H.legL.rotation.x = s * 0.6; H.legR.rotation.x = -s * 0.6; H.armL.rotation.x = -s * 0.5; H.armR.rotation.x = s * 0.5;
    } else if (st === 'fall') {
      const k = clamp((lt - 0.9) / 0.5);
      H.g.position.set(-10.5, lerp(0.25 + 0.48, 0.25, k * k) + (lt > 1.4 ? Math.max(0, Math.sin((lt - 1.4) * 12)) * 0.03 * Math.exp(-(lt - 1.4) * 4) : 0), 9.15 + 0.2 * k);
      H.g.rotation.x = k < 1 ? k * 2.6 : (lt < 2.2 ? 1.5 : 0); if (lt > 2.2) { H.armR.rotation.z = 2.5; H.mouth.scale.y = 0.03 * 2; }
    } else if (st === 'eat') {
      H.g.position.x = M[0] - 0.02; H.armL.rotation.set(-1.2, 0, -0.5); H.armR.rotation.set(-1.2, 0, 0.5); H.mouth.scale.y = 0.03 * (1 + 2 * Math.max(0, Math.sin(lt * 4)));
    } else {
      H.armR.rotation.z = 2.6 + Math.sin(lt * 7) * 0.3; H.mouth.scale.y = 0.03 * 2;
    }
  };
};
import * as THREE from 'three';
function THREE_G(scene) { const g = new THREE.Group(); scene.add(g); return g; }

run({
  word: '体が10cm', tail: 'に縮んだら？', hookTail1: 'に', hookTail2: '縮んだら？',
  hookSub: 'お昼の歩道。急に体が…', countdownLabel: '小さくなるまで', label: '小さくなってから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 42.7]], 2.8, 'comic_boyon').concat([
    [5.0, 'comic_pico', -6], [5.05, 'sparkle', -9], [11.7, 'comic_stupid', -7], [17.0, 'question', -6],
    [22.5, 'comic_shock2', -7], [27.1, 'comic_fall', -6], [32.7, 'comic_surprise', -7], [41.4, 'comic_chanchan', -5]]),
  music: { restore: B[6], outro: B[7] },
  scenes: { city: () => buildStreet({ time: 'noon', walkers: 26, cars: 6, seed: 201, extra }) },
});
