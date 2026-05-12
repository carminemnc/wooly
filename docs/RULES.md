# Wooly — Regole di sviluppo

---

## Vincoli non negoziabili

- **No build step** — niente npm, webpack, vite, bundler.
- **No framework** — niente React, Vue, Svelte, Angular.
- **ES6 modules nativi** — `<script type="module">`, `import`/`export`.
- **Deploy da `docs/`** — GitHub Pages serve questa cartella.
- **localStorage come storage** — niente backend, niente IndexedDB (per ora).
- **Un solo file CSS** — `css/style.css`.
- **marked.js unica dipendenza esterna** — da CDN, cachata dal SW.

---

## Pattern da seguire

### Aggiungere un template PDF

1. Duplica `js/print-styles/elegant.js` con un nuovo nome
2. Cambia `id` e `name` esportati
3. Modifica la palette colori `c` in cima a `css()` per il nuovo stile
4. In `js/print-styles/index.js`: importa il modulo e aggiungilo all'array `templates`
5. Aggiungi il file alla lista `ASSETS` in `sw.js`
6. Il template appare automaticamente nel submenu PDF

### Aggiungere un nuovo componente

1. Crea `js/components/nome.js`
2. Esporta le funzioni pubbliche
3. Importalo dove serve (di solito `views/editor.js`)
4. Aggiungi il file alla lista `ASSETS` in `sw.js`

### Aggiungere un nuovo tipo di sezione

1. In `model.js`: aggiungi un case in `createSection()` con i campi del tipo
2. In `views/editor.js`: aggiungi il type nel case di `renderSectionBody()`
3. In `views/editor.js`: aggiungi il type nell'array `types` in `showAddSectionMenu()` (**solo se è una sezione normale**)
4. In `views/editor.js`: aggiungi le label nella mappa `translateFieldLabel()`
5. In `i18n.js`: aggiungi la traduzione del nome sezione e dei field label
6. In `print-styles/elegant.js`: aggiungi il type nel case di `renderSection()`
7. In `print-styles/elegant.js`: se ha label, aggiungi la traduzione in `translateLabel()`

**Nota:** `info` e `measurements` sono sezioni speciali nel cover block. Non vanno nel menu "+ Sezione".

**Attenzione indici:** Usare sempre `pattern.sections.findIndex(s => s.id === section.id)` per trovare l'indice reale. Preservare le sezioni fixed con `pattern.sections.filter(s => s.type === 'info' || s.type === 'measurements')`.

### Aggiungere una traduzione

1. In `i18n.js`: aggiungi la chiave con `{ it: '...', en: '...' }`
2. Usa `t('chiave')` nel codice

### Aggiungere un tema

1. In `themes.js`: aggiungi un oggetto con `id`, `name`, `vars`
2. Le variabili CSS devono coprire tutte quelle in `:root`

### Aggiungere un campo al modello pattern

1. In `model.js`: aggiungi il campo in `createPattern()` con un default
2. Assicurati backward compatibility (pattern esistenti senza il campo non crashano)
3. Aggiorna `ARCHITECTURE.md`

---

## Convenzioni di codice

### Naming
- File: `kebab-case.js`
- Funzioni: `camelCase`
- Costanti: `UPPER_SNAKE_CASE`
- Classi CSS: `kebab-case`
- Dataset attributes: `camelCase` (`el.dataset.sectionId`)

### Struttura funzioni in un view
```
export function renderXxx(root, ...) { }  // entry point pubblico
function renderYyy() { }                  // rendering privato
function createZzzEl() { }               // crea un elemento DOM
function bindEvents() { }                // attacca listener
function handleAction() { }             // gestisce un'azione utente
function scheduleSave() { }             // utility
```

### Event handling
- Event delegation dove possibile
- Per menu/pannelli: `stopPropagation()` sui click interni, `mousedown` listener sul document per chiudere
- Sempre `setTimeout(..., 10)` prima di aggiungere il close listener

### Salvataggio
- Mai salvare direttamente — sempre via `scheduleSave()` con debounce
- `flushSave()` prima di navigare via dalla vista
- L'indicatore "Salvato ✓" / "Salvando..." / "⚠️" è in `#save-indicator`
- `savePattern()` ritorna `true`/`false` — gestire il `false` con toast di errore

---

## Cose da NON fare

- ❌ Non introdurre state management (Redux, signals, store reattivo)
- ❌ Non aggiungere dipendenze npm
- ❌ Non usare `innerHTML` per salvare stato — il JSON è la source of truth
- ❌ Non creare file HTML separati per le viste
- ❌ Non usare `document.write` o `eval`
- ❌ Non modificare il formato JSON senza backward compatibility
- ❌ Non rimuovere il service worker
- ❌ Non usare indici filtrati per operare su `pattern.sections`
- ❌ Non sovrascrivere `pattern.sections` senza preservare le sezioni fixed

---

## Checklist pre-push

### Struttura
- [ ] Tutti i file JS in `sw.js` ASSETS sono corretti
- [ ] `index.html` referenzia solo `app.js` come module
- [ ] Nessun path rotto

### Funzionalità
- [ ] Crea pattern vuoto → funziona
- [ ] Crea pattern da template → funziona
- [ ] Modifica campi → autosave funziona (indicatore cambia)
- [ ] Torna alla lista → pattern appare con nome aggiornato
- [ ] Ricarica pagina → pattern persistono
- [ ] Aggiungi/elimina/duplica sezione → funziona
- [ ] Drag & drop sezioni → funziona (mouse e touch)
- [ ] Timeline: aggiungi/elimina righe → rinumerazione corretta
- [ ] Timeline: drag & drop righe → riordino con handle ☰, rinumerazione corretta con repeat
- [ ] Timeline: repeat righe → ×N cliccabile, rinumerazione automatica
- [ ] Timeline: tip e note → badge sulla destra, scompaiono al blur se vuoti
- [ ] Timeline: intro/outro per blocco → editabili e salvati
- [ ] Sezione steps: intro/outro di sezione → editabili e salvati, appaiono nel PDF
- [ ] Blocchi collassabili → collapsed se con contenuto, espansi se vuoti
- [ ] Duplica/Elimina blocco → bottoni ⧉ e × nell'header, confirm modal per eliminazione
- [ ] Abbreviation sets → carica/salva/elimina funzionano
- [ ] Cambio tema → si applica e persiste
- [ ] Cambio lingua → traduce tutto
- [ ] Export PDF → template "Elegante", window.print(), cover con immagine sx + info dx, footer in alto sotto logo, label tradotte IT/EN
- [ ] Export JSON → file reimportabile
- [ ] Import JSON → nel menu "+ Nuovo pattern" → "Importa file", gestisce newline e ID mancanti
- [ ] Import da LLM → pattern generato con IMPORT-PROMPT.txt importabile senza errori
- [ ] Sezione video → link editabili, QR code nel PDF export
- [ ] Markdown → render al caricamento e al blur su Istruzioni, Note, Custom. Toolbar con toggle. Plain text paste
- [ ] Immagine header → caricamento e visualizzazione
- [ ] Impostazioni → logo e footer (footer appare in alto nel PDF sotto il logo)
- [ ] Backup/Ripristino → v2 con abbreviation sets
- [ ] Sezione custom → rinominabile con ✏️
- [ ] localStorage pieno → indicatore ⚠️ + toast

### Mobile
- [ ] Bottom bar visibile e usabile (2 bottoni: + Sezione, Esporta)
- [ ] Topbar e bottombar fixed su tutti i device
- [ ] Touch target ≥ 44px (bottoni principali), 32px (blocchi steps su tablet)
- [ ] Nessun overflow orizzontale
- [ ] Abbreviazioni in colonna singola quando sezione è col-half

### Console
- [ ] Nessun errore JS in console
- [ ] Nessun warning critico
