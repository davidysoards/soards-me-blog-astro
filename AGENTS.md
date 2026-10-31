# Standing rule

External links in posts must use HTML `<a>` tags with `target="_blank"` and `rel="noopener"`. Preserve existing `rel` values by adding `noopener` where needed. Leave internal links unchanged. Do not rewrite existing posts during this setup.

## Blog prose

Before writing or revising post prose, read ai-writing's `../ai-writing/10 Voice/Voice Guide.md`, relevant entries in `../ai-writing/10 Voice/Evidence Log.md`, and `../ai-writing/10 Voice/Avoid.md`. Apply `../ai-writing/.agents/skills/prose-cleanup/SKILL.md` before presenting changes. The author's latest instructions take precedence over earlier drafting briefs. Preserve edited prose outside the requested changes.

## Post URLs

For new posts, use the full title word for word as the URL slug, lowercased with hyphens between words. Do not shorten it to a working title or topic label. Leave published URLs unchanged unless the author requests a migration.

## Local preview on the Mac mini

- Run the Astro dev server **outside the Codex sandbox** (`sandbox_permissions: "require_escalated"`). Sandboxed servers have repeatedly served stale markup because macOS file-change events did not reach the watcher.
- Start with `ASTRO_DEV_BACKGROUND=0 pnpm dev` so Astro stays in the foreground. The existing dev script exposes port 4321 for Tailscale access from the MacBook.
- Keep long-lived previews in the persistent `screen` session `soards-blog-preview` on the Mini, with Astro running in the foreground inside it. Check `screen -ls` and port 4321 before starting another server; temporary tool sessions have repeatedly disappeared. The current session logs to `/private/tmp/soards-blog-preview.log`.
- Both the user and Codex edit files. Preserve the user's edits and keep hot reload working for both.
- If the preview is stale, stop the existing server once and relaunch outside the sandbox. Do not repeatedly poll or restart a sandboxed server. Verify one saved file change is detected.
