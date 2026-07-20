// model.js — Pattern data structure and factory functions

export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createPattern(opts = {}) {
  return {
    id: opts.id || createId(),
    name: opts.name || '',
    created: opts.created || new Date().toISOString(),
    modified: new Date().toISOString(),
    thumbnail: opts.thumbnail || '',
    lang: opts.lang || 'it',
    theme: opts.theme || 'light',
    sections: opts.sections || defaultSections(),
    images: opts.images || ['', ''],
    archived: false
  };
}

export function defaultSections() {
  return [
    createSection('info'),
    createSection('measurements'),
    createSection('gauge'),
    { ...createSection('materials'), halfWidth: true },
    { ...createSection('abbreviations'), halfWidth: true },
    createSection('steps'),
    createSection('instructions'),
    createSection('notes')
  ];
}

export function createSection(type, opts = {}) {
  const base = { id: createId(), type, halfWidth: false };

  // Field labels are stored as semantic keys (resolved to a display string via
  // i18n at render time), never as language-specific text. See FIELD_KEY_MAP in
  // store.js for the one-shot migration of legacy patterns that stored Italian
  // label strings.
  switch (type) {
    case 'info':
      return { ...base, fields: [
        { key: 'author', value: '' },
        { key: 'difficulty', value: '' },
        { key: 'category', value: '' },
        { key: 'sizes', value: '' },
        { key: 'construction', value: '' },
        { key: 'techniques', value: '' }
      ]};
    case 'measurements':
      return { ...base, fields: [
        { key: 'width', value: '' },
        { key: 'length', value: '' },
        { key: 'circumference', value: '' }
      ]};
    case 'materials':
      return { ...base, fields: [
        { key: 'yarn', value: '' },
        { key: 'quantity', value: '' },
        { key: 'yardage', value: '' },
        { key: 'needles', value: '' },
        { key: 'notions', value: '' }
      ]};
    case 'abbreviations':
      return { ...base, items: opts.items || [
        { key: 'm', val: 'maglia' },
        { key: 'dir', val: 'diritto' },
        { key: 'rov', val: 'rovescio' },
        { key: 'gett', val: 'gettato' },
        { key: 'dim', val: 'diminuzione' },
        { key: 'aum', val: 'aumento' }
      ]};
    case 'gauge':
      return { ...base, fields: [
        { key: 'swatch', value: '' },
        { key: 'stitches', value: '' },
        { key: 'needles', value: '' }
      ]};
    case 'steps':
      return { ...base, intro: '', outro: '', blocks: [createBlock()] };
    case 'instructions':
      return { ...base, content: '' };
    case 'notes':
      return { ...base, content: '' };
    case 'video':
      return { ...base, links: [{ url: '', label: '' }] };
    case 'custom':
      return { ...base, title: opts.title || '', content: opts.content || '' };
    default:
      return { ...base, content: '' };
  }
}

export function createBlock(opts = {}) {
  return {
    id: createId(),
    title: opts.title || '',
    intro: opts.intro || '',
    outro: opts.outro || '',
    rows: opts.rows || [createRow(1), createRow(2), createRow(3)]
  };
}

export function createRow(num, opts = {}) {
  return {
    id: createId(),
    num,
    repeat: opts.repeat || 1,
    text: opts.text || '',
    tip: opts.tip || '',
    note: opts.note || ''
  };
}
