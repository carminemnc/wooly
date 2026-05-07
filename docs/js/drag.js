var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Drag = (function () {

  var dragged = null;
  var touchDragged = null;

  function getSections() {
    return Array.prototype.slice.call(
      document.getElementById('canvas').querySelectorAll('.section')
    );
  }

  function clearOver() {
    getSections().forEach(function (s) { s.classList.remove('drag-over'); });
  }

  function insertAdjacent(moved, target) {
    var sections = getSections();
    if (sections.indexOf(moved) < sections.indexOf(target)) {
      target.parentNode.insertBefore(moved, target.nextSibling);
    } else {
      target.parentNode.insertBefore(moved, target);
    }
  }

  function bindMouse(canvas) {
    canvas.addEventListener('dragstart', function (e) {
      var sec = e.target.closest('.section');
      if (!sec) return;
      dragged = sec;
      sec.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });

    canvas.addEventListener('dragend', function () {
      if (dragged) dragged.classList.remove('dragging');
      clearOver();
      dragged = null;
    });

    canvas.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      var sec = e.target.closest('.section');
      if (!sec || sec === dragged) return;
      clearOver();
      sec.classList.add('drag-over');
    });

    canvas.addEventListener('drop', function (e) {
      e.preventDefault();
      var target = e.target.closest('.section');
      if (!target || !dragged || target === dragged) return;
      insertAdjacent(dragged, target);
      clearOver();
    });
  }

  function bindTouch(canvas) {
    canvas.addEventListener('touchstart', function (e) {
      var handle = e.target.closest('.drag-handle');
      if (!handle) return;
      var sec = handle.closest('.section');
      if (!sec) return;
      touchDragged = sec;
      sec.classList.add('dragging');
    }, { passive: true });

    canvas.addEventListener('touchmove', function (e) {
      if (!touchDragged) return;
      e.preventDefault();
      var touch = e.touches[0];
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      var target = el ? el.closest('.section') : null;
      clearOver();
      if (target && target !== touchDragged) target.classList.add('drag-over');
    }, { passive: false });

    canvas.addEventListener('touchend', function () {
      if (!touchDragged) return;
      var over = document.getElementById('canvas').querySelector('.section.drag-over');
      if (over && over !== touchDragged) insertAdjacent(touchDragged, over);
      touchDragged.classList.remove('dragging');
      clearOver();
      touchDragged = null;
    });
  }

  function init() {
    var canvas = document.getElementById('canvas');
    bindMouse(canvas);
    bindTouch(canvas);
  }

  return { init: init };

})();

document.addEventListener('DOMContentLoaded', Wooly.Drag.init);
