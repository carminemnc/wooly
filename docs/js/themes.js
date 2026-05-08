// themes.js — Theme definitions and application

const STORAGE_KEY = 'wooly-theme';

const themes = [
  {
    id: 'dark-gold', name: '🌑 Scuro Oro', swatch: '#C8922A',
    vars: {
      '--bg': '#111111', '--bg-surface': '#1A1A1A', '--bg-surface-border': '#2A2A2A',
      '--text': '#FAF7F0', '--text-muted': '#A8A8A8', '--text-placeholder': '#444444',
      '--accent': '#C8922A', '--accent-dark': '#6B3F1F', '--accent-faint': '#221A0A',
      '--accent-border': '#5A3D10', '--section-border': '#2A2A2A', '--field-border': '#333333',
      '--abbr-border': '#2A2A2A', '--note-bg': '#1E1A12',
      '--tip-bg': '#C8922A', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  },
  {
    id: 'mid-graphite', name: '🌙 Medio Grafite', swatch: '#6EC6E6',
    vars: {
      '--bg': '#2A2F32', '--bg-surface': '#333A3E', '--bg-surface-border': '#444C50',
      '--text': '#F0F8FC', '--text-muted': '#A8CCE0', '--text-placeholder': '#607880',
      '--accent': '#6EC6E6', '--accent-dark': '#3A9ABF', '--accent-faint': '#3A4A52',
      '--accent-border': '#4A9ABF', '--section-border': '#4A5458', '--field-border': '#506068',
      '--abbr-border': '#4A5458', '--note-bg': '#3A4A52',
      '--tip-bg': '#6EC6E6', '--tip-color': '#1A2428',
      '--danger': '#e74c3c', '--danger-faint': 'rgba(231,76,60,.1)'
    }
  },
  {
    id: 'light-cream', name: '☀️ Chiaro Crema', swatch: '#C8922A',
    vars: {
      '--bg': '#F5F2EB', '--bg-surface': '#FAF7F0', '--bg-surface-border': '#E8E0D0',
      '--text': '#1A1A1A', '--text-muted': '#5A5A5A', '--text-placeholder': '#BBBBBB',
      '--accent': '#C8922A', '--accent-dark': '#6B3F1F', '--accent-faint': '#F5ECD8',
      '--accent-border': '#D4A84A', '--section-border': '#E8E0D0', '--field-border': '#D8CFC0',
      '--abbr-border': '#DDD5C5', '--note-bg': '#F5ECD8',
      '--tip-bg': '#6B3F1F', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  },
  {
    id: 'light-blush', name: '☀️ Chiaro Rosa', swatch: '#C04060',
    vars: {
      '--bg': '#FDF0F3', '--bg-surface': '#FFF5F7', '--bg-surface-border': '#F0D0D8',
      '--text': '#2A1018', '--text-muted': '#7A4A55', '--text-placeholder': '#CCAAAA',
      '--accent': '#C04060', '--accent-dark': '#7A1A30', '--accent-faint': '#FAE0E6',
      '--accent-border': '#D06080', '--section-border': '#F0D0D8', '--field-border': '#E8C0CC',
      '--abbr-border': '#ECC8D0', '--note-bg': '#FAE0E6',
      '--tip-bg': '#C04060', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  },
  {
    id: 'light-mint', name: '☀️ Chiaro Menta', swatch: '#2E7D52',
    vars: {
      '--bg': '#EEF5F0', '--bg-surface': '#F4FAF6', '--bg-surface-border': '#C8E0D0',
      '--text': '#0F2018', '--text-muted': '#3A6A50', '--text-placeholder': '#AACCBB',
      '--accent': '#2E7D52', '--accent-dark': '#1A4A30', '--accent-faint': '#D8F0E4',
      '--accent-border': '#4A9A6A', '--section-border': '#C8E0D0', '--field-border': '#B8D8C8',
      '--abbr-border': '#C0DCC8', '--note-bg': '#D8F0E4',
      '--tip-bg': '#2E7D52', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  },
  {
    id: 'light-paper', name: '☀️ Chiaro Carta', swatch: '#5A7A6A',
    vars: {
      '--bg': '#E8ECE9', '--bg-surface': '#FFFFFF', '--bg-surface-border': '#D0D8D2',
      '--text': '#1A2420', '--text-muted': '#5A7A6A', '--text-placeholder': '#AABFB5',
      '--accent': '#5A7A6A', '--accent-dark': '#2E4A3A', '--accent-faint': '#E0EDE8',
      '--accent-border': '#7A9A8A', '--section-border': '#D8E4DE', '--field-border': '#C8D8D0',
      '--abbr-border': '#D0DCD4', '--note-bg': '#E8F0EC',
      '--tip-bg': '#5A7A6A', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  },
  {
    id: 'light-sky', name: '☀️ Chiaro Cielo', swatch: '#2E60C0',
    vars: {
      '--bg': '#EEF3FA', '--bg-surface': '#F4F8FD', '--bg-surface-border': '#C8D8F0',
      '--text': '#0F1A2E', '--text-muted': '#3A5A8A', '--text-placeholder': '#AABBD0',
      '--accent': '#2E60C0', '--accent-dark': '#1A3A7A', '--accent-faint': '#D8E4F8',
      '--accent-border': '#4A78D0', '--section-border': '#C8D8F0', '--field-border': '#B8CCE8',
      '--abbr-border': '#C0D0EC', '--note-bg': '#D8E4F8',
      '--tip-bg': '#2E60C0', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  }
];

const DEFAULT_THEME = 5; // light-paper

export function getThemes() {
  return themes;
}

export function applyTheme(idOrIndex) {
  let idx = typeof idOrIndex === 'number' ? idOrIndex : themes.findIndex(t => t.id === idOrIndex);
  if (idx < 0 || idx >= themes.length) idx = DEFAULT_THEME;

  const theme = themes[idx];
  const body = document.body;
  Object.keys(theme.vars).forEach(key => {
    body.style.setProperty(key, theme.vars[key]);
  });
  localStorage.setItem(STORAGE_KEY, theme.id);
  return theme;
}

export function getSavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_THEME;
  const idx = themes.findIndex(t => t.id === saved);
  return idx >= 0 ? idx : DEFAULT_THEME;
}

export function initTheme() {
  applyTheme(getSavedTheme());
}
