var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Translate = (function () {

  var lang = 'it';

  var i18n = {
    it: {
      'Materiali': 'Materiali', 'Abbreviazioni': 'Abbreviazioni', 'Tensione': 'Tensione',
      'Steps': 'Steps', 'Istruzioni': 'Istruzioni', 'Note': 'Note',
      'Filato': 'Filato', 'Quantità': 'Quantità', 'Ferri': 'Ferri',
      'Accessori': 'Accessori', 'Campione': 'Campione', 'Maglie': 'Maglie',
      '+ Aggiungi': '+ Aggiungi', '+ Aggiungi passaggio': '+ Aggiungi passaggio',
      '+ Aggiungi pezzo': '+ Aggiungi pezzo',
      '🗑️ Nuovo': '🗑️ Nuovo',
      'riga': 'riga', '+ nota': '+ nota', '+ tip': '+ suggerimento',
      'Tip: ': 'Suggerimento: ', 'Nota: ': 'Nota: ',
      'Tip: scrivi un suggerimento...': 'Suggerimento: scrivi un suggerimento...',
      'Nota: scrivi una nota...': 'Nota: scrivi una nota...'
    },
    en: {
      'Materiali': 'Materials', 'Abbreviazioni': 'Abbreviations', 'Tensione': 'Gauge',
      'Steps': 'Steps', 'Istruzioni': 'Instructions', 'Note': 'Notes',
      'Filato': 'Yarn', 'Quantità': 'Quantity', 'Ferri': 'Needles',
      'Accessori': 'Notions', 'Campione': 'Swatch', 'Maglie': 'Stitches',
      '+ Aggiungi': '+ Add', '+ Aggiungi passaggio': '+ Add row',
      '+ Aggiungi pezzo': '+ Add piece',
      '🗑️ Nuovo': '🗑️ New',
      'riga': 'row', '+ nota': '+ note', '+ tip': '+ tip',
      'Tip: ': 'Tip: ', 'Nota: ': 'Note: ',
      'Tip: scrivi un suggerimento...': 'Tip: write a hint...',
      'Nota: scrivi una nota...': 'Note: write a note...'
    }
  };

  var itKeys = Object.keys(i18n.it);

  function findKey(text) {
    for (var i = 0; i < itKeys.length; i++) {
      var k = itKeys[i];
      if (i18n.it[k] === text || i18n.en[k] === text) return k;
    }
    return null;
  }

  function translate(el) {
    var key = findKey(el.textContent.trim());
    if (key) el.textContent = i18n[lang][key];
  }

  function apply(newLang) {
    lang = newLang;
    var dict = i18n[lang];

    Array.prototype.forEach.call(document.querySelectorAll('.section-title'), translate);
    Array.prototype.forEach.call(document.querySelectorAll('.field-label'), translate);
    Array.prototype.forEach.call(
      document.querySelectorAll('#canvas button, .toggle-bar button, .toolbar .tb-btn'),
      translate
    );
    Array.prototype.forEach.call(document.querySelectorAll('.timeline-num'), function (el) {
      el.textContent = el.textContent.replace(/riga|row/g, dict['riga']);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.timeline-add-note'), function (el) {
      el.textContent = dict['+ nota'];
    });
    Array.prototype.forEach.call(document.querySelectorAll('.add-tip'), function (el) {
      el.textContent = dict['+ tip'];
    });
    Array.prototype.forEach.call(document.querySelectorAll('.timeline-tip'), function (el) {
      el.setAttribute('data-label', dict['Tip: ']);
      el.setAttribute('data-placeholder', dict['Tip: scrivi un suggerimento...']);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.timeline-note-between'), function (el) {
      el.setAttribute('data-label', dict['Nota: ']);
      el.setAttribute('data-placeholder', dict['Nota: scrivi una nota...']);
    });

    var pill = document.getElementById('lang-toggle');
    pill.querySelector('.lang-it').classList.toggle('active', lang === 'it');
    pill.querySelector('.lang-en').classList.toggle('active', lang === 'en');
  }

  function toggle() {
    apply(lang === 'it' ? 'en' : 'it');
  }

  return {
    apply:  apply,
    toggle: toggle,
    get lang() { return lang; }
  };

})();
