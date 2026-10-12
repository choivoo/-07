class Sfx {
  constructor() { this.ctx = null; this.muted = false; this.vol = 1; this.last = {}; this.nbuf = null; }
  unlock() {
    if (!this.ctx) {
      try {
        const C = window.AudioContext || window.webkitAudioContext, c = this.ctx = new C();
        this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.9 * this.vol;
        this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -16; this.comp.knee.value = 12; this.comp.ratio.value = 5; this.comp.attack.value = 0.003; this.comp.release.value = 0.22;
        this.master.connect(this.comp); this.comp.connect(c.destination);
        const n = c.sampleRate; this.nbuf = c.createBuffer(1, n, n); const d = this.nbuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        const len = Math.floor(c.sampleRate * 1.4), ib = c.createBuffer(2, len, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const dd = ib.getChannelData(ch); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
        this.rev = c.createConvolver(); this.rev.buffer = ib; this.revG = c.createGain(); this.revG.gain.value = 0.32; this.rev.connect(this.revG); this.revG.connect(this.master);
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.9 * this.vol; }
  setVol(v) { this.vol = v; if (this.master && !this.muted) this.master.gain.value = 0.9 * v; }
  _route(g, o) {
    const c = this.ctx; let n = g;
    if (o && o.pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); g.connect(p); n = p; }
    n.connect(this.master);
    if (o && o.wet) { const w = c.createGain(); w.gain.value = o.wet; n.connect(w); w.connect(this.rev); }
  }
  tone(f0, f1, d, type, v, delay, o) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t0 = c.currentTime + (delay || 0), os = c.createOscillator(), g = c.createGain(), a = (o && o.attack) || 0.004;
    os.type = type || 'square'; os.frequency.setValueAtTime(Math.max(1, f0), t0); os.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0008, t0 + d);
    os.connect(g); this._route(g, o); os.start(t0); os.stop(t0 + d + 0.03);
  }
  noise(d, v, f0, f1, delay, o) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t0 = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), a = (o && o.attack) || 0.003;
    s.buffer = this.nbuf; fl.type = (o && o.type) || 'lowpass'; fl.Q.value = (o && o.q) || 0.8;
    fl.frequency.setValueAtTime(Math.max(20, f0), t0); fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1 || f0), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0008, t0 + d);
    s.connect(fl); fl.connect(g); this._route(g, o); s.start(t0, Math.random() * 0.5); s.stop(t0 + d + 0.03);
  }
  thump(f0, f1, d, v, delay, o) { this.tone(f0, f1, d, 'sine', v, delay, o); }
  voice(f0, f1, d, fm1, fm2, v, delay, o) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t0 = c.currentTime + (delay || 0), os = c.createOscillator(), g = c.createGain();
    os.type = 'sawtooth'; os.frequency.setValueAtTime(f0, t0); os.frequency.linearRampToValueAtTime(f1, t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.03); g.gain.setValueAtTime(v, t0 + d * 0.65); g.gain.exponentialRampToValueAtTime(0.0008, t0 + d);
    for (const fm of [fm1, fm2]) { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = fm; b.Q.value = 5; os.connect(b); b.connect(g); }
    this._route(g, o); os.start(t0); os.stop(t0 + d + 0.03);
  }
  arp(notes, step, type, v, o, dur) { notes.forEach((f, i) => this.tone(f, f, dur || step * 1.8, type, v, i * step, o)); }
  play(n, opt) {
    if (!this.ctx || this.muted) return;
    if (typeof opt === 'number') opt = { x: opt };
    const o = opt || {}, now = performance.now(), gap = { hit: 35, shoot: 40, arrow: 45, click: 20 }[n] || 30;
    if (this.last[n] && now - this.last[n] < gap) return; this.last[n] = now;
    const P = o.x !== undefined ? clamp((o.x - 9) / 9 * 0.85, -0.85, 0.85) : (o.pan || 0), r = 1 + rnd(-0.07, 0.07), po = { pan: P }, pw = { pan: P, wet: 0.5 };
    switch (n) {
      /* ----- UI ----- */
      case 'click': this.tone(880 * r, 520, 0.05, 'square', 0.12); this.noise(0.03, 0.08, 4000, 2000, 0, { type: 'highpass' }); break;
      case 'tab': this.tone(520, 520, 0.05, 'triangle', 0.15); this.tone(780, 780, 0.07, 'triangle', 0.15, 0.05); break;
      case 'back': this.tone(520, 340, 0.1, 'triangle', 0.15); break;
      case 'coin': this.tone(1480, 1480, 0.06, 'square', 0.1); this.tone(1976, 1976, 0.22, 'square', 0.1, 0.05, { wet: 0.3 }); this.tone(3951, 3951, 0.18, 'sine', 0.05, 0.05); break;
      case 'gem': this.arp([1568, 2093, 2637], 0.05, 'sine', 0.13, { wet: 0.5 }, 0.25); this.tone(4186, 4186, 0.3, 'sine', 0.05, 0.12); break;
      case 'error': this.tone(180, 120, 0.2, 'sawtooth', 0.16); this.tone(150, 100, 0.2, 'square', 0.1, 0.1); break;
      case 'deny': this.tone(210, 140, 0.14, 'square', 0.12); break;
      case 'match': this.arp([523, 659, 784], 0.09, 'square', 0.12, { wet: 0.3 }); this.tone(1047, 1047, 0.4, 'triangle', 0.12, 0.28, { wet: 0.4 }); break;
      case 'levelup': this.arp([523, 659, 784, 1047, 1319], 0.08, 'triangle', 0.18, { wet: 0.5 }, 0.4); this.tone(2093, 2093, 0.7, 'sine', 0.08, 0.4, { wet: 0.6 }); break;
      case 'upgrade': this.thump(140, 60, 0.18, 0.5); this.noise(0.12, 0.3, 6000, 3000, 0, { type: 'bandpass', q: 3 }); this.tone(1200, 1200, 0.5, 'triangle', 0.1, 0.05, { wet: 0.6 }); this.arp([784, 988, 1175, 1568], 0.07, 'sine', 0.1, { wet: 0.6 }, 0.35); break;
      case 'chest_land': this.thump(110, 35, 0.4, 0.8); this.noise(0.35, 0.4, 900, 120); this.tone(300, 200, 0.12, 'square', 0.08, 0.03); break;
      case 'chest_hit': this.thump(180, 90, 0.12, 0.5); this.noise(0.08, 0.25, 2200, 600, 0, { type: 'bandpass' }); this.tone(500 * r, 420, 0.1, 'triangle', 0.1); break;
      case 'chest_open': this.noise(0.9, 0.35, 400, 6000, 0, { type: 'bandpass', q: 1.2 }); this.arp([392, 494, 587, 784, 988, 1175], 0.06, 'triangle', 0.14, { wet: 0.6 }, 0.5); this.thump(70, 30, 0.5, 0.6); break;
      case 'card_common': this.tone(660, 990, 0.18, 'triangle', 0.16, 0, { wet: 0.3 }); this.noise(0.1, 0.12, 5000, 2500, 0, { type: 'highpass' }); break;
      case 'card_rare': this.arp([659, 880, 1109], 0.06, 'triangle', 0.17, { wet: 0.4 }, 0.3); this.noise(0.25, 0.14, 3000, 8000, 0, { type: 'bandpass' }); break;
      case 'card_epic': this.arp([523, 659, 784, 1047], 0.07, 'sawtooth', 0.09, { wet: 0.5 }, 0.4); this.arp([1047, 1319, 1568, 2093], 0.07, 'sine', 0.13, { wet: 0.7 }, 0.5); this.thump(90, 45, 0.4, 0.5); break;
      case 'card_legend': this.thump(60, 28, 1.0, 0.8); this.noise(1.2, 0.35, 200, 8000, 0, { type: 'bandpass', q: 0.8 }); this.arp([392, 523, 659, 784, 1047, 1319, 1568, 2093], 0.09, 'sawtooth', 0.09, { wet: 0.8 }, 0.7); this.arp([784, 1047, 1319, 1568, 2093, 2637], 0.09, 'sine', 0.14, { wet: 0.8 }, 0.9); break;
      case 'stamp': this.thump(120, 40, 0.25, 0.7); this.noise(0.12, 0.3, 1500, 300); break;
      case 'whoosh': this.noise(0.3, 0.2, 300, 3000, 0, { type: 'bandpass', q: 1 }); break;
      case 'tick': this.tone(800, 800, 0.1, 'square', 0.14); this.thump(120, 80, 0.08, 0.2); break;
      case 'go': this.tone(1200, 1200, 0.3, 'square', 0.15); this.tone(1800, 1800, 0.4, 'square', 0.1); this.thump(90, 40, 0.4, 0.6); this.noise(0.5, 0.2, 500, 5000, 0, { type: 'bandpass' }); break;
      /* ----- 전투: 배치 (카드별) ----- */
      case 'place': this.noise(0.18, 0.22, 500, 2600, 0, { type: 'bandpass', q: 1.4, ...po }); this.tone(300 * r, 720, 0.12, 'triangle', 0.2, 0, po); break;
      case 'place_hog': this.thump(95, 45, 0.2, 0.55, 0, po); this.noise(0.14, 0.25, 700, 200, 0.02, po); this.thump(85, 40, 0.18, 0.4, 0.14, po); break;
      case 'place_musketeer': this.tone(1800, 1200, 0.04, 'square', 0.12, 0, po); this.tone(1300, 900, 0.05, 'square', 0.12, 0.09, po); this.noise(0.06, 0.2, 5000, 3000, 0.09, { type: 'highpass', ...po }); this.tone(660, 990, 0.12, 'triangle', 0.14, 0.12, pw); break;
      case 'place_icegolem': this.noise(0.4, 0.3, 4000, 900, 0, { type: 'highpass', ...pw }); this.thump(70, 32, 0.45, 0.7, 0.05, po); this.tone(2200, 1400, 0.3, 'sine', 0.06, 0, pw); break;
      case 'place_icespirit': this.arp([1760, 2217, 2637, 3520], 0.045, 'sine', 0.1, pw, 0.2); this.noise(0.15, 0.1, 9000, 5000, 0, { type: 'highpass', ...po }); break;
      case 'place_skeletons': for (let i = 0; i < 5; i++) this.noise(0.04, 0.2, 2600 + rnd(-500, 800), 1500, i * 0.035 + rnd(0, .02), { type: 'bandpass', q: 4, pan: P + rnd(-.2, .2) }); this.tone(220, 330, 0.15, 'triangle', 0.1, 0.1, po); break;
      case 'place_cannon': this.thump(80, 36, 0.3, 0.8, 0, po); this.noise(0.2, 0.3, 1500, 200, 0, po); this.tone(520, 380, 0.4, 'triangle', 0.1, 0.02, pw); this.tone(1040, 760, 0.35, 'sine', 0.05, 0.02, pw); break;
      case 'place_fireball': this.noise(0.5, 0.3, 3000, 400, 0, { type: 'bandpass', q: 1.2, ...po }); this.tone(900, 200, 0.5, 'sawtooth', 0.07, 0, po); break;
      case 'place_log': this.noise(0.7, 0.3, 250, 120, 0, po); this.thump(70, 40, 0.5, 0.5, 0, po); this.tone(140, 110, 0.5, 'sawtooth', 0.06, 0.05, po); break;
      /* ----- 전투: 타격/사격/폭발 ----- */
      case 'hit': this.noise(0.07, 0.3, 2400 * r, 500, 0, { type: 'bandpass', q: 1.3, ...po }); this.thump(180 * r, 70, 0.1, 0.45, 0, po); this.tone(900 * r, 300, 0.05, 'square', 0.06, 0, po); break;
      case 'hit_heavy': this.thump(110 * r, 40, 0.22, 0.8, 0, po); this.noise(0.2, 0.4, 1800, 150, 0, po); this.tone(300, 120, 0.1, 'square', 0.12, 0, po); break;
      case 'hit_tower': this.thump(90 * r, 38, 0.25, 0.6, 0, po); this.noise(0.18, 0.3, 1200, 200, 0, { type: 'lowpass', ...pw }); this.tone(1400 * r, 900, 0.06, 'square', 0.05, 0, po); break;
      case 'shoot': this.noise(0.05, 0.4, 7000, 3000, 0, { type: 'highpass', ...po }); this.tone(1100, 160, 0.09, 'square', 0.14, 0, po); this.thump(140, 55, 0.14, 0.5, 0, po); this.noise(0.3, 0.14, 1800, 300, 0.04, pw); break;
      case 'arrow': this.noise(0.09, 0.14, 3000, 6000, 0, { type: 'bandpass', q: 2, ...po }); this.tone(1500 * r, 700, 0.07, 'triangle', 0.06, 0, po); break;
      case 'cannon': this.thump(100, 30, 0.35, 1, 0, po); this.noise(0.4, 0.55, 1800, 120, 0, pw); this.tone(260, 70, 0.2, 'sawtooth', 0.14, 0, po); this.noise(0.1, 0.25, 7000, 4000, 0, { type: 'highpass', ...po }); break;
      case 'boom': this.noise(1.0, 0.7, 3500, 70, 0, pw); this.thump(70, 24, 0.7, 1, 0, po); this.noise(0.5, 0.3, 9000, 2000, 0.02, { type: 'highpass', ...po }); this.noise(0.6, 0.22, 800, 100, 0.12, pw); this.tone(180, 40, 0.5, 'sawtooth', 0.12, 0, po); break;
      case 'whoosh_fire': this.noise(0.95, 0.3, 2600, 500, 0, { type: 'bandpass', q: 1.5, ...po }); this.tone(1100, 220, 0.9, 'sawtooth', 0.06, 0, po); break;
      case 'tower': this.thump(60, 20, 1.2, 1, 0, pw); this.noise(1.4, 0.7, 2500, 60, 0, pw); for (let i = 0; i < 7; i++) this.noise(0.06, 0.28, 1800 + rnd(-300, 600), 600, 0.15 + i * 0.12 + rnd(0, .08), { type: 'bandpass', q: 3, pan: P + rnd(-.3, .3) }); this.tone(90, 30, 1.0, 'square', 0.14, 0.05, po); break;
      case 'crown': this.arp([523, 659, 784, 1047], 0.07, 'sawtooth', 0.1, { wet: 0.5 }, 0.3); this.arp([1047, 1319, 1568], 0.08, 'triangle', 0.13, { wet: 0.6 }, 0.5); this.noise(0.4, 0.2, 5000, 9000, 0, { type: 'highpass' }); break;
      case 'freeze': this.arp([2093, 2637, 3136, 4186], 0.04, 'sine', 0.1, pw, 0.3); this.noise(0.4, 0.3, 8000, 3000, 0, { type: 'highpass', ...pw }); this.thump(120, 60, 0.2, 0.3, 0, po); break;
      case 'hog': this.voice(185, 230, 0.2, 650, 1000, 0.5, 0, pw); this.voice(215, 150, 0.4, 420, 1500, 0.5, 0.21, pw); this.thump(90, 45, 0.15, 0.3, 0.05, po); break;
      case 'full': this.arp([660, 880, 1100, 1320], 0.06, 'square', 0.09, { wet: 0.3 }, 0.18); break;
      case 'elixir': this.tone(880, 1320, 0.08, 'sine', 0.08); break;
      case 'win': this.arp([523, 659, 784, 1047], 0.12, 'square', 0.12, { wet: 0.5 }, 0.3); break;
      case 'lose': this.arp([392, 330, 262, 196], 0.2, 'sawtooth', 0.1, { wet: 0.5 }, 0.4); break;
    }
  }
}
