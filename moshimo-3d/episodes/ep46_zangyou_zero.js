// ep46_zangyou_zero (pop / arm B 生活ルール改変): もしも残業が法律で完全ゼロになったら？
// 型は sp_geppu2x / ep44。台本・数字・小道具は自作。
// 前提（試算）:
//   一般労働者の所定外労働時間 月13.2時間・年158時間（毎月勤労統計 2025年、JILPT 図表による年換算）
//   所定内 月147.3時間（同）→ 年1,768時間
//   158時間÷24 = 6.6日 ≒ 6日半分
//   出勤日 248日/年（年間休日116.6日、厚労省 令和7年就労条件総合調査）→ 158h×60÷248 = 38.2分/日 ≒ 38分
//   映画 1本2時間 → 158÷2 = 79本 / 睡眠 1晩8時間 → 158÷8 = 19.75 ≒ 20晩
//   時給: 賃金 月34万600円（厚労省 令和7年賃金構造基本統計調査）÷147.3h = 2,312円 → 割増1.25倍 = 2,890円
//   残業代: 2,890円×158h = 45.7万円 ≒ 46万円/年（全部を割増で払っていた場合）
//   人手: 158÷1,768 = 8.9% → 10人の職場で約0.9人 ≒ あと1人
import { run, THREE, V, clamp, ease, lerp, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep46_zangyou_zero.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9d5c', '#fff1e4', '#3f6fd8'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // laptop (lid = userData.lid, closed at rotation.x ≈ 1.5)
  { const l = G(); rbox(0.46, 0.03, 0.32, 0.01, '#c9d0d8', 0, 0.015, 0, l); rbox(0.38, 0.005, 0.16, 0.003, '#7b838c', 0, 0.032, 0.03, l);
    const h = G(); h.position.set(0, 0.03, -0.15); h.rotation.x = -0.25; l.add(h); l.userData.lid = h;
    rbox(0.46, 0.3, 0.02, 0.01, '#c9d0d8', 0, 0.15, 0, h);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), basic('#bfe3ff')); sc.position.set(0, 0.15, 0.012); h.add(sc); reg('laptop', l); }
  // briefcase
  { const b = G(); rbox(0.44, 0.32, 0.12, 0.03, '#6b4a2f', 0, 0, 0, b); rbox(0.44, 0.02, 0.125, 0.005, '#c9a24a', 0, 0.06, 0, b);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 20, Math.PI), M('#3b2a20')); hd.position.y = 0.16; b.add(hd); reg('kaban', b); }
  // nightcap
  { const c = G(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 28), M('#5a7bff')); cone.castShadow = true; cone.position.y = 0.26; c.add(cone);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.06, 10, 28), M('#ffffff')); band.rotation.x = Math.PI / 2; c.add(band);
    sph(0.09, '#ffffff', 0, 0.58, 0, c); reg('nightcap', c); }
  // TV on a low stand
  { const t = G(); rbox(1.3, 0.4, 0.4, 0.04, '#8a6b4a', 0, 0.2, 0, t); rbox(1.2, 0.72, 0.06, 0.02, '#23262e', 0, 0.82, 0, t);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), label(330, 186, (c) => { const g = c.createLinearGradient(0, 0, 330, 186); g.addColorStop(0, '#ff9ec7'); g.addColorStop(1, '#7fb8ff'); c.fillStyle = g; c.fillRect(0, 0, 330, 186);
      c.fillStyle = '#ffffff'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.fillText('▶ 21:00', 165, 108); }));
    sc.position.set(0, 0.82, 0.032); t.add(sc); reg('tv', t); }
  // popcorn
  { const p = G(); cyl(0.11, 0.08, 0.24, '#e2463c', 0, 0.12, 0, p); cyl(0.112, 0.112, 0.06, '#ffffff', 0, 0.16, 0, p);
    for (let i = 0; i < 9; i++) sph(0.045, '#fff2c4', Math.sin(i * 2.4) * 0.06, 0.26 + (i % 3) * 0.02, Math.cos(i * 2.4) * 0.06, p); reg('popcorn', p); }
  // beer mugs
  for (const n of ['mugA', 'mugB']) { const m = G(); cyl(0.07, 0.07, 0.18, M('#ffb52e', 0.3), 0, 0.09, 0, m); cyl(0.074, 0.074, 0.05, '#ffffff', 0, 0.2, 0, m);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 16), M('#ffe2a0', 0.3)); hd.position.set(0.085, 0.1, 0); hd.rotation.z = Math.PI / 2; hd.rotation.y = Math.PI / 2; m.add(hd); reg(n, m); }
  // salary slip
  { const p = G(); const fm = label(256, 340, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 340); c.fillStyle = '#2c3b6b'; c.font = 'bold 38px sans-serif'; c.textAlign = 'center'; c.fillText('残業代', 128, 70);
      c.fillStyle = '#c9d0d8'; for (let i = 0; i < 4; i++) c.fillRect(30, 110 + i * 34, 196, 12); c.fillStyle = '#e2463c'; c.font = 'bold 60px sans-serif'; c.fillText('0円', 128, 300); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), fm); m.material.side = THREE.DoubleSide; p.add(m); reg('slip', p); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const cap = (s) => { const c = s.P.nightcap; c.visible = true; s.hero.userData.head.add(c); c.position.set(0.03, 0.3, -0.03); c.rotation.set(-0.2, 0, -0.35); c.scale.setScalar(1); };
const clockAt = (s, x, y, z, sc, mins) => { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -(mins / 60) * Math.PI * 2; c.userData.hh.rotation.z = -((17 + mins / 60) / 12) * Math.PI * 2; };
// office: desk + laptop + clock. t0 = moment the clock hits 17:30 -> lid slams, laptop rockets up, hero dashes toward camera with the briefcase
function office(s, lt, t0) {
  place(s.P.desk, 0, -0.45);
  const u = k(lt, t0, t0 + 0.12), f = k(lt, t0 + 0.1, t0 + 0.7);
  clockAt(s, -0.95, 1.9, -0.6, 1.5, lt < t0 ? 29 : 30);
  const l = s.P.laptop; l.visible = true; l.position.set(0, 0.77 + 6 * f * f, -0.45); l.rotation.set(f * 4, 0.6 * f, 0); l.userData.lid.rotation.x = lerp(-0.25, 1.5, u);
  return k(lt, t0 + 0.02, t0 + 0.32);
}
function dash(s, lt, d) { // d: 0..1 run from behind the desk to the front
  const h = s.hero; h.position.set(lerp(0.0, 0.05, d), Math.sin(Math.PI * d) * 0.45, lerp(-0.95, 0.55, d)); h.rotation.set(-0.25 * Math.sin(Math.PI * d), 0, 0);
  hold(s, 'kaban', 'R', V(0.36, 0.72, 0.05).add(h.position), 0); }

const plan = [
  // 0) cold open (flash-forward of #4): 17:30 -> lid slams, laptop rockets away, hero leaps out with the briefcase; push in to a smug face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.12, 1.55, 3.3], l0: [0.0, 1.1, -0.3], l1: [0.05, 1.48, 0.55], hold: 1.2, dur: 2.2 },
    shake: [[0.25, 0.07, 0.6]], lines: [[0.22, 0.9]],
    sfx: [[0.0, 'countdown_tick', -13], [0.2, 'text_tin', -10], [0.25, 'impact_doon', -10], [0.3, 'whoosh_swing', -9], [0.32, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.28, text: '定時ダッシュ!!', x: 540, y: 430, rot: -6, color: YEL, size: 96, dur: 1.15 },
      { t: 2.3, text: '…まだ17:30', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 56, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; const d = office(s, lt, 0.18); dash(s, lt, d);
      if (d < 1) { h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0, 0.3], mouth: 'o', open: 1 }); }
      else if (lt < 1.5) { h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.1, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { h.arm('L', 0.3, 2.5, 0.3); h.hand('L', 'choki'); h.face({ lid: 0.55, brow: 0.7, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'comic_surprise', -12]],
    stamps: [{ t: 1.7, text: '法律で?!', x: 800, y: 1080, rot: 8, color: RED, size: 70, dur: 1.3 }],
    act(lt, s) {
      place(s.P.desk, 0.75, -0.4); const l = s.P.laptop; l.visible = true; l.position.set(0.75, 0.77, -0.4); l.rotation.set(0, -0.3, 0);
      clockAt(s, -0.9, 1.9, -0.6, 1.3, 25 + lt * 2);
      const h = s.hero.userData; place(s.hero, -0.1, 0.4, 0.15);
      h.reach('R', V(0.55, 0.86, -0.25)); h.arm('L', 0.3, 0.3, 1.8);
      h.face(lt < 1.6 ? { lid: 0.6, brow: -0.5, look: [0.4, -0.5], mouth: 'flat' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) 13.2 h a month
  { sc: 'st', say: ['now'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['books'], hud: ['残業', '月13.2時間'],
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'phone_vibe', -14], [1.3, 'text_pa', -10]],
    cards(lt) { return lt > 1.25 ? [{ t: 1.25, text: '月 [13.2時間]', y: 480, size: 72, border: CY, sub: '一般労働者の平均（所定外）' }] : []; },
    tags(lt) { const t0 = this.lt.now + 2.2; return lt > t0 ? [{ t: t0, text: '1日 約40分', x: 600, y: 1130, h: 80, bg: '#ffffff' }] : []; },
    note: '毎月勤労統計 2025年（JILPT図表）',
    act(lt, s) {
      const b = s.P.books; place(b, 0.65, 0.1); const n = Math.round(8 + 18 * ease(k(lt, 0.2, 2.0))); b.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.3, 0.35, 0.25);
      h.reach('R', V(0.42, 0.1 + n * 0.046, 0.15)); h.hand('R', 'pa'); h.arm('L', 0.4, 0.6, 1.6);
      h.face(lt < 1.25 ? { lid: 0.6, brow: -0.6, look: [0.6, 0.4], mouth: 'flat' } : { lid: 0.3, brow: -0.9, look: [0, 0], mouth: 'o', open: 0.5 });
    } },
  // 3) 158 h a year = 6.5 days
  { sc: 'st', say: ['year'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: [], hud: ['1年', '158時間'],
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [2.4, 'comic_shock2', -13]],
    cards(lt) { return lt > 0.3 && lt < 2.2 ? [{ t: 0.3, text: '1年で [158時間]', y: 480, size: 70, border: CY, sub: '13.2時間×12か月' }]
      : lt >= 2.2 ? [{ t: 2.2, text: 'まるまる [6日半]', y: 480, size: 72, border: YEL, sub: '158時間÷24（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.clock; clockAt(s, 0.6, 1.25, 0.1, 2.0, 0); c.userData.mh.rotation.z = -lt * 14; c.userData.hh.rotation.z = -lt * 1.2;
      const h = s.hero.userData; place(s.hero, -0.45, 0.3, 0.3);
      h.reach('R', V(0.2, 1.2, 0.2)); h.hand('R', 'pa'); h.arm('L', 0.3, lt > 2.2 ? 2.7 : 0.3, 0.3); h.hand('L', lt > 2.2 ? 'pa' : 'gu');
      h.face(lt < 2.2 ? { lid: 0.1, brow: 0.3, look: [0.6, 0.1], mouth: 'o', open: 0.6 } : { lid: 0, brow: -0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 4) home 38 min earlier every day (the cold open, in its place)
  { sc: 'st', say: ['home'], pre: 0.15, hold: 0.8, pal: HOOK, show: [], hud: ['定時', '毎日−38分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.05, 1.5, 5.6], l0: [0.0, 1.15, 0] },
    shake: [[1.05, 0.06, 0.5]], lines: [[1.0, 0.7]],
    sfx: [[0.95, 'text_tin', -10], [1.05, 'whoosh_swing', -9], [1.3, 'text_pa', -10]],
    cards(lt) { return lt > 1.25 ? [{ t: 1.25, text: '毎日 [38分] 早く', y: 480, size: 72, border: YEL, sub: '158時間÷出勤248日（試算）' }] : []; },
    stamps: [{ t: 1.05, text: 'おつかれっ!!', x: 780, y: 1120, rot: -6, color: YEL, size: 80, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData; const d = office(s, lt, 0.95); dash(s, lt, d);
      if (lt < 0.95) { h.arm('L', 0.4, 0.4, 1.8); h.face({ lid: 0.3, brow: -0.3, look: [-0.7, 0.5], mouth: 'flat' }); }
      else if (d < 1) { h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0, 0.3], mouth: 'o', open: 1 }); }
      else { h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
    } },
  // 5) 79 movies a year
  { sc: 'st', say: ['movie'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['tv'], hud: ['自由時間', '映画79本'],
    cam: { p0: [0.0, 1.45, 5.0], p1: [0.0, 1.42, 4.7], l0: [0.0, 1.15, 0] },
    sfx: [[0.4, 'text_pa', -10], [1.4, 'sparkle', -14], [2.2, 'comic_eat', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '映画 [79本]分', y: 480, size: 72, border: CY, sub: '1本2時間で（試算）' }] : []; },
    act(lt, s) {
      place(s.P.tv, 0.55, -0.7, -0.35);
      const h = s.hero.userData; place(s.hero, -0.45, 0.45, 0.35);
      hold(s, 'popcorn', 'L', V(-0.75, 0.95, 0.7), 0); h.reach('R', V(-0.62, 1.15 + 0.12 * Math.max(0, Math.sin(lt * 4)), 0.75)); h.hand('R', 'gu');
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0.2, look: [0.7, 0.1], mouth: 'smile' } : { lid: 0.1, brow: 0.5, look: [0.2, 0], mouth: 'o', open: 0.7 });
    } },
  // 6) or 20 nights of sleep
  { sc: 'st', say: ['sleep'], pre: 0.15, pal: ['#2f6fb0', '#d6e8f7', '#ffd23a'], show: ['bed'], hud: ['睡眠', '+20晩'],
    cam: { p0: [-0.1, 1.4, 5.0], p1: [-0.1, 1.4, 4.7], l0: [-0.1, 1.15, 0] },
    sfx: [[0.6, 'text_pa', -10], [1.6, 'emo_shine', -15]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '1年で [20晩]分', y: 480, size: 72, border: YEL, sub: '1晩8時間で（試算）' }] : []; },
    stamps: [{ t: 0.5, text: 'Zzz…', x: 300, y: 1000, rot: -8, color: '#ffffff', size: 60, dur: 2.0 }],
    act(lt, s) {
      place(s.P.bed, -0.3, -0.45);
      const h = s.hero.userData; place(s.hero, 0.1, 0.35, 0.1); cap(s);
      h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.5, 0.4, 1.6); h.hand('R', 'pa');
      h.face({ lid: 1, brow: 0.3, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.22 + Math.sin(lt * 1.5) * 0.05;
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) overtime pay is x1.25
  { sc: 'st', say: ['rate'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['coinsA'], hud: ['残業代', '×1.25'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.5, 'coin_toss', -12], [1.6, 'text_pa', -10]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '時給 [×1.25]', y: 480, size: 72, border: YEL, sub: '時給2,312円→2,890円（試算）' }] : []; },
    note: '賃金 月34万600円 厚労省 賃金構造基本統計 令和7年',
    act(lt, s) {
      const c = s.P.coinsA; place(c, 0.5, 0.05); c.userData.items.forEach((it, i) => { it.visible = i < 24; });
      const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.3);
      h.reach('R', V(0.38, 0.85, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.3, 0.4); h.hand('L', 'gu');
      h.face({ lid: 0.2, brow: 0.4, look: [0.6, -0.3], mouth: 'smile' });
    } },
  // 9) 460,000 yen gone
  { sc: 'st', say: ['money'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], show: ['coinsA'], hud: ['残業代', '−46万円/年'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.6, 'vanish_hyun', -11], [1.0, 'text_pa', -10], [2.0, 'comic_fall', -12]],
    cards(lt) { return lt > 0.95 ? [{ t: 0.95, text: '年 [−46万円]', y: 480, size: 76, border: RED, sub: '2,890円×158時間（試算）' }] : []; },
    stamps: [{ t: 2.0, text: 'スカッ…', x: 760, y: 1150, rot: 6, color: '#ffffff', size: 66, dur: 1.2 }],
    act(lt, s) {
      const c = s.P.coinsA; place(c, 0.5, 0.05); const n = Math.round(24 * (1 - ease(k(lt, 0.4, 1.6)))); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.3);
      const p = hold(s, 'slip', 'L', V(-0.58, 1.3, 0.6), -0.05); p.scale.setScalar(1.3);
      h.reach('R', V(0.38, 0.2 + n * 0.028, 0.1)); h.hand('R', 'pa');
      h.face(lt < 0.95 ? { lid: 0.2, brow: 0, look: [0.6, -0.4], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 10) unfinished work -> one more person per ten
  { sc: 'st', say: ['staff'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], hero2: true, show: ['books'], hud: ['人手', '10人に+1人'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.8], p1: [0.0, 1.48, 5.5], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'collapse', -15], [1.6, 'text_pa', -10], [2.9, 'whoosh_slide', -12], [3.2, 'comic_pico', -11]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '10人の職場に [+1人]', y: 480, size: 62, border: RED, sub: '残業158時間÷所定1,768時間＝約9%' }] : []; },
    stamps: [{ t: 3.1, text: '助っ人!', x: 800, y: 1160, rot: 6, color: '#ffffff', size: 66, dur: 1.3 }],
    act(lt, s) {
      const b = s.P.books; place(b, 0.0, -0.3); b.userData.items.forEach((it, i) => { it.visible = i < 30; });
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.72, 0.25, 0.3);
      const u = ease(k(lt, 2.9, 3.3)); place(s.hero2, lerp(2.6, 0.72, u), 0.15, -0.3);
      h.reach('R', V(-0.25, 1.2, -0.2)); h.hand('R', 'pa'); h.arm('L', 0.6, 0.8, 1.6);
      h2.arm('L', 0.4, 2.4, 0.3); h2.hand('L', 'pa'); h2.arm('R', 0.3, 0.3, 1.8);
      h.face(lt < 3.1 ? { lid: 0, brow: -1, browY: 1, look: [0.4, 0.5], mouth: 'o', open: 0.8 } : { lid: 0.2, brow: 0.5, look: [0.7, 0], mouth: 'smile' });
      h2.face({ lid: 0.2, brow: 0.5, look: [-0.6, 0], mouth: 'smile' });
    } },
  // 11) good news / bad news: drama at 9pm vs no excuse to skip the drinking party
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: [], hud: ['定時の', '夜'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.4], p1: [0.0, 1.43, 5.1], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.6, 'text_pa', -10], [3.6, 'comic_jajean', -13]],
    cards(lt) { return lt < 2.55 ? (lt > 0.25 ? [{ t: 0.25, text: '夜の [ドラマ] に間に合う', y: 480, size: 60, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.55, text: '[飲み会] の言い訳が消える', y: 480, size: 58, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.7, text: 'カンパーイ!!', x: 760, y: 1180, rot: 6, color: YEL, size: 66, dur: 1.4 }],
    act(lt, s) {
      const h = s.hero.userData;
      if (lt < 2.55) { s.hero2.visible = false; place(s.P.tv, 0.6, -0.7, -0.35); place(s.hero, -0.45, 0.4, 0.35);
        hold(s, 'popcorn', 'L', V(-0.75, 0.95, 0.7), 0); h.arm('R', 0.3, 2.5, 0.3); h.hand('R', 'gu');
        h.face({ lid: 0.1, brow: 0.6, look: [0.6, 0.1], mouth: 'smile' }); }
      else { const h2 = s.hero2.userData; place(s.hero, -0.68, 0.25, 0.3); place(s.hero2, 0.68, 0.15, -0.3);
        const up = ease(k(lt, 3.5, 3.8)); h2.reach('L', V(0.25, lerp(1.1, 1.75, up), 0.4)); s.P.mugA.visible = true; s.P.mugA.position.set(0.18, lerp(1.0, 1.65, up), 0.45);
        h2.arm('R', 0.6, 2.2, 0.4); h2.hand('R', 'pa');
        h.arm('L', 0.5, 0.6, 1.4); h.arm('R', 0.5, 0.6, 1.4); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 0.9 });
        h2.face({ lid: 0.2, brow: 0.6, look: [-0.6, 0], mouth: 'smile' }); }
    } },
  // 12) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'ゼロがいい', x: 320, y: 1130, h: 110, bg: CY }, { t: t0 + 0.2, text: '残業代ほしい', x: 760, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'kaban', 'R', V(0.45, 0.5, 0.25), 0);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[残業]が法律で', '完全ゼロになったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['残業', 'ゼロ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
