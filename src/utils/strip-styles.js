/**
 * Remove presentation CSS from legacy HTML while preserving content and scripts.
 * Escaped CSS examples inside article code blocks are not matched.
 */
export function stripStyleMarkup(html = '') {
  const protectedBlocks = [];
  let output = String(html).replace(/<(pre|code|textarea)\b[\s\S]*?<\/\1\s*>/gi, (block) => {
    const token = '__MSEO_PRESERVED_CODE_' + protectedBlocks.length + '__';
    protectedBlocks.push(block);
    return token;
  });
  output = output
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*\bstylesheet\b)[^>]*>/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return output.replace(/__MSEO_PRESERVED_CODE_(\d+)__/g, (_, index) => protectedBlocks[Number(index)] || '');
}
