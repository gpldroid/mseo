import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage', 'admin-dashboard']);
const files = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) await walk(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.(?:mjs|cjs|js)$/.test(entry.name)) continue;
    if (entry.name.startsWith('admin.')) continue;
    files.push(path.relative(root, fullPath).split(path.sep).join('/'));
  }
}

await walk(root);
files.sort();
if (!files.length) {
  console.warn('JavaScript syntax audit: no standalone .js/.mjs/.cjs files found.');
} else {
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error('Syntax check failed: ' + file + '\n' + (result.stderr || result.stdout || 'Node exited with status ' + result.status));
    }
  }
  console.log('JavaScript syntax OK (' + files.length + ' files).');
}
console.log('Note: inline JavaScript embedded in HTML is not covered by this file-level syntax check.');
