// ep39_genkin_zero (pop / arm B 生活ルール改変): もしも現金が明日から全部なくなったら？
// 型は sp_geppu2x / ep38。台本・数字・小道具は自作。
// 前提（試算）:
//   キャッシュレス決済比率 2025年 58.0%（国内指標。経済産業省 2026年3月発表、報道）
//   日本銀行券の発行残高 116兆3,156億円（日本銀行 2026年3月末＝令和7年度末）
//   全部1万円札とみなすと 116.3億枚 × 厚さ約0.1mm = 1,163km ≒ 1,160km、ISS 高度約400kmの約2.9倍 ≒ 3倍
//   財布の小銭: 1円(1g)・10円(4.5g)・100円(4.8g)を5枚ずつ = 51.5g ≒ 50g（造幣局の規格）
//   会計: 1人1日3回 × 10秒短縮 × 1億2,321万人（総務省 2025年10月概算）= 36.96億秒/日 = 117.2年分/日。1人では 3×10×365 = 3.0時間/年
//   割り勘: 1,000 ÷ 3 = 333.33… → 333円×3 = 999円、1円あまる
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep39_genkin_zero.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#7bd88f', '#effbf1', '#ffd23a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
const FL = (() => { const r = rng(7), a = []; for (let i = 0; i < 26; i++) a.push([(r() - 0.5) * 2.6, r() * 3.5, (r() - 0.5) * 1.2 - 0.3, r() * 6, r()]); return a; })();
const PUFF = (() => { const r = rng(3), a = []; for (let i = 0; i < 14; i++) a.push([(r() - 0.5) * 0.7, 0.3 + i * 0.42, (r() - 0.5) * 0.4, 0.35 + r() * 0.25]); return a; })();

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // tall column of 10,000-yen notes (goes out of frame)
  { const t = G(); const tex = canvasTex(64, 256, (c) => { for (let i = 0; i < 32; i++) { c.fillStyle = i % 2 ? '#cfe3c4' : '#a9c99a'; c.fillRect(0, i * 8, 64, 8); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 30);
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.62, 16, 0.32), m); col.position.y = 8; col.castShadow = col.receiveShadow = true; t.add(col);
    for (const [x, z] of [[-0.5, 0.2], [0.5, 0.25], [0.1, 0.38]]) rbox(0.36, 0.16, 0.18, 0.02, '#a9c99a', x, 0.08, z, t);
    reg('tower', t); }
  // white smoke puffs (opacity per item)
  { const g = G(); g.userData.items = [];
    for (const [x, y, z, r] of PUFF) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false })); m.position.set(x, y, z); m.userData.r = r; g.add(m); g.userData.items.push(m); }
    reg('puff', g); }
  // fluttering notes
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < FL.length; i++) { const b = P.bill.clone(); b.visible = true; g.add(b); g.userData.items.push(b); } reg('flutter', g); }
  // wallet (open)
  { const w = G(); rbox(0.3, 0.2, 0.05, 0.03, '#8a5a34', 0, 0, 0, w); rbox(0.26, 0.03, 0.055, 0.01, '#6e4426', 0, 0.06, 0, w); sph(0.025, '#ffd23a', 0.12, 0, 0.03, w); reg('wallet', w); }
  // coins heap (items) for the wallet
  { const g = G(); g.userData.items = []; const r = rng(5);
    for (let i = 0; i < 15; i++) { const c = cyl(0.045, 0.045, 0.012, i % 3 === 0 ? '#d8dde3' : i % 3 === 1 ? '#c98a4a' : '#cfd3d8', 0, 0, 0, g); c.rotation.set(Math.PI / 2, 0, 0); c.userData.v = [(r() - 0.5) * 1.6, 1.2 + r() * 1.2, (r() - 0.5) * 0.6, r() * 8]; g.userData.items.push(c); }
    reg('coins', g); }
  // big "58%" phone reader + register on counter
  { const g = G(); rbox(0.38, 0.26, 0.3, 0.03, '#2c3b6b', 0, 0.13, 0, g); const sc = rbox(0.3, 0.18, 0.03, 0.02, basic('#bff3d6'), 0, 0.36, -0.08, g); sc.rotation.x = -0.4;
    const rd = rbox(0.16, 0.04, 0.12, 0.015, '#22252d', 0.32, 0.02, 0.08, g); g.userData.led = sph(0.022, basic('#3fd16b'), 0.32, 0.05, 0.12, g); reg('register', g); }
  // offering box with a QR sign
  { const b = G(); rbox(0.9, 0.55, 0.55, 0.03, '#8a5a34', 0, 0.275, 0, b); for (let i = 0; i < 6; i++) rbox(0.05, 0.03, 0.5, 0.01, '#4a2e17', -0.32 + i * 0.13, 0.565, 0, b);
    const fm = label(256, 256, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#15171c'; const r = rng(9);
      for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) if (r() > 0.5) c.fillRect(18 + x * 10.5, 18 + y * 10.5, 10.5, 10.5);
      for (const [x, y] of [[18, 18], [165, 18], [18, 165]]) { c.fillRect(x, y, 73, 73); c.fillStyle = '#ffffff'; c.fillRect(x + 10, y + 10, 53, 53); c.fillStyle = '#15171c'; c.fillRect(x + 21, y + 21, 31, 31); } });
    const q = G(); q.position.set(0, 0.95, 0.1); b.add(q); cyl(0.015, 0.015, 0.5, '#9aa3ad', 0, -0.25, 0, q); rbox(0.36, 0.36, 0.02, 0.02, '#ffffff', 0, 0.12, 0, q);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), fm); f.position.set(0, 0.12, 0.012); q.add(f); reg('saisen', b); }
  // 5-yen coin (with hole) and 1-yen coin
  { const c = G(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.03, 10, 28), M('#d9a93a', 0.35)); t.scale.z = 0.35; t.castShadow = true; c.add(t); reg('goen', c); }
  { const c = G(); const d = cyl(0.07, 0.07, 0.015, M('#e6e9ee', 0.3), 0, 0, 0, c); d.rotation.x = Math.PI / 2;
    const fm = label(128, 128, (x) => { x.fillStyle = '#e6e9ee'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#7a828c'; x.font = 'bold 76px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('1', 64, 68); });
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.066, 28), fm); f.position.z = 0.009; c.add(f); reg('ichien', c); }
}

const place = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
function puff(s, lt, t0, y0 = 0) { const g = s.P.puff, u = (lt - t0) / 0.9; if (u < 0 || u > 1) return; g.visible = true;
  g.userData.items.forEach((m) => { m.scale.setScalar(m.userData.r * (0.6 + 1.6 * ease(u))); m.material.opacity = 0.9 * (1 - u); }); g.position.set(0.55, y0, -0.1); }
function flutter(s, lt, t0, cx = 0.5) { const g = s.P.flutter; if (lt < t0) return; g.visible = true; const d = lt - t0;
  g.userData.items.forEach((b, i) => { const [x, y, z, ph, r] = FL[i]; const yy = Math.max(0.01, 1.4 + y - d * (0.9 + r * 0.6));
    b.position.set(cx + x + Math.sin(d * 2.5 + ph) * 0.25, yy, z); b.scale.setScalar(1.5); b.rotation.set(yy > 0.02 ? Math.sin(d * 4 + ph) * 0.9 : -Math.PI / 2, ph, yy > 0.02 ? Math.cos(d * 3 + ph) * 0.6 : 0); }); }
function coinsOut(s, lt, t0, from) { const g = s.P.coins; if (lt < t0) return; g.visible = true; const d = lt - t0;
  g.userData.items.forEach((c) => { const [vx, vy, vz, sp] = c.userData.v; const y = from.y + vy * d - 4.9 * d * d; c.visible = y > -0.1 && d < 1.2;
    c.position.set(from.x + vx * d, y, from.z + vz * d); c.rotation.set(Math.PI / 2 + sp * d, sp * d * 0.5, 0); c.scale.setScalar(Math.max(0, 1 - k(d, 0.7, 1.2))); }); }

const plan = [
  // 0) cold open (flash-forward of #4): leaning on a 1,160 km tower of notes -> it vanishes, he stumbles; push in, empty wallet
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.2, 1.7, 6.8], p1: [-0.3, 1.48, 2.6], l0: [0.25, 1.6, -0.3], l1: [-0.35, 1.42, 0.3], hold: 1.4, dur: 2.2 },
    shake: [[0.28, 0.07, 0.7]], lines: [[0.25, 0.9]],
    sfx: [[0.2, 'vanish_hyun', -9], [0.28, 'impact_doon', -10], [0.75, 'comic_fall', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.25, text: '116兆円 消滅!!', x: 560, y: 470, rot: -6, color: YEL, size: 100, dur: 1.15 },
      { t: 2.3, text: '…財布も からっぽ', x: 380, y: 1190, rot: -6, color: '#ffffff', size: 54, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.35, 0.3, 0.25);
      if (lt < 0.28) { place(s.P.tower, 0.55, -0.1); s.P.tower.visible = true; h.reach('R', V(0.22, 1.3, -0.05)); h.arm('L', 0.2, 0.3, 1.6); h.face({ lid: 0.5, brow: 0.5, look: [0, 0], mouth: 'smile' }); s.hero.rotation.z = -0.1; }
      else if (lt < 1.4) {
        puff(s, lt, 0.28, 0); flutter(s, lt, 0.3, 0.4);
        const u = k(lt, 0.28, 0.7), w = k(lt, 0.8, 1.3); s.hero.rotation.z = -0.1 - 0.28 * ease(u) + 0.38 * ease(w); s.hero.position.x = -0.35 + 0.12 * ease(u);
        h.arm('R', 0.6, 1.2, 0.3); h.hand('R', 'pa'); h.arm('L', 0.4, 2.2, 0.3); h.hand('L', 'pa');
        h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.7, 0.4], mouth: 'o', open: 1.2 });
      } else {
        flutter(s, lt, 0.3, 0.4);
        hold(s, 'wallet', 'R', V(-0.05, 1.22, 0.62), Math.PI, 0); h.arm('L', 0.3, 0.3, 1.8); h.hand('L', 'pa');
        h.face({ lid: 0.55, brow: -0.3, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = 0.1 * ease(k(lt, 2.0, 2.4));
      }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['coinsA'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'coin_toss', -12]],
    stamps: [{ t: 1.7, text: '明日から?!', x: 790, y: 1080, rot: 8, color: RED, size: 66, dur: 1.4 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.25, 0.3, 0.2);
      hold(s, 'wallet', 'R', V(0.18, 1.15 + Math.sin(lt * 5) * 0.03, 0.55), 0.1);
      const c = s.P.coinsA; place(c, -0.85, 0.2); c.userData.items.forEach((it, i) => { it.visible = i < 8; });
      h.reach('L', V(-0.8, 0.4, 0.2)); h.hand('L', 'pa');
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.2, look: [0.3, 0], mouth: 'smile' } : { lid: 0, brow: -0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) 58% already cashless
  { sc: 'st', say: ['now'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['counter', 'register'], hud: ['キャッシュレス', '58%'],
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.1, 1.2, 0] },
    sfx: [[0.9, 'text_touch', -11], [1.6, 'text_pa', -10]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: 'キャッシュレス [58%]', y: 480, size: 66, border: CY, sub: '2025年・国内の買い物の決済額' }] : []; },
    tags(lt) { const t0 = this.lt.now + 2.3; return lt > t0 ? [{ t: t0, text: '現金は 残り42%', x: 600, y: 1130, h: 80, bg: '#ffffff' }] : []; },
    note: '経済産業省 2026年3月発表（報道）',
    act(lt, s) {
      place(s.P.counter, 0.4, -0.6); s.P.counter.scale.set(0.6, 1, 0.8); place(s.P.register, 0.35, -0.6); s.P.register.position.y = 0.93;
      s.P.register.userData.led.scale.setScalar(lt > 0.9 && lt < 1.6 ? 0.036 : 0.022);
      const h = s.hero.userData; place(s.hero, -0.5, 0.2, 0.35);
      const tap = 0.7 + 0.25 * Math.sin(Math.PI * k(lt, 0.4, 1.3));
      hold(s, 'phone', 'R', V(0.12, lerp(1.25, 1.03, ease(k(lt, 0.4, 0.9))) , -0.38), 0, -0.4); s.P.phone.rotation.x = -1.2 * tap;
      h.arm('L', 0.3, 0.3, 1.9);
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0.1, brow: 0.5, look: [0, 0], mouth: 'o', open: 0.6 });
    } },
  // 3) 116 trillion yen of notes
  { sc: 'st', say: ['cash'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#3f6fd8'], show: [], hud: ['お札', '116兆円'],
    cam: { p0: [0.0, 1.45, 5.0], p1: [0.0, 1.43, 4.7], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'coin_toss', -13], [1.0, 'text_pa', -10]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: 'お札 [116兆円]', y: 480, size: 70, border: YEL, sub: '日本銀行券の発行残高' }] : []; },
    tags(lt) { const t0 = this.lt.cash + 1.6; return lt > t0 ? [{ t: t0, text: '1人 約94万円分', x: 600, y: 1130, h: 84, bg: CY }] : []; },
    note: '日本銀行 2026年3月末',
    act(lt, s) {
      const n = Math.round(4 + 28 * ease(k(lt, 0.1, 1.6))); const t = s.P.tower; t.visible = true; place(t, 0.55, -0.2); t.scale.set(1, 0.012 + 0.11 * ease(k(lt, 0.1, 1.6)), 1);
      const h = s.hero.userData; place(s.hero, -0.45, 0.3, 0.3);
      h.reach('R', V(0.2, 0.25 + n * 0.035, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'gu');
      h.face(lt < 1.0 ? { lid: 0.1, brow: 0, look: [0.7, 0.3], mouth: 'o', open: 0.5 } : { lid: 0, brow: 0.6, browY: 1, look: [0.5, 0.6], mouth: 'o', open: 1 });
    } },
  // 4) stack to 1,160 km -> vanishes (the cold open, in its place)
  { sc: 'st', say: ['tower'], pre: 0.15, hold: 0.6, pal: HOOK, show: ['tower'], hud: ['1万円札', '1,160km'], hudColor: YEL,
    cam: { p0: [0.2, 1.6, 6.6], p1: [0.2, 1.75, 6.9], l0: [0.25, 1.5, -0.3], l1: [0.25, 1.75, -0.3] },
    shake: [[4.45, 0.06, 0.6]],
    sfx: [[0.3, 'whoosh_gust', -13], [1.2, 'text_pa', -10], [2.2, 'text_pa', -11], [4.4, 'vanish_hyun', -9], [4.45, 'impact_doon', -11]],
    cards(lt) { return lt > 1.9 && lt < 3.3 ? [{ t: 1.9, text: '高さ [1,160km]', y: 480, size: 70, border: YEL, sub: '116億枚×厚さ0.1mm（試算）' }] : []; },
    tags(lt) { return lt > 2.6 && lt < 3.3 ? [{ t: 2.6, text: '宇宙ステーションの約3倍', x: 560, y: 1130, h: 76, bg: '#ffffff' }] : []; },
    stamps: [{ t: 4.45, text: '消えた!!', x: 640, y: 620, rot: -6, color: YEL, size: 104, dur: 1.4 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.35, 0.3, 0.25);
      if (lt < 4.45) { place(s.P.tower, 0.55, -0.1); h.reach('R', V(0.22, 1.3, -0.05)); h.arm('L', 0.3, 2.5, 0.3); h.hand('L', 'pa');
        h.face({ lid: 0.3, brow: 0.5, look: [0.6, 0.8], mouth: 'smile' }); s.hero.rotation.z = -0.1; }
      else { s.P.tower.visible = false; puff(s, lt, 4.45, 0); flutter(s, lt, 4.5, 0.4);
        const u = k(lt, 4.45, 4.9), w = k(lt, 5.0, 5.5); s.hero.rotation.z = -0.1 - 0.28 * ease(u) + 0.38 * ease(w); s.hero.position.x = -0.35 + 0.12 * ease(u);
        h.arm('R', 0.6, 1.2, 0.3); h.hand('R', 'pa'); h.arm('L', 0.4, 2.2, 0.3);
        h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.7, 0.4], mouth: 'o', open: 1.2 }); }
    } },
  // 5) wallet 50 g lighter
  { sc: 'st', say: ['wallet'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['財布', '−50g'],
    cam: { p0: [0.0, 1.45, 4.6], p1: [0.0, 1.43, 4.3], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'coin_toss', -12], [0.5, 'coin_toss', -13], [1.4, 'text_pa', -10], [1.9, 'comic_boyon', -13]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '財布 [−50g]', y: 480, size: 70, border: CY, sub: '1円・10円・100円 5枚ずつ（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.3, 0.1);
      const up = ease(k(lt, 1.6, 2.0)); const wp = V(0.35, 1.2 + up * 0.35, 0.55);
      hold(s, 'wallet', 'R', wp, lt > 0.2 && lt < 1.2 ? Math.PI * 0.8 : 0.1); coinsOut(s, lt, 0.25, wp);
      h.arm('L', 0.3, lt > 1.6 ? 2.6 : 0.3, 0.3); h.hand('L', lt > 1.6 ? 'choki' : 'pa');
      h.face(lt < 1.3 ? { lid: 0, brow: -0.3, look: [0.6, -0.2], mouth: 'o', open: 0.7 } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 6) checkout 10 s faster -> 117 years a day nationwide
  { sc: 'st', say: ['reji'], pre: 0.15, pal: ['#ff9f5a', '#fff1e2', '#3f6fd8'], show: ['counter', 'register', 'crowd'], hud: ['レジ', '−10秒'],
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.25, 0] },
    sfx: [[0.6, 'text_touch', -11], [1.0, 'whoosh_slide', -13], [2.8, 'text_pa', -10], [3.9, 'text_pa', -11]],
    cards(lt) { return lt > 2.75 ? [{ t: 2.75, text: '毎日 [117年分]', y: 480, size: 70, border: YEL, sub: '1億2,321万人×1日3回×10秒（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.reji + 3.7; return lt > t0 ? [{ t: t0, text: 'あなたは 年3時間', x: 600, y: 1130, h: 84, bg: '#ffffff' }] : []; },
    act(lt, s) {
      place(s.P.counter, -0.3, -0.2); s.P.counter.scale.set(0.7, 1, 0.8); place(s.P.register, -0.5, -0.2); s.P.register.position.y = 0.93;
      s.P.register.userData.led.scale.setScalar(lt > 0.6 && lt < 1.2 ? 0.036 : 0.022);
      s.P.crowd.position.set(0.5, 0, -1.4); s.P.crowd.scale.setScalar(0.8); s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 7 + i)) * 0.05; });
      const h = s.hero.userData; place(s.hero, 0.4, 0.3, -0.5);
      hold(s, 'phone', 'R', V(lerp(0.15, -0.05, ease(k(lt, 0.2, 0.6))), 1.05, 0.0), 0, -0.4); s.P.phone.rotation.x = -1.0;
      h.arm('L', 0.3, 2.5, 0.3); h.hand('L', 'choki');
      h.face(lt < 2.75 ? { lid: 0.3, brow: 0.3, look: [-0.6, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) blackout: phone 0% -> can't buy water
  { sc: 'st', say: ['teiden'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.55, show: ['counter', 'lamp', 'bottle'], hud: ['停電', 'スマホ0%'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.8], p1: [0.0, 1.43, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.2, 'shock', -14], [1.3, 'comic_fall', -12], [1.5, 'text_pa', -10], [3.0, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: 'スマホ [0%]', y: 480, size: 72, border: RED, sub: '現金なし＝支払い手段なし' }] : []; },
    tags(lt) { const t0 = this.lt.teiden + 2.6; return lt > t0 ? [{ t: t0, text: '水1本 買えない', x: 600, y: 1130, h: 84, bg: '#ffffff' }] : []; },
    act(lt, s) {
      place(s.P.counter, 0.5, -0.6); s.P.counter.scale.set(0.6, 1, 0.8); s.P.lamp.position.set(0.5, 2.55, -0.6); s.P.lamp.userData.bulb.material = s.P.lamp.userData.off;
      place(s.P.bottle, 0.55, -0.55); s.P.bottle.position.y = 0.93; s.P.bottle.scale.setScalar(1.3);
      const h = s.hero.userData; place(s.hero, -0.45, 0.3, 0.3);
      const ph = hold(s, 'phone', 'R', V(-0.1, 1.25, 0.6), 0); ph.scale.setScalar(1.4); ph.userData.fill.scale.y = Math.max(0.02, 0.3 - 0.28 * k(lt, 0.2, 1.3));
      ph.userData.fillMesh.material = lt > 1.0 ? basic('#ff3b30') : basic('#3fd16b');
      h.arm('L', 0.6, 0.6, 0.6); h.hand('L', 'pa');
      h.face(lt < 1.4 ? { lid: 0.2, brow: -0.3, look: [0.4, -0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.8, -0.1], mouth: 'o', open: 1.1 });
    } },
  // 9) split the bill 1,000 / 3 -> 1 yen left over
  { sc: 'st', say: ['warikan'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], dim: 0.95, hero2: true, show: ['desk'], hud: ['割り勘', '1円あまる'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.0], p1: [0.0, 1.43, 4.7], l0: [0.0, 1.15, 0] },
    sfx: [[0.4, 'text_touch', -12], [2.75, 'text_pa', -10], [4.2, 'coin_toss', -11], [4.35, 'comic_surprise', -12]],
    cards(lt) { return lt > 2.7 ? [{ t: 2.7, text: '1,000円÷3 = [333円]', y: 480, size: 64, border: CY, sub: '333円×3＝999円' }] : []; },
    stamps: [{ t: 4.3, text: '1円 どうする?', x: 540, y: 1180, rot: -5, color: '#ffffff', size: 60, dur: 1.4 }],
    act(lt, s) {
      place(s.P.desk, 0, -0.3);
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.68, 0.2, 0.3); place(s.hero2, 0.68, 0.1, -0.3);
      hold(s, 'phone', 'R', V(-0.35, 1.15, 0.45), 0);
      h2.arm('R', 0.3, 0.3, 1.9); h2.reach('L', V(0.35, 1.15, 0.4)); h2.hand('L', 'pa');
      if (lt > 4.2) { const c = s.P.ichien; c.visible = true; const d = lt - 4.2; c.position.set(0, 0.9 + Math.min(0.6, d * 2.5) + Math.sin(lt * 4) * 0.03, 0.35); c.rotation.set(0, Math.sin(lt * 3) * 0.6, 0); c.scale.setScalar(2.2); }
      h2.face(lt < 4.2 ? { lid: 0.3, brow: 0.3, mouth: 'smile', look: [-0.4, 0] } : { lid: 0, brow: -0.6, browY: 1, mouth: 'o', open: 0.7, look: [-0.6, 0.3] });
      h.face(lt < 4.2 ? { lid: 0.2, brow: 0, mouth: 'smile', look: [0.4, -0.2] } : { lid: 0, brow: -0.8, browY: 1, mouth: 'o', open: 0.9, look: [0.6, 0.3] });
    } },
  // 10) offering: the 5-yen "go-en" coin -> QR code
  { sc: 'st', say: ['saisen'], pre: 0.15, pal: ['#c0392b', '#ffe3df', '#ffd23a'], show: ['saisen'], hud: ['お賽銭', 'QR'], hudColor: RED,
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.43, 4.5], l0: [0.05, 1.2, 0] },
    sfx: [[0.3, 'sparkle', -14], [1.4, 'text_pa', -10], [2.4, 'comic_stupid', -12]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '5円玉 → [QRコード]', y: 480, size: 64, border: YEL, sub: '「ご縁」の語呂も消える？' }] : []; },
    stamps: [{ t: 2.4, text: 'ご縁…?', x: 300, y: 1150, rot: -8, color: '#ffffff', size: 64, dur: 1.2 }],
    act(lt, s) {
      place(s.P.saisen, 0.55, -0.4, -0.3);
      const h = s.hero.userData; place(s.hero, -0.5, 0.3, 0.35);
      hold(s, 'goen', 'R', V(0.0, 1.3 + Math.sin(lt * 4) * 0.02, 0.55), 0, Math.sin(lt * 2) * 0.4).scale.setScalar(1.8);
      h.arm('L', 0.4, 2.2, 1.2); h.hand('L', 'pa');
      h.face(lt < 1.3 ? { lid: 0.2, brow: 0, look: [0.3, 0.1], mouth: 'smile' } : { lid: 0.4, brow: -0.7, look: [0.8, 0], mouth: 'flat' }); h.head.rotation.z = lt > 1.3 ? 0.15 : 0;
    } },
  // 11) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: ['coinsA'], hud: ['お金', '消えない?'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'text_pa', -10], [2.6, 'comic_fall', -12]],
    cards(lt) { return lt < 1.6 ? (lt > 0.25 ? [{ t: 0.25, text: '預金は [減らない]', y: 480, size: 66, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 1.6, text: '[使った感] ゼロ', y: 480, size: 70, border: RED, sub: '悪いニュース' }]; },
    act(lt, s) {
      const c = s.P.coinsA; place(c, 0.55, 0.0); const n = lt < 1.6 ? 28 : Math.round(28 - 24 * ease(k(lt, 1.8, 3.3))); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.35, 0.3, 0.3);
      hold(s, 'phone', 'L', V(-0.75, 1.2, 0.55), 0); s.P.phone.userData.fill.scale.y = 0.9;
      h.reach('R', V(0.42, 0.15 + n * 0.028, 0.05)); h.hand('R', 'pa');
      h.face(lt < 1.6 ? { lid: 0.4, brow: 0.5, look: [0, 0], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.6, -0.3], mouth: 'o', open: 1 });
    } },
  // 12) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'ゼロでいい', x: 320, y: 1250, h: 110, bg: CY }, { t: t0 + 0.2, text: '現金は残して', x: 760, y: 1250, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'wallet', 'R', V(0.42, 1.2, 0.45), 0.1); hold(s, 'phone', 'L', V(-0.6, 1.2, 0.45), 0);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[現金]が明日から', '全部なくなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['現金', 'ゼロ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
