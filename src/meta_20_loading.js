/* ===== 로딩 화면 / 타이틀 ===== */
function atlasDraw(c, id, row, frame, x, y, hpx, alpha) {
  const A = ATL[id]; if (!A || !artOk(A.img)) return false; const m = A.m, s = hpx / m.th;
  c.save(); c.globalAlpha = alpha === undefined ? 1 : alpha; c.drawImage(A.img, clamp(frame | 0, 0, 5) * m.cw, row * m.ch, m.cw, m.ch, x - m.ax * s, y - m.ay * s, m.cw * s, m.ch * s); c.restore(); return true;
}
function titleLogo(scale) {
  return h('div', { style: 'display:flex;flex-direction:column;align-items:center' },
    h('div', { html: logoSVG(Math.round(240 * (scale || 1))), style: 'filter:drop-shadow(0 8px 0 rgba(0,0,0,.35))' }),
    h('div', { class: 'ts', style: `font-size:${Math.round(52 * (scale || 1))}px;color:#ffd23a;letter-spacing:2px;margin-top:-6px;-webkit-text-stroke:0;text-shadow:-3px -3px 0 #14101c,3px -3px 0 #14101c,-3px 3px 0 #14101c,3px 3px 0 #14101c,0 7px 0 #7a4a08,0 10px 0 #14101c` }, CONFIG.GAME_TITLE));
}
const Loading = {
  build() {
    const el = SM.reg('loading', h('div', { class: 'bgdia' }));
    for (let i = 0; i < 16; i++) el.append(h('i', { class: 'sparkle', style: `left:${Math.random() * 540}px;top:${500 + Math.random() * 500}px;animation-delay:${-Math.random() * 6}s;animation-duration:${4 + Math.random() * 4}s;width:${3 + Math.random() * 5}px;height:${3 + Math.random() * 5}px` }));
    this.logo = h('div', { class: 'logo' }, titleLogo(1)); el.append(this.logo);
    this.tip = h('div', { class: 'abs small ts2', style: 'left:30px;right:30px;top:690px;text-align:center;font-size:15px;color:#cfe0ff;opacity:.85;min-height:40px' });
    this.step = h('div', { class: 'abs ts', style: 'left:20px;right:20px;top:748px;text-align:center;font-size:20px' });
    this.pct = h('b', { class: 'abs ts2', style: 'left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:18px' }, '0%');
    this.fill = h('i', { style: 'width:0%' });
    this.runner = h('canvas', { class: 'runner', width: 128, height: 128, style: 'left:50px' });
    this.bar = h('div', { class: 'loadbar' }, this.fill, this.pct); this.bar.style.zIndex = 2;
    this.tap = h('div', { class: 'abs ts blink hidden', style: 'left:0;right:0;top:748px;text-align:center;font-size:30px;color:#fff' }, '탭하여 시작');
    el.append(this.tip, this.step, this.runner, this.bar, this.tap, h('div', { class: 'abs small', style: 'left:0;right:0;bottom:20px;text-align:center;opacity:.5' }, 'v2.0 · personal build'));
    return el;
  },
  async run(done) {
    SM.go('loading'); const R = this.runner.getContext('2d'), fast = S().set.fast, F = fast ? 0.08 : Math.max(0.05, CONFIG.LOADING_SPEED);
    let tipI = ri(0, CONFIG.TIPS.length - 1); this.tip.textContent = '팁: ' + CONFIG.TIPS[tipI];
    const tipT = setInterval(() => { tipI = (tipI + 1) % CONFIG.TIPS.length; this.tip.textContent = '팁: ' + CONFIG.TIPS[tipI]; }, 4000);
    let prog = 0, target = 0, hold = 0, last = performance.now(), run = true;
    const loop = t => {
      if (!run) return; const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (hold > 0) hold -= dt; else prog += (target - prog) * Math.min(1, dt * 6) + (target > prog ? dt * 0.02 : 0);
      prog = Math.min(prog, target); const pc = Math.min(100, Math.round(prog * 100));
      this.fill.style.width = Math.max(3, prog * 100) + '%'; this.pct.textContent = pc + '%';
      const bx = 54 + (540 - 108) * prog; this.runner.style.left = bx + 'px';
      R.clearRect(0, 0, 128, 128); if (!atlasDraw(R, 'hog', 0, Math.floor(t / 70) % 6, 64, 110, 100)) { R.fillStyle = '#ffd23a'; R.fillRect(40, 40, 40, 60); }
      requestAnimationFrame(loop);
    }; requestAnimationFrame(loop);
    const wait = ms => new Promise(r => setTimeout(r, ms * 1000));
    const dec = imgs => Promise.all(imgs.map(i => (i && i.decode ? i.decode().catch(() => { }) : Promise.resolve())));
    const steps = [
      async () => { await wait(rnd(0.4, 0.9) * F); },
      async () => { await dec(Object.values(ATL).map(a => a.img)); await wait(rnd(0.3, 0.7) * F); },
      async () => { await dec(Object.values(ART.cards)); CARDS.forEach(id => artGray(id)); await wait(rnd(0.3, 0.7) * F); },
      async () => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); for (const id in ATL) for (let r = 0; r < 4; r++) for (let f = 0; f < 6; f++) atlasDraw(c, id, r, f, 32, 60, 40); await wait(rnd(0.3, 0.7) * F); },
      async () => { await dec([ART.bg, ...Object.values(ART.towers).map(t => t.img)]); await wait(rnd(0.3, 0.7) * F); },
      async () => { await wait(rnd(0.3, 0.6) * F); },
      async () => { await new Promise(r => { let fin = false; const f = () => { if (!fin) { fin = true; r(); } }; Music.preload(f); setTimeout(f, fast ? 600 : 7000); }); await wait(rnd(0.2, 0.5) * F); },
      async () => { await wait(rnd(0.3, 0.7) * F); },
      async () => { await wait(rnd(0.3, 0.7) * F); },
      async () => { await wait(rnd(0.3, 0.5) * F); }
    ];
    for (let i = 0; i < steps.length; i++) {
      this.step.textContent = CONFIG.LOAD_STEPS[i];
      const seg0 = i / steps.length, seg1 = (i + 1) / steps.length; target = seg0 + (seg1 - seg0) * rnd(0.25, 0.6);
      if (Math.random() < 0.3) hold = rnd(0.15, 0.45) * Math.min(1, F);
      const p = steps[i](); await p; target = seg1; if (i === steps.length - 2 || Math.random() < 0.3) await wait(rnd(0.1, 0.25) * Math.min(1, F));
    }
    target = 1; await wait(0.35 * Math.min(1, F + 0.2)); prog = 1; run = false; clearInterval(tipT);
    this.fill.style.width = '100%'; this.pct.textContent = '100%'; this.runner.style.left = '486px'; this.step.textContent = CONFIG.LOAD_STEPS[9];
    await wait(0.4 * Math.min(1, F + 0.2)); this.tap.classList.remove('hidden'); this.step.classList.add('hidden'); this.bar.style.opacity = .35;
    const el = SM.map.loading;
    const go = () => { el.removeEventListener('pointerdown', go); game.sfx.unlock(); Music.unlock(); sfx('go'); this.tap.classList.add('hidden'); done(); };
    el.addEventListener('pointerdown', go);
  }
};
const Title = {
  build() { const el = SM.reg('title', h('div', { class: 'bgdia' })); this.el = el; return el; },
  play(done) {
    this.el.innerHTML = ''; const lg = h('div', { style: 'animation:vsb .7s ease-out' }, titleLogo(1.25)); this.el.append(h('div', { class: 'fill center' }, lg), h('div', { class: 'abs', style: 'inset:0;background:radial-gradient(circle,rgba(255,255,255,.85),rgba(255,255,255,0) 60%);animation:fo 1s forwards' }));
    SM.go('title'); sfx('stamp'); setTimeout(done, 1300);
  }
};
