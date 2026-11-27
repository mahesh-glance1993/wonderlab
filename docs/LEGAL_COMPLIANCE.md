# WonderLab — legal and licence compliance checklist (India launch)

> **This is not legal advice.** It is an engineering audit written from the code in this repository (as of
> `ios-multiplatform` @ e303d81, November 2026) to help the owner prepare. It was not written by a lawyer and may be
> incomplete or out of date. Before public launch, a **qualified Indian lawyer** (data protection / IT law) must review
> the product, the privacy policy and terms, and a **Chartered Accountant (CA)** must advise on tax, GST and invoicing
> before any money is accepted. Statutes and rules (especially the DPDP Rules, 2025, which phase in over 12–18 months)
> must be checked against their current text at the time of launch.

Legend for **Who**: **code** = change in this repo · **owner** = business/operational task · **lawyer** · **CA**.
Status: ✅ done · 🟡 partly done · ❌ missing.

---

## 0. Highest-risk items (do these first)

| # | Risk | Status | Who |
|---|------|--------|-----|
| 1 | **No verifiable parental consent, privacy notice or terms** in the product yet. Sign-up (`worker/auth.ts` `/register`) creates a parent account and child profiles without a consent record, notice, or age/parent confirmation. DPDP Act s.9 requires verifiable consent of a parent before processing a child's (under-18) data. Being built in parallel (`/privacy`, `/terms`, migration 0002) — see §1 for requirements. | ❌ | code + lawyer |
| 2 | **No grievance / contact details published** (no email, no grievance officer, no address anywhere in `src/` or the apps). Needed under DPDP (s.8(10), Rules), IT Rules 2021 r.3(2) and Consumer Protection (E-commerce) Rules once paid. | ❌ | owner + code |
| 3 | **Child nickname sent to the TTS service and logged.** `src/features/home/ProfilePicker.tsx` speaks `Hi ${p.nickname}!`, which `src/lib/audio.ts` sends as a GET query string to `/api/tts` → Cloudflare Workers AI (Deepgram Aura-2). The text is in the URL (Workers observability logs are on in `wrangler.jsonc`) and the audio is cached edge-wide by text hash. Fix: speak names with the on-device voice only (or omit the name), and/or switch `/api/tts` to POST; disclose Workers AI as a processor. | ❌ | code |
| 4 | **One photo with incomplete attribution**: `bell` (CC BY 4.0, author "Unknown", source `File:Gong_(AM_1964.50-1).jpg`, apparently an Auckland Museum item). CC BY requires crediting the creator/attribution party named on the source page. Look up the correct attribution on Commons and fix `scripts/photo-picks.json` + rebuild, or replace the photo. | ❌ | owner/code |
| 5 | **"No tracking" claim vs. Google Fonts.** `index.html` loads fonts from `fonts.googleapis.com` / `fonts.gstatic.com`, which sends every visitor's IP and user-agent to Google. Either self-host the four fonts (the same TTF files already ship in the apps) or disclose Google as a recipient. Self-hosting is the cleaner fix (also simplifies the CSP in `public/_headers` and `public/sw.js`). **Done:** fonts self-hosted in `public/fonts` (unmodified, `OFL.txt`), Google Fonts links and CSP hosts removed, fonts in the offline shell. | ✅ | code |
| 6 | **Name "WonderLab" not cleared.** The name is widely used by others (e.g. museum galleries and other education brands abroad). Run an Indian trademark search (IP India public search, classes 9, 16, 28, 41, 42) and consider filing before marketing spend. Also check the domain/brand for passing-off risk. | ❌ | lawyer/owner |
| 7 | **No statement of independence from SCERT/Government.** The UI labels syllabi "Telangana (SCERT)" and shows textbook names and chapter numbers (`src/features/home/Curriculum.tsx`). That is fine as factual reference, but add a visible line (landing page, `/terms`, About): *"WonderLab is an independent project. It follows the Telangana SCERT syllabus but is not affiliated with, approved or endorsed by SCERT Telangana, the Government of Telangana, NCERT or CBSE."* No code/content currently claims endorsement (see §5). **Landing + /get-app footer: done** (English + Telugu); /terms and About still to add. | 🟡 | code (terms owner) |
| 8 | **Password-reset emails can be stored in plaintext in production.** `worker/lib.ts` `sendEmail` writes the message (including the reset link) to the `outbox` table when `RESEND_API_KEY` is missing, and account deletion does not delete `outbox` rows. Make sure the key is set in production, stop writing to `outbox` in production, and purge old rows. | 🟡 | code + owner |

---

## 1. Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025

The users are children (Nursery–Class 10) and their parents, so WonderLab is a Data Fiduciary processing
children's personal data. Most obligations apply on the Rules' phased commencement dates — check the current dates.

| Requirement | Status in code today (evidence) | Missing | Who |
|---|---|---|---|
| **Notice** (s.5; Rules: standalone, plain language, itemised data + purposes, how to withdraw consent, how to complain to the Board; English plus Eighth-Schedule languages on request — offer Telugu) | 🟡 Short statements: `src/features/auth/index.tsx:118`, `src/features/parent/index.tsx:244`, Android `SignUpScreen.kt:183`. They under-describe what is stored (they omit learning attempts, mastery, artworks, notes, sessions/device labels, IP-based rate-limit keys, audit log, TTS text). | Full privacy notice at `/privacy` (being built) shown **before** sign-up, in English and Telugu; list every data item from `migrations/0001_init.sql`, purposes, processors (Cloudflare D1/Workers/Workers AI, Resend email, Google Fonts unless self-hosted), retention, rights, grievance contact, DPB complaint route. | code + lawyer |
| **Verifiable parental consent for children** (s.9(1); Rules: verify the person is an identifiable adult, e.g. via existing reliable identity details or a virtual token/DigiLocker-type service) | ❌ `/register` has no consent capture; the account is labelled "parent" but adulthood is never checked or recorded. | Consent checkbox(es) + timestamped consent record (who, when, notice version) in migration 0002; a proportionate adult-verification step agreed with the lawyer (the Rules' illustrations allow relying on identity details already held or a token from an authorised entity — confirm what is "verifiable" for a free product). Child profiles creatable only after consent. | code + lawyer |
| **No tracking, behavioural monitoring or targeted advertising directed at children** (s.9(3)) | ✅ No analytics SDKs, ads or trackers found (searched `src/`, `worker/`, `android/`, `public/`, `index.html`). Progress tracking (`attempts`, `mastery`) is for the learner's own education. 🟡 Google Fonts (see §0 #5). | Self-host fonts. Keep "no analytics" as a rule; if any analytics is added later, it must be aggregate, cookieless and not child-level. Ask the lawyer whether adaptive "What next?" recommendations based on mastery count as "behavioural monitoring" (likely not, as educational, but document the reasoning; educational-institution exemptions in the Rules may not cover a consumer app). | code + lawyer |
| **No processing likely to cause detrimental effect on a child** (s.9(2)) | ✅ No chat, no public profiles, no leaderboards (`src/features/games/ui.ts:17`), no social sharing found. | Keep it that way; note in terms. | owner |
| **Consent withdrawal as easy as giving it** (s.6(4)) | 🟡 Account deletion exists (`worker/auth.ts` `DELETE /api/account`, typed-username confirm); profile deletion exists (`worker/learner.ts`). | A clear "Withdraw consent" path (= delete account / stop processing) linked from the privacy notice and parent area; explain consequences. | code |
| **Data principal rights**: access/summary (s.11), correction & erasure (s.12), grievance redressal (s.13), nominate (s.14) | 🟡 Export (`GET /api/account/export`) and edit/delete exist. Gaps: export omits `activity_state`, `downloads`, `sessions`, `reports`, `audit_log`; erasure leaves `audit_log` rows (with `account_id`), `outbox` rows (email addresses) and `rate_limits` keys; deleted data persists in backups (`docs/OPERATIONS.md` §3). | Extend export; on account deletion also delete/anonymise `audit_log`, `outbox`, matching `rate_limits`; document backup retention ("deleted from backups within N days"). Publish how to nominate another person. Respond to requests within the time the Rules set (grievances: within 90 days max — aim far lower). | code + owner |
| **Retention and erasure when purpose ends** (s.8(7); Rules: erase after the prescribed inactivity period with 48-hour prior notice for specified classes of fiduciaries) | ❌ No scheduled purge: no cron in `wrangler.jsonc`, sessions/rate limits/audit log/outbox grow forever. | A Worker cron that deletes expired sessions, tokens, rate-limit rows, old outbox and audit entries, and (policy decision) dormant accounts after e.g. 3 years with an email warning. Keep logs needed for security for the period the Rules require (the Rules require retaining certain processing logs for at least one year — confirm). | code + lawyer |
| **Reasonable security safeguards** (s.8(5); Rules: encryption, access control, logging, backups) | ✅ Hashed passwords/answers/session tokens, rate limits, CSP and security headers (`public/_headers`), parent re-verification window, audit log. 🟡 `backups/` exports are plaintext SQL. | Encrypt backups at rest; restrict Cloudflare account access (2FA, least privilege); write down the security measures for the lawyer. | owner |
| **Personal data breach notification** to the Data Protection Board **and** each affected user (s.8(6); Rules: without delay, then a detailed report within 72 hours) | ❌ No incident-response procedure. | Add an incident runbook to `docs/OPERATIONS.md`: detect → contain → notify Board (online form) and parents by email → 72-hour report. Keep contact emails current. | owner + code |
| **Processors / cross-border transfer** (s.8(2), s.16) | 🟡 Data sits with Cloudflare (D1, Workers, Workers AI), Resend (email, US) and Google (fonts). | Accept the processors' DPAs; list them in the notice; check none are in a restricted country list notified under s.16. | owner + lawyer |
| **Grievance contact / DPO** (s.8(10); Rules: publish contact of a person who can answer questions) | ❌ None published. | Publish an email (e.g. privacy@ / grievance@ your domain) and name in `/privacy`, `/terms`, app parent area and app store listings. Significant Data Fiduciary duties (DPO in India, DPIA, audit) apply only if notified — unlikely now, but children's data is a factor; ask the lawyer. | owner |

## 2. Information Technology Act, 2000 and IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021

WonderLab mostly publishes its own content, but parents can submit free-text content reports (`reports` table) and
learners create artworks/notes, so treat it as an intermediary for safe-harbour purposes.

| Requirement | Status | Missing | Who |
|---|---|---|---|
| Publish terms of use, privacy policy and user agreement prominently (r.3(1)(a)), in English or any Eighth-Schedule language | ❌ (being built: `/terms`, `/privacy`) | Include the r.3(1)(b) prohibited-content list in plain language; Telugu version. | code + lawyer |
| Grievance officer name and contact; acknowledge complaints within 24 hours, resolve within 15 days; take down certain content within 24/72 hours (r.3(2)) | ❌ | Publish the grievance officer (can be the owner) + email; add an internal SLA to `docs/OPERATIONS.md`. | owner |
| Content takedown / moderation process | 🟡 Editor workflow for reports exists (`worker/content.ts` `/admin/reports`, status field). | Write the takedown process (who reviews, timelines, records kept). Users cannot publish to others, which keeps risk low. | owner |
| Reasonable security practices (s.43A / SPDI Rules 2011 — being replaced by DPDP) | ✅ see §1 security | — | — |
| Cooperate with lawful requests (r.3(1)(j)) | ❌ | One-paragraph procedure in operations doc. | owner |

## 3. Consumer protection, payments and tax (only once money is involved)

The product is free today. A UPI "support" page and a schools leads form are being built (migration 0003).

| Item | Status | Missing | Who |
|---|---|---|---|
| Consumer Protection (E-commerce) Rules, 2020 — if any paid plan/school fee: seller name, address, contact, grievance officer, refund/cancellation policy, price incl. taxes, no dark patterns (also CCPA Dark Patterns Guidelines 2023) | ❌ | Add before any paid offering. Do not use pressure tactics on children; payments only from the parent area. | code + lawyer |
| GST registration and invoicing for school fees / paid plans (threshold-based; online services may need registration regardless — ask a CA) | ❌ | CA advice before the first paid invoice; GST-compliant invoices. | CA |
| UPI "donations"/support | ❌ advice | Voluntary payments to an individual or proprietorship are **not** tax-deductible donations and may be taxable income; do not call them "donations" unless a registered trust/Section 8 company with 80G receives them. Avoid implying charity status. Keep records. | CA + lawyer |
| Payment data | — | Never store UPI IDs/card data; use a regulated payment gateway if collecting at scale. | code |

## 4. Copyright and third-party asset licences

### 4.1 Bundled assets (audit of this repo)

| Asset group | Count | Source | Licence | Attribution required? | Commercial use OK? | Status |
|---|---|---|---|---|---|---|
| Photos (Class 1–10), `android/shared/src/commonMain/composeResources/files/photos/*.webp` → `public/pictures/photos` | 225 | Wikimedia Commons (picked in `scripts/photo-picks.json`, built by `scripts/fetch-photos.mjs`, licence-filtered by regex) | CC BY-SA 4.0 ×71, CC BY-SA 3.0 ×50 (+1 AU), CC BY 2.0 ×30, Public domain ×21, CC BY-SA 2.0 ×14, CC0 ×13, CC BY 4.0 ×12, CC BY 3.0 ×9 (+1 AU), CC BY-SA 2.5 ×2, CC BY 2.5 ×1 | Yes for all CC BY/BY-SA (title, author, licence link, source, note of changes) | Yes (no NC/ND licences present) | ✅ All 225 have a credit in `credits.json`, shown on `/credits` (web) and Parent → Picture credits (apps), with "may be cropped and resized". ❌ `bell`: CC BY 4.0 but author "Unknown" — fix or replace. Minor: `key` author "Unknown artistUnknown artist" (public domain, cosmetic). BY-SA: the cropped versions must stay under BY-SA — stated in the notices file. Personality/trademark: spot-check that no photo shows an identifiable person or a brand logo prominently. |
| Pre-primary pictures/symbols ("emoji"), `…/files/emoji/*.webp` | 281 + index | Microsoft Fluent Emoji 3D, via `@lobehub/fluent-emoji-3d` (`scripts/build-android-emoji.mjs`) | MIT | Yes — copyright + permission notice must accompany copies | Yes | 🟡 → ✅ The Credits screens only said "(MIT licence)". Added the full MIT notice in `public/third-party-notices.txt` and the app copy `…/files/licenses/third-party-notices.txt`, linked from the web Credits page. Microsoft's name/trademarks must not be used to imply endorsement. |
| System emoji fallback (web, when a picture is missing) | — | Device OS fonts | Rendered by the user's device | No | n/a | ✅ Nothing redistributed. |
| Fonts: Andika (2), Baloo 2, Nunito, Noto Sans Telugu — `…/composeResources/font/*.ttf`; website loads the same families from Google Fonts | 5 files | SIL, EkType, Google Fonts, Noto | SIL OFL 1.1 | Licence must accompany redistributed fonts; it is embedded in each TTF's name table (checked: copyright + OFL in name IDs 0/13/14). Fonts are unmodified, so Reserved Font Names ("Andika", "SIL") are respected. | Yes (cannot sell the fonts by themselves) | ✅ Also listed in the notices file and Credits screens now. |
| UI icons, `src/ui/Icon.tsx` | ~60 paths | Hand-written "Lucide-style" paths; several are identical to Lucide icons | Lucide: ISC (portions MIT, Feather) | ISC notice in copies | Yes | ✅ ISC notice added to the notices file as a precaution. Android uses Material Icons Extended (Apache-2.0). |
| App icon / brand mark (`brand/`, `public/icon*.png|svg`, mipmaps, iOS AppIcon) | ~30 | Original, generated by `scripts/build-icons.mjs` from `brand/icon-source.svg` | Owner's own | No | Yes | ✅ Consider registering the logo with the trademark (§0 #6). |
| Sound effects and nature ambience (`src/lib/sfx.ts`, `src/lib/nature.ts`, Android `feature/early/audio/`) | ~70 sounds | Synthesised in code ("no recorded/copyrighted audio") | Own work | No | Yes | ✅ |
| Narration — English natural voice (`worker/tts.ts`) | on demand | Cloudflare Workers AI, `@cf/deepgram/aura-2-en` | Cloudflare Service Terms / Workers AI model terms | Not normally | Check Cloudflare's Workers AI and Deepgram model terms allow redistributing generated audio inside a product used by children and caching it offline | 🟡 Owner to read the current Cloudflare AI terms; disclose as a processor in the privacy notice. Do not send personal data in TTS text (§0 #3). |
| Narration — Telugu / offline | — | Device speech engines (Web Speech API, Android/iOS TTS) | Device | No | n/a | ✅ `public/audio/te/manifest.json` is empty (no bundled clips). |
| Google Stitch design references, `docs/stitch_references/` (added in e303d81) | 86 files, 19 MB: ~40 `code.html` + `screen.png` mock-ups, `DESIGN.md` files, briefs | Generated by Google Stitch (Google Labs) from WonderLab briefs | Google's generative-AI / Labs terms; the HTML hot-links ~95 AI-generated images on `lh3.googleusercontent.com` and uses Tailwind CDN + Google Fonts | n/a | Internal reference only | 🟡 Not shipped (Vite builds from `src/` and `public/` only; nothing in `src/`, `public/` or the apps references these images or URLs — checked). Risks: the mock-ups contain **AI-generated portraits of fictional named children** ("Ananya Reddy", "Aarav Reddy") and a parent; do **not** reuse these images in the product, store listings or marketing without legal review (realistic synthetic children, Google's terms, and the risk of resembling a real child). The Google-hosted images can disappear; the PNG screenshots are the durable copy. Consider moving the folder out of the public repo if it ever becomes public. Any code copied from Stitch output into `src/` (e.g. `src/ui/AppShell.tsx`) should be treated as AI-generated: check Google's terms on output ownership and that it contains no third-party assets. |

### 4.2 Software dependencies

**npm** (from `package-lock.json` + `node_modules` metadata, ~350 packages): MIT 269, Apache-2.0 37, ISC 13,
LGPL-3.0-or-later 14 (all `@img/sharp-*` libvips binaries), BSD-2/3 8, MIT-or-Apache 4, and one each of CC0-1.0,
BlueOak-1.0.0 (`minimatch`), Python-2.0 (`argparse`), CC-BY-4.0 (`caniuse-lite`), 0BSD (`tslib`). **No GPL/AGPL, no
unknown licences.**

- **Shipped to users** (website bundle / iOS shell): `react`, `react-dom`, `scheduler`, `react-router`,
  `react-router-dom`, `@remix-run/router`, `@capacitor/core`, `@capacitor/ios` — all MIT → notices added. Server-only:
  `hono` (MIT, runs on Cloudflare; no distribution).
- **LGPL `sharp`/libvips** and the other non-MIT licences are **dev/build-time only** (image processing, linting,
  browserslist data) and are not distributed → ✅ no obligation in the shipped product.

**Gradle** (`android/gradle/libs.versions.toml`; licences read from cached POMs in `~/.gradle`): AndroidX, Compose
Multiplatform, Skiko, Kotlin stdlib, kotlinx (coroutines, serialization, io, atomicfu), Ktor, OkHttp/Okio,
`quickjs-kt` (Dokar) — **all Apache-2.0**; QuickJS engine inside quickjs-kt — MIT; JUnit 4 — EPL-1.0 (**tests only**,
not shipped). No GPL. 🟡 Apache-2.0 asks distributors to include the licence text and any `NOTICE` files: the notices
file now lists them, but the best fix is an in-app "Open-source licences" screen generated at build time (e.g. the
AboutLibraries Gradle plugin, which also works for Compose Multiplatform/iOS) — **code**.

## 5. Content and intellectual property

| Check | Result | Who |
|---|---|---|
| SCERT/NCERT textbook text reproduced? | ✅ Spot-checked `src/content/ts/c1–c10` (English, Telugu, Hindi, EVS, science, social). File headers state the policy ("stories and poems are never reproduced… our own words"), lesson notes confirm it (e.g. `ts10.te.ch5` *Nagara Geetam* by Alishetty Prabhakar, still in copyright: "No lines of the poem are reproduced; summary is an original paraphrase"). Only short classical lines (centuries-old, public domain) are quoted for analysis. A lawyer should confirm that **chapter titles + book names** used for alignment (`src/content/ts/books.ts`, generated from `syllabus.json`) are acceptable as factual references (generally yes). Keep the teacher-review process (`docs/TEACHER_REVIEW.md`) checking for copied text. | owner + teacher reviewers |
| SCERT / Government logos or emblems? | ✅ None found in any image or SVG (only Wikimedia photos, Fluent emoji, own icon). | — |
| Implied endorsement? | ✅ No "approved", "endorsed", "official app" claims in UI strings (grep of `src/`, `android/`, `index.html`). "official" appears only in internal code comments and `syllabus.json` metadata (`"status": "official"` = source type). UI wording is "Telangana (SCERT)" syllabus labels — acceptable; prefer "follows the Telangana SCERT syllabus" in marketing. ❌ Add the non-affiliation disclaimer (§0 #7). | code |
| Wikimedia photos of people/places | Use is under the photo's licence; CC does not license personality or trademark rights — avoid using any such photo in marketing. | owner |
| Trademark "WonderLab" | ❌ Search needed (§0 #6). | lawyer |
| AI-generated content | Lesson text and Stitch designs were AI-assisted: the owner should keep human review (already in place for lessons) and check the AI tools' terms for output ownership. | owner |

## 6. App stores (for later)

| Store rule | Notes | Who |
|---|---|---|
| **Google Play Families policy** (target audience includes children) | Must join Families program requirements: Families Self-Certified Ads SDKs only (none used — keep it so), no device identifiers collection from children, a privacy policy URL, Data safety form matching reality (account data, learning progress, artworks, TTS text to Cloudflare), Teacher Approved optional. Account deletion must also be requestable from a web URL (Play account-deletion policy) — `/privacy` or a deletion page. Today the APK is sideloaded from the website: users must allow "unknown sources"; sign APKs with a stable key and publish the SHA-256 (`public/.well-known/assetlinks.json` exists). | code + owner |
| **Apple App Store Kids category** (guideline 1.3 + 5.1.4) | No third-party analytics or ads, parental gate before external links/purchases (Credits screen opens external Wikimedia links — needs a parental gate in a Kids-category build; on the web/PWA this is fine), privacy nutrition labels, in-app account deletion (exists). The owner's sideloaded build is personal use only; do not distribute it outside TestFlight/App Store. | code + owner |

## 7. Users outside India (COPPA / GDPR)

Only relevant if WonderLab targets or knowingly serves users outside India. Recommendation: **geo-scope the terms
and privacy policy to India** ("This service is intended for users in India"), do not market abroad, and get advice
before changing that. If US children are served, COPPA requires verifiable parental consent and a COPPA-compliant
notice; EU/UK users bring GDPR/UK GDPR and the Age Appropriate Design Code, and Google Fonts IP transfer issues. —
**lawyer**

## 8. Marketing channels

| Channel | Rule of thumb | Who |
|---|---|---|
| YouTube | Set channel/videos as **"made for kids"** where content is directed at children (COPPA-driven YouTube policy applies globally) — comments and personalised ads are disabled automatically. | owner |
| Instagram / Facebook / X | Platforms require users to be 13+; market to **parents and teachers**, not children. Don't show children's faces or names without written parental consent; never reuse learner artworks or data in marketing. | owner |
| Email | Only email people who opted in (separate, unticked checkbox; record the consent); product emails (verification, password reset) are transactional only. Include sender identity and an unsubscribe link in any newsletter. Leads from `/schools` may only be used for the purpose stated on the form. | code + owner |
| WhatsApp | Use WhatsApp Business only with explicit opt-in to receive messages from WonderLab, follow the WhatsApp Business/Commerce policies, honour opt-outs; never message children. Also follow TRAI TCCCPR 2018 rules for commercial SMS/calls (DLT registration if you send bulk SMS). | owner |

## 9. Accessibility

Target **WCAG 2.2 AA** (also the basis of India's GIGW 3.0 and the Rights of Persons with Disabilities Act, 2016
expectations for digital services). Today: 🟡 the design system and review checklist cover contrast, focus, reduced
motion, text size and screen-reader labels (`docs/DESIGN_SYSTEM.md`, `src/features/home/ComfortSettings.tsx`, route
focus management in `src/App.tsx`, `aria-*` throughout). Missing: an automated axe/Lighthouse check in CI and a manual
screen-reader pass (TalkBack, VoiceOver, NVDA) of sign-up, lesson and parent flows, plus an accessibility statement
with a contact for problems. — **code + owner**

## 10. Child safety

| Item | Status | Who |
|---|---|---|
| No user-to-user chat, public profiles, galleries, leaderboards | ✅ by design (`src/features/parent/index.tsx:244`, `src/features/games/ui.ts:17`; no such routes in `src/App.tsx`) | — |
| Learner-created content (artworks, notes) visible only to the family | ✅ stored per profile, no sharing endpoints | — |
| Teacher dashboard (being built) | Must show a teacher only learners whose parents consented to that school/class link; no learner-to-learner visibility; teacher accounts verified; least data. | code + lawyer |
| Content reports moderation | 🟡 `reports` table + editor review exists; define review timelines and escalation (POCSO: any child sexual abuse material or disclosures must be reported to authorities — include in the runbook). | owner |
| External links from child screens | Credits screen links to Wikimedia; add a parental gate in kids-store builds (see §6). | code |
| Nicknames | Encourage nicknames, not full names (sign-up copy); never send them to third parties (§0 #3). | code |

## 11. Requirements for work being built in parallel

- **`/privacy`, `/terms`, parental consent, data deletion (migration 0002)**: everything in §1 and §2; India-only scope
  (§7); grievance officer + contact; processor list (Cloudflare, Resend, Google Fonts if kept, Cloudflare Workers AI for
  narration); retention periods incl. backups; consent record table with notice version; Telugu translation; a public
  account-deletion request URL (Play requirement); non-affiliation disclaimer (§0 #7).
- **Landing page and `/get-app`**: non-affiliation disclaimer; links to privacy/terms/grievance contact in the footer;
  no "official"/"approved" wording; APK checksum and signer fingerprint; no third-party trackers or embeds (a YouTube
  embed would set cookies — use `youtube-nocookie.com` or a click-to-load thumbnail).
- **`/schools` leads form + `/support` UPI page (migration 0003)**: collect only adult contact data; state the purpose
  and retention on the form; opt-in checkbox for marketing; CA advice on UPI receipts and GST (§3); do not call payments
  "donations" unless a registered charity receives them; no payment prompts reachable from learner screens.
- **Teacher dashboard**: §10; access logs; teacher terms (they act for the school — the school may be a separate data
  fiduciary; a lawyer should decide the school agreement).

## 12. Owner's pre-launch checklist (short)

1. Lawyer review of privacy policy, terms, consent flow and this document. 2. Decide and publish grievance officer +
contact email. 3. Trademark search for "WonderLab". 4. Fix the `bell` photo credit. 5. Ship the TTS name fix and
self-hosted fonts. 6. Production email provider configured; outbox purged. 7. Retention cron + backup encryption.
8. Breach runbook. 9. CA advice before any UPI/school payment. 10. Accessibility pass. 11. Re-run this audit before
each store submission.
