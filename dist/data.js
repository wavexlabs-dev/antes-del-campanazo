export const DATA_DATE = '26 de octubre de 2026';
export const ANNUAL_REVENUE = {2023:41,2024:386,2025:4585};
export const HALF_YEAR = {2025:1163,2026:16286};
// S-1, p.157 (PDF168): tabla trimestral no auditada. Millones de USD.
export const QUARTERLY_REVENUE = [
 {period:'ene–mar',year:2025,value:376},{period:'abr–jun',year:2025,value:787},
 {period:'jul–sep',year:2025,value:1382},{period:'oct–dic',year:2025,value:2040},
 {period:'ene–mar',year:2026,value:4731},{period:'abr–jun',year:2026,value:11555}
];
// Ingresos anuales de los años calendario 3, 4 y 5 desde la constitución. null = sin dato en la fuente primaria.
export const COMPANIES = [
 {id:'anthropic',name:'Anthropic',founded:2021,model:'Modelos y productos de IA',values:[41,386,4585]},
 {id:'amazon',name:'Amazon',founded:1994,model:'Comercio por internet',values:[15.746,147.787,609.819]},
 {id:'google',name:'Google',founded:1998,model:'Búsqueda y publicidad',values:[19.108,86.426,439.508]},
 {id:'facebook',name:'Facebook',founded:2004,model:'Red social y publicidad',values:[null,153,272],missing:'Su S-1 no reporta 2006'},
 {id:'salesforce',name:'Salesforce',founded:1999,model:'Software en la nube',values:[22.409,50.991,96.023],periods:['AF2002 · feb 2001–ene 2002','AF2003 · feb 2002–ene 2003','AF2004 · feb 2003–ene 2004']},
];
// Primer billón de dólares (10^12) de capitalización bursátil, frente a la valuación privada de Anthropic.
export const RACE = {
 anthropic:{name:'Anthropic',founded:'2021-01-01',date:'2026-05-28',value:965},
 companies:[
  {id:'meta',name:'Meta',founded:'2004-02-04',reached:'2021-06-28'},
  {id:'tesla',name:'Tesla',founded:'2003-07-01',reached:'2021-10-25'},
  {id:'alphabet',name:'Alphabet',founded:'1998-09-04',reached:'2020-01-16'},
  {id:'amazon',name:'Amazon',founded:'1994-07-05',reached:'2018-09-04'},
  {id:'nvidia',name:'Nvidia',founded:'1993-04-05',reached:'2023-05-30'},
  {id:'apple',name:'Apple',founded:'1976-04-01',reached:'2018-08-02'},
  {id:'microsoft',name:'Microsoft',founded:'1975-04-04',reached:'2019-04-25'}
 ]
};
export function yearsBetween(from,to){return (Date.parse(to)-Date.parse(from))/(365.25*864e5);}
export function raceRows(){
 return RACE.companies.map(c=>({...c,years:yearsBetween(c.founded,c.reached)})).sort((a,b)=>a.years-b.years);
}
// La regla de tiempo del encabezado: 2021–2025 a 13 puntos por año, 2026 más ancho (65–92) y después, el futuro.
export const RULER = {years:[[2021,0],[2022,13],[2023,26],[2024,39],[2025,52],[2026,65]],end:92};
export function rulerAt(year,month=0){
 if(year>=2026)return Math.min(RULER.end,65+(year-2026)*27+month*2.25);
 return Math.max(0,(year-2021)*13+month*13/12);
}
export const CHAPTERS = [
 {id:'origen',kind:'chapter',act:1,name:'Una pregunta',year:'2021',world:0,when:rulerAt(2021,0.5)},
 {id:'giro-2022',kind:'giro',act:1,name:'Lo tenían y esperaron',year:'2022',world:14,when:rulerAt(2022,10.9),span:[rulerAt(2022,6),rulerAt(2022,10.9)]},
 {id:'claude',kind:'chapter',act:1,name:'Alguien al otro lado',year:'2023',world:1,when:rulerAt(2023,2.5)},
 {id:'crecimiento',kind:'chapter',act:2,name:'La habitación crece',year:'2023–2025',world:2,when:rulerAt(2024,6),span:[rulerAt(2023,0),rulerAt(2026,0)],note:'Ilustración simbólica · no está a escala'},
 {id:'misma-etapa',kind:'chapter',act:2,name:'A la misma edad',year:'AÑOS 3 · 4 · 5',world:3,when:rulerAt(2024,6),span:[rulerAt(2023,0),rulerAt(2026,0)],note:'Ilustración simbólica · las cifras están en el texto'},
 {id:'logros',kind:'chapter',act:2,name:'De responder a hacer',year:'2025',world:9,when:rulerAt(2025,1.5)},
 {id:'giro-libros',kind:'giro',act:2,name:'Una cuenta por los libros',year:'2025',world:15,when:rulerAt(2025,8.5)},
 {id:'giro-escala',kind:'giro',act:3,name:'Catorce veces',year:'ENE–JUN 2026',world:2,stage:{year:2026},when:rulerAt(2026,3),span:[rulerAt(2026,0),rulerAt(2026,6)],note:'Ilustración simbólica · no está a escala'},
 {id:'infraestructura',kind:'chapter',act:3,name:'Detrás de la respuesta',year:'ENE–JUN 2026',world:5,layout:'full',when:rulerAt(2026,3),span:[rulerAt(2026,0),rulerAt(2026,6)]},
 {id:'cuentas',kind:'chapter',act:3,name:'Un trimestre cambia de signo',year:'ABR–JUN 2026',world:11,when:rulerAt(2026,4.5),span:[rulerAt(2026,3),rulerAt(2026,6)]},
 {id:'valuacion',kind:'chapter',act:3,name:'Vender y valer',year:'MAYO 2026',world:4,layout:'full',when:rulerAt(2026,4.9)},
 {id:'giro-mythos',kind:'giro',act:3,name:'A puerta cerrada',year:'ABR–JUL 2026',world:16,when:rulerAt(2026,5.3),span:[rulerAt(2026,3.2),rulerAt(2026,6)]},
 {id:'clientes',kind:'chapter',act:3,name:'Las puertas se abren',year:'SEP 2026',world:10,layout:'wide',when:rulerAt(2026,9),note:'Ilustración simbólica · no está a escala'},
 {id:'ipo',kind:'chapter',act:4,name:'Abrir las cuentas',year:'26 OCT 2026',world:7,when:rulerAt(2026,9.83)},
 {id:'acciones',kind:'chapter',act:4,name:'¿Cuánto vale una acción?',year:'EL PRECIO',world:13,layout:'wide',when:rulerAt(2026,9.83)},
 {id:'riesgos',kind:'chapter',act:4,name:'Lo que puede frenarlo',year:'LO QUE ADVIERTE',world:12,when:rulerAt(2026,9.83)},
 {id:'economia',kind:'chapter',act:4,name:'Fuera de la habitación',year:'LA ECONOMÍA',world:6,when:rulerAt(2026,9.83)},
 {id:'campana',kind:'chapter',act:4,name:'La campana que viene',year:'DESPUÉS',world:8,when:97,note:'Escena futura · campanazo simbólico'}
];
export const ACTS = {1:'El laboratorio',2:'Crecer',3:'2026',4:'Salir a bolsa'};
const S1 = 'https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm';
export const SOURCES = [
 {title:'Anthropic · S-1 preliminar',url:S1,note:'Fechado el 26 de octubre de 2026. Constitución: p.17 (PDF28). Lanzamiento: p.61 (PDF72). Resultados: p.22 (PDF33). Uso del cómputo: F-21 (PDF367). Usos: p.139 (PDF150). Energía: p.34 (PDF45). Riesgos laborales: p.69 (PDF80).',chapters:['origen','claude','logros','clientes','crecimiento','misma-etapa','infraestructura','cuentas','riesgos','economia','ipo','acciones','campana']},
 {title:'TIME · Inside Anthropic (30 de mayo de 2024)',url:'https://time.com/6980000/anthropic/',note:'Billy Perrigo. En el verano de 2022 Anthropic terminó de entrenar un chatbot y decidió no lanzarlo para seguir con pruebas internas de seguridad; unos tres meses después, OpenAI lanzó ChatGPT.',chapters:['giro-2022']},
 {title:'OpenAI · Introducing ChatGPT (30 de noviembre de 2022)',url:'https://openai.com/index/chatgpt/',note:'Fecha de lanzamiento público de ChatGPT.',chapters:['giro-2022']},
 {title:'Anthropic · Serie B (29 de abril de 2022)',url:'https://www.anthropic.com/news/anthropic-raises-series-b-to-build-safe-reliable-ai',note:'Ronda de 580 millones de dólares, encabezada por Sam Bankman-Fried, entonces director de FTX. FTX se declaró en quiebra en noviembre de 2022.',chapters:['giro-2022']},
 {title:'Anthropic · Bartz y otros litigios',url:S1,note:'Factores de riesgo: en septiembre de 2025 Anthropic acordó pagar 1,500 millones para resolver la demanda colectiva Bartz; el tribunal la aprobó en julio de 2026. La tabla trimestral (p.157, PDF168) registra el gasto en julio–septiembre de 2025. Pasivo pendiente: F-59–60 (PDF405–406).',chapters:['giro-libros','riesgos']},
 {title:'Anthropic · Resultados trimestrales',url:S1,note:'Tabla trimestral no auditada, p.157 (PDF168): ingresos de 376, 787, 1,382, 2,040, 4,731 y 11,555 millones de dólares, de enero–marzo de 2025 a abril–junio de 2026. Semestres: p.22 (PDF33).',chapters:['giro-escala','cuentas']},
 {title:'Anthropic · Project Glasswing (7 de abril de 2026)',url:'https://www.anthropic.com/glasswing',note:'Mythos Preview como vista previa restringida para organizaciones seleccionadas, con fines de ciberseguridad. El S-1 lo describe como una limitación de acceso por sus capacidades para descubrir vulnerabilidades.',chapters:['giro-mythos']},
 {title:'Anthropic · Declaración sobre Fable 5 y Mythos 5 (12 de junio de 2026)',url:'https://www.anthropic.com/news/fable-mythos-access',note:'Anthropic desactivó ambos modelos para todos sus clientes tras una directiva del gobierno de Estados Unidos; el resto de sus modelos siguió disponible. Según el S-1, volvieron a desplegarse con salvaguardas actualizadas cuando el Departamento de Comercio levantó las restricciones.',chapters:['giro-mythos','riesgos']},
 {title:'Amazon · Form 10-K/A, ejercicio 1999',url:'https://s2.q4cdn.com/299287126/files/doc_financials/annual/10KA_99.pdf',note:'Página PDF4, Item 6: ventas de 1996, 1997 y 1998. Miles de USD convertidos a millones. Se usa la presentación posterior de 1998: 609.819 millones, de manera consistente.',chapters:['misma-etapa']},
 {title:'Amazon · Investor Relations, preguntas frecuentes',url:'https://ir.aboutamazon.com/faqs/default.aspx',note:'Constitución en 1994. La apertura de la tienda en 1995 es un hito distinto.',chapters:['misma-etapa']},
 {title:'Google · S-1/A final, 18 de agosto de 2004',url:'https://www.sec.gov/Archives/edgar/data/1288776/000119312504142742/ds1a.htm',note:'Amendment No.9. Constitución en septiembre de 1998. Ingresos 2000–2002: 19.108, 86.426 y 439.508 millones de USD. Se usa la presentación final bruta de ingresos.',chapters:['misma-etapa']},
 {title:'Facebook · S-1, 1 de febrero de 2012',url:'https://www.sec.gov/Archives/edgar/data/1326801/000119312512034517/d287954ds1.htm',note:'Constitución en Delaware en julio de 2004. Datos seleccionados: ingresos de 153 millones en 2007 y 272 millones en 2008. El prospecto no incluye 2006, por eso su año 3 queda sin dato.',chapters:['misma-etapa']},
 {title:'Salesforce · Form 10-K, año fiscal 2005',url:'https://www.sec.gov/Archives/edgar/data/1108524/000119312505061027/d10k.htm',note:'Constitución en Delaware en febrero de 1999. Ingresos totales: 22.409 (AF2002), 50.991 (AF2003) y 96.023 (AF2004) millones de USD. Su año fiscal termina el 31 de enero; AF2002 (feb 2001–ene 2002) se alinea con el año calendario 2001.',chapters:['misma-etapa']},
 {title:'Anthropic · Serie H (28 de mayo de 2026)',url:'https://www.anthropic.com/news/series-h',note:'Ronda de 65 mil millones de dólares con una valuación post-money de 965 mil millones. Es el precio de una ronda privada, no una capitalización de bolsa.',chapters:['valuacion']},
 {title:'Wikipedia · Empresas públicas por capitalización',url:'https://en.wikipedia.org/wiki/List_of_public_corporations_by_market_capitalization',note:'Fechas en que cada empresa alcanzó por primera vez un billón de dólares de capitalización: Apple (2 ago 2018), Amazon (4 sep 2018), Microsoft (25 abr 2019), Alphabet (16 ene 2020), Meta (28 jun 2021), Tesla (25 oct 2021) y Nvidia (30 may 2023). Años contados desde la fundación de cada empresa; dólares nominales.',chapters:['valuacion']},
 {title:'Anthropic · anuncio de presentación del S-1',url:'https://www.anthropic.com/news/s1-sec',note:'26 de octubre de 2026. Confirma la oferta propuesta y que precio y cantidad de acciones aún no están definidos.',chapters:['ipo','campana']},
 {title:'Anthropic · Oferta, derechos y litigios',url:S1,note:'Precio y cantidad pendientes: portada y p.18. Votos y LTBT: portada, pp.19 y 109. Split 10:1: p.21. Usos de fondos: p.124. Dividendos: p.125. Dilución: pp.129–131. Fondo de beneficio público: p.12. Competencia: pp.40–41. Estado según el documento, no una actualización posterior.',chapters:['ipo','acciones','riesgos']},
 {title:'Anthropic · Productos, adopción y clientes',url:S1,note:'Vistas previas de Code y Cowork, p.8 (PDF19); clientes y tramos anidados, p.134 (PDF145); retención neta de ingresos, pp.2–3 y 135; 250 versiones/funciones/aplicaciones y Fortune 500, p.142 (PDF153); uso interno y empleados, p.136. Métricas declaradas por la empresa.',chapters:['logros','clientes']},
 {title:'Anthropic · Capital, caja y compromisos',url:S1,note:'Q2 2026: p.157 (PDF168). H1: p.22 (PDF33). Capital, caja e inversiones: p.10 (PDF21) y p.161 (PDF172). Compromisos de pagos futuros: F-63 (PDF409). Saldos, ventas, resultados y compromisos no se suman entre sí.',chapters:['cuentas','infraestructura','riesgos']},
 {title:'NBER · Generative AI at Work',url:'https://www.nber.org/papers/w31161',note:'Working Paper 31161 (2023, revisión noviembre). Estudio con 5,179 agentes de atención a clientes: 14% más casos resueltos por hora en promedio. Evidencia de un contexto específico, no de Claude ni del PIB.',chapters:['economia']},
 {title:'IEA · Key Questions on Energy and AI (2026)',url:'https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary',note:'Proyección central de electricidad de centros de datos: 485 TWh en 2025 a 950 TWh en 2030. Incluye todos los centros de datos, no sólo Anthropic. Adaptación resumida, licencia CC BY 4.0.',chapters:['economia','infraestructura']}
];
export const GLOSSARY = [
 ['TTM','Últimos doce meses. Es una ventana móvil; no siempre coincide con enero a diciembre.'],
 ['Retención neta de ingresos','Compara ingresos de una misma cohorte entre periodos. Puede superar 100% si los clientes que permanecen aumentan su gasto; no es un porcentaje de personas retenidas.'],
 ['Dilución','Reducción del porcentaje de propiedad al emitirse nuevas acciones, si no se participa proporcionalmente en la emisión.'],
 ['Capital captado','Dinero obtenido de inversionistas. No equivale a ventas, utilidad ni valor de la empresa.'],
 ['Ingresos','Lo que una empresa reconoce por las ventas de sus productos o servicios en un periodo. No es su ganancia.'],
 ['Valuación','Una estimación del valor de la empresa o de su capital. Puede surgir de una ronda privada; en bolsa, la capitalización depende del precio de las acciones.'],
 ['Valuación post-money','El valor que una ronda privada le asigna a la empresa ya contando el dinero nuevo. Lo acuerdan unos pocos inversionistas; no lo fija el mercado.'],
 ['Capitalización bursátil','Precio de la acción en bolsa multiplicado por el número de acciones. Cambia todos los días.'],
 ['Año fiscal','El periodo de doce meses que una empresa usa para su contabilidad. No siempre termina en diciembre.'],
 ['Run-rate','Una extrapolación de actividad reciente a un año. No equivale a los ingresos anuales ya obtenidos ni es una promesa.'],
 ['Acción','Una participación en la propiedad de una empresa. Sus derechos dependen de la clase de acción.'],
 ['IPO','Oferta pública inicial: la primera oferta de acciones de la empresa al público. Puede incluir acciones nuevas y acciones de propietarios existentes.'],
 ['S-1','Documento de registro que describe el negocio, resultados, riesgos y oferta antes de una salida a bolsa en Estados Unidos.'],
 ['Pérdida operativa','La diferencia negativa entre ingresos y gastos operativos. Es distinta de la pérdida neta y del efectivo que entra o sale.'],
];
export function comparison(age=5) {
 const safe=[3,4,5].includes(Number(age))?Number(age):5;
 return COMPANIES.map(c=>({...c,age:safe,year:c.founded+safe-1,revenue:c.values[safe-3],period:c.periods?.[safe-3]??String(c.founded+safe-1)}));
}
/** Anthropic frente a la empresa con más ingresos de las demás en esa misma edad. */
export function comparisonLeader(age=5){
 const rows=comparison(age),[a,...others]=rows,known=others.filter(r=>Number.isFinite(r.revenue));
 const top=known.reduce((m,r)=>r.revenue>m.revenue?r:m,known[0]);
 return {anthropic:a,top,ratio:a.revenue/top.revenue};
}
export function formatMoney(value,decimals=0) {return new Intl.NumberFormat('es-MX',{maximumFractionDigits:decimals,minimumFractionDigits:decimals}).format(value);}
export function safePreferences(value) {
 const v=value&&typeof value==='object'?value:{};
 return {year:[2023,2024,2025].includes(v.year)?v.year:2025,age:[3,4,5].includes(v.age)?v.age:5,motion:typeof v.motion==='boolean'?v.motion:true,sound:v.sound===true};
}
