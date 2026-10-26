/* The race to the first trillion, redrawn in the story's own line work. Scroll moves time forward. */
import { RACE, raceRows, yearsBetween, formatMoney } from './data.js';
import { MASCOT_SVG } from './expense-scene.js';

const SPAN = 45; // years on the track
const pct = years => `${Math.min(years, SPAN) / SPAN * 100}%`;
const yearsLabel = y => `${formatMoney(y, 0)} años`;

export function raceStory() {
  const rows = raceRows(), a = RACE.anthropic, anthropicYears = yearsBetween(a.founded, a.date);
  const months = Math.floor((anthropicYears % 1) * 12); // completed months since January 2021
  return {
    rows, anthropicYears,
    anthropicLabel: `${Math.floor(anthropicYears)} años y ${months} meses`,
    steps: [
      { title: 'Diecisiete años, la más rápida.', copy: `Meta llegó a su primer billón de dólares en bolsa ${yearsLabel(rows[0].years)} después de su fundación. Tesla, a los ${formatMoney(rows[1].years, 0)}.` },
      { title: 'Para otras, más de cuarenta.', copy: 'Alphabet tardó 21 años, Amazon 24 y Nvidia 30. Apple llegó a los 42 y Microsoft a los 44.' },
      { title: `Anthropic: ${Math.floor(anthropicYears)} años y ${months} meses.`, copy: `En mayo de 2026, una ronda privada la valuó en ${formatMoney(a.value)} mil millones de dólares. Todavía no es un billón, y no es la misma medida: una ronda la pactan pocos inversionistas; la capitalización la fija el mercado cada día.` }
    ]
  };
}

export function mountRaceScene({ root, gsap, ScrollTrigger, motion = true } = {}) {
  if (!root?.ownerDocument) throw new TypeError('mountRaceScene needs a root element');
  const doc = root.ownerDocument, win = doc.defaultView;
  const story = raceStory(), hasEngine = Boolean(gsap && ScrollTrigger);
  let enabled = Boolean(motion), trigger = null, step = -1;
  root.classList.add('race-experience');
  root.innerHTML = `
    <div class="race-panel" role="region" aria-labelledby="race-title">
      <header class="race-header">
        <p class="race-kicker">AÑOS DESDE LA FUNDACIÓN HASTA EL PRIMER BILLÓN DE DÓLARES</p>
        <h3 id="race-title" class="race-title"></h3>
        <p class="race-copy"></p>
      </header>
      <ol class="race-lanes" aria-hidden="true">
        <li class="race-lane is-anthropic" data-years="${story.anthropicYears}">
          <span class="race-name">Anthropic</span>
          <span class="race-track"><i class="race-bar"></i><span class="race-runner">${MASCOT_SVG}</span><span class="race-end" style="left:${pct(story.anthropicYears)}">${story.anthropicLabel} · US$${formatMoney(RACE.anthropic.value)} mil millones</span></span>
        </li>
        ${story.rows.map(r => `<li class="race-lane" data-years="${r.years}"><span class="race-name">${r.name}</span><span class="race-track"><i class="race-bar"></i><span class="race-flag" style="left:${pct(r.years)}"></span><span class="race-end${r.years > 30 ? ' is-left' : ''}" style="left:${pct(r.years)}">${yearsLabel(r.years)}</span></span></li>`).join('')}
        <li class="race-axis"><span></span><span class="race-ticks">${[0, 10, 20, 30, 40].map(y => `<span style="left:${pct(y)}">${y}</span>`).join('')}</span></li>
      </ol>
      <table class="race-sr-only">
        <caption>Años desde la fundación hasta el primer billón de dólares de capitalización bursátil</caption>
        <tbody>${story.rows.map(r => `<tr><th scope="row">${r.name}</th><td>${formatMoney(r.years, 1)} años</td></tr>`).join('')}
        <tr><th scope="row">Anthropic</th><td>${formatMoney(story.anthropicYears, 1)} años hasta una valuación privada de ${formatMoney(RACE.anthropic.value)} mil millones de dólares (mayo de 2026); aún no un billón</td></tr></tbody>
      </table>
      <p class="race-foot">Capitalización en bolsa el primer día que llegó a US$1 billón (10<sup>12</sup>), frente a la valuación post-money de la Serie H de Anthropic. Dólares nominales; años desde la fundación.</p>
    </div>`;
  const lanes = [...root.querySelectorAll('.race-lane')].map(el => ({ el, years: Number(el.dataset.years), anthropic: el.classList.contains('is-anthropic'), bar: el.querySelector('.race-bar'), runner: el.querySelector('.race-runner') }));
  const title = root.querySelector('.race-title'), copy = root.querySelector('.race-copy');

  function render(progress) {
    const p = Math.max(0, Math.min(1, progress));
    const cursor = Math.min(1, p / .6) * SPAN, ours = Math.max(0, Math.min(1, (p - .64) / .24)) * story.anthropicYears;
    for (const lane of lanes) {
      const shown = lane.anthropic ? ours : Math.min(cursor, lane.years);
      lane.bar.style.width = pct(shown);
      lane.el.classList.toggle('is-done', lane.anthropic ? ours >= story.anthropicYears - .01 : cursor >= lane.years);
      if (lane.runner) { lane.runner.style.left = pct(shown); lane.runner.classList.toggle('is-walking', enabled && ours > .02 && ours < story.anthropicYears - .02); }
    }
    const next = p < .3 ? 0 : p < .64 ? 1 : 2;
    if (next !== step) { step = next; title.textContent = story.steps[step].title; copy.textContent = story.steps[step].copy; root.dataset.raceStep = String(step); }
  }
  function build() {
    trigger?.kill(); trigger = null;
    root.dataset.enhanced = String(enabled && hasEngine);
    if (!enabled || !hasEngine) { render(1); return; }
    const panel = root.querySelector('.race-panel');
    trigger = ScrollTrigger.create({
      trigger: root,
      start: () => `top ${Math.round(parseFloat(win.getComputedStyle(panel).top) || 0)}px`,
      end: () => `+=${Math.max(1, root.offsetHeight - panel.offsetHeight)}`,
      invalidateOnRefresh: true,
      onUpdate: self => render(self.progress)
    });
    render(trigger.progress || 0);
  }
  build();
  return {
    setMotion(value) { enabled = Boolean(value); build(); },
    dispose() { trigger?.kill(); root.replaceChildren(); root.classList.remove('race-experience'); }
  };
}
