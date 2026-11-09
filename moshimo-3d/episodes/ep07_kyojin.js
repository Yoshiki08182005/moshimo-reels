// ep07 (空想科学シリーズ #1): もしも身長40mのヒーローがいたら？  — character is the channel's own mascot (original design)
// 試算: 40m/1.75m≈23倍 → 体重23^3≈1万2000倍(70kg→約850t) / 足の面積23^2≈530倍 → 足裏・骨の負担23倍
// 転倒: 自由落下 √(2h/g) 40m→約2.9秒(人1.75m→約0.6秒) / 声: 約120Hz÷23≈5Hz(可聴域は約20Hzから)
// 食事: クライバーの法則 代謝∝体重^0.75 → 12167^0.75≈1160倍×2000kcal≈232万kcal ÷ おにぎり約180kcal ≈ 約1万3000個
import { run, CFG, V, clamp, ease, lerp, vanisher } from '../engine/core.js';
import { buildStreet } from '../engine/kit2.js';
import { giantHero, dustBurst, crater, soundRings, onigiriPile } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.7, 20.9, 27.1, 32.3, 37.5, 43.7, 47.7];
const shots = beats(B,
  { sc: 'city', opt: { hero: 'assemble' }, loc: 'お昼の大通り', capAt: 6.6,
    cam: { p0: [-3, 1.7, 24], p1: [-2.5, 1.6, 15], l0: [0, 16, -30], l1: [0, 18, -30] },
    cap: '体重、約850トン！', sub: ['身長が約23倍なら、体重は23×23×23倍（試算）'],
    stamps: [{ t: 7.3, text: '重っ！', x: 600, y: 760, rot: -10 }], shake: [[5.0, 1.2, 0.9]], lines: [[5.0, 5.6]] },
  [
    ['city', '30', '秒', '大通り', '一歩目で、道路にめり込む', ['足の面積は約530倍、重さは約1万2000倍（試算）'],
      { p0: [-2.5, 2.0, -10], p1: [-2, 1.8, -13], l0: [3, 3.5, -29], l1: [3, 2.5, -29] }, { hero: 'step' },
      { stamps: [{ t: 1.05, text: 'ズボッ！', x: 420, y: 800, rot: -12, color: '#ffd23a' }], shake: [[1.0, 1.0, 0.8]], lines: [[1.0, 1.4]] }],
    ['city', '1', '分', '大通り', 'ひざが、ミシミシ鳴りだす', ['骨にかかる負担は、人の約23倍（試算）'],
      { p0: [-8, 9, 6], p1: [-6, 10, 0], l0: [0, 8, -30], l1: [0, 9, -30] }, { hero: 'knees' },
      { stamps: [{ t: 1.3, text: 'ミシッ…', x: 520, y: 820, rot: 6, size: 112 }] }],
    ['city', '3', '分', '大通り', '転ぶのに、約3秒かかる', ['人なら約0.6秒。高さ40mだと約2.9秒（試算）'],
      { p0: [44, 9, 4], p1: [34, 24, 8], l0: [0, 16, -18], l1: [0, 3, -8] }, { hero: 'fall' },
      { stamps: [{ t: 0.8, text: 'うわぁ〜', x: 540, y: 700, rot: -6, color: '#ffffff', size: 96, dur: 2.2 }, { t: 3.65, text: 'ドッシーン！', x: 500, y: 820, rot: -8, color: '#ffd23a' }],
        shake: [[3.6, 2.5, 1.2]], lines: [[3.55, 4.3]] }],
    ['city', '10', '分', '大通り', '雄たけびが、だれにも聞こえない', ['声の高さ約1/23で約5Hz。人の耳は約20Hzから（試算）'],
      { p0: [-5, 1.8, 2], p1: [-4, 1.7, -2], l0: [0, 28, -30], l1: [0, 32, -30] }, { hero: 'shout' },
      { stamps: [{ t: 2.2, text: '……シーン', x: 520, y: 820, rot: 0, color: '#9fd0ff', size: 104 }] }],
    ['city', '1', '日', '大通り', 'おにぎり、1日約1万3000個', ['代謝は体重の3/4乗に比例（クライバーの法則）で試算'],
      { p0: [-4, 6, 8], p1: [-3, 7, 2], l0: [4, 10, -26], l1: [5, 12, -26] }, { hero: 'eat' },
      { stamps: [{ t: 1.5, text: '食べすぎ！', x: 520, y: 800, rot: -10 }] }],
  ],
  { sc: 'city', opt: { hero: 'small' }, noCounter: true, loc: '',
    cam: { p0: [-2, 3.5, 12], p1: [-1.5, 2.2, 3], l0: [0, 10, -20], l1: [0, 1.3, -6] },
    cap: '結論：ヒーローは身長2mくらいがいい', sub: ['大きさ23倍で、体重は約1万2000倍（試算）'], gold: '大きいって、ラクじゃない', goldAt: 3.0,
    stamps: [{ t: 4.6, text: 'ちゃんちゃん♪', x: 500, y: 860, rot: -4, color: '#ffd23a', size: 96, dur: 1.6 }] });

const giantExtra = (api) => {
  const { scene } = api;
  const H = giantHero(scene, 20.5); H.g.position.set(0, 0, -30); H.g.updateMatrixWorld(true);
  const asm = vanisher(scene, H.g, ['#25335a', '#f3c24f', '#ff8a3d', '#f4f4f0', '#16a38a'], 520, 77, 6);
  const cr = crater(scene, 3.1, -28.6, 7);
  const dustStep = dustBurst(scene, 3.1, -28.6, 7, 90, 4), dustFall = dustBurst(scene, 0, -8, 18, 220, 5);
  const rings = soundRings(scene, V(0, 36, -27));
  const pile = onigiriPile(scene, 9, -22, 160, 3);
  return (lt, gt, shot) => {
    const st = shot.opt?.hero || 'stand';
    H.g.rotation.set(0, 0, 0); H.g.position.set(0, 0, -30); H.g.scale.setScalar(20.5);
    H.legL.rotation.x = H.legR.rotation.x = 0; H.armL.rotation.set(0, 0, 0); H.armR.rotation.set(0, 0, 0); H.head.rotation.set(0, 0, 0);
    H.knees.forEach(k => { k.visible = false; }); H.mouth.scale.y = 0.03 * (1); cr.visible = false; rings(lt, false); pile(0); dustStep(-1); dustFall(-1);
    if (st === 'assemble') { const p = (gt - CFG.T_B) / 1.4; asm(p < 0 ? 99 : p >= 1 ? -1 : 1.6 * (1 - p)); return; }
    asm(-1);
    if (st === 'step') {
      const up = lt < 1.0 ? Math.sin(clamp(lt / 1.0) * Math.PI / 2) : 0;
      H.legR.rotation.x = -0.75 * up; H.armL.rotation.x = -0.4 * up;
      if (lt >= 1.0) { H.g.position.y = -0.7; cr.visible = true; dustStep(lt - 1.0); }
    } else if (st === 'knees') {
      const on = lt > 0.9 && Math.sin(lt * 9) > 0;
      H.knees.forEach(k => { k.visible = on; }); H.g.position.y = lt > 0.9 ? Math.sin(lt * 40) * 0.08 : 0;
      H.legL.rotation.x = H.legR.rotation.x = -0.12; H.g.position.z = -30 + 0.6;
    } else if (st === 'fall') {
      const p = clamp((lt - 0.4) / 3.2);
      H.g.rotation.x = (Math.PI / 2 - 0.04) * p * p;
      H.armL.rotation.z = -1.2 - Math.sin(lt * 7) * 0.8; H.armR.rotation.z = 1.2 + Math.sin(lt * 7 + 1) * 0.8;
      H.mouth.scale.y = 0.03 * (3);
      dustFall(lt - 3.6);
    } else if (st === 'shout') {
      H.mouth.scale.y = 0.03 * (3.5 + Math.sin(lt * 20)); H.head.rotation.x = -0.25;
      H.armL.rotation.z = -2.3; H.armR.rotation.z = 2.3; rings(lt, lt > 0.6);
    } else if (st === 'eat') {
      pile(1); const c = Math.max(0, Math.sin(lt * 3));
      H.armR.rotation.x = -1.5 - 0.6 * c; H.mouth.scale.y = 0.03 * (1 + 2.5 * c); H.head.rotation.x = 0.15;
    } else if (st === 'small') {
      const k = ease((lt - 0.3) / 1.0);
      H.g.scale.setScalar(lerp(20.5, 1.15, k)); H.g.position.z = lerp(-30, -6, k);
      if (k >= 1) { H.armR.rotation.z = 2.6 + Math.sin(lt * 7) * 0.3; H.mouth.scale.y = 0.03 * (2); }
    }
  };
};

const extra = [
  [5.0, 'quake', -8], [5.3, 'impact_doon', -6], [7.3, 'comic_shock2', -6],
  [11.5, 'giant_step', -4], [11.55, 'crack_rock', -8],
  [17.0, 'crack_rock', -8], [17.05, 'comic_stupid', -10],
  [21.3, 'giant_fall', -7], [21.7, 'comic_fall', -9], [24.5, 'impact_doon', -4], [24.55, 'collapse', -8], [24.5, 'quake', -9],
  [29.3, 'comic_stupid', -6],
  [32.7, 'comic_eat', -10], [33.8, 'comic_tsukkomi', -5],
  [37.8, 'vanish_warp', -8], [42.1, 'comic_chanchan', -5],
];
run({
  word: '身長40m', tail: 'のヒーローがいたら？', hookTail1: 'の', hookTail2: 'ヒーローがいたら？',
  hookSub: 'お昼の大通り。空からヒーローが…', countdownLabel: 'ヒーロー登場まで', label: '登場してから',
  T_B: 5.0, comic: true, shots,
  cues: stdCues(B, [[0, 'amb_bigcity', 37.5]], 3.0, 'comic_boyon').concat(extra),
  music: { restore: B[6], outro: B[7] },
  scenes: { city: () => buildStreet({ time: 'noon', walkers: 30, cars: 6, seed: 171, extra: giantExtra }) },
});
