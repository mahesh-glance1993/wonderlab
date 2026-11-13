// Telangana SCERT Class 10 — Physical Science (12 chapters). Original explanations aligned to the official
// chapter list (src/content/ts/books.ts, syllabus.json). Sign convention: New Cartesian (distances measured from
// the pole / optical centre; along the incident light = +, against = −; heights up = +, down = −).
import {
  tp, ex, p, h, tip, f, def, keys, remember, photo, explore, L, num, approx, choose, matching, ordering, tapAll, rd, inr, NAMES,
  type USpec, type TSpec, type QSpec,
} from '../../lib/kit';
import type { Rng } from '../../../shared/grading';
import { tsSrc } from '../books';

const src = (n: number) => tsSrc(10, 'physical-science', n);
const PLACES = ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda', 'Adilabad', 'Mahabubnagar', 'Siddipet', 'Suryapet'];
const who = (r: Rng) => r.pick(NAMES).en;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => String(n).split('').map((d) => SUP[+d]).join('');
const sgnd = (x: number) => (x > 0 ? `+${x}` : `${x}`);
/** Round to 3 significant figures (for scientific-notation answers). */
const sig = (x: number, k = 3) => +x.toPrecision(k);
const sci = (x: number, k = 3) => { const e = Math.floor(Math.log10(Math.abs(x))); const m = +(x / 10 ** e).toPrecision(k); return `${m} × 10${e < 0 ? '⁻' + sup(-e) : sup(e)}`; };

// ---------- compact practice factories ----------
/** [question, correct answer, wrong answers, hint, why the answer is right] */
type MQ = [string, string, string[], string, string];
const mcq = (key: string, hint0: string, bank: MQ[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, h1, why] = r.pick(bank);
  return {
    type: 'mcq', prompt: q, ...choose(r, a, w), hints: [hint0, h1],
    mistakes: [{ when: 'wrong', explain: `Not quite. ${why}` }],
    solution: [`Correct answer: ${a}.`, why],
  };
}, d);

const matchT = (key: string, what: string, pool: [string, string][], hints: string[], n = 4, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pairs = r.shuffle(pool).slice(0, n);
  const m = matching(r, pairs);
  return {
    type: 'match', prompt: `Match each ${what}: ${pairs.map((x) => x[0]).join(' · ')}`, left: m.left, right: m.right, answer: m.answer,
    hints, mistakes: [{ when: 'wrong', explain: 'At least one pair is mismatched — check each left item against its definition one at a time.' }],
    solution: pairs.map(([a, b]) => `${a} → ${b}`),
  };
}, d);

const orderT = (key: string, prompt: string, steps: string[], hints: string[], why: string, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => ({
  type: 'order', prompt, ...ordering(r, steps), hints,
  mistakes: [{ when: 'wrong', explain: `The order is not right yet. ${why}` }],
  solution: [...steps.map((s, i) => `${i + 1}. ${s}`), why],
}), d);

const tapT = (key: string, prompt: string, pool: [string, boolean][], hints: string[], why: string, n = 5, d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const pick = r.shuffle(pool).slice(0, n);
  const yes = pool.find((x) => x[1])!, no = pool.find((x) => !x[1])!;
  if (!pick.some((x) => x[1])) pick[0] = yes;
  if (!pick.some((x) => !x[1])) pick[n - 1] = no;
  return {
    type: 'tap', prompt, ...tapAll(r, pick.map(([label, ok]) => ({ label, ok }))), hints,
    mistakes: [{ when: 'wrong', explain: `Check each option separately. ${why}` }],
    solution: [`Correct: ${pick.filter((x) => x[1]).map((x) => x[0]).join(', ')}.`, why],
  };
}, d);

// ---------- "what if?" explorer helper ----------
type XV = [sym: string, name: string, unit: string, min: number, max: number, step: number, value: number];
interface XSpec { title: string; formula: string; res: [sym: string, name: string, unit: string, expr: string, decimals?: number]; vars: XV[]; notes: [string, string, string][]; mistakes: [string, string][]; real: string }
const xp = (o: XSpec) => {
  const [sym, name, unit, expr, decimals] = o.res;
  return explore({
    title: L(o.title), formula: o.formula,
    result: { sym, name: L(name), expr, ...(unit ? { unit } : {}), ...(decimals !== undefined ? { decimals } : {}) },
    vars: o.vars.map(([s, n, u, min, max, step, value]) => ({ sym: s, name: L(n), ...(u ? { unit: u } : {}), min, max, step, value })),
    notes: o.notes.map(([s, up, down]) => ({ sym: s, up: L(up), down: L(down) })),
    mistakes: o.mistakes.map(([wrong, why]) => ({ wrong: L(wrong), why: L(why) })),
    realWorld: L(o.real),
  });
};

/** Typed numeric item with unit. */
const numQ = (prompt: string, ans: number, unit: string | undefined, hints: string[], solution: string[], mistakes: { when: string; explain: string }[] = [], rel = 0.01): QSpec => ({
  type: 'typed', keypad: unit ? 'units' : 'numeric', ...(unit ? { unitHint: unit } : {}), prompt,
  answer: unit ? approx(ans, rel, unit, true) : approx(ans, rel),
  hints, solution,
  mistakes: [
    ...(unit ? [{ when: 'missing-unit', explain: `Add the unit (${unit}) — a number alone is not a complete physical answer.` }, { when: 'wrong-unit', explain: `That unit measures a different quantity. The answer should be in ${unit} (or an equivalent unit of the same kind).` }] : []),
    ...mistakes,
  ],
});

// =====================================================================================
// Chapter 1 — Reflection of Light at Curved Surfaces
// =====================================================================================
const CONCAVE_PAIRS: [number, number][] = [[30, 15], [20, 10], [60, 20], [40, 10], [24, 12], [36, 12], [45, 30], [15, 10], [25, 20], [50, 25], [18, 12], [40, 30]];
const CONVEX_PAIRS: [number, number][] = [[30, 15], [20, 20], [60, 20], [40, 10], [12, 12], [36, 12], [15, 10], [24, 8], [30, 30], [10, 15]];

const ch1: USpec = {
  id: 'ts10.ps.ch1', subject: 'physics', title: 'Reflection of Light at Curved Surfaces', source: src(1),
  objectives: [
    {
      id: 'ts10.ps.mirror.basics', title: 'Spherical mirrors: parts and how they reflect', prereqs: [],
      activities: ['lab:light'],
      intro: [
        h('Mirrors that curve'),
        photo('🥄', 'Look into a shiny steel spoon. The inside (hollow) side shows you upside down; the back (bulging) side shows you upright and small. Both sides are curved mirrors.'),
        p('A flat mirror gives an image that is the same size as you. A curved mirror can make things look bigger, smaller, upright or upside down — and it can even collect sunlight at one hot point. To understand why, imagine a hollow glass ball. Cut a small piece from it and silver one side: you get a spherical mirror.'),
        def('Concave mirror', 'A spherical mirror whose reflecting surface curves inwards, like a cave (the inside of a spoon). It brings parallel rays together — it converges light.'),
        def('Convex mirror', 'A spherical mirror whose reflecting surface bulges outwards (the back of a spoon). It spreads parallel rays apart — it diverges light.'),
        h('Names of the parts'),
        def('Pole (P)', 'The centre point of the mirror\'s reflecting surface. All distances are measured from here.'),
        def('Centre of curvature (C)', 'The centre of the sphere from which the mirror was cut.'),
        def('Radius of curvature (R)', 'The radius of that sphere — the distance PC.'),
        def('Principal axis', 'The straight line through P and C.'),
        def('Focus (F) and focal length (f)', 'Rays parallel to the principal axis meet at F after reflection (concave), or appear to come from F (convex). The distance PF is the focal length f.'),
        h('Why does the focus sit half-way?'),
        p('The line from C to any point on the mirror is a radius, so it meets the mirror at 90° — it is the normal at that point. A ray reflects so that the angle of incidence equals the angle of reflection, measured from this normal. Work through the geometry for rays close to the axis and the reflected rays cross at the middle of PC. That is why f = R/2.'),
        f('f = R / 2', 'focal length equals half the radius of curvature'),
        xp({
          title: 'What if? Change how curved the mirror is', formula: 'f = R / 2',
          res: ['f', 'Focal length', 'cm', 'R / 2', 1],
          vars: [['R', 'Radius of curvature', 'cm', 4, 100, 1, 30]],
          notes: [['R', 'A larger radius means a flatter mirror, so rays meet farther away: f grows.', 'A smaller radius means a more sharply curved mirror, so it bends rays more strongly and they meet closer: f shrinks.']],
          mistakes: [['Writing f = 2R', 'The focus is between P and C, so it must be the SMALLER distance: f = R/2, not 2R.'], ['Thinking a plane mirror has f = 0', 'A plane mirror is a sphere of infinite radius, so its focal length is infinite, not zero.']],
          real: 'A shaving mirror is only gently curved (large R), so its focus is far away and your face (close to it) appears magnified.',
        }),
        keys('Concave = converging; convex = diverging.', 'P, C, F all lie on the principal axis; f = R/2.', 'Laws of reflection still hold at every point — the normal is the radius through that point.'),
        remember('Exam trap: the focus of a convex mirror is BEHIND the mirror (virtual focus); light only appears to come from it.'),
        tip('Memory hook: con-CAVE goes in like a cave; con-VEX bulges out.'),
      ],
      examples: [
        ex('A concave mirror is cut from a hollow sphere of radius 40 cm. Find its focal length.', ['R = 40 cm', 'f = R/2 = 40 ÷ 2', 'f = 20 cm (focus is in front of the mirror)'], 'f = 20 cm'),
        ex('Sana\'s torch reflector has a focal length of 6 cm. What radius of curvature should the mirror have?', ['f = R/2, so R = 2f', 'R = 2 × 6 = 12 cm'], 'R = 12 cm'),
      ],
      practice: [
        tp('f-from-r', (r) => {
          const R = r.pick([10, 16, 20, 24, 30, 36, 40, 50, 60, 80]);
          const kind = r.pick(['concave', 'convex']);
          const back = r.next() < 0.4;
          if (back) return numQ(`A ${kind} mirror has a focal length of ${R / 2} cm. Find its radius of curvature (size only).`, R, 'cm', ['f = R/2', 'So R = 2 × f.'], [`R = 2f = 2 × ${R / 2}`, `R = ${R} cm`], [{ when: String(R / 4), explain: 'You halved instead of doubling. The radius is twice the focal length.' }]);
          return numQ(`A ${kind} mirror has a radius of curvature of ${R} cm. Find the size of its focal length.`, R / 2, 'cm', ['The focus is half-way between P and C.', 'f = R/2'], [`f = R/2 = ${R} ÷ 2`, `f = ${R / 2} cm`], [{ when: String(2 * R), explain: 'f is smaller than R: divide by 2, do not multiply.' }]);
        }),
        mcq('parts', 'Picture the hollow sphere the mirror was cut from.', [
          ['Which point is the centre of the sphere from which a spherical mirror is cut?', 'Centre of curvature (C)', ['Pole (P)', 'Principal focus (F)', 'Aperture'], 'C is the centre of the sphere; P is on the mirror surface.', 'The centre of curvature is the centre of the original sphere.'],
          ['A ray passing through the centre of curvature of a concave mirror hits the mirror. How does it reflect?', 'Straight back along the same path', ['Through the focus', 'Parallel to the axis', 'It is absorbed'], 'A line through C is a radius — it is the normal.', 'A ray along the normal has angle of incidence 0°, so it retraces its path.'],
          ['Which mirror can collect sunlight at a single point and burn paper?', 'Concave mirror', ['Convex mirror', 'Plane mirror', 'Any mirror'], 'Which mirror converges parallel rays?', 'Only a concave mirror brings parallel rays to a real focus.'],
          ['Where is the focus of a convex mirror?', 'Behind the mirror (virtual focus)', ['In front of the mirror', 'At the pole', 'At infinity'], 'Do the reflected rays really meet, or only appear to?', 'Reflected rays diverge; extended backwards they seem to come from F behind the mirror.'],
          ['What is the normal at any point on a spherical mirror?', 'The line joining that point to the centre of curvature', ['The principal axis', 'The line to the focus', 'A tangent at that point'], 'A radius always meets a circle at 90°.', 'The radius drawn to the point is perpendicular to the surface, so it is the normal.'],
          ['The distance between the pole and the principal focus is called the…', 'Focal length', ['Radius of curvature', 'Aperture', 'Image distance'], 'PF is a length named after F.', 'PF = f, the focal length.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Pole', 'Centre of the mirror surface'], ['Centre of curvature', 'Centre of the parent sphere'], ['Radius of curvature', 'Distance from P to C'],
          ['Principal axis', 'Line through P and C'], ['Focal length', 'Distance from P to F'], ['Aperture', 'Width of the reflecting surface'],
        ], ['Start with the terms you are sure of.', 'Pole is ON the mirror; centre of curvature is OFF the mirror.']),
      ],
    },
    {
      id: 'ts10.ps.mirror.rays', title: 'Ray diagrams and images formed by concave and convex mirrors', prereqs: ['ts10.ps.mirror.basics'],
      activities: ['lab:light'],
      intro: [
        h('Predicting the image with just two rays'),
        photo('🚗', 'The side mirror of a car is convex: it always shows an upright, smaller image, so the driver sees a wide stretch of road behind.'),
        p('Every point of an object sends rays in all directions. We do not need all of them. If we follow just TWO rays from the top of the object, the point where they meet after reflection (or appear to meet) is the top of the image. Choose rays whose path you already know:'),
        p('Rule 1: A ray parallel to the principal axis reflects through F (concave) or appears to come from F (convex).'),
        p('Rule 2: A ray through F (or heading towards F for convex) reflects parallel to the axis.'),
        p('Rule 3: A ray through C (or heading towards C for convex) comes straight back on itself.'),
        p('Rule 4: A ray hitting the pole reflects making the same angle on the other side of the axis.'),
        def('Real image', 'Formed where reflected rays actually meet. It can be caught on a screen and is always inverted for a single mirror.'),
        def('Virtual image', 'Formed where reflected rays only appear to meet (when extended backwards). It cannot be caught on a screen and is erect.'),
        h('Concave mirror: move the object closer and watch'),
        p('Object far away (at infinity) → a tiny point image at F, real and inverted.'),
        p('Object beyond C → image between F and C, real, inverted, smaller.'),
        p('Object at C → image at C, real, inverted, same size.'),
        p('Object between C and F → image beyond C, real, inverted, larger.'),
        p('Object at F → reflected rays are parallel, image at infinity (very large).'),
        p('Object between F and P → image behind the mirror, virtual, erect and larger. This is how a make-up or shaving mirror magnifies your face.'),
        h('Convex mirror: always the same kind of image'),
        p('Wherever the object is, a convex mirror gives an image behind the mirror, between P and F: virtual, erect and diminished. As the object moves away, the image shrinks and moves towards F.'),
        keys('Two rays are enough to locate an image.', 'Real images are inverted; virtual images are erect (single mirror).', 'Concave: real image while the object is beyond F; virtual magnified image when the object is inside F.', 'Convex: always virtual, erect, diminished.'),
        remember('Only a concave mirror can give a real image. Only a concave mirror can give a magnified image.'),
        tip('Drawing tip: use a ruler, draw the mirror as a curve with a dotted extension, and show virtual rays as dashed lines.'),
      ],
      examples: [
        ex('A candle is placed 30 cm in front of a concave mirror of focal length 10 cm. Describe the image.', ['C is at 2f = 20 cm, so the candle (30 cm) is beyond C.', 'Draw a ray parallel to the axis → reflects through F.', 'Draw a ray through F → reflects parallel.', 'They meet between F and C, below the axis.'], 'Real, inverted, diminished, between F and C'),
        ex('Kiran stands 2 m in front of a convex mirror at a road bend near Adilabad. What image does he see?', ['A convex mirror always forms a virtual image behind the mirror.', 'Rays diverge after reflection; extended back they meet between P and F.'], 'Virtual, erect, diminished, between P and F behind the mirror'),
      ],
      practice: [
        mcq('concave', 'First locate the object relative to C (= 2f) and F.', [
          ['Object beyond C of a concave mirror. The image is…', 'Real, inverted, diminished, between F and C', ['Virtual, erect, enlarged', 'Real, inverted, same size, at C', 'Real, inverted, enlarged, beyond C'], 'An object far out gives a small image near F.', 'Beyond C the image lies between F and C and is smaller.'],
          ['Object at C of a concave mirror. The image is…', 'Real, inverted, same size, at C', ['Virtual, erect, enlarged', 'Real, inverted, diminished, at F', 'At infinity'], 'A ray through C returns on itself.', 'At C the image is at C, inverted and the same size.'],
          ['Object between C and F of a concave mirror. The image is…', 'Real, inverted, enlarged, beyond C', ['Real, inverted, diminished', 'Virtual, erect, diminished', 'At F'], 'This is the reverse of "object beyond C".', 'Between C and F the image forms beyond C and is magnified.'],
          ['Object at F of a concave mirror. The image is…', 'At infinity (highly enlarged)', ['At C, same size', 'Behind the mirror, erect', 'At F'], 'What do rays from F do after reflection?', 'Rays from F reflect parallel, so they meet at infinity.'],
          ['Object between F and P of a concave mirror. The image is…', 'Virtual, erect, enlarged, behind the mirror', ['Real, inverted, enlarged', 'Real, inverted, diminished', 'Virtual, erect, diminished'], 'Reflected rays diverge here.', 'Inside F the reflected rays diverge, giving a virtual magnified image.'],
          ['A convex mirror forms an image of a bus far behind a scooter. The image is…', 'Virtual, erect, diminished, between P and F', ['Real, inverted, diminished', 'Virtual, erect, enlarged', 'Real, erect, same size'], 'Convex mirrors only diverge light.', 'A convex mirror always gives a small, erect, virtual image.'],
        ], 2),
        mcq('rules', 'Think about which special ray you are following.', [
          ['A ray parallel to the principal axis strikes a concave mirror. After reflection it…', 'Passes through the focus', ['Passes through C', 'Retraces its path', 'Stays parallel'], 'Parallel rays are focused.', 'That is the definition of the focus of a concave mirror.'],
          ['A ray directed towards the centre of curvature of a convex mirror…', 'Reflects back along the same path', ['Passes through F', 'Goes parallel to the axis', 'Passes through the pole'], 'A line towards C is normal to the surface.', 'Normal incidence means the ray retraces its path.'],
          ['A ray passing through F of a concave mirror reflects…', 'Parallel to the principal axis', ['Through C', 'Back through F', 'Along the axis'], 'Rule 2 is the reverse of rule 1.', 'Light paths are reversible, so a ray from F becomes parallel.'],
          ['A ray hits the pole of a mirror at 25° to the principal axis. The reflected ray makes…', '25° on the other side of the axis', ['50° with the axis', '90° with the axis', '65° on the same side'], 'At the pole the principal axis is the normal.', 'Angle of incidence = angle of reflection = 25° about the axis.'],
          ['Which image can be caught on a screen?', 'A real image', ['A virtual image', 'Any image in a convex mirror', 'An image behind the mirror'], 'Rays must actually reach the screen.', 'Real images are where rays really meet, so a screen can catch them.'],
        ]),
        tapT('tap-real', 'Tap every situation that gives a REAL image.', [
          ['Concave mirror, object beyond C', true], ['Concave mirror, object at C', true], ['Concave mirror, object between C and F', true],
          ['Concave mirror, object between F and P', false], ['Convex mirror, object anywhere', false], ['Plane mirror, object anywhere', false],
        ], ['Real images need rays that actually meet in front of the mirror.', 'Only a concave mirror with the object beyond F does this.'], 'A real image forms only when a concave mirror has the object beyond F.', 5, 2),
      ],
    },
    {
      id: 'ts10.ps.mirror.formula', title: 'Mirror formula and the New Cartesian sign convention', prereqs: ['ts10.ps.mirror.rays'],
      activities: ['lab:light'],
      intro: [
        h('One formula instead of many drawings'),
        photo('🔦', 'A torch reflector: the bulb sits at the focus of a concave mirror so the beam leaves parallel. Where exactly to place it is a mirror-formula question.'),
        p('Ray diagrams tell us roughly where the image is. The mirror formula tells us exactly. It links three distances, all measured from the pole: u (object distance), v (image distance) and f (focal length).'),
        f('1/f = 1/v + 1/u', 'one over f equals one over v plus one over u'),
        h('The sign convention — the rule of the road'),
        p('Distances in one direction are taken as positive and in the other as negative, so one formula works for every case. Telangana and NCERT books use the New Cartesian sign convention:'),
        p('1. The pole is the origin and the principal axis is the x-axis. 2. The object is placed on the LEFT, so light travels left to right. 3. Distances measured in the direction of incident light (to the right) are positive; against it (to the left) are negative. 4. Heights above the axis are positive, below are negative.'),
        p('So for a mirror the object distance u is always negative. A concave mirror has its focus in front (left), so f is negative. A convex mirror has its focus behind (right), so f is positive. A real image in front of the mirror has v negative; a virtual image behind the mirror has v positive.'),
        def('Sign convention', 'An agreed rule for giving + or − to distances so that a single formula works for all mirror and lens problems.'),
        h('Solving in four steps'),
        p('Step 1: write u, f with signs. Step 2: rearrange: 1/v = 1/f − 1/u. Step 3: put the numbers in with their signs, in brackets. Step 4: read the sign of v — negative means real (in front), positive means virtual (behind).'),
        xp({
          title: 'What if? Move the object in front of a concave mirror', formula: '1/f = 1/v + 1/u   →   v = u·f / (u − f)',
          res: ['v', 'Image distance', 'cm', '-(d * F) / (d - F)', 1],
          vars: [['d', 'Object distance |u| (u = −d)', 'cm', 22, 100, 1, 40], ['F', 'Focal length |f| (f = −F)', 'cm', 5, 20, 1, 10]],
          notes: [
            ['d', 'As the object moves away from the mirror, the image moves in towards F (v gets closer to −f) and becomes smaller.', 'As the object comes closer towards F, the image runs away from the mirror and grows — at F it would go to infinity.'],
            ['F', 'A longer focal length (flatter mirror) pushes the real image farther from the mirror for the same object.', 'A shorter focal length (more curved mirror) pulls the image closer to the mirror.'],
          ],
          mistakes: [
            ['Using u = +30 cm for an object in front of the mirror', 'The object is against the incident light direction, so u is negative. A wrong sign turns a real image into a "virtual" one.'],
            ['Taking f positive for a concave mirror', 'The focus of a concave mirror is in front (to the left), so f is negative. Convex mirrors have positive f.'],
            ['Forgetting to flip 1/v at the end', 'After finding 1/v = −1/30, the image distance is v = −30 cm, not −1/30 cm.'],
          ],
          real: 'Move a candle towards a concave mirror and a screen must be moved farther back to keep the image sharp — exactly what the formula predicts.',
        }),
        xp({
          title: 'What if? The same for a convex (rear-view) mirror', formula: 'v = u·f / (u − f), with f > 0',
          res: ['v', 'Image distance', 'cm', '(d * F) / (d + F)', 1],
          vars: [['d', 'Object distance |u| (u = −d)', 'cm', 5, 500, 5, 100], ['F', 'Focal length f', 'cm', 5, 50, 1, 20]],
          notes: [
            ['d', 'However far the object goes, v never exceeds f: the image stays squeezed between P and F.', 'As the object approaches, the image moves towards the pole and grows slightly, but stays smaller than the object.'],
            ['F', 'A flatter convex mirror (bigger f) gives an image deeper behind the mirror and less shrunk.', 'A more curved convex mirror gives a smaller image closer to P — wider view, smaller cars.'],
          ],
          mistakes: [['Getting a negative v for a convex mirror', 'With u negative and f positive, v always comes out positive: the image is virtual, behind the mirror.'], ['Thinking the object distance affects whether the image is real', 'A convex mirror can never form a real image of a real object.']],
          real: 'Objects in a car\'s convex side mirror look smaller, so they are closer than they appear.',
        }),
        keys('1/f = 1/v + 1/u, all distances from the pole.', 'u is always negative (object in front).', 'Concave: f negative. Convex: f positive.', 'v negative → real, in front; v positive → virtual, behind.'),
        remember('Always substitute with signs inside brackets: 1/v = 1/(−15) − 1/(−30). Most lost marks come from dropped minus signs.'),
      ],
      examples: [
        ex('An object is 30 cm in front of a concave mirror of focal length 20 cm. Find the image position.', ['u = −30 cm, f = −20 cm', '1/v = 1/f − 1/u = 1/(−20) − 1/(−30)', '= −1/20 + 1/30 = (−3 + 2)/60 = −1/60', 'v = −60 cm'], 'v = −60 cm: real image 60 cm in front of the mirror'),
        ex('A convex mirror on a ghat road near Bhadrachalam has f = +20 cm. A car is 180 cm away (in a model test). Where is the image?', ['u = −180 cm, f = +20 cm', '1/v = 1/20 − 1/(−180) = 1/20 + 1/180 = 10/180', 'v = +18 cm'], 'v = +18 cm: virtual image 18 cm behind the mirror'),
        ex('Where should an object be placed in front of a concave mirror of focal length 15 cm to get a real image 30 cm in front?', ['f = −15 cm, v = −30 cm', '1/u = 1/f − 1/v = −1/15 + 1/30 = −1/30', 'u = −30 cm'], '30 cm in front (at C)'),
      ],
      practice: [
        tp('concave-v', (r) => {
          const [d, F] = r.pick(CONCAVE_PAIRS);
          const v = rd(-(d * F) / (d - F), 2);
          return numQ(`An object is placed ${d} cm in front of a concave mirror of focal length ${F} cm. Find the image distance v with its sign.`, v, 'cm',
            [`Signs: u = −${d} cm, f = −${F} cm.`, '1/v = 1/f − 1/u', `1/v = 1/(−${F}) + 1/${d}`],
            [`1/v = −1/${F} + 1/${d}`, `v = ${v} cm`, 'Negative v: the image is real and in front of the mirror.'],
            [{ when: `${-v} cm`, explain: 'Your sign is wrong. For a concave mirror with the object beyond F, the real image is in front, so v is negative.' }, { when: String(-v), explain: 'Sign error: both u and f are negative for a concave mirror, so a real image has negative v.' }]);
        }, 2),
        tp('convex-v', (r) => {
          const [d, F] = r.pick(CONVEX_PAIRS);
          const v = rd((d * F) / (d + F), 2);
          return numQ(`An object is ${d} cm in front of a convex mirror of focal length ${F} cm. Find the image distance v with its sign.`, v, 'cm',
            [`u = −${d} cm, f = +${F} cm (convex).`, '1/v = 1/f − 1/u = 1/f + 1/' + d],
            [`1/v = 1/${F} + 1/${d}`, `v = +${v} cm`, 'Positive v: virtual image behind the mirror.'],
            [{ when: `${-v} cm`, explain: 'A convex mirror gives a virtual image behind the mirror, so v must be positive.' }]);
        }, 2),
        tp('find-u', (r) => {
          const [d, F] = r.pick(CONCAVE_PAIRS);
          const vMag = rd((d * F) / (d - F), 2);
          return numQ(`A concave mirror of focal length ${F} cm forms a real image ${vMag} cm in front of it. Find the object distance u with its sign.`, -d, 'cm',
            [`f = −${F} cm, v = −${vMag} cm.`, '1/u = 1/f − 1/v'],
            [`1/u = 1/(−${F}) − 1/(−${vMag})`, `u = −${d} cm`, 'The object is in front of the mirror, so u is negative.'],
            [{ when: `${d} cm`, explain: 'The object always sits in front of the mirror, so u is negative.' }], 0.02);
        }, 3),
        mcq('signs', 'Picture the object on the left and light travelling to the right.', [
          ['In the New Cartesian convention, the object distance u for a mirror is…', 'Always negative', ['Always positive', 'Positive for convex mirrors', 'Zero'], 'The object is in front of the mirror, against the incident direction.', 'Measured against the direction of incident light, so negative.'],
          ['The focal length of a concave mirror is taken as…', 'Negative', ['Positive', 'Zero', 'Infinite'], 'Where is F for a concave mirror — in front or behind?', 'F is in front of a concave mirror, so f < 0.'],
          ['The focal length of a convex mirror is taken as…', 'Positive', ['Negative', 'Zero', 'Equal to R'], 'F is behind a convex mirror.', 'Behind the mirror = along the incident direction = positive.'],
          ['A mirror gives v = +12 cm. The image is…', 'Virtual and behind the mirror', ['Real and in front', 'Real and behind', 'At the focus'], 'Positive means to the right of the pole.', 'Positive v puts the image behind the mirror, which can only be virtual.'],
          ['The height of an inverted real image is taken as…', 'Negative', ['Positive', 'Zero', 'Equal to the object height'], 'Inverted images lie below the axis.', 'Heights below the axis are negative.'],
          ['Which equation is the mirror formula?', '1/f = 1/v + 1/u', ['1/f = 1/v − 1/u', 'f = u + v', 'f = uv'], 'The lens formula has a minus sign; the mirror formula a plus.', 'For mirrors, 1/f = 1/v + 1/u.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.mirror.magnification', title: 'Magnification by spherical mirrors', prereqs: ['ts10.ps.mirror.formula'],
      intro: [
        h('How big is the image — and which way up?'),
        photo('🔮', 'A shiny ball acts as a convex mirror: the whole room shrinks into a small, upright picture on it.'),
        p('Magnification (m) answers two questions with one number: how many times bigger the image is, and whether it is upright or upside down.'),
        def('Magnification (m)', 'The ratio of the image height to the object height: m = h′/h. It has no unit.'),
        f('m = h′ / h = −v / u', 'm equals image height over object height equals minus v over u'),
        p('The minus sign in −v/u is needed because of the sign convention. For a real image both v and u are negative, so v/u is positive — but a real image is inverted, so m must be negative. The minus sign fixes this.'),
        p('Reading m: size → |m| > 1 enlarged, |m| = 1 same size, |m| < 1 diminished. Sign → m negative means real and inverted; m positive means virtual and erect.'),
        xp({
          title: 'What if? Magnification of a concave mirror (object beyond F)', formula: 'm = −v/u = f / (f − u)',
          res: ['m', 'Magnification', '', '-F / (d - F)', 2],
          vars: [['d', 'Object distance |u|', 'cm', 22, 100, 1, 30], ['F', 'Focal length |f|', 'cm', 5, 20, 1, 10]],
          notes: [
            ['d', 'Moving the object away makes |m| smaller: the inverted image shrinks.', 'Moving the object towards F makes |m| grow: the inverted image becomes huge (this is how a projector-like mirror enlarges).'],
            ['F', 'A longer focal length gives a bigger image for the same object distance.', 'A shorter focal length gives a smaller image.'],
          ],
          mistakes: [['Forgetting the minus sign: m = v/u', 'For mirrors m = −v/u. Without the minus, a real inverted image would wrongly come out "erect".'], ['Giving m a unit like cm', 'm is a ratio of two lengths, so it has no unit.'], ['Mixing up h and h′', 'h′ (image) goes on top: m = h′/h.']],
          real: 'When m = −2 a 5 cm candle gives a 10 cm image that is upside down.',
        }),
        keys('m = h′/h = −v/u (mirrors).', 'Negative m → real, inverted. Positive m → virtual, erect.', '|m| > 1 → enlarged; |m| < 1 → diminished.', 'Convex mirrors always give 0 < m < 1.'),
        remember('Lenses use m = v/u (no minus sign). Mirrors use m = −v/u. Do not mix them up.'),
      ],
      examples: [
        ex('A 4 cm tall object is 30 cm in front of a concave mirror; the image forms at v = −60 cm. Find m and the image height.', ['m = −v/u = −(−60)/(−30) = −2', 'h′ = m × h = −2 × 4 = −8 cm', 'Negative: inverted; |m| = 2: twice as tall'], 'm = −2; image 8 cm tall, inverted'),
        ex('A convex mirror forms an image at v = +10 cm of an object at u = −40 cm. Find m.', ['m = −v/u = −(10)/(−40)', 'm = +0.25'], 'm = +0.25: erect and one-quarter size'),
      ],
      practice: [
        tp('m', (r) => {
          const [d, F] = r.pick(CONCAVE_PAIRS);
          const v = -(d * F) / (d - F);
          const mm = rd(-F / (d - F), 2);
          return numQ(`For a concave mirror, an object at u = −${d} cm gives an image at v = ${rd(v, 2)} cm. Find the magnification m (with sign).`, mm, undefined,
            ['m = −v/u', `m = −(${rd(v, 2)}) / (−${d})`],
            [`m = −(${rd(v, 2)}) ÷ (−${d}) = ${mm}`, mm < 0 ? 'Negative: the image is real and inverted.' : 'Positive: erect.', Math.abs(mm) > 1 ? 'Enlarged.' : Math.abs(mm) < 1 ? 'Diminished.' : 'Same size.'],
            [{ when: String(-mm), explain: 'Sign error. For mirrors use m = −v/u; a real image has negative m.' }], 0.02);
        }, 2),
        tp('height', (r) => {
          const [d, F] = r.pick(CONCAVE_PAIRS);
          const hO = r.pick([2, 3, 4, 5, 6]);
          const mm = -F / (d - F);
          const hi = rd(mm * hO, 2);
          return numQ(`A ${hO} cm tall object stands ${d} cm in front of a concave mirror of focal length ${F} cm. Find the height of the image (with sign).`, hi, 'cm',
            ['First find v from 1/v = 1/f − 1/u.', 'Then m = −v/u and h′ = m × h.'],
            [`v = ${rd(-(d * F) / (d - F), 2)} cm`, `m = −v/u = ${rd(mm, 3)}`, `h′ = ${rd(mm, 3)} × ${hO} = ${hi} cm (negative: inverted)`],
            [{ when: `${-hi} cm`, explain: 'A real image from a concave mirror is inverted, so its height is negative.' }], 0.02);
        }, 3),
        mcq('read-m', 'Use the sign for orientation and the size for enlargement.', [
          ['A mirror gives m = −3. The image is…', 'Real, inverted, 3 times larger', ['Virtual, erect, 3 times larger', 'Real, inverted, one-third size', 'Virtual, erect, one-third size'], 'Negative → real/inverted.', '|m| = 3 means enlarged three times; negative means inverted and real.'],
          ['A mirror gives m = +0.5. The image is…', 'Virtual, erect, half the size', ['Real, inverted, half size', 'Virtual, erect, twice the size', 'Real, erect, twice the size'], 'Positive → erect.', 'Positive and less than 1: erect, virtual, diminished.'],
          ['A mirror gives m = −1. The object must be at…', 'The centre of curvature C', ['The focus F', 'Between F and P', 'Infinity'], 'Same size, inverted.', 'Only an object at C gives a real, inverted, same-size image.'],
          ['A mirror gives m = +2.5. Which mirror and where is the object?', 'Concave mirror, object between F and P', ['Convex mirror, object anywhere', 'Concave mirror, object beyond C', 'Plane mirror'], 'Erect and enlarged.', 'Only a concave mirror with the object inside F gives an erect magnified image.'],
          ['Which value of m is impossible for a convex mirror (real object)?', 'm = −0.5', ['m = +0.5', 'm = +0.2', 'm = +0.9'], 'Convex mirrors only make erect, smaller images.', 'A convex mirror always gives 0 < m < 1, so a negative m is impossible.'],
          ['Magnification has the unit…', 'No unit (it is a ratio)', ['cm', 'm', 'dioptre'], 'It divides one length by another.', 'Length ÷ length cancels, so m has no unit.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.mirror.uses', title: 'Solar cooker and everyday uses of curved mirrors', prereqs: ['ts10.ps.mirror.rays'],
      intro: [
        h('Cooking with sunlight'),
        photo('☀️', 'Sunlight reaching us is a stream of almost parallel rays — perfect for a concave mirror to focus.'),
        p('Rays from the Sun are so far away that they arrive almost parallel. A large concave mirror turned towards the Sun reflects all these parallel rays to its focus. Lots of energy arrives at one small region, so it gets very hot.'),
        p('In a solar cooker the cooking vessel is placed at the focus of a big concave reflector. The vessel is painted black because black surfaces absorb heat well instead of reflecting it. Some cookers also use a glass lid to trap heat (the greenhouse idea).'),
        def('Solar cooker (concave type)', 'A device that uses a large concave mirror to concentrate parallel sunlight at its focus, where the cooking vessel is kept.'),
        p('Story often told about the ancient scientist Archimedes: soldiers held polished shields to focus sunlight on enemy ships. Whether or not it really happened, it uses the same idea — many reflectors sending sunlight to one spot.'),
        h('Other uses'),
        p('Concave mirrors: torch and headlight reflectors (bulb at F gives a parallel beam), shaving/make-up mirrors (face inside F → magnified, erect image), dentist\'s mirror, solar furnaces, satellite dishes.'),
        p('Convex mirrors: rear-view mirrors of vehicles (always erect, smaller image and a wide field of view), mirrors at sharp road bends and in shops for security.'),
        keys('Parallel sunlight + concave mirror → concentrated at the focus.', 'Vessel at the focus, painted black.', 'Concave: torches, headlights, shaving mirrors, solar cookers.', 'Convex: rear-view and road-bend mirrors (wide view).'),
        remember('Headlight: bulb at F → parallel beam (Rule 2 in reverse). Solar cooker: parallel rays → focused at F (Rule 1).'),
        tip('Try at home with adult help: a steel bowl in bright sunshine makes a warm patch on a paper held near its focus. Never look at the Sun or its focused image.'),
      ],
      examples: [
        ex('Lakshmi builds a solar cooker in Nalgonda with a concave reflector of radius of curvature 1.2 m. Where should the vessel be placed?', ['f = R/2 = 1.2 ÷ 2 = 0.6 m', 'Sun\'s rays are parallel and meet at F.'], '0.6 m (60 cm) in front of the mirror, at the focus'),
        ex('Why is a convex mirror, not a plane mirror, used as a scooter\'s side mirror?', ['A convex mirror gives a diminished image.', 'So more of the road fits in the same small mirror (wider field of view).', 'The image is always erect, so it is easy to understand.'], 'Wider field of view with an always-erect image'),
      ],
      practice: [
        mcq('cooker', 'Think about where parallel rays go after a concave mirror.', [
          ['In a concave solar cooker, the vessel is placed at…', 'The focus of the mirror', ['The centre of curvature', 'The pole', 'Anywhere in front'], 'Parallel rays → F.', 'Sunlight is parallel, so it concentrates at the focus.'],
          ['Why is the cooking vessel of a solar cooker painted black?', 'Black absorbs most of the heat falling on it', ['Black reflects heat', 'Black looks nice', 'Black keeps food cool'], 'Which colour absorbs radiation best?', 'Black surfaces absorb radiation instead of reflecting it, so the food heats faster.'],
          ['Why are the Sun\'s rays treated as parallel?', 'The Sun is extremely far away', ['The Sun is small', 'Air straightens them', 'Mirrors make them parallel'], 'Rays from a very distant source…', 'From a very far source, the rays reaching us are almost parallel.'],
          ['In a car headlight the bulb is placed at…', 'The focus of a concave mirror', ['The centre of curvature of a convex mirror', 'The pole', 'Beyond C'], 'We want a parallel beam.', 'Rays from F reflect parallel, giving a strong straight beam.'],
          ['Dentists use a concave mirror because…', 'Held close, it gives an enlarged, erect image of a tooth', ['It gives a smaller image', 'It gives a real image on the tooth', 'It works like a plane mirror'], 'Tooth is within F.', 'An object inside F gives a magnified, erect, virtual image.'],
          ['Mirrors at sharp hill-road bends are convex because they…', 'Show a wide area with an erect image', ['Give enlarged images', 'Focus sunlight', 'Form real images'], 'Field of view.', 'Convex mirrors diminish images, so a wide area fits in view.'],
        ]),
        tapT('tap-concave', 'Tap every device that uses a CONCAVE mirror.', [
          ['Solar cooker', true], ['Torch reflector', true], ['Shaving mirror', true], ['Dentist\'s mirror', true],
          ['Rear-view mirror of a bike', false], ['Security mirror in a shop', false], ['Road-bend mirror', false],
        ], ['Concave mirrors focus light or magnify.', 'Convex mirrors give wide views.'], 'Concave: focusing (cookers, torches) or magnifying (shaving, dental). Convex: wide-angle views.'),
        matchT('match', 'use to the right mirror idea', [
          ['Solar cooker', 'Parallel rays focused at F'], ['Headlight', 'Source at F gives a parallel beam'], ['Make-up mirror', 'Object within F → magnified erect image'],
          ['Rear-view mirror', 'Convex: erect diminished, wide view'], ['Plane mirror', 'Same-size erect image'], ['Satellite dish', 'Collects parallel waves at F'],
        ], ['Concave mirrors either focus parallel rays or make parallel beams.', 'Convex mirrors give a wide view.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 2 — Chemical Equations
// =====================================================================================
interface Eq { sp: string[]; c: number[]; nR: number; name: string }
const EQS: Eq[] = [
  { sp: ['H₂', 'O₂', 'H₂O'], c: [2, 1, 2], nR: 2, name: 'hydrogen burning in oxygen' },
  { sp: ['Fe', 'H₂O', 'Fe₃O₄', 'H₂'], c: [3, 4, 1, 4], nR: 2, name: 'iron reacting with steam' },
  { sp: ['Mg', 'O₂', 'MgO'], c: [2, 1, 2], nR: 2, name: 'magnesium ribbon burning' },
  { sp: ['N₂', 'H₂', 'NH₃'], c: [1, 3, 2], nR: 2, name: 'making ammonia' },
  { sp: ['CH₄', 'O₂', 'CO₂', 'H₂O'], c: [1, 2, 1, 2], nR: 2, name: 'methane (biogas) burning' },
  { sp: ['Al', 'O₂', 'Al₂O₃'], c: [4, 3, 2], nR: 2, name: 'aluminium forming its oxide' },
  { sp: ['Na', 'H₂O', 'NaOH', 'H₂'], c: [2, 2, 2, 1], nR: 2, name: 'sodium reacting with water' },
  { sp: ['Fe₂O₃', 'Al', 'Al₂O₃', 'Fe'], c: [1, 2, 1, 2], nR: 2, name: 'the thermite reaction' },
  { sp: ['C₃H₈', 'O₂', 'CO₂', 'H₂O'], c: [1, 5, 3, 4], nR: 2, name: 'propane (LPG) burning' },
  { sp: ['BaCl₂', 'Na₂SO₄', 'BaSO₄', 'NaCl'], c: [1, 1, 1, 2], nR: 2, name: 'barium chloride with sodium sulphate' },
  { sp: ['KClO₃', 'KCl', 'O₂'], c: [2, 2, 3], nR: 1, name: 'heating potassium chlorate' },
  { sp: ['Pb(NO₃)₂', 'PbO', 'NO₂', 'O₂'], c: [2, 2, 4, 1], nR: 1, name: 'heating lead nitrate' },
  { sp: ['H₂O₂', 'H₂O', 'O₂'], c: [2, 2, 1], nR: 1, name: 'hydrogen peroxide decomposing' },
  { sp: ['Zn', 'HCl', 'ZnCl₂', 'H₂'], c: [1, 2, 1, 1], nR: 2, name: 'zinc with hydrochloric acid' },
  { sp: ['C₂H₆', 'O₂', 'CO₂', 'H₂O'], c: [2, 7, 4, 6], nR: 2, name: 'ethane burning' },
  { sp: ['Fe₂O₃', 'CO', 'Fe', 'CO₂'], c: [1, 3, 2, 3], nR: 2, name: 'reducing iron ore in a blast furnace' },
];
const side = (sp: string[], c: number[]) => sp.map((s, i) => `${c[i] === 1 ? '' : c[i]}${s}`).join(' + ');
const eqStr = (e: Eq, c: number[] = e.c) => `${side(e.sp.slice(0, e.nR), c.slice(0, e.nR))} → ${side(e.sp.slice(e.nR), c.slice(e.nR))}`;
const skel = (e: Eq) => eqStr(e, e.c.map(() => 1));

const ch2: USpec = {
  id: 'ts10.ps.ch2', subject: 'chemistry', title: 'Chemical Equations', source: src(2),
  objectives: [
    {
      id: 'ts10.ps.equation.balance', title: 'Writing and balancing chemical equations', prereqs: [],
      intro: [
        h('A sentence written in symbols'),
        photo('🔥', 'When a gas stove burns, methane and oxygen change into carbon dioxide and water. A chemical equation is a short way to write this story.'),
        p('Writing "methane burns in oxygen to give carbon dioxide and water" every time is slow. Chemists write a word equation first, then replace the names with formulae: CH₄ + O₂ → CO₂ + H₂O. Substances on the left are reactants; those on the right are products; the arrow means "changes into".'),
        def('Chemical equation', 'A symbolic representation of a chemical reaction using formulae of the reactants and products.'),
        def('Skeletal equation', 'An equation with the correct formulae but not yet balanced — the atoms on the two sides may not be equal.'),
        h('Why must it balance?'),
        p('In a reaction atoms are only rearranged — none are created or destroyed. This is the law of conservation of mass: total mass of reactants = total mass of products. So the number of atoms of each element must be the same on both sides.'),
        def('Balanced equation', 'An equation in which the number of atoms of every element is equal on the reactant and product sides.'),
        h('Balancing by trial (hit-and-trial method)'),
        p('1. Write the skeletal equation with correct formulae. 2. Make a table of atoms of each element on both sides. 3. Start with the compound having the most atoms, and the element that appears in fewest formulae. 4. Change only the numbers IN FRONT (coefficients), never the small subscripts — changing H₂O to H₂O₂ would change water into a different substance! 5. Balance H and O last if they appear in many places. 6. Re-count every element and use the smallest whole numbers.'),
        p('Example: CH₄ + O₂ → CO₂ + H₂O. Carbon: 1 = 1 ✓. Hydrogen: 4 on the left, 2 on the right → put 2 before H₂O. Oxygen: now 2 + 2 = 4 on the right → put 2 before O₂. Result: CH₄ + 2O₂ → CO₂ + 2H₂O.'),
        keys('Atoms are conserved, so equations must balance.', 'Change coefficients only, never subscripts.', 'Use the smallest whole-number coefficients.', 'Check every element at the end.'),
        remember('Common trap: writing 2H₂O as H₄O₂, or "fixing" O by changing CO₂ to CO. Both change the substance itself.'),
        tip('Polyatomic ions that stay together (like SO₄ or NO₃) can be balanced as a single unit.'),
      ],
      examples: [
        ex('Balance: Fe + H₂O → Fe₃O₄ + H₂', ['Fe: 3 on the right → write 3Fe.', 'O: 4 in Fe₃O₄ → write 4H₂O.', 'H: now 8 on the left → write 4H₂.', 'Check: Fe 3 = 3, O 4 = 4, H 8 = 8 ✓'], '3Fe + 4H₂O → Fe₃O₄ + 4H₂'),
        ex('Balance the burning of LPG (propane): C₃H₈ + O₂ → CO₂ + H₂O', ['C: 3 → 3CO₂', 'H: 8 → 4H₂O', 'O on right: 3 × 2 + 4 × 1 = 10 → 5O₂', 'Check: C 3, H 8, O 10 on both sides ✓'], 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O'),
        ex('Balance: Al + O₂ → Al₂O₃', ['O: 2 on the left, 3 on the right; LCM is 6 → 3O₂ and 2Al₂O₃', 'Al: now 4 on the right → 4Al', 'Check: Al 4 = 4, O 6 = 6 ✓'], '4Al + 3O₂ → 2Al₂O₃'),
      ],
      practice: [
        tp('pick', (r) => {
          const e = r.pick(EQS);
          const variants: string[] = [];
          for (let k = 0; k < e.c.length && variants.length < 5; k++) {
            const c = [...e.c]; c[k] = c[k] === 1 ? 2 : c[k] + (r.next() < 0.5 ? 1 : -1); variants.push(eqStr(e, c));
          }
          variants.push(skel(e));
          const ch = choose(r, eqStr(e), r.shuffle(variants));
          return {
            type: 'mcq', prompt: `Which is the correctly balanced equation for ${e.name}? Skeletal: ${skel(e)}`, ...ch,
            hints: ['Count the atoms of each element on both sides for each option.', 'Only one option has equal numbers of every element.'],
            mistakes: [{ when: 'wrong', explain: 'Count atoms element by element — at least one element is unequal in that option.' }],
            solution: [`Balanced: ${eqStr(e)}`, 'Every element now has the same number of atoms on both sides.'],
          };
        }, 2),
        tp('coeff', (r) => {
          const e = r.pick(EQS);
          const k = r.int(0, e.sp.length - 1);
          const blank = e.sp.map((s) => `__${s}`);
          const q = `${blank.slice(0, e.nR).join(' + ')} → ${blank.slice(e.nR).join(' + ')}`;
          return {
            type: 'typed', keypad: 'numeric', prompt: `Balance with the smallest whole numbers: ${q}. What is the coefficient of ${e.sp[k]}? (Write 1 if no number is needed.)`,
            answer: num(e.c[k]),
            hints: ['Make an atom table for both sides.', 'Balance the element found in the fewest formulae first; leave H and O for last.', 'Change only the numbers in front of formulae.'],
            mistakes: [{ when: 'wrong-value', explain: 'Re-count each element after placing your numbers — one side still has more atoms.' }],
            solution: [eqStr(e), `Coefficient of ${e.sp[k]} = ${e.c[k]}`],
          };
        }, 2),
        orderT('steps', 'Put the steps of balancing an equation in order.', [
          'Write the word equation', 'Write correct formulae (skeletal equation)', 'Count atoms of each element on both sides',
          'Place coefficients in front of formulae to equalise atoms', 'Re-check all elements and reduce to smallest whole numbers',
        ], ['You cannot count atoms before you have formulae.', 'Checking always comes last.'], 'Words → formulae → count → adjust coefficients → final check.'),
        mcq('rules', 'Remember: atoms are only rearranged.', [
          ['While balancing, which of these may you change?', 'The coefficient in front of a formula', ['The subscript inside a formula', 'The symbol of an element', 'The arrow direction'], 'Subscripts define the substance.', 'Changing subscripts makes a different substance; only coefficients may change.'],
          ['Why must a chemical equation be balanced?', 'Mass (atoms) is conserved in a reaction', ['To make it look neat', 'Because energy is created', 'Because products weigh more'], 'Law of conservation of mass.', 'Atoms are neither created nor destroyed, so counts must match.'],
          ['In 3Fe + 4H₂O → Fe₃O₄ + 4H₂, how many hydrogen atoms are on each side?', '8', ['4', '2', '6'], '4 × 2 = ?', '4H₂O contains 4 × 2 = 8 H atoms; 4H₂ also has 8.'],
          ['Which is NOT balanced?', 'H₂ + O₂ → H₂O', ['2H₂ + O₂ → 2H₂O', 'N₂ + 3H₂ → 2NH₃', 'CH₄ + 2O₂ → CO₂ + 2H₂O'], 'Count oxygen atoms.', 'H₂ + O₂ → H₂O has 2 O on the left but 1 on the right.'],
          ['A student balances H₂ + O₂ → H₂O by writing H₂ + O₂ → H₂O₂. What is wrong?', 'H₂O₂ is hydrogen peroxide, a different substance', ['Nothing is wrong', 'Oxygen is still unbalanced', 'Hydrogen is unbalanced'], 'Did the product stay water?', 'Changing a subscript changed water into hydrogen peroxide.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.equation.informative', title: 'Making equations more informative: states and conditions', prereqs: ['ts10.ps.equation.balance'],
      intro: [
        h('Adding detail to the equation'),
        photo('🧊', 'Water can be a solid (ice), liquid or gas (steam). An equation should say which one is reacting.'),
        p('A balanced equation tells us WHAT reacts and in what ratio, but not in which physical state, at what temperature, or whether a catalyst is needed. We add these details with symbols.'),
        def('State symbols', '(s) solid, (l) liquid, (g) gas, (aq) aqueous — dissolved in water.'),
        p('Example: Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑. The upward arrow shows a gas escaping; a downward arrow (↓) shows a precipitate (an insoluble solid forming in a solution).'),
        h('Conditions written on the arrow'),
        p('Heat is shown by Δ (delta) above the arrow, e.g. CaCO₃(s) —Δ→ CaO(s) + CO₂(g). A catalyst (a substance that speeds up a reaction without being used up) is written above the arrow, e.g. Ni for hydrogenation of oils. Pressure, temperature and light (sunlight, "hν") are written too: 6CO₂ + 6H₂O —sunlight, chlorophyll→ C₆H₁₂O₆ + 6O₂.'),
        def('Exothermic reaction', 'A reaction that gives out heat; written "+ heat" on the product side. Example: burning of methane.'),
        def('Endothermic reaction', 'A reaction that takes in heat; e.g. decomposition of calcium carbonate needs strong heating.'),
        keys('(s), (l), (g), (aq) show physical states.', '↑ gas given off; ↓ precipitate formed.', 'Δ = heat; catalyst, pressure, temperature, light written on the arrow.', '"+ heat" on the right = exothermic; heat needed = endothermic.'),
        remember('aq means dissolved in water — NaCl(aq) is salt solution, NaCl(s) is solid salt.'),
      ],
      examples: [
        ex('Make informative: barium chloride solution + sodium sulphate solution give a white precipitate of barium sulphate and sodium chloride solution.', ['Balanced: BaCl₂ + Na₂SO₄ → BaSO₄ + 2NaCl', 'Add states: both reactants are solutions (aq).', 'BaSO₄ is the precipitate → (s)↓', 'NaCl stays dissolved → (aq)'], 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)'),
        ex('Write the equation for making ammonia from nitrogen and hydrogen at 200 atm, 500 °C with iron catalyst.', ['Balanced: N₂ + 3H₂ → 2NH₃', 'All are gases (g).', 'Write conditions over the arrow.'], 'N₂(g) + 3H₂(g) —Fe, 500 °C, 200 atm→ 2NH₃(g)'),
      ],
      practice: [
        matchT('states', 'symbol to its meaning', [
          ['(s)', 'Solid'], ['(l)', 'Liquid'], ['(g)', 'Gas'], ['(aq)', 'Dissolved in water'], ['↑', 'Gas escapes'], ['↓', 'Precipitate forms'], ['Δ', 'Heat is supplied'],
        ], ['aq comes from "aqueous" (aqua = water).', 'Arrows up and down describe what leaves or settles.']),
        mcq('read', 'Read each symbol on the equation one at a time.', [
          ['In CaCO₃(s) —Δ→ CaO(s) + CO₂(g), what does Δ mean?', 'The reactant is heated', ['A catalyst is used', 'Light is needed', 'The reaction is reversible'], 'Δ is the Greek letter delta.', 'Δ over the arrow means heat is supplied.'],
          ['In Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑, what is the state of zinc sulphate?', 'Dissolved in water', ['Solid precipitate', 'Gas', 'Pure liquid'], 'Look for (aq).', '(aq) means it is in aqueous solution.'],
          ['Which reaction is exothermic?', 'CH₄ + 2O₂ → CO₂ + 2H₂O + heat', ['CaCO₃ + heat → CaO + CO₂', '2AgCl —sunlight→ 2Ag + Cl₂', 'Electrolysis of water'], 'Heat written as a product.', 'Heat on the product side means heat is given out — exothermic.'],
          ['What does Ni written on the arrow of an oil-hydrogenation equation show?', 'Nickel is a catalyst', ['Nickel is a reactant used up', 'Nickel is a product', 'The reaction needs nickel light'], 'It is above the arrow, not on either side.', 'Substances on the arrow are catalysts — they speed up the reaction without being consumed.'],
          ['A white solid separates out when two clear solutions are mixed. In the equation this solid gets…', '(s) and a downward arrow ↓', ['(aq) and ↑', '(g) and ↑', '(l) only'], 'An insoluble solid settles down.', 'A precipitate is shown with (s) and ↓.'],
          ['Photosynthesis needs sunlight. How is this shown?', 'Sunlight (and chlorophyll) written over the arrow', ['+ light on the product side', '(aq) after glucose', 'A downward arrow'], 'Conditions go on the arrow.', 'Conditions needed for a reaction are written over the arrow.'],
        ]),
        tapT('info', 'Tap everything a fully informative chemical equation can tell you.', [
          ['Formulae of reactants and products', true], ['Physical states of substances', true], ['Conditions such as heat or catalyst', true], ['Whether heat is given out', true],
          ['How fast the reaction is in seconds', false], ['The colour of every substance', false], ['The price of the chemicals', false],
        ], ['Think about the symbols we learnt: states, arrows, Δ, catalysts, + heat.', 'Speed in seconds is not shown by symbols.'], 'Equations show substances, states, conditions and heat change, but not the speed or the cost.'),
      ],
    },
    {
      id: 'ts10.ps.equation.mole', title: 'Interpreting a balanced equation: moles, masses and gas volumes', prereqs: ['ts10.ps.equation.balance'],
      intro: [
        h('An equation is also a recipe'),
        photo('⚖', 'A kitchen recipe says "2 cups rice : 4 cups water". A balanced equation gives the same kind of ratio — for particles.'),
        p('Atoms are far too small to count one by one, so chemists count them in bundles called moles. One mole is 6.022 × 10²³ particles (Avogadro number). The mass of one mole of a substance in grams equals its formula mass in u — this is called the molar mass (M).'),
        def('Mole', 'The amount of substance containing 6.022 × 10²³ particles (atoms, molecules or ions).'),
        def('Molar mass (M)', 'The mass of one mole of a substance, in g/mol. For water H₂O: 2 × 1 + 16 = 18 g/mol.'),
        f('n = m / M', 'number of moles equals mass divided by molar mass'),
        p('Reading 2H₂ + O₂ → 2H₂O: 2 molecules of hydrogen react with 1 molecule of oxygen to give 2 molecules of water. Multiply by Avogadro number: 2 moles + 1 mole → 2 moles. In grams: 2 × 2 = 4 g of H₂ + 32 g of O₂ → 36 g of water. Mass is conserved: 4 + 32 = 36.'),
        p('For gases there is a handy fact: at STP (0 °C, 1 atm) one mole of ANY gas occupies 22.4 litres. So the coefficients also give volume ratios for gases.'),
        xp({
          title: 'What if? Mass and molar mass decide the number of moles', formula: 'n = m / M',
          res: ['n', 'Number of moles', 'mol', 'm / M', 3],
          vars: [['m', 'Mass taken', 'g', 1, 500, 1, 36], ['M', 'Molar mass', 'g/mol', 2, 200, 1, 18]],
          notes: [
            ['m', 'Taking more grams of the same substance gives proportionally more moles (more particles).', 'Less mass means fewer particles.'],
            ['M', 'A heavier molecule (bigger M) means fewer molecules fit into the same mass.', 'A lighter molecule means more of them fit into the same mass — 2 g of H₂ is a whole mole!'],
          ],
          mistakes: [['Multiplying m × M', 'Moles = how many bundles of M grams fit into m grams, so divide: n = m/M.'], ['Using atomic mass instead of molecular mass for O₂ or H₂', 'Oxygen gas is O₂, so M = 32 g/mol, not 16.']],
          real: 'A 1 litre bottle of water (1000 g) holds about 1000 ÷ 18 ≈ 55.6 moles of water molecules.',
        }),
        xp({
          title: 'What if? How much CO₂ comes from heating limestone?', formula: 'CaCO₃ → CaO + CO₂   (100 g → 56 g + 44 g)',
          res: ['m_CO2', 'Mass of CO₂ given off', 'g', 'mL * 44 / 100', 1],
          vars: [['mL', 'Mass of CaCO₃ heated', 'g', 10, 1000, 10, 100]],
          notes: [['mL', 'Twice the limestone gives twice the carbon dioxide — a balanced equation fixes the ratio 100 : 44.', 'Less limestone gives less CO₂ in the same ratio.']],
          mistakes: [['Assuming 100 g of CaCO₃ gives 100 g of CO₂', 'The mass is shared between CaO (56 g) and CO₂ (44 g); together they make 100 g.'], ['Forgetting the coefficients', 'If an equation has 2 in front of a substance, its mass is 2 × molar mass.']],
          real: 'Lime kilns that turn limestone into quicklime release huge amounts of CO₂ — about 0.44 t for every tonne of limestone.',
        }),
        keys('Coefficients = ratio of molecules = ratio of moles.', 'n = m/M; mass of reactants = mass of products.', '1 mol of any gas at STP = 22.4 L.', 'Use atomic masses: H 1, C 12, N 14, O 16, Na 23, Mg 24, Al 27, S 32, Cl 35.5, Ca 40, Fe 56, Zn 65.'),
        remember('Always balance the equation BEFORE doing any mole or mass calculation.'),
      ],
      examples: [
        ex('How many moles are present in 88 g of carbon dioxide?', ['M(CO₂) = 12 + 2 × 16 = 44 g/mol', 'n = m/M = 88 ÷ 44', 'n = 2 mol'], '2 mol'),
        ex('Imran heats 50 g of calcium carbonate. What mass of quicklime (CaO) and what volume of CO₂ at STP form?', ['CaCO₃ → CaO + CO₂', 'n(CaCO₃) = 50 ÷ 100 = 0.5 mol', 'Mass of CaO = 0.5 × 56 = 28 g', 'Volume of CO₂ = 0.5 × 22.4 = 11.2 L'], '28 g CaO and 11.2 L CO₂'),
        ex('What mass of water forms when 8 g of hydrogen burns completely? (2H₂ + O₂ → 2H₂O)', ['n(H₂) = 8 ÷ 2 = 4 mol', '2 mol H₂ → 2 mol H₂O, so 4 mol H₂O form', 'Mass = 4 × 18 = 72 g'], '72 g'),
      ],
      practice: [
        tp('moles', (r) => {
          const [nm, M] = r.pick([['water (H₂O)', 18], ['carbon dioxide (CO₂)', 44], ['sodium chloride (NaCl)', 58.5], ['calcium carbonate (CaCO₃)', 100], ['sodium hydroxide (NaOH)', 40], ['oxygen gas (O₂)', 32], ['ammonia (NH₃)', 17], ['methane (CH₄)', 16], ['sulphuric acid (H₂SO₄)', 98], ['glucose (C₆H₁₂O₆)', 180]] as [string, number][]);
          const k = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 0.25]);
          const m = rd(M * k, 3);
          return numQ(`How many moles are there in ${m} g of ${nm}? (Use H 1, C 12, N 14, O 16, Na 23, S 32, Cl 35.5, Ca 40.)`, k, undefined,
            ['First find the molar mass by adding atomic masses.', `M = ${M} g/mol; then n = m/M.`],
            [`M = ${M} g/mol`, `n = ${m} ÷ ${M} = ${k} mol`],
            [{ when: String(rd(m * M, 2)), explain: 'You multiplied. Moles = mass ÷ molar mass.' }]);
        }),
        tp('caco3', (r) => {
          const m = r.pick([10, 20, 25, 50, 100, 150, 200, 250, 500]);
          const ask = r.pick(['CaO', 'CO₂ mass', 'CO₂ volume'] as const);
          const n = m / 100;
          if (ask === 'CO₂ volume') return numQ(`${m} g of calcium carbonate is heated: CaCO₃ → CaO + CO₂. What volume of CO₂ is produced at STP?`, rd(n * 22.4, 3), 'L',
            ['n(CaCO₃) = m ÷ 100', '1 mol CaCO₃ → 1 mol CO₂; 1 mol gas at STP = 22.4 L'], [`n = ${m} ÷ 100 = ${n} mol`, `V = ${n} × 22.4 = ${rd(n * 22.4, 3)} L`]);
          const M = ask === 'CaO' ? 56 : 44;
          return numQ(`${m} g of calcium carbonate is heated strongly: CaCO₃ → CaO + CO₂. What mass of ${ask === 'CaO' ? 'calcium oxide (quicklime)' : 'carbon dioxide'} forms? (Ca 40, C 12, O 16)`, rd(n * M, 3), 'g',
            ['M(CaCO₃) = 100 g/mol', `1 mol CaCO₃ gives 1 mol ${ask === 'CaO' ? 'CaO (56 g)' : 'CO₂ (44 g)'}.`],
            [`n = ${m} ÷ 100 = ${n} mol`, `mass = ${n} × ${M} = ${rd(n * M, 3)} g`],
            [{ when: `${m} g`, explain: 'The mass of CaCO₃ is shared between CaO and CO₂, so one product cannot weigh as much as all the reactant.' }]);
        }, 2),
        tp('water', (r) => {
          const mH = r.pick([1, 2, 4, 6, 8, 10, 12, 20]);
          const ask = r.pick(['water', 'oxygen'] as const);
          const n = mH / 2;
          if (ask === 'oxygen') return numQ(`For 2H₂ + O₂ → 2H₂O, what mass of oxygen is needed to burn ${mH} g of hydrogen completely?`, n / 2 * 32, 'g',
            ['n(H₂) = m ÷ 2', '2 mol H₂ need 1 mol O₂ (32 g).'], [`n(H₂) = ${n} mol`, `n(O₂) = ${n / 2} mol`, `mass = ${n / 2} × 32 = ${(n / 2) * 32} g`],
            [{ when: `${n * 32} g`, explain: 'Use the ratio 2 : 1 — only half as many moles of O₂ as H₂ are needed.' }]);
          return numQ(`For 2H₂ + O₂ → 2H₂O, what mass of water forms from ${mH} g of hydrogen?`, n * 18, 'g',
            ['n(H₂) = mass ÷ 2 g/mol', '2 mol H₂ → 2 mol H₂O (ratio 1 : 1); M(H₂O) = 18 g/mol'], [`n(H₂) = ${mH} ÷ 2 = ${n} mol`, `n(H₂O) = ${n} mol`, `mass = ${n} × 18 = ${n * 18} g`]);
        }, 2),
        mcq('read', 'Coefficients give the ratio of particles and of moles.', [
          ['In N₂ + 3H₂ → 2NH₃, the mole ratio N₂ : H₂ : NH₃ is…', '1 : 3 : 2', ['1 : 1 : 1', '2 : 6 : 2', '1 : 3 : 1'], 'Read the coefficients.', 'The coefficients 1, 3, 2 are the mole ratio.'],
          ['At STP, how much space does 1 mole of any gas occupy?', '22.4 L', ['1 L', '6.022 L', '44 L'], 'Molar volume.', 'One mole of any gas at STP occupies 22.4 L.'],
          ['In 2H₂ + O₂ → 2H₂O, 4 g of H₂ react with 32 g of O₂. Mass of water formed?', '36 g', ['32 g', '40 g', '18 g'], 'Conservation of mass.', '4 + 32 = 36 g — mass is conserved.'],
          ['What is the molar mass of CO₂?', '44 g/mol', ['28 g/mol', '32 g/mol', '22.4 g/mol'], '12 + 2 × 16', 'C = 12, O = 16: 12 + 32 = 44 g/mol.'],
          ['In CH₄ + 2O₂ → CO₂ + 2H₂O, 1 L of methane needs how much oxygen (same conditions)?', '2 L', ['1 L', '0.5 L', '22.4 L'], 'For gases, mole ratio = volume ratio.', 'Coefficients 1 : 2 give a volume ratio 1 : 2.'],
          ['How many particles are there in one mole?', '6.022 × 10²³', ['22.4', '1000', '6.022 × 10⁻²³'], 'Avogadro number.', 'One mole always contains 6.022 × 10²³ particles.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.equation.types', title: 'Types of reactions; oxidation and reduction', prereqs: ['ts10.ps.equation.informative'],
      intro: [
        h('Sorting reactions into families'),
        photo('🔩', 'An iron nail left in a moist place turns brown: a slow reaction between iron, oxygen and water.'),
        p('Thousands of reactions happen around us, but most fit into a few patterns. Spotting the pattern helps you predict products.'),
        def('Combination reaction', 'Two or more substances join to form one product: A + B → AB. e.g. CaO + H₂O → Ca(OH)₂ (slaking of lime, very exothermic).'),
        def('Decomposition reaction', 'One substance breaks into two or more: AB → A + B. Needs heat (thermal), electricity (electrolysis) or light (photolysis). e.g. 2AgBr —light→ 2Ag + Br₂ (used in black-and-white photography).'),
        def('Displacement reaction', 'A more reactive element pushes a less reactive one out of its compound: Fe + CuSO₄ → FeSO₄ + Cu (blue solution turns pale green; the nail gets a brown copper coat).'),
        def('Double displacement reaction', 'Two compounds exchange their ions: AB + CD → AD + CB. Often a precipitate forms, e.g. Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl.'),
        h('Oxidation and reduction'),
        p('Oxidation means gaining oxygen (or losing hydrogen). Reduction means losing oxygen (or gaining hydrogen). They always happen together, so such reactions are called redox reactions. In CuO + H₂ —Δ→ Cu + H₂O, copper oxide loses oxygen (reduced) and hydrogen gains oxygen (oxidised).'),
        def('Oxidising agent', 'The substance that gives oxygen (or removes hydrogen) — it gets reduced itself. In the example above, CuO.'),
        def('Reducing agent', 'The substance that takes oxygen (or gives hydrogen) — it gets oxidised itself. In the example above, H₂.'),
        h('Oxidation in daily life'),
        p('Corrosion: metals slowly attacked by air and moisture — rusting of iron, black coat on silver, green coat on copper. Rancidity: oils and fats in food get oxidised and smell and taste bad; chips packets are filled with nitrogen and foods are kept in airtight containers or with antioxidants to slow this.'),
        keys('Combination: many → one. Decomposition: one → many.', 'Displacement: more reactive element replaces less reactive one.', 'Double displacement: ions swap partners.', 'Oxidation = gain of O / loss of H; reduction = loss of O / gain of H; they occur together.'),
        remember('The oxidising agent is itself REDUCED; the reducing agent is itself OXIDISED. This reversal is the most common exam trap.'),
      ],
      examples: [
        ex('Classify: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s) and explain the colour change.', ['Iron is more reactive than copper.', 'Iron takes copper\'s place in the sulphate — displacement.', 'Blue CuSO₄ becomes pale green FeSO₄; brown copper deposits on the iron.'], 'Displacement reaction'),
        ex('In ZnO + C → Zn + CO, identify the substance oxidised, reduced, the oxidising agent and the reducing agent.', ['ZnO loses oxygen → reduced.', 'C gains oxygen → oxidised.', 'ZnO gives oxygen → oxidising agent.', 'C takes oxygen → reducing agent.'], 'ZnO reduced (oxidising agent); C oxidised (reducing agent)'),
      ],
      practice: [
        mcq('type', 'Count reactants and products, and look for swapping partners.', [
          ['CaO + H₂O → Ca(OH)₂ is a…', 'Combination reaction', ['Decomposition reaction', 'Displacement reaction', 'Double displacement reaction'], 'Two reactants, one product.', 'Two substances combine into one product.'],
          ['2Pb(NO₃)₂ —Δ→ 2PbO + 4NO₂ + O₂ is a…', 'Decomposition reaction', ['Combination reaction', 'Displacement reaction', 'Double displacement reaction'], 'One reactant, many products.', 'A single compound breaks down on heating.'],
          ['Zn + CuSO₄ → ZnSO₄ + Cu is a…', 'Displacement reaction', ['Combination reaction', 'Decomposition reaction', 'Double displacement reaction'], 'An element replaces another element.', 'More reactive zinc displaces copper.'],
          ['AgNO₃ + NaCl → AgCl↓ + NaNO₃ is a…', 'Double displacement reaction', ['Combination reaction', 'Displacement reaction', 'Decomposition reaction'], 'Two compounds exchange ions.', 'Ag⁺ and Na⁺ swap partners; white AgCl precipitates.'],
          ['2AgCl —sunlight→ 2Ag + Cl₂ is a…', 'Photolytic decomposition', ['Combination', 'Double displacement', 'Thermal combination'], 'Light breaks one substance into two.', 'Sunlight decomposes silver chloride: photolysis.'],
          ['2H₂O —electricity→ 2H₂ + O₂ is a…', 'Electrolytic decomposition', ['Combination', 'Displacement', 'Double displacement'], 'Electric current splits water.', 'Electricity breaks water into hydrogen and oxygen.'],
          ['C + O₂ → CO₂ is a…', 'Combination reaction', ['Decomposition', 'Displacement', 'Double displacement'], 'Two reactants form one product.', 'Carbon and oxygen join to form one product.'],
        ]),
        mcq('redox', 'Oxidation = gain of oxygen; reduction = loss of oxygen.', [
          ['In CuO + H₂ → Cu + H₂O, which substance is reduced?', 'CuO', ['H₂', 'Cu', 'H₂O'], 'Which loses oxygen?', 'CuO loses oxygen to become Cu, so it is reduced.'],
          ['In CuO + H₂ → Cu + H₂O, the reducing agent is…', 'H₂', ['CuO', 'Cu', 'H₂O'], 'The reducing agent itself gets oxidised.', 'H₂ takes oxygen and is oxidised, so it is the reducing agent.'],
          ['In ZnO + C → Zn + CO, the oxidising agent is…', 'ZnO', ['C', 'Zn', 'CO'], 'Who gives away oxygen?', 'ZnO supplies oxygen to carbon; it is the oxidising agent.'],
          ['In Fe₂O₃ + 2Al → Al₂O₃ + 2Fe, which substance is oxidised?', 'Al', ['Fe₂O₃', 'Fe', 'Al₂O₃'], 'Which gains oxygen?', 'Aluminium gains oxygen to become Al₂O₃.'],
          ['In MnO₂ + 4HCl → MnCl₂ + 2H₂O + Cl₂, HCl is…', 'Oxidised (it loses hydrogen)', ['Reduced', 'Neither', 'A catalyst'], 'Loss of hydrogen also means oxidation.', 'HCl loses hydrogen to form Cl₂, so it is oxidised.'],
          ['Chips packets are flushed with nitrogen to…', 'Prevent oxidation (rancidity) of oils', ['Make chips heavier', 'Add flavour', 'Kill bacteria with heat'], 'Nitrogen is unreactive.', 'Removing oxygen slows the oxidation that makes fats rancid.'],
        ], 2),
        matchT('match', 'everyday example to its reaction type', [
          ['Burning coal', 'Combination (and oxidation)'], ['Heating limestone in a kiln', 'Decomposition'], ['Iron nail in copper sulphate', 'Displacement'],
          ['Mixing silver nitrate and salt solutions', 'Double displacement'], ['Butter smelling bad after weeks', 'Rancidity (oxidation)'], ['Brown coat on an iron gate', 'Corrosion (rusting)'],
        ], ['Ask: how many reactants, how many products, and does an element swap places?', 'Oxidation in food is rancidity; in metals it is corrosion.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 3 — Acids, Bases and Salts
// =====================================================================================
const HYDRATES: [string, string, number, number][] = [
  // name, formula, molar mass of anhydrous salt, n (water molecules)
  ['blue vitriol (copper sulphate crystals)', 'CuSO₄·5H₂O', 159.5, 5],
  ['washing soda', 'Na₂CO₃·10H₂O', 106, 10],
  ['gypsum', 'CaSO₄·2H₂O', 136, 2],
  ['green vitriol (ferrous sulphate crystals)', 'FeSO₄·7H₂O', 152, 7],
  ['Epsom salt', 'MgSO₄·7H₂O', 120, 7],
  ['plaster of Paris', 'CaSO₄·½H₂O', 136, 0.5],
];

const ch3: USpec = {
  id: 'ts10.ps.ch3', subject: 'chemistry', title: 'Acids, Bases and Salts', source: src(3),
  objectives: [
    {
      id: 'ts10.ps.acid.properties', title: 'Indicators and chemical properties of acids and bases', prereqs: [],
      intro: [
        h('Sour, bitter and soapy'),
        photo('🍊', 'Oranges and lemons taste sour because they contain citric acid. Tamarind has tartaric acid; curd has lactic acid.'),
        p('Acids taste sour; bases taste bitter and feel soapy. But we must NEVER taste or touch chemicals in the lab. Instead we use indicators — substances that change colour depending on whether a solution is acidic or basic.'),
        def('Indicator', 'A substance that shows a different colour (or smell) in acidic and basic solutions.'),
        p('Litmus (from lichens): blue litmus turns red in acid; red litmus turns blue in base. Phenolphthalein: colourless in acid, pink in base. Methyl orange: red in acid, yellow in base. Turmeric: yellow, turns red-brown in base — that is why a curry stain turns reddish when washed with soap! Olfactory indicators like onion, vanilla and clove oil lose their smell in a base.'),
        h('What acids do'),
        p('1. Acid + metal → salt + hydrogen gas. Zn + H₂SO₄ → ZnSO₄ + H₂↑. Test: a burning splint near the gas goes out with a "pop".'),
        p('2. Acid + metal carbonate / hydrogencarbonate → salt + water + carbon dioxide. Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑. Test: CO₂ turns lime water milky (CaCO₃ forms); too much CO₂ makes it clear again (soluble Ca(HCO₃)₂).'),
        p('3. Acid + metal oxide → salt + water. CuO + 2HCl → CuCl₂ + H₂O (black powder dissolves, solution turns blue-green). So metal oxides are basic.'),
        h('What bases do'),
        p('Some metals react with strong bases too: Zn + 2NaOH → Na₂ZnO₂ (sodium zincate) + H₂↑. Bases react with non-metal oxides: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O, so non-metal oxides are acidic.'),
        def('Alkali', 'A base that dissolves in water, e.g. NaOH, KOH, Ca(OH)₂. All alkalis are bases but not all bases are alkalis.'),
        keys('Acid + metal → salt + H₂.', 'Acid + carbonate → salt + H₂O + CO₂.', 'Acid + metal oxide → salt + H₂O (metal oxides are basic).', 'Base + non-metal oxide → salt + H₂O (non-metal oxides are acidic).'),
        remember('Test for H₂: "pop" sound with a burning splint. Test for CO₂: turns lime water milky.'),
        tip('Never add water to concentrated acid — always add acid to water slowly while stirring.'),
      ],
      examples: [
        ex('Priya adds dilute HCl to zinc granules in a test tube. What does she see and how does she test the gas?', ['Bubbles form on the zinc: Zn + 2HCl → ZnCl₂ + H₂', 'Bring a burning matchstick to the mouth of the tube.', 'The gas burns with a pop — hydrogen.'], 'Hydrogen gas; it burns with a pop'),
        ex('Baking soda is added to lemon juice and the gas is bubbled through lime water. Explain.', ['NaHCO₃ + acid → salt + H₂O + CO₂', 'CO₂ + Ca(OH)₂ → CaCO₃ (white, insoluble) + H₂O', 'Fine CaCO₃ particles make the lime water milky.'], 'CO₂ is released and turns lime water milky'),
      ],
      practice: [
        mcq('indicators', 'Recall each indicator\'s two colours.', [
          ['Phenolphthalein is added to a basic solution. Colour?', 'Pink', ['Colourless', 'Red', 'Yellow'], 'Phenolphthalein is colourless in acid.', 'Phenolphthalein turns pink in a base.'],
          ['Methyl orange in an acidic solution is…', 'Red', ['Yellow', 'Pink', 'Colourless'], 'Its basic colour is yellow.', 'Methyl orange is red in acid, yellow in base.'],
          ['Blue litmus is dipped in vinegar. It turns…', 'Red', ['Blue stays blue', 'Green', 'Colourless'], 'Vinegar contains acetic acid.', 'Acids turn blue litmus red.'],
          ['A turmeric stain on a shirt turns red-brown when washed with soap because…', 'Soap is basic', ['Soap is acidic', 'Soap is neutral', 'Water is acidic'], 'Turmeric changes colour in bases.', 'Turmeric is an indicator that turns red-brown in basic solutions like soap.'],
          ['Which is an olfactory indicator?', 'Clove oil', ['Litmus', 'Methyl orange', 'Phenolphthalein'], 'Olfactory = related to smell.', 'Clove oil, vanilla and onion change their SMELL in a base.'],
          ['Red litmus turns blue in…', 'Sodium hydroxide solution', ['Lemon juice', 'Vinegar', 'Hydrochloric acid'], 'Which is a base?', 'Bases turn red litmus blue; NaOH is a base.'],
        ]),
        mcq('reactions', 'Use the general word equations.', [
          ['Acid + metal gives salt and…', 'Hydrogen gas', ['Oxygen gas', 'Carbon dioxide', 'Water only'], 'Which gas burns with a pop?', 'Metals displace hydrogen from acids.'],
          ['Acid + sodium carbonate gives salt, water and…', 'Carbon dioxide', ['Hydrogen', 'Oxygen', 'Chlorine'], 'Carbonates contain CO₃.', 'Carbonates release CO₂ with acids.'],
          ['Lime water turns milky because of the formation of…', 'Calcium carbonate', ['Calcium hydrogencarbonate', 'Calcium oxide', 'Sodium chloride'], 'CO₂ + Ca(OH)₂ → ?', 'Insoluble CaCO₃ makes it milky.'],
          ['Excess CO₂ passed through milky lime water makes it clear again because…', 'Soluble calcium hydrogencarbonate forms', ['CaCO₃ evaporates', 'Water boils', 'Ca(OH)₂ re-forms'], 'Ca(HCO₃)₂ dissolves in water.', 'CaCO₃ + H₂O + CO₂ → Ca(HCO₃)₂, which is soluble.'],
          ['Zinc reacts with sodium hydroxide to give hydrogen and…', 'Sodium zincate (Na₂ZnO₂)', ['Zinc chloride', 'Sodium chloride', 'Zinc carbonate'], 'Product is a salt of zinc and sodium.', 'Zn + 2NaOH → Na₂ZnO₂ + H₂.'],
          ['Copper oxide dissolves in dilute HCl giving a blue-green solution. This shows metal oxides are…', 'Basic', ['Acidic', 'Neutral', 'Indicators'], 'They react with acids.', 'Reacting with an acid to form salt + water means metal oxides are basic.'],
        ], 2),
        matchT('match', 'reaction to its product gas or observation', [
          ['Zn + dilute H₂SO₄', 'H₂ — burns with a pop'], ['Na₂CO₃ + dilute HCl', 'CO₂ — lime water milky'], ['CuO + dilute HCl', 'Blue-green solution, no gas'],
          ['Zn + NaOH (heated)', 'H₂ and sodium zincate'], ['CO₂ through lime water (excess)', 'Milky, then clear again'], ['Mg ribbon + dilute HCl', 'H₂ and magnesium chloride'],
        ], ['Metals with acid (or strong base) give hydrogen.', 'Carbonates give carbon dioxide.']),
      ],
    },
    {
      id: 'ts10.ps.acid.neutral', title: 'Neutralisation and its uses', prereqs: ['ts10.ps.acid.properties'],
      intro: [
        h('When acid meets base'),
        photo('💊', 'An antacid tablet contains a mild base such as magnesium hydroxide that cancels extra stomach acid.'),
        p('When an acid and a base are mixed in the right amounts, they cancel each other\'s properties. The products are a salt and water. This is called neutralisation.'),
        f('Acid + Base → Salt + Water', 'acid plus base gives salt plus water'),
        p('Example: HCl + NaOH → NaCl + H₂O. At the ion level, every neutralisation is the same: H⁺(aq) + OH⁻(aq) → H₂O(l). Neutralisation gives out heat (it is exothermic).'),
        def('Neutralisation', 'The reaction between an acid and a base to give salt and water, in which the acidic and basic properties are destroyed.'),
        h('How to see it happen'),
        p('Take some NaOH solution with a drop of phenolphthalein — it turns pink. Add dilute HCl drop by drop with stirring. The pink suddenly disappears when the base is exactly used up. Add one drop of NaOH and pink returns. The colour change marks the "end point".'),
        h('Neutralisation in daily life'),
        p('Indigestion: antacids (milk of magnesia, Mg(OH)₂) neutralise extra HCl in the stomach. Ant or bee sting: methanoic (formic) acid injected; rubbing baking soda solution (mild base) gives relief. Soil: acidic soil is treated with quicklime, slaked lime or chalk; basic soil with organic matter. Factory wastes: acidic waste is neutralised with bases before release. Tooth decay: toothpaste is basic and neutralises acid made by mouth bacteria.'),
        keys('Acid + base → salt + water + heat.', 'Ionic form: H⁺ + OH⁻ → H₂O.', 'Indicator colour change shows the end point.', 'Uses: antacids, stings, soil treatment, toothpaste, waste treatment.'),
        remember('Wasp stings are basic (treated with vinegar), but bee and ant stings are acidic (treated with baking soda). Do not mix them up.'),
      ],
      examples: [
        ex('Teja\'s farm near Karimnagar has acidic soil. What should be added and why?', ['Acidic soil has too many H⁺ ions.', 'A base such as slaked lime Ca(OH)₂ or chalk CaCO₃ neutralises them.', 'Crops that need near-neutral soil can then grow.'], 'Add lime (a base) to neutralise the acidity'),
        ex('Write the neutralisation of sulphuric acid by potassium hydroxide.', ['Acid: H₂SO₄ (gives 2 H⁺); base: KOH', 'Need 2 KOH for 2 H⁺', 'H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O'], 'H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O'),
      ],
      practice: [
        mcq('products', 'Acid + base → salt + water. The salt takes the metal from the base and the non-metal part from the acid.', [
          ['HCl + NaOH → ? + H₂O', 'NaCl', ['NaOH', 'HCl', 'Na₂O'], 'Na from the base, Cl from the acid.', 'The salt is sodium chloride.'],
          ['HNO₃ + KOH → ? + H₂O', 'KNO₃', ['KCl', 'K₂SO₄', 'NaNO₃'], 'K from the base, NO₃ from the acid.', 'Potassium nitrate forms.'],
          ['H₂SO₄ + 2NaOH → ? + 2H₂O', 'Na₂SO₄', ['NaSO₄', 'NaCl', 'Na₂O'], 'Sulphate is SO₄²⁻, so two Na⁺ are needed.', 'Sodium sulphate, Na₂SO₄.'],
          ['2HCl + Ca(OH)₂ → ? + 2H₂O', 'CaCl₂', ['CaCl', 'CaO', 'CaCO₃'], 'Ca²⁺ needs two Cl⁻.', 'Calcium chloride, CaCl₂.'],
          ['CH₃COOH + NaOH → ? + H₂O', 'CH₃COONa', ['NaCl', 'Na₂CO₃', 'CH₄'], 'The acid part is acetate.', 'Sodium acetate (sodium ethanoate) forms.'],
          ['The ionic equation for every neutralisation is…', 'H⁺ + OH⁻ → H₂O', ['Na⁺ + Cl⁻ → NaCl', 'H₂ + O₂ → H₂O', 'H⁺ + Cl⁻ → HCl'], 'Which ions make an acid and a base what they are?', 'H⁺ from the acid and OH⁻ from the base join to make water.'],
        ]),
        mcq('daily', 'Decide whether the trouble is acidic or basic, then pick the opposite.', [
          ['A bee sting is treated with…', 'Baking soda solution', ['Vinegar', 'Lemon juice', 'Common salt solution'], 'Bee stings inject an acid.', 'A mild base (baking soda) neutralises the acid.'],
          ['Milk of magnesia is used for indigestion because it is…', 'A mild base', ['A strong acid', 'A salt', 'An indicator'], 'Indigestion = too much stomach acid.', 'Mg(OH)₂ is a mild base that neutralises excess acid.'],
          ['Farmers add quicklime to soil when the soil is…', 'Too acidic', ['Too basic', 'Too wet', 'Too sandy'], 'Lime is a base.', 'Bases neutralise acidic soil.'],
          ['Toothpastes are usually…', 'Basic', ['Acidic', 'Neutral salts only', 'Strongly acidic'], 'Bacteria in the mouth produce acid.', 'Basic toothpaste neutralises mouth acid and protects enamel.'],
          ['Neutralisation reactions are…', 'Exothermic (give out heat)', ['Endothermic', 'Neither', 'Only happen when heated'], 'Does the beaker get warm?', 'H⁺ + OH⁻ → H₂O releases heat.'],
          ['In a titration, NaOH with phenolphthalein is pink. Acid is added until…', 'The pink colour just disappears', ['It turns blue', 'It turns red', 'Bubbles appear'], 'Phenolphthalein is colourless in neutral/acid.', 'Loss of pink marks complete neutralisation of the base.'],
        ]),
        tapT('tap', 'Tap every situation where a base is used to neutralise an acid.', [
          ['Antacid for stomach acid', true], ['Baking soda on an ant bite', true], ['Lime added to acidic soil', true], ['Toothpaste after eating sweets', true],
          ['Vinegar on a wasp sting', false], ['Adding lemon juice to dal', false], ['Pouring acid into water to dilute it', false],
        ], ['Find the acid in each situation first.', 'Wasp stings are basic, so vinegar (acid) is used there — opposite case.'], 'A base neutralises acid in antacids, sting relief, soil treatment and toothpaste.'),
      ],
    },
    {
      id: 'ts10.ps.acid.ph', title: 'Ions in water, strength of acids and the pH scale', prereqs: ['ts10.ps.acid.neutral'],
      intro: [
        h('What makes an acid an acid?'),
        photo('💧', 'Pure water barely conducts electricity — but add a little acid and a bulb in the circuit glows.'),
        p('HCl gas dissolved in dry petrol does not turn litmus red. Dissolve it in water and it does. Why? In water, acids split up (ionise) and give hydrogen ions: HCl → H⁺ + Cl⁻. H⁺ cannot exist alone, so it joins a water molecule to form the hydronium ion H₃O⁺. These ions also carry electric current, which is why acid solutions conduct.'),
        def('Acid (Arrhenius idea)', 'A substance that produces H⁺ (H₃O⁺) ions in water.'),
        def('Base / alkali', 'A substance that produces OH⁻ (hydroxide) ions in water, e.g. NaOH → Na⁺ + OH⁻.'),
        p('Glucose and alcohol also contain hydrogen but do NOT give H⁺ in water — so they are not acids, and their solutions do not conduct.'),
        h('Strong or weak? Concentrated or dilute?'),
        def('Strong acid', 'Ionises almost completely in water (HCl, H₂SO₄, HNO₃). A weak acid ionises only partly (acetic acid, citric acid, carbonic acid).'),
        p('Strength is about HOW MUCH the acid ionises. Concentration is about HOW MUCH acid is in a given volume of water. A dilute solution of a strong acid can contain fewer H⁺ ions than a concentrated weak acid. Diluting an acid lowers the H⁺ concentration per volume. Dissolving a concentrated acid in water releases a lot of heat — add acid to water slowly, never the reverse.'),
        h('The pH scale'),
        p('pH measures how many H⁺ ions are present, on a scale from 0 to 14 (p comes from "potenz" — power). pH 7 is neutral (pure water). Below 7 acidic: the lower the pH, the more H⁺. Above 7 basic: the higher the pH, the more OH⁻. Each step of 1 on the scale means a TEN-times change in H⁺ concentration. A universal indicator shows a different colour at each pH.'),
        f('pH = −log[H⁺]', 'p H equals minus log of hydrogen ion concentration (for interest — at this level read pH qualitatively)'),
        xp({
          title: 'What if? Dilute an acid and watch its pH', formula: 'pH = −log( [H⁺] ÷ dilution )',
          res: ['pH', 'pH of the diluted acid', '', '-log(c / D)', 2],
          vars: [['c', 'Starting H⁺ concentration', 'mol/L', 0.001, 1, 0.001, 0.1], ['D', 'Dilution (times)', '', 1, 1000, 1, 1]],
          notes: [
            ['c', 'More H⁺ to begin with means a more acidic solution: pH goes DOWN.', 'Fewer H⁺ means a weaker acidic solution: pH rises towards 7.'],
            ['D', 'Diluting 10 times raises the pH by exactly 1; 100 times by 2. The acid is still an acid — pH creeps towards 7 but never crosses it by dilution.', 'Less dilution keeps the H⁺ crowded: lower pH.'],
          ],
          mistakes: [['Thinking a higher pH means more acidic', 'It is the opposite: pH 2 is far more acidic than pH 5 (1000 times more H⁺).'], ['Thinking pH changes in equal steps of H⁺', 'Each pH unit is a factor of 10 in H⁺ concentration.'], ['Believing enough water can make an acid basic', 'Water itself is neutral, so dilution only brings pH close to 7.']],
          real: 'Lemon juice (pH about 2) has roughly 100 000 times more H⁺ than pure water (pH 7).',
        }),
        h('pH in everyday life'),
        p('Our body works at pH 7.0–7.8. Stomach juice contains HCl (pH about 1.5–2). Tooth enamel starts to dissolve below pH 5.5. Most crops prefer soil near pH 6–7.5. Rain with pH below 5.6 is acid rain; it can harm lakes and fish. Many plants and animals use acids for defence: nettle leaves and ants inject methanoic acid.'),
        keys('Acids give H⁺ (H₃O⁺) in water; bases give OH⁻.', 'Strong = fully ionised; weak = partly ionised.', 'pH < 7 acidic, 7 neutral, > 7 basic; 1 pH step = 10× H⁺.', 'Mix acid INTO water slowly — the process is highly exothermic.'),
        remember('Do not confuse "strong" with "concentrated" — they describe different things.'),
      ],
      examples: [
        ex('Solution A has pH 3 and solution B has pH 5. Which is more acidic and by how much?', ['Lower pH = more acidic → A', 'Difference = 2 pH units', 'H⁺ ratio = 10 × 10 = 100'], 'A is more acidic, with 100 times more H⁺'),
        ex('Why does dilute HCl conduct electricity but a glucose solution does not?', ['HCl ionises in water: HCl + H₂O → H₃O⁺ + Cl⁻', 'Moving ions carry current.', 'Glucose stays as neutral molecules — no ions.'], 'Only HCl produces ions in water'),
      ],
      practice: [
        mcq('scale', 'Below 7 acidic, 7 neutral, above 7 basic.', [
          ['A solution turns universal indicator to pH 13. It is…', 'Strongly basic', ['Strongly acidic', 'Neutral', 'Weakly acidic'], '13 is far above 7.', 'pH 13 is strongly basic (alkaline).'],
          ['Which pH is most acidic?', '1', ['4', '7', '11'], 'Lower pH = more H⁺.', 'pH 1 has the highest H⁺ concentration.'],
          ['Pure water has pH…', '7', ['0', '1', '14'], 'Neither acidic nor basic.', 'Pure water is neutral, pH 7.'],
          ['Tooth decay starts when the pH in the mouth falls below about…', '5.5', ['7.4', '9', '2'], 'Enamel dissolves in acid.', 'Below about pH 5.5 enamel (calcium phosphate) starts to dissolve.'],
          ['Rain is called acid rain when its pH is below about…', '5.6', ['7', '8.5', '1'], 'Normal rain is slightly acidic from CO₂.', 'Rain below pH 5.6 is acid rain.'],
          ['Going from pH 6 to pH 4, the H⁺ concentration becomes…', '100 times greater', ['2 times greater', '100 times smaller', 'Unchanged'], 'Each step is ×10.', 'Two steps lower: 10 × 10 = 100 times more H⁺.'],
        ]),
        mcq('ions', 'Acids give H⁺ / H₃O⁺; bases give OH⁻.', [
          ['Which ion is responsible for acidic properties in water?', 'H₃O⁺ (H⁺)', ['OH⁻', 'Cl⁻', 'Na⁺'], 'Hydronium.', 'H⁺ combines with water to give hydronium ion, H₃O⁺.'],
          ['HCl gas in dry petrol does not turn blue litmus red because…', 'It does not ionise without water', ['Petrol is basic', 'HCl is a base', 'Litmus dissolves in petrol'], 'Ions need water.', 'Without water, HCl cannot release H⁺ ions.'],
          ['Which is a weak acid?', 'Acetic acid', ['Hydrochloric acid', 'Sulphuric acid', 'Nitric acid'], 'Weak = only partly ionised.', 'Acetic (ethanoic) acid ionises only partly.'],
          ['Why must acid be added to water and not water to acid?', 'The reaction gives a lot of heat that can splash acid', ['Water is heavier', 'Acid becomes a base', 'No reason'], 'Highly exothermic.', 'Adding water to concentrated acid can boil locally and splash acid.'],
          ['Glucose contains hydrogen but is not an acid because…', 'It does not give H⁺ ions in water', ['It is sweet', 'It is a solid', 'It has carbon'], 'Acidity needs H⁺ ions in water.', 'Only substances that release H⁺ in water behave as acids.'],
          ['On diluting an acid, the concentration of H₃O⁺ per unit volume…', 'Decreases', ['Increases', 'Stays the same', 'Becomes zero'], 'Same ions, more water.', 'The ions spread through more water, so their concentration falls.'],
        ], 2),
        tp('ratio', (r) => {
          const a = r.int(1, 6), b = a + r.int(1, 3);
          const ratio = 10 ** (b - a);
          return numQ(`Solution X has pH ${a} and solution Y has pH ${b}. How many times more H⁺ ions per litre does X have than Y?`, ratio, undefined,
            ['Lower pH = more H⁺.', 'Each pH unit is a factor of 10.'], [`Difference = ${b} − ${a} = ${b - a}`, `Ratio = 10^${b - a} = ${ratio}`],
            [{ when: String(b - a), explain: 'The pH scale is logarithmic — a difference of 1 unit is a factor of 10, not 1.' }, { when: String(2 * (b - a)), explain: 'Each pH step multiplies H⁺ by 10, not by 2.' }]);
        }, 2),
      ],
    },
    {
      id: 'ts10.ps.acid.salts', title: 'Salts: families, pH and important salts from common salt', prereqs: ['ts10.ps.acid.neutral'],
      intro: [
        h('Salt is not just table salt'),
        photo('🥚', 'Egg shells are calcium carbonate — a salt. So are chalk, marble and limestone.'),
        p('Every neutralisation produces a salt. A salt is made of a positive ion from a base (like Na⁺, K⁺, Ca²⁺, NH₄⁺) and a negative ion from an acid (like Cl⁻, SO₄²⁻, NO₃⁻, CO₃²⁻). Salts with the same positive ion form one family (sodium salts), and salts with the same negative ion form another (chlorides).'),
        def('Salt', 'An ionic compound formed when the H⁺ of an acid is replaced by a metal or ammonium ion.'),
        h('Is a salt solution always neutral? No!'),
        p('Strong acid + strong base → neutral salt (NaCl, pH 7). Strong acid + weak base → acidic salt (NH₄Cl, pH < 7). Weak acid + strong base → basic salt (Na₂CO₃, CH₃COONa, pH > 7).'),
        h('Chemicals made from common salt'),
        p('Common salt (NaCl) is obtained from sea water by evaporation, and from rock salt deposits. It is the raw material for many chemicals:'),
        p('Sodium hydroxide (chlor-alkali process): electricity through brine — 2NaCl + 2H₂O → 2NaOH + Cl₂ + H₂. Chlorine forms at the anode, hydrogen at the cathode, and NaOH near the cathode. Uses: soaps, paper, artificial fibres; Cl₂ for PVC and disinfectants; H₂ for fuels and margarine.'),
        p('Bleaching powder (CaOCl₂): chlorine passed over dry slaked lime — Ca(OH)₂ + Cl₂ → CaOCl₂ + H₂O. Used to bleach cloth and paper, and to disinfect drinking water.'),
        p('Baking soda (sodium hydrogencarbonate, NaHCO₃): NaCl + H₂O + CO₂ + NH₃ → NH₄Cl + NaHCO₃. On heating, 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂ — the CO₂ makes cakes and dosa batter rise. Baking powder = baking soda + a mild edible acid (tartaric acid). Also used in antacids and soda-acid fire extinguishers.'),
        p('Washing soda (Na₂CO₃·10H₂O): made by recrystallising sodium carbonate. Used in glass, soap and paper industries, for removing permanent hardness of water, and for cleaning.'),
        p('Plaster of Paris (CaSO₄·½H₂O): made by heating gypsum at 373 K. With water it sets back into hard gypsum — used for plaster casts for broken bones, toys, statues and smooth wall finishes. It must be stored in a moisture-proof container.'),
        keys('Salt = positive ion from a base + negative ion from an acid.', 'Strong + strong → neutral; strong acid + weak base → acidic; weak acid + strong base → basic.', 'NaCl → NaOH, Cl₂, H₂ (chlor-alkali), bleaching powder, baking soda, washing soda.', 'Plaster of Paris sets by taking up water to become gypsum.'),
        remember('Baking soda is NaHCO₃; washing soda is Na₂CO₃·10H₂O. Bleaching powder is CaOCl₂; plaster of Paris is CaSO₄·½H₂O.'),
      ],
      examples: [
        ex('Is a solution of ammonium chloride acidic, basic or neutral? Explain.', ['NH₄Cl comes from HCl (strong acid) and NH₄OH (weak base).', 'The strong partner wins.'], 'Acidic (pH < 7)'),
        ex('Why does dosa batter with a pinch of baking soda become fluffy on heating?', ['2NaHCO₃ —Δ→ Na₂CO₃ + H₂O + CO₂', 'CO₂ bubbles get trapped in the batter.', 'The batter puffs up and becomes soft.'], 'CO₂ released on heating makes it rise'),
      ],
      practice: [
        matchT('names', 'common name to its formula', [
          ['Baking soda', 'NaHCO₃'], ['Washing soda', 'Na₂CO₃·10H₂O'], ['Bleaching powder', 'CaOCl₂'], ['Plaster of Paris', 'CaSO₄·½H₂O'],
          ['Gypsum', 'CaSO₄·2H₂O'], ['Common salt', 'NaCl'], ['Caustic soda', 'NaOH'],
        ], ['Baking soda has one hydrogen; washing soda has ten waters.', 'Plaster of Paris has half a water; gypsum has two.']),
        mcq('ph', 'Find the parent acid and parent base, then decide which is strong.', [
          ['A solution of sodium chloride is…', 'Neutral', ['Acidic', 'Basic', 'Strongly acidic'], 'HCl and NaOH are both strong.', 'Strong acid + strong base → neutral salt.'],
          ['A solution of sodium carbonate is…', 'Basic', ['Acidic', 'Neutral', 'Strongly acidic'], 'Carbonic acid is weak; NaOH is strong.', 'Weak acid + strong base → basic salt.'],
          ['A solution of ammonium chloride is…', 'Acidic', ['Basic', 'Neutral', 'Strongly basic'], 'NH₄OH is a weak base.', 'Strong acid + weak base → acidic salt.'],
          ['A solution of sodium acetate is…', 'Basic', ['Acidic', 'Neutral', 'Strongly acidic'], 'Acetic acid is weak.', 'Weak acid + strong base → basic salt.'],
          ['A solution of potassium sulphate is…', 'Neutral', ['Acidic', 'Basic', 'Strongly basic'], 'H₂SO₄ and KOH are both strong.', 'Strong acid + strong base → neutral salt.'],
          ['Sodium chloride and sodium sulphate belong to the same family because they share…', 'The sodium ion', ['The chloride ion', 'The same acid', 'The same colour'], 'Families are grouped by a common ion.', 'Both contain Na⁺, so they are sodium salts.'],
        ]),
        mcq('uses', 'Link each salt to how it is made or used.', [
          ['In the chlor-alkali process, the gas formed at the anode is…', 'Chlorine', ['Hydrogen', 'Oxygen', 'Carbon dioxide'], 'Anions (Cl⁻) go to the anode.', 'Cl⁻ ions lose electrons at the anode to form Cl₂.'],
          ['Bleaching powder is made by passing chlorine over…', 'Dry slaked lime', ['Common salt', 'Baking soda', 'Gypsum'], 'Ca(OH)₂ + Cl₂ → ?', 'Chlorine reacts with dry slaked lime to give CaOCl₂.'],
          ['Plaster of Paris is made by heating…', 'Gypsum at 373 K', ['Limestone at 1000 K', 'Washing soda', 'Common salt'], 'Gypsum loses some water.', 'CaSO₄·2H₂O → CaSO₄·½H₂O + 1½H₂O at 373 K.'],
          ['Which salt is used to remove permanent hardness of water?', 'Washing soda', ['Baking soda', 'Plaster of Paris', 'Bleaching powder'], 'It precipitates Ca²⁺ and Mg²⁺ as carbonates.', 'Washing soda removes hardness-causing ions.'],
          ['Which is used to disinfect drinking water?', 'Bleaching powder', ['Washing soda', 'Plaster of Paris', 'Baking soda'], 'It releases chlorine.', 'Bleaching powder releases chlorine which kills germs.'],
          ['Baking powder contains baking soda and…', 'A mild edible acid like tartaric acid', ['Washing soda', 'Common salt', 'Sodium hydroxide'], 'The acid reacts with NaHCO₃ to give CO₂.', 'The acid removes the bitter Na₂CO₃ taste and releases CO₂.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.ps.acid.crystal', title: 'Water of crystallisation', prereqs: ['ts10.ps.acid.salts'],
      intro: [
        h('Water hiding inside dry crystals'),
        photo('🔷', 'Blue copper sulphate crystals feel completely dry — yet more than a third of their mass is water!'),
        p('Heat some blue copper sulphate crystals in a dry test tube. Water droplets appear on the cooler upper walls, and the crystals turn into a white powder. Add a few drops of water to the white powder — it turns blue again and gets warm. The blue colour and the crystal shape need a fixed number of water molecules.'),
        def('Water of crystallisation', 'The fixed number of water molecules that are part of one formula unit of a salt crystal, e.g. the 5 H₂O in CuSO₄·5H₂O.'),
        def('Hydrated / anhydrous salt', 'A salt with its water of crystallisation is hydrated (CuSO₄·5H₂O, blue); after the water is driven off it is anhydrous (CuSO₄, white).'),
        p('Examples: CuSO₄·5H₂O (blue vitriol), Na₂CO₃·10H₂O (washing soda), CaSO₄·2H₂O (gypsum), FeSO₄·7H₂O (green vitriol). The dot does not mean multiplication here — it means "with".'),
        h('How much of the crystal is water?'),
        p('Molar mass of the hydrate = molar mass of the anhydrous salt + n × 18. For CuSO₄·5H₂O: 159.5 + 90 = 249.5 g/mol, so water is 90/249.5 ≈ 36% of the mass.'),
        f('% water = (18n ÷ (M + 18n)) × 100'),
        xp({
          title: 'What if? More water molecules in each crystal', formula: '% water = 18n / (M + 18n) × 100',
          res: ['W', 'Percentage of water by mass', '%', '1800 * n / (M + 18 * n)', 1],
          vars: [['n', 'Water molecules per formula unit', '', 1, 10, 1, 5], ['M', 'Molar mass of anhydrous salt', 'g/mol', 50, 300, 0.5, 159.5]],
          notes: [
            ['n', 'More water molecules per unit → a larger share of the mass is water, but it can never reach 100% (the salt is still there).', 'Fewer water molecules → the water share drops.'],
            ['M', 'A heavier salt part makes the water a smaller fraction of the total mass.', 'A lighter salt part makes the water a bigger fraction.'],
          ],
          mistakes: [['Dividing by M alone (18n/M)', 'The total mass of the hydrate is M + 18n, so that must be the denominator.'], ['Reading CuSO₄·5H₂O as CuSO₄ × 5H₂O', 'The dot means "combined with", not multiply; add the masses.']],
          real: 'Washing soda crystals lose water in dry air and crumble into powder (efflorescence) — that is the water fraction leaving.',
        }),
        keys('Hydrated crystals contain a fixed number of water molecules.', 'Heating removes it: blue CuSO₄·5H₂O → white CuSO₄.', 'Adding water back restores the colour — a test for water.', 'Molar mass of hydrate = M(salt) + 18n.'),
        remember('Anhydrous (white) copper sulphate turning blue is a test for the presence of water.'),
      ],
      examples: [
        ex('Find the percentage of water in washing soda, Na₂CO₃·10H₂O. (Na 23, C 12, O 16, H 1)', ['M(Na₂CO₃) = 46 + 12 + 48 = 106', 'Water = 10 × 18 = 180', 'Hydrate = 106 + 180 = 286', '% water = 180 ÷ 286 × 100 ≈ 62.9%'], '≈ 62.9%'),
        ex('Kavya heats 24.95 g of CuSO₄·5H₂O until white. What mass of water is lost?', ['M(hydrate) = 249.5 g/mol → 24.95 g = 0.1 mol', 'Each mole has 5 mol water = 90 g', 'Water lost = 0.1 × 90 = 9 g'], '9 g'),
      ],
      practice: [
        tp('percent', (r) => {
          const [nm, fm, M, n] = r.pick(HYDRATES);
          const pc = rd((1800 * n) / (M + 18 * n), 1);
          return numQ(`Find the percentage of water by mass in ${nm}, ${fm}. (Molar mass of the anhydrous salt = ${M} g/mol; H₂O = 18 g/mol)`, pc, undefined,
            [`Water mass = ${n} × 18 = ${18 * n} g per mole.`, `Total = ${M} + ${18 * n} = ${M + 18 * n} g; then divide and × 100.`],
            [`% water = ${18 * n} ÷ ${M + 18 * n} × 100`, `≈ ${pc}%`],
            [{ when: String(rd((1800 * n) / M, 1)), explain: 'Divide by the TOTAL mass of the hydrate (salt + water), not by the salt alone.' }], 0.01);
        }, 2),
        tp('lost', (r) => {
          const k = r.pick([0.1, 0.2, 0.5, 1, 2, 0.05, 0.4]);
          const [nm, fm, M, n] = r.pick(HYDRATES.slice(0, 5));
          const mass = rd(k * (M + 18 * n), 3);
          return numQ(`${who(r)} heats ${mass} g of ${nm} (${fm}, anhydrous part ${M} g/mol) until all the water of crystallisation is removed. What mass of water is lost?`, rd(k * 18 * n, 3), 'g',
            [`Molar mass of the hydrate = ${M} + ${18 * n} = ${M + 18 * n} g/mol.`, 'Find the moles of hydrate, then multiply by the water mass per mole.'],
            [`n = ${mass} ÷ ${M + 18 * n} = ${k} mol`, `Water lost = ${k} × ${18 * n} = ${rd(k * 18 * n, 3)} g`]);
        }, 3),
        mcq('concept', 'Hydrated = with water; anhydrous = without water.', [
          ['On heating, blue copper sulphate crystals become…', 'White', ['Green', 'Black', 'Colourless liquid'], 'Losing water changes the colour.', 'Anhydrous CuSO₄ is white.'],
          ['How many water molecules are in one formula unit of gypsum?', '2', ['5', '10', '½'], 'CaSO₄·2H₂O', 'Gypsum is CaSO₄·2H₂O.'],
          ['How many molecules of water of crystallisation does washing soda have?', '10', ['5', '2', '7'], 'Na₂CO₃·10H₂O', 'Washing soda is Na₂CO₃·10H₂O.'],
          ['White anhydrous CuSO₄ turns blue when…', 'Water is added', ['It is heated more', 'It is cooled', 'Acid is added'], 'Rehydration.', 'Adding water restores CuSO₄·5H₂O, which is blue.'],
          ['In CuSO₄·5H₂O the dot means…', 'Five water molecules are combined with each CuSO₄', ['Multiply CuSO₄ by 5H₂O', 'A decimal point', 'A charge'], 'It is not a multiplication sign.', 'The dot shows water attached in the crystal.'],
          ['Green vitriol is…', 'FeSO₄·7H₂O', ['CuSO₄·5H₂O', 'ZnSO₄·7H₂O', 'MgSO₄·7H₂O'], 'Ferrous = iron(II).', 'Green vitriol is ferrous sulphate heptahydrate.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 4 — Refraction of Light at Curved Surfaces
// =====================================================================================
const LENS_PAIRS: [number, number][] = [[30, 15], [20, 10], [60, 20], [12, 8], [40, 24], [36, 12], [30, 20], [45, 30], [24, 16], [50, 25], [15, 10], [75, 50]];
const LIQUIDS: [string, number][] = [['water', 1.33], ['kerosene', 1.44], ['glycerine', 1.47], ['turpentine oil', 1.47], ['coconut oil', 1.45]];

const ch4: USpec = {
  id: 'ts10.ps.ch4', subject: 'physics', title: 'Refraction of Light at Curved Surfaces', source: src(4),
  objectives: [
    {
      id: 'ts10.ps.lens.curved', title: 'Refraction at a single curved surface', prereqs: [],
      activities: ['lab:light'],
      intro: [
        h('Why a coin in a bucket looks closer'),
        photo('🪙', 'A coin at the bottom of a bucket of water appears raised. A fish in a round bowl looks bigger than it is. Both are refraction at a boundary.'),
        p('You already know light bends (refracts) when it goes from one medium into another because its speed changes. The refractive index n of a medium tells how much slower light is there: n = c/v. At a curved boundary — like the surface of a glass ball or a fish bowl — the normal is different at every point (it is the radius at that point), so different rays bend by different amounts and an image forms.'),
        def('Refractive index (n)', 'The ratio of the speed of light in vacuum to its speed in the medium, n = c/v. It has no unit. Water ≈ 1.33, glass ≈ 1.5, diamond ≈ 2.42.'),
        h('The curved-surface formula'),
        p('Let light go from a medium of index n₁ (where the object is) into a medium of index n₂, across a spherical surface of radius R. With the New Cartesian sign convention (distances from the pole of the surface; along the light positive):'),
        f('n₂/v − n₁/u = (n₂ − n₁)/R', 'n two over v minus n one over u equals n two minus n one over R'),
        p('R is positive if the centre of curvature is on the side the light goes into (a convex surface facing the object) and negative if it is on the object side.'),
        h('Special case: a flat surface (R = ∞)'),
        p('For a flat surface the right side becomes 0, so n₂/v = n₁/u. For an object in water seen from air (n₁ = n, n₂ = 1): v = u/n. The image is closer: apparent depth = real depth ÷ n. That is why a pond looks shallower than it is — a real danger for swimmers.'),
        f('Apparent depth = Real depth ÷ n'),
        xp({
          title: 'What if? Object in air in front of a convex glass surface', formula: 'n₂/v − 1/u = (n₂ − 1)/R,  u = −d',
          res: ['v', 'Image distance inside the glass', 'cm', 'n / ((n - 1) / R - 1 / d)', 1],
          vars: [['d', 'Object distance |u|', 'cm', 60, 150, 1, 100], ['R', 'Radius of the surface', 'cm', 5, 15, 0.5, 10], ['n', 'Refractive index of glass (n₂)', '', 1.3, 1.6, 0.01, 1.5]],
          notes: [
            ['d', 'Moving the object away brings the image closer to the surface (towards the focal point inside the glass).', 'Bringing the object closer pushes the image deeper into the glass.'],
            ['R', 'A flatter surface (larger R) bends rays less, so the image forms deeper inside.', 'A more curved surface bends rays more, so the image forms nearer the surface.'],
            ['n', 'A denser medium bends light more strongly, pulling the image closer.', 'A less dense medium bends less, so the image moves deeper.'],
          ],
          mistakes: [['Swapping n₁ and n₂', 'n₁ is the medium where the OBJECT is; n₂ is the medium light enters.'], ['Using R without a sign', 'Convex towards the object → R positive; concave towards the object → R negative.'], ['Forgetting u is negative', 'The object is against the direction of light, so u = −d.']],
          real: 'The lens of your eye and the cornea are curved refracting surfaces — the same formula explains how they form an image on the retina.',
        }),
        keys('Curved boundary: normal = radius → rays bend differently → image forms.', 'n₂/v − n₁/u = (n₂ − n₁)/R with sign convention.', 'Flat surface: apparent depth = real depth / n.', 'Objects under water look raised (closer).'),
        remember('In the curved-surface formula the indices go with the distances: n₂ with v (image side) and n₁ with u (object side).'),
      ],
      examples: [
        ex('A pond near Khammam is 2.66 m deep. How deep does it appear when seen from directly above? (n of water = 1.33)', ['Apparent depth = real depth ÷ n', '= 2.66 ÷ 1.33', '= 2 m'], 'It appears only 2 m deep'),
        ex('A small object is 100 cm in front of a convex glass surface (n = 1.5, R = 10 cm). Where is the image?', ['n₁ = 1, n₂ = 1.5, u = −100 cm, R = +10 cm', '1.5/v = (1.5 − 1)/10 + 1/(−100) = 0.05 − 0.01 = 0.04', 'v = 1.5 ÷ 0.04 = 37.5 cm'], 'v = +37.5 cm inside the glass (real image)'),
      ],
      practice: [
        tp('depth', (r) => {
          const [m, n] = r.pick(LIQUIDS);
          const app = r.pick([10, 15, 20, 30, 40, 50, 60]);
          const real = rd(app * n, 2);
          const ask = r.pick(['apparent', 'real'] as const);
          if (ask === 'real') return numQ(`A mark at the bottom of a tank of ${m} (n = ${n}) appears ${app} cm below the surface when seen from above. What is the real depth?`, real, 'cm',
            ['Apparent depth = real depth ÷ n', 'So real depth = apparent depth × n.'], [`Real = ${app} × ${n} = ${real} cm`],
            [{ when: `${rd(app / n, 2)} cm`, explain: 'The real depth is MORE than the apparent depth — multiply by n, do not divide.' }]);
          return numQ(`A coin lies at the bottom of a vessel filled with ${m} (n = ${n}) to a depth of ${real} cm. How deep does the coin appear when seen from above?`, app, 'cm',
            ['Objects under a denser medium appear raised.', 'Apparent depth = real depth ÷ n'], [`Apparent = ${real} ÷ ${n} = ${app} cm`],
            [{ when: `${rd(real * n, 2)} cm`, explain: 'The coin appears CLOSER, so the apparent depth must be smaller — divide by n.' }]);
        }),
        tp('surface', (r) => {
          const cases: [number, number, number][] = [[100, 10, 1.5], [60, 10, 1.5], [120, 12, 1.5], [80, 8, 1.4], [90, 6, 1.5], [150, 15, 1.6], [100, 5, 1.5], [75, 10, 1.6]];
          const [d, R, n] = r.pick(cases);
          const v = rd(n / ((n - 1) / R - 1 / d), 2);
          return numQ(`An object in air is ${d} cm in front of a convex spherical surface of glass (n = ${n}, R = ${R} cm). Find the image distance v inside the glass.`, v, 'cm',
            ['n₂/v − n₁/u = (n₂ − n₁)/R with n₁ = 1', `u = −${d} cm, R = +${R} cm`],
            [`${n}/v = (${n} − 1)/${R} − 1/${d}`, `${n}/v = ${rd((n - 1) / R - 1 / d, 4)}`, `v = ${v} cm`], [], 0.02);
        }, 3),
        mcq('concept', 'Think of the normal at each point and the speed of light in each medium.', [
          ['A fish in a round bowl appears larger because…', 'The curved water surface refracts light like a lens', ['Water magnifies by reflection', 'The fish swells in water', 'Glass is coloured'], 'The bowl surface is curved.', 'A curved refracting surface forms a magnified virtual image.'],
          ['A swimming pool appears shallower than it really is because…', 'Light bends away from the normal as it leaves water', ['Light bends towards the normal leaving water', 'Water reflects light', 'Light speeds up in water'], 'Water → air: rarer medium.', 'Rays bend away from the normal, so they seem to come from a higher point.'],
          ['At a curved refracting surface, the normal at any point is…', 'Along the radius through that point', ['Parallel to the principal axis', 'Along the surface', 'Through the focus'], 'Same idea as curved mirrors.', 'The radius meets the curved surface at 90°.'],
          ['Refractive index of a medium in which light travels at 2 × 10⁸ m/s?', '1.5', ['2', '0.67', '6'], 'n = c/v with c = 3 × 10⁸ m/s.', '3 × 10⁸ ÷ 2 × 10⁸ = 1.5.'],
          ['For a plane refracting surface, the term (n₂ − n₁)/R becomes…', 'Zero, because R is infinite', ['Infinite', 'n₂ − n₁', 'One'], 'A flat surface is part of an infinitely large sphere.', 'Dividing by an infinite R gives zero.'],
          ['In n₂/v − n₁/u = (n₂ − n₁)/R, n₁ is the refractive index of…', 'The medium where the object is', ['The medium where the image is', 'Always glass', 'Always air'], 'Light starts from the object.', 'n₁ belongs to the object side, n₂ to the side light enters.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.lens.rays', title: 'Lenses and their ray diagrams', prereqs: ['ts10.ps.lens.curved'],
      activities: ['lab:light'],
      intro: [
        h('Two curved surfaces make a lens'),
        photo('🔬', 'A microscope, a camera and your spectacles all use lenses — transparent pieces bounded by curved surfaces.'),
        p('A lens is a transparent material bounded by two surfaces, at least one of them curved. A lens thicker at the middle than at the edges is convex (converging); one thinner at the middle is concave (diverging).'),
        def('Convex (converging) lens', 'Thicker at the centre. Bends parallel rays to meet at a real focus. Types: biconvex, plano-convex, concavo-convex.'),
        def('Concave (diverging) lens', 'Thinner at the centre. Spreads parallel rays so they seem to come from a virtual focus. Types: biconcave, plano-concave, convexo-concave.'),
        def('Optical centre (P)', 'The central point of a lens; a ray through it goes straight without bending.'),
        def('Focal length (f)', 'Distance from the optical centre to the principal focus F. A lens has two foci, one on each side, at equal distance for a thin lens in air.'),
        h('Three rays to draw with'),
        p('1. A ray parallel to the axis → passes through F₂ on the other side (convex) or appears to come from F₁ on the same side (concave). 2. A ray through (or towards) F → emerges parallel. 3. A ray through the optical centre → goes straight on.'),
        h('Convex lens: images as the object comes closer'),
        p('At infinity → point image at F₂, real, inverted. Beyond 2F₁ → between F₂ and 2F₂, real, inverted, smaller (camera). At 2F₁ → at 2F₂, same size. Between F₁ and 2F₁ → beyond 2F₂, real, inverted, larger (projector). At F₁ → at infinity. Between F₁ and P → on the same side, virtual, erect, magnified (magnifying glass).'),
        p('Concave lens: whatever the object position, the image is virtual, erect, diminished, between F₁ and P on the same side as the object.'),
        keys('Convex lens converges; concave lens diverges.', 'Ray through the optical centre is undeviated.', 'Convex lens: real inverted images unless object is inside F (then magnifying glass).', 'Concave lens: always virtual, erect, diminished.'),
        remember('A magnifying glass is a convex lens with the object INSIDE its focal length.'),
        tip('A quick test: hold a lens over newsprint. Letters bigger → convex. Letters smaller → concave.'),
      ],
      examples: [
        ex('Joseph holds a convex lens of focal length 10 cm, 5 cm above an ant. What image does he see?', ['Object (5 cm) is between F and the optical centre.', 'Refracted rays diverge; extended back they meet behind the ant.'], 'Virtual, erect, magnified image on the same side as the ant'),
        ex('A camera lens forms an image of a distant temple in Warangal on the sensor. What kind of image?', ['The temple is far beyond 2F.', 'The image forms between F and 2F on the other side.'], 'Real, inverted, diminished'),
      ],
      practice: [
        mcq('convex', 'Locate the object relative to F₁ and 2F₁.', [
          ['Object beyond 2F₁ of a convex lens: image is…', 'Real, inverted, diminished, between F₂ and 2F₂', ['Virtual, erect, magnified', 'Real, inverted, same size', 'At infinity'], 'Like a camera.', 'Far objects give small real images just beyond F₂.'],
          ['Object at 2F₁ of a convex lens: image is…', 'Real, inverted, same size, at 2F₂', ['Virtual, erect, enlarged', 'Real, diminished at F₂', 'At infinity'], 'Symmetric position.', 'At 2F₁ the image is at 2F₂ and the same size.'],
          ['Object between F₁ and 2F₁ of a convex lens: image is…', 'Real, inverted, magnified, beyond 2F₂', ['Virtual, erect', 'Real, diminished', 'At F₂'], 'Like a projector.', 'The image is beyond 2F₂ and larger.'],
          ['Object between F₁ and the optical centre of a convex lens: image is…', 'Virtual, erect, magnified, same side as object', ['Real, inverted, magnified', 'Real, inverted, diminished', 'Virtual, erect, diminished'], 'Magnifying glass.', 'Rays diverge after the lens, giving a virtual enlarged image.'],
          ['A concave lens always forms an image that is…', 'Virtual, erect, diminished', ['Real, inverted, magnified', 'Real, erect, diminished', 'Virtual, inverted, magnified'], 'It only diverges light.', 'A concave lens can only form virtual, erect, smaller images of real objects.'],
          ['Object at F₁ of a convex lens: image is…', 'At infinity, highly magnified', ['At F₂', 'At 2F₂', 'Same side, diminished'], 'What happens to rays from F?', 'Rays from F emerge parallel, meeting at infinity.'],
        ], 2),
        mcq('rays', 'Use the three special rays.', [
          ['A ray passing through the optical centre of a thin lens…', 'Goes straight without deviation', ['Passes through F', 'Becomes parallel', 'Is reflected back'], 'The middle of a thin lens acts like a thin slab.', 'Through the optical centre there is no deviation.'],
          ['A ray parallel to the axis passes through a concave lens. It…', 'Spreads out as if coming from the focus on the incident side', ['Passes through F₂', 'Goes straight', 'Comes back'], 'Diverging lens.', 'It diverges and appears to come from F₁.'],
          ['Which lens is thicker in the middle than at the edges?', 'Convex lens', ['Concave lens', 'Plane glass slab', 'Prism'], 'Converging lens.', 'Convex lenses bulge in the middle.'],
          ['A lens that can form a real image on a screen is…', 'Convex', ['Concave', 'Either', 'Neither'], 'Real images need converging rays.', 'Only a converging lens can bring rays together to a real image.'],
          ['A ray passing through F₁ of a convex lens emerges…', 'Parallel to the principal axis', ['Through F₂', 'Straight on', 'Back through F₁'], 'Reverse of the parallel-ray rule.', 'Light paths are reversible.'],
        ]),
        matchT('match', 'device to the lens arrangement it uses', [
          ['Camera', 'Convex lens, object beyond 2F'], ['Projector', 'Convex lens, object between F and 2F'], ['Magnifying glass', 'Convex lens, object inside F'],
          ['Spectacles for short sight', 'Concave lens'], ['Burning paper with sunlight', 'Convex lens, image at F'],
        ], ['Magnifiers and projectors both enlarge — one gives a virtual image, one a real image.', 'A lens that spreads light helps short sight.']),
      ],
    },
    {
      id: 'ts10.ps.lens.formula', title: 'Lens formula and magnification', prereqs: ['ts10.ps.lens.rays'],
      activities: ['lab:light'],
      intro: [
        h('From diagrams to numbers'),
        photo('📖', 'Hold a convex lens above a page and move it up and down: the letters grow, flip and blur. The lens formula predicts every one of these positions.'),
        p('For a thin lens, distances are measured from the optical centre with the New Cartesian sign convention: object on the left, so u is negative; f is positive for a convex lens and negative for a concave lens; v positive means a real image on the far side; v negative means a virtual image on the object side.'),
        f('1/f = 1/v − 1/u', 'one over f equals one over v minus one over u'),
        f('m = h′/h = v/u', 'magnification equals v over u (no minus sign for lenses)'),
        p('Notice two differences from mirrors: the lens formula has a MINUS sign, and lens magnification has NO minus sign. For a real image from a convex lens, v is positive and u negative, so m is negative — inverted, as expected.'),
        xp({
          title: 'What if? Move the object in front of a convex lens', formula: '1/f = 1/v − 1/u   →   v = u·f / (u + f)',
          res: ['v', 'Image distance', 'cm', '(d * F) / (d - F)', 1],
          vars: [['d', 'Object distance |u| (u = −d)', 'cm', 22, 100, 1, 30], ['F', 'Focal length f', 'cm', 5, 20, 1, 10]],
          notes: [
            ['d', 'As the object moves away, the real image moves in towards F₂ and shrinks.', 'As the object comes towards F₁, the image rushes away to very large distances and grows huge.'],
            ['F', 'A weaker lens (longer f) forms the image farther away.', 'A stronger lens (shorter f) forms the image closer to the lens.'],
          ],
          mistakes: [['Using the mirror formula 1/f = 1/v + 1/u', 'For lenses it is 1/v − 1/u. Using + gives completely wrong positions.'], ['Taking f negative for a convex lens', 'Convex lens focus is on the far side (along the light) so f is positive.'], ['Using m = −v/u for a lens', 'Lenses use m = v/u; the minus sign belongs to mirrors.']],
          real: 'In a camera you "focus" by moving the lens: a nearby object needs a larger v, so the lens moves away from the sensor.',
        }),
        xp({
          title: 'What if? Magnification of a convex lens', formula: 'm = v/u = f / (f + u)',
          res: ['m', 'Magnification', '', '-F / (d - F)', 2],
          vars: [['d', 'Object distance |u|', 'cm', 22, 100, 1, 30], ['F', 'Focal length f', 'cm', 5, 20, 1, 10]],
          notes: [
            ['d', 'Farther object → smaller inverted image (|m| shrinks).', 'Closer object (towards F) → much larger inverted image.'],
            ['F', 'Longer focal length → larger image for the same object distance.', 'Shorter focal length → smaller image.'],
          ],
          mistakes: [['Reading m = −2 as "smaller"', 'The size is |m| = 2 (twice as big); the minus only means inverted.'], ['Giving m a unit', 'm is a ratio — no unit.']],
          real: 'A cinema projector puts the film just outside F so |m| is in the hundreds.',
        }),
        keys('Lens: 1/f = 1/v − 1/u; m = v/u.', 'Convex f +; concave f −; u always −.', 'v + → real (far side); v − → virtual (object side).', 'm − → inverted; m + → erect.'),
        remember('Mirror: 1/f = 1/v + 1/u, m = −v/u. Lens: 1/f = 1/v − 1/u, m = v/u. Write both at the top of your answer sheet.'),
      ],
      examples: [
        ex('A 2 cm tall object is 30 cm from a convex lens of focal length 20 cm. Find the image position, magnification and height.', ['u = −30, f = +20', '1/v = 1/f + 1/u = 1/20 − 1/30 = 1/60 → v = +60 cm', 'm = v/u = 60/(−30) = −2', 'h′ = −2 × 2 = −4 cm'], 'v = +60 cm, m = −2, image 4 cm tall, real and inverted'),
        ex('An object is 30 cm from a concave lens of focal length 15 cm. Find v and m.', ['u = −30, f = −15', '1/v = 1/f + 1/u = −1/15 − 1/30 = −3/30 = −1/10', 'v = −10 cm', 'm = v/u = (−10)/(−30) = +1/3'], 'v = −10 cm (virtual, same side), m = +0.33'),
      ],
      practice: [
        tp('v-convex', (r) => {
          const [d, F] = r.pick(LENS_PAIRS);
          const v = rd((d * F) / (d - F), 2);
          return numQ(`An object is ${d} cm from a convex lens of focal length ${F} cm. Find the image distance v (with sign).`, v, 'cm',
            [`u = −${d} cm, f = +${F} cm`, '1/v = 1/f + 1/u'],
            [`1/v = 1/${F} + 1/(−${d})`, `v = +${v} cm (real image on the other side)`],
            [{ when: `${-v} cm`, explain: 'For a convex lens with the object beyond F the image is real, on the far side: v is positive.' }]);
        }, 2),
        tp('v-concave', (r) => {
          const [d, F] = r.pick(LENS_PAIRS);
          const v = rd(-(d * F) / (d + F), 2);
          return numQ(`An object is ${d} cm from a concave lens of focal length ${F} cm. Find the image distance v (with sign).`, v, 'cm',
            [`u = −${d} cm, f = −${F} cm (concave)`, '1/v = 1/f + 1/u'],
            [`1/v = −1/${F} − 1/${d}`, `v = ${v} cm (virtual, same side as the object)`],
            [{ when: `${-v} cm`, explain: 'A concave lens always gives a virtual image on the object side, so v is negative.' }]);
        }, 2),
        tp('m', (r) => {
          const [d, F] = r.pick(LENS_PAIRS);
          const v = (d * F) / (d - F);
          const m = rd(-F / (d - F), 2);
          const hO = r.pick([1, 2, 3, 4, 5]);
          if (r.next() < 0.5) return numQ(`A convex lens forms an image at v = +${rd(v, 2)} cm of an object at u = −${d} cm. Find the magnification m.`, m, undefined,
            ['For lenses, m = v/u.', 'Keep the signs.'], [`m = ${rd(v, 2)} ÷ (−${d}) = ${m}`, 'Negative → real and inverted.'],
            [{ when: String(-m), explain: 'Sign: a real image from a convex lens is inverted, so m is negative. Lenses use m = v/u (no minus sign).' }], 0.02);
          return numQ(`A ${hO} cm tall object is ${d} cm from a convex lens of focal length ${F} cm. Find the image height (with sign).`, rd(m * hO, 2), 'cm',
            ['Find v from 1/v = 1/f + 1/u.', 'm = v/u, then h′ = m × h.'], [`v = ${rd(v, 2)} cm`, `m = ${m}`, `h′ = ${m} × ${hO} = ${rd(m * hO, 2)} cm`], [], 0.02);
        }, 3),
        mcq('signs', 'Lens formula has a minus; lens magnification has no minus.', [
          ['The lens formula is…', '1/f = 1/v − 1/u', ['1/f = 1/v + 1/u', 'f = v − u', 'f = uv/(u + v) for all cases'], 'It differs from the mirror formula.', 'For thin lenses 1/f = 1/v − 1/u.'],
          ['Magnification for a lens is…', 'm = v/u', ['m = −v/u', 'm = u/v', 'm = uv'], 'No minus sign.', 'For lenses m = h′/h = v/u.'],
          ['The focal length of a concave lens is taken as…', 'Negative', ['Positive', 'Zero', 'Equal to its radius'], 'Virtual focus on the object side.', 'The focus is on the incident side, so f < 0.'],
          ['A lens gives v = −20 cm. The image is…', 'Virtual, on the same side as the object', ['Real, on the other side', 'At the focus', 'Inverted'], 'Negative = left of the lens.', 'Negative v puts the image on the object side — virtual.'],
          ['A lens gives m = +3. The lens is…', 'Convex, used as a magnifier', ['Concave', 'Convex forming a real image', 'Any lens'], 'Erect and enlarged.', 'Only a convex lens with the object inside F gives an erect, magnified image.'],
          ['For a real image formed by a convex lens, m is…', 'Negative', ['Positive', 'Zero', 'Always 1'], 'Real images are inverted.', 'v > 0, u < 0, so v/u < 0.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.lens.maker', title: 'Lens maker\'s formula', prereqs: ['ts10.ps.lens.formula'],
      intro: [
        h('How does a factory decide the focal length?'),
        photo('👁️', 'An optician grinding a spectacle lens chooses the glass and the curvature of each surface to get exactly the power you need.'),
        p('The focal length of a lens depends on two things: the material (its refractive index) and the shapes of its two surfaces (their radii of curvature R₁ and R₂). The lens maker\'s formula connects them for a thin lens in air:'),
        f('1/f = (n − 1)(1/R₁ − 1/R₂)', 'one over f equals n minus one times one over R one minus one over R two'),
        p('Signs: R₁ is the first surface the light meets, R₂ the second. A surface whose centre of curvature lies on the far side (where light goes) has a positive radius. For a biconvex lens R₁ is positive and R₂ is negative, so 1/R₁ − 1/R₂ = 1/|R₁| + 1/|R₂|. For a plane surface R = ∞ and 1/R = 0.'),
        p('If the lens is placed in a medium (like water) of index n_m, replace n by n/n_m: 1/f = (n/n_m − 1)(1/R₁ − 1/R₂). A glass lens in water bends light less, so its focal length becomes longer. If the surrounding medium is denser than the lens (n_m > n), the factor turns negative — a convex lens then DIVERGES light. (An air bubble in water behaves like a diverging lens.)'),
        xp({
          title: 'What if? Design a biconvex lens', formula: '1/f = (n − 1)(1/R₁ + 1/R₂)   (biconvex: R₂ negative)',
          res: ['f', 'Focal length', 'cm', '1 / ((n - 1) * (1 / R1 + 1 / R2))', 1],
          vars: [['n', 'Refractive index of glass', '', 1.3, 2, 0.01, 1.5], ['R1', 'Radius of first surface |R₁|', 'cm', 5, 60, 1, 20], ['R2', 'Radius of second surface |R₂|', 'cm', 5, 60, 1, 20]],
          notes: [
            ['n', 'A higher refractive index bends light more, so the focal length gets shorter (a stronger lens) — that is why thin spectacles use high-index glass.', 'A lower index bends less: longer focal length.'],
            ['R1', 'A flatter surface (bigger radius) bends less, so f grows.', 'A more curved surface (smaller radius) bends more, so f shrinks.'],
            ['R2', 'Flattening the second surface also lengthens f.', 'Curving it more shortens f.'],
          ],
          mistakes: [['Using n instead of (n − 1)', 'If n were 1 (same as air), the lens would not bend light at all — so the factor must be (n − 1).'], ['Ignoring the sign of R₂ for a biconvex lens', '1/R₁ − 1/R₂ with R₂ negative becomes 1/R₁ + 1/R₂; using minus would wrongly cancel the two surfaces.'], ['Forgetting the medium', 'In water use (n/1.33 − 1), which is much smaller, so f becomes much longer.']],
          real: 'A biconvex lens with n = 1.5 and both radii 20 cm has f = 20 cm. Put it in water and its focal length becomes about 78 cm.',
        }),
        keys('f depends on material (n) and surface radii (R₁, R₂).', '1/f = (n − 1)(1/R₁ − 1/R₂) in air.', 'Biconvex, equal radii R: f = R / (2(n − 1)); for n = 1.5, f = R.', 'Plano-convex: f = R/(n − 1).', 'In a denser surrounding medium a convex lens can become diverging.'),
        remember('For a symmetric biconvex glass lens (n = 1.5) the focal length equals the radius of curvature — a quick check in exams.'),
      ],
      examples: [
        ex('A biconvex lens has R₁ = 20 cm and R₂ = 20 cm (magnitudes) and n = 1.5. Find f.', ['R₁ = +20, R₂ = −20', '1/f = 0.5 × (1/20 + 1/20) = 0.5 × 0.1 = 0.05', 'f = 20 cm'], 'f = +20 cm'),
        ex('A plano-convex lens (n = 1.6) has its curved surface of radius 30 cm. Find f.', ['R₁ = +30, R₂ = ∞ → 1/R₂ = 0', '1/f = 0.6 × 1/30 = 0.02', 'f = 50 cm'], 'f = 50 cm'),
        ex('The lens of the first example (n = 1.5) is put in water (n = 1.33). Find the new focal length.', ['Relative index = 1.5 ÷ 1.33 ≈ 1.128', '1/f = 0.128 × 0.1 = 0.0128', 'f ≈ 78 cm'], 'About 78 cm — much longer'),
      ],
      practice: [
        tp('biconvex', (r) => {
          const n = r.pick([1.5, 1.6, 1.4, 1.5, 1.75]);
          const R1 = r.pick([10, 12, 15, 20, 24, 30, 40]);
          const R2 = r.pick([10, 15, 20, 30, 40, 60]);
          const fl = rd(1 / ((n - 1) * (1 / R1 + 1 / R2)), 2);
          return numQ(`A biconvex lens is made of glass with n = ${n}. Its surfaces have radii ${R1} cm and ${R2} cm. Find its focal length.`, fl, 'cm',
            ['1/f = (n − 1)(1/R₁ − 1/R₂)', `Biconvex: R₁ = +${R1}, R₂ = −${R2}, so the bracket is 1/${R1} + 1/${R2}.`],
            [`1/f = ${rd(n - 1, 2)} × (1/${R1} + 1/${R2}) = ${rd((n - 1) * (1 / R1 + 1 / R2), 4)}`, `f = ${fl} cm`],
            [{ when: `${rd(1 / (n * (1 / R1 + 1 / R2)), 2)} cm`, explain: 'Use (n − 1), not n. A lens with n = 1 would not bend light.' }], 0.02);
        }, 2),
        tp('plano', (r) => {
          const n = r.pick([1.5, 1.6, 1.4, 1.25]);
          const R = r.pick([10, 15, 20, 25, 30, 40]);
          const fl = rd(R / (n - 1), 2);
          return numQ(`A plano-convex lens (n = ${n}) has a curved surface of radius ${R} cm. Find its focal length.`, fl, 'cm',
            ['The flat side has R = ∞, so 1/R = 0.', '1/f = (n − 1)/R'], [`1/f = ${rd(n - 1, 2)}/${R}`, `f = ${fl} cm`], [], 0.02);
        }, 2),
        mcq('concept', 'Remember: f depends on (n − 1) and on how curved the surfaces are.', [
          ['If a lens is made of glass with a higher refractive index (same shape), its focal length…', 'Decreases', ['Increases', 'Stays the same', 'Becomes negative'], '(n − 1) gets bigger.', 'A larger (n − 1) makes 1/f larger, so f smaller.'],
          ['A convex glass lens is dipped in water. Its focal length…', 'Increases', ['Decreases', 'Stays the same', 'Becomes zero'], 'Relative index n/n_m is closer to 1.', 'The lens bends light less in water, so f becomes longer.'],
          ['An air bubble inside water behaves like a…', 'Diverging lens', ['Converging lens', 'Plane mirror', 'Prism'], 'Here the lens (air) is rarer than its surroundings.', 'n/n_m < 1 makes the factor negative, so a convex-shaped bubble diverges light.'],
          ['For a plane surface, the radius of curvature is…', 'Infinite', ['Zero', 'Equal to f', '1 m'], 'A flat surface is part of a huge sphere.', 'R = ∞, so 1/R = 0.'],
          ['A biconvex lens with n = 1.5 and both radii 30 cm has focal length…', '30 cm', ['15 cm', '60 cm', '45 cm'], 'f = R/(2(n − 1)).', '30 / (2 × 0.5) = 30 cm.'],
          ['If a lens is placed in a liquid of the SAME refractive index, it…', 'Becomes invisible and does not bend light', ['Becomes stronger', 'Becomes a mirror', 'Doubles its power'], 'n/n_m = 1.', 'With (n/n_m − 1) = 0, 1/f = 0: f is infinite — no bending.'],
        ], 2),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 5 — Human Eye and Colourful World
// =====================================================================================
const ch5: USpec = {
  id: 'ts10.ps.ch5', subject: 'physics', title: 'Human Eye and Colourful World', source: src(5),
  objectives: [
    {
      id: 'ts10.ps.eye.structure', title: 'Structure of the eye, accommodation and least distance of distinct vision', prereqs: [],
      intro: [
        h('A living camera that focuses itself'),
        photo('👁️', 'Your eye can look at a far-off hill and then read a book in your hand within a second, without any part moving forwards or backwards.'),
        p('Try this: hold a book very close to your eyes and slowly move it away. At first the letters are blurred; at about 25 cm they become sharp and comfortable. The minimum distance at which a normal eye sees an object clearly without strain is called the least distance of distinct vision.'),
        def('Least distance of distinct vision (near point)', 'About 25 cm for a normal adult eye. Objects closer than this look blurred.'),
        def('Far point', 'The farthest point the eye can see clearly — at infinity for a normal eye.'),
        def('Angle of vision', 'The maximum angle at which we can see the whole of an object; for a normal eye it is about 60°. Stand too close to a tall object and you cannot see all of it at once.'),
        h('Parts and their jobs'),
        p('Cornea — the clear front bulge; most of the bending of light happens here. Iris — the coloured ring that controls the size of the pupil. Pupil — the hole that lets light in; it gets smaller in bright light and wider in dim light. Eye lens — a soft, transparent convex lens. Ciliary muscles — hold the lens and change its shape. Retina — the light-sensitive screen at the back, with rods (dim light) and cones (colour). Optic nerve — carries signals to the brain.'),
        h('Accommodation — changing focal length'),
        p('The distance from the eye lens to the retina is fixed (about 2.5 cm). So to keep images sharp for both near and far objects, the eye changes the FOCAL LENGTH of the lens. For a distant object the ciliary muscles relax, the lens becomes thinner, and f is largest (about 2.5 cm). For a near object the muscles contract, the lens becomes thicker, and f gets shorter (about 2.27 cm at 25 cm).'),
        def('Accommodation', 'The ability of the eye lens to change its focal length so that objects at different distances form sharp images on the retina.'),
        p('The image on the retina is real and inverted; the brain turns it the right way up. An image stays on the retina for about 1/16 of a second (persistence of vision), which is why a film made of still pictures looks like smooth motion.'),
        keys('Normal eye: near point 25 cm, far point infinity.', 'Image on retina: real, inverted.', 'Accommodation = changing focal length by ciliary muscles.', 'Pupil size controlled by the iris.'),
        remember('In the eye, the image distance is fixed and the focal length changes. In a camera the focal length is fixed and the lens–sensor distance changes.'),
      ],
      examples: [
        ex('Find the focal length of the eye lens when a normal eye looks at a book 25 cm away (lens–retina distance 2.5 cm).', ['u = −25 cm, v = +2.5 cm', '1/f = 1/v − 1/u = 1/2.5 + 1/25 = 0.4 + 0.04 = 0.44', 'f = 1/0.44 ≈ 2.27 cm'], 'f ≈ 2.27 cm'),
        ex('Arjun walks from bright sunlight into a dark cinema hall in Hyderabad. Why can\'t he see for a while?', ['In bright light the pupil was small.', 'The iris needs some time to widen the pupil to let in more light.'], 'The pupil takes time to enlarge'),
      ],
      practice: [
        matchT('parts', 'part of the eye to its job', [
          ['Cornea', 'Does most of the bending of light'], ['Iris', 'Controls the size of the pupil'], ['Pupil', 'Opening that lets light in'],
          ['Ciliary muscles', 'Change the shape of the lens'], ['Retina', 'Light-sensitive screen'], ['Optic nerve', 'Carries signals to the brain'],
        ], ['The coloured part and the hole are different parts.', 'The screen is at the back; the nerve takes messages away.']),
        mcq('facts', 'Remember the numbers 25 cm, infinity, 60° and 2.5 cm.', [
          ['The least distance of distinct vision for a normal eye is about…', '25 cm', ['2.5 cm', '1 m', '10 cm'], 'Reading distance.', 'A normal eye sees most clearly without strain at about 25 cm.'],
          ['The far point of a normal eye is at…', 'Infinity', ['25 cm', '1 m', '100 m'], 'We can see distant stars clearly.', 'A relaxed normal eye focuses objects at infinity.'],
          ['When we look at a distant object, the ciliary muscles…', 'Relax and the lens becomes thinner', ['Contract and the lens becomes thicker', 'Do nothing', 'Move the lens back'], 'Distant object → longest focal length.', 'Relaxed muscles flatten the lens, giving maximum focal length.'],
          ['The image formed on the retina is…', 'Real and inverted', ['Virtual and erect', 'Real and erect', 'Virtual and inverted'], 'A convex lens with a distant object.', 'The eye lens forms a real, inverted image; the brain corrects it.'],
          ['The angle of vision of a normal eye is about…', '60°', ['180°', '30°', '90°'], 'It limits how much we see at once.', 'About 60° — the whole object must fit within this angle.'],
          ['The ability of the eye to adjust its focal length is called…', 'Accommodation', ['Persistence of vision', 'Dispersion', 'Refraction'], 'It accommodates near and far objects.', 'Accommodation lets the eye focus at different distances.'],
        ]),
        tp('eye-f', (r) => {
          const d = r.pick([25, 50, 100, 30, 40, 75, 200]);
          const fl = rd(1 / (1 / 2.5 + 1 / d), 2);
          return numQ(`The distance between the eye lens and retina is 2.5 cm. What focal length must the eye lens have to see an object ${d} cm away clearly?`, fl, 'cm',
            ['u = −' + d + ' cm, v = +2.5 cm (retina).', '1/f = 1/v − 1/u'], [`1/f = 1/2.5 + 1/${d}`, `f ≈ ${fl} cm`],
            [{ when: '2.5 cm', explain: 'f = 2.5 cm only works for very distant objects. A nearer object needs a shorter focal length.' }], 0.01);
        }, 3),
      ],
    },
    {
      id: 'ts10.ps.eye.defects', title: 'Defects of vision and their correction', prereqs: ['ts10.ps.eye.structure', 'ts10.ps.lens.formula'],
      intro: [
        h('When the image misses the retina'),
        photo('🧑‍🏫', 'A student who can read her notebook but not the blackboard may need spectacles — one of the most common vision problems in schools.'),
        p('A healthy eye places images exactly on the retina. If the eyeball is a little too long or short, or the lens cannot change shape enough, the image falls in front of or behind the retina and looks blurred. We correct this with spectacle lenses, whose strength is measured as power.'),
        def('Power of a lens (P)', 'The reciprocal of the focal length in metres. Unit: dioptre (D). Convex lenses have positive power; concave lenses negative power.'),
        f('P = 1/f   (f in metres)  →  P = 100/f (f in cm)', 'power equals one over focal length in metres'),
        h('Myopia (short-sightedness)'),
        p('The person sees near objects clearly but not far ones. The far point is closer than infinity (say D metres). Cause: eyeball too long or eye lens too strongly curved. The image of a distant object forms IN FRONT of the retina. Correction: a concave lens of focal length equal to the far-point distance (f = −D) — it makes parallel rays appear to come from the far point.'),
        h('Hypermetropia (long-sightedness)'),
        p('The person sees far objects clearly but not near ones. The near point is farther than 25 cm (say d). Cause: eyeball too short or lens too weak. The image forms BEHIND the retina. Correction: a convex lens that takes an object at 25 cm and forms a virtual image at the person\'s near point d: with u = −25 cm and v = −d, the lens formula gives f = 25d/(d − 25).'),
        h('Presbyopia'),
        p('With age the ciliary muscles weaken and the lens stiffens, so the near point moves away. Many people over 40 need reading glasses; some need bifocal lenses (concave on top for distance, convex below for reading).'),
        xp({
          title: 'What if? Spectacle power for a myopic eye', formula: 'f = −(far point),  P = 100 / f',
          res: ['P', 'Power of the concave lens needed', 'D', '-100 / D', 2],
          vars: [['D', 'Far point of the eye', 'cm', 40, 500, 10, 100]],
          notes: [['D', 'A farther far point means milder myopia, so a weaker (less negative) lens is enough.', 'A closer far point means stronger myopia: the lens must be more strongly diverging (more negative power).']],
          mistakes: [['Using a convex lens for myopia', 'The eye already converges too strongly; we need a DIVERGING (concave) lens to cancel the extra bending.'], ['Forgetting to convert cm to m', 'P = 1/f needs metres. f = −50 cm = −0.5 m gives −2 D, not −0.02 D.']],
          real: 'A prescription of −2.0 D means the far point is at 50 cm.',
        }),
        xp({
          title: 'What if? Reading glasses for a hypermetropic eye', formula: 'P = 100/25 − 100/d  (d = near point in cm)',
          res: ['P', 'Power of the convex lens needed', 'D', '4 - 100 / d', 2],
          vars: [['d', 'Near point of the eye', 'cm', 30, 300, 5, 50]],
          notes: [['d', 'The farther the near point, the stronger the convex lens needed (power approaches +4 D).', 'A near point close to 25 cm needs only a weak lens.']],
          mistakes: [['Using f = d', 'The lens must make an object at 25 cm appear at d; use the lens formula with u = −25 cm and v = −d.'], ['Giving a negative power', 'Hypermetropia is corrected by a converging lens, so P is positive.']],
          real: 'If your near point is 50 cm you need about +2 D reading glasses.',
        }),
        keys('P = 1/f (m), unit dioptre; convex +, concave −.', 'Myopia: image in front of retina → concave lens, f = −far point.', 'Hypermetropia: image behind retina → convex lens, f = 25d/(d − 25).', 'Presbyopia: age-related; bifocals may be needed.'),
        remember('Myopia → Minus (concave) lens. Hypermetropia → plus (convex) lens.'),
      ],
      examples: [
        ex('Meena\'s far point is 2 m. What lens does she need?', ['f = −far point = −2 m (concave)', 'P = 1/f = 1/(−2) = −0.5 D'], 'Concave lens, P = −0.5 D'),
        ex('Grandfather in Siddipet has a near point of 100 cm. Find the power of the reading glasses he needs.', ['u = −25 cm, v = −100 cm', '1/f = 1/v − 1/u = −1/100 + 1/25 = 3/100', 'f = 33.3 cm = 0.333 m', 'P = 1/0.333 = +3 D'], 'Convex lens, P = +3 D'),
      ],
      practice: [
        tp('power', (r) => {
          const fcm = r.pick([10, 20, 25, 40, 50, 80, 100, 200, 125]) * r.pick([1, -1]);
          const P = rd(100 / fcm, 2);
          return numQ(`Find the power (in dioptres) of a ${fcm > 0 ? 'convex' : 'concave'} lens of focal length ${Math.abs(fcm)} cm. Give the sign.`, P, undefined,
            ['Convert the focal length to metres.', `f = ${fcm / 100} m (${fcm > 0 ? 'positive for convex' : 'negative for concave'}); P = 1/f`],
            [`f = ${fcm / 100} m`, `P = 1 ÷ (${fcm / 100}) = ${sgnd(P)} D`],
            [{ when: String(rd(1 / fcm, 4)), explain: 'Convert cm to m first (divide by 100).' }, { when: String(-P), explain: fcm > 0 ? 'A convex lens has positive power.' : 'A concave lens has negative power.' }]);
        }),
        tp('myopia', (r) => {
          const fp = r.pick([50, 80, 100, 125, 200, 250, 40]);
          return numQ(`${who(r)} cannot see objects beyond ${fp} cm clearly. Find the power of the lens needed (with sign).`, rd(-100 / fp, 2), undefined,
            ['This is myopia — a concave lens is needed.', `f = −(far point) = −${fp} cm = −${fp / 100} m`],
            [`f = −${fp / 100} m`, `P = 1/f = ${rd(-100 / fp, 2)} D (concave)`],
            [{ when: String(rd(100 / fp, 2)), explain: 'Myopia is corrected by a CONCAVE lens, so the power is negative.' }]);
        }, 2),
        tp('hyper', (r) => {
          const d = r.pick([50, 75, 100, 125, 150, 200]);
          const P = rd(4 - 100 / d, 2);
          return numQ(`The near point of a person's eye is ${d} cm. What is the power of the lens needed to read at 25 cm (with sign)?`, P, undefined,
            ['Hypermetropia — convex lens.', `u = −25 cm, v = −${d} cm; 1/f = 1/v − 1/u`, 'Convert f to metres, then P = 1/f.'],
            [`1/f = −1/${d} + 1/25 = ${rd(1 / 25 - 1 / d, 4)} per cm`, `f = ${rd(1 / (1 / 25 - 1 / d), 2)} cm`, `P = 100/f = +${P} D`], [], 0.02);
        }, 3),
        mcq('defects', 'Where does the image fall — in front of or behind the retina?', [
          ['In myopia the image of a distant object forms…', 'In front of the retina', ['Behind the retina', 'On the retina', 'On the cornea'], 'The eye converges too much.', 'Too-strong focusing puts the image in front of the retina.'],
          ['Hypermetropia is corrected using a…', 'Convex lens', ['Concave lens', 'Plane glass', 'Cylindrical mirror'], 'Image falls behind the retina.', 'A converging lens adds the extra bending needed.'],
          ['A lens of power −2.5 D is…', 'Concave with f = −40 cm', ['Convex with f = 40 cm', 'Concave with f = −2.5 cm', 'Convex with f = 2.5 m'], 'f = 1/P in metres.', 'f = 1/(−2.5) = −0.4 m = −40 cm.'],
          ['Presbyopia is mainly caused by…', 'Weakening of ciliary muscles with age', ['A too-long eyeball', 'Dust in the eye', 'Damage to the optic nerve'], 'It is common after 40.', 'The lens loses flexibility and the muscles weaken with age.'],
          ['A bifocal lens has…', 'A concave upper part and a convex lower part', ['Two concave parts', 'Two convex parts', 'A mirror and a lens'], 'Top for distance, bottom for reading.', 'Concave for distant vision; convex for near vision.'],
          ['The SI unit of power of a lens is…', 'Dioptre', ['Watt', 'Metre', 'Joule'], 'It is 1/metre.', 'Lens power is measured in dioptres (m⁻¹).'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.eye.prism', title: 'Refraction through a prism and dispersion', prereqs: ['ts10.ps.lens.curved'],
      intro: [
        h('White light hides a rainbow'),
        photo('🌈', 'A rainbow appears when sunlight passes through raindrops — each drop acts like a tiny prism.'),
        p('A prism is a transparent block with two plane refracting faces inclined at an angle A, called the angle of the prism. A ray entering one face bends towards the base, and bends again when it leaves the other face. The total turning of the ray from its original direction is the angle of deviation (d).'),
        def('Angle of deviation (d)', 'The angle between the incident ray (extended) and the emergent ray.'),
        p('If you vary the angle of incidence i, the deviation first decreases, reaches a minimum value D, then increases again. At minimum deviation the ray passes symmetrically through the prism (i = e). This gives a neat way to measure the refractive index:'),
        f('n = sin((A + D)/2) / sin(A/2)', 'n equals sine of A plus D by two over sine of A by two'),
        xp({
          title: 'What if? Refractive index from a prism experiment', formula: 'n = sin((A + D)/2) / sin(A/2)',
          res: ['n', 'Refractive index of the prism', '', 'sin((A + D) / 2) / sin(A / 2)', 3],
          vars: [['A', 'Angle of the prism', '°', 30, 70, 1, 60], ['D', 'Angle of minimum deviation', '°', 15, 50, 0.5, 30]],
          notes: [
            ['A', 'For the same minimum deviation, a larger prism angle means the glass is bending light less — lower n.', 'A smaller prism angle producing the same deviation means a more strongly bending (higher n) material.'],
            ['D', 'A larger minimum deviation means the material bends light more — higher refractive index (violet light has a larger D than red).', 'A smaller D means a less dense material.'],
          ],
          mistakes: [['Using sin(A + D) / sin A', 'Both angles must be halved: (A + D)/2 and A/2.'], ['Using any deviation, not the minimum', 'The formula is only true at MINIMUM deviation, when the ray passes symmetrically.']],
          real: 'For A = 60° and D = 30°, n = sin 45° / sin 30° ≈ 1.41.',
        }),
        h('Dispersion — splitting white light'),
        p('Newton passed sunlight through a prism and saw a band of colours, VIBGYOR: violet, indigo, blue, green, yellow, orange, red. White light is a mixture of colours. Each colour has a different wavelength (red is longest, about 700 nm; violet shortest, about 400 nm), and glass has a slightly different refractive index for each. Violet slows down most and bends most; red bends least. When a second, inverted prism is placed after the first, the colours recombine into white light.'),
        def('Dispersion', 'The splitting of white light into its component colours because the refractive index depends on wavelength.'),
        p('A rainbow forms when sunlight enters raindrops: it refracts and disperses on entering, reflects inside the drop, and refracts again on leaving. You see a rainbow only with the Sun behind you, usually after a shower in the morning or late afternoon.'),
        keys('Prism: light bends towards the base.', 'At minimum deviation: n = sin((A + D)/2)/sin(A/2).', 'Dispersion: violet bends most, red least (VIBGYOR).', 'Rainbow: refraction + dispersion + internal reflection in raindrops.'),
        remember('Frequency of light does not change when it enters glass; its speed and wavelength do.'),
      ],
      examples: [
        ex('A prism of angle 60° gives a minimum deviation of 30°. Find n.', ['n = sin((60 + 30)/2) / sin(60/2)', '= sin 45° / sin 30°', '= 0.707 / 0.5 ≈ 1.414'], 'n ≈ 1.41'),
        ex('Why does violet light deviate more than red light in a prism?', ['The refractive index of glass is greater for violet light.', 'Violet light travels slower in glass.', 'So violet bends more at each face.'], 'Glass has a larger n for violet (shorter wavelength)'),
      ],
      practice: [
        tp('n', (r) => {
          const A = r.pick([60, 60, 45, 50, 40]);
          const D = r.pick([30, 36, 38, 40, 24, 28, 32]);
          const n = rd(Math.sin(((A + D) / 2) * Math.PI / 180) / Math.sin((A / 2) * Math.PI / 180), 3);
          return numQ(`A prism has an angle of ${A}°. Its angle of minimum deviation is ${D}°. Find the refractive index (to 2 decimal places). sin ${(A + D) / 2}° = ${rd(Math.sin(((A + D) / 2) * Math.PI / 180), 4)}, sin ${A / 2}° = ${rd(Math.sin((A / 2) * Math.PI / 180), 4)}`, n, undefined,
            ['n = sin((A + D)/2) / sin(A/2)', `(A + D)/2 = ${(A + D) / 2}°, A/2 = ${A / 2}°`],
            [`n = sin ${(A + D) / 2}° ÷ sin ${A / 2}°`, `n ≈ ${n}`], [], 0.01);
        }, 3),
        mcq('dispersion', 'Shorter wavelength → larger n → more bending.', [
          ['Which colour deviates the most in a prism?', 'Violet', ['Red', 'Yellow', 'Green'], 'Shortest wavelength.', 'Violet has the highest refractive index in glass.'],
          ['Which colour deviates the least?', 'Red', ['Violet', 'Blue', 'Indigo'], 'Longest wavelength.', 'Red has the smallest refractive index, so it bends least.'],
          ['Dispersion happens because…', 'The refractive index is different for different colours', ['The prism colours the light', 'Light reflects inside the prism', 'Air absorbs some colours'], 'Each colour travels at a different speed in glass.', 'Different speeds → different bending → colours separate.'],
          ['To see a rainbow, the Sun should be…', 'Behind you', ['In front of you', 'Overhead at noon', 'Below the horizon'], 'Light goes into the drops and comes back towards you.', 'Rainbows are seen with the Sun behind the observer.'],
          ['A second prism placed upside down after the first…', 'Recombines the colours into white light', ['Makes the band wider', 'Absorbs the colours', 'Turns everything red'], 'Newton\'s experiment.', 'The inverted prism reverses the dispersion.'],
          ['When light passes from air into glass, which does NOT change?', 'Frequency', ['Speed', 'Wavelength', 'Direction (for oblique rays)'], 'The source decides it.', 'Frequency stays the same; speed and wavelength reduce.'],
        ]),
        orderT('vibgyor', 'Arrange the colours of the spectrum from the LEAST deviated to the MOST deviated.', ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'],
          ['Least deviated has the longest wavelength.', 'Read VIBGYOR backwards.'], 'Red bends least and violet most: ROYGBIV.'),
      ],
    },
    {
      id: 'ts10.ps.eye.scatter', title: 'Scattering of light: blue sky and red sunsets', prereqs: ['ts10.ps.eye.prism'],
      intro: [
        h('Why is the sky blue and the sunset red?'),
        photo('🌅', 'At sunrise and sunset the Sun looks orange-red; at noon it looks white and the sky is blue.'),
        p('When light hits very small particles — molecules of air (N₂, O₂), tiny dust or water droplets — it is sent off in all directions. This is scattering. The amount of scattering depends on the size of the particle compared with the wavelength.'),
        def('Scattering', 'The process in which particles absorb light and re-emit it in different directions.'),
        p('Very small particles (air molecules) scatter short wavelengths far more than long ones. The scattered intensity varies roughly as 1/λ⁴, so blue light (about 450 nm) is scattered several times more strongly than red light (about 700 nm). Larger particles (dust, water droplets in clouds) scatter all colours nearly equally — so clouds look white.'),
        f('Scattering ∝ 1 / λ⁴', 'scattering is proportional to one over wavelength to the fourth power'),
        xp({
          title: 'What if? How strongly does air scatter each colour?', formula: 'scattering relative to red = (700 / λ)⁴',
          res: ['S', 'Scattering compared with red light', '×', '(700 / λ) ^ 4', 2],
          vars: [['λ', 'Wavelength of the light', 'nm', 400, 700, 10, 450]],
          notes: [['λ', 'Longer wavelengths (towards red) are scattered much less — so red light passes straight through thick air.', 'Shorter wavelengths (towards blue/violet) are scattered far more — so blue fills the sky.']],
          mistakes: [['Thinking scattering is proportional to 1/λ', 'It is 1/λ⁴, so halving λ makes scattering 16 times stronger, not 2 times.'], ['Saying the sky is violet because violet scatters most', 'Sunlight has less violet, and our eyes are more sensitive to blue — so we see blue.']],
          real: 'Blue light (450 nm) is scattered about 5.9 times more than red light (700 nm).',
        }),
        h('Everyday effects'),
        p('Blue sky: air molecules scatter blue sunlight in all directions, so light coming from every part of the sky is blue. Astronauts above the atmosphere see a black sky. Red sunrise and sunset: near the horizon sunlight travels through much more air; most blue is scattered away, and mainly red and orange reach us. Danger signals are red because red light is scattered least and can be seen from far in fog. White clouds: water droplets are large and scatter all colours equally.'),
        keys('Small particles scatter short wavelengths (blue) most: ∝ 1/λ⁴.', 'Large particles scatter all colours equally → white clouds.', 'Long path through air at sunset → blue removed → red Sun.', 'No atmosphere → no scattering → black sky.'),
        remember('Sky blue = scattering by air molecules. Sunset red = blue scattered away along the long path. Do not say "reflection".'),
      ],
      examples: [
        ex('How many times more is blue light of 420 nm scattered than red light of 700 nm?', ['Ratio = (700/420)⁴', '700/420 ≈ 1.667', '1.667⁴ ≈ 7.7'], 'About 7.7 times'),
        ex('Why do traffic lights and danger boards near the Srisailam ghat road use red?', ['Red has the longest wavelength in visible light.', 'It is scattered least by fog and dust.', 'So it travels farthest and is seen early.'], 'Red is scattered least, so it is visible from far'),
      ],
      practice: [
        mcq('why', 'Decide: small particles (blue scattered) or large particles (all colours)?', [
          ['The sky appears blue because…', 'Air molecules scatter blue light more than red', ['The sea reflects blue', 'Ozone is blue', 'The Sun gives only blue light'], 'Scattering ∝ 1/λ⁴.', 'Short wavelengths scatter far more from tiny molecules.'],
          ['The Sun looks reddish at sunrise because…', 'Light travels through more air and blue is scattered away', ['The Sun is cooler in the morning', 'Red is reflected by clouds', 'Dispersion by the atmosphere'], 'Longer path near the horizon.', 'Over the long path most blue is removed, leaving red-orange.'],
          ['Clouds appear white because…', 'Large water droplets scatter all colours almost equally', ['Clouds are made of white powder', 'They reflect only white light', 'They absorb blue'], 'Big particles.', 'Particles larger than the wavelength scatter every colour, which adds up to white.'],
          ['To an astronaut in space, the sky appears…', 'Black', ['Blue', 'Red', 'White'], 'No air to scatter light.', 'Without an atmosphere there is no scattering.'],
          ['Danger signals are red because red light…', 'Is scattered the least', ['Is scattered the most', 'Has the shortest wavelength', 'Is the brightest colour'], 'Longest wavelength.', 'Least scattering means it travels farthest through fog.'],
          ['Scattering by tiny particles is proportional to…', '1/λ⁴', ['λ⁴', '1/λ', 'λ'], 'Very strong dependence.', 'Rayleigh scattering varies as the inverse fourth power of wavelength.'],
        ]),
        tp('ratio', (r) => {
          const l1 = r.pick([400, 420, 450, 480, 500, 350]);
          const l2 = r.pick([600, 650, 700, 800]);
          const ratio = rd((l2 / l1) ** 4, 2);
          return numQ(`Using scattering ∝ 1/λ⁴, how many times more strongly is light of ${l1} nm scattered than light of ${l2} nm? (2 decimal places)`, ratio, undefined,
            ['The shorter wavelength scatters more.', `Ratio = (${l2}/${l1})⁴`], [`${l2}/${l1} = ${rd(l2 / l1, 4)}`, `Ratio = ${rd(l2 / l1, 4)}⁴ ≈ ${ratio}`],
            [{ when: String(rd(l2 / l1, 2)), explain: 'Remember the fourth power: scattering ∝ 1/λ⁴, not 1/λ.' }], 0.02);
        }, 2),
        tapT('tap', 'Tap every effect that is explained by scattering of light.', [
          ['Blue colour of the sky', true], ['Reddish Sun at sunset', true], ['White colour of clouds', true], ['Black sky seen from the Moon', true],
          ['Rainbow after rain', false], ['A pencil looking bent in water', false], ['Image in a shaving mirror', false],
        ], ['Rainbows involve dispersion and internal reflection.', 'A bent pencil is refraction; a mirror image is reflection.'], 'Scattering explains the sky\'s colour, red sunsets, white clouds and the black sky in space.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 6 — Structure of Atom
// =====================================================================================
const SUBSHELLS: [string, number][] = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6]];
const ELEMENTS: [string, string][] = [
  ['H', 'Hydrogen'], ['He', 'Helium'], ['Li', 'Lithium'], ['Be', 'Beryllium'], ['B', 'Boron'], ['C', 'Carbon'], ['N', 'Nitrogen'], ['O', 'Oxygen'], ['F', 'Fluorine'], ['Ne', 'Neon'],
  ['Na', 'Sodium'], ['Mg', 'Magnesium'], ['Al', 'Aluminium'], ['Si', 'Silicon'], ['P', 'Phosphorus'], ['S', 'Sulphur'], ['Cl', 'Chlorine'], ['Ar', 'Argon'], ['K', 'Potassium'], ['Ca', 'Calcium'],
  ['Sc', 'Scandium'], ['Ti', 'Titanium'], ['V', 'Vanadium'], ['Cr', 'Chromium'], ['Mn', 'Manganese'], ['Fe', 'Iron'], ['Co', 'Cobalt'], ['Ni', 'Nickel'], ['Cu', 'Copper'], ['Zn', 'Zinc'],
];
/** Electronic configuration for Z ≤ 36 in filling order (Cr and Cu exceptions handled). */
const config = (Z: number, wrongOrder = false): string => {
  const parts: [string, number][] = [];
  let left = Z;
  const order = wrongOrder ? [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['3d', 10], ['4s', 2], ['4p', 6]] as [string, number][] : SUBSHELLS;
  for (const [s, cap] of order) { if (left <= 0) break; const k = Math.min(cap, left); parts.push([s, k]); left -= k; }
  if (!wrongOrder && (Z === 24 || Z === 29)) {
    const d = parts.find((x) => x[0] === '3d')!, s4 = parts.find((x) => x[0] === '4s')!;
    d[1] += 1; s4[1] -= 1;
  }
  return parts.map(([s, k]) => `${s}${sup(k)}`).join(' ');
};

const ch6: USpec = {
  id: 'ts10.ps.ch6', subject: 'chemistry', title: 'Structure of Atom', source: src(6),
  objectives: [
    {
      id: 'ts10.ps.atom.spectrum', title: 'Electromagnetic spectrum and line spectra', prereqs: [],
      intro: [
        h('Fingerprints written in light'),
        photo('🔥', 'Throw a pinch of common salt into a gas flame and it flashes golden-yellow. Copper salts give green-blue. Each element glows with its own colours.'),
        p('Fireworks get their colours from metal salts: strontium gives red, sodium yellow, barium green. To understand why, we first need to understand light itself.'),
        p('Light is an electromagnetic wave. Like a water wave it has a wavelength λ (distance between two crests) and a frequency ν (number of waves passing per second). All electromagnetic waves travel in vacuum at the same speed c = 3 × 10⁸ m/s.'),
        f('c = ν λ', 'speed of light equals frequency times wavelength'),
        p('The full family, from long to short wavelength: radio waves, microwaves, infrared, visible light (red ≈ 700 nm to violet ≈ 400 nm), ultraviolet, X-rays, gamma rays. This arrangement is the electromagnetic spectrum.'),
        p('Max Planck proposed that light energy comes in small packets called quanta (photons). The energy of one packet depends on its frequency:'),
        f('E = h ν', 'energy equals Planck constant times frequency; h = 6.626 × 10⁻³⁴ J s'),
        xp({
          title: 'What if? Change the wavelength of light', formula: 'ν = c / λ',
          res: ['ν', 'Frequency', 'Hz', '3e8 / (λ * 1e-9)', 0],
          vars: [['λ', 'Wavelength', 'nm', 100, 1000, 10, 500]],
          notes: [['λ', 'Longer waves (towards red and infrared) pass by less often: frequency falls, so each photon carries less energy.', 'Shorter waves (towards violet and UV) have higher frequency and more energetic photons — which is why UV can burn the skin.']],
          mistakes: [['Forgetting to convert nm to m', '1 nm = 10⁻⁹ m. Using 500 instead of 500 × 10⁻⁹ gives a frequency a billion times too small.'], ['Thinking frequency and wavelength both increase together', 'Their product is fixed (c), so one goes up as the other goes down.']],
          real: 'Yellow light from sodium street lamps (589 nm) has a frequency of about 5.1 × 10¹⁴ Hz.',
        }),
        h('Continuous and line spectra'),
        p('White light through a prism gives a continuous band of colours. But light from a heated gas of one element, passed through a prism, gives only a few sharp bright lines on a dark background — a line (emission) spectrum. Every element has its own unique pattern of lines, like a fingerprint. Helium was discovered in the Sun from its spectral lines before it was found on Earth.'),
        def('Line spectrum', 'A spectrum of separate bright lines of definite wavelengths emitted by atoms of an element when excited.'),
        keys('c = νλ; all EM waves travel at 3 × 10⁸ m/s in vacuum.', 'E = hν: higher frequency → more energetic photons.', 'Spectrum order: radio, micro, IR, visible, UV, X-ray, gamma.', 'Each element gives a unique line spectrum.'),
        remember('Wavelength and frequency are inversely related; energy is directly related to frequency.'),
      ],
      examples: [
        ex('Find the frequency of green light of wavelength 500 nm.', ['λ = 500 nm = 500 × 10⁻⁹ m = 5 × 10⁻⁷ m', 'ν = c/λ = 3 × 10⁸ ÷ 5 × 10⁻⁷', 'ν = 6 × 10¹⁴ Hz'], '6 × 10¹⁴ Hz'),
        ex('Find the energy of one photon of frequency 6 × 10¹⁴ Hz.', ['E = hν = 6.626 × 10⁻³⁴ × 6 × 10¹⁴', 'E ≈ 3.98 × 10⁻¹⁹ J'], '≈ 3.98 × 10⁻¹⁹ J'),
      ],
      practice: [
        tp('freq', (r) => {
          const lam = r.pick([300, 400, 450, 500, 600, 750, 200, 150, 1000]);
          const nu = sig(3e8 / (lam * 1e-9), 6);
          return numQ(`Find the frequency of electromagnetic radiation of wavelength ${lam} nm. (c = 3 × 10⁸ m/s; you may type e.g. 6e14 Hz)`, nu, 'Hz',
            [`Convert: ${lam} nm = ${lam} × 10⁻⁹ m.`, 'ν = c / λ'], [`ν = 3 × 10⁸ ÷ (${lam} × 10⁻⁹)`, `ν = ${sci(nu)} Hz`],
            [{ when: `${3e8 / lam} Hz`, explain: 'Convert nanometres to metres (× 10⁻⁹) before dividing.' }]);
        }, 2),
        tp('energy', (r) => {
          const nu = r.pick([2, 3, 4, 5, 6, 7.5, 8, 10]) * 1e14;
          const E = sig(6.626e-34 * nu, 3);
          return numQ(`Find the energy of one photon of frequency ${sci(nu)} Hz. (h = 6.626 × 10⁻³⁴ J s; type e.g. 3.98e-19 J)`, E, 'J',
            ['E = hν', 'Multiply the numbers and add the powers of ten.'], [`E = 6.626 × 10⁻³⁴ × ${sci(nu)}`, `E ≈ ${sci(E)} J`], [], 0.01);
        }, 2),
        orderT('em', 'Arrange these electromagnetic waves from LONGEST wavelength to SHORTEST.', ['Radio waves', 'Microwaves', 'Infrared', 'Visible light', 'Ultraviolet', 'X-rays'],
          ['Radio waves can be metres long.', 'X-rays are shorter than ultraviolet.'], 'Radio > micro > infrared > visible > UV > X-ray (> gamma).'),
        mcq('concept', 'Use c = νλ and E = hν.', [
          ['If the wavelength of light doubles, its frequency…', 'Halves', ['Doubles', 'Stays the same', 'Becomes four times'], 'c = νλ is constant.', 'The product is fixed, so ν halves.'],
          ['Which radiation has the most energetic photons?', 'Gamma rays', ['Radio waves', 'Visible light', 'Infrared'], 'Highest frequency.', 'E = hν and gamma rays have the highest frequency.'],
          ['Light from excited atoms of one element gives…', 'A line spectrum', ['A continuous spectrum', 'Only white light', 'No spectrum'], 'Only certain wavelengths.', 'Atoms emit only specific wavelengths — separate lines.'],
          ['Speed of all electromagnetic waves in vacuum is…', '3 × 10⁸ m/s', ['3 × 10⁵ m/s', '340 m/s', 'Different for each colour'], 'Speed of light.', 'All EM waves travel at c in vacuum.'],
          ['Which colour of visible light has the longest wavelength?', 'Red', ['Violet', 'Green', 'Blue'], 'About 700 nm.', 'Red ≈ 700 nm is the longest visible wavelength.'],
          ['Sodium salt in a flame gives a colour of…', 'Golden yellow', ['Brick red', 'Green', 'Violet'], 'Sodium street lamps.', 'Sodium emits strongly at 589 nm (yellow).'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.atom.bohr', title: 'Bohr\'s model, its limitations and the Bohr–Sommerfeld model', prereqs: ['ts10.ps.atom.spectrum'],
      intro: [
        h('Why do atoms give lines, not rainbows?'),
        photo('⭐', 'Think of a staircase: you can stand on step 1 or step 2, but never on step 1½. Bohr said electrons in atoms behave the same way.'),
        p('Rutherford showed an atom has a tiny heavy nucleus with electrons around it. But a moving electron should keep losing energy and spiral into the nucleus — atoms would collapse! And it could not explain line spectra. In 1913 Niels Bohr fixed this with a few bold ideas for the hydrogen atom.'),
        h('Bohr\'s postulates'),
        p('1. Electrons move around the nucleus only in certain fixed circular orbits called stationary states (energy levels), numbered n = 1, 2, 3 … (K, L, M, N shells). 2. While in an allowed orbit, an electron does not lose energy. 3. The energy of each level is fixed; levels farther from the nucleus have higher energy. 4. An electron jumps to a higher level by absorbing exactly the energy difference, and jumps down by emitting it as a photon: ΔE = E₂ − E₁ = hν.'),
        p('Because the energy levels are fixed, only certain energy differences — and so only certain frequencies — are possible. That is exactly why we see sharp lines.'),
        f('ΔE = E_higher − E_lower = hν'),
        p('For hydrogen, Bohr\'s energies are Eₙ = −13.6/n² eV (negative because the electron is bound; 0 means free).'),
        xp({
          title: 'What if? Climb the energy staircase of hydrogen', formula: 'Eₙ = −13.6 / n²  (eV)',
          res: ['E', 'Energy of the level', 'eV', '-13.6 / n ^ 2', 3],
          vars: [['n', 'Energy level (shell number)', '', 1, 7, 1, 1]],
          notes: [['n', 'Higher levels are less negative (higher energy) and crowd closer together; at very large n the electron is almost free.', 'Lower levels are more tightly bound; n = 1 (ground state) is the lowest energy.']],
          mistakes: [['Thinking a negative energy is "less than nothing"', 'Negative means bound. Zero is the energy of a free electron, so 13.6 eV is needed to free a ground-state electron.'], ['Thinking levels are equally spaced', 'Energy goes as 1/n², so the steps get smaller as n increases.']],
          real: 'The red line in hydrogen\'s spectrum (656 nm) comes from an electron dropping from n = 3 to n = 2: ΔE = 1.89 eV.',
        }),
        h('Limitations'),
        p('Bohr\'s model works beautifully for hydrogen (and one-electron ions) but fails for atoms with more electrons. It could not explain why some single lines, seen with better instruments, are actually groups of closely spaced lines (fine structure), nor the splitting of lines in a magnetic field (Zeeman effect). It also treats the electron as a particle moving on a fixed path.'),
        h('Bohr–Sommerfeld model'),
        p('Arnold Sommerfeld suggested electrons can also move in elliptical orbits, and that each main energy level has sub-levels. This explained the fine structure better and introduced the idea of sub-levels (s, p, d, f) — but it still failed for complex atoms. That led to the quantum mechanical model.'),
        keys('Electrons occupy fixed energy levels and do not radiate there.', 'Jump up: absorb energy; jump down: emit a photon, ΔE = hν.', 'Explains hydrogen line spectrum; fails for multi-electron atoms and fine structure.', 'Sommerfeld: elliptical orbits and sub-levels.'),
        remember('Ground state = lowest energy level (n = 1). Excited state = any higher level.'),
      ],
      examples: [
        ex('In hydrogen, find the energy released when an electron drops from n = 3 to n = 2.', ['E₃ = −13.6/9 = −1.51 eV', 'E₂ = −13.6/4 = −3.40 eV', 'ΔE = E₃ − E₂ = −1.51 − (−3.40) = 1.89 eV'], '1.89 eV (emitted as red light)'),
        ex('Why does hydrogen gas in a discharge tube give separate lines and not a continuous spectrum?', ['Electrons can have only fixed energies.', 'Jumps between levels give fixed energy differences.', 'Fixed ΔE → fixed frequencies (ΔE = hν) → separate lines.'], 'Because energy levels are quantised'),
      ],
      practice: [
        mcq('postulates', 'Think of the staircase picture.', [
          ['According to Bohr, an electron in a stationary orbit…', 'Does not lose energy', ['Continuously radiates energy', 'Falls into the nucleus', 'Has zero energy'], 'Stationary states are stable.', 'In an allowed orbit the energy stays constant.'],
          ['An electron jumps from n = 2 to n = 4. It must…', 'Absorb energy', ['Emit energy', 'Neither', 'Lose its charge'], 'Moving up the staircase.', 'Going to a higher level needs energy to be absorbed.'],
          ['Bohr\'s model could successfully explain the spectrum of…', 'The hydrogen atom', ['All atoms', 'Uranium', 'Molecules'], 'One electron only.', 'It works for hydrogen and one-electron ions.'],
          ['Which could Bohr\'s model NOT explain?', 'Splitting of spectral lines in a magnetic field', ['Line spectrum of hydrogen', 'Stability of hydrogen atom', 'Fixed energy levels'], 'Zeeman effect.', 'Line splitting (fine structure, Zeeman effect) needs sub-levels and later quantum ideas.'],
          ['Sommerfeld modified Bohr\'s model by proposing…', 'Elliptical orbits and sub-levels', ['No nucleus', 'Electrons at rest', 'Continuous energy'], 'Not only circles.', 'He added elliptical orbits, leading to sub-levels.'],
          ['The lowest energy state of an atom is called…', 'Ground state', ['Excited state', 'Ionised state', 'Free state'], 'n = 1 for hydrogen.', 'The ground state has the lowest energy.'],
        ]),
        tp('level', (r) => {
          const n = r.int(1, 6);
          const E = rd(-13.6 / (n * n), 2);
          return numQ(`Using Eₙ = −13.6/n² eV, find the energy of the electron in the n = ${n} level of hydrogen (in eV, with sign).`, E, undefined,
            ['Square n first.', `E = −13.6 ÷ ${n * n}`], [`E${n === 1 ? '₁' : ''} = −13.6 ÷ ${n}² = ${E} eV`],
            [{ when: String(-E), explain: 'Bound electron energies are negative.' }, { when: String(rd(-13.6 / n, 2)), explain: 'Divide by n², not n.' }], 0.01);
        }, 2),
        tp('jump', (r) => {
          const [hi, lo] = r.pick([[2, 1], [3, 1], [3, 2], [4, 2], [4, 3], [5, 2], [4, 1], [6, 2]] as [number, number][]);
          const dE = rd(13.6 * (1 / (lo * lo) - 1 / (hi * hi)), 2);
          return numQ(`An electron in hydrogen falls from n = ${hi} to n = ${lo}. How much energy (in eV) is emitted? (Eₙ = −13.6/n² eV)`, dE, undefined,
            [`E${hi} = −13.6/${hi * hi}, E${lo} = −13.6/${lo * lo}`, 'ΔE = E(higher) − E(lower), which is positive.'],
            [`E${hi} = ${rd(-13.6 / (hi * hi), 3)} eV, E${lo} = ${rd(-13.6 / (lo * lo), 3)} eV`, `ΔE = ${dE} eV`], [], 0.02);
        }, 3),
      ],
    },
    {
      id: 'ts10.ps.atom.qn', title: 'Quantum mechanical model and quantum numbers', prereqs: ['ts10.ps.atom.bohr'],
      intro: [
        h('From fixed paths to clouds of probability'),
        photo('🌀', 'Imagine photographing a buzzing bee many times and stacking the photos: you get a fuzzy cloud showing where the bee is most likely to be. That is how we picture electrons today.'),
        p('Experiments showed that electrons behave both like particles and like waves. Erwin Schrödinger described electrons with a wave equation. Its solutions do not give exact paths; they give regions in space where the electron is most likely to be found.'),
        def('Orbital', 'A region of space around the nucleus where the probability of finding an electron is maximum. An orbital can hold at most 2 electrons.'),
        p('Each electron in an atom is described by four quantum numbers — like an address with a district, street, house and room.'),
        def('Principal quantum number (n)', 'n = 1, 2, 3 … Gives the main energy level (shell) and size. Larger n → bigger orbital, higher energy. Shell n has n² orbitals and holds up to 2n² electrons.'),
        def('Angular momentum (azimuthal) quantum number (l)', 'l = 0 to (n − 1). Gives the sub-level and shape: l = 0 s (sphere), 1 p (dumb-bell), 2 d, 3 f.'),
        def('Magnetic quantum number (mₗ)', 'mₗ = −l … 0 … +l, so a sub-level has (2l + 1) orbitals with different orientations: s 1, p 3, d 5, f 7.'),
        def('Spin quantum number (mₛ)', '+½ or −½ — the two directions of the electron\'s spin. Two electrons in the same orbital must have opposite spins.'),
        f('Max electrons in shell n = 2n²;  orbitals in a sub-level = 2l + 1'),
        xp({
          title: 'What if? How many electrons can a shell hold?', formula: 'max electrons = 2n²',
          res: ['N', 'Maximum electrons in the shell', '', '2 * n ^ 2', 0],
          vars: [['n', 'Principal quantum number', '', 1, 7, 1, 2]],
          notes: [['n', 'Each new shell has more sub-levels (n of them) and more orbitals (n²), so its capacity grows as 2n² — 2, 8, 18, 32…', 'Inner shells are small and hold few electrons.']],
          mistakes: [['Using 2n instead of 2n²', 'Shell 3 holds 18 electrons, not 6: it has 3s (1 orbital) + 3p (3) + 3d (5) = 9 orbitals × 2.'], ['Allowing l = n', 'l only goes up to n − 1, so the first shell has only an s sub-level.']],
          real: 'The third shell can hold 18 electrons — but in potassium the 19th electron goes to 4s first, because 4s is lower in energy than 3d.',
        }),
        keys('Orbital = region of maximum probability; max 2 electrons.', 'n: shell; l: 0 … n − 1 (s, p, d, f); mₗ: −l … +l; mₛ: ±½.', 'Orbitals in a sub-level: 2l + 1. In shell n: n². Electrons in shell n: 2n².', 'Sub-shell label = n followed by the letter for l, e.g. n = 3, l = 2 → 3d.'),
        remember('There is no 1p or 2d orbital — l must be less than n.'),
      ],
      examples: [
        ex('List the possible values of l and mₗ for n = 2.', ['l = 0, 1 (up to n − 1)', 'l = 0 → mₗ = 0 (2s, 1 orbital)', 'l = 1 → mₗ = −1, 0, +1 (2p, 3 orbitals)', 'Total orbitals = 4 = n²'], 'l = 0, 1; four orbitals in all'),
        ex('Which sub-level has n = 4, l = 2, and how many electrons can it hold?', ['l = 2 is d', 'So the sub-level is 4d', 'Orbitals = 2l + 1 = 5; electrons = 10'], '4d, up to 10 electrons'),
      ],
      practice: [
        tp('count', (r) => {
          const kind = r.pick(['shellE', 'shellO', 'subO', 'subE', 'lvals'] as const);
          const n = r.int(1, 5), l = r.int(0, 3);
          const L2 = 'spdf'[l];
          if (kind === 'shellE') return numQ(`What is the maximum number of electrons in the shell with n = ${n}?`, 2 * n * n, undefined, ['Use 2n².', `2 × ${n}²`], [`2 × ${n * n} = ${2 * n * n}`], [{ when: String(2 * n), explain: 'Square n first: 2n², not 2n.' }]);
          if (kind === 'shellO') return numQ(`How many orbitals are there in the shell with n = ${n}?`, n * n, undefined, ['A shell has n² orbitals.', 'Count s (1) + p (3) + d (5) … up to l = n − 1.'], [`n² = ${n * n}`], [{ when: String(2 * n * n), explain: 'That is the number of electrons. Each orbital holds 2, so orbitals = n².' }]);
          if (kind === 'subO') return numQ(`How many orbitals are present in a ${L2} sub-level (l = ${l})?`, 2 * l + 1, undefined, ['Orbitals = 2l + 1', 'They are the allowed mₗ values −l … +l.'], [`2 × ${l} + 1 = ${2 * l + 1}`]);
          if (kind === 'subE') return numQ(`What is the maximum number of electrons in a ${L2} sub-level?`, 2 * (2 * l + 1), undefined, ['First find the number of orbitals (2l + 1).', 'Each orbital holds 2 electrons.'], [`Orbitals = ${2 * l + 1}`, `Electrons = 2 × ${2 * l + 1} = ${2 * (2 * l + 1)}`]);
          return numQ(`How many different values of l are allowed when n = ${n}?`, n, undefined, ['l runs from 0 to n − 1.', 'Count them.'], [`l = 0 … ${n - 1}: ${n} values`], [{ when: String(n - 1), explain: 'Do not forget l = 0 — there are n values from 0 to n − 1.' }]);
        }, 2),
        tp('label', (r) => {
          const n = r.int(1, 5);
          const l = r.int(0, Math.min(3, n - 1));
          const ans = `${n}${'spdf'[l]}`;
          const wrong = [`${n}${'spdf'[(l + 1) % 4]}`, `${l + 1}${'spdf'[l]}`, `${n + 1}${'spdf'[l]}`, `${n}${'spdf'[(l + 2) % 4]}`];
          return {
            type: 'mcq', prompt: `Which sub-level has n = ${n} and l = ${l}?`, ...choose(r, ans, wrong),
            hints: ['l = 0 s, 1 p, 2 d, 3 f.', 'Write n first, then the letter.'],
            mistakes: [{ when: 'wrong', explain: 'Write the number n, then the letter for l (0 = s, 1 = p, 2 = d, 3 = f).' }],
            solution: [`n = ${n}, l = ${l} → ${'spdf'[l]}`, `Sub-level: ${ans}`],
          };
        }),
        mcq('rules', 'l < n; mₗ from −l to +l; mₛ = ±½.', [
          ['Which set of quantum numbers is NOT possible?', 'n = 1, l = 1', ['n = 2, l = 1', 'n = 3, l = 2', 'n = 2, l = 0'], 'l must be less than n.', 'For n = 1, only l = 0 is allowed.'],
          ['Which orbital does NOT exist?', '2d', ['3d', '2p', '4f'], 'For n = 2, l can be 0 or 1.', 'd needs l = 2, which requires n ≥ 3.'],
          ['The shape of an s orbital is…', 'Spherical', ['Dumb-bell', 'Double dumb-bell', 'Ring'], 'l = 0.', 's orbitals are spheres around the nucleus.'],
          ['The shape of a p orbital is…', 'Dumb-bell', ['Spherical', 'Cubic', 'Flat disc'], 'l = 1.', 'p orbitals have two lobes — dumb-bell shaped.'],
          ['Possible values of the spin quantum number are…', '+½ and −½', ['0 and 1', '−1, 0, +1', 'Any value'], 'Two spin directions.', 'An electron spins one of two ways: +½ or −½.'],
          ['An orbital is best described as…', 'A region where the probability of finding the electron is maximum', ['A fixed circular path', 'The nucleus', 'A line in the spectrum'], 'Schrödinger replaced paths with probabilities.', 'Orbitals are probability clouds, not orbits.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.atom.config', title: 'Electronic configuration: Aufbau, Pauli and Hund\'s rules', prereqs: ['ts10.ps.atom.qn'],
      intro: [
        h('Filling the hostel rooms'),
        photo('🏢', 'Think of an atom as a hostel. Rooms (orbitals) on lower floors are filled first, each room takes at most two students, and students prefer empty rooms before sharing.'),
        p('Electronic configuration tells us how the electrons of an atom are arranged in shells and sub-levels. It is written like 1s² 2s² 2p⁶ — number = shell, letter = sub-level, superscript = number of electrons in it. Three rules decide the filling:'),
        def('Aufbau principle', 'Electrons enter sub-levels in increasing order of energy. Energy is decided by (n + l): lower (n + l) first; if equal, lower n first. Order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, …'),
        def('Pauli exclusion principle', 'No two electrons in an atom can have all four quantum numbers the same — so one orbital holds at most two electrons, with opposite spins.'),
        def('Hund\'s rule', 'In orbitals of equal energy (like the three 2p orbitals), electrons first occupy separate orbitals singly with parallel spins before pairing begins.'),
        p('Why does 4s fill before 3d? For 4s, n + l = 4 + 0 = 4. For 3d, n + l = 3 + 2 = 5. Lower (n + l) means lower energy, so 4s first. That is why potassium (Z = 19) is 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹, not …3d¹.'),
        p('Two famous exceptions: chromium (Z = 24) is …3d⁵ 4s¹ and copper (Z = 29) is …3d¹⁰ 4s¹, because exactly half-filled and completely filled d sub-levels are extra stable.'),
        p('Short form: write the previous noble gas in brackets. Sodium: [Ne] 3s¹. Calcium: [Ar] 4s².'),
        keys('Fill by increasing (n + l); tie → lower n first.', 'Pauli: max 2 electrons per orbital, opposite spins.', 'Hund: fill equal-energy orbitals singly first.', 'Exceptions: Cr 3d⁵4s¹, Cu 3d¹⁰4s¹.'),
        remember('The order 1s 2s 2p 3s 3p 4s 3d 4p is the one you must know by heart for the first 36 elements.'),
      ],
      examples: [
        ex('Write the electronic configuration of sulphur (Z = 16).', ['1s holds 2 → 14 left', '2s 2, 2p 6 → 6 left', '3s 2 → 4 left', '3p gets the remaining 4'], '1s² 2s² 2p⁶ 3s² 3p⁴'),
        ex('How many unpaired electrons does nitrogen (Z = 7) have?', ['Configuration: 1s² 2s² 2p³', 'By Hund\'s rule the three 2p electrons go into three separate orbitals.', 'All three are unpaired.'], '3 unpaired electrons'),
        ex('Write the configuration of iron (Z = 26).', ['Fill: 1s² 2s² 2p⁶ 3s² 3p⁶ (18)', '4s² (20)', '3d⁶ (26)'], '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ = [Ar] 4s² 3d⁶'),
      ],
      practice: [
        tp('pick', (r) => {
          const Z = r.int(3, 30);
          const [sym, name] = ELEMENTS[Z - 1];
          const wrong = [config(Z + 1), config(Z - 1), ...(Z > 18 ? [config(Z, true)] : []), config(Z + 2)].filter((w) => w !== config(Z));
          return {
            type: 'mcq', prompt: `Which is the correct electronic configuration of ${name} (${sym}, Z = ${Z})?`, ...choose(r, config(Z), wrong),
            hints: ['Add up the superscripts — they must equal Z.', 'Fill in the order 1s 2s 2p 3s 3p 4s 3d. Remember Cr and Cu are exceptions.'],
            mistakes: [{ when: 'wrong', explain: 'Check the total number of electrons and the filling order (4s before 3d).' }],
            solution: [`${name}: ${config(Z)}`, `Total electrons = ${Z}`],
          };
        }, 2),
        tp('unpaired', (r) => {
          const pool: [string, number, string, number][] = [
            ['Carbon', 6, '1s² 2s² 2p²', 2], ['Nitrogen', 7, '1s² 2s² 2p³', 3], ['Oxygen', 8, '1s² 2s² 2p⁴', 2], ['Fluorine', 9, '1s² 2s² 2p⁵', 1],
            ['Neon', 10, '1s² 2s² 2p⁶', 0], ['Phosphorus', 15, '[Ne] 3s² 3p³', 3], ['Sulphur', 16, '[Ne] 3s² 3p⁴', 2], ['Chromium', 24, '[Ar] 3d⁵ 4s¹', 6], ['Iron', 26, '[Ar] 4s² 3d⁶', 4], ['Boron', 5, '1s² 2s² 2p¹', 1],
          ];
          const [nm, Z, cf, u] = r.pick(pool);
          return numQ(`${nm} (Z = ${Z}) has the configuration ${cf}. How many unpaired electrons does it have?`, u, undefined,
            ['Only the last, partly filled sub-level matters.', 'Hund\'s rule: put one electron in each orbital before pairing (p has 3 orbitals, d has 5).'],
            [`Apply Hund's rule to the outer sub-level`, `Unpaired electrons = ${u}`]);
        }, 2),
        orderT('order', 'Arrange these sub-levels in the order in which they are filled.', ['1s', '2s', '2p', '3s', '3p', '4s', '3d'],
          ['Use the (n + l) rule.', '4s (n + l = 4) comes before 3d (n + l = 5).'], 'Filling order: 1s, 2s, 2p, 3s, 3p, 4s, 3d.'),
        mcq('rules', 'Name the rule that is being used.', [
          ['"An orbital can hold at most two electrons with opposite spins" is…', 'Pauli exclusion principle', ['Hund\'s rule', 'Aufbau principle', 'Bohr\'s postulate'], 'No two electrons with all four quantum numbers the same.', 'This is Pauli\'s principle.'],
          ['"Electrons occupy equal-energy orbitals singly before pairing" is…', 'Hund\'s rule', ['Pauli exclusion principle', 'Aufbau principle', 'Octet rule'], 'Like passengers taking empty seats first.', 'This is Hund\'s rule of maximum multiplicity.'],
          ['"Electrons fill sub-levels in increasing order of energy" is…', 'Aufbau principle', ['Hund\'s rule', 'Pauli principle', 'Newlands\' law'], 'Aufbau = building up.', 'The Aufbau principle gives the filling order.'],
          ['Why does 4s fill before 3d?', '4s has lower (n + l) and so lower energy', ['4s is closer to the nucleus', '3d does not exist', '4s has more orbitals'], 'Compute n + l.', '4s: 4 + 0 = 4; 3d: 3 + 2 = 5.'],
          ['The configuration of copper (Z = 29) is…', '[Ar] 3d¹⁰ 4s¹', ['[Ar] 3d⁹ 4s²', '[Ar] 4s² 3d⁹', '[Ar] 3d¹¹'], 'A full d sub-level is extra stable.', 'Copper takes 3d¹⁰ 4s¹.'],
          ['The configuration of chromium (Z = 24) is…', '[Ar] 3d⁵ 4s¹', ['[Ar] 4s² 3d⁴', '[Ar] 3d⁶', '[Ar] 4s¹ 3d⁴'], 'A half-filled d sub-level is extra stable.', 'Chromium takes 3d⁵ 4s¹.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 7 — Classification of Elements: The Periodic Table
// =====================================================================================
/** Z = index + 1: [group, period] for the first 20 elements. */
const GP: [number, number][] = [[1, 1], [18, 1], [1, 2], [2, 2], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2], [18, 2], [1, 3], [2, 3], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [18, 3], [1, 4], [2, 4]];
const shells = (Z: number) => { const out: number[] = []; let left = Z; for (const cap of [2, 8, 8, 2]) { if (left <= 0) break; const k = Math.min(cap, left); out.push(k); left -= k; } return out.join(', '); };
const TRIADS: [string, [string, number][]][] = [
  ['alkali metals', [['Li', 7], ['Na', 23], ['K', 39]]],
  ['alkaline earth metals', [['Ca', 40], ['Sr', 88], ['Ba', 137]]],
  ['halogens', [['Cl', 35.5], ['Br', 80], ['I', 127]]],
  ['chalcogens', [['S', 32], ['Se', 79], ['Te', 128]]],
  ['metals', [['Fe', 56], ['Co', 59], ['Ni', 59]]],
];

const ch7: USpec = {
  id: 'ts10.ps.ch7', subject: 'chemistry', title: 'Classification of Elements — The Periodic Table', source: src(7),
  objectives: [
    {
      id: 'ts10.ps.periodic.history', title: 'Early classification: Dobereiner, Newlands and Mendeleev', prereqs: [],
      intro: [
        h('Why arrange elements at all?'),
        photo('📚', 'A library with 5000 books thrown in a heap is useless. Arrange them by subject and you can find any book — and predict what belongs on an empty shelf.'),
        p('By the mid-1800s about 60 elements were known, each with its own properties. Studying each one separately was hard. Scientists looked for patterns so that elements with similar properties could be studied together. Several attempts led, step by step, to today\'s periodic table.'),
        h('Dobereiner\'s triads (1829)'),
        p('Johann Dobereiner noticed groups of three similar elements. When arranged in increasing atomic mass, the atomic mass of the middle element was roughly the average of the other two. Example: Li (7), Na (23), K (39): (7 + 39)/2 = 23.'),
        def('Dobereiner\'s triad', 'A group of three chemically similar elements in which the atomic mass of the middle element is approximately the mean of the other two.'),
        f('Middle mass ≈ (first mass + third mass) / 2'),
        xp({
          title: 'What if? Test a possible triad', formula: 'predicted middle mass = (A₁ + A₃) / 2',
          res: ['M', 'Predicted mass of the middle element', 'u', '(A1 + A3) / 2', 1],
          vars: [['A1', 'Atomic mass of the lightest element', 'u', 1, 100, 0.5, 7], ['A3', 'Atomic mass of the heaviest element', 'u', 20, 250, 0.5, 39]],
          notes: [['A1', 'A heavier first element raises the predicted middle mass by half as much.', 'A lighter first element lowers the prediction by half the change.'], ['A3', 'A heavier third element pulls the average up by half the change.', 'A lighter third element pulls it down.']],
          mistakes: [['Averaging all three masses', 'The rule compares the middle mass with the average of only the OTHER TWO.'], ['Thinking any three elements form a triad', 'They must also be chemically similar — the mass rule alone is not enough.']],
          real: 'Cl (35.5), Br (80), I (127): the average of 35.5 and 127 is 81.25 — very close to bromine\'s 80.',
        }),
        p('Limitation: only a few triads could be found among the known elements, so it could not classify all of them.'),
        h('Newlands\' law of octaves (1866)'),
        p('John Newlands arranged elements by increasing atomic mass and saw that every eighth element had properties like the first — like the eighth note in music (sa re ga ma pa dha ni sa). Example: Na is the eighth from Li. Limitations: it worked only up to calcium; he squeezed two elements into one slot (Co and Ni) and placed some unlike elements together (Fe with O and S); and there was no room for newly discovered elements.'),
        h('Mendeleev\'s periodic table (1869)'),
        def('Mendeleev\'s periodic law', 'The physical and chemical properties of elements are a periodic function of their atomic masses.'),
        p('Dmitri Mendeleev arranged the 63 known elements by atomic mass AND by the formulae of their oxides and hydrides. His bold step: he left gaps for undiscovered elements and predicted their properties — eka-boron (scandium), eka-aluminium (gallium), eka-silicon (germanium). When gallium was discovered, its properties matched his predictions almost exactly. He also corrected some atomic masses.'),
        p('Limitations: hydrogen had no fixed place; isotopes (same element, different masses) would need different places; in some pairs a heavier element came before a lighter one (Co 58.9 before Ni 58.7; Te 127.6 before I 126.9) to keep similar elements together; and there was no explanation of why properties repeat.'),
        keys('Triads: middle mass ≈ average of the other two (few triads only).', 'Octaves: every 8th element similar, but only up to Ca.', 'Mendeleev: properties repeat with atomic mass; left gaps, predicted Ga, Sc, Ge.', 'Anomalies: H position, isotopes, Co–Ni, Te–I.'),
        remember('Eka-aluminium = gallium, eka-silicon = germanium, eka-boron = scandium.'),
      ],
      examples: [
        ex('Do Ca (40), Sr (88), Ba (137) form a Dobereiner triad?', ['Average of the end masses = (40 + 137)/2 = 88.5', 'Sr = 88 ≈ 88.5', 'All three are similar alkaline earth metals.'], 'Yes'),
        ex('Using Newlands\' octaves, which element would be like lithium?', ['Count from Li as 1: Li, Be, B, C, N, O, F, Na', 'The 8th element is Na.'], 'Sodium (Na)'),
      ],
      practice: [
        tp('triad', (r) => {
          const [fam, t] = r.pick(TRIADS);
          const mid = rd((t[0][1] + t[2][1]) / 2, 2);
          return numQ(`In a Dobereiner triad of ${fam}, ${t[0][0]} has atomic mass ${t[0][1]} u and ${t[2][0]} has ${t[2][1]} u. Predict the atomic mass of the middle element ${t[1][0]}.`, mid, undefined,
            ['Middle ≈ average of the first and third.', `(${t[0][1]} + ${t[2][1]}) ÷ 2`], [`(${t[0][1]} + ${t[2][1]}) ÷ 2 = ${mid}`, `Actual mass of ${t[1][0]} ≈ ${t[1][1]} u — close!`],
            [{ when: String(t[0][1] + t[2][1]), explain: 'Remember to divide by 2 to get the average.' }]);
        }),
        mcq('history', 'Match each scientist to his idea and its weakness.', [
          ['Newlands\' law of octaves worked well only up to…', 'Calcium', ['Iron', 'Uranium', 'Hydrogen'], 'Only light elements.', 'Beyond calcium every eighth element was not similar.'],
          ['Mendeleev arranged elements in order of increasing…', 'Atomic mass', ['Atomic number', 'Density', 'Number of neutrons'], 'Atomic number was unknown then.', 'Mendeleev used atomic masses and the formulae of oxides and hydrides.'],
          ['Eka-aluminium predicted by Mendeleev was later discovered as…', 'Gallium', ['Germanium', 'Scandium', 'Aluminium'], 'It sits below aluminium.', 'Gallium matched his predictions closely.'],
          ['Which was a limitation of Mendeleev\'s table?', 'No fixed place for hydrogen', ['He left gaps', 'He predicted new elements', 'He grouped similar elements'], 'Hydrogen resembles both alkali metals and halogens.', 'Hydrogen\'s position could not be decided.'],
          ['Why did Mendeleev place Co before Ni even though Co is heavier?', 'To keep elements with similar properties together', ['He made a mistake', 'Co was discovered first', 'Ni is a gas'], 'Properties mattered more than strict order.', 'He gave priority to similarity of properties.'],
          ['The main limitation of Dobereiner\'s triads was…', 'Only a few triads could be found', ['They used atomic numbers', 'They had gaps', 'They were too accurate'], 'Most elements did not fit.', 'Many known elements could not be put into triads.'],
        ]),
        matchT('match', 'scientist to his contribution', [
          ['Dobereiner', 'Triads of similar elements'], ['Newlands', 'Law of octaves'], ['Mendeleev', 'Periodic law based on atomic mass'],
          ['Moseley', 'Atomic number is the basis'], ['Eka-silicon', 'Germanium'], ['Eka-boron', 'Scandium'],
        ], ['Two of these are predicted elements, not scientists.', 'Moseley comes after Mendeleev.']),
      ],
    },
    {
      id: 'ts10.ps.periodic.modern', title: 'Modern periodic table: periods, groups and blocks', prereqs: ['ts10.ps.periodic.history', 'ts10.ps.atom.config'],
      intro: [
        h('Atomic number — the true order'),
        photo('🧮', 'Like seats in a classroom numbered by roll number rather than by height, elements are now ordered by atomic number.'),
        p('In 1913 Henry Moseley showed, using X-rays, that the atomic number (number of protons) is the fundamental property of an element. Arranging by atomic number removed most of Mendeleev\'s problems — isotopes have the same atomic number, so they share one place, and Co (27) naturally comes before Ni (28).'),
        def('Modern periodic law', 'The physical and chemical properties of elements are a periodic function of their atomic numbers (and so of their electronic configurations).'),
        h('Layout'),
        p('The long form of the periodic table has 18 vertical columns called groups and 7 horizontal rows called periods. Elements in the same group have the same number of valence (outermost) electrons and similar properties. The period number equals the number of shells being filled.'),
        p('Blocks follow the sub-level receiving the last electron: s-block (groups 1, 2) and helium; p-block (groups 13–18); d-block (groups 3–12, transition elements); f-block (lanthanides and actinides, placed separately at the bottom).'),
        h('Finding the place of an element'),
        p('Write the shell configuration. Period = number of shells. Group: for 1 or 2 valence electrons, group = that number; for p-block elements, group = 10 + number of valence electrons. Example: chlorine (Z = 17) is 2, 8, 7 → 3 shells → period 3; 7 valence electrons → group 17.'),
        keys('Order by atomic number (Moseley).', '18 groups, 7 periods; s, p, d, f blocks.', 'Same group → same valence electrons → similar properties.', 'Period number = number of shells.'),
        remember('Group 1 = alkali metals, group 2 = alkaline earth metals, group 17 = halogens, group 18 = noble gases.'),
      ],
      examples: [
        ex('Find the period and group of magnesium (Z = 12).', ['Shells: 2, 8, 2', '3 shells → period 3', '2 valence electrons, s-block → group 2'], 'Period 3, group 2'),
        ex('An element has configuration 2, 8, 5. Where is it and what is it?', ['3 shells → period 3', '5 valence electrons in p-block → group 10 + 5 = 15', 'Z = 15 → phosphorus'], 'Period 3, group 15: phosphorus'),
      ],
      practice: [
        tp('place', (r) => {
          const Z = r.int(1, 20);
          const [g, per] = GP[Z - 1];
          const [sym, name] = ELEMENTS[Z - 1];
          if (r.next() < 0.5) return numQ(`${name} (${sym}) has atomic number ${Z} and shell configuration ${shells(Z)}. In which PERIOD is it?`, per, undefined,
            ['Period = number of shells.', `Count the numbers in ${shells(Z)}.`], [`Shells: ${shells(Z)} → ${per} shell(s)`, `Period ${per}`]);
          return numQ(`${name} (${sym}) has atomic number ${Z} and shell configuration ${shells(Z)}. In which GROUP (1–18) is it?`, g, undefined,
            ['Find the valence electrons (last number).', 'Groups 1–2: same as valence electrons. p-block: 10 + valence electrons. Noble gases: 18.'],
            [`Valence electrons = ${shells(Z).split(', ').pop()}`, `Group ${g}`],
            g > 2 ? [{ when: shells(Z).split(', ').pop()!, explain: 'For p-block elements the group is 10 + valence electrons; noble gases (including helium) are in group 18.' }] : []);
        }, 2),
        mcq('layout', 'Remember: groups go down, periods go across.', [
          ['How many groups are there in the modern periodic table?', '18', ['7', '8', '16'], 'Vertical columns.', 'There are 18 groups.'],
          ['How many periods are there?', '7', ['18', '8', '9'], 'Horizontal rows.', 'There are 7 periods.'],
          ['The modern periodic law is based on…', 'Atomic number', ['Atomic mass', 'Density', 'Melting point'], 'Moseley\'s discovery.', 'Properties repeat with atomic number.'],
          ['Elements of groups 3 to 12 are called…', 'Transition elements (d-block)', ['Noble gases', 'Halogens', 'Alkali metals'], 'The middle block.', 'Groups 3–12 form the d-block.'],
          ['Elements in the same group have the same…', 'Number of valence electrons', ['Number of shells', 'Atomic mass', 'Number of neutrons'], 'Similar properties come from outer electrons.', 'Same valence electrons give similar chemistry.'],
          ['Lanthanides and actinides belong to the…', 'f-block', ['s-block', 'p-block', 'd-block'], 'They are kept below the main table.', 'Their last electrons enter f orbitals.'],
          ['An element with 2, 8, 8, 1 belongs to…', 'Period 4, group 1', ['Period 1, group 4', 'Period 3, group 1', 'Period 4, group 8'], 'Count shells and valence electrons.', '4 shells and 1 valence electron.'],
        ]),
        mcq('blocks', 'The block is the sub-level where the last electron goes.', [
          ['Sodium (3s¹) is in the…', 's-block', ['p-block', 'd-block', 'f-block'], 'Last electron in s.', 'Groups 1 and 2 are s-block.'],
          ['Chlorine (3s² 3p⁵) is in the…', 'p-block', ['s-block', 'd-block', 'f-block'], 'Last electron in p.', 'Groups 13–18 are p-block.'],
          ['Iron ([Ar] 4s² 3d⁶) is in the…', 'd-block', ['s-block', 'p-block', 'f-block'], 'Last electron in 3d.', 'Iron is a transition (d-block) element.'],
          ['Helium (1s²) is placed in group 18 although it is…', 'An s-block element', ['A p-block element', 'A d-block element', 'An f-block element'], 'Its last electron is in 1s.', 'He is s-block but placed with noble gases because it is unreactive with a full shell.'],
          ['Which group contains the noble gases?', '18', ['1', '17', '8'], 'Full outer shells.', 'Group 18 = noble gases.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.periodic.trends', title: 'Periodic trends: size, ionisation energy, electronegativity, metallic character', prereqs: ['ts10.ps.periodic.modern'],
      intro: [
        h('Patterns you can predict'),
        photo('🎯', 'Once you know an element\'s place in the table, you can predict how big its atom is and how it will behave — like predicting a player\'s style from the team position.'),
        p('Two opposite forces decide most trends: the pull of the nucleus (nuclear charge) on the outer electrons, and the distance of those electrons from the nucleus (number of shells), along with the shielding of inner electrons.'),
        def('Valency', 'Combining capacity of an atom. For groups 1, 2, 13, 14 it equals the valence electrons; for groups 15–17 it is 8 minus valence electrons.'),
        def('Atomic radius', 'The distance from the centre of the nucleus to the outermost shell.'),
        def('Ionisation energy (IE)', 'The minimum energy needed to remove the outermost electron from a gaseous atom.'),
        def('Electron affinity', 'The energy released when a gaseous atom gains an electron.'),
        def('Electronegativity', 'The tendency of an atom in a molecule to attract the shared pair of electrons towards itself. Fluorine is the most electronegative element.'),
        h('Across a period (left → right)'),
        p('Shells stay the same but the nuclear charge increases, so outer electrons are pulled closer. Atomic radius DECREASES. IE generally INCREASES. Electronegativity INCREASES. Metallic character DECREASES (metals → metalloids → non-metals).'),
        h('Down a group (top → bottom)'),
        p('A new shell is added each time; the outer electrons are farther away and better shielded. Atomic radius INCREASES. IE DECREASES. Electronegativity DECREASES. Metallic character INCREASES — so caesium is more reactive than lithium.'),
        keys('Across: radius ↓, IE ↑, electronegativity ↑, metallic character ↓.', 'Down: radius ↑, IE ↓, electronegativity ↓, metallic character ↑.', 'Reason: nuclear charge vs number of shells and shielding.', 'Fluorine: highest electronegativity; caesium/francium: most metallic.'),
        remember('Small atoms hold electrons tightly (high IE, high electronegativity). Big atoms lose electrons easily (metallic).'),
        tip('Mnemonic: "Up and to the right gets tight" — IE and electronegativity rise towards fluorine.'),
      ],
      examples: [
        ex('Which is larger, Na or Cl? Explain.', ['Both are in period 3 (same number of shells).', 'Cl has 17 protons; Na has 11.', 'Greater nuclear pull in Cl draws the shells in.'], 'Na is larger'),
        ex('Why is potassium more reactive than sodium?', ['K is below Na in group 1 → one extra shell.', 'Its outer electron is farther from the nucleus and better shielded.', 'Lower ionisation energy → loses the electron more easily.'], 'K loses its outer electron more easily'),
      ],
      practice: [
        tp('compare', (r) => {
          const groups: [string, string[]][] = [['group 1', ['Li', 'Na', 'K', 'Rb', 'Cs']], ['group 2', ['Be', 'Mg', 'Ca', 'Sr', 'Ba']], ['group 17', ['F', 'Cl', 'Br', 'I']]];
          const periods: [string, string[]][] = [['period 2', ['Li', 'Be', 'B', 'C', 'N', 'O', 'F']], ['period 3', ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl']]];
          const down = r.next() < 0.5;
          const [where, list] = down ? r.pick(groups) : r.pick(periods);
          let i = r.int(0, list.length - 1), j = r.int(0, list.length - 1);
          if (i === j) j = (i + 1) % list.length;
          if (i > j) [i, j] = [j, i];
          const a = list[i], b = list[j]; // a comes first (top / left)
          const props = down ? ['larger atomic radius', 'lower ionisation energy', 'lower electronegativity', 'more metallic character'] : ['larger atomic radius', 'higher electronegativity', 'more metallic character'];
          const prop = r.pick(props);
          let ans: string;
          if (down) ans = b; // all chosen properties increase / favour the lower element
          else ans = prop === 'higher electronegativity' ? b : a;
          return {
            type: 'mcq', prompt: `${a} and ${b} are both in ${where}. Which has the ${prop}?`, ...choose(r, ans, [ans === a ? b : a]),
            hints: [down ? `Going down ${where}, a new shell is added each step.` : `Across ${where} the number of shells stays the same while nuclear charge increases.`, down ? 'More shells → larger, holds outer electrons less tightly.' : 'Greater nuclear charge → smaller atom that holds electrons more tightly.'],
            mistakes: [{ when: 'wrong', explain: down ? 'Lower in a group = bigger atom, lower IE and electronegativity, more metallic.' : 'Further right in a period = smaller atom, higher electronegativity, less metallic.' }],
            solution: [`${ans} has the ${prop}.`, down ? `${b} is below ${a}: more shells, outer electrons farther away.` : `${b} is to the right of ${a}: more protons pull the same shells closer.`],
          };
        }, 2),
        mcq('trend', 'Think "nuclear pull versus distance".', [
          ['Across a period from left to right, atomic radius…', 'Decreases', ['Increases', 'Stays the same', 'First increases, then decreases'], 'Same shells, more protons.', 'Increasing nuclear charge pulls the electrons closer.'],
          ['Down a group, ionisation energy…', 'Decreases', ['Increases', 'Stays the same', 'Becomes zero'], 'Outer electron is farther away.', 'Farther, better-shielded electrons are easier to remove.'],
          ['The most electronegative element is…', 'Fluorine', ['Oxygen', 'Chlorine', 'Caesium'], 'Top right (ignoring noble gases).', 'Fluorine has the highest electronegativity.'],
          ['Down a group, metallic character…', 'Increases', ['Decreases', 'Stays the same', 'Disappears'], 'Easier to lose electrons.', 'Lower IE down a group makes elements more metallic.'],
          ['The valency of an element with 6 valence electrons is…', '2', ['6', '8', '4'], 'Groups 15–17: valency = 8 − valence electrons.', '8 − 6 = 2 (e.g. oxygen).'],
          ['Across a period, metallic character…', 'Decreases', ['Increases', 'Stays the same', 'Doubles'], 'Metals on the left, non-metals on the right.', 'Atoms hold electrons more tightly, so they become less metallic.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Atomic radius', 'Distance from nucleus to outermost shell'], ['Ionisation energy', 'Energy to remove the outermost electron'], ['Electron affinity', 'Energy released when an atom gains an electron'],
          ['Electronegativity', 'Pull on a shared electron pair in a bond'], ['Valency', 'Combining capacity of an atom'], ['Metallic character', 'Tendency to lose electrons'],
        ], ['Two of these are about energy; one is about a shared pair.', 'Radius is a distance.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 8 — Chemical Bonding
// =====================================================================================
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const subN = (n: number) => (n === 1 ? '' : String(n).split('').map((d) => SUB[+d]).join(''));
const CATIONS: [string, string, number][] = [['Na', 'sodium', 1], ['K', 'potassium', 1], ['Mg', 'magnesium', 2], ['Ca', 'calcium', 2], ['Al', 'aluminium', 3], ['Li', 'lithium', 1]];
const ANIONS: [string, string, number][] = [['Cl', 'chloride', 1], ['F', 'fluoride', 1], ['O', 'oxide', 2], ['S', 'sulphide', 2], ['N', 'nitride', 3], ['Br', 'bromide', 1]];
const ionic = (c: [string, string, number], a: [string, string, number]) => {
  const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
  const k = g(c[2], a[2]);
  return `${c[0]}${subN(a[2] / k)}${a[0]}${subN(c[2] / k)}`;
};
const ion = (s: string, v: number, neg: boolean) => `${s}${v === 1 ? '' : sup(v)}${neg ? '⁻' : '⁺'}`;

const ch8: USpec = {
  id: 'ts10.ps.ch8', subject: 'chemistry', title: 'Chemical Bonding', source: src(8),
  objectives: [
    {
      id: 'ts10.ps.bond.lewis', title: 'Lewis dot structures and the octet rule', prereqs: ['ts10.ps.periodic.modern'],
      intro: [
        h('Why do atoms join?'),
        photo('🧩', 'Atoms combine the way puzzle pieces do — to reach a more stable, "complete" arrangement.'),
        p('Noble gases like neon and argon hardly react at all. What is special about them? Their outermost shell is full — eight electrons (two for helium). Other atoms tend to gain, lose or share electrons to reach the same stable arrangement. The force that holds atoms together in a substance is a chemical bond.'),
        def('Octet rule', 'Atoms tend to combine so that each has eight electrons in its outermost shell (a duplet of two for hydrogen and helium-like arrangements).'),
        def('Valence electrons', 'The electrons in the outermost shell of an atom; they take part in bonding.'),
        h('Lewis dot symbols'),
        p('G. N. Lewis showed valence electrons as dots (or crosses) around the symbol of the element. Inner electrons are not shown. Sodium (2, 8, 1) is Na· with one dot; oxygen (2, 6) has six dots; chlorine (2, 8, 7) has seven dots.'),
        p('In a Lewis structure of a molecule, a shared pair of electrons between two atoms is a bond; pairs that belong to only one atom are lone pairs. In water, oxygen shares one pair with each hydrogen and keeps two lone pairs — 8 electrons around oxygen, 2 around each hydrogen.'),
        def('Lone pair', 'A pair of valence electrons not shared with another atom.'),
        keys('Noble-gas configuration (octet/duplet) is stable.', 'Valence electrons = dots in a Lewis symbol.', 'Shared pair = bond; unshared pair = lone pair.', 'Water: 2 bond pairs + 2 lone pairs on O.'),
        remember('For main-group elements, valence electrons = last number in the shell configuration (groups 13–18: group number − 10).'),
      ],
      examples: [
        ex('Draw the Lewis symbol of nitrogen (Z = 7).', ['Shells: 2, 5', 'Valence electrons = 5', 'Place 5 dots around N (one pair and three singles).'], 'N with 5 dots'),
        ex('How many lone pairs are on nitrogen in ammonia (NH₃)?', ['N has 5 valence electrons.', '3 are shared with three H atoms (3 bond pairs use 3 of N\'s electrons).', '5 − 3 = 2 electrons left = 1 lone pair.'], '1 lone pair'),
      ],
      practice: [
        tp('valence', (r) => {
          const Z = r.int(1, 20);
          const [sym, name] = ELEMENTS[Z - 1];
          const v = +shells(Z).split(', ').pop()!;
          return numQ(`How many dots are shown in the Lewis symbol of ${name} (${sym}, Z = ${Z})?`, v, undefined,
            ['Write the shell configuration (2, 8, 8, 2 …).', 'Only the outermost shell is shown as dots.'], [`${name}: ${shells(Z)}`, `Valence electrons = ${v}, so ${v} dot(s).`],
            [{ when: String(Z), explain: 'Show only the outermost (valence) electrons, not all the electrons.' }]);
        }),
        tp('lone', (r) => {
          const pool: [string, number, string][] = [
            ['water (H₂O), on oxygen', 2, 'O has 6 valence electrons; 2 are used in two bonds; 4 left = 2 lone pairs.'],
            ['ammonia (NH₃), on nitrogen', 1, 'N has 5; 3 used in bonds; 2 left = 1 lone pair.'],
            ['methane (CH₄), on carbon', 0, 'C has 4; all 4 used in bonds.'],
            ['hydrogen chloride (HCl), on chlorine', 3, 'Cl has 7; 1 used in the bond; 6 left = 3 lone pairs.'],
            ['a fluorine molecule (F₂), in total', 6, 'Each F has 3 lone pairs: 3 + 3 = 6.'],
            ['a nitrogen molecule (N₂), in total', 2, 'Each N uses 3 electrons in the triple bond and keeps 1 lone pair.'],
            ['carbon dioxide (CO₂), in total', 4, 'Each O makes a double bond and keeps 2 lone pairs: 2 + 2 = 4.'],
            ['an oxygen molecule (O₂), in total', 4, 'Each O uses 2 electrons in the double bond and keeps 2 lone pairs.'],
          ];
          const [m, n, why] = r.pick(pool);
          return numQ(`How many lone pairs are there in ${m}?`, n, undefined, ['Start with the valence electrons of the atom.', 'Subtract electrons used in bonds, then divide by 2.'], [why, `Lone pairs = ${n}`]);
        }, 2),
        mcq('octet', 'Count electrons around each atom after bonding.', [
          ['Which atoms are already stable and hardly form bonds?', 'Noble gases', ['Alkali metals', 'Halogens', 'Transition metals'], 'Full outer shells.', 'Noble gases already have a complete octet (helium a duplet).'],
          ['In a Lewis symbol, the dots represent…', 'Valence electrons', ['All electrons', 'Protons', 'Neutrons'], 'Only outer electrons.', 'Lewis symbols show only valence electrons.'],
          ['Hydrogen is stable with how many electrons around it?', '2', ['8', '1', '4'], 'Like helium.', 'Hydrogen reaches a duplet (helium arrangement).'],
          ['The octet rule says atoms tend to have how many electrons in the outer shell?', '8', ['2', '6', '18'], '"Oct" means eight.', 'Eight outer electrons like a noble gas.'],
          ['A shared pair of electrons between two atoms is shown as…', 'A single bond (a line)', ['A lone pair', 'An ion', 'A charge'], 'Shared = bond.', 'Each shared pair is one covalent bond.'],
          ['How many valence electrons does chlorine (2, 8, 7) have?', '7', ['17', '8', '1'], 'Last shell only.', 'Chlorine has 7 valence electrons.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.bond.ionic-covalent', title: 'Ionic and covalent bonds', prereqs: ['ts10.ps.bond.lewis'],
      intro: [
        h('Give and take, or share?'),
        photo('🧊', 'Common salt crystals are held together by ionic bonds; ice and sugar are made of molecules held by covalent bonds.'),
        p('Atoms can reach an octet in two main ways. Metals (with 1–3 valence electrons) find it easier to LOSE them; non-metals (with 5–7) find it easier to GAIN or SHARE.'),
        h('Ionic (electrovalent) bond'),
        p('Sodium (2, 8, 1) gives its one outer electron to chlorine (2, 8, 7). Sodium becomes Na⁺ (2, 8 — like neon) and chlorine becomes Cl⁻ (2, 8, 8 — like argon). The oppositely charged ions attract strongly. Millions of them pack into a crystal lattice — common salt.'),
        def('Ionic bond', 'The electrostatic force of attraction between oppositely charged ions formed by complete transfer of electrons from one atom to another.'),
        def('Electrovalency', 'The number of electrons an atom loses or gains to form an ion. Mg loses 2 → electrovalency 2.'),
        p('Ionic formulae balance charges: Mg²⁺ with Cl⁻ needs two chlorides → MgCl₂. Ca²⁺ with O²⁻ → CaO. Al³⁺ with O²⁻ → Al₂O₃.'),
        h('Covalent bond'),
        p('Two non-metal atoms both want electrons, so neither gives them away — they share. Each shared pair is one covalent bond. H₂: one shared pair (H–H). O₂: two shared pairs (O=O, double bond). N₂: three shared pairs (N≡N, triple bond — very strong). Water H–O–H, ammonia NH₃, methane CH₄ are all covalent molecules.'),
        def('Covalent bond', 'A bond formed by mutual sharing of one or more pairs of electrons between two atoms.'),
        p('If the two atoms differ in electronegativity (like H and Cl), the shared pair is pulled towards the more electronegative atom — a polar covalent bond.'),
        keys('Ionic: transfer of electrons, metal + non-metal, ions held by attraction.', 'Covalent: sharing of electron pairs, usually between non-metals.', 'Single, double, triple bonds = 1, 2, 3 shared pairs.', 'Ionic formula: charges must add up to zero.'),
        remember('Number of shared pairs: H₂ 1, Cl₂ 1, O₂ 2, N₂ 3, CO₂ 4 (two double bonds).'),
      ],
      examples: [
        ex('Show how magnesium oxide forms.', ['Mg (2, 8, 2) loses 2 electrons → Mg²⁺ (2, 8)', 'O (2, 6) gains 2 electrons → O²⁻ (2, 8)', 'Charges +2 and −2 balance → MgO'], 'Mg²⁺O²⁻ — an ionic bond'),
        ex('Explain the bonding in a nitrogen molecule.', ['N has 5 valence electrons; needs 3 more.', 'Two N atoms share three pairs.', 'Each N now has 8 electrons (6 shared + 2 lone).'], 'Triple covalent bond, N≡N'),
      ],
      practice: [
        tp('formula', (r) => {
          const c = r.pick(CATIONS), a = r.pick(ANIONS);
          const ans = ionic(c, a);
          const wrong = [`${c[0]}${a[0]}`, `${c[0]}${subN(c[2])}${a[0]}${subN(a[2])}`, `${c[0]}${subN(a[2] + 1)}${a[0]}${subN(c[2])}`, `${c[0]}${a[0]}${subN(c[2] + a[2])}`];
          return {
            type: 'mcq', prompt: `${c[1][0].toUpperCase() + c[1].slice(1)} forms ${ion(c[0], c[2], false)} and the non-metal forms ${ion(a[0], a[2], true)}. What is the formula of ${c[1]} ${a[1]}?`, ...choose(r, ans, wrong),
            hints: ['The total positive charge must equal the total negative charge.', `Use the cross-over idea: the charge of one ion becomes the number of the other (then simplify).`],
            mistakes: [{ when: 'wrong', explain: 'Check that the charges add to zero, and simplify to the smallest ratio.' }],
            solution: [`${ion(c[0], c[2], false)} and ${ion(a[0], a[2], true)}`, `Balance charges → ${ans}`],
          };
        }, 2),
        mcq('type', 'Metal + non-metal → usually ionic. Non-metal + non-metal → covalent.', [
          ['The bond in sodium chloride is…', 'Ionic', ['Covalent', 'Metallic only', 'Hydrogen bond'], 'Metal + non-metal.', 'Na transfers an electron to Cl.'],
          ['The bond in a chlorine molecule (Cl₂) is…', 'Covalent (single)', ['Ionic', 'Covalent (double)', 'Covalent (triple)'], 'Two identical non-metals.', 'Each Cl shares one electron: one shared pair.'],
          ['The bond in an oxygen molecule is…', 'Double covalent bond', ['Single covalent bond', 'Triple covalent bond', 'Ionic bond'], 'O needs 2 more electrons.', 'Two shared pairs: O=O.'],
          ['The bond in a nitrogen molecule is…', 'Triple covalent bond', ['Single covalent bond', 'Double covalent bond', 'Ionic bond'], 'N needs 3 more electrons.', 'Three shared pairs: N≡N.'],
          ['Calcium oxide is held together by…', 'Ionic bonds', ['Covalent bonds', 'No bonds', 'Shared pairs'], 'Ca is a metal.', 'Ca²⁺ and O²⁻ ions attract each other.'],
          ['In HCl, the shared pair lies closer to…', 'Chlorine', ['Hydrogen', 'Exactly in the middle', 'Neither atom'], 'Which is more electronegative?', 'Cl is more electronegative, making the bond polar.'],
          ['When Mg forms Mg²⁺, it…', 'Loses 2 electrons', ['Gains 2 electrons', 'Shares 2 electrons', 'Loses 2 protons'], 'Positive ion = fewer electrons.', 'Losing 2 electrons leaves a +2 charge.'],
        ]),
        tp('pairs', (r) => {
          const pool: [string, number][] = [['H₂', 1], ['Cl₂', 1], ['O₂', 2], ['N₂', 3], ['CO₂ (total)', 4], ['CH₄ (total)', 4], ['NH₃ (total)', 3], ['H₂O (total)', 2], ['HCl', 1], ['C₂H₂ between the two carbons', 3]];
          const [m, n] = r.pick(pool);
          return numQ(`How many shared pairs of electrons (bonds counted as pairs) are there in ${m}?`, n, undefined,
            ['Draw the Lewis structure.', 'Single bond = 1 pair, double = 2, triple = 3.'], [`${m}: ${n} shared pair(s)`]);
        }),
      ],
    },
    {
      id: 'ts10.ps.bond.vsepr', title: 'Shapes of molecules: VSEPR theory', prereqs: ['ts10.ps.bond.ionic-covalent'],
      intro: [
        h('Molecules have shapes'),
        photo('🎈', 'Tie two balloons together and they point opposite ways; three spread into a flat triangle; four point to the corners of a tetrahedron. Electron pairs behave the same way.'),
        p('Electron pairs are all negatively charged, so they repel each other. Around a central atom, the electron pairs (both bonding pairs and lone pairs) arrange themselves as far apart as possible. This simple idea is the Valence Shell Electron Pair Repulsion (VSEPR) theory, and it predicts the shapes of molecules.'),
        def('VSEPR theory', 'Electron pairs in the valence shell of the central atom repel one another and take positions that keep them as far apart as possible, deciding the shape of the molecule.'),
        h('Shapes with only bond pairs'),
        p('2 pairs → linear, 180° (BeCl₂). 3 pairs → trigonal planar, 120° (BF₃). 4 pairs → tetrahedral, 109°28′ (CH₄).'),
        h('Lone pairs push harder'),
        p('Repulsion order: lone pair–lone pair > lone pair–bond pair > bond pair–bond pair. A lone pair is held by only one nucleus, so it spreads out more and squeezes the bonds together. NH₃ has 3 bond pairs + 1 lone pair: pyramidal, 107°48′. H₂O has 2 bond pairs + 2 lone pairs: bent (V-shaped), 104°31′.'),
        keys('Electron pairs repel and stay as far apart as possible.', 'BeCl₂ linear 180°; BF₃ trigonal planar 120°; CH₄ tetrahedral 109°28′.', 'NH₃ pyramidal 107°48′; H₂O bent 104°31′.', 'lp–lp > lp–bp > bp–bp repulsion.'),
        remember('CH₄, NH₃ and H₂O all have 4 electron pairs on the central atom — the angle drops as lone pairs increase (0 → 1 → 2).'),
      ],
      examples: [
        ex('Predict the shape of BF₃.', ['B has 3 valence electrons, making 3 bonds with F.', 'No lone pairs on B.', '3 pairs as far apart as possible → 120° in one plane.'], 'Trigonal planar, 120°'),
        ex('Why is the bond angle of water less than that of methane?', ['Both have 4 electron pairs on the central atom.', 'Water\'s O has 2 lone pairs; methane\'s C has none.', 'Lone pairs repel more, pushing the O–H bonds closer.'], '104°31′ for water vs 109°28′ for methane'),
      ],
      practice: [
        mcq('shape', 'Count bond pairs and lone pairs on the central atom.', [
          ['Shape of BeCl₂?', 'Linear', ['Bent', 'Trigonal planar', 'Tetrahedral'], '2 bond pairs, 0 lone pairs.', 'Two pairs point opposite ways: linear, 180°.'],
          ['Shape of BF₃?', 'Trigonal planar', ['Pyramidal', 'Linear', 'Tetrahedral'], '3 bond pairs, 0 lone pairs.', 'Three pairs spread in a plane at 120°.'],
          ['Shape of CH₄?', 'Tetrahedral', ['Square planar', 'Pyramidal', 'Bent'], '4 bond pairs, 0 lone pairs.', 'Four pairs point to the corners of a tetrahedron.'],
          ['Shape of NH₃?', 'Pyramidal', ['Trigonal planar', 'Tetrahedral', 'Linear'], '3 bond pairs, 1 lone pair.', 'The lone pair sits on top; the three H atoms form a pyramid base.'],
          ['Shape of H₂O?', 'Bent (V-shaped)', ['Linear', 'Pyramidal', 'Trigonal planar'], '2 bond pairs, 2 lone pairs.', 'Two lone pairs push the two O–H bonds into a V shape.'],
          ['Shape of CO₂?', 'Linear', ['Bent', 'Pyramidal', 'Tetrahedral'], 'Two double bonds, no lone pairs on C.', 'Each double bond acts as one region: two regions → linear.'],
        ]),
        mcq('angle', 'More lone pairs → smaller angle.', [
          ['Bond angle in CH₄?', '109°28′', ['104°31′', '107°48′', '120°'], 'Perfect tetrahedron.', 'No lone pairs → ideal tetrahedral angle.'],
          ['Bond angle in NH₃?', '107°48′', ['109°28′', '104°31′', '90°'], 'One lone pair.', 'One lone pair squeezes the angle a little.'],
          ['Bond angle in H₂O?', '104°31′', ['107°48′', '109°28′', '180°'], 'Two lone pairs.', 'Two lone pairs squeeze it further.'],
          ['Bond angle in BF₃?', '120°', ['109°28′', '180°', '90°'], 'Flat triangle.', '360° ÷ 3 = 120°.'],
          ['Bond angle in BeCl₂?', '180°', ['120°', '109°28′', '90°'], 'Straight line.', 'Linear molecule.'],
          ['Which repulsion is the strongest?', 'Lone pair – lone pair', ['Bond pair – bond pair', 'Lone pair – bond pair', 'All are equal'], 'Lone pairs spread out more.', 'lp–lp > lp–bp > bp–bp.'],
        ]),
        matchT('match', 'molecule to its shape', [
          ['BeCl₂', 'Linear'], ['BF₃', 'Trigonal planar'], ['CH₄', 'Tetrahedral'], ['NH₃', 'Pyramidal'], ['H₂O', 'Bent (V-shaped)'],
        ], ['Count the electron regions around the central atom.', 'Lone pairs are invisible in the shape but still push.'], 4, 2),
      ],
    },
    {
      id: 'ts10.ps.bond.hybrid', title: 'Valence bond theory and hybridisation', prereqs: ['ts10.ps.bond.vsepr', 'ts10.ps.atom.qn'],
      intro: [
        h('Bonds as overlapping orbitals'),
        photo('🪢', 'Two ropes tied together hold best where they overlap the most — covalent bonds are strongest where orbitals overlap the most.'),
        p('Valence bond theory says a covalent bond forms when a half-filled orbital of one atom overlaps a half-filled orbital of another, and the two electrons (of opposite spin) are shared in the overlap region. The greater the overlap, the stronger the bond.'),
        def('Sigma (σ) bond', 'A bond formed by head-on (end-to-end) overlap along the line joining the two nuclei: s–s (H₂), s–p (HCl), p–p (Cl₂). Every single bond is a σ bond.'),
        def('Pi (π) bond', 'A bond formed by sideways overlap of parallel p orbitals, above and below the line of the nuclei. Weaker than a σ bond. A double bond = 1σ + 1π; a triple bond = 1σ + 2π.'),
        h('Hybridisation'),
        p('Carbon (1s² 2s² 2p²) has only two unpaired electrons, yet in methane it makes four identical bonds at 109°28′. To explain this, one 2s electron is promoted to the empty 2p orbital (excited state: 2s¹ 2p³), and then the 2s and three 2p orbitals mix to form four identical new orbitals.'),
        def('Hybridisation', 'The mixing of atomic orbitals of nearly equal energy in an atom to form an equal number of new, identical orbitals (hybrid orbitals).'),
        p('sp³ (one s + three p): 4 orbitals, tetrahedral, 109°28′ — CH₄, also NH₃ and H₂O (with lone pairs). sp² (one s + two p): 3 orbitals, trigonal planar, 120° — BF₃, C₂H₄; the unused p orbital forms a π bond. sp (one s + one p): 2 orbitals, linear, 180° — BeCl₂, C₂H₂; two unused p orbitals form two π bonds.'),
        keys('Bond = overlap of half-filled orbitals; more overlap → stronger bond.', 'σ: head-on overlap; π: sideways overlap; single = σ, double = σ + π, triple = σ + 2π.', 'sp³ tetrahedral 109°28′; sp² planar 120°; sp linear 180°.', 'Hybridisation explains four equal bonds of carbon.'),
        remember('Count σ bonds = number of single-line connections between atoms; π bonds = extra lines in double/triple bonds.'),
      ],
      examples: [
        ex('Count the σ and π bonds in ethene, CH₂=CH₂.', ['4 C–H single bonds → 4σ', 'C=C double bond → 1σ + 1π', 'Total: 5σ and 1π'], '5 σ, 1 π'),
        ex('What is the hybridisation of B in BF₃?', ['B: 2s² 2p¹ → excited 2s¹ 2p²', '3 orbitals (1 s + 2 p) mix', 'Three sp² orbitals at 120°'], 'sp²'),
      ],
      practice: [
        tp('sigma-pi', (r) => {
          const pool: [string, number, number, string][] = [
            ['N₂ (N≡N)', 1, 2, 'Triple bond = 1σ + 2π.'], ['O₂ (O=O)', 1, 1, 'Double bond = 1σ + 1π.'], ['C₂H₄ (ethene)', 5, 1, '4 C–H σ + C=C (1σ + 1π).'],
            ['C₂H₂ (ethyne)', 3, 2, '2 C–H σ + C≡C (1σ + 2π).'], ['CO₂ (O=C=O)', 2, 2, 'Two double bonds: 2σ + 2π.'], ['C₂H₆ (ethane)', 7, 0, '6 C–H + 1 C–C, all single.'],
            ['HCN (H–C≡N)', 2, 2, 'H–C σ + C≡N (1σ + 2π).'], ['CH₄', 4, 0, 'Four single C–H bonds.'],
          ];
          const [m, s, pi, why] = r.pick(pool);
          const askPi = r.next() < 0.5;
          return numQ(`How many ${askPi ? 'π (pi)' : 'σ (sigma)'} bonds are there in ${m}?`, askPi ? pi : s, undefined,
            ['Every bond between two atoms has exactly one σ bond.', 'Extra bonds in a double or triple bond are π bonds.'], [why, `${askPi ? 'π' : 'σ'} bonds = ${askPi ? pi : s}`],
            [{ when: String(askPi ? s : pi), explain: `You counted ${askPi ? 'σ' : 'π'} bonds instead.` }]);
        }, 2),
        mcq('hyb', 'Count the regions (bonds + lone pairs) around the central atom.', [
          ['Hybridisation of C in CH₄?', 'sp³', ['sp²', 'sp', 'No hybridisation'], 'Four bonds, tetrahedral.', '1 s + 3 p → four sp³ orbitals.'],
          ['Hybridisation of Be in BeCl₂?', 'sp', ['sp²', 'sp³', 'dsp²'], 'Linear, 180°.', '1 s + 1 p → two sp orbitals.'],
          ['Hybridisation of B in BF₃?', 'sp²', ['sp', 'sp³', 'No hybridisation'], 'Trigonal planar.', '1 s + 2 p → three sp² orbitals.'],
          ['Hybridisation of each C in ethyne (C₂H₂)?', 'sp', ['sp²', 'sp³', 'sp³d'], 'Linear molecule with a triple bond.', 'Each C uses two sp orbitals and keeps two p orbitals for π bonds.'],
          ['Hybridisation of each C in ethene (C₂H₄)?', 'sp²', ['sp', 'sp³', 'dsp²'], 'Planar molecule, double bond.', 'Three sp² orbitals; one p orbital forms the π bond.'],
          ['Hybridisation of O in H₂O?', 'sp³', ['sp', 'sp²', 'No hybridisation'], '2 bonds + 2 lone pairs = 4 regions.', 'Four regions → sp³ (bent shape because two are lone pairs).'],
        ], 2),
        mcq('vbt', 'Head-on → σ; sideways → π.', [
          ['A covalent bond forms by overlap of…', 'Half-filled orbitals with opposite-spin electrons', ['Two full orbitals', 'Empty orbitals only', 'Nuclei'], 'Each atom gives one electron.', 'Two half-filled orbitals overlap and the electrons pair up.'],
          ['A π bond is formed by…', 'Sideways overlap of p orbitals', ['Head-on overlap of s orbitals', 'Transfer of electrons', 'Overlap of s and p head-on'], 'Parallel p orbitals.', 'π bonds come from side-by-side p overlap.'],
          ['Which is stronger?', 'σ bond', ['π bond', 'Both equal', 'Depends on colour'], 'Which has more overlap?', 'Head-on overlap is greater, so σ bonds are stronger.'],
          ['The bond in H₂ is formed by…', 's–s overlap', ['p–p sideways overlap', 's–p overlap', 'Ionic attraction'], 'H has only a 1s orbital.', 'Two 1s orbitals overlap head-on.'],
          ['The bond in HCl is formed by…', 's–p overlap', ['s–s overlap', 'p–p sideways overlap', 'd–p overlap'], 'H gives 1s; Cl gives 3p.', 'H 1s overlaps head-on with Cl 3p.'],
          ['A triple bond consists of…', '1 σ and 2 π bonds', ['3 σ bonds', '2 σ and 1 π bonds', '3 π bonds'], 'Only one bond can be head-on.', 'One σ plus two π bonds.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.bond.properties', title: 'Properties of ionic and covalent compounds', prereqs: ['ts10.ps.bond.ionic-covalent'],
      intro: [
        h('The bond decides the behaviour'),
        photo('🕯️', 'Candle wax (covalent) melts in a flame; common salt (ionic) stays solid even in a hot pan — the type of bond explains why.'),
        p('In an ionic compound, every ion is surrounded by oppositely charged ions in a giant lattice. Breaking it needs a lot of energy. In a covalent compound, the atoms inside each molecule are bonded strongly, but separate molecules attract each other only weakly.'),
        h('Ionic compounds'),
        p('Usually crystalline solids; hard but brittle. High melting and boiling points (NaCl melts at 801 °C). Mostly soluble in water, insoluble in kerosene or petrol. Conduct electricity when molten or dissolved (ions are free to move) but NOT as solids.'),
        h('Covalent compounds'),
        p('Often gases, liquids or soft solids (methane, water, sugar, wax). Low melting and boiling points. Usually insoluble in water but soluble in organic solvents (exceptions like sugar and alcohol dissolve in water). Generally do not conduct electricity, since they have no free ions. (Graphite is a special exception that conducts.)'),
        keys('Ionic: high m.p./b.p., soluble in water, conduct when molten or in solution.', 'Covalent: low m.p./b.p., mostly insoluble in water, poor conductors.', 'Reason: strong lattice of ions vs weak forces between molecules.'),
        remember('Solid NaCl does NOT conduct — its ions cannot move. Melt or dissolve it and it conducts.'),
      ],
      examples: [
        ex('Why does molten sodium chloride conduct electricity but solid sodium chloride does not?', ['In the solid, Na⁺ and Cl⁻ are locked in the lattice.', 'On melting, the ions become free to move.', 'Moving ions carry the current.'], 'Only free-moving ions carry current'),
        ex('Imran finds that a white solid melts at 186 °C and does not dissolve in water but dissolves in kerosene. What type of compound is it likely to be?', ['Low melting point', 'Insoluble in water, soluble in an organic solvent', 'These are covalent properties.'], 'Covalent'),
      ],
      practice: [
        tapT('ionic', 'Tap every property typical of IONIC compounds.', [
          ['High melting point', true], ['Soluble in water', true], ['Conduct electricity when molten', true], ['Hard, brittle crystals', true],
          ['Low boiling point', false], ['Conduct electricity as solids', false], ['Dissolve easily in petrol', false],
        ], ['Think of common salt.', 'Solid ionic crystals have ions fixed in place.'], 'Ionic compounds have high m.p., dissolve in water and conduct only when ions can move.'),
        mcq('which', 'Strong lattice of ions → ionic; separate weakly attracted molecules → covalent.', [
          ['Which compound has the highest melting point?', 'Magnesium oxide', ['Methane', 'Ethanol', 'Wax'], 'Ions with charges +2 and −2.', 'MgO is ionic with a very strong lattice.'],
          ['Solid sodium chloride does not conduct electricity because…', 'Its ions cannot move', ['It has no ions', 'It is covalent', 'It is a metal'], 'Ions are fixed in the lattice.', 'Ions must be free to move to carry current.'],
          ['Which is a covalent compound?', 'Glucose', ['Sodium chloride', 'Calcium oxide', 'Magnesium chloride'], 'Made only of non-metals.', 'Glucose (C, H, O) is covalent.'],
          ['Covalent compounds usually have low melting points because…', 'Forces between molecules are weak', ['Bonds inside molecules are weak', 'They contain ions', 'They are metals'], 'Melting separates molecules, not atoms.', 'Only the weak forces between molecules need to be overcome.'],
          ['Kerosene dissolves which of these?', 'Wax', ['Common salt', 'Washing soda', 'Copper sulphate'], 'Like dissolves like.', 'Covalent wax dissolves in the organic solvent kerosene.'],
          ['An aqueous solution of which substance conducts electricity?', 'Potassium chloride', ['Sugar', 'Alcohol', 'Urea'], 'Look for an ionic compound.', 'KCl releases K⁺ and Cl⁻ ions in water.'],
        ]),
        tapT('tap-ionic', 'Tap every compound held together by IONIC bonds.', [
          ['NaCl', true], ['MgO', true], ['CaCl₂', true], ['KBr', true], ['CH₄', false], ['H₂O', false], ['CO₂', false], ['NH₃', false],
        ], ['Does it contain a metal?', 'Metal + non-metal → ionic; only non-metals → covalent.'], 'Compounds of a metal with a non-metal (NaCl, MgO, CaCl₂, KBr) are ionic; CH₄, H₂O, CO₂, NH₃ are covalent.'),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 9 — Electric Current
// =====================================================================================
const RHO: [string, number][] = [['copper', 1.7], ['aluminium', 2.7], ['tungsten', 5.6], ['iron', 10], ['nichrome', 100], ['manganin', 44]]; // × 10⁻⁸ Ω m
const APPLIANCES: [string, number][] = [['LED bulb', 9], ['ceiling fan', 75], ['television', 120], ['refrigerator', 200], ['electric iron', 1000], ['geyser', 2000], ['air conditioner', 1500], ['mixer-grinder', 500], ['laptop charger', 60]];

const ch9: USpec = {
  id: 'ts10.ps.ch9', subject: 'physics', title: 'Electric Current', source: src(9),
  objectives: [
    {
      id: 'ts10.ps.current.basics', title: 'Electric current, potential difference and emf', prereqs: [],
      activities: ['lab:circuit'],
      intro: [
        h('What actually flows in a wire?'),
        photo('💡', 'Press a switch and the bulb glows almost instantly — yet the electrons in the wire move only a few millimetres per second!'),
        p('A metal wire is full of free electrons moving randomly in all directions. Connect a battery and every free electron gets a gentle push in one direction, so on average they drift slowly along the wire. Because the wire is already full of electrons, the push travels almost instantly — like water in a full pipe, which flows out the moment you open the tap.'),
        def('Electric current (I)', 'The rate of flow of electric charge through a cross-section of a conductor: I = Q/t. SI unit: ampere (A) = 1 coulomb per second.'),
        f('I = Q / t', 'current equals charge divided by time'),
        p('The charge of one electron is e = 1.6 × 10⁻¹⁹ C, so 1 C is the charge of about 6.25 × 10¹⁸ electrons. By convention, current is taken to flow from the positive terminal to the negative terminal outside the battery — opposite to the direction electrons actually move. Current is measured with an ammeter connected in SERIES.'),
        def('Drift velocity', 'The small average velocity with which free electrons move along a conductor when a potential difference is applied.'),
        h('Potential difference and emf'),
        p('Charges flow only if there is a difference in "electric pressure" between two points — like water flows only from a higher tank to a lower one. Work must be done to move charge against the electric force.'),
        def('Potential difference (V)', 'The work done to move a unit charge from one point to another in an electric field: V = W/Q. Unit: volt (V) = 1 joule per coulomb. Measured with a voltmeter connected in PARALLEL.'),
        f('V = W / Q', 'potential difference equals work done divided by charge'),
        def('Electromotive force (emf, ε)', 'The work done by the chemical (or other) force inside a battery to move a unit positive charge from its negative terminal to its positive terminal. Also measured in volts. A 1.5 V cell gives 1.5 J to every coulomb.'),
        xp({
          title: 'What if? Charge, time and current', formula: 'I = Q / t',
          res: ['I', 'Current', 'A', 'Q / t', 3],
          vars: [['Q', 'Charge passing', 'C', 1, 600, 1, 120], ['t', 'Time taken', 's', 1, 600, 1, 60]],
          notes: [
            ['Q', 'More charge through the wire in the same time means a bigger current.', 'Less charge in the same time means a smaller current.'],
            ['t', 'If the same charge takes longer to pass, the current is smaller (charge flows more slowly).', 'If the same charge passes in less time, the current is larger.'],
          ],
          mistakes: [['Using minutes instead of seconds', 'An ampere is a coulomb per SECOND. 120 C in 2 minutes is 120 ÷ 120 = 1 A, not 60 A.'], ['Writing I = Q × t', 'Current is a RATE — charge per unit time — so divide.']],
          real: 'A phone charging at 2 A pushes 7200 C of charge into the battery every hour.',
        }),
        xp({
          title: 'What if? Work done to move charge', formula: 'V = W / Q',
          res: ['V', 'Potential difference', 'V', 'W / Q', 2],
          vars: [['W', 'Work done', 'J', 1, 1000, 1, 60], ['Q', 'Charge moved', 'C', 1, 100, 1, 10]],
          notes: [
            ['W', 'More work for the same charge means a larger potential difference (a bigger "push").', 'Less work per charge means a smaller potential difference.'],
            ['Q', 'Spreading the same work over more charge means each coulomb gets less energy: lower V.', 'Less charge carrying the same work means more energy per coulomb: higher V.'],
          ],
          mistakes: [['Confusing V (volt, unit) with V (potential difference, quantity)', 'The quantity is written in italic V; its unit is the volt, V.'], ['Thinking current is "used up" in a bulb', 'Charge is not used up; it is the ENERGY carried per coulomb that is transferred.']],
          real: 'A 9 V battery gives 9 J of energy to every coulomb that passes through it.',
        }),
        keys('I = Q/t; 1 A = 1 C/s; e = 1.6 × 10⁻¹⁹ C.', 'V = W/Q; 1 V = 1 J/C.', 'Ammeter in series; voltmeter in parallel.', 'emf = work done by the source per unit charge.'),
        remember('Conventional current flows from + to − outside the cell; electrons flow the opposite way.'),
      ],
      examples: [
        ex('A charge of 300 C flows through a bulb in 5 minutes. Find the current.', ['t = 5 min = 300 s', 'I = Q/t = 300 ÷ 300', 'I = 1 A'], '1 A'),
        ex('How much work is done in moving 4 C of charge across a 12 V battery?', ['W = V × Q', 'W = 12 × 4', 'W = 48 J'], '48 J'),
        ex('How many electrons pass a point in a wire each second when the current is 0.8 A?', ['Q in 1 s = 0.8 C', 'n = Q/e = 0.8 ÷ 1.6 × 10⁻¹⁹', 'n = 5 × 10¹⁸'], '5 × 10¹⁸ electrons'),
      ],
      practice: [
        tp('i', (r) => {
          const I = r.pick([0.2, 0.5, 1, 1.5, 2, 2.5, 3, 4]);
          const mins = r.pick([1, 2, 5, 10]);
          const Q = rd(I * mins * 60, 3);
          if (r.next() < 0.5) return numQ(`${Q} C of charge flows through a heater coil in ${mins} minute${mins > 1 ? 's' : ''}. Find the current.`, I, 'A',
            ['Convert time to seconds.', `t = ${mins * 60} s; I = Q/t`], [`I = ${Q} ÷ ${mins * 60} = ${I} A`],
            [{ when: `${rd(Q / mins, 3)} A`, explain: 'Convert minutes to seconds first: 1 A = 1 C per second.' }]);
          return numQ(`A current of ${I} A flows for ${mins} minute${mins > 1 ? 's' : ''}. How much charge passes?`, Q, 'C',
            ['Q = I × t', `t = ${mins * 60} s`], [`Q = ${I} × ${mins * 60} = ${Q} C`],
            [{ when: `${rd(I * mins, 3)} C`, explain: 'Time must be in seconds.' }]);
        }),
        tp('v', (r) => {
          const V = r.pick([1.5, 3, 6, 9, 12, 24, 220]);
          const Q = r.pick([2, 4, 5, 10, 0.5, 20]);
          const W = rd(V * Q, 3);
          const ask = r.pick(['V', 'W'] as const);
          if (ask === 'V') return numQ(`${W} J of work is done in moving ${Q} C of charge between two points. Find the potential difference.`, V, 'V', ['V = W/Q', 'Volt = joule per coulomb.'], [`V = ${W} ÷ ${Q} = ${V} V`], [{ when: `${rd(W * Q, 3)} V`, explain: 'Divide work by charge: V = W/Q.' }]);
          return numQ(`How much work is done in moving ${Q} C of charge through a potential difference of ${V} V?`, W, 'J', ['W = V × Q', 'Answer in joules.'], [`W = ${V} × ${Q} = ${W} J`]);
        }),
        tp('electrons', (r) => {
          const I = r.pick([0.16, 0.32, 0.8, 1.6, 0.4, 3.2, 0.48]);
          const n = sig(I / 1.6e-19, 6);
          return numQ(`A current of ${I} A flows in a wire. How many electrons pass a point each second? (e = 1.6 × 10⁻¹⁹ C; type like 5e18)`, n, undefined,
            ['Charge per second = current.', 'n = Q ÷ e'], [`Q = ${I} C each second`, `n = ${I} ÷ 1.6 × 10⁻¹⁹ = ${sci(n)}`], [], 0.01);
        }, 2),
        mcq('concept', 'Series for current, parallel for voltage.', [
          ['An ammeter is connected…', 'In series with the component', ['In parallel with the component', 'Across the battery only', 'Anywhere'], 'All the current must pass through it.', 'An ammeter must carry the same current, so it goes in series.'],
          ['A voltmeter is connected…', 'In parallel across the component', ['In series', 'Only to the battery', 'Never in a circuit'], 'It compares two points.', 'Potential difference is measured across two points, so in parallel.'],
          ['1 volt is equal to…', '1 joule per coulomb', ['1 coulomb per second', '1 ampere per ohm', '1 watt per second'], 'V = W/Q', 'One joule of work per coulomb of charge.'],
          ['1 ampere is equal to…', '1 coulomb per second', ['1 joule per coulomb', '1 volt per second', '1 ohm per volt'], 'I = Q/t', 'One coulomb flowing each second.'],
          ['The direction of conventional current outside a cell is…', 'From positive to negative terminal', ['From negative to positive terminal', 'The same as electron flow', 'Undefined'], 'Opposite to electrons.', 'By convention current flows + to − in the external circuit.'],
          ['The emf of a cell is…', 'Work done per unit charge by the cell in moving charge through it', ['A force in newtons', 'The current it supplies', 'The resistance of the cell'], 'It is measured in volts despite its name.', 'emf is energy per unit charge supplied by the source.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.current.ohm', title: 'Ohm\'s law and factors affecting resistance', prereqs: ['ts10.ps.current.basics'],
      activities: ['lab:circuit', 'game:circuits'],
      intro: [
        h('Why does a thin long wire get hot?'),
        photo('🔥', 'The glowing coil in an electric heater is made of a thin, long nichrome wire — chosen because it resists the current strongly.'),
        p('Connect a wire to 1, 2, 3 and 4 cells and measure the current each time. You will find that doubling the voltage doubles the current. The ratio V/I stays the same for that wire (at a fixed temperature). This constant ratio is the resistance.'),
        def('Ohm\'s law', 'At constant temperature, the potential difference across a conductor is directly proportional to the current through it: V ∝ I, so V = IR.'),
        def('Resistance (R)', 'The opposition offered by a conductor to the flow of current: R = V/I. Unit: ohm (Ω) = 1 volt per ampere.'),
        f('V = I R', 'V equals I times R'),
        xp({
          title: 'What if? Play with Ohm\'s law', formula: 'I = V / R',
          res: ['I', 'Current', 'A', 'V / R', 3],
          vars: [['V', 'Potential difference', 'V', 1, 24, 0.5, 6], ['R', 'Resistance', 'Ω', 1, 100, 1, 12]],
          notes: [
            ['V', 'A bigger push (more cells) drives more charge each second: current rises in proportion.', 'A smaller push drives less current.'],
            ['R', 'More resistance (longer or thinner wire) opposes the flow: current falls — double R, half the current.', 'Less resistance lets more current flow — too little can overheat a circuit.'],
          ],
          mistakes: [['Writing I = V × R', 'Current falls when resistance rises, so R must divide: I = V/R.'], ['Not converting kΩ or mA', '1 kΩ = 1000 Ω and 1 mA = 0.001 A before substituting.'], ['Applying Ohm\'s law to a filament as it heats up', 'R of a bulb filament increases with temperature, so V/I is not constant for it.']],
          real: 'An iron of 44 Ω on 220 V draws 5 A.',
        }),
        h('What decides resistance?'),
        p('1. Length (L): a longer wire has more resistance — R ∝ L. 2. Area of cross-section (A): a thicker wire has less resistance — R ∝ 1/A. 3. Material: each material has its own resistivity ρ. 4. Temperature: for metals, resistance increases as temperature rises.'),
        f('R = ρ L / A', 'R equals rho L over A'),
        def('Resistivity (ρ)', 'The resistance of a conductor of unit length and unit area of cross-section. Unit: ohm metre (Ω m). It depends only on the material and temperature, not on the shape.'),
        p('Copper (1.7 × 10⁻⁸ Ω m) and aluminium (2.7 × 10⁻⁸) are used for connecting wires. Nichrome (about 100 × 10⁻⁸) and tungsten are used where heat or light is wanted. Glass and rubber have resistivities around 10¹² Ω m or more — insulators.'),
        xp({
          title: 'What if? Design a heater wire', formula: 'R = ρ L / A',
          res: ['R', 'Resistance', 'Ω', 'ρ * L / (A * 100)', 2],
          vars: [['ρ', 'Resistivity (× 10⁻⁸ Ω m)', '', 1, 120, 1, 100], ['L', 'Length', 'm', 0.5, 20, 0.5, 2], ['A', 'Area of cross-section', 'mm²', 0.05, 2, 0.05, 0.5]],
          notes: [
            ['ρ', 'A material with higher resistivity (like nichrome) gives far more resistance — ideal for heaters.', 'A low-resistivity material like copper gives very little resistance — ideal for connecting wires.'],
            ['L', 'Doubling the length doubles the resistance: the charges travel through twice as much obstacle.', 'Halving the length halves the resistance.'],
            ['A', 'A thicker wire gives more lanes for charge to flow: resistance falls (double A, half R).', 'A thinner wire squeezes the flow: resistance rises. Halving the radius makes the area 1/4, so R becomes 4 times.'],
          ],
          mistakes: [['Thinking resistivity changes when the wire is cut', 'ρ is a property of the material. Cutting changes R (through L), not ρ.'], ['Forgetting that area depends on radius squared', 'A = πr². Halving the diameter makes A one quarter, so R becomes 4 times, not 2 times.'], ['Mixing mm² and m²', '1 mm² = 10⁻⁶ m². Convert before using R = ρL/A.']],
          real: 'Overhead power lines are thick aluminium cables: a large A keeps R low over long distances.',
        }),
        keys('V = IR at constant temperature (Ohm\'s law).', 'R ∝ L, R ∝ 1/A, R depends on material and temperature.', 'R = ρL/A; ρ in Ω m depends only on material and temperature.', 'Metals: R rises with temperature.'),
        remember('Stretching a wire to double its length also halves its area, so its resistance becomes FOUR times.'),
      ],
      examples: [
        ex('An electric iron draws 4 A on a 220 V supply. Find its resistance.', ['R = V/I', 'R = 220 ÷ 4', 'R = 55 Ω'], '55 Ω'),
        ex('Find the resistance of a 2 m nichrome wire (ρ = 1.0 × 10⁻⁶ Ω m) of cross-section 0.5 mm².', ['A = 0.5 mm² = 0.5 × 10⁻⁶ m²', 'R = ρL/A = 1.0 × 10⁻⁶ × 2 ÷ (0.5 × 10⁻⁶)', 'R = 4 Ω'], '4 Ω'),
        ex('A wire of resistance 5 Ω is stretched to twice its length (volume unchanged). New resistance?', ['L becomes 2L', 'Volume fixed → A becomes A/2', 'R′ = ρ(2L)/(A/2) = 4ρL/A = 4 × 5'], '20 Ω'),
      ],
      practice: [
        tp('ohm', (r) => {
          const ask = r.pick(['I', 'V', 'R'] as const);
          const R = r.pick([2, 4, 5, 8, 10, 12, 20, 22, 44, 55]);
          const I = r.pick([0.25, 0.5, 1, 1.5, 2, 4, 5]);
          const V = rd(I * R, 3);
          const thing = r.pick(['a torch bulb', 'a heater coil', 'a resistor', 'a toaster element', 'an electric kettle element']);
          if (ask === 'I') return numQ(`A potential difference of ${V} V is applied across ${thing} of resistance ${R} Ω. Find the current.`, I, 'A', ['V = IR → I = V/R', 'Give the unit A (or mA).'], [`I = ${V} ÷ ${R} = ${I} A`], [{ when: `${rd(V * R, 3)} A`, explain: 'You multiplied. Current = voltage ÷ resistance.' }]);
          if (ask === 'V') return numQ(`A current of ${I} A flows through ${thing} of resistance ${R} Ω. Find the potential difference across it.`, V, 'V', ['V = IR', 'Answer in volts.'], [`V = ${I} × ${R} = ${V} V`]);
          return numQ(`${thing[0].toUpperCase() + thing.slice(1)} draws ${I} A from a ${V} V supply. Find its resistance.`, R, 'Ω', ['R = V/I', 'Resistance is in ohms (Ω).'], [`R = ${V} ÷ ${I} = ${R} Ω`], [{ when: `${rd(I / V, 4)} Ω`, explain: 'R = V ÷ I, not I ÷ V.' }]);
        }),
        tp('rho', (r) => {
          const [mat, rho] = r.pick(RHO);
          const L = r.pick([1, 2, 5, 10, 20, 50]);
          const A = r.pick([0.1, 0.2, 0.5, 1, 2]);
          const R = rd((rho * L) / (A * 100), 4);
          return numQ(`Find the resistance of ${/^[aeiou]/.test(mat) ? 'an' : 'a'} ${mat} wire of length ${L} m and cross-sectional area ${A} mm². (ρ = ${rho} × 10⁻⁸ Ω m)`, R, 'Ω',
            ['R = ρL/A', `Convert A: ${A} mm² = ${A} × 10⁻⁶ m².`],
            [`R = ${rho} × 10⁻⁸ × ${L} ÷ (${A} × 10⁻⁶)`, `R = ${R} Ω`],
            [{ when: `${rd((rho * L) / A, 4)} Ω`, explain: 'Convert mm² to m² (× 10⁻⁶) and keep the 10⁻⁸ of ρ: together they give a factor 1/100.' }], 0.01);
        }, 2),
        tp('scale', (r) => {
          const R0 = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
          const cases: [string, number, string][] = [
            ['its length is doubled (same thickness)', 2, 'R ∝ L, so R doubles.'],
            ['its length is halved (same thickness)', 0.5, 'R ∝ L, so R halves.'],
            ['its area of cross-section is doubled (same length)', 0.5, 'R ∝ 1/A, so R halves.'],
            ['its radius is halved (same length)', 4, 'A ∝ r²: half the radius gives A/4, so R becomes 4 times.'],
            ['it is stretched to twice its length (volume unchanged)', 4, 'L doubles and A halves: R × 2 × 2 = 4R.'],
            ['its diameter is doubled (same length)', 0.25, 'A becomes 4 times, so R becomes 1/4.'],
            ['it is replaced by a wire of the same material, three times as long', 3, 'R ∝ L.'],
          ];
          const [what, k, why] = r.pick(cases);
          return numQ(`A wire has a resistance of ${R0} Ω. What is its new resistance if ${what}?`, rd(R0 * k, 3), 'Ω', ['Use R = ρL/A.', 'Area A = πr², so it depends on the square of the radius.'], [why, `New R = ${rd(R0 * k, 3)} Ω`], [], 0.01);
        }, 2),
        mcq('concept', 'R = ρL/A. Resistivity belongs to the material.', [
          ['Ohm\'s law holds only when the…', 'Temperature stays constant', ['Current is zero', 'Wire is copper', 'Voltage is 220 V'], 'Heating changes resistance.', 'Ohm\'s law assumes physical conditions (temperature) are constant.'],
          ['The SI unit of resistivity is…', 'Ohm metre (Ω m)', ['Ohm (Ω)', 'Ohm per metre', 'Volt ampere'], 'ρ = RA/L', 'Ω × m² ÷ m = Ω m.'],
          ['Which material is best for an electric heater coil?', 'Nichrome', ['Copper', 'Silver', 'Aluminium'], 'High resistivity and high melting point.', 'Nichrome has high resistivity and does not oxidise easily when hot.'],
          ['Why are connecting wires made of copper?', 'Low resistivity', ['High resistivity', 'It is cheap and brittle', 'It is magnetic'], 'We want little energy lost in wires.', 'Low resistivity means little heating in the wires.'],
          ['If a wire is cut into two equal halves, the resistivity of each half…', 'Stays the same', ['Halves', 'Doubles', 'Becomes four times'], 'Resistivity depends on material only.', 'ρ does not depend on length; only R changes.'],
          ['For a metal, as temperature increases, resistance…', 'Increases', ['Decreases', 'Stays the same', 'Becomes zero'], 'Atoms vibrate more.', 'More vibration means more collisions for drifting electrons.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.current.circuits', title: 'Series and parallel circuits; Kirchhoff\'s laws', prereqs: ['ts10.ps.current.ohm'],
      activities: ['lab:circuit', 'game:circuits'],
      intro: [
        h('One path or many?'),
        photo('🏠', 'At home, switching off the fan does not switch off the lights. The appliances are connected in parallel.'),
        h('Resistors in series'),
        p('Resistors joined end to end form a single path, so the SAME current flows through each. The battery\'s voltage is shared: V = V₁ + V₂ + V₃. Since V = IR for each, the total resistance is the sum.'),
        f('Series: R = R₁ + R₂ + R₃'),
        p('In series, if one bulb fuses the path breaks and all go off (like old serial lights). Total resistance is always bigger than the largest resistor.'),
        h('Resistors in parallel'),
        p('Resistors joined across the same two points each get the SAME voltage, and the current divides: I = I₁ + I₂ + I₃. Since I = V/R for each:'),
        f('Parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃;  for two: R = R₁R₂/(R₁ + R₂)'),
        p('The total resistance is LESS than the smallest resistor — adding more paths makes it easier for current to flow. Each appliance can be switched on or off independently, which is why house wiring is parallel.'),
        xp({
          title: 'What if? Two resistors in parallel', formula: 'R = R₁R₂ / (R₁ + R₂)',
          res: ['R', 'Equivalent resistance', 'Ω', 'R1 * R2 / (R1 + R2)', 2],
          vars: [['R1', 'First resistor', 'Ω', 1, 100, 1, 6], ['R2', 'Second resistor', 'Ω', 1, 100, 1, 3]],
          notes: [
            ['R1', 'Increasing one resistor raises the total a little, but it always stays below the smaller resistor.', 'Lowering one resistor pulls the total down — a very small resistor in parallel takes almost all the current.'],
            ['R2', 'Same effect: the total creeps up but can never exceed the smaller of the two.', 'A smaller R₂ drags the total down sharply.'],
          ],
          mistakes: [['Adding resistances for parallel', 'R₁ + R₂ is the SERIES rule. In parallel the total must be smaller than each.'], ['Forgetting to flip 1/R', 'If 1/R = 1/2, then R = 2 Ω, not 0.5 Ω.']],
          real: 'Two identical 100 Ω bulbs in parallel give 50 Ω total — so the house draws twice the current.',
        }),
        h('Kirchhoff\'s laws — rules for any circuit'),
        def('Junction law (Kirchhoff\'s first law)', 'At any junction, the total current entering equals the total current leaving. Charge is conserved — it cannot pile up at a point.'),
        def('Loop law (Kirchhoff\'s second law)', 'Around any closed loop, the sum of the potential rises (emfs) equals the sum of the potential drops (IR): ΣV = 0. Energy is conserved.'),
        p('Example: 5 A enters a junction and splits into two branches. If one branch carries 2 A, the other must carry 3 A. In a loop with a 12 V battery and two resistors in series, if one resistor has 8 V across it, the other must have 4 V.'),
        keys('Series: same current, voltages add, R = R₁ + R₂ + ….', 'Parallel: same voltage, currents add, 1/R = 1/R₁ + 1/R₂ + ….', 'Junction law: current in = current out.', 'Loop law: sum of emfs = sum of IR drops.'),
        remember('Series total > largest resistor. Parallel total < smallest resistor. Use this to check your answer.'),
      ],
      examples: [
        ex('Resistors of 5 Ω, 10 Ω and 15 Ω are connected in series to a 12 V battery. Find the current and the voltage across the 10 Ω resistor.', ['R = 5 + 10 + 15 = 30 Ω', 'I = V/R = 12 ÷ 30 = 0.4 A', 'V across 10 Ω = 0.4 × 10 = 4 V'], 'I = 0.4 A; 4 V across 10 Ω'),
        ex('Find the equivalent resistance of 12 Ω and 6 Ω in parallel and the total current from 12 V.', ['R = (12 × 6)/(12 + 6) = 72/18 = 4 Ω', 'I = 12 ÷ 4 = 3 A', 'Check: 12/12 = 1 A and 12/6 = 2 A; 1 + 2 = 3 A ✓'], 'R = 4 Ω, I = 3 A'),
      ],
      practice: [
        tp('series', (r) => {
          const a = r.int(2, 12), b = r.int(2, 12), c = r.int(1, 10);
          const V = r.pick([6, 12, 24, 3, 9]);
          const R = a + b + c;
          if (r.next() < 0.5) return numQ(`Find the equivalent resistance of ${a} Ω, ${b} Ω and ${c} Ω connected in series.`, R, 'Ω', ['In series, resistances add.'], [`R = ${a} + ${b} + ${c} = ${R} Ω`], [{ when: `${rd(1 / (1 / a + 1 / b + 1 / c), 2)} Ω`, explain: 'That is the parallel rule. In series, simply add.' }]);
          return numQ(`${a} Ω, ${b} Ω and ${c} Ω are connected in series to a ${V} V battery. Find the current in the circuit.`, rd(V / R, 4), 'A', ['First find total R (add).', 'Then I = V/R.'], [`R = ${R} Ω`, `I = ${V} ÷ ${R} = ${rd(V / R, 4)} A`], [], 0.01);
        }),
        tp('parallel', (r) => {
          const pairs: [number, number][] = [[6, 3], [12, 4], [10, 10], [20, 5], [12, 6], [30, 15], [8, 8], [4, 12], [6, 12], [18, 9], [60, 30], [40, 10]];
          const [a, b] = r.pick(pairs);
          const R = rd((a * b) / (a + b), 3);
          return numQ(`Find the equivalent resistance of ${a} Ω and ${b} Ω connected in parallel.`, R, 'Ω', ['1/R = 1/R₁ + 1/R₂', 'For two: R = R₁R₂/(R₁ + R₂). Check: R must be less than both.'], [`R = (${a} × ${b}) ÷ (${a} + ${b}) = ${R} Ω`],
            [{ when: `${a + b} Ω`, explain: 'Adding is for series. In parallel the total is smaller than either resistor.' }, { when: `${rd(1 / R, 4)} Ω`, explain: 'You found 1/R. Take the reciprocal to get R.' }], 0.01);
        }, 2),
        tp('kirchhoff', (r) => {
          if (r.next() < 0.5) {
            const i1 = r.pick([1, 1.5, 2, 2.5, 3]), i2 = r.pick([0.5, 1, 2, 4]), out1 = r.pick([0.5, 1, 1.5, 2]);
            const out2 = rd(i1 + i2 - out1, 3);
            return numQ(`At a junction, currents of ${i1} A and ${i2} A flow in. One wire carries ${out1} A out. What current flows out through the other wire?`, out2, 'A',
              ['Junction law: total in = total out.', `In = ${i1} + ${i2}`], [`In = ${rd(i1 + i2, 3)} A`, `Other out = ${rd(i1 + i2, 3)} − ${out1} = ${out2} A`]);
          }
          const E = r.pick([6, 9, 12, 24]); const R1 = r.pick([2, 3, 4, 6]); const R2 = r.pick([2, 4, 6, 8]);
          const I = E / (R1 + R2);
          return numQ(`A ${E} V battery (no internal resistance) is connected to ${R1} Ω and ${R2} Ω in series. Using the loop law, find the potential difference across the ${R2} Ω resistor.`, rd(I * R2, 3), 'V',
            ['First find I = E / (R₁ + R₂).', 'Loop law: E = IR₁ + IR₂, so V₂ = IR₂.'], [`I = ${E} ÷ ${R1 + R2} = ${rd(I, 4)} A`, `V₂ = ${rd(I, 4)} × ${R2} = ${rd(I * R2, 3)} V`, `Check: ${rd(I * R1, 3)} + ${rd(I * R2, 3)} = ${E} V`], [], 0.01);
        }, 2),
        mcq('concept', 'Same current → series; same voltage → parallel.', [
          ['In a series circuit, which quantity is the same in every resistor?', 'Current', ['Voltage', 'Power', 'Resistance'], 'One path only.', 'With one path, the same current flows everywhere.'],
          ['In a parallel circuit, which quantity is the same across every resistor?', 'Potential difference', ['Current', 'Resistance', 'Power'], 'All connected across the same two points.', 'Every branch has the full voltage.'],
          ['Household appliances are connected in parallel because…', 'Each gets full voltage and can be switched separately', ['It uses less wire', 'It increases resistance', 'Current is the same in all'], 'Think of switching off one fan.', 'Parallel gives the same voltage and independent control.'],
          ['Kirchhoff\'s junction law is based on conservation of…', 'Charge', ['Energy', 'Mass', 'Momentum'], 'Current in = current out.', 'Charge cannot be created or destroyed at a junction.'],
          ['Kirchhoff\'s loop law is based on conservation of…', 'Energy', ['Charge', 'Mass', 'Momentum'], 'Potential = energy per charge.', 'Energy gained from sources equals energy lost in resistors around a loop.'],
          ['Three 6 Ω resistors in parallel have an equivalent resistance of…', '2 Ω', ['18 Ω', '6 Ω', '3 Ω'], '1/R = 3/6', '1/R = 1/6 + 1/6 + 1/6 = 1/2, so R = 2 Ω.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.current.power', title: 'Electric power, energy bills, heating effect, shock and overload', prereqs: ['ts10.ps.current.ohm'],
      activities: ['lab:circuit'],
      intro: [
        h('Watts, units and your electricity bill'),
        photo('💡', 'A 9 W LED bulb gives as much light as an old 60 W filament bulb — and costs far less to run.'),
        p('Every time charge moves through a potential difference, energy is transferred: W = VQ = VIt. The rate at which electrical energy is used is the power.'),
        def('Electric power (P)', 'The rate at which electrical energy is consumed or converted: P = W/t = VI. Unit: watt (W) = 1 joule per second. 1 kW = 1000 W.'),
        f('P = V I = I² R = V² / R'),
        xp({
          title: 'What if? Power of an appliance', formula: 'P = V × I',
          res: ['P', 'Power', 'W', 'V * I', 1],
          vars: [['V', 'Supply voltage', 'V', 5, 240, 5, 220], ['I', 'Current drawn', 'A', 0.1, 10, 0.1, 2]],
          notes: [['V', 'A higher supply voltage with the same current delivers more energy every second.', 'A lower voltage delivers less power — a low-voltage supply makes heaters weak.'], ['I', 'Drawing more current at the same voltage means more power — and thicker wiring is needed.', 'Less current means less power.']],
          mistakes: [['Using P = V/I', 'Power is voltage TIMES current. V/I is resistance.'], ['Confusing kW and kWh', 'kW is power (rate); kWh is energy (power × time).']],
          real: 'A 220 V geyser drawing about 9 A uses about 2 kW.',
        }),
        h('Commercial unit of energy'),
        p('Electricity boards charge for energy in "units". One unit = 1 kilowatt-hour (kWh) = energy used by a 1 kW appliance in 1 hour = 1000 W × 3600 s = 3.6 × 10⁶ J.'),
        f('Energy (kWh) = Power (kW) × time (h);  Cost = units × rate'),
        xp({
          title: 'What if? Monthly bill for one appliance', formula: 'Cost = (P ÷ 1000) × hours/day × days × rate',
          res: ['C', 'Monthly cost', '₹', 'P / 1000 * h * 30 * k', 2],
          vars: [['P', 'Power rating', 'W', 5, 2500, 5, 75], ['h', 'Hours used per day', 'h', 0.5, 24, 0.5, 8], ['k', 'Rate per unit', '₹', 1, 12, 0.5, 6]],
          notes: [
            ['P', 'A higher wattage appliance used for the same time costs proportionally more — a 2000 W geyser costs as much per hour as 26 fans.', 'Switching to lower-wattage appliances (LEDs, BLDC fans) cuts the bill in proportion.'],
            ['h', 'More hours of use means more units and a higher bill.', 'Switching off when not needed directly saves money.'],
            ['k', 'A higher tariff slab increases the cost for the same energy.', 'A lower rate reduces the bill for the same use.'],
          ],
          mistakes: [['Forgetting to divide watts by 1000', 'A unit is a kWh, so power must be in kW. 100 W for 10 h is 1 unit, not 1000 units.'], ['Using minutes for time', 'kWh needs hours: 30 minutes = 0.5 h.']],
          real: 'A 75 W fan used 8 h a day for 30 days uses 18 units; at ₹6 per unit that is ₹108.',
        }),
        h('Heating effect of current (Joule\'s law)'),
        p('When current flows through a resistor, electrons keep colliding with the atoms and give them energy — the resistor heats up. The heat produced is:'),
        f('H = I² R t', 'heat equals I squared R t'),
        xp({
          title: 'What if? Heat produced in a wire', formula: 'H = I² R t',
          res: ['H', 'Heat produced', 'J', 'I ^ 2 * R * t', 0],
          vars: [['I', 'Current', 'A', 0.5, 10, 0.5, 2], ['R', 'Resistance', 'Ω', 1, 100, 1, 20], ['t', 'Time', 's', 1, 600, 1, 60]],
          notes: [
            ['I', 'Heat depends on the SQUARE of current: double the current and the heat becomes 4 times — that is why overloading melts wires.', 'Halving the current cuts heat to a quarter.'],
            ['R', 'For the same current, more resistance produces more heat — the heater coil glows while the copper leads stay cool.', 'Low resistance (copper wires) produces little heat for the same current.'],
            ['t', 'Heat keeps adding up with time.', 'Shorter use, less heat.'],
          ],
          mistakes: [['Using H = IRt', 'Current appears squared: H = I²Rt. Doubling I gives 4 times the heat, not 2.'], ['Using minutes', 'Time must be in seconds for joules.']],
          real: 'Fuses, electric irons, toasters, kettles and bulb filaments all use the heating effect.',
        }),
        h('Safety: electric shock and overload'),
        p('Electric shock: current through the body can disturb the heart and muscles. Dry skin has a high resistance (around 100 000 Ω), but wet skin can drop to around 1000 Ω, letting a dangerous current flow from a 220 V supply. Never touch switches with wet hands. A bird sitting on a single wire is safe because both its feet are at the same potential — no potential difference, no current.'),
        p('Overload: when too many appliances are run from one socket, or a short circuit occurs (live and neutral wires touch), the total current becomes very large. By H = I²Rt the wires overheat and can start a fire. A fuse (a wire of low melting point, connected in series in the live wire) melts and breaks the circuit when the current exceeds its rating. MCBs (miniature circuit breakers) do the same job and can be reset. Earthing carries leakage current safely to the ground.'),
        keys('P = VI = I²R = V²/R; 1 kWh = 3.6 × 10⁶ J = 1 unit.', 'Cost = kW × hours × rate.', 'H = I²Rt: heat ∝ square of current.', 'Fuse in series in the live wire melts on overload; earthing and MCBs protect us.'),
        remember('A fuse rating should be just above the normal current: I = P/V. For a 1000 W iron on 220 V, I ≈ 4.5 A, so use a 5 A fuse.'),
      ],
      examples: [
        ex('A 220 V electric kettle draws 5 A. Find its power and the heat produced in 2 minutes.', ['P = VI = 220 × 5 = 1100 W', 'H = P × t = 1100 × 120', 'H = 132 000 J'], '1100 W; 1.32 × 10⁵ J'),
        ex('Sita\'s family in Karimnagar runs four 10 W LED bulbs for 6 hours and a 75 W fan for 10 hours every day. Find the units used in 30 days and the cost at ₹5 per unit.', ['Bulbs: 4 × 10 W × 6 h = 240 Wh/day', 'Fan: 75 W × 10 h = 750 Wh/day', 'Total = 990 Wh/day = 0.99 kWh/day', '30 days → 29.7 units', 'Cost = 29.7 × 5 = ₹148.50'], '29.7 units, ₹148.50'),
        ex('Which fuse (1 A, 3 A, 5 A, 10 A) suits a 2000 W geyser on 220 V?', ['I = P/V = 2000 ÷ 220 ≈ 9.1 A', 'Choose the rating just above 9.1 A'], '10 A fuse'),
      ],
      practice: [
        tp('power', (r) => {
          const V = r.pick([220, 230, 12, 6, 240]);
          const I = r.pick([0.5, 1, 2, 4, 5, 0.25, 8]);
          if (r.next() < 0.5) return numQ(`An appliance on ${V} V draws a current of ${I} A. What is its power?`, rd(V * I, 3), 'W', ['P = V × I', 'Power is in watts (W).'], [`P = ${V} × ${I} = ${rd(V * I, 3)} W`], [{ when: `${rd(V / I, 3)} W`, explain: 'P = V × I. V ÷ I gives resistance, not power.' }]);
          const R = r.pick([10, 20, 44, 50, 100]);
          return numQ(`A current of ${I} A flows through a ${R} Ω resistor. What power is dissipated?`, rd(I * I * R, 3), 'W', ['P = I²R', 'Square the current first.'], [`P = ${I}² × ${R} = ${rd(I * I * R, 3)} W`], [{ when: `${rd(I * R, 3)} W`, explain: 'Square the current: P = I²R.' }]);
        }),
        tp('bill', (r) => {
          const [app, W] = r.pick(APPLIANCES);
          const hrs = r.pick([1, 2, 4, 5, 6, 8, 10]);
          const rate = r.pick([4, 5, 6, 7, 8]);
          const kwh = (W / 1000) * hrs * 30;
          return {
            ...numQ(`A ${W} W ${app} is used ${hrs} hour${hrs > 1 ? 's' : ''} a day for 30 days in a house in ${r.pick(PLACES)}. At ₹${rate} per unit, what is the cost?`, rd(kwh * rate, 2), '₹',
              ['Convert W to kW (÷ 1000).', 'Units = kW × hours per day × days; cost = units × rate.'],
              [`Units = ${W / 1000} × ${hrs} × 30 = ${rd(kwh, 3)} kWh`, `Cost = ${rd(kwh, 3)} × ₹${rate} = ${inr(rd(kwh * rate, 2))}`],
              [{ when: `₹${rd(W * hrs * 30 * rate, 2)}`, explain: 'One unit is 1 kWh — convert watts to kilowatts first.' }], 0.005),
            steps: [{ prompt: L('Energy used in kWh (units)'), answer: approx(rd(kwh, 3), 0.005) }, { prompt: L('Cost in ₹'), answer: approx(rd(kwh * rate, 2), 0.005, '₹') }],
          };
        }, 2),
        tp('heat', (r) => {
          const I = r.pick([1, 2, 3, 4, 5, 0.5]);
          const R = r.pick([5, 10, 20, 25, 50]);
          const t = r.pick([10, 30, 60, 120, 300]);
          const H = I * I * R * t;
          return numQ(`A current of ${I} A flows through a ${R} Ω coil for ${t >= 60 ? `${t / 60} minute${t > 60 ? 's' : ''}` : `${t} s`}. How much heat is produced?`, H, 'J',
            ['H = I²Rt', 'Time in seconds.'], [`t = ${t} s`, `H = ${I}² × ${R} × ${t} = ${H} J`],
            [{ when: `${I * R * t} J`, explain: 'The current must be squared: H = I²Rt.' }, ...(t >= 60 ? [{ when: `${I * I * R * (t / 60)} J`, explain: 'Convert minutes to seconds.' }] : [])]);
        }, 2),
        mcq('safety', 'Find the current with I = P/V, then choose the next higher fuse.', [
          ['A 1000 W iron runs on 220 V. Which fuse is best?', '5 A', ['1 A', '3 A', '15 A'], 'I = 1000/220 ≈ 4.5 A.', 'The fuse should be just above the normal current: 5 A.'],
          ['A 2200 W geyser on 220 V needs a fuse of…', '15 A', ['5 A', '3 A', '1 A'], 'I = 2200/220 = 10 A.', 'Normal current is 10 A, so 15 A (next standard above) is safe; a smaller fuse would keep blowing.'],
          ['A fuse is connected…', 'In series in the live wire', ['In parallel with the appliance', 'In the earth wire', 'In the neutral wire only'], 'It must break the live connection.', 'In series in the live wire, so melting disconnects the supply.'],
          ['A fuse wire should have…', 'A low melting point', ['A very high melting point', 'Zero resistance', 'A large thickness'], 'It must melt first.', 'It melts quickly when the current is too large.'],
          ['A bird sitting on a single live wire is safe because…', 'There is no potential difference across its body', ['Birds are insulators', 'The wire has no current', 'Its feet are wet'], 'Both feet touch the same wire.', 'No potential difference → no current through the bird.'],
          ['Overloading a socket is dangerous because…', 'The large current overheats the wires', ['The voltage becomes zero', 'Appliances stop working', 'It reduces the bill'], 'H = I²Rt.', 'Heat rises with the square of current and can start a fire.'],
          ['Why is it dangerous to touch a switch with wet hands?', 'Wet skin has low resistance so a large current can flow', ['Water increases the voltage', 'Water is an insulator', 'Switches attract water'], 'I = V/R', 'Lower body resistance lets a much larger current flow.'],
        ]),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 10 — Electromagnetism
// =====================================================================================
const ch10: USpec = {
  id: 'ts10.ps.ch10', subject: 'physics', title: 'Electromagnetism', source: src(10),
  objectives: [
    {
      id: 'ts10.ps.em.field', title: 'Oersted\'s experiment, magnetic field and flux, fields due to currents', prereqs: ['ts10.ps.current.basics'],
      activities: ['lab:circuit'],
      intro: [
        h('A compass that twitched'),
        photo('🧭', 'Place a compass needle under a wire and switch on the current: the needle swings. Switch off and it returns. Electricity is making magnetism!'),
        p('In 1820 Hans Christian Oersted noticed that a compass needle placed near a current-carrying wire turned away from north. Reversing the current turned the needle the other way. This showed, for the first time, that an electric current produces a magnetic field around it — the birth of electromagnetism.'),
        def('Magnetic field', 'The region around a magnet or a current-carrying conductor in which another magnet or moving charge feels a force. It has both strength and direction.'),
        def('Magnetic field lines', 'Imaginary closed curves showing the direction of the field (the way a compass N-pole points). Outside a magnet they go from N to S; they never cross; where they are crowded the field is strong.'),
        h('Magnetic flux and flux density'),
        p('Imagine field lines as arrows passing through a window. The number of lines passing through an area is the magnetic flux (Φ). Flux through unit area held perpendicular to the field is the magnetic flux density (B), also called field strength.'),
        f('Φ = B A cos θ   (θ = angle between B and the normal to the area)', 'flux equals B times A times cos theta'),
        def('Magnetic flux density (B)', 'B = Φ/A for an area perpendicular to the field. Unit: tesla (T) = weber per square metre (Wb/m²). Flux Φ is measured in weber (Wb).'),
        xp({
          title: 'What if? Flux through a loop', formula: 'Φ = B × A × cos θ',
          res: ['Φ', 'Magnetic flux', 'Wb', 'B * A * cos(θ)', 4],
          vars: [['B', 'Field strength', 'T', 0.1, 2, 0.1, 0.5], ['A', 'Area of the loop', 'm²', 0.01, 0.5, 0.01, 0.1], ['θ', 'Angle between B and the normal to the loop', '°', 0, 90, 5, 0]],
          notes: [
            ['B', 'A stronger field sends more lines through the same window: flux rises in proportion.', 'A weaker field means fewer lines through the loop.'],
            ['A', 'A bigger loop catches more field lines.', 'A smaller loop catches fewer lines.'],
            ['θ', 'Tilting the loop lets lines slide past it: at 90° (loop edge-on to the field) no lines pass through and Φ = 0.', 'Turning the loop to face the field squarely catches the most lines (θ = 0).'],
          ],
          mistakes: [['Measuring θ from the plane of the loop', 'θ is measured from the NORMAL to the loop. Face-on to the field means θ = 0 and maximum flux.'], ['Confusing flux (Wb) and flux density (T)', 'B is per square metre; Φ = B × area.']],
          real: 'Turning a coil in a generator changes θ continuously, so the flux keeps changing — that is what makes electricity.',
        }),
        h('Fields made by currents'),
        p('Straight wire: field lines are concentric circles around the wire. Right-hand thumb rule: grip the wire with your right hand, thumb along the current — your curled fingers show the direction of the field. The field gets weaker farther from the wire.'),
        p('Circular loop: at the centre the field lines are almost straight and perpendicular to the loop. More turns → stronger field.'),
        p('Solenoid (a long coil): inside, the field is strong and nearly uniform (parallel lines); outside it looks like the field of a bar magnet, with N and S ends. Put a soft iron core inside and you get an electromagnet, whose strength depends on the number of turns, the current and the core.'),
        keys('Current produces a magnetic field (Oersted).', 'Φ = BA cos θ; B in tesla, Φ in weber.', 'Straight wire: circles; right-hand thumb rule gives direction.', 'Solenoid: uniform field inside, behaves like a bar magnet.'),
        remember('Field lines never cross: at any point the field has only one direction.'),
      ],
      examples: [
        ex('A loop of area 0.2 m² is held face-on to a uniform field of 0.5 T. Find the flux. What if the loop is turned edge-on?', ['Face-on: θ = 0°, cos 0° = 1', 'Φ = 0.5 × 0.2 × 1 = 0.1 Wb', 'Edge-on: θ = 90°, cos 90° = 0 → Φ = 0'], '0.1 Wb face-on; 0 edge-on'),
        ex('Current flows vertically upward in a wire. Looking from above, which way do the field lines circle?', ['Right thumb points up (along current).', 'Fingers curl anticlockwise when viewed from above.'], 'Anticlockwise'),
      ],
      practice: [
        tp('flux', (r) => {
          const B = r.pick([0.1, 0.2, 0.4, 0.5, 0.8, 1, 1.5, 2]);
          const A = r.pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.5]);
          const th = r.pick([0, 60, 0, 90, 60]);
          const c = th === 0 ? 1 : th === 60 ? 0.5 : 0;
          const phi = rd(B * A * c, 5);
          return numQ(`A uniform magnetic field of ${B} T passes through a loop of area ${A} m². The angle between the field and the normal to the loop is ${th}°. Find the flux in weber. (cos ${th}° = ${c})`, phi, undefined,
            ['Φ = B A cos θ', `cos ${th}° = ${c}`], [`Φ = ${B} × ${A} × ${c}`, `Φ = ${phi} Wb`],
            th === 60 ? [{ when: String(rd(B * A, 5)), explain: 'Multiply by cos θ: the loop is tilted, so fewer lines pass through.' }] : [], 0.01);
        }, 2),
        mcq('fields', 'Use the right-hand thumb rule and the shapes of field lines.', [
          ['Oersted\'s experiment showed that…', 'An electric current produces a magnetic field', ['Magnets produce current', 'Current flows only in iron', 'Compasses point south'], 'The compass needle moved.', 'A current-carrying wire deflects a compass: current → magnetic field.'],
          ['The field lines around a straight current-carrying wire are…', 'Concentric circles', ['Straight parallel lines', 'Radial lines', 'Ellipses'], 'Sprinkle iron filings on a card around the wire.', 'The filings form circles centred on the wire.'],
          ['Inside a long solenoid the magnetic field is…', 'Nearly uniform', ['Zero', 'Circular', 'Strongest at one end only'], 'Parallel straight lines.', 'Inside, field lines are parallel and evenly spaced.'],
          ['The SI unit of magnetic flux density is…', 'Tesla', ['Weber', 'Ampere', 'Volt'], 'Wb/m².', 'B is measured in tesla (T).'],
          ['Crowded field lines indicate…', 'A strong magnetic field', ['A weak field', 'No field', 'Reversed current'], 'More lines per area.', 'Field strength is shown by the density of lines.'],
          ['An electromagnet becomes stronger when…', 'The number of turns or the current increases', ['The coil is shortened only', 'A copper core is used', 'The current is switched off'], 'More current, more turns.', 'More ampere-turns (and a soft iron core) make a stronger field.'],
          ['Using the right-hand thumb rule, the thumb points along the…', 'Current', ['Magnetic field', 'Force', 'Electron flow'], 'Fingers curl along the field.', 'Thumb → conventional current; curled fingers → field.'],
        ]),
        tapT('tap', 'Tap every statement that is TRUE about magnetic field lines.', [
          ['They never cross each other', true], ['They form closed loops', true], ['Outside a magnet they go from N to S', true], ['Closer lines mean a stronger field', true],
          ['They start and end in empty space', false], ['They can cross near the poles', false], ['Inside a magnet they go from N to S', false],
        ], ['Field lines are continuous closed curves.', 'Inside a magnet they run from S to N.'], 'Field lines are closed, never cross, run N→S outside (S→N inside), and are denser where the field is stronger.'),
      ],
    },
    {
      id: 'ts10.ps.em.force', title: 'Force on moving charges and current-carrying wires; electric motor', prereqs: ['ts10.ps.em.field'],
      activities: ['lab:circuit'],
      intro: [
        h('Magnets push on moving charges'),
        photo('⚙️', 'Ceiling fans, mixer-grinders and water pumps all spin because a magnetic field pushes on a current-carrying coil.'),
        p('If a current makes a magnetic field, then a magnet should push on a current. It does! A charge q moving with velocity v perpendicular to a field B feels a force:'),
        f('F = q v B  (v ⟂ B)', 'force equals charge times velocity times field'),
        p('A current is just many moving charges, so a wire of length L carrying current I in a field B feels:'),
        f('F = B I L sin θ   (θ = angle between the wire and the field)', 'force equals B I L sine theta'),
        p('The force is largest when the wire is perpendicular to the field (sin 90° = 1) and zero when the wire lies along the field (sin 0° = 0). A charge at rest, or moving parallel to the field, feels no magnetic force.'),
        xp({
          title: 'What if? Force on a current-carrying wire', formula: 'F = B I L sin θ',
          res: ['F', 'Force on the wire', 'N', 'B * I * L * sin(θ)', 3],
          vars: [['B', 'Field strength', 'T', 0.1, 2, 0.1, 0.5], ['I', 'Current', 'A', 0.5, 10, 0.5, 2], ['L', 'Length of wire in the field', 'm', 0.05, 1, 0.05, 0.2], ['θ', 'Angle between wire and field', '°', 0, 90, 5, 90]],
          notes: [
            ['B', 'A stronger magnet pushes harder: motors with strong magnets are more powerful.', 'A weaker field gives a smaller push.'],
            ['I', 'More current means more moving charges, so a bigger force — turning up the speed regulator increases current to a fan motor.', 'Less current, smaller force.'],
            ['L', 'More wire inside the field means more force — so motors use coils with many turns.', 'Less wire in the field, less force.'],
            ['θ', 'Turning the wire towards perpendicular to the field increases the force to its maximum at 90°.', 'Turning the wire to lie along the field reduces the force to zero.'],
          ],
          mistakes: [['Forgetting sin θ', 'If the wire is parallel to B, there is NO force, even with a large current.'], ['Using the right hand for the force direction', 'Fleming\'s LEFT-hand rule gives the force direction for motors.']],
          real: 'In a loudspeaker, a varying current in a coil inside a magnet makes a varying force that vibrates the cone and produces sound.',
        }),
        h('Which way is the force?'),
        p('Fleming\'s left-hand rule: stretch the thumb, first finger and second finger of your LEFT hand at right angles to each other. First finger → Field (N to S), seCond finger → Current, thuMb → Motion (force). For a single charge, use the direction of conventional current: a positive charge moves along it, an electron opposite.'),
        h('Electric motor'),
        p('A rectangular coil sits between the poles of a magnet. Current flows up one side of the coil and down the other, so the two sides get opposite forces — a turning effect. A split-ring commutator reverses the current every half turn, so the coil keeps rotating in the same direction. Electrical energy → mechanical energy.'),
        keys('F = qvB on a moving charge (v ⟂ B); zero if at rest or moving along B.', 'F = BIL sin θ on a wire; maximum at 90°.', 'Fleming\'s left-hand rule: Field, Current, Motion (thumb).', 'Motor: coil + magnet + split ring; electrical → mechanical energy.'),
        remember('Left hand for motors (force), right hand for generators (induced current) and for the field around a wire (thumb rule).'),
      ],
      examples: [
        ex('A 0.5 m wire carrying 4 A lies at right angles to a 0.3 T field. Find the force.', ['F = BIL sin 90°', 'F = 0.3 × 4 × 0.5 × 1', 'F = 0.6 N'], '0.6 N'),
        ex('An electron moves at 2 × 10⁶ m/s perpendicular to a 0.5 T field. Find the force on it.', ['F = qvB', '= 1.6 × 10⁻¹⁹ × 2 × 10⁶ × 0.5', '= 1.6 × 10⁻¹³ N'], '1.6 × 10⁻¹³ N'),
      ],
      practice: [
        tp('bil', (r) => {
          const B = r.pick([0.1, 0.2, 0.25, 0.5, 0.8, 1]);
          const I = r.pick([1, 2, 2.5, 4, 5, 10]);
          const Lw = r.pick([0.1, 0.2, 0.25, 0.5, 1]);
          const th = r.pick([90, 90, 30, 0]);
          const s = th === 90 ? 1 : th === 30 ? 0.5 : 0;
          const F = rd(B * I * Lw * s, 5);
          return numQ(`A wire of length ${Lw} m carrying ${I} A is placed in a uniform field of ${B} T at an angle of ${th}° to the field. Find the force on it. (sin ${th}° = ${s})`, F, 'N',
            ['F = BIL sin θ', `sin ${th}° = ${s}`], [`F = ${B} × ${I} × ${Lw} × ${s}`, `F = ${F} N`, ...(th === 0 ? ['A wire along the field feels no force.'] : [])],
            th !== 90 ? [{ when: `${rd(B * I * Lw, 5)} N`, explain: 'Include sin θ — the wire is not perpendicular to the field.' }] : [], 0.01);
        }, 2),
        tp('qvb', (r) => {
          const v = r.pick([1, 2, 3, 5]) * 10 ** r.pick([5, 6]);
          const B = r.pick([0.1, 0.2, 0.5, 1, 2]);
          const F = 1.6e-19 * v * B;
          return numQ(`A proton (charge 1.6 × 10⁻¹⁹ C) moves at ${sci(v)} m/s perpendicular to a ${B} T field. Find the magnetic force on it. (Type like 1.6e-14 N)`, sig(F, 4), 'N',
            ['F = qvB', 'Multiply the numbers; add the powers of ten.'], [`F = 1.6 × 10⁻¹⁹ × ${sci(v)} × ${B}`, `F = ${sci(F)} N`], [], 0.01);
        }, 3),
        tp('fleming', (r) => {
          const dirs = ['up the page', 'down the page', 'to the left', 'to the right'];
          const cases: [string, string, string][] = [
            ['into the page', 'to the right', 'up the page'], ['into the page', 'to the left', 'down the page'],
            ['out of the page', 'to the right', 'down the page'], ['out of the page', 'to the left', 'up the page'],
            ['into the page', 'up the page', 'to the left'], ['out of the page', 'up the page', 'to the right'],
            ['into the page', 'down the page', 'to the right'], ['out of the page', 'down the page', 'to the left'],
          ];
          const [B, I, F] = r.pick(cases);
          return {
            type: 'mcq', prompt: `A wire carries current ${I} in a magnetic field pointing ${B}. Which way is the force on the wire?`, ...choose(r, F, dirs.filter((d) => d !== F)),
            hints: ['Use Fleming\'s left-hand rule.', 'First finger → field, second finger → current, thumb → force.'],
            mistakes: [{ when: 'wrong', explain: 'Check that you used your LEFT hand and that all three fingers are at right angles.' }],
            solution: [`Field ${B}, current ${I}`, `Thumb points ${F}`],
          };
        }, 2),
        mcq('motor', 'Think about what each part of a motor does.', [
          ['An electric motor converts…', 'Electrical energy into mechanical energy', ['Mechanical energy into electrical energy', 'Heat into electricity', 'Light into motion'], 'It uses current to make motion.', 'Current in a field → force → rotation.'],
          ['The split-ring commutator in a DC motor…', 'Reverses the current in the coil every half turn', ['Increases the voltage', 'Stores charge', 'Makes the field stronger'], 'Keeps rotation in one direction.', 'Reversing the current keeps the torque in the same sense.'],
          ['A charge moving parallel to a magnetic field experiences…', 'No magnetic force', ['Maximum force', 'A force along the field', 'A force that doubles its speed'], 'sin 0° = 0.', 'Motion along B gives zero force.'],
          ['A charge at rest in a magnetic field experiences…', 'No magnetic force', ['A force towards N', 'A force towards S', 'Maximum force'], 'v = 0.', 'F = qvB = 0 when v = 0.'],
          ['In Fleming\'s left-hand rule, the thumb shows the direction of…', 'Force (motion)', ['Field', 'Current', 'Electron flow'], 'thuMb = Motion.', 'First finger field, second finger current, thumb motion.'],
          ['If both the current and the field are reversed, the force on the wire…', 'Stays in the same direction', ['Reverses', 'Becomes zero', 'Doubles'], 'Two reversals cancel.', 'Reversing one flips the force; reversing both flips it back.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.em.induction', title: 'Electromagnetic induction: Faraday\'s and Lenz\'s laws, generators', prereqs: ['ts10.ps.em.force'],
      intro: [
        h('Making electricity from motion'),
        photo('🚲', 'A bicycle dynamo lights the lamp only while the wheel turns — motion near a magnet makes electricity.'),
        p('Oersted showed current makes magnetism. Michael Faraday asked the reverse: can magnetism make current? Push a bar magnet into a coil connected to a galvanometer: the needle kicks. Hold the magnet still inside: no current. Pull it out: the needle kicks the other way. A current appears only while the magnetic flux through the coil is CHANGING.'),
        def('Electromagnetic induction', 'The production of an emf (and current, in a closed circuit) in a conductor when the magnetic flux linked with it changes.'),
        def('Faraday\'s law', 'The induced emf in a coil equals the rate of change of magnetic flux linked with it: ε = N ΔΦ/Δt (N = number of turns).'),
        f('ε = N ΔΦ / Δt', 'induced emf equals number of turns times change in flux over time'),
        def('Lenz\'s law', 'The induced current always flows in a direction that opposes the change producing it. (Push a N-pole in, and the coil face becomes a N-pole to push back.) This is conservation of energy: you must do work to produce electrical energy.'),
        p('A straight conductor of length L moving with speed v perpendicular to a field B sweeps through flux, so an emf ε = B L v is induced across its ends. Its direction is given by Fleming\'s right-hand rule: first finger field, thumb motion, second finger induced current.'),
        xp({
          title: 'What if? Change the flux faster', formula: 'ε = N × ΔΦ / Δt',
          res: ['ε', 'Induced emf', 'V', 'N * dΦ / dt', 3],
          vars: [['N', 'Number of turns', '', 1, 500, 1, 100], ['dΦ', 'Change in flux', 'Wb', 0.001, 0.1, 0.001, 0.01], ['dt', 'Time taken for the change', 's', 0.01, 2, 0.01, 0.1]],
          notes: [
            ['N', 'Each turn adds its own emf, so more turns give a proportionally bigger emf.', 'Fewer turns, smaller emf.'],
            ['dΦ', 'A bigger change in flux (stronger magnet, bigger coil) gives a bigger emf.', 'A smaller change in flux gives less emf.'],
            ['dt', 'Doing the same change more SLOWLY gives a smaller emf — move the magnet lazily and the needle barely moves.', 'Doing it faster gives a larger emf: quick movements make big kicks.'],
          ],
          mistakes: [['Thinking a strong magnet at rest induces current', 'Only CHANGING flux induces emf. A stationary magnet gives nothing.'], ['Forgetting N', 'The emf from each turn adds up; multiply by the number of turns.']],
          real: 'Power-station generators spin huge coils fast in strong magnetic fields to produce thousands of volts.',
        }),
        xp({
          title: 'What if? A rod moving through a field', formula: 'ε = B L v',
          res: ['ε', 'Induced emf', 'V', 'B * L * v', 3],
          vars: [['B', 'Field strength', 'T', 0.1, 2, 0.1, 0.5], ['L', 'Length of rod', 'm', 0.1, 2, 0.1, 1], ['v', 'Speed of rod', 'm/s', 0.5, 20, 0.5, 4]],
          notes: [['B', 'Stronger field → more emf.', 'Weaker field → less emf.'], ['L', 'Longer rod cuts more field lines per second.', 'Shorter rod, less emf.'], ['v', 'Moving faster cuts lines faster → more emf.', 'Slower motion → less emf; stopped → zero.']],
          mistakes: [['Using the left-hand rule for direction', 'For induced current use Fleming\'s RIGHT-hand rule.'], ['Applying it when the rod moves along the field', 'Moving parallel to B cuts no lines, so ε = 0.']],
          real: 'An aeroplane wing moving through Earth\'s magnetic field has a tiny emf of a fraction of a volt across its tips.',
        }),
        h('Generators and AC'),
        p('An AC generator rotates a coil in a magnetic field. As the coil turns, the flux through it changes continuously, so an emf is induced that reverses direction every half turn — alternating current (AC). Slip rings carry it out. In India the AC mains supply has a frequency of 50 Hz. A DC generator uses a split-ring commutator to give current in one direction. Transformers also work by electromagnetic induction, and so do induction stoves.'),
        keys('Changing flux → induced emf (Faraday): ε = NΔΦ/Δt.', 'Lenz: induced current opposes the change (energy conservation).', 'Moving rod: ε = BLv; direction by Fleming\'s right-hand rule.', 'Generator: mechanical → electrical energy; AC in India is 50 Hz.'),
        remember('Motor: electrical → mechanical (left hand). Generator: mechanical → electrical (right hand).'),
      ],
      examples: [
        ex('The flux through a 200-turn coil changes from 0.05 Wb to 0.01 Wb in 0.2 s. Find the induced emf.', ['ΔΦ = 0.05 − 0.01 = 0.04 Wb', 'ε = NΔΦ/Δt = 200 × 0.04 ÷ 0.2', 'ε = 40 V'], '40 V'),
        ex('A 1.5 m rod moves at 10 m/s perpendicular to a 0.2 T field. Find the emf.', ['ε = BLv', '= 0.2 × 1.5 × 10', '= 3 V'], '3 V'),
      ],
      practice: [
        tp('faraday', (r) => {
          const N = r.pick([10, 50, 100, 200, 500]);
          const d = r.pick([0.01, 0.02, 0.04, 0.05, 0.1]);
          const t = r.pick([0.1, 0.2, 0.5, 1, 0.05]);
          const e = rd((N * d) / t, 4);
          return numQ(`The magnetic flux through a coil of ${N} turns changes by ${d} Wb in ${t} s. Find the induced emf.`, e, 'V',
            ['ε = N ΔΦ / Δt', 'Multiply by the number of turns.'], [`ε = ${N} × ${d} ÷ ${t}`, `ε = ${e} V`],
            [{ when: `${rd(d / t, 4)} V`, explain: 'Multiply by N: each turn adds its own emf.' }, { when: `${rd(N * d * t, 4)} V`, explain: 'Divide by the time, do not multiply: emf depends on the RATE of change.' }], 0.01);
        }, 2),
        tp('blv', (r) => {
          const B = r.pick([0.1, 0.2, 0.4, 0.5, 1]);
          const Lr = r.pick([0.2, 0.5, 1, 1.5, 2]);
          const v = r.pick([2, 4, 5, 10, 20]);
          return numQ(`A rod of length ${Lr} m moves at ${v} m/s perpendicular to a ${B} T magnetic field. Find the emf across its ends.`, rd(B * Lr * v, 4), 'V',
            ['ε = BLv', 'All quantities in SI units.'], [`ε = ${B} × ${Lr} × ${v} = ${rd(B * Lr * v, 4)} V`], [], 0.01);
        }),
        mcq('concept', 'Only a CHANGE in flux induces an emf.', [
          ['A magnet is held still inside a coil. The induced current is…', 'Zero', ['Maximum', 'Steady and large', 'Alternating'], 'Is the flux changing?', 'No change in flux → no induced emf.'],
          ['Lenz\'s law is a consequence of conservation of…', 'Energy', ['Charge', 'Mass', 'Momentum'], 'You must push against the induced effect.', 'Opposition means work must be done — energy is conserved.'],
          ['The direction of induced current in a moving conductor is given by…', 'Fleming\'s right-hand rule', ['Fleming\'s left-hand rule', 'Right-hand thumb rule', 'Snell\'s law'], 'Generator rule.', 'Right hand: first finger field, thumb motion, second finger current.'],
          ['Moving a magnet faster into a coil makes the induced emf…', 'Larger', ['Smaller', 'Zero', 'Unchanged'], 'Rate of change.', 'Faster change of flux → larger emf.'],
          ['An electric generator converts…', 'Mechanical energy into electrical energy', ['Electrical into mechanical energy', 'Chemical into electrical energy', 'Light into electrical energy'], 'It needs to be turned.', 'Rotating a coil in a field produces electricity.'],
          ['The frequency of AC mains supply in India is…', '50 Hz', ['60 Hz', '220 Hz', '0 Hz'], 'Same as most of Asia and Europe.', 'India uses 220–230 V, 50 Hz AC.'],
          ['When the N-pole of a magnet is pushed into a coil, the near face of the coil becomes…', 'A north pole', ['A south pole', 'Unmagnetised', 'Positively charged'], 'Lenz: oppose the approach.', 'A N-pole repels the incoming N-pole, opposing the change.'],
        ]),
        matchT('match', 'device to the principle it uses', [
          ['Electric motor', 'Force on a current in a magnetic field'], ['AC generator', 'Electromagnetic induction'], ['Electromagnet', 'Magnetic field of a current in a coil'],
          ['Bicycle dynamo', 'Rotating magnet induces current'], ['Loudspeaker', 'Varying force on a coil in a magnet'], ['Compass deflection near a wire', 'Oersted\'s discovery'],
        ], ['Motors and speakers use force on currents.', 'Generators and dynamos use induction.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 11 — Principles of Metallurgy
// =====================================================================================
const ORES: [string, string, string][] = [
  ['Bauxite', 'Al₂O₃·2H₂O', 'Aluminium'], ['Haematite', 'Fe₂O₃', 'Iron'], ['Magnetite', 'Fe₃O₄', 'Iron'], ['Zinc blende', 'ZnS', 'Zinc'],
  ['Galena', 'PbS', 'Lead'], ['Cinnabar', 'HgS', 'Mercury'], ['Copper pyrites', 'CuFeS₂', 'Copper'], ['Rock salt', 'NaCl', 'Sodium'],
  ['Calamine', 'ZnCO₃', 'Zinc'], ['Magnesite', 'MgCO₃', 'Magnesium'], ['Pyrolusite', 'MnO₂', 'Manganese'], ['Horn silver', 'AgCl', 'Silver'], ['Cassiterite (tin stone)', 'SnO₂', 'Tin'],
];
const METAL_FRAC: [string, string, number][] = [
  ['haematite (Fe₂O₃)', 'iron', 112 / 160], ['bauxite as Al₂O₃', 'aluminium', 54 / 102], ['zinc blende (ZnS)', 'zinc', 65 / 97], ['cinnabar (HgS)', 'mercury', 200 / 232], ['galena (PbS)', 'lead', 207 / 239],
];

const ch11: USpec = {
  id: 'ts10.ps.ch11', subject: 'chemistry', title: 'Principles of Metallurgy', source: src(11),
  objectives: [
    {
      id: 'ts10.ps.metal.occurrence', title: 'Occurrence of metals: minerals, ores and the activity series', prereqs: [],
      intro: [
        h('Where do metals come from?'),
        photo('🪨', 'Most metals are hidden inside rocks as compounds. Only a few, like gold, are found shining in pure form.'),
        p('Gold, silver, platinum and sometimes copper occur in the free (native) state because they are unreactive. Most other metals react with oxygen, sulphur, carbon dioxide or water over millions of years, so they occur in the combined state — as oxides, sulphides, carbonates, halides and so on, mixed with soil and rock.'),
        def('Mineral', 'A naturally occurring element or compound found in the Earth\'s crust.'),
        def('Ore', 'A mineral from which a metal can be extracted profitably (conveniently and economically). All ores are minerals, but not all minerals are ores. Clay contains aluminium but bauxite is the ore of aluminium.'),
        def('Gangue', 'The unwanted earthy and sandy impurities (like sand, rock) mixed with an ore.'),
        p('Types of ores: oxides — bauxite Al₂O₃·2H₂O, haematite Fe₂O₃, pyrolusite MnO₂; sulphides — zinc blende ZnS, galena PbS, cinnabar HgS, copper pyrites CuFeS₂; carbonates — calamine ZnCO₃, magnesite MgCO₃, limestone CaCO₃; halides — rock salt NaCl, horn silver AgCl, carnallite KCl·MgCl₂·6H₂O.'),
        h('Activity series decides it'),
        p('K > Na > Ca > Mg > Al | Zn > Fe > Pb > Cu | Hg > Ag > Au. Highly reactive metals (top) are never found free; they occur mainly as chlorides, carbonates and sulphates. Moderately reactive metals (middle) are found as oxides, sulphides and carbonates. Least reactive metals (bottom) can be found free or as sulphides. India has rich iron ore in Odisha, Jharkhand and Chhattisgarh, bauxite in Odisha, and zinc–lead ores in Rajasthan.'),
        keys('Native: unreactive metals (Au, Pt, Ag, sometimes Cu).', 'Combined: oxides, sulphides, carbonates, halides.', 'Ore = mineral from which metal is extracted profitably.', 'Reactivity series decides how a metal occurs and how it is extracted.'),
        remember('Every ore is a mineral, but every mineral is not an ore.'),
      ],
      examples: [
        ex('Why is gold found in the free state but sodium is not?', ['Gold is at the bottom of the activity series — it does not react with air or water.', 'Sodium is very reactive and combines quickly with oxygen, water and chlorine.'], 'Gold is unreactive; sodium is highly reactive'),
        ex('Classify these ores: galena, calamine, haematite, rock salt.', ['Galena PbS → sulphide', 'Calamine ZnCO₃ → carbonate', 'Haematite Fe₂O₃ → oxide', 'Rock salt NaCl → halide'], 'Sulphide, carbonate, oxide, halide'),
      ],
      practice: [
        tp('ore-metal', (r) => {
          const [ore, fm, metal] = r.pick(ORES);
          const wrong = r.shuffle(ORES.map((o) => o[2]).filter((m) => m !== metal)).slice(0, 3);
          return {
            type: 'mcq', prompt: `${ore} (${fm}) is an ore of which metal?`, ...choose(r, metal, wrong),
            hints: ['Read the formula — which metal symbol does it contain?', 'Fe = iron, Zn = zinc, Pb = lead, Hg = mercury, Al = aluminium.'],
            mistakes: [{ when: 'wrong', explain: 'Look at the metal symbol in the formula of the ore.' }],
            solution: [`${ore}, ${fm}, is an ore of ${metal.toLowerCase()}.`],
          };
        }),
        tp('ore-type', (r) => {
          const pool: [string, string][] = [['Bauxite, Al₂O₃·2H₂O', 'Oxide'], ['Haematite, Fe₂O₃', 'Oxide'], ['Zinc blende, ZnS', 'Sulphide'], ['Galena, PbS', 'Sulphide'], ['Cinnabar, HgS', 'Sulphide'], ['Calamine, ZnCO₃', 'Carbonate'], ['Limestone, CaCO₃', 'Carbonate'], ['Rock salt, NaCl', 'Halide'], ['Horn silver, AgCl', 'Halide'], ['Pyrolusite, MnO₂', 'Oxide'], ['Magnesite, MgCO₃', 'Carbonate']];
          const [ore, t] = r.pick(pool);
          return {
            type: 'mcq', prompt: `What type of ore is ${ore}?`, ...choose(r, t, ['Oxide', 'Sulphide', 'Carbonate', 'Halide'].filter((x) => x !== t)),
            hints: ['Look at the non-metal part of the formula.', 'O → oxide, S → sulphide, CO₃ → carbonate, Cl → halide.'],
            mistakes: [{ when: 'wrong', explain: 'Identify the negative part of the formula: O, S, CO₃ or a halogen.' }],
            solution: [`${ore} is a${t === 'Oxide' ? 'n' : ''} ${t.toLowerCase()} ore.`],
          };
        }),
        mcq('concept', 'Reactivity decides how a metal is found.', [
          ['Which metal is found in the free state in nature?', 'Gold', ['Sodium', 'Calcium', 'Iron'], 'Least reactive.', 'Gold is unreactive, so it occurs native.'],
          ['An ore is a mineral from which…', 'A metal can be extracted profitably', ['Any element can be found', 'Gangue is removed', 'Only gold is obtained'], 'Economics matter.', 'Profitable extraction makes a mineral an ore.'],
          ['The earthy impurities in an ore are called…', 'Gangue', ['Flux', 'Slag', 'Matte'], 'Unwanted rock and sand.', 'Gangue is removed during concentration.'],
          ['Highly reactive metals like sodium and potassium are mostly found as…', 'Chlorides', ['Free metals', 'Sulphides only', 'Oxides of gold'], 'Sea water and salt beds.', 'They occur largely as chlorides (and carbonates/sulphates).'],
          ['Which of these is NOT an ore of aluminium even though it contains aluminium?', 'Clay', ['Bauxite', 'Both are ores', 'None'], 'Extraction from it is not economical.', 'Aluminium is not extracted from clay profitably.'],
          ['Which is the correct order of reactivity?', 'K > Mg > Zn > Cu > Au', ['Au > Cu > Zn > Mg > K', 'Zn > K > Au > Cu > Mg', 'Cu > K > Mg > Au > Zn'], 'Potassium at the top, gold at the bottom.', 'K > Na > Ca > Mg > Al > Zn > Fe > Pb > Cu > Hg > Ag > Au.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.metal.extraction', title: 'Extraction of metals: concentration, reduction and refining', prereqs: ['ts10.ps.metal.occurrence'],
      intro: [
        h('From rock to shining metal'),
        photo('🪨', 'A truckload of iron ore must be cleaned, heated and reduced before it becomes a steel rod for a building in Hyderabad.'),
        p('Metallurgy is the whole process of extracting a metal from its ore and purifying it. There are three broad steps.'),
        def('Metallurgy', 'The science and technology of extracting metals from their ores and refining them for use.'),
        h('Step 1: Concentration (dressing) of the ore'),
        p('Removing gangue. Hand picking — big lumps of ore are picked out. Washing (gravity separation) — a stream of water washes away the lighter gangue; heavy ore particles settle (oxide ores). Froth flotation — powdered sulphide ore is mixed with water and pine oil; air is blown through; ore particles stick to the oil froth and float, gangue sinks (zinc blende, galena). Magnetic separation — a magnetic ore (magnetite) is pulled out by a magnetic roller.'),
        h('Step 2: Extraction of crude metal (depends on reactivity)'),
        p('Metals low in the activity series (Hg, Cu): heating the ore in air alone is enough. 2HgS + 3O₂ → 2HgO + 2SO₂; then 2HgO → 2Hg + O₂. Copper: 2Cu₂S + 3O₂ → 2Cu₂O + 2SO₂; 2Cu₂O + Cu₂S → 6Cu + SO₂.'),
        p('Metals in the middle (Zn, Fe, Pb): convert the ore to an oxide (roasting for sulphides, calcination for carbonates), then reduce the oxide with carbon or carbon monoxide. ZnO + C → Zn + CO. Fe₂O₃ + 3CO → 2Fe + 3CO₂. A more reactive metal can also be used: the thermite reaction Fe₂O₃ + 2Al → Al₂O₃ + 2Fe + heat is used to weld railway tracks.'),
        p('Metals high in the series (Na, K, Ca, Mg, Al): carbon cannot reduce their oxides, so electrolysis of the molten compound is used. Molten NaCl: Na collects at the cathode, Cl₂ at the anode. Aluminium is obtained by electrolysis of molten alumina.'),
        h('Step 3: Refining (purifying)'),
        p('Distillation — for low-boiling metals like Zn and Hg. Poling — molten impure copper stirred with green wooden poles; gases from the wood reduce copper oxide. Liquation — low-melting metals like Sn and Pb melt and flow down a sloping hearth, leaving impurities. Electrolytic refining — impure metal is the anode, a thin sheet of pure metal is the cathode; pure metal deposits on the cathode and impurities settle as anode mud (copper, zinc, silver).'),
        f('Mass of metal = mass of ore × (purity %) ÷ 100 × (metal fraction in the compound)'),
        xp({
          title: 'What if? How much iron can we get from haematite?', formula: 'mass of Fe = m × (p / 100) × 112/160',
          res: ['Fe', 'Mass of iron obtained', 'kg', 'm * p / 100 * 0.7', 1],
          vars: [['m', 'Mass of ore', 'kg', 10, 1000, 10, 100], ['p', 'Purity of the ore (% Fe₂O₃)', '%', 10, 100, 5, 80]],
          notes: [
            ['m', 'More ore gives proportionally more iron.', 'Less ore, less iron.'],
            ['p', 'Richer ore (more Fe₂O₃, less gangue) gives more iron per tonne — that is why concentration is the first step.', 'Poorer ore wastes energy heating useless gangue.'],
          ],
          mistakes: [['Assuming all of Fe₂O₃ is iron', 'Only 112 of every 160 parts by mass is iron (70%); the rest is oxygen.'], ['Ignoring purity', 'Ore also contains gangue, so multiply by the purity fraction.']],
          real: 'One tonne of 80% pure haematite can give about 560 kg of iron.',
        }),
        keys('Concentration: hand picking, washing, froth flotation (sulphides), magnetic separation.', 'Low reactivity: heat in air; middle: roast/calcine then reduce with C/CO/Al; high: electrolysis.', 'Refining: distillation, poling, liquation, electrolytic.', 'Iron is 70% of Fe₂O₃ by mass.'),
        remember('Froth flotation is used for SULPHIDE ores; electrolysis for the most reactive metals.'),
      ],
      examples: [
        ex('How is zinc extracted from zinc blende?', ['Concentrate by froth flotation (sulphide ore).', 'Roast: 2ZnS + 3O₂ → 2ZnO + 2SO₂', 'Reduce: ZnO + C → Zn + CO', 'Refine by distillation or electrolysis.'], 'Froth flotation → roasting → carbon reduction → refining'),
        ex('What mass of iron can be obtained from 200 kg of haematite that is 80% Fe₂O₃? (Fe 56, O 16)', ['Fe₂O₃ present = 0.8 × 200 = 160 kg', 'Fraction of Fe = 112/160 = 0.7', 'Iron = 160 × 0.7 = 112 kg'], '112 kg'),
      ],
      practice: [
        orderT('steps', 'Arrange the steps of extracting a moderately reactive metal like zinc from its sulphide ore.', [
          'Crushing and grinding the ore', 'Concentration by froth flotation', 'Roasting to convert sulphide to oxide', 'Reduction of the oxide with carbon', 'Refining the crude metal',
        ], ['You must remove gangue before chemical treatment.', 'Purification is always last.'], 'Crush → concentrate → roast → reduce → refine.'),
        matchT('method', 'process to what it is used for', [
          ['Froth flotation', 'Concentrating sulphide ores'], ['Magnetic separation', 'Concentrating magnetite'], ['Electrolysis of molten salt', 'Extracting sodium or aluminium'],
          ['Poling', 'Refining copper'], ['Liquation', 'Refining tin or lead'], ['Distillation', 'Refining zinc or mercury'], ['Thermite reaction', 'Welding railway tracks'],
        ], ['Concentration methods remove gangue; refining methods purify the metal.', 'Low-melting metals are refined by liquation; low-boiling ones by distillation.']),
        tp('mass', (r) => {
          const [ore, metal, fr] = r.pick(METAL_FRAC);
          const m = r.pick([100, 200, 500, 1000]);
          const p = r.pick([50, 60, 80, 100]);
          const ans = rd((m * p) / 100 * fr, 2);
          return numQ(`A sample of ${m} kg of ${ore} ore is ${p}% pure. The metal makes up ${rd(fr * 100, 1)}% of the pure compound by mass. What mass of ${metal} can be obtained at most?`, ans, 'kg',
            ['First find the mass of pure compound.', 'Then multiply by the metal fraction.'],
            [`Pure compound = ${m} × ${p}/100 = ${(m * p) / 100} kg`, `Metal = ${(m * p) / 100} × ${rd(fr, 4)} = ${ans} kg`],
            [{ when: `${(m * p) / 100} kg`, explain: 'The compound also contains oxygen or sulphur — multiply by the metal fraction.' }], 0.01);
        }, 2),
        mcq('which', 'Match the method to the metal\'s reactivity.', [
          ['Sodium is extracted by…', 'Electrolysis of molten sodium chloride', ['Reduction with carbon', 'Heating in air', 'Froth flotation'], 'Very reactive metal.', 'Carbon cannot reduce sodium compounds; electrolysis is needed.'],
          ['Mercury is obtained from cinnabar by…', 'Heating in air', ['Electrolysis', 'Reduction with aluminium', 'Liquation'], 'Low reactivity.', 'HgS → HgO → Hg simply by heating.'],
          ['Iron oxide is reduced in a blast furnace mainly by…', 'Carbon monoxide', ['Hydrogen', 'Sodium', 'Chlorine'], 'Coke burns to CO.', 'Fe₂O₃ + 3CO → 2Fe + 3CO₂.'],
          ['In electrolytic refining of copper, the anode is…', 'Impure copper', ['Pure copper', 'Graphite', 'Zinc'], 'The metal to be purified dissolves.', 'Impure copper dissolves from the anode; pure copper deposits on the cathode.'],
          ['Froth flotation works because…', 'Ore particles are wetted by oil and gangue by water', ['Ore is magnetic', 'Gangue is heavier than water', 'Ore dissolves in water'], 'Oil-loving vs water-loving.', 'Sulphide ore sticks to oil froth and floats; gangue sinks.'],
          ['Which metal can be used to reduce Fe₂O₃ in the thermite process?', 'Aluminium', ['Copper', 'Gold', 'Silver'], 'Needs a more reactive metal.', 'Al is more reactive than Fe and displaces it.'],
        ], 2),
      ],
    },
    {
      id: 'ts10.ps.metal.process', title: 'Important metallurgical processes and furnaces', prereqs: ['ts10.ps.metal.extraction'],
      intro: [
        h('Heat with a purpose'),
        photo('🔥', 'Ancient Indian smiths made the famous rust-resistant iron pillar of Delhi using furnaces and careful heating.'),
        p('Several heating processes appear again and again in metallurgy. Learn what each one does, and with what kind of ore.'),
        def('Roasting', 'Heating an ore strongly in excess air below its melting point. Used for SULPHIDE ores: 2ZnS + 3O₂ → 2ZnO + 2SO₂.'),
        def('Calcination', 'Heating an ore strongly in the absence (or limited supply) of air to remove moisture and volatile matter. Used for CARBONATE and hydrated ores: ZnCO₃ → ZnO + CO₂; CaCO₃ → CaO + CO₂.'),
        def('Smelting', 'Heating the ore with a reducing agent (like coke) and a flux in a furnace so that the metal is obtained in molten form.'),
        def('Flux and slag', 'A flux is a substance added to remove the gangue by combining with it to form a fusible, easily removable material called slag. For iron: CaO (from limestone) + SiO₂ (gangue) → CaSiO₃ (slag).'),
        h('Furnaces'),
        p('Blast furnace: a tall furnace into which ore, coke and limestone are fed from the top and hot air is blown from below; used for iron. Reverberatory furnace: the fuel burns in a separate part and the hot gases are reflected (reverberated) from the roof onto the ore; used for roasting and smelting copper and tin ores. Retort furnace: the ore is heated in closed retorts with no contact with fuel; used for zinc and mercury.'),
        keys('Roasting: sulphide ore + excess air → oxide + SO₂.', 'Calcination: carbonate ore heated without air → oxide + CO₂.', 'Smelting: ore + reducing agent + flux → molten metal + slag.', 'Flux + gangue → slag (CaO + SiO₂ → CaSiO₃).'),
        remember('Roasting = sulphide + air; Calcination = carbonate, no air. Confusing these two is the commonest exam error.'),
      ],
      examples: [
        ex('Which process would you use for calamine, ZnCO₃? Write the equation.', ['Calamine is a carbonate ore.', 'Carbonates are calcined: heated in limited air.', 'ZnCO₃ → ZnO + CO₂'], 'Calcination: ZnCO₃ → ZnO + CO₂'),
        ex('In iron extraction, sand (SiO₂) is the gangue. How is it removed?', ['Limestone decomposes: CaCO₃ → CaO + CO₂', 'CaO acts as flux: CaO + SiO₂ → CaSiO₃', 'Molten slag floats on molten iron and is tapped off.'], 'As calcium silicate slag'),
      ],
      practice: [
        mcq('process', 'Sulphide → roasting; carbonate → calcination.', [
          ['Heating zinc blende (ZnS) in excess air is called…', 'Roasting', ['Calcination', 'Smelting', 'Liquation'], 'Sulphide ore + air.', 'Roasting converts sulphides to oxides.'],
          ['Heating calamine (ZnCO₃) in the absence of air is called…', 'Calcination', ['Roasting', 'Poling', 'Distillation'], 'Carbonate, no air.', 'Calcination removes CO₂ from carbonates.'],
          ['The gas given off when a sulphide ore is roasted is…', 'Sulphur dioxide', ['Carbon dioxide', 'Hydrogen', 'Oxygen'], 'Sulphur combines with oxygen.', 'Sulphide + O₂ → oxide + SO₂.'],
          ['The gas given off during calcination of a carbonate is…', 'Carbon dioxide', ['Sulphur dioxide', 'Chlorine', 'Nitrogen'], 'Carbonate → oxide + ?', 'MCO₃ → MO + CO₂.'],
          ['A flux combines with gangue to form…', 'Slag', ['Matte', 'Alloy', 'Ore'], 'A fusible waste.', 'Flux + gangue → slag, which is easily removed.'],
          ['In the extraction of iron, the flux used is…', 'Lime (CaO) from limestone', ['Silica', 'Coke', 'Sodium chloride'], 'Gangue is acidic silica.', 'Basic CaO removes acidic SiO₂ as CaSiO₃.'],
          ['In which furnace do hot gases reflect off the roof onto the ore?', 'Reverberatory furnace', ['Blast furnace', 'Retort furnace', 'Electric furnace'], 'Reverberate = reflect.', 'The reverberatory furnace keeps fuel separate from the charge.'],
        ]),
        matchT('match', 'term to its meaning', [
          ['Roasting', 'Sulphide ore heated in excess air'], ['Calcination', 'Ore heated in absence of air'], ['Smelting', 'Ore reduced to molten metal in a furnace'],
          ['Flux', 'Added to remove gangue'], ['Slag', 'Fusible waste formed from flux and gangue'], ['Blast furnace', 'Used for extracting iron'],
        ], ['Two of these are heating processes that differ in air supply.', 'Flux is added; slag is formed.']),
        orderT('blast', 'Arrange what happens in a blast furnace for iron, from feeding to tapping.', [
          'Ore, coke and limestone are fed from the top', 'Hot air is blown in and coke burns to CO', 'CO reduces Fe₂O₃ to iron', 'CaO combines with SiO₂ to form slag', 'Molten iron and slag are tapped from the bottom',
        ], ['Fuel must burn before reduction can happen.', 'Tapping is last.'], 'Charge → burning coke makes CO → reduction → slag formation → tapping.', 2),
      ],
    },
    {
      id: 'ts10.ps.metal.corrosion', title: 'Corrosion and its prevention', prereqs: ['ts10.ps.metal.occurrence'],
      intro: [
        h('Why gates rust and spoons tarnish'),
        photo('🚢', 'Ships are painted thickly and fitted with zinc or magnesium blocks because sea water speeds up rusting.'),
        p('A shiny metal surface slowly reacts with air, moisture and chemicals around it and wears away. Iron forms reddish-brown rust; silver turns black (silver sulphide, from sulphur compounds in air); copper gets a green coating (basic copper carbonate).'),
        def('Corrosion', 'The slow eating away of a metal by the action of air, moisture or chemicals on its surface.'),
        def('Rust', 'Hydrated iron(III) oxide, Fe₂O₃·xH₂O, formed when iron is exposed to both oxygen and water.'),
        h('Proving that rusting needs both air and water'),
        p('Take three test tubes with clean iron nails. Tube A: nail in tap water (air + water). Tube B: nail in boiled distilled water covered with a layer of oil (no air). Tube C: nail with anhydrous calcium chloride, which absorbs moisture (no water). After a few days, only the nail in tube A rusts. So both air (oxygen) and water are required. Salt water speeds up rusting — that is why coastal areas see more rust.'),
        h('Preventing corrosion'),
        p('Painting, oiling or greasing — keeps air and water away. Galvanising — coating iron with zinc; even if scratched, zinc corrodes first and protects the iron. Tinning — coating with tin (food cans). Electroplating — coating with chromium or nickel by electrolysis (bicycle handles, taps). Alloying — mixing metals: stainless steel (iron with chromium and nickel) does not rust. Cathodic protection — connecting a more reactive metal (Mg or Zn blocks) that corrodes instead of iron (ships, underground pipes). Anodising — thickening the protective oxide layer on aluminium.'),
        keys('Rust = Fe₂O₃·xH₂O; needs both oxygen and water.', 'Salt and acids speed up corrosion.', 'Prevention: paint/oil, galvanising, tinning, electroplating, alloying, cathodic protection.', 'Galvanised iron stays protected even when scratched.'),
        remember('Silver tarnishes black (Ag₂S); copper turns green (basic copper carbonate); iron rusts reddish-brown (Fe₂O₃·xH₂O).'),
      ],
      examples: [
        ex('Teja finds that the iron grills of his house in Nizamabad rust faster in the rainy season. Explain and suggest a remedy.', ['Rusting needs oxygen and water; the rainy season provides plenty of moisture.', 'Paint the grills (blocks air and water) or use galvanised iron.'], 'More moisture → more rusting; paint or galvanise'),
        ex('Why does a scratched galvanised bucket not rust, while a scratched painted bucket does?', ['Paint only acts as a barrier; once scratched, iron is exposed.', 'Zinc is more reactive than iron, so zinc corrodes in preference and protects the exposed iron.'], 'Zinc protects iron sacrificially'),
      ],
      practice: [
        tapT('prevent', 'Tap every method that helps PREVENT rusting of iron.', [
          ['Painting', true], ['Galvanising with zinc', true], ['Oiling or greasing', true], ['Making stainless steel (alloying)', true], ['Attaching magnesium blocks', true],
          ['Washing with salt water', false], ['Keeping it in moist air', false], ['Scratching off the zinc coating', false],
        ], ['Rusting needs air and water.', 'Salt speeds it up.'], 'Barriers (paint, oil), sacrificial metals (zinc, magnesium) and alloying all prevent rusting.'),
        mcq('concept', 'Rusting needs BOTH oxygen and water.', [
          ['The chemical formula of rust is…', 'Fe₂O₃·xH₂O', ['FeO', 'Fe₃O₄', 'FeCl₃'], 'Hydrated iron(III) oxide.', 'Rust is hydrated ferric oxide.'],
          ['An iron nail in boiled water covered with oil does not rust because…', 'There is no air (oxygen)', ['There is no water', 'Oil is a catalyst', 'Boiled water is acidic'], 'Boiling removes dissolved air; oil stops it re-entering.', 'Without oxygen rusting cannot occur.'],
          ['Anhydrous calcium chloride is used in the rusting experiment to…', 'Absorb moisture', ['Supply oxygen', 'Add salt', 'Heat the nail'], 'Keep the air dry.', 'It removes water vapour from the air in the tube.'],
          ['Galvanising means coating iron with…', 'Zinc', ['Tin', 'Copper', 'Chromium'], 'Galvanised buckets.', 'A zinc coating protects iron.'],
          ['Silver articles become black because of…', 'Silver sulphide', ['Silver oxide', 'Silver chloride', 'Silver carbonate'], 'Sulphur compounds in air.', 'H₂S in air reacts to form black Ag₂S.'],
          ['Why do food cans use tin coating rather than zinc?', 'Tin is less reactive and does not react with food acids', ['Tin is cheaper than iron', 'Zinc is too heavy', 'Tin is magnetic'], 'Food contains acids.', 'Zinc would react with food acids; tin is safe.'],
          ['Stainless steel does not rust because…', 'It is an alloy of iron with chromium and nickel', ['It is pure iron', 'It is painted', 'It contains no iron'], 'Alloying.', 'Chromium forms a protective layer.'],
        ]),
        matchT('match', 'metal to its corrosion product', [
          ['Iron', 'Reddish-brown rust (Fe₂O₃·xH₂O)'], ['Silver', 'Black silver sulphide'], ['Copper', 'Green basic copper carbonate'], ['Aluminium', 'Thin protective oxide layer (Al₂O₃)'], ['Zinc', 'White zinc oxide/carbonate layer'],
        ], ['Colours help: red-brown, black, green.', 'Aluminium and zinc form protective layers.']),
      ],
    },
  ],
};

// =====================================================================================
// Chapter 12 — Carbon and its Compounds
// =====================================================================================
const ROOTS = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec'];
const NAMED: [string, string][] = [
  ['CH₄', 'Methane'], ['CH₃–CH₃', 'Ethane'], ['CH₃–CH₂–CH₃', 'Propane'], ['CH₃–CH₂–CH₂–CH₃', 'Butane'], ['CH₂=CH₂', 'Ethene'], ['CH₂=CH–CH₃', 'Propene'],
  ['CH≡CH', 'Ethyne'], ['CH≡C–CH₃', 'Propyne'], ['CH₃–OH', 'Methanol'], ['CH₃–CH₂–OH', 'Ethanol'], ['CH₃–CH₂–CH₂–OH', 'Propan-1-ol'], ['HCHO', 'Methanal'],
  ['CH₃–CHO', 'Ethanal'], ['CH₃–CO–CH₃', 'Propanone'], ['HCOOH', 'Methanoic acid'], ['CH₃–COOH', 'Ethanoic acid'], ['CH₃–Cl', 'Chloromethane'], ['CH₃–CH₂–Br', 'Bromoethane'],
  ['CH₂=CH–CH₂–CH₃', 'But-1-ene'], ['CH₃–CH₂–CH₂–CHO', 'Butanal'],
];
const FAMS: [string, (n: number) => number, number, string][] = [
  ['alkane', (n) => 2 * n + 2, 1, 'CₙH₂ₙ₊₂'], ['alkene', (n) => 2 * n, 2, 'CₙH₂ₙ'], ['alkyne', (n) => 2 * n - 2, 2, 'CₙH₂ₙ₋₂'],
];

const ch12: USpec = {
  id: 'ts10.ps.ch12', subject: 'chemistry', title: 'Carbon and its Compounds', source: src(12),
  objectives: [
    {
      id: 'ts10.ps.carbon.bonding', title: 'Bonding in carbon: tetravalency, hybridisation, catenation and allotropes', prereqs: ['ts10.ps.bond.hybrid'],
      intro: [
        h('One element, millions of compounds'),
        photo('✏️', 'The "lead" in your pencil is graphite — pure carbon. A diamond in a ring is also pure carbon. How can one element be so different?'),
        p('Carbon makes more compounds than all other elements put together — over ten million. Our food, clothes, fuels, medicines and our own bodies are built from carbon compounds. Two special abilities make this possible.'),
        def('Tetravalency', 'Carbon (2, 4) has four valence electrons. Losing or gaining four electrons is too hard, so it shares them, forming four covalent bonds.'),
        def('Catenation', 'The ability of an element to form bonds with atoms of the same element, making long chains, branched chains and rings. Carbon shows this more than any other element because C–C bonds are strong.'),
        h('Hybridisation in carbon'),
        p('Ground state 1s² 2s² 2p² has only two unpaired electrons. One 2s electron is promoted to 2p, giving four unpaired electrons, and the orbitals mix: sp³ in methane and ethane (4 single bonds, tetrahedral, 109°28′); sp² in ethene (one double bond, planar, 120°); sp in ethyne (one triple bond, linear, 180°).'),
        h('Allotropes of carbon'),
        def('Allotropes', 'Different physical forms of the same element in the same physical state, with different arrangements of atoms.'),
        p('Diamond: each carbon (sp³) is bonded to four others in a rigid 3-D network — the hardest natural substance, does not conduct electricity, used in cutting tools and jewellery. Graphite: each carbon (sp²) bonds to three others in flat hexagonal layers; layers slide over each other — soft, slippery (lubricant), and conducts electricity because of free electrons (electrodes, pencils). Fullerenes: C₆₀ (buckminsterfullerene) is a football-shaped cage of 60 carbon atoms. Graphene is a single layer of graphite; carbon nanotubes are rolled-up sheets — extremely strong.'),
        keys('Carbon is tetravalent and forms covalent bonds.', 'Catenation → chains, branches and rings.', 'sp³ (single), sp² (double), sp (triple) hybridisation.', 'Allotropes: diamond (hard, insulator), graphite (soft, conductor), fullerenes, graphene, nanotubes.'),
        remember('Graphite conducts because each carbon uses only 3 electrons in bonding; the 4th is free to move.'),
      ],
      examples: [
        ex('Why is diamond hard but graphite soft, though both are pure carbon?', ['Diamond: every C bonded to 4 others in a 3-D network — no weak direction.', 'Graphite: layers held by weak forces slide easily.'], 'Different arrangement of atoms'),
        ex('What is the hybridisation of each carbon in propene, CH₂=CH–CH₃?', ['C1 and C2 form the double bond → sp²', 'C3 has only single bonds → sp³'], 'sp², sp², sp³'),
      ],
      practice: [
        mcq('allotropes', 'Arrangement of atoms decides properties.', [
          ['Which allotrope of carbon conducts electricity?', 'Graphite', ['Diamond', 'Both', 'Neither'], 'Free electrons.', 'Each C in graphite has one electron free to move.'],
          ['Diamond is very hard because…', 'Each carbon is bonded to four others in a 3-D network', ['It has free electrons', 'It has layers', 'It is a metal'], 'sp³ network.', 'Strong bonds in all directions make it rigid.'],
          ['Graphite is used as a lubricant because…', 'Its layers slide over each other', ['It is very hard', 'It is a liquid', 'It reacts with oil'], 'Weak forces between layers.', 'Layers held by weak forces slip easily.'],
          ['Buckminsterfullerene has the formula…', 'C₆₀', ['C₆', 'C₂₀', 'C₁₀₀'], 'Football shape.', 'C₆₀: a cage of 60 carbon atoms.'],
          ['The ability of carbon to form long chains with itself is called…', 'Catenation', ['Tetravalency', 'Isomerism', 'Hybridisation'], 'Chain = catena.', 'Self-linking into chains and rings is catenation.'],
          ['Carbon forms covalent bonds because…', 'Gaining or losing 4 electrons needs too much energy', ['It has 8 valence electrons', 'It is a metal', 'It has no valence electrons'], 'C⁴⁺ or C⁴⁻ are very hard to form.', 'Sharing four electrons is easier than transferring them.'],
        ]),
        mcq('hyb', 'Single bonds only → sp³; one double → sp²; one triple → sp.', [
          ['Hybridisation of carbon in methane?', 'sp³', ['sp²', 'sp', 'None'], 'Four single bonds.', 'Four σ bonds → sp³.'],
          ['Hybridisation of carbon in ethene?', 'sp²', ['sp³', 'sp', 'dsp²'], 'Double bond.', 'Three σ bonds + one π → sp².'],
          ['Hybridisation of carbon in ethyne?', 'sp', ['sp²', 'sp³', 'None'], 'Triple bond.', 'Two σ bonds + two π → sp.'],
          ['Hybridisation of carbon in diamond?', 'sp³', ['sp²', 'sp', 'None'], 'Four neighbours.', 'Each C bonds to four others tetrahedrally.'],
          ['Hybridisation of carbon in graphite?', 'sp²', ['sp³', 'sp', 'None'], 'Three neighbours in a plane.', 'Each C bonds to three others in a flat sheet.'],
          ['Bond angle around an sp² carbon is…', '120°', ['109°28′', '180°', '90°'], 'Trigonal planar.', 'Three orbitals in a plane: 120°.'],
        ]),
        matchT('match', 'form of carbon to its property or use', [
          ['Diamond', 'Hardest natural substance; cutting tools'], ['Graphite', 'Conducts electricity; pencil lead'], ['Fullerene C₆₀', 'Football-shaped molecule'],
          ['Graphene', 'Single layer of carbon atoms'], ['Carbon nanotube', 'Rolled-up carbon sheet, very strong'],
        ], ['Diamond and graphite are opposites in hardness and conduction.', 'Graphene is one sheet; a nanotube is a rolled sheet.']),
      ],
    },
    {
      id: 'ts10.ps.carbon.hydro', title: 'Hydrocarbons, functional groups and isomerism', prereqs: ['ts10.ps.carbon.bonding'],
      intro: [
        h('Compounds of just carbon and hydrogen'),
        photo('🔥', 'The LPG in your kitchen is mostly propane and butane — simple hydrocarbons.'),
        def('Hydrocarbon', 'A compound containing only carbon and hydrogen.'),
        p('Saturated hydrocarbons (alkanes) have only single C–C bonds: CₙH₂ₙ₊₂ — methane CH₄, ethane C₂H₆, propane C₃H₈. Unsaturated hydrocarbons have double or triple bonds: alkenes CₙH₂ₙ (ethene C₂H₄) and alkynes CₙH₂ₙ₋₂ (ethyne C₂H₂, used in gas welding). Hydrocarbons can be open chains (straight or branched) or rings (cyclohexane C₆H₁₂, benzene C₆H₆).'),
        f('Alkane: CₙH₂ₙ₊₂   Alkene: CₙH₂ₙ   Alkyne: CₙH₂ₙ₋₂'),
        xp({
          title: 'What if? Count the hydrogens', formula: 'H = 2n + 2 − 2d   (d = number of double-bond equivalents: 0 alkane, 1 alkene, 2 alkyne)',
          res: ['H', 'Number of hydrogen atoms', '', '2 * n + 2 - 2 * d', 0],
          vars: [['n', 'Number of carbon atoms', '', 2, 10, 1, 3], ['d', 'Double-bond equivalents (0, 1 or 2)', '', 0, 2, 1, 0]],
          notes: [
            ['n', 'Each extra carbon (one more –CH₂– link) adds exactly 2 hydrogens.', 'Removing a carbon removes 2 hydrogens.'],
            ['d', 'Each double bond (or ring) removes 2 hydrogens; a triple bond counts as 2 and removes 4.', 'Fewer multiple bonds means more hydrogens — a saturated alkane holds the most.'],
          ],
          mistakes: [['Using CₙH₂ₙ for alkanes', 'Alkanes are CₙH₂ₙ₊₂; CₙH₂ₙ is the alkene formula.'], ['Thinking C₂H₂ is an alkene', 'C₂H₂ fits CₙH₂ₙ₋₂, so it is ethyne, an alkyne.']],
          real: 'Butane in LPG has n = 4 and no double bonds: C₄H₁₀.',
        }),
        h('Functional groups'),
        def('Functional group', 'An atom or group of atoms that decides the characteristic chemical properties of an organic compound.'),
        p('Alcohol –OH (ethanol), aldehyde –CHO (ethanal), ketone >C=O (propanone), carboxylic acid –COOH (ethanoic acid), halo group –Cl, –Br (chloromethane), ester –COO– (ethyl ethanoate), and the C=C and C≡C bonds themselves.'),
        h('Isomerism'),
        def('Structural isomers', 'Compounds with the same molecular formula but different structures (and so different properties).'),
        p('C₄H₁₀ has two isomers: n-butane (straight chain) and isobutane (2-methylpropane, branched). C₅H₁₂ has three, C₆H₁₄ has five. Isomers can also differ in the position of a functional group (propan-1-ol and propan-2-ol) or even in the functional group itself (ethanol C₂H₅OH and dimethyl ether CH₃OCH₃ share C₂H₆O).'),
        keys('Saturated: single bonds only (alkanes). Unsaturated: double/triple bonds.', 'General formulae: CₙH₂ₙ₊₂, CₙH₂ₙ, CₙH₂ₙ₋₂.', 'Functional groups: –OH, –CHO, >C=O, –COOH, –X.', 'Isomers: same molecular formula, different structure.'),
        remember('Number of structural isomers: C₄H₁₀ → 2, C₅H₁₂ → 3, C₆H₁₄ → 5.'),
      ],
      examples: [
        ex('Write the formula of the alkene with 5 carbon atoms.', ['Alkene: CₙH₂ₙ', 'n = 5 → H = 10'], 'C₅H₁₀ (pentene)'),
        ex('Draw the two isomers of C₄H₁₀.', ['Straight chain: CH₃–CH₂–CH₂–CH₃ (n-butane)', 'Branched: CH₃–CH(CH₃)–CH₃ (isobutane, 2-methylpropane)', 'Same formula, different structures'], 'n-butane and isobutane'),
      ],
      practice: [
        tp('formula', (r) => {
          const [fam, hOf, nMin, gen] = r.pick(FAMS);
          const n = r.int(Math.max(2, nMin), 8);
          const H = hOf(n);
          return numQ(`How many hydrogen atoms are there in the ${fam} with ${n} carbon atoms (${ROOTS[n - 1]}${fam.slice(-3)})?`, H, undefined,
            [`General formula of ${fam}s: ${gen}`, `Put n = ${n}.`], [`${gen} with n = ${n} → C${subN(n)}H${subN(H)}`, `H = ${H}`],
            fam !== 'alkane' ? [{ when: String(2 * n + 2), explain: `That is the alkane formula. ${fam}s have fewer hydrogens.` }] : []);
        }),
        tp('family', (r) => {
          const n = r.int(2, 7);
          const [fam, hOf] = r.pick(FAMS);
          const f2 = `C${subN(n)}H${subN(hOf(n))}`;
          return {
            type: 'mcq', prompt: `To which family does ${f2} belong (assume an open chain)?`, ...choose(r, fam[0].toUpperCase() + fam.slice(1), ['Alkane', 'Alkene', 'Alkyne'].filter((x) => x.toLowerCase() !== fam)),
            hints: ['Compare H with 2n + 2, 2n and 2n − 2.', `n = ${n}`],
            mistakes: [{ when: 'wrong', explain: 'Alkane: H = 2n + 2; alkene: H = 2n; alkyne: H = 2n − 2.' }],
            solution: [`n = ${n}, H = ${hOf(n)}`, `${f2} fits ${FAMS.find((x) => x[0] === fam)![3]} → ${fam}`],
          };
        }),
        mcq('fg', 'Spot the special group of atoms.', [
          ['The functional group in ethanol is…', '–OH (alcohol)', ['–CHO', '–COOH', '>C=O'], 'Name ends in -ol.', 'Alcohols contain the hydroxyl group.'],
          ['The functional group in ethanoic acid is…', '–COOH (carboxylic acid)', ['–OH', '–CHO', '–Cl'], 'Name ends in -oic acid.', 'Carboxylic acids contain –COOH.'],
          ['The functional group in ethanal is…', '–CHO (aldehyde)', ['>C=O (ketone)', '–OH', '–COOH'], 'Name ends in -al.', 'Aldehydes contain –CHO.'],
          ['Propanone contains which functional group?', 'Ketone (>C=O)', ['Aldehyde', 'Alcohol', 'Carboxylic acid'], 'Name ends in -one.', 'Ketones have C=O between two carbons.'],
          ['How many structural isomers does C₅H₁₂ have?', '3', ['2', '5', '1'], 'Pentane, isopentane, neopentane.', 'n-pentane, 2-methylbutane and 2,2-dimethylpropane.'],
          ['Ethanol and dimethyl ether are isomers because they have…', 'The same molecular formula C₂H₆O', ['The same structure', 'The same boiling point', 'The same functional group'], 'Isomer definition.', 'Same formula, different structures and groups.'],
          ['Which is a saturated hydrocarbon?', 'C₃H₈', ['C₃H₆', 'C₂H₂', 'C₂H₄'], 'CₙH₂ₙ₊₂', 'C₃H₈ = propane, an alkane.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.carbon.iupac', title: 'Homologous series and IUPAC nomenclature', prereqs: ['ts10.ps.carbon.hydro'],
      intro: [
        h('Families that grow one step at a time'),
        photo('🧱', 'Like adding one brick at a time, each member of a homologous series has one more –CH₂– unit than the one before.'),
        def('Homologous series', 'A family of organic compounds with the same functional group and similar chemical properties, in which successive members differ by a –CH₂– unit (14 u in molecular mass).'),
        p('Example (alcohols): CH₃OH, C₂H₅OH, C₃H₇OH … All have –OH and react similarly, but physical properties (boiling point, melting point) change gradually as the chain grows.'),
        f('Molar mass of alkane CₙH₂ₙ₊₂ = 14n + 2'),
        xp({
          title: 'What if? Climb the alkane series', formula: 'M = 12n + (2n + 2) = 14n + 2',
          res: ['M', 'Molar mass', 'g/mol', '14 * n + 2', 0],
          vars: [['n', 'Number of carbon atoms', '', 1, 10, 1, 4]],
          notes: [['n', 'Each step up the series adds –CH₂– = 14 g/mol, and boiling points rise steadily.', 'Each step down removes 14 g/mol; small alkanes like methane are gases.']],
          mistakes: [['Adding 12 for each new member', 'Each new member adds a carbon AND two hydrogens: 12 + 2 = 14.'], ['Using 14n for alkanes', 'Alkanes have two extra end hydrogens: 14n + 2.']],
          real: 'Methane (16), ethane (30), propane (44), butane (58): gases used as fuels; octane (114) is a liquid in petrol.',
        }),
        h('IUPAC names in three parts'),
        p('1. Word root from the number of carbons in the longest chain: meth (1), eth (2), prop (3), but (4), pent (5), hex (6), hept (7), oct (8), non (9), dec (10).'),
        p('2. Suffix from the type of bonds and functional group: -ane (all single), -ene (C=C), -yne (C≡C), -ol (alcohol), -al (aldehyde), -one (ketone), -oic acid (carboxylic acid).'),
        p('3. Prefix for substituents such as chloro (–Cl), bromo (–Br), methyl (–CH₃). Numbers show positions; number the chain from the end nearer the functional group or multiple bond.'),
        p('Examples: CH₃CH₂OH → eth + an + ol → ethanol. CH₃COOH → ethanoic acid. CH₃COCH₃ → propanone. CH₂=CH–CH₂–CH₃ → but-1-ene. CH₃Cl → chloromethane.'),
        keys('Homologous series: same functional group, differ by –CH₂– (14 u).', 'Physical properties change gradually; chemical properties similar.', 'Name = prefix + word root + suffix.', 'Number from the end nearer to the functional group or multiple bond.'),
        remember('Methanal (HCHO) and ethanal (CH₃CHO) are aldehydes; propanone is the simplest ketone.'),
      ],
      examples: [
        ex('Name CH₃–CH₂–CH₂–OH.', ['3 carbons → prop', 'Single bonds → an', '–OH on carbon 1 → -1-ol'], 'Propan-1-ol'),
        ex('Write the formula of the fifth member of the alcohol series and its molar mass.', ['Alcohols CₙH₂ₙ₊₁OH', 'n = 5 → C₅H₁₁OH', 'M = 5 × 12 + 12 × 1 + 16 = 88 g/mol'], 'C₅H₁₁OH, 88 g/mol'),
      ],
      practice: [
        tp('name', (r) => {
          const [fm, name] = r.pick(NAMED);
          const wrong = r.shuffle(NAMED.map((x) => x[1]).filter((x) => x !== name)).slice(0, 3);
          return {
            type: 'mcq', prompt: `What is the IUPAC name of ${fm}?`, ...choose(r, name, wrong),
            hints: ['Count the carbons in the chain for the word root.', 'Find the suffix: -ane, -ene, -yne, -ol, -al, -one, -oic acid; prefix for Cl/Br.'],
            mistakes: [{ when: 'wrong', explain: 'Build the name: carbons → root, bond type/functional group → suffix, halogen → prefix.' }],
            solution: [`${fm} → ${name}`],
          };
        }, 2),
        tp('mass', (r) => {
          const fams: [string, (n: number) => number, string, number][] = [['alkane', (n) => 14 * n + 2, 'CₙH₂ₙ₊₂', 1], ['alkene', (n) => 14 * n, 'CₙH₂ₙ', 2], ['alkyne', (n) => 14 * n - 2, 'CₙH₂ₙ₋₂', 2], ['alcohol', (n) => 14 * n + 18, 'CₙH₂ₙ₊₁OH', 1]];
          const [fam, M, gen, nMin] = r.pick(fams);
          const n = r.int(nMin, 8);
          return numQ(`Find the molar mass of the ${fam} with ${n} carbon atom${n > 1 ? 's' : ''} (${gen}; C = 12, H = 1, O = 16).`, M(n), undefined,
            [`Write the formula with n = ${n}.`, 'Add 12 per C, 1 per H, 16 per O.'], [`Molar mass = ${M(n)} g/mol`]);
        }),
        mcq('series', 'Homologues differ by –CH₂–.', [
          ['Successive members of a homologous series differ by…', '–CH₂– (14 u)', ['–CH₃ (15 u)', '–C– (12 u)', '–H₂ (2 u)'], 'One carbon and two hydrogens.', 'Each step adds one CH₂ unit = 14 u.'],
          ['Members of a homologous series have similar…', 'Chemical properties', ['Boiling points', 'Molecular masses', 'Physical states'], 'Same functional group.', 'Same functional group → similar reactions.'],
          ['The suffix "-ene" shows…', 'A carbon–carbon double bond', ['A triple bond', 'An alcohol', 'A ketone'], 'Ethene, propene.', '-ene means a C=C double bond.'],
          ['The word root for a chain of 5 carbons is…', 'Pent', ['Hex', 'But', 'Prop'], 'Like pentagon.', 'Pent = 5.'],
          ['The next homologue of C₂H₅OH is…', 'C₃H₇OH', ['C₃H₈OH', 'C₂H₆OH', 'C₄H₉OH'], 'Add CH₂.', 'C₂H₅OH + CH₂ → C₃H₇OH.'],
          ['Which pair belongs to the same homologous series?', 'CH₄ and C₂H₆', ['CH₄ and C₂H₄', 'C₂H₄ and C₂H₂', 'CH₃OH and CH₃COOH'], 'Same general formula.', 'Both are alkanes, differing by CH₂.'],
        ]),
      ],
    },
    {
      id: 'ts10.ps.carbon.reactions', title: 'Chemical properties of carbon compounds; ethanol and ethanoic acid', prereqs: ['ts10.ps.carbon.iupac'],
      intro: [
        h('What carbon compounds do'),
        photo('🕯️', 'A candle flame is a carbon compound burning. A yellow, sooty flame means not enough oxygen; a clean blue flame means complete combustion.'),
        h('1. Combustion'),
        p('Carbon compounds burn in oxygen to give CO₂, water, heat and light: CH₄ + 2O₂ → CO₂ + 2H₂O + heat. Saturated hydrocarbons usually burn with a clean blue flame; unsaturated ones give a yellow sooty flame. With too little oxygen, poisonous carbon monoxide forms.'),
        h('2. Oxidation'),
        p('Strong oxidising agents add oxygen. Ethanol is oxidised to ethanoic acid by alkaline potassium permanganate (purple colour disappears) or acidified potassium dichromate: CH₃CH₂OH —[O]→ CH₃COOH.'),
        h('3. Addition reaction'),
        p('Unsaturated compounds add atoms across the double or triple bond. Hydrogenation: CH₂=CH₂ + H₂ —Ni, heat→ CH₃–CH₃. This is how vegetable oils are turned into vanaspati ghee. Bromine water (orange) is decolourised by alkenes — a test for unsaturation.'),
        h('4. Substitution reaction'),
        p('In saturated hydrocarbons, one atom is replaced by another. In sunlight, chlorine replaces hydrogen in methane one by one: CH₄ + Cl₂ —sunlight→ CH₃Cl + HCl (and further CH₂Cl₂, CHCl₃, CCl₄).'),
        h('Ethanol and ethanoic acid'),
        p('Ethanol (C₂H₅OH): colourless liquid, used as a solvent and in medicines. 2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂ (hydrogen evolved). With hot concentrated H₂SO₄ (443 K) it loses water to form ethene. Ethanoic acid (CH₃COOH): vinegar is 5–8% ethanoic acid; pure acid freezes in cold weather (glacial acetic acid). It is a weak acid that reacts with NaHCO₃ to give CO₂.'),
        def('Esterification', 'Reaction of a carboxylic acid with an alcohol in the presence of concentrated sulphuric acid to form a sweet-smelling ester: CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O.'),
        keys('Combustion → CO₂ + H₂O + heat.', 'Oxidation: ethanol → ethanoic acid (alk. KMnO₄ or acid. K₂Cr₂O₇).', 'Addition (unsaturated): hydrogenation with Ni catalyst.', 'Substitution (saturated): CH₄ + Cl₂ in sunlight.', 'Esterification: acid + alcohol → ester + water.'),
        remember('Addition = unsaturated compounds; substitution = saturated compounds. A sooty flame suggests an unsaturated compound.'),
      ],
      examples: [
        ex('Which reaction converts groundnut oil to vanaspati? Write it for ethene.', ['Oils contain C=C bonds (unsaturated).', 'Hydrogen is added with a nickel catalyst: hydrogenation.', 'CH₂=CH₂ + H₂ —Ni→ CH₃–CH₃'], 'Addition (hydrogenation)'),
        ex('Write the equation when ethanoic acid reacts with ethanol, and name the product.', ['Acid + alcohol, conc. H₂SO₄ catalyst', 'CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O'], 'Ethyl ethanoate (an ester) — esterification'),
      ],
      practice: [
        mcq('type', 'Look at what happens to the bonds.', [
          ['CH₄ + Cl₂ —sunlight→ CH₃Cl + HCl is…', 'Substitution', ['Addition', 'Combustion', 'Esterification'], 'H is replaced by Cl.', 'One atom is swapped for another: substitution.'],
          ['CH₂=CH₂ + H₂ —Ni→ CH₃–CH₃ is…', 'Addition', ['Substitution', 'Oxidation', 'Saponification'], 'Atoms add across the double bond.', 'H₂ adds to the C=C: addition (hydrogenation).'],
          ['C₂H₅OH —alk. KMnO₄→ CH₃COOH is…', 'Oxidation', ['Reduction', 'Addition', 'Esterification'], 'Oxygen is added.', 'Ethanol gains oxygen and loses hydrogen.'],
          ['CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O is…', 'Esterification', ['Saponification', 'Addition', 'Combustion'], 'Sweet-smelling product.', 'Acid + alcohol → ester + water.'],
          ['CH₄ + 2O₂ → CO₂ + 2H₂O is…', 'Combustion', ['Substitution', 'Addition', 'Esterification'], 'Burning in oxygen.', 'Complete combustion gives CO₂ and water.'],
          ['C₂H₅OH —conc. H₂SO₄, 443 K→ C₂H₄ + H₂O is…', 'Dehydration', ['Hydrogenation', 'Oxidation', 'Esterification'], 'Water is removed.', 'Concentrated sulphuric acid removes water from ethanol.'],
        ]),
        mcq('props', 'Recall the tests and uses.', [
          ['Which gas is evolved when sodium reacts with ethanol?', 'Hydrogen', ['Oxygen', 'Carbon dioxide', 'Chlorine'], 'Like metal + acid.', '2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂.'],
          ['Vinegar is a dilute solution of…', 'Ethanoic acid', ['Ethanol', 'Methanol', 'Hydrochloric acid'], 'Acetic acid.', 'Vinegar is 5–8% ethanoic acid.'],
          ['Unsaturated hydrocarbons usually burn with…', 'A yellow sooty flame', ['A clean blue flame', 'No flame', 'A green flame'], 'Higher carbon content.', 'Incomplete burning of extra carbon gives soot.'],
          ['Alkaline KMnO₄ is purple. On warming with ethanol it…', 'Loses its colour', ['Turns blue', 'Turns pink', 'Stays purple'], 'It is used up as an oxidising agent.', 'It oxidises ethanol and is decolourised.'],
          ['A sweet-smelling compound formed from an acid and an alcohol is a/an…', 'Ester', ['Ether', 'Aldehyde', 'Soap'], 'Used in perfumes.', 'Esters have fruity smells.'],
          ['Ethanoic acid reacts with sodium hydrogencarbonate to give…', 'Carbon dioxide', ['Hydrogen', 'Oxygen', 'Methane'], 'Acid + hydrogencarbonate.', 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂.'],
        ], 2),
        matchT('match', 'reaction to its condition or reagent', [
          ['Hydrogenation of oil', 'Nickel catalyst'], ['Chlorination of methane', 'Sunlight'], ['Oxidation of ethanol', 'Alkaline KMnO₄'],
          ['Esterification', 'Concentrated H₂SO₄'], ['Dehydration of ethanol', 'Hot conc. H₂SO₄ at 443 K'], ['Test for unsaturation', 'Bromine water decolourised'],
        ], ['Catalysts and conditions are written above the arrow.', 'Two reactions use sulphuric acid — one also needs a high temperature.']),
      ],
    },
    {
      id: 'ts10.ps.carbon.soap', title: 'Soaps, saponification and micelles', prereqs: ['ts10.ps.carbon.reactions'],
      intro: [
        h('How does soap remove oily dirt?'),
        photo('🧴', 'Water alone cannot wash away an oily curry stain. Add soap and the oil lifts off. The secret is a molecule with two personalities.'),
        def('Soap', 'The sodium or potassium salt of a long-chain fatty acid, e.g. sodium stearate C₁₇H₃₅COONa.'),
        def('Saponification', 'The alkaline hydrolysis of an oil or fat (an ester) with sodium hydroxide to give soap and glycerol. Oil/fat + NaOH → soap + glycerol.'),
        p('A soap molecule has two ends. The long hydrocarbon tail is hydrophobic ("water-fearing") — it dissolves in oil. The ionic head (–COO⁻ Na⁺) is hydrophilic ("water-loving") — it stays in water.'),
        def('Micelle', 'A spherical cluster of soap molecules in water, with tails pointing inward (trapping oil) and heads pointing outward towards the water.'),
        p('When you wash a cloth, the tails dig into the oily dirt and the heads face the water. The dirt gets trapped in the centre of micelles. Since all the micelles have negative heads on the outside, they repel one another and stay suspended. Rinsing carries them away.'),
        h('Hard water and detergents'),
        p('Hard water contains calcium and magnesium salts. These react with soap to form an insoluble, sticky scum, so lots of soap is wasted and lather does not form easily. Detergents are sodium salts of long-chain sulphonic acids (or ammonium/sulphonate salts); their calcium and magnesium salts do not precipitate, so detergents work even in hard water. However, some detergents are not easily biodegradable and can pollute rivers.'),
        keys('Soap = Na/K salt of a long-chain fatty acid.', 'Saponification: fat + NaOH → soap + glycerol.', 'Hydrophobic tail in oil, hydrophilic head in water → micelle.', 'Hard water forms scum with soap; detergents work in hard water.'),
        remember('In a micelle, tails point INWARD (towards the oil), heads point OUTWARD (towards the water).'),
      ],
      examples: [
        ex('Why does soap form scum with hard water from a borewell in Nalgonda?', ['Borewell water often has Ca²⁺ and Mg²⁺ ions (hard water).', '2C₁₇H₃₅COONa + Ca²⁺ → (C₁₇H₃₅COO)₂Ca↓ + 2Na⁺', 'The calcium salt is insoluble — that is the scum.'], 'Insoluble calcium/magnesium salts of fatty acids form'),
        ex('Explain how a micelle removes oil from cloth.', ['Hydrophobic tails dissolve in the oil drop.', 'Hydrophilic heads stay in the water outside.', 'The oil is trapped inside a micelle and washed away.'], 'Oil trapped inside micelles is rinsed away'),
      ],
      practice: [
        orderT('micelle', 'Arrange the steps of how soap cleans an oily cloth.', [
          'Soap dissolves in water', 'Hydrophobic tails attach to the oily dirt', 'Micelles form with oil trapped inside', 'Micelles stay suspended because their heads repel each other', 'Rinsing washes the micelles away',
        ], ['Tails must attach to oil before micelles can form.', 'Rinsing is the last step.'], 'Dissolve → tails grab oil → micelles form → stay suspended → rinsed away.'),
        mcq('concept', 'Remember the two ends of a soap molecule.', [
          ['The hydrocarbon tail of a soap molecule is…', 'Hydrophobic (oil-loving)', ['Hydrophilic', 'Ionic', 'Acidic'], 'It avoids water.', 'The long chain dissolves in oil, not water.'],
          ['The –COO⁻Na⁺ head of a soap molecule is…', 'Hydrophilic', ['Hydrophobic', 'Neutral and oily', 'A metal'], 'Ionic end.', 'The ionic head is attracted to water.'],
          ['Saponification produces soap and…', 'Glycerol', ['Ethanol', 'Ethanoic acid', 'Methane'], 'Fats are esters of glycerol.', 'Fat + NaOH → soap + glycerol.'],
          ['Soap does not lather well in hard water because…', 'Calcium and magnesium ions form insoluble scum', ['Hard water is acidic', 'Soap dissolves too fast', 'Hard water is too hot'], 'Precipitate forms.', 'Ca²⁺ and Mg²⁺ react with soap to form scum.'],
          ['Detergents work in hard water because…', 'Their calcium and magnesium salts are soluble', ['They are acids', 'They contain no sodium', 'They are made from fats'], 'No scum.', 'Detergents do not precipitate with Ca²⁺/Mg²⁺.'],
          ['In a micelle, the tails point…', 'Inward towards the oil', ['Outward towards the water', 'Randomly', 'Towards the cloth only'], 'Tails avoid water.', 'Tails cluster inside around the oil; heads face the water.'],
        ]),
        tapT('tap', 'Tap every statement that is TRUE about soaps and detergents.', [
          ['Soaps are sodium or potassium salts of fatty acids', true], ['Saponification is alkaline hydrolysis of fats', true], ['Detergents work in hard water', true], ['Micelles keep oil suspended in water', true],
          ['Soap lathers well in hard water', false], ['Soap tails are hydrophilic', false], ['All detergents are easily biodegradable', false],
        ], ['Think about the scum in hard water.', 'Tails are hydrophobic.'], 'Soaps are fatty-acid salts made by saponification; micelles trap oil; detergents work in hard water but some are not biodegradable.'),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12];
