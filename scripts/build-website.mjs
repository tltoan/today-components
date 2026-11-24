// Export the approved website without publishing the component gallery or docs.
// Run from any working directory: node scripts/build-website.mjs
import {readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync} from 'node:fs';
import {resolve, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist/website');
let html = readFileSync(resolve(root, 'today-site-b.html'), 'utf8');
const replaceOnce = (pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Website source changed: ${pattern}`);
  html = html.replace(pattern, replacement);
};
replaceOnce(/<div class="site-study-bar"[\s\S]*?<\/div>\s*<\/div>/, '');
replaceOnce(/<div class="site-prototype-note">[\s\S]*?<\/div>/, '');
replaceOnce(/<link rel="stylesheet" href="library-embed.css">/, '');
replaceOnce(/<script src="library-catalog.js[^"\n]*" defer><\/script>/, '');
replaceOnce(/<script src="library-embed.js" defer><\/script>/, '');
replaceOnce(/<body class="site-b" data-direction="b">/, '<body class="site-b site-public" data-direction="b" data-site-home="/">');
replaceOnce(/<title>[^<]+<\/title>/, '<title>Today — what will you do?</title>');
replaceOnce(/<\/head>/, '<style>:root{--site-bar:0px}</style>\n</head>');
html = html.replaceAll('href="today-site-b.html', 'href="/');

// Explicit entry dependencies plus the assets referenced by shared registries/CSS.
const sources = new Set([...html.matchAll(/(?:src|href)="([^"?#]+\.(?:css|js))(?:\?[^"#]*)?"/g)].map(match => match[1]));
for (const file of sources) {
  const source = readFileSync(resolve(root, file), 'utf8');
  for (const match of source.matchAll(/["'](assets\/[^"'\s]+\.(?:svg|otf|woff2?))["']/g)) sources.add(match[1]);
  if (file.endsWith('.css')) {
    for (const match of source.matchAll(/url\(['"]?([^'"\s)]+)['"]?\)/g)) {
      if (match[1].startsWith('data:') || match[1].startsWith('#')) continue;
      sources.add(relative(root, resolve(root, dirname(file), match[1])));
    }
  }
}
for (const file of sources) {
  if (!/^(components|foundations|assets)\//.test(file) && !/^today-(?:site(?:-opening)?|logo)\.(js|css)$/.test(file)) {
    throw new Error(`Unexpected deployment dependency: ${file}`);
  }
}
rmSync(output, {recursive:true, force:true});
mkdirSync(output, {recursive:true});
writeFileSync(resolve(output, 'index.html'), html);
for (const file of [...sources].sort()) {
  const destination = resolve(output, file);
  mkdirSync(dirname(destination), {recursive:true});
  copyFileSync(resolve(root, file), destination);
}
// Retain the source's noindex boundary until download and legal copy are final.
writeFileSync(resolve(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`Website exported: ${sources.size + 2} files → dist/website`);
