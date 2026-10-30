// Development import only: use the article's existing pinned font shards; no downloads.
import { readFile, writeFile, mkdir, copyFile, readdir, unlink } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { samples } from '../examples/interface-craft/typography-layout/model.mjs';
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/prepare-typography-fonts.mjs <article-checkout>');
const base = resolve(import.meta.dirname, '../examples/interface-craft/typography-layout');
await mkdir(resolve(base, 'fonts'), { recursive: true });
const sourceManifest = JSON.parse(await readFile(resolve(source, 'public/fonts/SOURCES.json'), 'utf8'));
const artifacts = [], css = ['/* Pinned first-party import. See fonts/SOURCES.json and bundled OFL notices. */'];
for (const region of ['tc', 'sc', 'jp', 'kr']) {
  const locale = {tc:'zh-TW',sc:'zh-CN',jp:'ja',kr:'ko'}[region];
  const points = [...new Set(Array.from(Object.values(samples[locale]).join(''), c => c.codePointAt(0)))];
  const name = `noto-sans-${region}`;
  const sheet = await readFile(resolve(source, 'public/fonts', name + '.css'), 'utf8');
  for (const block of sheet.match(/@font-face\s*\{[^}]+\}/g) ?? []) {
    const range = block.match(/unicode-range:\s*([^;]+);/)?.[1];
    const ranges = range?.split(',').map(piece => {
      const [a, b] = piece.trim().replace(/^U\+/i, '').split('-');
      return [parseInt(a.replace(/\?/g, '0'), 16), parseInt((b ?? a).replace(/\?/g, 'F'), 16)];
    });
    if (ranges && !points.some(point => ranges.some(([start, end]) => point >= start && point <= end))) continue;
    const file = basename(block.match(/url\(([^)]+)\)/)[1]);
    await copyFile(resolve(source, 'public/fonts', file), resolve(base, 'fonts', file));
    const sha256 = createHash('sha256').update(await readFile(resolve(base, 'fonts', file))).digest('hex');
    const original = sourceManifest.files.find(item => item.file === file);
    assert(original && original.sha256 === sha256, 'Pinned font mismatch: ' + file);
    if (!artifacts.some(item => item.file === file)) artifacts.push({ file, sha256, url: original.url });
    css.push(block.replace(/url\([^)]+\)/, `url('./fonts/${file}')`).replace(/font-display:\s*swap/, 'font-display: block'));
  }
  const license = region === 'tc' ? 'noto-sans-tc-OFL.txt' : `notosans${region}-OFL.txt`;
  await copyFile(resolve(source, 'public/fonts/licenses', license), resolve(base, 'fonts', license));
}
await writeFile(resolve(base, 'fonts.css'), css.join('\n') + '\n');
for (const file of await readdir(resolve(base, 'fonts'))) {
  if (file.endsWith('.woff2') && !artifacts.some(item => item.file === file)) await unlink(resolve(base, 'fonts', file));
}
await writeFile(resolve(base, 'fonts/SOURCES.json'), JSON.stringify({ source: '1aron/aron.tw public/fonts/SOURCES.json', selection: 'Unicode ranges intersecting the five fixed samples; new strings may require reimport.', files: artifacts }, null, 2) + '\n');
console.log(`Imported ${artifacts.length} pinned local font shards and four OFL notices.`);
