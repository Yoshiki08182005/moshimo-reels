// ep41_kome2x (pop / arm A): もしもお米の値段が毎日2倍になったら？
// 型は sp_geppu2x / ep36。台本・数字・小道具は自作。
// 前提（試算）: お米5kg 2,816円（農水省 全国のスーパー平均 11月1日までの1週間、報道）× 2^日数
//   ご飯1杯150g = 生米約67g → 2816×67/5000 = 37.7円 ≒ 38円 / おにぎり1個 = 生米45g → 25.3円
//   5日 ×32: 1杯 1,208円 / 10日 ×1,024: 38,640円 / 14日 ×16,384: 618,240円 > 月給34万600円（厚労省 令和7年）
//   20日 ×1,048,576: おにぎり 26,575,110円 ≒ 2,700万円
//   30日 ×1,073,741,824: 1粒（1杯=約3,250粒と仮定）0.01161円 → 12,466,770円 ≒ 1,200万円 / 10粒 1.25億円
//   田んぼ1枚（10a＝約500kgと仮定）100袋×2816×2^30 = 302兆円 / 5kg袋 3.02兆円、日本銀行券残高116兆3,156億円（2026年3月末）÷3.02兆 = 38.5袋
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep41_kome2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#5ec2ff', '#3f74c4', '#ffd23a'], MAIN = ['#ffb13d', '#fff3df', '#3f6fd8'];
const RICE = '#fffdf6';

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // rice bowl (origin = bottom), rice mound on top
  const bowl = (name) => { const b = G(); cyl(0.05, 0.05, 0.02, '#2f5fa8', 0, 0.01, 0, b); cyl(0.13, 0.065, 0.11, M('#ffffff', 0.35), 0, 0.075, 0, b);
    cyl(0.131, 0.128, 0.025, '#2f5fa8', 0, 0.11, 0, b); b.userData.rice = sph(0.12, M(RICE, 0.7), 0, 0.13, 0, b, 1, 0.55, 1); return reg(name, b); };
  bowl('chawan'); bowl('chawan2');
  // single rice grain (exaggerated size so it reads on screen)
  { const g = G(); sph(0.075, M(RICE, 0.35), 0, 0, 0, g, 1.5, 0.85, 0.85); reg('grain', g); }
  // 10 grains for the washing scene
  { const g = G(); g.userData.items = []; for (let i = 0; i < 10; i++) g.userData.items.push(sph(0.03, M(RICE, 0.35), 0, 0, 0, g, 1.5, 0.85, 0.85)); reg('grains', g); }
  // water drops
  { const g = G(); g.userData.items = []; const wm = new THREE.MeshStandardMaterial({ color: '#7cc8ff', roughness: 0.15, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 16; i++) g.userData.items.push(sph(0.025, wm, 0, 0, 0, g)); reg('drops', g); }
  // chopsticks (pivot = grip end)
  { const c = G(); for (const x of [-0.012, 0.012]) { const s = cyl(0.006, 0.004, 0.24, '#b5462f', x, 0.12, 0, c); s.rotation.z = x * 2; } reg('hashi', c); }
  // single onigiri held in hand
  { const o = G(); sph(0.11, M(RICE, 0.7), 0, 0, 0, o, 1.05, 0.95, 0.7); rbox(0.13, 0.1, 0.16, 0.02, '#20301f', 0, -0.05, 0, o); reg('oni1', o); }
  // 5kg rice bag (origin = bottom)
  const bagM = label(256, 360, (c) => { c.fillStyle = '#fbf3e0'; c.fillRect(0, 0, 256, 360); c.fillStyle = '#3fae5b'; c.fillRect(0, 0, 256, 70); c.fillStyle = '#ffffff'; c.font = 'bold 46px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('お米', 128, 37);
    c.fillStyle = '#22252d'; c.font = 'bold 110px sans-serif'; c.fillText('米', 128, 170); c.fillStyle = '#e2463c'; c.font = 'bold 64px sans-serif'; c.fillText('5kg', 128, 290); });
  const mkBag = (p, s = 1) => { const b = G(); rbox(0.36, 0.5, 0.16, 0.05, '#fbf3e0', 0, 0.25, 0, b); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.45), bagM); f.position.set(0, 0.25, 0.082); b.add(f); b.scale.setScalar(s); p.add(b); return b; };
  { const g = G(); mkBag(g); reg('ricebag', g); }
  // rice cooker (origin = floor of desk top)
  { const r = G(); rbox(0.42, 0.26, 0.36, 0.08, '#f4f6f8', 0, 0.13, 0, r); sph(0.2, '#e8ecf0', 0, 0.26, 0, r, 1.05, 0.35, 0.9); rbox(0.12, 0.05, 0.02, 0.01, '#23262f', 0, 0.12, 0.18, r);
    r.userData.led = sph(0.015, M('#ff8a3d'), 0.1, 0.12, 0.19, r); reg('cooker', r); }
  // salary envelope
  { const e = G(); rbox(0.26, 0.17, 0.012, 0.01, '#f2e3c2', 0, 0, 0, e);
    const fm = label(256, 160, (c) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#22252d'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('給料', 128, 60); c.font = 'bold 34px sans-serif'; c.fillText('34万円', 128, 122); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.15), fm); f.position.z = 0.008; e.add(f); reg('pay', e); }
  // small house (origin = floor)
  { const h = G(); rbox(1.0, 0.7, 0.8, 0.04, '#fff6e6', 0, 0.35, 0, h);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.5, 4), M('#e2463c')); roof.rotation.y = Math.PI / 4; roof.position.y = 0.95; roof.castShadow = true; h.add(roof);
    rbox(0.22, 0.38, 0.03, 0.02, '#a86a3d', -0.2, 0.19, 0.41, h); rbox(0.24, 0.2, 0.03, 0.02, '#9fd4ff', 0.24, 0.42, 0.41, h); reg('house', h); }
  // sink (origin = floor): cabinet + basin + faucet
  { const s = G(); rbox(1.1, 0.82, 0.6, 0.03, '#d9dde3', 0, 0.41, 0, s); rbox(0.6, 0.06, 0.42, 0.03, '#9aa3ad', 0, 0.83, 0.02, s);
    cyl(0.07, 0.07, 0.03, '#2a2f3a', 0, 0.865, 0.02, s); const f = cyl(0.025, 0.025, 0.4, '#c9d0d8', 0, 1.06, -0.2, s); void f;
    const sp = cyl(0.022, 0.022, 0.24, '#c9d0d8', 0, 1.25, -0.1, s); sp.rotation.x = Math.PI / 2; reg('sink', s); }
  // rice paddy (origin = floor): green field + rows of golden stalks
  { const p = G(); rbox(3.2, 0.06, 1.6, 0.02, '#6a8f3a', 0, 0.03, 0, p); p.userData.items = [];
    for (let i = 0; i < 48; i++) { const s = G(); cyl(0.012, 0.012, 0.5, '#8fb84a', 0, 0.25, 0, s); sph(0.05, '#e8c34a', 0.03, 0.52, 0, s, 0.6, 1.4, 0.6);
      s.position.set(((i % 12) - 5.5) * 0.26, 0.05, -0.65 + Math.floor(i / 12) * 0.38); p.add(s); p.userData.items.push(s); } reg('paddy', p); }
  // block of banknotes "日本中のお札"
  { const b = G(); rbox(0.9, 1.5, 0.5, 0.04, '#5fae6b', 0, 0.75, 0, b);
    const fm = label(300, 500, (c) => { c.fillStyle = '#cfe9c8'; c.fillRect(0, 0, 300, 500); c.fillStyle = '#2f6b3f'; c.font = 'bold 50px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('日本中の', 150, 70); c.fillText('お札', 150, 135); c.font = 'bold 66px sans-serif'; c.fillStyle = '#22252d'; c.fillText('116兆円', 150, 225); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.3), fm); f.position.set(0, 0.75, 0.252); b.add(f); reg('notes', b); }
}

const hold = (s, name, side, p, rz = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.08, -0.03))); return o; };
const holdBowl = (s, side, p) => { const o = s.P.chawan; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); s.hero.userData.reach(side, p.clone().add(V(0, -0.02, -0.06))); return o; };

// cold-open scene (also #8): a single grain falls from the bowl -> hero dives and catches it
function drop(s, lt, t0) {
  const h = s.hero.userData; s.hero.position.set(-0.1, 0, 0.3); s.hero.rotation.y = 0.15;
  const g = s.P.grain; g.visible = true;
  const dv = ease(k(lt, t0 + 0.3, t0 + 0.75)), up = ease(k(lt, t0 + 1.0, t0 + 1.4));
  s.hero.userData.body.rotation.x = 0.45 * dv * (1 - up);
  holdBowl(s, 'L', V(-0.42, lerp(1.08, 0.95, dv * (1 - up)), 0.62));
  if (lt < t0) { g.position.set(-0.32, 1.25, 0.66); h.reach('R', V(-0.2, 1.15, 0.6)); }
  else if (lt < t0 + 1.0) { const f = k(lt, t0, t0 + 0.28); g.position.set(lerp(-0.32, 0.12, f), Math.max(0.04, 1.25 - 1.21 * f * f), lerp(0.66, 0.85, f)); g.rotation.z = lt * 9; h.reach('R', V(lerp(-0.1, 0.12, dv), lerp(1.0, 0.2, dv), lerp(0.6, 0.85, dv))); }
  else { const gp = V(lerp(0.12, 0.08, up), lerp(0.1, 1.38, up), lerp(0.85, 0.7, up)); g.position.copy(gp); g.rotation.set(0, 0, 0.3); h.reach('R', gp.clone().add(V(0.05, -0.07, -0.03))); h.hand('R', 'choki'); }
}

const plan = [
  // 0) cold open (flash-forward of #8): one grain slips off -> "12 million yen!!" -> dive, then push in on the relieved face holding it up
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.1, 1.5, 5.6], p1: [-0.05, 1.42, 2.5], l0: [0.0, 1.0, 0], l1: [-0.05, 1.38, 0.3], hold: 1.4, dur: 2.1 },
    shake: [[0.28, 0.08, 0.6]], lines: [[0.28, 0.9]],
    sfx: [[0.05, 'whoosh_swing', -12], [0.28, 'impact_doon', -9], [0.3, 'coin_toss', -12], [0.45, 'whoosh_slide', -12], [1.1, 'comic_pico', -11], [2.3, 'comic_stupid', -11]],
    stamps: [{ t: 0.28, text: '1粒 1,200万円!!', x: 560, y: 330, rot: -6, color: YEL, size: 104, dur: 1.1 },
      { t: 2.2, text: 'セーフ…', x: 700, y: 1220, rot: 6, color: '#ffffff', size: 58, dur: 0.8 }],
    act(lt, s) {
      drop(s, lt, 0.05); const h = s.hero.userData;
      if (lt < 1.2) h.face(lt < 0.2 ? { lid: 0.2, look: [0.3, -0.3], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0.6, -0.8], mouth: 'o', open: 1.1 });
      else { s.hero.rotation.y = 0.15 * (1 - ease(k(lt, 1.4, 1.9))); h.face({ lid: 0.5, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = -0.1 * ease(k(lt, 2.0, 2.4)); }
    } },
  // 1) title: bowl of rice + rice bag
  { sc: 'st', say: ['hook'], pal: MAIN, show: ['ricebag'],
    cam: { p0: [0.0, 1.4, 4.8], p1: [0.0, 1.38, 4.5], l0: [0.0, 1.15, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.4, 'comic_pico', -13]],
    tags: [{ t: 1.4, text: '毎日×2', x: 760, y: 1000, h: 96, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0.25); s.hero.rotation.y = 0.2; s.P.ricebag.position.set(0.55, 0, 0.0); s.P.ricebag.rotation.y = -0.25;
      holdBowl(s, 'R', V(0.05, 1.15 + Math.abs(Math.sin(lt * 4)) * 0.03, 0.6)); h.arm('L', 0.2, 2.5, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.2, brow: 0.4, mouth: 'smile', look: [0.5, 0.2] });
    } },
  // 2) real price: 5kg 2,816 yen / bowl 38 yen
  { sc: 'st', say: ['real'], pre: 0.2, hold: 0.1, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['desk', 'ricebag'], hud: ['お米', '毎日×2'],
    cam: { p0: [0.05, 1.42, 4.9], p1: [0.05, 1.4, 4.6], l0: [0.05, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.7, 'text_pa', -11], [3.8, 'comic_pico', -13]],
    tags(lt) { const pb = scr(S, V(0.6, 1.45, -0.1)), pc = scr(S, V(-0.3, 1.38, 0.6), 0, -40);
      return [{ t: 0.3, text: '5kg 2,816円', x: pb[0], y: pb[1] - 90, h: 80, bg: '#ffffff' }, ...(lt > this.lt.real + 2.6 ? [{ t: this.lt.real + 2.6, text: '1杯 約38円', x: pc[0], y: pc[1] + 250, h: 84, bg: CY }] : [])]; },
    note: 'スーパー平均 11/1までの週（農水省・報道）',
    act(lt, s) {
      s.P.desk.position.set(0.6, 0, -0.1); s.P.ricebag.position.set(0.6, 0.77, -0.1); s.P.ricebag.rotation.y = -0.2;
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.25); s.hero.rotation.y = 0.3;
      holdBowl(s, 'L', V(-0.42, 1.12, 0.62)); h.reach('R', V(0.38, 1.05, 0.0)); h.hand('R', 'pa');
      h.face(lt < 2.8 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.7, 0] } : { lid: 0.1, brow: 0.5, mouth: 'smile', look: [0, 0] });
    } },
  // 3) day 5: normal 38 yen vs you 1,200 yen
  { sc: 'st', say: ['d5'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], hero2: true, show: ['chawan2', 'hashi'], hud: ['5日目', '×32'], hudColor: YEL,
    cam: { p0: [0, 1.6, 6.2], p1: [0, 1.58, 6.0], l0: [0, 1.25, 0] },
    sfx: [[0.4, 'comic_eat', -12], [1.4, 'text_pa', -10], [2.6, 'comic_surprise', -12]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'ふつう 38円', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > 1.3 ? [{ t: 1.3, text: 'あなた 1,200円', x: p1[0], y: p1[1], h: 88, bg: CY }] : [])]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.66, 0, 0.2); s.hero.rotation.y = 0.3;
      const b2 = s.P.chawan2; b2.position.set(0.5, 1.1, 0.45); h2.reach('L', V(0.5, 1.08, 0.39)); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.5, brow: 0.2, mouth: 'smile', look: [-0.4, 0] });
      holdBowl(s, 'L', V(-0.82, 1.1, 0.62)); const hp = headPos(s.hero); const ch = s.P.hashi; const eat = Math.abs(Math.sin(lt * 5)) * 0.08;
      ch.position.set(hp.x + 0.1, hp.y - 0.32 + eat, hp.z + 0.42); ch.rotation.set(0, 0, 0.9); h.reach('R', ch.position.clone().add(V(0.02, -0.05, -0.05)));
      h.face(lt < 2.4 ? { lid: 0.6, brow: 0.3, look: [0, -0.2], mouth: 'o', open: 0.4 + eat * 3 } : { lid: 0, brow: -0.6, browY: 1, look: [0.5, 0], mouth: 'o', open: 1 });
    } },
  // 4) day 10: no second helping (rice cooker)
  { sc: 'st', say: ['d10'], pre: 0.15, pal: ['#4fc38a', '#e6f8ee', '#ffd23a'], show: ['desk', 'cooker'], hud: ['10日目', '×1024'], hudColor: YEL,
    cam: { p0: [0.1, 1.42, 4.8], p1: [0.1, 1.4, 4.5], l0: [0.1, 1.4, 0] },
    sfx: [[0.4, 'text_pa', -10], [2.6, 'comic_tsukkomi', -10]],
    stamps: [{ t: 2.7, text: 'おかわり禁止', x: 700, y: 820, rot: 8, color: RED, size: 76, dur: 1.6 }],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '1杯 [3万9千円]', y: 480, size: 70, border: YEL, sub: '38円×2¹⁰（試算）' }] : []; },
    act(lt, s) {
      s.P.desk.position.set(0.62, 0, -0.15); s.P.cooker.position.set(0.62, 0.77, -0.15); s.P.cooker.rotation.y = -0.2;
      const h = s.hero.userData; s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.35;
      const back = ease(k(lt, 2.6, 3.0)); const b = holdBowl(s, 'R', V(lerp(0.3, -0.05, back), lerp(1.08, 1.12, back), lerp(0.2, 0.55, back))); b.userData.rice.visible = false;
      h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 2.6 ? { lid: 0.2, brow: 0.4, look: [0.8, -0.2], mouth: 'smile' } : { lid: 0.1, brow: -0.8, browY: 1, look: [0, 0], mouth: 'o', open: 0.8 });
    } },
  // 6) day 20: one onigiri = a house
  { sc: 'st', say: ['d20'], pre: 0.15, hold: 0.3, pal: ['#3fa8ff', '#e4f3ff', '#ffd23a'], show: ['house'], hud: ['20日目', '×105万'], hudColor: YEL,
    cam: { p0: [0.2, 1.5, 5.4], p1: [0.2, 1.48, 5.1], l0: [0.2, 1.45, 0] },
    sfx: [[0.3, 'sparkle', -12], [1.6, 'text_pa', -10], [2.8, 'comic_surprise', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: 'おにぎり [2,700万円]', y: 480, size: 64, border: YEL, sub: '生米45g＝25円×2²⁰（試算）' }] : []; },
    tags(lt) { return lt > 2.6 ? [{ t: 2.6, text: '家と同じくらい', x: 760, y: 1240, h: 80, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const ho = s.P.house; ho.position.set(0.85, 0, -0.6); ho.rotation.y = -0.35;
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.25;
      const up = ease(k(lt, 0.2, 0.8)); hold(s, 'oni1', 'R', V(-0.15, lerp(1.1, 1.75, up), 0.55)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.6, 1.5);
      h.face(lt < 2.5 ? { lid: 0.1, brow: 0.6, look: [0.4, 0.8], mouth: 'smile' } : { lid: 0, brow: -0.6, browY: 1, look: [0.8, 0], mouth: 'o', open: 1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) day 30: one grain = 12 million (the cold open, in its place)
  { sc: 'st', say: ['grain'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['30日目', '×10億'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 5.4], p1: [0.1, 1.48, 5.1], l0: [0.0, 1.35, 0] },
    shake: [[1.0, 0.06, 0.5]],
    sfx: [[0.75, 'whoosh_swing', -12], [1.0, 'impact_doon', -10], [2.0, 'text_pa', -10]],
    stamps: [{ t: 1.0, text: 'あっ!!', x: 760, y: 820, rot: 8, color: YEL, size: 100, dur: 0.8 }],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: 'ご飯1粒 [1,200万円]', y: 480, size: 64, border: RED, sub: '1杯＝約3,250粒と仮定（試算）' }] : []; },
    act(lt, s) {
      drop(s, lt, 0.75); const h = s.hero.userData;
      h.face(lt < 0.8 ? { lid: 0.2, look: [0.3, -0.3], mouth: 'smile' } : lt < 1.9 ? { lid: 0, brow: -0.9, browY: 1, look: [0.6, -0.8], mouth: 'o', open: 1.1 } : { lid: 0.3, brow: -0.5, browY: 1, look: [0.3, 0.3], mouth: 'o', open: 0.5 });
    } },
  // 9) washing the bowl washes away 100 million yen
  { sc: 'st', say: ['wash'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.85, show: ['sink'], hud: ['30日目', '×10億'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.6], p1: [0.0, 1.4, 4.3], l0: [0.0, 1.4, 0] },
    sfx: [[0.2, 'whoosh_slide', -14], [1.2, 'whoosh_slide', -14], [1.6, 'text_pa', -10], [2.4, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '10粒 [1億2千万円]', y: 480, size: 64, border: RED, sub: '茶わんにこびりつく分（試算）' }] : []; },
    act(lt, s) {
      const sk = s.P.sink; sk.position.set(0.45, 0, -0.35);
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.25); s.hero.rotation.y = 0.4;
      const b = holdBowl(s, 'R', V(0.38, 0.98, -0.22)); b.rotation.set(0.2, 0, -0.8); b.userData.rice.visible = false; h.arm('L', 0.3, 0.3, 1.9);
      const dr = s.P.drops; dr.visible = true; dr.userData.items.forEach((d, i) => { const u = ((lt * 1.4 + i / 16) % 1); d.position.set(0.45 + Math.sin(i) * 0.02, 1.2 - u * 0.35, -0.3); });
      const gs = s.P.grains; gs.visible = true; gs.userData.items.forEach((g, i) => { const u = clamp((lt - 0.4 - i * 0.12) / 0.9); g.position.set(0.4 + Math.sin(i * 2) * 0.08 * (1 - u), lerp(0.98, 0.87, u), lerp(-0.18, -0.33, u)); g.rotation.z = i + lt * 6 * (1 - u); g.visible = u < 1; });
      h.face(lt < 1.4 ? { lid: 0.4, brow: 0.2, look: [0.8, -0.4], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.8, -0.5], mouth: 'o', open: 1.1 });
    } },
  // 10) good news (paddy) / bad news (all banknotes = 38 bags)
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: [],
    cam: { p0: [0.1, 1.45, 4.9], p1: [0.0, 1.43, 4.9], l0: [0.0, 1.4, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', '農家'] : ['悪いニュース', 'お札']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [2.3, 'text_pa', -11], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 2.6, 'comic_fall', -13]],
    cards(lt) { const a = this.lt.bad; return lt < a ? (lt > 2.2 ? [{ t: 2.2, text: '田んぼ1枚 [300兆円]', y: 480, size: 64, border: YEL, sub: '10aで約500kgと仮定（試算）' }] : [])
      : (lt > a + 2.2 ? [{ t: a + 2.2, text: '5kg袋 [38袋]だけ', y: 480, size: 66, border: RED, sub: '1袋3兆円（試算）' }] : []); },
    note: 'お札の残高116兆円（日銀 2026年3月末）',
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad;
      if (!late) {
        const p = s.P.paddy; p.visible = true; p.position.set(0.2, 0, -1.0); p.userData.items.forEach((it, i) => { it.rotation.z = Math.sin(lt * 2 + i * 0.7) * 0.12; });
        s.hero.position.set(-0.1, 0, 0.5); s.hero.rotation.y = 0.1; h.body.position.y = Math.abs(Math.sin(lt * 6)) * 0.05;
        h.arm('L', 0.1, 2.6, 0.3); h.arm('R', 0.1, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0.2, brow: 0.6, mouth: 'smile', look: [0, 0.3] });
      } else {
        const n = s.P.notes; n.visible = true; n.position.set(-0.5, 0, -0.5); n.rotation.y = 0.3;
        s.hero.position.set(0.45, 0, 0.3); s.hero.rotation.y = -0.2;
        const bg = s.P.ricebag; bg.visible = true; bg.position.set(0.72, 0.8, 0.55); bg.scale.setScalar(0.6); h.reach('R', V(0.78, 0.9, 0.5)); h.arm('L', 0.3, 0.6, 1.5);
        h.face(lt < sh.lt.bad + 2.1 ? { lid: 0.3, brow: 0.3, look: [-0.6, 0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); }
    } },
  // 11) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, hold: 0.6, pal: HOOK, show: ['desk', 'cooker'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'おかわり', x: 320, y: 1040, h: 118, bg: CY }, { t: t0 + 0.2, text: 'パンにする', x: 760, y: 1040, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1170, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1450, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      s.P.desk.position.set(0.75, 0, -0.4); s.P.cooker.position.set(0.75, 0.77, -0.4);
      const h = s.hero.userData; s.hero.position.set(-0.15, 0, 0.2); s.hero.rotation.y = 0.05;
      holdBowl(s, 'R', V(0.22, 1.25, 0.6)); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもお米の値段が', '毎日[2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['お米', '毎日×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
