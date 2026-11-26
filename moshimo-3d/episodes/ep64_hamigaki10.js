// ep64_hamigaki10 (pop / arm B 生活ルール改変): もしも歯みがきが法律で1回10分になったら？
// 型は sp_geppu2x / ep63。台本・数字・小道具は自作。
// 前提（試算）:
//   ふつうの歯みがき 1回3分と仮定（鳥取県の調査資料：30〜60歳代の約6割が1〜3分）。法律で1回10分・朝夜の1日2回
//   1日 20分（ふつう6分、+14分）。1秒5往復と仮定 → 10分×60×5×2 = 6,000回/日
//   1年 20×365 = 7,300分 = 121.7時間 ≈ 5.1日。80年で 584,000分 = 405日 ≈ 1年1か月
//   日本 1億2,400万人×14分 = 17.4億分 = 2,893万時間/日（≈2,900万時間）
//   家族4人で洗面所1つ：4×10 = 40分（ふつう4×3 = 12分 → 28分 ≈ 30分早起き）
//   歯ブラシ交換の目安 1か月（1日6分）→ 同じ使用時間で 30×6/20 = 9日、年 365/9 ≈ 40本
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep64_hamigaki10.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#35b6ff', '#e8f7ff', '#ffd23a'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // toothbrush: origin = grip end, head toward -x (into the mouth when held in the R hand)
  const mkBrush = (col) => { const b = G(); rbox(0.26, 0.032, 0.03, 0.012, col, -0.11, 0, 0, b); rbox(0.07, 0.03, 0.032, 0.01, col, -0.255, 0, 0, b);
    rbox(0.065, 0.04, 0.03, 0.008, '#ffffff', -0.255, 0.03, 0, b); rbox(0.06, 0.012, 0.028, 0.004, '#7fd3ff', -0.255, 0.054, 0, b); return b; };
  reg('tb', mkBrush('#35b6ff'));
  { const b = mkBrush('#9aa3ad'); b.children[2].rotation.z = 0.4; b.children[2].scale.set(1.4, 0.8, 1.5); reg('tbOld', b); }
  // pile of 40 toothbrushes (items)
  { const g = G(); g.userData.items = []; const cols = ['#35b6ff', '#ff7a6b', '#7bd88f', '#c79bff', '#ffd23a'];
    for (let i = 0; i < 40; i++) { const b = mkBrush(cols[i % 5]); const r = Math.floor(i / 8), c = i % 8;
      b.position.set((c - 3.5) * 0.09 + (r % 2) * 0.04 + 0.13, 0.02 + r * 0.04, Math.sin(i * 2.1) * 0.08); b.rotation.set(0, Math.sin(i * 1.7) * 0.6, 0); g.add(b); g.userData.items.push(b); }
    reg('pile', g); }
  // big foam cloud (scale 0..1) and foam beard
  { const g = G(); for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 0.4 + (i % 5) * 0.28; sph(0.35 + (i % 4) * 0.12, M('#ffffff', 0.9), Math.cos(a) * r * 1.3, 0.9 + Math.sin(a) * r * 0.9 + (i % 3) * 0.25, -0.4 - (i % 3) * 0.3, g); }
    for (let i = 0; i < 10; i++) sph(0.06 + (i % 3) * 0.03, M('#bfe9ff', 0.9), Math.sin(i * 3.3) * 1.6, 2.2 + Math.cos(i * 1.7) * 0.8, -0.1, g); reg('foam', g); }
  { const g = G(); for (let i = 0; i < 9; i++) { const a = -0.3 - i * 0.32; sph(0.045 + (i % 3) * 0.012, M('#ffffff', 0.9), Math.cos(a) * 0.12, Math.sin(a) * 0.07, 0, g); } reg('beard', g); }
  // cup on the sink
  { const c = G(); cyl(0.07, 0.06, 0.16, '#ff8fb8', 0, 0.08, 0, c); reg('mug', c); }
  // mirror on the wall
  { const m = G(); rbox(0.9, 1.0, 0.04, 0.06, '#ffffff', 0, 0, 0, m); rbox(0.8, 0.9, 0.02, 0.05, M('#cfefff', 0.15), 0, 0, 0.025, m); reg('mirror', m); }
  // sparkles on teeth (small)
  { const g = G(); for (let i = 0; i < 5; i++) sph(0.03, new THREE.MeshBasicMaterial({ color: '#ffffff' }), Math.cos(i * 1.26) * 0.62, Math.sin(i * 1.26) * 0.5, 0, g); reg('kira', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rz = 0, who = 'hero') => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz);
  s[who].userData.reach(side, p.clone().add(V(side === 'R' ? 0.08 : -0.08, -0.05, -0.02))); return o; };
// brushing: toothbrush in the R hand, head in the mouth, scrubbing left-right (speed sp)
const scrub = (s, lt, sp = 1, who = 'hero', name = 'tb') => { const o = s[who]; const w = Math.sin(lt * 26 * sp) * 0.035 * sp;
  return hold(s, name, 'R', V(o.position.x + 0.26 + w, 1.3, o.position.z + 0.36), 0.05, who); };
const sink = (s, x = 0.7, z = -0.7) => { place(s.P.counter, x, z); place(s.P.mirror, x, z - 0.3); s.P.mirror.position.y = 1.65;
  const m = s.P.mug; m.visible = true; m.position.set(x + 0.6, 0.93, z); };
const beard = (s, on = 1, who = 'hero') => { const b = s.P.beard, o = s[who]; b.visible = on > 0; b.position.set(o.position.x, 1.26, o.position.z + 0.33); b.scale.setScalar(Math.max(0.01, on) * 1.1); };
// cold open / recall: frantic brushing -> a huge foam cloud bursts out behind the hero
function burst(s, lt, t0) { const u = ease(k(lt, t0, t0 + 0.35)); const f = s.P.foam; f.visible = u > 0; f.position.set(s.hero.position.x, 0, s.hero.position.z - 0.2);
  f.scale.setScalar(0.05 + 1.25 * u + 0.03 * Math.sin(lt * 5)); beard(s, k(lt, t0, t0 + 0.2)); return u > 0; }

const plan = [
  // 0) cold open (flash-forward of #5): 10-minute brushing, foam bursts into a giant cloud -> push in, foam beard "…シャカシャカ♪"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.2, 1.6, 6.8], p1: [0.0, 1.42, 3.4], l0: [0.1, 1.5, -0.3], l1: [0.0, 1.38, 0.4], hold: 1.1, dur: 2.2 },
    shake: [[0.15, 0.08, 0.6]], lines: [[0.12, 0.9]],
    sfx: [[0.0, 'whoosh_switch1', -12], [0.12, 'impact_doon', -9], [0.15, 'comic_boyon', -11], [0.2, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_pico', -11]],
    stamps: [{ t: 0.15, text: '歯みがき 10分!!', x: 540, y: 400, rot: -6, color: YEL, size: 92, dur: 1.15 },
      { t: 2.3, text: '…シャカシャカ♪', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 62, dur: 0.7 }],
    act(lt, s) { sink(s, 0.8, -0.9); place(s.hero, 0.0, 0.45); const on = burst(s, lt, 0.1); const h = s.hero.userData;
      scrub(s, lt, lt < 1.3 ? 1.6 : 1); h.hand('R', 'gu'); h.arm('L', on && lt < 1.3 ? 2.6 : 0.4, on && lt < 1.3 ? 0.6 : 0.3, 0.3); h.hand('L', 'pa');
      h.face(!on ? { lid: 0.1, brow: 0.6, look: [0, 0], mouth: 'o', open: 0.5 } : lt < 1.3 ? { lid: 0, brow: 0.9, browY: 1, look: [0.3, 0.6], mouth: 'o', open: 1 } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' });
      h.head.rotation.z = 0.1 * ease(k(lt, 1.9, 2.3)); } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#7bd88f', '#effbf1', '#35b6ff'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.4, 'comic_surprise', -12]],
    stamps: [{ t: 2.5, text: '10分!?', x: 800, y: 1080, rot: 8, color: RED, size: 76, dur: 1.0 }],
    act(lt, s) { sink(s, 0.6, -0.9); const h = s.hero.userData; place(s.hero, -0.1, 0.4);
      hold(s, 'tb', 'R', V(0.3, 1.2 + 0.03 * Math.sin(lt * 4), 0.65), -0.6); h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa'); h.hand('R', 'gu');
      h.face(lt < 2.4 ? { lid: 0.2, brow: 0.4, look: [0.4, 0.2], mouth: 'smile' } : { lid: 0, brow: 0.7, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 2) now: about 3 minutes -> 3x+
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: ['clock'], hud: ['歯みがき', '3分→10分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 5.0], p1: [0.0, 1.48, 4.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.4, 'text_pa', -10], [1.7, 'text_pa', -10], [1.8, 'comic_surprise', -13]],
    tags(lt) { return lt > 0.4 ? [{ t: 0.4, text: 'ふつう 3分', x: 300, y: 1560, h: 80, bg: '#ffffff' }].concat(lt > 1.7 ? [{ t: 1.7, text: '法律 10分', x: 770, y: 1560, h: 108, bg: YEL }] : []) : []; },
    note: '30〜60代の約6割が1〜3分（鳥取県資料）',
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.35, 0.3, 0.2); const c = s.P.clock; c.visible = true; c.position.set(0.6, 1.75, 0.0); c.scale.setScalar(1.6);
      const fast = lt > 1.7; c.userData.mh.rotation.z = -lt * (fast ? 9 : 2); c.userData.hh.rotation.z = -lt * (fast ? 0.8 : 0.2);
      hold(s, 'tb', 'L', V(-0.75, 1.15, 0.55), 0.5); h.hand('L', 'gu'); h.reach('R', V(0.2, 1.6, 0.3)); h.hand('R', 'choki');
      h.face(!fast ? { lid: 0.2, brow: 0.3, look: [0.6, 0.4], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0.6, 0.4], mouth: 'o', open: 1 }); } },
  // 3) a day: 20 minutes, 6,000 strokes
  { sc: 'st', say: ['day'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['1日', '20分'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 5.4], p1: [0.05, 1.45, 4.9], l0: [0.05, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.7, 'whoosh_switch2', -13], [1.9, 'text_pa', -10]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1日 [20分]', y: 480, size: 80, border: CY, sub: '朝10分＋夜10分' }] : []; },
    tags(lt) { return lt > 1.9 ? [{ t: 1.9, text: 'シャカシャカ 6,000回', x: 540, y: 1560, h: 100, bg: YEL }] : []; },
    note: '1秒5往復と仮定（試算）',
    act(lt, s) { sink(s, 0.7, -0.9); const h = s.hero.userData; place(s.hero, -0.1, 0.4); const fast = lt > 1.8;
      scrub(s, lt, fast ? 1.7 : 0.8); h.hand('R', 'gu'); h.arm('L', fast ? 2.5 : 0.3, 0.5, 0.3); h.hand('L', fast ? 'pa' : 'gu'); beard(s, fast ? 0.7 : 0.3);
      h.face(!fast ? { lid: 0.3, brow: 0.2, look: [0.5, 0.2], mouth: 'o', open: 0.4 } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.3], mouth: 'o', open: 0.8 }); } },
  // 4) a year: 122 hours = 5 full days
  { sc: 'st', say: ['year'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['clock'], hud: ['1年', '122時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.5], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.8, 'text_pa', -10], [2.0, 'comic_stupid', -13]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1年で [122時間]', y: 480, size: 74, border: YEL, sub: '20分×365日（試算）' }] : []; },
    tags(lt) { return lt > 1.8 ? [{ t: 1.8, text: 'まる5日 歯みがき', x: 540, y: 1560, h: 96, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0.35, 0.3, -0.15); const c = s.P.clock; c.visible = true; c.position.set(-0.6, 1.6, 0.1); c.scale.setScalar(1.5);
      c.userData.mh.rotation.z = -lt * 14; c.userData.hh.rotation.z = -lt * 1.2;
      scrub(s, lt, 0.7); h.hand('R', 'gu'); h.reach('L', V(-0.3, 1.5, 0.3)); h.hand('L', 'pa');
      h.face(lt < 1.8 ? { lid: 0.2, brow: 0.3, look: [-0.6, 0.3], mouth: 'o', open: 0.4 } : { lid: 0.6, brow: -0.6, look: [0, 0], mouth: 'flat' }); } },
  // 5) a lifetime: 1 year 1 month (recall of the cold open)
  { sc: 'st', say: ['life'], pre: 0.12, pal: HOOK, show: [], hud: ['一生', '1年1か月'], hudColor: YEL,
    cam: { p0: [0.2, 1.6, 6.6], p1: [0.1, 1.5, 5.6], l0: [0.1, 1.45, -0.3] },
    shake: [[0.3, 0.06, 0.5]], lines: [[0.25, 0.7]],
    sfx: [[0.15, 'whoosh_switch1', -12], [0.3, 'impact_doon', -11], [0.35, 'comic_boyon', -12], [0.5, 'text_pa', -10], [2.2, 'comic_pico', -12]],
    cards(lt) { return lt > 0.5 ? [{ t: 0.5, text: '一生で [1年1か月]', y: 480, size: 72, border: YEL, sub: '80年×1日20分＝405日（試算）' }] : []; },
    act(lt, s) { sink(s, 0.8, -0.9); place(s.hero, 0.0, 0.45); const on = burst(s, lt, 0.3); const h = s.hero.userData;
      scrub(s, lt, 1.2); h.hand('R', 'gu'); h.arm('L', on ? 2.6 : 0.4, 0.6, 0.3); h.hand('L', 'pa');
      h.face(!on ? { lid: 0.1, brow: 0.6, look: [0, 0], mouth: 'o', open: 0.5 } : lt < 2.2 ? { lid: 0, brow: 0.9, browY: 1, look: [0.3, 0.6], mouth: 'o', open: 1 } : { lid: 0.5, brow: 0.6, look: [0, 0], mouth: 'smile' }); } },
  // 6) all of Japan: +29 million hours a day
  { sc: 'st', say: ['japan'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ffd23a'], show: ['crowd'], hud: ['日本中', '+2,900万時間'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 6.2], p1: [0.0, 1.9, 7.0], l0: [0.0, 1.2, -0.4], l1: [0.0, 1.3, -0.4], dur: 4.0 },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'whoosh_swing', -13], [2.4, 'comic_surprise', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1日 [2,900万時間]', y: 480, size: 72, border: YEL, sub: '1億2,400万人×14分（試算）' }] : []; },
    act(lt, s) { const cr = s.P.crowd; cr.position.set(0, 0, -0.4); cr.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 8 + i)) * 0.03; });
      const h = s.hero.userData; place(s.hero, 0.0, 0.75); scrub(s, lt, 1); h.hand('R', 'gu'); h.arm('L', 2.5, 0.5, 0.3); h.hand('L', 'pa'); beard(s, 0.5);
      h.face(lt < 2.3 ? { lid: 0.2, brow: 0.4, look: [0.3, 0.2], mouth: 'o', open: 0.5 } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0], mouth: 'o', open: 1 }); } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.32, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); hold(s, 'tb', 'R', V(0.4, 1.0, 0.5), -1.2); h.hand('R', 'gu'); h.arm('L', 0.6, 0.2, 1.8); h.hand('L', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) one sink, family of 4: 40 minutes of waiting, get up 30 min earlier
  { sc: 'st', say: ['sink'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#ff5a4f'], show: ['clock'], hero2: true, hud: ['洗面所', '40分待ち'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 6.0], p1: [0.0, 1.55, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'comic_shock2', -12], [2.6, 'text_pa', -10], [3.4, 'comic_stupid', -13]],
    cards(lt) { return lt < 2.5 ? (lt > 0.3 ? [{ t: 0.3, text: '洗面所 [40分]待ち', y: 480, size: 70, border: RED, sub: '4人×10分（試算）' }] : [])
      : [{ t: 2.5, text: '朝 [30分] 早起き', y: 480, size: 74, border: RED, sub: 'ふつう4人×3分＝12分との差（試算）' }]; },
    act(lt, s) { sink(s, -0.65, -0.9); const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.65, 0.2, 0.1); scrub(s, lt, 0.9); h.hand('R', 'gu'); h.arm('L', 0.3, 0.3, 0.3); beard(s, 0.5);
      h.face({ lid: 0.4, brow: 0.3, look: [0.6, 0], mouth: 'o', open: 0.4 });
      const c = s.P.clock; c.visible = true; c.position.set(0.0, 2.05, -0.6); c.scale.setScalar(1.1); c.userData.mh.rotation.z = -lt * 6;
      place(s.hero2, 0.75, 0.3, -0.3); hold(s, 'tbOld', 'L', V(0.45, 1.05, 0.65), 1.4, 'hero2'); h2.hand('L', 'gu'); h2.arm('R', 0.3, 0.4, 1.6);
      s.hero2.position.y = Math.abs(Math.sin(lt * 7)) * 0.03;
      h2.face(lt < 1.9 ? { lid: 0.3, brow: -0.4, look: [-0.7, 0], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [-0.7, 0.3], mouth: 'o', open: 0.9 }); } },
  // 9) worn-out toothbrushes: 9 days each, 40 a year
  { sc: 'st', say: ['brush'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#ff5a4f'], show: ['desk'], hud: ['歯ブラシ', '年40本'], hudColor: RED,
    cam: { p0: [0.0, 1.6, 5.9], p1: [0.0, 1.55, 5.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.9, 'comic_fall', -13], [1.9, 'text_pa', -10], [2.0, 'coin_toss', -13]],
    cards(lt) { return lt < 1.9 ? (lt > 0.3 ? [{ t: 0.3, text: '[9日]でボロボロ', y: 480, size: 74, border: RED, sub: '交換の目安1か月×6分÷20分（試算）' }] : [])
      : [{ t: 1.9, text: '1年で [40本]', y: 480, size: 78, border: RED, sub: '365日÷9日（試算）' }]; },
    act(lt, s) { const d = s.P.desk; place(d, 0.6, -0.2); const pl = s.P.pile; pl.visible = true; pl.position.set(0.55, 0.77, -0.15); pl.scale.setScalar(1.4);
      const n = lt < 1.9 ? 1 : Math.floor(40 * ease(k(lt, 1.9, 3.3))); pl.userData.items.forEach((b, i) => { b.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.5, 0.35, 0.25); hold(s, 'tbOld', 'R', V(-0.15, 1.25, 0.7), 0.3); h.hand('R', 'gu');
      if (lt < 1.9) { h.arm('L', 0.6, 0.2, 1.8); h.hand('L', 'pa'); h.face({ lid: 0.1, brow: -0.8, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 0.6 }); }
      else { h.arm('L', 2.5, 0.6, 0.2); h.hand('L', 'pa'); h.face({ lid: 0, brow: -1, browY: 1, look: [0.7, -0.3], mouth: 'o', open: 1 }); } } },
  // 10) good news / bad news: shiny teeth / exhausted before breakfast
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#7fa8ff', '#eaf0ff', '#35d0ff'], show: [], hud: ['いい・悪い', 'ニュース'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'text_pa', -10], [3.6, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.3 ? [{ t: 0.3, text: '歯は [ピカピカ]', y: 480, size: 76, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.3, text: '朝ごはん前に [ヘトヘト]', y: 480, size: 62, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.4, text: 'ぐったり…', x: 760, y: 1140, rot: 6, color: RED, size: 72, dur: 1.4 }],
    act(lt, s) { const h = s.hero.userData;
      if (lt < 2.3) { place(s.hero, 0, 0.3); const kr = s.P.kira; kr.visible = true; kr.position.set(0, 1.5, 0.3); kr.rotation.z = lt * 1.5; kr.scale.setScalar(0.8 + 0.2 * Math.sin(lt * 6));
        h.arm('R', 2.5, 0.6, 0.2); h.hand('R', 'choki'); h.arm('L', 0.3, 0.3, 0.3); h.face({ lid: 0.5, brow: 0.7, look: [0, 0], mouth: 'smile' }); return; }
      place(s.hero, 0, 0.3); h.body.rotation.x = 0.25 * ease(k(lt, 2.3, 2.8)); hold(s, 'tb', 'R', V(0.38, 0.95, 0.55), -1.3); h.hand('R', 'gu'); h.arm('L', 0.2, 0.2, 0.1);
      h.face({ lid: 0.7, brow: -1, browY: 1, look: [0, -0.3], mouth: 'o', open: 0.4 }); } },
  // 11) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'できる', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: '3分でいい', x: 770, y: 1130, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1430, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1530, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.3); hold(s, 'tb', 'R', V(0.32, 1.1, 0.6), -0.6); h.hand('R', 'gu'); h.arm('L', 1.0, 0.6, 0.6); h.hand('L', 'pa');
      h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも歯みがきが法律で', '[1回10分]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['歯みがき', '1回10分'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
