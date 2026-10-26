/**
 * Estante: a shelf with a back board, a bookend at the far end, nine books
 * standing and two lying flat at the near end. The pointer picks the standing
 * book whose spine is nearest it across the screen; that book slides out
 * toward the viewer and its neighbours follow a little, staggered outwards
 * from it on the 700ms lift curve. At rest one book is already half out and
 * its spine is the bright mark. The slider is how far a chosen book comes out.
 *
 * The pattern: one of many. Tweens, a stagger by distance, and a hit test on
 * the spines' rest centres, so a book moving out cannot change the choice.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, seg, tween, tset, tval, tdone,
  mk, put, solid, pointer, register, disposer,
} = HL;

const D = 38, GAP = 1.4, STEP = 45, LIFT = 2;
const BOOKS = [[9, 58], [12, 66], [8, 51], [11, 61], [7, 55], [13, 68], [10, 60], [8, 53], [10, 63]]; // [thickness, height]
const REST_I = 5, REST_OUT = 9;
const FALL = [1, 0.22, 0.07]; // share of the pull at 0, 1 and 2 books from the chosen one

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pull = value;

  let y = 3;
  const books = BOOKS.map(([t, h], i) => { const b = { i, y0: y, y1: y + t, h }; y += t + GAP; return b; });
  const YE = y + 30; // the shelf runs on past the last book, under the two lying flat

  // Fitted to the shelf with a book out at the slider's far end.
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-7, -9, -7], [D + 7, YE, -7], [-7, YE, 0], [D + 30, 40, 0], [-7, -9, 78], [D + 30, 60, 68]], 200, 170);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const block = (x0, y0, x1, y1, z0, z1, r, b) => { const [ring, inner] = rings(x0, y0, x1, y1, r, b); const s = solid(g); put(s, prism(P, front, ring, inner, z0, z1)); return s; };
  // Back to front: the back board, the plank, the bookend, then the books by y.
  block(-7, -9, -3, YE, 0, 78, 1.6, 0.6);
  block(-7, -9, D + 7, YE, -7, 0, 3, 1.2);
  block(2, -9, D - 6, -5, 0, 40, 1.6, 0.6);

  for (const b of books) {
    b.el = solid(g);
    b.bands = mk("path", { class: "nf lo" }, g);
    b.out = tween(b.i === REST_I ? REST_OUT : 0);
    b.z = tween(0);
    b.drawn = "";
  }
  // Two books lying flat at the near end: they belong to the shelf, not to the row.
  block(3, y + 1, D - 2, y + 26, 0, 9, 2.2, 0.8);
  block(6, y + 3, D - 5, y + 24, 9, 16, 2.2, 0.8);
  // their page edges, one line along each long side that faces the viewer
  mk("path", { d: seg(P(D - 2, y + 4, 4.5), P(D - 2, y + 23, 4.5)) + seg(P(D - 5, y + 6, 12.5), P(D - 5, y + 21, 12.5)), class: "nf lo" }, g);

  function draw(b, out, lift) {
    const key = out.toFixed(2) + "," + lift.toFixed(2);
    if (key === b.drawn) return;
    b.drawn = key;
    const [ring, inner] = rings(out, b.y0, D + out, b.y1, 2.2, 0.8);
    put(b.el, prism(P, front, ring, inner, lift, b.h + lift));
    const sx = D + out, m0 = b.y0 + 1.5, m1 = b.y1 - 1.5;
    b.bands.setAttribute("d", seg(P(sx, m0, b.h + lift - 7), P(sx, m1, b.h + lift - 7)) + seg(P(sx, m0, lift + 8), P(sx, m1, lift + 8)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of books) { draw(b, tval(b.out, now), tval(b.z, now)); if (!tdone(b.out, now) || !tdone(b.z, now)) moving = true; }
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the spines' rest centres, which never move: nearest across the screen, within the row's height.
  const centre = books.map((b) => P(D, (b.y0 + b.y1) / 2, b.h / 2));
  const top = books.map((b) => P(D, (b.y0 + b.y1) / 2, b.h + 10)[1]), base = books.map((b) => P(D, (b.y0 + b.y1) / 2, -8)[1]);
  function hit([x, yy]) {
    let best = -1, d = Infinity;
    centre.forEach((c, i) => { const dx = Math.abs(c[0] - x); if (dx < d) { d = dx; best = i; } });
    if (best < 0 || d > 14 || yy < top[best] - 12 || yy > base[best] + 16) return -1;
    return best;
  }

  let act = -1;
  function bright(a) {
    const lit = a < 0 ? REST_I : a;
    books.forEach((b) => { b.el.sil.classList.toggle("hi", b.i === lit); b.bands.classList.toggle("lo", b.i !== lit); });
  }
  bright(-1);
  function choose(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    books.forEach((b) => {
      const k = Math.abs(b.i - from), delay = k * STEP;
      const share = a < 0 ? 0 : (FALL[k] ?? 0);
      const rest = a < 0 && b.i === REST_I ? REST_OUT : 0;
      tset(b.out, a < 0 ? rest : pull * share, now, delay);
      tset(b.z, a === b.i ? LIFT : 0, now, delay);
    });
    bright(a);
    read.textContent = a < 0 ? "rest" : String(a + 1).padStart(2, "0");
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pull = clamp(v, 8, 30); if (act >= 0) { const a = act; act = -2; choose(a); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "estante",
  means: "A shelf of books: the one under the pointer slides out, and its neighbours follow it a little, in turn.",
  rules: [1, 2, 4, 5],
  range: [10, 18, 28],
  tour: [[292, 159], [263, 177], [205, 212], null],
  mount,
});
