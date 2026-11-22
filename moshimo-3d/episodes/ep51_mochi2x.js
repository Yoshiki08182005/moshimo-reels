// ep51_mochi2x (pop / arm A 原因を拡大): もしもお餅が引っぱるたびに2倍伸びたら？
// 型は sp_geppu2x / ep50。台本・数字・小道具は自作。
// 前提（試算）: 1回目の伸び 20cm、n回目 = 0.2m×2^(n-1)。お餅1個 50g・密度1.2g/cm³（仮定）→ 体積 約41.7cm³
//   4回目 1.6m / 13回目 819m（東京スカイツリー 634m）/ 20回目 104.9km（宇宙の入口 高度100km）/ 32回目 42.9万km（月まで平均 約38.4万km）
//   太さ（円柱）: 20回目 直径 22.5μm ÷ 髪の毛 約0.08mm = 0.28 ≒ 4分の1 / 32回目 直径 0.35μm（可視光の波長 0.38〜0.78μm より細い）
//   32回目を1秒で伸ばす = 秒速42.9万km ÷ 光速 29.98万km/s = 1.43倍
import { run, THREE, V, clamp, ease, lerp, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep51_mochi2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#3b4a9a', '#e6e9ff', '#ffd23a'];
const MOON = V(1.15, 3.6, -1.9);

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // grilled kirimochi (centered)
  { const g = G(); rbox(0.15, 0.07, 0.11, 0.03, '#fffaf0', 0, 0, 0, g); for (const [x, z] of [[-0.03, 0.01], [0.04, -0.02]]) sph(0.025, '#e2b06a', x, 0.035, z, g, 1, 0.25, 1); reg('mochi', g); }
  // stretched mochi strand: unit cylinder from y=0 to y=1
  for (const n of ['st1', 'st2']) { const geo = new THREE.CylinderGeometry(1, 1, 1, 14); geo.translate(0, 0.5, 0); const m = new THREE.Mesh(geo, M('#fffaf0', 0.45)); m.castShadow = true; reg(n, m); }
  // moon
  { const g = G(); sph(0.6, basic('#fff1b8'), 0, 0, 0, g); for (const [x, y, r] of [[-0.2, 0.15, 0.12], [0.18, -0.12, 0.09], [0.05, 0.3, 0.06], [-0.12, -0.28, 0.07]]) sph(r, basic('#ecd88f'), x, y, 0.52, g, 1, 1, 0.3); g.traverse(o => o.castShadow = false); reg('moon', g); }
  // generic tall tower (origin at the floor)
  { const g = G(); cyl(0.1, 0.32, 3.4, '#d9e2ef', 0, 1.7, 0, g); cyl(0.3, 0.26, 0.22, '#9fb3cf', 0, 2.3, 0, g); cyl(0.22, 0.2, 0.14, '#9fb3cf', 0, 2.95, 0, g); cyl(0.015, 0.03, 0.9, '#d9e2ef', 0, 3.85, 0, g); reg('tower', g); }
  // stars on the wall
  { const g = G(); for (let i = 0; i < 46; i++) sph(0.03 + (i % 3) * 0.012, basic('#fff6c8'), Math.sin(i * 12.9898) * 5, 1.2 + ((i * 7.31) % 1) * 7, -2.3, g); g.traverse(o => o.castShadow = false); reg('stars', g); }
  // clouds
  { const g = G(); for (const [x, y, r] of [[-1.6, 2.6, 0.32], [-1.25, 2.7, 0.4], [-0.9, 2.6, 0.3], [1.4, 3.0, 0.3], [1.75, 3.1, 0.38], [2.1, 3.0, 0.28]]) sph(r, M('#ffffff', 0.9), x, y, -1.2, g, 1.3, 0.8, 0.8); g.traverse(o => o.castShadow = false); reg('cloud', g); }
  // a strand of hair (magnified) and a light beam
  { const geo = new THREE.CylinderGeometry(1, 1, 1, 14); geo.translate(0, 0.5, 0); reg('hairL', new THREE.Mesh(geo, M('#3b2a20', 0.5))); }
  reg('beam', rbox(2.6, 0.06, 0.06, 0.025, basic('#fff59a'), 0, 0, 0));
}

const place = (o, x, z, ry = 0, sc = 1, y = 0) => { o.visible = true; o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.setScalar(sc); return o; };
const hold = (s, name, side, p, who = s.hero, sc = 1) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); o.scale.setScalar(sc); who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, 0.04, -0.02))); return o; };
const UP = V(0, 1, 0);
function strand(s, name, a, b, r = 0.022) { const o = s.P[name]; const d = b.clone().sub(a); const L = d.length(); o.visible = L > 0.01; o.position.copy(a); o.quaternion.setFromUnitVectors(UP, d.normalize()); o.scale.set(r, L, r); return o; }
const mouth = (who) => { who.updateMatrixWorld(true); return who.userData.head.localToWorld(V(0, -0.2, 0.4)); };
// mochi in the mouth (bite) + strand to the hand
function bite(s, who = s.hero) { const m = s.P.mochi; const p = mouth(who); m.visible = true; m.position.copy(p).add(V(0, 0, 0.04)); m.scale.setScalar(0.8); return p; }
// moon shot: the strand flies from the hand to the moon at t0 (arrives at t0+0.28)
function moonShot(s, lt, t0, hx = -0.6, hz = 1.2) {
  const h = s.hero.userData; place(s.hero, hx, hz, 0.35); place(s.P.moon, MOON.x, MOON.z, 0, 1, MOON.y); s.P.stars.visible = true; s.P.stars.position.set(0, 0, 0);
  const pull = ease(k(lt, t0 - 0.25, t0)); h.arm('R', lerp(0.6, 2.6, pull), 0.4, lerp(1.6, 0, pull)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.6, 0.6); h.hand('L', 'pa');
  const p = bite(s); const hp = h.handPos('R'); const u = ease(k(lt, t0, t0 + 0.28)); const tip = hp.clone().lerp(MOON.clone().add(V(-0.35, -0.3, 0.3)), u);
  strand(s, 'st1', p, hp, 0.03); strand(s, 'st2', hp, tip, 0.03); return u >= 1;
}

const plan = [
  // 0) cold open (flash-forward of the 32nd pull): one tug and the mochi shoots to the moon; push in to the smug face still chewing
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [], dim: 0.85,
    cam: { p0: [0.2, 1.7, 7.6], p1: [-0.6, 1.55, 4.1], l0: [0.35, 2.3, -0.8], l1: [-0.6, 1.4, 1.2], hold: 1.15, dur: 1.9 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.22, 1.0]],
    sfx: [[0.0, 'comic_boyon', -10], [0.12, 'whoosh_gust', -11], [0.3, 'impact_doon', -10], [0.32, 'text_impact', -11], [1.4, 'whoosh_slide', -13], [2.2, 'comic_eat', -10]],
    stamps: [{ t: 0.3, text: '月まで!!', x: 560, y: 420, rot: -6, color: YEL, size: 96, dur: 1.1 },
      { t: 2.15, text: 'もぐっ', x: 640, y: 1430, rot: -5, color: '#ffffff', size: 58, dur: 0.8 }],
    act(lt, s) {
      moonShot(s, lt, 0.05); const h = s.hero.userData;
      if (lt < 1.3) h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.7], mouth: 'o', open: 0.9 });
      else { s.hero.rotation.y = lerp(0.35, 0.05, ease(k(lt, 1.3, 1.8))); h.face({ lid: 0.55, brow: 0.7, look: [0, 0], mouth: lt > 2.1 ? 'o' : 'smile', open: 0.35 }); h.head.rotation.z = 0.1 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title: biting a grilled mochi, a little stretch
  { sc: 'st', say: ['hook'], pal: ['#ff9fb8', '#fff0f4', '#ffd23a'], show: [],
    cam: { p0: [0.05, 1.5, 4.6], p1: [0.05, 1.48, 4.3], l0: [0.05, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.3, 'comic_boyon', -12]],
    stamps: [{ t: 1.7, text: '2倍?!', x: 820, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.3, 0.1); const u = ease(k(lt, 1.0, 1.6));
      h.arm('R', lerp(1.7, 1.2, u), 0.35, lerp(1.9, 0.9, u)); h.hand('R', 'gu'); h.arm('L', 0.4, 0.5, 1.5); h.hand('L', 'pa');
      const p = bite(s); strand(s, 'st1', p, h.handPos('R'), 0.025);
      h.face(lt < 1.2 ? { lid: 0.5, brow: 0.4, look: [0, 0], mouth: 'o', open: 0.3 } : { lid: 0, brow: 0.6, browY: 1, look: [0.4, -0.3], mouth: 'o', open: 0.5 });
    } },
  // 2) 1st: 20 cm
  { sc: 'st', say: ['first'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#e2463c'], show: [], hud: ['お餅', '×2'],
    cam: { p0: [0.0, 1.5, 4.4], p1: [0.0, 1.47, 4.1], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'comic_boyon', -12], [1.8, 'comic_pico', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '1回目 [20センチ]', y: 480, size: 74, border: CY, sub: 'いつもの伸び（試算の前提）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: '引っぱるたび', x: 300, y: 1090, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '2倍!', x: 760, y: 1090, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.3, 0.2); const u = ease(k(lt, 0.5, 1.0));
      h.arm('R', lerp(1.3, 0.9, u), 0.6, lerp(1.0, 0.2, u)); h.hand('R', 'gu'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      const p = bite(s); strand(s, 'st1', p, h.handPos('R'), 0.022);
      h.face({ lid: 0.3, brow: 0.5, look: [0.4, -0.2], mouth: 'o', open: 0.3 });
    } },
  // 3) 4th: 1.6 m, the friend holds the other end
  { sc: 'st', say: ['b4'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [], hero2: true, hud: ['4回目', '1.6m'],
    cam: { p0: [0.0, 1.55, 6.4], p1: [0.0, 1.5, 6.0], l0: [0.1, 1.2, 0] },
    sfx: [[0.2, 'comic_boyon', -11], [0.4, 'text_pa', -10], [1.8, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '4回目 [1.6メートル]', y: 480, size: 72, border: CY, sub: '20cm×2×2×2（試算）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: '身長と同じ!', x: 540, y: 1090, h: 96, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.7, 0.3, 0.35); const x2 = lerp(0.2, 0.7, ease(k(lt, 0.15, 0.6))); place(s.hero2, x2, 0.3, -0.35);
      const p = bite(s); h2.arm('L', 1.3, 0.2, 0.2); h2.hand('L', 'gu'); const hp = h2.handPos('L'); strand(s, 'st1', p, hp, 0.02);
      h.arm('R', 0.6, 1.2, 0.6); h.hand('R', 'pa'); h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa'); h2.arm('R', 0.5, 1.2, 0.6); h2.hand('R', 'pa');
      h.face({ lid: 0, brow: 0.6, browY: 1, look: [0.6, 0], mouth: 'o', open: 0.5 }); h2.face({ lid: 0, brow: 0.8, browY: 1, look: [-0.5, 0], mouth: 'o', open: 1.0 });
    } },
  // 4) 13th: 819 m, over the tallest tower
  { sc: 'st', say: ['b13'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['13回目', '819m'],
    cam: { p0: [0.1, 2.0, 7.6], p1: [0.1, 2.0, 7.2], l0: [0.25, 1.95, -0.5] },
    sfx: [[0.2, 'whoosh_slide', -12], [0.4, 'text_pa', -10], [1.9, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '13回目 [819メートル]', y: 480, size: 70, border: YEL, sub: 'スカイツリー 634m を超える' }] : []; },
    note: '東京スカイツリーの高さ 634m',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.75, 0.6, 0.3); place(s.P.tower, 0.9, -1.3, 0, 1.05);
      h.arm('R', 2.6, 0.5, 0); h.hand('R', 'gu'); h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa');
      const p = bite(s); const hp = h.handPos('R'); strand(s, 'st1', p, hp, 0.022);
      const top = V(1.3, lerp(1.5, 5.0, ease(k(lt, 0.1, 0.9))), -1.0); strand(s, 'st2', hp, top, 0.022);
      h.face(lt < 1.4 ? { lid: 0.2, brow: 0.5, look: [0.5, 0.6], mouth: 'o', open: 0.4 } : { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.7], mouth: 'o', open: 0.9 });
    } },
  // 5) 20th: 105 km, into space
  { sc: 'st', say: ['b20'], pre: 0.15, pal: ['#1d2a5a', '#c9d4f0', '#ffd23a'], show: [], dim: 0.85, hud: ['20回目', '105km'],
    cam: { p0: [0.0, 1.7, 6.4], p1: [0.0, 1.75, 6.0], l0: [0.0, 1.9, -0.4] },
    sfx: [[0.2, 'whoosh_gust', -12], [0.4, 'text_pa', -10], [1.8, 'sparkle', -13]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '20回目 [105キロ]', y: 480, size: 72, border: YEL, sub: '宇宙の入口は高度100km' }] : []; },
    stamps: [{ t: 1.6, text: '宇宙!', x: 790, y: 1080, rot: 8, color: YEL, size: 76, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.3, 0.5, 0.15); s.P.stars.visible = true; s.P.cloud.visible = true; s.P.cloud.position.y = -lerp(0, 1.2, ease(k(lt, 0.0, 2.5)));
      h.arm('R', 2.8, 0.25, 0); h.hand('R', 'gu'); h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa');
      const p = bite(s); const hp = h.handPos('R'); strand(s, 'st1', p, hp, 0.02); strand(s, 'st2', hp, V(hp.x + 0.1, 12, hp.z - 1.5), 0.02);
      h.face({ lid: 0, brow: 0.6, browY: 1, look: [0.2, 0.8], mouth: 'o', open: 0.8 });
    } },
  // 6) 32nd: 430,000 km, to the moon (the cold open, in its place)
  { sc: 'st', say: ['b32'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], dim: 0.85, hud: ['32回目', '43万km'],
    cam: { p0: [0.2, 1.5, 7.4], p1: [0.2, 1.5, 7.0], l0: [0.35, 1.8, -0.8] },
    shake: [[0.6, 0.07, 0.5]], lines: [[0.55, 0.9]],
    sfx: [[0.3, 'comic_boyon', -11], [0.4, 'whoosh_gust', -12], [0.62, 'impact_doon', -11]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '32回目 [43万キロ]', y: 480, size: 72, border: YEL, sub: '月まで 約38万km（試算）' }] : []; },
    act(lt, s) {
      moonShot(s, lt, 0.35, -0.6, 0.6); const h = s.hero.userData;
      h.face(lt < 0.6 ? { lid: 0.2, brow: 0.5, look: [0.5, 0.6], mouth: 'o', open: 0.3 } : { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.7], mouth: 'o', open: 0.9 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.arm('R', 1.2, 0.4, 1.2); h.hand('R', 'gu'); const p = bite(s); strand(s, 'st1', p, h.handPos('R'), 0.02);
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.6 }); h.arm('L', 0.3, 0.3, 1.9); } },
  // 8) still 50 g -> thinner than a hair (magnified comparison)
  { sc: 'st', say: ['thin'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: [], hud: ['お餅', '50gのまま'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.47, 4.7], l0: [0.1, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'whoosh_slide', -13], [2.6, 'text_pa', -10], [4.2, 'comic_shock2', -12]],
    cards(lt) { const b = this.lt.thin + 1.9; return lt < b ? (lt > 0.4 ? [{ t: 0.4, text: '量は [50グラム]のまま', y: 480, size: 68, border: RED, sub: '伸びるほど細くなる（試算）' }] : [])
      : [{ t: b, text: '髪の毛の [4分の1]', y: 480, size: 72, border: RED, sub: '20回目 直径0.02mm（試算）' }]; },
    tags(lt) { const t0 = this.lt.thin + 2.6; return lt > t0 ? [{ t: t0, text: '髪 0.08mm', x: 330, y: 1090, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: 'お餅 0.02mm', x: 780, y: 1090, h: 96, bg: YEL }] : []; },
    note: '髪の毛の太さ 約0.08mm（一般的な目安）',
    act(lt, s, gt, sh) {
      const b = sh.lt.thin + 1.9; const h = s.hero.userData; place(s.hero, -0.45, 0.4, 0.3);
      if (lt < b) { place(s.P.scale, 0.45, 0.4, -0.2, 1.4, 0); const m = s.P.mochi; m.visible = true; m.position.set(0.45, 0.16, 0.4); m.scale.setScalar(1.6);
        h.arm('R', 0.9, 0.9, 0.4); h.hand('R', 'pa'); h.arm('L', 0.4, 0.5, 1.5); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: -0.3, look: [0.6, -0.4], mouth: 'flat' }); }
      else { const u = ease(k(lt, b, b + 0.5)); const hr = s.P.hairL; hr.visible = true; hr.position.set(0.1, 0.0, -0.3); hr.scale.set(0.08 * u, 2.6, 0.08 * u);
        strand(s, 'st1', V(0.6, 0, -0.3), V(0.6, 2.6, -0.3), 0.022 * u);
        h.arm('R', 1.1, 0.4, 0.2); h.hand('R', 'choki'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa');
        h.face(lt < b + 2.0 ? { lid: 0.3, brow: -0.6, look: [0.7, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 1.0 }); }
    } },
  // 9) pulling it in 1 s = faster than light
  { sc: 'st', say: ['light'], pre: 0.15, pal: ['#ff8f3a', '#fff0e0', '#3f6fd8'], show: [], hud: ['秒速', '43万km'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.47, 5.3], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.0, 'whoosh_swing', -11], [1.7, 'whoosh_swing', -11], [2.4, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '光の [1.4倍]の速さ', y: 480, size: 72, border: RED, sub: '光は秒速30万km（試算）' }] : []; },
    tags(lt) { const t0 = 1.4; return lt > t0 ? [{ t: t0, text: '光 30万km/秒', x: 300, y: 1090, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '腕 43万km/秒', x: 760, y: 1090, h: 96, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.2, 0.4, 0.3); const w = Math.sin(lt * 14);
      h.arm('R', lerp(0.4, 2.4, (w + 1) / 2), 0.5, 0.3); h.hand('R', 'gu'); h.arm('L', lerp(2.4, 0.4, (w + 1) / 2), 0.5, 0.3); h.hand('L', 'gu');
      const p = bite(s); strand(s, 'st1', p, h.handPos('R'), 0.02); s.hero.position.y = Math.abs(w) * 0.05;
      const bm = s.P.beam; bm.visible = true; bm.position.set(lerp(-6, 6, (lt * 0.7) % 1), 2.3, -0.6);
      h.face({ lid: 0.6, brow: 1, browY: 0, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 10) good news (reaches the moon) / bad news (too thin to see)
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], dim: 0.9, hud: ['月まで', '見えない'], hudColor: RED,
    cam: { p0: [0.2, 1.5, 6.6], p1: [0.2, 1.5, 6.2], l0: [0.3, 1.75, -0.6] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.3, 'comic_fall', -12], [2.5, 'text_pa', -10], [4.2, 'comic_jajean', -13]],
    cards(lt) { const b = this.lt.news + 2.2; return lt < b ? (lt > 0.25 ? [{ t: 0.25, text: '[月まで]届く', y: 480, size: 74, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: b, text: '細すぎて [見えない]', y: 480, size: 70, border: RED, sub: '悪いニュース：32回目 直径0.00035mm' }]; },
    act(lt, s, gt, sh) {
      const b = sh.lt.news + 2.2; const h = s.hero.userData; place(s.hero, -0.45, 0.6, 0.3); place(s.P.moon, MOON.x, MOON.z, 0, 1, MOON.y);
      h.arm('R', 2.6, 0.5, 0); h.hand('R', 'gu'); const p = bite(s); const hp = h.handPos('R');
      if (lt < b) { strand(s, 'st1', p, hp, 0.02); strand(s, 'st2', hp, MOON.clone().add(V(-0.35, -0.3, 0.3)), 0.02); h.arm('L', 2.4, 1.0, 0); h.hand('L', 'pa'); h.face({ lid: 0.4, brow: 0.6, look: [0.5, 0.6], mouth: 'smile' }); }
      else { s.P.mochi.visible = false; h.arm('L', 1.4, 0.3, 1.6); h.hand('L', 'pa'); s.hero.rotation.y = 0.15; h.head.rotation.z = -0.1;
        h.face({ lid: 0.75, brow: -0.6, look: [0.5, 0.4], mouth: 'flat' }); }
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [], dim: 0.9,
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '伸びてほしい', x: 320, y: 1130, h: 100, bg: YEL }, { t: t0 + 0.2, text: 'ふつうでいい', x: 770, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05); s.P.stars.visible = true;
      const m = hold(s, 'mochi', 'R', V(0.15, 1.0, 0.6)); m.rotation.z = Math.sin(lt * 3) * 0.2; h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもお餅が引っぱるたび', '[2倍]伸びたら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['お餅', '×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
