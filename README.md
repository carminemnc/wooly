# 🧶 Wooly

A knitting pattern editor that runs entirely in the browser. No backend, no build step, no dependencies beyond [marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js).

**[Open Wooly →](https://vcaminic.github.io/wooly/)**

---

## Features

- Create, duplicate, archive, and delete patterns
- Sections: Materials, Abbreviations, Gauge, Steps, Instructions, Notes, Video, Custom
- Timeline with collapsible blocks, tips, notes, row repeat (×N), drag & drop reorder
- Section intro/outro for general instructions before/after all pieces
- Video section with QR codes for printed patterns
- PDF export with elegant template (centralized color palette, i18n labels)
- JSON export/import (with automatic newline fix and ID generation for LLM-generated files)
- Full backup/restore with smart merge
- 2 themes (Dark / Light) per pattern
- IT/EN bilingual (editor + PDF labels)
- Markdown support with floating toolbar
- PWA — installable, works offline
- Mobile-first responsive design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Style | CSS3 with custom properties |
| Logic | Vanilla JavaScript ES6 modules |
| Markdown | marked.js via CDN |
| Fonts | Google Fonts (Playfair Display, DM Sans) |
| PDF | Dedicated templates in `print-styles/`, `window.print()` |
| Storage | localStorage (JSON) |
| Offline | Service Worker (PWA) |
| Deploy | GitHub Pages from `docs/` |

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — structure, stack, data flow, modules
- [Decisions](docs/DECISIONS.md) — architectural choices and rationale
- [Status](docs/STATUS.md) — current state, what's done, what's planned
- [Rules](docs/RULES.md) — constraints, patterns, pre-push checklist

---

## LLM Prompts

Wooly includes prompts for converting and translating patterns using any LLM:

- [Import Prompt](docs/IMPORT-PROMPT.txt) — convert any pattern (text, PDF, JSON) into Wooly format
- [Translate Prompt](docs/TRANSLATE-PROMPT.txt) — translate an existing Wooly pattern to English

---

## Development

No build step required. Edit files directly and push.

```
docs/
├── index.html          # Entry point
├── css/style.css       # All styles
├── js/                 # ES6 modules
│   ├── app.js          # Routing, init
│   ├── model.js        # Data factories
│   ├── store.js        # localStorage CRUD
│   ├── i18n.js         # IT/EN translations
│   ├── themes.js       # Dark/Light themes
│   ├── views/          # Pattern list + Editor
│   ├── components/     # Toast, export, import, drag, markdown, etc.
│   └── print-styles/   # PDF templates
├── sw.js               # Service worker
└── manifest.json       # PWA manifest
```

To develop locally, serve `docs/` with any static server:

```bash
npx serve docs
```

---

## License

Personal project. All rights reserved.
