// views/pattern-list.js — Pattern list view

import { listPatterns, newPattern, deletePattern, duplicatePattern, getPattern, savePattern } from '../store.js';
import { navigate } from '../app.js';
import { t, getLang, toggleLang } from '../i18n.js';
import { toast, showConfirmModal } from '../components/toast.js';
import { getThemes, applyTheme, getSavedTheme } from '../themes.js';
import { getAllTemplates, getCustomTemplates, createPatternFromTemplate } from '../components/templates.js';
import { deleteTemplate } from '../store.js';
import { exportBackup, importBackup } from '../components/backup.js';
import { importFile } from '../components/import.js';
import { getLogo, getFooter, setLogo, setFooter } from '../components/settings.js';
import { ICONS } from '../components/icons.js';

export function renderPatternList(root) {
  const patterns = listPatterns().filter(p => !p.archived);
  const archived = listPatterns().filter(p => p.archived);

  const container = document.createElement('div');
  container.className = 'view-list';

  // Header
  container.innerHTML = `
    <header class="list-header">
      <h1 class="list-title"><img class="list-logo" src="icons/logo.png" alt="Wooly"></h1>
      <div class="list-actions">
        <button class="btn-icon" id="btn-settings" title="${t('settings')}">${ICONS.settings}</button>
        <button class="btn-icon" id="btn-backup" title="Backup">${ICONS.backup}</button>
        <button class="btn-icon" id="btn-restore" title="${t('restore')}">${ICONS.restore}</button>
        <button class="btn-icon" id="btn-theme" title="${t('theme')}">${ICONS.theme}</button>
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
        <img class="empty-icon" src="icons/logo.png" alt="">
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

  // Storage indicator
  const storageEl = document.createElement('div');
  storageEl.className = 'storage-indicator';
  const used = new Blob(Object.values(localStorage)).size * 2;
  const usedMB = (used / 1024 / 1024).toFixed(1);
  storageEl.textContent = t('storage_label') + usedMB + ' MB / ~5 MB';
  container.appendChild(storageEl);

  // GitHub link
  const ghLink = document.createElement('a');
  ghLink.className = 'github-link';
  ghLink.href = 'https://github.com/carminemnc/wooly';
  ghLink.target = '_blank';
  ghLink.rel = 'noopener noreferrer';
  ghLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
  container.appendChild(ghLink);

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

  container.querySelector('#btn-backup').addEventListener('click', () => {
    exportBackup();
  });

  container.querySelector('#btn-restore').addEventListener('click', () => {
    importBackup(() => navigate('list'));
  });

  container.querySelector('#btn-settings').addEventListener('click', () => {
    showSettings(container);
  });
}

function showSettings(container) {
  const existing = document.getElementById('settings-panel');
  if (existing) { existing.remove(); return; }

  const currentLogo = getLogo();
  const currentFooter = getFooter();

  const panel = document.createElement('div');
  panel.className = 'settings-panel';
  panel.id = 'settings-panel';

  const title = t('settings');
  const logoLabel = t('settings_logo_label');
  const footerLabel = t('settings_footer_label');
  const uploadText = t('settings_upload');
  const removeText = t('settings_remove_logo');
  const footerPlaceholder = t('settings_footer_placeholder');

  panel.innerHTML = `
    <div class="settings-header">
      <span class="settings-title">${title}</span>
      <button class="settings-close" id="settings-close">\u00d7</button>
    </div>
    <div class="settings-body">
      <label class="settings-label">${logoLabel}</label>
      <div class="settings-logo-box" id="settings-logo-box">
        ${currentLogo ? `<img src="${currentLogo}" alt="Logo" class="settings-logo-preview">` : `<span class="settings-logo-placeholder">${uploadText}</span>`}
        <input type="file" accept="image/*" id="settings-logo-input">
      </div>
      ${currentLogo ? `<button class="settings-remove-logo" id="settings-remove-logo">${removeText}</button>` : ''}
      <label class="settings-label">${footerLabel}</label>
      <input type="text" class="settings-footer-input" id="settings-footer-input" placeholder="${footerPlaceholder}" value="${currentFooter.replace(/"/g, '&quot;')}">
    </div>
  `;

  document.body.appendChild(panel);

  panel.querySelector('#settings-close').addEventListener('click', () => panel.remove());

  panel.querySelector('#settings-logo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataURL = c.toDataURL('image/png', 0.9);
        setLogo(dataURL);
        toast(t('logo_saved'));
        panel.remove();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  const removeBtn = panel.querySelector('#settings-remove-logo');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      setLogo('');
      toast(t('logo_removed'));
      panel.remove();
    });
  }

  panel.querySelector('#settings-footer-input').addEventListener('input', (e) => {
    setFooter(e.target.value);
  });

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-settings') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function showNewPatternMenu(container) {
  const existing = container.querySelector('.new-pattern-menu');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.className = 'new-pattern-menu';

  // Empty pattern option
  const emptyBtn = document.createElement('button');
  emptyBtn.className = 'new-pattern-option';
  emptyBtn.textContent = t('new_empty');
  emptyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const p = newPattern();
    navigate('editor', p.id);
    history.pushState({ view: 'editor', patternId: p.id }, '');
    panel.remove();
  });
  panel.appendChild(emptyBtn);

  // Import option
  const importBtn = document.createElement('button');
  importBtn.className = 'new-pattern-option';
  importBtn.textContent = t('new_import');
  importBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.remove();
    importFile();
  });
  panel.appendChild(importBtn);

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
        showConfirmModal(
          t('delete_template_confirm'),
          () => {
            deleteTemplate(tpl.id);
            toast(t('template_deleted'));
            panel.remove();
          }
        );
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
    <div class="card-thumb">${meta.thumbnail ? `<img src="${meta.thumbnail}" alt="">` : '<img class="card-thumb-empty" src="icons/logo.png" alt="">'}</div>
    <div class="card-info">
      <span class="card-name">${meta.name || t('unnamed')}</span>
      <span class="card-date">${formatDate(meta.modified)}</span>
    </div>
    <button class="card-menu-btn" aria-label="${t('aria_menu')}">⋯</button>
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
        showConfirmModal(t('delete_confirm'), () => {
          deletePattern(meta.id);
          toast(t('delete') + ' ✓');
          navigate('list');
        });
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
    btn.innerHTML = `<span class="theme-pick-icon">${ICONS[theme.id] || ''}</span>${theme.name}`;
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
  }, 10);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(getLang() === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short' });
}
