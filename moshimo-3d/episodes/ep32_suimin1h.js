// ep32_suimin1h (pop / arm A): もしも睡眠が1日1時間で済んだら？
// 型は sp_geppu2x。台本・数字・小道具は自作。前提（試算）: ふつうの睡眠 8時間 → 1時間。浮く時間 = 7時間/日。
//   1年 7×365 = 2,555時間 = 106.5日 / 本1冊4時間 → 638冊 / 時給1,121円(2025年度 最低賃金の全国加重平均・厚労省) → 7,847円/日・286万円/年
//   80年 × 7時間/日 = 23.3年 / 起きている分の追加消費 0.4メッツ×60kg×7h ≒ 168kcal ≒ おにぎり1個
//   1万時間 ÷ 7時間 = 1,429日 ≒ 3.9年 / スマホ 165.1分(博報堂DYMP メディア定点調査2025) + 7時間 = 585分 ≒ 9時間45分
import { run, THREE, V, clamp, ease, lerp, rng } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep32_suimin1h.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const NIGHT = ['#2a3270', '#3a4386', '#ffd23a'], HOOK = ['#ff9f5a', '#fbe9d0', '#3f6fd8'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  { const b = G(); rbox(0.24, 0.32, 0.05, 0.012, '#5aa9ff', 0, 0, 0, b); rbox(0.22, 0.3, 0.052, 0.01, '#ffffff', 0.008, 0, 0, b); reg('rbook', b); }
  { // tear-off calendar: 14 sheets, userData.items
    const c = G(); rbox(0.56, 0.7, 0.04, 0.02, '#2c3b6b', 0, 0, -0.02, c); c.userData.items = [];
    for (let i = 0; i < 14; i++) { const s = G(); rbox(0.5, 0.6, 0.006, 0.01, '#ffffff', 0, -0.02, 0, s); rbox(0.5, 0.12, 0.008, 0.01, '#e2463c', 0, 0.22, 0.001, s);
      for (const [x, y] of [[-0.12, 0.0], [0.0, 0.0], [0.12, 0.0], [-0.12, -0.13], [0.0, -0.13], [0.12, -0.13]]) rbox(0.07, 0.07, 0.008, 0.01, '#d9dde3', x, y, 0.002, s);
      s.position.z = 0.01 + i * 0.004; c.add(s); c.userData.items.push(s); }
    reg('cal', c); }
  { const o = G(); sph(0.085, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.1, 0.085, 0.13, 0.02, '#20301f', 0, -0.035, 0, o); reg('oni1', o); }
  { const t = G(); t.userData.items = []; for (let i = 0; i < 3; i++) { const z = G(); z.userData.s = 0.06 + i * 0.03; t.add(z); t.userData.items.push(z);
      const s = z.userData.s; for (const [x0, y0, x1, y1] of [[-1, 1, 1, 1], [1, 1, -1, -1], [-1, -1, 1, -1]]) { const m = rbox(Math.hypot(x1 - x0, y1 - y0) * s * 0.5 + 0.02, 0.025, 0.01, 0.01, '#ffffff', (x0 + x1) * s * 0.25, (y0 + y1) * s * 0.25, 0, z); m.rotation.z = Math.atan2(y1 - y0, x1 - x0); } }
    reg('zzz', t); }
  { const m = G(); sph(0.22, '#fff3a8', 0, 0, 0, m); sph(0.2, '#2a3270', 0.11, 0.06, 0.05, m); reg('moon', m); }
}

// clock on the back wall showing h:mm
function clockAt(s, x, y, z, h, mm, sc = 1) {
  const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -mm / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h % 12 + mm / 60) / 12 * Math.PI * 2;
}
// the book tower (34 books) at group position; n visible; topple u 0..1 onto a pile around the hero (pile center px in world)
const PR = (() => { const r = rng(7), a = []; for (let i = 0; i < 34; i++) a.push([r() - 0.5, r(), r() - 0.5, r() * 6, r() * 6, r() * 6]); return a; })();
function bookTower(s, bx, bz, n, u, hx) {
  const b = s.P.books; b.visible = true; b.position.set(bx, 0, bz); b.rotation.set(0, 0, 0);
  b.userData.items.forEach((it, i) => {
    it.visible = i < n; const y0 = 0.023 + i * 0.046, d = clamp(u * 1.25 - (1 - i / 34) * 0.25);
    const tx = hx - bx + PR[i][0] * 0.95, ty = 0.05 + PR[i][1] * 0.82, tz = 0.18 + PR[i][2] * 0.5;
    if (d <= 0) { it.position.set(Math.sin(i * 2.3) * 0.03 - u * 0.5 * (y0 / 1.6), y0, Math.cos(i * 1.7) * 0.02); it.rotation.set(0, Math.sin(i * 1.3) * 0.12, u * 0.6); return; }
    const e = ease(d); it.position.set(lerp(-y0 * 0.3, tx, e), lerp(y0, ty, e) + Math.sin(e * Math.PI) * 0.35, lerp(0, tz, e));
    it.rotation.set(PR[i][3] * e, PR[i][4] * e, 0.6 + PR[i][5] * e);
  });
}
function sleeper(s, who, bx) { // lying on the bed, face to camera, eyes shut
  const b = s.P.bed; b.visible = true; b.position.set(bx, 0, -0.5); b.rotation.y = Math.PI;
  who.visible = true; who.position.set(bx - 0.86, 0.8, -0.5); who.rotation.set(0, 0, -Math.PI / 2);
  const u = who.userData; u.face({ lid: 1, mouth: 'flat' }); u.arm('L', 0, 0.2, 0.4); u.arm('R', 0, 0.2, 0.4);
}
function zzz(s, p, lt) { const z = s.P.zzz; z.visible = true; z.position.copy(p); z.userData.items.forEach((m, i) => { const u = (lt * 0.6 + i / 3) % 1; m.position.set(u * 0.25, u * 0.45, 0); m.scale.setScalar(0.5 + u); }); }

const plan = [
  // 0) cold open (flash-forward of #5): at 3 a.m. the tower of finished books falls on the hero; push in, proud face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: NIGHT, dim: 0.95, show: ['lamp', 'moon', 'rbook'],
    cam: { p0: [0.15, 1.45, 5.6], p1: [-0.2, 1.42, 2.55], l0: [0.15, 1.05, 0], l1: [-0.2, 1.38, 0.2], hold: 1.6, dur: 2.3 },
    shake: [[0.25, 0.08, 0.7]], lines: [[0.25, 0.9]],
    sfx: [[0.22, 'collapse', -8], [0.25, 'impact_don', -9], [0.32, 'comic_fall', -11], [1.6, 'whoosh_slide', -13], [2.35, 'comic_pico', -10]],
    stamps: [{ t: 0.25, text: 'ドサドサッ!!', x: 330, y: 1130, rot: -8, color: YEL, size: 112, dur: 1.1 },
      { t: 2.35, text: 'まだ夜中の3時♪', x: 690, y: 1150, rot: 6, color: '#ffffff', size: 70, dur: 0.65 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0.2); s.hero.rotation.y = 0.25 * (1 - ease(k(lt, 1.6, 2.1)));
      s.P.moon.position.set(-1.25, 2.3, -2.2); clockAt(s, 0.9, 2.05, -2.3, 3, 0, 1.1);
      bookTower(s, 0.55, 0.0, 34, ease(k(lt, 0.0, 0.7)), -0.2);
      const rb = s.P.rbook; if (lt < 0.25) { rb.position.set(-0.05, 1.08, 0.55); rb.rotation.set(-0.5, 0, 0); h.reach('R', V(0.05, 1.05, 0.52)); h.reach('L', V(-0.15, 1.05, 0.52)); h.face({ lid: 0.25, look: [0, -0.6], mouth: 'smile' }); }
      else if (lt < 1.6) { rb.position.set(-0.75, 1.5 + (lt - 0.25) * 0.3, 0.4); rb.rotation.set(lt * 6, lt * 3, 0); h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.7, 0.6], mouth: 'o', open: 1.1 }); h.arm('L', 0.4, 0.9, 1.2); h.arm('R', 0.4, 0.9, 1.2); h.head.rotation.z = -0.1; }
      else { rb.visible = false; h.face({ lid: 0.45, brow: 0.5, look: [0, 0], mouth: 'smile' }); h.arm('L', 0.3, 0.5, 1.0); h.arm('R', 0.2, 2.4, 0.3); h.hand('R', 'choki'); h.head.rotation.z = 0.1 * ease(k(lt, 2.2, 2.5)); }
    } },
  // 1) hook: title. wakes up fresh after 1 hour
  { sc: 'st', say: ['hook'], pal: HOOK, show: ['bed'],
    cam: { p0: [0.1, 1.45, 4.7], p1: [0.1, 1.43, 4.4], l0: [0.1, 1.2, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.4, 'comic_boyon', -12]],
    tags: [{ t: 1.5, text: '1日が、23時間に…', x: 500, y: 640, h: 84, bg: RED, fg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.4, 1.0)); s.P.bed.position.set(-0.55, 0, -0.6); s.hero.position.set(0.35, Math.sin(a * Math.PI) * 0.15, 0.2); s.hero.rotation.y = -0.2;
      h.arm('L', 0.1, lerp(0.3, 2.8, a), 0.2); h.arm('R', 0.1, lerp(0.3, 2.8, a), 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(a < 0.5 ? { lid: 0.8, mouth: 'o', open: 0.8 } : { lid: 0, brow: 0.4, mouth: 'smile', look: [0.2, 0.2] });
    } },
  // 2) normal 8 h vs you 1 h
  { sc: 'st', say: ['first'], pre: 0.2, hold: 0.5, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, hud: ['睡眠', '1日1時間'],
    cam: { p0: [0.22, 1.45, 6.0], p1: [0.22, 1.43, 5.8], l0: [0.22, 1.0, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.5, 'text_pa', -11], [2.2, 'comic_pico', -13]],
    cards(lt) { const t0 = this.lt.first + D('first') - 0.2; return lt > t0 ? [{ t: t0, text: '毎日 [+7時間]', y: 480, size: 64, border: CY }] : []; },
    tags(lt) { const p2 = scr(S, V(0.6, 1.2, -0.5), 0, -120), p1 = scr(S, headPos(S.hero), 0, -270);
      return [{ t: 0.3, text: 'ふつう 8時間', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > this.lt.first + 1.2 ? [{ t: this.lt.first + 1.2, text: 'あなた 1時間', x: p1[0], y: p1[1], h: 84, bg: CY }] : [])]; },
    act(lt, s) {
      sleeper(s, s.hero2, 0.3); zzz(s, V(0.8, 1.25, -0.4), lt);
      const h = s.hero.userData; s.hero.position.set(-0.42, Math.abs(Math.sin(lt * 5)) * 0.05, 0.5); s.hero.rotation.y = 0.3;
      h.arm('R', 0.2, 2.5, 0.3); h.hand('R', 'pa'); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0, brow: 0.4, mouth: 'smile', look: [0.5, 0] });
    } },
  // 4) 2,555 h a year = 106 days: calendar pages fly off
  { sc: 'st', say: ['b2'], pre: 0.15, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['cal'], hud: ['1年で', '2555時間'],
    cam: { p0: [0.1, 1.45, 4.6], p1: [0.1, 1.43, 4.3], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'whoosh_switch2', -13], [0.9, 'whoosh_switch1', -14], [1.8, 'text_pa', -10], [2.6, 'comic_surprise', -12]],
    cards(lt) { return [{ t: 0.3, text: '[2555時間]', y: 480, size: 70, border: CY }, ...(lt > this.lt.b2 + 2.0 ? [{ t: this.lt.b2 + 2.0, text: '＝ まるまる [106日] 分', y: 610, size: 56, border: YEL }] : [])]; },
    act(lt, s) {
      const c = s.P.cal; c.position.set(0.42, 1.45, -0.3);
      c.userData.items.forEach((p, i) => { const j = 13 - i, f = Math.max(0, lt - 0.3 - j * 0.18); p.visible = f < 1.2; p.position.set(f * 0.9, -f * f * 0.9 + f * 0.6, 0.01 + i * 0.004 + f * 0.4); p.rotation.set(-f * 2, 0, -f * 3); });
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.2); s.hero.rotation.y = 0.35; h.reach('R', V(0.2, 1.35, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.2, 0.5, 1.4);
      h.face(lt < 2.4 ? { lid: 0.1, look: [0.8, 0.2], mouth: 'smile' } : { lid: 0, brow: -0.5, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 5) 638 books a year (the cold open, in its place): tower grows, then falls on him
  { sc: 'st', say: ['book'], pre: 0.15, hold: 0.9, pal: ['#5ab8ff', '#e3f3ff', '#ffffff'], show: ['rbook'], hud: ['読書', '638冊/年'],
    cam: { p0: [0.2, 1.5, 5.3], p1: [0.15, 1.45, 4.8], l0: [0.15, 1.1, 0] },
    shake: [[0.15 + D('book') + 0.35, 0.06, 0.5]],
    sfx: [[0.3, 'comic_pico', -14], [0.8, 'comic_pico', -14], [1.3, 'comic_pico', -14], [1.6, 'text_pa', -10], [0.15 + D('book') + 0.25, 'collapse', -10]],
    tags(lt) { const p = scr(S, V(0.55, 1.7, 0), 0, -60); return [{ t: 1.4, text: '1年で 638冊', x: p[0], y: p[1], h: 84, bg: YEL }]; },
    stamps: [{ t: 0.15 + D('book') + 0.3, text: 'ドサッ!', x: 330, y: 1130, rot: -8, color: YEL, size: 100, dur: 0.8 }],
    note: '1冊4時間で読むとして計算（試算）',
    act(lt, s) {
      const fall = 0.15 + D('book') + 0.1, n = Math.round(34 * ease(k(lt, 0.1, 2.0))), h = s.hero.userData;
      s.hero.position.set(-0.3, 0, 0.2); s.hero.rotation.y = 0.3; bookTower(s, 0.5, 0.0, n, ease(k(lt, fall, fall + 0.7)), -0.3);
      const rb = s.P.rbook; rb.visible = lt < fall; rb.position.set(-0.12, 1.05, 0.55); rb.rotation.set(-0.5, 0.3, 0); h.reach('R', V(-0.02, 1.02, 0.52)); h.reach('L', V(-0.22, 1.02, 0.5));
      h.face(lt < fall ? { lid: 0.3, look: [0.1, -0.6], mouth: 'smile' } : { lid: 0, brow: -0.8, browY: 1, look: [0.6, 0.6], mouth: 'o', open: 1.1 });
      if (lt >= fall) { h.arm('L', 0.4, 0.9, 1.2); h.arm('R', 0.4, 0.9, 1.2); }
    } },
  // 6) part-time job: 2.86 million yen a year
  { sc: 'st', say: ['job'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#3fae5b'], show: ['coinsA', 'bill'], hud: ['バイト', '年286万円'], hudColor: YEL,
    cam: { p0: [0.1, 1.4, 4.4], p1: [0.1, 1.38, 4.1], l0: [0.1, 1.2, 0] },
    sfx: [[0.4, 'coin_toss', -11], [1.0, 'coin_toss', -12], [1.6, 'coin_toss', -12], [2.3, 'text_pa', -10], [3.2, 'comic_jajean', -12]],
    cards: [{ t: 2.3, text: '1年で [286万円]', y: 480, size: 66, border: YEL, sub: '時給1,121円 × 毎日7時間' }],
    note: '時給は最低賃金の全国加重平均（厚労省 2025年度）',
    act(lt, s) {
      const c = s.P.coinsA, n = Math.round(32 * ease(k(lt, 0.3, 3.0))); c.position.set(0.5, 0, 0.1); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData, b = s.P.bill; s.hero.position.set(-0.35, 0, 0.25); s.hero.rotation.y = 0.3;
      b.position.set(-0.1, 1.35 + Math.sin(lt * 4) * 0.03, 0.5); b.rotation.set(0, 0, Math.sin(lt * 6) * 0.15); h.reach('R', V(-0.02, 1.3, 0.48)); h.arm('L', 0.1, 0.6, 1.6);
      h.face(lt < 2.3 ? { lid: 0.2, look: [0.6, -0.3], mouth: 'smile' } : { lid: 0.55, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 3) * 0.06;
    } },
  // 7) lifetime: +23 years awake (sun and moon race across)
  { sc: 'st', say: ['life'], pre: 0.15, pal: ['#8fd3ff', '#eef6ff', '#2a5bd7'], show: ['sun', 'moon'], hero2: true, hud: ['一生で', '+23年'],
    cam: { p0: [0.05, 1.5, 4.9], p1: [0.05, 1.48, 4.6], l0: [0.05, 1.3, 0] },
    sfx: [[0.2, 'whoosh_gust', -14], [1.6, 'text_pa', -10], [1.8, 'sparkle', -13]],
    cards: [{ t: 1.6, text: '起きている時間 [+23年]', y: 480, size: 60, border: CY }],
    note: '80年 × 毎日7時間で計算（試算）',
    act(lt, s) {
      const a = lt * 2.2; s.P.sun.position.set(Math.cos(a) * 1.6, 2.0 + Math.sin(a) * 0.5, -1.8); s.P.sun.scale.setScalar(0.45); s.P.moon.position.set(-Math.cos(a) * 1.6, 2.0 - Math.sin(a) * 0.5, -1.8);
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero.position.set(-0.45, 0, 0.2); s.hero.rotation.y = 0.25; s.hero2.position.set(0.55, 0, 0.1); s.hero2.rotation.y = -0.35;
      h.arm('L', 0.1, 2.5, 0.3); h.arm('R', 0.1, 2.5, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.06; h.face({ lid: 0.2, brow: 0.4, mouth: 'smile' });
      h2.face({ lid: 0, brow: -0.4, browY: 1, look: [-0.7, 0], mouth: 'o', open: 0.8 }); h2.arm('R', 0.3, 0.4, 1.3);
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) alone at night: everybody's asleep
  { sc: 'st', say: ['alone'], pre: 0.15, pal: NIGHT, dim: 0.75, show: ['moon'], hero2: true, hud: ['夜中', 'ひとり7時間'], hudColor: RED,
    cam: { p0: [0.22, 1.45, 6.0], p1: [0.22, 1.43, 5.8], l0: [0.22, 1.0, 0] },
    sfx: [[0.2, 'amb_night', -16, 2.6], [1.3, 'comic_stupid', -13]],
    stamps: [{ t: 1.2, text: 'シーン…', x: 330, y: 1130, rot: -6, color: '#ffffff', size: 92, dur: 1.4 }],
    tags: [{ t: 1.6, text: '年2555時間、ひとり', x: 520, y: 520, h: 74, bg: '#ffffff' }],
    act(lt, s) {
      s.P.moon.position.set(-1.2, 2.3, -2.2); sleeper(s, s.hero2, 0.3); zzz(s, V(0.8, 1.25, -0.4), lt);
      const h = s.hero.userData; s.hero.position.set(-0.42, 0, 0.5); s.hero.rotation.y = 0.45; s.hero.updateMatrixWorld(true);
      h.reach('R', V(-0.05, 1.0, 0.5)); h.hand('R', 'pa'); h.arm('L', 0.05, 0.15, 0.2);
      h.face(lt < 1.2 ? { lid: 0.1, look: [0.8, -0.2], mouth: 'smile' } : { lid: 0.5, brow: -0.9, look: [0, -0.3], mouth: 'flat' }); h.head.rotation.x = lt > 1.2 ? 0.15 : 0;
    } },
  // 10) hungry: one onigiri every night
  { sc: 'st', say: ['food'], pre: 0.15, pal: ['#ff8a4a', '#ffe1cc', '#7a2e1a'], show: ['oni1'], hud: ['夜食', '+約170kcal'], hudColor: RED,
    cam: { p0: [0.05, 1.5, 3.9], p1: [0.05, 1.48, 3.6], l0: [0.05, 1.38, 0] },
    sfx: [[0.6, 'comic_boyon', -12], [2.0, 'comic_eat', -11], [2.5, 'text_pa', -11]],
    stamps: [{ t: 0.6, text: 'グゥ〜', x: 760, y: 1150, rot: 8, color: YEL, size: 92, dur: 1.0 }],
    cards: [{ t: 2.5, text: '毎晩 [おにぎり1個] 分', y: 480, size: 60, border: RED }],
    note: '起きている7時間の消費 0.4メッツ×60kg で計算（試算）',
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 1.4, 2.0)); s.hero.position.set(0, 0, 0.2); s.hero.rotation.y = 0.1; s.hero.updateMatrixWorld(true);
      const mouth = h.head.localToWorld(V(0, -0.2, 0.55)), hp = V(0.35, 1.0, 0.55).lerp(mouth, a); s.P.oni1.position.copy(hp); s.P.oni1.rotation.set(0, 0, 0);
      h.reach('R', hp.clone().add(V(0.06, -0.06, -0.04)));
      if (lt < 1.4) { h.reach('L', V(-0.05, 0.75, 0.32)); h.face({ lid: 0.3, brow: -0.6, look: [0.6, -0.4], mouth: 'flat' }); }
      else { h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.7, brow: 0.3, mouth: 'o', open: 1.2 }); }
    } },
  // 11) good news / bad news
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: ['phone', 'rbook'],
    cam: { p0: [0.1, 1.48, 4.2], p1: [0.1, 1.46, 3.9], l0: [0.05, 1.32, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', '1万時間'] : ['悪いニュース', 'スマホ9時間']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 1.2, 'phone_vibe', -14]],
    tags(lt) { const a = this.lt.bad; return lt < a ? [{ t: 1.4, text: '1万時間 → 約4年', x: 520, y: 520, h: 84, bg: YEL }] : [{ t: a + 1.4, text: '165分 ＋ 7時間 ≒ 9時間45分', x: 520, y: 520, h: 70, bg: '#ffffff' }]; },
    note: 'スマホ165.1分/日：博報堂DYMP メディア定点調査2025',
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad; s.hero.position.set(0, 0, 0.2); s.hero.rotation.y = 0.1;
      s.P.phone.visible = late; s.P.rbook.visible = !late;
      if (!late) { const b = s.P.rbook; b.position.set(0.32, 1.65, 0.45); b.rotation.set(0, 0, -0.2); h.reach('R', V(0.3, 1.55, 0.42)); h.arm('L', 0.2, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.5, mouth: 'smile', look: [0.5, 0.4] }); h.body.position.y = Math.abs(Math.sin(lt * 5)) * 0.05; }
      else { const p = s.P.phone, pp = V(0.0, 1.12, 0.6); p.position.copy(pp); p.rotation.set(-0.5, 0, 0); h.reach('R', pp.clone().add(V(0.07, -0.08, -0.03))); h.reach('L', pp.clone().add(V(-0.07, -0.08, -0.03)));
        h.face({ lid: 0.55, brow: -0.7, look: [0, -0.8], mouth: 'flat' }); h.head.rotation.x = 0.2; }
    } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['bed'],
    cam: { p0: [0.05, 1.4, 4.8], p1: [0.05, 1.4, 4.6], l0: [0, 1.22, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'ぐっすり寝たい', x: 680, y: 520, h: 110, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 510, y: 670, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 510, y: 1440, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.bed.position.set(-0.6, 0, -0.7); s.hero.position.set(0.25, 0, 0.2); s.hero.rotation.y = -0.1;
      h.arm('R', 0.2, 0.7, 1.7); h.arm('L', 0.1, 0.25, 0.3); h.face({ lid: 0.3, brow: 0.5, look: [0.2, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも睡眠が1日', '[1時間]で済んだら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['睡眠', '1日1時間'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
