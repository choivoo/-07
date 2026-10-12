/* ===== 글루: 부팅 / 매칭 / 전투 연결 / 결과 처리 ===== */
const Meta = {
  home: null, fpsEl: null,
  boot() {
    Save.load(); const set = S().set;
    game.sfx.setVol(set.sfx); Music.setVol(set.music); this.applyMute();
    Loading.build(); Title.build(); Home.build(); this.home = Home; Result.build(); this.buildMatch();
    this.fpsEl = h('div', { class: 'fps' }); $('#ui').append(this.fpsEl); this.applyFps();
    let last = performance.now(), acc = 0, n = 0; const loop = t => { const dt = Math.min(0.1, (t - last) / 1000); last = t; Music.update(dt); acc += dt; n++; if (acc >= 0.5) { this.fpsEl.textContent = Math.round(n / acc) + ' fps'; acc = 0; n = 0; } requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    document.addEventListener('pointerdown', () => { game.sfx.unlock(); Music.unlock(); }, true);
    Loading.run(() => Title.play(() => {
      Music.play('menu');
      if (!S().tut.done) Tutorial.start(); else { SM.go('home'); }
    }));
  },
  applyMute() { const m = !!S().set.muted; game.sfx.setMuted(m); Music.setMuted(m); },
  applyFps() { if (this.fpsEl) this.fpsEl.style.display = S().set.fps ? 'block' : 'none'; },
  tick() { },
  showCanvas(on) { cv.style.visibility = on ? 'visible' : 'hidden'; },
  /* --- 매칭 / VS --- */
  buildMatch() { this.matchEl = SM.reg('match', h('div', { class: 'bgdia' })); },
  findMatch(ctx) {
    ctx = ctx || {}; ctx.mode = ctx.mode || 'ladder'; const s = S();
    ctx.foe = ctx.foe || { name: pick(CONFIG.FOES) + ri(1, 99), trophies: Math.max(0, s.trophies + ri(-100, 100)) };
    const el = this.matchEl; el.innerHTML = ''; SM.go('match'); Music.play('battle', { fade: 2, force: true });
    el.append(h('div', { class: 'abs ts', style: 'left:0;right:0;top:360px;text-align:center;font-size:30px' }, '상대를 찾는 중...'), h('div', { class: 'abs center', style: 'left:0;right:0;top:430px' }, h('div', { class: 'spinner' })));
    const t = setTimeout(() => {
      el.innerHTML = ''; sfx('match');
      el.append(h('div', { class: 'abs ts', style: 'left:0;right:0;top:230px;text-align:center;font-size:34px;color:#ffd23a' }, ctx.mode === 'friendly' ? '친선전' : ctx.mode.startsWith('ev_') ? '도전 모드' : '아레나 ' + trophyArena(s.trophies).id),
        h('div', { class: 'vsrow' }, h('div', { class: 'vscard me' }, h('div', { html: kingSVG(86) }), h('b', { class: 'ts', style: 'font-size:22px' }, s.name), h('div', { class: 'ts2 gold row jc gap4', style: 'margin-top:4px' }, ic('trophy', 22), fmt(s.trophies))), h('div', { class: 'col', style: 'align-items:center;position:relative;width:70px' }, h('div', { html: ICONS.swords(92), style: 'animation:vsb .7s ease-out;display:flex' }), h('div', { class: 'vsx ts', style: 'font-size:46px;margin-top:-6px' }, 'VS')),
          h('div', { class: 'vscard foe' }, h('div', { html: kingSVG(86).replace('#3b8cff', '#d6322a') }), h('b', { class: 'ts', style: 'font-size:22px' }, ctx.foe.name), h('div', { class: 'ts2 gold row jc gap4', style: 'margin-top:4px' }, ic('trophy', 22), fmt(ctx.foe.trophies)))));
      const sw = h('div', { class: 'abs', style: 'left:200px;top:500px;width:140px;height:20px', html: '' }); el.append(sw); sfx('stamp');
      setTimeout(() => this.startBattle(ctx), 1900);
    }, 2200 + Math.random() * 600);
  },
  /* --- 전투 --- */
  startBattle(ctx) {
    ctx = ctx || {}; const s = S(), deck = (ctx.deck || s.decks[s.deck]).slice(), levels = {}; CARDS.forEach(id => levels[id] = ctx.tutorial ? 1 : s.cards[id].lv);
    SM.hideAll(); this.showCanvas(true);
    const lvl = ctx.tutorial ? 1 : avgLevel();
    const opts = Object.assign({ arenaId: ctx.tutorial ? 1 : trophyArena(s.trophies).id, diff: s.set.diff, deck, levels, aiLevel: lvl, towerLv: lvl, rules: ctx.rules || {}, allowForfeit: !ctx.tutorial,
      onEvent: (t, d) => this.onEvent(t, d, ctx), onState: (n, d) => this.onState(n, d), onEnd: r => this.afterBattle(r, ctx) }, ctx.opts || {});
    game.onMute = () => { S().set.muted = !S().set.muted; Save.save(); this.applyMute(); };
    game.onForfeitRequest = () => { game.paused = true; const m = openModal({ title: '전투 포기', body: h('div', { style: 'text-align:center;font-size:18px;padding:10px 4px;line-height:1.4' }, '포기하면 패배로 처리됩니다.<br>정말 나갈까요?'), buttons: [{ text: '계속 싸우기', cls: 'g' }, { text: '포기', cls: 'r', fn: () => { game.paused = false; game.forfeit(); } }], onClose: () => { game.paused = false; } }); };
    game.onPlay = ctx.onPlay || null; game.start(opts);
    if (ctx.onStart) ctx.onStart(game);
  },
  onEvent(t, d, ctx) { if (!ctx.tutorial) Quests.on(t, d); if (ctx.onEvent) ctx.onEvent(t, d); },
  onState(name, w) {
    if (name === 'play') Music.play(game.double && !game.overtime ? 'x2' : 'battle');
    else if (name === 'double') Music.play('x2'); else if (name === 'overtime') Music.play('overtime');
    else if (name === 'over') Music.play(w === 0 ? 'win' : 'lose', { loop: false, fade: 0.3, out: 0.5, force: true });
  },
  afterBattle(res, ctx) {
    game.stop(); this.showCanvas(false); game.onPlay = null; const s = S(), win = res.winner === 0 ? 1 : res.winner === 1 ? 0 : -1, mode = ctx.mode || 'ladder', oldArena = trophyArena(s.trophies);
    if (ctx.tutorial) { if (ctx.onTutorialEnd) ctx.onTutorialEnd(res, win); return; }
    const info = { win, crowns: res.crowns, foe: ctx.foe || { name: 'AI', trophies: 0 }, mode, dTro: 0, gold: 0, gems: 0, chest: null, chestFull: false, crownAdd: 0, xp: win === 1 ? 30 : win === 0 ? 10 : 15 };
    info.xp += res.crowns[0] * 5;
    const label = { ladder: '래더', friendly: '친선전', ev_double: '엘릭서 2배', ev_sudden: '서든데스', ev_win3: '3연승 도전' }[mode];
    if (mode === 'ladder') {
      info.dTro = win === 1 ? ri(CONFIG.TROPHY_WIN[0], CONFIG.TROPHY_WIN[1]) : win === 0 ? -ri(CONFIG.TROPHY_LOSS[0], CONFIG.TROPHY_LOSS[1]) : 0; if (s.trophies + info.dTro < 0) info.dTro = -s.trophies;
      info.gold = win === 1 ? 60 + res.crowns[0] * 25 : win === 0 ? 15 : 30; if (win === 1 && boostOn('gold')) { info.gold *= 2; info.goldBoost = true; }
      info.crownAdd = res.crowns[0] * (boostOn('crown') ? 2 : 1); info.crownBoost = boostOn('crown') && info.crownAdd > 0; s.crown.n += info.crownAdd;
      if (win === 1) { info.chest = Chests.rollType(); const slot = Chests.give(info.chest); if (slot < 0) info.chestFull = true; else info.chestSlot = slot; }
    } else if (mode === 'ev_double' && win === 1) { info.gold = 150; info.gems = 5; }
    else if (mode === 'ev_sudden' && win === 1) { info.gold = 200; info.gems = 8; }
    else if (mode === 'ev_win3') { const w3 = s.ev.win3; if (win === 1) { w3.w++; info.gold = 50; } else if (win === 0) w3.l++; info.w3done = w3.l >= 3; }
    else if (mode === 'friendly') { s.friendly++; info.gold = 0; }
    s.trophies += info.dTro; s.best = Math.max(s.best, s.trophies); s.gold += info.gold; s.gems += info.gems;
    s.history.unshift({ foe: info.foe.name, win, crowns: res.crowns.slice(), dt: info.dTro, mode: label, date: (d => (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'))(new Date()) }); s.history = s.history.slice(0, 5);
    Quests.battleEnd(win, res.crowns[0]); Eco.xp(info.xp); Save.save();
    const newArena = trophyArena(s.trophies); info.arenaUp = newArena.id > oldArena.id ? newArena : null;
    Result.show(info, () => {
      SM.go('home'); Music.play('menu', { force: true }); Cur.to('gold'); Cur.to('gems'); BattleTab.refresh(); Home.refreshBadges(); Home.refreshLevel(); CardsTab.render();
      if (info.chestSlot !== undefined) { const el = BattleTab.slotsEl.children[info.chestSlot]; if (el) el.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1 }, { transform: 'scale(1)' }], { duration: 600, easing: 'ease-out' }); }
      const after = () => { if (info.w3done) EventsTab.finishWin3(); };
      if (info.arenaUp) setTimeout(() => ArenaUnlock.show(info.arenaUp, after), 450); else after();
    });
  }
};
if (window.__gateOK) Meta.boot(); else window.__onGate = () => Meta.boot();
