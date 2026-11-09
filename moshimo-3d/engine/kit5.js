// A messy room (bed / desk / shelf / bin) that can tidy itself, with coins, cards, coffee and air "molecules".
// buildRoom(o) -> {scene, camera, update}. shot.opt:
//   tidy: 0..1 (static) or tidyFrom/tidyTo + tidyAt/tidyDur (animated)   coins: 'random'|'flip'|'heads'|'spin'
//   cards: 0..1 or cardsTo (animated)   coffee: 0..1 heat, coffeeTo (animated)   air/airTo: molecules rush to one side   dust: show molecules   clock: speed
import { THREE, rng, lerp, clamp, ease, pick, lam, basic, box, cam, sceneFor } from './core.js';
import { steam } from './kit4.js';

export function buildRoom(o = {}) {
  const r = rng(o.seed ?? 512);
  const { scene } = sceneFor(o.time || 'morning', 40);
  const W = 6.4, D = 5.4, H = 2.7;
  box(W, 0.1, D, '#b98a5a', 0, -0.05, 0, scene);
  for (let i = 0; i < 9; i++) box(0.02, 0.005, D, '#a57a4d', -W / 2 + 0.7 * i + 0.35, 0.003, 0, scene, false);
  box(W, H, 0.12, '#efe8dc', 0, H / 2, -D / 2, scene);
  box(0.12, H, D, '#ebe3d6', -W / 2, H / 2, 0, scene); box(0.12, H, D, '#ebe3d6', W / 2, H / 2, 0, scene);
  box(1.8, 1.1, 0.02, basic('#bfe0f7'), 0.6, 1.6, -D / 2 + 0.07, scene, false);
  box(1.9, 0.06, 0.06, '#ffffff', 0.6, 2.17, -D / 2 + 0.08, scene); box(1.9, 0.06, 0.06, '#ffffff', 0.6, 1.03, -D / 2 + 0.08, scene);
  box(0.05, 1.1, 0.06, '#ffffff', 0.6, 1.6, -D / 2 + 0.08, scene);
  // bed (left front), desk (right back), shelf (left back), bin (right)
  box(1.1, 0.35, 2.1, '#7a5a3e', -2.55, 0.18, 1.3, scene); box(1.0, 0.18, 2.0, '#f4f4f0', -2.55, 0.44, 1.3, scene);
  box(0.9, 0.12, 0.4, '#ffffff', -2.55, 0.58, 0.45, scene); box(1.02, 0.1, 1.2, '#7aa2c9', -2.55, 0.56, 1.75, scene);
  const deskY = 0.75; box(1.7, 0.05, 1.0, '#c9a77c', 1.9, deskY, -1.95, scene);
  for (const [dx, dz] of [[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.45], [0.8, 0.45]]) box(0.05, deskY, 0.05, '#8a6a48', 1.9 + dx, deskY / 2, -1.95 + dz, scene);
  box(0.9, 1.9, 0.35, '#8a6a48', -1.6, 0.95, -2.45, scene);
  for (let k = 0; k < 4; k++) box(0.86, 0.03, 0.33, '#a07c56', -1.6, 0.3 + k * 0.48, -2.43, scene);
  box(0.32, 0.4, 0.32, '#5a87c9', 2.8, 0.2, 0.3, scene);
  // wall clock
  const clock = new THREE.Group(); clock.position.set(-0.6, 2.05, -D / 2 + 0.08); scene.add(clock);
  box(0.42, 0.42, 0.03, '#ffffff', 0, 0, 0, clock);
  const hHand = new THREE.Group(), mHand = new THREE.Group(); clock.add(hHand); clock.add(mHand);
  box(0.02, 0.12, 0.01, '#222222', 0, 0.05, 0.02, hHand); box(0.015, 0.17, 0.01, '#222222', 0, 0.075, 0.025, mHand);
  // mess items: scattered pose a -> tidy pose b
  const items = [];
  const CL = ['#d94a4a', '#3d6bb3', '#f2d14b', '#5aa56a', '#ffffff', '#333a44', '#e98ab0'];
  for (let i = 0; i < 16; i++) { // clothes -> folded piles at the bed end
    const m = box(0.42, 0.04, 0.32, pick(r, CL), 0, 0, 0, scene);
    items.push({ m, a: [-1.5 + r() * 4.2, 0.03 + r() * 0.05, -1.0 + r() * 3.0, r() * 0.4, r() * 3, r() * 0.4], b: [-0.95 + (i % 2) * 0.46, 0.04 + Math.floor(i / 2) * 0.045, -2.2, 0, 0, 0] });
  }
  for (let i = 0; i < 18; i++) { // books -> shelf
    const h = 0.22 + r() * 0.08, m = box(0.05, h, 0.17, pick(r, ['#8a2f2f', '#2f4f8a', '#2f7a4f', '#c9a23a', '#6a3f8a', '#333333']), 0, 0, 0, scene);
    const row = Math.floor(i / 9), col = i % 9;
    items.push({ m, a: [-1.8 + r() * 4.4, 0.04, -1.6 + r() * 3.4, Math.PI / 2, r() * 3, 0], b: [-1.98 + col * 0.075, 0.8 + h / 2 + row * 0.48, -2.43, 0, 0, 0] });
  }
  for (let i = 0; i < 10; i++) { // cans / snacks -> bin
    const m = box(0.07, 0.12, 0.07, pick(r, ['#c9c9c9', '#d94a4a', '#f2a03b']), 0, 0, 0, scene);
    items.push({ m, a: [-1.4 + r() * 4.2, 0.04, -1.8 + r() * 3.6, Math.PI / 2, r() * 3, 0], b: [2.8 + (r() - 0.5) * 0.15, 0.34 + (i % 3) * 0.02, 0.3 + (r() - 0.5) * 0.15, 0, r(), 0] });
  }
  items.forEach((it, i) => { it.d = (i % 11) / 11 * 0.45; });
  // coins on the desk (gold side = heads)
  const coins = [];
  for (let i = 0; i < 100; i++) {
    const g = new THREE.Group(); scene.add(g);
    box(0.07, 0.004, 0.07, '#f0c24a', 0, 0.003, 0, g, false); box(0.07, 0.004, 0.07, '#8f959c', 0, -0.003, 0, g, false);
    coins.push({ g, x: 1.9 - 0.62 + (i % 10) * 0.115, z: -1.95 - 0.4 + Math.floor(i / 10) * 0.085, up: r() < 0.5, ph: r() });
  }
  // cards: floor -> neat deck
  const cards = [];
  for (let i = 0; i < 52; i++) {
    const m = box(0.063, 0.002, 0.088, i % 2 ? '#ffffff' : '#f0f0f0', 0, 0, 0, scene, false);
    cards.push({ m, a: [-0.6 + r() * 2.6, 0.006, -1.2 + r() * 2.2, 0, r() * 6, 0], b: [2.5, deskY + 0.03 + i * 0.0021, -1.6, 0, 0, 0], d: r() * 0.4 });
  }
  // coffee + steam
  box(0.09, 0.1, 0.09, '#ffffff', 1.25, deskY + 0.075, -1.6, scene);
  const cof = box(0.08, 0.005, 0.08, '#5a3a22', 1.25, deskY + 0.127, -1.6, scene, false);
  const cupSteam = steam(scene, [1.21, 1.29, -1.64, -1.56, deskY + 0.14, deskY + 0.6], 110, 4, '#ffffff', 0.035);
  // air molecules
  const N = 420, dust = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: '#bfe8ff' }), N);
  const DP = Array.from({ length: N }, () => ({ x: (r() - 0.5) * (W - 0.5), y: 0.2 + r() * 2.3, z: (r() - 0.5) * (D - 0.5), p: r() * 6 }));
  scene.add(dust); const mm = new THREE.Matrix4();
  const camera = cam(58);
  const ex = o.extra ? o.extra({ scene, r, camera }) : null;
  const pose = (m, a, b, k, arc) => {
    k = clamp(k);
    m.position.set(lerp(a[0], b[0], k), lerp(a[1], b[1], k) + Math.sin(k * Math.PI) * arc, lerp(a[2], b[2], k));
    m.rotation.set(lerp(a[3], b[3], k), lerp(a[4], b[4], k), lerp(a[5], b[5], k));
  };
  return {
    scene, camera,
    update(lt, gt, shot) {
      const op = shot.opt || {};
      if (op.tidyTo !== undefined) {
        const tk = clamp((lt - (op.tidyAt ?? 0)) / (op.tidyDur || 1.6));
        items.forEach(it => pose(it.m, it.a, it.b, lerp(op.tidyFrom ?? 0, op.tidyTo, ease((tk - it.d) / 0.55)), 0.9));
      } else items.forEach(it => pose(it.m, it.a, it.b, op.tidy ?? 0, 0));
      const md = op.coins || 'random';
      coins.forEach((c, i) => {
        let rx = c.up ? 0 : Math.PI, y = 0;
        if (md === 'flip') { const t0 = clamp((lt - 0.5 - (i % 10) * 0.03) / 1.1); y = Math.sin(t0 * Math.PI) * 0.35; rx = t0 * 6 * Math.PI; }
        else if (md === 'spin') { const t0 = (lt * 1.2 + c.ph) % 1; y = Math.sin(t0 * Math.PI) * 0.3; rx = t0 * 4 * Math.PI + (c.up ? 0 : Math.PI); }
        else if (md === 'heads') rx = 0;
        c.g.position.set(c.x, deskY + 0.03 + y, c.z); c.g.rotation.set(rx, 0, 0);
      });
      const ck = op.cardsTo !== undefined ? clamp((lt - 0.5) / 1.6) : (op.cards ?? 0);
      cards.forEach(c => pose(c.m, c.a, c.b, op.cardsTo !== undefined ? ease((ck - c.d) / 0.6) : ck, 0.7));
      const heat = op.coffeeTo !== undefined ? lerp(op.coffee ?? 0, op.coffeeTo, ease((lt - 0.5) / 2.5)) : (op.coffee ?? 0.15);
      cupSteam(heat, gt); cof.material = lam(heat > 0.7 ? '#7a3a12' : '#5a3a22');
      const rush = op.airTo !== undefined ? ease((lt - 0.4) / 2.2) * op.airTo : (op.air || 0);
      DP.forEach((p, i) => {
        const x = lerp(p.x, W / 2 - 0.3 - Math.abs(p.x) * 0.25, rush) + Math.sin(gt * 0.7 + p.p) * 0.05;
        mm.makeTranslation(x, p.y + Math.sin(gt * 0.5 + p.p) * 0.05, p.z); dust.setMatrixAt(i, mm);
      });
      dust.instanceMatrix.needsUpdate = true; dust.visible = !!op.dust || rush > 0;
      const cs = op.clock || 0.02; hHand.rotation.z = -gt * cs; mHand.rotation.z = -gt * cs * 12;
      ex?.(lt, gt, shot);
    },
  };
}
