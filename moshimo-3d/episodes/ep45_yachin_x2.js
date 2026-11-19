// ep45_yachin_x2 (pop / arm A 原因を拡大): もしも家賃が毎年2倍になったら？
// 型は sp_geppu2x / ep44。台本・数字・小道具は自作。
// 前提（試算）:
//   今の家賃: 東京23区 シングル向け（30㎡以下）平均 約11.4万円/月（アットホーム 2026年8月、報道）
//   給料: 一般労働者の賃金 月34万600円（厚労省 令和7年賃金構造基本統計調査）→ 11.4÷34.06 = 0.33（3分の1）
//   n年後の家賃 = 11.4万円 × 2^n
//     1年後 22.8万（給料の0.67＝3分の2）/ 2年後 45.6万（給料の1.34倍＝給料超え）/ 3年後 91.2万（÷30日 = 3.04万円/日）
//     5年後 364.8万 / 10年後 11,673.6万円 = 1億1,674万円（÷30日÷86,400秒 = 45.0円/秒）
//   23区の中古マンション平均 8,818万円（アットホーム 2026年5月）＜ 10年後の家賃1か月分
//   シェア: 家賃を給料の3分の1（11.35万円）に抑える人数 = 364.8÷11.35 = 32.1 → 32人
//   1人分: 30㎡÷32人 = 0.94㎡ = 0.58畳（1畳1.62㎡）≒ 畳半分
import { run, THREE, V, clamp, ease, lerp, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep45_yachin_x2.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ffb0c8', '#fff0f5', '#ffd23a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
function sheet(w, h, title, amount, sub, col = '#e2463c') {
  return label(w, h, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2c3b6b'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#2c3b6b'; c.font = `bold ${Math.round(h * 0.2)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(title, w / 2, h * 0.22);
    c.fillStyle = col; c.font = `bold ${Math.round(h * 0.24)}px sans-serif`; c.fillText(amount, w / 2, h * 0.56);
    c.fillStyle = '#2c3b6b'; c.font = `bold ${Math.round(h * 0.12)}px sans-serif`; c.fillText(sub, w / 2, h * 0.84); });
}

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // small apartment house (origin = floor)
  { const h = G(); rbox(1.0, 0.7, 0.8, 0.04, '#fff6e6', 0, 0.35, 0, h);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.5, 4), M('#5a7bff')); roof.rotation.y = Math.PI / 4; roof.position.y = 0.95; roof.castShadow = true; h.add(roof);
    rbox(0.22, 0.38, 0.03, 0.02, '#a86a3d', -0.2, 0.19, 0.41, h); rbox(0.24, 0.2, 0.03, 0.02, '#9fd4ff', 0.24, 0.42, 0.41, h); reg('house', h); }
  // giant rent bill (falls on the house)
  { const b = G(); rbox(1.56, 1.12, 0.05, 0.02, '#ffffff', 0, 0, 0, b);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.06), sheet(600, 424, '家賃（1か月）', '1億1,674万円', '10年後の請求書')); f.position.z = 0.03; b.add(f); reg('bigbill', b); }
  // hand-held rent slip
  { const p = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), sheet(340, 240, '家賃', '11.4万円', '東京・ひとり暮らし', '#2c3b6b'));
    m.material.side = THREE.DoubleSide; p.add(m); reg('slip', p); }
  // salary envelope
  { const e = G(); rbox(0.3, 0.2, 0.012, 0.01, '#f2e3c2', 0, 0, 0, e);
    const fm = label(256, 170, (c) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, 256, 170); c.fillStyle = '#22252d'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('給料', 128, 62); c.font = 'bold 36px sans-serif'; c.fillText('34.1万円', 128, 128); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.18), fm); f.position.z = 0.008; e.add(f); reg('pay', e); }
  // tatami mat (half-size)
  { const t = G(); rbox(0.9, 0.05, 0.45, 0.01, '#cfd98a', 0, 0.025, 0, t); rbox(0.92, 0.052, 0.04, 0.005, '#3b5a3a', 0, 0.026, -0.215, t); rbox(0.92, 0.052, 0.04, 0.005, '#3b5a3a', 0, 0.026, 0.215, t); reg('tatami', t); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero || o === S.hero2) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0, who = s.hero) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
// giant bill falls on the house at t0 (fall 0.25 s) and squashes it. house at (x, z), scale sc
function squash(s, lt, t0, x = 0.42, z = -0.1, sc = 1.5) {
  const h = s.P.house; place(h, x, z); const u = ease(k(lt, t0 + 0.2, t0 + 0.32)); h.scale.set(sc * (1 + 0.25 * u), sc * (1 - 0.68 * u), sc * (1 + 0.25 * u));
  const b = s.P.bigbill; b.visible = true; b.scale.setScalar(0.82); const f = k(lt, t0 - 0.05, t0 + 0.25); const top = 1.2 * sc * (1 - 0.68 * u);
  b.position.set(x, lerp(5.5, top + 0.46, f * f), z + 0.1); b.rotation.set(0, 0, (1 - f) * 0.25); return u;
}
const coins = (s, name, x, z, n) => { const c = s.P[name]; place(c, x, z); c.userData.items.forEach((it, i) => { it.visible = i < n; }); return c; };

const plan = [
  // 0) cold open (flash-forward of #5): a 100-million-yen rent bill drops and flattens the house; push in to a deadpan face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.5, 6.4], p1: [-0.68, 1.55, 3.3], l0: [0.0, 1.2, 0], l1: [-0.76, 1.46, 0.3], hold: 1.3, dur: 2.2 },
    shake: [[0.28, 0.08, 0.6]], lines: [[0.25, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -10], [0.27, 'impact_doon', -8], [0.3, 'text_impact', -11], [0.4, 'collapse', -14], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.3, text: '家賃 1億円!!', x: 560, y: 440, rot: -6, color: YEL, size: 100, dur: 1.15 },
      { t: 2.3, text: '…1秒45円', x: 560, y: 1330, rot: -5, color: '#ffffff', size: 58, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; squash(s, lt, 0.02); place(s.hero, -0.8, 0.3, 0.2);
      if (lt < 0.3) { hold(s, 'slip', 'R', V(-0.48, 1.25, 0.6), 0); h.arm('L', 0.3, 0.3, 1.8); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0.6], mouth: 'smile' }); }
      else if (lt < 1.4) { s.hero.position.y = Math.max(0, Math.sin(Math.PI * k(lt, 0.3, 0.7)) * 0.25); h.arm('L', 0.4, 2.4, 0.3); h.arm('R', 0.4, 2.4, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa');
        h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.7, 0.1], mouth: 'o', open: 1.1 }); }
      else { s.hero.rotation.y = lerp(0.2, 0.0, ease(k(lt, 1.4, 1.9))); hold(s, 'slip', 'R', V(-0.48, 1.2, 0.6), 0.1); h.arm('L', 0.3, 0.3, 1.8);
        h.face({ lid: 0.6, brow: -0.4, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = -0.1 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#ff8fb3', '#fff0f5', '#ffd23a'], show: ['house'],
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.48, 5.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'comic_surprise', -12]],
    stamps: [{ t: 1.7, text: '毎年?!', x: 800, y: 1080, rot: 8, color: RED, size: 72, dur: 1.4 }],
    act(lt, s) {
      const ho = s.P.house; place(ho, 0.62, -0.3); ho.scale.setScalar(1.5);
      const h = s.hero.userData; place(s.hero, -0.45, 0.3, 0.2);
      hold(s, 'slip', 'R', V(-0.1, 1.3, 0.65), 0.05); h.arm('L', 0.3, 0.3, 1.8);
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.2, look: [0, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) now: 114,000 yen
  { sc: 'st', say: ['now'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['house'], hud: ['家賃', '11.4万円'],
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.1, 1.3, 0] },
    sfx: [[1.95, 'text_pa', -10], [3.0, 'text_pa', -12]],
    cards(lt) { return lt > 1.9 ? [{ t: 1.9, text: '家賃 [11.4万円]/月', y: 480, size: 68, border: CY, sub: '東京23区 30㎡以下の平均' }] : []; },
    tags(lt) { const t0 = 3.0; return lt > t0 ? [{ t: t0, text: '給料の 3分の1', x: 600, y: 1150, h: 80, bg: '#ffffff' }] : []; },
    note: 'アットホーム 2026年8月（報道）',
    act(lt, s) {
      const ho = s.P.house; place(ho, 0.7, -0.4); ho.scale.setScalar(1.4);
      const h = s.hero.userData; place(s.hero, -0.3, 0.3, 0.15);
      hold(s, 'slip', 'R', V(0.05, 1.35, 0.6), -0.05); h.arm('L', 0.3, 2.3, 0.4); h.hand('L', 'choki');
      h.face(lt < 1.9 ? { lid: 0.2, brow: 0.2, look: [0.3, 0], mouth: 'smile' } : { lid: 0.4, brow: -0.3, look: [0, 0], mouth: 'flat' });
    } },
  // 3) 1 year later: 228,000 yen = 2/3 of the pay
  { sc: 'st', say: ['y1'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['coinsA', 'coinsB'], hud: ['1年後', '×2'],
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[1.0, 'text_pa', -10], [1.2, 'coin_toss', -13], [2.45, 'text_pa', -10], [2.7, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.0 && lt < 2.4 ? [{ t: 1.0, text: '[22.8万円]/月', y: 480, size: 74, border: YEL, sub: '11.4万円×2（試算）' }]
      : lt >= 2.4 ? [{ t: 2.4, text: '給料の [3分の2]', y: 480, size: 72, border: RED, sub: '賃金 月34.1万円で計算（試算）' }] : []; },
    note: '賃金 厚労省 令和7年賃金構造基本統計調査',
    act(lt, s) {
      coins(s, 'coinsA', 0.55, 0.0, 22); coins(s, 'coinsB', 0.95, -0.25, Math.round(lerp(5, 16, ease(k(lt, 1.0, 1.6)))));
      const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.3);
      hold(s, 'pay', 'L', V(-0.62, 1.3, 0.7), 0.05); h.reach('R', V(0.4, 0.75, 0.1)); h.hand('R', 'pa');
      h.face(lt < 2.4 ? { lid: 0.1, brow: 0.3, look: [0.6, 0], mouth: 'o', open: 0.6 } : { lid: 0, brow: -0.9, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 4) 3 years: 912,000 yen/month = 30,000 yen a day just for being home
  { sc: 'st', say: ['y3'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['bed', 'clock'], hud: ['3年後', '×8'],
    cam: { p0: [0.0, 1.45, 5.0], p1: [0.0, 1.43, 4.7], l0: [0.0, 1.2, 0] },
    sfx: [[1.1, 'text_pa', -10], [2.75, 'text_pa', -10], [2.9, 'coin_toss', -12], [3.3, 'coin_toss', -13]],
    cards(lt) { return lt > 1.1 && lt < 2.7 ? [{ t: 1.1, text: '月 [91万円]', y: 480, size: 76, border: YEL, sub: '11.4万円×2×2×2（試算）' }]
      : lt >= 2.7 ? [{ t: 2.7, text: '1日 [3万円]', y: 480, size: 76, border: RED, sub: '91.2万円÷30日（試算）' }] : []; },
    stamps: [{ t: 3.0, text: 'ゴロゴロ=3万円', x: 330, y: 1160, rot: -6, color: '#ffffff', size: 56, dur: 1.3 }],
    act(lt, s) {
      const b = s.P.bed; place(b, -0.1, -0.5);
      const c = s.P.clock; c.position.set(0.85, 1.75, -0.4); c.scale.setScalar(1.5); c.userData.mh.rotation.z = -lt * 6; c.userData.hh.rotation.z = -lt * 0.5;
      const h = s.hero.userData; place(s.hero, -0.15, 0.25, 0.1); s.hero.position.y = 0.36;
      h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.5, 1.2, 1.4); h.hand('R', 'pa');
      h.face(lt < 2.7 ? { lid: 0.6, brow: 0.3, look: [0.4, 0.4], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0.5], mouth: 'o', open: 1.1 });
    } },
  // 5) 10 years: over 100 million yen a month (the cold open, in its place)
  { sc: 'st', say: ['y10'], pre: 0.15, hold: 0.6, pal: HOOK, show: [], hud: ['10年後', '×1024'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 6.4], p1: [0.0, 1.5, 6.0], l0: [0.0, 1.2, 0] },
    shake: [[1.17, 0.07, 0.5]], lines: [[1.12, 0.7]],
    sfx: [[0.9, 'whoosh_gust', -11], [1.15, 'impact_doon', -10], [1.25, 'collapse', -15], [2.85, 'text_pa', -10], [3.9, 'comic_surprise', -12]],
    cards(lt) { return lt > 1.2 && lt < 2.8 ? [{ t: 1.2, text: '月 [1億円] 超え', y: 480, size: 76, border: YEL, sub: '11.4万円×2の10乗（試算）' }]
      : lt >= 2.8 ? [{ t: 2.8, text: '1秒で [45円]', y: 480, size: 76, border: RED, sub: '÷30日÷86,400秒（試算）' }] : []; },
    tags(lt) { const t0 = 3.9; return lt > t0 ? [{ t: t0, text: 'マンション1戸より高い', x: 540, y: 1170, h: 76, bg: '#ffffff' }] : []; },
    note: '23区中古マンション平均8,818万円 アットホーム',
    act(lt, s) {
      const h = s.hero.userData; squash(s, lt, 0.92); place(s.hero, -0.8, 0.3, 0.2);
      if (lt < 1.15) { hold(s, 'slip', 'R', V(-0.48, 1.25, 0.6), 0); h.arm('L', 0.3, 0.3, 1.8); h.face({ lid: 0.2, brow: 0.3, look: [0.5, 0.6], mouth: 'smile' }); }
      else { h.arm('L', 0.4, 2.4, 0.3); h.arm('R', 0.4, 2.4, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.6, 0], mouth: 'o', open: 1.1 }); }
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) 2 years: rent passes the pay
  { sc: 'st', say: ['y2'], pre: 0.15, pal: ['#ff8a6b', '#fff0ea', '#2c3b6b'], show: ['coinsA', 'coinsB'], hud: ['2年後', '給料超え'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[1.1, 'text_pa', -10], [1.3, 'comic_shock2', -12]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '家賃 [45.6万] ＞ 給料', y: 480, size: 64, border: RED, sub: '給料 月34.1万円より 11.5万円多い（試算）' }] : []; },
    stamps: [{ t: 1.4, text: '赤字!!', x: 780, y: 1150, rot: 8, color: RED, size: 80, dur: 1.2 }],
    act(lt, s) {
      coins(s, 'coinsA', 0.45, 0.05, 22); coins(s, 'coinsB', 0.9, -0.25, Math.round(lerp(16, 32, ease(k(lt, 0.9, 1.5)))));
      const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.3);
      hold(s, 'pay', 'L', V(-0.62, 1.25, 0.7), 0.1); h.arm('R', 0.6, 0.6, 1.0); h.hand('R', 'pa');
      h.face(lt < 1.1 ? { lid: 0.3, brow: -0.4, look: [0.6, 0.3], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0.4], mouth: 'o', open: 1.1 });
    } },
  // 8) 5 years: 32 people share one room
  { sc: 'st', say: ['share'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], show: ['crowd'], hud: ['5年後', '32人でシェア'], hudColor: RED,
    cam: { p0: [0.0, 2.4, 5.4], p1: [0.0, 2.35, 5.1], l0: [0.0, 1.2, -0.3] },
    sfx: [[0.9, 'text_pa', -10], [1.5, 'comic_boyon', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '[32人] でルームシェア', y: 480, size: 66, border: RED, sub: '月365万円÷1人11.4万円（試算）' }] : []; },
    stamps: [{ t: 1.6, text: 'ぎゅう…', x: 300, y: 1180, rot: -8, color: '#ffffff', size: 66, dur: 1.2 }],
    act(lt, s) {
      const c = s.P.crowd; c.position.set(0, 0, -0.1); const sq = lerp(1, 0.75, ease(k(lt, 0.9, 1.5))); c.scale.set(sq, 1, 1);
      c.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 5 + i)) * 0.04; });
      const h = s.hero.userData; place(s.hero, 0.0, 0.6, 0); const w = lerp(1, 0.82, ease(k(lt, 0.9, 1.5))); h.body.scale.set(w, 1, 1);
      h.arm('L', 0.1, 0.0, 0.4); h.arm('R', 0.1, 0.0, 0.4);
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0, look: [0.5, 0], mouth: 'smile' } : { lid: 0.1, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.7 });
    } },
  // 9) half a tatami each
  { sc: 'st', say: ['tatami'], pre: 0.15, pal: ['#5a8a6b', '#e2f0e6', '#ffd23a'], show: ['tatami', 'crowd'], hud: ['1人分', '畳半分'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.8], p1: [0.0, 1.43, 4.5], l0: [0.0, 1.15, 0] },
    sfx: [[1.1, 'text_pa', -10], [1.9, 'comic_fall', -12]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '1人 [畳半分]', y: 480, size: 74, border: RED, sub: '30㎡÷32人＝0.94㎡（試算）' }] : []; },
    stamps: [{ t: 2.0, text: '寝返り ×', x: 780, y: 1170, rot: 6, color: '#ffffff', size: 66, dur: 1.4 }],
    act(lt, s) {
      const t = s.P.tatami; place(t, 0, 0.35);
      const c = s.P.crowd; c.position.set(0, 0, -0.35); c.scale.set(0.6, 1, 1);
      const h = s.hero.userData; place(s.hero, 0, 0.35, 0); s.hero.position.y = 0.05; h.body.scale.set(0.85, 1, 1);
      const wob = lt > 1.9 ? Math.sin(lt * 9) * 0.06 : 0; s.hero.rotation.z = wob;
      h.arm('L', 0.1, 0.0, 0.3); h.arm('R', 0.1, 0.0, 0.3);
      h.face(lt < 1.1 ? { lid: 0.3, brow: -0.3, look: [0, -0.6], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0], mouth: 'o', open: 0.9 });
    } },
  // 10) good news / bad news: the landlord is rich / nobody can pay
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], hero2: true, show: ['house', 'coinsA', 'coinsB'], hud: ['大家さん', '大金持ち?'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.6], p1: [0.0, 1.43, 5.3], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.2, 'sparkle', -14], [3.0, 'text_pa', -10], [4.0, 'comic_fall', -12]],
    cards(lt) { return lt < 2.95 ? (lt > 0.25 ? [{ t: 0.25, text: '大家さんは [大金持ち]', y: 480, size: 64, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.95, text: '[払える人] がいない', y: 480, size: 68, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.95, text: '空室…', x: 820, y: 1160, rot: 6, color: '#ffffff', size: 66, dur: 1.4 }],
    act(lt, s) {
      const ho = s.P.house; place(ho, 0.95, -0.7); ho.scale.setScalar(1.2);
      const good = lt < 2.95;
      coins(s, 'coinsA', 0.2, -0.1, good ? 32 : 0); coins(s, 'coinsB', 0.45, -0.3, good ? 32 : 0);
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.75, 0.3, 0.3); place(s.hero2, 0.0, 0.35, 0.1);
      if (good) { h2.reach('R', V(0.25, 1.6, -0.05)); h2.hand('R', 'pa'); h2.arm('L', 0.3, 2.4, 0.4); h2.hand('L', 'choki'); h2.face({ lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' });
        h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); h.face({ lid: 0.5, brow: -0.6, look: [0.6, 0], mouth: 'flat' }); }
      else { h2.arm('L', 0.5, 1.6, 0.6); h2.arm('R', 0.5, 1.6, 0.6); h2.hand('L', 'pa'); h2.hand('R', 'pa'); h2.face({ lid: 0, brow: -1, browY: 1, look: [0.5, 0], mouth: 'o', open: 1 });
        const p = hold(s, 'pay', 'R', V(-0.45, 1.25, 0.65), 0.05); p.visible = true; h.arm('L', 0.6, 0.6, 1.0); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: -1, look: [0.6, 0], mouth: 'o', open: 0.6 }); }
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['house'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: '東京に住む', x: 320, y: 1130, h: 110, bg: CY }, { t: t0 + 0.2, text: '地方へ引っ越す', x: 760, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const ho = s.P.house; place(ho, 0.75, -0.5); ho.scale.setScalar(1.3);
      const h = s.hero.userData; place(s.hero, -0.15, 0.2, 0.1);
      hold(s, 'slip', 'R', V(0.2, 1.3, 0.6), -0.05); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[家賃]が', '毎年2倍になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['家賃', '毎年2倍'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
