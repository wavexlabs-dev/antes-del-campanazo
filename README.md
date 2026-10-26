# Antes del campanazo

Relato interactivo por scroll sobre Anthropic, su crecimiento y su IPO propuesto. Datos con fecha de corte 26 de octubre de 2026. Sitio estático en `dist/`, sin servicios de terceros en tiempo de ejecución.

## Desarrollo

`npm run dev` abre el servidor en http://127.0.0.1:5173. `npm test` verifica periodos, correspondencia de años y separación de métricas; `npm run check` revisa sintaxis.

La animación usa GSAP 3.13.0 y ScrollTrigger incluidos en `dist/vendor/`. `stage.js` conserva el personaje entre nueve escenarios; el scroll activa los recorridos y las entradas de elementos. Respeta movimiento reducido, permite pausar, y detiene el render al ocultar la pestaña. Sonido opcional sólo tras interacción.

La comparación usa año de constitución como año 1, ingresos anuales nominales de años calendario 3–5 y fuentes primarias. No representa edades exactas, ajuste por inflación ni equivalencia económica. Datos y referencias: `dist/assets/data-sources.json`. La imagen aportada se conserva en `dist/assets/valuation-reference.png`; no se extrajeron puntos ni se verificó la publicación original. El campanazo es explícitamente una escena futura.

Las preferencias de movimiento, sonido, año y etapa se guardan únicamente en el navegador. No hay analítica, cuentas propias ni backend. La privacidad del alojamiento se gestiona en Sites.
