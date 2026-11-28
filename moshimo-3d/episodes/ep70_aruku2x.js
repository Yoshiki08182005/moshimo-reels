// ep70_aruku2x (pop / arm A 原因を拡大): もしも歩く速さが毎日2倍になったら？
// 型は sp_geppu2x / ep69。台本・数字・小道具は自作。
// 前提（試算）:
//   ふつうの歩く速さ = 分速80m（不動産の表示に関する公正競争規約施行規則の「徒歩1分=80m」）= 時速4.8km。1日目=80m/分、n日目 = 2^(n-1) 倍
//   3日目 19.2km/h（ママチャリは時速15km前後と仮定）、4日目 38.4km/h → 駅800mまで 75秒、7日目 307.2km/h（新幹線の最高 320km/h）→ 800m を 9.4秒
//   歩幅70cm → 1分114歩、7日目は ×64 → 1秒に121.6歩 ≈ 122歩
//   向かい風（7日目 85.3m/s）: F = 1/2·1.225·Cd1.0·正面0.7m²·v² = 3,122N ≈ 319kg重 = 体重60kgの5.3倍
//   駅まで800mの仕事 = 2.50MJ、筋肉の効率25% → 2,388kcal、おにぎり1個180kcal → 13個
//   止まるのに: v²/(2μg)、μ=0.7（靴と乾いた道） → 531m
//   9日目 1,228.8km/h > 音速 1,225km/h（15℃, 340m/s）
import { run, THREE, V, clamp, ease } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep70_aruku2x.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9f43', '#fff1e0', '#35d0ff'];
const SMUG = { lid: 0.55, brow: 0.6, look: [0.2, 0.1], mouth: 'smile' };

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // bullet train (original simple design): long white body along x, rounded nose at +x, blue stripe, windows
  { const g = G(); rbox(4.6, 0.86, 0.9, 0.3, '#f6f8fb', 0, 0.62, 0, g); sph(0.45, '#f6f8fb', 2.3, 0.56, 0, g, 2.4, 0.86, 1.0);
    rbox(4.6, 0.1, 0.92, 0.04, '#2f6fe0', 0, 0.42, 0, g); sph(0.1, '#2f6fe0', 3.2, 0.42, 0, g, 3.4, 0.5, 4.3);
    for (let i = 0; i < 9; i++) rbox(0.3, 0.2, 0.02, 0.05, '#2b3a55', -2.0 + i * 0.48, 0.78, 0.455, g);
    rbox(0.55, 0.22, 0.6, 0.1, '#2b3a55', 2.95, 0.78, 0, g);
    for (const x of [-1.8, -0.6, 0.6, 1.8]) { const w = cyl(0.12, 0.12, 0.92, '#3a3f4a', x, 0.14, 0, g); w.rotation.x = Math.PI / 2; }
    reg('shin', g); }
  // mamachari (simple bicycle with a basket)
  { const g = G(); g.userData.wheels = [];
    for (const x of [-0.42, 0.42]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 26), M('#2b2f38')); w.position.set(x, 0.29, 0); g.add(w); g.userData.wheels.push(w);
      for (let s = 0; s < 3; s++) { const sp = rbox(0.5, 0.015, 0.015, 0.005, '#c9ced6', 0, 0, 0, w); sp.rotation.z = s * Math.PI / 3; } }
    const f1 = rbox(0.9, 0.05, 0.05, 0.02, '#ff6fa8', 0, 0.42, 0, g); f1.rotation.z = -0.15;
    rbox(0.05, 0.36, 0.05, 0.02, '#ff6fa8', -0.15, 0.6, 0, g); rbox(0.24, 0.07, 0.14, 0.03, '#3b2a20', -0.15, 0.8, 0, g);
    rbox(0.05, 0.4, 0.05, 0.02, '#ff6fa8', 0.38, 0.65, 0, g); rbox(0.05, 0.05, 0.5, 0.02, '#c9ced6', 0.38, 0.86, 0, g);
    rbox(0.26, 0.18, 0.3, 0.03, '#d9dde3', 0.58, 0.78, 0, g); reg('bike', g); }
  // station gate with a blue sign (label drawn as a tag)
  { const g = G(); for (const x of [-0.75, 0.75]) rbox(0.16, 2.2, 0.16, 0.04, '#9aa3ad', x, 1.1, 0, g);
    rbox(1.9, 0.14, 0.4, 0.04, '#7a838e', 0, 2.25, 0, g); rbox(1.3, 0.38, 0.06, 0.06, '#2f6fe0', 0, 1.95, 0.05, g); rbox(1.18, 0.05, 0.065, 0.02, '#ffffff', 0, 1.82, 0.05, g);
    reg('station', g); }
  // shock-wave ring (sonic boom), radius 1 -> scaled
  { const m = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 });
    const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 48), m); const g = G(); g.add(r); g.userData.mat = m; reg('ring', g); }
  // dust puffs
  { const g = G(); g.userData.items = []; for (let i = 0; i < 8; i++) g.userData.items.push(sph(0.14, M('#e9e2d6', 1), 0, 0, 0, g)); reg('dust', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
// walking pose: arms swing alternately, body bobs; f = steps per second (visual)
const walk = (s, lt, f = 2, amp = 0.9, who = 'hero') => { const h = s[who].userData, ph = Math.sin(lt * f * Math.PI);
  h.arm('L', 0.3 + amp * ph, 0.15, 0.5); h.arm('R', 0.3 - amp * ph, 0.15, 0.5); h.hand('L', 'gu'); h.hand('R', 'gu');
  s[who].position.y = 0.04 * Math.abs(ph); h.body.rotation.z = 0.04 * ph; };
const dustAt = (s, x, z, lt, t0) => { const d = s.P.dust; d.visible = lt > t0; d.userData.items.forEach((p, i) => { const u = k(lt, t0, t0 + 1.0), a = i / 8 * Math.PI;
  p.position.set(x - Math.cos(a) * 0.9 * ease(u) - 0.2, 0.1 + Math.sin(a) * 0.35 * ease(u), z + (i % 2 ? 0.2 : -0.2)); p.scale.setScalar(0.14 * (0.6 + 1.2 * u) * (1 - 0.6 * u)); }); };
// cold open / recall: the train speeds by, hero zooms in from the left, overtakes it, BOOM -> the train flies off into the sky
function boom(s, lt, t0) {
  const sh = s.P.shin, kick = k(lt, t0, t0 + 1.4);
  sh.visible = true; sh.position.set(-3.4 + 6 * Math.min(lt, t0) + 2.5 * ease(kick), 0.0 + 4.5 * ease(kick) * ease(kick), -1.7 - 1.5 * ease(kick)); sh.rotation.set(0.2 * kick, 0, 0.9 * ease(kick));
  const run = ease(k(lt, 0, t0)); place(s.hero, -5 + 5 * run, 0.45, run < 1 ? 0.9 : 0.9 * (1 - ease(k(lt, t0 + 0.2, t0 + 0.7))));
  const r = s.P.ring, u = k(lt, t0, t0 + 0.9); r.visible = lt > t0 && u < 1; r.position.set(0, 1.0, 0.3); r.scale.setScalar(0.3 + 3.2 * u); r.userData.mat.opacity = 0.8 * (1 - u);
  dustAt(s, 0, 0.45, lt, t0);
  return lt >= t0;
}

const plan = [
  // 0) cold open (flash-forward of #11): hero overtakes a bullet train on foot -> sonic BOOM -> the train flies off -> push in, "…おさんぽ♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.9, 8.2], p1: [0.05, 1.42, 3.4], l0: [0.0, 1.5, -0.6], l1: [0.0, 1.38, 0.4], hold: 1.5, dur: 2.5 },
    shake: [[0.25, 0.09, 0.7]], lines: [[0.0, 1.1]],
    sfx: [[0.0, 'whoosh_gust', -10], [0.25, 'impact_doon', -8], [0.28, 'text_impact', -11], [0.9, 'comic_fall', -13], [2.3, 'comic_pico', -12]],
    stamps: [{ t: 0.25, text: 'ドーン!!', x: 540, y: 420, rot: -6, color: YEL, size: 100, dur: 1.3 },
      { t: 0.45, text: '時速1,229km', x: 300, y: 1180, rot: -8, color: '#ffffff', size: 64, dur: 1.0 },
      { t: 2.3, text: '…おさんぽ♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) { const hit = boom(s, lt, 0.25); const h = s.hero.userData;
      if (!hit) walk(s, lt, 14, 1.2); else if (lt < 1.4) { h.arm('L', 0.3, 0.9, 0.2); h.arm('R', 0.3, 0.9, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa'); }
      else { h.arm('L', 0.1, 0.2, 0.3); h.hand('L', 'gu'); h.reach('R', V(0.38, 1.15, 0.55)); h.hand('R', 'choki'); }
      h.face(!hit ? { lid: 0.2, brow: 0.6, look: [0.6, 0], mouth: 'smile' } : lt < 1.6 ? { lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.4], mouth: 'o', open: 0.8 } : SMUG);
      h.head.rotation.z = lt > 1.8 ? 0.12 * ease(k(lt, 1.8, 2.3)) : 0; } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#7bd88f', '#effbf1', '#35b6ff'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.2, 'comic_surprise', -12]],
    stamps: [{ t: 2.3, text: '2倍!?', x: 800, y: 1080, rot: 8, color: RED, size: 76, dur: 1.0 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.4, 0.25); walk(s, lt, 2, 0.8);
      h.face(lt < 2.2 ? { lid: 0.3, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 2) now: 80 m/min, 10 minutes to the station
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['station'], hud: ['歩く速さ', '分速80m'], hudColor: YEL,
    cam: { p0: [0.2, 1.55, 5.6], p1: [0.2, 1.5, 5.1], l0: [0.2, 1.3, 0] },
    sfx: [[0.9, 'text_pa', -10], [2.8, 'text_pa', -10]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '分速 [80m]', y: 480, size: 80, border: CY, sub: '不動産の表示ルール「徒歩1分=80m」' }] : []; },
    tags(lt) { return lt > 2.8 ? [{ t: 2.8, text: '駅まで 徒歩10分', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { place(s.P.station, 1.25, -0.7); const h = s.hero.userData; place(s.hero, -0.55, 0.4, 0.5); walk(s, lt, 1.8, 0.7);
      h.face(lt < 2.8 ? { lid: 0.4, brow: 0.3, look: [0.6, 0.2], mouth: 'smile' } : { lid: 0.3, brow: 0.5, look: [0, 0], mouth: 'o', open: 0.5 }); } },
  // 4) day 4: 38 km/h, 1:15 to the station
  { sc: 'st', say: ['d4'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['station', 'clock'], hud: ['4日目', '時速38km'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 4.9], l0: [0.0, 1.3, 0] }, lines: [[0.4, 2.2]],
    sfx: [[0.8, 'text_pa', -10], [3.2, 'text_pa', -10], [3.4, 'comic_pico', -12]],
    cards(lt) { return lt > 0.8 ? (lt < 3.1 ? [{ t: 0.8, text: '時速 [38km]', y: 480, size: 80, border: CY, sub: '原付の制限30km/hより速い' }]
      : [{ t: 3.1, text: '駅まで [1分15秒]', y: 480, size: 74, border: YEL, sub: '800m÷時速38.4km（試算）' }]) : []; },
    act(lt, s) { place(s.P.station, 0.95, -0.8); const c = s.P.clock; c.visible = true; c.position.set(-1.0, 1.9, -0.6); c.scale.setScalar(1.1); c.userData.mh.rotation.z = -lt * 6;
      const h = s.hero.userData; const arrive = ease(k(lt, 0.3, 2.4)); place(s.hero, -1.5 + 1.9 * arrive, 0.45, 0.6 * (1 - arrive));
      if (arrive < 1) walk(s, lt, 7, 1.1); else { h.arm('L', 2.9, 0.4, 0.1); h.hand('L', 'pa'); h.arm('R', 0.2, 0.3, 0.3); h.hand('R', 'gu'); }
      h.face(arrive < 1 ? { lid: 0.2, brow: 0.6, look: [0.7, 0], mouth: 'o', open: 0.5 } : { lid: 0.4, brow: 0.6, look: [0, 0.1], mouth: 'smile' }); } },
  // 5) day 7: 307 km/h, walking side by side with the bullet train
  { sc: 'st', say: ['d7'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ffd23a'], show: ['shin'], hud: ['7日目', '時速307km'], hudColor: YEL,
    cam: { p0: [0.3, 1.6, 6.6], p1: [0.3, 1.55, 6.1], l0: [0.3, 1.3, -0.5] }, lines: [[0.2, 4.6]], shake: [[0.2, 0.02, 4.2]],
    sfx: [[0.0, 'whoosh_gust', -12], [0.7, 'text_pa', -10], [3.2, 'text_pa', -10], [3.4, 'comic_stupid', -12]],
    cards(lt) { return lt > 0.7 ? [{ t: 0.7, text: '時速 [307km]', y: 480, size: 80, border: CY, sub: '新幹線の最高は時速320km' }] : []; },
    tags(lt) { return lt > 3.2 ? [{ t: 3.2, text: '新幹線と ならんで歩く', x: 540, y: 1560, h: 92, bg: YEL }] : []; },
    act(lt, s) { const sh = s.P.shin; sh.visible = true; sh.position.set(0.2 + 0.03 * Math.sin(lt * 9), 0, -1.6); const h = s.hero.userData; place(s.hero, 0.0, 0.5, 0.35);
      walk(s, lt, 12, 0.9); if (lt > 3.2) { h.arm('R', 2.9, 0.5, 0.1); h.hand('R', 'pa'); h.arm('R', 2.7 + 0.25 * Math.sin(lt * 10), 0.6, 0.1); }
      h.face(lt < 3.2 ? { lid: 0.2, brow: 0.5, look: [0.7, 0.1], mouth: 'smile' } : SMUG); } },
  // 6) 122 steps a second, 9 seconds to the station
  { sc: 'st', say: ['step'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#35d0ff'], show: ['station'], hud: ['足', '1秒に122歩'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.45, 4.5], l0: [0.0, 1.25, 0] }, lines: [[0.3, 2.0]],
    sfx: [[0.4, 'giant_step', -15], [1.2, 'text_pa', -10], [2.9, 'text_pa', -10], [3.1, 'comic_pico', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '1秒に [122歩]', y: 480, size: 80, border: CY, sub: '歩幅70cm・ふつう1分114歩×64（試算）' }] : []; },
    tags(lt) { return lt > 2.9 ? [{ t: 2.9, text: '駅まで たった9秒', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    stamps: [{ t: 0.4, text: 'ドドドド', x: 250, y: 1200, rot: -8, color: RED, size: 72, dur: 1.8 }],
    act(lt, s) { place(s.P.station, 1.3, -1.0); const h = s.hero.userData; place(s.hero, -0.25, 0.45, 0.3);
      if (lt < 2.9) { walk(s, lt, 30, 0.6); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.5, 0], mouth: 'o', open: 0.9 }); }
      else { h.arm('L', 0.2, 0.3, 0.3); h.reach('R', V(0.15, 1.55, 0.6)); h.hand('R', 'choki'); h.hand('L', 'gu'); h.face(SMUG); } } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.32, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); h.arm('L', 0.6, 0.2, 1.8); h.arm('R', 0.6, 0.2, 1.8); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) headwind: 320 kg of force, 5x body weight
  { sc: 'st', say: ['wind'], pre: 0.12, pal: ['#7fd3c0', '#e8faf5', '#ff5a4f'], show: [], hud: ['向かい風', '体重の5倍'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.5, 5.2], l0: [0.0, 1.4, 0] }, lines: [[0.0, 3.8]], shake: [[0.0, 0.03, 3.6]],
    sfx: [[0.0, 'amb_wind', -13, 3.6], [1.2, 'text_pa', -10], [2.6, 'text_pa', -10], [2.8, 'comic_shock2', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '向かい風 [320kg]分', y: 480, size: 70, border: RED, sub: '時速307km・正面0.7m²・Cd1.0（試算）' }] : []; },
    tags(lt) { return lt > 2.6 ? [{ t: 2.6, text: '体重60kgの5倍', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.1, 0.4, 0.5); h.body.rotation.z = -0.18 - 0.04 * Math.sin(lt * 20);
      h.arm('L', 1.2, 0.1, 0.4); h.arm('R', 1.2, 0.1, 0.4); h.hand('L', 'gu'); h.hand('R', 'gu'); h.head.rotation.z = 0.15;
      h.face({ lid: 0.6, brow: -1, browY: 1, look: [0.3, 0], mouth: 'flat' }); } },
  // 9) energy: 13 onigiri just to get to the station
  { sc: 'st', say: ['food'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: ['onigiri'], hud: ['駅まで', 'おにぎり13個'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[1.3, 'text_pa', -10], [1.5, 'comic_eat', -12], [2.7, 'comic_fall', -13]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: 'おにぎり [13個]分', y: 480, size: 74, border: RED, sub: '2,400kcal・筋肉の効率25%（試算）' }] : []; },
    act(lt, s) { const o = s.P.onigiri; o.visible = true; o.position.set(0.7, 0.0, 0.2); o.scale.setScalar(1.9); const n = Math.floor(13 * k(lt, 1.3, 2.6));
      o.userData.items.forEach((it, i) => { it.visible = i < Math.max(1, n); });
      const h = s.hero.userData; place(s.hero, -0.45, 0.45, 0.2); h.reach('R', V(0.3, 0.95, 0.5)); h.hand('R', 'pa'); h.arm('L', 0.4, 0.3, 1.6); h.hand('L', 'pa');
      h.face(lt < 2.6 ? { lid: 0.2, brow: -0.6, browY: 1, look: [0.6, -0.2], mouth: 'o', open: 0.7 } : { lid: 0.7, brow: -1, look: [0, -0.2], mouth: 'flat' });
      if (lt > 2.6) h.body.rotation.z = 0.12 * ease(k(lt, 2.6, 3.0)); } },
  // 10) braking distance 530 m: slides past the station
  { sc: 'st', say: ['brake'], pre: 0.12, pal: ['#7fa8ff', '#eaf0ff', '#ff5a4f'], show: ['station'], hud: ['止まるのに', '530m'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.6], p1: [0.0, 1.5, 5.1], l0: [0.0, 1.3, 0] }, lines: [[0.0, 2.2]],
    sfx: [[0.1, 'whoosh_slide', -10], [1.3, 'text_pa', -10], [2.7, 'comic_surprise', -12]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '止まるのに [530m]', y: 480, size: 74, border: RED, sub: '時速307km・靴の摩擦0.7（試算）' }] : []; },
    tags(lt) { return lt > 2.7 ? [{ t: 2.7, text: '駅を 通りすぎる', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    stamps: [{ t: 0.3, text: 'キキーッ!', x: 300, y: 1180, rot: -8, color: RED, size: 74, dur: 1.6 }],
    act(lt, s) { const st = s.P.station; place(st, 0.4 - 3.4 * ease(k(lt, 0.0, 2.6)), -0.9); const h = s.hero.userData; place(s.hero, 0.2, 0.45, 0.3);
      h.body.rotation.z = 0.3; h.arm('L', 2.0, 0.6, 0.2); h.arm('R', 2.0, 0.6, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa'); dustAt(s, 0.1, 0.45, lt % 0.9, 0);
      h.face(lt < 2.6 ? { lid: 0, brow: -0.9, browY: 1, look: [-0.6, 0], mouth: 'o', open: 1 } : { lid: 0.3, brow: -1, browY: 1, look: [-0.7, 0], mouth: 'flat' }); } },
  // 11) day 9: faster than sound, BOOM every step (recall of the cold open)
  { sc: 'st', say: ['d9'], pre: 0.12, pal: HOOK, show: [], hud: ['9日目', '音速こえ'], hudColor: RED,
    cam: { p0: [0.0, 1.9, 8.2], p1: [0.0, 1.8, 7.6], l0: [0.0, 1.5, -0.6] }, shake: [[0.35, 0.08, 0.6], [2.9, 0.06, 0.5]], lines: [[0.0, 1.2]],
    sfx: [[0.05, 'whoosh_gust', -11], [0.35, 'impact_doon', -9], [1.0, 'text_pa', -10], [2.95, 'impact_don', -10]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '時速 [1,229km]', y: 480, size: 76, border: RED, sub: '音速は時速1,225km（15℃）' }] : []; },
    stamps: [{ t: 0.35, text: 'ドーン!!', x: 540, y: 880, rot: -6, color: YEL, size: 90, dur: 1.0 }, { t: 2.95, text: 'ドーン!!', x: 760, y: 880, rot: 6, color: YEL, size: 84, dur: 0.8 }],
    act(lt, s) { const hit = boom(s, lt, 0.35); const h = s.hero.userData;
      if (!hit) walk(s, lt, 14, 1.2); else { h.arm('L', 0.3, 0.9, 0.2); h.arm('R', 0.3, 0.9, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa'); }
      h.face(!hit ? { lid: 0.2, brow: 0.6, look: [0.6, 0], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.4], mouth: 'o', open: 0.8 }); } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '歩きたい', x: 300, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: 'ゆっくりでいい', x: 760, y: 1130, h: 92, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1430, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1530, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.3); walk(s, lt, 1.5, 0.5);
      h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも歩く速さが', '[毎日2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['歩く速さ', '毎日2倍'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
