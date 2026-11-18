// ep42_densha_tada (pop / arm C): もしも電車が全部タダになったら？
// 型は sp_geppu2x / ep41。台本・数字・小道具は自作。
// 前提（試算）: ニュース＝JR東日本 2026年3月14日の運賃改定 平均7.1%（初乗り150→160円、同社2025年8月1日発表・認可）
//   定期代 月1.5万円と仮定 → 年18万円 / 40年 720万円 ≒ 車（300万円と仮定）2.4台
//   日帰り旅行 1人往復4,000円と仮定 ×4人 = 1万6千円
//   朝の混雑率 いま150%と仮定 × 乗る人2倍 = 300%
//   運賃収入 全国で年7兆円と仮定 ÷ 1.24億人 = 56,452円 ≒ 5万6千円
//   行列：タダで出かける人が2倍と仮定 → 行列2倍
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep42_densha_tada.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#5ec2ff', '#3f74c4', '#ffd23a'], MAIN = ['#7ad36b', '#effbe9', '#3f6fd8'];
const SKIN = ['#ffd3ad', '#f2c08f', '#ffe0c4', '#e8b58a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
const txt = (c, s, x, y, font, col) => { c.fillStyle = col; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); };
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // commuter train car (origin = floor center). front face z = +0.5. door in the middle (userData.dl / dr slide)
  { const t = G(); t.userData.faces = [];
    rbox(3.0, 0.35, 0.8, 0.05, '#3a3f4a', 0, 0.2, 0, t);
    rbox(3.4, 2.1, 1.0, 0.15, '#e9edf2', 0, 1.4, 0, t);
    rbox(3.42, 0.16, 1.02, 0.04, '#2fb36a', 0, 1.0, 0, t); rbox(3.42, 0.07, 1.02, 0.02, '#2fb36a', 0, 2.27, 0, t);
    for (const x of [-1.3, -0.8, 0.8, 1.3]) { rbox(0.42, 0.62, 0.02, 0.04, '#2a4a7a', x, 1.72, 0.505, t);
      for (const dx of [-0.09, 0.1]) { const f = sph(0.15, SKIN[(x * 10 + dx * 100) & 3], x + dx, 1.68, 0.5, t, 1.05, 1, 0.45); t.userData.faces.push(f);
        for (const ex of [-0.05, 0.05]) sph(0.022, '#1b1b1f', x + dx + ex, 1.71, 0.565, t); } }
    rbox(0.92, 1.86, 0.02, 0.03, '#252a35', 0, 1.3, 0.505, t);
    for (const [x, y] of [[-0.25, 1.75], [0.05, 1.82], [0.28, 1.7], [-0.1, 1.55], [0.2, 1.48]]) { const f = sph(0.17, SKIN[Math.abs(Math.round(x * 10)) & 3], x, y, 0.38, t); t.userData.faces.push(f);
      for (const ex of [-0.06, 0.06]) sph(0.025, '#1b1b1f', x + ex, y + 0.03, 0.54, t); }
    const door = (sx) => { const d = G(); rbox(0.45, 1.84, 0.04, 0.03, '#d5dbe2', 0, 0, 0, d); rbox(0.26, 0.5, 0.02, 0.03, '#2a4a7a', 0, 0.35, 0.025, d); d.position.set(sx * 0.23, 1.3, 0.53); t.add(d); return d; };
    t.userData.dl = door(-1); t.userData.dr = door(1);
    reg('train', t); }
  // IC cards
  const icM = label(256, 160, (c) => { c.fillStyle = '#35c4a8'; c.fillRect(0, 0, 256, 160); txt(c, 'IC', 70, 60, 'bold 70px sans-serif', '#ffffff'); txt(c, '0円', 160, 118, 'bold 52px sans-serif', '#ffe14a'); });
  const passM = label(256, 160, (c) => { c.fillStyle = '#f2f4f7'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#2fb36a'; c.fillRect(0, 0, 256, 40); txt(c, '定期券', 128, 92, 'bold 54px sans-serif', '#22252d'); txt(c, '1年', 128, 140, 'bold 30px sans-serif', '#22252d'); });
  const card = (name, m) => { const g = G(); rbox(0.24, 0.15, 0.012, 0.015, '#ffffff', 0, 0, 0, g); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.14), m); f.position.z = 0.008; g.add(f); return reg(name, g); };
  card('ic', icM); card('pass', passM);
  // fare sign on a pole (origin = floor)
  { const g = G(); cyl(0.03, 0.03, 1.6, '#9aa3ad', 0, 0.8, 0, g); rbox(1.2, 0.75, 0.06, 0.04, '#22303f', 0, 1.75, 0, g);
    const fm = label(480, 300, (c) => { c.fillStyle = '#22303f'; c.fillRect(0, 0, 480, 300); txt(c, '初乗り運賃', 240, 60, 'bold 54px sans-serif', '#ffffff'); txt(c, '150円', 120, 190, 'bold 72px sans-serif', '#9fb4c8'); txt(c, '→', 250, 190, 'bold 64px sans-serif', '#ffd23a'); txt(c, '160円', 370, 190, 'bold 76px sans-serif', '#ff6a5a'); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.7), fm); f.position.set(0, 1.75, 0.032); g.add(f); reg('sign', g); }
  // toy cars
  const mkCar = (name, col) => { const c = G(); rbox(1.0, 0.32, 0.5, 0.1, col, 0, 0.27, 0, c); rbox(0.55, 0.26, 0.44, 0.09, '#dff3ff', -0.06, 0.5, 0, c);
    for (const [x, z] of [[-0.3, 0.24], [0.3, 0.24], [-0.3, -0.24], [0.3, -0.24]]) { const w = cyl(0.12, 0.12, 0.07, '#22252d', x, 0.12, z, c); w.rotation.x = Math.PI / 2; }
    sph(0.04, M('#fff6b0'), 0.5, 0.3, 0.15, c); sph(0.04, M('#fff6b0'), 0.5, 0.3, -0.15, c); return reg(name, c); };
  mkCar('car1', '#e2463c'); mkCar('car2', '#3f74c4');
  // mountains (origin = floor)
  { const g = G(); for (const [x, z, r, h] of [[-0.6, 0, 1.0, 1.7], [0.7, -0.3, 0.8, 1.3]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 24), M('#4f9f5a')); m.position.set(x, h / 2, z); m.castShadow = true; g.add(m);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.32, h * 0.32, 24), M('#ffffff')); cap.position.set(x, h * 0.85, z); g.add(cap); } reg('mount', g); }
  // tax envelope
  { const e = G(); rbox(0.3, 0.2, 0.012, 0.01, '#f2e3c2', 0, 0, 0, e);
    const fm = label(256, 170, (c) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, 256, 170); txt(c, '税金', 128, 62, 'bold 64px sans-serif', '#c23a2f'); txt(c, '年5.6万円', 128, 132, 'bold 38px sans-serif', '#22252d'); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), fm); f.position.z = 0.008; e.add(f); reg('tax', e); }
  // queue of blob people
  { const g = G(); g.userData.items = []; const cols = ['#ff8a5c', '#6ab4ff', '#b48cff', '#5fcf8a', '#ffb13d', '#ff7aa8'];
    for (let i = 0; i < 12; i++) { const p = G(); caps(0.17, 0.32, cols[i % 6], 0, 0.42, 0, p); sph(0.19, SKIN[i & 3], 0, 0.9, 0, p);
      for (const ex of [-0.06, 0.06]) sph(0.025, '#1b1b1f', ex, 0.92, 0.17, p); g.add(p); g.userData.items.push(p); } reg('queue', g); }
}

const hold = (s, name, side, p, rz = 0, who = s.hero) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz); who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.06, -0.03))); return o; };

// cold-open scene (also #7): train door opens -> hero is popped out of the packed car and flies to the front
const TR = V(0.25, 0, -1.3);
function popOut(s, lt, t0) {
  const tr = s.P.train; tr.visible = true; tr.position.copy(TR); tr.rotation.set(0, 0, 0);
  const op = ease(k(lt, t0, t0 + 0.15)); tr.userData.dl.position.x = -0.23 - 0.42 * op; tr.userData.dr.position.x = 0.23 + 0.42 * op;
  tr.userData.faces.forEach((f, i) => { f.position.y += Math.sin(lt * 14 + i) * 0.006 * (lt > t0 ? 1 : 0.3); });
  const h = s.hero.userData, f = k(lt, t0 + 0.05, t0 + 0.75), land = k(lt, t0 + 0.75, t0 + 1.2);
  s.hero.visible = lt > t0 + 0.05;
  s.hero.position.set(lerp(TR.x, -0.55, f), lerp(0.37, 0, f) + 1.0 * Math.sin(Math.PI * f), lerp(TR.z + 0.35, 0.85, f));
  s.hero.rotation.set(0, 0, 0.9 * (1 - ease(f)));
  h.body.position.y = f >= 1 ? -0.12 * Math.sin(land * Math.PI) * (1 - land) : 0;
  if (f < 1) { h.arm('L', 0.2, 2.6, 0.2); h.arm('R', 0.2, 2.6, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa'); }
  else { h.arm('L', 0.3, 0.6, 1.5); hold(s, 'ic', 'R', V(-0.3, 1.0 + 0.25 * ease(k(lt, t0 + 1.6, t0 + 2.0)), 1.15)); }
}

const plan = [
  // 0) cold open (flash-forward of #7): door opens, 300% crowd pops the hero out; push in on his smug face holding the free IC card
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: ['train'],
    cam: { p0: [0.0, 1.5, 6.2], p1: [-0.5, 1.45, 3.0], l0: [-0.05, 1.15, -0.3], l1: [-0.55, 1.36, 0.85], hold: 1.3, dur: 2.1 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.25, 0.9]],
    sfx: [[0.02, 'train_door', -10], [0.25, 'impact_doon', -9], [0.3, 'comic_boyon', -11], [0.85, 'comic_fall', -12], [2.2, 'comic_pico', -11]],
    stamps: [{ t: 0.25, text: '混雑率300%!!', x: 560, y: 330, rot: -6, color: YEL, size: 100, dur: 1.1 },
      { t: 2.2, text: 'タダなので…', x: 700, y: 1230, rot: 6, color: '#ffffff', size: 58, dur: 0.8 }],
    act(lt, s) {
      popOut(s, lt, 0.15); const h = s.hero.userData;
      if (lt < 1.3) h.face({ lid: 0, brow: -0.9, browY: 1, look: [0.4, 0.5], mouth: 'o', open: 1.1 });
      else if (lt < 2.0) h.face({ lid: 0.6, brow: -0.4, look: [0, -0.2], mouth: 'flat' });
      else { h.face({ lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = -0.12 * ease(k(lt, 2.0, 2.4)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: MAIN, show: ['train'],
    cam: { p0: [0.0, 1.45, 5.4], p1: [0.0, 1.42, 5.0], l0: [0.0, 1.2, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.4, 'comic_pico', -13]],
    tags: [{ t: 1.4, text: '運賃 0円', x: 760, y: 1040, h: 96, bg: YEL }],
    act(lt, s) {
      const tr = s.P.train; tr.position.set(0.6, 0, -1.8);
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0.4); s.hero.rotation.y = 0.2;
      hold(s, 'ic', 'R', V(0.0, 1.55 + Math.abs(Math.sin(lt * 4)) * 0.04, 0.75)); h.arm('L', 0.2, 2.5, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.2, brow: 0.4, mouth: 'smile', look: [0.4, 0.2] });
    } },
  // 2) news: JR fare +7.1%
  { sc: 'st', say: ['news'], pre: 0.2, hold: 0.1, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['sign'], hud: ['電車', 'タダ'],
    cam: { p0: [0.1, 1.45, 5.0], p1: [0.1, 1.43, 4.7], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.6, 'text_pa', -11], [3.4, 'comic_surprise', -13]],
    tags(lt) { return lt > this.lt.news + 2.4 ? [{ t: this.lt.news + 2.4, text: '平均 +7.1%', x: 300, y: 1180, h: 96, bg: RED, fg: '#ffffff' }] : []; },
    note: 'JR東日本 2026年3月の運賃改定（同社発表）',
    act(lt, s) {
      const sg = s.P.sign; sg.position.set(0.55, 0, -0.3); sg.rotation.y = -0.2;
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.35;
      h.reach('R', V(0.1, 1.55, -0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 2.6 ? { lid: 0.2, brow: 0.2, mouth: 'flat', look: [0.8, 0.3] } : { lid: 0, brow: -0.7, browY: 1, mouth: 'o', open: 0.8, look: [0, 0] });
    } },
  // 3) commuter pass: normal 18万 vs you 0
  { sc: 'st', say: ['teiki'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], hero2: true, hud: ['定期代', '0円'], hudColor: YEL,
    cam: { p0: [0, 1.6, 6.2], p1: [0, 1.58, 6.0], l0: [0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.4, 'coin_toss', -12], [2.6, 'sparkle', -12]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'ふつう 年18万円', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > 1.6 ? [{ t: 1.6, text: 'あなた 0円', x: p1[0], y: p1[1], h: 92, bg: CY }] : [])]; },
    note: '定期代を月1.5万円と仮定（試算）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.66, 0, 0.2); s.hero.rotation.y = 0.3;
      hold(s, 'pass', 'L', V(0.42, 1.25, 0.42), 0.1, s.hero2); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.5, brow: -0.3, mouth: 'flat', look: [-0.3, 0] });
      const up = ease(k(lt, 1.4, 1.8)); hold(s, 'ic', 'R', V(-0.45, lerp(1.1, 1.6, up), 0.55)); h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 1.6 ? { lid: 0.3, brow: 0.2, look: [0.6, 0], mouth: 'flat' } : { lid: 0.1, brow: 0.6, look: [0, 0.2], mouth: 'smile' });
    } },
  // 4) 40 years: 7.2M yen = 2 cars
  { sc: 'st', say: ['life'], pre: 0.15, pal: ['#4fc38a', '#e6f8ee', '#ffd23a'], show: ['car1', 'car2'], hud: ['40年', '720万円'], hudColor: YEL,
    cam: { p0: [0.1, 1.45, 5.0], p1: [0.1, 1.43, 4.7], l0: [0.1, 1.2, 0] },
    sfx: [[0.4, 'text_pa', -10], [2.0, 'comic_boyon', -12], [2.4, 'comic_boyon', -12]],
    cards(lt) { return lt > 0.8 ? [{ t: 0.8, text: '40年で [720万円]', y: 480, size: 70, border: YEL, sub: '18万円×40年（試算）' }] : []; },
    tags(lt) { return lt > 2.6 ? [{ t: 2.6, text: '車 2台分', x: 760, y: 1260, h: 84, bg: '#ffffff' }] : []; },
    act(lt, s) {
      for (const [n, x, z, t0] of [['car1', 0.45, 0.4, 2.0], ['car2', 0.75, -0.5, 2.4]]) { const c = s.P[n], u = ease(k(lt, t0, t0 + 0.3)); c.position.set(x, 0, z); c.rotation.y = -0.5; c.scale.setScalar(Math.max(0.001, 1.3 * u)); }
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.3;
      h.arm('R', 0.2, 2.5, 0.3); h.hand('R', 'pa'); hold(s, 'ic', 'L', V(-0.85, 1.1, 0.55));
      h.face(lt < 2.0 ? { lid: 0.2, brow: 0.3, look: [0.3, 0.6], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0.8, -0.2], mouth: 'o', open: 0.9 });
    } },
  // 5) family day trip
  { sc: 'st', say: ['trip'], pre: 0.15, hold: 0.2, pal: ['#3fa8ff', '#e4f3ff', '#ffd23a'], hero2: true, show: ['mount'], hud: ['日帰り旅行', '4人'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.7], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'sparkle', -12], [1.8, 'coin_toss', -11], [2.2, 'text_pa', -10]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '[1万6千円] 浮く', y: 480, size: 70, border: YEL, sub: '1人 往復4,000円と仮定（試算）' }] : []; },
    act(lt, s) {
      const m = s.P.mount; m.position.set(0.1, 0, -2.2);
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero.position.set(-0.62, 0, 0.3); s.hero.rotation.y = 0.2; s.hero2.position.set(0.62, 0, 0.2); s.hero2.rotation.y = -0.2;
      const j = Math.abs(Math.sin(lt * 5)) * 0.08; h.body.position.y = j; h2.body.position.y = Math.abs(Math.sin(lt * 5 + 1)) * 0.06;
      hold(s, 'ic', 'R', V(-0.3, 1.55, 0.55)); h.arm('L', 0.1, 2.5, 0.3); h.hand('L', 'pa');
      h2.arm('L', 0.1, 2.5, 0.3); h2.arm('R', 0.1, 2.5, 0.3); h2.hand('L', 'pa'); h2.hand('R', 'pa');
      h.face({ lid: 0.2, brow: 0.5, look: [0.3, 0.2], mouth: 'smile' }); h2.face({ lid: 0.3, brow: 0.4, look: [-0.3, 0.2], mouth: 'smile' });
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) everyone rides: 300% (the cold open, in its place)
  { sc: 'st', say: ['crowd'], pre: 0.15, hold: 0.3, pal: HOOK, show: ['train'], hud: ['朝の混雑', '300%'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 6.2], p1: [-0.05, 1.48, 5.9], l0: [-0.05, 1.2, -0.3] },
    shake: [[1.0, 0.06, 0.5]],
    sfx: [[0.8, 'train_door', -11], [1.0, 'impact_doon', -10], [1.05, 'comic_boyon', -12], [2.2, 'text_pa', -10]],
    stamps: [{ t: 1.0, text: 'ポーン!!', x: 300, y: 820, rot: -8, color: YEL, size: 96, dur: 0.8 }],
    cards(lt) { return lt > 2.0 ? [{ t: 2.0, text: '朝の混雑 [300%]', y: 480, size: 70, border: RED, sub: 'いま150%と仮定×乗る人2倍（試算）' }] : []; },
    act(lt, s) {
      popOut(s, lt, 0.85); const h = s.hero.userData;
      h.face(lt < 2.0 ? { lid: 0, brow: -0.9, browY: 1, look: [0.4, 0.5], mouth: 'o', open: 1.1 } : { lid: 0.5, brow: -0.6, browY: 1, look: [0, 0], mouth: 'flat' });
    } },
  // 8) the fare becomes tax
  { sc: 'st', say: ['tax'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.85, hud: ['運賃の分', '税金'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.6], p1: [0.0, 1.43, 4.3], l0: [0.0, 1.35, 0] },
    sfx: [[0.3, 'whoosh_slide', -13], [1.4, 'text_pa', -10], [2.6, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.6 ? [{ t: 1.6, text: '1人 年[5万6千円]', y: 480, size: 68, border: RED, sub: '運賃収入 年7兆円と仮定÷1.24億人（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.1, 0, 0.3); s.hero.rotation.y = 0.1;
      const sw = ease(k(lt, 0.2, 0.6)); hold(s, 'tax', 'R', V(lerp(0.9, 0.25, sw), lerp(1.9, 1.2, sw), 0.6), 0.15 * Math.sin(lt * 3));
      hold(s, 'ic', 'L', V(-0.45, 1.0, 0.55), -0.2);
      h.face(lt < 1.5 ? { lid: 0.3, brow: 0.1, look: [0.6, -0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
    } },
  // 9) good news (anywhere for free) / bad news (queues x2)
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#ff9f6b', '#fff0e6', '#ffffff'], show: [],
    cam: { p0: [0.2, 1.5, 5.6], p1: [0.15, 1.48, 5.6], l0: [0.15, 1.25, -0.2] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', 'お出かけ'] : ['悪いニュース', '行列']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [2.0, 'sparkle', -12], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 2.2, 'comic_fall', -13]],
    cards(lt) { const a = this.lt.bad; return lt < a ? (lt > 1.8 ? [{ t: 1.8, text: 'どこでも [0円]', y: 480, size: 70, border: YEL, sub: '休みの日の電車代' }] : [])
      : (lt > a + 2.0 ? [{ t: a + 2.0, text: '行列 [2倍]', y: 480, size: 74, border: RED, sub: '出かける人2倍と仮定（試算）' }] : []); },
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad;
      if (!late) {
        const m = s.P.mount; m.visible = true; m.position.set(0.2, 0, -2.0);
        s.hero.position.set(-0.1, 0, 0.5); s.hero.rotation.y = 0.1; h.body.position.y = Math.abs(Math.sin(lt * 6)) * 0.1;
        hold(s, 'ic', 'R', V(0.3, 1.75, 0.6)); h.arm('L', 0.1, 2.6, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: 0.6, mouth: 'smile', look: [0, 0.3] });
      } else {
        const q = s.P.queue; q.visible = true; q.position.set(0, 0, 0);
        q.userData.items.forEach((p, i) => { const r = Math.floor(i / 6), c = i % 6; p.position.set(-1.35 + c * 0.42 + r * 0.2, 0, -0.5 - r * 0.6); p.rotation.y = -1.2; p.position.y = Math.abs(Math.sin(lt * 3 + i)) * 0.02; });
        s.hero.position.set(0.6, 0, 0.7); s.hero.rotation.y = -0.45;
        h.arm('L', 0.3, 0.6, 1.5); hold(s, 'ic', 'R', V(0.9, 0.95, 0.95), -0.4);
        h.face(lt < sh.lt.bad + 1.9 ? { lid: 0.3, brow: 0.3, look: [-0.8, 0.1], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); }
    } },
  // 10) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, hold: 0.6, pal: HOOK, show: ['train'],
    cam: { p0: [0.05, 1.45, 5.0], p1: [0.05, 1.45, 4.8], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'タダがいい', x: 300, y: 1040, h: 110, bg: CY }, { t: t0 + 0.2, text: '今のままで', x: 770, y: 1040, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1170, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1450, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const tr = s.P.train; tr.position.set(0.7, 0, -1.9);
      const h = s.hero.userData; s.hero.position.set(-0.15, 0, 0.3); s.hero.rotation.y = 0.05;
      hold(s, 'ic', 'R', V(0.25, 1.3, 0.75)); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも電車が', '全部[タダ]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['電車', 'タダ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
