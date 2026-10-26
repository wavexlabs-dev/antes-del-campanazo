/**
 * Cajón: a desk pedestal of three drawers, the top one holding a sealed box.
 * The pointer is put on the plane of that drawer; the farther it goes out in
 * front of the face, the farther the drawer follows it, on a spring, up to the
 * slider's reach. At rest the drawer is ajar and its pull is the bright mark;
 * once most of the box is out, the bright moves to the box and its tape.
 *
 * The pattern: one continuous value. A spring, a hit test on a fixed plane
 * (the drawer's own height, which never moves), and a rest that is ajar.
 */
const {
  Cam, clamp, facing, fillet, fit, open, poly, prism, proj, rings, seg, unproj, spring, stepS,
  mk, put, solid, pointer, register, disposer,
} = HL;

const DX = 54, W = 80, H = 100;              // the pedestal: depth (x), width (y), height (z)
const T0 = 70, T1 = 96, MID = (T0 + T1) / 2;  // the top drawer's band on the face
const REST = 6, PLATE = 3, FL = 73, WALL = 90; // ajar at rest; front plate; floor and wall heights
const BX0 = 5, BX1 = 36, BY0 = 19, BY1 = 61, BZ1 = 94; // the box, measured back from the plate

/** A rounded rectangle in (y, z), drawn flat on the plane x. */
const rr = (y0, z0, y1, z1, r) => fillet([[y0, z0], [y1, z0], [y1, z1], [y0, z1]], [r, r, r, r]);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  // Fitted with the drawer at the slider's far end, so nothing leaves the frame.
  const C = Cam(45, 0.5, 1.8);
  fit(C, [[0, 0, 0], [DX + 58, W, 0], [0, W, H], [DX + 58, 0, T1], [0, 0, H], [DX + 58, W - 4, T0]], 200, 166);
  const P = proj(C), front = facing(C);
  const face = (pts, x) => pts.map(([y, z]) => P(x, y, z));

  const g = mk("g", {}, svg);
  const [cr, ci] = rings(0, 0, DX, W, 5, 1.6);
  put(solid(g), prism(P, front, cr, ci, 0, H));
  // The two lower drawers stay shut: their outlines and pulls lie on the face.
  for (const [z0, z1] of [[6, 36], [38, 67]]) {
    mk("path", { d: poly(face(rr(5, z0, W - 5, z1, 2.4), DX)), class: "nf" }, g);
    mk("path", { d: seg(P(DX, W / 2 - 9, z1 - 9), P(DX, W / 2 + 9, z1 - 9)), class: "nf lo" }, g);
  }
  mk("path", { d: poly(face(rr(4, T0 - 1, W - 4, T1 + 1, 2.4), DX)), class: "nf lo" }, g);

  // The top drawer, back to front: far wall, floor, box, near wall, front plate, pull.
  const dg = mk("g", {}, g);
  const farWall = mk("path", { class: "lo" }, dg), floor = mk("path", { class: "fo" }, dg);
  const box = solid(dg), tape = mk("path", { class: "nf" }, dg);
  const nearWall = mk("path", {}, dg), plate = solid(dg), pull = mk("path", { class: "nf" }, dg);

  const sp = spring(REST);
  let drawn = NaN;
  function draw(a) {
    if (a === drawn) return;
    drawn = a;
    const xf = DX + a - PLATE, out = Math.max(xf, DX);
    const wall = (y) => poly([P(DX, y, FL), P(out, y, FL), P(out, y, WALL), P(DX, y, WALL)]);
    farWall.setAttribute("d", wall(7));
    floor.setAttribute("d", poly([P(DX, 7, FL), P(out, 7, FL), P(out, W - 7, FL), P(DX, W - 7, FL)]));
    nearWall.setAttribute("d", wall(W - 7));
    // Only what has left the pedestal is drawn; the rest of the box is still inside.
    const b0 = Math.max(xf - BX1, DX), b1 = xf - BX0;
    if (b1 - b0 > 3) {
      const [br, bi] = rings(b0, BY0, b1, BY1, 2.4, 1);
      put(box, prism(P, front, br, bi, FL, BZ1));
      tape.setAttribute("d", open([P(b0, (BY0 + BY1) / 2, BZ1), P(b1, (BY0 + BY1) / 2, BZ1), P(b1, (BY0 + BY1) / 2, BZ1 - 7)]));
    } else { box.sil.setAttribute("d", ""); box.cr.setAttribute("d", ""); tape.setAttribute("d", ""); }
    const [pr, pi] = rings(xf, 4, xf + PLATE, W - 4, 1.2, 0.5);
    put(plate, prism(P, front, pr, pi, T0, T1));
    const px = xf + PLATE;
    pull.setAttribute("d", seg(P(px, W / 2 - 10, MID + 3), P(px, W / 2 + 10, MID + 3)) + seg(P(px, W / 2 - 10, MID + 3), P(px, W / 2 - 10, MID + 6)) + seg(P(px, W / 2 + 10, MID + 3), P(px, W / 2 + 10, MID + 6)));
    // One bright mark: the pull while the box is inside, the box once most of it is out.
    const boxOut = b1 - b0 > (BX1 - BX0) * 0.6;
    pull.classList.toggle("hi", !boxOut);
    box.sil.classList.toggle("hi", boxOut); tape.classList.toggle("hi", boxOut);
  }

  const B = register(stage, (dt) => { const m = stepS(sp, dt); draw(sp.x); return m; });
  bag.add(B.unregister);

  function aim(p) {
    if (!p) { sp.t = REST; read.textContent = "rest"; B.wake(); return; }
    const [wx, wy] = unproj(C, p[0], p[1], MID);
    const inside = wy > -8 && wy < W + 8;
    sp.t = inside ? clamp(wx - DX + 8, REST, reach) : REST;
    read.textContent = sp.t > REST + 0.5 ? `${Math.round((100 * (sp.t - REST)) / (reach - REST))}%` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, { move: aim, leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; sp.t = clamp(sp.t, REST, reach); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "cajon",
  means: "A desk drawer kept shut with a sealed box inside: the pointer draws it out, and it slides back when left.",
  rules: [1, 3, 5, 8],
  range: [30, 44, 58],
  tour: [[214, 121], [240, 135], [266, 148], null],
  mount,
});
