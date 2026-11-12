// ep24 (pop スタイル / アームC ニュース起点): もしも消費税が0%になったら？（食料品の消費税を2年間1%にする法案が衆院通過＝2026年11月6日の報道を入り口に試算）
// 前提: 値段は「税抜き価格＋消費税」のまま、税だけ0%になると仮定した単純計算（店の値付けの変化は無視）
// 税率: 食料品8%（軽減税率）・それ以外10% / 110円 → 100円 / ランチ1,100円 → 1,000円 / 車330万円 → 300万円（−30万円）
// 家計: 月20万円（食料品8万円＋その他12万円）と仮定 → 税 = 8万×8/108 + 12万×10/110 = 16,835円/月 → 年 202,020円
// 法案: 食料品 8% → 1%（2027年4月から2年間、報道）/ 月8万円の食料品なら 8万 − 8万/1.08×1.01 = 5,185円/月（年約6.2万円）
// 消費税収 約26兆円（2025年度、報道）→ 1日 26兆/365 = 712億円、1秒 82.4万円 / 社会保障（年金・医療・介護・子育て）に充てる（消費税法 第1条2項）
import { run, V, clamp, ease, lerp } from '../engine/core.js';
import { buildToyStage } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep24_shouhizei0.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', DARK = 'rgba(24,26,32,0.9)';
const HUD = ['消費税', '0%'], OUT = ['国の財布', '−26兆円'];
let S;
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 150, 900), y + dy]; };
const hold = (h, side, obj, p) => { h.reach(side, p); obj.position.copy(p); };
const holdBag = (h, side, bag, p) => { h.reach(side, p); bag.position.set(p.x, p.y - 0.33, p.z); };

const plan = [
  // 1) hook: the 110-yen shop becomes a real 100-yen shop
  { sc: 'st', say: ['hook', 'shop'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['bag', 'bill'],
    cam: { p0: [0.1, 1.5, 4.1], p1: [0.1, 1.46, 3.7], l0: [0.05, 1.36, 0] },
    sfx: [[0.02, 'text_impact', -9], [3.4, 'text_pa', -8], [3.5, 'comic_jajean', -11], [4.6, 'sparkle', -12]],
    stamps: [{ t: 4.9, text: 'ほんとに100円！', x: 330, y: 1190, rot: -8, color: '#ffd23a', size: 96, dur: 1.2 }],
    cards(lt) { const t0 = this.lt.shop + 0.3; return lt > t0 ? [{ t: t0, text: '110円 → [100円]', x: 560, y: 1080, size: 70, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData, up = ease(k(lt, this.lt.shop - 0.2, this.lt.shop + 0.4));
      s.hero.position.set(-0.05, 0, 0); s.hero.rotation.y = 0.1;
      holdBag(h, 'R', s.P.bag, V(0.4, lerp(0.95, 1.2, up), 0.3));
      hold(h, 'L', s.P.bill, V(-0.42, 1.05 + up * 0.2, 0.34)); s.P.bill.rotation.set(0, 0.3, 0.3 + Math.sin(lt * 6) * 0.08);
      h.face(up < 1 ? { lid: 0.2, brow: 0.2, look: [0.3, 0], mouth: 'smile' } : { lid: 0, browY: 1, look: [0.5, 0.1], mouth: 'o', open: 1.1 });
      h.head.rotation.set(0, -0.15 * up, 0.05);
    } },
  // 2) today: food 8%, everything else 10%
  { sc: 'st', say: ['rate'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['counter', 'onigiri', 'bottle'],
    cam: { p0: [0, 1.4, 4.7], p1: [0, 1.38, 4.5], l0: [0, 1.22, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.1, 'text_pa', -11]],
    tags(lt) {
      const out = [], a = scr(V(-0.6, 1.0, -0.1)), b = scr(V(0.6, 1.0, -0.1));
      if (lt > 0.3) out.push({ t: 0.3, text: '食べ物 8%', x: a[0], y: 900, h: 84, bg: '#ffffff' });
      if (lt > 2.1) out.push({ t: 2.1, text: 'それ以外 10%', x: b[0], y: 900, h: 84, bg: CY });
      return out;
    },
    note: '今の消費税率（軽減税率は食料品など）',
    act(lt, s) {
      const h = s.hero.userData, r = lt > 2.0;
      s.P.counter.position.set(0, 0, -0.2); s.P.onigiri.position.set(-0.6, 0.93, -0.12); s.P.onigiri.scale.setScalar(0.6);
      s.P.bottle.position.set(0.6, 0.86, -0.05); s.P.bottle.scale.setScalar(1.3);
      s.hero.position.set(0, 0, -0.95);
      h.reach(r ? 'R' : 'L', r ? V(0.5, 1.15, -0.1) : V(-0.5, 1.12, -0.15)); h.arm(r ? 'L' : 'R', 0.1, 0.2, 0.2);
      h.face({ lid: 0.2, brow: 0.2, look: [r ? 0.6 : -0.6, -0.3], mouth: 'smile' }); h.head.rotation.set(0.15, r ? -0.3 : 0.3, 0);
    } },
  // 3) lunch 1,100 -> 1,000 yen
  { sc: 'st', say: ['lunch'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['counter', 'bowl'],
    cam: { p0: [0, 1.5, 4.0], p1: [0, 1.48, 3.8], l0: [0, 1.32, 0] },
    sfx: [[0.3, 'comic_eat', -12], [1.2, 'text_pa', -9]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '1,100円 → [1,000円]', y: 480, size: 68, border: CY }] : []; },
    note: '税込1,100円（10%）の店内ランチ',
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(0, 0, -0.2); s.hero.position.set(0.25, 0, -0.95);
      s.P.bowl.position.set(-0.4, 0.93, 0.05); s.P.bowl.scale.setScalar(1.15);
      s.P.bowl.userData.steam.forEach((m, i) => { const u = (lt * 0.4 + i / 3) % 1; m.position.set((i - 1) * 0.06 + Math.sin(u * 6 + i) * 0.03, 0.3 + u * 0.4, 0); m.scale.setScalar(0.04 * (1 - u * 0.6)); });
      h.reach('L', V(-0.3, 1.0 + Math.abs(Math.sin(lt * 6)) * 0.06, -0.05)); h.reach('R', V(0.55, 0.98, -0.2));
      h.face({ lid: 0.25, look: [-0.6, -0.5], mouth: 'o', open: 0.4 + Math.abs(Math.sin(lt * 6)) * 0.7 }); h.head.rotation.set(0.25, 0.1, 0);
    } },
  // 4) monthly shopping 200,000 yen -> about 17,000 yen saved (coins pile up)
  { sc: 'st', say: ['month'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['bag', 'coinsB', 'desk'],
    cam: { p0: [0, 1.35, 4.6], p1: [0, 1.33, 4.4], l0: [0, 1.18, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.4, 'comic_pico', -13], [2.8, 'comic_pico', -13], [3.2, 'sparkle', -12]],
    tags(lt) {
      const out = [], b = scr(V(0.55, 1.0, 0.3));
      if (lt > 0.3) out.push({ t: 0.3, text: '月20万円の買い物', x: 330, y: 480, h: 76, bg: '#ffffff' });
      if (lt > 2.4) out.push({ t: 2.4, text: '浮く 約1.7万円', x: b[0], y: 620, h: 92, bg: CY });
      return out;
    },
    note: '食料品8万円＋その他12万円と仮定（試算）',
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(lerp(0, 17, ease(k(lt, 2.2, 3.6))));
      s.P.desk.position.set(0.5, 0, 0.1); s.P.coinsB.position.set(0.42, 0.77, 0.15); s.P.coinsB.userData.items.forEach((it, i) => { it.visible = i < n; });
      s.hero.position.set(-0.3, 0, 0); s.hero.rotation.y = 0.25;
      holdBag(h, 'L', s.P.bag, V(-0.62, 0.9, 0.2)); h.reach('R', V(0.38, 0.84 + n * 0.028, 0.18));
      h.face(n > 8 ? { lid: 0, browY: 1, look: [0.6, -0.3], mouth: 'o', open: 1 } : { lid: 0.25, look: [0.4, -0.3], mouth: 'smile' });
      h.head.rotation.set(0.15, -0.25, 0);
    } },
  // 5) a year: about 200,000 yen = a smartphone
  { sc: 'st', say: ['year'], pal: ['#ff7aa8', '#ffe6ef', '#ffffff'], show: ['phone'],
    cam: { p0: [0.1, 1.48, 3.6], p1: [0.1, 1.46, 3.3], l0: [0.1, 1.38, 0] },
    sfx: [[0.3, 'text_pa', -9], [2.3, 'comic_jajean', -11], [2.4, 'sparkle', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '1年で [約20万円]', y: 480, size: 72, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData, up = ease(k(lt, 2.0, 2.6));
      s.hero.position.set(-0.05, 0, 0);
      hold(h, 'R', s.P.phone, V(0.34, lerp(0.95, 1.6, up), 0.35)); s.P.phone.rotation.set(0, -0.3, Math.sin(lt * 4) * 0.1 * up);
      h.arm('L', 2.5 * up, 0.5, 0.3); h.body.position.y = up ? Math.abs(Math.sin(lt * 5)) * 0.05 : 0;
      h.face(up > 0.5 ? { lid: 0, browY: 1, look: [0.5, 0.4], mouth: 'o', open: 1.2 } : { lid: 0.2, look: [0, 0], mouth: 'smile' });
    } },
  // 6) car 3.3 million -> 300,000 yen cheaper
  { sc: 'st', say: ['car'], pal: ['#6bb6ff', '#eef6ff', '#ffffff'], show: ['car', 'bill'],
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.42, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.2, 'impact_don', -12], [2.3, 'comic_jajean', -12]],
    tags(lt) {
      const out = [];
      if (lt > 0.3) out.push({ t: 0.3, text: '税込 330万円', x: 740, y: 880, h: 74, bg: '#ffffff' });
      if (lt > 2.2) out.push({ t: 2.2, text: '−30万円', x: 740, y: 980, h: 96, bg: CY });
      return out;
    },
    act(lt, s) {
      const h = s.hero.userData; s.P.car.position.set(0.55, 0, -0.3); s.P.car.rotation.y = -0.35; s.P.car.scale.setScalar(0.75);
      s.hero.position.set(-0.3, 0, 0.3); s.hero.rotation.y = 0.35;
      h.reach('R', V(0.12, 1.0, 0.5)); hold(h, 'L', s.P.bill, V(-0.6, 1.3 + (lt > 2.2 ? 0.25 : 0), 0.6)); s.P.bill.rotation.set(0, 0.3, 0.2);
      h.face(lt > 2.2 ? { lid: 0, browY: 1, look: [0.5, 0], mouth: 'o', open: 1 } : { lid: 0.25, brow: 0.3, look: [0.5, 0], mouth: 'smile' }); h.head.rotation.set(0, 0.2, 0);
    } },
  // 7) news: a bill to cut food to 1%
  { sc: 'st', say: ['news'], pal: ['#f3e3c3', '#e8cfa0', '#c79a5b'], show: ['board', 'desk', 'onigiri'],
    cam: { p0: [0, 1.5, 4.4], p1: [0, 1.48, 4.2], l0: [0, 1.4, 0] },
    sfx: [[0.2, 'phone_vibe', -16], [1.6, 'text_pa', -10], [2.6, 'text_pa', -10]],
    tags(lt) {
      const out = [];
      if (lt > 1.5) out.push({ t: 1.5, text: '食べ物 8% → 1%', x: 360, y: 520, h: 88, bg: '#ffffff' });
      if (lt > 2.6) out.push({ t: 2.6, text: '2年間の案', x: 720, y: 640, h: 76, bg: CY });
      return out;
    },
    note: '2026年11月6日に衆院を通過（報道）',
    act(lt, s) {
      const h = s.hero.userData; s.P.desk.position.set(-0.75, 0, -0.5); s.P.onigiri.position.set(-0.75, 0.77, -0.5); s.P.onigiri.scale.setScalar(0.5);
      s.hero.position.set(0.25, 0, 0); s.hero.rotation.y = -0.2;
      h.reach('L', V(lt < 2.5 ? -0.55 : 0.1, 1.75, -0.3)); h.arm('R', 0.1, 0.2, 0.2);
      h.face({ lid: 0.25, brow: 0.2, look: [-0.5, 0.5], mouth: 'smile' }); h.head.rotation.set(-0.15, 0.3, 0);
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.5], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) total: about 26 trillion yen a year
  { sc: 'st', say: ['total'], pal: ['#3d4a7a', '#cfd6ea', '#ffd23a'], show: ['towers', 'coinsA', 'coinsB'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.5, 5.0], p1: [0, 1.5, 4.7], l0: [0, 1.25, 0] },
    sfx: [[0.2, 'whoosh_slide', -13], [1.6, 'impact_don', -9], [1.7, 'comic_shock2', -11]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '1年 [約26兆円]', y: 480, size: 76, border: RED }] : []; },
    note: '消費税収（2025年度・報道）',
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(lerp(4, 32, ease(k(lt, 0.2, 1.6))));
      s.P.coinsA.position.set(-0.75, 0, 0.2); s.P.coinsB.position.set(0.75, 0, 0.2);
      for (const c of [s.P.coinsA, s.P.coinsB]) c.userData.items.forEach((it, i) => { it.visible = i < n; });
      s.hero.position.set(0, 0, 0.1);
      h.face(lt > 1.5 ? { lid: 0, brow: -1, browY: 1, look: [0, 0.4], mouth: 'o', open: 1.2 } : { lid: 0.2, look: [-0.5, 0], mouth: 'flat' });
      h.arm('L', lt > 1.5 ? 0.3 : 0.1, 0.3, lt > 1.5 ? 1.9 : 0.2); h.reach('R', V(0.62, 0.55 + n * 0.028, 0.25));
      h.head.rotation.set(-0.1, 0, 0);
    } },
  // 10) per day / per second
  { sc: 'st', say: ['day'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['clock'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.5, 4.5], p1: [0, 1.48, 4.3], l0: [0, 1.38, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.6, 'countdown_tick', -14, 1.6], [2.7, 'text_pa', -10]],
    tags(lt) {
      const out = [];
      if (lt > 0.3) out.push({ t: 0.3, text: '1日 約700億円', x: 330, y: 470, h: 84, bg: '#ffffff' });
      if (lt > 2.6) out.push({ t: 2.6, text: '1秒 82万円', x: 700, y: 590, h: 96, bg: RED, fg: '#ffffff' });
      return out;
    },
    note: '26兆円 ÷ 365日 ÷ 86,400秒（試算）',
    act(lt, s) {
      const h = s.hero.userData, C = s.P.clock;
      C.position.set(0.68, 1.55, -0.4); C.userData.mh.rotation.z = -lt * 6.28; C.userData.hh.rotation.z = -lt * 0.5;
      s.hero.position.set(-0.05, 0, 0); s.hero.rotation.y = -0.1;
      h.reach('R', V(0.5, 1.5, -0.2)); h.arm('L', 0.3, 0.3, 1.9);
      h.face({ lid: 0, brow: -0.6, browY: 0.8, look: [0.6, 0.2], mouth: 'o', open: 0.8 }); h.head.rotation.set(0, -0.3, 0);
    } },
  // 11) what it pays for: pensions, medical care, nursing care, child-rearing
  { sc: 'st', say: ['use'], pal: ['#8fe3c0', '#effbf5', '#ffffff'], hero2: true, show: ['cup'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.45, 4.9], p1: [0, 1.42, 4.7], l0: [0, 1.25, 0] },
    sfx: [[0.6, 'text_pa', -12], [1.4, 'text_pa', -12], [2.1, 'text_pa', -12], [2.8, 'text_pa', -12]],
    tags(lt) {
      const L = [['年金', 0.5, 260, 470], ['医療', 1.3, 740, 470], ['介護', 2.0, 260, 590], ['子育て', 2.7, 740, 590]];
      return L.filter(([, t]) => lt > t).map(([text, t, x, y]) => ({ t, text, x, y, h: 84, bg: '#ffffff' }));
    },
    note: '消費税は社会保障に使う（消費税法）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.hero.position.set(-0.66, 0, 0); s.hero.rotation.y = 0.3; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.3;
      hold(h2, 'L', s.P.cup, V(0.42, 1.0, 0.3));
      h.reach('R', V(-0.1, 1.2 + Math.sin(lt * 3) * 0.1, 0.4)); h.arm('L', 0.1, 0.2, 0.2);
      h.face({ lid: 0.2, brow: -0.4, look: [0.5, 0], mouth: 'flat' }); h2.face({ lid: 0.3, look: [-0.5, 0], mouth: 'smile' }); h2.arm('R', 0.1, 0.2, 0.2);
    } },
  // 12) good news: daily shopping about 10% cheaper
  { sc: 'st', say: ['good'], pal: ['#59c3ff', '#ffe6a8', '#ffffff'], show: ['bag', 'sun', 'sunf1'], hud: HUD, hudColor: CY,
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.48, 4.1], l0: [0, 1.4, 0] },
    sfx: [[0.0, 'sparkle', -11], [2.1, 'comic_jajean', -11]],
    cards(lt) { return lt > 2.0 ? [{ t: 2.0, text: '買い物 [約1割]安い', y: 480, size: 70, border: CY }] : []; },
    note: '10%の品なら税込価格の9.1%',
    act(lt, s) {
      const h = s.hero.userData, j = Math.abs(Math.sin(lt * 5)) * 0.06;
      s.P.sun.position.set(0.6, 2.45, -2.2); s.P.sun.rotation.z = lt * 0.4; s.P.sunf1.position.set(-0.9, 0, -1.3);
      h.body.position.y = j; s.hero.position.set(0.05, 0, 0);
      holdBag(h, 'L', s.P.bag, V(-0.55, 1.15 + j, 0.25)); h.arm('R', 2.7, 0.35, 0.2); h.face({ lid: 0, browY: 1, mouth: 'o', open: 1.1 });
    } },
  // 13) bad news: someone has to fill a 26-trillion-yen hole
  { sc: 'st', say: ['bad'], pal: ['#8a95a8', '#e3e7ee', '#ffffff'], show: ['coinsA', 'board', 'desk'], hud: OUT, hudColor: RED, dim: 0.9,
    cam: { p0: [0, 1.5, 4.6], p1: [0, 1.5, 4.5], l0: [0, 1.32, 0] },
    sfx: [[0.3, 'comic_fall', -12], [2.2, 'text_pa', -11], [2.8, 'text_pa', -11], [3.4, 'text_pa', -11]],
    cards(lt) { return lt > 1.2 ? [{ t: 1.2, text: '[26兆円]の穴', y: 480, size: 72, border: RED }] : []; },
    tags(lt) {
      const L = [['別の税？', 2.2, 230], ['借金？', 2.8, 510], ['サービス減？', 3.4, 790]];
      return L.filter(([, t]) => lt > t).map(([text, t, x]) => ({ t, text, x, y: 620, h: 76, bg: '#ffffff' }));
    },
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(lerp(32, 3, ease(k(lt, 0.2, 1.6))));
      s.P.desk.position.set(0.5, 0, 0.1); s.P.coinsA.position.set(0.42, 0.77, 0.15); s.P.coinsA.userData.items.forEach((it, i) => { it.visible = i < n; });
      s.hero.position.set(-0.3, 0, 0); s.hero.rotation.y = 0.2;
      h.reach('R', V(0.38, 0.84 + n * 0.028, 0.18)); h.reach('L', V(-0.35, 1.62, 0.35));
      h.face({ lid: 0.35, brow: -1, look: [0.5, -0.3], mouth: 'o', open: 0.4 }); h.head.rotation.set(0.1, -0.2, 0.12);
    } },
  // 14) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], hud: HUD, show: ['bag'],
    cam: { p0: [0, 1.5, 3.9], p1: [0, 1.5, 3.5], l0: [0, 1.42, 0] },
    sfx: [[0.0, 'question', -11], [1.3, 'text_pa', -11], [1.5, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: DARK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; h.head.rotation.set(0, 0, Math.sin(lt * 1.6) * 0.12);
      h.face({ lid: 0.12, browY: 1, look: [0, 0], mouth: 'smile' }); holdBag(h, 'R', s.P.bag, V(0.38, 1.0, 0.35)); h.arm('L', 0.1, 0.2, 0.3);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも消費税が', '[0%]になったら？'], titleEnd: at('shop') - 0.1, hud: HUD,
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; return st; } },
});
