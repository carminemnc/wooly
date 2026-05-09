// i18n.js — Internationalization IT/EN

const STORAGE_KEY = 'wooly-lang';

const translations = {
  // Pattern list
  'new_pattern': { it: '+ Nuovo pattern', en: '+ New pattern' },
  'no_patterns': { it: 'Nessun pattern ancora.', en: 'No patterns yet.' },
  'no_patterns_hint': { it: 'Creane uno nuovo per iniziare!', en: 'Create one to get started!' },
  'archive': { it: 'Archivio', en: 'Archive' },
  'duplicate': { it: 'Duplica', en: 'Duplicate' },
  'archive_action': { it: 'Archivia', en: 'Archive' },
  'restore': { it: 'Ripristina', en: 'Restore' },
  'delete': { it: 'Elimina', en: 'Delete' },
  'delete_confirm': { it: 'Eliminare questo pattern?', en: 'Delete this pattern?' },
  'unnamed': { it: 'Senza nome', en: 'Unnamed' },

  // Editor
  'pattern_name_placeholder': { it: 'Nome del pattern...', en: 'Pattern name...' },
  'saved': { it: 'Salvato ✓', en: 'Saved ✓' },
  'saving': { it: 'Salvando...', en: 'Saving...' },
  'add_section': { it: '+ Sezione', en: '+ Section' },
  'export': { it: '↗ Esporta', en: '↗ Export' },

  // Sections
  'materials': { it: 'Materiali', en: 'Materials' },
  'abbreviations': { it: 'Abbreviazioni', en: 'Abbreviations' },
  'gauge': { it: 'Tensione', en: 'Gauge' },
  'steps': { it: 'Passaggi', en: 'Steps' },
  'instructions': { it: 'Istruzioni', en: 'Instructions' },
  'notes': { it: 'Note', en: 'Notes' },
  'custom': { it: 'Sezione libera', en: 'Custom section' },
  'info': { it: 'Info Pattern', en: 'Pattern Info' },
  'measurements': { it: 'Misure', en: 'Measurements' },

  // Fields
  'yarn': { it: 'Filato', en: 'Yarn' },
  'quantity': { it: 'Quantità', en: 'Quantity' },
  'yardage': { it: 'Metraggio', en: 'Yardage' },
  'needles': { it: 'Ferri', en: 'Needles' },
  'notions': { it: 'Accessori', en: 'Notions' },
  'swatch': { it: 'Campione', en: 'Swatch' },
  'stitches': { it: 'Maglie', en: 'Stitches' },
  'author': { it: 'Autore', en: 'Author' },
  'difficulty': { it: 'Difficoltà', en: 'Difficulty' },
  'category': { it: 'Categoria', en: 'Category' },
  'sizes': { it: 'Taglie', en: 'Sizes' },
  'construction': { it: 'Costruzione', en: 'Construction' },
  'techniques': { it: 'Tecniche', en: 'Techniques' },
  'width': { it: 'Larghezza', en: 'Width' },
  'length': { it: 'Lunghezza', en: 'Length' },
  'circumference': { it: 'Circonferenza', en: 'Circumference' },

  // Steps
  'row': { it: 'riga', en: 'row' },
  'add_row': { it: '+ Aggiungi passaggio', en: '+ Add row' },
  'add_piece': { it: '+ Aggiungi pezzo', en: '+ Add piece' },
  'piece_placeholder': { it: 'Nome del pezzo...', en: 'Piece name...' },
  'row_placeholder': { it: 'Descrivi questo passaggio...', en: 'Describe this step...' },
  'add_tip': { it: '+ suggerimento', en: '+ tip' },
  'tip_label': { it: 'Suggerimento: ', en: 'Tip: ' },
  'tip_placeholder': { it: 'Scrivi un suggerimento...', en: 'Write a tip...' },
  'add_note': { it: '+ nota', en: '+ note' },
  'note_label': { it: 'Nota: ', en: 'Note: ' },
  'note_placeholder': { it: 'Scrivi una nota...', en: 'Write a note...' },

  // Abbreviations
  'add_abbr': { it: '+ Aggiungi', en: '+ Add' },
  'load_abbr_set': { it: 'Carica set', en: 'Load set' },
  'save_abbr_set': { it: 'Salva come set', en: 'Save as set' },
  'delete_set': { it: 'Elimina set', en: 'Delete set' },
  'set_name_prompt': { it: 'Nome del set:', en: 'Set name:' },

  // Long text
  'write_placeholder': { it: 'Clicca per scrivere...', en: 'Click to write...' },

  // Actions
  'duplicate_section': { it: 'Duplica', en: 'Duplicate' },
  'delete_section': { it: 'Elimina', en: 'Delete' },
  'toggle_width': { it: 'Cambia larghezza', en: 'Toggle width' },

  // Export
  'export_pdf': { it: 'Stampa PDF', en: 'Print PDF' },
  'export_json': { it: 'Scarica JSON', en: 'Download JSON' },
  'import': { it: 'Importa', en: 'Import' },

  // Theme
  'theme': { it: '🎨 Tema', en: '🎨 Theme' },

  // Templates
  'from_template': { it: 'Da template', en: 'From template' },
  'save_as_template': { it: 'Salva come template', en: 'Save as template' },

  // Misc
  'cancel': { it: 'Annulla', en: 'Cancel' },
  'confirm': { it: 'Conferma', en: 'Confirm' }
};

let currentLang = localStorage.getItem(STORAGE_KEY) || 'it';

export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry['it'] || key;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

export function toggleLang() {
  setLang(currentLang === 'it' ? 'en' : 'it');
}
