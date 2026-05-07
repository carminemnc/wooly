# Wooly — Architettura

## Cos'è Wooly

Wooly è un editor statico di schemi a maglia che gira interamente nel browser. Non ha backend, non ha autenticazione, non gestisce dati sensibili. L'utente compone uno schema visivamente e lo esporta come HTML, PDF (via stampa) o PNG (non ancora implementato).

---

## Stack

| Layer | Tecnologia |
|---|---|
| Markup | HTML5 |
| Stile | CSS3 con custom properties (variabili CSS) |
| Logica | JavaScript ES5 (vincolo esplicito del progetto) |
| Font | Google Fonts CDN (Playfair Display, DM Sans) |
| PDF | `window.print()` con `@media print` |
| Markdown | `marked.js` via CDN |
| PDF alternativo | `jsPDF` via CDN (caricato ma non usato attivamente) |
| Filati | Fetch da `https://caveoves.it/data/` (filati.json, kit.json) |

---

## Struttura file

```
docs/
├── index.html          # Entry point unico
├── css/
│   └── style.css       # Tutti gli stili, inclusi temi e media query
└── js/
    ├── themes.js       # Definizione temi e applicazione variabili CSS
    ├── ui.js           # Registry sezioni, toggle-bar, modal, import/export immagine
    ├── drag.js         # Drag & drop sezioni, bottoni handle/layout/dup/del
    ├── steps.js        # Logica timeline (aggiungi/elimina riga, note, tip)
    ├── export.js       # Export HTML e PDF
    ├── filati.js       # Fetch filati da API esterna, select filato
    ├── translate.js    # i18n IT/EN
    └── markdown.js     # Rendering markdown nei campi long-text e timeline-text
```

---

## Ordine di caricamento script

L'ordine è significativo perché i file comunicano tramite variabili globali:

```
themes.js → ui.js → steps.js → export.js → translate.js → drag.js → markdown.js
```

Dipendenze critiche:
- `drag.js` assegna `initSectionHandles` (globale implicita su `window`) che viene chiamata da `ui.js` e `drag.js` stesso
- `translate.js` espone `applyLang(lang)` e la variabile `lang`, usate da `ui.js` e `drag.js`
- `filati.js` espone `appendFilatiOptions(_filatiCache)` usata da `ui.js` in `addSection`
- `markdown.js` osserva il canvas con `MutationObserver` e inizializza i campi aggiunti dinamicamente

---

## DOM principale

```
body
├── .toolbar                    # Barra superiore sticky (PDF, Esporta, Importa, Tema, Lingua)
├── .toggle-bar#toggle-bar      # Chip per reinserire sezioni rimosse
├── .canvas#canvas              # Area esportabile (grid 2 colonne)
│   ├── .header                 # Immagine + titolo + sottotitolo
│   └── .section[id][data-label]  # Sezioni riordinabili via drag
│       ├── .drag-handle        # ☰ — iniettato da drag.js
│       ├── .layout-toggle      # ↔ — iniettato da drag.js
│       ├── .dup-section        # ⧉ — iniettato da drag.js
│       └── .delete-section     # × — iniettato da drag.js
└── .modal-overlay#modal-overlay  # Modal conferma eliminazione
```

---

## Sezioni disponibili

Definite in `sectionRegistry` in `ui.js`:

| ID | Label | Struttura |
|---|---|---|
| `sec-materiali` | Materiali | Campi field (Filato, Quantità, Ferri, Accessori) |
| `sec-abbr` | Abbreviazioni | Grid abbr-key / abbr-val + bottone aggiungi |
| `sec-tensione` | Tensione | Campi field (Campione, Maglie, Ferri) |
| `sec-steps` | Steps | Blocchi steps con timeline righe |
| `sec-istruzioni` | Istruzioni | Campo long-text con markdown |
| `sec-note` | Note | Campo long-text con markdown |

Ogni sezione ha un `id` univoco. Se rimossa, appare come chip nella toggle-bar. Se reinserita, viene ricreata dal registry HTML.

---

## Flusso dati

```
Utente modifica contenteditable
    → DOM aggiornato in tempo reale (nessun state JS)

Utente clicca Esporta HTML
    → export.js legge innerHTML del canvas
    → inietta CSS + variabili tema corrente
    → scarica file .html

Utente clicca PDF
    → export.js aggiunge classe .exporting al canvas
    → window.print() — @media print nasconde i controlli
    → rimuove classe .exporting

Utente cambia lingua
    → translate.js aggiorna textContent di tutti i nodi tradotti nel DOM

Utente cambia tema
    → themes.js chiama body.style.setProperty per ogni variabile CSS
```

---

## Comunicazione tra moduli

Non c'è un sistema di moduli (niente import/export ES6, niente bundler). I moduli comunicano tramite:

1. **Variabili globali su `window`**: `initSectionHandles`, `lang`, `_filatiCache`, `themes`, `currentThemeIdx`
2. **DOM come stato**: lo stato dell'applicazione è il DOM stesso — nessun oggetto di stato separato
3. **Funzioni globali richiamate da `onclick` inline nell'HTML**: `addAbbr()`, `addStep()`, `delStep()`, `addNoteBetween()`, `addTip()`, `addStepsBlock()`, `loadImage()`, `exportPDF()`, `exportHTML()`, `importHTML()`, `toggleLang()`, `toggleThemeMenu()`
