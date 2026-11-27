# WonderLab — Mobile UI brief for Google Stitch

Copy the prompt below into Google Stitch.

---

Design a polished native mobile app UI for **WonderLab**, a safe, ad-free learning and creativity app for Indian children aged 3–16 (Nursery/LKG/UKG through Class 10), with a separate parent area. Produce a cohesive Android/iOS-ready design system and high-fidelity screens. The interface must feel calm, capable and joyful—not noisy, childish, gamified, or classroom-corporate.

## Product facts that must remain true

- Core areas: Learn (CBSE/NCERT and Telangana syllabus), personalised “What next?”, Physics Lab, Art Studio, skill-building Games, early-years Play, Telugu and English learning, Progress, Notes, offline downloads.
- Parent accounts can manage multiple child profiles. Parents control comfort settings and see progress; those screens must never feel like child screens.
- There are **no ads, public profiles, public galleries, chat, tracking, leaderboards or social sharing**.
- Use photos for Class 1–10 topic imagery and friendly 3D-style illustrations for Nursery–UKG. Do not rely on emoji as the only meaning-bearing visual.
- Learners can use English and Telugu. Early learners need large targets and optional read-aloud.
- Offline status and saving/sync state need quiet but clear treatment.

## Visual direction

Create a contemporary “quiet confidence” educational product: soft warm-white cards on a faint cool-lavender background, generous space, rounded-but-not-bubbly forms, strong typography, sparse friendly illustration. The content itself should be colourful; interface chrome should recede.

- Primary action: indigo `#5145CD` with white text.
- Background: `#F6F7FC`; cards: `#FFFFFF`; main text: `#1D2540`; muted text: `#4F5B76`.
- Success: forest green `#2F6B4F` on pale green; warning/offline: muted amber; error: earthy red. Never use red for a normal wrong answer.
- Subject tile colours are muted and distinct: maths blue-violet, lab teal, art coral/peach, games gold, progress green, next lavender.
- Headings: Baloo 2 (Telugu: Noto Sans Telugu); body/UI: Nunito; early-reader copy: Andika.
- Use Material Symbols Rounded or equivalent rounded outline icons, paired with text labels where useful.
- Support light and dark themes. Use WCAG AA contrast, visible focus, large readable type, and respect Reduce Motion.

## Responsive mobile behaviour

- Design at 390 × 844 first, then show tablet adaptation at 834 px wide.
- Mobile: persistent bottom navigation with **Home, Learn, Play, Progress**; more areas live in Home/overflow. Use 48dp minimum targets (56–64dp for early years).
- Tablet: replace the bottom bar with a navigation rail and use 2–3 column grids where suitable.
- Respect safe areas. Avoid tiny toolbars, cramped segmented controls, overly dense cards, or horizontal scrolling except a compact subject-tab strip.

## Design these connected screens

1. **Child home — Class 5 example**: top app bar with WonderLab wordmark, language toggle, comfort control, child avatar/switcher; greeting (“Hi Arjun!”), Class 5 and star count; “Continue learning” card; clear tiles for What next, Maths, English, Telugu, Physics Lab, Art Studio, Games, My Progress and Downloads. Make the recommended action visually primary without making every tile loud.
2. **Child home — Nursery example**: same product but visibly simplified: giant 2-column picture tiles, almost no descriptive text, cheerful 3D imagery, speaker/read-aloud control. Feature Play, My World, Art, English, Telugu, Games, Progress and “What shall we do next?”.
3. **Learn / curriculum**: class selector (revisit/mine/explore), subject chips, lesson units, and each objective’s state: New, In progress, Needs practice, Mastered. Show Learn / Practice / Test choices without making the row crowded.
4. **Lesson workspace**: a focused, distraction-free micro-lesson. Include chapter breadcrumb, step progress, a visual/diagram, one short explanation, “Remember” note, read-aloud, optional hint, one question, kind feedback, and a single clear Continue action. Show correct and retry states.
5. **What next?**: one recommendation card, simple explanation of why it was selected, a Start button, and a smaller practice queue. It should feel helpful, not algorithmic or pushy.
6. **Physics Lab**: experiment picker and one interactive experiment screen (for example forces, motion, circuits, or light). Use a large visual simulation canvas, clear variable sliders, live result/gauge, concise “why this changed” copy, and a safe reset.
7. **Art Studio**: creative hub with Trace, Colour, Paint and My gallery. Show a painting screen with a large canvas, clear undo/redo, colour palette, brush size, and save state; preserve plenty of working area.
8. **Games / Play**: card library and a single game screen. Games should build skills, not resemble casino UI: no coins, loot boxes, streak pressure, countdown pressure, or leaderboards. Offer an optional timer only.
9. **Progress**: friendly, non-comparative mastery overview with subject progress, badges, recently mastered skills and “needs a little practice” section. Avoid rankings.
10. **Downloads/offline**: packs for offline lessons, clear download sizes/progress, downloaded state, and a calm banner: “Offline · saved on this device · 2 waiting to sync”.
11. **Profile picker**: parent-owned household picker with child avatar cards and a clear parent settings entry point.
12. **Parent settings**: visually calmer, more utilitarian area with learner management, progress by topic, account/security, export and destructive data deletion. Clearly separate danger actions and include confirmation states.

## Interaction and accessibility rules

- One obvious primary action per screen. Prefer a direct label (“Start lesson”, “Check answer”) over vague labels.
- Incorrect answers get constructive wording: “Not quite — let’s see where it went wrong.” Early years: “Oops! Let’s try again together.”
- Correct answers celebrate briefly and specifically, but no persistent reward mechanics.
- Include loading, empty, offline and error states where relevant.
- Buttons/tabs have clear selected states. Never signal state with colour alone.
- Motion: 120ms press feedback, 200ms local feedback, 280ms page transitions; reduce-motion version is instant and has no confetti/bounce.
- Do not create a marketing landing page, teacher dashboard, social feed, or a generic SaaS dashboard. This is a protected child learning product.

Deliver a consistent visual system plus all 12 named mobile screens, with realistic sample content, Android/iOS patterns, and annotations for key interaction states.

