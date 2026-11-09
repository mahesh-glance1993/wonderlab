// Curriculum content registry. Each class lives in its own lazily-loaded module
// (src/content/classes/<key>.ts) so it can be bundled into its own offline lesson pack.
import type { Objective, Question, Template, Unit } from '../shared/content';
import type { ClassLevel } from '../shared/levels';

export interface ClassContent { units: Unit[]; templates: Record<string, Template> }

type Loader = () => Promise<{ default: ClassContent }>;
const LOADERS: Record<ClassLevel, Loader> = {
  0: () => import('./classes/nursery'),
  1: () => import('./classes/lkg'),
  2: () => import('./classes/ukg'),
  3: () => import('./classes/c1'),
  4: () => import('./classes/c2'),
  5: () => import('./classes/c3'),
  6: () => import('./classes/c4'),
  7: () => import('./classes/c5'),
  8: () => import('./classes/c6'),
  9: () => import('./classes/c7'),
  10: () => import('./classes/c8'),
  11: () => import('./classes/c9'),
  12: () => import('./classes/c10'),
};

export const CLASS_KEYS: Record<ClassLevel, string> = {
  0: 'nursery', 1: 'lkg', 2: 'ukg', 3: 'c1', 4: 'c2', 5: 'c3', 6: 'c4', 7: 'c5', 8: 'c6', 9: 'c7', 10: 'c8', 11: 'c9', 12: 'c10',
};

export async function loadClass(level: ClassLevel): Promise<ClassContent> {
  const loader = LOADERS[level];
  if (!loader) return { units: [], templates: {} };
  return (await loader()).default;
}

export async function loadAll(): Promise<ClassContent[]> {
  const levels = Object.keys(LOADERS).map(Number) as ClassLevel[];
  return Promise.all(levels.sort((a, b) => a - b).map((l) => loadClass(l)));
}

export interface ContentOverride { id: string; kind: string; version: number; data: unknown }

/**
 * Applies educator-published overrides by stable id without mutating the source content.
 *  - kind 'objective': replaces title / intro / examples of the objective with that id.
 *  - kind 'question' : replaces any field of the static item with that id; `version` is set to the override version.
 * Unknown ids (or kinds) are ignored. When several overrides target the same id, the highest version wins.
 */
export function applyOverrides(c: ClassContent, overrides: ContentOverride[]): ClassContent {
  if (!overrides?.length) return c;
  const latest = new Map<string, ContentOverride>();
  for (const o of overrides) {
    if (!o || typeof o.id !== 'string' || (o.kind !== 'objective' && o.kind !== 'question')) continue;
    const k = `${o.kind}:${o.id}`;
    const prev = latest.get(k);
    if (!prev || o.version >= prev.version) latest.set(k, o);
  }
  if (!latest.size) return c;
  const asObj = (d: unknown): Record<string, unknown> => (d && typeof d === 'object' ? (d as Record<string, unknown>) : {});
  const units = c.units.map((u) => {
    let changed = false;
    const objectives = u.objectives.map((o) => {
      let next: Objective = o;
      const ov = latest.get(`objective:${o.id}`);
      if (ov) {
        const d = asObj(ov.data);
        next = { ...o };
        if (d.title !== undefined) next.title = d.title as Objective['title'];
        if (d.intro !== undefined) next.intro = d.intro as Objective['intro'];
        if (d.examples !== undefined) next.examples = d.examples as Objective['examples'];
      }
      if (o.items?.some((q) => latest.has(`question:${q.id}`))) {
        next = next === o ? { ...o } : next;
        next.items = o.items.map((q) => {
          const qo = latest.get(`question:${q.id}`);
          if (!qo) return q;
          return { ...q, ...(asObj(qo.data) as Partial<Question>), id: q.id, objectiveId: q.objectiveId, version: qo.version };
        });
      }
      if (next !== o) changed = true;
      return next;
    });
    return changed ? { ...u, objectives } : u;
  });
  return { units, templates: c.templates };
}

/** Template ids (~6, spread across the class) for the optional starting assessment. */
export function diagnosticFor(level: ClassLevel): string[] {
  return DIAGNOSTIC[level] ?? [];
}

const DIAGNOSTIC: Record<ClassLevel, string[]> = {
  0: ['n.count.to5.count', 'n.num.to5.numeral', 'n.shape.basic.find', 'n.pattern.ab.next', 'n.size.bigsmall.two', 'n.sound.animals.who'],
  1: ['lkg.count.to10.count', 'lkg.num.to10.order', 'lkg.compare.groups.baskets', 'lkg.shape.match.find', 'lkg.pattern.repeat.next', 'lkg.measure.compare.heavy'],
  2: ['ukg.num.to20.count', 'ukg.num.order.beforeafter', 'ukg.add.within10.add', 'ukg.sub.within10.sub', 'ukg.shape.sides.sides', 'ukg.pattern.grow.number'],
  3: ['c1.num.1to9.count', 'c1.num.make10.missing', 'c1.add.to20.story', 'c1.sub.to20.story', 'c1.num.tens-ones.build', 'c1.money.coins.count'],
  4: ['c2.num.groups.skip', 'c2.num.place.order', 'c2.add.2digit.add', 'c2.add.2digit.sub', 'c2.mul.share.share', 'c2.money.fair.change'],
  5: ['c3.num.to200.bundles', 'c3.pv.hundreds.value', 'c3.pv.addsub3.add', 'c3.mult.groups.fact', 'c3.frac.half-quarter.shaded', 'c3.time.clock-calendar.clock'],
  6: ['c4.num.thousands.value', 'c4.ops.addsub.sub', 'c4.meas.length.convert', 'c4.time.clock.elapsed', 'c4.ops.divide.remainder', 'c4.data.bars.more'],
  7: ['c5.num.large.value', 'c5.frac.add.unlike', 'c5.meas.km.convert', 'c5.ops.muldiv.mult', 'c5.meas.area.rect', 'c5.num.multiples.common'],
  8: ['c6.pat.sequences.next', 'c6.prime.factors.common', 'c6.mens.rect.rect', 'c6.frac.equiv-add.add', 'c6.int.add.add', 'c6.phy.length.convert'],
  9: ['c7.expr.order.eval', 'c7.dec.place.compare', 'c7.frac.muldiv.mul', 'c7.int.muldiv.mul', 'c7.alg.equations.solve', 'c7.phy.speed.speed'],
  10: ['c8.sq.roots.sqrt', 'c8.pow.laws.combine', 'c8.ratio.basic.share', 'c8.pct.basic.discount', 'c8.pyth.theorem.hyp', 'c8.phy.pressure.calc'],
  11: ['c9.coord.plane.dist', 'c9.num.real.simplify', 'c9.area.heron.heron', 'c9.prob.experimental.theory', 'c9.lin.twovar.findy', 'c9.phy.kinematics.v'],
  12: ['c10.real.hcf-lcm.hcf', 'c10.pair.solve.elim', 'c10.ap.nth-sum.nth', 'c10.trig.ratios.ratio', 'c10.prob.classical.bag', 'c10.phy.ohm.calc'],
};
