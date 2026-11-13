import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PACKS } from './src/shared/packs';
import { copyPictures } from './scripts/copy-pictures.mjs';

// Build identity: package version + short commit (CI sets GITHUB_SHA; locally ask git; else "dev").
const pkgVersion = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }).version;
function commitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'dev'; }
}
const BUILD = { version: pkgVersion, commit: commitSha(), builtAt: new Date().toISOString() };
/** Unique per build (commit alone is not: local builds are all "dev"). Names the offline cache. */
const BUILD_ID = `${BUILD.commit}-${createHash('sha1').update(BUILD.builtAt).digest('hex').slice(0, 8)}`;

/** dist/version.json — read by /api/health through the assets binding. */
function versionFile(): Plugin {
  return { name: 'wonderlab-version', apply: 'build', generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ ...BUILD, buildId: BUILD_ID }) }); } };
}

/** Public files the app shell needs offline (besides the page itself, cached as /__wl/index.html). */
const SHELL_STATIC = ['/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

/**
 * Offline manifests, written after the bundle (so index.html exists):
 *  dist/packs.json — { v:2, build, entry, shell:{files,bytes}, fonts:[css urls], packs:[{id,files,bytes,version}] }
 *  dist/shell.json — shell file list (kept for older service workers)
 * Every emitted file under assets/ is either in the shell or in at least one pack, so navigating
 * to any route offline never needs a chunk that was not downloaded:
 *  - a pack = output chunks whose modules match the pack's patterns + their static imports/CSS/assets
 *  - the shell = the entry closure + every file that belongs to no pack (lazy route screens such as
 *    Home, profile picker, parent area, downloads) + their closures.
 */
function packsManifest(): Plugin {
  let outDir = 'dist';
  return {
    name: 'wonderlab-packs',
    apply: 'build',
    configResolved(c) { outDir = resolve(c.root, c.build.outDir); },
    writeBundle(_opts, bundle) {
      const files = Object.values(bundle);
      const sizeOf = (n: string) => { const b = bundle[n]; return b ? (b.type === 'chunk' ? new TextEncoder().encode(b.code).length : typeof b.source === 'string' ? new TextEncoder().encode(b.source).length : b.source.byteLength) : 0; };
      const closure = (start: string[]) => {
        const set = new Set<string>();
        const add = (name: string) => {
          if (set.has(name) || !bundle[name]) return;
          set.add(name);
          const b = bundle[name];
          if (b.type === 'chunk') {
            b.imports.forEach(add);
            b.viteMetadata?.importedCss.forEach(add);
            b.viteMetadata?.importedAssets.forEach(add);
          }
        };
        start.forEach(add);
        return set;
      };
      const packSets = PACKS.map((p) => {
        const start: string[] = [];
        for (const f of files) {
          if (f.type !== 'chunk') continue;
          const ids = [f.facadeModuleId || '', ...Object.keys(f.modules)].map((s) => s.split('\\').join('/'));
          if (p.modules.some((m) => ids.some((id) => id.includes(m)))) start.push(f.fileName);
        }
        return closure(start);
      });
      const inPack = new Set(packSets.flatMap((s) => [...s]));
      const shell = closure([
        ...files.filter((f) => f.type === 'chunk' && f.isEntry).map((f) => f.fileName),
        ...files.filter((f) => f.fileName.startsWith('assets/') && !inPack.has(f.fileName)).map((f) => f.fileName),
      ]);
      const entry = files.find((f) => f.type === 'chunk' && f.isEntry)?.fileName || '';
      // Google Fonts stylesheet(s) linked from index.html; the downloader also caches their font files.
      const html = existsSync(join(outDir, 'index.html')) ? readFileSync(join(outDir, 'index.html'), 'utf-8') : '';
      const fonts = [...html.matchAll(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
      // recorded narration clips listed in public/audio/te/manifest.json
      const clips: string[] = [];
      try {
        const man = JSON.parse(readFileSync('public/audio/te/manifest.json', 'utf-8')) as Record<string, Record<string, string>>;
        for (const lang of Object.values(man)) for (const f of Object.values(lang || {})) if (typeof f === 'string') clips.push(f.startsWith('/') ? f : `/audio/te/${f}`);
      } catch { /* no manifest */ }
      const packs = PACKS.map((p, i) => {
        const own = [...packSets[i]];
        const extra = (p.files || []).map((f) => '/' + f).concat(p.kind === 'narration' ? clips : []);
        const list = own.map((n) => '/' + n).concat(extra).sort();
        // bytes = what this pack adds on top of the shell (shared chunks with other packs counted in each)
        const bytes = own.filter((n) => !shell.has(n)).reduce((s, n) => s + sizeOf(n), 0)
          + extra.reduce((s, f) => { const fp = join(outDir, f); return s + (existsSync(fp) ? readFileSync(fp).byteLength : 0); }, 0);
        return { id: p.id, files: list, bytes, version: createHash('sha1').update(list.join('|')).digest('hex').slice(0, 12) };
      });
      const shellFiles = [...shell].map((n) => '/' + n).sort();
      const out = {
        v: 2, build: BUILD_ID, builtAt: BUILD.builtAt, entry: '/' + entry,
        shell: { files: [...shellFiles, ...SHELL_STATIC.filter((f) => existsSync(join(outDir, f)))], bytes: [...shell].reduce((s, n) => s + sizeOf(n), 0) + new TextEncoder().encode(html).length },
        fonts, packs,
      };
      // sanity: every emitted asset is reachable offline via the shell or some pack
      const orphans = files.filter((f) => f.fileName.startsWith('assets/') && !shell.has(f.fileName) && !inPack.has(f.fileName));
      if (orphans.length) this.error(`offline manifest: files in neither shell nor packs: ${orphans.map((f) => f.fileName).join(', ')}`);
      writeFileSync(join(outDir, 'packs.json'), JSON.stringify(out));
      writeFileSync(join(outDir, 'shell.json'), JSON.stringify(shellFiles));
    },
  };
}

/** Copies the apps' realistic pictures into public/pictures before dev / build (scripts/copy-pictures.mjs). */
function pictures(): Plugin {
  return { name: 'wonderlab-pictures', buildStart() { copyPictures({ quiet: true }); } };
}

export default defineConfig({
  plugins: [pictures(), react(), packsManifest(), versionFile()],
  define: { __APP_VERSION__: JSON.stringify(`${BUILD.version}+${BUILD.commit}`), __BUILD_ID__: JSON.stringify(BUILD_ID) },
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: { sourcemap: false, chunkSizeWarningLimit: 900 },
});
