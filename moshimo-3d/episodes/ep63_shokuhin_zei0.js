// ep63_shokuhin_zei0 (pop / arm C ニュース起点): もしも食べ物の消費税がゼロになったら？
// 入口：食料品の消費税減税の法案が国会で話題（2026-11）。政治家・政党の名前は出さない。型は sp_geppu2x / ep62。台本・数字・小道具は自作。
// 前提（試算）:
//   食料品は軽減税率8%、店内飲食（外食）は10%。外食は対象外のまま、食料品（持ち帰り）だけ0%と仮定
//   税抜3,000円の買い物: 3,000×1.08 = 3,240円 → 3,000円
//   家計の負担軽減 1世帯 年8.8万円・税収減 年4.8兆円（大和総研 2026年1月の試算）
//   8.8万円÷おにぎり200円 = 440個/年（1日1.2個）。4.8兆円÷1億2,400万人 = 3.9万円/人
//   1万円札4.8億枚×厚さ0.1mm = 48km。所得上位2割の世帯の恩恵は下位2割の約2倍（大和総研）
//   ランチ税抜1,000円: 店内1,100円、持ち帰り1,080円→1,000円（差20円→100円）
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep63_shokuhin_zei0.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff8a3d', '#fff0e0', '#ffd23a'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  const mkTag = (name, text, w = 0.56, bg = '#ffd23a', fg = '#e2463c') => { const t = G(); const pw = Math.round(w * 500);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.26), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(pw, 130, (c) => {
      c.fillStyle = bg; c.fillRect(0, 0, pw, 130); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(4, 4, pw - 8, 122);
      c.fillStyle = fg; c.font = 'bold 60px sans-serif'; c.textAlign = 'center'; c.fillText(text, pw / 2, 88); }) }));
    t.add(m); reg(name, t); };
  mkTag('t3240', '3,240円', 0.7); mkTag('t3000', '3,000円', 0.7, '#ffffff', '#2fa36b');
  mkTag('tIn', '店内 1,100円', 0.9, '#ffffff', '#e2463c'); mkTag('tOut', '持ち帰り 1,000円', 1.05, '#ffd23a', '#2fa36b');
  // round red "8%" tax badge (flies away)
  { const t = G(); const m = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: canvasTex(160, 160, (c) => {
      c.fillStyle = '#e2463c'; c.beginPath(); c.arc(80, 80, 78, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.arc(80, 80, 68, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#fff'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('税', 80, 62); c.font = 'bold 54px sans-serif'; c.fillText('8%', 80, 116); }) }));
    t.add(m); reg('pct', t); }
  // single onigiri in hand
  { const o = G(); sph(0.085, '#ffffff', 0, 0, 0, o, 1.08, 0.95, 0.72); rbox(0.1, 0.085, 0.13, 0.02, '#20301f', 0, -0.035, 0, o); reg('nig', o); }
  // tower of 10,000-yen bills (scale.y = height), with lighter stripes, and clouds
  { const g = G(); const col = G(); g.add(col); rbox(0.42, 1, 0.24, 0.02, '#5fae6b', 0, 0.5, 0, col);
    for (let i = 0; i < 40; i++) rbox(0.43, 0.012, 0.245, 0.004, '#cfe9c8', 0, 0.025 * i + 0.0125, 0, col).scale.set(1, 1, 1);
    g.userData.col = col; reg('tower', g); }
  { const g = G(); for (const [x, y, z, r] of [[-1.2, 0, 0, 0.35], [-0.8, 0.05, 0.1, 0.45], [-0.35, 0, 0, 0.3], [0.5, 0.02, 0.1, 0.4], [0.95, 0, 0, 0.32], [1.3, 0.04, 0.05, 0.28]])
      sph(r, M('#ffffff', 1), x, y, z, g, 1.3, 0.7, 0.8); reg('clouds', g); }
  // dark hole in the floor
  { const g = G(); const d = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: '#0e0f16' })); d.rotation.x = -Math.PI / 2; d.position.y = 0.01; g.add(d);
    const r = new THREE.Mesh(new THREE.RingGeometry(1, 1.08, 48), M('#5b4a3a')); r.rotation.x = -Math.PI / 2; r.position.y = 0.012; g.add(r); reg('hole', g); }
  // falling coins (items)
  { const g = G(); g.userData.items = []; for (let i = 0; i < 10; i++) { const c = cyl(0.09, 0.09, 0.025, M('#ffc533', 0.35), 0, 0, 0, g); c.rotation.x = 1.2; g.userData.items.push(c); } reg('fall', g); }
  // park bench
  { const b = G(); rbox(1.5, 0.08, 0.42, 0.03, '#c98f4a', 0, 0.46, 0, b); rbox(1.5, 0.3, 0.06, 0.03, '#c98f4a', 0, 0.78, -0.2, b);
    for (const x of [-0.65, 0.65]) rbox(0.08, 0.46, 0.38, 0.02, '#3a3f4a', x, 0.23, 0, b); rbox(1.4, 0.05, 0.36, 0.02, '#ffffff', 0, 0.515, 0.02, b); reg('bench', b); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, who = 'hero') => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz);
  s[who].userData.reach(side, p.clone().add(V(side === 'R' ? 0.08 : -0.08, -0.05, -0.02))); return o; };
const tagAt = (s, name, x, y, z, lt = 0) => { const t = s.P[name]; t.visible = true; t.position.set(x, y, z); t.rotation.set(0, 0, Math.sin(lt * 3) * 0.04); return t; };
function pyramid(s, x, z, y0, sc, drop = 1) { const o = s.P.onigiri; o.visible = true; o.position.set(x, y0 + 3.0 * (1 - drop * drop), z); o.scale.setScalar(sc);
  o.userData.items.forEach((it) => { it.visible = true; }); return o; }
function snow(s, lt) { s.P.snow.visible = true; s.P.snow.userData.items.forEach((m, i) => { const u = (lt * 0.25 + (i * 0.618) % 1) % 1;
  m.position.set(Math.sin(i * 12.9) * 1.8 + Math.sin(lt + i) * 0.05, 3.0 - u * 3.0, -1.6 + (i % 5) * 0.55); }); }

// cold open / recall: at the register the red "税8%" badge is kicked into the sky, the price drops to 3,000 and a pyramid of onigiri lands
function register(s, lt, t0) {
  place(s.P.counter, 0.75, -0.55); const pre = lt < t0;
  tagAt(s, pre ? 't3240' : 't3000', 0.75, 1.75, -0.3, lt);
  const b = s.P.pct; b.visible = true; const u = k(lt, t0, t0 + 0.9);
  const u2 = k(lt, t0, t0 + 1.6); b.position.set(1.1 + 1.2 * u2, 1.9 + 1.6 * u2 + 0.5 * Math.sin(u2 * Math.PI), -0.25 + 1.2 * u2); b.rotation.set(0, 0, -u2 * 12); b.scale.setScalar(1.6 + (pre ? 0.08 * Math.sin(lt * 12) : 1.2 * u2)); b.visible = u2 < 1;
  pyramid(s, 0.75, -0.45, 0.93, 1.25, ease(k(lt, t0 + 0.05, t0 + 0.3)));
  return !pre;
}

const plan = [
  // 0) cold open (flash-forward of #5): the 8% badge flies off into the sky, onigiri pile lands -> push in, smug face "…おかわり♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.3, 1.5, 6.6], p1: [-0.3, 1.47, 3.4], l0: [0.4, 1.3, -0.3], l1: [-0.3, 1.44, 0.4], hold: 1.2, dur: 2.2 },
    shake: [[0.3, 0.08, 0.6]], lines: [[0.15, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -12], [0.12, 'impact_doon', -9], [0.32, 'coin_toss', -11], [0.2, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.15, text: '消費税 ゼロ!!', x: 540, y: 400, rot: -6, color: YEL, size: 96, dur: 1.15 },
      { t: 2.3, text: '…おかわり♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 64, dur: 0.7 }],
    act(lt, s) { const on = register(s, lt, 0.1); const h = s.hero.userData; place(s.hero, -0.3, 0.45, 0.15);
      if (!on) { h.reach('R', V(0.25, 1.15, 0.0)); h.hand('R', 'pa'); h.face({ lid: 0.3, brow: 0.2, look: [0.6, 0.2], mouth: 'smile' }); }
      else if (lt < 1.3) { h.arm('L', 0.3, 2.6, 0.3); h.arm('R', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.5], mouth: 'o', open: 1.1 }); }
      else { hold(s, 'nig', 'R', V(0.12, 1.12, 0.78)); s.P.nig.scale.setScalar(1.5); h.arm('L', 0.3, 0.4, 1.5); h.hand('L', 'choki');
        h.face({ lid: 0.45, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); } } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#7bd88f', '#effbf1', '#ff8a3d'], show: ['counter'],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.8, 'comic_surprise', -12]],
    stamps: [{ t: 1.9, text: 'ゼロ!?', x: 800, y: 1080, rot: 8, color: RED, size: 76, dur: 1.0 }],
    act(lt, s) { place(s.P.counter, 0.2, -0.9); const h = s.hero.userData; place(s.hero, 0.0, 0.4);
      hold(s, 'nig', 'R', V(0.42, 1.45 + 0.04 * Math.sin(lt * 4), 0.55)); s.P.nig.scale.setScalar(1.4); h.arm('L', 0.3, 2.5, 0.4); h.hand('L', 'pa');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 2) now: food 8%, eat-in 10%
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [], hud: ['食べ物の消費税', '8%'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.4, 'text_pa', -10], [1.6, 'text_pa', -10]],
    tags(lt) { return lt > 0.4 ? [{ t: 0.4, text: '食べ物 8%', x: 300, y: 1560, h: 96, bg: YEL }].concat(lt > 1.6 ? [{ t: 1.6, text: '店内 10%', x: 770, y: 1560, h: 96, bg: '#ffffff' }] : []) : []; },
    note: '軽減税率（2019年10月〜）',
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0.0, 0.3); const b = s.P.pct; b.visible = true; b.position.set(0.72, 1.85, 0.3); b.scale.setScalar(1.3); b.rotation.z = Math.sin(lt * 3) * 0.1;
      hold(s, 'nig', 'L', V(-0.42, 1.25, 0.6)); s.P.nig.scale.setScalar(1.4); h.reach('R', V(0.55, 1.65, 0.35)); h.hand('R', 'choki');
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.3, look: [0.6, 0.5], mouth: 'smile' } : { lid: 0.1, brow: -0.3, look: [0.3, 0.2], mouth: 'flat' }); } },
  // 3) register: 3,240 -> 3,000
  { sc: 'st', say: ['reji'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['レジ', '−240円'], hudColor: YEL,
    cam: { p0: [0.1, 1.55, 5.4], p1: [0.1, 1.5, 5.0], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'whoosh_switch1', -12], [1.75, 'coin_toss', -12], [1.8, 'text_pa', -10]],
    cards(lt) { return lt > 1.7 ? [{ t: 1.7, text: '[3,000円] ピッタリ', y: 480, size: 72, border: CY, sub: '税抜3,000円の買い物（試算）' }] : []; },
    act(lt, s) { place(s.P.counter, 0.65, -0.55); const sw = lt > 1.6; tagAt(s, sw ? 't3000' : 't3240', 0.65, 1.7, -0.3, lt);
      s.P.bag.visible = true; s.P.bag.position.set(0.35, 0.93, -0.4); s.P.bag.scale.setScalar(1.3);
      const h = s.hero.userData; place(s.hero, -0.4, 0.35, 0.2); h.reach('R', V(0.15, 1.1, 0.2)); h.hand('R', 'pa');
      if (!sw) { h.arm('L', 0.3, 0.3, 0.3); h.face({ lid: 0.1, brow: 0.2, look: [0.7, 0.4], mouth: 'flat' }); }
      else { h.arm('L', 2.5, 0.6, 0.2); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.4], mouth: 'o', open: 1 }); } } },
  // 4) a household: 88,000 yen a year
  { sc: 'st', say: ['year'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['1世帯', '年8.8万円'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.5], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.5, 'coin_toss', -12], [1.5, 'sparkle', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1年で [8.8万円]', y: 480, size: 76, border: YEL, sub: '家計の負担軽減（試算）' }] : []; },
    note: '大和総研 2026年1月の試算',
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0.3, 0.3); const n = Math.floor(32 * ease(k(lt, 0.3, 2.0)));
      for (const [nm, x] of [['coinsA', -0.6], ['coinsB', -0.3]]) { const c = s.P[nm]; c.visible = true; c.position.set(x, 0, 0.3); c.scale.setScalar(1.2); c.userData.items.forEach((it, i) => { it.visible = i < n; }); }
      h.reach('L', V(-0.25, 1.0 + 0.9 * n / 32, 0.45)); h.hand('L', 'pa'); h.arm('R', 2.4, 0.6, 0.2); h.hand('R', 'gu');
      h.face(n < 20 ? { lid: 0, brow: 0.6, look: [-0.6, 0], mouth: 'o', open: 0.6 } : { lid: 0.5, brow: 0.8, browY: 0.6, look: [0, 0], mouth: 'smile' }); } },
  // 5) onigiri: 440 a year, 1 a day free (recall of the cold open)
  { sc: 'st', say: ['onigiri'], pre: 0.12, pal: HOOK, show: [], hud: ['おにぎり', '年440個'], hudColor: YEL,
    cam: { p0: [0.2, 1.5, 6.4], p1: [0.15, 1.48, 5.8], l0: [0.15, 1.3, -0.3] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.25, 0.7]],
    sfx: [[0.0, 'whoosh_gust', -12], [0.25, 'impact_doon', -11], [0.4, 'text_pa', -10], [2.2, 'text_pa', -10], [2.4, 'comic_pico', -12]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: 'おにぎり [440個]', y: 480, size: 72, border: YEL, sub: '8.8万円÷200円（試算）' }] : []; },
    tags(lt) { return lt > 2.2 ? [{ t: 2.2, text: 'ふつう 0個', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: 2.5, text: '毎日1個 タダ', x: 770, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const on = register(s, lt, 0.15); const h = s.hero.userData; place(s.hero, -0.35, 0.45, 0.15);
      if (lt < 2.2) { h.arm('L', 0.3, 2.6, 0.3); h.arm('R', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa'); h.face(on ? { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.5], mouth: 'o', open: 1.1 } : { lid: 0.3, brow: 0.2, look: [0.6, 0.2], mouth: 'smile' }); }
      else { hold(s, 'nig', 'R', V(0.05, 1.12, 0.75)); s.P.nig.scale.setScalar(1.5); h.arm('L', 0.3, 0.4, 1.5); h.hand('L', 'choki'); h.face({ lid: 0.45, brow: 0.6, look: [0, 0], mouth: 'smile' }); } } },
  // 6) all of Japan: 4.8 trillion yen = a 48 km stack of 10,000-yen bills
  { sc: 'st', say: ['japan'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ffd23a'], show: [], hud: ['全国', '4.8兆円'], hudColor: YEL,
    cam: { p0: [0.3, 1.5, 6.0], p1: [0.3, 2.0, 7.2], l0: [0.3, 1.3, 0], l1: [0.3, 2.4, 0], dur: 4.5 },
    sfx: [[0.3, 'text_pa', -10], [2.0, 'whoosh_swing', -12], [2.3, 'text_pa', -10], [3.2, 'comic_surprise', -12]],
    cards(lt) { return lt < 2.1 ? (lt > 0.3 ? [{ t: 0.3, text: '全国で [4.8兆円]', y: 480, size: 74, border: YEL, sub: '大和総研 2026年1月の試算' }] : [])
      : [{ t: 2.1, text: '1万円札で [48km]', y: 480, size: 74, border: YEL, sub: '4.8億枚×0.1mm（試算）' }]; },
    act(lt, s) { const t = s.P.tower; place(t, 0.75, -0.3); const H = 0.6 + 9 * ease(k(lt, 1.9, 3.6)); t.userData.col.scale.set(1.3, H, 1.3);
      const c = s.P.clouds; c.visible = true; c.position.set(0.4, 3.6, -1.5);
      const h = s.hero.userData; place(s.hero, -0.4, 0.4, 0.2); h.reach('R', V(0.3, 1.1, 0.1)); h.hand('R', 'pa');
      if (lt < 2.0) { h.arm('L', 0.3, 0.3, 0.3); h.face({ lid: 0.1, brow: 0.4, look: [0.6, 0], mouth: 'smile' }); }
      else { h.arm('L', 2.6, 0.5, 0.2); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.5, 1], mouth: 'o', open: 1 }); h.head.rotation.x = -0.25; } } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.32, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); h.arm('L', 0.6, 0.2, 1.8); h.arm('R', 0.6, 0.2, 1.8); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) a 4.8 trillion yen hole in the tax money: 39,000 yen per person
  { sc: 'st', say: ['hole'], pre: 0.12, pal: ['#6a5acd', '#ece8ff', '#ff5a4f'], dim: 0.9, show: [], hud: ['税収', '−4.8兆円'], hudColor: RED,
    cam: { p0: [0.15, 2.0, 6.2], p1: [0.15, 1.9, 5.8], l0: [0.15, 1.05, 0] },
    sfx: [[0.3, 'comic_fall', -12], [0.4, 'text_pa', -10], [2.4, 'text_pa', -10], [2.6, 'comic_shock2', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.4 ? [{ t: 0.4, text: '税収に [4.8兆円] の穴', y: 480, size: 66, border: RED, sub: '大和総研 2026年1月の試算' }] : [])
      : [{ t: 2.3, text: '1人 [3.9万円] 分', y: 480, size: 74, border: RED, sub: '4.8兆円÷1億2,400万人（試算）' }]; },
    act(lt, s) { const hl = s.P.hole; place(hl, 0.7, -0.3); hl.scale.setScalar(0.65);
      const f = s.P.fall; f.visible = true; f.position.set(0.7, 0, -0.3); f.userData.items.forEach((c, i) => { const u = (lt * 0.8 + i / 10) % 1; c.position.set(Math.sin(i * 2.7) * 0.35, 2.6 - u * 2.7, Math.cos(i * 1.9) * 0.2); c.visible = u < 0.97; c.rotation.z = lt * 4 + i; });
      const h = s.hero.userData; place(s.hero, -0.3, 0.45, 0.35); h.body.rotation.x = 0.1;
      h.reach('R', V(-0.1, 1.0, 0.45)); h.hand('R', 'pa'); h.arm('L', 0.6, 0.2, 1.8); h.hand('L', 'pa');
      h.face(lt < 2.3 ? { lid: 0, brow: -0.8, browY: 1, look: [0.7, -0.6], mouth: 'o', open: 0.7 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 9) eating out stays 10%: take-out is 100 yen cheaper
  { sc: 'st', say: ['lunch'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#35d0ff'], show: ['desk'], hero2: true, hud: ['外食', '10%のまま'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.2], p1: [0.0, 1.55, 5.8], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.8, 'text_pa', -10], [2.0, 'text_pa', -10], [3.0, 'comic_pico', -12]],
    note: 'ランチ税抜1,000円の例（試算）',
    act(lt, s) { const d = s.P.desk; place(d, -0.75, -0.2); const bw = s.P.bowl; bw.visible = true; bw.position.set(-0.75, 0.77, -0.15); bw.scale.setScalar(1.3);
      tagAt(s, 'tIn', -0.55, 2.05, 0.2, lt); if (lt > 1.8) tagAt(s, 'tOut', 0.55, 2.3, 0.3, lt);
      const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero2, -0.75, -0.75); h2.arm('L', 0.8, 0.2, 1.0); h2.arm('R', 0.8, 0.2, 1.0); h2.face({ lid: 0.3, brow: 0.2, look: [0, -0.5], mouth: 'smile' });
      place(s.hero, 0.7, 0.35, -0.2); hold(s, 'nig', 'R', V(1.0, 1.25, 0.65)); s.P.nig.scale.setScalar(1.4);
      if (lt < 1.8) { h.arm('L', 0.3, 0.3, 0.3); h.face({ lid: 0.1, brow: 0.3, look: [-0.6, 0.3], mouth: 'flat' }); }
      else { h.arm('L', 2.4, 0.5, 0.3); h.hand('L', 'choki'); h.face({ lid: 0.4, brow: 0.7, look: [0, 0], mouth: 'smile' }); } } },
  // 10) the rich gain more: twice the bottom 20%
  { sc: 'st', say: ['rich'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: [], hero2: true, hud: ['得する額', '最大2倍差'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.8], p1: [0.0, 1.55, 6.5], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.4, 'sparkle', -14], [1.8, 'text_pa', -10], [2.2, 'comic_shock2', -12]],
    note: '所得上位2割と下位2割の世帯（大和総研）',
    tags(lt) { return lt > 1.8 ? [{ t: 1.8, text: '下位2割 ×1', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: 2.1, text: '上位2割 ×2', x: 770, y: 1560, h: 104, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.65, 0.3, 0.2); place(s.hero2, 0.65, 0.3, -0.2); h2.shades(true);
      const n = ease(k(lt, 0.3, 2.0));
      for (const [nm, x, m] of [['coinsA', -0.25, 12], ['coinsB', 0.25, 24]]) { const c = s.P[nm]; c.visible = true; c.position.set(x, 0, 0.45); c.scale.setScalar(1.15); c.userData.items.forEach((it, i) => { it.visible = i < Math.floor(m * n); }); }
      h2.arm('L', 2.5, 0.5, 0.3); h2.arm('R', 0.3, 0.3, 1.6); h2.hand('L', 'choki'); h2.face({ lid: 0.3, brow: 0.6, look: [-0.3, 0], mouth: 'smile' });
      h.reach('R', V(-0.3, 0.9, 0.55)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.3, 0.3);
      h.face(lt < 1.8 ? { lid: 0.1, brow: 0.3, look: [0.6, -0.4], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.7, 0], mouth: 'o', open: 0.9 }); } },
  // 11) good news / bad news: an onigiri a day / lunch in a freezing park
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#7fa8ff', '#eaf0ff', '#35d0ff'], show: [], hud: ['いい・悪い', 'ニュース'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.45, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'text_pa', -10], [2.7, 'whoosh_gust', -14], [3.6, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.4 ? (lt > 0.3 ? [{ t: 0.3, text: '毎日 [おにぎり1個]', y: 480, size: 70, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.4, text: 'ランチは [真冬の公園]', y: 480, size: 64, border: RED, sub: '悪いニュース（持ち帰りが安いので）' }]; },
    stamps: [{ t: 3.5, text: 'さむっ…', x: 760, y: 1140, rot: 6, color: RED, size: 76, dur: 1.3 }],
    act(lt, s) { const h = s.hero.userData;
      if (lt < 2.4) { place(s.hero, 0, 0.3); hold(s, 'nig', 'R', V(0.35, 1.1, 0.62)); s.P.nig.scale.setScalar(1.5); h.arm('L', 2.5, 0.6, 0.2); h.hand('L', 'pa');
        h.face({ lid: 0.5, brow: 0.7, look: [0, 0], mouth: 'smile' }); return; }
      const b = s.P.bench; place(b, 0, -0.25); snow(s, lt); place(s.hero, 0, 0.0); h.body.position.y = -0.05;
      const sh = Math.sin(lt * 40) * 0.03; s.hero.position.x = sh;
      hold(s, 'nig', 'R', V(0.14 + sh, 1.08, 0.6)); s.P.nig.scale.setScalar(1.4); h.reach('L', V(-0.14 + sh, 1.05, 0.6)); h.hand('L', 'gu');
      h.face({ lid: 0.2, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.4 }); } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '今のままでいい', x: 770, y: 1130, h: 92, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1430, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1530, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.3); hold(s, 'nig', 'R', V(0.32, 1.05, 0.6)); s.P.nig.scale.setScalar(1.4); h.arm('L', 1.0, 0.6, 0.6); h.hand('L', 'pa');
      h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも食べ物の消費税が', '[ゼロ]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['食べ物の消費税', 'ゼロ'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
