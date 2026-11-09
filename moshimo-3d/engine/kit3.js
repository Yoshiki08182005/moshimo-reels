// Effect helpers used through builders' o.extra hooks (cars / people vanish, trash piles, garbage truck, crows).
import { THREE, CFG, V, pick, box, vanisher, person, walk } from './core.js';

const modeDt = (mode, gt) => (mode === 'vanish' ? gt - CFG.T_B : mode === 'gone' ? 99 : -1);

// every car bursts into cubes at T_B (positions frozen at T_B)
export function carVanish(api) {
  const fns = api.cars.map((k, i) => {
    api.placeCar(k, CFG.T_B); k.c.updateMatrixWorld(true);
    return vanisher(api.scene, k.c, ['#d8d8d8', '#9a2a2a', '#2f4f7a', '#2b2f36', '#c9b03a', '#111111'], 60, 20 + i);
  });
  return (mode, gt) => fns.forEach(f => f(modeDt(mode, gt)));
}
// a fraction of walkers bursts at T_B and stays gone
export function peopleVanish(api, every = 2) {
  api.ped(CFG.T_B);
  const fns = api.ped.list.filter((_, i) => i % every === 0).map((w, i) => {
    w.p.updateMatrixWorld(true);
    return vanisher(api.scene, w.p, ['#e9edf2', '#3a5a8a', '#2f3b4c', '#f1c9a5', '#2a2f3a', '#c46a8a'], 28, 40 + i);
  });
  return (mode, gt) => fns.forEach(f => f(modeDt(mode, gt)));
}
// trash bag mounds at spots [[x, z, radius]]; level 0..1 controls amount and height
export function trashPiles(scene, r, spots, per = 48) {
  const COLS = ['#eef2f4', '#dfe8ee', '#c9dbe8', '#e9e2b8', '#f6f6f6', '#b9cfe0', '#d6e6d2'];
  const items = [];
  for (const [x, z, rad] of spots) for (let i = 0; i < per; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad;
    const s = 0.45 + r() * 0.35;
    const m = box(s, s * 0.8, s * 0.9, pick(r, COLS), x + Math.cos(a) * d, 0, z + Math.sin(a) * d, scene);
    m.rotation.set((r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5);
    items.push({ m, k: i / per, mound: Math.max(0, 1 - d / rad) * (0.4 + r() * 0.6), s });
  }
  const crows = [];
  for (const [x, z, rad] of spots) for (let i = 0; i < 3; i++) {
    const g = new THREE.Group(); scene.add(g);
    box(0.32, 0.26, 0.55, '#111318', 0, 0.3, 0, g); box(0.2, 0.2, 0.22, '#111318', 0, 0.48, 0.3, g);
    box(0.06, 0.06, 0.16, '#3a3a3a', 0, 0.46, 0.46, g);
    const wl = box(0.5, 0.04, 0.3, '#16181e', -0.3, 0.38, 0, g), wr = box(0.5, 0.04, 0.3, '#16181e', 0.3, 0.38, 0, g);
    crows.push({ g, wl, wr, x: x + (r() - 0.5) * rad * 2.4, z: z + (r() - 0.5) * rad * 2.4, ph: r() * 6 });
  }
  return (level, t) => {
    for (const it of items) {
      it.m.visible = it.k < level;
      it.m.position.y = it.s * 0.4 + it.mound * 2.6 * level * (0.3 + it.k);
    }
    crows.forEach((c, i) => {
      c.g.visible = level > 0.2 && i % 3 < Math.ceil(level * 3);
      const hop = Math.max(0, Math.sin(t * 5 + c.ph)) * 0.25;
      c.g.position.set(c.x, hop, c.z); c.g.rotation.y = c.ph + Math.sin(t * 0.7 + c.ph);
      const f = Math.sin(t * 22 + c.ph) * 0.5; c.wl.rotation.z = f; c.wr.rotation.z = -f;
    });
  };
}
// blue garbage truck with two workers; returns {g, workers}
export function garbageTruck(scene, r, x, z, ry) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  box(2.3, 2.1, 2.2, '#f2f2f2', 0, 1.45, 2.7, g); box(2.1, 0.7, 0.1, '#1a2230', 0, 1.95, 3.82, g, false);
  box(2.4, 2.5, 4.4, '#2f6fb3', 0, 1.85, -0.75, g); box(2.42, 0.3, 4.42, '#ffffff', 0, 2.5, -0.75, g);
  box(2.2, 2.0, 0.9, '#d0d4d8', 0, 1.55, -3.4, g); box(1.6, 0.9, 0.12, '#3a3f46', 0, 1.2, -3.86, g, false);
  for (const sz of [-2.2, 2.6]) for (const sx of [-1, 1]) box(0.32, 0.8, 0.8, '#111', sx * 1.1, 0.4, sz, g);
  const workers = [];
  for (const [wx, wz] of [[-0.8, -4.6], [0.9, -5.2]]) {
    const p = person(r, { shirt: '#2f6fb3', pants: '#2f3b4c', cap: '#2f6fb3' });
    p.position.set(wx, 0, wz); p.rotation.y = Math.PI * 0.1; g.add(p);
    box(0.5, 0.45, 0.4, '#eef2f4', 0, -0.85, 0.15, p.userData.armR); workers.push(p);
  }
  return { g, workers };
}
// kids playing on an empty road (ring-around)
export function playingKids(scene, r, cx, cz, n = 5) {
  const kids = [];
  for (let i = 0; i < n; i++) {
    const p = person(r, { cap: pick(r, ['#f2d23a', '#e04a3a', '#3a8ad6']), longHair: r() < 0.4 });
    p.scale.setScalar(0.72); scene.add(p); kids.push({ p, a: (i / n) * Math.PI * 2 });
  }
  return (t) => kids.forEach((k, i) => {
    const a = k.a + t * 0.6;
    k.p.position.set(cx + Math.cos(a) * 2.2, Math.abs(Math.sin(t * 6 + i)) * 0.15, cz + Math.sin(a) * 2.2);
    k.p.rotation.y = -a; walk(k.p, t, 1.2, 0.6);
  });
}

// ---------- original mascot giant hero "ギガもしも" (channel's own design) ----------
export function giantHero(scene, scale = 20) {
  const NAVY = '#25335a', GOLD = '#f3c24f', ORANGE = '#ff8a3d', WHITE = '#f4f4f0', TEAL = '#16a38a';
  const g = new THREE.Group(); scene.add(g);
  const mkLeg = (x) => { const l = new THREE.Group(); l.position.set(x, 0.8, 0); g.add(l);
    box(0.27, 0.62, 0.3, NAVY, 0, -0.3, 0, l); box(0.32, 0.22, 0.42, ORANGE, 0, -0.69, 0.05, l);
    const knee = box(0.2, 0.14, 0.05, new THREE.MeshBasicMaterial({ color: '#ff2a2a', toneMapped: false }), 0, -0.22, 0.16, l, false); knee.visible = false;
    return { l, knee }; };
  const L = mkLeg(-0.15), R = mkLeg(0.15);
  box(0.64, 0.72, 0.38, NAVY, 0, 1.16, 0, g); box(0.66, 0.1, 0.4, GOLD, 0, 0.84, 0, g);
  box(0.36, 0.28, 0.05, GOLD, 0, 1.3, 0.2, g); box(0.12, 0.12, 0.06, ORANGE, 0, 1.3, 0.22, g);
  const cape = box(0.6, 0.95, 0.04, TEAL, 0, 1.0, -0.22, g); cape.rotation.x = 0.12;
  const mkArm = (x) => { const a = new THREE.Group(); a.position.set(x, 1.46, 0); g.add(a);
    box(0.18, 0.62, 0.22, NAVY, 0, -0.3, 0, a); box(0.2, 0.18, 0.22, ORANGE, 0, -0.68, 0, a); return a; };
  const armL = mkArm(-0.42), armR = mkArm(0.42);
  const head = new THREE.Group(); head.position.set(0, 1.54, 0); g.add(head);
  box(0.52, 0.46, 0.46, WHITE, 0, 0.23, 0, head);
  box(0.11, 0.15, 0.03, '#141414', -0.11, 0.26, 0.235, head, false); box(0.11, 0.15, 0.03, '#141414', 0.11, 0.26, 0.235, head, false);
  box(0.04, 0.04, 0.02, '#ffffff', -0.09, 0.3, 0.25, head, false); box(0.04, 0.04, 0.02, '#ffffff', 0.13, 0.3, 0.25, head, false);
  const mouth = box(0.14, 0.03, 0.02, '#3a2a2a', 0, 0.11, 0.235, head, false);
  box(0.07, 0.16, 0.16, ORANGE, -0.29, 0.24, 0, head); box(0.07, 0.16, 0.16, ORANGE, 0.29, 0.24, 0, head);
  box(0.04, 0.22, 0.04, GOLD, 0, 0.56, 0, head); box(0.1, 0.1, 0.1, GOLD, 0, 0.7, 0, head);
  g.scale.setScalar(scale);
  return { g, legL: L.l, legR: R.l, knees: [L.knee, R.knee], armL, armR, head, mouth };
}
// gray dust cubes bursting from (x,z); returns update(dt)
export function dustBurst(scene, x, z, rad = 8, n = 120, seed = 9) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#b9b2a6', transparent: true, opacity: 0.85, depthWrite: false }), n);
  const r = rng0(seed), P = [], m = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, sp = rad * (0.4 + r()); P.push({ a, sp, up: 2 + r() * 6, s: 0.8 + r() * 1.6 }); }
  im.visible = false; scene.add(im);
  return (dt) => {
    im.visible = dt >= 0 && dt < 2.2; if (!im.visible) return;
    im.material.opacity = 0.85 * (1 - dt / 2.2);
    P.forEach((o, i) => { const k = 1 - Math.exp(-dt * 2.5); const s = o.s * (1 + dt);
      m.compose(V(x + Math.cos(o.a) * o.sp * k, o.up * k, z + Math.sin(o.a) * o.sp * k), q, V(s, s, s)); im.setMatrixAt(i, m); });
    im.instanceMatrix.needsUpdate = true;
  };
}
function rng0(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// crater + cracks under a foot
export function crater(scene, x, z, size = 6) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  box(size, 0.12, size * 0.8, '#3a3632', 0, 0.06, 0, g);
  for (let i = 0; i < 8; i++) { const c = box(size * 0.9, 0.06, 0.25, '#2a2724', 0, 0.08, 0, g); c.rotation.y = i * 0.8; c.position.set(Math.cos(i * 0.8) * size * 0.6, 0.08, -Math.sin(i * 0.8) * size * 0.6); }
  g.visible = false; return g;
}
// expanding sound rings from a point
export function soundRings(scene, pos, n = 4, k = 1) {
  const rings = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 6, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false, toneMapped: false }));
    m.position.copy(pos); scene.add(m); rings.push(m);
  }
  return (t, on) => rings.forEach((m, i) => {
    const p = ((t * 0.7 + i / n) % 1);
    m.visible = on; m.scale.setScalar((2 + p * 26) * k); m.material.opacity = 0.7 * (1 - p);
  });
}
// pile of onigiri (rice balls); level 0..1
export function onigiriPile(scene, x, z, n = 140, seed = 3) {
  const r = rng0(seed), items = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group(); scene.add(g);
    box(1.1, 1.0, 0.45, '#fbfaf5', 0, 0.5, 0, g); box(0.62, 0.42, 0.48, '#1c2a1e', 0, 0.21, 0, g);
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 5.5;
    g.position.set(x + Math.cos(a) * d, Math.max(0, (1 - d / 5.5)) * 5 * r(), z + Math.sin(a) * d);
    g.rotation.set((r() - 0.5) * 0.8, r() * 6, (r() - 0.5) * 0.8);
    items.push({ g, k: i / n });
  }
  return (level) => items.forEach(it => { it.g.visible = it.k < level; });
}
