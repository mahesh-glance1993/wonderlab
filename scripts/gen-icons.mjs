// Renders the PWA PNG icons from public/icon.svg (run after changing the icon):
//   node scripts/gen-icons.mjs
// Uses the locally installed Microsoft Edge through playwright-core (same as tests/e2e/browser.mjs).
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf-8');
const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
// "any" icons keep the rounded tile; maskable/apple icons are full-bleed with the art inside the 80% safe zone.
const rounded = (n) => `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 64 64">${inner}</svg>`;
const fullBleed = (n) => `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 64 64"><rect width="64" height="64" fill="#3F6F58"/><g transform="translate(6.4 6.4) scale(0.8)">${inner.replace(/<rect[^>]*\/>/, '')}</g></svg>`;
const out = [
  ['icon-192.png', rounded(192), 192],
  ['icon-512.png', rounded(512), 512],
  ['icon-maskable-512.png', fullBleed(512), 512],
  ['apple-touch-icon.png', fullBleed(180), 180],
];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
for (const [name, markup, n] of out) {
  await page.setViewportSize({ width: n, height: n });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
  const buf = await page.locator('svg').screenshot({ omitBackground: true });
  writeFileSync(new URL(`../public/${name}`, import.meta.url), buf);
  console.log('wrote public/' + name);
}
await browser.close();
