/* ===== 메타 그리기: 상자 / 아레나 미니어처 / 로고 / 캐릭터 (모두 오리지널 벡터) ===== */
function drawChest(c, type, o) {
  o = o || {}; const open = o.open || 0, t = o.t || 0, shake = o.shake || 0;
  const P = { wood: ['#b87a42', '#7a4a22', '#ffd23a', '#d9a066'], silver: ['#a9bddb', '#5f7596', '#ffe27a', '#d3e0f2'], gold: ['#f6c243', '#b8791a', '#fff2a0', '#ffe07a'], magic: ['#b25cf0', '#5a2a96', '#ffe27a', '#e1b0ff'] }[type] || ['#b87a42', '#7a4a22', '#ffd23a', '#d9a066'];
  c.clearRect(0, 0, 200, 200); c.save();
  if (type === 'magic' || open > 0) {
    const g = c.createRadialGradient(100, 112, 10, 100, 112, 96); const a = 0.3 + 0.2 * Math.sin(t * 3) + open * 0.5;
    g.addColorStop(0, type === 'magic' ? `rgba(220,150,255,${a})` : `rgba(255,230,120,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 200, 200);
  }
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(100, 176, 72, 12, 0, 0, 6.3); c.fill();
  c.translate(100, 170); c.rotate(Math.sin(t * 40) * shake * 0.06); c.translate(-100, -170);
  L(c, 5);
  rr(c, 34, 100, 132, 72, 10, P[0]);
  c.save(); c.strokeStyle = 'rgba(20,16,28,.35)'; c.lineWidth = 3; for (const y of [122, 144]) { c.beginPath(); c.moveTo(38, y); c.lineTo(162, y); c.stroke(); } c.restore(); L(c, 5);
  rr(c, 50, 100, 20, 72, 3, P[1]); rr(c, 130, 100, 20, 72, 3, P[1]);
  if (open > 0) {   // 열린 내부 + 빛줄기
    L(c, 5); c.beginPath(); c.ellipse(100, 101, 60, 12 + open * 6, 0, 0, 6.3); c.fillStyle = '#2a1608'; c.fill(); c.stroke();
    c.save(); c.globalAlpha = Math.min(1, open * 1.2) * (0.7 + 0.3 * Math.sin(t * 8)); const bg = c.createLinearGradient(0, 100, 0, -20); bg.addColorStop(0, 'rgba(255,240,150,.95)'); bg.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = bg;
    c.beginPath(); c.moveTo(48, 102); c.lineTo(20, -10); c.lineTo(180, -10); c.lineTo(152, 102); c.closePath(); c.fill(); c.restore(); L(c, 5);
  }
  c.save(); c.translate(34 - open * 22, 100 - open * 34); c.rotate(-open * 0.55); c.translate(-34, -100);
  c.beginPath(); c.moveTo(34, 100); c.bezierCurveTo(34, 50, 166, 50, 166, 100); c.closePath(); c.fillStyle = P[3]; c.fill(); c.stroke();
  c.save(); c.strokeStyle = 'rgba(20,16,28,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(44, 84); c.quadraticCurveTo(100, 54, 156, 84); c.stroke(); c.restore();
  L(c, 5); c.beginPath(); c.moveTo(50, 100); c.bezierCurveTo(50, 66, 70, 58, 70, 58); c.lineTo(70, 100); c.closePath(); c.fillStyle = P[1]; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(130, 100); c.lineTo(130, 58); c.bezierCurveTo(130, 58, 150, 66, 150, 100); c.closePath(); c.fill(); c.stroke();
  rr(c, 88, 92, 24, 24, 5, P[2]); c.restore();
  if (!open) { L(c, 3); ell(c, 100, 104, 4, 4, '#14101c'); c.fillStyle = '#14101c'; c.fillRect(98, 104, 4, 8); }
  if (type === 'magic' || type === 'gold') { c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.7, x = 100 + Math.cos(a) * (70 + i * 4), y = 100 + Math.sin(a * 1.3) * 54; c.globalAlpha = .5 + .5 * Math.sin(t * 5 + i); c.beginPath(); c.moveTo(x, y - 7); c.lineTo(x + 2, y - 2); c.lineTo(x + 7, y); c.lineTo(x + 2, y + 2); c.lineTo(x, y + 7); c.lineTo(x - 2, y + 2); c.lineTo(x - 7, y); c.lineTo(x - 2, y - 2); c.fill(); } c.globalAlpha = 1; }
  c.restore();
}

function isoBase(c, top, sideL, sideR) {
  c.lineJoin = 'round'; L(c, 5);
  c.beginPath(); c.moveTo(20, 175); c.lineTo(150, 240); c.lineTo(150, 278); c.lineTo(20, 213); c.closePath(); c.fillStyle = sideL; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(280, 175); c.lineTo(150, 240); c.lineTo(150, 278); c.lineTo(280, 213); c.closePath(); c.fillStyle = sideR; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(150, 110); c.lineTo(280, 175); c.lineTo(150, 240); c.lineTo(20, 175); c.closePath(); c.fillStyle = top; c.fill(); c.stroke();
}
function drawArenaMini(c, id, t) {
  c.clearRect(0, 0, 300, 300); t = t || 0; L(c, 4);
  const T = [['#6db85a', '#3e6e34', '#2f5628'], ['#6a5a86', '#3a2f55', '#2c2342'], ['#d9b16a', '#8a6a34', '#6e5226'], ['#4aa0e8', '#256aa8', '#1b5086'], ['#3fb8a8', '#7a3fc0', '#5a2d96'], ['#b68a52', '#7a5630', '#5e4222'], ['#78c850', '#8a8f9a', '#6a707c']][id - 1] || [];
  isoBase(c, T[0], T[1], T[2]);
  const cx = 150, cy = 172;
  if (id === 1) { // 고블린 경기장: 오두막
    rr(c, cx - 38, cy - 40, 76, 56, 6, '#a8763c'); poly(c, [[cx - 52, cy - 38], [cx, cy - 92], [cx + 52, cy - 38]], '#c44a3a'); rr(c, cx - 12, cy - 12, 24, 28, 8, '#4a2a14'); ell(c, cx + 52, cy + 20, 14, 18, '#4fa23e');
    ln(c, cx - 60, cy + 18, cx - 60, cy - 30, 4, '#6b4423'); poly(c, [[cx - 58, cy - 30], [cx - 36, cy - 24], [cx - 58, cy - 16]], '#7dee5c');
  } else if (id === 2) { // 해골 구덩이
    ell(c, cx, cy + 6, 70, 26, '#241a38'); ell(c, cx, cy - 20, 44, 40, '#efe9d6'); rr(c, cx - 26, cy + 8, 52, 22, 6, '#efe9d6'); ell(c, cx - 15, cy - 20, 11, 13, '#14101c'); ell(c, cx + 15, cy - 20, 11, 13, '#14101c');
    ell(c, cx - 15, cy - 20, 5, 6, '#c060ff'); ell(c, cx + 15, cy - 20, 5, 6, '#c060ff'); poly(c, [[cx, cy - 6], [cx - 4, cy + 2], [cx + 4, cy + 2]], '#14101c'); ln(c, cx - 80, cy + 20, cx - 40, cy + 34, 7, '#efe9d6'); ln(c, cx + 80, cy + 18, cx + 44, cy + 34, 7, '#efe9d6');
  } else if (id === 3) { // 야만인 투기장
    ell(c, cx, cy + 4, 88, 44, '#a8763c'); ell(c, cx, cy + 4, 70, 33, '#e8cf94'); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, x = cx + Math.cos(a) * 88, y = cy + 4 + Math.sin(a) * 44; rr(c, x - 6, y - 30, 12, 34, 3, '#7a4a22'); }
    ln(c, cx, cy + 10, cx, cy - 70, 5, '#6b4423'); poly(c, [[cx, cy - 70], [cx + 40, cy - 56], [cx, cy - 42]], '#d6322a');
  } else if (id === 4) { // 장난감 공방
    rr(c, cx - 56, cy - 12, 52, 44, 6, '#ff5a5a'); rr(c, cx + 4, cy - 2, 52, 34, 6, '#ffd23a'); rr(c, cx - 30, cy - 52, 46, 40, 6, '#5adf6a'); ell(c, cx + 60, cy + 30, 18, 18, '#e8f0ff'); ell(c, cx + 60, cy + 30, 7, 7, '#2468d6');
    c.save(); c.translate(cx - 62, cy + 36); c.rotate(t); ell(c, 0, 0, 16, 16, '#cfd8e6'); ell(c, 0, 0, 6, 6, '#6c7a92'); c.restore();
  } else if (id === 5) { // 마법 계곡
    for (const [dx, h, col] of [[-50, 60, '#ff7ad8'], [-14, 90, '#b27aff'], [26, 70, '#7ad8ff'], [58, 46, '#ff9ad8']]) poly(c, [[cx + dx - 14, cy + 12], [cx + dx, cy + 12 - h], [cx + dx + 14, cy + 12]], col);
    c.save(); c.globalAlpha = .7 + .3 * Math.sin(t * 3); const gg = c.createRadialGradient(cx, cy - 94 + Math.sin(t * 2) * 5, 2, cx, cy - 94, 26); gg.addColorStop(0, '#fff'); gg.addColorStop(1, 'rgba(200,120,255,0)'); c.fillStyle = gg; c.fillRect(cx - 40, cy - 134, 80, 80); c.restore();
  } else if (id === 6) { // 건축가 작업장
    rr(c, cx - 70, cy - 4, 140, 36, 4, '#c8884a'); for (let i = 0; i < 4; i++) ln(c, cx - 52 + i * 34, cy - 2, cx - 52 + i * 34, cy + 30, 2, '#7a4a22');
    rr(c, cx - 50, cy - 70, 16, 70, 3, '#a8763c'); ln(c, cx - 42, cy - 66, cx + 50, cy - 82 + Math.sin(t * 1.5) * 6, 9, '#8a5a2c'); ln(c, cx + 50, cy - 82 + Math.sin(t * 1.5) * 6, cx + 50, cy - 40, 3, '#e8f0ff'); rr(c, cx + 38, cy - 42, 24, 18, 3, '#9aa3ad');
    c.save(); c.translate(cx - 6, cy - 20); c.rotate(-t); ell(c, 0, 0, 20, 20, '#cfd8e6'); ell(c, 0, 0, 7, 7, '#6c7a92'); c.restore(); ell(c, cx + 62, cy - 4, 24, 24, '#4fa23e');
  } else if (id === 7) { // 왕실 경기장
    rr(c, cx - 34, cy - 56, 68, 84, 4, '#aab2bf'); for (const dx of [-62, 62]) { rr(c, cx + dx - 18, cy - 38, 36, 66, 4, '#bcc4d0'); poly(c, [[cx + dx - 24, cy - 38], [cx + dx, cy - 76], [cx + dx + 24, cy - 38]], '#3b8cff'); }
    poly(c, [[cx - 40, cy - 56], [cx, cy - 104], [cx + 40, cy - 56]], '#3b8cff'); rr(c, cx - 14, cy - 8, 28, 36, 12, '#6b4423'); ln(c, cx, cy - 104, cx, cy - 128, 4, '#6b4423'); poly(c, [[cx, cy - 128], [cx + 28, cy - 120], [cx, cy - 112]], '#ffd23a');
  }
}

const logoSVG = (w) => `<svg viewBox="0 0 240 220" width="${w || 240}" xmlns="http://www.w3.org/2000/svg" stroke="#14101c" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<path d="M30 40L190 190M210 40L50 190" stroke-width="22" fill="none"/><path d="M30 40L190 190M210 40L50 190" stroke="#e8f0ff" stroke-width="12" fill="none"/>
<path d="M186 174l22 22M54 174l-22 22" stroke="#a56a14" stroke-width="14"/>
<path d="M120 24l66 24v52c0 40-28 70-66 86-38-16-66-46-66-86V48z" fill="url(#lg2)"/><path d="M120 40l50 18v42c0 32-22 56-50 70-28-14-50-38-50-70V58z" fill="url(#lg1)"/>
<path d="M92 108l10-32 18 18 18-18 10 32z" fill="url(#lg2)" stroke-width="5"/><rect x="90" y="108" width="60" height="9" rx="3" fill="#f0a000" stroke-width="4"/></svg>`;
const kingSVG = (s) => `<svg viewBox="0 0 120 130" width="${s || 96}" xmlns="http://www.w3.org/2000/svg" stroke="#14101c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M10 130c0-24 22-34 50-34s50 10 50 34z" fill="#3b8cff"/><path d="M36 96l24 22 24-22" fill="#fff"/><circle cx="60" cy="62" r="34" fill="#f0b98d"/><path d="M28 66c-2 30 14 46 32 46s34-16 32-46c-6 14-18 20-32 20s-26-6-32-20z" fill="#f4f1e6"/><path d="M42 74q18 10 36 0q-4 8-18 8t-18-8z" fill="#dcd6c4" stroke-width="2"/><circle cx="48" cy="58" r="4.5" fill="#14101c"/><circle cx="72" cy="58" r="4.5" fill="#14101c"/><path d="M40 50l14 3M80 50l-14 3" stroke-width="4" fill="none"/><ellipse cx="60" cy="68" rx="6" ry="4.5" fill="#e8a070"/><path d="M26 40l6-30 16 18 12-24 12 24 16-18 6 30z" fill="url(#gc)"/><rect x="26" y="38" width="68" height="9" rx="3" fill="#f0a000"/><circle cx="60" cy="42" r="3.5" fill="#d6322a" stroke-width="2"/></svg>`;
const goblinSVG = (s) => `<svg viewBox="0 0 160 160" width="${s || 140}" xmlns="http://www.w3.org/2000/svg" stroke="#14101c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M20 160c0-30 24-42 60-42s60 12 60 42z" fill="#6a4cc0"/><path d="M14 66c-14-6-14-26-6-34 10 4 22 12 30 26zM146 66c14-6 14-26 6-34-10 4-22 12-30 26z" fill="#8fd04a"/><ellipse cx="80" cy="76" rx="50" ry="46" fill="#9fdc55"/><ellipse cx="58" cy="66" rx="14" ry="12" fill="#fff"/><ellipse cx="102" cy="66" rx="14" ry="12" fill="#fff"/><circle cx="60" cy="68" r="5" fill="#14101c"/><circle cx="100" cy="68" r="5" fill="#14101c"/><circle cx="58" cy="66" r="14" fill="none" stroke-width="3"/><circle cx="102" cy="66" r="14" fill="none" stroke-width="3"/><path d="M72 66h16" stroke-width="3"/><path d="M80 74l-8 14h16z" fill="#8cc43e" stroke-width="3"/><path d="M52 98q28 22 56 0" fill="#fff" stroke-width="4"/><path d="M52 98q28 22 56 0" fill="none"/><path d="M52 40q28-22 56 0" fill="#e8e8e8" stroke-width="3"/></svg>`;
function packSVG(kind, lv, s) {
  const items = []; const n = [4, 9, 16][lv]; const gem = kind === 'gem';
  for (let i = 0; i < n; i++) { const x = 30 + (i * 37 % 60) + (i % 3) * 4, y = 62 - Math.floor(i / 3) * 6 - (i * 13 % 8); items.push(gem ? `<polygon points="${x},${y - 9} ${x + 9},${y - 3} ${x + 9},${y + 5} ${x},${y + 10} ${x - 9},${y + 5} ${x - 9},${y - 3}" fill="url(#gg)" stroke-width="2.5"/>` : `<circle cx="${x}" cy="${y}" r="8" fill="url(#gc)" stroke-width="2.5"/>`); }
  const base = lv === 0 ? '<path d="M24 78q-6-26 8-40h36q14 14 8 40z" fill="#a8763c"/><path d="M34 40h32" stroke-width="5"/>' : lv === 1 ? '<rect x="12" y="52" width="76" height="30" rx="5" fill="#a8763c"/><circle cx="26" cy="86" r="9" fill="#6b4423"/><circle cx="74" cy="86" r="9" fill="#6b4423"/>' : '<path d="M4 88L36 34h28l32 54z" fill="#7a5630"/>';
  return `<svg viewBox="0 0 100 100" width="${s || 86}" height="${s || 86}" xmlns="http://www.w3.org/2000/svg" stroke="#14101c" stroke-width="3.5" stroke-linejoin="round">${base}${items.join('')}</svg>`;
}
function chestCanvas(type, o, size) {
  const cv = h('canvas', { width: 200, height: 200, style: size ? `width:${size}px;height:${size}px` : '' }); const c = cv.getContext('2d'); drawChest(c, type, o || {}); cv._draw = (oo) => drawChest(c, type, oo); return cv;
}
const cardImg = id => { const a = (window.ART_DATA && ART_DATA.cards[id]) || ''; return h('img', { src: a, draggable: 'false', alt: id }); };
