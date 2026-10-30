import { chromium } from '@playwright/test';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { startServer } from './serve.mjs';
import { boardSpecs } from '../examples/interface-craft/typography-layout/model.mjs';
const root = resolve(import.meta.dirname, '..'), out = resolve(root, 'artifacts/typography-layout');
await mkdir(out, { recursive: true });
const hash = async file => createHash('sha256').update(await readFile(file)).digest('hex');
const { server, origin } = await startServer(), browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(origin + '/typography-layout-studies.html');
  await page.evaluate(() => document.fonts.ready);
  const artifacts = [];
  for (const spec of boardSpecs) {
    const png = resolve(out, spec.id.toLowerCase() + '.png'), webp = png.replace(/png$/, 'webp');
    await page.locator('#' + spec.id).screenshot({ path: png });
    const meta = await sharp(png).metadata();
    if (meta.width !== 2880 || meta.height !== 2000) throw new Error('Unexpected board dimensions');
    await sharp(png).webp({ quality: 94 }).toFile(webp);
    await sharp(png).resize(576, 400).webp({ quality: 85 }).toFile(webp.replace('.webp', '-thumb.webp'));
    artifacts.push({ ...spec, png: relative(root, png), webp: relative(root, webp), width: meta.width, height: meta.height, sha256: await hash(webp), pngSha256: await hash(png) });
  }
  const sources = {};
  async function collect(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const file = resolve(dir, entry.name); if (entry.isDirectory()) await collect(file); else sources[relative(root, file)] = await hash(file); } }
  await collect(resolve(root, 'examples/interface-craft/typography-layout'));
  await collect(resolve(root, 'skills/master-design'));
  for (const file of ['scripts/build.mjs','scripts/typography-capture.mjs','scripts/typography-check.mjs','scripts/prepare-typography-fonts.mjs','package.json']) sources[file] = await hash(resolve(root, file));
  await writeFile(resolve(out, 'manifest.json'), JSON.stringify({ date: '2026-10-30', node: process.version, browser: { chromium: browser.version() }, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), sourceStatus: 'working tree; hashes identify the exported source', canvas: { width: 1440, height: 1000, scale: 2 }, geometry: { C1: 1.5, C2: 1, C3: 1, R1: 1.6, R2: 1.5, R3: 1.6 }, conditions: { type: 24, metricLine: 40, rowLine: 24, control: 36, compensation: -6, cellPadding: 8, actionPadding: 2, wrapMeasure: 240 }, sources, artifacts }, null, 2) + '\n');
  const tiles = await Promise.all(artifacts.map(async (item, i) => ({ input: await sharp(resolve(root, item.png)).resize(480, 333).toBuffer(), left: i % 2 * 480, top: Math.floor(i / 2) * 333 })));
  await sharp({ create: { width: 960, height: 999, channels: 3, background: '#ececed' } }).composite(tiles).png().toFile(resolve(out, 'overview.png'));
  console.log('Exported C1–C3 / R1–R3 at 2880×2000 with font, source and engine provenance.');
} finally { await browser.close(); server.close(); }
