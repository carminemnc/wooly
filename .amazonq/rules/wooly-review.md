# Wooly — AI Rules

## Contesto

Wooly è un editor statico di schemi a maglia che gira interamente nel browser.
La mia ragazza lo usa sul telefono o sul desktop per comporre schemi e stamparli o
esportarli. Non c'è backend, non ci sono pagamenti, non ci sono dati sensibili.
Ogni riga di codice viene deployata su GitHub Pages.

Per il contesto tecnico completo leggere:
- `docs/architecture.md` — struttura, stack, flusso dati, comunicazione tra moduli
- `docs/modules.md` — documentazione per ogni file JS

---

## Hard Constraints — Non violare mai

### ES5 puro (tutto `docs/js/`)
- **No** `let` / `const` — solo `var`
- **No** arrow functions — solo `function`
- **No** template literals — solo concatenazione con `+`
- **No** `class`, destructuring, spread operator
- **No** `for...of` — solo `for` classico o `.forEach()`
- **No** `Array.from()` — solo `Array.prototype.slice.call()`
- **No** `NodeList.forEach()` diretto — solo `Array.prototype.forEach.call()`
- **No** `Promise`, `async`/`await`
- **No** `Object.entries()` / `Object.values()` — solo `Object.keys()`

Non suggerire mai di modernizzare a ES6+. Segnalare ogni violazione come Alta.

### Ordine script (non invertire mai)
```
themes.js → core.js → sections.js → drag.js → steps.js → export.js → translate.js → markdown.js
```
Tutti con attributo `defer`. Invertire o aggiungere script in mezzo può rompere
le dipendenze globali tra moduli.

### DOM come stato
Non c'è un oggetto di stato JS separato. Lo stato dell'applicazione è il DOM.
Non suggerire di introdurre state management.

---

## Falsi positivi noti — Non segnalare

- **XSS / sanitizzazione `innerHTML`**: nessun dato va su server, nessun utente
  terzo vede l'output altrui. L'utente è una persona sola. Rischio accettato.
- **SRI su CDN** (`marked.js`, Google Fonts): tool personale, rischio supply chain
  accettato consapevolmente.
- **`marked.parse()` senza sanitizzazione**: stesso motivo sopra.
- **`alert()` in `importHTML`**: unico punto di feedback per file non valido,
  accettabile per un tool personale.
- **`MutationObserver` non disconnesso** in `markdown.js`: app a pagina singola
  senza navigazione, nessun leak pratico.
- **`id` duplicati tra DOM iniziale e `<template>`**: i template non sono mai nel
  DOM attivo contemporaneamente alle sezioni iniziali. Non è un bug reale.
- **`apply(isNaN(saved) ? 5 : saved)`** in `themes.js`: indice 5 = "Chiaro Carta",
  tema default scelto intenzionalmente. Non segnalare a meno che l'array `themes`
  non cambi ordine.

---

## Dimensioni di review

Analizzare attraverso tutte queste lenti simultaneamente. Una singola riga può
violare più dimensioni — segnalarla una volta con tutte le categorie rilevanti.

### 1. Correttezza funzionale

**Sezioni:**
- Aggiunta dal template funziona e produce una sezione identica a quella iniziale
- Duplicazione clona correttamente senza `id` duplicati nel DOM attivo
- Eliminazione rimuove la sezione e aggiorna la toggle-bar
- Reinserimento dalla toggle-bar ripristina la sezione completa e funzionante
- `Wooly.Sections.init(sec)` chiamato su ogni sezione aggiunta/clonata/importata

**Timeline (Steps):**
- Aggiunta riga: numerazione corretta, focus sul campo testo
- Eliminazione riga: la nota/bottone successivo viene rimosso, rinumerazione corretta
- Aggiunta blocco: 3 righe iniziali con bottoni nota tra ognuna
- Tip: appare al click, scompare al blur se vuoto, ripristina il bottone
- Nota tra righe: sostituisce il bottone, è contenteditable

**Traduzione IT/EN:**
- Toggle traduce titoli sezioni, label campi, bottoni, "riga"/"row"
- Sezioni aggiunte dinamicamente vengono tradotte (`applyLang` chiamata dopo `init`)
- Sezioni duplicate vengono tradotte
- Sezioni importate vengono tradotte
- `data-label` e `data-placeholder` di tip e note aggiornati

**Export:**
- HTML esportato include CSS completo + variabili tema corrente
- HTML esportato non include bottoni editor (drag-handle, delete, dup, layout-toggle)
- PDF (print) non include bottoni editor
- Immagine header inclusa nell'export come data URL (base64)

**Import:**
- File HTML non valido (senza `.canvas`) mostra feedback e non rompe il DOM
- Dopo import: `Wooly.Sections.init` chiamato su ogni sezione, toggle-bar aggiornata,
  lingua applicata

**Tema:**
- Cambio tema aggiorna tutte le variabili CSS sul `body`
- Tema persiste al refresh via `localStorage`
- Menu tema si chiude al click fuori

**Markdown:**
- Rendering al blur se il campo ha contenuto
- Click su rendered ripristina il contenteditable con il testo sorgente
- Nuovi campi aggiunti dinamicamente vengono inizializzati dal `MutationObserver`
- Link aperti in `target="_blank"` con `rel="noopener noreferrer"`

### 2. ES5 compliance

Vedere Hard Constraints. Ogni violazione è Alta.

### 3. Principi ingegneristici

- **DRY**: logica duplicata che può divergere (es. HTML sezioni definito in più posti,
  `makeStepHTML` usata o non usata nel registry)
- **KISS**: soluzioni inutilmente complesse dove ne basta una semplice
- **SRP**: funzioni che fanno troppe cose diverse
- **YAGNI**: codice scritto "per il futuro" che non serve ora
- **Dead code**: variabili, funzioni, CSS mai usati o mai raggiungibili

### 4. Qualità del codice

- Inconsistenze di naming tra moduli (camelCase, pattern di esposizione globale)
- Funzioni esposte nel namespace `Wooly` ma non usate da nessuno
- Alias ridondanti (es. `Wooly.init = Wooly.core.init` — necessario o no?)
- Commenti che spiegano il "cosa" invece del "perché"

### 5. UX e comportamento visivo

- Feedback visivo su ogni azione (aggiunta, eliminazione, cambio tema)
- Placeholder visibili nei campi vuoti
- Bottoni editor non visibili nell'export
- Toggle-bar aggiornata correttamente dopo ogni operazione sulle sezioni
- Tema applicato prima del render (nessun flash di tema sbagliato)

### 6. Mobile e responsività

La mia ragazza usa questo tool anche da telefono:
- Layout a colonna singola su mobile (≤600px)
- Touch target almeno 44×44px per bottoni e chip
- Drag & drop touch funziona via `touchstart`/`touchmove`/`touchend`
- Nessun overflow orizzontale
- Toolbar wrappa correttamente su schermi piccoli

### 7. CSS

- Variabili CSS usate senza fallback (`:root` presente — verificare copertura)
- Media query duplicate o sovrapposte
- Classi CSS definite ma mai usate nel JS o nell'HTML
- Regole `@media print` coprono tutti i bottoni editor

### 8. Salute del progetto

- Tutti i file JS referenziati in `index.html` esistono in `docs/js/`
- Nessun file referenziato mancante
- `architecture.md` e `modules.md` allineati con il codice reale
  (es. `modules.md` menziona ancora `ui.js`, `filati.js`, `drag.js` con
  responsabilità che ora sono in `core.js`, `sections.js` — verificare)

---

## Il flusso d'uso

Ogni finding va valutato rispetto a questo flusso:

1. La mia ragazza apre il sito su telefono o desktop
2. Vede il canvas con le sezioni iniziali
3. Compila i campi: titolo schema, materiali, abbreviazioni, tensione, righe
4. Aggiunge/rimuove/riordina sezioni secondo le sue necessità
5. Scrive istruzioni e note in markdown
6. Cambia tema per trovare quello che preferisce
7. Esporta come HTML (da condividere) o stampa come PDF
8. Riapre il file HTML esportato per consultarlo in futuro

Ogni step deve funzionare. Ogni errore deve essere gestito. Ogni azione deve
avere un feedback visivo chiaro.

---

## Formato output

Raggruppare i finding per file. Per ogni finding:
- **ID** progressivo (R1, R2...)
- **File** e riga approssimativa
- **Severity**: Alta / Media / Bassa
- **Categoria**: Bug / ES5 / DRY / KISS / SRP / YAGNI / Dead code / CSS / UX
- **Problema**: cosa non va (1–2 frasi)
- **Impatto**: cosa succede all'utente
- **Fix**: concreto, minimo, applicabile subito

Severity:
- **Alta** — funzionalità rotta, crash JS, violazione ES5, regressione
- **Media** — qualità degradata, manutenibilità ridotta, inconsistenza
- **Bassa** — miglioramento, pulizia, ottimizzazione

Chiudere con:
1. Deal Breakers (fix subito prima di pushare)
2. Should Fix (fix nel prossimo ciclo)
3. Nice to Have (può aspettare)
4. Regression Risk (cosa può rompersi toccando X)

## Check pre-push GitHub Pages

Al termine di ogni review, eseguire obbligatoriamente questo checklist e riportare
l'esito (✅ OK / ❌ Bloccante / ⚠️ Attenzione) per ogni voce:

### Struttura e deployment
- [ ] `docs/index.html` esiste ed è il punto di ingresso
- [ ] Tutti i file JS referenziati in `index.html` esistono in `docs/js/`
- [ ] Il CSS referenziato esiste in `docs/css/`
- [ ] Nessun path assoluto o relativo rotto
- [ ] Nessun file referenziato mancante (immagini, font, script)

### Correttezza JS al caricamento
- [ ] L'ordine degli script rispetta le dipendenze:
      `themes.js` → `core.js` → `sections.js` → `drag.js` → `steps.js`
      → `export.js` → `translate.js` → `markdown.js`
- [ ] Tutti gli script hanno `defer`
- [ ] Nessuna variabile globale usata prima di essere dichiarata

### ES5 compliance
- [ ] Nessun `const` / `let`
- [ ] Nessuna arrow function `=>`
- [ ] Nessun template literal (backtick)
- [ ] Nessun `class`, destructuring, spread, `for...of`, `Array.from`
- [ ] Nessun `NodeList.forEach` diretto

### Funzionalità core
- [ ] Aggiunta / duplicazione / eliminazione sezione funziona
- [ ] Drag & drop sezioni funziona (mouse e touch)
- [ ] Aggiunta / eliminazione righe timeline con rinumerazione corretta
- [ ] Export HTML include tema attivo e non include bottoni editor
- [ ] Export PDF (print) non include bottoni editor
- [ ] Import HTML ripristina lo schema correttamente
- [ ] Toggle lingua IT/EN traduce anche sezioni aggiunte dinamicamente
- [ ] Cambio tema persiste al refresh (localStorage)
- [ ] Rendering markdown funziona su long-text e timeline-text

### Verdetto finale
- ✅ **PUSH SICURO** — nessun bloccante trovato
- ❌ **NON PUSHARE** — elencare i bloccanti da risolvere prima
