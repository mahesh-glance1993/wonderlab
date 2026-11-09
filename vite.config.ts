import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PACKS } from './src/shared/packs';

/** Resolves each offline pack's module patterns to real output files + sizes → dist/packs.json */
function packsManifest(): Plugin {
  return {
    name: 'wonderlab-packs',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = Object.values(bundle);
      const out = PACKS.map((p) => {
        const set = new Set<string>();
        const add = (name: string) => {
          if (set.has(name)) return;
          set.add(name);
          const b = bundle[name];
          if (b && b.type === 'chunk') b.imports.forEach(add);
          if (b && b.type === 'chunk' && b.viteMetadata) b.viteMetadata.importedCss.forEach((c) => set.add(c));
        };
        for (const f of files) {
          if (f.type !== 'chunk') continue;
          const ids = [f.facadeModuleId || '', ...Object.keys(f.modules)].map((s) => s.split('\\').join('/'));
          if (p.modules.some((m) => ids.some((id) => id.includes(m)))) add(f.fileName);
        }
        const list = [...set].map((n) => '/' + n).concat((p.files || []).map((f) => '/' + f));
        const bytes = [...set].reduce((s, n) => { const b = bundle[n]; return s + (b ? (b.type === 'chunk' ? b.code.length : typeof b.source === 'string' ? b.source.length : b.source.byteLength) : 0); }, 0);
        return { id: p.id, files: list, bytes };
      });
      this.emitFile({ type: 'asset', fileName: 'packs.json', source: JSON.stringify({ builtAt: new Date().toISOString(), packs: out }) });
      const shell = files.filter((f) => f.type === 'chunk' ? f.isEntry : f.fileName.endsWith('.css')).map((f) => '/' + f.fileName);
      this.emitFile({ type: 'asset', fileName: 'shell.json', source: JSON.stringify(shell) });
    },
  };
}

export default defineConfig({
  plugins: [react(), packsManifest()],
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: { sourcemap: false, chunkSizeWarningLimit: 900 },
});
