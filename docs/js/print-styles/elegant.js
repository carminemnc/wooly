// print-styles/elegant.js — Elegant PDF template

import { tByLang } from '../i18n.js';

export const id = 'elegant';
export const name = 'Elegante';

export function render(pattern, settings) {
  const lang = settings.lang || pattern.lang || 'it';
  const info = pattern.sections.find(s => s.type === 'info');
  const meas = pattern.sections.find(s => s.type === 'measurements');
  const gauge = pattern.sections.find(s => s.type === 'gauge');
  const sections = pattern.sections.filter(s => s.type !== 'info' && s.type !== 'measurements' && s.type !== 'gauge');

  let html = '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="UTF-8">' +
    '<title>' + esc(pattern.name || 'Pattern') + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">' +
    '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>' +
    '<style>' + css() + '</style></head><body><div class="page">';

  if (settings.logo) html += '<div class="logo"><img src="' + settings.logo + '" alt=""></div>';
  if (settings.footer) html += '<div class="header-wrap"><span class="header-footer">' + esc(settings.footer) + '</span></div>';

  html += '<header class="cover">';
  html += '<div class="cover-grid' + (pattern.thumbnail ? '' : ' no-thumb') + '">';
  if (pattern.thumbnail) html += '<div class="cover-left"><img src="' + pattern.thumbnail + '" alt=""></div>';
  html += '<div class="cover-right">';
  if (pattern.name) html += '<h1 class="title">' + esc(pattern.name) + '</h1>';
  html += renderInfo(info, meas, gauge, lang);
  html += '</div></div>';
  html += '</header>';

  // First page: materials + abbreviations side by side
  const matSection = sections.find(s => s.type === 'materials');
  const abbrSection = sections.find(s => s.type === 'abbreviations');
  if (matSection || abbrSection) {
    html += '<div class="first-page-cols">';
    if (matSection) html += renderSection(matSection, lang);
    if (abbrSection) html += renderSection(abbrSection, lang);
    html += '</div>';
  }

  // First page: pattern images
  if (pattern.images && (pattern.images[0] || pattern.images[1])) {
    html += '<div class="pat-images">';
    if (pattern.images[0]) html += '<div class="pat-img"><img src="' + pattern.images[0] + '" alt=""></div>';
    if (pattern.images[1]) html += '<div class="pat-img"><img src="' + pattern.images[1] + '" alt=""></div>';
    html += '</div>';
  }

  // Remaining sections flow naturally after the images (no forced page break).
  // break-inside:avoid on .sec/.blk keeps a section or piece from splitting
  // mid-page, so the layout fills the page without leaving big gaps.

  // Remaining sections (exclude materials and abbreviations already rendered)
  html += '<div class="grid">';
  sections.filter(s => s.type !== 'materials' && s.type !== 'abbreviations').forEach(s => { html += renderSection(s, lang); });
  html += '</div>';



  html += '</div><script>window.onload=function(){if(typeof marked!=="undefined"){marked.setOptions({gfm:true,breaks:true});document.querySelectorAll(".md-content").forEach(function(el){el.innerHTML=marked.parse(el.textContent);});}window.print();}<\/script></body></html>';
  return html;
}

function renderInfo(info, meas, gauge, lang) {
  const hasInfo = info && info.fields.some(f => f.value && f.value.trim());
  const hasMeas = meas && meas.fields.some(f => f.value && f.value.trim());
  const hasGauge = gauge && gauge.fields.some(f => f.value && f.value.trim());
  let h = '';
  if (hasInfo) {
    h += '<div class="info-block">';
    info.fields.filter(f => f.value && f.value.trim()).forEach(f => {
      h += '<div class="info-item"><span class="info-l">' + esc(fieldLabel(f, lang)) + '</span><span class="info-v">' + esc(f.value) + '</span></div>';
    });
    h += '</div>';
  }
  if (hasMeas || hasGauge) {
    h += '<div class="info-sep"></div><div class="info-cols">';
    if (hasMeas) {
      h += '<div class="info-col">';
      meas.fields.filter(f => f.value && f.value.trim()).forEach(f => {
        h += '<div class="info-item"><span class="info-l">' + esc(fieldLabel(f, lang)) + '</span><span class="info-v">' + esc(f.value) + '</span></div>';
      });
      h += '</div>';
    }
    if (hasGauge) {
      h += '<div class="info-col">';
      gauge.fields.filter(f => f.value && f.value.trim()).forEach(f => {
        h += '<div class="info-item"><span class="info-l">' + esc(fieldLabel(f, lang)) + '</span><span class="info-v">' + esc(f.value) + '</span></div>';
      });
      h += '</div>';
    }
    h += '</div>';
  }
  return h;
}

function renderSection(section, lang) {
  const title = getTitle(section, lang);
  const half = section.halfWidth ? ' half' : '';

  switch (section.type) {
    case 'materials':
    case 'gauge': {
      const fields = section.fields.filter(f => f.value && f.value.trim());
      if (!fields.length) return '';
      let h = '<section class="sec' + half + '"><h2 class="sec-t">' + title + '</h2>';
      fields.forEach(f => { h += '<div class="fld"><span class="fld-l">' + esc(fieldLabel(f, lang)) + '</span><span class="fld-v">' + esc(f.value) + '</span></div>'; });
      return h + '</section>';
    }
    case 'abbreviations': {
      const items = section.items.filter(i => (i.key && i.key.trim()) || (i.val && i.val.trim()));
      if (!items.length) return '';
      let h = '<section class="sec' + half + '"><h2 class="sec-t">' + title + '</h2><div class="abbr-g">';
      items.forEach(i => { h += '<div class="ab"><span class="ab-k">' + esc(i.key) + '</span><span class="ab-v">' + esc(i.val) + '</span></div>'; });
      return h + '</div></section>';
    }
    case 'steps': {
      const blocks = section.blocks.filter(b => b.rows.some(r => r.text && r.text.trim()));
      if (!blocks.length) return '';
      let h = '<section class="sec' + half + '"><h2 class="sec-t">' + title + '</h2>';
      if (section.intro && section.intro.trim()) h += '<p class="sec-intro md-content">' + esc(section.intro) + '</p>';
      blocks.forEach((block, i) => {
        h += '<div class="blk">';
        if (block.title) h += '<h3 class="blk-t">' + esc(block.title) + '</h3>';
        if (block.intro && block.intro.trim()) h += '<p class="blk-intro">' + esc(block.intro) + '</p>';
        h += '<div class="rows">';
        block.rows.filter(r => r.text && r.text.trim()).forEach(row => {
          const repeat = row.repeat || 1;
          const rowWord = tByLang('pdf_row', lang);
          const num = repeat > 1
            ? rowWord + ' ' + row.num + '-' + (row.num + repeat - 1)
            : rowWord + ' ' + row.num;
          h += '<div class="row"><span class="row-n">' + num + '</span><span class="row-t">' + esc(row.text) + '</span><div class="row-badges">';
          if (row.tip && row.tip.trim()) h += '<span class="row-tip">' + tByLang('pdf_tip', lang) + esc(row.tip) + '</span>';
          if (row.note && row.note.trim()) h += '<span class="row-note">' + tByLang('pdf_note', lang) + esc(row.note) + '</span>';
          h += '</div></div>';
        });
        h += '</div>';
        if (block.outro && block.outro.trim()) h += '<p class="blk-outro">' + esc(block.outro) + '</p>';
        h += '</div>';
        if (i < blocks.length - 1) h += '<div class="blk-sep"></div>';
      });
      if (section.outro && section.outro.trim()) h += '<p class="sec-outro md-content">' + esc(section.outro) + '</p>';
      return h + '</section>';
    }
    case 'instructions':
    case 'notes':
    case 'custom': {
      if (!section.content || !section.content.trim()) return '';
      const t = section.type === 'custom' ? esc(section.title || title) : title;
      return '<section class="sec' + half + '"><h2 class="sec-t">' + t + '</h2><div class="txt md-content">' + esc(section.content) + '</div></section>';
    }
    case 'video': {
      const links = section.links ? section.links.filter(l => l.url && l.url.trim()) : [];
      if (!links.length) return '';
      let h = '<section class="sec' + half + '"><h2 class="sec-t">' + title + '</h2><div class="video-wrap"><div class="video-grid">';
      links.forEach(l => {
        const url = l.url.trim();
        const label = l.label && l.label.trim() ? esc(l.label) : esc(url);
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=' + encodeURIComponent(url);
        h += '<div class="video-row"><a href="' + esc(url) + '" target="_blank" class="video-link">' + label + '</a><img class="video-qr" src="' + qrUrl + '" alt="QR"></div>';
      });
      return h + '</div></div></section>';
    }
    default: return '';
  }
}
function getTitle(section, lang) {
  // Section titles reuse the shared i18n keys; 'custom' maps to the short
  // 'pdf_section' label (i18n's 'custom' is the longer "Custom section").
  const keyByType = {
    materials: 'materials',
    abbreviations: 'abbreviations',
    gauge: 'gauge',
    steps: 'steps',
    instructions: 'instructions',
    notes: 'notes',
    video: 'video',
    custom: 'pdf_section'
  };
  const key = keyByType[section.type];
  return key ? tByLang(key, lang) : '';
}

// Resolve a field's display label for the PDF. Patterns are migrated to
// semantic keys (field.key) by store.getPattern before reaching here, and the
// keys share the same i18n entries as the editor. The field.label branch only
// covers a legacy pattern rendered without a prior migration (defensive \u2014
// falls back to the raw string).
function fieldLabel(field, lang) {
  if (field.key) return tByLang(field.key, lang);
  return field.label || '';
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function css() {
  // --- Color palette (change these for a different template) ---
  const c = {
    bg: '#fff',
    text: '#1a1a1a',
    textMuted: '#555',
    textLight: '#666',
    textBody: '#333',
    textItalic: '#444',
    accent: '#6B3F1F',
    accentFaint: '#F5E1C8',
    accentSubtle: '#F5E1C8',
    tipBg: '#F5E1C8',
    tipColor: '#1a1a1a',
    noteBg: '#f0e68c',
    noteColor: '#1a1a1a',
    border: '#eee',
    borderLight: '#ddd',
    separator: '#e8e8e8',
  };

  return '*{margin:0;padding:0;box-sizing:border-box}' +
  'body{font-family:"Lora",serif;font-size:9.5pt;line-height:1.5;color:' + c.text + ';background:' + c.bg + ';-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
  '.page{max-width:680px;margin:0 auto;padding:24px 32px}' +
  '.logo{text-align:center;margin-bottom:6px}.logo img{max-height:60px}' +
  '.header-footer{text-align:center;font-size:8.5pt;color:' + c.textMuted + ';font-family:"DM Sans",sans-serif;font-weight:500;margin-bottom:14px;padding:6px 16px;background:' + c.accentSubtle + ';border-radius:20px;display:inline-block}' +
  '.header-wrap{text-align:center}' +
  '.cover{margin-bottom:14px;padding-bottom:10px}' +
  '.title{font-family:"Playfair Display",serif;font-size:18pt;font-weight:700;margin-bottom:8px}' +
  '.cover-grid{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:start}' +
  '.cover-grid.no-thumb{grid-template-columns:1fr}' +
  '.cover-left img{width:150px;height:150px;object-fit:cover;border-radius:6px}' +
  '.cover-right{display:flex;flex-direction:column;gap:2px}' +
  '.pat-images{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}' +
  '.pat-img img{width:100%;max-height:250px;object-fit:contain;border-radius:6px}' +
  '.first-page-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}' +
  '.first-page-cols .sec{margin-bottom:0}' +
  '.info-block{display:flex;flex-direction:column;gap:3px}' +
  '.info-item{display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:baseline}' +
  '.info-l{font-size:7.5pt;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:' + c.text + ';background:' + c.accentFaint + ';padding:1px 4px;border-radius:6px}' +
  '.info-v{font-size:9pt;color:' + c.textBody + '}' +
  '.info-sep{width:100%;height:1px;background:' + c.separator + ';margin:6px 0}' +
  '.info-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
  '.info-col{display:flex;flex-direction:column;gap:3px}' +
  '.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}' +
  '.sec{grid-column:1/-1;margin-bottom:10px;break-inside:avoid;page-break-inside:avoid}' +
  '.sec.half{grid-column:span 1}' +
  '.sec-t{font-family:"Playfair Display",serif;font-size:10pt;font-weight:700;color:' + c.text + ';background:' + c.accentFaint + ';padding:2px 6px;border-radius:8px;margin-bottom:4px}' +
  '.fld{display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:baseline}' +
  '.fld-l{font-size:8pt;font-weight:600;color:' + c.textLight + '}.fld-v{font-size:9.5pt}' +
  '.abbr-g{display:grid;grid-template-columns:1fr 1fr;gap:1px 12px}' +
  '.ab{display:flex;gap:3px;align-items:baseline}' +
  '.ab-k{font-size:7pt;font-weight:700;color:' + c.text + ';background:' + c.accentFaint + ';padding:1px 3px;border-radius:6px}.ab-v{font-size:7pt;color:' + c.textMuted + '}' +
  '.blk{margin-bottom:8px;padding-bottom:6px;break-inside:avoid;page-break-inside:avoid}' +
  '.blk-sep{height:0;border-bottom:1.5px solid ' + c.borderLight + ';margin:6px 0}' +
  '.blk-t{font-family:"Playfair Display",serif;font-size:9pt;font-weight:600;color:' + c.text + ';background:' + c.accentFaint + ';padding:2px 8px;border-radius:8px;margin-bottom:5px;display:inline-block}' +
  '.blk-intro,.blk-outro{font-size:8.5pt;line-height:1.4;font-style:italic;color:' + c.textItalic + ';padding:3px 0}' +
  '.blk-intro{margin-bottom:4px}' +
  '.blk-outro{margin-top:4px}' +
  '.sec-intro{margin-bottom:8px;font-size:9pt;line-height:1.5;color:' + c.textBody + '}' +
  '.sec-outro{margin-top:8px;font-size:9pt;line-height:1.5;color:' + c.textBody + '}' +
  '.rows{display:flex;flex-direction:column}' +
  '.row{display:grid;grid-template-columns:50px 1fr auto;gap:6px;padding:3px 0;border-bottom:1.5px solid ' + c.borderLight + ';align-items:baseline}' +
  '.row:last-child{border-bottom:none}' +
  '.row-n{font-size:6pt;font-weight:700;text-transform:uppercase;color:' + c.text + ';background:' + c.accentFaint + ';padding:1px 3px;border-radius:6px;white-space:nowrap}' +
  '.row-t{font-size:8.5pt;line-height:1.2}' +
  '.row-tip{font-size:7pt;color:' + c.tipColor + ';background:' + c.tipBg + ';padding:2px 7px;border-radius:10px;max-width:200px}' +
  '.row-note{font-size:7pt;color:' + c.noteColor + ';background:' + c.noteBg + ';padding:2px 7px;border-radius:10px;max-width:200px}' +
  '.row-badges{display:flex;flex-direction:column;align-items:flex-end;gap:2px}' +
  '.txt{font-size:9.5pt;line-height:1.5;white-space:pre-wrap;color:' + c.textBody + '}' +
  '.md-content{white-space:normal}' +
  '.md-content p{margin:0 0 4px}' +
  '.md-content p:last-child{margin-bottom:0}' +
  '.md-content h1,.md-content h2,.md-content h3{margin:6px 0 3px;font-family:"Playfair Display",serif;color:' + c.text + '}' +
  '.md-content h1{font-size:12pt}.md-content h2{font-size:10.5pt}.md-content h3{font-size:9.5pt}' +
  '.md-content ul,.md-content ol{padding-left:1.2em;margin:2px 0}' +
  '.md-content li{margin-bottom:1px}' +
  '.md-content blockquote{border-left:2px solid ' + c.accent + ';padding-left:8px;color:' + c.textMuted + ';font-style:italic;margin:4px 0}' +
  '.md-content strong{font-weight:700}.md-content em{font-style:italic}' +
  '.md-content a{color:' + c.accent + ';text-decoration:underline;text-decoration-thickness:0.5px;text-underline-offset:2px}' +
  '.video-wrap{text-align:center}' +
  '.video-grid{display:inline-flex;flex-direction:column;background:' + c.accentFaint + ';border-radius:10px;overflow:hidden}' +
  '.video-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:10px 14px;border-bottom:1px solid ' + c.border + '}' +
  '.video-row:last-child{border-bottom:none}' +
  '.video-link{font-size:8.5pt;color:' + c.accent + ';text-decoration:underline;text-decoration-thickness:0.5px;text-underline-offset:2px;font-weight:500}' +
  '.video-qr{width:60px;height:60px;border-radius:4px}' +
  '@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page{padding:0;max-width:100%}.cover{break-inside:avoid}.sec-t,.blk-t{break-after:avoid}}';
}
