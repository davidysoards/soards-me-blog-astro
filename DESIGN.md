---
name: blog.soards.me
description: A readable 90s music-magazine design built on Radix red and mauve.
colors:
  paper: "var(--mauve-1)"
  ink: "var(--mauve-12)"
  muted: "var(--mauve-11)"
  rule: "var(--mauve-6)"
  accent: "var(--red-9)"
  accent-text: "light-dark(var(--red-11), var(--red-10))"
  control-background: "var(--red-9)"
  control-foreground: "white"
  code-background: "var(--mauve-2)"
  code-foreground: "var(--mauve-12)"
  frame: "color-mix(in oklab, var(--mauve-12) 22%, transparent)"
typography:
  masthead:
    fontFamily: "var(--font-anton)"
    fontSize: "clamp(64px, 9vw, 124px)"
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: "0"
  title:
    fontFamily: "var(--font-anton)"
    fontSize: "clamp(46px, 6.4vw, 84px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
  body:
    fontFamily: "var(--font-literata)"
    fontSize: "20px desktop / 18px mobile"
    fontWeight: 400
    lineHeight: 1.625
  metadata:
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
    fontSize: "12px"
    letterSpacing: ".05em"
rounded:
  inline-code: "3px"
  code-block: "6px"
  theme-toggle: "50%"
spacing:
  gutter: "32px"
  gutter-mobile: "18px"
  section: "48px"
  section-mobile: "36px"
  article-section: "80px"
components:
  topic-active:
    backgroundColor: "{colors.control-background}"
    textColor: "{colors.control-foreground}"
  previous-next-hover:
    backgroundColor: "{colors.control-background}"
    textColor: "{colors.control-foreground}"
---

# blog.soards.me

## Overview

A loud 90s music-magazine frame around calm, readable articles. Anton gives the masthead and headlines their condensed character; Literata carries the reading column. Red duotone imagery and small mono labels provide the editorial accents.

The existing Radix color system is the foundation. Mockups guide composition and visual hierarchy; their standalone CSS is not production configuration.

## Colors

`src/styles/tailwind.css` imports Radix red, red-dark, mauve, and mauve-dark. The `.dark` class on `<html>` switches those scales automatically, including Radix's display-P3 values. Do not replace this with a separate hex palette or manual dark-color overrides.

The native Tailwind `@theme inline` configuration preserves the complete existing palette API:

- `accent-1` through `accent-12` map directly to `--red-1` through `--red-12`.
- `gray-1` through `gray-12` map directly to `--mauve-1` through `--mauve-12`.
- These are public palette scales. Do not prune steps because a current component does not use them.

Semantic utility colors reference the same Radix scales:

- `paper`: mauve-1; `ink`: mauve-12; `mute`: mauve-11.
- `rule`: mauve-6; `frame`: 22% mauve-12 on transparency.
- `accent`: red-9 for display accents and duotones; `accent-text`: red-11 in light mode and red-10 in dark mode for readable red text.
- Selected filters use `bg-accent` (red-9) with white text in light mode and black text in dark mode. Previous/next hover states use `bg-accent` with `text-white`. Red-11 is a text color and becomes pale in dark mode; do not use it for solid control backgrounds. Text selection uses red-11 with red-1.
- `code` and `code-fg`: mauve-2 and mauve-12 for inline code and unhighlighted blocks.

Shiki owns highlighted code's existing github-dark canvas and syntax colors. Highlighted blocks carry Radix's `dark-theme` class, so language labels use dark red-11 in both page themes. Duotone canvas and halftone dots also use the Radix mauve scale.

## Typography

Astro's local Fonts API in `astro.config.mjs` manages the existing woff2 files in `src/assets/fonts/`. Keep the accompanying font licenses. Tailwind's `font-display` and `font-serif` utilities reference Astro's generated font variables.

Anton uses weight 400. Headings are lowercase via CSS; frontmatter remains normally cased. SOARDS uses `uppercase` explicitly. Display headings use `tracking-normal`. Multiline Anton titles need at least 1.1 leading to clear descenders.

Literata is variable 400–700, with a separate italic 400 face. Articles use `text-lg md:text-xl leading-relaxed`: 18px on mobile and 20px on desktop, with 1.625 line height. Article text uses mauve-11; bold text and headings use mauve-12 for stronger emphasis. The body column uses `max-w-[65ch]`. Metadata uses uppercase `text-xs tracking-wider` (12px, .05em tracking); the editor's-letter label is also 12px. Section headings use `text-4xl md:text-5xl`, card headings `text-3xl`, and deks `text-lg md:text-2xl`. The three fluid size tokens remain for the masthead, post title and cover headline. Display and card leading use `leading-[1.1]`, the masthead uses `leading-[.8]`, and single-line section labels use `leading-none`. Tailwind's default `leading-tight` is not overridden.

Both font families use `font-display: block` to avoid the visible fallback switch during typical cold loads. A stalled font can still fall back after the browser's blocking period. `BaseHead.astro` preloads Anton and roman Literata, plus italic Literata on post pages. Astro generates optimized Arial and Times New Roman fallbacks; do not maintain manual fallback metrics.

## Layout

The page wrapper uses `max-w-7xl` (80rem / 1280px maximum), including 32px horizontal gutters. Below Tailwind’s `md` breakpoint (48rem / 768px), gutters become 18px and the main layouts stack. Gutters use `px-4.5 md:px-8`; section spacing uses `pt-9 md:pt-12` or `mb-9 md:mb-12`. The masthead logo uses `size-14 md:size-20 lg:size-24`.

Home: issue strip, uppercase masthead and framed DS logo, editor's letter, split cover story, six recent stories in three columns, topic filter, then text-only back issues. The letter uses two text columns on desktop and one on mobile, with a 26px top margin.

Posts: compact brand bar, a 2px faint line, 3px gap and 4px red bar; title and hero columns at 1.05fr/1fr; then the centered article. Previous/next links form two columns on desktop and stack on mobile. Article h2 sections open with 80px of space above them. Long code scrolls within its block; mobile code blocks reach the page gutters.

## Elevation & Depth

Flat surfaces with no component shadows. Spacing separates sections. Keep the faint editor's-letter frame, inner-page double rule, filter outlines, archive hairlines, and previous/next frame. Avoid adding section rules or card boxes.

## Shapes

Images and editorial frames have square corners. Inline code uses 3px corners, desktop code blocks 6px, and the 34px theme button is circular. Mobile code blocks have square corners.

## Components

Use Tailwind utilities directly for layout, typography, spacing, responsive behavior and interaction states. Prefer standard utilities such as `uppercase`, numeric spacing, aspect fractions and built-in variants. Reserve arbitrary values for bespoke measurements with no exact equivalent.

Custom component CSS is limited to duotone compositing, pull quotes and HTML emitted by Markdown/MDX. The duotone reveals original image colors on hover or keyboard focus. Pull quotes are borderless italic text with a red opening quote.

The five topic links are All, AI, Design, Front-end and Infra. JavaScript filters the homepage; static topic archives provide the fallback without JavaScript. Preserve tag archives, post URLs, RSS and the persistent theme toggle.

## Do's and Don'ts

- Keep the full Radix palette mappings and let Radix handle light/dark colors.
- Define useful static values directly in Tailwind's native `@theme`; use `@theme inline` to reference Radix and Astro variables.
- Do not copy mockup hex colors or add a second alias layer such as `--fs-*`, `--lh-*`, `--paper` or `--ink`.
- Keep keyboard focus, readable contrast and reduced-motion behavior.
- Preserve content, frontmatter, existing dependencies, icon packages and the Shiki theme.
- Keep internal links intact. New external links in posts use HTML anchors with `target="_blank"` and `rel="noopener"`; do not bulk-rewrite old posts as part of a reskin.
