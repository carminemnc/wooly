<div align="center">

<img src="docs/icons/logo.png" alt="Wooly" width="120">

# Wooly

A knitting &amp; crochet pattern editor that runs entirely in the browser.<br>
No backend, no accounts, no build step. Your patterns stay on your device.

**[Open Wooly →](https://carminemnc.github.io/wooly/)**

</div>

---

## What is Wooly?

Wooly is a free, offline-first editor for knitting and crochet patterns. It's designed for crafters who want to:

- Write and organize their own patterns
- Import patterns from any source (text, PDF, or LLM-generated JSON)
- Export beautiful PDFs ready to print or share
- Work from their phone, tablet, or desktop — even without internet

Everything is stored locally in your browser. No sign-up, no cloud, no tracking.

---

## Features

### Editor
- Create, duplicate, archive, and delete patterns
- Sections: Materials, Abbreviations, Gauge, Steps, Instructions, Notes, Video, Custom
- Timeline with collapsible blocks, tips, notes, row repeat (×N)
- Pointer-based drag & drop reorder for sections and rows (works with mouse, touch and pen)
- Duplicate/delete blocks within steps
- Section intro/outro for general instructions
- Markdown support (bold, italic, headings, lists, links) with floating toolbar
- Autosave with debounce and storage-full detection

### Import / Export
- PDF export with elegant template (customizable color palette), natural page flow that avoids splitting a section or piece across pages
- JSON export (full pattern data, reimportable)
- JSON import with automatic newline fix and ID generation (LLM-friendly)
- Full backup/restore with smart merge (patterns, abbreviation sets, templates, logo & footer)
- LLM prompts included for converting any pattern to Wooly format

### Multilingual
- Full IT/EN bilingual interface
- PDF labels translated based on current language
- Bidirectional label translation (works with patterns created in either language)

### Video & QR
- Video section with YouTube links
- QR codes auto-generated in PDF for printed patterns (scan to watch)

### Design
- 2 themes (Dark / Light)
- Mobile-first responsive design
- PWA — installable, works offline
- Fixed top/bottom bars on all devices

---

## How to Use

1. **Open** [carminemnc.github.io/wooly](https://carminemnc.github.io/wooly/)
2. **Create** a new pattern or import a JSON file
3. **Edit** — add sections, write rows, organize your pattern
4. **Export** — print as PDF or download as JSON

### Import from LLM

You can convert any pattern (from a book, PDF, blog, or handwritten notes) into Wooly format using an LLM:

1. Copy the content of [`IMPORT-PROMPT.md`](IMPORT-PROMPT.md)
2. Paste it into ChatGPT, Claude, or any LLM
3. Add your pattern text at the end
4. Save the JSON output as a `.json` file
5. Import it in Wooly via "+ New pattern" → "Import file"

### Translate a Pattern

1. Export your pattern as JSON from Wooly
2. Copy the content of [`TRANSLATE-PROMPT.md`](TRANSLATE-PROMPT.md)
3. Paste it into an LLM with your JSON
4. Save the translated JSON and reimport it

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Style | CSS3 with custom properties |
| Logic | Vanilla JavaScript ES6 modules |
| Markdown | marked.js via CDN |
| Fonts | Google Fonts (Playfair Display, DM Sans) |
| PDF | Dedicated template with centralized color palette |
| Storage | localStorage (JSON) |
| Offline | Service Worker (PWA) |
| Deploy | GitHub Pages from `docs/` |

**Zero dependencies. Zero build step. Zero framework.**

---

## Project Structure

```
docs/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/style.css           # All styles (mobile-first, responsive, print)
├── icons/                  # PWA icons
├── js/
│   ├── app.js              # Routing, init
│   ├── model.js            # Data factories (pattern, section, block, row)
│   ├── store.js            # localStorage CRUD
│   ├── i18n.js             # IT/EN translations
│   ├── themes.js           # Dark/Light themes
│   ├── views/
│   │   ├── pattern-list.js # Landing page
│   │   └── editor.js       # Pattern editor
│   ├── components/
│   │   ├── toast.js        # Notifications + modals
│   │   ├── export.js       # PDF/JSON export
│   │   ├── import.js       # JSON import (with newline fix)
│   │   ├── drag.js         # Pointer-based drag & drop for sections
│   │   ├── markdown.js     # Markdown rendering + toolbar
│   │   ├── icons.js        # Inline SVG icons (Lucide-style outline)
│   │   ├── templates.js    # Custom templates
│   │   ├── backup.js       # Full backup/restore (patterns, sets, templates, settings)
│   │   └── settings.js     # Global settings (logo, footer)
│   └── print-styles/
│       ├── index.js        # Template registry
│       └── elegant.js      # PDF template with color palette
├── IMPORT-PROMPT.md        # LLM prompt for pattern conversion
└── TRANSLATE-PROMPT.md     # LLM prompt for pattern translation
```

---

## Fork & Develop

No build step required. Clone and serve:

```bash
git clone https://github.com/carminemnc/wooly.git
cd wooly
npx serve docs
```

Open `http://localhost:3000` and start editing.

### Key conventions

- **No framework** — vanilla JS with ES6 modules
- **No npm** — no dependencies to install
- **JSON is the source of truth** — the DOM is just the editing surface
- **One CSS file** — `css/style.css` with custom properties for theming
- **Service Worker** — update `CACHE_NAME` in `sw.js` when you change files

### Adding a PDF template

1. Duplicate `js/print-styles/elegant.js`
2. Change `id`, `name`, and the color palette in `css()`
3. Register it in `js/print-styles/index.js`
4. Add the file to `ASSETS` in `sw.js`

### Adding a section type

1. Add a case in `model.js` → `createSection()`
2. Add rendering in `editor.js` → `renderSectionBody()`
3. Add to the menu in `editor.js` → `showAddSectionMenu()`
4. Add PDF rendering in `elegant.js` → `renderSection()`
5. Add translation in `i18n.js`

---

## LLM Prompts

Wooly includes two prompts for working with LLMs:

| File | Purpose |
|------|---------|
| [`IMPORT-PROMPT.md`](IMPORT-PROMPT.md) | Convert any pattern (text, PDF, JSON) into Wooly format |
| [`TRANSLATE-PROMPT.md`](TRANSLATE-PROMPT.md) | Translate an existing Wooly pattern to another language |

These work with any LLM (ChatGPT, Claude, Gemini, etc.) and produce JSON files ready to import.

---

## License

MIT License — see [LICENSE](LICENSE).

---

## Credits

Made by [@carminemnc](https://github.com/carminemnc) for knitters who deserve better tools. 🧶
