var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Sections = (function () {

  function init(sec) {
    if (sec.querySelector('.drag-handle')) return;

    sec.setAttribute('draggable', 'true');

    var handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '&#x2630;';
    handle.setAttribute('aria-label', 'Trascina per riordinare');
    sec.insertBefore(handle, sec.firstChild);

    var layout = document.createElement('button');
    layout.className = 'layout-toggle';
    layout.innerHTML = '&#x2194;';
    layout.setAttribute('aria-label', 'Alterna larghezza');
    layout.addEventListener('click', function () {
      sec.classList.toggle('col-half');
      layout.classList.toggle('active', sec.classList.contains('col-half'));
    });
    sec.insertBefore(layout, handle.nextSibling);
    layout.classList.toggle('active', sec.classList.contains('col-half'));

    var dup = document.createElement('button');
    dup.className = 'dup-section';
    dup.innerHTML = '&#x29C9;';
    dup.setAttribute('aria-label', 'Duplica sezione');
    dup.addEventListener('click', function () {
      var clone = sec.cloneNode(true);
      clone.removeAttribute('id');
      Array.prototype.forEach.call(
        clone.querySelectorAll('.drag-handle, .delete-section, .dup-section, .layout-toggle'),
        function (el) { el.remove(); }
      );
      sec.parentNode.insertBefore(clone, sec.nextSibling);
      init(clone);
      if (typeof Wooly.Translate !== 'undefined') Wooly.Translate.apply(Wooly.Translate.lang);
      Wooly.rebuildToggleBar();
    });
    sec.insertBefore(dup, layout.nextSibling);

    var del = document.createElement('button');
    del.className = 'delete-section';
    del.innerHTML = '&times;';
    del.setAttribute('aria-label', 'Elimina sezione');
    del.addEventListener('click', function () {
      Wooly.confirmDelete(function () {
        sec.remove();
        Wooly.rebuildToggleBar();
      });
    });
    sec.insertBefore(del, dup.nextSibling);
  }

  function initAll() {
    var canvas = document.getElementById('canvas');
    Array.prototype.forEach.call(canvas.querySelectorAll('.section'), init);
    Wooly.rebuildToggleBar();
  }

  return { init: init, initAll: initAll };

})();

document.addEventListener('DOMContentLoaded', Wooly.Sections.initAll);
