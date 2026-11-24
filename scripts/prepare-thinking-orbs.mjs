// Node 23.6+. Reproduce the readable browser modules without a bundle or runtime dependency.
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vendor = resolve(root, 'vendor/thinking-orbs');
const provenance = JSON.parse(readFileSync(resolve(vendor, 'provenance.json')));
for (const file of provenance.files) {
  const bytes = readFileSync(resolve(root, file.path));
  const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (hash !== file.sha) throw new Error(`Changed upstream source: ${file.path}`);
}
const files = ['presets.ts', 'types.ts', ...readdirSync(resolve(vendor, 'src/engine')).map(name => `engine/${name}`)];
for (const file of files) {
  const input = resolve(vendor, 'src', file), output = resolve(vendor, 'browser', file.replace(/\.ts$/, '.mjs'));
  const js = stripTypeScriptTypes(readFileSync(input, 'utf8'), {mode: 'strip'})
    .replace(/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g, '$1$2.mjs$3');
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, `// MIT · Jakub Antalik. See ../LICENSE and provenance.json.\n// Readable type-stripped source: ${relative(root, input)}\n${js}`);
}
console.log(`Verified ${provenance.files.length} upstream files; prepared ${files.length} readable modules.`);
