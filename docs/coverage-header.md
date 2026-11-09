# WonderLab Curriculum Coverage Map

_Mapped November 2026. Generated tables below come from the live content in `src/content/` (regenerate after edits); the narrative sections are maintained by hand._

## Scope

| Levels | Board | Curriculum |
|---|---|---|
| Nursery, LKG, UKG (levels 0–2) | `play` | WonderLab play-based pre-primary curriculum: counting, shapes, colours & patterns, size & comparison, shadows & light, sounds, movement (UKG adds floating/sinking and magnets). Not an NCERT textbook. |
| Class 1–10 (levels 3–12) | `cbse` | CBSE-aligned **Mathematics** (every chapter of the current NCERT textbook) and the **physics / physical-science** portions of NCERT Science. |
| Class 1–5 physical science | `cbse` | Age-appropriate exploration units (light & shadows, sound, push/pull, floating & sinking, magnets, simple machines, friction). Under NCF-SE 2023 there is no EVS textbook in Classes 1–2; the Class 3–5 EVS book (*Our Wondrous World*) was **not** chapter-mapped in this pass, so these units have `source: null` and need educator verification of placement. |

## Source books and how each mapping was confirmed

Status key: **Confirmed** = chapter list read from an official NCERT page (CIET audio-book listing). **Secondary** = chapter titles/numbers corroborated by two or more independent secondary listings (study/solution sites); the official NCERT PDF was not opened in this pass, so these **need educator verification**. **Unverified** = mapped from prior knowledge of the edition; **needs educator verification**.

| Class | Subject | Book | Edition / academic year | Status |
|---|---|---|---|---|
| 1 | Maths | Joyful Mathematics | NCF-SE 2023 series, current reprint | Confirmed (ciet.ncert.gov.in/audio-book/118) |
| 2 | Maths | Joyful Mathematics | NCF-SE 2023 series, current reprint | Confirmed (ciet.ncert.gov.in/audio-book/121) |
| 3 | Maths | Maths Mela | 2024-25 first edition | Secondary (chapters 2–14); chapter 1 title “What's in a Name?” **needs educator verification** |
| 4 | Maths | Maths Mela | 2025-26 first edition | Secondary; one listing numbers ch. 10 / 13 as 11 / 14 — **needs educator verification** |
| 5 | Maths | Maths Mela | 2025-26 first edition (June 2025) | Secondary |
| 6 | Maths | Ganita Prakash | 2024-25 first edition | Secondary |
| 7 | Maths | Ganita Prakash Part 1 & Part 2 | 2025-26 first edition | Secondary |
| 8 | Maths | Ganita Prakash Part 1 & Part 2 | 2025-26 first edition | Secondary |
| 9 | Maths | Ganita Manjari Part 1 | 2026-27 first edition | Secondary |
| 9 | Maths | Ganita Manjari Part 2 (ch. 9–14) | 2026-27 | Single secondary listing — **needs educator verification** |
| 10 | Maths | Mathematics (rationalised) | 2023-24 onward, used for 2026-27 | Unverified — **needs educator verification** (new NCF-SE Class 10 book may replace it) |
| 6 | Science | Curiosity | 2024-25 first edition | Secondary |
| 7 | Science | Curiosity | 2025-26 first edition | Secondary |
| 8 | Science | Curiosity | 2025-26 first edition | Secondary (ch. 3 title not found) |
| 9 | Science | Exploration | 2026-27 first edition | Secondary (one source says 12 chapters, most say 13) |
| 10 | Science | Science (rationalised) | 2023-24 onward | Unverified — **needs educator verification** |

Physics chapters selected from the science books (others are chemistry/biology and out of scope):
- Class 6 *Curiosity*: 4 Exploring Magnets · 5 Measurement of Length and Motion · 7 Temperature and its Measurement · 8 A Journey through States of Water (physical-change part)
- Class 7 *Curiosity*: 3 Electricity: Circuits and their Components · 7 Heat Transfer in Nature · 8 Measurement of Time and Motion · 11 Light: Shadows and Reflections
- Class 8 *Curiosity*: 4 Electricity: Magnetic and Heating Effects · 5 Exploring Forces · 6 Pressure, Winds, Storms, and Cyclones · 10 Light: Mirrors and Lenses
- Class 9 *Exploration*: 4 Describing Motion Around Us · 6 How Forces Affect Motion · 7 Work, Energy, and Simple Machines · 10 Sound Waves: Characteristics and Applications
- Class 10 *Science*: 9 Light – Reflection and Refraction · 10 The Human Eye and the Colourful World · 11 Electricity · 12 Magnetic Effects of Electric Current

## What every objective ships

- **Learn**: `intro` blocks (text, formula, visual, steps, tips, linked activities) and **≥ 2 worked examples / demonstrations**.
- **Practice & Test**: parameterised templates (seeded, deterministic; `validateTemplate` requires ≥ 5 distinct valid items across 60 seeds) and/or static items (`version: 1`). Items carry 2–3 progressive hints, targeted `mistakes` (keyed by grading reason such as `missing-unit`, `wrong-unit`, `not-lowest`, or by a specific wrong answer), and a worked solution. Some items carry graded multi-step `steps`.
- **Item types used**: mcq, typed (numeric / fraction / algebra / units keypads), tap, match, order, number-line, graph, drag, count, spoken (picture answers, read aloud) — visual and spoken items dominate Nursery–Class 2.
- **Linked activities**: `Objective.activities` and activity blocks, including lab presets such as `lab:circuit?cells=2&bulbs=1&closed=1` (Class 10 Ohm's law: solve the numerical with units, then verify in the Circuit Lab), `lab:motion?u=…&a=…&t=…`, `lab:forces?mass=…&force=…&friction=…`, `lab:light?angle=…`.
- **Diagnostic**: `diagnosticFor(level)` lists ~6 templates spanning each class for the optional starting assessment.

## Review status

- Every unit has `review: { validated: true, educator: 'pending' }`. `validated` reflects the automated suite (`tests/content.test.ts`: answer keys grade as correct, templates deterministic and varied, unit conversions, unique ids, ≥ 2 examples and ≥ 5 items per objective). **No educator approval has been obtained or claimed.**
- **Telugu** (`te`) is provided for unit and objective titles, intro text, prompts, hints and solutions for Nursery–Class 3 (levels 0–5). All Telugu was machine-authored and **needs native-speaker review** before release (terminology, register for young children, and narration audio).
- All wording is original; no textbook text was copied. Contexts use rupees (₹), metric units and familiar Indian names, places and foods.

## Gaps, enrichment and follow-ups

**Telugu beyond Class 3.** Telugu is required (and test-enforced) only for Nursery–Class 3. Class 6 and Class 8 *maths* were also authored bilingually (before a scope correction) and that Telugu was kept; Class 4–5, Class 6–8 physics, Class 9 and Class 10 are English only. A separate Telugu-language course is planned by another team. `src/content/glossary.ts` exports a bilingual maths + physics glossary (`glossary`, `glossaryFor(level)`) for older classes. **All Telugu — in lessons and in the glossary — needs native-speaker educator review**, especially SCERT terminology (e.g. geometry/solid names, శంకువు/శంఖువు spelling variants), early-years sound words and instrument verbs.

**Enrichment / exploration (not textbook chapters)**
- Class 1–5 physical-science exploration units (`source: null`). Their objectives are flagged `enrichment: true`, so the "what next" recommender treats them as optional; flip the flag if educators want them on the main path.
- Class 7 Curiosity ch. 12 *Earth, Moon, and the Sun* — enrichment.

**Known gaps**
- Not mapped: Class 8 Curiosity ch. 11 *Keeping Time with the Skies* (astronomy, little numerical physics); the "Puzzles" sections at the end of Joyful Mathematics 1 and 2; Class 3–5 EVS chapter-level mapping.
- Topic inferred from chapter title only (needs educator check): Joyful Mathematics chapter skills (e.g. "How Many Times?" → repeated addition), Maths Mela 3 chapter skills (e.g. ch. 12 → money/change, ch. 14 → data & patterns), Class 8 ch. 3 *A Story of Numbers* (taught as number systems: Roman numerals, binary, place value), Class 9 ch. 5 *I'm Up and Down, and Round and Round* (taught as circles).
- Constructions & tilings (Class 6 ch. 8, Class 7 ch. 6) are practised through facts, step ordering and angle sums only — no interactive ruler-and-compass tool.
- Class 6 ch. 3 *Number Play* omits supercells; Class 7 *Connecting the Dots* covers mean/median/mode and line-graph reading only.
- Pre-primary: no position words (in/out, above/below), 3D shapes, full/empty capacity or time words yet.
- Class 3: no tangram drag activity (mentioned only in a tip); calendar work covers days/months, not reading dates.
- Static (educator-overridable) items exist only where noted (e.g. Class 10 Ohm's law); other objectives are template-driven. Educators can still override objectives (title/intro/examples) everywhere.
- Some picture choices use newer emoji (🪔, 🪶, 🪨, 🐦‍⬛, 🛞) and a tally glyph (卌) that may not render on older Android devices — UI should verify fonts.
- Offline packs: class files import the shared kit `src/content/lib/kit.ts`; the lesson pack module patterns in `src/shared/packs.ts` cover `/src/content/classes/<key>.` only, so the shared kit chunk should be added to the lesson packs (e.g. `/src/content/lib/`) by the owner of `packs.ts`.

