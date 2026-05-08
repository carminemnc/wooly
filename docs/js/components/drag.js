// components/drag.js — Drag & drop for sections (mouse + touch)

let dragged = null;
let touchDragged = null;
let onReorder = null;

export function initDrag(canvas, reorderCallback) {
  onReorder = reorderCallback;
  bindMouse(canvas);
  bindTouch(canvas);
}

function getSections(canvas) {
  return Array.from(canvas.querySelectorAll('.section'));
}

function clearOver(canvas) {
  getSections(canvas).forEach(s => s.classList.remove('drag-over'));
}

function isEditing() {
  const el = document.activeElement;
  return el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}

function getInsertIndex(canvas, moved, target) {
  const sections = getSections(canvas);
  const fromIdx = sections.indexOf(moved);
  const toIdx = sections.indexOf(target);
  if (fromIdx < toIdx) {
    target.parentNode.insertBefore(moved, target.nextSibling);
  } else {
    target.parentNode.insertBefore(moved, target);
  }
  // Return new order of section IDs
  return getSections(canvas).map(s => s.dataset.sectionId);
}

function bindMouse(canvas) {
  canvas.addEventListener('dragstart', (e) => {
    if (isEditing()) { e.preventDefault(); return; }
    const sec = e.target.closest('.section');
    if (!sec) return;
    // Only allow drag from handle
    if (!e.target.closest('.section-drag-handle')) { e.preventDefault(); return; }
    dragged = sec;
    sec.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  canvas.addEventListener('dragend', () => {
    if (dragged) dragged.classList.remove('dragging');
    clearOver(canvas);
    dragged = null;
  });

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const sec = e.target.closest('.section');
    if (!sec || sec === dragged) return;
    clearOver(canvas);
    sec.classList.add('drag-over');
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.section');
    if (!target || !dragged || target === dragged) return;
    const newOrder = getInsertIndex(canvas, dragged, target);
    clearOver(canvas);
    if (onReorder) onReorder(newOrder);
  });
}

function bindTouch(canvas) {
  canvas.addEventListener('touchstart', (e) => {
    const handle = e.target.closest('.section-drag-handle');
    if (!handle) return;
    if (isEditing()) return;
    const sec = handle.closest('.section');
    if (!sec) return;
    touchDragged = sec;
    sec.classList.add('dragging');
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!touchDragged) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el ? el.closest('.section') : null;
    clearOver(canvas);
    if (target && target !== touchDragged) target.classList.add('drag-over');
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    if (!touchDragged) return;
    const over = canvas.querySelector('.section.drag-over');
    if (over && over !== touchDragged) {
      const newOrder = getInsertIndex(canvas, touchDragged, over);
      if (onReorder) onReorder(newOrder);
    }
    touchDragged.classList.remove('dragging');
    clearOver(canvas);
    touchDragged = null;
  });
}
