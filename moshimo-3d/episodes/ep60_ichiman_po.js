// ep60_ichiman_po (pop / arm B 生活ルール改変): もしも全員が毎日1万歩歩く決まりになったら？
// 型は sp_geppu2x / ep59。台本・数字・小道具は自作。
// 前提（試算）:
//   今の平均歩数 6,278歩（20歳以上・厚労省 国民健康・栄養調査 令和元年=2019、健康日本21(第三次)資料）→ 1万歩まで +3,722歩
//   歩幅0.7m・1分100歩 → +2.6km / +37分（1日）、1年で 951km（東京〜福岡 直線約880km）、226時間＝9.4日
//   消費：歩行3.5METs、体重60kg、(3.5-1)×60×(37.2/60)h×1.05 ≈ 98kcal/日 → 年3.57万kcal ÷ 7,200kcal/kg ≈ 脂肪5kg分
//   日本じゅう：20歳以上 約1.05億人 × 2.6km = 2.7億km/日 ＞ 地球〜太陽 1.5億km（約1.8倍）
//   靴：1万歩=7km/日 → 年2,555km ÷ 1足約700km（交換の目安）≈ 3.6足 → 約4足
//   65歳以上：男性5,396歩・女性4,656歩（同調査）→ 1万歩は 1.85〜2.15倍 → ほぼ2倍
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep60_ichiman_po.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#7fd0ff', '#eef8ff', '#ffd23a'];
const SUNP = V(0.55, 3.2, -1.9);
const N = 30;

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }
function signPlate(txt, col) { return plate(1.1, 0.44, 440, 176, (c) => { c.fillStyle = col; c.beginPath(); c.roundRect(4, 4, 432, 168, 24); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.stroke();
  c.fillStyle = '#ffffff'; c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.fillText(txt, 220, 118); }); }

function sneaker(col, parent) {
  const g = G(); rbox(0.2, 0.05, 0.42, 0.025, '#ffffff', 0, 0.025, 0, g); rbox(0.18, 0.11, 0.3, 0.05, col, 0, 0.1, -0.05, g);
  sph(0.09, col, 0, 0.07, 0.11, g, 1, 0.7, 1.1); rbox(0.12, 0.02, 0.12, 0.01, '#ffffff', 0, 0.16, 0.02, g); if (parent) parent.add(g); return g;
}
const curve = (u) => { const a = V(0.05, 0.03, 1.1), b = V(1.3, 0.3, 0.3); const p = a.clone().lerp(b, u).lerp(b.clone().lerp(SUNP, u), u); return p; };

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // footprint trail into the sky
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < N; i++) { const u = (i + 1) / N, p = curve(u), q = curve(Math.min(1, u + 0.01)); const f = G();
      sph(0.12, i % 2 ? '#ffffff' : '#fff2a8', 0, 0, 0.06, f, 0.8, 0.18, 1.1); sph(0.08, i % 2 ? '#ffffff' : '#fff2a8', 0, 0, -0.14, f, 0.85, 0.18, 0.8);
      const side = (i % 2 ? 1 : -1) * 0.13; f.position.copy(p).add(V(side, 0, 0)); f.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + Math.PI; f.scale.setScalar(1 + u * 1.6);
      g.add(f); g.userData.items.push(f); }
    reg('trail', g); }
  // sneakers
  { const g = G(); const cols = ['#ff5a4f', '#35d0ff', '#7bd88f', '#ffd23a']; g.userData.items = cols.map((c, i) => sneaker(c, g)); reg('shoes', g); }
  { const g = G(); sneaker('#ff5a4f', g); reg('shoe1', g); }
  // signpost
  { const g = G(); cyl(0.035, 0.035, 1.6, '#9aa3ad', 0, 0.8, 0, g); const b = signPlate('福岡 →', '#3aa76d'); b.position.set(0, 1.55, 0.04); g.add(b); reg('sign', g); }
  // calendar "9日"
  { const g = G(); rbox(0.9, 1.0, 0.06, 0.04, '#ffffff', 0, 0, 0, g); rbox(0.9, 0.24, 0.07, 0.04, RED, 0, 0.38, 0, g);
    const t = plate(0.8, 0.66, 320, 264, (c) => { c.fillStyle = '#2c3b6b'; c.font = 'bold 190px sans-serif'; c.textAlign = 'center'; c.fillText('9日', 160, 205); }); t.position.set(0, -0.1, 0.04); g.add(t); reg('cal', g); }
  // cane
  { const g = G(); cyl(0.025, 0.025, 0.9, '#8a5a2b', 0, 0.45, 0, g); const h = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 8, 16, Math.PI), M('#8a5a2b')); h.position.set(0.07, 0.9, 0); g.add(h); reg('cane', g); }
  // sweat drops
  { const g = G(); g.userData.items = [[-0.42, 0.12], [0.44, 0.05], [0.36, 0.3]].map(([x, y]) => sph(0.05, M('#7fd7ff', 0.2), x, y, 0.2, g, 0.8, 1.2, 0.8)); reg('sweat', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
function walk(h, o, lt, sp = 9, a = 0.7) { // in-place walking: bob + arm swing
  const w = Math.sin(lt * sp); h.body.position.y = Math.abs(w) * 0.05; h.body.rotation.z = w * 0.04;
  h.arm('L', w * a, 0.15, 0.6); h.arm('R', -w * a, 0.15, 0.6); h.hand('L', 'gu'); h.hand('R', 'gu');
}
function sweat(s, who, lt, on = true) { const sw = s.P.sweat; sw.visible = on; const hp = who.position; sw.position.set(hp.x, hp.y + 1.48, hp.z); sw.rotation.y = who.rotation.y;
  sw.userData.items.forEach((d, i) => { d.position.y = [0.12, 0.05, 0.3][i] - ((lt * 0.6 + i * 0.3) % 1) * 0.25; }); }

// cold open / recall: one stomp -> footprints shoot up to the sun
function coldScene(s, lt, t0) {
  const h = s.hero.userData; place(s.hero, -0.3, 0.7, 0.45);
  const sun = s.P.sun; sun.visible = true; sun.position.copy(SUNP); sun.scale.setScalar(1.2 * (1 + 0.12 * Math.max(0, Math.sin((lt - t0 - 0.6) * 9)) * (lt > t0 + 0.6 && lt < t0 + 1.2)));
  const u = ease(k(lt, t0, t0 + 0.7)); const tr = s.P.trail; tr.visible = true;
  tr.userData.items.forEach((f, i) => { f.visible = (i + 1) / N <= u + 0.001; });
  if (lt < t0) { h.face({ lid: 0.2, brow: 0.5, look: [0.4, 0.3], mouth: 'smile' }); walk(h, s.hero, lt); return false; }
  return true;
}

const plan = [
  // 0) cold open (flash-forward of #6)
  { sc: 'st', say: [], pre: 0, hold: 2.8, pal: HOOK, show: [],
    cam: { p0: [0.1, 1.9, 8.4], p1: [-0.3, 1.52, 3.75], l0: [0.15, 2.0, -1.0], l1: [-0.3, 1.42, 0.7], hold: 1.15, dur: 1.9 },
    shake: [[0.12, 0.07, 0.6]], lines: [[0.12, 0.8]],
    sfx: [[0.0, 'giant_step', -10], [0.08, 'whoosh_gust', -11], [0.25, 'text_impact', -11], [0.8, 'sparkle', -13], [1.5, 'whoosh_slide', -13], [2.2, 'comic_boyon', -11]],
    stamps: [{ t: 0.2, text: '1日で太陽まで!!', x: 540, y: 1520, rot: -6, color: YEL, size: 82, dur: 1.1 },
      { t: 2.1, text: '…あと1歩♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.8 }],
    act(lt, s) {
      const on = coldScene(s, lt, 0.05); const h = s.hero.userData; if (!on) return;
      if (lt < 1.3) { h.arm('L', 0.3, 0.5, 0.4); h.reach('R', V(0.2, 2.4, 0.2)); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.7, 0.8], mouth: 'o', open: 1 }); }
      else { s.hero.rotation.y = 0.45 * (1 - ease(k(lt, 1.3, 1.8))); h.arm('L', 0.2, 0.3, 0.5); h.arm('R', 0.5, 0.3, 1.9); h.hand('R', 'choki');
        h.face({ lid: 0.45, brow: 0.1, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.8, 2.2)); sweat(s, s.hero, lt); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.0, 'giant_step', -15], [1.5, 'giant_step', -15], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '1万歩!?', x: 790, y: 1090, rot: 8, color: RED, size: 76, dur: 1.1 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.4, 0); walk(h, s.hero, lt);
      h.face(lt < 2.2 ? { lid: 0.2, brow: 0.3, look: [0, 0], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 }); } },
  // 2) average 6,278 -> 3,722 more
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hero2: true, hud: ['1日の歩数', '1万歩'],
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'text_pa', -10], [2.7, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '今の平均 [6,278歩]', y: 480, size: 70, border: CY, sub: '20歳以上（厚労省 2019）' }] : []; },
    tags(lt) { const t0 = 2.3; return lt > t0 ? [{ t: t0, text: 'ふつう 6,278', x: 300, y: 1160, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あと +3,722', x: 770, y: 1160, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, 0.62, 0.4, -0.4); place(s.hero2, -0.62, 0.4, 0.4); s.hero2.visible = true;
      h2.face({ lid: 0.3, brow: 0.2, look: [0.4, 0], mouth: 'smile' }); h2.arm('L', 0.2, 0.3, 0.4); h2.arm('R', 0.6, 0.3, 1.2); h2.hand('R', 'pa');
      if (lt < 2.3) { h.face({ lid: 0.2, brow: 0.3, look: [-0.5, 0], mouth: 'o', open: 0.4 }); h.arm('L', 0.6, 0.3, 1.2); h.hand('L', 'pa'); }
      else { walk(h, s.hero, lt, 12); h.face({ lid: 0, brow: -0.6, browY: 1, look: [0, 0], mouth: 'o', open: 0.8 }); } } },
  // 3) +37 min, +2.6 km per day
  { sc: 'st', say: ['time'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['clock'], hud: ['よけいに', '+37分'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.5], l0: [0.1, 1.4, 0] },
    sfx: [[0.1, 'countdown_tick', -13], [0.6, 'countdown_tick', -13], [0.3, 'text_pa', -10], [1.6, 'text_pa', -10]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1日 [+37分] [+2.6km]', y: 480, size: 66, border: YEL, sub: '歩幅70cm・1分100歩として（試算）' }] : []; },
    act(lt, s) { const c = s.P.clock; c.visible = true; c.position.set(0.9, 1.95, -0.8); c.scale.setScalar(1.3); const m = 37 * ease(k(lt, 0.2, 2.2));
      c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(7 + m / 60) / 12 * Math.PI * 2;
      const h = s.hero.userData; place(s.hero, -0.4, 0.45, 0.3); walk(h, s.hero, lt, 11); h.face({ lid: 0.3, brow: 0.4, look: [0.6, 0.4], mouth: 'flat' }); } },
  // 4) 950 km a year, farther than Fukuoka
  { sc: 'st', say: ['year'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['sign'], hud: ['1年で', '950km'], hudColor: YEL,
    cam: { p0: [0.3, 1.6, 5.2], p1: [0.3, 1.55, 4.8], l0: [0.3, 1.35, -0.5] },
    sfx: [[0.3, 'text_pa', -10], [1.8, 'whoosh_slide', -13], [2.2, 'text_pa', -10]],
    cards(lt) { return lt < 1.8 ? (lt > 0.3 ? [{ t: 0.3, text: '1年で [950km]', y: 480, size: 74, border: YEL, sub: '2.6km×365日（試算）' }] : [])
      : [{ t: 1.8, text: '東京→[福岡] より遠い', y: 480, size: 66, border: YEL, sub: '直線で約880km' }]; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.3, 0.5, 0.6); walk(h, s.hero, lt, 10); place(s.P.sign, 0.75, -1.0, -0.3);
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.5, look: [0.4, 0], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.3], mouth: 'o', open: 1 }); } },
  // 5) 100 kcal / 5 kg of fat
  { sc: 'st', say: ['kcal'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#35d0ff'], show: ['onigiri', 'scale'], hud: ['消費', '+100kcal'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.1, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [2.5, 'sparkle', -14]],
    cards(lt) { return lt < 2.1 ? (lt > 0.3 ? [{ t: 0.3, text: '1日 [100kcal]', y: 480, size: 74, border: CY, sub: 'おにぎり約半分・体重60kg（試算）' }] : [])
      : [{ t: 2.1, text: '1年で脂肪 [5kg]分', y: 480, size: 70, border: CY, sub: '脂肪1kg≒7,200kcalとして（試算）' }]; },
    act(lt, s) { const o = s.P.onigiri; o.visible = true; o.position.set(0.55, 1.0, 0.4); o.scale.setScalar(2.2); o.userData.items.forEach((it, i) => { it.visible = i < 1; }); o.userData.items[0].position.set(0, 0.08, 0);
      const d = s.P.scale; place(d, -0.35, 0.65); d.scale.setScalar(1.6);
      const h = s.hero.userData; place(s.hero, -0.35, 0.45, 0.2); s.hero.position.y = 0.1; h.reach('R', o.position.clone().add(V(-0.1, 0.2, 0.1))); h.hand('R', 'pa');
      h.arm('L', 0.3, 0.4, 1.0); h.face(lt < 2.1 ? { lid: 0.3, brow: 0.3, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, -0.5], mouth: 'o', open: 0.9 }); } },
  // 6) all of Japan -> reaches the sun in one day (the cold open, in place)
  { sc: 'st', say: ['sun'], pre: 0.12, pal: HOOK, show: [], hud: ['日本じゅう', '2.7億km'], hudColor: YEL,
    cam: { p0: [0.1, 1.9, 8.4], p1: [0.1, 1.9, 7.9], l0: [0.15, 2.0, -1.0] },
    sfx: [[0.3, 'giant_step', -11], [0.35, 'whoosh_gust', -12], [1.2, 'text_pa', -10], [3.2, 'sparkle', -13]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '1日で [太陽] まで', y: 480, size: 72, border: YEL, sub: '1.05億人×2.6km＝2.7億km（試算）' }] : []; },
    note: '地球〜太陽は約1.5億km',
    act(lt, s) { const on = coldScene(s, lt, 0.3); const h = s.hero.userData; if (!on) return;
      h.arm('L', 0.3, 0.5, 0.4); h.reach('R', V(0.2, 2.4, 0.3)); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.7, 0.8], mouth: 'o', open: 1 }); } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.6], p1: [0, 1.48, 3.0], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) 4 pairs of sneakers a year
  { sc: 'st', say: ['shoes'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['shoes'], hud: ['スニーカー', '年4足'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 4.8], p1: [0.0, 1.5, 4.5], l0: [0.1, 1.3, 0] },
    sfx: [[0.4, 'impact_don', -13], [0.7, 'impact_don', -13], [1.0, 'impact_don', -13], [1.3, 'impact_don', -13], [1.5, 'text_pa', -10], [2.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: 'スニーカー [年4足]', y: 480, size: 70, border: RED, sub: '1日7km、1足約700kmで交換（目安）' }] : []; },
    act(lt, s) { const g = s.P.shoes; g.visible = true; g.position.set(0.75, 0, 0.1);
      g.userData.items.forEach((o, i) => { const t0 = 0.3 + i * 0.3, u = ease(k(lt, t0, t0 + 0.3)); o.position.set(0, i * 0.16 + (1 - u) * 3, 0); o.rotation.y = i * 0.7; o.visible = lt > t0; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.4, 0.3); h.reach('R', V(0.55, 0.85, 0.3)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.6, 1.6); h.hand('L', 'pa');
      h.face(lt < 1.5 ? { lid: 0, brow: 0.6, look: [0.6, 0.6], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0.4, -0.2], mouth: 'o', open: 1 }); } },
  // 9) 226 hours = 9 whole days
  { sc: 'st', say: ['hours'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ff5a4f'], show: ['clock', 'cal'], hud: ['歩く時間', '年226時間'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.5], l0: [0.1, 1.4, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [0.7, 'countdown_tick', -13], [0.4, 'text_pa', -10], [2.6, 'impact_don', -12], [2.7, 'text_pa', -10]],
    cards(lt) { return lt < 2.5 ? (lt > 0.3 ? [{ t: 0.3, text: '1年で [226時間]', y: 480, size: 72, border: RED, sub: '37分×365日（試算）' }] : [])
      : [{ t: 2.5, text: 'まる [9日] 分', y: 480, size: 76, border: RED, sub: '寝ないで歩きつづけて' }]; },
    act(lt, s) { const c = s.P.clock; c.visible = true; c.position.set(0.95, 2.15, -0.8); c.scale.setScalar(1.0); c.rotation.z = 0;
      c.userData.mh.rotation.z = -lt * 6; c.userData.hh.rotation.z = -lt * 0.5;
      const cal = s.P.cal; cal.visible = lt > 2.5; cal.position.set(0.95, 1.05, -0.6); cal.scale.setScalar(0.4 + 0.6 * ease(k(lt, 2.5, 2.8)));
      const h = s.hero.userData; place(s.hero, -0.45, 0.45, 0.25); walk(h, s.hero, lt, 7, 0.4); sweat(s, s.hero, lt);
      h.face({ lid: 0.55, brow: -0.7, browY: 1, look: [0.5, 0.3], mouth: 'o', open: 0.5 }); } },
  // 10) 65+ : nearly double
  { sc: 'st', say: ['elder'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: ['cane'], hero2: true, hud: ['65歳以上', 'ほぼ2倍'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.8, 'text_pa', -10], [2.3, 'comic_fall', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '65歳以上は [ほぼ2倍]', y: 480, size: 68, border: RED, sub: '今 男性5,396歩・女性4,656歩' }] : []; },
    note: '厚労省 国民健康・栄養調査 2019',
    tags(lt) { const t0 = 1.7; return lt > t0 ? [{ t: t0, text: '今 4,656', x: 300, y: 1160, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '→ 10,000', x: 770, y: 1160, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero2, -0.65, 0.4, 0.35); s.hero2.visible = true; place(s.hero, 0.65, 0.4, -0.4);
      walk(h2, s.hero2, lt, 6, 0.3); const cn = s.P.cane; cn.visible = true; const hp = s.hero2.position; cn.position.set(hp.x + 0.42, 0, hp.z + 0.15);
      h2.reach('R', cn.position.clone().add(V(0.07, 0.93, 0))); h2.hand('R', 'gu'); sweat(s, s.hero2, lt);
      h2.face({ lid: 0.5, brow: -0.8, browY: 1, look: [0.3, 0.3], mouth: 'o', open: 0.5 });
      h.face({ lid: 0, brow: -0.5, browY: 1, look: [-0.6, 0], mouth: 'o', open: 0.6 }); h.arm('R', 0.7, 0.3, 1.2); h.hand('R', 'pa'); h.arm('L', 0.2, 0.3, 0.4); } },
  // 11) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#35d0ff'], show: [], hud: ['1万歩の', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 4.8], p1: [0.0, 1.5, 4.5], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.2, 'text_pa', -10], [3.3, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.1 ? (lt > 0.3 ? [{ t: 0.3, text: '体は [ぽかぽか]', y: 480, size: 72, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.1, text: '[おなか] がすく', y: 480, size: 72, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.2, text: 'ぐぅ〜', x: 780, y: 1120, rot: 6, color: RED, size: 76, dur: 1.4 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.4, 0);
      if (lt < 2.1) { walk(h, s.hero, lt, 9); h.face({ lid: 0.5, brow: 0.3, look: [0, 0], mouth: 'smile' }); }
      else { const b = s.hero.position.clone().add(V(0, 0.75, 0.32)); h.reach('L', b.clone().add(V(-0.1, 0, 0))); h.reach('R', b.clone().add(V(0.1, 0.02, 0))); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.body.rotation.x = 0.12; h.face({ lid: 0.6, brow: -0.9, browY: 1, look: [0, -0.3], mouth: 'o', open: 0.5 }); } } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '歩ける', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: 'ムリ', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      walk(h, s.hero, lt, 8, 0.4); h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも全員が毎日', '[1万歩]歩く決まりになったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['1日の歩数', '1万歩'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
