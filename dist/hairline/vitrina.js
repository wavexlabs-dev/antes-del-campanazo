/**
 * Vitrina: a glass case on a plinth, with a lid, and inside it a butterfly on
 * a pin whose wings are clear, drawn only by their edges. The pointer is put
 * on a plane at the glass's middle height; the nearer it comes to the case, the higher the lid lifts,
 * on a spring, but never more than the slider allows: the case stays shut.
 * At rest the wings are the bright mark; once the lid is half up, the bright
 * moves to the lid.
 *
 * The pattern: one continuous value with a short reach. A spring, a falloff by
 * distance on a fixed plane through the glass (which never moves), and a clamp.
 */
const {
  Cam, clamp, facing, fillet, fit, poly, prism, proj, rings, seg, unproj, spring, stepS,
  mk, put, solid, pointer, register, disposer,
} = HL;

const PW = 56, PH = 46, BASE = 3, GH = 46, LT = 4, R = 70;
const C0 = PW / 2;                            // the case's centre on the ground
const GZ0 = PH + BASE, GZ1 = GZ0 + GH;        // the glass, from the base plate to the lid
/** A point on the vertical plane through the case's centre that faces the viewer: s across, z up. */
const across = (s, z) => [C0 + s * Math.SQRT1_2, C0 - s * Math.SQRT1_2, z];
/** The share of the lift at u reaches from the case: 1 at the glass, nothing past the reach. */
const near = (u) => (u <= 0 ? 1 : u >= 1 ? 0 : (1 - u) * (1 - u));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let top = value;

  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-3, -3, 0], [PW + 3, PW + 3, 0], [PW + 3, -3, 0], [-3, PW + 3, 0], [-3, -3, GZ1 + 16 + LT + 7]], 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const block = (x0, y0, x1, y1, z0, z1, r, b, s = solid(g)) => { const [ring, inner] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, ring, inner, z0, z1)); return s; };

  // Back to front and bottom to top: plinth, base plate, the butterfly, the glass, the lid.
  block(0, 0, PW, PW, 0, PH, 4, 1.4);
  block(-3, -3, PW + 3, PW + 3, PH, GZ0, 3, 1);
  mk("path", { d: seg(P(C0, C0, GZ0), P(C0, C0, GZ0 + 8)), class: "nf lo" }, g);
  // Four clear wings in the plane that faces the viewer, filleted, and the body between them.
  const wing = (pts) => poly(fillet(pts, pts.map(() => 2.4)).map(([s, z]) => P(...across(s, z))));
  // Low in the case, so the closed lid does not hide it from this camera.
  const wz = GZ0 + 13;
  const wings = mk("path", {
    d: [
      wing([[0.5, wz], [16, wz + 11], [21, wz + 5], [14, wz - 2]]), wing([[-0.5, wz], [-16, wz + 11], [-21, wz + 5], [-14, wz - 2]]),
      wing([[0.5, wz - 2], [12, wz - 4], [9, wz - 10], [2, wz - 7]]), wing([[-0.5, wz - 2], [-12, wz - 4], [-9, wz - 10], [-2, wz - 7]]),
    ].join(""),
    class: "nf sil",
  }, g);
  const veins = mk("path", {
    d: [[[1, wz + 1], [15, wz + 9]], [[1, wz], [17, wz + 4]], [[-1, wz + 1], [-15, wz + 9]], [[-1, wz], [-17, wz + 4]]]
      .map(([a, b]) => seg(P(...across(...a)), P(...across(...b)))).join(""),
    class: "nf lo",
  }, g);
  block(C0 - 1.3, C0 - 1.3, C0 + 1.3, C0 + 1.3, wz - 8, wz + 5, 1.3, 0.45);
  // The glass hides nothing: its walls are only a silhouette and its top edge.
  const glass = block(3, 3, PW - 3, PW - 3, GZ0, GZ1, 2.4, 1.2);
  glass.sil.classList.add("nf"); glass.cr.classList.add("nf");
  const lid = solid(g), knob = solid(g);

  const sp = spring(0);
  let drawn = NaN;
  function draw(h) {
    if (h === drawn) return;
    drawn = h;
    block(0.5, 0.5, PW - 0.5, PW - 0.5, GZ1 + h, GZ1 + h + LT, 3, 1, lid);
    block(C0 - 5, C0 - 5, C0 + 5, C0 + 5, GZ1 + h + LT, GZ1 + h + LT + 5, 5, 1.4, knob);
    const up = h > top * 0.5;
    lid.sil.classList.toggle("hi", up); knob.sil.classList.toggle("hi", up);
    wings.classList.toggle("hi", !up); wings.classList.toggle("sil", up);
  }

  const B = register(stage, (dt) => { const m = stepS(sp, dt); draw(sp.x); return m; });
  bag.add(B.unregister);

  function aim(p) {
    if (!p) { sp.t = 0; read.textContent = "rest"; B.wake(); return; }
    const [wx, wy] = unproj(C, p[0], p[1], (GZ0 + GZ1) / 2);
    const d = Math.max(0, Math.hypot(wx - C0, wy - C0) - PW / 2);
    sp.t = clamp(top * near(d / R), 0, top);
    read.textContent = sp.t >= 0.5 ? `${Math.round(sp.t)}` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, { move: aim, leave: () => aim(null) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { top = v; sp.t = clamp(sp.t, 0, top); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "vitrina",
  means: "A glass case holding a butterfly: the lid lifts as the pointer nears, and never far enough to open.",
  rules: [3, 4, 5, 6],
  range: [4, 9, 15],
  tour: [[330, 200], [270, 186], [205, 156], null],
  mount,
});
