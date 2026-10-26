/* Collects Hairline figures by name. Each figure file ends with hairline({ name, means, range, mount, ... }). */
window.__hairlineFigures = window.__hairlineFigures || {};
window.hairline = function (figure) { window.__hairlineFigures[figure.name] = figure; };
