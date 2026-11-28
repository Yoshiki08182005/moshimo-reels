// ep68_kamu2x (pop / arm A 原因を拡大): もしもごはんをかむ回数が毎日2倍になったら？
// 型は sp_geppu2x / ep66。台本・数字・小道具は自作。
// 前提（試算）:
//   現代人の1食 620回・11分（元神奈川歯科大 齋藤滋氏の研究。弥生時代の復元食は3,990回・51分）→ かむ回数も時間も毎日2倍
//   620→1240→2480→4960→9920→19840→39680回 / 11→22→44→88→176(2h56)→352(5h52)→704分(11h44)
//   5日目 3食 8h48 = 1日の37% / 6日目 3食 17h36 → 残り6h24（平均睡眠7h22 OECD 2021 より短い）/ 7日目 3食 35h12 > 24h
import { run, THREE, V, clamp, ease, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl, caps } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep68_kamu2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9f5a', '#fff1e0', '#3f6fd8'];
const NP = 7;

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // dining table (top at y=0.78)
  { const t = G(); rbox(1.7, 0.08, 0.8, 0.03, '#e3b877', 0, 0.74, 0, t);
    for (const [x, z] of [[-0.75, -0.32], [0.75, -0.32], [-0.75, 0.32], [0.75, 0.32]]) cyl(0.035, 0.035, 0.72, '#b07a45', x, 0.36, z, t); reg('table', t); }
  // rice bowl (origin = bottom)
  { const b = G(); cyl(0.17, 0.09, 0.15, '#3f6fd8', 0, 0.075, 0, b); cyl(0.172, 0.172, 0.02, '#ffffff', 0, 0.15, 0, b);
    sph(0.15, '#ffffff', 0, 0.15, 0, b, 1, 0.55, 1); reg('gohan', b); }
  // chopsticks
  { const c = G(); for (const z of [-0.025, 0.025]) { const s = cyl(0.008, 0.013, 0.42, '#c0392b', 0, 0, z, c); s.rotation.z = Math.PI / 2; } reg('hashi', c); }
  // a single onigiri (origin = centre)
  { const o = G(); sph(0.13, '#ffffff', 0, 0, 0, o, 1.05, 0.95, 0.75); sph(0.08, '#ffffff', 0, 0.09, 0, o, 1, 0.9, 0.8);
    rbox(0.13, 0.11, 0.2, 0.02, '#1f3a2b', 0, -0.07, 0, o); reg('musubi', o); }
  // moon
  { const m = G(); sph(0.36, basic('#fff3b0'), 0, 0, 0, m); sph(0.07, basic('#e6d98a'), -0.1, 0.08, 0.32, m, 1, 1, 0.4); sph(0.05, basic('#e6d98a'), 0.12, -0.1, 0.33, m, 1, 1, 0.4); reg('moon', m); }
  // steam puffs from the bowl
  { const g = G(); g.userData.items = []; for (let i = 0; i < 5; i++) g.userData.items.push(sph(0.05, M('#ffffff', 0.9), 0, 0, 0, g)); reg('steam', g); }
  // day calendar 1..7
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
function wallClock(s, h, m, x = 1.0, y = 2.15, z = -1.4, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
// hero behind the table: bowl on the table, onigiri in the right hand near the mouth, chopsticks in the left; chew speed sp (0 = still)
function meal(s, lt, x = 0, sp = 1, o = {}) {
  s.P.cal.visible = false; s.P.clock.visible = false;
  const t = s.P.table; t.visible = true; t.position.set(x, 0, 0.42);
  place(s.hero, x, -0.15); const h = s.hero.userData;
  const b = s.P.gohan; b.visible = o.bowl !== false; b.position.set(x - 0.38, 0.78, 0.5);
  if (o.onigiri !== false) { h.reach('R', V(x + 0.32, 1.08, 0.5)); h.hand('R', 'gu'); const m = s.P.musubi; m.visible = true; m.position.copy(h.handPos('R')); m.position.y += 0.1; m.position.z += 0.04; m.rotation.set(0, 0, -0.3); }
  if (o.hashi !== false) { h.reach('L', V(x - 0.3, 0.95, 0.55)); h.hand('L', 'gu'); const c = s.P.hashi; c.visible = true; c.position.copy(h.handPos('L')); c.position.x += 0.08; c.rotation.set(0, 0.5, -0.4); }
  if (sp > 0) { const ph = Math.abs(Math.sin(lt * sp * 6)); h.face({ mouth: 'o', open: 0.05 + ph * 0.5 }); h.head.rotation.x = 0.04 * ph; }
  return h;
}
function steam(s, lt, x = 0) { const g = s.P.steam; g.visible = true; g.position.set(x - 0.38, 1.0, 0.5);
  g.userData.items.forEach((p, i) => { const u = (lt * 0.4 + i / 5) % 1; p.position.set(Math.sin(u * 6 + i) * 0.06, u * 0.5, 0); p.scale.setScalar(0.03 + Math.sin(u * Math.PI) * 0.05); }); }
function sweat(s, lt, on = true) { const sw = s.P.sweat; sw.visible = on; const hp = s.hero.position; sw.position.set(hp.x, hp.y + 1.48, hp.z);
  sw.userData.items.forEach((d, i) => { d.position.y = [0.12, 0.05, 0.3][i] - ((lt * 0.6 + i * 0.3) % 1) * 0.25; }); }
function zzz(s, lt) { const z = s.P.zzz; z.visible = true; const hp = s.hero.position; z.position.set(hp.x + 0.45, hp.y + 1.75, hp.z + 0.2);
  z.userData.items.forEach((p, i) => { const u = (lt * 0.5 + i / 3) % 1; p.position.set(u * 0.35, u * 0.6, 0); p.scale.setScalar(0.6 + u * 0.8); }); }
function calFly(s, lt, t0, t1, x = 0.95, y = 2.0, z = -1.4) {
  const c = s.P.cal; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(1.1);
  c.userData.items.forEach((p, i) => { const ts = t0 + (t1 - t0) * i / (NP - 1), u = i === NP - 1 ? 0 : k(lt, ts, ts + 0.45);
    p.visible = i === NP - 1 || u < 1; p.position.set(u * (0.9 + i * 0.1), -0.08 + u * 1.1 - u * u * 0.3, 0.035 + (NP - i) * 0.002 + u * 0.8); p.rotation.set(u * 1.2, u * 0.8, -u * (2 + i * 0.4)); });
}
function calDay(s, d, x = 0.95, y = 2.0) { const c = s.P.cal; c.visible = true; c.position.set(x, y, -1.4); c.scale.setScalar(1.0); c.userData.items.forEach((p, i) => { p.visible = i >= d - 1; p.position.set(0, -0.08, 0.035 + (NP - i) * 0.002); p.rotation.set(0, 0, 0); }); }
// sun and moon race across the back wall (u = 0..1 per cycle)
function skyRace(s, lt, t0, speed = 1.6) {
  const u = Math.max(0, lt - t0) * speed; const su = s.P.sun, mo = s.P.moon;
  const arc = (o, f) => { const a = (f % 1) * Math.PI; o.visible = true; o.position.set(-2.4 * Math.cos(a), 1.6 + 1.3 * Math.sin(a), -2.0); };
  arc(su, u); su.scale.setScalar(0.5); arc(mo, u + 0.5); }
// cold open / recall: day 7 — chewing at blur speed, sun & moon spin, calendar flies to day 7, clock spins
function coldScene(s, lt, t0) {
  const h = meal(s, lt, -0.05, lt < t0 ? 0 : 3.2); skyRace(s, lt, t0); calFly(s, lt, t0, t0 + 0.8, 1.15, 2.1);
  wallClock(s, 7, lt < t0 ? 0 : (lt - t0) * 1200, -1.15, 2.2, -1.4, 1.2); return h;
}

const plan = [
  // 0) cold open: 12 h of chewing one meal -> push in to the face: "…まだモグモグ♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.7, 6.2], p1: [-0.02, 1.4, 3.4], l0: [0.0, 1.5, -0.6], l1: [-0.02, 1.32, 0.2], hold: 1.2, dur: 2.1 },
    shake: [[0.1, 0.07, 0.6]], lines: [[0.1, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -10], [0.15, 'impact_don', -10], [0.22, 'text_impact', -10], [0.35, 'whoosh_swing', -13], [0.7, 'whoosh_swing', -14], [1.6, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.2, text: '1食12時間!! まだかんでる', x: 540, y: 1540, rot: -6, color: YEL, size: 70, dur: 1.15 },
      { t: 2.2, text: '…まだモグモグ♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.8 }],
    act(lt, s) { const h = coldScene(s, lt, 0.1);
      if (lt < 1.3) h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.5, 0.6] });
      else { h.face({ lid: 0.7, brow: 0.6, browY: 0.5, look: [0, 0] }); s.hero.userData.head.rotation.z = 0.12 * ease(k(lt, 1.8, 2.2)); } } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#ffb347', '#fff4e0', '#3f6fd8'], show: [],
    cam: { p0: [0.0, 1.5, 4.9], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '毎日2倍!?', x: 800, y: 1090, rot: 8, color: RED, size: 74, dur: 1.1 }],
    act(lt, s) { const h = meal(s, lt, 0, lt < 2.2 ? 0.6 : 0); steam(s, lt);
      if (lt < 2.2) h.face({ lid: 0.5, brow: 0.3, look: [0, 0] }); else h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 }); } },
  // 2) now 620 chews, 11 min
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['1食でかむ', '620回'],
    cam: { p0: [0.0, 1.5, 4.9], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [2.5, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1食 [620回]', y: 480, size: 80, border: CY, sub: '現代人の平均（研究による推計）' }] : []; },
    note: '齋藤滋氏（元神奈川歯科大）の研究',
    tags(lt) { const t0 = 2.1; return lt > t0 ? [{ t: t0, text: '食事 11分', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = meal(s, lt, 0, 0.8); steam(s, lt); calDay(s, 1, 1.05); wallClock(s, 12, 11 * ease(k(lt, 0.2, 3.0)), -1.05);
      h.face({ lid: 0.4, brow: 0.3, look: [0.4, 0.3] }); } },
  // 3) day 2: 22 min, savouring
  { sc: 'st', say: ['day2'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#ff8fb0'], show: [], hud: ['2日目', '1,240回'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 4.8], p1: [0.1, 1.45, 4.4], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'sparkle', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '2日目 [22分]', y: 480, size: 76, border: YEL, sub: '11分×2（試算）' }] : []; },
    stamps: [{ t: 1.8, text: 'あま〜い♪', x: 760, y: 1120, rot: 6, color: YEL, size: 70, dur: 1.3 }],
    act(lt, s) { const h = meal(s, lt, -0.1, 0.5, { hashi: false }); steam(s, lt, -0.1); calDay(s, 2, 1.0);
      h.arm('L', 1.6, 0.6, 0.9); h.hand('L', 'pa'); h.face({ lid: 0.75, brow: 0.6, browY: 0.4, look: [0, 0] }); s.hero.userData.head.rotation.z = Math.sin(lt * 1.5) * 0.08; } },
  // 4) day 3: 44 min, lunch break gone
  { sc: 'st', say: ['day3'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ffd23a'], show: [], hud: ['3日目', '44分'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 5.0], p1: [0.0, 1.5, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.3, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '3日目 [44分]', y: 480, size: 76, border: YEL, sub: '昼休み60分の会社なら（試算）' }] : []; },
    tags(lt) { const t0 = 2.2; return lt > t0 ? [{ t: t0, text: '昼休み 60分', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'かむ 44分', x: 770, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = meal(s, lt, 0, 1.2); steam(s, lt); wallClock(s, 12, 44 * ease(k(lt, 0.2, 3.2)), 1.05);
      h.face({ lid: 0.1, brow: -0.3, look: [0.7, 0.6] }); } },
  // 5) day 4: 4,960 chews > Yayoi people (hero2)
  { sc: 'st', say: ['day4'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hero2: true, hud: ['4日目', '4,960回'], hudColor: YEL,
    cam: { p0: [0.2, 1.6, 6.2], p1: [0.2, 1.55, 5.8], l0: [0.2, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.5, 'text_pa', -10], [2.8, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '4日目 [4,960回]', y: 480, size: 72, border: YEL, sub: '620回×2×2×2（試算）' }] : []; },
    note: '弥生時代の復元食 3,990回（齋藤滋氏）',
    tags(lt) { const t0 = 2.4; return lt > t0 ? [{ t: t0, text: '弥生人 3,990回', x: 760, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた 4,960回', x: 300, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = meal(s, lt, -0.35, 1.4); steam(s, lt, -0.35);
      const h2 = s.hero2.userData; place(s.hero2, 0.9, 0.35, -0.4); h2.arm('L', 1.4, 0.4, 0.4); h2.hand('L', 'pa'); h2.arm('R', 0.3, 0.3, 0.2);
      h2.face({ lid: 0, brow: 0.9, browY: 1, look: [-0.7, 0], mouth: 'o', open: lt > 2.6 ? 1 : 0.3 });
      h.face({ lid: 0.3, brow: 0.8, look: [0.6, 0] }); } },
  // 6) day 5: 3 h per meal, 1/3 of the day
  { sc: 'st', say: ['day5'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#3f6fd8'], show: [], hud: ['5日目', '1食3時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1食 [2時間56分]', y: 480, size: 72, border: YEL, sub: '3食で8時間48分＝1日の37%（試算）' }] : []; },
    act(lt, s) { const h = meal(s, lt, 0.05, 1.5); calDay(s, 5, -1.05); wallClock(s, 12, lt * 70, 1.05); sweat(s, lt, lt > 2.4);
      h.face(lt < 2.4 ? { lid: 0.3, brow: 0.2, look: [0.5, 0.6] } : { lid: 0, brow: -0.8, browY: 1, look: [0, 0] }); } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.4, 3.8], p1: [0, 1.35, 3.4], l0: [0, 1.2, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = meal(s, lt, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) day 6: 17.5 h of meals, no time to sleep
  { sc: 'st', say: ['day6'], pre: 0.12, pal: ['#3f5fbf', '#dfe6ff', '#ffd23a'], show: ['lamp'], hud: ['6日目', '3食17時間半'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.3, 'text_pa', -10], [2.6, 'comic_boyon', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '3食で [17時間36分]', y: 480, size: 68, border: RED, sub: '1食5時間52分×3（試算）' }] : []; },
    tags(lt) { const t0 = 2.2; return lt > t0 ? [{ t: t0, text: '睡眠 7時間22分', x: 290, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '残り 6時間24分', x: 770, y: 1560, h: 96, bg: RED, fg: '#ffffff' }] : []; },
    note: '睡眠はOECD 2021年の生活時間調査',
    act(lt, s) { const h = meal(s, lt, 0, 0.35); zzz(s, lt); const l = s.P.lamp; l.visible = true; l.position.set(1.15, 0, -0.5);
      h.face({ lid: 0.9, brow: -0.3, look: [0, 0] }); s.hero.userData.head.rotation.z = 0.18 + Math.sin(lt * 1.5) * 0.05; } },
  // 9) day 7: 12 h per meal, 35 h -> doesn't fit (cold open, in place)
  { sc: 'st', say: ['day7'], pre: 0.12, pal: HOOK, show: [], hud: ['7日目', '1食12時間'], hudColor: RED,
    cam: { p0: [0.0, 1.7, 6.2], p1: [0.0, 1.66, 5.8], l0: [0.0, 1.5, -0.6] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.3, 0.8]],
    sfx: [[0.2, 'whoosh_gust', -11], [0.35, 'impact_don', -12], [0.5, 'whoosh_swing', -14], [2.4, 'text_pa', -10], [4.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 2.3 ? [{ t: 2.3, text: '3食で [35時間]', y: 480, size: 76, border: RED, sub: '1食11時間44分×3（試算）' }] : []; },
    tags(lt) { const t0 = 4.2; return lt > t0 ? [{ t: t0, text: '1日 24時間', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '必要 35時間', x: 770, y: 1560, h: 100, bg: RED, fg: '#ffffff' }] : []; },
    act(lt, s) { const h = coldScene(s, lt, 0.3); sweat(s, lt, lt > 4.2);
      h.face(lt < 4.2 ? { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.6] } : { lid: 0, brow: -1, browY: 1, look: [0, 0] }); } },
  // 10) good / bad news: chewing well is good (serious), the rice goes cold
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#3f6fd8'], show: [], hud: ['よくかむ', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.6], p1: [0.0, 1.45, 4.3], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'text_pa', -10], [3.4, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.4 ? (lt > 0.3 ? [{ t: 0.3, text: 'よくかむのは [体にいい]', y: 480, size: 66, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.4, text: 'ごはんが [冷める]', y: 480, size: 74, border: RED, sub: '悪いニュース' }]; },
    note: '厚労省「噛ミング30」：1口30回以上',
    stamps: [{ t: 3.3, text: 'ひえひえ…', x: 760, y: 1120, rot: 6, color: CY, size: 72, dur: 1.4 }],
    act(lt, s) { const h = meal(s, lt, 0, lt < 2.4 ? 0.8 : 0, { onigiri: lt < 2.4 }); if (lt < 2.4) steam(s, lt);
      if (lt < 2.4) h.face({ lid: 0.6, brow: 0.5, look: [0, 0] });
      else { h.arm('R', 1.2, 0.5, 0.3); h.hand('R', 'pa'); h.face({ lid: 0, brow: -1, browY: 1, look: [-0.5, -0.4], mouth: 'o', open: 0.6 }); } } },
  // 11) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.25, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'したい', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '今のままでいい', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = meal(s, lt, -0.05, 0.6); steam(s, lt, -0.05); h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3] }); s.hero.userData.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもごはんをかむ回数が', '毎日[2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['かむ回数', '毎日×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
