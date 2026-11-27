// ep65_blackfriday2x (pop / arm C ニュース起点: 11/27 ブラックフライデー): もしもブラックフライデーの値引きが毎日2倍になったら？
// 型は sp_geppu2x / ep64。台本・数字・小道具は自作。
// 前提（試算）:
//   値引き率 1日目5% → 毎日2倍：5,10,20,40,80,160,320%。おにぎり1個160円と仮定
//   おにぎり 160×0.95=152円、80%引き 32円、160%引き 160×(1−1.6)=−96円（96円もらえる）
//   ブラックフライデーの平均予算 2万2,882円（くふう総研 2025年調査）
//   20%引き：22,882÷0.8=28,602円分。80%引き：22,882÷0.2=114,410円分＝ふつうの5倍（カート5台）
//   160%引き：定価2万2,882円分を買うと 22,882×0.6=13,729円もらえる。×1億2,321万人＝1.69兆円/日 お店の赤字
//   段ボール 1箱5,000円分と仮定：114,410÷5,000≈23箱
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep65_blackfriday2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#1c1c28', '#2c2c3e', '#ffd23a'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  const mkTag = (name, text, w = 0.56, bg = '#ffd23a', fg = '#e2463c') => { const t = G(); const pw = Math.round(w * 500);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.26), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(pw, 130, (c) => {
      c.fillStyle = bg; c.fillRect(0, 0, pw, 130); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(4, 4, pw - 8, 122);
      c.fillStyle = fg; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.fillText(text, pw / 2, 88); }) }));
    t.add(m); reg(name, t); };
  mkTag('t160', '160円', 0.6, '#ffffff', '#23262f'); mkTag('t152', '152円', 0.6); mkTag('t32', '32円', 0.6); mkTag('tm96', '+96円', 0.6, '#ffd23a', '#2fa36b');
  // round sale badges
  const mkBadge = (name, text, col = '#e2463c') => { const t = G(); const m = new THREE.Mesh(new THREE.CircleGeometry(0.24, 40), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(200, 200, (c) => {
      c.fillStyle = col; c.beginPath(); c.arc(100, 100, 98, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 9; c.beginPath(); c.arc(100, 100, 86, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#fff'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('SALE', 100, 74); c.font = `bold ${text.length > 4 ? 40 : 52}px sans-serif`; c.fillText(text, 100, 138); }) }));
    t.add(m); reg(name, t); };
  mkBadge('b5', '5%引'); mkBadge('b20', '20%引'); mkBadge('b80', '80%引'); mkBadge('b160', '160%引'); mkBadge('b320', '320%引', '#7b3fe4');
  // single onigiri in hand
  { const o = G(); sph(0.085, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.1, 0.085, 0.13, 0.02, '#20301f', 0, -0.035, 0, o); reg('nig', o); }
  // cash register (sits on the counter)
  { const r = G(); rbox(0.46, 0.2, 0.36, 0.04, '#3a3f4a', 0, 0.1, 0, r); rbox(0.4, 0.06, 0.3, 0.02, '#c8cdd6', 0, 0.23, 0.02, r);
    const sc = rbox(0.26, 0.16, 0.03, 0.02, '#23262f', 0, 0.36, -0.08, r); sc.rotation.x = -0.3; rbox(0.22, 0.11, 0.01, 0.01, new THREE.MeshBasicMaterial({ color: '#9fe3c0' }), 0, 0.365, -0.063, r).rotation.x = -0.3;
    const dr = rbox(0.4, 0.07, 0.3, 0.02, '#5a606c', 0, 0.035, 0.05, r); r.userData.drawer = dr; reg('reji', r); }
  // cash burst (items) — bills
  { const g = G(); g.userData.items = []; for (let i = 0; i < 18; i++) { const b = G(); rbox(0.3, 0.14, 0.008, 0.01, '#5fae6b', 0, 0, 0, b); rbox(0.26, 0.1, 0.004, 0.008, '#cfe9c8', 0, 0, 0.005, b); g.add(b); g.userData.items.push(b); } reg('cash', g); }
  // shopping cart with goods (origin on the floor)
  const mkCart = (full = 1) => { const c = G(); const wire = '#c8d0da';
    rbox(0.66, 0.03, 0.46, 0.01, wire, 0, 0.5, 0, c); for (const [x, z, w, d] of [[0, 0.22, 0.66, 0.02], [0, -0.22, 0.66, 0.02], [0.32, 0, 0.02, 0.46], [-0.32, 0, 0.02, 0.46]]) rbox(w, 0.36, d, 0.01, M(wire, 0.4), x, 0.68, z, c);
    rbox(0.04, 0.04, 0.5, 0.02, '#e2463c', -0.42, 0.92, 0, c); for (const s of [-1, 1]) rbox(0.12, 0.03, 0.02, 0.01, wire, -0.37, 0.88, s * 0.22, c);
    for (const [x, z] of [[-0.26, 0.18], [-0.26, -0.18], [0.26, 0.18], [0.26, -0.18]]) { rbox(0.02, 0.44, 0.02, 0.005, wire, x, 0.28, z, c); cyl(0.05, 0.05, 0.03, '#23262f', x, 0.05, z, c).rotation.x = Math.PI / 2; }
    const cols = ['#ff7a6b', '#35b6ff', '#ffd23a', '#7bd88f', '#c79bff', '#ffffff'];
    for (let i = 0; i < 7 * full; i++) { const w = 0.16 + (i % 3) * 0.04; rbox(w, 0.18 + (i % 2) * 0.08, 0.14, 0.02, cols[i % 6], -0.2 + (i % 3) * 0.2, 0.62 + Math.floor(i / 3) * 0.16, -0.1 + (i % 2) * 0.18, c); }
    return c; };
  reg('cart', mkCart(1));
  { const g = G(); g.userData.items = []; for (let i = 0; i < 5; i++) { const c = mkCart(1); c.position.set((i - 2) * 0.78, 0, -0.9 - (i % 2) * 0.35); g.add(c); g.userData.items.push(c); } reg('carts', g); }
  // 23 cardboard boxes (items)
  { const g = G(); g.userData.items = []; const pos = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6 - (r > 2 ? 1 : 0); c++) pos.push([(c - 2.5 + (r % 2) * 0.3) * 0.5, 0.22 + r * 0.43]);
    for (let i = 0; i < 23; i++) { const b = G(); rbox(0.46, 0.42, 0.42, 0.02, '#c98f4a', 0, 0, 0, b); rbox(0.08, 0.425, 0.425, 0.005, '#e3b877', 0, 0, 0, b);
      b.position.set(pos[i][0], pos[i][1], -0.5 - (i % 3) * 0.12); b.rotation.y = Math.sin(i * 1.9) * 0.15; g.add(b); g.userData.items.push(b); } reg('boxes', g); }
  // closed shutter with a sign
  { const g = G(); rbox(2.8, 2.3, 0.08, 0.02, '#a7adb7', 0, 1.15, 0, g); for (let i = 0; i < 14; i++) rbox(2.8, 0.02, 0.1, 0.005, '#7f8691', 0, 0.12 + i * 0.16, 0, g);
    rbox(3.0, 0.3, 0.2, 0.04, '#3a3f4a', 0, 2.4, 0, g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), new THREE.MeshBasicMaterial({ map: canvasTex(360, 168, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 360, 168);
      c.strokeStyle = '#e2463c'; c.lineWidth = 10; c.strokeRect(6, 6, 348, 156); c.fillStyle = '#e2463c'; c.font = 'bold 92px sans-serif'; c.textAlign = 'center'; c.fillText('閉店', 180, 118); }) }));
    m.position.set(-0.6, 1.45, 0.06); m.rotation.z = 0.06; g.add(m); reg('shutter', g); }
  // tear drops for the shopkeeper
  { const g = G(); for (const sx of [-1, 1]) sph(0.035, M('#7fd3ff', 0.2), sx * 0.2, 0, 0, g, 0.8, 1.3, 0.8); reg('tears', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, who = 'hero') => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz);
  s[who].userData.reach(side, p.clone().add(V(side === 'R' ? 0.08 : -0.08, -0.05, -0.02))); return o; };
const tagAt = (s, name, x, y, z, lt = 0, sc = 1) => { const t = s.P[name]; t.visible = true; t.position.set(x, y, z); t.rotation.set(0, 0, Math.sin(lt * 3) * 0.04); t.scale.setScalar(sc); return t; };
const shop = (s, x = 0.75, z = -0.55) => { place(s.P.counter, x, z); const r = s.P.reji; r.visible = true; r.position.set(x + 0.55, 0.93, z); return r; };
function pyramid(s, x, z, y0, sc, drop = 1) { const o = s.P.onigiri; o.visible = true; o.position.set(x, y0 + 3.0 * (1 - drop * drop), z); o.scale.setScalar(sc); return o; }
// badge slams in from big to normal at t0
function slam(s, name, lt, t0, x, y, z, sc = 1.6) { const u = ease(k(lt, t0, t0 + 0.22)); const b = s.P[name]; b.visible = lt >= t0; b.position.set(x, y, z);
  b.scale.setScalar(sc * (1 + 1.4 * (1 - u))); b.rotation.set(0, 0, -0.2 + 0.08 * Math.sin(lt * 4)); return b; }
// bills spray out of the register and rain around the hero
function spray(s, lt, t0, x0, z0, dur = 2.4) { const g = s.P.cash; g.visible = lt > t0; g.userData.items.forEach((b, i) => {
  const u = clamp((lt - t0 - (i % 6) * 0.05) / dur); const a = i * 2.39, sp = 0.6 + (i % 4) * 0.3;
  b.visible = u > 0; b.position.set(x0 + Math.cos(a) * sp * u * 2.0 - 0.6 * u, 0.95 + 3.2 * u - 3.6 * u * u + 0.4 * Math.sin(i), z0 + 1.0 * u + Math.sin(a) * 0.4 * u);
  if (b.position.y < 0.05) b.position.y = 0.05; b.rotation.set(lt * (3 + i % 3), lt * 2 + i, i); }); }
// cold open / recall: "160%引き" badge slams, the register sprays bills, onigiri pyramid drops on the counter
function payday(s, lt, t0) { const r = shop(s, 0.8, -0.6); slam(s, 'b160', lt, t0, 0.55, 2.05, -0.3, 2.0);
  r.userData.drawer.position.z = 0.05 + 0.2 * ease(k(lt, t0, t0 + 0.15)); spray(s, lt, t0 + 0.05, 1.35, -0.55);
  pyramid(s, 0.45, -0.5, 0.93, 1.1, ease(k(lt, t0 + 0.05, t0 + 0.35))); return lt >= t0; }

const plan = [
  // 0) cold open (flash-forward of #5): at the register "160%引き" slams, bills spray out at the hero -> push in, smug "…もう1個♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.2, 1.6, 6.8], p1: [-0.25, 1.42, 3.4], l0: [0.2, 1.5, -0.3], l1: [-0.25, 1.38, 0.4], hold: 1.1, dur: 2.2 },
    shake: [[0.15, 0.08, 0.6]], lines: [[0.12, 0.9]],
    sfx: [[0.0, 'whoosh_switch1', -12], [0.12, 'impact_doon', -9], [0.18, 'coin_toss', -10], [0.2, 'text_impact', -11], [0.5, 'coin_toss', -12], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -11]],
    stamps: [{ t: 0.15, text: '160%引き!!', x: 540, y: 400, rot: -6, color: YEL, size: 96, dur: 1.15 },
      { t: 2.3, text: '…もう1個♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 64, dur: 0.7 }],
    act(lt, s) { const on = payday(s, lt, 0.1); place(s.hero, -0.25, 0.45, 0.1); const h = s.hero.userData;
      hold(s, 'nig', 'R', V(0.05, 1.15, 0.8), 0); h.hand('R', 'gu');
      h.arm('L', on && lt < 1.3 ? 2.7 : 0.6, on && lt < 1.3 ? 0.7 : 0.3, 0.3); h.hand('L', 'pa');
      h.face(!on ? { lid: 0.2, brow: 0.3, look: [0.5, 0.2], mouth: 'smile' } : lt < 1.3 ? { lid: 0, brow: 0.9, browY: 1, look: [0.5, 0.6], mouth: 'o', open: 1 } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
      h.head.rotation.z = 0.1 * ease(k(lt, 1.9, 2.3)); } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#ff7a6b', '#fff0ec', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.6, 'comic_surprise', -12]],
    stamps: [{ t: 2.6, text: '毎日2倍!?', x: 800, y: 1080, rot: 8, color: RED, size: 74, dur: 1.0 }],
    act(lt, s) { shop(s, 0.75, -0.7); tagAt(s, 't160', 0.55, 1.75, -0.45, lt); const h = s.hero.userData; place(s.hero, -0.3, 0.35, 0.1);
      hold(s, 'nig', 'R', V(0.0, 1.2 + 0.03 * Math.sin(lt * 4), 0.7), 0); h.hand('R', 'gu'); h.arm('L', 0.3, 0.5, 0.4); h.hand('L', 'pa');
      h.face(lt < 2.6 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 2) day 1: 5% off -> onigiri 152 yen
  { sc: 'st', say: ['d1'], pre: 0.12, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [], hud: ['1日目', '5%引き'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.6], l0: [0.15, 1.3, 0] },
    sfx: [[1.0, 'whoosh_switch2', -13], [1.1, 'text_pa', -10], [3.2, 'text_pa', -10], [3.3, 'comic_pico', -13]],
    tags(lt) { return lt > 0.4 ? [{ t: 0.4, text: 'ふつう 160円', x: 300, y: 1560, h: 80, bg: '#ffffff' }].concat(lt > 3.2 ? [{ t: 3.2, text: '1日目 152円', x: 770, y: 1560, h: 104, bg: YEL }] : []) : []; },
    note: 'おにぎり1個160円と仮定（試算）',
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.2); slam(s, 'b5', lt, 1.0, 0.75, 1.95, -0.2, 1.3);
      tagAt(s, lt < 3.2 ? 't160' : 't152', 0.65, 1.35, -0.1, lt, 1.2);
      hold(s, 'nig', 'L', V(-0.75, 1.15, 0.6), 0); h.hand('L', 'gu'); h.reach('R', V(0.3, 1.4, 0.2)); h.hand('R', 'choki');
      h.face(lt < 3.2 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.3], mouth: 'smile' } : { lid: 0.5, brow: 0.6, look: [0.6, 0.2], mouth: 'smile' }); } },
  // 3) day 3: 20% off -> average budget buys 28,600 yen of goods
  { sc: 'st', say: ['d3'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#ffd23a'], show: [], hud: ['3日目', '20%引き'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 5.4], p1: [0.05, 1.45, 4.9], l0: [0.1, 1.3, 0] },
    sfx: [[0.9, 'whoosh_switch2', -13], [2.2, 'text_pa', -10], [3.4, 'text_pa', -10], [3.5, 'coin_toss', -13]],
    cards(lt) { return lt > 2.2 ? [{ t: lt < 3.4 ? 2.2 : 3.4, text: lt < 3.4 ? '平均予算 [2万2,882円]' : '[2万8,600円]分 買える', y: 480, size: 66, border: CY, sub: lt < 3.4 ? 'くふう総研 2025年調査' : '2万2,882円÷0.8（試算）' }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.55, 0.3, 0.3); slam(s, 'b20', lt, 1.0, -0.95, 2.05, -0.3, 1.1);
      const c = s.P.cart; place(c, 0.35, 0.25, 0.2); c.position.x = 0.35 + 0.08 * Math.sin(lt * 2);
      h.reach('R', V(c.position.x - 0.41, 0.92, 0.33)); h.hand('R', 'gu');
      h.arm('L', lt > 3.4 ? 2.6 : 0.4, 0.6, 0.3); h.hand('L', 'pa');
      h.face(lt < 3.4 ? { lid: 0.2, brow: 0.3, look: [0.5, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0.3, 0.4], mouth: 'o', open: 0.9 }); } },
  // 4) day 5: 80% off -> onigiri 32 yen, 5 carts
  { sc: 'st', say: ['d5'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['5日目', '80%引き'], hudColor: YEL,
    cam: { p0: [0.0, 1.75, 6.4], p1: [0.0, 1.65, 5.9], l0: [0.0, 1.2, -0.3] },
    sfx: [[1.1, 'whoosh_switch2', -13], [3.7, 'text_pa', -10], [4.9, 'comic_boyon', -12], [5.3, 'text_pa', -10]],
    tags(lt) { return (lt > 3.7 ? [{ t: 3.7, text: 'おにぎり 32円', x: 300, y: 1560, h: 92, bg: YEL }] : []).concat(lt > 5.2 ? [{ t: 5.2, text: 'カート 5台', x: 780, y: 1560, h: 104, bg: '#ffffff' }] : []); },
    note: '予算で11万4千円分＝ふつうの5倍（試算）',
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.55, 0.6, 0.15); slam(s, 'b80', lt, 1.2, 0.95, 2.3, -0.6, 1.2);
      const cs = s.P.carts; cs.visible = true; cs.position.x = 0.45; const n = lt < 4.9 ? 1 : Math.min(5, 1 + Math.floor((lt - 4.9) * 10)); cs.userData.items.forEach((c, i) => { c.visible = [2, 1, 3, 0, 4].indexOf(i) < n; });
      hold(s, 'nig', 'R', V(-0.2, 1.2, 0.95), 0); h.hand('R', 'gu'); h.arm('L', lt > 4.9 ? 2.6 : 0.4, 0.7, 0.3); h.hand('L', 'pa');
      h.face(lt < 3.7 ? { lid: 0.2, brow: 0.3, look: [0.2, 0.3], mouth: 'smile' } : lt < 4.9 ? { lid: 0.4, brow: 0.6, look: [0.3, 0.1], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.4], mouth: 'o', open: 1 }); } },
  // 5) day 6: 160% off -> buying pays you 96 yen (recall of the cold open)
  { sc: 'st', say: ['d6'], pre: 0.12, pal: HOOK, show: [], hud: ['6日目', '160%引き'], hudColor: YEL,
    cam: { p0: [0.2, 1.6, 6.6], p1: [0.1, 1.5, 5.6], l0: [0.2, 1.45, -0.3] },
    shake: [[1.1, 0.06, 0.5]], lines: [[1.05, 0.7]],
    sfx: [[0.95, 'whoosh_switch1', -12], [1.1, 'impact_doon', -11], [1.15, 'coin_toss', -11], [3.2, 'text_pa', -10], [3.4, 'coin_toss', -13]],
    cards(lt) { return lt > 3.2 ? [{ t: 3.2, text: '買うと [96円] もらえる', y: 480, size: 66, border: YEL, sub: '160円×(1−1.6)＝−96円（試算）' }] : []; },
    act(lt, s) { const on = payday(s, lt, 1.1); place(s.hero, -0.25, 0.45, 0.1); const h = s.hero.userData;
      hold(s, 'nig', 'R', V(0.05, 1.15, 0.8), 0); h.hand('R', 'gu'); if (lt > 3.2) tagAt(s, 'tm96', 0.05, 1.42, 0.85, lt, 0.7);
      h.arm('L', on ? 2.7 : 0.4, 0.7, 0.3); h.hand('L', 'pa');
      h.face(!on ? { lid: 0.2, brow: 0.3, look: [0.5, 0.2], mouth: 'smile' } : lt < 3.2 ? { lid: 0, brow: 0.9, browY: 1, look: [0.5, 0.6], mouth: 'o', open: 1 } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' }); } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.32, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); hold(s, 'nig', 'R', V(0.4, 1.0, 0.5), 0); h.hand('R', 'gu'); h.arm('L', 0.6, 0.2, 1.8); h.hand('L', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 7) the shop loses money: 1.7 trillion yen a day across Japan
  { sc: 'st', say: ['loss'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#ff5a4f'], show: [], hero2: true, hud: ['お店', '赤字'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.0], p1: [0.0, 1.55, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'coin_toss', -12], [0.4, 'text_pa', -10], [1.7, 'comic_shock2', -12], [2.2, 'text_pa', -10]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: lt < 2.1 ? 'お店は 売るほど [赤字]' : '1日 [1.7兆円] の赤字', y: 480, size: 64, border: RED, sub: lt < 2.1 ? '160%引き＝1個売るたび損' : '2万2,882円×0.6×1億2,321万人（試算）' }] : []; },
    act(lt, s) { const r = shop(s, 0.55, -0.6); r.userData.drawer.position.z = 0.25; spray(s, (lt % 2.4), 0.0, 1.1, -0.6, 2.2);
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero2, 0.55, -1.25); h2.reach('L', V(0.95, 1.05, -0.65)); h2.arm('R', 2.2, 0.6, 1.2); h2.hand('R', 'pa');
      const tr = s.P.tears; tr.visible = true; tr.position.set(0.55, 1.32 - (lt * 0.4 % 0.2), -0.85);
      h2.face({ lid: 0.1, brow: -1, browY: 1, look: [0.2, 0.1], mouth: 'o', open: 0.8 });
      place(s.hero, -0.75, 0.35, 0.3); hold(s, 'nig', 'R', V(-0.4, 1.15, 0.7), 0); h.hand('R', 'gu'); h.arm('L', 0.6, 0.2, 1.6); h.hand('L', 'pa');
      h.face(lt < 1.7 ? { lid: 0.3, brow: 0.3, look: [0.7, 0], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0.7, 0.1], mouth: 'o', open: 0.7 }); } },
  // 8) home buried in 23 cardboard boxes
  { sc: 'st', say: ['box'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: [], hud: ['段ボール', '23箱'], hudColor: RED,
    cam: { p0: [0.0, 1.7, 6.2], p1: [0.0, 1.6, 5.8], l0: [0.0, 1.25, -0.3] },
    sfx: [[0.3, 'comic_fall', -13], [0.6, 'text_pa', -10], [1.6, 'giant_step', -14], [2.1, 'comic_stupid', -12]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '段ボール [23箱]', y: 480, size: 74, border: RED, sub: '11万4千円分÷1箱5千円（試算）' }] : []; },
    act(lt, s) { const bx = s.P.boxes; bx.visible = true; const n = Math.floor(23 * ease(k(lt, 0.2, 1.8)));
      bx.userData.items.forEach((b, i) => { b.visible = i < n; });
      const h = s.hero.userData; place(s.hero, 0.0, 0.5); h.arm('L', 2.2, 1.0, 0.4); h.arm('R', 2.2, 1.0, 0.4); h.hand('L', 'pa'); h.hand('R', 'pa');
      s.hero.scale.set(1.08, 0.94, 1);
      h.face(lt < 1.6 ? { lid: 0.1, brow: -0.6, browY: 1, look: [0, 0.5], mouth: 'o', open: 0.6 } : { lid: 0.5, brow: -1, browY: 1, look: [0, 0], mouth: 'flat' }); } },
  // 9) day 7: 320% off -> every shop closes
  { sc: 'st', say: ['close'], pre: 0.12, pal: ['#8a93a6', '#e6e9ef', '#7b3fe4'], show: [], hud: ['7日目', '320%引き'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.2], p1: [0.0, 1.55, 5.7], l0: [0.0, 1.3, -0.3] },
    sfx: [[0.9, 'whoosh_switch2', -13], [1.0, 'text_pa', -10], [3.4, 'collapse', -14], [3.6, 'text_pa', -10], [4.2, 'comic_stupid', -12]],
    cards(lt) { return lt > 1.0 ? [{ t: lt < 3.6 ? 1.0 : 3.6, text: lt < 3.6 ? '[320%]引き' : 'お店は [全部閉店]', y: 480, size: 74, border: RED, sub: lt < 3.6 ? '1,000円の物で2,200円もらえる（試算）' : '売るたびに損するから' }] : []; },
    act(lt, s) { const sh = s.P.shutter; sh.visible = true; sh.position.set(0, 2.4 * (1 - ease(k(lt, 3.3, 3.7))), -1.2);
      if (lt < 3.3) { shop(s, 0.4, -0.7); } slam(s, 'b320', lt, 1.0, 0.75, 1.95, -0.9, 1.1);
      const h = s.hero.userData; place(s.hero, -0.3, 0.4, 0.15); const c = s.P.cart; place(c, 0.55, 0.35, 0.2);
      h.reach('R', V(0.06, 0.92, 0.45)); h.hand('R', 'gu'); h.arm('L', lt > 3.6 ? 0.7 : 0.4, 0.3, lt > 3.6 ? 1.8 : 0.3); h.hand('L', 'pa');
      h.face(lt < 3.6 ? { lid: 0.2, brow: 0.5, look: [0.6, 0.3], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 }); } },
  // 10) good news / bad news: shopping is less than free / no shops left
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#7fa8ff', '#eaf0ff', '#35d0ff'], show: [], hud: ['いい・悪い', 'ニュース'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.0, 1.3, 0] },
    sfx: [[1.9, 'text_pa', -10], [2.0, 'sparkle', -14], [3.7, 'text_pa', -10], [4.0, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.7 ? (lt > 1.0 ? [{ t: 1.0, text: '買い物は [タダ以下]', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.7, text: '[お店]がない', y: 480, size: 80, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.9, text: 'ガーン…', x: 760, y: 1140, rot: 6, color: RED, size: 72, dur: 1.0 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.3);
      if (lt < 2.7) { spray(s, lt % 2.7, 0.0, 0.0, -0.2, 2.0); h.arm('R', 2.5, 0.7, 0.2); h.arm('L', 2.5, 0.7, 0.2); h.hand('R', 'pa'); h.hand('L', 'pa');
        h.face({ lid: 0.5, brow: 0.7, look: [0, 0.3], mouth: 'smile' }); return; }
      const sh = s.P.shutter; sh.visible = true; sh.position.set(-0.55, 0, -1.0);
      h.body.rotation.x = 0.25 * ease(k(lt, 2.7, 3.2)); hold(s, 'nig', 'R', V(0.38, 0.95, 0.55), 0); h.hand('R', 'gu'); h.arm('L', 0.2, 0.2, 0.1);
      h.face({ lid: 0.7, brow: -1, browY: 1, look: [0, -0.3], mouth: 'o', open: 0.4 }); } },
  // 11) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: 'ふつうでいい', x: 770, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1430, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1530, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.3); hold(s, 'nig', 'R', V(0.32, 1.1, 0.6), 0); h.hand('R', 'gu'); h.arm('L', 1.0, 0.6, 0.6); h.hand('L', 'pa');
      slam(s, 'b160', lt, 0.0, -0.75, 1.9, -0.4, 0.9);
      h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもブラックフライデーの', '値引きが[毎日2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['ブラックフライデー', '毎日2倍'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
