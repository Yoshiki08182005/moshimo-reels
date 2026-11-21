// ep48_yuki2x (pop / arm C ニュース起点): もしも雪が毎日2倍積もったら？
// 入り口：青森市の初雪・各地の初冠雪の話題（2026年11月）。型は sp_geppu2x / ep47。台本・数字・小道具は自作。
// 前提（試算）: 積雪の深さ n日目 = 1cm × 2^(n-1)
//   4日目 8cm / 6日目 32cm / 8日目 128cm / 9日目 256cm / 11日目 1,024cm / 14日目 8,192cm / 20日目 524,288cm = 5,243m ＞ 富士山 3,776m
//   青森市の累積降雪量の平年値 566cm（気象庁 青森地方気象台）→ 1,024 / 566 = 1.81 ≒ 1.8倍
//   新雪の密度 30〜150kg/m³（新潟県）→ 100kg/m³ と仮定
//   屋根 100m² × 2.56m × 0.1t/m³ = 25.6t ≒ 26トン ÷ 軽自動車 約0.85t = 30台
//   玄関前 10m² × 2.56m = 25.6m³ ÷ スコップ1杯 0.02m³ = 1,280杯（1杯5秒で約1.8時間）
//   14日目 81.92m × 0.1（水/新雪の密度比）= 8.2m の水
import { run, THREE, V, clamp, ease, lerp, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl, caps } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep48_yuki2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#7fb6e8', '#f2ead9', '#c9523f'];
const WHITE = '#ffffff';

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // front door: frame + panel hinged on the right edge (panel.userData.pivot), snow wall behind
  { const d = G(); const fc = '#8a5a3a';
    rbox(0.1, 2.15, 0.16, 0.02, fc, -0.55, 1.075, 0, d); rbox(0.1, 2.15, 0.16, 0.02, fc, 0.55, 1.075, 0, d); rbox(1.2, 0.12, 0.16, 0.02, fc, 0, 2.15, 0, d);
    const wall = G(); d.add(wall); wall.position.set(0, 0, -0.12);
    rbox(1.02, 2.1, 0.12, 0.04, M(WHITE, 0.95), 0, 1.05, 0, wall);
    for (let i = 0; i < 9; i++) sph(0.16 + (i % 3) * 0.05, M(WHITE, 0.95), -0.38 + (i % 3) * 0.38, 0.3 + Math.floor(i / 3) * 0.72, 0.06, wall, 1, 1, 0.5);
    const piv = G(); piv.position.set(0.5, 0, 0.02); d.add(piv);
    rbox(0.98, 2.04, 0.06, 0.02, '#c98f4a', -0.49, 1.03, 0, piv);
    rbox(0.7, 0.7, 0.02, 0.02, '#b07a3e', -0.49, 1.45, 0.035, piv); rbox(0.7, 0.6, 0.02, 0.02, '#b07a3e', -0.49, 0.55, 0.035, piv);
    sph(0.045, '#ffd23a', -0.88, 1.0, 0.06, piv);
    d.userData.pivot = piv; reg('door', d); }
  // snow lump that lands on the hero's head; floor heap by the door
  { const g = G(); sph(0.3, M(WHITE, 0.95), 0, 0, 0, g, 1.15, 0.55, 1.1); sph(0.16, M(WHITE, 0.95), 0.12, 0.12, 0.05, g); sph(0.12, M(WHITE, 0.95), -0.14, 0.1, -0.02, g); reg('lump', g); }
  { const g = G(); sph(0.5, M(WHITE, 0.95), 0, 0, 0, g, 1.2, 0.35, 0.8); sph(0.25, M(WHITE, 0.95), 0.4, 0.05, 0.2, g, 1, 0.6, 1); reg('heap', g); }
  // ground snow layer (scale.y = depth), origin at the bottom
  { const g = G(); rbox(7.5, 1, 3.4, 0.04, M(WHITE, 0.95), 0, 0.5, 0, g); for (let i = 0; i < 12; i++) sph(0.22, M(WHITE, 0.95), -3.3 + i * 0.6, 1.0, 1.62, g, 1.4, 0.18, 0.4); reg('snowbed', g); }
  // snow gauge pole (red / white every 20cm)
  { const g = G(); for (let i = 0; i < 12; i++) cyl(0.035, 0.035, 0.2, i % 2 ? WHITE : '#e2463c', 0, 0.1 + i * 0.2, 0, g); sph(0.05, '#e2463c', 0, 2.42, 0, g); reg('gauge', g); }
  // snowman (origin at the bottom, about 0.55 tall)
  const mkMan = (g) => { sph(0.2, M(WHITE, 0.9), 0, 0.19, 0, g); sph(0.14, M(WHITE, 0.9), 0, 0.45, 0, g);
    sph(0.022, '#23262f', -0.05, 0.48, 0.125, g); sph(0.022, '#23262f', 0.05, 0.48, 0.125, g);
    const n = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 10), M('#ff8f3a')); n.rotation.x = Math.PI / 2; n.position.set(0, 0.44, 0.18); g.add(n);
    cyl(0.1, 0.11, 0.08, '#e2463c', 0, 0.6, 0, g); return g; };
  reg('man', mkMan(G())); reg('manB', mkMan(G()));
  // rain boots (pair, origin at ground)
  { const g = G(); for (const x of [-0.13, 0.13]) { cyl(0.1, 0.11, 0.26, '#ffc533', x, 0.13, 0.03, g); rbox(0.2, 0.06, 0.3, 0.03, '#e2a51a', x, 0.03, 0.06, g); } reg('boots', g); }
  // house (flat roof), snow slab on the roof (scale.y = thickness)
  for (const n of ['house', 'houseB']) { const h = G(); rbox(1.2, 0.95, 1.0, 0.04, '#f4efe6', 0, 0.475, 0, h); rbox(1.34, 0.1, 1.12, 0.03, '#3f6fd8', 0, 1.0, 0, h);
    rbox(0.26, 0.5, 0.03, 0.02, '#8a5a3a', -0.25, 0.25, 0.51, h); rbox(0.32, 0.26, 0.03, 0.02, '#7fb8d8', 0.25, 0.58, 0.51, h);
    const slab = G(); slab.position.y = 1.05; h.add(slab); rbox(1.38, 1, 1.14, 0.06, M(WHITE, 0.95), 0, 0.5, 0, slab); h.userData.slab = slab; slab.scale.y = 0.01; reg(n, h); }
  // shovel (origin at the upper grip; blade at -y)
  { const g = G(); caps(0.025, 0.85, '#c98f4a', 0, -0.45, 0, g); rbox(0.14, 0.05, 0.05, 0.02, '#2c3b6b', 0, 0.0, 0, g);
    rbox(0.3, 0.34, 0.03, 0.02, '#e2463c', 0, -1.03, 0.05, g); sph(0.1, M(WHITE, 0.95), 0, -1.0, 0.1, g, 1.3, 0.6, 0.6); reg('shovel', g); }
  // snow pile (scale grows)
  { const g = G(); sph(0.6, M(WHITE, 0.95), 0, 0, 0, g, 1, 0.8, 0.9); sph(0.3, M(WHITE, 0.95), 0.4, -0.1, 0.25, g); reg('pile', g); }
  // melt water (translucent box, scale.y = depth)
  { const g = G(); const m = new THREE.MeshStandardMaterial({ color: '#4fa8ff', roughness: 0.2, transparent: true, opacity: 0.55, depthWrite: false });
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1, 1.4), m); b.position.y = 0.5; g.add(b); reg('water', g); }
  // tree tops (poke out of 10m of snow)
  { const g = G(); for (const [x, z, s] of [[-1.6, -1.2, 1], [1.3, -1.5, 1.3], [2.2, -0.6, 0.8], [-2.4, -0.3, 0.9]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.32 * s, 0.8 * s, 8), M('#2f8f5b')); c.position.set(x, 0.35 * s, z); c.castShadow = true; g.add(c); sph(0.16 * s, M(WHITE, 0.95), x, 0.62 * s, z, g, 1, 0.5, 1); }
    reg('trees', g); }
  // Mt. Fuji toy and a snow column next to it (scale.y = height)
  { const g = G(); const c = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.5, 24), M('#5a6fa8')); c.position.y = 0.75; c.castShadow = true; g.add(c);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.47, 0.55, 24), M(WHITE, 0.9)); cap.position.y = 1.23; g.add(cap); reg('fuji', g); }
  { const g = G(); cyl(0.32, 0.36, 1, M(WHITE, 0.95), 0, 0.5, 0, g); sph(0.34, M(WHITE, 0.95), 0, 1.0, 0, g, 1, 0.4, 1); reg('col', g); }
  reg('sball', sph(0.09, M(WHITE, 0.9)));
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero || o === S.hero2) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const bed = (s, d) => { const b = s.P.snowbed; b.visible = true; b.position.set(0, 0, -0.65); b.scale.set(1, Math.max(0.005, d), 1); };
function flakes(s, lt, sp = 0.3) { const f = s.P.snow; f.visible = true; f.position.set(0, 0, 0); f.scale.setScalar(1);
  f.userData.items.forEach((m, i) => { const u = (lt * sp + (i * 0.618) % 1) % 1; m.visible = true; m.position.set(Math.sin(i * 12.9) * 2.2 + Math.sin(lt + i) * 0.06, 3.2 - u * 3.2, -1.8 + (i % 5) * 0.6); }); }
// the door bursts open at t0 and a lump of snow lands on the hero's head
function doorBurst(s, lt, t0) {
  const d = s.P.door; d.visible = true; d.position.set(0.35, 0, -0.75); d.rotation.set(0, 0, 0);
  const a = 1.75 * ease(k(lt, t0 - 0.15, t0 + 0.05)); d.userData.pivot.rotation.y = a + (lt > t0 + 0.05 ? 0.06 * Math.exp(-(lt - t0) * 6) * Math.sin((lt - t0) * 30) : 0);
  const h = s.hero.userData; const L = s.P.lump; const hit = lt > t0 + 0.1;
  if (lt > t0) { L.visible = true; h.head.add(L); const u = k(lt, t0, t0 + 0.1); L.position.set(0.02, lerp(1.4, 0.42, u * u), 0); L.rotation.set(0, 0, -0.1);
    const sq = hit ? 1 - 0.2 * Math.exp(-(lt - t0) * 9) : 1; L.scale.set(1 / sq, sq, 1); }
  if (lt > t0) { const hp = s.P.heap; hp.visible = true; hp.position.set(0.3, 0, -0.3); const g = ease(k(lt, t0, t0 + 0.25)); hp.scale.set(g, g, g); }
  return hit;
}

const plan = [
  // 0) cold open (flash-forward of day 9): opening the front door -> a wall of snow, a lump lands on the head; push in to a deadpan face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.55, 6.6], p1: [-0.4, 1.55, 3.4], l0: [0.0, 1.25, -0.4], l1: [-0.42, 1.48, 0.2], hold: 1.2, dur: 2.0 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.24, 0.9]],
    sfx: [[0.05, 'whoosh_swing', -12], [0.25, 'impact_doon', -9], [0.27, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -11]],
    stamps: [{ t: 0.28, text: 'ドアの外 雪2.6m!!', x: 540, y: 400, rot: -6, color: YEL, size: 84, dur: 1.15 },
      { t: 2.3, text: 'さむ…', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 60, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.45, 0.15, 0.25); const hit = doorBurst(s, lt, 0.15);
      if (!hit) { h.reach('R', V(-0.1, 1.0, -0.62)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0], mouth: 'smile' }); }
      else if (lt < 1.4) { h.arm('R', 0.6, 1.3, 0.6); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.4], mouth: 'o', open: 1 }); }
      else { h.arm('R', 0.3, 0.3, 1.9); h.arm('L', 0.3, 0.3, 1.9); h.face({ lid: 0.6, brow: -0.3, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = -0.1 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title: snow begins to fall
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.5, 'comic_surprise', -12]],
    stamps: [{ t: 1.6, text: '毎日2倍?!', x: 800, y: 1080, rot: 8, color: RED, size: 70, dur: 1.1 }],
    act(lt, s) {
      flakes(s, lt); const h = s.hero.userData; place(s.hero, 0, 0.4, 0);
      h.arm('R', 0.9, 0.5, 0.6); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.4, look: [0.3, 0.8], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) day 1: 1 cm
  { sc: 'st', say: ['d1'], pre: 0.15, pal: ['#9ad0ff', '#eef7ff', '#3f6fd8'], show: ['gauge'], hud: ['積雪', '1cm'],
    cam: { p0: [0.1, 1.4, 5.0], p1: [0.1, 1.38, 4.7], l0: [0.1, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.0, 'sparkle', -15]],
    cards(lt) { return lt > 0.7 ? [{ t: 0.7, text: '1日目 [1cm]', y: 480, size: 72, border: CY, sub: '積雪の深さが毎日2倍（試算）' }] : []; },
    act(lt, s) {
      flakes(s, lt, 0.2); bed(s, 0.03); place(s.P.gauge, 0.8, 0.1);
      const h = s.hero.userData; place(s.hero, -0.3, 0.4, 0.2);
      h.arm('R', 0.8, 0.4, 0.5); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, -0.5], mouth: 'smile' });
    } },
  // 3) day 4: 8 cm, palm-size snowman
  { sc: 'st', say: ['d4'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['gauge'], hud: ['積雪', '8cm'],
    cam: { p0: [0.0, 1.4, 4.4], p1: [0.0, 1.38, 4.1], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'comic_pico', -12]],
    tags(lt) { const t0 = 0.6; return lt > t0 ? [{ t: t0, text: '1日目 1cm', x: 300, y: 1150, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '4日目 8cm', x: 760, y: 1150, h: 96, bg: CY }] : []; },
    act(lt, s) {
      bed(s, lerp(0.06, 0.1, k(lt, 0, 2))); place(s.P.gauge, 0.85, -0.2);
      const h = s.hero.userData; place(s.hero, -0.15, 0.45, 0.1);
      const m = s.P.man; m.visible = true; const hp = V(0.18, 1.0, 0.85); m.position.copy(hp); m.scale.setScalar(0.4); m.rotation.set(0, -0.2, 0);
      h.reach('R', hp.clone().add(V(0.02, -0.05, 0))); h.hand('R', 'pa'); h.arm('L', 0.4, 0.6, 1.5); h.hand('L', 'choki');
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.4, look: [0.4, -0.4], mouth: 'smile' } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 4) day 6: 32 cm, boots sink
  { sc: 'st', say: ['d6'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['gauge'], hud: ['積雪', '32cm'],
    cam: { p0: [0.0, 1.3, 4.6], p1: [0.0, 1.28, 4.3], l0: [0.0, 1.0, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.7, 'comic_fall', -12]],
    cards(lt) { return lt > 1.6 ? [{ t: 1.6, text: '長靴 [アウト]', y: 480, size: 72, border: RED, sub: '長靴 約30cm ＜ 雪 32cm' }] : []; },
    stamps: [{ t: 1.8, text: 'ズボッ!', x: 760, y: 1250, rot: 6, color: '#ffffff', size: 70, dur: 1.0 }],
    act(lt, s) {
      const d = lerp(0.12, 0.34, ease(k(lt, 0.2, 1.8))); bed(s, d); place(s.P.gauge, 0.85, -0.2);
      const h = s.hero.userData; place(s.hero, -0.15, 0.5, 0.1); place(s.P.boots, -0.15, 0.5, 0.1);
      h.arm('L', 0.6, 1.1, 0.5); h.arm('R', 0.6, 1.1, 0.5); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.7 ? { lid: 0.2, brow: 0.2, look: [0, -0.8], mouth: 'o', open: 0.4 } : { lid: 0, brow: -1, browY: 1, look: [0, -0.6], mouth: 'o', open: 1.0 });
    } },
  // 5) day 8: 1.3 m, buried to the chest
  { sc: 'st', say: ['d8'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['gauge'], hud: ['積雪', '1.3m'],
    cam: { p0: [0.0, 1.5, 4.6], p1: [0.0, 1.48, 4.3], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.5, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.8 ? [{ t: 0.8, text: '8日目 [1.3m]', y: 480, size: 72, border: CY, sub: '1cm×2⁷＝128cm（試算）' }] : []; },
    stamps: [{ t: 2.0, text: '動けない…', x: 780, y: 1180, rot: 6, color: '#ffffff', size: 64, dur: 1.2 }],
    act(lt, s) {
      flakes(s, lt, 0.4); bed(s, lerp(0.8, 1.0, ease(k(lt, 0, 1.5)))); place(s.P.gauge, 0.9, -0.3);
      const h = s.hero.userData; place(s.hero, -0.1, 0.35, 0.05);
      const w = Math.sin(lt * 5) * 0.3; h.arm('L', 0.4, 2.6 + w, 0.4); h.arm('R', 0.4, 2.6 - w, 0.4); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.4 ? { lid: 0.1, brow: -0.5, look: [0, 0], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
    } },
  // 6) day 9: 2.6 m -> the cold open, in its place
  { sc: 'st', say: ['d9'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['積雪', '2.6m'],
    cam: { p0: [0.0, 1.55, 6.6], p1: [0.0, 1.55, 6.2], l0: [0.0, 1.25, -0.4] },
    shake: [[1.0, 0.07, 0.5]], lines: [[1.0, 0.7]],
    sfx: [[0.85, 'whoosh_swing', -12], [1.0, 'impact_doon', -10], [1.4, 'text_pa', -10]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '9日目 [2.6m]', y: 480, size: 72, border: YEL, sub: '1cm×2⁸＝256cm（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.45, 0.15, 0.25); const hit = doorBurst(s, lt, 0.85);
      if (!hit) { h.reach('R', V(-0.1, 1.0, -0.62)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0], mouth: 'smile' }); }
      else { h.arm('R', 0.6, 1.3, 0.6); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.4], mouth: 'o', open: 1 }); }
    } },
  // 7) day 11: 10 m, standing on top of the snow; only tree tops poke out
  { sc: 'st', say: ['d11'], pre: 0.15, pal: ['#2f6fb0', '#f4f8ff', '#ffffff'], show: ['trees'], hud: ['積雪', '10m'],
    cam: { p0: [0.0, 1.7, 5.6], p1: [0.0, 1.6, 5.2], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.0, 'text_pa', -10], [2.8, 'comic_surprise', -13]],
    cards(lt) { return lt < 1.9 ? (lt > 0.4 ? [{ t: 0.4, text: '11日目 [10m]', y: 480, size: 72, border: CY, sub: '1cm×2¹⁰＝1,024cm（試算）' }] : [])
      : [{ t: 1.9, text: '青森の1冬の [1.8倍]', y: 480, size: 64, border: YEL, sub: '平年の累積降雪量 566cm' }]; },
    stamps: [{ t: 1.0, text: '家が見えない', x: 780, y: 1250, rot: 6, color: '#2c3b6b', size: 58, dur: 1.2 }],
    note: '気象庁 青森地方気象台 累積降雪量の平年値',
    act(lt, s) {
      flakes(s, lt, 0.3); place(s.P.trees, 0, 0);
      const h = s.hero.userData; place(s.hero, 0, 0.3, Math.sin(lt * 1.2) * 0.4);
      h.arm('R', 1.2, 0.3, 0.3); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face(lt < 1.9 ? { lid: 0.1, brow: 0.3, look: [0.6, 0], mouth: 'o', open: 0.5 } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) roof snow 26 t
  { sc: 'st', say: ['roof'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: [], hud: ['屋根の雪', '26トン'], hudColor: RED,
    cam: { p0: [0.1, 1.9, 7.0], p1: [0.1, 1.85, 6.6], l0: [0.1, 1.35, -0.3] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'crack_rock', -12], [2.3, 'text_pa', -10]],
    cards(lt) { return lt > 0.7 ? [{ t: 0.7, text: '屋根に [26トン]', y: 480, size: 72, border: RED, sub: '100㎡×2.56m×0.1t/m³（試算）' }] : []; },
    tags(lt) { const t0 = 2.2; return lt > t0 ? [{ t: t0, text: '軽自動車 30台分', x: 540, y: 1040, h: 96, bg: YEL }] : []; },
    note: '新雪の密度 30〜150kg/m³（新潟県）→100で試算',
    act(lt, s) {
      const ho = s.P.house; place(ho, 0.45, -0.7); ho.scale.setScalar(0.95);
      const t = ease(k(lt, 0.1, 1.5)); ho.userData.slab.scale.y = lerp(0.1, 1.1, t);
      const sag = lt > 1.6 ? 0.06 * ease(k(lt, 1.6, 1.9)) : 0; ho.scale.y = 0.95 * (1 - sag);
      const h = s.hero.userData; place(s.hero, -0.75, 0.45, 0.3);
      h.arm('R', 0.8, 0.6, 0.4); h.hand('R', 'pa'); h.arm('L', 0.4, 0.4, 1.8);
      h.face(lt < 1.6 ? { lid: 0.1, brow: 0, look: [0.6, 0.5], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0.4], mouth: 'o', open: 1.1 });
    } },
  // 10) shoveling: 1,280 scoops
  { sc: 'st', say: ['kaki'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], show: [], hud: ['雪かき', '1,280杯'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.2, 0] },
    sfx: [[0.4, 'whoosh_swing', -13], [1.2, 'whoosh_swing', -13], [1.6, 'text_pa', -10], [2.6, 'comic_shock2', -13]],
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 数十杯', x: 300, y: 1150, h: 76, bg: '#ffffff' }, { t: t0 + 0.9, text: 'あなた 1,280杯', x: 760, y: 1150, h: 96, bg: RED, fg: '#ffffff' }] : []; },
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '[約1.8時間] ノンストップ', y: 480, size: 60, border: RED, sub: '10㎡×2.56m÷1杯0.02m³、1杯5秒（試算）' }] : []; },
    stamps: [{ t: 2.6, text: 'ゼェゼェ…', x: 780, y: 1300, rot: 6, color: '#ffffff', size: 62, dur: 1.0 }],
    act(lt, s) {
      bed(s, 0.25); const pl = s.P.pile; pl.visible = true; pl.position.set(0.85, 0.2, -0.3); pl.scale.setScalar(lerp(0.6, 1.3, k(lt, 0, 3)));
      const h = s.hero.userData; place(s.hero, -0.35, 0.5, 0.35);
      const sw = (Math.sin(lt * 4.5) + 1) / 2; const grip = V(-0.05 + sw * 0.15, 1.0 + sw * 0.2, 0.75);
      const sh = s.P.shovel; sh.visible = true; sh.position.copy(grip); sh.rotation.set(0.4, 0, lerp(1.0, 0.5, sw));
      h.reach('R', grip.clone().add(V(0.05, -0.05, -0.03))); h.reach('L', grip.clone().add(V(-0.28, -0.25, -0.03))); h.hand('R', 'gu'); h.hand('L', 'gu');
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.3, look: [0.6, -0.2], mouth: 'flat' } : { lid: 0.3, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
    } },
  // 11) melt: 8 m of water over a toy house
  { sc: 'st', say: ['melt'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['とけた水', '8m'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.0], p1: [0.0, 1.58, 5.7], l0: [0.0, 1.2, 0] },
    sfx: [[0.4, 'whoosh_slide', -13], [1.4, 'text_pa', -10], [2.2, 'comic_fall', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '水だけで [8m]', y: 480, size: 72, border: RED, sub: '14日目 82m×密度0.1（試算）' }] : []; },
    tags(lt) { const t0 = 1.9; return lt > t0 ? [{ t: t0, text: '2階建ての家より高い', x: 540, y: 1040, h: 80, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const ho = s.P.houseB; place(ho, 0.55, -0.4); ho.scale.setScalar(0.8);
      const w = s.P.water; place(w, 0.55, -0.4); w.scale.set(1, lerp(0.05, 1.25, ease(k(lt, 0.3, 2.0))), 1);
      const h = s.hero.userData; place(s.hero, -0.55, 0.45, 0.3);
      h.arm('R', 0.7, 0.7, 0.4); h.hand('R', 'pa'); h.arm('L', 0.5, 0.9, 1.2); h.hand('L', 'pa');
      h.face(lt < 1.2 ? { lid: 0.2, brow: 0, look: [0.6, -0.2], mouth: 'o', open: 0.4 } : { lid: 0, brow: -1, browY: 1, look: [0.4, 0], mouth: 'o', open: 1.0 });
    } },
  // 12) good news (snowball fight) / bad news (higher than Mt. Fuji on day 20)
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [], hud: ['20日目', '5,243m'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.0], p1: [0.0, 1.58, 5.7], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.0, 'whoosh_swing', -12], [1.3, 'comic_boyon', -11], [2.3, 'text_pa', -10], [3.6, 'giant_step', -12], [4.4, 'comic_jajean', -13]],
    cards(lt) { const b = 2.35; return lt < b ? (lt > 0.25 ? [{ t: 0.25, text: '雪合戦 [し放題]', y: 480, size: 64, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: b, text: '[富士山] 超え', y: 480, size: 72, border: RED, sub: '悪いニュース 1cm×2¹⁹＝5,243m' }]; },
    stamps: [{ t: 1.3, text: 'ボフッ!', x: 300, y: 1150, rot: -6, color: '#ffffff', size: 64, dur: 0.8 }],
    act(lt, s) {
      const h = s.hero.userData; const b = 2.35;
      if (lt < b) { const h2 = s.hero2.userData; place(s.hero, -0.68, 0.3, 0.35); place(s.hero2, 0.68, 0.3, -0.35); bed(s, 0.1);
        const u = k(lt, 0.8, 1.25); const ball = s.P.sball; ball.visible = lt > 0.6 && lt < 1.3;
        ball.position.set(lerp(0.55, -0.62, u), 1.25 + Math.sin(u * Math.PI) * 0.5, lerp(0.75, 0.55, u));
        if (lt < 0.8) { h2.reach('L', V(0.5, 1.2, 0.75)); h2.hand('L', 'gu'); } else h2.arm('L', 1.4, 0.4, 0.2);
        h2.arm('R', 0.3, 0.4, 1.6); h2.face({ lid: 0.3, brow: 0.6, look: [-0.6, 0], mouth: 'smile' });
        if (lt > 1.25) { const L = s.P.lump; L.visible = true; h.head.add(L); L.position.set(0.1, 0.05, 0.38); L.rotation.set(1.3, 0, 0); L.scale.setScalar(0.45);
          h.face({ lid: 0.7, brow: -0.4, look: [0, 0], mouth: 'flat' }); } else h.face({ lid: 0.1, brow: 0.5, look: [0.6, 0], mouth: 'smile' });
        h.arm('L', 0.6, 1.1, 0.5); h.arm('R', 0.6, 1.1, 0.5); h.hand('L', 'pa'); h.hand('R', 'pa'); }
      else { s.hero2.visible = false; const f = s.P.fuji; place(f, 0.35, -1.3);
        const c = s.P.col; place(c, 0.95, -2.0); c.scale.set(1, lerp(0.3, 2.6, ease(k(lt, b + 0.4, b + 2.0))), 1);
        place(s.hero, -0.5, 0.6, 0.25); h.arm('R', 0.9, 0.5, 0.3); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.8);
        h.face(lt < b + 1.4 ? { lid: 0.1, brow: 0.2, look: [0.3, 0.7], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0.2, 0.8], mouth: 'o', open: 1.1 }); }
    } },
  // 13) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '積もってほしい', x: 320, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '1cmで十分', x: 770, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      flakes(s, lt, 0.15); const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      const m = s.P.manB; m.visible = true; const hp = V(0.3, 0.98, 0.6); m.position.copy(hp); m.scale.setScalar(0.4); m.rotation.set(0, -0.3, 0);
      h.reach('R', hp.clone().add(V(0.02, -0.05, 0))); h.hand('R', 'pa');
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[雪]が', '毎日2倍積もったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['雪', '毎日2倍'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
