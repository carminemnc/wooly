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

  function initField(el) {
    if (el.getAttribute('data-md-init')) return;
    el.setAttribute('data-md-init', '1');
    el.addEventListener('blur', function () {
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
