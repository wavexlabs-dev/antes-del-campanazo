/* Mounts the Hairline detail figures the way the package's own host does, once per element, when they near the screen. */
const mounted = new WeakMap();
let motionEnabled = true;

export function setFigureMotion(enabled) {
  motionEnabled = Boolean(enabled);
  window.HL?.setReducedMotion(!motionEnabled);
}

function caption(host, text) {
  const out = host.closest('figure')?.querySelector('[data-figure-read]');
  if (!out) return;
  const live = Boolean(text) && text !== 'rest';
  out.textContent = !live ? out.dataset.rest : out.dataset.live || `${out.dataset.prefix} ${text}`.trim();
  out.classList.toggle('is-live', live);
}

function mount(host) {
  const HL = window.HL, figure = window.__hairlineFigures?.[host.dataset.figure];
  if (!HL || !figure || mounted.has(host)) return;
  HL.inject(document);
  host.setAttribute('data-hairline', figure.name);
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', host.dataset.label || figure.means);
  const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, host);
  let text = null;
  const read = { get textContent() { return text; }, set textContent(value) { text = value == null ? '' : String(value); caption(host, text); } };
  // The slider's middle value: the figure's default reach.
  const handle = figure.mount({ stage: host, svg, read }, figure.range[1]);
  // Hairline's first register() reads the system preference; restore the site's
  // explicit choice after lazy mounting so a paused page stays paused.
  setFigureMotion(motionEnabled);
  if (text === null) read.textContent = 'rest';
  mounted.set(host, handle);
}

export function mountFigures(root = document) {
  const hosts = [...root.querySelectorAll('[data-figure]')];
  if (!('IntersectionObserver' in window)) { hosts.forEach(mount); return; }
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { mount(entry.target); io.unobserve(entry.target); }
  }, { rootMargin: '400px 0px' });
  hosts.forEach(host => io.observe(host));
}
