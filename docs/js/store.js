// store.js — localStorage CRUD for patterns

import { createPattern, createSection } from './model.js';

const INDEX_KEY = 'wooly-index';
const PATTERN_PREFIX = 'wooly-p-';
const GLOBAL_ABBR_KEY = 'wooly-global-abbr';
const TEMPLATES_KEY = 'wooly-templates';

// --- Index (list of pattern metadata) ---

function getIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveIndex(index) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

// --- Pattern CRUD ---

export function listPatterns() {
  return getIndex();
}

export function getPattern(id) {
  try {
    return JSON.parse(localStorage.getItem(PATTERN_PREFIX + id));
  } catch (e) {
    return null;
  }
}

export function savePattern(pattern) {
  pattern.modified = new Date().toISOString();
  localStorage.setItem(PATTERN_PREFIX + pattern.id, JSON.stringify(pattern));

  const index = getIndex();
  const entry = index.find(e => e.id === pattern.id);
  const meta = {
    id: pattern.id,
    name: pattern.name,
    modified: pattern.modified,
    thumbnail: pattern.thumbnail,
    archived: pattern.archived || false
  };

  if (entry) {
    Object.assign(entry, meta);
  } else {
    index.unshift(meta);
  }
  saveIndex(index);
}

export function deletePattern(id) {
  localStorage.removeItem(PATTERN_PREFIX + id);
  const index = getIndex().filter(e => e.id !== id);
  saveIndex(index);
}

export function newPattern(opts = {}) {
  // Use global abbreviations for new patterns
  if (!opts.sections) {
    const globalAbbr = getGlobalAbbreviations();
    const pattern = createPattern(opts);
    const abbrSection = pattern.sections.find(s => s.type === 'abbreviations');
    if (abbrSection && globalAbbr.length > 0) {
      abbrSection.items = JSON.parse(JSON.stringify(globalAbbr));
    }
    savePattern(pattern);
    return pattern;
  }
  const pattern = createPattern(opts);
  savePattern(pattern);
  return pattern;
}

export function duplicatePattern(id) {
  const original = getPattern(id);
  if (!original) return null;
  const copy = createPattern({
    ...original,
    id: undefined,
    name: original.name + ' (copia)',
    created: undefined
  });
  copy.sections = JSON.parse(JSON.stringify(original.sections));
  savePattern(copy);
  return copy;
}

// --- Global abbreviations ---

export function getGlobalAbbreviations() {
  try {
    return JSON.parse(localStorage.getItem(GLOBAL_ABBR_KEY)) || [
      { key: 'm', val: 'maglia' },
      { key: 'dir', val: 'diritto' },
      { key: 'rov', val: 'rovescio' },
      { key: 'gett', val: 'gettato' },
      { key: 'dim', val: 'diminuzione' },
      { key: 'aum', val: 'aumento' }
    ];
  } catch (e) {
    return [];
  }
}

export function saveGlobalAbbreviations(items) {
  localStorage.setItem(GLOBAL_ABBR_KEY, JSON.stringify(items));
}

// --- Templates ---

export function getTemplates() {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export function saveTemplate(template) {
  const templates = getTemplates();
  templates.push(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteTemplate(id) {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
