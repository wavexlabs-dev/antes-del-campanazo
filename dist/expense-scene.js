/* A proportional, scroll-led expense chart. All amounts use the same semester. */
export const EXPENSE_DATA = Object.freeze({
  period: 'Enero–junio de 2026', revenue: 16286, scaleCents: 110, bartz: 0,
  categories: Object.freeze([
    Object.freeze({ id: 'compute', name: 'Cómputo e infraestructura', amount: 8945, color: '#bd5b3d', title: 'Más de la mitad corresponde a cómputo.', copy: 'Por cada dólar de ingresos, 54.9¢ se reconocieron como gasto en cómputo e infraestructura. Son costos globales, incluidos los de desarrollar modelos; no el costo de responder un chat.' }),
    Object.freeze({ id: 'people', name: 'Personal', amount: 3152, color: '#b18b49', title: 'También hay personas detrás.', copy: 'Otros 19.4¢ por dólar se reconocieron como gasto en personal. La operación necesita equipos que construyan, investiguen y sostengan el negocio.' }),
    Object.freeze({ id: 'distribution', name: 'Ventas, marketing y alianzas', amount: 3168, color: '#8a9675', title: 'Llegar a más clientes también cuesta.', copy: '19.5¢ por dólar se reconocieron como gasto en ventas, marketing y alianzas. Esta categoría muestra el gasto de llevar los productos al mercado.' }),
    Object.freeze({ id: 'other', name: 'Otros gastos y administración', amount: 1714, color: '#758e99', title: 'Y una empresa que mantener.', copy: '10.5¢ por dólar corresponden al resto de los gastos operativos y administrativos de este desglose.' })
  ])
});

export function getExpenseTotals() {
  const expenses = EXPENSE_DATA.categories.reduce((sum, item) => sum + item.amount, 0);
  const deficit = expenses - EXPENSE_DATA.revenue;
  return { revenue: EXPENSE_DATA.revenue, expenses, deficit, expenseCents: expenses / EXPENSE_DATA.revenue * 100, deficitCents: deficit / EXPENSE_DATA.revenue * 100 };
}

const mounts = new WeakMap();
const money = n => n.toLocaleString('en-US');
const cents = n => n.toFixed(1);
const mascot = `<svg class="expense-mascot-svg" viewBox="0 0 80 72" aria-hidden="true" focusable="false"><ellipse cx="40" cy="67" rx="29" ry="4" fill="#292b25" opacity=".1"/><g class="expense-mascot-body" fill="#bd5b3d"><path d="M18 14h44v35H18z"/><path class="expense-arm-left" d="M11 25h7v20h-7z"/><path class="expense-arm-right" d="M62 25h7v20h-7z"/><g fill="#24251f" class="expense-eyes"><path d="M28 27h5v8h-5zM49 27h5v8h-5z"/></g></g><g fill="#bd5b3d"><path class="expense-foot-a" d="M21 49h7v14h-7zM42 49h6v10h-6z"/><path class="expense-foot-b" d="M32 49h6v10h-6zM53 49h7v14h-7z"/></g></svg>`;

/** Mount once inside an empty element; the caller owns the surrounding chapter. */
export function mountExpenseScene({ root, gsap, ScrollTrigger, motion = true } = {}) {
  if (!root?.ownerDocument) throw new TypeError('mountExpenseScene needs a root element');
  mounts.get(root)?.dispose();
  const doc = root.ownerDocument, win = doc.defaultView, totals = getExpenseTotals();
  const prefix = `${root.id || 'expense-experience'}-chart`;
  const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const hasEngine = Boolean(gsap && ScrollTrigger);
  let enabled = Boolean(motion) && !media?.matches, disposed = false, timeline = null, manualTween = null;
  let active = -1, manual = null, lastScroll = null;
  const state = { position: 0, focus: 0, hold: 0 }, manualState = { position: 0 };
  let cumulative = 0;
  const categories = EXPENSE_DATA.categories.map(item => {
    const value = item.amount / totals.revenue * 100;
    const result = { ...item, cents: value, start: cumulative, center: (cumulative + value / 2) / EXPENSE_DATA.scaleCents * 100, width: value / EXPENSE_DATA.scaleCents * 100 };
    cumulative += value;
    return result;
  });
  const stops = [...categories.map(item => item.center), totals.expenseCents / EXPENSE_DATA.scaleCents * 100];
  const stories = [...categories, { id: 'overrun', name: 'La diferencia', cents: totals.deficitCents, title: `Faltaron ${cents(totals.deficitCents)}¢ por dólar.`, copy: `Los gastos sumaron US$${money(totals.expenses)} millones frente a US$${money(totals.revenue)} millones de ingresos: US$${money(totals.deficit)} millones de diferencia. Este saldo operativo no es la pérdida neta.` }];
  state.position = manualState.position = stops[0];
  root.classList.add('expense-experience');
  root.dataset.enhanced = String(hasEngine);
  root.innerHTML = `
    <div class="expense-panel" role="region" aria-labelledby="${prefix}-title">
      <header class="expense-header">
        <p class="expense-kicker">ENERO–JUNIO DE 2026 · POR CADA US$1 DE INGRESOS</p>
        <h3 id="${prefix}-title">El viaje de un dólar.</h3>
        <button class="expense-total" type="button" data-expense-index="4" aria-pressed="false" aria-label="Explorar la diferencia: ${cents(totals.expenseCents)} centavos de gastos por cada dólar de ingresos">
          <span>${cents(totals.expenseCents)}<small>¢</small></span><span>en gastos <b aria-hidden="true">↗</b></span>
        </button>
      </header>
      <figure class="expense-figure" aria-describedby="${prefix}-description">
        <div class="expense-plot" role="img" aria-label="Gastos apilados proporcionales; escala de cero a 110 centavos por dólar de ingresos">
          <div class="expense-income-line"><span>100¢ de ingresos</span></div>
          <div class="expense-mascot" aria-hidden="true">${mascot}</div>
          <div class="expense-stack" aria-hidden="true">
            ${categories.map((item, i) => `<span class="expense-segment" data-expense-segment="${i}" style="width:${item.width}%;--expense-color:${item.color}"></span>`).join('')}
          </div>
          <div class="expense-overrun" aria-hidden="true" style="width:${totals.deficitCents / EXPENSE_DATA.scaleCents * 100}%"></div>
          <div class="expense-axis" aria-hidden="true"><span>0¢</span><span>50¢</span><span>110¢</span></div>
        </div>
        <figcaption id="${prefix}-description" class="expense-sr-only">Primer semestre de 2026. Ingresos: US$16,286 millones. Cómputo e infraestructura: US$8,945 millones, 54.9 centavos por dólar de ingresos. Personal: US$3,152 millones, 19.4 centavos. Ventas, marketing y alianzas: US$3,168 millones, 19.5 centavos. Otros gastos operativos y administrativos: US$1,714 millones, 10.5 centavos. Total de gastos: US$16,979 millones, 104.3 centavos. Exceso de gastos sobre ingresos: US$693 millones, 4.3 centavos. La zona rayada forma parte del gasto ya mostrado; no es un quinto gasto. El acuerdo Bartz registra cero en este semestre y no tiene segmento. Las anchuras usan las cifras exactas, antes de redondear.</figcaption>
      </figure>
      <div class="expense-legend" role="group" aria-label="Explorar los cuatro rubros del gasto">
        ${categories.map((item, i) => `<button class="expense-category" type="button" data-expense-index="${i}" aria-pressed="false" aria-controls="${prefix}-note" style="--expense-color:${item.color}"><span class="expense-category-name"><i aria-hidden="true"></i>${item.name}</span><span class="expense-category-value">${cents(item.cents)}<small>¢</small><span>US$${money(item.amount)} M</span></span></button>`).join('')}
      </div>
      <div class="expense-note" id="${prefix}-note">
        <p class="expense-note-value" aria-hidden="true"></p>
        <div><h4 class="expense-note-title"></h4><p class="expense-note-copy"></p></div>
      </div>
      <div class="expense-footnote">
        <p>Costos globales con I+D; <strong>no costo de un chat.</strong> Enero–junio de 2026. Bartz: US$0.</p>
        <p>Cálculo: rubro ÷ ingresos (US$16,286 M) × 100. Proporciones sin redondear; los decimales visibles pueden no sumar exactamente. <a href="https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm" target="_blank" rel="noopener noreferrer">S-1, p. 22 (PDF 33) ↗</a></p>
      </div>
      <p class="expense-scroll-cue" aria-hidden="true"></p>
      <p class="expense-sr-only expense-announcement" role="status" aria-live="polite"></p>
    </div>`;

  const $ = selector => root.querySelector(selector);
  const panel = $('.expense-panel'), walker = $('.expense-mascot'), body = $('.expense-mascot-body');
  const footA = $('.expense-foot-a'), footB = $('.expense-foot-b');
  const armA = $('.expense-arm-left'), armB = $('.expense-arm-right');
  const buttons = [...root.querySelectorAll('[data-expense-index]')], segments = [...root.querySelectorAll('[data-expense-segment]')];
  const noteValue = $('.expense-note-value'), noteTitle = $('.expense-note-title'), noteCopy = $('.expense-note-copy');

  function render(index, position, walking = enabled) {
    if (disposed) return;
    const bounded = Math.max(0, Math.min(4, index));
    if (active !== bounded) {
      active = bounded;
      const story = stories[active];
      noteValue.textContent = `${active === 4 ? '+' : ''}${cents(story.cents)}¢`;
      noteTitle.textContent = story.title; noteCopy.textContent = story.copy;
      root.dataset.expenseStep = story.id;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.expenseIndex) === active)));
      segments.forEach((segment, i) => segment.classList.toggle('is-active', i === active));
    }
    walker.style.left = `${position}%`;
    const stride = walking ? Math.sin(position * .9) : 0;
    body.setAttribute('transform', `translate(0 ${-Math.abs(stride) * 1.8})`);
    footA.setAttribute('transform', `translate(${stride * 1.8} ${stride * 1.7})`);
    footB.setAttribute('transform', `translate(${-stride * 1.8} ${-stride * 1.7})`);
    armA.setAttribute('transform', `translate(0 ${stride * 1.5})`);
    armB.setAttribute('transform', `translate(0 ${-stride * 1.5})`);
  }
  function renderState() {
    if (manual !== null) render(manual, manualState.position);
    else render(Math.round(state.focus), state.position);
  }
  function clearTimeline() {
    timeline?.scrollTrigger?.kill(); timeline?.kill(); timeline = null;
  }
  function buildTimeline() {
    clearTimeline(); lastScroll = null;
    if (!enabled || !hasEngine) return;
    gsap.registerPlugin(ScrollTrigger);
    Object.assign(state, { position: stops[0], focus: 0, hold: 0 });
    timeline = gsap.timeline({
      defaults: { ease: 'none' }, onUpdate: renderState,
      scrollTrigger: {
        trigger: root,
        start: () => `top ${Math.round(parseFloat(win.getComputedStyle(panel).top) || 0)}px`,
        end: () => `+=${Math.max(1, root.offsetHeight - panel.offsetHeight)}`,
        scrub: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          if (lastScroll !== null && Math.abs(self.progress - lastScroll) > .0001 && manual !== null) {
            manual = null; manualTween?.kill(); manualTween = null;
          }
          lastScroll = self.progress;
        }
      }
    });
    timeline.addLabel('compute', 0).to(state, { position: stops[0], focus: 0, hold: 1, duration: .5 });
    for (let i = 1; i < stops.length; i++) {
      timeline.to(state, { position: stops[i], focus: i, duration: .8 })
        .addLabel(stories[i].id).to(state, { hold: i + 1, duration: .3 });
    }
    timeline.scrollTrigger?.refresh();
  }
  function selectCategory(event) {
    const button = event.target.closest('[data-expense-index]');
    if (!button || !root.contains(button)) return;
    const index = Number(button.dataset.expenseIndex);
    manualTween?.kill(); manualState.position = parseFloat(walker.style.left) || stops[0]; manual = index;
    if (enabled && gsap && !doc.hidden) {
      manualTween = gsap.to(manualState, { position: stops[index], duration: .5, ease: 'power2.inOut', onUpdate: renderState, onComplete: () => render(index, stops[index], false) });
    } else { manualState.position = stops[index]; render(index, stops[index], false); }
    $('.expense-announcement').textContent = `${stories[index].title} ${stories[index].copy}`;
  }
  function setMotion(value) {
    if (disposed) return;
    enabled = Boolean(value);
    manualTween?.kill(); manualTween = null;
    root.dataset.motion = enabled ? 'on' : 'off';
    $('.expense-scroll-cue').textContent = enabled && hasEngine ? 'Sigue bajando: el personaje recorre el gasto ↓' : 'Animación pausada · selecciona un rubro para explorarlo';
    buildTimeline(); renderState();
  }
  function visibility() {
    if (doc.hidden) { timeline?.scrollTrigger?.getTween()?.pause(); manualTween?.pause(); }
    else if (enabled) { timeline?.scrollTrigger?.getTween()?.resume(); manualTween?.resume(); }
  }
  const onReducedMotion = event => { if (event.matches) setMotion(false); };
  root.addEventListener('click', selectCategory);
  doc.addEventListener('visibilitychange', visibility);
  media?.addEventListener?.('change', onReducedMotion);
  render(0, stops[0], false); setMotion(enabled);
  const api = {
    setMotion,
    dispose() {
      if (disposed) return;
      disposed = true; clearTimeline(); manualTween?.kill();
      root.removeEventListener('click', selectCategory); doc.removeEventListener('visibilitychange', visibility);
      media?.removeEventListener?.('change', onReducedMotion);
      root.replaceChildren(); root.classList.remove('expense-experience');
      delete root.dataset.enhanced; delete root.dataset.motion; delete root.dataset.expenseStep;
      mounts.delete(root);
    }
  };
  mounts.set(root, api);
  return api;
}
