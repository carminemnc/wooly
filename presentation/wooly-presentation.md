---
marp: true
paginate: true
html: true
---

<style>
/* ============================================================
   Wooly — Marp deck theme
   Palette pulled from docs/js/themes.js, type from docs/css/style.css:
   Fraunces (hero display), Playfair Display (section headings),
   Sora (body), warm cream + espresso + gold.
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Sora:wght@300;400;500;600;700&display=swap');

section {
  background: #F5F2EB;
  color: #2A1A0E;
  font-family: 'Sora', -apple-system, sans-serif;
  font-size: 25px;
  line-height: 1.55;
  padding: 64px 80px;
}

/* Kicker label — small caps tag above every content headline */
.kicker {
  display: block;
  font-family: 'Sora', sans-serif;
  font-size: 0.5em;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #C8922A;
  margin-bottom: 14px;
}

h1, h2, h3 {
  font-family: 'Sora', -apple-system, sans-serif;
  color: #2A1A0E;
  font-weight: 700;
  margin: 0;
}

h2 {
  font-size: 1.75em;
  line-height: 1.15;
  margin-bottom: 0.7em;
  padding-bottom: 0.35em;
  border-bottom: 3px solid #E8D9BC;
}

h3 {
  font-size: 1.05em;
  color: #6B3F1F;
  margin-bottom: 0.3em;
}

strong { color: #6B3F1F; font-weight: 700; }
em { color: #6B3F1F; font-style: italic; }

a { color: #C8922A; text-decoration: none; border-bottom: 1px solid #C8922A; }

ul, ol { padding-left: 0; margin-top: 0.4em; }
li {
  list-style: none;
  padding-left: 1.5em;
  position: relative;
  margin-bottom: 0.55em;
}
li::before {
  content: "";
  position: absolute;
  left: 0.15em;
  top: 0.55em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #C8922A;
}

/* Pill tag — mirrors .sec-t / .ab-k styling from the real app + PDF */
.pill {
  display: inline-block;
  background: #EFE0BE;
  color: #2A1A0E;
  padding: 6px 17px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.46em;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-right: 8px;
  box-shadow: 0 3px 8px rgba(107,63,31,0.18);
}

/* Bento grid — asymmetric feature layout with real depth: layered shadows,
   top highlight rim light, multi-stop gradients, inline icons. */
.bento {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 18px;
  margin-top: 0.8em;
}
.bento-cell {
  position: relative;
  border-radius: 16px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}
.bento-hero {
  grid-row: 1 / 3;
  background:
    radial-gradient(ellipse 320px 260px at 25% 15%, rgba(232,182,90,0.32) 0%, rgba(232,182,90,0) 60%),
    linear-gradient(160deg, #6B3F1F 0%, #5A331A 100%);
  color: #FAF7F0;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.1),
    0 2px 4px rgba(0,0,0,0.1),
    0 14px 30px rgba(42,26,14,0.28);
  border: 1px solid rgba(232,182,90,0.22);
}
.bento-hero .bento-label {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1.2em;
  color: #FFFFFF !important;
  margin-bottom: 4px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.bento-hero .bento-desc { font-size: 0.8em; color: #FFFFFF !important; margin-bottom: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.35); }
.bento-hero .bento-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.bento-hero .pill { margin-right: 0; background: rgba(0,0,0,0.25); color: #FFFFFF; box-shadow: none; border: 1px solid rgba(255,255,255,0.4); }

.bento-a, .bento-b, .bento-c {
  background: linear-gradient(165deg, #FDFBF5 0%, #FAF7F0 100%);
  border: 1px solid #E8D9BC;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.9),
    0 1px 2px rgba(42,26,14,0.04),
    0 10px 24px rgba(42,26,14,0.08);
}
.bento-b { background: linear-gradient(165deg, #F3E4C4 0%, #EFE0BE 100%); border-color: #DCC896; }
.bento-c { grid-column: 2 / 4; flex-direction: row; align-items: center; gap: 28px; }
.bento-c .bento-inner { flex: 1; padding-right: 28px; border-right: 1px solid #E8D9BC; }
.bento-c .bento-inner:last-child { padding-right: 0; border-right: none; }
.bento-cell .bento-label {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1.02em;
  color: #6B3F1F;
  display: block;
  margin-bottom: 4px;
}
.bento-cell .bento-desc { font-size: 0.85em; color: #4A3B2E; }
.bento-b .bento-label, .bento-b .bento-desc { color: #2A1A0E; }

section { position: relative; }
.kicker, h1, h2, h3, p, ul, ol, .bento { position: relative; z-index: 1; }

/* ---------- Title & divider slides: full espresso background with spotlight ---------- */
section.hero {
  background:
    radial-gradient(ellipse 900px 600px at 50% 38%, rgba(232,182,90,0.28) 0%, rgba(232,182,90,0) 62%),
    radial-gradient(ellipse 1400px 900px at 50% 0%, rgba(200,146,42,0.14) 0%, rgba(200,146,42,0) 55%),
    radial-gradient(ellipse 1600px 1000px at 50% 100%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%),
    #2A1A0E;
  color: #FAF7F0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

section.hero img.logo {
  width: 140px;
  margin-bottom: 30px;
  filter: drop-shadow(0 0 50px rgba(232,182,90,0.55)) drop-shadow(0 4px 24px rgba(0,0,0,0.4));
}
section.hero img.logo-big {
  width: 200px;
  margin-bottom: 40px;
}

section.hero h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  color: #FDF6EA;
  font-size: 4em;
  letter-spacing: -0.5px;
  text-shadow: 0 0 60px rgba(232,182,90,0.35);
}

section.hero .rule {
  width: 90px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #E8B65A, transparent);
  margin: 26px 0;
  border-radius: 2px;
}

section.hero p.tagline {
  font-size: 0.95em;
  color: #D8C9B8;
  max-width: 640px;
  line-height: 1.6;
}

section.hero p.link {
  margin-top: 34px;
  font-family: 'Sora', sans-serif;
  font-weight: 500;
  font-size: 1.2em;
  color: #E8B65A;
}
section.hero p.link a {
  color: #E8B65A;
  border-bottom: 1px solid rgba(232,182,90,0.5);
}

/* Divider slide (section break) — same espresso backdrop + spotlight, no logo */
section.divider {
  background:
    radial-gradient(ellipse 1000px 650px at 50% 45%, rgba(232,182,90,0.22) 0%, rgba(232,182,90,0) 62%),
    radial-gradient(ellipse 1600px 1000px at 50% 100%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%),
    #2A1A0E;
  color: #FAF7F0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
section.divider .kicker { color: #E8B65A; }
section.divider h1 {
  font-family: 'Fraunces', 'Playfair Display', serif;
  font-optical-sizing: auto;
  font-weight: 600;
  color: #FDF6EA;
  font-size: 2.8em;
  text-shadow: 0 0 50px rgba(232,182,90,0.3);
}
section.divider .rule {
  width: 70px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #E8B65A, transparent);
  margin: 20px 0;
  border-radius: 2px;
}

/* ---------- Screenshot slides ---------- */
section.screenshot { padding-bottom: 40px; }
section.screenshot h2 { margin-bottom: 0.35em; }
section.screenshot img {
  display: block;
  margin: 0.3em auto 0;
  max-height: 68%;
  border-radius: 10px;
  border: 1px solid #E8D9BC;
  box-shadow: 0 20px 45px rgba(42,26,14,0.22), 0 2px 8px rgba(42,26,14,0.12);
}
.caption {
  text-align: center;
  color: #8A7A68;
  font-size: 0.46em;
  letter-spacing: 0.5px;
  margin-top: 0.7em;
}

/* Footer page counter styling */
section::after {
  color: #B8A88F;
  font-family: 'Sora', sans-serif;
  font-size: 0.55em;
}
</style>

<!-- _class: hero -->

<img class="logo logo-big" src="../docs/icons/logo.png" alt="Wooly">

<div class="rule"></div>

<p class="tagline">The free pattern editor for knitters and crocheters — right in your browser, no account, always with you</p>

<p class="link"><a href="https://carminemnc.github.io/wooly/">carminemnc.github.io/wooly</a></p>

---

<span class="kicker">01 · The Problem</span>

## Your patterns deserve better than this

- Messy Word documents that drift out of sync
- Photos of handwritten notes, hard to read months later
- PDFs you found online — impossible to tweak or reuse
- Paper notes that get lost or ruined mid-project

Patterns end up scattered, hard to find, and even harder to share clearly.

---

<span class="kicker">02 · What is Wooly</span>

## An editor built for the craft, not the cloud

<div class="bento">

<div class="bento-cell bento-hero">
  <span class="bento-label">Made for makers</span>
  <span class="bento-desc">No cloud, no lock-in — just a fast, focused editor.</span>
  <div class="bento-tags">
    <span class="pill">Free</span><span class="pill">No account</span><span class="pill">Offline</span><span class="pill">Bilingual</span>
  </div>
</div>
<div class="bento-cell bento-a">
  <span class="bento-label">Runs in your browser</span><span class="bento-desc">No install, no sign-up, no subscription.</span>
</div>
<div class="bento-cell bento-b">
  <span class="bento-label">Yours, on your device</span><span class="bento-desc">Patterns are stored locally — never uploaded.</span>
</div>
<div class="bento-cell bento-c">
  <div class="bento-inner">
    <span class="bento-label">Works offline</span><span class="bento-desc">Once opened, it keeps working without internet.</span>
  </div>
  <div class="bento-inner">
    <span class="bento-label">Installable</span><span class="bento-desc">Add it to your phone or tablet like a real app.</span>
  </div>
</div>

</div>

---

<!-- _class: divider -->

<span class="kicker">Building a Pattern</span>

# From blank page to finished chart

<div class="rule"></div>

---

<!-- _class: screenshot -->

## A cover page that says it all

![w:820](screenshots/editor-cover.png)

<p class="caption">Screenshot — pattern cover with photo, author, difficulty, category and techniques</p>

---

<span class="kicker">The Cover</span>

## Everything you need before casting on

- Project photo, right at the top
- Author, difficulty, category, techniques used
- Measurements and gauge, ready to check at a glance

Everything a maker needs before starting, in a single view.

---

<!-- _class: screenshot -->

## Materials and abbreviations, side by side

![w:900](screenshots/editor-materials-abbr.png)

<p class="caption">Screenshot — Materials and Abbreviations sections displayed together in the editor</p>

---

<span class="kicker">Abbreviations</span>

## Your shorthand, defined once

- Set up your own abbreviations (k, p, ssk, yo...)
- Save them as a **reusable set** across every pattern you write
- They carry over cleanly into the exported PDF

No more guessing what "mb" meant three patterns ago.

---

<!-- _class: screenshot -->

## Steps, row by row

![w:900](screenshots/editor-steps.png)

<p class="caption">Screenshot — Steps section with numbered rows, a tip and a note</p>

---

<span class="kicker">Steps</span>

## Built for working the pattern, not just reading it

- Rows number themselves automatically — even across repeats (×N)
- **Tips** and **notes** stay separate from the instructions
- Split a pattern into pieces (front, back, sleeve...) and work them one at a time
- Reorder anything with a simple drag

---

<span class="kicker">More Sections</span>

## Video links and free-form notes

- Drop in a tutorial link — it becomes a scannable **QR code** in the PDF
- Custom sections for anything outside the usual structure
- Care instructions, colorway ideas, final notes — your call

---

<!-- _class: divider -->

<span class="kicker">Sharing Your Work</span>

# From screen to printed page

<div class="rule"></div>

---

<!-- _class: screenshot -->

## An elegant PDF, ready to print

![w:760](screenshots/pdf-export.png)

<p class="caption">Screenshot — exported PDF, first page with cover and materials</p>

---

<span class="kicker">Export</span>

## A PDF made for people who knit, not just print

- Careful pagination — a section never splits awkwardly across pages
- Automatic QR codes for every video link
- Add your own logo and footer for a personal touch
- Export to **JSON** too, for backup or reuse elsewhere

---

<span class="kicker">Always With You</span>

## Wherever you craft, Wooly follows

<div class="bento">

<div class="bento-cell bento-hero">
  <span class="bento-label">Full backup</span>
  <span class="bento-desc">Export everything — patterns, sets, templates — to one file.</span>
  <div class="bento-tags">
    <span class="pill">JSON export</span><span class="pill">Smart merge</span>
  </div>
</div>
<div class="bento-cell bento-a">
  <span class="bento-label">Light or dark</span><span class="bento-desc">Pick the theme that's easiest on your eyes.</span>
</div>
<div class="bento-cell bento-b">
  <span class="bento-label">Italian &amp; English</span><span class="bento-desc">Switch languages to share with any community.</span>
</div>
<div class="bento-cell bento-c">
  <div class="bento-inner">
    <span class="bento-label">Installable</span><span class="bento-desc">Add it to your home screen and open it like an app.</span>
  </div>
  <div class="bento-inner">
    <span class="bento-label">Works everywhere</span><span class="bento-desc">Desktop, tablet, or phone — your workflow, your pace.</span>
  </div>
</div>

</div>

---

<!-- _class: hero -->

<img class="logo" src="../docs/icons/logo.png" alt="Wooly">

# Try it for free

<div class="rule"></div>

<p class="tagline">No sign-up. No cloud. Your patterns stay yours.</p>

<p class="link"><a href="https://carminemnc.github.io/wooly/">carminemnc.github.io/wooly</a></p>
