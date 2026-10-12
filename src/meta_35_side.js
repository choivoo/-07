/* ===== 측면 메뉴: 트로피 로드 / 퀘스트 / 업적 / 랭킹 / 설정 ===== */
const Side = {
  nodes() {
    if (this._n) return this._n; const arenaMins = CONFIG.ARENAS.map(a => a.min), n = [];
    for (let t = 100; t <= 2000; t += 100) {
      let r; const k = (t / 100) % 3;
      if (arenaMins.includes(t)) r = { k: 'chest', type: t >= 1600 ? 'magic' : t >= 1000 ? 'gold' : 'silver', label: '아레나 해금!' };
      else r = k === 1 ? { k: 'gold', n: 100 + t / 2 } : k === 2 ? { k: 'chest', type: 'wood' } : { k: 'gems', n: 10 + t / 100 };
      n.push(Object.assign({ t }, r));
    } return (this._n = n);
  },
  roadClaimable() { const s = S(); return this.nodes().filter(n => s.best >= n.t && !s.road.claimed.includes(n.t)).length; },
  rewText(r) { return r.k === 'gold' ? [ic('coin', 26), fmt(r.n)] : r.k === 'gems' ? [ic('gem', 26), r.n] : [CONFIG.CHESTS[r.type].name]; },
  road() {
    const s = S(), list = h('div', { 'data-noswipe': '' }); let m; const nodes = this.nodes().slice().reverse(); let markerDone = false;
    const marker = () => h('div', { class: 'node cur', style: 'background:rgba(255,210,58,.25);border-color:#ffd23a' }, h('div', { class: 'dot' }), h('div', { html: kingSVG(40) }), h('b', { class: 'ts2 gold' }, '현재 ' + fmt(s.trophies) + ' 🏆'));
    nodes.forEach(n => {
      if (!markerDone && s.trophies >= n.t) { list.append(marker()); markerDone = true; }
      const done = s.road.claimed.includes(n.t), can = s.best >= n.t && !done;
      const row = h('div', { class: 'node' + (done ? ' done' : '') }, h('div', { class: 'dot' }), h('b', { class: 'ts2', style: 'width:76px;font-size:18px' }, ic('trophy', 22), ' ' + n.t), h('div', { class: 'row gap4 grow ts2' }, n.label ? h('span', { class: 'gold', style: 'font-size:13px' }, n.label) : null, this.rewText(n)),
        done ? h('span', { html: ICONS.check(30), style: 'display:flex' }) : can ? h('button', { class: 'btn g sm', onclick: e => { sfx('click'); this.claimRoad(n, e.currentTarget, m); } }, '받기') : h('span', { html: ICONS.lock(26), style: 'display:flex;opacity:.6' }));
      list.append(row);
    });
    if (!markerDone) list.append(marker());
    m = openModal({ title: '트로피 로드', wide: true, body: [h('div', { class: 'scroll', style: 'max-height:660px;padding:6px 6px 6px 0' }, list)] });
  },
  claimRoad(n, btn, m) {
    const s = S(), pos = uiPos(btn);
    if (n.k === 'chest') { if (Chests.give(n.type) < 0) { Toast('상자 슬롯이 가득 찼어요', true); return; } Toast(CONFIG.CHESTS[n.type].name + ' 획득!'); sfx('levelup'); }
    else if (n.k === 'gold') Eco.gold(n.n, pos); else Eco.gems(n.n, pos);
    s.road.claimed.push(n.t); Save.save(); m.close(); setTimeout(() => this.road(), 250); Home.refreshBadges();
  },
  quests() {
    const s = S(), body = h('div', {}); let m;
    s.quests.list.forEach(q => {
      const done = q.prog >= q.target;
      const claimBtn = h('button', { class: 'btn g sm', onclick: e => { sfx('click'); q.claimed = true; Eco.gold(q.gold, uiPos(e.currentTarget)); Eco.xp(10); Save.save(); m.close(); setTimeout(() => this.quests(), 250); Home.refreshBadges(); } }, '받기');
      const right = q.claimed ? h('span', { html: ICONS.check(30), style: 'display:flex' }) : done ? claimBtn : h('span', { class: 'dim small' }, '진행 중');
      const bar = h('div', { class: 'pbar grow', style: 'height:22px' }, h('i', { class: done ? 'g' : '', style: `width:${Math.min(1, q.prog / q.target) * 100}%` }), h('span', { class: 'ts2' }, Math.min(q.prog, q.target) + '/' + q.target));
      const top = h('div', { class: 'row jb' }, h('b', { class: 'ts2', style: 'font-size:17px' }, q.text), h('span', { class: 'gold ts2 row gap4' }, ic('coin', 22), fmt(q.gold)));
      body.append(h('div', { class: 'listrow', style: 'flex-direction:column;align-items:stretch;gap:6px' }, top, h('div', { class: 'row gap8' }, bar, right)));
    });
    body.append(h('div', { class: 'small', style: 'text-align:center;margin-top:8px' }, '매일 자정에 새 퀘스트로 바뀝니다 · 남은 시간 ' + hms(ShopTab.nextMidnight() - now())));
    m = openModal({ title: '일일 퀘스트', body: [body] });
  },
  achievements() {
    const s = S(), body = h('div', {}); let m;
    CONFIG.ACH.forEach(a => {
      const claimed = s.ach[a.id] || 0, max = claimed >= a.tiers.length, tgt = a.tiers[Math.min(claimed, a.tiers.length - 1)], val = s.stats[a.stat] || 0, done = !max && val >= tgt;
      body.append(h('div', { class: 'listrow', style: 'flex-direction:column;align-items:stretch;gap:6px' }, h('div', { class: 'row jb' }, h('b', { class: 'ts2', style: 'font-size:17px' }, a.text + ' ' + tgt + (max ? ' (완료)' : '')), h('span', { class: 'row gap4' }, [0, 1, 2].map(i => h('span', { html: i < claimed ? ICONS.star(20) : ICONS.crownGray(20), style: 'display:flex' })))),
        h('div', { class: 'row gap8' }, h('div', { class: 'pbar grow', style: 'height:22px' }, h('i', { class: done || max ? 'g' : '', style: `width:${max ? 100 : Math.min(1, val / tgt) * 100}%` }), h('span', { class: 'ts2' }, max ? 'MAX' : Math.min(val, tgt) + '/' + tgt)),
          max ? h('span', { html: ICONS.check(30), style: 'display:flex' }) : done ? h('button', { class: 'btn g sm', onclick: e => { sfx('click'); const g = a.gold[claimed]; s.ach[a.id] = claimed + 1; Eco.gold(g, uiPos(e.currentTarget)); Save.save(); m.close(); setTimeout(() => this.achievements(), 250); } }, ic('coin', 18), a.gold[claimed]) : h('span', { class: 'gold ts2 row gap4 small' }, ic('coin', 18), a.gold[claimed]))));
    });
    m = openModal({ title: '업적', body: [h('div', { class: 'scroll', style: 'max-height:640px' }, body)] });
  },
  ranking() {
    const s = S(), rr = seeded(4242), pool = []; for (let i = 0; i < 50; i++) pool.push({ name: CONFIG.FOES[i % CONFIG.FOES.length] + (i >= 20 ? ri(1, 99) : ''), tro: Math.floor(3800 - i * 38 + rr() * 20) });
    const all = pool.concat([{ name: s.name, tro: s.trophies, me: true }]).sort((a, b) => b.tro - a.tro), mi = all.findIndex(x => x.me), body = h('div', {});
    all.slice(0, 50).forEach((p, i) => body.append(h('div', { class: 'listrow' + (p.me ? ' me' : '') }, h('b', { class: 'ts2', style: 'width:32px;font-size:18px;color:' + (i < 3 ? '#ffd23a' : '#fff') }, i + 1), h('b', { class: 'ts2 grow', style: 'font-size:17px' }, p.name), h('span', { class: 'gold ts2' }, fmt(p.tro) + ' 🏆'))));
    if (mi >= 50) body.append(h('div', { class: 'listrow me' }, h('b', { class: 'ts2', style: 'width:60px' }, '#' + fmt(1000 + (3800 - s.trophies) * 3)), h('b', { class: 'ts2 grow' }, s.name), h('span', { class: 'gold ts2' }, fmt(s.trophies) + ' 🏆')));
    openModal({ title: '랭킹', body: [h('div', { class: 'scroll', style: 'max-height:660px' }, body)] });
  }
};

/* 전투 이벤트 -> 퀘스트 / 업적 / 통계 */
const Quests = {
  add(ev, n) { const s = S(); s.quests.list.forEach(q => { if (q.ev === ev && !q.claimed) q.prog = Math.min(q.target, q.prog + n); }); },
  on(type, d) {
    const s = S();
    if (type === 'deploy' && d.team === 0) { s.stats.played++; this.add('play:' + d.id, 1); if (d.type === 'spell') { s.stats.spells++; this.add('spell', 1); } }
    else if (type === 'towerDamage') this.add('tdmg:' + d.id, d.dmg);
    else if (type === 'towerDown' && d.team === 1) { s.stats.towers++; if (!d.king) this.add('tower', 1); }
  },
  battleEnd(win, crowns) { const s = S(); s.stats.battles++; s.stats.crowns += crowns; this.add('end', 1); if (win === 1) { s.stats.wins++; this.add('win', 1); } Save.save(); }
};

/* ===== 설정 ===== */
const Settings = {
  open() {
    const s = S(), set = s.set, body = h('div', {}); let m;
    const row = (label, ctl) => h('div', { class: 'listrow' }, h('b', { class: 'ts2 grow', style: 'font-size:16px' }, label), ctl);
    const sw = (key, cb) => { const el = h('div', { class: 'sw' + (set[key] ? ' on' : ''), onclick: () => { set[key] = !set[key]; el.classList.toggle('on', set[key]); Save.save(); sfx('click'); if (cb) cb(set[key]); } }); return el; };
    const rng = (key, cb) => h('input', { type: 'range', class: 'rng', min: 0, max: 100, value: Math.round(set[key] * 100), oninput: e => { set[key] = +e.target.value / 100; cb(set[key]); }, onchange: () => { Save.save(); sfx('click'); } });
    body.append(row('효과음', rng('sfx', v => game.sfx.setVol(v))), row('배경음', rng('music', v => Music.setVol(v))), row('음소거', sw('muted', v => Meta.applyMute())), row('진동', sw('vibrate')), row('빠른 로딩', sw('fast')));
    const diffs = h('div', { class: 'row gap4' }); [['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']].forEach(([k, t]) => { const b = h('button', { class: 'btn sm ' + (set.diff === k ? 'y' : 'gray'), onclick: () => { set.diff = k; Save.save(); $$('button', diffs).forEach((x, i) => x.className = 'btn sm ' + (['easy', 'normal', 'hard'][i] === k ? 'y' : 'gray')); } }, t); diffs.append(b); });
    body.append(row('AI 난이도', diffs), row('이름 변경', h('button', { class: 'btn b sm', onclick: () => { m.close(); setTimeout(() => BattleTab.rename(), 220); } }, '변경')),
      row('튜토리얼 다시 보기', h('button', { class: 'btn g sm', onclick: () => { m.close(); setTimeout(() => confirmM('튜토리얼을 다시 시작할까요?', '시작', () => Tutorial.restart()), 220); } }, '보기')));
    const scale = h('div', { class: 'row gap4' }); [1, 60, 3600].forEach(k => scale.append(h('button', { class: 'btn sm ' + (set.devScale === k ? 'y' : 'gray'), onclick: () => { set.devScale = k; Save.save(); $$('button', scale).forEach((x, i) => x.className = 'btn sm ' + ([1, 60, 3600][i] === k ? 'y' : 'gray')); Toast('상자 시간 ×' + k + ' (새로 시작하는 해제부터 적용)'); } }, '×' + k)));
    body.append(h('div', { class: 'small ts2', style: 'margin:10px 4px 2px;opacity:.8' }, '개발자 옵션'), row('상자 시간 배속', scale), row('FPS 표시', sw('fps', v => Meta.applyFps())));
    body.append(h('div', { style: 'text-align:center;margin-top:12px' }, h('button', { class: 'btn r sm', onclick: () => confirmM('모든 저장 데이터가 삭제됩니다.<br>정말 초기화할까요?', '다음', () => setTimeout(() => confirmM('<b>되돌릴 수 없습니다.</b><br>한 번 더 확인합니다.', '데이터 삭제', () => { Save.reset(); location.reload(); }, 'r'), 250), 'r') }, '데이터 초기화')));
    m = openModal({ title: '설정', body: [h('div', { class: 'scroll', style: 'max-height:700px' }, body)] });
  }
};
