// ep03: もしもコンビニが消えたら？
// Facts (checked 2026-11-09): JFA月報 2024年5月 店舗55,641・来店13.94億人/月(≈4,500万人/日); 2024年売上11兆7,953億円;
// セブン銀行ATM 全国27,000台以上(2024); 女性・子どもの駆け込み 年間約3万件(セブン‐イレブン2020活動レポート);
// 2017年7月 セブン/ローソン/ファミマ等が災害対策基本法の指定公共機関に。
import { run } from '../engine/core.js';
import { buildStreet, buildResidential, buildGym, buildShotengai } from '../engine/kit2.js';

const B = [0, 10.5, 15.7, 20.9, 26.1, 31.3, 36.5, 41.7, 47.9, 51.9];
const shots = [
  { s: B[0], e: B[1], sc: 'street', hook: true, opt: { store: 'vanish' }, loc: '駅前の交差点', capAt: 5.6,
    cam: { p0: [-10, 4.8, 17], p1: [-8.5, 4.2, 9], l0: [12, 3.4, -15], l1: [12, 2.0, -15] },
    cap: '全国のコンビニ、約5.5万店が消えた', sub: ['年間の売上は約11.8兆円（2024年）'] },
  { s: B[1], e: B[2], sc: 'street', opt: { store: 'gone', gather: true, fence: true }, num: '10', unit: '分', loc: '朝の駅前',
    cam: { p0: [2, 1.8, -1], p1: [4.5, 2.4, -3], l0: [12, 1.4, -14], l1: [12, 1.2, -15] },
    cap: '朝ごはんもコーヒーも、買えない', sub: ['コンビニの来店客は1日約4,500万人（2024年5月）'] },
  { s: B[2], e: B[3], sc: 'street', opt: { store: 'gone', atm: true, fence: true }, num: '1', unit: '時間', loc: '近くの銀行ATM',
    cam: { p0: [3, 3.2, -1], p1: [0.5, 3.8, -3], l0: [-12, 1.6, -11], l1: [-13, 1.5, -12] },
    cap: 'ATMの前に、長い行列', sub: ['セブン銀行のATMだけで、全国2.7万台以上（2024年）'] },
  { s: B[3], e: B[4], sc: 'res', num: '8', unit: '時間', loc: '下校中の通学路',
    cam: { p0: [-0.3, 1.45, 10.5], p1: [-0.5, 1.6, 4.2], l0: [-0.9, 0.8, -6], l1: [-1.1, 0.8, -14] },
    cap: '子どもの「かけこみ先」が消える', sub: ['コンビニへの女性・子どもの駆け込みは', '年間約3万件（セブン‐イレブン調べ）'] },
  { s: B[4], e: B[5], sc: 'night', opt: { store: 'gone' }, num: '1', unit: '日', loc: '深夜の国道沿い',
    cam: { p0: [-5, 5, 14], p1: [-1.5, 3.6, 6], l0: [9, 1.5, -16], l1: [9, 1.2, -18] },
    cap: '夜道から、明かりが消える', sub: ['24時間あいている店は、夜の町の目印だった'] },
  { s: B[5], e: B[6], sc: 'gym', num: '3', unit: '日', loc: '避難所の体育館',
    cam: { p0: [17, 7, 17], p1: [14, 4.2, 14.5], l0: [4, 1, 2], l1: [11, 1.6, 8] },
    cap: '災害のとき、物資が届かない', sub: ['大手コンビニは2017年から', '災害時の「指定公共機関」'] },
  { s: B[6], e: B[7], sc: 'arcade', num: '1', unit: 'か月', loc: '近所の商店街',
    cam: { p0: [0, 2.3, 16], p1: [0, 2.5, 6], l0: [0, 2.2, -20], l1: [0, 2.0, -30] },
    cap: '商店街に、人が戻ってくる', sub: ['近所の小さな店が、また町の台所に'] },
  { s: B[7], e: B[8], sc: 'street', opt: { store: 'on' }, num: '1', unit: '年', loc: 'いつもの交差点',
    cam: { p0: [4, 1.7, -2], p1: [-8, 10, 22], l0: [12, 2.6, -15], l1: [10, 2.0, -15], hold: 0.6 },
    cap: '24時間の明かりが、町を支えていた', sub: ['朝も、夜も、災害のときも'], gold: 'あの明かりは、今日もだれかが灯している', goldAt: 3.4 },
  { s: B[8], e: B[9], sc: 'outro' },
];
const cues = [
  [0.02, 'text_impact', -6], [0.35, 'countdown_tick', -11, 4.65], [5.0, 'vanish_hyun', -3], [5.0, 'impact_don', -9], [5.08, 'sparkle', -11],
  [5.6, 'text_tin', -15],
  [0, 'amb_bigcity', -27, 20.9], [20.9, 'amb_country', -26, 5.2], [26.1, 'amb_night', -27, 5.2], [36.5, 'amb_bigcity', -27, 11.2],
  [41.7, 'emo_shine', -13], [41.7 + 3.4, 'sparkle', -13], [B[8] + 0.2, 'end_tirin', -9],
];
for (let i = 1; i < 8; i++) { cues.push([B[i] - 0.18, i % 2 ? 'whoosh_switch1' : 'whoosh_switch2', -13]); cues.push([B[i] + 0.5, 'text_tin', -16]); }

run({
  word: 'コンビニ', tail: 'が消えたら？', hookTail1: 'が', hookTail2: '消えたら？',
  hookSub: '平日の朝7時。駅前の交差点', countdownLabel: 'コンビニが消えるまで', label: 'コンビニが消えてから',
  T_B: 5.0, shots, cues,
  music: { restore: B[7], outro: B[8] },
  scenes: {
    street: () => buildStreet({ time: 'morning' }),
    night: () => buildStreet({ time: 'night', store: false, truck: true, seed: 151 }),
    res: () => buildResidential({ time: 'evening' }),
    gym: () => buildGym(),
    arcade: () => buildShotengai({ time: 'noon' }),
  },
});
