// Shared engine for "もしも" low-poly simulation reels.
import * as THREE from 'three';
export { THREE };
export const W = 1080, H = 1920;
export const GOLD = '#f3c24f';
export const CFG = { T_B: 5.0, SS: parseFloat(new URLSearchParams(location.search).get('ss') || '1.5') };

export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W * CFG.SS, H * CFG.SS, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const out = document.getElementById('out');
const ctx = out.getContext('2d');
// ---------- utils ----------
export function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const vlerp = (a, b, k) => a.clone().lerp(b, k);
export const pick = (r, a) => a[Math.floor(r() * a.length)];

export const BOX = new THREE.BoxGeometry(1, 1, 1);
export const matCache = new Map();
export function lam(color) {
  if (!matCache.has(color)) matCache.set(color, new THREE.MeshLambertMaterial({ color }));
  return matCache.get(color);
}
export function basic(color) { return new THREE.MeshBasicMaterial({ color, toneMapped: false }); }
export function box(w, h, d, material, x = 0, y = 0, z = 0, parent = null, shadow = true) {
  const m = new THREE.Mesh(BOX, typeof material === 'string' ? lam(material) : material);
  m.scale.set(w, h, d); m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = shadow;
  if (parent) parent.add(m);
  return m;
}
export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
export function gradBg(stops) {
  return canvasTex(4, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    stops.forEach(([p, c]) => gr.addColorStop(p, c));
    g.fillStyle = gr; g.fillRect(0, 0, 4, 512);
  });
}
export function signTex(w, h, draw) { return canvasTex(w, h, draw); }

// ---------- props ----------
export const SKIN = ['#f1c9a5', '#e6b892', '#d39f78'];
export const HAIR = ['#1b1b1b', '#2b1d14', '#3a2a1e', '#4a3a2c'];
export const SHIRT = ['#e9edf2', '#3a5a8a', '#2f3b4c', '#8a3b3b', '#4f6b4a', '#d9c8a8', '#6b4f7a', '#c46a8a', '#e0e0e0', '#5b6b7b'];
export const PANTS = ['#2a2f3a', '#1f2430', '#4a3a2a', '#3c4a5c', '#2b2b2b'];
export function person(r, o = {}) {
  const g = new THREE.Group();
  const skin = o.skin || pick(r, SKIN), hair = o.hair || pick(r, HAIR);
  const shirt = o.shirt || pick(r, SHIRT), pants = o.pants || pick(r, PANTS);
  const mkLeg = (x) => {
    const l = new THREE.Group(); l.position.set(x, 0.8, 0); g.add(l);
    box(0.22, 0.8, 0.26, pants, 0, -0.4, 0, l);
    box(0.24, 0.1, 0.32, '#1a1a1a', 0, -0.75, 0.03, l);
    return l;
  };
  const legL = mkLeg(-0.13), legR = mkLeg(0.13);
  box(0.56, 0.72, 0.32, shirt, 0, 1.16, 0, g);
  if (o.vest) box(0.6, 0.5, 0.36, o.vest, 0, 1.2, 0, g);
  const mkArm = (x) => {
    const a = new THREE.Group(); a.position.set(x, 1.48, 0); g.add(a);
    box(0.17, 0.66, 0.2, shirt, 0, -0.31, 0, a);
    box(0.15, 0.13, 0.17, skin, 0, -0.69, 0, a);
    return a;
  };
  const armL = mkArm(-0.37), armR = mkArm(0.37);
  const head = new THREE.Group(); head.position.set(0, 1.53, 0); g.add(head);
  box(0.4, 0.4, 0.38, skin, 0, 0.2, 0, head);
  box(0.43, 0.13, 0.41, hair, 0, 0.43, 0, head);
  box(0.43, 0.32, 0.1, hair, 0, 0.27, -0.17, head);
  if (o.longHair) box(0.43, 0.5, 0.14, hair, 0, 0.05, -0.18, head);
  box(0.06, 0.06, 0.02, '#151515', -0.09, 0.22, 0.195, head, false);
  box(0.06, 0.06, 0.02, '#151515', 0.09, 0.22, 0.195, head, false);
  if (o.cap) { box(0.45, 0.13, 0.45, o.cap, 0, 0.46, 0, head); box(0.34, 0.04, 0.18, o.cap, 0, 0.41, 0.28, head); }
  g.userData = { armL, armR, head, legL, legR };
  return g;
}

export const CARC = ['#d8d8d8', '#2b2f36', '#9a2a2a', '#2f4f7a', '#e6e2d6', '#3d5a3d', '#c9b03a', '#f0f0f0', '#5a5f66'];
export const HEAD = basic('#fff3d6'), TAIL = basic('#ff2a2a'), TAILDIM = basic('#5a1414');
export function car(r, color, lights = true) {
  const g = new THREE.Group();
  color = color || pick(r, CARC);
  box(1.9, 0.62, 4.3, color, 0, 0.64, 0, g);
  box(1.66, 0.56, 2.3, color, 0, 1.22, -0.25, g);
  box(1.7, 0.4, 2.0, '#1a2230', 0, 1.24, -0.25, g, false);
  box(1.5, 0.42, 0.06, '#1a2230', 0, 1.24, 0.92, g, false);
  for (const sx of [-1, 1]) for (const sz of [-1.35, 1.35]) box(0.3, 0.6, 0.66, '#111', sx * 0.86, 0.3, sz, g);
  box(0.42, 0.17, 0.06, lights ? HEAD : lam('#bbb'), -0.6, 0.76, 2.16, g, false);
  box(0.42, 0.17, 0.06, lights ? HEAD : lam('#bbb'), 0.6, 0.76, 2.16, g, false);
  box(0.42, 0.15, 0.06, lights ? TAIL : TAILDIM, -0.62, 0.78, -2.16, g, false);
  box(0.42, 0.15, 0.06, lights ? TAIL : TAILDIM, 0.62, 0.78, -2.16, g, false);
  return g;
}

export const WARM = ['#ffd27a', '#ffe1a6', '#ffefc8', '#cfe2ff', '#ffd9a0'];
export const FACADE = ['#2b3140', '#323848', '#2a2f3a', '#3a3f4c', '#303644', '#3b3a42'];
export function building(r, w, h, d, lit, facade, win = '#121721') {
  const cols = Math.max(2, Math.round(w / 2.2)), rows = Math.max(3, Math.round(h / 3.2));
  const cw = 8, ch = 10;
  const fc = facade || pick(r, FACADE);
  const litCells = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) litCells.push(r() < lit ? pick(r, WARM) : null);
  const base = canvasTex(cols * cw, rows * ch, (g) => {
    g.fillStyle = fc; g.fillRect(0, 0, cols * cw, rows * ch);
    g.fillStyle = win;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) g.fillRect(i * cw + 1.5, j * ch + 2, cw - 3, ch - 4);
  });
  const em = canvasTex(cols * cw, rows * ch, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, cols * cw, rows * ch);
    let k = 0;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const c = litCells[k++]; if (!c) continue;
      g.fillStyle = c; g.fillRect(i * cw + 1.5, j * ch + 2, cw - 3, ch - 4);
    }
  });
  const side = new THREE.MeshLambertMaterial({ map: base, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 1 });
  const top = lam('#23262e');
  const m = new THREE.Mesh(BOX, [side, side, top, top, side, side]);
  m.scale.set(w, h, d); m.position.y = h / 2;
  m.userData.mat = side;
  return m;
}

export function starField(r, n, radius, size, bright = 1, band = null) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    if (band) {
      const a = lerp(-0.25, Math.PI + 0.25, r());
      const g = (r() + r() + r() + r() - 2) * band.w;
      tmp.copy(band.U).multiplyScalar(Math.cos(a)).addScaledVector(band.V, Math.sin(a)).addScaledVector(band.N, g).normalize();
    } else {
      const th = r() * Math.PI * 2, y = Math.pow(r(), 0.8) * 1.05 - 0.05;
      const s = Math.sqrt(Math.max(0, 1 - y * y));
      tmp.set(Math.cos(th) * s, y, Math.sin(th) * s);
    }
    pos.set([tmp.x * radius, tmp.y * radius, tmp.z * radius], i * 3);
    const b = bright * (0.25 + 0.75 * Math.pow(r(), 2.2));
    const tint = r();
    const c = tint < 0.2 ? [0.8, 0.88, 1] : tint < 0.35 ? [1, 0.92, 0.8] : [1, 1, 1];
    col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: size * CFG.SS, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 1,
    depthWrite: false, fog: false, blending: THREE.AdditiveBlending, toneMapped: false });
  return new THREE.Points(geo, mat);
}

export function lights(scene, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky ?? 0x7a88c8, o.ground ?? 0x14141c, o.hemi ?? 1.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(o.dirColor ?? 0xaabbf0, o.dir ?? 2.0);
  dir.position.copy(o.dirPos ?? V(-40, 80, 30));
  if (o.shadow) {
    dir.castShadow = true; dir.shadow.mapSize.set(2048, 2048);
    const s = o.shadow; Object.assign(dir.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 400 });
    dir.shadow.bias = -0.0005;
    if (o.target) { dir.target.position.copy(o.target); scene.add(dir.target); }
  }
  scene.add(dir);
  return { hemi, dir };
}

export const cam = (fov = 50) => new THREE.PerspectiveCamera(fov, W / H, 0.1, 3000);

// ---------- animation helpers ----------
export function walk(p, t, speed = 1, amp = 0.55) {
  const s = Math.sin(t * 7 * speed + (p.userData.ph ??= Math.random() * 6));
  p.userData.legL.rotation.x = s * amp; p.userData.legR.rotation.x = -s * amp;
  p.userData.armL.rotation.x = -s * amp * 0.7; p.userData.armR.rotation.x = s * amp * 0.7;
}
export function sit(p, floorY = 0) {
  p.userData.legL.rotation.x = p.userData.legR.rotation.x = -Math.PI / 2;
  p.position.y = floorY - 0.66;
}
export const TIMES = {
  morning: { bg: [[0, '#79b3ea'], [0.6, '#b9daf3'], [1, '#f2e5cd']], fog: 0xd6e3ee, hemi: 2.1, sky: 0xd2e5ff, ground: 0x8a8576, sun: 3.3, sunColor: 0xfff0d6, sunPos: [-40, 55, 35], em: 0.08, lamps: false },
  noon: { bg: [[0, '#5ea3e6'], [0.7, '#a9d2f2'], [1, '#e2eef7']], fog: 0xcfe0ee, hemi: 2.2, sky: 0xd8e8ff, ground: 0x8a8576, sun: 3.6, sunColor: 0xffffff, sunPos: [-20, 80, 25], em: 0.06, lamps: false },
  storm: { bg: [[0, '#454f5c'], [0.6, '#8a949f'], [1, '#c2c7cc']], fog: 0x9aa3ad, hemi: 2.0, sky: 0xc9d2dc, ground: 0x7a7468, sun: 2.3, sunColor: 0xe8eef5, sunPos: [-20, 80, 25], em: 0.12, lamps: false },
  evening: { bg: [[0, '#3b4f8a'], [0.55, '#d98a6a'], [1, '#f5c27a']], fog: 0xd9a487, hemi: 1.7, sky: 0xffd2b0, ground: 0x5a4a44, sun: 2.9, sunColor: 0xffb070, sunPos: [-60, 20, 10], em: 0.4, lamps: false },
  night: { bg: [[0, '#03060f'], [0.6, '#0a1430'], [1, '#16244a']], fog: 0x0b1530, hemi: 1.7, sky: 0x6a7ab8, ground: 0x14141c, sun: 1.7, sunColor: 0xaabbf0, sunPos: [-30, 60, 25], em: 1.0, lamps: true },
};
export function sceneFor(timeKey, shadow = 45) {
  const T = TIMES[timeKey];
  const scene = new THREE.Scene();
  scene.background = gradBg(T.bg);
  scene.fog = new THREE.Fog(T.fog, 70, 300);
  const L = lights(scene, { hemi: T.hemi, sky: T.sky, ground: T.ground, dir: T.sun, dirColor: T.sunColor, dirPos: V(...T.sunPos), shadow });
  return { scene, T, L };
}
// camera keyframes: {p0,p1,l0,l1,hold,dur}
// c.pov = true | {walk: steps/s (0 = standing), bob, fov, label, blink} -> protagonist's-eye view:
//   p0/p1 = eye position (about 1.55 for an adult), head bob + breathing, wider fov; core draws blink/vignette/label
export function applyCam(camera, c, lt, dur) {
  const k = ease((lt - (c.hold || 0)) / ((c.dur || dur) - (c.hold || 0)));
  camera.position.copy(vlerp(V(...c.p0), V(...(c.p1 || c.p0)), k));
  const look = vlerp(V(...c.l0), V(...(c.l1 || c.l0)), k);
  if (camera.userData.fov0 === undefined) camera.userData.fov0 = camera.fov;
  let fov = camera.userData.fov0;
  if (c.pov) {
    const pv = c.pov === true ? {} : c.pov, f = pv.walk ?? 1.8, b = pv.bob ?? 0.055;
    const ph = lt * f * Math.PI;
    camera.position.y += f ? (Math.abs(Math.sin(ph)) - 0.6) * b * 2 : Math.sin(lt * 1.6) * 0.012;
    camera.position.x += f ? Math.sin(ph / 2) * b * 0.7 : 0;
    look.y += Math.sin(lt * 1.3) * 0.05;
    fov = pv.fov ?? 68;
  }
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  camera.lookAt(look);
}
// object bursts into cubes at dt=0
export function vanisher(scene, obj, colors, n = 280, seed = 5, k = 1) {
  obj.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(obj), c = bb.getCenter(V(0, 0, 0)), r = rng(seed);
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
  const P = [], col = new THREE.Color(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    const p = V(lerp(bb.min.x, bb.max.x, r()), lerp(bb.min.y, bb.max.y, r()), lerp(bb.min.z, bb.max.z, r()));
    const v = p.clone().sub(c).normalize().multiplyScalar((2 + r() * 5) * k).add(V(0, (3 + r() * 6) * k, 0));
    P.push({ p, v, s: (0.25 + r() * 0.45) * k, w: V(r() * 6, r() * 6, r() * 6) });
    im.setColorAt(i, col.set(pick(r, colors)));
  }
  im.visible = false; scene.add(im);
  return (dt) => {
    obj.visible = dt < 0;
    im.visible = dt >= 0 && dt < 1.8;
    if (!im.visible) return;
    P.forEach((o, i) => {
      const pos = o.p.clone().addScaledVector(o.v, dt).add(V(0, -2.5 * dt * dt * k, 0));
      const s = o.s * Math.max(0, 1 - dt / 1.8);
      m.compose(pos, q.setFromEuler(e.set(o.w.x * dt, o.w.y * dt, o.w.z * dt)), V(s, s, s));
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  };
}

// ---------- overlay (Instagram safe zone: top 250px, bottom 420px, right buttons x>950) ----------
export const SERIF = (s) => `600 ${s}px "Yu Mincho","YuMincho","Noto Serif CJK JP","Noto Serif JP",serif`;
export const GOTH = (s) => `700 ${s}px "BIZ UDPGothic","Yu Gothic","Noto Sans CJK JP","Meiryo",sans-serif`;
const LAY = { titleY: 318, labelY: 398, numY: 510, locY: 560, capX: 492, capW: 820, capY: 1150, subY: 1214, goldY: 1372,
  hook1: 500, hook2: 660, hookSub: 738, hookLabel: 850, hookNum: 965 };
function txt(str, x, y, font, color, align = 'left', alpha = 1, stroke = 0) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.strokeText(str, x, y); }
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 2;
  ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}
function rich(parts, cx, y, font, alpha, stroke = 0) {
  ctx.font = font;
  const ws = parts.map(p => ctx.measureText(p[0]).width);
  let x = cx - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, i) => { txt(p[0], x, y, font, p[1], 'left', alpha, stroke); x += ws[i]; });
}
function fit(str, maxW, size, fn) {
  ctx.font = fn(size);
  while (ctx.measureText(str).width > maxW && size > 18) { size -= 2; ctx.font = fn(size); }
  return fn(size);
}
function shade(hook) {
  const h1 = hook ? 1080 : 700;
  let g = ctx.createLinearGradient(0, 0, 0, h1);
  g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, h1);
  g = ctx.createLinearGradient(0, 1030, 0, 1470);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,0.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 1030, W, 440);
}
function counter(label, num, unit, loc, a, dy = 0, big = 112) {
  txt(label, 70, LAY.labelY + dy, GOTH(28), '#ffffff', 'left', a);
  ctx.font = SERIF(big); const nw = ctx.measureText(num).width;
  txt(num, 64, LAY.numY + dy, SERIF(big), '#ffffff', 'left', a);
  txt(unit, 70 + nw, LAY.numY + dy, SERIF(42), '#ffffff', 'left', a);
  if (loc) txt(loc, 70, LAY.locY + dy, GOTH(30), GOLD, 'left', a);
}
const outBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
// manga-style stamp text: {t, text, x, y, rot, size, color, dur}
function stamps(shot, lt) {
  for (const st of shot.stamps || []) {
    const t = lt - st.t, dur = st.dur ?? 2.0;
    if (t < 0 || t > dur) continue;
    const sc = t < 0.28 ? 0.2 + 0.8 * outBack(t / 0.28) : 1, a = clamp((dur - t) / 0.25);
    const jit = t < 0.35 ? (1 - t / 0.35) * 14 : 0;
    const x = (st.x ?? 470) + Math.sin(t * 97) * jit, y = (st.y ?? 820) + Math.cos(t * 83) * jit;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(((st.rot ?? -8) * Math.PI) / 180); ctx.scale(sc, sc);
    ctx.font = GOTH(st.size ?? 128); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 30; ctx.strokeStyle = '#ffffff'; ctx.strokeText(st.text, 0, 0);
    ctx.lineWidth = 12; ctx.strokeStyle = '#111111'; ctx.strokeText(st.text, 0, 0);
    ctx.fillStyle = st.color ?? '#ff3b30'; ctx.fillText(st.text, 0, 0);
    ctx.restore();
  }
}
// manga focus lines during [t0, t1]
function focusLines(shot, lt) {
  for (const [t0, t1] of shot.lines || []) {
    if (lt < t0 || lt > t1) continue;
    const r = rng(Math.floor(lt * 14) + 7), cx = W / 2, cy = 900;
    ctx.save(); ctx.globalAlpha = 0.55 * clamp((lt - t0) / 0.15) * clamp((t1 - lt) / 0.2); ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, w = 0.004 + r() * 0.01, r0 = 420 + r() * 260, r1 = 1500;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1); ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1); ctx.fill();
    }
    ctx.restore();
  }
}
function shakeAmt(shot, lt) {
  let s = 0;
  for (const [t, amp, dur] of shot.shake || []) if (lt >= t && lt < t + dur) s = Math.max(s, amp * (1 - (lt - t) / dur));
  return s;
}
function caption(shot, lt) {
  const a = clamp((lt - (shot.capAt ?? 0.5)) / 0.4);
  if (a <= 0) return;
  const dy = CFG.comic ? 0 : (1 - ease(a)) * 14;
  if (CFG.comic) {
    const t = (lt - (shot.capAt ?? 0.5)) / 0.32, sc = t < 1 ? 0.3 + 0.7 * outBack(clamp(t)) : 1;
    const rot = 0.07 * Math.sin(t * 11) * Math.max(0, 1 - t / 1.6);
    ctx.save(); ctx.translate(LAY.capX, LAY.capY - 22); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-LAY.capX, -LAY.capY + 22);
    txt(shot.cap, LAY.capX, LAY.capY, fit(shot.cap, LAY.capW, 70, GOTH), '#ffffff', 'center', 1, 12);
    ctx.restore();
  } else txt(shot.cap, LAY.capX, LAY.capY + dy, fit(shot.cap, LAY.capW, 66, GOTH), '#ffffff', 'center', a, 7);
  (shot.sub || []).forEach((s, i) => txt(s, LAY.capX, LAY.subY + i * 46 + dy, fit(s, LAY.capW, 32, GOTH), '#f2f2f2', 'center', a, 4));
  if (shot.gold) {
    const g = clamp((lt - shot.goldAt) / 0.6);
    txt(shot.gold, LAY.capX, LAY.goldY + (1 - ease(g)) * 10, fit(shot.gold, LAY.capW, 46, GOTH), GOLD, 'center', g, 6);
  }
}

// ---------- runner ----------
export function run(EP) {
  CFG.T_B = EP.T_B; CFG.comic = !!EP.comic;
  const TITLE = [['もしも', '#ffffff'], [EP.word, GOLD], [EP.tail, '#ffffff']];
  const DURATION = EP.shots[EP.shots.length - 1].e;
  const outroStars = (() => { const r = rng(99); return Array.from({ length: 420 }, () => [r() * W, r() * H, 0.6 + r() * 1.8, 0.2 + r() * 0.8]); })();
  let SC = null;
  // EP.clock(gt) -> seconds left: one live countdown from the hook to the end (shots without num use it)
  const clk = (gt) => Math.max(0, EP.clock(gt)).toFixed(2);
  function overlay(shot, lt, gt) {
    const T_B = EP.T_B;
    if (shot.hook) {
      const ia = 1 - clamp((gt - T_B) / 0.45);
      shade(ia > 0.5);
      if (ia > 0) {
        const pk = 1 + 0.22 * (1 - ease(gt / 0.32));
        ctx.save(); ctx.translate(W / 2, LAY.hook1); ctx.scale(pk, pk); ctx.translate(-W / 2, -LAY.hook1);
        rich([['もしも', '#ffffff'], [EP.word, GOLD], [EP.hookTail1, '#ffffff']], W / 2, LAY.hook1, fit('もしも' + EP.word + EP.hookTail1, 980, 136, SERIF), ia, 8);
        rich([[EP.hookTail2, '#ffffff']], W / 2, LAY.hook2, fit(EP.hookTail2, 980, 136, SERIF), ia, 8);
        ctx.restore();
        txt(EP.hookSub, W / 2, LAY.hookSub, GOTH(36), '#ffffff', 'center', ia, 5);
        counter(EP.countdownLabel, EP.clock ? clk(gt) : Math.max(0, T_B - gt).toFixed(2), '秒', null, ia, LAY.hookLabel - LAY.labelY, 124);
      }
      const ma = clamp((gt - T_B - 0.3) / 0.45);
      if (ma > 0) {
        rich(TITLE, W / 2, LAY.titleY, fit(TITLE.map(p => p[0]).join(''), 960, 58, SERIF), ma, 4);
        counter(EP.label, EP.clock ? clk(gt) : (gt - T_B).toFixed(2), '秒', shot.loc, ma);
        caption(shot, lt);
      }
      focusLines(shot, lt); stamps(shot, lt);
      if (gt >= T_B && gt < T_B + 0.3) { ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - (gt - T_B) / 0.3)})`; ctx.fillRect(0, 0, W, H); }
      return;
    }
    if (shot.dark) { ctx.fillStyle = `rgba(0,0,0,${clamp((lt - shot.dark[0]) / 0.5) * shot.dark[1]})`; ctx.fillRect(0, 0, W, H); }
    shade(false);
    rich(TITLE, W / 2, LAY.titleY, fit(TITLE.map(p => p[0]).join(''), 960, 58, SERIF), 1, 4);
    if (!shot.noCounter) {
      if (EP.clock && shot.num === undefined) counter(EP.label, clk(gt), '秒', shot.loc, 1);
      else counter(EP.label, shot.num, shot.unit, shot.loc, 1);
    }
    focusLines(shot, lt); caption(shot, lt); stamps(shot, lt);
  }
  // protagonist's-eye overlay: eyelids open at shot start, vignette, small "〇〇の目線" tag under the counter
  function povFx(pv, lt) {
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.45, H * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (pv.blink !== false) {
      const o = ease(lt / 0.45), lid = (1 - o) * H * 0.52;
      if (lid > 1) {
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, lid * 0.8); ctx.quadraticCurveTo(W / 2, lid * 1.25, 0, lid * 0.8); ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, H - lid * 0.8); ctx.quadraticCurveTo(W / 2, H - lid * 1.25, 0, H - lid * 0.8); ctx.fill();
      }
    }
    txt('◉ ' + (pv.label || '主人公の目線'), 70, LAY.locY + 58, GOTH(30), '#ffffff', 'left', clamp((lt - 0.3) / 0.4), 5);
  }
  function drawOutro(lt) {
    ctx.fillStyle = '#0a0f1d'; ctx.fillRect(0, 0, W, H);
    for (const [x, y, s, a] of outroStars) { ctx.globalAlpha = a * (0.7 + 0.3 * Math.sin(lt * 2 + x)); ctx.fillStyle = '#dfe6ff'; ctx.fillRect(x, y, s, s); }
    ctx.globalAlpha = 1;
    const a = clamp((lt - 0.3) / 0.6);
    txt('次はどんな', W / 2, 860, SERIF(84), '#e8e8e8', 'center', a);
    rich([['「', '#e8e8e8'], ['もしも', GOLD], ['」を見たい？', '#e8e8e8']], W / 2, 990, SERIF(84), a);
    txt('コメントで教えて', W / 2, 1090, GOTH(36), '#d0d0d0', 'center', clamp((lt - 1.1) / 0.6));
  }
  function renderAt(gt, clean = false) {
    gt = Math.min(gt, DURATION - 1e-3);
    const shot = EP.shots.find(s => gt >= s.s && gt < s.e);
    const lt = gt - shot.s;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (shot.sc === 'outro') drawOutro(lt);
    else {
      const S = SC[shot.sc];
      if (shot.fn) S[shot.fn](lt, gt, shot); else S.update(lt, gt, shot);
      if (shot.cam) applyCam(S.camera, shot.cam, lt, shot.e - shot.s);
      const sh = shakeAmt(shot, lt);
      if (sh) S.camera.position.add(V(Math.sin(lt * 91) * sh, Math.cos(lt * 73) * sh * 0.7, Math.sin(lt * 57) * sh * 0.4));
      renderer.render(S.scene, S.camera);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(renderer.domElement, 0, 0, W, H);
      if (!clean && shot.cam && shot.cam.pov) povFx(shot.cam.pov === true ? {} : shot.cam.pov, lt);
      if (!clean) overlay(shot, lt, gt);
    }
    let fade = 0;
    if (shot.s > 0) fade = Math.max(fade, 1 - clamp(lt / 0.22));
    if (shot.e < DURATION) fade = Math.max(fade, 1 - clamp((shot.e - gt) / 0.22));
    fade = Math.max(fade, 1 - clamp((DURATION - gt) / 0.8));
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  }
  (async () => {
    await Promise.all([document.fonts.load(SERIF(60), 'もしも' + EP.word), document.fonts.load(GOTH(60), EP.word)]);
    SC = {};
    for (const [k, fn] of Object.entries(EP.scenes)) SC[k] = fn();
    for (const s of EP.shots) if (s.sc !== 'outro') renderAt(s.s + 0.5);
    const gl = renderer.getContext(); const ext = gl.getExtension('WEBGL_debug_renderer_info');
    window.GPU = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
    window.META = { duration: DURATION, cues: EP.cues || [], T_B: EP.T_B, music: EP.music || {} };
    window.frameAt = (t, q = 0.95, clean = false) => { renderAt(t, clean); return out.toDataURL('image/jpeg', q); };
    window.READY = true;
    const qs = new URLSearchParams(location.search);
    if (qs.has('t')) renderAt(parseFloat(qs.get('t')));
  })().catch(e => { window.ERR = String(e && e.stack || e); console.error(e); });
}
