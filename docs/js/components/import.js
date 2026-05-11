// components/import.js — Import patterns from JSON files

import { createPattern, createId } from '../model.js';
import { savePattern } from '../store.js';
import { navigate } from '../app.js';
import { toast } from './toast.js';
import { t } from '../i18n.js';

function ensureIds(sections) {
  if (!sections) return sections;
  return sections.map(sec => {
    if (!sec.id) sec.id = createId();
    if (sec.blocks) {
      sec.blocks = sec.blocks.map(block => {
        if (!block.id) block.id = createId();
        if (block.rows) {
          block.rows = block.rows.map(row => {
            if (!row.id) row.id = createId();
            if (!row.repeat) row.repeat = 1;
            return row;
          });
        } else {
          block.rows = [];
        }
        return block;
      });
    } else if (sec.type === 'steps') {
      sec.blocks = [];
    }
    if (sec.type === 'video' && !sec.links) {
      sec.links = [];
    }
    if (sec.links) {
      sec.links = sec.links.map(link => {
        if (!link.id) link.id = createId();
        return link;
      });
    }
    return sec;
  });
}

function fixNewlines(raw) {
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { result += ch; escaped = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (ch === '\n' && inString) { result += '\\n'; continue; }
    if (ch === '\r' && inString) { continue; }
    result += ch;
  }
  return result;
}

function tryParse(raw) {
  try { return JSON.parse(raw); }
  catch (e) { return JSON.parse(fixNewlines(raw)); }
}

export function importFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = tryParse(ev.target.result);
        if (data.sections && Array.isArray(data.sections)) {
          const sections = ensureIds(data.sections);
          const pattern = createPattern({
            name: data.name || '',
            lang: data.lang || 'it',
            theme: data.theme || 'light',
            sections: sections,
            thumbnail: data.thumbnail || '',
            images: data.images || ['', '']
          });
          savePattern(pattern);
          toast(t('import') + ' \u2713');
          navigate('editor', pattern.id);
          history.pushState({ view: 'editor', patternId: pattern.id }, '');
        } else {
          toast('\u26a0\ufe0f File non valido');
        }
      } catch (err) {
        toast('\u26a0\ufe0f File non valido');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}
