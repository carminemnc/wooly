// components/settings.js — Global settings (logo, footer) applied to all patterns

const SETTINGS_KEY = 'wooly-settings';

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { logo: '', footer: '' };
  } catch (e) {
    return { logo: '', footer: '' };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getLogo() {
  return getSettings().logo;
}

export function getFooter() {
  return getSettings().footer;
}

export function setLogo(dataURL) {
  const s = getSettings();
  s.logo = dataURL;
  saveSettings(s);
}

export function setFooter(text) {
  const s = getSettings();
  s.footer = text;
  saveSettings(s);
}

export function getAllSettings() {
  return getSettings();
}
