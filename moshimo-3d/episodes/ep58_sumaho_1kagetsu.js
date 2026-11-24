// ep58_sumaho_1kagetsu (pop / arm C ニュース起点): もしもスマホが1か月使えなくなったら？
// 入り口：最近の通信障害のニュース（出来事のみ）。型は sp_geppu2x / ep53。台本・数字・小道具は自作。
// 前提（試算）:
//   スマホ接触時間 165.1分/日（博報堂DYメディアパートナーズ メディア定点調査2025）= 2時間45分
//   1か月(30日): 165.1×30/60 = 82.6時間 ≒ 83時間 / 本1冊4時間で読む前提 → 82.6÷4 = 20.6 ≒ 20冊
//   歩く: 時速4.8km × 2.75時間 = 13.2km/日、30日で396km ≒ 東京〜大阪の直線距離（約400km）
//   首: 60度うつむくと首にかかる負担 約27kg（60ポンド、Hansraj 2014 Surgical Technology International）
//   1年: 165.1×365/60/24 = 41.8日 ≒ 42日分
//   道具: 電話・カメラ・地図・財布・時計・目覚まし・電卓・手帳・テレビ・ゲーム・ライト・辞書 = 12個（数え）
//   支払い: コード決済 年16.6兆円（経済産業省 2025年のキャッシュレス決済比率 58.0%、2026年3月公表）÷12 = 1.38 ≒ 1.4兆円/月
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep58_sumaho_1kagetsu.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9fc8', '#fff0f6', '#35d0ff'];
const TOOLS = ['電話', 'カメラ', '地図', '財布', '時計', '目覚まし', '電卓', '手帳', 'テレビ', 'ゲーム', 'ライト', '辞書'];
const TCOL = ['#ff7a6b', '#5aa9ff', '#7bd88f', '#ffd23a', '#c79bff', '#ff9f43', '#4fd1c5', '#f78fb3', '#6c8cff', '#ffb84a', '#9be15d', '#e0a3ff'];

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // paper cups of the string phone (open end = +y)
  for (const n of ['cupA', 'cupB']) { const c = G(); cyl(0.085, 0.06, 0.15, '#ffffff', 0, 0, 0, c); cyl(0.089, 0.089, 0.02, '#ff7aa8', 0, 0.065, 0, c); cyl(0.07, 0.07, 0.005, '#d9d9d9', 0, -0.074, 0, c); reg(n, c); }
  // the string (unit length along y, placed by setString)
  { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), M('#c94f2a')); s.castShadow = true; const g = G(); g.add(s); reg('string', g); }
  // road sign "大阪 400km"
  { const g = G(); cyl(0.035, 0.035, 1.9, '#9aa3ad', 0, 0.95, 0, g);
    const b = plate(1.05, 0.5, 420, 200, (c) => { c.fillStyle = '#1f6fd1'; c.beginPath(); c.roundRect(4, 4, 412, 192, 24); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#ffffff'; c.font = 'bold 76px sans-serif'; c.textAlign = 'center'; c.fillText('大阪 →', 210, 98); c.font = 'bold 54px sans-serif'; c.fillText('約400km', 210, 168); });
    b.position.set(0, 1.85, 0.04); g.add(b); reg('sign', g); }
  // weight block "27kg"
  { const g = G(); rbox(0.6, 0.42, 0.4, 0.08, '#4a5160', 0, 0.21, 0, g);
    const l = plate(0.5, 0.26, 260, 130, (c) => { c.fillStyle = '#ffd23a'; c.beginPath(); c.roundRect(4, 4, 252, 122, 20); c.fill(); c.fillStyle = '#20232b'; c.font = 'bold 78px sans-serif'; c.textAlign = 'center'; c.fillText('27kg', 130, 92); });
    l.position.set(0, 0.22, 0.205); g.add(l); reg('weight', g); }
  // calendar "42日"
  { const g = G(); rbox(1.0, 1.1, 0.05, 0.04, '#ffffff', 0, 0, 0, g); rbox(1.0, 0.26, 0.06, 0.04, '#ff5a4f', 0, 0.42, 0.005, g);
    const l = plate(0.9, 0.78, 360, 312, (c) => { c.fillStyle = '#20232b'; c.font = 'bold 150px sans-serif'; c.textAlign = 'center'; c.fillText('42', 160, 190); c.font = 'bold 70px sans-serif'; c.fillText('日', 300, 190);
      c.fillStyle = '#7a8090'; c.font = 'bold 46px sans-serif'; c.fillText('スマホ', 180, 280); });
    l.position.set(0, -0.12, 0.04); g.add(l); g.position.set(0.95, 1.6, -0.6); reg('cal', g); }
  // 12 tool tiles (items)
  { const g = G(); g.userData.items = TOOLS.map((t, i) => { const it = G(); rbox(0.36, 0.36, 0.06, 0.06, TCOL[i], 0, 0, 0, it);
      const l = plate(0.32, 0.32, 160, 160, (c) => { c.fillStyle = '#ffffff'; c.font = `bold ${t.length > 3 ? 34 : 44}px sans-serif`; c.textAlign = 'center'; c.fillText(t, 80, 94); }); l.position.z = 0.035; it.add(l); g.add(it); return it; });
    reg('tiles', g); }
  // red X (for the payment terminal)
  { const g = G(); for (const r of [0.785, -0.785]) { const b = rbox(0.5, 0.09, 0.03, 0.03, '#ff3b30', 0, 0, 0, g); b.rotation.z = r; } reg('xmark', g); }
  // card reader on the counter
  { const g = G(); rbox(0.26, 0.12, 0.34, 0.03, '#2c3b6b', 0, 0.06, 0, g); const s = plate(0.2, 0.14, 120, 84, (c) => { c.fillStyle = '#9fe3c0'; c.fillRect(0, 0, 120, 84); c.fillStyle = '#20232b'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('QR', 60, 56); });
    s.rotation.x = -0.9; s.position.set(0, 0.125, 0.02); g.add(s); reg('reader', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rx = 0, ry = 0, rz = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(rx, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
function setString(s, a, b) { const g = s.P.string; g.visible = true; const d = b.clone().sub(a); g.position.copy(a.clone().add(b).multiplyScalar(0.5)); g.scale.set(1, d.length(), 1);
  g.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
// string phone: hero holds cupA at the ear, hero2 far away with cupB at the mouth
function stringPhone(s, lt, x2 = 1.55, z2 = -2.0) {
  const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.visible = true; place(s.hero2, x2, z2, -0.5);
  const a = hold(s, 'cupA', 'R', V(0.42, 1.48, 0.12), 0, 0, -1.4);
  const cB = s.P.cupB; cB.visible = true; const pb = V(x2 - 0.25, 1.35, z2 + 0.4); cB.position.copy(pb); cB.rotation.set(-1.2, 0, 0.4); h2.reach('L', pb.clone().add(V(-0.08, -0.06, -0.05)));
  setString(s, a.position.clone().add(V(0.08, 0, 0)), pb.clone());
  h2.arm('R', 0.3, 0.6 + 0.3 * Math.sin(lt * 6), 0.8); h2.hand('R', 'pa');
  h2.face({ lid: 0.1, brow: 0.6, look: [-0.6, 0], mouth: 'o', open: 0.5 + 0.5 * Math.abs(Math.sin(lt * 9)) });
}
function wallClock(s, h, m, x = 0.95, y = 2.05, z = -1.0, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
function tucked(s, x = 0.12) { place(s.hero, x, 0.15, 0); const b = s.P.bed; b.visible = true; b.position.set(0, 0, 0.1); b.rotation.set(0, 0, 0); b.scale.setScalar(1.25);
  const h = s.hero.userData; h.reach('L', V(x - 0.32, 0.8, 0.6)); h.reach('R', V(x + 0.32, 0.8, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu'); }

// cold open / recall: phone yanked into the sky at t0, then the string phone
function coldScene(s, lt, t0) {
  const h = s.hero.userData; place(s.hero, 0, 0.3, 0.15);
  if (lt < t0) { s.hero2.visible = false; hold(s, 'phone', 'R', V(0.18, 1.08, 0.62), -0.5); h.arm('L', 0.3, 0.3, 1.6); h.face({ lid: 0.3, brow: 0.2, look: [0.2, -0.6], mouth: 'smile' }); return false; }
  const u = k(lt, t0, t0 + 0.45); const p = s.P.phone; p.visible = u < 1; p.position.set(0.18 + 0.4 * u, 1.08 + 7 * u * u, 0.62); p.rotation.set(-0.5, 0, u * 8);
  stringPhone(s, lt); h.arm('L', 0.4, 0.5, 1.4); h.hand('L', 'pa'); return true;
}

const plan = [
  // 0) cold open (flash-forward of #10): the phone is yanked into the sky, a string-phone cup lands at the ear -> push in to a deadpan "moshimoshi?"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.6, 1.7, 7.2], p1: [0.15, 1.5, 3.4], l0: [0.6, 1.4, -0.8], l1: [0.15, 1.42, 0.3], hold: 1.2, dur: 2.0 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.24, 0.9]],
    sfx: [[0.0, 'phone_vibe', -13], [0.18, 'whoosh_gust', -11], [0.25, 'impact_doon', -10], [0.27, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.26, text: 'スマホ 1か月なし!!', x: 540, y: 400, rot: -6, color: YEL, size: 84, dur: 1.15 },
      { t: 2.25, text: '…もしもし？', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 64, dur: 0.75 }],
    act(lt, s) {
      const on = coldScene(s, lt, 0.2); const h = s.hero.userData; if (!on) return;
      if (lt < 1.4) h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.6], mouth: 'o', open: 1 });
      else { h.face({ lid: 0.45, brow: 0.1, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.7, 'comic_surprise', -12]],
    stamps: [{ t: 1.8, text: '1か月?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0.0, 0.4, 0.05);
      const p = hold(s, 'phone', 'R', V(0.22, 1.05, 0.7), -0.4); if (lt > 1.6) { const u = k(lt, 1.6, 2.2); p.position.y += 3 * u * u; p.rotation.z = u * 5; }
      h.arm('L', 0.3, 0.4, 1.6); h.hand('L', 'pa');
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.4, look: [0.3, -0.4], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0.6], mouth: 'o', open: 1 });
    } },
  // 2) 2h45m a day
  { sc: 'st', say: ['rule'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['スマホ', '1日2時間45分'],
    cam: { p0: [0.1, 1.5, 5.2], p1: [0.1, 1.48, 4.9], l0: [0.1, 1.35, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [1.1, 'text_pa', -10]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '1日 [2時間45分]', y: 480, size: 72, border: CY, sub: 'スマホを見ている時間（平均）' }] : []; },
    note: '165.1分/日 博報堂 メディア定点調査2025',
    act(lt, s) {
      const m = 45 + 120 * ease(k(lt, 0.3, 2.4)); wallClock(s, Math.floor(m / 60), m % 60, 0.95, 2.0, -0.8, 1.3);
      const h = s.hero.userData; place(s.hero, -0.3, 0.5, 0.2);
      hold(s, 'phone', 'R', V(-0.12, 1.08, 0.95), -0.5); h.reach('L', V(-0.42, 1.0, 0.95)); h.hand('L', 'pa');
      h.head.rotation.x = 0.25; h.face({ lid: 0.35, brow: 0.1, look: [0.1, -0.7], mouth: 'smile' });
    } },
  // 3) 83 hours a month
  { sc: 'st', say: ['month'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: [], hud: ['1か月', '83時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.8], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.0, 'text_pa', -10], [2.2, 'sparkle', -14]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '1か月で [83時間]', y: 480, size: 72, border: YEL, sub: '165分×30日（試算）' }] : []; },
    tags(lt) { const t0 = 0.4; return lt > t0 ? [{ t: t0, text: 'ふつう スマホ', x: 300, y: 1160, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた 自由!', x: 770, y: 1160, h: 100, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.45, 0); h.body.position.y = Math.abs(Math.sin(lt * 6)) * 0.08;
      h.arm('L', 0.3, 2.7, 0.2); h.arm('R', 0.3, 2.7, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0.4, look: [0, 0.3], mouth: 'smile' } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 4) 20 books
  { sc: 'st', say: ['book'], pre: 0.15, pal: ['#2f3d7a', '#d9def5', '#ffd23a'], show: ['books'], hud: ['読書', '20冊'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.3, 0] },
    sfx: [[0.2, 'whoosh_switch2', -12], [1.0, 'text_pa', -10], [1.9, 'comic_pico', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '1か月で [20冊]', y: 480, size: 76, border: CY, sub: '1冊4時間で読む前提（試算）' }] : []; },
    act(lt, s) {
      const b = s.P.books; place(b, 0.55, 0.0); const n = Math.round(2 + 18 * ease(k(lt, 0.3, 2.0))); b.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.35, 0.3);
      h.reach('R', V(0.3, 0.1 + n * 0.046, 0.15)); h.hand('R', 'pa'); h.arm('L', 0.3, lt > 1.0 ? 2.6 : 0.4, 0.3); h.hand('L', lt > 1.0 ? 'pa' : 'gu');
      h.face(lt < 1.0 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 5) walk 13 km a day -> Osaka
  { sc: 'st', say: ['walk'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['sign'], hud: ['歩くと', '1か月396km'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 6.2], p1: [0.0, 1.6, 5.8], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_slide', -12], [0.9, 'text_pa', -10], [2.8, 'text_pa', -10], [3.6, 'sparkle', -14]],
    cards(lt) { return lt < 2.5 ? (lt > 0.8 ? [{ t: 0.8, text: '1日 [13km]', y: 480, size: 76, border: YEL, sub: '時速4.8km×2.75時間（試算）' }] : [])
      : [{ t: 2.5, text: '1か月 [396km]', y: 480, size: 72, border: YEL, sub: '東京〜大阪の直線距離 約400km' }]; },
    act(lt, s) {
      place(s.P.sign, 0.75, -0.5, -0.2);
      const h = s.hero.userData; const w = Math.sin(lt * 8); place(s.hero, -0.45, 0.5, 0.5);
      h.arm('L', 0.7 * w, 0.3, 0.5); h.arm('R', -0.7 * w, 0.3, 0.5); h.hand('L', 'gu'); h.hand('R', 'gu');
      h.body.position.y = Math.abs(w) * 0.05;
      h.face(lt < 2.5 ? { lid: 0.1, brow: 0.5, look: [0.4, 0], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0.5, 0.3], mouth: 'o', open: 1 });
    } },
  // 6) neck: free from 27 kg
  { sc: 'st', say: ['neck'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['weight'], hud: ['首の負担', '27kg'], hudColor: YEL,
    cam: { p0: [0.0, 1.6, 5.8], p1: [0.0, 1.6, 5.4], l0: [0.0, 1.75, 0] },
    sfx: [[0.3, 'impact_don', -12], [1.0, 'text_pa', -10], [2.1, 'whoosh_swing', -12], [2.4, 'comic_pico', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '首に [27kg]', y: 480, size: 76, border: CY, sub: '60度うつむいたときの負担' }] : []; },
    note: 'Hansraj 2014（Surgical Technology Intl.）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.2, 0.45, 0.1); const off = lt > 2.0; const u = ease(k(lt, 2.0, 2.6));
      const wt = s.P.weight; wt.visible = true; wt.scale.setScalar(0.55);
      if (!off) { wt.position.set(-0.2, 1.95, 0.45); h.head.rotation.x = 0.45; h.reach('L', V(-0.42, 2.0, 0.55)); h.reach('R', V(0.02, 2.0, 0.55)); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0.3, brow: -0.8, browY: 1, look: [0, -0.5], mouth: 'o', open: 0.6 }); }
      else { wt.position.set(-0.2 + 1.2 * u, 1.95 - 1.95 * u * u, 0.45); wt.rotation.z = -u * 2; h.arm('L', 0.3, 2.6, 0.2); h.arm('R', 0.3, 2.6, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0.5, brow: 0.6, look: [0, 0.3], mouth: 'smile' }); }
    } },
  // 7) 42 days a year
  { sc: 'st', say: ['year'], pre: 0.15, pal: ['#ff7a6b', '#ffece8', '#ffd23a'], show: ['cal'], hud: ['1年で', '42日分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.1, 1.35, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.0, 'text_pa', -10], [2.3, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '1年で [42日分]', y: 480, size: 76, border: RED, sub: '165分×365日（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.cal; c.visible = true; c.position.set(0.55, 1.55, -0.4); c.rotation.z = Math.sin(lt * 3) * 0.04;
      const h = s.hero.userData; place(s.hero, -0.55, 0.45, 0.3);
      h.reach('R', V(0.05, 1.5, -0.2)); h.hand('R', 'pa'); h.arm('L', 0.5, 0.6, 1.4); h.hand('L', 'pa');
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.3], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0.2, 0], mouth: 'o', open: 1.1 });
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) 12 tools vanish
  { sc: 'st', say: ['tools'], pre: 0.15, pal: ['#3a3f6b', '#cfd3ea', '#ffd23a'], dim: 0.9, show: ['tiles'], hud: ['消える道具', '12個'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 5.4], p1: [0.0, 1.55, 5.1], l0: [0.0, 1.45, 0] },
    sfx: [[0.3, 'sparkle', -14], [1.1, 'text_pa', -10], [2.2, 'vanish_hyun', -11], [2.9, 'comic_fall', -12]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '[12個] の道具', y: 480, size: 76, border: RED, sub: '電話・地図・財布・時計…' }] : []; },
    act(lt, s) {
      const it = s.P.tiles.userData.items; const gone = k(lt, 2.2, 2.9);
      it.forEach((o, i) => { const a = i / 12 * Math.PI * 2; const r = 0.95 * ease(k(lt, 0.1 + i * 0.05, 0.6 + i * 0.05)); o.visible = true;
        o.position.set(Math.cos(a) * r, 1.35 + Math.sin(a) * r * 0.85 - 3 * gone * gone * (1 + i % 3 * 0.3), 0.3); o.rotation.set(0, 0, gone * (i % 2 ? 3 : -3)); o.scale.setScalar(0.85); });
      const h = s.hero.userData; place(s.hero, 0, 0, 0);
      h.arm('L', 0.4, 1.0, 1.0); h.arm('R', 0.4, 1.0, 1.0); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 2.2 ? { lid: 0.2, brow: 0.4, look: [0.3, 0.4], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0, -0.5], mouth: 'o', open: 1 });
    } },
  // 10) phone payments stop: 1.4 trillion yen a month
  { sc: 'st', say: ['pay'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: ['counter', 'reader'], hud: ['スマホ払い', '月1.4兆円'], hudColor: RED,
    cam: { p0: [0.2, 1.6, 5.5], p1: [0.2, 1.55, 5.2], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'phone_vibe', -14], [1.0, 'shock', -13], [1.6, 'text_pa', -10], [2.6, 'comic_stupid', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '1か月 [1.4兆円]', y: 480, size: 72, border: RED, sub: 'コード決済 年16.6兆円÷12（試算）' }] : []; },
    note: '経済産業省 2025年キャッシュレス決済額',
    act(lt, s) {
      place(s.P.counter, 0.3, -0.55); place(s.P.reader, 0.55, -0.4, 0); s.P.reader.position.y = 0.93;
      const x = s.P.xmark; x.visible = lt > 1.0; x.position.set(0.55, 1.35, -0.2); x.scale.setScalar(0.5 + 0.5 * ease(k(lt, 1.0, 1.3)));
      const h = s.hero.userData; place(s.hero, -0.35, 0.45, 0.35);
      hold(s, 'phone', 'R', V(0.12, 1.15, 0.2), -0.3, 0.4); h.arm('L', 0.3, 0.3, 1.6);
      h.face(lt < 1.0 ? { lid: 0.2, brow: 0.3, look: [0.6, 0], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0.2], mouth: 'o', open: 0.9 });
    } },
  // 11) string phone (the cold open, in its place)
  { sc: 'st', say: ['call'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['連絡', '糸電話'], hudColor: RED,
    cam: { p0: [0.6, 1.7, 7.0], p1: [0.5, 1.6, 6.4], l0: [0.6, 1.4, -0.8] },
    sfx: [[0.2, 'whoosh_gust', -12], [0.4, 'impact_doon', -11], [1.2, 'text_pa', -10], [2.3, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '連絡は [糸電話]', y: 480, size: 72, border: CY, sub: 'LINEも電話も使えない' }] : []; },
    act(lt, s) {
      const on = coldScene(s, lt, 0.25); const h = s.hero.userData; if (!on) return;
      h.face(lt < 1.6 ? { lid: 0, brow: 0.9, browY: 1, look: [0.5, 0.3], mouth: 'o', open: 1 } : { lid: 0.45, brow: 0.1, look: [0.4, 0.1], mouth: 'flat' });
    } },
  // 12) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], show: ['bed'], hud: ['スマホなしの', '夜と朝'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.05, 1.45, 4.4], l0: [0.05, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.3, 'text_pa', -10], [3.6, 'comic_surprise', -12], [4.4, 'comic_jajean', -13]],
    cards(lt) { return lt < 2.2 ? (lt > 0.25 ? [{ t: 0.25, text: '夜は [ぐっすり]', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.2, text: '目覚まし [なし]', y: 480, size: 70, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.6, text: 'ねぼう!!', x: 800, y: 1150, rot: 6, color: RED, size: 74, dur: 1.4 }],
    note: '厚労省 睡眠ガイド2023：寝床でスマホを控える',
    act(lt, s) {
      tucked(s); const h = s.hero.userData;
      if (lt < 2.2) { h.face({ lid: 0.85, brow: 0.3, look: [0, 0], mouth: 'smile' }); wallClock(s, 11, 0, 0.95, 2.05, -0.9, 1.2); }
      else { wallClock(s, 9, 30 * ease(k(lt, 2.3, 3.5)), 0.95, 2.05, -0.9, 1.2);
        if (lt < 3.5) h.face({ lid: 0.8, brow: 0.3, look: [0, 0], mouth: 'smile' });
        else { h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, 0.5], mouth: 'o', open: 1.1 }); h.head.rotation.z = -0.1; } }
    } },
  // 13) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '余裕でいける', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '1日もムリ', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'cupA', 'R', V(0.25, 1.15, 0.55), 0, 0, 0); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもスマホが', '[1か月]使えなくなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['スマホなし', '1か月'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
