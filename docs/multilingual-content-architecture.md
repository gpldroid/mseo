# Multilingual Content Architecture (AR, EN, FR, ES, RU)

## Audit status

The current public site is Arabic-first and uses standalone HTML documents, `data/articles.json` as the generated article catalogue, and `scripts/generate-sitemap.mjs` for sitemap output. The inspected catalogue contains 53 article records and no `language`, `locale`, translation-group, or alternate-URL fields. The inspected sitemap has 43 URLs and no `/fr/`, `/es/`, `/en/`, or `/ru/` paths. The expected locale entry points and a representative translated article path were not found, and searches of the default branch did not find `hreflang` declarations. Therefore, translated article coverage and cross-language relationships are **not currently demonstrated under the proposed convention**; this does not prove translations do not exist outside the repository or under other naming conventions.

This is an architecture proposal and audit record, not a claim that translated pages already exist or that the production site has been changed.

## Supported locales

| Locale | Language | HTML language | Direction |
|---|---|---|---|
| `ar` | Arabic (default) | `ar` | `rtl` |
| `en` | English | `en` | `ltr` |
| `fr` | French | `fr` | `ltr` |
| `es` | Spanish | `es` | `ltr` |
| `ru` | Russian | `ru` | `ltr` |

Use the standard locale code `es` for Spanish, not `sp`. If an external requirement explicitly uses `sp`, treat it as an alias only at input boundaries; URLs and SEO metadata should use `es`.

## URL and file layout

Keep existing Arabic URLs stable to avoid breaking backlinks and indexed pages. Put new translations under locale-prefixed paths:

```text
/                         # Existing Arabic homepage
/articles/<slug>.html     # Existing Arabic articles
/en/                      # English homepage
/en/articles/<slug>.html
/fr/
/fr/articles/<slug>.html
/es/
/es/articles/<slug>.html
/ru/
/ru/articles/<slug>.html
/data/articles.json       # Existing Arabic catalogue (preserve compatibility)
/data/i18n/en.json        # English translated article records
/data/i18n/fr.json        # French translated article records
/data/i18n/es.json        # Spanish translated article records
/data/i18n/ru.json        # Russian translated article records
```

Only publish a localized article URL after its content is translated and reviewed. Do not create placeholder or machine-translated pages solely to populate the sitemap.

## Translation identity and catalogue

Every translation must share a stable `translationGroup` identifier with its counterparts. Each localized record should include:

- `translationGroup`: stable cross-language ID (for example, `seo-internal-linking`)
- `locale`: one of `ar`, `en`, `fr`, `es`, `ru`
- `slug` and `file`: unique within its locale
- localized `title`, `description`, `category`, `tags`
- `translationStatus`: `draft`, `review`, or `published`
- `publishedAt` and `updatedAt`

A translation group may be incomplete. Language-switch links must only point to published counterparts; when one is missing, do not fabricate a URL.

## SEO requirements for every published translation

1. Set the root element's `lang` to the exact locale and `dir` to `rtl` only for Arabic; use `ltr` for English, French, Spanish, and Russian.
2. Give each translation a self-referencing canonical URL.
3. Add reciprocal `hreflang` links for every published page in the same translation group, including itself. Add `hreflang="x-default"` only when a deliberate fallback page exists.
4. Localize the document title, meta description, Open Graph title/description/URL, and Twitter title/description.
5. Set Schema.org `inLanguage` to the page locale and ensure Article headline/description match the visible localized content.
6. Include only real, published locale URLs in the sitemap; use a sitemap index or locale-specific sitemap files if the URL count warrants it.
7. Preserve existing Arabic canonical URLs and existing site behavior until the locale rollout has passed validation.

## Implementation order

1. Inventory actual locale directories and article files; compare them against the Arabic catalogue and report counts by locale.
2. Add locale catalogue validation and translation-group consistency checks.
3. Extend catalogue generation and sitemap generation to include published locale records only.
4. Add shared locale navigation and correct relative asset/base paths without changing Arabic defaults.
5. Add reciprocal `hreflang`, canonical, Open Graph, Twitter, and structured-data validation.
6. Translate a small, reviewed pilot set into all four target languages, test it, then expand coverage.
7. Run `npm ci`, `npm test`, and `npm run build`; inspect generated catalogue/sitemap diffs and mobile/desktop rendering before merging.

## Acceptance checklist

- [ ] A report lists the number of actual translated articles for `en`, `fr`, `es`, and `ru`; missing locales are reported as zero, not inferred from filenames.
- [ ] Every published localized article has a stable `translationGroup` and a valid counterpart map.
- [ ] No language switcher points to a missing or unpublished page.
- [ ] Canonical and `hreflang` sets are reciprocal and contain no broken URLs.
- [ ] Every page has correct `lang`, `dir`, localized metadata, and `inLanguage`.
- [ ] Generated sitemap includes only published pages that exist.
- [ ] Existing Arabic URLs and the custom domain configuration remain unchanged.
- [ ] CI checks pass and the live deployment is verified separately.

## Safety boundaries

This work must not modify the `fastseo.site` domain configuration, DNS/CNAME records, Supabase schema/data, or authentication settings. These are outside the scope of the multilingual static-site architecture.
