# WonderLab design system

One visual and interaction language for the **website**, the **Android app** and the **iPad / iPhone app**. All three share the same screens' structure; this file maps every token to its implementation.

| Platform | Implementation |
|---|---|
| Android + iOS | Compose Multiplatform, `android/shared/src/commonMain/kotlin/com/maheshglance/wonderlab/core/design/` (`Theme.kt`, `Components.kt`, `Motion.kt`, `Emoji.kt`, `Cheer.kt`, `Adaptive.kt`) |
| Website | React, `src/styles.css` (CSS custom properties), `src/ui/kit.tsx`, `src/ui/Icon.tsx`, `src/lib/pictures.ts`, `src/lib/cheer.ts` |

## 1. Direction

**Calm, real and encouraging.** A learning tool for children aged 3–16: low-glare surfaces, one strong indigo for actions, real photographs for Class 1–10 (friendly 3D pictures for Nursery–UKG), and motion that only explains what just happened. Learning content (the picture, the formula, the question) carries the visual interest; chrome stays quiet.

## 2. Colour tokens

Same names on both stacks (`WLColors` in `Theme.kt`, `--*` variables in `styles.css`). WCAG AA pairs.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F6F7FC` | `#101426` | screen background |
| `surface` / `surface2` | `#FFFFFF` / `#EEF0F8` | `#1A2136` / `#232B44` | cards / inset areas |
| `text` / `muted` | `#1D2540` / `#4F5B76` | `#F2F4FF` / `#B7C0D8` | body / secondary text |
| `primary` / `primaryInk` | `#5145CD` / `#FFFFFF` | `#B7AEFF` / `#201846` | the one primary action per screen |
| `good` / `goodBg` | `#2F6B4F` / `#DCEBDF` | `#9CD3B4` / `#284034` | correct, saved, results |
| `bad` / `badBg` | `#94473B` / `#F4DED7` | `#EBA89A` / `#4A3430` | errors, mistakes |
| `warn` / `warnBg` | `#7A5A12` / `#F3E7C4` | `#E8CF8A` / `#3F3624` | offline, "Remember", hints |
| subject pairs | `math/mathInk`, `lab/labInk`, `art/artInk`, `games/gamesInk`, `next/nextInk`, `prog/progInk`, `dl/dlInk` | | tile backgrounds + text |

App icon: WonderLab green `#3F6E58`, cream `#FBF8F1` flask, sun `#F4C95D` and sky `#8ECAE6` bubbles.

## 3. Type

| Role | Family | Size (× learner text scale) |
|---|---|---|
| Display / headings | Baloo 2 (Telugu: Noto Sans Telugu) | 30 / 26 / 22 / 20 / 17 |
| Body | Nunito | 17 / 15 / 13 |
| Labels | Nunito ExtraBold | 16 / 14 / 12 |
| Early readers (Nursery–Class 2) | Andika | per screen |

Text never shrinks below a readable size: `FitToScreen` scales content down at most to 55 % (pre-primary), 80 % (primary) or 85 % (older) and **scrolls** beyond that. Labels wrap/auto-size (`FitText`) instead of truncating with "…". Parents can set text size Normal / Large / Extra large.

## 4. Spacing, shape, layout

- Spacing scale: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 dp/px.
- Radius: 12 (small controls), 16–18 (cards), 22 (hero card), 999 (pills/chips). Photos: rounded frame + 10 % hairline.
- Touch targets ≥ 48 dp (older), 56 (primary), 64 (pre-primary / big-targets setting).
- Window classes: Compact < 600 dp (bottom navigation bar), Medium/Expanded (navigation rail, multi-column grids). iPad split view / Stage Manager use the live window size.

## 5. Components (inventory)

| Component | App (Kotlin) | Web | Notes |
|---|---|---|---|
| Button (Normal / Primary / Danger / Ghost, small) | `WLButton` | `Button` (kit.tsx) | press scale 0.96, ripple / :active |
| Icon button | `IconBtn` | `IconButton` | accessible label required |
| Tile | `Tile` | `.tile` | home/hub navigation, picture + title |
| Card | `WLCard` | `.card` | no nested cards |
| Top bar | `TopBar` | page header | back · title · subtitle · actions |
| Hub navigation | `HubScaffold` (bar / rail) | Home grid | Home · Lessons · Games/Play · Art or Notes · Progress |
| Subject tabs | `LearnScreen` chips | `Curriculum.tsx` tabs | per learner syllabus (TS/AP/CBSE) |
| Lesson blocks | `Blocks` (`LessonUi.kt`) | `Blocks` (`LearnMode.tsx`) | text, heading, formula, definition, key points, remember, photo, visual, steps, tip, activity, explorer |
| "What if?" explorer | `FormulaExplorer` | `Explorer` | sliders, live result + gauge, why-text, mistakes, real life |
| Question feedback | `Feedback` + `Cheer` | `QuestionPanel` + `cheer.ts` | praise / streaks / kind retry |
| Notes | `feature/notes` | `features/notes` | typed + handwriting, synced |
| Toast | `ToastHost` (iOS) / Android toast | status region | announced politely |
| Offline bar | `OfflineBar` | offline banner | "Offline · saved on this device" |

## 6. Icon mapping

UI actions use **Material Symbols Rounded** in the apps (Compose `Icons.Rounded.*`, rendered identically on Android and iOS so the two apps stay one product) and the site's own outline set in `src/ui/Icon.tsx` on the web. Content pictures (subjects, tiles) are photos / 3D pictures, always paired with a text label.

| Action | App icon (`Icons.Rounded.`) | Web icon | Visible label / accessible name |
|---|---|---|---|
| Back | `ArrowBack` (AutoMirrored) | `back` | "Back" |
| Home | `Home` | `home` | "Home" |
| Settings (parent area) | `Settings` | `settings` | "Settings" |
| Switch learner | `SwitchAccount` | `users` | "Switch learner" |
| Language EN ⇄ TE | `Language` | `globe` | "Switch to English" / "తెలుగుకు మార్చు" |
| Comfort / display | `Tune` | `sliders` | "Comfort settings" |
| Notes for this chapter | `NoteAdd` | `note` | "Notes" / "My notes for this chapter" |
| Save to notes | `NoteAdd` | `note` | "Save to notes" |
| Report a problem | `Flag` | `flag` | "Report a problem" |
| Hint | `Lightbulb` | `bulb` | "Hint 1 of 3" |
| Check answer | `Check` | `check` | "Check" |
| Read aloud | `VolumeUp` | `speaker` | "Read aloud" |
| Print | `Print` | `print` | "Print" |
| Delete | `Delete` | `trash` | "Delete note" (confirmed) |
| Offline | `CloudOff` | `cloud-off` | status text |

## 7. Motion

Tokens (`Motion.kt`; web `--dur-press/--dur-local/--dur-transition`):

| Token | Duration | Easing | Used for |
|---|---|---|---|
| `PRESS` | 120 ms | standard `(0.2, 0, 0, 1)` | button/tile press feedback |
| `LOCAL` | 200 ms | standard | check result, hint reveal, explorer gauge, validation |
| `TRANSITION` | 280 ms | enter `(0, 0, 0, 1)` / exit `(0.3, 0, 1, 1)` | lesson stage change, dialogs, cheer banner, toast |

Reduced motion: the app's **Reduce motion** setting OR the device setting (Android "Remove animations", iOS "Reduce Motion", web `prefers-reduced-motion`) turns every token into an instant change; confetti and celebratory bounces are skipped; meaning is kept with colour + text.

| Moment | Trigger | Purpose | Properties | Timing | Interruption | Reduced motion |
|---|---|---|---|---|---|---|
| Press feedback | pointer down / key press | confirm input | scale 1 → 0.96 → 1, ripple | PRESS | release mid-way returns to 1 | no scale; ripple/focus only |
| Answer check | Check | show result in place | feedback box fade + colour | LOCAL | new answer replaces it | instant |
| Explorer change | slider move | show cause → effect | result gauge width, why-text crossfade | LOCAL | each move retargets the gauge | instant |
| Lesson stage | Continue / Back | where am I | content fade/slide, progress bar | TRANSITION | rapid taps land on a valid stage | instant |
| Cheer / streak banner | correct answer | encourage | scale-in spring + fade | TRANSITION | next answer replaces | fade only |
| Navigation | tab / back / iOS edge swipe | spatial orientation | platform default | system | system back always wins | system |

## 8. Platform behaviour

- **Android:** Material 3, edge-to-edge, system Back (predictive), font scaling via system + app text size, TalkBack labels on every control, themed (monochrome) launcher icon.
- **iPad / iPhone:** swipe from the left edge to go back (honours each screen's own back handling), safe areas, Reduce Motion, VoiceOver labels from Compose semantics, Split View / Stage Manager sizes, share sheet for saving files, AirPrint for worksheets.
- **Web:** visible focus rings, logical tab order, `prefers-reduced-motion`, `aria-live` for check results and toasts, keyboard-operable sliders (`aria-valuetext`).
- **CarPlay / Android Auto:** out of scope.

## 9. Voice and copy

Warm, short, specific, never shaming. Praise effort and progress; explain mistakes.

| Situation | Copy |
|---|---|
| Correct (older) | "Well done!", "Spot on!", "Nailed it!", "Sharp thinking!" |
| Correct after a hint | "Well done — the hint helped and you got there!" |
| Streak | "3 in a row! 🔥", "5 in a row — you're on fire! 🔥", "10 in a row! You're a champion! 🏆" |
| Wrong | "Not quite — let's see where it went wrong." / early: "Oops! Let's try again together." |
| Game win | "You won! 🏆", "Victory! Well played! 🏆" |
| Lesson complete | "You finished the lesson! Brilliant!" |
| Offline | "Offline · saved on this device · 2 waiting to sync" |
| Note saved | "Saved to your notes" |
| Fallback syllabus | "Telangana lessons for Class 10 are being written. Until then you can learn with the NCERT lessons below." |

## 10. App icon

Source: `brand/icon-source.svg` (64-unit grid). Build every size with `node scripts/build-icons.mjs`:
iOS 1024 universal (opaque), Android legacy + adaptive foreground/background (+ monochrome for themed icons), website `icon.svg`, `favicon-32.png`, `icon-192/512.png`, maskable 512, `apple-touch-icon.png`. Previews at 16/32/48/120 px and the Android circle mask: `brand/preview/`.
