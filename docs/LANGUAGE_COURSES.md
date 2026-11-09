# Language courses — Telugu (తెలుగు) and English

Mounted at `/lang/*` (`src/features/language/index.tsx`). All content is original wording written for WonderLab.
Data and logic are plain TypeScript (`telugu/script.ts`, `telugu/course.ts`, `english/course.ts`, `passages.ts`,
`tracing.ts`, `engine.ts`) and are validated by `tests/language.test.ts`.

> **Status: draft — needs educator review.** Nothing in this course has been reviewed by a qualified teacher.
> **Every Telugu string needs review by a native-speaker Telugu teacher** before release (see the
> "Needs review" section). Record sign-off in `docs/REVIEW_CHECKLIST.md`.

## Routes

| Route | Screen |
|---|---|
| `/lang` | Choose Telugu or English |
| `/lang/:course` (`?class=N`) | Course map for the learner's class; chips for every class, "Revisit" (earlier) and "Explore" (next) |
| `/lang/:course/:unitId` | Unit page (objectives, tracing and read-along links) |
| `/lang/:course/:unitId/:objectiveId?mode=learn\|practice\|test` | Learn / Practice / Test |
| `/lang/:course/trace/:setId` | Letter tracing (canvas) |
| `/lang/:course/print/:setId` | Printable tracing sheet (`window.print()`) |
| `/lang/:course/read/:passageId` | Read-along passage + comprehension questions |

## Activities

- **Learn** — introduction (read aloud), ≥2 worked examples per objective (each with a Listen button), a tap-to-hear
  letter explorer (letter, picture, word) for letter units, and interactive builders: గుణింతం builder (consonant +
  vowel sign → syllable, full row shown and spoken), ఒత్తు builder (consonant + conjunct; labels ద్విత్వ/సంయుక్త),
  CVC word builder (English).
- **Practice / Test** — ≥5 validated items per objective (static banks or deterministic generators from the letter tables).
  Item types: listen-and-tap (letter, syllable, word, spelling dictation), picture ↔ letter/word (both directions),
  build (tap tiles: consonant + sign, syllables → word, letters → CVC word), sentence ordering (Telugu items accept
  listed alternative word orders), fill the blank, grammar MCQs, typed answers (middle/senior tiers; on-screen Telugu
  keyboard; younger tiers get the same item as multiple choice).
  Practice: immediate feedback in words + icon, progressive hints (authored hint → remove a wrong option / show the first
  tile), answer shown after two tries. Test: no hints/feedback until Submit, then a full review with correct answers
  and explanations. Rounds are seeded (`buildRound`) so a resumed session shows the same items.
- **Letter tracing** — glyph rendered with Noto Sans Telugu / Andika onto a canvas; dotted outline, faint fill, green
  start dot ("1"). Scoring renders the glyph into a 96×96 mask and compares it with the learner's ink: coverage of the
  glyph vs. ink outside a dilated glyph mask; Easy / Medium / Tricky tolerance. Pointer Events (`touch-action: none`)
  for finger, mouse or pen; per-letter best stars saved.
- **Read-along** — line-by-line narration with word-by-word highlighting (whole-line static highlight when reduced
  motion is on), tap any word to hear it, tap ▶ on a line to start there, then 2–4 comprehension questions.
- **Telugu narration** uses `speak(text, 'te')` from `src/lib/audio.ts`; when the device has no Telugu voice
  (`hasVoice('te')` is false) a note says "Telugu voice not available on this device — read along with the text", and
  listen-and-tap items show the written word instead.
- **Show in English** toggle (Telugu course): every Telugu prompt, intro, example, explanation, hint and passage line
  has an English gloss so English-reading parents can help.

Persistence: `saveActivityState('lang:<course>/<unit>/<objective>', { learned, practiceBest, testBest, session })`,
`lang:<course>/trace/<set>`, `lang:read/<passage>`. Attempts: `recordAttempt({ questionId: 'lang:<course>/<unit>/<objective>/<item>', objectiveId: 'lang:<course>/<unit>/<objective>', … })`.
Pass mark 80%. `setLastActivity` on every objective, trace set and passage.

Badges: `lang:te-vowels` (all అచ్చులు), `lang:te-consonants` (all హల్లులు), `lang:te-gunintham`, `lang:en-alphabet`
(unit badges — every objective in the unit passed), `lang:first-story` (first read-along completed),
`lang:first-trace-te`, `lang:first-trace-en` (first letter traced with ≥2 stars).

## Telugu course map (తెలుగు) — Telangana/AP SCERT-style progression

| Class | Unit (id) | Objectives (items) | Trace / Read |
|---|---|---|---|
| Nursery | అచ్చులు: అ–ఊ (`te-n-vowels`) | Listen & tap (6) · Picture ↔ letter (6) | `te-vowels-1` · rhyme అమ్మా ఆవూ |
| LKG | అచ్చులు – 16 (`te-l-vowels`) ★ | Listen & tap (16) · Picture ↔ letter (16) | `te-vowels` · rhyme ఏనుగు ఏనుగు |
| LKG | హల్లులు క–ఞ (`te-l-cons1`) | Listen & tap (10) · Picture ↔ letter (10) | `te-cons-1` |
| UKG | హల్లులు ట–న (`te-u-cons2`) | Listen & tap (10) · Picture ↔ letter (10) | `te-cons-1` |
| UKG | హల్లులు ప–ఱ (`te-u-cons3`) | Listen & tap (16) · Picture ↔ letter (16) | `te-cons-2` · rhyme పడవ పాట |
| UKG | హల్లులు – అన్నీ (`te-u-hallulu`) ★ | Letter → picture (28) · అచ్చా? హల్లా? (8) | |
| Class 1 | గుణింతాలు (`te-1-gunintham`) ★ | Build syllable (12) · Choose syllable (10) · Listen & find (10) · Sign names (7) | |
| Class 1 | చిన్న పదాలు (`te-1-words`) | Picture → word (10) · Build word from syllables (10) | story బడికి వెళ్దాం |
| Class 1 | సంఖ్యా పదాలు 1–10 (`te-1-numbers`) | Number → word (10) · Listen → number (10) | |
| Class 2 | ఒత్తులు పరిచయం (`te-2-ottulu`) | Add an ఒత్తు (8) · Words with ఒత్తులు (7) | |
| Class 2 | చిన్న వాక్యాలు (`te-2-sentences`) | Sentence order (6) · Fill the blank (6) | story చిలుక – కాకి |
| Class 2 | వ్యతిరేక పదాలు, వారాలు, నెలలు (`te-2-words`) | Opposites (10) · Days (7) · Telugu months (12) | |
| Class 3 | ద్విత్వ / సంయుక్త (`te-3-ottulu`) | Double or mixed? (8) · Listen & choose spelling (6) | story తెలివైన కుందేలు |
| Class 3 | నామవాచకం, సర్వనామం (`te-3-grammar`) | Nouns (6) · Pronouns (6) | |
| Class 4 | క్రియ, విశేషణం (`te-4-grammar`) | Verbs (6) · Adjectives (6) | story మొక్క నాటిన మీనా |
| Class 4 | లింగాలు, పర్యాయపదాలు (`te-4-vocab`) | Gender (8) · Synonyms (8) | |
| Class 5 | వచనాలు, కాలాలు (`te-5-grammar`) | Plurals (7) · Singular/plural (6) · Tenses (7) | story నిజాయితీ |
| Class 5 | వ్యతిరేకపదాలు, వాక్య నిర్మాణం (`te-5-vocab`) | Antonyms (8) · Sentence building (6) | |
| Class 6 | సంధులు – 1 (`te-6-sandhi`) | సవర్ణదీర్ఘ (6) · గుణ (6) · వృద్ధి (6) | passage సంక్రాంతి |
| Class 7 | సంధులు – 2 (`te-7-sandhi`) | యణాదేశ (6) · అత్వ / ఇత్వ (7) · ఉత్వ (6) | passage నీటి పొదుపు |
| Class 7 | సమాసాలు – 1 (`te-7-samasa`) | ద్వంద్వ, ద్విగు + విగ్రహవాక్యం (8) | |
| Class 8 | సమాసాలు – 2 (`te-8-samasa`) | Identify తత్పురుష/కర్మధారయ/బహువ్రీహి (8) · విగ్రహవాక్యం (6) | passage గ్రంథాలయం |
| Class 8 | అలంకారాలు – 1 (`te-8-alankara`) | ఉపమ, రూపక + parts of ఉపమ (8) | |
| Class 9 | అలంకారాలు – 2 (`te-9-alankara`) | ఉత్ప్రేక్ష, అతిశయోక్తి, వృత్త్యనుప్రాస (7) | passage రైతే దేశానికి వెన్నెముక |
| Class 9 | ఛందస్సు (`te-9-chandas`) | గురు/లఘు marking (7) · గణాలు (8) | |
| Class 9 | వాక్యాలు (`te-9-vakya`) | By meaning (7) · By structure (6) | |
| Class 10 | ప్రత్యక్ష/పరోక్ష కథనం (`te-10-kathanam`) | Indirect speech incl. one typed item (7) | passage మాతృభాష గొప్పదనం |
| Class 10 | లేఖ, వ్యాస రచన (`te-10-writing`) | Letter format + model letters (6) · Essay structure + model essay (5) | |
| Class 10 | నానార్థాలు, ప్రకృతి–వికృతి (`te-10-vocab`) | Multiple meanings (6) · ప్రకృతి → వికృతి (6) | |

★ = unit badge. Totals: **29 units, 60 objectives, 507 items**, 13 passages (39 questions), 4 tracing sets.

## English course map — CBSE-style progression

| Class | Unit (id) | Objectives (items) | Trace / Read |
|---|---|---|---|
| Nursery | Letters A–M (`en-n-letters`) | Listen & tap (13) · Picture ↔ letter (13) | `en-upper-1` · rhyme Apple Up High |
| LKG | Letters N–Z (`en-l-letters`) | Listen & tap (13) · Picture ↔ letter (13) | `en-upper-2` · rhyme Little Red Kite |
| LKG | Big and small letters (`en-l-case`) ★ | Capital → small (26) | `en-lower` |
| UKG | Phonics (`en-u-phonics`) | First sounds (14) · Beginning sounds with pictures (10) | rhyme The Busy Hen |
| UKG | Sight words (`en-u-sight`) | Listen & tap (12) | |
| Class 1 | CVC words (`en-1-cvc`) | Blend/build (10) · Word families (8) | story Sam and the Sun |
| Class 1 | Capitals & full stops (`en-1-sentences`) | Correct sentence (6) · Sentence order (6) | |
| Class 2 | Naming & doing words (`en-2-words`) | Naming (6) · Doing (6) | story The Lost Ball |
| Class 2 | is/are, has/have (`en-2-sentences`) | Fill the blank (6) | |
| Class 3 | Nouns & pronouns (`en-3-nouns`) | Common/proper (6) · Pronouns (6) | story Priya’s Garden |
| Class 3 | Articles; singular/plural (`en-3-articles`) | a/an/the (7) · Plurals, typed (7) | |
| Class 4 | Verbs, adjectives, tenses (`en-4-grammar`) | Adjectives (6) · Simple tenses (7) | story Kiran and the Wallet |
| Class 4 | Synonyms & antonyms (`en-4-vocab`) | Synonyms (7) · Antonyms (7) | |
| Class 5 | Punctuation (`en-5-punct`) | Marks (7) | story The Science Fair |
| Class 5 | Building sentences (`en-5-build`) | Order (6) · Joining words (6) | |
| Class 6 | Parts of speech (`en-6-pos`) | Name the part of speech (8) · Same word, different jobs (6) | passage The Monsoon |
| Class 6 | Continuous & perfect tenses (`en-6-tenses`) | Tense forms incl. typed (8) | |
| Class 7 | Active & passive (`en-7-voice`) | Change the voice (7) | passage Hampi |
| Class 7 | Subject–verb agreement (`en-7-agreement`) | Agreement (7) | |
| Class 8 | Direct & indirect speech (`en-8-speech`) | Reported speech (7) | passage Plastic in Our Oceans |
| Class 8 | Clauses (`en-8-clauses`) | Noun/adjective/adverb clauses, main clause (7) | |
| Class 9 | Figures of speech (`en-9-figures`) | Simile, metaphor, personification, alliteration, hyperbole, onomatopoeia, oxymoron (8) | passage The Scientist Who Measured Light |
| Class 9 | Vocabulary in context (`en-9-vocab`) | Meaning from context (6) | |
| Class 10 | Formal letter, notice, essay (`en-10-writing`) | Formal letter + model (6) · Notice + model (5) · Essay structure + model outline (5) | passage Digital Footprints |

Totals: **24 units, 38 objectives, 314 items**, 13 passages (38 questions), 3 tracing sets.

## Sources and alignment notes

- Telugu progression follows the usual Telangana / Andhra Pradesh SCERT order (వర్ణమాల → గుణింతాలు → ఒత్తులు → పద/వాక్య
  పఠనం → వ్యాకరణం → సంధి/సమాస/అలంకార/ఛందస్సు → లేఖ/వ్యాస రచన). Chapter-level mapping to a specific textbook
  edition has **not** been done; class placement is approximate and must be checked against the current books.
- English follows the common CBSE progression (phonics and sight words → CVC → parts of speech → tenses → voice,
  reported speech, clauses → figures of speech → formal writing). Not mapped to a specific NCERT reader.
- No textbook text was copied. Rhymes, stories and passages are original. Factual statements in English passages
  (Hampi, C. V. Raman, monsoon, ocean plastic) are general knowledge and should still be checked.
- The vowel list uses the 16 అచ్చులు taught in schools today (ఌ, ౡ omitted). The consonant list has 36 entries
  including క్ష (a conjunct traditionally listed with the హల్లులు) and ఱ (శకటరేఫ, now rarely used).

## Needs native-speaker / educator review

**All Telugu content needs review.** Specific points:

1. **Picture words** (`telugu/script.ts`): especially ౠ – పితౄణం and అః – దుఃఖం (no common word starts with these),
   ఙ – వాఙ్మయం, ఞ – జ్ఞానం, ఠ – పీఠం, ణ – బాణం, థ – రథం, ష – పుష్పం, ళ – తాళం, క్ష – పక్షి, ఱ – ఱంపం (modern
   spelling రంపం), ఝ – ఝరి, య – యంత్రం. Replace with whatever the reviewer's school charts use. Emoji pictures are
   placeholders for original illustrations.
2. **Sign names** (దీర్ఘం, గుడి, గుడి దీర్ఘం, కొమ్ము, కొమ్ము దీర్ఘం, వట్రసుడి, ఎత్వం …, సున్నా, విసర్గ) — confirm the
   names children are taught.
3. **Grammar mappings — every one needs Telugu educator verification:**
   - లింగాలు: the course uses పుంలింగం / స్త్రీలింగం / నపుంసకలింగం by meaning; Telugu grammar also uses
     మహద్వాచకం / మహతీవాచకం / అమహద్వాచకం. Decide which the target textbooks use.
   - కాలాలు: భూత / వర్తమాన / భవిష్యత్ examples (e.g. "వెళ్తాము" can also be read as habitual).
   - సంధులు: సవర్ణదీర్ఘ, గుణ, వృద్ధి, యణాదేశ (Sanskrit) and అత్వ (బహుళం), ఇత్వ (వైకల్పికం), ఉత్వ (నిత్యం) (Telugu) —
     rule wording, examples and wrong options (e.g. ఏకైక, సదైవ, మహైశ్వర్యం, మనముంటిమి, ఏమంటివి/ఏమియంటివి).
   - సమాసాలు: classification of రాజభటుడు, దొంగభయం, ధనహీనుడు (తత్పురుష sub-types), నల్లకలువ, మంచిమాట,
     కలువకన్నులు (కర్మధారయ sub-types), చక్రపాణి, పీతాంబరుడు (బహువ్రీహి), ముల్లోకాలు, నవరసాలు, ఏడుకొండలు (ద్విగు),
     and every విగ్రహవాక్యం.
   - అలంకారాలు: ఉపమ / రూపక / ఉత్ప్రేక్ష / అతిశయోక్తి / వృత్త్యనుప్రాస example sentences and the parts of ఉపమ.
   - ఛందస్సు: గురు/లఘు marking of రాముడు, కమలం, సీతమ్మ, నమస్తే, కలువ, భారతి, పుస్తకం and the eight గణాలు.
   - వాక్యాలు: names of meaning types (విధ్యర్థకం, నిషేధార్థకం, అనుమత్యర్థకం, సామర్థ్యార్థకం …) and సామాన్య /
     సంయుక్త / సంశ్లిష్ట examples.
   - ప్రత్యక్ష / పరోక్ష కథనం conversions (తాను / తాము, -అని / -అమని forms).
   - నానార్థాలు (అంబరం, కరం, వర్ణం, పత్రం, హరి, గుణం) and ప్రకృతి–వికృతి pairs (రాత్రి–రేయి, విద్య–విద్దె, భాష–బాస,
     కార్యం–కర్జం, ఆశ్చర్యం–అచ్చెరువు, శ్రీ–సిరి).
4. **Word lists**: opposites, synonyms (పర్యాయపదాలు), antonyms, plurals (ఇళ్ళు/ఇళ్లు spelling), Telugu month names
   (కార్తీకం vs కార్తికం), spelling-dictation distractors (must be clearly wrong, never an accepted variant).
5. **Sentence-ordering items**: Telugu word order is flexible. Some items list accepted alternative orders (`alts`);
   the reviewer should add any other natural orders so a correct child is never marked wrong.
6. **Letter and essay formats**: placement of place/date, salutations (గౌరవనీయులైన …), closings (ఇట్లు, తమ విధేయుడు)
   and the model letter / essay.
7. **Passages and rhymes**: naturalness, age-appropriate vocabulary, and the comprehension answers.
8. **English glosses** of Telugu text: accuracy.
9. **Tracing start dot** is a heuristic (leftmost point for Telugu, top-most for English), not real stroke order.
   A teacher should confirm or replace it with authored stroke-start points per letter.
10. **English course**: needs a primary/secondary English teacher's review for class placement, the phonics word
    list, and grammar answers that have regional variation (e.g. collective nouns, "bread and butter is").
11. **Play & Learn → Story Time** (`src/features/early/data/stories.ts`, captions in `data/motion.ts`): all 16
    picture stories' Telugu (page text, tap prompts/replies, questions, answer labels, animation captions) are
    first drafts. The 8 newer stories (తెలివైన కుందేలు, చీమ–పావురం, కోతి–మొసలి, చిన్ని ఏనుగు స్నానం,
    చందమామ–చుక్కలు, సంక్రాంతి గాలిపటాలు, చేపల పడవ, పొలంలో ఉదయం) need a check for child-level wording, sound
    words (గర్ర్, కొక్కొరొకో, గణ గణ, చప్), festival terms (ముగ్గు, కనుమ, పొంగలి, "పొంగలో పొంగల్") and కీచురాళ్ళు.

## Shared changes requested (not made — outside this module)

- None required to run. Optional: recorded Telugu narration clips (`public/audio/te/manifest.json`) would remove the
  dependency on a device Telugu voice; `speak(text, 'te', clipId)` already supports them.
