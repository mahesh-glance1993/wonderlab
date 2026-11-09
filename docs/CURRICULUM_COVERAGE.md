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

## Summary

| Class | Units (maths / physics / early) | Objectives | Templates | Static items |
|---|---|---|---|---|
| Nursery | 7 (0 / 0 / 7) | 9 | 15 | 0 |
| LKG | 8 (0 / 0 / 8) | 10 | 22 | 0 |
| UKG | 10 (0 / 0 / 10) | 12 | 25 | 0 |
| Class 1 | 16 (13 / 3 / 0) | 16 | 32 | 0 |
| Class 2 | 13 (11 / 2 / 0) | 13 | 27 | 0 |
| Class 3 | 18 (14 / 4 / 0) | 18 | 42 | 0 |
| Class 4 | 16 (14 / 2 / 0) | 16 | 41 | 0 |
| Class 5 | 19 (15 / 4 / 0) | 20 | 44 | 0 |
| Class 6 | 14 (10 / 4 / 0) | 15 | 45 | 0 |
| Class 7 | 20 (15 / 5 / 0) | 21 | 57 | 0 |
| Class 8 | 18 (14 / 4 / 0) | 18 | 50 | 0 |
| Class 9 | 18 (14 / 4 / 0) | 19 | 54 | 0 |
| Class 10 | 18 (14 / 4 / 0) | 21 | 48 | 1 |
| **Total** | 195 | 208 | 502 | 1 |

# Per-class coverage map

## Nursery (level 0, key `nursery`)

Diagnostic templates: `n.count.to5.count`, `n.num.to5.numeral`, `n.shape.basic.find`, `n.pattern.ab.next`, `n.size.bigsmall.two`, `n.sound.animals.who`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Counting 1 to 5<br>లెక్కలు 1 నుండి 5 | early | — | WonderLab play curriculum | `n.count.to5` Count up to 5 things<br>`n.num.to5` Know the numbers 1 to 5 (needs n.count.to5) | count, spoken, match | `game:counting` `art:trace` |
| Shapes around us<br>మన చుట్టూ ఆకారాలు | early | — | WonderLab play curriculum | `n.shape.basic` Circle, square, triangle and star | spoken, match | `game:shapes` `art:trace` |
| Colours and patterns<br>రంగులు మరియు నమూనాలు | early | — | WonderLab play curriculum | `n.colour.name` Red, blue, green and yellow<br>`n.pattern.ab` Simple AB patterns | spoken | `art:color` `game:patterns` |
| Big and small<br>పెద్దది మరియు చిన్నది | early | — | WonderLab play curriculum | `n.size.bigsmall` Tell big from small | spoken | `game:logic` |
| Light and dark<br>వెలుగు మరియు చీకటి | early | — | WonderLab play curriculum | `n.light.sources` Things that give light | spoken | `lab:light` |
| Sounds around us<br>మన చుట్టూ శబ్దాలు | early | — | WonderLab play curriculum | `n.sound.animals` Animal sounds, loud and soft | spoken | `game:logic` |
| Things that move<br>కదిలే వస్తువులు | early | — | WonderLab play curriculum | `n.move.roll` Rolling, pushing and pulling | spoken | `lab:forces` |

## LKG (level 1, key `lkg`)

Diagnostic templates: `lkg.count.to10.count`, `lkg.num.to10.order`, `lkg.compare.groups.baskets`, `lkg.shape.match.find`, `lkg.pattern.repeat.next`, `lkg.measure.compare.heavy`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Numbers 1 to 10<br>అంకెలు 1 నుండి 10 | early | — | WonderLab play curriculum | `lkg.count.to10` Count up to 10 things<br>`lkg.num.to10` Read and order numbers to 10 (needs lkg.count.to10) | count, spoken, drag, match | `game:counting` `art:trace` `game:numberline` |
| More and fewer<br>ఎక్కువ మరియు తక్కువ | early | — | WonderLab play curriculum | `lkg.compare.groups` Which group has more? (needs lkg.count.to10) | spoken | `game:balance` `game:counting` |
| Shapes<br>ఆకారాలు | early | — | WonderLab play curriculum | `lkg.shape.match` Name and match shapes | spoken, match | `game:shapes` `art:trace` |
| Colours and patterns<br>రంగులు మరియు నమూనాలు | early | — | WonderLab play curriculum | `lkg.colour.things` Colours of things around us<br>`lkg.pattern.repeat` Repeating patterns | spoken | `art:color` `game:patterns` |
| Long, tall and heavy<br>పొడవు, ఎత్తు, బరువు | early | — | WonderLab play curriculum | `lkg.measure.compare` Compare length, height and weight | spoken, order | `game:balance` |
| Light and shadows<br>వెలుగు మరియు నీడలు | early | — | WonderLab play curriculum | `lkg.light.shadow` Light sources and shadows | tap, spoken | `lab:light` `art:color` |
| Loud and soft sounds<br>గట్టి మరియు మెల్లని శబ్దాలు | early | — | WonderLab play curriculum | `lkg.sound.loudsoft` Loud, soft and musical sounds | spoken | `game:patterns` |
| Push and pull<br>తోయడం మరియు లాగడం | early | — | WonderLab play curriculum | `lkg.move.pushpull` Pushes, pulls and rolling | spoken, tap | `lab:forces` `lab:forces?mass=2&force=10&friction=0` |

## UKG (level 2, key `ukg`)

Diagnostic templates: `ukg.num.to20.count`, `ukg.num.order.beforeafter`, `ukg.add.within10.add`, `ukg.sub.within10.sub`, `ukg.shape.sides.sides`, `ukg.pattern.grow.number`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Numbers 1 to 20<br>అంకెలు 1 నుండి 20 | early | — | WonderLab play curriculum | `ukg.num.to20` Count and read numbers to 20<br>`ukg.num.order` Before, after and in order (needs ukg.num.to20) | count, spoken, drag | `game:counting` `art:trace` `game:numberline` |
| Adding and taking away<br>కలపడం మరియు తీసివేయడం | early | — | WonderLab play curriculum | `ukg.add.within10` Add within 10 (needs ukg.num.to20)<br>`ukg.sub.within10` Take away within 10 (needs ukg.add.within10) | spoken, number-line | `game:counting` `game:numberline` |
| Shapes and sides<br>ఆకారాలు మరియు భుజాలు | early | — | WonderLab play curriculum | `ukg.shape.sides` Count sides and name shapes | spoken | `game:shapes` `art:trace` |
| Patterns<br>నమూనాలు | early | — | WonderLab play curriculum | `ukg.pattern.grow` Repeating and number patterns | spoken | `game:patterns` |
| Measuring and comparing<br>కొలవడం మరియు పోల్చడం | early | — | WonderLab play curriculum | `ukg.measure.order` Order by length, height and weight | drag, spoken | `game:balance` |
| Light and shadows<br>వెలుగు మరియు నీడలు | early | — | WonderLab play curriculum | `ukg.light.shadow` How shadows are made | tap, spoken | `lab:light` `lab:light?angle=30` |
| Sounds<br>శబ్దాలు | early | — | WonderLab play curriculum | `ukg.sound.sources` Where sounds come from | match, spoken, order | `game:logic` |
| Push, pull, roll and slide<br>తోయడం, లాగడం, దొర్లడం, జారడం | early | — | WonderLab play curriculum | `ukg.move.force` Forces make things move | spoken, tap | `lab:forces` `lab:forces?mass=2&force=10&friction=0.1` |
| Floating and sinking<br>తేలడం మరియు మునగడం | early | — | WonderLab play curriculum | `ukg.float.sink` What floats? What sinks? | tap, spoken | `lab:forces` |
| Magic of magnets<br>అయస్కాంతాల మాయ | early | — | WonderLab play curriculum | `ukg.magnet.attract` What does a magnet pull? | tap, spoken | `game:logic` |

## Class 1 (level 3, key `c1`)

Diagnostic templates: `c1.num.1to9.count`, `c1.num.make10.missing`, `c1.add.to20.story`, `c1.sub.to20.story`, `c1.num.tens-ones.build`, `c1.money.coins.count`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Finding the Furry Cat!<br>బొచ్చు పిల్లిని వెతుకుదాం! | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 1 “Finding the Furry Cat!” | Confirmed (official CIET/NCERT listing) | `c1.space.words` Where is it? Above, below, inside, near | spoken, match | `game:logic` `art:color` |
| What is Long? What is Round?<br>ఏది పొడవు? ఏది గుండ్రం? | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 2 “What is Long? What is Round?” | Confirmed (official CIET/NCERT listing) | `c1.long.compare` Long and short, round and not round (needs c1.space.words) | spoken, tap | `game:shapes` `art:trace` |
| Mango Treat<br>మామిడి పండ్ల విందు | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 3 “Mango Treat” | Confirmed (official CIET/NCERT listing) | `c1.num.1to9` Count and show numbers 1 to 9 | count, spoken | `game:counting` `art:trace` |
| Making 10<br>10 చేద్దాం | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 4 “Making 10” | Confirmed (official CIET/NCERT listing) | `c1.num.make10` Pairs that make 10 (needs c1.num.1to9) | mcq, match | `game:counting` `game:balance` |
| How Many?<br>ఎన్ని? | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 5 “How Many?” | Confirmed (official CIET/NCERT listing) | `c1.num.to20` Numbers to 20: more, less, on the number line (needs c1.num.make10) | mcq, number-line | `game:numberline` `game:counting` |
| Vegetable Farm<br>కూరగాయల తోట | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 6 “Vegetable Farm” | Confirmed (official CIET/NCERT listing) | `c1.add.to20` Adding numbers up to 20 (needs c1.num.to20) | typed, number-line | `game:counting` `game:numberline` |
| Lina's Family<br>లీనా కుటుంబం | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 7 “Lina's Family” | Confirmed (official CIET/NCERT listing) | `c1.sub.to20` Taking away (subtraction within 20) (needs c1.add.to20) | typed, number-line | `game:numberline` `game:counting` |
| Fun with Numbers<br>సంఖ్యలతో ఆట | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 8 “Fun with Numbers” | Confirmed (official CIET/NCERT listing) | `c1.num.tens-ones` Tens and ones up to 99 (needs c1.num.to20) | mcq, typed | `game:counting` `game:numberline` |
| Utsav<br>ఉత్సవం | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 9 “Utsav” | Confirmed (official CIET/NCERT listing) | `c1.pat.repeat` Repeating patterns | mcq, typed | `game:patterns` `art:color` |
| How do I Spend my Day?<br>నా రోజు ఎలా గడుస్తుంది? | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 10 “How do I Spend my Day?” | Confirmed (official CIET/NCERT listing) | `c1.time.day` Order of daily events and o’clock times | order, spoken | `game:logic` |
| How Many Times?<br>ఎన్ని సార్లు? | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 11 “How Many Times?” | Confirmed (official CIET/NCERT listing) | `c1.mul.groups` Equal groups and repeated jumps (needs c1.add.to20) | mcq, number-line | `game:numberline` `game:counting` |
| How Much Can We Spend?<br>ఎంత ఖర్చు చేయగలం? | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 12 “How Much Can We Spend?” | Confirmed (official CIET/NCERT listing) | `c1.money.coins` Coins and notes up to ₹20 (needs c1.add.to20) | typed, spoken | `game:counting` |
| So Many Toys<br>ఎన్నో బొమ్మలు | math | NCERT Joyful Mathematics — Class 1 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 13 “So Many Toys” | Confirmed (official CIET/NCERT listing) | `c1.data.toys` Reading a picture graph (needs c1.num.to20) | graph | `game:counting` |
| Light and Shadows<br>వెలుగు, నీడలు | physics | — | Exploration / enrichment (no textbook chapter)<br>*NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.* | `c1.phy.shadows` Light sources and shadows *[enrichment]* | tap, spoken | `lab:light` `art:trace` `lab:light?angle=30` |
| Sounds Around Us<br>మన చుట్టూ శబ్దాలు | physics | — | Exploration / enrichment (no textbook chapter)<br>*NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.* | `c1.phy.sounds` Loud and soft sounds; who makes which sound *[enrichment]* | spoken, match | `game:logic` |
| Push and Pull<br>తోయడం, లాగడం | physics | — | Exploration / enrichment (no textbook chapter)<br>*NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.* | `c1.phy.pushpull` Is it a push or a pull? *[enrichment]* | spoken, mcq | `lab:forces` `lab:forces?mass=5&force=20&friction=0` |

## Class 2 (level 4, key `c2`)

Diagnostic templates: `c2.num.groups.skip`, `c2.num.place.order`, `c2.add.2digit.add`, `c2.add.2digit.sub`, `c2.mul.share.share`, `c2.money.fair.change`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| A Day at the Beach<br>సముద్ర తీరంలో ఒక రోజు | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 1 “A Day at the Beach” | Confirmed (official CIET/NCERT listing) | `c2.num.groups` Counting in groups of 2, 5 and 10 | count, mcq | `game:counting` `game:numberline` |
| Shapes Around Us<br>మన చుట్టూ ఆకారాలు | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 2 “Shapes Around Us” | Confirmed (official CIET/NCERT listing) | `c2.geo.solids` Solid shapes: sphere, cube, cylinder, cone, cuboid | mcq, match | `game:shapes` |
| Fun with Numbers<br>సంఖ్యలతో ఆట | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 3 “Fun with Numbers” | Confirmed (official CIET/NCERT listing) | `c2.num.place` Place value and comparing numbers up to 100 and beyond (needs c2.num.groups) | order, typed | `game:numberline` `game:counting` |
| Shadow Story<br>నీడల కథ | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 4 “Shadow Story” | Confirmed (official CIET/NCERT listing) | `c2.geo.flat` Flat shapes from shadows and outlines (needs c2.geo.solids) | spoken, count | `game:shapes` `lab:light` `art:trace` |
| Playing with Lines<br>గీతలతో ఆట | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 5 “Playing with Lines” | Confirmed (official CIET/NCERT listing) | `c2.geo.lines` Straight and curved lines | tap, spoken | `art:trace` `game:shapes` |
| Decoration for Festival<br>పండుగ అలంకరణ | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 6 “Decoration for Festival” | Confirmed (official CIET/NCERT listing) | `c2.add.2digit` Adding and subtracting 2-digit numbers (needs c2.num.place) | typed | `game:numberline` `game:counting` |
| Rani's Gift<br>రాణి బహుమతి | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 7 “Rani's Gift” | Confirmed (official CIET/NCERT listing) | `c2.meas.length` Measuring length with hand-spans and centimetres (needs c2.add.2digit) | mcq, number-line | `game:numberline` |
| Grouping and Sharing<br>గుంపులు చేయడం, పంచడం | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 8 “Grouping and Sharing” | Confirmed (official CIET/NCERT listing) | `c2.mul.share` Equal groups and equal sharing (needs c2.num.groups) | mcq, typed | `game:counting` `game:fractions` |
| Which Season is it?<br>ఇది ఏ కాలం? | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 9 “Which Season is it?” | Confirmed (official CIET/NCERT listing) | `c2.time.calendar` Days, months and seasons | order, mcq, spoken | `game:logic` |
| Fun at the Fair<br>జాతరలో సరదా | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 10 “Fun at the Fair” | Confirmed (official CIET/NCERT listing) | `c2.money.fair` Buying and getting change (up to ₹100) (needs c2.add.2digit) | typed, mcq | `game:counting` |
| Data Handling<br>దత్తాంశ నిర్వహణ | math | NCERT Joyful Mathematics — Class 2 · NCF-SE 2023 series (current reprint, mapped Nov 2026) · Ch 11 “Data Handling” | Confirmed (official CIET/NCERT listing) | `c2.data.bars` Tally marks and bar graphs (needs c2.add.2digit) | graph, count | `game:counting` |
| Floating and Sinking<br>తేలడం, మునగడం | physics | — | Exploration / enrichment (no textbook chapter)<br>*NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.* | `c2.phy.float` Which things float and which sink? *[enrichment]* | spoken, tap | `game:balance` |
| Magic of Magnets<br>అయస్కాంతాల మాయ | physics | — | Exploration / enrichment (no textbook chapter)<br>*NCF-SE 2023 has no separate EVS textbook in Classes 1–2; this is a WonderLab exploration unit (enrichment), age-appropriate physical science.* | `c2.phy.magnets` What does a magnet pull? (needs c2.phy.float) *[enrichment]* | tap, spoken | `lab:forces` |

## Class 3 (level 5, key `c3`)

Diagnostic templates: `c3.num.to200.bundles`, `c3.pv.hundreds.value`, `c3.pv.addsub3.add`, `c3.mult.groups.fact`, `c3.frac.half-quarter.shaded`, `c3.time.clock-calendar.clock`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| What's in a Name?<br>పేరులో ఏముంది? | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 1 “What's in a Name?” | Secondary sources — needs educator verification<br>*Chapter 1 title needs educator verification.* | `c3.name.tally` Counting with tally marks | count, typed, mcq | `game:counting` |
| Toy Joy<br>బొమ్మల ఆనందం | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 2 “Toy Joy” | Secondary sources — needs educator verification | `c3.toy.solids` Solid shapes around us | match, tap, mcq | `game:shapes` `art:trace` |
| Double Century<br>డబుల్ సెంచరీ | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 3 “Double Century” | Secondary sources — needs educator verification | `c3.num.to200` Numbers up to 200 | typed, number-line | `game:numberline` `game:counting` |
| Vacation with My Nani Maa<br>అమ్మమ్మతో సెలవులు | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 4 “Vacation with My Nani Maa” | Secondary sources — needs educator verification | `c3.addsub.story` Adding and subtracting in stories | typed | `game:balance` |
| Fun with Shapes<br>ఆకారాలతో ఆట | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 5 “Fun with Shapes” | Secondary sources — needs educator verification | `c3.shape.sides` Sides and corners of flat shapes | count, tap | `game:shapes` `art:trace` |
| House of Hundreds – I<br>వందల ఇల్లు – 1 | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 6 “House of Hundreds – I” | Secondary sources — needs educator verification | `c3.pv.hundreds` Hundreds, tens and ones (needs c3.num.to200) | mcq, typed | `game:numberline` |
| Raksha Bandhan<br>రక్షా బంధన్ | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 7 “Raksha Bandhan” | Secondary sources — needs educator verification | `c3.mult.groups` Multiplication as equal groups | count, typed | `game:counting` `game:patterns` |
| Fair Share<br>సమాన భాగం | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 8 “Fair Share” | Secondary sources — needs educator verification | `c3.frac.half-quarter` Halves and quarters | mcq, typed | `game:fractions` |
| House of Hundreds – II<br>వందల ఇల్లు – 2 | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 9 “House of Hundreds – II” | Secondary sources — needs educator verification | `c3.pv.addsub3` Adding and subtracting 3-digit numbers (needs c3.pv.hundreds) | typed | `game:balance` |
| Fun at Class Party!<br>క్లాస్ పార్టీలో సరదా! | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 10 “Fun at Class Party!” | Secondary sources — needs educator verification | `c3.div.share` Sharing equally (division) (needs c3.mult.groups) | typed, mcq | `game:counting` |
| Filling and Lifting<br>నింపడం, ఎత్తడం | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 11 “Filling and Lifting” | Secondary sources — needs educator verification | `c3.meas.cap-weight` Comparing capacity and weight | spoken, typed, mcq | `game:balance` |
| Give and Take<br>ఇచ్చి పుచ్చుకోవడం | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 12 “Give and Take” | Secondary sources — needs educator verification | `c3.money.change` Money: totals and change (needs c3.addsub.story) | typed | `game:balance` |
| Time Goes On<br>కాలం సాగిపోతుంది | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 13 “Time Goes On” | Secondary sources — needs educator verification | `c3.time.clock-calendar` Reading clocks and calendars | mcq, order | `game:numberline` |
| The Surajkund Fair<br>సూరజ్‌కుండ్ జాతర | math | NCERT Maths Mela — Class 3 · 2024-25 first edition (current reprint) · Ch 14 “The Surajkund Fair” | Secondary sources — needs educator verification | `c3.data.fair` Reading pictures and bar graphs; patterns | graph, mcq | `game:patterns` |
| Light and Shadows<br>వెలుగు, నీడలు | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate physical-science exploration; mapping to NCERT EVS "Our Wondrous World" chapters needs educator verification.* | `c3.sci.shadow` How shadows change *[enrichment]* | mcq, tap | `lab:light` `art:color` `lab:light?angle=60` |
| Sounds Around Us<br>మన చుట్టూ శబ్దాలు | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate physical-science exploration; mapping to NCERT EVS "Our Wondrous World" chapters needs educator verification.* | `c3.sci.sound` Sound comes from vibration *[enrichment]* | mcq, tap | `game:patterns` |
| Floating and Sinking<br>తేలడం, మునగడం | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate physical-science exploration; mapping to NCERT EVS "Our Wondrous World" chapters needs educator verification.* | `c3.sci.float` What floats and what sinks? *[enrichment]* | tap, spoken | `game:logic` |
| Push, Pull and Rubbing<br>తోయడం, లాగడం, రాపిడి | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate physical-science exploration; mapping to NCERT EVS "Our Wondrous World" chapters needs educator verification.* | `c3.sci.push-pull` Pushes, pulls and rough or smooth surfaces *[enrichment]* | mcq | `lab:forces` `lab:forces?mass=2&force=10&friction=0.1` `lab:forces?mass=2&force=10&friction=0.6` |

## Class 4 (level 6, key `c4`)

Diagnostic templates: `c4.num.thousands.value`, `c4.ops.addsub.sub`, `c4.meas.length.convert`, `c4.time.clock.elapsed`, `c4.ops.divide.remainder`, `c4.data.bars.more`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Shapes Around Us | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 1 “Shapes Around Us” | Secondary sources — needs educator verification | `c4.shapes.props` Sides, corners, faces and edges | typed, mcq | `game:shapes` `art:trace` |
| Hide and Seek | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 2 “Hide and Seek” | Secondary sources — needs educator verification | `c4.space.views` Views from top and front; positions | mcq, typed | `game:logic` |
| Pattern Around Us | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 3 “Pattern Around Us” | Secondary sources — needs educator verification | `c4.pattern.number` Number and shape patterns | typed, mcq | `game:patterns` |
| Thousands Around Us | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 4 “Thousands Around Us” | Secondary sources — needs educator verification | `c4.num.thousands` Place value up to 9999 | typed, order, number-line | `game:numberline` |
| Sharing and Measuring | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 5 “Sharing and Measuring” | Secondary sources — needs educator verification | `c4.frac.parts` Halves, quarters and equal parts | typed | `game:fractions` |
| Measuring Length | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 6 “Measuring Length” | Secondary sources — needs educator verification | `c4.meas.length` Metres and centimetres | typed, mcq |  |
| The Cleanest Village | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 7 “The Cleanest Village” | Secondary sources — needs educator verification | `c4.ops.addsub` Adding and subtracting 4-digit numbers (needs c4.num.thousands) | typed |  |
| Weigh it, Pour it | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 8 “Weigh it, Pour it” | Secondary sources — needs educator verification | `c4.meas.mass-cap` Kilograms, grams, litres and millilitres | typed, mcq | `game:balance` |
| Equal Groups | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 9 “Equal Groups” | Secondary sources — needs educator verification | `c4.ops.mult` Multiplication as equal groups | count, typed | `game:counting` |
| Elephants, Tigers, and Leopards | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 10 “Elephants, Tigers, and Leopards” | Secondary sources — needs educator verification<br>*One secondary listing numbers this chapter 11.* | `c4.num.reverse` Number puzzles and wildlife word problems (needs c4.ops.addsub) | typed | `game:logic` |
| Fun with Symmetry | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 11 “Fun with Symmetry” | Secondary sources — needs educator verification | `c4.geo.symmetry` Lines of symmetry (needs c4.shapes.props) | tap, mcq | `art:color` `game:shapes` |
| Ticking Clocks and Turning Calendar | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 12 “Ticking Clocks and Turning Calendar” | Secondary sources — needs educator verification | `c4.time.clock` Reading clocks, time taken and calendars | mcq, typed |  |
| The Transport Museum | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 13 “The Transport Museum” | Secondary sources — needs educator verification<br>*One secondary listing numbers this chapter 14.* | `c4.ops.divide` Tables of 11–20 and division with remainders (needs c4.ops.mult) | typed |  |
| Data Handling | math | NCERT Maths Mela — Class 4 · 2025-26 first edition (current reprint) · Ch 14 “Data Handling” | Secondary sources — needs educator verification | `c4.data.bars` Reading bar graphs and tables | graph |  |
| Simple Machines | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate exploration; mapping to the Class 4 EVS book (Our Wondrous World) needs educator verification.* | `c4.phy.machines` Levers, pulleys, ramps and wheels | typed, match, mcq | `game:balance` `lab:forces` `lab:forces?mass=20&force=50&friction=0.1` |
| Fun with Magnets | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate exploration; magnets are formally studied in Class 6 Curiosity ch. 4. EVS mapping needs educator verification.* | `c4.phy.magnets` Magnetic materials, poles and the compass | tap, drag, mcq |  |

## Class 5 (level 7, key `c5`)

Diagnostic templates: `c5.num.large.value`, `c5.frac.add.unlike`, `c5.meas.km.convert`, `c5.ops.muldiv.mult`, `c5.meas.area.rect`, `c5.num.multiples.common`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| We the Travellers — I | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 1 “We the Travellers—I” | Secondary sources — needs educator verification | `c5.num.large` Reading and rounding large numbers (Indian system) | typed | `game:numberline` |
| Fractions | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 2 “Fractions” | Secondary sources — needs educator verification | `c5.frac.equiv` Equivalent fractions and comparing<br>`c5.frac.add` Adding fractions (needs c5.frac.equiv) | typed, mcq | `game:fractions` |
| Angles as Turns | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 3 “Angles as Turns” | Secondary sources — needs educator verification | `c5.geo.turns` Turns, right angles and degrees | typed, mcq |  |
| We the Travellers — II | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 4 “We the Travellers—II” | Secondary sources — needs educator verification | `c5.ops.large` Operations with large numbers (needs c5.num.large) | typed |  |
| Far and Near | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 5 “Far and Near” | Secondary sources — needs educator verification | `c5.meas.km` Kilometres and metres | typed |  |
| The Dairy Farm | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 6 “The Dairy Farm” | Secondary sources — needs educator verification | `c5.ops.dairy` Multiplication and division with litres | typed |  |
| Shapes and Patterns | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 7 “Shapes and Patterns” | Secondary sources — needs educator verification | `c5.geo.tiling` Tiling and growing patterns | typed, tap | `game:patterns` `game:shapes` |
| Weight and Capacity | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 8 “Weight and Capacity” | Secondary sources — needs educator verification | `c5.meas.mass-cap` Converting and comparing weight and capacity | typed | `game:balance` |
| Coconut Farm | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 9 “Coconut Farm” | Secondary sources — needs educator verification | `c5.ops.muldiv` Multiplying and dividing bigger numbers | typed |  |
| Symmetrical Designs | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 10 “Symmetrical Designs” | Secondary sources — needs educator verification | `c5.geo.symm` Reflection and rotational symmetry in designs | mcq, typed | `art:color` |
| Grandmother's Quilt | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 11 “Grandmother's Quilt” | Secondary sources — needs educator verification | `c5.meas.area` Area and perimeter | count, typed |  |
| Racing Seconds | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 12 “Racing Seconds” | Secondary sources — needs educator verification | `c5.time.seconds` Seconds and minutes | typed, order |  |
| Animal Jumps | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 13 “Animal Jumps” | Secondary sources — needs educator verification | `c5.num.multiples` Multiples, factors and common multiples | number-line, typed, tap | `game:numberline` |
| Maps and Locations | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 14 “Maps and Locations” | Secondary sources — needs educator verification | `c5.geo.maps` Directions and map scale | typed, mcq |  |
| Data Through Pictures | math | NCERT Maths Mela — Class 5 · 2025-26 first edition (June 2025) · Ch 15 “Data Through Pictures” | Secondary sources — needs educator verification | `c5.data.picto` Pictographs and bar graphs | typed, graph |  |
| Floating and Sinking | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate exploration; mapping to the Class 5 EVS book needs educator verification.* | `c5.phy.float` What floats and what sinks? | drag, mcq |  |
| Rough and Smooth: Friction | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate exploration; mapping to the Class 5 EVS book needs educator verification.* | `c5.phy.friction` Friction slows things down | order, mcq | `lab:forces` `lab:forces?mass=5&force=20&friction=0.1` `lab:forces?mass=5&force=20&friction=0.5` |
| Light and Shadows | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate exploration; mapping to the Class 5 EVS book needs educator verification.* | `c5.phy.light` Transparent, translucent, opaque and shadows | match, mcq | `lab:light` `lab:light?angle=30` |
| Sounds Around Us | physics | — | Exploration / enrichment (no textbook chapter)<br>*Age-appropriate exploration; mapping to the Class 5 EVS book needs educator verification.* | `c5.phy.sound` Vibrations and pitch | mcq |  |

## Class 6 (level 8, key `c6`)

Diagnostic templates: `c6.pat.sequences.next`, `c6.prime.factors.common`, `c6.mens.rect.rect`, `c6.frac.equiv-add.add`, `c6.int.add.add`, `c6.phy.length.convert`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Patterns in Mathematics<br>గణితంలో అమరికలు | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 1 “Patterns in Mathematics” | Secondary sources — needs educator verification | `c6.pat.sequences` Number sequences and their rules | typed, mcq | `game:patterns` |
| Lines and Angles<br>రేఖలు మరియు కోణాలు | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 2 “Lines and Angles” | Secondary sources — needs educator verification | `c6.ang.measure` Types of angles and angles on a line | mcq, typed | `game:shapes` `art:trace` |
| Number Play<br>సంఖ్యలతో ఆట | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 3 “Number Play” | Secondary sources — needs educator verification | `c6.num.play` Place value, estimation and number puzzles | typed, tap | `game:logic` `game:numberline` |
| Data Handling and Presentation<br>దత్తాంశ నిర్వహణ మరియు ప్రదర్శన | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 4 “Data Handling and Presentation” | Secondary sources — needs educator verification | `c6.data.read` Tally marks, pictographs and bar graphs | graph, typed, count |  |
| Prime Time<br>ప్రధాన సంఖ్యల సమయం | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 5 “Prime Time” | Secondary sources — needs educator verification | `c6.prime.factors` Primes, factors, multiples and co-primes | mcq, typed | `game:logic` |
| Perimeter and Area<br>చుట్టుకొలత మరియు వైశాల్యం | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 6 “Perimeter and Area” | Secondary sources — needs educator verification | `c6.mens.rect` Perimeter and area of rectangles and squares | typed, count | `game:shapes` |
| Fractions<br>భిన్నాలు | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 7 “Fractions” | Secondary sources — needs educator verification | `c6.frac.equiv-add` Equivalent fractions, comparing and adding | typed, mcq, number-line | `game:fractions` |
| Playing with Constructions<br>నిర్మాణాలతో ఆట | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 8 “Playing with Constructions” | Secondary sources — needs educator verification | `c6.cons.compass` Constructing with ruler and compass (needs c6.ang.measure) | typed, order, tap | `art:trace` |
| Symmetry<br>సౌష్ఠవం | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 9 “Symmetry” | Secondary sources — needs educator verification | `c6.sym.lines` Lines of symmetry and rotational symmetry | typed, tap | `game:shapes` `art:color` |
| The Other Side of Zero<br>సున్నాకు అవతలి వైపు | math | NCERT Ganita Prakash — Class 6 · 2024-25 first edition (current reprint) · Ch 10 “The Other Side of Zero” | Secondary sources — needs educator verification | `c6.int.add` Negative numbers: ordering, adding and subtracting | number-line, typed, order, mcq | `game:numberline` |
| Exploring Magnets | physics | NCERT Science: Curiosity — Class 6 · 2024-25 first edition · Ch 4 “Exploring Magnets” | Secondary sources — needs educator verification | `c6.phy.magnets` Magnetic materials, poles and the compass | tap, mcq | `lab:forces` |
| Measurement of Length and Motion | physics | NCERT Science: Curiosity — Class 6 · 2024-25 first edition · Ch 5 “Measurement of Length and Motion” | Secondary sources — needs educator verification | `c6.phy.length` SI units of length and conversions<br>`c6.phy.motion-types` Types of motion | typed, mcq, match | `lab:motion` `lab:motion?u=2&a=0&t=10` |
| Temperature and its Measurement | physics | NCERT Science: Curiosity — Class 6 · 2024-25 first edition · Ch 7 “Temperature and its Measurement” | Secondary sources — needs educator verification | `c6.phy.temp` Reading thermometers in °C | typed, mcq, order |  |
| A Journey through States of Water | physics | NCERT Science: Curiosity — Class 6 · 2024-25 first edition · Ch 8 “A Journey through States of Water” | Secondary sources — needs educator verification<br>*Physical-science portion only (changes of state, evaporation).* | `c6.phy.states` Melting, boiling, evaporation and condensation (needs c6.phy.temp) | mcq, match, tap |  |

## Class 7 (level 9, key `c7`)

Diagnostic templates: `c7.expr.order.eval`, `c7.dec.place.compare`, `c7.frac.muldiv.mul`, `c7.int.muldiv.mul`, `c7.alg.equations.solve`, `c7.phy.speed.speed`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Large Numbers Around Us | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 1 “Large Numbers Around Us” | Secondary sources — needs educator verification | `c7.num.large` Lakhs, crores and the Indian place-value system | typed | `game:numberline` |
| Arithmetic Expressions | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 2 “Arithmetic Expressions” | Secondary sources — needs educator verification | `c7.expr.order` Evaluating expressions: brackets and order of operations | typed, mcq | `game:logic` |
| A Peek Beyond the Point | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 3 “A Peek Beyond the Point” | Secondary sources — needs educator verification | `c7.dec.place` Decimal place value, comparing and units | mcq, typed, number-line | `game:numberline` |
| Expressions using Letter-Numbers | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 4 “Expressions using Letter-Numbers” | Secondary sources — needs educator verification | `c7.alg.expr` Writing and simplifying algebraic expressions (needs c7.expr.order) | typed, mcq | `game:balance` |
| Parallel and Intersecting Lines | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 5 “Parallel and Intersecting Lines” | Secondary sources — needs educator verification | `c7.geo.transversal` Angles made by a transversal | typed, mcq | `art:trace` |
| Number Play | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 6 “Number Play” | Secondary sources — needs educator verification | `c7.num.parity` Parity, divisibility and number puzzles | mcq, typed | `game:logic` |
| A Tale of Three Intersecting Lines | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 7 “A Tale of Three Intersecting Lines” | Secondary sources — needs educator verification | `c7.geo.triangle` Angle sum and triangle inequality (needs c7.geo.transversal) | typed, mcq | `game:shapes` |
| Working with Fractions | math | NCERT Ganita Prakash — Class 7 Part 1 · 2025-26 first edition · Ch 8 “Working with Fractions” | Secondary sources — needs educator verification | `c7.frac.muldiv` Multiplying and dividing fractions | typed | `game:fractions` |
| Geometric Twins | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 1 “Geometric Twins” | Secondary sources — needs educator verification | `c7.geo.congruent` Congruent triangles: SSS, SAS, ASA, RHS (needs c7.geo.triangle) | mcq, typed | `game:shapes` |
| Operations with Integers | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 2 “Operations with Integers” | Secondary sources — needs educator verification | `c7.int.muldiv` Multiplying and dividing integers | typed | `game:numberline` |
| Finding Common Ground | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 3 “Finding Common Ground” | Secondary sources — needs educator verification | `c7.num.hcf-lcm` HCF and LCM in everyday problems (needs c7.num.parity) | typed | `game:logic` |
| Another Peek Beyond the Point | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 4 “Another Peek Beyond the Point” | Secondary sources — needs educator verification | `c7.dec.ops` Multiplying and dividing decimals (needs c7.dec.place) | typed |  |
| Connecting the Dots | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 5 “Connecting the Dots” | Secondary sources — needs educator verification | `c7.data.average` Mean, median and mode | typed, graph |  |
| Constructions and Tilings | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 6 “Constructions and Tilings” | Secondary sources — needs educator verification | `c7.geo.tiling` Tiling with regular polygons (needs c7.geo.triangle) | typed, mcq | `game:shapes` `art:color` |
| Finding the Unknown | math | NCERT Ganita Prakash — Class 7 Part 2 · 2025-26 first edition · Ch 7 “Finding the Unknown” | Secondary sources — needs educator verification | `c7.alg.equations` Solving simple equations (needs c7.alg.expr) | typed | `game:balance` |
| Electricity: Circuits and their Components | physics | NCERT Science: Curiosity — Class 7 · 2025-26 first edition · Ch 3 “Electricity: Circuits and their Components” | Secondary sources — needs educator verification | `c7.phy.circuits` Closed circuits, conductors and insulators | tap, mcq, match | `lab:circuit` `game:circuits` `lab:circuit?cells=1&bulbs=1&closed=0` `lab:circuit?cells=2&bulbs=1&closed=1` |
| Heat Transfer in Nature | physics | NCERT Science: Curiosity — Class 7 · 2025-26 first edition · Ch 7 “Heat Transfer in Nature” | Secondary sources — needs educator verification | `c7.phy.heat` Conduction, convection and radiation | mcq, tap |  |
| Measurement of Time and Motion | physics | NCERT Science: Curiosity — Class 7 · 2025-26 first edition · Ch 8 “Measurement of Time and Motion” | Secondary sources — needs educator verification | `c7.phy.speed` Speed = distance ÷ time (with units)<br>`c7.phy.dt-graph` Distance–time graphs and time measurement (needs c7.phy.speed) | typed, graph | `lab:motion` `lab:motion?u=2&a=0&t=10` `lab:motion?u=3&a=0&t=8` |
| Light: Shadows and Reflections | physics | NCERT Science: Curiosity — Class 7 · 2025-26 first edition · Ch 11 “Light: Shadows and Reflections” | Secondary sources — needs educator verification | `c7.phy.reflection` Shadows and the laws of reflection | typed, mcq | `lab:light` `lab:light?angle=30` `lab:light?angle=60` |
| Earth, Moon, and the Sun | physics | NCERT Science: Curiosity — Class 7 · 2025-26 first edition · Ch 12 “Earth, Moon, and the Sun” | Secondary sources — needs educator verification<br>*Enrichment within physical science: day/night, phases and eclipses as consequences of light travelling in straight lines.* | `c7.phy.earth-moon` Day and night, Moon phases and eclipses (needs c7.phy.reflection) *[enrichment]* | mcq, order | `lab:light` |

## Class 8 (level 10, key `c8`)

Diagnostic templates: `c8.sq.roots.sqrt`, `c8.pow.laws.combine`, `c8.ratio.basic.share`, `c8.pct.basic.discount`, `c8.pyth.theorem.hyp`, `c8.phy.pressure.calc`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| A Square and A Cube<br>వర్గం మరియు ఘనం | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 1 “A Square and A Cube” | Secondary sources — needs educator verification | `c8.sq.roots` Squares, cubes and their roots | typed, mcq | `game:patterns` |
| Power Play<br>ఘాతాంకాల ఆట | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 2 “Power Play” | Secondary sources — needs educator verification | `c8.pow.laws` Exponents and the laws of exponents (needs c8.sq.roots) | typed, mcq |  |
| A Story of Numbers<br>సంఖ్యల కథ | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 3 “A Story of Numbers” | Secondary sources — needs educator verification | `c8.num.systems` Number systems: Roman numerals and other bases | typed |  |
| Quadrilaterals<br>చతుర్భుజాలు | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 4 “Quadrilaterals” | Secondary sources — needs educator verification | `c8.quad.props` Properties of quadrilaterals | typed, match | `game:shapes` `art:trace` |
| Number Play<br>సంఖ్యలతో ఆట | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 5 “Number Play” | Secondary sources — needs educator verification | `c8.np.divis` Divisibility rules and digit puzzles | mcq, typed | `game:logic` |
| We Distribute, Yet Things Multiply<br>విభాగ న్యాయం — గుణకారాల విస్తరణ | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 6 “We Distribute, Yet Things Multiply” | Secondary sources — needs educator verification | `c8.alg.expand` Expanding products and standard identities (needs c8.pow.laws) | typed |  |
| Proportional Reasoning-1<br>అనుపాత తర్కం-1 | math | NCERT Ganita Prakash — Class 8 Part 1 · 2025-26 first edition (July 2025) · Ch 7 “Proportional Reasoning-1” | Secondary sources — needs educator verification | `c8.ratio.basic` Ratios and proportions | typed, mcq | `game:balance` |
| Fractions in Disguise<br>మారువేషంలో భిన్నాలు (శాతాలు) | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 1 “Fractions in Disguise” | Secondary sources — needs educator verification | `c8.pct.basic` Percentages, discounts and profit (needs c8.ratio.basic) | typed | `game:fractions` |
| The Baudhayana-Pythagoras Theorem<br>బౌధాయన-పైథాగరస్ సిద్ధాంతం | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 2 “The Baudhayana-Pythagoras Theorem” | Secondary sources — needs educator verification | `c8.pyth.theorem` Using the Baudhayana-Pythagoras theorem (needs c8.sq.roots) | typed, mcq |  |
| Proportional Reasoning-2<br>అనుపాత తర్కం-2 | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 3 “Proportional Reasoning-2” | Secondary sources — needs educator verification | `c8.ratio.direct-inverse` Direct and inverse proportion (needs c8.ratio.basic) | typed, mcq |  |
| Exploring Some Geometric Themes<br>కొన్ని జ్యామితీయ అంశాల అన్వేషణ | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 4 “Exploring Some Geometric Themes” | Secondary sources — needs educator verification | `c8.geo.solids` Faces, edges, vertices and Euler's formula | typed, match | `game:shapes` |
| Tales by Dots and Lines<br>చుక్కలు, గీతలు చెప్పే కథలు | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 5 “Tales by Dots and Lines” | Secondary sources — needs educator verification | `c8.data.graphs` Reading line graphs and bar graphs; mean and median | graph, typed |  |
| Algebra Play<br>బీజగణితంతో ఆట | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 6 “Algebra Play” | Secondary sources — needs educator verification | `c8.alg.equations` Solving linear equations and number tricks (needs c8.alg.expand) | typed | `game:balance` |
| Area<br>వైశాల్యం | math | NCERT Ganita Prakash — Class 8 Part 2 · 2025-26 first edition · Ch 7 “Area” | Secondary sources — needs educator verification | `c8.area.polygons` Area of trapeziums, rhombuses and polygons (needs c8.quad.props) | typed |  |
| Electricity: Magnetic and Heating Effects | physics | NCERT Science: Curiosity — Class 8 · 2025-26 first edition · Ch 4 “Electricity: Magnetic and Heating Effects” | Secondary sources — needs educator verification | `c8.phy.elec-effects` Heating and magnetic effects of current | tap, mcq, typed | `lab:circuit` `game:circuits` `lab:circuit?cells=2&bulbs=1&closed=1` |
| Exploring Forces | physics | NCERT Science: Curiosity — Class 8 · 2025-26 first edition · Ch 5 “Exploring Forces” | Secondary sources — needs educator verification | `c8.phy.forces` Net force, contact and non-contact forces, friction | typed, mcq | `lab:forces` `lab:forces?mass=5&force=20&friction=0` `lab:forces?mass=5&force=20&friction=0.3` |
| Pressure, Winds, Storms, and Cyclones | physics | NCERT Science: Curiosity — Class 8 · 2025-26 first edition · Ch 6 “Pressure, Winds, Storms, and Cyclones” | Secondary sources — needs educator verification | `c8.phy.pressure` Pressure = force ÷ area (needs c8.phy.forces) | typed, mcq, order | `lab:forces` |
| Light: Mirrors and Lenses | physics | NCERT Science: Curiosity — Class 8 · 2025-26 first edition · Ch 10 “Light: Mirrors and Lenses” | Secondary sources — needs educator verification | `c8.phy.mirrors` Laws of reflection, spherical mirrors and lenses | typed, match, mcq | `lab:light` `lab:light?angle=40` |

## Class 9 (level 11, key `c9`)

Diagnostic templates: `c9.coord.plane.dist`, `c9.num.real.simplify`, `c9.area.heron.heron`, `c9.prob.experimental.theory`, `c9.lin.twovar.findy`, `c9.phy.kinematics.v`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Orienting Yourself: The Use of Coordinates | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 1 “Orienting Yourself: The Use of Coordinates” | Secondary sources — needs educator verification | `c9.coord.plane` Points, quadrants and distances on the coordinate plane | mcq, typed | `game:numberline` |
| Introduction to Linear Polynomials | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 2 “Introduction to Linear Polynomials” | Secondary sources — needs educator verification | `c9.poly.linear` Linear polynomials: values and zeroes (needs c9.coord.plane) | typed, graph |  |
| The World of Numbers | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 3 “The World of Numbers” | Secondary sources — needs educator verification | `c9.num.real` Rational and irrational numbers; surds | mcq, typed |  |
| Exploring Algebraic Identities | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 4 “Exploring Algebraic Identities” | Secondary sources — needs educator verification | `c9.alg.identities` Using and factorising with identities (needs c9.poly.linear) | typed, mcq |  |
| I'm Up and Down, and Round and Round | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 5 “I'm Up and Down, and Round and Round” | Secondary sources — needs educator verification<br>*Topic coverage (circles: chords, angles, circumference) inferred from the chapter title and secondary summaries — needs educator verification against the chapter content.* | `c9.circ.basics` Circles: circumference, chords and angles | typed | `art:trace` |
| Measuring Space: Perimeter and Area | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 6 “Measuring Space: Perimeter and Area” | Secondary sources — needs educator verification | `c9.area.heron` Perimeter and area, including Heron's formula | typed |  |
| The Mathematics of Maybe: Introduction to Probability | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 7 “The Mathematics of Maybe: Introduction to Probability” | Secondary sources — needs educator verification | `c9.prob.experimental` Experimental and theoretical probability | typed, match | `game:logic` |
| Predicting What Comes Next: Exploring Sequences and Progressions | math | NCERT Ganita Manjari — Class 9 Part 1 · 2026-27 first edition · Ch 8 “Predicting What Comes Next: Exploring Sequences and Progressions” | Secondary sources — needs educator verification | `c9.seq.ap-gp` Arithmetic and geometric patterns | typed, mcq | `game:patterns` |
| Propositions and their Converses | math | NCERT Ganita Manjari — Class 9 Part 2 · 2026-27 first edition · Ch 9 “Propositions and their Converses” | Needs educator verification | `c9.logic.converse` Statements, converses and counterexamples | mcq | `game:logic` |
| How Quantities Combine: Understanding Data | math | NCERT Ganita Manjari — Class 9 Part 2 · 2026-27 first edition · Ch 10 “How Quantities Combine: Understanding Data” | Needs educator verification | `c9.data.central` Mean, median, mode and weighted mean | typed, graph |  |
| The World of Algorithms | math | NCERT Ganita Manjari — Class 9 Part 2 · 2026-27 first edition · Ch 11 “The World of Algorithms” | Needs educator verification | `c9.algo.steps` Following and ordering algorithms (Euclid's HCF, sorting) | typed, order | `game:logic` |
| Quadrilaterals | math | NCERT Ganita Manjari — Class 9 Part 2 · 2026-27 first edition · Ch 12 “Quadrilaterals” | Needs educator verification | `c9.quad.para` Parallelogram properties and the mid-point theorem | typed, tap |  |
| Two Variables, One Line | math | NCERT Ganita Manjari — Class 9 Part 2 · 2026-27 first edition · Ch 13 “Two Variables, One Line” | Needs educator verification | `c9.lin.twovar` Linear equations in two variables and their graphs (needs c9.poly.linear) | typed, tap | `game:numberline` |
| Math of Space: Surface Area and Volume | math | NCERT Ganita Manjari — Class 9 Part 2 · 2026-27 first edition · Ch 14 “Math of Space: Surface Area and Volume” | Needs educator verification | `c9.solid.sa-vol` Surface area and volume of cuboids, cylinders, cones and spheres (needs c9.area.heron) | typed |  |
| Describing Motion Around Us | physics | NCERT Science: Exploration — Class 9 · 2026-27 first edition · Ch 4 “Describing Motion Around Us” | Secondary sources — needs educator verification | `c9.phy.speed` Distance, displacement, speed and velocity<br>`c9.phy.kinematics` Uniform acceleration: v = u + at and s = ut + ½at² (needs c9.phy.speed) | typed, graph | `lab:motion` `lab:motion?u=10&a=0&t=5` `lab:motion?u=0&a=2&t=5` |
| How Forces Affect Motion | physics | NCERT Science: Exploration — Class 9 · 2026-27 first edition · Ch 6 “How Forces Affect Motion” | Secondary sources — needs educator verification | `c9.phy.newton` Newton's second law F = ma and momentum (needs c9.phy.kinematics) | typed, mcq | `lab:forces` `lab:forces?mass=4&force=12&friction=0` |
| Work, Energy, and Simple Machines | physics | NCERT Science: Exploration — Class 9 · 2026-27 first edition · Ch 7 “Work, Energy, and Simple Machines” | Secondary sources — needs educator verification | `c9.phy.energy` Work, kinetic and potential energy, power, mechanical advantage (needs c9.phy.newton) | typed | `lab:forces` `game:balance` |
| Sound Waves: Characteristics and Applications | physics | NCERT Science: Exploration — Class 9 · 2026-27 first edition · Ch 10 “Sound Waves: Characteristics and Applications” | Secondary sources — needs educator verification | `c9.phy.sound` Wave speed, frequency, wavelength and echoes | typed, mcq |  |

## Class 10 (level 12, key `c10`)

Diagnostic templates: `c10.real.hcf-lcm.hcf`, `c10.pair.solve.elim`, `c10.ap.nth-sum.nth`, `c10.trig.ratios.ratio`, `c10.prob.classical.bag`, `c10.phy.ohm.calc`

| Unit | Subject | Source (book · edition · chapter) | Status | Objectives (prereqs) | Practice item types | Linked activities |
|---|---|---|---|---|---|---|
| Real Numbers | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 1 “Real Numbers” | Needs educator verification | `c10.real.hcf-lcm` HCF and LCM by prime factorisation | typed, mcq | `game:logic` |
| Polynomials | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 2 “Polynomials” | Needs educator verification | `c10.poly.zeroes` Zeroes and coefficients of a quadratic | typed, mcq |  |
| Pair of Linear Equations in Two Variables | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 3 “Pair of Linear Equations in Two Variables” | Needs educator verification | `c10.pair.solve` Solve a pair of linear equations | typed, mcq | `game:balance` |
| Quadratic Equations | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 4 “Quadratic Equations” | Needs educator verification | `c10.quad.roots` Solve quadratics and read the discriminant (needs c10.poly.zeroes) | typed, mcq |  |
| Arithmetic Progressions | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 5 “Arithmetic Progressions” | Needs educator verification | `c10.ap.nth-sum` nth term and sum of an AP | typed | `game:patterns` |
| Triangles | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 6 “Triangles” | Needs educator verification | `c10.tri.similar` Similar triangles and the Basic Proportionality Theorem | typed |  |
| Coordinate Geometry | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 7 “Coordinate Geometry” | Needs educator verification | `c10.coord.distance` Distance and section formulae | typed | `game:numberline` |
| Introduction to Trigonometry | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 8 “Introduction to Trigonometry” | Needs educator verification | `c10.trig.ratios` Trigonometric ratios and standard values (needs c10.coord.distance) | typed, mcq, match |  |
| Some Applications of Trigonometry | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 9 “Some Applications of Trigonometry” | Needs educator verification | `c10.trig.heights` Heights and distances (needs c10.trig.ratios) | typed, mcq |  |
| Circles | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 10 “Circles” | Needs educator verification | `c10.circ.tangent` Tangents to a circle (needs c10.coord.distance) | typed |  |
| Areas Related to Circles | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 11 “Areas Related to Circles” | Needs educator verification | `c10.circ.sector` Area of a sector and length of an arc | typed | `game:fractions` |
| Surface Areas and Volumes | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 12 “Surface Areas and Volumes” | Needs educator verification | `c10.solid.volume` Volumes of combined solids (needs c10.circ.sector) | typed |  |
| Statistics | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 13 “Statistics” | Needs educator verification | `c10.stat.grouped` Mean and modal class of grouped data | graph |  |
| Probability | math | NCERT Mathematics — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 14 “Probability” | Needs educator verification | `c10.prob.classical` Theoretical probability | typed | `game:logic` |
| Light – Reflection and Refraction | physics | NCERT Science — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 9 “Light – Reflection and Refraction” | Needs educator verification | `c10.phy.mirror` Mirror and lens formulae<br>`c10.phy.refraction` Refractive index and speed of light | typed, mcq | `lab:light` `lab:light?angle=30` `lab:light?angle=45` |
| The Human Eye and the Colourful World | physics | NCERT Science — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 10 “The Human Eye and the Colourful World” | Needs educator verification | `c10.phy.power` Power of a lens and defects of vision (needs c10.phy.mirror) | typed, mcq | `lab:light` |
| Electricity | physics | NCERT Science — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 11 “Electricity” | Needs educator verification | `c10.phy.ohm` Ohm's law numericals (with units)<br>`c10.phy.resist` Resistors in series and parallel (needs c10.phy.ohm)<br>`c10.phy.power-energy` Electric power and energy bills (needs c10.phy.ohm) | typed | `lab:circuit` `game:circuits` `lab:circuit?cells=2&bulbs=1&closed=1` `lab:circuit?cells=4&bulbs=2&closed=1` `lab:circuit?cells=2&bulbs=3&closed=1` |
| Magnetic Effects of Electric Current | physics | NCERT Science — Class 10 · Rationalised edition (2023-24 onward), used for 2026-27 · Ch 12 “Magnetic Effects of Electric Current” | Needs educator verification | `c10.phy.magnetic` Field lines, right-hand rule and Fleming's left-hand rule (needs c10.phy.ohm) | mcq, order, tap | `lab:circuit` |
