// ep36_denkidai2x (pop / arm A): もしも電気代が毎月2倍になったら？
// 型は sp_geppu2x / ep34。台本・数字・小道具は自作。
// 前提（試算）: 電気代 = 13,000円 × 2^月数（月約1万3千円＝総務省 家計調査2025 2人以上の世帯の季節別平均 13,219円を丸め）
//   3か月 ×8 = 104,000円 / 5か月 ×32 = 416,000円 > 月給34万600円（厚労省 令和7年賃金構造基本統計調査）
//   単価31円/kWh（全国家庭電気製品公正取引協議会 2022）。レンジ 1,000W×3分 = 0.05kWh = 1.55円
//   1年(×4,096) 1.55×4096 = 6,349円 ≒ 6,300円 / 2年(×16,777,216) = 26,004,685円 ≒ 2,600万円
//   冷蔵庫 年250kWh → 1時間0.0285kWh = 0.885円 ×4096 ×8時間 = 28,990円 ≒ 2万9千円
//   自転車発電 100W×1時間 = 0.1kWh = 3.1円 ×4096 = 12,698円 ≒ 1万2千円（同じ値段で売れたら）
//   スマホ充電 0.015kWh = 0.465円 ×4096 = 1,905円 ≒ 1,900円
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep36_denkidai2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#3fa8ff', '#e4f3ff', '#ffd23a'], MAIN = ['#ffb13d', '#fff3df', '#3f6fd8'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // invoice sheets (burst out of the microwave)
  const invM = label(256, 340, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 340); c.fillStyle = '#e2463c'; c.fillRect(0, 0, 256, 80); c.fillStyle = '#ffffff'; c.font = 'bold 50px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('請求書', 128, 42);
    c.fillStyle = '#22252d'; c.font = 'bold 40px sans-serif'; c.fillText('電気代', 128, 140); c.fillStyle = '#e2463c'; c.font = 'bold 54px sans-serif'; c.fillText('¥¥¥¥', 128, 230); c.fillStyle = '#9aa3ad'; c.fillRect(30, 290, 196, 8); });
  invM.side = THREE.DoubleSide;
  { const g = G(); g.userData.items = []; for (let i = 0; i < 34; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.27), invM); p.castShadow = true; g.add(p); g.userData.items.push(p); } reg('inv', g); }
  // one invoice held in hand
  { const p = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.32), invM); p.add(m); reg('inv1', p); }
  // price signs on a stand
  const sign = (name, top, price, col) => {
    const s = G(); cyl(0.02, 0.02, 1.0, '#9aa3ad', 0, 0.5, 0, s); cyl(0.16, 0.18, 0.04, '#9aa3ad', 0, 0.02, 0, s);
    rbox(0.74, 0.46, 0.04, 0.03, col, 0, 1.22, 0, s);
    const fm = label(512, 300, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 512, 300); c.fillStyle = col; c.fillRect(0, 0, 512, 92); c.fillStyle = '#ffffff'; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(top, 256, 48);
      c.fillStyle = '#22252d'; let fs = 120; c.font = `bold ${fs}px sans-serif`; while (c.measureText(price).width > 480) { fs -= 6; c.font = `bold ${fs}px sans-serif`; } c.fillText(price, 256, 200); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.4), fm); f.position.set(0, 1.22, 0.022); s.add(f); reg(name, s); };
  sign('s0', '電気代 いま', '1万3千円', '#3fae5b');
  sign('s3', '3か月後', '10万円', '#f08a24');
  sign('s5', '5か月後', '41万円', '#e2463c');
  // salary envelope
  { const e = G(); rbox(0.26, 0.17, 0.012, 0.01, '#f2e3c2', 0, 0, 0, e);
    const fm = label(256, 160, (c) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#22252d'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('給料', 128, 60); c.font = 'bold 34px sans-serif'; c.fillText('34万円', 128, 122); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.15), fm); f.position.z = 0.008; e.add(f); reg('pay', e); }
  // fridge (origin = floor)
  { const f = G(); rbox(0.66, 1.7, 0.6, 0.06, '#f4f6f8', 0, 0.85, 0, f); rbox(0.64, 0.012, 0.01, 0.004, '#c9d0d8', 0, 1.18, 0.302, f);
    for (const y of [1.45, 0.75]) rbox(0.03, 0.26, 0.04, 0.012, '#9aa3ad', 0.26, y, 0.32, f);
    f.userData.led = sph(0.02, M('#3fd16b'), -0.24, 1.6, 0.305, f); reg('fridge', f); }
  // exercise bike generator (origin = floor), pedal crank = userData.crank, bulb = userData.bulb
  { const b = G(); rbox(0.9, 0.06, 0.32, 0.03, '#2c3b6b', 0, 0.03, 0, b);
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 10, 30), M('#23262f')); w.position.set(0.25, 0.36, 0); b.add(w);
    const p1 = rbox(0.06, 0.8, 0.06, 0.02, '#e2463c', -0.1, 0.45, 0, b); p1.rotation.z = -0.25;
    rbox(0.26, 0.06, 0.18, 0.03, '#23262f', -0.2, 0.86, 0, b);
    const p2 = rbox(0.05, 0.7, 0.05, 0.02, '#e2463c', 0.32, 0.6, 0, b); p2.rotation.z = 0.2; rbox(0.06, 0.05, 0.44, 0.02, '#23262f', 0.39, 0.95, 0, b);
    const cr = G(); cr.position.set(0.0, 0.33, 0.12); b.add(cr); rbox(0.04, 0.32, 0.03, 0.01, '#9aa3ad', 0, 0, 0, cr); rbox(0.12, 0.03, 0.08, 0.01, '#23262f', 0, 0.16, 0.03, cr); rbox(0.12, 0.03, 0.08, 0.01, '#23262f', 0, -0.16, -0.03, cr);
    b.userData.crank = cr; cyl(0.012, 0.012, 0.5, '#9aa3ad', 0.5, 1.15, 0, b);
    b.userData.bulb = sph(0.09, M('#8a8a80'), 0.5, 1.44, 0, b); reg('bike', b); }
  // air conditioner on the wall + remote
  { const a = G(); rbox(1.1, 0.34, 0.26, 0.06, '#f4f6f8', 0, 0, 0, a); rbox(0.9, 0.03, 0.02, 0.01, '#c9d0d8', 0, -0.1, 0.13, a);
    a.userData.led = sph(0.018, M('#3fd16b'), 0.44, 0.06, 0.13, a); reg('ac', a); }
  { const r = G(); rbox(0.07, 0.17, 0.025, 0.012, '#f4f6f8', 0, 0, 0, r); sph(0.02, '#e2463c', 0, 0.04, 0.012, r, 1, 1, 0.4); reg('remote', r); }
}

const desk = (s, x = 0.6, z = -0.1) => { s.P.desk.visible = true; s.P.desk.position.set(x, 0, z); const m = s.P.mw; m.visible = true; m.position.set(x, 0.77, z); return m; };
// invoices burst out of the microwave door (u from t0)
const PR = (() => { const r = rng(11), a = []; for (let i = 0; i < 34; i++) a.push([r() * 2 - 1, r(), r() * 2 - 1, r() * 6, r() * 6, r()]); return a; })();
function burst(s, lt, t0, ox, oz) {
  const g = s.P.inv; g.visible = true; g.position.set(0, 0, 0);
  g.userData.items.forEach((p, i) => {
    const d = lt - t0 - PR[i][5] * 0.5;
    if (d < 0) { p.visible = false; return; } p.visible = true;
    const vx = PR[i][0] * 1.0 + 0.55, vy = 1.4 + PR[i][1] * 2.2, vz = 1.2 + PR[i][2] * 0.5 + PR[i][1] * 0.6;
    const tt = Math.min(d, 1.6), y = Math.max(0.01 + i * 0.002, 0.96 + vy * tt - 2.4 * tt * tt);
    p.position.set(ox + vx * tt * 0.8, y, oz + 0.1 + vz * tt * 0.8);
    const land = y <= 0.02 + i * 0.002;
    p.rotation.set(land ? -Math.PI / 2 : PR[i][3] * tt * 2, land ? PR[i][4] : PR[i][4] * tt * 2, land ? 0 : PR[i][3] * tt);
  });
}
const glow = (s, on) => { s.P.mw.userData.glow.material.color.set(on ? '#ffcf6b' : '#5a5a5a'); };
const signAt = (s, name, x, z = -0.2, ry = 0.15) => { const g = s.P[name]; g.visible = true; g.position.set(x, 0, z); g.rotation.set(0, ry, 0); return g; };
const hold = (s, name, side, p, rz = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.08, -0.03))); return o; };

// microwave scene shared by cold open and #6
function chin(s, lt, t0) {
  const m = desk(s, 0.62, -0.15); glow(s, lt < t0);
  const h = s.hero.userData; s.hero.position.set(-0.32, 0, 0.3); s.hero.rotation.y = 0.35;
  if (lt < t0) h.reach('R', V(0.3, 0.98, 0.1)); else h.arm('R', 0.5, 1.0, 1.0);
  burst(s, lt, t0, 0.5, 0.06); void m;
}

const plan = [
  // 0) cold open (flash-forward of #6): one ping of the microwave -> a blizzard of electricity bills; push in, deadpan face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.2, 1.6, 6.2], p1: [-0.28, 1.46, 2.6], l0: [0.2, 1.25, 0], l1: [-0.28, 1.42, 0.3], hold: 1.4, dur: 2.2 },
    shake: [[0.25, 0.08, 0.7]], lines: [[0.25, 0.9]],
    sfx: [[0.2, 'text_tin', -8], [0.28, 'impact_doon', -9], [0.32, 'whoosh_gust', -12], [0.9, 'coin_toss', -14], [1.5, 'whoosh_slide', -13], [2.3, 'comic_stupid', -10]],
    stamps: [{ t: 0.25, text: 'チン!!', x: 760, y: 700, rot: 8, color: YEL, size: 120, dur: 1.1 },
      { t: 2.3, text: 'あたためただけです', x: 360, y: 1180, rot: -6, color: '#ffffff', size: 58, dur: 0.7 }],
    act(lt, s) {
      chin(s, lt, 0.25); const h = s.hero.userData;
      if (lt < 1.4) { h.arm('L', 0.4, 0.9, 1.2); h.face(lt < 0.25 ? { lid: 0.2, look: [0.8, -0.2], mouth: 'smile' } : { lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.4], mouth: 'o', open: 1.1 }); }
      else { s.hero.rotation.y = 0.35 * (1 - ease(k(lt, 1.4, 1.9))); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.55, brow: 0.3, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = 0.1 * ease(k(lt, 2.1, 2.4)); }
    } },
  // 1) title: lamp on, bill today
  { sc: 'st', say: ['hook'], pal: MAIN, show: ['lamp'],
    cam: { p0: [0.0, 1.4, 4.8], p1: [0.0, 1.38, 4.5], l0: [0.0, 1.15, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.2, 'comic_pico', -13]],
    tags: [{ t: 1.2, text: '毎月×2', x: 720, y: 1000, h: 96, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0.25); s.hero.rotation.y = 0.2; s.P.lamp.position.set(0.1, 2.55, -0.5);
      hold(s, 'inv1', 'R', V(0.1, 1.25 + Math.abs(Math.sin(lt * 4)) * 0.03, 0.55), -0.1); h.arm('L', 0.2, 2.5, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.2, brow: 0.4, mouth: 'smile', look: [0.5, 0.2] });
    } },
  // 2) real: today 13,000 yen vs you x2 every month
  { sc: 'st', say: ['real'], pre: 0.2, hold: 0.2, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: [], hud: ['電気代', '毎月×2'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.43, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.9, 'text_pa', -11], [3.6, 'comic_surprise', -13]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'いま 月1万3千円', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > this.lt.real + 2.8 ? [{ t: this.lt.real + 2.8, text: 'あなた 毎月2倍', x: p1[0], y: p1[1], h: 84, bg: CY }] : [])]; },
    note: '2人以上の世帯の平均（総務省 家計調査2025）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.66, 0, 0.2); s.hero.rotation.y = 0.3;
      h2.arm('L', 0.3, 0.6, 1.5); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.3, brow: 0.2, mouth: 'smile', look: [-0.4, 0] });
      hold(s, 'inv1', 'R', V(-0.45, 1.2, 0.5), -0.1); h.arm('L', 0.1, 0.3, 0.2);
      h.face(lt < 3.0 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.5, 0] } : { lid: 0, brow: -0.8, browY: 1, mouth: 'o', open: 1, look: [0, 0] });
    } },
  // 3) 3 months: 100,000 yen = rent
  { sc: 'st', say: ['m3'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['coinsA'], hud: ['3か月後', '×8'], hudColor: YEL,
    cam: { p0: [-0.05, 1.45, 4.9], p1: [-0.05, 1.43, 4.6], l0: [-0.05, 1.2, 0] },
    sfx: [[0.4, 'coin_toss', -12], [1.0, 'coin_toss', -13], [1.5, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '月 [10万円]', y: 480, size: 70, border: YEL, sub: '1万3千円×2×2×2（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.m3 + 2.5; return lt > t0 ? [{ t: t0, text: '家賃なみ', x: 760, y: 1200, h: 90, bg: '#ffffff' }] : []; },
    act(lt, s) {
      signAt(s, 's3', 0.62, -0.2, -0.2);
      const c = s.P.coinsA, n = Math.round(4 + 24 * ease(k(lt, 0.3, 1.6))); c.position.set(0.05, 0, 0.35); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; s.hero.position.set(-0.6, 0, 0.3); s.hero.rotation.y = 0.35;
      h.reach('R', V(-0.08, 0.2 + n * 0.028, 0.35)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 1.4 ? { lid: 0.1, look: [0.8, -0.3], mouth: 'o', open: 0.6 } : { lid: 0, brow: -0.6, browY: 1, look: [0.7, 0], mouth: 'o', open: 1 });
    } },
  // 4) 5 months: 416,000 yen > salary
  { sc: 'st', say: ['m5'], pre: 0.15, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: [], hud: ['5か月後', '×32'],
    cam: { p0: [0.0, 1.42, 4.8], p1: [0.0, 1.4, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'comic_jajean', -12], [1.6, 'text_pa', -10], [2.9, 'comic_fall', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '月 [41万円]', y: 480, size: 70, border: CY }] : []; },
    tags(lt) { const t0 = this.lt.m5 + 2.6; return lt > t0 ? [{ t: t0, text: '給料 34万円 < 電気代', x: 540, y: 640, h: 74, bg: '#ffffff' }] : []; },
    note: '月給34万600円（厚労省 2025年）',
    act(lt, s) {
      signAt(s, 's5', 0.72, -0.2, -0.2);
      const h = s.hero.userData; s.hero.position.set(-0.25, 0, 0.3); s.hero.rotation.y = 0.25;
      const a = ease(k(lt, 0.3, 1.0)); hold(s, 'pay', 'L', V(-0.62, lerp(1.0, 1.3, a), 0.55)); hold(s, 'inv1', 'R', V(0.18, lerp(1.0, 1.32, a), 0.6), 0.1);
      h.face(lt < 2.7 ? { lid: 0.1, brow: 0.2, look: [0.6, 0.4], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 5) 1 year: microwave ping 6,300 yen
  { sc: 'st', say: ['y1'], pre: 0.15, pal: ['#4fc38a', '#e6f8ee', '#ffd23a'], show: [], hud: ['1年後', '×4096'], hudColor: YEL,
    cam: { p0: [0.15, 1.4, 4.7], p1: [0.15, 1.38, 4.4], l0: [0.15, 1.1, 0] },
    sfx: [[2.0, 'text_tin', -10], [2.6, 'text_pa', -10], [3.3, 'comic_surprise', -12]],
    cards(lt) { return lt > 2.5 ? [{ t: 2.5, text: 'チン1回 [6,300円]', y: 480, size: 64, border: YEL, sub: '1,000W×3分×31円/kWh×4096（試算）' }] : []; },
    note: '目安単価31円/kWh（全国家電公取協 2022）',
    act(lt, s) {
      desk(s, 0.62, -0.15); glow(s, lt < 2.0);
      const h = s.hero.userData; s.hero.position.set(-0.32, 0, 0.3); s.hero.rotation.y = 0.35;
      if (lt < 2.0) { h.reach('R', V(0.3, 0.98, 0.1)); h.face({ lid: 0.2, look: [0.8, -0.3], mouth: 'smile' }); }
      else { h.arm('R', 0.3, 0.6, 1.6); h.arm('L', 0.3, 0.6, 1.6); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); }
    } },
  // 6) 2 years: 26 million yen (the cold open, in its place)
  { sc: 'st', say: ['y2'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['2年後', '×1678万'], hudColor: RED,
    cam: { p0: [0.2, 1.6, 6.4], p1: [0.2, 1.58, 6.0], l0: [0.2, 1.25, 0] },
    shake: [[0.8, 0.06, 0.5]],
    sfx: [[0.75, 'text_tin', -9], [0.8, 'impact_doon', -10], [0.85, 'whoosh_gust', -13], [2.2, 'text_pa', -10]],
    stamps: [{ t: 0.8, text: 'チン!!', x: 780, y: 760, rot: 8, color: YEL, size: 100, dur: 0.8 }],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: 'チン1回 [2,600万円]', y: 480, size: 64, border: RED }] : []; },
    act(lt, s) {
      chin(s, lt, 0.8); const h = s.hero.userData;
      if (lt < 0.8) { h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.2, look: [0.8, -0.2], mouth: 'smile' }); }
      else { h.arm('L', 0.4, 0.9, 1.2); h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.6], mouth: 'o', open: 1.1 }); }
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) the fridge keeps running all night
  { sc: 'st', say: ['fridge'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.85, show: ['fridge'], hud: ['1年後', '×4096'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.9], p1: [0.0, 1.4, 4.6], l0: [0.0, 1.15, 0] },
    sfx: [[0.3, 'amb_night', -16], [2.3, 'text_pa', -10], [3.0, 'comic_shock2', -13]],
    stamps: [{ t: 0.6, text: 'ブーン…', x: 760, y: 820, rot: 6, color: '#ffffff', size: 64, dur: 1.4 }],
    cards(lt) { return lt > 2.2 ? [{ t: 2.2, text: '一晩 [2万9千円]', y: 480, size: 68, border: RED, sub: '冷蔵庫 年250kWh・8時間（試算）' }] : []; },
    act(lt, s) {
      const f = s.P.fridge; f.position.set(0.62, 0, -0.25); f.rotation.y = -0.15; f.scale.set(1, 1 + Math.sin(lt * 30) * 0.004, 1);
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.3;
      h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.2, 0.3, 0.3);
      h.face(lt < 2.1 ? { lid: 0.8, brow: 0.2, look: [0, -0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.8, 0.2], mouth: 'o', open: 1 });
    } },
  // 9) good news (bike generator) / bad news (phone charge)
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: [],
    cam: { p0: [0.1, 1.45, 4.7], p1: [0.1, 1.43, 4.4], l0: [0.05, 1.2, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', '発電'] : ['悪いニュース', '充電']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [2.6, 'text_pa', -11], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 2.6, 'comic_fall', -13]],
    cards(lt) { const a = this.lt.bad; return lt < a ? (lt > 2.5 ? [{ t: 2.5, text: '1時間 [1万2千円]', y: 480, size: 66, border: YEL, sub: '100W×1時間を売れたら（試算）' }] : [])
      : (lt > a + 2.4 ? [{ t: a + 2.4, text: '充電1回 [1,900円]', y: 480, size: 66, border: RED, sub: '1回0.015kWhと仮定（試算）' }] : []); },
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad;
      if (!late) {
        const b = s.P.bike; b.visible = true; b.position.set(0.5, 0, -0.05); b.rotation.y = -0.2; b.userData.crank.rotation.z = -lt * 9;
        b.userData.bulb.material = M(lt > 1.0 ? '#fff3a8' : '#8a8a80'); s.P.bolts.visible = lt > 1.0;
        s.P.bolts.userData.items.forEach((it, i) => { it.position.set(0.55 + Math.sin(i * 1.7 + lt * 3) * 0.3, 1.45 + Math.cos(i * 2.3 + lt * 3) * 0.25, 0); it.scale.setScalar(1.4); });
        s.hero.position.set(-0.3, 0, 0.3); s.hero.rotation.y = 0.35; h.body.position.y = Math.abs(Math.sin(lt * 9)) * 0.05;
        h.reach('R', V(0.3, 0.92, 0.05)); h.arm('L', 0.1, 2.5, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: 0.6, mouth: 'smile', look: [0.4, 0.3] });
      } else {
        s.hero.position.set(-0.2, 0, 0.25); s.hero.rotation.y = 0.15;
        const p = hold(s, 'phone', 'R', V(0.15, 1.2, 0.6), 0.1); p.userData.fill.scale.y = clamp((lt - sh.lt.bad) / 2.2);
        h.arm('L', 0.3, 0.6, 1.5);
        h.face(lt < sh.lt.bad + 2.3 ? { lid: 0.3, brow: 0.3, look: [0.5, -0.2], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); }
    } },
  // 10) question + follow (air conditioner)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['ac'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'つける', x: 320, y: 1040, h: 124, bg: CY }, { t: t0 + 0.2, text: 'がまん', x: 760, y: 1040, h: 110, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1170, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1450, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      s.P.ac.position.set(0.55, 2.35, -0.6);
      const h = s.hero.userData; s.hero.position.set(-0.1, 0, 0.2); s.hero.rotation.y = 0.05;
      hold(s, 'remote', 'R', V(0.28, 1.35, 0.5), -0.2); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも電気代が', '毎月[2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['電気代', '毎月×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
