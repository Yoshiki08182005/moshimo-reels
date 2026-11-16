// ep34_bukka_1p (pop / arm A): もしも物価が毎日1%ずつ上がったら？
// 型は sp_geppu2x / ep33。台本・数字・小道具は自作。
// 前提（試算）: 値段 = 150円 × 1.01^日数（毎日1%の複利）
//   100日 405円 / 365日 1.01^365 = 37.8倍 → 5,668円 ≒ 5,670円 / 1460日(4年) 2,038,007倍 → 3.06億円
//   1万円札1枚0.1mm → 30,570枚 = 3.06m / 月給34万600円（厚労省 令和7年賃金構造基本統計調査）÷ 5,668円 = 60個（いま2,270個）
//   貯金100万円 ÷ 37.8 = 26,467円分 / お年玉1万円 ÷ 5,668円 = 1.76個
//   現実：生鮮食品を除く食料 前年同月比 +3.0%（総務省 消費者物価指数 2026年7月）
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep34_bukka_1p.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#ff8a3d', '#fff0e2', '#ffd23a'], MAIN = ['#4fc38a', '#e6f8ee', '#ffd23a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // single onigiri (held in a hand)
  { const o = G(); sph(0.11, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.13, 0.11, 0.16, 0.02, '#20301f', 0, -0.045, 0, o); reg('oni1', o); }
  // price POP signs on a stand (one per price)
  const sign = (name, top, price, col) => {
    const s = G(); cyl(0.02, 0.02, 1.0, '#9aa3ad', 0, 0.5, 0, s); cyl(0.16, 0.18, 0.04, '#9aa3ad', 0, 0.02, 0, s);
    rbox(0.74, 0.46, 0.04, 0.03, col, 0, 1.22, 0, s);
    const fm = label(512, 300, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 512, 300); c.fillStyle = col; c.fillRect(0, 0, 512, 92); c.fillStyle = '#ffffff'; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(top, 256, 48);
      c.fillStyle = '#22252d'; let fs = 120; c.font = `bold ${fs}px sans-serif`; while (c.measureText(price).width > 480) { fs -= 6; c.font = `bold ${fs}px sans-serif`; } c.fillText(price, 256, 200); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.4), fm); f.position.set(0, 1.22, 0.022); s.add(f); reg(name, s); };
  sign('tag150', 'おにぎり', '150円', '#3fae5b');
  sign('tag405', '100日後', '405円', '#f08a24');
  sign('tag5670', '1年後', '5,670円', '#e2463c');
  sign('tag3oku', '4年後', '3億円', '#b0262a');
  // bundles of banknotes: 30 bundles x 0.1 m = 3 m tower
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < 30; i++) { const b = G(); rbox(0.36, 0.095, 0.18, 0.012, '#5fae6b', 0, 0, 0, b); rbox(0.06, 0.1, 0.185, 0.008, '#f3efe2', 0, 0, 0, b); g.add(b); g.userData.items.push(b); }
    reg('stack', g); }
  // tear-off calendar (+1% every day)
  { const c = G(); rbox(0.56, 0.7, 0.04, 0.02, '#2c3b6b', 0, 0, -0.02, c); c.userData.items = [];
    const fm = label(256, 300, (x) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 300); x.fillStyle = '#e2463c'; x.fillRect(0, 0, 256, 70); x.fillStyle = '#ffffff'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('値上げ', 128, 36); x.fillStyle = '#22252d'; x.font = 'bold 96px sans-serif'; x.fillText('+1%', 128, 180); });
    for (let i = 0; i < 14; i++) { const s = G(); const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), fm); pl.position.y = -0.02; s.add(pl); s.position.z = 0.01 + i * 0.004; c.add(s); c.userData.items.push(s); }
    reg('cal', c); }
  // otoshidama envelope
  { const e = G(); rbox(0.17, 0.26, 0.012, 0.01, '#e2463c', 0, 0, 0, e);
    const fm = label(128, 200, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 200); c.fillStyle = '#e2463c'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('お', 64, 50); c.fillText('年', 64, 100); c.fillText('玉', 64, 150); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.2), fm); f.position.z = 0.008; e.add(f); reg('otoshi', e); }
}

// money tower at x=bx: drops from the sky (lands at t0), wobbles, then topples and scatters (u 0..1)
const PR = (() => { const r = rng(7), a = []; for (let i = 0; i < 30; i++) a.push([r() * 2 - 1, r(), r() * 2 - 1, r() * 6, r() * 6]); return a; })();
function moneyTower(s, bx, lt, t0, tFall) {
  const st = s.P.stack; st.visible = true; st.position.set(bx, 0, -0.1); st.rotation.set(0, 0, 0);
  const drop = lt < t0 ? lerp(4.5, 0, k(lt, t0 - 0.28, t0) ** 2) : 0;
  const wob = lt > t0 && lt < tFall ? Math.sin((lt - t0) * 22) * 0.05 * (1 - k(lt, t0, tFall)) : 0;
  const u = ease(k(lt, tFall, tFall + 0.8));
  st.userData.items.forEach((it, i) => {
    const y0 = 0.05 + i * 0.1 + drop;
    if (u <= 0) { it.position.set(Math.sin(i * 2.3) * 0.012 + wob * i * 0.1, y0, Math.cos(i * 1.7) * 0.012); it.rotation.set(0, Math.sin(i) * 0.08, wob * 0.3); return; }
    const d = clamp(u * 1.4 - (i / 30) * 0.4), e = ease(d), tx = 0.35 + PR[i][0] * 0.7 + i * 0.02, tz = 0.2 + PR[i][2] * 0.45;
    it.position.set(lerp(0, tx, e), lerp(y0, 0.05 + (i % 3) * 0.1, e) + Math.sin(e * Math.PI) * 0.3 * PR[i][1], lerp(0, tz, e));
    it.rotation.set(PR[i][3] * e * 0.3, PR[i][4] * e * 0.4, -e * 1.4 * (0.5 + PR[i][1]));
  });
}
const holdOni = (s, side, p) => { const o = s.P.oni1; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.08, -0.03))); };
const signAt = (s, name, x, z = -0.2, ry = 0.15) => { const g = s.P[name]; g.visible = true; g.position.set(x, 0, z); g.rotation.set(0, ry, 0); return g; };

const plan = [
  // 0) cold open (flash-forward of #5): a 3 m tower of cash slams down next to the onigiri price sign, topples; push in, proud face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.2, 1.7, 7.0], p1: [-0.45, 1.42, 2.7], l0: [0.2, 1.5, 0], l1: [-0.45, 1.38, 0.2], hold: 1.5, dur: 2.3 },
    shake: [[0.25, 0.08, 0.7]], lines: [[0.25, 0.9]],
    sfx: [[0.22, 'impact_doon', -8], [0.28, 'shock', -12], [0.6, 'collapse', -10], [0.65, 'whoosh_gust', -13], [1.6, 'whoosh_slide', -13], [2.35, 'comic_stupid', -10]],
    stamps: [{ t: 0.25, text: 'ドーン!!', x: 640, y: 1130, rot: 8, color: YEL, size: 116, dur: 1.1 },
      { t: 2.35, text: 'おにぎり1個です', x: 330, y: 1160, rot: -6, color: '#ffffff', size: 62, dur: 0.65 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.25); s.hero.rotation.y = 0.3 * (1 - ease(k(lt, 1.6, 2.1)));
      signAt(s, 'tag3oku', 0.15, -0.5, 0.1); moneyTower(s, 0.75, lt, 0.25, 0.6);
      if (lt < 1.6) { holdOni(s, 'R', V(-0.15, 1.3, 0.55)); h.arm('L', 0.4, 0.9, 1.2); h.face(lt < 0.25 ? { lid: 0.1, look: [0.8, 0.3], mouth: 'smile' } : { lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.4], mouth: 'o', open: 1.1 }); }
      else { holdOni(s, 'R', V(0.0, 1.12, 0.6)); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 2.2, 2.5)); }
    } },
  // 1) title: onigiri 150 yen today
  { sc: 'st', say: ['hook'], pal: MAIN, show: [],
    cam: { p0: [0.0, 1.4, 4.8], p1: [0.0, 1.38, 4.5], l0: [0.0, 1.15, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.0, 'comic_pico', -13], [2.2, 'coin_toss', -12]],
    tags: [{ t: 1.0, text: 'いまは150円', x: 700, y: 1000, h: 84, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.25); s.hero.rotation.y = 0.3; signAt(s, 'tag150', 0.55, -0.2, -0.15);
      holdOni(s, 'R', V(-0.12, 1.25 + Math.abs(Math.sin(lt * 4)) * 0.04, 0.55)); h.arm('L', 0.2, 2.5, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.2, brow: 0.4, mouth: 'smile', look: [0.5, 0.2] });
    } },
  // 2) real: food +3% a year vs you: +1% a day
  { sc: 'st', say: ['real'], pre: 0.2, hold: 0.2, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: [], hud: ['物価', '毎日+1%'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.43, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.9, 'text_pa', -11], [3.6, 'comic_surprise', -13]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'いま 1年で+3%', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > this.lt.real + 2.8 ? [{ t: this.lt.real + 2.8, text: 'あなた 毎日+1%', x: p1[0], y: p1[1], h: 84, bg: CY }] : [])]; },
    note: '食料(生鮮除く) +3.0%（総務省CPI 2026年7月）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.62, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.62, 0, 0.2); s.hero.rotation.y = 0.3;
      h2.arm('L', 0.3, 0.6, 1.5); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.3, brow: 0.2, mouth: 'smile', look: [-0.4, 0] });
      holdOni(s, 'R', V(-0.45, 1.25, 0.5)); h.arm('L', 0.1, 0.3, 0.2);
      h.face(lt < 3.0 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.5, 0] } : { lid: 0, brow: -0.8, browY: 1, mouth: 'o', open: 1, look: [0, 0] });
    } },
  // 3) day 100: calendar pages fly, 405 yen
  { sc: 'st', say: ['d100'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['cal'], hud: ['100日後', '×2.7'], hudColor: YEL,
    cam: { p0: [-0.05, 1.45, 4.9], p1: [-0.05, 1.43, 4.6], l0: [-0.05, 1.2, 0] },
    sfx: [[0.3, 'whoosh_switch2', -13], [0.9, 'whoosh_switch1', -14], [2.4, 'text_pa', -10]],
    cards(lt) { return lt > 2.3 ? [{ t: 2.3, text: '150円 → [405円]', y: 480, size: 66, border: YEL, sub: '150円×1.01の100乗（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.cal; c.position.set(0.15, 2.0, -0.8);
      c.userData.items.forEach((p, i) => { const j = 13 - i, f = Math.max(0, lt - 0.3 - j * 0.13); p.visible = f < 1.2; p.position.set(f * 0.9, -f * f * 0.9 + f * 0.6, 0.01 + i * 0.004 + f * 0.4); p.rotation.set(-f * 2, 0, -f * 3); });
      signAt(s, 'tag405', 0.6, -0.1, -0.2);
      const h = s.hero.userData; s.hero.position.set(-0.6, 0, 0.3); s.hero.rotation.y = 0.35;
      holdOni(s, 'L', V(-0.95, 1.2, 0.6)); h.reach('R', V(0.3, 1.25, 0.0)); h.hand('R', 'pa');
      h.face(lt < 2.3 ? { lid: 0.1, look: [0.8, 0.2], mouth: 'o', open: 0.6 } : { lid: 0, brow: -0.6, browY: 1, look: [0.7, 0], mouth: 'o', open: 1 });
    } },
  // 4) one year: 5,670 yen onigiri, hero holds it like a jewel
  { sc: 'st', say: ['d365'], pre: 0.15, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: [], hud: ['1年後', '×38'],
    cam: { p0: [0.0, 1.42, 4.8], p1: [0.0, 1.4, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'comic_jajean', -12], [1.8, 'text_pa', -10], [2.4, 'sparkle', -13]],
    cards: [{ t: 1.7, text: 'おにぎり1個 [5,670円]', y: 480, size: 62, border: CY }],
    stamps: [{ t: 2.4, text: 'たかっ!', x: 700, y: 1050, rot: 8, color: YEL, size: 96, dur: 1.0 }],
    act(lt, s) {
      signAt(s, 'tag5670', 0.6, -0.15, -0.2);
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.3); s.hero.rotation.y = 0.2;
      const a = ease(k(lt, 0.3, 1.2)); holdOni(s, 'R', V(0.12, lerp(1.0, 1.3, a), 0.6)); h.reach('L', V(-0.1, lerp(0.95, 1.22, a), 0.65)); h.hand('L', 'pa');
      h.face(lt < 1.6 ? { lid: 0, brow: 0.3, look: [0.3, 0.6], mouth: 'o', open: 0.7 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 5) 4 years: 300 million yen, a 3 m tower of cash (the cold open, in its place)
  { sc: 'st', say: ['d1460'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['4年後', '×200万'], hudColor: RED,
    cam: { p0: [0.2, 1.75, 7.2], p1: [0.2, 1.7, 6.8], l0: [0.2, 1.55, 0] },
    shake: [[0.9, 0.06, 0.5]],
    sfx: [[0.85, 'impact_doon', -9], [0.9, 'shock', -13], [2.6, 'text_pa', -10], [4.6, 'collapse', -11]],
    stamps: [{ t: 0.9, text: 'ドーン!', x: 640, y: 1130, rot: 8, color: YEL, size: 100, dur: 0.8 }],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '1個 [3億円]', y: 480, size: 70, border: RED }] : []; },
    tags(lt) { const t0 = this.lt.d1460 + 2.6; if (lt < t0) return []; const p = scr(S, V(0.75, 2.6, -0.1), 120, 0); return [{ t: t0, text: '札束 高さ3m', x: p[0], y: p[1], h: 80, bg: YEL }]; },
    note: '1万円札1枚0.1mmで計算（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.25); s.hero.rotation.y = 0.3;
      signAt(s, 'tag3oku', 0.15, -0.5, 0.1); moneyTower(s, 0.75, lt, 0.9, 4.6);
      holdOni(s, 'R', V(-0.15, 1.3, 0.55));
      if (lt < 0.9) { h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.2, look: [0.6, 0.4], mouth: 'smile' }); }
      else { h.arm('L', 0.4, 0.9, 1.2); h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.6], mouth: 'o', open: 1.1 }); }
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) salary stays: 60 onigiri a month (now 2,270)
  { sc: 'st', say: ['pay'], pre: 0.15, pal: ['#e8574a', '#ffe3d6', '#ffd23a'], dim: 0.9, show: ['onigiri', 'bill'], hud: ['月給で', '60個'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.9], p1: [0.0, 1.4, 4.6], l0: [0.0, 1.1, 0] },
    sfx: [[0.3, 'comic_fall', -13], [2.2, 'text_pa', -10], [3.2, 'comic_shock2', -13]],
    tags: [{ t: 0.4, text: 'いま 2,270個', x: 640, y: 640, h: 74, bg: '#ffffff' }],
    cards(lt) { return lt > 2.1 ? [{ t: 2.1, text: '1年後 [60個]', y: 480, size: 68, border: RED }] : []; },
    note: '月給34万円（厚労省 2025年）・据え置き（試算）',
    act(lt, s) {
      const o = s.P.onigiri, n = Math.max(3, Math.round(23 * (1 - ease(k(lt, 0.6, 2.4))))); o.position.set(0.5, 0, 0.1); o.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.35;
      const b = s.P.bill, bp = V(-0.05, 1.0, 0.6); b.position.copy(bp); b.rotation.set(0, 0, 0.1); h.reach('R', bp.clone().add(V(0.08, -0.06, -0.03))); h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 2.0 ? { lid: 0.2, brow: 0.2, look: [0.8, -0.4], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.8, -0.4], mouth: 'o', open: 1 });
    } },
  // 8) savings 1 million -> worth 26,000 yen
  { sc: 'st', say: ['save'], pre: 0.15, pal: ['#9a8cff', '#f0eeff', '#ffffff'], dim: 0.9, show: ['coinsA', 'bag'], hud: ['貯金', '1/38'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.8], p1: [0.0, 1.4, 4.5], l0: [0.0, 1.12, 0] },
    sfx: [[0.5, 'coin_toss', -12], [1.2, 'coin_toss', -13], [1.9, 'coin_toss', -13], [2.6, 'text_pa', -10]],
    cards(lt) { return lt > 2.5 ? [{ t: 2.5, text: '100万円 → [2万6千円]分', y: 480, size: 58, border: RED, sub: '100万円 ÷ 37.8（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.coinsA, n = Math.max(1, Math.round(32 * (1 - ease(k(lt, 0.4, 2.6))))); c.position.set(0.45, 0, 0.15);
      c.visible = true; c.userData.items.forEach((it, i) => { it.visible = i < n; it.position.set(Math.sin(i * 2.1) * 0.008, 0.013 + i * 0.028, Math.cos(i * 1.3) * 0.008); it.rotation.set(0, 0, 0); });
      const bg = s.P.bag; bg.position.set(0.85, 0, -0.1);
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.35; h.reach('R', V(0.3, 1.0, 0.25)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.3, 1.8);
      h.face(lt < 2.4 ? { lid: 0.1, brow: -0.4, browY: 1, look: [0.8, -0.4], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 9) good news / bad news
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: [],
    cam: { p0: [0.1, 1.48, 4.5], p1: [0.1, 1.46, 4.2], l0: [0.05, 1.3, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', '物も×38'] : ['悪いニュース', 'お年玉']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 2.4, 'comic_fall', -13]],
    tags(lt) { const a = this.lt.bad; return lt < a ? [{ t: 1.6, text: '売れば 38倍', x: 520, y: 560, h: 80, bg: YEL }] : [{ t: a + 1.6, text: '1万円 → おにぎり1.76個', x: 520, y: 560, h: 74, bg: '#ffffff' }]; },
    note: '1万円 ÷ 5,670円（試算）',
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad; s.hero.position.set(-0.2, 0, 0.2); s.hero.rotation.y = 0.15;
      s.P.otoshi.visible = late; s.P.oni1.visible = false;
      if (!late) { holdOni(s, 'R', V(0.12, 1.8, 0.45)); h.arm('L', 0.1, 2.5, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.3, brow: 0.6, mouth: 'smile', look: [0.4, 0.4] }); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.05; }
      else { const ep = V(0.12, 1.2, 0.55); const e = s.P.otoshi; e.position.copy(ep); e.rotation.set(0, 0, 0.1); h.reach('R', ep.clone().add(V(0.08, -0.08, -0.02)));
        holdOni(s, 'L', V(-0.55, 1.15, 0.5));
        h.face(lt < sh.lt.bad + 1.5 ? { lid: 0.3, brow: 0.3, look: [0.4, -0.3], mouth: 'smile' } : { lid: 0.1, brow: -1, browY: 1, look: [-0.6, -0.3], mouth: 'o', open: 1 }); }
    } },
  // 10) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['coinsB'],
    cam: { p0: [0.05, 1.4, 4.8], p1: [0.05, 1.4, 4.6], l0: [0, 1.22, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'すぐ使う', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'ためる', x: 680, y: 520, h: 110, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 510, y: 670, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 510, y: 1440, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.2); s.hero.rotation.y = -0.05;
      const c = s.P.coinsB; c.position.set(0.7, 0, 0.1); c.visible = true; c.userData.items.forEach((it, i) => { it.visible = i < 12; it.position.set(Math.sin(i * 2.1) * 0.008, 0.013 + i * 0.028, Math.cos(i * 1.3) * 0.008); it.rotation.set(0, 0, 0); });
      holdOni(s, 'R', V(-0.3, 1.2, 0.5)); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.2, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも物価が', '毎日[1%]上がったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['物価', '毎日+1%'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
