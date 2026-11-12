// ep23 (pop スタイル): もしも重力が2倍になったら？（アームA：原因を拡大）
// 前提: 重力加速度 g=9.8 → 19.6 m/s²。体・筋力・空気の量はそのまま。空気抵抗は無視。
// ジャンプ: 踏み切りの速さが同じなら h=v²/2g → 40cm が 20cm
// 落下: t=√(2h/g)、高さ1m → 0.45秒 が 0.32秒（約29%短い＝キャッチの猶予が約3割減）
// 打球: 同じ速さ・角度なら飛距離 R=v²sin2θ/g → 100m が 50m
// 振り子時計: 周期 T=2π√(L/g) → 1/√2 倍 → 1日24時間で 24×(√2−1)≒9.9時間 進む
// 気圧: 空気の量が同じなら、気圧＝空気の重さ → 2気圧。水の沸点（Antoine式）≒120℃（圧力鍋と同程度）
// 体重50kg → 体感100kg（＋50kg を背負うのと同じ）／2Lペットボトル 2kg → 体感4kg
// 買い物袋（2L×3本）: 6kg → 体感12kg
// すべり台: 高さ2m・摩擦なし v=√(2gh) → 時速22.5km が 31.9km
// 雨粒: 大粒の終端速度 約9m/s は √g に比例 → 約1.4倍（12.7m/s）
// 血圧: 心臓→頭 約30cm 分の水柱圧 ρgh＝約23mmHg → 約47mmHg
import { run, THREE, V, clamp, ease, lerp } from '../engine/core.js';
import { buildToyStage } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep23_juuryoku2.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f';
const BODY = ['体の負担', '×2'];
let S;
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 150, 900), y + dy]; };

const plan = [
  // 1) hook: full-power jump, but only half as high
  { sc: 'st', say: ['hook', 'jump'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['rulerA'],
    cam: { p0: [0.1, 1.35, 4.5], p1: [0.1, 1.3, 4.0], l0: [0.05, 1.2, 0], l1: [0.05, 1.15, 0] },
    sfx: [[0.02, 'text_impact', -9], [0.75, 'comic_boyon', -12], [1.95, 'comic_boyon', -13], [3.25, 'comic_boyon', -13], [4.2, 'text_pa', -9]],
    stamps: [{ t: 0.85, text: 'ぴょん…', x: 300, y: 1180, rot: -8, color: '#ffd23a', size: 100, dur: 1.0 }, { t: 3.35, text: 'ひくっ！', x: 760, y: 1180, rot: 8, color: '#ffffff', size: 100, dur: 1.1 }],
    cards(lt) { const t0 = this.lt.jump + 1.6; return lt > t0 ? [{ t: t0, text: 'ジャンプ 40cm→[20cm]', x: 540, y: 1330, size: 62, border: CY }] : []; },
    note: '踏み切りの速さが同じと仮定（試算）',
    act(lt, s) {
      const h = s.hero.userData, p = ((lt + 0.4) % 1.25) / 1.25;
      const crouch = p < 0.3 ? Math.sin(p / 0.3 * Math.PI) : 0, air = p >= 0.3 && p < 0.72 ? Math.sin((p - 0.3) / 0.42 * Math.PI) : 0;
      s.hero.position.set(-0.12, air * 0.2, 0.1); h.body.position.y = -crouch * 0.1;
      h.arm('L', crouch ? -0.5 : 2.4 * air, 0.3, 0.2); h.arm('R', crouch ? -0.5 : 2.4 * air, 0.3, 0.2);
      s.P.rulerA.position.set(0.62, 0.33, 0.1);
      h.face(air > 0.1 ? { lid: 0.1, brow: 0.6, look: [0, 0.3], mouth: 'o', open: 0.8 } : { lid: 0.35, brow: -0.6, look: [0.4, -0.3], mouth: 'flat' });
      h.head.rotation.set(air > 0.1 ? -0.1 : 0.1, -0.1, 0);
    } },
  // 2) dropped glasses: normal vs 2G (shown 5x slower)
  { sc: 'st', say: ['drop'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], hero: false, show: ['glassA', 'glassB'],
    cam: { p0: [0, 0.75, 3.1], p1: [0, 0.75, 2.95], l0: [0, 0.62, 0] },
    sfx: [[0.9, 'whoosh_slide', -15], [2.5, 'text_pa', -10], [3.15, 'text_pa', -9]],
    tags(lt) {
      const r = this.lt.drop + 0.9, uA = k(lt, r, r + 2.26), uB = k(lt, r, r + 1.6);
      const out = [{ text: 'ふつう', x: 300, y: 470, h: 100, bg: '#ffffff' }, { text: '重力2倍', x: 780, y: 470, h: 100, bg: CY },
        { text: (0.45 * uA).toFixed(2) + '秒', x: 300, y: 590, h: 84, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' },
        { text: (0.32 * uB).toFixed(2) + '秒', x: 780, y: 590, h: 84, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' }];
      return out;
    },
    note: '高さ1mから落とした場合（5倍スロー・試算）',
    act(lt, s, gt, sh) {
      const r = sh.lt.drop + 0.9, uA = k(lt, r, r + 2.26), uB = k(lt, r, r + 1.6);
      s.P.glassA.position.set(-0.36, 1.0 * (1 - uA * uA), 0); s.P.glassB.position.set(0.36, 1.0 * (1 - uB * uB), 0);
      s.P.glassA.scale.setScalar(1.5); s.P.glassB.scale.setScalar(1.5);
    } },
  // 3) trying to catch: too late
  { sc: 'st', say: ['catch'], pal: ['#6bb6ff', '#eef6ff', '#ffffff'], show: ['counter', 'glassA'],
    cam: { p0: [0.3, 1.45, 3.9], p1: [0.3, 1.4, 3.7], l0: [0.25, 1.05, 0] },
    sfx: [[0.62, 'whoosh_swing', -13], [0.75, 'comic_fall', -11]],
    stamps: [{ t: 0.8, text: 'あっ…', x: 760, y: 1250, rot: 8, color: '#ffd23a', size: 110, dur: 1.2 }],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: 'キャッチの猶予 [−3割]', y: 480, size: 64, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(-1.12, 0, -0.2);
      s.hero.position.set(0.8, 0, 0.15); s.hero.rotation.y = -0.45;
      const slide = ease(k(lt, 0.1, 0.45)), fall = k(lt, 0.45, 0.75), g = s.P.glassA;
      if (lt < 0.45) g.position.set(lerp(-0.3, 0.08, slide), 0.93, 0);
      else { g.position.set(0.16, 0.93 * (1 - fall * fall), 0.3); if (fall >= 1) { g.rotation.z = -1.45; g.position.set(0.3, 0.08, 0.35); } }
      g.scale.setScalar(1.2);
      const sw = ease(k(lt, 0.55, 0.8)); h.reach('R', V(lerp(0.62, 0.36, sw), lerp(1.1, 0.55, sw), lerp(0.4, 0.3, sw))); h.arm('L', 0.1, 0.25, 0.3);
      h.face(lt < 0.6 ? { lid: 0.2, look: [-0.6, -0.3], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [-0.4, -0.7], mouth: 'o', open: 1.0 });
      h.head.rotation.set(lt < 0.6 ? 0.1 : 0.3, 0.2, 0);
    } },
  // 4) home run that lands at half the distance
  { sc: 'st', say: ['homerun'], pal: ['#8fd3ff', '#52b45a', '#ffffff'], show: ['ball', 'bat'],
    cam: { p0: [0.2, 1.3, 4.9], p1: [0.2, 1.3, 4.7], l0: [0.2, 1.1, 0] },
    sfx: [[0.3, 'whoosh_slide', -16], [1.22, 'impact_don', -9], [2.35, 'comic_fall', -11], [3.2, 'text_pa', -9]],
    stamps: [{ t: 1.22, text: 'カキーン！', x: 420, y: 760, rot: -8, color: '#ffd23a', size: 112, dur: 0.9 }, { t: 2.35, text: 'ポトッ', x: 800, y: 1060, rot: 8, color: '#ffffff', size: 100, dur: 1.0 }],
    cards(lt) { const t0 = this.lt.homerun + 3.0; return lt > t0 ? [{ t: t0, text: '飛距離 100m→[50m]', y: 480, size: 68, border: CY }] : []; },
    note: '同じ打球の速さ・空気抵抗なし（試算）',
    act(lt, s) {
      const h = s.hero.userData, sw = ease(k(lt, 1.08, 1.28));
      s.hero.position.set(-0.25, 0, 0); s.hero.rotation.y = 1.25 - sw * 1.25;
      h.arm('R', 1.15, 0.25, 1.1); h.arm('L', 1.15, -0.15, 1.1);
      const bat = s.P.bat; h.arms[1].hand.add(bat); bat.position.set(0, 0, 0); bat.rotation.set(-2.4 + sw * 1.2, 0, 0.3);
      const b = s.P.ball;
      if (lt < 1.2) b.position.set(lerp(1.2, 0.12, k(lt, 0.3, 1.2)), 1.08, 0.3);
      else { const f = Math.min(lt - 1.2, 1.12); b.position.set(0.12 + f * 0.62, Math.max(0.08, 1.08 + f * 2.4 - 3 * f * f), 0.3 - f * 0.2); }
      b.rotation.z = lt * 3;
      const after = lt > 2.3; h.face(lt < 1.1 ? { lid: 0.45, brow: 0.5, look: [0.8, 0], mouth: 'flat' } : after ? { lid: 0, brow: -1, browY: 1, look: [0.7, -0.6], mouth: 'o', open: 0.9 } : { lid: 0.1, look: [0.6, 0.4], mouth: 'smile' });
    } },
  // 4b) slide: 23 km/h -> 32 km/h
  { sc: 'st', say: ['slide'], pal: ['#ffd23a', '#fff6dc', '#3f6fd8'], show: ['slide'], lines: [[0.3, 3.0]],
    cam: { p0: [-0.1, 1.2, 5.9], p1: [-0.1, 1.18, 5.6], l0: [-0.1, 0.95, 0] },
    sfx: [[0.3, 'whoosh_slide', -12], [1.6, 'whoosh_slide', -13], [2.2, 'text_pa', -10]],
    stamps: [{ t: 0.9, text: 'ビューン！', x: 760, y: 1250, rot: 8, color: '#ffffff', size: 100, dur: 1.0 }],
    tags(lt) { return lt > 1.0 ? [{ t: 1.0, text: 'ふつう 23km/h', x: 330, y: 470, h: 96, bg: '#ffffff' }, { t: 2.0, text: '重力2倍 32km/h', x: 690, y: 590, h: 108, bg: CY }] : []; },
    note: '高さ2m・摩擦なし（試算）',
    act(lt, s) {
      const h = s.hero.userData, u = ((lt + 0.2) % 1.3) / 1.3, f = ease(clamp(u / 0.55));
      s.P.slide.position.set(0, 0, -0.1);
      const x = lerp(-0.85, 0.45, f), y = 1.2 - (x + 0.8) * 0.75; s.hero.position.set(x, Math.max(0, y) - 0.04, 0); s.hero.rotation.y = -0.5; s.hero.scale.setScalar(0.8);
      h.body.rotation.z = -0.35; h.arm('L', 2.6, 0.4, 0.2); h.arm('R', 2.6, 0.4, 0.2);
      h.face({ lid: 0, brow: 0.2, browY: 0.8, look: [0.5, -0.2], mouth: 'o', open: 1.2 });
    } },
  // 5) pendulum clock runs fast
  { sc: 'st', say: ['clock'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['pclock'],
    cam: { p0: [0.05, 1.38, 4.4], p1: [0.05, 1.36, 4.2], l0: [0.05, 1.2, 0] },
    sfx: [[0.2, 'countdown_tick', -14, 2.6]],
    stamps: [{ t: 0.4, text: 'カチカチカチ', x: 780, y: 640, rot: 8, color: '#ffffff', size: 70, dur: 1.4 }],
    cards(lt) { const t0 = this.lt.clock + 1.3; return lt > t0 ? [{ t: t0, text: '1日で [+10時間]', y: 480, size: 72, border: CY }] : []; },
    note: '振り子の周期は√(長さ÷重力)に比例（試算）',
    act(lt, s) {
      const h = s.hero.userData, c = s.P.pclock.userData; s.P.pclock.position.set(0.55, 0, -0.3); s.P.pclock.rotation.y = -0.25;
      c.pend.rotation.z = 0.35 * Math.sin(lt * Math.PI * 2 / 0.7); c.mh.rotation.z = -lt * 2.2; c.hh.rotation.z = -lt * 0.18 - 1;
      s.hero.position.set(-0.4, 0, 0.15); s.hero.rotation.y = 0.45;
      h.reach('R', V(0.12, 1.2, 0.3)); h.arm('L', 0.1, 0.25, 1.6);
      h.face({ lid: 0, brow: -0.6, browY: 0.6, look: [0.8, 0.2 + Math.sin(lt * 9) * 0.15], mouth: 'o', open: 0.6 }); h.head.rotation.set(-0.05, -0.3, 0);
    } },
  // 5b) raindrops fall 1.4x faster (only the drops move: no screen flashing)
  { sc: 'st', say: ['rain'], pal: ['#5b7bb3', '#dfe8f5', '#ffffff'], dim: 0.95, show: ['umbrella', 'snow'],
    cam: { p0: [0, 1.6, 4.6], p1: [0, 1.58, 4.4], l0: [0, 1.45, 0] },
    sfx: [[0.2, 'amb_wind', -18, 3.2], [1.6, 'comic_pico', -15], [1.9, 'comic_pico', -15], [2.2, 'comic_pico', -15]],
    stamps: [{ t: 1.6, text: 'バチバチ', x: 790, y: 720, rot: 8, color: '#ffffff', size: 90, dur: 1.5 }],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '雨粒 [×1.4] の速さ', y: 480, size: 66, border: CY }] : []; },
    note: '大粒の雨・空気抵抗とつり合う速さ（試算）',
    act(lt, s) {
      const h = s.hero.userData, hp = V(0.12, 1.05, 0.32);
      h.reach('R', hp); h.arm('L', 0.3, 0.3, 1.6);
      s.P.umbrella.position.set(hp.x, hp.y - 0.12, hp.z); s.P.umbrella.rotation.z = Math.sin(lt * 20) * 0.02;
      s.P.snow.userData.items.forEach((m, i) => { const sx = ((i * 37) % 23) / 23, sz = ((i * 13) % 7) / 7, u = (lt * 1.6 + i / 40 * 3.1) % 1;
        const x = -1.4 + sx * 2.8, z = -0.8 + sz * 1.4, top = Math.hypot(x - hp.x, z - hp.z) < 0.6 ? 2.0 : 0.02;
        m.position.set(x, Math.max(top, 3.2 - u * 3.4), z); m.scale.set(0.012, 0.07, 0.012); });
      h.face({ lid: 0.1, brow: -0.6, browY: 0.7, look: [0, 0.7], mouth: 'o', open: 0.6 }); h.head.rotation.set(-0.25, 0, 0);
    } },
  // 6) heavier air: 2 atm, water boils at about 120 C
  { sc: 'st', say: ['boil'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['counter', 'kettle', 'heat'],
    cam: { p0: [0.05, 1.42, 3.7], p1: [0.05, 1.4, 3.5], l0: [0.05, 1.22, 0] },
    sfx: [[0.3, 'whoosh_gust', -16], [2.4, 'text_pa', -10]],
    cards(lt) { const t0 = this.lt.boil + 2.4; return lt > t0 ? [{ t: t0, text: '沸点 100℃→[120℃]', y: 480, size: 70, border: CY }] : []; },
    note: '空気の量が同じなら2気圧。沸点は約120℃（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(0, 0, -0.2); s.hero.position.set(0.3, 0, -0.95);
      s.P.kettle.position.set(-0.28, 0.93, -0.05); s.P.kettle.scale.setScalar(1.35);
      s.P.heat.position.set(-0.28, 1.3, -0.05); s.P.heat.scale.setScalar(0.7); s.P.heat.userData.items.forEach((m, i) => { m.position.y = ((lt * 0.4 + i / 3) % 1) * 0.25; });
      s.P.thermoA.position.set(-0.7, 0.93, 0.05); s.P.thermoA.scale.setScalar(0.55); s.P.thermoA.userData.fill.scale.y = lerp(0.55, 0.95, ease(k(lt, 2.0, 3.6)));
      h.face({ lid: 0.25, brow: 0.3, look: [0.3, -0.6], mouth: lt > 2.4 ? 'o' : 'smile', open: 0.7 }); h.head.rotation.set(0.2, 0.15, 0);
      h.reach('L', V(-0.05, 0.98, -0.2)); h.reach('R', V(0.55, 1.15, -0.1));
    } },
  // 7) the whole house is a pressure cooker
  { sc: 'st', say: ['nabe'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['counter', 'bowl'],
    cam: { p0: [0, 1.45, 3.6], p1: [0, 1.42, 3.3], l0: [0, 1.25, 0] },
    sfx: [[0.15, 'whoosh_gust', -13], [0.5, 'comic_jajean', -11]],
    stamps: [{ t: 0.3, text: 'シューッ！', x: 300, y: 760, rot: -8, color: '#ffffff', size: 104, dur: 1.4 }],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '家じゅう[圧力鍋]', y: 480, size: 74, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(0, 0, -0.2); s.hero.position.set(0.25, 0, -0.95);
      s.P.bowl.position.set(-0.25, 0.93, 0); s.P.bowl.scale.setScalar(1.6);
      s.P.bowl.userData.steam.forEach((m, i) => { const u = (lt * 0.8 + i / 3) % 1; m.position.set((i - 1) * 0.07 + Math.sin(u * 6 + i) * 0.03, 0.26 + u * 0.5, 0); m.scale.setScalar(0.05 * (1 - u * 0.5)); });
      h.face({ lid: 0, brow: -0.4, browY: 0.8, look: [-0.4, -0.5], mouth: 'o', open: 1.1 }); h.head.rotation.set(0.1, 0.2, 0);
      h.arm('L', 0.4, 0.4, 1.9); h.reach('R', V(0.6 + Math.sin(lt * 14) * 0.06, 1.5, -0.55));
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.6], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) always carrying another 50 kg (piggyback)
  { sc: 'st', say: ['weight'], pal: ['#b59cff', '#f3efff', '#ffffff'], hero2: true, hud: BODY, hudColor: RED,
    cam: { p0: [1.3, 1.65, 4.6], p1: [1.25, 1.62, 4.4], l0: [0, 1.5, 0] },
    sfx: [[0.3, 'comic_boyon', -12], [1.6, 'giant_step', -15], [2.6, 'giant_step', -15]],
    stamps: [{ t: 0.4, text: 'ずしっ…', x: 300, y: 1250, rot: -8, color: '#ffd23a', size: 104, dur: 1.2 }],
    cards(lt) { const t0 = this.lt.weight + 1.6; return lt > t0 ? [{ t: t0, text: 'ずっと[50kg]をおんぶ', y: 480, size: 64, border: RED }] : []; },
    note: '体重50kgの人は、体感100kg（試算）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, w = Math.sin(lt * 3.2);
      s.hero.position.set(w * 0.04, 0, 0.15); s.hero.rotation.y = 0.15; h.body.rotation.x = 0.28; h.body.rotation.z = w * 0.04;
      s.hero2.position.set(w * 0.04, 1.12, -0.5); s.hero2.rotation.set(0.45, 0.15, w * 0.04); s.hero2.scale.setScalar(0.85);
      h.reach('L', V(-0.24, 0.6, 0.5)); h.reach('R', V(0.3, 0.6, 0.5));
      h2.arm('L', 1.3, 0.1, 0.9); h2.arm('R', 1.3, 0.1, 0.9);
      h.face({ lid: 0.55, brow: -0.9, look: [0, -0.2], mouth: 'flat' }); h.head.rotation.set(-0.3, 0, 0);
      h2.face({ lid: 0.3, look: [0.2, -0.2], mouth: 'smile' });
    } },
  // 10) 2 L bottle feels like 4 kg
  { sc: 'st', say: ['bottle'], pal: ['#8fe3c0', '#effbf5', '#ffffff'], show: ['bag', 'bottle'], hud: BODY, hudColor: RED,
    cam: { p0: [0, 1.32, 4.1], p1: [0, 1.3, 3.9], l0: [0, 1.12, 0] },
    sfx: [[0.3, 'impact_don', -13], [2.3, 'text_pa', -10]],
    stamps: [{ t: 0.35, text: 'おもっ！', x: 780, y: 1300, rot: 8, color: '#ffd23a', size: 100, dur: 1.2 }],
    tags(lt) { if (lt < 1.2) return []; const p = scr(S.P.bag.position, 0, 120); return [{ t: 1.2, text: '袋は体感12kg', x: p[0], y: p[1], h: 74, bg: '#ffffff' }]; },
    cards(lt) { const t0 = this.lt.bottle + 1.6; return lt > t0 ? [{ t: t0, text: '2L → 体感[4kg]', y: 480, size: 68, border: RED }] : []; },
    act(lt, s) {
      const h = s.hero.userData, sh = Math.sin(lt * 28) * 0.008;
      s.hero.position.set(-0.05, 0, 0.1); h.body.rotation.z = -0.07;
      const hr = V(0.36, 0.72 + sh, 0.18), hl = V(-0.42, 1.12 + sh, 0.35);
      h.reach('R', hr); h.reach('L', hl);
      s.P.bag.position.set(hr.x, hr.y - 0.4, hr.z); s.P.bottle.position.set(hl.x, hl.y - 0.16, hl.z + 0.05);
      h.face({ lid: 0.45, brow: -0.8, look: [-0.5, 0.1], mouth: 'o', open: 0.5 }); h.head.rotation.set(0, 0.25, 0.08);
    } },
  // 11) harder to push blood up to the head: dizzy when standing up
  { sc: 'st', say: ['blood'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['bed'], hud: BODY, hudColor: RED,
    cam: { p0: [0, 1.45, 4.4], p1: [0, 1.43, 4.2], l0: [0, 1.25, 0] },
    sfx: [[2.8, 'comic_fall', -13]],
    stamps: [{ t: 2.8, text: 'クラッ…', x: 760, y: 700, rot: 8, color: '#ffffff', size: 100, dur: 1.4 }],
    tags(lt) { if (lt > 2.6) return []; const p = scr(S.hero.userData.head.getWorldPosition(V(0, 0, 0)), 0, -300); return [{ t: 0.4, text: '頭まで 圧×2', x: p[0], y: Math.max(p[1], 430), h: 76, bg: RED, fg: '#ffffff' }]; },
    cards(lt) { return lt > 2.7 ? [{ t: 2.7, text: '[立ちくらみ]増えそう', y: 480, size: 66, border: RED }] : []; },
    note: '心臓→頭 約30cm：約23→47mmHg（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.P.bed.position.set(0.55, 0, -0.45); s.P.bed.rotation.y = 0.2;
      const up = ease(k(lt, 0.1, 1.2)), dz = k(lt, 2.6, 3.2);
      s.hero.position.set(-0.3, 0, 0.15); h.body.position.y = -0.25 * (1 - up); h.body.rotation.x = 0.3 * (1 - up);
      s.hero.rotation.z = Math.sin(lt * 3) * 0.06 * dz;
      h.head.rotation.set(0, 0, Math.sin(lt * 4) * 0.18 * dz);
      h.arm('L', 0.2, 0.3, 0.3); h.arm('R', 0.2 + dz * 0.9, 0.3, 1.9 * dz);
      h.face(dz > 0 ? { lid: 0.6, brow: -0.9, look: [Math.sin(lt * 6) * 0.5, Math.cos(lt * 6) * 0.3], mouth: 'o', open: 0.4 } : { lid: 0.3, look: [0.2, 0.3], mouth: 'flat' });
    } },
  // 14) bad news: the bathroom scale reads 100 kg
  { sc: 'st', say: ['bad'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['scale'], hud: BODY, hudColor: RED,
    cam: { p0: [0, 1.3, 4.3], p1: [0, 1.3, 4.1], l0: [0, 1.05, 0] },
    sfx: [[1.0, 'countdown_tick', -15, 1.2], [2.3, 'comic_shock2', -9]],
    cards(lt) { const t0 = this.lt.bad + 1.0, n = Math.round(lerp(50, 100, ease(k(lt, t0, t0 + 1.2)))); return lt > t0 ? [{ t: t0, text: `体重計 [${n}kg]`, y: 480, size: 80, border: RED }] : []; },
    act(lt, s) {
      const h = s.hero.userData, t0 = 1.0, up = ease(k(lt, t0 + 1.2, t0 + 1.6));
      s.P.scale.position.set(0, 0, 0.12); s.hero.position.set(0, 0.06, 0.12);
      h.head.rotation.set(0.35 - up * 0.5, 0, 0);
      h.face(up > 0 ? { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.2 } : { lid: 0.3, look: [0, -0.8], mouth: 'flat' });
      h.arm('L', 0.2, 0.25, 1.7 * up); h.arm('R', 0.2, 0.25, 1.7 * up);
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], hud: ['重力', '×2'],
    cam: { p0: [0, 1.45, 4.3], p1: [0, 1.45, 3.9], l0: [0, 1.52, 0] },
    sfx: [[0.0, 'question', -11], [1.3, 'text_pa', -11], [1.5, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.2; return lt > t0 ? [{ t: t0, text: '住みたい', x: 310, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'ムリ', x: 700, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; h.head.rotation.set(0, 0, Math.sin(lt * 1.6) * 0.12);
      h.face({ lid: 0.12, browY: 1, look: [0, 0], mouth: 'smile' }); h.reach('R', V(0.16, 1.2, 0.36)); h.arm('L', 0.1, 0.2, 0.3);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも重力が', '[2倍]になったら？'], titleEnd: at('jump') - 0.1, hud: ['重力', '×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; return st; } },
});
