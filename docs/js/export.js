var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Export = (function () {

  function getThemeStyle() {
    return 'body{' + document.body.style.cssText + '}';
  }

  function pdf() {
    window.print();
  }

  function html() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'css/style.css', true);
    xhr.onload = function () {
      var css = xhr.responseText;
      (function (css) {
        var canvasEl = document.getElementById('canvas');
        var clone = canvasEl.cloneNode(true);
        Array.prototype.forEach.call(
          clone.querySelectorAll('.drag-handle, .delete-section, .dup-section, .layout-toggle, .add-step, .add-steps-block, .timeline-add-note, .add-abbr, .add-tip, .timeline-del'),
          function (el) { el.remove(); }
        );
        var markup = '<!DOCTYPE html><html><head>' +
          '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
          '<title>Schema a Maglia</title>' +
          '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">' +
          '<style>' + css + '</style>' +
          '<style>' + getThemeStyle() + '</style>' +
          '</head><body style="padding:0">' +
          '<div class="canvas" style="margin:0 auto;border:none">' +
          clone.innerHTML +
          '</div></body></html>';
        var blob = new Blob([markup], { type: 'text/html' });
        var a = document.createElement('a');
        a.download = 'schema-maglia.html';
        a.href = URL.createObjectURL(blob);
        a.click();
        URL.revokeObjectURL(a.href);
      }(css));
    };
    xhr.send();
  }

  return { pdf: pdf, html: html };

})();
