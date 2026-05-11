// components/import.js — Import patterns from JSON files

import { createPattern } from '../model.js';
import { savePattern } from '../store.js';
import { navigate } from '../app.js';
import { toast } from './toast.js';
import { t } from '../i18n.js';

export function importFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.wooly.json';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.sections && Array.isArray(data.sections)) {
          const pattern = createPattern({
            name: data.name || '',
            lang: data.lang || 'it',
            theme: data.theme || 'light',
            sections: data.sections,
            thumbnail: data.thumbnail || '',
            images: data.images || ['', '']
          });
          savePattern(pattern);
          toast(t('import') + ' \u2713');
          navigate('editor', pattern.id);
          history.pushState({ view: 'editor', patternId: pattern.id }, '');
        } else {
          toast('\u26a0\ufe0f File non valido');
        }
      } catch (err) {
        toast('\u26a0\ufe0f File non valido');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}
