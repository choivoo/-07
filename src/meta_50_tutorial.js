/* ===== 튜토리얼 (왕 NPC / 스포트라이트 / 스크립트 연습 전투) ===== */
const rectOf = el => { const r = el.getBoundingClientRect(), u = $('#ui').getBoundingClientRect(), k = u.width / 540; return { x: (r.left - u.left) / k, y: (r.top - u.top) / k, w: r.width / k, h: r.height / k }; };
const Tutorial = {
  aborted: false, built: false, placed: null,
  build() {
    if (this.built) return; this.built = true; const root = this.root = $('#tut');
    this.dim = h('div', { class: 'tdim', style: 'display:none' });
    this.spot = h('div', { class: 'tspot', style: 'display:none' });
    this.blk = [0, 1, 2, 3].map(() => h('div', { class: 'blk', style: 'display:none' }));
    this.ring = h('div', { class: 'tring', style: 'display:none' });
    this.finger = h('div', { class: 'finger', style: 'display:none' }, '👆');
    this.king = h('div', { html: kingSVG(92), class: 'king' });
    this.bubble = h('div', { class: 'bubble' }); this.box = h('div', { class: 'tbox', style: 'display:none' }, this.king, this.bubble);
    this.hintEl = h('div', { class: 'thint ts', style: 'display:none' });
    this.skip = h('button', { class: 'btn gray sm skip', style: 'display:none', onclick: () => { sfx('click'); confirmM('튜토리얼을 건너뛸까요?<br><span class="small">설정에서 언제든 다시 볼 수 있어요</span>', '건너뛰기', () => this.abort(true), 'r'); } }, '건너뛰기');
    root.append(this.dim, this.spot, ...this.blk, this.ring, this.finger, this.box, this.hintEl, this.skip);
  },
  start() { this.build(); this.aborted = false; this.skip.style.display = 'block'; S().tut.step = S().tut.step || 0; this.flow().catch(e => { if (e && e.message !== 'abort') console.error(e); }); },
  restart() { const s = S(); s.tut.done = false; s.tut.step = 0; Save.save(); game.stop(); Meta.showCanvas(false); SM.hideAll(); Music.play('menu'); this.start(); },
  abort(user) {
    this.aborted = true; this.clear(); this.skip.style.display = 'none'; game.stop(); game.lock = null; game.paused = false; Meta.showCanvas(false); S().tut.done = true; Save.save(); SM.go('home'); Music.play('menu', { force: true }); Home.setTab(2, true); BattleTab.refresh();
  },
  chk() { if (this.aborted) throw new Error('abort'); },
  /* ---- 프리미티브 ---- */
  clear() {
    this.dim.style.display = 'none'; this.spot.style.display = 'none'; this.blk.forEach(b => b.style.display = 'none'); this.ring.style.display = 'none'; this.finger.style.display = 'none'; this.box.style.display = 'none'; this.hintEl.style.display = 'none'; this.root.style.display = 'block'; if (this.fa) { this.fa.cancel(); this.fa = null; }
  },
  setSpot(r, o) {   // o.dim:true -> 어둡게 / 구멍 밖 입력 차단
    o = o || {}; if (!r) { this.spot.style.display = 'none'; this.blk.forEach(b => b.style.display = 'none'); this.dim.style.display = o.block ? 'block' : 'none'; this.dim.style.background = o.dim ? 'rgba(4,8,20,.72)' : 'transparent'; return; }
    const p = o.pad === undefined ? 6 : o.pad, x = r.x - p, y = r.y - p, w = r.w + p * 2, hh = r.h + p * 2; this.dim.style.display = 'none';
    Object.assign(this.spot.style, { display: 'block', left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', boxShadow: o.dim === false ? '0 0 16px #ffd23a' : '0 0 0 2000px rgba(4,8,20,.72)' });
    const B = this.blk, set = (b, l, t, ww, h2) => Object.assign(b.style, { display: 'block', left: l + 'px', top: t + 'px', width: ww + 'px', height: h2 + 'px' });
    if (o.noBlock) B.forEach(b => b.style.display = 'none'); else { set(B[0], 0, 0, 540, Math.max(0, y)); set(B[1], 0, y + hh, 540, Math.max(0, 960 - y - hh)); set(B[2], 0, y, Math.max(0, x), hh); set(B[3], x + w, y, Math.max(0, 540 - x - w), hh); }
  },
  async say(text, o) {
    o = o || {}; this.chk(); this.root.style.display = 'block';
    const was = game.active && !game.paused; if (was) game.paused = true;
    this.setSpot(o.spot || null, { dim: o.spot ? undefined : true, block: true, pad: o.pad });
    this.box.style.display = 'flex'; this.box.style.top = o.at === 'bottom' ? 'auto' : (o.y !== undefined ? o.y + 'px' : '70px'); this.box.style.bottom = o.at === 'bottom' ? '110px' : 'auto';
    this.bubble.textContent = ''; let i = 0, done = false; sfx('tab');
    await new Promise(res => {
      const iv = setInterval(() => { if (this.aborted) { clearInterval(iv); return; } i++; this.bubble.textContent = text.slice(0, i); if (i % 3 === 0) sfx('tick'); if (i >= text.length) { done = true; clearInterval(iv); } }, 28);
      const targets = [this.box, this.dim, ...this.blk];
      const tap = () => { if (!done) { done = true; clearInterval(iv); this.bubble.textContent = text; i = text.length; return; } targets.forEach(t => t.removeEventListener('pointerdown', tap)); res(); };
      targets.forEach(t => t.addEventListener('pointerdown', tap));
    });
    this.chk(); this.box.style.display = 'none'; this.setSpot(null); if (was && game.active) game.paused = false;
  },
  hint(text, at) { this.hintEl.textContent = text; this.hintEl.style.display = 'block'; this.hintEl.style.top = at === 'bottom' ? 'auto' : '60px'; this.hintEl.style.bottom = at === 'bottom' ? '240px' : 'auto'; },
  placeRing(x, y, r) { Object.assign(this.ring.style, { display: 'block', left: (x - r) + 'px', top: (y - r) + 'px', width: r * 2 + 'px', height: r * 2 + 'px' }); },
  moveFinger(a, b) {
    this.finger.style.display = 'block'; this.finger.style.left = (a.x - 14) + 'px'; this.finger.style.top = (a.y - 8) + 'px'; if (this.fa) this.fa.cancel();
    this.fa = b ? this.finger.animate([{ transform: 'translate(0,0)', opacity: 0 }, { transform: 'translate(0,0)', opacity: 1, offset: .15 }, { transform: `translate(${b.x - a.x}px,${b.y - a.y}px)`, opacity: 1, offset: .75 }, { transform: `translate(${b.x - a.x}px,${b.y - a.y}px)`, opacity: 0 }], { duration: 1800, iterations: Infinity }) : null;
  },
  async until(cond, o) {
    o = o || {}; this.chk(); this.root.style.display = 'block'; const t0 = performance.now();
    if (o.hint) this.hint(o.hint, o.hintAt); if (o.ring) this.placeRing(o.ring.x, o.ring.y, o.ring.r); if (o.finger) this.moveFinger(o.finger.from, o.finger.to);
    if (o.spot) this.setSpot(typeof o.spot === 'function' ? o.spot() : o.spot, { dim: o.dim, pad: o.pad, noBlock: o.noBlock }); else this.setSpot(null);
    await new Promise(res => {
      const iv = setInterval(() => {
        if (this.aborted) { clearInterval(iv); return; }
        const modal = $('#modals').children.length > 0; if (o.hideOnModal) this.root.style.display = modal ? 'none' : 'block';
        if (o.spot && typeof o.spot === 'function') { const r = o.spot(); if (r) this.setSpot(r, { dim: o.dim, pad: o.pad, noBlock: o.noBlock }); }
        if (cond() || (o.timeout && performance.now() - t0 > o.timeout)) { clearInterval(iv); res(); }
      }, 100);
    });
    this.chk(); this.hintEl.style.display = 'none'; this.ring.style.display = 'none'; this.finger.style.display = 'none'; if (this.fa) { this.fa.cancel(); this.fa = null; } this.setSpot(null); this.root.style.display = 'block';
  },
  /* ---- 전투 연습 ---- */
  cardRect(id) { const sl = game.hand.slotOf(id), x = UI.cardX0 + Math.max(0, sl) * (UI.cardW + UI.cardGap); return { x, y: UI.cardY, w: UI.cardW, h: UI.cardH }; },
  async dropStage(id, zone, hintText) {
    game.elixir = 10; game.lock = { id, zone }; this.placed = null; const r = this.cardRect(id), T = CONFIG.T, zx = sx(zone.x), zy = sy(zone.y);
    await this.until(() => this.placed === id, { hint: hintText, ring: { x: zx, y: zy, r: zone.r * T }, finger: { from: { x: r.x + r.w / 2, y: r.y + r.h / 2 }, to: { x: zx, y: zy } }, spot: this.cardRect(id), dim: false, noBlock: true, pad: 4 });
    game.lock = null;
  },
  async battlePractice() {
    this.placed = null; const deck = ['musketeer', 'hog', 'fireball', 'log', 'skeletons', 'icespirit', 'cannon', 'icegolem'];
    Meta.startBattle({ tutorial: true, deck, opts: { noAI: true, fixedHand: true, elixirStart: 6, skipCountdown: true, allowForfeit: false }, onPlay: id => { this.placed = id; } });
    await sleep(500); this.chk();
    await this.say('어서 오게, 도전자여! 먼저 아래 보라색 엘릭서 바를 보게. 카드를 쓰려면 엘릭서가 필요하다네. 시간이 지나면 저절로 차오르지.', { spot: { x: 56, y: 924, w: 472, h: 30 }, at: 'top', y: 330 });
    await this.dropStage('musketeer', { x: 9, y: 22, r: 2.8 }, '머스킷병 카드를 끌어서 반짝이는 곳에 놓아보게!');
    game.deploy(1, 'skeletons', 9, 11); sfx('place_skeletons');
    this.hint('유닛은 알아서 싸운다네. 지켜보게!'); await this.until(() => !game.ents.some(e => e.team === 1 && e.isUnit && !e.dead), { timeout: 28000, hint: '유닛은 알아서 싸운다네. 지켜보게!' });
    await sleep(500); this.chk();
    await this.say('잘했네! 이번엔 호그라이더일세. 건물만 노리는 아주 빠른 유닛이지. 강도 뛰어넘는다네.', { at: 'top', y: 330 });
    await this.dropStage('hog', { x: 3.5, y: 20, r: 2.4 }, '호그라이더를 왼쪽 다리 앞에 놓아보게!');
    const tw = game.towers[1].pl; await this.until(() => tw.hp < tw.maxHp || tw.dead, { timeout: 14000, hint: '호그는 유닛이 아닌 건물만 공격한다네!' });
    await sleep(900); this.chk();
    game.deploy(1, 'skeletons', 9, 10.5); game.deploy(1, 'icespirit', 8, 10.5); game.deploy(1, 'skeletons', 10, 10.5); await sleep(3600); this.chk();
    const foes = game.ents.filter(e => e.team === 1 && e.isUnit && !e.dead); let cx = 9, cy = 15; if (foes.length) { cx = foes.reduce((a, e) => a + e.x, 0) / foes.length; cy = foes.reduce((a, e) => a + e.y, 0) / foes.length; }
    await this.say('적이 무리를 지어 몰려온다! 이럴 땐 파이어볼이 최고지. 주문은 어디든 쓸 수 있다네.', { at: 'top', y: 330 });
    await this.dropStage('fireball', { x: cx, y: cy, r: 4 }, '파이어볼을 적 무리 위에 던져보게!');
    await sleep(2600); this.chk(); await this.say('훌륭하네! 이제 진짜 전투를 해볼 차례일세.', { at: 'top', y: 330 });
    game.stop(); Meta.showCanvas(false);
  },
  async realBattle() {
    let scale = 0.5;
    for (let tries = 0; tries < 6; tries++) {
      this.chk();
      const win = await new Promise(res => {
        const intro = async g => { try { await this.say('상대 프린세스타워를 부수면 크라운 1개, 킹타워를 부수면 크라운 3개와 함께 즉시 승리한다네!', { at: 'top', y: 330, spot: { x: 90, y: 6, w: 100, h: 34 } }); } catch (e) { } if (!this.aborted) g.paused = false; };
        Meta.startBattle({ tutorial: true, opts: { diff: 'easy', aiHpScale: scale, rules: { time: 150 }, allowForfeit: false }, onTutorialEnd: (r, w) => res(w), onStart: g => { g.paused = true; setTimeout(() => intro(g), 350); } });
      });
      this.chk(); if (win === 1) return; scale *= 0.75; await this.say('아쉽군! 한 번 더 도전해 보게. 이번엔 조금 더 쉬울 걸세.', { at: 'top', y: 330 });
    }
  },
  /* ---- 홈 투어 ---- */
  async tour() {
    const s = S(); SM.go('home'); this.chk(); Home.setTab(2, true); BattleTab.refresh(); await sleep(500); this.chk();
    await this.say('여기가 본부일세. 이 큰 "전투" 버튼으로 언제든 대전을 시작할 수 있다네.', { spot: rectOf($('.fightbtn')), at: 'top', y: 90 });
    if (s.chests.every(c => !c)) { s.chests[0] = { type: 'wood', state: 'ready' }; Save.save(); BattleTab.renderSlots(); }
    await this.say('전투에서 이기면 상자를 얻는다네. 첫 상자를 선물하지. 직접 열어보게!', { spot: rectOf(BattleTab.slotsEl.children[0]), at: 'top', y: 90 });
    await this.until(() => !S().chests[0] && !$('#modals').children.length, { hint: '상자를 탭해서 열어보게!', spot: () => BattleTab.slotsEl.children[0] ? rectOf(BattleTab.slotsEl.children[0]) : null, hideOnModal: true, dim: false, pad: 4 });
    await sleep(400); this.chk(); s.cards.hog.n = Math.max(s.cards.hog.n, 2); s.gold = Math.max(s.gold, 50); Save.save(); Cur.to('gold');
    await this.say('이제 카드 탭으로 가보게. 카드를 모아 업그레이드하면 더 강해진다네!', { spot: rectOf(Home.navBtns[1]), at: 'top', y: 90 });
    await this.until(() => Home.tab === 1, { hint: '아래 "카드" 탭을 눌러보게!', spot: () => rectOf(Home.navBtns[1]), dim: false, pad: 2 });
    await sleep(500); this.chk();
    const hogEl = () => $('.cardc[data-id="hog"][data-deck]', CardsTab.box);
    await this.until(() => $('#modals').children.length > 0, { hint: '호그라이더 카드를 눌러보게!', spot: () => { const e = hogEl(); return e ? rectOf(e) : null; }, dim: false, pad: 2 });
    await this.until(() => S().cards.hog.lv >= 2 || !$('#modals').children.length, { hint: '"업그레이드" 버튼을 눌러보게! (무료로 해주지)', spot: () => { const b = $('#modals .modal .btn.g'); return b ? rectOf(b) : null; }, dim: false, pad: 4 });
    if (S().cards.hog.lv < 2) { S().cards.hog.lv = 2; S().cards.hog.n = 0; Save.save(); CardsTab.render(); }
    await sleep(800); this.chk(); $$('#modals .mback').forEach(m => m.remove());
    await this.say('상점에서는 골드와 상자, 부스터를 살 수 있다네. 한번 구경해 보게.', { spot: rectOf(Home.navBtns[0]), at: 'top', y: 90 });
    await this.until(() => Home.tab === 0, { hint: '"상점" 탭을 눌러보게!', spot: () => rectOf(Home.navBtns[0]), dim: false, pad: 2 });
    await sleep(900); this.chk(); await this.say('이제 준비는 끝났네! 약속한 선물일세. 이제 진짜 전투다!', { at: 'top', y: 330 });
  },
  async flow() {
    const s = S(); this.clear();
    if (s.tut.step < 1) { await this.battlePractice(); this.chk(); s.tut.step = 1; Save.save(); }
    if (s.tut.step < 2) {
      SM.go('home'); this.chk(); await this.say('이번엔 연습이 아닌 진짜 대전이야! 약한 상대와 한 판 겨뤄보게.', { at: 'top', y: 330 });
      await this.realBattle(); this.chk(); s.tut.step = 2; Save.save();
    }
    if (s.tut.step < 3) { Music.play('menu', { force: true }); await this.tour(); this.chk(); s.tut.step = 3; Save.save(); }
    if (!s.tut.rewarded) { s.tut.rewarded = true; Save.save(); Home.setTab(2); Eco.gold(CONFIG.TUTORIAL_REWARD.gold, { x: 270, y: 480 }); Eco.gems(CONFIG.TUTORIAL_REWARD.gems, { x: 270, y: 520 }); sfx('levelup'); }
    s.tut.done = true; Save.save(); this.clear(); this.skip.style.display = 'none'; Home.setTab(2, true); BattleTab.refresh(); Home.refreshBadges();
    openModal({ title: '튜토리얼 완료!', body: h('div', { style: 'text-align:center;font-size:20px;line-height:1.7;padding:6px' }, '보상을 받았어요!', h('br'), ic('coin', 30), ' ' + CONFIG.TUTORIAL_REWARD.gold + '  ', ic('gem', 30), ' ' + CONFIG.TUTORIAL_REWARD.gems), buttons: [{ text: '좋아요!', cls: 'y' }] });
  }
};
