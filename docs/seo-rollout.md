# SEO rollout

The preferred content address remains https://blog.soards.me/. This branch changes metadata and crawler discovery; it does not move content or change post URLs.

## Cloudflare domain redirects (account access required)

For the `soards.me` zone:

1. Add a proxied A record for `@` pointing to `192.0.2.1` if the apex still has no web record. This is a placeholder for redirect-only traffic: the redirect runs at Cloudflare before an origin request.
2. Under Rules > Redirect Rules, create a Single Redirect named `Root domain to blog`.
3. Match exactly `(http.host eq "soards.me")`. Do not match the entire zone: `blog.soards.me` and `design.soards.me` must keep serving their own sites.
4. Use a dynamic destination expression: `concat("https://blog.soards.me", http.request.uri.path)`.
5. Set status **301** and enable **Preserve query string**.
6. Verify HTTP and HTTPS requests. `/` should reach the blog homepage, and `/posts/switch-from-nginx-to-caddy/?ref=check` should reach the same path and query on the blog, with one redirect and no loop.

The current `davidsoards.com` redirect returns 301, but a tested post URL also redirects to the homepage. If that domain has carried post links, change its existing rule to preserve paths and query strings. Use an exact hostname match for both `davidsoards.com` and `www.davidsoards.com` in that zone. Check existing higher-priority redirects for conflicting rules.

If `davidysoards.com` is recovered, restore redirects from known historical URLs to corresponding current pages. Preserve paths only where old and new paths match; use explicit mappings where they differ. Do not send every old article to the homepage. Keep redirects for at least a year, ideally indefinitely.

Cloudflare reference: https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-another-domain/

## Google Search Console (account access required)

1. Open https://search.google.com/search-console/ and select or create a **Domain property** for `soards.me`. Complete DNS verification if needed; it covers the blog and design subdomains.
2. Inspect `https://blog.soards.me/`. Record whether it is indexed, the last crawl, and the Google-selected canonical. The intended canonical is `https://blog.soards.me/`.
3. If it is not indexed, inspect the reported reason and run **Test live URL** before requesting indexing. If it is indexed but missing for name searches, treat that as a ranking issue rather than an indexing failure.
4. After deployment, submit `https://blog.soards.me/sitemap-index.xml` in Sitemaps. Inspect the homepage and a recent post, confirm the updated metadata is live, and request indexing as appropriate.
5. In Performance > Search results, filter queries for `David Soards`, `David Y Soards`, and `davidysoards`. Check impressions, clicks, and which pages appear. Compare subsequent periods after Google recrawls; immediate ranking changes are not guaranteed.
6. Only if an actual old-domain migration is being restored, verify the old property and evaluate Change of Address after working redirects are in place. Do not submit a move for `design.soards.me`, which remains a separate portfolio.

Google reference: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes

## Profile links

Point the blog link on LinkedIn and other controlled profiles to `https://blog.soards.me/`. Retain portfolio links to `https://design.soards.me/` where appropriate. Use David Soards consistently as the author name. These profile changes require access to the individual accounts.

## Deployment verification

- Homepage title: `David Soards — User Experience Engineer & Developer`.
- Post title: `<article title> | David Soards`.
- Canonical and Open Graph URLs point to the same preferred blog URL.
- Homepage JSON-LD identifies David Soards and the website; posts additionally include BlogPosting, the real publication date, and the modification date only when supplied.
- `/robots.txt` allows ordinary crawling and advertises `/sitemap-index.xml`. Check the live response as Cloudflare may add its own managed robots content.
- Sitemap index and referenced sitemap return XML successfully, and article URLs remain unchanged.

Historical `canonicalLink` frontmatter points to external syndicated copies. This branch keeps the existing self-canonical behavior; deciding which publication should be preferred requires a separate editorial decision.
