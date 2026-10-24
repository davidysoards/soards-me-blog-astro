---
name: blog.soards.me
description: A readable 90s music-magazine design built on Radix red and mauve.
colors:
  paper: 'var(--mauve-1)'
  ink: 'var(--mauve-12)'
  mute: 'var(--mauve-11)'
  rule: 'var(--mauve-6)'
  frame: 'color-mix(in oklab, var(--mauve-12) 22%, transparent)'
  accent: 'var(--red-9)'
  accent-text: 'var(--red-11)'
  on-accent: 'white'
  code: 'var(--mauve-2)'
  code-fg: 'var(--mauve-12)'
typography:
  masthead:
    fontFamily: 'var(--font-anton)'
    fontSize: 'clamp(76px, 13.5vw, 176px)'
    fontWeight: 400
    lineHeight: 0.9
  cover:
    fontFamily: 'var(--font-anton)'
    fontSize: 'clamp(52px, 6.6vw, 96px)'
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: 'var(--font-anton)'
    fontSize: 'clamp(46px, 6.4vw, 84px)'
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: 'var(--font-literata)'
    fontSize: '18px mobile / 20px desktop'
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
    fontSize: '12px'
    fontWeight: 500
    letterSpacing: '.05em'
rounded:
  inline-code: '3px'
  code-block: '6px'
  theme-toggle: '50%'
spacing:
  gutter: '32px'
  gutter-mobile: '18px'
  section: '48px'
  section-mobile: '36px'
  article-section: '80px'
components:
  subtitle-bar:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-accent}'
    typography: '{typography.label}'
  topic-active:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-accent}'
  previous-next-hover:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-accent}'
  theme-toggle:
    textColor: '{colors.mute}'
    rounded: '{rounded.theme-toggle}'
    size: '34px'
---

# blog.soards.me

## Overview

A loud 90s music-magazine frame around calm, readable articles. Anton gives the nameplate and headlines their condensed shout; Literata carries the reading column; small uppercase mono labels and red duotone imagery supply the editorial accents.

Radix colors are the foundation. Mockups in `docs/redesign/` guide composition only; their standalone CSS is not production configuration.

**Key characteristics:** red nameplate and bars, lowercase Anton headlines, `////` mono kickers, red/ink duotones, flat square-cornered surfaces, ink rules instead of cards.

## Colors

`src/styles/tailwind.css` imports Radix red, red-dark, mauve and mauve-dark. The `.dark` class on `<html>` swaps every scale, including display-P3 values, so there are no hex values or manual dark overrides.

- **Palette API:** `accent-1…12` map to `red-1…12`; `gray-1…12` map to `mauve-1…12`. These are public scales; don't prune unused steps.
- **Accent (red-9):** fills only: nameplate, bars, rules, headline accents, duotone canvas, drop cap, list `//` marks, pull-quote mark.
- **Accent text (red-11):** small red text: links, `////` marks, label accents, hover states, focus outline, selection background (with red-1 text).
- **Neutrals:** paper, ink and mute for page, headings/strong text and body/labels; rule for hairlines; frame for the faint line under the home strip.
- **Code:** mauve-2 / mauve-12 for inline code and unhighlighted blocks. Shiki's github-dark owns highlighted blocks; they carry Radix's `dark-theme` class, so their language labels use dark red-11 in both themes.

**The Fill-or-Text Rule.** Red-9 is a fill and red-11 is text. Never set text in red-10 (about Lc 41 on dark paper) and never use red-11 as a solid background.

**The White-on-Red Rule.** Text on red-9 is white (APCA about Lc 71). Black on red-9 is only about Lc 39. WCAG 2 tools report white on red-9 as 3.9:1; that's a known WCAG 2 flaw with saturated colors, and this system follows APCA as Radix does. Exception: the home subtitle bar currently switches to black in dark mode.

## Typography

Astro's local Fonts API (`astro.config.mjs`) serves the woff2 files in `src/assets/fonts/` with their licenses. `font-display` and `font-serif` utilities point at Astro's generated variables. Both families use `font-display: block`; `BaseHead.astro` preloads Anton and roman Literata, plus italic Literata on posts. Astro generates the metric-matched fallbacks; don't hand-tune them.

- **Masthead:** SOARDS in uppercase red with an italic Literata "david y." above it at .22em.
- **Cover and post titles:** lowercase via CSS (frontmatter stays normally cased), `text-balance`, 1.1 leading so descenders clear.
- **Fitted post titles:** on desktop beside a hero image, size is `clamp(40px, 84cqi / sqrt(title length), 96px)` against the text column, so any title lands near the image's height.
- **Section heads:** Anton `text-4xl md:text-5xl`, `leading-none`. Card heads `text-3xl`. Inside-this-issue lines `text-xl`. Article h2 34px (28px mobile), h3 1.5em, h4 1.25em.
- **Body:** Literata, mauve-11, `max-w-[65ch]`; bold and headings in mauve-12. Deks are italic `text-lg md:text-2xl`. Editor's letter 15px.
- **Labels:** mono uppercase at weight 500. The home subtitle bar is bold; code stays 400; code-block language labels are 11px with .08em tracking; cover-line meta is 11px.

**The Weight-500 Rule.** System mono has static weights, so 450 renders as 500. Use 500 for labels and match icon strokes to it (1.5 on a 24px grid).

## Layout

- **Container:** `max-w-7xl` (1280px) with `px-4.5 md:px-8` gutters. Below `md` (768px) layouts stack.
- **Rhythm:** sections use `mt-9 md:mt-12` (36/48px); article h2s get 80px above.
- **Home, top to bottom:**
  1. Issue strip (`//// Vol. 09 — Issue 21 — Oct 2026`, nav, theme toggle) over a faint frame line.
  2. Nameplate: "david y." over SOARDS with the framed DYS logo beside it at .85em of the masthead size (cap height). At `lg`+, right-aligned "Inside this issue" cover lines fill the space: the next three titles, each with topic and reading time (230 wpm).
  3. Red subtitle bar (`//// User Experience Engineer` / `Writing on AI, design & the web`) with a 1.5px red line 3px below.
  4. Cover story: 4:5 duotone (4:3 mobile) at 1.1fr; kicker, headline, dek, "Filed under" tags and the editor's letter at 1fr.
  5. "Also in this issue": six stories in three columns with 3:2 duotones, plus the topic filter.
  6. "Back issues": text-only rows of date, title and tag.
- **Section heads** sit under a 4px ink rule.
- **Posts:** brand bar (32px mark, small italic "david y." over SOARDS) above a 1.5px red line, 3px gap and 4px red bar. Header columns are 1.05fr/1fr: the kicker pins to the image's top edge and title, dek and byline to its bottom; the image bottom-aligns when the text runs taller. Then the centered article, the DYS mark, and previous/next links (two columns on desktop, stacked on mobile).
- **Footer:** mono copyright and `//// blog.soards.me`, 32/40px bottom padding.

## Elevation & Depth

Flat. No shadows; spacing and rules separate content.

**The Rules-Not-Boxes Rule.** Structure comes from the nameplate bars, 4px section rules, the faint strip line, the editor's-letter frame, the post double rule, filter outlines, archive hairlines and the previous/next frame. Don't add card boxes.

## Shapes

Square corners for images, frames, bars and filters. Exceptions: inline code (3px), desktop code blocks (6px; square and full-bleed on mobile) and the circular 34px theme toggle.

## Components

Style with Tailwind utilities directly. Prefer standard utilities (numeric spacing, aspect fractions, built-in variants); use arbitrary values only for bespoke measurements. Custom CSS is limited to duotones, pull quotes and Markdown/MDX output (`.prose-c`).

- **Duotone:** grayscale image multiplied over red-9 with a 5px halftone dot screen (screen-blended over mauve-1 and tinted red in dark mode). Reveals the original color on hover or keyboard focus.
- **Kicker:** red-11 `////` followed by a mono label, e.g. `//// Feature / AI`.
- **Topic filter:** All, AI, Design, Front-end, Infra. 1px ink outline; hover inverts to ink; active is red-9 with white bold text. JavaScript filters the homepage; static topic archives work without it.
- **Editor's letter:** 2px ink frame, red label, Anton drop cap in red-9, two text columns at `lg`.
- **Previous/next:** 1px rule frame; hover fills red-9 with white text.
- **Theme toggle:** inline Lucide sun/moon SVGs at stroke 1.5 and 18px, mute, red-11 on hover. Persists to `localStorage`.
- **Article prose:** red-11 semibold links with a half-opacity underline; `//` red list markers; borderless italic blockquotes; pull quotes (`.pq`) in larger italic ink with a red Anton opening quote; code blocks labeled `//// <language>`.
- **Focus:** links and buttons get a 2px red-11 outline at 5px offset. Transitions switch off under reduced motion.
