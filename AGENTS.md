# Standing rule

External links in posts must use HTML `<a>` tags with `target="_blank"` and `rel="noopener"`. Preserve existing `rel` values by adding `noopener` where needed. Leave internal links unchanged. Do not rewrite existing posts during this setup.

## Local preview on the Mac mini

- Run the Astro dev server **outside the Codex sandbox** (`sandbox_permissions: "require_escalated"`). Sandboxed servers have repeatedly served stale markup because macOS file-change events did not reach the watcher.
- Start with `ASTRO_DEV_BACKGROUND=0 pnpm dev` so Astro stays in the foreground. The existing dev script exposes port 4321 for Tailscale access from the MacBook.
- Both the user and Codex edit files. Preserve the user's edits and keep hot reload working for both.
- If the preview is stale, stop the existing server once and relaunch outside the sandbox. Do not repeatedly poll or restart a sandboxed server. Verify one saved file change is detected.
