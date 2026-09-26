---
name: blog-image
description: Create a hero image from an attached or referenced Markdown blog post, with prompt and image approval before web export.
---

# Blog image

Read the supplied post and propose a distinctive image prompt grounded in its subject and tone. Ask for a 12:7 aspect ratio in the prompt, ideally at 1536 × 896 pixels when the image generator supports that size. Keep the main visual away from the edges so it reads well as a small thumbnail. Briefly explain the concept. Wait for explicit approval of the prompt before generating. If the user requests changes, revise the prompt and wait for approval again.

Generate and display the image. Wait for explicit image approval before optimizing. If the user requests image revisions, show each revision and repeat image approval.

After approval, run `node .agents/skills/blog-image/scripts/optimize.mjs <original> <output.jpg>`. Keep the original outside `public/` unless the user wants it there. Use a new output name under `public/img/`; the script refuses to overwrite an existing file. Show the optimized image and report its dimensions, file size, and location. The script preserves the composition and fits it within 1536 × 896 without cropping. Review the result visually; around 100–150 KB is a practical target for this style, not a hard limit. Obtain approval before any crop.

Post frontmatter uses the image filename only, for example `heroImage: filename.jpg`. Whether hero images remain part of the future redesign is unresolved. Adding `heroImage` to a post, checking the rendered page, and publishing are separate follow-up work. Keep external-link editing separate from this image workflow.
