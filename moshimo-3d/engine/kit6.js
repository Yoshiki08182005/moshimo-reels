// kit6: "pop" toy style. Round original character (もしもくん: yellow hoodie + curly antenna hair), saturated one-colour sets, small rounded props.
// buildToyStage() -> {scene, camera, update(lt, gt, shot), api}
// shot: { pal: [wall, floor, band], show: ['counter', ...props], hero: false to hide, hero2: true, dim: light 0..1, act(lt, api, gt, shot) }
//   act poses the characters and moves props every frame (everything is reset to its home pose before act runs).
// api: { hero, hero2, P (props by name), screen(vec3) -> [x, y] in px (use it in shot.tags / shot.cards functions) }
// character (hero.userData): arm(side, fwd, out, bend) / reach(side, worldPos) / hand(side, 'gu'|'pa'|'choki') / handPos(side) /
//   face({lid 0..1, brow -1 worried..+1 angry, browY, look [x, y], mouth 'smile'|'o'|'flat', open}) / head, body (Object3D) / shades(on)
//   side 'L' / 'R' = the viewer's left / right when the character faces the camera.
import { THREE, V, lerp, clamp, canvasTex, cam, basic, applyCam } from './core.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

const MC = new Map();
export const M = (color, rough = 0.62) => { const k = color + rough; if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough })); return MC.get(k); };
const mat = (m) => typeof m === 'string' ? M(m) : m;
const SPH = new THREE.SphereGeometry(1, 36, 24);
const shd = (m) => { m.castShadow = m.receiveShadow = true; return m; };
const put = (m, x, y, z, parent) => { m.position.set(x, y, z); if (parent) parent.add(m); return m; };
export const sph = (r, m, x = 0, y = 0, z = 0, parent = null, sx = 1, sy = 1, sz = 1) => { const o = shd(new THREE.Mesh(SPH, mat(m))); o.scale.set(r * sx, r * sy, r * sz); return put(o, x, y, z, parent); };
export const caps = (r, len, m, x = 0, y = 0, z = 0, parent = null) => put(shd(new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 18), mat(m))), x, y, z, parent);
export const rbox = (w, h, d, rad, m, x = 0, y = 0, z = 0, parent = null) => put(shd(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, rad), mat(m))), x, y, z, parent);
export const cyl = (r0, r1, h, m, x = 0, y = 0, z = 0, parent = null) => put(shd(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 28), mat(m))), x, y, z, parent);

export function toyGuy(o = {}) {
  const skin = o.skin || '#ffd3ad', top = o.top || '#ffc533', pants = o.pants || '#2c3b6b', hair = o.hair || '#3b2a20';
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  caps(0.27, 0.3, top, 0, 0.78, 0, body);
  sph(0.2, top, 0, 1.08, -0.17, body, 1.25, 0.7, 0.9);
  rbox(0.26, 0.13, 0.04, 0.02, o.pocket || '#ffffff', 0, 0.66, 0.255, body);
  for (const sx of [-1, 1]) { caps(0.105, 0.22, pants, sx * 0.13, 0.32, 0, body); rbox(0.19, 0.12, 0.32, 0.05, '#ffffff', sx * 0.13, 0.06, 0.05, body); }
  const head = new THREE.Group(); head.position.y = 1.44; body.add(head);
  sph(0.42, skin, 0, 0, 0, head, 1, 0.96, 0.96);
  const hc = shd(new THREE.Mesh(new THREE.SphereGeometry(0.445, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.47), M(hair))); hc.rotation.x = -0.42; head.add(hc);
  for (const [x, s] of [[-0.2, 0.11], [0, 0.13], [0.2, 0.11]]) sph(s, hair, x, 0.3, 0.27, head, 1.2, 0.7, 0.8);
  if (o.bun) sph(0.17, hair, 0, 0.4, -0.22, head);
  else { // curly antenna
    const q = new THREE.Group(); q.position.set(0, 0.42, 0.02); head.add(q);
    const t = shd(new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.03, 10, 24, Math.PI * 1.3), M(hair))); t.position.set(0.09, 0.1, 0); t.rotation.z = Math.PI * 0.85; q.add(t);
    sph(0.045, hair, 0.17, 0.05, 0, q);
  }
  const eyes = [-1, 1].map(sx => {
    const e = new THREE.Group(); e.position.set(sx * 0.16, 0.03, 0.345); e.scale.set(1, 1.12, 0.55); head.add(e);
    sph(0.105, M('#ffffff', 0.35), 0, 0, 0, e);
    const pg = new THREE.Group(); e.add(pg);
    sph(0.052, M('#1b1b1f', 0.3), 0, 0, 0.082, pg, 1, 1, 0.6); const hl = sph(0.017, basic('#ffffff'), 0.02, 0.026, 0.12, pg);
    const lid = shd(new THREE.Mesh(new THREE.SphereGeometry(0.119, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(skin))); e.add(lid);
    const brow = caps(0.02, 0.1, hair, sx * 0.16, 0.2, 0.385, head);
    return { pg, lid, brow, sx, hl };
  });
  sph(0.045, '#f3b98f', 0, -0.07, 0.4, head);
  for (const sx of [-1, 1]) sph(0.065, '#ff9aa0', sx * 0.27, -0.11, 0.285, head, 1, 0.7, 0.35);
  const mO = sph(0.05, M('#6b2323', 0.5), 0, -0.2, 0.372, head, 1, 1, 0.35);
  const mS = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.017, 8, 20, Math.PI), M('#6b2323', 0.5)); mS.rotation.z = Math.PI; put(mS, 0, -0.15, 0.385, head);
  const shades = new THREE.Group(); head.add(shades); shades.visible = false;
  for (const sx of [-1, 1]) rbox(0.2, 0.13, 0.04, 0.03, M('#15171c', 0.25), sx * 0.16, 0.04, 0.42, shades);
  rbox(0.14, 0.025, 0.03, 0.01, M('#15171c', 0.25), 0, 0.07, 0.42, shades);
  const L1 = 0.3, L2 = 0.3;
  const arms = [-1, 1].map(sx => {
    const s = new THREE.Group(); s.position.set(sx * 0.33, 1.02, 0); body.add(s);
    caps(0.085, 0.18, top, 0, -0.14, 0, s);
    const el = new THREE.Group(); el.position.y = -L1; s.add(el);
    caps(0.08, 0.16, top, 0, -0.12, 0, el);
    const hand = new THREE.Group(); hand.position.y = -L2; el.add(hand);
    const gu = sph(0.1, skin, 0, 0, 0, hand);
    const pa = rbox(0.18, 0.23, 0.07, 0.03, skin, 0, -0.07, 0, hand);
    const choki = new THREE.Group(); hand.add(choki); sph(0.085, skin, 0, 0, 0, choki);
    caps(0.03, 0.13, skin, -0.04, -0.14, 0, choki).rotation.z = -0.28; caps(0.03, 0.13, skin, 0.04, -0.14, 0, choki).rotation.z = 0.28;
    return { s, el, hand, shapes: { gu, pa, choki }, sx };
  });
  const st = {}, A = (side) => arms[side === 'L' ? 0 : 1];
  const u = g.userData = {
    head, body, arms,
    reset() {
      Object.assign(st, { lid: 0.1, brow: 0, browY: 0, look: [0, 0], mouth: 'smile', open: 1 });
      arms.forEach(a => { a.s.rotation.set(0, 0, a.sx * 0.12); a.el.rotation.set(0, 0, 0); for (const k in a.shapes) a.shapes[k].visible = k === 'gu'; a.hand.scale.setScalar(1); });
      head.rotation.set(0, 0, 0); body.rotation.set(0, 0, 0); body.position.set(0, 0, 0); shades.visible = false;
      g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.set(1, 1, 1);
    },
    arm(side, fwd = 0, out = 0.12, bend = 0) { const a = A(side); a.s.rotation.set(-fwd, 0, a.sx * out); a.el.rotation.set(-bend, 0, 0); },
    hand(side, shape) { const a = A(side); for (const k in a.shapes) a.shapes[k].visible = k === shape; },
    handPos(side) { g.updateMatrixWorld(true); return A(side).hand.getWorldPosition(new THREE.Vector3()); },
    reach(side, target) { // two-bone IK: put the hand on a world position
      const a = A(side); g.updateMatrixWorld(true);
      const d = a.s.parent.worldToLocal(target.clone()).sub(a.s.position);
      const dist = clamp(d.length(), 0.08, L1 + L2 - 0.002), dir = d.clone().normalize();
      const bend = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
      const a1 = Math.acos(clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
      a.s.quaternion.setFromUnitVectors(V(0, -1, 0), dir).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), a1));
      a.el.rotation.set(-bend, 0, 0);
    },
    face(p) { Object.assign(st, p); },
    shades(on) { shades.visible = !!on; },
    tick(t) {
      const lid = Math.max(st.lid, ((t * 0.31 + (o.seed || 0)) % 1) < 0.035 ? 1 : 0);
      eyes.forEach(e => {
        e.lid.rotation.x = lerp(-Math.PI / 2, Math.PI / 2, lid); e.pg.position.set(st.look[0] * 0.035, st.look[1] * 0.03, 0);
        e.brow.rotation.z = Math.PI / 2 + e.sx * st.brow * 0.38; e.brow.position.y = 0.2 + st.browY * 0.04; e.hl.visible = lid < 0.6; // the highlight pokes through a closed lid
      });
      mS.visible = st.mouth === 'smile'; mO.visible = !mS.visible;
      if (st.mouth === 'o') mO.scale.set(0.045, 0.05 * (0.4 + st.open), 0.0175); else mO.scale.set(0.07, 0.013, 0.0175);
      body.scale.y = 1 + Math.sin(t * 2.2 + (o.seed || 0)) * 0.01;
    },
  };
  u.reset();
  return g;
}

export function buildToyStage() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#ffb36b');
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffe6cf, 1.7); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(3, 6.5, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 30 }); key.shadow.bias = -0.0004; key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe2ff, 0.7); fill.position.set(-4, 3, 3); scene.add(fill);
  const wallM = new THREE.MeshStandardMaterial({ color: '#ffb36b', roughness: 0.9 }), floorM = new THREE.MeshStandardMaterial({ color: '#f6e7d2', roughness: 0.85 }), bandM = new THREE.MeshStandardMaterial({ color: '#3f6fd8', roughness: 0.7 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorM); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 16), wallM); wall.position.set(0, 8, -2.4); wall.receiveShadow = true; scene.add(wall);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.34), bandM); band.position.set(0, 1.02, -2.39); scene.add(band);
  const base = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.16), bandM); base.position.set(0, 0.08, -2.39); scene.add(base);

  const P = {}, reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  const G = () => new THREE.Group();
  // kitchen counter
  { const c = G(); rbox(2.4, 0.86, 0.8, 0.06, '#2f8f5b', 0, 0.43, 0, c); rbox(2.5, 0.07, 0.9, 0.03, '#f6f1e7', 0, 0.895, 0, c); reg('counter', c); }
  // 30cm rulers (1cm = 0.02) with tick marks, and gripping hands seen from the front
  const tick = canvasTex(64, 512, (c) => {
    c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 64, 512); c.fillStyle = '#3a2c12'; c.font = 'bold 20px sans-serif'; c.textAlign = 'right';
    for (let i = 0; i <= 31; i++) { const y = 504 - i * 16; c.fillRect(0, y, i % 10 === 0 ? 34 : i % 5 === 0 ? 24 : 14, 2); if (i % 10 === 0 && i) c.fillText(String(i), 62, y + 7); }
  });
  for (const n of ['rulerA', 'rulerB']) { const r = G(); rbox(0.09, 0.64, 0.014, 0.006, '#ffd23a', 0, 0, 0, r); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.62), new THREE.MeshStandardMaterial({ map: tick, roughness: 0.6 })); f.position.z = 0.0075; r.add(f); reg(n, r); }
  for (const [n, col, dir] of [['gripA', '#9aa1ad', -1], ['gripB', '#ffc533', 1]]) {
    const h = G(); sph(0.095, '#ffd3ad', 0, -0.01, -0.075, h, 1.1, 1, 0.8);
    const sl = caps(0.085, 0.5, col, dir * 0.36, -0.12, -0.09, h); sl.rotation.z = dir * 1.25;
    h.userData.thumb = sph(0.05, '#ffd3ad', dir * 0.1, 0, 0.05, h, 1.25, 0.9, 0.8); h.userData.dir = dir; reg(n, h);
  }
  reg('egg', sph(0.07, M('#fff5e1', 0.4), 0, 0, 0, null, 1, 1.28, 1));
  reg('thumb', sph(0.05, '#ffd3ad', 0, 0, 0, null, 1.2, 0.9, 0.8));
  { const m = G(); sph(0.03, '#2a2a2e', 0, 0, 0, m, 1, 1, 2.4); sph(0.02, '#2a2a2e', 0, 0.005, 0.075, m); caps(0.004, 0.06, '#2a2a2e', 0, -0.005, 0.12, m).rotation.x = Math.PI / 2;
    const wm = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    m.userData.wings = [-1, 1].map(s => { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.04), wm); w.position.set(s * 0.05, 0.03, 0); m.add(w); return w; }); reg('ka', m); }
  { const b = G(); sph(0.075, M('#ffffff', 0.5), 0, 0, 0, b); for (const r of [0.5, -0.5]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.006, 6, 24), M('#d8362f')); t.rotation.set(0.3, r, 0); t.position.x = r * 0.07; b.add(t); } reg('ball', b); }
  { const g = new THREE.CylinderGeometry(0.042, 0.024, 0.8, 18); g.translate(0, 0.4, 0); reg('bat', shd(new THREE.Mesh(g, M('#c98f4a', 0.5)))); }
  { const c = G(); cyl(0.115, 0.085, 0.2, '#ffffff', 0, 0.1, 0, c); cyl(0.117, 0.102, 0.07, '#e2463c', 0, 0.1, 0, c); cyl(0.12, 0.12, 0.012, '#f1f1f1', 0, 0.206, 0, c);
    const sm = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.75, roughness: 1 });
    c.userData.steam = [0, 1, 2].map(i => sph(0.04, sm, (i - 1) * 0.05, 0.3, 0, c)); reg('cup', c); }
  { const c = G(); const f = cyl(0.3, 0.3, 0.04, '#ffffff', 0, 0, 0, c); f.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 10, 40), M('#2c3b6b')); c.add(rim);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rbox(0.014, i % 3 ? 0.03 : 0.06, 0.006, 0.002, '#2c3b6b', Math.sin(a) * 0.24, Math.cos(a) * 0.24, 0.024, c).rotation.z = -a; }
    const hand = (len, w, col) => { const p = G(); p.position.z = 0.03; rbox(w, len, 0.008, 0.003, col, 0, len / 2 - 0.02, 0, p); c.add(p); return p; };
    c.userData.hh = hand(0.14, 0.024, '#2c3b6b'); c.userData.mh = hand(0.22, 0.016, '#e2463c'); sph(0.02, '#2c3b6b', 0, 0, 0.035, c); reg('clock', c); }
  { const d = G(); rbox(1.0, 0.06, 0.6, 0.02, '#e3b877', 0, 0.74, 0, d); for (const [x, z] of [[-0.44, -0.24], [0.44, -0.24], [-0.44, 0.24], [0.44, 0.24]]) cyl(0.025, 0.025, 0.72, '#9aa3ad', x, 0.36, z, d); reg('desk', d); }
  { const b = G(); rbox(2.7, 1.3, 0.04, 0.02, '#c79a5b', 0, 0, -0.02, b); rbox(2.56, 1.16, 0.05, 0.01, '#2f6b4f', 0, 0, 0, b); b.position.set(0, 1.95, -2.33); reg('board', b); }
  { const l = G(); cyl(0.008, 0.008, 0.7, '#3a3a3a', 0, 0.45, 0, l); cyl(0.06, 0.27, 0.2, M('#ffffff', 0.5), 0, 0.02, 0, l);
    l.userData.on = basic('#fff3a8'); l.userData.off = M('#8a8a80'); l.userData.bulb = sph(0.09, l.userData.on, 0, -0.07, 0, l); l.position.set(0, 2.55, -0.5); reg('lamp', l); }
  { const o = G(); o.userData.items = []; const rows = [8, 7, 5, 3]; let n = 0;
    rows.forEach((cnt, r) => { for (let i = 0; i < cnt; i++) { const it = G(); sph(0.085, '#ffffff', 0, 0, 0, it, 1.08, 0.95, 0.72); rbox(0.1, 0.085, 0.13, 0.02, '#20301f', 0, -0.035, 0, it);
      it.position.set((i - (cnt - 1) / 2) * 0.19, 0.08 + r * 0.14, (n % 2) * 0.05 - r * 0.03); o.add(it); o.userData.items.push(it); n++; } }); reg('onigiri', o); }
  { const b = G(); b.userData.items = []; const cols = ['#ff7a6b', '#5aa9ff', '#ffd23a', '#7bd88f', '#c79bff', '#ffffff'];
    for (let i = 0; i < 34; i++) { const it = rbox(0.52, 0.045, 0.38, 0.012, cols[i % cols.length], Math.sin(i * 2.3) * 0.03, 0.023 + i * 0.046, Math.cos(i * 1.7) * 0.02, b); it.rotation.y = Math.sin(i * 1.3) * 0.12; b.userData.items.push(it); } reg('books', b); }
  { const s = G(); sph(0.42, basic('#ffd84a'), 0, 0, 0, s); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = caps(0.04, 0.16, basic('#ffd84a'), Math.cos(a) * 0.68, Math.sin(a) * 0.68, 0, s); r.rotation.z = a - Math.PI / 2; } reg('sun', s); }
  for (const n of ['sunf1', 'sunf2']) { const f = G(); cyl(0.03, 0.03, 1.1, '#3f9b4b', 0, 0.55, 0, f); sph(0.1, '#3f9b4b', 0.12, 0.5, 0, f, 1.5, 0.35, 0.8);
    const h = G(); h.position.set(0, 1.18, 0.02); f.add(h); const d = cyl(0.16, 0.16, 0.05, '#7a4a21', 0, 0, 0, h); d.rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const p = sph(0.085, '#ffcf2e', Math.cos(a) * 0.23, Math.sin(a) * 0.23, -0.01, h, 1, 0.5, 0.3); p.rotation.z = a; } reg(n, f); }

  // ep21 props: phone (battery fill: userData.fill.scale.y 0..1), heat (rising waves, items), bolts (items), mw (microwave, userData.glow),
  // kettle, bed, thermoA/B (userData.fill.scale.y 0..1), crowd (items), train (car wall + straps), towers (12 cooling towers, items), snow (items)
  { const p = G(); rbox(0.16, 0.3, 0.025, 0.02, '#22252d', 0, 0, 0, p); rbox(0.136, 0.262, 0.006, 0.012, M('#e6f6ff', 0.4), 0, 0, 0.012, p);
    rbox(0.07, 0.13, 0.006, 0.01, '#2c3b6b', 0, -0.005, 0.016, p); rbox(0.03, 0.015, 0.006, 0.004, '#2c3b6b', 0, 0.068, 0.016, p);
    const f = G(); f.position.set(0, -0.06, 0.02); p.add(f); const fb = rbox(0.054, 0.114, 0.004, 0.006, basic('#3fd16b'), 0, 0.057, 0, f);
    p.userData.fill = f; p.userData.fillMesh = fb; reg('phone', p); }
  { const h = G(); h.userData.items = []; const hm = basic('#ff8a3d');
    for (let i = 0; i < 3; i++) { const pts = []; for (let j = 0; j <= 16; j++) pts.push(V(Math.sin(j / 16 * Math.PI * 2) * 0.05, j / 16 * 0.36, 0));
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.016, 6), hm); m.position.x = (i - 1) * 0.22; h.add(m); h.userData.items.push(m); } reg('heat', h); }
  { const b = G(); b.userData.items = []; const sh = new THREE.Shape(); [[0.02, 0.12], [-0.05, 0.0], [0.0, 0.0], [-0.03, -0.12], [0.06, 0.03], [0.01, 0.03], [0.05, 0.12]].forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y));
    const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }); for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(bg, basic('#ffe14a')); b.add(m); b.userData.items.push(m); } reg('bolts', b); }
  { const w = G(); rbox(0.62, 0.38, 0.42, 0.04, '#f4f4f4', 0, 0.19, 0, w); rbox(0.38, 0.26, 0.012, 0.03, '#2b3340', -0.08, 0.19, 0.21, w);
    w.userData.glow = rbox(0.33, 0.21, 0.01, 0.03, basic('#ffcf6b'), -0.08, 0.19, 0.218, w); for (const y of [0.27, 0.19, 0.11]) sph(0.022, '#9aa3ad', 0.2, y, 0.215, w); reg('mw', w); }
  { const k = G(); cyl(0.1, 0.13, 0.24, '#e2463c', 0, 0.12, 0, k); sph(0.06, '#2c3b6b', 0, 0.25, 0, k, 1, 0.5, 1); const sp = caps(0.025, 0.12, '#e2463c', 0.14, 0.15, 0, k); sp.rotation.z = -0.9;
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 20, Math.PI), M('#2c3b6b')); hd.position.set(-0.12, 0.14, 0); hd.rotation.z = Math.PI / 2; k.add(hd); reg('kettle', k); }
  { const b = G(); rbox(1.5, 0.3, 0.8, 0.05, '#c98f4a', 0, 0.15, 0, b); rbox(1.46, 0.14, 0.76, 0.05, '#ffffff', 0, 0.37, 0, b); rbox(0.34, 0.1, 0.5, 0.05, '#bfe3ff', -0.55, 0.48, 0, b);
    rbox(0.08, 0.7, 0.8, 0.03, '#c98f4a', -0.75, 0.35, 0, b); reg('bed', b); }
  for (const n of ['thermoA', 'thermoB']) { const t = G(); cyl(0.06, 0.06, 0.9, M('#ffffff', 0.3), 0, 0.6, 0, t); sph(0.11, '#e2463c', 0, 0.12, 0, t);
    for (let i = 0; i < 7; i++) rbox(0.05, 0.01, 0.01, 0.003, '#2c3b6b', 0.06, 0.3 + i * 0.1, 0.03, t);
    const f = G(); f.position.y = 0.15; t.add(f); cyl(0.034, 0.034, 1, '#e2463c', 0, 0.5, 0.012, f); f.scale.y = 0.5; t.userData.fill = f; reg(n, t); }
  { const c = G(); c.userData.items = []; const cols = ['#5aa9ff', '#7bd88f', '#c79bff', '#ff7a6b', '#9aa3ad', '#2c3b6b', '#ffffff'];
    for (let i = 0; i < 16; i++) { const p = G(), r = Math.floor(i / 6); caps(0.15, 0.32, cols[i % cols.length], 0, 0.42, 0, p); sph(0.16, '#ffd3ad', 0, 0.86, 0, p); sph(0.165, i % 3 ? '#3b2a20' : '#23262f', 0, 0.9, -0.03, p, 1, 0.8, 1);
      p.position.set(((i % 6) - 2.5) * 0.42 + (r % 2) * 0.2, 0, -0.35 - r * 0.42); p.scale.setScalar(1 + r * 0.06); c.add(p); c.userData.items.push(p); } reg('crowd', c); }
  { const t = G(); rbox(7, 2.2, 0.2, 0.08, '#e8eef3', 0, 1.1, -1.9, t); rbox(7, 0.14, 0.02, 0.01, '#3fae5b', 0, 0.85, -1.79, t);
    for (let i = -3; i <= 3; i++) rbox(0.8, 0.62, 0.02, 0.06, '#9fd4ff', i * 1.05, 1.5, -1.79, t);
    const bar = cyl(0.02, 0.02, 7, '#9aa3ad', 0, 2.3, -0.2, t); bar.rotation.z = Math.PI / 2;
    for (let i = -4; i <= 4; i++) { cyl(0.008, 0.008, 0.16, '#ffffff', i * 0.38, 2.22, -0.2, t); const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16), M('#ffffff')); r.position.set(i * 0.38, 2.1, -0.2); t.add(r); }
    reg('train', t); }
  { const w = G(); w.userData.items = [];
    for (let i = 0; i < 12; i++) { const t = G(); cyl(0.17, 0.24, 0.62, '#d9dde3', 0, 0.31, 0, t); cyl(0.18, 0.17, 0.06, '#b9c0c9', 0, 0.63, 0, t); sph(0.13, M('#ffffff', 1), 0, 0.78, 0, t, 1.2, 0.8, 1);
      t.position.set(((i % 6) - 2.5) * 0.52 + Math.floor(i / 6) * 0.26, 0, -1.25 - Math.floor(i / 6) * 0.55); w.add(t); w.userData.items.push(t); } reg('towers', w); }
  { const c = G(); rbox(1.5, 0.34, 0.72, 0.12, '#35d0ff', 0, 0.36, 0, c); rbox(0.8, 0.3, 0.64, 0.12, '#35d0ff', -0.1, 0.64, 0, c); rbox(0.7, 0.22, 0.66, 0.08, '#cfeeff', -0.1, 0.66, 0, c);
    for (const [x, z] of [[-0.48, 0.34], [0.48, 0.34], [-0.48, -0.34], [0.48, -0.34]]) { const w = cyl(0.15, 0.15, 0.1, '#23262f', x, 0.17, z, c); w.rotation.x = Math.PI / 2; }
    sph(0.06, basic('#fff3a8'), 0.74, 0.42, 0.22, c); sph(0.06, basic('#fff3a8'), 0.74, 0.42, -0.22, c); reg('car', c); }
  { const s = G(); s.userData.items = []; for (let i = 0; i < 40; i++) s.userData.items.push(sph(0.025, M('#ffffff', 0.9), 0, 0, 0, s)); reg('snow', s); }

  // ep22 props: coinsA/coinsB (stack of 32 gold coins, items: show i < n), bill (green banknote), suitcase, bowl (ramen + steam), factory (with chimneys + smoke items)
  for (const n of ['coinsA', 'coinsB']) { const c = G(); c.userData.items = [];
    for (let i = 0; i < 32; i++) { const it = cyl(0.11, 0.11, 0.026, M('#ffc533', 0.35), Math.sin(i * 2.1) * 0.008, 0.013 + i * 0.028, Math.cos(i * 1.3) * 0.008, c); c.userData.items.push(it); } reg(n, c); }
  { const b = G(); rbox(0.34, 0.16, 0.008, 0.01, '#5fae6b', 0, 0, 0, b); rbox(0.3, 0.12, 0.004, 0.008, '#cfe9c8', 0, 0, 0.005, b); sph(0.04, '#5fae6b', 0, 0, 0.008, b, 1, 1, 0.15); reg('bill', b); }
  { const s = G(); rbox(0.42, 0.56, 0.2, 0.05, '#ff7a6b', 0, 0.36, 0, s); rbox(0.44, 0.03, 0.21, 0.01, '#c9523f', 0, 0.36, 0, s);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 8, 20, Math.PI), M('#2c3b6b')); h.position.set(0, 0.64, 0); s.add(h);
    for (const x of [-0.14, 0.14]) sph(0.035, '#23262f', x, 0.06, 0, s); rbox(0.12, 0.08, 0.01, 0.02, '#ffffff', 0.08, 0.48, 0.105, s); reg('suitcase', s); }
  { const c = G(); const bw = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#e2463c', 0.45)); bw.material.side = THREE.DoubleSide; bw.position.y = 0.2; shd(bw); c.add(bw);
    const soup = cyl(0.19, 0.19, 0.01, '#f2c27a', 0, 0.185, 0, c); sph(0.05, '#ffffff', 0.07, 0.2, 0.02, c, 1, 0.4, 1); sph(0.045, '#ffd23a', 0.07, 0.215, 0.02, c, 1, 0.4, 1);
    rbox(0.09, 0.006, 0.07, 0.003, '#20301f', -0.08, 0.195, -0.05, c).rotation.x = -0.6; for (const x of [-0.02, 0.0]) { const h = caps(0.006, 0.36, '#c98f4a', x, 0.33, 0.04, c); h.rotation.z = 0.5; }
    const sm = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, roughness: 1 }); c.userData.steam = [0, 1, 2].map(i => sph(0.04, sm, (i - 1) * 0.06, 0.3, 0, c)); void soup; reg('bowl', c); }
  { const f = G(); f.userData.items = []; rbox(1.3, 0.6, 0.6, 0.04, '#d9dde3', 0, 0.3, 0, f);
    for (let i = 0; i < 3; i++) { const r = rbox(0.44, 0.12, 0.62, 0.02, '#5aa9ff', -0.44 + i * 0.44, 0.66, 0, f); r.rotation.z = 0.25; }
    for (let i = 0; i < 4; i++) rbox(0.18, 0.14, 0.01, 0.02, '#2b3340', -0.45 + i * 0.3, 0.32, 0.305, f);
    for (const x of [0.38, 0.56]) cyl(0.06, 0.07, 0.5, '#9aa3ad', x, 0.95, -0.1, f);
    const sm = M('#ffffff', 1); for (let i = 0; i < 4; i++) f.userData.items.push(sph(0.07, sm, 0.47, 1.25, -0.1, f)); reg('factory', f); }

  // ep23 props: glassA/glassB (drinking glass), bottle (2L PET), bag (shopping bag with 3 bottles), scale (bathroom scale, userData.disp),
  // pclock (pendulum clock, userData.pend: rotate .rotation.z, userData.mh/hh hands)
  for (const n of ['glassA', 'glassB']) { const c = G(); cyl(0.075, 0.062, 0.2, M('#bfe8ff', 0.15), 0, 0.1, 0, c); cyl(0.068, 0.058, 0.12, '#5aa9ff', 0, 0.065, 0, c); reg(n, c); }
  const mkBottle = (p, x = 0, z = 0) => { const b = G(); b.position.set(x, 0, z); cyl(0.07, 0.07, 0.3, M('#d8f2ff', 0.2), 0, 0.15, 0, b); cyl(0.071, 0.071, 0.09, '#3fae5b', 0, 0.17, 0, b);
    cyl(0.07, 0.03, 0.07, M('#d8f2ff', 0.2), 0, 0.335, 0, b); cyl(0.026, 0.026, 0.035, '#e2463c', 0, 0.385, 0, b); p.add(b); return b; };
  { const b = G(); mkBottle(b); reg('bottle', b); }
  { const b = G(); rbox(0.42, 0.32, 0.2, 0.03, M('#f2c27a', 0.8), 0, 0.16, 0, b); for (const x of [-0.13, 0, 0.13]) mkBottle(b, x, 0).scale.setScalar(0.8);
    for (const x of [-0.1, 0.1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 20, Math.PI), M('#ffffff', 0.8)); h.position.set(x, 0.32, 0); b.add(h); } reg('bag', b); }
  { const s = G(); rbox(0.46, 0.06, 0.42, 0.04, '#f4f4f4', 0, 0.03, 0, s); rbox(0.36, 0.01, 0.2, 0.01, '#d9dde3', 0, 0.062, -0.05, s);
    s.userData.disp = rbox(0.14, 0.012, 0.06, 0.01, basic('#9fe3c0'), 0, 0.064, 0.15, s); reg('scale', s); }
  { const c = G(); rbox(0.52, 1.6, 0.26, 0.05, '#a86b3c', 0, 0.8, 0, c); rbox(0.36, 0.7, 0.02, 0.03, '#2b3340', 0, 0.62, 0.13, c);
    const f = cyl(0.19, 0.19, 0.03, '#ffffff', 0, 1.3, 0.14, c); f.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.018, 8, 32), M('#ffd23a', 0.35)); rim.position.set(0, 1.3, 0.155); c.add(rim);
    const hand = (len, w, col) => { const p = G(); p.position.set(0, 1.3, 0.165); rbox(w, len, 0.006, 0.003, col, 0, len / 2 - 0.01, 0, p); c.add(p); return p; };
    c.userData.hh = hand(0.1, 0.02, '#2c3b6b'); c.userData.mh = hand(0.16, 0.014, '#e2463c');
    const pd = G(); pd.position.set(0, 0.95, 0.15); c.add(pd); rbox(0.016, 0.48, 0.008, 0.004, '#ffd23a', 0, -0.24, 0, pd); const bob = cyl(0.07, 0.07, 0.02, M('#ffd23a', 0.3), 0, -0.5, 0, pd); bob.rotation.x = Math.PI / 2;
    c.userData.pend = pd; reg('pclock', c); }
  // slide: top platform at (-0.8, 1.2), slope down to (0.8, 0) in +x. umbrella: origin = handle bottom, canopy at y≈0.85
  { const s = G(); const sl = rbox(2.0, 0.05, 0.5, 0.02, '#35d0ff', 0, 0.6, 0, s); sl.rotation.z = -0.6435;
    for (const z of [-0.26, 0.26]) { const r = rbox(2.0, 0.1, 0.04, 0.02, '#ffd23a', 0, 0.66, z, s); r.rotation.z = -0.6435; }
    rbox(0.5, 0.06, 0.56, 0.02, '#ff6b5a', -0.98, 1.2, 0, s);
    for (const [x, z] of [[-1.2, -0.25], [-1.2, 0.25], [-0.78, -0.25], [-0.78, 0.25]]) cyl(0.03, 0.03, 1.2, '#ff6b5a', x, 0.6, z, s);
    for (let i = 1; i < 5; i++) { const r = cyl(0.02, 0.02, 0.5, '#ffffff', -1.2, i * 0.24, 0, s); r.rotation.x = Math.PI / 2; } reg('slide', s); }
  { const u = G(); cyl(0.012, 0.012, 0.9, '#2c3b6b', 0, 0.45, 0, u); const cn = shd(new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.32), M('#ff6b5a'))); cn.position.y = 0.42; cn.material.side = THREE.DoubleSide; u.add(cn);
    reg('umbrella', u); }

  const hero = toyGuy({ seed: 0.2 }), hero2 = toyGuy({ top: '#ff6b5a', hair: '#23262f', pocket: '#ffe1dc', bun: true, seed: 0.55 });
  scene.add(hero, hero2);
  const camera = cam(38), pv = new THREE.Vector3();
  const api = { scene, hero, hero2, P, key, hemi, camera, screen(v) { pv.copy(v).project(camera); return [(pv.x * 0.5 + 0.5) * 1080, (-pv.y * 0.5 + 0.5) * 1920]; } };
  return {
    scene, camera, api,
    update(lt, gt, shot) {
      const pal = shot.pal || ['#ffb36b', '#f6e7d2', '#3f6fd8'];
      wallM.color.set(pal[0]); scene.background.set(pal[0]); floorM.color.set(pal[1]); bandM.color.set(pal[2]);
      const dim = shot.dim ?? 1; hemi.intensity = 1.7 * dim; key.intensity = 2.3 * dim; fill.intensity = 0.7 * dim;
      for (const p of Object.values(P)) { p.visible = false; if (p.parent !== scene) scene.add(p); const [a, b, c] = p.userData.home; p.position.copy(a); p.rotation.copy(b); p.scale.copy(c); }
      for (const n of shot.show || []) P[n].visible = true;
      hero.userData.reset(); hero2.userData.reset(); hero.visible = shot.hero !== false; hero2.visible = !!shot.hero2; hero2.position.set(1.1, 0, 0);
      if (shot.cam) { applyCam(camera, shot.cam, lt, shot.e - shot.s); camera.updateMatrixWorld(true); }
      if (shot.act) shot.act(lt, api, gt, shot);
      hero.userData.tick(gt); hero2.userData.tick(gt);
    },
  };
}
