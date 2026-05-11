# Wooly — Decisioni architetturali

Ogni decisione è documentata con: cosa, perché, alternative scartate.

---

## D1: Nessun framework (no React/Vue/Svelte)

**Scelta:** Vanilla JS con ES6 modules nativi.

**Perché:**
- L'app è un editor DOM-based con contenteditable — i framework lottano contro questo
- Zero build step = edit → push → live su GitHub Pages
- Bundle size zero (nessuna dipendenza runtime oltre marked.js)

---

## D2: ES6 modules nativi

**Scelta:** `<script type="module">`, `import`/`export`, `const`/`let`, arrow functions, template literals.

**Perché:**
- Supportato da tutti i browser moderni
- Import/export espliciti eliminano i problemi di namespace globale
- Nessun bundler necessario

---

## D3: JSON model come source of truth

**Scelta:** Ogni pattern è un oggetto JSON. Il DOM è la superficie di editing, non lo stato.

**Perché:**
- Autosave robusto: serializzare JSON è deterministico
- Export pulito: genera dal modello, non dal DOM
- Import affidabile: parsare JSON è banale

---

## D4: localStorage (non IndexedDB)

**Scelta:** Tutto in localStorage come stringhe JSON. `savePattern()` ritorna `true/false` per gestire quota piena.

**Perché:**
- API sincrona e semplicissima
- Sufficiente per il caso d'uso (un utente, pochi pattern)
- Feedback immediato se lo storage è pieno (indicatore ⚠️ + toast)

---

## D5: PWA con Service Worker

**Scelta:** Cache-first service worker + manifest per installazione.

**Perché:**
- L'utente lavora ovunque, non sempre con WiFi
- Si installa come app nativa senza App Store

---

## D6: marked.js da CDN

**Scelta:** Unica dipendenza esterna, caricata da jsDelivr CDN.

**Perché:**
- Markdown rendering è complesso da reimplementare
- Il service worker lo cachea — funziona offline
- Usato anche nel PDF (caricato nella finestra di stampa)

---

## D7: Nessun backend, nessun account

**Scelta:** 100% client-side, dati solo in localStorage.

**Perché:**
- Un solo utente, zero costi, privacy totale
- Mitigato da export JSON e backup completo

---

## D8: Mobile-first design

**Scelta:** CSS parte da mobile (≤600px), poi aggiunge per tablet e desktop.

**Perché:**
- L'utente principale usa il telefono mentre lavora a maglia
- Bottom bar con azioni primarie nel thumb zone
- Touch target ≥44px su mobile/tablet

---

## D9: Un file CSS unico

**Scelta:** Tutto in `css/style.css`, nessun preprocessore.

**Perché:**
- L'app non è abbastanza grande da giustificare split
- CSS custom properties gestiscono i temi senza duplicazione

---

## D10: 2 temi (Dark / Light)

**Scelta:** Solo 2 temi con variabili CSS inline sul body. Accent color oro (#C8922A) condiviso.

**Perché:**
- Semplicità — il PDF ha un solo stile, i temi servono solo per comfort visivo nell'editor
- Cambio tema istantaneo senza ricaricare CSS
- Ogni pattern può avere il suo tema (salvato nel JSON)

---

## D11: Nessun export HTML standalone

**Scelta:** Solo PDF e JSON come formati di export.

**Perché:**
- Il PDF copre il caso "stampare/condividere il pattern formattato"
- Il JSON è il formato di backup/scambio reimportabile
- Meno codice da mantenere

---

## D12: Footer solo in alto nel PDF (sotto il logo)

**Scelta:** Il footer globale appare solo in alto nel PDF come pill colorata sotto il logo. Non appare in fondo alla pagina né nell'editor.

**Perché:**
- Dà un aspetto più professionale e brandizzato
- In fondo alla pagina era poco visibile e ridondante
- Nel canvas dell'editor è solo rumore visivo

---

## D13: Bottone Import separato da Export

**Scelta:** Import e Export sono bottoni separati nella bottom bar.

**Perché:**
- Concettualmente sono operazioni opposte
- Import apre direttamente il file picker (un click)
- Export apre un pannello con submenu PDF + JSON

---

## D14: Timeline con sidebar per tip/note

**Scelta:** Tip e note come badge pill sulla destra della riga.

**Perché:**
- Allinea l'editor al layout del PDF esportato
- Su mobile la sidebar va sotto il testo (responsive)

---

## D15: Blocchi steps collassabili

**Scelta:** I blocchi con contenuto partono collassati, quelli vuoti espansi.

**Perché:**
- Con molte righe il canvas diventa lunghissimo
- L'utente espande solo il blocco su cui sta lavorando
- Nessuna persistenza necessaria — l'euristica "ha contenuto?" è sufficiente

---

## D16: Abbreviation sets multipli

**Scelta:** Le abbreviazioni globali sono un array di set con nome. L'utente può salvare, caricare ed eliminare set.

**Perché:**
- Progetti diversi usano abbreviazioni diverse (ferri vs uncinetto, IT vs EN)
- Il primo set ("Default") viene usato per i nuovi pattern
- Backward compatible: il vecchio formato `[{key,val}]` viene migrato automaticamente

---

## D18: Palette colori centralizzata nei template PDF

**Scelta:** Tutti i colori del template PDF sono in un oggetto `c` in cima alla funzione `css()`. Il resto del CSS usa solo riferimenti a `c.xxx`. Accent di default: verde menta scuro `#2d8a6e`.

**Perché:**
- Per creare un template diverso basta duplicare il file e cambiare i valori nella palette
- Nessun colore hardcoded sparso nel CSS
- Facilita la manutenzione e la coerenza visiva

---

## D19: Intro/outro a livello di sezione steps

**Scelta:** La sezione `steps` ha campi `intro` e `outro` (markdown) che appaiono prima e dopo tutti i blocchi.

**Perché:**
- Permette indicazioni generali che valgono per l'intera lavorazione (es. "Lavorare in tondo" o "Chiudere tutte le maglie")
- Separato dagli intro/outro dei singoli blocchi che sono specifici per pezzo

---

## D20: Sezione Video con QR code

**Scelta:** Tipo di sezione `video` con array di link. Nel PDF ogni link appare come testo cliccabile + QR code generato via `api.qrserver.com`.

**Perché:**
- Chi ha il PDF digitale clicca il link
- Chi ha il foglio stampato inquadra il QR code
- Nessuna libreria JS aggiuntiva — il QR è un `<img>` con URL API
- `api.qrserver.com` è gratuito, senza API key, senza rate limit

---

## D17: Markdown nel PDF via marked.js client-side

**Scelta:** Il PDF carica marked.js e parsa il contenuto markdown prima di `window.print()`.

**Perché:**
- Il contenuto è salvato come testo raw nel JSON
- Renderizzare lato template (server-side nel senso di "nel render()") richiederebbe importare marked nel modulo — possibile ma aggiunge complessità
- Il check `if(typeof marked!=="undefined")` garantisce graceful degradation
