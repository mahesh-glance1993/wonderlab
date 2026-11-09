// "What should I learn next?" — deterministic and explainable.
import type { Unit, Objective } from './content';
import type { MasteryState } from './mastery';

export interface Recommendation {
  unitId: string;
  objectiveId: string;
  kind: 'review' | 'continue' | 'next' | 'stretch' | 'start';
  reason: { en: string; te?: string };
}

export function recommend(units: Unit[], mastery: Record<string, MasteryState>, nowSec = Math.floor(Date.now() / 1000), lastObjectiveId?: string): Recommendation | null {
  const all: { u: Unit; o: Objective }[] = units.flatMap((u) => u.objectives.map((o) => ({ u, o })));
  if (!all.length) return null;
  const m = (id: string) => mastery[id];
  // 1. a missed skill whose review is due
  const due = all.filter(({ o }) => { const s = m(o.id); return s && s.nextReviewAt && s.nextReviewAt <= nowSec; })
    .sort((a, b) => (m(a.o.id)!.nextReviewAt! - m(b.o.id)!.nextReviewAt!));
  if (due.length) {
    const { u, o } = due[0];
    const wasMastered = !!m(o.id)?.masteredAt;
    return { unitId: u.id, objectiveId: o.id, kind: 'review', reason: wasMastered
      ? { en: `Time for a quick review of "${o.title.en}" so you keep it fresh.`, te: `"${o.title.te || o.title.en}" ని మళ్ళీ ఒకసారి చూద్దాం.` }
      : { en: `Last time "${o.title.en}" was tricky. Let's try it again.`, te: `పోయినసారి "${o.title.te || o.title.en}" కష్టంగా అనిపించింది. మళ్ళీ ప్రయత్నిద్దాం.` } };
  }
  // 2. continue the last objective if started and not mastered
  if (lastObjectiveId) {
    const hit = all.find(({ o }) => o.id === lastObjectiveId);
    if (hit && !m(hit.o.id)?.masteredAt) return { unitId: hit.u.id, objectiveId: hit.o.id, kind: 'continue', reason: { en: `You were in the middle of "${hit.o.title.en}".`, te: `నువ్వు "${hit.o.title.te || hit.o.title.en}" మధ్యలో ఉన్నావు.` } };
  }
  // 3. first not-mastered objective in syllabus order whose prerequisites are done (or attempted)
  const ready = (o: Objective) => o.prereqs.every((p) => !all.some((x) => x.o.id === p) || m(p)?.masteredAt || (m(p)?.correct ?? 0) >= 3);
  const next = all.find(({ o }) => !m(o.id)?.masteredAt && !o.enrichment && ready(o));
  if (next) {
    const started = (m(next.o.id)?.attempts ?? 0) > 0;
    return { unitId: next.u.id, objectiveId: next.o.id, kind: started ? 'continue' : (Object.keys(mastery).length ? 'next' : 'start'),
      reason: started
        ? { en: `Keep going with "${next.o.title.en}" — a few more correct answers to master it.`, te: `"${next.o.title.te || next.o.title.en}" కొనసాగించు — ఇంకొన్ని సరైన జవాబులు చాలు.` }
        : { en: `You're ready for "${next.o.title.en}" — it comes next in ${next.u.title.en}.`, te: `ఇప్పుడు "${next.o.title.te || next.o.title.en}" నేర్చుకోవడానికి సిద్ధం.` } };
  }
  // 4. everything mastered: stretch / enrichment
  const stretch = all.find(({ o }) => o.enrichment && !m(o.id)?.masteredAt) || all[all.length - 1];
  return { unitId: stretch.u.id, objectiveId: stretch.o.id, kind: 'stretch', reason: { en: 'You have mastered your class topics! Try a challenge.', te: 'నీ తరగతి పాఠాలన్నీ నేర్చుకున్నావు! ఒక సవాలు ప్రయత్నించు.' } };
}
