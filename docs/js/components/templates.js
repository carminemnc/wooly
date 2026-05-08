// components/templates.js — Built-in and custom pattern templates

import { createSection, createBlock, createRow, createPattern } from '../model.js';
import { getTemplates, saveTemplate } from '../store.js';
import { t } from '../i18n.js';

export function getBuiltinTemplates() {
  return [
    {
      id: 'tpl-scarf',
      name: '🧣 Sciarpa',
      sections: [
        createSection('info'),
        createSection('materials'),
        createSection('measurements'),
        createSection('abbreviations'),
        createSection('gauge'),
        createSection('steps'),
        createSection('instructions'),
        createSection('notes')
      ]
    },
    {
      id: 'tpl-hat',
      name: '🧢 Cappello',
      sections: [
        createSection('info'),
        createSection('materials'),
        createSection('measurements'),
        createSection('abbreviations'),
        createSection('gauge'),
        { ...createSection('steps'), blocks: [
          createBlock({ title: 'Bordo' }),
          createBlock({ title: 'Corpo' }),
          createBlock({ title: 'Diminuzioni' })
        ]},
        createSection('notes')
      ]
    },
    {
      id: 'tpl-socks',
      name: '🧦 Calzini',
      sections: [
        createSection('info'),
        createSection('materials'),
        createSection('measurements'),
        createSection('abbreviations'),
        createSection('gauge'),
        { ...createSection('steps'), blocks: [
          createBlock({ title: 'Polsino' }),
          createBlock({ title: 'Gamba' }),
          createBlock({ title: 'Tallone' }),
          createBlock({ title: 'Piede' }),
          createBlock({ title: 'Punta' })
        ]},
        createSection('notes')
      ]
    },
    {
      id: 'tpl-sweater',
      name: '🧥 Maglione',
      sections: [
        createSection('info'),
        createSection('materials'),
        createSection('measurements'),
        createSection('abbreviations'),
        createSection('gauge'),
        { ...createSection('steps'), blocks: [
          createBlock({ title: 'Dietro' }),
          createBlock({ title: 'Davanti' }),
          createBlock({ title: 'Maniche' }),
          createBlock({ title: 'Collo' })
        ]},
        createSection('instructions'),
        createSection('notes')
      ]
    }
  ];
}

export function getAllTemplates() {
  return [...getBuiltinTemplates(), ...getCustomTemplates()];
}

export function getCustomTemplates() {
  return getTemplates();
}

export function savePatternAsTemplate(pattern) {
  const template = {
    id: 'tpl-custom-' + Date.now(),
    name: '📌 ' + (pattern.name || 'Template'),
    sections: JSON.parse(JSON.stringify(pattern.sections))
  };
  // Clear content but keep structure
  template.sections.forEach(sec => {
    if (sec.fields) sec.fields.forEach(f => { f.value = ''; });
    if (sec.items) sec.items.forEach(i => { i.key = i.key; i.val = ''; });
    if (sec.blocks) sec.blocks.forEach(b => {
      b.title = b.title;
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
