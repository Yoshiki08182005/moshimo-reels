// ep04: もしも車が消えたら？
// Facts: 自家用乗用車 61,762,498台(2024年3月末, 自検協) / 救急出動 772万件(2024, 消防庁) / 交通事故死者 2,663人(2024, 警察庁)
// / 運輸部門CO2の8割以上が自家用・貨物自動車(2022年度, 環境省)
import { run } from '../engine/core.js';
import { buildStreet, buildResidential, buildShotengai } from '../engine/kit2.js';
import { buildSky } from '../engine/kit.js';
import { carVanish, playingKids } from '../engine/kit3.js';
import { person, box } from '../engine/core.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 36.5, 42.7, 46.7];
const STORE_CAM = { p0: [-10, 5.5, 17], p1: [-8.5, 4.6, 9], l0: [3, 1.2, -30], l1: [3, 0.8, -40] };
const shots = beats(B,
  { sc: 'street', opt: { cars: 'vanish' }, loc: '朝の大通り', cam: STORE_CAM,
    cap: '日本中の車が、一瞬で消えた', sub: ['自家用の乗用車だけで約6,200万台（2024年3月）'] },
  [
    ['street', '10', '分', '通勤の大通り', '道路が、からっぽになる', ['渋滞も、配達も、送り迎えも消えた'],
      { p0: [-1, 1.6, 22], p1: [-0.5, 2.2, 10], l0: [0, 1.5, -40], l1: [0, 1.0, -60] }, { cars: 'gone' }],
    ['res', '1', '時間', '夕方の住宅街', '救急車が、来ない', ['救急車の出動は年間約772万件（2024年）'],
      { p0: [2.2, 1.7, 12], p1: [1.6, 1.6, 7], l0: [-2, 0.9, 0], l1: [-2.4, 0.7, -1] }],
    ['arcade', '1', '日', '近所の商店街', '店から、商品が消えていく', ['食べ物も日用品も、多くはトラックで届く'],
      { p0: [0, 2.3, 14], p1: [0, 2.4, 6], l0: [-3, 1.2, -6], l1: [-3, 1.0, -14] }],
    ['noon', '3', '日', 'いつもの大通り', '道路が、子どもの遊び場に', ['交通事故で亡くなる人は年間2,663人（2024年）'],
      { p0: [-3, 2.5, 22], p1: [-2, 1.8, 15], l0: [0, 0.6, 6], l1: [0, 0.5, 6] }, { cars: 'gone' }],
    ['sky', '1', 'か月', '東京の夜空', '空気が、少しずつ澄んでいく', ['運輸部門のCO2の8割以上は自動車から（2022年度）'], null],
  ],
  { sc: 'street', opt: { cars: 'on' }, num: '1', unit: '年', loc: 'いつもの大通り',
    cam: { p0: [-2, 1.6, 20], p1: [-9, 11, 26], l0: [0, 1.2, -20], l1: [0, 0.5, -40], hold: 0.4 },
    cap: '車は、暮らしをまるごと運んでいた', sub: ['人も、物も、命も'], gold: '走る車の向こうに、だれかの暮らしがある' });

const carsExtra = (api) => { const cv = carVanish(api); return (lt, gt, shot) => cv(shot.opt?.cars || 'on', gt); };
run({
  word: '車', tail: 'が消えたら？', hookTail1: 'が', hookTail2: '消えたら？',
  hookSub: '平日の朝8時。いつもの大通り', countdownLabel: '車が消えるまで', label: '車が消えてから',
  T_B: 5.0, shots, cues: stdCues(B, [[0, 'amb_bigcity', 15.7], [15.7, 'amb_night', 5.2], [20.9, 'amb_bigcity', 10.4], [37, 'amb_bigcity', 9]]),
  music: { restore: B[6], outro: B[7] },
  scenes: {
    street: () => buildStreet({ time: 'morning', cars: 22, extra: carsExtra }),
    noon: () => buildStreet({ time: 'noon', cars: 22, seed: 131, walkers: 10, extra: (api) => {
      const cv = carVanish(api), kids = playingKids(api.scene, api.r, 0, 6);
      return (lt, gt, shot) => { cv('gone', gt); kids(gt); };
    } }),
    res: () => buildResidential({ time: 'evening', noKid: true, extra: ({ scene, r }) => {
      const old = person(r, { shirt: '#8a7a6a', hair: '#bbbbbb' }); old.position.set(-2.2, 0, 0); old.rotation.y = 1.2;
      old.userData.legL.rotation.x = old.userData.legR.rotation.x = -1.5; old.position.y = -0.62; scene.add(old);
      const caller = person(r, { shirt: '#3a5a8a' }); caller.position.set(-1.0, 0, 1.2); caller.rotation.y = -0.6; scene.add(caller);
      caller.userData.armR.rotation.x = -2.6; caller.userData.armR.rotation.z = 0.5;
      box(0.08, 0.16, 0.03, '#bfe0ff', 0, -0.72, 0.1, caller.userData.armR, false);
      const helper = person(r, { longHair: true }); helper.position.set(-1.6, 0, -0.9); helper.rotation.y = 2.2; scene.add(helper);
      helper.userData.legL.rotation.x = -1.2; helper.position.y = -0.3;
      return () => {};
    } }),
    arcade: () => buildShotengai({ time: 'noon', goods: false, walkers: 14 }),
    sky: () => buildSky(),
  },
});
