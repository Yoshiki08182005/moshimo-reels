// ep62_sumaho_9ji (pop / arm B 生活ルール改変): もしもスマホが夜9時から使えない決まりになったら？
// 型は sp_geppu2x / ep61。台本・数字・小道具は自作（ep58『1か月』とは数字と切り口を変える：夜・睡眠・駆け込み・目覚まし）。
// 前提（試算）:
//   スマホ接触時間 165.1分/日（博報堂DYメディアパートナーズ メディア環境研究所 メディア定点調査2025）= 2時間45分
//   そのうち夜9時〜朝6時の分を3割と仮定 → 49.5 ≒ 50分/日。50×365 = 304時間 = 12.7日
//   寝床でのスクリーン1時間で睡眠24分短い（Hjetland ら 2025, Frontiers in Psychiatry, ノルウェーの大学生4.5万人）→ 50分減で +20分/晩、年122時間 = 5.1日
//   スマホを使う人を8,000万人と仮定: 50分×8,000万 = 7,610年/晩、1台200gで1.6万トン、1分で全員が1通 → 133万通/秒
//   目覚まし時計 1個1,500円×8,000万 = 1,200億円。緊急地震速報など防災情報は例外とする前提
import { run, THREE, V, clamp, ease, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep62_sumaho_9ji.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#2f3f8f', '#dfe6ff', '#ffd23a'];
const BUBS = ['おやすみ', 'また明日', '今どこ?', '急いで!', 'りょ', '8:59!!', '既読?', 'ねた?'];

const tex = (w, h, draw) => new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true });
function plate(w, h, pw, ph, draw) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), tex(pw, ph, draw)); }
function bubble(text, col) { return plate(0.62, 0.3, 248, 120, (c) => { c.fillStyle = col; c.beginPath(); c.roundRect(4, 4, 240, 92, 30); c.fill();
  c.beginPath(); c.moveTo(40, 92); c.lineTo(30, 118); c.lineTo(70, 92); c.fill(); c.fillStyle = '#1c2230'; c.font = 'bold 48px sans-serif'; c.textAlign = 'center'; c.fillText(text, 124, 66); }); }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // phone safe: body top at y=0.55, lid hinged at the back edge (lid.rotation.x < 0 opens)
  { const g = G(); rbox(0.62, 0.55, 0.52, 0.05, '#5d6675', 0, 0.275, 0, g);
    const d = cyl(0.07, 0.07, 0.04, '#d9dde3', 0.14, 0.3, 0.27, g); d.rotation.x = Math.PI / 2; rbox(0.03, 0.06, 0.02, 0.01, '#2c3b6b', 0.14, 0.33, 0.295, g);
    const lb = plate(0.3, 0.12, 160, 64, (c) => { c.fillStyle = RED; c.fillRect(0, 0, 160, 64); c.fillStyle = '#fff'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('LOCK', 80, 46); });
    lb.position.set(-0.12, 0.33, 0.265); g.add(lb);
    const lid = G(); lid.position.set(0, 0.55, -0.26); g.add(lid); rbox(0.64, 0.07, 0.54, 0.03, '#4a5260', 0, 0.035, 0.26, lid); g.userData.lid = lid; reg('safe', g); }
  // message bubbles
  { const g = G(); g.userData.items = BUBS.map((t, i) => { const p = bubble(t, i % 2 ? '#ffffff' : '#9ef0a8'); g.add(p); return p; }); reg('bubs', g); }
  // zzz letters
  { const g = G(); g.userData.items = [0, 1, 2].map(() => { const p = plate(0.22, 0.22, 96, 96, (c) => { c.fillStyle = '#ffffff'; c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.fillText('Z', 48, 80); }); g.add(p); return p; }); reg('zzz', g); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); };
const hold = (s, name, side, p, rx = 0, ry = 0, rz = 0, who = 'hero') => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(rx, ry, rz);
  s[who].userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
function wallClock(s, h, m, x = 0.95, y = 2.1, z = -1.2, sc = 1.3) { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.scale.setScalar(sc);
  c.userData.mh.rotation.z = -m / 60 * Math.PI * 2; c.userData.hh.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; }
function tuck(s, x = 0) { place(s.hero, x, 0.15); const b = s.P.bed; b.visible = true; b.position.set(x - 0.1, 0, 0.1); b.rotation.set(0, 0, 0); b.scale.setScalar(1.25);
  const h = s.hero.userData; h.reach('L', V(x - 0.32, 0.8, 0.6)); h.reach('R', V(x + 0.32, 0.8, 0.6)); h.hand('L', 'gu'); h.hand('R', 'gu'); return h; }
function zzz(s, lt) { const z = s.P.zzz; z.visible = true; const hp = s.hero.position; z.position.set(hp.x + 0.45, 1.7, hp.z + 0.2);
  z.userData.items.forEach((p, i) => { const u = (lt * 0.5 + i / 3) % 1; p.position.set(u * 0.35, u * 0.6, 0); p.scale.setScalar(0.6 + u * 0.8); }); }
function safe(s, x, z, open, sc = 1.25) { const g = s.P.safe; g.visible = true; g.position.set(x, 0, z); g.rotation.set(0, -0.35, 0); g.scale.setScalar(sc); g.userData.lid.rotation.x = -1.7 * open; return g; }
const bub = (s, i, x, y, z, sc = 1) => { const b = s.P.bubs; b.visible = true; b.position.set(0, 0, 0); b.userData.items.forEach((p, j) => { if (j === i) { p.visible = true; p.position.set(x, y, z); p.scale.setScalar(sc); } }); };
function bubsOff(s) { s.P.bubs.userData.items.forEach(p => { p.visible = false; }); }

// cold open / recall: 8:59 -> 9:00, the phone flies out of the hand into the safe, lid slams; the thumb keeps swiping air
function coldScene(s, lt, t0) {
  const h = s.hero.userData; place(s.hero, -0.15, 0.3, 0.12); wallClock(s, 8, lt < t0 ? 59 : 60, -1.0, 2.15, -1.2, 1.3);
  const u = k(lt, t0, t0 + 0.4), shut = k(lt, t0 + 0.4, t0 + 0.5);
  safe(s, 0.85, 0.35, lt < t0 + 0.4 ? 1 : 1 - shut);
  if (lt < t0) { hold(s, 'phone', 'R', V(0.05, 1.1, 0.68), -0.5); h.arm('L', 0.3, 0.3, 0.2); return 0; }
  const p = s.P.phone; p.visible = u < 1; p.position.set(0.05 + 0.75 * u, 1.1 + 0.6 * Math.sin(u * Math.PI) - 0.45 * u, 0.68 - 0.3 * u); p.rotation.set(-0.5, 0, u * 9);
  const sw = Math.sin(lt * 11) * 0.06; h.reach('R', V(0.12 + sw, 1.06, 0.62)); h.hand('R', 'gu'); h.arm('L', 0.3, 0.3, 0.2); return 1;
}

const plan = [
  // 0) cold open (flash-forward of #6): 9:00, the phone is sucked into the safe -> push in to the face, thumb still swiping air: "…クセで"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.4, 1.7, 6.6], p1: [-0.1, 1.48, 3.5], l0: [0.4, 1.2, -0.3], l1: [-0.1, 1.4, 0.3], hold: 1.2, dur: 2.0 },
    shake: [[0.48, 0.08, 0.6]], lines: [[0.25, 0.9]],
    sfx: [[0.0, 'countdown_elec', -12], [0.12, 'whoosh_gust', -11], [0.48, 'impact_doon', -10], [0.3, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_boyon', -11]],
    stamps: [{ t: 0.25, text: '夜9時!! 強制ロック', x: 540, y: 400, rot: -6, color: YEL, size: 80, dur: 1.15 },
      { t: 2.2, text: '…スッ、スッ（クセ）', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 60, dur: 0.8 }],
    act(lt, s) { const on = coldScene(s, lt, 0.1); const h = s.hero.userData;
      if (!on) h.face({ lid: 0.3, brow: 0.2, look: [0.2, -0.6], mouth: 'smile' });
      else if (lt < 1.4) h.face({ lid: 0, brow: 0.9, browY: 1, look: [0.6, -0.3], mouth: 'o', open: 1 });
      else { h.face({ lid: 0.5, brow: 0.1, look: [0, 0], mouth: 'flat' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); } } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 5.6], p1: [0.0, 1.48, 5.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.4, 'comic_surprise', -12]],
    stamps: [{ t: 2.5, text: '夜9時から!?', x: 800, y: 1120, rot: 8, color: RED, size: 72, dur: 1.0 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); wallClock(s, 9, 0, 0.95);
      hold(s, 'phone', 'R', V(0.1, 1.1, 0.62), -0.5); h.arm('L', 0.3, 0.3, 0.2);
      h.face(lt < 2.4 ? { lid: 0.2, brow: 0.3, look: [0.3, -0.6], mouth: 'smile' } : { lid: 0, brow: 0.9, browY: 1, look: [0, 0.2], mouth: 'o', open: 1 }); } },
  // 2) now: 2h45 a day, ~50 min after 9 pm
  { sc: 'st', say: ['now'], pre: 0.12, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['スマホ', '1日2時間45分'],
    cam: { p0: [0.0, 1.55, 4.9], p1: [0.0, 1.5, 4.5], l0: [0.0, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.4, 'text_pa', -10], [2.7, 'comic_pico', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1日 [2時間45分]', y: 480, size: 72, border: CY, sub: 'スマホの接触時間 165.1分' }] : []; },
    note: '博報堂 メディア定点調査2025',
    tags(lt) { const t0 = 2.3; return lt > t0 ? [{ t: t0, text: '夜9時〜朝6時', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '約50分（仮定）', x: 770, y: 1560, h: 96, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.1, 0.2); wallClock(s, 9, 50 * ease(k(lt, 2.3, 3.6)), 0.85);
      hold(s, 'phone', 'R', V(0.0, 1.12, 0.62), -0.5); h.reach('L', V(-0.3, 1.0, 0.6)); h.hand('L', 'pa');
      h.face(lt < 2.3 ? { lid: 0.2, brow: 0.3, look: [0.2, -0.6], mouth: 'smile' } : { lid: 0, brow: 0.6, look: [0.7, 0.5], mouth: 'o', open: 0.5 }); } },
  // 3) a year: 304 h = 13 days of free time
  { sc: 'st', say: ['year'], pre: 0.12, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: [], hud: ['夜の自由時間', '1年304時間'], hudColor: YEL,
    cam: { p0: [0.1, 1.55, 4.9], p1: [0.1, 1.5, 4.5], l0: [0.1, 1.32, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.0, 'sparkle', -13], [2.1, 'text_pa', -10]],
    cards(lt) { return lt < 2.0 ? (lt > 0.3 ? [{ t: 0.3, text: '1年で [304時間]', y: 480, size: 74, border: YEL, sub: '50分×365日（試算）' }] : [])
      : [{ t: 2.0, text: 'まるまる [13日] 分', y: 480, size: 74, border: YEL, sub: '304時間÷24（試算）' }]; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0.1, 0.2); const b = s.P.books; b.visible = true; b.position.set(-0.75, 0, 0.3); b.scale.setScalar(1);
      b.userData.items.forEach((it, i) => { it.visible = i < 14; });
      const up = ease(k(lt, 1.9, 2.3)); h.arm('L', 0.4 + 2.2 * up, 0.5, 0.2); h.arm('R', 0.4 + 2.2 * up, 0.5, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.9 ? { lid: 0.1, brow: 0.5, look: [-0.5, 0], mouth: 'o', open: 0.5 } : { lid: 0.5, brow: 0.8, browY: 0.6, look: [0, 0], mouth: 'smile' }); } },
  // 4) sleep +20 min a night, 5 days a year
  { sc: 'st', say: ['sleep'], pre: 0.12, pal: ['#7fa8ff', '#eaf0ff', '#ffd23a'], show: [], hud: ['睡眠', '+20分'], hudColor: YEL,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.4], l0: [0.05, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.9, 'sparkle', -14], [2.0, 'text_pa', -10]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '睡眠 1晩 [+20分]', y: 480, size: 72, border: CY, sub: '寝床の画面50分減（試算）' }] : []; },
    note: 'Frontiers in Psychiatry 2025（4.5万人）',
    tags(lt) { const t0 = 1.9; return lt > t0 ? [{ t: t0, text: 'ふつう ±0', x: 300, y: 1560, h: 78, bg: '#ffffff' }, { t: t0 + 0.3, text: '1年で 5日分', x: 770, y: 1560, h: 100, bg: YEL }] : []; },
    act(lt, s) { const h = tuck(s, 0); zzz(s, lt); h.face({ lid: 1, brow: 0.3, look: [0, 0], mouth: 'smile' }); s.hero.userData.head.rotation.z = Math.sin(lt * 1.5) * 0.08; } },
  // 5) all of Japan: 7,600 years per night
  { sc: 'st', say: ['japan'], pre: 0.12, pal: ['#ff9fc8', '#fff0f6', '#35d0ff'], show: ['crowd'], hud: ['日本じゅう', '8,000万人'], hudColor: YEL,
    cam: { p0: [0.0, 1.7, 5.6], p1: [0.0, 1.65, 5.2], l0: [0.0, 1.3, -0.3] },
    sfx: [[0.3, 'impact_don', -12], [0.35, 'text_pa', -10]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1晩 [7,600年] 分', y: 480, size: 76, border: YEL, sub: '50分×8,000万人（仮定・試算）' }] : []; },
    act(lt, s) { const c = s.P.crowd; c.visible = true; c.position.set(0, 0, -0.5);
      c.userData.items.forEach((p, i) => { p.rotation.z = Math.sin(lt * 2 + i) * 0.05; });
      const h = s.hero.userData; place(s.hero, 0, 0.4); h.arm('L', 2.4, 0.6, 0.2); h.arm('R', 2.4, 0.6, 0.2); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.3], mouth: 'o', open: 0.9 }); } },
  // 6) 9 pm: 80 million phones lock at once (the cold open, in place)
  { sc: 'st', say: ['lock'], pre: 0.12, pal: HOOK, show: [], hud: ['夜9時', '一斉ロック'], hudColor: YEL,
    cam: { p0: [0.4, 1.7, 6.4], p1: [0.4, 1.66, 6.0], l0: [0.4, 1.2, -0.3] },
    shake: [[0.42, 0.06, 0.5]], lines: [[0.4, 0.8]],
    sfx: [[0.1, 'countdown_elec', -12], [0.2, 'whoosh_gust', -12], [0.42, 'impact_doon', -11], [1.3, 'text_pa', -10]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '[8,000万台] ロック', y: 480, size: 70, border: YEL, sub: '1台200gで 1万6千トン（試算）' }] : []; },
    act(lt, s) { const on = coldScene(s, lt, 0.2); s.hero.userData.face(on ? { lid: 0, brow: 0.9, browY: 1, look: [0.7, -0.3], mouth: 'o', open: 1 } : { lid: 0.3, brow: 0.2, look: [0.2, -0.6], mouth: 'smile' }); } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: [], hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.8], p1: [0, 1.45, 3.4], l0: [0, 1.32, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.2); h.arm('L', 0.6, 0.2, 1.8); h.arm('R', 0.6, 0.2, 1.8); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); } },
  // 8) a message at 9:01 -> the reply comes at 6 am
  { sc: 'st', say: ['reply'], pre: 0.12, pal: ['#5aa9ff', '#e6f2ff', '#ff5a4f'], show: [], hero2: true, hud: ['返事', '9時間待ち'], hudColor: RED,
    cam: { p0: [0.1, 1.6, 5.4], p1: [0.1, 1.55, 5.0], l0: [0.1, 1.3, 0] },
    sfx: [[0.2, 'phone_vibe', -14], [0.4, 'text_pa', -10], [1.9, 'comic_shock2', -11]],
    cards(lt) { return lt > 0.4 ? [{ t: 0.4, text: '返事は [朝6時]', y: 480, size: 72, border: RED, sub: '夜9時1分に送ると 9時間待ち' }] : []; },
    note: '※緊急地震速報など防災情報は例外の前提',
    act(lt, s) { const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.62, 0.3, 0.3); place(s.hero2, 0.7, 0.3, -0.3); wallClock(s, 9, 1, 0.05, 2.15, -1.2, 1.1);
      hold(s, 'phone', 'R', V(0.62, 1.1, 0.62), -0.5, 0, 0, 'hero2'); h2.arm('L', 0.3, 0.3, 0.2); h2.face({ lid: 0.2, brow: 0.3, look: [-0.2, -0.6], mouth: 'smile' });
      bubsOff(s); bub(s, 1, 0.55 - 1.1 * ease(k(lt, 0.3, 1.0)), 1.95, 0.4, 0.9);
      h.arm('L', 0.4, 0.3, 1.9); h.arm('R', 0.4, 0.3, 1.9); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(lt < 1.8 ? { lid: 0.1, brow: 0.4, look: [0.6, 0.6], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0.6, 0.6], mouth: 'o', open: 1 }); } },
  // 9) 8:59 rush: 1.33 million messages per second
  { sc: 'st', say: ['rush'], pre: 0.12, pal: ['#ff8f3a', '#fff0e0', '#3f6fd8'], show: [], hud: ['8時59分', '駆け込み'], hudColor: RED,
    cam: { p0: [0.0, 1.55, 5.0], p1: [0.0, 1.5, 4.6], l0: [0.0, 1.4, 0] }, shake: [[2.4, 0.05, 0.6]],
    sfx: [[0.2, 'countdown_tick', -13], [0.6, 'countdown_tick', -13], [1.0, 'countdown_tick', -13], [2.4, 'whoosh_swing', -13], [2.5, 'text_pa', -10], [3.6, 'comic_shock2', -12]],
    cards(lt) { return lt > 2.4 ? [{ t: 2.4, text: '1秒に [133万通]', y: 480, size: 74, border: RED, sub: '8,000万人が最後の1分に1通（試算）' }] : []; },
    stamps: [{ t: 1.0, text: '駆け込み!!', x: 780, y: 1500, rot: 8, color: RED, size: 80, dur: 1.2 }],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0.3); wallClock(s, 8, 59, 0.95);
      const sw = Math.sin(lt * 22) * 0.04; hold(s, 'phone', 'R', V(0.05, 1.12, 0.66), -0.5); h.reach('L', V(-0.1 + sw, 1.08, 0.7)); h.hand('L', 'gu');
      const B = s.P.bubs; B.visible = true; B.userData.items.forEach((p, i) => { const u = (lt * 0.9 + i / BUBS.length) % 1; p.visible = lt > 0.3;
        p.position.set(Math.sin(i * 2.1) * 1.0, 1.0 + u * 1.1, 0.2 - (i % 3) * 0.3); p.scale.setScalar(0.7); });
      h.face({ lid: 0, brow: 0.9, look: [0.1, -0.6], mouth: 'o', open: 0.6 }); h.body.rotation.z = Math.sin(lt * 9) * 0.03; } },
  // 10) the alarm doesn't ring: alarm clocks for everyone = 120 billion yen
  { sc: 'st', say: ['alarm'], pre: 0.12, pal: ['#7bd88f', '#effbf1', '#ff5a4f'], show: ['desk'], hud: ['目覚まし', '鳴らない'], hudColor: RED,
    cam: { p0: [0.1, 1.6, 5.8], p1: [0.1, 1.55, 5.4], l0: [0.15, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.6, 'comic_fall', -12], [2.0, 'coin_toss', -12], [2.1, 'text_pa', -10]],
    cards(lt) { return lt < 1.9 ? (lt > 0.3 ? [{ t: 0.3, text: '目覚ましも [鳴らない]', y: 480, size: 66, border: RED, sub: '朝6時まで スマホはロック' }] : [])
      : [{ t: 1.9, text: '時計代 [1,200億円]', y: 480, size: 70, border: RED, sub: '1個1,500円×8,000万人（試算）' }]; },
    act(lt, s) { const h = tuck(s, -0.35); const d = s.P.desk; place(d, 0.95, 0.35); wallClock(s, 8, 40, 0.95, 0.98, 0.35, 0.7);
      s.P.clock.rotation.set(-0.2, -0.3, 0); const sf = safe(s, 0.95, -0.6, 0, 0.9);
      if (lt < 1.6) { zzz(s, lt); h.face({ lid: 1, brow: 0.3, look: [0, 0], mouth: 'smile' }); }
      else { s.P.zzz.visible = false; h.face({ lid: 0, brow: -1, browY: 1, look: [0.7, -0.2], mouth: 'o', open: 1 }); h.reach('R', V(0.3, 1.0, 0.55)); h.hand('R', 'pa'); } } },
  // 11) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.12, pal: ['#ffb84a', '#fff4dc', '#35d0ff'], show: [], hud: ['夜9時ルール', 'いい・悪い'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 4.8], p1: [0.0, 1.45, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [0.6, 'sparkle', -14], [2.4, 'text_pa', -10], [3.4, 'comic_stupid', -12]],
    cards(lt) { return lt < 2.3 ? (lt > 0.3 ? [{ t: 0.3, text: '[ぐっすり] 眠れる', y: 480, size: 72, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.3, text: '夜が [ヒマ] すぎる', y: 480, size: 72, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 3.3, text: 'ヒマ…', x: 760, y: 1120, rot: 6, color: RED, size: 76, dur: 1.3 }],
    act(lt, s) { if (lt < 2.3) { const h = tuck(s, 0); zzz(s, lt); h.face({ lid: 1, brow: 0.4, look: [0, 0], mouth: 'smile' }); return; }
      const h = s.hero.userData; place(s.hero, 0, 0.3); wallClock(s, 9, 5 + (lt - 2.3) * 2, 0.95); safe(s, 0.85, 0.2, 0, 1.0);
      h.reach('R', V(0.15, 1.08, 0.62)); h.hand('R', 'pa'); h.arm('L', 0.2, 0.2, 0.2); h.head.rotation.z = Math.sin(lt * 1.2) * 0.1;
      h.face({ lid: 0.6, brow: -0.6, look: [0.3, -0.6], mouth: 'flat' }); } },
  // 12) question + follow
  { sc: 'st', say: ['cta'], pre: 0.12, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.5, 4.8], p1: [0.05, 1.5, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'あり', x: 310, y: 1130, h: 104, bg: CY }, { t: t0 + 0.2, text: 'ムリ', x: 770, y: 1130, h: 104, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) { const h = s.hero.userData; place(s.hero, -0.05, 0.3); hold(s, 'phone', 'R', V(0.22, 1.25, 0.6), -0.2, 0, -0.2); h.arm('L', 1.0, 0.6, 0.6); h.hand('L', 'pa');
      h.face({ lid: 0.35, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08; } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもスマホが夜9時から', '[使えない]決まりになったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['スマホ', '夜9時から禁止'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
