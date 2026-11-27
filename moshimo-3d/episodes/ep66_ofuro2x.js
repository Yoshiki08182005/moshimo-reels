// ep66_ofuro2x (pop / arm A 原因を拡大): もしもお風呂につかる時間が毎日2倍になったら？
// 型は sp_geppu2x / ep61。台本・数字・小道具は自作。
// 前提（試算）:
//   冬に湯船につかる時間 全国平均14分（ウェザーニュース 2023年1月調査）→ 毎日2倍
//   14→28→56→112(1h52)→224(3h44)→448(7h28)→896(14h56)→1792分(29h52)
//   東京→新大阪 のぞみ 約2時間半 / 日本の平均睡眠 7時間22分（OECD 2021）→ 起きている16h38m の 89.8%
//   家族4人×6日目 7h28m = 29h52m > 24h
//   消費者庁の目安：湯温41℃以下・つかる時間は10分まで
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl, caps } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep66_ofuro2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#8fc8ff', '#fff4e0', '#ff8fb0'];
const NP = 8;

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // bathtub: rim top at y≈0.86, inner water surface at y≈0.8 (origin = floor centre)
  { const t = G(); const W = '#ffffff';
    rbox(1.76, 0.86, 0.14, 0.06, W, 0, 0.43, 0.46, t); rbox(1.76, 0.86, 0.14, 0.06, W, 0, 0.43, -0.46, t);
    rbox(0.14, 0.86, 1.06, 0.06, W, -0.81, 0.43, 0, t); rbox(0.14, 0.86, 1.06, 0.06, W, 0.81, 0.43, 0, t);
    rbox(1.6, 0.1, 0.9, 0.04, W, 0, 0.05, 0, t); rbox(1.78, 0.1, 0.02, 0.02, '#5aa9ff', 0, 0.62, 0.535, t);
    for (const x of [-0.7, 0.7]) sph(0.07, '#e0e6ee', x, 0.04, 0.48, t, 1, 0.6, 1);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), new THREE.MeshStandardMaterial({ color: '#6fd3ff', roughness: 0.15, transparent: true, opacity: 0.82 }));
    w.rotation.x = -Math.PI / 2; w.position.y = 0.8; t.add(w); t.userData.water = w; reg('tub', t); }
  // rubber duck
  { const d = G(); sph(0.13, '#ffd23a', 0, 0.06, 0, d, 1.2, 0.8, 1); sph(0.085, '#ffd23a', 0.05, 0.18, 0.02, d);
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 14), M('#ff8a2a')); b.rotation.z = -Math.PI / 2; b.position.set(0.15, 0.17, 0.02); d.add(b);
    sph(0.014, '#23262f', 0.1, 0.21, 0.07, d); sph(0.014, '#23262f', 0.1, 0.21, -0.03, d); reg('duck', d); }
  // folded towel for the head
  { const g = G(); rbox(0.4, 0.07, 0.3, 0.03, '#ffffff', 0, 0, 0, g); rbox(0.4, 0.02, 0.06, 0.01, '#ff9db8', 0, 0.035, 0.08, g); reg('towel', g); }
  // steam puffs (column)
  { const g = G(); g.userData.items = []; for (let i = 0; i < 9; i++) g.userData.items.push(sph(0.2, M('#ffffff', 0.9), 0, 0, 0, g)); reg('steam', g); }
  // mini bullet train
  { const g = G(); const b = caps(0.16, 1.4, '#ffffff', 0, 0.2, 0, g); b.rotation.z = Math.PI / 2; sph(0.16, '#ffffff', 0.85, 0.18, 0, g, 1.9, 0.8, 1);
    const s = caps(0.03, 1.5, '#2f6fe0', 0, 0.14, 0.14, g); s.rotation.z = Math.PI / 2;
    for (let i = 0; i < 6; i++) rbox(0.12, 0.07, 0.02, 0.02, '#2c3b6b', -0.6 + i * 0.22, 0.27, 0.15, g); reg('shink', g); }
  // day calendar 1..8
  { const g = G(); rbox(0.78, 0.92, 0.05, 0.04, '#ffffff', 0, 0, 0, g); rbox(0.78, 0.2, 0.06, 0.04, RED, 0, 0.38, 0, g); g.userData.items = [];
    for (let i = 0; i < NP; i++) { const p = plate(0.7, 0.62, 280, 248, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 280, 248); c.fillStyle = i === NP - 1 ? RED : '#2c3b6b';
      c.font = 'bold 150px sans-serif'; c.textAlign = 'center'; c.fillText(String(i + 1), 140, 150); c.font = 'bold 54px sans-serif'; c.fillText('日目', 140, 228); });
      p.position.set(0, -0.08, 0.035 + (NP - i) * 0.002); g.add(p); g.userData.items.push(p); }
    reg('cal', g); }
  // sweat drops / zzz
  { const g = G(); g.userData.items = [[-0.42, 0.12], [0.44, 0.05], [0.36, 0.3]].map(([x, y]) => sph(0.05, M('#7fd7ff', 0.2), x, y, 0.2, g, 0.8, 1.2, 0.8)); reg('sweat', g); }
  { const g = G(); g.userData.items = [0, 1, 2].map(i => { const p = plate(0.22, 0.22, 96, 96, (c) => { c.fillStyle = '#ffffff'; c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.fillText('Z', 48, 80); }); g.add(p); return p; }); reg('zzz', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const towelOn = (s) => { const c = s.P.towel; c.visible = true; s.hero.userData.head.add(c); c.position.set(0, 0.45, 0); c.rotation.set(0.05, 0, 0.08); c.scale.setScalar(1.15); };
function wallClock(s, h, m, x = 1.0, y = 2.15, z = -1.4, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
// tub + hero sitting in the water up to the shoulders, hands on the front rim
function bathe(s, x = 0, towel = true, hands = true, duck = true) {
  s.P.cal.visible = false; s.P.clock.visible = false;
  const t = s.P.tub; t.visible = true; t.position.set(x, 0, 0.15); t.rotation.set(0, 0, 0);
  place(s.hero, x, 0.1); s.hero.position.y = -0.22;
  const h = s.hero.userData; if (towel) towelOn(s);
  if (duck) { const d = s.P.duck; d.visible = true; d.position.set(x + 0.48, 0.8, 0.35); d.rotation.set(0, -0.5, 0); }
  if (hands) { h.reach('L', V(x - 0.38, 0.9, 0.6)); h.reach('R', V(x + 0.38, 0.9, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu'); }
  return h;
}
function sweat(s, lt, on = true) { const sw = s.P.sweat; sw.visible = on; const hp = s.hero.position; sw.position.set(hp.x, hp.y + 1.48, hp.z);
  sw.userData.items.forEach((d, i) => { d.position.y = [0.12, 0.05, 0.3][i] - ((lt * 0.6 + i * 0.3) % 1) * 0.25; }); }
function zzz(s, lt) { const z = s.P.zzz; z.visible = true; const hp = s.hero.position; z.position.set(hp.x + 0.45, hp.y + 1.75, hp.z + 0.2);
  z.userData.items.forEach((p, i) => { const u = (lt * 0.5 + i / 3) % 1; p.position.set(u * 0.35, u * 0.6, 0); p.scale.setScalar(0.6 + u * 0.8); }); }
// gentle steam (small puffs drifting up) or a big burst column (u 0..1)
function steam(s, lt, x = 0, big = 0) { const g = s.P.steam; g.visible = true; g.position.set(x, 0.85, 0.15);
  g.userData.items.forEach((p, i) => { if (big > 0) { const v = clamp(big * 1.3 - i * 0.04); p.position.set(Math.sin(i * 2.1 + lt) * (0.2 + i * 0.05), 0.9 + v * i * 0.5, -0.5 - i * 0.05); p.scale.setScalar(0.2 + v * (0.25 + i * 0.07)); }
    else { const u = (lt * 0.35 + i / 9) % 1; const sd = i % 2 ? 1 : -1; p.position.set(sd * (0.6 + (i % 3) * 0.08), u * 0.9, -0.35); p.scale.setScalar(0.03 + Math.sin(u * Math.PI) * 0.07); } }); }
function calFly(s, lt, t0, t1, x = 0.95, y = 2.0, z = -1.4) {
  const c = s.P.cal; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(1.1);
  c.userData.items.forEach((p, i) => { const ts = t0 + (t1 - t0) * i / (NP - 1), u = i === NP - 1 ? 0 : k(lt, ts, ts + 0.45);
    p.visible = i === NP - 1 || u < 1; p.position.set(u * (0.9 + i * 0.1), -0.08 + u * 1.1 - u * u * 0.3, 0.035 + (NP - i) * 0.002 + u * 0.8); p.rotation.set(u * 1.2, u * 0.8, -u * (2 + i * 0.4)); });
}
function calDay(s, d, x = 0.95, y = 2.0) { const c = s.P.cal; c.visible = true; c.position.set(x, y, -1.4); c.scale.setScalar(1.0); c.userData.items.forEach((p, i) => { p.visible = i >= d - 1; p.position.set(0, -0.08, 0.035 + (NP - i) * 0.002); p.rotation.set(0, 0, 0); }); }
// cold open / recall: steam column bursts to the sky, 7 days of pages fly off, clock spins
function coldScene(s, lt, t0) {
  const h = bathe(s, -0.05, true); steam(s, lt, -0.05, ease(k(lt, t0, t0 + 0.6))); calFly(s, lt, t0, t0 + 0.9, 1.05);
  wallClock(s, 7, lt < t0 ? 0 : (lt - t0) * 900, -1.1, 2.2, -1.4, 1.3); return h;
}

const plan = [
  // 0) cold open: steam explodes, calendar to day 8 -> push in to the face with a towel: "…ごくらく♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.75, 6.4], p1: [-0.05, 1.3, 3.5], l0: [0.0, 1.5, -0.6], l1: [-0.05, 1.15, 0.2], hold: 1.2, dur: 2.1 },
    shake: [[0.1, 0.07, 0.6]], lines: [[0.1, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -10], [0.15, 'impact_don', -10], [0.22, 'text_impact', -10], [0.35, 'whoosh_swing', -13], [0.6, 'whoosh_swing', -14], [1.6, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.2, text: '30時間!! まだ湯船', x: 540, y: 1540, rot: -6, color: YEL, size: 80, dur: 1.15 },
      { t: 2.2, text: '…ごくらく♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.8 }],
    act(lt, s) { const h = coldScene(s, lt, 0.1);
      if (lt < 1.3) h.face({ lid: 0.3, brow: 0.5, look: [0.6, 0.6], mouth: 'smile' });
      else { h.face({ lid: 0.75, brow: 0.6, browY: 0.5, look: [0, 0], mouth: 'smile' }); s.hero.userData.head.rotation.z = 0.14 * ease(k(lt, 1.8, 2.2)); } } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 4.9], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '毎日2倍!?', x: 800, y: 1090, rot: 8, color: RED, size: 74, dur: 1.1 }],
    act(lt, s) { const h = bathe(s, 0, true, lt > 2.2); steam(s, lt);
      if (lt < 2.2) { h.arm('L', 0.3, 0.3, 0.3); h.arm('R', 2.6, 0.2, 0.3); h.hand('R', 'pa'); h.face({ lid: 0.6, brow: 0.4, look: [0, 0], mouth: 'smile' }); }
      else h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 }); } },
  // 2) now 14 min, day 2 28 min
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['湯船につかる', '14分'],
    cam: { p0: [0.0, 1.5, 4.9], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.3, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '冬の平均 [14分]', y: 480, size: 74, border: CY, sub: '湯船につかる時間' }] : []; },
    note: 'ウェザーニュース 2023年1月調査',
    tags(lt) { const t0 = 2.2; return lt > t0 ? [{ t: t0, text: '1日目 14分', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '2日目 28分', x: 770, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = bathe(s, 0); steam(s, lt); calDay(s, lt < 2.2 ? 1 : 2, -1.05); wallClock(s, 9, 14 * ease(k(lt, 0.2, 1.5)) + 14 * ease(k(lt, 2.2, 3.0)));
      h.face(lt < 2.2 ? { lid: 0.5, brow: 0.3, look: [0.5, 0.4], mouth: 'smile' } : { lid: 0.1, brow: 0.6, look: [0, 0], mouth: 'o', open: 0.5 }); } },
  // 3) day 4: 1h52 = a movie
  { sc: 'st', say: ['day4'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['board'], hud: ['4日目', '1時間52分'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 4.8], p1: [0.1, 1.45, 4.4], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'sparkle', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '4日目 [1時間52分]', y: 480, size: 68, border: YEL, sub: '14分×2×2×2（試算）' }] : []; },
    stamps: [{ t: 1.9, text: '映画1本分!', x: 560, y: 1540, rot: -5, color: YEL, size: 72, dur: 1.3 }],
    act(lt, s) { const h = bathe(s, -0.2); steam(s, lt, -0.2); const b = s.P.board; b.visible = true; b.position.set(0.95, 0.6, -0.9); b.rotation.set(0, -0.3, 0);
      h.arm('R', 1.3, 0.4, 0.6); h.hand('R', 'choki');
      h.face(lt < 1.9 ? { lid: 0.3, brow: 0.3, look: [0.7, 0.3], mouth: 'smile' } : { lid: 0.55, brow: 0.8, browY: 0.6, look: [0, 0], mouth: 'smile' }); } },
  // 4) day 5: 3h44 > Tokyo->Osaka
  { sc: 'st', say: ['osaka'], pre: 0.12, pal: ['#5ad1c8', '#e6fbf8', '#2f6fe0'], show: ['shink'], hud: ['5日目', '3時間44分'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 5.2], p1: [0.0, 1.5, 4.8], l0: [0.0, 1.35, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.5, 'whoosh_slide', -12], [2.9, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '5日目 [3時間44分]', y: 480, size: 68, border: YEL, sub: '東京→新大阪 のぞみ約2時間半' }] : []; },
    tags(lt) { const t0 = 2.6; return lt > t0 ? [{ t: t0, text: '新幹線 2時間半', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'お風呂 3時間44分', x: 760, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = bathe(s, 0); steam(s, lt); const t = s.P.shink; t.position.set(-3.2 + lt * 1.6, 1.6, -1.3); t.scale.setScalar(1.2);
      h.face({ lid: 0.1, brow: 0.5, look: [lt < 2.5 ? -0.6 + lt * 0.4 : 0, 0.4], mouth: 'o', open: 0.6 }); } },
  // 5) day 6: 7.5 h = sleep time
  { sc: 'st', say: ['sleep'], pre: 0.12, pal: ['#3f5fbf', '#dfe6ff', '#ffd23a'], show: ['lamp'], hud: ['6日目', '7時間28分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'comic_boyon', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: 'ほぼ [睡眠時間]', y: 480, size: 74, border: YEL, sub: '日本の平均睡眠 7時間22分' }] : []; },
    note: 'OECD 2021年の生活時間調査',
    act(lt, s) { const h = bathe(s, 0, true, false); steam(s, lt); zzz(s, lt); h.arm('L', 0.2, 0.2, 0.2); h.arm('R', 0.2, 0.2, 0.2);
      const l = s.P.lamp; l.visible = true; l.position.set(1.15, 0, -0.5);
      h.face({ lid: 1, brow: 0.3, look: [0, 0], mouth: 'o', open: 0.3 }); s.hero.userData.head.rotation.z = 0.2 + Math.sin(lt * 1.5) * 0.05; } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.4, 3.8], p1: [0, 1.35, 3.4], l0: [0, 1.2, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = bathe(s, 0, true, true, false); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 7) day 7: 15 h = 90% of waking hours
  { sc: 'st', say: ['awake'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#ff5a4f'], show: [], hud: ['7日目', '15時間'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '起きてる時間の [9割]', y: 480, size: 66, border: RED, sub: '14時間56分÷16時間38分（試算）' }] : []; },
    act(lt, s) { const h = bathe(s, -0.1); steam(s, lt, -0.1); sweat(s, lt); wallClock(s, 7, lt * 240, 0.95);
      h.face(lt < 1.9 ? { lid: 0.4, brow: -0.5, look: [0.6, 0.6], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.8 }); } },
  // 8) day 8: 30 h -> the next day comes first (cold open, in place)
  { sc: 'st', say: ['next'], pre: 0.12, pal: HOOK, show: [], hud: ['8日目', '30時間'], hudColor: RED,
    cam: { p0: [0.0, 1.75, 6.4], p1: [0.0, 1.72, 6.0], l0: [0.0, 1.5, -0.6] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.3, 0.8]],
    sfx: [[0.2, 'whoosh_gust', -11], [0.35, 'impact_don', -12], [0.5, 'whoosh_swing', -14], [1.6, 'text_pa', -10], [3.0, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '出る前に [次の日]', y: 480, size: 72, border: YEL, sub: '8日目 29時間52分（試算）' }] : []; },
    act(lt, s) { const h = coldScene(s, lt, 0.3); h.face(lt < 1.5 ? { lid: 0, brow: 0.9, browY: 1, look: [0.7, 0.6], mouth: 'o', open: 1 } : { lid: 0.6, brow: 0.7, look: [0, 0], mouth: 'smile' }); } },
  // 9) family of 4: 30 h on day 6
  { sc: 'st', say: ['family'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ff5a4f'], show: [], hero2: true, hud: ['家族4人', '30時間'], hudColor: RED,
    cam: { p0: [0.3, 1.6, 6.0], p1: [0.3, 1.55, 5.6], l0: [0.3, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'comic_shock2', -11]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '4人で [30時間]', y: 480, size: 74, border: RED, sub: '6日目 7時間28分×4人（試算）' }] : []; },
    tags(lt) { const t0 = 2.3; return lt > t0 ? [{ t: t0, text: '1日 24時間', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '必要 30時間', x: 770, y: 1560, h: 100, bg: RED, fg: '#ffffff' }] : []; },
    act(lt, s) { const h = bathe(s, -0.35); steam(s, lt, -0.35);
      const h2 = s.hero2.userData; place(s.hero2, 0.95, 0.65, -0.4); h2.face({ lid: 0.2, brow: 1, browY: -0.5, look: [-0.6, 0], mouth: 'flat' });
      h2.arm('L', 1.3, 0.3, 0.1); h2.hand('L', 'pa'); h2.arm('R', 0.2, 0.5, 1.8); h2.hand('R', 'gu'); s.hero2.position.y = Math.abs(Math.sin(lt * 7)) * 0.03;
      h.face(lt < 2.3 ? { lid: 0.5, brow: 0.3, look: [0.7, 0.2], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.7, 0], mouth: 'o', open: 1 }); } },
  // 10) nobose (serious): real guideline 10 min
  { sc: 'st', say: ['nobose'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#3f6fd8'], show: ['thermoA'], hud: ['長湯', 'のぼせ注意'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 4.8], p1: [0.1, 1.45, 4.4], l0: [0.15, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.0, 'text_tin', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '目安は [10分] まで', y: 480, size: 72, border: CY, sub: 'お湯は41℃以下（消費者庁）' }] : []; },
    note: '消費者庁：冬の入浴事故に注意',
    act(lt, s) { const h = bathe(s, -0.25); steam(s, lt, -0.25); const th = s.P.thermoA; th.visible = true; th.position.set(0.85, 0, 0.55); th.scale.setScalar(1.3); th.userData.fill.scale.y = 0.75;
      h.face({ lid: 0.5, brow: -0.8, browY: 1, look: [0, 0], mouth: 'o', open: 0.4 }); s.hero.userData.head.rotation.z = Math.sin(lt * 2.2) * 0.12; } },
  // 11) good / bad news
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#ff5a4f'], show: [], hud: ['長風呂の', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.6], p1: [0.0, 1.45, 4.3], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'text_pa', -10], [3.2, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.3 ? [{ t: 0.3, text: '体は [ぽかぽか]', y: 480, size: 74, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.3, text: '指が [シワシワ]', y: 480, size: 74, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.1, text: 'ふやけた…', x: 760, y: 1120, rot: 6, color: RED, size: 72, dur: 1.4 }],
    act(lt, s) { const h = bathe(s, 0, true, lt < 2.3); steam(s, lt);
      if (lt < 2.3) h.face({ lid: 0.7, brow: 0.5, look: [0, 0], mouth: 'smile' });
      else { h.arm('R', 2.0, 0.3, 1.2); h.hand('R', 'pa'); h.arm('L', 0.2, 0.2, 0.2); h.face({ lid: 0, brow: -1, browY: 1, look: [0.5, 0.5], mouth: 'o', open: 0.6 }); } } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.25, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'してみたい', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '10分でいい', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = bathe(s, -0.05, true); steam(s, lt, -0.05); h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); s.hero.userData.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもお風呂につかる時間が', '毎日[2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['お風呂の時間', '毎日×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
