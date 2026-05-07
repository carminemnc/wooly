var themes = [
  {
    id: 'dark-gold',
    name: '🌑 Scuro Oro',
    swatch: '#C8922A',
    vars: {
      '--bg':                '#111111', // sfondo pagina
      '--bg-surface':        '#1A1A1A', // sfondo canvas e toolbar
      '--bg-surface-border': '#2A2A2A', // bordo canvas
      '--text':              '#FAF7F0', // testo principale
      '--text-muted':        '#A8A8A8', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#444444', // testo placeholder nei campi vuoti
      '--accent':            '#C8922A', // colore principale (oro)
      '--accent-dark':       '#6B3F1F', // accento scuro (hover link filato)
      '--accent-faint':      '#221A0A', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#5A3D10', // bordi accent (chip, select, img-box)
      '--section-border':    '#2A2A2A', // bordo sezioni
      '--field-border':      '#333333', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#2A2A2A', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#222222', // sfondo select dir/rov
      '--select-border':     '#333333', // bordo select dir/rov
      '--select-option-bg':  '#1A1A1A', // sfondo option nei select
      '--timeline-line':     '#5A3D10', // linea verticale timeline
      '--note-bg':           '#1E1A12', // sfondo nota tra righe
      '--tip-bg':            '#C8922A', // sfondo bubble tip
      '--tip-color':         '#ffffff', // testo bubble tip
      '--tip-empty-bg':      '#221A0A', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#5A3D10', // bordo bubble tip vuoto
      '--tip-empty-color':   '#7A5518'  // testo bubble tip vuoto
    }
  },
  {
    id: 'mid-graphite',
    name: '🌙 Medio Grafite',
    swatch: '#6EC6E6',
    vars: {
      '--bg':                '#2A2F32', // sfondo pagina (grigio ardesia)
      '--bg-surface':        '#333A3E', // sfondo canvas e toolbar
      '--bg-surface-border': '#444C50', // bordo canvas
      '--text':              '#F0F8FC', // testo principale (bianco azzurrino)
      '--text-muted':        '#A8CCE0', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#607880', // testo placeholder nei campi vuoti
      '--accent':            '#6EC6E6', // colore principale (azzurro vivace)
      '--accent-dark':       '#3A9ABF', // accento scuro (hover link filato)
      '--accent-faint':      '#3A4A52', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#4A9ABF', // bordi accent (chip, select, img-box)
      '--section-border':    '#4A5458', // bordo sezioni
      '--field-border':      '#506068', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#4A5458', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#3A4A52', // sfondo select dir/rov
      '--select-border':     '#506068', // bordo select dir/rov
      '--select-option-bg':  '#333A3E', // sfondo option nei select
      '--timeline-line':     '#4A9ABF', // linea verticale timeline
      '--note-bg':           '#3A4A52', // sfondo nota tra righe
      '--tip-bg':            '#6EC6E6', // sfondo bubble tip
      '--tip-color':         '#1A2428', // testo bubble tip (scuro su chiaro)
      '--tip-empty-bg':      '#3A4A52', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#4A9ABF', // bordo bubble tip vuoto
      '--tip-empty-color':   '#6EC6E6'  // testo bubble tip vuoto
    }
  },
  {
    id: 'light-cream',
    name: '☀️ Chiaro Crema',
    swatch: '#C8922A',
    vars: {
      '--bg':                '#F5F2EB', // sfondo pagina
      '--bg-surface':        '#FAF7F0', // sfondo canvas e toolbar
      '--bg-surface-border': '#E8E0D0', // bordo canvas
      '--text':              '#1A1A1A', // testo principale
      '--text-muted':        '#5A5A5A', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#BBBBBB', // testo placeholder nei campi vuoti
      '--accent':            '#C8922A', // colore principale (oro caldo)
      '--accent-dark':       '#6B3F1F', // accento scuro (hover link filato)
      '--accent-faint':      '#F5ECD8', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#D4A84A', // bordi accent (chip, select, img-box)
      '--section-border':    '#E8E0D0', // bordo sezioni
      '--field-border':      '#D8CFC0', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#DDD5C5', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#F0EAD8', // sfondo select dir/rov
      '--select-border':     '#D8CFC0', // bordo select dir/rov
      '--select-option-bg':  '#FAF7F0', // sfondo option nei select
      '--timeline-line':     '#D4A84A', // linea verticale timeline
      '--note-bg':           '#F5ECD8', // sfondo nota tra righe
      '--tip-bg':            '#6B3F1F', // sfondo bubble tip
      '--tip-color':         '#ffffff', // testo bubble tip
      '--tip-empty-bg':      '#F0E8D5', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#C8A060', // bordo bubble tip vuoto
      '--tip-empty-color':   '#8A5A28'  // testo bubble tip vuoto
    }
  },
  {
    id: 'light-blush',
    name: '☀️ Chiaro Rosa',
    swatch: '#C04060',
    vars: {
      '--bg':                '#FDF0F3', // sfondo pagina
      '--bg-surface':        '#FFF5F7', // sfondo canvas e toolbar
      '--bg-surface-border': '#F0D0D8', // bordo canvas
      '--text':              '#2A1018', // testo principale
      '--text-muted':        '#7A4A55', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#CCAAAA', // testo placeholder nei campi vuoti
      '--accent':            '#C04060', // colore principale (rosa scuro)
      '--accent-dark':       '#7A1A30', // accento scuro (hover link filato)
      '--accent-faint':      '#FAE0E6', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#D06080', // bordi accent (chip, select, img-box)
      '--section-border':    '#F0D0D8', // bordo sezioni
      '--field-border':      '#E8C0CC', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#ECC8D0', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#FAE8EC', // sfondo select dir/rov
      '--select-border':     '#E8C0CC', // bordo select dir/rov
      '--select-option-bg':  '#FFF5F7', // sfondo option nei select
      '--timeline-line':     '#D06080', // linea verticale timeline
      '--note-bg':           '#FAE0E6', // sfondo nota tra righe
      '--tip-bg':            '#C04060', // sfondo bubble tip
      '--tip-color':         '#ffffff', // testo bubble tip
      '--tip-empty-bg':      '#FAE0E6', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#D06080', // bordo bubble tip vuoto
      '--tip-empty-color':   '#A03050'  // testo bubble tip vuoto
    }
  },
  {
    id: 'light-mint',
    name: '☀️ Chiaro Menta',
    swatch: '#2E7D52',
    vars: {
      '--bg':                '#EEF5F0', // sfondo pagina
      '--bg-surface':        '#F4FAF6', // sfondo canvas e toolbar
      '--bg-surface-border': '#C8E0D0', // bordo canvas
      '--text':              '#0F2018', // testo principale
      '--text-muted':        '#3A6A50', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#AACCBB', // testo placeholder nei campi vuoti
      '--accent':            '#2E7D52', // colore principale (verde salvia)
      '--accent-dark':       '#1A4A30', // accento scuro (hover link filato)
      '--accent-faint':      '#D8F0E4', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#4A9A6A', // bordi accent (chip, select, img-box)
      '--section-border':    '#C8E0D0', // bordo sezioni
      '--field-border':      '#B8D8C8', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#C0DCC8', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#E0F0E8', // sfondo select dir/rov
      '--select-border':     '#B8D8C8', // bordo select dir/rov
      '--select-option-bg':  '#F4FAF6', // sfondo option nei select
      '--timeline-line':     '#4A9A6A', // linea verticale timeline
      '--note-bg':           '#D8F0E4', // sfondo nota tra righe
      '--tip-bg':            '#2E7D52', // sfondo bubble tip
      '--tip-color':         '#ffffff', // testo bubble tip
      '--tip-empty-bg':      '#D8F0E4', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#4A9A6A', // bordo bubble tip vuoto
      '--tip-empty-color':   '#2E7D52'  // testo bubble tip vuoto
    }
  },
  {
    id: 'light-paper',
    name: '☀️ Chiaro Carta',
    swatch: '#5A7A6A',
    vars: {
      '--bg':                '#E8ECE9', // sfondo pagina (grigio verde pallido)
      '--bg-surface':        '#FFFFFF', // sfondo canvas (bianco puro)
      '--bg-surface-border': '#D0D8D2', // bordo canvas
      '--text':              '#1A2420', // testo principale
      '--text-muted':        '#5A7A6A', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#AABFB5', // testo placeholder nei campi vuoti
      '--accent':            '#5A7A6A', // colore principale (verde salvia scuro)
      '--accent-dark':       '#2E4A3A', // accento scuro (hover link filato)
      '--accent-faint':      '#E0EDE8', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#7A9A8A', // bordi accent (chip, select, img-box)
      '--section-border':    '#D8E4DE', // bordo sezioni
      '--field-border':      '#C8D8D0', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#D0DCD4', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#EEF4F0', // sfondo select dir/rov
      '--select-border':     '#C8D8D0', // bordo select dir/rov
      '--select-option-bg':  '#FFFFFF', // sfondo option nei select
      '--timeline-line':     '#7A9A8A', // linea verticale timeline
      '--note-bg':           '#E8F0EC', // sfondo nota tra righe
      '--tip-bg':            '#5A7A6A', // sfondo bubble tip
      '--tip-color':         '#ffffff', // testo bubble tip
      '--tip-empty-bg':      '#E0EDE8', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#7A9A8A', // bordo bubble tip vuoto
      '--tip-empty-color':   '#5A7A6A'  // testo bubble tip vuoto
    }
  },
  {
    id: 'light-sky',
    name: '☀️ Chiaro Cielo',
    swatch: '#2E60C0',
    vars: {
      '--bg':                '#EEF3FA', // sfondo pagina
      '--bg-surface':        '#F4F8FD', // sfondo canvas e toolbar
      '--bg-surface-border': '#C8D8F0', // bordo canvas
      '--text':              '#0F1A2E', // testo principale
      '--text-muted':        '#3A5A8A', // testo secondario (label, abbr-val)
      '--text-placeholder':  '#AABBD0', // testo placeholder nei campi vuoti
      '--accent':            '#2E60C0', // colore principale (blu cielo)
      '--accent-dark':       '#1A3A7A', // accento scuro (hover link filato)
      '--accent-faint':      '#D8E4F8', // sfondo leggerissimo accent (hover bottoni)
      '--accent-border':     '#4A78D0', // bordi accent (chip, select, img-box)
      '--section-border':    '#C8D8F0', // bordo sezioni
      '--field-border':      '#B8CCE8', // bordo tratteggiato sotto i campi
      '--abbr-border':       '#C0D0EC', // bordo tratteggiato abbreviazioni
      '--select-bg':         '#E0EAF8', // sfondo select dir/rov
      '--select-border':     '#B8CCE8', // bordo select dir/rov
      '--select-option-bg':  '#F4F8FD', // sfondo option nei select
      '--timeline-line':     '#4A78D0', // linea verticale timeline
      '--note-bg':           '#D8E4F8', // sfondo nota tra righe
      '--tip-bg':            '#2E60C0', // sfondo bubble tip
      '--tip-color':         '#ffffff', // testo bubble tip
      '--tip-empty-bg':      '#D8E4F8', // sfondo bubble tip vuoto
      '--tip-empty-border':  '#4A78D0', // bordo bubble tip vuoto
      '--tip-empty-color':   '#2E60C0'  // testo bubble tip vuoto
    }
  }
];

var Wooly = window.Wooly || {};
window.Wooly = Wooly;

Wooly.Themes = (function () {

  var currentIdx = 0;

  function apply(idx) {
    var theme = themes[idx];
    var body = document.body;
    Object.keys(theme.vars).forEach(function (key) {
      body.style.setProperty(key, theme.vars[key]);
    });
    currentIdx = idx;
    Array.prototype.forEach.call(document.querySelectorAll('.theme-option'), function (el, i) {
      el.classList.toggle('active', i === idx);
    });
    localStorage.setItem('wooly-theme', idx);
    closeMenu();
  }

  function buildMenu() {
    var menu = document.getElementById('theme-menu');
    themes.forEach(function (theme, idx) {
      var btn = document.createElement('button');
      btn.className = 'theme-option';
      btn.innerHTML = '<span class="theme-swatch" style="background:' + theme.swatch + '"></span>' + theme.name;
      btn.addEventListener('click', function () { apply(idx); });
      menu.appendChild(btn);
    });
  }

  function toggleMenu() {
    document.getElementById('theme-menu').classList.toggle('open');
  }

  function closeMenu() {
    document.getElementById('theme-menu').classList.remove('open');
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#theme-picker')) closeMenu();
  });

  document.addEventListener('DOMContentLoaded', function () {
    buildMenu();
    var saved = parseInt(localStorage.getItem('wooly-theme'), 10);
    apply(isNaN(saved) ? 5 : saved);
  });

  return { apply: apply, toggleMenu: toggleMenu };

})();