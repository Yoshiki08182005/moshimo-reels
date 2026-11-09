// ep08 (空想科学): もしも透明人間になったら？
// 物理: 見る＝網膜の視細胞が光を吸収すること → 光が素通りすると見えない / 生体組織の屈折率は約1.35〜1.45（空気1.0）→ ガラスのように輪郭が見える
import { run, CFG, V, clamp, ease, box, person } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { stdCues, beats } from './_common.js';

const C = [-11, 0.25, 11], DIR = [-0.597, 0.802];
const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 37.5, 41.5];
const shots = beats(B,
  { sc: 'city', opt: { inv: 'fade' }, loc: 'お昼の交差点', capAt: 6.2,
    cam: { p0: [-16.5, 2.2, 19], p1: [-15, 1.9, 16], l0: [-11, 1.4, 11], l1: [-11, 1.2, 11] },
    cap: '体が、完全に透明に！', sub: ['光がまるごと体を通りぬける…という設定'],
    stamps: [{ t: 5.4, text: 'スーッ…', x: 560, y: 760, rot: -6, color: '#9fd0ff', size: 110 }], lines: [[5.0, 5.5]] },
  [
    ['city', '30', '秒', 'お昼の交差点', '目の前が、真っ暗になる', ['網膜が光を吸収できないと、ものは見えない'],
      { p0: [-14.5, 1.8, 15.5], p1: [-14, 1.7, 14.6], l0: [-11.6, 1.3, 11.8] }, { inv: 'blind' },
      { dark: [1.2, 0.82], stamps: [{ t: 1.6, text: '真っ暗！', x: 500, y: 800, rot: -8, color: '#ffd23a' }] }],
    ['city', '1', '分', 'お昼の交差点', '電柱に、正面からぶつかる', ['自分の目が見えないので、よけられない'],
      { p0: [-17, 1.6, 11], p1: [-16.6, 1.5, 11.4], l0: [-12.4, 1.1, 12.9] }, { inv: 'bump' },
      { stamps: [{ t: 1.2, text: 'ゴンッ！', x: 520, y: 780, rot: -12 }], shake: [[1.15, 0.12, 0.5]], lines: [[1.15, 1.6]] }],
    ['city', '10', '分', 'お昼の交差点', 'まわりには、うっすらバレる', ['体の屈折率は約1.4。空気（1.0）と違うと輪郭が見える'],
      { p0: [-14.8, 1.7, 15], p1: [-14, 1.6, 14], l0: [-11, 1.2, 11] }, { inv: 'glass' },
      { stamps: [{ t: 1.4, text: 'バレバレ！', x: 520, y: 800, rot: -8 }] }],
    ['city', '1', '時間', 'お昼の交差点', '食べたおにぎりが、丸見え', ['体が透明でも、食べたものは透明じゃない'],
      { p0: [-13.6, 1.5, 9.6], p1: [-13.0, 1.45, 10.0], l0: [-11, 1.2, 11] }, { inv: 'onigiri' },
      { stamps: [{ t: 1.5, text: '丸見え！', x: 520, y: 800, rot: -10 }] }],
  ],
  { sc: 'city', opt: { inv: 'ghost' }, noCounter: true, loc: '',
    cam: { p0: [-15, 2.4, 17], p1: [-17, 6, 21], l0: [-11, 1.2, 11], l1: [-11, 1, 11], hold: 0.3 },
    cap: '結論：透明人間は、何も見えない', sub: ['ものを見るには、目が光を吸収しないといけない'], gold: '見えない人生も、ラクじゃない', goldAt: 2.8,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = ({ scene, r }) => {
  const P = person(r, { shirt: '#ff8a3d', pants: '#2f3b4c', cap: '#ff8a3d' }); scene.add(P);
  const mats = [];
  P.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.userData.c0 = o.material.color.clone(); mats.push(o.material); } });
  const set = (op, glass) => mats.forEach(m => { m.opacity = op; m.depthWrite = op > 0.9; glass ? m.color.set('#cfeeff') : m.color.copy(m.userData.c0); });
  const oni = new THREE_Group(P); // onigiri in the belly
  box(0.26, 0.24, 0.12, '#fbfaf5', 0, 1.1, 0.02, oni); box(0.15, 0.1, 0.13, '#1c2a1e', 0, 1.02, 0.02, oni);
  const pole = new THREE_Group(scene); box(0.3, 7, 0.3, '#8e8a82', -12.8, 3.5, 13.4, pole); box(1.8, 0.2, 0.2, '#8e8a82', -12.8, 6.6, 13.4, pole);
  const fans = [];
  for (let i = 0; i < 3; i++) { const f = person(r, { longHair: i === 1 }); f.position.set(-9.4 + i * 0.2, 0.25, 9.6 + i * 1.1); f.rotation.y = -2.2 + i * 0.3; f.userData.armR.rotation.x = -1.4; scene.add(f); fans.push(f); }
  return (lt, gt, shot) => {
    const st = shot.opt?.inv || 'ghost';
    P.position.set(...C); P.rotation.set(0, -0.64, 0); P.userData.armL.rotation.set(0, 0, 0); P.userData.armR.rotation.set(0, 0, 0);
    P.userData.legL.rotation.x = P.userData.legR.rotation.x = 0; oni.visible = false; fans.forEach(f => { f.visible = false; }); pole.visible = st === 'bump';
    if (st === 'fade') { set(gt < CFG.T_B ? 1 : Math.max(0.0, 1 - (gt - CFG.T_B) / 0.6), false); if (gt > CFG.T_B + 0.6) set(0.1, true); return; }
    if (st === 'blind' || st === 'bump') {
      set(0.13, true); P.userData.armL.rotation.x = P.userData.armR.rotation.x = -1.45;
      const sp = st === 'bump' ? 1.0 : 0.35, start = st === 'bump' ? [-11.96, 12.28] : [C[0], C[2]];
      const tt = st === 'bump' ? Math.min(lt, 1.15) : lt;
      P.position.set(start[0] + DIR[0] * sp * tt, 0.25, start[1] + DIR[1] * sp * tt);
      const s = Math.sin(lt * 6); P.userData.legL.rotation.x = s * 0.35; P.userData.legR.rotation.x = -s * 0.35;
      if (st === 'bump' && lt > 1.15) { const k = ease((lt - 1.15) / 0.6); P.rotation.x = -1.35 * k; P.position.y = 0.25 + 0.2 * k; P.userData.legL.rotation.x = P.userData.legR.rotation.x = 0; }
      return;
    }
    if (st === 'glass') { set(0.38, true); fans.forEach(f => { f.visible = true; }); return; }
    if (st === 'onigiri') { set(0.12, true); oni.visible = true; oni.position.y = Math.sin(lt * 5) * 0.03; return; }
    set(0.12, true); P.userData.armR.rotation.z = 2.6 + Math.sin(lt * 6) * 0.3;
  };
};
import * as THREE from 'three';
function THREE_Group(parent) { const g = new THREE.Group(); parent.add(g); return g; }

run({
  word: '透明人間', tail: 'になったら？', hookTail1: 'に', hookTail2: 'なったら？',
  hookSub: 'お昼の交差点。ボクの体が…', countdownLabel: '透明になるまで', label: '透明になってから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 37.5]], 2.8, 'comic_boyon').concat([
    [5.0, 'magic-dummy', 0].slice(0, 0), [5.4, 'comic_surprise', -8], [16.9, 'comic_shock2', -6], [22.05, 'comic_pico', -4], [22.1, 'comic_fall', -9],
    [27.5, 'comic_tsukkomi', -6], [32.8, 'comic_eat', -9], [36.0, 'comic_chanchan', -5]].filter(c => c.length)),
  music: { restore: B[5], outro: B[6] },
  scenes: { city: () => buildStreet({ time: 'noon', walkers: 22, cars: 6, seed: 181, extra }) },
});
