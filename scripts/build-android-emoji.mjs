// Collects every emoji used anywhere in src/ (content, activities, avatars, UI) and copies the matching
// Microsoft Fluent Emoji 3D image (MIT, via @lobehub/fluent-emoji-3d) into the Android app's assets,
// so pictures look realistic, identical on every phone, and work offline.
// Usage: node scripts/build-android-emoji.mjs <path to extracted fluent-emoji-3d package/assets>
import { readdirSync, readFileSync, statSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
if (!src || !existsSync(src)) { console.error('Pass the fluent-emoji-3d assets folder.'); process.exit(1); }
const out = join(root, 'android/shared/src/commonMain/composeResources/files/emoji');
mkdirSync(out, { recursive: true });

const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx|kt)$/.test(f)) files.push(p); } };
walk(join(root, 'src'));
walk(join(root, 'android/engine'));
walk(join(root, 'android/shared/src'));

const RE = /\p{RI}\p{RI}|(?:\p{Extended_Pictographic}|[#*0-9]️?⃣)(?:️|\p{EMod})?(?:‍\p{Extended_Pictographic}(?:️|\p{EMod})?)*/gu;
const found = new Set();
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(RE)) found.add(m[0]);

const available = new Set(readdirSync(src).map((f) => f.replace(/\.webp$/, '')));
const cps = (s) => [...s].map((c) => c.codePointAt(0).toString(16));
const map = {};
const missing = [];
for (const e of found) {
  const full = cps(e).join('-');
  const bare = cps(e).filter((c) => c !== 'fe0f').join('-');
  const name = [full, bare, `${bare}-fe0f`].find((n) => available.has(n));
  if (!name) { missing.push(e); continue; }
  copyFileSync(join(src, `${name}.webp`), join(out, `${bare}.webp`));
  map[e] = bare;
}
writeFileSync(join(out, 'index.json'), JSON.stringify(map));
console.log(`${Object.keys(map).length} emoji images copied; ${missing.length} without a 3D image: ${missing.join(' ')}`);
