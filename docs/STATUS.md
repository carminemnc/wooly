# Wooly — Stato del progetto

Ultimo aggiornamento: Gennaio 2025

---

## V1 — Completata ✅

### Funzionalità implementate

| Feature | Stato | Note |
|---------|-------|------|
| Pattern multipli con lista | ✅ | Card con nome, thumbnail, data |
| Crea / duplica / elimina / archivia pattern | ✅ | Conferma modal per eliminazione |
| Template custom (salva pattern come template) | ✅ | Menu ⋯ nell'editor, conferma modal per eliminazione |
| Set abbreviazioni multipli | ✅ | Carica set / Salva come set (prompt modal), eliminabili (confirm modal) |
| Editor sezioni: Materiali | ✅ | 5 campi field |
| Cover block: Info Pattern | ✅ | 6 campi nel cover a destra dell'immagine |
| Cover block: Misure | ✅ | 3 campi sotto info, separato da divider |
| Cover block: Immagine | ✅ | 160x160, ridimensionata, base64 |
| Editor sezioni: Abbreviazioni | ✅ | Grid key/val + aggiungi + carica set |
| Editor sezioni: Tensione | ✅ | 3 campi field |
| Editor sezioni: Passaggi | ✅ | Blocchi collassabili con timeline, tip/note come badge sidebar, intro/outro per sezione e per blocco |
| Editor sezioni: Istruzioni | ✅ | Testo libero markdown |
| Editor sezioni: Note | ✅ | Testo libero markdown |
| Editor sezioni: Custom | ✅ | Titolo rinominabile + testo libero |
| Editor sezioni: Video | ✅ | Link multipli con QR code generato via api.qrserver.com nel PDF |
| Tip per riga | ✅ | Badge pill sulla destra, sfondo accent |
| Nota per riga | ✅ | Badge pill sulla destra, sfondo giallo |
| Blocchi collassabili | ✅ | Default collapsed se con contenuto, badge "N righe" |
| Backup completo | ✅ | Include abbreviation sets e templates |
| Ripristino backup (merge intelligente) | ✅ | Merge per ID, sovrascrive solo se più recente |
| Immagine header pattern | ✅ | Nel cover block, usata come thumbnail nella lista |
| Drag & drop sezioni | ✅ | Mouse + touch |
| Drag & drop righe | ✅ | Riordino righe dentro un blocco, mouse + touch, rinumerazione automatica con repeat |
| Repeat righe | ✅ | Una riga può coprire un range (es. Riga 2-13 = ×12), rinumerazione automatica |
| Cambia larghezza sezione (half/full) | ✅ | Menu ⋯ sezione |
| Duplica / Elimina sezione | ✅ | Menu ⋯ sezione, conferma modal per eliminazione |
| Aggiungi sezione (tutti i tipi) | ✅ | Bottom bar |
| 2 temi (Dark / Light) | ✅ | Persistenza per pattern |
| Traduzione IT/EN | ✅ | Toggle nell'editor e nella lista |
| Export PDF | ✅ | Template "Elegante" via window.print(), cover con immagine sx + info dx, markdown renderizzato, footer in alto sotto logo come pill, palette colori centralizzata (accent verde menta #2d8a6e), sezione video con QR code |
| Export JSON (.wooly.json) | ✅ | Formato nativo reimportabile |
| Import JSON | ✅ | Nel menu "+ Nuovo pattern" → "Importa file" |
| Impostazioni globali (logo + footer) | ✅ | Footer appare in alto nel PDF sotto il logo (pill colorata), configurabili da ⚙️ nella lista |
| Intro/outro per sezione steps | ✅ | Testo libero markdown prima e dopo tutti i blocchi |
| Intro/outro per blocco steps | ✅ | Indicazioni iniziali e finali per ogni pezzo |
| Sezione custom rinominabile | ✅ | ✏️ accanto al titolo |
| Conferma eliminazione | ✅ | Modal interno per sezioni, pattern, template, set abbreviazioni |
| Prompt modal | ✅ | Per nome set abbreviazioni (no native prompt()) |
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
| Undo/redo | Bassa | Snapshot stack sul modello JSON |

---

## Bug noti

| Bug | Severità | Dove |
|-----|----------|------|
| Icone PWA sono SVG, alcuni browser non le accettano per splash screen | Bassa | manifest.json |
| Chrome/Windows non stampa colori testo in PDF (workaround: sfondo leggero sui label) | Bassa | print-styles/elegant.js |

---

## Miglioramenti tecnici da fare

| Cosa | Perché |
|------|--------|
| Icone PNG reali per PWA | Servono per splash screen iOS/Android |
