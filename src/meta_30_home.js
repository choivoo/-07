/* ===== 홈 화면: 상단바 / 하단 5탭 / 전투 탭 ===== */
const Home = {
  tab: 2, tabs: [], navBtns: [],
  build() {
    const el = SM.reg('home', h('div', { class: 'bgdia' })); this.el = el;
    this.lvNum = h('b', {}, '1'); this.xpBar = h('div', { class: 'pbar xp' }, h('i'), h('span', { class: 'ts2' }));
    const gv = h('span', { class: 'ts2' }), mv = h('span', { class: 'ts2' });
    const top = h('div', { class: 'topbar' },
      h('div', { class: 'lvl' }, h('div', { class: 'star' }), this.lvNum), this.xpBar,
      h('div', { class: 'cur', style: 'margin-left:14px' }, h('button', { class: 'plus', onclick: () => { sfx('click'); this.setTab(0); } }, '+'), gv, h('span', { class: 'ci' }, ic('coin', 36))),
      h('div', { class: 'cur', style: 'margin-left:4px' }, h('button', { class: 'plus', onclick: () => { sfx('click'); this.setTab(0); } }, '+'), mv, h('span', { class: 'ci' }, ic('gem', 36))));
    Cur.bind('gold', gv); Cur.bind('gems', mv);
    this.track = h('div', { class: 'track' }); const tabsEl = h('div', { class: 'tabs', style: 'touch-action:pan-y' }, this.track);
    const defs = [['shop', 'chest', '상점'], ['cards', 'cards', '카드'], ['battle', 'swords', '전투'], ['clan', 'clan', '클랜'], ['events', 'tv', '이벤트']];
    const mods = [ShopTab, CardsTab, BattleTab, ClanTab, EventsTab];
    mods.forEach((m, i) => { const pg = m.build(); this.tabs.push(m); this.track.append(pg); });
    const nav = h('div', { class: 'nav' });
    defs.forEach((d, i) => { const b = h('button', { class: 'nb', onclick: () => { this.setTab(i); } }, h('span', { html: ICONS[d[1]](46), style: 'display:flex' }), h('span', { class: 'ts2 lbl' }, d[2])); this.navBtns.push(b); nav.append(b); });
    el.append(top, tabsEl, nav); this.nav = nav;
    // 스와이프
    let sx0 = 0, sy0 = 0, dx = 0, lock = null, down = false;
    tabsEl.addEventListener('pointerdown', e => { if (e.target.closest('input,textarea,.chat,[data-noswipe]')) return; down = true; sx0 = e.clientX; sy0 = e.clientY; dx = 0; lock = null; });
    window.addEventListener('pointermove', e => {
      if (!down) return; dx = (e.clientX - sx0) / (window.UI_SCALE || 1); const dy = (e.clientY - sy0) / (window.UI_SCALE || 1);
      if (lock === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) lock = Math.abs(dx) > Math.abs(dy) * 1.4 ? 'x' : 'y';
      if (lock === 'x') { this.track.style.transition = 'none'; let off = dx; if ((this.tab === 0 && dx > 0) || (this.tab === 4 && dx < 0)) off *= 0.3; this.track.style.transform = `translateX(${-this.tab * 540 + off}px)`; }
    });
    const end = () => { if (!down) return; down = false; this.track.style.transition = ''; if (lock === 'x') { if (Math.abs(dx) > 70) this.setTab(this.tab - Math.sign(dx)); else this.track.style.transform = `translateX(${-this.tab * 540}px)`; } lock = null; };
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    this.setTab(2, true); this.refreshLevel(); this.refreshBadges();
    setInterval(() => { if (SM.cur === 'home') this.update(); }, 250);
    const anim = t => { if (SM.cur === 'home' && this.tab === 2) BattleTab.anim(t / 1000); requestAnimationFrame(anim); }; requestAnimationFrame(anim);
    return el;
  },
  setTab(i, silent) {
    i = clamp(i, 0, 4); const changed = i !== this.tab; this.tab = i; this.track.style.transform = `translateX(${-i * 540}px)`;
    this.navBtns.forEach((b, k) => b.classList.toggle('sel', k === i)); if (changed && !silent) sfx('tab');
    const m = this.tabs[i]; if (m && m.onShow && (changed || !silent)) m.onShow();
  },
  refreshLevel() { const s = S(), need = CONFIG.XP_NEED(s.level); this.lvNum.textContent = s.level; $('i', this.xpBar).style.width = (s.xp / need * 100) + '%'; $('span', this.xpBar).textContent = s.xp + '/' + need; },
  refreshBadges() {
    const s = S(); const set = (i, n) => { const b = this.navBtns[i]; let bd = $('.badge', b); if (n > 0) { if (!bd) { bd = h('div', { class: 'badge ts2' }); b.append(bd); } bd.textContent = n; } else if (bd) bd.remove(); };
    let up = 0; CARDS.forEach(id => { if (CardsTab.canUpgrade(id)) up++; }); set(1, up);
    let q = s.quests.list.filter(x => x.prog >= x.target && !x.claimed).length; set(2, q + (BattleTab.roadClaimable ? BattleTab.roadClaimable() : 0));
    set(4, s.ev.win3 && s.ev.win3.on ? 1 : 0);
  },
  update() { for (const m of this.tabs) if (m.update) m.update(); this.refreshBadges(); }
};

const BattleTab = {
  slotEls: [],
  build() {
    const el = this.el = h('div', { class: 'page', style: 'overflow:hidden' });
    this.nameEl = h('span', { class: 'ts2' }); this.troEl = h('b', { class: 'ts2' });
    el.append(h('div', { class: 'profile' },
      h('div', { class: 'avatar', html: kingSVG(44), onclick: () => this.rename() }),
      h('div', { class: 'pname' }, this.nameEl, h('span', { html: ICONS.clan(26), style: 'margin-left:auto;display:flex' })),
      h('div', { class: 'tro' }, ic('trophy', 26), this.troEl),
      h('button', { class: 'iconbtn', style: 'width:46px;height:46px', onclick: () => { sfx('click'); Settings.open(); }, html: ICONS.gear(34) })));
    // 무료 / 크라운 상자
    this.freeBox = h('div', { class: 'panel cbox', style: 'left:8px', onclick: () => this.clickFree() }); this.crownBox = h('div', { class: 'panel cbox', style: 'right:8px', onclick: () => this.clickCrown() });
    el.append(this.freeBox, this.crownBox);
    // 측면 버튼
    const side = (cls, pos, icon, fn, label) => { const b = h('button', { class: 'iconbtn sidebtn', style: pos, onclick: () => { sfx('click'); fn(); } }, h('span', { html: ICONS[icon](42), style: 'display:flex' })); el.append(b); return b; };
    this.btnRoad = side('', 'left:10px;top:300px', 'trophy', () => Side.road());
    this.btnQuest = side('', 'left:10px;top:380px', 'scroll', () => Side.quests());
    this.btnAch = side('', 'right:10px;top:300px', 'medal', () => Side.achievements());
    this.btnRank = side('', 'right:10px;top:380px', 'rank', () => Side.ranking());
    // 아레나
    this.arenaCv = h('canvas', { width: 300, height: 300 }); this.arenaCtx = this.arenaCv.getContext('2d');
    el.append(h('div', { class: 'arenawrap' }, this.arenaCv));
    this.arenaLabel = h('div', { class: 'arenalabel ts2' }); this.arenaName = h('div', { class: 'abs small ts2', style: 'left:150px;width:240px;top:496px;text-align:center;opacity:.85' });
    el.append(this.arenaLabel, this.arenaName);
    el.append(h('button', { class: 'btn y big fightbtn pulse', onclick: () => { sfx('click'); Meta.findMatch(); } }, '전투'));
    this.slotsEl = h('div', { class: 'slots' }); el.append(this.slotsEl);
    this.refresh(); return el;
  },
  onShow() { this.refresh(); },
  anim(t) { drawArenaMini(this.arenaCtx, this.arenaId || 1, t); },
  refresh() {
    const s = S(); this.nameEl.textContent = s.name; this.troEl.textContent = fmt(s.trophies);
    const a = trophyArena(s.trophies); this.arenaId = a.id; this.arenaLabel.textContent = '아레나 ' + a.id; this.arenaName.textContent = a.name;
    this.renderBoxes(); this.renderSlots();
  },
  renderBoxes() {
    const s = S(), nowT = now();
    const freeLeft = s.freeAt - nowT, freeReady = freeLeft <= 0, sig = (freeReady ? 'R' : hms(freeLeft)) + '|' + s.crown.n; if (sig === this._boxSig && this.freeBox.firstChild) return; this._boxSig = sig;
    this.freeBox.className = 'panel cbox' + (freeReady ? ' ready' : ''); this.freeBox.innerHTML = '';
    this.freeBox.append(h('div', { class: 'col', style: 'gap:2px' }, h('span', { class: 'ts2', style: 'font-size:18px' }, '무료 상자'), h('span', { class: 'ts2 ' + (freeReady ? 'green' : ''), style: 'font-size:15px' }, freeReady ? '지금 열기!' : '다음: ' + hms(freeLeft))), chestCanvas('wood', {}, 62));
    const cn = s.crown.n, need = CONFIG.CROWN_CHEST_NEED, cr = cn >= need;
    this.crownBox.className = 'panel cbox' + (cr ? ' ready' : ''); this.crownBox.innerHTML = '';
    this.crownBox.append(h('div', { class: 'col', style: 'gap:4px;flex:1;margin-right:6px' }, h('span', { class: 'ts2 cyan', style: 'font-size:18px' }, '크라운 상자'), h('div', { class: 'pbar', style: 'height:16px' }, h('i', { class: 'y', style: `width:${Math.min(1, cn / need) * 100}%` }), h('span', { class: 'ts2' }, cr ? '열기!' : Math.min(cn, need) + '/' + need))), chestCanvas('silver', {}, 62));
  },
  clickFree() { const s = S(); if (s.freeAt - now() > 0) { Toast('아직 열 수 없어요: ' + hms(s.freeAt - now()), true); return; } s.freeAt = now() + CONFIG.FREE_CHEST_HOURS * 3600 * 1000 / effScale(); Save.save(); Chests.openType('wood', () => this.refresh()); },
  clickCrown() { const s = S(); if (s.crown.n < CONFIG.CROWN_CHEST_NEED) { Toast('크라운 ' + CONFIG.CROWN_CHEST_NEED + '개를 모으면 열 수 있어요 (' + s.crown.n + '/' + CONFIG.CROWN_CHEST_NEED + ')', true); return; } s.crown.n -= CONFIG.CROWN_CHEST_NEED; Save.save(); Chests.openType('silver', () => this.refresh()); },
  renderSlots() {
    this.slotsEl.innerHTML = ''; const s = S(), nowT = now();
    s.chests.forEach((c, i) => {
      if (!c) { this.slotsEl.append(h('div', { class: 'slot empty' }, h('span', { class: 'dim ts2', style: 'margin-top:60px;font-size:13px' }, '빈 슬롯'))); return; }
      const st = Chests.state(c), cfg = CONFIG.CHESTS[c.type];
      const sl = h('div', { class: 'slot' + (st === 'ready' ? ' ready' : ''), onclick: () => Chests.slotClick(i) });
      sl.append(h('span', { class: 'ts2', style: 'font-size:12px' }, st === 'ready' ? '열기 가능' : st === 'unlocking' ? '해제 중' : '잠김'), chestCanvas(c.type, {}, 92));
      if (st === 'locked') sl.append(h('b', { class: 'ts2', style: 'font-size:15px' }, hms(cfg.time * 1000 / effScale() / (boostOn('speed') ? 2 : 1))), h('span', { class: 'small ts2' }, cfg.name));
      else if (st === 'unlocking') { const rem = c.end - nowT; sl.append(h('b', { class: 'ts2 slt', 'data-i': i, style: 'font-size:15px' }, hms(rem)), h('div', { class: 'btn g sm', style: 'margin-top:4px;padding:2px 8px' }, ic('gem', 18), Chests.gemCost(rem))); }
      else sl.append(h('b', { class: 'ts2 green', style: 'font-size:16px;margin-top:6px' }, '열기!'));
      this.slotsEl.append(sl);
    });
  },
  update() {
    const s = S(), nowT = now(); let changed = false;
    s.chests.forEach((c, i) => { if (c && c.state === 'unlocking' && c.end <= nowT) { c.state = 'ready'; changed = true; sfx('match'); } });
    this.renderBoxes();
    if (changed) { Save.save(); this.renderSlots(); } else $$('.slt', this.slotsEl).forEach(e => { const c = s.chests[+e.dataset.i]; if (c) e.textContent = hms(c.end - nowT); });
  },
  roadClaimable() { return Side.roadClaimable(); },
  rename() {
    const inp = h('input', { class: 'inp', value: S().name, maxlength: 12, style: 'width:100%' });
    openModal({ title: '이름 변경', body: [h('div', { class: 'small', style: 'margin-bottom:8px' }, '최대 12글자'), inp], buttons: [{ text: '취소', cls: 'gray' }, { text: '저장', cls: 'g', fn: () => { const v = inp.value.trim(); if (!v) { Toast('이름을 입력하세요', true); return false; } S().name = v.slice(0, 12); Save.save(); this.refresh(); } }] });
    setTimeout(() => inp.focus(), 100);
  }
};
