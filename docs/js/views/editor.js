// views/editor.js — Pattern editor view

import { getPattern, savePattern, getAbbrSets, saveAbbrSet, deleteAbbrSet } from '../store.js';
import { navigate } from '../app.js';
import { t, getLang, toggleLang } from '../i18n.js';
import { toast, showConfirmModal, showPromptModal } from '../components/toast.js';
import { createBlock, createRow, createSection, createId } from '../model.js';
import { getThemes, applyTheme } from '../themes.js';
import { exportPDF, exportJSON, getPrintTemplates } from '../components/export.js';
import { initDrag } from '../components/drag.js';
import { observeMarkdown } from '../components/markdown.js';
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

  // Cover block (image + info + measurements + gauge)
  const cover = document.createElement('div');
  cover.className = 'pattern-cover';
  cover.innerHTML = `
    <div class="cover-top">
      <div class="cover-left">
        <div class="img-box" id="img-box">
          ${pattern.thumbnail ? `<img src="${pattern.thumbnail}" alt="" class="img-preview">` : '<span class="img-placeholder">📷</span>'}
          <input type="file" accept="image/*" id="img-input">
        </div>
      </div>
      <div class="cover-right">
        <div class="cover-fields" id="cover-info"></div>
      </div>
    </div>
    <div class="cover-divider"></div>
    <div class="cover-bottom">
      <div class="cover-fields" id="cover-measurements"></div>
      <div class="cover-fields" id="cover-gauge"></div>
    </div>
  `;
  canvas.appendChild(cover);

  // Render cover fields
  const infoSection = pattern.sections.find(s => s.type === 'info');
  const measSection = pattern.sections.find(s => s.type === 'measurements');
  const gaugeSection = pattern.sections.find(s => s.type === 'gauge');
  if (infoSection) {
    const infoContainer = cover.querySelector('#cover-info');
    infoSection.fields.forEach((field, i) => {
      infoContainer.appendChild(createCoverField(field, infoSection, i));
    });
  }
  if (measSection) {
    const measContainer = cover.querySelector('#cover-measurements');
    measSection.fields.forEach((field, i) => {
      measContainer.appendChild(createCoverField(field, measSection, i));
    });
  }
  if (gaugeSection) {
    const gaugeContainer = cover.querySelector('#cover-gauge');
    gaugeSection.fields.forEach((field, i) => {
      gaugeContainer.appendChild(createCoverField(field, gaugeSection, i));
    });
  }

  // Images block (2 columns)
  const imagesBlock = document.createElement('div');
  imagesBlock.className = 'pattern-images';
  imagesBlock.innerHTML = `
    <div class="img-slot" id="img-slot-0">
      ${pattern.images && pattern.images[0] ? `<img src="${pattern.images[0]}" alt="" class="img-slot-preview">` : '<span class="img-slot-placeholder">\ud83d\udcf7</span>'}
      <input type="file" accept="image/*" data-slot="0">
    </div>
    <div class="img-slot" id="img-slot-1">
      ${pattern.images && pattern.images[1] ? `<img src="${pattern.images[1]}" alt="" class="img-slot-preview">` : '<span class="img-slot-placeholder">\ud83d\udcf7</span>'}
      <input type="file" accept="image/*" data-slot="1">
    </div>
  `;
  canvas.appendChild(imagesBlock);

  // Main divider
  const divider = document.createElement('div');
  divider.className = 'canvas-divider';
  canvas.appendChild(divider);

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
  bindEditorEvents(container);
}

// --- Sections rendering ---

function renderSections(canvas) {
  // Remove only sections, keep cover and divider
  canvas.querySelectorAll('.section').forEach(el => el.remove());
  pattern.sections
    .filter(s => s.type !== 'info' && s.type !== 'measurements' && s.type !== 'gauge')
    .forEach((section, idx) => {
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
  const isCustom = section.type === 'custom';
  el.innerHTML = `
    <div class="section-header">
      <span class="section-drag-handle">☰</span>
      <span class="section-title">${title}</span>
      ${isCustom ? '<button class="section-rename-btn" aria-label="Rinomina">✏️</button>' : ''}
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
    case 'info':
    case 'measurements':
      section.fields.forEach((field, i) => {
        body.appendChild(createFieldEl(field, section, i));
      });
      break;

    case 'abbreviations':
      const abbrToolbar = document.createElement('div');
      abbrToolbar.className = 'abbr-toolbar';
      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn-load-set';
      loadBtn.textContent = t('load_abbr_set') + ' ▾';
      loadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAbbrSetMenu(loadBtn, section, body);
      });
      abbrToolbar.appendChild(loadBtn);
      body.appendChild(abbrToolbar);

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
      const stepsIntro = document.createElement('div');
      stepsIntro.className = 'section-intro long-text';
      stepsIntro.contentEditable = 'true';
      stepsIntro.textContent = section.intro || '';
      stepsIntro.addEventListener('input', () => {
        section.intro = stepsIntro.innerText;
        if (!stepsIntro.innerText.trim()) stepsIntro.innerHTML = '';
        scheduleSave();
      });
      body.appendChild(stepsIntro);

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

      const stepsOutro = document.createElement('div');
      stepsOutro.className = 'section-outro long-text';
      stepsOutro.contentEditable = 'true';
      stepsOutro.textContent = section.outro || '';
      stepsOutro.addEventListener('input', () => {
        section.outro = stepsOutro.innerText;
        if (!stepsOutro.innerText.trim()) stepsOutro.innerHTML = '';
        scheduleSave();
      });
      body.appendChild(stepsOutro);
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
        if (!textEl.innerText.trim()) textEl.innerHTML = '';
        scheduleSave();
      });
      body.appendChild(textEl);
      break;

    case 'video':
      const videoList = document.createElement('div');
      videoList.className = 'video-list';
      section.links.forEach((link, i) => {
        videoList.appendChild(createVideoLinkEl(link, section, i, videoList));
      });
      body.appendChild(videoList);
      const addVideoBtn = document.createElement('button');
      addVideoBtn.className = 'btn-add-abbr';
      addVideoBtn.textContent = '+ ' + (getLang() === 'it' ? 'Aggiungi link' : 'Add link');
      addVideoBtn.addEventListener('click', () => {
        const link = { url: '', label: '' };
        section.links.push(link);
        scheduleSave();
        const el = createVideoLinkEl(link, section, section.links.length - 1, videoList);
        videoList.appendChild(el);
        el.querySelector('.video-url').focus();
      });
      body.appendChild(addVideoBtn);
      break;
  }
}

// --- Cover fields ---

function createCoverField(field, section, idx) {
  const el = document.createElement('div');
  el.className = 'cover-field';
  el.innerHTML = `
    <span class="cover-label">${translateFieldLabel(field.label)}</span>
    <span class="cover-value" contenteditable="true">${escapeHtml(field.value)}</span>
  `;
  el.querySelector('.cover-value').addEventListener('input', (e) => {
    section.fields[idx].value = e.target.innerText;
    scheduleSave();
  });
  return el;
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

  const headerRow = document.createElement('div');
  headerRow.className = 'steps-header-row';

  const hasContent = block.rows.some(r => r.text && r.text.trim());
  const startCollapsed = hasContent;

  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'block-collapse-btn';
  collapseBtn.textContent = startCollapsed ? '▸' : '▾';
  collapseBtn.addEventListener('click', () => {
    const collapsed = el.classList.toggle('collapsed');
    collapseBtn.textContent = collapsed ? '▸' : '▾';
    badge.textContent = collapsed ? block.rows.length + (getLang() === 'it' ? ' righe' : ' rows') : '';
  });
  headerRow.appendChild(collapseBtn);

  const header = document.createElement('div');
  header.className = 'steps-header';
  header.contentEditable = 'true';
  header.textContent = block.title;
  header.addEventListener('input', () => {
    block.title = header.innerText;
    scheduleSave();
  });
  headerRow.appendChild(header);

  const badge = document.createElement('span');
  badge.className = 'block-row-badge';
  badge.textContent = startCollapsed ? block.rows.length + (getLang() === 'it' ? ' righe' : ' rows') : '';
  headerRow.appendChild(badge);

  el.appendChild(headerRow);
  if (startCollapsed) el.classList.add('collapsed');

  // Intro
  const intro = document.createElement('div');
  intro.className = 'block-intro';
  intro.contentEditable = 'true';
  intro.textContent = block.intro || '';
  intro.addEventListener('input', () => {
    block.intro = intro.innerText;
    if (!intro.innerText.trim()) intro.innerHTML = '';
    scheduleSave();
  });
  el.appendChild(intro);

  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  block.rows.forEach((row, i) => {
    timeline.appendChild(createRowEl(row, block, i, timeline));
  });
  el.appendChild(timeline);
  initRowDrag(timeline, block);

  // Outro
  const outro = document.createElement('div');
  outro.className = 'block-outro';
  outro.contentEditable = 'true';
  outro.textContent = block.outro || '';
  outro.addEventListener('input', () => {
    block.outro = outro.innerText;
    if (!outro.innerText.trim()) outro.innerHTML = '';
    scheduleSave();
  });
  el.appendChild(outro);

  const addRow = document.createElement('button');
  addRow.className = 'btn-add-step';
  addRow.textContent = t('add_row');
  addRow.addEventListener('click', () => {
    const lastRow = block.rows[block.rows.length - 1];
    const nextNum = lastRow ? lastRow.num + (lastRow.repeat || 1) : 1;
    const row = createRow(nextNum);
    block.rows.push(row);
    scheduleSave();
    const rowEl = createRowEl(row, block, block.rows.length - 1, timeline);
    timeline.appendChild(rowEl);
    rowEl.querySelector('.timeline-text').focus();
  });
  el.appendChild(addRow);

  return el;
}

function renumberRows(block, timeline) {
  let num = 1;
  block.rows.forEach((r, i) => {
    r.num = num;
    num += r.repeat || 1;
  });
  timeline.querySelectorAll('.timeline-step').forEach((el, i) => {
    const row = block.rows[i];
    if (!row) return;
    const numEl = el.querySelector('.timeline-num');
    const repeat = row.repeat || 1;
    numEl.textContent = repeat > 1
      ? t('row') + ' ' + row.num + '-' + (row.num + repeat - 1)
      : t('row') + ' ' + row.num;
  });
}

function initRowDrag(timeline, block) {
  let draggedRow = null;

  timeline.addEventListener('dragstart', (e) => {
    const left = e.target.closest('.timeline-left');
    if (!left) { e.preventDefault(); return; }
    const step = left.closest('.timeline-step');
    if (!step) { e.preventDefault(); return; }
    draggedRow = step;
    step.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  timeline.addEventListener('dragend', () => {
    if (draggedRow) draggedRow.classList.remove('dragging');
    timeline.querySelectorAll('.timeline-step').forEach(s => s.classList.remove('drag-over'));
    draggedRow = null;
  });

  timeline.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const step = e.target.closest('.timeline-step');
    if (!step || step === draggedRow) return;
    timeline.querySelectorAll('.timeline-step').forEach(s => s.classList.remove('drag-over'));
    step.classList.add('drag-over');
  });

  timeline.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.timeline-step');
    if (!target || !draggedRow || target === draggedRow) return;
    // Reorder DOM
    const steps = Array.from(timeline.querySelectorAll('.timeline-step'));
    const fromIdx = steps.indexOf(draggedRow);
    const toIdx = steps.indexOf(target);
    if (fromIdx < toIdx) {
      target.parentNode.insertBefore(draggedRow, target.nextSibling);
    } else {
      target.parentNode.insertBefore(draggedRow, target);
    }
    // Reorder model
    const movedRow = block.rows.splice(fromIdx, 1)[0];
    const newIdx = fromIdx < toIdx ? toIdx : toIdx;
    block.rows.splice(newIdx, 0, movedRow);
    // Renumber
    renumberRows(block, timeline);
    scheduleSave();
    timeline.querySelectorAll('.timeline-step').forEach(s => s.classList.remove('drag-over'));
  });

  // Touch support
  let touchRow = null;
  timeline.addEventListener('touchstart', (e) => {
    const left = e.target.closest('.timeline-left');
    if (!left) return;
    const step = left.closest('.timeline-step');
    if (!step) return;
    touchRow = step;
    step.classList.add('dragging');
  }, { passive: true });

  timeline.addEventListener('touchmove', (e) => {
    if (!touchRow) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el ? el.closest('.timeline-step') : null;
    timeline.querySelectorAll('.timeline-step').forEach(s => s.classList.remove('drag-over'));
    if (target && target !== touchRow) target.classList.add('drag-over');
  }, { passive: false });

  timeline.addEventListener('touchend', () => {
    if (!touchRow) return;
    const over = timeline.querySelector('.timeline-step.drag-over');
    if (over && over !== touchRow) {
      const steps = Array.from(timeline.querySelectorAll('.timeline-step'));
      const fromIdx = steps.indexOf(touchRow);
      const toIdx = steps.indexOf(over);
      if (fromIdx < toIdx) {
        over.parentNode.insertBefore(touchRow, over.nextSibling);
      } else {
        over.parentNode.insertBefore(touchRow, over);
      }
      const movedRow = block.rows.splice(fromIdx, 1)[0];
      block.rows.splice(toIdx, 0, movedRow);
      renumberRows(block, timeline);
      scheduleSave();
    }
    touchRow.classList.remove('dragging');
    timeline.querySelectorAll('.timeline-step').forEach(s => s.classList.remove('drag-over'));
    touchRow = null;
  });
}

function getRowLabel(row) {
  const repeat = row.repeat || 1;
  return repeat > 1
    ? t('row') + ' ' + row.num + '-' + (row.num + repeat - 1)
    : t('row') + ' ' + row.num;
}

function bindRepeatBtn(btn, row, block, timeline) {
  btn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = row.repeat || 1;
    input.className = 'repeat-input';
    btn.replaceWith(input);
    input.focus();
    input.select();
    const finish = () => {
      row.repeat = Math.max(1, parseInt(input.value) || 1);
      scheduleSave();
      const newBtn = document.createElement('button');
      newBtn.className = 'btn-repeat';
      newBtn.textContent = '\u00d7' + row.repeat;
      input.replaceWith(newBtn);
      renumberRows(block, timeline);
      bindRepeatBtn(newBtn, row, block, timeline);
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
    });
  });
}

function createRowEl(row, block, idx, timeline) {
  const el = document.createElement('div');
  el.className = 'timeline-step';
  el.dataset.rowId = row.id;
  el.innerHTML = `
    <div class="timeline-left" draggable="true">
      <span class="row-drag-handle">☰</span>
      <span class="timeline-num">${getRowLabel(row)}</span>
      <button class="btn-repeat">×${row.repeat || 1}</button>
    </div>
    <div class="timeline-content">
      <div class="timeline-text" contenteditable="true">${escapeHtml(row.text)}</div>
    </div>
    <div class="timeline-sidebar">
      <button class="btn-add-tip${row.tip ? ' hidden' : ''}">${t('add_tip')}</button>
      <div class="timeline-tip${row.tip ? ' visible' : ''}" contenteditable="true">${escapeHtml(row.tip)}</div>
      <button class="btn-add-note${row.note ? ' hidden' : ''}">${t('add_note')}</button>
      <div class="timeline-note${row.note ? ' visible' : ''}" contenteditable="true">${escapeHtml(row.note)}</div>
    </div>
    <div class="timeline-actions">
      <button class="timeline-del">×</button>
    </div>
  `;

  // Repeat
  bindRepeatBtn(el.querySelector('.btn-repeat'), row, block, timeline);

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
      scheduleSave();
      el.remove();
      renumberRows(block, timeline);
    }
  });

  return el;
}

// --- Video links ---

function createVideoLinkEl(link, section, idx, container) {
  const el = document.createElement('div');
  el.className = 'video-item';
  el.innerHTML = `
    <input class="video-url" type="url" placeholder="https://youtube.com/..." value="${escapeAttr(link.url)}">
    <input class="video-label" type="text" placeholder="${getLang() === 'it' ? 'Descrizione (opzionale)' : 'Description (optional)'}" value="${escapeAttr(link.label)}">
    <button class="video-del">×</button>
  `;
  el.querySelector('.video-url').addEventListener('input', (e) => {
    section.links[idx].url = e.target.value;
    scheduleSave();
  });
  el.querySelector('.video-label').addEventListener('input', (e) => {
    section.links[idx].label = e.target.value;
    scheduleSave();
  });
  el.querySelector('.video-del').addEventListener('click', () => {
    section.links.splice(idx, 1);
    scheduleSave();
    container.innerHTML = '';
    section.links.forEach((l, i) => {
      container.appendChild(createVideoLinkEl(l, section, i, container));
    });
  });
  return el;
}

// --- Section menu ---

function bindSectionMenu(el, section, idx) {
  const menuBtn = el.querySelector('.section-menu-btn');
  const menu = el.querySelector('.section-menu');

  // Rename button (custom sections only)
  const renameBtn = el.querySelector('.section-rename-btn');
  if (renameBtn) {
    renameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const titleEl = el.querySelector('.section-title');
      const input = document.createElement('input');
      input.className = 'section-title-input';
      input.type = 'text';
      input.value = section.title || '';
      input.placeholder = getLang() === 'it' ? 'Nome sezione...' : 'Section name...';
      titleEl.replaceWith(input);
      input.focus();
      input.select();

      const finish = () => {
        section.title = input.value;
        scheduleSave();
        const newTitle = document.createElement('span');
        newTitle.className = 'section-title';
        newTitle.textContent = input.value || t('custom');
        input.replaceWith(newTitle);
      };
      input.addEventListener('blur', finish);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
      });
    });
  }

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
      // Find real index in pattern.sections by id
      const realIdx = pattern.sections.findIndex(s => s.id === section.id);

      if (action === 'width') {
        section.halfWidth = !section.halfWidth;
        el.classList.toggle('col-half', section.halfWidth);
        scheduleSave();
      } else if (action === 'duplicate') {
        const copy = JSON.parse(JSON.stringify(section));
        copy.id = createId();
        pattern.sections.splice(realIdx + 1, 0, copy);
        scheduleSave();
        renderSections(canvas);
        toast(t('duplicate') + ' ✓');
      } else if (action === 'delete') {
        if (realIdx > -1) {
          showConfirmModal(
            getLang() === 'it' ? 'Eliminare questa sezione?' : 'Delete this section?',
            () => {
              pattern.sections.splice(realIdx, 1);
              scheduleSave();
              renderSections(canvas);
              toast(t('delete') + ' \u2713');
            }
          );
        }
      }
      menu.classList.add('hidden');
    });
  });
}

// --- Editor events ---

function bindEditorEvents(container) {
  container.querySelector('#btn-back').addEventListener('click', () => {
    flushSave();
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
  bindSlotUploads(container);
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

function bindSlotUploads(container) {
  container.querySelectorAll('.img-slot input[data-slot]').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const slot = parseInt(input.dataset.slot);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 600;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          const dataURL = c.toDataURL('image/jpeg', 0.8);
          if (!pattern.images) pattern.images = ['', ''];
          pattern.images[slot] = dataURL;
          scheduleSave();
          const box = container.querySelector('#img-slot-' + slot);
          box.innerHTML = `<img src="${dataURL}" alt="" class="img-slot-preview"><input type="file" accept="image/*" data-slot="${slot}">`;
          bindSlotUploads(container);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
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
    { label: t('save_abbr_set'), action: () => {
      const abbrSection = pattern.sections.find(s => s.type === 'abbreviations');
      if (!abbrSection || !abbrSection.items) {
        toast(getLang() === 'it' ? 'Nessuna sezione abbreviazioni' : 'No abbreviations section');
        return;
      }
      showPromptModal(t('set_name_prompt'), (name) => {
        saveAbbrSet(name, abbrSection.items);
        toast(t('save_abbr_set') + ' \u2713');
      });
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
    btn.innerHTML = `${theme.name}`;
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
  const existing = document.getElementById('panel-add-section');
  if (existing) { existing.remove(); return; }

  const types = ['materials', 'abbreviations', 'steps', 'instructions', 'notes', 'video', 'custom'];
  const panel = document.createElement('div');
  panel.className = 'bottom-panel';
  panel.id = 'panel-add-section';
  types.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'bottom-panel-option';
    btn.textContent = t(type);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const section = createSection(type);
      pattern.sections.push(section);
      scheduleSave();
      renderSections(document.getElementById('editor-canvas'));
      panel.remove();
      toast(t(type) + ' \u2713');
    });
    panel.appendChild(btn);
  });
  document.body.appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-add-section') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function showExportMenu(container) {
  const existing = document.getElementById('panel-export');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.className = 'bottom-panel';
  panel.id = 'panel-export';

  // PDF button with submenu
  const pdfRow = document.createElement('div');
  pdfRow.className = 'bottom-panel-row';
  const pdfBtn = document.createElement('button');
  pdfBtn.className = 'bottom-panel-option';
  pdfBtn.textContent = getLang() === 'it' ? 'Stampa PDF' : 'Print PDF';
  pdfBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const existingSub = panel.querySelector('.panel-submenu');
    if (existingSub) { existingSub.remove(); return; }
    const sub = document.createElement('div');
    sub.className = 'panel-submenu';
    getPrintTemplates().forEach(tpl => {
      const btn = document.createElement('button');
      btn.className = 'bottom-panel-option';
      btn.textContent = tpl.name;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        exportPDF(pattern, tpl.id);
        panel.remove();
      });
      sub.appendChild(btn);
    });
    pdfRow.appendChild(sub);
  });
  pdfRow.appendChild(pdfBtn);
  panel.appendChild(pdfRow);

  // JSON option
  const jsonBtn = document.createElement('button');
  jsonBtn.className = 'bottom-panel-option';
  jsonBtn.textContent = t('export_json');
  jsonBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportJSON(pattern);
    panel.remove();
  });
  panel.appendChild(jsonBtn);

  document.body.appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target.id !== 'btn-export-menu') {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function showAbbrSetMenu(anchor, section, sectionBody) {
  const existing = document.querySelector('.abbr-set-menu');
  if (existing) { existing.remove(); return; }

  const sets = getAbbrSets();
  const panel = document.createElement('div');
  panel.className = 'abbr-set-menu';

  sets.forEach(set => {
    const row = document.createElement('div');
    row.className = 'abbr-set-row';
    const btn = document.createElement('button');
    btn.className = 'abbr-set-option';
    btn.textContent = set.name;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      section.items = JSON.parse(JSON.stringify(set.items));
      scheduleSave();
      // Re-render section body
      sectionBody.innerHTML = '';
      renderSectionBody(sectionBody, section);
      panel.remove();
      toast(set.name + ' ✓');
    });
    row.appendChild(btn);

    if (set.id !== 'default') {
      const del = document.createElement('button');
      del.className = 'abbr-set-del';
      del.textContent = '×';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmModal(
          getLang() === 'it' ? 'Eliminare questo set?' : 'Delete this set?',
          () => {
            deleteAbbrSet(set.id);
            row.remove();
            toast(t('delete') + ' \u2713');
          }
        );
      });
      row.appendChild(del);
    }
    panel.appendChild(row);
  });

  if (sets.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'abbr-set-empty';
    empty.textContent = getLang() === 'it' ? 'Nessun set salvato' : 'No saved sets';
    panel.appendChild(empty);
  }

  anchor.parentNode.appendChild(panel);

  const closeHandler = (e) => {
    if (!panel.contains(e.target) && e.target !== anchor) {
      panel.remove();
      document.removeEventListener('mousedown', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closeHandler), 10);
}

function handleReorder(newOrder) {
  // newOrder contains IDs of visible sections (excludes info/measurements)
  // Preserve info and measurements in their positions, reorder the rest
  const fixed = pattern.sections.filter(s => s.type === 'info' || s.type === 'measurements' || s.type === 'gauge');
  const reordered = newOrder.map(id => pattern.sections.find(s => s.id === id)).filter(Boolean);
  pattern.sections = [...fixed, ...reordered];
  scheduleSave();
}

function scheduleSave() {
  const indicator = document.getElementById('save-indicator');
  if (indicator) indicator.textContent = t('saving');
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const ok = savePattern(pattern);
    if (indicator) indicator.textContent = ok ? t('saved') : '⚠️';
    if (!ok) toast(getLang() === 'it' ? '⚠️ Spazio esaurito — impossibile salvare' : '⚠️ Storage full — cannot save');
  }, 1000);
}

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    savePattern(pattern);
  }
}

// --- Helpers ---

function getSectionTitle(section) {
  if (section.type === 'custom') return section.title || t('custom');
  return t(section.type);
}

function translateFieldLabel(label) {
  const map = {
    'Filato': 'yarn', 'Quantità': 'quantity', 'Metraggio': 'yardage',
    'Ferri': 'needles', 'Accessori': 'notions',
    'Campione': 'swatch', 'Maglie': 'stitches',
    'Autore': 'author', 'Difficoltà': 'difficulty', 'Categoria': 'category',
    'Taglie': 'sizes', 'Costruzione': 'construction', 'Tecniche': 'techniques',
    'Larghezza': 'width', 'Lunghezza': 'length', 'Circonferenza': 'circumference'
  };
  const key = map[label];
  return key ? t(key) : label;
}

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
