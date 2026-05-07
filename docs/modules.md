# Wooly — Documentazione Moduli

---

## `index.html`

Entry point unico. Contiene:
- Meta viewport (senza `user-scalable=no` dopo fix H2)
- Link a Google Fonts e `style.css`
- CDN: `jsPDF`, `marked.js`
- Struttura DOM statica: toolbar, toggle-bar, canvas con sezioni iniziali, modal
- Script in fondo al body con `defer`

Sezioni presenti nel DOM all'avvio: tutte e sei (materiali, abbreviazioni, tensione, steps, istruzioni, note). Le sezioni vengono rimosse/reinserite dinamicamente dall'utente.

---

## `js/themes.js`

**Responsabilità**: definire i temi e applicarli come variabili CSS inline sul `body`.

### Struttura dati

```js
var themes = [
  {
    id: 'dark-gold',
    name: '🌑 Scuro Oro',
    swatch: '#C8922A',
    vars: { '--bg': '#111111', '--text': '#FAF7F0', ... }
  },
  ...
];
```

7 temi disponibili: Scuro Oro, Medio Grafite, Chiaro Crema, Chiaro Rosa, Chiaro Menta, Chiaro Carta, Chiaro Cielo.

### Variabili CSS definite da ogni tema

| Variabile | Uso |
|---|---|
| `--bg` | Sfondo pagina |
| `--bg-surface` | Sfondo canvas e toolbar |
| `--bg-surface-border` | Bordo canvas |
| `--text` | Testo principale |
| `--text-muted` | Testo secondario (label, abbr-val) |
| `--text-placeholder` | Placeholder campi vuoti |
| `--accent` | Colore principale (oro, azzurro, ecc.) |
| `--accent-dark` | Accento scuro (hover link filato) |
| `--accent-faint` | Sfondo hover bottoni |
| `--accent-border` | Bordi chip, select, img-box |
| `--section-border` | Bordo sezioni |
| `--field-border` | Bordo tratteggiato campi |
| `--abbr-border` | Bordo tratteggiato abbreviazioni |
| `--select-bg` | Sfondo select dir/rov |
| `--select-border` | Bordo select dir/rov |
| `--select-option-bg` | Sfondo option nei select |
| `--timeline-line` | Linea verticale timeline |
| `--note-bg` | Sfondo nota tra righe |
| `--tip-bg` | Sfondo bubble tip |
| `--tip-color` | Testo bubble tip |
| `--tip-empty-bg` | Sfondo bubble tip vuoto |
| `--tip-empty-border` | Bordo bubble tip vuoto |
| `--tip-empty-color` | Testo bubble tip vuoto |

### Funzioni esposte globalmente

- `applyTheme(idx)` — applica il tema per indice, aggiorna `currentThemeIdx`, chiude il menu
- `buildThemeMenu()` — popola `#theme-menu` con i bottoni tema
- `toggleThemeMenu()` — apre/chiude il dropdown tema
- `closeThemeMenu()` — chiude il dropdown tema

### Variabili globali

- `themes` — array dei temi
- `currentThemeIdx` — indice tema corrente (default 0)

### Note

- `buildThemeMenu()` e `applyTheme(0)` vengono chiamate in coda al file, prima che gli altri script siano caricati. Funziona perché gli script sono in fondo al body.
- Il tema viene applicato come `style` inline sul `body` — questo è il meccanismo che `export.js` legge con `document.body.style.cssText` per includerlo nell'HTML esportato.

---

## `js/ui.js`

**Responsabilità**: registry delle sezioni, toggle-bar, modal di conferma, import HTML, caricamento immagine, aggiunta abbreviazioni.

### `sectionRegistry`

Array di oggetti `{ id, label, html }` che definisce tutte le sezioni disponibili. È la fonte di verità per ricreare una sezione dopo che è stata rimossa.

### Funzioni esposte globalmente

| Funzione | Descrizione |
|---|---|
| `confirmDelete(onConfirm)` | Apre il modal di conferma, esegue `onConfirm` se l'utente conferma. Sposta il focus su `#modal-cancel` all'apertura. |
| `rebuildToggleBar()` | Svuota e ripopola la toggle-bar con i chip delle sezioni assenti dal DOM. |
| `addSection(def)` | Crea una sezione dal registry, la appende al canvas, chiama `initSectionHandles`, ripopola filati se `sec-materiali`, applica lingua corrente, ricostruisce toggle-bar. |
| `importHTML(e)` | Legge un file HTML, estrae `.canvas`, sostituisce il canvas corrente, reinizializza i drag handle su tutte le sezioni. |
| `loadImage(e)` | Legge un file immagine e lo mostra in `#img-preview`. |
| `addAbbr()` | Aggiunge una riga vuota alla griglia abbreviazioni. |

### Dipendenze

- Chiama `initSectionHandles(sec)` — definita in `drag.js` (caricato dopo)
- Chiama `applyLang(lang)` — definita in `translate.js` (caricato dopo)
- Chiama `appendFilatiOptions(_filatiCache)` — definita in `filati.js` (non in lista script, caricato separatamente — **attenzione: `filati.js` non è incluso in `index.html`**)

---

## `js/drag.js`

**Responsabilità**: drag & drop delle sezioni, iniezione dei bottoni di controllo (handle, layout, duplica, elimina).

### `initSectionHandles(sec)`

Funzione assegnata come variabile globale implicita (`window.initSectionHandles`). Inietta in ogni sezione:

1. `.drag-handle` (☰) — posizione `right: 12px`, cursore grab
2. `.layout-toggle` (↔) — posizione `right: 108px`, alterna classe `col-half`
3. `.dup-section` (⧉) — posizione `right: 76px`, clona la sezione
4. `.delete-section` (×) — posizione `right: 44px`, apre modal di conferma

Ordine di inserimento nel DOM (da sinistra a destra visivamente, da destra a sinistra nel codice):
- `handle` inserito come `firstChild`
- `layout` inserito dopo `handle`
- `dup` inserito dopo `layout`
- `del` inserito dopo `dup` (fix D2 applicato)

### Comportamento duplica

Il clone viene inserito dopo la sezione originale. I bottoni handle clonati vengono rimossi e ricreati freschi da `initSectionHandles`. Dopo la clonazione viene chiamato `applyLang(lang)` (fix T2 applicato).

### Drag & drop

Implementato sia per mouse (eventi `dragstart`, `dragend`, `dragover`, `drop`) che per touch (`touchstart`, `touchmove`, `touchend`). Il riordinamento avviene inserendo la sezione trascinata prima o dopo il target in base agli indici.

### Dipendenze

- Chiama `confirmDelete(onConfirm)` — definita in `ui.js`
- Chiama `rebuildToggleBar()` — definita in `ui.js`
- Chiama `applyLang(lang)` — definita in `translate.js`
- Legge `lang` — variabile globale di `translate.js`

---

## `js/steps.js`

**Responsabilità**: gestione della timeline (righe di lavorazione), note tra righe, tip.

### Struttura DOM della timeline

```
.steps-block
├── .steps-header (contenteditable)
├── .timeline
│   ├── .timeline-step
│   │   ├── .timeline-num          ("riga N")
│   │   ├── .timeline-content
│   │   │   ├── .timeline-text (contenteditable, markdown)
│   │   │   └── .timeline-tip  (contenteditable, hidden di default)
│   │   └── .timeline-actions
│   │       ├── .add-tip button
│   │       └── .timeline-del button
│   ├── .timeline-add-note button  (tra ogni step)
│   └── .timeline-note-between (contenteditable, creato da addNoteBetween)
└── .add-step button
```

### Funzioni esposte globalmente

| Funzione | Descrizione |
|---|---|
| `makeStepHTML(num)` | Restituisce l'HTML interno di un `.timeline-step` con numero `num`. |
| `addStep(btn)` | Aggiunge una riga alla timeline del blocco corrente, con numerazione automatica. |
| `addStepsBlock()` | Aggiunge un nuovo blocco steps con 3 righe iniziali. |
| `delStep(btn)` | Rimuove la riga e il bottone nota successivo, poi rinumera tutte le righe del blocco (fix S2 applicato). |
| `addTip(btn)` | Mostra il campo `.timeline-tip`, nasconde il bottone `+ tip`. Al blur, se vuoto, ripristina il bottone. |
| `addNoteBetween(btn)` | Sostituisce il bottone `+ nota` con un `div.timeline-note-between` contenteditable. |

### Note su `delStep`

Dopo la rimozione, rinumera usando `lang` per determinare la parola ("riga" o "row").

---

## `js/export.js`

**Responsabilità**: esportare lo schema come HTML o PDF.

### `exportHTML()`

1. Fetch di `css/style.css` (relativo)
2. Costruisce un documento HTML standalone con:
   - Font Google Fonts
   - CSS completo da `style.css`
   - Variabili tema corrente via `getThemeStyle()` (legge `document.body.style.cssText`)
   - `innerHTML` del canvas
3. Scarica come `schema-maglia.html`

### `exportPDF()`

1. Aggiunge classe `.exporting` al canvas (nasconde i controlli via CSS)
2. Chiama `window.print()`
3. Rimuove la classe `.exporting`

### `getThemeStyle()`

Helper che restituisce `'body{' + document.body.style.cssText + '}'` — cattura le variabili CSS applicate inline da `themes.js`.

### Note

- `jsPDF` è caricato nel `<head>` ma non viene usato — `exportPDF` usa `window.print()`.
- L'export HTML non include le immagini caricate dall'utente come file separati — le immagini sono già inline come data URL (base64) grazie a `loadImage`.

---

## `js/translate.js`

**Responsabilità**: traduzione IT/EN dell'interfaccia.

### Dizionario `i18n`

Oggetto con chiavi `it` e `en`. Le chiavi sono le stringhe italiane originali. Traduce: titoli sezioni, label campi, bottoni, "riga"/"row", "+ nota"/"+ note".

### Variabili globali

- `lang` — lingua corrente (`'it'` o `'en'`), default `'it'`

### Funzioni esposte globalmente

| Funzione | Descrizione |
|---|---|
| `applyLang(newLang)` | Aggiorna `lang`, traduce tutti i nodi `.section-title`, `.field-label`, bottoni nel canvas e toggle-bar, `.timeline-num`, `.timeline-add-note`. Aggiorna l'indicatore visivo IT/EN. |
| `toggleLang()` | Alterna tra IT e EN chiamando `applyLang`. |

### Meccanismo di traduzione

Per ogni elemento tradotto, cerca la chiave nel dizionario confrontando il testo corrente con i valori di entrambe le lingue. Questo permette di ritradurre in qualsiasi direzione senza perdere la chiave.

`.timeline-num` usa regex `/riga|row/g` per sostituire con la parola nella lingua target (fix T3 applicato).

---

## `js/markdown.js`

**Responsabilità**: rendering markdown nei campi `.long-text` e `.timeline-text`.

### Flusso

1. Al `blur` di un campo contenteditable, il testo viene estratto, parsato con `marked.js` e sostituito con un `div.md-rendered`
2. Al click su `.md-rendered`, il div viene rimosso e il campo contenteditable viene ripristinato con il testo sorgente

### Funzioni

| Funzione | Descrizione |
|---|---|
| `getTextFromEditable(el)` | Estrae testo plain da un contenteditable, normalizzando `<br>` e `</div>` in newline. |
| `preprocessMarkdown(src)` | Aggiunge righe vuote prima di heading/liste/blockquote se mancanti. |
| `initMarkdownField(el)` | Attacca il listener `blur` a un campo. Usa `data-md-init` per evitare doppia inizializzazione. |
| `initAllMarkdownFields(root)` | Inizializza tutti i campi `.long-text` e `.timeline-text` nel root dato. |
| `editMarkdownField(rendered, el)` | Ripristina il contenteditable dal sorgente salvato in `data-md-src`. |

### Renderer personalizzato

I link vengono resi con `target="_blank" rel="noopener noreferrer"`. Gli URL senza protocollo ricevono `https://` come prefisso.

### MutationObserver

`mdObserver` osserva il canvas per nodi aggiunti dinamicamente e inizializza i nuovi campi markdown automaticamente.

### Sicurezza

`marked.parse()` produce HTML che viene assegnato a `innerHTML`. Il contenuto è generato dall'utente stesso (nessun dato esterno), ma è comunque un vettore XSS se il file HTML esportato viene condiviso e aperto da altri. Il renderer non sanitizza l'output.
