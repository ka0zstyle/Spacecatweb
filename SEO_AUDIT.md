# SEO Audit — SpaceCatWeb

## Executive Summary

**Overall Health:** ⚠️ Fair — the site exists and loads but has critical SEO gaps that block proper crawling, indexation, and international targeting.

### Top Priority Issues
1. **No robots.txt or sitemap.xml** — crawlers have no guidance
2. **No canonical tags** — duplicate content between `/?lang=es` and `/?lang=en`
3. **No hreflang tags** — bilingual site with no language targeting signals
4. **Static metadata** — English page gets Spanish metadata
5. **Hardcoded `<html lang="es">`** — wrong lang attribute on English view

---

## Technical SEO Findings

### Crawlability & Indexation

| Issue | Impact | Fix |
|-------|--------|-----|
| No `robots.txt` | **High** — crawlers lack crawl budget guidance | Add `app/robots.ts` |
| No `sitemap.xml` | **High** — pages may not be discovered | Add `app/sitemap.ts` |
| No canonical tags | **High** — param-based locale pages risk duplication | Add `<link rel="canonical">` per locale |
| No hreflang | **High** — Google can't serve correct language variant | Add hreflang via `generateMetadata` |
| `/?lang=en` URL params | **Medium** — not recommended vs `/en/` subdirectories | See URL structure note below |

### Site Speed & Core Web Vitals

| Issue | Impact | Fix |
|-------|--------|-----|
| Google Fonts loads Playfair Display | **Low** — unused font, extra 200ms+ load | Remove from font request |
| No CDN | **Low** — Vercel edge network acts as CDN | Already served via Vercel |
| Video background (space.mp4) | **Medium** — large asset, impacts LCP | Keep as-is (progressive enhancement) |

### Mobile-Friendliness

| Issue | Impact | Fix |
|-------|--------|-----|
| Touch targets ≥44px | ✅ Fixed in Fase 3 | Already done |
| Responsive design | ✅ Tailwind responsive classes | Already done |

### International SEO

| Issue | Impact | Fix |
|-------|--------|-----|
| No hreflang annotations | **High** — ES/EN not connected | Add via `generateMetadata` |
| `<html lang="es">` hardcoded | **High** — wrong on `/en/` | Dynamic via metadata |
| `?lang=en` URL params | **Medium** — Google prefers `/en/` | Keep for now; document as tech debt |
| No `x-default` hreflang | **High** — no fallback for unspecified locales | Add with `generateMetadata` |

### URL Structure Note
Current `/?lang=en` is functional but not optimal. Google treats URL parameters as potential content variants, not as separate locale pages. **Recommended:** migrate to subdirectory structure (`/en/`, `/es/`). Requires route refactor.

### On-Page SEO

| Issue | Impact | Fix |
|-------|--------|-----|
| Single page for all content | **Medium** — blog posts not individually indexable | Acceptable for single-page agency site |
| Static metadata (ES only) | **High** — EN visitors see ES meta in SERPs | Dynamic per locale |
| No OpenGraph image | **Medium** — poor social share cards | Add `og:image` |
| No JSON-LD schema | **Medium** — missing rich results potential (LocalBusiness) | Add `WebSite` + `Organization` schema |

### Content Quality

| Issue | Impact | Fix |
|-------|--------|-----|
| Blog content hardcoded | **Low** — not dynamically generated, but visible on page | Acceptable for MVP |
| No individual blog URLs | **Medium** — blog not independently indexable | Document as future enhancement |

---

## Prioritized Action Plan

### 1. Critical (blocking indexation/ranking)
- [x] Add `robots.ts`
- [x] Add `sitemap.ts`
- [x] Add canonical tags per locale
- [x] Add hreflang annotations
- [x] Fix `<html lang>` dynamic
- [x] Dynamic metadata per locale

### 2. High-impact improvements
- [x] Add `og:image` for social sharing
- [x] Add JSON-LD schema (WebSite + Organization)

### 3. Quick wins
- [x] Remove unused Playfair Display font
- [x] Remove keywords meta tag
- [ ] ~~Migrate `?lang=` to `/en/` subdirectory~~ (deferred — requires route refactor)

### 4. Long-term
- [ ] Add individual blog post pages with `/blog/[slug]` routes
- [ ] Implement subdirectory locale structure
- [ ] Set up Google Search Console + Bing Webmaster Tools
