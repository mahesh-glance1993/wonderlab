# Educator content review checklist

Automated validation (`npm test`) checks answer keys, template determinism, distinct items, units and ids.
**Educator review is separate** and is recorded per unit in `src/content` (`review.educator`) and in the
"Educator sign-off" table below. Do not mark a unit approved unless a qualified educator actually reviewed it.

## For each unit / chapter
- [ ] Mapping matches the official syllabus/textbook for the stated class, book and edition (chapter number, title, objectives).
- [ ] Prerequisites are correct and in a sensible order.
- [ ] Introduction is accurate, age-appropriate and in original wording (no textbook copying).
- [ ] At least two worked examples/demonstrations; every step is correct and clearly explained.
- [ ] Practice items (try ≥10 generated questions per template across difficulty levels):
  - [ ] the correct answer is right; alternate correct forms are accepted (equivalent fractions, decimals, unit conversions);
  - [ ] distractors are plausible and never also correct;
  - [ ] hints are progressive and don't give the answer away in the first hint;
  - [ ] targeted mistake feedback is accurate and kind;
  - [ ] numbers, names, money (₹) and units fit Indian context and the class level.
- [ ] Test mode set covers the objective and is a fair length for the age.
- [ ] Physics: formulas, units and model assumptions are stated; linked lab presets reproduce the worked answer.
- [ ] Younger classes: activities are visual/spoken, not text-heavy; instructions can be read aloud.
- [ ] Telugu (Nursery–Class 3): translation is natural, correct and uses child-appropriate words; narration matches the text.
- [ ] Accessibility: visuals have meaningful alt text; nothing relies only on colour.

## Recording
1. Fix issues in the content editor (draft → validate → preview → publish) or in source for structural changes.
2. Record sign-off below and set `review.educator = 'approved'`, `reviewer`, `reviewedAt` for the unit.

## Educator sign-off

| Unit id | Class | Reviewer | Date | Result | Notes |
|---|---|---|---|---|---|
| _none yet_ | | | | | |
