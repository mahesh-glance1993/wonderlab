# WonderLab — offline operation

Offline use is a release feature: after a first online sign-in, a trusted device keeps working without internet — including after the tab is closed, the browser restarted, or the app URL reopened — and syncs exactly once when it is back online.

## Design

| Part | File | Role |
|---|---|---|
| Pack/shell manifest | `vite.config.ts` (`packsManifest`) | After the bundle is written, emits `dist/packs.json` `{v:2, build, entry, shell, fonts, packs[{id, files, bytes, version}]}` and `dist/shell.json`. A **pack** = chunks matching the pack's module patterns + their static imports/CSS/assets. The **shell** = entry closure + **every file that belongs to no pack** (lazy route screens: Home, profile picker, Curriculum, Next, Progress, Parent, Setup, Downloads, Auth, Editor…). The build fails if any emitted asset is in neither, so no route can need a chunk that was never downloaded. |
| Download manager | `src/features/downloads/manager.ts`, `plan.ts` | Downloads the shell, the page (`/__wl/index.html`, checked to reference this build's entry), packs and Google Fonts (latin, latin-ext, telugu subsets) into `wl-build-<buildId>`. Each unit is **verified with `cache.match` for every file** before it is marked installed; failed items get one automatic second pass before the user is asked to Retry. Progress (item, items done/remaining, bytes, errors) is published to the UI. The job is persisted in IndexedDB (`pk:job`); reopening, reconnecting or Retry **resumes** and skips files already cached. Requests `navigator.storage.persist()`. Detects evicted files on start and marks those packs as needing download again. |
| Updates | same | A new deploy is **staged** into a new `wl-build-<newBuild>` cache (unchanged hashed files copied from the old cache). `/__wl/ready` (cache `wl-meta`) is switched only after the whole set verified; old build caches are then deleted. On failure or quota error the old build stays in use and the partial new cache is dropped (quota) with a clear message. |
| Service worker | `public/sw.js` | Network-first navigations (6 s timeout); offline → the verified build's page, else the last page seen online. Same-origin assets and fonts cache-first across `wl-*` caches (an opaque no-cors copy is never used to answer a CORS request). `/api/*` private responses are never cached. `/api/content/overrides` (public published corrections) network-first with cached fallback so offline content shows the same content version. `/api/tts` narration cache bounded to 300 entries (LRU). Never touches IndexedDB → pending work survives SW/app updates. Fully within the production CSP (same-origin + Google Fonts hosts). |
| Offline entitlement | `src/lib/offline.ts` | See below. |
| App state | `src/lib/app.tsx` | Offline start via the entitlement; renews it after each successful `/auth/me` for the same account; offline snapshots of account + every authorised learner's state (stored only while offline use is on); blocks with a clear screen when offline use is off/expired; sign-out and "remove this device's data" purges. |
| Sync | `src/lib/sync.ts` | Only one flush runs at a time (guard taken before any await). Edits that continue on an artwork that already conflicted are moved into the preserved copy (`artr:` record) instead of creating more copies. Upload gate: private changes are uploaded only after the server confirmed a session **for the same account** (`uploadDecision`). Reconnect (`online`), app brought to foreground and Retry call the registered revalidator (`GET /api/auth/me`) first. A 401 during upload pauses sync and keeps everything. |
| UI | `src/features/downloads/OfflineBar.tsx`, `index.tsx`, `src/features/home/ProfilePicker.tsx` | Global bar: automatic first download + progress, mobile-data / low-storage confirmation (full or lessons-only), "Offline · saved on this device" + items awaiting sync, "Download required" for parts not downloaded, "Sign in as <user> to upload". Downloads screen: status/"Ready offline", learners available offline, offline-window toggle (parent check), per-pack download/update/remove, storage + persistence, eviction warning, "Remove this device's data". |
| Server | `worker/learner.ts` | Artwork PUT made idempotent: a retried save whose first response was lost (same title+data already at a newer version) returns success instead of creating a conflict copy; a retried *conflicting* save returns the already-created copy. Attempts (`INSERT OR IGNORE` by client UUID, original `questionVersion`), lesson/activity state (last-writer-wins) and rewards were already idempotent. |

### What a class pack contains
`packsForClass(level)` = every pack whose class levels include the learner: that class's lessons (practice templates, local grading, hints, tests, scratchpad code), games, Physics Lab simulations (Class 3+), Art Studio (painting, tracing, colouring templates), Play & Learn (Nursery–UKG), Telugu/English courses, Telugu narration manifest; plus the shell and fonts. Icons/illustrations are inline SVG/emoji in the bundles.

### First online setup
After online sign-in on a **trusted** session (`keep me signed in`), the bar downloads the shell + the active learner's class, then the other learners' classes (each available as soon as it verifies). On `saveData`/`cellular` connections or when free storage < 1.5× the download + 20 MB, it asks first (download all / lessons only / not now). Shared-device sessions do not auto-download. **"Ready offline"** is shown only when: shell + every required pack verified in Cache Storage for the ready build, the offline window is on, and the account + learner snapshots exist in IndexedDB.

## Offline entitlement (the offline window)

A record in IndexedDB at `ent:<accountId>`:

```
{ v:1, accountId, username, deviceId, profileIds[], days, enabledAt, lastVerifiedAt, expiresAt, sharedSession }
```

* **Local permission only.** No session token, password, cookie or secret. The server session stays in the HttpOnly cookie; the entitlement can only unlock data already on this device and can never authorise an upload.
* **Bound** to a random per-browser device id (`meta:deviceId`, `crypto.randomUUID`), one account, and the account's profile ids (refreshed at each online check).
* **Time-limited:** default **14 days**, parent-selectable 3/7/14/30 (clamped 1–30), measured from the **last successful online check** (sliding; renewed on every `/auth/me` for the same account). A clock moved more than a day before the last check counts as expired.
* **Parent-controlled:** off by default; turned on in Downloads after the parent password check (10-minute verification window), with an explanation of what it does. On shared-device sessions it stays off unless a parent explicitly turns it on (warned).
* **When expired / not enabled and offline:** the app shows "Please connect to the internet" (no learner data), keeps pending work, and states how many items are waiting. Online with a valid session renews it.
* **Session expired while the entitlement is valid:** learning continues locally; sync pauses and the bar asks a parent to sign in as the same username. A different account signing in never sees, counts or uploads the first account's work (all keys are `…:<accountId>:<profileId>:…`).

## Online-only actions
Sign-in, sign-up, password/username recovery, parent verification, account/session administration, recovery codes, export/deletion, adding/editing learners, the content editor and publishing all call the API; offline they show "You seem to be offline" / "Parent settings need an internet connection", and the parent gate is disabled offline.

## Local data, sign-out and removal
* Private IndexedDB keys: `q:` (queued attempts/state/rewards), `art:` (drafts), `snap:` (offline snapshots), `dl:`, `ent:` — all scoped by account (and profile). Device-level non-private keys: `meta:deviceId`, `meta:lastAccount`, `pk:installed`, `pk:job`.
* Sign-out flushes first; if work is still unsynced the parent is warned and must confirm. Completed sign-out removes that account's private keys (incl. entitlement and snapshots) and any `wl-private*`/legacy per-account caches. Static packs (not private) and the TTS cache stay.
* "Remove this device's data" (Downloads, parent check): warns about unsynced items for every account, then removes all private keys, all `wl-*` caches except TTS, and signs out.
* **Browser data clearing / eviction:** clearing site data, uninstalling the browser or storage pressure can delete packs **and unsynced work**. The Downloads screen states this, requests persistent storage, and re-verifies packs on each start.

## Limitations
* If a new version is deployed while a device is online, the open tab runs the new build while the new pack set is still being staged; going offline before staging finishes means some screens of the *new* build are not cached in that tab — the bar shows "Download required" with **Reload**, which opens the last verified build.
* Offline narration uses the device's speech voices; generated natural-voice sentences are available offline only if they were played before (TTS cache).
* Google Fonts subsets other than latin/latin-ext/telugu fall back to system fonts offline.
* The offline window is enforced on the device; a person with full control of the browser profile (dev tools) can read or alter local IndexedDB. It only exposes data already on that device and grants no server access.
* "Ready offline" requires the parent to turn on the offline window; a trusted device without it still downloads packs (usable offline while the tab stays signed in) but will not open offline after a restart.
* Not tested on Safari/iOS (storage quotas and eviction there are stricter).

## Test results (2026-11-10, local production build + wrangler dev, Edge headless)

| Check | Command | Result |
|---|---|---|
| Type check (app) | `npx tsc -p tsconfig.app.json --noEmit` | 0 errors |
| Type check (API) | `npx tsc -p tsconfig.worker.json` | 0 errors |
| Lint | `npx eslint .` | 0 errors, 63 warnings (react-refresh export / hook-deps hints) |
| Unit tests | `npx vitest run` | **393 / 393 passed** (12 files), including `tests/offline.test.ts` (23 tests): entitlement window, expiry, clock rollback, device and account binding, data scoping and purge, upload gate, sync pause on 401, revalidate-then-upload exactly once, cross-account isolation, concurrent-flush race, post-conflict redirect, pack planning, readiness, metered/low-storage precheck, font subsets |
| Production build | `npm run build` | succeeded (the build fails if any emitted asset is in neither the shell nor a pack) |
| Offline journeys | `node tests/e2e/offline.mjs http://127.0.0.1:<port>` | **43 / 43 passed** (final run) |

How it was run: `npm run build`; `npx wrangler dev --port <free port> --ip 127.0.0.1` serving that build; `npx wrangler d1 execute wonderlab --local --command "DELETE FROM rate_limits"`; then the script. Other work kept rebuilding `dist/` during this session, so the final runs served a frozen copy of `dist/` through a temporary wrangler config with the same worker and local D1.

Final offline e2e output:

| Result | Journey step |
|---|---|
| PASS | Automatic download starts after first online sign-in on a trusted device (progress shown) |
| PASS | Downloads explains the offline window to the parent |
| PASS | "Ready offline" shown after every required file was verified in Cache Storage |
| PASS | All 55 shell + Class 5 pack files are in the verified build cache |
| PASS | Offline entitlement stored in IndexedDB: 14 days, device-bound, no credentials |
| PASS | No tokens or passwords in localStorage |
| PASS | Offline: reopening the app URL in a fresh page resumes the last authorised learner |
| PASS | Offline status "Offline · saved on this device" shown |
| PASS | Offline profile picker lists the authorised learners |
| PASS | Offline: all 29 routes open from the downloaded build with no missing chunk |
| PASS | Offline: no failed asset/chunk requests |
| PASS | Offline: answered a downloaded lesson item; graded locally with feedback |
| PASS | Offline: completed a game round (attempt saved on device) |
| PASS | Offline: Circuit Lab simulation runs (switch toggles the circuit) |
| PASS | Offline: painting saved as a local draft (pending upload) |
| PASS | Offline: painting exported as PNG (≈37 KB) |
| PASS | Offline reload: painting is still in the gallery (on this device) |
| PASS | Offline reload: painting reopens in the studio |
| PASS | Offline reload: 6 queued items persisted |
| PASS | Offline: count of items awaiting sync shown |
| PASS | Back online: queue flushed after the session was revalidated |
| PASS | Server recorded exactly the 2 offline attempts |
| PASS | Retrying the same attempts is a no-op (idempotent) |
| PASS | Artwork uploaded once |
| PASS | Retrying the same artwork save (lost response) creates no duplicate/conflict copy |
| PASS | Lesson/activity state saved offline was uploaded |
| PASS | Artwork conflict keeps both versions (original + "other device" copy) — exactly 2 artworks |
| PASS | Conflict: learner is told both versions were kept |
| PASS | Offline: another lesson attempt saved before the session expires |
| PASS | Expired session: sync pauses and asks a parent to sign in to the same account |
| PASS | Expired session: pending work kept on the device |
| PASS | Different account signs in: the other family's learners and pending work are not shown |
| PASS | Different account: nothing of the first account was uploaded |
| PASS | Different account: first account's pending work still kept, scoped to it |
| PASS | Same account signs in again: paused work uploads exactly once |
| PASS | Offline entitlement kept for the same account after re-sign-in |
| PASS | Expired offline window: app asks for online re-verification instead of opening |
| PASS | Expired offline window: no learner data shown |
| PASS | Back online with a valid session: offline window renewed (14 days) |
| PASS | Sign-out warns about work not yet uploaded |
| PASS | Completed sign-out purges this account's private local data (queue, drafts, snapshots, entitlement) |
| PASS | Interrupted download resumes on reopen and skips cached files (31 cached before the tab closed, 27 fetched after, 71 total) |
| PASS | Resumed download completes and is verified |

Bugs these runs found, all now fixed:
1. Lazy route screens (Home, profile picker, Curriculum…) were not cached. The shell now includes every file that is not in a pack.
2. `flush()` could run twice at once, because its guard was set after an `await`. This created duplicate artwork conflict copies.
3. An open studio kept saving the conflicted original, creating more copies. Those saves now go to the preserved copy.
4. The service worker answered the downloader's CORS font request with an opaque cached copy, so fonts failed to download.
5. When an artwork save's response was lost, the retry created a spurious conflict copy. The server now treats that retry as idempotent.

Earlier runs before those fixes scored 28/30, 34/37, 39/40 and 42/43. The failures were the bugs above plus test-script issues.

Not run here:
- the existing `tests/e2e/browser.mjs` and `run.mjs` suites;
- real devices, including Safari/iOS;
- real mobile-data and low-storage conditions. The prompts are unit-tested and shown in the UI, but this browser run did not trigger them.
