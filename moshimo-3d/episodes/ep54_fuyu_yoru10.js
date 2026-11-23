// ep54_fuyu_yoru10 (pop / arm C ニュース起点): もしも冬の夜が毎日10分長くなったら？
// 入り口：11月の寒波・冬至まで約1か月の話題。型は sp_geppu2x / ep53。台本・数字・小道具は自作。
// 前提（試算・python で検算）:
//   東京（北緯35.69 東経139.69）の2026-11-23：日の出6:25 日の入り16:31 昼10時間6分（天文計算の概算）
//   冬至（12/22）の昼は9時間44分 → ふつうは29日で22分＝1日約0.8分しか縮まない。あなたは1日10分（約13倍）
//   昼の長さ L(n) = 606 − 10n 分（南中11:28を中心に左右5分ずつ）
//     30日後：306分＝5時間6分、日の出8:55 日の入り14:01 / 星を見る時間（夜）24h−5.1h＝18.9h ≒ 19時間
//     606÷10＝60.6日 ≒ 2か月で昼ゼロ（北極圏の「極夜」と同じ状態）
//   落とし穴：明かりをつける時間＝夜の増加分 30日×10分＝300分＝+5時間/日
//   太陽光発電：1日の発電量が昼の長さに比例すると仮定 → 306÷606＝0.50＝約半分
//   体内時計：朝の光で整う（厚労省 健康づくりのための睡眠ガイド2023）
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep54_fuyu_yoru10.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#7fc8ff', '#fff6d8', '#ff8f3a'];
const NIGHT = ['#1d2552', '#3a4270', '#ffd23a'];
const basicM = (c) => new THREE.MeshBasicMaterial({ color: c });

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // single rice ball
  { const o = G(); sph(0.11, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.13, 0.1, 0.17, 0.02, '#20301f', 0, -0.045, 0, o); reg('nigiri', o); }
  // stars on the back wall (small glowing dots)
  { const s = G(); s.userData.items = []; for (let i = 0; i < 34; i++) { const x = ((i * 0.6180339) % 1) * 5.6 - 2.8, y = 1.1 + ((i * 0.41421) % 1) * 2.4;
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.045 + (i % 3) * 0.02), basicM(i % 4 ? '#fff6c8' : '#ffffff')); m.position.set(x, y, -2.3); s.add(m); s.userData.items.push(m); } reg('stars', s); }
  // crescent moon
  { const m = G(); sph(0.3, basicM('#fff1a8'), 0, 0, 0, m, 1, 1, 0.3); for (const [x, y, r] of [[-0.1, 0.08, 0.06], [0.1, -0.06, 0.045], [0.02, 0.14, 0.03]]) sph(r, basicM('#e8d78a'), x, y, 0.08, m, 1, 1, 0.3); m.traverse(o => { o.castShadow = false; }); m.position.set(-1.3, 2.9, -2.2); reg('moon', m); }
  // solar panel
  { const p = G(); const b = rbox(1.3, 0.04, 0.8, 0.02, '#23407a', 0, 0.75, 0, p); b.rotation.x = 0.6;
    for (let i = -2; i <= 2; i++) { const l = rbox(0.012, 0.045, 0.78, 0.004, '#9fc4ff', i * 0.25, 0.75, 0, p); l.rotation.x = 0.6; }
    cyl(0.04, 0.04, 0.7, '#8a8f99', 0, 0.35, 0.1, p); reg('panel', p); }
  // laundry line with a shirt and a towel
  { const l = G(); const r = cyl(0.01, 0.01, 2.0, '#ffffff', 0, 2.2, 0, l); r.rotation.z = Math.PI / 2;
    for (const x of [-0.95, 0.95]) cyl(0.03, 0.03, 2.2, '#8a8f99', x, 1.1, 0, l);
    const sh = G(); sh.position.set(-0.35, 2.2, 0); l.add(sh); rbox(0.5, 0.55, 0.03, 0.04, '#7fc8ff', 0, -0.3, 0, sh); rbox(0.72, 0.18, 0.03, 0.04, '#7fc8ff', 0, -0.1, 0, sh);
    const tw = G(); tw.position.set(0.4, 2.2, 0); l.add(tw); rbox(0.4, 0.7, 0.025, 0.02, '#ff9db8', 0, -0.35, 0, tw);
    l.userData.cloth = [sh, tw];
    const drops = G(); l.add(drops); l.userData.drops = []; for (let i = 0; i < 6; i++) l.userData.drops.push(sph(0.025, '#5aa9ff', (i % 2 ? 0.4 : -0.35) + (i % 3 - 1) * 0.12, 1.5, 0.02, drops, 1, 1.5, 1));
    reg('laundry', l); }
  // illuminated tree (small twinkling lights only)
  { const t = G(); for (const [y, r] of [[0.55, 0.6], [1.0, 0.46], [1.4, 0.32]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(r, 0.6, 20), M('#2f8a5a')); c.position.y = y; c.castShadow = true; t.add(c); }
    cyl(0.07, 0.07, 0.3, '#7a4a2a', 0, 0.15, 0, t); const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), basicM('#ffe14a')); star.position.y = 1.78; t.add(star);
    t.userData.bulbs = []; const cols = ['#ff5a4f', '#ffd23a', '#35d0ff', '#ffffff'];
    for (let i = 0; i < 22; i++) { const a = i * 2.4, y = 0.35 + (i / 22) * 1.25, r = 0.62 * (1 - (y - 0.25) / 1.6) + 0.02;
      const b = sph(0.035, basicM(cols[i % 4]), Math.sin(a) * r, y, Math.cos(a) * r, t); t.userData.bulbs.push(b); }
    reg('tree', t); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const dimTo = (s, f) => { s.hemi.intensity *= f; s.key.intensity *= f; if (!s.fill) s.scene.traverse(o => { if (o.isDirectionalLight && o !== s.key) s.fill = o; }); if (s.fill) s.fill.intensity *= f; };
function wallClock(s, h, m, x = 0.95, y = 2.05, z = -1.0, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
function sunAt(s, x, y, sc = 0.7) { const o = s.P.sun; o.visible = true; o.position.set(x, y, -1.9); o.scale.setScalar(sc); o.rotation.z = s.gt * 0.3; return o; }
function starsOn(s, a, tw = 0) { const st = s.P.stars; st.visible = a > 0.01; st.userData.items.forEach((m, i) => { m.visible = i / 34 < a; m.scale.setScalar(1 + tw * 0.25 * Math.sin(s.gt * 3 + i)); }); }
function moonOn(s, a) { const m = s.P.moon; m.visible = a > 0.01; m.position.y = 2.2 + 0.7 * a; }
// the sun drops out of the noon sky at t0, the room goes dark, stars and the moon come out
function noonDrop(s, lt, t0, bg) {
  const u = k(lt, t0 - 0.2, t0 + 0.12); if (u < 1) sunAt(s, 0.9, 2.95 - 4.2 * u * u, 0.6);
  const d = ease(k(lt, t0, t0 + 0.5)); dimTo(s, 1 - 0.85 * d); starsOn(s, d, 1); moonOn(s, d, bg);
  wallClock(s, 0, 0, -1.25, 2.0, -1.3, 1.3); return lt > t0;
}

const plan = [
  // 0) cold open (flash-forward of #6): lunch at noon, the sun falls out of the sky, night comes -> push in to a blank "夜ごはん…？"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.7, 7.0], p1: [0.1, 1.45, 3.4], l0: [0.0, 1.7, -0.4], l1: [0.1, 1.35, 0.3], hold: 1.2, dur: 2.2 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.24, 0.9]],
    sfx: [[0.0, 'whoosh_swing', -12], [0.25, 'impact_doon', -9], [0.27, 'text_impact', -11], [0.5, 'amb_night', -16, 2.4], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.28, text: 'お昼なのに夜!!', x: 540, y: 400, rot: -6, color: YEL, size: 92, dur: 1.15 },
      { t: 2.3, text: '夜ごはん…？', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) {
      const dark = noonDrop(s, lt, 0.25, HOOK[0]); const h = s.hero.userData; place(s.hero, 0.1, 0.5, 0);
      hold(s, 'nigiri', 'R', V(0.38, 1.05 + (lt > 1.8 ? 0.2 * ease(k(lt, 1.8, 2.2)) : 0), 0.75)); h.arm('L', 0.3, 0.4, 1.6);
      if (!dark) h.face({ lid: 0.2, brow: 0.3, look: [0.3, -0.3], mouth: 'o', open: 0.7 });
      else if (lt < 1.6) { h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.4, 0.6], mouth: 'o', open: 1 }); h.arm('L', 0.4, 1.4, 0.6); h.hand('L', 'pa'); }
      else { h.face({ lid: 0.45, brow: 0.2, look: [0.6, 0], mouth: 'flat' }); h.head.rotation.z = 0.16 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.0, 'comic_surprise', -12]],
    stamps: [{ t: 2.1, text: '毎日?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      sunAt(s, 1.2, 2.7, 0.55); const h = s.hero.userData; place(s.hero, 0.0, 0.4, 0.05);
      h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.arm('R', 0.4, 0.6, 1.5); h.hand('R', 'choki');
      h.face(lt < 2.0 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.4], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) today in Tokyo: ~10 hours of daylight
  { sc: 'st', say: ['today'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: [], hud: ['冬の昼', '約10時間'],
    cam: { p0: [0.1, 1.5, 5.2], p1: [0.1, 1.48, 4.9], l0: [0.1, 1.35, 0] },
    sfx: [[0.2, 'whoosh_switch1', -12], [1.0, 'text_pa', -10]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '昼 [約10時間]', y: 480, size: 76, border: CY, sub: '6:25〜16:31（東京・11月23日）' }] : []; },
    note: '日の出入りは天文計算による概算（東京）',
    act(lt, s) {
      const a = -1.2 + 2.4 * ease(k(lt, 0.1, 2.4)); sunAt(s, a * 1.0, 2.2 + 0.6 * Math.cos(a * 1.1), 0.5);
      const h = s.hero.userData; place(s.hero, -0.25, 0.5, 0.15);
      h.reach('R', V(0.25, 1.75, 0.3)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face({ lid: 0.25, brow: 0.3, look: [0.3, 0.7], mouth: 'smile' });
    } },
  // 3) normal vs you: <1 min a day vs 10 min a day
  { sc: 'st', say: ['speed'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['夜', '毎日+10分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.3, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [0.9, 'text_pa', -10], [1.9, 'text_pa', -10], [2.6, 'whoosh_switch2', -12]],
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 1日0.8分', x: 290, y: 1150, h: 76, bg: '#ffffff' }, { t: t0 + 1.2, text: 'あなた 1日10分', x: 770, y: 1150, h: 100, bg: YEL }] : []; },
    cards(lt) { return lt > 2.3 ? [{ t: 2.3, text: '[約13倍]の速さ', y: 480, size: 76, border: YEL, sub: '冬至まで29日で22分しか縮まない' }] : []; },
    note: '冬至の昼 東京9時間44分（天文計算の概算）',
    act(lt, s) {
      const m = lt < 1.7 ? 2 * lt : 3.4 + (lt - 1.7) * 60; wallClock(s, 4, m, 0.0, 2.25, -1.1, 1.4);
      const h = s.hero.userData; place(s.hero, -0.55, 0.45, 0.3);
      h.reach('R', V(-0.1, 1.9, -0.6)); h.hand('R', lt > 1.7 ? 'pa' : 'choki'); h.arm('L', 0.3, 0.4, 1.7);
      h.face(lt < 1.7 ? { lid: 0.3, brow: 0.2, look: [0.6, 0.6], mouth: 'flat' } : { lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.6], mouth: 'o', open: 1.1 });
    } },
  // 4) one month: 5 hours of daylight, sunrise at 9
  { sc: 'st', say: ['month'], pre: 0.15, pal: ['#ff8f6a', '#ffe6d6', '#3f4f9a'], dim: 0.85, show: ['bed'], hud: ['1か月後', '昼5時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.0], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_slide', -12], [1.1, 'text_pa', -10], [2.4, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.2 ? (lt > 0.8 ? [{ t: 0.8, text: '昼 [5時間]', y: 480, size: 80, border: YEL, sub: '10時間6分−10分×30日（試算）' }] : [])
      : [{ t: 2.2, text: '日の出 [9時]', y: 480, size: 80, border: RED, sub: '8:55〜14:01（試算）' }]; },
    act(lt, s) {
      const b = s.P.bed; b.position.set(0.1, 0, 0.0); b.scale.setScalar(1.15);
      sunAt(s, 1.45, 0.7 + 0.35 * ease(k(lt, 1.8, 3.2)), 0.5); wallClock(s, 9, 0, -1.25, 2.1, -1.3, 1.3);
      const h = s.hero.userData; place(s.hero, 0.15, 0.1, 0); h.body.position.y = 0.25;
      h.arm('L', 0.3, 2.6, 0.2); h.arm('R', 0.3, 2.6, 0.2); h.hand('L', 'gu'); h.hand('R', 'gu');
      h.face(lt < 2.2 ? { lid: 0.85, brow: 0.3, look: [0, 0], mouth: 'o', open: 1.0 } : { lid: 0.1, brow: -0.8, browY: 1, look: [0.7, 0.3], mouth: 'o', open: 0.6 });
    } },
  // 5) stars: 19 hours a day
  { sc: 'st', say: ['stars'], pre: 0.15, pal: NIGHT, dim: 0.55, show: [], hud: ['星空', '1日19時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.6, 5.2], l0: [0.0, 1.55, 0] },
    sfx: [[0.2, 'sparkle', -12], [1.2, 'text_pa', -10], [2.2, 'emo_shine', -15]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '星の時間 [19時間]', y: 480, size: 70, border: CY, sub: '24時間−昼5時間（試算）' }] : []; },
    tags(lt) { const t0 = 0.4; return lt > t0 ? [{ t: t0, text: 'ふつう 14時間', x: 300, y: 1180, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: 'あなた 19時間', x: 770, y: 1180, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      starsOn(s, ease(k(lt, 0, 1.2)), 1); moonOn(s, 1, NIGHT[0]);
      const h = s.hero.userData; place(s.hero, 0.1, 0.5, 0);
      h.arm('R', 0.5, 2.9, 0.1); h.hand('R', 'choki'); h.arm('L', 0.3, 0.4, 1.6);
      h.head.rotation.x = -0.2; h.face({ lid: 0, brow: 0.6, look: [-0.3, 0.9], mouth: 'smile' });
    } },
  // 6) two months: no daylight; lunch in the dark (the cold open, in its place)
  { sc: 'st', say: ['zero'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['2か月後', '昼ゼロ'], hudColor: RED,
    cam: { p0: [0.0, 1.7, 6.6], p1: [0.05, 1.6, 6.0], l0: [0.0, 1.5, -0.3] },
    shake: [[0.6, 0.07, 0.5]], lines: [[0.6, 0.7]],
    sfx: [[0.4, 'whoosh_swing', -12], [0.6, 'impact_doon', -10], [1.4, 'text_pa', -10], [3.0, 'comic_eat', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.8 ? [{ t: 0.8, text: '昼が [ゼロ]', y: 480, size: 80, border: RED, sub: '606分÷10分＝約61日（試算）' }] : [])
      : [{ t: 2.3, text: 'お昼ごはんも [夜]', y: 480, size: 70, border: CY, sub: '北極圏の「極夜」と同じ状態' }]; },
    act(lt, s) {
      noonDrop(s, lt, 0.6, HOOK[0]); const h = s.hero.userData; place(s.hero, 0.1, 0.5, 0);
      hold(s, 'nigiri', 'R', V(0.3, 1.2 + 0.08 * Math.max(0, Math.sin(lt * 6)), 0.78)); h.arm('L', 0.3, 0.4, 1.6);
      h.face(lt < 0.6 ? { lid: 0.2, brow: 0.3, look: [0, 0], mouth: 'smile' } : lt < 2.3 ? { lid: 0, brow: 0.8, browY: 1, look: [0.4, 0.6], mouth: 'o', open: 1 } : { lid: 0.4, brow: 0.3, look: [0, 0], mouth: 'o', open: 0.4 + 0.3 * Math.abs(Math.sin(lt * 9)) });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) lights on +5 hours a day
  { sc: 'st', say: ['light'], pre: 0.15, pal: ['#3a3f6b', '#cfd3ea', '#ffd23a'], dim: 0.6, show: ['lamp', 'desk'], hud: ['明かり', '+5時間/日'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.2, 1.35, 0] },
    sfx: [[0.3, 'text_touch', -10], [1.3, 'text_pa', -10], [2.4, 'comic_fall', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '明かり [+5時間]', y: 480, size: 76, border: RED, sub: '1か月後・1日あたり（試算）' }] : []; },
    act(lt, s) {
      const l = s.P.lamp; l.position.set(0.35, 2.6, 0.2); const on = lt > 0.35; l.userData.bulb.material = on ? l.userData.on : l.userData.off; if (on) dimTo(s, 1.5);
      place(s.P.desk, -0.8, 0.0, 0.3); starsOn(s, 1, 0);
      const h = s.hero.userData; place(s.hero, -0.15, 0.55, 0.1);
      h.reach('R', V(0.3, 2.05, 0.35)); h.hand('R', 'gu'); h.arm('L', 0.4, 0.2, 0.3);
      h.face(lt < 1.2 ? { lid: 0.3, brow: 0, look: [0.5, 0.7], mouth: 'flat' } : { lid: 0.4, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.6 });
    } },
  // 9) solar power: about half
  { sc: 'st', say: ['solar'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], dim: 0.85, show: ['panel'], hud: ['太陽光発電', '約半分'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.1], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.2, 'text_pa', -10], [2.3, 'comic_shock2', -12]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '発電 [約半分]', y: 480, size: 78, border: RED, sub: '昼の長さに比例と仮定（試算）' }] : []; },
    tags(lt) { const t0 = 0.4; return lt > t0 ? [{ t: t0, text: 'ふつう 10時間', x: 300, y: 1180, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: 'あなた 5時間', x: 770, y: 1180, h: 100, bg: RED, fg: '#ffffff' }] : []; },
    act(lt, s) {
      place(s.P.panel, 0.55, -0.2, -0.3); sunAt(s, 1.4, 2.8 - 1.6 * ease(k(lt, 0.3, 2.4)), 0.45);
      const h = s.hero.userData; place(s.hero, -0.55, 0.45, 0.3);
      h.reach('R', V(0.1, 1.0, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.4, 0.5, 1.5); h.hand('L', 'pa');
      h.face(lt < 1.1 ? { lid: 0.2, brow: 0.2, look: [0.6, 0.6], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0.4], mouth: 'o', open: 1.0 });
    } },
  // 10) body clock drifts without morning light
  { sc: 'st', say: ['clock'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], dim: 0.75, show: [], hud: ['体内時計', 'ずれる'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.05, 1.45, 4.4], l0: [0.05, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.5, 'comic_stupid', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '体内時計 [ずれる]', y: 480, size: 70, border: RED, sub: '朝の光で体内時計がそろう' }] : []; },
    stamps: [{ t: 1.8, text: 'いま何時…？', x: 790, y: 1150, rot: 6, color: '#ffffff', size: 62, dur: 1.2 }],
    note: '厚労省 健康づくりのための睡眠ガイド2023',
    act(lt, s) {
      wallClock(s, lt * 3, lt * 180, 0.0, 2.3, -1.1, 1.4); starsOn(s, 0.6, 0);
      const h = s.hero.userData; place(s.hero, 0, 0.5, 0);
      h.head.rotation.z = Math.sin(lt * 2.2) * 0.18; h.body.rotation.z = Math.sin(lt * 2.2 + 0.5) * 0.04;
      h.arm('L', 0.3, 0.6, 1.4); h.arm('R', 0.3, 0.6, 1.4); h.hand('L', 'gu'); h.hand('R', 'gu');
      h.face(lt < 0.9 ? { lid: 0.7, brow: 0.3, look: [0, 0], mouth: 'flat' } : { lid: 0.5, brow: -0.6, look: [Math.sin(lt * 3) * 0.6, 0.2], mouth: 'o', open: 0.4 });
    } },
  // 11) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: NIGHT, dim: 0.6, show: [], hud: ['長い夜の', '冬'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.9], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'sparkle', -12], [0.4, 'text_pa', -10], [2.6, 'text_pa', -10], [4.4, 'comic_jajean', -13]],
    cards(lt) { return lt < 2.5 ? (lt > 0.3 ? [{ t: 0.3, text: 'イルミネーション [一日中]', y: 480, size: 56, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.5, text: '洗濯物が [乾かない]', y: 480, size: 64, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 4.4, text: 'ずっと湿ってる…', x: 540, y: 1470, rot: -4, color: YEL, size: 62, dur: 1.4 }],
    act(lt, s) {
      starsOn(s, 1, 0); moonOn(s, 1, NIGHT[0]); const h = s.hero.userData;
      if (lt < 2.5) { const t = s.P.tree; place(t, 0.75, -0.2); t.scale.setScalar(1.2); t.userData.bulbs.forEach((b, i) => { b.scale.setScalar(0.035 * (0.8 + 0.35 * Math.max(0, Math.sin(s.gt * 4 + i * 1.7)))); });
        place(s.hero, -0.45, 0.45, 0.3); h.arm('R', 0.6, 1.8, 0.2); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.6);
        h.face({ lid: 0, brow: 0.6, look: [0.6, 0.4], mouth: 'smile' }); }
      else { const l = s.P.laundry; place(l, 0.2, -0.6); l.userData.cloth.forEach((c, i) => { c.rotation.z = Math.sin(s.gt * 1.5 + i) * 0.05; });
        l.userData.drops.forEach((d, i) => { const p = ((lt * 0.9 + i / 6) % 1); d.position.y = 1.5 - 1.4 * p; });
        place(s.hero, -0.55, 0.6, 0.25); h.reach('R', V(-0.2, 1.75, -0.45)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.3, 1.8);
        h.face({ lid: 0.5, brow: -1, browY: 1, look: [0.5, 0.4], mouth: 'flat' }); }
    } },
  // 12) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '長い夜ほしい', x: 320, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '昼がいい', x: 760, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      sunAt(s, 1.25, 2.75, 0.5); moonOn(s, 1, HOOK[0]); s.P.moon.position.set(-1.25, 2.85, -2.2);
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'nigiri', 'R', V(0.28, 1.05, 0.7)); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも冬の夜が毎日', '[10分]長くなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['冬の夜', '毎日+10分'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; S.gt = 0; addProps(S); S.P.sun.traverse(o => { o.castShadow = false; }); const up = st.update; st.update = (lt, gt, shot) => { S.gt = gt; up(lt, gt, shot); }; return st; } },
});
