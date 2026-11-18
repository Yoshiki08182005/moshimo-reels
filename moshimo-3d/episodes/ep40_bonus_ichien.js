// ep40_bonus_ichien (pop / arm C ニュース起点): もしも冬のボーナスが全部1円玉だったら？
// 型は sp_geppu2x / ep39。台本・数字・小道具は自作。
// 前提（試算）:
//   2026年冬のボーナス：民間 前年比+5.0%、6年連続の増加見込み・支給総額20.4兆円（三菱UFJリサーチ&コンサルティング 2026年11月）
//   1人のボーナスを45万円と仮定 → 1円玉45万枚
//   1円玉：1枚1.0g・直径20mm・厚さ約1.5mm（造幣局）→ 450kg（150kg×3人）、積むと 45万×1.5mm = 675m（スカイツリー634m超え）
//   日本中：20.4兆枚 × 2cm = 4.08億km、太陽まで1.496億km の 2.73倍
//   電車の手回り品 30kgまで（JR各社のめやす）→ 450/30 = 15往復
//   同じ硬貨は額面の20倍まで法貨（通貨の単位及び貨幣の発行等に関する法律 第7条）→ 21枚目から受け取りを断れる
//   ゆうちょ銀行 窓口の硬貨取扱料金：501〜1,000枚 1,100円、以降500枚ごとに+550円 → 1,100 + (450,000−1,000)/500×550 = 495,000円
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep40_bonus_ichien.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9fb8', '#fff0f4', '#ffd23a'];
const SILVER = '#dfe3e8';

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
const RAIN = (() => { const r = rng(11), a = []; for (let i = 0; i < 70; i++) a.push([(r() - 0.5) * 2.4, (r() - 0.5) * 1.0, r() * 2.2, 3.5 + r() * 2.5, r() * 6]); return a; })();

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // bonus envelope (賞与)
  { const e = G(); const fm = label(256, 160, (c) => { c.fillStyle = '#f3e3c3'; c.fillRect(0, 0, 256, 160); c.strokeStyle = '#c0392b'; c.lineWidth = 8; c.strokeRect(10, 10, 236, 140);
      c.fillStyle = '#c0392b'; c.font = 'bold 76px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('賞与', 128, 84); });
    rbox(0.36, 0.23, 0.03, 0.01, '#f3e3c3', 0, 0, 0, e); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.21), fm); f.position.z = 0.017; e.add(f); reg('envelope', e); }
  // heap of 1-yen coins (cone, origin at the floor; scale.x/z = radius, scale.y = height)
  { const h = G(); const tex = canvasTex(256, 256, (c) => { c.fillStyle = '#cfd4da'; c.fillRect(0, 0, 256, 256); const r = rng(4);
      for (let i = 0; i < 260; i++) { const x = r() * 256, y = r() * 256, s = 7 + r() * 6; c.fillStyle = r() > 0.5 ? '#f2f4f7' : '#b9c0c9'; c.beginPath(); c.ellipse(x, y, s, s * 0.7, r() * 3, 0, 7); c.fill(); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 2);
    const m = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 40), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.2 })); m.position.y = 0.5; m.castShadow = m.receiveShadow = true; h.add(m);
    reg('heap', h); }
  // falling coins
  { const g = G(); g.userData.items = []; for (let i = 0; i < RAIN.length; i++) { const c = cyl(0.055, 0.055, 0.012, M(SILVER, 0.3), 0, 0, 0, g); g.userData.items.push(c); } reg('rain', g); }
  // big 1-yen coin
  { const c = G(); const d = cyl(0.07, 0.07, 0.015, M('#e6e9ee', 0.3), 0, 0, 0, c); d.rotation.x = Math.PI / 2;
    const fm = label(128, 128, (x) => { x.fillStyle = '#e6e9ee'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#7a828c'; x.font = 'bold 76px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('1', 64, 68); });
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.066, 28), fm); f.position.z = 0.009; c.add(f); reg('ichien', c); }
  // tall stack of 1-yen coins (goes out of frame)
  { const s = G(); const tex = canvasTex(32, 128, (c) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#eef1f4' : '#b9c0c9'; c.fillRect(0, i * 8, 32, 8); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 60);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 16, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.2 })); col.position.y = 8; col.castShadow = true; s.add(col); reg('stack', s); }
  // generic broadcast tower (tapered, two decks)
  { const t = G(); cyl(0.03, 0.2, 2.6, '#c9d3de', 0, 1.3, 0, t); cyl(0.14, 0.14, 0.08, '#9aa3ad', 0, 1.55, 0, t); cyl(0.1, 0.1, 0.06, '#9aa3ad', 0, 2.0, 0, t); cyl(0.006, 0.012, 0.6, '#9aa3ad', 0, 2.9, 0, t); reg('ttower', t); }
  // row of coins (toward the sun)
  { const g = G(); g.userData.items = []; for (let i = 0; i < 40; i++) { const c = cyl(0.05, 0.05, 0.012, M(SILVER, 0.3), 0, 0, 0, g); c.rotation.x = Math.PI / 2; g.userData.items.push(c); } reg('row', g); }
  // small heap on a counter / in a tray
  { const g = G(); g.userData.items = []; const r = rng(5);
    for (let i = 0; i < 18; i++) { const c = cyl(0.05, 0.05, 0.012, M(SILVER, 0.3), 0, 0, 0, g); c.userData.v = [(r() - 0.5) * 1.4, 0.8 + r() * 1.0, (r() - 0.5) * 0.4, r() * 8]; g.userData.items.push(c); } reg('spill', g); }
}

const place = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
// avalanche around (x, z): coins rain from t0, heap grows to (r, h)
function avalanche(s, lt, t0, x, z, r = 1.25, h = 1.05) {
  const u = ease(k(lt, t0 + 0.05, t0 + 0.75)); const hp = s.P.heap; hp.visible = u > 0; hp.position.set(x, 0, z - 0.1); hp.scale.set(r * (0.3 + 0.7 * u), Math.max(0.001, h * u), r * (0.3 + 0.7 * u));
  const g = s.P.rain; if (lt < t0) return; g.visible = true; const d = lt - t0;
  g.userData.items.forEach((c, i) => { const [cx, cz, dl, v, sp] = RAIN[i]; const y = 2.9 + dl * 0.6 - v * Math.max(0, d - dl * 0.25);
    c.visible = y > 0.55 && d < 2.4; c.position.set(x + cx, y, z + cz); c.rotation.set(sp * d * 2, sp, sp * d); });
}
function spill(s, lt, t0, from) { const g = s.P.spill; if (lt < t0) return; g.visible = true; const d = lt - t0;
  g.userData.items.forEach((c) => { const [vx, vy, vz, sp] = c.userData.v; const y = Math.max(0.93, from.y + vy * d - 4.9 * d * d);
    c.position.set(from.x + vx * Math.min(d, 0.35), y, from.z + vz * Math.min(d, 0.35)); c.rotation.set(y > 0.94 ? sp * d : 0, sp, 0); }); }

const plan = [
  // 0) cold open (flash-forward of #4): open the bonus envelope -> 450 kg of 1-yen coins bury him; push in, smug face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.6, 6.6], p1: [0.0, 1.5, 2.5], l0: [0.0, 1.25, 0], l1: [0.0, 1.42, 0.2], hold: 1.4, dur: 2.2 },
    shake: [[0.3, 0.07, 0.8]], lines: [[0.25, 0.9]],
    sfx: [[0.15, 'coin_toss', -9], [0.25, 'impact_doon', -9], [0.35, 'collapse', -12], [0.6, 'coin_toss', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.28, text: '1円玉 450kg!!', x: 540, y: 470, rot: -6, color: YEL, size: 100, dur: 1.15 },
      { t: 2.3, text: '…全額 支給です', x: 560, y: 1480, rot: -5, color: '#ffffff', size: 54, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.3, 0);
      avalanche(s, lt, 0.2, 0, 0.3);
      if (lt < 0.25) { hold(s, 'envelope', 'R', V(0.2, 1.25, 0.6), 0); h.arm('L', 0.4, 0.4, 1.4); h.face({ lid: 0.3, brow: 0.5, look: [0, 0], mouth: 'smile' }); }
      else if (lt < 1.5) { hold(s, 'envelope', 'R', V(0.45, 2.0, 0.35), 0.4); h.arm('L', 0.3, 2.6, 0.2); h.hand('L', 'pa');
        h.face({ lid: 0, brow: -0.8, browY: 1, look: [0, 0.3], mouth: 'o', open: 1.2 }); }
      else { hold(s, 'envelope', 'R', V(0.4, 1.85, 0.4), 0.2); h.arm('L', 0.3, 2.4, 0.2); h.hand('L', 'choki');
        h.face({ lid: 0.55, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.8, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.7, 'coin_toss', -12]],
    stamps: [{ t: 1.9, text: '全部?!', x: 800, y: 1080, rot: 8, color: RED, size: 70, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.3, 0.1);
      hold(s, 'envelope', 'R', V(0.3, 1.2 + Math.sin(lt * 5) * 0.03, 0.55), 0.1);
      const c = hold(s, 'ichien', 'L', V(-0.45, lt > 1.6 ? 1.45 : 1.15, 0.55), 0, Math.sin(lt * 3) * 0.4); c.scale.setScalar(2.2);
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.3, look: [0.3, 0], mouth: 'smile' } : { lid: 0, brow: -0.6, browY: 1, look: [-0.5, 0.2], mouth: 'o', open: 1 });
    } },
  // 2) news: 6 years in a row
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['coinsA', 'coinsB'], hud: ['冬のボーナス', '+5.0%'],
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.1, 1.2, 0] },
    sfx: [[0.9, 'text_pa', -10], [1.8, 'sparkle', -14]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: 'ボーナス [6年連続]増', y: 480, size: 66, border: CY, sub: '2026年冬・民間の見通し' }] : []; },
    tags(lt) { const t0 = this.lt.news + 1.9; return lt > t0 ? [{ t: t0, text: '支給総額 20.4兆円', x: 600, y: 1130, h: 80, bg: '#ffffff' }] : []; },
    note: '三菱UFJリサーチ&コンサルティング 2026年11月',
    act(lt, s) {
      const a = s.P.coinsA, b = s.P.coinsB; place(a, 0.45, 0.0); place(b, 0.85, -0.2);
      const n = Math.round(6 + 20 * ease(k(lt, 0.3, 2.0))); a.userData.items.forEach((it, i) => { it.visible = i < n * 0.7; }); b.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.45, 0.3, 0.3);
      hold(s, 'envelope', 'L', V(-0.85, 1.3, 0.5), -0.2);
      h.reach('R', V(0.5, 0.2 + n * 0.02, 0.05)); h.hand('R', 'pa');
      h.face(lt < 0.9 ? { lid: 0.1, brow: 0.2, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 3) 450,000 yen = 450,000 coins
  { sc: 'st', say: ['count'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#3f6fd8'], show: [], hud: ['1円玉', '45万枚'],
    cam: { p0: [0.0, 1.45, 4.8], p1: [0.0, 1.43, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.4, 'coin_toss', -12], [1.5, 'text_pa', -10], [2.5, 'text_pa', -11]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '45万円 = [45万枚]', y: 480, size: 70, border: YEL, sub: '1人45万円と仮定（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.count + 2.2; return lt > t0 ? [{ t: t0, text: 'ふつう：お札45枚', x: 330, y: 1130, h: 72, bg: '#ffffff' }, { t: t0 + 0.3, text: 'あなた：1円玉45万枚', x: 700, y: 1240, h: 80, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.3, 0);
      hold(s, 'envelope', 'L', V(-0.35, 1.15, 0.55), 0.3);
      const c = hold(s, 'ichien', 'R', V(0.38, lerp(1.15, 1.55, ease(k(lt, 0.3, 0.9))), 0.55), 0, Math.sin(lt * 4) * 0.5); c.scale.setScalar(2.6);
      h.face(lt < 1.4 ? { lid: 0.1, brow: 0, look: [0.5, 0.2], mouth: 'o', open: 0.5 } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 4) 450 kg (the cold open, in its place)
  { sc: 'st', say: ['weight'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['重さ', '450kg'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 5.6], p1: [0.0, 1.5, 5.0], l0: [0.0, 1.25, 0] },
    shake: [[0.35, 0.06, 0.6]],
    sfx: [[0.25, 'coin_toss', -10], [0.35, 'impact_doon', -11], [0.45, 'collapse', -13], [1.3, 'text_pa', -10], [2.4, 'comic_boyon', -12]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '重さ [450kg]', y: 480, size: 72, border: YEL, sub: '1円玉は1枚1g（造幣局）' }] : []; },
    tags(lt) { const t0 = this.lt.weight + 2.2; return lt > t0 ? [{ t: t0, text: 'お相撲さん 3人分', x: 600, y: 1300, h: 84, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.3, 0);
      avalanche(s, lt, 0.3, 0, 0.3);
      hold(s, 'envelope', 'R', V(0.45, lt < 0.3 ? 1.3 : 2.0, 0.35), 0.4); h.arm('L', 0.3, lt < 0.3 ? 0.4 : 2.6, 0.2); h.hand('L', 'pa');
      h.face(lt < 0.3 ? { lid: 0.3, brow: 0.4, mouth: 'smile', look: [0, 0] } : lt < 2.2 ? { lid: 0, brow: -0.8, browY: 1, look: [0, 0.3], mouth: 'o', open: 1.1 } : { lid: 0.5, brow: -0.4, look: [0.4, 0], mouth: 'flat' });
    } },
  // 5) stacked: 675 m, taller than the 634 m tower
  { sc: 'st', say: ['tower'], pre: 0.15, pal: ['#7ec8ff', '#eaf6ff', '#ff6b5a'], show: ['stack', 'ttower'], hud: ['積むと', '675m'],
    cam: { p0: [0.1, 1.4, 5.6], p1: [0.1, 1.5, 5.8], l0: [0.1, 1.4, 0], l1: [0.1, 2.0, 0] },
    sfx: [[0.3, 'whoosh_gust', -13], [1.6, 'text_pa', -10], [2.9, 'comic_surprise', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '高さ [675m]', y: 480, size: 72, border: YEL, sub: '45万枚×厚さ1.5mm（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.tower + 2.6; return lt > t0 ? [{ t: t0, text: 'スカイツリー634m 超え', x: 560, y: 1300, h: 76, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const st = s.P.stack; place(st, 0.25, -0.2); st.scale.y = 0.05 + 0.95 * ease(k(lt, 0.1, 1.4));
      const tt = s.P.ttower; place(tt, 0.9, -0.6); tt.scale.setScalar(1.0);
      const h = s.hero.userData; place(s.hero, -0.45, 0.3, 0.3);
      h.reach('R', V(0.12, 1.1, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face(lt < 1.5 ? { lid: 0, brow: 0.2, look: [0.5, 0.9], mouth: 'o', open: 0.6 } : { lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 6) all of Japan in a row -> 2.7 x the distance to the Sun
  { sc: 'st', say: ['nihon'], pre: 0.15, pal: ['#2b3f8f', '#cfd8ff', '#ffd23a'], dim: 0.85, show: ['sun', 'row'], hud: ['日本中', '20.4兆枚'],
    cam: { p0: [0.1, 1.5, 5.6], p1: [0.15, 1.55, 5.8], l0: [0.15, 1.5, 0] },
    sfx: [[0.3, 'whoosh_slide', -13], [1.9, 'text_pa', -10], [2.7, 'sparkle', -13]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '並べると [4億km]', y: 480, size: 70, border: YEL, sub: '20.4兆枚×直径2cm（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.nihon + 2.5; return lt > t0 ? [{ t: t0, text: '太陽までの 2.7倍', x: 560, y: 1300, h: 84, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const sun = s.P.sun; sun.position.set(1.5, 2.6, -1.4); sun.scale.setScalar(0.7); sun.rotation.z = lt * 0.3;
      const h = s.hero.userData; place(s.hero, -0.5, 0.3, 0.35); sun.traverse(o => { o.castShadow = false; });
      const n = Math.round(40 * ease(k(lt, 0.2, 2.6))); const a = V(-0.2, 1.2, 0.45), b = V(1.25, 2.4, -1.3);
      s.P.row.userData.items.forEach((c, i) => { c.visible = i < n; const u = i / 39; c.position.lerpVectors(a, b, u); c.position.y += Math.sin(u * Math.PI) * 0.35; c.rotation.y = u * 0.6; });
      hold(s, 'ichien', 'R', V(-0.17, 1.2, 0.5), 0, 0.3).scale.setScalar(1.6); h.arm('L', 0.4, 2.0, 0.6); h.hand('L', 'pa');
      h.face(lt < 1.8 ? { lid: 0.1, brow: 0.2, look: [0.8, 0.6], mouth: 'o', open: 0.5 } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 });
      hold(s, 'envelope', 'R', V(0.32, 1.0, 0.45), -0.3); h.arm('L', 0.3, 0.3, 1.9); } },
  // 8) train: luggage up to 30 kg -> 15 round trips
  { sc: 'st', say: ['densha'], pre: 0.15, pal: ['#4a7bd0', '#dfe9fb', '#ffd23a'], show: ['train', 'suitcase'], hud: ['持ち帰り', '15往復'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.2, 'train_door', -14], [1.4, 'text_pa', -10], [2.9, 'comic_fall', -12], [3.2, 'text_pa', -11]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '電車の荷物 [30kg]まで', y: 480, size: 62, border: RED, sub: 'JR各社の手回り品のめやす' }] : []; },
    tags(lt) { const t0 = this.lt.densha + 2.8; return lt > t0 ? [{ t: t0, text: '450kg÷30kg＝15往復', x: 560, y: 1300, h: 80, bg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.35, 0.3, 0.4);
      const sc = s.P.suitcase; place(sc, 0.45, 0.35, -0.2); sc.rotation.z = -0.35; sc.scale.setScalar(1.2);
      h.reach('R', V(0.3, 0.95, 0.35)); h.hand('R', 'gu'); h.reach('L', V(0.15, 0.9, 0.4)); h.hand('L', 'gu');
      s.hero.rotation.z = 0.12 + Math.sin(lt * 9) * 0.02;
      h.face(lt < 1.3 ? { lid: 0.5, brow: -0.6, look: [0.6, -0.3], mouth: 'flat' } : { lid: 0.2, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.8 });
    } },
  // 9) shop: same coin, 21st one can be refused
  { sc: 'st', say: ['mise'], pre: 0.15, pal: ['#ff9f5a', '#fff1e2', '#3f6fd8'], dim: 0.95, hero2: true, show: ['counter'], hud: ['お会計', '21枚目'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.8], p1: [0.0, 1.48, 5.5], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'coin_toss', -11], [0.6, 'coin_toss', -13], [1.6, 'text_pa', -10], [2.6, 'comic_tsukkomi', -11]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '同じ硬貨は [20枚]まで', y: 480, size: 62, border: CY, sub: '通貨の法律 第7条' }] : []; },
    stamps: [{ t: 2.6, text: '21枚目 お断り!', x: 760, y: 1180, rot: 6, color: '#ffffff', size: 60, dur: 1.2 }],
    act(lt, s) {
      place(s.P.counter, 0, -0.1); s.P.counter.scale.set(0.55, 1, 0.7);
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.7, 0.45, 0.35); place(s.hero2, 0.7, -0.45, -0.35);
      hold(s, 'envelope', 'R', V(-0.25, 1.15, 0.35), Math.PI * 0.7); spill(s, lt, 0.25, V(-0.15, 1.1, 0.2));
      h.arm('L', 0.3, 0.3, 1.8);
      h2.arm('R', 0.3, 0.3, 1.9); if (lt > 2.4) { h2.reach('L', V(0.35, 1.35, 0.1)); h2.hand('L', 'pa'); }
      h2.face(lt < 1.5 ? { lid: 0.3, brow: 0.2, mouth: 'smile', look: [-0.5, -0.3] } : { lid: 0.2, brow: -0.7, mouth: 'flat', look: [-0.6, 0] });
      h.face(lt < 2.4 ? { lid: 0.2, brow: 0.3, mouth: 'smile', look: [0.4, -0.3] } : { lid: 0, brow: -0.8, browY: 1, mouth: 'o', open: 0.9, look: [0.6, 0.1] });
    } },
  // 10) bank: fee 495,000 yen > bonus (bad news)
  { sc: 'st', say: ['ginkou'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', RED], hero2: true, show: ['counter', 'coinsA', 'coinsB'], hud: ['手数料', '49.5万円'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.8], p1: [0.0, 1.48, 5.5], l0: [0.0, 1.25, 0] },
    sfx: [[0.4, 'text_touch', -12], [1.6, 'text_pa', -10], [3.6, 'comic_shock2', -12], [3.8, 'comic_fall', -13]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '手数料 [49万5千円]', y: 480, size: 64, border: RED, sub: '窓口 500枚ごと550円（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.ginkou + 3.5; return lt > t0 ? [{ t: t0, text: 'ボーナスより 4.5万円 高い', x: 540, y: 1300, h: 80, bg: '#ffffff' }] : []; },
    note: 'ゆうちょ銀行 硬貨取扱料金（2022年〜）',
    act(lt, s) {
      place(s.P.counter, 0, -0.1); s.P.counter.scale.set(0.55, 1, 0.7);
      const a = s.P.coinsA, b = s.P.coinsB; place(a, -0.15, 0.0); place(b, 0.15, -0.05); a.position.y = b.position.y = 0.93; a.scale.setScalar(0.8); b.scale.setScalar(0.8);
      const n = lt < 3.4 ? 26 : Math.round(26 - 24 * ease(k(lt, 3.5, 4.6))); a.userData.items.forEach((it, i) => { it.visible = i < n; }); b.userData.items.forEach((it, i) => { it.visible = i < n * 0.8; });
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.72, 0.45, 0.35); place(s.hero2, 0.72, -0.45, -0.35);
      h.reach('R', V(-0.28, 1.0 + n * 0.017, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.3, 1.8);
      h2.reach('L', V(0.28, 1.0 + n * 0.02, 0.0)); h2.hand('L', 'pa'); h2.arm('R', 0.3, 0.3, 1.9);
      h2.face({ lid: 0.3, brow: 0.2, mouth: 'smile', look: [-0.5, -0.2] });
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.5, -0.2] } : lt < 3.5 ? { lid: 0, brow: -0.6, browY: 1, mouth: 'o', open: 0.7, look: [0, 0] } : { lid: 0, brow: -1, browY: 1, mouth: 'o', open: 1.2, look: [0.3, -0.3] });
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, hold: 0.8, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: '1円玉でいい', x: 320, y: 1110, h: 110, bg: CY }, { t: t0 + 0.2, text: 'お札がいい', x: 760, y: 1110, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1400, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1490, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'envelope', 'R', V(0.42, 1.2, 0.45), 0.1); hold(s, 'ichien', 'L', V(-0.6, 1.25, 0.45), 0, Math.sin(lt * 3) * 0.5).scale.setScalar(2.2);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも冬の[ボーナス]が', '全部[1円玉]だったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['ボーナス', '1円玉'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
