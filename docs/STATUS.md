# Wooly — Stato del progetto

Ultimo aggiornamento: Gennaio 2025

---

## V1 — Completata ✅

### Funzionalità implementate

| Feature | Stato | Note |
|---------|-------|------|
| Pattern multipli con lista | ✅ | Card con nome, thumbnail, data |
| Crea / duplica / elimina / archivia pattern | ✅ | |
| Template built-in | — | Rimossi (solo template custom salvati dall'utente) |
| Template custom (salva pattern come template) | ✅ | Menu ⋯ nell'editor |
| Set abbreviazioni multipli | ✅ | Carica set / Salva come set, eliminabili |
| Editor sezioni: Materiali | ✅ | 5 campi field |
| Cover block: Info Pattern | ✅ | 6 campi nel cover a destra dell'immagine |
| Cover block: Misure | ✅ | 3 campi sotto info, separato da divider |
| Cover block: Immagine | ✅ | 160x160, ridimensionata, base64 |
| Editor sezioni: Abbreviazioni | ✅ | Grid key/val + aggiungi + carica set |
| Editor sezioni: Tensione | ✅ | 3 campi field |
| Editor sezioni: Passaggi | ✅ | Blocchi collassabili con timeline, tip/note come badge sidebar |
| Editor sezioni: Istruzioni | ✅ | Testo libero markdown |
| Editor sezioni: Note | ✅ | Testo libero markdown |
| Editor sezioni: Custom | ✅ | Titolo rinominabile + testo libero |
| Tip per riga | ✅ | Badge pill sulla destra, sfondo accent |
| Nota per riga | ✅ | Badge pill sulla destra, sfondo giallo |
| Blocchi collassabili | ✅ | Default collapsed se con contenuto, badge "N righe" |
| Backup completo | ✅ | v2: include abbreviation sets |
| Ripristino backup (merge intelligente) | ✅ | Backward compat con backup v1 |
| Immagine header pattern | ✅ | Nel cover block, usata come thumbnail nella lista |
| Drag & drop sezioni | ✅ | Mouse + touch |
| Cambia larghezza sezione (half/full) | ✅ | Menu ⋯ sezione |
| Duplica / Elimina sezione | ✅ | Menu ⋯ sezione |
| Aggiungi sezione (tutti i tipi) | ✅ | Bottom bar |
| 2 temi (Dark / Light) | ✅ | Persistenza per pattern |
| Traduzione IT/EN | ✅ | Toggle nell'editor e nella lista |
| Export PDF | ✅ | Template "Elegante", markdown renderizzato, logo/footer da impostazioni |
| Export JSON (.wooly.json) | ✅ | Formato nativo reimportabile |
| Import JSON | ✅ | Bottone separato + supporto legacy HTML |
| Impostazioni globali (logo + footer) | ✅ | Solo in export PDF, configurabili da ⚙️ nella lista |
| Intro/outro per blocco steps | ✅ | Indicazioni iniziali e finali per ogni pezzo |
| Conferma eliminazione | ✅ | Modal interno per sezioni, pattern, template, set abbreviazioni |
| Markdown rendering | ✅ | Solo su .long-text e .timeline-text, toolbar floating |
| Autosave | ✅ | Debounce 1s, indicatore "Salvato ✓", gestione localStorage pieno |
| PWA offline | ✅ | Service worker, installabile |
| Toast notifications | ✅ | Feedback su ogni azione |

---

## V2 — Pianificata

| Feature | Priorità | Descrizione |
|---------|----------|-------------|
| Contarighe flottante | Alta | Tap +1, long press -1, associato a blocco |
| Modalità lavoro | Alta | Vista minimale per seguire il pattern |
| Timer sessione | Media | Tempo per sessione, storico |
| Calcolatrice maglie | Media | Ripetizioni, tensione→maglie |
| Gruppi ripetizione | Media | Seleziona righe → wrap in gruppo ×N |
| Drag & drop righe | Media | Riordinare righe dentro un blocco |

---

## Bug noti

| Bug | Severità | Dove |
|-----|----------|------|
| Icone PWA sono SVG, alcuni browser non le accettano per splash screen | Bassa | manifest.json |

---

## Miglioramenti tecnici da fare

| Cosa | Perché |
|------|--------|
| Undo/redo | Nessun supporto attuale (snapshot stack sul modello JSON) |
| Icone PNG reali per PWA | Servono per splash screen iOS/Android |
