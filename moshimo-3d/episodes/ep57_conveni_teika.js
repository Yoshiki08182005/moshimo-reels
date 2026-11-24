// ep57_conveni_teika (pop / arm A 原因を拡大): もしもコンビニの値段が毎週10%上がったら？
// 型は sp_geppu2x / ep56。台本・数字・小道具は自作。
// 前提（試算）:
//   おにぎり1個 200円（2026年、大手コンビニで約200円 pricey.jp／札幌で平均200円超 北海道新聞）。毎週10% → n週後 200×1.1^n
//   1週 220円 / 8週 429円（2倍超え、倍になるのは約7.3週）/ 19週 1,223円 ＞ 最低賃金の全国加重平均1,121円（厚労省 2025年度）
//   52週 28,409円（×142）。1円玉 1枚1g → 28.4kg
//   月給34万600円（厚労省 賃金構造基本統計 2025）÷28,409 = 11.99 → 12個
//   値札：1店 約3,000品目と仮定。手作り：米5kg 4,000円・1合150gで2個 → 約60円（仮定）
//   現実の食料（生鮮除く）は前年比+2.9%（総務省 CPI 2026年9月）→ 1年後 約206円
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep57_conveni_teika.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#2fb37a', '#e6f8ee', '#ff8a3d'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // price tags (yellow card, red price)
  const mkTag = (name, text, w = 0.56, bg = '#ffd23a', fg = '#e2463c') => { const t = G(); const pw = Math.round(w * 500);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.26), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(pw, 130, (c) => {
      c.fillStyle = bg; c.fillRect(0, 0, pw, 130); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(4, 4, pw - 8, 122);
      c.fillStyle = fg; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.fillText(text, pw / 2, 88); }) }));
    t.add(m); reg(name, t); };
  mkTag('t200', '200円'); mkTag('t220', '220円'); mkTag('t429', '429円'); mkTag('t1223', '1,223円', 0.66);
  mkTag('t28k', '28,409円', 0.8); mkTag('tWage', '時給1,121円', 0.8, '#ffffff', '#2c3b6b'); mkTag('t60', '60円', 0.5, '#ffffff', '#2fa36b');
  // pile of 1-yen coins: 6 columns x 30 (items: show i < n)
  { const c = G(); c.userData.items = []; const geo = new THREE.CylinderGeometry(0.075, 0.075, 0.014, 22); const mt = M('#e4e7ec', 0.3);
    const cols = [[0, 0], [0.16, 0.02], [-0.16, 0.02], [0.08, -0.14], [-0.08, -0.14], [0, 0.15]];
    for (let i = 0; i < 180; i++) { const [x, z] = cols[i % 6]; const lv = Math.floor(i / 6) * (i % 6 === 0 ? 1.0 : 0.8);
      const m = new THREE.Mesh(geo, mt); m.castShadow = m.receiveShadow = true; m.position.set(x + Math.sin(i * 2.3) * 0.006, 0.007 + lv * 0.016, z + Math.cos(i * 1.7) * 0.006); c.add(m); c.userData.items.push(m); }
    reg('yen', c); }
  // shelf full of small price stickers
  { const s = G(); rbox(1.5, 1.6, 0.4, 0.03, '#f4f4f4', 0, 0.8, 0, s); s.userData.items = [];
    for (let r = 0; r < 4; r++) { rbox(1.44, 0.03, 0.42, 0.01, '#c9ced6', 0, 0.2 + r * 0.38, 0.0, s);
      for (let i = 0; i < 5; i++) { const g = G(); g.position.set(-0.56 + i * 0.28, 0.32 + r * 0.38, 0.12);
        sph(0.07, ['#ff7a6b', '#5aa9ff', '#7bd88f', '#c79bff', '#ffffff'][(i + r) % 5], 0, 0.02, 0, g, 1, 0.9, 0.8);
        const tg = rbox(0.14, 0.06, 0.01, 0.01, '#ffd23a', 0, -0.1, 0.1, g); g.userData.tag = tg; s.add(g); s.userData.items.push(g); } }
    reg('shelf', s); }
  // pay envelope "給料"
  { const e = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.5), new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, map: canvasTex(170, 250, (c) => {
      c.fillStyle = '#fff6dc'; c.fillRect(0, 0, 170, 250); c.strokeStyle = '#2c3b6b'; c.lineWidth = 8; c.strokeRect(10, 10, 150, 230);
      c.fillStyle = '#2c3b6b'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.fillText('給', 85, 100); c.fillText('料', 85, 170); }) }));
    e.add(m); rbox(0.36, 0.52, 0.03, 0.01, '#efe6c8', 0, 0, -0.02, e); reg('env', e); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
// one onigiri in the hand (bottom-row item of the onigiri pyramid)
const nigiri = (s, side, p, sc = 1.4, who = s.hero) => { const o = s.P.onigiri; o.visible = true; o.scale.setScalar(sc); o.position.set(p.x, p.y - 0.08 * sc, p.z);
  o.userData.items.forEach((it, i) => { it.visible = i === 3; }); o.position.x -= it3x * sc; who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.08 : -0.08, -0.05, -0.02))); return o; };
let it3x = 0;
const tagAt = (s, name, x, y, z, lt = 0) => { const t = s.P[name]; t.visible = true; t.position.set(x, y, z); t.rotation.set(0, 0, Math.sin(lt * 3) * 0.04); return t; };

// the 1-year scene: a 28kg pile of 1-yen coins drops onto the counter. t0 = landing
function pileDrop(s, lt, t0) {
  place(s.P.counter, 0.85, -0.55); const y = s.P.yen; place(y, 0.55, -0.5); y.scale.setScalar(2.7);
  const u = k(lt, t0 - 0.22, t0); y.position.y = 0.93 + 3.2 * (1 - u * u) + (lt > t0 ? Math.abs(Math.sin((lt - t0) * 14)) * 0.05 * Math.exp(-(lt - t0) * 6) : 0);
  y.userData.items.forEach((c) => { c.visible = true; });
  const o = s.P.onigiri; o.visible = true; o.position.set(1.5, 0.93, -0.4); o.scale.setScalar(1.8); o.userData.items.forEach((it, i) => { it.visible = i === 3; });
  o.position.x -= it3x * 1.8; if (lt > t0) tagAt(s, 't28k', 1.4, 1.62, -0.3, lt);
  return lt > t0;
}

const plan = [
  // 0) cold open (flash-forward of #6): a mountain of 1-yen coins slams onto the counter for ONE onigiri; push in to the smug face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.3, 1.4, 6.6], p1: [-0.3, 1.47, 3.4], l0: [0.4, 1.15, -0.3], l1: [-0.3, 1.44, 0.4], hold: 1.2, dur: 2.2 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.25, 0.9]],
    sfx: [[0.02, 'whoosh_gust', -13], [0.24, 'impact_doon', -9], [0.27, 'coin_toss', -10], [0.3, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.28, text: 'おにぎり1個!!', x: 540, y: 400, rot: -6, color: YEL, size: 96, dur: 1.15 },
      { t: 2.3, text: 'いただきます♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) {
      const down = pileDrop(s, lt, 0.24); const h = s.hero.userData; place(s.hero, -0.3, 0.45, 0.15);
      if (!down) { h.reach('R', V(0.25, 1.15, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.5); h.face({ lid: 0.3, brow: 0.2, look: [0.6, 0.2], mouth: 'smile' }); }
      else if (lt < 1.3) { h.arm('L', 0.3, 2.6, 0.3); h.arm('R', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.3], mouth: 'o', open: 1.1 }); }
      else { nigiri(s, 'R', V(0.12, 1.45, 0.75), 1.5); h.arm('L', 0.3, 0.4, 1.5); h.hand('L', 'choki');
        h.face({ lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#7bd88f', '#effbf1', '#ff8a3d'], show: ['counter'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '毎週?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      place(s.P.counter, 0.2, -0.9); const h = s.hero.userData; place(s.hero, 0.0, 0.4, 0);
      nigiri(s, 'R', V(0.45, 1.45 + 0.04 * Math.sin(lt * 4), 0.55), 1.4); h.arm('L', 0.3, 2.5, 0.4); h.hand('L', 'pa');
      h.face(lt < 2.2 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) now 200 -> next week 220
  { sc: 'st', say: ['now'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['counter'], hud: ['おにぎり', '+10%/週'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.4, 'text_pa', -10], [2.1, 'whoosh_switch1', -12], [2.3, 'text_pa', -10]],
    cards(lt) { const t1 = this.lt.now + 2.0; return lt < t1 ? (lt > 0.4 ? [{ t: 0.4, text: '今 [200円]', y: 480, size: 76, border: YEL, sub: '大手コンビニのおにぎり（2026）' }] : [])
      : [{ t: t1, text: '来週 [220円]', y: 480, size: 76, border: RED, sub: '200円×1.1（試算）' }]; },
    act(lt, s) {
      place(s.P.counter, 0.2, -0.9); const h = s.hero.userData; place(s.hero, -0.35, 0.4, 0.2);
      const o = s.P.onigiri; o.visible = true; o.position.set(0.55, 0.93, -0.75); o.scale.setScalar(1.0);
      tagAt(s, lt < 2.15 ? 't200' : 't220', 0.6, 1.75, -0.6, lt);
      h.reach('R', V(0.3, 1.55, -0.2)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.5);
      h.face(lt < 2.15 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0.6, 0.3], mouth: 'o', open: 0.8 });
    } },
  // 3) 2 months: 429 yen, over x2 (vs. real inflation)
  { sc: 'st', say: ['w8'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: [], hud: ['2か月後', '×2.1'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.48, 4.4], l0: [0.0, 1.35, 0] },
    sfx: [[0.3, 'coin_toss', -13], [1.5, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '[429円]', y: 480, size: 84, border: YEL, sub: '約7週で2倍（試算）' }] : []; },
    tags(lt) { const t0 = 0.6; return lt > t0 ? [{ t: t0, text: 'ふつう 1年で206円', x: 300, y: 1440, h: 74, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた 2か月で429円', x: 770, y: 1440, h: 96, bg: YEL }] : []; },
    act(lt, s) {
      const c = s.P.coinsA; place(c, -0.75, 0.5); c.scale.setScalar(1.3); const n = Math.round(6 + 16 * ease(k(lt, 0.3, 2.4))); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, 0.15, 0.4, -0.15);
      nigiri(s, 'R', V(0.55, 1.35, 0.6), 1.4); tagAt(s, 't429', 0.42, 1.95, 0.5, lt); h.reach('L', V(-0.55, 0.95, 0.6)); h.hand('L', 'pa');
      h.face(lt < 1.5 ? { lid: 0.1, brow: 0.3, look: [0.5, 0.4], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
    } },
  // 4) week 19: 1,223 yen > hourly wage
  { sc: 'st', say: ['w19'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], show: [], hero2: true, hud: ['19週目', '×6.1'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.48, 5.2], l0: [0.0, 1.35, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.4, 'whoosh_switch2', -12], [2.6, 'comic_tsukkomi', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '時給より [高い]', y: 480, size: 76, border: RED, sub: '200円×1.1^19＝1,223円（試算）' }] : []; },
    note: '時給は最低賃金の全国平均（厚労省 2025年度）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.68, 0.35, 0.25); place(s.hero2, 0.7, 0.2, -0.3);
      const up = ease(k(lt, 1.2, 1.7));
      void up; nigiri(s, 'R', V(-0.3, 1.35, 0.6), 1.4); tagAt(s, 't1223', -0.62, 0.95, 0.75, lt); h.arm('L', 0.3, 0.4, 1.5);
      tagAt(s, 'tWage', 0.62, 0.95, 0.62, lt); h2.reach('L', V(0.3, 0.95, 0.6)); h2.hand('L', 'pa'); h2.arm('R', 0.3, 0.4, 1.5);
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.2, look: [0.5, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
      h2.face(lt < 1.5 ? { lid: 0.2, brow: 0.2, look: [-0.5, 0], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [-0.6, 0.3], mouth: 'o', open: 0.8 });
    } },
  // 5) 1 year: 28,409 yen = 28kg of 1-yen coins (cold open in its place)
  { sc: 'st', say: ['w52'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['1年後', '×142'], hudColor: YEL,
    cam: { p0: [0.3, 1.4, 6.4], p1: [0.3, 1.45, 5.8], l0: [0.4, 1.2, -0.3] },
    shake: [[0.5, 0.07, 0.5]], lines: [[0.5, 0.7]],
    sfx: [[0.3, 'whoosh_gust', -12], [0.5, 'impact_doon', -10], [0.53, 'coin_toss', -11], [2.2, 'text_pa', -10], [3.6, 'comic_boyon', -12]],
    cards(lt) { return lt > 2.2 ? [{ t: 2.2, text: '1円玉 [28キロ]', y: 480, size: 76, border: YEL, sub: '28,409円×1枚1g（試算）' }] : []; },
    act(lt, s) {
      const down = pileDrop(s, lt, 0.5); const h = s.hero.userData; place(s.hero, -0.4, 0.45, 0.15);
      if (!down) { h.reach('R', V(0.15, 1.15, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.5); h.face({ lid: 0.3, brow: 0.2, look: [0.6, 0.2], mouth: 'smile' }); }
      else { h.reach('R', V(0.3, 1.3, -0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 1.0 }); }
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) salary stays: a month's pay = 12 onigiri
  { sc: 'st', say: ['salary'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], dim: 0.9, show: ['desk'], hud: ['給料', 'そのまま'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.0], p1: [0.0, 1.5, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.5, 'whoosh_slide', -12], [2.4, 'comic_fall', -12]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '月給で [12個]', y: 480, size: 76, border: RED, sub: '34万円÷28,409円（試算）' }] : []; },
    note: '月給34万600円（厚労省 賃金構造基本統計 2025）',
    act(lt, s) {
      const d = s.P.desk; place(d, 0.6, -0.2); const o = s.P.onigiri; o.visible = true; o.position.set(0.6, 0.77, -0.2); o.scale.setScalar(0.9);
      const n = Math.round(23 - 11 * ease(k(lt, 1.2, 2.2))); o.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.4, 0.25);
      hold(s, 'env', 'L', V(-0.95, 1.4, 0.45), -0.1, 0.2); h.reach('R', V(0.15, 1.0, 0.0)); h.hand('R', 'pa');
      h.face(lt < 1.4 ? { lid: 0.2, brow: 0.3, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0.3, brow: -1, browY: 1, look: [0.5, -0.3], mouth: 'o', open: 0.7 });
    } },
  // 8) price tags: 3,000 stickers every week
  { sc: 'st', say: ['label'], pre: 0.15, pal: ['#3a3f6b', '#cfd3ea', '#ffd23a'], show: ['shelf'], hero2: true, hud: ['値札', '毎週'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.0], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'comic_pico', -13], [0.7, 'comic_pico', -13], [1.1, 'comic_pico', -13], [1.3, 'text_pa', -10], [2.2, 'comic_shock2', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '毎週 [3,000枚]', y: 480, size: 76, border: RED, sub: '1店 約3,000品目と仮定（試算）' }] : []; },
    act(lt, s) {
      const sh = s.P.shelf; place(sh, 0.0, -0.8); sh.userData.items.forEach((g, i) => { const f = k(lt, 0.2 + i * 0.09, 0.4 + i * 0.09); g.userData.tag.rotation.x = Math.sin(f * Math.PI) * 1.5; });
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.68, 0.35, 0.3); place(s.hero2, 0.7, 0.3, -0.3);
      const sw = Math.sin(lt * 9) * 0.06;
      h.reach('R', V(-0.35 + sw, 1.2, -0.45)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.4, 1.4);
      h2.reach('L', V(0.35 - sw, 0.9, -0.45)); h2.hand('L', 'gu'); h2.arm('R', 0.3, 0.4, 1.4);
      const tired = lt > 1.2; h.face(tired ? { lid: 0.6, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.5 } : { lid: 0.2, brow: 0.2, look: [0.3, 0], mouth: 'flat' });
      h2.face(tired ? { lid: 0.6, brow: -1, browY: 1, look: [0, 0], mouth: 'flat' } : { lid: 0.2, brow: 0.2, look: [-0.3, 0], mouth: 'flat' });
    } },
  // 9) can't stockpile: onigiri expire in 1 day
  { sc: 'st', say: ['expiry'], pre: 0.15, pal: ['#d86b8a', '#fbe6ee', '#3f6fd8'], show: ['desk', 'clock'], hud: ['買いだめ', 'できない'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'countdown_tick', -13], [0.9, 'countdown_tick', -13], [1.9, 'text_pa', -10], [2.6, 'comic_stupid', -12]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '期限は [1日]', y: 480, size: 76, border: RED, sub: '値上がりは1週間で10%' }] : []; },
    stamps: [{ t: 2.4, text: '期限切れ!', x: 780, y: 1150, rot: 7, color: '#ffffff', size: 62, dur: 1.2 }],
    act(lt, s) {
      const d = s.P.desk; place(d, 0.55, -0.25); const o = s.P.onigiri; o.visible = true; o.position.set(0.55, 0.77, -0.25); o.scale.setScalar(0.9);
      const c = s.P.clock; c.visible = true; c.position.set(0.55, 1.9, -0.6); c.rotation.set(0, 0, 0); c.userData.hh.rotation.z = -lt * 1.2; c.userData.mh.rotation.z = -lt * 14;
      const h = s.hero.userData; place(s.hero, -0.5, 0.4, 0.25);
      h.reach('R', V(0.12, 1.0, -0.05)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.9, 1.3); h.hand('L', 'pa');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.5, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0.5], mouth: 'o', open: 1.0 });
    } },
  // 10) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#ff8f5a', '#fff0e6', '#3f6fd8'], show: [], hud: ['手作り', 'のまま'], hudColor: CY,
    cam: { p0: [0.0, 1.5, 5.4], p1: [0.0, 1.48, 5.0], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.9, 'text_pa', -10], [4.4, 'comic_stupid', -12]],
    cards(lt) { const t1 = this.lt.news + 2.7; return lt < t1 ? (lt > 0.3 ? [{ t: 0.3, text: '手作り [60円]', y: 480, size: 72, border: CY, sub: 'いいニュース（米5kg4,000円で仮定）' }] : [])
      : [{ t: t1, text: '毎朝 [早起き]', y: 480, size: 72, border: RED, sub: '悪いニュース' }]; },
    act(lt, s) {
      const late = lt > 2.85; const h = s.hero.userData;
      if (!late) { place(s.hero, 0.0, 0.4, 0); nigiri(s, 'R', V(0.4, 1.4, 0.6), 1.5); tagAt(s, 't60', 0.4, 1.9, 0.5, lt); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa');
        h.face({ lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { place(s.P.bed, 0.0, -0.4); place(s.hero, -0.1, 0.45, 0); const c = s.P.clock; c.visible = true; c.position.set(0.75, 1.55, 0.3); c.rotation.z = Math.sin(lt * 30) * 0.08;
        h.reach('R', V(0.55, 1.45, 0.35)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.2, 0.6); h.hand('L', 'gu');
        h.face({ lid: 0.8, brow: -0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); h.head.rotation.z = -0.15; }
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['counter'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'それでも買う', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '自分でにぎる', x: 770, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      place(s.P.counter, 0.2, -1.0); const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      nigiri(s, 'R', V(0.35, 1.45, 0.55), 1.4); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもコンビニの値段が', '毎週[10%]上がったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['おにぎり', '+10%/週'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); it3x = S.P.onigiri.userData.items[3].position.x; return st; } },
});
