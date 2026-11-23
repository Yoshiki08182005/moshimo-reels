// ep55_denki_yoru_tada (pop / arm B 生活ルール改変): もしも夜の電気代が全部タダになったら？
// 型は sp_geppu2x / ep53。台本・数字・小道具は自作。
// 前提（試算）:
//   夜 = 22時〜翌8時（10時間）の電気代が0円。電気の目安単価 31円/kWh（全国家庭電気製品公正取引協議会 2022年）
//   2人世帯の電気代 月12,144円（総務省 家計調査 2025年 世帯人員別）→ 年145,728円
//   暖房: エアコン平均0.6kWと仮定 ×10時間×90日（12〜2月）×31円 = 16,740円
//   電気自動車: 電池40kWh・電費6km/kWh → 毎晩240km ×365 = 87,600km ÷ 地球一周40,075km = 2.19 → 地球2周（1晩1,240円分）
//   夜の使用を4割と仮定: 145,728×0.4 = 58,291円 ≒ 約5.8万円
//   全国: 5,583万世帯（総務省 国勢調査2020）×5.8万円 = 3.25兆円 ≒ 約3兆円（全世帯を2人世帯並みと仮定、多めの見積もり）
//   落とし穴: 全世帯が22時に1kWずつ追加 → 5,583万kW = 100万kWの発電所 約56基分
//            夜の住宅地の騒音の環境基準 45dB以下（環境省）
//            電力会社の収入が同じなら、昼で全部払う → 1÷0.6 = 1.67 ≒ 1.7倍（31円→52円）
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep55_denki_yoru_tada.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#3a56c8', '#e3e9ff', '#ffd23a'];
const basicM = (c) => new THREE.MeshBasicMaterial({ color: c });

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // night cap
  { const c = G(); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 24), M('#5a7bff')); cone.position.y = 0.26; cone.rotation.z = -0.35; cone.castShadow = true; c.add(cone);
    cyl(0.34, 0.34, 0.09, '#ffffff', 0, 0.02, 0, c); sph(0.08, '#ffffff', 0.2, 0.48, 0, c); reg('cap', c); }
  // blanket
  { const b = G(); rbox(0.95, 0.3, 0.55, 0.12, '#ff9db8', 0, 0, 0, b); for (const x of [-0.25, 0.05, 0.3]) sph(0.05, '#ffffff', x, 0.13, 0.25, b, 1, 0.6, 0.5); reg('blanket', b); }
  // many hanging light bulbs (all lit)
  { const g = G(); g.userData.items = [];
    const pos = [[-1.9, 2.5, -1.1], [-1.3, 2.9, -0.7], [-0.7, 2.6, -1.3], [0.0, 3.1, -1.2], [0.7, 2.6, -1.3], [1.3, 2.9, -0.7], [1.9, 2.5, -1.1], [-1.6, 3.3, -1.5], [1.6, 3.3, -1.5], [-0.4, 3.4, -0.6], [0.4, 3.4, -0.6]];
    for (const [x, y, z] of pos) { const l = G(); cyl(0.01, 0.01, 2.0, '#3a3a3a', 0, 1.0, 0, l); cyl(0.05, 0.05, 0.08, '#9aa3ad', 0, 0.02, 0, l); sph(0.12, basicM('#fff3a8'), 0, -0.1, 0, l, 1, 1.15, 1);
      l.position.set(x, y, z); g.add(l); g.userData.items.push(l); }
    reg('bulbs', g); }
  // washing machine (drum spins)
  { const w = G(); rbox(0.7, 0.85, 0.62, 0.06, '#f4f6fa', 0, 0.425, 0, w); rbox(0.6, 0.12, 0.02, 0.02, '#cfd6e2', 0, 0.76, 0.31, w);
    sph(0.025, basicM('#3fd16b'), 0.22, 0.76, 0.325, w);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.035, 10, 32), M('#9aa3ad', 0.3)); ring.position.set(0, 0.4, 0.315); w.add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.21, 32), M('#5f87c9', 0.2)); glass.position.set(0, 0.4, 0.312); w.add(glass);
    const drum = G(); drum.position.set(0, 0.4, 0.318); w.add(drum);
    for (const [x, y, c] of [[0.1, 0.05, '#ff7a6b'], [-0.08, 0.09, '#ffd23a'], [0.02, -0.11, '#7bd88f'], [-0.11, -0.04, '#ffffff']]) sph(0.055, c, x, y, 0, drum, 1, 0.7, 0.3);
    w.userData.drum = drum; reg('washer', w); }
  // wall air conditioner
  { const a = G(); rbox(1.0, 0.3, 0.26, 0.06, '#f4f6fa', 0, 0, 0, a); rbox(0.9, 0.05, 0.02, 0.01, '#c4ccd8', 0, -0.1, 0.13, a);
    sph(0.022, basicM('#3fd16b'), 0.4, 0.05, 0.135, a); a.position.set(0, 2.6, -1.6); reg('acon', a); }
  // electricity bill (big paper)
  { const b = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.82), new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, map: canvasTex(310, 410, (c) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, 310, 410); c.fillStyle = '#3a56c8'; c.fillRect(0, 0, 310, 70); c.fillStyle = '#ffffff'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('電気料金', 155, 48);
      c.fillStyle = '#2c3b6b'; c.font = 'bold 30px sans-serif'; c.fillText('今月のご請求', 155, 140); c.fillStyle = '#e2463c'; c.font = 'bold 56px sans-serif'; c.fillText('12,144円', 155, 230);
      c.fillStyle = '#9aa3ad'; for (let i = 0; i < 4; i++) c.fillRect(40, 280 + i * 30, 230 - i * 30, 10); }) }));
    b.add(m); reg('invoice', b); }
  // earth + orbit ring
  { const e = G(); sph(0.55, '#3f8fe0', 0, 0, 0, e); for (const [x, y, z, s] of [[0.25, 0.2, 0.42, 0.22], [-0.3, -0.1, 0.4, 0.2], [0.05, -0.32, 0.38, 0.16], [-0.1, 0.38, 0.3, 0.14]]) sph(s, '#6fd17b', x, y, z, e, 1, 0.8, 0.5);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 8, 64), basicM(YEL)); ring.rotation.x = 1.25; e.add(ring);
    const dot = G(); e.add(dot); rbox(0.16, 0.08, 0.1, 0.03, '#35d0ff', 0.85, 0, 0, dot); e.userData.dot = dot; reg('globe', e); }
  // power meter with digits
  { const m = G(); rbox(0.5, 0.62, 0.18, 0.05, '#e6ebf3', 0, 0, 0, m);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.24), new THREE.MeshBasicMaterial({ map: canvasTex(240, 144, (c) => { c.fillStyle = '#1b2140'; c.fillRect(0, 0, 240, 144); c.fillStyle = '#3fd16b'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.fillText('0円', 120, 96); }) }));
    face.position.set(0, 0.08, 0.095); m.add(face); const disk = cyl(0.12, 0.12, 0.02, '#9aa3ad', 0, -0.17, 0.09, m); disk.rotation.x = Math.PI / 2; m.userData.disk = disk; reg('meter', m); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const capOn = (s) => { const c = s.P.cap; c.visible = true; s.hero.userData.head.add(c); c.position.set(0, 0.3, -0.02); c.rotation.set(-0.2, 0, 0.1); c.scale.setScalar(1); };
function wallClock(s, h, m, x = 0.95, y = 2.05, z = -1.0, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
function tucked(s, x = 0.12) { const b = s.P.bed; b.visible = true; b.position.set(0, 0, 0.1); b.rotation.set(0, 0, 0); b.scale.setScalar(1.25);
  place(s.hero, x, 0.15, 0); capOn(s); const bl = s.P.blanket; bl.visible = true; bl.position.set(x, 0.62, 0.42); bl.rotation.set(0.15, 0, 0);
  const h = s.hero.userData; h.reach('L', V(x - 0.32, 0.8, 0.6)); h.reach('R', V(x + 0.32, 0.8, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu'); }
// "everything on" room: bulbs drop at t0, washer spins, aircon + heat waves, microwave glows
function allOn(s, lt, t0) {
  const on = lt > t0; const u = k(lt, t0 - 0.2, t0);
  const b = s.P.bulbs; b.visible = lt > t0 - 0.2; b.position.y = 4 * (1 - u * u);
  b.userData.items.forEach((l, i) => { l.rotation.z = on ? Math.sin((lt - t0) * 6 + i) * 0.12 * Math.exp(-(lt - t0) * 1.5) : 0; });
  place(s.P.washer, 1.25, -0.2, -0.35); const w = s.P.washer; if (on) { w.userData.drum.rotation.z = -(lt - t0) * 14; w.position.x += Math.sin(lt * 45) * 0.012; }
  const a = s.P.acon; a.visible = true;
  const ht = s.P.heat; ht.visible = on; ht.position.set(0, 2.42, -1.45); ht.rotation.set(Math.PI, 0, 0); ht.scale.setScalar(1.0); ht.userData.items.forEach((m, i) => { m.position.y = -((lt * 0.4 + i * 0.3) % 0.4); });
  place(s.P.desk, -1.3, -0.4, 0.35); const mw = s.P.mw; mw.visible = true; mw.position.set(-1.3, 0.77, -0.4); mw.rotation.set(0, 0.35, 0); mw.userData.glow.visible = on;
  return on;
}

const plan = [
  // 0) cold open (flash-forward of #7): 22:00 -> a dozen bulbs crash down lit, washer spins, aircon roars; hero puts on sunglasses -> push in, smug
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.8, 7.4], p1: [0.05, 1.5, 3.6], l0: [0.0, 1.6, -0.4], l1: [0.05, 1.4, 0.0], hold: 1.2, dur: 2.3 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.24, 0.9]],
    sfx: [[0.0, 'countdown_tick', -12], [0.12, 'whoosh_gust', -12], [0.25, 'impact_doon', -9], [0.27, 'text_impact', -11], [0.5, 'zap_small', -14], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.28, text: '電気代 0円!!', x: 540, y: 400, rot: -6, color: YEL, size: 96, dur: 1.15 },
      { t: 2.3, text: 'まぶしっ', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 64, dur: 0.7 }],
    act(lt, s) {
      wallClock(s, 10, lt < 0.15 ? 59 : 0, 0.0, 2.95, -1.7, 1.0);
      if (lt < 0.15) s.P.clock.userData.hh.rotation.z = -(9 + 59 / 60) / 12 * Math.PI * 2;
      const on = allOn(s, lt, 0.25); const h = s.hero.userData; place(s.hero, 0.0, 0.5, 0);
      if (!on) { h.arm('L', 0.3, 0.4, 1.6); h.arm('R', 0.3, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.2, look: [0, 0.6], mouth: 'flat' }); }
      else if (lt < 1.3) { h.arm('L', 0.3, 2.6, 0.3); h.arm('R', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.4], mouth: 'o', open: 1.1 }); }
      else { h.shades(true); h.reach('R', V(0.3, 1.55, 0.45)); h.hand('R', 'choki'); h.arm('L', 0.3, 0.4, 1.5);
        h.face({ lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['lamp'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.8, 'comic_surprise', -12]],
    stamps: [{ t: 1.9, text: '全部?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      const l = s.P.lamp; l.position.set(-0.75, 2.6, 0.0);
      const h = s.hero.userData; place(s.hero, 0.1, 0.4, -0.05);
      h.reach('L', V(-0.55, 1.95, 0.25)); h.hand('L', 'pa'); h.arm('R', 0.4, 0.6, 1.5); h.hand('R', 'choki');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.4, look: [-0.4, 0.4], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) rule: 22:00-8:00 free
  { sc: 'st', say: ['rule'], pre: 0.15, pal: ['#2f3d7a', '#d9def5', '#ffd23a'], show: ['meter'], hud: ['夜の電気代', '0円'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 5.2], p1: [0.1, 1.48, 4.9], l0: [0.1, 1.35, 0] },
    sfx: [[0.2, 'countdown_tick', -13], [1.6, 'text_pa', -10], [2.3, 'sparkle', -14]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '夜の電気代 [0円]', y: 480, size: 72, border: YEL, sub: '22時〜朝8時の10時間（仮定）' }] : []; },
    act(lt, s) {
      const m = 60 * ease(k(lt, 0.2, 1.3)); wallClock(s, 9, m, -0.8, 2.0, -0.8, 1.3);
      const me = s.P.meter; me.position.set(0.7, 1.45, -0.3); me.userData.disk.rotation.y = lt * 8;
      const h = s.hero.userData; place(s.hero, -0.1, 0.5, 0.25);
      h.reach('R', V(0.45, 1.4, -0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.2, look: [-0.6, 0.4], mouth: 'flat' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 3) bill: 12,144 yen / month
  { sc: 'st', say: ['bill'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['電気代', '月12,144円'],
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_switch1', -12], [1.4, 'text_pa', -10], [2.4, 'coin_toss', -14]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '月 [12,144円]', y: 480, size: 76, border: CY, sub: '2人世帯の平均' }] : []; },
    note: '総務省 家計調査 2025年（2人世帯）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.15, 0.5, 0.1);
      hold(s, 'invoice', 'R', V(0.55, 1.5 + 0.05 * Math.sin(lt * 3), 0.55), -0.08, -0.25); h.reach('R', V(0.6, 1.12, 0.55)); h.arm('L', 0.3, 0.5, 1.6); h.hand('L', 'pa');
      h.face(lt < 1.3 ? { lid: 0.2, brow: 0.2, look: [0.5, 0], mouth: 'flat' } : { lid: 0.1, brow: -0.5, browY: 1, look: [0.5, 0], mouth: 'o', open: 0.6 });
    } },
  // 4) heater all night: 16,740 yen per winter
  { sc: 'st', say: ['heater'], pre: 0.15, pal: ['#ff8f5a', '#fff0e6', '#3f6fd8'], show: ['acon', 'heat'], hud: ['暖房', 'つけっぱなし'], hudColor: YEL,
    cam: { p0: [0.0, 1.6, 5.2], p1: [0.0, 1.55, 4.8], l0: [0.0, 1.45, 0] },
    sfx: [[0.2, 'whoosh_gust', -14], [1.3, 'text_pa', -10], [2.6, 'sparkle', -14]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: 'ひと冬 [16,740円]', y: 480, size: 70, border: YEL, sub: '0.6kW×10時間×90日×31円（試算）' }] : []; },
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう がまん', x: 300, y: 1150, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた ぬくぬく', x: 770, y: 1150, h: 100, bg: CY }] : []; },
    note: '電気の目安単価31円/kWh 家電公取協 2022年',
    act(lt, s) {
      const ht = s.P.heat; ht.position.set(0, 2.42, -1.45); ht.rotation.set(Math.PI, 0, 0); ht.scale.setScalar(1.0); ht.userData.items.forEach((m, i) => { m.position.y = -((lt * 0.4 + i * 0.3) % 0.4); });
      const h = s.hero.userData; place(s.hero, 0, 0.4, 0);
      h.arm('L', 0.3, 2.4, 0.5); h.arm('R', 0.3, 2.4, 0.5); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.body.rotation.z = Math.sin(lt * 3) * 0.06;
      h.face(lt < 1.4 ? { lid: 0.7, brow: 0.6, look: [0, 0.5], mouth: 'smile' } : { lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 5) EV full every night: earth x2 a year
  { sc: 'st', say: ['ev'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#3f6fd8'], show: ['car', 'globe'], hud: ['電気自動車', '毎晩満タン'], hudColor: YEL,
    cam: { p0: [0.0, 1.6, 5.6], p1: [0.0, 1.55, 5.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_slide', -12], [1.6, 'text_pa', -10], [2.8, 'sparkle', -14]],
    cards(lt) { return lt > 1.6 ? [{ t: 1.6, text: '1年で [地球2周]', y: 480, size: 76, border: CY, sub: '毎晩240km×365日（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.car; place(c, -0.7, 0.3, 0.5);
      const g = s.P.globe; g.position.set(0.9, 1.75, -0.8); g.rotation.set(0, lt * 0.6, 0); g.userData.dot.rotation.y = -lt * 3.5;
      const h = s.hero.userData; place(s.hero, 0.3, 0.6, -0.3);
      h.reach('R', V(0.75, 1.55, -0.2)); h.hand('R', 'pa'); h.reach('L', V(-0.25, 0.75, 0.55)); h.hand('L', 'pa');
      h.face(lt < 1.6 ? { lid: 0.1, brow: 0.4, look: [-0.5, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0.5, 0.4], mouth: 'o', open: 1.1 });
    } },
  // 6) one year: about 58,000 yen
  { sc: 'st', say: ['year'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['books'], hud: ['1年で', '約5.8万円'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'coin_toss', -13], [1.6, 'text_pa', -10], [2.6, 'sparkle', -14]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '1年 [約5.8万円]', y: 480, size: 74, border: YEL, sub: '月12,144円×12×4割（試算）' }] : []; },
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 0円', x: 300, y: 1150, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた +5.8万円', x: 770, y: 1150, h: 100, bg: YEL }] : []; },
    act(lt, s) {
      const b = s.P.books; place(b, 0.55, 0.0); const n = Math.round(4 + 26 * ease(k(lt, 0.4, 2.6))); b.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.35, 0.3);
      h.reach('R', V(0.3, 0.1 + n * 0.046, 0.15)); h.hand('R', 'pa'); h.arm('L', 0.3, lt > 1.5 ? 2.6 : 0.4, 0.3); h.hand('L', lt > 1.5 ? 'pa' : 'gu');
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 7) Japan: about 3 trillion yen (the cold open, in its place)
  { sc: 'st', say: ['japan'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['全国', '約3兆円'], hudColor: YEL,
    cam: { p0: [0.0, 1.8, 7.0], p1: [0.0, 1.6, 6.2], l0: [0.0, 1.5, -0.3] },
    shake: [[0.5, 0.07, 0.5]], lines: [[0.5, 0.7]],
    sfx: [[0.3, 'whoosh_gust', -12], [0.5, 'impact_doon', -10], [1.5, 'text_pa', -10], [2.6, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '全国 [約3兆円]', y: 480, size: 76, border: YEL, sub: '5.8万円×5,583万世帯（試算）' }] : []; },
    note: '世帯数 総務省 国勢調査2020',
    act(lt, s) {
      wallClock(s, 10, 0, 0.0, 2.95, -1.7, 1.0);
      const on = allOn(s, lt, 0.5); const h = s.hero.userData; place(s.hero, 0.0, 0.5, 0);
      if (!on) { h.arm('L', 0.3, 0.4, 1.6); h.arm('R', 0.3, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.2, look: [0, 0.6], mouth: 'flat' }); }
      else { h.shades(true); h.arm('L', 0.3, 2.6, 0.3); h.arm('R', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0.2, brow: 0.7, look: [0, 0], mouth: 'smile' }); }
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) 22:00 everyone switches on: 56 power plants
  { sc: 'st', say: ['peak'], pre: 0.15, pal: ['#3a3f6b', '#cfd3ea', '#ffd23a'], dim: 0.9, show: ['towers', 'bolts'], hud: ['夜10時', '一斉スイッチ'], hudColor: RED,
    cam: { p0: [0.0, 1.7, 5.8], p1: [0.0, 1.6, 5.3], l0: [0.0, 1.25, -0.3] },
    sfx: [[0.3, 'countdown_tick', -13], [1.0, 'zap_small', -14], [2.2, 'text_pa', -10], [3.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 2.1 ? [{ t: 2.1, text: '発電所 [56基分]', y: 480, size: 74, border: RED, sub: '5,583万世帯×1kW（試算）' }] : []; },
    note: '100万kWの発電所で換算',
    act(lt, s) {
      const w = s.P.towers; const n = Math.round(2 + 10 * ease(k(lt, 0.6, 2.4))); w.userData.items.forEach((it, i) => { it.visible = i < n; });
      const b = s.P.bolts; b.position.set(0, 2.4, -1.0); b.userData.items.forEach((m, i) => { m.position.set((i - 1.5) * 0.7, Math.sin(lt * 6 + i) * 0.05, 0); m.scale.setScalar(1.6); m.visible = lt > 0.9; });
      const h = s.hero.userData; place(s.hero, 0, 0.7, 0);
      h.arm('L', 0.3, 0.3, 2.0); h.arm('R', 0.3, 0.3, 2.0); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 2.1 ? { lid: 0.1, brow: 0, look: [0, 0.5], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 10) washing machine at midnight: awkward with neighbours
  { sc: 'st', say: ['noise'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: ['washer'], hero2: true, hud: ['夜中の', '洗濯機'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.4], p1: [0.0, 1.55, 6.0], l0: [0.0, 1.3, 0] },
    sfx: [[0.2, 'quake', -16], [1.3, 'text_pa', -10], [2.1, 'comic_tsukkomi', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: 'お隣さんと [気まずい]', y: 480, size: 64, border: RED, sub: '夜の住宅地は45dB以下が基準' }] : []; },
    stamps: [{ t: 0.3, text: 'ゴウン ゴウン', x: 540, y: 1130, rot: -5, color: '#ffffff', size: 60, dur: 2.2 }],
    note: '環境省 騒音に係る環境基準（夜間）',
    act(lt, s) {
      const w = s.P.washer; place(w, 0.0, -0.1, 0); w.userData.drum.rotation.z = -lt * 14; w.position.x = Math.sin(lt * 45) * 0.015; w.rotation.z = Math.sin(lt * 30) * 0.02;
      const h = s.hero.userData; place(s.hero, -0.75, 0.45, 0.35); capOn(s);
      h.arm('L', 0.3, 0.3, 1.8); h.arm('R', 0.3, 0.3, 1.8);
      h.face(lt < 1.2 ? { lid: 0.3, brow: 0, look: [0.6, -0.2], mouth: 'flat' } : { lid: 0.2, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 0.5 });
      const h2 = s.hero2.userData; place(s.hero2, 0.75, 0.3, -0.35);
      h2.arm('L', 0.4, 0.5, 1.3); h2.hand('L', 'gu'); h2.arm('R', 0.3, 2.2, 0.9); h2.hand('R', 'gu');
      h2.face({ lid: 0.6, brow: 1, look: [-0.6, 0], mouth: 'flat' });
    } },
  // 11) daytime price x1.7
  { sc: 'st', say: ['day'], pre: 0.15, pal: ['#ffd23a', '#fff8dc', '#e2463c'], show: ['sun'], hud: ['昼の電気代', '×1.7'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.0], l0: [0.0, 1.4, 0] },
    sfx: [[0.3, 'whoosh_switch2', -12], [1.4, 'text_pa', -10], [2.4, 'comic_fall', -12]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '昼の電気代 [1.7倍]', y: 480, size: 68, border: RED, sub: '夜の4割分を昼で払うと（試算）' }] : []; },
    tags(lt) { const t0 = 0.5; return lt > t0 ? [{ t: t0, text: 'ふつう 31円', x: 300, y: 1150, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた 52円', x: 770, y: 1150, h: 100, bg: RED, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const sn = s.P.sun; sn.visible = true; sn.position.set(0.95, 2.6, -1.2); sn.rotation.z = lt * 0.5; sn.scale.setScalar(0.9);
      const h = s.hero.userData; place(s.hero, -0.15, 0.5, 0.1);
      hold(s, 'invoice', 'R', V(0.55, 1.45, 0.55), -0.08, -0.25); h.reach('R', V(0.6, 1.07, 0.55)); h.arm('L', 0.4, 0.6, 1.3); h.hand('L', 'pa');
      h.body.rotation.x = 0.1 * ease(k(lt, 1.6, 2.4));
      h.face(lt < 1.3 ? { lid: 0.2, brow: 0, look: [0.5, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.4, 0], mouth: 'o', open: 1.1 });
    } },
  // 12) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], show: ['bed'], hud: ['夜の電気', 'タダ'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.05, 1.45, 4.4], l0: [0.05, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'countdown_tick', -11], [2.5, 'text_pa', -10], [3.8, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.25 ? [{ t: 0.25, text: '夜ふかし [タダ]', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.3, text: '朝は [いつも通り]', y: 480, size: 66, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 2.5, text: 'ジリリリ…', x: 820, y: 1120, rot: 6, color: '#ffffff', size: 58, dur: 1.6 }],
    act(lt, s) {
      tucked(s); const h = s.hero.userData;
      if (lt < 2.3) { s.P.clock.visible = false; const p = s.P.phone; p.visible = true; p.position.set(0.12, 1.25, 0.75); p.rotation.set(-0.2, 0, 0); p.userData.fill.scale.y = 1; h.reach('R', V(0.2, 1.15, 0.72)); h.reach('L', V(0.04, 1.15, 0.72));
        h.face({ lid: 0.1, brow: 0.6, look: [0, -0.3], mouth: 'smile' }); }
      else { wallClock(s, 7, 0, 0.95, 1.85, -0.6, 1.3); s.P.clock.rotation.z = Math.sin(lt * 40) * 0.08;
        h.head.rotation.z = Math.sin(lt * 2.2) * 0.15; h.face({ lid: 0.75, brow: -0.8, look: [0.3, 0], mouth: 'o', open: 0.5 }); }
    } },
  // 13) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'タダがいい', x: 320, y: 1130, h: 108, bg: CY }, { t: t0 + 0.2, text: '今のままでいい', x: 760, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05); h.shades(true);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki'); h.arm('R', 0.4, 0.5, 1.5); h.hand('R', 'pa');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも夜の電気代が', '全部[タダ]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['夜の電気代', '0円'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
