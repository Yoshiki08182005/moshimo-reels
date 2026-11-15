// ep31_shoot2x (pop / arm C: news = 日本代表 vs ブラジル 11/14): もしもシュートが毎回2倍速くなったら？
// 型は sp_geppu2x。台本・数字・小道具は自作。前提: 1回目 = 秒速20m(時速72km)、毎回2倍、空気抵抗は無視(試算)。ボール 0.43kg。
//   n回目 v = 20×2^(n-1) m/s : 2回目 144km/h / 3回目 288km/h(東海道新幹線 285km/h) / 5回目 1152km/h(旅客機 約900km/h) / 6回目 640m/s > 音速340m/s
//   10回目 10.24km/s > ISS 7.7km/s / 11回目 20.5km/s > 脱出速度 11.2km/s
//   PK 11m ÷ 80m/s = 0.1375s < 人の反応 約0.2s
//   6回目のよどみ点の温度上昇 ΔT = v²/(2cp) = 640²/2010 ≒ 204K / 衝撃 0.43×640 = 275N·s ÷ 0.01s = 27.5kN ≒ 2.8トン重
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep31_shoot2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const G = () => new THREE.Group();
function ringSet() {
  const g = G(); g.userData.items = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 72), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); g.add(m); g.userData.items.push(m); }
  return g;
}
function rings(g, pos, t, o = {}) {
  const n = o.n ?? 3, life = o.life ?? 0.8, gap = o.gap ?? 0.12, sp = o.speed ?? 1.5;
  g.visible = true; g.position.copy(pos);
  g.userData.items.forEach((m, i) => {
    const u = t - i * gap; m.visible = i < n && u > 0 && u < life; if (!m.visible) return;
    m.scale.setScalar(0.1 + u * sp); m.material.opacity = (1 - u / life) * 0.95; m.material.color.set(o.col ?? '#ffffff');
  });
}

function makeEarth(R) {
  const g = G(), ball = G(), r = rng(4); g.add(ball);
  const tex = canvasTex(1024, 512, (c) => {
    c.fillStyle = '#2f9bff'; c.fillRect(0, 0, 1024, 512);
    const blob = (x, y, rad, col) => { c.fillStyle = col; for (const dx of [-1024, 0, 1024]) { c.beginPath(); c.arc(x + dx, y, rad, 0, 7); c.fill(); } };
    for (const [cx, cy, n, s] of [[170, 170, 16, 1.2], [250, 330, 12, 0.9], [520, 150, 14, 1.0], [560, 300, 15, 1.1], [760, 180, 20, 1.4], [880, 360, 9, 0.8], [400, 90, 6, 0.7]]) {
      let x = cx, y = cy;
      for (let i = 0; i < n; i++) { blob(x, y, (22 + r() * 30) * s, i % 5 === 4 ? '#e8d48a' : (i % 2 ? '#4fbf68' : '#62cf7a')); x = cx + (r() - 0.5) * 150 * s; y = cy + (r() - 0.5) * 110 * s; }
    }
    c.fillStyle = '#ffffff';
    for (let x = 0; x <= 1024; x += 16) { c.beginPath(); c.arc(x, 0, 30 + Math.sin(x * 0.05) * 8, 0, 7); c.fill(); c.beginPath(); c.arc(x, 512, 34 + Math.cos(x * 0.04) * 8, 0, 7); c.fill(); }
  });
  ball.add(new THREE.Mesh(new THREE.SphereGeometry(R, 56, 36), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })));
  const ctex = canvasTex(1024, 512, (c) => {
    c.lineCap = 'round'; c.lineJoin = 'round'; const paths = [];
    for (let j = 0; j < 30; j++) { let x = r() * 1024, y = 50 + r() * 412, a = r() * 6.28; const p = [[x, y]]; for (let i = 0; i < 9; i++) { a += (r() - 0.5) * 1.6; x += Math.cos(a) * 46; y += Math.sin(a) * 34; p.push([x, y]); } paths.push(p); }
    for (const [w, col] of [[18, 'rgba(255,110,30,0.55)'], [8, '#ffd23a'], [3, '#fffbe0']]) { c.strokeStyle = col; c.lineWidth = w; for (const p of paths) { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } }
  });
  const crack = new THREE.Mesh(new THREE.SphereGeometry(R * 1.006, 56, 36), new THREE.MeshBasicMaterial({ map: ctex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); ball.add(crack);
  for (let i = 0; i < 7; i++) {
    const la = i < 2 ? 0.9 + r() * 0.25 : -0.5 - r() * 0.6, lo = r() * 6.28, p = V(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)).multiplyScalar(R * 1.05), cl = G();
    cl.position.copy(p); cl.lookAt(p.clone().multiplyScalar(2)); ball.add(cl);
    for (const [dx, s] of [[-0.12, 0.1], [0, 0.14], [0.13, 0.1]]) sph(R * s, M('#ffffff', 0.9), R * dx, 0, 0, cl, 1, 0.7, 0.45);
  }
  const face = G(); g.add(face);
  const zAt = (x, y) => Math.sqrt(R * R - x * x - y * y);
  const eyes = [-1, 1].map(sx => {
    const x = sx * 0.25 * R, y = 0.34 * R, z = zAt(x, y), e = G(); e.position.set(x, y, z - 0.02 * R); e.lookAt(V(x, y, z).multiplyScalar(2)); face.add(e);
    sph(0.15 * R, M('#ffffff', 0.35), 0, 0, 0, e, 1, 1.15, 0.45);
    const pg = G(); e.add(pg); sph(0.07 * R, M('#1b1b1f', 0.3), 0, 0, 0.06 * R, pg, 1, 1, 0.5); sph(0.022 * R, basic('#ffffff'), 0.025 * R, 0.035 * R, 0.09 * R, pg);
    const brow = caps(0.022 * R, 0.14 * R, '#1d4f8a', 0, 0.24 * R, 0.03 * R, e);
    return { pg, brow, sx };
  });
  const my = 0.07 * R, mz = zAt(0, my), mO = sph(1, M('#5a1f2a', 0.5), 0, my, mz, face);
  const mS = new THREE.Mesh(new THREE.TorusGeometry(0.1 * R, 0.022 * R, 8, 20, Math.PI), M('#5a1f2a', 0.5)); mS.rotation.z = Math.PI; mS.position.set(0, my + 0.05 * R, mz + 0.01 * R); face.add(mS);
  for (const sx of [-1, 1]) { const x = sx * 0.48 * R, y = 0.14 * R; sph(0.09 * R, '#ff9aa0', x, y, zAt(x, y) - 0.03 * R, face, 1, 0.65, 0.35); }
  const sweat = [-1, 1].map(sx => sph(0.05 * R, M('#bfe6ff', 0.3), sx * 0.62 * R, 0.5 * R, zAt(0.62 * R, 0.5 * R), face, 0.8, 1.3, 0.8));
  g.userData = {
    ball, face,
    set(p = {}) {
      const look = p.look || [0, 0];
      eyes.forEach(e => { e.pg.position.set(look[0] * 0.05 * R, look[1] * 0.05 * R, 0); e.brow.rotation.z = Math.PI / 2 + e.sx * (p.brow ?? 0) * 0.4; e.brow.position.y = (0.24 + (p.browY ?? 0) * 0.04) * R; });
      const m = p.mouth || 'smile'; mS.visible = m === 'smile'; mO.visible = !mS.visible;
      if (m === 'o') mO.scale.set(0.07 * R, 0.07 * R * (0.4 + (p.open ?? 1)), 0.02 * R); else mO.scale.set(0.1 * R, 0.018 * R, 0.02 * R);
      sweat.forEach((s, i) => { s.visible = !!p.sweat; const u = ((p.t ?? 0) * 0.9 + i * 0.5) % 1; s.position.y = (0.55 - u * 0.5) * R; });
      crack.material.opacity = p.crack ?? 0;
    },
  };
  g.userData.set();
  return g;
}

// ---------- props ----------
function soccerBall(r = 0.11) {
  const b = G(); sph(r, M('#ffffff', 0.45), 0, 0, 0, b);
  const ico = new THREE.IcosahedronGeometry(1, 0), p = ico.attributes.position, seen = [];
  for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)).normalize(); if (seen.some(s => s.distanceTo(v) < 0.01)) continue; seen.push(v);
    const d = sph(r * 0.36, M('#22252d', 0.45), v.x * r * 0.86, v.y * r * 0.86, v.z * r * 0.86, b, 1, 1, 0.45); d.lookAt(v.clone().multiplyScalar(5)); }
  return b;
}
function addProps(api) {
  const { scene, P, hero, hero2 } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // kicking leg: re-parent the viewer's-left leg (closest to camera when turned right) under a hip pivot
  for (const who of [hero, hero2]) {
    const u = who.userData, body = u.body, pv = G(); pv.position.set(-0.13, 0.5, 0); body.add(pv);
    for (const m of [...body.children]) if (m.isMesh && Math.abs(m.position.x + 0.13) < 0.01 && m.position.y < 0.4) { const y = m.position.y, z = m.position.z; pv.add(m); m.position.set(0, y - 0.5, z); }
    u.leg = pv; const r0 = u.reset; u.reset = () => { r0(); pv.rotation.set(0, 0, 0); };
  }
  reg('sball', soccerBall()); reg('rings', ringSet()); reg('globe', makeEarth(0.85));
  { const t = G(); t.userData.items = []; for (let i = 0; i < 7; i++) t.userData.items.push(sph(0.07, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }), 0, 0, 0, t)); reg('trail', t); }
  { // goal: posts x 0..1.4, height 1.0, net at the back; userData.hole (torn net), userData.net
    const g = G(), wm = M('#ffffff', 0.4);
    for (const x of [-0.7, 0.7]) cyl(0.035, 0.035, 1.0, wm, x, 0.5, 0, g);
    const bar = cyl(0.035, 0.035, 1.44, wm, 0, 1.0, 0, g); bar.rotation.z = Math.PI / 2;
    for (const x of [-0.7, 0.7]) { const s = cyl(0.02, 0.02, 0.5, wm, x, 0.98, -0.25, g); s.rotation.x = Math.PI / 2; }
    const tex = canvasTex(256, 192, (c) => { c.clearRect(0, 0, 256, 192); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3; for (let x = 0; x <= 256; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 192); c.stroke(); } for (let y = 0; y <= 192; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } });
    const net = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })); net.position.set(0, 0.5, -0.5); g.add(net);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.14, 9), new THREE.MeshBasicMaterial({ color: '#4a5a6a', transparent: true, opacity: 0.85 })); hole.position.set(0.05, 0.75, -0.49); g.add(hole);
    g.userData.net = net; g.userData.hole = hole; g.position.set(0.7, 0, -1.0); reg('goal', g);
  }
  { // toy shinkansen, nose toward +x
    const t = G(); rbox(2.4, 0.42, 0.42, 0.12, '#f4f6f8', 0, 0.3, 0, t); const n = caps(0.21, 0.5, '#f4f6f8', 1.25, 0.28, 0, t); n.rotation.z = Math.PI / 2; n.scale.set(1, 1, 1);
    rbox(2.42, 0.07, 0.43, 0.02, '#2a5bd7', 0, 0.22, 0, t); for (let i = 0; i < 7; i++) rbox(0.16, 0.1, 0.01, 0.02, '#2c3b6b', -1.0 + i * 0.3, 0.38, 0.215, t);
    sph(0.06, M('#2c3b6b', 0.3), 1.42, 0.36, 0.1, t, 1.4, 0.7, 0.8); reg('train2', t);
  }
  { // toy jet, nose toward +x
    const j = G(), f = caps(0.17, 1.1, '#ffffff', 0, 0, 0, j); f.rotation.z = Math.PI / 2;
    rbox(0.34, 0.04, 1.5, 0.02, '#35a7ff', -0.05, -0.04, 0, j); rbox(0.22, 0.04, 0.6, 0.02, '#35a7ff', -0.6, 0.02, 0, j); rbox(0.26, 0.34, 0.04, 0.02, '#35a7ff', -0.62, 0.2, 0, j);
    for (let i = 0; i < 6; i++) sph(0.035, M('#2c3b6b', 0.3), 0.42 - i * 0.16, 0.07, 0.165, j);
    sph(0.07, M('#2c3b6b', 0.3), 0.62, 0.06, 0.1, j, 1.3, 0.8, 0.8); reg('jet', j);
  }
  { // satellite
    const s = G(); rbox(0.16, 0.16, 0.16, 0.02, '#d9dde3', 0, 0, 0, s); for (const x of [-0.26, 0.26]) rbox(0.3, 0.01, 0.13, 0.005, '#2a5bd7', x, 0, 0, s); reg('sat', s);
  }
  { const g = G(); g.userData.items = []; const r = rng(3); for (let i = 0; i < 40; i++) g.userData.items.push(sph(0.012 + r() * 0.014, basic('#ffffff'), (r() - 0.5) * 6, 0.3 + r() * 3.4, -2.3, g)); reg('stars', g); }
  reg('glow', sph(0.2, new THREE.MeshBasicMaterial({ color: '#ff8a3d', transparent: true, opacity: 0.5, toneMapped: false, depthWrite: false })));
  reg('twinkle', sph(0.09, basic('#fff3a8'), 0, 0, 0, null, 1, 1, 0.3));
}

// ---------- helpers ----------
function kick(who, lt, t0) { // leg swing: wind up, strike at t0, recover
  const u = who.userData, r = lt < t0 ? lerp(0, 0.8, ease(k(lt, t0 - 0.32, t0 - 0.02))) : lt < t0 + 0.12 ? lerp(0.8, -1.3, ease(k(lt, t0, t0 + 0.08))) : lerp(-1.3, 0, ease(k(lt, t0 + 0.25, t0 + 0.7)));
  u.leg.rotation.x = r; u.body.rotation.x = r < 0 ? r * 0.08 : 0; u.arm('L', -0.3, 0.6, 0.3); u.arm('R', 0.5, 0.5, 0.4);
}
const footBall = (who) => { who.updateMatrixWorld(true); return who.localToWorld(V(-0.13, 0.11, 0.34)); };
function trail(s, path, lt, n = 7, dt = 0.025, op = 0.6) {
  const it = s.P.trail.userData.items; s.P.trail.visible = true;
  it.forEach((m, i) => { const p = path(lt - (i + 1) * dt); m.visible = i < n && !!p; if (!p) return; m.position.copy(p); m.scale.setScalar(0.07 * (1 - i / n * 0.8)); m.material.opacity = op * (1 - i / n); });
}
const ballAt = (s, p, spin = 0) => { const b = s.P.sball; b.visible = true; b.children[0].material = M('#ffffff', 0.45); b.position.copy(p); b.rotation.set(spin, spin * 0.7, 0); };
function stand(s, x = -0.45, z = 0.45, ry = 0.85) { s.hero.position.set(x, 0, z); s.hero.rotation.y = ry; }
function keeper(s, x = 0.7, z = -1.15) { s.hero2.position.set(x, 0, z); s.hero2.scale.setScalar(0.78); s.hero2.rotation.y = -0.15; }

// the big one (cold open + #11): kick, through the net, into the sky
function bigKick(lt, s, zoom) {
  const h = s.hero.userData, h2 = s.hero2.userData, t0 = 0.22, net = V(0.75, 0.75, -1.48), top = V(1.15, 4.8, -2.15);
  stand(s); keeper(s); const st = footBall(s.hero);
  const path = (t) => { if (t < t0) return t === lt ? st : null; const a = (t - t0) / 0.1; if (a <= 1) return st.clone().lerp(net, a); const b = (t - t0 - 0.1) / 0.55; return b <= 1 ? net.clone().lerp(top, b * b * 0.6 + b * 0.4) : null; };
  const p = path(lt); s.P.sball.visible = !!p; if (p) { ballAt(s, p, lt * 30); s.P.sball.scale.setScalar(1 - 0.5 * k(lt, t0 + 0.1, t0 + 0.65)); if (lt > t0) trail(s, path, lt); }
  const g = s.P.goal.userData; g.hole.visible = lt > t0 + 0.1; g.net.position.z = -0.5 - (lt > t0 + 0.08 && lt < t0 + 0.4 ? Math.sin((lt - t0) * 40) * 0.04 : 0);
  s.P.twinkle.visible = lt > 0.92 && lt < 1.3; s.P.twinkle.position.set(0.95, 3.0, -2.2); s.P.twinkle.scale.set(0.09 * (1 + Math.sin((lt - 0.92) * 8) * 0.6), 0.09 * (1 + Math.sin((lt - 0.92) * 8) * 0.6), 0.03);
  // keeper: spun around by the wind, then stares at the sky
  const sp = ease(k(lt, t0 + 0.08, t0 + 0.5)); s.hero2.rotation.y = -0.15 + sp * Math.PI * 2;
  h2.face(lt < t0 + 0.08 ? { lid: 0.1, brow: 0.6, mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.3, 1], mouth: 'o', open: 1.3 });
  if (lt > t0 + 0.5) { s.hero2.userData.head.rotation.x = -0.45; h2.arm('L', 0.3, 0.6, 1.4); h2.arm('R', 0.3, 0.6, 1.4); } else { h2.arm('L', 0.4, 0.9, 0.3); h2.arm('R', 0.4, 0.9, 0.3); }
  kick(s.hero, lt, t0);
  if (!zoom) { if (lt > 0.9) { h.face({ lid: 0, browY: 1, look: [0.8, 0.8], mouth: 'o', open: 0.6 }); h.head.rotation.x = -0.25; } else h.face({ lid: 0.2, brow: 0.7, mouth: 'flat', look: [0.8, 0] }); return; }
  const turn = ease(k(lt, 1.65, 2.2)), teh = lt > 2.5;
  s.hero.rotation.y = 0.85 * (1 - turn);
  if (lt < 1.65) { if (lt > 0.9) { h.face({ lid: 0, browY: 1, look: [0.8, 0.8], mouth: 'o', open: 0.5 }); h.head.rotation.x = -0.22; } else h.face({ lid: 0.2, brow: 0.7, mouth: 'flat', look: [0.8, 0] }); }
  else { h.face({ lid: 0.35, brow: 0.35, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = (teh ? 0.14 : 0.06) * turn;
    if (teh) { s.hero.updateMatrixWorld(true); h.reach('R', h.head.localToWorld(V(0.42, 0.18, -0.05))); h.hand('R', 'pa'); } }
}
// a ball racing left -> right after a kick at t0 (for the speed comparisons)
function race(lt, s, t0, y, z, spd) {
  const h = s.hero.userData; stand(s, -0.38, 0.45, 0.9); const st = footBall(s.hero), to = V(-0.3, y, z);
  const path = (t) => { if (t < t0) return null; const a = (t - t0) / 0.18; if (a <= 1) return st.clone().lerp(to, a); return to.clone().add(V((t - t0 - 0.18) * spd, 0, 0)); };
  const p = path(lt); if (p) { ballAt(s, p, lt * 25); trail(s, path, lt); } else ballAt(s, st);
  kick(s.hero, lt, t0); return p;
}

const plan = [
  // 0) cold open (flash-forward of #11)
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: ['#8fd3ff', '#7fd08a', '#ffffff'], show: ['goal'], hero2: true,
    cam: { p0: [0.02, 1.45, 5.4], p1: [-0.42, 1.5, 3.25], l0: [0.2, 1.15, -0.4], l1: [-0.42, 1.38, 0.5], hold: 1.65, dur: 2.4 },
    shake: [[0.22, 0.08, 0.7]], lines: [[0.22, 0.9]],
    sfx: [[0.0, 'whoosh_swing', -12], [0.22, 'impact_doon', -7], [0.26, 'whoosh_gust', -8], [0.95, 'sparkle', -8], [1.65, 'whoosh_slide', -13], [2.55, 'comic_pico', -10]],
    stamps: [{ t: 0.22, text: 'ドゴォッ!!', x: 320, y: 1120, rot: -8, color: YEL, size: 120, dur: 1.0 },
      { t: 0.95, text: '☆キラーン', x: 760, y: 430, rot: 10, color: '#fff3a8', size: 74, dur: 0.65 },
      { t: 2.55, text: 'てへっ', x: 730, y: 1130, rot: 8, color: '#ffffff', size: 80, dur: 0.6 }],
    act(lt, s) { bigKick(lt, s, true); } },
  // 1) hook
  { sc: 'st', say: ['hook'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'],
    cam: { p0: [0.05, 1.45, 4.7], p1: [0.05, 1.43, 4.4], l0: [0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.5, 'text_pa', -10]],
    tags: [{ t: 1.5, text: '11回目で、ボールが…', x: 500, y: 640, h: 84, bg: RED, fg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.2); s.hero.rotation.y = 0.15; h.leg.rotation.x = -0.35;
      ballAt(s, s.hero.localToWorld(V(-0.13, 0.11, 0.4)), 0.3); s.P.sball.position.y = 0.11;
      h.arm('R', 0.2, 0.7, 1.7); h.arm('L', 0.1, 0.25, 0.3); h.face({ lid: 0.25, brow: 0.5, mouth: 'smile', look: [0.2, 0] });
    } },
  // 2) news
  { sc: 'st', say: ['news'], pal: ['#3fae5b', '#9fe0a8', '#ffffff'], show: ['goal'], hero2: true,
    cam: { p0: [0.1, 1.45, 4.8], p1: [0.1, 1.43, 4.5], l0: [0.1, 1.15, -0.3] },
    sfx: [[0.3, 'text_pa', -11], [1.2, 'comic_pico', -14]],
    cards: [{ t: 0.3, text: '日本代表 [vs] ブラジル', y: 470, size: 62, border: CY, sub: '11月14日 シンガポール' }],
    note: '日本サッカー協会（JFA）の発表：11/14に対戦',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, b = Math.abs(Math.sin(lt * 5));
      s.hero.position.set(-0.4, 0, 0.45); s.hero.rotation.y = 0.2; keeper(s); s.hero2.scale.setScalar(0.85);
      h.body.position.y = b * 0.08; h.arm('L', 0.2, 2.6, 0.3); h.arm('R', 0.2, 2.6, 0.3); h.face({ lid: 0.3, brow: 0.4, mouth: 'o', open: 1.0 });
      h2.body.position.y = Math.abs(Math.sin(lt * 5 + 1)) * 0.08; h2.arm('L', 0.2, 2.5, 0.3); h2.arm('R', 0.2, 2.5, 0.3); h2.face({ lid: 0.3, mouth: 'smile' });
      ballAt(s, V(0.1, 0.11, 0.55));
    } },
  // 3) #1: 72 km/h, keeper catches it
  { sc: 'st', say: ['first'], pre: 0.75, pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['goal'], hero2: true, hud: ['シュート 1回目', '時速72km'],
    cam: { p0: [0.15, 1.45, 4.9], p1: [0.15, 1.43, 4.6], l0: [0.15, 1.1, -0.3] },
    sfx: [[0.0, 'whoosh_swing', -14], [0.3, 'impact_don', -11], [0.85, 'comic_boyon', -13], [1.2, 'text_pa', -12]],
    stamps: [{ t: 0.3, text: 'ポン', x: 300, y: 1130, rot: -8, color: '#ffffff', size: 84, dur: 0.8 }],
    tags(lt) { if (lt < 1.2) return []; return [{ t: 1.2, text: '72km/h', x: 640, y: 760, h: 76, bg: CY }]; },
    note: '前提：1回目＝秒速20m（時速72km）として計算',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, t0 = 0.3; stand(s); keeper(s); const st = footBall(s.hero), ct = V(0.62, 0.78, -0.95);
      const u = k(lt, t0, t0 + 0.55), p = lt < t0 ? st : st.clone().lerp(ct, u).add(V(0, Math.sin(u * Math.PI) * 0.25, 0)); ballAt(s, p, lt * 8);
      if (u >= 1) { h2.reach('L', ct.clone().add(V(-0.1, 0, 0.05))); h2.reach('R', ct.clone().add(V(0.1, 0, 0.05))); h2.face({ lid: 0.3, brow: 0.5, mouth: 'smile' }); }
      else { h2.arm('L', 0.4, 0.8, 0.3); h2.arm('R', 0.4, 0.8, 0.3); h2.face({ lid: 0.1, brow: 0.5, mouth: 'flat', look: [-0.6, 0] }); }
      kick(s.hero, lt, t0); h.face(lt > 1.0 ? { lid: 0.4, mouth: 'smile', look: [0.8, 0] } : { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.8, 0] });
    } },
  // 4) #2: 144 km/h, side by side with a baseball fastball
  { sc: 'st', say: ['b2'], pre: 0.75, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['ball'], hud: ['シュート 2回目', '時速144km'],
    cam: { p0: [0.0, 1.4, 5.1], p1: [0.0, 1.38, 4.5], l0: [0.0, 1.15, 0] },
    sfx: [[0.0, 'whoosh_swing', -13], [0.3, 'impact_don', -10], [0.4, 'whoosh_slide', -12], [1.4, 'text_pa', -12]],
    stamps: [{ t: 0.3, text: 'バシュッ', x: 300, y: 1130, rot: -8, color: YEL, size: 96, dur: 0.8 }],
    cards: [{ t: 1.4, text: 'プロ野球の速球 ≒ [時速150km]', y: 470, size: 56, border: YEL }],
    note: '毎回2倍（空気抵抗は無視した試算）',
    act(lt, s) {
      const h = s.hero.userData, t0 = 0.3, p = race(lt, s, t0, 1.05, -0.6, 0.5), b = s.P.ball;
      if (p) { b.position.set(p.x, 1.42, -0.6); b.rotation.z = -lt * 20; } else b.position.set(-0.3, 1.42, -0.6);
      h.face(lt > 0.9 ? { lid: 0, browY: 1, look: [0.8, 0.3], mouth: 'o', open: 0.7 } : { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.8, 0] });
    } },
  // 5) #3: 288 km/h, alongside the shinkansen
  { sc: 'st', say: ['b3'], pre: 0.75, pal: ['#8fd3ff', '#eef6ff', '#2a5bd7'], show: ['train2'], hud: ['シュート 3回目', '時速288km'],
    cam: { p0: [0.0, 1.4, 5.1], p1: [0.0, 1.38, 4.6], l0: [0.0, 1.05, 0] },
    sfx: [[0.0, 'whoosh_swing', -13], [0.3, 'impact_don', -10], [0.35, 'whoosh_gust', -12], [0.6, 'train_door', -16], [1.6, 'text_pa', -12]],
    stamps: [{ t: 0.3, text: 'ビュンッ', x: 300, y: 1130, rot: -8, color: YEL, size: 100, dur: 0.8 }],
    tags: [{ t: 1.6, end: 4.8, text: '新幹線と同じ速さ', x: 560, y: 700, h: 72, bg: '#ffffff' }],
    note: '東海道新幹線の最高速度は時速285km（JR東海）',
    act(lt, s) {
      const h = s.hero.userData, t0 = 0.3, p = race(lt, s, t0, 1.0, -1.1, 0.42), tr = s.P.train2;
      tr.position.set(p ? p.x - 1.2 : -1.5, 0.72, -1.5);
      h.face(lt > 0.9 ? { lid: 0, browY: 1, look: [0.8, 0.2], mouth: 'o', open: 0.9 } : { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.8, 0] });
      if (lt > 0.9) { h.arm('L', 0.3, 0.5, 1.6); h.arm('R', 0.3, 0.5, 1.6); }
    } },
  // 6) PK: 0.14 s, the keeper can't move
  { sc: 'st', say: ['pk'], pre: 0.75, pal: ['#ff7e6b', '#ffe6df', '#ffffff'], show: ['goal'], hero2: true, hud: ['シュート 3回目', 'PK 0.14秒'], hudColor: YEL,
    cam: { p0: [0.2, 1.45, 4.9], p1: [0.2, 1.43, 4.6], l0: [0.2, 1.1, -0.3] }, lines: [[0.3, 0.5]],
    sfx: [[0.0, 'whoosh_swing', -13], [0.3, 'impact_don', -9], [0.42, 'comic_boyon', -11], [1.3, 'comic_fall', -12], [1.7, 'text_pa', -12]],
    stamps: [{ t: 0.42, text: 'ズバッ!!', x: 760, y: 900, rot: 8, color: YEL, size: 104, dur: 0.9 }, { t: 1.3, text: '…あとから', x: 700, y: 1060, rot: 6, color: '#ffffff', size: 64, dur: 1.2 }],
    cards: [{ t: 1.7, text: '11m ÷ 秒速80m ≒ [0.14秒]', y: 470, size: 58, border: CY }],
    note: '人が反応するまで約0.2秒（一般的な目安）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, t0 = 0.3, net = V(0.2, 0.55, -1.45); stand(s); keeper(s); const st = footBall(s.hero);
      const u = k(lt, t0, t0 + 0.12); ballAt(s, lt < t0 ? st : st.clone().lerp(net, u), lt * 20); if (lt > t0 && u < 1) trail(s, (t) => t < t0 ? null : st.clone().lerp(net, k(t, t0, t0 + 0.12)), lt);
      s.P.goal.userData.hole.visible = false; s.P.goal.userData.net.position.z = -0.5 - (lt > t0 + 0.12 && lt < t0 + 0.5 ? Math.sin(lt * 40) * 0.03 : 0);
      const d = ease(k(lt, 1.15, 1.5)); s.hero2.position.x = 0.7 + d * 0.45; s.hero2.rotation.z = -d * 1.2; s.hero2.position.y = Math.sin(d * Math.PI) * 0.15;
      h2.arm('L', 0.3, 0.6 + d * 2, 0.3); h2.arm('R', 0.3, 0.6 + d * 2, 0.3); h2.face(lt < 1.15 ? { lid: 0.1, brow: 0.5, mouth: 'flat', look: [-0.5, 0] } : { lid: 0.6, brow: -0.8, mouth: 'o', open: 0.6 });
      kick(s.hero, lt, t0); h.face(lt > 1.0 ? { lid: 0.35, brow: 0.3, mouth: 'smile', look: [0.8, 0] } : { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.8, 0] });
    } },
  // 7) #5: 1152 km/h, overtakes a jet
  { sc: 'st', say: ['b5'], pre: 0.75, pal: ['#5ab8ff', '#e3f3ff', '#ffffff'], show: ['jet'], hud: ['シュート 5回目', '時速1152km'],
    cam: { p0: [0.0, 1.45, 5.1], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] }, lines: [[0.3, 0.6]],
    sfx: [[0.0, 'whoosh_swing', -13], [0.3, 'impact_doon', -10], [0.35, 'whoosh_gust', -10], [1.0, 'comic_surprise', -12]],
    stamps: [{ t: 0.3, text: 'ギュンッ!!', x: 300, y: 1130, rot: -8, color: YEL, size: 104, dur: 0.8 }],
    tags: [{ t: 1.1, end: 4.6, text: '旅客機を抜いた', x: 560, y: 680, h: 72, bg: '#ffffff' }],
    note: '旅客機の巡航速度は時速約900km（目安）',
    act(lt, s) {
      const h = s.hero.userData, t0 = 0.3, p = race(lt, s, t0, 2.25, -0.9, 1.4), j = s.P.jet;
      j.scale.setScalar(0.7); j.position.set(-0.1 + lt * 0.25, 2.45 + Math.sin(lt * 3) * 0.02, -1.4);
      if (p && p.x > j.position.x) { j.rotation.set(Math.sin(lt * 9) * 0.15, 0, Math.sin(lt * 7) * 0.08); }
      h.face(lt > 0.9 ? { lid: 0, browY: 1, look: [0.8, 0.5], mouth: 'o', open: 0.9 } : { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.8, 0] });
    } },
  // 8) #6: past the speed of sound
  { sc: 'st', say: ['b6'], pre: 0.75, pal: ['#ffc94a', '#fff6dc', '#e2463c'], hero2: true, hud: ['シュート 6回目', '音速突破'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.1], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] }, shake: [[0.35, 0.09, 0.7]], lines: [[0.3, 0.8]],
    sfx: [[0.0, 'whoosh_swing', -13], [0.3, 'impact_don', -10], [0.35, 'shock', -8], [0.4, 'impact_doon', -8], [1.0, 'comic_fall', -13]],
    stamps: [{ t: 0.35, text: 'ドーン!!', x: 330, y: 1110, rot: -8, color: RED, size: 132, dur: 1.0 }],
    tags: [{ t: 1.4, text: '音 → 衝撃波', x: 640, y: 760, h: 80, bg: '#ffffff' }],
    note: '音速＝秒速約340m（15℃）。6回目は秒速640m',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, t0 = 0.3, p = race(lt, s, t0, 1.15, -0.6, 3.5);
      if (p) { const r = s.P.rings; rings(r, V(clamp(p.x, -0.3, 0.6), p.y, p.z), lt - t0 - 0.05, { n: 4, speed: 2.2, life: 0.9, col: '#ffffff' }); r.rotation.y = Math.PI / 2; }
      const f = ease(k(lt, 0.4, 0.8)); s.hero2.position.set(0.65 + f * 0.3, 0, -0.1); s.hero2.rotation.set(-f * 1.4, -0.4, 0);
      h2.arm('L', 0.3, 1.2, 0.2); h2.arm('R', 0.3, 1.2, 0.2); h2.face({ lid: 0.8, brow: -1, mouth: 'o', open: 0.8 });
      h.face(lt > 0.9 ? { lid: 0, browY: 1, look: [0.8, 0.2], mouth: 'o', open: 0.8 } : { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.8, 0] });
    } },
  // 9) #10: 10 km/s, faster than a satellite
  { sc: 'st', say: ['b10'], pre: 0.4, pal: ['#141a3a', '#1d2550', '#2a3156'], hero: false, show: ['globe', 'sat', 'stars'], dim: 1, hud: ['シュート 10回目', '秒速10km'], hudColor: YEL,
    cam: { p0: [0, 1.45, 5.8], p1: [0, 1.45, 5.5], l0: [0, 1.4, 0] },
    sfx: [[0.2, 'whoosh_slide', -12], [1.0, 'whoosh_gust', -13], [1.6, 'text_pa', -12]],
    tags: [{ t: 1.6, end: 4.6, text: '人工衛星を抜いた', x: 540, y: 1300, h: 72, bg: '#ffffff' }],
    note: '国際宇宙ステーション（ISS）は秒速約7.7km',
    act(lt, s) {
      const g = s.P.globe; g.position.set(0, 1.4, -0.3); g.userData.ball.rotation.set(0.25, lt * 0.3, 0); g.userData.set({ look: [Math.cos(lt * 2.4), Math.sin(lt * 2.4) * 0.5], brow: -0.4, mouth: 'o', open: 0.5 });
      const orb = (a, r) => V(Math.cos(a) * r, 1.4 + Math.sin(a) * r * 0.32, -0.3 + Math.sin(a) * r * 0.55);
      s.P.sat.position.copy(orb(lt * 0.9 + 1.0, 1.3)); s.P.sat.rotation.set(0.3, lt, 0.2);
      const path = (t) => orb(t * 2.4 + 0.6, 1.45), p = path(lt); ballAt(s, p, lt * 30); s.P.sball.scale.setScalar(0.8); trail(s, path, lt, 7, 0.04, 0.5);
    } },
  // 10) #11: escape velocity (the cold open, in its place)
  { sc: 'st', say: ['b11'], pre: 0.15, pal: ['#8fd3ff', '#7fd08a', '#ffffff'], show: ['goal'], hero2: true, hud: ['シュート 11回目', '地球脱出'], hudColor: RED,
    cam: { p0: [0.15, 1.45, 5.4], p1: [0.15, 1.5, 5.6], l0: [0.2, 1.15, -0.4], l1: [0.25, 1.35, -0.4] },
    shake: [[0.22, 0.08, 0.7]], lines: [[0.22, 0.9]],
    sfx: [[0.0, 'whoosh_swing', -12], [0.22, 'impact_doon', -8], [0.26, 'whoosh_gust', -9], [0.95, 'sparkle', -9]],
    stamps: [{ t: 0.22, text: 'ドゴォッ!!', x: 320, y: 1120, rot: -8, color: YEL, size: 116, dur: 0.9 }, { t: 0.95, text: '☆キラーン', x: 760, y: 430, rot: 10, color: '#fff3a8', size: 74, dur: 0.8 }],
    note: '地球の重力を振り切る速さ＝秒速11.2km',
    act(lt, s) { bigKick(lt, s, false); } },
  // 11) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['シュート 11回目', '秒速20km'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.6], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 12) heat: ~200 C
  { sc: 'st', say: ['heat'], pal: ['#ff8a4a', '#ffe1cc', '#7a2e1a'], show: ['glow'], hud: ['落とし穴①', '約200℃'], hudColor: RED,
    cam: { p0: [0.1, 1.45, 4.2], p1: [0.1, 1.43, 3.9], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'flash', -14], [0.8, 'comic_surprise', -12], [1.4, 'text_pa', -11]],
    stamps: [{ t: 0.8, text: 'アチチッ!', x: 300, y: 1120, rot: -8, color: YEL, size: 100, dur: 1.0 }],
    cards: [{ t: 1.4, text: 'ボールの表面 [約200℃]', y: 470, size: 60, border: RED }],
    note: '秒速640mで空気を押し縮めたときの温度上昇（試算）',
    act(lt, s) {
      const h = s.hero.userData, bp = V(0.42, 1.05 + Math.sin(lt * 4) * 0.03, 0.45); s.hero.position.set(-0.3, 0, 0.1); s.hero.rotation.y = 0.35;
      ballAt(s, bp, lt * 2); s.P.sball.children[0].material = M('#ffb08a', 0.45); const gl = s.P.glow; gl.position.copy(bp); gl.scale.setScalar(0.2 * (1 + Math.sin(lt * 9) * 0.06));
      if (lt < 0.8) { h.reach('R', bp.clone().add(V(-0.08, 0.02, 0.05))); h.face({ lid: 0.2, mouth: 'smile', look: [0.7, -0.2] }); }
      else { const w = Math.sin(lt * 18) * 0.4; h.arm('R', 0.4, 0.5 + w, 1.4); h.arm('L', 0.4, 0.5 - w, 1.4); h.hand('R', 'pa'); h.hand('L', 'pa'); h.face({ lid: 0.7, brow: -1, mouth: 'o', open: 1.1 }); }
    } },
  // 13) the kicking foot: ~2.8 t
  { sc: 'st', say: ['foot'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hud: ['落とし穴②', '約2.8トン'], hudColor: RED,
    cam: { p0: [0.05, 1.35, 4.4], p1: [0.05, 1.33, 4.1], l0: [0, 1.15, 0] },
    sfx: [[0.1, 'impact_doon', -10], [0.5, 'comic_fall', -12], [1.2, 'text_pa', -11]],
    stamps: [{ t: 0.15, text: 'イッテェ!!', x: 310, y: 1100, rot: -8, color: RED, size: 110, dur: 1.1 }],
    cards: [{ t: 1.2, text: '足に [約2.8トン] 分の力', y: 470, size: 60, border: YEL }],
    note: '0.43kgを0.01秒で秒速640mにする力（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, Math.abs(Math.sin(lt * 7)) * 0.12, 0.2); s.hero.rotation.y = 0.5; h.leg.rotation.x = -1.0;
      s.hero.updateMatrixWorld(true); const foot = h.leg.localToWorld(V(0, -0.42, 0.06)); h.reach('L', foot.clone().add(V(-0.05, 0.05, 0))); h.reach('R', foot.clone().add(V(0.06, 0.06, 0.04)));
      h.face({ lid: 0.85, brow: -1, mouth: 'o', open: 1.2 }); h.head.rotation.z = Math.sin(lt * 7) * 0.08;
    } },
  // 14) good news / bad news
  { sc: 'st', say: ['good', 'bad'], pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: ['goal'], hero2: true,
    cam: { p0: [0.15, 1.45, 4.9], p1: [0.15, 1.45, 4.6], l0: [0.15, 1.15, -0.3] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', 'PK 100%'] : ['悪いニュース', 'ボール 0個']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [0.2 + D('good') + 0.3, 'comic_stupid', -12]],
    tags(lt) { const a = this.lt.bad; return lt < a ? [{ t: 1.2, text: 'PK 成功率100%', x: 560, y: 520, h: 84, bg: YEL }] : [{ t: a + 1.0, text: 'ボールは宇宙へ…', x: 560, y: 520, h: 80, bg: '#ffffff' }]; },
    act(lt, s, gt, sh) {
      const h = s.hero.userData, h2 = s.hero2.userData, late = lt >= sh.lt.bad; stand(s, -0.4, 0.45, 0.3); keeper(s); s.hero2.rotation.y = 0;
      if (!late) { s.P.sball.visible = true; ballAt(s, V(0.75, 0.15, -1.38)); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.06; h.arm('L', 0.2, 2.6, 0.3); h.arm('R', 0.2, 2.6, 0.3); h.face({ lid: 0.3, brow: 0.4, mouth: 'smile' });
        h2.face({ lid: 0.7, brow: -0.8, mouth: 'flat' }); h2.arm('L', 0, 0.2, 0); h2.arm('R', 0, 0.2, 0); h2.head.rotation.x = 0.25; }
      else { s.P.goal.userData.hole.visible = true; for (const [w, u] of [[s.hero, h], [s.hero2, h2]]) { u.head.rotation.x = -0.45; u.face({ lid: 0.2, brow: -0.8, browY: 1, look: [0, 1], mouth: 'flat' }); w.updateMatrixWorld(true); u.reach('R', u.head.localToWorld(V(0.0, 0.42, 0.42))); u.hand('R', 'pa'); } }
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'],
    cam: { p0: [0.05, 1.45, 4.3], p1: [0.05, 1.45, 4.0], l0: [0, 1.32, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.1, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.2); s.hero.rotation.y = 0.15; h.leg.rotation.x = -0.35;
      ballAt(s, s.hero.localToWorld(V(-0.13, 0.11, 0.4)), 0.3); s.P.sball.position.y = 0.11;
      h.arm('R', 0.2, 0.7, 1.7); h.arm('L', 0.1, 0.25, 0.3); h.face({ lid: 0.3, brow: 0.5, look: [0.2, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもシュートが毎回', '[2倍]速くなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['シュートの速さ', '毎回×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
