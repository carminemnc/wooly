var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Markdown = (function () {

  var renderer = new marked.Renderer();

  renderer.html = function () { return ''; };

  renderer.link = function (token) {
    var href = token.href || token;
    var title = token.title || '';
    var text = token.text || (typeof token === 'string' ? token : '');
    if (href && !/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
      href = 'https://' + href;
    }
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer"' +
      (title ? ' title="' + title + '"' : '') + '>' + text + '</a>';
  };

  marked.setOptions({ gfm: true, breaks: true, headerIds: false, mangle: false, renderer: renderer });

  function getTextFromEditable(el) {
    return el.innerText.trim();
  }

  function preprocessMarkdown(src) {
    src = src.replace(/\r\n/g, '\n');
    src = src.replace(/([^\n])\n(#{1,6} |[-*+] |\d+\. |> )/g, '$1\n\n$2');
    src = src.replace(/(#{1,6} [^\n]+)\n([^\n])/g, '$1\n\n$2');
    return src;
  }

  function editField(rendered, el) {
    var src = rendered.getAttribute('data-md-src');
    el.innerHTML = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    el.style.display = '';
    rendered.remove();
    el.focus();
    var range = document.createRange();
    var sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  var activeField = null;

  var mdActions = {
    bold:   function (sel) { return '**' + (sel || 'testo') + '**'; },
    italic: function (sel) { return '*' + (sel || 'testo') + '*'; },
    h1:     function (sel) { return '# ' + (sel || 'Titolo'); },
    h2:     function (sel) { return '## ' + (sel || 'Titolo'); },
    h3:     function (sel) { return '### ' + (sel || 'Titolo'); },
    ul:     function (sel) { return '- ' + (sel || 'elemento'); },
    ol:     function (sel) { return '1. ' + (sel || 'elemento'); },
    quote:  function (sel) { return '> ' + (sel || 'citazione'); },
    code:   function (sel) { return '`' + (sel || 'codice') + '`'; },
    link:   function (sel) { return '[' + (sel || 'testo') + '](url)'; }
  };

  var toolbar = (function () {
    var el = document.createElement('div');
    el.id = 'md-toolbar';
    el.className = 'md-toolbar';
    var btns = [
      { md: 'bold',   label: 'B',      title: 'Grassetto' },
      { md: 'italic', label: 'I',      title: 'Corsivo' },
      { md: 'h1',     label: 'H1',     title: 'Titolo 1' },
      { md: 'h2',     label: 'H2',     title: 'Titolo 2' },
      { md: 'h3',     label: 'H3',     title: 'Titolo 3' },
      { md: 'ul',     label: '• —',    title: 'Lista puntata' },
      { md: 'ol',     label: '1. —',   title: 'Lista numerata' },
      { md: 'quote',  label: '❝',      title: 'Citazione' },
      { md: 'link',   label: '🔗',     title: 'Link' }
    ];
    btns.forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'md-btn';
      btn.textContent = b.label;
      btn.title = b.title;
      btn.setAttribute('data-md', b.md);
      btn.addEventListener('mousedown', function (e) {
        e.preventDefault();
        insertMd(b.md);
      });
      el.appendChild(btn);
    });
    document.body.appendChild(el);
    return el;
  }());

  function positionToolbar(field) {
    var section = field;
    while (section && !section.classList.contains('section')) section = section.parentNode;
    if (!section) return;
    var rect = section.getBoundingClientRect();
    var tbW = toolbar.offsetWidth || 36;
    var isHalf = section.classList.contains('col-half');
    var left, top;
    top = rect.top + window.scrollY;
    if (isHalf) {
      left = rect.right + window.scrollX + 8;
    } else {
      left = rect.left + window.scrollX - tbW - 8;
    }
    toolbar.style.top  = top + 'px';
    toolbar.style.left = left + 'px';
    toolbar.style.width = '';
  }

  function insertMd(type) {
    if (!activeField) return;
    activeField.focus();
    var sel = window.getSelection();
    var selectedText = sel && sel.toString ? sel.toString() : '';
    if ((type === 'ul' || type === 'ol') && selectedText.indexOf('\n') !== -1) {
      var lines = selectedText.split('\n');
      var result = lines.map(function (line, i) {
        return type === 'ul' ? '- ' + line : (i + 1) + '. ' + line;
      }).join('\n');
      document.execCommand('insertText', false, result);
    } else {
      document.execCommand('insertText', false, mdActions[type](selectedText));
    }
  }

  function showToolbar(field) {
    activeField = field;
    positionToolbar(field);
    toolbar.classList.add('active');
  }

  function hideToolbar() {
    activeField = null;
    toolbar.classList.remove('active');
  }

  function initField(el) {
    if (el.getAttribute('data-md-init')) return;
    el.setAttribute('data-md-init', '1');
    el.addEventListener('focus', function () { showToolbar(el); });
    el.addEventListener('blur', function () {
      hideToolbar();
      var src = getTextFromEditable(el);
      if (!src) return;
      var rendered = document.createElement('div');
      rendered.className = 'md-rendered';
      rendered.innerHTML = marked.parse(preprocessMarkdown(src));
      rendered.setAttribute('data-md-src', src);
      rendered.addEventListener('click', function () { editField(rendered, el); });
      el.parentNode.insertBefore(rendered, el);
      el.style.display = 'none';
    });
  }

  function initAll(root) {
    Array.prototype.forEach.call(
      (root || document).querySelectorAll('.long-text, .timeline-text, .field-value, .abbr-val, .subtitle, .steps-header'),
      initField
    );
  }

  var MD_FIELDS = 'long-text timeline-text field-value abbr-val subtitle steps-header';

  var observer = new MutationObserver(function (mutations) {
    Array.prototype.forEach.call(mutations, function (m) {
      Array.prototype.forEach.call(m.addedNodes, function (node) {
        if (node.nodeType !== 1) return;
        if (MD_FIELDS.indexOf(node.className) !== -1) {
          initField(node);
        } else {
          initAll(node);
        }
      });
    });
  });

  function init() {
    initAll();
    observer.observe(document.getElementById('canvas'), { childList: true, subtree: true });
  }

  return { init: init, initAll: initAll };

})();

document.addEventListener('DOMContentLoaded', Wooly.Markdown.init);
