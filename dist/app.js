import {StoryStage} from './stage.js';
import {PRODUCTS,CUSTOMER_TIERS,FINANCIAL_LENSES,RISKS,ECONOMY,shareScenario,timeScenario} from './enrichment.js';
import {mountExpenseScene} from './expense-scene.js';
import {ANNUAL_REVENUE,CHAPTERS,SOURCES,GLOSSARY,comparison,formatMoney,safePreferences} from './data.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const storageKey='antes-del-campanazo:preferences:v1';
let stored;try{stored=JSON.parse(localStorage.getItem(storageKey)||'null');}catch{stored=null;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),prefs=safePreferences(stored);
if(reduced.matches)prefs.motion=false;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
if(gsap&&ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
const stage=new StoryStage($('#story-canvas'),{motion:prefs.motion});
let activeScene=0,economy='adoption',flow='primary',scrollContext=null,refreshTimer=0,audioContext=null;
let metricTween=null,chartTween=null,expenseScene=null;
let product='platform',customerTier='100k',lens='operations',risk='compute',direction=1;
const rail=$('.visual-rail');
const activeId=()=>CHAPTERS[activeScene].id;
const updateStage=()=>stage.setScene(CHAPTERS[activeScene].world,options());
document.documentElement.classList.add('js');
function save(){try{localStorage.setItem(storageKey,JSON.stringify(prefs));}catch{/* Reading works with blocked storage. */}}
function options(){return {year:prefs.year,age:prefs.age,economy,flow,product,customerTier,lens,risk,direction,sharePrice:Number($('#share-price').value),shareCount:10+Number($('#share-new').value)};}
function stageLayout(chapter){const dock=document.querySelector(`#${chapter.id} .stage-dock`);rail.classList.toggle('is-docked',!!dock);rail.classList.toggle('is-suppressed',chapter.id==='infraestructura');if(dock&&rail.parentElement!==dock)dock.appendChild(rail);else if(!dock&&rail.parentElement!==$('#story'))$('#story').prepend(rail);}
function activate(index){
 const chapter=CHAPTERS[index];if(!chapter)return;stageLayout(chapter);
 if(activeScene!==index){direction=Math.sign(index-activeScene)||1;activeScene=index;updateStage();}
 $('#stage-number').textContent=`${String(index+1).padStart(2,'0')} / ${CHAPTERS.length}`;
 $('#stage-caption').textContent=chapter.caption;
 $('#story-canvas').setAttribute('aria-label',`Ilustración animada: ${chapter.name}. ${chapter.caption}`);
 $('#stage-note').textContent=chapter.id==='campana'?'ESCENA FUTURA · CAMPANAZO SIMBÓLICO':chapter.id==='valuacion'?'VALUACIÓN · REFERENCIA COMPARTIDA':'Ilustración simbólica · no representa cifras a escala';
 const chart=$('#valuation-stage');
 if(chapter.id==='valuacion'&&chart.hidden){chart.hidden=false;chartTween?.kill();if(gsap&&prefs.motion)chartTween=gsap.fromTo(chart,{y:25,autoAlpha:0},{y:0,autoAlpha:1,duration:.55,delay:.1,ease:'power2.out'});}
 if(chapter.id!=='valuacion'){chartTween?.kill();chart.hidden=true;}
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
function renderComparison(){
 const rows=comparison(prefs.age);
 $('#comparison-ledger').innerHTML=rows.map(c=>`<div class="company-row"><div><span class="company-name">${c.name}</span><span class="company-meta">${c.year} · ${c.model}</span></div><div class="company-amount">${formatMoney(c.revenue,c.id==='anthropic'?0:1)}<small>millones de USD</small></div></div>`).join('');
 $$('[data-age]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.age)===prefs.age)));
 const [a,b,c]=rows;
 $('#comparison-insight').textContent=`En este año calendario, Anthropic reportó aproximadamente ${formatMoney(a.revenue/b.revenue,1)} veces los ingresos de Amazon y ${formatMoney(a.revenue/c.revenue,1)} veces los de Google en esa etapa. Dólares de épocas distintas, sin ajustar por inflación.`;
 if(activeId()==='misma-etapa')updateStage();
}
function renderEconomy(){const c=ECONOMY[economy];for(const [key,value] of Object.entries({label:c.label,heading:c.title,copy:c.copy,benefit:c.benefit,friction:c.friction,evidence:c.evidence}))$(`#economy-${key}`).textContent=value;$('#economy-source').textContent=c.source+' ↗';$('#economy-source').href=c.url;$$('[data-economy]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.economy===economy)));if(activeId()==='economia')updateStage();}
function renderProduct(){const c=PRODUCTS[product];for(const key of ['date','title','copy','meaning','source'])$(`#product-${key}`).textContent=c[key];$$('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===product)));if(activeId()==='logros')updateStage();}
function renderCustomers(){const c=CUSTOMER_TIERS[customerTier];$('#customer-count').textContent=c.count;$('#customer-threshold').textContent=c.threshold;$('#customer-before').textContent=c.before;$$('[data-tier]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tier===customerTier)));if(activeId()==='clientes')updateStage();}
function renderFinance(){const c=FINANCIAL_LENSES[lens];for(const key of ['label','unit','title','copy','limit','source'])$(`#finance-${key}`).textContent=c[key];$('#finance-value').textContent=(c.value>0&&lens==='operations'?'+':'')+formatMoney(c.value);$$('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lens===lens)));if(activeId()==='cuentas')updateStage();}
function renderRisk(){const c=RISKS[risk];for(const key of ['label','title','fact','mechanism','watch','source'])$(`#risk-${key}`).textContent=c[key];$$('[data-risk]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.risk===risk)));if(activeId()==='riesgos')updateStage();}
function renderShares(){const c=shareScenario($('#share-price').value,$('#share-new').value);$('#share-price-value').textContent=`US$${c.price}`;$('#share-new-value').textContent=`${c.newMillions} ${c.newMillions===1?'millón':'millones'}`;$('#share-market').textContent=`US$${formatMoney(c.postValueMillions)} millones`;$('#share-raised').textContent=`US$${formatMoney(c.raisedMillions)} millones`;$('#share-equation').textContent=`US$${c.price} × ${c.totalMillions} millones de acciones`;$('#share-ownership').textContent=`${formatMoney(c.previousOnePercent,2)}%`;if(activeId()==='acciones')updateStage();}
function renderTime(){const p=Number($('#time-saving').value),r=Number($('#time-review').value),c=timeScenario(20,p,r,10);$('#time-saving-value').textContent=p+'%';$('#time-review-value').textContent=r+' min';$('#time-result').textContent=formatMoney(Math.abs(c.netSaved))+' min';$('#time-description').textContent=c.netSaved>0?'disponibles después de revisar':c.netSaved<0?'adicionales: revisar tomó más que el ahorro':'de ahorro neto: la revisión consumió lo ganado';}
function renderFlow(){const primary=flow==='primary';$('#money-recipient').textContent=primary?'Empresa':'Vendedor';$('#money-explanation').textContent=primary?'Si la empresa emite la acción, recibe el dinero de esa venta. Aumenta el número de acciones y puede cambiar la participación proporcional de los dueños existentes.':'Si un accionista vende una acción que ya tiene, el dinero va a ese vendedor. Esa compraventa no aporta automáticamente dinero a la caja de Anthropic.';$$('[data-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flow===flow)));if(activeId()==='ipo')updateStage();if(gsap&&prefs.motion)gsap.fromTo('.money-arrow',{x:-9},{x:9,duration:.45,repeat:1,yoyo:true,ease:'power1.inOut'});}
function setMotion(){if(!prefs.motion){metricTween?.progress(1).kill();chartTween?.progress(1).kill();if(gsap){gsap.killTweensOf('.money-arrow');gsap.set('.money-arrow',{x:0});}}stage.setMotion(prefs.motion);expenseScene?.setMotion(prefs.motion);$('#motion-button').setAttribute('aria-pressed',String(!prefs.motion));$('#motion-button').setAttribute('aria-label',prefs.motion?'Pausar animación':'Activar animación');$('#motion-button span').textContent=prefs.motion?'Ⅱ':'▷';document.documentElement.style.scrollBehavior='auto';}
function refresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>ScrollTrigger?.refresh(),120);}
function setupScroll(){
 scrollContext?.revert();
 if(gsap&&ScrollTrigger){
  scrollContext=gsap.context(()=>{
   const mobile=()=>innerWidth<=760;
   $$('.story-section').forEach((section,i)=>{
    ScrollTrigger.create({trigger:section,start:()=>mobile()?'top 68%':'top 58%',end:()=>mobile()?'bottom 68%':'bottom 58%',onEnter:()=>activate(i),onEnterBack:()=>activate(i),onUpdate:self=>{if(self.isActive){if(activeScene!==i)activate(i);stage.setProgress(self.progress);}}});
    if(prefs.motion){
     section.querySelectorAll('.reveal').forEach(el=>{
      gsap.fromTo(el,{y:22,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 93%',toggleActions:'play none none none',once:true}});
     });
    }
   });
   gsap.to('.reading-progress span',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:0,end:'max',scrub:true}});
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
$('#chapter-menu').innerHTML=CHAPTERS.map((s,i)=>`<a href="#${s.id}" data-chapter="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.name}<span>${s.year}</span></a>`).join('');
$$('#chapter-menu a').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const i=Number(link.dataset.chapter);closeDialog($('#chapters-dialog'));history.pushState(null,'',`#${CHAPTERS[i].id}`);document.getElementById(CHAPTERS[i].id).scrollIntoView({behavior:'instant',block:'start'});activate(i);}));
$('#chapters-button').addEventListener('click',()=>{activate(activeScene);openDialog($('#chapters-dialog'));});
function showSources(index=null){const ordered=index===null?SOURCES:[...SOURCES.filter(s=>s.chapters.includes(index)),...SOURCES.filter(s=>!s.chapters.includes(index))];$('#source-list').innerHTML=ordered.map(s=>`<article class="source-item ${index!==null&&s.chapters.includes(index)?'is-relevant':''}"><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a><p>${s.note}</p></article>`).join('');openDialog($('#sources-dialog'));}
$('#sources-button').addEventListener('click',()=>showSources());$('#all-sources-button').addEventListener('click',()=>showSources());$$('[data-source]').forEach(b=>b.addEventListener('click',()=>showSources(b.dataset.source)));
$('#glossary-list').innerHTML=GLOSSARY.map(([word,meaning])=>`<dt>${word}</dt><dd>${meaning}</dd>`).join('');$('#glossary-button').addEventListener('click',()=>openDialog($('#glossary-dialog')));
$$('.chart-open').forEach(b=>b.addEventListener('click',()=>openDialog($('#chart-dialog'))));
$('#chart-zoom').addEventListener('click',()=>{const zoom=$('.chart-viewport').classList.toggle('zoomed');$('#chart-zoom').setAttribute('aria-pressed',String(zoom));$('#chart-zoom').textContent=zoom?'Ajustar a pantalla':'Ampliar al 150%';});
$$('[data-revenue-year]').forEach(b=>b.addEventListener('click',()=>{prefs.year=Number(b.dataset.revenueYear);renderRevenue(true);save();}));
$$('[data-age]').forEach(b=>b.addEventListener('click',()=>{prefs.age=Number(b.dataset.age);renderComparison();save();}));
$$('[data-economy]').forEach(b=>b.addEventListener('click',()=>{economy=b.dataset.economy;renderEconomy();refresh();}));
$$('[data-flow]').forEach(b=>b.addEventListener('click',()=>{flow=b.dataset.flow;renderFlow();refresh();}));
$$('.story-detail').forEach(detail=>detail.addEventListener('toggle',refresh));
$('#motion-button').addEventListener('click',()=>{prefs.motion=!prefs.motion;setMotion();setupScroll();save();});
reduced.addEventListener('change',e=>{if(e.matches){prefs.motion=false;setMotion();setupScroll();save();}});
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
renderProduct();renderCustomers();renderFinance();renderRisk();renderShares();renderTime();
renderRevenue();renderComparison();renderEconomy();renderFlow();renderSound();
expenseScene=mountExpenseScene({root:$('#expense-experience'),gsap,ScrollTrigger,motion:prefs.motion});
setMotion();activate(0);setupScroll();
document.fonts?.ready.then(refresh);window.addEventListener('load',()=>{refresh();if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target?.matches('.story-section'))target.scrollIntoView({behavior:'instant',block:'start'});}});
window.addEventListener('pagehide',()=>{audioContext?.suspend();});
