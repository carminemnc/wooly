// components/import.js — Import patterns from JSON or HTML files

import { createPattern, createSection, createBlock, createRow, createId } from '../model.js';
import { savePattern } from '../store.js';
import { navigate } from '../app.js';
import { toast } from './toast.js';
import { t } from '../i18n.js';

export function importFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html,.json,.wooly.json';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      let pattern = null;

      if (file.name.endsWith('.json')) {
        pattern = importJSON(content);
      } else if (file.name.endsWith('.html')) {
        pattern = importHTML(content);
      }

      if (pattern) {
        savePattern(pattern);
        toast(t('import') + ' ✓');
        navigate('editor', pattern.id);
        history.pushState({ view: 'editor', patternId: pattern.id }, '');
      } else {
        toast('⚠️ File non valido');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function importJSON(content) {
  try {
    const data = JSON.parse(content);
    // If it's a valid Wooly pattern, create a new one with fresh ID
    if (data.sections && Array.isArray(data.sections)) {
      return createPattern({
        name: data.name || '',
        lang: data.lang || 'it',
        theme: data.theme || 'light-paper',
        sections: data.sections,
        thumbnail: data.thumbnail || ''
      });
    }
    return null;
  } catch (e) {
    return null;
  }
}

function importHTML(content) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const canvas = doc.querySelector('.canvas');
    if (!canvas) return null;

    const name = doc.querySelector('title')?.textContent || doc.querySelector('.header h1')?.textContent || '';
    const sections = [];

    canvas.querySelectorAll('.section').forEach(secEl => {
      const section = parseSection(secEl);
      if (section) sections.push(section);
    });

    if (sections.length === 0) return null;

    return createPattern({
      name: name,
      sections: sections
    });
  } catch (e) {
    return null;
  }
}

function parseSection(el) {
  const titleEl = el.querySelector('.section-title');
  const title = titleEl ? titleEl.textContent.trim() : '';
  const halfWidth = el.classList.contains('col-half');

  // Detect type by content
  if (el.querySelector('.abbr-grid')) {
    return parseAbbreviations(el, halfWidth);
  }
  if (el.querySelector('.timeline')) {
    return parseSteps(el, halfWidth);
  }
  if (el.querySelector('.field')) {
    return parseFields(el, title, halfWidth);
  }
  if (el.querySelector('.long-text')) {
    return parseLongText(el, title, halfWidth);
  }

  return null;
}

function parseFields(el, title, halfWidth) {
  const fields = [];
  el.querySelectorAll('.field').forEach(fieldEl => {
    const label = fieldEl.querySelector('.field-label')?.textContent.trim() || '';
    const value = fieldEl.querySelector('.field-value')?.textContent.trim() || '';
    fields.push({ label, value });
  });

  // Determine type by title
  const titleLower = title.toLowerCase();
  let type = 'materials';
  if (titleLower.includes('tens') || titleLower.includes('gauge')) {
    type = 'gauge';
  }

  const section = createSection(type);
  section.fields = fields;
  section.halfWidth = halfWidth;
  return section;
}

function parseAbbreviations(el, halfWidth) {
  const items = [];
  el.querySelectorAll('.abbr-item').forEach(itemEl => {
    const key = itemEl.querySelector('.abbr-key')?.textContent.trim() || '';
    const val = itemEl.querySelector('.abbr-val')?.textContent.trim() || '';
    items.push({ key, val });
  });

  const section = createSection('abbreviations');
  section.items = items;
  section.halfWidth = halfWidth;
  return section;
}

function parseSteps(el, halfWidth) {
  const blocks = [];
  el.querySelectorAll('.steps-block').forEach(blockEl => {
    const title = blockEl.querySelector('.steps-header')?.textContent.trim() || '';
    const rows = [];
    let num = 1;
    blockEl.querySelectorAll('.timeline-step').forEach(stepEl => {
      const text = stepEl.querySelector('.timeline-text')?.textContent.trim() || '';
      const tip = stepEl.querySelector('.timeline-tip')?.textContent.trim() || '';
      rows.push(createRow(num++, { text, tip }));
    });
    // Also check for notes
    blockEl.querySelectorAll('.timeline-note').forEach((noteEl, i) => {
      if (rows[i]) rows[i].note = noteEl.textContent.trim();
    });
    blocks.push(createBlock({ title, rows: rows.length > 0 ? rows : undefined }));
  });

  // If no .steps-block found, try parsing timeline directly
  if (blocks.length === 0) {
    const rows = [];
    let num = 1;
    el.querySelectorAll('.timeline-step').forEach(stepEl => {
      const text = stepEl.querySelector('.timeline-text')?.textContent.trim() || '';
      rows.push(createRow(num++, { text }));
    });
    if (rows.length > 0) blocks.push(createBlock({ rows }));
  }

  const section = createSection('steps');
  section.blocks = blocks;
  section.halfWidth = halfWidth;
  return section;
}

function parseLongText(el, title, halfWidth) {
  const content = el.querySelector('.long-text')?.textContent.trim() || '';
  const titleLower = title.toLowerCase();

  let type = 'instructions';
  if (titleLower.includes('note') || titleLower.includes('notes')) {
    type = 'notes';
  } else if (!titleLower.includes('istruz') && !titleLower.includes('instruct')) {
    type = 'custom';
  }

  const section = createSection(type, { title, content });
  section.content = content;
  section.halfWidth = halfWidth;
  return section;
}
