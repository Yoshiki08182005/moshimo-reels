// ep59_koe_x2 (pop / arm A 原因を拡大): もしも声が毎回2倍大きくなったら？
// 型は sp_geppu2x / ep58。sp_geppu2x と数字が被らないよう「声が届く距離・人数・ないしょ話」の切り口。台本・数字・小道具は自作。
// 前提（試算）:
//   ふつうの会話 60dB（距離1m。自治体の騒音の目安：掛川市・新宿区ほか）。体感の大きさ2倍 ≒ +10dB → n回目 = 60+10(n-1) dB
//   届く距離：点音源で距離2倍ごとに-6dB（L(r)=L1-20log10 r）、40dB（図書館なみ）まで下がる距離。空気の吸収・地形・風は無視
//     3回目 80dB → 10^((80-40)/20)=100m / 5回目 100dB → 1km / 9回目 140dB → 100km（東京〜富士山 約100km）
//   人数：100dB は 60dB の 10^4 = 1万倍のエネルギー＝ふつうの声1万人分 / 140dB → 10^8 = 1億人 ≒ 日本人全員（約1.2億）
//   耳：WHO（2015 Make Listening Safe）職場の上限 85dB×8時間、3dBごとに半分 → 100dB は 8h/2^5 = 15分
//   ないしょ話：ささやき 30dB → 7回目 30+60=90dB → 40dBまで 316m ≒ 300m
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep59_koe_x2.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9fc8', '#fff0f6', '#35d0ff'];

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // sound-wave rings (axis = local z)
  { const g = G(); g.userData.items = [0, 1, 2, 3, 4].map(i => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 8, 40),
      new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffffff' : '#35d0ff', transparent: true, opacity: 0.85 })); g.add(m); return m; }); reg('waves', g); }
  // signpost "100m"
  { const g = G(); cyl(0.035, 0.035, 1.6, '#9aa3ad', 0, 0.8, 0, g);
    const b = plate(0.9, 0.44, 360, 176, (c) => { c.fillStyle = '#ff8f3a'; c.beginPath(); c.roundRect(4, 4, 352, 168, 24); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#ffffff'; c.font = 'bold 96px sans-serif'; c.textAlign = 'center'; c.fillText('100m', 180, 122); });
    b.position.set(0, 1.55, 0.04); g.add(b); reg('sign', g); }
  // Mt Fuji
  { const g = G(); cyl(0.35, 2.6, 2.2, '#4f6fd8', 0, 1.1, 0, g); cyl(0.05, 0.62, 0.62, '#ffffff', 0, 1.95, 0, g); reg('fuji', g); }
  // little houses
  { const g = G(); const cols = ['#ff7a6b', '#5aa9ff', '#7bd88f', '#ffd23a', '#c79bff'];
    g.userData.items = cols.map((col, i) => { const h = G(); rbox(0.7, 0.6, 0.6, 0.05, '#fff6e8', 0, 0.3, 0, h);
      const r = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 4), M(col)); r.rotation.y = Math.PI / 4; r.position.y = 0.8; r.castShadow = true; h.add(r);
      rbox(0.2, 0.2, 0.02, 0.02, '#9fd4ff', 0, 0.36, 0.3, h); h.position.set((i - 2) * 1.0, 0, 0); g.add(h); return h; }); reg('houses', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
// rings travelling from origin along direction (yaw ry: 0 = toward camera, +pi/2 = toward +x)
function waves(s, o, ry, lt, t0, { speed = 3, gap = 0.18, r0 = 0.12, grow = 0.6, tilt = 0 } = {}) {
  const w = s.P.waves; w.visible = lt > t0; w.position.copy(o); w.rotation.set(tilt, ry, 0);
  w.userData.items.forEach((m, i) => { const u = (lt - t0 - i * gap); m.visible = u > 0; const d = Math.max(0, u) * speed;
    m.position.set(0, 0, d); const r = r0 + d * grow; m.scale.setScalar(r); m.material.opacity = clamp(0.9 - d * 0.12, 0.15, 0.9); });
}
// mouth position of a hero placed at (x, z)
const mouth = (s) => s.hero.position.clone().add(V(0, 1.24 + s.hero.userData.body.position.y, 0.35));
function shoutPose(h, lt) { // both hands as a megaphone
  const m = mouth(S); h.reach('L', m.clone().add(V(-0.17, 0.0, 0.08))); h.reach('R', m.clone().add(V(0.17, 0.0, 0.08))); h.hand('L', 'pa'); h.hand('R', 'pa');
  h.face({ lid: 0, brow: 0.7, look: [0, 0], mouth: 'o', open: 0.8 + 0.3 * Math.abs(Math.sin(lt * 8)) });
}

// cold open / recall: whisper a secret -> the friend is blasted into the sky
function coldScene(s, lt, t0) {
  const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.32, 0.3, 0.55); s.hero2.visible = true;
  const m = mouth(s); h.reach('R', m.clone().add(V(0.12, 0.02, 0.1))); h.hand('R', 'pa'); h.arm('L', 0.2, 0.3, 0.6);
  const u = k(lt, t0 + 0.05, t0 + 0.9);
  place(s.hero2, 0.45 + 2.6 * u, 0.25 + 1.5 * u, -0.7 + u * 3); s.hero2.position.y = 6 * u; s.hero2.rotation.z = -u * 4;
  if (lt < t0) { h.face({ lid: 0.35, brow: 0.2, look: [0.6, 0], mouth: 'smile' }); h2.face({ lid: 0.2, brow: 0.3, look: [-0.6, 0], mouth: 'smile' });
    h2.reach('L', s.hero2.position.clone().add(V(-0.3, 1.4, 0.2))); s.P.waves.visible = false; return false; }
  waves(s, m.clone().add(V(0.1, 0, 0)), Math.PI / 2 - 0.3, lt, t0, { speed: 5, gap: 0.1, r0: 0.15, grow: 0.5 });
  h2.face({ lid: 0, brow: -1, browY: 1, look: [0, 0.5], mouth: 'o', open: 1.1 }); h2.arm('L', 0.3, 2.6, 0.2); h2.arm('R', 0.3, 2.6, 0.2); h2.hand('L', 'pa'); h2.hand('R', 'pa');
  return true;
}

const plan = [
  // 0) cold open (flash-forward of #8): whisper "ないしょね" -> friend flies off into the sky -> push in to a deadpan face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [], hero2: true,
    cam: { p0: [0.4, 1.7, 6.6], p1: [-0.3, 1.5, 3.4], l0: [0.6, 1.6, -0.5], l1: [-0.3, 1.42, 0.3], hold: 1.2, dur: 2.0 },
    shake: [[0.22, 0.08, 0.6]], lines: [[0.22, 0.9]],
    sfx: [[0.0, 'text_touch', -14], [0.2, 'impact_doon', -10], [0.22, 'whoosh_gust', -11], [0.26, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.24, text: 'ないしょ話 300m!!', x: 540, y: 400, rot: -6, color: YEL, size: 80, dur: 1.15 },
      { t: 2.2, text: '…ないしょね♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.8 }],
    act(lt, s) {
      const on = coldScene(s, lt, 0.2); const h = s.hero.userData; if (!on) return;
      if (lt < 1.4) h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.5], mouth: 'o', open: 1 });
      else { s.hero.rotation.y = 0.55 * (1 - ease(k(lt, 1.4, 1.9))); h.face({ lid: 0.45, brow: 0.1, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'whoosh_gust', -13], [1.7, 'comic_surprise', -12]],
    stamps: [{ t: 1.8, text: '2倍!?', x: 800, y: 1080, rot: 8, color: RED, size: 76, dur: 1.1 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0.0, 0.4, 0); shoutPose(h, lt);
      waves(s, mouth(s), 0, lt, 1.5, { speed: 2.2, gap: 0.2, r0: 0.1, grow: 0.5 });
      if (lt < 1.5) h.face({ lid: 0.2, brow: 0.3, look: [0, 0], mouth: 'o', open: 0.4 });
    } },
  // 2) 60 dB, x2 each time
  { sc: 'st', say: ['rule'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hero2: true, hud: ['声', '60dB'],
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.7, 'whoosh_switch1', -12], [3.0, 'text_pa', -10]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: 'ふつうの会話 [60dB]', y: 480, size: 70, border: CY, sub: '距離1m（騒音の目安）' }] : []; },
    tags(lt) { const t0 = 2.7; return lt > t0 ? [{ t: t0, text: '1回目 60dB', x: 300, y: 1160, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '毎回 体感×2', x: 770, y: 1160, h: 100, bg: CY }] : []; },
    note: '体感2倍＝+10dBとして計算（試算）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.62, 0.4, 0.5); place(s.hero2, 0.62, 0.4, -0.5); s.hero2.visible = true;
      h.arm('R', 0.5, 0.5, 1.2); h.hand('R', 'pa'); h.arm('L', 0.2, 0.3, 0.5);
      h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0], mouth: 'o', open: 0.3 + 0.4 * Math.abs(Math.sin(lt * 9)) });
      h2.face({ lid: 0.2, brow: 0.3, look: [-0.5, 0], mouth: 'smile' }); h2.arm('L', 0.3, 0.4, 1.0);
      const big = lt > 2.7; waves(s, mouth(s).add(V(0.1, 0, 0)), Math.PI / 2 - 0.5, lt, big ? 2.7 : 0.2, { speed: big ? 1.6 : 0.6, gap: 0.25, r0: 0.06, grow: big ? 0.25 : 0.15 });
      if (big) h2.face({ lid: 0, brow: 0.8, browY: 1, look: [-0.5, 0.2], mouth: 'o', open: 1 });
    } },
  // 3) 3rd time: 100 m
  { sc: 'st', say: ['d100'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['sign'], hero2: true, hud: ['3回目', '80dB'], hudColor: YEL,
    cam: { p0: [0.3, 1.6, 5.2], p1: [0.3, 1.55, 4.8], l0: [0.3, 1.35, -0.5] },
    sfx: [[0.1, 'whoosh_gust', -12], [0.8, 'text_pa', -10], [2.6, 'comic_pico', -12]],
    cards(lt) { return lt > 0.7 ? [{ t: 0.7, text: '[100m] 先まで届く', y: 480, size: 72, border: YEL, sub: '40dBに下がるまでの距離（試算）' }] : []; },
    note: '距離2倍で-6dB。空気の吸収・地形は無視',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.55, 0.6, 0.35); shoutPose(h, lt);
      place(s.P.sign, 0.55, -1.2, -0.2); place(s.hero2, 1.5, -3.2, -0.4); s.hero2.visible = true; s.hero2.scale.setScalar(0.8);
      waves(s, mouth(s), Math.PI - 0.7, lt, 0.1, { speed: 3, gap: 0.22, r0: 0.12, grow: 0.4 });
      h2.arm('L', 0.2, 2.6 + 0.3 * Math.sin(lt * 10), 0.2); h2.hand('L', 'pa'); h2.face({ lid: 0, brow: 0.6, look: [-0.3, 0], mouth: 'o', open: 0.8 });
    } },
  // 4) 5th time: 10,000 people's voices
  { sc: 'st', say: ['crowd'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['crowd'], hud: ['5回目', '100dB'], hudColor: YEL,
    cam: { p0: [0.0, 1.6, 5.4], p1: [0.0, 1.55, 5.0], l0: [0.0, 1.35, -0.3] },
    sfx: [[0.2, 'impact_don', -12], [1.4, 'text_pa', -10], [2.2, 'sparkle', -14]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: 'ふつうの声 [1万人分]', y: 480, size: 70, border: CY, sub: '100dB＝60dBの1万倍のエネルギー（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.75, 0); shoutPose(h, lt);
      s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 7 + i)) * 0.06; p.rotation.y = 0.3 * Math.sin(lt * 2 + i); });
      waves(s, mouth(s), 0, lt, 0.15, { speed: 2.4, gap: 0.16, r0: 0.15, grow: 0.6 });
      if (lt > 2.4) h.face({ lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 5) 9th time: all of Japan, reaches Mt Fuji
  { sc: 'st', say: ['fuji'], pre: 0.15, pal: ['#2f3d7a', '#d9def5', '#ffd23a'], show: ['fuji'], hud: ['9回目', '140dB'], hudColor: YEL,
    cam: { p0: [-0.2, 1.7, 5.4], p1: [-0.2, 1.7, 5.0], l0: [0.1, 1.55, -1] },
    sfx: [[0.2, 'whoosh_gust', -11], [0.9, 'text_pa', -10], [3.0, 'impact_doon', -12], [3.9, 'text_pa', -10], [4.8, 'comic_jajean', -13]],
    cards(lt) { return lt < 3.7 ? (lt > 0.8 ? [{ t: 0.8, text: '日本人 [全員] の声', y: 480, size: 72, border: YEL, sub: '140dB＝ふつうの声 1億人分（試算）' }] : [])
      : [{ t: 3.7, text: '[富士山] まで届く', y: 480, size: 72, border: YEL, sub: '東京から約100km（試算）' }]; },
    act(lt, s) {
      const f = s.P.fuji; place(f, 0.95, -1.9); f.scale.setScalar(0.75);
      const h = s.hero.userData; place(s.hero, -0.5, 0.6, 0.35);
      if (lt < 3.4) { shoutPose(h, lt); waves(s, mouth(s), Math.PI - 0.5, lt, 0.2, { speed: 2.6, gap: 0.14, r0: 0.15, grow: 0.5 }); }
      else { h.reach('R', V(0.15, 1.75, 0.2)); h.hand('R', 'choki'); h.arm('L', 0.3, 0.6, 1.2); h.hand('L', 'pa');
        h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.6, 0.4], mouth: 'o', open: 1 });
        waves(s, V(0.95, 1.75, -1.9), 0, lt, 3.4, { speed: 1.2, gap: 0.18, r0: 0.1, grow: 0.5 }); }
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.6], p1: [0, 1.48, 3.0], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) ears: only 15 minutes at 100 dB
  { sc: 'st', say: ['ear'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['clock'], hud: ['耳の限界', '100dBで15分'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 4.8], p1: [0.0, 1.5, 4.5], l0: [0.1, 1.4, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [1.0, 'countdown_tick', -13], [2.2, 'text_pa', -10], [2.6, 'comic_shock2', -12]],
    cards(lt) { return lt > 2.1 ? [{ t: 2.1, text: '耳が無事なのは [15分]', y: 480, size: 66, border: RED, sub: '85dB×8時間が上限、3dBごとに半分' }] : []; },
    note: 'WHO 2015「Make Listening Safe」',
    act(lt, s) {
      const c = s.P.clock; c.visible = true; c.position.set(0.95, 1.95, -0.8); c.scale.setScalar(1.3); const m = 15 * ease(k(lt, 0.2, 2.2));
      c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(3 + m / 60) / 12 * Math.PI * 2;
      const h = s.hero.userData; place(s.hero, -0.35, 0.45, 0.2); const hp = s.hero.position;
      h.reach('L', hp.clone().add(V(-0.46, 1.45, 0.05))); h.reach('R', hp.clone().add(V(0.46, 1.45, 0.05))); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.head.rotation.z = 0.08 * Math.sin(lt * 14);
      h.face(lt < 2.1 ? { lid: 0.7, brow: -0.6, browY: 1, look: [0, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0.3], mouth: 'o', open: 1 });
    } },
  // 8) secret blasted 300 m (the cold open, in its place)
  { sc: 'st', say: ['secret'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hero2: true, hud: ['ないしょ話', '300m'], hudColor: RED,
    cam: { p0: [0.4, 1.7, 6.4], p1: [0.3, 1.6, 5.8], l0: [0.4, 1.6, -0.5] },
    sfx: [[0.3, 'impact_doon', -11], [0.32, 'whoosh_gust', -12], [1.6, 'text_pa', -10], [2.8, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: 'ないしょ話 [300m]', y: 480, size: 70, border: RED, sub: 'ささやき30dB→7回目で90dB（試算）' }] : []; },
    act(lt, s) {
      const on = coldScene(s, lt, 0.3); const h = s.hero.userData; if (!on) return;
      h.face(lt < 1.8 ? { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.5], mouth: 'o', open: 1 } : { lid: 0.45, brow: -0.6, browY: 1, look: [0.5, 0.4], mouth: 'flat' });
    } },
  // 9) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#5aa9ff', '#e6f2ff', '#ffd23a'], show: [], hero2: true, hud: ['大きい声の', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 5.2], p1: [0.0, 1.55, 4.8], l0: [0.1, 1.35, -0.5] },
    sfx: [[0.2, 'whoosh_gust', -12], [0.4, 'text_pa', -10], [2.1, 'text_pa', -10], [3.3, 'impact_don', -12], [4.2, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.0 ? (lt > 0.3 ? [{ t: 0.3, text: '迷子に [ならない]', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.0, text: '[ひとりごと] まる聞こえ', y: 480, size: 66, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.4, text: 'うるさーい!!', x: 760, y: 1120, rot: 6, color: RED, size: 74, dur: 1.4 }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      if (lt < 2.0) { place(s.hero, -0.6, 0.6, 0.4); shoutPose(h, lt); waves(s, mouth(s), Math.PI - 0.6, lt, 0.1, { speed: 3, gap: 0.2, r0: 0.12, grow: 0.4 });
        place(s.hero2, 1.3, -2.6, -0.4); s.hero2.visible = true; s.hero2.scale.setScalar(0.85); h2.arm('L', 0.2, 2.6 + 0.3 * Math.sin(lt * 10), 0.2); h2.hand('L', 'pa');
        h2.face({ lid: 0, brow: 0.5, look: [-0.3, 0], mouth: 'smile' }); }
      else { s.hero2.visible = false; place(s.P.houses, 0, -2.2); place(s.hero, 0, 0.6, 0);
        h.arm('L', 0.4, 0.3, 1.6); h.arm('R', 0.4, 0.3, 1.6); h.hand('L', 'gu'); h.hand('R', 'gu');
        waves(s, mouth(s), Math.PI, lt, 2.4, { speed: 3, gap: 0.15, r0: 0.15, grow: 0.6 });
        s.P.houses.userData.items.forEach((o, i) => { o.position.y = lt > 3.3 ? Math.abs(Math.sin(lt * 18 + i)) * 0.06 : 0; });
        h.face(lt < 3.3 ? { lid: 0.5, brow: 0.2, look: [0.3, -0.4], mouth: 'o', open: 0.3 + 0.3 * Math.abs(Math.sin(lt * 8)) } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); }
    } },
  // 10) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '小声でいい', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      const m = mouth(s); h.reach('R', m.clone().add(V(0.14, 0.02, 0.08))); h.hand('R', 'pa'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも声が', '毎回[2倍]大きくなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['声', '×2ずつ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
