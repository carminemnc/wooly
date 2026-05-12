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
| Editor sezioni: Abbreviazioni | ✅ | Grid key/val + aggiungi + carica set + elimina singola (×) |
| Editor sezioni: Tensione | ✅ | 3 campi field |
| Editor sezioni: Passaggi | ✅ | Blocchi collassabili con timeline, tip/note, intro/outro sezione e blocco, duplica/elimina blocco |
| Editor sezioni: Istruzioni | ✅ | Testo libero markdown |
| Editor sezioni: Note | ✅ | Testo libero markdown |
| Editor sezioni: Custom | ✅ | Titolo rinominabile + testo libero |
| Editor sezioni: Video | ✅ | Link multipli con QR code generato via api.qrserver.com nel PDF |
| Tip per riga | ✅ | Badge pill sulla destra, sfondo accent |
| Nota per riga | ✅ | Badge pill sulla destra, sfondo giallo, testo sempre scuro (leggibile in dark mode) |
| Blocchi collassabili | ✅ | Default collapsed se con contenuto, badge "N righe" |
| Duplica / Elimina blocco steps | ✅ | Bottoni ⧉ e × nell'header del blocco, confirm modal per eliminazione |
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
| Traduzione IT/EN | ✅ | Toggle nell'editor e nella lista, bidirezionale, placeholder tradotti |
| Export PDF | ✅ | Template "Elegante", palette colori centralizzata (accent #6B3F1F), label tradotte IT/EN, footer pill in alto, video con QR |
| Export JSON (.wooly.json) | ✅ | Formato nativo reimportabile |
| Import JSON | ✅ | Fix automatico newline, generazione ID mancanti, supporto pattern da LLM |
| PDF multilingua | ✅ | Label tradotte IT/EN nel PDF in base alla lingua corrente dell'editor |
| Impostazioni globali (logo + footer) | ✅ | Footer appare in alto nel PDF sotto il logo (pill colorata), configurabili da ⚙️ nella lista |
| Intro/outro per sezione steps | ✅ | Testo prima e dopo tutti i blocchi |
| Intro/outro per blocco steps | ✅ | Indicazioni iniziali e finali per ogni pezzo |
| Sezione custom rinominabile | ✅ | ✏️ accanto al titolo |
| Conferma eliminazione | ✅ | Modal interno per sezioni, pattern, template, set abbreviazioni, blocchi |
| Prompt modal | ✅ | Per nome set abbreviazioni (no native prompt()) |
| Markdown rendering | ✅ | Solo su Istruzioni, Note, Custom. Toolbar con toggle bold/italic/headers. Render al caricamento e al blur |
| Plain text paste | ✅ | Incolla da qualsiasi sorgente senza formattazione |
| Placeholder tradotti | ✅ | Tutti i placeholder seguono la lingua corrente (IT/EN) |
| Topbar/Bottombar fixed | ✅ | Sempre visibili su tutti i device, non si muovono con lo scroll |
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

---

## Miglioramenti tecnici da fare

| Cosa | Perché |
|------|--------|
| Icone PNG reali per PWA | Servono per splash screen iOS/Android |
