var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.core = (function () {

  /* ── Registry: costruito dai <template> in index.html ── */
  var registry = [];

  function buildRegistry() {
    var templates = document.querySelectorAll('template[id^="tpl-sec-"]');
    Array.prototype.forEach.call(templates, function (tpl) {
      var sec = tpl.content.querySelector('.section');
      registry.push({
        id:    sec.id,
        label: sec.getAttribute('data-label'),
        tpl:   tpl
      });
    });
  }

  /* ── Clona una sezione dal template ── */
  function cloneSection(def) {
    return document.importNode(def.tpl.content, true).querySelector('.section');
  }

  /* ── Modal conferma ── */
  function confirmDelete(onConfirm) {
    var overlay = document.getElementById('modal-overlay');
    overlay.classList.add('open');
    document.getElementById('modal-cancel').focus();
    document.getElementById('modal-confirm').onclick = function () {
      overlay.classList.remove('open');
      onConfirm();
    };
    document.getElementById('modal-cancel').onclick = function () {
      overlay.classList.remove('open');
    };
  }

  /* ── Toggle bar ── */
  function rebuildToggleBar() {
    var bar = document.getElementById('toggle-bar');
    bar.innerHTML = '';
    Array.prototype.forEach.call(registry, function (def) {
      if (document.getElementById(def.id)) return;
      var chip = document.createElement('span');
      chip.className = 'toggle-chip';
      chip.textContent = '+ ' + def.label;
      chip.addEventListener('click', function () { addSection(def); });
      bar.appendChild(chip);
    });
  }

  /* ── Aggiungi sezione ── */
  function addSection(def) {
    var sec = cloneSection(def);
    document.getElementById('canvas').appendChild(sec);
    Wooly.Sections.init(sec);
    if (typeof Wooly.Translate !== 'undefined') Wooly.Translate.apply(Wooly.Translate.lang);
    rebuildToggleBar();
  }

  /* ── Import HTML ── */
  function importHTML(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(ev.target.result, 'text/html');
      var imported = doc.querySelector('.canvas');
      if (!imported) { alert('File non valido — canvas non trovato.'); return; }
      var canvas = document.getElementById('canvas');
      canvas.innerHTML = imported.innerHTML;
      Array.prototype.forEach.call(canvas.querySelectorAll('.section'), function (sec) {
        Array.prototype.forEach.call(
          sec.querySelectorAll('.drag-handle, .delete-section, .dup-section, .layout-toggle'),
          function (el) { el.remove(); }
        );
        Wooly.Sections.init(sec);
      });
      rebuildToggleBar();
      if (typeof Wooly.Translate !== 'undefined') Wooly.Translate.apply(Wooly.Translate.lang);
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  /* ── Carica immagine header ── */
  function loadImage(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = document.getElementById('img-preview');
      img.src = ev.target.result;
      img.style.display = 'block';
      document.getElementById('img-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  /* ── Aggiungi abbreviazione ── */
  function addAbbr(grid) {
    var item = document.createElement('div');
    item.className = 'abbr-item';
    item.innerHTML = '<span class="abbr-key" contenteditable="true"></span><span class="abbr-val" contenteditable="true"></span>';
    grid.appendChild(item);
    item.querySelector('.abbr-key').focus();
  }

  /* ── Event delegation toolbar ── */
  function bindToolbar() {
    document.getElementById('btn-pdf').addEventListener('click', function () {
      Wooly.Export.pdf();
    });
    document.getElementById('btn-export').addEventListener('click', function () {
      Wooly.Export.html();
    });
    document.getElementById('import-input').addEventListener('change', importHTML);
    document.getElementById('img-input').addEventListener('change', loadImage);
    document.getElementById('theme-toggle').addEventListener('click', function () {
      Wooly.Themes.toggleMenu();
    });
    document.getElementById('lang-toggle').addEventListener('click', function (e) {
      e.stopPropagation();
      Wooly.Translate.toggle();
    });
  }

  /* ── Event delegation canvas (add-abbr, add-step, ecc.) ── */
  function bindCanvas() {
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('click', function (e) {
      var btn = e.target;
      if (btn.classList.contains('add-abbr')) {
        addAbbr(btn.closest('.section').querySelector('.abbr-grid'));
        return;
      }
      if (btn.classList.contains('add-step')) {
        Wooly.Steps.addStep(btn);
        return;
      }
      if (btn.classList.contains('add-steps-block')) {
        Wooly.Steps.addBlock(btn.closest('.section').querySelector('.steps-container'));
        return;
      }
      if (btn.classList.contains('timeline-del')) {
        Wooly.Steps.delStep(btn);
        return;
      }
      if (btn.classList.contains('add-tip')) {
        Wooly.Steps.addTip(btn);
        return;
      }
      if (btn.classList.contains('timeline-add-note')) {
        Wooly.Steps.addNoteBetween(btn);
        return;
      }
    });
  }

  /* ── Init ── */
  function init() {
    buildRegistry();
    bindToolbar();
    bindCanvas();
  }

  return {
    init:             init,
    confirmDelete:    confirmDelete,
    rebuildToggleBar: rebuildToggleBar,
    addSection:       addSection,
    registry:         registry
  };

})();

Wooly.init            = Wooly.core.init;
Wooly.confirmDelete   = Wooly.core.confirmDelete;
Wooly.rebuildToggleBar = Wooly.core.rebuildToggleBar;
Wooly.addSection      = Wooly.core.addSection;
Wooly.registry        = Wooly.core.registry;

document.addEventListener('DOMContentLoaded', Wooly.init);
