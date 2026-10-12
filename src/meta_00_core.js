/* =====================================================================
   META 2차: 화면 시스템 / 저장 / 음악 / 공통 UI  (src/meta_*.js -> tools/build.py 로 index.html 에 삽입)
   ===================================================================== */
Object.assign(CONFIG, {
  GAME_TITLE: 'CLASH ARENA',
  LOADING_SPEED: 1,          // 1 = 약 5초. 작을수록 빠름
  CHEST_TIME_SCALE: 1,       // 상자 해제 시간 배속(개발자 옵션과 곱해짐)
  START: { gold: 1000, gems: 300, trophies: 0 },
  CARD_POOL: ['hog', 'musketeer', 'icegolem', 'icespirit', 'skeletons', 'cannon', 'fireball', 'log'],   // 확장하려면 CONFIG.cards 에 정의 후 여기에 추가
  LOCKED_SLOTS: 4,           // 컬렉션에 보여줄 "미발견" 칸 수
  ARENAS: [
    { id: 1, name: '고블린 경기장', min: 0 }, { id: 2, name: '해골 구덩이', min: 300 }, { id: 3, name: '야만인 투기장', min: 600 },
    { id: 4, name: '장난감 공방', min: 1000 }, { id: 5, name: '마법 계곡', min: 1300 }, { id: 6, name: '건축가 작업장', min: 1600 }, { id: 7, name: '왕실 경기장', min: 2000 }],
  CHESTS: {   // time: 초, gold: [최소,최대], cards: 총 카드 수, gems: [최소,최대], legend: 전설 카드 등장 확률
    wood:   { name: '나무 상자', time: 5,         gold: [40, 90],    cards: 8,  gems: [0, 0],   legend: 0.01 },
    silver: { name: '은 상자',   time: 3 * 3600,  gold: [120, 260],  cards: 20, gems: [0, 2],   legend: 0.05 },
    gold:   { name: '금 상자',   time: 8 * 3600,  gold: [420, 760],  cards: 50, gems: [2, 8],   legend: 0.15 },
    magic:  { name: '마법 상자', time: 12 * 3600, gold: [900, 1600], cards: 100, gems: [8, 20], legend: 0.4 }
  },
  CHEST_ODDS: { wood: 0.5, silver: 0.35, gold: 0.12, magic: 0.03 },
  FREE_CHEST_HOURS: 4, CROWN_CHEST_NEED: 10, MAX_LEVEL: 14,
  UPGRADE: { cards: [2, 4, 10, 20, 50, 100, 200, 400, 800, 1000, 2000, 5000, 10000], gold: [5, 20, 50, 150, 400, 1000, 2000, 4000, 8000, 20000, 50000, 100000, 200000] },
  XP_NEED: l => 100 + l * 100,
  TROPHY_WIN: [25, 32], TROPHY_LOSS: [25, 32],
  TUTORIAL_REWARD: { gold: 500, gems: 100 },
  CARD_INFO: {
    hog: { desc: '강을 뛰어넘어 건물만 노리는 빠른 라이더. 대포 같은 건물에 끌려요.', target: '건물' },
    musketeer: { desc: '멀리서 지상과 공중을 모두 저격하는 사격수.', target: '지상 / 공중' },
    icegolem: { desc: '느리지만 튼튼한 얼음 탱커. 죽으면 주변을 둔화시켜요.', target: '건물' },
    icespirit: { desc: '적에게 달려가 자폭하며 1.1초 동안 빙결시켜요.', target: '지상 / 공중' },
    skeletons: { desc: '작고 빠른 해골 3마리. 값싸게 강한 유닛을 막아요.', target: '지상' },
    cannon: { desc: '30초 동안 지상을 방어하는 건물. 호그를 끌어당겨요.', target: '지상' },
    fireball: { desc: '넓은 범위에 큰 피해와 넉백을 주는 화염 주문.', target: '지상 / 건물' },
    log: { desc: '굴러가며 지상 유닛을 밀어내는 전설 주문.', target: '지상' }
  },
  QUEST_POOL: [
    { id: 'battle', text: '전투 3회 하기', ev: 'end', target: 3, gold: 150 },
    { id: 'win', text: '전투 2회 승리', ev: 'win', target: 2, gold: 200 },
    { id: 'hogdmg', text: '호그라이더로 타워에 2000 피해', ev: 'tdmg:hog', target: 2000, gold: 200 },
    { id: 'spell', text: '주문 10회 사용', ev: 'spell', target: 10, gold: 150 },
    { id: 'skel', text: '해골 카드 8회 사용', ev: 'play:skeletons', target: 8, gold: 120 },
    { id: 'musk', text: '머스킷병으로 타워에 1500 피해', ev: 'tdmg:musketeer', target: 1500, gold: 180 },
    { id: 'tower', text: '프린세스타워 2개 파괴', ev: 'tower', target: 2, gold: 200 }],
  ACH: [
    { id: 'wins', text: '누적 승리', stat: 'wins', tiers: [5, 25, 100], gold: [200, 800, 3000] },
    { id: 'towers', text: '파괴한 타워', stat: 'towers', tiers: [10, 50, 200], gold: [150, 600, 2500] },
    { id: 'played', text: '사용한 카드', stat: 'played', tiers: [50, 300, 1500], gold: [100, 500, 2000] },
    { id: 'crowns', text: '획득한 크라운', stat: 'crowns', tiers: [10, 60, 250], gold: [150, 700, 2800] },
    { id: 'battles', text: '치른 전투', stat: 'battles', tiers: [10, 50, 200], gold: [100, 500, 2000] },
    { id: 'spells', text: '주문 사용', stat: 'spells', tiers: [20, 100, 500], gold: [120, 500, 2200] }],
  TIPS: ['호그라이더는 강을 뛰어넘어 건물만 공격합니다!', '대포는 호그를 끌어당겨요. 중앙에 놓아 보세요.', '파이어볼은 뭉친 유닛과 머스킷병에 효과적입니다.', '통나무는 지상 유닛 무리를 한 번에 밀어냅니다.',
    '엘릭서가 가득 차면 낭비예요. 빨리 카드를 내세요!', '마지막 1분은 엘릭서가 2배로 차오릅니다.', '프린세스타워를 부수면 그쪽 레인의 배치 영역이 넓어져요.', '아이스스피릿은 1엘릭서로 상대를 1.1초 얼려요.',
    '카드를 업그레이드하면 체력과 공격력이 10%씩 올라요.', '상자는 한 번에 하나만 열 수 있습니다. 미리 잠금 해제를 시작하세요.', '해골 3마리로 호그라이더를 막을 수 있어요.', '킹타워는 맞거나 프린세스타워가 부서지면 깨어납니다.'],
  LOAD_STEPS: ['서버에 연결하는 중...', '스프라이트 준비 중...', '카드 이미지 생성 중...', '애니메이션 프레임 굽는 중...', '아레나 지형 생성 중...', '이펙트 파티클 준비 중...', '사운드 합성 중...', '상자 보물 채우는 중...', '킹이 왕관을 쓰는 중...', '전투 준비 완료!'],
  FOES: ['불꽃호그', '얼음왕자', '해골대장', '골렘장인', '아처퀸', '마스터K', '호그신', '대포아저씨', '빙결요정', '통나무킹', '블루나이트', '레드폭풍', '카드요정', '왕관사냥꾼', '번개곰', '달빛늑대', '고블린상인', '불타는검', '별빛마법사', '철벽수문장'],
  CHATS: ['좋은 덱이네요!', '호그 장인 ㄷㄷ', '오늘 연승 가자!', '카드 기부 감사합니다~', '파이어볼 타이밍 미쳤다', '누가 친선전 해요?', '사이클 덱은 엘릭서 계산이 중요해요', '대포 놓는 위치 팁 있나요?', '방금 3크라운 했어요 ㅎㅎ', '다들 굿럭!', '해골로 호그 막는 거 꿀팁', '아레나 올라가고 싶다']
});
const CARDS = CONFIG.CARD_POOL;
const RARITY_KO = { common: '일반', rare: '희귀', epic: '영웅', legendary: '전설' };
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
function h(tag, a, ...kids) {
  const el = document.createElement(tag);
  if (a) for (const k in a) {
    const v = a[k]; if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'style') { if (typeof v === 'string') el.style.cssText = v; else Object.assign(el.style, v); }
    else if (k === 'html') el.innerHTML = v; else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2).toLowerCase(), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(3)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const fmt = n => Math.floor(n).toLocaleString('en-US');
const pick = a => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const now = () => Date.now();
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
function hms(ms) {
  ms = Math.max(0, Math.ceil(ms / 1000)); const hh = Math.floor(ms / 3600), mm = Math.floor(ms % 3600 / 60), ss = ms % 60;
  if (hh >= 24) return Math.floor(hh / 24) + '일 ' + (hh % 24) + '시간';
  if (hh > 0) return hh + '시간 ' + (mm < 10 ? '0' : '') + mm + '분';
  return mm + ':' + (ss < 10 ? '0' : '') + ss;
}
function seeded(seed) { let s = seed >>> 0 || 1; return () => (s = Math.imul(s ^ s >>> 15, 2246822507) + 1013904223 >>> 0) / 4294967296; }

/* ---------------- 아이콘 (인라인 SVG, 오리지널) ---------------- */
/* 그라디언트 정의는 전역 SVG 하나에 둔다 (숨겨진 화면 안의 defs 는 참조가 깨지기 때문) */
document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute;left:-9999px;top:0"><defs>' +
  '<linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff08a"/><stop offset="1" stop-color="#f0a000"/></linearGradient>' +
  '<linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9dffa0"/><stop offset="1" stop-color="#1fa84a"/></linearGradient>' +
  '<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f58bff"/><stop offset="1" stop-color="#a21fd0"/></linearGradient>' +
  '<linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cb6ff"/><stop offset="1" stop-color="#1b4fb8"/></linearGradient>' +
  '<linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff08a"/><stop offset="1" stop-color="#e8951b"/></linearGradient></defs></svg>');
const SV = (body, s, vb) => `<svg viewBox="${vb || '0 0 48 48'}" width="${s || 24}" height="${s || 24}" xmlns="http://www.w3.org/2000/svg" stroke="#14101c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
const ICONS = {
  coin: s => SV('<circle cx="24" cy="24" r="19" fill="url(#gc)"/><circle cx="24" cy="24" r="12" fill="none" stroke="#c77d00" stroke-width="3"/><path d="M19 24h10M24 19v10" stroke="#c77d00" stroke-width="3"/>', s),
  gem: s => SV('<polygon points="24,4 42,15 42,33 24,44 6,33 6,15" fill="url(#gg)"/><path d="M6 15L24 24 42 15M24 24v20" stroke="rgba(255,255,255,.65)" stroke-width="2" fill="none"/>', s),
  trophy: s => SV('<path d="M14 6h20v14a10 10 0 0 1-20 0z" fill="url(#gc)"/><path d="M14 10H6c0 8 3 12 9 13M34 10h8c0 8-3 12-9 13" fill="none"/><rect x="20" y="29" width="8" height="8" fill="#f0a000"/><rect x="12" y="37" width="24" height="7" rx="2" fill="#a56a14"/>', s),
  crown: s => SV('<path d="M5 36L8 13l11 10 5-14 5 14 11-10 3 23z" fill="url(#gc)"/><rect x="5" y="36" width="38" height="6" rx="2" fill="#f0a000"/>', s),
  crownGray: s => SV('<path d="M5 36L8 13l11 10 5-14 5 14 11-10 3 23z" fill="#4a4560"/><rect x="5" y="36" width="38" height="6" rx="2" fill="#38334c"/>', s),
  drop: s => SV('<path d="M24 4C30 14 38 20 38 30a14 14 0 0 1-28 0C10 20 18 14 24 4z" fill="url(#gd)"/><ellipse cx="18" cy="28" rx="3" ry="6" fill="rgba(255,255,255,.55)" stroke="none"/>', s),
  plus: s => SV('<path d="M24 10v28M10 24h28" stroke="#fff" stroke-width="8"/>', s),
  lock: s => SV('<rect x="10" y="20" width="28" height="22" rx="4" fill="#cfd8e6"/><path d="M16 20v-6a8 8 0 0 1 16 0v6" fill="none" stroke-width="5"/>', s),
  heart: s => SV('<path d="M24 41C8 30 6 20 10 14c4-5 11-3 14 3 3-6 10-8 14-3 4 6 2 16-14 27z" fill="#ff5a6a"/>', s),
  sword: s => SV('<path d="M12 36L36 12M30 8h10v10" stroke-width="9" fill="none"/><path d="M12 36L36 12M30 8h10v10" stroke="#e8f0ff" stroke-width="4" fill="none"/><path d="M8 40l6-6" stroke="#a56a14" stroke-width="5"/>', s),
  clock: s => SV('<circle cx="24" cy="25" r="17" fill="#fff"/><path d="M24 14v12l8 4" fill="none" stroke-width="4"/>', s),
  range: s => SV('<circle cx="24" cy="24" r="18" fill="#ffcf6a"/><circle cx="24" cy="24" r="10" fill="#fff"/><circle cx="24" cy="24" r="3" fill="#d6322a"/>', s),
  speed: s => SV('<path d="M6 30c8 0 8-14 18-14s6 14 18 14v8H6z" fill="#7fd8ff"/>', s),
  target: s => SV('<path d="M24 6l6 12h12l-10 8 4 14-12-9-12 9 4-14-10-8h12z" fill="#ff9a3a"/>', s),
  chest: s => SV('<rect x="6" y="22" width="36" height="20" rx="3" fill="#a8693a"/><path d="M6 24a18 14 0 0 1 36 0z" fill="#c98a52"/><path d="M15 12v30M33 12v30" stroke-width="4" stroke="#6b4423"/><rect x="20" y="24" width="8" height="10" rx="2" fill="#ffd23a"/>', s),
  cards: s => SV('<g transform="rotate(-12 24 24)"><rect x="7" y="7" width="22" height="32" rx="3" fill="#5a80ff"/></g><g transform="rotate(10 24 24)"><rect x="19" y="8" width="22" height="32" rx="3" fill="#b455ff"/><path d="M30 18l4 8-4 8-4-8z" fill="#fff" stroke-width="2"/></g>', s),
  swords: s => SV('<path d="M8 8l26 26M40 8L14 34" stroke-width="9" fill="none"/><path d="M8 8l26 26M40 8L14 34" stroke="#e8f0ff" stroke-width="4" fill="none"/><path d="M32 30l8 8M16 30l-8 8" stroke="#a56a14" stroke-width="6"/><circle cx="40" cy="40" r="3" fill="#ffd23a"/><circle cx="8" cy="40" r="3" fill="#ffd23a"/>', s),
  clan: s => SV('<path d="M24 4l16 6v12c0 10-7 17-16 20C15 39 8 32 8 22V10z" fill="url(#gc)"/><path d="M24 9l11 4v9c0 8-5 13-11 16-6-3-11-8-11-16v-9z" fill="#3b8cff"/><rect x="15" y="16" width="18" height="11" rx="4" fill="#fff"/><path d="M20 27l-2 5 6-5" fill="#fff"/>', s),
  tv: s => SV('<rect x="5" y="14" width="38" height="26" rx="4" fill="#d95a3a"/><rect x="9" y="18" width="30" height="18" rx="2" fill="#2a3a5a"/><path d="M16 12l8-7 8 7" fill="none"/><path d="M17 32l3-9 4 5 4-5 3 9z" fill="#ffd23a" stroke-width="2"/>', s),
  gear: s => SV('<circle cx="24" cy="24" r="15" fill="none" stroke="#14101c" stroke-width="12" stroke-dasharray="7 5.5"/><circle cx="24" cy="24" r="15" fill="none" stroke="#dfe7f3" stroke-width="7" stroke-dasharray="7 5.5"/><circle cx="24" cy="24" r="12" fill="#dfe7f3"/><circle cx="24" cy="24" r="5" fill="#34527f"/>', s),
  scroll: s => SV('<path d="M12 8h26a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H12z" fill="#f4ead0"/><path d="M18 16h18M18 23h18M18 30h12" stroke-width="3" fill="none"/>', s),
  medal: s => SV('<path d="M14 4h8l4 14M34 4h-8l-4 14" stroke-width="5" fill="#3b8cff"/><circle cx="24" cy="30" r="13" fill="url(#gc)"/><path d="M17 31l3-8 4 5 4-5 3 8z" fill="#fff" stroke-width="2"/>', s),
  rank: s => SV('<rect x="5" y="22" width="12" height="20" fill="#5aa8ff"/><rect x="18" y="10" width="12" height="32" fill="url(#gc)"/><rect x="31" y="28" width="12" height="14" fill="#c8884a"/>', s),
  quest: s => SV('<circle cx="24" cy="24" r="18" fill="#ff7a6a"/><circle cx="24" cy="24" r="11" fill="#fff"/><circle cx="24" cy="24" r="5" fill="#d6322a"/><path d="M24 24L40 8" stroke-width="4"/>', s),
  star: s => SV('<path d="M24 4l6 13 14 2-10 10 3 14-13-7-13 7 3-14L4 19l14-2z" fill="url(#gc)"/>', s),
  check: s => SV('<path d="M10 25l9 9 19-20" stroke="#7dee5c" stroke-width="8" fill="none"/>', s),
  pound: s => SV('<path d="M24 6v26M12 22l12 14 12-14" stroke="#fff" stroke-width="7" fill="none"/>', s),
  flag: s => SV('<path d="M12 6v38" stroke-width="5"/><path d="M12 8h24l-6 8 6 8H12z" fill="#ff6a5a"/>', s)
};
const ic = (n, s) => h('span', { class: 'ic', style: 'display:inline-flex;flex:none;line-height:0', html: ICONS[n](s || 24) });
const dropIc = (cost, s) => h('span', { style: `position:relative;display:inline-flex;width:${s}px;height:${s}px;align-items:center;justify-content:center;flex:none`, html: ICONS.drop(s) }, h('b', { class: 'ts2', style: `position:absolute;font-size:${Math.round(s * .5)}px;top:${Math.round(s * .28)}px` }, cost));

/* ---------------- 저장 ---------------- */
const Save = {
  KEY: 'clashArenaSave_v1', d: null,
  defaults() {
    const cards = {}; CARDS.forEach(id => cards[id] = { lv: 1, n: 0 });
    return {
      v: 1, name: 'Player', xp: 0, level: 1, gold: CONFIG.START.gold, gems: CONFIG.START.gems, trophies: CONFIG.START.trophies, best: 0,
      cards, decks: [CARDS.slice(), CARDS.slice(), CARDS.slice()], deck: 0, chests: [null, null, null, null], freeAt: 0, crown: { n: 0 }, boost: { gold: 0, crown: 0, speed: 0 },
      daily: { date: '', deals: [] }, quests: { date: '', list: [] }, ach: {}, road: { claimed: [] }, history: [],
      stats: { battles: 0, wins: 0, towers: 0, played: 0, crowns: 0, spells: 0 }, streak: 0, tut: { done: false, step: 0 },
      set: { sfx: 1, music: 0.7, muted: false, vibrate: true, fast: false, diff: 'normal', fps: false, devScale: 1 }, clan: { req: 0 }, friendly: 0, ev: { win3: { w: 0, l: 0, on: false } }
    };
  },
  merge(def, src) { for (const k in def) { if (src[k] === undefined) src[k] = JSON.parse(JSON.stringify(def[k])); else if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) this.merge(def[k], src[k]); } return src; },
  load() {
    let d = null;
    try { const raw = localStorage.getItem(this.KEY); if (raw) d = JSON.parse(raw); } catch (e) { d = null; }
    const def = this.defaults();
    this.d = d && typeof d === 'object' ? this.merge(def, d) : def;
    if (!this.d.v || this.d.v < 1) this.d.v = 1;
    CARDS.forEach(id => { if (!this.d.cards[id]) this.d.cards[id] = { lv: 1, n: 0 }; });
    this.d.decks = this.d.decks.map(dk => { const ok = Array.isArray(dk) && dk.length === 8 && dk.every(c => CARDS.includes(c)) && new Set(dk).size === 8; return ok ? dk : CARDS.slice(); });
    this.rollDaily(); return this.d;
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch (e) { } },
  reset() { try { localStorage.removeItem(this.KEY); } catch (e) { } this.d = this.defaults(); this.rollDaily(); },
  rollDaily() {
    const d = this.d, t = todayStr();
    if (d.quests.date !== t) {
      const rr = seeded(t.split('-').reduce((a, b) => a * 31 + +b, 7) + 1), pool = CONFIG.QUEST_POOL.slice(), list = [];
      while (list.length < 3 && pool.length) list.push(Object.assign({ prog: 0, claimed: false }, pool.splice(Math.floor(rr() * pool.length), 1)[0]));
      d.quests = { date: t, list };
    }
    if (d.daily.date !== t) {
      const rr = seeded(t.split('-').reduce((a, b) => a * 31 + +b, 3) + 9), ids = CARDS.slice(), deals = [];
      for (let i = 0; i < 6; i++) {
        const id = ids.splice(Math.floor(rr() * ids.length), 1)[0], r = CONFIG.cards[id].rarity, base = { common: 60, rare: 200, epic: 600, legendary: 2000 }[r], cnt = { common: 10, rare: 4, epic: 2, legendary: 1 }[r];
        deals.push({ id, cnt, base, bought: 0 });
      }
      d.daily = { date: t, deals };
    }
  }
};
const S = () => Save.d;
const effScale = () => (CONFIG.CHEST_TIME_SCALE || 1) * (S().set.devScale || 1);

/* ---------------- 음악 (mp3, 크로스페이드 루프) ---------------- */
const MUSIC_FILES = { menu: 'assets/audio/bgm_menu.mp3', battle: 'assets/audio/bgm_battle.mp3', x2: 'assets/audio/bgm_battle_x2.mp3', overtime: 'assets/audio/bgm_overtime.mp3', win: 'assets/audio/bgm_win.mp3', lose: 'assets/audio/bgm_lose.mp3' };
const Music = {
  vol: 0.7, muted: false, cur: null, act: [], xf: 3, ready: {}, blocked: false,
  preload(onDone) {
    let left = Object.keys(MUSIC_FILES).length; const done = () => { if (--left === 0 && onDone) onDone(); };
    for (const k in MUSIC_FILES) {
      const a = new Audio(); a.preload = 'auto'; let fin = false; const f = () => { if (fin) return; fin = true; this.ready[k] = a.readyState >= 2; done(); };
      a.addEventListener('canplaythrough', f, { once: true }); a.addEventListener('loadeddata', f, { once: true }); a.addEventListener('error', f, { once: true }); setTimeout(f, 6000);
      a.src = MUSIC_FILES[k]; try { a.load(); } catch (e) { }
    }
  },
  play(name, o) {
    o = o || {}; if (this.cur === name && !o.force) return; this.cur = name;
    for (const a of this.act) { a.tv = 0; a.rate = 1 / (o.out || 0.9); }
    if (!MUSIC_FILES[name]) return;
    const el = new Audio(MUSIC_FILES[name]); el.preload = 'auto';
    const a = { name, el, v: 0, tv: 1, rate: 1 / (o.fade || 1.2), loop: o.loop !== false, spawned: false };
    this.act.push(a); this._start(a);
  },
  stop(f) { this.cur = null; for (const a of this.act) { a.tv = 0; a.rate = 1 / (f || 0.8); } },
  _start(a) { const p = a.el.play(); if (p && p.catch) p.catch(() => { this.blocked = true; }); },
  unlock() { if (this.blocked) { this.blocked = false; for (const a of this.act) if (a.el.paused && a.tv > 0) this._start(a); } },
  setVol(v) { this.vol = v; }, setMuted(m) { this.muted = m; },
  update(dt) {
    for (const a of this.act.slice()) {
      a.v += Math.sign(a.tv - a.v) * Math.min(Math.abs(a.tv - a.v), a.rate * dt);
      try { a.el.volume = clamp(a.v * this.vol * (this.muted ? 0 : 1), 0, 1); } catch (e) { }
      const d = a.el.duration;
      if (a.loop && a.tv > 0 && !a.spawned && isFinite(d) && d > this.xf * 2 && a.el.currentTime > d - this.xf) {
        a.spawned = true; a.tv = 0; a.rate = 1 / this.xf;
        const el = new Audio(MUSIC_FILES[a.name]); const b = { name: a.name, el, v: 0, tv: 1, rate: 1 / this.xf, loop: true, spawned: false }; this.act.push(b); this._start(b);
      }
      if ((a.tv === 0 && a.v <= 0.001) || (!a.loop && a.el.ended)) { try { a.el.pause(); } catch (e) { } this.act.splice(this.act.indexOf(a), 1); }
    }
  }
};
document.addEventListener('visibilitychange', () => { for (const a of Music.act) { try { if (document.hidden) a.el.pause(); else if (a.tv > 0) Music._start(a); } catch (e) { } } });

/* ---------------- 토스트 / 모달 ---------------- */
const Toast = (msg, bad) => { const t = h('div', { class: 'toast ts2' + (bad ? ' bad' : '') }, msg); $('#toasts').append(t); setTimeout(() => t.remove(), 2300); if (bad) sfx('error'); };
function sfx(n, o) { try { game.sfx.play(n, o); } catch (e) { } }
function vib(ms) { try { if (S().set.vibrate && navigator.vibrate) navigator.vibrate(ms); } catch (e) { } }
function openModal(o) {
  const back = h('div', { class: 'mback' }), box = h('div', { class: 'modal', style: o.wide ? 'width:500px' : '' });
  const close = () => { back.classList.add('fadeout'); setTimeout(() => back.remove(), 180); if (o.onClose) o.onClose(); };
  if (o.title) box.append(h('div', { class: 'mhead ts' }, o.title));
  if (!o.noClose) box.append(h('button', { class: 'x ts2', onclick: () => { sfx('back'); close(); } }, '✕'));
  const body = h('div', { class: 'mbody' }); [].concat(o.body || []).forEach(b => body.append(b.nodeType ? b : h('div', { html: String(b) }))); box.append(body);
  if (o.buttons && o.buttons.length) { const f = h('div', { class: 'mfoot' }); o.buttons.forEach(b => f.append(h('button', { class: 'btn ' + (b.cls || 'y'), onclick: () => { sfx('click'); const r = b.fn ? b.fn() : undefined; if (r !== false) close(); } }, b.text))); box.append(f); }
  back.append(box); if (!o.noBackdropClose) back.addEventListener('pointerdown', e => { if (e.target === back && !o.noClose) close(); });
  $('#modals').append(back); return { el: box, back, close, body };
}
const confirmM = (msg, okText, cb, cls) => openModal({ title: '확인', body: h('div', { style: 'text-align:center;font-size:18px;padding:10px 4px;line-height:1.4', html: msg }), buttons: [{ text: '취소', cls: 'gray' }, { text: okText || '확인', cls: cls || 'g', fn: () => { cb(); } }] });

/* ---------------- 화면 매니저 ---------------- */
const SM = {
  map: {}, cur: null,
  reg(name, el) { el.classList.add('screen'); $('#screens').append(el); this.map[name] = el; return el; },
  go(name, o) {
    o = o || {}; const next = this.map[name], prevName = this.cur, prev = prevName && this.map[prevName];
    if (prev && prev !== next) { prev.classList.remove('vis'); setTimeout(() => { if (this.cur !== prevName) prev.classList.remove('show'); }, 320); }
    next.classList.add('show'); void next.offsetWidth; requestAnimationFrame(() => next.classList.add('vis')); this.cur = name;
  },
  hideAll() { for (const k in this.map) { this.map[k].classList.remove('vis', 'show'); } this.cur = null; }
};

/* ---------------- 재화 / 경험치 ---------------- */
const Cur = {
  disp: { gold: 0, gems: 0 }, anim: {},
  bind(kind, el) { this.el = this.el || {}; this.el[kind] = el; this.disp[kind] = S()[kind]; el.textContent = fmt(this.disp[kind]); },
  to(kind) {
    const el = this.el && this.el[kind]; if (!el) return; const from = this.disp[kind], to = S()[kind]; if (from === to) return;
    cancelAnimationFrame(this.anim[kind]); const t0 = performance.now(), dur = Math.min(900, 250 + Math.abs(to - from) * 2);
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); this.disp[kind] = from + (to - from) * e; el.textContent = fmt(this.disp[kind]); if (k < 1) this.anim[kind] = requestAnimationFrame(step); else { this.disp[kind] = to; el.textContent = fmt(to); } };
    this.anim[kind] = requestAnimationFrame(step);
  }
};
function uiPos(el) { const r = el.getBoundingClientRect(), u = $('#ui').getBoundingClientRect(), k = u.width / 540; return { x: (r.left + r.width / 2 - u.left) / k, y: (r.top + r.height / 2 - u.top) / k }; }
function fly(kind, from, n, onEach) {
  const target = Cur.el && Cur.el[kind === 'coin' ? 'gold' : 'gems']; if (!target || !from) { if (onEach) onEach(); return; }
  const tp = uiPos(target.parentElement), cnt = Math.min(n || 6, 10);
  for (let i = 0; i < cnt; i++) {
    const f = h('div', { class: 'fly', html: ICONS[kind](30) }); f.style.left = (from.x - 15) + 'px'; f.style.top = (from.y - 15) + 'px'; $('#ui').append(f);
    const dx = tp.x - from.x, dy = tp.y - from.y, ox = (Math.random() - .5) * 120, oy = (Math.random() - .5) * 80;
    const an = f.animate([{ transform: 'translate(0,0) scale(.5)', opacity: 0 }, { transform: `translate(${ox}px,${oy}px) scale(1.2)`, opacity: 1, offset: .3 }, { transform: `translate(${dx}px,${dy}px) scale(.8)`, opacity: 1 }], { duration: 700 + i * 60, easing: 'cubic-bezier(.4,0,.6,1)', delay: i * 40, fill: 'forwards' });
    an.onfinish = () => { f.remove(); sfx(kind === 'coin' ? 'coin' : 'gem'); };
  }
}
const Eco = {
  gold(n, from) { S().gold += n; Save.save(); if (from) fly('coin', from, Math.ceil(Math.abs(n) / 40)); Cur.to('gold'); },
  gems(n, from) { S().gems += n; Save.save(); if (from) fly('gem', from, Math.ceil(Math.abs(n) / 10)); Cur.to('gems'); },
  spendGold(n) { if (S().gold < n) { Toast('골드가 부족합니다', true); return false; } S().gold -= n; Save.save(); Cur.to('gold'); return true; },
  spendGems(n) { if (S().gems < n) { Toast('보석이 부족합니다', true); return false; } S().gems -= n; Save.save(); Cur.to('gems'); return true; },
  xp(n) {
    const s = S(); s.xp += n; let up = 0;
    while (s.xp >= CONFIG.XP_NEED(s.level)) { s.xp -= CONFIG.XP_NEED(s.level); s.level++; up++; }
    Save.save(); if (up) { sfx('levelup'); Toast('레벨 업! Lv.' + s.level); } if (Meta.home) Meta.home.refreshLevel(); return up;
  }
};
const boostOn = k => S().boost[k] > now();
const levelMulText = l => '×' + Math.pow(1.1, l - 1).toFixed(2);
const avgLevel = () => Math.max(1, Math.round(S().decks[S().deck].reduce((a, id) => a + S().cards[id].lv, 0) / 8));
const trophyArena = t => { let a = CONFIG.ARENAS[0]; for (const x of CONFIG.ARENAS) if (t >= x.min) a = x; return a; };
