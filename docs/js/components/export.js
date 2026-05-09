// components/export.js — Export pattern as PDF, JSON

import { t } from '../i18n.js';
import { getThemes } from '../themes.js';
import { toast } from './toast.js';
import { getLogo, getFooter } from './settings.js';
import { templates, getTemplate } from '../print-styles/index.js';

// --- PDF ---

export function exportPDF(pattern, templateId) {
  const tpl = getTemplate(templateId);
  const theme = getThemes().find(th => th.id === pattern.theme) || getThemes()[1];
  const settings = {
    accent: theme.vars['--accent'] || '#5A7A6A',
    logo: getLogo(),
    footer: getFooter()
  };
  const html = tpl.render(pattern, settings);
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

export function getPrintTemplates() {
  return templates.map(t => ({ id: t.id, name: t.name }));
}

// --- JSON ---

export function exportJSON(pattern) {
  const data = JSON.stringify(pattern, null, 2);
  download(data, (pattern.name || 'pattern') + '.wooly.json', 'application/json');
  toast(t('export') + ' JSON \u2713');
}

// --- Helpers ---

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}
