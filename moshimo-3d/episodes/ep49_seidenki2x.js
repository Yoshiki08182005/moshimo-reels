// ep49_seidenki2x (pop / arm A 原因を拡大): もしも静電気が毎回2倍強くなったら？
// 型は sp_geppu2x / ep48。台本・数字・小道具は自作。
// 前提（試算）: 1回目 V=1万V（湿度20%で人の帯電は1万V超：大阪産業技術研究所 技術資料）、人体の容量 C=100pF（静電気試験の人体モデル）
//   E1 = ½CV² = 5mJ、n回目 E = 5mJ × 2^(n-1)、電圧は √2 倍ずつ（V ∝ √E）
//   12回目 10.24J ≥ LED電球 8W×1秒 / 21回目 1,024万V ÷ 3kV/mm ≒ 3.4m の火花 / 24回目 4.19万J ≥ 電子レンジ600W×60秒 3.6万J
//   34回目 4,295万J ≥ 家庭の電気 1日 約10kWh = 3,600万J / 39回目 13.7億J ≒ 雷1回 約15億J（気象庁）
//   1日10回ドアノブ → 39回目は約4日目 / 13.7億J ÷ 4,184 = 32.8万kcal ÷ おにぎり180kcal ≒ 1,825個（体のエネルギーを100%電気にできると仮定）
import { run, THREE, V, clamp, ease, lerp, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep49_seidenki2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#5b4fd8', '#efeaff', '#ffd23a'];
const UP = new THREE.Vector3(0, 1, 0);

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // door frame (origin at the floor centre)
  { const d = G(); const fc = '#8a5a3a';
    rbox(0.1, 2.15, 0.16, 0.02, fc, -0.55, 1.075, 0, d); rbox(0.1, 2.15, 0.16, 0.02, fc, 0.55, 1.075, 0, d); rbox(1.2, 0.12, 0.16, 0.02, fc, 0, 2.15, 0, d);
    rbox(1.0, 2.08, 0.04, 0.02, '#2b2f45', 0, 1.04, -0.08, d); reg('frame', d); }
  // door panel (origin at the panel centre; knob on the viewer's left)
  { const p = G(); rbox(0.98, 2.04, 0.06, 0.02, '#c98f4a', 0, 0, 0, p);
    rbox(0.7, 0.7, 0.02, 0.02, '#b07a3e', 0, 0.42, 0.035, p); rbox(0.7, 0.6, 0.02, 0.02, '#b07a3e', 0, -0.48, 0.035, p);
    sph(0.05, M('#d9dde4', 0.25), -0.38, -0.03, 0.07, p); reg('panel', p); }
  // zig-zag bolts (segments are unit cylinders placed each frame)
  const zm = basic('#fff7a8'), zc = basic('#ffffff');
  for (const n of ['zA', 'zB', 'zC']) { const g = G(); g.userData.seg = [];
    for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 6), i % 2 ? zm : zc); g.add(c); g.userData.seg.push(c); }
    g.userData.glow = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), zm); g.add(g.userData.glow); reg(n, g); }
  // hair spikes (attached to a head in act)
  for (const n of ['spk', 'spk2']) { const g = G(); for (let i = 0; i < 9; i++) { const a = -1.25 + i * 0.31;
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 8), M(n === 'spk' ? '#3b2a20' : '#5a3a2a')); c.castShadow = true;
      c.position.set(Math.sin(a) * 0.36, 0.25 + Math.cos(a) * 0.12, -0.05 - Math.abs(Math.sin(a)) * 0.05); c.rotation.z = -a * 0.75; g.add(c); }
    reg(n, g); }
  // LED bulb (origin at the base)
  { const b = G(); cyl(0.05, 0.06, 0.08, '#9aa3ad', 0, 0.04, 0, b); b.userData.on = sph(0.1, basic('#fff3a8'), 0, 0.16, 0, b); b.userData.off = sph(0.1, M('#dfe6ee', 0.2), 0, 0.16, 0, b); reg('bulb', b); }
  // house with windows (origin at floor)
  { const h = G(); rbox(1.3, 1.0, 1.0, 0.04, '#f4efe6', 0, 0.5, 0, h); const roof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.6, 4), M('#e2463c')); roof.position.y = 1.3; roof.rotation.y = Math.PI / 4; roof.castShadow = true; h.add(roof);
    rbox(0.26, 0.5, 0.03, 0.02, '#8a5a3a', -0.3, 0.25, 0.51, h);
    h.userData.on = [rbox(0.3, 0.26, 0.03, 0.02, basic('#ffe27a'), 0.25, 0.6, 0.515, h), rbox(0.2, 0.18, 0.03, 0.02, basic('#ffe27a'), -0.3, 0.75, 0.515, h)];
    h.userData.off = [rbox(0.3, 0.26, 0.03, 0.02, '#4a5a74', 0.25, 0.6, 0.51, h), rbox(0.2, 0.18, 0.03, 0.02, '#4a5a74', -0.3, 0.75, 0.51, h)]; reg('house', h); }
  // carpet
  { const g = G(); rbox(2.2, 0.03, 1.4, 0.01, '#e2463c', 0, 0.015, 0, g); rbox(1.9, 0.035, 1.1, 0.01, '#ffb84a', 0, 0.02, 0, g); reg('carpet', g); }
  // smoke puffs
  { const g = G(); g.userData.items = []; const sm = new THREE.MeshStandardMaterial({ color: '#6b6f78', transparent: true, opacity: 0.75, roughness: 1 });
    for (let i = 0; i < 6; i++) g.userData.items.push(sph(0.09, sm, 0, 0, 0, g)); reg('smoke', g); }
  // single onigiri for the hand
  { const it = G(); sph(0.1, '#ffffff', 0, 0, 0, it, 1.08, 0.95, 0.72); rbox(0.12, 0.1, 0.15, 0.02, '#20301f', 0, -0.04, 0, it); reg('oni1', it); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, ry = 0, who = s.hero) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
// jagged bolt between a and b; w = thickness, amp = sideways jitter
function zap(s, name, a, b, lt, w = 0.02, amp = 0.08, glow = 0.08) {
  const g = s.P[name]; g.visible = true; g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.setScalar(1);
  const seg = g.userData.seg, n = seg.length, d = b.clone().sub(a); const side = new THREE.Vector3(-d.y, d.x, 0.3).normalize(); const side2 = d.clone().cross(side).normalize();
  const f = Math.floor(lt * 24); const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; const j = (i === 0 || i === n) ? 0 : amp; const r1 = Math.sin(i * 12.9898 + f * 78.233) * 43758.5453, r2 = Math.sin(i * 39.34 + f * 11.13) * 1234.567;
    pts.push(a.clone().lerp(b, u).addScaledVector(side, (r1 - Math.floor(r1) - 0.5) * 2 * j).addScaledVector(side2, (r2 - Math.floor(r2) - 0.5) * j)); }
  seg.forEach((c, i) => { const p = pts[i], q = pts[i + 1]; const dd = q.clone().sub(p); const L = dd.length(); c.visible = true;
    c.position.copy(p).addScaledVector(dd, 0.5); c.quaternion.setFromUnitVectors(UP, dd.normalize()); c.scale.set(w * (i % 2 ? 1 : 0.6), L, w * (i % 2 ? 1 : 0.6)); });
  const gl = g.userData.glow; gl.position.copy(b); gl.scale.setScalar(glow * (0.85 + 0.15 * Math.sin(lt * 50)));
}
const spikes = (s, who = 'spk', head = s.hero.userData.head, amt = 1) => { const g = s.P[who]; g.visible = true; head.add(g); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.set(1, Math.max(0.05, amt), 1); };
function smoke(s, lt, at, t0) { const g = s.P.smoke; g.visible = lt > t0; g.position.copy(at);
  g.userData.items.forEach((m, i) => { const u = ((lt - t0) * 0.7 + i / 6) % 1; m.position.set(Math.sin(i * 2.1 + lt) * 0.06, u * 0.7, 0); m.scale.setScalar(0.06 + u * 0.12); }); }
const KNOB = V(0.02, 1.0, -0.67);
// door at x=0.4: the hero touches the knob at t0; big = the panel flies off into the sky
function doorTouch(s, lt, t0, big) {
  place(s.P.frame, 0.4, -0.75); const pn = s.P.panel; pn.visible = true;
  const h = s.hero.userData; place(s.hero, -0.42, -0.12, 0.35);
  const hit = lt > t0;
  if (!hit) { h.reach('R', KNOB.clone().add(V(-0.08 - 0.12 * (1 - k(lt, 0, t0)), 0, 0.02))); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0], mouth: 'smile' }); pn.position.set(0.4, 1.03, -0.72); return false; }
  if (big) {
    const u = k(lt, t0 + 0.05, t0 + 1.0); pn.position.set(0.4 + u * 0.8, 1.03 + 7.5 * u * u + 1.2 * u, -0.72 + u * 0.4); pn.rotation.set(-u * 3.5, u * 1.2, u * 4.0);
    if (lt < t0 + 0.75) { zap(s, 'zA', h.handPos('R'), KNOB, lt, 0.035, 0.12, 0.16); zap(s, 'zB', V(0.4, 1.4, -0.7), V(0.6, 4.2, -1.2), lt + 0.3, 0.05, 0.3, 0.05); }
    spikes(s, 'spk', h.head, ease(k(lt, t0, t0 + 0.2)));
  } else { pn.position.set(0.4, 1.03, -0.72); if (lt < t0 + 0.3) zap(s, 'zA', h.handPos('R'), KNOB, lt, 0.012, 0.03, 0.05); }
  return true;
}

const plan = [
  // 0) cold open (flash-forward of the 39th): touch the knob -> lightning, the door flies into the sky; push in to a smug, spiky-haired face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.7, 6.8], p1: [-0.42, 1.62, 3.5], l0: [0.0, 1.6, -0.4], l1: [-0.42, 1.5, 0.0], hold: 1.2, dur: 2.0 },
    shake: [[0.2, 0.09, 0.7]], lines: [[0.2, 0.9]],
    sfx: [[0.15, 'zap_big', -9], [0.2, 'impact_doon', -10], [0.24, 'text_impact', -11], [0.5, 'whoosh_gust', -12], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -11]],
    stamps: [{ t: 0.22, text: 'ドアが空へ!!', x: 540, y: 400, rot: -6, color: YEL, size: 88, dur: 1.15 },
      { t: 2.3, text: 'パチッ', x: 600, y: 1440, rot: -5, color: '#ffffff', size: 56, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; const hit = doorTouch(s, lt, 0.15, true);
      if (!hit) return;
      if (lt < 1.3) { h.arm('R', 0.9, 0.5, 0.3); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.4, 0.6], mouth: 'o', open: 1 }); }
      else { h.arm('R', 0.5, 0.4, 1.2); h.hand('R', 'choki'); h.arm('L', 0.3, 0.3, 1.9); s.hero.rotation.y = lerp(0.35, 0.05, ease(k(lt, 1.3, 1.8)));
        h.face({ lid: 0.55, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.08 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title: shuffling on a carpet, charging up
  { sc: 'st', say: ['hook'], pal: ['#ffb84a', '#fff4dc', '#5b4fd8'], show: ['carpet'],
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.48, 5.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'zap_small', -14]],
    stamps: [{ t: 1.7, text: '毎回2倍?!', x: 800, y: 1080, rot: 8, color: RED, size: 70, dur: 1.1 }],
    act(lt, s) {
      place(s.P.carpet, 0, 0.35); const h = s.hero.userData; place(s.hero, Math.sin(lt * 5) * 0.08, 0.4, 0); s.hero.position.y = Math.abs(Math.sin(lt * 10)) * 0.03;
      h.arm('R', 0.4, 0.5, 1.4); h.arm('L', 0.4, 0.5, 1.4); h.hand('R', 'gu'); h.hand('L', 'gu');
      if (lt > 1.6) { spikes(s, 'spk', h.head, 0.4); zap(s, 'zA', h.handPos('R'), h.handPos('R').add(V(0.15, 0.12, 0.05)), lt, 0.008, 0.02, 0.03); }
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.4, look: [0, -0.6], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) 1st: 10,000 V, a small snap at the knob
  { sc: 'st', say: ['n1'], pre: 0.15, pal: ['#9ad0ff', '#eef7ff', '#3f6fd8'], show: [], hud: ['静電気', '1万V'],
    cam: { p0: [0.1, 1.45, 5.0], p1: [0.0, 1.42, 4.6], l0: [0.0, 1.25, -0.3] },
    sfx: [[0.3, 'text_pa', -10], [1.75, 'zap_small', -12]],
    cards(lt) { return lt > 0.6 ? [{ t: 0.6, text: '1回目 [1万ボルト]', y: 480, size: 72, border: CY, sub: '冬の乾燥した日（湿度20%）' }] : []; },
    stamps: [{ t: 1.8, text: 'パチッ!', x: 640, y: 1150, rot: 6, color: YEL, size: 70, dur: 0.9 }],
    note: '湿度20%で人の帯電は1万V超（大阪産業技術研究所）',
    act(lt, s) {
      const h = s.hero.userData; const hit = doorTouch(s, lt, 1.75, false);
      if (hit) { h.arm('R', 0.7, 0.6, 0.9); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0, brow: -0.6, browY: 1, look: [0.4, 0], mouth: 'o', open: 0.7 }); }
    } },
  // 3) 12th: an LED bulb lights for 1 second
  { sc: 'st', say: ['n12'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: [], hud: ['静電気', '10J'],
    cam: { p0: [0.0, 1.45, 4.4], p1: [0.0, 1.42, 4.1], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.0, 'zap_small', -13], [1.1, 'sparkle', -13]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '12回目 [10ジュール]', y: 480, size: 70, border: CY, sub: '5mJ×2¹¹（試算）' }] : []; },
    tags(lt) { const t0 = 1.3; return lt > t0 ? [{ t: t0, text: 'LED電球 8W', x: 300, y: 1170, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '1秒 点灯!', x: 760, y: 1170, h: 96, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.4, 0);
      const b = hold(s, 'bulb', 'R', V(0.32, 1.12, 0.62)); const on = lt > 1.0 && lt < 2.6; b.userData.on.visible = on; b.userData.off.visible = !on;
      if (on && lt < 1.3) zap(s, 'zA', h.handPos('R'), V(0.32, 1.28, 0.62), lt, 0.01, 0.03, 0.04);
      spikes(s, 'spk', h.head, 0.35); h.arm('L', 0.4, 0.6, 1.5); h.hand('L', 'pa');
      h.face(lt < 1.0 ? { lid: 0.2, brow: 0.3, look: [0.5, -0.2], mouth: 'flat' } : { lid: 0.1, brow: 0.6, look: [0.4, -0.1], mouth: 'smile' });
    } },
  // 4) 21st: a 3.4 m spark
  { sc: 'st', say: ['n21'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['火花', '3.4m'],
    cam: { p0: [0.3, 1.5, 6.8], p1: [0.3, 1.48, 6.4], l0: [0.3, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.9, 'zap_big', -12], [2.0, 'comic_surprise', -13]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '火花 [3.4メートル]', y: 480, size: 70, border: YEL, sub: '空気は1mmあたり約3,000Vで放電（試算）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: 'ふつう 3mm', x: 300, y: 1210, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: 'あなた 3.4m', x: 760, y: 1210, h: 96, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.65, 0.4, 0.5); place(s.P.frame, 1.35, -0.75); const pn = s.P.panel; pn.visible = true; pn.position.set(1.35, 1.03, -0.72);
      h.arm('R', 1.3, 0.2, 0.05); h.hand('R', 'choki'); h.arm('L', 0.3, 0.4, 1.7); spikes(s, 'spk', h.head, 0.6);
      if (lt > 0.9) zap(s, 'zA', h.handPos('R'), V(0.97, 1.0, -0.65), lt, 0.025, 0.2, 0.06);
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0.4, look: [0.7, 0], mouth: 'flat' } : { lid: 0, brow: 0.9, browY: 1, look: [0.7, 0], mouth: 'o', open: 1.1 });
    } },
  // 5) 24th: a microwave runs for a minute
  { sc: 'st', say: ['n24'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], show: ['counter'], hud: ['静電気', '4.2万J'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.42, 4.5], l0: [0.05, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.8, 'zap_small', -13], [1.4, 'comic_pico', -12], [2.4, 'sparkle', -14]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '24回目 [電子レンジ1分]', y: 480, size: 64, border: CY, sub: '4.2万J ≥ 600W×60秒（試算）' }] : []; },
    stamps: [{ t: 2.4, text: 'チン♪', x: 780, y: 1150, rot: 6, color: '#ffffff', size: 70, dur: 1.0 }],
    act(lt, s) {
      s.P.counter.position.set(0.55, 0, -0.4); const mw = s.P.mw; mw.visible = true; mw.position.set(0.5, 0.93, -0.35); mw.rotation.set(0, -0.2, 0); mw.userData.glow.visible = lt > 0.8;
      const h = s.hero.userData; place(s.hero, -0.45, 0.55, 0.3);
      h.reach('R', V(0.16, 1.1, -0.08)); h.hand('R', 'pa'); h.arm('L', 0.4, 0.5, 1.6); spikes(s, 'spk', h.head, 0.6);
      if (lt > 0.8 && lt < 1.3) zap(s, 'zA', h.handPos('R'), V(0.22, 1.1, -0.12), lt, 0.012, 0.03, 0.05);
      h.face(lt < 0.8 ? { lid: 0.2, brow: 0.3, look: [0.5, 0], mouth: 'flat' } : { lid: 0.4, brow: 0.6, look: [0.2, 0], mouth: 'smile' });
    } },
  // 6) 34th: a whole house for a day
  { sc: 'st', say: ['n34'], pre: 0.15, pal: ['#2f6fb0', '#e6f0ff', '#ffd23a'], show: [], hud: ['静電気', '4,300万J'],
    cam: { p0: [0.0, 1.6, 6.2], p1: [0.0, 1.55, 5.8], l0: [0.0, 1.25, -0.3] },
    sfx: [[0.3, 'text_pa', -10], [1.0, 'zap_big', -13], [1.2, 'sparkle', -13]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '家の電気 [1日分]', y: 480, size: 72, border: YEL, sub: '4,300万J ≥ 約10kWh（試算）' }] : []; },
    stamps: [{ t: 1.4, text: 'ピカッ', x: 820, y: 1100, rot: 6, color: YEL, size: 64, dur: 0.9 }],
    act(lt, s) {
      const ho = s.P.house; place(ho, 0.55, -0.6); const on = lt > 1.0; ho.userData.on.forEach(m => m.visible = on); ho.userData.off.forEach(m => m.visible = !on);
      const h = s.hero.userData; place(s.hero, -0.62, 0.4, 0.4); spikes(s, 'spk', h.head, 0.8);
      h.reach('R', V(0.02, 0.95, 0.12)); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa');
      if (lt > 1.0 && lt < 1.6) zap(s, 'zA', h.handPos('R'), V(0.3, 0.6, -0.05), lt, 0.02, 0.08, 0.06);
      h.face(lt < 1.0 ? { lid: 0.2, brow: 0.3, look: [0.6, 0], mouth: 'o', open: 0.4 } : { lid: 0.3, brow: 0.7, look: [0.5, 0], mouth: 'smile' });
    } },
  // 7) 39th: the cold open, in its place
  { sc: 'st', say: ['n39'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['静電気', '雷1回分'],
    cam: { p0: [0.0, 1.7, 6.8], p1: [0.0, 1.7, 6.4], l0: [0.0, 1.6, -0.4] },
    shake: [[0.9, 0.08, 0.6]], lines: [[0.9, 0.8]],
    sfx: [[0.85, 'zap_big', -10], [0.9, 'impact_doon', -11], [1.3, 'whoosh_gust', -13]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '39回目 [雷1回分]', y: 480, size: 72, border: YEL, sub: '約14億J ≒ 雷 約15億J（試算）' }] : []; },
    note: '雷1回の放電エネルギー 約15億J（気象庁）',
    act(lt, s) {
      const h = s.hero.userData; const hit = doorTouch(s, lt, 0.85, true);
      if (hit) { h.arm('R', 0.9, 0.5, 0.3); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.4, 0.6], mouth: 'o', open: 1 }); }
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); spikes(s, 'spk', h.head, 0.7); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) pace: 10 knobs a day -> lightning in 4 days
  { sc: 'st', say: ['pace'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: [], hud: ['雷まで', 'あと4日'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.25, -0.3] },
    sfx: [[0.4, 'zap_small', -14], [0.9, 'zap_small', -14], [1.4, 'zap_small', -14], [1.9, 'text_pa', -10], [2.6, 'comic_shock2', -12]],
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 毎日パチッ', x: 300, y: 1210, h: 76, bg: '#ffffff' }, { t: t0 + 1.3, text: 'あなた 4日で雷', x: 760, y: 1210, h: 96, bg: RED, fg: '#ffffff' }] : []; },
    cards(lt) { return lt > 1.9 ? [{ t: 1.9, text: '1日10回 → [4日目]', y: 480, size: 70, border: RED, sub: '39回 ÷ 1日10回（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; const c = (lt * 2) % 1; doorTouch(s, c * 0.5, 0.3, false); spikes(s, 'spk', h.head, 0.5);
      if (c > 0.6) { h.arm('R', 0.7, 0.6, 0.9); h.hand('R', 'pa'); }
      h.arm('L', 0.3, 0.4, 1.6);
      h.face(lt < 1.9 ? { lid: 0.3, brow: -0.4, look: [0.4, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
    } },
  // 10) food: 1,800 onigiri worth of energy
  { sc: 'st', say: ['food'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#e2463c'], show: [], hud: ['必要な食事', '1,800個'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'comic_eat', -11], [1.3, 'text_pa', -10], [2.2, 'comic_fall', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: 'おにぎり [1,800個]', y: 480, size: 70, border: RED, sub: '14億J÷1個180kcal（試算）' }] : []; },
    act(lt, s) {
      const o = s.P.onigiri; place(o, 0.5, -0.2); const sc = lerp(0.7, 1.4, ease(k(lt, 0.3, 2.0))); o.scale.setScalar(sc);
      const h = s.hero.userData; place(s.hero, -0.5, 0.45, 0.3); spikes(s, 'spk', h.head, 0.5);
      hold(s, 'oni1', 'R', V(-0.25, 1.2, 0.75)); h.arm('L', 0.6, 1.1, 0.6); h.hand('L', 'pa');
      h.face(lt < 1.2 ? { lid: 0.3, brow: 0.3, look: [0.3, 0], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0.6, -0.1], mouth: 'o', open: 1.0 });
    } },
  // 11) hand: a high five turns into a lightning strike
  { sc: 'st', say: ['hand'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['ハイタッチ', '落雷'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.6], l0: [0.0, 1.3, 0] },
    shake: [[1.0, 0.05, 0.4]],
    sfx: [[0.95, 'zap_big', -12], [1.0, 'impact_don', -12], [1.6, 'comic_surprise', -13]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '握手 → [落雷]', y: 480, size: 72, border: RED, sub: 'さわった相手にも全部流れる' }] : []; },
    stamps: [{ t: 1.05, text: 'バリバリッ', x: 540, y: 1180, rot: -5, color: YEL, size: 70, dur: 1.0 }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.68, 0.35, 0.4); place(s.hero2, 0.68, 0.35, -0.4);
      const hp = V(0, 1.55, 0.55); h.reach('R', hp.clone().add(V(-0.16, 0, 0))); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.6);
      spikes(s, 'spk', h.head, 0.6);
      if (lt < 1.0) { h2.reach('L', hp.clone().add(V(0.16 + 0.3 * (1 - k(lt, 0.3, 1.0)), 0, 0))); h2.hand('L', 'pa'); h2.arm('R', 0.3, 0.4, 1.6);
        h.face({ lid: 0.2, brow: 0.5, look: [0.6, 0.2], mouth: 'smile' }); h2.face({ lid: 0.2, brow: 0.5, look: [-0.6, 0.2], mouth: 'smile' }); }
      else { if (lt < 1.6) zap(s, 'zA', hp.clone().add(V(-0.1, 0, 0)), hp.clone().add(V(0.1, 0, 0)), lt, 0.022, 0.05, 0.04);
        spikes(s, 'spk2', h2.head, ease(k(lt, 1.0, 1.2))); h2.arm('L', 0.6, 1.3, 0.6); h2.arm('R', 0.6, 1.3, 0.6); h2.hand('L', 'pa'); h2.hand('R', 'pa');
        h2.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 0.8 }); }
    } },
  // 12) good news (free electricity) / bad news (everything you touch breaks)
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['counter'], hud: ['家電', '全部こわれる'], hudColor: RED,
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.42, 4.5], l0: [0.05, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'zap_small', -12], [2.5, 'collapse', -14], [3.0, 'text_pa', -10], [4.2, 'comic_jajean', -13]],
    cards(lt) { const b = 2.4; return lt < b ? (lt > 0.25 ? [{ t: 0.25, text: '電気代 [タダ]', y: 480, size: 72, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: b, text: '家電が [全部こわれる]', y: 480, size: 64, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 2.6, text: 'プスン…', x: 800, y: 1150, rot: 6, color: '#ffffff', size: 64, dur: 1.2 }],
    act(lt, s) {
      const b = 2.4; s.P.counter.position.set(0.55, 0, -0.4); const mw = s.P.mw; mw.visible = true; mw.position.set(0.5, 0.93, -0.35); mw.rotation.set(0, -0.2, 0);
      mw.userData.glow.visible = lt < b; const h = s.hero.userData; place(s.hero, -0.45, 0.4, 0.3); spikes(s, 'spk', h.head, 0.6);
      h.reach('R', V(0.16, 1.1, -0.08)); h.hand('R', 'pa');
      if (lt < b) { h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki'); h.face({ lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { if (lt < b + 0.3) zap(s, 'zA', h.handPos('R'), V(0.22, 1.1, -0.12), lt, 0.02, 0.06, 0.08); smoke(s, lt, V(0.5, 1.3, -0.35), b + 0.1);
        h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: -1, browY: 1, look: [0.5, 0.2], mouth: 'o', open: 1.0 }); }
    } },
  // 13) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい⚡', x: 320, y: 1130, h: 104, bg: YEL }, { t: t0 + 0.2, text: 'いらない', x: 770, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05); spikes(s, 'spk', h.head, 0.5);
      h.arm('R', 0.5, 0.4, 1.2); h.hand('R', 'choki'); if (Math.floor(lt * 1.5) % 2 === 0) zap(s, 'zA', h.handPos('R'), h.handPos('R').add(V(0.12, 0.14, 0.05)), lt, 0.007, 0.02, 0.025);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[静電気]が', '毎回2倍強くなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['静電気', '毎回2倍'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
