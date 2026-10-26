/* A continuous illustrated stage. Text and numerical evidence live in the DOM. */
const C = Object.freeze({
  paper: '#f5f2ea', ink: '#292b25', soft: '#64675c', rule: '#d8d8cb',
  ghost: '#e9e8dd', accent: '#bd5b3d', wash: '#ead5c5', gold: '#b18b49',
  leaf: '#8a9675', cream: '#fffaf0', eye: '#24251f', blue: '#758e99'
});
const POSES = [
  [248, 354, .88], [210, 354, 1], [214, 350, 1.18], [81, 371, .66],
  [69, 389, .57], [227, 358, .98], [304, 339, .92], [172, 354, 1.05], [258, 348, 1.16],
  [248, 354, .95], [287, 355, .94], [182, 355, .96], [293, 369, .94], [198, 357, .97],
  // 14: 2022, the room at night · 15: the bookshelves · 16: the glass case
  [246, 356, .88], [306, 356, .95], [118, 358, .9]
];
const DEFAULTS = {
  year: 2025, age: 5, branch: -1, economy: 'adoption', flow: 'primary',
  product: 'platform', customerTier: '100k', lens: 'operations', risk: 'compute', sharePrice: 25, shareCount: 10
};
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
    const next = clamp(Number.isFinite(index) ? Math.round(index) : 0, 0, POSES.length - 1);
    const opts = { ...this.options, ...options };
    // 2026 only reaches the stage through the "catorce veces" turn; the revenue buttons stay at 2023–2025.
    opts.year = [2023, 2024, 2025, 2026].includes(opts.year) ? opts.year : 2025;
    opts.age = [3, 4, 5].includes(opts.age) ? opts.age : 5;
    opts.lens = ['operations', 'net', 'cash'].includes(opts.lens) ? opts.lens : DEFAULTS.lens;
    opts.risk = ['compute', 'competition', 'trust', 'control'].includes(opts.risk) ? opts.risk : DEFAULTS.risk;
    opts.product = ['platform', 'code', 'cowork'].includes(opts.product) ? opts.product : DEFAULTS.product;
    opts.customerTier = ['100k', '1m', '10m'].includes(opts.customerTier) ? opts.customerTier : DEFAULTS.customerTier;
    for (const key of ['sharePrice', 'shareCount']) opts[key] = Number.isFinite(opts[key]) ? Math.max(0, opts[key]) : DEFAULTS[key];
    const changed = next !== this.index;
    this.timeline?.kill();
    this.ringTimeline?.kill();
    this.bell.angle = 0;
    if (changed) {
      this.previous = { index: this.index, options: { ...this.options }, growth: this.detail.growth };
      this.travel.progress = 0;
      this.travel.direction = options.direction === 1 || options.direction === -1 ? options.direction : next > this.index ? 1 : -1;
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
    }).addLabel('depart', 0).addLabel('arrive', .74);
    if (changed) {
      // One world leaves, then the next arrives: the two drawings never share the stage at full strength.
      this.pose.walk = 1;
      this.timeline.to(this.travel, { progress: 1, duration: .9, ease: 'none' }, 'depart')
        .to(this.pose, { ...target, walk: 1, duration: .74 }, 'depart+=.08')
        .to(this.pose, { walk: 0, duration: .2 }, 'arrive');
    } else {
      this.timeline.to(this.pose, { ...target, duration: .42 }, 'depart');
      // An option can change while a scroll-triggered scene is still arriving.
      // Finish that spatial travel instead of snapping when previous is cleared.
      if (this.previous) this.timeline.to(this.travel, { progress: 1, duration: .42 }, 'depart');
    }
    this.detail.activity = 0;
    this.timeline.to(this.detail, { growth: opts.year - 2023, activity: 1, duration: .65 }, 'depart');
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
    this._scale = scale;
    ctx.save(); ctx.translate((width - 600 * scale) / 2, height - 460 * scale); ctx.scale(scale, scale);
    // A restrained shared camera drift joins the drawing to the page's scroll.
    if (this.motion) ctx.translate(0, -this.sectionProgress * 10);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = this._painter();
    if (this.index !== 4 || this.previous) p.line([[30, 409], [570, 409]], C.rule);
    if (this.previous && this.travel.progress < 1) {
      // Sequential, not a crossfade: the old world is gone before the new one is fully drawn.
      const t = this.travel.progress, direction = this.travel.direction;
      const ease = x => x * x * (3 - 2 * x);
      const out = ease(clamp(t / .46, 0, 1)), arrive = ease(clamp((t - .38) / .62, 0, 1));
      if (out < 1) {
        ctx.save(); ctx.translate(-out * 70 * direction, 0); ctx.globalAlpha = 1 - out;
        this._world(this.previous.index, this.previous.options, p, this.previous.growth); ctx.restore();
      }
      if (arrive > 0) {
        ctx.save(); ctx.translate((1 - arrive) * 70 * direction, 0); ctx.globalAlpha = arrive;
        this._world(this.index, this.options, p, this.detail.growth); ctx.restore();
      }
    } else this._world(this.index, this.options, p, this.detail.growth);
    this._character(p);
    ctx.restore();
  }

  _painter() {
    const ctx = this.ctx;
    // Hairline: the secondary detail stroke. At least half a CSS pixel at any stage size.
    const hw = Math.max(.6, .5 / (this._scale || 1));
    return {
      hair(points, color = C.soft, alpha = .75) { ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = hw; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore(); },
      hairs(segments, color = C.soft, alpha = .75) { ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = hw; ctx.beginPath(); for (const [[x0, y0], [x1, y1]] of segments) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); } ctx.stroke(); ctx.restore(); },
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
  _document(p, x, y, w = 57, h = 76, tone = C.paper) {
    p.poly([[x, y], [x + w - 13, y], [x + w, y + 13], [x + w, y + h], [x, y + h]], tone);
    p.line([[x + w - 13, y], [x + w - 13, y + 13], [x + w, y + 13]], C.rule);
    for (let i = 0; i < 3; i++) p.line([[x + 11, y + 28 + i * 12], [x + w - 11, y + 28 + i * 12]], i ? C.rule : C.accent);
  }
  _coin(p, x, y, tone = C.gold, radius = 10) {
    p.ellipse(x, y, radius, radius, tone, C.ink);
    p.ellipse(x, y, radius * .65, radius * .65, null, C.wash);
    p.line([[x - 2, y - 3], [x + 2, y + 3]], C.paper, 1.5);
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
      // growth 0–2 follows the revenue year; 3 is the first half of 2026, where a crane joins the block.
      const g = clamp(growth, 0, 3), big = clamp(g - 2, 0, 1); this._building(p, 108, 401, 121, 112 + Math.min(g, 2) * 35);
      if (g > .05) this._building(p, 234, 401, 79, 90 + Math.min(g, 2) * 49); if (g > 1.05) this._building(p, 320, 401, 65, 114 + (Math.min(g, 2) - 1) * 28);
      if (big > .02) this._building(p, 396, 401, 74, 60 + big * 230);
      this._plant(p, 87, 378);
      const moved = big > .02, px = moved ? [512, 548] : [420, 457]; this._person(p, px[0], 377, .6); this._person(p, px[1], 376, .52);
      const gf = Math.min(g, 2); p.line([[163, 289 - gf * 35], [163, 261 - gf * 35]], C.rule); p.poly([[163, 261 - gf * 35], [186, 266 - gf * 35], [163, 272 - gf * 35]], C.accent, null);
      const crates = moved ? 9 : 4 + Math.round(gf) * 2, cols = moved ? 3 : 4, cx = moved ? 484 : 390;
      for (let i = 0; i < crates; i++) p.rect(cx + i % cols * 24, 333 - Math.floor(i / cols) * 22, 16, 11, C.paper, C.rule);
      if (big > .4) {
        // A tower crane in hairline lattice, lowering the last floor onto the new tower.
        const a = clamp((big - .4) / .6, 0, 1), ctx = this.ctx; ctx.save(); ctx.globalAlpha *= a;
        p.line([[566, 401], [566, 92]], C.ink, 1.2); p.line([[580, 401], [580, 92]], C.ink, 1.2);
        const lattice = []; for (let y = 401; y > 100; y -= 16) lattice.push([[566, y], [580, y - 16]], [[566, y - 16], [580, y - 16]]);
        p.hairs(lattice, C.soft, .8);
        p.line([[352, 84], [596, 84]], C.ink, 1.2); p.line([[352, 92], [596, 92]], C.ink, 1.2);
        const jib = []; for (let x = 352; x < 590; x += 14) jib.push([[x, 92], [x + 7, 84]], [[x + 7, 84], [x + 14, 92]]);
        p.hairs(jib, C.soft, .8);
        p.rect(560, 92, 26, 14, C.paper, C.ink, 1.2); p.hair([[566, 99], [580, 99]], C.soft);
        p.rect(426, 92, 14, 5, C.ghost, C.ink, 1); p.hair([[433, 97], [433, 114]], C.ink, .9);
        p.rect(412, 114, 42, 6, C.accent, null); ctx.restore();
      }
    } else if (index === 3) {
      // Five desks: Anthropic, Amazon, Google, Facebook and Salesforce. Stacks follow the age, not the money.
      const xs = [40, 152, 264, 376, 488], w = 82;
      xs.forEach((x, i) => {
        p.rect(x, 206, w, 131, null, C.rule); p.poly([[x - 6, 337], [x + w + 6, 337], [x + w + 2, 352], [x - 2, 352]], C.ghost);
        p.line([[x + 8, 354], [x + 8, 404]], C.rule); p.line([[x + w - 8, 354], [x + w - 8, 404]], C.rule);
        p.hairs([[[x + 6, 344], [x + w - 6, 344]], [[x + w / 2, 352], [x + w / 2, 337]]], C.soft, .45);
        const n = o.age - 2;
        if (i === 3 && o.age === 3) {
          // Facebook's third year is not in its prospectus: an outline, not a stack.
          const ctx = this.ctx; ctx.save(); ctx.setLineDash([3, 3]); p.rect(x + 22, 312, 36, 20, null, C.soft, 1); ctx.restore();
        } else for (let j = 0; j < n; j++) p.rect(x + 22 + j * 4, 312 - j * 8, 36, 20, i ? C.paper : C.wash, C.ink);
        p.line([[x + 10, 220], [x + 32, 220]], i ? C.blue : C.accent, 2); p.line([[x + 10, 236], [x + w - 10, 236]], C.rule);
        p.hairs([[[x + 10, 248], [x + w - 16, 248]], [[x + 10, 258], [x + w - 24, 258]]], C.soft, .5);
      });
      p.line([[40, 168], [570, 168]], C.rule); p.line([[40, 163], [40, 175]], C.rule); p.line([[570, 163], [570, 175]], C.rule);
      p.hairs(xs.map(x => [[x + w / 2, 168], [x + w / 2, 206]]), C.soft, .5);
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
    } else this._extensionWorld(index, o, p, pulse);
  }

  _extensionWorld(index, o, p, pulse) {
    if (index === 9) {
      // One workbench; the selected product lights up its corresponding tool.
      const code = o.product === 'code', cowork = o.product === 'cowork', platform = o.product === 'platform';
      p.line([[85, 146], [515, 146]], C.rule); p.line([[109, 148], [109, 174]], C.rule); p.line([[490, 148], [490, 174]], C.rule);
      p.poly([[87, 319], [480, 319], [516, 338], [115, 338]], C.paper); p.line([[119, 339], [119, 402]], C.ink, 2); p.line([[498, 339], [498, 402]], C.ink, 2);
      this._monitor(p, 96, 211, 130, 89);
      p.rect(102, 217, 118, 69, code ? C.wash : C.ghost, null);
      p.line([[117, 236], [128, 244], [117, 252]], code ? C.accent : C.ink, 2); p.line([[140, 251], [174, 251]], C.soft, 2);
      p.line([[117, 269], [196, 269]], C.rule);
      this._document(p, 394, 228, 58, 80, C.ghost); this._document(p, 383, 218, 58, 80, cowork ? C.wash : C.paper);
      p.line([[377, 308], [462, 308]], C.rule); this._plant(p, 470, 290, .6);
      p.ellipse(304, 222, 32, 32, platform ? C.wash : C.paper, C.ink);
      p.line([[293, 210], [282, 222], [293, 234]], platform ? C.accent : C.ink, 2);
      p.line([[315, 210], [326, 222], [315, 234]], platform ? C.accent : C.ink, 2);
      p.line([[309, 207], [299, 238]], C.rule);
      [[251, 172], [358, 166], [345, 280]].forEach(([x, y], i) => {
        const start = [304 + (x - 304) * .45, 222 + (y - 222) * .45], t = (pulse + i / 3) % 1;
        p.line([start, [x, y]], C.rule); p.rect(x - 8, y - 8, 16, 16, platform ? C.wash : C.paper, C.rule);
        if (platform) p.ellipse(start[0] + (x - start[0]) * t, start[1] + (y - start[1]) * t, 3, 3, C.accent);
      });
    } else if (index === 10) {
      // Client tiers select a connection, never a quantitative building scale.
      const selected = ['100k', '1m', '10m'].indexOf(o.customerTier);
      const nodes = [[142, 286], [306, 195], [461, 283]];
      p.ellipse(302, 305, 233, 75, null, C.rule);
      nodes.forEach(([x, y], i) => {
        p.line([[300, 326], [x, y]], i === selected ? C.accent : C.rule, i === selected ? 2.4 : 1.4);
        if (i === selected) p.ellipse(300 + (x - 300) * pulse, 326 + (y - 326) * pulse, 5, 5, C.gold);
      });
      this._building(p, 90, 286, 104, 128, selected === 0 ? C.wash : C.paper);
      this._building(p, 263, 195, 86, 89, selected === 1 ? C.wash : C.paper);
      this._building(p, 416, 283, 90, 156, selected === 2 ? C.wash : C.paper);
      p.ellipse(300, 326, 34, 13, C.wash, C.rule);
      this._person(p, 108, 362, .72); this._person(p, 173, 337, .63); this._person(p, 448, 350, .72); this._person(p, 506, 366, .6);
      p.line([[156, 314], [206, 284], [249, 291]], C.rule); p.line([[349, 291], [388, 319], [440, 323]], C.rule);
      this._plant(p, 223, 366, .8); this._plant(p, 386, 369, .7);
    } else if (index === 11) {
      const operations = o.lens === 'operations', net = o.lens === 'net', cash = o.lens === 'cash';
      // The tilt is an illustration; the financial figures remain in the DOM.
      p.line([[343, 179], [343, 338]], C.ink, 3); p.poly([[312, 347], [343, 327], [374, 347]], C.ghost);
      p.line([[236, 194], [450, 215]], operations ? C.accent : C.ink, 3); p.ellipse(343, 204, 7, 7, C.gold, C.ink);
      [[250, 196, 268], [433, 213, 285]].forEach(([x, y, base]) => {
        p.line([[x, y], [x - 35, base], [x + 35, base], [x, y]], C.rule);
        p.poly([[x - 37, base], [x + 37, base], [x + 27, base + 16], [x - 27, base + 16]], operations ? C.wash : C.paper);
      });
      this._coin(p, 243, 252); this._coin(p, 260, 253, C.gold, 8); this._rack(p, 414, 242, 38, 43);
      this._document(p, 99, 206, 71, 92, net ? C.wash : C.paper);
      p.line([[118, 229], [130, 241], [152, 218]], net ? C.accent : C.rule, 2);
      if (net) { p.ellipse(175, 282, 22, 22, null, C.accent); p.line([[189, 298], [208, 317]], C.accent, 3); }
      p.rect(393, 340, 102, 62, cash ? C.wash : C.paper); p.poly([[393, 340], [404, 324], [483, 324], [495, 340]], cash ? C.wash : C.ghost);
      p.rect(438, 338, 13, 24, C.gold); p.line([[403, 382], [484, 382]], C.rule);
      this._coin(p, 408, 310, cash ? C.gold : C.ghost, 12); this._coin(p, 435, 309, cash ? C.gold : C.ghost, 10);
      if (cash) p.line([[359, 342], [359, 371], [382, 371]], C.accent, 2);
      this._plant(p, 289, 382, .8);
    } else if (index === 12) {
      const risk = o.risk, tone = kind => risk === kind ? C.accent : C.rule;
      p.line([[280, 414], [280, 319], [153, 260]], C.rule, 2); p.line([[308, 414], [308, 319], [447, 260]], C.rule, 2);
      p.line([[294, 343], [294, 213]], C.rule, 2);
      p.line([[294, 328], [294, 307]], C.gold, 2); p.line([[294, 290], [294, 270]], C.gold, 2);
      this._rack(p, 409, 170, 54, 100); p.line([[436, 272], [483, 272], [483, 307], [431, 307]], tone('compute'), 2);
      p.line([[428, 301], [434, 307], [428, 313]], tone('compute'), 2);
      p.line([[91, 261], [91, 176]], tone('competition'), 2); p.poly([[91, 177], [137, 192], [91, 207]], risk === 'competition' ? C.wash : C.paper);
      p.line([[177, 261], [177, 184]], tone('competition'), 2); p.poly([[177, 185], [137, 204], [177, 218]], C.ghost);
      p.poly([[261, 140], [294, 126], [328, 140], [322, 186], [294, 211], [267, 186]], risk === 'trust' ? C.wash : C.paper);
      p.line([[302, 137], [290, 156], [302, 164], [285, 189]], tone('trust'), 2.2);
      p.ellipse(430, 361, 29, 29, C.paper, tone('control')); p.ellipse(430, 361, 6, 6, C.gold);
      [[410, 341], [451, 341], [430, 390]].forEach(([x, y]) => p.line([[430, 361], [x, y]], tone('control'), 2));
      p.line([[430, 392], [430, 407]], C.rule); this._plant(p, 139, 374, .9);
      const selected = { compute: [480, 180], competition: [155, 152], trust: [342, 137], control: [471, 339] }[risk];
      p.ellipse(...selected, 8, 8, C.wash); p.ellipse(...selected, 3, 3, C.accent);
    } else if (index === 13) {
      const price = clamp((o.sharePrice - 5) / 95, 0, 1), issued = clamp((o.shareCount - 10) / 10, 0, 1);
      p.rect(334, 145, 155, 125, C.paper); p.rect(341, 152, 141, 111, C.ghost, C.rule);
      p.line([[356, 269], [342, 318]], C.ink, 2); p.line([[466, 269], [480, 318]], C.ink, 2);
      // A price marker and token tray represent the imaginary model, not company data.
      p.line([[367, 240], [367, 177]], C.rule, 2); p.line([[362, 177], [372, 177]], C.rule); p.line([[362, 240], [372, 240]], C.rule);
      p.line([[365, 234 - price * 51], [429, 234 - price * 51]], C.accent, 2); this._coin(p, 443, 234 - price * 51, C.gold, 13);
      p.poly([[109, 319], [481, 319], [517, 342], [142, 342]], C.paper); p.line([[147, 343], [147, 403]], C.ink, 2); p.line([[502, 343], [502, 403]], C.ink, 2);
      p.rect(219, 271, 87, 47, C.paper, C.rule); p.rect(319, 271, 87, 47, C.paper, C.rule);
      for (let i = 0; i < 8; i++) {
        const x = 231 + i % 4 * 21, y = 283 + Math.floor(i / 4) * 22;
        this._coin(p, x, y, C.gold, 7);
        if (i < Math.round(issued * 8)) this._coin(p, x + 100, y, C.accent, 7);
        else p.ellipse(x + 100, y, 7, 7, null, C.rule);
      }
      this._document(p, 117, 221, 55, 79); p.line([[185, 257], [202, 257]], C.rule); p.line([[196, 252], [202, 257], [196, 262]], C.rule);
      this._person(p, 460, 381, .66); p.ellipse(460, 367, 32, 40, null, C.rule);
    } else if (index === 14) this._nightRoom(p);
    else if (index === 15) this._library(p);
    else if (index === 16) this._glassCase(p);
  }

  /** 2022: the room from the beginning, at night. The desk's top drawer is the one that matters. */
  _nightRoom(p) {
    const night = '#3d3f37';
    p.line([[105, 147], [105, 383], [506, 383]], C.rule); p.line([[105, 147], [243, 102], [506, 151], [506, 383]], C.rule);
    p.hairs([[[105, 371], [506, 371]], [[30, 395], [570, 395]], [[118, 383], [70, 409]], [[230, 383], [214, 409]], [[350, 383], [356, 409]], [[470, 383], [496, 409]]], C.rule, .9);
    p.rect(145, 171, 72, 94, night, C.rule);
    p.ellipse(198, 193, 8, 8, C.cream); p.ellipse(202, 190, 7, 7, night);
    p.hairs([[160, 188], [171, 238], [206, 248], [158, 252], [190, 226]].flatMap(([x, y]) => [[[x - 2.5, y], [x + 2.5, y]], [[x, y - 2.5], [x, y + 2.5]]]), C.cream, .9);
    p.line([[181, 171], [181, 265]], C.rule); p.line([[145, 218], [217, 218]], C.rule); p.line([[139, 266], [223, 266]], C.ink, 1.2);
    // A wall calendar: one day near the end of the month is circled.
    p.rect(262, 160, 64, 74, C.paper, C.rule); p.rect(262, 160, 64, 12, C.ghost, C.rule);
    const grid = []; for (let c = 1; c < 7; c++) grid.push([[262 + c * 64 / 7, 176], [262 + c * 64 / 7, 230]]);
    for (let r = 0; r < 6; r++) grid.push([[264, 176 + r * 10.8], [324, 176 + r * 10.8]]);
    p.hairs(grid, C.soft, .55); p.ellipse(262 + 1.5 * 64 / 7, 224, 6, 5, null, C.accent);
    p.line([[294, 154], [294, 160]], C.ink, 1.2);
    // The desk, a closed laptop and a lamp that is off.
    p.poly([[160, 312], [394, 312], [424, 328], [187, 328]], C.paper); p.line([[188, 328], [188, 402]], C.ink, 2); p.line([[412, 328], [412, 402]], C.ink, 2);
    p.poly([[226, 304], [282, 304], [290, 311], [234, 311]], C.ghost); p.hair([[234, 308], [284, 308]], C.soft);
    p.line([[350, 307], [355, 249], [375, 226]], C.ink, 2); p.poly([[360, 225], [381, 218], [394, 236], [363, 244]], C.ghost); p.ellipse(350, 309, 15, 3, C.paper, C.ink);
    // The drawer unit. The top drawer's pull is the bright mark.
    p.rect(318, 328, 82, 66, C.paper, C.ink, 1.4); p.line([[318, 361], [400, 361]], C.ink, 1.2);
    p.hairs([[[323, 333], [395, 333]], [[323, 356], [395, 356]], [[323, 366], [395, 366]], [[323, 389], [395, 389]]], C.soft, .5);
    p.line([[348, 345], [370, 345]], C.accent, 2.4); p.line([[348, 378], [370, 378]], C.ink, 1.6);
    p.hair([[322, 340], [322, 351]], C.soft, .5); p.hair([[396, 340], [396, 351]], C.soft, .5);
    this._plant(p, 461, 365);
  }

  /** 2025: shelves of books on one side, the agreement on a table on the other. */
  _library(p) {
    const x = 64, w = 168, levels = [204, 258, 312, 366];
    p.rect(x, 150, w, 252, C.paper, C.ink, 1.4); p.line([[x - 6, 150], [x + w + 6, 150]], C.ink, 2);
    levels.forEach(y => p.line([[x, y], [x + w, y]], C.ink, 1.2));
    p.hairs([[[x + 4, 156], [x + 4, 396]], [[x + w - 4, 156], [x + w - 4, 396]]], C.soft, .5);
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    levels.forEach((base, r) => {
      let bx = x + 7;
      while (true) {
        const bw = 7 + Math.floor(rnd() * 6), bh = 32 + Math.floor(rnd() * 15);
        if (bx + bw > x + w - 7) break;
        const pulled = r === 1 && bx > x + 70 && bx < x + 84;
        if (!pulled) {
          p.rect(bx, base - bh, bw, bh, rnd() < .14 ? C.ghost : C.paper, C.soft, .9);
          p.hairs([[[bx + 1.5, base - bh + 5], [bx + bw - 1.5, base - bh + 5]], [[bx + 1.5, base - 7], [bx + bw - 1.5, base - 7]]], C.soft, .5);
        } else {
          // One book out of the row: the bright mark of the scene.
          p.poly([[bx - 3, base - bh - 4], [bx + bw + 3, base - bh - 6], [bx + bw + 8, base + 1], [bx + 2, base + 3]], C.accent, C.ink);
          p.hair([[bx + 1, base - bh + 4], [bx + bw + 3, base - bh + 2]], C.paper, .9);
        }
        bx += bw + 1;
      }
    });
    // The table, the signed agreement, a pen and a short stack of books.
    p.poly([[372, 318], [520, 318], [532, 331], [382, 331]], C.paper); p.line([[392, 331], [392, 402]], C.ink, 2); p.line([[516, 331], [516, 402]], C.ink, 2);
    p.line([[423, 318], [431, 300]], C.ink, 1.4); p.line([[439, 318], [431, 300]], C.ink, 1.4);
    this._document(p, 400, 226, 62, 82);
    p.line([[408, 292], [414, 285], [419, 294], [425, 284], [431, 293], [438, 287], [450, 290]], C.accent, 1.5);
    p.line([[464, 315], [484, 304]], C.ink, 2.2); p.hair([[484, 304], [488, 302]], C.ink, .9);
    [[492, 308, 32], [495, 300, 26], [490, 292, 30]].forEach(([bx, by, bw]) => { p.rect(bx, by, bw, 8, C.paper, C.soft, .9); p.hair([[bx + 2, by + 4], [bx + bw - 2, by + 4]], C.soft, .5); });
    this._plant(p, 556, 378, .8);
  }

  /** 2026: a glass case on a plinth under a spotlight, a rope in front and a pause sign beside it. */
  _glassCase(p) {
    const ctx = this.ctx;
    p.ellipse(300, 64, 11, 4, C.paper, C.ink); p.line([[300, 30], [300, 60]], C.ink, 1.2);
    p.hairs([[[292, 67], [250, 184]], [[308, 67], [350, 184]]], C.rule, .9);
    p.rect(240, 292, 120, 10, C.ghost, C.ink, 1.2); p.rect(246, 302, 108, 100, C.paper, C.ink, 1.4);
    p.hairs([[[256, 314], [344, 314]], [[256, 390], [344, 390]], [[256, 314], [256, 390]], [[344, 314], [344, 390]]], C.soft, .5);
    // The glass: an outline, a lid and a few reflections. Nothing is filled.
    p.rect(254, 188, 92, 104, null, C.ink, 1.1); p.rect(249, 181, 102, 8, C.ghost, C.ink, 1.2);
    p.hairs([[[262, 214], [282, 194]], [[262, 232], [296, 198]], [[328, 286], [340, 274]]], C.soft, .7);
    // A glasswing butterfly on a pin: clear wings, drawn only by their edges and veins.
    p.line([[300, 292], [300, 262]], C.soft, 1);
    const wing = (pts) => { p.hair(pts.concat([pts[0]]), C.ink, .9); };
    wing([[300, 240], [276, 214], [262, 220], [266, 240], [300, 246]]);
    wing([[300, 240], [324, 214], [338, 220], [334, 240], [300, 246]]);
    wing([[300, 247], [282, 252], [278, 266], [290, 268], [300, 252]]);
    wing([[300, 247], [318, 252], [322, 266], [310, 268], [300, 252]]);
    p.hairs([[[300, 241], [270, 222]], [[300, 241], [330, 222]], [[300, 243], [266, 236]], [[300, 243], [334, 236]], [[300, 249], [284, 262]], [[300, 249], [316, 262]]], C.soft, .55);
    p.hair([[262, 220], [276, 214]], C.accent, 1); p.hair([[338, 220], [324, 214]], C.accent, 1);
    p.line([[300, 236], [300, 256]], C.ink, 2); p.hair([[300, 236], [294, 228]], C.ink, .9); p.hair([[300, 236], [306, 228]], C.ink, .9);
    // The rope barrier between two posts.
    [190, 410].forEach(x => { p.line([[x, 336], [x, 400]], C.ink, 2); p.ellipse(x, 402, 12, 3, C.ghost, C.ink); p.ellipse(x, 333, 4, 4, C.gold, C.ink); });
    const rope = []; for (let i = 0; i <= 20; i++) { const t = i / 20; rope.push([194 + t * 212, 338 + Math.sin(t * Math.PI) * 18]); }
    p.line(rope, C.accent, 2.2);
    // A pause sign: the June suspension, without words.
    p.line([[494, 304], [494, 402]], C.ink, 1.6); p.ellipse(494, 402, 10, 3, C.ghost, C.ink);
    p.ellipse(494, 287, 17, 17, C.paper, C.ink); p.line([[489, 279], [489, 295]], C.ink, 2.4); p.line([[499, 279], [499, 295]], C.ink, 2.4);
    ctx.lineCap = 'round';
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
