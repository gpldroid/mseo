import { defineCollection, z } from 'astro:content';
import { readFile, readdir } from 'node:fs/promises';
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


function parseSafeAttributes(raw = '') {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of raw.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    if (/^(class|lang|dir|id|role|style|hidden|data-[a-z0-9_-]+|aria-[a-z0-9_-]+)$/.test(name)) {
      attributes[name] = match[2] ?? match[3] ?? match[4] ?? '';
    }
  }
  return attributes;
}

const legacyPages = defineCollection({
  loader: async () => {
    const excluded = new Set(['categories.html', 'topics.html', 'tools.html']);
    const names = (await readdir(path.join(root, 'pages')))
      .filter((name) => name.endsWith('.html') && !excluded.has(name))
      .sort();

    return Promise.all(names.map(async (file) => {
      const source = await readFile(path.join(root, 'pages', file), 'utf8');
      const head = source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
      const body = source.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);
      const html = source.match(/<html\b([^>]*)>/i);
      if (!head || !body || !html) {
        throw new Error('Legacy page "' + file + '" must contain html, head and body elements.');
      }

      const slug = file.replace(/\.html$/i, '');
      return {
        id: slug,
        slug,
        sourceFile: file,
        htmlAttrs: parseSafeAttributes(html[1]),
        bodyAttrs: parseSafeAttributes(body[1]),
        headHtml: addDesignSystem(head[1]),
        bodyHtml: body[2]
      };
    }));
  },
  schema: z.object({
    slug: z.string(),
    sourceFile: z.string(),
    htmlAttrs: z.any(),
    bodyAttrs: z.any(),
    headHtml: z.string(),
    bodyHtml: z.string()
  })
});

export const collections = { articles, legacyPages };
