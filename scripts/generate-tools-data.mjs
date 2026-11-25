import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const source = await readFile(path.join(root, 'assets/js/tools-catalog.js'), 'utf8');
const match = source.match(/const tools = (\[[\s\S]*?\]);\s*\/\/ Structured data shared with WebMCP/);
if (!match) throw new Error('Could not extract the canonical tools array from assets/js/tools-catalog.js.');

const tools = vm.runInNewContext('(' + match[1] + ')');
if (!Array.isArray(tools) || !tools.length) throw new Error('The tools catalog is empty or invalid.');
const hrefs = new Set();
for (const tool of tools) {
  if (!tool || typeof tool.title !== 'string' || typeof tool.href !== 'string') {
    throw new Error('Every tool must define a title and href.');
  }
  if (!/^[a-z0-9-]+\.html$/i.test(tool.href)) throw new Error('Invalid tool route: ' + tool.href);
  if (hrefs.has(tool.href)) throw new Error('Duplicate tool route: ' + tool.href);
  hrefs.add(tool.href);
}

const outputDir = path.join(root, 'src', 'generated');
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'tools-catalog.json'), JSON.stringify(tools, null, 2) + '\n', 'utf8');
console.log('Generated Astro tools data from the shared runtime catalog:', tools.length);
