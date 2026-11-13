// Copies the realistic pictures bundled with the native apps into the website's public folder, so the
// website shows exactly the same pictures without keeping a second copy of the images in git:
//   android/shared/src/commonMain/composeResources/files/emoji/   → public/pictures/emoji/   (Fluent Emoji 3D, MIT)
//   android/shared/src/commonMain/composeResources/files/photos/  → public/pictures/photos/  (Wikimedia Commons photos + credits.json)
// Runs before every build (npm run build / vite build / vite dev via the plugin in vite.config.ts).
// Only changed files are copied; files that no longer exist in the source are removed.
// Usage: node scripts/copy-pictures.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'android/shared/src/commonMain/composeResources/files');
const OUT = join(ROOT, 'public/pictures');
const KINDS = ['emoji', 'photos'];
const OK = /\.(webp|json)$/;

/** Copies the picture folders; returns { copied, removed, total } (total 0 when the source is missing). */
export function copyPictures({ quiet = false } = {}) {
  let copied = 0, removed = 0, total = 0;
  for (const kind of KINDS) {
    const from = join(SRC, kind);
    const to = join(OUT, kind);
    if (!existsSync(from)) { if (!quiet) console.warn(`copy-pictures: ${from} not found — pictures fall back to system emoji`); continue; }
    mkdirSync(to, { recursive: true });
    const names = readdirSync(from).filter((f) => OK.test(f));
    const keep = new Set(names);
    for (const f of names) {
      total++;
      const a = statSync(join(from, f));
      const target = join(to, f);
      const b = existsSync(target) ? statSync(target) : null;
      if (b && b.size === a.size && b.mtimeMs >= a.mtimeMs) continue;
      copyFileSync(join(from, f), target);
      copied++;
    }
    for (const f of readdirSync(to)) if (!keep.has(f)) { rmSync(join(to, f), { force: true }); removed++; }
  }
  if (!quiet) console.log(`copy-pictures: ${total} files (${copied} copied, ${removed} removed) → public/pictures`);
  return { copied, removed, total };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) copyPictures();
