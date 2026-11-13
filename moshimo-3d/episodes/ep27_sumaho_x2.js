// ep27_sumaho_x2 (pop スタイル / アームA 原因を拡大): もしもスマホを見る時間が毎年2倍になったら？
// 構成の型は sp_geppu2x。台本・数字・ネタは自作。
// 前提: 基準 = 1日165分（博報堂DYメディアパートナーズ「メディア定点調査2025」携帯/スマホの1日あたり接触時間・東京地区15〜69歳）
//   毎年2倍: 1年目 330分=5.5h / 2年目 660分=11h / 3年目 1320分=22h / 4年目 2640分=44h
//   映画1本110分 → 330/110 = 3本 / 動画1本20秒 → 330分×3本 = 990本
//   起きている時間16h（睡眠8hとして）→ 11/16 = 0.69 ≒ 7割 / 22h → 寝られるのは 24-22 = 2h
//   スワイプ: 1分に20回（3秒に1回）×1回6cm → 1320分 ×20 ×0.06m = 1,584m/日 → ×365 = 578km/年（東京〜新大阪 営業キロ552.6km）
//   首: 60度うつむくと首への負荷は約60ポンド≒27kg（Hansraj 2014, Surgical Technology International）→ 5kg袋 5.4袋分
//   充電: 画面オンで7時間もつとして 22/7 = 3.1回
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep27_sumaho_x2.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), y + dy]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#ff9f5a', '#fbe9d0', '#3f6fd8'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  // second phone (for hero2)
  { const p = G(); rbox(0.16, 0.3, 0.025, 0.02, '#e2463c', 0, 0, 0, p); rbox(0.136, 0.262, 0.006, 0.012, M('#e6f6ff', 0.4), 0, 0, 0.012, p); reg('phone2', p); }
  // rice bags: items (5kg bag each)
  { const g = G(); g.userData.items = [];
    const tex = canvasTex(256, 160, (c) => { c.fillStyle = '#fbfaf4'; c.fillRect(0, 0, 256, 160); c.fillStyle = '#e2463c'; c.fillRect(0, 54, 256, 52); c.fillStyle = '#ffffff'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('お米 5kg', 128, 82); });
    const fm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
    for (let i = 0; i < 6; i++) { const b = G(); rbox(0.4, 0.17, 0.26, 0.06, '#fbfaf4', 0, 0, 0, b); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.14), fm); f.position.z = 0.132; b.add(f); g.add(b); g.userData.items.push(b); }
    reg('rice', g); }
  // smoke puffs over the phone
  { const g = G(); g.userData.items = []; const sm = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, roughness: 1 }); for (let i = 0; i < 6; i++) g.userData.items.push(sph(0.06, sm, 0, 0, 0, g)); reg('smoke', g); }
  // motion streaks for the fast thumb
  { const g = G(); g.userData.items = []; for (let i = 0; i < 4; i++) { const m = caps(0.012, 0.22, basic('#ffffff'), 0, 0, 0, g); m.castShadow = false; g.userData.items.push(m); } reg('streak', g); }
  // charging cable: a simple outlet plug on the floor line
  { const g = G(); rbox(0.22, 0.3, 0.04, 0.03, '#ffffff', 0, 0, 0, g); for (const x of [-0.04, 0.04]) rbox(0.02, 0.06, 0.01, 0.005, '#2c3b6b', x, 0.03, 0.022, g); g.position.set(0.9, 0.5, -2.36); reg('outlet', g); }
}
// phone in one hand at p (world); screen tipped toward the hero
function holdPhone(s, side = 'L', p = V(-0.12, 0.98, 0.45), who = s.hero, name = 'phone', tilt = -0.7) {
  const ph = s.P[name], sg = side === 'R' ? 1 : -1; ph.visible = true; ph.position.copy(p); ph.rotation.set(tilt, 0, 0);
  who.userData.reach(side, p.clone().add(V(0.06 * sg, -0.07, -0.05)));
}
// thumb swiping on the phone with the other hand
function swipe(s, lt, speed = 6, amp = 0.06, p = V(-0.12, 0.98, 0.45)) {
  const u = Math.sin(lt * speed * Math.PI * 2);
  s.hero.userData.reach('R', p.clone().add(V(0.05, 0.02 + u * amp, 0.05)));
}
const lookPhone = (h, o = {}) => { h.face({ lid: 0.35, look: [0, -0.8], mouth: 'flat', ...o }); h.head.rotation.x = 0.32; };
function smoke(s, base, lt, n = 6) {
  const g = s.P.smoke; g.visible = true; g.position.copy(base);
  g.userData.items.forEach((m, i) => { const u = (lt * 1.2 + i / n) % 1; m.visible = i < n; m.position.set(0.1 + Math.sin(i * 2.1 + lt * 2) * 0.07, u * 0.22, 0); m.scale.setScalar(0.04 + u * 0.09); m.material.opacity = 0.85 * (1 - u); });
}
function streaks(s, base, lt) {
  const g = s.P.streak; g.visible = true; g.position.copy(base);
  g.userData.items.forEach((m, i) => { m.position.set(0.14 + i * 0.05, Math.sin(lt * 40 + i) * 0.1, 0.05); m.rotation.z = 0; m.visible = Math.sin(lt * 30 + i * 1.7) > -0.3; });
}
const giant = (s, sc) => s.hero.userData.arms[1].hand.scale.setScalar(sc);
const clockAt = (s, x, y, z, hrs) => { const c = s.P.clock; c.visible = true; c.position.set(x, y, z); c.rotation.set(0, 0, 0); c.userData.hh.rotation.z = -hrs / 12 * Math.PI * 2; c.userData.mh.rotation.z = -hrs * Math.PI * 2; };

// the flash-forward/payoff scene: thumb grows giant, phone smokes
function thumbScene(lt, s, t0 = 0.25, o = {}) {
  const h = s.hero.userData, g = ease(k(lt, t0, t0 + 0.25)), p = V(-0.08, 0.84, 0.5);
  s.hero.position.set(0, 0, 0); holdPhone(s, 'L', p);
  if (lt > t0) { swipe(s, lt, 9, 0.05, p); giant(s, 1 + g * (o.big ?? 1.9)); streaks(s, s.hero.userData.handPos('R'), lt); smoke(s, p.clone().add(V(0.32, -0.05, 0.05)), lt); }
  else swipe(s, lt, 2, 0.04, p);
}

const plan = [
  // 0) cold open (flash-forward of 'osaka'): the swiping thumb turns giant and the phone smokes; push in to a smug face
  { sc: 'st', say: [], pre: 0, hold: 3.1, pal: ['#ff7eb6', '#fff0f6', '#ffffff'],
    cam: { p0: [0.2, 1.55, 4.4], p1: [0.05, 1.55, 2.15], l0: [0, 1.15, 0], l1: [0, 1.45, 0], hold: 1.6, dur: 2.3 },
    shake: [[0.25, 0.07, 1.1]], lines: [[0.25, 1.1]],
    sfx: [[0.25, 'impact_don', -9], [0.3, 'whoosh_swing', -9], [0.55, 'whoosh_swing', -11], [0.8, 'whoosh_swing', -11], [1.6, 'whoosh_slide', -13], [2.4, 'comic_pico', -10]],
    stamps: [{ t: 0.25, text: 'シュババババ!!', x: 330, y: 1120, rot: -8, color: YEL, size: 104, dur: 1.2 },
      { t: 0.75, text: 'ムキッ', x: 780, y: 820, rot: 10, color: '#ffffff', size: 86, dur: 0.8 },
      { t: 2.4, text: 'あと1本…', x: 730, y: 1180, rot: 6, color: '#ffffff', size: 70, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData, turn = ease(k(lt, 1.6, 2.1));
      thumbScene(lt, s);
      if (lt < 1.6) { lookPhone(h, { lid: 0.1, brow: 0.6, mouth: 'smile' }); h.head.rotation.x = 0.28 * (1 - turn); }
      else { h.face({ lid: 0.35, brow: 0.6, look: [0, 0], mouth: 'smile' }); h.head.rotation.x = 0.28 * (1 - turn); h.head.rotation.z = 0.1 * turn; }
    } },
  // 1) hook
  { sc: 'st', say: ['hook'], pal: HOOK,
    cam: { p0: [0.1, 1.45, 4.3], p1: [0.1, 1.45, 3.9], l0: [0, 1.32, 0] },
    sfx: [[0.02, 'text_impact', -9], [0.6, 'phone_vibe', -14]],
    tags: [{ t: 1.6, text: '4年目に、1日が足りなくなる', x: 520, y: 640, h: 76, bg: RED, fg: '#ffffff' }],
    act(lt, s) { const h = s.hero.userData; holdPhone(s, 'L'); swipe(s, lt, 1.2, 0.03); lt < 1.2 ? lookPhone(h, { mouth: 'smile' }) : h.face({ lid: 0.15, look: [0.3, 0], mouth: 'o', open: 0.6 }); } },
  // 2) now: 2h45m
  { sc: 'st', say: ['now'], pal: ['#6fc3ff', '#eaf6ff', '#ffffff'], hero2: true, hud: ['スマホ時間', '1日2時間45分'],
    cam: { p0: [0, 1.4, 4.7], p1: [0, 1.4, 4.4], l0: [0, 1.25, 0] },
    sfx: [[0.6, 'text_pa', -11], [1.6, 'comic_pico', -14]],
    note: 'メディア定点調査2025（博報堂DYMP）より',
    tags(lt) { if (lt < 0.6) return []; const a = scr(S, headPos(S.hero), 0, -250), b = scr(S, headPos(S.hero2), 0, -250); return [{ t: 0.6, text: 'あなた', x: a[0], y: a[1], h: 66, bg: CY }, { t: 0.9, text: 'ふつう', x: b[0], y: b[1], h: 66, bg: '#ffffff' }]; },
    cards: [{ t: 1.4, text: '1日 [2時間45分]', y: 480, size: 66 }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.hero.position.set(-0.62, 0, 0); s.hero.rotation.y = 0.2; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.2;
      holdPhone(s, 'L', V(-0.67, 0.98, 0.45)); swipe(s, lt, 1.5, 0.03, V(-0.67, 0.98, 0.45)); lookPhone(h, { mouth: 'smile' });
      holdPhone(s, 'R', V(0.71, 0.98, 0.45), s.hero2, 'phone2'); h2.arm('L', 0.05, 0.2, 0.3); lookPhone(h2, { mouth: 'smile' });
    } },
  // 3) year 1: 5.5h = 3 movies
  { sc: 'st', say: ['y1'], pal: ['#ffd23a', '#fff7d6', '#e2463c'], show: ['cup'], hud: ['1年目', '×2'],
    cam: { p0: [0.1, 1.4, 4.5], p1: [0.1, 1.4, 4.2], l0: [0.1, 1.25, 0] },
    sfx: [[0.1, 'text_pa', -10], [1.6, 'comic_pico', -13], [1.9, 'comic_pico', -13], [2.2, 'comic_pico', -13]],
    cards(lt) { return lt < 1.5 ? [{ t: 0.1, text: '1日 [5時間半]', y: 480, size: 70 }] : [{ t: 1.5, text: '映画（110分）×[3本]', y: 480, size: 62, border: CY }]; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0);
      holdPhone(s, 'L', V(-0.3, 1.0, 0.45)); s.P.cup.visible = true; h.reach('R', V(0.12, 1.0, 0.38)); s.P.cup.position.set(0.14, 0.92, 0.44);
      h.face(lt < 1.5 ? { lid: 0.2, look: [0, -0.7], mouth: 'smile' } : { lid: 0.05, look: [0.2, -0.6], mouth: 'o', open: 0.7 }); h.head.rotation.x = 0.25;
    } },
  // 4) 990 videos a day
  { sc: 'st', say: ['vid'], pal: ['#9b7bff', '#f1ecff', '#ffd23a'], hud: ['1年目', '5時間半'],
    cam: { p0: [0, 1.4, 4.1], p1: [0, 1.42, 3.8], l0: [0, 1.3, 0] },
    sfx: [[0.3, 'whoosh_swing', -14], [0.9, 'whoosh_swing', -14], [1.5, 'whoosh_swing', -14], [2.2, 'text_pa', -10]],
    note: '動画1本20秒・休まず見るとして（試算）',
    tags(lt) { const n = Math.round(990 * ease(k(lt, 0.2, 2.2))), p = scr(S, headPos(S.hero), 0, -290); return [{ text: `${n}本目`, x: p[0], y: p[1], h: 92, bg: '#ffffff' }]; },
    act(lt, s) { const h = s.hero.userData; holdPhone(s, 'L'); swipe(s, lt, 3, 0.05); lookPhone(h, { lid: 0.5, mouth: 'flat' }); h.head.rotation.z = Math.sin(lt * 2) * 0.05; } },
  // 5) year 2: 11h, 7 tenths of waking time
  { sc: 'st', say: ['y2'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['clock', 'desk'], hud: ['2年目', '×4'],
    cam: { p0: [0.2, 1.45, 4.7], p1: [0.2, 1.45, 4.4], l0: [0.2, 1.35, 0] },
    sfx: [[0.1, 'text_pa', -10], [1.0, 'countdown_tick', -14, 1.5], [2.4, 'comic_surprise', -12]],
    cards(lt) { return lt < 1.6 ? [{ t: 0.1, text: '1日 [11時間]', y: 480, size: 70 }] : [{ t: 1.6, text: '起きている16時間の [7割]', y: 480, size: 58, border: YEL }]; },
    note: '睡眠8時間として（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0.1); s.P.desk.position.set(-0.3, 0, -0.45);
      clockAt(s, 0.75, 1.75, -0.6, 7 + 11 * ease(k(lt, 0.8, 3.2)));
      holdPhone(s, 'L', V(-0.35, 0.98, 0.55)); swipe(s, lt, 2, 0.04, V(-0.35, 0.98, 0.55)); lookPhone(h, { lid: 0.55, mouth: 'flat' });
    } },
  // 6) during meals and baths
  { sc: 'st', say: ['meal'], pal: ['#ff9a6b', '#fff0e6', '#2c3b6b'], show: ['counter', 'onigiri'], hero2: true, hud: ['2年目', '11時間'],
    cam: { p0: [0, 1.5, 4.6], p1: [0, 1.5, 4.4], l0: [0, 1.3, 0] },
    sfx: [[0.3, 'comic_eat', -13], [1.2, 'comic_tsukkomi', -11]],
    tags(lt) { if (lt < 1.2) return []; const p = scr(S, headPos(S.hero2), 0, -260); return [{ t: 1.2, text: '冷めるよ！', x: p[0], y: p[1], h: 68, bg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.P.counter.position.set(0, 0, -0.55); s.P.onigiri.position.set(-0.6, 0.93, -0.45);
      s.hero.position.set(-0.62, 0, 0.1); s.hero2.position.set(0.68, 0, 0.1); s.hero2.rotation.y = -0.35;
      holdPhone(s, 'L', V(-0.67, 0.98, 0.55)); swipe(s, lt, 1.5, 0.03, V(-0.67, 0.98, 0.55)); lookPhone(h, { lid: 0.5 });
      h2.face(lt > 1.2 ? { lid: 0.1, brow: 1, look: [-0.8, 0], mouth: 'o', open: 0.8 } : { lid: 0.4, brow: 0.4, look: [-0.8, -0.2], mouth: 'flat' });
      if (lt > 1.2) h2.reach('L', V(0.25, 1.4, 0.3)); else h2.arm('L', 0.1, 0.2, 0.5);
    } },
  // 7) year 3: 22h, only 2h of sleep
  { sc: 'st', say: ['y3'], pal: ['#3b4a8f', '#d9defa', '#ffd23a'], show: ['bed', 'clock'], hud: ['3年目', '×8'], hudColor: YEL,
    cam: { p0: [0.1, 1.4, 4.6], p1: [0.1, 1.4, 4.3], l0: [0.1, 1.25, 0] },
    sfx: [[0.1, 'text_pa', -10], [2.2, 'comic_shock2', -11]],
    cards(lt) { return lt < 2.0 ? [{ t: 0.1, text: '1日 [22時間]', y: 480, size: 70 }] : [{ t: 2.0, text: '睡眠 たった[2時間]', y: 480, size: 64, border: RED }]; },
    act(lt, s) {
      const h = s.hero.userData; s.P.bed.position.set(0.55, 0, -0.6); s.hero.position.set(-0.4, 0, 0.15); s.hero.rotation.y = 0.2;
      clockAt(s, 0.55, 1.9, -1.2, 3 + lt * 0.4);
      holdPhone(s, 'L', V(-0.45, 0.98, 0.6)); swipe(s, lt, 1.2, 0.03, V(-0.45, 0.98, 0.6));
      h.face({ lid: 0.75 + Math.sin(lt * 3) * 0.1, brow: -0.6, look: [0, -0.6], mouth: 'flat' }); h.head.rotation.x = 0.3; h.head.rotation.z = Math.sin(lt * 1.5) * 0.08;
    } },
  // 8) thumb: 1.6 km a day
  { sc: 'st', say: ['thumb'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], hud: ['3年目', '22時間'],
    cam: { p0: [0, 1.55, 3.9], p1: [0, 1.55, 3.6], l0: [0, 1.2, 0] },
    sfx: [[0.2, 'whoosh_swing', -12], [0.6, 'whoosh_swing', -12], [1.4, 'text_pa', -10]],
    note: '1分に20回・1回6cmスワイプとして（試算）',
    tags(lt) { if (lt < 1.4) return []; return [{ t: 1.4, text: '1日 1.6km', x: 760, y: 1000, h: 96, bg: YEL }]; },
    act(lt, s) { const h = s.hero.userData, p = V(-0.08, 0.84, 0.5); holdPhone(s, 'L', p); swipe(s, lt, 5, 0.05, p); giant(s, 1 + ease(k(lt, 0.3, 1.5)) * 0.9); streaks(s, h.handPos('R'), lt); lookPhone(h, { lid: 0.3, brow: 0.5, mouth: 'smile' }); } },
  // 9) 578 km a year (payoff of the cold open)
  { sc: 'st', say: ['osaka'], pre: 0.5, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], hud: ['親指の移動', '1年 578km'], hudColor: YEL,
    cam: { p0: [0.2, 1.55, 4.4], p1: [0.1, 1.55, 4.0], l0: [0, 1.15, 0] }, shake: [[0.25, 0.05, 0.8]], lines: [[0.25, 0.9]],
    sfx: [[0.25, 'impact_don', -10], [0.3, 'whoosh_swing', -11], [2.2, 'text_pa', -10]],
    stamps: [{ t: 0.25, text: 'シュババババ!!', x: 330, y: 1120, rot: -8, color: YEL, size: 96, dur: 1.1 }],
    cards(lt) { return lt < 2.2 ? [] : [{ t: 2.2, text: '東京→新大阪 552.6km [より遠い]', y: 480, size: 50, border: CY }]; },
    note: '東海道新幹線の営業キロで比較',
    act(lt, s) { const h = s.hero.userData; thumbScene(lt, s, 0.25, { big: 2.2 }); lookPhone(h, { lid: 0.1, brow: 0.6, mouth: 'smile' }); } },
  // 10) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['3年目', '22時間'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.6], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -8], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 11) neck: 27 kg
  { sc: 'st', say: ['neck'], pal: ['#6b4fbf', '#ece6ff', '#ffd23a'], hud: ['首の負担', '27kg'], hudColor: RED,
    cam: { p0: [1.6, 1.35, 4.0], p1: [1.5, 1.35, 3.7], l0: [0, 1.2, 0] },
    sfx: [[0.6, 'comic_boyon', -12], [1.6, 'text_pa', -10]],
    note: '60度うつむいた場合（Hansraj 2014）',
    tags(lt) { if (lt < 1.4) return []; const p = scr(S, S.hero.userData.head.localToWorld(V(0, -0.35, -0.2)), 170, 0); return [{ t: 1.4, text: '首に 27kg', x: p[0], y: p[1], h: 96, bg: RED, fg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, b = ease(k(lt, 0.2, 0.9)); s.hero.rotation.y = 0.55;
      holdPhone(s, 'L', V(0.05, 0.98, 0.45), s.hero, 'phone', -1.0); swipe(s, lt, 1, 0.02, V(0.05, 0.98, 0.45));
      h.face({ lid: 0.4, brow: -0.6, look: [0, -0.9], mouth: 'flat' }); h.head.rotation.x = 0.15 + b * 0.55; h.body.rotation.x = b * 0.12;
    } },
  // 12) rice bags on the head
  { sc: 'st', say: ['rice'], pal: ['#ffb36b', '#fdebd4', '#2f8f5b'], show: ['rice'], hud: ['首の負担', '27kg'], hudColor: RED,
    cam: { p0: [0, 1.75, 5.6], p1: [0, 1.75, 5.3], l0: [0, 1.6, 0] },
    sfx: [[0.1, 'impact_don', -12], [0.45, 'impact_don', -12], [0.8, 'impact_don', -12], [1.15, 'impact_don', -12], [1.5, 'impact_don', -12], [1.9, 'comic_fall', -13]],
    note: '5kg × 5袋 ＝ 25kg ＜ 27kg',
    stamps: [{ t: 1.9, text: 'ズシッ', x: 760, y: 980, rot: 8, color: '#ffffff', size: 84, dur: 0.9 }],
    act(lt, s) {
      const h = s.hero.userData, n = clamp(Math.floor(lt / 0.35) + 1, 0, 5), sink = Math.min(n, 5) * 0.012;
      s.hero.position.set(0, 0, 0); h.body.position.y = -sink; h.arm('L', 0.2, 1.2, 1.4); h.arm('R', 0.2, 1.2, 1.4); h.hand('L', 'pa'); h.hand('R', 'pa');
      s.hero.updateMatrixWorld(true); const top = h.head.localToWorld(V(0, 0.5, 0));
      s.P.rice.userData.items.forEach((b, i) => { const t0 = i * 0.35, f = clamp((lt - t0) / 0.25); b.visible = i < 5 && lt > t0; b.position.set(top.x + Math.sin(i * 1.9) * 0.03, top.y + i * 0.16 + (1 - f) * 1.2, top.z); b.rotation.y = Math.sin(i * 2.7) * 0.25; });
      h.face({ lid: 0.3, brow: -1, look: [0, 0.6], mouth: 'o', open: 0.5 + n * 0.1 }); h.head.rotation.z = Math.sin(lt * 18) * 0.015 * n;
    } },
  // 13) battery: 3 charges a day
  { sc: 'st', say: ['batt'], pal: ['#3fd16b', '#e6fbe9', '#2c3b6b'], show: ['outlet'], hud: ['充電', '1日3回'], hudColor: YEL,
    cam: { p0: [-0.1, 1.35, 3.5], p1: [-0.1, 1.35, 3.3], l0: [-0.1, 1.25, 0] },
    sfx: [[0.3, 'countdown_elec', -14], [1.0, 'comic_pico', -12], [1.5, 'comic_pico', -12], [2.0, 'comic_pico', -12]],
    note: '画面オンで7時間もつとして（試算）',
    tags(lt) { const n = clamp(Math.floor((lt - 0.4) / 0.5) + 1, 1, 3), p = scr(S, headPos(S.hero), 0, -300); return [{ text: `充電 ${n}回目`, x: p[0], y: p[1], h: 80, bg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, p = V(-0.3, 1.15, 0.55); holdPhone(s, 'L', p, s.hero, 'phone', -0.2); s.P.phone.rotation.y = 0.3; s.P.phone.scale.setScalar(1.6);
      s.P.phone.userData.fill.scale.y = 1 - ((Math.max(0, lt - 0.4) / 0.5) % 1); h.arm('R', 0.2, 0.6, 1.4); h.hand('R', 'pa');
      h.face({ lid: 0.2, brow: -0.8, look: [-0.8, -0.3], mouth: 'o', open: 0.6 }); h.head.rotation.z = -0.08; h.head.rotation.y = -0.25;
    } },
  // 14) year 4: 44 hours
  { sc: 'st', say: ['y4'], pal: ['#e2463c', '#ffe3df', '#ffd23a'], show: ['clock'], hud: ['4年目', '×16'], hudColor: RED,
    cam: { p0: [0, 1.5, 4.8], p1: [0, 1.5, 4.4], l0: [0, 1.4, 0] }, shake: [[1.8, 0.04, 0.6]],
    sfx: [[0.2, 'countdown_tick', -13, 1.5], [1.8, 'impact_don', -9], [1.85, 'comic_surprise', -11]],
    cards(lt) { return lt < 1.8 ? [] : [{ t: 1.8, text: '1日 [44時間] 必要', y: 480, size: 70, border: RED }]; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.1); clockAt(s, 0.6, 1.6, -0.3, lt * 3);
      holdPhone(s, 'L', V(-0.45, 0.98, 0.55)); swipe(s, lt, 4, 0.04, V(-0.45, 0.98, 0.55));
      h.face(lt < 1.8 ? { lid: 0.5, look: [0, -0.7], mouth: 'flat' } : { lid: 0, browY: 1, brow: -1, look: [0.7, 0.2], mouth: 'o', open: 1 }); h.head.rotation.x = lt < 1.8 ? 0.3 : 0;
    } },
  // 15) the day is too short
  { sc: 'st', say: ['over'], pal: ['#1b2140', '#2a3156', RED], dim: 0.85, show: ['clock'], hud: ['4年目', '44時間'], hudColor: RED,
    cam: { p0: [0, 1.5, 4.0], p1: [0, 1.5, 3.7], l0: [0, 1.4, 0] },
    sfx: [[0.3, 'comic_shock2', -11], [1.2, 'text_pa', -10]],
    tags(lt) { if (lt < 1.0) return []; return [{ t: 1.0, text: '24時間', x: 330, y: 560, h: 92, bg: '#ffffff' }, { t: 1.2, text: '＜ 44時間', x: 680, y: 560, h: 92, bg: RED, fg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData; clockAt(s, 0.8, 1.55, -0.4, lt * 8);
      h.reach('L', V(-0.3, 1.75, 0.15)); h.reach('R', V(0.3, 1.75, 0.15)); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0.2], mouth: 'o', open: 1.1 }); h.head.rotation.z = Math.sin(lt * 9) * 0.06;
    } },
  // 16) CTA
  { sc: 'st', say: ['cta'], pal: HOOK,
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.5, 4.0], l0: [0, 1.36, 0] },
    sfx: [[0.0, 'question', -11], [1.2, 'text_pa', -11], [1.4, 'text_pa', -11], [2.1, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: '手放せる', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: '手放せない', x: 700, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.5, 1.3));
      holdPhone(s, 'L', V(lerp(-0.12, -0.55, a), lerp(0.98, 1.15, a), 0.42), s.hero, 'phone', lerp(-0.7, 0, a)); h.arm('R', 0.05, 0.25, 0.3);
      h.face({ lid: 0.3, brow: 0.5, look: [-0.5, 0], mouth: 'smile' }); h.head.rotation.set(0, -0.15, Math.sin(lt * 1.6) * 0.08);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもスマホを見る時間が', '毎年[2倍]になったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['スマホ時間', '毎年×2'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
