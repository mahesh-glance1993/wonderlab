# WonderLab

A full-screen learning and creativity app for children from **Nursery, LKG and UKG through Class 10**: CBSE-aligned Mathematics and physical science, an interactive Physics Lab, an Art Studio (tracing, colouring, pressure-sensitive painting), games and puzzles, offline packs, English + Telugu (Nursery–Class 3), parent accounts with multiple child profiles, and a restricted educator content editor.

No ads, no third-party tracking, no public profiles, galleries, leaderboards or chat.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript + Vite, react-router; lazy-loaded feature modules |
| API | Cloudflare Workers + Hono (`worker/`) |
| Database | Cloudflare D1 (SQLite) with SQL migrations (`migrations/`) |
| Shared logic | `src/shared/` — grading, mastery, recommendations, validation, content types (used by app **and** API) |
| Offline | Service worker (`public/sw.js`) + IndexedDB queue (`src/lib/sync.ts`) |
| Tests | Vitest (unit/content) + `tests/e2e/run.mjs` (API journeys) + Playwright browser checks |

```
src/
  shared/      grading.ts, mastery.ts, recommend.ts, validate.ts, content.ts, levels.ts, packs.ts
  content/     curriculum (one lazy chunk per class) + coverage map source
  features/    auth, home, parent, lesson, lab, art, games, progress, downloads, editor
  lib/         api, app context, sync/offline, audio/narration, fullscreen, idb
  ui/          shared components + icon set
  i18n/        en.ts, te.ts
worker/        index.ts (routes), auth.ts, learner.ts, content.ts, lib.ts
migrations/    0001_init.sql
scripts/       seed.ts
docs/          CURRICULUM_COVERAGE.md, VERIFICATION.md, REVIEW_CHECKLIST.md
```

## Local setup

Requirements: Node 20+ (tested with Node 24), npm. No paid services needed.

```bash
npm install
npm run db:migrate        # create local D1 tables
npm run db:seed           # content registry + demo accounts (repeatable)
npm start                 # production build + local server on http://localhost:8787
```

For UI development with hot reload run two terminals: `npm run dev:api` (API on :8787) and `npm run dev` (Vite on :5173, proxies `/api`).

### Demo accounts (local only)

| Username | Password | Role | Notes |
|---|---|---|---|
| `demo_parent` | `wonderlab123` | parent | learners: Chinni (Nursery), Arjun (Class 5), Meera (Class 10); security answer `mango`; recovery code `DEMO1-CODE1`; email `parent@example.test` (verified) |
| `demo_educator` | `wonderlab123` | educator | opens `/editor` |

Change the demo password with `SEED_PASSWORD=... npm run db:seed`. Demo accounts are **not** created in production unless `SEED_DEMO=1`.

### Testing email recovery locally

In development, emails are written to an outbox instead of being sent. Open
`http://localhost:8787/api/dev/outbox` to read verification and password-reset emails (disabled in production).

### Commands

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript for app and worker |
| `npm run lint` | ESLint |
| `npm test` | Unit, content-validation, lesson, lab, art and game tests |
| `npm run test:e2e -- http://127.0.0.1:8787` | API journeys (server must be running, fresh DB via `npm run db:reset`) |
| `npm run build` | Type checks + production bundle in `dist/` (+ `packs.json` with offline pack sizes) |
| `npm run db:reset` | Wipe local DB, migrate, seed |

## Production (Cloudflare)

1. `npx wrangler login`
2. `npx wrangler d1 create wonderlab` → copy the `database_id` into `wrangler.jsonc` under `env.production.d1_databases`.
3. Email delivery (optional but needed for email recovery): create a [Resend](https://resend.com) API key for a verified sending domain, then `npx wrangler secret put RESEND_API_KEY --env production` and set `EMAIL_FROM` in `wrangler.jsonc`. Without it, accounts still recover with **recovery codes**; reset emails stay in the server outbox.
4. `npm run deploy` (builds, applies migrations remotely, deploys to `learn.maheshglance.com`).
5. `npm run db:seed -- --remote` to register content items for the editor.
6. Create an educator: register normally, then `npx wrangler d1 execute wonderlab --env production --remote --command "UPDATE accounts SET role='educator' WHERE username='<name>'"`.

### Configuration (`wrangler.jsonc` vars)

| Var | Default | Meaning |
|---|---|---|
| `SESSION_IDLE_DAYS` | 30 | Trusted device ("keep me signed in") inactivity limit |
| `SESSION_MAX_DAYS` | 60 | Absolute lifetime, renewed by daily token rotation while in use |
| `SHARED_IDLE_MIN` | 60 | Shared-device inactivity limit (session cookie) |
| `APP_ORIGIN` | | Used in email links |

## Security model (summary)

- Parent sign-in with **username + password**; passwords and security answers stored as PBKDF2-SHA256 (100k) hashes.
- Sessions: random 256-bit token in an **HttpOnly, Secure, SameSite=Lax** cookie (`__Host-` prefix on HTTPS); only its SHA-256 is stored. Daily rotation, revocation, inactivity + absolute limits; shared-device sessions use a browser-session cookie. No passwords or session secrets in localStorage.
- Recovery: **verified email link** or **one-time recovery code**, each *plus* the security answer. Links/codes are single-use, links expire in 30 minutes, a reset revokes all sessions. Generic responses for unauthenticated recovery requests. Rate limits on sign-in, verification and recovery.
- Parent verification (password re-entry, 10 minutes) for account settings, sessions, recovery codes, export, deletion, profile class/age changes, downloads.
- Every `/api/p/:profileId/*` route checks the profile belongs to the signed-in account; other accounts get `404`. Editor routes require the `educator`/`admin` role. CSRF: custom header + same-origin check on all mutating requests.
- Minimal data: learners have a nickname, avatar, class and age band — no birth date.

See `docs/VERIFICATION.md` for the latest build/test results and pending checks.
