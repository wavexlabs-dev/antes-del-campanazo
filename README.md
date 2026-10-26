# Antes del campanazo

Relato interactivo por scroll sobre Anthropic, su crecimiento y su IPO propuesto. Datos con fecha de corte 26 de octubre de 2026. Sitio estático en `dist/`, sin servicios de terceros en tiempo de ejecución. No es un sitio oficial de Anthropic.

[Abrir el sitio publicado](https://antes-del-campanazo.pabloparedes-mx.chatgpt.site/)

## La historia, en orden

Dieciocho secciones en cuatro actos, de 2021 a la campana. Una regla de tiempo en el encabezado marca dónde está cada capítulo en el calendario; 2026 ocupa más espacio porque ahí se concentra la historia.

1. **El laboratorio.** Origen (2021) · *Giro:* lo tenían y esperaron (2022) · Claude llega al público (2023).
2. **Crecer.** Ingresos 2023–2025 · Comparación a la misma edad · Claude Code (2025) · *Giro:* el acuerdo Bartz (sep 2025).
3. **2026.** *Giro:* catorce veces (ene–jun) · Sigamos un dólar · Un trimestre cambia de signo · Vender y valer (mayo) · *Giro:* Mythos a puerta cerrada (abr–jul) · Clientes (sep).
4. **Salir a bolsa.** El S-1 · ¿Cuánto vale una acción? · Riesgos · Economía · La campana.

Los giros son secciones cortas: una fecha, dos o tres frases, una fuente y una figura de detalle. Clientes y acciones usan composiciones amplias con el personaje integrado; infraestructura y valuación son recorridos a pantalla completa guiados por el scroll.

La comparación «a la misma edad» incluye Anthropic, Amazon, Google, Facebook y Salesforce, con barras a escala dentro de cada año. El S-1 de Facebook no reporta 2006, así que su año 3 queda sin dato en vez de estimarse. Salesforce cierra su año fiscal el 31 de enero; su AF2002 se alinea con 2001.

La valuación ya no usa la imagen compartida con marca de SemiAnalysis. «La carrera al primer billón» se dibuja en el estilo del sitio con fuentes verificables: años desde la fundación hasta el primer billón de capitalización bursátil de Meta, Tesla, Alphabet, Amazon, Nvidia, Apple y Microsoft, frente a la valuación privada de la Serie H de Anthropic (965 mil millones, mayo de 2026). El texto aclara que no son la misma medida.

## Ritmo y animación

- Una sola entrada por pantalla: los bloques que llegan juntos suben juntos, en orden de lectura, una vez.
- El escenario cambia de mundo en dos tiempos: el anterior se va y luego llega el nuevo. Nunca se dibujan dos mundos encimados.
- Los capítulos amplios toman el escenario antes, para que el dibujo fijo no se cruce con un título centrado.
- Cada capítulo tiene un solo enlace a sus fuentes; las notas secundarias viven en un único desplegable.

## Figuras de detalle (Hairline)

Los tres giros con objeto llevan una figura interactiva hecha con la skill `hairline-create` de [Hairline](https://hairline.lucasmarkes.com) (MIT, Lucas Marques): un cajón con una caja sellada (2022), un estante de libros (Bartz) y una vitrina con una mariposa (Mythos). Cada figura pasó `validate.mjs` y `look.mjs` de la skill antes de entrar al sitio.

- `dist/vendor/hairline-kernel.js`: el núcleo de Hairline, sin cambios, con su licencia en `hairline-LICENSE.txt`.
- `dist/hairline/*.js`: las figuras. `registry.js` las registra y `dist/figures.js` las monta como lo hace el banco de la skill, cuando se acercan a la pantalla.
- Los colores salen de la paleta del sitio por variables `--hairline-*` en `.figure-host`.

Para volver a revisar una figura, desde un clon de `lucasmarkes/hairline`: `node skills/hairline-create/look.mjs dist/hairline/cajon.js --answer 84,40,83`.

## Desarrollo

`npm run dev` abre el servidor en http://127.0.0.1:5173. `npm test` verifica periodos, correspondencia de años, el orden cronológico de los capítulos, que los trimestres sumen los semestres y que cada figura de la página tenga su archivo; `npm run check` revisa sintaxis.

La animación usa GSAP 3.13.0 y ScrollTrigger incluidos en `dist/vendor/`. `stage.js` conserva el personaje entre diecisiete escenarios; los mundos nuevos (la habitación de noche, la biblioteca y la vitrina) usan trazo fino para el detalle secundario y no tocan el dibujo del personaje. Respeta movimiento reducido, permite pausar y detiene el render al ocultar la pestaña. Sonido opcional sólo tras interacción.

Datos y referencias: `dist/assets/data-sources.json`. El campanazo es explícitamente una escena futura.

Las preferencias de movimiento, sonido, año y etapa se guardan únicamente en el navegador. No hay analítica, cuentas propias ni backend. La privacidad del alojamiento se gestiona en Sites.
