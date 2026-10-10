# Agent brief - shared by every fan-out page of learn-reading-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page for YOUR track. Copy its structure, classes, SVG grammar and quiz markup
   EXACTLY, including how many options each question has:
   - Single track: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-reading-with-phoebe/courses/01-what-reading-speed-measures.html` (and read `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-reading-with-phoebe/courses/04-the-recall-bench.html` for the bench numbers it prints)
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-reading-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-reading-with-phoebe/assets/style.css`
<!-- Slimming these reads (map block only, no stylesheet) is plan step 6: adopt only after an A/B
     page passes the same gate. docs/plans/2026-09-25-course-builder-token-diet.md -->

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "Session N of 6", #toggle-all, #zoom-toggle) · masthead (eyebrow
"Learn Reading with Phoebe · Session N of 6", h1 with one `<span class="accent">`, .sub, .chip-row with the level chip
(🟡 Core for sessions 2-3, 🟠 Deeper for sessions 5-6), .agenda a1-a4) · main.wrap · section#intro (Part 0: kicker, .lede, .legend pills,
.callout.win "★ What you walk out with tonight") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
figure, `details.card` accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`,
`.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" on the page ·
section#demo-1 Build-along (kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each with a `.prompt-box.good` carrying a `span.label`; Mina's constructed pile, with the learner's own material alongside; every prompt-box shows what the learner writes, labelled "Your numbers will differ" where it carries numbers)
· section#exercise Homework (ol, 4 items) · section#quiz (3 x `.quiz-q data-answer="0-based"`,
`p.qtext`, `button.qopt` "A · ..." as in your template, `p.qwhy`; one `p.quiz-score` after the
last) · section#official, h2 EXACTLY "What this session teaches, and where it came from",
`.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY
"Every fact on this page, and its verification tier, is recorded in the course's source map." ·
section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>", .grid-2 of six
.cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot · 
`<script src="../assets/app.js?v=1">`.

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn reading with phoebe</title>`; `<link rel="stylesheet" href="../assets/style.css?v=1">`.
Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. For constructed data print "your
  numbers will differ", never invented outputs as if run.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the exact form of the map's appendix; anything marked secondary is "reported".
- NEVER "lottery" or "lotteries"; say the mechanism ("decided by row order", "arbitrary", "a
  random draw"). A verbatim quoted title in curly quotes is the only exception.
- Default to the English word. A Chinese term that is genuinely a name carries its English in
  brackets right after it, every occurrence: `店播 (brand rooms)`.
- Titles, widget ids and class names must not collide with siblings: "A system you keep", "The one-page marketing plan", "Is it worth the time?", "Where your week actually goes"; never reuse ids or classes `recall-bench`, `rd-learner`, `rd-model` or any `rd-*` class (the session 4 widget owns them); SVG class prefixes per figure `r<N><letter>` (e.g. r2a, r2b) only.
- Every reading rate is "silent reading" (siblings quote SPEAKING rates). Adler and Van Doren is REPORTED: paraphrase, never quote, never give page numbers. Ebbinghaus measured savings in relearning, never "% remembered". Cite Cepeda 2008 as 20-40% of a 1-week delay and 5-10% of a 1-year delay, never "10-20%". Learning styles: "no adequate evidence base" for the meshing version, with Pashler's caveat that not every version was tested. Rereading and highlighting are rated LOW utility, never "useless". Never present a modelled number as measured. No figure with only decoration. Seams: never teach a note-filing system (PKM), linking notes (Obsidian), drawing notes (Sketchnoting) or designing charts (Dataviz); one sentence and an absolute link instead.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink `#1A1F33` · muted `#575E73` · faint `#CDD2DF` · hairline `#E6E9F1` · deep `#1C2862` · primary `#2C3E8C` · mid `#24357A` · soft `#CBD3EF` · tint `#EEF1FA` · warm contrast `#B5532A` · warm ink `#7A3416` · warm tint `#FCF4EF` · paper `#FCFCFE` · `#FFFFFF` · universal reds
`#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" role="img" aria-label="the data, not the
  shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom - takeaway</figcaption>`.
  Grow H, never W.
- Prefix unique per figure, used for every class and id: `r<session><letter>`, e.g. `r2a`, `r2b`, `r2c`, `r2d` (ids `r2aSk`, `r2aHc`, `r2aAr`; classes `.r2aH`, `.r2aL` ...).
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  accent line, opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, ink stroke
  1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="<ink>" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-4 to 4 degrees for
  hand-placed items, under 1 for panels). Fills: white, accent-50, the hachure for "the pile" or "the
  data", and the contrast colour ONLY for the one thing the figure is about. One doodle anchor per
  figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading · `.PL` 600 12px
  ink label · `.PS` 400 11px muted · `.PB` 800 11px contrast-ink · `.PV` 800 16-20px accent-deep
  value · `.PW` 800 12px white on a fill · `.PA` 700 11px accent axis caption · `.PN` 400 12px muted
  note. Hand-stacked items must not overlap as painted rects (the gate flags a pile).
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px.
- Fit (owner: `diagram-kit.md`, change it there first): max chars ≈ (box width - 20) / 7 at 12px,
  6.4px/char at 11px; full-width note under 110 chars; 40px between neighbouring point labels; bottom
  note 22px below the last row, H clears it by 8px. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (what the reader does in which order and what each step yields; the fluency signal against the recall signal; a calendar of gaps against a forgetting curve; the three passes over a paper),
  never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a real-world story from the map's cases. Constructed cases say "constructed" on the
page: Mina, a new analyst at Harbourline (an invented shipping company), must recommend one of two warehouse-software vendors (Vendor A prices per pick, Vendor B per seat) by Friday; her pile is a 60-page vendor report, two research papers on picking errors (their titles and abstracts are constructed), the vendor API documentation and a dashboard of last year's orders. No number about Mina or Harbourline is a measurement. Never claim what the learner will score or remember. Effect sizes only from the map. Where the map says "reported", the page says "as reported in ..." and the coverage row uses the light ◐ pill.

## Cross-links (absolute URLs)

- PKM (note systems, review): https://phoebefu6.github.io/learn-pkm-with-phoebe/
- Obsidian (linking notes by idea): https://phoebefu6.github.io/learn-obsidian-with-phoebe/
- Sketchnoting (visual notes): https://phoebefu6.github.io/learn-sketchnoting-with-phoebe/
- Data Visualization (designing charts): https://phoebefu6.github.io/learn-dataviz-with-phoebe/
- Session pages link each other relatively, e.g. `04-the-recall-bench.html`
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain(s) and session titles

01-what-reading-speed-measures.html "What reading speed really measures" -> 02-reading-with-a-question.html "Reading with a question" -> 03-rereading-feels-like-learning.html "Rereading feels like learning" -> 04-the-recall-bench.html "The recall bench" -> 05-spacing-and-forgetting.html "Spacing, and the forgetting you can plan for" -> 06-papers-docs-charts.html "Reading a paper, a doc and a chart"
Footer left: "Session N of 6 · learn-reading-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "← Prev: <title>" and "Next: <title> →" (last page: "← Prev" and "Course home").

Session titles (exact, sentence case, one accent span in h1): 1 What reading speed really measures · 2 Reading with a question · 3 Rereading feels like learning · 4 The recall bench · 5 Spacing, and the forgetting you can plan for · 6 Reading a paper, a doc and a chart

## Course-specific notes (read before writing)

- Quiz: 3 questions, FOUR options each (A-D), exactly as session 1.
- Head: copy session 1's social meta block, replacing title, description and URL. Stylesheet and
  app.js both `?v=1`. Session 2/3/5/6 pages load ONLY `../assets/app.js?v=1` (no bench scripts).
- Session 1 uses `.chip level` "🟢 Foundations"; yours: sessions 2-3 "🟡 Core", 5-6 "🟠 Deeper".
- Masthead `.agenda` keeps four spans a1-a4 with the same flex pattern as session 1.
- The bench numbers in session 4 (day-30 recall 1.0 / 7.6 / 14.4 / 46.5 / 72.8 / 7.7) are MODELLED;
  cite them only as "the session 4 model prints" and only these values.
- Light surfaces only. The callout, prompt-box and code styles from session 1 are the only boxes.
- No em or en dash ANYWHERE, including inside SVG text and aria-labels. Check before returning:
  a search for the en dash and em dash characters (U+2013, U+2014) in your file must find none.
- No text in an SVG may be crossed by a path, arrow or curve (the gate scans this). Keep labels in
  clear space; keep box text inside its box (budget: (box width - 20) / 7 chars at 12px).
