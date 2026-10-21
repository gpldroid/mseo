-- Add semantic search terms and content subtypes to the existing MSEO CMS schema.
-- Keeps the legacy array columns used by the static-site publisher backward-compatible.

DO $$
BEGIN
  IF to_regclass('public.mseo_content_items') IS NULL THEN
    RAISE EXCEPTION 'Expected table public.mseo_content_items was not found; verify the CMS project before applying this migration.';
  END IF;
END $$;

ALTER TABLE public.mseo_content_items
  ADD COLUMN IF NOT EXISTS semantic_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'article';

-- Existing page records must use a page subtype before enforcing the type pairing.
UPDATE public.mseo_content_items
SET post_type = CASE
  WHEN content_type = 'page' THEN 'landing'
  WHEN content_type = 'article' THEN 'article'
  ELSE post_type
END
WHERE post_type IS NULL
   OR (content_type = 'page' AND post_type = 'article');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'mseo_content_items_post_type_check'
      AND conrelid = 'public.mseo_content_items'::regclass
  ) THEN
    ALTER TABLE public.mseo_content_items
      ADD CONSTRAINT mseo_content_items_post_type_check
      CHECK (
        (content_type = 'article' AND post_type IN ('article', 'guide', 'tutorial', 'news', 'review'))
        OR
        (content_type = 'page' AND post_type IN ('landing', 'about', 'service', 'contact'))
      ) NOT VALID;
  END IF;
END $$;

-- Validate only after the existing rows have been normalized.
ALTER TABLE public.mseo_content_items
  VALIDATE CONSTRAINT mseo_content_items_post_type_check;

CREATE INDEX IF NOT EXISTS mseo_content_items_semantic_keywords_gin
  ON public.mseo_content_items USING GIN (semantic_keywords);

CREATE INDEX IF NOT EXISTS mseo_content_items_categories_gin
  ON public.mseo_content_items USING GIN (categories);

CREATE INDEX IF NOT EXISTS mseo_content_items_tags_gin
  ON public.mseo_content_items USING GIN (tags);

CREATE INDEX IF NOT EXISTS mseo_content_items_seo_keywords_gin
  ON public.mseo_content_items USING GIN (seo_keywords);

COMMENT ON COLUMN public.mseo_content_items.semantic_keywords IS
  'Semantic terms, synonyms, and related search concepts; distinct from target SEO keywords.';
COMMENT ON COLUMN public.mseo_content_items.post_type IS
  'Editorial subtype constrained by content_type: article/guide/tutorial/news/review or landing/about/service/contact.';
