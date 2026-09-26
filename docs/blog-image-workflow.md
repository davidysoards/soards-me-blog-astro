# Blog image workflow (redesign note)

The post schema makes `heroImage` optional, and the post list omits the thumbnail when it is absent. During the blog redesign, decide whether hero images still belong in the design.

## Current asset convention

- Final images live in `public/img/`; post frontmatter uses `heroImage: filename.jpg`.
- Existing hero assets are 1536 x 896 pixels (12:7). The desktop list displays them at 192 x 112 pixels, the same ratio.
- For the pi-jev-gate post, the generated image was about 1.4 MB. Exporting it through Photoshop and ImageOptim produced `public/img/jev-gate.jpg` at 109 KB.

## Possible Codex workflow

1. Prompt Codex to generate a blog image from the post, with the subject centered for the thumbnail. Review the image before adding it to the site. GPT can do the creative step too, but Codex can generate the asset directly in the project workflow.
2. Use a local script with the existing `sharp` dependency to export a 1536 x 896 JPEG. Preserve the 12:7 composition; crop only after review. Choose JPEG quality by visual inspection and a practical file-size target (around 100-150 KB for this style), rather than treating a byte limit as more important than the image.
3. Save the final file under `public/img/`, add `heroImage` to the post, and run the Astro build. Check the article and desktop listing, including the image request and thumbnail crop.
4. Publish only after reviewing the rendered page. Keep the generated original outside `public/` unless it is useful as a source asset.

If hero images remain part of the redesign, package these conventions and the export script in a repo-local skill under `.agents/skills/`. The skill should handle generation, review, conversion, metadata, and verification as one workflow; image compression itself should be deterministic code.
