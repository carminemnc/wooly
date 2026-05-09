// store.js — localStorage CRUD for patterns

import { createPattern } from './model.js';

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
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    return true;
  } catch (e) {
    return false;
  }
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
  try {
    localStorage.setItem(PATTERN_PREFIX + pattern.id, JSON.stringify(pattern));
  } catch (e) {
    return false;
  }

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
  if (!saveIndex(index)) return false;
  return true;
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

// --- Global abbreviation sets ---

export function getAbbrSets() {
  try {
    const raw = JSON.parse(localStorage.getItem(GLOBAL_ABBR_KEY));
    if (!raw || !Array.isArray(raw)) return [{ id: 'default', name: 'Default', items: defaultAbbrItems() }];
    return raw;
  } catch (e) {
    return [{ id: 'default', name: 'Default', items: defaultAbbrItems() }];
  }
}

export function saveAbbrSet(name, items) {
  const sets = getAbbrSets();
  sets.push({ id: Date.now().toString(36), name, items: JSON.parse(JSON.stringify(items)) });
  localStorage.setItem(GLOBAL_ABBR_KEY, JSON.stringify(sets));
}

export function deleteAbbrSet(id) {
  const sets = getAbbrSets().filter(s => s.id !== id);
  localStorage.setItem(GLOBAL_ABBR_KEY, JSON.stringify(sets));
}

export function getGlobalAbbreviations() {
  const sets = getAbbrSets();
  return sets.length > 0 ? sets[0].items : defaultAbbrItems();
}

function defaultAbbrItems() {
  return [
    { key: 'm', val: 'maglia' },
    { key: 'dir', val: 'diritto' },
    { key: 'rov', val: 'rovescio' },
    { key: 'gett', val: 'gettato' },
    { key: 'dim', val: 'diminuzione' },
    { key: 'aum', val: 'aumento' }
  ];
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
