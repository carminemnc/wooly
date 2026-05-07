# Wooly — Review (aggiornato)

## Contesto

Wooly è un editor statico di schemi a maglia. Nessun backend, nessun pagamento, nessun dato sensibile. L'utente compone uno schema nel browser e lo esporta come PNG, PDF o HTML. Il rigore qui non è sulla sicurezza dei pagamenti ma sulla **correttezza funzionale**, sulla **robustezza dell'editor** e sulla **qualità del codice**.

Per la documentazione completa dell'applicazione vedere:
- `architecture.md` — struttura, stack, flusso dati, comunicazione tra moduli
- `modules.md` — documentazione per ogni file JS

---

## Dimensioni di Review

1. Correttezza funzionale
2. Sicurezza (XSS, input non sanitizzato)
3. ES5 compliance (tutto il JS in `docs/js/` deve essere ES5)
4. Principi ingegneristici (DRY, SRP, YAGNI, dead code)
5. UX e qualità visiva
6. Mobile e responsività
7. Accessibilità
8. Performance
9. Salute del progetto (struttura, manutenibilità)
10. Consistenza del design (temi, variabili CSS)

---

## Stato fix precedenti

| ID | Fix | Stato |
|----|-----|-------|
| H1 | Indentazione `<h1>` | ✅ Risolto |
| H2 | `user-scalable=no` rimosso | ✅ Risolto |
| H3 | `role="dialog"`, `aria-modal`, focus trap modal | ✅ Risolto |
| H4 | `defer` sugli script | ✅ Risolto |
| H5 | `img.alt` dinamico su filato | ✅ Risolto (in `selectFilato`) |
| U2 | Select filati vuota al reinserimento sezione | ✅ N/A — `filati.js` eliminato, sezione Materiali è free text |
| U3 | `innerHTML = ''` in `rebuildToggleBar` | ⚪ Accettato (nessuna azione) |
| D1 | `initSectionHandles` globale implicita | ✅ Risolto (`var initSectionHandles` dichiarata in `ui.js`) |
| D2 | Ordine bottoni sezione errato | ✅ Risolto (`del` dopo `dup`) |
| D3 | `NodeList.forEach` non ES5 | ✅ Risolto (`Array.prototype.forEach.call`) |
| S1 | `makeStepHTML` non riutilizzata nel registry | ⚠️ Aperto — il registry in `ui.js` non usa `makeStepHTML` |
| S2 | Numerazione righe non aggiornata dopo eliminazione | ✅ Risolto |
| E1 | HTML esportato senza tema | ✅ Risolto (`getThemeStyle()`) |
| E2 | PNG/PDF con bottoni editor | ✅ Risolto (`.canvas.exporting` + `window.print`) |
| F1 | `Promise.all` non ES5 | ✅ Risolto (fetch sequenziali) |
| T1 | Sezioni aggiunte non tradotte | ✅ Risolto (`applyLang` in `addSection`) |
| T2 | Sezioni duplicate non tradotte | ✅ Risolto (`applyLang` dopo `initSectionHandles(clone)`) |
| T3 | Regex `timeline-num` poco leggibile | ✅ Risolto (`/riga|row/g`) |
| TH1 | `applyTheme` senza DOMContentLoaded | ⚪ Accettato (script in fondo al body) |
| C1 | Nessun fallback CSS | ✅ Risolto (fallback su `body`) |
| C2 | `.toggle-chip.off` dead CSS | ✅ Risolto (rimosso) |
| C3 | `@media print` non nascondeva i controlli | ✅ Risolto (già presente nel CSS) |

---

## Findings attuali

---

### `index.html`

#### X3 — ~~`jsPDF` caricato ma non usato~~ ✅ Risolto

#### X2 — CDN senza Subresource Integrity (SRI)
- **Severity**: Low
- **Dimensioni**: 2 (sicurezza)
- **Issue**: `jsPDF` e `marked.js` sono caricati da CDN senza attributo `integrity`. Se il CDN viene compromesso, codice malevolo viene eseguito nel browser dell'utente.
- **Impact**: Supply chain attack teorico. Basso rischio pratico per un tool locale, ma è una best practice mancante.
- **Fix**: Aggiungere `integrity="sha384-..."` e `crossorigin="anonymous"` ai tag script CDN. I valori SRI si generano su [srihash.org](https://www.srihash.org/).

#### X3 — `jsPDF` caricato ma non usato
- **Severity**: Low
- **Dimensioni**: 4 (YAGNI), 8 (performance)
- **Issue**: `jsPDF` è incluso nel `<head>` (senza `defer`) ma `exportPDF` usa `window.print()`. La libreria pesa ~300KB e blocca il parsing HTML essendo nell'`<head>` senza `defer`.
- **Impact**: Leggero rallentamento al caricamento iniziale, dipendenza inutile.
- **Fix**: Rimuovere il tag `<script>` di `jsPDF` oppure spostarlo in fondo al body con `defer` se si prevede di usarlo in futuro.

---

### `js/ui.js`

#### X4 — `sectionRegistry` duplica l'HTML delle sezioni già presenti in `index.html`
- **Severity**: Low
- **Dimensioni**: 4 (DRY)
- **Issue**: La struttura HTML delle sezioni è definita due volte: una volta in `index.html` (DOM iniziale) e una volta nel `sectionRegistry` in `ui.js` (per il reinserimento). Se si modifica la struttura di una sezione in un posto, va aggiornata anche nell'altro.
- **Impact**: Manutenibilità ridotta. Rischio di divergenza tra la sezione iniziale e quella reinserita.
- **Fix**: Non esiste una soluzione semplice senza refactoring architetturale. Documentare esplicitamente che le due definizioni devono essere mantenute sincronizzate.

#### X5 — ~~`importHTML` non chiama `applyLang` dopo il reinserimento~~ ✅ Risolto

---

### `js/drag.js`

#### X6 — ~~`initSectionHandles` globale implicita~~ ✅ Risolto

---

### `js/steps.js`

#### X7 — `sectionRegistry` in `ui.js` non usa `makeStepHTML`
- **Severity**: Low
- **Dimensioni**: 4 (DRY)
- **Issue**: `makeStepHTML(num)` è definita in `steps.js` ma il registry in `ui.js` costruisce l'HTML delle righe con stringhe duplicate. Se cambia la struttura di una riga (es. si aggiunge un campo), va aggiornata in due posti.
- **Impact**: Manutenibilità ridotta. Rischio di divergenza tra righe aggiunte dinamicamente e righe nel registry.
- **Fix**: Spostare `makeStepHTML` in `ui.js` (caricato prima di `steps.js`) e usarla nel registry. Oppure accettare la duplicazione e documentarla.

#### X8 — `delStep` rinumera usando `lang` ma `lang` potrebbe non essere definita
- **Severity**: Low
- **Dimensioni**: 1 (correttezza), 3 (ES5)
- **Issue**: `delStep` usa `typeof lang !== 'undefined' && lang === 'en'` per determinare la parola. Questo è corretto come guard, ma se `translate.js` non è caricato, la numerazione usa sempre "riga" — comportamento accettabile ma non documentato.
- **Impact**: Nessuno pratico nell'attuale configurazione.
- **Fix**: Nessuna azione necessaria, ma documentare la dipendenza implicita.

---

### `js/export.js`

#### X9 — ~~`exportHTML` include i bottoni di controllo nell'HTML esportato~~ ✅ Risolto

---

### `js/markdown.js`

#### X10 — ~~XSS nell'export HTML tramite `marked.parse`~~ ✅ Risolto (renderer html disabilitato)

#### X11 — `MutationObserver` non viene disconnesso
- **Severity**: Low
- **Dimensioni**: 8 (performance)
- **Issue**: `mdObserver` osserva il canvas per tutta la vita della pagina. Non viene mai disconnesso. Per un'app a pagina singola senza navigazione questo è accettabile, ma è un pattern da notare.
- **Impact**: Nessuno pratico.
- **Fix**: Nessuna azione necessaria.

---

### `js/themes.js`

#### X12 — ~~`applyTheme` non persiste il tema scelto~~ ✅ Risolto

---

### `css/style.css`

#### X13 — Variabili CSS senza fallback (parzialmente risolto)
- **Severity**: Low
- **Dimensioni**: 1 (correttezza), 10 (consistenza design)
- **Issue**: Il fix C1 ha aggiunto fallback solo su `body` per `--bg` e `--text`. Tutte le altre proprietà nel file usano ancora `var(--nome)` senza fallback. Se `themes.js` fallisce, la maggior parte dell'interfaccia è senza stile.
- **Impact**: Ridotto rispetto a prima (almeno sfondo e testo hanno un fallback), ma non completo.
- **Fix**: Aggiungere fallback alle proprietà più critiche (toolbar, canvas, sezioni). Oppure definire le variabili del tema default in un blocco `:root` nel CSS, così funzionano anche senza JS.

#### X14 — ~~Nessun `:root` con variabili default~~ ✅ Risolto

---

## Riepilogo

### 🔴 Deal Breakers (fix subito)

Nessuno.

### 🟡 Should Fix

Nessuno.

### 🟢 Nice to Have (può aspettare)

| ID | File | Issue |
|----|------|-------|
| X2 | `index.html` | CDN senza SRI |
| X4 | `ui.js` | `sectionRegistry` duplica HTML di `index.html` |
| X7 | `steps.js` | `makeStepHTML` non usata nel registry |
| X8 | `steps.js` | `delStep` dipende implicitamente da `lang` |
| X11 | `markdown.js` | `MutationObserver` non disconnesso |

| X13 | `style.css` | Variabili CSS senza fallback (parziale) |

### ⚠️ Regression Risk

- **Ordine script**: `initSectionHandles` dipende dall'ordine `ui.js` → `drag.js`. Invertire o aggiungere script in mezzo può rompere il comportamento
- **`sectionRegistry` vs `index.html`**: modificare la struttura di una sezione in un posto senza aggiornare l'altro produce comportamento diverso tra sezioni iniziali e sezioni reinserite
- **`makeStepHTML` vs registry**: stessa divergenza per le righe timeline

### Verdetto

Nessun deal breaker, nessun should fix aperto. Rimangono solo nice to have (X2, X4, X7, X8, X11, X12, X13) che sono miglioramenti di qualità, manutenibilità e UX — nessuno blocca le funzionalità core.
