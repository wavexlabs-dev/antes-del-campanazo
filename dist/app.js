import {StoryStage} from './stage.js';
import {PRODUCTS,CUSTOMER_TIERS,FINANCIAL_LENSES,RISKS,ECONOMY,shareScenario,timeScenario} from './enrichment.js';
import {mountExpenseScene} from './expense-scene.js';
import {mountRaceScene} from './race-scene.js';
import {mountFigures,setFigureMotion} from './figures.js';
import {ANNUAL_REVENUE,QUARTERLY_REVENUE,CHAPTERS,ACTS,RULER,SOURCES,GLOSSARY,comparison,comparisonLeader,formatMoney,safePreferences} from './data.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const storageKey='antes-del-campanazo:preferences:v1';
let stored;try{stored=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{stored=null;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),prefs=safePreferences(stored);
if(reduced.matches)prefs.motion=false;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
if(gsap&&ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
const stage=new StoryStage($('#story-canvas'),{motion:prefs.motion});
let activeScene=0,economy='adoption',flow='primary',scrollContext=null,refreshTimer=0,audioContext=null;
let metricTween=null,expenseScene=null,raceScene=null;
let product='code',customerTier='100k',lens='operations',risk='compute',direction=1;
const rail=$('.visual-rail'),ruler=$('.time-ruler');
const activeId=()=>CHAPTERS[activeScene].id;
const updateStage=()=>{const c=CHAPTERS[activeScene];stage.setScene(c.world,{...options(),...(c.stage||{})});};
document.documentElement.classList.add('js');
function save(){try{localStorage.setItem(storageKey,JSON.stringify(prefs));}catch{/* Reading works with blocked storage. */}}
function options(){return {year:prefs.year,age:prefs.age,economy,flow,product,customerTier,lens,risk,direction,sharePrice:Number($('#share-price').value),shareCount:10+Number($('#share-new').value)};}

/* The time ruler in the header: where in the story's calendar each chapter sits. */
function buildRuler(){
 const years=RULER.years.map(([y,at])=>`<span class="tr-year" style="--x:${at}">${y}</span>`).join('');
 const giros=CHAPTERS.filter(c=>c.kind==='giro').map(c=>`<i class="tr-giro" style="--x:${c.when}"></i>`).join('');
 $('.tr-ticks').innerHTML=years+`<span class="tr-year tr-future" style="--x:96">después</span>`+giros;
}
function updateRuler(chapter){
 ruler.style.setProperty('--at',chapter.when);
 ruler.classList.toggle('has-span',!!chapter.span);
 if(chapter.span){ruler.style.setProperty('--a',chapter.span[0]);ruler.style.setProperty('--b',chapter.span[1]);}
 ruler.classList.toggle('is-giro',chapter.kind==='giro');
}
function stageLayout(chapter){
 const dock=document.querySelector(`#${chapter.id} .stage-dock`);
 rail.classList.toggle('is-docked',!!dock);
 rail.classList.toggle('is-suppressed',chapter.layout==='full');
 if(dock&&rail.parentElement!==dock)dock.appendChild(rail);
 else if(!dock&&rail.parentElement!==$('#story'))$('#story').prepend(rail);
}
function activate(index){
 const chapter=CHAPTERS[index];if(!chapter)return;stageLayout(chapter);
 if(activeScene!==index){direction=Math.sign(index-activeScene)||1;activeScene=index;updateStage();}
 updateRuler(chapter);
 $('#story-canvas').setAttribute('aria-label',`Ilustración: ${chapter.name}, ${chapter.year}.`);
 $('#stage-note').textContent=chapter.note||'';
 $$('#chapter-menu a').forEach((a,i)=>a.setAttribute('aria-current',String(i===index)));
}
function renderRevenue(animate=false){
 $$('#revenue-year').forEach(el=>el.textContent=prefs.year);
 $$('[data-revenue-year]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.revenueYear)===prefs.year)));
 const value=ANNUAL_REVENUE[prefs.year],element=$('#revenue-value');
 metricTween?.kill();
 if(animate&&gsap&&prefs.motion){const v={n:Number(element.textContent.replaceAll(',',''))||value};metricTween=gsap.to(v,{n:value,duration:.5,ease:'power2.out',onUpdate:()=>element.textContent=formatMoney(Math.round(v.n)),onComplete:()=>element.textContent=formatMoney(value)});}
 else element.textContent=formatMoney(value);
 if(activeId()==='crecimiento')updateStage();
}
const money=v=>formatMoney(v,Number.isInteger(v)?0:1);
function renderComparison(){
 const rows=comparison(prefs.age),[first,...rest]=rows;
 rest.sort((a,b)=>(b.revenue??-1)-(a.revenue??-1));
 const max=Math.max(...rows.map(r=>r.revenue??0));
 $('#comparison-ledger').innerHTML=[first,...rest].map(c=>{
  const known=Number.isFinite(c.revenue),w=known?Math.max(.8,c.revenue/max*100):100;
  return `<div class="company-row${c.id==='anthropic'?' is-anthropic':''}${known?'':' is-missing'}"><div><span class="company-name">${c.name}</span><span class="company-meta">${c.period} · ${c.model}</span></div><div class="company-amount">${known?money(c.revenue):'—'}<small>${known?'millones de USD':c.missing}</small></div><span class="company-bar" aria-hidden="true" style="--w:${w}%"></span></div>`;
 }).join('');
 $$('[data-age]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.age)===prefs.age)));
 const {anthropic,top,ratio}=comparisonLeader(prefs.age);
 const lead=ratio>=1?`En su año ${prefs.age}, Anthropic reportó ${formatMoney(ratio,1)} veces los ingresos de ${top.name}, la que más vendía de las demás en esa misma etapa.`:`En su año ${prefs.age}, ${top.name} iba adelante: ${money(top.revenue)} millones frente a ${money(anthropic.revenue)} de Anthropic.`;
 $('#comparison-insight').textContent=`${lead} Las barras están a escala dentro de cada año. Dólares de épocas distintas, sin ajustar por inflación.`;
 if(activeId()==='misma-etapa')updateStage();
}
function renderQuarters(){
 const max=Math.max(...QUARTERLY_REVENUE.map(q=>q.value));
 $('#quarter-chart ol').innerHTML=QUARTERLY_REVENUE.map(q=>`<li class="${q.year===2026?'is-2026':''}" style="--h:${(q.value/max*100).toFixed(2)}%"><span class="q-value">${formatMoney(q.value)}</span><span class="q-bar"></span><span class="q-label">${q.period}<b>${String(q.year).slice(2)}</b></span></li>`).join('');
 $('#quarter-chart').setAttribute('aria-label',`Ingresos trimestrales en millones de dólares: ${QUARTERLY_REVENUE.map(q=>`${q.period} de ${q.year}, ${formatMoney(q.value)}`).join('; ')}.`);
}
function renderEconomy(){const c=ECONOMY[economy];for(const [key,value] of Object.entries({label:c.label,heading:c.title,copy:c.copy,benefit:c.benefit,friction:c.friction,evidence:c.evidence}))$(`#economy-${key}`).textContent=value;$('#economy-source').textContent=c.source+' ↗';$('#economy-source').href=c.url;$$('[data-economy]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.economy===economy)));if(activeId()==='economia')updateStage();}
function renderProduct(){const c=PRODUCTS[product];for(const key of ['date','title','copy','meaning'])$(`#product-${key}`).textContent=c[key];$$('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===product)));if(activeId()==='logros')updateStage();}
function renderCustomers(){const c=CUSTOMER_TIERS[customerTier];$('#customer-count').textContent=c.count;$('#customer-threshold').textContent=c.threshold;$('#customer-before').textContent=c.before;$$('[data-tier]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tier===customerTier)));if(activeId()==='clientes')updateStage();}
function renderFinance(){const c=FINANCIAL_LENSES[lens];for(const key of ['label','unit','title','copy','limit'])$(`#finance-${key}`).textContent=c[key];$('#finance-value').textContent=(c.value>0&&lens==='operations'?'+':'')+formatMoney(c.value);$$('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lens===lens)));if(activeId()==='cuentas')updateStage();}
function renderRisk(){const c=RISKS[risk];for(const key of ['label','title','fact','mechanism','watch'])$(`#risk-${key}`).textContent=c[key];$$('[data-risk]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.risk===risk)));if(activeId()==='riesgos')updateStage();}
function renderShares(){const c=shareScenario($('#share-price').value,$('#share-new').value);$('#share-price-value').textContent=`US$${c.price}`;$('#share-new-value').textContent=`${c.newMillions} ${c.newMillions===1?'millón':'millones'}`;$('#share-market').textContent=`US$${formatMoney(c.postValueMillions)} millones`;$('#share-raised').textContent=`US$${formatMoney(c.raisedMillions)} millones`;$('#share-equation').textContent=`US$${c.price} × ${c.totalMillions} millones de acciones`;$('#share-ownership').textContent=`${formatMoney(c.previousOnePercent,2)}%`;if(activeId()==='acciones')updateStage();}
function renderTime(){const p=Number($('#time-saving').value),r=Number($('#time-review').value),c=timeScenario(20,p,r,10);$('#time-saving-value').textContent=p+'%';$('#time-review-value').textContent=r+' min';$('#time-result').textContent=formatMoney(Math.abs(c.netSaved))+' min';$('#time-description').textContent=c.netSaved>0?'disponibles después de revisar':c.netSaved<0?'adicionales: revisar tomó más que el ahorro':'de ahorro neto: la revisión consumió lo ganado';}
function renderFlow(){const primary=flow==='primary';$('#money-recipient').textContent=primary?'Empresa':'Vendedor';$('#money-explanation').textContent=primary?'Si la empresa emite la acción, recibe el dinero de esa venta. Aumenta el número de acciones y puede cambiar la participación proporcional de los dueños existentes.':'Si un accionista vende una acción que ya tiene, el dinero va a ese vendedor. Esa compraventa no aporta automáticamente dinero a la caja de Anthropic.';$$('[data-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flow===flow)));if(activeId()==='ipo')updateStage();}
function setMotion(){if(!prefs.motion){metricTween?.progress(1).kill();}stage.setMotion(prefs.motion);expenseScene?.setMotion(prefs.motion);raceScene?.setMotion(prefs.motion);setFigureMotion(prefs.motion);document.documentElement.classList.toggle('motion-off',!prefs.motion);$('#motion-button').setAttribute('aria-pressed',String(!prefs.motion));$('#motion-button').setAttribute('aria-label',prefs.motion?'Pausar animación':'Activar animación');$('#motion-button span').textContent=prefs.motion?'Ⅱ':'▷';document.documentElement.style.scrollBehavior='auto';}
function refresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>ScrollTrigger?.refresh(),120);}
// A jump (a link, the chapter menu, a restored scroll) can land past where the entrances start; show what is already passed.
function revealPassed(){if(!gsap||!prefs.motion)return;const limit=innerHeight*.92,els=$$('.reveal').filter(el=>getComputedStyle(el).visibility==='hidden'&&el.getBoundingClientRect().top<limit);const above=els.filter(el=>el.getBoundingClientRect().bottom<0),inView=els.filter(el=>!above.includes(el));if(above.length)gsap.set(above,{autoAlpha:1,y:0,overwrite:true});if(inView.length)gsap.to(inView,{autoAlpha:1,y:0,duration:.45,ease:'power2.out',stagger:.06,overwrite:true});}
if(ScrollTrigger){ScrollTrigger.addEventListener('refresh',revealPassed);ScrollTrigger.addEventListener('scrollEnd',revealPassed);}
function setupScroll(){
 scrollContext?.revert();
 if(gsap&&ScrollTrigger){
  scrollContext=gsap.context(()=>{
   const mobile=()=>innerWidth<=760;
   $$('.story-section').forEach((section,i)=>{
    // Wide and full chapters take the stage earlier, so the fixed drawing never sits on a centred heading.
    const broad=CHAPTERS[i].layout==='wide'||CHAPTERS[i].layout==='full';
    const at=()=>mobile()?'68%':broad?'82%':'55%';
    ScrollTrigger.create({trigger:section,start:()=>`top ${at()}`,end:()=>`bottom ${at()}`,onEnter:()=>activate(i),onEnterBack:()=>activate(i),onUpdate:self=>{if(self.isActive){if(activeScene!==i)activate(i);stage.setProgress(self.progress);}}});
   });
   if(prefs.motion){
    // One entrance per screenful: blocks that arrive together rise together, in reading order, once.
    gsap.set('.reveal',{autoAlpha:0,y:14});
    ScrollTrigger.batch('.reveal',{start:'top 90%',once:true,onEnter:batch=>gsap.to(batch,{autoAlpha:1,y:0,duration:.55,ease:'power2.out',stagger:.08,overwrite:true})});
    gsap.from('#quarter-chart .q-bar',{scaleY:0,transformOrigin:'50% 100%',duration:.7,ease:'power2.out',stagger:.07,scrollTrigger:{trigger:'#quarter-chart',start:'top 80%',once:true}});
   }
   ScrollTrigger.create({trigger:'.site-footer',start:'top 72%',onEnter:()=>{if(prefs.motion)gsap.to('.visual-rail',{autoAlpha:0,duration:.3});else gsap.set('.visual-rail',{autoAlpha:0});},onLeaveBack:()=>gsap.to('.visual-rail',{autoAlpha:1,duration:prefs.motion?.3:0})});
  });
  ScrollTrigger.refresh();
 }else{
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)activate(Number(entry.target.dataset.scene));},{rootMargin:'-25% 0px -40% 0px',threshold:0});
  $$('.story-section').forEach(s=>observer.observe(s));
 }
}
function openDialog(dialog){if(!dialog.open){dialog.showModal();document.body.classList.add('modal-open');}}
function closeDialog(dialog){dialog.close();document.body.classList.toggle('modal-open',!!$('dialog[open]'));}
$$('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close')?.addEventListener('click',()=>closeDialog(dialog));dialog.addEventListener('close',()=>{document.body.classList.toggle('modal-open',!!$('dialog[open]'));});dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);});});
{
 let act=0;const roman=['I','II','III','IV'];
 $('#chapter-menu').innerHTML=CHAPTERS.map((s,i)=>{let head='';if(s.act!==act){act=s.act;head=`<p class="menu-act"><span>${roman[act-1]}</span>${ACTS[act]}</p>`;}return `${head}<a href="#${s.id}" data-chapter="${i}"${s.kind==='giro'?' class="is-giro"':''}><span>${String(i+1).padStart(2,'0')}</span><b>${s.kind==='giro'?'<em>Giro · </em>':''}${s.name}</b><span>${s.year}</span></a>`;}).join('');
}
$$('#chapter-menu a').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const i=Number(link.dataset.chapter);closeDialog($('#chapters-dialog'));history.pushState(null,'',`#${CHAPTERS[i].id}`);document.getElementById(CHAPTERS[i].id).scrollIntoView({behavior:'instant',block:'start'});activate(i);setTimeout(revealPassed,60);}));
$('#chapters-button').addEventListener('click',()=>{activate(activeScene);openDialog($('#chapters-dialog'));});
function showSources(id=null){const relevant=s=>id!==null&&s.chapters.includes(id);const ordered=id===null?SOURCES:[...SOURCES.filter(relevant),...SOURCES.filter(s=>!relevant(s))];$('#source-list').innerHTML=ordered.map(s=>`<article class="source-item ${relevant(s)?'is-relevant':''}"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a><p>${s.note}</p></article>`).join('');openDialog($('#sources-dialog'));}
$('#sources-button').addEventListener('click',()=>showSources());$('#all-sources-button').addEventListener('click',()=>showSources());$$('[data-source]').forEach(b=>b.addEventListener('click',()=>showSources(b.dataset.source)));
$('#glossary-list').innerHTML=GLOSSARY.map(([word,meaning])=>`<dt>${word}</dt><dd>${meaning}</dd>`).join('');$('#glossary-button').addEventListener('click',()=>openDialog($('#glossary-dialog')));
$$('[data-revenue-year]').forEach(b=>b.addEventListener('click',()=>{prefs.year=Number(b.dataset.revenueYear);renderRevenue(true);save();}));
$$('[data-age]').forEach(b=>b.addEventListener('click',()=>{prefs.age=Number(b.dataset.age);renderComparison();save();}));
$$('[data-economy]').forEach(b=>b.addEventListener('click',()=>{economy=b.dataset.economy;renderEconomy();refresh();}));
$$('[data-flow]').forEach(b=>b.addEventListener('click',()=>{flow=b.dataset.flow;renderFlow();refresh();}));
$$('.story-detail').forEach(detail=>detail.addEventListener('toggle',refresh));
$('#motion-button').addEventListener('click',()=>{prefs.motion=!prefs.motion;setMotion();setupScroll();save();});
reduced.addEventListener('change',e=>{if(e.matches){prefs.motion=false;setMotion();setupScroll();save();}setTimeout(()=>setFigureMotion(prefs.motion),0);});
function renderSound(){$('#sound-button').textContent=`Sonido: ${prefs.sound?'activado':'apagado'}`;$('#sound-button').setAttribute('aria-pressed',String(prefs.sound));}
$('#sound-button').addEventListener('click',()=>{prefs.sound=!prefs.sound;renderSound();save();});
function playBell(){
 if(!prefs.sound)return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  audioContext??=new Audio();audioContext.resume();const t=audioContext.currentTime;
  [523.25,1046.5,1569.75].forEach((frequency,i)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.085/(i+1),t+.01);gain.gain.exponentialRampToValueAtTime(.0001,t+2.2-i*.25);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(t);oscillator.stop(t+2.3);});
 }catch{$('#sound-button').textContent='Sonido no disponible';}
}
$('#ring-button').addEventListener('click',()=>{const finalIndex=CHAPTERS.findIndex(c=>c.id==='campana');if(activeScene!==finalIndex)activate(finalIndex);stage.ring();playBell();$('#bell-result').textContent='El campanazo de esta escena es simbólico. La oferta real seguía pendiente a la fecha del documento.';$('#ring-button').innerHTML='Volver a imaginar ese día <span aria-hidden="true">↗</span>';});
$$('[data-product]').forEach(b=>b.addEventListener('click',()=>{product=b.dataset.product;renderProduct();refresh();}));
$$('[data-tier]').forEach(b=>b.addEventListener('click',()=>{customerTier=b.dataset.tier;renderCustomers();refresh();}));
$$('[data-lens]').forEach(b=>b.addEventListener('click',()=>{lens=b.dataset.lens;renderFinance();refresh();}));
$$('[data-risk]').forEach(b=>b.addEventListener('click',()=>{risk=b.dataset.risk;renderRisk();refresh();}));
for(const id of ['share-price','share-new'])$('#'+id).addEventListener('input',renderShares);
for(const id of ['time-saving','time-review'])$('#'+id).addEventListener('input',renderTime);
buildRuler();renderQuarters();
renderProduct();renderCustomers();renderFinance();renderRisk();renderShares();renderTime();
renderRevenue();renderComparison();renderEconomy();renderFlow();renderSound();
expenseScene=mountExpenseScene({root:$('#expense-experience'),gsap,ScrollTrigger,motion:prefs.motion});
raceScene=mountRaceScene({root:$('#race-experience'),gsap,ScrollTrigger,motion:prefs.motion});
mountFigures();
setMotion();activate(0);setupScroll();
document.fonts?.ready.then(refresh);window.addEventListener('load',()=>{refresh();if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target?.matches('.story-section'))target.scrollIntoView({behavior:'instant',block:'start'});}setTimeout(revealPassed,200);});
window.addEventListener('pagehide',()=>{audioContext?.suspend();});
