# Wooly — Architettura

## Cos'è Wooly

Wooly è un editor statico di schemi a maglia che gira interamente nel browser.
Non ha backend, non ha autenticazione, non gestisce dati sensibili. L'utente
compone uno schema visivamente e lo esporta come HTML o PDF (via stampa).

L'uso primario è su **tablet/iPad** (Safari), con supporto completo anche da
desktop. Tutti i touch target sono ≥44×44px nel breakpoint ≤1024px.

---

## Stack

| Layer | Tecnologia |
|---|---|
| Markup | HTML5 |
| Stile | CSS3 con custom properties (variabili CSS) |
| Logica | JavaScript ES5 (vincolo esplicito del progetto) |
| Font | Google Fonts CDN (Playfair Display, DM Sans) |
| PDF | `window.print()` con `@media print` |
| Markdown | `marked.js` via CDN (jsDelivr) |
| Deployment | GitHub Pages — cartella `docs/` come root |

---

## Struttura file

```
docs/
├── index.html          # Entry point unico
├── css/
│   └── style.css       # Tutti gli stili, variabili CSS, responsive, print
└── js/
    ├── themes.js       # Array temi + Wooly.Themes
    ├── core.js         # Registry sezioni, toggle-bar, modal, import, immagine, abbr
    ├── sections.js     # Wooly.Sections: iniezione bottoni editor, duplica, elimina
    ├── drag.js         # Wooly.Drag: drag & drop mouse e touch
    ├── steps.js        # Wooly.Steps: timeline righe, note, tip
    ├── export.js       # Wooly.Export: HTML e PDF
    ├── translate.js    # Wooly.Translate: toggle IT/EN
    └── markdown.js     # Wooly.Markdown: rendering markdown, toolbar MD
```

---

## Ordine di caricamento script

L'ordine è significativo perché i moduli comunicano tramite il namespace globale
`window.Wooly`. Tutti gli script hanno `defer`.

```
marked.js (CDN) → themes.js → core.js → sections.js → drag.js → steps.js → export.js → translate.js → markdown.js
```

Dipendenze critiche:
- `core.js` chiama `Wooly.Sections.init` — definito in `sections.js`
- `core.js` chiama `Wooly.Translate.apply` — definito in `translate.js`
- `core.js` chiama `Wooly.Export.pdf/html` — definito in `export.js`
- `sections.js` chiama `Wooly.confirmDelete` e `Wooly.rebuildToggleBar` — alias
  definiti in `core.js` dopo il modulo
- `drag.js` è indipendente, si attacca al canvas via event listener

---

## Namespace globale `Wooly`

Ogni modulo estende `window.Wooly` con il proprio sotto-oggetto:

| Proprietà | Definita in | Contenuto |
|---|---|---|
| `Wooly.Themes` | `themes.js` | `apply`, `toggleMenu` |
| `Wooly.core` | `core.js` | `init`, `confirmDelete`, `rebuildToggleBar`, `addSection`, `registry` |
| `Wooly.Sections` | `sections.js` | `init`, `initAll` |
| `Wooly.Drag` | `drag.js` | `init` |
| `Wooly.Steps` | `steps.js` | `addStep`, `addBlock`, `delStep`, `addTip`, `addNoteBetween`, `makeStepHTML`, `renumber` |
| `Wooly.Export` | `export.js` | `pdf`, `html` |
| `Wooly.Translate` | `translate.js` | `apply`, `toggle`, `lang` (getter) |
| `Wooly.Markdown` | `markdown.js` | `init`, `initAll` |

`core.js` espone anche alias diretti su `Wooly` per retrocompatibilità:
`Wooly.init`, `Wooly.confirmDelete`, `Wooly.rebuildToggleBar`, `Wooly.addSection`,
`Wooly.registry`.

---

## DOM principale

```
body
├── .toolbar                        # Barra superiore sticky
│   ├── #btn-pdf                    # → Wooly.Export.pdf()
│   ├── #btn-export                 # → Wooly.Export.html()
│   ├── label > #import-input       # → core.importHTML()
│   ├── #theme-picker
│   │   ├── #theme-toggle           # → Wooly.Themes.toggleMenu()
│   │   └── #theme-menu             # Popolato da Wooly.Themes.buildMenu()
│   └── #lang-toggle                # → Wooly.Translate.toggle()
├── #toggle-bar                     # Chip sezioni rimosse — popolato da rebuildToggleBar()
├── #canvas                         # Area esportabile (CSS grid 2 colonne)
│   ├── .header                     # Immagine + titolo + sottotitolo
│   └── .section[id][data-label]    # Sezioni riordinabili
│       ├── .drag-handle            # ☰ — iniettato da Wooly.Sections.init()
│       ├── .layout-toggle          # ↔ — iniettato da Wooly.Sections.init()
│       ├── .dup-section            # ⧉ — iniettato da Wooly.Sections.init()
│       └── .delete-section         # × — iniettato da Wooly.Sections.init()
├── <template id="tpl-sec-*">       # Template HTML per ogni sezione (6 totali)
└── #modal-overlay                  # Modal conferma eliminazione
```

---

## Sezioni disponibili

Definite come `<template id="tpl-sec-*">` in `index.html`. Il registry viene
costruito a runtime da `core.buildRegistry()` leggendo questi template.

| ID | Label | Struttura | Layout default |
|---|---|---|---|
| `sec-materiali` | Materiali | 4 campi field (Filato, Quantità, Ferri, Accessori) | `col-half` |
| `sec-abbr` | Abbreviazioni | Grid abbr-key/abbr-val + bottone aggiungi | `col-half` |
| `sec-tensione` | Tensione | 3 campi field (Campione, Maglie, Ferri) | full width |
| `sec-steps` | Steps | Blocchi steps con timeline righe | full width |
| `sec-istruzioni` | Istruzioni | Campo long-text con markdown | full width |
| `sec-note` | Note | Campo long-text con markdown | full width |

Tutte e sei le sezioni sono presenti nel DOM all'avvio. L'utente può rimuoverle
(appaiono come chip nella toggle-bar) e reinserirle (clonate dal template).

---

## Flusso dati

```
Utente modifica contenteditable
    → DOM aggiornato in tempo reale
    → nessun oggetto di stato JS separato: il DOM è lo stato

Utente clicca Esporta HTML
    → export.js carica css/style.css via XMLHttpRequest
    → clona il canvas, rimuove bottoni editor
    → inietta CSS + variabili tema (da document.body.style.cssText)
    → scarica schema-maglia.html

Utente clicca PDF
    → window.print() — @media print nasconde tutti i bottoni editor

Utente importa HTML
    → core.js legge il file con FileReader
    → DOMParser estrae .canvas
    → sostituisce canvas.innerHTML
    → rimuove tutti i .md-rendered (verranno rigenerati al blur)
    → Wooly.Sections.init() su ogni sezione
    → rebuildToggleBar() + Wooly.Translate.apply()

Utente cambia lingua
    → translate.js aggiorna textContent di tutti i nodi tradotti nel DOM

Utente cambia tema
    → themes.js chiama body.style.setProperty per ogni variabile CSS
    → salva indice in localStorage

Pagina caricata
    → themes.js legge localStorage e applica il tema salvato (default: indice 5 = Chiaro Carta)
    → core.js buildRegistry() dai <template>, bindToolbar(), bindCanvas()
    → sections.js initAll() inietta bottoni editor su tutte le sezioni iniziali
    → drag.js init() attacca eventi mouse e touch al canvas
    → markdown.js init() inizializza tutti i campi markdown + avvia MutationObserver
```

---

## Responsive e target device

L'app è ottimizzata principalmente per **tablet/iPad** (768–1024px), con supporto
desktop e mobile.

| Breakpoint | Target | Note |
|---|---|---|
| > 1024px | Desktop | Layout a 2 colonne, toolbar MD laterale alla sezione |
| ≤ 1024px | Tablet/iPad | Touch target 44px, toolbar MD sopra la sezione, `padding-top` sezioni aumentato, timeline-step colonna azioni 44px |
| ≤ 600px | Mobile | Sezioni `col-half` collassano a larghezza piena, header a colonna singola |

---

## Comunicazione tra moduli

Nessun sistema di moduli ES6. I moduli comunicano tramite:

1. **Namespace `window.Wooly`**: ogni modulo legge e scrive su `Wooly.*`
2. **DOM come stato**: lo stato dell'applicazione è il DOM — nessun oggetto separato
3. **Event delegation**: `core.bindCanvas()` gestisce tutti i click sul canvas
   con un singolo listener, smistando per classe del target
