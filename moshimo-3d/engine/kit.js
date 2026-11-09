// Reusable scene builders (ep02: city/intersection/elevator/tower/market/hospital/sky).
import { THREE, W, H, CFG, rng, clamp, ease, lerp, V, vlerp, pick, BOX, lam, basic, box, canvasTex, gradBg, person, car, building, starField, lights, cam } from './core.js';

// ---------- scene: city (intro / blackout / restore) ----------
export function buildCity() {
  const r = rng(11);
  const scene = new THREE.Scene();
  const gc = document.createElement('canvas'); gc.width = 4; gc.height = 512;
  const bgTex = new THREE.CanvasTexture(gc); bgTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = bgTex;
  const ON = ['#0d1530', '#25285a', '#5d4170', '#b06f62'], OFF = ['#02050d', '#050c1d', '#0a1428', '#111d36'];
  const fogOn = new THREE.Color('#4a3a62'), fogOff = new THREE.Color('#0b1426');
  scene.fog = new THREE.Fog(fogOn.clone(), 160, 700);
  const L = lights(scene, { hemi: 1.4, dir: 1.6 });
  box(2000, 1, 2000, '#15171c', 0, -0.5, 0, scene, false);
  const bld = [], cars = [], lampPos = [];
  for (let bx = -5; bx <= 5; bx++) for (let bz = -15; bz <= 2; bz++) {
    const cx = bx * 30, cz = bz * 30;
    box(22, 0.3, 22, '#2a2d35', cx, 0.15, cz, scene, false);
    const boost = Math.max(0, 1 - Math.hypot(cx, cz + 170) / 230);
    const split = r() < 0.55;
    const parts = split ? [[-5, -5], [5, -5], [-5, 5], [5, 5]] : [[0, 0]];
    for (const [ox, oz] of parts) {
      if (split && r() < 0.15) continue;
      const w = split ? 8 + r() * 1.5 : 15 + r() * 5, d = split ? 8 + r() * 1.5 : 15 + r() * 5;
      const h = 6 + r() * 16 + boost * (25 + r() * 70);
      const b = building(r, w, h, d, 0.4 + r() * 0.35);
      b.position.x = cx + ox; b.position.z = cz + oz; scene.add(b);
      bld.push({ m: b, dist: Math.hypot(cx + ox, cz + oz - 80), seed: r() });
    }
    lampPos.push([cx - 13.5, cz - 13.5], [cx + 13.5, cz - 13.5]);
  }
  const lampGeo = new THREE.BoxGeometry(1.0, 0.45, 1.0);
  const lampMat = basic('#ffcf86');
  const lamps = new THREE.InstancedMesh(lampGeo, lampMat, lampPos.length);
  const poleGeo = new THREE.BoxGeometry(0.25, 6, 0.25);
  const poles = new THREE.InstancedMesh(poleGeo, lam('#3a3c42'), lampPos.length);
  const m4 = new THREE.Matrix4();
  lampPos.forEach(([x, z], i) => { lamps.setMatrixAt(i, m4.makeTranslation(x, 6.2, z)); poles.setMatrixAt(i, m4.makeTranslation(x, 3, z)); });
  scene.add(lamps, poles);
  for (let i = 0; i < 60; i++) {
    const ns = r() < 0.6;
    const c = car(r);
    if (ns) {
      const road = (Math.floor(r() * 11) - 5) * 30 + 15, lane = r() < 0.5 ? -2.2 : 2.2;
      c.position.set(road + lane, 0, -450 + r() * 520); c.rotation.y = lane < 0 ? Math.PI : 0;
      cars.push({ c, p0: c.position.clone(), dir: V(0, 0, lane < 0 ? -1 : 1), v: 7 + r() * 6 });
    } else {
      const road = (Math.floor(r() * 18) - 15) * 30 + 15, lane = r() < 0.5 ? -2.2 : 2.2;
      c.position.set(-160 + r() * 320, 0, road + lane); c.rotation.y = lane < 0 ? -Math.PI / 2 : Math.PI / 2;
      cars.push({ c, p0: c.position.clone(), dir: V(lane < 0 ? -1 : 1, 0, 0), v: 7 + r() * 6 });
    }
    scene.add(c);
  }
  // billboards
  const boards = [];
  const tall = bld.filter(b => b.m.scale.y > 45 && b.m.position.z > -260 && b.m.position.z < -40).slice(0, 5);
  tall.forEach((b, i) => {
    const hue = [300, 190, 30, 260, 140][i % 5];
    const tex = canvasTex(256, 160, (g) => {
      const gr = g.createLinearGradient(0, 0, 256, 160);
      gr.addColorStop(0, `hsl(${hue},90%,55%)`); gr.addColorStop(1, `hsl(${(hue + 60) % 360},90%,60%)`);
      g.fillStyle = gr; g.fillRect(0, 0, 256, 160);
      g.fillStyle = 'rgba(255,255,255,0.9)';
      for (let k = 0; k < 14; k++) { const hh = 20 + ((k * 37 + i * 11) % 90); g.fillRect(110 + k * 9, 140 - hh, 6, hh); }
      g.font = 'bold 34px sans-serif'; g.fillText('NIGHT', 14, 60); g.fillText('LIVE', 14, 100);
    });
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.5), mat);
    p.position.set(b.m.position.x, b.m.scale.y * 0.72, b.m.position.z + b.m.scale.z / 2 + 0.2);
    scene.add(p); boards.push({ mat, b });
  });
  const stars = starField(r, 2500, 1500, 1.8, 0.9); stars.material.opacity = 0; scene.add(stars);
  const camera = cam(48);
  const cOn = ON.map(c => new THREE.Color(c)), cOff = OFF.map(c => new THREE.Color(c));
  function setDark(k) {
    const g = gc.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512);
    [0, 0.45, 0.78, 1].forEach((p, i) => gr.addColorStop(p, '#' + cOn[i].clone().lerp(cOff[i], k).getHexString()));
    g.fillStyle = gr; g.fillRect(0, 0, 4, 512); bgTex.needsUpdate = true;
    scene.fog.color.copy(fogOn).lerp(fogOff, k);
    stars.material.opacity = k * 0.8;
    L.hemi.intensity = lerp(1.4, 3.4, k); L.dir.intensity = lerp(1.6, 3.2, k);
    L.hemi.color.set(0x7a88c8).lerp(new THREE.Color(0x8aa0e8), k);
  }
  function flick(t, seed) { return Math.sin(t * 70 + seed * 40) > 0.1 ? 0.8 : 0.08; }
  function setLevels(fn) {
    for (const b of bld) b.m.userData.mat.emissiveIntensity = fn(b);
  }
  return {
    scene, camera,
    blackout(lt, gt) {
      const k = clamp((gt - CFG.T_B) / 1.4);
      setDark(k);
      setLevels(b => {
        const off = CFG.T_B + (b.dist / 600) * 0.9 + b.seed * 0.12;
        return gt < off ? 1 : gt < off + 0.22 ? flick(gt, b.seed) : 0;
      });
      lampMat.color.set(gt < CFG.T_B + 0.15 ? '#ffcf86' : '#24252a');
      for (const bd of boards) bd.mat.color.setScalar(gt < CFG.T_B + 0.1 + bd.b.seed * 0.3 ? 1 : 0.03);
      const tt = gt < CFG.T_B ? gt : CFG.T_B + 0.9 * (1 - Math.exp(-(gt - CFG.T_B) / 0.9));
      for (const c of cars) c.c.position.copy(c.p0).addScaledVector(c.dir, c.v * tt);
      const k2 = ease(gt / 11.5);
      camera.position.copy(vlerp(V(25, 120, 170), V(-5, 85, 60), k2));
      camera.lookAt(vlerp(V(0, 0, -150), V(0, 40, -260), k2));
    },
    restore(lt) {
      const k = 1 - clamp((lt - 1.0) / 5.5);
      setDark(k);
      setLevels(b => {
        const on = 1.0 + ((600 - b.dist) / 600) * 4.2 + b.seed * 0.9;
        return lt < on ? 0 : lt < on + 0.3 ? flick(lt, b.seed) : 1;
      });
      lampMat.color.set(lt > 3.2 ? '#ffcf86' : '#24252a');
      for (const bd of boards) bd.mat.color.setScalar(lt > 4.8 + bd.b.seed ? 1 : 0.03);
      for (const c of cars) c.c.position.copy(c.p0).addScaledVector(c.dir, c.v * Math.max(0, lt - 3) * 0.6);
      const k2 = ease(lt / 8.5);
      camera.position.copy(vlerp(V(12, 30, 70), V(35, 135, 190), k2));
      camera.lookAt(vlerp(V(0, 25, -60), V(0, 0, -160), k2));
    },
  };
}

// ---------- scene: intersection ----------
export function buildIntersection() {
  const r = rng(22);
  const scene = new THREE.Scene();
  scene.background = gradBg([[0, '#03060f'], [0.6, '#0a1430'], [1, '#16244a']]);
  scene.fog = new THREE.Fog(0x0b1530, 50, 190);
  lights(scene, { hemi: 2.0, dir: 2.2, shadow: 45, dirPos: V(-30, 60, 25) });
  box(400, 1, 400, '#24272d', 0, -0.5, 0, scene);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(36, 0.3, 36, '#3a3d44', sx * 28, 0.15, sz * 28, scene);
    for (let k = 0; k < 3; k++) {
      const w = 10 + r() * 6, d = 10 + r() * 6, h = 14 + r() * 26;
      const b = building(r, w, h, d, 0.0);
      b.userData.mat.emissiveIntensity = 0;
      b.position.set(sx * (18 + k * 9 + r() * 3), h / 2, sz * (20 + r() * 12));
      b.castShadow = b.receiveShadow = true; scene.add(b);
    }
  }
  const white = '#cfcfcf';
  for (let i = -3; i <= 3; i++) {
    box(0.9, 0.04, 4, white, i * 1.7, 0.02, -11.5, scene);
    box(0.9, 0.04, 4, white, i * 1.7, 0.02, 11.5, scene);
    box(4, 0.04, 0.9, white, -11.5, 0.02, i * 1.7, scene);
    box(4, 0.04, 0.9, white, 11.5, 0.02, i * 1.7, scene);
  }
  for (let z = 16; z < 120; z += 6) { box(0.25, 0.04, 3, '#b8a24a', 0, 0.02, z, scene); box(0.25, 0.04, 3, '#b8a24a', 0, 0.02, -z, scene); }
  for (let x = 16; x < 120; x += 6) { box(3, 0.04, 0.25, '#b8a24a', x, 0.02, 0, scene); box(3, 0.04, 0.25, '#b8a24a', -x, 0.02, 0, scene); }
  // dead signals
  for (const [sx, sz, ry] of [[-1, -1, 0], [1, 1, Math.PI], [1, -1, -Math.PI / 2], [-1, 1, Math.PI / 2]]) {
    const g = new THREE.Group(); g.position.set(sx * 9.5, 0, sz * 9.5); g.rotation.y = ry; scene.add(g);
    box(0.3, 7, 0.3, '#4a4d55', 0, 3.5, 0, g);
    box(0.2, 0.2, 4.5, '#4a4d55', 0, 6.8, 2.2, g);
    box(2.6, 0.9, 0.6, '#2a2c31', 0, 6.8, 4.4, g);
    ['#1c2a1f', '#2e2c18', '#2e1818'].forEach((c, i) => box(0.6, 0.6, 0.08, c, (i - 1) * 0.8, 6.8, 4.75, g, false));
  }
  const stuck = [];
  const place = (x, z, ry) => { const c = car(r); c.position.set(x, 0, z); c.rotation.y = ry; scene.add(c); return c; };
  for (let k = 0; k < 4; k++) {
    place(-2.4, -16 - k * 6, 0); place(2.4, 16 + k * 6, Math.PI);
    place(16 + k * 6, -2.4, -Math.PI / 2); place(-16 - k * 6, 2.4, Math.PI / 2);
  }
  stuck.push(place(2.8, -3.2, -0.7), place(-4.2, 3.8, 2.3), place(5.5, 4, -2.0));
  const cop = person(r, { shirt: '#1d2a4a', pants: '#1d2a4a', cap: '#1d2a4a', vest: '#c6e04a' });
  cop.position.set(-1.2, 0, 1.2); cop.rotation.y = 0.5; scene.add(cop);
  const baton = box(0.13, 0.95, 0.13, basic('#ff4632'), 0, -1.1, 0, cop.userData.armR, false);
  const glow = new THREE.PointLight(0xff3a20, 30, 10, 2); glow.position.set(0, -1.1, 0); cop.userData.armR.add(glow);
  const peds = [];
  for (let k = 0; k < 7; k++) {
    const p = person(r, { longHair: r() < 0.4 });
    const c = [[-12, -12], [12, -12], [12, 12], [-12, 12]][k % 4];
    p.position.set(c[0] + (r() - 0.5) * 3, 0.3, c[1] + (r() - 0.5) * 3);
    p.rotation.y = Math.atan2(-p.position.x, -p.position.z); scene.add(p); peds.push(p);
  }
  for (const [x, z, ry] of [[-2.4, -16, 0], [2.4, 16, Math.PI], [2.8, -3.2, -0.7]]) {
    const s = new THREE.SpotLight(0xfff0d0, 400, 40, 0.5, 0.6, 1.6);
    s.position.set(x, 1, z); s.target.position.set(x + Math.sin(ry) * 10, 0, z + Math.cos(ry) * 10);
    scene.add(s, s.target);
  }
  const camera = cam(50);
  return {
    scene, camera,
    update(lt) {
      cop.userData.armR.rotation.z = 2.5 + Math.sin(lt * 3.2) * 0.45;
      cop.userData.armR.rotation.x = -0.2;
      cop.rotation.y = 0.5 + Math.sin(lt * 0.8) * 0.5;
      stuck[0].position.x = 2.8 + Math.min(lt, 6) * 0.08;
      const a = 0.65 + lt * 0.045;
      camera.position.set(Math.sin(a) * 23, 11 - lt * 0.3, Math.cos(a) * 23);
      camera.lookAt(0, 1.2, 0);
    },
  };
}

// ---------- scene: elevator ----------
export function buildElevator() {
  const r = rng(33);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#070a12');
  lights(scene, { hemi: 1.1, dir: 1.0, dirPos: V(10, 30, 40), sky: 0x6a7ab0 });
  const FY = [0, 4.5, 9, 13.5, 18, 22.5, 27];
  for (const y of FY) {
    box(14, 0.5, 10, '#3a3f4a', -9.6, y, 0, scene);
    box(14, 0.5, 10, '#3a3f4a', 9.6, y, 0, scene);
    for (const sx of [-1, 1]) {
      box(14, 4, 0.3, '#3d434f', sx * 9.6, y + 2.25, -4.8, scene);
      box(1.3, 2.4, 0.12, '#5a4636', sx * 7, y + 1.45, -4.6, scene);
      box(1.3, 2.4, 0.12, '#5a4636', sx * 12, y + 1.45, -4.6, scene);
      box(1.1, 0.42, 0.1, basic('#2fd46a'), sx * 15.5, y + 3.6, -4.55, scene, false);
    }
  }
  const labels = ['1F', '2F', '3F', '4F', '5F', '6F'];
  FY.slice(0, 6).forEach((y, i) => {
    const t = canvasTex(128, 64, (g) => { g.fillStyle = '#d8d8d8'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText(labels[i], 64, 48); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshLambertMaterial({ map: t, transparent: true }));
    p.position.set(-4.4, y + 3.3, -4.6); scene.add(p);
  });
  box(5.4, 32, 0.3, '#262b35', 0, 15, -2.8, scene);
  box(0.3, 32, 5.6, '#2e333d', -2.85, 15, 0, scene);
  box(0.3, 32, 5.6, '#2e333d', 2.85, 15, 0, scene);
  const carG = new THREE.Group(); carG.position.set(0, 15.4, 0); scene.add(carG);
  box(4.4, 0.3, 4.4, '#5a5f69', 0, 0, 0, carG);
  box(4.4, 3.4, 0.2, '#8d939c', 0, 1.85, -2.1, carG);
  box(0.2, 3.4, 4.4, '#8d939c', -2.1, 1.85, 0, carG);
  box(0.2, 3.4, 4.4, '#8d939c', 2.1, 1.85, 0, carG);
  box(4.4, 0.3, 4.4, '#5a5f69', 0, 3.6, 0, carG);
  box(3.6, 0.08, 0.08, '#c0c4ca', 0, 1.1, -1.9, carG);
  box(0.5, 1.0, 0.08, '#2a2a2a', 1.9, 1.8, 1.2, carG);
  const eLamp = box(0.8, 0.12, 0.4, basic('#ffcf7a'), 0, 3.4, 0, carG, false);
  const pl = new THREE.PointLight(0xffb35c, 40, 9, 2); pl.position.set(0, 3.0, 0.4); carG.add(pl);
  for (const x of [-0.6, 0, 0.6]) box(0.08, 13, 0.08, '#1b1b1b', x, 3.6 + 6.5, 0, carG);
  box(1.2, 3, 0.5, '#4a4d55', 1.9, 22, -2.3, scene);
  const p1 = person(r, { shirt: '#2f3b4c' }); p1.position.set(-0.8, 0.15, -0.4); p1.rotation.y = 0.3; carG.add(p1);
  const p2 = person(r, { longHair: true, shirt: '#c46a8a' }); p2.position.set(0.9, 0.15, 0.3); p2.rotation.y = -0.5; carG.add(p2);
  p2.userData.armR.rotation.x = -1.2;
  const phone = box(0.1, 0.18, 0.02, basic('#bfe0ff'), 0, -0.72, 0.1, p2.userData.armR, false);
  phone.rotation.x = 1.2;
  p1.userData.head.rotation.x = -0.35;
  const camera = cam(45);
  return {
    scene, camera,
    update(lt) {
      const f = 0.85 + 0.15 * Math.sin(lt * 23) * Math.sin(lt * 7.3);
      pl.intensity = 40 * f; eLamp.material.color.setScalar(f);
      const k = ease(lt / 7);
      camera.position.copy(vlerp(V(-3, 13, 34), V(1.5, 17.2, 15), k));
      camera.lookAt(vlerp(V(0, 15, 0), V(0, 17, 0), k));
    },
  };
}

// ---------- scene: cell tower ----------
export function buildTower() {
  const r = rng(44);
  const scene = new THREE.Scene();
  scene.background = gradBg([[0, '#02050c'], [0.55, '#091327'], [1, '#162746']]);
  scene.fog = new THREE.Fog(0x0b1530, 40, 230);
  lights(scene, { hemi: 1.9, dir: 2.2, shadow: 50, dirPos: V(-30, 60, 30) });
  box(500, 1, 500, '#1a211d', 0, -0.5, 0, scene);
  box(8, 0.06, 400, '#2a2c31', 4, 0.03, 0, scene);
  for (let z = -190; z < 190; z += 7) box(0.25, 0.08, 3, '#a8a8a8', 4, 0.04, z, scene);
  const candles = [];
  for (let i = 0; i < 12; i++) {
    const z = 14 - i * 13, x = i % 2 ? -8 : 17;
    const col = pick(r, ['#c9c2b4', '#a8b0b8', '#d8cfbf', '#8f8a80']);
    const hh = 5 + r() * 2;
    box(8, hh, 7, col, x, hh / 2, z, scene);
    box(9, 0.6, 8, pick(r, ['#3b2f2f', '#2f3540', '#4a3a30']), x, hh + 0.3, z, scene);
    for (const wx of [-2, 2]) {
      const lit = r() < 0.35;
      const m = box(1.4, 1.2, 0.1, lit ? basic('#ffb760') : lam('#141923'), x + wx, hh * 0.55, z + (x < 0 ? 3.55 : -3.55), scene, false);
      if (lit) candles.push({ m, s: r() * 10 });
    }
  }
  const T = new THREE.Group(); T.position.set(-4, 0, -34); scene.add(T);
  const steel = '#8b9099';
  for (const sx of [-1.6, 1.6]) for (const sz of [-1.6, 1.6]) box(0.3, 30, 0.3, steel, sx, 15, sz, T);
  for (let y = 2; y < 30; y += 3) {
    box(3.5, 0.15, 0.15, steel, 0, y, -1.6, T); box(3.5, 0.15, 0.15, steel, 0, y, 1.6, T);
    box(0.15, 0.15, 3.5, steel, -1.6, y, 0, T); box(0.15, 0.15, 3.5, steel, 1.6, y, 0, T);
    const d = box(0.12, 0.12, 4.6, steel, -1.6, y + 1.5, 0, T); d.rotation.x = 0.85;
    const d2 = box(0.12, 0.12, 4.6, steel, 1.6, y + 1.5, 0, T); d2.rotation.x = -0.85;
  }
  box(5, 0.3, 5, '#6f747c', 0, 30, 0, T);
  for (let k = 0; k < 3; k++) {
    const a = k * Math.PI * 2 / 3;
    const p = box(0.7, 3, 0.3, '#e6e6e6', Math.sin(a) * 2.2, 32, Math.cos(a) * 2.2, T); p.rotation.y = a;
  }
  box(0.25, 4, 0.25, steel, 0, 33, 0, T);
  const beacon = box(0.6, 0.6, 0.6, basic('#ff2a2a'), 0, 35.2, 0, T, false);
  const bl = new THREE.PointLight(0xff2020, 80, 20, 2); bl.position.set(0, 35.2, 0); T.add(bl);
  // person with phone
  const P = person(r, { shirt: '#3a5a8a' }); P.position.set(5.5, 0, 6); P.rotation.y = Math.PI + 0.15; scene.add(P);
  P.userData.armR.rotation.x = -1.25; P.userData.armR.rotation.z = 0.35;
  P.userData.armL.rotation.x = -1.1; P.userData.armL.rotation.z = -0.4;
  P.userData.head.rotation.x = 0.35;
  const phoneTex = canvasTex(300, 540, (g) => {
    g.fillStyle = '#0b0f18'; g.fillRect(0, 0, 300, 540);
    g.fillStyle = '#e6e6e6'; g.font = 'bold 24px "BIZ UDPGothic", sans-serif'; g.fillText('圏外', 22, 40);
    g.fillText('12%', 238, 40);
    g.strokeStyle = '#e6e6e6'; g.lineWidth = 2; g.strokeRect(205, 22, 26, 14);
    g.fillStyle = '#ff5a4a'; g.fillRect(207, 24, 4, 10);
    g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.font = 'bold 88px "BIZ UDPGothic", sans-serif'; g.fillText('圏外', 150, 290);
    g.fillStyle = '#9aa3b5'; g.font = 'bold 22px "BIZ UDPGothic", sans-serif';
    g.fillText('ネットワークに', 150, 350); g.fillText('接続できません', 150, 382);
    g.strokeStyle = '#ff5a4a'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(110, 120); g.lineTo(190, 200); g.stroke();
    g.strokeStyle = '#e6e6e6'; g.lineWidth = 6;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(120 + i * 18, 195); g.lineTo(120 + i * 18, 180 - i * 14); g.stroke(); }
  });
  const phone = new THREE.Group(); scene.add(phone);
  box(0.36, 0.66, 0.05, '#101215', 0, 0, 0, phone);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.6), new THREE.MeshBasicMaterial({ map: phoneTex, toneMapped: false }));
  scr.position.z = 0.03; phone.add(scr);
  const phonePos = P.localToWorld(V(0, 1.42, 0.62));
  phone.position.copy(phonePos);
  const eye = P.localToWorld(V(0.05, 1.9, -0.1));
  phone.lookAt(eye);
  const pglow = new THREE.PointLight(0x9fc4ff, 3, 3, 2); pglow.position.copy(P.localToWorld(V(0, 1.6, 0.4))); scene.add(pglow);
  const camA = P.localToWorld(V(0.1, 2.15, -1.25));
  const lookA = phonePos.clone().add(V(0, -0.28, 0));
  const camera = cam(48);
  return {
    scene, camera,
    update(lt) {
      const close = lt < 2.4;
      P.visible = !close;
      const on = lt < 2.6 && Math.sin(lt * Math.PI * 1.6) > 0;
      beacon.material.color.set(on ? '#ff2a2a' : '#2a0c0c'); bl.intensity = on ? 80 : 0;
      for (const c of candles) c.m.material.color.setScalar(0.75 + 0.25 * Math.sin(lt * 9 + c.s));
      if (close) {
        camera.position.copy(vlerp(camA, lookA, 0.06 * ease(lt / 2.4)));
        camera.lookAt(lookA);
      } else {
        const k = ease((lt - 2.4) / 4.6);
        camera.position.copy(vlerp(V(10, 5, 17), V(15, 10, 25), k));
        camera.lookAt(vlerp(V(-2, 13, -34), V(-3, 18, -34), k));
      }
    },
  };
}

// ---------- scene: supermarket ----------
export function buildMarket() {
  const r = rng(55);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9aa3ad');
  const L = lights(scene, { hemi: 1.05, sky: 0xdfe6ef, ground: 0x6a6a66, dir: 2.3, dirColor: 0xfff1dc, dirPos: V(40, 25, 18), shadow: 30, target: V(0, 0, 0) });
  box(44, 0.2, 40, '#d9d6cf', 0, -0.1, 0, scene);
  box(44, 10, 0.4, '#e6e3db', 0, 5, -16, scene);
  box(0.4, 10, 40, '#e6e3db', -20, 5, 0, scene);
  const ceil = box(44, 0.3, 40, '#bdbab3', 0, 10, 0, scene); ceil.castShadow = false;
  for (let x = -14; x <= 14; x += 7) for (let z = -12; z <= 12; z += 6) box(3, 0.1, 0.8, '#8c8c8c', x, 9.8, z, scene, false);
  // windows on right side (light source)
  for (let z = -14; z <= 14; z += 4.5) {
    const w = box(0.1, 6.5, 4, basic('#eaf2ff'), 21.8, 4, z, scene, false); w.castShadow = false;
    const mu = box(0.3, 7, 0.3, '#7a7f86', 21.6, 4, z + 2.25, scene); mu.castShadow = false;
  }
  // shelves
  const PROD = ['#d93b3b', '#e6c03a', '#3a7bd9', '#3aa65a', '#e07a2a', '#d64f9a', '#f2f2f2', '#7a4fd6'];
  for (const [sx, sz] of [[-11, -9], [-11, -3], [-11, 3]]) {
    const g = new THREE.Group(); g.position.set(sx, 0, sz); scene.add(g);
    box(10, 3.8, 0.2, '#cfcfcf', 0, 1.9, 0, g);
    for (const y of [0.3, 1.2, 2.1, 3.0]) {
      for (const side of [-1, 1]) {
        box(10, 0.1, 1.2, '#b9b9b9', 0, y, side * 0.7, g);
        let x = -4.7;
        while (x < 4.6) {
          const w = 0.35 + r() * 0.4;
          if (r() > 0.35) { const h = 0.4 + r() * 0.35; box(w, h, 0.8, pick(r, PROD), x + w / 2, y + 0.05 + h / 2, side * 0.7, g); }
          x += w + 0.08;
        }
      }
    }
  }
  // registers and queue
  const POS = [];
  for (const [i, x] of [[0, 0], [1, 4.5], [2, 9]]) {
    box(1.4, 1.0, 4.4, '#e3e3e3', x, 0.5, 1, scene);
    box(1.1, 0.05, 3.2, '#2a2a2a', x, 1.03, 1.4, scene);
    box(0.1, 0.6, 0.1, '#555', x - 0.4, 1.3, -0.6, scene);
    POS.push(box(0.7, 0.5, 0.08, '#121212', x - 0.4, 1.75, -0.55, scene));
    const cs = person(r, { shirt: '#2f6b4f', longHair: i === 1 }); cs.position.set(x + 1.6, 0, -0.5); cs.rotation.y = -Math.PI / 2; scene.add(cs);
    cs.userData.armR.rotation.x = -0.5;
  }
  const queue = [];
  for (let k = 0; k < 6; k++) {
    const p = person(r, { longHair: r() < 0.4 });
    p.position.set(-1.4 + (r() - 0.5) * 0.3, 0, 4.2 + k * 1.25); p.rotation.y = Math.PI + (r() - 0.5) * 0.4; scene.add(p);
    p.userData.armL.rotation.x = -0.25;
    box(0.55, 0.36, 0.38, '#d94040', 0, -0.85, 0.12, p.userData.armL);
    queue.push(p);
  }
  for (let k = 0; k < 3; k++) {
    const p = person(r); p.position.set(3.2 + (r() - 0.5), 0, 5 + k * 1.3); p.rotation.y = Math.PI; scene.add(p);
  }
  // sign
  const sign = new THREE.Group(); sign.position.set(-4.8, 0, 9.5); sign.rotation.y = 0.35; scene.add(sign);
  box(0.12, 1.2, 0.12, '#444', -0.7, 0.6, 0, sign); box(0.12, 1.2, 0.12, '#444', 0.7, 0.6, 0, sign);
  box(1.9, 2.4, 0.1, '#3a3a3a', 0, 2.2, 0, sign);
  const stex = canvasTex(380, 480, (g) => {
    g.fillStyle = '#fbfbf7'; g.fillRect(0, 0, 380, 480);
    g.textAlign = 'center';
    g.fillStyle = '#d02a2a'; g.font = 'bold 54px "BIZ UDPGothic", sans-serif'; g.fillText('停電中', 190, 80);
    g.fillStyle = '#111'; g.font = 'bold 96px "BIZ UDPGothic", sans-serif'; g.fillText('現金', 190, 220); g.fillText('のみ', 190, 330);
    g.fillStyle = '#333'; g.font = 'bold 26px "BIZ UDPGothic", sans-serif';
    g.fillText('カード・電子マネー', 190, 400); g.fillText('QR決済は使えません', 190, 440);
  });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.3), new THREE.MeshLambertMaterial({ map: stex }));
  sp.position.set(0, 2.2, 0.06); sign.add(sp);
  const camera = cam(48);
  return {
    scene, camera,
    update(lt) {
      queue.forEach((p, i) => { p.userData.head.rotation.y = Math.sin(lt * 0.7 + i) * 0.25; });
      const k = ease((lt - 2.0) / 5);
      camera.position.copy(vlerp(V(-2.6, 2.8, 16.3), V(4.5, 5.2, 16.5), k));
      camera.lookAt(vlerp(V(-4.6, 1.05, 9.5), V(0.5, 1.4, 2), ease((lt - 2.0) / 4.5)));
    },
  };
}

// ---------- scene: hospital ----------
export function buildHospital() {
  const r = rng(66);
  const scene = new THREE.Scene();
  scene.background = gradBg([[0, '#03060f'], [0.6, '#0a1430'], [1, '#18264a']]);
  scene.fog = new THREE.Fog(0x0c1632, 50, 220);
  lights(scene, { hemi: 1.9, dir: 2.0, shadow: 45, dirPos: V(-30, 60, 35) });
  box(400, 1, 400, '#22252b', 0, -0.5, 0, scene);
  for (let x = -20; x <= 20; x += 4) box(0.15, 0.04, 5, '#9a9a9a', x, 0.02, 12, scene);
  const H = building(r, 40, 22, 14, 0.1, '#c9ccd2');
  H.position.set(0, 11, -16); H.castShadow = H.receiveShadow = true; scene.add(H);
  H.userData.mat.emissiveIntensity = 0.9;
  box(14, 4, 10, '#c3c6cc', -26, 2, -10, scene);
  const crossM = basic('#ff3434');
  box(3.2, 1, 0.5, crossM, 0, 24.5, -9, scene, false); box(1, 3.2, 0.5, crossM, 0, 24.5, -9, scene, false);
  box(12, 0.4, 6, '#dcdcdc', -8, 4.4, -6, scene);
  for (const x of [-13.5, -2.5]) box(0.4, 4.4, 0.4, '#aaa', x, 2.2, -3.2, scene);
  const er = canvasTex(320, 80, (g) => { g.fillStyle = '#c62828'; g.fillRect(0, 0, 320, 80); g.fillStyle = '#fff'; g.font = 'bold 50px "BIZ UDPGothic", sans-serif'; g.textAlign = 'center'; g.fillText('救急入口', 160, 60); });
  const erP = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshBasicMaterial({ map: er, toneMapped: false }));
  erP.position.set(-8, 4.95, -2.95); scene.add(erP);
  const door = new THREE.PointLight(0xffd9a0, 60, 14, 2); door.position.set(-8, 3, -6); scene.add(door);
  box(3.6, 3, 0.1, basic('#ffe3b0'), -8, 1.5, -8.95, scene, false);
  // generator + smoke
  box(5, 2.6, 2.8, '#8f959c', 14, 1.3, -4, scene);
  for (let k = 0; k < 4; k++) box(0.08, 1.6, 2.0, '#5a5f66', 11.8 + k * 0.6, 1.4, -2.55, scene);
  box(0.5, 3, 0.5, '#4a4d52', 15.5, 4, -4, scene);
  const smoke = [];
  for (let k = 0; k < 16; k++) {
    const m = new THREE.Mesh(BOX, new THREE.MeshLambertMaterial({ color: '#8d9099', transparent: true, opacity: 0.5, depthWrite: false }));
    scene.add(m); smoke.push({ m, s: k / 16 });
  }
  // fuel tank + gauge
  box(4, 2.4, 2.2, '#b24a3a', 18.5, 1.2, 3.5, scene);
  const gauge = canvasTex(400, 200, (g) => {
    g.fillStyle = '#11151c'; g.fillRect(0, 0, 400, 200);
    g.fillStyle = '#e6e6e6'; g.font = 'bold 40px "BIZ UDPGothic", sans-serif'; g.fillText('燃料残量', 24, 58);
    g.fillStyle = '#ff4b3a'; g.textAlign = 'right'; g.font = 'bold 56px "BIZ UDPGothic", sans-serif'; g.fillText('12%', 378, 62);
    g.fillStyle = '#2b3240'; g.fillRect(24, 100, 352, 64);
    g.fillStyle = '#ff4b3a'; g.fillRect(24, 100, 352 * 0.12, 64);
    g.strokeStyle = '#e6e6e6'; g.lineWidth = 3; g.strokeRect(24, 100, 352, 64);
  });
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ map: gauge, toneMapped: false }));
  gp.position.set(18.5, 1.4, 4.62); scene.add(gp);
  // ambulance
  const amb = new THREE.Group(); amb.position.set(-7, 0, 4); amb.rotation.y = 0.5; scene.add(amb);
  box(2.4, 2.4, 5.2, '#f2f2f2', 0, 1.6, -0.6, amb);
  box(2.4, 1.5, 1.6, '#f2f2f2', 0, 1.15, 2.6, amb);
  box(2.2, 0.7, 0.1, '#1a2230', 0, 1.55, 3.42, amb, false);
  box(2.42, 0.3, 6.82, '#d23a3a', 0, 1.3, 0.2, amb);
  for (const sx of [-1, 1]) for (const sz of [-2.2, 2.4]) box(0.3, 0.7, 0.75, '#111', sx * 1.1, 0.35, sz, amb);
  const bar = box(1.4, 0.3, 0.5, basic('#ff2020'), 0, 2.95, 1.6, amb, false);
  const red = new THREE.PointLight(0xff1a1a, 0, 22, 1.6); red.position.set(0, 3.4, 1.6); amb.add(red);
  const camera = cam(50);
  return {
    scene, camera,
    update(lt) {
      const on = Math.sin(lt * Math.PI * 2.4) > 0;
      bar.material.color.set(on ? '#ff2020' : '#3a0808'); red.intensity = on ? 160 : 0;
      for (const s of smoke) {
        const p = (lt * 0.22 + s.s) % 1;
        s.m.position.set(15.5 + p * 4 + Math.sin(p * 9 + s.s * 20) * 0.6, 5.6 + p * 9, -4 - p * 1.5);
        const sc = 0.5 + p * 1.8; s.m.scale.set(sc, sc, sc); s.m.material.opacity = 0.45 * (1 - p);
      }
      const k = ease((lt - 1.8) / 5.2);
      camera.position.copy(vlerp(V(17.6, 2.6, 9.6), V(10, 9, 36), k));
      camera.lookAt(vlerp(V(18.3, 0.95, 4), V(-2, 9, -12), ease((lt - 1.8) / 4.6)));
    },
  };
}

// ---------- scene: night sky ----------
export function buildSky() {
  const r = rng(77);
  const scene = new THREE.Scene();
  scene.background = gradBg([[0, '#010309'], [0.6, '#040916'], [1, '#0a1428']]);
  lights(scene, { hemi: 2.2, dir: 1.6, sky: 0x5866a0 });
  for (let i = 0; i < 160; i++) {
    const x = -260 + r() * 520, z = -60 - r() * 380, w = 10 + r() * 18, h = 10 + r() * 60;
    box(w, h, w, '#0b111d', x, h / 2 - 8, z, scene, false);
  }
  box(30, 0.6, 22, '#363b45', 0, -0.3, -2, scene, false);
  for (let x = -14; x <= 14; x += 2) box(0.12, 1.1, 0.12, '#565b66', x, 0.55, -12.8, scene, false);
  box(28.2, 0.12, 0.12, '#565b66', 0, 1.1, -12.8, scene, false);
  const ppl = [];
  [[-2.4, -6, -0.2], [0.6, -5.2, 0.15], [2.9, -7, 0.4]].forEach(([x, z, ry], i) => {
    const p = person(r, { longHair: i === 1 }); p.position.set(x, 0, z); p.rotation.y = Math.PI + ry; scene.add(p);
    p.userData.head.rotation.x = -0.75; ppl.push(p);
  });
  const D = V(-8, 58, -29.5).normalize();
  const U = V(-0.8, 0.1, -0.6).normalize();
  const Vv = D.clone().addScaledVector(U, -D.dot(U)).normalize();
  const N = new THREE.Vector3().crossVectors(U, Vv).normalize();
  const band = { U, V: Vv, N, w: 0.07 };
  scene.add(starField(r, 3500, 1500, 2.2, 1.0));
  scene.add(starField(r, 6000, 1500, 1.4, 0.55));
  scene.add(starField(r, 32000, 1500, 1.5, 0.62, { ...band, w: 0.09 }));
  scene.add(starField(r, 12000, 1500, 8, 0.04, { ...band, w: 0.13 }));
  scene.add(starField(r, 6000, 1500, 12, 0.03, { ...band, w: 0.05 }));
  const camera = cam(58);
  return {
    scene, camera,
    update(lt) {
      camera.position.set(0, 1.9 + lt * 0.05, 5.5);
      const k = ease((lt - 1.9) / 4.8);
      camera.lookAt(vlerp(V(0, 1.5, -20), V(-8, 60, -24), k));
    },
  };
}

