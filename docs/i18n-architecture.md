# Multilingual Content Architecture (ar, fr, es, en, ru)

## Audit baseline

The current default-branch audit found 53 records in `data/articles.json`, but the records have no `language`, `locale`, translation-group, or alternate-URL fields. The sitemap has no `/fr/`, `/es/`, `/en/`, or `/ru/` URLs. The expected locale entry points (`fr/index.html`, `es/index.html`, `en/index.html`, `ru/index.html`) and a representative translated article path were not found. This means translated article coverage is **not currently demonstrated by the repository**; it does not prove that no translations exist outside these conventions or outside the repository.

## URL and directory convention

Keep Arabic as the default at the existing root URLs to avoid breaking current links. Add each additional language under a dedicated locale prefix:

```text
/
  index.html                    # Arabic homepage (existing)
  articles/<slug>.html          # Arabic articles (existing)
  pages/<page>.html             # Arabic utility/category/legal pages (existing)
  fr/
    index.html
    articles/<stable-article-id>.html
    pages/<page>.html
  es/
    index.html
    articles/<stable-article-id>.html
    pages/<page>.html
  en/
    index.html
    articles/<stable-article-id>.html
    pages/<page>.html
  ru/
    index.html
    articles/<stable-article-id>.html
    pages/<page>.html
  data/
    articles.json               # Existing Arabic catalog; retain compatibility
    i18n/
      articles.fr.json
      articles.es.json
      articles.en.json
      articles.ru.json
```

Use stable translation-group IDs across all variants. Article slugs may be localized only if the group ID explicitly maps the variants; do not infer translations from similar titles. Start by retaining the source article slug for simpler mapping and canonical hygiene.

## Metadata contract for every localized article

- Set the document's `lang` attribute to `ar`, `fr`, `es`, `en`, or `ru`; set `dir="rtl"` for Arabic and `dir="ltr"` for the four Latin/Cyrillic locales.
- Provide a self-referencing canonical URL for each language version.
- Emit reciprocal `hreflang` links for only the translations that actually exist, plus `hreflang="x-default"` pointing to the language selector or Arabic default. Never advertise a missing translation.
- Localize title, meta description, H1, Open Graph/Twitter metadata, navigation, breadcrumbs, image alt text, and structured data `inLanguage`.
- Preserve article meaning, citations, code, and product/technical names; translation is not permission to invent claims or update facts.
- Link between equivalent translations with a visible language switcher that retains the article context where a translated counterpart exists.
- Add only existing, canonical locale URLs to the sitemap. Do not publish placeholder or machine-translated thin pages as completed content.

## Data model

Each locale catalog entry should retain the current fields where relevant and add:
- `id`: immutable cross-language article identifier.
- `language`: BCP 47 language tag (`ar`, `fr`, `es`, `en`, `ru`).
- `translationGroup`: shared ID joining all language variants.
- `translationStatus`: `draft`, `review`, or `published`.
- `translatedFrom`: source language, normally `ar`.
- `canonicalPath`: path for this exact localized page.
- `alternates`: map of language tags to paths that exist and are published.
- `reviewedAt`: optional date set only after human review.

Do not change the existing Arabic catalog schema in-place until the generators, admin dashboard, and consumers are migrated and tested. Treat the four locale catalogs as additive first.

## Generation and validation flow

1. Keep article HTML as crawlable static documents; no client-side-only article rendering.
2. Extend catalog generation to read the Arabic catalog and locale catalogs without overwriting manually authored translations.
3. Extend sitemap generation to include only published localized documents and generate `hreflang` from the same translation map.
4. Validate file existence, language/dir metadata, unique canonical URLs, reciprocal alternate links, catalog-to-file parity, and sitemap parity.
5. Add a CI gate only after the first reviewed translations exist. Until then, `npm run audit:i18n` is informational; use `npm run audit:i18n -- --strict` to make missing locales fail in a planned rollout.
6. Release incrementally: one pilot article in all four languages, review SEO/accessibility and layout, then migrate the remaining high-value articles by topic cluster.

## Rollout order

1. Architecture and coverage audit (this phase).
2. Data contract and generator changes with backward-compatible tests.
3. Shared locale navigation and metadata helpers.
4. Pilot translations for 3–5 high-value articles in French, Spanish, English, and Russian.
5. Locale-specific homepage/archive pages, sitemap and reciprocal `hreflang`.
6. Human language review, automated parity checks, and gradual expansion.

## Scope guardrails

This phase must not modify the paid domain, DNS/CNAME, Supabase schema/data, OAuth settings, or existing Arabic article content. It establishes the plan and an audit command only.
