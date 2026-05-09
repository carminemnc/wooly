// components/backup.js — Full backup export/import with merge

import { listPatterns, getPattern, savePattern, getAbbrSets, getTemplates } from '../store.js';
import { toast } from './toast.js';
import { getLang } from '../i18n.js';

const BACKUP_VERSION = 2;

export function exportBackup() {
  const index = listPatterns();
  const patterns = index.map(meta => getPattern(meta.id)).filter(Boolean);

  const backup = {
    version: BACKUP_VERSION,
    date: new Date().toISOString(),
    patterns,
    abbreviationSets: getAbbrSets(),
    templates: getTemplates(),
    theme: localStorage.getItem('wooly-theme') || 'light',
    lang: localStorage.getItem('wooly-lang') || 'it'
  };

  const data = JSON.stringify(backup, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.download = `wooly-backup-${formatDateFile()}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);

  toast(getLang() === 'it' ? 'Backup scaricato ✓' : 'Backup downloaded ✓');
}

export function importBackup(onComplete) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target.result);
        if (!backup.patterns || !Array.isArray(backup.patterns)) {
          toast(getLang() === 'it' ? '⚠️ File non valido' : '⚠️ Invalid file');
          return;
        }
        mergeBackup(backup);
        if (onComplete) onComplete();
      } catch (err) {
        toast(getLang() === 'it' ? '⚠️ Errore nel file' : '⚠️ File error');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function mergeBackup(backup) {
  let added = 0;
  let updated = 0;

  // Merge patterns
  backup.patterns.forEach(incoming => {
    const existing = getPattern(incoming.id);
    if (!existing) {
      // New pattern — add it
      savePattern(incoming);
      added++;
    } else {
      // Exists — keep the most recent
      const incomingDate = new Date(incoming.modified || 0).getTime();
      const existingDate = new Date(existing.modified || 0).getTime();
      if (incomingDate > existingDate) {
        savePattern(incoming);
        updated++;
      }
    }
  });

  // Restore abbreviation sets
  if (backup.abbreviationSets && backup.abbreviationSets.length > 0) {
    localStorage.setItem('wooly-global-abbr', JSON.stringify(backup.abbreviationSets));
  }

  // Merge templates (add missing ones)
  if (backup.templates && backup.templates.length > 0) {
    const existing = getTemplates();
    const existingIds = existing.map(t => t.id);
    const newTemplates = backup.templates.filter(t => !existingIds.includes(t.id));
    if (newTemplates.length > 0) {
      const merged = [...existing, ...newTemplates];
      localStorage.setItem('wooly-templates', JSON.stringify(merged));
    }
  }

  // Restore theme and lang
  if (backup.theme) localStorage.setItem('wooly-theme', backup.theme);
  if (backup.lang) localStorage.setItem('wooly-lang', backup.lang);

  const lang = getLang();
  if (lang === 'it') {
    toast(`Ripristino completato: ${added} nuovi, ${updated} aggiornati ✓`);
  } else {
    toast(`Restore complete: ${added} new, ${updated} updated ✓`);
  }
}

function formatDateFile() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
