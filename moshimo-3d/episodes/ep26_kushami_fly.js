// ep26_kushami_fly (pop スタイル): もしも、くしゃみで空を飛べたら？  arm B（逆転の応用）
// 台本・数字・ネタ・キャラ(もしもくん)は自作。構成の型だけ sp_geppu2x に合わせる（冒頭フック→タイトル→小ネタ→落とし穴→問いかけ）。
// 前提（試算）: くしゃみの最大速度 4.5 m/s（Tang ら 2013, PLOS ONE）/ 1回に出る空気 1.5 L（仮定）× 空気 1.2 g/L = 1.8 g
//   1回の運動量 = 1.8e-3 kg × 4.5 m/s = 8.1e-3 N·s → 重さ0.83 g を1秒浮かせる（÷9.8）≒ 1円玉(1g)を約1秒
//   おにぎり100 g ÷ 0.83 ≒ 121人 / 体重50 kg ÷ 0.83 g ≒ 6.05万回/秒（＝6万人が一斉に）
//   日本 1.23億人(総務省 2025) × 0.83 g = 102 t ≒ 電車3両（1両 約30 t の目安）/ 世界 82億人 → 6,780 t ≒ 大型旅客機(最大離陸重量 約400 t) 17機
//   6万回/秒 × 1.5 L = 90.7 m³/s → 6畳(2.73×3.64×2.4 m = 23.8 m³) が 0.26 秒 / ふだんの呼吸 0.5 L×15回/分 の 72.6万倍
//   空気を吸って噴く推進は、噴く速さ以上には進めない → 最高 4.5 m/s = 時速16 km
import { run, THREE, V, clamp, ease, lerp, rng } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep26_kushami_fly.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
const SKY = ['#8fd3ff', '#eef6ff', '#ffffff'], ORA = ['#ff9f5a', '#fbe9d0', '#3f6fd8'];
let S;
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 300, 1450)]; };
const G = () => new THREE.Group();
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));

// ---------- effects ----------
function puffSet(n = 12) {
  const g = G(); g.userData.items = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0, depthWrite: false })); g.add(m); g.userData.items.push(m); }
  return g;
}
const PR = rng(7), PJ = Array.from({ length: 40 }, () => [PR() - 0.5, PR() - 0.5, PR() - 0.5, PR()]);
// sneeze cloud: from pos along dir. o: {speed, life, size, spread, gap, inward}
function puff(g, pos, dir, t, o = {}) {
  const sp = o.speed ?? 2.5, life = o.life ?? 0.9, sz = o.size ?? 0.12, spr = o.spread ?? 0.5, gap = o.gap ?? 0.02, d = dir.clone().normalize();
  g.visible = true; g.position.set(0, 0, 0);
  g.userData.items.forEach((m, i) => {
    const u = t - i * gap; m.visible = u > 0 && u < life; if (!m.visible) return;
    const j = PJ[i % PJ.length], w = o.inward ? 1 - u / life : u, dist = sp * w * (0.55 + 0.45 * j[3]);
    m.position.copy(pos).addScaledVector(d, dist).add(V(j[0], j[1], j[2]).multiplyScalar(spr * dist));
    m.scale.setScalar(sz * (0.5 + (o.inward ? (1 - w) * 0.6 + 0.4 : w * 2.2)) * (0.7 + 0.6 * j[3]));
    m.material.opacity = (o.inward ? Math.sin(Math.PI * u / life) : 1 - u / life) * 0.85;
  });
}
const mouthPos = (who) => { who.updateMatrixWorld(true); return who.userData.head.localToWorld(V(0, -0.2, 0.45)); };
// sneeze pose: "ハ…ハ…" before t0, "クション" for 0.35 s after t0. down: head bends down (for flying)
function sneeze(who, lt, t0, o = {}) {
  const h = who.userData;
  if (lt < t0) { const a = k(lt, t0 - 0.6, t0); h.head.rotation.x = -0.32 * a; h.face({ lid: 0.3 + 0.4 * a, brow: -0.4, mouth: 'o', open: 0.3 + 0.5 * a, look: [0, 0.4] }); return false; }
  if (lt < t0 + (o.dur ?? 0.35)) { h.head.rotation.x = o.down ? 0.55 : 0.32; h.body.rotation.x = 0.12; h.face({ lid: 1, brow: -0.6, mouth: 'o', open: 1.4 }); return true; }
  return false;
}
function makeJet() {
  const j = G(), f = caps(0.17, 1.1, '#ffffff', 0, 0, 0, j); f.rotation.z = Math.PI / 2;
  rbox(0.34, 0.04, 1.5, 0.02, '#35a7ff', 0.05, -0.04, 0, j); rbox(0.22, 0.04, 0.6, 0.02, '#35a7ff', 0.6, 0.02, 0, j); rbox(0.26, 0.34, 0.04, 0.02, '#35a7ff', 0.62, 0.2, 0, j);
  for (const z of [-0.42, 0.42]) { const e = cyl(0.075, 0.075, 0.3, '#9aa3ad', -0.02, -0.14, z, j); e.rotation.z = Math.PI / 2; }
  for (let i = 0; i < 6; i++) sph(0.035, M('#2c3b6b', 0.3), -0.42 + i * 0.16, 0.07, 0.165, j);
  return j;
}
function makeBike() {
  const b = G();
  for (const x of [-0.36, 0.36]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 32), M('#23262f')); w.position.set(x, 0.26, 0); b.add(w); sph(0.04, '#9aa3ad', x, 0.26, 0, b); }
  const bar = (x0, y0, x1, y1) => { const l = Math.hypot(x1 - x0, y1 - y0), c = cyl(0.025, 0.025, l, '#e2463c', (x0 + x1) / 2, (y0 + y1) / 2, 0, b); c.rotation.z = Math.atan2(x0 - x1, y1 - y0); };
  bar(-0.36, 0.26, -0.05, 0.62); bar(-0.05, 0.62, 0.3, 0.62); bar(-0.05, 0.62, 0.02, 0.28); bar(0.02, 0.28, 0.36, 0.26); bar(0.3, 0.62, 0.36, 0.26); bar(0.3, 0.62, 0.32, 0.78);
  rbox(0.18, 0.05, 0.1, 0.02, '#23262f', -0.08, 0.66, 0, b); const hb = cyl(0.02, 0.02, 0.36, '#9aa3ad', 0.32, 0.8, 0, b); hb.rotation.x = Math.PI / 2;
  return b;
}
function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  reg('puff', puffSet(14)); reg('puff2', puffSet(10));
  { const m = puffSet(16); reg('mpuff', m); }
  { const c = G(); const d = cyl(0.11, 0.11, 0.014, M('#dfe3e8', 0.25), 0, 0, 0, c); d.rotation.x = Math.PI / 2; cyl(0.085, 0.085, 0.016, M('#c9ced6', 0.35), 0, 0, 0, c).rotation.x = Math.PI / 2;
    sph(0.03, '#b9c0c9', 0, 0, 0.008, c, 1, 1, 0.2); reg('coin', c); }
  { const o = G(); sph(0.14, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.17, 0.14, 0.2, 0.03, '#20301f', 0, -0.06, 0, o); reg('oni', o); }
  { const b = G(); cyl(0.13, 0.13, 0.5, M('#bfe6ff', 0.15), 0, 0.25, 0, b); cyl(0.135, 0.135, 0.14, '#3fae5b', 0, 0.28, 0, b); cyl(0.13, 0.06, 0.08, M('#bfe6ff', 0.15), 0, 0.54, 0, b); cyl(0.05, 0.05, 0.07, '#ffffff', 0, 0.61, 0, b); reg('pet', b); }
  { const t = G(); t.userData.items = [];
    for (let i = 0; i < 3; i++) { const c = G(); rbox(1.12, 0.46, 0.46, 0.08, '#f2f4f7', 0, 0.36, 0, c); rbox(1.13, 0.06, 0.47, 0.02, '#3fae5b', 0, 0.25, 0, c);
      for (let w = 0; w < 4; w++) rbox(0.18, 0.14, 0.02, 0.03, '#6fb7ff', -0.39 + w * 0.26, 0.45, 0.235, c);
      for (const x of [-0.36, 0.36]) { const wh = cyl(0.07, 0.07, 0.5, '#23262f', x, 0.1, 0, c); wh.rotation.x = Math.PI / 2; }
      c.position.set((i - 1) * 1.18, 0, 0); t.add(c); t.userData.items.push(c); }
    t.position.set(0, 0, -1.1); reg('cars', t); }
  { const j = G(); j.userData.items = []; for (let i = 0; i < 3; i++) { const p = makeJet(); p.scale.setScalar(0.7); j.add(p); j.userData.items.push(p); } reg('jets', j); }
  reg('bike', makeBike());
  { const p = G(); cyl(0.07, 0.08, 3.2, '#9aa3ad', 0, 1.6, 0, p); rbox(0.5, 0.05, 0.05, 0.02, '#7a828c', 0, 2.9, 0, p); reg('pole', p); }
  { const c = G(), r = rng(3); c.userData.items = [];
    for (let i = 0; i < 12; i++) { const cl = G(); for (const [dx, s] of [[-0.22, 0.18], [0, 0.26], [0.24, 0.19]]) sph(s, M('#ffffff', 0.95), dx, 0, 0, cl, 1, 0.75, 0.7);
      const side = i % 2 ? 1 : -1; cl.position.set(side * (0.9 + r() * 0.8), 1.2 + i * 0.75, -0.6 - r() * 1.2); cl.scale.setScalar(0.9 + r() * 0.8); c.add(cl); c.userData.items.push(cl); }
    reg('clouds', c); }
}
const flyPose = (h, sw = 0) => { h.arm('L', -0.5, 0.55 + sw, 0.1); h.arm('R', -0.5, 0.55 + sw, 0.1); };
const setCam = (s, p, l) => { s.camera.position.set(...p); s.camera.lookAt(V(...l)); s.camera.updateMatrixWorld(true); };
// crowd members sneeze toward dir
function crowdSneeze(s, t, dir) {
  const items = s.P.crowd.userData.items, m = s.P.mpuff; m.visible = true;
  m.userData.items.forEach((p, i) => {
    const c = items[i % items.length], u = t - (i % 5) * 0.03; p.visible = u > 0 && u < 0.9; if (!p.visible) return;
    const base = c.position.clone().add(V(0, 0.86 * c.scale.y, 0.18)).add(s.P.crowd.position);
    p.position.copy(base).addScaledVector(dir, u * 1.3); p.scale.setScalar(0.07 + u * 0.18); p.material.opacity = (1 - u / 0.9) * 0.8;
  });
  items.forEach((c, i) => { c.rotation.x = t > 0 && t < 0.35 ? 0.18 : (t < 0 ? -0.12 * clamp(1 + t / 0.5) : 0); });
}

const HOP = 7; // cold-open flight height
const plan = [
  // 0) cold open (flash-forward of #6): one sneeze launches him through the clouds, then push in on his smug face
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: SKY, show: ['clouds'],
    shake: [[0.3, 0.08, 0.6]], lines: [[0.3, 1.0]],
    sfx: [[0.3, 'impact_don', -8], [0.32, 'whoosh_gust', -7], [0.62, 'whoosh_slide', -10], [1.7, 'whoosh_slide', -14], [2.55, 'text_pa', -11]],
    stamps: [{ t: 0.3, text: 'ハックション!!', x: 500, y: 1240, rot: -6, color: YEL, size: 112, dur: 0.95 },
      { t: 0.85, text: 'ビューン', x: 760, y: 560, rot: 10, color: '#ffffff', size: 84, dur: 0.7 },
      { t: 2.55, text: 'ズビッ', x: 760, y: 1240, rot: 8, color: '#ffffff', size: 80, dur: 0.6 }],
    act(lt, s) {
      const h = s.hero.userData, u = k(lt, 0.3, 1.4), y = HOP * (1 - Math.pow(1 - u, 3)) + (lt > 1.4 ? Math.sin(lt * 3) * 0.04 : 0);
      s.hero.position.set(0, y, 0.2);
      const yc = HOP * (1 - Math.pow(1 - k(lt, 0.3, 1.5), 3)), z = ease(k(lt, 1.6, 2.3));
      setCam(s, [0, yc + lerp(1.7, 1.5, z), lerp(6.2, 2.9, z)], [0, yc + lerp(1.35, 1.45, z), 0.2]);
      const on = sneeze(s.hero, lt, 0.3, { down: true, dur: 0.45 });
      if (lt > 0.3) puff(s.P.puff, lt < 0.75 ? mouthPos(s.hero) : V(0, HOP * (1 - Math.pow(1 - k(0.75, 0.3, 1.4), 3)) + 1.0, 0.6), V(0, -1, 0.25), lt - 0.3, { speed: 3.2, life: 1.0, size: 0.16, spread: 0.6 });
      if (lt > 0.3 && lt < 1.6) flyPose(h, Math.sin(lt * 20) * 0.1);
      if (!on && lt > 0.75 && lt < 1.6) { h.face({ lid: 0, browY: 1, look: [0, 0.8], mouth: 'o', open: 0.6 }); }
      if (lt >= 1.6) {
        const zb = lt > 2.55 && lt < 2.85;
        h.face({ lid: zb ? 0.7 : 0.35, brow: 0.35, look: [0, 0], mouth: zb ? 'flat' : 'smile' }); h.head.rotation.z = 0.08; if (zb) h.head.rotation.x = -0.12;
        h.arm('L', 0.2, 0.25, 0.4); h.reach('R', V(0.3, y + 1.0, 0.6));
        if (lt > 2.55) puff(s.P.puff2, s.hero.userData.head.localToWorld(V(0, -0.07, 0.42)), V(0.3, -0.3, 1), lt - 2.55, { speed: 0.4, life: 0.5, size: 0.04, spread: 0.3 });
      }
    } },
  // 1) title: itchy nose
  { sc: 'st', say: ['hook'], pal: ORA,
    cam: { p0: [0.1, 1.5, 4.1], p1: [0.1, 1.48, 3.7], l0: [0.05, 1.42, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.4, 'text_pa', -10]],
    tags: [{ t: 1.4, text: '鼻がムズムズ…', x: 680, y: 1180, h: 72, bg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.1);
      h.reach('R', V(0.02, 1.36, 0.55)); h.arm('L', 0.05, 0.2, 0.3); h.head.rotation.x = -0.18 + Math.sin(lt * 9) * 0.03;
      h.face({ lid: 0.55, brow: -0.5, mouth: 'o', open: 0.4, look: [0, 0.5] });
    } },
  // 2) speed: 4.5 m/s, about a bicycle
  { sc: 'st', say: ['speed'], pre: 0.6, pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['puff', 'bike'], hero2: true, hud: ['くしゃみ', '秒速4.5m'],
    cam: { p0: [0.15, 1.55, 5.4], p1: [0.2, 1.55, 5.2], l0: [0.15, 1.4, 0] },
    sfx: [[0.3, 'whoosh_gust', -10], [0.32, 'comic_pico', -13], [1.2, 'text_pa', -11]],
    stamps: [{ t: 0.3, text: 'ハクション!', x: 300, y: 1120, rot: -8, color: YEL, size: 96, dur: 0.9 }],
    tags(lt) { if (lt < 1.2) return []; const p = scr(S.P.bike.position.clone().add(V(0, 1.75, 0)), 0, 0); return [{ t: 1.2, text: '秒速4.5m ≒ 時速16km', x: p[0], y: p[1] - 120, h: 70, bg: '#ffffff' }]; },
    note: 'Tangら（2013年）の測定：最大 秒速4.5m',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, f = Math.max(0, lt - 0.3), bx = 0.15 + f * 0.45;
      s.hero.position.set(-0.6, 0, 0.2); s.hero.rotation.y = 1.0;
      s.P.bike.position.set(bx, 0, -0.5); s.hero2.position.set(bx - 0.08, 0.36, -0.5); s.hero2.rotation.y = Math.PI / 2;
      h2.reach('L', V(bx + 0.3, 0.86, -0.32)); h2.reach('R', V(bx + 0.3, 0.86, -0.68)); h2.face({ lid: 0.2, mouth: 'smile', look: [-0.5, 0] });
      sneeze(s.hero, lt, 0.3);
      if (lt > 0.65) { h.face({ lid: 0.15, browY: 0.6, look: [0.7, 0], mouth: 'smile' }); h.reach('R', V(-0.3, 1.2, 0.6)); }
      puff(s.P.puff, mouthPos(s.hero), V(1, -0.05, 0), f, { speed: 1.6, life: 3, size: 0.09, spread: 0.35, gap: 0.04 });
    } },
  // 3) air: 1.5 L, a big plastic bottle
  { sc: 'st', say: ['air'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['pet'],
    cam: { p0: [0.1, 1.55, 4.4], p1: [0.1, 1.55, 4.2], l0: [0.1, 1.45, 0] },
    sfx: [[0.6, 'text_pa', -11], [2.4, 'comic_pico', -13]],
    cards: [{ t: 0.6, text: '1回の空気 ≒ [1.5L]', y: 480, size: 64, border: CY, sub: '大きいペットボトル1本分' }],
    note: '試算の前提：くしゃみ1回の空気＝1.5L',
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.2, 0.7)); s.hero.position.set(-0.25, 0, 0.1); s.hero.rotation.y = 0.2;
      const b = s.P.pet; b.position.set(lerp(0.6, 0.2, a), lerp(0, 0.82, a), lerp(-0.1, 0.45, a)); b.rotation.z = -0.15 * a;
      h.reach('R', V(b.position.x + 0.06, b.position.y + 0.3, b.position.z + 0.05)); h.reach('L', V(b.position.x - 0.14, b.position.y + 0.22, b.position.z + 0.08));
      h.face(lt > 2.4 ? { lid: 0.1, browY: 1, mouth: 'o', open: 0.6, look: [0.5, -0.3] } : { lid: 0.25, brow: 0.3, mouth: 'smile', look: [0.3, 0] });
    } },
  // 4) one sneeze floats a 1-yen coin for 1 second
  { sc: 'st', say: ['coin'], pre: 0.6, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['coin', 'puff'],
    cam: { p0: [0.1, 1.6, 4.1], p1: [0.1, 1.6, 3.9], l0: [0.1, 1.5, 0] },
    sfx: [[0.35, 'whoosh_gust', -12], [0.4, 'comic_boyon', -12], [1.45, 'comic_fall', -15], [1.6, 'text_pa', -11]],
    stamps: [{ t: 0.35, text: 'クシュン', x: 300, y: 1130, rot: -8, color: '#ffffff', size: 84, dur: 0.8 }],
    tags(lt) { if (lt < 0.5) return []; const p = scr(s0().P.coin.position, 0, -110); return [{ t: 0.5, text: '1円玉（1g）', x: p[0], y: p[1], h: 64, bg: '#ffffff' }]; },
    cards: [{ t: 1.6, text: '[1回]で 1gを [1秒]', y: 480, size: 64, border: YEL }],
    note: '空気1.8g×秒速4.5m÷重力 で計算（試算）',
    act(lt, s) {
      const h = s.hero.userData, c = s.P.coin, f = k(lt, 0.4, 0.7), dn = k(lt, 1.4, 1.65);
      s.hero.position.set(-0.2, 0, 0.1); h.hand('L', 'pa');
      const palm = V(0.42, 1.0, 0.45); h.reach('L', palm.clone().add(V(-0.04, -0.06, 0)));
      c.position.copy(palm).add(V(0, 0.03 + 0.45 * (ease(f) * (1 - dn * dn)) + (f >= 1 && dn === 0 ? Math.sin(lt * 6) * 0.02 : 0), 0)); c.rotation.set(-0.5, lt * 6 * (dn < 1 ? 1 : 0), 0);
      if (!sneeze(s.hero, lt, 0.35, { down: true })) { if (lt > 0.7) h.face({ lid: 0, browY: 1, look: [0.5, 0.6], mouth: 'o', open: 0.5 }); }
      if (lt > 0.35) puff(s.P.puff, mouthPos(s.hero), V(0.3, -1, 0.2), lt - 0.35, { speed: 0.8, life: 0.7, size: 0.06, spread: 0.6 });
      h.arm('R', 0.1, 0.2, 0.3);
    } },
  // 5) 120 people at once float one rice ball
  { sc: 'st', say: ['oni'], pal: ['#8fd9a8', '#dff3e4', '#ffffff'], show: ['crowd', 'oni', 'mpuff'],
    cam: { p0: [0, 1.65, 5.2], p1: [0, 1.65, 5.0], l0: [0, 1.5, -0.3] },
    sfx: [[0.3, 'whoosh_gust', -10], [this0(0.3), 'impact_don', -13], [2.0, 'comic_boyon', -12], [2.3, 'text_pa', -11]],
    stamps: [{ t: 1.2, text: 'ハクション!!', x: 500, y: 720, rot: -5, color: YEL, size: 104, dur: 0.9 }],
    tags: [{ t: 0.3, text: '×120人', x: 800, y: 1080, h: 84, bg: CY }],
    cards: [{ t: 2.3, text: 'おにぎり [100g]', y: 480, size: 64, border: CY }],
    note: '1回で1gを1秒 → 100gは約120人（試算）',
    act(lt, s) {
      const h = s.hero.userData, o = s.P.oni, f = ease(k(lt, 1.3, 2.0));
      crowdSneeze(s, lt - 1.2, V(0.2, 0.4, 1).normalize());
      s.hero.position.set(-0.6, 0, 0.5); s.hero.rotation.y = 0.5;
      o.position.set(0.45, 0.9 + f * 0.6 + Math.sin(lt * 4) * 0.02 * f, 0.55); o.rotation.y = Math.sin(lt * 2) * 0.3;
      if (lt > 1.6) { h.reach('R', V(0.0, 1.85, 0.65)); h.face({ lid: 0.1, browY: 1, look: [0.8, 0.6], mouth: 'smile' }); } else h.face({ lid: 0.3, look: [0.6, 0], mouth: 'flat' });
    } },
  // 6) you need 60,000 a second (the cold-open flight, in place)
  { sc: 'st', say: ['you'], pre: 0.3, pal: SKY, show: ['clouds', 'puff'], hud: ['くしゃみ', '1秒に6万回'], hudColor: YEL,
    cam: { p0: [0, 1.6, 4.8], p1: [0, 2.4, 4.8], l0: [0, 1.3, 0], l1: [0, 2.3, 0], hold: 0.3, dur: 1.8 }, shake: [[0.3, 0.05, 0.6]],
    sfx: [[0.3, 'whoosh_gust', -8], [0.35, 'countdown_tick', -14, 1.2], [1.6, 'text_pa', -11]],
    stamps: [{ t: 0.3, text: 'ハクハクハクハク!!', x: 500, y: 1300, rot: -5, color: YEL, size: 88, dur: 1.2 }],
    tags(lt) { const n = Math.round(60000 * ease(k(lt, 0.3, 1.5))); return [{ text: `${n.toLocaleString('en-US')}回 / 秒`, x: 500, y: 470, h: 96, bg: '#ffffff' }]; },
    note: '体重50kgとして試算',
    act(lt, s) {
      const h = s.hero.userData, u = ease(k(lt, 0.35, 1.6)), y = 1.0 * u + Math.sin(lt * 3) * 0.03 * u;
      s.hero.position.set(0, y, 0.2); s.P.clouds.position.y = -2.6 * u;
      if (lt > 0.3) { h.head.rotation.x = 0.5 + Math.sin(lt * 60) * 0.06; h.face({ lid: 1, brow: -0.5, mouth: 'o', open: 1.2 + Math.sin(lt * 60) * 0.3 }); flyPose(h, Math.sin(lt * 25) * 0.1);
        puff(s.P.puff, mouthPos(s.hero), V(0, -1, 0.3), ((lt - 0.3) % 0.5), { speed: 2.5, life: 0.5, size: 0.09, spread: 0.55, gap: 0.03 }); }
      else sneeze(s.hero, lt, 0.3);
    } },
  // 7) a full stadium of 60,000 lifts one person
  { sc: 'st', say: ['stadium'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['crowd', 'mpuff'], hud: ['くしゃみ', '6万人で1人'], hudColor: YEL,
    cam: { p0: [0, 1.75, 5.2], p1: [0, 1.75, 5.0], l0: [0, 1.6, -0.3] },
    sfx: [[0.15, 'whoosh_gust', -10], [0.4, 'comic_boyon', -12], [1.6, 'text_pa', -11]],
    stamps: [{ t: 0.15, text: 'ハクション!!', x: 500, y: 1310, rot: -5, color: '#ffffff', size: 96, dur: 0.8 }],
    cards: [{ t: 1.6, text: '[6万人] → [1人]', y: 480, size: 70, border: YEL, sub: '満員のスタジアム ≒ 6万人' }],
    act(lt, s) {
      const h = s.hero.userData, u = ease(k(lt, 0.3, 1.0));
      crowdSneeze(s, (lt - 0.15) % 1.1, V(0, 0.5, 1).normalize());
      s.hero.position.set(0, 0.35 * u + Math.sin(lt * 4) * 0.03, 0.55); h.arm('L', 0.2, 1.3, 0.2); h.arm('R', 0.2, 1.3, 0.2);
      h.face(lt > 1.2 ? { lid: 0.3, brow: 0.4, mouth: 'smile', look: [0, 0] } : { lid: 0, browY: 1, mouth: 'o', open: 0.7, look: [0, 0.4] });
    } },
  // 8) everyone in Japan: three train cars float
  { sc: 'st', say: ['japan'], pre: 0.5, pal: ['#6fb7ff', '#e6f2ff', '#ffffff'], show: ['cars', 'puff', 'puff2'], hero2: true, hud: ['日本人全員', '約100トン'], hudColor: YEL,
    cam: { p0: [0, 1.7, 5.6], p1: [0, 1.7, 5.4], l0: [0, 1.55, -0.5] }, shake: [[0.3, 0.06, 0.6]], lines: [[0.3, 0.9]],
    sfx: [[0.3, 'whoosh_gust', -8], [0.32, 'impact_doon', -11], [1.0, 'comic_boyon', -12], [1.8, 'text_pa', -11]],
    stamps: [{ t: 0.3, text: 'ハクション!!', x: 500, y: 1330, rot: -5, color: YEL, size: 104, dur: 0.9 }],
    cards: [{ t: 1.8, text: '1.2億人 → [約100トン]', y: 480, size: 62, border: YEL, sub: '電車1両 ≒ 30トン（目安）' }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, u = ease(k(lt, 0.45, 1.3));
      s.P.cars.userData.items.forEach((c, i) => { c.position.y = 1.45 * u + Math.sin(lt * 3 + i) * 0.03 * u; c.rotation.z = Math.sin(lt * 2 + i) * 0.03 * u; });
      s.hero.position.set(-0.72, 0, 0.6); s.hero.rotation.y = -0.2; s.hero2.position.set(0.72, 0, 0.6); s.hero2.rotation.y = 0.2;
      for (const [who, g] of [[s.hero, s.P.puff], [s.hero2, s.P.puff2]]) {
        if (!sneeze(who, lt, 0.3)) if (lt > 0.65) { who.userData.face({ lid: 0, browY: 1, look: [0, 0.8], mouth: 'o', open: 0.8 }); who.userData.head.rotation.x = -0.35; }
        if (lt > 0.3) puff(g, mouthPos(who), V(0, 0.6, -1), lt - 0.3, { speed: 1.6, life: 1.0, size: 0.1, spread: 0.6 });
      }
      if (lt > 0.65) { h.arm('L', 0.3, 0.9, 1.4); h.arm('R', 0.3, 0.9, 1.4); h2.arm('L', 0.3, 0.9, 1.4); h2.arm('R', 0.3, 0.9, 1.4); }
    } },
  // 9) the whole world: 6,800 t, 17 jumbo jets
  { sc: 'st', say: ['world'], pal: ['#4f7cff', '#dfe8ff', '#ffd23a'], show: ['jets', 'clouds'], hud: ['世界82億人', '約6800トン'], hudColor: YEL,
    cam: { p0: [0, 1.7, 5.4], p1: [0, 1.7, 5.2], l0: [0, 1.55, -0.4] },
    sfx: [[0.1, 'whoosh_slide', -12], [0.9, 'text_pa', -11], [2.5, 'sparkle', -12]],
    tags: [{ t: 2.4, text: '旅客機 ×17機', x: 720, y: 1150, h: 84, bg: '#ffffff' }],
    cards: [{ t: 0.9, text: '82億人 → [約6800トン]', y: 480, size: 62, border: YEL }],
    note: '大型旅客機の最大離陸重量 ≒ 400トン（目安）',
    act(lt, s) {
      const h = s.hero.userData; s.P.clouds.position.y = -1.6;
      s.P.jets.userData.items.forEach((j, i) => { const x = [-1.1, 0.15, 1.2][i]; j.position.set(x, [2.15, 2.45, 2.05][i] + Math.sin(lt * 2 + i * 2) * 0.05 + (1 - ease(k(lt, 0, 0.8))) * -1.2, -1.0 - i * 0.2); j.rotation.set(0, [0.5, -0.3, 0.4][i], Math.sin(lt * 1.5 + i) * 0.05); });
      s.hero.position.set(0, 0, 0.4); s.hero.rotation.y = Math.sin(lt * 1.5) * 0.3;
      h.arm('L', 0.3, 1.6, 0.3); h.arm('R', 0.3, 1.6, 0.3); h.face({ lid: 0.1, brow: 0.2, mouth: 'smile', look: [0, 0.7] }); h.head.rotation.x = -0.25;
      h.body.position.y = Math.abs(Math.sin(lt * 4)) * 0.06;
    } },
  // 10) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.6], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 11) the room runs out of air in 0.3 s
  { sc: 'st', say: ['room'], pal: ['#3a3f6b', '#545b8c', RED], dim: 0.9, show: ['puff', 'lamp'], hero2: true, hud: ['困ったこと①', '空気'], hudColor: RED,
    cam: { p0: [0.1, 1.6, 4.9], p1: [0.1, 1.6, 4.7], l0: [0.1, 1.5, 0] },
    sfx: [[0.3, 'whoosh_gust', -11], [1.0, 'vanish_hyun', -12], [2.6, 'comic_surprise', -12]],
    stamps: [{ t: 1.0, text: 'スゥーーッ', x: 720, y: 1100, rot: 6, color: '#ffffff', size: 82, dur: 1.4 }],
    tags(lt) { if (lt > 3.3) return []; const pct = Math.round(100 * (1 - ease(k(lt, 1.0, 3.2)))); return [{ text: `部屋の空気 ${pct}%`, x: 500, y: 480, h: 80, bg: pct > 30 ? '#ffffff' : RED, fg: pct > 30 ? '#1b1b1f' : '#ffffff' }]; },
    cards: [{ t: 3.3, text: '[0.3秒]で 空っぽ', y: 480, size: 70, border: RED }],
    note: '6畳×高さ2.4m≒24m³、1回1.5Lで試算',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, gasp = k(lt, 1.4, 2.4);
      s.hero.position.set(-0.6, 0, 0.1); s.hero.rotation.y = 0.35; s.hero2.position.set(0.7, 0, 0.0); s.hero2.rotation.y = -0.35;
      h.head.rotation.x = Math.sin(lt * 40) * 0.12; h.face({ lid: 1, brow: -0.5, mouth: 'o', open: 1.1 }); h.arm('L', 0.4, 0.2, 0.6); h.arm('R', 0.4, 0.2, 0.6);
      if (lt > 0.3) puff(s.P.puff, mouthPos(s.hero), V(-0.6, -0.4, 1), (lt - 0.3) % 0.6, { speed: 1.4, life: 0.6, size: 0.07, spread: 0.5, gap: 0.03 });
      h2.reach('L', headPos(s.hero2).add(V(-0.05, -0.38, 0.25))); h2.arm('R', 0.2, 0.4 + gasp * 0.3, 0.4);
      h2.face(gasp > 0 ? { lid: 0.1, brow: -1, browY: 1, mouth: 'o', open: 0.6 + Math.abs(Math.sin(lt * 9)) * 0.6, look: [-0.6, 0] } : { lid: 0.3, brow: -0.4, mouth: 'flat', look: [-0.7, 0] });
      s.hero2.userData.head.rotation.z = gasp * 0.15;
    } },
  // 12) breathing in 720,000 times normal
  { sc: 'st', say: ['breath'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['puff'], hud: ['困ったこと②', '吸う空気'], hudColor: RED,
    cam: { p0: [0, 1.6, 4.4], p1: [0, 1.6, 4.2], l0: [0, 1.5, 0] },
    sfx: [[0.1, 'vanish_hyun', -11], [1.2, 'text_pa', -11], [1.9, 'comic_boyon', -13]],
    tags: [{ t: 1.2, text: 'ふだんの 72万倍', x: 500, y: 520, h: 100, bg: '#ffffff' }],
    note: 'ふだんの呼吸：1回0.5L×1分15回と比較',
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.1, 1.8));
      s.hero.position.set(0, 0, 0.1); h.body.scale.set(1 + a * 0.22, 1 + a * 0.06, 1 + a * 0.25);
      h.head.rotation.x = -0.2 * a; h.face({ lid: 0.1 + 0.3 * a, brow: -0.3, browY: a, mouth: 'o', open: 0.4 + a * 0.6, look: [0, 0.3] });
      h.arm('L', 0.1, 0.4 + a * 0.4, 0.2); h.arm('R', 0.1, 0.4 + a * 0.4, 0.2);
      puff(s.P.puff, mouthPos(s.hero), V(lt % 1.6 < 0.8 ? 1 : -1, 0.15, 0.1), lt % 0.8, { speed: 1.2, life: 0.8, size: 0.05, spread: 0.5, inward: true, gap: 0.05 });
    } },
  // 13) eyes shut the whole time -> bonk
  { sc: 'st', say: ['eyes'], pal: ['#5ac8a0', '#e6f7ef', '#ffffff'], show: ['pole', 'puff'], hud: ['困ったこと③', '目をつぶる'], hudColor: RED,
    cam: { p0: [0, 1.6, 5.4], p1: [0, 1.6, 5.2], l0: [0, 1.4, 0] }, shake: [[2.0, 0.06, 0.4]],
    sfx: [[0.2, 'whoosh_slide', -12], [2.0, 'impact_don', -9], [2.1, 'comic_fall', -12]],
    stamps: [{ t: 2.0, text: 'ゴンッ!', x: 700, y: 900, rot: 8, color: YEL, size: 110, dur: 1.0 }],
    tags: [{ t: 0.6, end: 1.95, text: '前が見えない…', x: 330, y: 620, h: 72, bg: '#ffffff' }],
    note: 'くしゃみの瞬間は、反射で目を閉じる',
    act(lt, s) {
      const h = s.hero.userData, P0 = s.P.pole; P0.position.set(0.95, 0, -0.1);
      const f = k(lt, 0.2, 2.0), bonk = lt > 2.0, b = k(lt, 2.0, 2.6);
      const x = bonk ? 0.55 - b * 0.35 : lerp(-1.4, 0.55, f), y = bonk ? lerp(0.55, 0.0, b * b) : 0.55 + Math.sin(lt * 6) * 0.05;
      s.hero.position.set(x, y, -0.1); s.hero.rotation.set(0, 0.65, bonk ? b * 1.2 : -0.45);
      if (!bonk) { h.face({ lid: 1, brow: -0.5, mouth: 'o', open: 1.0 + Math.sin(lt * 50) * 0.3 }); flyPose(h); puff(s.P.puff, mouthPos(s.hero), V(-1, -0.3, 0.2), lt % 0.5, { speed: 1.4, life: 0.5, size: 0.07, spread: 0.4, gap: 0.03 }); }
      else { h.face({ lid: 0.5, brow: -1, mouth: 'o', open: 0.5, look: [Math.cos(lt * 12) * 0.8, Math.sin(lt * 12) * 0.8] }); h.arm('L', 0.4, 0.8, 0.3); h.arm('R', 0.4, 0.8, 0.3); }
    } },
  // 14) top speed is the sneeze speed: 16 km/h
  { sc: 'st', say: ['cap'], pal: SKY, show: ['puff', 'clouds'], hud: ['困ったこと④', '最高 時速16km'], hudColor: RED,
    cam: { p0: [0, 1.6, 5.2], p1: [0, 1.6, 5.0], l0: [0, 1.45, 0] },
    sfx: [[0.3, 'whoosh_slide', -14], [2.6, 'text_pa', -11], [3.4, 'comic_stupid', -13]],
    cards: [{ t: 2.6, text: '最高速度 ＝ [息の速さ]', y: 480, size: 62, border: RED }],
    note: '吸って噴く推進は、噴く速さを超えられない',
    act(lt, s) {
      const h = s.hero.userData; s.P.clouds.position.set(-((lt * 0.4) % 2) + 0.5, -1.0, 0);
      s.hero.position.set(-0.3, 0.45 + Math.sin(lt * 3) * 0.05, 0.2); s.hero.rotation.set(0, 0.55, -0.4);
      flyPose(h, Math.sin(lt * 5) * 0.05); h.head.rotation.x = 0.1; h.face({ lid: lt > 2.6 ? 0.45 : 0.2, brow: lt > 2.6 ? -0.6 : 0.2, mouth: lt > 2.6 ? 'flat' : 'o', open: 0.8, look: [0.6, 0] });
      puff(s.P.puff, mouthPos(s.hero), V(-1, -0.3, -0.4), lt % 0.6, { speed: 1.2, life: 0.6, size: 0.07, spread: 0.4, gap: 0.04 });
    } },
  // 15) a bicycle passes him
  { sc: 'st', say: ['bike'], pre: 0.4, hold: 0.5, pal: SKY, show: ['puff', 'bike', 'clouds'], hero2: true, hud: ['困ったこと④', '最高 時速16km'], hudColor: RED,
    cam: { p0: [0, 1.6, 5.4], l0: [0, 1.45, 0] },
    sfx: [[0.2, 'whoosh_swing', -11], [1.2, 'comic_stupid', -12]],
    stamps: [{ t: 0.5, text: 'スイーッ', x: 760, y: 1250, rot: 8, color: '#ffffff', size: 86, dur: 1.0 }],
    tags: [{ t: 1.2, text: '抜かれた…', x: 500, y: 470, h: 80, bg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, bx = lerp(-1.9, 1.9, k(lt, 0, 2.0)); s.P.clouds.position.set(0, -1.0, 0);
      s.hero.position.set(-0.7, 0.45 + Math.sin(lt * 3) * 0.05, 0.4); s.hero.rotation.set(0, 0.55, -0.4); flyPose(h);
      h.face({ lid: 0.4, brow: -0.8, mouth: 'flat', look: [0.8, -0.5] }); h.head.rotation.y = -0.3;
      s.P.bike.position.set(bx, 0, -0.7); s.hero2.position.set(bx - 0.08, 0.36, -0.7); s.hero2.rotation.y = Math.PI / 2;
      h2.reach('L', V(bx + 0.3, 0.86, -0.52)); h2.reach('R', V(bx + 0.3, 0.86, -0.88)); h2.face({ lid: 0.3, brow: 0.3, mouth: 'smile', look: [-0.6, 0.3] });
      puff(s.P.puff, mouthPos(s.hero), V(-1, -0.3, -0.4), lt % 0.6, { speed: 1.2, life: 0.6, size: 0.07, spread: 0.4, gap: 0.04 });
    } },
  // 16) question
  { sc: 'st', say: ['cta'], pal: ORA, show: ['puff'],
    cam: { p0: [0, 1.7, 4.7], p1: [0, 1.7, 4.5], l0: [0, 1.58, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.2, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: '飛びたい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: '歩く', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.1);
      h.reach('R', V(0.02, 1.36, 0.55)); h.arm('L', 0.6, 0.3, 1.2); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
      h.face({ lid: 0.3, brow: 0.5, look: [0.4, 0], mouth: 'smile' });
    } },
];
function s0() { return S; }
function this0(t) { return t + 1.2; }

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも、くしゃみで', '空を[飛べたら]？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['くしゃみ', '空を飛ぶ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
