# Wooly — Stato del progetto

Ultimo aggiornamento: Gennaio 2025

---

## V1 — Completata ✅

### Funzionalità implementate

| Feature | Stato | Note |
|---------|-------|------|
| Pattern multipli con lista | ✅ | Card con nome, thumbnail, data |
| Crea / duplica / elimina / archivia pattern | ✅ | |
| Template built-in (Sciarpa, Cappello, Calzini, Maglione) | ✅ | |
| Template custom (salva pattern come template) | ✅ | Menu ⋯ nell'editor |
| Abbreviazioni globali | ✅ | Si pre-compilano nei nuovi pattern |
| Editor sezioni: Materiali | ✅ | 5 campi field (Filato, Quantità, Metraggio, Ferri, Accessori) |
| Cover block: Info Pattern | ✅ | Autore, Difficoltà, Categoria, Taglie, Costruzione, Tecniche — nel cover a destra dell'immagine |
| Cover block: Misure | ✅ | Larghezza, Lunghezza, Circonferenza — nel cover sotto info, separato da divider |
| Cover block: Immagine | ✅ | A sinistra nel cover, 160x160, ridimensionata, base64 |
| Editor sezioni: Abbreviazioni | ✅ | Grid key/val + aggiungi |
| Editor sezioni: Tensione | ✅ | 3 campi field |
| Editor sezioni: Steps | ✅ | Blocchi con timeline righe |
| Editor sezioni: Istruzioni | ✅ | Testo libero markdown |
| Editor sezioni: Note | ✅ | Testo libero markdown |
| Editor sezioni: Custom | ✅ | Titolo + testo libero |
| Tip per riga (suggerimento) | ✅ | Click per mostrare, blur vuoto per nascondere |
| Nota per riga | ✅ | Stesso pattern del tip |
| Backup completo (export tutti i pattern in un file JSON) | ✅ | Scarica `wooly-backup-YYYY-MM-DD.json` |
| Ripristino backup (import con merge intelligente) | ✅ | Aggiunge nuovi, aggiorna più recenti, non cancella nulla |
| Immagine header pattern | ✅ | Nel cover block, ridimensionata, base64, usata come thumbnail nella lista |
| Drag & drop sezioni | ✅ | Mouse + touch |
| Cambia larghezza sezione (half/full) | ✅ | Menu ⋯ sezione |
| Duplica sezione | ✅ | Menu ⋯ sezione |
| Elimina sezione | ✅ | Menu ⋯ sezione |
| Aggiungi sezione (tutti i tipi) | ✅ | Bottom bar |
| Contarighe flottante | ✅ | Tap +1, long press -1 |
| 7 temi colore | ✅ | Persistenza per pattern |
| Traduzione IT/EN | ✅ | Toggle nell'editor e nella lista |
| Export HTML standalone | ✅ | Include CSS + tema + immagine |
| Export PDF (template professionale) | ✅ | Template separati in `print-styles/`, tip come balloon a destra, note gialle |
| Export JSON (.wooly.json) | ✅ | Formato nativo reimportabile |
| Import HTML | ✅ | Parser che ricostruisce il modello |
| Import JSON | ✅ | Import diretto |
| Impostazioni globali (logo + footer) | ✅ | Si applicano a tutti i pattern, configurabili da ⚙️ nella lista |
| Intro/outro per blocco steps | ✅ | Indicazioni iniziali e finali per ogni pezzo |
| Sezione custom rinominabile | ✅ | Matitina ✏️ accanto al titolo per rinominare |
| Markdown rendering | ✅ | Toolbar floating, render al blur |
| Autosave | ✅ | Debounce 1s, indicatore "Salvato ✓" |
| PWA offline | ✅ | Service worker, installabile |
| Toast notifications | ✅ | Feedback su ogni azione |

---

## V2 — Pianificata

| Feature | Priorità | Descrizione |
|---------|----------|-------------|
| Modalità lavoro | Alta | Vista minimale per seguire il pattern mentre si lavora |
| Timer sessione | Alta | Tempo per sessione, storico, totale progetto |
| Calcolatrice maglie | Media | Ripetizioni, tensione→maglie, proporzioni |
| Checklist materiali | Media | Checkbox su ogni materiale |
| Gruppi ripetizione | Media | Seleziona righe → wrap in gruppo ×N |
| Indicatori colore righe | Bassa | Pallino colore per colorwork |
| Anteprima stampa | Bassa | Preview prima di stampare |

---

## V3 — Idee future

| Feature | Descrizione |
|---------|-------------|
| Varianti taglie | S/M/L/XL per ogni campo numerico |
| Foto progresso | Galleria foto associate al pattern |
| Importa da testo | Parser che riconosce strutture comuni |
| Esporta come immagine | Screenshot PNG del pattern |
| Condivisione via URL | JSON compresso in parametro URL |
| Statistiche pattern | Righe totali, stima metraggio, stima tempo |
| Collegamento tra pattern | Raggruppare pattern in un progetto |
| Diario di lavorazione | Note timestamped separate dal pattern |
| Inventario filati | Stash tracker con foto |

---

## Bug noti

| Bug | Severità | Dove |
|-----|----------|------|
| Icone PWA sono SVG, alcuni browser non le accettano per splash screen | Bassa | manifest.json |
| `renderSections` non re-inizializza il MutationObserver del markdown | Media | editor.js |
| Pattern creati prima dell'aggiunta di info/measurements non hanno il cover block (mancano le sezioni) | Bassa | Workaround: creare un nuovo pattern |

## Fix recenti

| Fix | Dove |
|-----|------|
| Pannelli "+ Sezione" e "Esporta" non rispondevano al click (erano dentro fixed bottombar) | editor.js — spostati su `document.body` con `position: fixed` |
| Pannello export visibile nel PDF stampato | style.css — aggiunto `.bottom-panel` a `@media print { display: none }` + chiusura pannello prima di `window.print()` |
| Info Pattern + Misure + Immagine unificati in cover block | editor.js + style.css — layout a 2 colonne (immagine sx, campi dx) con divider sotto |
| Eliminare/duplicare sezione operava sulla sezione sbagliata | editor.js `bindSectionMenu` — usava indice filtrato, ora usa `findIndex` con `section.id` |
| Drag & drop riordino perdeva info/measurements | editor.js `handleReorder` — ora preserva sezioni fixed (info, measurements) e riordina solo il resto |
| Impossibile eliminare template custom | pattern-list.js — aggiunto bottone × accanto ai template custom nel menu "+ Nuovo pattern" |
| Ultima sezione nascosta dalla bottom bar su tablet | style.css — aggiunto `padding-bottom` su `.view-editor` + `::after` spacer nel canvas grid |
| Menu sezione (⋯) dell'ultima sezione finiva sotto la bottom bar | style.css — `.section:last-child .section-menu` si apre verso l'alto |
| Campi vuoti (con spazi/newline) apparivano nel PDF | print-styles/elegant.js — aggiunto `.trim()` a tutti i filtri |

---

## Miglioramenti tecnici da fare

| Cosa | Perché |
|------|--------|
| Aggiungere drag & drop righe dentro un blocco | Ora si possono solo aggiungere/eliminare, non riordinare |
| Conferma prima di eliminare sezione | Ora elimina direttamente senza chiedere |
| Undo/redo | Nessun supporto attuale |
| Validazione import HTML più robusta | Il parser è basico |
| Icone PNG reali per PWA | Servono per splash screen iOS/Android |
| Migrazione pattern vecchi | Pattern creati prima di info/measurements non hanno il cover block |
