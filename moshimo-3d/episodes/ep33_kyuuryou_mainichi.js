// ep33_kyuuryou_mainichi (pop / arm C): もしも給料が毎日払いになったら？
// 型は sp_geppu2x。台本・数字・小道具は自作。ニュース起点：給与デジタル払い（PayPay等）・給与前払いサービスの広がり。
// 前提（試算）: 月給 34万600円（厚労省 令和7年賃金構造基本統計調査・一般労働者の賃金月額）÷ 30日 = 11,353円/日 ≒ 1万1千円
//   給料日 365回 / 12回 = 30.4倍 / おにぎり1個150円 → 75個 / 家賃7万円 ÷ 11,353 = 6.2日分
//   振込手数料 1回150円(仮定) × 365 = 54,750円/人・年 / ごほうび 500円 × 365 = 182,500円/年
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep33_kyuuryou_mainichi.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const RENT = ['#e8574a', '#ffe3d6', '#ffd23a'], HOOK = ['#4fc38a', '#e6f8ee', '#ffd23a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  { // giant rent bill (falls flat, face up -> rotate x)
    const b = G(); rbox(1.2, 0.04, 0.7, 0.02, '#ffffff', 0, 0, 0, b);
    const fm = label(512, 300, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 512, 300); c.fillStyle = '#e2463c'; c.fillRect(0, 0, 512, 90); c.fillStyle = '#ffffff'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('家賃', 256, 47); c.fillStyle = '#22252d'; c.font = 'bold 96px sans-serif'; c.fillText('70,000円', 256, 200); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 0.66), fm); f.rotation.x = -Math.PI / 2; f.position.y = 0.022; b.add(f); reg('rentbill', b); }
  { const c = G(); const m = cyl(0.11, 0.11, 0.026, M('#ffc533', 0.35), 0, 0, 0, c); m.rotation.x = Math.PI / 2; sph(0.06, '#ffdf6b', 0, 0, 0.014, c, 1, 1, 0.1); reg('coin1', c); }
  { // tear-off calendar of paydays
    const c = G(); rbox(0.56, 0.7, 0.04, 0.02, '#2c3b6b', 0, 0, -0.02, c); c.userData.items = [];
    const fm = label(256, 300, (x) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 300); x.fillStyle = '#3fae5b'; x.fillRect(0, 0, 256, 70); x.fillStyle = '#ffffff'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('給料日', 128, 36); x.fillStyle = '#22252d'; x.font = 'bold 130px sans-serif'; x.fillText('¥', 128, 180); });
    for (let i = 0; i < 14; i++) { const s = G(); const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), fm); pl.position.y = -0.02; s.add(pl); s.position.z = 0.01 + i * 0.004; c.add(s); c.userData.items.push(s); }
    reg('cal', c); }
  { const g = G(); g.userData.items = []; for (let i = 0; i < 12; i++) { const b = G(); rbox(0.34, 0.16, 0.008, 0.01, '#5fae6b', 0, 0, 0, b); rbox(0.3, 0.12, 0.004, 0.008, '#cfe9c8', 0, 0, 0.005, b); g.add(b); g.userData.items.push(b); } reg('bills', g); }
}

// coin tower: coinsB at the bottom, coinsA on top (64 coins, ~1.8 m). u = scatter 0..1 after the rent bill lands
const PR = (() => { const r = rng(11), a = []; for (let i = 0; i < 64; i++) a.push([r() * 2 - 1, r(), r() * 2 - 1, r() * 6, r() * 6]); return a; })();
function coinTower(s, bx, n, u) {
  [s.P.coinsB, s.P.coinsA].forEach((st, j) => {
    st.visible = true; st.position.set(bx, j * 0.9, 0); st.rotation.set(0, 0, 0);
    st.userData.items.forEach((it, i) => {
      const g = j * 32 + i, y0 = 0.013 + i * 0.028; it.visible = g < n; const d = clamp(u * 1.3 - (1 - g / 64) * 0.3);
      if (d <= 0) { it.position.set(Math.sin(i * 2.1) * 0.008, y0, Math.cos(i * 1.3) * 0.008); it.rotation.set(0, 0, 0); return; }
      const e = ease(d), tx = 0.15 + PR[g][0] * 0.75, tz = 0.25 + PR[g][2] * 0.5, ty = 0.013 - j * 0.9;
      it.position.set(lerp(0, tx, e), lerp(y0, ty, e) + Math.sin(e * Math.PI) * (0.4 + PR[g][1] * 0.5), lerp(0, tz, e));
      it.rotation.set(PR[g][3] * e * (1 - e), 0, PR[g][4] * e * (1 - e));
    });
  });
}
function coinStack(st, n) { st.visible = true; st.userData.items.forEach((it, i) => { it.visible = i < n; it.position.set(Math.sin(i * 2.1) * 0.008, 0.013 + i * 0.028, Math.cos(i * 1.3) * 0.008); it.rotation.set(0, 0, 0); }); }
function rentDrop(s, bx, lt, t0) { // falls from above, lands at t0 (flat on the coins -> floor)
  const b = s.P.rentbill; b.visible = true; const f = k(lt, t0 - 0.25, t0);
  const y = lt < t0 ? lerp(3.6, 1.82, f * f) : lerp(1.82, 0.03, ease(k(lt, t0, t0 + 0.35)));
  b.position.set(bx, y, 0.1); b.rotation.set(0.9 * (1 - ease(k(lt, t0, t0 + 0.35))), 0, 0);
}
const holdCoin = (s, side, p) => { const c = s.P.coin1; c.visible = true; c.position.copy(p); c.rotation.set(0, 0, 0); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.06 : -0.06, -0.07, -0.03))); };

const plan = [
  // 0) cold open (flash-forward of #8): giant rent bill crushes the coin tower; push in, one coin left, dazed smile
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: RENT, show: [],
    cam: { p0: [0.1, 1.45, 5.8], p1: [-0.4, 1.42, 2.6], l0: [0.1, 1.1, 0], l1: [-0.4, 1.38, 0.2], hold: 1.6, dur: 2.3 },
    shake: [[0.25, 0.08, 0.7]], lines: [[0.25, 0.9]],
    sfx: [[0.22, 'impact_doon', -8], [0.26, 'collapse', -10], [0.3, 'coin_toss', -9], [0.7, 'coin_toss', -11], [1.6, 'whoosh_slide', -13], [2.35, 'comic_stupid', -10]],
    stamps: [{ t: 0.25, text: 'ドーン!!', x: 640, y: 1130, rot: 8, color: YEL, size: 116, dur: 1.1 },
      { t: 2.35, text: 'チャリン…', x: 300, y: 1150, rot: -6, color: '#ffffff', size: 70, dur: 0.65 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.2); s.hero.rotation.y = 0.3 * (1 - ease(k(lt, 1.6, 2.1)));
      coinTower(s, 0.5, 64, ease(k(lt, 0.25, 0.95))); rentDrop(s, 0.5, lt, 0.25);
      if (lt < 0.25) { h.face({ lid: 0.1, look: [0.8, 0.5], mouth: 'smile' }); h.arm('L', 0.2, 2.6, 0.3); h.arm('R', 0.2, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); }
      else if (lt < 1.6) { h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.8, 0], mouth: 'o', open: 1.1 }); h.arm('L', 0.4, 0.9, 1.2); h.arm('R', 0.4, 0.9, 1.2); h.head.rotation.z = -0.1; }
      else { holdCoin(s, 'R', V(-0.12, 1.25, 0.6)); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.5, brow: -0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 2.2, 2.5)); }
    } },
  // 1) title: phone buzzes, money in
  { sc: 'st', say: ['hook'], pal: HOOK, show: ['phone'],
    cam: { p0: [0.1, 1.45, 4.7], p1: [0.1, 1.43, 4.4], l0: [0.1, 1.2, 0] },
    sfx: [[0.02, 'text_impact', -9], [0.6, 'phone_vibe', -13], [1.4, 'coin_toss', -11]],
    tags: [{ t: 1.4, text: '毎朝チャリン♪', x: 520, y: 640, h: 84, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.8, 1.3)); s.hero.position.set(0, Math.sin(a * Math.PI) * 0.14, 0.2); s.hero.rotation.y = 0;
      const p = s.P.phone, pp = V(0.3, lerp(1.1, 1.75, a), 0.5); p.position.copy(pp); p.rotation.set(0, 0, Math.sin(lt * 40) * 0.05 * (1 - a));
      h.reach('R', pp.clone().add(V(0.06, -0.1, -0.03))); h.arm('L', 0.1, lerp(0.3, 2.6, a), 0.2); h.hand('L', 'pa');
      h.face(a < 0.5 ? { lid: 0.2, look: [0.6, -0.2], mouth: 'o', open: 0.7 } : { lid: 0, brow: 0.4, mouth: 'smile', look: [0.2, 0.2] });
    } },
  // 2) normal: once a month vs you: every day
  { sc: 'st', say: ['first'], pre: 0.2, hold: 0.3, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: ['bill', 'coin1'], hud: ['給料', '毎日払い'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.43, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.6, 'text_pa', -11], [2.3, 'coin_toss', -13]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'ふつう 月1回', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > this.lt.first + 1.3 ? [{ t: this.lt.first + 1.3, text: 'あなた 毎日', x: p1[0], y: p1[1], h: 84, bg: CY }] : [])]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.7, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.7, Math.abs(Math.sin(lt * 5)) * 0.04, 0.2); s.hero.rotation.y = 0.3;
      const b = s.P.bill, bp = V(0.5, 1.2, 0.45); b.position.copy(bp); b.rotation.set(0, 0, 0.1); h2.reach('L', bp.clone().add(V(-0.1, -0.05, -0.02))); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.3, brow: -0.3, mouth: 'flat', look: [-0.5, 0] });
      holdCoin(s, 'R', V(-0.45, 1.75 + Math.abs(Math.sin(lt * 5)) * 0.04, 0.4)); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0, brow: 0.4, mouth: 'smile', look: [0.5, 0] });
    } },
  // 3) 34万円 -> 1万1千円 every morning: coins pile up
  { sc: 'st', say: ['day'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#3fae5b'], show: ['coinsA', 'phone'], hud: ['毎朝', '1万1千円'], hudColor: YEL,
    cam: { p0: [0.0, 1.4, 4.6], p1: [0.0, 1.38, 4.3], l0: [0.0, 1.15, 0] },
    sfx: [[0.4, 'coin_toss', -11], [1.0, 'coin_toss', -12], [1.6, 'coin_toss', -12], [2.3, 'text_pa', -10]],
    cards: [{ t: 2.0, text: '毎朝 [1万1千円]', y: 480, size: 66, border: YEL, sub: '月給34万円 ÷ 30日（試算）' }],
    note: '月給は厚労省 賃金構造基本統計調査（2025年）',
    act(lt, s) {
      const c = s.P.coinsA, n = Math.round(14 * ease(k(lt, 0.3, 2.4))); c.position.set(0.3, 0.0, 0.1); coinStack(c, n);
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.25); s.hero.rotation.y = 0.3;
      const p = s.P.phone, pp = V(-0.15, 1.2, 0.55); p.position.copy(pp); p.rotation.set(-0.3, 0, 0); h.reach('L', pp.clone().add(V(-0.06, -0.09, -0.03))); h.reach('R', V(0.15, 0.95, 0.3)); h.hand('R', 'pa');
      h.face(lt < 2.0 ? { lid: 0.2, look: [0.6, -0.3], mouth: 'smile' } : { lid: 0.55, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 3) * 0.06;
    } },
  // 4) 365 paydays a year: calendar of paydays flies off
  { sc: 'st', say: ['payday'], pre: 0.15, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['cal'], hud: ['給料日', '年365回'],
    cam: { p0: [0.1, 1.45, 4.6], p1: [0.1, 1.43, 4.3], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'whoosh_switch2', -13], [0.9, 'whoosh_switch1', -14], [1.8, 'text_pa', -10], [2.9, 'comic_jajean', -12]],
    cards(lt) { return [{ t: 0.4, text: '[365回]', y: 480, size: 70, border: CY }, ...(lt > this.lt.payday + 2.6 ? [{ t: this.lt.payday + 2.6, text: 'ふつうの [30倍]', y: 610, size: 56, border: YEL }] : [])]; },
    act(lt, s) {
      const c = s.P.cal; c.position.set(0.42, 1.45, -0.3);
      c.userData.items.forEach((p, i) => { const j = 13 - i, f = Math.max(0, lt - 0.3 - j * 0.2); p.visible = f < 1.2; p.position.set(f * 0.9, -f * f * 0.9 + f * 0.6, 0.01 + i * 0.004 + f * 0.4); p.rotation.set(-f * 2, 0, -f * 3); });
      const h = s.hero.userData; s.hero.position.set(-0.45, Math.abs(Math.sin(lt * 4)) * 0.05, 0.2); s.hero.rotation.y = 0.35; h.reach('R', V(0.2, 1.35, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.2, 2.5, 0.3); h.hand('L', 'pa');
      h.face(lt < 2.6 ? { lid: 0.1, look: [0.8, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.5, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 5) 75 onigiri a day
  { sc: 'st', say: ['oni'], pre: 0.15, pal: ['#5ab8ff', '#e3f3ff', '#ffffff'], show: ['onigiri'], hud: ['おにぎり', '毎日75個'],
    cam: { p0: [0.15, 1.45, 4.6], p1: [0.15, 1.43, 4.3], l0: [0.15, 1.15, 0] },
    sfx: [[0.3, 'comic_pico', -14], [0.7, 'comic_pico', -14], [1.1, 'comic_pico', -14], [1.5, 'text_pa', -10], [2.2, 'comic_eat', -11]],
    tags(lt) { const p = scr(S, V(0.55, 0.8, 0.1), 0, -60); return [{ t: 1.4, text: '1日で 75個', x: p[0], y: p[1], h: 84, bg: YEL }]; },
    note: 'おにぎり1個150円で計算（試算）',
    act(lt, s) {
      const o = s.P.onigiri, n = Math.round(23 * ease(k(lt, 0.1, 1.6))); o.position.set(0.55, 0, 0.1); o.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.35; h.reach('R', V(0.2, 0.55, 0.3)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 1.6 ? { lid: 0, brow: -0.4, browY: 1, look: [0.8, -0.4], mouth: 'o', open: 0.9 } : { lid: 0.6, brow: 0.5, look: [0.4, 0], mouth: 'smile' });
    } },
  // 6) no more broke days before payday
  { sc: 'st', say: ['broke'], pre: 0.15, pal: ['#8fd3ff', '#eef6ff', '#2a5bd7'], hero2: true, show: ['coin1'], hud: ['金欠', '0日'],
    cam: { p0: [0, 1.48, 5.0], p1: [0, 1.46, 4.7], l0: [0, 1.25, 0] },
    sfx: [[0.3, 'comic_stupid', -13], [1.6, 'sparkle', -12], [1.8, 'text_pa', -10]],
    stamps: [{ t: 1.6, text: '金欠ゼロ!', x: 520, y: 600, rot: -6, color: YEL, size: 100, dur: 1.3 }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.7, 0, 0); s.hero2.rotation.y = -0.35; s.hero.position.set(-0.7, Math.abs(Math.sin(lt * 5)) * 0.05, 0.2); s.hero.rotation.y = 0.3;
      h2.face({ lid: 0.4, brow: -1, look: [-0.4, -0.4], mouth: 'flat' }); h2.arm('L', 0.3, 0.3, 1.6); h2.arm('R', 0.3, 0.3, 1.6); h2.head.rotation.x = 0.15;
      holdCoin(s, 'R', V(-0.4, 1.7, 0.45)); h.arm('L', 0.1, 2.5, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.3, brow: 0.5, mouth: 'smile', look: [0.3, 0.2] });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) rent once a month: 6 days of pay gone (the cold open, in its place)
  { sc: 'st', say: ['rent'], pre: 0.15, hold: 0.6, pal: RENT, dim: 0.9, hud: ['家賃', '6日分'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 5.6], p1: [0.05, 1.45, 5.0], l0: [0.1, 1.1, 0] },
    shake: [[1.3, 0.06, 0.5]],
    sfx: [[1.25, 'impact_doon', -9], [1.3, 'collapse', -11], [1.35, 'coin_toss', -10], [2.4, 'text_pa', -10]],
    stamps: [{ t: 1.3, text: 'ドーン!', x: 640, y: 1130, rot: 8, color: YEL, size: 100, dur: 0.8 }],
    cards(lt) { return lt > 2.3 ? [{ t: 2.3, text: '家賃7万円 ＝ [6日分]', y: 480, size: 60, border: RED }] : []; },
    note: '家賃7万円・日給1万1千円で計算（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.2); s.hero.rotation.y = 0.3;
      coinTower(s, 0.5, 64, ease(k(lt, 1.3, 2.0))); rentDrop(s, 0.5, lt, 1.3);
      h.face(lt < 1.3 ? { lid: 0.1, look: [0.8, 0.5], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0.6, -0.2], mouth: 'o', open: 1.1 });
      if (lt < 1.3) { h.reach('R', V(0.32, 1.3, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.1, 0.4, 1.5); } else { h.arm('L', 0.4, 0.9, 1.2); h.arm('R', 0.4, 0.9, 1.2); }
    } },
  // 9) company: 365 transfers per person -> fee over 50,000 yen
  { sc: 'st', say: ['fee'], pre: 0.15, pal: ['#9a8cff', '#f0eeff', '#ffffff'], hero2: true, show: ['desk', 'bills'], hud: ['振込', '1人365回'], hudColor: RED,
    cam: { p0: [0, 1.5, 5.6], p1: [0, 1.48, 5.3], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'whoosh_switch1', -14], [0.8, 'whoosh_switch2', -14], [1.3, 'whoosh_switch1', -14], [2.4, 'text_pa', -10], [3.6, 'comic_shock2', -12]],
    tags: [{ t: 1.0, text: '1回150円 × 365回', x: 520, y: 640, h: 74, bg: '#ffffff' }],
    cards(lt) { const t0 = this.lt.fee + 3.0; return lt > t0 ? [{ t: t0, text: '1人 [年5万4,750円]', y: 480, size: 62, border: RED }] : []; },
    note: '振込手数料を1回150円として計算（試算）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.P.desk.position.set(0.7, 0, -0.3); s.hero2.position.set(0.7, 0, -0.75); s.hero2.rotation.y = -0.2;
      s.hero.position.set(-0.65, 0, 0.3); s.hero.rotation.y = 0.35;
      s.P.bills.userData.items.forEach((b, i) => { const f = ((lt * 0.9 + i / 12) % 1); b.position.set(lerp(0.5, -0.5, f), 0.85 + Math.sin(f * Math.PI) * 0.25, lerp(-0.1, 0.5, f)); b.rotation.set(f * 4 + i, f * 3, f * 5); });
      s.P.bills.position.set(0, 0, 0);
      h2.face(lt < 2.5 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [-0.6, 0] } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); h2.arm('L', 0.6, 0.5, 0.6); h2.arm('R', 0.6, 0.5, 0.6); h2.hand('L', 'pa'); h2.hand('R', 'pa');
      h.arm('R', 0.5, 0.6, 0.4); h.arm('L', 0.5, 0.6, 0.4); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0.1, brow: 0.3, look: [0.6, 0.2], mouth: 'smile' });
    } },
  // 10) good news / bad news
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: ['coin1', 'cup', 'coinsA'],
    cam: { p0: [0.1, 1.48, 4.4], p1: [0.1, 1.46, 4.1], l0: [0.05, 1.3, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', '毎朝が給料日'] : ['悪いニュース', '年18万円']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 1.4, 'coin_toss', -13], [0.15 + D('good') + 2.2, 'coin_toss', -13]],
    tags(lt) { const a = this.lt.bad; return lt < a ? [{ t: 1.4, text: '毎朝 ちょっとうれしい', x: 520, y: 520, h: 80, bg: YEL }] : [{ t: a + 1.4, text: 'ごほうび500円 × 365日', x: 520, y: 520, h: 74, bg: '#ffffff' }]; },
    note: '毎日500円のごほうびで計算（試算）',
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad; s.hero.position.set(-0.2, 0, 0.2); s.hero.rotation.y = 0.15;
      const c = s.P.coinsA; c.visible = late; c.position.set(0.4, 0.0, 0.25); const n = Math.round(32 * (1 - ease(k(lt, sh.lt.bad + 0.5, sh.lt.bad + D('bad'))))); coinStack(c, n);
      s.P.cup.visible = late; s.P.coin1.visible = !late;
      if (!late) { holdCoin(s, 'R', V(0.1, 1.75, 0.45)); h.arm('L', 0.1, 2.5, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.3, brow: 0.5, mouth: 'smile', look: [0.4, 0.4] }); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.05; }
      else { const cp = V(-0.08, 1.05, 0.55); s.P.cup.position.copy(cp); h.reach('R', cp.clone().add(V(0.09, -0.02, -0.02))); h.arm('L', 0.1, 0.3, 0.2);
        h.face(lt < sh.lt.bad + 1.5 ? { lid: 0.4, brow: 0.3, look: [0, -0.5], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0.8, -0.3], mouth: 'o', open: 1 }); }
    } },
  // 11) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['phone'],
    cam: { p0: [0.05, 1.4, 4.8], p1: [0.05, 1.4, 4.6], l0: [0, 1.22, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: '月1でいい', x: 680, y: 520, h: 110, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 510, y: 670, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 510, y: 1440, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.2); s.hero.rotation.y = -0.05;
      const p = s.P.phone, pp = V(0.35, 1.15, 0.5); p.position.copy(pp); h.reach('R', pp.clone().add(V(0.06, -0.1, -0.03)));
      h.arm('L', 0.2, 0.7, 1.7); h.face({ lid: 0.3, brow: 0.5, look: [0.2, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも給料が', '[毎日払い]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['給料', '毎日払い'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
