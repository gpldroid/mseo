/**
 * Remove presentation CSS from legacy HTML while preserving content and scripts.
 * Escaped CSS examples inside article code blocks are not matched.
 */
export function stripStyleMarkup(html = '') {
  return String(html)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*\bstylesheet\b)[^>]*>/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}
