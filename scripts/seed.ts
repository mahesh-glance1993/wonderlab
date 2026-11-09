// Repeatable seed: registers every bundled content item as version 1 (published) and creates
// demo accounts for local testing. Safe to re-run (INSERT OR IGNORE; educator edits are kept).
//   npm run db:seed            -> local D1
//   npm run db:seed -- --remote -> production D1 (content only unless SEED_DEMO=1)
import { webcrypto as crypto } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { loadAll } from '../src/content/index';

const remote = process.argv.includes('--remote');
const withDemo = !remote || process.env.SEED_DEMO === '1';
const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'wonderlab123'; // local test value only
const now = Math.floor(Date.now() / 1000);
const q = (s: unknown) => (s === null || s === undefined ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
async function hashSecret(secret: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$100000$${salt}$${hex(bits)}`;
}
const sha = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function main() {
  const lines: string[] = [];
  const all = await loadAll();
  let n = 0;
  for (const c of all) {
    for (const u of c.units) {
      const { objectives, ...unitMeta } = u;
      lines.push(`INSERT OR IGNORE INTO content_items (id, kind, published_version, latest_version) VALUES (${q(u.id)}, 'unit', 1, 1);`);
      lines.push(`INSERT OR IGNORE INTO content_versions (item_id, version, data, status, created_at, published_at) VALUES (${q(u.id)}, 1, ${q(JSON.stringify({ ...unitMeta, objectiveIds: objectives.map((o) => o.id) }))}, 'published', ${now}, ${now});`);
      n++;
      for (const o of objectives) {
        const { items, ...om } = o;
        lines.push(`INSERT OR IGNORE INTO content_items (id, kind, published_version, latest_version) VALUES (${q(o.id)}, 'objective', 1, 1);`);
        lines.push(`INSERT OR IGNORE INTO content_versions (item_id, version, data, status, created_at, published_at) VALUES (${q(o.id)}, 1, ${q(JSON.stringify(om))}, 'published', ${now}, ${now});`);
        n++;
        for (const it of items || []) {
          lines.push(`INSERT OR IGNORE INTO content_items (id, kind, published_version, latest_version) VALUES (${q(it.id)}, 'question', 1, 1);`);
          lines.push(`INSERT OR IGNORE INTO content_versions (item_id, version, data, status, created_at, published_at) VALUES (${q(it.id)}, 1, ${q(JSON.stringify(it))}, 'published', ${now}, ${now});`);
          n++;
        }
      }
      for (const tid of Object.keys(c.templates)) {
        const t = c.templates[tid];
        lines.push(`INSERT OR IGNORE INTO content_items (id, kind, published_version, latest_version) VALUES (${q(tid)}, 'template', 1, 1);`);
        lines.push(`INSERT OR IGNORE INTO content_versions (item_id, version, data, status, created_at, published_at) VALUES (${q(tid)}, 1, ${q(JSON.stringify({ id: tid, objectiveId: t.objectiveId, difficulty: t.difficulty, version: t.version }))}, 'published', ${now}, ${now});`);
      }
    }
  }
  if (withDemo) {
    const acct = async (id: string, username: string, role: string, email: string | null) => {
      lines.push(`INSERT OR IGNORE INTO accounts (id, username, email, email_verified, pass_hash, sec_question, sec_answer_hash, role, created_at, updated_at) VALUES (${q(id)}, ${q(username)}, ${q(email)}, ${email ? 1 : 0}, ${q(await hashSecret(DEMO_PASSWORD))}, 4, ${q(await hashSecret('mango'))}, ${q(role)}, ${now}, ${now});`);
    };
    await acct('00000000-0000-4000-8000-000000000001', 'demo_parent', 'parent', 'parent@example.test');
    await acct('00000000-0000-4000-8000-000000000002', 'demo_educator', 'educator', null);
    const prof = (id: string, nick: string, avatar: string, level: number, band: string) =>
      lines.push(`INSERT OR IGNORE INTO profiles (id, account_id, nickname, avatar, class_level, age_band, prefs, created_at, updated_at) VALUES (${q(id)}, '00000000-0000-4000-8000-000000000001', ${q(nick)}, ${q(avatar)}, ${level}, ${q(band)}, '{}', ${now}, ${now});`);
    prof('00000000-0000-4000-8000-0000000000a1', 'Chinni', 'rabbit', 0, '3-4');
    prof('00000000-0000-4000-8000-0000000000a2', 'Arjun', 'tiger', 7, '9-10');
    prof('00000000-0000-4000-8000-0000000000a3', 'Meera', 'owl', 12, '15-16');
    // demo recovery code for local testing: DEMO1-CODE1
    lines.push(`INSERT OR IGNORE INTO recovery_codes (id, account_id, code_hash, created_at) VALUES ('seed-rc-1', '00000000-0000-4000-8000-000000000001', ${q(await sha('DEMO1CODE1'))}, ${now});`);
  }
  mkdirSync('.wrangler', { recursive: true });
  writeFileSync('.wrangler/seed.sql', lines.join('\n'));
  console.log(`Seed: ${n} content items${withDemo ? ' + demo accounts' : ''} -> .wrangler/seed.sql`);
  const cfgEnv = remote ? '--env production --remote' : '--local';
  execSync(`npx wrangler d1 execute wonderlab ${cfgEnv} --file .wrangler/seed.sql -y`, { stdio: 'inherit' });
}
main().catch((e) => { console.error(e); process.exit(1); });
