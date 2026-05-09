// themes.js — Theme definitions and application

const STORAGE_KEY = 'wooly-theme';

const themes = [
  {
    id: 'dark', name: '🌑 Dark',
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
    id: 'light', name: '☀️ Light',
    vars: {
      '--bg': '#F5F2EB', '--bg-surface': '#FAF7F0', '--bg-surface-border': '#E8E0D0',
      '--text': '#1A1A1A', '--text-muted': '#5A5A5A', '--text-placeholder': '#BBBBBB',
      '--accent': '#C8922A', '--accent-dark': '#6B3F1F', '--accent-faint': '#F5ECD8',
      '--accent-border': '#D4A84A', '--section-border': '#E8E0D0', '--field-border': '#D8CFC0',
      '--abbr-border': '#DDD5C5', '--note-bg': '#F5ECD8',
      '--tip-bg': '#6B3F1F', '--tip-color': '#ffffff',
      '--danger': '#c0392b', '--danger-faint': 'rgba(192,57,43,.08)'
    }
  }
];

const DEFAULT_THEME = 1; // light

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
