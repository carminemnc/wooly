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
    theme: opts.theme || 'light-paper',
    sections: opts.sections || defaultSections(),
    rowCounter: opts.rowCounter || { current: 0, blockId: null },
    archived: false
  };
}

export function defaultSections() {
  return [
    createSection('info'),
    createSection('materials'),
    createSection('measurements'),
    createSection('abbreviations'),
    createSection('gauge'),
    createSection('steps'),
    createSection('instructions'),
    createSection('notes')
  ];
}

export function createSection(type, opts = {}) {
  const base = { id: createId(), type, halfWidth: false };

  switch (type) {
    case 'info':
      return { ...base, fields: [
        { label: 'Autore', value: '' },
        { label: 'Difficoltà', value: '' },
        { label: 'Categoria', value: '' },
        { label: 'Taglie', value: '' },
        { label: 'Costruzione', value: '' },
        { label: 'Tecniche', value: '' }
      ]};
    case 'measurements':
      return { ...base, fields: [
        { label: 'Larghezza', value: '' },
        { label: 'Lunghezza', value: '' },
        { label: 'Circonferenza', value: '' }
      ]};
    case 'materials':
      return { ...base, fields: [
        { label: 'Filato', value: '' },
        { label: 'Quantità', value: '' },
        { label: 'Metraggio', value: '' },
        { label: 'Ferri', value: '' },
        { label: 'Accessori', value: '' }
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
        { label: 'Campione', value: '' },
        { label: 'Maglie', value: '' },
        { label: 'Ferri', value: '' }
      ]};
    case 'steps':
      return { ...base, blocks: [createBlock()] };
    case 'instructions':
      return { ...base, content: '' };
    case 'notes':
      return { ...base, content: '' };
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
    rows: opts.rows || [createRow(1), createRow(2), createRow(3)]
  };
}

export function createRow(num, opts = {}) {
  return {
    id: createId(),
    num,
    text: opts.text || '',
    tip: opts.tip || '',
    note: opts.note || '',
    color: opts.color || null
  };
}
