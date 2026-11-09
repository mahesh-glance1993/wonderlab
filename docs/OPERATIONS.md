# WonderLab — operations runbook

Production: **https://learn.maheshglance.com** · Cloudflare Worker `wonderlab` (env `production`) · D1 database `wonderlab` (`9aad147e-678e-45e6-987e-945b2e1bc1c4`) · Workers AI (TTS) · GitHub `mahesh-glance1993/wonderlab` (`main`).

All commands run from the repo root. Production commands need `npx wrangler login` (or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in the environment).

## 1. Deploy

### From a workstation

```bash
npm ci
npm run check            # typecheck + lint + unit tests + build
npm run db:backup        # snapshot production D1 first (see §3)
npm run deploy           # build → apply D1 migrations (remote) → wrangler deploy --env production
curl -s https://learn.maheshglance.com/api/health
```

`/api/health` must return `"ok": true`, `"checks": {"db": "ok"}` and the expected `version` (`<package version>`) / `commit` (short git SHA baked in at build time). `deployment` is the Cloudflare version id — note it for rollbacks.

### From GitHub Actions

- `.github/workflows/ci.yml` runs on every push to `main` and on pull requests: `npm ci`, typecheck (app + worker), ESLint, Vitest, Vite build, and a `wrangler deploy --dry-run` bundle check. It needs **no secrets**.
- `.github/workflows/deploy.yml` is **manual** (Actions → "Deploy (production)" → Run workflow). It repeats the checks, optionally applies D1 migrations, deploys with the commit SHA as the version message, then smoke-tests `/api/health` and the CSP header.
  One-time setup in GitHub → Settings:
  1. *Secrets and variables → Actions*: add `CLOUDFLARE_API_TOKEN` (Cloudflare dashboard → My Profile → API Tokens → "Edit Cloudflare Workers" template, plus **Account → D1 → Edit**) and `CLOUDFLARE_ACCOUNT_ID`.
  2. *Environments*: create `production`, add yourself as a required reviewer so a deploy needs an approval click.

### Migrations

SQL files live in `migrations/` and are applied in order by `wrangler d1 migrations apply`. Rules:
- Only **additive** changes in a release (new tables/columns with defaults). Drop or rename columns in a later release, after the code that used them is gone — this keeps `wrangler rollback` safe because old code still works with the new schema.
- Check what is pending: `npx wrangler d1 migrations list wonderlab --env production --remote`.

## 2. Rollback

Code (instant, does not touch data):

```bash
npx wrangler deployments list --env production      # find the previous good version id
npx wrangler rollback <version-id> --env production --message "rollback: <reason>"
curl -s https://learn.maheshglance.com/api/health    # confirm commit/deployment changed back
```

or Cloudflare dashboard → Workers & Pages → wonderlab → Deployments → "Rollback". Static assets roll back together with the Worker version. Open tabs pick up the old version on next navigation (the app reloads itself once if a lazy chunk is missing).

D1 is **not** rolled back by `wrangler rollback`. If a migration or bug damaged data, restore with Time Travel (§3).

## 3. Database backups and restore

### Point-in-time (Time Travel) — first choice

D1 keeps 30 days of history (Workers Paid; 7 days on Free).

```bash
npx wrangler d1 time-travel info wonderlab --env production                       # current bookmark
npx wrangler d1 time-travel info wonderlab --env production --timestamp 2026-11-09T10:00:00Z
npx wrangler d1 time-travel restore wonderlab --env production --timestamp 2026-11-09T10:00:00Z
```

A restore replaces the whole database and prints the bookmark to undo it (`... restore --bookmark <previous>`). Put the app in a quiet moment first; writes made after the chosen time are lost.

### SQL exports — off-site copies

```bash
npm run db:backup                 # → backups/wonderlab-production-<timestamp>.sql
npm run db:backup -- --local      # local dev database
```

`backups/` is gitignored. Exports contain family data (usernames, emails, password/answer **hashes**, learner progress, artworks): keep them in encrypted storage, never in the repo, chat or email, and delete copies older than your retention period (suggested: weekly export, keep 8).

Restore an export into a **new** database (safer than overwriting):

```bash
npx wrangler d1 create wonderlab-restore
npx wrangler d1 execute wonderlab-restore --remote --file backups/wonderlab-production-<ts>.sql
# verify, then point env.production.d1_databases[0].database_id in wrangler.jsonc at it and deploy
```

## 4. Secrets and configuration

| Name | Kind | Set with |
|---|---|---|
| `RESEND_API_KEY` | secret (optional, email delivery) | `npx wrangler secret put RESEND_API_KEY --env production` |
| `APP_ENV`, `APP_ORIGIN`, `SESSION_*`, `SHARED_IDLE_MIN`, `EMAIL_FROM` | vars | `wrangler.jsonc` → `env.production.vars`, then deploy |
| `TTS_ENABLED` | var | set to `"false"` to switch natural narration off (cost control); the app falls back to device voices |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secrets | GitHub repo settings (deploy workflow only) |

List secrets: `npx wrangler secret list --env production`. Never put secrets in `wrangler.jsonc`, `.dev.vars.example` or the repo. Local secrets go in `.dev.vars` (gitignored). Rotate the API token if anyone who had it leaves, and after any suspected leak.

## 5. Monitoring

- **Health**: `GET /api/health` → 200 with `checks.db = "ok"`, or **503** when D1 is unreachable. Point an uptime monitor at it (e.g. Cloudflare Health Checks, UptimeRobot) every 1–5 minutes.
- **Logs (live)**: `npx wrangler tail --env production --format pretty` (add `--status error` for failures only).
- **Logs (history)**: Workers observability is enabled (`observability.enabled` in `wrangler.jsonc`). Dashboard → Workers & Pages → wonderlab → **Observability / Logs**. Useful queries:
  - `type = "client-error"` — browser crashes reported by the app (message, scrubbed stack, route, build version; no names or ids).
  - `health: D1 check failed`, `tts failed` — server-side errors (`console.error`).
- **Metrics**: dashboard → wonderlab → Metrics (requests, errors, CPU time); D1 → wonderlab → Metrics (queries, rows read/written, storage); AI → Workers AI usage for TTS cost.
- **Housekeeping**: `rate_limits` and `sessions` rows accumulate. Monthly:
  ```bash
  npx wrangler d1 execute wonderlab --env production --remote --command "DELETE FROM rate_limits WHERE window_start < unixepoch() - 86400; DELETE FROM sessions WHERE expires_at < unixepoch() - 86400*7;"
  ```

## 6. Security headers

- Static responses (HTML, JS, CSS, icons) get headers from `public/_headers` (copied to `dist/`): strict CSP (`script-src 'self'`; Google Fonts are the only third-party origins), `frame-ancestors 'none'`, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy (camera, microphone, geolocation, payment… off), COOP.
- `/api/*` responses get theirs in `worker/index.ts` (no-store, nosniff, DENY framing, HSTS, `default-src 'none'` CSP), plus the CSRF check (custom `X-WonderLab: 1` header + same-origin `Origin`) and a 5 MB body limit.
- Check after a deploy: `curl -sI https://learn.maheshglance.com/ | grep -iE "content-security|strict-transport|x-frame"`.
- If a new feature needs another origin (fonts, images, audio, an API), add it to the matching CSP directive in `public/_headers` and test with `npm start` (production build under the real headers) and the browser console open — CSP violations show there.

## 7. Incident response

1. **Assess**: `curl -s https://learn.maheshglance.com/api/health`; `npx wrangler tail --env production --status error`; dashboard metrics. Note the start time (UTC).
2. **Bad release?** Roll back the code immediately (§2) — it is instant and safe with additive migrations. Then debug on a branch.
3. **Data damaged?** Stop writes if needed (roll back to a version that does not cause the damage), then Time Travel restore to just before the incident (§3). Record the undo bookmark.
4. **Suspected account compromise / data exposure**: revoke sessions for affected accounts
   `npx wrangler d1 execute wonderlab --env production --remote --command "UPDATE sessions SET revoked_at = unixepoch() WHERE account_id = '<id>' AND revoked_at IS NULL"`;
   rotate secrets (`wrangler secret put …`, new Cloudflare API token); review `audit_log` for the account. Children's data is involved: inform affected parents and follow applicable data-protection rules (e.g. India DPDP Act) about notification timelines.
5. **Cost spike (TTS)**: set `TTS_ENABLED` to `"false"` in `wrangler.jsonc` production vars and deploy; narration falls back to device voices.
6. **Abuse / attack traffic**: Cloudflare dashboard → Security → WAF rate-limiting rules for `/api/auth/*`; app-level limits already exist in D1.
7. **Afterwards**: write a short note (what happened, impact, timeline, fix, follow-ups) in `docs/` or the issue tracker.
