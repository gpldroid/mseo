import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'dist', 'public', '.astro', '.vercel']);

function stripStyleMarkup(value) {
  const protectedBlocks = [];
  let html = String(value).replace(/<(pre|code|textarea)\b[\s\S]*?<\/\1\s*>/gi, (block) => {
    const token = '__MSEO_PRESERVED_CODE_' + protectedBlocks.length + '__';
    protectedBlocks.push(block);
    return token;
  });
  html = html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<link\b(?=[^>]*\brel\s*=\s*["'][^"']*\bstylesheet\b)[^>]*>/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  return html.replace(/__MSEO_PRESERVED_CODE_(\d+)__/g, (_, index) => protectedBlocks[Number(index)] || '');
}

function removeJavaScriptPresentation(source, relativePath) {
  if (relativePath === 'assets/js/site.js') {
    source = source.replace(
      /  if \(!document\.querySelector\('link\[data-fastseo-google-font="cairo"\]'\)\) \{[\s\S]*?\n  \}\n/,
      ''
    );
    source = source.replace(
      /  \/\/ Keep the Gradient Pulse identity while allowing a persistent light\/dark color mode\.\n[\s\S]*?  const nested =/,
      '  const nested ='
    );
    source = source.replace(
      /  \/\/ Use one fixed site-wide palette: Gradient Pulse\.\n[\s\S]*?  \/\/ Keep article breadcrumbs canonical and friendly; never expose index\.html in the home crumb\.\n/,
      '  // Keep article breadcrumbs canonical and friendly; never expose index.html in the home crumb.\n'
    );
    source = source.replace(
      /  const colorModeKey = 'fastseo-color-mode-v1';[\s\S]*?  document\.documentElement\.dataset\.colorMode = savedColorMode;\n/,
      ''
    );
    source = source.replace(
      /  \/\/ Floating light\/dark switcher:[\s\S]*?    document\.body\.appendChild\(modeButton\);\n  \}\n/,
      ''
    );
    source = source.replace(/^\s*header\.style\.minHeight\s*=.*;\s*$/gm, '');
  }

  if (relativePath === 'assets/js/css-box-shadow-generator.js') {
    source = source.replace(/^\s*\$\('shadow-preview'\)\.style\.boxShadow\s*=\s*shadow;\s*$/gm, '');
    source = source.replace('تم تحديث المعاينة والكود.', 'تم تحديث الكود.');
  }

  if (relativePath === 'assets/js/css-color-generator.js') {
    source = source.replace(/^\s*\$\('color-gradient-preview'\)\.style\.background\s*=\s*gradient;\s*$/gm, '');
    source = source.replace(/swatch\.style\.background\s*=\s*color;/g, '');
    source = source.replace(/^\s*\$\('color-demo'\)\.style\.setProperty\([^;]+;\s*$/gm, '');
    source = source.replace('تم تحديث اللوحة والمعاينة.', 'تم تحديث لوحة الألوان والقيم.');
  }

  if (relativePath === 'assets/js/internet-speed-test.js') {
    source = source.replace(/^\s*const progress\s*=\s*\$\("speed-progress-bar"\);\s*$/gm, '');
    source = source.replace(/^\s*const setProgress\s*=\s*\([^;]*;\s*$/gm, '');
    source = source.replace(/^\s*setProgress\([^;]*\);\s*$/gm, '');
  }

  if (relativePath === 'assets/js/seo-analyzer.js') {
    source = source.replace(/ style="--score:'\+r\.score\+'"/g, '');
    source = source.replace(/area\.style\.position='fixed';area\.style\.opacity='0';/g, '');
  }

  if (relativePath === 'assets/js/word-counter.js') {
    source = source.replace(/helper\.style\.position\s*=\s*'absolute';\s*helper\.style\.insetInlineStart\s*=\s*'-9999px';\s*/g, '');
  }

  return source;
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');

    if (entry.isDirectory()) {
      await walk(absolute);
      continue;
    }
    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (extension === '.css') {
      await unlink(absolute);
      console.log('Deleted', relative);
      continue;
    }

    if (extension === '.html' || extension === '.svg') {
      const before = await readFile(absolute, 'utf8');
      const after = stripStyleMarkup(before);
      if (after !== before) {
        await writeFile(absolute, after, 'utf8');
        console.log('Removed embedded CSS markup from', relative);
      }
      continue;
    }

    if (extension === '.js') {
      const before = await readFile(absolute, 'utf8');
      const after = removeJavaScriptPresentation(before, relative);
      if (after !== before) {
        await writeFile(absolute, after, 'utf8');
        console.log('Removed presentation code from', relative);
      }
    }
  }
}

await walk(root);
console.log('Source CSS cleanup completed.');
