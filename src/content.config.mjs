import { defineCollection, z } from 'astro:content';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function addDesignSystem(headHtml) {
  if (/mseo-3d-system\.css/i.test(headHtml)) return headHtml;
  return headHtml + '\\n<link rel="stylesheet" href="/assets/css/mseo-3d-system.css" data-mseo-design="gold-3d">';
}

const articles = defineCollection({
  loader: async () => {
    const catalog = JSON.parse(await readFile(path.join(root, 'data/articles.json'), 'utf8'));
    const seen = new Set();

    return Promise.all(catalog.map(async (record) => {
      const slug = String(record.slug || '').trim();
      const file = String(record.file || (slug + '.html'));
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        throw new Error('Invalid article slug in data/articles.json: ' + slug);
      }
      if (seen.has(slug)) throw new Error('Duplicate article slug: ' + slug);
      seen.add(slug);

      const sourcePath = path.join(root, 'articles', file);
      let source;
      try {
        source = await readFile(sourcePath, 'utf8');
      } catch {
        throw new Error('Article catalog entry "' + slug + '" points to missing file: articles/' + file);
      }

      const head = source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
      const main = source.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
      const body = source.match(/<body\b([^>]*)>/i);
      if (!head || !main) {
        throw new Error('Article "' + slug + '" must contain a complete head and main element.');
      }

      const bodyClass = body?.[1]?.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      return {
        id: slug,
        slug,
        title: String(record.title || slug),
        description: String(record.description || ''),
        category: String(record.category || 'مقالات'),
        publishedAt: String(record.publishedAt || ''),
        updatedAt: String(record.updatedAt || record.publishedAt || ''),
        sourceFile: file,
        bodyClass,
        headHtml: addDesignSystem(head[1]),
        mainHtml: main[0]
      };
    }));
  },
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string(),
    sourceFile: z.string(),
    bodyClass: z.string(),
    headHtml: z.string(),
    mainHtml: z.string()
  })
});

export const collections = { articles };
