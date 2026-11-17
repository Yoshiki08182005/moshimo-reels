// ep37_shuukyuu3 (pop / arm B 生活ルール改変): もしも週休3日が全員の決まりになったら？
// 型は sp_geppu2x / ep36。台本・数字・小道具は自作。
// 前提（試算）: いまの年間休日 = 労働者1人平均116.6日（厚労省 令和7年就労条件総合調査、2024年の値）≒117日
//   週休3日 = +52日 → 168.6日 ≒ 169日、168.6/365 = 46%
//   増えた休みの起きている時間 16時間×52日 = 832時間 → 映画2時間で416本
//   43年働く（22〜65歳）×52日 = 2,236日 ≒ 6.1年分
//   給料そのまま（週40時間）なら 40÷4 = 1日10時間
//   時間を2割減らすと 月給34万600円（厚労省 令和7年賃金構造基本統計調査）×0.2 = 68,120円 ≒ 6万8千円減
//   週5日開くお店を、1人週4日勤務で回す → 5÷4 = 1.25倍の人手
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep37_shuukyuu3.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#3fc0ff', '#e6f6ff', '#ffd23a'], MAIN = ['#ff9f5a', '#fff1e2', '#3f6fd8'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const calTex = (off) => label(700, 300, (c) => {
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, 700, 300); c.fillStyle = '#2c3b6b'; c.fillRect(0, 0, 700, 80);
  c.fillStyle = '#ffffff'; c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(off === 3 ? '週休3日' : '週休2日', 350, 42);
  DAYS.forEach((d, i) => { const x = 10 + i * 97.5, isOff = i >= 7 - off; c.fillStyle = isOff ? '#e2463c' : '#eef1f5'; c.fillRect(x + 4, 96, 88, 190);
    c.fillStyle = isOff ? '#ffffff' : '#22252d'; c.font = 'bold 56px sans-serif'; c.fillText(d, x + 48, 150); c.font = 'bold 44px sans-serif'; if (isOff) c.fillText('休', x + 48, 234); });
});
const SC_COL = ['#ff7a6b', '#5aa9ff', '#ffd23a', '#7bd88f', '#c79bff', '#ff9fd0'];
// suitcase piles: [x, z, layer]
const PILES = [[-1.0, 0.2], [1.0, 0.2], [-0.75, -0.65], [0.75, -0.65], [-1.6, -0.4], [1.6, -0.4], [0, -1.3]];
const SCP = (() => { const r = rng(7), a = []; for (let i = 0; i < 28; i++) { const p = PILES[i % PILES.length]; a.push([p[0] + (r() - 0.5) * 0.1, p[1] + (r() - 0.5) * 0.1, Math.floor(i / PILES.length), (r() - 0.5) * 0.8, r()]); } return a; })();

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // rain of suitcases (clones of the kit suitcase, various colours)
  { const g = G(); g.userData.items = [];
    for (let i = 0; i < 28; i++) { const c = P.suitcase.clone(); c.children[0].material = M(SC_COL[i % SC_COL.length]); c.visible = true; g.add(c); g.userData.items.push(c); } reg('scRain', g); }
  // weekly calendar on a stand (userData.set(off))
  { const s = G(); cyl(0.02, 0.02, 1.0, '#9aa3ad', 0, 0.5, 0, s); cyl(0.16, 0.18, 0.04, '#9aa3ad', 0, 0.02, 0, s);
    rbox(1.02, 0.48, 0.04, 0.03, '#2c3b6b', 0, 1.24, 0, s);
    const m2 = calTex(2), m3 = calTex(3); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.42), m2); f.position.set(0, 1.24, 0.022); s.add(f);
    s.userData.set = (off) => { f.material = off === 3 ? m3 : m2; }; reg('cal', s); }
  // TV on a low stand + growing tower of movie cases
  { const t = G(); rbox(1.0, 0.36, 0.4, 0.03, '#8a5a34', 0, 0.18, 0, t); rbox(1.1, 0.66, 0.08, 0.03, '#23262f', 0, 0.75, 0, t);
    const sm = label(512, 300, (c) => { const g = c.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#3a6bd8'); g.addColorStop(1, '#ff8a5a'); c.fillStyle = g; c.fillRect(0, 0, 512, 300);
      c.fillStyle = '#ffffff'; c.font = 'bold 110px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('映画', 256, 150); });
    sm.emissive = new THREE.Color('#ffffff'); sm.emissiveMap = sm.map; sm.emissiveIntensity = 0.5;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.56), sm); f.position.set(0, 0.75, 0.042); t.add(f); reg('tv', t); }
  { const d = G(); d.userData.items = []; const cols = ['#2c3b6b', '#e2463c', '#3fae5b', '#ffd23a', '#7a6ae0'];
    for (let i = 0; i < 30; i++) { const it = rbox(0.3, 0.035, 0.22, 0.008, cols[i % cols.length], Math.sin(i * 2.1) * 0.02, 0.018 + i * 0.037, Math.cos(i * 1.3) * 0.015, d); it.rotation.y = Math.sin(i * 1.7) * 0.15; d.userData.items.push(it); } reg('dvds', d); }
  // salary envelope
  { const e = G(); rbox(0.26, 0.17, 0.012, 0.01, '#f2e3c2', 0, 0, 0, e);
    const fm = label(256, 160, (c) => { c.fillStyle = '#f2e3c2'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#22252d'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('給料', 128, 60); c.font = 'bold 34px sans-serif'; c.fillText('34万円', 128, 122); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.15), fm); f.position.z = 0.008; e.add(f); reg('pay', e); }
  // shop sign "OPEN 毎日"
  { const s = G(); rbox(0.9, 0.3, 0.04, 0.03, '#3fae5b', 0, 0, 0, s);
    const fm = label(512, 170, (c) => { c.fillStyle = '#3fae5b'; c.fillRect(0, 0, 512, 170); c.fillStyle = '#ffffff'; c.font = 'bold 96px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('毎日営業', 256, 88); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.28), fm); f.position.z = 0.022; s.add(f); reg('shopSign', s); }
}

// suitcases fall from the sky from t0 and stack into piles around (not on) the hero
function rain(s, lt, t0, n = 28) {
  const g = s.P.scRain; g.visible = true;
  g.userData.items.forEach((c, i) => {
    const [x, z, layer, ry, r] = SCP[i]; const d = lt - t0 - i * 0.045 - r * 0.08;
    if (i >= n || d < 0) { c.visible = false; return; } c.visible = true;
    const rest = 0.15 + layer * 0.3, y0 = 4.6 + r * 1.2, y = Math.max(rest, y0 - 0.5 * 14 * d * d);
    c.position.set(x, y, z); c.scale.setScalar(1.5); c.rotation.set(-Math.PI / 2, 0, ry + (y > rest ? d * 3 : 0));
  });
}
const holdCase = (s, side = 'R', x = 0.42, z = 0.3) => { const c = s.P.suitcase; c.visible = true; c.position.set(x, 0.12, z); c.rotation.set(0, 0, 0); s.hero.userData.reach(side, V(x, 0.78, z)); return c; };
const calAt = (s, x, off, z = -0.25, ry = -0.2) => { const c = s.P.cal; c.visible = true; c.position.set(x, 0, z); c.rotation.set(0, ry, 0); c.userData.set(off); return c; };
const hold = (s, name, side, p, rz = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.08, -0.03))); return o; };

const plan = [
  // 0) cold open (flash-forward of #2): 52 three-day weekends rain down as suitcases; push in, blissful face
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.1, 1.7, 6.6], p1: [0.0, 1.46, 2.6], l0: [0.0, 1.2, -0.4], l1: [0.0, 1.44, 0.3], hold: 1.4, dur: 2.2 },
    shake: [[0.3, 0.07, 0.8]], lines: [[0.25, 0.9]],
    sfx: [[0.2, 'whoosh_gust', -10], [0.4, 'impact_doon', -9], [0.6, 'giant_step', -13], [0.9, 'impact_don', -13], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -10]],
    stamps: [{ t: 0.25, text: '3連休 ×52!!', x: 560, y: 520, rot: -6, color: YEL, size: 116, dur: 1.15 },
      { t: 2.3, text: '月曜…? 休みです', x: 360, y: 1190, rot: -6, color: '#ffffff', size: 56, dur: 0.7 }],
    act(lt, s) {
      rain(s, lt, 0.2); s.hero.position.set(0, 0, 0.3); const h = s.hero.userData; holdCase(s, 'R', 0.42, 0.3);
      if (lt < 1.4) { h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.face(lt < 0.3 ? { lid: 0.2, look: [0, 0.6], mouth: 'smile' } : { lid: 0, brow: -0.6, browY: 1, look: [0.3, 0.8], mouth: 'o', open: 1.1 }); }
      else { h.arm('L', 0.4, 0.6, 1.6); h.hand('L', 'choki'); h.face({ lid: 0.75, brow: 0.5, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 2.0, 2.4)); }
    } },
  // 1) title: the calendar flips from 2 to 3 red days
  { sc: 'st', say: ['hook'], pal: MAIN, show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.7], l0: [-0.05, 1.25, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'comic_pico', -12]],
    stamps: [{ t: 1.6, text: '金も休み!', x: 800, y: 1060, rot: 8, color: RED, size: 66, dur: 1.4 }],
    act(lt, s) {
      calAt(s, 0.5, lt < 1.6 ? 2 : 3, -0.3, -0.2).scale.setScalar(1.35);
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.3); s.hero.rotation.y = 0.3;
      h.reach('R', V(-0.05, 1.3 + Math.sin(lt * 5) * 0.02, -0.05)); h.arm('L', 0.2, 0.5, 1.5);
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.2, look: [0.8, 0], mouth: 'smile' } : { lid: 0, brow: -0.5, browY: 1, look: [0.2, 0], mouth: 'o', open: 1 });
    } },
  // 2) real: 117 days now vs 169 days
  { sc: 'st', say: ['real'], pre: 0.2, hold: 0.2, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], hero2: true, show: [], hud: ['週休3日', '+52日'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.43, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.8, 'text_pa', -11], [3.4, 'comic_surprise', -13]],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'いま 年117日', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > this.lt.real + 2.6 ? [{ t: this.lt.real + 2.6, text: 'あなた 年169日', x: p1[0], y: p1[1], h: 84, bg: CY }] : [])]; },
    stamps: [{ t: 3.6, text: '1年の46%が休み', x: 540, y: 1060, rot: -4, color: YEL, size: 56, dur: 1.6 }],
    note: '労働者1人平均（厚労省 就労条件総合調査2025）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.66, 0, 0.2); s.hero.rotation.y = 0.3;
      h2.arm('L', 0.3, 0.6, 1.5); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.3, brow: 0.2, mouth: 'smile', look: [-0.4, 0] });
      if (lt < 2.9) { h.arm('R', 0.2, 0.3, 0.3); h.arm('L', 0.1, 0.3, 0.2); h.face({ lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.5, 0] }); }
      else { h.arm('R', 0.3, 2.6, 0.3); h.arm('L', 0.3, 2.6, 0.3); h.hand('R', 'pa'); h.hand('L', 'pa'); h.body.position.y = Math.abs(Math.sin(lt * 7)) * 0.06; h.face({ lid: 0, brow: 0.6, mouth: 'o', open: 1, look: [0, 0.3] }); }
    } },
  // 3) 52 three-day weekends a year (the cold open, in its place)
  { sc: 'st', say: ['renkyu'], pre: 0.15, hold: 0.3, pal: HOOK, show: [], hud: ['3連休', '×52'], hudColor: YEL,
    cam: { p0: [0.1, 1.7, 6.6], p1: [0.1, 1.66, 6.2], l0: [0.0, 1.2, -0.4] },
    shake: [[0.5, 0.05, 0.6]],
    sfx: [[0.4, 'whoosh_gust', -12], [0.6, 'impact_doon', -11], [1.2, 'impact_don', -14], [2.2, 'text_pa', -10]],
    cards(lt) { return lt > 2.0 ? [{ t: 2.0, text: '3連休 [年52回]', y: 480, size: 68, border: YEL }] : []; },
    act(lt, s) {
      rain(s, lt, 0.4); s.hero.position.set(0, 0, 0.3); const h = s.hero.userData; holdCase(s, 'R', 0.42, 0.3);
      h.arm('L', 0.3, 2.6, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.1, brow: 0.5, look: [0, 0.7], mouth: 'o', open: 0.9 });
    } },
  // 4) movies: 416 films
  { sc: 'st', say: ['movie'], pre: 0.15, pal: ['#4fc38a', '#e6f8ee', '#ffd23a'], show: ['tv', 'cup'], hud: ['増えた休み', '832時間'],
    cam: { p0: [0.1, 1.45, 5.6], p1: [0.1, 1.43, 5.3], l0: [0.1, 1.15, 0] },
    sfx: [[0.3, 'comic_pico', -13], [1.9, 'text_pa', -10]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '映画 [416本]', y: 480, size: 70, border: YEL, sub: '起きている16時間×52日÷2時間（試算）' }] : []; },
    act(lt, s) {
      s.P.tv.position.set(0.7, 0, -0.5); s.P.tv.rotation.y = -0.35;
      const d = s.P.dvds; d.visible = true; d.position.set(0.05, 0, -0.1); const n = Math.round(3 + 27 * ease(k(lt, 0.3, 2.6))); d.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.35); s.hero.rotation.y = 0.35;
      hold(s, 'cup', 'L', V(-0.78, 0.95, 0.65)); s.P.cup.userData.steam.forEach(m => { m.visible = false; });
      h.reach('R', V(-0.1, 0.2 + n * 0.037, -0.05)); h.hand('R', 'pa');
      h.face(lt < 1.8 ? { lid: 0.2, look: [0.8, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.6, look: [0.6, 0.3], mouth: 'o', open: 0.8 });
    } },
  // 5) a working life: +6 years of holidays
  { sc: 'st', say: ['life'], pre: 0.15, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['pclock'], hud: ['一生', '+6年'],
    cam: { p0: [0.0, 1.42, 4.8], p1: [0.0, 1.4, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'whoosh_switch1', -13], [1.6, 'text_pa', -10], [2.4, 'sparkle', -14]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '休み [+6年分]', y: 480, size: 70, border: CY, sub: '52日×43年＝2,236日（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.pclock; c.position.set(0.72, 0, -0.35); c.rotation.y = -0.25; c.userData.pend.rotation.z = Math.sin(lt * 9) * 0.35;
      c.userData.mh.rotation.z = -lt * 14; c.userData.hh.rotation.z = -lt * 1.2;
      const h = s.hero.userData; s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.2;
      h.shades(lt > 1.5); h.arm('R', 0.2, 2.4, 0.4); h.hand('R', 'gu'); h.arm('L', 0.4, 0.6, 1.6); h.hand('L', 'choki');
      h.face(lt < 1.5 ? { lid: 0.1, brow: -0.2, look: [0.7, 0.3], mouth: 'o', open: 0.6 } : { lid: 0.2, brow: 0.5, look: [0, 0], mouth: 'smile' });
    } },
  // 6) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 7) same pay -> 10-hour days
  { sc: 'st', say: ['ten'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.85, show: ['desk', 'lamp', 'pclock'], hud: ['給料そのまま', '1日10時間'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.8], p1: [0.0, 1.4, 4.5], l0: [0.0, 1.15, 0] },
    sfx: [[0.3, 'countdown_tick', -14], [1.8, 'text_pa', -10], [2.4, 'comic_fall', -12]],
    cards(lt) { return lt > 1.7 ? [{ t: 1.7, text: '1日 [10時間]', y: 480, size: 70, border: RED, sub: '週40時間÷4日（試算）' }] : []; },
    tags(lt) { return lt > 2.4 ? [{ t: 2.4, text: 'ふつう 8時間', x: 760, y: 1250, h: 72, bg: '#ffffff' }] : []; },
    act(lt, s) {
      s.P.desk.position.set(-0.05, 0, 0.0); s.P.lamp.position.set(-0.05, 2.55, 0.0);
      const c = s.P.pclock; c.position.set(0.85, 0, -0.5); c.rotation.y = -0.3; c.userData.pend.rotation.z = Math.sin(lt * 4) * 0.3; c.userData.mh.rotation.z = -lt * 6;
      const h = s.hero.userData; s.hero.position.set(-0.1, 0, -0.42); s.hero.rotation.y = 0;
      h.reach('R', V(0.15, 0.8, 0.05)); h.reach('L', V(-0.3, 0.8, 0.05));
      const sl = ease(k(lt, 1.6, 2.4)); h.head.rotation.x = 0.3 * sl; h.head.rotation.z = 0.15 * sl;
      h.face(lt < 1.6 ? { lid: 0.5, brow: -0.4, look: [0, -0.3], mouth: 'flat' } : { lid: 0.85, brow: -1, browY: 1, look: [0, -0.4], mouth: 'o', open: 0.5 });
    } },
  // 8) fewer hours -> -68,000 yen a month
  { sc: 'st', say: ['cut'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['coinsA'], hud: ['給料', '−2割'], hudColor: RED,
    cam: { p0: [-0.05, 1.45, 4.9], p1: [-0.05, 1.43, 4.6], l0: [-0.05, 1.2, 0] },
    sfx: [[0.6, 'coin_toss', -13], [1.2, 'coin_toss', -14], [2.0, 'text_pa', -10], [2.7, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.9 ? [{ t: 1.9, text: '月 [−6万8千円]', y: 480, size: 70, border: RED, sub: '月給34万600円の2割（試算）' }] : []; },
    note: '月給は厚労省 賃金構造基本統計調査2025',
    act(lt, s) {
      const c = s.P.coinsA, n = Math.round(32 - 7 * ease(k(lt, 0.4, 1.8))); c.position.set(0.45, 0, 0.1); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      if (lt > 0.4) { s.P.bill.visible = true; const u = k(lt, 0.4, 1.6); s.P.bill.position.set(lerp(0.45, 1.3, u), lerp(1.0, 2.0, u), 0.1); s.P.bill.rotation.set(u * 3, u * 4, u * 2); }
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.3); s.hero.rotation.y = 0.3;
      hold(s, 'pay', 'L', V(-0.75, 1.15 + Math.sin(lt * 3) * 0.02, 0.6), 0.1); h.reach('R', V(0.25, 0.2 + n * 0.028, 0.1)); h.hand('R', 'pa');
      h.face(lt < 1.9 ? { lid: 0.1, brow: -0.3, look: [0.7, 0.2], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 9) shops open every day -> 1.25x staff
  { sc: 'st', say: ['shop'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], hero2: true, show: ['counter', 'shopSign'], hud: ['お店', '人手×1.25'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.7], l0: [0.0, 1.25, 0] },
    sfx: [[0.2, 'text_touch', -12], [2.4, 'text_pa', -10], [3.2, 'comic_surprise', -13]],
    cards(lt) { return lt > 2.3 ? [{ t: 2.3, text: '人手 [1.25倍]', y: 480, size: 70, border: RED, sub: '週5日開く店を週4日勤務で回す（試算）' }] : []; },
    stamps: [{ t: 0.4, text: 'いらっしゃいませ〜', x: 330, y: 1180, rot: -5, color: '#ffffff', size: 50, dur: 1.6 }],
    act(lt, s) {
      s.P.counter.position.set(0.0, 0, -0.75); s.P.counter.scale.set(0.8, 1, 0.8); s.P.shopSign.position.set(0, 2.25, -1.3);
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.hero2.position.set(0.65, 0, -1.45); s.hero2.rotation.y = -0.15; h2.arm('L', 0.6, 0.4, 0.6); h2.arm('R', 0.3, 2.4, 0.3); h2.hand('R', 'pa'); h2.face({ lid: 0.2, brow: 0.3, look: [-0.3, 0], mouth: 'smile' });
      s.hero.position.set(-0.62, 0, -1.4); s.hero.rotation.y = 0.15; h.body.position.y = Math.abs(Math.sin(lt * 10)) * 0.04;
      h.arm('R', 0.7, 0.5, 0.6); h.arm('L', 0.7, 0.5, 0.6);
      h.face(lt < 2.3 ? { lid: 0.3, brow: -0.3, look: [0.3, -0.2], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 10) question + follow (back to the hook colours, calendar + suitcase)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 320, y: 1040, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 760, y: 1040, h: 110, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1170, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1450, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      calAt(s, 0.7, 3, -0.6, -0.25);
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0.2); s.hero.rotation.y = 0.05;
      holdCase(s, 'R', 0.2, 0.25); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも[週休3日]が', '全員の決まりになったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['週休3日', '+52日'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
