// components/markdown.js — Markdown rendering + toolbar for contenteditable fields

let toolbar = null;
let activeField = null;

const MD_SELECTORS = '.long-text:not(.section-intro):not(.section-outro)';

// Custom marked renderer
function getRenderer() {
  const renderer = new marked.Renderer();
  renderer.html = () => '';
  renderer.link = (token) => {
    let href = token.href || token;
    const title = token.title || '';
    const text = token.text || href;
    if (href && !/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
      href = 'https://' + href;
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`;
  };
  return renderer;
}

function configureMarked() {
  if (typeof marked === 'undefined') return;
  marked.setOptions({
    gfm: true,
    breaks: true,
    renderer: getRenderer()
  });
}

// --- Toolbar ---

function createToolbar() {
  const el = document.createElement('div');
  el.className = 'md-toolbar';
  el.id = 'md-toolbar';

  const buttons = [
    { md: 'bold', label: 'B', title: 'Grassetto' },
    { md: 'italic', label: 'I', title: 'Corsivo' },
    { md: 'h1', label: 'H1', title: 'Titolo 1' },
    { md: 'h2', label: 'H2', title: 'Titolo 2' },
    { md: 'h3', label: 'H3', title: 'Titolo 3' },
    { md: 'ul', label: '• —', title: 'Lista' },
    { md: 'ol', label: '1. —', title: 'Lista numerata' },
    { md: 'quote', label: '❝', title: 'Citazione' },
    { md: 'link', label: '🔗', title: 'Link' }
  ];

  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'md-btn';
    btn.textContent = b.label;
    btn.title = b.title;
    btn.dataset.md = b.md;
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      insertMarkdown(b.md);
    });
    el.appendChild(btn);
  });

  document.body.appendChild(el);
  return el;
}

function positionToolbar(field) {
  if (!toolbar) return;
  const section = field.closest('.section');
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const isTablet = window.innerWidth <= 1024;

  let top, left;
  if (isTablet) {
    top = rect.top + window.scrollY - toolbar.offsetHeight - 8;
    left = rect.left + window.scrollX;
    if (top < window.scrollY) {
      top = rect.bottom + window.scrollY + 8;
    }
  } else {
    const isHalf = section.classList.contains('col-half');
    top = rect.top + window.scrollY;
    if (isHalf) {
      left = rect.right + window.scrollX + 8;
    } else {
      left = rect.left + window.scrollX - (toolbar.offsetWidth || 36) - 8;
    }
  }

  left = Math.max(0, Math.min(left, window.innerWidth - (toolbar.offsetWidth || 36) - 8));
  toolbar.style.top = top + 'px';
  toolbar.style.left = left + 'px';
}

function showToolbar(field) {
  activeField = field;
  if (!toolbar) toolbar = createToolbar();
  positionToolbar(field);
  toolbar.classList.add('active');
  updateActiveButtons();
}

function hideToolbar() {
  activeField = null;
  if (toolbar) toolbar.classList.remove('active');
}

function updateActiveButtons() {
  if (!toolbar || !activeField) return;
  const sel = window.getSelection();
  const text = sel && sel.toString ? sel.toString() : '';

  // Clear all
  toolbar.querySelectorAll('.md-btn').forEach(btn => btn.classList.remove('md-btn-active'));
  if (!text || text.length < 2) return;

  // Check with priority order (most specific first)
  // Bold: starts with exactly ** (not ***) and ends with **
  if (/^\*\*[^*]/.test(text) && /[^*]\*\*$/.test(text) && text.length > 4) {
    highlight('bold');
  }
  // Italic: starts with exactly one * (not **) and ends with one * (not **)
  else if (/^\*[^*]/.test(text) && /[^*]\*$/.test(text) && text.length > 2) {
    highlight('italic');
  }

  // Headers: check most specific first
  if (text.startsWith('### ')) {
    highlight('h3');
  } else if (text.startsWith('## ') && !text.startsWith('### ')) {
    highlight('h2');
  } else if (text.startsWith('# ') && !text.startsWith('## ')) {
    highlight('h1');
  }
}

function highlight(md) {
  if (!toolbar) return;
  const btn = toolbar.querySelector(`[data-md="${md}"]`);
  if (btn) btn.classList.add('md-btn-active');
}

function onSelectionChange() {
  updateActiveButtons();
}

// --- Markdown insertion ---

const mdActions = {
  bold: (sel) => `**${sel || 'testo'}**`,
  italic: (sel) => `*${sel || 'testo'}*`,
  h1: (sel) => `# ${sel || 'Titolo'}`,
  h2: (sel) => `## ${sel || 'Titolo'}`,
  h3: (sel) => `### ${sel || 'Titolo'}`,
  ul: (sel) => {
    if (sel && sel.includes('\n')) {
      return sel.split('\n').map(l => `- ${l}`).join('\n');
    }
    return `- ${sel || 'elemento'}`;
  },
  ol: (sel) => {
    if (sel && sel.includes('\n')) {
      return sel.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n');
    }
    return `1. ${sel || 'elemento'}`;
  },
  quote: (sel) => `> ${sel || 'citazione'}`,
  link: (sel) => `[${sel || 'testo'}](url)`
};

function insertMarkdown(type) {
  if (!activeField) return;
  activeField.focus();
  const sel = window.getSelection();
  const selectedText = sel && sel.toString ? sel.toString() : '';

  // Toggle off: if selected text includes the markers, remove them
  if (selectedText) {
    if (type === 'bold' && selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length > 4) {
      document.execCommand('insertText', false, selectedText.slice(2, -2));
      return;
    }
    if (type === 'italic' && selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**') && selectedText.length > 2) {
      document.execCommand('insertText', false, selectedText.slice(1, -1));
      return;
    }
    if (type === 'h1' && selectedText.startsWith('# ')) {
      document.execCommand('insertText', false, selectedText.slice(2));
      return;
    }
    if (type === 'h2' && selectedText.startsWith('## ')) {
      document.execCommand('insertText', false, selectedText.slice(3));
      return;
    }
    if (type === 'h3' && selectedText.startsWith('### ')) {
      document.execCommand('insertText', false, selectedText.slice(4));
      return;
    }
  }

  const result = mdActions[type](selectedText);
  document.execCommand('insertText', false, result);
}

// --- Field rendering ---

function renderMarkdown(el) {
  if (typeof marked === 'undefined') return;
  const src = el.innerText.trim();
  if (!src) return;

  const rendered = document.createElement('div');
  rendered.className = 'md-rendered';
  rendered.innerHTML = marked.parse(preprocessMd(src));
  rendered.setAttribute('data-md-src', src);

  rendered.addEventListener('click', (e) => {
    // Restore editable
    el.innerHTML = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    el.style.display = '';
    rendered.remove();
    el.focus();
    // Position cursor near click using caretPositionFromPoint/caretRangeFromPoint
    const range = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
    if (range && el.contains(range.startContainer)) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Fallback: cursor at end
      const range2 = document.createRange();
      const selection = window.getSelection();
      range2.selectNodeContents(el);
      range2.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range2);
    }
  });

  el.parentNode.insertBefore(rendered, el);
  el.style.display = 'none';
}

function preprocessMd(src) {
  src = src.replace(/\r\n/g, '\n');
  src = src.replace(/([^\n])\n(#{1,6} |[-*+] |\d+\. |> )/g, '$1\n\n$2');
  src = src.replace(/(#{1,6} [^\n]+)\n([^\n])/g, '$1\n\n$2');
  return src;
}

// --- Init ---

function initField(el) {
  if (el.dataset.mdInit) return;
  el.dataset.mdInit = '1';

  el.addEventListener('focus', () => {
    showToolbar(el);
    document.addEventListener('selectionchange', onSelectionChange);
  });
  el.addEventListener('blur', () => {
    document.removeEventListener('selectionchange', onSelectionChange);
    hideToolbar();
    renderMarkdown(el);
  });

  // Render immediately if field already has content
  if (el.innerText.trim()) {
    renderMarkdown(el);
  }
}

export function observeMarkdown(canvas) {
  configureMarked();

  // Init existing fields
  canvas.querySelectorAll(MD_SELECTORS).forEach(initField);

  // Watch for new fields added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(MD_SELECTORS)) {
          initField(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll(MD_SELECTORS).forEach(initField);
        }
      });
    });
  });

  observer.observe(canvas, { childList: true, subtree: true });
  return observer;
}
