// ep05: もしも人口が半分になったら？
// Facts: 2020年 1億2,615万人 → 2070年 8,700万人(社人研 令和5年推計, 厚労省資料) / 空き家 約900万戸・13.8%(2023年 住宅・土地統計調査)
import { run, box } from '../engine/core.js';
import { buildStreet, buildResidential, buildShotengai } from '../engine/kit2.js';
import { peopleVanish } from '../engine/kit3.js';
import { stdCues, beats } from './_common.js';

const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 37.5, 41.5];
const shots = beats(B,
  { sc: 'street', opt: { people: 'vanish' }, loc: '駅前の交差点',
    cam: { p0: [-12.5, 3.8, 16], p1: [-11.5, 3.3, 11], l0: [2, 1.0, 0], l1: [3, 0.8, -4] },
    cap: '日本の人口が、約6,300万人に', sub: ['2020年は1億2,615万人（国勢調査）'] },
  [
    ['street', '10', '分', '朝の駅前', '朝の駅前が、すかすかに', ['すれ違う人が、いつもの半分'],
      { p0: [-1.5, 1.7, 24], p1: [-1, 2.0, 14], l0: [0, 1.4, -40], l1: [0, 1.2, -70] }, { people: 'gone' }],
    ['arcade', '1', '日', '近所の商店街', 'シャッターを下ろす店が増える', ['お客さんも、働く人も半分'],
      { p0: [0, 2.3, 15], p1: [0, 2.4, 7], l0: [0, 2.2, -20], l1: [0, 2.0, -30] }],
    ['res', '1', 'か月', '夕方の住宅街', '空き家が、どんどん増える', ['いまでも空き家は約900万戸（2023年）'],
      { p0: [-0.3, 1.45, 10.5], p1: [-0.5, 1.6, 4.2], l0: [-0.9, 0.8, -6], l1: [-1.1, 0.8, -14] }],
    ['noon', '1', '年', '昼の大通り', '道路や水道を、直す人が足りない', ['人が減っても、町の広さは変わらない'],
      { p0: [-9, 6, 18], p1: [-7, 4.5, 12], l0: [4, 0.6, -10], l1: [4, 0.6, -14] }, { people: 'gone' }],
  ],
  { sc: 'street', opt: { people: 'on' }, num: '50', unit: '年後', loc: '2070年の日本',
    cam: { p0: [-12.5, 2.8, 14], p1: [-14, 12, 28], l0: [2, 1.4, -2], l1: [0, 0, -20], hold: 0.4 },
    cap: '人が減る未来は、もう始まっている', sub: ['2070年には約8,700万人になる推計（社人研）'], gold: 'すれ違うだけの人も、町をつくっている' });

const pv = (api) => { const v = peopleVanish(api, 2); return (lt, gt, shot) => v(shot.opt?.people || 'on', gt); };
run({
  word: '人口', tail: 'が半分になったら？', hookTail1: 'が', hookTail2: '半分になったら？',
  hookSub: '平日の朝8時。駅前の交差点', countdownLabel: '人口が半分になるまで', label: '人口が半分になってから',
  T_B: 5.0, shots, cues: stdCues(B, [[0, 'amb_bigcity', 20.9], [20.9, 'amb_country', 5.2], [26.1, 'amb_bigcity', 11.4]]),
  music: { restore: B[5], outro: B[6] },
  scenes: {
    street: () => buildStreet({ time: 'morning', walkers: 44, extra: pv }),
    noon: () => buildStreet({ time: 'noon', walkers: 30, cars: 4, seed: 141, extra: (api) => {
      const v = peopleVanish(api, 2);
      const cones = [];
      for (let k = 0; k < 5; k++) { box(0.4, 0.7, 0.4, '#ff7a1a', 3 + k * 1.2, 0.35, -8.5, api.scene); }
      box(4.5, 0.06, 0.5, '#7a5a3a', 4.5, 0.03, -10, api.scene);
      return (lt, gt, shot) => v('gone', gt);
    } }),
    arcade: () => buildShotengai({ time: 'evening', walkers: 10, extra: ({ scene }) => {
      for (const [sx, k] of [[-1, 1], [-1, 3], [1, 2], [1, 4], [-1, 6], [1, 7], [1, 5]]) box(0.15, 3.2, 5.8, '#8d949b', sx * 3.85, 1.6, 20 - k * 7, scene);
      return () => {};
    } }),
    res: () => buildResidential({ time: 'evening' }),
  },
});
