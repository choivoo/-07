/* ===== 상점 탭 ===== */
const BOOST_MS = 3600 * 1000;
const ShopTab = {
  build() {
    const el = this.el = h('div', { class: 'page', style: 'background:linear-gradient(#3b5a8c,#243a5e)' }); this.box = h('div', {}); el.append(this.box); this.render(); return el;
  },
  onShow() { this.render(); },
  update() { if (SM.cur === 'home' && Home.tab === 0) this.tick(); },
  tick() {
    const t = $('#boostEnd', this.box), d = $('#dailyEnd', this.box);
    if (t) t.textContent = '종료까지: ' + hms(this.boostEnd() - now());
    if (d) d.textContent = '새 카드 등장까지: ' + hms(this.nextMidnight() - now());
    $$('.bt', this.box).forEach(e => { const k = e.dataset.k, rem = S().boost[k] - now(); if (rem > 0) e.textContent = '남은 시간 ' + hms(rem); });
  },
  boostEnd() { const P = 3 * 86400000; return Math.ceil(now() / P) * P; },
  nextMidnight() { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); },
  confirmBuy(text, price, kind, fn) {
    const body = h('div', { style: 'text-align:center;font-size:18px;line-height:1.5' }, text, h('div', { class: 'price ts', style: 'margin-top:10px;font-size:26px' }, ic(kind === 'gem' ? 'gem' : 'coin', 32), fmt(price)));
    openModal({ title: '구매 확인', body: [body], buttons: [{ text: '취소', cls: 'gray' }, { text: '구매', cls: 'g', fn: () => { const ok = kind === 'gem' ? Eco.spendGems(price) : Eco.spendGold(price); if (!ok) { Home.el.classList.add('shake'); setTimeout(() => Home.el.classList.remove('shake'), 400); return false; } fn(); this.render(); } }] });
  },
  render() {
    const s = S(), box = this.box, sc = box.parentElement ? box.parentElement.scrollTop : 0; box.innerHTML = '';
    const hero = h('div', { class: 'shophero', style: 'background:radial-gradient(circle at 70% 60%,#9a4fe0,#3a1a6a 70%)' },
      h('div', { class: 'abs', html: goblinSVG(150), style: 'left:14px;bottom:-14px' }),
      h('div', { class: 'abs', style: 'right:20px;top:6px;animation:float 3s ease-in-out infinite' }, chestCanvas('magic', { open: .25, t: performance.now() / 1000 }, 150)),
      h('div', { class: 'abs ts', style: 'left:170px;top:24px;font-size:20px;width:170px;line-height:1.3' }, '어서 와요!', h('br'), '오늘의 특별 상품!'));
    box.append(hero);
    const rb = (txt, cls, sub) => h('div', { style: 'margin:14px 10px 8px' }, h('div', { class: 'ribbon ts ' + (cls || '') }, txt), sub);
    // 부스터
    box.append(rb('특별 부스터!', 'purple', h('div', { id: 'boostEnd', class: 'small ts2', style: 'text-align:center;margin-top:8px;font-size:14px' }, '종료까지: ' + hms(this.boostEnd() - now()))));
    const BO = [['gold', '승리 골드 부스터', '승리 골드 ×2', ICONS.coin(54)], ['crown', '크라운 상자 부스터', '크라운 ×2', ICONS.crown(54)], ['speed', '상자 가속 부스터', '해제 시간 ½', ICONS.clock(54)]];
    const brow = h('div', { class: 'row gap8', style: 'margin:0 10px' });
    BO.forEach(b => {
      const on = boostOn(b[0]);
      brow.append(h('div', { class: 'boost' }, h('div', { class: 'ts2', style: 'font-size:13px;text-align:center;min-height:30px' }, b[1]), h('div', { class: 'bi' }, h('span', { html: b[3], style: 'display:flex' }), h('span', { class: 'ts2', style: 'margin-top:4px' }, b[2])),
        on ? h('div', { class: 'bt ts2 green', 'data-k': b[0], style: 'font-size:13px;margin-top:4px' }, '남은 시간 ' + hms(s.boost[b[0]] - now())) : h('button', { class: 'btn g sm', style: 'margin-top:4px', onclick: () => { sfx('click'); this.confirmBuy(b[1] + ' (1시간)', 300, 'gem', () => { s.boost[b[0]] = now() + BOOST_MS; Save.save(); Toast(b[1] + ' 적용! (1시간)'); sfx('levelup'); }); } }, ic('gem', 24), '300')));
    });
    box.append(brow);
    // 일일 특가
    box.append(rb('일일 특가', '', h('div', { id: 'dailyEnd', class: 'small ts2', style: 'text-align:center;margin-top:8px;font-size:14px' }, '새 카드 등장까지: ' + hms(this.nextMidnight() - now()))));
    const grid = h('div', { class: 'sgrid' });
    s.daily.deals.forEach((d, i) => {
      const price = Math.round(d.base * (1 + d.bought * 0.3)), cfg = CONFIG.cards[d.id];
      grid.append(h('div', { class: 'deal' }, h('div', { class: 'nm' }, cfg.name), h('div', { style: 'width:80px;position:relative' }, cardImg(d.id), h('div', { class: 'cnt ts2' }, 'x' + d.cnt)),
        h('button', { class: 'btn y sm', style: 'min-width:92px', onclick: () => { sfx('click'); this.confirmBuy(cfg.name + ' ' + d.cnt + '장', price, 'gold', () => { s.cards[d.id].n += d.cnt; d.bought++; Save.save(); sfx('upgrade'); Toast(cfg.name + ' +' + d.cnt); Home.refreshBadges(); }); } }, ic('coin', 20), fmt(price))));
    });
    box.append(grid);
    // 보물 상자
    box.append(rb('보물 상자', 'red', h('div', { class: 'small ts2', style: 'text-align:center;margin-top:8px' }, '구매한 상자는 바로 열립니다!')));
    const CH = [['silver', 100], ['gold', 250], ['magic', 600]]; const crow = h('div', { class: 'sgrid' });
    CH.forEach(([t, p]) => crow.append(h('div', { class: 'pack' }, h('div', { class: 'nm' }, CONFIG.CHESTS[t].name), chestCanvas(t, {}, 92), h('button', { class: 'btn g sm', style: 'min-width:92px', onclick: () => { sfx('click'); this.confirmBuy(CONFIG.CHESTS[t].name + '를 지금 열기', p, 'gem', () => { setTimeout(() => Chests.openType(t, () => { }), 250); }); } }, ic('gem', 20), fmt(p)))));
    box.append(crow);
    // 보석
    box.append(rb('보석', '', h('div', { class: 'small ts2', style: 'text-align:center;margin-top:8px' }, '※ 실제 결제는 없습니다. 테스트용 무료 지급')));
    const grow = h('div', { class: 'sgrid' });
    [[80, 0], [500, 1], [1200, 2]].forEach(([n, lv]) => grow.append(h('div', { class: 'pack' }, h('div', { class: 'nm' }, fmt(n) + ' 보석'), h('span', { html: packSVG('gem', lv, 86), style: 'display:flex' }), h('button', { class: 'btn g sm', style: 'min-width:92px', onclick: (e) => { sfx('click'); Eco.gems(n, uiPos(e.currentTarget)); Toast('보석 ' + n + '개를 받았어요 (테스트)'); } }, '무료 받기'))));
    box.append(grow);
    // 골드
    box.append(rb('골드', 'gold', null));
    const orow = h('div', { class: 'sgrid', style: 'padding-bottom:24px' });
    [[1000, 60, 0], [10000, 500, 1], [100000, 4500, 2]].forEach(([n, p, lv]) => orow.append(h('div', { class: 'pack' }, h('div', { class: 'nm' }, fmt(n) + ' 골드'), h('span', { html: packSVG('gold', lv, 86), style: 'display:flex' }), h('button', { class: 'btn g sm', style: 'min-width:92px', onclick: (e) => { sfx('click'); const pos = uiPos(e.currentTarget); this.confirmBuy(fmt(n) + ' 골드', p, 'gem', () => { Eco.gold(n, pos); Toast('골드 ' + fmt(n) + ' 획득!'); }); } }, ic('gem', 20), fmt(p)))));
    box.append(orow);
    if (box.parentElement) box.parentElement.scrollTop = sc;
  }
};

/* ===== 클랜 탭 (오프라인 흉내) ===== */
const ClanTab = {
  members: null, msgs: [], nextChat: 0, pending: null,
  build() {
    const rr = seeded(777), roles = ['리더', '공동 리더', '장로', '장로', '멤버'];
    this.members = Array.from({ length: 15 }, (_, i) => ({ name: CONFIG.FOES[i % CONFIG.FOES.length] + (i >= CONFIG.FOES.length ? i : ''), tro: Math.floor(1800 + rr() * 2600), role: i === 0 ? '리더' : i === 1 ? '공동 리더' : i < 5 ? '장로' : '멤버', don: Math.floor(rr() * 900) }));
    this.members.sort((a, b) => b.tro - a.tro); this.members[0].role = '리더';
    const el = this.el = h('div', { class: 'page', style: 'background:linear-gradient(#35568a,#243a5e)' }); const box = this.box = h('div', { class: 'pad' }); el.append(box);
    const tot = this.members.reduce((a, m) => a + m.tro, 0);
    const head = h('div', { class: 'row gap12' }, h('div', { html: ICONS.clan(70), style: 'display:flex' }),
      h('div', { class: 'col grow', style: 'gap:4px' }, h('b', { class: 'ts', style: 'font-size:26px' }, '호그 라이더스'), h('span', { class: 'small ts2' }, '멤버 ' + this.members.length + '/50 · 평균 ' + fmt(tot / this.members.length) + ' 🏆')),
      h('div', { class: 'col', style: 'text-align:right' }, h('b', { class: 'gold ts2', style: 'font-size:20px' }, fmt(tot))));
    const btns = h('div', { class: 'row gap8', style: 'margin-top:10px' }, h('button', { class: 'btn g grow', onclick: () => { sfx('click'); this.requestCards(); } }, '카드 요청'), h('button', { class: 'btn r grow', onclick: () => { sfx('click'); this.friendly(); } }, '친선전'));
    box.append(h('div', { class: 'panel', style: 'padding:12px;margin-bottom:10px' }, head, btns));
    this.chat = h('div', { class: 'chat', 'data-noswipe': '' });
    const inp = this.inp = h('input', { class: 'inp', placeholder: '메시지 입력...', maxlength: 40, 'data-noswipe': '' });
    const send = () => { const v = inp.value.trim(); if (!v) return; inp.value = ''; this.add(S().name, v, true); sfx('click'); setTimeout(() => { this.add(pick(this.members).name, pick(CONFIG.CHATS)); }, ri(1000, 3000)); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    box.append(h('div', { class: 'ribbon blue ts', style: 'margin-bottom:8px' }, '클랜 채팅'), this.chat, h('div', { class: 'row gap8', style: 'margin-top:8px' }, inp, h('button', { class: 'btn b', onclick: send }, '전송')));
    box.append(h('div', { class: 'ribbon ts', style: 'margin:14px -10px 8px' }, '멤버'));
    this.list = h('div', {}); box.append(this.list); this.renderMembers();
    for (let i = 0; i < 5; i++) this.add(pick(this.members).name, pick(CONFIG.CHATS), false, true);
    this.nextChat = now() + ri(4000, 9000); return el;
  },
  renderMembers() {
    this.list.innerHTML = ''; const me = { name: S().name + ' (나)', tro: S().trophies, role: '멤버', don: S().clan.req || 0, me: true };
    [...this.members, me].sort((a, b) => b.tro - a.tro).forEach((m, i) => this.list.append(h('div', { class: 'listrow' + (m.me ? ' me' : '') }, h('b', { class: 'ts2', style: 'width:26px' }, i + 1), h('div', { class: 'col grow', style: 'gap:2px' }, h('b', { class: 'ts2', style: 'font-size:17px' }, m.name), h('span', { class: 'small' }, m.role)), h('span', { class: 'gold ts2' }, fmt(m.tro) + ' 🏆'))));
  },
  add(name, text, me, silent) {
    this.msgs.push({ name, text, me }); if (this.msgs.length > 60) this.msgs.shift();
    const m = h('div', { class: 'msg' + (me ? ' me' : '') }, h('b', {}, name), text); this.chat.append(m); this.chat.scrollTop = 99999; if (!silent && SM.cur === 'home' && Home.tab === 3) sfx('tab');
  },
  onShow() { this.renderMembers(); this.chat.scrollTop = 99999; },
  update() {
    const t = now();
    if (t > this.nextChat) { this.add(pick(this.members).name, pick(CONFIG.CHATS), false, SM.cur !== 'home' || Home.tab !== 3); this.nextChat = t + ri(5000, 12000); }
    const p = S().clan.pend; if (p && t >= p.at) { S().clan.pend = null; S().cards[p.id].n += p.n; Save.save(); this.add(pick(this.members).name, CONFIG.cards[p.id].name + ' ' + p.n + '장을 기부했습니다!'); Toast('클랜원이 ' + CONFIG.cards[p.id].name + ' ' + p.n + '장을 기부했어요!'); sfx('upgrade'); Home.refreshBadges(); }
  },
  requestCards() {
    const s = S(); if (s.clan.pend) { Toast('이미 요청 중이에요 (기부 대기)', true); return; }
    if (s.clan.cool && s.clan.cool > now()) { Toast('다음 요청까지 ' + hms(s.clan.cool - now()), true); return; }
    const grid = h('div', { class: 'cgrid', style: 'grid-template-columns:repeat(4,1fr)' }); let m;
    CARDS.forEach(id => { const c = h('div', { class: 'cardc', style: 'cursor:pointer', onclick: () => { sfx('click'); const n = { common: ri(8, 14), rare: ri(3, 6), epic: 2, legendary: 1 }[CONFIG.cards[id].rarity]; s.clan.pend = { id, n, at: now() + ri(6000, 12000) }; s.clan.cool = now() + 120000; s.clan.req = (s.clan.req || 0); Save.save(); this.add(s.name, CONFIG.cards[id].name + ' 카드를 요청했습니다.', true); Toast('요청 완료! 잠시 후 기부가 도착해요'); m.close(); } }, h('div', { class: 'img' }, cardImg(id)), h('div', { class: 'small ts2', style: 'text-align:center' }, CONFIG.cards[id].name)); grid.append(c); });
    m = openModal({ title: '카드 요청', body: [h('div', { class: 'small', style: 'text-align:center;margin-bottom:8px' }, '요청할 카드를 고르세요'), grid] });
  },
  friendly() {
    const list = h('div', {}); let m;
    this.members.slice(0, 8).forEach(mem => list.append(h('div', { class: 'listrow' }, h('div', { class: 'col grow', style: 'gap:2px' }, h('b', { class: 'ts2' }, mem.name), h('span', { class: 'small gold' }, fmt(mem.tro) + ' 🏆')), h('button', { class: 'btn r sm', onclick: () => { m.close(); setTimeout(() => Meta.findMatch({ mode: 'friendly', foe: { name: mem.name, trophies: mem.tro } }), 250); } }, '대전'))));
    m = openModal({ title: '친선전 (트로피 변동 없음)', body: [list] });
  }
};

/* ===== 이벤트 탭 ===== */
const EventsTab = {
  build() {
    const el = this.el = h('div', { class: 'page', style: 'background:linear-gradient(#2e4a7a,#1f3558)' }); this.box = h('div', { class: 'pad' }); el.append(this.box); this.render(); return el;
  },
  onShow() { this.render(); }, update() { },
  render() {
    const s = S(), box = this.box; box.innerHTML = ''; const w3 = s.ev.win3;
    box.append(h('div', { class: 'ribbon ts', style: 'margin:0 -4px 10px' }, '도전 모드'));
    const card = (title, desc, rules, colA, colB, icon, extra, onGo, btn) => h('div', { class: 'panel', style: `padding:12px;margin-bottom:12px;background:linear-gradient(${colA},${colB})` }, h('div', { class: 'row gap12' }, h('div', { html: ICONS[icon](56), style: 'display:flex' }), h('div', { class: 'col grow', style: 'gap:4px' }, h('b', { class: 'ts', style: 'font-size:22px' }, title), h('span', { style: 'font-size:14px;font-weight:700;line-height:1.3' }, desc)), h('div', { class: 'col', style: 'align-items:flex-end;gap:6px' }, extra || null, h('button', { class: 'btn y sm', onclick: () => { sfx('click'); onGo(); } }, btn || '도전!'))));
    box.append(card('엘릭서 2배 도전', '처음부터 엘릭서가 2배로 차오릅니다. 승리하면 골드 +150, 보석 +5!', {}, '#7a3fc8', '#4a2090', 'drop', null, () => Meta.findMatch({ mode: 'ev_double', rules: { double: true } })));
    box.append(card('서든데스 도전', '먼저 타워를 부수는 쪽이 승리! 승리하면 골드 +200, 보석 +8!', {}, '#c8432a', '#8a2014', 'sword', null, () => Meta.findMatch({ mode: 'ev_sudden', rules: { suddenDeath: true } })));
    const state = w3.on ? '승 ' + w3.w + ' / 패 ' + w3.l + ' (3패 시 종료)' : '3패 전까지 최대한 많이 이기세요';
    box.append(card('3연승 도전', state, {}, '#2a8a4a', '#146030', 'trophy', w3.on ? h('span', { class: 'ts2 gold', style: 'font-size:15px' }, w3.w + '승 진행 중') : null, () => { if (!w3.on) { w3.on = true; w3.w = 0; w3.l = 0; Save.save(); } Meta.findMatch({ mode: 'ev_win3' }); }, w3.on ? '이어하기' : '도전!'));
    if (w3.on) box.append(h('div', { style: 'text-align:center;margin:-4px 0 12px' }, h('button', { class: 'btn gray sm', onclick: () => confirmM('도전을 포기하고 보상을 받을까요?', '포기', () => { EventsTab.finishWin3(); }, 'r') }, '포기하고 보상 받기')));
    box.append(h('div', { class: 'ribbon blue ts', style: 'margin:14px -4px 10px' }, '리플레이 TV'));
    const hist = s.history; if (!hist.length) box.append(h('div', { class: 'panel dark', style: 'padding:24px;text-align:center' }, h('span', { class: 'dim' }, '아직 전투 기록이 없어요')));
    hist.forEach(r => box.append(h('div', { class: 'listrow', style: 'background:' + (r.win === 1 ? 'rgba(60,160,60,.35)' : r.win === 0 ? 'rgba(200,60,50,.35)' : 'rgba(120,120,140,.35)') }, h('div', { class: 'col grow', style: 'gap:2px' }, h('b', { class: 'ts2', style: 'font-size:17px' }, 'vs ' + r.foe), h('span', { class: 'small' }, r.date + (r.mode ? ' · ' + r.mode : ''))), h('b', { class: 'ts', style: 'font-size:22px' }, r.crowns[0] + ' : ' + r.crowns[1]), h('b', { class: 'ts2 ' + (r.dt > 0 ? 'green' : r.dt < 0 ? 'red' : ''), style: 'width:56px;text-align:right' }, r.dt > 0 ? '+' + r.dt : r.dt))));
  },
  finishWin3() {
    const s = S(), w = s.ev.win3.w; s.ev.win3 = { on: false, w: 0, l: 0 }; Save.save();
    const gold = 100 * w, gems = w >= 3 ? 20 + 10 * (w - 3) : 0; const parts = [h('div', { style: 'font-size:20px;text-align:center;line-height:1.7' }, w + '승 달성!', h('br'), ic('coin', 26), ' ' + fmt(gold), gems ? [h('br'), ic('gem', 26), ' ' + gems] : null)];
    Eco.gold(gold); if (gems) Eco.gems(gems); if (w >= 2) Chests.give(w >= 5 ? 'gold' : 'silver'); Save.save();
    openModal({ title: '3연승 도전 종료', body: parts, buttons: [{ text: '확인', cls: 'y' }] }); this.render();
  }
};
