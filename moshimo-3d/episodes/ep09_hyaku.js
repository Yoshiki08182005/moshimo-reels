// ep09 (空想科学): もしも100mを1秒で走れたら？  runner = channel mascot ギガもしも (original)
// 試算: v=100m/s=360km/h / 空気抵抗 0.5*1.2*1.0*0.6*100^2=3600N（体重686Nの約5倍）/ 1秒4.5歩なら一歩約22m
// 曲がる半径 v^2/(μg)=1276m(μ0.8) / 止まる距離 v^2/(2μg)=638m / 運動エネルギー35万J÷効率25%≈334kcal≈おにぎり約2個
import { run, CFG, clamp, ease, lerp, box } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { giantHero, dustBurst } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 36.5, 42.7, 46.7];
const shots = beats(B,
  { sc: 'city', opt: { run: 'start' }, loc: '大通りのスタートライン', capAt: 5.8,
    cam: { p0: [2.6, 1.4, 17], p1: [2.4, 1.5, 15], l0: [0, 0.8, 12], l1: [0, 1.4, -20] },
    cap: '時速360km！', sub: ['新幹線（最高時速320km）より速い'],
    stamps: [{ t: 5.15, text: 'はやっ！', x: 560, y: 760, rot: -10 }], shake: [[5.0, 0.25, 0.6]], lines: [[5.0, 5.9]] },
  [
    ['city', '1', '秒', 'スローモーション', '向かい風が、体重の約5倍', ['空気抵抗は速さの2乗で増える（約3,600Nと試算）'],
      { p0: [3.4, 1.6, 9], p1: [3.4, 1.6, 2], l0: [0, 1.1, 4], l1: [0, 1.1, -3] }, { run: 'slowmo' },
      { lines: [[0, 5.2]], stamps: [{ t: 1.4, text: 'ぐぬぬ…', x: 520, y: 800, rot: -6, color: '#ffffff', size: 110 }] }],
    ['city', '2', '秒', 'スローモーション', '一歩で、約22m跳ぶ', ['1秒に約4.5歩のままなら（試算）'],
      { p0: [10, 3, 6], p1: [10, 3, -10], l0: [0, 2.5, 2], l1: [0, 2.5, -14] }, { run: 'leap' },
      { stamps: [{ t: 1.0, text: '跳びすぎ！', x: 520, y: 800, rot: -10 }] }],
    ['city', '3', '秒', '大きな交差点', '曲がれない（半径約1.3km）', ['タイヤ並みの摩擦でも、曲がるには半径約1.3km（試算）'],
      { p0: [-12, 3.2, 12], p1: [-11, 3.4, 10], l0: [0, 1.2, 0], l1: [0, 1.2, -6] }, { run: 'noturn' },
      { stamps: [{ t: 1.6, text: '曲がれな〜い！', x: 520, y: 800, rot: -8, size: 104 }], lines: [[0.8, 2.4]] }],
    ['city', '4', '秒', '駅の前', '止まるのに、約640m', ['地面との摩擦（係数0.8）でブレーキした場合（試算）'],
      { p0: [-6, 3, -50], p1: [-6.5, 3.5, -60], l0: [0, 2, -74], l1: [0, 2.5, -82] }, { run: 'brake' },
      { stamps: [{ t: 0.8, text: '止まらな〜い！', x: 520, y: 760, rot: -6, color: '#ffffff', size: 100, dur: 2.3 }, { t: 3.25, text: 'ドーン！', x: 520, y: 840, rot: -10, color: '#ffd23a' }],
        shake: [[3.2, 0.9, 1.0]], lines: [[3.15, 3.8]] }],
    ['city', '1', '時間', '駅の前', '1本走るたび、おにぎり約2個', ['運動エネルギー35万J、筋肉の効率25%で試算'],
      { p0: [2.6, 1.2, -76], p1: [2.2, 1.1, -77.5], l0: [0.6, 0.6, -80], l1: [0.6, 0.6, -80] }, { run: 'eat' },
      { stamps: [{ t: 1.4, text: 'はらぺこ！', x: 520, y: 800, rot: -8 }] }],
  ],
  { sc: 'city', opt: { run: 'pose' }, noCounter: true, loc: '',
    cam: { p0: [2.4, 1.5, 6.5], p1: [4, 4, 14], l0: [0, 1.1, 2], l1: [0, 1.0, 2], hold: 0.4 },
    cap: '結論：速すぎる足は、止まれない', sub: ['速さが2倍になると、止まる距離は4倍になる'], gold: 'ほどほどが、いちばん速い', goldAt: 2.8,
    stamps: [{ t: 4.7, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.4 }] });

const extra = ({ scene }) => {
  const H = giantHero(scene, 1.0); H.g.castShadow = true;
  const dStart = dustBurst(scene, 0, 12, 2.5, 40, 2), dCrash = dustBurst(scene, 0, -82, 7, 140, 3);
  const trail = [0, 1, 2].map(i => dustBurst(scene, 0, -50 - i * 10, 2, 30, 10 + i));
  const oni = [0, 1].map(i => { const g = new THREE_G(scene); box(0.22, 0.2, 0.09, '#fbfaf5', 0, 0.1, 0, g); box(0.13, 0.09, 0.1, '#1c2a1e', 0, 0.045, 0, g); return g; });
  const runPose = (t, f = 1) => { const s = Math.sin(t * 14 * f); H.legL.rotation.x = s * 0.9; H.legR.rotation.x = -s * 0.9; H.armL.rotation.x = -s * 0.9; H.armR.rotation.x = s * 0.9; H.g.rotation.x = 0.25; };
  return (lt, gt, shot) => {
    const st = shot.opt?.run || 'pose';
    H.g.rotation.set(0, Math.PI, 0); H.g.position.set(0, 0, 0); H.legL.rotation.x = H.legR.rotation.x = 0;
    H.armL.rotation.set(0, 0, 0); H.armR.rotation.set(0, 0, 0); H.mouth.scale.y = 0.03; H.head.rotation.set(0, 0, 0);
    dStart(-1); dCrash(-1); trail.forEach(d => d(-1)); oni.forEach(o => { o.visible = false; });
    if (st === 'start') {
      if (gt < CFG.T_B) { H.g.position.set(0, -0.35, 12); H.legL.rotation.x = -1.0; H.legR.rotation.x = 0.6; H.armL.rotation.x = 0.5; H.armR.rotation.x = 0.5; H.g.rotation.x = 0.5; }
      else { H.g.position.set(0, 0, 12 - 100 * (gt - CFG.T_B)); runPose(gt); dStart(gt - CFG.T_B); }
    } else if (st === 'slowmo') {
      H.g.position.set(0, 0, 4 - lt * 1.4); runPose(lt, 0.35); H.mouth.scale.y = 0.03 * 3; H.head.rotation.x = -0.2;
    } else if (st === 'leap') {
      const ph = (lt * 0.8) % 1; H.g.position.set(0, Math.sin(Math.PI * ph) * 3.5, 6 - lt * 3.6);
      H.legL.rotation.x = -1.1; H.legR.rotation.x = 0.8; H.armL.rotation.x = 0.9; H.armR.rotation.x = -0.9; H.g.rotation.x = 0.35;
    } else if (st === 'noturn') {
      H.g.position.set(0, 0, 9 - lt * 4); runPose(lt, 0.35); H.g.rotation.z = 0.25 * Math.sin(lt * 2); H.head.rotation.y = 1.1; H.mouth.scale.y = 0.03 * 3;
    } else if (st === 'brake') {
      const k = clamp(lt / 3.2), z = lerp(-40, -82.2, 1 - (1 - k) * (1 - k));
      H.g.position.set(0, 0, z); H.g.rotation.x = -0.45; H.legL.rotation.x = -0.9; H.legR.rotation.x = -0.7; H.armL.rotation.z = -1.2; H.armR.rotation.z = 1.2;
      trail.forEach((d, i) => d(lt - (0.6 + i * 0.7))); if (lt > 3.2) { dCrash(lt - 3.2); H.g.rotation.x = 0.0; H.g.position.y = 0; H.mouth.scale.y = 0.03 * 4; }
    } else if (st === 'eat') {
      H.g.position.set(0.6, -0.55, -80); H.g.rotation.set(0, 0.6, 0); H.legL.rotation.x = H.legR.rotation.x = -1.45;
      oni[0].visible = oni[1].visible = true; oni[0].position.set(1.0, 0.25, -79.6); oni[1].position.set(0.3, 0.25, -79.5);
      const c = Math.max(0, Math.sin(lt * 3)); H.armR.rotation.x = -1.4 - 0.6 * c; H.mouth.scale.y = 0.03 * (1 + 2.5 * c);
    } else {
      H.g.position.set(0, 0, 2); H.g.rotation.set(0, 0.35, 0); H.armR.rotation.z = 2.6 + Math.sin(lt * 7) * 0.3; H.mouth.scale.y = 0.03 * 2;
    }
  };
};
import * as THREE from 'three';
function THREE_G(scene) { const g = new THREE.Group(); scene.add(g); return g; }

run({
  word: '100mを1秒', tail: 'で走れたら？', hookTail1: 'で', hookTail2: '走れたら？',
  hookSub: '大通りのスタートライン。位置について…', countdownLabel: 'スタートまで', label: 'スタートしてから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 42.7]], 2.8, 'comic_boyon').concat([
    [5.0, 'whoosh_gust', -4], [5.15, 'comic_surprise', -8], [12.0, 'whoosh_swing', -10], [16.7, 'comic_boyon', -8],
    [22.5, 'comic_stupid', -6], [27.0, 'whoosh_slide', -8], [29.3, 'impact_doon', -4], [29.35, 'collapse', -8], [32.7, 'comic_eat', -9],
    [41.4, 'comic_chanchan', -5]]),
  music: { restore: B[6], outro: B[7] },
  scenes: { city: () => buildStreet({ time: 'noon', walkers: 18, cars: 0, seed: 191, extra }) },
});
