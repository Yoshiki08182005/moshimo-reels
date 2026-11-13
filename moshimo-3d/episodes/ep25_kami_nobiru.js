// ep25_kami_nobiru (pop スタイル / アームA 原因を拡大): もしも髪の伸びる速さがどんどん速くなったら？
// 構成の型は sp_geppu2x（冒頭フック→タイトル→小ネタ連打→落とし穴→問いかけ）。台本・数字・ネタは自作。
// 前提（一般的な目安）: 髪は1日約0.3mm（≒1か月1cm）、頭髪は約10万本、太さ0.08mm、密度1.3g/cm³、髪≒たんぱく質とみなす。
//   ×10: 1か月9cm / ×100: 1日3cm・1週間21cm（前髪→あご）/ ×1000: 1日30cm / ×1万: 1分2.08mm・8時間で1.0m
//   ×10万: 1日30m、10万本で3,000km ≒ 日本列島の長さ（約3,000km）
//   髪の重さ: 10万本×0.3mm×断面5.03e-9m²×1300kg/m³ = 0.196g/日 → ×1000で196g/日（成人男性の推奨量65g=厚労省 食事摂取基準2025 の約3.0倍）
//   ×10万で19.6kg/日 → 肉100gにたんぱく質約20gとして ステーキ約98kg / 散髪1回4,000円×365日 = 146万円
import { run, THREE, V, clamp, ease, lerp, rng } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep25_kami_nobiru.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)', HAIR = '#3b2a20';
let S;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 780), y + dy]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const PAL0 = ['#7ec8ff', '#eef7ff', '#ff8fb8'];

// ---------- hair that grows: userData.set({ afro: R (0 = off), long: L metres, bangs: b metres, trail: 0..1 }) ----------
function makeHair() {
  const g = G(), hm = M(HAIR, 0.85);
  const afro = G(); afro.position.set(0, 0.1, -0.06); g.add(afro);
  const N = 70;
  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * 2.39996, d = V(Math.cos(th) * r, y, Math.sin(th) * r);
    if (d.z > 0.05 || d.y < -0.55) continue;
    sph(0.36, hm, d.x, d.y, d.z, afro);
  }
  sph(0.7, hm, 0, 0.05, -0.4, afro);
  // long hair down the back (unit height, scaled)
  const back = G(); g.add(back); const bm = rbox(0.8, 1, 0.18, 0.08, hm, 0, -0.5, 0, back); back.position.set(0, 0.2, -0.3);
  const pool = sph(1, hm, 0, 0, 0, g, 1, 0.07, 1);
  const trail = rbox(1, 0.07, 0.7, 0.03, hm, 0, 0, 0, g);
  const bangs = [-0.31, 0, 0.31].map(x => { const b = G(); b.position.set(x, 0.32, x ? 0.33 : 0.41); g.add(b); caps(0.05, 1, hm, 0, -0.5, 0, b); return b; });
  g.userData.set = (p = {}) => {
    const R = p.afro ?? 0; afro.visible = R > 0; if (R > 0) { afro.scale.setScalar(R); afro.position.set(0, 0.1, -0.35 * R); }
    const L = p.long ?? 0, top = 1.64, hl = Math.min(L, top); back.visible = L > 0.02; back.scale.set(1 + Math.min(L, 3) * 0.08, Math.max(hl, 0.02), 1);
    pool.visible = L > top; const pr = Math.min(0.25 + Math.sqrt(Math.max(0, L - top)) * 0.45, 1.5);
    pool.position.set(0, -1.41, -0.3 - pr * 0.7); pool.scale.set(pr, 0.07, pr);
    const tr = p.trail ?? 0; trail.visible = tr > 0; trail.scale.set(tr * 9, 1, 1); trail.position.set(tr * 4.5, -1.41, -0.5);
    const b = p.bangs ?? 0; bangs.forEach(o => { o.visible = b > 0.02; o.scale.set(1, Math.max(b, 0.02), 1); });
  };
  g.userData.set();
  return g;
}

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  reg('hair', makeHair());
  { const c = G(); rbox(0.24, 0.06, 0.018, 0.012, '#ff6b9a', 0, 0.03, 0, c); for (let i = 0; i < 9; i++) rbox(0.012, 0.07, 0.012, 0.004, '#ff6b9a', -0.1 + i * 0.025, -0.03, 0, c); reg('comb', c); }
  { const s = G(); s.userData.blades = [1, -1].map(sg => { const b = G(); s.add(b); rbox(0.2, 0.026, 0.01, 0.008, M('#d9dde3', 0.25), 0.1, 0, 0, b);
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 20), M('#ff5a4f')); h.position.set(-0.05, 0, 0); b.add(h); return b; }); reg('scissors', s); }
  { const st = G(); st.userData.items = [];
    for (let i = 0; i < 40; i++) { const p = G(); cyl(0.17, 0.14, 0.02, '#ffffff', 0, 0.01, 0, p); sph(0.12, M('#8a4a2c', 0.7), 0, 0.035, 0, p, 1.15, 0.22, 0.85); sph(0.03, '#5fae6b', 0.08, 0.05, 0.05, p);
      p.position.set(Math.sin(i * 2.1) * 0.015, i * 0.055, Math.cos(i * 1.3) * 0.015); p.rotation.y = i * 0.7; st.add(p); st.userData.items.push(p); }
    st.userData.n = (n) => st.userData.items.forEach((p, i) => p.visible = i < n); reg('steaks', st); }
  { const s = G(); sph(0.12, M('#8a4a2c', 0.7), 0, 0, 0, s, 1.1, 0.25, 0.8); const f = cyl(0.008, 0.008, 0.22, '#c9ced6', 0.0, 0.06, 0.0, s); f.rotation.z = 0.3; reg('steak', s); }
  { const b = G(); b.userData.items = []; for (let i = 0; i < 10; i++) { const m = G(); rbox(0.3, 0.14, 0.008, 0.01, '#5fae6b', 0, 0, 0, m); rbox(0.26, 0.1, 0.004, 0.008, '#cfe9c8', 0, 0, 0.005, m); b.add(m); b.userData.items.push(m); } reg('bills', b); }
  { const c = G(); c.userData.items = []; const r = rng(3); for (let i = 0; i < 24; i++) { const m = caps(0.012, 0.09, M(HAIR, 0.85), 0, 0, 0, c); m.userData.v = V(r() - 0.5, r() * 0.8, r() * 0.5); c.userData.items.push(m); } reg('bits', c); }
}
const clock = (s, h) => { const c = s.P.clock; c.visible = true; c.position.set(-0.95, 2.05, -2.3); c.userData.hh.rotation.z = -h / 12 * Math.PI * 2; c.userData.mh.rotation.z = -h * Math.PI * 2; };
const hairOn = (s, who, p) => { const hr = s.P.hair; hr.visible = true; who.userData.head.add(hr); hr.position.set(0, 0, 0); hr.rotation.set(0, 0, 0); hr.userData.set(p); };
const combAt = (s, side, p, rot = 0) => { const c = s.P.comb; c.visible = true; c.position.copy(p); c.rotation.set(0, 0, rot); s.hero.userData.reach(side, p.clone().add(V(0, -0.03, 0))); };
const snip = (s, p, lt) => { const sc = s.P.scissors; sc.visible = true; sc.position.copy(p); sc.rotation.set(0, 0, 0.5); const o = 0.35 * Math.abs(Math.sin(lt * 14)); sc.userData.blades[0].rotation.z = o; sc.userData.blades[1].rotation.z = -o; };
function bits(s, p, t) { const c = s.P.bits; c.visible = t > 0; c.position.copy(p); c.userData.items.forEach((m, i) => { const u = (t + i * 0.13) % 1.2; m.position.set(m.userData.v.x * u, m.userData.v.y * u - 1.6 * u * u, m.userData.v.z * u); m.rotation.set(u * 5 + i, i, u * 3); }); }
// the cold open / x1mb gag: overnight the hair puffs into a room-sized afro and shoves hero2 away
function poof(lt, s, t0, Rmax) {
  const f = lt - t0, R = f < 0 ? 0.56 : lerp(0.56, Rmax, ease(k(f, 0, 0.22))) * (1 + 0.08 * Math.sin(clamp(f / 0.5) * Math.PI));
  hairOn(s, s.hero, { afro: R }); return f;
}

const plan = [
  // 0) cold open (flash-forward of x1mb): hair explodes into a giant afro, hero2 flies, then push in on a smug face combing it
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: ['#9b8cff', '#f1eeff', '#ffd23a'], hero2: true, show: ['bed'],
    cam: { p0: [0.2, 1.75, 7.6], p1: [0, 1.5, 2.95], l0: [0.2, 1.65, 0], l1: [0, 1.42, 0], hold: 1.6, dur: 2.4 },
    shake: [[0.3, 0.09, 0.7]], lines: [[0.3, 0.95]],
    sfx: [[0.3, 'impact_doon', -8], [0.32, 'whoosh_gust', -9], [0.75, 'comic_fall', -11], [1.6, 'whoosh_slide', -13], [2.5, 'sparkle', -10]],
    stamps: [{ t: 0.3, text: 'ボワッ!!', x: 300, y: 1180, rot: -8, color: YEL, size: 132, dur: 1.1 },
      { t: 2.45, text: 'ファサッ', x: 790, y: 1330, rot: 8, color: YEL, size: 96, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, f = poof(lt, s, 0.3, 2.0), u = Math.max(0, f);
      s.P.bed.position.set(-1.6, 0, -0.9); clock(s, 7 + lt * 0.2);
      s.hero.position.set(0, 0, 0.1);
      s.hero2.position.set(0.75 + u * u * 6 + u * 1.6, Math.sin(clamp(u / 0.8) * Math.PI) * 0.9, 0.2); s.hero2.rotation.set(0, -0.4, -u * 4);
      h2.face(u > 0 ? { lid: 0, brow: -1, browY: 1, mouth: 'o', open: 1.2 } : { lid: 0.2, mouth: 'smile', look: [-0.6, 0] }); h2.arm('L', 0.3, 1.0 * (u > 0), 1); h2.arm('R', 0.3, 1.0 * (u > 0), 1);
      if (lt < 1.6) { h.face(f < 0 ? { lid: 0.85, mouth: 'flat' } : { lid: 0, browY: 1, look: [0.6, 0.2], mouth: 'o', open: 0.8 }); h.arm('L', 0.2, 0.5, 0.4); h.arm('R', 0.2, 0.5, 0.4); }
      else {
        const c = ease(k(lt, 2.0, 2.6)); h.face({ lid: 0.35, brow: 0.45, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.1 * c;
        s.hero.updateMatrixWorld(true); combAt(s, 'R', h.head.localToWorld(V(0.3 + c * 0.05, 0.12 + c * 0.1, 0.3)), 0.6); h.arm('L', 0.05, 0.15, 0.2);
      }
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: PAL0, show: ['comb'],
    cam: { p0: [0.1, 1.5, 4.2], p1: [0.1, 1.48, 3.8], l0: [0.05, 1.4, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.5, 'text_pa', -10]],
    tags: [{ t: 1.6, text: '最後は日本列島級', x: 500, y: 640, h: 84, bg: RED, fg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData; hairOn(s, s.hero, {}); s.hero.updateMatrixWorld(true);
      combAt(s, 'R', h.head.localToWorld(V(0.32, 0.38 + Math.sin(lt * 6) * 0.05, 0.25)), 0.3); h.arm('L', 0.05, 0.15, 0.2);
      h.face({ lid: 0.2, look: [0.4, 0.3], mouth: 'smile' }); h.head.rotation.z = -0.08;
    } },
  // 2) normal: 0.3 mm a day
  { sc: 'st', say: ['base'], pal: ['#ffb36b', '#fbeedd', '#3f6fd8'], show: ['rulerA'], hud: ['髪の速さ', 'ふつう'],
    cam: { p0: [0.15, 1.5, 3.9], p1: [0.15, 1.5, 3.6], l0: [0.1, 1.42, 0] },
    sfx: [[0.6, 'text_pa', -11], [1.4, 'comic_pico', -15]],
    tags(lt) { const p = scr(S, headPos(S.hero), 230, -40); return lt > 0.6 ? [{ t: 0.6, text: '1日 0.3mm', x: p[0], y: p[1], h: 76, bg: CY }] : []; },
    cards: [{ t: 1.4, text: '1か月で 約[1cm]', y: 470, size: 62, border: CY }],
    note: '目安：髪は1日約0.3mm・頭髪は約10万本',
    act(lt, s) {
      const h = s.hero.userData, r = s.P.rulerA; hairOn(s, s.hero, {});
      r.position.set(0.5, 1.75, 0.15); r.rotation.z = 0.1; h.reach('R', V(0.46, 1.5, 0.18)); h.arm('L', 0.05, 0.15, 0.2);
      h.face({ lid: 0.15, look: [0.6, 0.4], mouth: 'flat', brow: 0.2 }); h.head.rotation.y = 0.15;
    } },
  // 3) x10: 9 cm a month, salon every month
  { sc: 'st', say: ['x10'], pre: 0.3, pal: ['#ff7eb6', '#fff0f6', '#ffffff'], hero2: true, hud: ['髪の速さ', '×10'],
    cam: { p0: [0, 1.4, 4.7], p1: [0, 1.38, 4.4], l0: [0, 1.28, 0] },
    sfx: [[0.1, 'comic_boyon', -11], [0.6, 'text_pa', -11], [1.2, 'comic_pico', -15], [1.6, 'comic_pico', -15]],
    tags(lt) { const p = scr(S, headPos(S.hero), -10, -280); return lt > 0.6 ? [{ t: 0.6, text: '毎月 9cm', x: p[0], y: p[1], h: 76, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, L = lerp(0.12, 0.42, ease(k(lt, 0.1, 1.2)));
      s.hero.position.set(-0.4, 0, 0.1); s.hero.rotation.y = 0.15; hairOn(s, s.hero, { long: L });
      s.hero2.position.set(0.62, 0, -0.05); s.hero2.rotation.y = -0.45; s.hero.updateMatrixWorld(true);
      const sp = s.hero.userData.head.localToWorld(V(0.48, 0.15, 0.1)); snip(s, sp, lt); h2.reach('L', sp.clone().add(V(0.08, -0.02, 0)));
      h2.arm('R', 0.05, 0.15, 0.2); h2.face({ lid: 0.3, look: [-0.7, 0.1], mouth: 'smile', brow: 0.3 });
      h.face({ lid: 0.6, look: [0.5, 0.5], mouth: 'flat', brow: -0.5 }); h.arm('L', 0.05, 0.15, 0.2); h.arm('R', 0.05, 0.15, 0.2);
      bits(s, sp.clone().add(V(0, -0.05, 0.1)), lt > 0.8 ? lt - 0.8 : -1);
    } },
  // 4) x100: bangs to the chin in a week
  { sc: 'st', say: ['x100'], pre: 0.3, pal: ['#4fc3a1', '#e8f8f2', '#ffd23a'], hud: ['髪の速さ', '×100'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 3.7], p1: [0.1, 1.48, 3.4], l0: [0.05, 1.42, 0] },
    sfx: [[0.3, 'countdown_tick', -14, 2.0], [2.4, 'comic_surprise', -11]],
    tags(lt) { const d = Math.min(7, Math.floor(k(lt, 0.3, 2.3) * 7) + 1); return [{ text: `${d}日目  前髪 +${(d * 3)}cm`, x: 500, y: 560, h: 72, bg: '#ffffff' }]; },
    stamps: [{ t: 2.4, text: 'フーッ', x: 700, y: 1180, rot: 8, color: '#ffffff', size: 80, dur: 0.9 }],
    act(lt, s) {
      const h = s.hero.userData, b = lerp(0.05, 0.72, ease(k(lt, 0.3, 2.3))); clock(s, 7 + k(lt, 0.3, 2.3) * 168);
      hairOn(s, s.hero, { bangs: b, long: 0.15 + b * 0.3 });
      if (lt > 2.4) { h.face({ lid: 0.3, look: [0, 0.8], mouth: 'o', open: 0.5, brow: -0.6 }); h.head.rotation.x = -0.12; }
      else h.face({ lid: 0.4, look: [0, 0.9], mouth: 'flat', brow: -0.4 });
      h.arm('L', 0.3, 0.5, 1.2); h.arm('R', 0.3, 0.5, 1.2);
    } },
  // 5) x1000: short in the morning, long at night
  { sc: 'st', say: ['x1000'], pre: 0.3, pal: ['#ff9f5a', '#fbe9d0', '#6a4fd8'], hud: ['髪の速さ', '×1000'], hudColor: YEL,
    cam: { p0: [0.25, 1.3, 4.8], p1: [0.25, 1.3, 4.5], l0: [0.15, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.0, 'whoosh_slide', -12], [2.6, 'text_pa', -11]],
    tags(lt) { return lt < 2.0 ? [{ t: 0.3, text: '朝7時  ショート', x: 500, y: 560, h: 72, bg: '#ffffff' }] : [{ t: 2.0, text: '夜10時  ロング', x: 500, y: 560, h: 72, bg: INK, fg: '#ffffff' }, { t: 2.6, text: '1日 30cm', x: 760, y: 700, h: 70, bg: CY }]; },
    act(lt, s) {
      const h = s.hero.userData, u = ease(k(lt, 0.8, 2.6)); clock(s, 7 + u * 15); s.hero.rotation.y = 0.2;
      hairOn(s, s.hero, { long: lerp(0.1, 1.0, u) });
      if (u < 0.5) { h.face({ lid: 0.15, mouth: 'smile', look: [0.4, 0.2] }); h.arm('R', 2.6, 0.3, 0.4); h.arm('L', 0.05, 0.15, 0.2); }
      else { h.face({ lid: 0, browY: 1, mouth: 'o', open: 0.7, look: [-0.8, -0.4] }); h.head.rotation.y = -0.5; h.reach('R', V(0.1, 1.2, -0.35)); h.arm('L', 0.3, 0.6, 1.0); }
    } },
  // 6) x10000: 2 mm a minute, you can watch it
  { sc: 'st', say: ['x1ma'], pre: 0.3, pal: ['#3fb6ff', '#e6f5ff', '#ff6b5a'], hero2: true, show: ['rulerB'], hud: ['髪の速さ', '×1万'], hudColor: RED,
    cam: { p0: [0.05, 1.45, 4.3], p1: [0.05, 1.45, 3.9], l0: [0.05, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.6, 'comic_boyon', -12], [2.6, 'comic_surprise', -12]],
    stamps: [{ t: 1.6, text: 'ニョキニョキ', x: 300, y: 1160, rot: -8, color: YEL, size: 92, dur: 1.6 }],
    tags(lt) { const out = [{ t: 0.3, text: '1分で 2mm', x: 500, y: 560, h: 76, bg: CY }]; if (lt > 2.6) { const p = scr(S, headPos(S.hero2), 0, -250); out.push({ t: 2.6, text: '伸びてる…', x: p[0], y: p[1], h: 66, bg: '#ffffff' }); } return out; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, L = 1.0 + lt * 0.06, bb = 0.08 + lt * 0.035;
      s.hero.position.set(-0.4, 0, 0.1); s.hero.rotation.y = 0.2; hairOn(s, s.hero, { long: L, bangs: bb });
      s.hero2.position.set(0.66, 0, 0); s.hero2.rotation.y = -0.4; const r = s.P.rulerB; r.position.set(0.25, 1.62, 0.25); r.rotation.z = 0.15;
      h2.reach('L', V(0.3, 1.45, 0.25)); h2.arm('R', 0.05, 0.15, 0.2); h2.face({ lid: 0, browY: 1, look: [-0.7, 0.2], mouth: 'o', open: 0.6 });
      h.face({ lid: 0, browY: 1, look: [0, 1], mouth: 'o', open: 0.5 + 0.2 * Math.sin(lt * 3) }); h.arm('L', 0.3, 0.6, 1.0); h.arm('R', 0.3, 0.6, 1.0);
    } },
  // 7) x10000: 8 hours of sleep -> 1 m -> the afro (the cold open, in place)
  { sc: 'st', say: ['x1mb'], pre: 0.6, pal: ['#9b8cff', '#f1eeff', '#ffd23a'], hero2: true, show: ['bed'], hud: ['髪の速さ', '×1万'], hudColor: RED,
    cam: { p0: [0.2, 1.75, 7.4], p1: [0.2, 1.72, 7.0], l0: [0.2, 1.65, 0] }, shake: [[0.3, 0.08, 0.6]], lines: [[0.3, 0.8]],
    sfx: [[0.3, 'impact_doon', -9], [0.32, 'whoosh_gust', -10], [0.75, 'comic_fall', -12], [2.5, 'comic_stupid', -13]],
    stamps: [{ t: 0.3, text: 'ボワッ!!', x: 300, y: 1180, rot: -8, color: YEL, size: 120, dur: 1.0 }],
    tags(lt) { return lt > 0.9 ? [{ t: 0.9, text: '8時間で 1m', x: 500, y: 560, h: 80, bg: CY }] : []; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, f = poof(lt, s, 0.3, 2.0), u = Math.max(0, f);
      s.P.bed.position.set(-1.6, 0, -0.9); clock(s, 7 + lt * 0.05);
      s.hero.position.set(Math.sin(lt * 9) * 0.04 * (lt > 2.2), 0, 0.1); s.hero.rotation.z = Math.sin(lt * 9) * 0.06 * (lt > 2.2);
      s.hero2.position.set(0.75 + Math.min(u, 0.6) * 1.2, 0, 0.2); s.hero2.rotation.set(0, -0.4, -Math.min(u, 0.6) * 0.8);
      h2.face(u > 0 ? { lid: 0, brow: -1, browY: 1, mouth: 'o', open: 1.0 } : { lid: 0.2, mouth: 'smile', look: [-0.6, 0] }); h2.arm('L', 0.3, 0.8, 1); h2.arm('R', 0.3, 0.8, 1);
      h.face(f < 0 ? { lid: 0.85, mouth: 'flat' } : { lid: 0.3, brow: -0.6, look: [0.5, 0], mouth: 'o', open: 0.4 }); h.arm('L', 0.6, 0.9, 0.6); h.arm('R', 0.6, 0.9, 0.6);
    } },
  // 8) x100000: 30 m a day, dragging it around
  { sc: 'st', say: ['x10ma'], pre: 0.3, pal: ['#ff8a65', '#ffe9df', '#2f6bff'], hud: ['髪の速さ', '×10万'], hudColor: RED,
    cam: { p0: [0.1, 1.6, 5.0], p1: [0.2, 1.55, 4.7], l0: [-0.15, 1.15, 0] },
    sfx: [[0.3, 'text_pa', -11], [0.5, 'whoosh_slide', -12]],
    tags: [{ t: 0.6, text: '1日 30m', x: 500, y: 560, h: 80, bg: CY }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2 - lt * 0.08, 0, 0.3); s.hero.rotation.y = -0.5; hairOn(s, s.hero, { long: 4, trail: 1 });
      h.body.rotation.x = 0.12; h.face({ lid: 0.4, brow: -0.7, look: [-0.4, 0], mouth: 'flat' }); h.arm('L', 0.6, 0.3, 0.8); h.arm('R', 0.6, 0.3, 0.8);
      s.hero.position.y = Math.abs(Math.sin(lt * 7)) * 0.04;
    } },
  // 9) 100,000 hairs x 30 m = 3,000 km = the length of Japan
  { sc: 'st', say: ['x10mb'], pal: ['#2f9bff', '#e3f1ff', '#ffd23a'], hud: ['髪の速さ', '×10万'], hudColor: RED,
    cam: { p0: [0.3, 2.2, 7.0], p1: [0.3, 2.4, 8.2], l0: [0.4, 1.0, 0] },
    sfx: [[0.6, 'text_pa', -11], [2.3, 'comic_jajean', -10]],
    cards: [{ t: 0.6, text: '10万本 × 30m ＝ [3000km]', y: 470, size: 60, border: CY }],
    tags: [{ t: 2.3, text: '≒ 日本列島の長さ', x: 500, y: 620, h: 84, bg: RED, fg: '#ffffff' }],
    note: '日本列島の長さは約3,000km（一般的な目安・試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.4, 0, 0.3); s.hero.rotation.y = 0.1; hairOn(s, s.hero, { long: 6, trail: 1 });
      h.face({ lid: 0.1, brow: 0.3, look: [0.4, 0.4], mouth: 'smile' }); h.arm('R', 2.6, 0.4, 0.3); h.arm('L', 0.05, 0.15, 0.2); h.hand && h.hand('R', 'pa');
    } },
  // 10) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['髪の材料', '？'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.6], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; hairOn(s, s.hero, { long: 1.2 }); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 11) hair = protein
  { sc: 'st', say: ['prot'], pal: ['#2f4f6f', '#3b5f80', '#ffd23a'], dim: 0.95, show: ['steak'], hud: ['髪の材料', 'たんぱく質'], hudColor: RED,
    cam: { p0: [0.1, 1.45, 3.9], p1: [0.1, 1.45, 3.6], l0: [0.05, 1.35, 0] },
    sfx: [[0.5, 'text_pa', -11], [1.6, 'comic_eat', -13]],
    cards: [{ t: 0.5, text: '髪 ≒ [たんぱく質]', y: 470, size: 66, border: CY }],
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 1.2, 1.7)); hairOn(s, s.hero, { long: 1.2 });
      const p = V(lerp(0.32, 0.05, a), lerp(1.05, 1.3, a), lerp(0.35, 0.45, a)); s.P.steak.position.copy(p); h.reach('R', p.clone().add(V(0.04, -0.03, 0)));
      h.arm('L', 0.05, 0.15, 0.2); h.face(a > 0.5 ? { lid: 0.7, mouth: 'o', open: 0.6 + 0.4 * Math.abs(Math.sin(lt * 12)) } : { lid: 0.2, look: [0.5, -0.5], mouth: 'flat' });
    } },
  // 12) x1000 -> 200 g of protein a day, 3x the requirement
  { sc: 'st', say: ['p1000'], pal: ['#e85a7a', '#ffe6ec', '#ffffff'], show: ['desk', 'steaks'], hud: ['たんぱく質', '1日200g'], hudColor: RED,
    cam: { p0: [0.1, 1.4, 4.4], p1: [0.1, 1.38, 4.1], l0: [0.1, 1.2, 0] },
    sfx: [[0.6, 'text_pa', -11], [1.6, 'comic_eat', -13], [2.8, 'comic_shock2', -12]],
    cards: [{ t: 0.6, text: '必要量 65g の[約3倍]', y: 470, size: 62, border: CY }],
    note: '推奨量：成人男性65g/日（厚労省 食事摂取基準2025）',
    act(lt, s) {
      const h = s.hero.userData, st = s.P.steaks; hairOn(s, s.hero, { long: 1.0 }); s.hero.position.set(-0.1, 0, 0.55);
      s.P.desk.position.set(0, 0, 0.95); st.position.set(0.25, 0.78, 0.95); st.userData.n(Math.min(5, 1 + Math.floor(lt * 2)));
      h.reach('R', V(0.2, 1.0, 0.85)); h.reach('L', V(-0.1, 1.28, 0.75)); s.P.steak.visible = true; s.P.steak.position.set(-0.08, 1.3, 0.78);
      h.face({ lid: 0.55, brow: -0.6, mouth: 'o', open: 0.5 + 0.4 * Math.abs(Math.sin(lt * 10)), look: [0.4, -0.5] });
    } },
  // 13) x100000 -> 20 kg a day = 100 kg of steak
  { sc: 'st', say: ['p10m'], pal: ['#7a3fd0', '#efe6ff', '#ffd23a'], show: ['steaks'], hud: ['たんぱく質', '1日20kg'], hudColor: RED,
    cam: { p0: [0.2, 1.55, 5.0], p1: [0.2, 1.6, 4.7], l0: [0.25, 1.35, 0] },
    sfx: [[0.3, 'whoosh_slide', -13], [1.4, 'text_pa', -11], [2.6, 'comic_fall', -12]],
    cards: [{ t: 1.4, text: 'ステーキ [100kg]分', y: 470, size: 66, border: RED }],
    note: '肉100gにたんぱく質約20gとして（試算）',
    act(lt, s) {
      const h = s.hero.userData, st = s.P.steaks; hairOn(s, s.hero, { long: 2.5 }); s.hero.position.set(-0.45, 0, 0.2); s.hero.rotation.y = 0.35;
      st.position.set(0.55, 0, 0); st.userData.n(Math.min(40, 4 + Math.floor(ease(k(lt, 0.2, 1.4)) * 36)));
      h.face({ lid: 0, brow: -1, browY: 1, look: [0.6, 0.9], mouth: 'o', open: 1.0 }); h.head.rotation.x = -0.25; h.arm('L', 0.3, 0.4, 1.6); h.arm('R', 0.4, 0.6, 0.6);
    } },
  // 14) daily haircut -> 1.46 million yen a year
  { sc: 'st', say: ['cost'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], hero2: true, show: ['bills'], hud: ['散髪', '毎日'], hudColor: RED,
    cam: { p0: [0.05, 1.45, 4.7], p1: [0.05, 1.42, 4.4], l0: [0.05, 1.28, 0] },
    sfx: [[0.2, 'comic_pico', -14], [0.9, 'text_pa', -11], [2.3, 'whoosh_gust', -12]],
    cards: [{ t: 0.9, text: '4000円 × 365日 ＝ [146万円]', y: 470, size: 58, border: CY }],
    note: '散髪1回4,000円として（試算）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero.position.set(-0.4, 0, 0.1); s.hero.rotation.y = 0.15;
      hairOn(s, s.hero, { long: lerp(1.0, 0.25, ease(k(lt, 0.2, 2.0))) }); s.hero2.position.set(0.62, 0, -0.05); s.hero2.rotation.y = -0.45; s.hero.updateMatrixWorld(true);
      const sp = h.head.localToWorld(V(0.48, 0.05, -0.05)); snip(s, sp, lt); h2.reach('L', sp.clone().add(V(0.08, -0.02, 0))); h2.arm('R', 0.05, 0.15, 0.2);
      h2.face({ lid: 0.25, look: [-0.7, 0], mouth: 'smile', brow: 0.4 }); bits(s, sp.clone().add(V(0, -0.1, 0.1)), lt);
      const b = s.P.bills, f = Math.max(0, lt - 2.3); b.visible = true;
      b.userData.items.forEach((m, i) => { const a = i / 10 * 6.28; m.position.set(-0.4 + Math.cos(a) * (0.25 + f * 0.8), 1.15 + f * (0.5 + (i % 3) * 0.3), 0.4 + Math.sin(a) * 0.15); m.rotation.set(f * 3 + i, i, f * 5); m.visible = f > 0; });
      h.face(f > 0 ? { lid: 0, brow: -1, browY: 1, mouth: 'o', open: 0.9, look: [0, 0.6] } : { lid: 0.5, mouth: 'flat', brow: -0.4, look: [0.5, 0] }); h.arm('L', f > 0 ? 0.6 : 0.05, f > 0 ? 0.9 : 0.15, 0.4); h.arm('R', 0.05, 0.15, 0.2);
    } },
  // 15) question
  { sc: 'st', say: ['cta'], pal: PAL0,
    cam: { p0: [0, 1.5, 4.2], p1: [0, 1.5, 3.9], l0: [0, 1.36, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.2, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: '伸びてほしい', x: 300, y: 520, h: 110, bg: CY }, { t: t0 + 0.2, text: 'このままで', x: 720, y: 520, h: 110, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData; hairOn(s, s.hero, {}); s.hero.updateMatrixWorld(true);
      combAt(s, 'L', h.head.localToWorld(V(-0.4, 0.3, 0.3)), -0.4); h.arm('R', 0.05, 0.15, 0.2);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0], mouth: 'smile' }); h.head.rotation.set(0, 0.15, Math.sin(lt * 1.6) * 0.08);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしも髪の伸びる速さが', '[どんどん]速くなったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['髪の速さ', 'ふつう'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
