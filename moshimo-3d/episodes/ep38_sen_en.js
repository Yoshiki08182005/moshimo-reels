// ep38_sen_en (pop / arm C ニュース起点→原因を拡大): もしも全員が毎日1,000円多く使ったら？
// 型は sp_geppu2x / ep37。台本・数字・小道具は自作。
// 入口のニュース: 2026年7〜9月期のGDPが4四半期ぶりのマイナス成長、個人消費が低迷（2026-11 報道）
// 前提（試算）: 人口 1億2,321万人（総務省 2025年10月概算）
//   1日 1億2,321万×1,000円 = 1,232億円、1年 ×365 = 45.0兆円
//   名目GDP 約600兆円（内閣府 国民経済計算 2024年）→ 45/600 = 7.5% ≒ 約7%（輸入・貯蓄の変化は無視した単純計算）
//   消費税 45兆円×8〜10% = 3.6〜4.5兆円 ≒ 約4兆円
//   コンビニ 約5万6千店（日本フランチャイズチェーン協会 2024年）で割ると 1店1日 約220万円
//   4人家族 1,000円×4人×365日 = 146万円
//   1日1万円 ×365 = 365万円、平均給与478万円（国税庁 民間給与実態統計調査 2024年分）の76% ≒ 約8割
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep38_sen_en.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#ff8fb3', '#fff0f5', '#ffd23a'], MAIN = ['#4fb3ff', '#e8f5ff', '#ffd23a'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
const BAG_COL = ['#f2c27a', '#ff7a6b', '#7bd88f', '#5aa9ff', '#c79bff', '#ffffff'];
const PILES = [[-1.0, 0.2], [1.0, 0.2], [-0.75, -0.65], [0.75, -0.65], [-1.6, -0.4], [1.6, -0.4], [0, -1.3]];
const BGP = (() => { const r = rng(11), a = []; for (let i = 0; i < 35; i++) { const p = PILES[i % PILES.length]; a.push([p[0] + (r() - 0.5) * 0.12, p[1] + (r() - 0.5) * 0.12, Math.floor(i / PILES.length), (r() - 0.5) * 1.2, r()]); } return a; })();

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // rain of shopping bags
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < 35; i++) { const c = P.bag.clone(); c.children[0].material = M(BAG_COL[i % BAG_COL.length], 0.8); c.visible = true; g.add(c); g.userData.items.push(c); } reg('bagRain', g); }
  // big 1,000-yen note (held up)
  { const b = G(); rbox(0.5, 0.25, 0.012, 0.01, '#7aa6d8', 0, 0, 0, b);
    const fm = label(400, 200, (c) => { c.fillStyle = '#dbe9f7'; c.fillRect(0, 0, 400, 200); c.strokeStyle = '#3d6fa8'; c.lineWidth = 10; c.strokeRect(8, 8, 384, 184);
      c.fillStyle = '#2b4f7e'; c.font = 'bold 92px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1000', 200, 92); c.font = 'bold 40px sans-serif'; c.fillText('円', 330, 150); });
    for (const z of [0.007, -0.007]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.23), fm); f.position.z = z; if (z < 0) f.rotation.y = Math.PI; b.add(f); } reg('yen', b); }
  // TV with a GDP bar chart
  { const t = G(); rbox(1.0, 0.36, 0.4, 0.03, '#8a5a34', 0, 0.18, 0, t); rbox(1.2, 0.72, 0.08, 0.03, '#23262f', 0, 0.78, 0, t);
    const sm = label(512, 300, (c) => { c.fillStyle = '#f4f7fb'; c.fillRect(0, 0, 512, 300); c.fillStyle = '#22252d'; c.font = 'bold 56px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('GDP', 24, 46);
      c.strokeStyle = '#9aa3ad'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, 190); c.lineTo(490, 190); c.stroke();
      [40, 55, 30, 45].forEach((h, i) => { c.fillStyle = '#4fb3ff'; c.fillRect(70 + i * 90, 190 - h, 60, h); });
      c.fillStyle = '#e2463c'; c.fillRect(430, 190, 60, 70); c.font = 'bold 64px sans-serif'; c.fillText('▼', 420, 100); });
    sm.emissive = new THREE.Color('#ffffff'); sm.emissiveMap = sm.map; sm.emissiveIntensity = 0.45;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), sm); f.position.set(0, 0.78, 0.042); t.add(f); reg('tv', t); }
  // shop sign
  { const s = G(); rbox(0.9, 0.3, 0.04, 0.03, '#3fae5b', 0, 0, 0, s);
    const fm = label(512, 170, (c) => { c.fillStyle = '#3fae5b'; c.fillRect(0, 0, 512, 170); c.fillStyle = '#ffffff'; c.font = 'bold 96px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('コンビニ', 256, 88); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.28), fm); f.position.z = 0.022; s.add(f); reg('shopSign', s); }
  // price tag on a stick (userData.set(i) switches 150 -> 300 円)
  { const s = G(); cyl(0.015, 0.015, 0.5, '#9aa3ad', 0, 0.25, 0, s);
    const mk = (txt, col) => label(300, 160, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 300, 160); c.strokeStyle = col; c.lineWidth = 14; c.strokeRect(7, 7, 286, 146);
      c.fillStyle = col; c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 150, 84); });
    const ms = [mk('150円', '#2c3b6b'), mk('300円', '#e2463c')]; rbox(0.44, 0.25, 0.03, 0.02, '#ffffff', 0, 0.62, 0, s);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.22), ms[0]); f.position.set(0, 0.62, 0.017); s.add(f); s.userData.set = (i) => { f.material = ms[i]; }; reg('tag', s); }
  // salary envelope
  { const e = G(); rbox(0.3, 0.19, 0.012, 0.01, '#f2e3c2', 0, 0, 0, e);
    const fm = label(256, 160, (c) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#22252d'; c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('年収', 128, 58); c.font = 'bold 38px sans-serif'; c.fillText('478万円', 128, 122); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.17), fm); f.position.z = 0.008; e.add(f); reg('pay', e); }
}

// bags fall from the sky from t0 and stack into piles around (not on) the hero
function rain(s, lt, t0, n = 35) {
  const g = s.P.bagRain; g.visible = true;
  g.userData.items.forEach((c, i) => {
    const [x, z, layer, ry, r] = BGP[i]; const d = lt - t0 - i * 0.035 - r * 0.08;
    if (i >= n || d < 0) { c.visible = false; return; } c.visible = true;
    const rest = layer * 0.42, y0 = 4.6 + r * 1.2, y = Math.max(rest, y0 - 0.5 * 14 * d * d);
    c.position.set(x, y, z); c.scale.setScalar(1.3); c.rotation.set(0, ry + (y > rest ? d * 3 : 0), y > rest ? d * 2 : 0);
  });
}
const hold = (s, name, side, p, rz = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const stack = (s, name, x, z, n) => { const c = s.P[name]; c.visible = true; c.position.set(x, 0, z); c.userData.items.forEach((it, i) => { it.visible = i < n; }); return c; };

const plan = [
  // 0) cold open (flash-forward of #3): one 1,000-yen note up -> the whole country's shopping bags rain down; push in, smug face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.1, 1.7, 6.6], p1: [0.0, 1.46, 2.6], l0: [0.0, 1.2, -0.4], l1: [0.0, 1.44, 0.3], hold: 1.4, dur: 2.2 },
    shake: [[0.3, 0.07, 0.8]], lines: [[0.25, 0.9]],
    sfx: [[0.15, 'whoosh_gust', -10], [0.35, 'impact_doon', -9], [0.6, 'giant_step', -13], [0.9, 'impact_don', -13], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.25, text: '1日 1,232億円!!', x: 560, y: 520, rot: -6, color: YEL, size: 104, dur: 1.15 },
      { t: 2.3, text: 'おつりは いいです', x: 380, y: 1190, rot: -6, color: '#ffffff', size: 56, dur: 0.7 }],
    act(lt, s) {
      rain(s, lt, 0.15); s.hero.position.set(0, 0, 0.3); const h = s.hero.userData;
      if (lt < 1.4) { hold(s, 'yen', 'R', V(0.45, 1.75, 0.45), 0.15); h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.face(lt < 0.3 ? { lid: 0.2, look: [0, 0.6], mouth: 'smile' } : { lid: 0, brow: -0.6, browY: 1, look: [0.3, 0.8], mouth: 'o', open: 1.1 }); }
      else { hold(s, 'yen', 'R', V(0.42, 1.25, 0.5), 0.1); h.arm('L', 0.4, 0.6, 1.6); h.hand('L', 'choki'); h.face({ lid: 0.7, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 2.0, 2.4)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: MAIN, show: ['bag'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.8, 'coin_toss', -12]],
    stamps: [{ t: 1.8, text: '+1,000円!', x: 790, y: 1080, rot: 8, color: RED, size: 66, dur: 1.4 }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0.3); s.hero.rotation.y = 0.15;
      hold(s, 'yen', 'R', V(0.35, 1.3 + Math.sin(lt * 5) * 0.03, 0.5), 0.1);
      s.P.bag.position.set(-0.6, 0, 0.45); h.reach('L', V(-0.58, 0.48, 0.45)); h.hand('L', 'gu');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.2, look: [0.3, 0], mouth: 'smile' } : { lid: 0, brow: 0.5, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) news: GDP minus
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: ['tv'], hud: ['GDP', 'マイナス'], hudColor: RED,
    cam: { p0: [0.1, 1.45, 5.2], p1: [0.1, 1.43, 4.9], l0: [0.1, 1.2, 0] },
    sfx: [[0.2, 'text_touch', -12], [1.4, 'comic_fall', -12]],
    tags(lt) { return lt > this.lt.news + 1.2 ? [{ t: this.lt.news + 1.2, text: '個人消費が低迷', x: 560, y: 1130, h: 76, bg: '#ffffff' }] : []; },
    note: '2026年7〜9月期 1次速報（内閣府・報道）',
    act(lt, s) {
      s.P.tv.position.set(0.55, 0, -0.4); s.P.tv.rotation.y = -0.3;
      const h = s.hero.userData; s.hero.position.set(-0.55, 0, 0.3); s.hero.rotation.y = 0.35;
      h.reach('R', V(0.05, 0.95, -0.15)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.3, 1.9);
      h.face(lt < 1.4 ? { lid: 0.2, brow: 0, look: [0.8, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0], mouth: 'o', open: 0.8 });
    } },
  // 3) 1 day = 123.2 billion yen (the cold open, in its place)
  { sc: 'st', say: ['day'], pre: 0.15, hold: 0.2, pal: HOOK, show: [], hud: ['全員', '+1,000円/日'], hudColor: YEL,
    cam: { p0: [0.1, 1.7, 6.6], p1: [0.1, 1.66, 6.2], l0: [0.0, 1.2, -0.4] },
    shake: [[0.6, 0.05, 0.6]],
    sfx: [[0.5, 'whoosh_gust', -12], [0.7, 'impact_doon', -11], [1.3, 'impact_don', -14], [2.4, 'text_pa', -10]],
    cards(lt) { return lt > 2.3 ? [{ t: 2.3, text: '1日 [1,232億円]', y: 480, size: 68, border: YEL, sub: '1億2,321万人×1,000円（試算）' }] : []; },
    note: '人口は総務省 2025年10月概算',
    act(lt, s) {
      rain(s, lt, 0.5); s.hero.position.set(0, 0, 0.3); const h = s.hero.userData;
      hold(s, 'yen', 'R', V(0.45, 1.7, 0.45), 0.15); h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.1, brow: 0.5, look: [0, 0.7], mouth: 'o', open: 0.9 });
    } },
  // 4) 1 year = 45 trillion, GDP +7%
  { sc: 'st', say: ['year'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#3f6fd8'], show: [], hud: ['1年', '45兆円'],
    cam: { p0: [0.0, 1.45, 5.0], p1: [0.0, 1.43, 4.7], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'coin_toss', -13], [0.9, 'coin_toss', -14], [1.6, 'text_pa', -10], [2.6, 'sparkle', -14]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '1年 [45兆円]', y: 480, size: 70, border: YEL, sub: '1,232億円×365日（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.year + 2.2; return lt > t0 ? [{ t: t0, text: 'GDP 約7%アップ', x: 600, y: 1130, h: 88, bg: CY }] : []; },
    note: '名目GDP約600兆円（内閣府 国民経済計算2024年）',
    act(lt, s) {
      const n = Math.round(4 + 28 * ease(k(lt, 0.2, 2.6)));
      stack(s, 'coinsA', 0.35, 0.0, n); stack(s, 'coinsB', 0.75, -0.25, Math.max(0, n - 6));
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.3;
      h.reach('R', V(0.3, 0.12 + n * 0.028, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'gu');
      h.face(lt < 1.4 ? { lid: 0.1, brow: 0, look: [0.7, 0.3], mouth: 'o', open: 0.5 } : { lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' });
    } },
  // 5) consumption tax +4 trillion
  { sc: 'st', say: ['tax'], pre: 0.15, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: [], hud: ['消費税', '+約4兆円'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.43, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'coin_toss', -13], [1.2, 'text_pa', -10]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '消費税 [+約4兆円]', y: 480, size: 66, border: CY, sub: '45兆円×8〜10%（試算）' }] : []; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero.position.set(-0.66, 0, 0.2); s.hero.rotation.y = 0.3; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.3;
      const u = k(lt, 0.2, 1.0); const p = V(lerp(-0.3, 0.3, u), 1.1 + Math.sin(u * Math.PI) * 0.3, 0.35);
      s.P.yen.visible = true; s.P.yen.position.copy(p); s.P.yen.rotation.set(0, 0, 0.2);
      if (u < 1) h.reach('R', V(-0.2, 1.05, 0.35)); else h.arm('R', 0.3, 0.4, 0.4);
      h2.reach('L', V(0.35, 1.0, 0.35)); h2.hand('L', 'pa'); h2.arm('R', 0.3, 2.4, 0.4); h2.hand('R', 'gu');
      h2.face({ lid: 0.3, brow: 0.5, mouth: 'smile', look: [-0.4, 0] });
      h.face(lt < 1.0 ? { lid: 0.2, brow: 0, mouth: 'smile', look: [0.5, 0] } : { lid: 0, brow: -0.5, browY: 1, mouth: 'o', open: 0.7, look: [0.5, 0] });
    } },
  // 6) all at convenience stores: 2.2M yen per store per day
  { sc: 'st', say: ['konbini'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['counter', 'shopSign', 'crowd'], hud: ['コンビニ', '1店220万円'],
    cam: { p0: [0.0, 1.5, 5.2], p1: [0.0, 1.48, 4.9], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_touch', -12], [1.2, 'coin_toss', -13], [2.2, 'text_pa', -10]],
    cards(lt) { return lt > 2.1 ? [{ t: 2.1, text: '1店1日 [220万円]', y: 480, size: 68, border: YEL, sub: '1,232億円÷約5万6千店（試算）' }] : []; },
    stamps: [{ t: 0.5, text: 'レジ大行列', x: 760, y: 1220, rot: 6, color: '#ffffff', size: 56, dur: 1.6 }],
    note: '店舗数は日本フランチャイズチェーン協会2024年',
    act(lt, s) {
      s.P.counter.position.set(-0.3, 0, -0.2); s.P.counter.scale.set(0.7, 1, 0.8); s.P.shopSign.position.set(-0.3, 2.25, -1.0);
      s.P.crowd.position.set(0.35, 0, -1.3); s.P.crowd.scale.setScalar(0.8); s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 6 + i)) * 0.04; });
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, -0.95); s.hero.rotation.y = 0.1; h.body.position.y = Math.abs(Math.sin(lt * 10)) * 0.04;
      h.reach('R', V(-0.15, 1.0, -0.2)); h.reach('L', V(-0.75, 1.0, -0.2));
      h.face(lt < 2.1 ? { lid: 0.2, brow: -0.3, look: [0.4, -0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) family of 4: 1.46M yen a year, savings melt
  { sc: 'st', say: ['family'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.85, hero2: true, show: [], hud: ['4人家族', '年146万円'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.0], p1: [0.0, 1.43, 4.7], l0: [0.0, 1.2, 0] },
    sfx: [[0.4, 'coin_toss', -14], [1.0, 'coin_toss', -14], [1.6, 'text_pa', -10], [2.6, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '年 [146万円]', y: 480, size: 70, border: RED, sub: '1,000円×4人×365日（試算）' }] : []; },
    act(lt, s) {
      const n = Math.round(32 - 29 * ease(k(lt, 0.3, 2.6))); stack(s, 'coinsA', 0.0, 0.1, n);
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero.position.set(-0.68, 0, 0.2); s.hero.rotation.y = 0.3; s.hero2.position.set(0.68, 0, 0.1); s.hero2.rotation.y = -0.3;
      h.reach('R', V(-0.15, 0.15 + n * 0.028, 0.1)); h.hand('R', 'pa'); h2.reach('L', V(0.15, 0.15 + n * 0.028, 0.1)); h2.hand('L', 'pa');
      h2.face({ lid: 0, brow: -0.8, browY: 1, mouth: 'o', open: 0.6, look: [-0.5, -0.3] });
      h.face(lt < 1.5 ? { lid: 0.1, brow: -0.3, look: [0.5, -0.3], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 9) shortages and price rise
  { sc: 'st', say: ['price'], pre: 0.15, pal: ['#ff9f5a', '#fff1e2', '#e2463c'], show: ['onigiri', 'tag'], hud: ['品切れ', '値上がり'], hudColor: RED,
    cam: { p0: [0.1, 1.42, 5.2], p1: [0.1, 1.4, 4.9], l0: [0.1, 1.1, 0] },
    sfx: [[0.2, 'whoosh_slide', -13], [1.3, 'comic_surprise', -12], [1.5, 'text_pa', -10]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: 'おにぎり [2倍の値段]?', y: 480, size: 64, border: RED, sub: '買う人が多すぎると物が足りない（たとえ）' }] : []; },
    act(lt, s) {
      const o = s.P.onigiri; o.position.set(0.45, 0.0, -0.1); o.scale.setScalar(1.8); const n = Math.round(23 - 18 * ease(k(lt, 0.1, 1.2))); o.userData.items.forEach((it, i) => { it.visible = i < n; });
      const t = s.P.tag; t.position.set(0.95, 0, -0.5); t.rotation.y = -0.3; t.userData.set(lt > 1.3 ? 1 : 0); t.scale.setScalar(lt > 1.3 ? 1 + 0.25 * ease(k(lt, 1.3, 1.6)) : 1);
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.3;
      h.reach('R', V(0.1, 0.55, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.3, 1.9);
      h.face(lt < 1.3 ? { lid: 0.2, brow: -0.4, look: [0.7, -0.3], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.8, 0], mouth: 'o', open: 1.1 });
    } },
  // 10) 10,000 yen a day: 80% of average pay
  { sc: 'st', say: ['man'], pre: 0.15, pal: ['#c0392b', '#ffe3df', '#ffd23a'], dim: 0.9, show: [], hud: ['1日1万円', '年365万円'], hudColor: RED,
    cam: { p0: [-0.05, 1.45, 4.9], p1: [-0.05, 1.43, 4.6], l0: [-0.05, 1.2, 0] },
    sfx: [[0.3, 'whoosh_switch1', -13], [1.6, 'text_pa', -10], [2.8, 'comic_fall', -12]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '年 [365万円]', y: 480, size: 70, border: RED, sub: '1万円×365日（試算）' }] : []; },
    tags(lt) { const t0 = this.lt.man + 2.3; return lt > t0 ? [{ t: t0, text: '平均年収の 約8割', x: 600, y: 1130, h: 84, bg: '#ffffff' }] : []; },
    note: '平均給与478万円（国税庁 2024年分）',
    act(lt, s) {
      const n = Math.round(30 - 26 * ease(k(lt, 1.5, 3.2))); stack(s, 'coinsA', 0.55, 0.1, n);
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0.3); s.hero.rotation.y = 0.3;
      hold(s, 'pay', 'L', V(-0.5, 1.15 + Math.sin(lt * 3) * 0.02, 0.6), 0.1); h.reach('R', V(0.3, 0.15 + n * 0.028, 0.1)); h.hand('R', 'pa');
      h.face(lt < 1.5 ? { lid: 0.1, brow: -0.3, look: [0.7, 0.2], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: ['bag'],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: '使う', x: 320, y: 1040, h: 124, bg: CY }, { t: t0 + 0.2, text: 'ためる', x: 760, y: 1040, h: 110, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1170, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1450, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.1, 0, 0.2); s.hero.rotation.y = 0.05;
      hold(s, 'yen', 'R', V(0.4, 1.2, 0.45), 0.1); s.P.bag.position.set(-0.55, 0, 0.35); h.reach('L', V(-0.53, 0.48, 0.35)); h.hand('L', 'gu');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも全員が毎日', '[1,000円]多く使ったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['全員', '+1,000円/日'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
