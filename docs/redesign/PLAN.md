# PLAN: implement direction C in `davidysoards/soards-me-blog-astro`

Reference mockups: `home-lower.html`, `post-lower.html` (open locally), and `shots/`. Reference CSS: `site.css`, the single source for the tokens below. Package manager: **pnpm only** (never npm). All work lands on one long-lived branch, `redesign`, cut from `main`. Anything merged to `main` publishes, so **nothing merges to `main` until David merges it himself** when the whole redesign is done. These reference files live in the repo at `docs/redesign/` on that branch.

## Goal / non-goals
- **Goal:** reskin the blog as the "90s magazine, kept readable" design.
  - Homepage: masthead, editor's letter, cover story, "also in this issue" duotone grid, 5-topic filter, back-issues list.
  - Post page: loud header, calm 38rem Literata body.
  - Light and dark mode; the same content and URLs.
- **Non-goals:**
  - No content rewrites, URL changes (`/posts/<slug>/`, `/tags/<tag>/`, `/rss.xml` stay), CMS or framework change.
  - No new runtime dependencies.
  - Old thumbnails stay as they are (regenerating them is a separate task).

## What exists today (read remotely, HEAD)
| Area | File(s) | Notes |
|---|---|---|
| Stack | `package.json` | Astro 7.1, `@tailwindcss/vite` 4.3, mdx, rss, sitemap, sharp. Dev deps: `@radix-ui/colors`, `@egoist/tailwindcss-icons` + `@iconify/json`, prettier-plugin-tailwindcss. Node ≥24.18, pnpm 11. |
| Tailwind | `src/styles/tailwind.css`, `tailwind.config.mjs` | TW4 still loads the legacy JS config via `@config`: `darkMode:'class'`, fonts `cond/sans/serif` (Charter), colors `accent`=Radix red vars, `gray`=Radix mauve vars, icons plugin (lucide, fa6-brands). Base layer styles h1–h6, p, code, pre, blockquote (border-left), img (rounded). |
| Radix | `tailwind.css` | `@import '@radix-ui/colors/{red,red-dark,mauve,mauve-dark}.css'`. The dark files key off `.dark`, which is compatible with the class strategy. |
| Theme | `layouts/BaseLayout.astro` (inline head script), `components/ThemeToggle.astro` | `.dark` on `<html>`, `localStorage.theme`, falls back to `prefers-color-scheme`. Keep as is. |
| Layouts | `layouts/BaseLayout.astro`, `layouts/BlogPostLayout.astro` | BaseLayout = BaseHead + Header + slot + Footer. Post layout: hero `<img src=/img/{heroImage}>`, h1, subtitle, date, tag Badges, `<hr>`. |
| Head | `components/BaseHead.astro` | Imports `tailwind.css`, `/favicon.ico`, OG/Twitter tags, commented-out font preloads. |
| Header / Footer | `components/Header.astro`, `HeaderLink.astro`, `DYSLogo.astro`, `Footer.astro` | Nav "blog" / "design" (https://design.soards.me/), toggle, DS logo, icons. **Real socials:** github.com/davidysoards, twitter.com/ninjasoards (→ x.com/ninjasoards), linkedin.com/in/davidysoards. |
| Home | `pages/index.astro` | Avatar + `SITE_TITLE` + subtitle, then the **tag cloud: all tags as `Badge`s** (`// TODO filter to top 10`), then a `BlogPost` list. |
| Tag cloud / badges | `pages/index.astro`, `components/BlogPost.astro`, `layouts/BlogPostLayout.astro`, `components/Badge.astro`, `pages/tags/_index.astro` (unrouted) | Every place that renders tags. |
| Routes | `pages/posts/[...slug].astro`, `pages/tags/[tag].astro`, `pages/rss.xml.js`, `pages/404.astro` | Slug = `post.id` minus `/index`. |
| Content | `src/content.config.ts` | `posts` glob `**/[^_]*.{md,mdx}`. Schema: `title, subtitle?, description, pubDate, updatedDate?, tags?, canonicalLink?, heroImage?` (filename in `public/img/`). |
| Images | `public/img/*` (heroes, plain `<img>`), `src/content/posts/*/images/*` (relative, Astro-processed), MDX post uses `astro:assets` `Image` | Skill `.agents/skills/blog-image` produces 12:7 heroes into `public/img/`. |
| Code | `astro.config.mjs` | Default Shiki (github-dark); `shikiConfig` is commented out. |
| Misc | `src/unused/*`, `AGENTS.md` (external links in posts: `target="_blank" rel="noopener"`) | |

## Design tokens → Tailwind 4 `@theme`
Drop `@config` and `tailwind.config.mjs`, and move to CSS-first config in `src/styles/tailwind.css`.

```css
@import 'tailwindcss';
@import '@radix-ui/colors/red.css';  @import '@radix-ui/colors/red-dark.css';
@import '@radix-ui/colors/mauve.css'; @import '@radix-ui/colors/mauve-dark.css';
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* color: semantic names, mapped to Radix where one exists */
  --color-paper: #f4f1ec;           /* custom warm paper (dark: #0b0a0b, set below) */
  --color-ink: #111;                /* rules/frames/headlines (dark: #eeeef0) */
  --color-fg: var(--mauve-12);
  --color-mute: var(--mauve-11);
  --color-rule: var(--mauve-6);
  --color-accent: var(--red-9);     /* #e5484d */
  --color-accent-text: var(--red-11);
  --color-code: #ebe7e1;            /* dark: #18161a */
  /* keep the old scales for gradual migration: --color-accent-1..12, --color-gray-1..12 → var(--red-N)/var(--mauve-N) */

  --font-display: "Anton", "Helvetica Neue Condensed", "Arial Narrow", Impact, sans-serif;
  --font-serif: "Literata", Charter, "Bitstream Charter", Cambria, Georgia, serif;
  --font-sans: "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --text-masthead: clamp(64px, 9vw, 124px);
  --text-post-title: clamp(46px, 6.4vw, 84px);
  --text-cover: clamp(40px, 4.6vw, 58px);
  --text-section: 44px;  --text-h2: 34px;  --text-card: 28px;  --text-pn: 30px;
  --text-dek: 21px;  --text-body: 18px;  --text-mono: 12px;  --text-label: 11px;

  --leading-masthead: .8;  --leading-tight: .9;  --leading-one-line: 1.05;
  --leading-display: 1.1;  --leading-card: 1.14;  --leading-h2: 1.15;  --leading-body: 1.7;

  --tracking-display: .004em;  --tracking-mono: .04em;
  --container-page: 1240px;  --container-measure: 38rem;   /* max-w-measure */
}
.dark { --color-paper: #0b0a0b; --color-ink: #eeeef0; --color-code: #18161a; }   /* fg/mute/rule/red follow the Radix dark vars */
@media (max-width: 860px) { :root { --text-section: 34px; --text-h2: 28px; --text-dek: 18px; --text-body: 17px; } }
:root { --masthead-case: uppercase; }   /* nameplate toggle */
```
- **Mapping rule:** a component class in `site.css` becomes Tailwind utilities where they read well. The few compound pieces become small `@layer components` classes in `tailwind.css`: `.duo` (duotone + halftone), `.prose-c` (post body), `.rule-major`, `.mono`. Don't hand-convert ::before/attr() tricks into arbitrary-value soup.
- **Border system (spacing first):**
  - **Home: no divider rules.** Sections are separated by spacing tokens `--space-mast: 18px` (masthead → letter, plus the masthead's 12px) and `--space-block: 48px` (36px mobile) between letter, cover, "also in this issue" and back issues. The editor's letter is the one framed block (L4): a 1px `--frame` outline (`color-mix(in oklab, var(--ink) 22%, transparent)`, same % both themes; `@theme` token `--color-frame`), with the label absolutely positioned on the top border (`top:0; translateY(-50%)`) and a `bg-paper` knockout.
  - **One double rule** `.rule-major`, only under the inner-page top bar: a 2px line in `--color-frame` (22% ink, shared with the letter box), a 3px gap, a 4px red bar (`--rule-major-line: 2px; --rule-gap: 3px; --rule-bar: 4px;`). It's a ~4-line component class (border-top + bottom-aligned gradient bar).
  - **1px lines only where they do a job:** the letter frame, back-issue row hairlines (`--hairline`, `--color-rule`), the prev/next box frame, and the filter chips' ink outline. No rule under the post header, above h2s (use `mt-20`/80px instead), around images, or on the footer.
- **Lowercase headings:** apply via CSS (`lowercase` utility on display headings). Keep titles properly cased in frontmatter so `<title>`, OG and RSS stay normal case. The mockups hard-coded lowercase strings; production should not.

## Fonts
- Commit to `public/fonts/`:
  - `Anton-Regular.woff2` (18,612 B)
  - `Literata-400-700.woff2` (36,804 B, variable 400–700)
  - `Literata-Italic-400.woff2` (21,324 B)
  - `OFL-Anton.txt`, `OFL-Literata.txt`

  Take them from `fonts/` in this folder.
- Add `scripts/trim-fonts.py` (copy from this folder). It documents the fontTools instancer steps: regular `{"wght": (400, 700)}`, italic `{"wght": 400}`, plus the Fontsource latin source URLs. It's a dev-only tool (`pip install fonttools brotli`); no Node dependency. (A rerun with a newer fontTools/brotli gave byte-different but equivalent output: 36,784 / 21,352 B.)
- `@font-face` goes in `tailwind.css` with `font-display: swap`, and the regular has `font-weight: 400 700`.
- In `BaseHead.astro`: `<link rel="preload" href="/fonts/Literata-400-700.woff2" as="font" type="font/woff2" crossorigin>` (Literata only). Anton isn't preloaded; it's small, and the headings fall back to condensed system fonts.
- To reduce CLS, add a fallback `@font-face` with `size-adjust` for Literata→Georgia, but only if Lighthouse shows any shift.

## Components (new = ★)
| Piece | Path | Notes |
|---|---|---|
| Top strip | `components/Header.astro` (rewrite) | Mono row: `//// Vol · Issue · Mon YYYY` (home) or the ★`DYSMark` + `SOARDS` brand (inner pages). Nav: writing, case studies → design.soards.me, GitHub / X / LinkedIn / RSS as text links, theme toggle. No border on home; a `.rule-major` on inner pages (the only double rule). |
| Masthead | ★`components/Masthead.astro` (home only) | `SOARDS` in display caps (`--masthead-case`), size `clamp(64px,9vw,124px)`, framed `DYSLogo` box `clamp(54px,8vw,100px)`; no rule below, `--space-mast` to the letter. |
| Logos | `components/DYSLogo.astro` (keep), ★`components/DYSMark.astro` | Mark = `img/dys-small.svg` inlined, `fill=currentColor`. Used in the top bar, footer and post end mark. |
| Editor's letter | ★`components/EditorsLetter.astro` | L4 box: 1px `border-frame` outline, label (red + mono sublabel) on the top border with a `bg-paper` knockout; 2-column text with a red Anton drop cap; one column on mobile. Copy lives in `src/consts.ts` (`EDITORS_LETTER`). |
| Cover story | ★`components/CoverStory.astro` | Latest post (or one pinned with `cover: true`): duotone hero 16:10, mono kicker, `--text-cover` title with the last 2 words in red, `description` as dek, tags in mono. |
| Duotone image | ★`components/Duotone.astro` + `.duo` in CSS | Red multiply plus halftone dots (black-red screen in dark); hover shows the original color. CSS only. |
| Also in this issue | ★`components/IssueGrid.astro` | The next 6 posts in a 3-column (1 on mobile) card grid. |
| Topic filter | ★`components/TopicFilter.astro`, ★`src/lib/topics.ts` | Chips All/AI/Design/Front-end/Infra. Each chip is a real link to ★`pages/topics/[topic].astro` (works without JS), with a small inline script that filters the homepage in place. |
| Back issues | ★`components/BackIssues.astro` | Text-only list (YYYY.MM, title, first tag) under an Anton heading + mono label (no rule above), rows split by 1px gray hairlines, red text on hover (no fill) for the remaining posts. Replaces the `BlogPost` cards on home. |
| Tags | `pages/tags/[tag].astro` (restyle as a back-issues list), `Badge.astro` → mono `#tag` links | **Remove the tag cloud** from `index.astro`. Delete `tags/_index.astro` (unrouted) if David agrees. |
| Post header | `layouts/BlogPostLayout.astro` | 2 columns: kicker, `--text-post-title` title (lowercase CSS, last 2 words red), italic dek (`subtitle` ?? `description`), byline, date and #tags in mono, duotone hero 4:3. Stacks on mobile. |
| Post body | `.prose-c` in `tailwind.css` (replaces the base-layer h2/blockquote/pre rules) | 38rem, Literata 18/1.7. h2: Anton, 80px top margin, no rule. Images: no border. Borderless italic indented blockquote. `//` list bullets. Links in red-11. Small-caps lead-in: style the first ~3 words, wrapped by a tiny rehype step or an `<span class="sc">` in content; **ask**, and the default is to skip it in v1. |
| Code | `astro.config.mjs` | `shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false }`, plus CSS that maps `--shiki-light`/`--shiki-dark` under `.dark`. Background is `--color-code`. The label is `pre::before { content: "//// " attr(data-language) }` (Astro's attribute; the mockup used `data-lang`). Code scrolls horizontally; `md`/`text` blocks wrap. |
| Pull quote | ★`components/PullQuote.astro` (MDX) + `.pq` class for raw HTML in `.md` | Large italic with a red Anton opening quote mark, no rules. |
| Prev / next | ★`components/PrevNext.astro` | Computed from the sorted collection in `[...slug].astro`. 2-column box framed by the 1px gray hairline; hover fills red. |
| Footer | `components/Footer.astro` | No rule (matches home; spacing only), mark + "© YYYY David Soards", `//// blog.soards.me`. |
| Favicons | `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png` | From this folder's `img/`; update the `<link>`s in `BaseHead`. |

### Tag → topic mapping (38 real tags)
| Topic | Tags |
|---|---|
| **AI** | ai, claude-code, pi, jev, workflow |
| **Design** | design, ux, figma, fonts, comics, ecommerce |
| **Front-end** | vue, react, css, tailwind, svg, radix, formspree, typescript, nuxt |
| **Infra** | docker, vps, linux, caddy, nginx, postgres, pgvector, mysql, django, python, s3, php, wordpress, acf, netlify, macos, development |
| *(none)* | tip (a format, not a topic; still shown as #tip) |

A post can match several topics. Add an optional frontmatter override, `topics: z.array(z.enum(['ai','design','front-end','infra'])).optional()`, used when present.

## Content changes
- **Schema** (`content.config.ts`), all optional and backward compatible:
  - `topics` (override)
  - `cover: boolean` (pin to the cover slot)
  - `heroAlt: string`
  - `dek`: **not needed**; use `subtitle ?? description`.
- **Placeholders I invented (confirm or replace):**
  - Editor's letter copy ("Front-end engineer and designer, in that order some days…").
  - "Vol. 09 / Issue 21". Proposal: **Issue = total post count**; **Vol = years since the first post** (2017 → 2026 = Vol. 10), or drop Vol. Date = month of the latest post.
  - Kickers like "feature / AI / Pi extension": derive them from topics + first tag.
- **Corrected in the mockups after reading the repo:** X = x.com/ninjasoards, LinkedIn = /in/davidysoards, "case studies" → https://design.soards.me/. Post URLs `/posts/<slug>/` and RSS `/rss.xml` are confirmed.

## Light / dark
Keep the existing mechanism: the inline head script plus `ThemeToggle` toggling `.dark` on `<html>`, stored in `localStorage.theme`. Semantic color tokens switch under `.dark` (above). The Radix dark files already key off `.dark`. Use `@custom-variant dark` for the rare `dark:` utilities (e.g. the duotone blend mode). Restyle the toggle as a 34px round icon button with inline SVG sun/moon. That lets us **remove `@egoist/tailwindcss-icons` + `@iconify/json`** (the new design uses text social links), a big dev-dependency cut.

## Workflow
- One branch, `redesign`, off `main`. Each phase is one or more commits pushed directly to `redesign`; no per-phase branches or PRs. Optionally one draft PR `redesign` → `main` for reviewing the whole diff; it is never merged by an agent.
- A Cursor cloud agent does each phase's heavy lifting and pushes to `redesign`. David then pulls `redesign` locally (Cursor on the Mac mini, `pnpm dev`), checks it and makes small visual tweaks himself, and pushes back to `redesign`.
- Never both at once: an agent run starts only after David's latest push, and every agent run starts by pulling the tip of `redesign` and keeps David's edits.
- Phase names below are commit/checkpoint labels, not branch names.

## Phases (all on `redesign`; no merge or deploy without David)
1. **Phase 1 (foundation): tokens, fonts, Tailwind 4 CSS-first.**
   - Scope: replace `@config` with `@theme` tokens, `@font-face` + preload, favicons, `.dark` overrides, remove the icons plugin (swap the existing icons for inline SVG), Shiki dual theme. Existing pages keep their layout but pick up the new fonts and colors.
   - Files: `src/styles/tailwind.css`, `tailwind.config.mjs` (delete), `astro.config.mjs`, `components/BaseHead.astro`, `Header.astro`/`Footer.astro`/`ThemeToggle.astro` (icons only), `public/fonts/*`, `public/favicon*`, `scripts/trim-fonts.py`, `package.json` + `pnpm-lock.yaml`.
   - Accept:
     - `pnpm install && pnpm build` (astro check + build) passes.
     - Both themes work, with no flash.
     - Lighthouse: CLS ≤ 0.02, and fonts load from `/fonts`.
2. **Phase 2 (chrome): header, masthead, footer, logos.**
   - Scope: top strip, Masthead (home), compact brand bar (inner pages), DYSMark, Footer.
   - Files: `components/Header.astro`, ★`Masthead.astro`, ★`DYSMark.astro`, `Footer.astro`, `HeaderLink.astro`, `layouts/BaseLayout.astro`.
   - Accept:
     - Build passes.
     - Matches `shots/home-lower-fold-*` (strip + masthead) and `post-lower-fold-*` (brand bar) at 1280 and 390, light and dark.
     - The masthead toggle works by changing `--masthead-case`.
3. **Phase 3 (home): homepage.**
   - Scope: EditorsLetter, CoverStory, Duotone, IssueGrid, TopicFilter + `lib/topics.ts` + `pages/topics/[topic].astro`, BackIssues; remove the tag cloud; restyle `tags/[tag].astro`; schema additions.
   - Files: `pages/index.astro`, ★components above, `pages/tags/[tag].astro`, `components/Badge.astro`, `components/BlogPost.astro` (retire or reuse), `src/content.config.ts`, `src/consts.ts`.
   - Accept:
     - Build passes.
     - Matches `home-lower` fold, full and mobile shots, light and dark.
     - The filter works with JS and without it (topic links).
     - Every existing `/tags/<tag>/` URL still builds.
4. **Phase 4 (post): post page.**
   - Scope: post header, `.prose-c` typography, code styling, PullQuote, PrevNext, end mark, tags as mono links.
   - Files: `layouts/BlogPostLayout.astro`, `pages/posts/[...slug].astro`, ★`PullQuote.astro`, ★`PrevNext.astro`, `tailwind.css`.
   - Accept:
     - Build passes.
     - Matches `post-lower` fold, body and mobile shots.
     - Body measure is ~65–75 characters per line.
     - Code scrolls horizontally in both themes.
     - Spot-check 3 older posts (an MDX one, one image-heavy, one code-heavy).
5. **Phase 5 (polish): 404, a11y, performance, cleanup.**
   - Scope: 404 in the new style, focus states, contrast check (red-11 on paper), `prefers-reduced-motion`, Lighthouse pass, remove dead CSS/components, and `src/unused` and `tags/_index.astro` if approved.
   - Accept:
     - Lighthouse ≥ 95 performance/accessibility on home and a post.
     - No visual diff vs phases 3–4 other than intended fixes.

## Open questions for David
1. Masthead nameplate: uppercase **SOARDS** (recommended) or lowercase **soards**?
2. Editor's letter copy, and keep or drop the "Vol./Issue" label (issue = post count?).
3. Approve the tag→topic mapping (especially workflow → AI, nuxt → Front-end, wordpress/acf → Infra, tip → no topic).
4. "Case studies" link: keep pointing to design.soards.me until it's retired?
5. OK to delete `src/unused/`, `pages/tags/_index.astro`, and the icon dev deps?
