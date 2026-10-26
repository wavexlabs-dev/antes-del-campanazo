export const DATA_DATE = '26 de octubre de 2026';
export const ANNUAL_REVENUE = {2023:41,2024:386,2025:4585};
export const HALF_YEAR = {2025:1163,2026:16286};
export const COMPANIES = [
 {id:'anthropic',name:'Anthropic',founded:2021,model:'Modelos y productos de IA',values:[41,386,4585]},
 {id:'amazon',name:'Amazon',founded:1994,model:'Comercio por internet',values:[15.746,147.787,609.819]},
 {id:'google',name:'Google',founded:1998,model:'Búsqueda y publicidad',values:[19.108,86.426,439.508]},
];
export const CHAPTERS = [
 {id:'origen',name:'Una pregunta',year:'2021',caption:'Una habitación. Todo por construir.'},
 {id:'claude',name:'Alguien al otro lado',year:'2023',caption:'La investigación encuentra a sus primeros usuarios.'},
 {id:'crecimiento',name:'La habitación crece',year:'2023–2026',caption:'Un mismo personaje. Un mundo cada vez más grande.'},
 {id:'misma-etapa',name:'A la misma etapa',year:'AÑOS 3 · 4 · 5',caption:'Tres historias, alineadas por su año de constitución.'},
 {id:'valuacion',name:'Vender y valer',year:'OTRA FORMA DE MIRAR',caption:'El valor que se atribuye a una empresa también cuenta otra historia.'},
 {id:'infraestructura',name:'Detrás de la respuesta',year:'2026',caption:'Sigue el cable. La nube también es física.'},
 {id:'economia',name:'Fuera de la habitación',year:'LA ECONOMÍA ALREDEDOR',caption:'Herramientas, personas, proveedores. Una red de efectos distintos.'},
 {id:'ipo',name:'Abrir las cuentas',year:'26 OCT 2026',caption:'Un documento. Nuevos accionistas. Nuevas preguntas.'},
 {id:'campana',name:'La campana que viene',year:'UN CAPÍTULO FUTURO',caption:'El siguiente capítulo todavía está por escribirse.'},
];
export const SOURCES = [
 {title:'Anthropic · S-1 preliminar',url:'https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm',note:'Datos extraídos y contrastados visualmente con el PDF proporcionado, fechado el 26 de octubre de 2026. Constitución: p.17 (PDF28). Lanzamiento: p.61 (PDF72). Resultados: p.22 (PDF33). Uso del cómputo: F-21 (PDF367). Usos: p.139 (PDF150). Energía: p.34 (PDF45). Riesgos laborales: p.69 (PDF80).',chapters:[0,1,2,3,5,6,7,8]},
 {title:'Amazon · Form 10-K/A, ejercicio 1999',url:'https://s2.q4cdn.com/299287126/files/doc_financials/annual/10KA_99.pdf',note:'Página PDF4, Item6: ventas de 1996, 1997 y 1998. Miles de USD convertidos a millones. Se usa la presentación posterior de 1998: 609.819 millones, de manera consistente.',chapters:[3]},
 {title:'Amazon · Investor Relations, preguntas frecuentes',url:'https://ir.aboutamazon.com/faqs/default.aspx',note:'Constitución en 1994. La apertura de la tienda en 1995 es un hito distinto.',chapters:[3]},
 {title:'Google · S-1/A final, 18 de agosto de 2004',url:'https://www.sec.gov/Archives/edgar/data/1288776/000119312504142742/ds1a.htm',note:'Amendment No.9. Constitución en septiembre de 1998. Ingresos 2000–2002: 19.108, 86.426 y 439.508 millones de USD. Se usa la presentación final bruta de ingresos, no la versión neta del primer prospecto.',chapters:[3]},
 {title:'Gráfica de valuaciones compartida por el usuario',url:'./assets/valuation-reference.png',note:'Imagen original conservada. Marca visible: SemiAnalysis. No se localizó una publicación original fiable; fecha y metodología no verificadas. No extrajimos puntos ni cifras exactas de la imagen. Mezclar valoraciones privadas y capitalización pública exige cautela.',chapters:[4]},
 {title:'Anthropic · anuncio de presentación del S-1',url:'https://www.anthropic.com/news/s1-sec',note:'26 de octubre de 2026. Confirma la oferta propuesta y que precio y cantidad de acciones aún no están definidos.',chapters:[7,8]},
];
export const GLOSSARY = [
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
