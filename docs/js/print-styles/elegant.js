// print-styles/elegant.js — Elegant PDF template

export const id = 'elegant';
export const name = '✨ Elegante';

export function render(pattern, settings) {
  const accent = settings.accent;
  const lang = pattern.lang || 'it';
  const info = pattern.sections.find(s => s.type === 'info');
  const meas = pattern.sections.find(s => s.type === 'measurements');
  const sections = pattern.sections.filter(s => s.type !== 'info' && s.type !== 'measurements');

  let html = '<!DOCTYPE html><html lang="' + lang + '"><head><meta charset="UTF-8">' +
    '<title>' + esc(pattern.name || 'Pattern') + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">' +
    '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>' +
    '<style>' + css(accent) + '</style></head><body><div class="page">';

  if (settings.logo) html += '<div class="logo"><img src="' + settings.logo + '" alt=""></div>';

  html += '<header class="cover">';
  if (pattern.name) html += '<h1 class="title">' + esc(pattern.name) + '</h1>';
  if (pattern.thumbnail) html += '<div class="hero-img"><img src="' + pattern.thumbnail + '" alt=""></div>';
  html += renderInfo(info, meas);
  html += '</header><div class="divider"></div>';

  html += '<div class="grid">';
  sections.forEach(s => { html += renderSection(s, lang); });
  html += '</div>';

  if (settings.footer) html += '<footer class="footer">' + esc(settings.footer) + '</footer>';

  html += '</div><script>window.onload=function(){if(typeof marked!=="undefined"){marked.setOptions({gfm:true,breaks:true});document.querySelectorAll(".md-content").forEach(function(el){el.innerHTML=marked.parse(el.textContent);});}window.print();}<\/script></body></html>';
  return html;
}

function renderInfo(info, meas) {
  const hasInfo = info && info.fields.some(f => f.value && f.value.trim());
  const hasMeas = meas && meas.fields.some(f => f.value && f.value.trim());
  if (!hasInfo && !hasMeas) return '';
  let h = '<div class="info-block">';
  if (hasInfo) info.fields.filter(f => f.value && f.value.trim()).forEach(f => {
    h += '<div class="info-item"><span class="info-l">' + esc(f.label) + '</span><span class="info-v">' + esc(f.value) + '</span></div>';
  });
  if (hasMeas) {
    h += '<div class="info-sep"></div>';
    meas.fields.filter(f => f.value && f.value.trim()).forEach(f => {
      h += '<div class="info-item"><span class="info-l">' + esc(f.label) + '</span><span class="info-v">' + esc(f.value) + '</span></div>';
    });
  }
  h += '</div>';
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
      fields.forEach(f => { h += '<div class="fld"><span class="fld-l">' + esc(f.label) + '</span><span class="fld-v">' + esc(f.value) + '</span></div>'; });
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
      blocks.forEach(block => {
        h += '<div class="blk">';
        if (block.title) h += '<h3 class="blk-t">' + esc(block.title) + '</h3>';
        if (block.intro && block.intro.trim()) h += '<p class="blk-intro">' + esc(block.intro) + '</p>';
        h += '<div class="rows">';
        block.rows.filter(r => r.text && r.text.trim()).forEach(row => {
          const num = (lang === 'en' ? 'Row' : 'Riga') + ' ' + row.num;
          h += '<div class="row"><span class="row-n">' + num + '</span><span class="row-t">' + esc(row.text) + '</span>';
          if (row.tip && row.tip.trim()) h += '<span class="row-tip">' + (lang === 'en' ? 'Tip: ' : 'Suggerimento: ') + esc(row.tip) + '</span>';
          if (row.note && row.note.trim()) h += '<span class="row-note">' + (lang === 'en' ? 'Note: ' : 'Nota: ') + esc(row.note) + '</span>';
          h += '</div>';
        });
        h += '</div>';
        if (block.outro && block.outro.trim()) h += '<p class="blk-outro">' + esc(block.outro) + '</p>';
        h += '</div>';
      });
      return h + '</section>';
    }
    case 'instructions':
    case 'notes':
    case 'custom': {
      if (!section.content || !section.content.trim()) return '';
      const t = section.type === 'custom' ? esc(section.title || title) : title;
      return '<section class="sec' + half + '"><h2 class="sec-t">' + t + '</h2><div class="txt md-content">' + esc(section.content) + '</div></section>';
    }
    default: return '';
  }
}

function getTitle(section, lang) {
  const map = {
    materials: { it: 'Materiali', en: 'Materials' },
    abbreviations: { it: 'Abbreviazioni', en: 'Abbreviations' },
    gauge: { it: 'Tensione', en: 'Gauge' },
    steps: { it: 'Passaggi', en: 'Steps' },
    instructions: { it: 'Istruzioni', en: 'Instructions' },
    notes: { it: 'Note', en: 'Notes' },
    custom: { it: 'Sezione', en: 'Section' }
  };
  const e = map[section.type];
  return e ? (e[lang] || e['it']) : '';
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function css(a) {
  return '*{margin:0;padding:0;box-sizing:border-box}' +
  'body{font-family:"Lora",serif;font-size:9.5pt;line-height:1.5;color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
  '.page{max-width:680px;margin:0 auto;padding:24px 32px}' +
  '.logo{text-align:center;margin-bottom:8px}.logo img{max-height:40px}' +
  '.cover{text-align:center;margin-bottom:14px;padding-bottom:10px}' +
  '.title{font-family:"Playfair Display",serif;font-size:20pt;font-weight:700;margin-bottom:8px}' +
  '.hero-img{margin:8px auto}.hero-img img{max-width:180px;max-height:180px;object-fit:cover;border-radius:6px}' +
  '.info-block{display:flex;flex-wrap:wrap;gap:3px 16px;justify-content:center;margin-top:8px}' +
  '.info-item{display:flex;gap:4px;align-items:baseline}' +
  '.info-l{font-size:7.5pt;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#1a1a1a;background:' + a + '20;padding:1px 4px;border-radius:2px}' +
  '.info-v{font-size:9pt;color:#333}' +
  '.info-sep{width:100%;height:1px;background:#e8e8e8;margin:3px 0}' +
  '.divider{height:1.5px;background:linear-gradient(to right,transparent,' + a + ',transparent);margin:0 0 12px}' +
  '.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}' +
  '.sec{grid-column:1/-1;margin-bottom:10px;break-inside:avoid}' +
  '.sec.half{grid-column:span 1}' +
  '.sec-t{font-family:"Playfair Display",serif;font-size:10pt;font-weight:700;color:#1a1a1a;background:' + a + '20;padding:2px 6px;border-radius:3px;margin-bottom:4px}' +
  '.fld{display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:baseline}' +
  '.fld-l{font-size:8pt;font-weight:600;color:#666}.fld-v{font-size:9.5pt}' +
  '.abbr-g{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px 12px}' +
  '.ab{display:flex;gap:4px;align-items:baseline}' +
  '.ab-k{font-size:8.5pt;font-weight:700;color:#1a1a1a;background:' + a + '20;padding:1px 3px;border-radius:2px}.ab-v{font-size:8pt;color:#555}' +
  '.blk{margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #1a1a1a}' +
  '.blk:last-child{border-bottom:none}' +
  '.blk-t{font-family:"Playfair Display",serif;font-size:9.5pt;font-weight:600;color:#333;margin-bottom:3px;padding-bottom:2px;border-bottom:1px dotted #ddd}' +
  '.blk-intro,.blk-outro{font-size:8.5pt;line-height:1.4;font-style:italic;color:#444;padding:3px 0}' +
  '.blk-intro{margin-bottom:4px}' +
  '.blk-outro{margin-top:4px}' +
  '.rows{display:flex;flex-direction:column}' +
  '.row{display:grid;grid-template-columns:40px 1fr auto;gap:6px;padding:4px 0;border-bottom:1px solid #ddd;align-items:baseline}' +
  '.row:last-child{border-bottom:none}' +
  '.row-n{font-size:6.5pt;font-weight:700;text-transform:uppercase;color:#1a1a1a;background:' + a + '20;padding:1px 4px;border-radius:2px}' +
  '.row-t{font-size:9pt;line-height:1.3}' +
  '.row-tip{font-size:7pt;color:#fff;background:' + a + ';padding:2px 7px;border-radius:10px;max-width:180px}' +
  '.row-note{font-size:7pt;color:#1a1a1a;background:#f0e68c;padding:2px 7px;border-radius:10px;font-weight:500;max-width:180px}' +
  '.txt{font-size:9.5pt;line-height:1.5;white-space:pre-wrap;color:#333}' +
  '.md-content{white-space:normal}' +
  '.md-content p{margin:0 0 4px}' +
  '.md-content p:last-child{margin-bottom:0}' +
  '.md-content h1,.md-content h2,.md-content h3{margin:6px 0 3px;font-family:"Playfair Display",serif;color:#1a1a1a}' +
  '.md-content h1{font-size:12pt}.md-content h2{font-size:10.5pt}.md-content h3{font-size:9.5pt}' +
  '.md-content ul,.md-content ol{padding-left:1.2em;margin:2px 0}' +
  '.md-content li{margin-bottom:1px}' +
  '.md-content blockquote{border-left:2px solid ' + a + ';padding-left:8px;color:#555;font-style:italic;margin:4px 0}' +
  '.md-content strong{font-weight:700}.md-content em{font-style:italic}' +
  '.md-content a{color:' + a + ';text-decoration:underline}' +
  '.footer{margin-top:14px;padding-top:6px;border-top:1px solid #e0e0e0;text-align:center;font-size:7.5pt;color:#999;font-family:"DM Sans",sans-serif}' +
  '@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page{padding:0;max-width:100%}.sec,.blk,.cover{break-inside:avoid}}';
}
