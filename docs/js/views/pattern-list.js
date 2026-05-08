// views/pattern-list.js — Pattern list view

import { listPatterns, newPattern, deletePattern, duplicatePattern, getPattern, savePattern } from '../store.js';
import { navigate } from '../app.js';
import { t, getLang, toggleLang } from '../i18n.js';
import { toast } from '../components/toast.js';
import { getThemes, applyTheme, getSavedTheme } from '../themes.js';
import { getAllTemplates, getCustomTemplates, createPatternFromTemplate } from '../components/templates.js';
import { deleteTemplate } from '../store.js';

export function renderPatternList(root) {
  const patterns = listPatterns().filter(p => !p.archived);
  const archived = listPatterns().filter(p => p.archived);

  const container = document.createElement('div');
  container.className = 'view-list';

  // Header
  container.innerHTML = `
    <header class="list-header">
      <h1 class="list-title">🧶 Wooly</h1>
      <div class="list-actions">
        <button class="btn-icon" id="btn-theme" title="${t('theme')}">🎨</button>
        <button class="btn-icon" id="btn-lang">${getLang().toUpperCase()}</button>
        <button class="btn-new" id="btn-new-pattern">${t('new_pattern')}</button>
      </div>
    </header>
    <div class="pattern-grid" id="pattern-grid"></div>
  `;

  const grid = container.querySelector('#pattern-grid');

  if (patterns.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">🧶</p>
        <p class="empty-text">${t('no_patterns')}<br>${t('no_patterns_hint')}</p>
      </div>
    `;
  } else {
    patterns.forEach(p => grid.appendChild(createCard(p)));
  }

  // Archived
  if (archived.length > 0) {
    const section = document.createElement('details');
    section.className = 'archive-section';
    section.innerHTML = `<summary class="archive-toggle">${t('archive')} (${archived.length})</summary>`;
    const archiveGrid = document.createElement('div');
    archiveGrid.className = 'pattern-grid';
    archived.forEach(p => archiveGrid.appendChild(createCard(p)));
    section.appendChild(archiveGrid);
    container.appendChild(section);
  }

  root.appendChild(container);

  // Events
  container.querySelector('#btn-new-pattern').addEventListener('click', (e) => {
    e.stopPropagation();
    showNewPatternMenu(container);
  });

  container.querySelector('#btn-lang').addEventListener('click', () => {
    toggleLang();
    navigate('list'); // re-render with new lang
  });

  container.querySelector('#btn-theme').addEventListener('click', () => {
    showThemePicker(container);
  });
}

function showNewPatternMenu(container) {
  const existing = container.querySelector('.new-pattern-menu');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.className = 'new-pattern-menu';

  // Empty pattern option
  const emptyBtn = document.createElement('button');
  emptyBtn.className = 'new-pattern-option';
  emptyBtn.textContent = '📄 ' + (getLang() === 'it' ? 'Vuoto' : 'Empty');
  emptyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const p = newPattern();
    navigate('editor', p.id);
    history.pushState({ view: 'editor', patternId: p.id }, '');
    panel.remove();
  });
  panel.appendChild(emptyBtn);

  // Template options
  const customTemplates = getCustomTemplates();
  getAllTemplates().forEach(tpl => {
    const row = document.createElement('div');
    row.className = 'new-pattern-row';

    const btn = document.createElement('button');
    btn.className = 'new-pattern-option';
    btn.textContent = tpl.name;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = createPatternFromTemplate(tpl);
      savePattern(p);
      navigate('editor', p.id);
      history.pushState({ view: 'editor', patternId: p.id }, '');
      panel.remove();
    });
    row.appendChild(btn);

    // Delete button for custom templates
    if (customTemplates.some(ct => ct.id === tpl.id)) {
      const delBtn = document.createElement('button');
      delBtn.className = 'new-pattern-del';
      delBtn.textContent = '\u00d7';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTemplate(tpl.id);
        toast(getLang() === 'it' ? 'Template eliminato' : 'Template deleted');
        panel.remove();
      });
      row.appendChild(delBtn);
    }

    panel.appendChild(row);
  });

  container.querySelector('.list-header').appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-new-pattern') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function createCard(meta) {
  const card = document.createElement('div');
  card.className = 'pattern-card';
  card.innerHTML = `
    <div class="card-thumb">${meta.thumbnail ? `<img src="${meta.thumbnail}" alt="">` : '<span class="card-thumb-empty">🧶</span>'}</div>
    <div class="card-info">
      <span class="card-name">${meta.name || t('unnamed')}</span>
      <span class="card-date">${formatDate(meta.modified)}</span>
    </div>
    <button class="card-menu-btn" aria-label="Menu">⋯</button>
    <div class="card-menu hidden">
      <button class="card-action" data-action="duplicate">${t('duplicate')}</button>
      <button class="card-action" data-action="archive">${meta.archived ? t('restore') : t('archive_action')}</button>
      <button class="card-action card-action-danger" data-action="delete">${t('delete')}</button>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) return;
    navigate('editor', meta.id);
    history.pushState({ view: 'editor', patternId: meta.id }, '');
  });

  const menuBtn = card.querySelector('.card-menu-btn');
  const menu = card.querySelector('.card-menu');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other open menus
    document.querySelectorAll('.card-menu:not(.hidden)').forEach(m => {
      if (m !== menu) m.classList.add('hidden');
    });
    menu.classList.toggle('hidden');
  });

  card.querySelectorAll('.card-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'delete') {
        if (confirm(t('delete_confirm'))) {
          deletePattern(meta.id);
          toast(t('delete') + ' ✓');
          navigate('list');
        }
      } else if (action === 'duplicate') {
        duplicatePattern(meta.id);
        toast(t('duplicate') + ' ✓');
        navigate('list');
      } else if (action === 'archive') {
        const p = getPattern(meta.id);
        if (p) {
          p.archived = !p.archived;
          savePattern(p);
          toast((p.archived ? t('archive_action') : t('restore')) + ' ✓');
          navigate('list');
        }
      }
      menu.classList.add('hidden');
    });
  });

  return card;
}

function showThemePicker(container) {
  // Remove existing picker if open
  const existing = container.querySelector('.theme-picker-panel');
  if (existing) { existing.remove(); return; }

  const themes = getThemes();
  const panel = document.createElement('div');
  panel.className = 'theme-picker-panel';
  themes.forEach((theme, idx) => {
    const btn = document.createElement('button');
    btn.className = 'theme-pick-btn' + (idx === getSavedTheme() ? ' active' : '');
    btn.innerHTML = `<span class="theme-swatch" style="background:${theme.swatch}"></span>${theme.name}`;
    btn.addEventListener('click', () => {
      applyTheme(idx);
      navigate('list');
    });
    panel.appendChild(btn);
  });
  container.querySelector('.list-header').appendChild(panel);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!e.target.closest('.theme-picker-panel') && !e.target.closest('#btn-theme')) {
        panel.remove();
        document.removeEventListener('click', close);
      }
    });
  }, 0);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(getLang() === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short' });
}
