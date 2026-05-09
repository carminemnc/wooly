// app.js — Entry point, routing between views

import { renderPatternList } from './views/pattern-list.js';
import { renderEditor } from './views/editor.js';
import { initTheme } from './themes.js';
import { destroyCounter } from './components/row-counter.js';

const root = document.getElementById('app');

let currentView = 'list';
let currentPatternId = null;

export function navigate(view, patternId = null) {
  currentView = view;
  currentPatternId = patternId;
  render();
}

function render() {
  root.innerHTML = '';
  if (currentView === 'editor' && currentPatternId) {
    renderEditor(root, currentPatternId);
  } else {
    renderPatternList(root);
  }
}

// Handle browser back button
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.view === 'editor') {
    currentView = 'editor';
    currentPatternId = e.state.patternId;
  } else {
    destroyCounter();
    currentView = 'list';
    currentPatternId = null;
  }
  render();
});

// Apply saved theme immediately
initTheme();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Initial render
render();
