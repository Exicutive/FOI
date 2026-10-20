# Search Console launch checklist

## Included in this site

- Canonical URLs use `https://www.foidevs.com/`. The production redirects have been checked: the non-www and HTTP variants resolve to the preferred HTTPS www origin.
- Public pages carry unique titles, descriptions, crawl directives, canonical links, Open Graph metadata, and Twitter card metadata.
- The detail URLs for every listed property and development service are pre-rendered with route-specific metadata and JSON-LD. This gives crawlers and social platforms meaningful HTML without relying on JavaScript.
- The site supplies valid `Organization`, `WebSite`, `WebPage`, and `BreadcrumbList` structured data based on the business details already published on the site. It does not claim ratings, reviews, availability, or unsupported real-estate listing markup.
- The production build generates `/sitemap.xml` from the public listing links. It omits unreliable `lastmod` values rather than inventing dates.
- `/robots.txt` permits public content, blocks implementation-only directories, and names the sitemap. CSS, JavaScript, and images remain crawlable.

## Verify FOI Developments in Google Search Console

These steps require control of the domain. This project cannot verify the property, submit the sitemap, or guarantee indexing on your behalf.

1. Go to [Google Search Console](https://search.google.com/search-console/) while signed in to the Google account that should manage FOI Developments.
2. Choose **Add property** and select **Domain**. Enter `foidevs.com` (without `https://` or `www`). A Domain property covers both www and non-www variants and is the recommended choice.
3. Google will show a DNS TXT record. Copy it exactly, add it to the DNS provider for `foidevs.com` (for example, Cloudflare or your domain registrar), then return to Search Console and select **Verify**. DNS changes can take a little time to appear.
4. After verification, open **Sitemaps**, enter `sitemap.xml`, and select **Submit**. It should resolve to `https://www.foidevs.com/sitemap.xml`.
5. Use **URL inspection** for the home page, `/properties`, `/development`, and an active detail URL such as `/property/tmlse`. Request indexing only for the canonical public URL after you have reviewed the rendered page.

If DNS access is unavailable, create a URL-prefix property for `https://www.foidevs.com/` instead and use the specific verification method Google offers. It verifies only that exact URL prefix, so the Domain property is preferable when possible.

## Post-launch checks

- Confirm the submitted sitemap shows no fetch or parsing errors.
- Check **Page indexing** periodically for excluded or duplicate URLs. Do not expect immediate inclusion: Google decides when and whether to crawl and index pages.
- Keep internal links to active properties and development services on the homepage, properties, and development pages so crawlers can discover detail pages.
- Update titles, descriptions, images, and visible page content together when a property becomes unavailable or changes materially.
- Use Google’s Rich Results Test to validate the visible structured data. Structured data does not guarantee a rich result or a ranking improvement.

The direct `http://foidevs.com` route currently makes one additional redirect before reaching the canonical origin. It still resolves correctly; a DNS/edge redirect rule can later make that legacy path a single hop if desired.
