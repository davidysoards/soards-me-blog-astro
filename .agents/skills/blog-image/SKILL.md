---
name: blog-image
description: Create and optimize a hero image for a Markdown blog post, with prompt and image approval before adding it to the site.
---

# Blog image

Read the supplied post and propose a distinctive image prompt grounded in its subject and tone. Ask for a 12:7 aspect ratio in the prompt, ideally at 1536 × 896 pixels when the image generator supports that size. Keep the main visual away from the edges so it reads well as a small thumbnail. Briefly explain the concept. Wait for explicit approval of the prompt before generating. If the user requests changes, revise the prompt and wait for approval again.

Consider how the hero will look in both light and dark site themes when proposing the concept. Suggest a transparent background when it would help abstract art, illustrations, or cutouts blend with either theme; an opaque background may better suit the composition, mood, or user preference. Do not treat transparency as a requirement. When transparency is chosen, request real alpha transparency through the image generator, not a painted checkerboard or solid color. Keep empty spaces inside loops and between objects transparent, preserve opaque subject details, and leave generous margins. Consider stroke values, restrained highlights, and subtle edges that keep the subject readable against both light and dark backgrounds without broad halos.

Generate and display the image. Inspect it against both light and dark backgrounds before asking for image approval, including edge quality and any translucent details. Wait for explicit image approval before optimizing. If the user requests image revisions, show each revision and repeat image approval.

After image approval, use `node .agents/skills/blog-image/scripts/optimize.mjs <original> <new-output.jpg|.png|.webp> [--lossless] [--palette] [--quality 1-100]` to make candidates in a temporary directory. `--lossless` applies to WebP, `--palette` to PNG, and `--quality` to lossy JPEG or WebP. The script fits each candidate within 1536 × 896 without cropping. Obtain approval before any crop.

- For photos, compare JPEG and lossy WebP. For sharp flat graphics, compare PNG (including palette PNG when colors are few) and lossless WebP; consider lossy WebP when its edges remain clean. For transparent art, compare PNG and WebP. The script rejects transparent JPEG output.
- Compare file sizes at the same dimensions and inspect candidates at article and thumbnail sizes. Check palette output for color changes. For transparent output, verify actual alpha values and inspect edges, shadows, and translucent details on both light and dark backgrounds at article and thumbnail sizes. Choose the smallest visually acceptable file, including the original if it already fits and is smaller. Honor a requested format; prefer a familiar format when savings are negligible.

Keep the original outside `public/` unless the user wants it there. Write the selected format to a new filename under `public/img/`; the script refuses to overwrite an existing file. Show the optimized image and report its dimensions, file size, and location. If the request includes adding the hero to a post in this repo, set `heroImage` in its frontmatter to that filename, build the site, and check the rendered page and listing thumbnail in both light and dark mode. Inspect the existing image-container background styles: a transparent asset may still sit on a theme-colored surface, so verify the actual rendered result. Show the page preview before pushing when the user requests it. Publishing remains separate unless requested. Keep external-link editing separate from this image workflow.
