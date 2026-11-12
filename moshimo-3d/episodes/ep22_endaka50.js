// ep22 (pop スタイル / アームC ニュース起点): もしも1ドルが50円になったら？（ドル円が160円前後というニュースを入り口に「超円高」を試算）
// 前提: ドル建ての値段は変わらず、為替だけ 160円 → 50円 に変わると仮定した単純換算（税・送料・企業の値付けは無視）。160/50 = 3.2倍
// iPhone $799 → 127,840円 → 39,950円 / ホテル1泊$400×5泊=$2,000 → 32万円 → 10万円 / 課金$10 → 1,600円 → 500円 / ラーメン$20 → 3,200円 → 1,000円
// 食料自給率 約38%（カロリーベース、農林水産省）→ 輸入 約6割 / 1949年〜 1ドル=360円（固定）、円の最高値 75.32円（2011年10月31日）
// 外国人: 1,000円 ÷ 50 = 20ドル（今は6.25ドル）/ 車: 原価300万円、2万ドルで販売 → 今 320万円（+20万）、超円高 100万円（−200万）
import { run, V, clamp, ease, lerp } from '../engine/core.js';
import { buildToyStage } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep22_endaka50.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', DARK = 'rgba(24,26,32,0.9)';
const HUD = ['1ドル', '50円'], OUT = ['海外から見た日本', '×3.2'];
let S;
const scr = (v, dx = 0, dy = 0) => { const [x, y] = S.screen(v); return [clamp(x + dx, 150, 900), y + dy]; };
const hold = (h, side, obj, p) => { h.reach(side, p); obj.position.copy(p); };

const plan = [
  // 1) hook: an iPhone for about 40,000 yen
  { sc: 'st', say: ['hook', 'iphone'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], show: ['phone', 'bill'],
    cam: { p0: [0.15, 1.5, 4.0], p1: [0.15, 1.46, 3.6], l0: [0.1, 1.38, 0] },
    sfx: [[0.02, 'text_impact', -9], [2.9, 'text_pa', -8], [3.0, 'comic_jajean', -11], [4.2, 'sparkle', -12]],
    stamps: [{ t: 3.0, text: 'やすっ！', x: 290, y: 1180, rot: -8, color: '#ffd23a', size: 112, dur: 1.4 }],
    cards(lt) { const t0 = this.lt.iphone + 0.4; return lt > t0 ? [{ t: t0, text: '12.8万円 → [4.0万円]', x: 560, y: 1090, size: 62, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData, up = ease(k(lt, this.lt.iphone - 0.2, this.lt.iphone + 0.4));
      s.hero.position.set(-0.1, 0, 0); s.hero.rotation.y = 0.1;
      hold(h, 'R', s.P.phone, V(0.32, lerp(1.0, 1.32, up), 0.38)); s.P.phone.rotation.set(0, -0.3, -0.1);
      hold(h, 'L', s.P.bill, V(-0.42, 1.05, 0.34)); s.P.bill.rotation.set(0, 0.3, 0.3 + Math.sin(lt * 6) * 0.08);
      h.face(up < 1 ? { lid: 0.2, brow: 0.2, look: [0.3, 0], mouth: 'smile' } : { lid: 0, browY: 1, look: [0.6, 0.1], mouth: 'o', open: 1.1 });
      h.head.rotation.set(0, -0.15 * up, 0.05);
    } },
  // 2) now 160 yen -> 50 yen (coin stacks)
  { sc: 'st', say: ['now'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['coinsA', 'coinsB'],
    cam: { p0: [0, 1.25, 4.7], p1: [0, 1.25, 4.5], l0: [0, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.6, 'whoosh_slide', -14], [3.6, 'comic_fall', -12]],
    tags() {
      const a = scr(V(-0.55, 1.05, 0.4), 0, -40), b = scr(V(0.55, 1.05, 0.4), 0, -40);
      return [{ text: '今', x: a[0], y: 470, h: 70, bg: '#ffffff' }, { text: 'もしも', x: b[0], y: 470, h: 70, bg: CY },
        { text: '160円', x: a[0], y: 560, h: 84, bg: DARK, fg: '#ffffff' }, { t: 0.2, text: '50円', x: b[0], y: 560, h: 84, bg: DARK, fg: '#ffffff' }];
    },
    note: '1ドルあたりの円（2026年は160円前後）',
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(lerp(32, 10, ease(k(lt, 2.6, 3.8))));
      s.P.coinsA.position.set(-0.55, 0, 0.4); s.P.coinsB.position.set(0.55, 0, 0.4);
      s.P.coinsB.userData.items.forEach((it, i) => { it.visible = i < n; });
      s.hero.position.set(0, 0, -0.6);
      h.reach('R', V(0.45, lerp(1.0, 0.6, ease(k(lt, 2.6, 3.8))), 0.1)); h.arm('L', 0.1, 0.2, 0.2);
      h.face(lt < 2.6 ? { lid: 0.2, look: [-0.5, -0.2], mouth: 'smile' } : { lid: 0.1, browY: 0.8, look: [0.6, -0.4], mouth: 'o', open: 0.9 });
      h.head.rotation.set(0.1, lt < 2.6 ? 0.25 : -0.25, 0);
    } },
  // 3) Hawaii hotel
  { sc: 'st', say: ['hawaii'], pal: ['#59c3ff', '#ffe6a8', '#ffffff'], show: ['sun', 'suitcase', 'sunf1'],
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.48, 4.0], l0: [0, 1.38, 0] },
    sfx: [[0.1, 'sparkle', -12], [2.7, 'text_pa', -9], [2.8, 'comic_jajean', -12]],
    cards(lt) { const t0 = 2.6; return lt > t0 ? [{ t: t0, text: '5泊 32万円 → [10万円]', y: 480, size: 64, border: CY }] : []; },
    note: '1泊400ドルと仮定（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.P.sun.position.set(0.6, 2.5, -2.2); s.P.sun.rotation.z = lt * 0.4; s.P.sunf1.position.set(-0.85, 0, -1.3);
      s.P.suitcase.position.set(0.48, 0, 0.15); s.hero.position.set(-0.12, 0, 0); s.hero.rotation.y = 0.15;
      h.reach('R', V(0.42, 1.0, 0.18)); h.shades(lt > 1.2); h.arm('L', 2.4, 0.4, 0.3);
      h.face({ lid: 0.1, look: [0, 0], mouth: 'smile' }); h.body.position.y = lt > 2.6 ? Math.abs(Math.sin(lt * 5)) * 0.05 : 0;
    } },
  // 4) in-game purchase
  { sc: 'st', say: ['game'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['phone'],
    cam: { p0: [0.1, 1.48, 3.5], p1: [0.12, 1.46, 3.3], l0: [0.1, 1.36, 0] },
    sfx: [[0.4, 'comic_pico', -14], [0.8, 'comic_pico', -14], [1.2, 'comic_pico', -14], [1.9, 'text_pa', -9]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '1,600円 → [500円]', y: 480, size: 68, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData, tap = Math.abs(Math.sin(lt * 7.5)) * 0.04;
      s.hero.position.set(-0.05, 0, 0);
      hold(h, 'L', s.P.phone, V(-0.1, 0.98, 0.42)); s.P.phone.rotation.set(-0.7, 0, 0);
      h.reach('R', V(0.0, 1.02 + tap, 0.48)); h.head.rotation.set(0.3, 0, 0);
      h.face({ lid: 0.3, brow: 0.3, look: [0, -0.7], mouth: lt > 1.8 ? 'smile' : 'flat' });
    } },
  // 5) 20-dollar ramen
  { sc: 'st', say: ['ramen'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['counter', 'bowl'],
    cam: { p0: [0, 1.5, 4.0], p1: [0, 1.48, 3.8], l0: [0, 1.32, 0] },
    sfx: [[0.3, 'comic_eat', -12], [1.4, 'text_pa', -9], [1.5, 'comic_eat', -12]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: '20ドル ＝ [1,000円]', y: 480, size: 68, border: CY }] : []; },
    note: '今なら20ドル＝3,200円',
    act(lt, s) {
      const h = s.hero.userData; s.P.counter.position.set(0, 0, -0.2); s.hero.position.set(0.25, 0, -0.95);
      s.P.bowl.position.set(-0.4, 0.93, 0.05); s.P.bowl.scale.setScalar(1.15);
      s.P.bowl.userData.steam.forEach((m, i) => { const u = (lt * 0.4 + i / 3) % 1; m.position.set((i - 1) * 0.06 + Math.sin(u * 6 + i) * 0.03, 0.3 + u * 0.4, 0); m.scale.setScalar(0.04 * (1 - u * 0.6)); });
      h.reach('L', V(-0.3, 1.0 + Math.abs(Math.sin(lt * 6)) * 0.06, -0.05)); h.reach('R', V(0.55, 0.98, -0.2));
      h.face({ lid: 0.25, look: [-0.6, -0.5], mouth: 'o', open: 0.4 + Math.abs(Math.sin(lt * 6)) * 0.7 }); h.head.rotation.set(0.25, 0.1, 0);
    } },
  // 6) imported food gets cheaper
  { sc: 'st', say: ['food'], pal: ['#8fe3c0', '#effbf5', '#ffffff'], show: ['counter', 'onigiri', 'cup'], hero2: true,
    cam: { p0: [0, 1.45, 4.9], p1: [0, 1.42, 4.7], l0: [0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.7, 'sparkle', -12]],
    cards(lt) { return lt > 0.3 ? [{ t: 0.3, text: '食べ物の輸入 [約6割]', y: 480, size: 66, border: CY }] : []; },
    note: '食料自給率 約4割（カロリーベース・農林水産省）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData;
      s.P.counter.position.set(0, 0, -0.2); s.P.onigiri.position.set(-0.3, 0.93, -0.12); s.P.onigiri.scale.setScalar(0.7); s.P.cup.position.set(0.5, 0.93, -0.05);
      s.hero.position.set(-0.65, 0, -0.95); s.hero2.position.set(0.65, 0, -0.95);
      const j = lt > 2.6 ? ease(k(lt, 2.6, 3.0)) : 0;
      h.arm('L', 2.5 * j, 0.4, 0.3); h.arm('R', 2.5 * j, 0.4, 0.3); h2.reach('L', V(0.48, 1.15, -0.08));
      h.face({ lid: 0.15, look: [0.4, -0.3], mouth: j ? 'o' : 'smile', open: 1 }); h2.face({ lid: 0.2, look: [-0.4, -0.4], mouth: 'smile' });
    } },
  // 7) history: 360 yen, record 75 yen
  { sc: 'st', say: ['history'], pal: ['#f3e3c3', '#e8cfa0', '#c79a5b'], show: ['board', 'desk'],
    cam: { p0: [0, 1.5, 4.4], p1: [0, 1.48, 4.2], l0: [0, 1.4, 0] },
    sfx: [[1.2, 'text_pa', -10], [3.6, 'text_pa', -10]],
    tags(lt) {
      const out = [];
      if (lt > 1.1) out.push({ t: 1.1, text: '1949年〜 360円', x: 330, y: 520, h: 76, bg: '#ffffff' });
      if (lt > 3.4) out.push({ t: 3.4, text: '2011年 75円', x: 720, y: 640, h: 76, bg: CY });
      return out;
    },
    note: '円の最高値は75.32円（2011年10月31日）',
    act(lt, s) {
      const h = s.hero.userData; s.P.desk.position.set(-0.75, 0, -0.5); s.hero.position.set(0.25, 0, 0);
      s.hero.rotation.y = -0.2; h.reach('L', V(lt < 3.3 ? -0.55 : 0.2, 1.75, -0.3)); h.arm('R', 0.1, 0.2, 0.2);
      h.face({ lid: 0.25, brow: 0.2, look: [-0.5, 0.5], mouth: 'smile' }); h.head.rotation.set(-0.15, 0.3, 0);
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.5], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) tourists: 1,000-yen ramen costs them 20 dollars
  { sc: 'st', say: ['tourist'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], hero2: true, show: ['bowl'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.4, 4.6], p1: [0, 1.38, 4.4], l0: [0, 1.28, 0] },
    sfx: [[2.0, 'text_pa', -9], [2.1, 'comic_shock2', -10]],
    tags(lt) {
      if (lt < 1.9) return [];
      const a = scr(S.hero2.userData.head.getWorldPosition(V(0, 0, 0)), 0, -250);
      return [{ t: 1.9, text: '20ドル!?', x: a[0], y: Math.max(a[1], 430), h: 90, bg: '#ffffff' }];
    },
    note: '今なら1,000円＝約6ドル',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, sh = lt > 1.9;
      s.hero.position.set(-0.68, 0, 0); s.hero.rotation.y = 0.45; s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.45;
      hold(h, 'R', s.P.bowl, V(-0.22, 1.0, 0.3)); s.P.bowl.scale.setScalar(0.9);
      s.P.bowl.userData.steam.forEach((m, i) => { const u = (lt * 0.4 + i / 3) % 1; m.position.set((i - 1) * 0.06, 0.3 + u * 0.35, 0); m.scale.setScalar(0.035 * (1 - u * 0.6)); });
      h.face({ lid: 0.2, look: [0.6, -0.1], mouth: 'smile' }); h.arm('L', 0.1, 0.2, 0.2);
      h2.face(sh ? { lid: 0, brow: -1, browY: 1, look: [-0.5, -0.3], mouth: 'o', open: 1.2 } : { lid: 0.2, look: [-0.6, -0.3], mouth: 'smile' });
      h2.arm('L', sh ? 0.3 : 0.1, 0.3, sh ? 1.9 : 0.2); h2.arm('R', sh ? 0.3 : 0.1, 0.3, sh ? 1.9 : 0.2);
    } },
  // 10) a car made for 3 million yen, sold for 20,000 dollars
  { sc: 'st', say: ['car'], pal: ['#6bb6ff', '#eef6ff', '#ffffff'], show: ['car', 'bill'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.42, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.8, 'text_pa', -11]],
    tags(lt) {
      const out = [];
      if (lt > 0.3) out.push({ t: 0.3, text: '作るのに 300万円', x: 740, y: 880, h: 74, bg: '#ffffff' });
      if (lt > 1.8) out.push({ t: 1.8, text: '売値 2万ドル', x: 740, y: 975, h: 74, bg: CY });
      return out;
    },
    act(lt, s) {
      const h = s.hero.userData; s.P.car.position.set(0.55, 0, -0.3); s.P.car.rotation.y = -0.35; s.P.car.scale.setScalar(0.75);
      s.hero.position.set(-0.3, 0, 0.3); s.hero.rotation.y = 0.35;
      h.reach('R', V(0.12, 1.0, 0.5)); hold(h, 'L', s.P.bill, V(-0.6, 1.3, 0.6)); s.P.bill.rotation.set(0, 0.3, 0.2);
      h.face({ lid: 0.25, brow: 0.3, look: [0.5, 0], mouth: 'smile' }); h.head.rotation.set(0, 0.2, 0);
    } },
  // 11) only 1 million yen comes back: -2 million per car
  { sc: 'st', say: ['loss'], pal: ['#3d4a7a', '#cfd6ea', RED], dim: 0.9, show: ['car', 'coinsA'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.45, 5.0], p1: [0, 1.45, 4.8], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'comic_fall', -12], [1.9, 'impact_don', -9], [2.0, 'comic_shock2', -10]],
    cards(lt) {
      const out = [{ t: 0.2, text: '入るのは [100万円]', y: 1050, size: 64 }];
      if (lt > 1.9) out.push({ t: 1.9, text: '1台 −200万円', y: 1170, size: 76, border: RED });
      return out;
    },
    note: '今なら320万円（＋20万円）',
    act(lt, s) {
      const h = s.hero.userData, n = Math.round(lerp(32, 10, ease(k(lt, 0.2, 1.6))));
      s.P.car.position.set(0.6, 0, -0.4); s.P.car.rotation.y = -0.35; s.P.car.scale.setScalar(0.75);
      s.P.coinsA.position.set(0.2, 0, 0.5); s.P.coinsA.userData.items.forEach((it, i) => { it.visible = i < n; });
      s.hero.position.set(-0.3, 0, 0.1); s.hero.rotation.y = 0.3;
      const sh = lt > 1.9; h.face(sh ? { lid: 0, brow: -1, browY: 1, look: [0.4, -0.4], mouth: 'o', open: 1.1 } : { lid: 0.3, brow: -0.6, look: [0.5, -0.5], mouth: 'flat' });
      h.arm('L', sh ? 0.3 : 0.1, 0.3, sh ? 1.9 : 0.3); h.reach('R', sh ? V(0.0, 1.75, 0.4) : V(0.12, 0.9, 0.5));
    } },
  // 12) good news: overseas trips cost a third
  { sc: 'st', say: ['good'], pal: ['#59c3ff', '#ffe6a8', '#ffffff'], show: ['sun', 'suitcase', 'sunf1', 'sunf2'], hud: OUT, hudColor: CY,
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.48, 4.1], l0: [0, 1.4, 0] },
    sfx: [[0.0, 'sparkle', -11], [1.5, 'comic_jajean', -11]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '海外旅行 [3分の1]', y: 480, size: 70, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.sun.position.set(0.5, 2.45, -2.2); s.P.sun.rotation.z = lt * 0.4; s.P.sunf1.position.set(-0.85, 0, -1.2); s.P.sunf2.position.set(0.9, 0, -1.5); s.P.sunf2.scale.setScalar(0.85);
      s.P.suitcase.position.set(-0.6, Math.abs(Math.sin(lt * 5)) * 0.06, 0.2);
      const j = Math.abs(Math.sin(lt * 5)) * 0.06; h.body.position.y = j; h.shades(true); s.hero.position.set(0.1, 0, 0);
      h.reach('L', V(-0.6, 1.18 + j, 0.2)); h.arm('R', 2.7, 0.35, 0.2); h.face({ mouth: 'o', open: 1.1 });
    } },
  // 13) bad news: whole factories move abroad
  { sc: 'st', say: ['bad'], pal: ['#8a95a8', '#e3e7ee', '#ffffff'], show: ['factory'], hud: OUT, hudColor: RED,
    cam: { p0: [0, 1.5, 4.8], p1: [0, 1.5, 4.7], l0: [0, 1.25, 0] },
    sfx: [[1.4, 'whoosh_slide', -12], [2.6, 'comic_fall', -11]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '工場ごと [海外]へ', y: 480, size: 70, border: RED }] : []; },
    act(lt, s) {
      const h = s.hero.userData, go = ease(k(lt, 1.5, 3.8)), F = s.P.factory;
      F.position.set(0.35 + go * 2.6, go > 0 ? Math.abs(Math.sin(lt * 8)) * 0.03 : 0, -0.5); F.scale.setScalar(0.85);
      F.userData.items.forEach((m, i) => { const u = (lt * 0.5 + i / 4) % 1; m.position.set(0.47 - u * 0.2, 1.25 + u * 0.5, -0.1); m.scale.setScalar(0.06 + u * 0.08); });
      s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.3;
      h.arm('R', 2.6, 0.5 + Math.sin(lt * 7) * 0.25, 0.3); h.arm('L', 0.1, 0.2, 0.2);
      h.face({ lid: 0.35, brow: -1, look: [0.7, 0], mouth: 'o', open: 0.4 }); h.head.rotation.set(0.05, -0.3, 0.1);
    } },
  // 14) question
  { sc: 'st', say: ['cta'], pal: ['#ff9f5a', '#fbe9d0', '#3f6fd8'], hud: HUD, show: ['phone'],
    cam: { p0: [0, 1.5, 3.9], p1: [0, 1.5, 3.5], l0: [0, 1.42, 0] },
    sfx: [[0.0, 'question', -11], [1.3, 'text_pa', -11], [1.5, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 310, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: DARK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; h.head.rotation.set(0, 0, Math.sin(lt * 1.6) * 0.12);
      h.face({ lid: 0.12, browY: 1, look: [0, 0], mouth: 'smile' }); hold(h, 'R', s.P.phone, V(0.3, 1.15, 0.38)); s.P.phone.rotation.set(0, -0.3, 0); h.arm('L', 0.1, 0.2, 0.3);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも1ドルが', '[50円]になったら？'], titleEnd: at('iphone') - 0.1, hud: HUD,
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; return st; } },
});
