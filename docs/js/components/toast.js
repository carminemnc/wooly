// components/toast.js — Toast notifications + confirm modal

import { t } from '../i18n.js';

export function toast(message, duration = 2800) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

export function showConfirmModal(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-box">
      <p class="confirm-msg">${message}</p>
      <div class="confirm-actions">
        <button class="confirm-cancel">${t('cancel')}</button>
        <button class="confirm-ok">${t('confirm')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.confirm-ok').addEventListener('click', () => { overlay.remove(); onConfirm(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

export function showPromptModal(message, onSubmit) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-box">
      <p class="confirm-msg">${message}</p>
      <input class="prompt-input" type="text" autofocus>
      <div class="confirm-actions">
        <button class="confirm-cancel">${t('cancel')}</button>
        <button class="confirm-ok">${t('confirm')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const input = overlay.querySelector('.prompt-input');
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); overlay.querySelector('.confirm-ok').click(); }
  });
  overlay.querySelector('.confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.confirm-ok').addEventListener('click', () => {
    const val = input.value.trim();
    if (!val) return;
    overlay.remove();
    onSubmit(val);
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
