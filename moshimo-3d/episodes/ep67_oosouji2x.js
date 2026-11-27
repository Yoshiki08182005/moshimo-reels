// ep67_oosouji2x (pop / arm C ニュース起点：年末の大掃除シーズン): もしも大掃除のゴミが毎日2倍に増えたら？
// 型は sp_geppu2x / ep66。台本・数字・小道具は自作。
// 前提（試算）:
//   1日目 45Lのゴミ袋1袋（1袋4kgと仮定）→ 毎日2倍。n日目 = 2^(n-1) 袋
//   4日目 8袋 32kg ÷ 家庭系ごみ 466g/人日（環境省 2024年度）= 69日 ≒ 2か月分
//   8日目 128袋 512kg ÷ (466g×365=170kg/年) = 3.0年分
//   11日目 1024袋 4.1t ÷ 収集車2t積み = 2台 / 1袋1分で運ぶ → 17時間
//   15日目 16,384袋 × 1枚50円（仮定）= 82万円
//   26日目 33,554,432袋 × 45L = 151万㎥ > 東京ドーム約124万㎥ / 13.4万t > 日本のごみ 3,811万t÷365 = 10.4万t/日
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl, caps } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep67_oosouji2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#9fd8ff', '#fff6e2', '#ffd23a'];
const DAYS = [1, 2, 4, 8, 11, 15, 20, 26];
const NP = DAYS.length;
const BAG = M('#dfe9f0', 0.3), KNOT = M('#ffc533', 0.5);

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }
// one 45L garbage bag (origin = bottom)
function makeBag(parent, x = 0, y = 0, z = 0, s = 1) {
  const g = G(); sph(0.2, BAG, 0, 0.2, 0, g, 1, 1.05, 0.9); sph(0.07, KNOT, 0, 0.42, 0, g, 1, 0.7, 1);
  sph(0.045, KNOT, -0.05, 0.48, 0, g, 0.7, 1.2, 0.7); sph(0.045, KNOT, 0.05, 0.48, 0, g, 0.7, 1.2, 0.7);
  g.position.set(x, y, z); g.scale.setScalar(s); if (parent) parent.add(g); return g;
}

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // single bag (held)
  reg('gbag', makeBag(null));
  // pile: 91 bags, bottom layer first (6x6, 5x5 ... 1)
  { const g = G(); g.userData.items = []; g.userData.bh = [];
    for (let L = 0; L < 6; L++) { const w = 6 - L; for (let i = 0; i < w; i++) for (let j = 0; j < w; j++) {
      const x = (i - (w - 1) / 2) * 0.4 + Math.sin(L * 3 + i * 1.7 + j) * 0.03, z = (j - (w - 1) / 2) * 0.4, y = L * 0.34;
      const b = makeBag(g, x, y, z); b.rotation.y = Math.sin(i * 2.1 + j * 1.3 + L) * 0.6; b.rotation.z = Math.sin(i + j * 2.7) * 0.12;
      g.userData.items.push(b); g.userData.bh.push([x, y, z]); } }
    reg('pile', g); }
  // garbage truck (cab right, packer box left), origin = floor
  { const g = G(); const BL = '#3a8fd8', W = '#ffffff';
    rbox(0.7, 0.75, 0.86, 0.1, W, 0.85, 0.62, 0, g); rbox(0.5, 0.3, 0.88, 0.05, '#9fd2ff', 0.95, 0.82, 0, g);
    rbox(1.45, 0.95, 0.9, 0.12, BL, -0.25, 0.75, 0, g); rbox(1.47, 0.12, 0.92, 0.04, W, -0.25, 0.6, 0, g);
    for (const x of [-0.65, 0.8]) for (const z of [-0.43, 0.43]) { const w = cyl(0.2, 0.2, 0.14, '#2a2d34', x, 0.2, z, g); w.rotation.x = Math.PI / 2; }
    g.userData.items = [makeBag(g, -0.8, 1.05, 0.15, 0.9), makeBag(g, -0.55, 1.15, -0.2, 0.9), makeBag(g, -0.95, 0.95, -0.25, 0.85), makeBag(g, -0.3, 1.2, 0.1, 0.9)];
    reg('truck', g); }
  // big white dome (generic stadium shape)
  { const g = G(); const d = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), M('#f4f6fa', 0.5)); d.scale.set(1.6, 0.55, 1.6); d.position.y = 0.4; g.add(d);
    cyl(1.62, 1.62, 0.4, '#c7ced8', 0, 0.2, 0, g); reg('dome', g); }
  // feather duster
  { const g = G(); cyl(0.02, 0.02, 0.55, '#a8744a', 0, -0.2, 0, g); sph(0.12, '#ffb3d0', 0, 0.12, 0, g, 1, 1.4, 1); sph(0.09, '#ffe08a', 0.06, 0.2, 0.03, g); reg('duster', g); }
  // calendar with day labels
  { const g = G(); rbox(0.78, 0.92, 0.05, 0.04, '#ffffff', 0, 0, 0, g); rbox(0.78, 0.2, 0.06, 0.04, RED, 0, 0.38, 0, g); g.userData.items = [];
    for (let i = 0; i < NP; i++) { const p = plate(0.7, 0.62, 280, 248, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 280, 248); c.fillStyle = i === NP - 1 ? RED : '#2c3b6b';
      c.font = 'bold 150px sans-serif'; c.textAlign = 'center'; c.fillText(String(DAYS[i]), 140, 150); c.font = 'bold 54px sans-serif'; c.fillText('日目', 140, 228); });
      p.position.set(0, -0.08, 0.035 + (NP - i) * 0.002); g.add(p); g.userData.items.push(p); }
    reg('cal', g); }
  // collection-point sign
  { const g = G(); cyl(0.03, 0.03, 1.2, '#9aa3ad', 0, 0.6, 0, g);
    const p = plate(0.9, 0.6, 360, 240, (c) => { c.fillStyle = '#2f9a5a'; c.fillRect(0, 0, 360, 240); c.fillStyle = '#ffffff'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center';
      c.fillText('ゴミ収集', 180, 95); c.font = 'bold 48px sans-serif'; c.fillText('年末年始は休み', 180, 185); });
    p.position.set(0, 1.45, 0.04); g.add(p); rbox(0.94, 0.64, 0.05, 0.02, '#ffffff', 0, 1.45, 0, g); reg('sign', g); }
  // sweat drops / sparkles
  { const g = G(); g.userData.items = [[-0.42, 0.12], [0.44, 0.05], [0.36, 0.3]].map(([x, y]) => sph(0.05, M('#7fd7ff', 0.2), x, y, 0.2, g, 0.8, 1.2, 0.8)); reg('sweat', g); }
  { const g = G(); g.userData.items = [0, 1, 2, 3, 4].map(i => { const p = plate(0.3, 0.3, 96, 96, (c) => { c.fillStyle = '#fff6a0'; c.font = 'bold 90px sans-serif'; c.textAlign = 'center'; c.fillText('✦', 48, 82); }); g.add(p); return p; }); reg('kira', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
function wallClock(s, h, m, x = 1.0, y = 2.15, z = -1.4, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
// hero stands at x, holding one bag in the viewer's right hand (R) and maybe a duster in L
function stand(s, x = 0, bag = true, duster = false) {
  place(s.hero, x, 0.2); const h = s.hero.userData;
  if (bag) { const b = s.P.gbag; b.visible = true; b.position.set(x + 0.5, 0.42, 0.45); b.rotation.set(0, 0.3, 0.1); h.reach('R', V(x + 0.5, 0.9, 0.45)); h.hand('R', 'gu'); }
  if (duster) { const d = s.P.duster; d.visible = true; d.position.set(x - 0.5, 1.15, 0.5); d.rotation.set(0, 0, 0.35); h.reach('L', V(x - 0.5, 0.95, 0.5)); h.hand('L', 'gu'); }
  return h;
}
// show the first n bags of the pile; drop-in animation from t0..t1 for bags n0..n
function pile(s, lt, n, x, z, sc = 1, n0 = n, t0 = 0, t1 = 0) {
  const g = s.P.pile; g.visible = true; g.position.set(x, 0, z); g.scale.setScalar(sc);
  g.userData.items.forEach((b, i) => { b.visible = i < n; const [hx, hy, hz] = g.userData.bh[i];
    let u = 1; if (i >= n0 && n > n0) { const ts = t0 + (t1 - t0) * (i - n0) / Math.max(1, n - n0); u = ease(k(lt, ts, ts + 0.3)); b.visible = b.visible && lt >= ts; }
    b.position.set(hx, hy + (1 - u) * 5, hz); });
}
function sweat(s, lt, on = true) { const sw = s.P.sweat; sw.visible = on; const hp = s.hero.position; sw.position.set(hp.x, hp.y + 1.48, hp.z);
  sw.userData.items.forEach((d, i) => { d.position.y = [0.12, 0.05, 0.3][i] - ((lt * 0.6 + i * 0.3) % 1) * 0.25; }); }
function kira(s, lt, x, y, z) { const g = s.P.kira; g.visible = true; g.position.set(x, y, z);
  g.userData.items.forEach((p, i) => { const a = i * 1.26 + lt * 0.8; p.position.set(Math.cos(a) * 0.7, Math.sin(a * 1.3) * 0.4 + 0.2, 0.3); p.scale.setScalar(0.5 + 0.5 * Math.abs(Math.sin(lt * 3 + i))); }); }
function calFly(s, lt, t0, t1, x = 1.05, y = 2.1, z = -1.6) {
  const c = s.P.cal; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(1.0);
  c.userData.items.forEach((p, i) => { const ts = t0 + (t1 - t0) * i / (NP - 1), u = i === NP - 1 ? 0 : k(lt, ts, ts + 0.45);
    p.visible = i === NP - 1 || u < 1; p.position.set(u * (0.9 + i * 0.1), -0.08 + u * 1.1 - u * u * 0.3, 0.035 + (NP - i) * 0.002 + u * 0.8); p.rotation.set(u * 1.2, u * 0.8, -u * (2 + i * 0.4)); });
}
function calDay(s, d, x = -0.85, y = 2.1) { const c = s.P.cal; c.visible = true; c.position.set(x, y, -1.4); c.scale.setScalar(0.9); const idx = DAYS.indexOf(d);
  c.userData.items.forEach((p, i) => { p.visible = i >= idx; p.position.set(0, -0.08, 0.035 + (NP - i) * 0.002); p.rotation.set(0, 0, 0); }); }
// cold open / recall: a mountain of bags crashes down behind the hero, the truck gets bounced away, calendar to day 26
function coldScene(s, lt, t0) {
  const h = stand(s, 0.05, false, true);
  pile(s, lt, 91, -0.1, -2.6, 2.3, 0, t0, t0 + 0.5);
  const tr = s.P.truck; tr.visible = true; const u = ease(k(lt, t0 + 0.35, t0 + 1.3));
  tr.position.set(1.9 + u * 3.5, u * 3.2 - u * u * 0.8, -0.9 - u * 1.5); tr.rotation.set(u * 0.6, -0.3, -u * 2.2); tr.scale.setScalar(0.9);
  calFly(s, lt, t0, t0 + 0.9, -1.35, 2.3, -1.0);
  kira(s, lt, 0.05, 1.5, 0.1);
  return h;
}

const plan = [
  // 0) cold open: bags rain into a mountain, truck bounces away -> push in on the face with a duster: "…ピカピカ♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 2.0, 7.4], p1: [0.05, 1.32, 3.5], l0: [0.0, 1.8, -1.0], l1: [0.05, 1.2, 0.2], hold: 1.2, dur: 2.1 },
    shake: [[0.1, 0.08, 0.7]], lines: [[0.1, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -10], [0.15, 'impact_doon', -10], [0.22, 'text_impact', -10], [0.45, 'comic_fall', -12], [0.6, 'whoosh_swing', -14], [1.6, 'whoosh_slide', -13], [2.3, 'sparkle', -11]],
    stamps: [{ t: 0.2, text: 'ゴミ袋 3355万袋!!', x: 540, y: 1540, rot: -6, color: YEL, size: 78, dur: 1.15 },
      { t: 2.2, text: '…ピカピカ♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.8 }],
    act(lt, s) { const h = coldScene(s, lt, 0.1);
      if (lt < 1.3) h.face({ lid: 0, brow: 0.9, browY: 1, look: [-0.4, 0.8], mouth: 'o', open: 0.8 });
      else { h.face({ lid: 0.7, brow: 0.7, browY: 0.5, look: [0, 0], mouth: 'smile' }); s.hero.userData.head.rotation.z = 0.14 * ease(k(lt, 1.8, 2.2)); } } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 4.9], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '毎日2倍!?', x: 800, y: 1090, rot: 8, color: RED, size: 74, dur: 1.1 }],
    act(lt, s) { const h = stand(s, 0, true, true);
      h.face(lt < 2.2 ? { lid: 0.5, brow: 0.4, look: [0, 0], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 });
      s.P.duster.rotation.z = 0.35 + Math.sin(lt * 9) * 0.3; } },
  // 2) day 1: 1 bag, day 2: 2 bags
  { sc: 'st', say: ['day1'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['大掃除のゴミ', '1袋'],
    cam: { p0: [0.1, 1.5, 4.9], p1: [0.1, 1.45, 4.6], l0: [0.1, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.1, 'comic_boyon', -12], [2.4, 'text_pa', -10]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '45Lの袋 [1袋]', y: 480, size: 74, border: CY, sub: '1袋 4kgと仮定（試算）' }] : []; },
    tags(lt) { const t0 = 2.2; return lt > t0 ? [{ t: t0, text: '1日目 1袋', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '2日目 2袋', x: 770, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = stand(s, -0.2, true); calDay(s, lt < 2.1 ? 1 : 2);
      pile(s, lt, lt < 2.1 ? 0 : 1, 0.75, 0.3, 1, 0, 2.1, 2.1);
      h.arm('L', 1.2, 0.5, 0.4); h.hand('L', 'pa');
      h.face(lt < 2.1 ? { lid: 0.4, brow: 0.3, look: [0.5, 0.3], mouth: 'smile' } : { lid: 0.1, brow: 0.6, look: [0.6, -0.2], mouth: 'o', open: 0.5 }); } },
  // 3) day 4: 8 bags = 2 months of normal trash
  { sc: 'st', say: ['day4'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['4日目', '8袋'], hudColor: YEL,
    cam: { p0: [0.1, 1.6, 5.8], p1: [0.1, 1.55, 5.4], l0: [0.1, 1.25, 0] },
    sfx: [[0.1, 'comic_fall', -13], [0.3, 'text_pa', -10], [1.8, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: 'ふだんの [2か月分]', y: 480, size: 70, border: YEL, sub: '8袋32kg÷家庭ごみ466g/日（試算）' }] : []; },
    note: '環境省 一般廃棄物 2024年度',
    act(lt, s) { const h = stand(s, -0.4, false, true); calDay(s, 4, -1.05);
      const g = s.P.pile; pile(s, lt, 8, 0.5, -0.4, 0.6, 0, 0.0, 0.6); s.P.pile.rotation.y = Math.PI / 2;
      // 8 bags = 2 layers? keep bottom row only visible: show items in first row of 6 + 2
      h.arm('R', 1.3, 0.5, 0.4); h.hand('R', 'pa');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.3, look: [0.7, 0], mouth: 'o', open: 0.4 } : { lid: 0.5, brow: 0.8, browY: 0.6, look: [0, 0], mouth: 'smile' }); } },
  // 4) day 8: 128 bags = 3 years of one person's trash
  { sc: 'st', say: ['day8'], pre: 0.12, pal: ['#ff9f5a', '#fff0e0', '#2f6fe0'], show: [], hud: ['8日目', '128袋'], hudColor: YEL,
    cam: { p0: [0.0, 1.75, 6.4], p1: [0.0, 1.65, 6.0], l0: [0.0, 1.4, -0.5] },
    sfx: [[0.1, 'whoosh_gust', -13], [0.3, 'text_pa', -10], [2.0, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: 'ひとり [3年分]', y: 480, size: 74, border: YEL, sub: '128袋×4kg＝512kg（試算）' }] : []; },
    stamps: [{ t: 2.0, text: '500キロ!', x: 800, y: 1150, rot: 7, color: RED, size: 72, dur: 1.3 }],
    act(lt, s) { const h = stand(s, 0.4, true); calDay(s, 8, 1.25);
      pile(s, lt, 91, -0.6, -1.0, 1.0, 36, 0.0, 1.2);
      h.face(lt < 2.0 ? { lid: 0.1, brow: 0.5, look: [-0.7, 0.6], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 5) day 11: 1024 bags, 2 garbage trucks full
  { sc: 'st', say: ['day11'], pre: 0.12, pal: ['#5ad1c8', '#e6fbf8', '#3a8fd8'], show: [], hud: ['11日目', '1024袋'], hudColor: YEL,
    cam: { p0: [0.0, 1.65, 6.8], p1: [0.0, 1.6, 6.4], l0: [0.0, 1.2, -0.3] },
    sfx: [[0.3, 'text_pa', -10], [1.2, 'whoosh_slide', -12], [2.9, 'comic_jajean', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '収集車 [2台] 満杯', y: 480, size: 70, border: YEL, sub: '4.1t÷収集車2t積み（試算）' }] : []; },
    tags(lt) { const t0 = 2.8; return lt > t0 ? [{ t: t0, text: '×2台', x: 780, y: 1560, h: 110, bg: YEL }] : []; },
    act(lt, s) { const h = stand(s, -0.6, true); calDay(s, 11, -1.1);
      const tr = s.P.truck; tr.visible = true; const u = ease(k(lt, 0.5, 1.6)); tr.position.set(4.0 - u * 3.3, 0, -0.8); tr.scale.setScalar(0.55);
      tr.userData.items.forEach((b, i) => { b.position.y = [1.05, 1.15, 0.95, 1.2][i] + Math.abs(Math.sin(lt * 6 + i)) * 0.06; });
      h.face(lt < 2.8 ? { lid: 0.2, brow: 0.4, look: [0.8, 0], mouth: 'o', open: 0.4 } : { lid: 0.1, brow: -0.7, browY: 1, look: [0.7, 0.1], mouth: 'o', open: 0.8 }); } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.4, 3.8], p1: [0, 1.35, 3.4], l0: [0, 1.2, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = stand(s, 0, true); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 7) carrying alone takes 17 h
  { sc: 'st', say: ['carry'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#ff5a4f'], show: [], hud: ['運ぶだけで', '17時間'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.9], p1: [0.0, 1.45, 4.5], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.8, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '運ぶだけで [17時間]', y: 480, size: 68, border: RED, sub: '1袋1分×1024袋（試算）' }] : []; },
    act(lt, s) { const h = stand(s, -0.15, true); sweat(s, lt); wallClock(s, 7, lt * 300, 0.85, 1.6, -0.6, 1.0);
      pile(s, lt, 36, -0.4, -1.5, 0.9); s.hero.position.y = Math.abs(Math.sin(lt * 6)) * 0.03;
      h.arm('L', 0.4, 0.6, 1.4); h.hand('L', 'pa');
      h.face({ lid: 0.4, brow: -0.8, browY: 1, look: [0.3, -0.3], mouth: 'o', open: 0.5 }); } },
  // 8) bag cost 820,000 yen
  { sc: 'st', say: ['cost'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#ff5a4f'], show: ['bill'], hud: ['袋代', '82万円'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'coin_toss', -12], [2.2, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '袋代だけで [82万円]', y: 480, size: 68, border: RED, sub: '15日目 1枚50円×16,384袋（試算）' }] : []; },
    act(lt, s) { const h = stand(s, 0, false); calDay(s, 15, -1.1);
      const b = s.P.bill; b.visible = true; const u = ease(k(lt, 0.4, 1.6)); b.position.set(0.5 + u * 1.2, 1.0 + u * 1.4, 0.5); b.rotation.set(0, 0, u * 6); b.scale.setScalar(1.6);
      h.arm('R', 1.6, 0.5, 0.3); h.hand('R', 'pa'); h.arm('L', 0.6, 0.4, 1.6); h.hand('L', 'pa');
      h.face(lt < 1.6 ? { lid: 0.2, brow: -0.6, look: [0.6, 0.6], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 9) day 26: bigger than the dome, more than all of Japan's trash for a day (cold open, in place)
  { sc: 'st', say: ['dome'], pre: 0.12, pal: HOOK, show: [], hud: ['26日目', '3355万袋'], hudColor: RED,
    cam: { p0: [0.0, 2.0, 7.4], p1: [0.0, 1.95, 7.0], l0: [0.0, 1.8, -1.0] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.3, 0.8]],
    sfx: [[0.2, 'whoosh_gust', -11], [0.35, 'impact_doon', -12], [0.6, 'comic_fall', -13], [1.6, 'text_pa', -10], [3.4, 'text_pa', -10]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '[東京ドーム] 超え', y: 480, size: 72, border: YEL, sub: '45L×3355万袋＝151万㎥（試算）' }] : []; },
    note: '日本のごみ 1日約10.4万t（環境省）',
    act(lt, s) { const h = coldScene(s, lt, 0.3); const d = s.P.dome; d.visible = true; d.position.set(2.2, 0, -3.2); d.scale.setScalar(0.7);
      h.face(lt < 1.5 ? { lid: 0, brow: 0.9, browY: 1, look: [-0.5, 0.8], mouth: 'o', open: 1 } : { lid: 0.6, brow: 0.7, look: [0, 0], mouth: 'smile' }); } },
  // 10) serious: collection stops over new year
  { sc: 'st', say: ['rest'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#2f9a5a'], show: [], hud: ['年末年始', '収集お休み'], hudColor: RED,
    cam: { p0: [0.1, 1.55, 5.8], p1: [0.1, 1.5, 5.4], l0: [0.15, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'text_tin', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '出す日は [確認]', y: 480, size: 74, border: CY, sub: '収集日は自治体ごとにちがう' }] : []; },
    note: 'お住まいの自治体の収集カレンダーで',
    act(lt, s) { const h = stand(s, -0.3, true); const g = s.P.sign; g.visible = true; g.position.set(0.75, 0, -0.5); g.rotation.set(0, -0.25, 0);
      h.arm('L', 1.4, 0.2, 0.3); h.hand('L', 'choki');
      h.face(lt < 2.3 ? { lid: 0.2, brow: -0.5, browY: 1, look: [0.7, 0.4], mouth: 'o', open: 0.4 } : { lid: 0.3, brow: 0.3, look: [0, 0], mouth: 'smile' }); } },
  // 11) good / bad news
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#ff5a4f'], show: [], hud: ['大掃除の', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.0], p1: [0.0, 1.5, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.3, 'text_pa', -10], [2.6, 'comic_fall', -12], [3.2, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.2 ? (lt > 0.3 ? [{ t: 0.3, text: '部屋は [ピカピカ]', y: 480, size: 74, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.2, text: 'でも [家] がない', y: 480, size: 74, border: RED, sub: '悪いニュース：ゴミで埋まった' }]; },
    stamps: [{ t: 3.1, text: 'どこに住む…', x: 760, y: 1150, rot: 6, color: RED, size: 68, dur: 1.4 }],
    act(lt, s) { const h = stand(s, 0, false, lt < 2.2);
      if (lt < 2.2) { kira(s, lt, 0, 1.4, 0); h.face({ lid: 0.7, brow: 0.5, look: [0, 0], mouth: 'smile' }); }
      else { pile(s, lt, 91, 0.0, -1.6, 1.3, 0, 2.2, 2.7); h.arm('L', 2.4, 0.4, 0.4); h.arm('R', 2.4, 0.4, 0.4); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0.3], mouth: 'o', open: 0.9 }); } } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.25, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '今年こそやる', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '来年でいい', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1430, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1530, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = stand(s, -0.05, true, true); h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); s.hero.userData.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
      s.P.duster.rotation.z = 0.35 + Math.sin(lt * 7) * 0.25; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも大掃除のゴミが', '毎日[2倍]に増えたら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['大掃除のゴミ', '毎日×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
