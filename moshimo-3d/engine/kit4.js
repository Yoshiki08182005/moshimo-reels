// Coast town (sea / tsunami / seabed / hill evacuation road) and small props (AI server racks, steam, rain, coins, coffee).
// buildCoast(o) returns {scene, camera, update(lt, gt, shot)}. shot.opt: {wave: 0..1 approach, waveH, sea: 0..1 drained, racks, steam, rain, clouds}
// Layout: sea z < -14 (surface y=-1.2), beach z -14..-3, seawall top y=2.6 at z=-2.5, town z>0, hill road z 30..140 rising to y=22 at x=0.
import { THREE, rng, lerp, clamp, ease, V, pick, lam, basic, box, person, car, building, cam, walk, sceneFor, vanisher } from './core.js';
import { tree, textBoard } from './kit2.js';

export function serverRacks(scene, x0, z0, cols = 12, rows = 3, gap = 2.2) {
  const g = new THREE.Group(); scene.add(g);
  const leds = [];
  const ledOn = [basic('#39ff88'), basic('#5ad1ff'), basic('#ffd23a')], ledOff = lam('#1a1d22');
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = x0 + (i - (cols - 1) / 2) * gap, z = z0 + j * 3.2;
    box(1.5, 2.4, 1.1, '#23272f', x, 1.2, z, g);
    box(1.52, 0.12, 1.12, '#3a404c', x, 2.42, z, g);
    for (let k = 0; k < 6; k++) for (const sz of [-1, 1]) leds.push({ m: box(0.9, 0.06, 0.02, ledOff, x, 0.5 + k * 0.32, z + sz * 0.56, g, false), ph: (i * 7 + j * 3 + k * 5) % 11 });
  }
  g.userData.update = (on, t) => leds.forEach((l, i) => { l.m.material = on && Math.sin(t * 9 + l.ph) > -0.3 ? ledOn[i % 3] : ledOff; });
  return g;
}

// rising white cubes (steam / vapor). returns fn(level 0..1, t)
export function steam(scene, area, n = 260, seed = 7, color = '#ffffff', size = 1) {
  const r = rng(seed), [x0, x1, z0, z1, y0, y1] = area;
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false }), n);
  const P = Array.from({ length: n }, () => ({ x: lerp(x0, x1, r()), z: lerp(z0, z1, r()), s: (0.5 + r() * 1.2) * size, o: r(), v: 0.6 + r() * 0.8 }));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  scene.add(im); im.visible = false;
  return (level, t) => {
    im.visible = level > 0; if (!level) return;
    P.forEach((p, i) => {
      const k = ((p.o + t * 0.18 * p.v) % 1), on = i < n * level;
      const s = on ? p.s * (0.5 + k) * (1 - k * 0.6) : 0;
      e.set(t * 0.3 + i, t * 0.2, 0); q.setFromEuler(e);
      m.compose(V(p.x + Math.sin(t + i) * 0.6, lerp(y0, y1, k), p.z), q, V(s, s, s)); im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  };
}

// falling rain streaks around a point. returns fn(level, t)
export function rain(scene, cx, cz, rad = 40, n = 700, seed = 3) {
  const r = rng(seed);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), new THREE.MeshBasicMaterial({ color: '#cfe3f5', transparent: true, opacity: 0.55 }), n);
  const P = Array.from({ length: n }, () => ({ x: cx + (r() - 0.5) * rad * 2, z: cz + (r() - 0.5) * rad * 2, o: r() }));
  const m = new THREE.Matrix4(); scene.add(im); im.visible = false;
  return (level, t) => {
    im.visible = level > 0; if (!level) return;
    P.forEach((p, i) => { const y = 30 - ((p.o + t * 1.6) % 1) * 30; m.makeTranslation(p.x, i < n * level ? y : -50, p.z); im.setMatrixAt(i, m); });
    im.instanceMatrix.needsUpdate = true;
  };
}

export function buildCoast(o = {}) {
  const r = rng(o.seed ?? 311);
  const { scene, T } = sceneFor(o.time || 'noon', 70);
  scene.fog.near = 160; scene.fog.far = 1100;
  // land + beach + seawall
  box(700, 1, 420, '#8f8a7c', 0, -0.5, 210, scene);
  box(700, 0.4, 11, '#d9c99a', 0, -1.4, -8.5, scene);
  box(700, 2.6 + 1.6, 1.4, '#a7a49c', 0, 0.5, -2.5, scene);
  box(700, 0.15, 3.0, '#b9b5ab', 0, 2.68, -1.2, scene);
  // seabed (visible when the sea drains)
  box(1400, 1, 900, '#b9a26e', 0, -10, -464, scene);
  for (let i = 0; i < 70; i++) { const s = 1 + r() * 3; box(s, s * 0.6, s, pick(r, ['#7d7466', '#6b6357', '#8a8172']), (r() - 0.5) * 300, -9.4, -20 - r() * 260, scene); }
  const fish = [];
  for (let i = 0; i < 26; i++) fish.push(box(0.7, 0.3, 0.2, pick(r, ['#ff8a3d', '#e9e9e9', '#5a87c9']), (r() - 0.5) * 60, -9.3, -18 - r() * 40, scene));
  // sea surface
  const seaMat = new THREE.MeshLambertMaterial({ color: '#2f6ea6' });
  const sea = box(1400, 0.4, 900, seaMat, 0, -1.2, -464, scene, false); sea.receiveShadow = true;
  const ripples = [];
  for (let i = 0; i < 90; i++) ripples.push({ m: box(3 + r() * 6, 0.05, 0.25, '#e8f2fa', (r() - 0.5) * 240, -0.98, -16 - r() * 300, scene, false), ph: r() * 6 });
  // tsunami: wall of water with foam lip and spray
  const wave = new THREE.Group(); scene.add(wave);
  const wBody = box(1, 1, 1, '#24577f', 0, 0, 0, wave), wFront = box(1, 1, 1, '#3a7cb0', 0, 0, 0, wave), wFoam = box(1, 1, 1, '#f2f6fa', 0, 0, 0, wave);
  // town
  const houses = [];
  for (let gx = -6; gx <= 6; gx++) for (let gz = 0; gz < 5; gz++) {
    if (Math.abs(gx) <= 1 && gz > 0) continue; // keep the hill road clear
    const w = 6 + r() * 3, d = 6 + r() * 3, h = 4 + r() * 6 + gz * 1.5, x = gx * 12 + (r() - 0.5) * 2, z = 16 + gz * 13;
    if (Math.abs(x) < 7) continue;
    const b = building(r, w, h, d, 0.0, pick(r, ['#e6e0d4', '#d8d2c4', '#c9c6bf', '#e9dcc8', '#bfc7cf']), '#5d7891');
    b.userData.mat.emissiveIntensity = T.em; b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; scene.add(b); houses.push(b);
    box(w + 0.6, 0.6, d + 0.6, pick(r, ['#8a3b32', '#3d4e6b', '#4b4b4b']), x, h + 0.3, z, scene);
  }
  for (let k = 0; k < 12; k++) for (const sx of [-1, 1]) tree(scene, sx * (30 + k * 9), 9, r);
  // promenade road along the seawall + cars
  box(700, 0.06, 6, '#5d6066', 0, 0.03, 4, scene);
  for (let x = -300; x < 300; x += 6) box(3, 0.04, 0.2, '#e0d070', x, 0.07, 4, scene);
  const cars = [0, 1, 2, 3].map(i => { const c = car(r, pick(r, ['#d8d8d8', '#9a2a2a', '#2f4f7a', '#c9b03a'])); scene.add(c); return { c, x0: -120 + i * 70, v: i % 2 ? 9 : -9, z: i % 2 ? 2.6 : 5.4 }; });
  // hill evacuation road (x=0) rising toward z=140
  for (let i = 0; i < 24; i++) {
    const z = 30 + i * 5, y = Math.min(22, i * 1.0), yr = 22 * (z - 30) / 110 + 0.55;
    if (i) box(7.2, y, 5.2, '#7d786c', 0, y / 2 - 0.9, z, scene);
    if (i % 3 === 0) for (const sx of [-1, 1]) box(0.15, 1.0, 0.15, '#d8d8d8', sx * 3.4, yr + 0.5, z, scene);
  }
  const ramp = box(6.4, 0.5, Math.hypot(110, 22), '#5d6066', 0, 11 + 0.3, 85, scene); ramp.rotation.x = -Math.atan2(22, 110);
  box(160, 22, 160, '#6f8f58', 0, 11 - 0.5, 225, scene); // hilltop
  for (let k = 0; k < 14; k++) tree(scene, (r() - 0.5) * 120, 160 + r() * 50, r);
  const sign = textBoard('高台・避難場所 ↑', { w: 640, h: 160, bg: '#1d6b3a', fg: '#ffffff', pw: 4.2, ph: 1.05 });
  sign.position.set(3.2, 3.2, 26); sign.rotation.y = Math.PI; scene.add(sign); box(0.12, 3, 0.12, '#cfcfcf', 3.2, 1.5, 26.05, scene);
  // walkers on the promenade
  const ped = [];
  for (let i = 0; i < 12; i++) { const p = person(r, { longHair: r() < 0.4 }); scene.add(p); ped.push({ p, x0: (r() - 0.5) * 80, v: (r() < 0.5 ? -1 : 1) * (1 + r() * 0.5), z: 7.5 + r() * 1.5 }); }
  const racks = serverRacks(scene, 0, 10.5, 14, 2);
  racks.position.x = 0; const rackAsm = vanisher(scene, racks, ['#23272f', '#39ff88', '#5ad1ff', '#3a404c'], 420, 41, 2.2);
  const vapor = steam(scene, [-90, 90, -110, -28, -1, 30], 340, 8, '#ffffff', 1.3);
  const rackSteam = steam(scene, [-15, 15, 9.5, 14.5, 2.6, 14], 140, 12, '#ffffff', 0.45);
  const rainFx = rain(scene, 0, 0, 45);
  const clouds = new THREE.Group(); scene.add(clouds);
  for (let i = 0; i < 18; i++) box(18 + r() * 22, 5 + r() * 4, 12 + r() * 12, basic('#cfd5dc'), (r() - 0.5) * 260, 55 + r() * 15, -70 - r() * 180, clouds, false);
  const camera = cam(52);
  const ex = o.extra ? o.extra({ scene, r, camera, racks }) : null;
  return {
    scene, camera,
    update(lt, gt, shot) {
      const op = shot.opt || {};
      // sea level (drain) and ripples
      const dr = op.seaFrom !== undefined ? lerp(op.seaFrom, op.sea ?? op.seaFrom, ease(lt / (op.drainDur || 4))) : (op.sea || 0);
      sea.position.y = -1.2 - dr * 8.6;
      ripples.forEach(q => { q.m.visible = dr < 0.6; q.m.position.y = sea.position.y + 0.22; q.m.position.x += 0; q.m.scale.x = 3 + Math.sin(gt * 1.3 + q.ph) * 2; });
      fish.forEach((f, i) => { f.visible = dr > 0.85; f.position.y = -9.3 + Math.abs(Math.sin(gt * 7 + i)) * 0.5; f.rotation.z = Math.sin(gt * 9 + i) * 0.8; });
      // wave: approach (0 far .. 1 at the seawall), height
      const wv = op.wave;
      wave.visible = wv !== undefined;
      if (wave.visible) {
        const a = op.waveTo !== undefined ? lerp(wv, op.waveTo, clamp(lt / (shot.e - shot.s))) : wv;
        const H = (op.waveH ?? 10) * (op.shrink ? lerp(1, op.shrink, ease(lt / 3)) : 1), z = lerp(-420, -18, a), y0 = sea.position.y;
        wBody.scale.set(900, H, 40); wBody.position.set(0, y0 + H / 2, z - 20);
        wFront.scale.set(900, H * 0.75, 8); wFront.position.set(0, y0 + H * 0.37, z + 3);
        wFoam.scale.set(900, 1.0, 7); wFoam.position.set(0, y0 + H + 0.2, z + 1);
      }
      // racks (assemble at T_B when op.racks === 'assemble')
      if (op.racks === 'assemble') { const p = (gt - 5.0) / 1.2; rackAsm(p < 0 ? 99 : p >= 1 ? -1 : 1.6 * (1 - p)); }
      else rackAsm(op.racks ? -1 : 99);
      racks.userData.update(!!op.racks && op.racks !== 'off', gt);
      rackSteam(op.racks && op.racks !== 'off' && gt > 5.5 ? 1 : 0, gt);
      vapor(op.steam || 0, gt);
      rainFx(op.rain || 0, gt);
      clouds.visible = !!op.clouds; clouds.position.y = op.clouds ? (1 - ease(lt / 2)) * 20 : 0;
      cars.forEach(k => { k.c.visible = !op.noCars; const x = ((k.x0 + gt * k.v + 300) % 600 + 600) % 600 - 300; k.c.position.set(x, 0, k.z); k.c.rotation.y = k.v > 0 ? Math.PI / 2 : -Math.PI / 2; });
      ped.forEach((w, i) => { w.p.visible = !op.noPeople; const x = ((w.x0 + gt * w.v + 60) % 120 + 120) % 120 - 60; w.p.position.set(x, 0, w.z); w.p.rotation.y = w.v > 0 ? Math.PI / 2 : -Math.PI / 2; walk(w.p, gt, Math.abs(w.v) * 0.9); });
      ex?.(lt, gt, shot);
    },
  };
}
