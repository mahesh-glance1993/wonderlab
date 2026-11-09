// Exports the production D1 database to backups/wonderlab-<env>-<timestamp>.sql (gitignored).
//   npm run db:backup                 # production (remote)
//   npm run db:backup -- --local      # local dev database
// Requires `npx wrangler login` (or CLOUDFLARE_API_TOKEN with D1 edit permission).
// Backups contain family account data (usernames, emails, password hashes, learner progress):
// store them encrypted, never commit or share them, and delete old copies.
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const local = process.argv.includes('--local');
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dir = 'backups';
mkdirSync(dir, { recursive: true });
const file = join(dir, `wonderlab-${local ? 'local' : 'production'}-${stamp}.sql`);
const args = ['wrangler', 'd1', 'export', 'wonderlab', '--output', file, ...(local ? ['--local'] : ['--remote', '--env', 'production'])];
console.log(`> npx ${args.join(' ')}`);
const r = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (r.status !== 0) {
  console.error('Backup failed.');
  process.exit(r.status || 1);
}
console.log(`Backup written: ${file} (${(statSync(file).size / 1024).toFixed(1)} KiB)`);
