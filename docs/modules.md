# Wooly — Documentazione Moduli

---

## `index.html`

Entry point unico. Contiene:
- Meta viewport senza `user-scalable=no`
- Link a Google Fonts (Playfair Display, DM Sans) e `css/style.css`
- Script in fondo al body, tutti con `defer`, nell'ordine corretto:
  `marked.js` (CDN jsDelivr) → `themes.js` → `core.js` → `sections.js` → `drag.js` → `steps.js` → `export.js` → `translate.js` → `markdown.js`
- Struttura DOM statica: toolbar, toggle-bar, canvas con le 6 sezioni iniziali
- 6 `<template id="tpl-sec-*">` — fonte di verità per il reinserimento sezioni
- Modal di conferma eliminazione (`#modal-overlay`)

---

## `js/themes.js`

**Responsabilità**: definire i temi e applicarli come variabili CSS inline sul `body`.

### Struttura dati

```js
var themes = [
  { id: 'dark-gold',    name: '🌑 Scuro Oro',      swatch: '#C8922A', vars: { ... } },
  { id: 'mid-graphite', name: '🌙 Medio Grafite',   swatch: '#6EC6E6', vars: { ... } },
  { id: 'light-cream',  name: '☀️ Chiaro Crema',    swatch: '#C8922A', vars: { ... } },
  { id: 'light-blush',  name: '☀️ Chiaro Rosa',     swatch: '#C04060', vars: { ... } },
  { id: 'light-mint',   name: '☀️ Chiaro Menta',    swatch: '#2E7D52', vars: { ... } },
  { id: 'light-paper',  name: '☀️ Chiaro Carta',    swatch: '#5A7A6A', vars: { ... } },
  { id: 'light-sky',    name: '☀️ Chiaro Cielo',    swatch: '#2E60C0', vars: { ... } },
];
```

7 temi. Indice 5 = "Chiaro Carta" = default se nessun tema salvato in localStorage.

### Variabili CSS definite da ogni tema

| Variabile | Uso |
|---|---|
| `--bg` | Sfondo pagina |
| `--bg-surface` | Sfondo canvas e toolbar |
| `--bg-surface-border` | Bordo canvas |
| `--text` | Testo principale |
| `--text-muted` | Testo secondario (label, abbr-val) |
| `--text-placeholder` | Placeholder campi vuoti |
| `--accent` | Colore principale |
| `--accent-dark` | Accento scuro (hover) |
| `--accent-faint` | Sfondo hover bottoni |
| `--accent-border` | Bordi chip, select, img-box |
| `--section-border` | Bordo sezioni |
| `--field-border` | Bordo tratteggiato campi |
| `--abbr-border` | Bordo tratteggiato abbreviazioni |
| `--select-bg` | Sfondo select |
| `--select-border` | Bordo select |
| `--select-option-bg` | Sfondo option |
| `--timeline-line` | Linea verticale timeline |
| `--note-bg` | Sfondo nota tra righe |
| `--tip-bg` | Sfondo bubble tip |
| `--tip-color` | Testo bubble tip |
| `--tip-empty-bg` | Sfondo bubble tip vuoto |
| `--tip-empty-border` | Bordo bubble tip vuoto |
| `--tip-empty-color` | Testo bubble tip vuoto |

Tutte le variabili hanno anche un valore default in `:root` in `style.css`
(tema dark-gold), che garantisce uno stile base anche se `themes.js` non si carica.

### API esposta (`Wooly.Themes`)

| Funzione | Descrizione |
|---|---|
| `apply(idx)` | Applica il tema per indice, aggiorna i bottoni `.theme-option`, salva in localStorage, chiude il menu |
| `toggleMenu()` | Apre/chiude il dropdown `#theme-menu` |

### Note

- `buildMenu()` e `apply()` vengono chiamate dentro `DOMContentLoaded`
- Il tema viene applicato come `style` inline sul `body` — questo è il meccanismo
  che `export.js` legge con `document.body.style.cssText` per includerlo nell'HTML esportato
- `closeMenu()` è privata (non esposta)

---

## `js/core.js`

**Responsabilità**: orchestrazione generale — registry sezioni, toggle-bar, modal
di conferma, import HTML, caricamento immagine header, aggiunta abbreviazioni,
event delegation su toolbar e canvas.

### Registry

Costruito a runtime da `buildRegistry()` leggendo i `<template id="tpl-sec-*">`
presenti in `index.html`. Ogni entry è `{ id, label, tpl }`.

### Funzioni private

| Funzione | Descrizione |
|---|---|
| `buildRegistry()` | Popola `registry[]` dai template al DOMContentLoaded |
| `cloneSection(def)` | Clona il template e restituisce il nodo `.section` |
| `bindToolbar()` | Attacca listener a tutti i bottoni della toolbar |
| `bindCanvas()` | Event delegation su `#canvas` — smista click per classe del target |
| `addAbbr(grid)` | Aggiunge una riga vuota alla griglia abbreviazioni |
| `loadImage(e)` | Legge un file immagine e lo mostra in `#img-preview` come data URL |
| `importHTML(e)` | Legge un file HTML, estrae `.canvas`, sostituisce il canvas corrente |

### API esposta (`Wooly.core` e alias diretti su `Wooly`)

| Funzione | Descrizione |
|---|---|
| `init()` | Chiamata al DOMContentLoaded: buildRegistry + bindToolbar + bindCanvas |
| `confirmDelete(onConfirm)` | Apre il modal, esegue `onConfirm` se l'utente conferma |
| `rebuildToggleBar()` | Svuota e ripopola `#toggle-bar` con i chip delle sezioni assenti |
| `addSection(def)` | Clona la sezione dal template, la appende al canvas, chiama `Wooly.Sections.init`, applica lingua, ricostruisce toggle-bar |
| `registry` | Array delle definizioni sezione (read-only in pratica) |

Alias diretti su `Wooly` per uso da altri moduli:
`Wooly.init`, `Wooly.confirmDelete`, `Wooly.rebuildToggleBar`, `Wooly.addSection`,
`Wooly.registry`.

### Dipendenze

- `Wooly.Sections.init` — definito in `sections.js`
- `Wooly.Translate.apply` / `Wooly.Translate.lang` — definito in `translate.js`
- `Wooly.Export.pdf` / `Wooly.Export.html` — definito in `export.js`
- `Wooly.Themes.toggleMenu` — definito in `themes.js`
- `Wooly.Steps.*` — definito in `steps.js`

Tutte le dipendenze sono chiamate a runtime (non al caricamento), quindi l'ordine
`defer` garantisce che siano disponibili quando servono.

---

## `js/sections.js`

**Responsabilità**: iniettare i bottoni editor (drag-handle, layout-toggle,
dup-section, delete-section) su ogni sezione, gestire duplicazione ed eliminazione.

### API esposta (`Wooly.Sections`)

| Funzione | Descrizione |
|---|---|
| `init(sec)` | Inietta i 4 bottoni editor nella sezione. Guard: se `.drag-handle` già presente, esce subito. Imposta `draggable="true"`. Il `.layout-toggle` viene creato con classe `active` se la sezione ha già `col-half`. |
| `initAll()` | Chiama `init()` su tutte le `.section` nel canvas, poi `rebuildToggleBar()` |

### Bottoni iniettati da `init()`

| Classe | Simbolo | Posizione CSS | Comportamento |
|---|---|---|---|
| `.drag-handle` | ☰ | `right: 12px` | Nessun listener — il drag è gestito da `drag.js` via evento sul canvas |
| `.layout-toggle` | ↔ | `right: 108px` | Toggle classe `col-half` sulla sezione |
| `.dup-section` | ⧉ | `right: 76px` | Clona la sezione, rimuove i bottoni dal clone, chiama `init(clone)`, applica lingua, ricostruisce toggle-bar |
| `.delete-section` | × | `right: 44px` | Chiama `Wooly.confirmDelete`, poi rimuove la sezione e ricostruisce toggle-bar |

### Note sul clone

Il clone perde l'`id` (`removeAttribute('id')`) per evitare duplicati nel DOM.
I bottoni editor vengono rimossi dal clone prima di reinizializzarli freschi.

### Dipendenze

- `Wooly.confirmDelete` — alias di `core.confirmDelete`
- `Wooly.rebuildToggleBar` — alias di `core.rebuildToggleBar`
- `Wooly.Translate.apply` / `Wooly.Translate.lang`

---

## `js/drag.js`

**Responsabilità**: drag & drop delle sezioni via mouse e touch.

### API esposta (`Wooly.Drag`)

| Funzione | Descrizione |
|---|---|
| `init()` | Attacca tutti gli event listener al canvas. Chiamata al DOMContentLoaded. |

### Implementazione

**Mouse**: eventi `dragstart`, `dragend`, `dragover`, `drop` sul canvas (delegation).
- `dragstart`: blocca se l'utente sta editando un campo (`isEditing()`)
- `drop`: chiama `insertAdjacent(moved, target)` che determina la posizione
  confrontando gli indici delle sezioni

**Touch**: eventi `touchstart`, `touchmove`, `touchend` sul canvas.
- `touchstart`: si attiva solo se il touch parte da `.drag-handle`
- `touchmove`: usa `elementFromPoint` per trovare la sezione target, `passive: false`
  per poter chiamare `preventDefault()`
- `touchend`: inserisce la sezione trascinata nella posizione corretta

### Note

- `isEditing()` controlla `document.activeElement.isContentEditable` per evitare
  che il drag parta mentre l'utente scrive in un campo
- Nessuna dipendenza da altri moduli Wooly

---

## `js/steps.js`

**Responsabilità**: gestione della timeline (righe di lavorazione), note tra righe, tip.

### Struttura DOM della timeline

```
.steps-block
├── .steps-header (contenteditable)
├── .timeline
│   ├── .timeline-step
│   │   ├── .timeline-num           ("riga N" / "row N")
│   │   ├── .timeline-content
│   │   │   ├── .timeline-text      (contenteditable, markdown)
│   │   │   ├── .add-tip button
│   │   │   └── .timeline-tip       (contenteditable, hidden di default)
│   │   └── .timeline-actions
│   │       └── .timeline-del button
│   ├── .timeline-add-note button   (tra ogni step)
│   └── .timeline-note-between      (contenteditable, creato da addNoteBetween)
└── .add-step button
```

### Helpers interni

| Funzione | Descrizione |
|---|---|
| `rowWord()` | Restituisce `'row'` o `'riga'` in base alla lingua corrente |
| `tipBtnText()` / `tipLabel()` / `tipPlaceholder()` | Testi localizzati per il tip |
| `noteLabel()` / `notePlaceholder()` | Testi localizzati per la nota |
| `makeNoteBtn()` | Crea un bottone `.timeline-add-note` localizzato |
| `renumber(timeline)` | Rinumera tutti gli `.timeline-num` nel blocco |

### API esposta (`Wooly.Steps`)

| Funzione | Descrizione |
|---|---|
| `makeStepHTML(num)` | Restituisce l'HTML interno di un `.timeline-step` con numero `num` |
| `addStep(btn)` | Aggiunge una riga alla timeline, con numerazione automatica e focus |
| `addBlock(container)` | Aggiunge un nuovo `.steps-block` con 3 righe iniziali e bottoni nota |
| `delStep(btn)` | Rimuove la riga e il nodo adiacente (successivo o precedente) se è nota o bottone nota, poi rinumera |
| `addTip(btn)` | Mostra `.timeline-tip`, nasconde il bottone. Al blur, se vuoto, ripristina |
| `addNoteBetween(btn)` | Sostituisce il bottone `+ nota` con un `.timeline-note-between` contenteditable |
| `renumber(timeline)` | Esposta per uso esterno (es. dopo import) |

### Dipendenze

- `Wooly.Translate.lang` — letto tramite `rowWord()` per localizzare i testi

---

## `js/export.js`

**Responsabilità**: esportare lo schema come HTML scaricabile o PDF via stampa.

### API esposta (`Wooly.Export`)

| Funzione | Descrizione |
|---|---|
| `pdf()` | Chiama `window.print()`. I bottoni editor sono nascosti da `@media print` nel CSS. |
| `html()` | Carica `css/style.css` via `XMLHttpRequest`, costruisce documento HTML standalone, scarica come `schema-maglia.html` |

### Dettaglio `html()`

1. Carica `css/style.css` via `XMLHttpRequest` (ES5, funziona anche su `file://`)
2. Clona il canvas, rimuove `.drag-handle`, `.delete-section`, `.dup-section`, `.layout-toggle`
3. Costruisce documento HTML con:
   - Google Fonts
   - CSS completo da `style.css`
   - Variabili tema corrente via `getThemeStyle()` (`body { ...cssText }`)
   - `innerHTML` del canvas clonato
4. Crea Blob, genera URL temporaneo, simula click su `<a download>`, revoca l'URL

### Note

- Le immagini caricate dall'utente sono già inline come data URL (base64) — incluse
  automaticamente nell'export senza fetch aggiuntivi
- `getThemeStyle()` è privata

---

## `js/translate.js`

**Responsabilità**: traduzione IT/EN dell'interfaccia.

### Dizionario `i18n`

Oggetto con chiavi `it` e `en`. Le chiavi canoniche sono le stringhe italiane.
Traduce: titoli sezioni, label campi, bottoni, "riga"/"row", testi tip e note.

### API esposta (`Wooly.Translate`)

| Funzione/Proprietà | Descrizione |
|---|---|
| `apply(newLang)` | Imposta `lang`, traduce tutti i nodi nel DOM (section-title, field-label, bottoni canvas e toggle-bar, timeline-num, add-note, add-tip, data-label/placeholder di tip e note), aggiorna il pill IT/EN |
| `toggle()` | Alterna tra `'it'` e `'en'` chiamando `apply()` |
| `lang` (getter) | Restituisce la lingua corrente |

### Meccanismo di traduzione

Per ogni elemento, `findKey(text)` cerca il testo corrente nei valori di entrambe
le lingue del dizionario. Questo permette di ritradurre in qualsiasi direzione
senza perdere la chiave originale.

`.timeline-num` usa regex `/riga|row/g` per sostituire solo la parola, preservando
il numero.

---

## `js/markdown.js`

**Responsabilità**: rendering markdown nei campi contenteditable, toolbar markdown
floating, inizializzazione automatica dei nuovi campi via MutationObserver.

### Campi inizializzati

`.long-text`, `.timeline-text`, `.field-value`, `.abbr-val`, `.subtitle`,
`.steps-header`

### Flusso per ogni campo

1. `initField(el)` attacca listener `focus` e `blur` (guard `data-md-init` evita
   doppia inizializzazione)
2. Al `focus`: mostra la toolbar markdown — su desktop posizionata lateralmente alla
   sezione (sinistra per full-width, destra per `col-half`); su tablet/iPad (≤1024px)
   posizionata sopra la sezione con layout orizzontale e bottoni 44px
3. Al `blur`: se il campo ha contenuto, crea un `div.md-rendered` con l'HTML
   parsato da `marked.parse()`, salva il sorgente in `data-md-src`, nasconde il
   campo originale
4. Al click su `.md-rendered`: rimuove il div, ripristina il contenteditable con
   il testo sorgente, sposta il cursore in fondo

### Toolbar markdown

Creata una sola volta e appesa al `body`. Bottoni: B, I, H1, H2, H3, lista
puntata, lista numerata, citazione, link. Usa `document.execCommand('insertText')`
per inserire la sintassi markdown nel campo attivo.

**Posizionamento**:
- Desktop (>1024px): verticale, a sinistra della sezione (full-width) o a destra (`col-half`)
- Tablet/iPad (≤1024px): orizzontale con `flex-wrap`, sopra la sezione; se non c'è spazio sopra, sotto

### Renderer personalizzato

- `renderer.html`: restituisce stringa vuota (blocca HTML raw nel markdown)
- `renderer.link`: aggiunge `target="_blank" rel="noopener noreferrer"`, prefissa
  URL senza protocollo con `https://`

### MutationObserver

`observer` osserva `#canvas` con `{ childList: true, subtree: true }`. Per ogni
nodo aggiunto, chiama `initField` se è direttamente un campo markdown, altrimenti
`initAll(node)` per inizializzare i campi dentro il nodo aggiunto.

### API esposta (`Wooly.Markdown`)

| Funzione | Descrizione |
|---|---|
| `init()` | Chiama `initAll()` sul documento e avvia il MutationObserver |
| `initAll(root)` | Inizializza tutti i campi markdown nel root dato (o nel documento intero) |
