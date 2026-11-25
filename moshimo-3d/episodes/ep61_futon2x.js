// ep61_futon2x (pop / arm A 原因を拡大): もしも布団から出るのが毎朝2倍おそくなったら？
// 型は sp_geppu2x / ep60。台本・数字・小道具は自作。
// 前提（試算）:
//   目が覚めてから布団を出るまで 全国平均13.3分（ウェザーニューズ 2010年12月発表・1万1452人）→ 13分から毎朝2倍
//   13→26→52→104(1h44)→208(3h28)→416(6h56)→832(13h52)→1664分(27h44)。7時に目が覚めるとして 5日目10:28・6日目13:56・8日目は翌朝10:44
//   4日目の増分 91分 × 雇用者6,185万人（総務省 労働力調査 2025年平均）= 5.63e9分 = 1.07万年/日
//   体の熱：基礎代謝1,500kcal/日 = 72.6W × 13.87h = 1.01kWh × 31円/kWh（全国家庭電気製品公正取引協議会の目安単価）≈ 31円
//   寝汗：1晩(7時間)約200mlの目安 → 13.87h で約400ml
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl, caps } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep61_futon2x.voice.json', import.meta.url))).json();
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
  // fluffy duvet (kakebuton): top edge at y≈0.26 above its origin
  { const f = G(); rbox(1.6, 0.52, 0.42, 0.2, '#ff9db8', 0, 0, 0, f); const e = caps(0.1, 1.36, '#ffffff', 0, 0.22, 0.12, f); e.rotation.z = Math.PI / 2;
    for (const [x, y] of [[-0.55, -0.05], [-0.2, 0.08], [0.18, -0.08], [0.52, 0.06], [0.0, -0.17]]) sph(0.055, '#ffe1ea', x, y, 0.21, f, 1, 1, 0.35);
    reg('futon', f); }
  // night cap
  { const c = G(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 24), M('#5a7bff')); cone.position.y = 0.26; cone.rotation.z = -0.35; cone.castShadow = true; c.add(cone);
    cyl(0.34, 0.34, 0.09, '#ffffff', 0, 0.02, 0, c); sph(0.08, '#ffffff', 0.2, 0.48, 0, c); reg('cap', c); }
  // day calendar with tear-off pages 1..8 (items[i] = day i+1, front first)
  { const g = G(); rbox(0.78, 0.92, 0.05, 0.04, '#ffffff', 0, 0, 0, g); rbox(0.78, 0.2, 0.06, 0.04, RED, 0, 0.38, 0, g); g.userData.items = [];
    for (let i = 0; i < NP; i++) { const p = plate(0.7, 0.62, 280, 248, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 280, 248); c.fillStyle = i === NP - 1 ? RED : '#2c3b6b';
      c.font = 'bold 150px sans-serif'; c.textAlign = 'center'; c.fillText(String(i + 1), 140, 150); c.font = 'bold 54px sans-serif'; c.fillText('日目', 140, 228); });
      p.position.set(0, -0.08, 0.035 + (NP - i) * 0.002); g.add(p); g.userData.items.push(p); }
    reg('cal', g); }
  // sweat drops
  { const g = G(); g.userData.items = [[-0.42, 0.12], [0.44, 0.05], [0.36, 0.3]].map(([x, y]) => sph(0.05, M('#7fd7ff', 0.2), x, y, 0.2, g, 0.8, 1.2, 0.8)); reg('sweat', g); }
  // zzz letters
  { const g = G(); g.userData.items = [0, 1, 2].map(i => { const p = plate(0.22, 0.22, 96, 96, (c) => { c.fillStyle = '#ffffff'; c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.fillText('Z', 48, 80); }); g.add(p); return p; }); reg('zzz', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const capOn = (s) => { const c = s.P.cap; c.visible = true; s.hero.userData.head.add(c); c.position.set(0, 0.3, -0.02); c.rotation.set(-0.2, 0, 0.1); c.scale.setScalar(1); };
function wallClock(s, h, m, x = 1.0, y = 2.15, z = -1.4, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
// bed + hero wrapped in the duvet up to the chin, hands gripping the top edge
function tuck(s, x = 0, cap = false, hands = true) {
  const b = s.P.bed; b.visible = true; b.position.set(x - 0.1, 0, 0.1); b.rotation.set(0, 0, 0); b.scale.setScalar(1.25);
  place(s.hero, x, 0.15); s.hero.position.y = -0.15;
  const f = s.P.futon; f.visible = true; f.position.set(x, 0.71, 0.4); f.rotation.set(0, 0, 0);
  const h = s.hero.userData; if (cap) capOn(s);
  if (hands) { h.reach('L', V(x - 0.3, 0.98, 0.6)); h.reach('R', V(x + 0.3, 0.98, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu'); }
  return h;
}
function sweat(s, lt, on = true) { const sw = s.P.sweat; sw.visible = on; const hp = s.hero.position; sw.position.set(hp.x, hp.y + 1.48, hp.z);
  sw.userData.items.forEach((d, i) => { d.position.y = [0.12, 0.05, 0.3][i] - ((lt * 0.6 + i * 0.3) % 1) * 0.25; }); }
function zzz(s, lt) { const z = s.P.zzz; z.visible = true; const hp = s.hero.position; z.position.set(hp.x + 0.45, hp.y + 1.7, hp.z + 0.2);
  z.userData.items.forEach((p, i) => { const u = (lt * 0.5 + i / 3) % 1; p.position.set(u * 0.35, u * 0.6, 0); p.scale.setScalar(0.6 + u * 0.8); }); }
// calendar: pages 1..7 fly off between t0 and t1 (leaves "8日目")
function calFly(s, lt, t0, t1, x = 0.82, y = 1.95, z = -1.4) {
  const c = s.P.cal; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(1.15);
  c.userData.items.forEach((p, i) => { const ts = t0 + (t1 - t0) * i / (NP - 1), u = i === NP - 1 ? 0 : k(lt, ts, ts + 0.45);
    p.visible = i === NP - 1 || u < 1; p.position.set(u * (0.9 + i * 0.1), -0.08 + u * 1.1 - u * u * 0.3, 0.035 + (NP - i) * 0.002 + u * 0.8); p.rotation.set(u * 1.2, u * 0.8, -u * (2 + i * 0.4)); });
}
// cold open / recall: hero wrapped in the duvet while 7 days of calendar pages fly off and the clock spins
function coldScene(s, lt, t0) {
  const h = tuck(s, -0.05, true); calFly(s, lt, t0, t0 + 0.9); wallClock(s, 7, lt < t0 ? 0 : (lt - t0) * 900, -1.05, 2.2, -1.4, 1.3);
  return h;
}

const plan = [
  // 0) cold open (flash-forward of #6): calendar pages burst off to "8日目" -> push in to the face peeking out of the duvet: "…あと5分♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.75, 6.4], p1: [-0.05, 1.45, 3.55], l0: [0.0, 1.5, -0.6], l1: [-0.05, 1.3, 0.2], hold: 1.2, dur: 2.1 },
    shake: [[0.1, 0.07, 0.6]], lines: [[0.1, 0.9]],
    sfx: [[0.0, 'countdown_elec', -12], [0.1, 'whoosh_gust', -11], [0.22, 'text_impact', -10], [0.35, 'whoosh_swing', -13], [0.6, 'whoosh_swing', -14], [1.6, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.2, text: '8日目!! まだ布団', x: 540, y: 1540, rot: -6, color: YEL, size: 80, dur: 1.15 },
      { t: 2.2, text: '…あと5分♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.8 }],
    act(lt, s) { const h = coldScene(s, lt, 0.1);
      if (lt < 1.3) h.face({ lid: 0.3, brow: 0.5, look: [0.6, 0.6], mouth: 'smile' });
      else { h.face({ lid: 0.6, brow: 0.7, browY: 0.5, look: [0, 0], mouth: 'smile' }); s.hero.userData.head.rotation.z = 0.14 * ease(k(lt, 1.8, 2.2)); } } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '毎朝2倍!?', x: 800, y: 1090, rot: 8, color: RED, size: 74, dur: 1.1 }],
    act(lt, s) { const h = tuck(s, 0, false, lt > 2.2); zzz(s, lt);
      if (lt < 2.2) { h.arm('L', 0.3, 0.3, 0.3); h.arm('R', 2.6, 0.2, 0.3); h.hand('R', 'pa'); h.face({ lid: 0.9, brow: 0.2, look: [0, 0], mouth: 'o', open: 1 }); }
      else h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 }); } },
  // 2) now 13 min, day 2 26 min
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['布団を出るまで', '13分'],
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.6], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.3, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '今の平均 [13分]', y: 480, size: 72, border: CY, sub: '目覚め→布団を出るまで' }] : []; },
    note: 'ウェザーニューズ 2010年調査（1.1万人）',
    tags(lt) { const t0 = 2.2; return lt > t0 ? [{ t: t0, text: '1日目 13分', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '2日目 26分', x: 770, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = tuck(s, 0); wallClock(s, 7, 13 * ease(k(lt, 0.2, 1.5)) + 13 * ease(k(lt, 2.2, 3.0)));
      h.face(lt < 2.2 ? { lid: 0.4, brow: 0.3, look: [0.5, 0.4], mouth: 'smile' } : { lid: 0.1, brow: 0.6, look: [0, 0], mouth: 'o', open: 0.5 }); } },
  // 3) day 4: 1h44
  { sc: 'st', say: ['day4'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['4日目', '1時間44分'], hudColor: YEL,
    cam: { p0: [0.1, 1.55, 4.8], p1: [0.1, 1.5, 4.4], l0: [0.1, 1.35, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [0.7, 'countdown_tick', -13], [0.3, 'text_pa', -10], [1.9, 'sparkle', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '4日目 [1時間44分]', y: 480, size: 68, border: YEL, sub: '13分×2×2×2（試算）' }] : []; },
    stamps: [{ t: 1.9, text: '二度寝し放題♪', x: 560, y: 1540, rot: -5, color: YEL, size: 70, dur: 1.3 }],
    act(lt, s) { const h = tuck(s, -0.1, true); wallClock(s, 7, 104 * ease(k(lt, 0.2, 1.8)), 0.95); zzz(s, lt);
      h.face(lt < 1.8 ? { lid: 1, brow: 0.3, look: [0, 0], mouth: 'smile' } : { lid: 0.55, brow: 0.8, browY: 0.6, look: [0, 0], mouth: 'smile' }); s.hero.userData.head.rotation.z = Math.sin(lt * 2) * 0.08; } },
  // 4) all workers: 10,000 years of snuggling per day
  { sc: 'st', say: ['japan'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#35d0ff'], show: ['crowd'], hud: ['働く人全員', '6,185万人'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 5.6], p1: [0.0, 1.65, 5.2], l0: [0.0, 1.3, -0.3] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'impact_don', -12], [2.0, 'text_pa', -10]],
    cards(lt) { return lt < 1.9 ? (lt > 0.3 ? [{ t: 0.3, text: '働く人 [6,185万人]', y: 480, size: 68, border: CY, sub: '雇用者（総務省 労働力調査 2025年）' }] : [])
      : [{ t: 1.9, text: '1日で [1万年] 分', y: 480, size: 76, border: YEL, sub: '+91分×6,185万人（試算）' }]; },
    act(lt, s) { const c = s.P.crowd; c.visible = true; c.position.set(0, 0, -0.5);
      c.userData.items.forEach((p, i) => { p.rotation.z = Math.sin(lt * 2 + i) * 0.05; p.position.y = 0; });
      const h = tuck(s, 0, true); zzz(s, lt); h.face(lt < 1.9 ? { lid: 0.8, brow: 0.3, look: [0, 0], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.3], mouth: 'o', open: 0.9 }); } },
  // 5) day 7: 14 h, body heat = 31 yen of electricity
  { sc: 'st', say: ['heat'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#3f6fd8'], show: ['heat', 'coinsA'], hud: ['7日目', '14時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 4.8], p1: [0.0, 1.5, 4.4], l0: [0.15, 1.35, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'coin_toss', -12], [2.1, 'text_pa', -10]],
    cards(lt) { return lt < 1.9 ? (lt > 0.3 ? [{ t: 0.3, text: '体の熱 [1kWh]', y: 480, size: 74, border: YEL, sub: '基礎代謝1,500kcal/日×14時間（試算）' }] : [])
      : [{ t: 1.9, text: '電気代 [31円] 分', y: 480, size: 74, border: YEL, sub: '1kWh＝31円の目安単価で（試算）' }]; },
    act(lt, s) { const h = tuck(s, -0.25); const ht = s.P.heat; ht.position.set(-0.25, 1.15, 0.45); ht.scale.setScalar(1.6);
      ht.userData.items.forEach((m, i) => { m.position.y = ((lt * 0.4 + i * 0.33) % 1) * 0.25; });
      const c = s.P.coinsA; c.position.set(0.42, 0.97, 0.5); c.scale.setScalar(1.4); c.visible = lt > 1.9; c.userData.items.forEach((it, i) => { it.visible = i < 3 && lt > 1.9 + i * 0.15; });
      h.face(lt < 1.9 ? { lid: 0.5, brow: 0.4, look: [0, 0.6], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0.6, -0.4], mouth: 'o', open: 0.8 }); sweat(s, lt, lt < 1.9); } },
  // 6) day 8: 28 h -> the next morning comes first (the cold open, in place)
  { sc: 'st', say: ['next'], pre: 0.12, pal: HOOK, show: [], hud: ['8日目', '28時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.75, 6.4], p1: [0.0, 1.72, 6.0], l0: [0.0, 1.5, -0.6] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.3, 0.8]],
    sfx: [[0.2, 'countdown_elec', -12], [0.3, 'whoosh_gust', -12], [0.5, 'whoosh_swing', -14], [1.6, 'text_pa', -10], [3.0, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '出る前に [次の朝]', y: 480, size: 72, border: YEL, sub: '8日目 27時間44分（試算）' }] : []; },
    act(lt, s) { const h = coldScene(s, lt, 0.3); h.face(lt < 1.5 ? { lid: 0, brow: 0.9, browY: 1, look: [0.7, 0.6], mouth: 'o', open: 1 } : { lid: 0.6, brow: 0.7, look: [0, 0], mouth: 'smile' }); } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.3, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = tuck(s, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) day 5: out at 10:28 -> late
  { sc: 'st', say: ['late'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ff5a4f'], show: [], hero2: true, hud: ['5日目', '10時28分'], hudColor: RED,
    cam: { p0: [0.2, 1.6, 5.4], p1: [0.2, 1.55, 5.0], l0: [0.2, 1.3, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [0.3, 'text_pa', -10], [1.8, 'comic_shock2', -11]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '出るのは [10時28分]', y: 480, size: 66, border: RED, sub: '7時に目が覚めるとして（試算）' }] : []; },
    stamps: [{ t: 1.8, text: '遅刻!!', x: 760, y: 1480, rot: 8, color: RED, size: 84, dur: 1.3 }],
    act(lt, s) { const h = tuck(s, -0.4); wallClock(s, 10, 28, 0.15, 1.85, -1.4, 1.1);
      const h2 = s.hero2.userData; place(s.hero2, 0.78, 0.55, -0.35); h2.face({ lid: 0, brow: 1, browY: -0.5, look: [-0.5, 0], mouth: 'o', open: 0.8 });
      h2.arm('L', 1.3, 0.3, 0.1); h2.hand('L', 'choki'); h2.arm('R', 0.2, 0.5, 1.8); h2.hand('R', 'gu');
      h.face(lt < 1.8 ? { lid: 0.5, brow: 0.3, look: [0.6, 0.3], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 1 }); } },
  // 9) day 6: 2 pm, no breakfast, no lunch
  { sc: 'st', say: ['meal'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: ['desk', 'bowl', 'onigiri'], hud: ['6日目', '午後2時'], hudColor: RED,
    cam: { p0: [0.25, 1.55, 5.0], p1: [0.25, 1.5, 4.6], l0: [0.25, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'comic_fall', -12], [2.6, 'comic_stupid', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '朝も昼も [ごはん抜き]', y: 480, size: 64, border: RED, sub: '出るのは13時56分（試算）' }] : []; },
    act(lt, s) { const h = tuck(s, -0.35, false, false); wallClock(s, 2, 0, 0.95, 1.8, -1.4, 1.0);
      const d = s.P.desk; place(d, 0.95, 0.35); const b = s.P.bowl; b.position.set(0.85, 0.77, 0.35); b.scale.setScalar(1.3);
      const o = s.P.onigiri; o.position.set(1.12, 0.84, 0.3); o.scale.setScalar(1.4); o.userData.items.forEach((it, i) => { it.visible = i < 1; }); o.userData.items[0].position.set(0, 0, 0);
      h.reach('L', V(-0.65, 0.98, 0.6)); h.hand('L', 'gu'); h.reach('R', V(0.55 + 0.05 * Math.sin(lt * 6), 1.15, 0.5)); h.hand('R', 'pa');
      h.face({ lid: 0.1, brow: -0.8, browY: 1, look: [0.8, -0.2], mouth: 'o', open: 0.6 }); } },
  // 10) night sweat 400 ml
  { sc: 'st', say: ['sweat'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#3f6fd8'], show: ['bottle'], hud: ['寝汗', '400ml'], hudColor: RED,
    cam: { p0: [0.1, 1.55, 4.8], p1: [0.1, 1.5, 4.4], l0: [0.15, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.7, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '寝汗 [400ml]', y: 480, size: 74, border: RED, sub: '1晩約200mlの目安×2（試算）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: 'ふつう 200ml', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '7日目 400ml', x: 770, y: 1560, h: 100, bg: RED, fg: '#ffffff' }] : []; },
    act(lt, s) { const h = tuck(s, -0.2); sweat(s, lt); const bt = s.P.bottle; bt.position.set(0.85, 0, 0.75); bt.scale.setScalar(2.0);
      h.face({ lid: 0.4, brow: -0.8, browY: 1, look: [0.3, 0.2], mouth: 'o', open: 0.5 }); s.hero.userData.body.rotation.z = Math.sin(lt * 3) * 0.03; } },
  // 11) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#35d0ff'], show: [], hud: ['布団の', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 4.8], p1: [0.0, 1.5, 4.5], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.7, 'text_pa', -10], [3.5, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.6 ? (lt > 0.3 ? [{ t: 0.3, text: 'ずっと [ぬくぬく]', y: 480, size: 72, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.6, text: '[トイレ] が限界', y: 480, size: 72, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.4, text: 'もじもじ…', x: 760, y: 1120, rot: 6, color: RED, size: 72, dur: 1.4 }],
    act(lt, s) { const h = tuck(s, 0, lt < 2.6);
      if (lt < 2.6) h.face({ lid: 0.7, brow: 0.5, look: [0, 0], mouth: 'smile' });
      else { s.hero.position.x = Math.sin(lt * 14) * 0.04; s.hero.userData.body.rotation.z = Math.sin(lt * 14) * 0.06; h.reach('L', V(-0.3, 0.98, 0.6)); h.reach('R', V(0.3, 0.98, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu');
        h.face({ lid: 0.2, brow: -1, browY: 1, look: [0, -0.3], mouth: 'o', open: 0.4 }); } } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '出たくない', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: 'すぐ出る', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = tuck(s, -0.05, true); h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); s.hero.userData.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも布団から出るのが', '毎朝[2倍]おそくなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['布団から出る', '毎朝×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
