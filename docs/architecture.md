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
| PDF | Template dedicati in `print-styles/`, apertura in nuova finestra con `window.print()` |
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
    ├── store.js            # CRUD localStorage (pattern, abbreviation sets, template)
    ├── i18n.js             # Traduzioni IT/EN, getter lingua corrente
    ├── themes.js           # 2 temi (Dark/Light), apply/get/init
    ├── views/
    │   ├── pattern-list.js # Vista lista pattern (landing page)
    │   └── editor.js       # Vista editor pattern (cover, sezioni, timeline, export)
    ├── components/
    │   ├── toast.js        # Notifiche toast + modal conferma/prompt
    │   ├── export.js       # Orchestratore export (PDF/JSON)
    │   ├── import.js       # Import JSON (+ HTML legacy)
    │   ├── drag.js         # Drag & drop sezioni (mouse + touch)
    │   ├── markdown.js     # Rendering markdown + toolbar
    │   ├── templates.js    # Template custom (no built-in)
    │   ├── backup.js       # Backup/ripristino completo (v2 con abbr sets)
    │   └── settings.js     # Impostazioni globali (logo, footer)
    └── print-styles/
        ├── index.js        # Registry template PDF
        └── elegant.js      # Template PDF "Elegante" (render + CSS + markdown)
```

---

## Flusso dati

```
Pattern JSON (localStorage)
    ↓ getPattern(id)
    ↓
Oggetto JS in memoria (let pattern)
    ↓ renderEditor() → cover block + renderSections()
    ↓
DOM (contenteditable, input events)
    ↓ addEventListener('input', ...)
    ↓
Aggiorna oggetto JS (pattern.sections[i].fields[j].value = ...)
    ↓ scheduleSave() — debounce 1s
    ↓
savePattern(pattern) → localStorage (ritorna true/false)
```

**Il modello JSON è la source of truth.** Il DOM è la superficie di editing.
L'autosave serializza il modello, non l'innerHTML.

### Layout editor

```
┌─────────────────────────────────────────────┐
│  [Top bar: ← nome pattern  Salvato ✓ 🎨 ⋯] │
├─────────────────────────────────────────────┤
│  ┌─────────┬──────────────────────────┐     │
│  │         │ Autore: ...              │     │
│  │  📷     │ Difficoltà: ...          │     │
│  │ Immagine│ Categoria: ...           │     │
│  │         │ ─────────                │     │
│  │         │ Larghezza: ...           │     │
│  │         │ Lunghezza: ...           │     │
│  └─────────┴──────────────────────────┘     │
│  ═══════════ divider ═══════════════════     │
│  [Sezioni: Materiali, Abbreviazioni, ...]   │
│                                             │
│  Steps layout (collapsible blocks):         │
│  ▸ Corpo                        24 righe   │
│  ▾ Maniche                                  │
│  | riga 1 | testo...        | 💬 tip  | × │
│  |        |                 | 📝 nota |   │
├─────────────────────────────────────────────┤
│  [Bottom bar: + Sezione  ↗ Esporta  Importa]│
└─────────────────────────────────────────────┘
```

**Nota:** Logo e footer globali (da Impostazioni) non appaiono nel canvas dell'editor, ma vengono inclusi solo nell'export PDF.

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
  "theme": "light",
  "archived": false,
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
        "id": "xyz", "title": "Corpo", "intro": "...", "outro": "...",
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

| type | Campi specifici | Posizione |
|------|----------------|----------|
| `info` | `fields[]` — Autore, Difficoltà, Categoria, Taglie, Costruzione, Tecniche | Cover block (destra) |
| `measurements` | `fields[]` — Larghezza, Lunghezza, Circonferenza | Cover block (destra, sotto divider) |
| `materials` | `fields[]` — Filato, Quantità, Metraggio, Ferri, Accessori | Sezione normale |
| `gauge` | `fields[]` — Campione, Maglie, Ferri | Sezione normale |
| `abbreviations` | `items[]` — key + val | Sezione normale |
| `steps` | `blocks[]` — title + rows[] | Sezione normale (blocchi collassabili) |
| `instructions` | `content` (string, markdown) | Sezione normale |
| `notes` | `content` (string, markdown) | Sezione normale |
| `custom` | `title` + `content` (string, markdown) | Sezione normale |

**Nota:** `info` e `measurements` sono sempre nel cover block in alto. Non appaiono come sezioni separate e non sono nel menu "+ Sezione".

---

## localStorage keys

| Key | Contenuto |
|-----|-----------|
| `wooly-index` | Array di metadati pattern `[{id, name, modified, thumbnail, archived}]` |
| `wooly-p-{id}` | Pattern completo (JSON) |
| `wooly-theme` | ID tema globale (`"dark"` o `"light"`) |
| `wooly-lang` | Lingua corrente `"it"` o `"en"` |
| `wooly-global-abbr` | Array di abbreviation sets `[{id, name, items}]` |
| `wooly-templates` | Array template custom |
| `wooly-settings` | Impostazioni globali `{logo, footer}` |

### Backup format (`wooly-backup-YYYY-MM-DD.json`)

```json
{
  "version": 2,
  "date": "2025-01-20T...",
  "patterns": [ ...tutti i pattern completi... ],
  "abbreviationSets": [ ...tutti i set abbreviazioni... ],
  "templates": [ ...template custom... ],
  "theme": "light",
  "lang": "it"
}
```

Import merge logic:
- Pattern con stesso ID → sovrascrive solo se il backup è più recente (`modified`)
- Pattern nuovi → aggiunge
- Pattern locali non nel backup → li lascia
- Abbreviation sets → sovrascrive con quelli del backup
- Template → aggiunge quelli mancanti
- Tema e lingua → sovrascrive

---

## Comunicazione tra moduli

Tutti i moduli sono ES6 con `import`/`export` espliciti. Nessun namespace globale.

Dipendenze principali:
- `app.js` importa `views/*` e `themes.js`
- `views/editor.js` importa `store`, `model`, `i18n`, `themes`, e `components/*` (escluso `settings.js`)
- `views/pattern-list.js` importa `store`, `i18n`, `themes`, `templates`, `backup`, `settings`
- `components/export.js` importa `settings.js` (per logo/footer nel PDF)
- I `components/*` importano solo `i18n`, `model`, `store` dove necessario

Nessuna dipendenza circolare.

---

## Responsive

| Breakpoint | Target | Comportamento |
|-----------|--------|---------------|
| ≤ 600px | Mobile | Colonna singola, cover stacked, bottom bar fixed |
| 601–1024px | Tablet | 2 colonne, touch target 44px, safe-area-inset per iOS |
| > 1024px | Desktop | Bottom bar statica, toolbar MD laterale |

---

## PWA

- `manifest.json` — nome, icone, display standalone
- `sw.js` — cache-first per tutti gli asset statici
- Funziona offline dopo il primo caricamento
- Installabile su home screen mobile
