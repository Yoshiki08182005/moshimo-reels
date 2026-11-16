// ep35_loss_okane (pop / arm B): もしも捨てた食べ物がお金に戻ったら？
// 型は sp_geppu2x / ep34。台本・数字・小道具は自作。
// 前提（試算）: 食品ロス 464万t（2023年度、農水省・環境省・消費者庁 2025年公表）、1人あたり年37kg
//   37kg ÷ 365 = 101g/日 ≒ おにぎり1個（約100g）
//   経済損失 年約4兆円・1人あたり年3万1,814円（消費者庁ほか）→ ÷365 = 87円/日
//   4兆円 ÷ 365 = 110億円/日 → 1万円札 110万枚 × 0.1mm = 110m / 1年 4億枚 × 0.1mm = 40km
//   CO2 年1,050万t・1人84kg（同）→ 84kg ÷ 1.83kg/m3（20℃）= 46m3 ≒ お風呂(200L) 230杯
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep35_loss_okane.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#ffb347', '#fff3df', '#ffd23a'], MAIN = ['#4fc38a', '#e6f8ee', '#ffd23a'];
const BIN = [0.55, 0, 0.15], BIN_TOP = 0.78;

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // single onigiri
  { const o = G(); sph(0.11, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.13, 0.11, 0.16, 0.02, '#20301f', 0, -0.045, 0, o); reg('oni1', o); }
  // trash bin with a lid that can pop off
  { const b = G(); cyl(0.3, 0.25, 0.74, '#4f86c6', 0, 0.37, 0, b); cyl(0.315, 0.315, 0.05, '#3a6aa3', 0, 0.72, 0, b);
    rbox(0.2, 0.2, 0.01, 0.02, '#ffffff', 0, 0.42, 0.29, b);
    const fm = label(128, 128, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#3a6aa3'; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ごみ', 64, 66); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), fm); f.position.set(0, 0.42, 0.297); b.add(f);
    const lid = G(); cyl(0.33, 0.33, 0.05, '#3a6aa3', 0, 0, 0, lid); sph(0.06, '#2c5487', 0, 0.05, 0, lid, 1, 0.6, 1); lid.position.y = 0.78; b.add(lid); b.userData.lid = lid;
    reg('bin', b); }
  // fountain coins
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < 70; i++) { const c = cyl(0.075, 0.075, 0.018, i % 5 ? '#f2c230' : '#d9dde3', 0, 0, 0, g); g.userData.items.push(c); }
    reg('coins', g); }
  // tower of banknote bundles
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < 70; i++) { const b = G(); rbox(0.36, 0.095, 0.18, 0.012, '#5fae6b', 0, 0, 0, b); rbox(0.06, 0.1, 0.185, 0.008, '#f3efe2', 0, 0, 0, b); g.add(b); g.userData.items.push(b); }
    reg('stack', g); }
  // CO2 balloons
  { const g = G(); g.userData.items = [];
    const fm = label(128, 128, (c) => { c.fillStyle = '#9aa1ab'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#ffffff'; c.font = 'bold 48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CO2', 64, 66); });
    for (let i = 0; i < 9; i++) { const b = G(); sph(0.17, '#9aa1ab', 0, 0, 0, b); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), fm); p.position.z = 0.172; b.add(p); g.add(b); g.userData.items.push(b); }
    reg('co2', g); }
  // price signs
  const sign = (name, top, price, col) => {
    const s = G(); cyl(0.02, 0.02, 1.0, '#9aa3ad', 0, 0.5, 0, s); cyl(0.16, 0.18, 0.04, '#9aa3ad', 0, 0.02, 0, s);
    rbox(0.74, 0.46, 0.04, 0.03, col, 0, 1.22, 0, s);
    const fm = label(512, 300, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 512, 300); c.fillStyle = col; c.fillRect(0, 0, 512, 92); c.fillStyle = '#ffffff'; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(top, 256, 48);
      c.fillStyle = '#22252d'; let fs = 120; c.font = `bold ${fs}px sans-serif`; while (c.measureText(price).width > 480) { fs -= 6; c.font = `bold ${fs}px sans-serif`; } c.fillText(price, 256, 200); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.4), fm); f.position.set(0, 1.22, 0.022); s.add(f); reg(name, s); };
  sign('tag87', '1日で', '87円', '#f08a24');
  sign('tag150', 'おにぎり', '150円', '#3fae5b');
  // empty plate
  { const p = G(); cyl(0.2, 0.15, 0.03, '#ffffff', 0, 0, 0, p); reg('plate', p); }
}

const binAt = (s, lidPop = 0) => { const b = s.P.bin; b.visible = true; b.position.set(...BIN); const l = b.userData.lid;
  l.position.set(lidPop * 0.7, 0.78 + Math.sin(Math.min(lidPop, 1) * Math.PI * 0.9) * 1.2 + lidPop * 0.2, -lidPop * 0.6); l.rotation.set(lidPop * 2.2, 0, -lidPop * 3); return b; };
// coin fountain out of the bin: starts at t0, vMax = launch speed (m/s), n coins
const CR = (() => { const r = rng(11), a = []; for (let i = 0; i < 70; i++) a.push([r(), r(), r(), r()]); return a; })();
function fountain(s, lt, t0, vMax, n = 70, P = 1.5) {
  const g = s.P.coins; g.visible = true; g.position.set(0, 0, 0);
  g.userData.items.forEach((c, i) => {
    const r = CR[i], off = (i / n) * P, u = lt - t0 - off;
    if (i >= n || u < 0) { c.visible = false; return; }
    const tau = u % P, v = vMax * (0.7 + 0.3 * r[0]), ang = r[1] * Math.PI * 2, sp = 0.6 + r[2] * 0.9;
    const y = BIN_TOP + v * tau - 4.9 * tau * tau;
    if (y < 0.01) { c.visible = false; return; }
    c.visible = true; c.position.set(BIN[0] + Math.cos(ang) * sp * tau, y, BIN[2] + Math.sin(ang) * sp * tau * 0.6);
    c.rotation.set(tau * 9 * r[3], tau * 4, tau * 7 * r[0]);
  });
}
// banknote tower rising from the floor (u 0..1 = height fraction of 70 bundles)
function tower(s, bx, u) { const st = s.P.stack; st.visible = true; st.position.set(bx, 0, -0.3);
  const n = Math.round(70 * u); st.userData.items.forEach((it, i) => { it.visible = i < n; it.position.set(Math.sin(i * 2.3) * 0.012, 0.05 + i * 0.1, Math.cos(i * 1.7) * 0.012); it.rotation.set(0, Math.sin(i) * 0.1, 0); }); }
const holdOni = (s, side, p) => { const o = s.P.oni1; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.08, -0.03))); };
const signAt = (s, name, x, z = -0.2, ry = 0.15, y = 0) => { const g = s.P[name]; g.visible = true; g.position.set(x, y, z); g.rotation.set(0, ry, 0); return g; };
const coinOnHead = (s, on) => { const c = s.P.coins.userData.items[69]; if (!on) return; c.visible = true; c.position.copy(headPos(s.hero).add(V(0.05, 0.45, 0.05))); c.rotation.set(0.25, 0, 0.3); };

const plan = [
  // 0) cold open (flash-forward of #5): toss the onigiri in the bin -> the lid blasts off and a geyser of coins shoots into the sky; push in, coin on head
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.1, 1.7, 6.2], p1: [-0.45, 1.42, 2.7], l0: [0.1, 1.5, 0], l1: [-0.45, 1.4, 0.2], hold: 1.5, dur: 2.3 },
    shake: [[0.28, 0.08, 0.8]], lines: [[0.28, 0.9]],
    sfx: [[0.0, 'whoosh_swing', -13], [0.26, 'impact_doon', -8], [0.3, 'coin_toss', -9], [0.55, 'coin_toss', -10], [0.8, 'coin_toss', -11], [1.6, 'whoosh_slide', -13], [2.35, 'comic_stupid', -10]],
    stamps: [{ t: 0.28, text: 'ジャラーン!!', x: 640, y: 1120, rot: 8, color: YEL, size: 112, dur: 1.1 },
      { t: 2.35, text: 'おつりです', x: 330, y: 1160, rot: -6, color: '#ffffff', size: 62, dur: 0.65 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.25); s.hero.rotation.y = 0.35 * (1 - ease(k(lt, 1.6, 2.1)));
      binAt(s, ease(k(lt, 0.26, 1.0)));
      if (lt < 0.26) { const u = lt / 0.26; const o = s.P.oni1; o.visible = true; o.position.set(lerp(-0.1, BIN[0], u), 1.25 + Math.sin(u * Math.PI) * 0.35 - u * 0.4, lerp(0.5, BIN[2], u)); o.rotation.set(u * 4, 0, u * 3); }
      fountain(s, lt, 0.26, 8.5);
      if (lt < 1.6) { h.arm('R', 0.9, 0.5, 0.2); h.hand('R', 'pa'); h.arm('L', 0.4, 0.9, 1.2);
        h.face(lt < 0.26 ? { lid: 0.2, look: [0.8, -0.2], mouth: 'flat' } : { lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.6], mouth: 'o', open: 1.1 }); }
      else { h.arm('L', 0.1, 0.3, 0.2); h.arm('R', 0.2, 2.4, 0.4); h.hand('R', 'pa'); h.face({ lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 2.2, 2.5)); coinOnHead(s, true); }
    } },
  // 1) title: hesitating over the bin with an onigiri
  { sc: 'st', say: ['hook'], pal: MAIN, show: [],
    cam: { p0: [0.05, 1.4, 4.8], p1: [0.05, 1.38, 4.5], l0: [0.05, 1.15, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.2, 'comic_pico', -13], [2.3, 'coin_toss', -12]],
    tags: [{ t: 1.2, text: '捨てる → お金？', x: 700, y: 1000, h: 84, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.25); s.hero.rotation.y = 0.35; binAt(s);
      holdOni(s, 'R', V(0.12, 1.15 + Math.abs(Math.sin(lt * 3)) * 0.04, 0.45)); h.arm('L', 0.2, 0.4, 2.0);
      h.face({ lid: 0.3, brow: -0.3, browY: 1, mouth: 'flat', look: [0.6, -0.3] });
    } },
  // 2) real: food loss per person per day = one onigiri
  { sc: 'st', say: ['real'], pre: 0.2, hold: 0.15, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: [], hud: ['食品ロス', '1人1日100g'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.43, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.6, 'text_pa', -11], [3.4, 'comic_surprise', -13]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.4, text: '1人1日 約100g', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > this.lt.real + 2.5 ? [{ t: this.lt.real + 2.5, text: '＝おにぎり1個', x: p1[0], y: p1[1], h: 84, bg: CY }] : [])]; },
    note: '食品ロス464万t（農水省・環境省 2023年度）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.62, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.62, 0, 0.2); s.hero.rotation.y = 0.3;
      h2.arm('L', 0.3, 0.6, 1.5); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.3, brow: -0.3, browY: 1, mouth: 'flat', look: [-0.4, 0] });
      holdOni(s, 'R', V(-0.4, 1.3 + ease(k(lt, 2.4, 2.8)) * 0.2, 0.5)); h.arm('L', 0.1, 0.3, 0.2);
      h.face(lt < 2.6 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.5, 0] } : { lid: 0, brow: -0.8, browY: 1, mouth: 'o', open: 1, look: [0, 0] });
    } },
  // 3) yen: 87 yen a day comes back out of the bin
  { sc: 'st', say: ['yen'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: [], hud: ['1日', '87円'], hudColor: YEL,
    cam: { p0: [0.05, 1.45, 4.9], p1: [0.05, 1.43, 4.6], l0: [0.05, 1.15, 0] },
    sfx: [[0.3, 'coin_toss', -11], [0.7, 'coin_toss', -13], [2.0, 'text_pa', -10], [2.4, 'sparkle', -14]],
    cards(lt) { return lt > 2.0 ? [{ t: 2.0, text: '1日[87円] → 年[3万2千円]', y: 480, size: 58, border: YEL, sub: '1人あたり年3万1,814円 ÷ 365（試算）' }] : []; },
    note: '経済損失 年約4兆円（消費者庁ほか 2023年度）',
    act(lt, s) {
      binAt(s, 0.15 * ease(k(lt, 0.2, 0.5))); fountain(s, lt, 0.25, 4.2, 18, 1.0);
      const h = s.hero.userData; s.hero.position.set(-0.55, 0, 0.3); s.hero.rotation.y = 0.35;
      h.reach('R', V(0.2, 1.2, 0.25)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.8, 1.4);
      h.face(lt < 1.9 ? { lid: 0.1, look: [0.8, 0.3], mouth: 'o', open: 0.6 } : { lid: 0.2, brow: 0.5, look: [0.4, 0], mouth: 'smile' });
    } },
  // 4) japan: 11 billion yen a day, a 110 m tower of bills
  { sc: 'st', say: ['japan'], pre: 0.15, pal: ['#5fb8ff', '#e6f4ff', '#ffffff'], show: [], hud: ['日本全体', '1日110億円'],
    cam: { p0: [0.1, 1.45, 5.2], p1: [0.1, 2.0, 5.6], l0: [0.1, 1.3, 0], l1: [0.1, 2.0, 0] },
    sfx: [[0.3, 'whoosh_gust', -12], [2.3, 'text_pa', -10], [2.6, 'comic_surprise', -13]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '日本で1日 [110億円]', y: 480, size: 62, border: CY }] : []; },
    tags(lt) { const t0 = this.lt.japan + 2.2; if (lt < t0) return []; const p = scr(S, V(0.55, 2.6, -0.3), 150, 0); return [{ t: t0, text: '札束 110m', x: p[0], y: p[1], h: 84, bg: YEL }]; },
    note: '1万円札1枚0.1mmで計算（試算）',
    act(lt, s) {
      tower(s, 0.55, ease(k(lt, 0.3, 3.0)));
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.3;
      h.arm('R', 0.5, 0.6, 0.3); h.hand('R', 'pa'); h.arm('L', 0.4, 0.9, 1.2);
      h.face({ lid: 0, brow: -0.5, browY: 1, look: [0.6, 0.9 * ease(k(lt, 0.3, 2.5))], mouth: 'o', open: 0.6 + 0.4 * k(lt, 1, 2.5) });
    } },
  // 5) one year: 4 trillion yen, 40 km — the cold open, in its place
  { sc: 'st', say: ['year'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['1年', '4兆円'], hudColor: RED,
    cam: { p0: [0.15, 1.75, 6.8], p1: [0.15, 1.7, 6.4], l0: [0.15, 1.55, 0] },
    shake: [[0.4, 0.06, 0.6]],
    sfx: [[0.38, 'impact_doon', -9], [0.42, 'coin_toss', -10], [1.0, 'coin_toss', -11], [2.4, 'text_pa', -10]],
    stamps: [{ t: 0.4, text: 'ジャラーン!', x: 640, y: 1120, rot: 8, color: YEL, size: 100, dur: 0.8 }],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '1年で [4兆円]', y: 480, size: 70, border: RED }] : []; },
    tags(lt) { const t0 = this.lt.year + 2.0; return lt > t0 ? [{ t: t0, text: '札束40km＝雲の上', x: 700, y: 700, h: 80, bg: YEL }] : []; },
    note: '1万円札 4億枚 × 0.1mm（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.25); s.hero.rotation.y = 0.35;
      binAt(s, ease(k(lt, 0.38, 1.1))); fountain(s, lt, 0.38, 8.5);
      if (lt < 0.38) { holdOni(s, 'R', V(0.05, 1.25, 0.45)); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.2, look: [0.6, -0.2], mouth: 'flat' }); }
      else { h.arm('R', 0.9, 0.5, 0.2); h.hand('R', 'pa'); h.arm('L', 0.4, 0.9, 1.2); h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.7], mouth: 'o', open: 1.1 }); }
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) money comes back, food doesn't: hungry
  { sc: 'st', say: ['eat'], pre: 0.15, pal: ['#e8574a', '#ffe3d6', '#ffd23a'], dim: 0.9, show: [], hud: ['ごはん', '0個'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.6], p1: [0.0, 1.4, 4.3], l0: [0.0, 1.15, 0] },
    sfx: [[0.3, 'coin_toss', -12], [1.6, 'comic_fall', -13], [3.0, 'comic_boyon', -12]],
    tags(lt) { return [{ t: 0.4, text: 'お金 ○', x: 330, y: 640, h: 84, bg: '#ffffff' }, ...(lt > 1.5 ? [{ t: 1.5, text: 'ごはん ×', x: 690, y: 640, h: 84, bg: RED, fg: '#ffffff' }] : [])]; },
    stamps: [{ t: 3.0, text: 'ぐう〜', x: 300, y: 1080, rot: -8, color: '#ffffff', size: 88, dur: 1.0 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.25;
      const b = s.P.bill, bp = V(-0.05, 1.25, 0.6); b.visible = true; b.position.copy(bp); b.rotation.set(0, 0, 0.1); h.reach('R', bp.clone().add(V(0.08, -0.06, -0.03)));
      h.arm('L', 0.5, 0.1, 2.3); h.hand('L', 'pa');
      const p = s.P.plate; p.visible = true; binAt(s); p.position.set(BIN[0], 0.83, BIN[2]);
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.3, look: [0.3, 0], mouth: 'smile' } : { lid: 0.3, brow: -1, browY: 1, look: [0.6, -0.4], mouth: 'o', open: 0.7 });
      h.body.position.y = lt > 3.0 && lt < 3.6 ? -Math.sin((lt - 3) * 20) * 0.02 : 0;
    } },
  // 8) CO2 doesn't come back: balloons rise out of the bin
  { sc: 'st', say: ['co2'], pre: 0.15, pal: ['#6f7f99', '#e3e8f0', '#ffffff'], dim: 0.9, show: [], hud: ['CO2', '戻らない'], hudColor: RED,
    cam: { p0: [0.05, 1.5, 4.9], p1: [0.05, 1.55, 4.7], l0: [0.05, 1.35, 0] },
    sfx: [[0.3, 'whoosh_gust', -13], [1.9, 'text_pa', -10]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '1人 年[84kg]', y: 480, size: 66, border: RED, sub: 'お風呂 約230杯分（20℃で計算・試算）' }] : []; },
    note: 'CO2 年1,050万t（環境省ほか 2023年度）',
    act(lt, s) {
      binAt(s, 0.15); const g = s.P.co2; g.visible = true;
      g.userData.items.forEach((b, i) => { const u = Math.max(0, lt - 0.2 - i * 0.3); b.visible = u > 0; b.position.set(BIN[0] + Math.sin(i * 2.1) * (0.15 + u * 0.12), BIN_TOP + 0.15 + u * 0.75, BIN[2] + Math.cos(i * 1.3) * 0.15); const sc = Math.min(1, u * 2); b.scale.setScalar(sc); });
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.3;
      h.arm('R', 0.6, 0.4, 0.3); h.hand('R', 'pa'); h.arm('L', 0.3, 0.3, 1.9);
      h.face(lt < 1.7 ? { lid: 0.1, look: [0.6, 0.5], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 9) good news / bad news
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: [],
    cam: { p0: [0.15, 1.48, 4.9], p1: [0.15, 1.46, 4.7], l0: [0.15, 1.3, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', '損しない'] : ['悪いニュース', '87円']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 2.6, 'comic_fall', -13]],
    tags(lt) { const a = this.lt.bad; return lt < a ? [{ t: 1.2, text: '捨てても ±0', x: 520, y: 560, h: 84, bg: YEL }] : [{ t: a + 1.6, text: '87円 ＜ おにぎり150円', x: 520, y: 560, h: 74, bg: '#ffffff' }]; },
    note: '1日分 87円・おにぎりは例（試算）',
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad; s.hero.position.set(-0.15, 0, 0.2); s.hero.rotation.y = 0.2;
      if (!late) { h.arm('R', 0.2, 2.5, 0.3); h.hand('R', 'gu'); h.arm('L', 0.1, 2.5, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.3, brow: 0.6, mouth: 'smile', look: [0.3, 0.3] }); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.05; }
      else { signAt(s, 'tag150', 0.6, -0.5, -0.2);
        const c = s.P.coins; c.visible = true; c.position.set(0, 0, 0); c.userData.items.forEach((it, i) => { it.visible = i < 3; it.position.set(0.25, 1.05 + i * 0.02, 0.55); it.rotation.set(0, 0, 0); });
        h.reach('R', V(0.31, 0.98, 0.5)); h.hand('R', 'pa'); h.arm('L', 0.1, 0.3, 0.2);
        h.face(lt < sh.lt.bad + 1.5 ? { lid: 0.3, brow: 0.3, look: [0.4, -0.3], mouth: 'smile' } : { lid: 0.1, brow: -1, browY: 1, look: [0.7, 0.1], mouth: 'o', open: 1 }); }
    } },
  // 10) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.4, 4.8], p1: [0.05, 1.4, 4.6], l0: [0, 1.22, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.4, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: '食べきる', x: 300, y: 520, h: 120, bg: CY }, { t: t0 + 0.2, text: 'お金に戻す', x: 690, y: 520, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 510, y: 670, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 510, y: 1440, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.15, 0, 0.2); s.hero.rotation.y = 0.05; binAt(s);
      s.P.bin.position.set(0.75, 0, 0);
      holdOni(s, 'R', V(-0.45, 1.2, 0.5)); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.2, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも捨てた食べ物が', '[お金]に戻ったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['食品ロス', 'お金に戻る'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
