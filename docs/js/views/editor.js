// views/editor.js — Pattern editor view

import { getPattern, savePattern, saveGlobalAbbreviations } from '../store.js';
import { navigate } from '../app.js';
import { t, getLang, toggleLang } from '../i18n.js';
import { toast } from '../components/toast.js';
import { createBlock, createRow, createSection, createId } from '../model.js';
import { getThemes, applyTheme, getSavedTheme } from '../themes.js';
import { exportHTML, exportPDF, exportJSON } from '../components/export.js';
import { importFile } from '../components/import.js';
import { initDrag } from '../components/drag.js';
import { observeMarkdown } from '../components/markdown.js';
import { initCounter, destroyCounter } from '../components/row-counter.js';
import { savePatternAsTemplate } from '../components/templates.js';

let pattern = null;
let saveTimer = null;

export function renderEditor(root, patternId) {
  pattern = getPattern(patternId);
  if (!pattern) { navigate('list'); return; }

  // Apply pattern's theme
  applyTheme(pattern.theme);

  const container = document.createElement('div');
  container.className = 'view-editor';

  // Top bar
  const topBar = document.createElement('header');
  topBar.className = 'editor-topbar';
  topBar.innerHTML = `
    <button class="btn-back" id="btn-back">←</button>
    <input class="editor-title" id="editor-title" type="text"
      placeholder="${t('pattern_name_placeholder')}"
      value="${escapeAttr(pattern.name)}">
    <span class="save-indicator" id="save-indicator">${t('saved')}</span>
    <button class="btn-icon btn-icon-sm" id="btn-lang-editor">${getLang().toUpperCase()}</button>
    <button class="btn-icon btn-icon-sm" id="btn-theme-editor">🎨</button>
    <button class="btn-menu" id="btn-editor-menu">⋯</button>
  `;
  container.appendChild(topBar);

  // Canvas
  const canvas = document.createElement('div');
  canvas.className = 'editor-canvas';
  canvas.id = 'editor-canvas';

  // Header (image + title)
  const header = document.createElement('div');
  header.className = 'editor-header';
  header.innerHTML = `
    <div class="img-box" id="img-box">
      ${pattern.thumbnail ? `<img src="${pattern.thumbnail}" alt="" class="img-preview">` : '<span class="img-placeholder">📷</span>'}
      <input type="file" accept="image/*" id="img-input">
    </div>
  `;
  canvas.appendChild(header);

  container.appendChild(canvas);

  // Bottom bar
  const bottomBar = document.createElement('div');
  bottomBar.className = 'editor-bottombar';
  bottomBar.innerHTML = `
    <button class="bottom-btn" id="btn-add-section">${t('add_section')}</button>
    <button class="bottom-btn" id="btn-export-menu">${t('export')}</button>
  `;
  container.appendChild(bottomBar);

  root.appendChild(container);
  renderSections(canvas);
  initDrag(canvas, handleReorder);
  observeMarkdown(canvas);
  initCounter(pattern, scheduleSave);
  bindEditorEvents(container);
}

// --- Sections rendering ---

function renderSections(canvas) {
  // Remove only sections, keep header
  canvas.querySelectorAll('.section').forEach(el => el.remove());
  pattern.sections.forEach((section, idx) => {
    canvas.appendChild(renderSection(section, idx));
  });
}

function renderSection(section, idx) {
  const el = document.createElement('div');
  el.className = 'section' + (section.halfWidth ? ' col-half' : '');
  el.dataset.sectionId = section.id;
  el.dataset.idx = idx;
  el.setAttribute('draggable', 'true');

  const title = getSectionTitle(section);
  el.innerHTML = `
    <div class="section-header">
      <span class="section-drag-handle">☰</span>
      <span class="section-title">${title}</span>
      <button class="section-menu-btn" aria-label="Menu">⋯</button>
      <div class="section-menu hidden">
        <button class="sec-action" data-action="width">${t('toggle_width')}</button>
        <button class="sec-action" data-action="duplicate">${t('duplicate_section')}</button>
        <button class="sec-action sec-action-danger" data-action="delete">${t('delete_section')}</button>
      </div>
    </div>
    <div class="section-body"></div>
  `;

  const body = el.querySelector('.section-body');
  renderSectionBody(body, section);
  bindSectionMenu(el, section, idx);
  return el;
}

function renderSectionBody(body, section) {
  switch (section.type) {
    case 'materials':
    case 'gauge':
      section.fields.forEach((field, i) => {
        body.appendChild(createFieldEl(field, section, i));
      });
      break;

    case 'abbreviations':
      const grid = document.createElement('div');
      grid.className = 'abbr-grid';
      section.items.forEach((item, i) => {
        grid.appendChild(createAbbrEl(item, section, i));
      });
      body.appendChild(grid);
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-abbr';
      addBtn.textContent = t('add_abbr');
      addBtn.addEventListener('click', () => {
        section.items.push({ key: '', val: '' });
        scheduleSave();
        const el = createAbbrEl(section.items[section.items.length - 1], section, section.items.length - 1);
        grid.appendChild(el);
        el.querySelector('.abbr-key').focus();
      });
      body.appendChild(addBtn);
      break;

    case 'steps':
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'steps-container';
      section.blocks.forEach((block, i) => {
        stepsContainer.appendChild(createBlockEl(block, section));
      });
      body.appendChild(stepsContainer);
      const addBlock = document.createElement('button');
      addBlock.className = 'btn-add-block';
      addBlock.textContent = t('add_piece');
      addBlock.addEventListener('click', () => {
        const block = createBlock();
        section.blocks.push(block);
        scheduleSave();
        stepsContainer.appendChild(createBlockEl(block, section));
      });
      body.appendChild(addBlock);
      break;

    case 'instructions':
    case 'notes':
    case 'custom':
      const textEl = document.createElement('div');
      textEl.className = 'long-text';
      textEl.contentEditable = 'true';
      textEl.textContent = section.content || '';
      textEl.addEventListener('input', () => {
        section.content = textEl.innerText;
        scheduleSave();
      });
      body.appendChild(textEl);
      break;
  }
}

// --- Field elements ---

function createFieldEl(field, section, idx) {
  const el = document.createElement('div');
  el.className = 'field';
  el.innerHTML = `
    <span class="field-label">${translateFieldLabel(field.label)}</span>
    <span class="field-value" contenteditable="true">${escapeHtml(field.value)}</span>
  `;
  el.querySelector('.field-value').addEventListener('input', (e) => {
    section.fields[idx].value = e.target.innerText;
    scheduleSave();
  });
  return el;
}

function createAbbrEl(item, section, idx) {
  const el = document.createElement('div');
  el.className = 'abbr-item';
  el.innerHTML = `
    <span class="abbr-key" contenteditable="true">${escapeHtml(item.key)}</span>
    <span class="abbr-val" contenteditable="true">${escapeHtml(item.val)}</span>
  `;
  el.querySelector('.abbr-key').addEventListener('input', (e) => {
    section.items[idx].key = e.target.innerText;
    scheduleSave();
  });
  el.querySelector('.abbr-val').addEventListener('input', (e) => {
    section.items[idx].val = e.target.innerText;
    scheduleSave();
  });
  return el;
}

// --- Steps block ---

function createBlockEl(block, section) {
  const el = document.createElement('div');
  el.className = 'steps-block';

  const header = document.createElement('div');
  header.className = 'steps-header';
  header.contentEditable = 'true';
  header.textContent = block.title;
  header.addEventListener('input', () => {
    block.title = header.innerText;
    scheduleSave();
  });
  el.appendChild(header);

  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  block.rows.forEach((row, i) => {
    timeline.appendChild(createRowEl(row, block, i, timeline));
  });
  el.appendChild(timeline);

  const addRow = document.createElement('button');
  addRow.className = 'btn-add-step';
  addRow.textContent = t('add_row');
  addRow.addEventListener('click', () => {
    const row = createRow(block.rows.length + 1);
    block.rows.push(row);
    scheduleSave();
    const rowEl = createRowEl(row, block, block.rows.length - 1, timeline);
    timeline.appendChild(rowEl);
    rowEl.querySelector('.timeline-text').focus();
  });
  el.appendChild(addRow);

  return el;
}

function createRowEl(row, block, idx, timeline) {
  const el = document.createElement('div');
  el.className = 'timeline-step';
  el.dataset.rowId = row.id;
  el.innerHTML = `
    <span class="timeline-num">${t('row')} ${row.num}</span>
    <div class="timeline-content">
      <div class="timeline-text" contenteditable="true">${escapeHtml(row.text)}</div>
      <button class="btn-add-tip${row.tip ? ' hidden' : ''}">${t('add_tip')}</button>
      <div class="timeline-tip${row.tip ? ' visible' : ''}" contenteditable="true">${escapeHtml(row.tip)}</div>
      <button class="btn-add-note${row.note ? ' hidden' : ''}">${t('add_note')}</button>
      <div class="timeline-note${row.note ? ' visible' : ''}" contenteditable="true">${escapeHtml(row.note)}</div>
    </div>
    <div class="timeline-actions">
      <button class="timeline-del">×</button>
    </div>
  `;

  // Text
  el.querySelector('.timeline-text').addEventListener('input', (e) => {
    row.text = e.target.innerText;
    scheduleSave();
  });

  // Tip
  const tipBtn = el.querySelector('.btn-add-tip');
  const tipEl = el.querySelector('.timeline-tip');
  tipBtn.addEventListener('click', () => {
    tipBtn.classList.add('hidden');
    tipEl.classList.add('visible');
    tipEl.focus();
  });
  tipEl.addEventListener('input', () => {
    row.tip = tipEl.innerText;
    scheduleSave();
  });
  tipEl.addEventListener('blur', () => {
    if (!tipEl.innerText.trim()) {
      tipEl.classList.remove('visible');
      tipEl.innerHTML = '';
      row.tip = '';
      tipBtn.classList.remove('hidden');
      scheduleSave();
    }
  });

  // Note
  const noteBtn = el.querySelector('.btn-add-note');
  const noteEl = el.querySelector('.timeline-note');
  noteBtn.addEventListener('click', () => {
    noteBtn.classList.add('hidden');
    noteEl.classList.add('visible');
    noteEl.focus();
  });
  noteEl.addEventListener('input', () => {
    row.note = noteEl.innerText;
    scheduleSave();
  });
  noteEl.addEventListener('blur', () => {
    if (!noteEl.innerText.trim()) {
      noteEl.classList.remove('visible');
      noteEl.innerHTML = '';
      row.note = '';
      noteBtn.classList.remove('hidden');
      scheduleSave();
    }
  });

  // Delete
  el.querySelector('.timeline-del').addEventListener('click', () => {
    const rowIdx = block.rows.indexOf(row);
    if (rowIdx > -1) {
      block.rows.splice(rowIdx, 1);
      block.rows.forEach((r, i) => { r.num = i + 1; });
      scheduleSave();
      el.remove();
      timeline.querySelectorAll('.timeline-num').forEach((numEl, i) => {
        numEl.textContent = t('row') + ' ' + (i + 1);
      });
    }
  });

  return el;
}

// --- Section menu ---

function bindSectionMenu(el, section, idx) {
  const menuBtn = el.querySelector('.section-menu-btn');
  const menu = el.querySelector('.section-menu');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.section-menu:not(.hidden)').forEach(m => {
      if (m !== menu) m.classList.add('hidden');
    });
    menu.classList.toggle('hidden');
  });

  el.querySelectorAll('.sec-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const canvas = document.getElementById('editor-canvas');

      if (action === 'width') {
        section.halfWidth = !section.halfWidth;
        el.classList.toggle('col-half', section.halfWidth);
        scheduleSave();
      } else if (action === 'duplicate') {
        const copy = JSON.parse(JSON.stringify(section));
        copy.id = createId();
        pattern.sections.splice(idx + 1, 0, copy);
        scheduleSave();
        renderSections(canvas);
        toast(t('duplicate') + ' ✓');
      } else if (action === 'delete') {
        pattern.sections.splice(idx, 1);
        scheduleSave();
        renderSections(canvas);
        toast(t('delete') + ' ✓');
      }
      menu.classList.add('hidden');
    });
  });
}

// --- Editor events ---

function bindEditorEvents(container) {
  container.querySelector('#btn-back').addEventListener('click', () => {
    flushSave();
    destroyCounter();
    navigate('list');
    history.pushState({ view: 'list' }, '');
  });

  container.querySelector('#editor-title').addEventListener('input', (e) => {
    pattern.name = e.target.value;
    scheduleSave();
  });

  container.querySelector('#btn-lang-editor').addEventListener('click', () => {
    toggleLang();
    flushSave();
    destroyCounter();
    renderEditor(container.parentNode, pattern.id);
    container.remove();
  });

  container.querySelector('#btn-theme-editor').addEventListener('click', () => {
    showEditorThemePicker(container);
  });

  container.querySelector('#btn-editor-menu').addEventListener('click', (e) => {
    e.stopPropagation();
    showEditorMenu(container);
  });

  container.querySelector('#btn-add-section').addEventListener('click', () => {
    showAddSectionMenu(container);
  });

  container.querySelector('#btn-export-menu').addEventListener('click', () => {
    showExportMenu(container);
  });

  // Image upload
  bindImageUpload(container);
}

function bindImageUpload(container) {
  const input = container.querySelector('#img-input');
  if (!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataURL = c.toDataURL('image/jpeg', 0.7);
        pattern.thumbnail = dataURL;
        scheduleSave();
        const box = container.querySelector('#img-box');
        box.innerHTML = `<img src="${dataURL}" alt="" class="img-preview"><input type="file" accept="image/*" id="img-input">`;
        // Re-bind new input
        bindImageUpload(container);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function showEditorMenu(container) {
  const existing = container.querySelector('.editor-overflow-menu');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.className = 'editor-overflow-menu';

  const options = [
    { label: t('save_as_template'), action: () => {
      savePatternAsTemplate(pattern);
      toast(t('save_as_template') + ' ✓');
    }},
    { label: getLang() === 'it' ? 'Salva abbreviazioni come default' : 'Save abbreviations as default', action: () => {
      const abbrSection = pattern.sections.find(s => s.type === 'abbreviations');
      if (abbrSection && abbrSection.items) {
        saveGlobalAbbreviations(abbrSection.items);
        toast('✓');
      } else {
        toast(getLang() === 'it' ? 'Nessuna sezione abbreviazioni' : 'No abbreviations section');
      }
    }}
  ];

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'editor-menu-option';
    btn.textContent = opt.label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      opt.action();
      panel.remove();
    });
    panel.appendChild(btn);
  });

  container.querySelector('.editor-topbar').appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-editor-menu') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function showEditorThemePicker(container) {
  const existing = container.querySelector('.theme-picker-panel');
  if (existing) { existing.remove(); return; }

  const themes = getThemes();
  const panel = document.createElement('div');
  panel.className = 'theme-picker-panel';
  themes.forEach((theme, idx) => {
    const btn = document.createElement('button');
    btn.className = 'theme-pick-btn' + (theme.id === pattern.theme ? ' active' : '');
    btn.innerHTML = `<span class="theme-swatch" style="background:${theme.swatch}"></span>${theme.name}`;
    btn.addEventListener('click', () => {
      applyTheme(idx);
      pattern.theme = theme.id;
      scheduleSave();
      panel.remove();
    });
    panel.appendChild(btn);
  });
  container.querySelector('.editor-topbar').appendChild(panel);

  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!e.target.closest('.theme-picker-panel') && !e.target.closest('#btn-theme-editor')) {
        panel.remove();
        document.removeEventListener('click', close);
      }
    });
  }, 0);
}

function showAddSectionMenu(container) {
  const existing = container.querySelector('.add-section-panel');
  if (existing) { existing.remove(); return; }

  const types = ['materials', 'abbreviations', 'gauge', 'steps', 'instructions', 'notes', 'custom'];
  const panel = document.createElement('div');
  panel.className = 'add-section-panel';
  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'add-section-option';
    btn.textContent = t(type);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const section = createSection(type);
      pattern.sections.push(section);
      scheduleSave();
      renderSections(document.getElementById('editor-canvas'));
      panel.remove();
      toast(t(type) + ' ✓');
    });
    panel.appendChild(btn);
  });
  container.querySelector('.editor-bottombar').appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-add-section') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function showExportMenu(container) {
  const existing = container.querySelector('.export-panel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.className = 'add-section-panel export-panel';
  const options = [
    { label: t('export_html'), action: () => exportHTML(pattern) },
    { label: t('export_pdf'), action: () => exportPDF() },
    { label: t('export_json'), action: () => exportJSON(pattern) },
    { label: t('import'), action: () => importFile() }
  ];
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'add-section-option';
    btn.textContent = opt.label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      opt.action();
      panel.remove();
    });
    panel.appendChild(btn);
  });
  container.querySelector('.editor-bottombar').appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-export-menu') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

// --- Save ---

function handleReorder(newOrder) {
  // Reorder pattern.sections to match new DOM order
  const reordered = newOrder.map(id => pattern.sections.find(s => s.id === id)).filter(Boolean);
  pattern.sections = reordered;
  scheduleSave();
}

function scheduleSave() {
  const indicator = document.getElementById('save-indicator');
  if (indicator) indicator.textContent = t('saving');
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    savePattern(pattern);
    if (indicator) indicator.textContent = t('saved');
  }, 1000);
}

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    savePattern(pattern);
  }
}

// --- Helpers ---

function getSectionTitle(section) {
  if (section.type === 'custom') return section.title || t('custom');
  return t(section.type);
}

function translateFieldLabel(label) {
  const map = { 'Filato': 'yarn', 'Quantità': 'quantity', 'Ferri': 'needles', 'Accessori': 'notions', 'Campione': 'swatch', 'Maglie': 'stitches' };
  const key = map[label];
  return key ? t(key) : label;
}

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
