// components/drag.js — Pointer-based drag & drop for sections.
// Native HTML5 drag is unreliable on desktop Chrome when a draggable element
// sits alongside contenteditable fields (the browser prefers dragging the text
// selection). Pointer events avoid that entirely — one code path for mouse,
// touch and pen.

let onReorder = null;

export function initDrag(canvas, reorderCallback) {
  onReorder = reorderCallback;
  bindPointer(canvas);
}

function getSections(canvas) {
  return Array.from(canvas.querySelectorAll('.section'));
}

function clearOver(canvas) {
  getSections(canvas).forEach(s => s.classList.remove('drag-over'));
}

function bindPointer(canvas) {
  let dragging = null;   // the .section being dragged
  let startY = 0;
  let started = false;   // movement threshold passed
  const THRESHOLD = 5;

  // Safari/WebKit keeps selecting text on pointermove even with preventDefault;
  // blocking selectstart while dragging is the only reliable stop.
  function blockSelectStart(e) { e.preventDefault(); }

  function endDrag() {
    document.body.classList.remove('section-dragging');
    document.removeEventListener('selectstart', blockSelectStart);
  }

  function onPointerDown(e) {
    if (e.button != null && e.button !== 0) return;
    const handle = e.target.closest('.section-drag-handle');
    if (!handle) return;
    const sec = handle.closest('.section');
    if (!sec) return;

    dragging = sec;
    startY = e.clientY;
    started = false;
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    if (!started) {
      if (Math.abs(e.clientY - startY) < THRESHOLD) return;
      started = true;
      dragging.classList.add('dragging');
      document.body.classList.add('section-dragging');
      document.addEventListener('selectstart', blockSelectStart);
      const sel = window.getSelection();
      if (sel && sel.rangeCount) sel.removeAllRanges();
    }
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const over = el ? el.closest('.section') : null;
    clearOver(canvas);
    if (over && over !== dragging && canvas.contains(over)) {
      over.classList.add('drag-over');
    }
  }

  function onPointerUp(e) {
    const handle = e.currentTarget;
    handle.releasePointerCapture(e.pointerId);
    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', onPointerUp);
    handle.removeEventListener('pointercancel', onPointerUp);

    if (started) {
      const target = canvas.querySelector('.section.drag-over');
      if (target && target !== dragging) {
        const sections = getSections(canvas);
        const fromIdx = sections.indexOf(dragging);
        const toIdx = sections.indexOf(target);
        // Reorder DOM
        if (fromIdx < toIdx) {
          target.parentNode.insertBefore(dragging, target.nextSibling);
        } else {
          target.parentNode.insertBefore(dragging, target);
        }
        const newOrder = getSections(canvas).map(s => s.dataset.sectionId);
        if (onReorder) onReorder(newOrder);
      }
      if (dragging) dragging.classList.remove('dragging');
    }
    endDrag();
    clearOver(canvas);
    dragging = null;
    started = false;
  }

  canvas.addEventListener('pointerdown', onPointerDown);
}
