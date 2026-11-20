// ep47_kyuushoku_otona (pop / arm B 生活ルール改変): もしも大人にも給食が毎日出たら？
// 型は sp_geppu2x / ep46。台本・数字・小道具は自作。
// 前提（試算）:
//   給食1食: 文科省「学校給食費の抜本的な負担軽減」令和8年度 基準額 小学校 月5,200円×11か月÷年190食 = 301円 ≒ 約300円
//   大人の昼食代: SBI新生銀行 会社員のお小遣い調査 2024年 男性709円・女性694円 → 約700円
//   差: 700−300 = 400円/日 × 出勤248日（厚労省 令和7年就労条件総合調査 年間休日116.6日）= 99,200円 ≒ 約10万円/年
//   就業者 6,781万人（総務省 労働力調査 2024年平均）× 牛乳200mL = 13,562m³ → 立方体なら1辺23.8m ≒ ビル8階（1階3m）
//   カレーの日: 6,781万人 = 6,781万皿 / 店選び・行列 1日15分（仮定）×248日 = 62時間
//   ランチの店: 700円×6,781万人×248日 = 11.8兆円 ≒ 12兆円（全員が外で買っていた場合の上限）
//   当番: 30人の職場で5人ずつ交代 → 30÷5 = 6日に1回
import { run, THREE, V, clamp, ease, lerp, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, rbox, cyl, caps } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep47_kyuushoku_otona.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const G = () => new THREE.Group();
const HOOK = ['#ff9d5c', '#fff1e4', '#3f6fd8'];

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.8 }); }
const milkLabel = () => label(256, 280, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 280); c.fillStyle = '#3f8ef0'; c.fillRect(0, 150, 256, 130);
  c.fillStyle = '#3f8ef0'; c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.fillText('牛乳', 128, 115); c.fillStyle = '#ffffff'; c.font = 'bold 40px sans-serif'; c.fillText('200mL', 128, 232); });
function mkMilk(g, lm) { // 1 x 1.4 x 1 box + pyramid top, origin at the bottom
  rbox(1, 1.4, 1, 0.04, '#ffffff', 0, 0.7, 0, g);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.0), lm); f.position.set(0, 0.72, 0.505); g.add(f);
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.71, 0.45, 4), M('#f2f6fb')); top.rotation.y = Math.PI / 4; top.position.y = 1.62; top.castShadow = true; g.add(top);
  return g; }

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  const lm = milkLabel();
  { const g = mkMilk(G(), lm); g.scale.setScalar(2.1); reg('bigmilk', g); }
  { const g = G(); const m = mkMilk(G(), lm); m.scale.setScalar(0.12); g.add(m); const st = cyl(0.007, 0.007, 0.16, '#ff7a9a', 0.02, 0.26, 0, g); st.rotation.z = -0.2; reg('milk', g); }
  // school-lunch tray: rice, soup, main dish, mini milk
  for (const n of ['tray', 'trayB']) { const t = G(); rbox(0.5, 0.03, 0.34, 0.012, '#e9c98a', 0, 0, 0, t);
    const bowl = (x, z, col, fill) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(col, 0.4)); b.material.side = THREE.DoubleSide; b.position.set(x, 0.085, z); t.add(b); cyl(0.066, 0.066, 0.01, fill, x, 0.08, z, t); };
    bowl(-0.13, 0.07, '#ffffff', '#ffffff'); sph(0.05, '#ffffff', -0.13, 0.09, 0.07, t, 1.2, 0.6, 1.2);
    bowl(0.04, 0.08, '#c0563a', '#e8a95c');
    cyl(0.09, 0.08, 0.015, '#ffffff', -0.08, 0.025, -0.08, t); sph(0.05, '#a8642c', -0.08, 0.05, -0.08, t, 1.3, 0.6, 1); sph(0.025, '#7bd88f', -0.03, 0.05, -0.06, t);
    const m = mkMilk(G(), lm); m.scale.setScalar(0.085); m.position.set(0.17, 0.015, -0.07); t.add(m); reg(n, t); }
  // curry plates (items: show i < n)
  { const c = G(); c.userData.items = [];
    for (let i = 0; i < 30; i++) { const p = G(); cyl(0.17, 0.15, 0.025, '#ffffff', 0, 0.012, 0, p); sph(0.09, '#ffffff', -0.05, 0.03, 0, p, 1.2, 0.45, 1.1); sph(0.09, '#b8641e', 0.05, 0.03, 0.01, p, 1.1, 0.4, 1.1);
      const r = Math.floor(i / 10); p.position.set(((i % 10) - 4.5) * 0.4 + (r % 2) * 0.2, r * 0.05, -0.5 - r * 0.45); c.add(p); c.userData.items.push(p); } reg('currys', c); }
  // lunch pot (shokkan) + ladle
  { const p = G(); cyl(0.24, 0.22, 0.36, M('#c9d0d8', 0.3), 0, 0.18, 0, p); cyl(0.25, 0.25, 0.03, M('#aeb6c0', 0.3), 0, 0.36, 0, p); cyl(0.22, 0.22, 0.01, '#b8641e', 0, 0.35, 0, p);
    for (const x of [-0.27, 0.27]) rbox(0.05, 0.03, 0.12, 0.01, '#aeb6c0', x, 0.3, 0, p); reg('pot', p); }
  { const l = G(); const h = caps(0.012, 0.42, '#aeb6c0', 0, 0.22, 0, l); void h; const cup = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#aeb6c0', 0.3)); cup.material.side = THREE.DoubleSide; cup.position.y = 0.0; l.add(cup); reg('ladle', l); }
  // lunch-duty hat + white coat (attached to the hero each frame)
  { const c = G(); cyl(0.33, 0.31, 0.26, '#ffffff', 0, 0.12, 0, c); sph(0.33, '#ffffff', 0, 0.26, 0, c, 1, 0.45, 1); reg('hat', c); }
  { const c = G(); caps(0.29, 0.3, M('#ffffff', 0.8), 0, 0, 0, c); rbox(0.08, 0.08, 0.02, 0.01, '#d9dde3', 0, 0.05, 0.29, c); reg('coat', c); }
  // lunch shop
  { const s = G(); rbox(1.7, 1.55, 0.5, 0.05, '#f4efe6', 0, 0.78, 0, s); rbox(1.2, 0.7, 0.04, 0.02, '#7fb8d8', 0, 0.62, 0.25, s);
    for (let i = 0; i < 6; i++) { const a = rbox(0.3, 0.05, 0.42, 0.01, i % 2 ? '#ffffff' : '#e2463c', -0.75 + i * 0.3, 1.66, 0.36, s); a.rotation.x = 0.45; }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.3), label(390, 90, (c) => { c.fillStyle = '#2c3b6b'; c.fillRect(0, 0, 390, 90); c.fillStyle = '#ffffff'; c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.fillText('ランチ 700円', 195, 66); }));
    sg.position.set(0, 1.25, 0.26); s.add(sg); reg('shop', s); }
  // monthly menu sheet
  { const p = G(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.46), label(256, 330, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 330); c.fillStyle = '#2c3b6b'; c.font = 'bold 36px sans-serif'; c.textAlign = 'center'; c.fillText('こんだて表', 128, 48);
      c.strokeStyle = '#9aa3ad'; c.lineWidth = 3; for (let i = 0; i <= 5; i++) { c.beginPath(); c.moveTo(20, 70 + i * 50); c.lineTo(236, 70 + i * 50); c.stroke(); }
      c.font = 'bold 26px sans-serif'; ['月 カレー', '火 さば', '水 レバー', '木 揚げパン', '金 ひじき'].forEach((t, i) => { c.fillStyle = i === 2 ? '#e2463c' : '#2c3b6b'; c.fillText(t, 128, 105 + i * 50); }); }));
    m.material.side = THREE.DoubleSide; p.add(m); reg('menu', p); }
}

const place = (o, x, z, ry = 0) => { o.visible = true; o.position.set(x, 0, z); o.rotation.set(0, ry, 0); if (o === S.hero) o.userData.body.scale.set(1, 1, 1); };
const hold = (s, name, side, p, rz = 0, ry = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, ry, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.1 : -0.1, -0.06, -0.03))); return o; };
const tray2 = (who, name, p) => { const o = S.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, 0); who.userData.reach('L', p.clone().add(V(-0.24, 0.0, 0))); who.userData.reach('R', p.clone().add(V(0.24, 0.0, 0))); who.userData.hand('L', 'pa'); who.userData.hand('R', 'pa'); return o; };
const duty = (s) => { const h = s.hero.userData; const c = s.P.hat; c.visible = true; h.head.add(c); c.position.set(0, 0.3, -0.02); c.rotation.set(-0.15, 0, 0); c.scale.setScalar(1);
  const w = s.P.coat; w.visible = true; h.body.add(w); w.position.set(0, 0.78, 0); w.rotation.set(0, 0, 0); w.scale.setScalar(1); };
const curryN = (s, n) => { const c = s.P.currys; c.visible = true; c.userData.items.forEach((it, i) => { it.visible = i < n; }); };
// giant milk box drops behind the hero at t0
function bigDrop(s, lt, t0, x = 0, z = -1.6) { const b = s.P.bigmilk; const u = k(lt, t0 - 0.25, t0); b.visible = lt > t0 - 0.25; b.position.set(x, 9 * (1 - u * u), z); b.rotation.set(0, -0.12, 0);
  const sq = lt > t0 ? 1 - 0.08 * Math.exp(-(lt - t0) * 8) * Math.cos((lt - t0) * 30) : 1; b.scale.set(2.1, 2.1 * sq, 2.1); return lt > t0; }

const plan = [
  // 0) cold open (flash-forward of #5): a building-sized milk box slams down behind the hero; push in to a smug sip
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.0, 1.7, 7.4], p1: [0.1, 1.5, 3.4], l0: [0.0, 1.7, -0.6], l1: [0.05, 1.42, 0.4], hold: 1.2, dur: 2.2 },
    shake: [[0.25, 0.08, 0.6]], lines: [[0.24, 0.9]],
    sfx: [[0.0, 'whoosh_gust', -12], [0.25, 'impact_doon', -9], [0.27, 'text_impact', -11], [1.5, 'whoosh_slide', -13], [2.3, 'comic_eat', -10]],
    stamps: [{ t: 0.28, text: '牛乳 ビル8階分!!', x: 540, y: 400, rot: -6, color: YEL, size: 88, dur: 1.15 },
      { t: 2.3, text: 'ちゅー…', x: 560, y: 1440, rot: -5, color: '#ffffff', size: 60, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData; const landed = bigDrop(s, lt, 0.25); place(s.hero, 0, 0.45, 0);
      hold(s, 'milk', 'R', V(0.16, 1.02, 0.78), 0.1);
      if (!landed) { h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.3, look: [0, 0], mouth: 'smile' }); }
      else if (lt < 1.4) { h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.6], mouth: 'o', open: 1 }); }
      else { h.arm('L', 0.3, 2.5, 0.3); h.hand('L', 'choki'); h.face({ lid: 0.55, brow: 0.7, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.12 * ease(k(lt, 1.9, 2.3)); }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: ['#4fb3ff', '#e8f5ff', '#ffd23a'], show: [],
    cam: { p0: [0.0, 1.5, 6.0], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.5, 'comic_surprise', -12]],
    stamps: [{ t: 1.6, text: '大人にも?!', x: 800, y: 1080, rot: 8, color: RED, size: 70, dur: 1.1 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.4, 0.1);
      tray2(s.hero, 'tray', V(-0.1, 0.95, 0.82));
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.4, look: [0, -0.5], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 1 });
    } },
  // 2) a school lunch is about 300 yen
  { sc: 'st', say: ['price'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: ['desk'], hud: ['給食', '1食300円'],
    cam: { p0: [0.1, 1.5, 5.0], p1: [0.1, 1.48, 4.7], l0: [0.1, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.4, 'coin_toss', -13]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '1食 [約300円]', y: 480, size: 72, border: CY, sub: '小学校 月5,200円÷約17食（試算）' }] : []; },
    note: '文科省 給食費の負担軽減 基準額 令和8年度',
    act(lt, s) {
      place(s.P.desk, 0.55, -0.2); const t = s.P.tray; t.visible = true; t.position.set(0.55, 0.79, -0.15); t.rotation.set(0, -0.2, 0);
      const h = s.hero.userData; place(s.hero, -0.42, 0.35, 0.3);
      h.reach('R', V(0.3, 0.95, -0.05)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.4, 1.7);
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0.2, look: [0.6, -0.4], mouth: 'smile' } : { lid: 0, brow: 0.6, browY: 1, look: [0, 0], mouth: 'o', open: 0.8 });
    } },
  // 3) adult lunch ~700 yen
  { sc: 'st', say: ['lunch'], pre: 0.15, pal: ['#ffb84a', '#fff4dc', '#3f6fd8'], show: ['shop'], hud: ['ランチ', '平均700円'],
    cam: { p0: [0.0, 1.45, 5.2], p1: [0.0, 1.43, 4.9], l0: [0.0, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -10], [1.5, 'comic_shock2', -13]],
    cards(lt) { return lt > 1.0 ? [{ t: 1.0, text: '平均 [約700円]', y: 480, size: 72, border: RED, sub: '会社員の1日の昼食代（2024年）' }] : []; },
    tags(lt) { const t0 = 1.6; return lt > t0 ? [{ t: t0, text: 'ランチ 700円', x: 300, y: 1150, h: 80, bg: '#ffffff' }, { t: t0 + 0.25, text: '給食 300円', x: 760, y: 1150, h: 96, bg: CY }] : []; },
    note: 'SBI新生銀行 会社員のお小遣い調査 2024年',
    act(lt, s) {
      place(s.P.shop, 0.15, -1.3);
      const h = s.hero.userData; place(s.hero, -0.15, 0.45, 0.1);
      hold(s, 'bowl', 'R', V(0.25, 0.98, 0.85), 0); h.arm('L', 0.4, 0.6, 1.5); h.hand('L', 'pa');
      h.face(lt < 1.0 ? { lid: 0.1, brow: 0.3, look: [0.4, -0.4], mouth: 'smile' } : { lid: 0, brow: -0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.0 });
    } },
  // 4) 400 yen a day -> 100,000 yen a year
  { sc: 'st', say: ['save'], pre: 0.15, pal: ['#7bd88f', '#effbf1', '#ff8f3a'], show: ['coinsA'], hud: ['浮くお金', '年10万円'], hudColor: YEL,
    cam: { p0: [0.0, 1.45, 4.9], p1: [0.0, 1.43, 4.6], l0: [0.0, 1.2, 0] },
    sfx: [[0.4, 'coin_toss', -12], [1.4, 'text_pa', -10], [2.6, 'sparkle', -14]],
    cards(lt) { return lt > 0.3 && lt < 1.6 ? [{ t: 0.3, text: '毎日 [+400円]', y: 480, size: 72, border: CY, sub: '700円−300円' }]
      : lt >= 1.6 ? [{ t: 1.6, text: '1年で [約10万円]', y: 480, size: 72, border: YEL, sub: '400円×出勤248日（試算）' }] : []; },
    act(lt, s) {
      const c = s.P.coinsA; place(c, 0.5, 0.05); const n = Math.round(4 + 28 * ease(k(lt, 0.3, 2.8))); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.4, 0.3, 0.3);
      h.reach('R', V(0.38, 0.1 + n * 0.028, 0.1)); h.hand('R', 'pa'); h.arm('L', 0.3, lt > 1.6 ? 2.6 : 0.4, 0.3); h.hand('L', lt > 1.6 ? 'pa' : 'gu');
      h.face(lt < 1.6 ? { lid: 0.2, brow: 0.3, look: [0.6, -0.2], mouth: 'smile' } : { lid: 0, brow: 0.8, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 5) the milk box (the cold open, in its place)
  { sc: 'st', say: ['milk'], pre: 0.15, hold: 0.6, pal: HOOK, show: [], hud: ['牛乳', '1日1.4万m³'],
    cam: { p0: [0.0, 1.7, 7.4], p1: [0.0, 1.7, 7.0], l0: [0.0, 1.7, -0.6] },
    shake: [[1.0, 0.07, 0.5]], lines: [[1.0, 0.7]],
    sfx: [[0.75, 'whoosh_gust', -12], [1.0, 'impact_doon', -10], [1.4, 'text_pa', -10]],
    cards(lt) { return lt > 1.3 ? [{ t: 1.3, text: 'ビル [8階] の高さ', y: 480, size: 72, border: YEL, sub: '6,781万人×200mL＝1.4万m³（試算）' }] : []; },
    note: '就業者6,781万人 総務省 労働力調査 2024年',
    act(lt, s) {
      const h = s.hero.userData; const landed = bigDrop(s, lt, 1.0); place(s.hero, 0, 0.45, 0);
      hold(s, 'milk', 'R', V(0.2, 1.0, 0.78), 0.1);
      if (!landed) { h.arm('L', 0.3, 0.4, 1.6); h.face({ lid: 0.3, brow: 0.3, look: [0, 0], mouth: 'smile' }); }
      else { h.arm('L', 0.6, 1.3, 0.6); h.hand('L', 'pa'); h.face({ lid: 0, brow: 0.9, browY: 1, look: [0, 0.6], mouth: 'o', open: 1 }); }
    } },
  // 6) curry day: 67.81 million plates
  { sc: 'st', say: ['curry'], pre: 0.15, pal: ['#c79bff', '#f4ecff', '#ffd23a'], show: ['pot'], hud: ['カレーの日', '6,781万皿'],
    cam: { p0: [0.0, 1.55, 5.4], p1: [0.0, 1.5, 5.0], l0: [0.0, 1.2, -0.2] },
    sfx: [[0.3, 'text_pa', -10], [1.2, 'comic_pico', -12], [2.0, 'comic_eat', -12]],
    cards(lt) { return lt > 1.1 ? [{ t: 1.1, text: '全国で [6,781万皿]', y: 480, size: 68, border: CY, sub: '働く人全員が同じ献立（試算）' }] : []; },
    act(lt, s) {
      curryN(s, Math.round(30 * ease(k(lt, 0.3, 2.4)))); place(s.P.pot, 0.45, 0.45);
      duty(s); const h = s.hero.userData; place(s.hero, -0.3, 0.45, 0.25);
      const dip = Math.max(0, Math.sin(lt * 4)) * 0.1; hold(s, 'ladle', 'R', V(0.3, 0.92 + dip, 0.5), -0.3);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'pa');
      h.face(lt < 1.1 ? { lid: 0.2, brow: 0.4, look: [0.6, -0.4], mouth: 'smile' } : { lid: 0.1, brow: 0.6, look: [0, 0], mouth: 'o', open: 0.8 });
    } },
  // 7) no shop hunting, no queue: 62 hours a year
  { sc: 'st', say: ['time'], pre: 0.15, pal: ['#2f6fb0', '#d6e8f7', '#ffd23a'], show: ['clock'], hud: ['行列', '0分'],
    cam: { p0: [0.0, 1.45, 5.6], p1: [0.0, 1.43, 5.2], l0: [0.0, 1.2, 0] },
    sfx: [[0.6, 'vanish_hyun', -12], [1.9, 'text_pa', -10], [2.8, 'emo_shine', -15]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '1年で [62時間]', y: 480, size: 72, border: YEL, sub: '店選び・行列 1日15分×248日（試算）' }] : []; },
    tags(lt) { const t0 = 0.4; return lt > t0 ? [{ t: t0, text: 'ふつう 行列15分', x: 300, y: 1150, h: 76, bg: '#ffffff' }, { t: t0 + 0.6, text: 'あなた 0分', x: 770, y: 1150, h: 96, bg: CY }] : []; },
    act(lt, s) {
      const c = s.P.crowd; c.visible = true; const gone = k(lt, 0.5, 1.4); c.userData.items.forEach((it, i) => { it.visible = i / 16 >= gone; });
      const cl = s.P.clock; cl.position.set(0.95, 1.9, -0.8); cl.scale.setScalar(1.2); cl.userData.mh.rotation.z = -lt * 6; cl.userData.hh.rotation.z = -lt * 0.5;
      const h = s.hero.userData; place(s.hero, -0.2, 0.6, 0.1);
      tray2(s.hero, 'tray', V(-0.2, 0.95, 1.02));
      h.face(lt < 1.4 ? { lid: 0.1, brow: 0.3, look: [0.5, 0.3], mouth: 'o', open: 0.5 } : { lid: 0.5, brow: 0.5, look: [0, 0], mouth: 'smile' });
    } },
  // 8) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; place(s.hero, 0, 0, 0); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 9) no choice: 248 meals decided
  { sc: 'st', say: ['menu'], pre: 0.15, pal: ['#ff8fb3', '#fff0f5', '#3f6fd8'], show: [], hud: ['メニュー', '選べない'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 4.6], p1: [0.0, 1.43, 4.3], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [3.2, 'comic_shock2', -13]],
    cards(lt) { return lt > 2.0 ? [{ t: 2.0, text: '1年 [248食] 決定済み', y: 480, size: 64, border: RED, sub: '出勤248日＝248食' }] : []; },
    stamps: [{ t: 3.3, text: 'レバーの日…', x: 760, y: 1180, rot: 6, color: '#ffffff', size: 62, dur: 1.2 }],
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.3, 0.35, 0.2);
      const p = hold(s, 'menu', 'R', V(0.22, 1.2, 0.75), -0.05, -0.2); p.scale.setScalar(1.4);
      h.arm('L', 0.4, 0.7, 1.5); h.hand('L', 'pa');
      h.face(lt < 2.0 ? { lid: 0.2, brow: 0, look: [0.6, -0.1], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0.5, 0], mouth: 'o', open: 1.0 });
    } },
  // 10) lunch shops lose 12 trillion yen
  { sc: 'st', say: ['shop'], pre: 0.15, pal: ['#5a6b8a', '#e6ebf3', '#ffd23a'], show: ['shop', 'coinsA'], hud: ['ランチの店', '−12兆円'], hudColor: RED,
    cam: { p0: [0.0, 1.45, 5.4], p1: [0.0, 1.43, 5.1], l0: [0.0, 1.2, 0] },
    sfx: [[0.6, 'vanish_hyun', -11], [1.0, 'text_pa', -10], [2.1, 'comic_fall', -12]],
    cards(lt) { return lt > 0.9 ? [{ t: 0.9, text: '年 [−12兆円]', y: 480, size: 76, border: RED, sub: '700円×6,781万人×248日（上限の試算）' }] : []; },
    stamps: [{ t: 2.0, text: 'ガラーン…', x: 760, y: 1150, rot: 6, color: '#ffffff', size: 66, dur: 1.0 }],
    act(lt, s) {
      place(s.P.shop, -0.1, -1.3); const c = s.P.coinsA; place(c, 0.75, 0.2); const n = Math.round(32 * (1 - ease(k(lt, 0.4, 1.6)))); c.userData.items.forEach((it, i) => { it.visible = i < n; });
      const h = s.hero.userData; place(s.hero, -0.35, 0.5, 0.2);
      h.reach('R', V(0.55, 0.25 + n * 0.028, 0.25)); h.hand('R', 'pa'); h.arm('L', 0.5, 0.6, 1.4); h.hand('L', 'pa');
      h.face(lt < 0.9 ? { lid: 0.2, brow: 0, look: [0.6, -0.3], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 11) lunch duty every 6 days
  { sc: 'st', say: ['touban'], pre: 0.15, pal: ['#8a6bd8', '#ece6fb', '#ffd23a'], hero2: true, show: ['pot'], hud: ['給食当番', '6日に1回'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.8], p1: [0.0, 1.48, 5.5], l0: [0.0, 1.3, 0] },
    sfx: [[0.4, 'text_pa', -10], [1.6, 'text_pa', -10], [2.8, 'comic_pico', -11]],
    cards(lt) { return lt > 1.5 ? [{ t: 1.5, text: '[6日に1回] 当番', y: 480, size: 72, border: RED, sub: '30人で5人ずつ交代（試算）' }] : []; },
    stamps: [{ t: 2.8, text: 'おかわり!', x: 800, y: 1160, rot: 6, color: '#ffffff', size: 66, dur: 1.0 }],
    act(lt, s) {
      place(s.P.pot, -0.15, 0.35); duty(s); const h = s.hero.userData, h2 = s.hero2.userData; place(s.hero, -0.72, 0.25, 0.35);
      const dip = Math.max(0, Math.sin(lt * 3.5)) * 0.12; hold(s, 'ladle', 'R', V(-0.2, 0.85 + dip, 0.4), -0.4); h.arm('L', 0.4, 0.6, 1.5);
      place(s.hero2, 0.72, 0.2, -0.35); const t = s.P.trayB; t.visible = true; const tp = V(0.6, 0.95 + (lt > 2.7 ? 0.15 * ease(k(lt, 2.7, 3.0)) : 0), 0.62); tray2(s.hero2, 'trayB', tp);
      h.face(lt < 1.5 ? { lid: 0.2, brow: 0.3, look: [0.5, -0.4], mouth: 'smile' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.8 });
      h2.face({ lid: 0.2, brow: 0.5, look: [-0.6, 0], mouth: 'smile' });
    } },
  // 12) good news / bad news
  { sc: 'st', say: ['news'], pre: 0.15, pal: ['#35b0a0', '#e2f6f2', '#ffd23a'], show: [], hud: ['給食の', '昼'], hudColor: RED,
    cam: { p0: [0.0, 1.5, 5.9], p1: [0.0, 1.48, 5.6], l0: [0.0, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -10], [2.2, 'text_pa', -10], [4.4, 'comic_jajean', -13]],
    cards(lt) { return lt < 2.15 ? (lt > 0.25 ? [{ t: 0.25, text: '栄養バランス [満点]', y: 480, size: 62, border: CY, sub: 'いいニュース' }] : [])
      : [{ t: 2.15, text: '[部長] と向かい合わせ', y: 480, size: 60, border: RED, sub: '悪いニュース' }]; },
    stamps: [{ t: 4.4, text: 'いただきます!!', x: 540, y: 1470, rot: -4, color: YEL, size: 72, dur: 1.3 }],
    act(lt, s) {
      const h = s.hero.userData;
      if (lt < 2.15) { s.hero2.visible = false; place(s.hero, 0, 0.45, 0); tray2(s.hero, 'tray', V(0, 0.95, 0.88));
        h.face({ lid: 0.3, brow: 0.6, look: [0, 0], mouth: 'smile' }); }
      else { const h2 = s.hero2.userData; s.hero2.visible = true; place(s.P.desk, 0, 0.05);
        const a = s.P.tray, b = s.P.trayB; a.visible = b.visible = true; a.position.set(-0.24, 0.79, 0.05); a.rotation.set(0, 1.57, 0); b.position.set(0.24, 0.79, 0.05); b.rotation.set(0, -1.57, 0);
        place(s.hero, -0.68, 0.2, 0.45); place(s.hero2, 0.68, 0.2, -0.45);
        const clap = lt > 4.3; for (const [c, x] of [[h, -0.55], [h2, 0.55]]) { if (clap) { c.reach('L', V(x - 0.04, 0.98, 0.7)); c.reach('R', V(x + 0.04, 0.98, 0.7)); c.hand('L', 'pa'); c.hand('R', 'pa'); } else { c.arm('L', 0.3, 0.3, 1.8); c.arm('R', 0.3, 0.3, 1.8); } }
        h.face({ lid: 0, brow: -1, browY: 1, look: [0.5, 0], mouth: 'o', open: 0.7 });
        h2.face({ lid: 0.3, brow: 0.6, look: [-0.6, 0], mouth: 'smile' }); }
    } },
  // 13) question + follow (back to the hook colours)
  { sc: 'st', say: ['cta'], pre: 0.15, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.1; return lt > t0 ? [{ t: t0, text: '給食がいい', x: 320, y: 1130, h: 110, bg: CY }, { t: t0 + 0.2, text: 'ランチは自由', x: 760, y: 1130, h: 100, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1370, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1470, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; place(s.hero, -0.1, 0.2, 0.05);
      hold(s, 'milk', 'R', V(0.3, 0.95, 0.55), 0.1);
      h.arm('L', 0.3, 2.4, 0.4); h.hand('L', 'choki');
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも大人にも[給食]が', '毎日出たら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['給食', '大人にも'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
