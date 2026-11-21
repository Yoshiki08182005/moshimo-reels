// ep50_nabe_mainichi (pop / arm C ニュース起点): もしも日本人全員が毎晩鍋を食べたら？
// 型は sp_geppu2x / ep49。台本・数字・小道具は自作。
// ニュース: 「この冬は鍋の頻度が増えそう」約8割、「味や具材がマンネリ化しやすい」75%（ミツカン 令和の家鍋あるある調査 2026）
// 前提（試算）: 人口 1.23億人、1人前 = 具とスープで500g（白菜100g・野菜200g・鍋つゆ1人前100円・塩分5g と仮定）
//   一晩 1.23億×0.5kg = 6.15万t ≒ 6万t ÷ 25mプール375m³ = 164杯 ≒ 160杯 / 直径50m×深さ30m の円柱 = 5.9万m³
//   鍋つゆ 1.23億×100円×365日 = 4.49兆円 ÷ 市場570億円（ミツカン 2025年）= 79倍
//   白菜 出荷量69.65万t（農水省 令和6年産）÷ 1.23億×0.1kg = 57日
//   野菜 200g ÷ 目標350g（厚労省 健康日本21）= 57% ≒ 6割 / 塩分 5g ÷ 男性の目標量7.5g未満（厚労省 食事摂取基準）= 67% ≒ 7割
import { run, THREE, V, clamp, ease, lerp, basic } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep50_nabe_mainichi.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#e86a3a', '#fff0e0', '#ffd23a'];

function potBody(parent) {
  cyl(1.0, 0.8, 0.6, '#6b3f2a', 0, 0.3, 0, parent);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.99, 0.07, 10, 40), M('#f2e6cf')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.6; rim.castShadow = true; parent.add(rim);
  cyl(0.95, 0.95, 0.02, '#f0b866', 0, 0.605, 0, parent);
  for (const sx of [-1, 1]) rbox(0.22, 0.09, 0.34, 0.04, '#6b3f2a', sx * 1.08, 0.5, 0, parent);
  // ingredients: napa cabbage, tofu, carrot, shiitake, leek
  for (const [x, z, r] of [[-0.45, 0.2, 0.4], [0.1, 0.45, -0.3], [0.45, -0.2, 1.1], [-0.2, -0.45, 0.9]]) { const c = sph(0.26, '#f6f3dc', x, 0.62, z, parent, 1, 0.22, 0.55); c.rotation.y = r; const g = sph(0.16, '#7cc464', x + Math.cos(r) * 0.2, 0.64, z - Math.sin(r) * 0.2, parent, 1, 0.25, 0.6); g.rotation.y = r; }
  for (const [x, z] of [[0.15, -0.05], [-0.55, -0.15], [0.6, 0.3]]) rbox(0.22, 0.12, 0.22, 0.03, '#fffaf0', x, 0.64, z, parent);
  for (const [x, z] of [[-0.1, 0.15], [0.35, 0.15], [-0.4, 0.55]]) cyl(0.08, 0.08, 0.03, '#ff8a3a', x, 0.635, z, parent);
  for (const [x, z] of [[0.0, -0.35], [-0.65, 0.3]]) sph(0.12, '#8a5a3a', x, 0.63, z, parent, 1, 0.45, 1);
}
function makeLid() { const l = G(); const d = new THREE.Mesh(new THREE.SphereGeometry(1.0, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2), M('#6b3f2a')); d.scale.y = 0.42; d.material.side = THREE.DoubleSide; d.castShadow = true; l.add(d);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 8, 36), M('#f2e6cf')); band.rotation.x = Math.PI / 2; band.position.y = 0.28; l.add(band);
  sph(0.13, '#f2e6cf', 0, 0.45, 0, l, 1, 0.7, 1); return l; }
function makeBowl(col) { const c = G(); const bw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(col, 0.45)); bw.material.side = THREE.DoubleSide; bw.position.y = 0.16; bw.castShadow = true; c.add(bw);
  cyl(0.15, 0.15, 0.01, '#f0b866', 0, 0.15, 0, c); sph(0.06, '#f6f3dc', 0.03, 0.16, 0.02, c, 1, 0.35, 0.7); rbox(0.06, 0.05, 0.06, 0.01, '#fffaf0', -0.06, 0.16, -0.02, c); return c; }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  for (const n of ['potG', 'potS']) { const g = G(); potBody(g); reg(n, g); }
  for (const n of ['lidG', 'lidS']) reg(n, makeLid());
  reg('bowl2', makeBowl('#3f6fd8')); reg('bowl3', makeBowl('#e2463c'));
  // steam puffs
  { const g = G(); g.userData.items = []; const sm = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.75, roughness: 1 });
    for (let i = 0; i < 10; i++) g.userData.items.push(sph(1, sm, 0, 0, 0, g)); reg('steam', g); }
  // napa cabbages (origin at the bottom)
  for (let i = 0; i < 7; i++) { const h = G(); sph(0.13, '#f6f3dc', 0, 0.2, 0, h, 1, 1.6, 1); sph(0.125, '#7cc464', 0, 0.37, 0, h, 1.05, 0.85, 1.05); reg('hk' + i, h); }
  // pool filled with soup (origin at the floor)
  { const g = G(); rbox(1.9, 0.32, 1.0, 0.04, '#ffffff', 0, 0.16, 0, g); rbox(1.72, 0.02, 0.82, 0.01, '#d99a4e', 0, 0.325, 0, g);
    for (const x of [-0.5, 0, 0.5]) sph(0.12, '#f6f3dc', x, 0.33, 0.1 - x * 0.2, g, 1, 0.25, 0.6); reg('pool', g); }
  // soup-base pack, salt shaker, money stack
  { const g = G(); rbox(0.17, 0.24, 0.06, 0.02, '#e2463c', 0, 0, 0, g); rbox(0.13, 0.1, 0.065, 0.01, '#fff4dc', 0, 0.02, 0, g); sph(0.03, '#e86a3a', 0, 0.02, 0.033, g, 1, 1, 0.2); reg('pack', g); }
  { const g = G(); cyl(0.07, 0.08, 0.2, '#ffffff', 0, 0.1, 0, g); cyl(0.072, 0.072, 0.06, '#c9d1dc', 0, 0.23, 0, g); sph(0.072, '#c9d1dc', 0, 0.26, 0, g, 1, 0.5, 1);
    for (const [x, z] of [[0, 0.03], [0.03, -0.01], [-0.03, -0.01]]) sph(0.008, '#23262f', x, 0.295, z, g); reg('salt', g); }
  { const g = G(); g.userData.items = []; for (let i = 0; i < 16; i++) { const b = rbox(0.36, 0.06, 0.18, 0.015, i % 2 ? '#5fae6b' : '#6fbf7a', 0, 0.03 + i * 0.062, 0, g); b.rotation.y = (i * 0.37) % 0.3 - 0.15; g.userData.items.push(b); } reg('cash', g); }
}

const place = (o, x, z, ry = 0, sc = 1, y = 0) => { o.visible = true; o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.setScalar(sc); return o; };
const hold = (s, name, side, p, who = s.hero, sc = 1) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); o.scale.setScalar(sc); who.userData.reach(side, p.clone().add(V(side === 'R' ? 0.12 : -0.12, 0.06, -0.02))); return o; };
function steam(s, lt, at, size, rise, t0 = 0) { const g = s.P.steam; g.visible = lt > t0; g.position.copy(at); g.scale.setScalar(1);
  g.userData.items.forEach((m, i) => { const u = ((lt - t0) * 0.6 + i / 10) % 1; m.position.set(Math.sin(i * 2.3 + lt * 1.5) * size * 0.8, u * rise, Math.cos(i * 1.7) * size * 0.5); m.scale.setScalar(size * (0.35 + u * 0.8)); }); }
// giant pot drops from the sky at t0 (lands at t0+0.12), the lid blasts off into the sky
function giantPot(s, lt, t0, px = 0.55, pz = -0.15, sc = 2.05) {
  const p = s.P.potG; const d = k(lt, t0 - 0.2, t0 + 0.12); place(p, px, pz, 0.3, sc, 9 * (1 - d) * (1 - d));
  const l = s.P.lidG; const u = k(lt, t0 + 0.14, t0 + 1.1); place(l, px + u * 1.5, pz + u * 0.6, 0, sc, p.position.y + 0.6 * sc + 9 * u * u + 2 * u); l.rotation.set(u * 2.5, 0, -u * 3.2);
  if (lt > t0 + 0.12) steam(s, lt, V(px, 0.62 * sc, pz), 0.55, 4.5, t0 + 0.12);
  return lt > t0 + 0.12;
}
// small pot on a desk at x=0.5 (lid off when open > 0)
function tablePot(s, lt, open = 1, x = 0.55) {
  place(s.P.desk, x, 0.25); place(s.P.potS, x, 0.25, 0.3, 0.27, 0.77);
  const l = s.P.lidS; place(l, x, 0.25, 0, 0.27, 0.77 + 0.16); l.visible = open < 1; if (open < 1) l.position.y += 0.35 * open;
  if (open > 0) steam(s, lt, V(x, 0.95, 0.25), 0.07, 0.6);
}
const handBowl = (s, side = 'R', who = s.hero, x = 0) => hold(s, who === s.hero ? 'bowl' : 'bowl2', side, V(who.position.x + (side === 'R' ? 0.2 : -0.2) + x, 0.9, who.position.z + 0.38), who, 0.75);

const plan = [
  // 0) cold open (flash-forward of the 50 m pot): a giant donabe slams down, the lid flies to the sky; push in to the hero slurping from a tiny bowl
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 2.3, 9.2], p1: [-0.75, 1.62, 4.0], l0: [0.2, 1.8, -0.4], l1: [-0.75, 1.42, 1.6], hold: 1.2, dur: 1.9 },
    shake: [[0.12, 0.09, 0.7]], lines: [[0.12, 0.9]],
    sfx: [[0.05, 'giant_fall', -10], [0.12, 'impact_doon', -9], [0.16, 'text_impact', -11], [0.35, 'whoosh_gust', -12], [1.4, 'whoosh_slide', -13], [2.2, 'comic_eat', -10]],
    stamps: [{ t: 0.14, text: '日本全員分!!', x: 540, y: 400, rot: -6, color: YEL, size: 90, dur: 1.15 },
      { t: 2.2, text: 'ハフッ', x: 640, y: 1430, rot: -5, color: '#ffffff', size: 58, dur: 0.75 }],
    act(lt, s) {
      giantPot(s, lt, 0.0); const h = s.hero.userData; place(s.hero, -0.75, 1.6, 0.25);
      if (lt < 1.3) { h.arm('R', 0.6, 1.3, 0.6); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); s.hero.rotation.y = lerp(0.25, -0.5, ease(k(lt, 0.1, 0.4)));
        h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.6], mouth: 'o', open: 1.1 }); }
      else { s.hero.rotation.y = lerp(-0.5, 0.05, ease(k(lt, 1.3, 1.8))); handBowl(s, 'R'); h.arm('L', 0.3, 0.3, 1.9);
        const eat = lt > 2.0; h.face(eat ? { lid: 0.7, brow: 0.6, look: [0, 0], mouth: 'o', open: 0.5 } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
        h.head.rotation.z = 0.08 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title: lifting the lid of a small donabe at home
  { sc: 'st', say: ['hook'], pal: ['#ffb84a', '#fff4dc', '#e2463c'], show: [],
    cam: { p0: [0.05, 1.5, 6.0], p1: [0.05, 1.48, 5.6], l0: [0.05, 1.2, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.2, 'comic_pico', -13]],
    stamps: [{ t: 1.6, text: '全員?!', x: 820, y: 1080, rot: 8, color: RED, size: 72, dur: 1.1 }],
    act(lt, s) {
      const o = ease(k(lt, 0.8, 1.3)); tablePot(s, lt, o, 0.4); const h = s.hero.userData; place(s.hero, -0.32, 0.5, 0.35);
      const l = s.P.lidS; h.reach('R', l.position.clone().add(V(-0.02, 0.14, 0))); h.hand('R', 'gu'); h.arm('L', 0.4, 0.5, 1.5); h.hand('L', 'pa');
      h.face(lt < 1.2 ? { lid: 0.2, brow: 0.4, look: [0.5, -0.3], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) news: 8 out of 10 say "more hot pots this winter"
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#e2463c'], show: [], hero2: true, hud: ['この冬', '鍋が増える'],
    cam: { p0: [0.0, 1.5, 7.4], p1: [0.0, 1.47, 7.0], l0: [0.0, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.3, 'comic_pico', -12], [1.6, 'comic_pico', -12]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '[8割]が「鍋が増えそう」', y: 480, size: 66, border: CY, sub: '物価高・外食ひかえ（ミツカン 2026）' }] : []; },
    tags(lt) { const t0 = 1.4; return lt > t0 ? [{ t: t0, text: '外食 ひかえる', x: 300, y: 1210, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '家で鍋!', x: 760, y: 1210, h: 96, bg: YEL }] : []; },
    note: 'ミツカン「令和の家鍋あるある調査2026」',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.62, 0.35, 0.3); place(s.hero2, 0.62, 0.35, -0.3);
      handBowl(s, 'R'); handBowl(s, 'L', s.hero2); const nod = Math.max(0, Math.sin(lt * 7)) * 0.12;
      h.arm('L', 0.4, 0.5, 1.5); h.hand('L', 'gu'); h2.arm('R', 0.6, 1.3, 0.6); h2.hand('R', 'pa');
      h.head.rotation.x = lt > 1.3 ? nod : 0; h2.head.rotation.x = lt > 1.5 ? nod : 0;
      h.face({ lid: 0.3, brow: 0.5, look: [0.4, 0], mouth: 'smile' }); h2.face({ lid: 0.2, brow: 0.5, look: [-0.4, 0], mouth: lt > 1.5 ? 'o' : 'smile', open: 0.6 });
    } },
  // 3) 500 g each -> 60,000 t a night (a pool full of soup)
  { sc: 'st', say: ['all'], pre: 0.15, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [], hud: ['一晩', '6万トン'],
    cam: { p0: [0.0, 2.0, 6.6], p1: [0.0, 1.95, 6.2], l0: [0.0, 1.0, -0.4] },
    sfx: [[0.3, 'text_pa', -10], [1.5, 'whoosh_slide', -13], [2.0, 'comic_surprise', -12]],
    cards(lt) { const b = this.lt.all + 1.5; return lt < b ? (lt > 0.4 ? [{ t: 0.4, text: '1人前 [500グラム]', y: 480, size: 72, border: CY, sub: '具とスープ（試算）' }] : [])
      : [{ t: b, text: '一晩 [6万トン]', y: 480, size: 76, border: YEL, sub: '1.23億人×500g（試算）' }]; },
    tags(lt) { const t0 = this.lt.all + 2.0; return lt > t0 ? [{ t: t0, text: '25mプール', x: 300, y: 1230, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '160杯分!', x: 760, y: 1230, h: 100, bg: YEL }] : []; },
    act(lt, s, gt, sh) {
      const b = sh.lt.all + 1.5; const h = s.hero.userData; place(s.hero, -0.3, 0.75, 0.3);
      const pl = s.P.pool; place(pl, 0.3, -1.0, -0.2, lerp(0.3, 1.25, ease(k(lt, b, b + 0.6)))); pl.visible = lt > b;
      if (lt < b) { handBowl(s, 'R'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki'); h.face({ lid: 0.3, brow: 0.5, look: [0, 0], mouth: 'smile' }); }
      else { h.arm('R', 1.2, 0.3, 0.1); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.8, browY: 1, look: [0.7, -0.1], mouth: 'o', open: 1.0 }); }
    } },
  // 4) one pot for everyone: 50 m across (the cold open, in its place)
  { sc: 'st', say: ['pot'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['鍋', '直径50m'],
    cam: { p0: [0.0, 2.3, 9.2], p1: [0.0, 2.2, 8.8], l0: [0.2, 1.8, -0.4] },
    shake: [[0.5, 0.08, 0.6]], lines: [[0.5, 0.8]],
    sfx: [[0.4, 'giant_fall', -11], [0.5, 'impact_doon', -10], [0.9, 'whoosh_gust', -13]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '直径 [50メートル]', y: 480, size: 76, border: YEL, sub: '深さ30mで約6万トン（試算）' }] : []; },
    act(lt, s) {
      giantPot(s, lt, 0.5); const h = s.hero.userData; place(s.hero, -0.75, 1.6, -0.5);
      h.arm('R', 0.6, 1.3, 0.6); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa');
      h.face(lt < 0.5 ? { lid: 0.2, brow: 0.3, look: [0.5, 0.4], mouth: 'flat' } : { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.6], mouth: 'o', open: 1.1 });
    } },
  // 5) soup-base sales x79
  { sc: 'st', say: ['tsuyu'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['鍋つゆ', '×79'],
    cam: { p0: [0.05, 1.5, 5.8], p1: [0.05, 1.47, 5.4], l0: [0.05, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.8, 'coin_toss', -12], [1.4, 'coin_toss', -12], [2.6, 'sparkle', -13]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '売上 [79倍]', y: 480, size: 78, border: YEL, sub: '1人前100円・毎晩（試算）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: 'いま 570億円', x: 300, y: 1230, h: 76, bg: '#ffffff' }, { t: t0 + 0.5, text: '毎晩 4.5兆円', x: 760, y: 1230, h: 100, bg: YEL }] : []; },
    note: '鍋つゆ市場 約570億円（ミツカン 2025年）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.25, 0.5, 0.3); const c = s.P.cash; place(c, 0.38, -0.3, -0.2);
      const n = Math.floor(lerp(2, 16, ease(k(lt, 0.6, 2.6)))); c.userData.items.forEach((m, i) => m.visible = i < n);
      const pk = hold(s, 'pack', 'R', V(0.05, 1.25, 0.9)); pk.rotation.z = Math.sin(lt * 6) * 0.15; h.arm('L', 0.6, 1.1, 0.6); h.hand('L', 'pa');
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.5, look: [0.4, 0], mouth: 'smile' } : { lid: 0.1, brow: 0.8, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 0.9 });
    } },
  // 6) vegetables: 60% of the daily target in one meal
  { sc: 'st', say: ['veg'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ff8f3a'], show: [], hud: ['野菜', '1食で6割'],
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.47, 4.5], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.2, 'comic_eat', -11], [2.2, 'emo_shine', -14]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '野菜 [1日の6割]', y: 480, size: 74, border: CY, sub: '1食200g÷目標350g（試算）' }] : []; },
    tags(lt) { const t0 = 1.5; return lt > t0 ? [{ t: t0, text: '目標 1日350g', x: 300, y: 1210, h: 76, bg: '#ffffff' }, { t: t0 + 0.4, text: '鍋1食 200g', x: 760, y: 1210, h: 100, bg: YEL }] : []; },
    note: '野菜の目標 1日350g（厚労省 健康日本21）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, 0, 0.4, 0); hold(s, 'hk0', 'R', V(0.32, 0.95, 0.75), s.hero, 1.1); hold(s, 'bowl3', 'L', V(-0.32, 0.95, 0.75), s.hero, 0.75);
      h.face(lt < 1.2 ? { lid: 0.2, brow: 0.4, look: [0.4, -0.2], mouth: 'smile' } : { lid: 0.6, brow: 0.6, look: [0, 0], mouth: 'smile' });
      h.head.rotation.z = Math.sin(lt * 3) * 0.06;
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); handBowl(s, 'R'); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); } },
  // 8) napa cabbage: a year's supply gone in 57 days
  { sc: 'st', say: ['hakusai'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#7cc464'], show: [], hud: ['白菜', 'あと57日'], hudColor: RED,
    cam: { p0: [0.15, 1.6, 6.2], p1: [0.15, 1.55, 5.8], l0: [0.15, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.9, 'vanish_hyun', -14], [1.4, 'vanish_hyun', -14], [1.9, 'vanish_hyun', -14], [2.6, 'comic_shock2', -12]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '白菜 [57日]で消える', y: 480, size: 68, border: RED, sub: '1人100g×1.23億人で毎晩1.2万t（試算）' }] : []; },
    note: '白菜の出荷量 69.7万t（農水省 令和6年産）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.28, 0.5, 0.3); const gone = Math.floor(k(lt, 0.8, 2.8) * 7);
      for (let i = 0; i < 7; i++) { const o = s.P['hk' + i]; const r = i < 4 ? 0 : 1; place(o, 0.0 + (i % 4) * 0.27 + r * 0.13, -0.15 - r * 0.3, i, 1.2); o.visible = i >= gone; }
      h.arm('R', 1.1, 0.4, 0.2); h.hand('R', 'pa'); h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa');
      h.face(lt < 1.5 ? { lid: 0.2, brow: -0.4, look: [0.7, -0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.6, -0.2], mouth: 'o', open: 1.0 });
    } },
  // 9) salt: drinking the soup = 70% of the daily target
  { sc: 'st', say: ['salt'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], show: [], hud: ['塩分', '1食で7割'], hudColor: RED,
    cam: { p0: [0.05, 1.5, 5.6], p1: [0.05, 1.47, 5.3], l0: [0.05, 1.2, 0] },
    sfx: [[0.3, 'comic_eat', -11], [1.6, 'text_pa', -10], [2.6, 'comic_surprise', -12]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '塩分 [約5グラム]', y: 480, size: 72, border: RED, sub: '目安7.5g未満の約7割（試算）' }] : []; },
    note: '食塩の目標量 男性7.5g未満（厚労省 食事摂取基準）',
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.22, 0.45, 0.25); place(s.P.salt, 0.42, -0.4, 0, lerp(1.5, 4.2, ease(k(lt, 1.4, 2.2))));
      const drink = lt < 1.4; const b = hold(s, 'bowl', 'R', drink ? V(-0.3, 1.55, 0.95) : V(-0.1, 0.95, 0.85), s.hero, 0.75); if (drink) b.rotation.x = 0.8;
      h.arm('L', 0.6, 0.5, 1.2); h.hand('L', 'pa');
      h.face(drink ? { lid: 0.8, brow: 0.5, look: [0, 0.4], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0.7, 0.1], mouth: 'o', open: 1.0 });
    } },
  // 10) good news (no menu planning) / bad news (75% are already bored)
  { sc: 'st', say: ['mannneri'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#5b4fd8'], show: [], hud: ['毎晩鍋', 'マンネリ'], hudColor: RED,
    cam: { p0: [0.05, 1.5, 5.8], p1: [0.05, 1.47, 5.4], l0: [0.05, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.9, 'comic_fall', -12], [3.1, 'text_pa', -10], [5.0, 'comic_jajean', -13]],
    cards(lt) { const b = 2.9; return lt < b ? (lt > 0.25 ? [{ t: 0.25, text: '献立に [悩まない]', y: 480, size: 72, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: b, text: '[75%]がマンネリ', y: 480, size: 72, border: RED, sub: '悪いニュース：今でも（ミツカン 2026）' }]; },
    stamps: [{ t: 3.4, text: 'また鍋…', x: 800, y: 1150, rot: 6, color: '#ffffff', size: 64, dur: 1.4 }],
    act(lt, s) {
      const b = 2.9; tablePot(s, lt, 1, 0.4); const h = s.hero.userData; place(s.hero, -0.25, 0.5, 0.3);
      if (lt < b) { handBowl(s, 'R'); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki'); h.face({ lid: 0.4, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { handBowl(s, 'R'); h.arm('L', 0.5, 0.3, 1.6); h.hand('L', 'gu'); s.hero.rotation.y = 0.15; h.head.rotation.z = -0.12;
        h.face({ lid: 0.75, brow: -0.6, look: [0.5, -0.3], mouth: 'flat' }); }
    } },
  // 11) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '毎晩鍋🍲', x: 320, y: 1130, h: 104, bg: YEL }, { t: t0 + 0.2, text: 'たまにでいい', x: 770, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05); handBowl(s, 'R'); steam(s, lt, V(0.1, 1.1, 0.6), 0.03, 0.35);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも全員が毎晩', '[鍋]を食べたら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['鍋', '毎晩'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
