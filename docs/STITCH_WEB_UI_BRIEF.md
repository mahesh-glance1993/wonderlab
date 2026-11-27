# WonderLab — Web UI brief for Google Stitch

Copy the prompt below into Google Stitch.

---

Design a responsive web application UI for **WonderLab**, a safe, ad-free learning and creativity app for Indian children aged 3–16 (Nursery/LKG/UKG through Class 10), plus a protected parent area. This is an authenticated product experience, **not a marketing site**. Create a refined desktop-first system that remains excellent on tablet and mobile web.

## Product facts that must remain true

- Learning areas: curriculum lessons, personalised “What next?”, Physics Lab, Art Studio, Games, early-years Play, Telugu/English learning, Progress, Notes and offline downloads.
- Parent accounts can have multiple learner profiles; parent settings, security, data export and account deletion are deliberately separated from learner UI.
- No ads, tracking, public profiles, public galleries, leaderboards, chat, social feed, or competitive mechanics.
- Class 1–10 uses realistic topic photos; Nursery–UKG uses friendly 3D-style visuals. English and Telugu are supported.
- Lesson data is CBSE/NCERT and Telangana syllabus-aligned; a learner can revisit prior classes or explore the next class.

## Visual direction and tokens

Aim for a calm, premium learning environment: calm surfaces, clear hierarchy, confident indigo actions, editorial typography, and purposeful illustrations. Avoid both noisy edtech carnival visuals and sterile enterprise dashboard styling.

- Light palette: background `#F6F7FC`, cards `#FFFFFF`, inset `#EEF0F8`, text `#1D2540`, muted `#4F5B76`, primary `#5145CD`.
- Success: `#2F6B4F`; warning: `#7A5A12`; error: `#94473B`; all with subtle tinted backgrounds.
- Use muted subject accents for Maths, Lab, Art, Games, What next, Progress and Downloads. The primary indigo is reserved for the most important action.
- Typography: Baloo 2 headings, Noto Sans Telugu where required, Nunito UI/body, Andika for early-reader content.
- 12–18px radii; 4/6/8/10/12/16/20/24 spacing rhythm; thin quiet borders; no nested-card clutter.
- Support dark mode, `prefers-reduced-motion`, keyboard navigation, visible focus, logical reading order and WCAG AA contrast.

## Responsive shell

- Desktop (1440px): a 240px left navigation rail, slim top bar, max content width around 1200px, and generous two/three-column layouts.
- Medium/tablet (768–1199px): collapsed rail, 2-column content.
- Small web (under 600px): bottom navigation for Home, Learn, Play, Progress, with the rest reachable from Home/More.
- Top bar includes active learner/avatar, language toggle, comfort settings, help only where relevant, and contextual actions. Show a quiet offline/sync banner only when needed.

## Build these web screens and states

1. **Learner home — Class 5**: greeting and learner context, high-visibility Continue learning card, then a well-spaced grid for What next, Maths, English, Telugu, Physics Lab, Art Studio, Games, Progress and Downloads. Do not turn this into an analytics dashboard.
2. **Learner home — Nursery**: a dedicated, simplified variant with oversized visual tiles, speaker/read-aloud support, short words, and 3D illustrations.
3. **Curriculum browser**: class chooser, subject tabs, chapter/unit list and objective rows with Learn / Practice / Test. Objective statuses are New, In progress, Needs practice and Mastered; status icons and text must be understandable without colour.
4. **Lesson workspace**: a centered reading/learning column, sticky but unobtrusive lesson progress/navigation, content visual, key-point/remember block, read-aloud, notes entry point, question/check flow, encouraging feedback and Continue. Use enough width for diagrams without exhausting line length.
5. **Personalised What next**: a single recommendation with reason, primary Start action, secondary option to choose something else, and a compact review queue.
6. **Physics Lab**: lab index plus an experiment workspace using a large simulation stage and a right-side control panel on desktop. Include controls, values, result gauge, “why” explanation, reset, keyboard-operable sliders, and responsive stacking.
7. **Art Studio**: hub plus a desktop canvas workspace. Keep the canvas dominant; put tools in a clear side panel, palette at the bottom/side, undo/redo/save visible, and gallery as a separate destination. No public sharing.
8. **Games / early Play**: browse cards and one playable experience. Give games meaningful educational context and optional timer; omit coins, streak pressure, paywalls, rankings and social competition.
9. **Progress**: learner-facing subject cards, mastery path, badges and a gentle practice list. Make it self-referential (“Your progress”), never comparative.
10. **Notes**: simple personal notebook with linked chapter context, typed/handwriting modes and safe save states.
11. **Downloads and offline**: pack selection, file size, download progress, downloaded state, and clear sync-state messaging.
12. **Profile picker**: a secure household profile selector with a visibly different parent settings route.
13. **Parent settings**: desktop-friendly utilitarian workspace with tabs for Learners, Progress, Account, Sign-in & security and Your data. Include learner cards, table-style topic progress, comfort/accessibility controls, session/recovery-code views, export, and carefully designed destructive deletion confirmations.

## Critical content and safety details

- Warm copy: “Well done!”, “Spot on!”, “Not quite — let’s see where it went wrong.” For early learners: “Oops! Let’s try again together.”
- Make the system encouraging without badges taking over the interface.
- A small offline status can say: “Offline · saved on this device · 2 waiting to sync.”
- Respect learner comfort controls: Normal/Large/Extra large text, light/dark/system theme, reduce motion, mute narration and sounds, optional game timers.
- Parent privacy/data controls must be clear and serious. Account/profile deletion is permanent and needs confirmation; never hide this behind visual ambiguity.

Show desktop, tablet and mobile adaptations for the shell, home, curriculum, lesson, lab, art and parent settings. Include high-fidelity layouts and components—not implementation code—and preserve the same product language across every screen.
