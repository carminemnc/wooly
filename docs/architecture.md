# Wooly — Architettura

## Cos'è

Editor di schemi a maglia che gira interamente nel browser.
Nessun backend, nessun build step, deploy su GitHub Pages da `docs/`.
Usato da una persona sola su telefono, tablet e desktop.

---

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Markup | HTML5 |
| Stile | CSS3 con custom properties |
| Logica | JavaScript ES6 (moduli nativi `<script type="module">`) |
| Markdown | `marked.js` via CDN (jsDelivr) |
| Font | Google Fonts (Playfair Display, DM Sans) |
| PDF | `window.print()` con `@media print` |
| Persistenza | localStorage (JSON) |
| Offline | Service Worker (PWA) |
| Deploy | GitHub Pages — cartella `docs/` |

---

## Struttura file

```
docs/
├── index.html              # Entry point unico, carica app.js come module
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache offline)
├── css/
│   └── style.css           # Tutti gli stili, mobile-first, responsive, print
├── icons/
│   ├── icon-192.svg        # Icona PWA
│   └── icon-512.svg        # Icona PWA grande
└── js/
    ├── app.js              # Entry point JS: routing, init tema, registra SW
    ├── model.js            # Factory functions per pattern, sezioni, blocchi, righe
    ├── store.js            # CRUD localStorage (pattern, abbreviazioni globali, template)
    ├── i18n.js             # Traduzioni IT/EN, getter lingua corrente
    ├── themes.js           # 7 temi, apply/get/init
    ├── views/
    │   ├── pattern-list.js # Vista lista pattern (landing page)
    │   └── editor.js       # Vista editor pattern (sezioni, timeline, export)
    └── components/
        ├── toast.js        # Notifiche toast
        ├── export.js       # Export HTML/PDF/JSON
        ├── import.js       # Import HTML/JSON
        ├── drag.js         # Drag & drop sezioni (mouse + touch)
        ├── markdown.js     # Rendering markdown + toolbar
        ├── row-counter.js  # Contarighe flottante
        └── templates.js    # Template built-in e custom
```

---

## Flusso dati

```
Pattern JSON (localStorage)
    ↓ getPattern(id)
    ↓
Oggetto JS in memoria (let pattern)
    ↓ renderSections() / createRowEl() / etc.
    ↓
DOM (contenteditable, input events)
    ↓ addEventListener('input', ...)
    ↓
Aggiorna oggetto JS (pattern.sections[i].fields[j].value = ...)
    ↓ scheduleSave() — debounce 1s
    ↓
savePattern(pattern) → localStorage
```

**Il modello JSON è la source of truth.** Il DOM è la superficie di editing.
L'autosave serializza il modello, non l'innerHTML.

---

## Routing

Single page, nessun router. Due viste gestite da `app.js`:

| Vista | Funzione | Quando |
|-------|----------|--------|
| `list` | `renderPatternList(root)` | Landing page, lista pattern |
| `editor` | `renderEditor(root, patternId)` | Editing di un pattern |

Navigazione via `navigate(view, patternId)`. Usa `history.pushState` per il back button.

---

## Modello dati (JSON)

```json
{
  "id": "abc123",
  "name": "Sciarpa a trecce",
  "created": "2025-01-15T...",
  "modified": "2025-01-20T...",
  "thumbnail": "data:image/jpeg;base64,...",
  "lang": "it",
  "theme": "light-paper",
  "archived": false,
  "rowCounter": { "current": 14, "blockId": null },
  "sections": [
    {
      "id": "xyz", "type": "materials", "halfWidth": false,
      "fields": [{ "label": "Filato", "value": "Merino 4ply" }, ...]
    },
    {
      "id": "xyz", "type": "abbreviations", "halfWidth": false,
      "items": [{ "key": "m", "val": "maglia" }, ...]
    },
    {
      "id": "xyz", "type": "steps", "halfWidth": false,
      "blocks": [{
        "id": "xyz", "title": "Corpo",
        "rows": [{ "id": "xyz", "num": 1, "text": "...", "tip": "...", "note": "...", "color": null }]
      }]
    },
    {
      "id": "xyz", "type": "instructions", "halfWidth": false,
      "content": "testo markdown..."
    }
  ]
}
```

### Tipi di sezione

| type | Campi specifici |
|------|----------------|
| `materials` | `fields[]` — label + value |
| `gauge` | `fields[]` — label + value |
| `abbreviations` | `items[]` — key + val |
| `steps` | `blocks[]` — title + rows[] |
| `instructions` | `content` (string) |
| `notes` | `content` (string) |
| `custom` | `title` + `content` (string) |

---

## localStorage keys

| Key | Contenuto |
|-----|-----------|
| `wooly-index` | Array di metadati pattern `[{id, name, modified, thumbnail, archived}]` |
| `wooly-p-{id}` | Pattern completo (JSON) |
| `wooly-theme` | ID tema globale (string) |
| `wooly-lang` | Lingua corrente `"it"` o `"en"` |
| `wooly-global-abbr` | Array abbreviazioni globali |
| `wooly-templates` | Array template custom |

---

## Comunicazione tra moduli

Tutti i moduli sono ES6 con `import`/`export` espliciti. Nessun namespace globale.

Dipendenze principali:
- `app.js` importa `views/*` e `themes.js`
- `views/editor.js` importa `store`, `model`, `i18n`, `themes`, e tutti i `components/*`
- `views/pattern-list.js` importa `store`, `i18n`, `themes`, `templates`
- I `components/*` importano solo `i18n`, `model`, `store` dove necessario

Nessuna dipendenza circolare.

---

## Responsive

| Breakpoint | Target | Comportamento |
|-----------|--------|---------------|
| ≤ 600px | Mobile | Colonna singola, bottom bar fixed |
| 601–1024px | Tablet | 2 colonne, touch target 44px |
| > 1024px | Desktop | Bottom bar statica, toolbar MD laterale |

---

## PWA

- `manifest.json` — nome, icone, display standalone
- `sw.js` — cache-first per tutti gli asset statici
- Funziona offline dopo il primo caricamento
- Installabile su home screen mobile
