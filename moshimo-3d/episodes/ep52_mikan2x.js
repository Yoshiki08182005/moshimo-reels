// ep52_mikan2x (pop / arm A 原因を拡大): もしもこたつのみかんが毎日2倍に増えたら？
// 型は sp_geppu2x / ep51。台本・数字・小道具は自作。
// 前提（試算）: 1日目 1個、n日目 = 2^(n-1) 個。みかん1個 100g・直径6cm、詰めたときの充填率 0.6 → 1個あたり 約189cm³
//   7日目 64個 / 11日目 1,024個 = 102kg / 15日目 16,384個 / 16日目 32,768個 = 3.3t / 18日目 131,072個 = 24.7m³（6畳 9.72m²×天井2.4m = 23.3m³）
//   床: 住宅の居室の積載荷重 1,800N/m²（建築基準法施行令85条）× 9.72m² ÷ 9.8 = 約1.8t → 16日目 3.3t で超える
//   34日目 2^33 = 85.9億個 > 日本の収穫量 約68.2万t ÷ 100g = 68.2億個（農水省 令和5年産）。体積 162万m³ = 東京ドーム（124万m³）約1.3杯
//   食べる: 15日目の 16,384個 × 1分 = 273時間 = 11.4日
import { run, THREE, V, clamp, ease, lerp, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep52_mikan2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff8a3d', '#fff1e2', '#2f7d4f'];
const OR = '#ff9a1f';

// heap of spheres (cone), bottom layer first. returns [[x, y, z, layer]]
function heapPts(R, r) {
  const pts = []; let y = r * 0.85, Rl = R, L = 0;
  while (Rl > r * 0.6) {
    const st = 2 * r * 0.98, off = (L % 2) * r;
    for (let x = -Rl; x <= Rl; x += st) for (let z = -Rl; z <= Rl; z += st) {
      const xx = x + off, zz = z + off; if (xx * xx + zz * zz > Rl * Rl) continue;
      const j = Math.sin(pts.length * 12.9898) * 43758.5453; const jj = (j - Math.floor(j)) - 0.5;
      pts.push([xx + jj * r * 0.3, y + jj * r * 0.2, zz - jj * r * 0.3, L]);
    }
    y += r * 1.5; Rl -= r * 1.3; L++;
  }
  pts.push([0, y, 0, L]); return pts;
}
const HEAPS = { top: [0.36, 0.07], kot: [1.05, 0.12], room: [2.7, 0.17], big: [4.6, 0.3] };
for (const n in HEAPS) { const [R, r] = HEAPS[n]; HEAPS[n] = { R, r, pts: heapPts(R, r) }; }
const MX = new THREE.Matrix4(), Q = new THREE.Quaternion(), SC = new THREE.Vector3(), PO = new THREE.Vector3();
// show a heap. fall: 0..1 (1 = landed). drop: sink everything by this much
function heap(s, name, cx, cy, cz, fall = 1, drop = 0) {
  const h = HEAPS[name], m = s.P.mk; m.visible = true; m.count = h.pts.length;
  const top = h.pts[h.pts.length - 1][3] || 1;
  h.pts.forEach(([x, y, z, L], i) => {
    const d = L / top * 0.35; const u = ease(clamp((fall * 1.35 - d) / 0.65)); const yy = cy + y + (1 - u) * 7 - drop;
    PO.set(cx + x, yy, cz + z); Q.setFromAxisAngle(V(0, 1, 0), i * 1.7); SC.set(h.r, h.r * 0.86, h.r); MX.compose(PO, Q, SC); m.setMatrixAt(i, MX);
  });
  m.instanceMatrix.needsUpdate = true;
}

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // kotatsu (origin at the floor): quilt + top board
  { const g = G(); rbox(1.25, 0.36, 1.0, 0.08, '#e4573d', 0, 0.2, 0, g); for (const x of [-0.42, 0, 0.42]) rbox(0.06, 0.37, 1.01, 0.02, '#f2c14e', x, 0.2, 0, g);
    rbox(1.0, 0.05, 0.8, 0.02, '#b97a45', 0, 0.42, 0, g); reg('kotatsu', g); }
  // one mikan (centered)
  { const g = G(); sph(0.075, OR, 0, 0, 0, g, 1, 0.86, 1); cyl(0.008, 0.008, 0.02, '#4b7a2a', 0, 0.066, 0, g); sph(0.022, '#5aa83a', 0.02, 0.07, 0, g, 1.4, 0.4, 0.8); reg('mikan', g); }
  { const g = G(); sph(0.075, OR, 0, 0, 0, g, 1, 0.86, 1); cyl(0.008, 0.008, 0.02, '#4b7a2a', 0, 0.066, 0, g); reg('mikan2', g); }
  // instanced mikan heap
  { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), M(OR, 0.55), 1400); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.count = 0; reg('mk', m); }
  // yellow palms (overlay on the 'gu' hands)
  for (const n of ['yhL', 'yhR']) reg(n, sph(0.108, '#ffcf3a', 0, 0, 0));
}

const place = (o, x, z, ry = 0, sc = 1, y = 0) => { o.visible = true; o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.setScalar(sc); return o; };
const hold = (s, name, side, p, who = s.hero, sc = 1) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); o.scale.setScalar(sc); who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, 0.0, -0.02))); return o; };
// seated behind the kotatsu (legs hidden by the quilt)
const atKotatsu = (s, x = 0, z = 0.45, drop = 0) => { place(s.P.kotatsu, x, z, 0, 1, -drop); place(s.hero, x, z - 0.62, 0, 1, -0.3 - drop); };
const mouth = (who) => { who.updateMatrixWorld(true); return who.userData.head.localToWorld(V(0.05, -0.2, 0.45)); };

const plan = [
  // 0) cold open (flash-forward of day 18): an avalanche of mikan buries the room; push in to the smug face eating one
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.2, 2.2, 8.4], p1: [0.0, 1.55, 3.7], l0: [0.0, 1.3, -0.5], l1: [0.0, 1.45, 0.62], hold: 1.15, dur: 1.9 },
    shake: [[0.28, 0.08, 0.6]], lines: [[0.22, 1.0]],
    sfx: [[0.0, 'whoosh_gust', -11], [0.25, 'collapse', -11], [0.3, 'text_impact', -11], [1.4, 'whoosh_slide', -13], [2.2, 'comic_eat', -10]],
    stamps: [{ t: 0.3, text: 'みかん雪崩!!', x: 540, y: 420, rot: -6, color: YEL, size: 92, dur: 1.1 },
      { t: 2.15, text: 'もぐっ', x: 650, y: 1430, rot: -5, color: '#ffffff', size: 58, dur: 0.8 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.62, 0); heap(s, 'room', 0, 0, -1.2, k(lt, 0.0, 0.35));
      if (lt < 1.3) { h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.6], mouth: 'o', open: 1.0 }); h.arm('R', 2.6, 0.6, 0.3); h.hand('R', 'pa'); h.arm('L', 2.6, 0.6, 0.3); h.hand('L', 'pa'); }
      else { h.face({ lid: 0.55, brow: 0.7, look: [0, 0], mouth: lt > 2.1 ? 'o' : 'smile', open: 0.35 }); h.head.rotation.z = 0.1 * ease(k(lt, 1.9, 2.3));
        hold(s, 'mikan', 'R', mouth(s.hero).add(V(0.12, -0.02, 0.06))); h.hand('R', 'gu'); h.arm('L', 0.3, 0.5, 1.2); h.hand('L', 'pa'); }
    } },
  // 1) title: at the kotatsu with one mikan
  { sc: 'st', say: ['hook'], pal: ['#ffb36b', '#fff4e6', '#2f7d4f'], show: [],
    cam: { p0: [0.05, 1.45, 4.5], p1: [0.05, 1.43, 4.2], l0: [0.05, 1.15, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.5, 'comic_boyon', -12]],
    stamps: [{ t: 1.8, text: '2倍?!', x: 820, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      const h = s.hero.userData; atKotatsu(s); hold(s, 'mikan', 'R', V(0.25, 1.05, 0.25)); h.hand('R', 'gu'); h.arm('L', 0.4, 0.5, 1.5); h.hand('L', 'pa');
      h.face(lt < 1.3 ? { lid: 0.5, brow: 0.4, look: [0.4, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 0.5 });
    } },
  // 2) day 1: one mikan on the board
  { sc: 'st', say: ['d1'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#e2463c'], show: [], hud: ['みかん', '×2'],
    cam: { p0: [0.0, 1.45, 4.3], p1: [0.0, 1.43, 4.0], l0: [0.0, 1.1, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.5, 'comic_pico', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '1日目 [1個]', y: 480, size: 76, border: CY, sub: 'いつものこたつ（試算の前提）' }] : []; },
    tags(lt) { const t0 = 1.5; return lt > t0 ? [{ t: t0, text: '毎日', x: 330, y: 1100, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '2倍!', x: 740, y: 1100, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; atKotatsu(s); place(s.P.mikan, 0.15, 0.55, 0, 1.2, 0.53);
      h.reach('R', V(0.2, 0.62, 0.5)); h.hand('R', 'choki'); h.arm('L', 0.3, 0.5, 1.4); h.hand('L', 'pa');
      h.face({ lid: 0.3, brow: 0.4, look: [0.3, -0.5], mouth: 'smile' });
    } },
  // 3) day 7: 64 on the board
  { sc: 'st', say: ['d7'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [], hud: ['7日目', '64個'],
    cam: { p0: [0.0, 1.5, 4.5], p1: [0.0, 1.47, 4.2], l0: [0.0, 1.1, 0] },
    sfx: [[0.15, 'comic_boyon', -11], [0.4, 'text_pa', -10], [1.9, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '7日目 [64個]', y: 480, size: 76, border: CY, sub: '1×2×2×2×2×2×2（試算）' }] : []; },
    tags(lt) { const t0 = 1.7; return lt > t0 ? [{ t: t0, text: 'こたつの上', x: 320, y: 1110, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '山盛り!', x: 760, y: 1110, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; atKotatsu(s); heap(s, 'top', 0, 0.45, 0.45, k(lt, 0.0, 0.5));
      h.arm('R', 1.2, 1.2, 0.5); h.hand('R', 'pa'); h.arm('L', 1.2, 1.2, 0.5); h.hand('L', 'pa');
      h.face({ lid: 0, brow: 0.7, browY: 1, look: [0, -0.4], mouth: 'o', open: 0.7 });
    } },
  // 4) day 11: 1,024 = 100 kg, the kotatsu disappears
  { sc: 'st', say: ['d11'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hero2: true, hud: ['11日目', '100kg'],
    cam: { p0: [0.0, 1.6, 6.8], p1: [0.0, 1.55, 6.4], l0: [0.0, 1.1, 0] },
    sfx: [[0.1, 'collapse', -13], [0.4, 'text_pa', -10], [1.8, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '11日目 [1024個]', y: 480, size: 72, border: YEL, sub: '1個100gで 約100kg（試算）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: 'こたつ どこ?', x: 540, y: 1120, h: 92, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.7, 0.3, 0.35); place(s.hero2, 0.7, 0.3, -0.35);
      place(s.P.kotatsu, 0, 0.2); heap(s, 'kot', 0, 0, 0.2, k(lt, 0.0, 0.6));
      h.arm('R', 0.8, 1.0, 0.8); h.hand('R', 'pa'); h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa'); h2.arm('L', 2.4, 0.6, 0.2); h2.hand('L', 'pa'); h2.arm('R', 0.6, 1.2, 0.6); h2.hand('R', 'pa');
      h.face({ lid: 0, brow: -0.6, browY: 1, look: [0.6, -0.3], mouth: 'o', open: 0.8 }); h2.face({ lid: 0, brow: 0.8, browY: 1, look: [-0.5, -0.3], mouth: 'o', open: 1.0 });
    } },
  // 5) day 18: 130,000 = the room is full (the cold open, in its place)
  { sc: 'st', say: ['d18'], pre: 0.15, pal: HOOK, show: [], hud: ['18日目', '13万個'],
    cam: { p0: [0.1, 1.8, 6.6], p1: [0.1, 1.75, 6.2], l0: [0.0, 1.4, -0.3] },
    shake: [[0.35, 0.06, 0.5]], lines: [[0.3, 0.8]],
    sfx: [[0.0, 'whoosh_gust', -12], [0.3, 'collapse', -11], [0.5, 'text_pa', -10], [2.2, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '18日目 [13万個]', y: 480, size: 72, border: YEL, sub: '6畳の部屋が満タン（試算）' }] : []; },
    stamps: [{ t: 2.0, text: '満タン!', x: 800, y: 1120, rot: 8, color: YEL, size: 76, dur: 1.2 }],
    note: '6畳 9.7m²×天井2.4m・1個100g・直径6cm',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.62, 0); heap(s, 'room', 0, 0, -1.2, k(lt, 0.05, 0.4));
      h.arm('R', 2.6, 0.4, 0.2); h.hand('R', 'pa'); h.arm('L', 2.0, 1.0, 0.4); h.hand('L', 'pa');
      h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.2, 0.5], mouth: 'o', open: 1.0 });
    } },
  // 6) day 34: 8.6 billion > Japan's yearly harvest
  { sc: 'st', say: ['d34'], pre: 0.15, pal: ['#2f8f6a', '#e3f5ec', '#ffd23a'], show: [], hud: ['34日目', '86億個'],
    cam: { p0: [0.0, 2.2, 9.2], p1: [0.0, 2.3, 8.6], l0: [0.0, 2.75, -1.5] },
    sfx: [[0.2, 'giant_fall', -12], [0.5, 'text_pa', -10], [2.2, 'comic_jajean', -13]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '34日目 [86億個]', y: 480, size: 72, border: YEL, sub: '日本の1年分 約68億個を超える' }] : []; },
    tags(lt) { const t0 = 2.0; return lt > t0 ? [{ t: t0, text: '東京ドーム 1.3杯', x: 540, y: 700, h: 92, bg: '#ffffff' }] : []; },
    note: 'みかん収穫量 約68万t（農水省 令和5年産）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0.4, 1.3, -0.2); heap(s, 'big', -0.3, 0, -3.8, k(lt, 0.0, 0.7));
      h.arm('R', 2.6, 0.6, 0.1); h.hand('R', 'choki'); h.arm('L', 0.6, 1.2, 0.6); h.hand('L', 'pa'); s.hero.rotation.y = 0.35;
      h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.8], mouth: 'o', open: 0.9 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.4, 3.6], p1: [0, 1.38, 2.9], l0: [0, 1.15, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; atKotatsu(s); hold(s, 'mikan', 'R', V(0.22, 1.0, 0.3)); h.hand('R', 'gu');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.6 }); h.arm('L', 0.3, 0.3, 1.9); h.hand('L', 'pa'); } },
  // 8) day 16: 3 t, the floor gives way before the room is full
  { sc: 'st', say: ['floor'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: [], hud: ['16日目', '3トン'], hudColor: RED,
    cam: { p0: [0.0, 1.7, 7.2], p1: [0.0, 1.65, 6.8], l0: [0.0, 1.1, 0] },
    shake: [[2.55, 0.08, 0.8]],
    sfx: [[0.3, 'text_pa', -10], [2.5, 'crack_rock', -10], [2.7, 'collapse', -11], [3.2, 'comic_fall', -12]],
    cards(lt) { const b = this.lt.floor + 2.4; return lt < b ? (lt > 0.4 ? [{ t: 0.4, text: '16日目 [3トン]', y: 480, size: 74, border: RED, sub: '6畳の床の目安 約1.8t（試算）' }] : [])
      : [{ t: b, text: '[床が抜ける]', y: 480, size: 80, border: RED, sub: '満タンの18日目より先に' }]; },
    stamps: [{ t: 2.6, text: 'メキメキッ', x: 760, y: 1120, rot: 8, color: RED, size: 72, dur: 1.3 }],
    note: '住宅の床 1800N/m²（建築基準法施行令85条）',
    act(lt, s, gt, sh) {
      const b = sh.lt.floor + 2.4; const d = ease(k(lt, b, b + 0.6)) * 0.9; const h = s.hero.userData;
      place(s.hero, -0.62, 0.5, 0.35, 1, -d * 0.7); heap(s, 'kot', 0.5, 0, -0.6, 1, d); s.P.mk.scale.set(1, 1, 1);
      if (lt < b) { h.arm('R', 0.8, 0.9, 0.6); h.hand('R', 'pa'); h.arm('L', 0.5, 0.8, 1.2); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: -0.5, look: [0.6, -0.4], mouth: 'flat' }); }
      else { h.arm('R', 2.8, 0.7, 0); h.hand('R', 'pa'); h.arm('L', 2.8, 0.7, 0); h.hand('L', 'pa'); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0.3], mouth: 'o', open: 1.1 }); }
    } },
  // 9) eat 1 per minute: day 15's 16,384 take 11 days
  { sc: 'st', say: ['eat'], pre: 0.15, pal: ['#ff8f3a', '#fff0e0', '#3f6fd8'], show: [], hud: ['食べきる', '11日'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.6], p1: [0.0, 1.43, 4.3], l0: [0.0, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.9, 'comic_eat', -12], [1.8, 'comic_eat', -12], [2.7, 'comic_eat', -12], [3.0, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '食べきるのに [11日]', y: 480, size: 72, border: RED, sub: '15日目の1万6千個（試算）' }] : []; },
    tags(lt) { const t0 = 1.5; return lt > t0 ? [{ t: t0, text: '1個 1分', x: 320, y: 1110, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '寝ないで273時間', x: 720, y: 1110, h: 84, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; atKotatsu(s); heap(s, 'top', 0, 0.45, 0.45);
      const w = (Math.sin(lt * 7) + 1) / 2; const mp = mouth(s.hero);
      hold(s, 'mikan', 'R', V(0.3, 0.75, 0.35).lerp(mp.clone().add(V(0.1, 0, 0.05)), w)); h.hand('R', 'gu');
      hold(s, 'mikan2', 'L', V(-0.3, 0.75, 0.35).lerp(mp.clone().add(V(-0.1, 0, 0.05)), 1 - w)); h.hand('L', 'gu');
      h.face({ lid: 0.6, brow: -0.4, look: [0, 0], mouth: 'o', open: 0.4 + 0.5 * w });
    } },
  // 10) good news (all you can eat) / bad news (yellow hands)
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['食べ放題', '手が黄色'], hudColor: RED,
    cam: { p0: [0.1, 1.45, 4.6], p1: [0.1, 1.43, 4.3], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.6, 'comic_fall', -12], [2.8, 'text_pa', -10], [4.4, 'comic_jajean', -13]],
    cards(lt) { const b = this.lt.news + 2.5; return lt < b ? (lt > 0.25 ? [{ t: 0.25, text: '一生 [食べ放題]', y: 480, size: 74, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: b, text: '手が [黄色く]なる', y: 480, size: 72, border: RED, sub: '悪いニュース：柑皮症（病気ではない）' }]; },
    note: '柑皮症：色素で皮ふが黄色くなる状態',
    act(lt, s, gt, sh) {
      const b = sh.lt.news + 2.5; const h = s.hero.userData; place(s.hero, 0, 0.4, 0); heap(s, 'kot', 0, 0, -1.2);
      if (lt < b) { hold(s, 'mikan', 'R', V(0.4, 1.25, 0.65)); h.hand('R', 'gu'); hold(s, 'mikan2', 'L', V(-0.4, 1.25, 0.65)); h.hand('L', 'gu');
        h.face({ lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' }); s.hero.position.y = Math.abs(Math.sin(lt * 6)) * 0.06; }
      else { h.reach('R', V(0.2, 1.05, 0.78)); h.hand('R', 'gu'); h.reach('L', V(-0.2, 1.05, 0.78)); h.hand('L', 'gu');
        const u = ease(k(lt, b + 0.3, b + 1.0)); for (const sd of ['L', 'R']) { const y = s.P['yh' + sd]; y.visible = u > 0.02; y.position.copy(h.handPos(sd)); y.scale.setScalar(0.108 * u); }
        h.face({ lid: 0, brow: -0.9, browY: 1, look: [0, -0.7], mouth: 'o', open: 0.8 }); }
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.4, 4.7], p1: [0.05, 1.4, 4.5], l0: [0, 1.15, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '増えてほしい', x: 320, y: 1130, h: 100, bg: YEL }, { t: t0 + 0.2, text: '1個で十分', x: 770, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; atKotatsu(s); const m = hold(s, 'mikan', 'R', V(0.28, 1.08, 0.3)); m.rotation.z = Math.sin(lt * 3) * 0.2; h.hand('R', 'gu');
      place(s.P.mikan2, -0.2, 0.5, 0, 1.1, 0.53); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもこたつのみかんが', '毎日[2倍]に増えたら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['みかん', '×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
