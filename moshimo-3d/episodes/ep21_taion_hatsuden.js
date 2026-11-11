// ep21 (pop): もしも体の熱で発電できたら？（アームB：逆転の応用）
// 前提（試算）: 人の体の熱 ≒ 1日約2,000kcal ≒ 約97W → 約100W（NAIST資料「人体は100W以上の熱」）。前半は熱を100%電気にできると仮定。
// スマホ 15Wh ÷ 100W = 9分 / 睡眠8時間 800Wh ÷ 15Wh ≒ 53回 / ランニング約10METs×70kg ≒ 814W → 約800W（電子レンジ800W）
// 教室30人×100W＝3kW ÷ ドライヤー1,200W ≒ 2.5台 / 1日 100W×24h＝2.4kWh × 電費約6.5km/kWh ≒ 15.6km
// 満員電車1両 300人(定員約150人×200%)×100W = 30kW ÷ 800W ≒ 37台 / 日本1.2億人×100W = 12GW ＝ 原発1基100万kWとして12基
// 落とし穴: 熱→電気の上限（カルノー効率）＝1−(298K÷310K) ≒ 3.9%（気温25℃・体温37℃）。スマホ 9分÷0.039 ≒ 3.9時間
// 気温0℃: 11.9% / 満員電車30kW×3.9% ≒ 1.2kW（電気ケトル1台）
// 今の体温発電素子: 歩行時で数百μW程度（芝浦工大の報告など）→ 15Wh ÷ 0.5mW = 30,000時間 ≒ 3.4年
import { run, THREE, V, clamp, ease, lerp } from '../engine/core.js';
import { buildToyStage } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep21_taion_hatsuden.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f';
const HUD0 = ['体温発電', '100W'], HUD1 = ['変換効率', '約4%'];
let S;
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 150, 800), y + dy]; };

// heat waves rising from a point
const waves = (s, lt, x, y, z, sc = 1, speed = 0.7) => {
  const h = s.P.heat; h.visible = true; h.position.set(x, y, z); h.scale.setScalar(sc);
  h.userData.items.forEach((m, i) => { const u = (lt * speed + i / 3) % 1; m.position.y = u * 0.5; m.scale.set(1, 1, 1).multiplyScalar(1 - u * 0.5); m.rotation.y = 0; });
};
// bolts flying from a to b
const bolts = (s, lt, a, b, n = 4, speed = 1.2, sc = 1) => {
  const g = s.P.bolts; g.visible = true; g.position.set(0, 0, 0);
  g.userData.items.forEach((m, i) => { m.visible = i < n; const u = (lt * speed + i / n) % 1; m.position.lerpVectors(a, b, u); m.position.y += Math.sin(u * Math.PI) * 0.18; m.scale.setScalar(sc * (0.7 + Math.sin(u * Math.PI) * 0.5)); });
};
const battery = (s, lv) => { const f = s.P.phone.userData.fill; f.scale.y = Math.max(0.02, lv); s.P.phone.userData.fillMesh.material.color.set(lv < 0.25 ? '#ff5a4f' : '#3fd16b'); };
const phoneIn = (s, side, pos, sc = 1.6) => { const p = s.P.phone; p.position.copy(pos); p.scale.setScalar(sc); s.hero.userData.reach(side, pos.clone().add(V(0, -0.2 * sc / 1.6, -0.02))); };

const plan = [
  // 1) hook: body heat charges the phone in 9 minutes
  { sc: 'st', say: ['hook', 'phone'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['phone'],
    cam: { p0: [0.15, 1.5, 4.0], p1: [0.15, 1.46, 3.6], l0: [0.12, 1.4, 0], l1: [0.12, 1.36, 0] },
    sfx: [[0.02, 'text_impact', -9], [0.6, 'countdown_elec', -15], [3.0, 'whoosh_slide', -13], [4.6, 'text_pa', -8], [4.7, 'sparkle', -12]],
    stamps: [{ t: 4.7, text: '満タン！', x: 300, y: 1180, rot: -8, color: '#ffd23a', size: 110, dur: 1.3 }],
    cards(lt) { const t0 = this.lt.phone; if (lt < t0) return []; const m = Math.round(9 * ease(k(lt, t0, t0 + 1.8))); return [{ t: t0, text: `充電 [${m}分]`, x: 680, y: 1130, size: 66, border: CY }]; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0); s.hero.rotation.y = 0.15;
      const pp = V(0.42, 1.25, 0.4); phoneIn(s, 'R', pp); h.arm('L', 0.1, 0.25, 0.3);
      waves(s, lt, -0.2, 1.95, 0.1, 1.1);
      bolts(s, lt, V(-0.1, 1.5, 0.3), V(0.42, 1.3, 0.45), 3, 1.4, 0.9);
      const t0 = this.lt.phone; battery(s, lt < t0 ? 0.08 : lerp(0.08, 1, ease(k(lt, t0, t0 + 1.8))));
      const full = lt > t0 + 1.8;
      h.face({ lid: 0.12, brow: full ? 0.2 : 0.4, look: [0.7, -0.3], mouth: full ? 'o' : 'smile', open: 1.0 }); h.head.rotation.set(0.1, -0.2, full ? 0.1 : 0);
    } },
  // 2) the body always gives off ~100 W, like a light bulb
  { sc: 'st', say: ['body'], pal: ['#ffcf4a', '#fff6dc', '#e2463c'], show: ['lamp'],
    cam: { p0: [0, 1.4, 4.4], p1: [0, 1.4, 4.1], l0: [0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_gust', -18], [1.3, 'text_pa', -10]],
    tags(lt) { const p = scr(S.hero.userData.head.getWorldPosition(V(0, 0, 0)), -70, -330); return lt > 1.2 ? [{ t: 1.2, text: '約100W', x: p[0], y: Math.max(p[1], 440), h: 92, bg: '#ffffff' }] : []; },
    note: '1日約2,000kcalの熱 ≒ 約100W（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0); s.hero.rotation.y = 0.25;
      s.P.lamp.position.set(0.7, 2.2, -0.2); s.P.lamp.scale.setScalar(1.3);
      waves(s, lt, -0.3, 1.95, 0.1, 1.3, 0.8);
      h.reach('R', V(0.32, 1.7, 0.3)); h.hand('R', 'pa'); h.arm('L', 0.2, 0.4, 0.4);
      h.face({ lid: 0.1, brow: 0.2, look: [0.6, 0.4], mouth: 'smile' }); h.head.rotation.set(-0.12, -0.2, 0);
    } },
  // 3) sleeping charges the phone 53 times
  { sc: 'st', say: ['sleep'], pal: ['#3f4f9a', '#cfd6f5', '#ffd23a'], dim: 0.85, show: ['bed', 'phone'],
    cam: { p0: [-0.15, 1.7, 3.9], p1: [-0.15, 1.65, 3.7], l0: [-0.15, 0.85, 0] },
    sfx: [[0.2, 'comic_pico', -15], [1.3, 'countdown_elec', -15], [2.2, 'text_pa', -10]],
    stamps: [{ t: 0.3, text: 'Zzz', x: 300, y: 820, rot: -8, color: '#ffffff', size: 90, dur: 2.0 }],
    cards(lt) { const n = Math.round(53 * ease(k(lt, 0.9, 2.5))); return lt > 0.8 ? [{ t: 0.8, text: `スマホ [${n}回分]`, y: 480, size: 72, border: CY }] : []; },
    note: '8時間×100W＝800Wh、スマホ1回≒15Wh（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.P.bed.position.set(0, 0, 0);
      s.hero.rotation.z = Math.PI / 2; s.hero.scale.setScalar(0.8); s.hero.position.set(0.62, 0.62, 0.05);
      h.arm('L', 0, 0.12, 0); h.arm('R', 0, 0.12, 0);
      h.face({ lid: 1, brow: 0, look: [0, 0], mouth: 'smile' });
      const p = s.P.phone; p.position.set(0.55, 0.47, 0.3); p.rotation.x = -1.2; p.scale.setScalar(1.3);
      battery(s, (lt * 0.8) % 1);
      waves(s, lt, -0.15, 0.85, 0.05, 0.8, 0.6);
      bolts(s, lt, V(-0.2, 0.75, 0.25), V(0.55, 0.52, 0.35), 2, 1.0, 0.7);
    } },
  // 4) running: ~800 W, same as a microwave
  { sc: 'st', say: ['run'], pal: ['#59c3ff', '#e6f6ff', '#ffffff'], show: ['mw', 'counter'],
    cam: { p0: [0.1, 1.35, 4.5], p1: [0.1, 1.35, 4.3], l0: [0.1, 1.2, 0] },
    sfx: [[0.1, 'whoosh_swing', -15], [1.6, 'text_pa', -9], [2.4, 'comic_pico', -13]],
    tags(lt) {
      const out = [{ text: '走る', x: 287, y: 470, h: 70, bg: CY }, { text: '電子レンジ', x: 793, y: 470, h: 70, bg: '#ffffff' }];
      if (lt > 1.0) out.push({ t: 1.0, text: '約800W', x: 287, y: 560, h: 76, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' });
      if (lt > 2.2) out.push({ t: 2.2, text: '800W', x: 793, y: 560, h: 76, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' });
      return out;
    },
    note: 'ランニング約10メッツ×体重70kg ≒ 約800W（試算）',
    act(lt, s) {
      const h = s.hero.userData, ph = lt * 9, sw = Math.sin(ph);
      s.P.counter.position.set(0.95, 0, -0.5); s.P.counter.scale.set(0.5, 1, 1);
      s.P.mw.position.set(0.85, 0.93, -0.45); s.P.mw.scale.setScalar(1.15); s.P.mw.userData.glow.visible = true;
      s.hero.position.set(-0.55, Math.abs(Math.cos(ph)) * 0.08, 0.2); s.hero.rotation.y = 0.5;
      h.arm('L', sw * 0.9, 0.15, 1.3); h.arm('R', -sw * 0.9, 0.15, 1.3); h.body.rotation.x = 0.12;
      waves(s, lt, -0.55, 1.95, 0.2, 1.4, 1.6);
      h.face({ lid: 0.25, brow: 0.6, look: [0.4, 0], mouth: 'o', open: 0.6 + Math.abs(sw) * 0.4 });
    } },
  // 4b) a classroom of 30: 3 kW = more than 2 hair dryers
  { sc: 'st', say: ['class'], pal: ['#f3e3c3', '#e8cfa0', '#c79a5b'], hero2: true, show: ['board', 'crowd'],
    cam: { p0: [0, 1.45, 4.8], p1: [0, 1.45, 4.7], l0: [0, 1.3, 0] },
    sfx: [[0.2, 'comic_pico', -14], [1.9, 'text_pa', -9], [3.4, 'comic_jajean', -12]],
    tags(lt) { return lt > 0.4 ? [{ t: 0.4, text: '30人', x: 240, y: 470, h: 80, bg: '#ffffff' }] : []; },
    cards(lt) { const out = lt > 1.8 ? [{ t: 1.8, text: '[3kW]', x: 720, y: 470, size: 76, border: CY }] : []; if (lt > 3.2) out.push({ t: 3.2, text: 'ドライヤー [2台以上]', y: 620, size: 62 }); return out; },
    note: '30人×100W＝3kW、ドライヤー1台≒1,200W',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.P.crowd.userData.items.forEach((p, i) => { p.visible = i < 12; p.position.y = Math.abs(Math.sin(lt * 4 + i)) * 0.03; });
      s.hero.position.set(-0.64, 0, 0.3); s.hero.rotation.y = 0.2; s.hero2.position.set(0.64, 0, 0.3); s.hero2.rotation.y = -0.2;
      h.arm('L', 2.7, 0.3, 0.2); h.arm('R', 0.1, 0.2, 0.3); h2.arm('R', 2.7, 0.3, 0.2); h2.arm('L', 0.1, 0.2, 0.3);
      waves(s, lt, 0, 1.9, 0.3, 1.5, 0.9);
      h.face({ lid: 0.1, browY: 1, look: [0.4, 0], mouth: 'o', open: 0.9 }); h2.face({ lid: 0.2, look: [-0.4, 0], mouth: 'smile' });
    } },
  // 5) crowded train car: 300 people, 30 kW
  { sc: 'st', say: ['train'], pal: ['#7bd88f', '#e8f6ea', '#3fae5b'], show: ['train', 'crowd'],
    cam: { p0: [0, 1.5, 4.8], p1: [0, 1.48, 4.5], l0: [0, 1.35, 0] },
    sfx: [[0.0, 'train_door', -14], [1.9, 'text_pa', -9], [3.6, 'comic_jajean', -11]],
    tags(lt) { return lt > 0.5 ? [{ t: 0.5, text: '300人', x: 240, y: 470, h: 80, bg: '#ffffff' }] : []; },
    cards(lt) { const t0 = 1.8, n = Math.round(37 * ease(k(lt, 3.0, 4.6))); const out = lt > t0 ? [{ t: t0, text: '[30kW]', x: 700, y: 470, size: 76, border: CY }] : []; if (lt > 3.0) out.push({ t: 3.0, text: `電子レンジ [${n}台]`, y: 620, size: 62 }); return out; },
    note: '定員約150人×乗車率200%と仮定（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.35);
      const it = s.P.crowd.userData.items; it.forEach((p, i) => { p.rotation.y = Math.sin(i * 1.7) * 0.4; p.position.y = Math.sin(lt * 3 + i) * 0.01; });
      h.reach('R', V(0.38, 2.1, -0.15)); h.arm('L', 0.1, 0.05, 0.2);
      waves(s, lt, -0.9, 1.9, -0.3, 1.6, 0.8);
      h.face({ lid: 0.4, brow: -0.6, look: [-0.4, 0], mouth: 'flat' }); h.head.rotation.set(0, 0.1, -0.08);
      h.body.scale.x = 0.94;
    } },
  // 5b) one day of body heat drives an EV about 15 km
  { sc: 'st', say: ['ev'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['car'],
    cam: { p0: [0.1, 1.4, 4.8], p1: [0.1, 1.4, 4.7], l0: [0.1, 1.05, 0] },
    sfx: [[0.3, 'countdown_elec', -15], [1.6, 'whoosh_slide', -12], [2.4, 'text_pa', -9]],
    cards(lt) { const n = Math.round(15 * ease(k(lt, 1.4, 2.8))); return lt > 1.2 ? [{ t: 1.2, text: `約[${n}km]`, y: 480, size: 84, border: CY }] : []; },
    note: '100W×24時間＝2.4kWh、電費 約6.5km/kWh（試算）',
    act(lt, s) {
      const h = s.hero.userData, go = ease(k(lt, 1.4, 3.2));
      s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.5;
      s.P.car.scale.setScalar(0.75); s.P.car.position.set(0.55 + go * 0.5, 0, -0.4); s.P.car.rotation.y = 0;
      bolts(s, lt, V(-0.55, 1.4, 0.4), V(0.45 + go * 0.5, 0.55, -0.1), 3, 1.5, 0.9);
      h.reach('R', V(-0.05, 1.3, 0.5)); h.hand('R', 'pa'); h.arm('L', 0.2, 0.3, 0.4);
      h.face({ lid: 0.15, brow: 0.2, look: [0.7, -0.1], mouth: go > 0.3 ? 'o' : 'smile', open: 0.9 });
    } },
  // 6) everyone in Japan: 12 GW = 12 reactors
  { sc: 'st', say: ['japan'], pal: ['#6bb6ff', '#eef6ff', '#2c3b6b'], show: ['towers'],
    cam: { p0: [0, 1.6, 4.9], p1: [0, 1.6, 4.6], l0: [0, 1.25, 0] },
    sfx: [[2.0, 'comic_pico', -15], [2.6, 'comic_pico', -15], [3.4, 'text_pa', -9], [3.5, 'sparkle', -12]],
    cards(lt) { const n = Math.round(12 * ease(k(lt, 2.0, 3.6))); return lt > 1.9 ? [{ t: 1.9, text: `原発 [${n}基分]`, y: 480, size: 76, border: CY }] : []; },
    note: '1.2億人×100W＝1,200万kW、原発1基≒100万kW',
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(12 * ease(k(lt, 2.0, 3.6)));
      s.P.towers.userData.items.forEach((t, i) => { t.visible = i < n; t.children[2].position.y = 0.78 + ((lt * 0.4 + i * 0.13) % 1) * 0.12; });
      s.hero.position.set(0, 0, 0.6); s.hero.scale.setScalar(0.95);
      h.arm('L', 0.2, 1.4, 0.2); h.arm('R', 0.2, 1.4, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0.1, browY: 1, look: [0, 0.2], mouth: 'o', open: 1.1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.5], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) heat -> electricity only by the temperature difference: 37 vs 25 C, at most ~4 %
  { sc: 'st', say: ['four'], pal: ['#b59cff', '#f3efff', '#ffffff'], show: ['thermoA', 'thermoB'], hud: HUD1, hudColor: RED,
    cam: { p0: [0, 1.35, 4.5], p1: [0, 1.35, 4.2], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [0.9, 'text_pa', -11], [4.1, 'comic_fall', -11]],
    tags(lt) { const out = [{ t: 0.3, text: '体温37℃', x: 230, y: 470, h: 70, bg: RED, fg: '#ffffff' }]; if (lt > 0.9) out.push({ t: 0.9, text: '気温25℃', x: 850, y: 470, h: 70, bg: CY }); return out; },
    cards(lt) { const out = []; if (lt > 1.4) out.push({ t: 1.4, text: '温度の[差]→電気', y: 600, size: 60 }); if (lt > 3.9) out.push({ t: 3.9, text: '最大 [約4%]', y: 740, size: 92, border: RED }); return out; },
    note: '上限＝1−気温÷体温（絶対温度）≒3.9%（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.P.thermoA.position.set(-0.85, 0.3, 0); s.P.thermoB.position.set(0.85, 0.3, 0);
      s.P.thermoA.userData.fill.scale.y = 0.85; s.P.thermoB.userData.fill.scale.y = 0.7;
      s.hero.position.set(0, 0, 0.1);
      const d = ease(k(lt, 3.9, 4.5));
      h.arm('L', 0.2, 0.3, 0.3 + d); h.arm('R', 0.2, 0.3, 0.3 + d); h.head.rotation.set(d * 0.15, 0, d * 0.12);
      h.face({ lid: 0.1 + d * 0.3, brow: -d, browY: d, look: [0, -d * 0.3], mouth: 'o', open: 0.4 + d * 0.8 });
    } },
  // 10) phone takes ~4 hours instead of 9 minutes
  { sc: 'st', say: ['phone2'], pal: ['#ffc94a', '#fff6dc', '#2c3b6b'], show: ['phone', 'clock'], hud: HUD1, hudColor: RED,
    cam: { p0: [0.1, 1.45, 3.7], p1: [0.1, 1.45, 3.5], l0: [0.1, 1.38, 0] },
    sfx: [[0.3, 'countdown_tick', -15, 1.6], [1.4, 'comic_boyon', -11]],
    cards: [{ t: 0.4, text: '9分 → [約4時間]', y: 480, size: 70 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.25, 0, 0); s.hero.rotation.y = 0.15;
      phoneIn(s, 'R', V(0.38, 1.22, 0.42)); battery(s, 0.12 + lt * 0.01);
      s.P.clock.position.set(0.85, 2.05, -1.2); s.P.clock.userData.mh.rotation.z = -lt * 2.2; s.P.clock.userData.hh.rotation.z = -lt * 0.25;
      h.arm('L', 0.4, 0.2, 1.6); h.head.rotation.set(0.15, -0.15, 0.12);
      h.face({ lid: 0.55, brow: -0.6, look: [0.6, -0.4], mouth: 'flat' });
    } },
  // 12) with today's tech: 3+ years for one full charge
  { sc: 'st', say: ['real'], pal: ['#8fe3c0', '#effbf5', '#2c3b6b'], show: ['phone', 'clock', 'desk', 'books'], hud: HUD1, hudColor: RED,
    cam: { p0: [0.05, 1.45, 4.2], p1: [0.05, 1.45, 4.0], l0: [0.05, 1.3, 0] },
    sfx: [[0.3, 'countdown_tick', -16, 2.0], [2.2, 'comic_fall', -11]],
    cards(lt) { const t0 = this.lt.real + 2.0; return lt > t0 ? [{ t: t0, text: 'スマホ満タン [3年以上]', y: 480, size: 64, border: RED }] : []; },
    note: '今の体温発電素子は数百μW程度（大学の研究報告）',
    act(lt, s) {
      const h = s.hero.userData; s.P.desk.position.set(0.1, 0, 0.1); s.hero.position.set(0.1, 0, -0.45);
      const p = s.P.phone; p.position.set(-0.12, 0.79, 0.2); p.rotation.x = -1.3; p.scale.setScalar(1.6); battery(s, 0.05);
      s.P.books.position.set(0.45, 0.77, 0.15); s.P.books.scale.setScalar(0.5); s.P.books.userData.items.forEach((it, i) => { it.visible = i < 8; });
      s.P.clock.position.set(-0.85, 2.0, -2.0); s.P.clock.userData.mh.rotation.z = -lt * 6; s.P.clock.userData.hh.rotation.z = -lt * 1.5;
      h.reach('L', V(-0.15, 0.82, 0.1)); h.reach('R', V(0.32, 0.82, 0.05));
      const d = ease(k(lt, 0.8, 2.2)); h.body.rotation.x = d * 0.12; h.head.rotation.set(0.2 + d * 0.1, 0.1, d * 0.15);
      h.face({ lid: 0.4 + d * 0.4, brow: -0.7, look: [-0.3, -0.6], mouth: 'flat' });
    } },
  // 13) good news: the colder the winter, the better
  { sc: 'st', say: ['good'], pal: ['#9fd4ff', '#f4fbff', '#ffffff'], show: ['snow', 'phone'], hud: HUD1, hudColor: CY,
    cam: { p0: [0, 1.5, 4.2], p1: [0, 1.48, 4.0], l0: [0, 1.38, 0] },
    sfx: [[0.0, 'sparkle', -11], [1.6, 'comic_jajean', -11]],
    cards(lt) { const t0 = this.lt.good + 1.6; return lt > t0 ? [{ t: t0, text: '0℃なら [約12%]', y: 480, size: 72, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData;
      s.P.snow.userData.items.forEach((m, i) => { const u = (lt * 0.25 + (i * 0.618) % 1) % 1; m.position.set(Math.sin(i * 12.9) * 1.8 + Math.sin(lt + i) * 0.05, 3.0 - u * 3.0, -1.6 + (i % 5) * 0.55); });
      const j = Math.abs(Math.sin(lt * 5)) * 0.05; h.body.position.y = j;
      phoneIn(s, 'R', V(0.4, 1.55 + j, 0.42)); battery(s, ease(k(lt, 0.5, 2.5)));
      h.arm('L', 2.6, 0.4, 0.2);
      bolts(s, lt, V(-0.1, 1.6, 0.3), V(0.4, 1.55, 0.45), 4, 1.8, 0.9);
      h.face({ lid: 0.15, browY: 1, look: [0.5, 0.2], mouth: 'o', open: 1.1 });
    } },
  // 14) bad news: a packed train car = one kettle
  { sc: 'st', say: ['bad'], pal: ['#ff8a65', '#ffe9df', '#3fae5b'], show: ['train', 'crowd', 'kettle'], hud: HUD1, hudColor: RED,
    cam: { p0: [0, 1.45, 4.7], p1: [0, 1.45, 4.5], l0: [0, 1.3, 0] },
    sfx: [[1.3, 'comic_boyon', -11], [2.9, 'comic_shock2', -9]],
    cards(lt) { const t0 = this.lt.bad + 2.6; return lt > t0 ? [{ t: t0, text: 'ケトル [1台分]', y: 480, size: 76 }] : []; },
    note: '30kW×約4%≒1.2kW（電気ケトル約1台）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0.45); s.hero.rotation.y = 0.3;
      s.P.crowd.userData.items.forEach((p, i) => { p.rotation.y = Math.sin(i * 1.7) * 0.4; });
      const kt = s.P.kettle; kt.position.set(0.5, 0.82, 0.55); kt.scale.setScalar(1.2);
      h.reach('R', V(0.36, 0.86, 0.55)); h.hand('R', 'pa');
      const up = ease(k(lt, 2.4, 3.2)); h.arm('L', 0.2, 0.25, 1.6 * up); h.head.rotation.set(-0.2 * up, -0.2, 0);
      h.face({ lid: 0, brow: -1, browY: up, look: [0.5, -0.3 + up * 0.4], mouth: 'o', open: 0.5 + up * 0.7 });
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], hud: HUD0, show: ['phone'],
    cam: { p0: [0, 1.5, 3.9], p1: [0, 1.5, 3.5], l0: [0, 1.42, 0] },
    sfx: [[0.0, 'question', -11], [1.3, 'text_pa', -11], [1.5, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.2; return lt > t0 ? [{ t: t0, text: 'したい', x: 310, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; h.head.rotation.set(0, 0, Math.sin(lt * 1.6) * 0.12);
      phoneIn(s, 'R', V(0.38, 1.25, 0.42)); battery(s, 0.6);
      waves(s, lt, 0, 1.95, 0.1, 1.0);
      h.face({ lid: 0.12, browY: 1, look: [0, 0], mouth: 'smile' }); h.arm('L', 0.1, 0.2, 0.3);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも体の熱で', '[発電]できたら？'], titleEnd: at('phone') - 0.1, hud: HUD0,
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; return st; } },
});
