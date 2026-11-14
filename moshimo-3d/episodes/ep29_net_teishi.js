// ep29_net_teishi (pop スタイル / アームC ニュース起点): もしもネットが丸1日止まったら？
// 入り口: 今週のマイクロソフトの大規模障害（メール・Teamsが日本でも止まった、報道）。構成の型は sp_geppu2x。台本・数字・ネタは自作。
// 前提と検算:
//   ネット利用率 85.6%（総務省 通信利用動向調査 2024年）→ 約86%
//   世界のメール 1日 約3,616億通（Radicati Group 推計 2024年）÷ 86,400秒 ≒ 418万通/秒 → 約420万通
//   BtoC-EC 26.1兆円/年（経済産業省 電子商取引に関する市場調査 2024年）÷365 = 715億円/日 ÷86,400 ≒ 83万円/秒 / ×7日 ≒ 5,005億円
//   紙飛行機: 東京→大阪 直線 約400km ÷ 秒速5m（飛び続けたとして）= 80,000秒 ≒ 22.2時間
//   スマホ接触 165.1分/日（博報堂DYメディアパートナーズ メディア定点調査2025）÷ 映画110分 = 1.5本
//   キャッシュレス決済比率 42.8%（経済産業省 2024年）→ 約4割 / はがき 85円（2024年10月〜）×10人 = 850円
import { run, THREE, V, clamp, ease, lerp, canvasTex, basic } from '../engine/core.js';
import { buildToyStage, M, sph, caps, rbox, cyl } from '../engine/kit6.js';
import { narrate } from './_common.js';

const voice = await (await fetch(new URL('./ep29_net_teishi.voice.json', import.meta.url))).json();
const k = (t, a, b) => clamp((t - a) / (b - a));
const CY = '#35d0ff', RED = '#ff5a4f', YEL = '#ffd23a', INK = 'rgba(24,26,32,0.9)';
let S;
const scr = (api, v, dx = 0, dy = 0) => { const [x, y] = api.screen(v); return [clamp(x + dx, 170, 860), y + dy]; };
const headPos = (o) => o.userData.head.getWorldPosition(V(0, 0, 0));
const G = () => new THREE.Group();
const HOOK = ['#7fc8ff', '#eef6ff', '#ffd23a'];

function addProps(api) {
  const { scene, P } = api;
  const reg = (name, o) => { scene.add(o); o.userData.home = [o.position.clone(), o.rotation.clone(), o.scale.clone()]; P[name] = o; return o; };
  { // paper airplane, nose toward +x
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0.26, 0, 0, -0.16, 0.02, -0.14, -0.16, 0, 0, 0.26, 0, 0, -0.16, 0, 0, -0.16, 0.02, 0.14, 0.26, 0, 0, -0.16, 0, 0, -0.16, -0.06, 0], 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#fffbe8', roughness: 0.7, side: THREE.DoubleSide, emissive: '#ffffff', emissiveIntensity: 0.15 })); m.castShadow = true;
    const p = G(); p.add(m); reg('plane', p);
  }
  { // wifi sign on the wall: userData.x = the red cross
    const s = G(); rbox(0.78, 0.66, 0.05, 0.06, '#ffffff', 0, 0, 0, s);
    const tex = canvasTex(256, 220, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 220); c.strokeStyle = '#2c3b6b'; c.lineCap = 'round';
      for (const [r, w] of [[150, 22], [104, 22], [58, 22]]) { c.lineWidth = w; c.beginPath(); c.arc(128, 190, r, -Math.PI * 0.78, -Math.PI * 0.22); c.stroke(); }
      c.fillStyle = '#2c3b6b'; c.beginPath(); c.arc(128, 186, 16, 0, 7); c.fill(); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.56), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); f.position.z = 0.028; s.add(f);
    const x = G(); for (const r of [0.75, -0.75]) { const b = rbox(0.7, 0.09, 0.02, 0.03, basic('#ff3b30'), 0, 0, 0.05, x); b.rotation.z = r; } s.add(x); s.userData.x = x;
    s.position.set(0.78, 1.95, -2.3); reg('wifi', s);
  }
  { // envelopes (items)
    const tex = canvasTex(200, 130, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 200, 130); c.strokeStyle = '#9aa3ad'; c.lineWidth = 6; c.beginPath(); c.moveTo(4, 4); c.lineTo(100, 74); c.lineTo(196, 4); c.stroke(); c.fillStyle = '#ff5a4f'; c.fillRect(150, 82, 34, 34); });
    const fm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }); const g = G(); g.userData.items = [];
    for (let i = 0; i < 12; i++) { const e = G(); rbox(0.3, 0.2, 0.012, 0.01, '#ffffff', 0, 0, 0, e); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.19), fm); f.position.z = 0.008; e.add(f); g.add(e); g.userData.items.push(e); }
    reg('mails', g);
  }
  { // postcards (items)
    const tex = canvasTex(130, 200, (c) => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, 130, 200); c.strokeStyle = '#e2463c'; c.lineWidth = 4; c.strokeRect(84, 10, 36, 44); for (let y = 80; y < 190; y += 22) { c.fillStyle = '#c9ced6'; c.fillRect(14, y, 102, 3); } });
    const fm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }); const g = G(); g.userData.items = [];
    for (let i = 0; i < 10; i++) { const e = G(); rbox(0.13, 0.2, 0.006, 0.004, '#fffaf0', 0, 0, 0, e); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.125, 0.19), fm); f.position.z = 0.004; e.add(f); g.add(e); g.userData.items.push(e); }
    reg('posts', g);
  }
  { // notification bubbles (items)
    const g = G(); g.userData.items = [];
    for (let i = 0; i < 10; i++) { const b = G(); rbox(0.34, 0.09, 0.02, 0.04, '#ffffff', 0, 0, 0, b); sph(0.026, basic(i % 2 ? '#3fd16b' : '#ff5a4f'), -0.12, 0, 0.014, b, 1, 1, 0.4); rbox(0.16, 0.018, 0.004, 0.006, '#c9ced6', 0.04, 0.012, 0.012, b); g.add(b); g.userData.items.push(b); }
    reg('bubs', g);
  }
}
function holdPhone(s, side = 'L', p = V(-0.12, 0.98, 0.45), who = s.hero, tilt = -0.7) {
  const ph = s.P.phone, sg = side === 'R' ? 1 : -1; ph.visible = true; ph.position.copy(p); ph.rotation.set(tilt, 0, 0);
  who.userData.reach(side, p.clone().add(V(0.06 * sg, -0.07, -0.05)));
}
const lookPhone = (h, o = {}) => { h.face({ lid: 0.35, look: [0, -0.8], mouth: 'flat', ...o }); h.head.rotation.x = 0.3; };
function wifiOff(s, lt, blink = true) { const w = s.P.wifi; w.visible = true; w.userData.x.visible = !blink || Math.floor(lt * 3) % 2 === 0 || lt > 1.5; }

// the throw (cold open + its payoff in 'plane'): hero at x0, plane flies off into the sky
function throwPlane(lt, s, t0, x0 = -0.3) {
  const h = s.hero.userData, pl = s.P.plane, f = Math.max(0, lt - t0), u = clamp(f / 0.75);
  pl.visible = u < 1;
  if (lt < t0) {
    const c = ease(k(lt, 0, t0)); h.reach('R', V(x0 + 0.2, 1.45 + c * 0.35, 0.1 - c * 0.15)); pl.position.copy(h.handPos('R')).add(V(0.08, 0.06, 0.05)); pl.scale.setScalar(2.4); pl.rotation.set(0, 0.25, 0.2);
  } else {
    h.reach('R', V(x0 + 0.5, 1.3, 0.55));
    pl.position.set(x0 + 0.45 + u * 1.5, 1.5 + u * 1.7 + Math.sin(u * 9) * 0.05, 0.45 - u * 1.8); pl.scale.setScalar(2.4 * (1 - 0.75 * u)); pl.rotation.set(Math.sin(f * 20) * 0.2, 0.25, 0.45);
  }
}

const plan = [
  // 0) cold open (flash-forward of 'plane'): network down -> sends a message by paper airplane, it rockets off into the sky; push in to a smug face
  { sc: 'st', say: [], pre: 0, hold: 3.2, pal: HOOK, show: ['wifi'],
    cam: { p0: [0.1, 1.5, 5.4], p1: [-0.3, 1.55, 2.5], l0: [0.15, 1.35, 0], l1: [-0.3, 1.52, 0.25], hold: 1.65, dur: 2.4 },
    shake: [[0.25, 0.06, 0.6]], lines: [[0.25, 0.9]],
    sfx: [[0.25, 'whoosh_swing', -6], [0.27, 'impact_don', -10], [0.3, 'whoosh_gust', -9], [1.0, 'sparkle', -8], [1.65, 'whoosh_slide', -13], [2.5, 'comic_pico', -10]],
    stamps: [{ t: 0.25, text: 'ビュンッ!!', x: 330, y: 1120, rot: -8, color: YEL, size: 118, dur: 1.0 },
      { t: 1.0, text: '☆キラーン', x: 760, y: 470, rot: 10, color: '#fff3a8', size: 72, dur: 0.65 },
      { t: 2.5, text: '送信っ♪', x: 800, y: 1300, rot: 8, color: '#ffffff', size: 80, dur: 0.7 }],
    act(lt, s) {
      const h = s.hero.userData, turn = ease(k(lt, 1.65, 2.2));
      s.hero.position.set(-0.3, 0, 0.25); s.hero.rotation.y = 0.7 * (1 - turn); wifiOff(s, lt, false);
      if (lt < 1.65) { throwPlane(lt, s, 0.25); h.arm('L', 0.1, 0.3, 0.3); h.face(lt < 0.25 ? { lid: 0.2, brow: 0.6, mouth: 'flat', look: [0.6, 0.2] } : { lid: 0, browY: 1, look: [0.8, 0.7], mouth: 'o', open: 0.5 }); if (lt > 0.4) h.head.rotation.x = -0.2; }
      else { h.face({ lid: 0.35, brow: 0.35, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = 0.08 * turn; h.arm('R', 2.4 * turn, 0.3, 0.4); h.hand('R', 'choki'); }
    } },
  // 1) hook: phone, the wifi sign shows a red cross
  { sc: 'st', say: ['hook'], pal: HOOK, show: ['wifi'],
    cam: { p0: [0.25, 1.5, 4.4], p1: [0.25, 1.48, 4.0], l0: [0.25, 1.4, 0] },
    sfx: [[0.02, 'text_impact', -9], [0.6, 'comic_stupid', -13]],
    tags: [{ t: 1.4, text: '圏外…', x: 330, y: 700, h: 84, bg: RED, fg: '#ffffff' }],
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.25, 0, 0.2); wifiOff(s, lt); s.P.wifi.position.set(0.7, 1.65, -1.2);
      holdPhone(s, 'L', V(-0.4, 1.0, 0.65)); h.reach('R', V(-0.3, 1.02, 0.7));
      if (lt < 0.6) lookPhone(h); else { h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.7, 0.5], mouth: 'o', open: 0.6 }); h.head.rotation.y = 0.35; }
    } },
  // 2) the news: email and chat stopped
  { sc: 'st', say: ['news'], pal: ['#5b7cfa', '#e8edff', '#ffffff'], show: ['desk', 'mails'], hero2: true,
    cam: { p0: [0, 1.4, 4.6], p1: [0, 1.38, 4.3], l0: [0, 1.25, 0] },
    sfx: [[0.3, 'comic_shock2', -12], [1.2, 'text_pa', -11]],
    note: '今週の大規模な通信障害（報道）',
    tags(lt) { if (lt < 1.2) return []; const p = scr(S, headPos(S.hero2), 0, -260); return [{ t: 1.2, text: '送信できません', x: p[0], y: p[1], h: 70, bg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, it = s.P.mails.userData.items;
      s.hero.position.set(-0.6, 0, 0.3); s.hero.rotation.y = 0.35; s.P.desk.position.set(0.62, 0, 0.2);
      s.hero2.position.set(0.62, 0, -0.35); s.hero2.rotation.y = -0.15;
      it.forEach((e, i) => { e.visible = i < 3; e.position.set(0.05 + i * 0.12, 1.75 + i * 0.1 + Math.sin(lt * 2 + i) * 0.02, -0.2); e.rotation.set(0, 0, Math.sin(i) * 0.3); });
      h2.reach('L', V(0.45, 0.8, 0.15)); h2.reach('R', V(0.8, 0.8, 0.15));
      h2.face(lt < 0.4 ? { lid: 0.3, look: [0, -0.7], mouth: 'flat' } : { lid: 0, brow: -1, browY: 1, look: [-0.3, 0.2], mouth: 'o', open: 0.7 });
      h.arm('L', 0.3, 0.9, 1.2); h.arm('R', 0.3, 0.9, 1.2); h.face({ lid: 0.2, brow: -0.6, look: [0.7, 0], mouth: 'flat' });
    } },
  // 3) 86% use the internet
  { sc: 'st', say: ['users'], pal: ['#ffb36b', '#fdf0e0', '#3f6fd8'], show: ['crowd'], hud: ['ネット利用', '86%'],
    cam: { p0: [0, 1.7, 5.4], p1: [0, 1.65, 5.0], l0: [0, 1.15, -0.4] },
    sfx: [[0.9, 'text_pa', -10], [1.5, 'comic_pico', -14]],
    cards: [{ t: 0.9, text: '日本の[86%]がネット利用', y: 470, size: 60, border: CY }],
    note: '総務省 通信利用動向調査（2024年）：85.6%',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(0, 0, 0.6);
      s.P.crowd.userData.items.forEach((p, i) => { p.position.y = Math.abs(Math.sin(lt * 4 + i)) * 0.03; });
      h.arm('L', 2.6, 0.4, 0.2); h.arm('R', 0.1, 0.2, 0.2); h.face({ lid: 0.15, look: [0, 0], mouth: 'smile' }); h.head.rotation.z = Math.sin(lt * 2) * 0.06;
    } },
  // 4) mail: 4.2 million a second, frozen in the air
  { sc: 'st', say: ['mail'], pal: ['#1fa99b', '#e9f7f5', '#ffd23a'], show: ['mails'], hud: ['メール', '1秒420万通'],
    cam: { p0: [0.1, 1.45, 4.6], p1: [0.1, 1.45, 4.3], l0: [0.1, 1.3, 0] },
    sfx: [[0.1, 'whoosh_switch1', -12], [0.5, 'whoosh_switch2', -12], [2.6, 'text_tin', -9]],
    stamps: [{ t: 2.6, text: 'ピタッ', x: 760, y: 980, rot: 8, color: '#ffffff', size: 96, dur: 1.2 }],
    cards: [{ t: 1.0, text: '1秒に [420万通]', y: 470, size: 66, border: YEL }],
    note: 'Radicati Group推計：世界のメール 1日約3,600億通',
    act(lt, s) {
      const h = s.hero.userData, it = s.P.mails.userData.items, fr = Math.min(lt, 2.6);
      s.hero.position.set(-0.55, 0, 0.1); s.hero.rotation.y = 0.3;
      it.forEach((e, i) => { e.visible = true; const x = ((fr * 1.1 + i * 0.27) % 2.6) - 0.9; e.position.set(x, 1.0 + (i % 4) * 0.22, -0.2 - (i % 3) * 0.2); e.rotation.set(0, -0.3, Math.sin(fr * 4 + i) * 0.3); });
      if (lt < 2.6) { h.face({ lid: 0.1, look: [0.8, 0.2], mouth: 'o', open: 0.4 }); h.reach('R', V(-0.1, 1.3, 0.3)); }
      else { h.face({ lid: 0, brow: -0.8, browY: 1, look: [0.8, 0.3], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.8, 1.4); h.arm('R', 0.3, 0.8, 1.4); }
    } },
  // 5) online shopping: 830,000 yen a second
  { sc: 'st', say: ['shop'], pal: ['#ff7eb6', '#fff0f6', '#ffffff'], show: ['bag'], hud: ['ネット通販', '1秒83万円'],
    cam: { p0: [0.05, 1.45, 4.2], p1: [0.05, 1.45, 3.9], l0: [0.05, 1.3, 0] },
    sfx: [[0.4, 'comic_pico', -13], [0.8, 'comic_pico', -13], [1.2, 'comic_tsukkomi', -11], [1.6, 'text_pa', -10]],
    cards: [{ t: 1.6, text: '1秒に [83万円]', y: 470, size: 66, border: CY }],
    tags(lt) { if (lt < 1.2) return []; const p = scr(S, S.P.phone.position, 160, -120); return [{ t: 1.2, text: 'カートに入れる ✕', x: p[0], y: p[1], h: 64, bg: '#ffffff' }]; },
    note: '経産省 26.1兆円(2024年)÷365日÷86,400秒',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.2, 0, 0.2); s.P.bag.position.set(0.55, 0, 0.3);
      const p = V(-0.32, 1.0, 0.65); holdPhone(s, 'L', p);
      const tap = lt < 1.3 ? Math.abs(Math.sin(lt * 8)) * 0.04 : 0; h.reach('R', p.clone().add(V(0.06, 0.02, 0.06 + tap)));
      if (lt < 1.2) lookPhone(h); else { lookPhone(h, { lid: 0.1, brow: 0.8, mouth: 'o', open: 0.6 }); h.head.rotation.z = Math.sin(lt * 30) * 0.03; }
    } },
  // 6) payoff of the cold open: paper airplane to Osaka, 22 hours
  { sc: 'st', say: ['plane'], pal: HOOK, show: ['wifi'], hud: ['大阪まで', '22時間'],
    cam: { p0: [0.2, 1.5, 4.9], p1: [0.3, 1.6, 4.7], l0: [0.25, 1.4, 0], l1: [0.4, 1.6, -0.3] }, lines: [[0.3, 0.8]],
    sfx: [[0.3, 'whoosh_swing', -9], [1.1, 'sparkle', -11], [2.6, 'text_pa', -10]],
    stamps: [{ t: 0.3, text: 'ビュンッ', x: 330, y: 1120, rot: -8, color: YEL, size: 96, dur: 0.9 }],
    cards: [{ t: 2.6, text: '400km ÷ 秒速5m ＝ [22時間]', y: 470, size: 56, border: YEL }],
    note: '紙飛行機が秒速5mで飛び続けたとして（試算）',
    act(lt, s) {
      const h = s.hero.userData; s.hero.position.set(-0.3, 0, 0.25); s.hero.rotation.y = 0.6; wifiOff(s, lt, false);
      throwPlane(lt, s, 0.3); h.arm('L', 0.1, 0.3, 0.3);
      if (lt < 1.4) h.face({ lid: 0.1, brow: 0.5, look: [0.8, 0.6], mouth: 'smile' });
      else { h.face({ lid: 0.55, look: [0.6, 0.6], mouth: 'flat' }); s.hero.rotation.y = 0.6 - ease(k(lt, 1.4, 1.9)) * 0.4; h.arm('R', 0.1, 0.2, 0.3); h.reach('L', V(-0.45, 1.25, 0.45)); }
    } },
  // 7) good news: 165 minutes a day come back
  { sc: 'st', say: ['good'], pal: ['#8fd9a8', '#e8f8ec', '#ffffff'], show: ['clock'], hud: ['自由時間', '+165分'], hudColor: '#7fe0a0',
    cam: { p0: [0, 1.45, 4.5], p1: [0, 1.45, 4.2], l0: [0, 1.3, 0] },
    sfx: [[0.1, 'emo_shine', -13], [1.6, 'text_pa', -10]],
    tags: [{ t: 0.1, text: 'いいニュース', x: 330, y: 470, h: 80, bg: '#7fe0a0' }],
    cards: [{ t: 1.6, text: '1日 [165分] 戻ってくる', y: 600, size: 60, border: '#7fe0a0' }],
    note: '博報堂DYMP メディア定点調査2025：スマホ165.1分',
    act(lt, s) {
      const h = s.hero.userData, a = ease(k(lt, 0.3, 1.0)), c = s.P.clock;
      s.hero.position.set(-0.3, 0, 0.2); c.visible = true; c.position.set(0.62, 1.6, -0.6); c.rotation.set(0, 0, 0);
      c.userData.mh.rotation.z = -lt * 6; c.userData.hh.rotation.z = -lt * 0.5;
      h.arm('L', 2.9 * a, 0.3, 0.2); h.arm('R', 2.9 * a, 0.3, 0.2); h.body.position.y = Math.abs(Math.sin(lt * 4)) * 0.05 * a;
      h.face({ lid: 0.6 * a, look: [0, 0.3], mouth: a > 0.5 ? 'o' : 'smile', open: 0.6 });
    } },
  // 8) a movie and a half / a long nap
  { sc: 'st', say: ['movie'], pal: ['#ffc94a', '#fff6dc', '#e2463c'], show: ['cup'],
    cam: { p0: [0, 1.4, 4.2], p1: [0, 1.38, 3.9], l0: [0, 1.28, 0] },
    sfx: [[0.6, 'text_pa', -10], [1.9, 'comic_boyon', -13]],
    stamps: [{ t: 1.9, text: 'Zzz…', x: 700, y: 900, rot: 8, color: '#ffffff', size: 90, dur: 1.6 }],
    tags: [{ t: 0.6, text: '映画 1.5本', x: 290, y: 560, h: 84, bg: '#ffffff' }, { t: 1.9, text: '昼寝 たっぷり', x: 740, y: 560, h: 70, bg: YEL }],
    note: '映画1本を110分として計算',
    act(lt, s) {
      const h = s.hero.userData, cp = V(0.26, 1.0, 0.5); s.P.cup.position.copy(cp);
      h.reach('R', cp.clone().add(V(0.08, 0.08, -0.04))); h.arm('L', 0.1, 0.2, 0.3);
      if (lt < 1.8) h.face({ lid: 0.1, look: [0.4, 0.6], mouth: 'smile' });
      else { h.face({ lid: 1, mouth: 'o', open: 0.3 }); h.head.rotation.z = 0.25; h.head.rotation.x = 0.15; }
    } },
  // 9) twist
  { sc: 'st', say: ['but'], pal: ['#1b2140', '#2a3156', RED], dim: 0.8, show: ['wifi'], hud: ['ネット停止', '1週間'], hudColor: RED,
    cam: { p0: [0, 1.5, 3.3], p1: [0, 1.48, 2.6], l0: [0, 1.42, 0] }, shake: [[0.0, 0.05, 0.5]], lines: [[0.0, 0.5]],
    sfx: [[0.0, 'impact_don', -7], [0.05, 'tension_anxiety', -14, 1.6]],
    act(lt, s) { const h = s.hero.userData; wifiOff(s, lt, false); h.face({ lid: 0, brow: -1, browY: 1, look: [0, 0], mouth: 'o', open: 0.9 }); h.arm('L', 0.3, 0.3, 1.9); h.arm('R', 0.3, 0.3, 1.9); } },
  // 10) 40% of payments are cashless: do you have cash?
  { sc: 'st', say: ['pay'], pal: ['#6f5ae0', '#ece8ff', '#ffd23a'], show: ['counter', 'bill'], hero2: true, hud: ['ネット停止', '1週間'], hudColor: RED,
    cam: { p0: [0, 1.45, 4.8], p1: [0, 1.43, 4.5], l0: [0, 1.25, 0] },
    sfx: [[0.6, 'comic_shock2', -12], [1.0, 'text_pa', -10], [3.2, 'comic_fall', -13]],
    cards: [{ t: 1.0, text: '支払いの [4割] はキャッシュレス', y: 470, size: 54, border: CY }],
    tags(lt) { if (lt < 3.1) return []; const p = scr(S, headPos(S.hero), 0, -260); return [{ t: 3.1, text: '1枚だけ…', x: p[0], y: p[1], h: 70, bg: '#ffffff' }]; },
    note: '経産省：キャッシュレス決済比率 42.8%（2024年）',
    act(lt, s) {
      const h = s.hero.userData, h2 = s.hero2.userData, b = s.P.bill;
      s.P.counter.position.set(0.85, 0, -0.35); s.hero2.position.set(0.85, 0, -0.95); s.hero2.rotation.y = -0.3;
      s.hero.position.set(-0.55, 0, 0.35); s.hero.rotation.y = 0.35;
      h2.arm('L', 0.6, 0.2, 0.8); h2.face({ lid: 0.2, brow: 0.2, look: [-0.6, 0], mouth: 'smile' });
      if (lt < 3.0) { holdPhone(s, 'L', V(-0.4, 1.05, 0.7)); h.arm('R', 0.1, 0.2, 0.3); h.face({ lid: 0, brow: -1, browY: 1, look: [0, -0.6], mouth: 'o', open: 0.6 }); h.head.rotation.x = 0.2; }
      else { const p = V(-0.35, 1.2, 0.7); b.visible = true; b.position.copy(p); b.rotation.set(0, 0.2, Math.sin(lt * 9) * 0.08); h.reach('R', p.clone().add(V(0.12, -0.03, -0.03))); h.arm('L', 0.1, 0.2, 0.3); h.face({ lid: 0.4, brow: -0.8, look: [0.2, 0.3], mouth: 'flat' }); }
    } },
  // 11) one week: 500 billion yen of online shopping gone
  { sc: 'st', say: ['week'], pal: ['#ff8a65', '#ffe9df', '#ffffff'], show: ['coinsA', 'coinsB'], hud: ['ネット停止', '1週間'], hudColor: RED,
    cam: { p0: [0, 1.4, 4.6], p1: [0, 1.38, 4.3], l0: [0, 1.2, 0] },
    sfx: [[0.3, 'countdown_tick', -14, 1.6], [2.0, 'collapse', -12, 1.2], [1.6, 'text_pa', -10]],
    cards: [{ t: 1.6, text: '[5,000億円]', y: 470, size: 80, border: RED, sub: '通販の売上 1週間分（試算）' }],
    act(lt, s) {
      const h = s.hero.userData, n = Math.floor(32 * ease(k(lt, 0.3, 1.9))), fall = Math.max(0, lt - 2.0);
      s.hero.position.set(0, 0, 0.3);
      for (const [nm, x] of [['coinsA', -0.75], ['coinsB', 0.75]]) { const c = s.P[nm]; c.position.set(x, 0, -0.1); c.userData.items.forEach((it, i) => { it.visible = i < n; it.position.x = Math.sin(i * 2.1) * 0.008 + (fall > 0 ? Math.sign(x) * fall * fall * i * 0.03 : 0); it.position.y = Math.max(0.013, 0.013 + i * 0.028 - fall * fall * i * 0.03); }); }
      h.face(lt < 2 ? { lid: 0.1, look: [Math.sin(lt * 3) * 0.8, 0], mouth: 'o', open: 0.5 } : { lid: 0, brow: -1, browY: 1, mouth: 'o', open: 1 });
      h.arm('L', 0.3, 0.6 + (lt > 2 ? 0.6 : 0), 1.2); h.arm('R', 0.3, 0.6 + (lt > 2 ? 0.6 : 0), 1.2);
    } },
  // 12) every message by postcard: 10 friends = 850 yen
  { sc: 'st', say: ['letter'], pal: ['#35b0e0', '#e6f6fc', '#ff6b5a'], show: ['desk', 'posts'], hud: ['ネット停止', '1週間'], hudColor: RED,
    cam: { p0: [0, 1.45, 4.3], p1: [0, 1.43, 4.0], l0: [0, 1.25, 0] },
    sfx: [[0.5, 'text_touch', -12], [1.0, 'text_touch', -12], [1.5, 'text_touch', -12], [2.2, 'text_pa', -10], [3.6, 'comic_stupid', -13]],
    cards: [{ t: 2.2, text: '85円 × 10人 ＝ [850円]', y: 470, size: 62, border: YEL }],
    note: '郵便はがき 1枚85円（2024年10月〜）',
    act(lt, s) {
      const h = s.hero.userData, it = s.P.posts.userData.items, n = Math.min(10, 1 + Math.floor(lt * 2.5));
      s.P.desk.position.set(0, 0, 0.75); s.hero.position.set(0, 0, 0.15);
      it.forEach((c, i) => { c.visible = i < n; c.position.set(-0.36 + (i % 5) * 0.18, 0.79, 0.62 + Math.floor(i / 5) * 0.2); c.rotation.set(-Math.PI / 2, 0, Math.sin(i * 1.7) * 0.2); });
      const w = Math.sin(lt * 14) * 0.03; h.reach('R', V(0.12 + w, 0.86, 0.68)); h.reach('L', V(-0.25, 0.84, 0.7));
      h.face(lt < 3.5 ? { lid: 0.45, look: [0, -0.9], mouth: 'flat', brow: 0.4 } : { lid: 0.3, brow: -0.8, look: [0, 0], mouth: 'o', open: 0.4 }); h.head.rotation.x = lt < 3.5 ? 0.3 : 0;
    } },
  // 13) the network comes back: a flood of notifications
  { sc: 'st', say: ['bad'], pal: ['#ff5a4f', '#ffe3df', '#ffd23a'], show: ['bubs', 'wifi'], hud: ['通知', '999+'], hudColor: YEL,
    cam: { p0: [0, 1.45, 4.4], p1: [0, 1.4, 4.0], l0: [0, 1.3, 0] }, shake: [[1.2, 0.04, 1.5]],
    sfx: [[1.1, 'phone_vibe', -9], [1.2, 'comic_surprise', -11], [1.6, 'phone_vibe', -10]],
    stamps: [{ t: 1.2, text: 'ブブブブッ!!', x: 320, y: 1120, rot: -8, color: YEL, size: 104, dur: 1.4 }],
    tags(lt) { if (lt < 1.4) return []; const p = scr(S, S.P.phone.position, 200, -120); return [{ t: 1.4, text: '999+', x: p[0], y: p[1], h: 96, bg: RED, fg: '#ffffff' }]; },
    act(lt, s) {
      const h = s.hero.userData, it = s.P.bubs.userData.items, f = Math.max(0, lt - 1.1);
      s.P.wifi.visible = true; s.P.wifi.userData.x.visible = lt < 1.0;
      const p = V(-0.2 + (f > 0 ? Math.sin(lt * 60) * 0.01 : 0), 1.0, 0.6); holdPhone(s, 'L', p, s.hero, -0.3); h.arm('R', 0.2, 0.5, 0.6);
      it.forEach((b, i) => { const u = f * 1.6 - i * 0.18; b.visible = u > 0; b.position.set(-0.2 + Math.sin(i * 2.4) * 0.35, 1.15 + u * 0.5, 0.55 - i * 0.03); b.rotation.z = Math.sin(i * 1.3) * 0.2; });
      h.face(f > 0 ? { lid: 0, brow: -1, browY: 1, look: [0, 0.6], mouth: 'o', open: 1 } : { lid: 0.2, look: [0.6, 0.6], mouth: 'smile' });
    } },
  // 14) question
  { sc: 'st', say: ['cta'], pal: HOOK, show: ['wifi', 'plane'],
    cam: { p0: [0, 1.5, 4.2], p1: [0, 1.5, 3.9], l0: [0, 1.36, 0] },
    sfx: [[0.0, 'question', -11], [1.25, 'text_pa', -11], [1.45, 'text_pa', -11], [2.2, 'end_kira', -11]],
    tags(lt) { const t0 = this.lt.cta + 1.15; return lt > t0 ? [{ t: t0, text: 'ほしい', x: 320, y: 520, h: 124, bg: CY }, { t: t0 + 0.2, text: 'むり', x: 690, y: 520, h: 124, bg: '#ffffff' }, { t: t0 + 0.9, text: 'コメントで教えて', x: 510, y: 660, h: 70, bg: INK, fg: '#ffffff' }] : []; },
    act(lt, s) {
      const h = s.hero.userData, pl = s.P.plane, p = V(0.05, 1.22, 0.45);
      s.hero.position.set(-0.2, 0, 0.1); wifiOff(s, lt, false);
      pl.position.copy(p); pl.rotation.set(0, -0.4, 0.1); h.reach('R', p.clone().add(V(-0.05, -0.04, -0.02))); h.arm('L', 0.05, 0.15, 0.2);
      h.face({ lid: 0.3, brow: 0.5, look: [0.4, 0], mouth: 'smile' }); h.head.rotation.set(0, 0.15, Math.sin(lt * 1.6) * 0.08);
    } },
];

const T = narrate(voice, plan);
const at = (id) => T.narr.find(n => n.id === id).t0;
run({
  pop: true, title: ['もしもネットが', '[丸1日]止まったら？'], titleStart: T.shots[1].s, titleEnd: T.shots[2].s, hud: ['ネット', '停止中'], hudColor: RED,
  shots: T.shots, narr: T.narr, voice: T.voice, cues: T.cues,
  music: { style: 'pop', twist: at('but') - 0.1, cta: at('cta') - 0.1 },
  scenes: { st: () => { const st = buildToyStage(); S = st.api; addProps(S); return st; } },
});
