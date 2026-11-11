// ep20 (pop スタイル第1作・見本): もしも反応速度が10倍になったら？
// 型: 冒頭3秒でタイトル＋最初の結論 → 上部ピル(HUD) → 2〜5秒の小ネタ連打 → 「でも落とし穴」→ 体感時間が10倍 → 問いかけで終わる。ナレーション(voice.py)に映像を合わせる。
// 前提: 人の反応時間 約0.2〜0.25秒 → 10倍で0.025秒 / 落下距離 d=½gt²: 0.25秒で約30.6cm、0.025秒で約3.1mm
// 野球: 投手板〜本塁18.44m ÷ 時速160km(秒速44.4m) ≒ 0.41秒。スイング約0.15秒、反応0.025秒なら約0.24秒(全体の約6割)見てから振れる
// 体感時間: 脳の処理も10倍速いと仮定 → 3分=30分、50分=8時間20分、夏休み40日=400日
// 明かり: 蛍光灯は電源周波数の2倍(東日本100回/秒・西日本120回/秒)で明滅 → 10倍速の目には毎秒10〜12回に相当
// 脳のエネルギー: 約20W ≒ 1日約410kcal → 10倍と仮定して約4,100kcal ÷ おにぎり1個約180kcal ≒ 23個
import { run, THREE, V, clamp, ease, lerp } from '../engine/core.js';
import { buildToyStage } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep20_hannou10.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f';
const SLOW = ['体感時間', '×10'];
let S; // stage api (set when the scene is built)
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 150, 800), y + dy]; };

const plan = [
  // 1) hook: a ruler is dropped and stops at once
  { sc: 'st', say: ['hook', 'ruler'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['rulerA', 'gripA', 'thumb'],
    cam: { p0: [0.2, 1.5, 4.1], p1: [0.2, 1.46, 3.6], l0: [0.14, 1.44, 0], l1: [0.14, 1.4, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.0, 'whoosh_swing', -13], [1.1, 'text_pa', -8], [3.9, 'sparkle', -12]],
    stamps: [{ t: 1.1, text: 'ピタッ！', x: 300, y: 1170, rot: -8, color: '#ffd23a', size: 110, dur: 1.3 }], lines: [[1.05, 1.5]],
    cards: (lt) => lt > 3.75 ? [{ t: 3.75, text: '落下 [3mm]', x: 660, y: 1130, size: 64, border: CY }] : [],
    act(lt, s) {
      const h = s.hero.userData, rel = 1.0, tgt = V(0.44, 1.33, 0.26);
      s.hero.position.set(-0.14, 0, 0); s.hero.rotation.y = 0.12;
      h.reach('R', tgt); h.arm('L', 0.1, 0.2, 0.25);
      const drop = lt < rel ? 0 : 0.006, y = 1.33 + 0.3 - drop;
      s.P.rulerA.position.set(0.44, y, 0.37); s.P.thumb.position.set(0.44 + (lt < rel ? 0.1 : 0), 1.335, 0.42);
      const open = ease(k(lt, rel, rel + 0.25));
      s.P.gripA.position.set(0.44, 1.33 + 0.6 + open * 0.1, 0.37); s.P.gripA.rotation.z = 2.5; s.P.gripA.userData.thumb.position.x = -0.1 * (1 - open) - 0.16 * open;
      h.face({ lid: lt < rel ? 0.12 : 0.42, brow: 0.35, look: [0.1, 0], mouth: 'smile' }); h.head.rotation.set(0.02, -0.12, lt > rel ? 0.08 : 0);
    } },
  // 2) comparison: normal 0.25 s = 30 cm, you 0.025 s = 3 mm (shown 10x slower than real time)
  { sc: 'st', say: ['normal', 'you'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], hero: false, show: ['rulerA', 'rulerB', 'gripA', 'gripB'],
    cam: { p0: [0, 1.25, 3.45], p1: [0, 1.25, 3.25], l0: [0, 1.25, 0] },
    sfx: [[1.3, 'whoosh_slide', -14], [3.85, 'text_pa', -10], [7.05, 'text_pa', -8], [7.1, 'sparkle', -11]],
    tags(lt) {
      const sh = this, rA = sh.lt.normal + 1.25, rB = sh.lt.you + 1.0, u = k(lt, rA, rA + 2.5), u2 = k(lt, rB, rB + 0.25);
      const out = [{ text: 'ふつう', x: 287, y: 470, h: 70, bg: '#ffffff' }, { text: 'あなた', x: 793, y: 470, h: 70, bg: CY },
        { text: (0.25 * u).toFixed(2) + '秒', x: 287, y: 550, h: 60, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' },
        { text: (0.025 * u2).toFixed(3) + '秒', x: 793, y: 550, h: 60, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' }];
      if (u >= 1) out.push({ t: rA + 2.5, text: '30cm', x: 287, y: 960, h: 84, bg: '#ffffff' });
      if (u2 >= 1) out.push({ t: rB + 0.25, text: '3mm', x: 793, y: 960, h: 84, bg: CY });
      return out;
    },
    stamps: [], note: '落下距離＝½×重力×時間²（10倍スローで再生）',
    act(lt, s, gt, sh) {
      const rA = sh.lt.normal + 1.25, rB = sh.lt.you + 1.0, u = k(lt, rA, rA + 2.5), u2 = k(lt, rB, rB + 0.25);
      s.P.rulerA.position.set(-0.3, 1.35 - 0.612 * u * u, 0.02); s.P.rulerB.position.set(0.3, 1.35 - 0.0061 * u2 * u2, 0.02);
      s.P.gripA.position.set(-0.3, 1.05, 0); s.P.gripB.position.set(0.3, 1.05, 0);
      s.P.gripA.userData.thumb.position.x = u >= 1 ? 0 : -0.1; s.P.gripB.userData.thumb.position.x = u2 >= 1 ? 0 : 0.1;
    } },
  // 3) egg rolls off the counter
  { sc: 'st', say: ['egg'], pal: ['#6bb6ff', '#eef6ff', '#ffffff'], show: ['counter', 'egg'],
    cam: { p0: [0.42, 1.8, 3.8], p1: [0.45, 1.75, 3.6], l0: [0.42, 1.12, 0] },
    sfx: [[1.32, 'text_pa', -9], [1.5, 'comic_pico', -11]],
    stamps: [{ t: 1.4, text: 'セーフ！', x: 300, y: 700, rot: -8, color: '#ffd23a', size: 112, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(-0.78, 0, -0.3);
      s.hero.position.set(0.66, 0, 0.1); s.hero.rotation.y = -0.3;
      const roll = ease(k(lt, 0.15, 1.15)), fall = k(lt, 1.15, 1.32), lift = ease(k(lt, 1.5, 2.1));
      const hand = V(lerp(0.5, 0.34, lift), lerp(0.8, 1.16, lift), lerp(0.02, 0.45, lift));
      h.reach('L', hand); h.arm('R', 0, 0.15, 0.1);
      const e = s.P.egg;
      if (lt < 1.15) { e.position.set(lerp(-0.3, 0.47, roll), 1.02, -0.02); e.rotation.z = -roll * 9; }
      else { e.position.set(lerp(0.47, hand.x, fall), lerp(1.02, hand.y + 0.13, fall * fall), lerp(-0.02, hand.z, fall)); if (fall >= 1) e.position.set(hand.x, hand.y + 0.13, hand.z); }
      h.face({ lid: 0.3, brow: 0.2, look: [-0.5, lt < 1.4 ? -0.6 : 0], mouth: 'smile' }); h.head.rotation.set(lt < 1.4 ? 0.2 : 0, 0.15, 0);
    } },
  // 4) rock-paper-scissors: you choose after seeing the other hand
  { sc: 'st', say: ['janken'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], hero2: true,
    cam: { p0: [0, 1.32, 4.8], p1: [0, 1.3, 4.6], l0: [0, 1.22, 0] },
    sfx: [[0.35, 'comic_pico', -14], [0.95, 'comic_pico', -14], [1.55, 'text_pa', -10], [1.75, 'comic_jajean', -9], [3.4, 'sparkle', -12]],
    tags(lt) {
      if (lt < 1.55) return [];
      const a = scr(S.hero2.userData.handPos('L'), 0, -110), b = scr(S.hero.userData.handPos('R'), 0, -110), out = [{ t: 1.55, text: 'パー', x: a[0] + 70, y: a[1], h: 74, bg: '#ffffff' }];
      if (lt > 1.72) out.push({ t: 1.72, text: 'チョキ', x: b[0] - 70, y: b[1], h: 74, bg: CY });
      return out;
    },
    cards: (lt) => lt > 3.25 ? [{ t: 3.25, text: '[∞]連勝', y: 520, size: 84, border: CY }] : [],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.hero.position.set(-0.62, 0, 0); s.hero.rotation.y = 0.6; s.hero2.position.set(0.62, 0, 0); s.hero2.rotation.y = -0.6;
      h.arms[1].hand.scale.setScalar(1.5); h2.arms[0].hand.scale.setScalar(1.5);
      const pump = lt < 1.55 ? Math.abs(Math.sin(lt / 0.6 * Math.PI)) * 0.16 : 0;
      h.reach('R', V(-0.2, 1.1 + pump, 0.36)); h2.reach('L', V(0.2, 1.1 + pump, 0.36));
      if (lt >= 1.55) h2.hand('L', 'pa'); if (lt >= 1.72) h.hand('R', 'choki');
      h.face({ lid: 0.4, brow: 0.3, look: [0.6, -0.2], mouth: 'smile' });
      h2.face(lt < 1.75 ? { look: [-0.6, -0.2], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [-0.5, -0.4], mouth: 'o', open: 1.2 });
    } },
  // 5) pinch a mosquito out of the air
  { sc: 'st', say: ['ka'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['ka'],
    cam: { p0: [0.12, 1.5, 3.4], p1: [0.14, 1.5, 3.2], l0: [0.12, 1.42, 0] },
    sfx: [[0.0, 'whoosh_gust', -18], [0.9, 'text_pa', -9]],
    stamps: [{ t: 0.92, text: 'つまんだ', x: 300, y: 1130, rot: 6, color: '#ffffff', size: 92, dur: 0.75 }],
    act(lt, s) {
      const h = s.hero.userData, c = lt < 0.9, m = s.P.ka, p = V(0.42, 1.52, 0.32);
      s.hero.position.set(-0.12, 0, 0);
      if (c) m.position.set(0.42 + (0.9 - lt) * 0.5 + Math.sin(lt * 23) * 0.04, 1.52 + Math.sin(lt * 17) * 0.07, 0.32); else m.position.copy(p).add(V(0.02, 0.08, 0.06));
      m.scale.setScalar(1.15); m.rotation.y = -1.2; m.userData.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (c ? Math.sin(lt * 140) * 0.9 : 0.2); });
      h.reach('R', c ? V(0.36, 1.3 + lt * 0.2, 0.3) : p); h.arm('L', 0.05, 0.15, 0.2);
      h.face({ lid: 0.35, look: [0.7, 0.3], mouth: 'flat' }); h.head.rotation.set(0, -0.15, 0);
    } },
  // 6) baseball: watch a 160 km/h pitch for most of its flight, then swing
  { sc: 'st', say: ['yakyu'], pal: ['#8fd3ff', '#52b45a', '#ffffff'], show: ['ball', 'bat'],
    cam: { p0: [0.15, 1.3, 4.3], p1: [0.15, 1.3, 4.1], l0: [0.12, 1.18, 0] },
    sfx: [[0.1, 'whoosh_slide', -16], [2.35, 'impact_don', -8], [2.4, 'comic_jajean', -10]],
    tags(lt) { const p = scr(S.P.ball.position, 0, -80); return lt < 2.3 ? [{ text: '160km/h', x: Math.min(p[0], 760), y: p[1], h: 70, bg: '#ffffff' }, { t: 0.5, text: 'まだ見てる…', x: 360, y: 450, h: 76, bg: CY }] : []; },
    stamps: [{ t: 2.35, text: 'カキーン！', x: 520, y: 760, rot: -8, color: '#ffd23a', size: 120, dur: 1.2 }], lines: [[2.3, 2.9]],
    note: '時速160kmの球は、約0.41秒で届く（18.44m）',
    act(lt, s) {
      const h = s.hero.userData, sw = ease(k(lt, 2.2, 2.42));
      s.hero.position.set(-0.4, 0, 0); s.hero.rotation.y = 1.25 - sw * 1.25;
      h.arm('R', 1.15, 0.25, 1.1); h.arm('L', 1.15, -0.15, 1.1);
      const bat = s.P.bat; h.arms[1].hand.add(bat); bat.position.set(0, 0, 0); bat.rotation.set(-2.4 + sw * 1.2, 0, 0.3);
      const b = s.P.ball;
      if (lt < 2.3) b.position.set(lerp(1.15, 0.12, lt / 2.3), 1.08, 0.3); else { const f = lt - 2.3; b.position.set(0.12 + f * 4.5, 1.08 + f * 4, 0.3 - f * 2); }
      b.rotation.z = lt * 3;
      h.face({ lid: lt < 2.2 ? 0.45 : 0.1, brow: 0.5, look: [0.8, 0], mouth: lt < 2.2 ? 'flat' : 'smile' }); h.body.rotation.x = 0.1;
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.5], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) the brain is 10x faster, so the world looks 10x slower
  { sc: 'st', say: ['brain'], pal: ['#b59cff', '#f3efff', '#ffffff'], hero2: true, show: ['ball', 'clock'], hud: SLOW, hudColor: RED,
    cam: { p0: [0, 1.4, 4.6], p1: [0, 1.38, 4.3], l0: [0, 1.3, 0] },
    sfx: [[3.3, 'vanish_warp', -13]],
    tags(lt) { const p = scr(S.hero.userData.head.getWorldPosition(V(0, 0, 0)), 0, -330), out = [{ t: 0.3, end: 3.2, text: '脳 ×10', x: p[0], y: Math.max(p[1], 430), h: 80, bg: CY }];
      if (lt > 3.3) { const a = scr(S.hero2.userData.head.getWorldPosition(V(0, 0, 0)), 0, -230), b = scr(S.P.ball.position, 0, -80); out.push({ t: 3.3, text: 'スロ〜…', x: a[0], y: a[1], h: 70, bg: '#ffffff' }, { t: 3.6, text: 'スロ〜…', x: b[0], y: b[1], h: 70, bg: '#ffffff' }); }
      return out; },
    act(lt, s, gt) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.hero.position.set(0.2, 0, 0.2); s.hero2.position.set(-0.82 + lt * 0.012, 0, -1.0); s.hero2.rotation.y = 1.2; s.hero2.scale.setScalar(0.95);
      h2.arm('L', 0.5, 0.1, 0.4); h2.arm('R', -0.4, 0.1, 0.2); h2.body.position.y = Math.sin(lt * 0.5) * 0.02;
      s.P.ball.position.set(0.82, 2.0 - lt * 0.05, -0.3); s.P.clock.position.set(-0.75, 2.75, -2.33); s.P.clock.userData.mh.rotation.z = -lt * 0.02; s.P.clock.userData.hh.rotation.z = -1.1;
      h.face({ lid: lt < 3.2 ? 0.15 : 0.55, brow: lt < 3.2 ? 0 : 0.2, look: [lt < 3.2 ? 0 : Math.sin(lt) * 0.6, 0], mouth: 'flat' }); h.arm('L', 0, 0.2, 0.15); h.arm('R', 0, 0.2, 0.15);
    } },
  // 9) cup noodles
  { sc: 'st', say: ['ramen'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['counter', 'cup'], hud: SLOW, hudColor: RED,
    cam: { p0: [0.05, 1.42, 3.6], p1: [0.05, 1.4, 3.4], l0: [0.05, 1.22, 0] },
    sfx: [[0.9, 'countdown_tick', -14, 1.6]],
    cards: [{ t: 0.9, text: '3:00 → 体感[30:00]', y: 480, size: 66 }],
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(0, 0, -0.2); s.hero.position.set(0.32, 0, -0.95);
      s.P.cup.position.set(-0.2, 0.93, -0.05); s.P.cup.scale.setScalar(1.25);
      s.P.cup.userData.steam.forEach((m, i) => { const u = (lt * 0.35 + i / 3) % 1; m.position.set((i - 1) * 0.05 + Math.sin(u * 6 + i) * 0.03, 0.26 + u * 0.4, 0); m.scale.setScalar(0.035 * (1 - u * 0.6)); });
      h.face({ lid: 0.5, brow: -0.3, look: [-0.8, -0.7], mouth: 'flat' }); h.head.rotation.set(0.28, 0.25, 0.1);
      h.reach('L', V(0.02, 0.98, -0.2)); h.reach('R', V(0.62, 0.98, -0.2));
    } },
  // 10) class
  { sc: 'st', say: ['jugyo'], pal: ['#f3e3c3', '#e8cfa0', '#c79a5b'], show: ['board', 'desk', 'clock'], hud: SLOW, hudColor: RED,
    cam: { p0: [0, 1.4, 3.9], p1: [0, 1.38, 3.7], l0: [0, 1.25, 0] },
    sfx: [[0.6, 'comic_fall', -12]],
    cards: [{ t: 0.9, text: '50分 → [8時間20分]', y: 480, size: 66 }],
    act(lt, s) {
      const h = s.hero.userData; s.P.desk.position.set(0, 0, 0.3); s.hero.position.set(0, 0, -0.3);
      s.P.clock.position.set(-0.85, 1.85, -2.3); s.P.clock.userData.mh.rotation.z = -lt * 0.03; s.P.clock.userData.hh.rotation.z = -2.2;
      const d = ease(k(lt, 0.3, 1.0)); h.body.rotation.x = 0.04 + d * 0.1; h.head.rotation.set(d * 0.16, 0, d * 0.2);
      h.reach('L', V(-0.22, 0.82, 0.25)); h.reach('R', V(0.22, 0.82, 0.25));
      h.face({ lid: 0.25 + d * 0.5, brow: -0.6, look: [0, -0.4], mouth: 'flat' });
    } },
  // 11) lights look like they blink (only the bulb blinks: no full-screen flashing)
  { sc: 'st', say: ['light'], pal: ['#7f8fa6', '#dfe6ee', '#ffffff'], dim: 0.92, show: ['lamp'], hud: SLOW, hudColor: RED,
    cam: { p0: [0.1, 1.7, 3.9], p1: [0.1, 1.7, 3.7], l0: [0.1, 1.6, 0] },
    sfx: [[0.5, 'comic_pico', -15], [1.0, 'comic_pico', -15], [1.5, 'comic_pico', -15]],
    stamps: [{ t: 0.5, text: 'チカ', x: 700, y: 720, rot: 8, color: '#fff3a8', size: 80, dur: 0.5 }, { t: 1.2, text: 'チカ', x: 760, y: 800, rot: -6, color: '#fff3a8', size: 80, dur: 0.5 }],
    note: '蛍光灯は1秒に100〜120回、明るさがゆれている',
    act(lt, s) {
      const h = s.hero.userData, L = s.P.lamp; s.hero.position.set(-0.2, 0, 0); L.position.set(0.42, 2.35, 0);
      L.userData.bulb.material = Math.floor(lt * 10) % 2 ? L.userData.on : L.userData.off;
      h.face({ lid: 0.55, brow: 0.7, look: [0.6, 0.8], mouth: 'flat' }); h.head.rotation.set(-0.3, -0.25, 0); h.reach('R', V(0.2, 1.72, 0.42));
    } },
  // 12) energy
  { sc: 'st', say: ['onigiri'], pal: ['#8fe3c0', '#effbf5', '#ffffff'], show: ['counter', 'onigiri'], hud: SLOW, hudColor: RED,
    cam: { p0: [0, 1.42, 3.7], p1: [0, 1.4, 3.5], l0: [0, 1.22, 0] },
    sfx: [[0.3, 'comic_eat', -11], [1.5, 'comic_eat', -12], [2.8, 'comic_eat', -12]],
    cards(lt) { const n = Math.round(23 * ease(k(lt, 0.4, 2.9))); return [{ t: 0.3, text: `おにぎり[${n}]個`, y: 480, size: 72, border: CY }]; },
    note: '脳は約20W≒1日約410kcal。10倍と仮定、おにぎり1個≒180kcal',
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(23 * ease(k(lt, 0.4, 2.9)));
      s.P.counter.position.set(0, 0, -0.2); s.hero.position.set(0.45, 0, -0.95);
      s.P.onigiri.position.set(-0.22, 0.93, -0.12); s.P.onigiri.scale.setScalar(0.82); s.P.onigiri.userData.items.forEach((it, i) => { it.visible = i < n; });
      h.face({ lid: 0.2, look: [-0.5, -0.5], mouth: 'o', open: 0.4 + Math.abs(Math.sin(lt * 9)) * 0.9 }); h.head.rotation.set(0.15, 0.2, 0);
      h.reach('L', V(0.3, 1.2 + Math.sin(lt * 9) * 0.03, -0.6)); h.reach('R', V(0.75, 0.98, -0.2));
    } },
  // 13) good news
  { sc: 'st', say: ['good'], pal: ['#59c3ff', '#ffe6a8', '#ffffff'], show: ['sun', 'sunf1', 'sunf2'], hud: SLOW, hudColor: CY,
    cam: { p0: [0, 1.5, 4.2], p1: [0, 1.48, 4.0], l0: [0, 1.4, 0] },
    sfx: [[0.0, 'sparkle', -11], [1.3, 'comic_jajean', -11]],
    cards(lt) { const t0 = this.lt.good + 1.2; return lt > t0 ? [{ t: t0, text: '夏休み 体感[400日]', y: 480, size: 68, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.sun.position.set(0.5, 2.45, -2.2); s.P.sun.rotation.z = lt * 0.4; s.P.sunf1.position.set(-0.72, 0, -1.2); s.P.sunf2.position.set(0.78, 0, -1.5); s.P.sunf2.scale.setScalar(0.85);
      const j = Math.abs(Math.sin(lt * 5)) * 0.06; h.body.position.y = j; h.shades(true);
      h.arm('L', 2.7, 0.35, 0.2); h.arm('R', 2.7, 0.35, 0.2); h.face({ mouth: 'o', open: 1.1 });
    } },
  // 14) bad news
  { sc: 'st', say: ['bad'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['desk', 'books'], hud: SLOW, hudColor: RED,
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.55, 4.3], l0: [0, 1.38, 0], l1: [0, 1.5, 0] },
    sfx: [[1.2, 'comic_boyon', -11], [2.2, 'comic_shock2', -9]],
    cards(lt) { const t0 = this.lt.bad + 1.5; return lt > t0 ? [{ t: t0, text: '宿題も [×10]', y: 480, size: 72 }] : []; },
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(lerp(3, 34, ease(k(lt, 1.0, 2.4))));
      s.P.desk.position.set(0.32, 0, 0); s.P.books.position.set(0.32, 0.77, 0); s.P.books.userData.items.forEach((it, i) => { it.visible = i < n; });
      s.hero.position.set(-0.42, 0, 0.25); s.hero.rotation.y = 0.35;
      const up = ease(k(lt, 1.0, 2.2)); h.head.rotation.set(-0.35 * up, 0.2, 0);
      h.face({ lid: 0, brow: -1, browY: up, look: [0.5, 0.6 * up], mouth: 'o', open: 0.5 + up * 0.7 }); h.arm('L', 0.2, 0.25, 1.6 * up); h.arm('R', 0.2, 0.25, 1.6 * up);
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], hud: ['反応速度', '×10'],
    cam: { p0: [0, 1.5, 3.9], p1: [0, 1.5, 3.5], l0: [0, 1.42, 0] },
    sfx: [[0.0, 'question', -11], [1.3, 'text_pa', -11], [1.5, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.2; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: 'rgba(24,26,32,0.9)', fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; h.head.rotation.set(0, 0, Math.sin(lt * 1.6) * 0.12);
      h.face({ lid: 0.12, browY: 1, look: [0, 0], mouth: 'smile' }); h.reach('R', V(0.16, 1.2, 0.36)); h.arm('L', 0.1, 0.2, 0.3);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも反応速度が', '[10倍]になったら？'], titleEnd: at('ruler') - 0.1, hud: ['反応速度', '×10'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; return st; } },
});
