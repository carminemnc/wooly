var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Autosave = (function () {

  var KEY = 'wooly-canvas';
  var timer = null;
  var DELAY = 2000;

  function save() {
    var canvas = document.getElementById('canvas');
    localStorage.setItem(KEY, canvas.innerHTML);
  }

  function scheduleSave() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, DELAY);
  }

  function restore() {
    var html = localStorage.getItem(KEY);
    if (!html) return false;
    var canvas = document.getElementById('canvas');
    canvas.innerHTML = html;
    Array.prototype.forEach.call(canvas.querySelectorAll('.md-rendered'), function (el) { el.remove(); });
    Array.prototype.forEach.call(canvas.querySelectorAll('[style*="display"]'), function (el) {
      if (el.style.display === 'none' && el.id !== 'img-placeholder') el.style.display = '';
    });
    Array.prototype.forEach.call(canvas.querySelectorAll('.section'), function (sec) {
      Array.prototype.forEach.call(
        sec.querySelectorAll('.drag-handle, .delete-section, .dup-section, .layout-toggle'),
        function (el) { el.remove(); }
      );
      Wooly.Sections.init(sec);
    });
    Wooly.rebuildToggleBar();
    if (typeof Wooly.Translate !== 'undefined') Wooly.Translate.apply(Wooly.Translate.lang);
    return true;
  }

  function clear() {
    localStorage.removeItem(KEY);
    location.reload();
  }

  function init() {
    restore();
    document.getElementById('canvas').addEventListener('input', scheduleSave);
  }

  return { init: init, save: save, clear: clear };

})();

document.addEventListener('DOMContentLoaded', Wooly.Autosave.init);
