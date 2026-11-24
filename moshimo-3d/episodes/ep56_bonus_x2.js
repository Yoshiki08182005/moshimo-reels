// ep56_bonus_x2 (pop / arm C ニュース起点): もしも冬のボーナスが毎年2倍になったら？
// 入り口：冬のボーナス予測（三菱UFJリサーチ&コンサルティング 2026年11月：民間+5.0%、支給総額20.4兆円）。型は sp_geppu2x / ep55。台本・数字・小道具は自作。
// 前提（試算）:
//   今年の冬のボーナス 1人45万円と仮定。毎年2倍 → n年後 45万×2^n
//   おにぎり150円 → 45万÷150 = 3,000個
//   5年後 1,440万円 = 1万円札1,440枚 ×0.1mm = 14.4cm
//   10年後 4億6,080万円 = 46,080枚 ×1g = 46kg（1万円札 約1g・厚さ約0.1mm）
//   20年後 4,718億円 = 4,718万枚 ×0.1mm = 4,719m > 富士山3,776m
//   全国の支給総額 20.4兆円×2^5 = 652.8兆円 > 日本の名目GDP 約600兆円
//   税金：所得税の最高45%＋住民税10% → 半分近く
//   ATM 1日50万円まで（仮定）→ 4億6,080万÷50万 = 921.6 → 922日
//   物価も同じく毎年2倍と仮定 → おにぎり150円×2^10 = 153,600円 ≒ 15万円
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep56_bonus_x2.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff8a3d', '#ffe9d6', '#3f6fd8'];
const basicM = (c) => new THREE.MeshBasicMaterial({ color: c });

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // bonus envelope (white, red "賞与")
  { const e = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.5), new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, map: canvasTex(170, 250, (c) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, 170, 250); c.strokeStyle = '#e2463c'; c.lineWidth = 8; c.strokeRect(10, 10, 150, 230);
      c.fillStyle = '#e2463c'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.fillText('賞', 85, 100); c.fillText('与', 85, 170); }) }));
    e.add(m); rbox(0.36, 0.52, 0.03, 0.01, '#f2f2f2', 0, 0, -0.02, e); reg('env', e); }
  // tall stack of banknotes: inner column height 1 at y 0..1 (scale.y = height)
  { const s = G(); const col = G(); s.add(col); rbox(0.5, 1, 0.26, 0.02, '#5fae6b', 0, 0.5, 0, col); rbox(0.46, 1.0, 0.27, 0.01, '#cfe9c8', 0, 0.5, 0, col);
    s.userData.col = col; reg('stack', s); }
  // small hand-held brick of bills (14cm)
  { const b = G(); rbox(0.36, 0.14, 0.18, 0.015, '#5fae6b', 0, 0.07, 0, b); rbox(0.33, 0.145, 0.185, 0.01, '#cfe9c8', 0, 0.07, 0, b); rbox(0.05, 0.15, 0.19, 0.005, '#ffffff', 0, 0.07, 0, b); reg('brick', b); }
  // mountain (snow cap)
  { const f = G(); const c = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.2, 32), M('#5f7fd0')); c.position.y = 1.1; c.castShadow = true; f.add(c);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.7, 32), M('#ffffff')); cap.position.y = 1.86; f.add(cap); reg('fuji', f); }
  // clouds
  { const g = G(); for (const [x, y, z, s] of [[-1.8, 3.2, -2, 1], [1.9, 3.6, -2.2, 1.2], [-0.6, 4.2, -2.4, 0.9]]) { const c = G(); for (const [a, b, r] of [[0, 0, 0.35], [0.35, -0.05, 0.27], [-0.35, -0.05, 0.27]]) sph(r, M('#ffffff', 1), a, b, 0, c); c.position.set(x, y, z); c.scale.setScalar(s); g.add(c); } reg('clouds', g); }
  // ATM
  { const a = G(); rbox(0.8, 1.5, 0.6, 0.05, '#dfe5ee', 0, 0.75, 0, a); rbox(0.66, 0.3, 0.05, 0.02, '#2c3b6b', 0, 1.62, 0.28, a);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), new THREE.MeshBasicMaterial({ map: canvasTex(250, 160, (c) => { c.fillStyle = '#1b2140'; c.fillRect(0, 0, 250, 160); c.fillStyle = '#ffd23a'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.fillText('1日の上限', 125, 60); c.fillStyle = '#ffffff'; c.font = 'bold 40px sans-serif'; c.fillText('50万円', 125, 115); }) }));
    scr.position.set(0, 1.15, 0.305); scr.rotation.x = -0.2; a.add(scr); rbox(0.4, 0.05, 0.05, 0.02, '#23262f', 0, 0.85, 0.3, a); reg('atm', a); }
  // flying bills (tax)
  { const g = G(); g.userData.items = []; for (let i = 0; i < 10; i++) { const b = G(); rbox(0.3, 0.14, 0.008, 0.01, '#5fae6b', 0, 0, 0, b); rbox(0.26, 0.1, 0.004, 0.008, '#cfe9c8', 0, 0, 0.005, b); g.add(b); g.userData.items.push(b); } reg('fly', g); }
  // price tag
  { const t = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.26), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(250, 130, (c) => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 250, 130); c.fillStyle = '#e2463c'; c.font = 'bold 46px sans-serif'; c.textAlign = 'center'; c.fillText('150,000円', 125, 82); }) }));
    t.add(m); reg('ptag', t); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const stackH = (s, x, z, h) => { const st = s.P.stack; place(st, x, z); st.userData.col.scale.y = Math.max(0.001, h); };

// the 20-year scene: stack shoots up past the clouds next to the mountain, t0 = launch
function tower(s, lt, t0) {
  const u = k(lt, t0, t0 + 0.35); place(s.P.fuji, 1.25, -2.4); s.P.fuji.scale.setScalar(0.85); s.P.clouds.visible = true;
  stackH(s, -0.75, -0.2, 0.3 + 40 * (1 - Math.pow(1 - u, 3)));
  if (lt > t0) s.P.stack.position.x += Math.sin(lt * 50) * 0.01 * Math.exp(-(lt - t0) * 3);
  return lt > t0;
}

const plan = [
  // 0) cold open (flash-forward of #5): bill stack rockets past the clouds and Mt. Fuji; push in to the smug face with the envelope
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: ['clouds'],
    cam: { p0: [0.2, 1.2, 7.6], p1: [0.15, 1.45, 3.5], l0: [-0.2, 2.4, -0.5], l1: [0.15, 1.42, 0.0], hold: 1.2, dur: 2.3 },
    shake: [[0.22, 0.08, 0.6]], lines: [[0.22, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -12], [0.2, 'impact_doon', -9], [0.24, 'text_impact', -11], [0.6, 'coin_toss', -13], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.26, text: '富士山超え!!', x: 540, y: 400, rot: -6, color: YEL, size: 96, dur: 1.15 },
      { t: 2.3, text: 'ボーナス♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) {
      const up = tower(s, lt, 0.2); const h = s.hero.userData; place(s.hero, 0.2, 0.5, -0.1);
      if (!up) { h.arm('L', 0.3, 0.4, 1.6); h.arm('R', 0.3, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.2, look: [-0.5, 0.3], mouth: 'flat' }); }
      else if (lt < 1.3) { h.arm('L', 0.3, 2.6, 0.3); h.arm('R', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [-0.4, 0.8], mouth: 'o', open: 1.1 }); }
      else { hold(s, 'env', 'R', V(0.55, 1.5, 0.45), 0.12, -0.2); h.arm('L', 0.3, 0.4, 1.5); h.hand('L', 'choki');
        h.face({ lid: 0.35, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.8, 'comic_surprise', -12]],
    stamps: [{ t: 1.9, text: '毎年?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0.0, 0.4, 0);
      hold(s, 'env', 'R', V(0.5, 1.45 + 0.04 * Math.sin(lt * 4), 0.45), 0.1, -0.2); h.arm('L', 0.3, 2.5, 0.4); h.hand('L', 'pa');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) this year: 450k yen = 3,000 onigiri
  { sc: 'st', say: ['first'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['desk', 'onigiri'], hud: ['冬のボーナス', '45万円'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.8], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'coin_toss', -13], [1.3, 'text_pa', -10], [2.4, 'sparkle', -14]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: 'おにぎり [3,000個]', y: 480, size: 72, border: YEL, sub: '45万円÷150円（試算）' }] : []; },
    note: '1人45万円と仮定（民間+5.0%予測 MURC 2026）',
    act(lt, s) {
      const d = s.P.desk; place(d, 0.6, -0.2); const o = s.P.onigiri; o.visible = true; o.position.set(0.6, 0.77, -0.2); o.scale.setScalar(0.9);
      const n = Math.round(3 + 20 * ease(k(lt, 0.3, 2.2))); o.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.4, 0.25);
      hold(s, 'env', 'L', V(-0.95, 1.4, 0.45), -0.1, 0.2); h.reach('R', V(0.2, 0.95, 0.0)); h.hand('R', 'pa');
      h.face(lt < 1.2 ? { lid: 0.2, brow: 0.3, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 3) 5 years: 14.4M yen, a 14cm brick
  { sc: 'st', say: ['y5'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#3f6fd8'], show: [], hud: ['5年後', '×32'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.48, 4.4], l0: [0.0, 1.35, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.6, 'text_pa', -10], [2.6, 'sparkle', -14]],
    cards(lt) { return lt > 1.6 ? [{ t: 1.6, text: '札束 [14センチ]', y: 480, size: 76, border: CY, sub: '1万円札1,440枚×0.1mm（試算）' }] : []; },
    tags(lt) { const t0 = 0.6; return lt > t0 ? [{ t: t0, text: 'ふつう 45万円', x: 300, y: 1440, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた 1,440万円', x: 770, y: 1440, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.4, 0); const p = V(0.0, 0.98 + 0.04 * Math.sin(lt * 3), 0.75);
      const b = s.P.brick; b.visible = true; b.position.copy(p); b.rotation.set(0.2, 0, 0); b.scale.setScalar(1.2);
      h.reach('L', p.clone().add(V(-0.22, 0.06, 0))); h.reach('R', p.clone().add(V(0.22, 0.06, 0))); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.6 ? { lid: 0.1, brow: 0.4, look: [0, -0.6], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 4) 10 years: 460M yen, 46kg suitcase won't lift
  { sc: 'st', say: ['y10'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], show: [], hud: ['10年後', '×1024'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'impact_don', -12], [1.4, 'text_pa', -10], [2.4, 'comic_tsukkomi', -12]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '重さ [46キロ]', y: 480, size: 76, border: CY, sub: '1万円札46,080枚×1g（試算）' }] : []; },
    stamps: [{ t: 1.9, text: 'ぐぬぬ…', x: 760, y: 1150, rot: 6, color: '#ffffff', size: 62, dur: 1.4 }],
    act(lt, s) {
      const c = s.P.suitcase; place(c, 0.35, 0.55); c.scale.setScalar(1.25); c.rotation.z = Math.sin(lt * 20) * 0.02 * (lt > 1.5 ? 1 : 0);
      const h = s.hero.userData; place(s.hero, -0.25, 0.35, 0.3); h.body.rotation.x = 0.18;
      h.reach('R', V(0.35, 0.86, 0.55)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.9, 1.2); h.hand('L', 'pa');
      h.face(lt < 1.4 ? { lid: 0.1, brow: 0.3, look: [0.6, -0.4], mouth: 'smile' } : { lid: 0.6, brow: -1, browY: 1, look: [0.5, -0.3], mouth: 'flat' });
    } },
  // 5) 20 years: stack over Mt. Fuji (cold open in its place)
  { sc: 'st', say: ['y20'], pre: 0.15, hold: 0.3, pal: HOOK, show: ['clouds'], hud: ['20年後', '4,700億円'], hudColor: YEL,
    cam: { p0: [0.2, 1.3, 7.4], p1: [0.2, 1.6, 6.6], l0: [-0.2, 2.0, -0.5] },
    shake: [[0.5, 0.07, 0.5]], lines: [[0.5, 0.7]],
    sfx: [[0.3, 'whoosh_gust', -12], [0.5, 'impact_doon', -10], [1.6, 'text_pa', -10], [2.8, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.6 ? [{ t: 1.6, text: '高さ [4,719m]', y: 480, size: 76, border: YEL, sub: '富士山3,776mより上（試算）' }] : []; },
    act(lt, s) {
      const up = tower(s, lt, 0.5); const h = s.hero.userData; place(s.hero, 0.25, 0.5, -0.1);
      if (!up) { h.arm('L', 0.3, 0.4, 1.6); h.arm('R', 0.3, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.2, look: [-0.5, 0.3], mouth: 'flat' }); }
      else { h.reach('L', V(-0.45, 1.8, 0.1)); h.hand('L', 'pa'); h.arm('R', 0.3, 2.4, 0.4); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [-0.5, 0.8], mouth: 'o', open: 1.0 }); }
    } },
  // 6) Japan total: 650 trillion yen > GDP
  { sc: 'st', say: ['japan'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['crowd', 'coinsA', 'coinsB'], hud: ['全国の支給額', '5年後'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 6.2], p1: [0.0, 1.6, 5.7], l0: [0.0, 1.3, -0.3] },
    sfx: [[0.3, 'coin_toss', -12], [1.8, 'text_pa', -10], [3.0, 'comic_surprise', -12]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '[650兆円]', y: 480, size: 84, border: YEL, sub: '20.4兆円×32 ＞ GDP約600兆円（試算）' }] : []; },
    note: '支給総額20.4兆円 三菱UFJリサーチ&コンサル 2026',
    act(lt, s) {
      const n = Math.round(4 + 28 * ease(k(lt, 0.3, 2.6)));
      for (const [nm, x] of [['coinsA', -1.0], ['coinsB', 1.0]]) { const c = s.P[nm]; place(c, x, 0.3); c.scale.setScalar(1.6); c.userData.items.forEach((it, i) => { it.visible = i < n; }); }
      const cr = s.P.crowd; cr.visible = true; cr.position.set(0, 0, -0.6);
      const h = s.hero.userData; place(s.hero, 0, 0.7, 0);
      h.reach('L', V(-0.75, 1.3, 0.55)); h.reach('R', V(0.75, 1.3, 0.55)); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.8 ? { lid: 0.1, brow: 0.4, look: [0, 0.3], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0], mouth: 'o', open: 1.2 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) tax: nearly half flies away
  { sc: 'st', say: ['tax'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], dim: 0.9, show: ['fly'], hud: ['税金', '約半分'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 5.0], p1: [0.0, 1.55, 4.6], l0: [0.0, 1.45, 0] },
    sfx: [[0.2, 'whoosh_slide', -12], [1.0, 'text_pa', -10], [1.6, 'comic_fall', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '[半分近く] 消える', y: 480, size: 70, border: RED, sub: '所得税最高45%＋住民税10%' }] : []; },
    act(lt, s) {
      const f = s.P.fly; f.position.set(0, 0, 0); f.userData.items.forEach((b, i) => { const u = (lt * 0.7 + i * 0.1) % 1; b.position.set(0.3 + u * 1.6 + Math.sin(i * 3) * 0.3, 1.1 + u * 2.0 + Math.cos(i * 2) * 0.2, 0.3); b.rotation.set(lt * 3 + i, lt * 2 + i, i); });
      const h = s.hero.userData; place(s.hero, -0.35, 0.4, 0.2);
      hold(s, 'env', 'L', V(-0.8, 1.3, 0.45), -0.1, 0.2); h.reach('R', V(0.35, 1.85, 0.3)); h.hand('R', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, 0.6], mouth: 'o', open: 0.8 });
    } },
  // 9) ATM: 500k/day -> 922 days
  { sc: 'st', say: ['atm'], pre: 0.15, pal: ['#3a3f6b', '#cfd3ea', '#ffd23a'], show: ['atm'], hud: ['ATM', '1日50万円'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 5.4], p1: [0.0, 1.55, 5.0], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'countdown_tick', -13], [0.9, 'countdown_tick', -13], [2.2, 'text_pa', -10], [3.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 2.1 ? [{ t: 2.1, text: '[922日] かかる', y: 480, size: 76, border: RED, sub: '4億6,080万÷50万円（仮定）' }] : []; },
    act(lt, s) {
      place(s.P.atm, 0.55, -0.3, -0.25);
      const h = s.hero.userData; place(s.hero, -0.4, 0.35, 0.3);
      h.reach('R', V(0.3, 1.25, 0.15)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.6);
      if (lt > 2.1) h.head.rotation.z = Math.sin(lt * 2) * 0.1;
      h.face(lt < 2.1 ? { lid: 0.3, brow: 0, look: [0.6, 0], mouth: 'flat' } : { lid: 0.5, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.6 });
    } },
  // 10) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#ff8f5a', '#fff0e6', '#3f6fd8'], show: [], hero2: true, hud: ['物価も', '×2'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.48, 5.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.7, 'text_pa', -10], [4.4, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.6 ? (lt > 0.25 ? [{ t: 0.25, text: 'ボーナス [4.6億]', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.6, text: 'おにぎり [15万円]', y: 480, size: 70, border: RED, sub: '悪いニュース（物価も毎年2倍と仮定）' }]; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.65, 0.35, 0.25); const h2 = s.hero2.userData; place(s.hero2, 0.7, 0.2, -0.3);
      const late = lt > 2.6;
      if (!late) { hold(s, 'env', 'R', V(-0.2, 1.5, 0.45), 0.1, -0.2); h.arm('L', 0.3, 2.5, 0.4); h.hand('L', 'pa'); h.face({ lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { const o = s.P.onigiri; o.visible = true; o.position.set(-0.55, 0.95, 0.65); o.scale.setScalar(1.3); o.userData.items.forEach((it, i) => { it.visible = i === 3; });
        h.reach('R', V(-0.4, 1.0, 0.6)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.5); h.face({ lid: 0, brow: -1, browY: 1, look: [0.5, 0], mouth: 'o', open: 1.1 }); }
      const t = s.P.ptag; t.visible = late; t.position.set(0.15, 1.85, 0.35); t.rotation.set(0, 0, Math.sin(lt * 3) * 0.05);
      h2.reach('L', V(0.38, 1.75, 0.3)); h2.hand('L', 'pa'); h2.arm('R', 0.3, 0.4, 1.5);
      h2.face(late ? { lid: 0.3, brow: 0.6, look: [-0.6, 0], mouth: 'smile' } : { lid: 0.2, brow: 0, look: [-0.6, 0], mouth: 'flat' });
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '2倍ほしい', x: 320, y: 1130, h: 108, bg: CY }, { t: t0 + 0.2, text: '今のままでいい', x: 760, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'env', 'R', V(0.4, 1.45, 0.45), 0.1, -0.2); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも冬のボーナスが', '毎年[2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['冬のボーナス', '×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
