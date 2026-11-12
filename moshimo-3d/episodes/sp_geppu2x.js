// sp_geppu2x (pop スタイル・特別編 / ローカル制作・未投稿): もしもゲップが毎回2倍強くなったら？
// 題材と「回数が進むほど大ごとになる」型だけ参考にし、台本・数字・ネタ・キャラ(もしもくん／地球くん)は自作。
// 前提: 1回目 = 60dB(距離1m・1秒・全方向) → 音響パワー 4π×10⁻⁶W ≒ 1.26×10⁻⁵J。毎回エネルギー2倍 = +3.01dB。
//   n回目: 60 + 3.01(n-1) dB / E = 1.26e-5 × 2^(n-1) J
//   11回目 90dB(カラオケ室内) / 21回目 120dB(飛行機のエンジン近く) / 31回目 150dB(鼓膜が破れるおそれ)  ※騒音の目安は自治体資料(掛川市ほか)
//   46回目 195dB > 194dB(1気圧の空気中で波として伝わる音の上限。45回目は192dB)
//   48回目 1.77e9J ≧ 雷放電1回 約15億J(気象庁) / 63回目 5.8e13J ≒ TNT 1.39万トン(62回目は0.69万トン)
//   79回目 3.8e18J > 日本の電気事業者の発電電力量 8,264億kWh = 2.98e18J(資源エネルギー庁 2023年度。78回目は1.9e18J)
//   96回目 5.0e23J ≒ チクシュルーブ衝突の推定 約4e23J(TNT1億メガトン) / 106回目 5.1e26J > 太陽の毎秒の放射 3.83e26J
//   115回目 2.6e29J > 地球の自転の運動エネルギー 2.14e29J / 125回目 2.67e32J > 地球の重力結合エネルギー 2.24e32J(124回目は1.34e32J)
//   ゲップの回数: 通常は1日およそ3〜30回とされる → 多い人の30回/日で 125回 ÷ 30 ≒ 4.2日
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic, cam, applyCam, starField } from '../engine/core.js';
import { buildToyStage, toyGuy, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./sp_geppu2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
const D = (id) => voice.lines[id].dur, B = (i) => `sp_geppu2x_sfx/b${i}.mp3`;
let S, SP; // stage api / space api
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 780), y + dy]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();

// ---------- shared builders ----------
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
// the burp itself: mouth opens for o.dur from o.t0, sound rings leave the mouth. Call it last in act().
function geppu(grp, who, lt, o = {}) {
  const h = who.userData, t0 = o.t0 ?? 0.1, d = o.dur ?? 0.5;
  if (lt < t0) h.face({ lid: 0.3, brow: -0.5, mouth: 'flat' });
  else if (lt < t0 + d) { h.face({ lid: 0.7, brow: 0.4, mouth: 'o', open: o.open ?? 1.8, look: [0, 0.3] }); h.head.rotation.x = -0.22; h.head.rotation.z = Math.sin(lt * 70) * 0.03; }
  who.updateMatrixWorld(true);
  const m = o.pos || h.head.localToWorld(V(0, -0.2, 0.5)); if (o.z !== undefined) m.z = o.z;
  rings(grp, m, lt - t0, o);
}
// toy Earth with a face (original character). userData.set({look, brow, browY, mouth, open, sweat, t, crack})
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
function makeCan() {
  const c = G(); cyl(0.065, 0.065, 0.2, '#7a5cff', 0, 0, 0, c); cyl(0.0665, 0.0665, 0.06, '#ffffff', 0, 0.005, 0, c);
  cyl(0.058, 0.065, 0.014, M('#d9dde3', 0.3), 0, 0.106, 0, c); cyl(0.065, 0.056, 0.014, M('#d9dde3', 0.3), 0, -0.106, 0, c); return c;
}

// ---------- extra props for the toy stage ----------
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  reg('can', makeCan()); reg('rings', ringSet()); reg('globe', makeEarth(0.3));
  { // sound level meter: userData.needle (rotation.z = 1.2 .. -1.2 for 0 .. 194 dB)
    const m = G(); rbox(0.92, 0.62, 0.06, 0.05, '#22252d', 0, 0, 0, m);
    const tex = canvasTex(512, 320, (c) => {
      c.fillStyle = '#f7f3ea'; c.fillRect(0, 0, 512, 320); const cx = 256, cy = 262, L = 190, ph = (v) => -Math.PI / 2 - (1.2 - 2.4 * v);
      for (let i = 0; i < 120; i++) { const v = i / 120; c.beginPath(); c.strokeStyle = v < 0.46 ? '#3fc46b' : v < 0.77 ? '#ffc533' : '#ff5a4f'; c.lineWidth = 36; c.arc(cx, cy, L, ph(v), ph(v + 1 / 120) + 0.004); c.stroke(); }
      c.fillStyle = '#22252d'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const d of [0, 60, 120, 194]) { const th = 1.2 - 2.4 * d / 194; c.fillText(String(d), cx - Math.sin(th) * (L - 54), cy - Math.cos(th) * (L - 54)); }
      c.font = 'bold 34px sans-serif'; c.fillText('dB', cx, cy - 58);
    });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.525), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); f.position.z = 0.032; m.add(f);
    const nd = G(); m.add(nd); rbox(0.028, 0.34, 0.012, 0.005, '#e2463c', 0, 0.17, 0, nd); sph(0.035, '#22252d', 0, -0.168, 0.05, m);
    cyl(0.03, 0.03, 0.74, '#9aa3ad', 0, -0.68, 0, m); cyl(0.2, 0.22, 0.04, '#9aa3ad', 0, -1.02, 0, m);
    m.userData.needle = nd; m.position.set(0.62, 1.04, -0.5); reg('meter', m);
  }
  { const m = G(); caps(0.02, 0.13, '#3a3d45', 0, 0, 0, m); sph(0.042, M('#c9ced6', 0.35), 0, 0.12, 0, m); reg('mic', m); }
  { // toy jet, nose toward -x
    const j = G(), f = caps(0.17, 1.1, '#ffffff', 0, 0, 0, j); f.rotation.z = Math.PI / 2;
    rbox(0.34, 0.04, 1.5, 0.02, '#35a7ff', 0.05, -0.04, 0, j); rbox(0.22, 0.04, 0.6, 0.02, '#35a7ff', 0.6, 0.02, 0, j); rbox(0.26, 0.34, 0.04, 0.02, '#35a7ff', 0.62, 0.2, 0, j);
    for (const z of [-0.42, 0.42]) { const e = cyl(0.075, 0.075, 0.3, '#9aa3ad', -0.02, -0.14, z, j); e.rotation.z = Math.PI / 2; }
    for (let i = 0; i < 6; i++) sph(0.035, M('#2c3b6b', 0.3), -0.42 + i * 0.16, 0.07, 0.165, j);
    sph(0.07, M('#2c3b6b', 0.3), -0.62, 0.06, 0.1, j, 1.3, 0.8, 0.8); reg('jet', j);
  }
  { const g = G(); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 8, 28, Math.PI), M('#2c3b6b'))); for (const sx of [-1, 1]) sph(0.16, '#ff5a4f', sx * 0.45, 0, 0, g, 0.55, 1, 1); reg('muffs', g); }
  { // toy town around the hero: items {b, a, rad, x, z, q}
    const t = G(), r = rng(11), cols = ['#ff8a7a', '#6fb7ff', '#ffd66b', '#8fe0a8', '#c9a6ff', '#ffffff', '#ffb26b']; t.userData.items = [];
    [[0.95, 7], [1.5, 10], [2.05, 13], [2.6, 16]].forEach(([rad, n], ri) => {
      for (let i = 0; i < n; i++) {
        const a = (i + (ri % 2) * 0.5) / n * Math.PI * 2, x = Math.cos(a) * rad, z = Math.sin(a) * rad; if (z < -1.75) continue;
        const w = 0.24 + r() * 0.14, h = 0.3 + r() * 0.75, b = G(); b.position.set(x, 0, z); b.rotation.y = r() * 0.6;
        rbox(w, h, w, 0.03, cols[Math.floor(r() * cols.length)], 0, h / 2, 0, b); rbox(w * 0.7, 0.05, w * 0.7, 0.02, '#5a6270', 0, h + 0.025, 0, b);
        t.add(b); t.userData.items.push({ b, a, rad, x, z, q: b.quaternion.clone() });
      }
    });
    reg('town', t);
  }
}
const meter = (s, dB, jit = 0) => { const nd = s.P.meter.userData.needle; nd.position.set(0, -0.168, 0.045); nd.rotation.z = 1.2 - 2.4 * clamp(dB / 194) + jit; };
function holdCan(s, a = 0, side = 'R') {
  const sg = side === 'R' ? 1 : -1, p = V(lerp(0.3, 0.04, a) * sg, lerp(1.0, 1.2, a), lerp(0.36, 0.5, a)).add(s.hero.position), c = s.P ? s.P.can : s.can;
  s.hero.userData.reach(side, p.clone().add(V(0.05 * sg, -0.04, -0.05))); c.visible = true; c.position.copy(p); c.rotation.set(-a * 1.1, 0, 0);
}

// ---------- space scene: toy Earth, tiny hero on top, sun, rock, exploding chunks ----------
function buildSpace() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0b1030');
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x39406b, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-4, 6, 6); scene.add(key);
  const s1 = starField(rng(5), 700, 80, 2.4, 1), s2 = starField(rng(6), 700, 80, 2.4, 1); s2.rotation.x = Math.PI; scene.add(s1, s2);
  const earth = makeEarth(1.5), hero = toyGuy({ seed: 0.2 }), ringG = ringSet(), can = makeCan(); scene.add(earth, hero, ringG, can);
  const sun = G(); sph(1, basic('#ffd84a'), 0, 0, 0, sun);
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, c = caps(0.07, 0.3, basic('#ffd84a'), Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0, sun); c.rotation.z = a - Math.PI / 2; }
  for (const sx of [-1, 1]) sph(0.12, basic('#5a3a00'), sx * 0.3 - 0.25, 0.1, 0.9, sun, 1, 1.3, 0.5);
  sun.userData.mouth = sph(0.1, basic('#5a3a00'), -0.25, -0.24, 0.9, sun, 1, 1, 0.5); scene.add(sun);
  const rock = G(); { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), new THREE.MeshStandardMaterial({ color: '#8a6a55', roughness: 0.9, flatShading: true })); m.scale.set(1.2, 0.9, 1); rock.add(m);
    for (const [x, y, z] of [[0.2, 0.2, 0.3], [-0.25, 0.05, 0.3], [0.05, -0.25, 0.32]]) sph(0.08, '#6b4f3f', x, y, z, rock, 1, 1, 0.4); } scene.add(rock);
  const N = 80, chunks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.8, flatShading: true }), N); chunks.frustumCulled = false; scene.add(chunks);
  const cr = rng(21), CD = [], col = new THREE.Color(), cols = ['#2f9bff', '#4fbf68', '#8a5a3c', '#c9793a', '#ffb84a', '#2f9bff'];
  for (let i = 0; i < N; i++) { const th = cr() * 6.283, y = cr() * 2 - 1, s = Math.sqrt(1 - y * y); CD.push({ d: V(Math.cos(th) * s, y, Math.sin(th) * s), v: 1.6 + cr() * 3.2, s: 0.1 + cr() * 0.28, w: V(cr() * 4 - 2, cr() * 4 - 2, cr() * 4 - 2) }); chunks.setColorAt(i, col.set(cols[i % cols.length])); }
  chunks.instanceColor.needsUpdate = true;
  const glow = sph(1, new THREE.MeshBasicMaterial({ color: '#fff3c0', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }), 0, 0, 0, scene); glow.castShadow = false;
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pp = new THREE.Vector3();
  function boom(t, drift = false) { // t < 0: hidden. drift: slow debris field behind the camera subject
    chunks.visible = t >= 0; glow.visible = false; if (!chunks.visible) return;
    CD.forEach((c, i) => {
      pp.copy(c.d).multiplyScalar(drift ? 2.6 + c.v * 1.1 + t * 0.06 * c.v : 0.5 + c.v * (1 - Math.exp(-t * 1.6)) * 2.2); if (drift) pp.z = -Math.abs(pp.z) - 0.8;
      const w = t * (drift ? 0.25 : 1); q.setFromEuler(e.set(c.w.x * w, c.w.y * w, c.w.z * w)); mtx.compose(pp, q, sv.setScalar(c.s * (drift ? 1.5 : 1))); chunks.setMatrixAt(i, mtx);
    });
    chunks.instanceMatrix.needsUpdate = true;
    if (!drift && t < 0.9) { glow.visible = true; glow.scale.setScalar(1.2 + t * 7); glow.material.opacity = clamp(1 - t / 0.9) * 0.95; }
  }
  const camera = cam(38), pv = new THREE.Vector3();
  const api = { scene, earth, hero, rings: ringG, can, sun, rock, boom, camera, screen(v) { pv.copy(v).project(camera); return [(pv.x * 0.5 + 0.5) * 1080, (-pv.y * 0.5 + 0.5) * 1920]; } };
  return {
    scene, camera, api,
    update(lt, gt, shot) {
      hero.userData.reset(); earth.visible = true; earth.position.set(0, 0, 0); earth.scale.setScalar(1); earth.userData.ball.rotation.set(0.22, gt * 0.2, 0); earth.userData.set();
      sun.visible = rock.visible = ringG.visible = can.visible = false; sun.scale.setScalar(1); boom(-1);
      if (shot.cam) { applyCam(camera, shot.cam, lt, shot.e - shot.s); camera.updateMatrixWorld(true); }
      if (shot.act) shot.act(lt, api, gt, shot);
      hero.userData.tick(gt);
    },
  };
}
const onEarth = (s) => { s.hero.position.set(0, 1.5, 0); s.hero.scale.setScalar(0.3); };
const SPB = { z: 1.7, n: 5, speed: 4, life: 1.05, gap: 0.14 }; // big rings in front of the Earth

const plan = [
  // 0) cold open (flash-forward of #21): a burp blows a jet away, then the camera pushes in on the burper's face, then the title
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: ['#8fd3ff', '#eef6ff', '#ffffff'], show: ['jet'],
    cam: { p0: [0.12, 1.5, 5.6], p1: [-0.3, 1.55, 2.5], l0: [0.12, 1.25, 0], l1: [-0.3, 1.52, 0.25], hold: 1.65, dur: 2.4 },
    shake: [[0.3, 0.08, 0.7]], lines: [[0.3, 0.95]],
    sfx: [[0.3, B(4), -5, 1.4], [0.32, 'impact_don', -9], [0.38, 'whoosh_gust', -8], [1.06, 'sparkle', -8], [1.65, 'whoosh_slide', -13], [2.55, B(1), -9]],
    stamps: [{ t: 0.3, text: 'ゲェフッ!!', x: 320, y: 1120, rot: -8, color: YEL, size: 118, dur: 1.0 },
      { t: 1.06, text: '☆キラーン', x: 740, y: 450, rot: 10, color: '#fff3a8', size: 72, dur: 0.65 },
      { t: 2.55, text: 'ケプッ', x: 720, y: 1130, rot: 8, color: '#ffffff', size: 80, dur: 0.6 }],
    act(lt, s) {
      const h = s.hero.userData, j = s.P.jet, f = Math.max(0, lt - 0.36), u = clamp(f / 0.7), turn = ease(k(lt, 1.65, 2.2)), kep = lt > 2.55 && lt < 2.88;
      s.hero.position.set(-0.3, 0, 0.25); s.hero.rotation.y = 0.75 * (1 - turn);
      // flung up and away into the sky, then gone with a twinkle
      j.visible = u < 1; j.scale.setScalar(0.8 * (1 - k(u, 0.75, 1)));
      j.position.set(lerp(0.65, 0.8, u) + Math.sin(u * Math.PI) * 0.35, 1.15 + Math.sin(lt * 3) * 0.02 + u * 1.35 + Math.sin(u * Math.PI) * 0.3, -0.55 - u * 1.65);
      j.rotation.set(f * 3, 0.35 + f * 4, -f * 9);
      h.body.rotation.x = lt > 0.3 && lt < 0.8 ? -0.12 : 0;
      if (lt < 1.65) {
        if (lt > 0.8) { h.face({ lid: 0, browY: 1, look: [0.8, 0.6], mouth: 'o', open: 0.4 }); h.head.rotation.x = -0.18; }
        geppu(s.P.rings, s.hero, lt, { t0: 0.3, dur: 0.5, n: 5, speed: 3.2, col: YEL });
      } else {
        h.face({ lid: kep ? 0.25 : 0.35, brow: 0.35, look: [0, 0], mouth: kep ? 'o' : 'smile', open: 0.7 }); h.head.rotation.z = 0.08 * turn; if (kep) h.head.rotation.x = -0.1;
        s.hero.updateMatrixWorld(true); rings(s.P.rings, h.head.localToWorld(V(0, -0.2, 0.5)), lt - 2.55, { n: 1, speed: 0.45, life: 0.5 });
      }
      s.P.rings.rotation.y = s.hero.rotation.y;
    } },
  // 1) hook: drinks a soda
  { sc: 'st', say: ['hook'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'],
    cam: { p0: [0.1, 1.5, 4.1], p1: [0.1, 1.48, 3.7], l0: [0.05, 1.42, 0] },
    sfx: [[0.02, 'text_impact', -9], [0.85, 'comic_eat', -14], [1.5, 'text_pa', -10]],
    tags: [{ t: 1.5, text: '125回目で、地球が…', x: 500, y: 640, h: 84, bg: RED, fg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.25, 0.85)) * (1 - ease(k(lt, 1.9, 2.45)));
      holdCan(s, a); h.arm('L', 0.05, 0.15, 0.2); h.head.rotation.x = -a * 0.28;
      h.face(a > 0.5 ? { lid: 0.92, mouth: 'flat' } : { lid: 0.12, mouth: 'smile', look: [0.3, -0.2] });
    } },
  // 2) burp #1: 60 dB
  { sc: 'st', say: ['first'], pre: 0.75, pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], hud: ['ゲップ 1回目', '60dB'],
    cam: { p0: [0.1, 1.48, 3.7], p1: [0.1, 1.48, 3.5], l0: [0.05, 1.42, 0] },
    sfx: [[0.1, B(1), -8], [0.9, 'text_pa', -12]],
    stamps: [{ t: 0.1, text: 'ケフッ', x: 290, y: 1130, rot: -8, color: '#ffffff', size: 84, dur: 0.9 }],
    tags(lt) { if (lt < 0.9) return []; const p = scr(S, headPos(S.hero), 215, 95); return [{ t: 0.9, text: '60dB', x: p[0], y: p[1], h: 76, bg: CY }]; },
    act(lt, s) {
      const h = s.hero.userData; holdCan(s, 0);
      if (lt > 0.7) { h.reach('L', V(-0.06, 1.2, 0.46)); h.face({ lid: 0.2, look: [0.5, 0.3], mouth: 'smile' }); h.head.rotation.z = 0.08; } else h.arm('L', 0.05, 0.15, 0.2);
      geppu(s.P.rings, s.hero, lt, { dur: 0.35, n: 2, speed: 1.2, open: 1.2 });
    } },
  // 3) the rule: energy x2 = +3 dB
  { sc: 'st', say: ['rule'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['meter'],
    cam: { p0: [0.15, 1.45, 4.9], p1: [0.15, 1.45, 4.7], l0: [0.15, 1.3, 0] },
    sfx: [[0.5, 'text_pa', -11], [1.0, 'comic_pico', -16], [1.5, 'comic_pico', -16], [2.0, 'comic_pico', -16], [2.5, 'comic_pico', -16], [3.0, 'comic_pico', -16]],
    cards: [{ t: 0.5, text: 'エネルギー[×2] ＝ [+3dB]', y: 470, size: 60, border: CY }],
    note: '1回目＝60dB・長さ1秒・距離1mとして計算',
    tags(lt) { const n = 1 + clamp(Math.floor((lt - 0.5) / 0.5), 0, 5), p = scr(S, S.P.meter.position, 0, -175); return [{ text: `${n}回目  ${60 + 3 * (n - 1)}dB`, x: p[0], y: p[1], h: 66, bg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, raw = (lt - 0.5) / 0.5, n = clamp(Math.floor(raw), 0, 5), f = raw >= 6 ? 1 : clamp((raw - Math.floor(raw)) * 0.5 / 0.15);
      s.hero.position.set(-0.3, 0, 0.1); s.hero.rotation.y = 0.3; s.P.meter.position.x = 0.56; meter(s, n < 1 ? 60 : 60 + 3 * (n - 1 + f));
      h.reach('R', V(0.16, 1.22, 0.1)); h.arm('L', 0.05, 0.15, 0.2); h.face({ lid: 0.15, look: [0.8, 0.1], mouth: 'smile' }); h.head.rotation.y = 0.3;
    } },
  // 4) #11: 90 dB, karaoke
  { sc: 'st', say: ['b11'], pre: 0.75, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], hero2: true, show: ['mic'], hud: ['ゲップ 11回目', '90dB'],
    cam: { p0: [0, 1.35, 4.7], p1: [0, 1.33, 4.5], l0: [0, 1.25, 0] },
    sfx: [[0.1, B(2), -7], [0.4, 'comic_surprise', -12], [0.95, 'comic_pico', -13]],
    stamps: [{ t: 0.1, text: 'ゲフッ！', x: 300, y: 1120, rot: -8, color: YEL, size: 104, dur: 1.0 }],
    tags(lt) { if (lt < 0.9) return []; const p = scr(S, headPos(S.hero2), 0, -250); return [{ t: 0.9, end: 3.4, text: 'うるさっ！', x: p[0], y: p[1], h: 70, bg: '#ffffff' }]; },
    note: '騒音の目安（自治体資料）：90dB＝カラオケ（室内）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, sing = lt < 0.3;
      s.hero.position.set(-0.55, 0, 0.05); s.hero.rotation.y = 0.3; s.hero2.position.set(0.6, 0, -0.1); s.hero2.rotation.y = -0.35;
      if (sing) { h2.reach('L', V(0.48, 1.18, 0.3)); s.P.mic.position.set(0.5, 1.26, 0.34); s.P.mic.rotation.z = 0.3; h2.face({ lid: 0.6, mouth: 'o', open: 0.6 + Math.abs(Math.sin(lt * 20)) }); h2.arm('R', 0.4, 0.5, 0.6); }
      else {
        const f = k(lt, 0.3, 0.95); h2.body.position.y = Math.sin(k(lt, 0.3, 0.7) * Math.PI) * 0.22;
        s.P.mic.position.set(0.5 - f * 0.25, Math.max(0.05, 1.26 + f * 0.9 - f * f * 2.1), 0.5); s.P.mic.rotation.z = 0.3 + f * 7;
        h2.arm('L', 0.5, 0.6, 1.6); h2.arm('R', 0.5, 0.6, 1.6); h2.face({ lid: 0, brow: -1, browY: 1, look: [-0.8, 0], mouth: 'o', open: 1.2 }); h2.head.rotation.y = -0.3;
      }
      if (lt > 0.8) { h.reach('R', V(-0.2, 1.52, 0.12)); h.face({ lid: 0.5, look: [0.6, 0], mouth: 'smile' }); h.head.rotation.z = -0.08; }
      geppu(s.P.rings, s.hero, lt, { dur: 0.45, n: 3, speed: 1.8 });
    } },
  // 5) #21: 120 dB, next to a jet engine (the jet is the one that leaves)
  { sc: 'st', say: ['b21'], pre: 0.75, pal: ['#8fd3ff', '#eef6ff', '#ffffff'], show: ['jet'], hud: ['ゲップ 21回目', '120dB'], hudColor: YEL,
    cam: { p0: [0.1, 1.4, 4.9], p1: [0.1, 1.38, 4.6], l0: [0.1, 1.2, 0] }, shake: [[0.1, 0.05, 0.6]], lines: [[0.1, 0.7]],
    sfx: [[0.1, B(3), -6], [0.35, 'whoosh_gust', -9], [1.5, 'comic_stupid', -14]],
    stamps: [{ t: 0.1, text: 'ゲェフッ！', x: 300, y: 1120, rot: -8, color: YEL, size: 110, dur: 1.0 }],
    tags: [{ t: 1.5, end: 4.6, text: '飛行機が逃げた', x: 640, y: 700, h: 68, bg: '#ffffff' }],
    note: '騒音の目安（自治体資料）：120dB＝飛行機のエンジン近く',
    act(lt, s) {
      const h = s.hero.userData, j = s.P.jet, f = Math.max(0, lt - 0.32);
      s.hero.position.set(-0.5, 0, 0.25); s.hero.rotation.y = 0.45;
      j.scale.setScalar(0.8); j.position.set(0.62 + f * f * 7, 1.12 + Math.sin(lt * 3) * 0.02 + f * 1.3, -0.75); j.rotation.set(0, -0.45, -f * 2.6);
      if (lt > 1.2) { h.arm('L', 0.3, 0.7, 1.2); h.arm('R', 0.3, 0.7, 1.2); h.face({ lid: 0.1, browY: 1, look: [0.8, 0.4], mouth: 'flat' }); h.head.rotation.y = 0.2; }
      geppu(s.P.rings, s.hero, lt, { dur: 0.5, n: 4, speed: 2.4, col: YEL });
    } },
  // 6) #31: 150 dB, eardrums
  { sc: 'st', say: ['b31'], pre: 0.75, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: ['muffs'], hud: ['ゲップ 31回目', '150dB'], hudColor: RED,
    cam: { p0: [0.1, 1.35, 4.8], p1: [0.1, 1.33, 4.6], l0: [0.1, 1.2, 0] }, shake: [[0.1, 0.07, 0.7]], lines: [[0.1, 0.8]],
    sfx: [[0.1, B(4), -5], [0.4, 'impact_don', -10], [0.85, 'comic_fall', -12]],
    stamps: [{ t: 0.1, text: 'ゲフゥッ!!', x: 310, y: 1120, rot: -8, color: RED, size: 114, dur: 1.0 }, { t: 0.95, text: 'キーン…', x: 700, y: 1010, rot: 6, color: '#ffffff', size: 78, dur: 1.5 }],
    tags(lt) { if (lt < 1.3) return []; const p = scr(S, headPos(S.hero), -40, -290); return [{ t: 1.3, text: '耳あて必須', x: p[0], y: p[1], h: 68, bg: YEL }]; },
    note: '150dB前後は、鼓膜が破れるおそれがある大きさ',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, f = ease(k(lt, 0.35, 0.8));
      s.hero.position.set(-0.45, 0, 0.1); h.head.add(s.P.muffs); s.P.muffs.position.set(0, 0, 0);
      s.hero2.position.set(0.62 + f * 0.35, 0, -0.1); s.hero2.rotation.set(-f * 1.45, -0.4, 0);
      if (f < 0.3) { h2.reach('L', V(0.3, 1.5, 0.0)); h2.reach('R', V(0.95, 1.5, 0.0)); } else { h2.arm('L', 0.3, 1.2, 0.2); h2.arm('R', 0.3, 1.2, 0.2); }
      h2.face(f < 1 ? { lid: 0.8, brow: -1, mouth: 'o', open: 0.8 } : { lid: 0.95, brow: -0.6, mouth: 'o', open: 0.3 });
      if (lt > 1.1) { h.arm('R', 2.5, 0.35, 0.3); h.face({ lid: 0.25, brow: 0.3, mouth: 'smile' }); } else h.arm('R', 0, 0.15, 0.1);
      geppu(s.P.rings, s.hero, lt, { dur: 0.55, n: 5, speed: 3, col: RED });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['ゲップ 31回目', '150dB'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.5], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) the ceiling: 194 dB
  { sc: 'st', say: ['limA'], pal: ['#27325f', '#39437a', '#ffd23a'], dim: 0.95, show: ['meter'], hudColor: RED,
    cam: { p0: [0.25, 1.4, 3.7], p1: [0.4, 1.3, 3.0], l0: [0.25, 1.2, -0.2], l1: [0.5, 1.1, -0.4] },
    sfx: [[0.2, 'countdown_tick', -14, 1.7], [1.95, 'text_pa', -9]],
    hud(lt) { const n = Math.round(lerp(31, 45, ease(k(lt, 0.2, 1.9)))); return [`ゲップ ${n}回目`, `${Math.round(60 + 3.0103 * (n - 1))}dB`]; },
    cards: [{ t: 1.95, text: '音の上限 [194dB]', y: 470, size: 70 }],
    note: '1気圧の空気中で、波として伝わる音の上限',
    act(lt, s) {
      const h = s.hero.userData, u = ease(k(lt, 0.2, 1.9));
      s.hero.position.set(-0.36, 0, 0.1); s.hero.rotation.y = 0.3; meter(s, lerp(150, 192.5, u), u >= 1 ? Math.sin(lt * 60) * 0.03 : 0);
      h.reach('R', V(0.16, 1.22, 0.1)); h.arm('L', 0.05, 0.15, 0.2); h.face({ lid: 0.05, browY: 1, look: [0.8, 0.1], mouth: 'o', open: 0.5 }); h.head.rotation.y = 0.3;
    } },
  // 9) #46: past the ceiling -> shock wave, the meter gives up
  { sc: 'st', say: ['limB'], pre: 0.8, pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['meter'], hud: ['ゲップ 46回目', '195dB'], hudColor: RED,
    cam: { p0: [0.15, 1.4, 4.4], p1: [0.15, 1.38, 4.2], l0: [0.15, 1.25, 0] }, shake: [[0.1, 0.1, 0.8]], lines: [[0.1, 0.8]],
    sfx: [[0.1, B(4), -5], [0.12, 'shock', -8], [0.2, 'impact_doon', -8], [0.8, 'comic_fall', -13]],
    stamps: [{ t: 0.12, text: 'ドンッ!!', x: 320, y: 1110, rot: -8, color: RED, size: 132, dur: 1.1 }],
    tags: [{ t: 1.4, text: '音 → 衝撃波', x: 500, y: 470, h: 84, bg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData, m = s.P.meter, nd = m.userData.needle, f = Math.max(0, lt - 0.25), t = ease(k(lt, 0.25, 0.9));
      s.hero.position.set(-0.36, 0, 0.1); meter(s, 194, lt < 0.25 ? Math.sin(lt * 80) * 0.05 : 0);
      if (f > 0) { nd.position.set(-f * 0.5, -0.168 + f * 2.2 - f * f * 2.4, 0.045 + f * 0.6); nd.rotation.z = -1.2 - f * 11; m.rotation.z = -t * 0.45; m.position.x = 0.62 + t * 0.12; }
      if (lt > 1.0) { h.face({ lid: 0.1, browY: 1, look: [0.8, 0.1], mouth: 'o', open: 0.5 }); h.head.rotation.y = 0.3; h.arm('R', 0.4, 0.5, 1.5); }
      geppu(s.P.rings, s.hero, lt, { dur: 0.6, n: 2, speed: 5.5, life: 0.7, gap: 0.1 });
    } },
  // 10) #48: one lightning strike
  { sc: 'st', say: ['b48'], pre: 0.8, pal: ['#2a3350', '#3b4668', '#ffd23a'], dim: 0.7, show: ['bolts'], hud: ['ゲップ 48回目', '雷1発分'], hudColor: YEL,
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.48, 4.0], l0: [0, 1.4, 0] }, shake: [[0.25, 0.07, 0.6]],
    sfx: [[0.1, B(4), -6], [0.25, 'flash', -10], [0.3, 'impact_doon', -8]],
    stamps: [{ t: 0.25, text: 'ピシャッ!!', x: 320, y: 1110, rot: -8, color: YEL, size: 116, dur: 1.0 }],
    cards: [{ t: 1.5, text: '雷1発 ≒ [15億ジュール]', y: 470, size: 60, border: YEL }],
    note: '気象庁：雷放電1回のエネルギーは約15億ジュール',
    act(lt, s) {
      const h = s.hero.userData, it = s.P.bolts.userData.items, on = (lt > 0.25 && lt < 0.6 && Math.floor(lt * 22) % 2 === 0) || (lt > 0.95 && lt < 1.08);
      it.forEach((b, i) => { b.visible = on && i < 2; });
      it[0].position.set(0.62, 1.75, -1.1); it[0].scale.setScalar(8); it[1].position.set(-0.72, 1.95, -1.6); it[1].scale.setScalar(6);
      if (on) { s.key.intensity = 4.2; s.hemi.intensity = 2.6; }
      if (lt > 0.7) { h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0.4], mouth: 'o', open: 0.8 }); h.arm('L', 0.3, 0.4, 1.7); h.arm('R', 0.3, 0.4, 1.7); }
      geppu(s.P.rings, s.hero, lt, { dur: 0.55, n: 4, speed: 3.2, col: YEL });
    } },
  // 11) #63: 10 kilotons of TNT, a toy town goes flying
  { sc: 'st', say: ['b63'], pre: 0.8, pal: ['#8fd9a8', '#dff3e4', '#ffffff'], show: ['town'], hud: ['ゲップ 63回目', 'TNT1万トン'], hudColor: RED,
    cam: { p0: [0, 3.5, 6.5], p1: [0, 3.1, 5.9], l0: [0, 0.8, 0] }, shake: [[0.15, 0.12, 0.9]], lines: [[0.15, 0.9]],
    sfx: [[0.1, B(5), -5], [0.2, 'impact_doon', -6], [0.3, 'collapse', -9, 2.6]],
    stamps: [{ t: 0.2, text: 'ドカーン!!', x: 500, y: 620, rot: -6, color: RED, size: 130, dur: 1.2 }],
    cards: [{ t: 1.7, text: 'TNT火薬 [1万トン]分', y: 470, size: 64 }],
    note: '63回目のエネルギー ≒ 5.8×10^13 J（TNT 約1.4万トン）',
    act(lt, s) {
      const h = s.hero.userData, rw = (lt - 0.15) * 3.5, q = new THREE.Quaternion();
      for (const it of s.P.town.userData.items) {
        const tau = Math.max(0, (rw - it.rad) / 3.5), ca = Math.cos(it.a), sa = Math.sin(it.a);
        it.b.position.set(it.x + ca * tau * 2.4, Math.max(0, tau * 2.2 - tau * tau * 2.6), it.z + sa * tau * 2.4);
        it.b.quaternion.copy(q.setFromAxisAngle(V(sa, 0, -ca), Math.min(1.5, tau * 5))).multiply(it.q);
      }
      if (lt > 1.4) { h.face({ lid: 0.1, browY: 1, look: [Math.sin(lt * 2.5) * 0.8, -0.2], mouth: 'flat' }); h.head.rotation.y = Math.sin(lt * 2.5) * 0.35; h.arm('L', 0.2, 0.6, 1.0); h.arm('R', 0.2, 0.6, 1.0); }
      geppu(s.P.rings, s.hero, lt, { dur: 0.6, n: 4, speed: 3.6, life: 0.9, col: '#ffffff', pos: V(0, 0.08, 0) }); s.P.rings.rotation.x = -Math.PI / 2;
    } },
  // 12) #79: more than Japan generates in a year
  { sc: 'st', say: ['b79'], pre: 0.8, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['towers', 'bolts'], hud: ['ゲップ 79回目', '発電量1年分'], hudColor: YEL,
    cam: { p0: [0, 1.6, 4.7], p1: [0, 1.55, 4.4], l0: [0, 1.15, -0.3] }, shake: [[0.1, 0.06, 0.6]],
    sfx: [[0.1, B(5), -5], [0.2, 'impact_doon', -9], [0.5, 'countdown_elec', -13, 1.6], [1.5, 'text_pa', -10]],
    stamps: [{ t: 0.1, text: 'ゲフッ!!', x: 300, y: 1120, rot: -8, color: YEL, size: 112, dur: 1.0 }],
    cards: [{ t: 1.5, text: '[8,264億kWh] 超え', y: 462, size: 62, border: YEL, sub: '日本の発電量 1年分（2023年度）' }],
    note: '資源エネルギー庁 電力調査統計（電気事業者の発電電力量）',
    act(lt, s) {
      const h = s.hero.userData, tw = s.P.towers.userData.items, it = s.P.bolts.userData.items;
      s.hero.position.set(0, 0, 0.55);
      tw.forEach((t, i) => { t.position.y = lt > 0.45 ? Math.abs(Math.sin(lt * 8 + i * 1.3)) * 0.06 : 0; });
      it.forEach((b, i) => { const t = tw[(Math.floor(lt * 5) + i * 3) % 12].position; b.visible = lt > 0.45 && (Math.floor(lt * 10) + i) % 2 === 0; b.position.set(t.x, 1.08, t.z + 0.05); b.scale.setScalar(1.7); });
      if (lt > 1.0) { h.arm('L', 2.7, 0.35, 0.2); h.arm('R', 2.7, 0.35, 0.2); h.face({ lid: 0.15, mouth: 'smile' }); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.05; }
      geppu(s.P.rings, s.hero, lt, { dur: 0.6, n: 5, speed: 3.4, col: YEL });
    } },
  // 13) #96: the dinosaur-killer asteroid (it bounces off)
  { sc: 'sp', say: ['b96'], pre: 0.8, hud: ['ゲップ 96回目', '隕石クラス'], hudColor: RED,
    cam: { p0: [0, 1.2, 10.2], p1: [0, 1.2, 9.6], l0: [0, 0.9, 0] }, shake: [[0.1, 0.06, 0.7]],
    sfx: [[0.1, B(5), -5], [0.2, 'impact_doon', -8], [0.5, 'comic_boyon', -9]],
    stamps: [{ t: 0.1, text: 'ゲフッ!!', x: 270, y: 640, rot: -8, color: YEL, size: 100, dur: 0.9 }, { t: 0.5, text: 'ポーン', x: 740, y: 560, rot: 10, color: '#ffffff', size: 84, dur: 0.9 }],
    tags: [{ t: 1.7, text: '隕石のほうが飛んでいく', x: 500, y: 470, h: 72, bg: '#ffffff' }],
    note: '6600万年前の隕石衝突の推定エネルギー ≒ 4×10^23 J',
    act(lt, s) {
      onEarth(s); const E = s.earth.userData, a = k(lt, 0, 0.45), b = Math.max(0, lt - 0.45), r = s.rock;
      r.visible = lt < 1.3; r.position.set(lerp(2.5, 0.75, a) + b * 5, lerp(3.7, 2.45, a) + b * 3.6, 0.4); r.rotation.set(lt * 3, lt * 2, b * 9);
      E.set(lt < 1.3 ? { look: [0.7, 0.9], brow: -1, browY: 1, mouth: 'o', open: 1, sweat: true, t: lt } : { look: [0, 1], brow: -0.6, mouth: 'flat', sweat: true, t: lt });
      if (lt > 0.9) s.hero.userData.face({ lid: 0.3, mouth: 'smile' });
      geppu(s.rings, s.hero, lt, { ...SPB, dur: 0.6, col: YEL });
    } },
  // 14) #106: more than the Sun puts out in a second
  { sc: 'sp', say: ['b106'], pre: 0.8, hud: ['ゲップ 106回目', '太陽1秒分'], hudColor: YEL,
    cam: { p0: [0, 1.2, 9.6], p1: [0.1, 1.25, 9.9], l0: [0, 0.9, 0], l1: [0.1, 0.95, 0] }, shake: [[0.1, 0.07, 0.7]],
    sfx: [[0.1, B(5), -5], [0.2, 'impact_doon', -8], [0.5, 'comic_surprise', -11]],
    stamps: [{ t: 0.1, text: 'ゲフゥッ!!', x: 270, y: 640, rot: -8, color: YEL, size: 100, dur: 0.9 }],
    tags: [{ t: 1.0, end: 4.4, text: '太陽もビックリ', x: 690, y: 800, h: 66, bg: YEL }],
    note: '太陽が1秒間に出すエネルギー ≒ 3.8×10^26 J',
    act(lt, s) {
      onEarth(s); const E = s.earth.userData, w = lt > 0.42 ? Math.exp(-(lt - 0.42) * 3) * Math.sin((lt - 0.42) * 22) : 0;
      s.sun.visible = true; s.sun.position.set(1.9 + (lt > 0.42 ? 0.2 * (1 - Math.exp(-(lt - 0.42) * 4)) : 0), 2.75, -2); s.sun.scale.set(0.95 * (1 + w * 0.16), 0.95 * (1 - w * 0.16), 0.95);
      s.sun.userData.mouth.scale.set(0.1, lt > 0.42 ? 0.2 : 0.06, 0.05);
      E.set({ look: [0.8, 0.8], brow: -0.8, browY: 1, mouth: 'o', open: 0.7, sweat: true, t: lt });
      geppu(s.rings, s.hero, lt, { ...SPB, dur: 0.6, col: '#fff3a8' });
    } },
  // 15) #115: enough to stop the Earth's spin
  { sc: 'sp', say: ['b115'], pre: 0.8, hud: ['ゲップ 115回目', '自転ストップ'], hudColor: RED,
    cam: { p0: [0, 1.2, 9.4], l0: [0, 0.9, 0] }, shake: [[0.1, 0.08, 0.7]],
    sfx: [[0.1, B(6), -5], [0.2, 'impact_doon', -8], [0.78, 'text_pa', -8], [1.3, 'comic_stupid', -13]],
    stamps: [{ t: 0.1, text: 'ゲェフッ!!', x: 270, y: 640, rot: -8, color: YEL, size: 100, dur: 0.7 }, { t: 0.78, text: 'ピタッ', x: 730, y: 640, rot: 8, color: '#ffffff', size: 104, dur: 1.2 }],
    tags: [{ t: 1.9, text: '1日が終わらない…', x: 500, y: 470, h: 72, bg: '#ffffff' }],
    note: '地球の自転の運動エネルギー ≒ 2.1×10^29 J',
    act(lt, s) {
      onEarth(s); const E = s.earth.userData, u = k(lt, 0.4, 0.78);
      E.ball.rotation.set(0.22, lt < 0.4 ? lt * 11 : 4.4 + (1 - (1 - u) * (1 - u)) * 1.1, 0);
      E.set(lt < 0.78 ? { look: [0, 0], brow: 0, mouth: 'smile' } : { look: [Math.cos(lt * 7) * 0.9, Math.sin(lt * 7) * 0.9], brow: -0.7, mouth: 'o', open: 0.5, sweat: true, t: lt });
      geppu(s.rings, s.hero, lt, { ...SPB, dur: 0.65, col: '#ffffff' });
    } },
  // 16) #125 is coming: the crust cracks
  { sc: 'sp', say: ['b125'], pre: 0.15, hud: ['ゲップ 125回目', '地球の限界'], hudColor: RED,
    cam: { p0: [0, 1.2, 9.8], p1: [0, 1.15, 8.7], l0: [0, 0.9, 0] }, shake: [[0, 0.035, 5]],
    sfx: [[0.1, 'tension_fear', -12, 4.0], [0.5, 'quake', -11, 3.6], [1.3, 'crack_rock', -9]],
    tags: [{ t: 2.3, text: 'スゥー…', x: 730, y: 650, h: 66, bg: '#ffffff' }],
    note: '地球の重力結合エネルギー ≒ 2.2×10^32 J',
    act(lt, s, gt, sh) {
      onEarth(s); const E = s.earth.userData, h = s.hero.userData, u = ease(k(lt, 0.3, sh.e - sh.s - 0.2));
      s.earth.position.x = Math.sin(lt * 61) * 0.012 * (1 + 3 * u);
      E.set({ look: [0, 1], brow: -1, browY: 1, mouth: 'o', open: 1.5, sweat: true, t: lt * 1.6, crack: u });
      h.head.rotation.x = -0.3 * u; h.arm('L', 0.2, 0.3 + u * 0.5, 0.6); h.arm('R', 0.2, 0.3 + u * 0.5, 0.6); h.face({ lid: 0.35, brow: 0.5, mouth: 'flat' });
    } },
  // 17) #125: the Earth comes apart
  { sc: 'sp', say: [], pre: 0, hold: 2.7, hud: ['ゲップ 125回目', '地球 終了'], hudColor: RED,
    cam: { p0: [0, 1.15, 8.7], p1: [0, 1.3, 10.6], l0: [0, 0.9, 0] }, shake: [[0.3, 0.18, 1.3]], lines: [[0.28, 1.3]],
    sfx: [[0.1, B(6), -4], [0.3, 'impact_doon', -4], [0.3, 'flash', -9], [0.34, 'collapse', -7, 2.3]],
    stamps: [{ t: 0.3, text: 'ドッカーン!!', x: 500, y: 900, rot: -6, color: RED, size: 150, dur: 1.5 }],
    act(lt, s) {
      onEarth(s); const E = s.earth.userData, f = Math.max(0, lt - 0.3);
      s.earth.visible = lt < 0.3; s.earth.scale.setScalar(1 + 0.07 * k(lt, 0.1, 0.3)); E.set({ look: [0, 1], brow: -1, browY: 1, mouth: 'o', open: 1.8, crack: 1 });
      if (f > 0) { s.boom(f); s.hero.position.y = 1.5 + f * 0.4; s.hero.rotation.z = f * 0.5; s.hero.userData.face({ lid: 0.92, mouth: 'smile' }); }
      geppu(s.rings, s.hero, lt, { ...SPB, dur: 0.6, speed: 6.5, n: 6, col: '#ffffff' });
    } },
  // 18) the pace: up to 30 a day -> 4 days
  { sc: 'sp', say: ['pace', 'days'], note: 'ゲップは通常、1日におよそ3〜30回とされる',
    cam: { p0: [0, 1.4, 5.9], p1: [0, 1.4, 5.5], l0: [0, 1.35, 0] },
    sfx: [[1.5, 'text_pa', -11], [0.1 + D('pace') + 0.2 + 0.55, 'comic_jajean', -10]],
    hud(lt) { return lt < this.lt.days ? ['ゲップ 125回目', '地球 終了'] : ['地球の寿命', 'あと4日']; }, hudColor: RED,
    cards(lt) { const a = this.lt.days; return lt < a ? [{ t: 1.5, text: '多い人で 1日[30回]', y: 462, size: 62, border: CY }] : [{ t: a + 0.55, text: '125回 ÷ 30回 ≒ [4日]', y: 462, size: 62 }]; },
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.days;
      s.earth.visible = false; s.boom(3 + lt * 0.3, true);
      s.hero.position.set(0, 0.15 + Math.sin(gt * 0.9) * 0.05, 0); s.hero.rotation.z = Math.sin(gt * 0.6) * 0.1;
      holdCan(s, 0); s.can.position.y += 0.02;
      if (late) { h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); }
      else { h.face({ lid: 0.2, look: [0.6, -0.4], mouth: 'smile' }); h.arm('L', 0.1, 0.5, 0.4); }
    } },
  // 19) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['counter', 'globe'],
    cam: { p0: [0, 1.5, 4.2], p1: [0, 1.5, 3.9], l0: [0, 1.36, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.2, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'やめる', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'やめない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData, g = s.P.globe, a = ease(k(lt, 0.6, 1.6)) * 0.55;
      s.P.counter.position.set(-0.95, 0, -0.25); g.position.set(-0.42, 1.24 + Math.sin(lt * 30) * 0.004, -0.1); g.userData.ball.rotation.set(0.22, 0.6, 0);
      g.userData.set({ look: [0.9, 0.1], brow: -1, browY: 1, mouth: 'o', open: 0.9, sweat: true, t: lt });
      s.hero.position.set(0.36, 0, 0.1); holdCan(s, a, 'L'); h.arm('R', 0.05, 0.15, 0.2);
      h.face({ lid: 0.3, brow: 0.5, look: [-0.6, 0], mouth: 'smile' }); h.head.rotation.set(0, -0.2, Math.sin(lt * 1.6) * 0.08);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもゲップが毎回', '[2倍]強くなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['ゲップの強さ', '毎回×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: {
    st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; },
    sp: () => { const sp = buildSpace(); SP = sp.api; return sp; },
  },
});
