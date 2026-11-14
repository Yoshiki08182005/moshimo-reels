// ep30_ichien (pop スタイル / アームB 逆転の応用): もしも日本人全員が1円ずつくれたら？
// 構成の型だけ sp_geppu2x に合わせ、台本・数字・ネタは自作。
// 前提: 人口 1億2,321万人（総務省 人口推計 2025年10月概算）× 1円 = 123,210,000円 = 1円玉 1.2321億枚
//   1円玉: 1g・直径20mm・厚さ1.5mm（造幣局）→ 123.2t（10tトラック 12.3台）/ 積む 184.8km（宇宙=100km）/ 並べる 2,464km（東京〜那覇 約1,555km の1.58倍）
//   1日1万円で 33.8年 / 1秒1枚で 3.91年（3年11か月）
//   住宅の居室の床 1,800N/㎡ ≒ 180kg/㎡（建築基準法施行令85条）→ 123.2t には 684㎡ 必要
//   同じ硬貨は1回20枚まで（通貨の単位及び貨幣の発行等に関する法律 7条）→ 616万回
//   ゆうちょ窓口の硬貨料金（2024年4月〜: 〜100枚無料・101〜500枚550円・501〜1000枚1,100円・以降500枚ごとに+550円）→ 1億3,553万円（赤字 1,232万円）
//   贈与税（一般税率）: (1億2,321万 − 110万) × 55% − 640万 = 6,076万円（約49%）
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep30_ichien.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const F2 = 0.1 + voice.lines.floor.dur + 0.2 + 0.4; // floor gives way (shot 10)
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const DM = new THREE.Object3D();
const COIN = new THREE.MeshStandardMaterial({ color: '#e4e8ee', roughness: 0.3, metalness: 0.25 });
const yen = (n) => n.toLocaleString('ja-JP');

// ---------- props ----------
function coinFaceTex() {
  return canvasTex(256, 256, (c) => {
    c.fillStyle = '#e9edf2'; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = '#b9c0c9'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 112, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#9aa3ad'; c.font = 'bold 150px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', 128, 136);
  });
}
function instCoins(n, r = 0.06, h = 0.012) {
  const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, h, 20), COIN, n); m.castShadow = true; m.frustumCulled = false;
  for (let i = 0; i < n; i++) { DM.position.set(0, -50, 0); DM.updateMatrix(); m.setMatrixAt(i, DM.matrix); }
  return m;
}
// heap: truncated cone (top radius RT at height H) covered with coins; scale the group to grow it
const RB = 1.55, RT = 0.3, H = 1.05;
function makeHeap() {
  const g = G(), body = new THREE.Mesh(new THREE.CylinderGeometry(RT, RB, H, 48), M('#cfd4db', 0.35)); body.position.y = H / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  const n = 700, m = instCoins(n), r = rng(5);
  for (let i = 0; i < n; i++) {
    const u = Math.sqrt(r()) * 0.98, a = r() * Math.PI * 2, rad = lerp(RT, RB, 1 - u) + 0.01;
    DM.position.set(Math.cos(a) * rad, u * H + 0.006, Math.sin(a) * rad); DM.rotation.set((r() - 0.5) * 1.6, r() * 3, (r() - 0.5) * 1.6); DM.updateMatrix(); m.setMatrixAt(i, DM.matrix);
  }
  g.add(m); return g;
}
const heapH = (rad) => clamp((RB - rad) / (RB - RT)) * H; // surface height at radius (unit scale)
function makeTruck() {
  const t = G(); rbox(0.55, 0.62, 0.72, 0.08, '#35a7ff', 0.95, 0.5, 0, t); rbox(0.3, 0.26, 0.74, 0.04, '#cfeeff', 1.05, 0.62, 0, t);
  rbox(1.55, 0.12, 0.76, 0.03, '#3a3d45', 0.0, 0.3, 0, t);
  for (const z of [-0.37, 0.37]) rbox(1.55, 0.28, 0.04, 0.02, '#ffd23a', 0.0, 0.48, z, t);
  for (const x of [-0.76, 0.76]) rbox(0.04, 0.28, 0.76, 0.02, '#ffd23a', x, 0.48, 0, t);
  const ld = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.62, 0.42, 32), M('#d6dbe2', 0.32)); ld.scale.set(1.2, 1, 0.6); ld.position.set(0, 0.56, 0); ld.castShadow = true; t.add(ld);
  for (const [x, z] of [[-0.5, 0.38], [0.5, 0.38], [0.95, 0.38], [-0.5, -0.38], [0.5, -0.38], [0.95, -0.38]]) { const w = cyl(0.15, 0.15, 0.1, '#23262f', x, 0.16, z, t); w.rotation.x = Math.PI / 2; }
  sph(0.05, '#fff3a8', 1.23, 0.42, 0.25, t); sph(0.05, '#fff3a8', 1.23, 0.42, -0.25, t);
  return t;
}
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  reg('heap', makeHeap());
  reg('rain', instCoins(260, 0.07, 0.014));
  { // big hand coin, face toward +z
    const ft = new THREE.MeshStandardMaterial({ map: coinFaceTex(), roughness: 0.3, metalness: 0.2 });
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32), [COIN, ft, ft]); c.rotation.x = Math.PI / 2; c.castShadow = true;
    const g = G(); g.add(c); reg('coin', g);
  }
  { const m = instCoins(320, 0.11, 0.024); reg('tower', m); }
  { const m = instCoins(64, 0.1, 0.02); reg('row', m); }
  { const m = instCoins(32, 0.07, 0.013); reg('stack', m); }
  { const m = instCoins(20, 0.06, 0.012); reg('fly', m); }
  reg('truck', makeTruck());
  { const g = G(); for (let i = 0; i < 4; i++) { const t = makeTruck(); t.scale.setScalar(0.55); t.position.set(-1.6 + i * 1.05, 0, -1.6); g.add(t); } reg('trucks', g); }
  { // hole in the floor (black disc + jagged rim)
    const g = G(), d = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: '#14161c' })); d.rotation.x = -Math.PI / 2; d.position.y = 0.012; g.add(d);
    const r = rng(3); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, b = rbox(0.22, 0.05, 0.12, 0.02, '#a87a4f', Math.cos(a) * 1.02, 0.02, Math.sin(a) * 1.02, g); b.rotation.set(r() * 0.5, -a, r() * 0.4); }
    reg('hole', g);
  }
}
// coins raining down onto the heap. t = time since start; o.r = spread radius, o.dur = spawn window, o.cx/cz centre
function rain(t, o = {}) {
  const m = S.P.rain, n = o.n ?? 260, r = rng(9), R = o.r ?? 1.5, sc = o.heapScale ?? 1; m.visible = true;
  for (let i = 0; i < 260; i++) {
    const a = r() * Math.PI * 2, rad = Math.sqrt(r()) * R, d = r() * (o.dur ?? 0.9), sp = r(), f = t - d;
    let y = 4.6 - 7 * f - 6 * f * f; const floorY = (o.floor ?? heapH(rad / sc) * sc) + 0.01;
    if (i >= n || f < 0 || y < floorY - 0.4) { DM.position.set(0, -50, 0); DM.scale.setScalar(0); }
    else { y = Math.max(y, floorY); DM.position.set((o.cx ?? 0) + Math.cos(a) * rad, y, (o.cz ?? 0) + Math.sin(a) * rad); DM.rotation.set(f * (6 + sp * 8), sp * 3, f * 5); DM.scale.setScalar(1); }
    DM.updateMatrix(); m.setMatrixAt(i, DM.matrix);
  }
  m.instanceMatrix.needsUpdate = true;
}
function setStack(m, n, x, y, z, h = 0.024, max = 320) {
  m.visible = true;
  for (let i = 0; i < max; i++) { if (i < n) { DM.position.set(x + Math.sin(i * 2.1) * 0.006, y + h / 2 + i * h, z + Math.cos(i * 1.3) * 0.006); DM.rotation.set(0, i, 0); DM.scale.setScalar(1); } else { DM.position.set(0, -50, 0); DM.scale.setScalar(0); } DM.updateMatrix(); m.setMatrixAt(i, DM.matrix); }
  m.instanceMatrix.needsUpdate = true;
}
function holdCoin(h, side, p) { h.reach(side, p.clone().add(V(side === 'R' ? 0.04 : -0.04, -0.06, -0.04))); S.P.coin.visible = true; S.P.coin.position.copy(p); }

const plan = [
  // 0) cold open (flash-forward of the heap): "ちょうだい" -> 1円玉 avalanche buries him, push in on the face sticking out, smug with a coin on his head
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: ['#8fd3ff', '#eef6ff', '#ffffff'], show: ['heap'],
    cam: { p0: [0.1, 1.55, 6.2], p1: [0.05, 1.5, 2.45], l0: [0, 1.15, 0], l1: [0, 1.45, 0], hold: 1.6, dur: 2.35 },
    shake: [[0.25, 0.09, 1.1]], lines: [[0.25, 1.0]],
    sfx: [[0.22, 'collapse', -7], [0.25, 'impact_doon', -9], [0.3, 'coin_toss', -8], [0.6, 'coin_toss', -10], [0.95, 'coin_toss', -11], [1.6, 'whoosh_slide', -13], [2.5, 'coin_toss', -7], [2.55, 'comic_pico', -12]],
    stamps: [{ t: 0.25, text: 'ジャラジャラ!!', x: 330, y: 760, rot: -8, color: YEL, size: 112, dur: 1.2 },
      { t: 0.9, text: 'ドサーッ', x: 720, y: 1250, rot: 8, color: '#ffffff', size: 92, dur: 0.7 },
      { t: 2.55, text: 'チャリン♪', x: 760, y: 520, rot: 10, color: '#ffffff', size: 78, dur: 0.6 }],
    act(lt, s) {
      const h = s.hero.userData, g = ease(k(lt, 0.25, 1.35)), hp = s.P.heap;
      s.hero.position.set(0, 0, 0);
      hp.scale.set(lerp(0.05, 1, g), lerp(0.02, 1, g), lerp(0.05, 1, g));
      if (lt < 1.7) rain(lt - 0.2, { heapScale: Math.max(0.05, g), dur: 1.0 });
      if (lt < 0.25) { h.arm('L', 1.3, 0.3, 0.3); h.arm('R', 1.3, 0.3, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0.1, look: [0, 0.6], mouth: 'smile', open: 1 }); h.head.rotation.x = -0.25; }
      else if (lt < 1.6) { h.arm('L', 0.4, 1.9, 0.4); h.arm('R', 0.4, 1.9, 0.4); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0.5], mouth: 'o', open: 1.3 }); h.head.rotation.x = -0.15; }
      else { // smug: coin on the head
        h.arm('L', 0, 0.1, 0); h.arm('R', 0, 0.1, 0); h.face({ lid: 0.45, brow: 0.4, look: [0, 0], mouth: 'smile', open: 0.8 }); h.head.rotation.z = 0.12 * ease(k(lt, 1.6, 2.2));
        const c = s.P.coin; c.visible = true; s.hero.updateMatrixWorld(true); const top = h.head.localToWorld(V(0.05, 0.47, 0.05));
        const f = k(lt, 2.2, 2.5); c.position.set(top.x, top.y + (1 - f) * 1.2, top.z); c.rotation.set(-Math.PI / 2 + 0.25, 0, 0.12);
        if (lt > 2.5) c.rotation.z = 0.12 + Math.sin((lt - 2.5) * 30) * 0.15 * (1 - k(lt, 2.5, 2.9));
      }
    } },
  // 1) hook: holds out hands, one coin drops in
  { sc: 'st', say: ['hook'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'],
    cam: { p0: [0.1, 1.5, 4.1], p1: [0.1, 1.48, 3.7], l0: [0.05, 1.38, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.2, 'coin_toss', -11]],
    tags: [{ t: 1.6, text: '1人たった1円', x: 520, y: 650, h: 84, bg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData, f = k(lt, 0.7, 1.2), p = V(0, lerp(2.4, 1.0, f * f), 0.42);
      h.reach('L', V(-0.1, 0.98, 0.42)); h.reach('R', V(0.1, 0.98, 0.42)); h.hand('L', 'pa'); h.hand('R', 'pa');
      s.P.coin.visible = true; s.P.coin.position.copy(p); s.P.coin.rotation.set(-1.2 + f * 0.2, lt * (1 - f) * 8, 0);
      h.face(lt < 1.2 ? { lid: 0.05, look: [0, 0.6], mouth: 'o', open: 0.6 } : { lid: 0.3, brow: 0.3, look: [0.2, -0.5], mouth: 'smile' }); h.head.rotation.x = lt < 1.2 ? -0.15 : 0.12;
    } },
  // 2) total: the crowd tosses coins to him
  { sc: 'st', say: ['total'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['crowd'], hud: ['もらった額', '1億2千万円'],
    cam: { p0: [0, 1.5, 4.6], p1: [0, 1.45, 4.3], l0: [0, 1.2, -0.3] },
    sfx: [[0.4, 'coin_toss', -12], [1.0, 'coin_toss', -13], [1.6, 'coin_toss', -13], [2.4, 'text_pa', -11], [3.3, 'sparkle', -12]],
    tags: [{ t: 0.4, text: '1億2,321万人', x: 800, y: 660, h: 72, bg: '#ffffff' }],
    cards(lt) { const t0 = this.lt.total + 2.3; return lt > t0 ? [{ t: t0, text: '1円 × 1億2千万人 ＝ [1億2,321万円]', y: 480, size: 54, border: CY }] : []; },
    note: '人口：総務省 人口推計（2025年10月概算）',
    act(lt, s) {
      const h = s.hero.userData, m = s.P.fly, r = rng(4); m.visible = true;
      s.hero.position.set(0, 0, 0.75); h.reach('L', V(-0.12, 0.95, 1.15)); h.reach('R', V(0.12, 0.95, 1.15)); h.hand('L', 'pa'); h.hand('R', 'pa');
      s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.max(0, Math.sin((lt * 3 + i) * 2)) * 0.06; });
      for (let i = 0; i < 20; i++) {
        const src = s.P.crowd.userData.items[i % 16].position, f = (lt - 0.3 - i * 0.17) / 0.7;
        if (f < 0 || f > 1) { DM.position.set(0, -50, 0); } else { DM.position.set(lerp(src.x, 0, f), lerp(1.0, 1.0, f) + Math.sin(f * Math.PI) * 1.1, lerp(src.z, 1.15, f)); DM.rotation.set(f * 9, r(), f * 4); }
        DM.updateMatrix(); m.setMatrixAt(i, DM.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
      h.face(lt > 2.3 ? { lid: 0, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 } : { lid: 0.2, look: [0, 0.3], mouth: 'smile' });
    } },
  // 3) 1万円 a day lasts 33 years
  { sc: 'st', say: ['daily'], pal: ['#8fd9a8', '#dff3e4', '#ffffff'], show: ['bill', 'bag'], hud: ['もらった額', '1億2千万円'],
    cam: { p0: [0.1, 1.45, 4.2], p1: [0.1, 1.45, 3.9], l0: [0.05, 1.3, 0] },
    sfx: [[0.3, 'whoosh_swing', -13], [1.2, 'comic_pico', -14], [1.9, 'text_pa', -11]],
    tags(lt) { const t0 = this.lt.daily + 1.4, y = Math.max(1, Math.round(33 * ease(k(lt, t0, t0 + 1.0)))); return lt > t0 ? [{ t: t0, text: `${y}年目`, x: 760, y: 700, h: 104, bg: YEL }] : []; },
    note: '1日1万円ずつ使う（試算）',
    act(lt, s) {
      const h = s.hero.userData, w = Math.sin(lt * 7) * 0.08; s.hero.position.set(-0.15, 0, 0.1); s.hero.rotation.y = 0.2;
      const bp = V(0.32, 1.55 + w, 0.35); h.reach('R', bp.clone().add(V(0.02, -0.1, -0.03))); s.P.bill.position.copy(bp); s.P.bill.rotation.set(0, -0.2, 0.3 + w);
      const gp = V(-0.42, 0.62, 0.2); h.reach('L', gp.clone().add(V(0, 0.3, 0))); s.P.bag.position.copy(gp);
      h.face({ lid: 0.35, brow: 0.3, look: [0.5, 0.4], mouth: 'smile', open: 1 }); h.head.rotation.z = Math.sin(lt * 4) * 0.06;
    } },
  // 4) 1g each -> 123 t
  { sc: 'st', say: ['weight'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['desk', 'scale'], hud: ['1円玉', '1.23億枚'],
    cam: { p0: [0.15, 1.42, 4.5], p1: [0.15, 1.42, 4.25], l0: [0.15, 1.28, 0] },
    sfx: [[0.6, 'comic_pico', -13], [2.4, 'impact_don', -10], [2.5, 'text_pa', -11]],
    tags(lt) { const p = scr(V(0.62, 0.85, 0.15), 0, -120); return lt > 0.8 ? [{ t: 0.8, text: '1g', x: p[0], y: p[1], h: 80, bg: '#ffffff' }] : []; },
    cards(lt) { const t0 = this.lt.weight + 2.2; return lt > t0 ? [{ t: t0, text: '1g × 1.23億枚 ＝ [123トン]', y: 480, size: 60, border: CY }] : []; },
    note: '1円玉：1枚1g・直径20mm・厚さ1.5mm（造幣局）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.28, 0, 0.15); s.hero.rotation.y = 0.3;
      s.P.desk.position.set(0.62, 0, 0); s.P.scale.position.set(0.6, 0.77, 0.1);
      const put = ease(k(lt, 0.3, 0.7)), cp = V(lerp(0.1, 0.6, put), lerp(1.3, 0.86, put), lerp(0.45, 0.12, put));
      if (lt < 0.75) holdCoin(h, 'R', cp); else { s.P.coin.visible = true; s.P.coin.position.set(0.6, 0.84, 0.12); s.P.coin.rotation.set(-Math.PI / 2, 0, 0); h.reach('R', V(0.3, 1.2, 0.4)); h.hand('R', 'choki'); }
      h.arm('L', 0.1, 0.2, 0.2);
      h.face(lt > 2.3 ? { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.2 } : { lid: 0.2, look: [0.7, -0.4], mouth: 'smile' });
    } },
  // 5) 12 trucks
  { sc: 'st', say: ['truck'], pal: ['#ffd66b', '#fff4d0', '#3f6fd8'], show: ['truck', 'trucks'], hud: ['重さ', '123トン'],
    cam: { p0: [0.15, 1.55, 4.8], p1: [0.15, 1.5, 4.5], l0: [0.15, 1.15, -0.2] },
    sfx: [[0.1, 'giant_step', -12], [0.9, 'text_pa', -11]],
    tags(lt) { return lt > 0.8 ? [{ t: 0.8, text: '10tトラック ×12台', x: 540, y: 700, h: 96, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.truck.position.set(0.5, 0, -0.35); s.P.truck.rotation.y = -0.55; s.P.truck.scale.setScalar(0.62); s.P.trucks.scale.setScalar(0.75); s.P.trucks.position.set(0.2, 0, -0.6);
      s.hero.position.set(-0.4, 0, 0.35); s.hero.rotation.y = 0.2;
      h.reach('R', V(0.12, 1.25 + Math.sin(lt * 6) * 0.03, 0.45)); h.hand('R', 'choki'); h.arm('L', 0.1, 0.3, 0.3);
      h.face(lt > 0.7 ? { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 } : { lid: 0.2, look: [0.8, -0.2], mouth: 'smile' });
    } },
  // 6) stack: 185 km, past space
  { sc: 'st', say: ['stack'], pal: ['#2a3a7a', '#3a4a8a', '#ffd23a'], show: ['tower'], hud: ['積み上げると', '185km'], hudColor: YEL, dim: 0.9,
    cam: { p0: [0.1, 1.3, 4.6], p1: [0.1, 1.6, 4.8], l0: [0.1, 1.3, 0], l1: [0.1, 1.95, 0], hold: 0.3 },
    sfx: [[0.2, 'whoosh_slide', -12], [1.2, 'whoosh_gust', -12], [2.2, 'text_pa', -11], [2.9, 'sparkle', -12]],
    tags(lt) { const t0 = this.lt.stack + 2.0; return lt > t0 ? [{ t: t0, text: '宇宙（100km）を突破', x: 600, y: 520, h: 80, bg: YEL }, { t: t0 + 0.3, text: '富士山の49倍', x: 600, y: 650, h: 68, bg: '#ffffff' }] : []; },
    note: '1枚1.5mm × 1.23億枚 ＝ 約185km（試算）',
    act(lt, s) {
      const h = s.hero.userData, n = Math.floor(320 * ease(k(lt, 0.1, 2.2)));
      setStack(s.P.tower, n, 0.5, 0, 0);
      s.hero.position.set(-0.3, 0, 0); s.hero.rotation.y = 0.35; h.head.rotation.x = -0.45; h.reach('R', V(0.38, 1.1, -0.1)); h.hand('R', 'pa'); h.arm('L', 0.2, 0.9, 0.3);
      h.face({ lid: 0, browY: 1, look: [0.4, 1], mouth: 'o', open: 1 });
    } },
  // 7) line: 2,464 km
  { sc: 'st', say: ['line'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['row'], hud: ['並べると', '2,464km'],
    cam: { p0: [-0.6, 1.05, 4.7], p1: [0.9, 1.05, 4.7], l0: [-0.6, 0.75, 0], l1: [0.9, 0.75, 0] },
    sfx: [[0.3, 'comic_pico', -15], [0.8, 'comic_pico', -15], [1.3, 'comic_pico', -15], [3.0, 'text_pa', -11]],
    cards(lt) { const t0 = this.lt.line + 2.9; return lt > t0 ? [{ t: t0, text: '東京 → 那覇の[1.6倍]', y: 480, size: 64, border: CY }] : []; },
    note: '直径20mm × 1.23億枚 ＝ 約2,464km（試算）',
    act(lt, s) {
      const h = s.hero.userData, m = s.P.row, hx = lerp(-0.9, 1.1, k(lt, 0, 5.6));
      for (let i = 0; i < 64; i++) { if (-1.6 + i * 0.205 < hx - 0.25) { DM.position.set(-1.6 + i * 0.205, 0.1, 0.3); DM.rotation.set(Math.PI / 2, 0, 0); DM.scale.setScalar(1); } else { DM.position.set(0, -50, 0); } DM.updateMatrix(); m.setMatrixAt(i, DM.matrix); }
      m.visible = true; m.instanceMatrix.needsUpdate = true;
      s.hero.position.set(hx, 0, -0.25); s.hero.rotation.y = 0.5; s.hero.userData.body.position.y = Math.abs(Math.sin(lt * 9)) * 0.05;
      h.arm('L', -0.4, 0.2, 0.3); h.arm('R', 0.5, 0.2, 0.4); h.face({ lid: 0.15, look: [0.3, -0.6], mouth: 'smile' });
    } },
  // 8) counting: 3 years 11 months
  { sc: 'st', say: ['count'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['desk', 'stack', 'clock', 'lamp'], hud: ['数える', '1秒1枚'],
    cam: { p0: [0.1, 1.45, 4.0], p1: [0.1, 1.42, 3.7], l0: [0.05, 1.22, 0] },
    sfx: [[0.3, 'countdown_tick', -16, 3.2], [2.4, 'text_pa', -11]],
    tags(lt) { const t0 = this.lt.count + 2.2; return lt > t0 ? [{ t: t0, text: '寝ずに3年11か月', x: 540, y: 520, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.desk.position.set(0, 0, 0.35); s.hero.position.set(0, 0, -0.15);
      s.P.lamp.position.set(-0.2, 2.45, 0.1);
      const c = s.P.clock; c.position.set(0.85, 1.75, -0.6); c.userData.mh.rotation.z = -lt * 6; c.userData.hh.rotation.z = -lt * 0.5;
      setStack(s.P.stack, 12 + (Math.floor(lt * 2.5) % 20), -0.28, 0.77, 0.45, 0.013, 32);
      const sw = Math.sin(lt * 9) * 0.06; h.reach('R', V(0.15 + sw, 0.85, 0.48)); h.reach('L', V(-0.25, 0.86, 0.48));
      h.face({ lid: lerp(0.3, 0.75, k(lt, 0.5, 3)), brow: -0.5, look: [0, -0.6], mouth: 'flat' }); h.head.rotation.x = 0.2; h.head.rotation.z = Math.sin(lt * 2) * 0.08;
    } },
  // 9) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.75, show: ['heap'], hud: ['もらった額', '1億2千万円'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 4.4], p1: [0.1, 1.48, 3.9], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'tension_anxiety', -12], [0.4, 'comic_surprise', -11]],
    stamps: [{ t: 0.4, text: '!?', x: 760, y: 700, rot: 10, color: RED, size: 120, dur: 1.0 }],
    act(lt, s) {
      const h = s.hero.userData; s.P.heap.position.set(0.75, 0, -0.6); s.P.heap.scale.setScalar(0.8); s.hero.position.set(-0.4, 0, 0.3);
      h.face(lt > 0.35 ? { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 } : { lid: 0.2, look: [0.6, 0], mouth: 'smile' });
      if (lt > 0.35) { h.arm('L', 0.3, 0.5, 1.9); h.arm('R', 0.3, 0.5, 1.9); }
    } },
  // 10) the floor gives way
  { sc: 'st', say: ['floor', 'floor2'], pal: ['#c98a5b', '#e8c9a0', '#7a4a2a'], show: ['heap', 'hole', 'lamp'], hud: ['家の床', '180kg/㎡'], hudColor: RED,
    cam: { p0: [0.1, 1.6, 4.6], p1: [0.1, 1.55, 4.3], l0: [0.1, 1.0, 0] },
    sfx: [[0.3, 'tension_anxiety', -16], [F2 - 0.05, 'collapse', -8], [F2, 'impact_doon', -9], [F2 + 0.2, 'comic_fall', -12]],
    shake: [[F2, 0.08, 0.9]], lines: [[F2, 0.7]],
    stamps: [{ t: F2, text: 'バキィッ!!', x: 640, y: 1150, rot: -8, color: YEL, size: 116, dur: 1.1 }],
    tags(lt) { const p = scr(V(0.6, 0.8, -0.5), 0, -230); return lt > 1.3 && lt < F2 ? [{ t: 1.3, text: '123トン', x: p[0], y: p[1], h: 92, bg: '#ffffff' }] : []; },
    note: '住宅の居室の床：1,800N/㎡（建築基準法施行令85条）',
    act(lt, s) {
      const h = s.hero.userData, t0 = this.lt.floor2 + 0.4, f = k(lt, t0, t0 + 0.7);
      s.P.lamp.position.set(-0.6, 2.6, -0.5);
      s.P.hole.position.set(0.6, 0, -0.5); s.P.hole.scale.setScalar(f > 0 ? 1.1 : 0.001);
      s.P.heap.position.set(0.6, -f * f * 1.6, -0.5); s.P.heap.scale.setScalar(0.7);
      s.hero.position.set(-0.3, 0, 0.2); s.hero.rotation.y = 0.35;
      if (f > 0) { s.hero.userData.body.position.y = Math.sin(k(lt, t0, t0 + 0.5) * Math.PI) * 0.3; h.arm('L', 0.4, 1.6, 0.4); h.arm('R', 0.4, 1.6, 0.4); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, -0.5], mouth: 'o', open: 1.3 }); }
      else { h.reach('R', V(0.0, 1.2, 0.4)); h.hand('R', 'pa'); h.arm('L', 0.1, 0.2, 0.2); h.face({ lid: 0.3, brow: -0.6, look: [0.8, -0.2], mouth: 'flat' }); }
    } },
  // 11) shop: max 20 coins
  { sc: 'st', say: ['shop'], pal: ['#ffffff', '#f2f2f2', '#35d0ff'], show: ['counter', 'stack'], hero2: true, hud: ['お店で使える', '20枚まで'], hudColor: RED,
    cam: { p0: [0.1, 1.55, 4.6], p1: [0.1, 1.52, 4.3], l0: [0.1, 1.2, 0] },
    sfx: [[0.3, 'coin_toss', -13], [1.2, 'coin_toss', -14], [2.3, 'comic_tsukkomi', -10]],
    tags(lt) {
      const n = Math.min(21, 1 + Math.floor(lt / 0.12)), p = scr(V(-0.1, 1.0, -0.2), 0, -200), out = [{ text: `${n}枚目`, x: p[0], y: p[1], h: 70, bg: n > 20 ? RED : '#ffffff', fg: n > 20 ? '#ffffff' : undefined }];
      if (lt > 2.4) { const q = scr(headPos(S.hero2), 0, -270); out.push({ t: 2.4, text: '21枚目からは断れます', x: q[0], y: q[1], h: 64, bg: YEL }); }
      return out;
    },
    note: '通貨法：同じ硬貨は1回20枚まで（試算の前提）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, n = Math.min(21, 1 + Math.floor(lt / 0.12));
      s.P.counter.position.set(0.15, 0, -0.45); s.hero2.position.set(0.62, 0, -1.25); s.hero2.rotation.y = -0.2;
      s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.3;
      setStack(s.P.stack, Math.min(n, 32), -0.1, 0.93, -0.2, 0.013, 32);
      h.reach('R', V(-0.15, 1.0 + Math.abs(Math.sin(lt * 12)) * 0.05, -0.05)); h.arm('L', 0.1, 0.2, 0.2);
      if (lt > 2.3) { h2.reach('L', V(0.35, 1.45, -0.6)); h2.hand('L', 'pa'); h2.face({ lid: 0.4, brow: -0.6, look: [-0.6, 0], mouth: 'flat' }); h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 0.9 }); }
      else { h2.face({ lid: 0.2, look: [-0.5, -0.4], mouth: 'smile' }); h.face({ lid: 0.25, look: [0.4, -0.5], mouth: 'smile' }); }
    } },
  // 12) 6.16 million shopping trips
  { sc: 'st', say: ['shop2'], pal: ['#9fd4ff', '#eef6ff', '#ffffff'], show: ['bag', 'clock'], hud: ['お店で使える', '20枚まで'], hudColor: RED,
    cam: { p0: [0.1, 1.45, 4.1], p1: [0.1, 1.42, 3.8], l0: [0.05, 1.3, 0] },
    sfx: [[0.3, 'giant_step', -16], [0.8, 'giant_step', -16], [1.6, 'text_pa', -11], [2.4, 'comic_fall', -13]],
    tags(lt) { const t0 = this.lt.shop2 + 1.4; return lt > t0 ? [{ t: t0, text: '616万回', x: 540, y: 520, h: 120, bg: YEL }, { t: t0 + 0.5, text: '1日10回でも1,688年', x: 540, y: 670, h: 68, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData, w = Math.sin(lt * 8); s.hero.position.set(-0.1, 0, 0.1); s.hero.rotation.y = 0.15; s.hero.userData.body.position.y = Math.abs(w) * 0.04;
      const gp = V(0.42, 0.62 + Math.abs(w) * 0.03, 0.15); h.reach('R', gp.clone().add(V(0, 0.3, 0))); s.P.bag.position.copy(gp);
      const c = s.P.clock; c.position.set(-0.85, 1.85, -0.5); c.userData.mh.rotation.z = -lt * 8; c.userData.hh.rotation.z = -lt;
      h.arm('L', 0.1, 0.4, 0.3); h.face({ lid: lerp(0.3, 0.85, k(lt, 0.5, 3)), brow: -0.8, look: [0, -0.4], mouth: 'flat' }); h.head.rotation.x = 0.15 * k(lt, 1, 3);
    } },
  // 13) bank: fee 135.5 million, 12.3 million in the red
  { sc: 'st', say: ['bank', 'bank2'], pal: ['#5a7fa8', '#dfe8f2', '#ffd23a'], show: ['counter', 'heap', 'bill'], hero2: true, hud: ['手数料', '1億3,553万円'], hudColor: RED,
    cam: { p0: [0.1, 1.55, 4.7], p1: [0.1, 1.5, 4.3], l0: [0.1, 1.25, 0] },
    sfx: [[1.2, 'countdown_elec', -18, 1.6], [2.9, 'impact_don', -10], [4.1, 'comic_shock2', -10]],
    tags(lt) {
      const t0 = this.lt.bank + 1.2, v = Math.round(135531000 * ease(k(lt, t0, t0 + 1.6)) / 1000) * 1000, out = [];
      if (lt > t0) out.push({ t: t0, text: `手数料 ${yen(v)}円`, x: 540, y: 520, h: 84, bg: '#ffffff' });
      if (lt > this.lt.bank2) out.push({ t: this.lt.bank2, text: '−1,232万円', x: 540, y: 660, h: 112, bg: RED, fg: '#ffffff' });
      return out;
    },
    note: 'ゆうちょ銀行 窓口の硬貨料金（2024年4月〜）で試算',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, late = lt > this.lt.bank2;
      s.P.counter.position.set(0.2, 0, -0.55); s.P.heap.position.set(0.15, 0.93, -0.55); s.P.heap.scale.set(0.3, 0.3, 0.22);
      s.hero2.position.set(0.62, 0, -1.35); s.hero2.rotation.y = -0.2; s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.3;
      h2.reach('L', V(0.45, 1.25, -0.8)); h2.face({ lid: 0.25, look: [-0.6, 0], mouth: 'smile' });
      const b = s.P.bill, f = k(lt, this.lt.bank2, this.lt.bank2 + 1.2);
      b.position.set(-0.3 + f * 1.4, 1.35 + f * 1.3 + Math.sin(lt * 8) * 0.05, 0.6); b.rotation.set(f * 3, f * 2, Math.sin(lt * 10) * 0.4); b.visible = f < 1;
      if (late) { h.arm('L', 0.4, 0.5, 1.9); h.arm('R', 0.4, 0.5, 1.9); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.3 }); }
      else { h.reach('R', V(-0.15, 1.05, 0.05)); h.hand('R', 'pa'); h.arm('L', 0.1, 0.2, 0.2); h.face({ lid: 0.2, look: [0.6, 0.1], mouth: 'smile' }); }
    } },
  // 14) gift tax: half disappears
  { sc: 'st', say: ['tax'], pal: ['#3b3f6b', '#4b4f80', RED], dim: 0.9, show: ['heap'], hud: ['贈与税', '約6,076万円'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 4.6], p1: [0.1, 1.48, 4.3], l0: [0.1, 1.2, 0] },
    sfx: [[0.8, 'vanish_hyun', -10], [1.8, 'text_pa', -11], [2.5, 'comic_fall', -12]],
    stamps: [{ t: 0.9, text: 'スーッ…', x: 720, y: 760, rot: 8, color: '#ffffff', size: 88, dur: 1.4 }],
    tags(lt) { return lt > 1.8 ? [{ t: 1.8, text: '約49%が税金に', x: 540, y: 520, h: 96, bg: YEL }] : []; },
    note: '贈与税：一般税率・基礎控除110万円で試算',
    act(lt, s) {
      const h = s.hero.userData, f = ease(k(lt, 0.8, 2.0)), sc = lerp(0.85, 0.85 * 0.79, f);
      s.P.heap.position.set(0.55, 0, -0.4); s.P.heap.scale.setScalar(sc);
      // coins floating away upward
      const m = S.P.rain, r = rng(2); m.visible = lt > 0.8;
      for (let i = 0; i < 260; i++) { const a = r() * 6.28, rad = Math.sqrt(r()) * 1.1, d = r() * 1.2, u = lt - 0.8 - d;
        if (i > 90 || u < 0 || u > 1.4) DM.position.set(0, -50, 0); else { DM.position.set(0.55 + Math.cos(a) * rad, 0.5 + u * 2.2, -0.4 + Math.sin(a) * rad * 0.6); DM.rotation.set(u * 5, a, u * 3); DM.scale.setScalar(1 - u / 1.4); }
        DM.updateMatrix(); m.setMatrixAt(i, DM.matrix); }
      m.instanceMatrix.needsUpdate = true;
      s.hero.position.set(-0.35, 0, 0.2); s.hero.rotation.y = 0.35; h.reach('R', V(0.1, 1.35 + Math.sin(lt * 5) * 0.08, 0.15)); h.hand('R', 'pa'); h.arm('L', 0.1, 0.3, 0.3);
      h.face({ lid: 0.1, brow: -1, look: [0.7, 0.5], mouth: 'o', open: 0.7 });
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['coin'], hud: ['もらった額', '1億2千万円'],
    cam: { p0: [0, 1.5, 4.2], p1: [0, 1.5, 3.9], l0: [0, 1.36, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.2, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.1);
      holdCoin(h, 'R', V(0.38, 1.3 + Math.sin(lt * 3) * 0.02, 0.45)); s.P.coin.rotation.set(0, Math.sin(lt * 2) * 0.3, 0);
      h.arm('L', 0.05, 0.15, 0.2); h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0], mouth: 'smile' }); h.head.rotation.set(0, 0.1, Math.sin(lt * 1.6) * 0.08);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも日本人全員が', '[1円]ずつくれたら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['もらった額', '1億2千万円'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
