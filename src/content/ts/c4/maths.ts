// Telangana SCERT Class 4 — maths. Original teaching aligned to the official chapter list (src/content/ts/books.ts).
// One unit per textbook chapter (ids ts4.m.ch<n>); objectives ts4.m.<topic>.<skill>.
// Written for a 9-year-old: short sentences, Telangana settings, pictures first. Templates use only the Rng given.
import {
  tp, ex, p, h, tip, vis, stepsB, def, keys, remember, photo, num, frac, choose, chooseNum, ordering, tapAll,
  NAMES, type USpec, type QSpec, type TSpec,
} from '../../lib/kit';
import type { AnswerSpec, Rng } from '../../../shared/grading';
import type { VisualSpec } from '../../../shared/content';
import { tsSrc } from '../books';

// ------------------------------------------------------------------ helpers
const src = (ch: number) => tsSrc(4, 'maths', ch);
const nm = (r: Rng) => r.pick(NAMES).en;
const cm = (n: number) => n.toLocaleString('en-IN');
const pad2 = (n: number) => String(n).padStart(2, '0');
const hm = (hh: number, mm: number) => `${hh}:${pad2(mm)}`;
type Mk = [when: string, explain: string][];
const mk = (m: Mk) => (m.length ? { mistakes: m.map(([when, explain]) => ({ when, explain })) } : {});
const typed = (prompt: string, answer: AnswerSpec, hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'typed', keypad: answer.kind === 'fraction' ? 'fraction' : 'numeric', prompt, answer, hints, solution, ...mk(mistakes), ...extra,
});
const mcq = (r: Rng, prompt: string, correct: string, wrong: string[], hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...choose(r, correct, wrong), hints, solution, ...mk(mistakes), ...extra,
});
const mcqN = (r: Rng, prompt: string, correct: number, wrong: number[], hints: string[], solution: string[], mistakes: Mk = [], extra: Partial<QSpec> = {}): QSpec => ({
  type: 'mcq', prompt, ...chooseNum(r, correct, wrong, cm), hints, solution, ...mk(mistakes), ...extra,
});
/** concept bank entry: question, answer, wrong options, hints, solution, why-wrong, optional visual */
type B = [q: string, a: string, w: string[], hints: string[], sol: string, why: string, v?: VisualSpec];
/** a template drawing one question from a bank (needs >= 5 entries) */
const bank = (key: string, list: B[], d: 1 | 2 | 3 = 1): TSpec => tp(key, (r) => {
  const [q, a, w, hints, sol, why, v] = r.pick(list);
  return mcq(r, q, a, w, hints, [sol], [['wrong', why]], v ? { visual: v } : {});
}, d);
/** tap-all template: picks 2–3 correct and 2–3 wrong items from the pools */
const tapT = (key: string, prompt: string, yes: string[], no: string[], hints: string[], why: string): TSpec => tp(key, (r) => {
  const y = r.shuffle(yes).slice(0, r.int(2, 3)), n = r.shuffle(no).slice(0, r.int(2, 3));
  return {
    type: 'tap', prompt, ...tapAll(r, [...y.map((label) => ({ label, ok: true })), ...n.map((label) => ({ label, ok: false }))]),
    hints, solution: [`Yes: ${y.join(', ')}.`, `No: ${n.join(', ')}.`], mistakes: [{ when: 'wrong', explain: why }],
  };
});
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const w99 = (n: number) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
/** 4738 → "four thousand seven hundred thirty-eight" */
const words = (n: number) => {
  const parts: string[] = [];
  const th = Math.floor(n / 1000), hu = Math.floor((n % 1000) / 100), rest = n % 100;
  if (th) parts.push(`${w99(th)} thousand`);
  if (hu) parts.push(`${ONES[hu]} hundred`);
  if (rest) parts.push(w99(rest));
  return parts.join(' ') || 'zero';
};
/** wrong answer from the "subtract smaller digit from larger" slip */
const smallFromLarge = (a: number, b: number) => {
  const A = String(a), Bs = String(b).padStart(A.length, '0');
  return +A.split('').map((d, i) => Math.abs(+d - +Bs[i])).join('');
};
/** 4-digit number with distinct, non-zero-leading digits */
const four = (r: Rng) => {
  const ds = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  if (ds[0] === 0) ds.push(ds.shift()!);
  return +ds.slice(0, 4).join('');
};
const MONTHS: [string, number][] = [['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30], ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31]];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ================================================================== CH 1
const ch1: USpec = {
  id: 'ts4.m.ch1', subject: 'math', title: 'Many Objects - Different Shapes', source: src(1),
  objectives: [
    {
      id: 'ts4.m.solids.roll', title: 'Things that roll and things that slide',
      intro: [
        h('Push it and watch!'),
        p('Put a ball, a matchbox and a tin of oil on the floor. Give each a gentle push.'),
        p('The ball rolls. The matchbox slides. The tin can roll on its side and slide when it stands up.'),
        photo('⚽', 'A ball is round all over. It rolls in every direction.'),
        vis({ kind: 'emoji', text: '⚽ rolls · 📦 slides · 🥫 rolls and slides' }, 'A ball rolls, a box slides, a tin does both'),
        def('Roll', 'To turn over and over while moving, like a wheel.'),
        def('Slide', 'To move along on a flat face without turning.'),
        keys('Curved surfaces help things roll.', 'Flat faces help things slide.', 'Things with both (a tin, a pipe) can roll and slide.'),
        tip('Ask: does it have a curved part? Does it have a flat face? Then you can guess!'),
      ],
      examples: [
        ex('Will a dice roll or slide when you push it?', ['A dice has only flat square faces.', 'It has no curved surface.'], 'It slides.'),
        ex('Can a steel glass roll and slide?', ['Lying on its side, its curved surface touches the floor, so it rolls.', 'Standing up, its flat bottom touches the floor, so it slides.'], 'Yes, it can do both.'),
      ],
      practice: [
        bank('rs', [
          ['When you push a cricket ball, what does it do?', 'Rolls', ['Slides', 'Rolls and slides'], ['Does a ball have any flat face?', 'Curved all over means it only rolls.'], 'A ball is curved all over, so it rolls.', 'A ball has no flat face to slide on.'],
          ['When you push a brick, what does it do?', 'Slides', ['Rolls', 'Rolls and slides'], ['Look for curved parts on a brick.', 'A brick has only flat faces.'], 'A brick has only flat faces, so it slides.', 'A brick has no curved surface to roll on.'],
          ['What can a tin of ghee do?', 'Rolls and slides', ['Only rolls', 'Only slides'], ['A tin has a curved side AND flat ends.', 'Curved side → rolls; flat end → slides.'], 'A tin has a curved side and two flat faces, so it can roll and slide.', 'Remember the flat top and bottom of the tin as well as its curved side.'],
          ['When you push a lemon, what does it do?', 'Rolls', ['Slides', 'Rolls and slides'], ['Is a lemon round?', 'It has no flat face.'], 'A lemon is round, so it rolls.', 'A lemon has no flat face.'],
          ['What does a geometry box do when pushed on the bench?', 'Slides', ['Rolls', 'Rolls and slides'], ['Its faces are all flat rectangles.', 'Flat faces slide.'], 'A geometry box has only flat faces, so it slides.', 'It has no curved surface.'],
          ['What can a round pencil do?', 'Rolls and slides', ['Only rolls', 'Only slides'], ['It is round along its length.', 'It can also stand on its flat end.'], 'A round pencil rolls on its side and slides on its flat end.', 'Look at both its long curved side and its flat end.'],
          ['When you push a marble, what does it do?', 'Rolls', ['Slides', 'Rolls and slides'], ['A marble is a tiny ball.', 'Balls roll.'], 'A marble is a sphere, so it rolls.', 'A marble has no flat face.'],
        ]),
        tapT('roll', 'Tap ALL the things that can roll.', ['ball', 'marble', 'orange', 'bangle', 'tin of oil', 'wheel'], ['matchbox', 'dice', 'brick', 'book', 'eraser (block)'],
          ['Look for a curved surface.', 'Things with only flat faces cannot roll.'], 'Only things with a curved surface can roll.'),
      ],
    },
    {
      id: 'ts4.m.solids.names', title: '3D shapes of everyday things',
      intro: [
        h('Shapes you can hold'),
        p('Things around us have solid (3D) shapes. They take up space and you can hold them.'),
        photo('📦', 'A box is a cuboid. It has 6 flat faces shaped like rectangles.'),
        photo('🎲', 'A dice is a cube. All its 6 faces are equal squares.'),
        vis({ kind: 'emoji', text: '🎲 cube · 📦 cuboid · 🥫 cylinder · 🍦 cone · ⚽ sphere' }, 'Five common solid shapes'),
        stepsB('Cube: 6 equal square faces, 12 edges, 8 corners.', 'Cuboid: 6 rectangle faces, 12 edges, 8 corners.', 'Cylinder: 2 flat circle faces and a curved side.', 'Cone: 1 flat circle face and a pointed tip.', 'Sphere: curved all over, no flat face.'),
        keys('Faces are the flat parts.', 'Edges are where two faces meet.', 'Corners are where edges meet.'),
        tip('Count edges in groups: 4 on top, 4 at the bottom, 4 standing up = 12.'),
      ],
      examples: [
        ex('What shape is a laddu?', ['It is round all over.', 'It has no flat face.'], 'A sphere'),
        ex('How many faces does a matchbox have?', ['Top and bottom: 2', 'Front and back: 2', 'Left and right: 2', '2 + 2 + 2 = 6'], '6 faces'),
      ],
      practice: [
        bank('name', [
          ['What shape is a dice?', 'Cube', ['Cuboid', 'Sphere', 'Cylinder'], ['All its faces are equal squares.', 'Equal square faces → cube.'], 'A dice is a cube.', 'A cuboid has rectangle faces; a dice has equal squares.'],
          ['What shape is a brick?', 'Cuboid', ['Cube', 'Cone', 'Cylinder'], ['Its faces are rectangles.', 'Rectangle faces → cuboid.'], 'A brick is a cuboid.', 'A brick is longer than it is wide, so it is not a cube.'],
          ['What shape is a gas cylinder or a tin?', 'Cylinder', ['Cone', 'Sphere', 'Cuboid'], ['It has two flat circles and a curved side.', 'That is a cylinder.'], 'It is a cylinder.', 'A cone has only one flat circle.'],
          ['What shape is a birthday cap?', 'Cone', ['Cylinder', 'Cube', 'Sphere'], ['It has a pointed tip.', 'One circle face plus a tip → cone.'], 'A birthday cap is a cone.', 'A cylinder has no pointed tip.'],
          ['What shape is a football?', 'Sphere', ['Cone', 'Cube', 'Cylinder'], ['It is round all over.', 'No flat face → sphere.'], 'A football is a sphere.', 'A football has no flat faces.'],
          ['What shape is a carrom-coin box (all sides equal squares)?', 'Cube', ['Cuboid', 'Cone', 'Sphere'], ['All faces are equal squares.', 'That is a cube.'], 'It is a cube.', 'Equal squares on every side make a cube.'],
          ['What shape is an ice-cream cone?', 'Cone', ['Cylinder', 'Sphere', 'Cuboid'], ['It narrows to a point.', 'Pointed tip → cone.'], 'It is a cone.', 'It comes to a point, so it is a cone.'],
        ]),
        tp('count', (r) => {
          const list: [string, string, number][] = [
            ['a cube (dice)', 'faces', 6], ['a cube (dice)', 'edges', 12], ['a cube (dice)', 'corners', 8], ['a cuboid (box)', 'faces', 6],
            ['a cuboid (box)', 'edges', 12], ['a cuboid (box)', 'corners', 8], ['a cylinder (tin)', 'flat faces', 2], ['a cone (cap)', 'flat faces', 1], ['a sphere (ball)', 'flat faces', 0],
          ];
          const [o, w, n] = r.pick(list);
          return typed(`How many ${w} does ${o} have?`, num(n), ['Imagine holding it and turning it around.', w.includes('edges') ? '4 on top + 4 at the bottom + 4 standing.' : 'Touch each one once as you count.'],
            [`${o[0].toUpperCase()}${o.slice(1)} has ${n} ${w}.`], n === 12 ? [['8', 'That is the number of corners. Edges are the lines: 4 + 4 + 4 = 12.']] : n === 8 ? [['12', 'That is the number of edges. Corners are the points: 4 on top + 4 below = 8.']] : []);
        }),
      ],
    },
  ],
};

// ================================================================== CH 2
const ch2: USpec = {
  id: 'ts4.m.ch2', subject: 'math', title: 'Different Views - Different Sides', source: src(2),
  objectives: [
    {
      id: 'ts4.m.views.tfs', title: 'Top, front and side views',
      intro: [
        h('Same thing, different looks'),
        p('Stand on a chair and look down at a steel glass. You see a circle. Now bend down and look from the front. You see a rectangle!'),
        photo('🥛', 'A glass from the top looks like a circle. From the front it looks like a rectangle.'),
        vis({ kind: 'shape', shape: 'circle' }, 'Top view of a glass: a circle'),
        vis({ kind: 'shape', shape: 'rectangle' }, 'Front view of a glass: a rectangle'),
        keys('Top view: what a bird sees.', 'Front view: what you see standing in front.', 'Side view: what you see from the left or right.'),
        tip('Close one eye and imagine your eye exactly at the top, front or side.'),
      ],
      examples: [
        ex('What is the top view of a dice?', ['Look straight down at the top face.', 'The top face is a square.'], 'A square', { kind: 'shape', shape: 'square' }),
        ex('What is the front view of a tent?', ['From the front you see its slanted sides meeting at the top.', 'Slanted sides and a base make a triangle.'], 'A triangle', { kind: 'shape', shape: 'triangle' }),
      ],
      practice: [
        tp('view', (r) => {
          const list: [string, string, string][] = [
            ['a steel glass', 'top', 'Circle'], ['a dice', 'top', 'Square'], ['a matchbox lying flat', 'top', 'Rectangle'], ['a ball', 'top', 'Circle'],
            ['a tent', 'front', 'Triangle'], ['a tin of oil (standing)', 'front', 'Rectangle'], ['a birthday cap', 'side', 'Triangle'], ['a bucket', 'top', 'Circle'],
            ['a brick lying flat', 'top', 'Rectangle'], ['a cube-shaped box', 'front', 'Square'],
          ];
          const [o, s, a] = r.pick(list);
          return mcq(r, `What shape do you see when you look at ${o} from the ${s}?`, a, ['Circle', 'Square', 'Rectangle', 'Triangle'].filter((x) => x !== a),
            [`Imagine your eye exactly at the ${s}.`, 'Only the outline facing you matters.'], [`From the ${s}, ${o} looks like a ${a.toLowerCase()}.`],
            [['wrong', 'You may be thinking of a different side. Picture only the face that points at your eye.']]);
        }),
        bank('who', [
          ['A bird flies above a school bus. Which view does the bird see?', 'Top view', ['Front view', 'Side view'], ['Where is the bird?', 'Above means looking down.'], 'Looking down from above gives the top view.', 'The bird is above, not in front.'],
          ['The driver of an auto sees the bus coming towards him. Which view?', 'Front view', ['Top view', 'Side view'], ['The bus faces him.', 'Facing you = front.'], 'He sees the front of the bus.', 'The bus is coming straight at him, so he sees its front.'],
          ['You stand on the footpath as a bus passes by. Which view?', 'Side view', ['Top view', 'Front view'], ['The bus is passing beside you.', 'Beside = side.'], 'You see the side of the bus.', 'You are next to the bus, not in front or above.'],
          ['You look down at a coin on the table. What shape do you see?', 'Circle', ['Rectangle', 'Triangle', 'Square'], ['Looking down = top view.', 'A coin is round.'], 'The top view of a coin is a circle.', 'From the top, a coin is round.'],
          ['You look at a coin standing on its edge, from the side. What shape?', 'Thin rectangle', ['Circle', 'Triangle', 'Square'], ['A coin is very thin.', 'From the side you see only its thickness.'], 'From the side, a coin looks like a thin rectangle.', 'Only from the top/front face do you see the round shape.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.views.dir', title: 'Left, right and turning around',
      intro: [
        h('Where is it now?'),
        p('Raise your right hand. Things on that side are on your right. When you turn around to face the other way, left and right swap!'),
        photo('🧭', 'When you turn around, what was on your left is now on your right.'),
        vis({ kind: 'emoji', text: '🌳 ⬅️ 🧒 ➡️ 🏫' }, 'Tree on the left, school on the right'),
        keys('Turning around swaps left and right.', 'A friend facing you has left and right opposite to yours.', 'Front and back also swap when you turn around.'),
        tip('Turn your own body to check — it really helps!'),
      ],
      examples: [
        ex('Meena faces the temple. The well is on her left. She turns around. Where is the well now?', ['Turning around swaps left and right.', 'Left becomes right.'], 'On her right'),
        ex('Ravi faces Teja. Ravi raises his right hand. On which side of Teja\'s view is that hand?', ['They face each other.', 'Ravi\'s right is on Teja\'s left side.'], 'On Teja\'s left'),
      ],
      practice: [
        tp('turn', (r) => {
          const who = nm(r);
          const thing = r.pick(['the well', 'the banyan tree', 'the bus stop', 'the school gate', 'the water tank', 'the temple']);
          const side = r.pick(['left', 'right', 'front', 'back']);
          const opp: Record<string, string> = { left: 'right', right: 'left', front: 'back', back: 'front' };
          const LBL: Record<string, string> = { left: 'On the left', right: 'On the right', front: 'In front', back: 'Behind' };
          const turned = r.int(0, 1) === 1;
          const a = turned ? opp[side] : side;
          return mcq(r, `${who} is standing in the village. ${thing[0].toUpperCase() + thing.slice(1)} is ${side === 'front' ? `in front of ${who}` : side === 'back' ? `behind ${who}` : `on ${who}'s ${side}`}. ${turned ? `${who} turns around.` : `${who} does not move.`} Where is ${thing} now?`,
            LBL[a], Object.values(LBL).filter((x) => x !== LBL[a]),
            ['Did they turn around?', 'Turning around swaps left↔right and front↔back.'],
            [turned ? `Turning around swaps ${side} and ${a}.` : `Nothing changed, so it is still where it was: ${LBL[a].toLowerCase()}.`], [['wrong', 'Stand up and act it out: turning around swaps sides.']]);
        }),
        bank('face', [
          ['You and a friend face each other. You raise your left hand. On which side does your friend see it?', 'On their right', ['On their left', 'In front'], ['You face opposite ways.', 'Opposite ways swap left and right.'], 'Facing each other swaps sides: your left is on their right.', 'You are facing each other, so sides swap.'],
          ['In a mirror, you raise your right hand. Which hand does your mirror image seem to raise?', 'Left', ['Right', 'Both'], ['Try it in a mirror at home.', 'A mirror flips left and right.'], 'The mirror image seems to raise its left hand.', 'A mirror swaps left and right.'],
          ['You face north to the school and the shop is on your right. You turn around. Where is the shop?', 'On your left', ['On your right', 'In front'], ['Turning around swaps sides.', 'Right becomes left.'], 'After turning around, right becomes left.', 'You turned around, so sides swapped.'],
          ['The teacher faces the class and points to her right. On which side of the class is that?', 'The class\'s left', ['The class\'s right', 'Behind the class'], ['The teacher faces the children.', 'Facing each other swaps sides.'], 'Her right is the class\'s left.', 'She faces you, so her right is your left.'],
          ['You walk forward, then turn around. What was in front of you is now…', 'Behind you', ['In front of you', 'On your left'], ['Turning around swaps front and back.', 'Act it out.'], 'Turning around puts what was in front behind you.', 'Turning around swaps front and back.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 3
const SH: { name: string; shape: 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon'; n: number }[] = [
  { name: 'triangle', shape: 'triangle', n: 3 }, { name: 'square', shape: 'square', n: 4 }, { name: 'rectangle', shape: 'rectangle', n: 4 },
  { name: 'pentagon', shape: 'pentagon', n: 5 }, { name: 'hexagon', shape: 'hexagon', n: 6 },
];
const ch3: USpec = {
  id: 'ts4.m.ch3', subject: 'math', title: 'Some More Shapes', source: src(3),
  objectives: [
    {
      id: 'ts4.m.shapes.rectsq', title: 'Rectangles and squares: sides and corners',
      intro: [
        h('Four sides, four corners'),
        p('Look at your notebook cover. It has 4 sides and 4 corners. It is a rectangle.'),
        vis({ kind: 'shape', shape: 'rectangle' }, 'A rectangle'),
        vis({ kind: 'shape', shape: 'square' }, 'A square'),
        photo('📏', 'Use a ruler to check: opposite sides of a rectangle are equal.'),
        keys('Rectangle: 4 sides, 4 square corners, opposite sides equal.', 'Square: 4 sides, 4 square corners, ALL sides equal.', 'Every square is a special rectangle.'),
        tip('Check a square corner with the corner of a postcard. It fits exactly!'),
      ],
      examples: [
        ex('A rectangle is 8 cm long and 5 cm wide. How long is the side opposite the 8 cm side?', ['Opposite sides of a rectangle are equal.'], '8 cm'),
        ex('One side of a square is 6 cm. What is the length of each other side?', ['All sides of a square are equal.'], '6 cm'),
      ],
      practice: [
        tp('side', (r) => {
          const sq = r.int(0, 1) === 1;
          const a = r.int(3, 15), b = sq ? a : r.int(2, Math.max(2, a - 1));
          if (sq) return typed(`A square tile has one side of ${a} cm. What is the total length of all 4 sides?`, num(4 * a, 'cm'), ['All 4 sides of a square are equal.', `Add ${a} four times, or ${a} × 4.`], [`${a} + ${a} + ${a} + ${a} = ${4 * a} cm`], [[String(a), 'That is just one side. Add all four.'], [String(2 * a), 'That is only 2 sides. A square has 4.']]);
          return typed(`A rectangular photo frame is ${a} cm long and ${b} cm wide. How long is the side opposite the ${a} cm side?`, num(a, 'cm'), ['Opposite sides of a rectangle are equal.', 'Which side is opposite the long side?'], [`Opposite sides are equal, so it is ${a} cm.`], [[String(b), 'That is the width. The side opposite the length is also a length.']]);
        }),
        bank('prop', [
          ['How many corners does a rectangle have?', '4', ['3', '5', '6'], ['Touch each corner of your book.', 'Count them.'], 'A rectangle has 4 corners.', 'Count again on your notebook.'],
          ['Which shape has ALL 4 sides equal and square corners?', 'Square', ['Rectangle (not square)', 'Triangle', 'Circle'], ['Think of a carrom board.', 'All equal sides → square.'], 'A square has all sides equal.', 'A rectangle that is not a square has only opposite sides equal.'],
          ['In a rectangle, which sides are equal?', 'Opposite sides', ['Sides next to each other', 'No sides', 'Only one pair of neighbours'], ['Measure your book.', 'Top = bottom, left = right.'], 'Opposite sides of a rectangle are equal.', 'Neighbouring sides of a rectangle can be different.'],
          ['Is every square also a rectangle?', 'Yes', ['No'], ['A rectangle needs 4 square corners and equal opposite sides.', 'Does a square have these?'], 'Yes. A square has square corners and equal opposite sides.', 'A square follows every rule of a rectangle.'],
          ['A door is a rectangle. How many sides does it have?', '4', ['2', '3', '6'], ['Trace around a door with your finger.', 'Top, bottom, left, right.'], 'A rectangle has 4 sides.', 'Count top, bottom, left and right.'],
          ['What kind of corners does a rectangle have?', 'Square corners', ['Pointed corners', 'Round corners'], ['Fit the corner of a postcard in it.', 'They fit exactly.'], 'All 4 corners are square corners.', 'Rectangle corners are like a postcard corner.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.shapes.tri', title: 'Triangles and other flat shapes',
      intro: [
        h('Count the sides'),
        p('A triangle has 3 sides and 3 corners. A samosa looks like a triangle!'),
        vis({ kind: 'shape', shape: 'triangle' }, 'A triangle: 3 sides, 3 corners'),
        vis({ kind: 'shape', shape: 'hexagon' }, 'A hexagon: 6 sides, 6 corners'),
        photo('🔺', 'A triangle has three straight sides.'),
        keys('Triangle 3, square/rectangle 4, pentagon 5, hexagon 6 sides.', 'A closed flat shape has as many corners as sides.', 'A circle has no straight sides and no corners.'),
        tip('Put a dot on each corner as you count so you do not count one twice.'),
      ],
      examples: [
        ex('How many sides does a pentagon have?', ['Count each side once.', '1, 2, 3, 4, 5'], '5 sides', { kind: 'shape', shape: 'pentagon' }),
        ex('Two triangles are put side by side to make a square. How many corners does each triangle have?', ['Each triangle has 3 corners.'], '3 corners'),
      ],
      practice: [
        tp('sides', (r) => {
          const s = r.pick(SH), w = r.pick(['sides', 'corners']);
          return typed(`How many ${w} does this shape have?`, num(s.n), [`Touch each ${w === 'sides' ? 'side' : 'corner'} once.`, 'A closed shape has the same number of corners as sides.'], [`This is a ${s.name}. It has ${s.n} ${w}.`], [], { visual: { kind: 'shape', shape: s.shape } });
        }),
        tp('total', (r) => {
          const a = r.pick(SH), b = r.pick(SH.filter((x) => x !== a)), na = r.int(2, 4), nb = r.int(1, 3);
          return typed(`Kavya draws ${na} ${a.name}s and ${nb} ${b.name}${nb > 1 ? 's' : ''}. How many sides did she draw in all?`, num(na * a.n + nb * b.n),
            [`A ${a.name} has ${a.n} sides; a ${b.name} has ${b.n}.`, `${na} × ${a.n} + ${nb} × ${b.n}`], [`${na} × ${a.n} = ${na * a.n}`, `${nb} × ${b.n} = ${nb * b.n}`, `Total = ${na * a.n + nb * b.n}`], [[String(na + nb), 'That is the number of shapes. Count their sides.']]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 4
const ch4: USpec = {
  id: 'ts4.m.ch4', subject: 'math', title: 'Knowing Numbers', source: src(4),
  objectives: [
    {
      id: 'ts4.m.num.read', title: 'Reading and writing numbers up to 9999',
      intro: [
        h('Big numbers around us'),
        p('The Charminar is more than 400 years old. A school may have 1250 children. Numbers like these have 4 digits.'),
        photo('🧮', 'On an abacus, each rod is a place: thousands, hundreds, tens, ones.'),
        vis({ kind: 'emoji', text: 'Th H T O → 4 7 3 8' }, 'Place-value chart for 4738'),
        def('Thousand', '10 hundreds make 1 thousand: 1000.'),
        stepsB('Read the thousands digit and say "thousand".', 'Read the hundreds digit and say "hundred".', 'Read the last two digits together.'),
        keys('4738 = four thousand seven hundred thirty-eight.', 'A zero means "nothing in that place": 5062 = five thousand sixty-two.'),
        tip('Put a comma after the thousands digit to read easily: 4,738.'),
      ],
      examples: [
        ex('Write 3045 in words.', ['3 thousands → three thousand', '0 hundreds → say nothing', '45 → forty-five'], 'three thousand forty-five'),
        ex('Write "six thousand two hundred nine" in numerals.', ['Thousands: 6', 'Hundreds: 2', 'Tens: 0', 'Ones: 9'], '6209'),
      ],
      practice: [
        tp('words', (r) => {
          const x = four(r);
          const n = r.pick([x, x - (x % 100) + r.int(1, 9), r.int(1, 9) * 1000 + r.int(1, 99)]);
          const d = String(n);
          const swap = +(d[0] + d[2] + d[1] + d[3]);
          return mcq(r, `Which is the correct name of ${cm(n)}?`, words(n), [words(swap), words(n + 100 > 9999 ? n - 100 : n + 100), words(n + 10 > 9999 ? n - 10 : n + 10)],
            ['Read the thousands first, then the hundreds.', 'Then read the last two digits together.'], [`${cm(n)} = ${words(n)}`], [['wrong', 'Check each place: thousands, hundreds, then tens and ones.']]);
        }),
        tp('numeral', (r) => {
          const th = r.int(1, 9), hu = r.int(0, 9), te = r.int(0, 9), o = r.int(0, 9);
          const n = th * 1000 + hu * 100 + te * 10 + o;
          return typed(`Write in numerals: ${words(n)}`, num(n), ['Make a chart: Th H T O.', 'Put 0 in any empty place.'], [`Th ${th}, H ${hu}, T ${te}, O ${o} → ${n}`],
            hu === 0 ? [[String(th * 100 + te * 10 + o), 'You missed the zero in the hundreds place.']] : []);
        }),
      ],
    },
    {
      id: 'ts4.m.num.place', title: 'Place value and expanded form',
      intro: [
        h('Where a digit sits tells its value'),
        p('In 4738 the digit 7 is in the hundreds place. So it is worth 700, not 7.'),
        vis({ kind: 'emoji', text: '4738 = 4000 + 700 + 30 + 8' }, 'Expanded form of 4738'),
        photo('🪙', 'Ten ₹100 notes make ₹1000 — just as 10 hundreds make 1 thousand.'),
        keys('Place value = digit × its place (1, 10, 100, 1000).', 'Expanded form adds the place values.'),
        tip('Count how many digits are to the right of your digit: 3 digits → thousands.'),
      ],
      examples: [
        ex('What is the place value of 5 in 2563?', ['5 is in the hundreds place.', '5 × 100 = 500'], '500'),
        ex('Write 6000 + 40 + 7 as one number.', ['6 thousands, 0 hundreds, 4 tens, 7 ones'], '6047'),
      ],
      practice: [
        tp('pv', (r) => {
          const n = four(r), d = String(n), i = r.int(0, 3), pl = [1000, 100, 10, 1][i];
          const v = +d[i] * pl;
          return mcqN(r, `What is the place value of ${d[i]} in ${cm(n)}?`, v, [+d[i], +d[i] * (pl === 1 ? 10 : pl / 10), +d[i] * (pl === 1000 ? 100 : pl * 10)],
            ['Which place is the digit in?', 'Multiply the digit by that place.'], [`${d[i]} is in the ${['thousands', 'hundreds', 'tens', 'ones'][i]} place.`, `${d[i]} × ${pl} = ${cm(v)}`],
            [['wrong', 'Count places from the right: ones, tens, hundreds, thousands.']]);
        }),
        tp('expand', (r) => {
          const th = r.int(1, 9), hu = r.int(0, 9), te = r.int(0, 9), o = r.int(1, 9);
          const parts = [th * 1000, hu * 100, te * 10, o].filter((x) => x > 0);
          const n = th * 1000 + hu * 100 + te * 10 + o;
          return typed(`Write as one number: ${parts.join(' + ')}`, num(n), ['Put each part in its place: Th H T O.', 'Use 0 for any missing place.'], [`${parts.join(' + ')} = ${n}`],
            hu === 0 || te === 0 ? [[String(+String(n).replace(/0/g, '')), 'Keep a 0 in the empty place.']] : []);
        }),
      ],
    },
    {
      id: 'ts4.m.num.compare', title: 'Comparing and ordering numbers',
      intro: [
        h('Which is more?'),
        p('Teja saved ₹1450 and Sana saved ₹1540. Who saved more? Compare digit by digit from the left.'),
        vis({ kind: 'number-line', from: 1400, to: 1600, step: 50, marks: [1450, 1540] }, '1540 is to the right of 1450, so it is bigger'),
        photo('🏆', 'Comparing scores tells us who comes first.'),
        stepsB('More digits means a bigger number.', 'Same number of digits? Compare thousands first.', 'If equal, compare hundreds, then tens, then ones.'),
        keys('> means "is greater than", < means "is less than".', 'Ascending: smallest to largest. Descending: largest to smallest.'),
        tip('The open mouth of > or < always faces the bigger number.'),
      ],
      examples: [
        ex('Compare 3721 and 3712.', ['Thousands: 3 = 3', 'Hundreds: 7 = 7', 'Tens: 2 > 1'], '3721 > 3712'),
        ex('Arrange 2050, 2500, 2005 in ascending order.', ['All have 2 thousands.', 'Hundreds: 0, 5, 0 → 2500 is largest.', 'Between 2050 and 2005, tens 5 > 0.'], '2005, 2050, 2500'),
      ],
      practice: [
        tp('big', (r) => {
          const a = four(r), d = String(a);
          const opts = [a, +(d[0] + d[2] + d[1] + d[3]), +(d[0] + d[1] + d[3] + d[2]), +(d[1] !== '0' ? d[1] + d[0] + d[2] + d[3] : d[0] + d[3] + d[2] + d[1])];
          const uniq = [...new Set(opts)];
          const big = Math.max(...uniq);
          return mcq(r, 'Which number is the GREATEST?', cm(big), uniq.filter((x) => x !== big).map(cm), ['Compare the thousands digits first.', 'If they match, look at hundreds, then tens.'], [`${cm(big)} is the greatest.`], [['wrong', 'Start comparing from the leftmost digit.']]);
        }),
        tp('order', (r) => {
          const base = r.int(1, 8) * 1000;
          const ns = [...new Set([base + r.int(0, 9) * 100 + r.int(0, 99), base + r.int(0, 9) * 100 + r.int(0, 99), base + r.int(0, 9) * 10, base + 1000 + r.int(0, 999)])];
          while (ns.length < 4) ns.push(ns[ns.length - 1] + 1);
          const sorted = [...ns].sort((x, y) => x - y);
          return {
            type: 'order', prompt: 'Put these numbers in ascending order (smallest first).', ...ordering(r, sorted.map(cm)),
            hints: ['Look at the thousands digits.', 'Then the hundreds, tens and ones.'], solution: [sorted.map(cm).join(' < ')], mistakes: [{ when: 'wrong', explain: 'Ascending means smallest first. Compare digit by digit from the left.' }],
          };
        }),
        tp('sym', (r) => {
          const a = four(r);
          const b = r.pick([a + r.int(1, 9) * 10, a - r.int(1, 9), +String(a).split('').reverse().join('') || a + 1, a + 100]);
          const s = a > b ? '>' : a < b ? '<' : '=';
          return mcq(r, `Which sign goes in the box? ${cm(a)} ☐ ${cm(b)}`, s, ['>', '<', '='].filter((x) => x !== s), ['Compare from the left.', 'The open side faces the bigger number.'], [`${cm(a)} ${s} ${cm(b)}`], [['wrong', 'The open mouth of the sign faces the bigger number.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 5
const ch5: USpec = {
  id: 'ts4.m.ch5', subject: 'math', title: 'How Much More - How Much Less?', source: src(5),
  objectives: [
    {
      id: 'ts4.m.addsub.add', title: 'Adding bigger numbers',
      intro: [
        h('Add place by place'),
        p('A Bathukamma fair had 2345 visitors on Saturday and 1678 on Sunday. How many in all? Add ones, then tens, then hundreds, then thousands.'),
        vis({ kind: 'emoji', text: '  2345\n+ 1678\n= 4023' }, 'Column addition with carrying'),
        photo('🌸', 'Counting visitors at a festival needs big-number addition.'),
        stepsB('Write the numbers one under the other, ones under ones.', 'Add the ones. If the sum is 10 or more, carry 1 ten.', 'Do the same for tens, hundreds and thousands.'),
        keys('Line up the places.', 'Carry when a column adds to 10 or more.'),
        tip('Check: round both numbers and add. 2345 + 1678 is about 2300 + 1700 = 4000.'),
      ],
      examples: [
        ex('2345 + 1678', ['Ones: 5 + 8 = 13 → write 3, carry 1', 'Tens: 4 + 7 + 1 = 12 → write 2, carry 1', 'Hundreds: 3 + 6 + 1 = 10 → write 0, carry 1', 'Thousands: 2 + 1 + 1 = 4'], '4023'),
        ex('1506 + 2394', ['Ones: 6 + 4 = 10 → 0, carry 1', 'Tens: 0 + 9 + 1 = 10 → 0, carry 1', 'Hundreds: 5 + 3 + 1 = 9', 'Thousands: 1 + 2 = 3'], '3900'),
      ],
      practice: [
        tp('add', (r) => {
          const a = r.int(1000, 5999), b = r.int(100, 9999 - a > 3999 ? 3999 : 9999 - a);
          const noCarry = String(a).split('').reverse().map((d, i) => (+d + +(String(b).split('').reverse()[i] ?? 0)) % 10).reverse().join('');
          return typed(`Add: ${a} + ${b}`, num(a + b), ['Start with the ones column.', 'Carry 1 when a column makes 10 or more.'], [`${a} + ${b} = ${a + b}`],
            +noCarry !== a + b ? [[String(+noCarry), 'You forgot to carry. When a column makes 10 or more, carry 1 to the next place.']] : []);
        }),
        tp('word', (r) => {
          const ctx = r.pick(['children visited the Nehru Zoological Park in the morning', 'saplings were planted in Haritha Haram in the first week', 'tickets were sold at the Medaram jatara gate on day 1', 'people watched the Bonalu procession from one street']);
          const a = r.int(1000, 4999), b = r.int(1000, 4999);
          return typed(`${cm(a)} ${ctx}, and ${cm(b)} more came later. How many in all?`, num(a + b), ['"In all" means add.', 'Line up the places and carry.'], [`${a} + ${b} = ${a + b}`], [[String(Math.abs(a - b)), 'You subtracted. "In all" means put together — add.']]);
        }),
      ],
    },
    {
      id: 'ts4.m.addsub.sub', title: 'Subtracting bigger numbers',
      intro: [
        h('Take away place by place'),
        p('Ravi\'s father had ₹5000. He spent ₹2368 at the market. How much is left? Subtract from the ones place.'),
        vis({ kind: 'emoji', text: '  5000\n− 2368\n= 2632' }, 'Column subtraction with borrowing'),
        photo('🛒', 'Shopping uses subtraction to find the money left.'),
        stepsB('Write the bigger number on top.', 'If the top digit is smaller, borrow 1 from the next place (it becomes 10 more).', 'Check: add your answer to the number you took away.'),
        keys('Never subtract the top digit from the bottom digit.', 'Check by adding back.'),
        tip('2632 + 2368 = 5000 ✓ — adding back is a quick check.'),
      ],
      examples: [
        ex('5000 − 2368', ['Borrow through the zeros: 5000 = 4 thousands, 9 hundreds, 9 tens, 10 ones.', 'Ones: 10 − 8 = 2; Tens: 9 − 6 = 3; Hundreds: 9 − 3 = 6; Thousands: 4 − 2 = 2'], '2632'),
        ex('4721 − 1350', ['Ones: 1 − 0 = 1', 'Tens: 2 − 5 → borrow → 12 − 5 = 7', 'Hundreds: 6 − 3 = 3', 'Thousands: 4 − 1 = 3'], '3371'),
      ],
      practice: [
        tp('sub', (r) => {
          const a = r.int(2000, 9999), b = r.int(1000, a - 100);
          const slip = smallFromLarge(a, b);
          return typed(`Subtract: ${a} − ${b}`, num(a - b), ['Start from the ones.', 'If the top digit is smaller, borrow from the next place.'], [`${a} − ${b} = ${a - b}`, `Check: ${a - b} + ${b} = ${a}`],
            slip !== a - b ? [[String(slip), 'You took the smaller digit from the bigger one in some column. Borrow instead.']] : []);
        }),
        tp('left', (r) => {
          const who = nm(r), a = r.int(20, 99) * 100, b = r.int(1000, a - 500);
          return typed(`${who} had ₹${cm(a)} in a savings box. ${who} spent ₹${cm(b)} on books. How much money is left?`, num(a - b), ['"Left" means subtract.', 'Borrow through the zeros carefully.'], [`₹${a} − ₹${b} = ₹${a - b}`], [[String(a + b), 'You added. Money left means take away.']]);
        }),
      ],
    },
    {
      id: 'ts4.m.addsub.word', title: 'How many more? How many less?',
      intro: [
        h('Compare with subtraction'),
        p('To find "how many more" or "how many less", subtract the smaller number from the bigger one.'),
        vis({ kind: 'bar-graph', labels: ['Red house', 'Blue house'], values: [48, 31], unit: 'medals' }, 'Red house won 48 medals, Blue house won 31'),
        photo('🏅', 'Medal tables at sports day compare who won more.'),
        keys('"How many more" → bigger − smaller.', '"How many less/fewer" → bigger − smaller too.', '"In all/altogether" → add.'),
        tip('Underline the question words before you calculate.'),
      ],
      examples: [
        ex('Red house won 48 medals and Blue house won 31. How many more did Red win?', ['Bigger − smaller', '48 − 31 = 17'], '17 more medals', { kind: 'bar-graph', labels: ['Red', 'Blue'], values: [48, 31] }),
        ex('A school has 1250 girls and 1175 boys. How many fewer boys than girls?', ['1250 − 1175 = 75'], '75 fewer boys'),
      ],
      practice: [
        tp('medal', (r) => {
          const hs = r.shuffle(['Red', 'Blue', 'Green', 'Yellow']).slice(0, 2), a = r.int(25, 60), b = r.int(10, a - 3);
          const more = r.int(0, 1) === 1;
          return typed(more ? `On sports day ${hs[0]} house won ${a} medals and ${hs[1]} house won ${b}. How many MORE medals did ${hs[0]} win?` : `On sports day ${hs[0]} house won ${a} medals and ${hs[1]} house won ${b}. How many FEWER medals did ${hs[1]} win?`,
            num(a - b), ['Find the difference.', 'Bigger − smaller.'], [`${a} − ${b} = ${a - b}`], [[String(a + b), 'You added. "More" or "fewer" asks for the difference.']], { visual: { kind: 'bar-graph', labels: hs, values: [a, b], unit: 'medals' } });
        }),
        tp('mix', (r) => {
          const a = r.int(1200, 4000), b = r.int(300, 1100), c = r.int(100, b - 50);
          return typed(`A library had ${cm(a)} books. It bought ${cm(b)} new books and gave away ${cm(c)} old ones. How many books does it have now?`, num(a + b - c),
            ['First add the new books.', 'Then take away the books given away.'], [`${a} + ${b} = ${a + b}`, `${a + b} − ${c} = ${a + b - c}`], [[String(a + b), 'Do not forget to take away the books given away.']], { type: 'typed' });
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 6
const ch6: USpec = {
  id: 'ts4.m.ch6', subject: 'math', title: 'How Many Times?', source: src(6),
  objectives: [
    {
      id: 'ts4.m.mult.groups', title: 'Multiplication as equal groups',
      intro: [
        h('Equal groups, quick counting'),
        p('A tray has 4 rows of laddus with 6 in each row. Instead of counting one by one, say 4 times 6 = 24.'),
        vis({ kind: 'objects', emoji: '🟠', count: 24, groupsOf: 6 }, '4 groups of 6 laddus'),
        photo('🥚', 'Egg trays are made in rows and columns — easy to multiply!'),
        keys('Number of groups × number in each group = total.', '4 × 6 and 6 × 4 give the same answer.'),
        tip('If you forget a fact, add the group again: 6, 12, 18, 24.'),
      ],
      examples: [
        ex('There are 5 autos. Each carries 3 children. How many children?', ['5 groups of 3', '5 × 3 = 15'], '15 children'),
        ex('A box has 8 rows of 7 chocolates. How many chocolates?', ['8 × 7 = 56'], '56 chocolates'),
      ],
      practice: [
        tp('count', (r) => {
          const g = r.int(2, 6), n = r.int(2, 6), e = r.pick(['🍎', '🥭', '⭐', '🌼', '🎈', '🐟']);
          return typed(`How many in all? There are ${g} groups of ${n}.`, num(g * n), ['Count one group.', `Then multiply: ${g} × ${n}.`], [`${g} × ${n} = ${g * n}`], [[String(g + n), 'You added the number of groups and the number in a group. Multiply instead.']], { visual: { kind: 'objects', emoji: e, count: g * n, groupsOf: n } });
        }),
        tp('story', (r) => {
          const [ctx, unit] = r.pick([['benches in the classroom, each seating', 'children'], ['bunches of bananas, each with', 'bananas'], ['packets of pencils, each with', 'pencils'], ['buses to Ramappa temple, each carrying', 'children'], ['rows of chairs at the meeting, each with', 'chairs']]);
          const a = r.int(3, 9), b = r.int(4, 12);
          return typed(`There are ${a} ${ctx} ${b} ${unit}. How many ${unit} in all?`, num(a * b), ['Equal groups → multiply.', `${a} × ${b}`], [`${a} × ${b} = ${a * b}`], [[String(a + b), 'Equal groups need multiplication, not addition.']]);
        }),
      ],
    },
    {
      id: 'ts4.m.mult.split', title: 'Splitting numbers to multiply',
      intro: [
        h('Break a big number into easy parts'),
        p('14 × 6 looks hard. Split 14 into 10 and 4. Then 10 × 6 = 60 and 4 × 6 = 24. Add: 60 + 24 = 84.'),
        vis({ kind: 'objects', emoji: '🟦', count: 14, groupsOf: 10 }, '14 = 10 + 4'),
        photo('🧮', 'Tens and ones are easy to multiply separately.'),
        stepsB('Split the bigger number into tens and ones.', 'Multiply each part.', 'Add the two answers.'),
        keys('23 × 4 = 20 × 4 + 3 × 4 = 80 + 12 = 92.'),
        tip('Multiplying by 10 just adds a zero: 7 × 10 = 70.'),
      ],
      examples: [
        ex('23 × 4', ['23 = 20 + 3', '20 × 4 = 80', '3 × 4 = 12', '80 + 12 = 92'], '92'),
        ex('A box has 35 mangoes. How many in 6 boxes?', ['35 = 30 + 5', '30 × 6 = 180', '5 × 6 = 30', '180 + 30 = 210'], '210 mangoes'),
      ],
      practice: [
        tp('split', (r) => {
          const t = r.int(1, 9), o = r.int(1, 9), m = r.int(2, 9), n = t * 10 + o;
          return typed(`Use splitting: ${n} × ${m} = ?`, num(n * m), [`Split ${n} = ${t * 10} + ${o}.`, `${t * 10} × ${m} = ${t * 10 * m}, ${o} × ${m} = ${o * m}`], [`${t * 10} × ${m} = ${t * 10 * m}`, `${o} × ${m} = ${o * m}`, `${t * 10 * m} + ${o * m} = ${n * m}`],
            [[String(t * 10 * m + o), `You multiplied only the tens. Also do ${o} × ${m}.`], [String(t * m + o * m), 'Remember 2 tens × a number gives tens: add a zero.']]);
        }),
        tp('part', (r) => {
          const t = r.int(2, 9), o = r.int(1, 9), m = r.int(3, 9);
          return typed(`${t * 10 + o} × ${m} = ${t * 10} × ${m} + ☐ × ${m}. What number goes in the box?`, num(o), ['Split the number into tens and ones.', `${t * 10 + o} = ${t * 10} + ?`], [`${t * 10 + o} = ${t * 10} + ${o}, so the box is ${o}.`]);
        }),
      ],
    },
    {
      id: 'ts4.m.mult.tables', title: 'Tables and their patterns',
      intro: [
        h('Tables hide patterns'),
        p('The 5 table ends in 5, 0, 5, 0… The 10 table always ends in 0. The 9 table digits add up to 9 (18 → 1 + 8 = 9).'),
        vis({ kind: 'number-line', from: 0, to: 50, step: 5, jumps: [[0, 5], [5, 10], [10, 15], [15, 20], [20, 25]] }, 'Jumps of 5 on a number line'),
        photo('🔢', 'Multiplication tables up to 10 help with every big sum.'),
        keys('Each step of a table adds the same number.', '2 × table is double; 4 × table is double the double.', 'Any number × 0 = 0; × 1 = the same number.'),
        tip('Know 8 × 6? Then 8 × 7 is just 6 × 8 + 8 = 56.'),
      ],
      examples: [
        ex('What comes next: 7, 14, 21, 28, ?', ['Each step adds 7.', '28 + 7 = 35'], '35'),
        ex('Is 45 in the 5 table?', ['Numbers in the 5 table end in 0 or 5.', '45 ends in 5, and 9 × 5 = 45.'], 'Yes'),
      ],
      practice: [
        tp('next', (r) => {
          const k = r.int(3, 9), s = r.int(1, 5);
          const seq = [s, s + 1, s + 2, s + 3].map((x) => x * k);
          return typed(`What comes next in the ${k} table? ${seq.join(', ')}, ?`, num((s + 4) * k), ['How much is added each time?', `Add ${k} to the last number.`], [`${seq[3]} + ${k} = ${(s + 4) * k}`], [[String(seq[3] + 1), `Each step adds ${k}, not 1.`]]);
        }),
        tp('fact', (r) => {
          const a = r.int(2, 10), b = r.int(2, 10);
          return mcqN(r, `${a} × ${b} = ?`, a * b, [a + b, a * b + a, a * b - b, (a + 1) * b], ['Count in jumps of ' + a + '.', `Or use ${b} × ${a} — same answer.`], [`${a} × ${b} = ${a * b}`], [['wrong', `Skip-count by ${a}, ${b} times.`]]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 7
const ch7: USpec = {
  id: 'ts4.m.ch7', subject: 'math', title: 'Equal Shares and Equal Groups', source: src(7),
  objectives: [
    {
      id: 'ts4.m.div.share', title: 'Sharing equally',
      intro: [
        h('Fair shares'),
        p('Amma has 12 laddus for 3 children. She gives one to each, again and again, until none are left. Each child gets 4. That is 12 ÷ 3 = 4.'),
        vis({ kind: 'objects', emoji: '🟠', count: 12, groupsOf: 4 }, '12 laddus shared into 3 groups of 4'),
        photo('🍌', 'Sharing a bunch of bananas fairly is division.'),
        def('Division', 'Sharing equally, or making equal groups. 12 ÷ 3 = 4.'),
        keys('Division undoes multiplication: 3 × 4 = 12, so 12 ÷ 3 = 4.', 'Sharing: how many each? Grouping: how many groups?'),
        tip('Use the times table backwards: which number × 3 gives 12?'),
      ],
      examples: [
        ex('20 pencils are shared by 5 children. How many does each get?', ['20 ÷ 5', '5 × 4 = 20'], '4 pencils each'),
        ex('24 children make teams of 6. How many teams?', ['24 ÷ 6', '6 × 4 = 24'], '4 teams'),
      ],
      practice: [
        tp('share', (r) => {
          const k = r.int(2, 6), each = r.int(2, 6), e = r.pick(['🍎', '🥭', '🌼', '⭐', '🪁']);
          return typed(`Share ${k * each} things equally among ${k} friends. How many does each friend get?`, num(each), [`Which number × ${k} = ${k * each}?`, 'Give one at a time to each friend.'], [`${k * each} ÷ ${k} = ${each}`, `Check: ${k} × ${each} = ${k * each}`],
            [[String(k * each - k), 'You subtracted. Sharing equally means divide.']], { visual: { kind: 'objects', emoji: e, count: k * each } });
        }),
        tp('group', (r) => {
          const size = r.int(3, 9), g = r.int(3, 9);
          const ctx = r.pick(['children make teams of', 'eggs go into trays of', 'mangoes go into bags of', 'chairs are put in rows of']);
          return typed(`${size * g} ${ctx} ${size}. How many ${ctx.includes('teams') ? 'teams' : ctx.includes('trays') ? 'trays' : ctx.includes('bags') ? 'bags' : 'rows'}?`, num(g), [`How many ${size}s make ${size * g}?`, `${size} × ? = ${size * g}`], [`${size * g} ÷ ${size} = ${g}`]);
        }),
      ],
    },
    {
      id: 'ts4.m.div.rem', title: 'Dividend, divisor, quotient and remainder',
      intro: [
        h('Sometimes some are left over'),
        p('14 bangles shared by 4 girls: each gets 3 and 2 are left over.'),
        vis({ kind: 'objects', emoji: '🟣', count: 14, groupsOf: 4 }, '3 groups of 4 and 2 left over'),
        def('Dividend', 'The number being shared (14).'), def('Divisor', 'The number we share among (4).'),
        def('Quotient', 'How many each gets (3).'), def('Remainder', 'What is left over (2). It is always smaller than the divisor.'),
        remember('Dividend = Divisor × Quotient + Remainder: 14 = 4 × 3 + 2.'),
        photo('🎀', 'Leftover ribbons are the remainder.'),
        tip('If your remainder is as big as the divisor, everyone can get one more!'),
      ],
      examples: [
        ex('17 ÷ 5', ['5 × 3 = 15 (5 × 4 = 20 is too much)', '17 − 15 = 2'], 'Quotient 3, remainder 2'),
        ex('In 29 ÷ 6 = 4 remainder 5, name the dividend and divisor.', ['The number being divided is 29.', 'We divide by 6.'], 'Dividend 29, divisor 6'),
      ],
      practice: [
        tp('r', (r) => {
          const d = r.int(3, 9), q = r.int(2, 9), rem = r.int(1, d - 1), n = d * q + rem;
          return typed(`${n} marbles are shared equally by ${d} children. How many marbles are LEFT OVER?`, num(rem), [`Find the biggest ${d}-table number not more than ${n}.`, `${d} × ${q} = ${d * q}`], [`${d} × ${q} = ${d * q}`, `${n} − ${d * q} = ${rem} left over`],
            [[String(q), 'That is how many each child gets (the quotient). The question asks for the remainder.']]);
        }),
        tp('q', (r) => {
          const d = r.int(3, 9), q = r.int(2, 9), rem = r.int(0, d - 1), n = d * q + rem;
          return typed(`Find the quotient: ${n} ÷ ${d}`, num(q), [`Which ${d}-table number is closest below ${n}?`, `${d} × ${q} = ${d * q}`], [`${d} × ${q} = ${d * q}`, `Quotient ${q}, remainder ${rem}`], [[String(rem), 'That is the remainder. The quotient is how many in each share.']]);
        }),
        bank('words', [
          ['In 23 ÷ 4 = 5 remainder 3, which number is the divisor?', '4', ['23', '5', '3'], ['The divisor is what we divide BY.', '23 ÷ 4 — we divide by 4.'], 'The divisor is 4.', '23 is the dividend; 5 is the quotient; 3 is the remainder.'],
          ['In 23 ÷ 4 = 5 remainder 3, which number is the quotient?', '5', ['23', '4', '3'], ['The quotient is the answer of the sharing.', 'Each share gets 5.'], 'The quotient is 5.', 'Remember: quotient = how many in each share.'],
          ['In 31 ÷ 7 = 4 remainder 3, which number is the dividend?', '31', ['7', '4', '3'], ['The dividend is the number being shared.', 'It is the first number.'], 'The dividend is 31.', 'The dividend is the total we start with.'],
          ['Can the remainder be 6 when we divide by 5?', 'No', ['Yes'], ['The remainder must be smaller than the divisor.', 'With 6 left, each could get one more.'], 'No. The remainder must be less than 5.', 'If 6 were left, we could share 5 more.'],
          ['In 40 ÷ 8 = 5, what is the remainder?', '0', ['5', '8', '40'], ['8 × 5 = 40 exactly.', 'Nothing is left.'], 'The remainder is 0.', 'Nothing is left over when it divides exactly.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.div.big', title: 'Dividing bigger numbers',
      intro: [
        h('Divide the tens, then the ones'),
        p('84 ÷ 4: share 8 tens among 4 → 2 tens each. Share 4 ones among 4 → 1 each. Answer 21.'),
        vis({ kind: 'objects', emoji: '🟦', count: 8, groupsOf: 2 }, '8 tens shared by 4 = 2 tens each'),
        photo('📦', 'Packing 96 mangoes into 8 boxes is division.'),
        stepsB('Divide the hundreds (if any).', 'Divide the tens; carry any leftover ten to the ones.', 'Divide the ones.', 'Check: quotient × divisor = dividend.'),
        keys('Leftover tens become ones: 1 ten = 10 ones.'),
        tip('Check every answer by multiplying back.'),
      ],
      examples: [
        ex('96 ÷ 8', ['9 tens ÷ 8 = 1 ten, 1 ten left', '1 ten + 6 ones = 16 ones', '16 ÷ 8 = 2'], '12'),
        ex('A farmer packs 245 tomatoes into 5 baskets equally. How many in each?', ['24 tens ÷ 5 = 4 tens, 4 tens left', '4 tens + 5 = 45 ones; 45 ÷ 5 = 9'], '49 tomatoes'),
      ],
      practice: [
        tp('div', (r) => {
          const d = r.int(2, 9), q = r.int(12, 99);
          return typed(`${d * q} ÷ ${d} = ?`, num(q), ['Divide the biggest place first.', 'Carry leftovers to the next place.'], [`${d * q} ÷ ${d} = ${q}`, `Check: ${q} × ${d} = ${d * q}`]);
        }, 2),
        tp('word', (r) => {
          const d = r.int(3, 8), q = r.int(15, 60);
          const [what, into] = r.pick([['saplings', 'rows'], ['notebooks', 'classes'], ['chairs', 'rows'], ['tomatoes', 'baskets'], ['marbles', 'bags']]);
          return typed(`${d * q} ${what} are put equally into ${d} ${into}. How many ${what} in each?`, num(q), ['Equal sharing → divide.', `${d * q} ÷ ${d}`], [`${d * q} ÷ ${d} = ${q}`], [[String(d * q - d), 'You subtracted. Divide to share equally.']]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 8
const ch8: USpec = {
  id: 'ts4.m.ch8', subject: 'math', title: 'How Long Is This?', source: src(8),
  objectives: [
    {
      id: 'ts4.m.len.unit', title: 'Estimating length and choosing a unit',
      intro: [
        h('Guess, then measure'),
        p('Your hand span is about 15 cm. A classroom is about 7 m long. Hyderabad to Warangal is about 150 km.'),
        photo('📏', 'A 30 cm scale measures small things like a pencil.'),
        vis({ kind: 'number-line', from: 0, to: 15, step: 1, marks: [0, 12] }, 'A pencil 12 cm long on a ruler'),
        keys('Small things: centimetres (cm).', 'Rooms, ropes, heights of buildings: metres (m).', 'Roads between towns: kilometres (km).'),
        tip('Start measuring from the 0 mark, not the edge of the ruler.'),
      ],
      examples: [
        ex('Which unit to measure the length of an eraser?', ['An eraser is small.', 'Use cm.'], 'Centimetres'),
        ex('Which unit for the distance from Karimnagar to Hyderabad?', ['It is a long road between towns.'], 'Kilometres'),
      ],
      practice: [
        bank('unit', [
          ['Which unit is best to measure a pencil?', 'cm', ['m', 'km'], ['A pencil fits in your hand.', 'Small things use cm.'], 'A pencil is measured in cm.', 'Metres and kilometres are too big for a pencil.'],
          ['Which unit is best to measure a saree?', 'm', ['cm', 'km'], ['A saree is a few arm-lengths long.', 'Use metres for cloth.'], 'A saree is about 5 to 6 m long.', 'Cloth in a shop is measured in metres.'],
          ['Which unit is best for the distance from Nizamabad to Hyderabad?', 'km', ['cm', 'm'], ['It is a long bus ride.', 'Distances between towns use km.'], 'Town-to-town distances are in km.', 'cm and m are too small for long roads.'],
          ['Which unit is best for your height?', 'cm', ['km', 'mm only'], ['You are about 130 of these tall.', 'Heights of children: cm.'], 'Heights are measured in cm (or m and cm).', 'Kilometres are far too big.'],
          ['Which unit is best for the length of the school ground?', 'm', ['cm', 'km'], ['You can walk it in a minute.', 'Big but not a town-to-town road.'], 'A school ground is measured in metres.', 'Use metres for grounds and rooms.'],
          ['About how long is a new pencil?', '18 cm', ['18 m', '18 km', '2 cm'], ['Compare with your hand span (about 15 cm).', 'A little longer than a hand span.'], 'A new pencil is about 18 cm.', '18 m would be longer than a classroom!'],
          ['About how tall is a classroom door?', '2 m', ['2 cm', '2 km', '20 m'], ['Taller than your teacher, but not by much.', 'About 2 metres.'], 'A door is about 2 m tall.', 'Think about the size of a person.'],
        ]),
        tp('ruler', (r) => {
          const s = r.int(0, 5), l = r.int(3, 9);
          return typed(`An object starts at the ${s} cm mark and ends at the ${s + l} cm mark of a ruler. How long is it?`, num(l, 'cm'), ['Subtract the start from the end.', `${s + l} − ${s}`], [`${s + l} − ${s} = ${l} cm`], [[String(s + l), 'It does not start at 0. Subtract the start mark.']], { visual: { kind: 'number-line', from: 0, to: 15, step: 1, marks: [s, s + l] } });
        }),
      ],
    },
    {
      id: 'ts4.m.len.cmm', title: 'Centimetres, metres and kilometres',
      intro: [
        h('Changing units'),
        p('1 metre = 100 centimetres. 1 kilometre = 1000 metres.'),
        vis({ kind: 'emoji', text: '1 m = 100 cm · 1 km = 1000 m' }, 'Length conversions'),
        photo('🚌', 'Bus routes are measured in kilometres.'),
        stepsB('m → cm: multiply by 100.', 'km → m: multiply by 1000.', '3 m 25 cm = 300 cm + 25 cm = 325 cm.'),
        keys('Always change to the SAME unit before adding or comparing.'),
        tip('Half a metre is 50 cm; half a kilometre is 500 m.'),
      ],
      examples: [
        ex('Change 4 m 60 cm to cm.', ['4 m = 400 cm', '400 + 60 = 460'], '460 cm'),
        ex('Arjun walks 1 km 200 m to school and the same back. How many metres in all?', ['1 km 200 m = 1200 m', '1200 + 1200 = 2400'], '2400 m'),
      ],
      practice: [
        tp('mcm', (r) => {
          const m = r.int(1, 9), c = r.int(5, 95);
          return typed(`${m} m ${c} cm = how many cm?`, num(m * 100 + c, 'cm'), ['1 m = 100 cm.', `${m} m = ${m * 100} cm`], [`${m * 100} + ${c} = ${m * 100 + c} cm`], [[String(m + c), 'Change metres to cm first: 1 m = 100 cm.'], [String(m * 10 + c), '1 m is 100 cm, not 10 cm.']]);
        }),
        tp('kmm', (r) => {
          const k = r.int(1, 9), m = r.int(1, 9) * 50;
          return typed(`${k} km ${m} m = how many metres?`, num(k * 1000 + m, 'm'), ['1 km = 1000 m.', `${k} km = ${k * 1000} m`], [`${k * 1000} + ${m} = ${k * 1000 + m} m`], [[String(k * 100 + m), '1 km = 1000 m, not 100 m.']]);
        }),
        tp('trip', (r) => {
          const a = r.int(2, 9) * 100, b = r.int(2, 9) * 100, who = nm(r);
          return typed(`${who} walks ${a} m to the bus stop and then ${b} m to the market. How many metres in all? Is it more than 1 km?`, num(a + b, 'm'), ['Add the two distances.', '1 km = 1000 m.'], [`${a} + ${b} = ${a + b} m`, a + b > 1000 ? 'That is more than 1 km.' : a + b === 1000 ? 'That is exactly 1 km.' : 'That is less than 1 km.']);
        }),
      ],
    },
  ],
};

// ================================================================== CH 9
const ch9: USpec = {
  id: 'ts4.m.ch9', subject: 'math', title: 'How Much Does It Weigh?', source: src(9),
  objectives: [
    {
      id: 'ts4.m.wt.kgg', title: 'Kilograms and grams',
      intro: [
        h('Heavy and light'),
        p('Rice and vegetables are weighed in kilograms (kg). Light things like a packet of tea are weighed in grams (g).'),
        photo('⚖', 'A weighing balance at the kirana shop compares weights.'),
        vis({ kind: 'emoji', text: '1 kg = 1000 g · ½ kg = 500 g · ¼ kg = 250 g' }, 'Weight conversions'),
        keys('1 kilogram = 1000 grams.', 'Heavy things: kg. Light things: g.'),
        tip('A 1-rupee coin weighs a few grams. A big watermelon weighs a few kilograms.'),
      ],
      examples: [
        ex('Change 2 kg 350 g to grams.', ['2 kg = 2000 g', '2000 + 350 = 2350'], '2350 g'),
        ex('Which unit for a bag of rice?', ['A bag of rice is heavy.'], 'Kilograms'),
      ],
      practice: [
        tp('conv', (r) => {
          const k = r.int(1, 9), g = r.int(1, 19) * 50;
          return typed(`${k} kg ${g} g = how many grams?`, num(k * 1000 + g, 'g'), ['1 kg = 1000 g.', `${k} kg = ${k * 1000} g`], [`${k * 1000} + ${g} = ${k * 1000 + g} g`], [[String(k * 100 + g), '1 kg = 1000 g, not 100 g.']]);
        }),
        bank('est', [
          ['Which is heavier: 1 kg of cotton or 1 kg of stones?', 'Both weigh the same', ['Cotton', 'Stones'], ['Read the numbers carefully.', 'Both are 1 kg.'], 'Both weigh exactly 1 kg.', 'Stones feel heavier but the weight is the same: 1 kg.'],
          ['Which unit for the weight of a pencil?', 'g', ['kg'], ['A pencil is very light.', 'Light things → grams.'], 'A pencil weighs a few grams.', 'kg is for heavy things.'],
          ['Which unit for the weight of a sack of rice?', 'kg', ['g'], ['A sack is very heavy.', 'Heavy → kilograms.'], 'Rice sacks are 25 kg or more.', 'Grams are for light things.'],
          ['About how much does a big watermelon weigh?', '3 kg', ['3 g', '300 kg', '30 g'], ['Can you lift it with two hands?', 'A few kilograms.'], 'A watermelon weighs about 3 kg.', '3 g is lighter than a coin; 300 kg is heavier than a buffalo.'],
          ['How many grams make half a kilogram?', '500 g', ['50 g', '100 g', '5000 g'], ['1 kg = 1000 g.', 'Half of 1000.'], 'Half of 1000 g is 500 g.', 'Half of 1000 is 500.'],
          ['How many grams make a quarter kilogram (pav kilo)?', '250 g', ['25 g', '400 g', '500 g'], ['A quarter is one of 4 equal parts.', '1000 ÷ 4'], '1000 ÷ 4 = 250 g.', 'A quarter means divide 1000 by 4.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.wt.word', title: 'Weight word problems',
      intro: [
        h('Add and subtract weights'),
        p('Amma buys 2 kg of tomatoes and 3 kg of onions. The bag weighs 5 kg. Weights add like other numbers when the units are the same.'),
        vis({ kind: 'emoji', text: '🍅 2 kg + 🧅 3 kg = 5 kg' }, 'Adding weights'),
        photo('🧺', 'Carry bags have a weight limit — add the weights to check.'),
        keys('Make the units the same first (all kg or all g).', 'Total → add; difference / left → subtract.'),
        tip('Write the unit next to every number you calculate.'),
      ],
      examples: [
        ex('A bag has 5 kg of rice. 1 kg 500 g is used. How much is left?', ['5 kg = 5000 g; 1 kg 500 g = 1500 g', '5000 − 1500 = 3500 g'], '3500 g = 3 kg 500 g'),
        ex('Each packet of dal weighs 500 g. What do 6 packets weigh?', ['6 × 500 = 3000 g', '3000 g = 3 kg'], '3 kg'),
      ],
      practice: [
        tp('total', (r) => {
          const a = r.int(2, 9) * 100, b = r.int(2, 9) * 100, c = r.int(1, 5);
          return typed(`A shopkeeper puts ${a} g of sugar, ${b} g of dal and ${c} kg of rice in a bag. What is the total weight in grams?`, num(a + b + c * 1000, 'g'), ['Change kg to g first.', `${c} kg = ${c * 1000} g`], [`${a} + ${b} + ${c * 1000} = ${a + b + c * 1000} g`], [[String(a + b + c), `Change ${c} kg to grams before adding.`]]);
        }, 2),
        tp('left', (r) => {
          const tot = r.int(3, 9), used = r.int(1, tot * 2 - 1) * 500;
          return typed(`A tin had ${tot} kg of groundnuts. ${used} g were used to make chutney. How many grams are left?`, num(tot * 1000 - used, 'g'), ['Change kg to g.', 'Then subtract.'], [`${tot} kg = ${tot * 1000} g`, `${tot * 1000} − ${used} = ${tot * 1000 - used} g`]);
        }),
        tp('times', (r) => {
          const w = r.pick([100, 200, 250, 500]), n = r.int(2, 8);
          return typed(`One packet of biscuits weighs ${w} g. How many grams do ${n} packets weigh?`, num(w * n, 'g'), ['Same weight many times → multiply.', `${n} × ${w}`], [`${n} × ${w} = ${n * w} g`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 10
const ch10: USpec = {
  id: 'ts4.m.ch10', subject: 'math', title: 'How Much Do These Bottles Hold?', source: src(10),
  objectives: [
    {
      id: 'ts4.m.cap.est', title: 'More or less than a litre',
      intro: [
        h('How much can it hold?'),
        p('A milk packet holds half a litre. A water bottle often holds 1 litre. A bucket holds about 15 litres.'),
        photo('🧴', 'A big water bottle usually holds 1 litre.'),
        photo('🪣', 'A bucket holds much more than a litre.'),
        def('Capacity', 'How much liquid a container can hold.'),
        keys('Spoon, cup, glass: less than a litre.', 'Bucket, drum, tank: more than a litre.'),
        tip('Fill a 1-litre bottle and pour it into other containers to compare.'),
      ],
      examples: [
        ex('Does a tea cup hold more or less than a litre?', ['A cup holds about 150 mL.', 'That is much less than 1000 mL.'], 'Less than a litre'),
        ex('Does a drum hold more or less than a litre?', ['A drum can hold many buckets of water.'], 'More than a litre'),
      ],
      practice: [
        tapT('less', 'Tap ALL the containers that hold LESS than 1 litre.', ['spoon', 'tea cup', 'steel glass', 'ink bottle', 'small curd cup'], ['bucket', 'water drum', 'overhead tank', 'bathtub', 'pot (kunda)'],
          ['Think: can you drink it all at once?', 'Big containers hold many litres.'], 'Small containers like cups and spoons hold less than a litre.'),
        bank('est', [
          ['About how much does a tea cup hold?', '150 mL', ['150 L', '15 L', '1500 L'], ['A cup is small.', 'Small amounts are in mL.'], 'A tea cup holds about 150 mL.', 'Litres are for big containers.'],
          ['About how much does a bucket hold?', '15 L', ['15 mL', '150 L', '1 mL'], ['You need both hands to lift a full bucket.', 'Many bottles of water.'], 'A bucket holds about 15 L.', '15 mL is just three spoons.'],
          ['About how much does a spoon hold?', '5 mL', ['5 L', '50 L', '500 mL'], ['A spoon is tiny.', 'Medicine doses use mL.'], 'A teaspoon holds about 5 mL.', '5 L would be five big bottles!'],
          ['About how much does an overhead water tank hold?', '1000 L', ['1000 mL', '10 mL', '1 L'], ['It supplies a whole house.', 'A very big amount.'], 'An overhead tank holds about 1000 L.', '1000 mL is just 1 bottle.'],
          ['Which unit for the milk in a small packet?', 'mL', ['L', 'kg'], ['A packet holds 500 of these.', 'Small amounts of liquid → mL.'], 'Milk packets show 500 mL.', 'kg measures weight, not liquid.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.cap.lml', title: 'Litres and millilitres',
      intro: [
        h('1 litre = 1000 millilitres'),
        p('Two 500 mL milk packets fill a 1 L jug. Four 250 mL glasses also fill it.'),
        vis({ kind: 'fraction-bar', parts: 4, shaded: 4, label: '4 × 250 mL = 1 L' }, 'Four 250 mL glasses make a litre'),
        photo('🥛', 'Milk is sold in 500 mL and 1 L packets.'),
        keys('1 L = 1000 mL.', '½ L = 500 mL, ¼ L = 250 mL.', 'L → mL: multiply by 1000.'),
        tip('Write 2 L 300 mL as 2300 mL before adding or subtracting.'),
      ],
      examples: [
        ex('3 L 250 mL = ? mL', ['3 L = 3000 mL', '3000 + 250 = 3250'], '3250 mL'),
        ex('How many 200 mL glasses can be filled from 1 L of buttermilk?', ['1 L = 1000 mL', '1000 ÷ 200 = 5'], '5 glasses'),
      ],
      practice: [
        tp('conv', (r) => {
          const l = r.int(1, 9), m = r.int(1, 19) * 50;
          return typed(`${l} L ${m} mL = how many mL?`, num(l * 1000 + m, 'mL'), ['1 L = 1000 mL.', `${l} L = ${l * 1000} mL`], [`${l * 1000} + ${m} = ${l * 1000 + m} mL`], [[String(l * 100 + m), '1 L = 1000 mL, not 100.']]);
        }),
        tp('glasses', (r) => {
          const g = r.pick([100, 200, 250, 500]), l = r.int(1, 4);
          return typed(`How many ${g} mL glasses can be filled from ${l} L of lemon juice?`, num((l * 1000) / g), ['Change litres to mL.', `${l * 1000} ÷ ${g}`], [`${l} L = ${l * 1000} mL`, `${l * 1000} ÷ ${g} = ${(l * 1000) / g} glasses`]);
        }),
        tp('left', (r) => {
          const l = r.int(2, 5), used = r.int(1, l * 4 - 1) * 250;
          return typed(`A can has ${l} L of oil. ${used} mL is used for cooking. How many mL are left?`, num(l * 1000 - used, 'mL'), ['Change L to mL.', 'Then subtract.'], [`${l} L = ${l * 1000} mL`, `${l * 1000} − ${used} = ${l * 1000 - used} mL`]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 11
const ch11: USpec = {
  id: 'ts4.m.ch11', subject: 'math', title: 'Tick-Tock Goes the Clock', source: src(11),
  objectives: [
    {
      id: 'ts4.m.time.read', title: 'Reading the clock',
      intro: [
        h('Two hands tell the time'),
        p('The short hand shows the hour. The long hand shows the minutes. Each number on the clock means 5 minutes for the long hand.'),
        vis({ kind: 'clock', h: 3, m: 15 }, 'The clock shows 3:15, quarter past three'),
        photo('⏰', 'An alarm clock wakes us for school.'),
        keys('Long hand at 12 → o\'clock.', 'Long hand at 3 → 15 minutes (quarter past).', 'Long hand at 6 → 30 minutes (half past).', 'Long hand at 9 → 45 minutes (quarter to).'),
        tip('Count by 5s from 12 to where the long hand points.'),
      ],
      examples: [
        ex('The short hand is just past 7 and the long hand is on 6. What time is it?', ['Hour: 7', 'Long hand on 6 → 6 × 5 = 30 minutes'], '7:30', { kind: 'clock', h: 7, m: 30 }),
        ex('The short hand is near 10 and the long hand is on 4. What time?', ['Hour: 10', '4 × 5 = 20 minutes'], '10:20', { kind: 'clock', h: 10, m: 20 }),
      ],
      practice: [
        tp('read', (r) => {
          const hh = r.int(1, 12), mm = r.int(0, 11) * 5;
          const swap = mm / 5 === 0 ? 12 : mm / 5;
          return mcq(r, 'What time does the clock show?', hm(hh, mm), [hm(swap, (hh % 12) * 5), hm(hh === 12 ? 1 : hh + 1, mm), hm(hh, (mm + 15) % 60)],
            ['Short hand → hour. Long hand → minutes.', 'Count the long hand in 5s from 12.'], [`Hour hand at ${hh}, minute hand shows ${mm} minutes → ${hm(hh, mm)}`], [['wrong', 'Do not mix up the hands: the short one is the hour.']], { visual: { kind: 'clock', h: hh, m: mm } });
        }),
        tp('min', (r) => {
          const k = r.int(1, 11);
          return typed(`The long hand points to ${k}. How many minutes past the hour is it?`, num(k * 5), ['Each number is 5 minutes.', `${k} × 5`], [`${k} × 5 = ${k * 5} minutes`], [[String(k), 'Each number on the clock means 5 minutes for the long hand.']], { visual: { kind: 'clock', h: 12, m: k * 5 } });
        }),
      ],
    },
    {
      id: 'ts4.m.time.elapsed', title: 'Time before and after',
      intro: [
        h('How long did it take?'),
        p('School starts at 9:00 and lunch is at 1:00. Count the hours: 10, 11, 12, 1 → 4 hours.'),
        vis({ kind: 'number-line', from: 9, to: 13, step: 1, jumps: [[9, 10], [10, 11], [11, 12], [12, 13]] }, 'Counting 4 hours from 9 to 1'),
        photo('🕰️', 'Count forward on the clock to find how long something lasts.'),
        keys('60 minutes = 1 hour.', 'After 12 comes 1 on the clock.', 'Add for "after", subtract for "before".'),
        tip('Count on with your fingers: one finger for every hour.'),
      ],
      examples: [
        ex('A bus leaves Hyderabad at 8:00 and reaches Warangal 3 hours later. When does it reach?', ['8 + 3 = 11'], '11:00'),
        ex('A film ends at 5:30. It was 2 hours long. When did it start?', ['Count back 2 hours from 5:30.'], '3:30'),
      ],
      practice: [
        tp('after', (r) => {
          const s = r.int(1, 11), d = r.int(1, 5), mm = r.pick([0, 15, 30, 45]);
          const e = ((s + d - 1) % 12) + 1;
          const before = r.int(0, 1) === 1;
          if (before) return mcq(r, `A programme ENDS at ${hm(e, mm)}. It lasted ${d} hours. When did it START?`, hm(s, mm), [hm(((e + d - 1) % 12) + 1, mm), hm(((s) % 12) + 1, mm), hm(s, (mm + 30) % 60)], ['Count back the hours.', 'Before 1 comes 12.'], [`${hm(e, mm)} − ${d} hours = ${hm(s, mm)}`], [['wrong', 'For "started", count backwards.']]);
          return mcq(r, `${nm(r)} starts homework at ${hm(s, mm)} and works for ${d} hours. When does homework end?`, hm(e, mm), [hm(((s - d + 11) % 12) + 1, mm), hm(((e) % 12) + 1, mm), hm(e, (mm + 30) % 60)], ['Count forward the hours.', 'After 12 comes 1.'], [`${hm(s, mm)} + ${d} hours = ${hm(e, mm)}`], [['wrong', 'Count forward for "ends".']]);
        }),
        tp('how', (r) => {
          const s = r.int(6, 10), d = r.int(2, 7);
          return typed(`The village fair opens at ${s}:00 in the morning and closes at ${((s + d - 1) % 12) + 1}:00 ${s + d >= 12 ? 'in the afternoon' : 'in the morning'}. How many hours is it open?`, num(d, 'hours'), ['Count on from the opening hour.', 'After 12 comes 1.'], [`From ${s}:00 count ${d} hours to ${((s + d - 1) % 12) + 1}:00.`]);
        }),
        tp('min', (r) => {
          const hr = r.int(1, 3), mn = r.pick([10, 15, 20, 30, 45]);
          return typed(`How many minutes are there in ${hr} hour${hr > 1 ? 's' : ''} ${mn} minutes?`, num(hr * 60 + mn, 'minutes'), ['1 hour = 60 minutes.', `${hr} × 60 + ${mn}`], [`${hr} × 60 = ${hr * 60}`, `${hr * 60} + ${mn} = ${hr * 60 + mn} minutes`], [[String(hr * 100 + mn), '1 hour has 60 minutes, not 100.']]);
        }),
      ],
    },
    {
      id: 'ts4.m.time.cal', title: 'Calendar, dates and festivals',
      intro: [
        h('Reading a calendar'),
        p('A year has 12 months. Some months have 30 days, some 31, and February has 28 (29 in a leap year).'),
        photo('📝', 'Mark festivals like Bathukamma, Sankranti and Ugadi on your calendar.'),
        vis({ kind: 'emoji', text: 'Sun Mon Tue Wed Thu Fri Sat' }, 'The seven days of the week'),
        keys('1 week = 7 days.', 'The same weekday comes again after 7 days.', 'Sankranti is in January; Ugadi is usually in March or April.'),
        tip('Knuckle trick: months on your knuckles have 31 days.'),
      ],
      examples: [
        ex('15 August is a Friday. What day is 22 August?', ['22 − 15 = 7 days', 'After 7 days the same weekday returns.'], 'Friday'),
        ex('How many days are there in April and May together?', ['April 30, May 31', '30 + 31 = 61'], '61 days'),
      ],
      practice: [
        tp('days', (r) => {
          const [m, d] = r.pick(MONTHS);
          return mcqN(r, `How many days are there in ${m} (not a leap year)?`, d, [30, 31, 28, 29], ['Use the knuckle trick.', 'February is the short month.'], [`${m} has ${d} days.`], [['wrong', 'Check again with your knuckles: knuckle months have 31 days.']]);
        }),
        tp('week', (r) => {
          const d = r.int(0, 6), add = r.pick([7, 14, 1, 2, 3, 8]), date = r.int(1, 14);
          const a = DAYS[(d + add) % 7];
          return mcq(r, `${date} June is a ${DAYS[d]}. What day is ${date + add} June?`, a, DAYS.filter((x) => x !== a).slice(0, 3), ['Same weekday every 7 days.', `Count ${add} days forward.`], [`${date + add} − ${date} = ${add} days`, `${DAYS[d]} + ${add} days = ${a}`], [['wrong', 'Count forward day by day, or use: after 7 days the weekday repeats.']]);
        }),
        tp('weeks', (r) => {
          const w = r.int(2, 8), x = r.int(0, 6);
          return typed(`Summer camp lasts ${w} weeks and ${x} days. How many days is that?`, num(w * 7 + x), ['1 week = 7 days.', `${w} × 7 + ${x}`], [`${w} × 7 = ${w * 7}`, `${w * 7} + ${x} = ${w * 7 + x} days`]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 12
const ch12: USpec = {
  id: 'ts4.m.ch12', subject: 'math', title: 'Dividing into Equal Parts', source: src(12),
  objectives: [
    {
      id: 'ts4.m.frac.parts', title: 'Halves, quarters and other equal parts',
      intro: [
        h('Equal parts of a whole'),
        p('Cut a roti into 4 equal pieces. Each piece is one-fourth (1/4). Two pieces make two-fourths (2/4), which is the same as a half.'),
        vis({ kind: 'fraction-circle', parts: 4, shaded: 1 }, 'One of four equal parts is shaded: 1/4'),
        photo('🍕', 'A pizza cut into equal slices shows fractions.'),
        def('Fraction', 'Shaded parts over total equal parts: 3/8 means 3 of 8 equal parts.'),
        keys('The bottom number tells how many equal parts.', 'The top number tells how many parts we take.', 'Parts must be EQUAL.'),
        tip('Count all the parts first — that is the bottom number.'),
      ],
      examples: [
        ex('A bar has 5 equal parts and 2 are shaded. What fraction is shaded?', ['Total equal parts: 5', 'Shaded: 2'], '2/5', { kind: 'fraction-bar', parts: 5, shaded: 2 }),
        ex('A circle has 3 equal parts and 1 is shaded. What fraction is NOT shaded?', ['3 − 1 = 2 parts not shaded'], '2/3', { kind: 'fraction-circle', parts: 3, shaded: 1 }),
      ],
      practice: [
        tp('shade', (r) => {
          const n = r.pick([2, 3, 4, 5, 6, 8]), s = r.int(1, n - 1), circle = r.int(0, 1) === 1;
          return typed('What fraction of the shape is shaded?', frac(s, n), ['Count all the equal parts — the bottom number.', 'Count the shaded parts — the top number.'], [`${s} out of ${n} equal parts → ${s}/${n}`],
            [[`${n}/${s}`, 'Upside down! Shaded parts go on top.'], [`${s}/${n - s}`, 'The bottom number is ALL the parts, not just the unshaded ones.']], { keypad: 'fraction', visual: circle ? { kind: 'fraction-circle', parts: n, shaded: s } : { kind: 'fraction-bar', parts: n, shaded: s } });
        }),
        bank('name', [
          ['A roti is cut into 2 equal parts. What is each part called?', 'One-half (1/2)', ['One-third (1/3)', 'One-fourth (1/4)'], ['2 equal parts.', 'Each part is 1 out of 2.'], 'Each part is 1/2, one-half.', '1/3 needs 3 equal parts.'],
          ['An apple is cut into 4 equal parts. What is each part called?', 'One-fourth (1/4)', ['One-half (1/2)', 'One-third (1/3)'], ['4 equal parts.', 'Each is 1 out of 4.'], 'Each part is 1/4, a quarter.', 'Count the parts: 4.'],
          ['Which is bigger: 1/2 of a roti or 1/4 of the same roti?', '1/2', ['1/4', 'They are equal'], ['Fewer pieces means bigger pieces.', 'Half is cut into 2.'], '1/2 is bigger than 1/4.', 'More pieces make each piece smaller.'],
          ['How many quarters make a whole?', '4', ['2', '3', '8'], ['Quarter = 1/4.', '4 quarters = 4/4.'], '4 quarters make one whole.', 'A quarter is one of 4 parts.'],
          ['A cake is cut into 3 UNEQUAL pieces. Is each piece one-third?', 'No', ['Yes'], ['Fractions need equal parts.', 'Unequal pieces are not thirds.'], 'No. Thirds must be equal parts.', 'Only equal parts can be called thirds.'],
          ['How many halves make a whole?', '2', ['1', '4', '3'], ['Half = 1/2.', '2/2 = 1 whole.'], '2 halves make a whole.', 'Two halves fit together to make one.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.frac.of', title: 'Fraction of a collection',
      intro: [
        h('Half of the mangoes'),
        p('There are 12 mangoes. Half of them go to Ravi. Share 12 into 2 equal groups: each group has 6. So 1/2 of 12 = 6.'),
        vis({ kind: 'objects', emoji: '🥭', count: 12, groupsOf: 6 }, '12 mangoes in 2 equal groups'),
        photo('🥭', 'Sharing mangoes from the tree — half each!'),
        keys('1/2 of a number: divide by 2.', '1/4 of a number: divide by 4.', '1/3 of a number: divide by 3.'),
        tip('To find 3/4 of 12: 1/4 is 3, so 3/4 is 3 × 3 = 9.'),
      ],
      examples: [
        ex('Find 1/4 of 20 balloons.', ['20 ÷ 4 = 5'], '5 balloons'),
        ex('Find 2/3 of 15 laddus.', ['1/3 of 15 = 5', '2/3 = 2 × 5 = 10'], '10 laddus'),
      ],
      practice: [
        tp('unit', (r) => {
          const d = r.pick([2, 3, 4, 5]), k = r.int(2, 8), e = r.pick(['🍎', '🥭', '🎈', '⭐', '🌼']);
          return typed(`What is 1/${d} of ${d * k}?`, num(k), [`Make ${d} equal groups.`, `${d * k} ÷ ${d}`], [`${d * k} ÷ ${d} = ${k}`], [[String(d * k - d), 'Divide, do not subtract.']], { visual: { kind: 'objects', emoji: e, count: d * k, groupsOf: k } });
        }),
        tp('many', (r) => {
          const d = r.pick([3, 4, 5]), t = r.int(2, d - 1), k = r.int(2, 6);
          return typed(`${nm(r)} has ${d * k} marbles and gives away ${t}/${d} of them. How many marbles are given away?`, num(t * k), [`First find 1/${d}: ${d * k} ÷ ${d} = ${k}.`, `Then multiply by ${t}.`], [`1/${d} of ${d * k} = ${k}`, `${t}/${d} = ${t} × ${k} = ${t * k}`], [[String(k), `That is only 1/${d}. You need ${t} of those parts.`]]);
        }, 2),
      ],
    },
  ],
};

// ================================================================== CH 13
const tally = (n: number) => `${'||||/ '.repeat(Math.floor(n / 5))}${'|'.repeat(n % 5)}`.trim();
const ch13: USpec = {
  id: 'ts4.m.ch13', subject: 'math', title: 'Smart Tables', source: src(13),
  objectives: [
    {
      id: 'ts4.m.data.tally', title: 'Counting with tally marks',
      intro: [
        h('Quick counting with lines'),
        p('When we count votes or vehicles, we draw one line for each. The 5th line crosses the first four: ||||/ means 5.'),
        vis({ kind: 'emoji', text: '||||/ ||||/ ||| = 13' }, 'Two bundles of five and three more make 13'),
        photo('🚌', 'Count buses passing your school with tally marks.'),
        keys('Each bundle ||||/ = 5.', 'Count bundles in 5s, then add the single lines.'),
        tip('Bundles of 5 stop you from losing count.'),
      ],
      examples: [
        ex('What number is ||||/ ||||/ ||||/ |?', ['3 bundles → 5, 10, 15', '1 more → 16'], '16'),
        ex('Show 8 with tally marks.', ['8 = 5 + 3'], '||||/ |||'),
      ],
      practice: [
        tp('read', (r) => {
          const n = r.int(6, 28);
          return typed(`What number do these tally marks show? ${tally(n)}`, num(n), ['Each ||||/ is 5.', 'Count bundles in 5s, then add single lines.'], [`${Math.floor(n / 5)} bundles = ${Math.floor(n / 5) * 5}, plus ${n % 5} = ${n}`], [[String(Math.floor(n / 5) * 4 + (n % 5)), 'Each bundle has 5 lines — 4 standing and 1 across.']]);
        }),
        tp('make', (r) => {
          const n = r.int(6, 24);
          return mcq(r, `Which tally shows ${n}?`, tally(n), [tally(n + 1), tally(n - 1), tally(n + 5)], ['How many 5s are in the number?', 'Then add the leftover lines.'], [`${n} = ${Math.floor(n / 5)} fives and ${n % 5} → ${tally(n)}`], [['wrong', 'Count each bundle as 5 and check the leftover lines.']]);
        }),
      ],
    },
    {
      id: 'ts4.m.data.table', title: 'Reading tables and pictographs',
      intro: [
        h('Tables tell stories'),
        p('Class 4 voted for their favourite fruit. The table shows: Mango 12, Banana 7, Guava 9, Apple 4.'),
        vis({ kind: 'bar-graph', labels: ['Mango', 'Banana', 'Guava', 'Apple'], values: [12, 7, 9, 4], unit: 'children' }, 'Favourite fruits of Class 4'),
        photo('🍉', 'Surveys of favourite fruits make good tables.'),
        keys('The tallest bar is the most popular.', 'Add all values for the total.', 'Subtract to compare two items.'),
        tip('Read the labels before the numbers.'),
      ],
      examples: [
        ex('Using the fruit table, how many children voted in all?', ['12 + 7 + 9 + 4 = 32'], '32 children'),
        ex('How many more chose mango than apple?', ['12 − 4 = 8'], '8 more'),
      ],
      practice: [
        tp('q', (r) => {
          const labels = r.shuffle(['Mango', 'Banana', 'Guava', 'Apple', 'Grapes']).slice(0, 4);
          const vals = labels.map(() => r.int(3, 15));
          const kind = r.int(0, 2);
          const vis2: VisualSpec = { kind: 'bar-graph', labels, values: vals, unit: 'children' };
          if (kind === 0) {
            const i = r.int(0, 3);
            return typed(`How many children chose ${labels[i]}?`, num(vals[i]), ['Find the bar for that fruit.', 'Read the number at the top.'], [`${labels[i]}: ${vals[i]}`], [], { visual: vis2 });
          }
          if (kind === 1) {
            const tot = vals.reduce((x, y) => x + y, 0);
            return typed('How many children voted in all?', num(tot), ['Add all four bars.', 'Add two at a time.'], [`${vals.join(' + ')} = ${tot}`], [], { visual: vis2 });
          }
          const [i, j] = vals[0] >= vals[1] ? [0, 1] : [1, 0];
          return typed(`How many more children chose ${labels[i]} than ${labels[j]}?`, num(vals[i] - vals[j]), ['Find both numbers.', 'Subtract the smaller from the bigger.'], [`${vals[i]} − ${vals[j]} = ${vals[i] - vals[j]}`], [[String(vals[i] + vals[j]), 'You added. "How many more" means subtract.']], { visual: vis2 });
        }),
        tp('most', (r) => {
          const labels = r.shuffle(['Cycle', 'Bus', 'Walk', 'Auto', 'Bike']).slice(0, 4);
          const vals = r.shuffle([5, 9, 13, 17]).map((v) => v + r.int(0, 2));
          const best = labels[vals.indexOf(Math.max(...vals))];
          return mcq(r, 'How do most children in this class come to school?', best, labels.filter((l) => l !== best), ['Look for the tallest bar.', 'Tallest = most.'], [`${best} has the most: ${Math.max(...vals)}.`], [['wrong', 'Find the tallest bar.']], { visual: { kind: 'bar-graph', labels, values: vals, unit: 'children' } });
        }),
      ],
    },
  ],
};

// ================================================================== CH 14
const ch14: USpec = {
  id: 'ts4.m.ch14', subject: 'math', title: 'Borders and Boundaries', source: src(14),
  objectives: [
    {
      id: 'ts4.m.peri.shape', title: 'Perimeter: the length of the border',
      intro: [
        h('Walk around the edge'),
        p('Lakshmi walks all around her rectangular vegetable garden. The distance she walks is the perimeter.'),
        vis({ kind: 'grid-shape', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]], cols: 5, rows: 3 }, 'A 4 by 2 rectangle has perimeter 4 + 2 + 4 + 2 = 12 units'),
        photo('🌾', 'Farmers put a fence around the border of their field.'),
        def('Perimeter', 'The total length around the outside of a shape.'),
        keys('Add all the sides.', 'Rectangle: length + breadth + length + breadth.', 'Square: 4 × side.'),
        tip('Put your finger on one corner and go all the way round, adding each side.'),
      ],
      examples: [
        ex('A rectangle is 6 m long and 4 m wide. Perimeter?', ['6 + 4 + 6 + 4 = 20'], '20 m'),
        ex('A square carrom board has side 70 cm. Perimeter?', ['4 × 70 = 280'], '280 cm'),
      ],
      practice: [
        tp('rect', (r) => {
          const l = r.int(4, 20), b = r.int(2, l - 1);
          return typed(`A rectangle is ${l} cm long and ${b} cm wide. What is its perimeter?`, num(2 * (l + b), 'cm'), ['Add all 4 sides.', `${l} + ${b} + ${l} + ${b}`], [`${l} + ${b} + ${l} + ${b} = ${2 * (l + b)} cm`], [[String(l + b), 'That is only two sides. A rectangle has four.'], [String(l * b), 'That is the area (squares inside). Perimeter goes around.']]);
        }),
        tp('grid', (r) => {
          const l = r.int(2, 6), b = r.int(1, 4);
          const cells: [number, number][] = [];
          for (let y = 0; y < b; y++) for (let x = 0; x < l; x++) cells.push([x, y]);
          return typed('Each small square has sides of 1 unit. What is the perimeter of the coloured rectangle?', num(2 * (l + b)), ['Count the unit sides along the outside edge.', `It is ${l} long and ${b} wide.`], [`${l} + ${b} + ${l} + ${b} = ${2 * (l + b)} units`], [[String(l * b), 'You counted the squares inside. Count the edges around.']], { visual: { kind: 'grid-shape', cells, cols: l + 1, rows: b + 1 } });
        }),
        tp('poly', (r) => {
          const s = r.pick(SH.filter((x) => x.shape !== 'rectangle')), a = r.int(3, 12);
          return typed(`Each side of this ${s.name} is ${a} cm. What is its perimeter?`, num(s.n * a, 'cm'), [`How many sides does a ${s.name} have?`, `${s.n} × ${a}`], [`${s.n} × ${a} = ${s.n * a} cm`], [], { visual: { kind: 'shape', shape: s.shape } });
        }),
      ],
    },
    {
      id: 'ts4.m.peri.fence', title: 'Fencing and border problems',
      intro: [
        h('How much wire? How much lace?'),
        p('To fence a field or stitch lace around a handkerchief, we need its perimeter.'),
        photo('🪢', 'Rope or wire for a fence is as long as the perimeter.'),
        vis({ kind: 'shape', shape: 'square' }, 'A square handkerchief with lace around it'),
        keys('Fence/lace/border length = perimeter.', 'Rounds of wire: multiply the perimeter by the number of rounds.'),
        tip('Draw a quick picture and write the length on each side.'),
      ],
      examples: [
        ex('A square field has side 25 m. How much wire for one round of fencing?', ['4 × 25 = 100'], '100 m'),
        ex('A rectangular garden is 10 m by 6 m. How much wire for 3 rounds?', ['One round: 10 + 6 + 10 + 6 = 32 m', '3 rounds: 3 × 32 = 96 m'], '96 m'),
      ],
      practice: [
        tp('fence', (r) => {
          const l = r.int(5, 30), b = r.int(3, l - 1), k = r.int(1, 3);
          return typed(`A farmer in Siddipet has a rectangular field ${l} m long and ${b} m wide. How many metres of wire are needed for ${k} round${k > 1 ? 's' : ''} of fencing?`, num(k * 2 * (l + b), 'm'),
            ['Find the perimeter for one round.', k > 1 ? `Multiply by ${k}.` : 'Add all four sides.'], [`One round: ${l} + ${b} + ${l} + ${b} = ${2 * (l + b)} m`, `${k} × ${2 * (l + b)} = ${k * 2 * (l + b)} m`], [[String(2 * (l + b)), `That is one round. The farmer wants ${k}.`]]);
        }, 2),
        tp('lace', (r) => {
          const a = r.int(15, 40);
          return typed(`Sita stitches lace around a square handkerchief of side ${a} cm. How long is the lace?`, num(4 * a, 'cm'), ['All 4 sides are equal.', `4 × ${a}`], [`4 × ${a} = ${4 * a} cm`], [[String(a), 'That is just one side.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 15
const ch15: USpec = {
  id: 'ts4.m.ch15', subject: 'math', title: 'Halves That Look Alike', source: src(15),
  objectives: [
    {
      id: 'ts4.m.sym.line', title: 'Lines of symmetry',
      intro: [
        h('Fold and match'),
        p('Fold a butterfly picture down the middle. Both halves match exactly! The fold line is a line of symmetry.'),
        photo('🦋', 'A butterfly\'s two wings are mirror halves.'),
        vis({ kind: 'shape', shape: 'square' }, 'A square has 4 lines of symmetry'),
        def('Line of symmetry', 'A fold line that makes two halves that match exactly.'),
        keys('Letters A, H, M, O, T, U, V, W, X, Y have a standing (vertical) line of symmetry.', 'Square: 4 lines. Rectangle: 2 lines. Circle: very many.'),
        tip('Hold a small mirror on the line: if the picture looks whole, it is symmetrical.'),
      ],
      examples: [
        ex('Does the letter A have a standing line of symmetry?', ['Draw a line straight down the middle.', 'Left half and right half match.'], 'Yes'),
        ex('How many lines of symmetry does a rectangle (not a square) have?', ['Fold top to bottom: matches.', 'Fold left to right: matches.', 'Corner to corner: does NOT match.'], '2 lines'),
      ],
      practice: [
        tapT('letters', 'Tap ALL the letters that have a standing (vertical) line of symmetry.', ['A', 'H', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'], ['F', 'G', 'J', 'L', 'N', 'P', 'R', 'S', 'Z'],
          ['Imagine a line straight down the middle.', 'Do the left and right halves match?'], 'Check with a mirror: only letters whose left half matches the right half.'),
        bank('count', [
          ['How many lines of symmetry does a square have?', '4', ['2', '1', '0'], ['Fold side to side and top to bottom.', 'Also fold corner to corner.'], 'A square has 4 lines of symmetry.', 'Do not forget the two diagonal folds.', { kind: 'shape', shape: 'square' }],
          ['How many lines of symmetry does a rectangle (not a square) have?', '2', ['4', '1', '0'], ['Try folding along the diagonal.', 'It does not match!'], 'A rectangle has 2 lines of symmetry.', 'Diagonal folds do not match in a rectangle.', { kind: 'shape', shape: 'rectangle' }],
          ['How many lines of symmetry does a triangle with all sides equal have?', '3', ['1', '2', '0'], ['Fold from each corner to the middle of the opposite side.', 'There are 3 corners.'], 'An equilateral triangle has 3 lines of symmetry.', 'Each of the 3 corners gives one fold line.', { kind: 'shape', shape: 'triangle' }],
          ['Does the letter F have a line of symmetry?', 'No', ['Yes'], ['Fold it up-down and left-right.', 'Neither fold matches.'], 'F has no line of symmetry.', 'The arms of F stick out on one side only.'],
          ['How many lines of symmetry does a circle have?', 'Very many', ['1', '2', '4'], ['Fold any way through the centre.', 'Every such fold matches.'], 'A circle has very many lines of symmetry.', 'Any line through the centre works.', { kind: 'shape', shape: 'circle' }],
          ['How many lines of symmetry does a regular hexagon have?', '6', ['3', '2', '4'], ['Corner to corner: 3 lines.', 'Middle of side to middle of side: 3 more.'], 'A regular hexagon has 6 lines of symmetry.', 'Count both kinds of folds.', { kind: 'shape', shape: 'hexagon' }],
        ]),
      ],
    },
    {
      id: 'ts4.m.sym.mask', title: 'Making symmetrical pictures',
      intro: [
        h('Fold, cut, open!'),
        p('Fold paper in half. Cut half a mask along the fold. Open it — you get a full mask with two matching halves.'),
        photo('🎨', 'Rangoli and masks are often symmetrical.'),
        vis({ kind: 'emoji', text: '🦋 · 🌸 · ❌' }, 'Symmetrical pictures'),
        keys('The fold becomes the line of symmetry.', 'Whatever is on one side appears flipped on the other.', 'A point 2 squares left of the line has a partner 2 squares right of it.'),
        tip('Ink blot art: put paint on one half, fold, press, open!'),
      ],
      examples: [
        ex('A dot is 3 squares to the left of the fold line. Where is its partner?', ['Same distance on the other side.'], '3 squares to the right'),
        ex('Half a mask has one eye hole. How many eye holes in the full mask?', ['The other half copies it.'], '2 eye holes'),
      ],
      practice: [
        tp('dist', (r) => {
          const d = r.int(1, 9), side = r.pick(['left', 'right']);
          return mcq(r, `In a symmetrical rangoli, a dot is ${d} squares to the ${side} of the fold line. Where is its matching dot?`, `${d} squares to the ${side === 'left' ? 'right' : 'left'}`, [`${d} squares to the ${side}`, `${d + 1} squares to the ${side === 'left' ? 'right' : 'left'}`, `${d * 2} squares to the ${side === 'left' ? 'right' : 'left'}`],
            ['The partner is on the other side.', 'It is the same distance from the line.'], [`Same distance, other side: ${d} squares to the ${side === 'left' ? 'right' : 'left'}.`], [['wrong', 'Mirror halves are the same distance from the fold line, on opposite sides.']]);
        }),
        tp('holes', (r) => {
          const k = r.int(1, 6), part = r.pick(['eye holes', 'star cut-outs', 'flower cut-outs', 'small circles']);
          return typed(`You fold paper in half and cut ${k} ${part} through both layers. When you open it, how many ${part} are there?`, num(2 * k), ['You cut through two layers.', 'Each cut makes 2 holes.'], [`2 × ${k} = ${2 * k}`], [[String(k), 'There are two layers — each cut appears twice.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 16
const PAT = ['🔴', '🔵', '🟡', '🟢', '⭐', '🌙', '🔺', '🟦'];
const ch16: USpec = {
  id: 'ts4.m.ch16', subject: 'math', title: 'Patterns', source: src(16),
  objectives: [
    {
      id: 'ts4.m.pat.shape', title: 'Shape and bead patterns',
      intro: [
        h('What comes next?'),
        p('Bangles on a stand: red, blue, red, blue… The part that repeats (red, blue) is the core of the pattern.'),
        vis({ kind: 'emoji', text: '🔴🔵🔴🔵🔴🔵 ?' }, 'A repeating pattern of red and blue'),
        photo('🪔', 'Rows of diyas at Deepavali often make patterns.'),
        keys('Find the part that repeats.', 'Say it aloud: red-blue, red-blue…', 'Some patterns grow: 1 bead, 2 beads, 3 beads…'),
        tip('Put a finger under each repeat to find the core.'),
      ],
      examples: [
        ex('🔴🔵🔵🔴🔵🔵🔴 ? What comes next?', ['The core is 🔴🔵🔵.', 'After 🔴 comes 🔵.'], '🔵'),
        ex('⭐🌙🌙🌙⭐🌙🌙🌙 — what is the core?', ['It repeats every 4.'], '⭐🌙🌙🌙'),
      ],
      practice: [
        tp('next', (r) => {
          const core = r.shuffle(PAT).slice(0, r.int(2, 3));
          if (r.int(0, 1) === 1) core.push(core[core.length - 1]);
          const len = core.length * 2 + r.int(0, core.length - 1);
          const seq = Array.from({ length: len }, (_, i) => core[i % core.length]);
          const a = core[len % core.length];
          return mcq(r, `What comes next? ${seq.join('')} ?`, a, PAT.filter((x) => x !== a).slice(0, 3), ['Find the part that repeats.', 'Where in the core does the pattern stop?'], [`The core is ${core.join('')}, so next is ${a}.`], [['wrong', 'Say the pattern aloud to find what comes after the last one.']]);
        }),
        tp('grow', (r) => {
          const e = r.pick(['🟠', '⭐', '🌼', '🔵']), step = r.int(1, 3), s = r.int(1, 3);
          const terms = [0, 1, 2, 3].map((i) => s + i * step);
          return typed(`Beads grow like this: ${terms.map((t) => e.repeat(t)).join(' | ')}. How many beads in the next group?`, num(s + 4 * step), ['Count the beads in each group.', `Each group has ${step} more.`], [`${terms.join(', ')}, ${s + 4 * step}`], [[String(terms[3] + 1), `It grows by ${step} each time.`]]);
        }),
      ],
    },
    {
      id: 'ts4.m.pat.num', title: 'Number and calendar patterns',
      intro: [
        h('Numbers that follow a rule'),
        p('5, 10, 15, 20… The rule is "add 5". 100, 90, 80… The rule is "take away 10".'),
        vis({ kind: 'number-line', from: 0, to: 30, step: 5, marks: [5, 10, 15, 20, 25] }, 'Add 5 each time'),
        photo('📝', 'In a calendar, a date directly below is 7 more.'),
        keys('Find the rule by subtracting neighbours.', 'Calendar: down one row = +7, right one box = +1.'),
        tip('Check your rule on every pair, not just the first.'),
      ],
      examples: [
        ex('3, 7, 11, 15, ?', ['Each step adds 4.', '15 + 4 = 19'], '19'),
        ex('In a calendar, 9 is in a box. What date is just below it?', ['Down one row = +7'], '16'),
      ],
      practice: [
        tp('rule', (r) => {
          const s = r.int(1, 50), k = r.int(2, 12), down = r.int(0, 2) === 0;
          const seq = [0, 1, 2, 3].map((i) => (down ? s + 5 * k - i * k : s + i * k));
          const a = down ? seq[3] - k : seq[3] + k;
          return typed(`Find the next number: ${seq.join(', ')}, ?`, num(a), ['What is the difference between neighbours?', down ? 'The numbers go down.' : 'The numbers go up.'], [`Rule: ${down ? 'take away' : 'add'} ${k}`, `${seq[3]} ${down ? '−' : '+'} ${k} = ${a}`], [[String(down ? seq[3] + k : seq[3] - k), down ? 'The numbers are getting smaller — subtract.' : 'The numbers are getting bigger — add.']]);
        }),
        tp('cal', (r) => {
          const d = r.int(1, 20), dir = r.pick(['below', 'above', 'right of']);
          const ok = dir === 'above' ? d > 7 : true;
          const dd = ok ? d : d + 7;
          const a = dir === 'below' ? dd + 7 : dir === 'above' ? dd - 7 : dd + 1;
          return typed(`On a calendar page, which date is just ${dir} ${dd}?`, num(a), ['A week has 7 days in each row.', 'Down = +7, up = −7, right = +1.'], [`${dd} ${dir === 'below' ? '+ 7' : dir === 'above' ? '− 7' : '+ 1'} = ${a}`], [[String(dir === 'below' ? dd + 1 : dd + 7), 'Rows go across; moving down a row adds 7, moving right adds 1.']]);
        }),
      ],
    },
  ],
};

// ================================================================== CH 17
const ch17: USpec = {
  id: 'ts4.m.ch17', subject: 'math', title: 'Artificial Intelligence and Digital Literacy', source: src(17),
  objectives: [
    {
      id: 'ts4.m.ai.tools', title: 'Computers and AI tools that help us learn',
      intro: [
        h('Smart helpers'),
        p('Artificial Intelligence (AI) is when a computer program learns from lots of examples so it can help us — like suggesting words, reading aloud, or recognising pictures.'),
        photo('💡', 'AI is an idea built by people: a program that learns from examples.'),
        vis({ kind: 'emoji', text: '🧒 ➡️ 💻 ➡️ 💡' }, 'You ask, the program helps, you learn'),
        p('Learning apps such as GCompris have maths and reading games for children. You can practise counting, clocks and money on them.'),
        keys('AI tools are made by people.', 'They can make mistakes — always check.', 'Use them with a teacher or parent.'),
        tip('Treat an AI helper like a helpful book: useful, but check what it says.'),
      ],
      examples: [
        ex('A learning app says 7 × 8 = 54. What should you do?', ['Check: 7 × 8 = 56.', 'Apps and AI can make mistakes.'], 'Check it yourself and tell your teacher'),
        ex('Name one thing a computer learning game can help you practise.', ['GCompris has counting, clock and money games.'], 'For example: reading the clock'),
      ],
      practice: [
        bank('ai', [
          ['Who makes AI programs?', 'People', ['They grow on trees', 'They make themselves from nothing'], ['Think of who writes computer programs.', 'Engineers and scientists.'], 'People make AI programs.', 'AI is made by people who write programs.'],
          ['Can an AI helper make mistakes?', 'Yes, so we should check', ['No, never', 'Only on Sundays'], ['Machines learn from examples.', 'Examples can be wrong.'], 'AI can make mistakes, so we check answers.', 'No tool is always right.'],
          ['Which is a good way to use a learning app?', 'Practise maths games with a grown-up nearby', ['Use it all night instead of sleeping', 'Share your home address in it'], ['Think about safety and health.', 'Rest and privacy matter.'], 'Use apps for short practice with a grown-up.', 'Sleep and privacy are important.'],
          ['What is GCompris?', 'A set of learning games for children', ['A type of fruit', 'A bus company'], ['It runs on a computer.', 'It has counting and reading games.'], 'GCompris is a collection of educational games.', 'It is computer software for learning.'],
          ['An app reads a story aloud to you. What kind of help is this?', 'Text to speech', ['Cooking', 'Weighing'], ['The app turns written words into sound.', 'Text → speech.'], 'It is text to speech.', 'The app is speaking the text.'],
          ['Which of these is a computer device?', 'Tablet', ['Pencil', 'Bucket'], ['It has a screen and runs apps.', 'Pencils and buckets do not.'], 'A tablet is a small computer.', 'Only the tablet runs programs.'],
        ]),
      ],
    },
    {
      id: 'ts4.m.ai.chatbot', title: 'Chatbots and staying safe online',
      intro: [
        h('Talking to a computer'),
        p('A chatbot is a computer program you can type or talk to. It answers in words. It is not a real person.'),
        photo('🗣️', 'A chatbot answers your questions in words.'),
        vis({ kind: 'emoji', text: '🧒 ❓ → 💻 💬' }, 'You ask a question; the chatbot replies'),
        keys('A chatbot is a program, not a friend or a person.', 'Never share your name, address, phone number or passwords.', 'Ask a parent or teacher before using one.', 'If something feels wrong, stop and tell a grown-up.'),
        remember('Your personal details stay private — always.'),
        tip('Good question: "Explain how to add 345 and 278." Bad idea: typing your home address.'),
      ],
      examples: [
        ex('A chatbot asks for your phone number. What do you do?', ['Personal details are private.', 'Stop and tell a grown-up.'], 'Do not share it; tell a parent or teacher'),
        ex('Is a chatbot a real person?', ['It is a computer program that makes sentences.'], 'No'),
      ],
      practice: [
        bank('safe', [
          ['What is a chatbot?', 'A computer program that answers in words', ['A real person hiding in the phone', 'A kind of robot toy car'], ['You type, it replies.', 'It is software.'], 'A chatbot is a computer program.', 'It is not a person.'],
          ['A website asks for your home address to play a game. What should you do?', 'Do not share it and tell a grown-up', ['Type it quickly', 'Share it with friends too'], ['Your address is private.', 'Ask a grown-up first.'], 'Never share personal details online.', 'Home address is private information.'],
          ['Which is SAFE to ask a chatbot (with a grown-up)?', 'How do I find 1/4 of 20?', ['What is my friend\'s password?', 'Here is my phone number, call me'], ['Learning questions are fine.', 'Personal details are not.'], 'Asking a maths question is safe.', 'Passwords and phone numbers must stay private.'],
          ['A chatbot gives an answer you are not sure about. What should you do?', 'Check with a book or teacher', ['Believe it without checking', 'Copy it in the exam'], ['Chatbots can be wrong.', 'Check another source.'], 'Always check answers.', 'Chatbots can make mistakes.'],
          ['Should you tell a chatbot your password?', 'No, never', ['Yes, always', 'Only if it asks nicely'], ['Passwords are secret.', 'Only you (and parents) should know them.'], 'Never share passwords.', 'Passwords must stay secret.'],
          ['Something online makes you scared. What should you do?', 'Stop and tell a parent or teacher', ['Keep it a secret', 'Keep clicking'], ['Grown-ups can help.', 'You are never in trouble for asking.'], 'Stop and tell a trusted grown-up.', 'Telling a grown-up keeps you safe.'],
        ]),
      ],
    },
  ],
};

// ================================================================== CH 18
const ITEMS: [string, number][] = [['notebook', 25], ['pencil', 5], ['eraser', 3], ['banana', 6], ['samosa', 12], ['pen', 10], ['mango', 20], ['glass of buttermilk', 8]];
const ch18: USpec = {
  id: 'ts4.m.ch18', subject: 'math', title: 'Maths Around Us', source: src(18),
  objectives: [
    {
      id: 'ts4.m.life.rate', title: 'Rate charts and shopping',
      intro: [
        h('Read the board, find the cost'),
        p('A shop board says: notebook ₹25, pencil ₹5, eraser ₹3. To buy 4 notebooks, multiply: 4 × 25 = ₹100.'),
        photo('🏪', 'Kirana shops and canteens show rate charts.'),
        vis({ kind: 'coins', rupees: [10, 10, 5] }, '₹25 in coins'),
        keys('Cost = number of items × rate.', 'Total bill = add the costs.', 'Change = money given − bill.'),
        tip('Write each item\'s cost on a separate line, then add.'),
      ],
      examples: [
        ex('3 samosas at ₹12 each and 2 glasses of buttermilk at ₹8 each. Total?', ['3 × 12 = 36', '2 × 8 = 16', '36 + 16 = 52'], '₹52'),
        ex('You pay ₹100 for a bill of ₹52. What change do you get?', ['100 − 52 = 48'], '₹48'),
      ],
      practice: [
        tp('cost', (r) => {
          const [a, b] = r.shuffle(ITEMS).slice(0, 2), na = r.int(2, 6), nb = r.int(1, 5);
          const tot = na * a[1] + nb * b[1];
          return typed(`Rate chart: ${a[0]} ₹${a[1]}, ${b[0]} ₹${b[1]}. ${nm(r)} buys ${na} ${a[0]}s and ${nb} ${b[0]}${nb > 1 ? 's' : ''}. What is the total cost in rupees?`, num(tot),
            ['Find the cost of each item first.', 'Then add.'], [`${na} × ${a[1]} = ${na * a[1]}`, `${nb} × ${b[1]} = ${nb * b[1]}`, `Total = ₹${tot}`], [[String(a[1] + b[1]), 'Multiply each rate by how many are bought.']]);
        }, 2),
        tp('change', (r) => {
          const [it, rate] = r.pick(ITEMS), n = r.int(1, 4), bill = n * rate;
          const paid = bill <= 50 ? 50 : bill <= 100 ? 100 : 200;
          return typed(`${n} ${it}${n > 1 ? 's' : ''} cost ₹${rate} each. You pay with a ₹${paid} note. How much change do you get?`, num(paid - bill), ['First find the bill.', 'Change = money paid − bill.'], [`Bill = ${n} × ${rate} = ₹${bill}`, `Change = ${paid} − ${bill} = ₹${paid - bill}`], [[String(bill), 'That is the bill. Subtract it from the money paid.']]);
        }),
      ],
    },
    {
      id: 'ts4.m.life.travel', title: 'Travel, seating and postage problems',
      intro: [
        h('Maths on the move'),
        p('68 children go on a school trip to Bhongir Fort. A van carries 10 children. 6 vans carry 60 — 8 are still left, so we need 7 vans!'),
        photo('🚐', 'When some people are left, we need one more vehicle.'),
        vis({ kind: 'objects', emoji: '🧒', count: 18, groupsOf: 10 }, '18 children need 2 vans of 10'),
        keys('Seats needed: divide, and if anyone is left over, add one more vehicle.', 'Postage: number of stamps × price of each.', 'Total travel cost = tickets × fare.'),
        tip('Ask: "Is it OK to leave someone behind?" If not, round up!'),
      ],
      examples: [
        ex('45 people, buses of 20 seats. How many buses?', ['20 × 2 = 40, 5 left', '5 more people need another bus.'], '3 buses'),
        ex('A letter needs 3 stamps of ₹5. Cost?', ['3 × 5 = 15'], '₹15'),
      ],
      practice: [
        tp('vans', (r) => {
          const cap = r.pick([6, 8, 10, 12]), n = cap * r.int(2, 6) + r.int(1, cap - 1);
          const need = Math.ceil(n / cap);
          return typed(`${n} children go on a trip to Bhongir Fort. Each van holds ${cap} children. How many vans are needed so nobody is left behind?`, num(need), [`${n} ÷ ${cap} = ${Math.floor(n / cap)} remainder ${n % cap}.`, 'The children left over need one more van.'], [`${cap} × ${Math.floor(n / cap)} = ${cap * Math.floor(n / cap)}`, `${n % cap} still left → one more van`, `${need} vans`], [[String(need - 1), `${n % cap} children would be left behind! Add one more van.`]]);
        }, 2),
        tp('fare', (r) => {
          const f = r.int(15, 60), n = r.int(2, 6), back = r.int(0, 1) === 1;
          return typed(`A bus ticket from the village to Karimnagar costs ₹${f}. ${n} family members travel ${back ? 'there and back' : 'one way'}. What is the total fare?`, num(f * n * (back ? 2 : 1)), ['Multiply the fare by the number of people.', back ? 'There and back means two tickets each.' : 'Only one ticket each.'], [`${n} × ${f} = ${n * f}`, back ? `× 2 for the return = ₹${2 * n * f}` : `Total ₹${n * f}`], back ? [[String(n * f), 'They also come back — double it.']] : []);
        }),
        tp('post', (r) => {
          const s = r.pick([2, 5, 10]), k = r.int(2, 6), L2 = r.int(2, 5);
          return typed(`Each envelope needs ${k} stamps of ₹${s}. How much does it cost to post ${L2} envelopes?`, num(s * k * L2), ['Cost for one envelope first.', `Then × ${L2}.`], [`One envelope: ${k} × ${s} = ₹${k * s}`, `${L2} envelopes: ${L2} × ${k * s} = ₹${L2 * k * s}`]);
        }),
      ],
    },
  ],
};

export const units: USpec[] = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17, ch18];
