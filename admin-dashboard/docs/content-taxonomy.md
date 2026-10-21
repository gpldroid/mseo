# Content taxonomy: keywords, semantic terms, and type-specific categories

## Editorial fields

- **SEO keywords** (`seo_keywords`): target search phrases.
- **Semantic keywords** (`semantic_keywords`): synonyms, related entities, alternate wording, and supporting search concepts. They are not merged into the target keyword list.
- **Categories** (`categories`): the editorial topics attached to a post.
- **Tags** (`tags`): narrower subjects, technologies, tools, or named entities.
- **Content type** (`content_type`): the top-level distinction between an article and a page.
- **Post subtype** (`post_type`): constrained to values suitable for the selected top-level type.

The current static publishing workflow stores categories, tags, and SEO keywords as arrays on `mseo_content_items`. This change preserves those columns for backward compatibility and adds `semantic_keywords text[]` and `post_type text`. GIN indexes support array lookups without changing existing article URLs or the publisher's legacy data contract.

## Supported subtypes

| Top-level type | Subtypes |
| --- | --- |
| Article | General article, guide, tutorial, news, review |
| Page | Landing page, about, service, contact |

The editor resets the subtype to a valid default when the top-level type changes. Lists accept Arabic or English commas and new lines; duplicate terms are removed case-insensitively before saving.

## Migration and rollout

1. Review `supabase/migrations/20261018000100_content_taxonomy_by_type.sql`.
2. Confirm the connected Supabase database is the one used by the dashboard and that `public.mseo_content_items` is present.
3. Apply the migration through the project's normal migration workflow. The migration is not run automatically by the browser app.
4. Deploy the dashboard build and verify create/edit flows for both articles and pages.
5. Verify the publishing function reads `semantic_keywords` if semantic terms should also be emitted into generated HTML metadata. This UI migration saves the field to PostgreSQL; public SEO output should only be changed in the publisher after its current implementation is reviewed.

## Data integrity and compatibility

The migration keeps the legacy arrays and validates that `post_type` belongs to the chosen `content_type`. Existing pages are assigned the `landing` subtype and existing articles the `article` subtype. No service-role key or database secret is required in the frontend.
