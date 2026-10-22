# blog.soards.me redesign: direction (FINAL, Oct 22 2026)

## Final decisions
- **Direction:** C, the 90s music-magazine look, kept readable. Red + black: Radix red-9 `#e5484d` as the accent (red-11 for red text), Radix mauve grays, warm paper `#f4f1ec` in light mode and `#0b0a0b` in dark. Light and dark are both first-class, switched by the `.dark` class on `<html>`.
- **Headings: all lowercase (final).** Anton, `text-transform: lowercase`, with real lowercase strings in the mockups, proper nouns included (it's the style). Letter-spacing `+0.004em`. Small mono labels, kickers, tags and chips stay UPPERCASE.
  - **Leading rule:** Anton's descenders (g, p, q, y) and ascenders (b, d, l) are deep, so a multi-line display heading needs **line-height ≥ 1.1**. Final values:
    - Cover headline and post title: 1.1
    - Card titles and prev/next titles: 1.14
    - Post h2: 1.15
    - One-line section heads ("also in this issue"): 1.05
    - Masthead: 0.8 (single line, caps)
    - Brand in the post top bar: 0.9 (single line)
  - Tried tighter (cover/title 1.06, cards and h2 1.1): the "g" of "bringing" nearly touched "code's" on the line below, so the round-4 values stay.
- **Masthead: uppercase `SOARDS`.** This is the recommended nameplate and is **pending David's confirmation**. It's one CSS toggle: `--masthead-case: uppercase | lowercase | none` (in `site.css`; it applies to the masthead and the post top-bar brand). Size: **`--fs-masthead: clamp(64px, 9vw, 124px)`** (David's edit: middle term 10vw → 9vw). DS box: `clamp(54px, 8vw, 100px)`.
- **Body: Literata**, trimmed and self-hosted: `fonts/Literata-400-700.woff2` (variable 400–700, 36,804 B, the only preloaded font) and `fonts/Literata-Italic-400.woff2` (21,324 B). Anton: 18,612 B. 18px body (17px mobile), line-height 1.7.
- **Post column: `38rem`** (~70 chars/line measured), a fixed rem width rather than `ch`.
- **CSS:** one shared stylesheet, `site.css` (tokens → base → components; ~390 readable lines). It is the reference for the Tailwind 4 `@theme` mapping in `PLAN.md`.
- **Topic filter (5):** All / AI / Design / Front-end / Infra, mapped from the real 38 tags (see `PLAN.md`).
- **Two logos:** the framed DS box in the homepage masthead only; the small mark (`img/dys-small.svg`) in the post top bar, footers, end mark and red favicon.
- **Border system (spacing first; final, round 5):** spacing separates sections. Lines are kept only where they do a job.
  - **Home has no divider rules.** The masthead, editor's letter, cover, "also in this issue", back issues and footer are separated by space alone: `--space-mast: 18px` (adds to the masthead's 12px, so ~30px masthead → letter) and `--space-block: 48px` (letter → cover → "also" → back issues; 36px on mobile), matching David's edit at 1024 wide.
  - **Editor's letter = L4 (final):** a quiet 1px box with the "EDITOR'S LETTER" label (red, plus the mono "//// FROM DAVID" sublabel) set into the top border. A `--paper` background behind the label knocks out the line, so the label breaks it cleanly in both themes. The frame is a token, `--frame: color-mix(in oklab, var(--ink) var(--frame-mix), transparent)` with **`--frame-mix: 22%` in both light and dark**. 15% nearly vanished on the light paper, and 30% started to compete with the filter-chip outlines (100% ink). See `shots/letter-l4-opacity.png`. The letter stays 2 columns on desktop and 1 on mobile, where the label still sits on the border (left 12px). Margin-top is `--space-mast` + 8px (half the label). The other options, L0–L3, are in `shots/letter-box-*.png`.
  - **Post top bar keeps the one double rule** `.rule-major`: a **2px line in `--frame` (22% ink, the same faint-line token as the editor's letter box)**, a 3px gap, a 4px red bar (`--rule-major-line: 2px`, `--rule-gap`, `--rule-bar`). Tested at 22/40/60% (1.5px) plus 22% at 2px, in `shots/post-rule-opacity.png`. At 1.5px, 22% was too faint next to the red bar. At 2px it reads as a soft line that supports the red bar instead of competing with it, and it keeps one faint-line value for the whole site. 40% and 60% looked like a gray hairline fighting the red. It's the only double rule on the site. It works as the nameplate's base on inner pages, where the giant masthead isn't present.
  - **Post: removed** the hairline under the post header, the gray rule above h2s (now `margin-top: 80px` and no padding), the border around in-post images, and the footer rule (the footer matches home: no rule). See `shots/post-borders-compare.png`.
  - **Kept 1px lines:** the letter frame (22% ink, above), the prev/next box (1px `--rule` frame plus its divider), hairlines between back-issue rows, and the filter chips' 1px ink outline (controls, not dividers). Code blocks get a tinted background, no border.
- **Post accents:** red only for the headline accent words, links, `////` labels and the pull-quote mark. Borderless blockquotes, tinted code blocks, extra space (no rule) above h2, a small-caps lead-in, no drop cap on posts.

## Final files
- `home-lower.html`, `post-lower.html`: the final mockups, built by `python3 build.py` from `home.tpl`, `post.tpl`, `site.css`, `common.js` and `posts.json`.
- `shots/home-lower-*`, `shots/post-lower-*`: fold (1280×800), full desktop, mobile (390), body crop; light and dark.
- `shots/before/`, `shots/after/`: CSS refactor pixel-diff evidence.
- `scripts/trim-fonts.py`: the font trimming script.
- `PLAN.md`: the implementation plan for the Astro repo.
- `shots/letter-box-{dark,light}.png`: editor's letter box options L0–L4 (DPR 2); `shots/letter-l4-opacity.png`: L4 frame at 15/22/30%; `shots/post-rule-opacity.png`: top-bar ink line opacity/weight. `shots/post-borders-compare.png`: post before/after border removal.
- `archive/round2..4/`, `archive/pre-refactor/`, `archive/pre-borderless/`, `archive/pre-l4/`, `archive/pre-rule-opacity/`: earlier rounds.

---
## History (earlier rounds)
### Round 4 notes (superseded where the final section differs)

## Round 4 decisions
- **Body serif = Literata** (OFL; files in `fonts/`, latin subset, 230 glyphs, trimmed with fontTools):
  - `fonts/Literata-400-700.woff2`: variable, wght axis limited to 400–700, **36,804 bytes**. `@font-face` uses `font-weight: 400 700`. This is the only preloaded font.
  - `fonts/Literata-Italic-400.woff2`: static italic 400, **21,324 bytes**. Bold italic is synthesized by the browser (rare in posts).
  - Anton (`fonts/Anton-Regular.woff2`, 18,612 bytes) for headlines. License files: `OFL-Literata.txt`, `OFL-Anton.txt`.
  - Body size 18px desktop / 17px mobile, line-height 1.7.
- **Column = fixed rem width, not `ch`.** Post body is `max-width: 38rem` (608px). Measured with Literata 18px on prose paragraphs: **~70 characters per line on average** (median 70, range 62–79). Reason: `ch` is the width of the font's "0" glyph, so it changes with the font (and the fallback font while a web font loads) and scales with font size; the measure then drifts whenever the serif or size changes. A rem width is predictable, and line length is tuned once, by measuring.
- **Heading case: pending.** Two variants, both Anton + Literata:
  - **All caps** (`home-caps.html`, `post-caps.html`): `text-transform: uppercase`, tight leading as before (`.88` general, cover `.92`, post h1 `.9`). Caps have no descenders, so tight leading is safe.
  - **Title case** (`home-title.html`, `post-title.html`): `text-transform: none`, real Title Case strings (hand-checked; e.g. "My MacBook Is a Client Now", "Set Up …" as a verb, "with" instead of "w/", WordPress/MySQL/PostgreSQL/pgvector/CSS/SVG/UI cased correctly). Letter-spacing `+0.004em`.
    - **Rule:** Anton has deep descenders (g, p, y) and tall ascenders, so mixed-case display headings need **line-height ≥ 1.1**. At 1.02–1.04 the "g" of "Bringing" touched "Code's" on the next line.
    - Final values: cover h2 1.1, post h1 1.1, "also in this issue" heading 1.05 (single line), card titles 1.14, post h2s 1.15, prev/next titles 1.14. Back-issue titles are Literata body text and are unaffected.
    - The masthead wordmark stays uppercase `SOARDS` in both variants (and in the post top bar): it reads as a logo, and mixed case "Soards" looked weaker next to the DS box.
  - Small mono labels, kickers and tags stay uppercase in both.

## Round 3 decisions (superseded where round 4 differs)

## Round 3 decisions
- **Masthead: `SOARDS`** (single word) set in **Anton** (self-hosted, `fonts/Anton-Regular.woff2`). System-font and `DAVID SOARDS` variants dropped from the build (round-2 files archived in `archive/round2/`).
- **Two-logo system:**
  - *Framed DS logo box* (`logo.svg`, from `DYSLogo.astro`): homepage masthead only.
  - *Small mark* (`img/dys-small.svg`, David's small-size version, `currentColor`): post-page top bar (with the SOARDS wordmark), footers (home + post), post end mark, and favicon (red `#e5484d`: `img/favicon.svg`, `img/favicon.ico` 16/32/48, `img/favicon-32.png`, `img/apple-touch-icon.png`).
- **Post-page accent rules: red is reserved** for the headline accent words, links, `////` labels (including the code-block language label) and the opening quote mark of the pull quote. Nothing else.
  - No red borders anywhere in the body. Blockquotes: no border; italic, ~1.08em, indented 2em, muted color.
  - Pull quote: large italic serif, indented, with a red Anton opening quote mark; no rules.
  - Code blocks: tinted background, 6px radius, no border; code scrolls horizontally, `md` prompt blocks wrap.
  - H2 section breaks: thin neutral (mauve-6) rule plus spacing.
  - No drop cap on posts; small-caps lead-in on the first words instead. The homepage editor's letter keeps its red drop cap (it has no borders).
  - Previous/next issue box stays at the bottom.
- ~~Body serif: pending~~ → Literata (round 4). Round-3 note: Candidates (all self-hosted OFL variable woff2, latin, roman + italic, in `fonts/` with licenses): **Newsreader**, **Source Serif 4**, **Literata**, vs the baseline **system Charter** stack. Recommendation: Source Serif 4.
- **Headline case: open.** Added an all-lowercase Anton variant (`home-lowercase.html`, `post-lowercase.html`, with Source Serif 4) to compare against all caps.


## Decided
- **Direction C — 90s music-magazine** (Rolling Stone / Spin / The Source energy), kept readable. Picked over A (quiet) and B (editorial) on Oct 2026 review.
- **Palette:** red + black. Radix red (red9 `#e5484d`, red11 `#ce2c31` light / `#ff9592` dark) + Radix mauve grays. Warm paper `#f4f1ec` in light, near-black `#0b0a0b` in dark.
- **Light + dark mode** both first-class; toggle in header, honors `?theme=dark|light`, persists in localStorage, defaults to `prefers-color-scheme`.
- **Fonts:** body = Charter / system serif stack; captions = system monospace; UI labels = Helvetica Neue. Headlines/masthead = either system condensed stack ("system") or ONE self-hosted display font ("display"; current candidate **Anton**, OFL, `fonts/Anton-Regular.woff2`, 18 KB, latin subset). No other web fonts.
- **Tags:** 34-tag cloud replaced by a 5-option topic filter: All / AI / Design / Front-end / Infra (topics mapped from existing tags). Raw tags still shown in mono on posts.
- **Masthead:** ~half the round-1 height. One row: wordmark (red, condensed caps) + DS logo box. `//// Vol / Issue / date` bar above, red double rule below. "the blog of" removed.
- **Editor's letter:** short intro strip between masthead and cover story (drop cap, 2 columns on desktop). Replaces the old profile subtitle.
- **Cover story:** image + headline side by side, headline ~half round-1 size; at 1280×800 the cover image, headline, dek and top of "Also in this issue" are above the fold.
- **Images:** red duotone + halftone dot overlay on cover and "Also in this issue" cards, hover reveals original color. Dark mode = red-on-black.
- **Back issues:** text-only framed index (date / title / first tag), so weak old logo thumbnails never appear.
- **Post page:** loud header (mono kicker, big condensed title, italic dek, mono date/tags, duotone hero) + calm body: ~68ch Charter column, red drop cap + small-caps lead-in, red-ruled condensed H2s, `////`-labeled code blocks (wrapping, themed for light/dark), pull quote, prev/next box.

## Open questions
1. ~~Masthead wording~~ → SOARDS (round 3).
2. ~~Display font~~ → Anton (round 3).
2b. ~~Body serif~~ → Literata (round 4).
2c. **Headline case: ALL CAPS vs Title Case** (lowercase explored in round 3).
3. **Thumbnails:** regenerate old posts' images (semi-abstract generated style) if they ever need a big slot (cover / "Also in this issue"); currently only the 7 newest posts get image slots.
4. Issue/volume numbering — keep as decorative, or make it meaningful (e.g., post count)?
5. Editor's letter copy — final wording by David.
6. Italic display serif for kickers — not used yet; revisit only if kickers feel flat.

## Files (round 4)
- `home-caps.html`, `post-caps.html`, `home-title.html`, `post-title.html`
- `shots/compare-home-fold-dark.png`, `shots/compare-post-top-{dark,light}.png`: caps vs title case (`python3 compare.py`)
- `measure.js`: measures chars per line of the post body
- `archive/round3/`: round-3 pages, fonts, img and shots (self-contained)

## Files (older rounds)
- `home-serif-{charter,newsreader,sourceserif,literata}.html`: homepage per body serif
- `post-serif-{charter,newsreader,sourceserif,literata}.html`: post page per body serif
- `home-lowercase.html`, `post-lowercase.html`: lowercase-headline variant (Source Serif 4)
- `shots/serif-compare-{dark,light}.png`: 2×2 body-serif comparison (`python3 compare.py`)
- `archive/round2/`: round-2 files and screenshots
- `build.py` + `home.tpl` / `post.tpl` / `common.js` / `base.css` / `posts.json` — generator (`python3 build.py`)
- `shoot.js` — screenshots via Chrome DevTools (`node --experimental-websocket shoot.js *.html`) → `shots/`
