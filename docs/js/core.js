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

  /* ── Ripristina bottoni editor dopo import ── */
  function restoreEditorButtons(canvas) {
    Array.prototype.forEach.call(canvas.querySelectorAll('.section'), function (sec) {
      // Bottone + Aggiungi per abbreviazioni
      if (sec.querySelector('.abbr-grid') && !sec.querySelector('.add-abbr')) {
        var addBtn = document.createElement('button');
        addBtn.className = 'add-abbr';
        addBtn.textContent = '+ Aggiungi';
        sec.querySelector('.abbr-grid').parentNode.appendChild(addBtn);
      }
      // Bottoni timeline
      Array.prototype.forEach.call(sec.querySelectorAll('.timeline'), function (timeline) {
        var steps = timeline.querySelectorAll('.timeline-step');
        Array.prototype.forEach.call(steps, function (step) {
          // timeline-del
          if (!step.querySelector('.timeline-del')) {
            var actions = step.querySelector('.timeline-actions');
            if (!actions) {
              actions = document.createElement('div');
              actions.className = 'timeline-actions';
              step.appendChild(actions);
            }
            var del = document.createElement('button');
            del.className = 'timeline-del';
            del.innerHTML = '&times;';
            actions.appendChild(del);
          }
          // add-tip
          var content = step.querySelector('.timeline-content');
          if (content && !content.querySelector('.add-tip')) {
            var tip = content.querySelector('.timeline-tip');
            var tipBtn = document.createElement('button');
            tipBtn.className = 'add-tip';
            tipBtn.textContent = '+ suggerimento';
            if (tip) {
              content.insertBefore(tipBtn, tip);
              if (tip.textContent.trim()) {
                tipBtn.style.display = 'none';
                tip.style.display = 'block';
              }
            } else {
              var newTip = document.createElement('div');
              newTip.className = 'timeline-tip';
              newTip.setAttribute('contenteditable', 'true');
              newTip.setAttribute('data-label', 'Suggerimento: ');
              newTip.setAttribute('data-placeholder', 'Suggerimento: scrivi un suggerimento...');
              content.appendChild(tipBtn);
              content.appendChild(newTip);
            }
          }
          // timeline-add-note dopo ogni step (se non c'è già)
          var next = step.nextElementSibling;
          if (!next || (!next.classList.contains('timeline-add-note') && !next.classList.contains('timeline-note-between'))) {
            var noteBtn = document.createElement('button');
            noteBtn.className = 'timeline-add-note';
            noteBtn.textContent = '+ nota';
            timeline.insertBefore(noteBtn, step.nextSibling);
          }
        });
      });
      // Bottone add-step per ogni steps-block
      Array.prototype.forEach.call(sec.querySelectorAll('.steps-block'), function (block) {
        if (!block.querySelector('.add-step')) {
          var btn = document.createElement('button');
          btn.className = 'add-step';
          btn.textContent = '+ Aggiungi passaggio';
          block.appendChild(btn);
        }
      });
      // Bottone add-steps-block
      if (sec.querySelector('.steps-container') && !sec.querySelector('.add-steps-block')) {
        var blockBtn = document.createElement('button');
        blockBtn.className = 'add-steps-block';
        blockBtn.textContent = '+ Aggiungi pezzo';
        sec.appendChild(blockBtn);
      }
    });
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
      Array.prototype.forEach.call(canvas.querySelectorAll('.md-rendered'), function (el) { el.remove(); });
      Array.prototype.forEach.call(canvas.querySelectorAll('[style*="display"]'), function (el) {
        if (el.style.display === 'none' && !el.classList.contains('img-preview')) el.style.display = '';
      });
      Array.prototype.forEach.call(canvas.querySelectorAll('.section'), function (sec) {
        Array.prototype.forEach.call(
          sec.querySelectorAll('.drag-handle, .delete-section, .dup-section, .layout-toggle'),
          function (el) { el.remove(); }
        );
        Wooly.Sections.init(sec);
      });
      restoreEditorButtons(canvas);
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
      var tempImg = new Image();
      tempImg.onload = function () {
        var MAX = 600;
        var w = tempImg.width;
        var h = tempImg.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(tempImg, 0, 0, w, h);
        var dataURL = c.toDataURL('image/jpeg', 0.7);
        var img = document.getElementById('img-preview');
        img.src = dataURL;
        img.style.display = 'block';
        document.getElementById('img-placeholder').style.display = 'none';
      };
      tempImg.src = ev.target.result;
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
    document.getElementById('btn-new').addEventListener('click', function () {
      Wooly.confirmDelete(function () { Wooly.Autosave.clear(); });
    });
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
