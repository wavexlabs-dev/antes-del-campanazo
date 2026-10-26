/* A continuous illustrated stage. Text and numerical evidence live in the DOM. */
const C = Object.freeze({
  paper: '#f5f2ea', ink: '#292b25', soft: '#64675c', rule: '#d8d8cb',
  ghost: '#e9e8dd', accent: '#bd5b3d', wash: '#ead5c5', gold: '#b18b49',
  leaf: '#8a9675', cream: '#fffaf0', eye: '#24251f', blue: '#758e99'
});
const POSES = [
  [248, 354, .88], [210, 354, 1], [214, 350, 1.18], [301, 365, .85],
  [69, 389, .57], [227, 358, .98], [304, 339, .92], [172, 354, 1.05], [258, 348, 1.16]
];
const DEFAULTS = { year: 2025, age: 5, branch: -1, economy: 'adoption', flow: 'primary' };
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export class StoryStage {
  constructor(canvas, { motion = true } = {}) {
    if (!canvas?.getContext) throw new TypeError('StoryStage needs a canvas element');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gsap = window.gsap;
    this.motion = Boolean(motion);
    this.index = 0;
    this.options = { ...DEFAULTS };
    this.previous = null;
    this.travel = { progress: 1, direction: 1 };
    this.pose = { x: POSES[0][0], y: POSES[0][1], z: POSES[0][2], walk: 0, look: 0, jump: 0 };
    this.detail = { growth: 2, activity: 1 };
    this.bell = { phase: 1, angle: 0, rung: false };
    this.clock = 0;
    this.sectionProgress = 0;
    this._lastTick = 0;
    this._ticking = false;
    this._disposed = false;
    this._tick = time => {
      if (this._disposed || document.hidden) return;
      const dt = this._lastTick ? Math.min(time - this._lastTick, .06) : 0;
      this._lastTick = time;
      this.clock += dt;
      this.draw();
    };
    this._onVisibility = () => this._syncPlayback();
    this._onResize = () => this.draw();
    document.addEventListener('visibilitychange', this._onVisibility);
    this.resizeObserver = new ResizeObserver(this._onResize);
    this.resizeObserver.observe(canvas);
    this._syncPlayback();
    this.draw();
  }

  setScene(index, options = {}) {
    if (this._disposed) return;
    const next = clamp(Number.isFinite(index) ? Math.round(index) : 0, 0, 8);
    const opts = { ...this.options, ...options };
    opts.year = [2023, 2024, 2025].includes(opts.year) ? opts.year : 2025;
    opts.age = [3, 4, 5].includes(opts.age) ? opts.age : 5;
    const changed = next !== this.index;
    this.timeline?.kill();
    this.ringTimeline?.kill();
    this.bell.angle = 0;
    if (changed) {
      this.previous = { index: this.index, options: { ...this.options }, growth: this.detail.growth };
      this.travel.progress = 0;
      this.travel.direction = next > this.index ? 1 : -1;
      this.bell.rung = false;
    }
    this.index = next;
    this.options = opts;
    const [x, y, z] = POSES[next];
    const target = { x, y, z: next === 2 ? 1 + (opts.year - 2023) * .09 : z, walk: 0, look: next === 4 ? 1 : .25, jump: 0 };
    if (!this.motion || !this.gsap) {
      Object.assign(this.pose, target);
      this.detail.growth = opts.year - 2023;
      this.detail.activity = 1;
      this.travel.progress = 1;
      this.previous = null;
      this.draw();
      return;
    }
    this.timeline = this.gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => this.draw(),
      onComplete: () => { this.previous = null; this.pose.walk = 0; this.draw(); }
    });
    if (changed) {
      this.pose.walk = 1;
      this.timeline.to(this.travel, { progress: 1, duration: .92 }, 0)
        .to(this.pose, { ...target, walk: 1, duration: .78 }, .06)
        .to(this.pose, { walk: 0, duration: .2 }, .78);
    } else {
      this.timeline.to(this.pose, { ...target, duration: .42 }, 0);
      // An option can change while a scroll-triggered scene is still arriving.
      // Finish that spatial travel instead of snapping when previous is cleared.
      if (this.previous) this.timeline.to(this.travel, { progress: 1, duration: .42 }, 0);
    }
    this.detail.activity = 0;
    this.timeline.to(this.detail, { growth: opts.year - 2023, activity: 1, duration: .65 }, 0);
    this._syncPlayback();
  }

  setProgress(progress) {
    if (this._disposed) return;
    this.sectionProgress = clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
    this.draw();
  }

  setMotion(enabled) {
    if (this._disposed) return;
    this.motion = Boolean(enabled);
    if (!this.motion) {
      this.timeline?.progress(1).kill();
      this.ringTimeline?.progress(1).kill();
      this.pose.walk = 0;
      this.pose.jump = 0;
      this.bell.angle = 0;
      this.previous = null;
      this.travel.progress = 1;
    }
    this._syncPlayback();
    this.draw();
  }

  ring() {
    if (this._disposed || this.index !== 8) return;
    this.ringTimeline?.kill();
    this.bell.rung = true;
    this.bell.phase = 0;
    if (!this.motion || !this.gsap) { this.bell.angle = 0; this.draw(); return; }
    this.ringTimeline = this.gsap.timeline({
      onUpdate: () => {
        this.bell.angle = Math.sin(this.bell.phase * Math.PI * 7) * .25 * (1 - this.bell.phase);
        this.draw();
      },
      onComplete: () => { this.bell.angle = 0; this.pose.jump = 0; this.draw(); }
    });
    this.ringTimeline.to(this.bell, { phase: 1, duration: 1.65, ease: 'none' }, 0)
      .to(this.pose, { jump: 10, duration: .2, ease: 'power2.out' }, .1)
      .to(this.pose, { jump: 0, duration: .32, ease: 'bounce.out' }, .3);
    this._syncPlayback();
    return this.ringTimeline;
  }

  _syncPlayback() {
    if (!this.gsap || this._disposed) return;
    const active = this.motion && !document.hidden;
    if (active && !this._ticking) { this._lastTick = 0; this.gsap.ticker.add(this._tick); this._ticking = true; }
    if (!active && this._ticking) { this.gsap.ticker.remove(this._tick); this._ticking = false; }
    for (const timeline of [this.timeline, this.ringTimeline]) {
      if (timeline && timeline.progress() < 1) timeline.paused(!active);
    }
  }

  draw() {
    if (this._disposed || !this.ctx) return;
    const { width, height } = this.canvas.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth; this.canvas.height = pixelHeight;
    }
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / 600, height / 460);
    ctx.save(); ctx.translate((width - 600 * scale) / 2, height - 460 * scale); ctx.scale(scale, scale);
    // A restrained shared camera drift joins the drawing to the page's scroll.
    if (this.motion) ctx.translate(0, -this.sectionProgress * 10);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = this._painter();
    if (this.index !== 4 || this.previous) p.line([[30, 409], [570, 409]], C.rule);
    if (this.previous && this.travel.progress < 1) {
      const t = this.travel.progress, direction = this.travel.direction;
      ctx.save(); ctx.translate(-t * 185 * direction, t * 9); ctx.globalAlpha = 1 - t;
      this._world(this.previous.index, this.previous.options, p, this.previous.growth); ctx.restore();
      ctx.save(); ctx.translate((1 - t) * 185 * direction, -(1 - t) * 8);
      ctx.globalAlpha = Math.min(t * 1.7 + .12, 1);
      this._world(this.index, this.options, p, this.detail.growth); ctx.restore();
    } else this._world(this.index, this.options, p, this.detail.growth);
    this._character(p);
    ctx.restore();
  }

  _painter() {
    const ctx = this.ctx;
    return {
      line(points, color = C.ink, width = 1.45) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); },
      rect(x, y, w, h, fill = null, stroke = C.ink, weight = 1.4) { if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = weight; ctx.strokeRect(x, y, w, h); } },
      ellipse(x, y, rx, ry, fill = null, stroke = null) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.3; ctx.stroke(); } },
      poly(points, fill = null, stroke = C.ink) { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke(); } }
    };
  }

  _plant(p, x, y, z = 1) {
    const ctx = this.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
    p.poly([[-11, 0], [11, 0], [8, 25], [-7, 25]], C.paper);
    p.line([[0, 0], [-2, -50]]); p.ellipse(-11, -31, 13, 5, C.leaf); p.ellipse(9, -44, 13, 5, C.leaf);
    p.line([[-11, -31], [-1, -25]], C.soft, 1); ctx.restore();
  }
  _person(p, x, y, z = 1) {
    const ctx = this.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(z, z);
    p.ellipse(0, -31, 7, 8, C.paper, C.ink); p.line([[-8, -18], [-12, 8], [12, 8], [8, -18], [-8, -18]]);
    p.line([[-5, 8], [-6, 27]]); p.line([[5, 8], [7, 27]]); p.line([[-10, -11], [-19, 0]]); p.line([[10, -11], [21, -3]]); ctx.restore();
  }
  _monitor(p, x, y, w = 110, h = 77) {
    p.rect(x, y, w, h, C.paper); p.rect(x + 5, y + 5, w - 10, h - 14, null, C.rule);
    p.line([[x + w / 2, y + h], [x + w / 2, y + h + 18]]); p.line([[x + w / 2 - 19, y + h + 18], [x + w / 2 + 19, y + h + 18]]);
  }
  _rack(p, x, y, w = 61, h = 157) {
    p.rect(x, y, w, h, C.paper); const rows = Math.floor((h - 12) / 23);
    for (let j = 0; j < rows; j++) { p.rect(x + 6, y + 8 + j * 23, w - 12, 16, C.ghost, C.rule); p.ellipse(x + w - 14, y + 16 + j * 23, 2.3, 2.3, C.accent); p.line([[x + 12, y + 14 + j * 23], [x + 29, y + 14 + j * 23]], C.soft, 1); }
  }
  _building(p, x, base, w, h, tone = C.paper) {
    const y = base - h; p.rect(x, y, w, h, tone); p.line([[x - 5, y], [x + w + 5, y]], C.ink, 2);
    for (let j = 0; j < Math.floor((h - 30) / 29); j++) for (let i = 0; i < Math.floor((w - 12) / 24); i++) p.rect(x + 10 + i * 24, y + 12 + j * 29, 12, 16, j % 2 ? C.ghost : C.paper, C.rule, 1);
    p.rect(x + w / 2 - 10, base - 26, 20, 26, C.ghost);
  }

  _world(index, o, p, growth) {
    const ctx = this.ctx, pulse = this.motion ? (this.clock * .16) % 1 : .5;
    if (index === 0) {
      p.line([[105, 147], [105, 383], [506, 383]], C.rule); p.line([[105, 147], [243, 102], [506, 151], [506, 383]], C.rule);
      p.rect(145, 171, 72, 94, null, C.rule); p.line([[181, 171], [181, 265]], C.rule); p.line([[145, 218], [217, 218]], C.rule);
      p.poly([[160, 312], [394, 312], [424, 328], [187, 328]], C.paper); p.line([[188, 328], [188, 402]], C.ink, 2); p.line([[412, 328], [412, 402]], C.ink, 2);
      p.poly([[233, 297], [275, 297], [292, 313], [249, 313]], C.ghost); p.line([[256, 300], [275, 309]], C.rule); p.line([[277, 311], [290, 293]], C.accent, 2);
      p.line([[350, 307], [355, 249], [375, 226]], C.ink, 2); p.poly([[360, 225], [381, 218], [394, 236], [363, 244]], C.accent); p.ellipse(350, 309, 15, 3, C.paper, C.ink);
      if (o.branch === 0) p.poly([[370, 244], [324, 304], [404, 304]], C.wash, null);
      this._plant(p, 461, 365); p.line([[260, 267], [270, 256], [276, 264]], C.accent);
    } else if (index === 1) {
      p.poly([[126, 314], [384, 314], [422, 333], [157, 333]], C.paper); p.line([[157, 333], [157, 405]], C.ink, 2); p.line([[409, 333], [409, 405]], C.ink, 2);
      this._monitor(p, 220, 202, 153, 99); p.line([[237, 223], [330, 223]], C.accent, 2); p.line([[237, 239], [351, 239]], C.rule); p.line([[237, 253], [321, 253]], C.rule);
      p.poly([[244, 321], [324, 321], [337, 329], [258, 329]], C.ghost); this._plant(p, 449, 305);
      [[85, 142, 85, 49], [424, 148, 95, 57], [164, 84, 112, 51]].forEach(([x, y, w, h], i) => {
        const dy = this.motion ? Math.sin(this.clock * .7 + i) * 2 : 0;
        p.rect(x, y + dy, w, h, C.paper, C.rule); p.ellipse(x + 13, y + 13 + dy, 3, 3, C.accent);
        p.line([[x + 25, y + 13 + dy], [x + w - 12, y + 13 + dy]], C.rule); p.line([[x + 12, y + 29 + dy], [x + w - 12, y + 29 + dy]], C.rule);
      }); this._person(p, 493, 376, .75);
    } else if (index === 2) {
      const g = clamp(growth, 0, 2); this._building(p, 108, 401, 121, 112 + g * 35);
      if (g > .05) this._building(p, 234, 401, 79, 90 + g * 49); if (g > 1.05) this._building(p, 320, 401, 65, 114 + (g - 1) * 28);
      this._plant(p, 87, 378); this._person(p, 420, 377, .6); this._person(p, 457, 376, .52);
      p.line([[163, 289 - g * 35], [163, 261 - g * 35]], C.rule); p.poly([[163, 261 - g * 35], [186, 266 - g * 35], [163, 272 - g * 35]], C.accent, null);
      for (let i = 0; i < 4 + Math.round(g) * 2; i++) p.rect(390 + i % 4 * 24, 333 - Math.floor(i / 4) * 22, 16, 11, C.paper, C.rule);
    } else if (index === 3) {
      [105, 258, 411].forEach((x, i) => {
        p.rect(x, 194, 112, 143, null, C.rule); p.poly([[x - 8, 337], [x + 120, 337], [x + 115, 354], [x - 3, 354]], C.ghost);
        p.line([[x + 10, 356], [x + 10, 404]], C.rule); p.line([[x + 103, 356], [x + 103, 404]], C.rule);
        const n = o.age - 2; for (let j = 0; j < n; j++) p.rect(x + 31 + j * 5, 285 - j * 9, 42, 22, i ? C.paper : C.wash, C.ink);
        p.line([[x + 15, 208], [x + 44, 208]], i ? C.blue : C.accent, 2); p.line([[x + 16, 226], [x + 94, 226]], C.rule);
      });
      p.line([[66, 168], [552, 168]], C.rule); p.line([[66, 163], [66, 175]], C.rule); p.line([[552, 163], [552, 175]], C.rule);
    } else if (index === 4) {
      // The user's original chart is a DOM image above this small guide.
    } else if (index === 5) {
      this._monitor(p, 55, 276, 100, 69); this._rack(p, 290, 233, 61, 170); this._rack(p, 359, 259, 56, 144);
      p.line([[104, 365], [104, 385], [279, 385], [279, 393], [350, 393]], C.accent, 2.4);
      p.line([[387, 405], [387, 432], [491, 432], [491, 363]], C.accent, 2.4);
      p.line([[469, 359], [489, 280], [510, 359]], C.ink, 1.7); p.line([[476, 330], [503, 330]]); p.line([[482, 305], [496, 305]]);
      p.line([[468, 290], [512, 290]]); p.line([[462, 311], [518, 311]]); p.line([[489, 280], [489, 264]]);
      p.line([[495, 291], [548, 305]], C.rule); p.line([[483, 291], [430, 305]], C.rule);
      p.ellipse(110 + pulse * 165, 385, 4, 4, C.accent); this._plant(p, 438, 382, .85);
    } else if (index === 6) {
      const active = o.economy === 'infrastructure' ? 2 : o.economy === 'future' ? 1 : 0;
      p.ellipse(303, 338, 239, 69, null, C.rule); p.line([[163, 304], [283, 252], [441, 311]], C.accent, 1.6);
      p.line([[160, 312], [277, 368], [448, 313]], C.rule); this._building(p, 98, 312, 94, 107);
      this._monitor(p, 261, 174, 105, 72); this._rack(p, 426, 225, 61, 107);
      this._person(p, 157, 352, .7); this._person(p, 455, 362, .75); this._plant(p, 213, 363, .85);
      const positions = [[144, 189], [313, 150], [457, 207]], [sx, sy] = positions[active];
      p.ellipse(sx, sy, 12, 12, C.wash); p.ellipse(sx, sy, 4, 4, C.accent);
      if (active === 1) { p.line([[312, 169], [368, 102]], C.rule); p.line([[312, 169], [243, 103]], C.rule); p.ellipse(368, 102, 12, 12, null, C.rule); p.ellipse(243, 103, 12, 12, null, C.rule); }
    } else if (index === 7) {
      ctx.save(); ctx.translate(355, 238); ctx.rotate(-.07);
      p.rect(-95, -140, 204, 281, C.ghost, C.rule); p.rect(-105, -148, 204, 281, C.paper);
      p.line([[-75, -112], [4, -112]], C.accent, 4); p.line([[-75, -89], [64, -89]], C.rule);
      for (let i = 0; i < 4; i++) { p.rect(-75, -55 + i * 35, 11, 11, null, C.rule); p.line([[-49, -50 + i * 35], [65, -50 + i * 35]], C.rule); }
      p.line([[-76, 105], [32, 105]], C.rule); ctx.restore();
      this._person(p, 84, 228, .7); p.ellipse(84, 205, 36, 40, null, C.rule);
      if (o.flow === 'secondary') { this._person(p, 483, 362, .7); p.line([[111, 229], [208, 199], [513, 199], [513, 336]], C.accent, 2); p.ellipse(215 + pulse * 290, 199, 6, 6, C.gold); }
      else { p.line([[121, 210], [233, 210]], C.accent, 2); p.ellipse(129 + pulse * 96, 210, 6, 6, C.gold); p.poly([[233, 210], [222, 204], [222, 216]], C.accent, null); }
    } else if (index === 8) {
      p.rect(105, 371, 391, 14, C.ghost); p.rect(118, 386, 367, 21, C.paper, C.rule);
      p.line([[158, 365], [158, 162], [449, 162], [449, 365]], C.ink, 2); p.line([[152, 156], [456, 156]], C.ink, 2); p.line([[300, 163], [300, 190]], C.ink, 2);
      ctx.save(); ctx.translate(300, 190); ctx.rotate(this.bell.angle); ctx.fillStyle = C.gold; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-45, 102); ctx.bezierCurveTo(-30, 84, -33, 41, -23, 25); ctx.bezierCurveTo(-14, 7, 15, 7, 24, 25); ctx.bezierCurveTo(36, 43, 30, 85, 45, 102); ctx.closePath(); ctx.fill(); ctx.stroke();
      p.ellipse(0, 103, 45, 7, C.gold, C.ink); p.ellipse(0, 114, 8, 8, C.ink); p.ellipse(0, 8, 6, 7, C.gold, C.ink); p.line([[-17, 37], [-20, 78]], C.wash, 3); ctx.restore();
      p.line([[339, 307], [386, 341]], C.ink, 2); p.ellipse(388, 343, 9, 5, C.gold, C.ink);
      if (this.bell.rung) for (let i = 0; i < 3; i++) { p.line([[217 - i * 11, 219 + i * 24], [203 - i * 13, 211 + i * 24]], C.gold, 2); p.line([[383 + i * 10, 219 + i * 24], [397 + i * 12, 211 + i * 24]], C.gold, 2); }
    }
  }

  _character(p) {
    const ctx = this.ctx, pose = this.pose;
    const breath = this.motion ? Math.sin(this.clock * 1.8) * .012 : 0;
    const stride = this.motion ? Math.sin(this.clock * 15) * pose.walk : 0;
    const bounce = Math.abs(stride) * 3;
    const blinkPhase = this.clock % 5.3;
    const blink = this.motion && blinkPhase > 4.95 && blinkPhase < 5.09;
    ctx.save(); ctx.translate(pose.x, pose.y - pose.jump - bounce); ctx.scale(pose.z, pose.z);
    p.ellipse(0, 46 + pose.jump, 44, 6, C.ghost);
    const gaze = this.index === 4 ? 3 : Math.sin(this.clock * .32) * 1.4 + pose.look;
    ctx.save(); ctx.translate(0, -breath * 38); ctx.scale(1 - breath * .45, 1 + breath);
    p.rect(-33, -25, 66, 53, C.accent, null);
    p.rect(-44, -10 + stride * 2, 11, 28, C.accent, null);
    if (this.index === 4) { p.rect(33, -12, 19, 10, C.accent, null); p.rect(43, -29, 9, 19, C.accent, null); }
    else p.rect(33, -10 - stride * 2, 11, 28, C.accent, null);
    p.rect(-18 + gaze, -8, 7, blink ? 2 : 11, C.eye, null); p.rect(14 + gaze, -8, 7, blink ? 2 : 11, C.eye, null);
    ctx.restore();
    [-26, -10, 6, 22].forEach((x, i) => p.rect(x + stride * (i % 2 ? 2 : -2), 27, i === 1 || i === 2 ? 8 : 10, (i === 1 || i === 2 ? 12 : 18) + stride * (i % 2 ? 4 : -4), C.accent, null));
    ctx.restore();
  }

  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    this.timeline?.kill(); this.ringTimeline?.kill();
    this.gsap?.ticker.remove(this._tick);
    this.resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._ticking = false;
  }
}
