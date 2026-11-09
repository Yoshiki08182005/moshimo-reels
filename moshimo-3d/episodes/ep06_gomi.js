// ep06: もしもゴミ収集が止まったら？
// Facts: ごみ総排出量 4,034万トン・1人1日880g(2022年度, 環境省) / 2021年度 4,095万トン=東京ドーム約110杯分(環境省)
import { run, vanisher } from '../engine/core.js';
import { buildStreet, buildResidential, buildShotengai } from '../engine/kit2.js';
import { trashPiles, garbageTruck } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 37.5, 41.5];
const SPOT_CAM = { p0: [-1.6, 2.3, 16], p1: [-1.2, 2.1, 10], l0: [0.4, 1.2, -1], l1: [1.2, 0.8, 0] };
const shots = beats(B,
  { sc: 'res', opt: { truck: 'vanish', trash: 0.12 }, loc: 'いつものゴミ置き場', cam: SPOT_CAM,
    cap: 'ゴミ収集車が、二度と来ない', sub: ['日本のゴミは年間約4,000万トン（2022年度）'] },
  [
    ['res', '1', '日', 'いつものゴミ置き場', 'ゴミ置き場に、袋がたまり始める', ['1人1日あたり約880g（2022年度）'],
      { p0: [-0.8, 1.6, 9], p1: [0.2, 1.4, 6.5], l0: [2.2, 0.6, 1], l1: [2.2, 0.5, 1] }, { truck: 'gone', trash: 0.35 }],
    ['street', '3', '日', '駅前の交差点', 'カラスが、町を荒らしはじめる', ['破れた袋から、生ゴミが道へ'],
      { p0: [-3, 2.0, 2], p1: [-1.5, 1.6, -1], l0: [9, 0.6, -9], l1: [9, 0.5, -9] }, { trash: 0.6 }],
    ['arcade', '1', '週間', '近所の商店街', 'においで、人が寄りつかない', ['飲食店も、ゴミを出せない'],
      { p0: [0, 2.0, 15], p1: [0, 2.2, 8], l0: [0, 1.0, -8], l1: [0, 1.0, -16] }, { trash: 0.75 }],
    ['res', '1', 'か月', 'いつものゴミ置き場', 'ゴミの山が、道をふさぐ', ['1年分で東京ドーム約110杯分（2021年度）'],
      { p0: [-1.2, 4.5, 15], p1: [-0.6, 3.2, 10], l0: [1.5, 0.8, 0], l1: [1.5, 0.6, -2] }, { truck: 'gone', trash: 1.0 }],
  ],
  { sc: 'res', opt: { truck: 'on', trash: 0 }, num: '1', unit: '年', loc: 'いつもの朝',
    cam: { p0: [-1.6, 2.0, 12], p1: [-4, 9, 22], l0: [1.4, 1.2, 1], l1: [1, 0.5, -6], hold: 0.4 },
    cap: '毎朝の収集が、町をきれいにしていた', sub: ['雨の日も、暑い日も'], gold: 'きれいな朝は、だれかの仕事でできている' });

run({
  word: 'ゴミ収集', tail: 'が止まったら？', hookTail1: 'が', hookTail2: '止まったら？',
  hookSub: '月曜の朝8時。いつものゴミ置き場', countdownLabel: 'ゴミ収集が止まるまで', label: 'ゴミ収集が止まってから',
  T_B: 5.0, shots, cues: stdCues(B, [[0, 'amb_country', 15.7], [15.7, 'amb_bigcity', 10.4], [26.1, 'amb_country', 15.4]]),
  music: { restore: B[5], outro: B[6] },
  scenes: {
    res: () => buildResidential({ time: 'morning', noKid: true, extra: ({ scene, r }) => {
      const tp = trashPiles(scene, r, [[2.2, 1, 1.4], [2.2, -11, 1.3], [-2.3, -24, 1.3]], 60);
      const tr = garbageTruck(scene, r, -0.8, -4, Math.PI);
      const vt = vanisher(scene, tr.g, ['#2f6fb3', '#f2f2f2', '#d0d4d8'], 220, 61);
      return (lt, gt, shot) => {
        const m = shot.opt?.truck || 'on';
        vt(m === 'vanish' ? gt - 5.0 : m === 'gone' ? 99 : -1);
        tp(shot.opt?.trash ?? 0, gt);
        tr.workers.forEach((w, i) => { w.userData.armR.rotation.x = -0.6 + Math.sin(gt * 3 + i) * 0.5; });
      };
    } }),
    street: () => buildStreet({ time: 'morning', walkers: 14, cars: 5, extra: (api) => {
      const tp = trashPiles(api.scene, api.r, [[9, -8.6, 1.6], [-8.6, 8.6, 1.5], [8.6, 9, 1.2], [-9, -8.8, 1.4]], 50);
      return (lt, gt, shot) => tp(shot.opt?.trash ?? 0, gt);
    } }),
    arcade: () => buildShotengai({ time: 'noon', walkers: 8, extra: ({ scene, r }) => {
      const tp = trashPiles(scene, r, [[-2.4, 6, 1.2], [2.4, -1, 1.2], [-2.4, -8, 1.2], [2.4, -15, 1.2], [-2.4, -22, 1.1]], 40);
      return (lt, gt, shot) => tp(shot.opt?.trash ?? 0, gt);
    } }),
  },
});
