// ep53_hiruyasumi_2h (pop / arm B 生活ルール改変): もしも昼休みが全員2時間になったら？
// 型は sp_geppu2x / ep47。台本・数字・小道具は自作。
// 前提（試算）:
//   今の昼休み: 労働基準法34条（8時間を超える労働は休憩60分以上）→ ふつう1時間
//   出勤日: 365−年間休日116.6日（厚労省 令和7年就労条件総合調査）= 248日
//   1年: +1時間×248日 = 248時間 / 2時間の映画なら 248÷2 = 124本
//   昼寝30分（厚労省 健康づくりのための睡眠ガイド2023：昼寝は30分以内）→ 60+30 = 90分の自由時間（今より30分長い）
//   ランチの店: 食べる時間22.1分（新生銀行 2014）、分速80m。片道 (60−22.1)/2=19分→1.52km、(120−22.1)/2=49分→3.92km、面積比 6.67 ≒ 約7倍
//   全国: 雇用者6,185万人（総務省 労働力調査 2025年平均）×1時間 = 1日6,185万時間
//   落とし穴: 働く時間は同じ→退勤が1時間遅い（18時→19時）。40年で 248×40 = 9,920時間 = 413日分（1年分以上）
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep53_hiruyasumi_2h.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#7fc8ff', '#fff6d8', '#ff8f3a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // night cap (attached to the hero's head)
  { const c = G(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 24), M('#5a7bff')); cone.position.y = 0.26; cone.rotation.z = -0.35; cone.castShadow = true; c.add(cone);
    cyl(0.34, 0.34, 0.09, '#ffffff', 0, 0.02, 0, c); sph(0.08, '#ffffff', 0.2, 0.48, 0, c); reg('cap', c); }
  // blanket (in front of the hero in bed)
  { const b = G(); rbox(0.95, 0.3, 0.55, 0.12, '#ff9db8', 0, 0, 0, b); for (const x of [-0.25, 0.05, 0.3]) sph(0.05, '#ffffff', x, 0.13, 0.25, b, 1, 0.6, 0.5); reg('blanket', b); }
  // movie screen
  { const s = G(); rbox(2.3, 1.35, 0.05, 0.02, '#23262f', 0, 0, 0, s);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.18), new THREE.MeshBasicMaterial({ map: canvasTex(420, 236, (c) => { const g = c.createLinearGradient(0, 0, 0, 236); g.addColorStop(0, '#ffcf6b'); g.addColorStop(1, '#ff7a6b'); c.fillStyle = g; c.fillRect(0, 0, 420, 236);
      c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(180, 70); c.lineTo(260, 118); c.lineTo(180, 166); c.fill(); c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('2:00:00', 210, 218); }) }));
    f.position.z = 0.03; s.add(f); s.position.set(0, 1.95, -2.2); reg('screen', s); }
  // popcorn
  { const p = G(); cyl(0.09, 0.07, 0.2, '#ffffff', 0, 0.1, 0, p); for (const a of [0, 1, 2, 3]) rbox(0.03, 0.2, 0.004, 0.005, '#e2463c', Math.sin(a * 1.57) * 0.085, 0.1, Math.cos(a * 1.57) * 0.085, p).rotation.y = a * 1.57;
    for (let i = 0; i < 9; i++) sph(0.035, '#fff3c4', Math.sin(i * 2.4) * 0.05, 0.22 + (i % 3) * 0.02, Math.cos(i * 2.4) * 0.05, p); reg('popcorn', p); }
  // distance rings on the floor (near / far)
  for (const [n, r, col] of [['ringA', 0.7, '#ffffff'], ['ringB', 1.8, '#ffd23a']]) { const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.05, r, 64), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; const g = G(); g.add(m); reg(n, g); }
  // speech bubble for the boss
  { const b = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(360, 200, (c) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, 352, 160, 40); c.fill(); c.beginPath(); c.moveTo(60, 160); c.lineTo(40, 198); c.lineTo(110, 160); c.fill();
      c.fillStyle = '#2c3b6b'; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.fillText('それでね…', 180, 106); }), transparent: true })); b.add(m); reg('bubble', b); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const capOn = (s) => { const c = s.P.cap; c.visible = true; s.hero.userData.head.add(c); c.position.set(0, 0.3, -0.02); c.rotation.set(-0.2, 0, 0.1); c.scale.setScalar(1); };
// clock on the wall: h hours (0..12), m minutes
function wallClock(s, h, m, x = 0.95, y = 2.05, z = -1.0, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
// bed drops from the sky at t0; hero tucked in it with the cap on
function bedScene(s, lt, t0, sc = 1.25) {
  const b = s.P.bed; const u = k(lt, t0 - 0.25, t0); b.visible = lt > t0 - 0.25; const sq = lt > t0 ? 1 - 0.1 * Math.exp(-(lt - t0) * 8) * Math.cos((lt - t0) * 30) : 1;
  b.position.set(0, 7 * (1 - u * u), 0.1); b.rotation.set(0, 0, 0); b.scale.set(sc, sc * sq, sc); return lt > t0; }
function tucked(s, x = 0.12) { place(s.hero, x, 0.15, 0); capOn(s); const bl = s.P.blanket; bl.visible = true; bl.position.set(x, 0.62, 0.42); bl.rotation.set(0.15, 0, 0);
  const h = s.hero.userData; h.reach('L', V(x - 0.32, 0.8, 0.6)); h.reach('R', V(x + 0.32, 0.8, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu'); }

const plan = [
  // 0) cold open (flash-forward of #5): the clock hits 12:00, a bed slams down in the office, hero tucked in with a night cap -> push in to a smug "suya..."
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: ['desk'],
    cam: { p0: [0.0, 1.7, 7.0], p1: [0.1, 1.45, 3.4], l0: [0.0, 1.6, -0.4], l1: [0.1, 1.35, 0.3], hold: 1.2, dur: 2.2 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.24, 0.9]],
    sfx: [[0.0, 'countdown_tick', -12], [0.15, 'whoosh_gust', -12], [0.25, 'impact_doon', -9], [0.27, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.28, text: '昼休み 2時間!!', x: 540, y: 400, rot: -6, color: YEL, size: 92, dur: 1.15 },
      { t: 2.3, text: 'スヤァ…', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) {
      wallClock(s, 0, 0, 1.15, 2.3, -1.3, 1.6); place(s.P.desk, -1.25, -0.6, 0.3);
      const landed = bedScene(s, lt, 0.25); const h = s.hero.userData;
      if (!landed) { place(s.hero, 0.12, 0.6, 0); h.arm('L', 0.3, 0.4, 1.6); h.arm('R', 0.3, 0.4, 1.6); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0.5], mouth: 'smile' }); }
      else { tucked(s);
        if (lt < 1.4) h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.5], mouth: 'o', open: 1 });
        else { h.face({ lid: 0.75, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.14 * ease(k(lt, 1.9, 2.3)); } }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['desk'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'comic_surprise', -12]],
    stamps: [{ t: 1.7, text: '全員?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      wallClock(s, 0, 0, 1.05, 2.1, -1.0, 1.3); place(s.P.desk, -0.85, -0.3, 0.3);
      const h = s.hero.userData; place(s.hero, 0.0, 0.4, 0.05);
      h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.arm('R', 0.4, 0.6, 1.5); h.hand('R', 'choki');
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.4], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) today: 1 hour
  { sc: 'st', say: ['rule'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['desk'], hud: ['昼休み', 'いま1時間'],
    cam: { p0: [0.1, 1.5, 5.2], p1: [0.1, 1.48, 4.9], l0: [0.1, 1.35, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [0.9, 'text_pa', -10]],
    cards(lt) { return lt > 0.8 ? [{ t: 0.8, text: '昼休み [1時間]', y: 480, size: 72, border: CY, sub: '12:00〜13:00' }] : []; },
    note: '労働基準法34条 8時間超の労働で休憩60分以上',
    act(lt, s) {
      const m = 60 * ease(k(lt, 0.3, 2.0)); wallClock(s, 0, m, 0.75, 1.75, -0.6, 1.3); place(s.P.desk, -0.7, 0.2, 0.3);
      const h = s.hero.userData; place(s.hero, -0.3, 0.5, 0.2);
      h.reach('R', V(0.3, 1.5, -0.3)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face(lt < 0.8 ? { lid: 0.2, brow: 0.2, look: [0.6, 0.4], mouth: 'smile' } : { lid: 0.1, brow: 0.2, look: [0, 0], mouth: 'flat' });
    } },
  // 3) +1 hour a day -> 248 hours a year
  { sc: 'st', say: ['year'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['books'], hud: ['昼休み', '×2'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.6, 'text_pa', -10], [2.4, 'sparkle', -14]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '1年で [248時間]', y: 480, size: 72, border: YEL, sub: '+1時間×出勤248日（試算）' }] : []; },
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 1時間', x: 300, y: 1150, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた 2時間', x: 770, y: 1150, h: 100, bg: CY }] : []; },
    note: '年間休日116.6日 厚労省 令和7年就労条件総合調査',
    act(lt, s) {
      const b = s.P.books; place(b, 0.55, 0.0); const n = Math.round(4 + 28 * ease(k(lt, 0.4, 2.6))); b.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.35, 0.3);
      h.reach('R', V(0.3, 0.1 + n * 0.046, 0.15)); h.hand('R', 'pa'); h.arm('L', 0.3, lt > 1.5 ? 2.6 : 0.4, 0.3); h.hand('L', lt > 1.5 ? 'pa' : 'gu');
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 4) movies: 124 a year
  { sc: 'st', say: ['movie'], pre: 0.15, pal: ['#2f3d7a', '#d9def5', '#ffd23a'], show: ['screen'], hud: ['映画', '年124本'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.0], l0: [0.0, 1.45, 0] },
    sfx: [[0.2, 'whoosh_switch2', -12], [1.3, 'text_pa', -10], [2.2, 'comic_eat', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '1年で [124本]', y: 480, size: 76, border: CY, sub: '248時間÷2時間（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.5, 0.05);
      hold(s, 'popcorn', 'R', V(0.22, 0.95, 0.82), 0); h.reach('L', V(0.05, 1.3 + Math.max(0, Math.sin(lt * 5)) * 0.12, 0.75)); h.hand('L', 'gu');
      h.face(lt < 1.2 ? { lid: 0.1, brow: 0.4, look: [0, 0.2], mouth: 'o', open: 0.5 } : { lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 5) nap 30 min (the cold open, in its place)
  { sc: 'st', say: ['nap'], pre: 0.15, hold: 0.3, pal: HOOK, show: ['desk'], hud: ['昼寝', '30分'],
    cam: { p0: [0.0, 1.7, 6.6], p1: [0.05, 1.6, 6.0], l0: [0.0, 1.5, -0.3] },
    shake: [[0.6, 0.07, 0.5]], lines: [[0.6, 0.7]],
    sfx: [[0.4, 'whoosh_gust', -12], [0.6, 'impact_doon', -10], [1.6, 'text_pa', -10], [2.9, 'comic_boyon', -12]],
    cards(lt) { return lt < 1.5 ? (lt > 0.7 ? [{ t: 0.7, text: '昼寝 [30分]', y: 480, size: 76, border: CY, sub: '昼寝は30分以内がおすすめ' }] : [])
      : [{ t: 1.5, text: 'それでも [+30分]', y: 480, size: 72, border: YEL, sub: '休み120分−昼寝30分＝90分（試算）' }]; },
    note: '厚労省 健康づくりのための睡眠ガイド2023',
    act(lt, s) {
      wallClock(s, 0, 0, 1.15, 2.3, -1.3, 1.6); place(s.P.desk, -1.25, -0.6, 0.3);
      const landed = bedScene(s, lt, 0.6); const h = s.hero.userData;
      if (!landed) { place(s.hero, 0.12, 0.6, 0); h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0.5], mouth: 'smile' }); }
      else { tucked(s); h.face(lt < 1.5 ? { lid: 0.75, brow: 0.5, look: [0, 0], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); }
    } },
  // 6) lunch range x7
  { sc: 'st', say: ['walk'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['ringA', 'ringB'], hud: ['ランチの店', '約7倍'], hudColor: YEL,
    cam: { p0: [0.0, 2.7, 7.0], p1: [0.0, 2.6, 6.6], l0: [0.0, 1.15, 0] },
    sfx: [[0.3, 'whoosh_slide', -12], [1.5, 'text_pa', -10], [2.6, 'sparkle', -14]],
    cards(lt) { return lt > 1.6 ? [{ t: 1.6, text: '範囲 [約7倍]', y: 480, size: 76, border: YEL, sub: '片道19分→49分・分速80m（試算）' }] : []; },
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 1.5km', x: 300, y: 1180, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: 'あなた 3.9km', x: 770, y: 1180, h: 100, bg: YEL }] : []; },
    note: '食べる時間22.1分 新生銀行 2014年調査',
    act(lt, s) {
      const g = 0.4 + 0.6 * ease(k(lt, 0.4, 1.4)); s.P.ringB.scale.set(g, 1, g);
      const h = s.hero.userData; const w = ease(k(lt, 0.2, 2.6)); place(s.hero, -0.4 + 0.9 * w, 0.3 - 0.4 * w, 0.6);
      hold(s, 'bowl', 'R', V(-0.4 + 0.9 * w + 0.25, 0.98, 0.3 - 0.4 * w + 0.3), 0, 0.6); h.arm('L', 0.6 * Math.sin(lt * 8), 0.3, 0.4); h.hand('L', 'gu');
      h.body.position.y = Math.abs(Math.sin(lt * 8)) * 0.04;
      h.face({ lid: 0.1, brow: 0.5, look: [0.3, 0], mouth: 'smile' });
    } },
  // 7) Japan: 61.85 million hours a day
  { sc: 'st', say: ['japan'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['crowd'], hud: ['全国', '1日6,185万時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 5.8], p1: [0.0, 1.6, 5.3], l0: [0.0, 1.2, -0.3] },
    sfx: [[0.3, 'amb_bigcity', -16, 2.5], [1.4, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '1日 [6,185万時間]', y: 480, size: 68, border: CY, sub: '働く人6,185万人×1時間（試算）' }] : []; },
    note: '雇用者6,185万人 総務省 労働力調査 2025年',
    act(lt, s) {
      const c = s.P.crowd; const n = Math.round(4 + 12 * ease(k(lt, 0.2, 1.6))); c.userData.items.forEach((it, i) => { it.visible = i < n; it.position.y = Math.abs(Math.sin(lt * 5 + i)) * 0.06; });
      const h = s.hero.userData; place(s.hero, 0, 0.6, 0);
      h.arm('L', 0.3, 2.7, 0.2); h.arm('R', 0.3, 2.7, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.3 ? { lid: 0.2, brow: 0.5, look: [0, 0.3], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) going home 1 hour later
  { sc: 'st', say: ['late'], pre: 0.15, pal: ['#3a3f6b', '#cfd3ea', '#ffd23a'], dim: 0.9, show: ['desk', 'lamp'], hud: ['帰り', '+1時間'], hudColor: RED,
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.2, 1.35, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [1.2, 'text_pa', -10], [2.4, 'comic_fall', -12]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '帰り [19時]', y: 480, size: 76, border: RED, sub: '働く時間は同じ（試算）' }] : []; },
    tags(lt) { const t0 = 0.4; return lt > t0 ? [{ t: t0, text: 'ふつう 18時', x: 300, y: 1150, h: 78, bg: '#ffffff' }, { t: t0 + 0.4, text: 'あなた 19時', x: 770, y: 1150, h: 100, bg: RED, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const m = 60 * ease(k(lt, 0.2, 1.4)); wallClock(s, 6, m, 0.85, 1.85, -0.7, 1.3); place(s.P.desk, -0.75, 0.1, 0.3);
      const l = s.P.lamp; l.position.set(-0.4, 2.6, 0.2);
      const h = s.hero.userData; place(s.hero, -0.1, 0.55, 0.1);
      hold(s, 'bag', 'R', V(0.25, 0.55, 0.75), 0); h.arm('L', 0.4, 0.2, 0.3);
      h.body.rotation.x = 0.12 * ease(k(lt, 1.6, 2.4));
      h.face(lt < 1.1 ? { lid: 0.3, brow: 0, look: [0.6, 0.4], mouth: 'flat' } : { lid: 0.5, brow: -1, browY: 1, look: [0, -0.2], mouth: 'o', open: 0.6 });
    } },
  // 10) 40 years: 9,920 hours = 413 days
  { sc: 'st', say: ['career'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: ['books', 'desk'], hud: ['40年で', '9,920時間'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.1], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.3, 'text_pa', -10], [3.0, 'comic_shock2', -12]],
    cards(lt) { return lt < 2.6 ? (lt > 1.0 ? [{ t: 1.0, text: '40年で [9,920時間]', y: 480, size: 66, border: RED, sub: '248時間×40年（試算）' }] : [])
      : [{ t: 2.6, text: '＝[413日] 会社に', y: 480, size: 72, border: RED, sub: '9,920時間÷24時間' }]; },
    act(lt, s) {
      place(s.P.desk, -0.7, -0.2, 0.3); const b = s.P.books; place(b, 0.6, 0.0); b.scale.set(1, 1 + 0.25 * ease(k(lt, 0.3, 3.0)), 1); b.userData.items.forEach((it) => { it.visible = true; });
      const h = s.hero.userData; place(s.hero, -0.2, 0.55, 0.15);
      h.reach('R', V(0.38, 1.7, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.5, 0.6, 1.4); h.hand('L', 'pa');
      h.face(lt < 1.0 ? { lid: 0.2, brow: 0, look: [0.6, 0.5], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0.3, 0.5], mouth: 'o', open: 1.1 });
    } },
  // 11) napping over 30 min -> groggy
  { sc: 'st', say: ['nap2'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], show: ['bed'], hud: ['昼寝', '30分超え'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.05, 1.45, 4.4], l0: [0.05, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'comic_stupid', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '[30分] 超えると…', y: 480, size: 72, border: RED, sub: '深い眠りから起きにくくなる' }] : []; },
    stamps: [{ t: 1.7, text: 'ぼんやり…', x: 790, y: 1150, rot: 6, color: '#ffffff', size: 66, dur: 1.2 }],
    note: '厚労省 健康づくりのための睡眠ガイド2023',
    act(lt, s) {
      const b = s.P.bed; b.position.set(0, 0, 0.1); b.scale.setScalar(1.25); tucked(s); const h = s.hero.userData;
      h.head.rotation.z = Math.sin(lt * 2.2) * 0.18; h.body.rotation.z = Math.sin(lt * 2.2 + 0.5) * 0.04;
      h.face(lt < 0.9 ? { lid: 0.85, brow: 0.3, look: [0, 0], mouth: 'smile' } : { lid: 0.55, brow: -0.6, look: [Math.sin(lt * 3) * 0.6, 0.2], mouth: 'o', open: 0.4 });
    } },
  // 12) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['2時間の', '昼休み'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.9], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.3, 'text_pa', -10], [4.2, 'comic_jajean', -13]],
    cards(lt) { return lt < 2.2 ? (lt > 0.25 ? [{ t: 0.25, text: 'ランチは [ゆっくり]', y: 480, size: 62, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.2, text: '部長の話も [2時間]', y: 480, size: 60, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 2.5, text: 'それでね…', x: 880, y: 1120, rot: 6, color: '#ffffff', size: 52, dur: 1.6 }, { t: 4.2, text: 'まだ続く…', x: 540, y: 1470, rot: -4, color: YEL, size: 70, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData;
      if (lt < 2.2) { s.hero2.visible = false; place(s.hero, 0, 0.45, 0); hold(s, 'bowl', 'R', V(0.22, 0.98, 0.85), 0); h.reach('L', V(-0.05, 1.25, 0.8)); h.hand('L', 'gu');
        h.face({ lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { const h2 = s.hero2.userData; s.hero2.visible = true;
        place(s.hero, -0.68, 0.2, 0.45); place(s.hero2, 0.68, 0.2, -0.45);
                h2.arm('R', 0.5, 0.6 + 0.4 * Math.sin(lt * 5), 1.0); h2.hand('R', 'pa'); h2.arm('L', 0.3, 0.3, 1.6);
        h2.face({ lid: 0.2, brow: 0.6, look: [-0.6, 0], mouth: 'o', open: 0.5 + 0.4 * Math.abs(Math.sin(lt * 9)) });
        h.arm('L', 0.3, 0.3, 1.8); h.arm('R', 0.3, 0.3, 1.8);
        h.face({ lid: 0.5, brow: -1, browY: 1, look: [0.5, 0], mouth: 'flat' }); }
    } },
  // 13) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '2時間ほしい', x: 320, y: 1130, h: 108, bg: CY }, { t: t0 + 0.2, text: '1時間で早く帰る', x: 760, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05); capOn(s);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki'); h.arm('R', 0.4, 0.5, 1.5); h.hand('R', 'pa');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも昼休みが全員', '[2時間]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['昼休み', '2時間'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
