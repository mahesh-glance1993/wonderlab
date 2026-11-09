# WonderLab — verification report

Date: 2026-11-09 · Live: https://learn.maheshglance.com (Cloudflare Workers + D1, production)

## Automated results (final build)

| Check | Command | Result |
|---|---|---|
| Type check (app) | `tsc -p tsconfig.app.json --noEmit` | 0 errors |
| Type check (API) | `tsc -p tsconfig.worker.json` | 0 errors |
| Lint | `eslint .` | 0 errors, 44 warnings (react-refresh export hints, hook-deps hints) |
| Unit + content tests | `vitest run` | **287 / 287 passed** (8 files) |
| Production build | `vite build` | succeeded |
| API journeys | `node tests/e2e/run.mjs` | **45 / 45 passed** |
| Browser journeys (Edge, headless) | `node tests/e2e/browser.mjs` | **44 / 44 passed** |

Unit test files: shared grading/mastery/recommendation (40), curriculum content (65), lesson workspace (37), Physics Lab (34), games (30), Art Studio (32), Play & Learn (25), language courses (24).

## Required journeys

| Journey | Status | Evidence |
|---|---|---|
| Parent creates account + two learner profiles, reopens on trusted device, resumes correct learner | ✅ | API + browser journeys (persistent HttpOnly cookie; new page resumes "Hi Arjun!") |
| Password reset via email link + security answer, and via recovery code + security answer; earlier sessions revoked; security answer alone cannot reset | ✅ | API journeys (local outbox for email). Production email needs a provider key — see Pending |
| Nursery: spoken/counting activity + tracing a shape | ✅ / ✅* | Browser journey (counting by tapping, no typing); tracing verified by the Art Studio browser harness (traced "L" scored 3 stars) |
| Class 5 resumes a fraction exercise after refresh | ✅ | Browser journey (same question after reload) + lesson unit test |
| Class 10 solves a physics problem with units and verifies it in a simulation | ✅ | Browser journey (Ohm's law item → Circuit Lab preset "Checking your answer"); content tests grade units/mA/missing-unit |
| Telugu instructions, language switch, narration replay, written equivalents | ✅ (text) / ⚠ (voice) | Browser journey (Telugu UI switch). Telugu speech depends on the device having a Telugu voice; falls back to English audio with Telugu text shown |
| All eight games playable, completable, restartable | ✅ | Browser journey loads all 8 with restart/new controls; generator tests across 150 seeds × 5 levels; games team played them in a browser |
| Reduced motion, text size, mute persist | ✅ | Browser journey (persist after reload) + API (profile prefs) |
| Draw with simulated pressure, manual intensity, bounded fill, layered project save/reopen, undo earlier edit, PNG export | ✅* | Art Studio browser harness (synthetic pen events, manual intensity indicator, bounded cat fill, reload + undo, gallery duplicate) + 32 unit tests |
| Downloaded lesson + artwork draft survive browser restart offline and sync on reconnect; repeated sync consistent | ✅ partial | Idempotent attempts / last-writer-wins / artwork conflict-keeps-both verified by API journeys; IndexedDB queue + service worker implemented. Full offline-restart browser run not yet automated |
| Profile isolation, account isolation, role permissions, parent verification under URL/API tampering | ✅ | API journeys (404 for other family's profiles, 403 editor for parents, verification required) + browser tampering checks |
| Educator corrects, previews, publishes, rolls back; old attempts keep original version | ✅ | API journeys (draft → validate → publish, publisher recorded, rollback, historical version fetch) |
| Keyboard, screen-reader labels, fullscreen entry/exit, rotation, touch, responsive | ✅ partial | Browser journey (keyboard focus, no sideways scroll on phone portrait/landscape/tablet); keep-full-screen re-entry implemented |

`*` verified in the module team's own browser harness with a mocked API, not in the shared journey script.

## Pending — needs a human, a device or credentials

1. **Educator review of curriculum** — every unit is `educator: 'pending'`. Syllabus mapping: only Joyful Mathematics 1–2 confirmed from an official NCERT listing; others from secondary listings or prior knowledge (`docs/CURRICULUM_COVERAGE.md`). Use `docs/REVIEW_CHECKLIST.md`.
2. **Native-speaker review of all Telugu** (UI, maths N–Class 3, Play & Learn, Telugu course, glossary) — see `docs/LANGUAGE_COURSES.md` for specific items (rare-letter picture words, లింగాలు terminology, సంధి/సమాస examples).
3. **Telugu narration audio** — most Windows/Chrome devices have no Telugu voice. Record or generate clips and list them in `public/audio/te/manifest.json` (already supported).
4. **Production email** — set `RESEND_API_KEY` (`npx wrangler secret put RESEND_API_KEY --env production`) and verify the sending domain. Until then recovery works with recovery codes.
5. **Physical devices** — Windows Chrome, iPhone 15 Pro Safari, OnePlus 9R Chrome not yet tested by hand; Safari untested entirely.
6. **Real stylus pressure** — tested only with simulated pointer events; test on Apple Pencil / S-Pen / Wacom / Surface Pen and record device + browser here.
7. **Offline restart journey** — run manually: download a pack, go offline, close the browser, reopen, do a lesson and a drawing, reconnect, confirm sync.
8. **Production educator account** — sign up, then grant role with `wrangler d1 execute wonderlab --env production --remote --command "UPDATE accounts SET role='educator' WHERE username='…'"`.

## Physical-device / stylus log

| Date | Device | Browser | Tester | Result |
|---|---|---|---|---|
| — | — | — | — | not yet run |
