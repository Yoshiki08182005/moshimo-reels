// ep43_nakami_1wari (pop / arm A): もしもお菓子の中身が毎日1割ずつ減ったら？（値段はそのまま＝ステルス値上げの拡大）
// 型は sp_geppu2x / ep41。台本・数字・小道具は自作。
// 前提（試算）: ポテチ1袋 60g・1袋150円・1枚1.5g（40枚）・袋3g・60gで336kcal と仮定。中身 = 60 × 0.9^日数
//   7日 0.478 → 28.7g（半分） / 22日 0.0985 → 5.9g ≒ 4枚 / 35日 0.0250 → 1.50g ＝ 1枚
//   35日目に元の60gを食べるには 60/1.5 = 40袋 × 150円 = 6,000円 / 中身1.5g < 袋3g / カロリー 336→8.4kcal（97.5%オフ）
//   130日 0.9^130 = 1.13e-6 → 0.068mg ≒ 塩1粒（0.3mm角 × 2.16g/cm³ ＝ 0.058mg）
// 実データ: 2026年の食品値上げ 2万327品目（帝国データバンク・報道）/ ステルス値上げの実感 90%（マクロミル 2026年8〜9月・3,000人、報道）
import { run, THREE, V, clamp, ease, lerp, rng, canvasTex } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep43_nakami_1wari.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const D = (id) => voice.lines[id].dur;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), clamp(y + dy, 260, 1480)]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#ff9a3d', '#fff0dc', '#e2463c'], MAIN = ['#5ec2ff', '#e6f5ff', '#ffd23a'];
const CHIP = '#f2c14e';

function label(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.6 }); }
const bagM = label(256, 360, (c) => { c.fillStyle = '#e2463c'; c.fillRect(0, 0, 256, 360); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 256, 80);
  c.fillStyle = '#e2463c'; c.font = 'bold 56px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ポテチ', 128, 42);
  c.fillStyle = CHIP; c.beginPath(); c.ellipse(128, 195, 78, 58, -0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#d9a43a'; c.beginPath(); c.ellipse(110, 185, 14, 9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#ffffff'; c.font = 'bold 46px sans-serif'; c.fillText('うすしお', 128, 315); });
function mkBag(p, s = 1) { const b = G(); rbox(0.34, 0.46, 0.14, 0.06, '#e2463c', 0, 0, 0, b); rbox(0.35, 0.04, 0.05, 0.015, '#c23a31', 0, 0.23, 0, b); rbox(0.35, 0.04, 0.05, 0.015, '#c23a31', 0, -0.23, 0, b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), bagM); f.position.z = 0.072; b.add(f); b.scale.setScalar(s); p.add(b); return b; }
const chipMesh = (r, p) => sph(r, M(CHIP, 0.45), 0, 0, 0, p, 1, 0.22, 0.8);

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  { const g = G(); g.userData.bag = mkBag(g); reg('chipbag', g); }   // origin = bag centre
  { const g = G(); chipMesh(0.1, g); reg('chip1', g); }            // single chip (exaggerated size)
  // plate with a pile of up to 40 chips (origin = plate bottom)
  const plate = (name, seed) => { const g = G(); cyl(0.2, 0.16, 0.025, M('#ffffff', 0.35), 0, 0.012, 0, g); g.userData.items = []; const r = rng(seed);
    for (let i = 0; i < 40; i++) { const c = G(); chipMesh(0.05, c); const a = r() * 6.28, d = Math.sqrt(r()) * 0.13 * (1 - i / 60); c.position.set(Math.cos(a) * d, 0.035 + i * 0.0045, Math.sin(a) * d);
      c.rotation.set((r() - 0.5) * 0.8, r() * 6, (r() - 0.5) * 0.8); g.add(c); g.userData.items.push(c); } return reg(name, g); };
  plate('plate', 3); plate('plate2', 7);
  // 40 bags stacked (origin = floor)
  { const g = G(); for (let i = 0; i < 40; i++) { const b = mkBag(g, 0.62); b.position.set(((i % 5) - 2) * 0.23, 0.15 + Math.floor(i / 5) * 0.29, (i % 2) * 0.04); b.rotation.z = (((i * 7) % 5) - 2) * 0.03; } reg('tower', g); }
  // salt grain (exaggerated) + magnifier
  { const g = G(); rbox(0.035, 0.035, 0.035, 0.004, M('#ffffff', 0.2), 0, 0.018, 0, g); reg('salt', g); }
  { const g = G(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 10, 32), M('#2a2f3a', 0.4)); ring.castShadow = true; g.add(ring);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.125, 32), new THREE.MeshStandardMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.35, roughness: 0.1 })); g.add(gl);
    const hd = cyl(0.022, 0.022, 0.2, '#b5462f', 0, -0.23, 0, g); void hd; reg('loupe', g); }
}

const hold = (s, name, side, p, rz = 0) => { const o = s.P[name]; o.visible = true; o.position.copy(p); o.rotation.set(0, 0, rz); s.hero.userData.reach(side, p.clone().add(V(side === 'R' ? 0.07 : -0.07, -0.08, -0.03))); return o; };
const pile = (o, n) => { o.visible = true; o.userData.items.forEach((c, i) => { c.visible = i < n; }); return o; };

// cold-open scene (also #6): tip the big bag -> ONE chip drops into the hand -> eat it
function openBag(s, lt, t0) {
  const h = s.hero.userData; s.hero.position.set(-0.1, 0, 0.3); s.hero.rotation.y = 0.1;
  const tip = ease(k(lt, t0, t0 + 0.15)), down = ease(k(lt, t0 + 1.0, t0 + 1.4));
  const b = hold(s, 'chipbag', 'L', V(lerp(-0.4, -0.45, down), lerp(1.2, 1.05, down), 0.6), lerp(-1.1 * tip, -0.2, down));
  const c = s.P.chip1; c.visible = true; const hand = V(0.3, 1.1, 0.62);
  if (lt < t0 + 0.08) { c.visible = false; }
  else if (lt < t0 + 0.3) { const f = k(lt, t0 + 0.08, t0 + 0.3); c.position.set(lerp(-0.2, 0.3, f), lerp(1.3, 1.16, f * f), lerp(0.66, 0.68, f)); c.rotation.set(lt * 8, 0, lt * 5); }
  else { const up = ease(k(lt, t0 + 1.2, t0 + 1.7)), eat = ease(k(lt, t0 + 2.15, t0 + 2.35)); const hp = headPos(s.hero);
    const p = V(lerp(hand.x, 0.2, up), lerp(hand.y + 0.06, hp.y - 0.1, up), lerp(hand.z + 0.06, hp.z + 0.5, up)).lerp(V(hp.x + 0.02, hp.y - 0.2, hp.z + 0.4), eat);
    c.position.copy(p); c.rotation.set(1.2, 0, 0.2); c.visible = eat < 0.98; }
  h.reach('R', (lt < t0 + 0.3 ? hand : c.position).clone().add(V(0.03, -0.09, -0.06))); h.hand('R', 'pa');
  return b;
}

const plan = [
  // 0) cold open (flash-forward of #6): a huge bag -> exactly one chip -> push in on the deadpan face, "サクッ"
  { sc: 'st', say: [], pre: 0, hold: 3.0, pal: HOOK, show: [],
    cam: { p0: [0.1, 1.5, 5.2], p1: [0.0, 1.45, 2.5], l0: [0.0, 1.05, 0], l1: [0.0, 1.38, 0.3], hold: 1.3, dur: 2.0 },
    shake: [[0.28, 0.08, 0.6]], lines: [[0.28, 0.9]],
    sfx: [[0.02, 'whoosh_swing', -12], [0.28, 'impact_doon', -9], [0.32, 'comic_surprise', -12], [1.2, 'comic_pico', -11], [2.2, 'comic_eat', -10], [2.6, 'comic_stupid', -12]],
    stamps: [{ t: 0.28, text: '1袋 1枚!?', x: 560, y: 330, rot: -6, color: YEL, size: 110, dur: 1.1 },
      { t: 2.25, text: 'サクッ', x: 720, y: 1220, rot: 6, color: '#ffffff', size: 60, dur: 0.8 }],
    act(lt, s) {
      openBag(s, lt, 0.05); const h = s.hero.userData;
      if (lt < 1.2) h.face(lt < 0.2 ? { lid: 0.2, look: [0.2, 0.2], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0.5, -0.6], mouth: 'o', open: 1.1 });
      else h.face(lt < 2.1 ? { lid: 0.55, brow: -0.2, look: [0, 0], mouth: 'flat' } : { lid: 0.5, brow: 0.3, look: [0, 0], mouth: 'o', open: 0.3 + Math.abs(Math.sin(lt * 14)) * 0.4 });
    } },
  // 1) title
  { sc: 'st', say: ['hook'], pal: MAIN, show: [],
    cam: { p0: [0.0, 1.4, 4.8], p1: [0.0, 1.38, 4.5], l0: [0.0, 1.2, 0] },
    sfx: [[0.02, 'text_impact', -9], [1.6, 'comic_pico', -13]],
    tags: [{ t: 1.6, text: '毎日 −10%', x: 760, y: 1200, h: 96, bg: YEL }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0.25); s.hero.rotation.y = 0.15;
      hold(s, 'chipbag', 'R', V(0.22, 1.2 + Math.abs(Math.sin(lt * 4)) * 0.03, 0.6), -0.15); h.arm('L', 0.2, 2.5, 0.3); h.hand('L', 'pa');
      h.face({ lid: 0.2, brow: 0.4, mouth: 'smile', look: [0.4, 0.2] });
    } },
  // 2) real data: price hikes 20k items / 90% noticed shrinkflation
  { sc: 'st', say: ['real'], pre: 0.2, pal: ['#7a6ae0', '#efeaff', '#ffd23a'], show: ['desk', 'tower'], hud: ['お菓子', '毎日−10%'],
    cam: { p0: [0.1, 1.45, 5.4], p1: [0.1, 1.43, 5.1], l0: [0.1, 1.25, 0] },
    sfx: [[0.3, 'text_pa', -11], [2.3, 'text_pa', -11], [3.6, 'comic_pico', -13]],
    tags(lt) { return [{ t: 0.3, text: '値上げ 2万327品目', x: 560, y: 400, h: 84, bg: '#ffffff' }, ...(lt > 2.2 ? [{ t: 2.2, text: '中身へり 実感9割', x: 560, y: 520, h: 84, bg: CY }] : [])]; },
    note: '2026年 帝国データバンク／マクロミル（報道）',
    act(lt, s) {
      s.P.desk.position.set(-0.55, 0, 0.1); const tw = s.P.tower; tw.position.set(0.75, 0, -0.7); tw.scale.setScalar(0.55); tw.rotation.y = -0.3;
      const h = s.hero.userData; s.hero.position.set(-0.15, 0, 0.35); s.hero.rotation.y = 0.15;
      hold(s, 'chipbag', 'L', V(-0.42, 1.15, 0.6), 0.1); h.reach('R', V(0.45, 1.25, 0.1)); h.hand('R', 'pa');
      h.face(lt < 2.3 ? { lid: 0.2, brow: 0.2, mouth: 'smile', look: [0.7, 0] } : { lid: 0.1, brow: -0.6, browY: 1, mouth: 'o', open: 0.6, look: [0, 0] });
    } },
  // 3) rule: same price, start at 60g (full plate)
  { sc: 'st', say: ['rule'], pre: 0.15, pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['desk'], hud: ['1日目', '60g'], hudColor: YEL,
    cam: { p0: [0.05, 1.42, 4.8], p1: [0.05, 1.4, 4.5], l0: [0.05, 1.2, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.6, 'comic_eat', -12]],
    tags(lt) { return [{ t: 0.3, text: '値段そのまま 150円', x: 540, y: 400, h: 80, bg: '#ffffff' }, ...(lt > 1.4 ? [{ t: 1.4, text: '60g＝約40枚', x: 760, y: 1150, h: 84, bg: CY }] : [])]; },
    act(lt, s) {
      s.P.desk.position.set(0.45, 0, 0.1); const pl = pile(s.P.plate, 40); pl.position.set(0.45, 0.77, 0.1);
      const h = s.hero.userData; s.hero.position.set(-0.45, 0, 0.3); s.hero.rotation.y = 0.3;
      hold(s, 'chipbag', 'L', V(-0.72, 1.15, 0.6), 0.1); h.reach('R', V(0.3, 0.92, 0.2)); h.hand('R', 'choki');
      h.face({ lid: 0.3, brow: 0.5, mouth: 'smile', look: [0.7, -0.4] });
    } },
  // 4) day 7: normal 60g vs you half; bag puffed with air
  { sc: 'st', say: ['d7'], pre: 0.15, pal: ['#4fc38a', '#e6f8ee', '#ffd23a'], hero2: true, show: [], hud: ['7日目', '×0.48'], hudColor: YEL,
    cam: { p0: [0, 1.6, 6.2], p1: [0, 1.58, 6.0], l0: [0, 1.25, 0] },
    sfx: [[0.4, 'text_pa', -10], [1.5, 'text_pa', -10], [2.6, 'comic_boyon', -12]],
    stamps: [{ t: 2.6, text: 'パンパン', x: 300, y: 820, rot: -8, color: RED, size: 72, dur: 1.4 }],
    tags(lt) { const p2 = scr(S, headPos(S.hero2), 0, -250), p1 = scr(S, headPos(S.hero), 0, -250);
      return [{ t: 0.3, text: 'ふつう 60g', x: p2[0], y: p2[1], h: 76, bg: '#ffffff' }, ...(lt > 1.3 ? [{ t: 1.3, text: 'あなた 29g', x: p1[0], y: p1[1], h: 88, bg: CY }] : [])]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData; s.hero2.position.set(0.68, 0, 0); s.hero2.rotation.y = -0.3; s.hero.position.set(-0.68, 0, 0.2); s.hero.rotation.y = 0.3;
      const p2 = pile(s.P.plate2, 40); p2.position.set(0.48, 1.05, 0.45); h2.reach('L', V(0.48, 1.03, 0.39)); h2.arm('R', 0.1, 0.3, 0.2); h2.face({ lid: 0.5, brow: 0.2, mouth: 'smile', look: [-0.4, 0] });
      const p1 = pile(s.P.plate, 19); p1.position.set(-0.45, 1.05, 0.5); h.reach('R', V(-0.45, 1.03, 0.44));
      const puff = 1 + 0.15 * ease(k(lt, 2.4, 2.8)) + Math.sin(lt * 9) * 0.02 * k(lt, 2.4, 2.8); const b = hold(s, 'chipbag', 'L', V(-0.98, 1.2, 0.5), 0.2); b.userData.bag.scale.set(puff, puff, 1 + (puff - 1) * 3);
      h.face(lt < 2.4 ? { lid: 0.4, brow: 0.2, look: [0.2, -0.4], mouth: 'flat' } : { lid: 0, brow: -0.6, browY: 1, look: [-0.6, 0], mouth: 'o', open: 0.9 });
    } },
  // 5) day 22: 4 chips on the plate
  { sc: 'st', say: ['d22'], pre: 0.15, hold: 0.2, pal: ['#3fa8ff', '#e4f3ff', '#ffd23a'], show: ['desk'], hud: ['22日目', '×0.1'], hudColor: YEL,
    cam: { p0: [0.15, 1.4, 4.4], p1: [0.15, 1.38, 4.1], l0: [0.15, 1.15, 0] },
    sfx: [[0.4, 'text_pa', -10], [1.6, 'comic_pico', -12], [2.2, 'comic_pico', -12], [2.8, 'comic_tsukkomi', -10]],
    cards(lt) { return lt > 1.4 ? [{ t: 1.4, text: '1袋 [4枚]', y: 480, size: 76, border: YEL, sub: '60g×0.9²²＝5.9g（試算）' }] : []; },
    act(lt, s) {
      s.P.desk.position.set(0.45, 0, 0.1); const pl = pile(s.P.plate, 4); pl.position.set(0.45, 0.77, 0.15);
      const h = s.hero.userData; s.hero.position.set(-0.35, 0, 0.3); s.hero.rotation.y = 0.35;
      const tap = Math.floor(clamp((lt - 1.5) / 0.4, 0, 3)), bob = Math.abs(Math.sin(lt * 7.8)) * 0.04;
      h.reach('R', V(0.38 + tap * 0.04, 0.9 + bob, 0.2)); h.hand('R', 'choki'); hold(s, 'chipbag', 'L', V(-0.62, 1.1, 0.6), 0.15);
      h.face(lt < 2.7 ? { lid: 0.3, brow: 0.1, look: [0.8, -0.6], mouth: 'flat' } : { lid: 0, brow: -0.8, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 });
    } },
  // 6) day 35: one chip (the cold open, in its place)
  { sc: 'st', say: ['d35'], pre: 0.15, hold: 0.4, pal: HOOK, show: [], hud: ['35日目', '×0.025'], hudColor: YEL,
    cam: { p0: [0.1, 1.5, 5.2], p1: [0.1, 1.48, 4.9], l0: [0.0, 1.25, 0] },
    shake: [[0.9, 0.06, 0.5]],
    sfx: [[0.85, 'whoosh_swing', -12], [1.1, 'impact_doon', -10], [2.0, 'text_pa', -10]],
    stamps: [{ t: 1.1, text: '1枚!?', x: 760, y: 820, rot: 8, color: YEL, size: 100, dur: 0.8 }],
    cards(lt) { return lt > 1.9 ? [{ t: 1.9, text: '1袋 [1枚]だけ', y: 480, size: 70, border: YEL, sub: '1枚＝1.5gと仮定（試算）' }] : []; },
    act(lt, s) {
      openBag(s, lt, 0.85); const h = s.hero.userData;
      h.face(lt < 0.9 ? { lid: 0.2, look: [0.2, 0.2], mouth: 'smile' } : { lid: 0, brow: -0.9, browY: 1, look: [0.5, -0.6], mouth: 'o', open: 1.1 });
    } },
  // 7) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, hud: ['でも…', '落とし穴'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.4], p1: [0, 1.48, 2.7], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 8) to eat the same as before: 40 bags / 6,000 yen a day
  { sc: 'st', say: ['buy'], pre: 0.15, pal: ['#2f4a8a', '#c9d6f2', '#ffd23a'], dim: 0.9, show: ['tower'], hud: ['35日目', '40袋'], hudColor: RED,
    cam: { p0: [0.2, 1.6, 5.8], p1: [0.2, 1.58, 5.5], l0: [0.2, 1.45, 0] },
    sfx: [[0.3, 'whoosh_slide', -13], [2.0, 'text_pa', -10], [3.4, 'comic_shock2', -12]],
    cards(lt) { return lt > 1.8 ? [{ t: 1.8, text: '毎日[40袋]＝6,000円', y: 480, size: 62, border: RED, sub: '1袋150円と仮定（試算）' }] : []; },
    act(lt, s) {
      const tw = s.P.tower; tw.position.set(0.72, 0, -0.35); tw.rotation.y = -0.25; tw.scale.setScalar(0.75); tw.position.y = 2.5 * (1 - ease(k(lt, 0.2, 0.7)));
      const h = s.hero.userData; s.hero.position.set(-0.5, 0, 0.35); s.hero.rotation.y = 0.3;
      h.reach('R', V(0.2, 1.1, 0.0)); h.hand('R', 'pa'); h.arm('L', 0.3, 0.6, 1.6);
      h.face(lt < 1.8 ? { lid: 0.1, brow: -0.4, browY: 1, look: [0.8, 0.4], mouth: 'o', open: 0.6 } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 });
    } },
  // 9) the bag outweighs the contents (balance in two hands)
  { sc: 'st', say: ['trash'], pre: 0.15, pal: ['#6a4fb0', '#e4dcf6', '#ffd23a'], dim: 0.9, show: [], hud: ['35日目', 'ゴミ'], hudColor: RED,
    cam: { p0: [0.0, 1.42, 4.4], p1: [0.0, 1.4, 4.2], l0: [0.0, 1.3, 0] },
    sfx: [[0.3, 'text_pa', -11], [1.2, 'text_pa', -11], [2.2, 'comic_fall', -12]],
    tags(lt) { const pc = scr(S, s0.chipPos, 0, 120), pb = scr(S, s0.bagPos, 0, 200);
      return [{ t: 0.3, text: '中身 1.5g', x: pc[0], y: pc[1], h: 76, bg: '#ffffff' }, ...(lt > 1.1 ? [{ t: 1.1, text: '袋 3g', x: pb[0], y: pb[1], h: 88, bg: RED, fg: '#ffffff' }] : [])]; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.3); s.hero.rotation.y = 0;
      const tilt = ease(k(lt, 1.6, 2.2)); s0.chipPos = V(-0.42, lerp(1.2, 1.38, tilt), 0.62); s0.bagPos = V(0.42, lerp(1.2, 0.95, tilt), 0.62);
      const c = hold(s, 'chip1', 'L', s0.chipPos.clone().add(V(0, 0.07, 0.06))); c.rotation.set(1.2, 0, 0); s.hero.userData.reach('L', s0.chipPos.clone().add(V(-0.05, -0.05, -0.03))); hold(s, 'chipbag', 'R', s0.bagPos, -0.1);
      h.body.rotation.z = -0.08 * tilt;
      h.face(lt < 1.6 ? { lid: 0.3, brow: 0.2, look: [-0.6, -0.2], mouth: 'flat' } : { lid: 0, brow: -0.8, browY: 1, look: [0.7, -0.5], mouth: 'o', open: 0.9 });
    } },
  // 10) good news (calories) / bad news (one grain of salt)
  { sc: 'st', say: ['good', 'bad'], pre: 0.15, pal: ['#7fd08a', '#e8f8ea', '#ffffff'], show: [],
    cam: { p0: [0.1, 1.45, 4.9], p1: [0.0, 1.43, 4.7], l0: [0.0, 1.35, 0] },
    hud(lt) { return lt < this.lt.bad ? ['いいニュース', 'カロリー'] : ['悪いニュース', '130日目']; }, hudColor: YEL,
    sfx: [[0.2, 'comic_jajean', -12], [2.0, 'text_pa', -11], [0.15 + D('good') + 0.3, 'comic_stupid', -12], [0.15 + D('good') + 2.6, 'comic_fall', -13]],
    cards(lt) { const a = this.lt.bad; return lt < a ? (lt > 1.9 ? [{ t: 1.9, text: 'カロリー [97%オフ]', y: 480, size: 64, border: YEL, sub: '336→8kcal（試算）' }] : [])
      : (lt > a + 2.0 ? [{ t: a + 2.0, text: '中身＝[塩1粒]', y: 480, size: 70, border: RED, sub: '60g×0.9¹³⁰＝0.07mg（試算）' }] : []); },
    act(lt, s, gt, sh) {
      const h = s.hero.userData, late = lt >= sh.lt.bad;
      if (!late) {
        s.hero.position.set(-0.05, 0, 0.4); s.hero.rotation.y = 0.05; h.body.position.y = Math.abs(Math.sin(lt * 6)) * 0.05;
        hold(s, 'chipbag', 'R', V(0.4, 1.75, 0.45), 0.3); h.arm('L', 0.1, 2.6, 0.3); h.hand('L', 'pa'); h.face({ lid: 0.2, brow: 0.6, mouth: 'smile', look: [0, 0.3] });
      } else {
        s.P.desk.visible = true; s.P.desk.position.set(0.4, 0, 0.1); const sl = s.P.salt; sl.visible = true; sl.position.set(0.4, 0.77, 0.25);
        s.hero.position.set(-0.4, 0, 0.3); s.hero.rotation.y = 0.35;
        const lp = hold(s, 'loupe', 'R', V(0.35, 1.0, 0.35)); lp.rotation.set(-1.1, 0.2, 0); hold(s, 'chipbag', 'L', V(-0.7, 1.1, 0.6), 0.15);
        h.face(lt < sh.lt.bad + 1.9 ? { lid: 0.3, brow: 0.1, look: [0.8, -0.7], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 1.1 }); }
    } },
  // 11) question + follow
  { sc: 'st', say: ['cta'], pre: 0.15, hold: 0.8, pal: HOOK, show: [],
    cam: { p0: [0.05, 1.45, 4.8], p1: [0.05, 1.45, 4.6], l0: [0, 1.3, 0] },
    sfx: [[0.0, 'question', -11], [1.15, 'text_pa', -11], [1.35, 'text_pa', -11], [2.3, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.05; return lt > t0 ? [{ t: t0, text: '値上げでいい', x: 310, y: 1040, h: 104, bg: CY }, { t: t0 + 0.2, text: '中身へりでいい', x: 770, y: 1040, h: 96, bg: '#ffffff' },
      { t: t0 + 0.8, text: 'コメントで教えて', x: 540, y: 1170, h: 70, bg: INK, fg: '#ffffff' }, { t: t0 + 1.2, text: '明日も試算するよ', x: 540, y: 1450, h: 68, bg: YEL }] : []; },
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.1, 0, 0.2); s.hero.rotation.y = 0.05;
      hold(s, 'chipbag', 'R', V(0.4, 0.95, 0.6), -0.1); h.arm('L', 0.2, 0.7, 1.7);
      h.face({ lid: 0.3, brow: 0.5, look: [0.3, 0.3], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 1.6) * 0.08;
    } },
];
const s0 = { chipPos: V(-0.42, 1.2, 0.62), bagPos: V(0.42, 1.2, 0.62) };

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもお菓子の中身が', '毎日[1割]減ったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['お菓子', '毎日−10%'],
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
