// components/row-counter.js — Floating row counter widget

import { t } from '../i18n.js';

let counterEl = null;
let pattern = null;
let onUpdate = null;
let pressTimer = null;

export function initCounter(patternRef, updateCallback) {
  pattern = patternRef;
  onUpdate = updateCallback;

  if (counterEl) counterEl.remove();

  counterEl = document.createElement('div');
  counterEl.className = 'row-counter';
  counterEl.innerHTML = `
    <span class="counter-value">${pattern.rowCounter.current}</span>
    <span class="counter-label">${t('row')}</span>
  `;

  document.body.appendChild(counterEl);

  // Tap = increment
  counterEl.addEventListener('click', increment);

  // Long press = decrement
  counterEl.addEventListener('mousedown', startPress);
  counterEl.addEventListener('mouseup', cancelPress);
  counterEl.addEventListener('mouseleave', cancelPress);
  counterEl.addEventListener('touchstart', startPress, { passive: true });
  counterEl.addEventListener('touchend', cancelPress);

  // Double tap = reset (with confirmation)
  let lastTap = 0;
  counterEl.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
      if (pattern.rowCounter.current > 0) {
        decrement();
      }
    }
    lastTap = now;
  });

  return counterEl;
}

export function destroyCounter() {
  if (counterEl) {
    counterEl.remove();
    counterEl = null;
  }
}

function increment() {
  pattern.rowCounter.current++;
  update();
}

function decrement() {
  if (pattern.rowCounter.current > 0) {
    pattern.rowCounter.current--;
    update();
  }
}

function startPress() {
  pressTimer = setTimeout(() => {
    decrement();
    // Visual feedback
    if (counterEl) counterEl.classList.add('counter-pulse');
    setTimeout(() => {
      if (counterEl) counterEl.classList.remove('counter-pulse');
    }, 200);
  }, 500);
}

function cancelPress() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

function update() {
  if (counterEl) {
    counterEl.querySelector('.counter-value').textContent = pattern.rowCounter.current;
  }
  if (onUpdate) onUpdate();
}
