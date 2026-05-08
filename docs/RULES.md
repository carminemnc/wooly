# Wooly — Regole di sviluppo

---

## Vincoli non negoziabili

- **No build step** — niente npm, webpack, vite, bundler. I file vanno serviti così come sono.
- **No framework** — niente React, Vue, Svelte, Angular.
- **ES6 modules nativi** — `<script type="module">`, `import`/`export`.
- **Deploy da `docs/`** — GitHub Pages serve questa cartella.
- **localStorage come storage** — niente backend, niente IndexedDB (per ora).
- **Un solo file CSS** — `css/style.css`.
- **marked.js unica dipendenza esterna** — da CDN, cachata dal SW.

---

## Pattern da seguire

### Aggiungere un nuovo componente

1. Crea `js/components/nome.js`
2. Esporta le funzioni pubbliche
3. Importalo dove serve (di solito `views/editor.js`)
4. Aggiungi il file alla lista `ASSETS` in `sw.js`

### Aggiungere un nuovo tipo di sezione

1. In `model.js`: aggiungi un case in `createSection()` con i campi del tipo
2. In `views/editor.js`: aggiungi il type nel case di `renderSectionBody()` (se ha `fields[]` basta aggiungerlo al case esistente)
3. In `views/editor.js`: aggiungi il type nell'array `types` in `showAddSectionMenu()` (**solo se è una sezione normale**, non per cover)
4. In `views/editor.js`: aggiungi le label nella mappa `translateFieldLabel()`
5. In `i18n.js`: aggiungi la traduzione del nome sezione e dei field label
6. In `components/export.js`: aggiungi il type nel case di `renderSectionHTML()` e in `translateLabel()`
7. In `components/export.js`: aggiungi il titolo in `getSectionTitle()`

**Nota:** `info` e `measurements` sono sezioni speciali che vivono nel cover block. Non vanno nel menu "+ Sezione". I loro campi sono renderizzati da `createCoverField()` in editor.js.

**Attenzione indici:** Quando operi su `pattern.sections` (splice, delete, duplicate), non usare mai l'indice della lista filtrata. Usa sempre `pattern.sections.findIndex(s => s.id === section.id)` per trovare l'indice reale. Quando riordini, preserva le sezioni fixed con `pattern.sections.filter(s => s.type === 'info' || s.type === 'measurements')`.

### Aggiungere una traduzione

1. In `i18n.js`: aggiungi la chiave nell'oggetto `translations` con `{ it: '...', en: '...' }`
2. Usa `t('chiave')` nel codice

### Aggiungere un tema

1. In `themes.js`: aggiungi un oggetto nell'array `themes` con `id`, `name`, `swatch`, `vars`
2. Le variabili CSS devono coprire tutte quelle definite in `:root` nel CSS
3. Aggiorna l'indice default se necessario

### Aggiungere un campo al modello pattern

1. In `model.js`: aggiungi il campo in `createPattern()` con un default
2. Assicurati che i pattern esistenti in localStorage funzionino senza il campo (backward compatible)
3. Aggiorna `ARCHITECTURE.md` con il nuovo campo

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
- Usare event delegation dove possibile (un listener sul container)
- Per menu/pannelli: `stopPropagation()` sui click interni, `mousedown` listener sul document per chiudere
- Sempre `setTimeout(..., 10)` prima di aggiungere il close listener (evita chiusura immediata)

### Salvataggio
- Mai salvare direttamente — sempre via `scheduleSave()` con debounce
- `flushSave()` prima di navigare via dalla vista
- L'indicatore "Salvato ✓" / "Salvando..." è in `#save-indicator`

---

## Cose da NON fare

- ❌ Non introdurre state management (Redux, signals, store reattivo)
- ❌ Non aggiungere dipendenze npm
- ❌ Non usare `innerHTML` per salvare stato — il JSON è la source of truth
- ❌ Non creare file HTML separati per le viste — è tutto in `index.html`
- ❌ Non usare `document.write` o `eval`
- ❌ Non modificare il formato JSON del pattern senza backward compatibility
- ❌ Non rimuovere il service worker — l'app deve funzionare offline
- ❌ Non usare indici filtrati per operare su `pattern.sections` — usare sempre `findIndex` con `section.id`
- ❌ Non sovrascrivere `pattern.sections` senza preservare le sezioni fixed (info, measurements)
- ❌ Non posizionare menu dropdown verso il basso se l'elemento è vicino alla bottom bar — usare apertura verso l'alto per l'ultimo elemento

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
- [ ] Timeline: tip e note → appaiono/scompaiono correttamente
- [ ] Contarighe → tap incrementa, long press decrementa
- [ ] Cambio tema → si applica e persiste
- [ ] Cambio lingua → traduce tutto
- [ ] Export HTML → file scaricato contiene tutto (CSS, tema, immagine)
- [ ] Export JSON → file reimportabile
- [ ] Import JSON → pattern ricostruito correttamente
- [ ] Markdown → render al blur, click per rieditare
- [ ] Immagine header → caricamento e visualizzazione

### Mobile
- [ ] Bottom bar visibile e usabile
- [ ] Touch target ≥ 44px
- [ ] Nessun overflow orizzontale
- [ ] Contarighe non copre contenuto importante

### Console
- [ ] Nessun errore JS in console
- [ ] Nessun warning critico
