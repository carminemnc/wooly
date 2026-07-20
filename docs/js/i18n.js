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
  'video': { it: 'Video', en: 'Video' },
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
  'add_tip': { it: '+ suggerimento', en: '+ tip' },
  'add_note': { it: '+ nota', en: '+ note' },

  // Abbreviations
  'add_abbr': { it: '+ Aggiungi', en: '+ Add' },
  'load_abbr_set': { it: 'Carica set', en: 'Load set' },
  'save_abbr_set': { it: 'Salva come set', en: 'Save as set' },
  'set_name_prompt': { it: 'Nome del set:', en: 'Set name:' },

  // Long text
  // (placeholder is in CSS ::before)

  // Actions
  'duplicate_section': { it: 'Duplica', en: 'Duplicate' },
  'delete_section': { it: 'Elimina', en: 'Delete' },
  'toggle_width': { it: 'Cambia larghezza', en: 'Toggle width' },

  // Export
  'export_json': { it: 'Scarica JSON', en: 'Download JSON' },
  'import': { it: 'Importa', en: 'Import' },

  // Theme
  'theme': { it: '🎨 Tema', en: '🎨 Theme' },

  // Templates
  'save_as_template': { it: 'Salva come template', en: 'Save as template' },

  // Misc
  'cancel': { it: 'Annulla', en: 'Cancel' },
  'confirm': { it: 'Conferma', en: 'Confirm' },

  // Editor — pieces & rows
  'rows_count': { it: 'righe', en: 'rows' },
  'add_link': { it: '+ Aggiungi link', en: '+ Add link' },
  'duplicate_piece': { it: 'Duplica pezzo', en: 'Duplicate piece' },
  'delete_piece': { it: 'Elimina pezzo', en: 'Delete piece' },
  'delete_piece_confirm': { it: 'Eliminare questo pezzo?', en: 'Delete this piece?' },
  'copy_suffix': { it: ' (copia)', en: ' (copy)' },
  'video_desc_placeholder': { it: 'Descrizione (opzionale)', en: 'Description (optional)' },
  'section_name_placeholder': { it: 'Nome sezione...', en: 'Section name...' },
  'delete_section_confirm': { it: 'Eliminare questa sezione?', en: 'Delete this section?' },
  'delete_set_confirm': { it: 'Eliminare questo set?', en: 'Delete this set?' },
  'no_saved_sets': { it: 'Nessun set salvato', en: 'No saved sets' },
  'no_abbr_to_save': { it: 'Nessuna abbreviazione da salvare', en: 'No abbreviations to save' },
  'storage_full': { it: '⚠️ Spazio esaurito — impossibile salvare', en: '⚠️ Storage full — cannot save' },
  'print_pdf': { it: 'Stampa PDF', en: 'Print PDF' },

  // Accessibility
  'aria_rename': { it: 'Rinomina', en: 'Rename' },
  'aria_menu': { it: 'Menu', en: 'Menu' },
  'back_to_home': { it: 'Torna alla home', en: 'Back to home' },

  // Pattern list
  'storage_label': { it: 'Spazio: ', en: 'Storage: ' },
  'settings': { it: 'Impostazioni', en: 'Settings' },
  'settings_logo_label': { it: 'Logo (appare in alto su tutti i pattern)', en: 'Logo (appears at top of all patterns)' },
  'settings_footer_label': { it: 'Footer (appare in alto sotto il logo nel PDF)', en: 'Footer (appears at top below logo in PDF)' },
  'settings_upload': { it: 'Clicca per caricare', en: 'Click to upload' },
  'settings_remove_logo': { it: 'Rimuovi logo', en: 'Remove logo' },
  'settings_footer_placeholder': { it: 'es. Seguici su caveoves.it', en: 'e.g. Follow us at caveoves.it' },
  'logo_saved': { it: 'Logo salvato ✓', en: 'Logo saved ✓' },
  'logo_removed': { it: 'Logo rimosso', en: 'Logo removed' },
  'new_empty': { it: '📄 Vuoto', en: '📄 Empty' },
  'new_import': { it: '📥 Importa file', en: '📥 Import file' },
  'delete_template_confirm': { it: 'Eliminare questo template?', en: 'Delete this template?' },
  'template_deleted': { it: 'Template eliminato', en: 'Template deleted' },

  // Markdown toolbar (button tooltips)
  'md_bold': { it: 'Grassetto', en: 'Bold' },
  'md_italic': { it: 'Corsivo', en: 'Italic' },
  'md_h1': { it: 'Titolo 1', en: 'Heading 1' },
  'md_h2': { it: 'Titolo 2', en: 'Heading 2' },
  'md_h3': { it: 'Titolo 3', en: 'Heading 3' },
  'md_ul': { it: 'Lista', en: 'List' },
  'md_ol': { it: 'Lista numerata', en: 'Numbered list' },
  'md_quote': { it: 'Citazione', en: 'Quote' },
  'md_link': { it: 'Link', en: 'Link' },
  // Markdown insertion placeholders
  'md_ph_text': { it: 'testo', en: 'text' },
  'md_ph_heading': { it: 'Titolo', en: 'Heading' },
  'md_ph_item': { it: 'elemento', en: 'item' },
  'md_ph_quote': { it: 'citazione', en: 'quote' },

  // Contenteditable placeholders
  'ph_long_text': { it: 'Clicca per scrivere...', en: 'Click to write...' },
  'ph_timeline_text': { it: 'Descrivi questo passaggio...', en: 'Describe this step...' },
  'ph_steps_header': { it: 'Nome del pezzo...', en: 'Piece name...' },
  'ph_block_intro': { it: 'Indicazioni iniziali...', en: 'Initial instructions...' },
  'ph_block_outro': { it: 'Indicazioni finali...', en: 'Final instructions...' },
  'ph_section_intro': { it: 'Introduzione sezione...', en: 'Section introduction...' },
  'ph_section_outro': { it: 'Conclusione sezione...', en: 'Section conclusion...' },

  // PDF export (resolved via tByLang with the pattern's own language)
  'pdf_row': { it: 'Riga', en: 'Row' },
  'pdf_tip': { it: 'Suggerimento: ', en: 'Tip: ' },
  'pdf_note': { it: 'Nota: ', en: 'Note: ' },
  'pdf_section': { it: 'Sezione', en: 'Section' },

  // Backup
  'backup_downloaded': { it: 'Backup scaricato ✓', en: 'Backup downloaded ✓' },
  'invalid_file': { it: '⚠️ File non valido', en: '⚠️ Invalid file' },
  'file_error': { it: '⚠️ Errore nel file', en: '⚠️ File error' },
  'popup_blocked': { it: '⚠️ Popup bloccato', en: '⚠️ Popup blocked' },
  'restore_summary': { it: 'Ripristino completato: {added} nuovi, {updated} aggiornati ✓', en: 'Restore complete: {added} new, {updated} updated ✓' }
};

let currentLang = localStorage.getItem(STORAGE_KEY) || 'it';

export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry['it'] || key;
}

// Resolve a key in an explicit language, independent of the active UI language.
// Used by the PDF export, which renders in the pattern's own language.
export function tByLang(key, lang) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry['it'] || key;
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
