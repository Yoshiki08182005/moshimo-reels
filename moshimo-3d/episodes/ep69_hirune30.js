// ep69_hirune30 (pop / arm B 生活ルール改変): もしも昼寝が法律で毎日30分になったら？
// 型は sp_geppu2x / ep64。台本・数字・小道具は自作。
// 前提（試算）:
//   日本人の睡眠 7時間22分（OECD 2021、33か国で最短。厚労省資料）。昼寝30分を足すと 7時間52分 = 1日の32.8%（≈3分の1）
//   1年 30分×365 = 10,950分 = 182.5時間 = 7.6日（まる7日半）。80年で 608日 ≈ 1年8か月
//   日本 1億2,321万人（総務省 2025年10月概算）×30分 = 6,160万時間/日 = 7,032年分
//   昼休み60分 − 昼寝30分 − 移動・トイレ15分と仮定 = ごはん15分
//   全員が13時〜13時30分に同時に昼寝すると仮定 → 電車・バスも30分止まる。目覚まし 1人1個と仮定 → 1億個超
import { run, THREE, V, clamp, ease } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep69_hirune30.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#8f7bff', '#efeaff', '#ffd23a'];
const SLEEP = { lid: 1, brow: 0.3, look: [0, 0], mouth: 'o', open: 0.25 };

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // pillow (held in front of the body)
  { const g = G(); rbox(0.56, 0.16, 0.36, 0.08, '#ffffff', 0, 0, 0, g); rbox(0.5, 0.02, 0.3, 0.01, '#bfe3ff', 0, 0.08, 0, g); reg('pillow', g); }
  // nose bubble (snot bubble), radius 1 -> scaled
  { const g = G(); const m = new THREE.MeshStandardMaterial({ color: '#bfe9ff', transparent: true, opacity: 0.45, roughness: 0.1 });
    sph(1, m, 0, 0, 0, g); sph(0.12, new THREE.MeshBasicMaterial({ color: '#ffffff' }), -0.45, 0.5, 0.75, g); reg('bubble', g); }
  // little alarm clocks (items)
  { const g = G(); g.userData.items = []; const cols = ['#e2463c', '#35b6ff', '#7bd88f', '#ffb84a', '#c79bff'];
    for (let i = 0; i < 24; i++) { const c = G(); const b = cyl(0.13, 0.13, 0.08, cols[i % 5], 0, 0.15, 0, c); b.rotation.x = Math.PI / 2;
      cyl(0.105, 0.105, 0.01, '#ffffff', 0, 0.15, 0.045, c).rotation.x = Math.PI / 2;
      for (const sx of [-1, 1]) sph(0.05, '#ffd23a', sx * 0.09, 0.29, 0, c); rbox(0.012, 0.07, 0.01, 0.004, '#2c3b6b', 0, 0.17, 0.055, c);
      const r = Math.floor(i / 8), cc = i % 8; c.position.set((cc - 3.5) * 0.36 + (r % 2) * 0.18, r * 0.05, -0.2 - r * 0.45); g.add(c); g.userData.items.push(c); }
    reg('alarms', g); }
  // one onigiri
  { const g = G(); sph(0.1, '#ffffff', 0, 0, 0, g, 1, 0.92, 0.6); rbox(0.09, 0.07, 0.07, 0.01, '#1e3b2a', 0, -0.06, 0, g); reg('rice', g); }
  // desk marks on the cheek (3 small pink lines), parented later to the head
  { const g = G(); for (let i = 0; i < 3; i++) rbox(0.14, 0.018, 0.012, 0.005, '#c8304f', 0, i * 0.04, 0, g); g.rotation.z = 0.15; reg('mark', g); }
  // sparkle
  { const g = G(); for (let i = 0; i < 5; i++) sph(0.03, new THREE.MeshBasicMaterial({ color: '#ffffff' }), Math.cos(i * 1.26) * 0.62, Math.sin(i * 1.26) * 0.5, 0, g); reg('kira', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, who = 'hero') => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz);
  s[who].userData.reach(side, p.clone().add(V(side === 'R' ? 0.08 : -0.08, -0.05, -0.02))); return o; };
// hug the pillow with both hands at chest/cheek height
const hug = (s, y0 = 1.1, who = 'hero') => { const y = y0 - 0.25; { const o = s[who]; const p = V(o.position.x + 0.12, o.position.y + y, o.position.z + 0.36); const pl = s.P.pillow;
  pl.visible = true; pl.position.copy(p); pl.rotation.set(0.2, 0, 0.25); o.userData.reach('L', p.clone().add(V(-0.2, 0, 0.05))); o.userData.reach('R', p.clone().add(V(0.22, -0.08, 0.05))); } };
const clockAt = (s, x, y, z, sc, lt, sp = 1) => { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(sc); c.userData.mh.rotation.z = -lt * 2 * sp; c.userData.hh.rotation.z = -0.7 - lt * 0.2 * sp; };
// cold open / recall: hero dozes off, a giant nose bubble inflates and lifts him into the air, then pops
function lift(s, lt, t0, popT) {
  const o = s.hero, u = ease(k(lt, t0, t0 + 0.45)), down = ease(k(lt, popT, popT + 0.3));
  o.position.y = 1.2 * u * (1 - down) + 0.05 * Math.sin(lt * 3) * u * (1 - down);
  const b = s.P.bubble, r = 0.05 + 0.85 * u; b.visible = u > 0 && lt < popT;
  b.position.set(o.position.x + 0.45 + r * 0.95, o.position.y + 1.3 + r * 0.25, o.position.z + 0.15); b.scale.setScalar(r * (1 + 0.04 * Math.sin(lt * 6)));
  return { u, popped: lt >= popT };
}

const plan = [
  // 0) cold open (flash-forward of #5): nap time -> a giant nose bubble lifts him into the air -> pop -> push in, "…むにゃ♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: ['clock'],
    cam: { p0: [0.2, 1.8, 7.2], p1: [0.05, 1.42, 3.4], l0: [0.3, 1.9, -0.3], l1: [0.0, 1.38, 0.4], hold: 1.6, dur: 2.5 },
    shake: [[0.15, 0.08, 0.6], [1.6, 0.05, 0.3]], lines: [[0.12, 0.9]],
    sfx: [[0.0, 'whoosh_switch1', -12], [0.12, 'impact_doon', -9], [0.15, 'comic_boyon', -11], [0.2, 'text_impact', -11], [1.6, 'comic_pico', -11], [2.4, 'comic_pico', -12]],
    stamps: [{ t: 0.15, text: 'お昼寝 30分!!', x: 540, y: 400, rot: -6, color: YEL, size: 92, dur: 1.4 },
      { t: 0.5, text: 'Zzz', x: 250, y: 760, rot: -8, color: '#ffffff', size: 86, dur: 1.1 },
      { t: 1.62, text: 'パチン!', x: 760, y: 800, rot: 8, color: RED, size: 80, dur: 0.6 },
      { t: 2.3, text: '…むにゃ♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) { place(s.hero, 0.0, 0.45); clockAt(s, -1.1, 2.2, -0.8, 1.3, 0); const { u, popped } = lift(s, lt, 0.1, 1.6); const h = s.hero.userData;
      hug(s, 1.1); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(u <= 0 ? { lid: 0.5, brow: 0.2, look: [0, 0], mouth: 'o', open: 0.6 } : !popped ? SLEEP : lt < 2.1 ? { lid: 0, brow: 0.9, browY: 1, look: [0, 0.3], mouth: 'o', open: 0.9 } : { lid: 0.6, brow: 0.5, look: [0, 0], mouth: 'smile' });
      h.head.rotation.z = !popped ? 0.25 * u : 0.12 * ease(k(lt, 2.1, 2.5)); } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#7bd88f', '#effbf1', '#35b6ff'], show: ['clock'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.5, 'comic_surprise', -12]],
    stamps: [{ t: 2.6, text: '義務!?', x: 800, y: 1080, rot: 8, color: RED, size: 76, dur: 1.0 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.1, 0.4); clockAt(s, 0.9, 1.9, -0.6, 1.2, lt); hug(s, 1.05 + 0.02 * Math.sin(lt * 4));
      h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 2.5 ? { lid: 0.3, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 2) now: 7h22m, shortest of 33 countries
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['bed'], hud: ['睡眠', '7時間22分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.6, 'text_pa', -10], [2.7, 'comic_stupid', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '日本 [7時間22分]', y: 480, size: 74, border: CY, sub: 'OECD 2021（厚労省資料）' }] : []; },
    tags(lt) { return lt > 2.6 ? [{ t: 2.6, text: '33か国で最短', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; const b = s.P.bed; place(b, 0.75, -0.6, -0.3); place(s.hero, -0.4, 0.35, 0.2);
      h.arm('L', 2.6, 0.4, 0.2); h.hand('L', 'pa'); h.reach('R', V(-0.25, 1.25, 0.6)); h.hand('R', 'gu');
      h.face(lt < 2.6 ? { lid: 0.6, brow: 0.3, look: [0, 0], mouth: 'o', open: 1 } : { lid: 0.3, brow: -0.8, browY: 1, look: [0.5, -0.2], mouth: 'flat' }); } },
  // 3) plus a nap: 7h52m = a third of the day
  { sc: 'st', say: ['plus'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['睡眠', '7時間52分'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.05, 1.45, 4.5], l0: [0.05, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'text_pa', -10]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '[7時間52分]', y: 480, size: 84, border: CY, sub: '7時間22分＋昼寝30分（試算）' }] : []; },
    tags(lt) { return lt > 2.4 ? [{ t: 2.4, text: '1日の3分の1', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    stamps: [{ t: 1.2, text: 'Zzz', x: 760, y: 820, rot: 8, color: '#ffffff', size: 80, dur: 2.4 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.4); hug(s, 1.15); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.1 ? { lid: 0.3, brow: 0.5, look: [0.3, 0.2], mouth: 'smile' } : { lid: 1, brow: 0.4, look: [0, 0], mouth: 'smile' });
      h.head.rotation.z = 0.25 * ease(k(lt, 1.0, 1.5)); s.hero.position.y = 0.02 * Math.sin(lt * 2); } },
  // 4) a year: 182 hours = 7.5 full days
  { sc: 'st', say: ['year'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['clock'], hud: ['1年', '182時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.5], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.0, 'text_pa', -10], [2.2, 'comic_stupid', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1年で [182時間]', y: 480, size: 74, border: YEL, sub: '30分×365日（試算）' }] : []; },
    tags(lt) { return lt > 2.0 ? [{ t: 2.0, text: 'まる7日半 お昼寝', x: 540, y: 1560, h: 96, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0.35, 0.3, -0.15); clockAt(s, -0.6, 1.6, 0.1, 1.5, lt, 7);
      hug(s, 1.1); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 2.0 ? { lid: 0.3, brow: 0.3, look: [-0.6, 0.3], mouth: 'o', open: 0.4 } : { lid: 0.6, brow: -0.6, look: [0, 0], mouth: 'flat' }); } },
  // 5) a lifetime: 1 year 8 months (recall of the cold open)
  { sc: 'st', say: ['life'], pre: 0.12, pal: HOOK, show: ['clock'], hud: ['一生', '1年8か月'], hudColor: YEL,
    cam: { p0: [0.2, 1.9, 7.4], p1: [0.1, 1.85, 6.8], l0: [0.3, 2.0, -0.3] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.25, 0.7]],
    sfx: [[0.15, 'whoosh_switch1', -12], [0.3, 'impact_doon', -11], [0.35, 'comic_boyon', -12], [0.5, 'text_pa', -10], [3.0, 'comic_pico', -12]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '一生で [1年8か月]', y: 480, size: 72, border: YEL, sub: '80年×1日30分＝608日（試算）' }] : []; },
    act(lt, s) { place(s.hero, 0.0, 0.45); clockAt(s, -1.1, 2.2, -0.8, 1.3, lt, 5); const { u, popped } = lift(s, lt, 0.3, 3.0); const h = s.hero.userData;
      hug(s, 1.1); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(u <= 0 ? { lid: 0.5, brow: 0.2, look: [0, 0], mouth: 'o', open: 0.6 } : !popped ? SLEEP : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.3], mouth: 'o', open: 0.9 });
      h.head.rotation.z = !popped ? 0.25 * u : 0; } },
  // 6) all of Japan: 7,000 years of napping a day
  { sc: 'st', say: ['japan'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ffd23a'], show: ['crowd'], hud: ['日本中', '7,000年分'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 6.2], p1: [0.0, 1.9, 7.0], l0: [0.0, 1.2, -0.4], l1: [0.0, 1.3, -0.4], dur: 3.0 },
    sfx: [[0.3, 'text_pa', -10], [1.4, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1日で [7,000年分]', y: 480, size: 72, border: YEL, sub: '1億2,321万人×30分＝6,160万時間（試算）' }] : []; },
    stamps: [{ t: 0.6, text: 'Zzz', x: 230, y: 860, rot: -8, color: '#ffffff', size: 72, dur: 2.0 }, { t: 0.9, text: 'Zzz', x: 850, y: 900, rot: 8, color: '#ffffff', size: 72, dur: 1.8 }],
    act(lt, s) { const cr = s.P.crowd; cr.position.set(0, 0, -0.4); cr.userData.items.forEach((p, i) => { p.rotation.z = (i % 2 ? 1 : -1) * 0.2 * ease(k(lt, 0.2 + (i % 5) * 0.1, 0.7 + (i % 5) * 0.1)); });
      const h = s.hero.userData; place(s.hero, 0.0, 0.75); hug(s, 1.1); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.3 ? { lid: 0, brow: 0.9, browY: 1, look: [0.5, 0.2], mouth: 'o', open: 0.8 } : SLEEP); h.head.rotation.z = lt < 1.3 ? 0 : 0.22; } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.32, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); hold(s, 'pillow', 'R', V(0.42, 0.95, 0.5), -1.0); h.hand('R', 'gu'); h.arm('L', 0.6, 0.2, 1.8); h.hand('L', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) lunch: half of the break is a nap -> 15 minutes to eat
  { sc: 'st', say: ['lunch'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: ['desk', 'clock'], hud: ['ごはん', '15分'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 4.9], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [2.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? (lt < 2.2 ? [{ t: 0.3, text: '昼休み [半分]が昼寝', y: 480, size: 66, border: RED, sub: '60分のうち30分' }]
      : [{ t: 2.2, text: 'ごはん [15分]', y: 480, size: 80, border: RED, sub: '移動・トイレ15分と仮定（試算）' }]) : []; },
    act(lt, s) { const d = s.P.desk; place(d, 0, 0.0); clockAt(s, 0.85, 1.9, -0.6, 1.1, lt, lt > 2.2 ? 10 : 1);
      const h = s.hero.userData; place(s.hero, -0.1, 0.55); const fast = lt > 2.2; const bob = fast ? Math.sin(lt * 22) * 0.04 : 0;
      hold(s, 'rice', 'R', V(0.05, 1.22 + bob, 0.9), 0); h.hand('R', 'gu'); h.arm('L', fast ? 2.4 : 0.4, 0.5, 0.3); h.hand('L', 'pa');
      h.face(!fast ? { lid: 0.3, brow: 0.3, look: [0.6, 0.4], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 9) drivers nap too: trains and buses stop for 30 minutes
  { sc: 'st', say: ['stop'], pre: 0.12, pal: ['#7fd3c0', '#e8faf5', '#ff5a4f'], show: ['train'], hero2: true, hud: ['電車', '30分ストップ'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.0], p1: [0.0, 1.55, 5.6], l0: [0.0, 1.35, -0.3] },
    sfx: [[0.4, 'comic_fall', -13], [2.2, 'text_pa', -10], [2.4, 'comic_surprise', -12]],
    tags(lt) { return lt > 2.2 ? [{ t: 2.2, text: '電車もバスも 30分ストップ', x: 540, y: 1560, h: 92, bg: YEL }] : []; },
    note: '全員が13時に同時に昼寝すると仮定（試算）',
    stamps: [{ t: 0.6, text: 'Zzz', x: 830, y: 760, rot: 8, color: '#ffffff', size: 76, dur: 2.0 }],
    act(lt, s) { const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.62, 0.3, 0.2); place(s.hero2, 0.62, 0.2, -0.2);
      h.reach('R', V(-0.3, 1.9, 0.0)); h.hand('R', 'gu'); h.arm('L', 2.2, 0.6, 0.3); h.hand('L', 'pa');
      h.face(lt < 2.2 ? { lid: 0.2, brow: -0.5, look: [0.7, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 1 });
      h2.reach('L', V(0.68, 2.05, 0.0)); h2.hand('L', 'gu'); h2.arm('R', 0.2, 0.2, 0.2); h2.face(SLEEP); s.hero2.userData.head.rotation.z = -0.3; } },
  // 10) 13:30, 100 million alarm clocks ring at once
  { sc: 'st', say: ['alarm'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#ff5a4f'], show: [], hud: ['目覚まし', '1億個'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 5.6], p1: [0.0, 1.55, 5.2], l0: [0.0, 1.2, 0] }, shake: [[0.9, 0.04, 1.4]],
    sfx: [[0.3, 'text_pa', -10], [0.9, 'comic_shock2', -12], [1.8, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '目覚まし [1億個]', y: 480, size: 74, border: RED, sub: '1人1個と仮定（試算）' }] : []; },
    stamps: [{ t: 0.9, text: 'ジリリリ!!', x: 540, y: 1460, rot: -4, color: RED, size: 84, dur: 1.6 }],
    act(lt, s) { const al = s.P.alarms; al.visible = true; al.position.set(0, 0, 0.0); const ring = lt > 0.9;
      al.userData.items.forEach((c, i) => { c.rotation.z = ring ? Math.sin(lt * 40 + i) * 0.18 : 0; c.position.y = Math.floor(i / 8) * 0.05 + (ring ? Math.abs(Math.sin(lt * 30 + i)) * 0.04 : 0); });
      const h = s.hero.userData; place(s.hero, 0, 0.75); if (!ring) { hug(s, 1.1); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face(SLEEP); h.head.rotation.z = 0.22; }
      else { s.hero.position.y = 0.25 * Math.sin(Math.PI * k(lt, 0.9, 1.3)); h.arm('L', 2.8, 0.7, 0.1); h.arm('R', 2.8, 0.7, 0.1); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0, brow: 1, browY: 1, look: [0, 0.3], mouth: 'o', open: 1 }); } } },
  // 11) good news / bad news: refreshed afternoon / desk marks on the cheek
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#7fa8ff', '#eaf0ff', '#35d0ff'], show: [], hud: ['いい・悪い', 'ニュース'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.6], p1: [0.0, 1.45, 4.0], l0: [0.0, 1.35, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'text_pa', -10], [3.6, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.3 ? [{ t: 0.3, text: '午後は [スッキリ]', y: 480, size: 76, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.3, text: 'ほっぺに [机のあと]', y: 480, size: 70, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.4, text: 'くっきり…', x: 780, y: 1140, rot: 6, color: RED, size: 70, dur: 1.4 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.3);
      if (lt < 2.3) { const kr = s.P.kira; kr.visible = true; kr.position.set(0, 1.5, 0.3); kr.rotation.z = lt * 1.5; kr.scale.setScalar(0.8 + 0.2 * Math.sin(lt * 6));
        h.arm('R', 2.9, 0.4, 0.1); h.arm('L', 2.9, 0.4, 0.1); h.hand('R', 'pa'); h.hand('L', 'pa'); h.face({ lid: 0.5, brow: 0.7, look: [0, 0], mouth: 'smile' }); return; }
      const m = s.P.mark; m.visible = true; m.position.set(-0.27, 1.3, 0.62); m.rotation.set(0, -0.55, 0.15); m.scale.setScalar(1.3);
      h.reach('R', V(-0.05, 1.05, 0.7)); h.hand('R', 'choki'); h.arm('L', 0.3, 0.3, 0.3);
      h.face({ lid: 0.3, brow: -1, browY: 1, look: [-0.5, -0.2], mouth: 'o', open: 0.5 }); } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 770, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1430, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1530, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.3); hug(s, 1.05); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも昼寝が法律で', '[毎日30分]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['昼寝', '毎日30分'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
