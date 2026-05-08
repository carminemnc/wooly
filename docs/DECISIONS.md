# Wooly — Decisioni architetturali

Ogni decisione è documentata con: cosa, perché, alternative scartate.

---

## D1: Nessun framework (no React/Vue/Svelte)

**Scelta:** Vanilla JS con ES6 modules nativi.

**Perché:**
- L'app è un editor DOM-based con contenteditable — i framework lottano contro questo
- Zero build step = edit → push → live su GitHub Pages
- Bundle size zero (nessuna dipendenza runtime oltre marked.js)
- La complessità dell'app non giustifica un framework

**Scartato:** React (virtual DOM incompatibile con contenteditable), Vue, Svelte (build step necessario).

---

## D2: ES6 modules nativi (non ES5)

**Scelta:** `<script type="module">`, `import`/`export`, `const`/`let`, arrow functions, template literals.

**Perché:**
- Supportato da tutti i browser moderni (Safari iOS 12+, Chrome 61+, Firefox 60+)
- Codice drasticamente più leggibile e manutenibile
- Import/export espliciti eliminano i problemi di namespace globale
- Nessun bundler necessario — i browser risolvono i moduli nativamente

**Scartato:** ES5 puro (il vincolo della versione precedente — troppo verboso, nessun beneficio pratico).

---

## D3: JSON model come source of truth (non DOM-as-state)

**Scelta:** Ogni pattern è un oggetto JSON. Il DOM è la superficie di editing, non lo stato.

**Perché:**
- Autosave robusto: serializzare JSON è deterministico, innerHTML no
- Export pulito: genera HTML dal modello, non clona/pulisce il DOM
- Import affidabile: parsare JSON è banale, parsare HTML arbitrario è fragile
- Pattern multipli: ogni pattern è un JSON indipendente in localStorage
- Versionabile: se il formato cambia, si può migrare

**Scartato:** DOM-as-state (approccio della v1 precedente — fragile per autosave e import).

---

## D4: localStorage (non IndexedDB)

**Scelta:** Tutto in localStorage come stringhe JSON.

**Perché:**
- API sincrona e semplicissima
- Sufficiente per il caso d'uso (un utente, pochi pattern, dati testuali)
- Le immagini sono base64 inline — un pattern con immagine pesa ~100-200KB
- localStorage ha un limite di ~5-10MB per origin — più che sufficiente

**Quando migrare a IndexedDB:** Se si aggiungono molte foto (galleria progresso) o pattern molto grandi. Per ora non serve.

---

## D5: PWA con Service Worker

**Scelta:** Cache-first service worker + manifest per installazione.

**Perché:**
- L'utente lavora a maglia ovunque, non sempre con WiFi
- Tutti i dati sono locali — non serve rete per nulla dopo il primo caricamento
- Si installa come app nativa senza App Store
- Costo implementativo quasi zero (2 file)

---

## D6: marked.js da CDN

**Scelta:** Unica dipendenza esterna, caricata da jsDelivr CDN.

**Perché:**
- Markdown rendering è complesso da reimplementare
- marked.js è leggero (~7KB gzipped), maturo, configurabile
- Il service worker lo cachea — funziona offline

**Rischio accettato:** Supply chain (CDN compromesso). Mitigato dal SW cache e dal fatto che è un tool personale.

---

## D7: Nessun backend, nessun account

**Scelta:** 100% client-side, dati solo in localStorage del browser.

**Perché:**
- Un solo utente
- Nessun dato sensibile
- Zero costi di hosting (GitHub Pages gratuito)
- Zero manutenzione server
- Privacy totale — i dati non escono mai dal dispositivo

**Limitazione accettata:** Se cambia browser o dispositivo, perde i dati. Mitigato da export JSON.

---

## D8: Mobile-first design

**Scelta:** CSS parte da mobile (≤600px), poi aggiunge per tablet e desktop.

**Perché:**
- L'utente principale usa il telefono mentre lavora a maglia
- Bottom bar con azioni primarie nel thumb zone
- Touch target ≥44px su mobile/tablet
- Contarighe flottante pensato per uso con una mano

---

## D9: Un file CSS unico

**Scelta:** Tutto in `css/style.css`, nessun preprocessore, nessun CSS-in-JS.

**Perché:**
- L'app non è abbastanza grande da giustificare split
- CSS custom properties gestiscono i temi senza duplicazione
- Nessun build step necessario
- Facilmente ispezionabile nel browser

---

## D10: Temi come variabili CSS inline sul body

**Scelta:** `body.style.setProperty('--var', value)` per ogni variabile del tema.

**Perché:**
- Cambio tema istantaneo senza ricaricare CSS
- L'export HTML può includere le variabili come style inline
- Ogni pattern può avere il suo tema (salvato nel JSON)
- Fallback in `:root` nel CSS garantisce uno stile base se il JS non carica
