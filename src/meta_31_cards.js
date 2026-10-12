/* ===== 카드 탭: 덱 편성 + 컬렉션 + 카드 정보/업그레이드 ===== */
const CardsTab = {
  swap: null,
  build() {
    const el = this.el = h('div', { class: 'page bgdia' }); this.box = h('div', { class: 'pad', style: 'position:relative;z-index:1;padding-bottom:20px' }); el.append(this.box); this.render(); return el;
  },
  onShow() { this.render(); },
  update() { },
  need(id) { const lv = S().cards[id].lv; return lv >= CONFIG.MAX_LEVEL ? 0 : CONFIG.UPGRADE.cards[lv - 1]; },
  cost(id) { const lv = S().cards[id].lv; return lv >= CONFIG.MAX_LEVEL ? 0 : CONFIG.UPGRADE.gold[lv - 1]; },
  canUpgrade(id) { const c = S().cards[id]; return c.lv < CONFIG.MAX_LEVEL && c.n >= this.need(id); },
  avgElixir() { const s = S(); return (s.decks[s.deck].reduce((a, id) => a + CONFIG.cards[id].cost, 0) / 8).toFixed(1); },
  cardEl(id, o) {
    o = o || {}; const c = S().cards[id], cfg = CONFIG.cards[id], need = this.need(id), can = this.canUpgrade(id), max = c.lv >= CONFIG.MAX_LEVEL;
    const lvCls = cfg.rarity === 'rare' ? 'r' : cfg.rarity === 'legendary' ? 'l' : '';
    const el = h('div', { class: 'cardc' + (o.sel ? ' swapsel' : ''), 'data-id': id, 'data-deck': o.deckIdx !== undefined ? o.deckIdx : null },
      h('div', { class: 'img' }, cardImg(id), o.tag ? h('div', { class: 'tag ts2' }, o.tag) : null),
      h('div', { class: 'lv ' + lvCls + ' ts2' }, '레벨 ' + c.lv),
      h('div', { class: 'up' }, h('div', { class: 'arr' + (can ? ' can' : ''), html: ICONS.pound(14).replace('M24 6v26M12 22l12 14 12-14', 'M24 36V10M12 22l12-14 12 14') }),
        h('div', { class: 'bar' }, h('i', { class: can ? 'g' : '', style: `width:${max ? 100 : Math.min(1, c.n / need) * 100}%` }), h('span', { class: 'ts2' }, max ? 'MAX' : c.n + '/' + need))));
    return el;
  },
  render() {
    const s = S(), dk = s.decks[s.deck], box = this.box; box.innerHTML = '';
    const tabs = h('div', { class: 'dtabs' }); [0, 1, 2].forEach(i => tabs.append(h('button', { class: 'dtab' + (i === s.deck ? ' sel' : ''), onclick: () => { sfx('click'); s.deck = i; Save.save(); this.swap = null; this.render(); } }, i + 1)));
    const wood = h('div', { class: 'panel wood', style: 'padding:10px 10px 12px;margin-bottom:14px' },
      h('div', { class: 'deckhead' }, h('span', { class: 'ts', style: 'font-size:26px' }, '배틀 덱'), h('span', { class: 'row gap4 ts2', style: 'color:#d8a8ff;font-size:15px' }, '평균 엘릭서: ', h('b', { style: 'color:#e8c8ff;font-size:19px' }, this.avgElixir()), ic('drop', 24)), tabs));
    const grid = h('div', { class: 'cgrid' }); dk.forEach((id, i) => { const ce = this.cardEl(id, { deckIdx: i, sel: !!this.swap }); this.bindCard(ce, id, true); grid.append(ce); });
    wood.append(grid, h('div', { class: 'small ts2', style: 'text-align:center;margin-top:8px;color:#ffe9c8' }, this.swap ? '바꿀 덱 카드를 선택하세요 (' + CONFIG.cards[this.swap].name + ')' : '카드를 탭하면 정보, 길게 눌러 끌면 위치를 바꿀 수 있어요'));
    if (this.swap) wood.append(h('div', { style: 'text-align:center;margin-top:6px' }, h('button', { class: 'btn gray sm', onclick: () => { this.swap = null; this.render(); } }, '취소')));
    box.append(wood);
    box.append(h('div', { class: 'deckhead', style: 'background:rgba(10,20,40,.55)' }, h('span', { class: 'ts', style: 'font-size:24px' }, '카드 컬렉션'), h('span', { class: 'ts2', style: 'color:#cfe0ff' }, '발견: ' + CARDS.length + '/' + (CARDS.length + CONFIG.LOCKED_SLOTS))));
    const cg = h('div', { class: 'cgrid' }); CARDS.forEach(id => { const ce = this.cardEl(id, { tag: dk.includes(id) ? '덱에 사용 중' : '', sel: false }); this.bindCard(ce, id, false); cg.append(ce); });
    for (let i = 0; i < CONFIG.LOCKED_SLOTS; i++) cg.append(h('div', { class: 'cardc lock' }, h('div', { class: 'img', style: 'background:linear-gradient(#3a4a68,#222d45);border:3px solid #0e1b30;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px' }, h('span', { html: ICONS.lock(40) }), h('span', { class: 'ts2 dim', style: 'font-size:13px' }, '???')), h('div', { class: 'lv ts2', style: 'background:#2a3550' }, '미발견')));
    box.append(cg);
  },
  /* 탭 = 정보, 길게 눌러 끌기 = 교체 */
  bindCard(ce, id, inDeck) {
    let timer = null, drag = false, ghost = null, sx = 0, sy = 0, moved = false;
    const up = e => {
      window.removeEventListener('pointerup', up); window.removeEventListener('pointermove', mv); clearTimeout(timer);
      if (drag) {
        window.__cardDrag = false; ghost && ghost.remove(); ce.classList.remove('dragging'); const t = document.elementFromPoint(e.clientX, e.clientY), tgt = t && t.closest('.cardc[data-deck]');
        if (tgt) this.doSwap(id, +tgt.dataset.deck); return;
      }
      if (!moved) this.tapCard(id, inDeck, ce);
    };
    const mv = e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!drag) { if (Math.hypot(dx, dy) > 12) { moved = true; clearTimeout(timer); } return; }
      const u = $('#ui').getBoundingClientRect(), k = u.width / 540; ghost.style.left = (e.clientX - u.left) / k + 'px'; ghost.style.top = (e.clientY - u.top) / k + 'px';
    };
    ce.addEventListener('pointerdown', e => {
      sx = e.clientX; sy = e.clientY; moved = false; drag = false;
      timer = setTimeout(() => { if (moved) return; drag = true; window.__cardDrag = true; vib(15); sfx('tab'); ce.classList.add('dragging'); ghost = h('div', { class: 'ghost' }, cardImg(id)); $('#ui').append(ghost); mv(e); }, 320);
      window.addEventListener('pointerup', up); window.addEventListener('pointermove', mv);
    });
  },
  doSwap(src, j) {
    const s = S(), dk = s.decks[s.deck], i = dk.indexOf(src); if (i === j) return;
    if (i >= 0) { [dk[i], dk[j]] = [dk[j], dk[i]]; } else dk[j] = src;
    Save.save(); sfx('upgrade'); this.swap = null; this.render(); Toast('덱을 변경했어요');
  },
  tapCard(id, inDeck) {
    sfx('click');
    if (this.swap) { if (!inDeck) { Toast('덱에 있는 카드를 선택하세요', true); return; } this.doSwap(this.swap, S().decks[S().deck].indexOf(id)); return; }
    if (inDeck) { this.detail(id); return; }
    const m = openModal({ title: CONFIG.cards[id].name, body: [h('div', { style: 'width:150px;margin:0 auto' }, cardImg(id))], buttons: [{ text: '정보', cls: 'b', fn: () => { setTimeout(() => this.detail(id), 220); } }, { text: '사용', cls: 'g', fn: () => { this.swap = id; this.render(); } }] });
  },
  stat(id, lv) {
    const cfg = CONFIG.cards[id], m = Math.pow(1.1, lv - 1), r = [];
    if (cfg.hp) r.push(['heart', '체력', Math.round(cfg.hp * m), cfg.hp]);
    const dmg = cfg.dmg ? cfg.dmg : (cfg.kamikaze ? cfg.kamikaze.dmg : 0);
    if (dmg) r.push(['sword', cfg.type === 'spell' ? '데미지' : '공격력', Math.round(dmg * m), dmg]);
    if (cfg.type === 'spell') { r.push(['range', id === 'log' ? '길이 / 폭' : '범위', id === 'log' ? cfg.length + ' / ' + cfg.width : cfg.radius, 0]); r.push(['sword', '타워 피해', Math.round(cfg.towerMul * 100) + '%', 0]); }
    else {
      r.push(['clock', '공격 속도', (cfg.hit || 1).toFixed(1) + '초', 0]);
      if (cfg.range) r.push(['range', '사거리', cfg.range > 1.5 ? cfg.range : '근접', 0]);
      if (cfg.speed) r.push(['speed', '이동 속도', cfg.speed >= 2 ? '매우 빠름' : cfg.speed >= 1.5 ? '빠름' : cfg.speed >= 1 ? '보통' : '느림', 0]);
      if (cfg.life) r.push(['clock', '지속 시간', cfg.life + '초', 0]);
      if (cfg.count) r.push(['heart', '소환 수', cfg.count + '마리', 0]);
    }
    r.push(['target', '타겟', CONFIG.CARD_INFO[id].target, 0]);
    return r;
  },
  detail(id) {
    const s = S(), cfg = CONFIG.cards[id], c = s.cards[id];
    const cv = h('canvas', { width: 300, height: 240, style: 'width:100%;height:190px;border-radius:12px;background:radial-gradient(circle at 50% 70%,#79b8ff,#2a4a80)' }), g = cv.getContext('2d');
    let t0 = performance.now(), iv = null;
    const drawPrev = () => {
      const t = (performance.now() - t0) / 1000; g.clearRect(0, 0, 300, 240);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(150, 200, 56, 12, 0, 0, 6.3); g.fill();
      const hpx = Math.min(190, (cfg.hh || 2.5) * 70);
      if (cfg.type === 'spell') { const f = Math.floor(t * 10) % 6; if (id === 'fireball') atlasDraw(g, 'fireball', Math.floor(t * 1.1) % 2 ? 0 : 2, Math.floor(t * 10) % 6, 150, 190, 150); else atlasDraw(g, 'log', Math.floor(t * 1.1) % 2 ? 0 : 2, f, 150, 190, 150); }
      else if (cfg.type === 'building') atlasDraw(g, id, 2, Math.floor(t * 8) % 6, 150, 200, hpx * 1.1);
      else { const atk = (t % 2.4) < 1.0; atlasDraw(g, id, atk ? 2 : 0, atk ? Math.min(5, Math.floor((t % 1) * 6)) : Math.floor(t * 9) % 6, 150, 204, hpx * 1.15); }
    };
    const body = h('div', {});
    const render = () => {
      body.innerHTML = ''; const lv = s.cards[id].lv, max = lv >= CONFIG.MAX_LEVEL, need = this.need(id), cost = this.cost(id), can = this.canUpgrade(id);
      body.append(cv);
      body.append(h('div', { class: 'row jb', style: 'margin:8px 2px' }, h('span', { class: 'ts2 ' + (cfg.rarity === 'legendary' ? 'gold' : cfg.rarity === 'rare' ? 'red' : ''), style: 'font-size:14px' }, RARITY_KO[cfg.rarity] + (cfg.type === 'spell' ? ' · 주문' : cfg.type === 'building' ? ' · 건물' : ' · 유닛')), h('span', { class: 'row gap4' }, dropIc(cfg.cost, 30))));
      body.append(h('div', { class: 'small', style: 'margin:0 2px 8px;line-height:1.4;font-weight:700;opacity:1;color:#e6eefc' }, CONFIG.CARD_INFO[id].desc));
      const cur = this.stat(id, lv), nxt = max ? null : this.stat(id, lv + 1);
      cur.forEach((r, i) => body.append(h('div', { class: 'statrow' }, ic(r[0], 22), h('span', { class: 'k' }, r[1]), h('b', { class: 'ts2' }, r[2]), nxt && nxt[i][2] !== r[2] && typeof r[2] === 'number' ? h('span', { class: 'plus ts2' }, '+' + (nxt[i][2] - r[2])) : null)));
      body.append(h('div', { class: 'row jb', style: 'margin:10px 2px 4px' }, h('b', { class: 'ts2', style: 'font-size:18px' }, '레벨 ' + lv + ' ' + (max ? '(MAX)' : '→ ' + (lv + 1))), h('span', { class: 'small ts2' }, '체력·공격력 ' + levelMulText(lv))));
      body.append(h('div', { class: 'pbar', style: 'height:24px' }, h('i', { class: can ? 'g' : '', style: `width:${max ? 100 : Math.min(1, s.cards[id].n / need) * 100}%` }), h('span', { class: 'ts2' }, max ? 'MAX' : s.cards[id].n + ' / ' + need + ' 장')));
      const ub = h('button', { class: 'btn ' + (max ? 'gray dis' : can ? 'g' : 'gray') + ' ' , style: 'width:100%;margin-top:10px;min-height:52px;font-size:20px', onclick: () => {
        if (max) return; if (!can) { Toast('카드가 부족합니다 (' + s.cards[id].n + '/' + need + ')', true); return; }
        if (!Eco.spendGold(cost)) return; s.cards[id].n -= need; s.cards[id].lv++; Save.save(); Eco.xp(5 * s.cards[id].lv); sfx('upgrade'); vib(30);
        const fl = h('div', { class: 'flash' }); body.style.position = 'relative'; body.append(fl); fl.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 500 }); setTimeout(() => fl.remove(), 520);
        Toast(cfg.name + ' 레벨 ' + s.cards[id].lv + '!'); render(); this.render(); Home.refreshBadges();
      } }, max ? '최대 레벨' : ['업그레이드 ', ic('coin', 24), fmt(cost)]);
      body.append(ub);
    };
    render();
    const m = openModal({ title: cfg.name, body: [body], onClose: () => clearInterval(iv) }); iv = setInterval(drawPrev, 90); drawPrev();
  }
};
