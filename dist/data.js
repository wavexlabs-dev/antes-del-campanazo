export const DATA_DATE = '26 de octubre de 2026';
export const ANNUAL_REVENUE = {2023:41,2024:386,2025:4585};
export const HALF_YEAR = {2025:1163,2026:16286};
export const COMPANIES = [
 {id:'anthropic',name:'Anthropic',founded:2021,model:'Modelos y productos de IA',values:[41,386,4585]},
 {id:'amazon',name:'Amazon',founded:1994,model:'Comercio por internet',values:[15.746,147.787,609.819]},
 {id:'google',name:'Google',founded:1998,model:'Búsqueda y publicidad',values:[19.108,86.426,439.508]},
];
export const CHAPTERS = [
 {
  "id": "origen",
  "name": "Una pregunta",
  "year": "2021",
  "caption": "Una habitación. Todo por construir.",
  "world": 0
 },
 {
  "id": "claude",
  "name": "Alguien al otro lado",
  "year": "2023",
  "caption": "La investigación encuentra a sus primeros usuarios.",
  "world": 1
 },
 {
  "id": "logros",
  "name": "De responder a hacer",
  "year": "2025–2026",
  "caption": "Un taller de herramientas. Más formas de ayudar.",
  "world": 9
 },
 {
  "id": "clientes",
  "name": "Las puertas se abren",
  "year": "2026",
  "caption": "De una persona a procesos dentro de miles de organizaciones.",
  "world": 10
 },
 {
  "id": "crecimiento",
  "name": "La habitación crece",
  "year": "2023–2026",
  "caption": "Un mismo personaje. Un mundo cada vez más grande.",
  "world": 2
 },
 {
  "id": "misma-etapa",
  "name": "A la misma etapa",
  "year": "AÑOS 3 · 4 · 5",
  "caption": "Tres historias, alineadas por su año de constitución.",
  "world": 3
 },
 {
  "id": "valuacion",
  "name": "Vender y valer",
  "year": "DOS MEDIDAS",
  "caption": "El valor que se atribuye a una empresa también cuenta otra historia.",
  "world": 4
 },
 {
  "id": "infraestructura",
  "name": "Detrás de la respuesta",
  "year": "2026",
  "caption": "Sigue el cable. La nube también es física.",
  "world": 5
 },
 {
  "id": "cuentas",
  "name": "Sostener su propio peso",
  "year": "2026",
  "caption": "Ventas, resultados y caja cuentan cosas distintas.",
  "world": 11
 },
 {
  "id": "riesgos",
  "name": "Lo que puede frenarlo",
  "year": "LAS TENSIONES",
  "caption": "Cada camino tiene una condición para seguir creciendo.",
  "world": 12
 },
 {
  "id": "economia",
  "name": "Fuera de la habitación",
  "year": "LA ECONOMÍA",
  "caption": "El beneficio depende de cómo se use y de quién lo reciba.",
  "world": 6
 },
 {
  "id": "ipo",
  "name": "Abrir las cuentas",
  "year": "26 OCT 2026",
  "caption": "Nuevos accionistas. Derechos y decisiones que no son iguales.",
  "world": 7
 },
 {
  "id": "acciones",
  "name": "¿Cuánto vale una acción?",
  "year": "EL PRECIO",
  "caption": "El precio de una pieza no dice el tamaño del conjunto.",
  "world": 13
 },
 {
  "id": "campana",
  "name": "La campana que viene",
  "year": "UN CAPÍTULO FUTURO",
  "caption": "El siguiente capítulo todavía está por escribirse.",
  "world": 8
 }
];
export const SOURCES = [
 {title:'Anthropic · S-1 preliminar',url:'https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm',note:'Datos extraídos y contrastados visualmente con el PDF proporcionado, fechado el 26 de octubre de 2026. Constitución: p.17 (PDF28). Lanzamiento: p.61 (PDF72). Resultados: p.22 (PDF33). Uso del cómputo: F-21 (PDF367). Usos: p.139 (PDF150). Energía: p.34 (PDF45). Riesgos laborales: p.69 (PDF80).',chapters:["origen", "claude", "logros", "clientes", "crecimiento", "misma-etapa", "infraestructura", "cuentas", "riesgos", "economia", "ipo", "acciones", "campana"]},
 {title:'Amazon · Form 10-K/A, ejercicio 1999',url:'https://s2.q4cdn.com/299287126/files/doc_financials/annual/10KA_99.pdf',note:'Página PDF4, Item6: ventas de 1996, 1997 y 1998. Miles de USD convertidos a millones. Se usa la presentación posterior de 1998: 609.819 millones, de manera consistente.',chapters:["misma-etapa"]},
 {title:'Amazon · Investor Relations, preguntas frecuentes',url:'https://ir.aboutamazon.com/faqs/default.aspx',note:'Constitución en 1994. La apertura de la tienda en 1995 es un hito distinto.',chapters:["misma-etapa"]},
 {title:'Google · S-1/A final, 18 de agosto de 2004',url:'https://www.sec.gov/Archives/edgar/data/1288776/000119312504142742/ds1a.htm',note:'Amendment No.9. Constitución en septiembre de 1998. Ingresos 2000–2002: 19.108, 86.426 y 439.508 millones de USD. Se usa la presentación final bruta de ingresos, no la versión neta del primer prospecto.',chapters:["misma-etapa"]},
 {title:'Gráfica de valuaciones compartida por el usuario',url:'./assets/valuation-reference.png',note:'Imagen original conservada. Marca visible: SemiAnalysis. No se localizó una publicación original fiable; fecha y metodología no verificadas. No extrajimos puntos ni cifras exactas de la imagen. Mezclar valoraciones privadas y capitalización pública exige cautela.',chapters:["valuacion"]},
 {title:'Anthropic · anuncio de presentación del S-1',url:'https://www.anthropic.com/news/s1-sec',note:'26 de octubre de 2026. Confirma la oferta propuesta y que precio y cantidad de acciones aún no están definidos.',chapters:["ipo", "campana"]},
];
SOURCES.push(
 {title:'Anthropic · Oferta, derechos y litigios',url:SOURCES[0].url,note:'Precio y cantidad pendientes: portada y p.18. Votos y LTBT: portada, pp.19 y 109. Split 10:1: p.21. Usos de fondos: p.124. Dividendos: p.125. Dilución: pp.129–131. Fondo de beneficio público: p.12. Bartz y otros litigios: F-59–60 (PDF405–406). Competencia: pp.40–41. Estado según el documento, no una actualización posterior.',chapters:['ipo','acciones','riesgos']},
 {title:'Anthropic · Productos, adopción y clientes',url:SOURCES[0].url,note:'S-1: vistas previas de Code y Cowork, p.8 (PDF19); clientes y tramos anidados, p.134 (PDF145); retención neta de ingresos, pp.2–3 y 135; 250 versiones/funciones/aplicaciones y Fortune 500, p.142 (PDF153); uso interno y empleados, p.136. Métricas declaradas por la empresa.',chapters:['logros','clientes']},
 {title:'Anthropic · Resultados trimestrales, capital y compromisos',url:SOURCES[0].url,note:'Q2 2026: p.157 (PDF168), resultados trimestrales no auditados. H1: p.22 (PDF33). Capital, caja e inversiones: p.10 (PDF21) y p.161 (PDF172). Compromisos de pagos futuros: F-63 (PDF409). Los saldos, ventas, resultados y compromisos no se suman entre sí.',chapters:['cuentas','infraestructura','riesgos']},
 {title:'NBER · Generative AI at Work',url:'https://www.nber.org/papers/w31161',note:'Working Paper 31161 (2023, revisión noviembre). Estudio con 5,179 agentes de atención a clientes: 14% más casos resueltos por hora en promedio. Evidencia de un contexto específico de IA generativa, no de Claude ni del PIB.',chapters:['economia']},
 {title:'IEA · Key Questions on Energy and AI (2026)',url:'https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary',note:'Proyección central de electricidad de centros de datos: 485 TWh en 2025 a 950 TWh en 2030. Incluye todos los centros de datos, no sólo Anthropic; la cifra futura es una proyección. Adaptación resumida, licencia CC BY 4.0.',chapters:['economia','infraestructura']}
);
export const GLOSSARY = [
 ['TTM','Últimos doce meses. Es una ventana móvil; no siempre coincide con enero a diciembre.'],
 ['Retención neta de ingresos','Compara ingresos de una misma cohorte entre periodos. Puede superar 100% si los clientes que permanecen aumentan su gasto; no es un porcentaje de personas retenidas.'],
 ['Dilución','Reducción del porcentaje de propiedad al emitirse nuevas acciones, si no se participa proporcionalmente en la emisión.'],
 ['Capital captado','Dinero obtenido de inversionistas. No equivale a ventas, utilidad ni valor de la empresa.'],
 ['Ingresos','Lo que una empresa reconoce por las ventas de sus productos o servicios en un periodo. No es su ganancia.'],
 ['Valuación','Una estimación del valor de la empresa o de su capital. Puede surgir de una ronda privada; en bolsa, la capitalización depende del precio de las acciones.'],
 ['Run-rate','Una extrapolación de actividad reciente a un año. No equivale a los ingresos anuales ya obtenidos ni es una promesa.'],
 ['Acción','Una participación en la propiedad de una empresa. Sus derechos dependen de la clase de acción.'],
 ['IPO','Oferta pública inicial: la primera oferta de acciones de la empresa al público. Puede incluir acciones nuevas y acciones de propietarios existentes.'],
 ['S-1','Documento de registro que describe el negocio, resultados, riesgos y oferta antes de una salida a bolsa en Estados Unidos.'],
 ['Pérdida operativa','La diferencia negativa entre ingresos y gastos operativos. Es distinta de la pérdida neta y del efectivo que entra o sale.'],
];
export function comparison(age=5) {
 const safe=[3,4,5].includes(Number(age))?Number(age):5;
 return COMPANIES.map(c=>({...c,age:safe,year:c.founded+safe-1,revenue:c.values[safe-3]}));
}
export function formatMoney(value,decimals=0) {return new Intl.NumberFormat('es-MX',{maximumFractionDigits:decimals,minimumFractionDigits:decimals}).format(value);}
export function safePreferences(value) {
 const v=value&&typeof value==='object'?value:{};
 return {year:[2023,2024,2025].includes(v.year)?v.year:2025,age:[3,4,5].includes(v.age)?v.age:5,motion:typeof v.motion==='boolean'?v.motion:true,sound:v.sound===true};
}
