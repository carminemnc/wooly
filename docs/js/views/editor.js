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
import { ICONS } from '../components/icons.js';

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
    <button class="btn-icon btn-icon-sm" id="btn-theme-editor">${ICONS.theme}</button>
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
          ${pattern.thumbnail ? `<img src="${pattern.thumbnail}" alt="" class="img-preview"><button class="img-box-remove" id="img-box-remove">×</button>` : '<span class="img-placeholder">📷</span>'}
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
      ${pattern.images && pattern.images[0] ? `<img src="${pattern.images[0]}" alt="" class="img-slot-preview"><button class="img-slot-remove" data-slot="0">×</button>` : '<span class="img-slot-placeholder">\ud83d\udcf7</span>'}
      <input type="file" accept="image/*" data-slot="0">
    </div>
    <div class="img-slot" id="img-slot-1">
      ${pattern.images && pattern.images[1] ? `<img src="${pattern.images[1]}" alt="" class="img-slot-preview"><button class="img-slot-remove" data-slot="1">×</button>` : '<span class="img-slot-placeholder">\ud83d\udcf7</span>'}
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

  // Force plain text paste on all contenteditable fields
  container.addEventListener('paste', (e) => {
    const target = e.target;
    if (target.isContentEditable) {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
  });
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

  const title = getSectionTitle(section);
  const isCustom = section.type === 'custom';
  el.innerHTML = `
    <div class="section-header">
      <span class="section-drag-handle">☰</span>
      <span class="section-title">${title}</span>
      ${isCustom ? `<button class="section-rename-btn" aria-label="${t('aria_rename')}">✏️</button>` : ''}
      <button class="section-menu-btn" aria-label="${t('aria_menu')}">⋯</button>
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

      const saveSetBtn = document.createElement('button');
      saveSetBtn.className = 'btn-load-set';
      saveSetBtn.textContent = t('save_abbr_set');
      saveSetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!section.items || !section.items.some(i => (i.key && i.key.trim()) || (i.val && i.val.trim()))) {
          toast(t('no_abbr_to_save'));
          return;
        }
        showPromptModal(t('set_name_prompt'), (name) => {
          saveAbbrSet(name, section.items);
          toast(t('save_abbr_set') + ' ✓');
        });
      });
      abbrToolbar.appendChild(saveSetBtn);
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
      stepsIntro.dataset.placeholder = ph('section-intro');
      if (section.intro) stepsIntro.textContent = section.intro;
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
      stepsOutro.dataset.placeholder = ph('section-outro');
      if (section.outro) stepsOutro.textContent = section.outro;
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
      textEl.dataset.placeholder = ph('long-text');
      if (section.content) textEl.textContent = section.content;
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
      addVideoBtn.textContent = t('add_link');
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
    <span class="cover-label">${escapeHtml(fieldLabel(field))}</span>
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
    <span class="field-label">${escapeHtml(fieldLabel(field))}</span>
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
    <button class="abbr-del">×</button>
    <span class="abbr-key" contenteditable="true">${escapeHtml(item.key)}</span>
    <span class="abbr-val" contenteditable="true">${escapeHtml(item.val)}</span>
  `;
  el.querySelector('.abbr-del').addEventListener('click', () => {
    section.items.splice(idx, 1);
    scheduleSave();
    // Re-render all abbreviations to fix indices
    const grid = el.parentNode;
    grid.innerHTML = '';
    section.items.forEach((it, i) => {
      grid.appendChild(createAbbrEl(it, section, i));
    });
  });
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
    badge.textContent = collapsed ? block.rows.length + ' ' + t('rows_count') : '';
  });
  headerRow.appendChild(collapseBtn);

  const header = document.createElement('div');
  header.className = 'steps-header';
  header.contentEditable = 'true';
  header.dataset.placeholder = ph('steps-header');
  if (block.title) header.textContent = block.title;
  header.addEventListener('input', () => {
    block.title = header.innerText;
    scheduleSave();
  });
  headerRow.appendChild(header);

  const badge = document.createElement('span');
  badge.className = 'block-row-badge';
  badge.textContent = startCollapsed ? block.rows.length + ' ' + t('rows_count') : '';
  headerRow.appendChild(badge);

  const dupBtn = document.createElement('button');
  dupBtn.className = 'block-dup-btn';
  dupBtn.textContent = '⧉';
  dupBtn.title = t('duplicate_piece');
  dupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const copy = JSON.parse(JSON.stringify(block));
    copy.id = createId();
    copy.title = block.title + t('copy_suffix');
    copy.rows.forEach(r => { r.id = createId(); });
    const blockIdx = section.blocks.indexOf(block);
    section.blocks.splice(blockIdx + 1, 0, copy);
    scheduleSave();
    const newEl = createBlockEl(copy, section);
    el.after(newEl);
    toast(t('duplicate') + ' ✓');
  });
  headerRow.appendChild(dupBtn);

  const delBtn = document.createElement('button');
  delBtn.className = 'block-del-btn';
  delBtn.textContent = '×';
  delBtn.title = t('delete_piece');
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showConfirmModal(
      t('delete_piece_confirm'),
      () => {
        const blockIdx = section.blocks.indexOf(block);
        if (blockIdx > -1) {
          section.blocks.splice(blockIdx, 1);
          scheduleSave();
          el.remove();
          toast(t('delete') + ' ✓');
        }
      }
    );
  });
  headerRow.appendChild(delBtn);

  el.appendChild(headerRow);
  if (startCollapsed) el.classList.add('collapsed');

  // Intro
  const intro = document.createElement('div');
  intro.className = 'block-intro';
  intro.contentEditable = 'true';
  intro.dataset.placeholder = ph('block-intro');
  if (block.intro) intro.textContent = block.intro;
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
  outro.dataset.placeholder = ph('block-outro');
  if (block.outro) outro.textContent = block.outro;
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
  block.rows.forEach((r) => {
    r.num = num;
    num += r.repeat || 1;
  });
  // Match DOM steps to rows by id, not by position: after a drag the two
  // sequences can diverge for a frame, and indexing by position would paint
  // a row's number onto the wrong element.
  timeline.querySelectorAll('.timeline-step').forEach((el) => {
    const row = block.rows.find(r => r.id === el.dataset.rowId);
    if (!row) return;
    const numEl = el.querySelector('.timeline-num');
    numEl.textContent = getRowLabel(row);
  });
}

// Pointer-based drag & drop. Native HTML5 drag is unreliable on desktop
// Chrome when the row contains contenteditable fields (the browser prefers
// dragging the text selection), so we drive it with pointer events instead —
// one code path for both mouse and touch.
function initRowDrag(timeline, block) {
  let dragging = null;      // the .timeline-step being dragged
  let startY = 0;
  let started = false;      // movement threshold passed
  const THRESHOLD = 5;

  function clearOver() {
    timeline.querySelectorAll('.timeline-step').forEach(s => s.classList.remove('drag-over'));
  }

  function onPointerDown(e) {
    // Only start from the handle, and only for primary button / touch / pen.
    if (e.button != null && e.button !== 0) return;
    const left = e.target.closest('.timeline-left');
    if (!left) return;
    const step = left.closest('.timeline-step');
    if (!step) return;

    dragging = step;
    startY = e.clientY;
    started = false;
    left.setPointerCapture(e.pointerId);
    left.addEventListener('pointermove', onPointerMove);
    left.addEventListener('pointerup', onPointerUp);
    left.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    if (!started) {
      if (Math.abs(e.clientY - startY) < THRESHOLD) return;
      started = true;
      dragging.classList.add('dragging');
      // Drop any lingering text selection so it doesn't render mid-drag.
      const sel = window.getSelection();
      if (sel && sel.rangeCount) sel.removeAllRanges();
    }
    e.preventDefault();
    // Find the step under the pointer (excluding the dragged one).
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const over = el ? el.closest('.timeline-step') : null;
    clearOver();
    if (over && over !== dragging && timeline.contains(over)) {
      over.classList.add('drag-over');
    }
  }

  function onPointerUp(e) {
    const left = e.currentTarget;
    left.releasePointerCapture(e.pointerId);
    left.removeEventListener('pointermove', onPointerMove);
    left.removeEventListener('pointerup', onPointerUp);
    left.removeEventListener('pointercancel', onPointerUp);

    if (started) {
      const target = timeline.querySelector('.timeline-step.drag-over');
      if (target && target !== dragging) {
        const steps = Array.from(timeline.querySelectorAll('.timeline-step'));
        const fromIdx = steps.indexOf(dragging);
        const toIdx = steps.indexOf(target);
        // Reorder DOM
        if (fromIdx < toIdx) {
          target.parentNode.insertBefore(dragging, target.nextSibling);
        } else {
          target.parentNode.insertBefore(dragging, target);
        }
        // Reorder model (mirror the DOM move)
        const movedRow = block.rows.splice(fromIdx, 1)[0];
        const newIdx = fromIdx < toIdx ? toIdx - 1 : toIdx;
        block.rows.splice(newIdx, 0, movedRow);
        renumberRows(block, timeline);
        scheduleSave();
      }
      if (dragging) dragging.classList.remove('dragging');
    }
    clearOver();
    dragging = null;
    started = false;
  }

  timeline.addEventListener('pointerdown', onPointerDown);
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
    <div class="timeline-left">
      <span class="row-drag-handle">☰</span>
      <span class="timeline-num">${getRowLabel(row)}</span>
      <button class="btn-repeat">×${row.repeat || 1}</button>
    </div>
    <div class="timeline-content">
      <div class="timeline-text" contenteditable="true" data-placeholder="${ph('timeline-text')}">${escapeHtml(row.text)}</div>
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
    <input class="video-label" type="text" placeholder="${t('video_desc_placeholder')}" value="${escapeAttr(link.label)}">
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
      input.placeholder = t('section_name_placeholder');
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
            t('delete_section_confirm'),
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
    pattern.lang = getLang();
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
        box.innerHTML = `<img src="${dataURL}" alt="" class="img-preview"><button class="img-box-remove" id="img-box-remove">\u00d7</button><input type="file" accept="image/*" id="img-input">`;
        bindImageUpload(container);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  const removeBtn = container.querySelector('#img-box-remove');
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pattern.thumbnail = '';
      scheduleSave();
      const box = container.querySelector('#img-box');
      box.innerHTML = `<span class="img-placeholder">\ud83d\udcf7</span><input type="file" accept="image/*" id="img-input">`;
      bindImageUpload(container);
    });
  }
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
          box.innerHTML = `<img src="${dataURL}" alt="" class="img-slot-preview"><button class="img-slot-remove" data-slot="${slot}">\u00d7</button><input type="file" accept="image/*" data-slot="${slot}">`;
          bindSlotUploads(container);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  });
  container.querySelectorAll('.img-slot-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slot = parseInt(btn.dataset.slot);
      if (!pattern.images) pattern.images = ['', ''];
      pattern.images[slot] = '';
      scheduleSave();
      const box = container.querySelector('#img-slot-' + slot);
      box.innerHTML = `<span class="img-slot-placeholder">\ud83d\udcf7</span><input type="file" accept="image/*" data-slot="${slot}">`;
      bindSlotUploads(container);
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
    document.addEventListener('mousedown', function close(e) {
      if (!e.target.closest('.theme-picker-panel') && !e.target.closest('#btn-theme-editor')) {
        panel.remove();
        document.removeEventListener('mousedown', close);
      }
    });
  }, 10);
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
  pdfBtn.textContent = t('print_pdf');
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
          t('delete_set_confirm'),
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
    empty.textContent = t('no_saved_sets');
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
    if (!ok) toast(t('storage_full'));
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

// Resolve a field's display label. Patterns store a semantic key (field.key);
// getPattern() migrates legacy label strings, but guard against a field.label
// slipping through (e.g. mid-migration) by falling back to it verbatim.
function fieldLabel(field) {
  if (field.key) return t(field.key);
  return field.label || '';
}

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Placeholder text for the contenteditable fields, resolved via i18n.
function ph(key) {
  const map = {
    'long-text': 'ph_long_text',
    'timeline-text': 'ph_timeline_text',
    'steps-header': 'ph_steps_header',
    'block-intro': 'ph_block_intro',
    'block-outro': 'ph_block_outro',
    'section-intro': 'ph_section_intro',
    'section-outro': 'ph_section_outro'
  };
  const k = map[key];
  return k ? t(k) : '';
}
