/* ===== 상자 로직 + 상자 열기 연출 + 결과 화면 ===== */
const CHEST_XP = { wood: 5, silver: 20, gold: 50, magic: 100 };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const Chests = {
  state(c) { return c.state === 'unlocking' && c.end <= now() ? 'ready' : c.state; },
  unlockMs(type) { return CONFIG.CHESTS[type].time * 1000 / effScale() / (boostOn('speed') ? 2 : 1); },
  gemCost(rem) { return Math.max(1, Math.ceil(rem / (20 * 60 * 1000))); },
  rollType() { const o = CONFIG.CHEST_ODDS; let r = Math.random(), a = 0; for (const k in o) { a += o[k]; if (r < a) return k; } return 'wood'; },
  give(type) { const i = S().chests.findIndex(x => !x); if (i < 0) return -1; S().chests[i] = { type, state: 'locked' }; Save.save(); BattleTab.renderSlots(); return i; },
  reward(type) {
    const c = CONFIG.CHESTS[type], gold = ri(c.gold[0], c.gold[1]), gems = ri(c.gems[0], c.gems[1]), cards = []; let total = c.cards;
    if (Math.random() < c.legend) { const n = type === 'magic' ? ri(2, 4) : type === 'gold' ? ri(1, 2) : 1; cards.push({ id: 'log', n }); }
    const pool = CARDS.filter(id => CONFIG.cards[id].rarity !== 'legendary').sort(() => Math.random() - .5).slice(0, ri(3, 5));
    const w = pool.map(id => (CONFIG.cards[id].rarity === 'common' ? 3 : 1) * (0.6 + Math.random())), sw = w.reduce((a, b) => a + b, 0); let left = total;
    pool.forEach((id, i) => { const n = i === pool.length - 1 ? Math.max(1, left) : Math.max(1, Math.round(total * w[i] / sw)); left -= n; cards.push({ id, n }); });
    return { gold, gems, cards, xp: CHEST_XP[type] };
  },
  openType(type, done) { ChestOpen.show(type, this.reward(type), done); },
  slotClick(i) {
    const s = S(), c = s.chests[i]; if (!c) return; const st = this.state(c), cfg = CONFIG.CHESTS[c.type];
    if (st === 'ready') { s.chests[i] = null; Save.save(); BattleTab.renderSlots(); this.openType(c.type, () => BattleTab.refresh()); return; }
    const info = h('div', { style: 'text-align:center' }, chestCanvas(c.type, {}, 150), h('div', { class: 'ts', style: 'font-size:22px' }, cfg.name),
      h('div', { class: 'small ts2', style: 'margin:6px 0;line-height:1.6' }, '골드 ' + cfg.gold[0] + '~' + cfg.gold[1], h('br'), '카드 약 ' + cfg.cards + '장' + (cfg.gems[1] ? ' · 보석 ' + cfg.gems[0] + '~' + cfg.gems[1] : '')));
    if (st === 'unlocking') {
      const rem = c.end - now(), t = h('b', { class: 'ts', style: 'font-size:22px' }, hms(rem)); info.append(h('div', {}, '남은 시간 ', t));
      openModal({ title: cfg.name, body: [info], buttons: [{ text: '닫기', cls: 'gray' }, { text: ['지금 열기 ', ic('gem', 22), this.gemCost(rem)], cls: 'g', fn: () => { if (!Eco.spendGems(this.gemCost(c.end - now()))) return false; s.chests[i] = null; Save.save(); BattleTab.renderSlots(); setTimeout(() => this.openType(c.type, () => BattleTab.refresh()), 250); } }] });
    } else {
      const ms = this.unlockMs(c.type); info.append(h('div', {}, '해제 시간 ' + hms(ms)));
      openModal({ title: cfg.name, body: [info], buttons: [{ text: ['해제 시작'], cls: 'b', fn: () => { if (s.chests.some(x => x && x.state === 'unlocking' && x.end > now())) { Toast('이미 다른 상자를 해제 중입니다', true); return false; } c.state = 'unlocking'; c.end = now() + ms; Save.save(); BattleTab.renderSlots(); sfx('upgrade'); } },
        { text: ['지금 열기 ', ic('gem', 22), this.gemCost(ms)], cls: 'g', fn: () => { if (!Eco.spendGems(this.gemCost(ms))) return false; s.chests[i] = null; Save.save(); BattleTab.renderSlots(); setTimeout(() => this.openType(c.type, () => BattleTab.refresh()), 250); } }] });
    }
  }
};

const ChestOpen = {
  async show(type, rw, done) {
    const s = S(), before = {}; rw.cards.forEach(c => before[c.id] = s.cards[c.id].n);
    s.gold += rw.gold; s.gems += rw.gems; rw.cards.forEach(c => s.cards[c.id].n += c.n); Save.save(); Eco.xp(rw.xp);
    const back = h('div', { class: 'mback', style: 'z-index:35;background:radial-gradient(circle at 50% 40%,#3a2a6a,#0a0818 80%)' }), st = h('div', { style: 'position:absolute;inset:0;overflow:hidden' }); back.append(st); $('#modals').append(back);
    const title = h('div', { class: 'abs ts', style: 'left:0;right:0;top:70px;text-align:center;font-size:32px' }, CONFIG.CHESTS[type].name);
    const hint = h('div', { class: 'abs ts blink', style: 'left:0;right:0;bottom:140px;text-align:center;font-size:24px' });
    const cv = chestCanvas(type, {}, 330); cv.style.cssText = 'position:absolute;left:105px;top:250px;width:330px;height:330px';
    st.append(title, cv, hint);
    const o = { open: 0, t: 0, shake: 0 }; let run = true, last = performance.now();
    const loop = t => { if (!run) return; const dt = Math.min(0.05, (t - last) / 1000); last = t; o.t += dt; o.shake = Math.max(0, o.shake - dt * 3); cv._draw(o); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    const wait = () => new Promise(r => { const f = () => { st.removeEventListener('pointerdown', f); r(); }; st.addEventListener('pointerdown', f); });
    const dust = (x, y) => { for (let i = 0; i < 10; i++) { const p = h('div', { class: 'abs', style: `left:${x}px;top:${y}px;width:${10 + Math.random() * 14}px;height:${10 + Math.random() * 14}px;border-radius:50%;background:rgba(220,200,170,.7)` }); st.append(p); const a = p.animate([{ transform: 'translate(0,0)', opacity: .8 }, { transform: `translate(${(Math.random() - .5) * 260}px,${-Math.random() * 60}px) scale(2)`, opacity: 0 }], { duration: 600 + Math.random() * 300 }); a.onfinish = () => p.remove(); } };
    sfx('whoosh'); cv.animate([{ transform: 'translateY(-760px)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.3,1.5,.5,1)' }); await sleep(500);
    sfx('chest_land'); vib(40); st.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(12px)' }, { transform: 'translateY(-7px)' }, { transform: 'none' }], { duration: 380 }); dust(270, 560); await sleep(350);
    const need = { wood: 3, silver: 4, gold: 5, magic: 6 }[type];
    for (let i = 1; i <= need; i++) { hint.textContent = `탭하세요! (${i}/${need})`; await wait(); o.shake = 1; sfx('chest_hit'); vib(15); cv.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: 160 }); }
    hint.textContent = ''; const fl = h('div', { class: 'flash' }); st.append(fl); fl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700 }); sfx('chest_open'); vib([30, 30, 60]);
    const t0 = performance.now(); await new Promise(r => { const step = () => { const k = Math.min(1, (performance.now() - t0) / 600); o.open = 1 - Math.pow(1 - k, 3); if (k < 1) requestAnimationFrame(step); else r(); }; step(); }); await sleep(250);
    // 골드 폭포
    const gtxt = h('div', { class: 'abs ts', style: 'left:0;right:0;top:620px;text-align:center;font-size:44px;color:#ffd23a' }, ''); st.append(gtxt);
    for (let i = 0; i < 18; i++) { const c = h('div', { class: 'abs', html: ICONS.coin(34), style: 'left:250px;top:330px' }); st.append(c); const dx = (Math.random() - .5) * 420, an = c.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 1 }, { transform: `translate(${dx * .5}px,-${180 + Math.random() * 120}px) scale(1.1)`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px,260px) scale(.9)`, opacity: 0 }], { duration: 1100 + Math.random() * 400, delay: i * 45, easing: 'ease-out' }); an.onfinish = () => c.remove(); if (i % 3 === 0) setTimeout(() => sfx('coin'), i * 45); }
    await new Promise(r => { const t1 = performance.now(), dur = 1000; const step = () => { const k = Math.min(1, (performance.now() - t1) / dur); gtxt.innerHTML = ICONS.coin(40) + ' +' + fmt(rw.gold * k); if (k < 1) requestAnimationFrame(step); else r(); }; step(); });
    if (rw.gems) { const gm = h('div', { class: 'abs ts', style: 'left:0;right:0;top:680px;text-align:center;font-size:36px;color:#7dee5c' }, ''); st.append(gm); gm.innerHTML = ICONS.gem(38) + ' +' + rw.gems; sfx('gem'); gm.animate([{ transform: 'scale(2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300 }); }
    await sleep(500); hint.textContent = '탭하여 카드 보기'; await wait(); hint.textContent = '';
    cv.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); gtxt.remove(); $$('.abs', st).forEach(e => { if (e !== title && e !== hint && e.textContent.indexOf('+') >= 0) e.remove(); }); await sleep(250); run = false; cv.remove();
    // 카드 공개
    title.textContent = '카드 획득!'; const rar = id => CONFIG.cards[id].rarity, box = h('div', { class: 'abs', style: 'left:10px;right:10px;top:150px;display:flex;flex-wrap:wrap;gap:20px 10px;justify-content:center' }); st.append(box);
    let remain = rw.cards.length; const flips = []; let busy = false; const allBtn = h('button', { class: 'btn y abs', style: 'left:170px;width:200px;bottom:64px', onclick: async () => { for (const f of flips) { if (!f.el.classList.contains('open')) await f.flip(true); } } }, '모두 뒤집기'); st.append(allBtn);
    const finish = new Promise(res => {
      rw.cards.forEach(c => {
        const need = CardsTab.need(c.id) || 1, before0 = Math.min(1, before[c.id] / need) * 100, after0 = Math.min(1, (before[c.id] + c.n) / need) * 100, r = rar(c.id);
        const bar = h('div', { class: 'pbar', style: 'height:16px;width:132px;margin-top:6px;flex:none' }, h('i', { style: `width:${before0}%` }), h('span', { class: 'ts2' }, Math.min(before[c.id] + c.n, need) + '/' + need));
        const el = h('div', { class: 'cflip ' + r }, h('div', { class: 'in' }, h('div', { class: 'b ts' }, '?'), h('div', { class: 'f' }, cardImg(c.id), h('div', { class: 'cn ts', style: 'color:#ffd23a' }, 'x' + c.n), bar)));
        const f = { el, async flip(quiet) {
          if (busy || el.classList.contains('open')) return; busy = true;
          if (r === 'legendary') await Legend.show(c.id, st);
          el.classList.add('open'); sfx('card_' + (r === 'legendary' ? 'legend' : r === 'rare' ? 'rare' : 'common')); vib(r === 'common' ? 10 : 30);
          setTimeout(() => { $('i', bar).style.width = after0 + '%'; }, 500); await sleep(quiet ? 350 : 650); busy = false; if (--remain === 0) res();
        } };
        el.addEventListener('pointerdown', e => { e.stopPropagation(); f.flip(); }); flips.push(f); box.append(el);
      });
    });
    hint.textContent = '카드를 탭해서 뒤집으세요!'; await finish; hint.textContent = ''; allBtn.remove(); await sleep(400);
    const nb = h('button', { class: 'btn g big abs', style: 'left:150px;width:240px;bottom:60px;min-height:64px;font-size:26px' }, '계속'); st.append(nb); await new Promise(r => nb.addEventListener('click', () => { sfx('click'); r(); })); nb.remove();
    // 요약
    box.remove(); title.textContent = '획득 요약'; const sum = h('div', { class: 'abs', style: 'left:30px;right:30px;top:140px' });
    sum.append(h('div', { class: 'rewrow ts' }, h('span', {}, '골드'), h('span', { class: 'gold row gap4' }, ic('coin', 30), '+' + fmt(rw.gold))));
    if (rw.gems) sum.append(h('div', { class: 'rewrow ts', style: 'animation-delay:.15s' }, h('span', {}, '보석'), h('span', { class: 'green row gap4' }, ic('gem', 30), '+' + rw.gems)));
    sum.append(h('div', { class: 'rewrow ts', style: 'animation-delay:.3s' }, h('span', {}, '경험치'), h('span', { class: 'cyan' }, '+' + rw.xp + ' XP')));
    const cg = h('div', { class: 'row wrap jc', style: 'gap:8px;margin-top:10px' }); rw.cards.forEach((c, i) => cg.append(h('div', { style: `width:92px;position:relative;opacity:0;animation:rin .4s ${0.45 + i * 0.1}s forwards` }, cardImg(c.id), h('div', { class: 'ts', style: 'position:absolute;right:2px;bottom:6px;font-size:20px;color:#ffd23a' }, 'x' + c.n)))); sum.append(cg); st.append(sum);
    const ok = h('button', { class: 'btn y big abs', style: 'left:150px;width:240px;bottom:60px;min-height:64px;font-size:26px' }, '확인'); st.append(ok);
    await new Promise(r => ok.addEventListener('click', () => { sfx('click'); r(); }));
    back.classList.add('fadeout'); setTimeout(() => back.remove(), 380);
    fly('coin', { x: 270, y: 300 }, Math.ceil(rw.gold / 40)); if (rw.gems) fly('gem', { x: 270, y: 340 }, Math.ceil(rw.gems / 5)); Cur.to('gold'); Cur.to('gems'); Home.refreshBadges(); CardsTab.render();
    if (done) done();
  }
};
const Legend = {
  async show(id, st) {
    const ov = h('div', { class: 'abs', style: 'inset:0;background:#000;z-index:5;opacity:0' }); st.append(ov); ov.animate([{ opacity: 0 }, { opacity: .92 }], { duration: 500, fill: 'forwards' }); sfx('card_legend'); vib([60, 40, 90]); await sleep(450);
    const ring = h('div', { class: 'abs rainbow', style: 'z-index:6;left:70px;top:230px;width:400px;height:400px;border-radius:50%;opacity:0;filter:blur(2px)' }); st.append(ring);
    ring.animate([{ transform: 'scale(.1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 1500, easing: 'ease-out' });
    const rot = h('div', { class: 'abs', style: 'z-index:7;left:170px;top:250px;width:200px' }, cardImg(id)); st.append(rot); const nm = h('div', { class: 'abs ts rainbow', style: 'z-index:7;left:0;right:0;top:620px;text-align:center;font-size:34px;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none;filter:drop-shadow(0 3px 0 #14101c)' }, '전설 카드!'); st.append(nm);
    rot.animate([{ transform: 'scale(.2) rotateY(0deg)', opacity: 0 }, { transform: 'scale(1.3) rotateY(720deg)', opacity: 1, offset: .7 }, { transform: 'scale(1.15) rotateY(720deg)', opacity: 1 }], { duration: 2200, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    await sleep(2300); const h2 = h('div', { class: 'abs ts blink', style: 'z-index:7;left:0;right:0;bottom:90px;text-align:center;font-size:22px' }, '탭하여 계속'); st.append(h2);
    await new Promise(r => { const f = e => { e.stopPropagation(); st.removeEventListener('pointerdown', f); r(); }; st.addEventListener('pointerdown', f); });
    ov.animate([{ opacity: .92 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); [ring, rot, nm, h2].forEach(e => { e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); }); await sleep(320); [ov, ring, rot, nm, h2].forEach(e => e.remove());
  }
};

/* ===== 결과 화면 ===== */
const Result = {
  build() { this.el = SM.reg('result', h('div', { class: 'bgdia' })); return this.el; },
  show(info, onClose) {
    const el = this.el; el.innerHTML = ''; SM.go('result');
    const title = info.win === 1 ? '승리!' : info.win === 0 ? '패배...' : '무승부', col = info.win === 1 ? '#ffd23a' : info.win === 0 ? '#ff7a6a' : '#e8eefc';
    const rib = h('div', { class: 'abs', style: 'left:0;right:0;top:50px;display:flex;justify-content:center;animation:vsb .6s ease-out' }, h('div', { class: 'ribbon ts ' + (info.win === 1 ? 'gold' : info.win === 0 ? 'red' : 'blue'), style: 'width:420px;height:88px;font-size:50px;margin:0' }, h('span', { style: `color:${col}` }, title)));
    el.append(rib);
    const mk = (n, team) => h('div', { class: 'crownrow' }, [0, 1, 2].map(i => h('div', { class: 'stampc', html: i < n ? ICONS.crown(56) : ICONS.crownGray(56), style: i < n ? 'opacity:0' : 'opacity:.8', 'data-st': i < n ? '1' : '' })));
    const cr = h('div', { class: 'abs', style: 'left:20px;right:20px;top:170px;display:flex;justify-content:space-around;align-items:center' },
      h('div', { class: 'col', style: 'align-items:center;gap:6px' }, h('b', { class: 'ts', style: 'color:#7fb4ff;font-size:22px' }, S().name), mk(info.crowns[0])), h('b', { class: 'ts', style: 'font-size:34px;color:#ffd23a' }, 'VS'), h('div', { class: 'col', style: 'align-items:center;gap:6px' }, h('b', { class: 'ts', style: 'color:#ff8a8a;font-size:22px' }, info.foe.name), mk(info.crowns[1])));
    el.append(cr);
    const list = h('div', { class: 'abs', style: 'left:36px;right:36px;top:320px' }); el.append(list);
    const rows = [];
    if (info.mode !== 'friendly' && !info.tut) rows.push(h('div', { class: 'rewrow ts' }, h('span', {}, '트로피'), h('b', { class: info.dTro >= 0 ? 'green' : 'red row gap4' }, ic('trophy', 28), (info.dTro >= 0 ? '+' : '') + info.dTro)));
    if (info.gold) rows.push(h('div', { class: 'rewrow ts' }, h('span', {}, '골드' + (info.goldBoost ? ' (부스터 ×2)' : '')), h('b', { class: 'gold row gap4' }, ic('coin', 28), '+' + fmt(info.gold))));
    if (info.gems) rows.push(h('div', { class: 'rewrow ts' }, h('span', {}, '보석'), h('b', { class: 'green row gap4' }, ic('gem', 28), '+' + info.gems)));
    if (info.chest) rows.push(h('div', { class: 'rewrow ts', style: 'padding:2px 14px' }, h('span', {}, info.chestFull ? '상자 슬롯이 가득 참' : CONFIG.CHESTS[info.chest].name + ' 획득!'), info.chestFull ? h('span', { class: 'red' }, '✖') : chestCanvas(info.chest, {}, 70)));
    if (info.crownAdd) rows.push(h('div', { class: 'rewrow ts' }, h('span', {}, '크라운 상자'), h('b', { class: 'cyan row gap4' }, ic('crown', 28), '+' + info.crownAdd + (info.crownBoost ? ' (×2)' : ''))));
    rows.push(h('div', { class: 'rewrow ts' }, h('span', {}, '경험치'), h('b', { class: 'cyan' }, '+' + info.xp + ' XP')));
    const ok = h('button', { class: 'btn y big abs', style: 'left:150px;width:240px;bottom:70px;opacity:0;pointer-events:none', onclick: () => { sfx('click'); this.close(info, onClose); } }, '확인'); el.append(ok);
    (async () => {
      await sleep(700); let k = 0;
      for (const sp of $$('[data-st]', cr)) { sp.style.opacity = 1; sp.classList.add('in'); sfx('stamp'); vib(20); await sleep(480); k++; }
      for (let i = 0; i < rows.length; i++) { rows[i].style.animationDelay = '0s'; list.append(rows[i]); sfx('tab'); await sleep(380); }
      ok.style.opacity = 1; ok.style.pointerEvents = 'auto'; ok.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1)' }], { duration: 250 });
    })();
  },
  close(info, onClose) {
    if (info.gold) fly('coin', { x: 270, y: 380 }, Math.ceil(info.gold / 30)); if (info.gems) fly('gem', { x: 270, y: 420 }, 5);
    Cur.to('gold'); Cur.to('gems'); Home.refreshLevel(); if (onClose) onClose();
  }
};
const ArenaUnlock = {
  show(a, done) {
    const back = h('div', { class: 'mback', style: 'z-index:36;background:radial-gradient(circle at 50% 40%,#2a60b0,#0a1228 80%)' }), st = h('div', { style: 'position:absolute;inset:0;overflow:hidden' }); back.append(st);
    const rb = h('div', { class: 'abs rainbow', style: 'left:70px;top:210px;width:400px;height:400px;border-radius:50%;opacity:.55;filter:blur(30px)' });
    const cv = h('canvas', { width: 300, height: 300, class: 'abs', style: 'left:120px;top:240px;width:300px;height:300px' }), c = cv.getContext('2d');
    st.append(rb, h('div', { class: 'abs ts', style: 'left:0;right:0;top:90px;text-align:center;font-size:42px;color:#ffd23a' }, '새 아레나 해금!'), cv, h('div', { class: 'abs ts', style: 'left:0;right:0;top:560px;text-align:center;font-size:32px' }, '아레나 ' + a.id), h('div', { class: 'abs ts2', style: 'left:0;right:0;top:608px;text-align:center;font-size:22px;color:#cfe0ff' }, a.name));
    const ok = h('button', { class: 'btn y big abs', style: 'left:150px;width:240px;bottom:70px' }, '확인'); st.append(ok); $('#modals').append(back); sfx('levelup'); vib([40, 40, 100]);
    cv.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 900, easing: 'ease-out' });
    let run = true; const loop = t => { if (!run) return; drawArenaMini(c, a.id, t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    ok.addEventListener('click', () => { sfx('click'); run = false; back.classList.add('fadeout'); setTimeout(() => back.remove(), 380); if (done) done(); });
  }
};
