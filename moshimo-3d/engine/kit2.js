// Reusable daytime-capable scene builders. Each returns {scene, camera, update(lt, gt, shot)}.
// Camera is driven by shot.cam ({p0,p1,l0,l1,hold}) in the runner; shot.opt toggles props.
import { THREE, CFG, rng, lerp, V, pick, lam, basic, box, canvasTex, person, car, building, cam, walk, sit, sceneFor, vanisher } from './core.js';

const DAY_FACADE = ['#c9c6bf', '#b8bcc4', '#d8d2c4', '#a9b2bc', '#e0dcd2', '#9aa4ad', '#c4b8a8', '#d6c9b5'];
const NIGHT_FACADE = ['#2b3140', '#323848', '#2a2f3a', '#3a3f4c'];
export function plane(w, h, pw, ph, draw, lit = false) {
  const t = canvasTex(w, h, draw);
  const m = lit ? new THREE.MeshBasicMaterial({ map: t, toneMapped: false }) : new THREE.MeshLambertMaterial({ map: t });
  return new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), m);
}
export function textBoard(text, opt = {}) {
  const { w = 512, h = 160, bg = '#ffffff', fg = '#111111', font = 'bold 96px "BIZ UDPGothic", sans-serif', pw = 4, ph = 1.25, lit = false, sub = null } = opt;
  return plane(w, h, pw, ph, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, sub ? h * 0.4 : h / 2);
    if (sub) { g.font = `bold ${Math.round(h * 0.18)}px "BIZ UDPGothic", sans-serif`; g.fillText(sub, w / 2, h * 0.8); }
  }, lit);
}
export function tree(parent, x, z, r) {
  box(0.35, 2.2, 0.35, '#6b4b32', x, 1.1, z, parent);
  box(2.2, 1.8, 2.2, pick(r, ['#5f9a4a', '#6aa354', '#4f8a3f']), x, 2.9, z, parent);
  box(1.4, 1.0, 1.4, pick(r, ['#76b25c', '#5f9a4a']), x, 4.1, z, parent);
}
function walkers(scene, r, paths, n, o = {}) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const p = pick(r, paths);
    const pp = person(r, { longHair: r() < 0.4 });
    const dir = r() < 0.5 ? 1 : -1;
    const d = V(...p.d).multiplyScalar(dir);
    pp.rotation.y = Math.atan2(d.x, d.z);
    scene.add(pp);
    list.push({ p: pp, a: V(...p.a).add(V((r() - 0.5) * p.w, 0, (r() - 0.5) * p.w)), d, len: p.len, off: r() * p.len, v: 1.1 + r() * 0.5 });
  }
  const fn = (t) => list.forEach(w => {
    const s = ((w.off + t * w.v) % w.len + w.len) % w.len - w.len / 2;
    w.p.position.copy(w.a).addScaledVector(w.d, s);
    walk(w.p, t, w.v * 0.9);
  });
  fn.list = list; return fn;
}

// ---------- street corner with a store (convenience-store style), optional ATM queue / station / truck ----------
export function buildStreet(o = {}) {
  const r = rng(o.seed ?? 101);
  const night = o.time === 'night';
  const { scene, T } = sceneFor(o.time || 'morning', 50);
  box(500, 1, 500, night ? '#24272d' : '#5d6066', 0, -0.5, 0, scene);
  const side = night ? '#3a3d44' : '#bdb7ad';
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(114, 0.25, 114, side, sx * 63, 0.12, sz * 63, scene);
  for (let i = -3; i <= 3; i++) {
    box(0.9, 0.04, 3.6, '#e8e8e8', i * 1.6, 0.02, -8, scene); box(0.9, 0.04, 3.6, '#e8e8e8', i * 1.6, 0.02, 8, scene);
    box(3.6, 0.04, 0.9, '#e8e8e8', -8, 0.02, i * 1.6, scene); box(3.6, 0.04, 0.9, '#e8e8e8', 8, 0.02, i * 1.6, scene);
  }
  for (let z = 12; z < 200; z += 6) { box(0.25, 0.04, 3, '#e0d070', 0, 0.02, z, scene); box(0.25, 0.04, 3, '#e0d070', 0, 0.02, -z, scene); }
  for (let x = 12; x < 200; x += 6) { box(3, 0.04, 0.25, '#e0d070', x, 0.02, 0, scene); box(3, 0.04, 0.25, '#e0d070', -x, 0.02, 0, scene); }
  const reserved = [[6, 20, -22, -6], [-22, -6, -22, -6], [-30, 30, -100, -78], [-24, -6, 6, 24], ...(o.reserve || [])];
  const free = (x, z, w, d) => !reserved.some(([a, b, c, e]) => x + w / 2 > a && x - w / 2 < b && z + d / 2 > c && z - d / 2 < e);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let gx = 0; gx < 6; gx++) for (let gz = 0; gz < 7; gz++) {
    const w = 9 + r() * 3, d = 9 + r() * 3, x = sx * (14 + gx * 13), z = sz * (14 + gz * 13);
    if (!free(x, z, w, d)) continue;
    const h = 7 + r() * 16 + (gx + gz > 3 ? r() * 18 : 0);
    const b = night ? building(r, w, h, d, 0.35, pick(r, NIGHT_FACADE)) : building(r, w, h, d, 0.0, pick(r, DAY_FACADE), '#5d7891');
    b.userData.mat.emissiveIntensity = T.em; b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; scene.add(b);
  }
  for (let k = 0; k < 10; k++) for (const sx of [-1, 1]) if (!night) tree(scene, sx * 7.6, 20 + k * 12, r);
  const lampOn = basic('#ffd38a'), lampOff = lam('#9a9a9a');
  for (let k = -6; k <= 6; k++) for (const sx of [-1, 1]) {
    if (Math.abs(k * 14 + 7) < 12) continue;
    box(0.22, 6, 0.22, '#55585e', sx * 6.9, 3, k * 14 + 7, scene);
    box(0.9, 0.3, 0.6, T.lamps ? lampOn : lampOff, sx * 6.4, 6, k * 14 + 7, scene, false);
  }
  // working signals (daytime only)
  for (const [sx, sz, ry] of (o.signals || [[1, 1, Math.PI]])) {
    const g = new THREE.Group(); g.position.set(sx * 7, 0, sz * 7); g.rotation.y = ry; scene.add(g);
    box(0.25, 5.5, 0.25, '#55585e', 0, 2.75, 0, g); box(2.2, 0.75, 0.5, '#2a2c31', 0, 5.4, 0.4, g);
    [night ? '#1c3a24' : '#2fe07a', '#3a3820', '#3a1c1c'].forEach((c, i) => box(0.5, 0.5, 0.06, i === 0 && !night ? basic(c) : lam(c), (i - 1) * 0.7, 5.4, 0.68, g, false));
  }
  // station at the end of the avenue
  if (o.station !== false) {
    box(46, 11, 10, night ? '#2f333c' : '#d9d3c7', 0, 5.5, -88, scene);
    box(30, 0.6, 6, night ? '#3a3f48' : '#b8b2a6', 0, 4.2, -80.5, scene);
    const s = textBoard('駅', { w: 256, h: 256, pw: 4.2, ph: 4.2, bg: '#1d4f91', fg: '#ffffff', font: 'bold 190px "BIZ UDPGothic", sans-serif', lit: night });
    s.position.set(0, 8.2, -82.9); scene.add(s);
  }
  // store + empty lot
  box(10.6, 0.1, 8.6, night ? '#3b3a37' : '#9b968b', 12, 0.27, -15, scene);
  const fence = new THREE.Group(); scene.add(fence);
  for (let k = 0; k <= 5; k++) box(0.12, 0.9, 0.12, '#d9d9d9', 7 + k * 2, 0.7, -10.6, fence);
  box(10.2, 0.05, 0.05, '#e04a3a', 12, 1.0, -10.6, fence);
  const store = new THREE.Group(); store.position.set(12, 0, -15); scene.add(store);
  if (o.store !== false) {
    box(10, 4.6, 8, '#f3f3f0', 0, 2.3 + 0.25, 0, store);
    box(10.4, 0.4, 8.4, '#dcdcd6', 0, 4.95, 0, store);
    const glass = night ? basic('#fff4d6') : new THREE.MeshLambertMaterial({ color: '#cfe8f3', emissive: '#9fc6d8', emissiveIntensity: 0.35 });
    box(8.6, 2.6, 0.12, glass, 0, 1.65, 4.0, store, false);
    box(1.9, 2.6, 0.16, '#8fa1ad', -2.6, 1.65, 4.02, store, false);
    for (let k = 0; k < 5; k++) box(0.7, 0.9, 0.05, pick(r, ['#e05a4a', '#f2b33a', '#3a8ad6', '#4caf6a']), 0.4 + k * 0.85, 2.3, 4.07, store, false);
    const sign = plane(640, 80, 10, 1.25, (g) => {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, 640, 80);
      g.fillStyle = '#16a38a'; g.fillRect(0, 0, 640, 30); g.fillStyle = '#f3c63a'; g.fillRect(0, 30, 640, 12);
      g.fillStyle = '#16a38a'; g.font = 'bold 34px "BIZ UDPGothic", sans-serif'; g.textAlign = 'center'; g.fillText('24H  コンビニ', 320, 72);
    }, night);
    sign.position.set(0, 4.05, 4.07); store.add(sign);
    box(0.7, 0.9, 0.6, '#5a6b7a', 4.2, 0.7, 4.6, store); box(0.7, 0.9, 0.6, '#6a7a5a', 3.3, 0.7, 4.6, store);
  }
  for (let k = 0; k < 4; k++) box(0.15, 0.03, 3, '#ffffff', 8 + k * 2.6, 0.27, -8.6, scene);
  const vanish = o.store !== false ? vanisher(scene, store, ['#f3f3f0', '#16a38a', '#f3c63a', '#cfe8f3']) : () => {};
  // ATM booth (+ queue)
  const atm = new THREE.Group(); atm.position.set(-13, 0, -15); scene.add(atm);
  box(7, 3.8, 5.5, '#e9e9e9', 0, 2.15, 0, atm);
  box(5.6, 2.4, 0.1, new THREE.MeshLambertMaterial({ color: '#cfe8f3', emissive: '#9fc6d8', emissiveIntensity: night ? 1 : 0.3 }), 0, 1.6, 2.76, atm, false);
  const atmSign = textBoard('ATM', { w: 384, h: 96, pw: 5.6, ph: 1.4, bg: '#1d4f91', fg: '#ffffff', font: 'bold 80px sans-serif', lit: night });
  atmSign.position.set(0, 3.45, 2.82); atm.add(atmSign);
  const queue = new THREE.Group(); scene.add(queue);
  for (let i = 0; i < 12; i++) {
    const p = person(r, { longHair: r() < 0.4 });
    if (i < 2) { p.position.set(-13 + (i - 0.5) * 1.1, 0.25, -11.2); p.rotation.y = Math.PI; }
    else { p.position.set(-14.5 + (i - 1) * 1.05, 0.25, -9.0 + (r() - 0.5) * 0.3); p.rotation.y = -Math.PI / 2 + (r() - 0.5) * 0.5; }
    if (r() < 0.4) { p.userData.armR.rotation.x = -1.2; p.userData.head.rotation.x = 0.4; }
    queue.add(p);
  }
  // crowd gathered at the empty lot
  const gather = new THREE.Group(); scene.add(gather);
  for (let i = 0; i < 10; i++) {
    const p = person(r, { longHair: r() < 0.4 });
    p.position.set(7.5 + i * 1.0 + (r() - 0.5) * 0.4, 0.25, -8.8 + (r() - 0.5) * 1.6);
    p.rotation.y = Math.PI + (r() - 0.5) * 0.9;
    if (r() < 0.5) { p.userData.armR.rotation.x = -1.3; p.userData.head.rotation.x = 0.45; } else p.userData.head.rotation.y = (r() - 0.5);
    gather.add(p);
  }
  // truck for the night variant
  if (o.truck) {
    const tr = new THREE.Group(); tr.position.set(4, 0, -26); scene.add(tr);
    box(2.5, 2.4, 2.4, '#e8e8e8', 0, 1.6, 4.2, tr); box(2.6, 3.2, 7.5, '#c9ccd2', 0, 2.1, -0.8, tr);
    box(2.2, 0.8, 0.1, '#1a2230', 0, 2.2, 5.42, tr, false);
    box(0.5, 0.25, 0.05, basic('#fff3d6'), -0.8, 0.9, 5.42, tr, false); box(0.5, 0.25, 0.05, basic('#fff3d6'), 0.8, 0.9, 5.42, tr, false);
    for (const sz of [-3.5, -1.8, 3.8]) for (const sx of [-1, 1]) box(0.35, 0.9, 0.9, '#111', sx * 1.2, 0.45, sz, tr);
    const drv = person(r, { shirt: '#4a5a6a' }); drv.position.set(6.2, 0, -22); drv.rotation.y = -2.5; drv.userData.head.rotation.x = -0.1; scene.add(drv);
  }
  const ped = walkers(scene, r, [
    { a: [-8.2, 0.25, 30], d: [0, 0, 1], len: 70, w: 1.2 }, { a: [8.2, 0.25, 30], d: [0, 0, 1], len: 70, w: 1.2 },
    { a: [-30, 0.25, 8.4], d: [1, 0, 0], len: 50, w: 1.2 }, { a: [30, 0.25, -8.3], d: [1, 0, 0], len: 30, w: 0.6 },
  ], o.walkers ?? (night ? 3 : 26));
  const cars = [];
  for (let i = 0; i < (o.cars ?? (night ? 3 : 9)); i++) {
    const c = car(r, null, night); scene.add(c);
    const ns = i % 3 !== 0, lane = r() < 0.5 ? -2.5 : 2.5;
    cars.push({ c, ns, lane, off: r() * 160, v: 6 + r() * 4 });
  }
  const placeCar = (k, gt) => {
    const s = ((k.off + gt * k.v) % 160) - 80;
    if (k.ns) { k.c.position.set(k.lane, 0, k.lane > 0 ? -s : s); k.c.rotation.y = k.lane > 0 ? Math.PI : 0; }
    else { k.c.position.set(k.lane > 0 ? s : -s, 0, k.lane); k.c.rotation.y = k.lane > 0 ? Math.PI / 2 : -Math.PI / 2; }
  };
  const camera = cam(50);
  const ex = o.extra ? o.extra({ scene, r, cars, ped, placeCar, night, camera }) : null;
  return {
    scene, camera,
    update(lt, gt, shot) {
      const op = shot.opt || {};
      const mode = op.store || 'on';
      if (mode === 'vanish') vanish(gt - CFG.T_B); else vanish(mode === 'on' ? -1 : 99);
      fence.visible = !store.visible && !!op.fence;
      queue.visible = !!op.atm; gather.visible = !!op.gather;
      ped(gt);
      for (const k of cars) placeCar(k, gt);
      ex?.(lt, gt, shot);
    },
  };
}

// ---------- residential road (school route) ----------
export function buildResidential(o = {}) {
  const r = rng(o.seed ?? 202);
  const { scene, T } = sceneFor(o.time || 'evening', 40);
  box(400, 1, 400, '#6f7a5e', 0, -0.5, 0, scene);
  box(6.4, 0.06, 300, '#5a5d63', 0, 0.03, 0, scene);
  box(0.15, 0.07, 300, '#e8e8e8', -2.9, 0.04, 0, scene); box(0.15, 0.07, 300, '#e8e8e8', 2.9, 0.04, 0, scene);
  const HC = ['#e9e1d2', '#d8d2c6', '#c9d2d8', '#efe6d0', '#d8c8b0', '#cfd8c8'], RC = ['#3b3f4a', '#6a3b32', '#2f4a5a', '#4a4a42'];
  for (const sx of [-1, 1]) for (let k = 0; k < 14; k++) {
    const z = 20 - k * 11;
    if (sx < 0 && k === 4) { // empty lot where the store was
      box(9, 0.08, 9, '#9b968b', -8.5, 0.05, z, scene);
      for (let q = 0; q < 5; q++) box(0.1, 0.8, 0.1, '#d9d9d9', -3.9, 0.4, z - 4 + q * 2, scene);
      box(0.05, 0.05, 8.5, '#e04a3a', -3.9, 0.75, z, scene);
      continue;
    }
    box(0.25, 1.3, 10.6, '#c8c1b2', sx * 3.7, 0.65, z, scene);
    const hh = 5 + r() * 1.6;
    box(7, hh, 7.5, pick(r, HC), sx * 8.8, hh / 2, z, scene);
    box(8, 0.7, 8.4, pick(r, RC), sx * 8.8, hh + 0.35, z, scene);
    for (const wz of [-2, 2]) {
      const lit = r() < 0.3;
      box(0.1, 1.1, 1.4, lit ? basic('#ffcf86') : lam('#3a4a5a'), sx * 5.25, hh * 0.62, z + wz, scene, false);
    }
    if (r() < 0.4) tree(scene, sx * 5.2, z + 4, r);
  }
  for (let k = 0; k < 12; k++) {
    const z = 22 - k * 13;
    box(0.35, 9, 0.35, '#8e8a82', 4.2, 4.5, z, scene); box(2.4, 0.2, 0.2, '#8e8a82', 4.2, 8.3, z, scene);
    if (k < 11) for (const y of [8.2, 7.6]) box(0.04, 0.04, 13, '#202020', 4.6, y, z - 6.5, scene, false);
  }
  const plate = textBoard('こども110番の家', { w: 512, h: 128, pw: 2.2, ph: 0.55, bg: '#f5d23a', fg: '#1a1a1a', font: 'bold 64px "BIZ UDPGothic", sans-serif' });
  plate.position.set(3.55, 1.0, 9); plate.rotation.y = -Math.PI / 2; scene.add(plate);
  const kid = person(r, { cap: '#f2d23a', shirt: '#e8e8e8', pants: '#2b3a5a' });
  box(0.5, 0.58, 0.28, '#b3262a', 0, 1.2, -0.3, kid);
  kid.scale.setScalar(0.72); kid.rotation.y = Math.PI; scene.add(kid);
  const camera = cam(50);
  const ex = o.extra ? o.extra({ scene, r, kid, camera }) : null;
  return {
    scene, camera, kid,
    update(lt, gt, shot) {
      ex?.(lt, gt, shot);
      kid.visible = !o.noKid;
      kid.position.set(-0.9, 0, 6 - lt * 1.05);
      walk(kid, lt, 1.1, 0.5);
      kid.userData.head.rotation.y = Math.sin(lt * 0.9) * 0.4;
    },
  };
}

// ---------- gymnasium evacuation center ----------
export function buildGym(o = {}) {
  const r = rng(o.seed ?? 303);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#cfd6dd');
  const { lights } = { lights: null };
  const hemi = new THREE.HemisphereLight(0xf2f5ff, 0x7a6a55, 1.8); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.6); sun.position.set(30, 40, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 200 }); sun.shadow.bias = -0.0005;
  scene.add(sun);
  box(40, 0.3, 30, '#c99c60', 0, -0.15, 0, scene);
  for (const [w, d, x, z] of [[30, 0.12, 0, -9], [30, 0.12, 0, 9], [0.12, 18, -15, 0], [0.12, 18, 15, 0], [0.12, 18, 0, 0]]) box(w, 0.02, d, '#f2f2f2', x, 0.02, z, scene, false);
  const wallM = new THREE.MeshLambertMaterial({ color: '#e6e0d4' });
  const back = box(40, 14, 0.4, wallM, 0, 7, -15, scene); back.castShadow = false;
  const left = box(0.4, 14, 30, wallM, -20, 7, 0, scene); left.castShadow = false;
  for (let k = 0; k < 6; k++) box(4.5, 2.2, 0.1, basic('#f4f8ff'), -15 + k * 6, 11.5, -14.75, scene, false);
  box(3.2, 2, 0.15, '#ffffff', 0, 8.5, -14.6, scene); box(1.2, 0.9, 0.05, '#e04a3a', 0, 8.2, -14.5, scene, false);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
    const x = -12 + j * 6.5, z = -6 + i * 6;
    box(4.6, 0.04, 4.6, '#3b7dd8', x, 0.03, z, scene);
    box(4.6, 1.0, 0.08, '#c9a46a', x, 0.5, z - 2.35, scene);
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const p = person(r, { longHair: r() < 0.5 });
      p.position.set(x - 1.2 + k * 1.2, 0, z + (r() - 0.5)); p.rotation.y = (r() - 0.5) * 2; sit(p, 0.05);
      if (r() < 0.4) p.userData.head.rotation.x = 0.4;
      scene.add(p);
    }
  }
  box(6, 1, 1.4, '#8a8f96', 12, 0.5, 9, scene);
  for (let k = 0; k < 4; k++) box(0.25, 0.5, 0.25, '#4a90d9', 10 + k * 0.6, 1.25, 9, scene);
  const notice = textBoard('物資 到着待ち', { w: 512, h: 256, pw: 3.2, ph: 1.6, bg: '#ffffff', fg: '#c62828', font: 'bold 86px "BIZ UDPGothic", sans-serif', sub: '水・食料が足りません' });
  notice.position.set(12, 2.4, 8.2); scene.add(notice);
  box(0.1, 1.8, 0.1, '#555', 10.6, 0.9, 8.2, scene); box(0.1, 1.8, 0.1, '#555', 13.4, 0.9, 8.2, scene);
  for (let k = 0; k < 6; k++) box(0.9, 0.7, 0.7, '#c9a46a', 15 + (k % 3) * 1.0, 0.35 + Math.floor(k / 3) * 0.7, 5, scene);
  const standing = [];
  for (let k = 0; k < 4; k++) { const p = person(r); p.position.set(8 + k * 1.3, 0, 11.5); p.rotation.y = Math.PI; scene.add(p); standing.push(p); }
  const camera = cam(50);
  return { scene, camera, update(lt) { standing.forEach((p, i) => { p.userData.head.rotation.y = Math.sin(lt + i) * 0.3; }); } };
}

// ---------- covered shopping arcade (shotengai) ----------
export function buildShotengai(o = {}) {
  const r = rng(o.seed ?? 404);
  const { scene } = sceneFor(o.time || 'noon', 40);
  box(300, 1, 300, '#bdb7ad', 0, -0.5, 0, scene);
  for (let z = -120; z < 30; z += 3) box(8, 0.03, 1.4, '#d8d0c0', 0, 0.02, z, scene, false);
  const SHOPS = [['八百屋', '#2e7d32'], ['パン', '#8d5a2b'], ['鮮魚', '#1565c0'], ['精肉', '#c62828'], ['惣菜', '#ef6c00'], ['花', '#ad1457'], ['本', '#4e342e'], ['たばこ', '#37474f'], ['豆腐', '#455a64'], ['和菓子', '#6a1b9a']];
  const GOODS = ['#e53935', '#fdd835', '#43a047', '#fb8c00', '#8e24aa', '#f4f4f4'];
  let si = 0;
  for (const sx of [-1, 1]) for (let k = 0; k < 18; k++) {
    const z = 20 - k * 7, [name, col] = SHOPS[si++ % SHOPS.length];
    box(6, 6, 6.6, pick(r, ['#ece5d8', '#e4dccd', '#d9d2c4']), sx * 7, 3, z, scene);
    box(0.2, 3, 5.6, '#2b2b2b', sx * 3.95, 1.5, z, scene, false);
    const aw = plane(256, 64, 6.4, 1.6, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : col; g.fillRect(i * 32, 0, 32, 64); } });
    aw.position.set(sx * 3.3, 3.5, z); aw.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; aw.rotation.x = 0.0; aw.rotateX(-0.6); scene.add(aw);
    const sg = textBoard(name, { w: 384, h: 128, pw: 3.6, ph: 1.2, bg: '#fffaf0', fg: col, font: 'bold 84px "BIZ UDPGothic", sans-serif' });
    sg.position.set(sx * 3.85, 4.9, z); sg.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(sg);
    box(1.4, 0.9, 3.6, '#8d6e4f', sx * 3.0, 0.45, z, scene);
    for (let g = 0; g < (o.goods === false ? 0 : 6); g++) box(0.45, 0.35, 0.45, pick(r, GOODS), sx * 3.0 + (r() - 0.5) * 0.6, 1.05, z - 1.4 + g * 0.55, scene);
    if (r() < 0.7) { const kp = person(r, { shirt: '#f2f2f2' }); kp.position.set(sx * 4.6, 0, z + 1); kp.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; kp.userData.armR.rotation.x = -0.6; scene.add(kp); }
  }
  for (let z = 22; z > -110; z -= 6) { box(0.3, 0.3, 0.3, '#9aa0a6', -3.9, 8.6, z, scene, false); box(8, 0.25, 0.3, '#9aa0a6', 0, 8.9, z, scene, false); }
  const roof = box(8, 0.1, 140, new THREE.MeshLambertMaterial({ color: '#e6eef2', transparent: true, opacity: 0.45 }), 0, 9.1, -45, scene, false);
  roof.castShadow = false;
  const ped = walkers(scene, r, [{ a: [-1.4, 0, -20], d: [0, 0, 1], len: 80, w: 1.4 }, { a: [1.4, 0, -20], d: [0, 0, 1], len: 80, w: 1.4 }], o.walkers ?? 34);
  const camera = cam(52);
  const ex = o.extra ? o.extra({ scene, r, ped, camera }) : null;
  return { scene, camera, update(lt, gt, shot) { ped(gt); ex?.(lt, gt, shot); } };
}
