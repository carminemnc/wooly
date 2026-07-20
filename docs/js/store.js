// store.js — localStorage CRUD for patterns

import { createPattern } from './model.js';
import { t } from './i18n.js';

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
    const pattern = JSON.parse(localStorage.getItem(PATTERN_PREFIX + id));
    return pattern ? migratePattern(pattern) : pattern;
  } catch (e) {
    return null;
  }
}

// --- Legacy migration ---
// Older patterns stored field labels as language-specific strings
// ({ label: 'Filato' }). The model now uses semantic keys ({ key: 'yarn' }),
// resolved to a display string via i18n at render time. Map every known
// legacy label (Italian and the English variants an export could contain)
// to its canonical key so old and imported patterns render correctly.
const FIELD_KEY_MAP = {
  'Autore': 'author', 'Author': 'author',
  'Difficoltà': 'difficulty', 'Difficulty': 'difficulty',
  'Categoria': 'category', 'Category': 'category',
  'Taglie': 'sizes', 'Sizes': 'sizes',
  'Costruzione': 'construction', 'Construction': 'construction',
  'Tecniche': 'techniques', 'Techniques': 'techniques',
  'Larghezza': 'width', 'Width': 'width',
  'Lunghezza': 'length', 'Length': 'length',
  'Circonferenza': 'circumference', 'Circumference': 'circumference',
  'Filato': 'yarn', 'Yarn': 'yarn',
  'Quantità': 'quantity', 'Quantity': 'quantity',
  'Metraggio': 'yardage', 'Yardage': 'yardage',
  'Ferri': 'needles', 'Needles': 'needles',
  'Accessori': 'notions', 'Notions': 'notions', 'Accessories': 'notions',
  'Campione': 'swatch', 'Swatch': 'swatch',
  'Maglie': 'stitches', 'Stitches': 'stitches'
};

function migratePattern(pattern) {
  if (!pattern.sections) return pattern;
  pattern.sections.forEach(section => {
    if (!section.fields) return;
    section.fields.forEach(field => {
      if (field.key) return; // already migrated
      if (field.label) {
        field.key = FIELD_KEY_MAP[field.label] || field.label;
        delete field.label;
      }
    });
  });
  return pattern;
}

export function savePattern(pattern) {
  pattern.modified = new Date().toISOString();
  const key = PATTERN_PREFIX + pattern.id;
  const hadPrevious = localStorage.getItem(key) !== null;

  try {
    localStorage.setItem(key, JSON.stringify(pattern));
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

  // The pattern and its index entry must land together. If the index write
  // fails on quota, roll back the pattern write so we never leave an orphaned
  // record that occupies space but is invisible in the list.
  if (!saveIndex(index)) {
    if (hadPrevious) {
      // Best-effort: nothing safe to restore (the old value is gone), but at
      // least keep the entry — the data is still readable.
    } else {
      localStorage.removeItem(key);
    }
    return false;
  }
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
    name: original.name + t('copy_suffix'),
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
  const templates = getTemplates().filter(tpl => tpl.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
