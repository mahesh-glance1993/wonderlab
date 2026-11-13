// Bundles android/engine/entry.ts (+ the shared TypeScript it imports from src/) into
// android/shared/src/commonMain/composeResources/files/engine.js for the native app's embedded QuickJS engine.
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'android/shared/src/commonMain/composeResources/files/engine.js');
mkdirSync(dirname(out), { recursive: true });
await build({
  entryPoints: [resolve(root, 'android/engine/entry.ts')],
  outfile: out,
  bundle: true,
  format: 'iife',
  platform: 'neutral',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
  charset: 'utf8',
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});
console.log('engine.js built');
