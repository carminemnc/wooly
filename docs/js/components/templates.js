// components/templates.js — Built-in and custom pattern templates

import { createPattern } from '../model.js';
import { getTemplates, saveTemplate } from '../store.js';

export function getAllTemplates() {
  return getCustomTemplates();
}

export function getCustomTemplates() {
  return getTemplates();
}

export function savePatternAsTemplate(pattern) {
  const template = {
    id: 'tpl-custom-' + Date.now(),
    name: pattern.name || 'Template',
    sections: JSON.parse(JSON.stringify(pattern.sections))
  };
  // Clear content but keep structure (labels, abbr keys and piece titles stay).
  template.sections.forEach(sec => {
    if (sec.fields) sec.fields.forEach(f => { f.value = ''; });
    if (sec.items) sec.items.forEach(i => { i.val = ''; });
    if (sec.blocks) sec.blocks.forEach(b => {
      b.rows.forEach(r => { r.text = ''; r.tip = ''; r.note = ''; });
    });
    if (sec.content !== undefined) sec.content = '';
  });
  saveTemplate(template);
  return template;
}

export function createPatternFromTemplate(template) {
  return createPattern({
    name: '',
    sections: JSON.parse(JSON.stringify(template.sections))
  });
}
