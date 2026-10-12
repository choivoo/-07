/* 홍보 영상 녹화: 실제 게임 화면을 CDP 스크린캐스트로 캡처 + 효과음 이벤트 로그/오프라인 렌더
   사용: node tools/promo/record.js <출력폴더>     (이후 python3 tools/promo/mix.py <출력폴더>) */
const { chromium } = require('playwright'); const fs = require('fs');
const OUT = process.argv[2] || '/tmp/promo'; fs.mkdirSync(OUT + '/frames', { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const nowS = () => Date.now() / 1000;
const SAVE = () => ({
  v: 1, name: '호그마스터', xp: 640, level: 9, gold: 18418, gems: 547, trophies: 1851, best: 1851,
  cards: { hog: { lv: 6, n: 100 }, musketeer: { lv: 5, n: 50 }, icegolem: { lv: 4, n: 20 }, icespirit: { lv: 5, n: 31 }, skeletons: { lv: 6, n: 64 }, cannon: { lv: 5, n: 12 }, fireball: { lv: 5, n: 44 }, log: { lv: 3, n: 5 } },
  chests: [{ type: 'gold', state: 'locked' }, { type: 'silver', state: 'unlocking', end: Date.now() + 2400000 }, { type: 'magic', state: 'ready' }, null],
  freeAt: 0, crown: { n: 7 }, boost: { gold: Date.now() + 3000000, crown: 0, speed: 0 }, tut: { done: true, step: 3, rewarded: true },
  set: { fast: false, diff: 'normal', sfx: 1, music: 0.7, muted: false, vibrate: false, fps: false, devScale: 1 },
  stats: { battles: 34, wins: 21, towers: 63, played: 480, crowns: 52, spells: 77 },
  history: [{ foe: '불꽃호그21', win: 1, crowns: [3, 1], dt: 31, mode: '래더', date: '10/12 21:40' }, { foe: '얼음왕자', win: 1, crowns: [2, 0], dt: 28, mode: '래더', date: '10/12 21:32' }, { foe: '마스터K', win: 0, crowns: [1, 2], dt: -26, mode: '래더', date: '10/12 21:20' }, { foe: '해골대장', win: 1, crowns: [1, 0], dt: 30, mode: '엘릭서 2배', date: '10/12 20:58' }]
});
const PROMO_JS = `(() => {
  const ui = document.getElementById('ui'); const layer = document.createElement('div'); layer.id = 'promo'; layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:90'; ui.append(layer);
  const st = document.createElement('style'); st.textContent = '.pcap{position:absolute;left:14px;right:14px;text-align:center;font-weight:900;color:#fff;font-size:46px;line-height:1.15;letter-spacing:1px;text-shadow:-3px -3px 0 #14101c,3px -3px 0 #14101c,-3px 3px 0 #14101c,3px 3px 0 #14101c,0 6px 0 #14101c;animation:pcap var(--d) ease forwards}@keyframes pcap{0%{opacity:0;transform:scale(.5) translateY(24px)}7%{opacity:1;transform:scale(1.14)}13%{transform:scale(1)}88%{opacity:1}100%{opacity:0;transform:translateY(-16px)}}.pcap em{color:#ffd23a;font-style:normal}.pfull{position:absolute;inset:0;opacity:0;transition:opacity .6s}';
  document.head.append(st);
  window.Promo = {
    cap(t, o) { o = o || {}; const e = document.createElement('div'); e.className = 'pcap'; e.innerHTML = t; e.style.top = (o.y === undefined ? 120 : o.y) + 'px'; e.style.fontSize = (o.size || 46) + 'px'; e.style.setProperty('--d', (o.dur || 2400) + 'ms'); layer.append(e); setTimeout(() => e.remove(), (o.dur || 2400) + 100); },
    fade(color, ms, to) { let f = document.getElementById('pfade'); if (!f) { f = document.createElement('div'); f.id = 'pfade'; f.className = 'pfull'; f.style.background = color; layer.append(f); } f.style.background = color; f.style.transition = 'opacity ' + (ms || 600) + 'ms'; void f.offsetWidth; f.style.opacity = to === undefined ? 1 : to; },
    outro() { const d = document.createElement('div'); d.className = 'pfull bgdia'; d.style.cssText += ';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;background-color:#1d4f9c;width:540px;white-space:nowrap;text-align:center'; d.append(titleLogo(1.1)); const t = document.createElement('div'); t.className = 'pcap'; t.style.cssText = 'position:relative;left:auto;right:auto;animation:none;font-size:48px;opacity:1'; t.innerHTML = '지금 <em>도전</em>하세요!'; d.append(t); const s = document.createElement('div'); s.style.cssText = 'font-size:20px;opacity:.75;text-shadow:0 2px 0 #14101c'; s.textContent = '실시간 1:1 타워 디펜스 카드 게임'; d.append(s); layer.append(d); void d.offsetWidth; d.style.opacity = 1; }
  };
  window.__sfx = []; const sp = game.sfx.play.bind(game.sfx);
  game.sfx.play = (n, o) => { window.__sfx.push([Date.now() / 1000, n, o && typeof o === 'object' ? { x: o.x, pan: o.pan } : (typeof o === 'number' ? { x: o } : null)]); return sp(n, o); };
})()`;
const RENDER_SFX = `async ({ events, t0, dur }) => {
  const SR = 44100, off = new OfflineAudioContext(2, Math.ceil(SR * dur), SR); let curT = 0;
  const ctx = new Proxy(off, { get(t, k) { if (k === 'currentTime') return curT; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
  const s = new Sfx(); s.ctx = off; s.muted = false;
  s.master = off.createGain(); s.master.gain.value = 0.9; s.comp = off.createDynamicsCompressor(); s.comp.threshold.value = -16; s.comp.knee.value = 12; s.comp.ratio.value = 5; s.comp.attack.value = 0.003; s.comp.release.value = 0.22;
  s.master.connect(s.comp); s.comp.connect(off.destination);
  const n = SR; s.nbuf = off.createBuffer(1, n, SR); const d = s.nbuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const len = Math.floor(SR * 1.4), ib = off.createBuffer(2, len, SR); for (let ch = 0; ch < 2; ch++) { const dd = ib.getChannelData(ch); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  s.rev = off.createConvolver(); s.rev.buffer = ib; s.revG = off.createGain(); s.revG.gain.value = 0.32; s.rev.connect(s.revG); s.revG.connect(s.master);
  s.ctx = ctx; const gap = { hit: 35, shoot: 40, arrow: 45, click: 20 }, lastT = {}; let played = 0;
  for (const [t, name, o] of events) {
    const tt = t - t0; if (tt < 0 || tt > dur - 0.2) continue; const g = gap[name] || 30; if (lastT[name] !== undefined && (tt - lastT[name]) * 1000 < g) continue; lastT[name] = tt;
    curT = tt; s.last = {}; try { s.play(name, o || undefined); played++; } catch (e) { }
  }
  const buf = await off.startRendering(); const L = buf.getChannelData(0), R = buf.getChannelData(1), N = L.length, bytes = new Uint8Array(44 + N * 4), dv = new DataView(bytes.buffer);
  const w = (o, str) => { for (let i = 0; i < str.length; i++) dv.setUint8(o + i, str.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + N * 4, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, SR, true); dv.setUint32(28, SR * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, N * 4, true);
  for (let i = 0; i < N; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  const blob = new Blob([bytes], { type: 'audio/wav' }); const fr = new FileReader(); const p = new Promise(r => fr.onload = () => r(fr.result.split(',')[1])); fr.readAsDataURL(blob); return { b64: await p, played };
}`;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const save = SAVE();
  await p.addInitScript(s => { localStorage.setItem('hrAccess', '7643671449121499'); localStorage.setItem('clashArenaSave_v1', JSON.stringify(s)); }, save);
  const cdp = await ctx.newCDPSession(p); const frames = []; let idx = 0;
  cdp.on('Page.screencastFrame', async f => { const fn = `${OUT}/frames/f${String(idx++).padStart(6, '0')}.jpg`; fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push([fn, f.metadata.timestamp]); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) { } });
  const markers = {}; const mark = n => { markers[n] = nowS(); console.log('[mark]', n, (nowS() - (markers.t0 || nowS())).toFixed(1)); };
  const ev = (fn, arg) => p.evaluate(fn, arg); const cap = (t, o) => ev(([t, o]) => Promo.cap(t, o), [t, o]);
  const click = (x, y) => p.mouse.click(x * 2, y * 2);
  async function drag(x0, y0, x1, y1, ms) { ms = ms || 800; const n = Math.round(ms / 30); await p.mouse.move(x0 * 2, y0 * 2); await p.mouse.down(); for (let i = 1; i <= n; i++) { const k = i / n, e = k * k * (3 - 2 * k); await p.mouse.move((x0 + (x1 - x0) * e) * 2, (y0 + (y1 - y0) * e) * 2); await sleep(30); } await sleep(150); await p.mouse.up(); }
  const waitFor = (fn, to) => p.waitForFunction(fn, null, { timeout: to || 30000 }).catch(() => { });
  async function playCard(id, tx, ty, ms) {
    const info = await ev(i => { game.elixir = 10; const sl = game.hand.slotOf(i); return { sl, x0: UI.cardX0 + sl * (UI.cardW + UI.cardGap) + UI.cardW / 2, y0: UI.cardY + UI.cardH / 2 }; }, id);
    if (info.sl < 0) { console.log('card not in hand:', id); return false; }
    await drag(info.x0, info.y0, 54 + tx * 24, 44 + ty * 24, ms || 800); return true;
  }

  // ---------- 장면 1: 로딩 ----------
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await p.goto('file:///home/user/-07/index.html?speed=0.5');
  await p.waitForSelector('.loadbar'); await ev(PROMO_JS.replace(/^\(\(\) => \{/, '(() => {'));
  markers.t0 = nowS(); mark('load');
  await sleep(500); await cap('실시간 <em>1:1</em> 타워 디펜스', { y: 190, dur: 3000, size: 50 });
  await waitFor(() => { const t = [...document.querySelectorAll('#screens .abs.blink')].find(e => e.textContent.includes('탭하여') && !e.classList.contains('hidden')); return !!t; }, 40000);
  await sleep(500); await click(270, 600); mark('tap');
  await waitFor(() => SM.cur === 'home', 20000); await sleep(600); mark('home');
  // ---------- 장면 2: 홈 투어 ----------
  await cap('아레나를 오르고, <em>상자</em>를 모아라!', { y: 150, dur: 2800 }); await sleep(3000);
  const tab = async i => { await click([40, 150, 270, 400, 500][i], 915); await sleep(500); };
  await tab(1); await cap('8장의 덱 · <em>카드 레벨업</em>', { y: 100, dur: 2400, size: 44 }); await sleep(1000);
  await ev(() => { document.querySelectorAll('.track .page')[1].scrollTo({ top: 640, behavior: 'smooth' }); }); await sleep(1300); await ev(() => { document.querySelectorAll('.track .page')[1].scrollTo({ top: 0, behavior: 'smooth' }); }); await sleep(300);
  await tab(0); await cap('상점 · 부스터 · <em>일일 특가</em>', { y: 100, dur: 2200, size: 42 }); await sleep(500);
  await ev(() => { const pg = document.querySelector('.track .page'); pg.scrollTo({ top: 560, behavior: 'smooth' }); }); await sleep(1500);
  await tab(3); await cap('클랜 채팅 · <em>친선전</em>', { y: 100, dur: 2000 }); await sleep(1900);
  await tab(4); await cap('<em>도전</em> 모드 · 리플레이', { y: 100, dur: 2000 }); await sleep(1900);
  await tab(2); await sleep(600);
  // ---------- 장면 3: 매칭 + 전투 ----------
  await ev(() => { const o = Meta.findMatch.bind(Meta); Meta.findMatch = c => o(Object.assign({}, c, { opts: { fixedHand: true, deck: ['icegolem', 'musketeer', 'hog', 'fireball', 'skeletons', 'log', 'icespirit', 'cannon'] } })); });
  await cap('<em>3분</em> 실시간 대결!', { y: 190, dur: 2600 }); await click(270, 615); mark('match');
  await waitFor(() => game.state === 'play', 30000); await sleep(300); mark('battle'); const bt0 = Date.now();
  const at = async s => { const d = s * 1000 - (Date.now() - bt0); if (d > 0) await sleep(d); };
  await cap('카드를 끌어서 <em>배치!</em>', { y: 520, dur: 2600 });
  await at(0.8); await playCard('icegolem', 3.5, 26.5);
  await at(3.0); await playCard('musketeer', 8.5, 27);
  await at(5.5); await cap('<em>호그라이더</em> 돌진!', { y: 520, dur: 2400 }); await playCard('hog', 3.5, 19.3);
  await at(9.0); await ev(() => { game.deploy(1, 'skeletons', 9.5, 10.5); game.deploy(1, 'icespirit', 8.3, 11.3); game.deploy(1, 'musketeer', 10.5, 9.6); game.deploy(1, 'skeletons', 7.5, 10.2); });
  await at(13.0); await cap('<em>파이어볼</em> 한 방!', { y: 520, dur: 2300 });
  const c1 = await ev(() => { const f = game.ents.filter(e => e.team === 1 && e.isUnit && !e.dead); if (!f.length) return { x: 9, y: 13 }; return { x: f.reduce((a, e) => a + e.x, 0) / f.length, y: f.reduce((a, e) => a + e.y, 0) / f.length }; });
  await playCard('fireball', c1.x, c1.y, 900);
  await at(16.5); await ev(() => { game.deploy(1, 'skeletons', 8.2, 12.2); game.deploy(1, 'skeletons', 9.8, 12.8); game.deploy(1, 'icespirit', 9.0, 12.0); });
  await at(19.0); await cap('<em>통나무</em>로 쓸어버려!', { y: 520, dur: 2300 }); await playCard('log', 9, 19.5, 800);
  await at(22.5); await ev(() => { game.clock = 61; game.towers[1].pl.hp = Math.min(game.towers[1].pl.hp, 900); game.towers[1].pr.hp = Math.min(game.towers[1].pr.hp, 900); }); mark('double');
  await at(23.5); await cap('마지막 1분 · <em>엘릭서 2배!</em>', { y: 520, dur: 2600, size: 42 });
  await at(25.0); await playCard('skeletons', 14.5, 21.5, 700);
  await at(26.8); await playCard('icespirit', 14.5, 20.5, 700);
  await at(28.5); await playCard('hog', 14.5, 19.5, 800); await cap('<em>타워</em>를 부숴라!', { y: 520, dur: 2300 });
  let crowned = false; const tEnd = 41;
  for (; ;) {
    const st = await ev(() => ({ s: game.state, c: game.crowns.slice(), ending: !!game.ending })); if (st.s === 'over' || st.ending) break;
    if (!crowned && st.c[0] >= 1) { crowned = true; await cap('<em>크라운</em> 획득!', { y: 520, dur: 2000 }); await ev(() => { game.towers[1].k.hp = Math.min(game.towers[1].k.hp, 700); game.towers[1].pl.hp = Math.min(game.towers[1].pl.hp, 400); game.towers[1].pr.hp = Math.min(game.towers[1].pr.hp, 400); }); }
    if (Date.now() - bt0 > tEnd * 1000) { await ev(() => { game.towers[1].pl.hit(99999, game, { id: 'hog' }); game.towers[1].pr.hit(99999, game, { id: 'hog' }); game.towers[1].k.hit(99999, game, { id: 'hog' }); }); break; }
    await sleep(250);
  }
  await sleep(600); await cap('<em>3크라운</em> 승리!', { y: 520, dur: 2600, size: 54 });
  await waitFor(() => SM.cur === 'result', 15000); mark('result');
  await sleep(500); await cap('트로피 · 골드 · <em>상자</em> 획득', { y: 880, dur: 3000, size: 40 });
  await waitFor(() => [...document.querySelectorAll('#screens button')].some(b => b.textContent.trim() === '확인' && getComputedStyle(b).opacity === '1'), 15000); await sleep(1500);
  await ev(() => { [...document.querySelectorAll('#screens button')].find(b => b.textContent.trim() === '확인').click(); });
  await waitFor(() => SM.cur === 'home', 10000); await sleep(1200);
  // ---------- 장면 4: 상자 열기 ----------
  mark('chest');
  await ev(() => { Chests.reward = type => ({ gold: 1280, gems: 12, cards: [{ id: 'hog', n: 24 }, { id: 'fireball', n: 14 }, { id: 'skeletons', n: 40 }, { id: 'log', n: 3 }], xp: 100 }); });
  await cap('상자를 열어 <em>전설 카드</em>를 노려라!', { y: 150, dur: 3200, size: 40 });
  const slotC = await ev(() => { const r = document.querySelectorAll('.slot')[2].getBoundingClientRect(); const u = document.getElementById('ui').getBoundingClientRect(), k = u.width / 540; return { x: (r.left + r.width / 2 - u.left) / k, y: (r.top + r.height / 2 - u.top) / k }; });
  await sleep(900); await click(slotC.x, slotC.y); await sleep(1500);
  for (let i = 0; i < 6; i++) { await click(270, 480); await sleep(360); }
  const hasText = t => p.waitForFunction(t => [...document.querySelectorAll('#modals .abs')].some(e => e.textContent.includes(t)), t, { timeout: 25000 }).catch(() => { });
  await hasText('탭하여 카드 보기'); await sleep(300); await click(270, 480);
  await waitFor(() => document.querySelectorAll('.cflip').length > 0, 8000); await sleep(1300);
  const flipN = await ev(() => document.querySelectorAll('.cflip').length);
  for (let i = 0; i < flipN; i++) {
    const r = await ev(i => { const e = document.querySelectorAll('.cflip')[i]; const b = e.getBoundingClientRect(), u = document.getElementById('ui').getBoundingClientRect(), k = u.width / 540; return { x: (b.left + b.width / 2 - u.left) / k, y: (b.top + b.height / 2 - u.top) / k }; }, i);
    await click(r.x, r.y); await sleep(i === flipN - 1 ? 600 : 1000);
  }
  await hasText('탭하여 계속'); await sleep(900); await click(270, 480); await sleep(1500);
  const btn = t => p.waitForFunction(t => [...document.querySelectorAll('#modals button')].some(b => b.textContent.trim() === t), t, { timeout: 20000 }).catch(() => { });
  await btn('계속'); await sleep(600); await ev(() => { [...document.querySelectorAll('#modals button')].find(b => b.textContent.trim() === '계속').click(); }); await sleep(2600);
  await btn('확인'); await ev(() => { [...document.querySelectorAll('#modals button')].find(b => b.textContent.trim() === '확인').click(); }); await sleep(1600);
  // ---------- 장면 5: 몽타주 ----------
  mark('montage');
  await tab(1); await sleep(700); await cap('카드 <em>업그레이드</em>', { y: 100, dur: 2200 });
  await ev(() => { const e = document.querySelector('.cardc[data-id="hog"][data-deck]'); const r = e.getBoundingClientRect(); window.__r = r; e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + 20, clientY: r.top + 20 })); window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: r.left + 20, clientY: r.top + 20 })); });
  await sleep(1800); await ev(() => { const bn = document.querySelector('#modals .modal .btn.g'); if (bn) bn.click(); }); await sleep(1600);
  await ev(() => { document.querySelectorAll('#modals .mback').forEach(m => m.remove()); }); await tab(2); await sleep(500);
  await click(40, 390); await cap('<em>트로피 로드</em>', { y: 100, dur: 2000 }); await sleep(2000); await ev(() => { document.querySelectorAll('#modals .mback').forEach(m => m.remove()); });
  await cap('<em>7개</em>의 아레나', { y: 100, dur: 2200 }); await ev(() => { ArenaUnlock.show(CONFIG.ARENAS[6], () => { }); }); await sleep(2600);
  // ---------- 장면 6: 아웃트로 ----------
  mark('outro'); await ev(() => { Promo.outro(); }); await sleep(5500); mark('end');
  await cdp.send('Page.stopScreencast'); await sleep(500);
  // 효과음 오프라인 렌더
  const events = await ev(() => window.__sfx); const t0 = markers.t0, dur = markers.end - t0 + 1;
  fs.writeFileSync(OUT + '/frames.json', JSON.stringify(frames)); fs.writeFileSync(OUT + '/markers.json', JSON.stringify(markers)); fs.writeFileSync(OUT + '/sfx_events.json', JSON.stringify(events));
  const r2 = await p.evaluate(`(${RENDER_SFX})(${JSON.stringify({ events, t0, dur })})`).catch(e => { console.log('render err', e.message); return null; });
  if (r2) { fs.writeFileSync(OUT + '/sfx.wav', Buffer.from(r2.b64, 'base64')); console.log('sfx played', r2.played, 'of', events.length); }
  console.log('frames', frames.length, 'errs', errs.slice(0, 3)); await b.close();
})();
