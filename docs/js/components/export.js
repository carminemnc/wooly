// components/export.js — Export pattern as HTML, PDF, JSON

import { t, getLang } from '../i18n.js';
import { getThemes } from '../themes.js';
import { toast } from './toast.js';

export function exportPDF() {
  window.print();
}

export function exportJSON(pattern) {
  const data = JSON.stringify(pattern, null, 2);
  download(data, (pattern.name || 'pattern') + '.wooly.json', 'application/json');
  toast(t('export') + ' JSON ✓');
}

export function exportHTML(pattern) {
  const html = buildHTML(pattern);
  download(html, (pattern.name || 'schema-maglia') + '.html', 'text/html');
  toast(t('export') + ' HTML ✓');
}

function buildHTML(pattern) {
  const theme = getThemes().find(th => th.id === pattern.theme) || getThemes()[5];
  const cssVars = Object.keys(theme.vars).map(k => `  ${k}: ${theme.vars[k]};`).join('\n');
  const lang = pattern.lang || getLang();

  const sections = pattern.sections.map(sec => renderSectionHTML(sec, lang)).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pattern.name || 'Schema a Maglia')}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
:root {
${cssVars}
}
${getExportCSS()}
  </style>
</head>
<body>
  <div class="canvas">
    ${pattern.name || pattern.thumbnail ? `<header class="header">
      ${pattern.thumbnail ? `<img class="header-img" src="${pattern.thumbnail}" alt="">` : ''}
      ${pattern.name ? `<h1>${escapeHtml(pattern.name)}</h1>` : ''}
    </header>` : ''}
    ${sections}
  </div>
</body>
</html>`;
}

function renderSectionHTML(section, lang) {
  const half = section.halfWidth ? ' col-half' : '';
  const title = getSectionTitle(section, lang);

  switch (section.type) {
    case 'materials':
    case 'gauge':
      const fields = section.fields
        .filter(f => f.value)
        .map(f => `      <div class="field"><span class="field-label">${translateLabel(f.label, lang)}</span><span class="field-value">${escapeHtml(f.value)}</span></div>`)
        .join('\n');
      if (!fields) return '';
      return `    <div class="section${half}">
      <div class="section-title">${title}</div>
${fields}
    </div>`;

    case 'abbreviations':
      const items = section.items
        .filter(i => i.key || i.val)
        .map(i => `        <div class="abbr-item"><span class="abbr-key">${escapeHtml(i.key)}</span><span class="abbr-val">${escapeHtml(i.val)}</span></div>`)
        .join('\n');
      if (!items) return '';
      return `    <div class="section${half}">
      <div class="section-title">${title}</div>
      <div class="abbr-grid">
${items}
      </div>
    </div>`;

    case 'steps':
      const blocks = section.blocks.map(block => {
        const rows = block.rows
          .map(row => {
            let rowHtml = `          <div class="timeline-step">
            <span class="timeline-num">${lang === 'en' ? 'row' : 'riga'} ${row.num}</span>
            <div class="timeline-content">
              <div class="timeline-text">${escapeHtml(row.text)}</div>`;
            if (row.tip) {
              rowHtml += `\n              <div class="timeline-tip">${escapeHtml(row.tip)}</div>`;
            }
            rowHtml += `\n            </div>\n          </div>`;
            if (row.note) {
              rowHtml += `\n          <div class="timeline-note">${escapeHtml(row.note)}</div>`;
            }
            return rowHtml;
          }).join('\n');

        return `      <div class="steps-block">
        ${block.title ? `<div class="steps-header">${escapeHtml(block.title)}</div>` : ''}
        <div class="timeline">
${rows}
        </div>
      </div>`;
      }).join('\n');

      return `    <div class="section${half}">
      <div class="section-title">${title}</div>
${blocks}
    </div>`;

    case 'instructions':
    case 'notes':
    case 'custom':
      if (!section.content) return '';
      const sectionTitle = section.type === 'custom' ? escapeHtml(section.title || title) : title;
      return `    <div class="section${half}">
      <div class="section-title">${sectionTitle}</div>
      <div class="long-text">${escapeHtml(section.content)}</div>
    </div>`;

    default:
      return '';
  }
}

function getSectionTitle(section, lang) {
  const titles = {
    materials: { it: 'Materiali', en: 'Materials' },
    abbreviations: { it: 'Abbreviazioni', en: 'Abbreviations' },
    gauge: { it: 'Tensione', en: 'Gauge' },
    steps: { it: 'Steps', en: 'Steps' },
    instructions: { it: 'Istruzioni', en: 'Instructions' },
    notes: { it: 'Note', en: 'Notes' },
    custom: { it: 'Sezione', en: 'Section' }
  };
  const entry = titles[section.type];
  return entry ? entry[lang] || entry['it'] : 'Sezione';
}

function translateLabel(label, lang) {
  if (lang !== 'en') return label;
  const map = { 'Filato': 'Yarn', 'Quantità': 'Quantity', 'Ferri': 'Needles', 'Accessori': 'Notions', 'Campione': 'Swatch', 'Maglie': 'Stitches' };
  return map[label] || label;
}

function getExportCSS() {
  return `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); padding: 24px; }
.canvas { max-width: 800px; margin: 0 auto; background: var(--bg-surface); border-radius: 10px; border: 1px solid var(--bg-surface-border); padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.canvas > .header, .canvas > .section { grid-column: 1 / -1; }
.canvas > .section.col-half { grid-column: span 1; }
.header { margin-bottom: 28px; display: flex; align-items: center; gap: 20px; }
.header-img { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; }
.header h1 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--text); }
.section { margin-bottom: 20px; border: 1px solid var(--section-border); border-radius: 8px; padding: 16px 20px; }
.section-title { font-size: .62rem; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--accent-border); }
.field { display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 6px; align-items: baseline; }
.field-label { font-size: .75rem; font-weight: 600; color: var(--text-muted); }
.field-value { font-size: .85rem; color: var(--text); border-bottom: 1px dotted var(--field-border); padding-bottom: 2px; }
.abbr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
.abbr-item { display: grid; grid-template-columns: 44px 1fr; gap: 6px; align-items: baseline; }
.abbr-key { font-size: .75rem; font-weight: 700; color: var(--accent); }
.abbr-val { font-size: .78rem; color: var(--text-muted); border-bottom: 1px dotted var(--abbr-border); }
.steps-block { margin-bottom: 16px; }
.steps-header { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--section-border); }
.timeline { display: flex; flex-direction: column; }
.timeline-step { display: grid; grid-template-columns: 48px 1fr; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--section-border); }
.timeline-step:last-of-type { border-bottom: none; }
.timeline-num { font-size: .62rem; font-weight: 700; color: var(--accent); text-transform: uppercase; padding-top: 3px; }
.timeline-text { font-size: .85rem; line-height: 1.6; white-space: pre-wrap; }
.timeline-tip { font-size: .78rem; font-style: italic; color: var(--tip-color); background: var(--tip-bg); padding: 4px 8px; border-radius: 4px; margin-top: 4px; }
.timeline-note { font-size: .78rem; font-style: italic; background: var(--note-bg); border-left: 3px solid var(--accent-border); padding: 6px 12px; margin: 4px 0; border-radius: 0 4px 4px 0; }
.long-text { font-size: .85rem; line-height: 1.8; white-space: pre-wrap; }
@media (max-width: 600px) { .canvas { grid-template-columns: 1fr; padding: 20px; } .canvas > .section.col-half { grid-column: 1 / -1; } }
@media print { body { background: #fff; padding: 0; } .canvas { border: none; max-width: 100%; padding: 20px; } .section { break-inside: avoid; } }`;
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
