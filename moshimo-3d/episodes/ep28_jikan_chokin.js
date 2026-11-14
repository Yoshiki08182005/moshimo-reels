// ep28_jikan_chokin (pop スタイル / アームB 逆転の応用): もしもスマホを見た時間を貯金できたら？
// 構成の型は sp_geppu2x。台本・数字・ネタ・キャラ(もしもくん／相手役)は自作。
// 設定: スマホを見た時間がそのまま「時間貯金」になり、あとで引き出せる。引き出している間、まわりの時間は止まる。
// 前提: 基準 = 1日165分（博報堂「メディア定点調査2025」携帯/スマホの1日あたり接触時間・東京地区15〜69歳）
//   1週間 165×7 = 1,155分 = 19.25時間 / 1年 165×365 = 60,225分 = 1,003.75時間 = 41.8日 ≒ 42日 = 6週間
//   寝だめ 1,003.75h ÷ 8h = 125.5晩 / 時給 1,003.75h × 1,121円（最低賃金 全国加重平均・厚労省 2025年度）= 112.5万円
//   人生: 15歳〜81.09歳（平均寿命 男性・厚労省 令和6年簡易生命表）= 66.09年 × 41.8日 = 2,764日 = 7.57年 ≒ 7年半
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep28_jikan_chokin.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), y + dy]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#ff9f5a', '#fbe9d0', '#3f6fd8'], FRZ = ['#7fc8e8', '#e6f3fa', '#ffffff'];

function ringSet() {
  const g = G(); g.userData.items = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 72), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); g.add(m); g.userData.items.push(m); }
  return g;
}
function rings(g, pos, t, o = {}) {
  const n = o.n ?? 3, life = o.life ?? 0.8, gap = o.gap ?? 0.12, sp = o.speed ?? 1.5;
  g.visible = true; g.position.copy(pos);
  g.userData.items.forEach((m, i) => {
    const u = t - i * gap; m.visible = i < n && u > 0 && u < life; if (!m.visible) return;
    m.scale.setScalar(0.1 + u * sp); m.material.opacity = (1 - u / life) * 0.95; m.material.color.set(o.col ?? '#ffffff');
  });
}

function addProps(api) {
  const { scene, P, hero2 } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  reg('rings', ringSet());
  { // time piggy bank (pink pig with a clock on its side)
    const g = G(), pk = '#ff9ec4'; sph(0.24, pk, 0, 0.26, 0, g, 1.3, 1, 1);
    const sn = cyl(0.075, 0.075, 0.06, '#ff86b3', 0.31, 0.27, 0, g); sn.rotation.z = Math.PI / 2;
    for (const z of [-0.025, 0.025]) sph(0.014, '#7a2a4a', 0.342, 0.27, z, g);
    for (const z of [-0.1, 0.1]) { sph(0.06, pk, 0.2, 0.46, z, g, 0.5, 1, 1); sph(0.026, '#1b1b1f', 0.27, 0.33, z * 0.9, g); }
    for (const [x, z] of [[-0.17, -0.11], [0.17, -0.11], [-0.17, 0.11], [0.17, 0.11]]) caps(0.045, 0.06, pk, x, 0.06, z, g);
    rbox(0.13, 0.015, 0.03, 0.006, '#5a1f3a', -0.02, 0.5, 0, g);
    const f = cyl(0.11, 0.11, 0.02, '#ffffff', -0.02, 0.27, 0.235, g); f.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 8, 30), M('#ffd23a', 0.35)); rim.position.set(-0.02, 0.27, 0.246); g.add(rim);
    const hand = (len, w, col) => { const p = G(); p.position.set(-0.02, 0.27, 0.25); rbox(w, len, 0.006, 0.003, col, 0, len / 2 - 0.01, 0, p); g.add(p); return p; };
    g.userData.hh = hand(0.06, 0.016, '#2c3b6b'); g.userData.mh = hand(0.09, 0.012, '#e2463c');
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16, Math.PI * 1.5), M(pk)); tail.position.set(-0.33, 0.33, 0); tail.rotation.y = Math.PI / 2; g.add(tail);
    reg('piggy', g);
  }
  { // time coin
    const c = G(), d = cyl(0.07, 0.07, 0.018, M('#ffc533', 0.3), 0, 0, 0, c); d.rotation.x = Math.PI / 2;
    rbox(0.012, 0.045, 0.004, 0.002, '#7a4a00', 0, 0.018, 0.011, c); rbox(0.035, 0.012, 0.004, 0.002, '#7a4a00', 0.014, 0, 0.011, c); reg('coin', c);
  }
  { // a frozen ball for hero2
    reg('fball', sph(0.13, '#ff6b5a', 0, 0, 0)); }
  { // calendar page "42"
    const c = G(), tex = canvasTex(256, 300, (x) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 300); x.fillStyle = '#e2463c'; x.fillRect(0, 0, 256, 70); x.fillStyle = '#ffffff'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('おやすみ', 128, 36); x.fillStyle = '#22252d'; x.font = 'bold 150px sans-serif'; x.fillText('42', 128, 175); x.font = 'bold 40px sans-serif'; x.fillText('日間', 128, 268); });
    rbox(0.5, 0.6, 0.03, 0.02, '#2c3b6b', 0, 0, 0, c); const pg = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.54), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); pg.position.z = 0.017; c.add(pg);
    c.position.set(-0.75, 1.75, -2.3); reg('cal', c);
  }
  { // stack of bills
    const g = G(); g.userData.items = [];
    for (let i = 0; i < 12; i++) { const b = G(); rbox(0.34, 0.03, 0.17, 0.008, '#5fae6b', 0, 0, 0, b); rbox(0.3, 0.032, 0.12, 0.006, '#cfe9c8', 0, 0, 0, b); b.position.set(Math.sin(i * 2.1) * 0.012, 0.016 + i * 0.032, Math.cos(i * 1.3) * 0.01); b.rotation.y = Math.sin(i * 1.7) * 0.1; g.add(b); g.userData.items.push(b); }
    reg('stack', g);
  }
  { // small onigiri
    const g = G(); sph(0.08, '#ffffff', 0, 0, 0, g, 1, 0.95, 0.6); rbox(0.07, 0.06, 0.1, 0.01, '#1f2a24', 0, -0.05, 0, g); reg('rice1', g); }
  { // birthday cake
    const g = G(); cyl(0.22, 0.22, 0.16, '#fff4ea', 0, 0.08, 0, g); cyl(0.225, 0.225, 0.04, '#ff9ec4', 0, 0.17, 0, g); g.userData.fl = [];
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; cyl(0.012, 0.012, 0.1, i % 2 ? '#35d0ff' : '#ffd23a', Math.cos(a) * 0.13, 0.24, Math.sin(a) * 0.13, g); g.userData.fl.push(sph(0.02, basic('#ffb03a'), Math.cos(a) * 0.13, 0.305, Math.sin(a) * 0.13, g, 1, 1.5, 1)); }
    reg('cake', g);
  }
  { // grown-up mustache (attached to the hero's head in the "age" beat)
    const g = G(); for (const sx of [-1, 1]) { const m = caps(0.03, 0.09, '#3b2a20', sx * 0.06, 0, 0, g); m.rotation.z = Math.PI / 2 + sx * 0.25; } reg('stache', g); }
  // hero2 can be "frozen": stop blinking and breathing while u.frozen is set (cleared on reset each frame)
  const u = hero2.userData, r0 = u.reset, t0 = u.tick;
  u.reset = () => { u.frozen = false; r0(); }; u.tick = (t) => t0(u.frozen ? 0 : t);
}
function holdPhone(s, side = 'L', p = V(-0.12, 0.98, 0.45), who = s.hero, tilt = -0.7) {
  const ph = s.P.phone, sg = side === 'R' ? 1 : -1; ph.visible = true; ph.position.copy(p); ph.rotation.set(tilt, 0, 0);
  who.userData.reach(side, p.clone().add(V(0.06 * sg, -0.07, -0.05)));
}
const fill = (s, v) => { s.P.phone.userData.fill.scale.y = Math.max(0.02, v); };
const pigClock = (s, t) => { const p = s.P.piggy.userData; p.mh.rotation.z = -t * 6; p.hh.rotation.z = -t * 0.5; };
const pend = (s, t, stop = 99) => { const c = s.P.pclock.userData, tt = Math.min(t, stop); c.pend.rotation.z = Math.sin(tt * 3.2) * 0.3; c.mh.rotation.z = -tt * 0.4; c.hh.rotation.z = -1.2; };
// hero2 frozen mid-jump with a ball over her head (the cold-open picture). f: 0..1 progress before the freeze
function jumper(s, f = 1, x = 0.74) {
  const h2 = s.hero2.userData, b = Math.sin(f * Math.PI * 0.5);
  s.hero2.visible = true; s.hero2.position.set(x, 0.22 * b, -0.15); s.hero2.rotation.y = -0.35;
  h2.arm('L', 2.5, 0.35, 0.35); h2.arm('R', 2.5, 0.35, 0.35); h2.body.rotation.x = -0.08;
  h2.face({ lid: 0, brow: 0.2, look: [-0.2, 0.7], mouth: 'o', open: 1.2 }); h2.head.rotation.x = -0.2;
  s.P.fball.visible = true; s.P.fball.position.set(x - 0.08, 2.05 + 0.45 * b, -0.05);
}
const freeze = (s) => { s.hero2.userData.frozen = true; };

const plan = [
  // 0) cold open (flash-forward of "alone"): tap -> the whole room freezes, then he pokes the frozen friend's cheek and grins
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: FRZ, hero2: true, show: ['phone', 'pclock', 'rings'],
    cam: { p0: [0.05, 1.35, 5.1], p1: [-0.05, 1.55, 2.5], l0: [0.08, 1.2, 0], l1: [-0.02, 1.5, 0.15], hold: 1.7, dur: 2.5 },
    shake: [[0.3, 0.07, 0.6]], lines: [[0.3, 0.9]],
    sfx: [[0.28, 'text_touch', -10], [0.3, 'vanish_warp', -8], [0.32, 'impact_don', -9], [1.25, 'comic_boyon', -10], [1.7, 'whoosh_slide', -13], [2.5, 'text_tin', -11]],
    stamps: [{ t: 0.3, text: 'ピタッ!!', x: 330, y: 1110, rot: -8, color: YEL, size: 128, dur: 1.0 },
      { t: 1.25, text: 'ぷにっ', x: 760, y: 700, rot: 10, color: '#ffffff', size: 76, dur: 0.6 },
      { t: 2.5, text: 'ムフッ', x: 740, y: 1140, rot: 8, color: '#ffffff', size: 80, dur: 0.6 }],
    act(lt, s) {
      const h = s.hero.userData, P = s.P, fz = lt >= 0.3, walk = ease(k(lt, 0.55, 1.05)), turn = ease(k(lt, 1.7, 2.2));
      pend(s, lt + 1, 1.3); jumper(s, fz ? 0.8 : lt / 0.3 * 0.8); if (fz) freeze(s);
      s.hero.position.set(lerp(-0.6, -0.12, walk), 0, lerp(0.25, 0.3, walk)); s.hero.rotation.y = lerp(0.35, 0.7, walk) * (1 - turn);
      if (lt < 0.55) { holdPhone(s, 'L', V(-0.62, 1.0, 0.5)); h.reach('R', V(-0.55, 1.03, 0.52)); h.face({ lid: 0.2, look: [0.4, -0.4], mouth: 'smile' }); s.hero.updateMatrixWorld(true); rings(P.rings, P.phone.position, lt - 0.3, { n: 4, speed: 4.5, life: 0.7, col: CY }); }
      else {
        P.phone.visible = false;
        if (lt < 1.75) { const hp = headPos(s.hero2); h.reach('R', hp.clone().add(V(-0.33, -0.1, 0.25))); h.face({ lid: 0.25, brow: 0.3, look: [0.8, 0.3], mouth: 'smile' }); h.head.rotation.y = 0.2; }
        else { h.arm('R', 0.5, 0.2, 1.6); h.hand('R', 'choki'); h.face({ lid: lt > 2.5 ? 0.45 : 0.3, brow: 0.5, look: [0, 0], mouth: lt > 2.5 && lt < 2.85 ? 'o' : 'smile', open: 0.5 }); h.head.rotation.z = 0.1 * turn; }
        h.arm('L', 0.05, 0.15, 0.2);
      }
    } },
  // 1) hook: the phone drops a time coin into the piggy bank
  { sc: 'st', say: ['hook'], pal: HOOK, show: ['phone', 'piggy', 'coin'],
    cam: { p0: [0.1, 1.45, 4.3], p1: [0.1, 1.43, 3.9], l0: [0.1, 1.3, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.35, 'end_tirin', -11], [1.6, 'text_pa', -11]],
    tags: [{ t: 1.6, text: '見た時間 → 貯金', x: 520, y: 640, h: 84, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData, P = s.P, d = k(lt, 0.7, 1.35);
      s.hero.position.set(-0.35, 0, 0.1); s.hero.rotation.y = 0.25;
      holdPhone(s, 'L', V(-0.45, 1.05, 0.5)); fill(s, 0.4 + 0.5 * k(lt, 0, 1.3)); h.arm('R', 0.2, 0.2, 0.6);
      P.piggy.position.set(0.45, 0.9, 0.1); P.piggy.rotation.y = -0.5; P.piggy.scale.setScalar(1 + 0.15 * Math.sin(k(lt, 1.35, 1.7) * Math.PI)); pigClock(s, lt);
      P.coin.visible = d < 1; P.coin.position.set(lerp(-0.4, 0.44, d), 1.1 + Math.sin(d * Math.PI) * 0.45 + d * 0.3, lerp(0.5, 0.1, d)); P.coin.rotation.set(0, d * 9, 0);
      h.face(lt > 1.35 ? { lid: 0.1, brow: 0.3, look: [0.8, -0.2], mouth: 'o', open: 0.8 } : { lid: 0.2, look: [-0.3, -0.4], mouth: 'smile' });
    } },
  // 2) the rule: withdraw later, the world stops meanwhile
  { sc: 'st', say: ['rule'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], hero2: true, show: ['piggy', 'pclock', 'fball', 'rings'], hud: ['時間貯金', '引き出し可'],
    cam: { p0: [0.1, 1.42, 4.8], p1: [0.1, 1.42, 4.6], l0: [0.1, 1.25, 0] },
    sfx: [[0.5, 'text_pa', -11], [1.85, 'vanish_hyun', -11]],
    cards(lt) { return [{ t: 0.5, text: '見た時間 ＝ [あとで使える]', y: 470, size: 58, border: CY }]; },
    tags(lt) { if (lt < 2.1) return []; return [{ t: 2.1, text: 'まわりは停止', x: 700, y: 600, h: 66, bg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, P = s.P, fz = lt > 1.9;
      s.P.pclock.position.set(-0.05, 0, -1.6); pend(s, lt, 1.9);
      s.hero.position.set(-0.6, 0, 0.15); s.hero.rotation.y = 0.3;
      P.piggy.position.set(-0.15, 0, 0.75); P.piggy.rotation.y = 0.4; pigClock(s, fz ? 1.9 : lt);
      jumper(s, fz ? 0.8 : (lt * 0.7) % 0.8); if (fz) freeze(s);
      if (lt > 1.6 && lt < 2.5) { h.reach('R', V(-0.25, 0.6, 0.65)); h.body.rotation.x = 0.35; s.hero.updateMatrixWorld(true); rings(P.rings, V(-0.15, 0.6, 0.75), lt - 1.85, { n: 3, speed: 3.5, life: 0.7, col: CY }); }
      else h.arm('R', 0.1, 0.2, 0.3);
      h.arm('L', 0.05, 0.15, 0.2);
      h.face(fz ? { lid: 0.2, brow: 0.3, look: [0.8, 0.3], mouth: 'smile' } : { lid: 0.15, look: [-0.2, -0.6], mouth: 'smile' });
    } },
  // 3) 165 minutes a day
  { sc: 'st', say: ['day'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['phone', 'clock'], hud: ['時間貯金', '1日165分'],
    cam: { p0: [0.05, 1.42, 4.3], p1: [0.05, 1.4, 4.1], l0: [0.05, 1.3, 0] },
    sfx: [[0.3, 'comic_pico', -15], [1.5, 'text_pa', -10]],
    cards(lt) { const n = Math.round(165 * ease(k(lt, 0.5, 1.8))); return lt > 0.5 ? [{ t: 0.5, text: `1日 [${n}分]`, y: 470, size: 78, border: CY }] : []; },
    note: '博報堂「メディア定点調査2025」（東京・15〜69歳）',
    act(lt, s) {
      const h = s.hero.userData, C = s.P.clock.userData;
      s.P.clock.position.set(0.7, 1.75, -1.2); C.mh.rotation.z = -lt * 8; C.hh.rotation.z = -lt * 0.7;
      s.hero.position.set(-0.25, 0, 0.1); s.hero.rotation.y = 0.15;
      holdPhone(s, 'L', V(-0.27, 0.95, 0.5)); h.reach('R', V(-0.2, 0.92, 0.52)); fill(s, 0.3 + 0.7 * k(lt, 0, 2.2));
      h.head.rotation.x = 0.25; h.face({ lid: 0.35, look: [0, -0.8], mouth: 'smile' });
    } },
  // 4) a week: 19 hours (the piggy swells day by day)
  { sc: 'st', say: ['week'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['piggy'], hud: ['時間貯金', '1週間19時間'],
    cam: { p0: [0.1, 1.4, 4.5], p1: [0.1, 1.38, 4.3], l0: [0.1, 1.15, 0] },
    sfx: [0, 1, 2, 3, 4, 5, 6].map(i => [0.3 + i * 0.22, 'comic_pico', -15]).concat([[2.0, 'text_pa', -10]]),
    tags(lt) { return ['月', '火', '水', '木', '金', '土', '日'].map((d, i) => ({ t: 0.3 + i * 0.22, text: d, x: 150 + i * 120, y: 570, h: 60, bg: '#ffffff' })).filter(o => lt > o.t); },
    cards: [{ t: 2.0, text: '[19時間] ≒ ほぼ丸1日', y: 470, size: 62, border: YEL }],
    act(lt, s) {
      const h = s.hero.userData, P = s.P, n = clamp(Math.floor((lt - 0.3) / 0.22) + 1, 0, 7);
      s.hero.position.set(-0.45, 0, 0.1); s.hero.rotation.y = 0.35;
      P.piggy.position.set(0.45, 0, 0.1); P.piggy.rotation.y = -0.4; P.piggy.scale.setScalar(1 + n * 0.13); pigClock(s, lt);
      h.reach('R', V(0.12, 0.75 + n * 0.035, 0.35)); h.arm('L', 0.3, 0.6, 1.2);
      h.face(n >= 7 ? { lid: 0, browY: 1, look: [0.8, -0.2], mouth: 'o', open: 0.8 } : { lid: 0.2, look: [0.8, -0.3], mouth: 'smile' });
    } },
  // 5) a year: 42 days off
  { sc: 'st', say: ['year'], pal: ['#8fd3ff', '#eef6ff', '#ffffff'], show: ['suitcase', 'cal'], hud: ['時間貯金', '1年42日'],
    cam: { p0: [0, 1.45, 4.6], p1: [0, 1.43, 4.3], l0: [0, 1.3, 0] },
    sfx: [[0.2, 'comic_jajean', -12], [1.6, 'text_pa', -10]],
    tags(lt) { return lt > this.lt.year + 1.6 ? [{ t: this.lt.year + 1.6, text: '42日 ＝ 6週間', x: 520, y: 470, h: 96, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData, P = s.P, j = Math.abs(Math.sin(lt * 4.5)) * 0.06 * k(lt, 0.2, 0.5);
      P.cal.position.set(-0.6, 1.8, -1.6);
      s.hero.position.set(0.05, j, 0.15); h.shades(true);
      P.suitcase.position.set(0.48, 0, 0.25); P.suitcase.rotation.y = -0.4;
      h.reach('R', V(0.42, 0.62, 0.3)); h.arm('L', 2.6, 0.3, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.1, look: [0, 0], mouth: 'o', open: 1.2 }); h.head.rotation.z = Math.sin(lt * 4.5) * 0.06;
    } },
  // 6) sleep in: 125 nights
  { sc: 'st', say: ['sleep'], pal: ['#3f4f9a', '#cfd6f5', '#ffd23a'], dim: 0.85, show: ['bed'], hud: ['時間貯金', '寝だめ125晩'],
    cam: { p0: [-0.1, 1.7, 3.9], p1: [-0.1, 1.65, 3.7], l0: [-0.1, 0.85, 0] },
    sfx: [[0.2, 'comic_pico', -15], [1.0, 'text_pa', -10]],
    stamps: [{ t: 0.25, text: 'Zzz', x: 330, y: 820, rot: -8, color: '#ffffff', size: 92, dur: 2.2 }],
    cards(lt) { const n = Math.round(125 * ease(k(lt, 0.9, 2.2))); return lt > 0.9 ? [{ t: 0.9, text: `8時間睡眠 [${n}晩]`, y: 480, size: 68, border: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.P.bed.position.set(0, 0, 0);
      s.hero.rotation.z = Math.PI / 2; s.hero.scale.setScalar(0.8); s.hero.position.set(0.62, 0.62, 0.05);
      h.arm('L', 0, 0.12, 0); h.arm('R', 0, 0.12, 0); h.face({ lid: 1, look: [0, 0], mouth: 'smile' }); h.body.position.y = Math.sin(lt * 2) * 0.01;
    } },
  // 7) money: 1,004 h x minimum wage
  { sc: 'st', say: ['money'], pal: ['#8fd9a8', '#dff3e4', '#ffffff'], show: ['stack'], hud: ['時間貯金', '112万円分'], hudColor: YEL,
    cam: { p0: [0.05, 1.4, 4.4], p1: [0.05, 1.38, 4.2], l0: [0.05, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.6, 'end_kira', -11]],
    cards: [{ t: 0.3, text: '1,004時間 × [1,121円]', y: 470, size: 60, border: CY, sub: '最低賃金（全国平均）で時給換算（試算）' }],
    tags(lt) { if (lt < 1.6) return []; return [{ t: 1.6, text: '約112万円', x: 690, y: 660, h: 96, bg: YEL }]; },
    note: '厚生労働省 2025年度 最低賃金 全国加重平均',
    act(lt, s) {
      const h = s.hero.userData, P = s.P, n = Math.floor(clamp(k(lt, 0.4, 1.5) * 12, 0, 12));
      P.stack.position.set(0.45, 0.0, 0.2); P.stack.userData.items.forEach((b, i) => { b.visible = i < n; });
      s.hero.position.set(-0.4, 0, 0.1); s.hero.rotation.y = 0.3;
      h.reach('R', V(0.25, 0.1 + n * 0.032 + 0.05, 0.25)); h.arm('L', 0.4, 0.5, 1.5);
      h.face(n >= 12 ? { lid: 0, browY: 1, look: [0.8, -0.3], mouth: 'o', open: 1 } : { lid: 0.2, look: [0.8, -0.4], mouth: 'smile' });
    } },
  // 8) a lifetime: 7 and a half years
  { sc: 'st', say: ['life'], pal: ['#ffb36b', '#fdebd8', '#3f6fd8'], show: ['piggy'], hud: ['時間貯金', '人生で7年半'], hudColor: YEL,
    cam: { p0: [0, 1.5, 5.0], p1: [0, 1.48, 4.7], l0: [0, 1.3, 0] }, shake: [[1.2, 0.05, 0.5]],
    sfx: [[0.3, 'comic_boyon', -12], [1.2, 'impact_don', -10], [1.3, 'text_pa', -10]],
    cards: [{ t: 1.3, text: '15〜81歳 → [7年半]', y: 470, size: 66, border: YEL }],
    note: '平均寿命 男性81.09年（厚労省 令和6年）で試算',
    act(lt, s) {
      const h = s.hero.userData, P = s.P, g = ease(k(lt, 0.2, 1.2));
      P.piggy.position.set(0.25, 0, -0.55); P.piggy.rotation.y = -0.3; P.piggy.scale.setScalar(1 + g * 2.1); pigClock(s, lt);
      s.hero.position.set(-0.55, 0, 0.45); s.hero.rotation.y = 0.4;
      h.arm('L', 2.5, 0.4, 0.3); h.arm('R', 2.5, 0.4, 0.3); h.hand('L', 'pa'); h.hand('R', 'pa');
      h.face(g > 0.9 ? { lid: 0, brow: 0.4, browY: 1, look: [0, 0.2], mouth: 'o', open: 1.3 } : { lid: 0.1, look: [0.6, 0.4], mouth: 'smile' });
    } },
  // 9) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['時間貯金', '人生で7年半'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.5], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 10) alone: the cold-open picture again, but this time nobody answers
  { sc: 'st', say: ['alone'], pal: FRZ, hero2: true, show: ['pclock', 'cal'], hud: ['引き出し中', 'まわり停止'], hudColor: RED,
    cam: { p0: [0.05, 1.4, 4.9], p1: [0.05, 1.4, 4.6], l0: [0.08, 1.25, 0] },
    sfx: [[0.6, 'comic_boyon', -12], [1.3, 'comic_boyon', -13], [2.2, 'comic_stupid', -12]],
    stamps: [{ t: 0.6, text: 'ぷにっ', x: 760, y: 700, rot: 10, color: '#ffffff', size: 70, dur: 0.5 }, { t: 1.3, text: 'ぷにっ', x: 760, y: 700, rot: -6, color: '#ffffff', size: 70, dur: 0.5 }],
    tags(lt) { if (lt < 2.1) return []; const p = scr(S, headPos(S.hero2), 20, -260); return [{ t: 2.1, text: '…返事なし', x: p[0], y: p[1], h: 66, bg: '#ffffff' }]; },
    note: '42日間、あなた以外の時間は止まったまま（設定）',
    act(lt, s) {
      const h = s.hero.userData, poke = (lt > 0.5 && lt < 0.8) || (lt > 1.2 && lt < 1.5);
      pend(s, 0.4, 0); s.P.cal.position.set(-0.9, 1.85, -1.6);
      jumper(s, 0.8, 0.86); freeze(s);
      s.hero.position.set(-0.22, 0, 0.3); s.hero.rotation.y = 0.55;
      const hp = headPos(s.hero2);
      if (lt < 2.0) { h.reach('R', hp.clone().add(V(poke ? -0.33 : -0.45, -0.1, 0.25))); h.face({ lid: 0.2, brow: -0.2, look: [0.8, 0.3], mouth: 'smile' }); }
      else { h.arm('R', 0.1, 0.15, 0.3); h.face({ lid: 0.35, brow: -0.9, look: [0.2, -0.3], mouth: 'flat' }); h.head.rotation.x = 0.15; s.hero.rotation.y = 0.25; }
      h.arm('L', 0.05, 0.15, 0.2);
    } },
  // 11) shop: the clerk is frozen too
  { sc: 'st', say: ['shop'], pal: ['#ffd0a6', '#fff3e6', '#2f8f5b'], hero2: true, show: ['counter', 'rice1'], hud: ['引き出し中', 'まわり停止'], hudColor: RED,
    cam: { p0: [0, 1.5, 4.8], p1: [0, 1.48, 4.5], l0: [0, 1.2, -0.3] },
    sfx: [[0.5, 'comic_pico', -13], [1.4, 'comic_pico', -13], [2.2, 'comic_stupid', -12]],
    tags(lt) { if (lt < 1.8) return []; const p = scr(S, headPos(S.hero2), 0, -250); return [{ t: 1.8, text: 'レジが動かない', x: p[0], y: p[1], h: 66, bg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, P = s.P;
      P.counter.position.set(0.55, 0, -0.75); P.counter.scale.set(0.5, 1, 1);
      s.hero2.position.set(0.6, 0, -1.35); h2.body.rotation.x = 0.35; h2.arm('L', 0.6, 0.2, 0.4); h2.arm('R', 0.6, 0.2, 0.4); h2.face({ lid: 0.3, look: [0, -0.5], mouth: 'smile' }); freeze(s);
      s.hero.position.set(-0.5, 0, 0.15); s.hero.rotation.y = 0.45;
      const off = Math.sin(lt * 6) * 0.03 * k(lt, 0.4, 0.6);
      P.rice1.position.set(0.0 + off, 1.12, -0.05); P.rice1.rotation.y = -0.4; h.reach('R', V(-0.03 + off, 1.05, -0.02));
      h.arm('L', 0.05, 0.15, 0.2);
      h.face(lt > 1.6 ? { lid: 0.3, brow: -0.8, look: [0.8, 0.2], mouth: 'o', open: 0.4 } : { lid: 0.15, look: [0.8, 0.2], mouth: 'smile' });
    } },
  // 12) no internet: the phone is useless
  { sc: 'st', say: ['net'], pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['phone'], hud: ['引き出し中', 'ネット停止'], hudColor: RED,
    cam: { p0: [0, 1.45, 4.0], p1: [0, 1.43, 3.7], l0: [0, 1.32, 0] },
    sfx: [[0.3, 'phone_vibe', -14], [1.0, 'comic_shock2', -11]],
    stamps: [{ t: 1.0, text: 'え!?', x: 300, y: 1110, rot: -8, color: YEL, size: 104, dur: 0.9 }],
    tags(lt) { if (lt < 0.6) return []; return [{ t: 0.6, text: '圏外', x: 790, y: 1130, h: 80, bg: RED, fg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, sh = lt > 1.0 ? Math.sin(lt * 30) * 0.04 : 0;
      s.hero.position.set(0, 0, 0.1);
      holdPhone(s, 'L', V(-0.12 + sh, 0.86, 0.5), s.hero, -0.3); h.reach('R', V(0.1 + sh, 0.83, 0.52)); fill(s, 0.02);
      h.face(lt > 1.0 ? { lid: 0, brow: -1, browY: 1, look: [0, -0.4], mouth: 'o', open: 1 } : { lid: 0.2, look: [0, -0.6], mouth: 'smile' });
    } },
  // 13) and to save it, you must stare at the phone every day
  { sc: 'st', say: ['save'], pal: ['#4a5568', '#cfd5df', '#ffd23a'], dim: 0.9, hero2: true, show: ['phone', 'clock', 'ball'], hud: ['貯めるには', '毎日2時間45分'], hudColor: RED,
    cam: { p0: [0.1, 1.42, 4.8], p1: [0.1, 1.4, 4.5], l0: [0.1, 1.2, 0] },
    sfx: [[0.4, 'text_pa', -11], [2.4, 'comic_fall', -13]],
    cards: [{ t: 0.4, text: '毎日 [2時間45分]', y: 470, size: 70, border: RED }],
    tags(lt) { if (lt < 1.4) return []; const a = scr(S, headPos(S.hero), 0, -240), b = scr(S, headPos(S.hero2), 0, -240); return [{ t: 1.4, text: 'あなた', x: a[0], y: a[1], h: 64, bg: '#ffffff' }, { t: 1.6, text: '友だち', x: b[0], y: b[1], h: 64, bg: YEL }]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, C = s.P.clock.userData;
      s.P.clock.position.set(-1.0, 1.55, -1.4); C.mh.rotation.z = -lt * 10; C.hh.rotation.z = -lt;
      s.hero.position.set(-0.45, 0, 0.1); s.hero.rotation.y = 0.15; holdPhone(s, 'L', V(-0.5, 0.95, 0.5)); h.reach('R', V(-0.42, 0.92, 0.52)); fill(s, (lt * 0.4) % 1);
      h.head.rotation.x = 0.3; h.body.rotation.x = 0.15; h.face({ lid: 0.55, brow: -0.4, look: [0, -0.8], mouth: 'flat' });
      const b = Math.abs(Math.sin(lt * 4)); s.hero2.position.set(0.65, b * 0.12, -0.2); s.hero2.rotation.y = -0.3;
      s.P.ball.position.set(0.62, 1.6 + b * 0.5, 0.15); h2.arm('L', 2.3, 0.4, 0.4); h2.arm('R', 2.3, 0.4, 0.4); h2.face({ lid: 0.1, look: [0, 0.6], mouth: 'o', open: 1 });
    } },
  // 14) you still age: 7.5 years ahead of your friends
  { sc: 'st', say: ['age'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], hero2: true, show: ['cake', 'stache'], hud: ['あなただけ', '+7歳半'], hudColor: RED,
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.43, 4.5], l0: [0.05, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.6, 'comic_boyon', -10], [3.6, 'comic_stupid', -12]],
    stamps: [{ t: 2.6, text: 'ボンッ', x: 300, y: 1050, rot: -8, color: '#ffffff', size: 90, dur: 0.8 }],
    tags(lt) { if (lt < 2.9) return []; const a = scr(S, headPos(S.hero), 0, -250), b = scr(S, headPos(S.hero2), 0, -250); return [{ t: 2.9, text: 'あなた +7歳半', x: a[0], y: a[1], h: 70, bg: RED, fg: '#ffffff' }, { t: 3.1, text: '友だち', x: b[0], y: b[1], h: 64, bg: '#ffffff' }]; },
    note: '引き出した時間も、体の時間は進む（設定）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, P = s.P, grow = lt > 2.6, g = ease(k(lt, 2.6, 2.9));
      P.cake.position.set(0.02, 0.9, 0.35); P.cake.userData.fl.forEach((f, i) => f.scale.set(0.02, 0.03 + Math.abs(Math.sin(lt * 9 + i)) * 0.006, 0.02));
      s.hero.position.set(-0.62, 0, 0.1); s.hero.rotation.y = 0.3; s.hero.scale.setScalar(1 + 0.12 * g);
      s.hero2.position.set(0.66, 0, 0.0); s.hero2.rotation.y = -0.3;
      P.stache.visible = grow; if (grow) { h.head.add(P.stache); P.stache.position.set(0, -0.12, 0.41); P.stache.rotation.set(0, 0, 0); P.stache.scale.setScalar(g); }
      if (grow) { h.face({ lid: 0.3, brow: -0.8, look: [0.6, 0], mouth: 'flat' }); h.arm('L', 0.4, 0.3, 1.5); h.arm('R', 0.05, 0.15, 0.2); h2.face({ lid: 0, browY: 1, look: [-0.8, 0], mouth: 'o', open: 1.1 }); h2.arm('R', 0.5, 0.3, 1.8); }
      else { h.face({ lid: 0.15, look: [0.6, -0.4], mouth: 'smile' }); h.arm('R', 0.6, 0.3, 0.6); h2.face({ lid: 0.15, look: [-0.6, -0.4], mouth: 'smile' }); h2.arm('L', 0.6, 0.3, 0.6); }
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: HOOK, show: ['phone', 'piggy'],
    cam: { p0: [0, 1.5, 4.3], p1: [0, 1.5, 4.0], l0: [0, 1.36, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.2, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'したい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'いらない', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData, P = s.P;
      P.piggy.position.set(-0.45, 0.9, 0.0); P.piggy.rotation.y = 0.5; pigClock(s, lt); s.P.counter.visible = true; s.P.counter.position.set(-0.6, 0, -0.1); s.P.counter.scale.set(0.45, 1, 1);
      s.hero.position.set(0.35, 0, 0.1); holdPhone(s, 'R', V(0.55, 1.1, 0.45), s.hero, -0.2); h.arm('L', 0.3, 0.4, 0.9); fill(s, 0.8);
      h.face({ lid: 0.3, brow: 0.5, look: [-0.6, 0], mouth: 'smile' }); h.head.rotation.set(0, -0.2, Math.sin(lt * 1.6) * 0.08);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもスマホを見た時間を', '[貯金]できたら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['時間貯金', '1日165分'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
