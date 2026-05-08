# Wooly — AI Rules

## Contesto

Prima di fare qualsiasi cosa, leggere questi file:
- `docs/ARCHITECTURE.md` — struttura tecnica, stack, flusso dati, moduli
- `docs/DECISIONS.md` — scelte architetturali e motivazioni
- `docs/STATUS.md` — stato attuale, cosa è fatto, cosa manca, bug noti
- `docs/RULES.md` — vincoli, pattern da seguire, checklist pre-push

---

## Falsi positivi noti — Non segnalare

- **XSS / sanitizzazione innerHTML**: nessun dato va su server, utente singolo. Rischio accettato.
- **SRI su CDN** (marked.js, Google Fonts): tool personale, rischio supply chain accettato.
- **`marked.parse()` senza sanitizzazione**: stesso motivo.
- **`MutationObserver` non disconnesso** in `markdown.js`: app a pagina singola, nessun leak pratico.
- **`confirm()` per eliminazione pattern**: accettabile per tool personale.

---

## Dimensioni di review

Analizzare attraverso tutte queste lenti simultaneamente:

### 1. Correttezza funzionale
- CRUD pattern (crea, duplica, elimina, archivia)
- Sezioni: aggiungi, elimina, duplica, riordina, cambia larghezza
- Timeline: aggiungi/elimina righe, rinumerazione, tip, note
- Export/Import: HTML, JSON, PDF
- Temi: applicazione, persistenza per pattern
- Traduzione: IT/EN su tutti gli elementi
- Contarighe: incremento, decremento, persistenza
- Autosave: debounce, indicatore, persistenza al reload
- Markdown: render, edit, toolbar
- Template: built-in e custom
- Immagine header: caricamento, ridimensionamento, inclusione in export

### 2. Qualità del codice
- Naming consistente
- Funzioni con responsabilità singola
- Nessun dead code
- Import/export puliti, nessuna dipendenza circolare
- Nessuna duplicazione logica

### 3. UX e comportamento visivo
- Feedback su ogni azione (toast, indicatore salvataggio)
- Placeholder nei campi vuoti
- Transizioni fluide
- Menu si chiudono al click fuori
- Bottoni editor non visibili in export/print

### 4. Mobile e responsività
- Layout colonna singola su mobile
- Touch target ≥ 44px
- Bottom bar nel thumb zone
- Drag & drop touch funziona
- Nessun overflow orizzontale

### 5. CSS
- Variabili CSS coperte da tutti i temi
- Media query non duplicate
- `@media print` copre tutti gli elementi editor

### 6. Robustezza
- Pattern senza campi opzionali non crashano
- Import di file non validi gestito con feedback
- localStorage pieno o non disponibile non rompe l'app

---

## Formato output

Raggruppare i finding per file. Per ogni finding:
- **ID** progressivo (R1, R2...)
- **File** e riga approssimativa
- **Severity**: Alta / Media / Bassa
- **Categoria**: Bug / Qualità / UX / Mobile / CSS / Robustezza
- **Problema**: 1–2 frasi
- **Impatto**: cosa succede all'utente
- **Fix**: concreto, minimo, applicabile subito

Chiudere con:
1. Deal Breakers (fix subito)
2. Should Fix (prossimo ciclo)
3. Nice to Have (può aspettare)

---

## Checklist pre-push

Eseguire la checklist completa in `docs/RULES.md` e riportare l'esito:
- ✅ OK
- ❌ Bloccante
- ⚠️ Attenzione

### Verdetto finale
- ✅ **PUSH SICURO** — nessun bloccante
- ❌ **NON PUSHARE** — elencare i bloccanti
