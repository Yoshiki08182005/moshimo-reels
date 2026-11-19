// ep44_tsuukin_zero (pop / arm B 生活ルール改変): もしも通勤が全員ゼロになったら？
// 型は sp_geppu2x / ep39。台本・数字・小道具は自作。
// 前提（試算）:
//   通勤・通学時間 往復1時間19分＝79分（総務省 社会生活基本調査 2021、報道経由）
//   出勤日 248日/年（年間休日116.6日、厚労省 令和7年就労条件総合調査 → 365−116.6）
//   1年: 79分×248日 = 19,592分 = 326.5時間 ≒ 327時間 = 13.6日 ≒ 2週間分
//   時給換算: 最低賃金 全国加重平均1,121円（厚労省 2025年度）× 326.5時間 = 36.6万円 ≒ 37万円
//   日本中: 就業者6,781万人（総務省 労働力調査 2024年平均）× 79分 = 53.6億分/日 = 1万192年分/日 ≒ 1万年分
//   歩き: 駅まで片道10分×往復＝20分 ≒ 2,000歩（100歩/分）× 約0.03kcal/歩 = 60kcal/日 × 248日 = 14,880kcal ÷ 7,200kcal/kg ≒ 2.1kg
//   エアコン: 平均0.5kW×8時間 = 4kWh/日 × 31円/kWh（目安単価、全国家庭電気製品公正取引協議会）= 124円/日 × 248日 = 30,752円 ≒ 3万円
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep44_tsuukin_zero.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#7fc8ff', '#eef7ff', '#ffd23a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // nightcap (attached to the hero's head in act)
  { const c = G(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 28), M('#5a7bff')); cone.castShadow = true; cone.position.y = 0.26; c.add(cone);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.06, 10, 28), M('#ffffff')); band.rotation.x = Math.PI / 2; c.add(band);
    sph(0.09, '#ffffff', 0, 0.58, 0, c); reg('nightcap', c); }
  // laptop
  { const l = G(); rbox(0.46, 0.03, 0.32, 0.01, '#c9d0d8', 0, 0.015, 0, l); rbox(0.38, 0.005, 0.16, 0.003, '#7b838c', 0, 0.032, 0.03, l);
    const h = G(); h.position.set(0, 0.03, -0.15); h.rotation.x = -0.25; l.add(h);
    rbox(0.46, 0.3, 0.02, 0.01, '#c9d0d8', 0, 0.15, 0, h);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), basic('#bfe3ff')); sc.position.set(0, 0.15, 0.012); h.add(sc); l.userData.sc = sc;
    l.userData.ping = sph(0.03, basic('#ff3b30'), 0.17, 0.27, 0.02, h); reg('laptop', l); }
  // air conditioner + breeze
  { const a = G(); rbox(1.0, 0.32, 0.26, 0.05, '#ffffff', 0, 0, 0, a); rbox(0.9, 0.05, 0.02, 0.01, '#9aa3ad', 0, -0.1, 0.13, a);
    a.userData.led = sph(0.02, basic('#3fd16b'), 0.4, 0.06, 0.135, a);
    const w = G(); a.add(w); a.userData.wind = [];
    for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.4, 4, 8), new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.8 })); m.rotation.x = 0.9; w.add(m); a.userData.wind.push(m); }
    a.position.set(0, 2.25, -0.9); reg('aircon', a); }
  // electricity bill paper
  { const p = G(); const fm = label(256, 340, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 340); c.fillStyle = '#2c3b6b'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('電気代', 128, 70);
      c.fillStyle = '#c9d0d8'; for (let i = 0; i < 4; i++) c.fillRect(30, 110 + i * 34, 196, 12); c.fillStyle = '#e2463c'; c.font = 'bold 54px sans-serif'; c.fillText('+3万円', 128, 300); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), fm); m.material.side = THREE.DoubleSide; p.add(m); reg('paper', p); }
}

const place = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const cap = (s, who = s.hero) => { const c = s.P.nightcap; c.visible = true; who.userData.head.add(c); c.position.set(0.03, 0.3, -0.03); c.rotation.set(-0.2, 0, -0.35); c.scale.setScalar(1); };
const room = (s) => { const b = s.P.bed; b.visible = true; place(b, -0.85, -0.5); const d = s.P.desk; d.visible = true; place(d, 0.9, -0.35);
  const l = s.P.laptop; l.visible = true; l.userData.ping.scale.setScalar(0.03); l.position.set(0.9, 0.77, -0.35); l.rotation.set(0, -0.25, 0); };
// bed -> desk jump (t0 = start). returns progress 0..1
function jump(s, lt, t0, dur = 0.35) { const h = s.hero, u = k(lt, t0, t0 + dur);
  h.position.set(lerp(-0.85, 0.3, u), (lt < t0 ? 0.44 : 0.44 * (1 - u) + Math.sin(Math.PI * u) * 0.7), lerp(-0.45, 0.3, u)); h.rotation.set(0, lerp(0, 0.35, u), -0.5 * Math.sin(Math.PI * u)); return u; }

const plan = [
  // 0) cold open (flash-forward of #2): nightcap, alarm -> leaps from bed to desk in 0.3 s; push in to a smug face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.45, 6.2], p1: [0.32, 1.55, 3.2], l0: [0.0, 1.0, 0], l1: [0.32, 1.46, 0.3], hold: 1.3, dur: 2.2 },
    shake: [[0.3, 0.07, 0.6]], lines: [[0.25, 0.9]],
    sfx: [[0.0, 'phone_vibe', -12], [0.08, 'whoosh_swing', -9], [0.3, 'impact_doon', -10], [0.32, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.3, text: '出社 0秒!!', x: 560, y: 470, rot: -6, color: YEL, size: 104, dur: 1.15 },
      { t: 2.3, text: '…パジャマのまま', x: 560, y: 1330, rot: -5, color: '#ffffff', size: 56, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; room(s); cap(s);
      const u = jump(s, lt, 0.02, 0.3);
      if (u < 1) { h.arm('L', 0.4, 2.4, 0.3); h.arm('R', 0.4, 2.4, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 1 }); }
      else if (lt < 1.4) { h.reach('R', V(0.78, 0.86, -0.25)); h.arm('L', 0.3, 0.3, 1.8); h.face({ lid: 0.1, brow: 0.6, look: [0.7, -0.3], mouth: 'smile' }); }
      else { h.reach('R', V(0.78, 0.86, -0.25)); h.arm('L', 0.3, 2.5, 0.3); h.hand('L', 'choki'); s.hero.rotation.y = lerp(0.35, 0.05, ease(k(lt, 1.4, 1.9)));
        h.face({ lid: 0.55, brow: 0.7, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['train', 'crowd'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.5, 'train_door', -12]],
    stamps: [{ t: 1.6, text: '全員?!', x: 800, y: 1080, rot: 8, color: RED, size: 70, dur: 1.4 }],
    act(lt, s) {
      s.P.crowd.position.set(0, 0, -0.3); s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 3 + i)) * 0.03; });
      const h = s.hero.userData; place(s.hero, 0, 0.5, 0);
      h.reach('R', V(0.38, 2.1, 0.0)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.3, 1.8);
      h.face(lt < 1.5 ? { lid: 0.6, brow: -0.5, look: [0, -0.3], mouth: 'flat' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) round trip 1h19m
  { sc: 'st', say: ['now'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['train', 'clock'], hud: ['通勤', '往復79分'],
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.1, 1.3, 0] },
    sfx: [[0.4, 'phone_vibe', -14], [1.5, 'text_pa', -10]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '往復 [1時間19分]', y: 480, size: 68, border: CY, sub: '通勤・通学の全国平均' }] : []; },
    tags(lt) { const t0 = this.lt.now + 2.4; return lt > t0 ? [{ t: t0, text: '片道 約40分', x: 600, y: 1130, h: 80, bg: '#ffffff' }] : []; },
    note: '総務省 社会生活基本調査 2021',
    act(lt, s) {
      const c = s.P.clock; c.position.set(-0.8, 1.6, -0.3); c.scale.setScalar(1.4); c.userData.mh.rotation.z = -lt * 3; c.userData.hh.rotation.z = -lt * 0.25;
      const h = s.hero.userData; place(s.hero, 0.25, 0.4, -0.1); s.hero.position.x = 0.25 + Math.sin(lt * 2.5) * 0.03;
      h.reach('R', V(0.76, 2.1, -0.15)); h.hand('R', 'gu');
      hold(s, 'phone', 'L', V(-0.05, 1.2, 0.55), 0);
      h.face(lt < 1.4 ? { lid: 0.6, brow: -0.5, look: [-0.3, -0.4], mouth: 'flat' } : { lid: 0.3, brow: -0.8, look: [0, 0], mouth: 'o', open: 0.5 });
    } },
  // 3) tomorrow 0 min: bed -> desk (the cold open, in its place)
  { sc: 'st', say: ['zero'], pre: 0.15, hold: 0.9, pal: HOOK, show: [], hud: ['通勤', '0分'], hudColor: YEL,
    cam: { p0: [0.0, 1.45, 6.0], p1: [0.05, 1.45, 5.6], l0: [0.0, 1.05, 0] },
    shake: [[1.5, 0.06, 0.5]], lines: [[1.45, 0.7]],
    sfx: [[1.1, 'text_pa', -10], [1.25, 'whoosh_swing', -9], [1.5, 'impact_doon', -11]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '通勤 [0分]', y: 480, size: 74, border: YEL, sub: 'ベッドから机まで 3歩' }] : []; },
    stamps: [{ t: 1.5, text: '出社!!', x: 760, y: 1120, rot: -6, color: YEL, size: 90, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData; room(s); cap(s);
      const u = jump(s, lt, 1.2, 0.3);
      if (lt < 1.2) { h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); h.face({ lid: 1, brow: 0, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = 0.2; }
      else if (u < 1) { h.arm('L', 0.4, 2.4, 0.3); h.arm('R', 0.4, 2.4, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 1 }); }
      else { h.reach('R', V(0.78, 0.86, -0.25)); h.arm('L', 0.3, 2.5, 0.3); h.hand('L', 'choki'); h.face({ lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
    } },
  // 4) 327 h a year = 2 weeks
  { sc: 'st', say: ['year'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['suitcase'], hud: ['1年', '327時間'],
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [2.4, 'sparkle', -14]],
    cards(lt) { return lt > 0.3 && lt < 2.2 ? [{ t: 0.3, text: '1年で [327時間]', y: 480, size: 70, border: CY, sub: '79分×出勤248日（試算）' }]
      : lt >= 2.2 ? [{ t: 2.2, text: 'まるまる [2週間]', y: 480, size: 72, border: YEL, sub: '327時間÷24＝13.6日（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.3, 0.3, 0.25);
      const sc = hold(s, 'suitcase', 'R', V(0.25, lerp(0.55, 0.95, ease(k(lt, 2.2, 2.6))), 0.35), 0); sc.scale.setScalar(1.3);
      h.arm('L', 0.3, lt > 2.2 ? 2.7 : 0.3, 0.3); h.hand('L', lt > 2.2 ? 'pa' : 'gu');
      h.face(lt < 2.2 ? { lid: 0.1, brow: 0.3, look: [0.4, 0.2], mouth: 'o', open: 0.6 } : { lid: 0.5, brow: 0.5, look: [0, 0], mouth: 'smile' });
    } },
  // 5) 370,000 yen
  { sc: 'st', say: ['money'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['coinsA'], hud: ['時給換算', '37万円'],
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.5, 'coin_toss', -12], [1.4, 'text_pa', -10], [1.8, 'coin_toss', -13]],
    cards(lt) { return lt > 1.35 ? [{ t: 1.35, text: '1年で [37万円]分', y: 480, size: 70, border: YEL, sub: '最低賃金1,121円×327時間（試算）' }] : []; },
    note: '最低賃金 全国加重平均 厚労省 2025年度',
    act(lt, s) {
      const c = s.P.coinsA; place(c, 0.5, 0.0); const n = Math.round(4 + 24 * ease(k(lt, 0.2, 2.2))); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.3);
      h.reach('R', V(0.36, 0.15 + n * 0.028, 0.05)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.3, 0.4); h.hand('L', 'gu');
      h.face(lt < 1.35 ? { lid: 0.2, brow: 0, look: [0.6, 0], mouth: 'o', open: 0.5 } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 6) nationwide: 10,000 years a day
  { sc: 'st', say: ['nation'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['crowd', 'clock'], hud: ['日本中', '毎日1万年分'],
    cam: { p0: [0.0, 1.55, 5.6], p1: [0.0, 1.5, 5.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.9, 'text_pa', -10], [1.2, 'whoosh_gust', -13], [2.2, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '毎日 [1万年分]', y: 480, size: 72, border: CY, sub: '就業者6,781万人×79分（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.nation + 2.2; return lt > t0 ? [{ t: t0, text: '時計が逆回り?!', x: 600, y: 1130, h: 80, bg: '#ffffff' }] : []; },
    act(lt, s) {
      s.P.crowd.position.set(0, 0, -0.6); s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 6 + i)) * 0.08; });
      const c = s.P.clock; c.position.set(0.75, 1.75, 0.0); c.scale.setScalar(1.6); c.userData.mh.rotation.z = lt * 9; c.userData.hh.rotation.z = lt * 0.8;
      const h = s.hero.userData; place(s.hero, -0.35, 0.4, 0.3);
      h.reach('R', V(0.45, 1.6, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa');
      h.face(lt < 1.2 ? { lid: 0.1, brow: 0.3, look: [0.6, 0.3], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0.7, 0.4], mouth: 'o', open: 1.1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); cap(s); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) no walk to the station -> +2 kg a year
  { sc: 'st', say: ['aruki'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], show: ['scale'], hud: ['歩数', '−2,000歩'], hudColor: RED,
    cam: { p0: [0.0, 1.35, 4.8], p1: [0.0, 1.35, 4.5], l0: [0.0, 1.05, 0] },
    sfx: [[1.5, 'text_pa', -10], [1.8, 'comic_boyon', -12], [2.7, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.45 ? [{ t: 1.45, text: '1年で [+2kg]', y: 480, size: 72, border: RED, sub: '往復20分＝約2,000歩 60kcal/日（試算）' }] : []; },
    stamps: [{ t: 2.7, text: 'ムチッ', x: 300, y: 1150, rot: -8, color: '#ffffff', size: 70, dur: 1.2 }],
    act(lt, s) {
      place(s.P.scale, 0, 0.3); s.P.scale.scale.setScalar(1.6);
      s.P.scale.userData.disp.material = lt > 1.45 ? basic('#ff8a80') : basic('#9fe3c0');
      const h = s.hero.userData; place(s.hero, 0, 0.3, 0); s.hero.position.y = 0.1;
      const g = 1 + 0.16 * ease(k(lt, 1.6, 2.6)); h.body.scale.set(g, 1, g);
      h.arm('L', 0.4, 0.8, 0.6); h.arm('R', 0.4, 0.8, 0.6); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.45 ? { lid: 0.2, brow: 0, look: [0, -0.7], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, -0.8], mouth: 'o', open: 1.1 });
    } },
  // 9) air conditioner 8 h at home -> +30,000 yen a year
  { sc: 'st', say: ['denki'], pre: 0.15, pal: ['#2f6fb0', '#d6e8f7', '#ffd23a'], show: ['aircon', 'desk', 'laptop'], hud: ['電気代', '+3万円'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.0], p1: [0.0, 1.52, 4.7], l0: [0.0, 1.4, 0] },
    sfx: [[0.3, 'whoosh_gust', -14], [1.5, 'text_pa', -10], [3.35, 'text_pa', -10], [3.6, 'comic_fall', -12]],
    cards(lt) { return lt > 1.45 && lt < 3.3 ? [{ t: 1.45, text: 'エアコン [1日8時間]', y: 480, size: 64, border: CY, sub: '在宅で仕事中ずっと' }]
      : lt >= 3.3 ? [{ t: 3.3, text: '電気代 [+3万円]/年', y: 480, size: 66, border: RED, sub: '0.5kW×8時間×31円×248日（試算）' }] : []; },
    act(lt, s) {
      const a = s.P.aircon; a.position.set(-0.5, 2.3, -0.9); a.userData.wind.forEach((m, i) => { const d = (lt * 0.8 + i * 0.2) % 1; m.position.set(-0.4 + i * 0.2, -0.25 - d * 0.6, 0.2 + d * 0.6); m.material.opacity = 0.8 * (1 - d); });
      place(s.P.desk, 0.75, -0.45); const l = s.P.laptop; l.userData.ping.scale.setScalar(0.03); l.position.set(0.75, 0.77, -0.45); l.rotation.set(0, -0.3, 0);
      const h = s.hero.userData; place(s.hero, -0.15, 0.3, 0.15);
      if (lt < 3.3) { h.reach('R', V(0.6, 0.86, -0.3)); h.arm('L', 0.3, 0.6, 0.8); h.face({ lid: 0.3, brow: 0.2, look: [-0.5, 0.7], mouth: 'smile' }); }
      else { const p = hold(s, 'paper', 'R', V(0.25, 1.3, 0.6), 0.05); p.scale.setScalar(1.3); h.arm('L', 0.6, 0.6, 1.0); h.hand('L', 'pa');
        h.face({ lid: 0, brow: -1, browY: 1, look: [0.4, -0.2], mouth: 'o', open: 1.1 }); }
    } },
  // 10) the "train was late" excuse is gone
  { sc: 'st', say: ['chikoku'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], hero2: true, show: [], hud: ['遅刻の', '言い訳'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.7], p1: [0.0, 1.43, 5.4], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'phone_vibe', -13], [1.25, 'text_pa', -10], [2.0, 'comic_tsukkomi', -11]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '「電車が遅れて」→ [×]', y: 480, size: 62, border: RED, sub: '家から3歩なので…' }] : []; },
    stamps: [{ t: 2.0, text: 'ウソつけ!', x: 760, y: 1160, rot: 6, color: '#ffffff', size: 66, dur: 1.3 }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.68, 0.2, 0.3); place(s.hero2, 0.68, 0.1, -0.3); cap(s);
      hold(s, 'phone', 'R', V(-0.35, 1.3, 0.45), 0); h.arm('L', 0.5, 1.4, 1.2); h.hand('L', 'pa');
      h2.arm('L', 0.6, 0.2, 2.2); h2.arm('R', 0.6, 0.2, 2.2);
      h.face(lt < 1.2 ? { lid: 0.3, brow: -0.6, look: [0.6, 0], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 0.8 });
      h2.face(lt < 2.0 ? { lid: 0.5, brow: 0.6, look: [-0.6, 0], mouth: 'flat' } : { lid: 0.3, brow: 1, look: [-0.6, 0], mouth: 'o', open: 0.9 });
    } },
  // 11) good news / bad news: sleep in vs work in the bedroom
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: [], hud: ['寝室', 'オフィス化'], hudColor: RED,
    cam: { p0: [-0.1, 1.4, 5.0], p1: [-0.1, 1.4, 4.7], l0: [-0.1, 1.1, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.1, 'text_pa', -10], [3.1, 'phone_vibe', -12], [3.7, 'comic_fall', -12]],
    cards(lt) { return lt < 2.05 ? (lt > 0.25 ? [{ t: 0.25, text: '[寝坊] できる', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.05, text: '[仕事] が寝室に', y: 480, size: 70, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 0.5, text: 'Zzz…', x: 300, y: 1000, rot: -8, color: '#ffffff', size: 60, dur: 1.5 }],
    act(lt, s) {
      const b = s.P.bed; b.visible = true; place(b, -0.3, -0.4);
      const h = s.hero.userData; place(s.hero, 0.0, 0.35, 0.15); cap(s);
      if (lt < 2.05) { h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); h.face({ lid: 1, brow: 0.3, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.25; }
      else { const l = s.P.laptop; l.visible = true; const u = ease(k(lt, 2.1, 2.5)); l.position.set(0.15, lerp(2.6, 0.98, u), 0.6); l.rotation.set(0.25, 0, 0);
        l.userData.ping.scale.setScalar(Math.sin(lt * 12) > 0 ? 0.04 : 0.025);
        h.reach('R', V(0.38, 0.98, 0.6)); h.reach('L', V(-0.08, 0.98, 0.6)); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0, brow: -1, browY: 1, look: [0.2, -0.3], mouth: 'o', open: 1 }); }
    } },
  // 12) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['laptop'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'ゼロがいい', x: 320, y: 1130, h: 110, bg: CY }, { t: t0 + 0.2, text: '通勤も好き', x: 760, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05); cap(s);
      const l = s.P.laptop; l.userData.ping.scale.setScalar(0.03); l.position.set(0.45, 1.05, 0.45); l.rotation.set(0.2, -0.2, 0); h.reach('R', V(0.45, 1.0, 0.5)); h.hand('R', 'pa');
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[通勤]が', '全員ゼロになったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['通勤', 'ゼロ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
