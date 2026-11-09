// Bilingual (English / Telugu) mathematics and physics glossary for older classes.
// Telugu terms follow Telangana / AP SCERT Telugu-medium textbook usage as closely as we could
// determine; ALL Telugu needs native-speaker educator review before release.
import type { ClassLevel } from '../shared/levels';

export interface GlossaryTerm {
  id: string;
  en: string;
  te: string;
  definition: { en: string; te: string };
  /** First class level where the term is used. */
  from: ClassLevel;
}

const g = (id: string, en: string, te: string, defEn: string, defTe: string, from: ClassLevel): GlossaryTerm => ({ id, en, te, definition: { en: defEn, te: defTe }, from });

export const glossary: GlossaryTerm[] = [
  // number
  g('place-value', 'Place value', 'స్థాన విలువ', 'The value a digit has because of its position in a number.', 'ఒక సంఖ్యలో అంకె ఉన్న స్థానం వల్ల దానికి వచ్చే విలువ.', 5),
  g('even', 'Even number', 'సరి సంఖ్య', 'A whole number that can be divided into two equal groups (divisible by 2).', '2 చేత నిశ్శేషంగా భాగించబడే పూర్ణ సంఖ్య.', 4),
  g('odd', 'Odd number', 'బేసి సంఖ్య', 'A whole number that leaves remainder 1 when divided by 2.', '2 చేత భాగిస్తే శేషం 1 వచ్చే సంఖ్య.', 4),
  g('factor', 'Factor', 'కారణాంకం', 'A number that divides another number exactly.', 'ఒక సంఖ్యను నిశ్శేషంగా భాగించే సంఖ్య.', 7),
  g('multiple', 'Multiple', 'గుణిజం', 'The result of multiplying a number by a whole number.', 'ఒక సంఖ్యను పూర్ణ సంఖ్యతో గుణిస్తే వచ్చే లబ్ధం.', 7),
  g('prime', 'Prime number', 'ప్రధాన సంఖ్య', 'A number greater than 1 whose only factors are 1 and itself.', '1 మరియు అదే సంఖ్య మాత్రమే కారణాంకాలుగా గల 1 కంటే పెద్ద సంఖ్య.', 8),
  g('composite', 'Composite number', 'సంయుక్త సంఖ్య', 'A number greater than 1 that has more than two factors.', 'రెండు కంటే ఎక్కువ కారణాంకాలు గల సంఖ్య.', 8),
  g('hcf', 'HCF (highest common factor)', 'గ.సా.భా (గరిష్ఠ సామాన్య భాజకం)', 'The largest number that divides each of the given numbers.', 'ఇచ్చిన సంఖ్యలన్నింటినీ భాగించే అతి పెద్ద సంఖ్య.', 9),
  g('lcm', 'LCM (lowest common multiple)', 'క.సా.గు (కనిష్ఠ సామాన్య గుణిజం)', 'The smallest number that is a multiple of each of the given numbers.', 'ఇచ్చిన సంఖ్యలన్నింటికీ గుణిజమైన అతి చిన్న సంఖ్య.', 9),
  g('integer', 'Integer', 'పూర్ణ సంఖ్య', 'A whole number or its negative: …, −2, −1, 0, 1, 2, …', '…, −2, −1, 0, 1, 2, … వంటి సంఖ్యలు.', 8),
  g('rational', 'Rational number', 'అకరణీయ సంఖ్య', 'A number that can be written as p/q with integers p, q and q ≠ 0.', 'p, q పూర్ణ సంఖ్యలు, q ≠ 0 అయ్యేలా p/q రూపంలో రాయగల సంఖ్య.', 11),
  g('irrational', 'Irrational number', 'కరణీయ సంఖ్య', 'A real number that cannot be written as p/q, e.g. √2, π.', 'p/q రూపంలో రాయలేని వాస్తవ సంఖ్య, ఉదా. √2, π.', 11),
  g('real', 'Real numbers', 'వాస్తవ సంఖ్యలు', 'All rational and irrational numbers together.', 'అకరణీయ, కరణీయ సంఖ్యలన్నీ కలిపి.', 11),
  g('exponent', 'Exponent (power)', 'ఘాతాంకం', 'Tells how many times the base is multiplied by itself, e.g. 2³ = 2 × 2 × 2.', 'భూమిని ఎన్నిసార్లు దానితోనే గుణించాలో తెలిపేది, ఉదా. 2³ = 2 × 2 × 2.', 10),
  g('square', 'Square of a number', 'వర్గం', 'A number multiplied by itself.', 'ఒక సంఖ్యను అదే సంఖ్యతో గుణించడం.', 10),
  g('square-root', 'Square root', 'వర్గమూలం', 'A number whose square is the given number.', 'ఏ సంఖ్య వర్గం ఇచ్చిన సంఖ్య అవుతుందో ఆ సంఖ్య.', 10),
  g('cube', 'Cube of a number', 'ఘనం', 'A number multiplied by itself three times.', 'ఒక సంఖ్యను మూడుసార్లు గుణించడం.', 10),
  // fractions, decimals, percent
  g('fraction', 'Fraction', 'భిన్నం', 'A number that names equal parts of a whole, written a/b.', 'పూర్ణంలోని సమాన భాగాలను సూచించే సంఖ్య, a/b గా రాస్తాం.', 5),
  g('numerator', 'Numerator', 'లవం', 'The top number of a fraction: how many parts are taken.', 'భిన్నంలో పై సంఖ్య: ఎన్ని భాగాలు తీసుకున్నామో తెలుపుతుంది.', 6),
  g('denominator', 'Denominator', 'హారం', 'The bottom number of a fraction: into how many equal parts the whole is split.', 'భిన్నంలో కింది సంఖ్య: పూర్ణాన్ని ఎన్ని సమాన భాగాలుగా చేశామో తెలుపుతుంది.', 6),
  g('equivalent-fractions', 'Equivalent fractions', 'సమాన భిన్నాలు', 'Fractions that name the same amount, e.g. 1/2 = 2/4.', 'ఒకే విలువను సూచించే భిన్నాలు, ఉదా. 1/2 = 2/4.', 7),
  g('decimal', 'Decimal', 'దశాంశం', 'A number written with a decimal point to show tenths, hundredths, …', 'పదో వంతులు, వందో వంతులు చూపడానికి దశాంశ బిందువుతో రాసే సంఖ్య.', 7),
  g('percentage', 'Percentage', 'శాతం', 'A fraction out of 100, written with %.', '100 లో ఎంత భాగమో తెలిపే భిన్నం, % తో రాస్తాం.', 9),
  g('ratio', 'Ratio', 'నిష్పత్తి', 'A comparison of two quantities by division, written a : b.', 'రెండు రాశులను భాగహారం ద్వారా పోల్చడం, a : b గా రాస్తాం.', 9),
  g('proportion', 'Proportion', 'అనుపాతం', 'A statement that two ratios are equal.', 'రెండు నిష్పత్తులు సమానమని తెలిపే ప్రవచనం.', 9),
  g('direct-proportion', 'Direct proportion', 'అనులోమానుపాతం', 'When one quantity increases, the other increases in the same ratio.', 'ఒక రాశి పెరిగితే మరొకటి అదే నిష్పత్తిలో పెరగడం.', 10),
  g('inverse-proportion', 'Inverse proportion', 'విలోమానుపాతం', 'When one quantity increases, the other decreases so that their product stays the same.', 'ఒక రాశి పెరిగితే మరొకటి తగ్గి, వాటి లబ్ధం స్థిరంగా ఉండడం.', 10),
  // algebra
  g('variable', 'Variable', 'చరరాశి', 'A letter that stands for a number that can change.', 'మారే సంఖ్యను సూచించే అక్షరం.', 9),
  g('expression', 'Algebraic expression', 'బీజీయ సమాసం', 'A combination of numbers, variables and operations, e.g. 3x + 2.', 'సంఖ్యలు, చరరాశులు, ప్రక్రియల కలయిక, ఉదా. 3x + 2.', 9),
  g('equation', 'Equation', 'సమీకరణం', 'A statement that two expressions are equal.', 'రెండు సమాసాలు సమానమని తెలిపే ప్రవచనం.', 9),
  g('identity', 'Algebraic identity', 'బీజీయ సర్వసమీకరణం', 'An equation true for every value of the variables, e.g. (a + b)² = a² + 2ab + b².', 'చరరాశుల అన్ని విలువలకూ సత్యమయ్యే సమీకరణం.', 10),
  g('polynomial', 'Polynomial', 'బహుపది', 'An expression with terms of the form axⁿ where n is a whole number.', 'n పూర్ణాంకం అయ్యేలా axⁿ రూప పదాలు గల సమాసం.', 11),
  g('coefficient', 'Coefficient', 'గుణకం', 'The number multiplying a variable in a term.', 'ఒక పదంలో చరరాశిని గుణించే సంఖ్య.', 10),
  g('zero-of-polynomial', 'Zero of a polynomial', 'బహుపది శూన్యం', 'A value of x that makes the polynomial equal to 0.', 'బహుపది విలువను 0 చేసే x విలువ.', 11),
  g('linear-equation', 'Linear equation', 'రేఖీయ సమీకరణం', 'An equation whose graph is a straight line; variables have power 1.', 'గ్రాఫ్ సరళరేఖ అయ్యే సమీకరణం; చరరాశుల ఘాతం 1.', 11),
  g('quadratic-equation', 'Quadratic equation', 'వర్గ సమీకరణం', 'An equation of the form ax² + bx + c = 0, a ≠ 0.', 'ax² + bx + c = 0 (a ≠ 0) రూపంలోని సమీకరణం.', 12),
  g('discriminant', 'Discriminant', 'విచక్షణి', 'D = b² − 4ac; tells the nature of the roots.', 'D = b² − 4ac; మూలాల స్వభావాన్ని తెలుపుతుంది.', 12),
  g('root', 'Root (of an equation)', 'మూలం', 'A value that satisfies the equation.', 'సమీకరణాన్ని తృప్తిపరిచే విలువ.', 12),
  g('ap', 'Arithmetic progression', 'అంకశ్రేఢి', 'A list where each term is the previous one plus a fixed number.', 'ప్రతి పదం ముందు పదానికి ఒక స్థిర సంఖ్య కలిపితే వచ్చే జాబితా.', 11),
  g('common-difference', 'Common difference', 'సామాన్య భేదం', 'The fixed amount added to get the next term of an AP.', 'అంకశ్రేఢిలో తర్వాతి పదం కోసం కలిపే స్థిర సంఖ్య.', 11),
  // geometry & measurement
  g('angle', 'Angle', 'కోణం', 'The amount of turn between two rays from a common point.', 'ఒకే బిందువు నుండి బయలుదేరే రెండు కిరణాల మధ్య తిరుగుడు.', 7),
  g('right-angle', 'Right angle', 'లంబకోణం', 'An angle of 90°.', '90° కోణం.', 7),
  g('parallel', 'Parallel lines', 'సమాంతర రేఖలు', 'Lines in a plane that never meet.', 'ఒకే తలంలో ఎప్పటికీ కలవని రేఖలు.', 8),
  g('perpendicular', 'Perpendicular lines', 'లంబ రేఖలు', 'Lines that meet at a right angle.', 'లంబకోణంలో కలిసే రేఖలు.', 8),
  g('triangle', 'Triangle', 'త్రిభుజం', 'A closed figure with three straight sides.', 'మూడు సరళ భుజాలు గల సంవృత పటం.', 5),
  g('quadrilateral', 'Quadrilateral', 'చతుర్భుజం', 'A closed figure with four straight sides.', 'నాలుగు సరళ భుజాలు గల సంవృత పటం.', 10),
  g('congruent', 'Congruent', 'సర్వసమానం', 'Exactly the same shape and size.', 'ఆకారం, పరిమాణం రెండూ ఒకేలా ఉండడం.', 9),
  g('similar', 'Similar', 'సరూపం', 'Same shape (equal angles), sides in the same ratio.', 'ఒకే ఆకారం (సమాన కోణాలు), భుజాలు ఒకే నిష్పత్తిలో.', 12),
  g('symmetry', 'Line of symmetry', 'సౌష్ఠవ రేఖ', 'A line that folds a figure into two matching halves.', 'పటాన్ని రెండు సమాన సరిపోలే భాగాలుగా మడిచే రేఖ.', 6),
  g('perimeter', 'Perimeter', 'చుట్టుకొలత', 'The total length of the boundary of a figure.', 'పటం సరిహద్దు మొత్తం పొడవు.', 7),
  g('area', 'Area', 'వైశాల్యం', 'The amount of surface a flat figure covers, in square units.', 'సమతల పటం ఆక్రమించే ఉపరితలం, చదరపు యూనిట్లలో.', 7),
  g('volume', 'Volume', 'ఘనపరిమాణం', 'The amount of space a solid occupies, in cubic units.', 'ఘనపదార్థం ఆక్రమించే స్థలం, ఘన యూనిట్లలో.', 11),
  g('surface-area', 'Surface area', 'ఉపరితల వైశాల్యం', 'The total area of all the faces or curved surfaces of a solid.', 'ఘనపు అన్ని ముఖాలు/వక్రతలాల మొత్తం వైశాల్యం.', 11),
  g('circle', 'Circle', 'వృత్తం', 'All points at the same distance from a centre.', 'కేంద్రం నుండి సమాన దూరంలో ఉండే బిందువులన్నీ.', 8),
  g('radius', 'Radius', 'వ్యాసార్థం', 'Distance from the centre of a circle to the circle.', 'వృత్త కేంద్రం నుండి వృత్తానికి దూరం.', 8),
  g('diameter', 'Diameter', 'వ్యాసం', 'A chord through the centre; twice the radius.', 'కేంద్రం గుండా వెళ్ళే జ్యా; వ్యాసార్థానికి రెట్టింపు.', 8),
  g('tangent', 'Tangent (to a circle)', 'స్పర్శరేఖ', 'A line that touches a circle at exactly one point.', 'వృత్తాన్ని ఒకే ఒక బిందువు వద్ద తాకే రేఖ.', 12),
  g('sector', 'Sector', 'సెక్టారు (త్రిజ్యాంతరం)', 'The region between two radii and an arc.', 'రెండు వ్యాసార్థాలు, ఒక చాపం మధ్య ప్రాంతం.', 12),
  g('pythagoras', 'Baudhayana–Pythagoras theorem', 'బౌధాయన–పైథాగరస్ సిద్ధాంతం', 'In a right triangle, hypotenuse² = sum of squares of the other two sides.', 'లంబకోణ త్రిభుజంలో కర్ణం² = మిగిలిన రెండు భుజాల వర్గాల మొత్తం.', 10),
  g('hypotenuse', 'Hypotenuse', 'కర్ణం', 'The side opposite the right angle; the longest side.', 'లంబకోణానికి ఎదురుగా ఉండే అతి పొడవైన భుజం.', 10),
  g('coordinates', 'Coordinates', 'నిరూపకాలు', 'An ordered pair (x, y) that fixes a point on the plane.', 'తలంపై బిందువు స్థానాన్ని తెలిపే క్రమ యుగ్మం (x, y).', 11),
  g('trigonometry', 'Trigonometry', 'త్రికోణమితి', 'The study of relations between angles and sides of triangles.', 'త్రిభుజాల కోణాలు, భుజాల మధ్య సంబంధాల అధ్యయనం.', 12),
  g('angle-of-elevation', 'Angle of elevation', 'ఊర్ధ్వ కోణం', 'Angle above the horizontal to an object higher than the eye.', 'కంటి కంటే ఎత్తులోని వస్తువు వైపు క్షితిజ సమాంతరం నుండి పైకి కోణం.', 12),
  // data & chance
  g('data', 'Data', 'దత్తాంశం', 'Facts or numbers collected to answer a question.', 'ఒక ప్రశ్నకు సమాధానం కోసం సేకరించిన వివరాలు లేదా సంఖ్యలు.', 4),
  g('tally', 'Tally marks', 'టాలీ గుర్తులు', 'Marks in groups of five used for counting.', 'లెక్కపెట్టడానికి ఐదేసి గుంపులుగా వేసే గీతలు.', 4),
  g('bar-graph', 'Bar graph', 'కమ్మీ రేఖాచిత్రం', 'A chart that shows data with bars of different lengths.', 'వివిధ పొడవుల కమ్మీలతో దత్తాంశాన్ని చూపే చిత్రం.', 6),
  g('mean', 'Mean (average)', 'సగటు (అంకగణిత మధ్యమం)', 'Sum of the values divided by the number of values.', 'విలువల మొత్తాన్ని విలువల సంఖ్యతో భాగించగా వచ్చేది.', 9),
  g('median', 'Median', 'మధ్యగతం', 'The middle value when data is arranged in order.', 'దత్తాంశాన్ని క్రమంలో అమర్చినప్పుడు మధ్య విలువ.', 9),
  g('mode', 'Mode', 'బాహుళకం', 'The value that occurs most often.', 'ఎక్కువసార్లు వచ్చే విలువ.', 9),
  g('frequency', 'Frequency', 'పౌనఃపున్యం', 'How many times a value or class occurs.', 'ఒక విలువ లేదా తరగతి ఎన్నిసార్లు వచ్చిందో.', 9),
  g('probability', 'Probability', 'సంభావ్యత', 'How likely an event is, from 0 (impossible) to 1 (certain).', 'ఒక ఘటన జరిగే అవకాశం; 0 (అసాధ్యం) నుండి 1 (నిశ్చితం) వరకు.', 11),
  g('proposition', 'Proposition (statement)', 'ప్రవచనం', 'A sentence that is either true or false.', 'సత్యం లేదా అసత్యం అయ్యే వాక్యం.', 11),
  g('converse', 'Converse', 'విపర్యయం', 'The statement formed by swapping the "if" and "then" parts.', '"అయితే" మరియు "అప్పుడు" భాగాలను తారుమారు చేసిన ప్రవచనం.', 11),
  g('algorithm', 'Algorithm', 'అల్గారిథం (క్రమ విధానం)', 'A finite list of exact steps that solves a problem.', 'ఒక సమస్యను పరిష్కరించే నిర్దిష్ట దశల క్రమం.', 11),
  // physics
  g('force', 'Force', 'బలం', 'A push or a pull; measured in newtons (N).', 'నెట్టడం లేదా లాగడం; న్యూటన్లలో (N) కొలుస్తాం.', 8),
  g('friction', 'Friction', 'ఘర్షణ', 'A force that opposes sliding between two surfaces in contact.', 'తాకుతున్న రెండు ఉపరితలాల మధ్య జారడాన్ని వ్యతిరేకించే బలం.', 7),
  g('mass', 'Mass', 'ద్రవ్యరాశి', 'The amount of matter in an object; measured in kilograms (kg).', 'వస్తువులోని పదార్థ పరిమాణం; కిలోగ్రాములలో కొలుస్తాం.', 8),
  g('speed', 'Speed', 'వడి', 'Distance travelled per unit time.', 'ఒక యూనిట్ కాలంలో ప్రయాణించిన దూరం.', 9),
  g('velocity', 'Velocity', 'వేగం', 'Speed in a given direction.', 'ఒక నిర్దిష్ట దిశలో వడి.', 11),
  g('acceleration', 'Acceleration', 'త్వరణం', 'Rate of change of velocity; measured in m/s².', 'వేగంలో మార్పు రేటు; m/s² లో కొలుస్తాం.', 11),
  g('pressure', 'Pressure', 'పీడనం', 'Force acting per unit area; measured in pascals (Pa).', 'ఒక యూనిట్ వైశాల్యంపై పనిచేసే బలం; పాస్కల్‌లలో కొలుస్తాం.', 10),
  g('work', 'Work', 'పని', 'Force × distance moved in the direction of the force; measured in joules (J).', 'బలం × బల దిశలో కదిలిన దూరం; జౌల్‌లలో కొలుస్తాం.', 11),
  g('energy', 'Energy', 'శక్తి', 'The ability to do work; measured in joules (J).', 'పని చేయగల సామర్థ్యం; జౌల్‌లలో కొలుస్తాం.', 11),
  g('power-phy', 'Power', 'సామర్థ్యం (పవర్)', 'Rate of doing work; measured in watts (W).', 'పని చేసే రేటు; వాట్లలో కొలుస్తాం.', 11),
  g('current', 'Electric current', 'విద్యుత్ ప్రవాహం', 'Rate of flow of charge; measured in amperes (A).', 'ఆవేశ ప్రవాహ రేటు; ఆంపియర్లలో కొలుస్తాం.', 9),
  g('potential-difference', 'Potential difference (voltage)', 'పొటెన్షియల్ భేదం (వోల్టేజి)', 'The push that drives current; measured in volts (V).', 'విద్యుత్ ప్రవాహాన్ని నడిపించేది; వోల్టులలో కొలుస్తాం.', 12),
  g('resistance', 'Resistance', 'నిరోధం', 'Opposition to current; measured in ohms (Ω).', 'విద్యుత్ ప్రవాహానికి వ్యతిరేకత; ఓమ్‌లలో కొలుస్తాం.', 12),
  g('circuit', 'Electric circuit', 'విద్యుత్ వలయం', 'A closed path through which current flows.', 'విద్యుత్ ప్రవహించే సంవృత మార్గం.', 9),
  g('magnet', 'Magnet', 'అయస్కాంతం', 'An object that attracts iron and has a north and a south pole.', 'ఇనుమును ఆకర్షించే, ఉత్తర-దక్షిణ ధ్రువాలు గల వస్తువు.', 6),
  g('reflection', 'Reflection of light', 'కాంతి పరావర్తనం', 'Bouncing back of light from a surface.', 'ఉపరితలం నుండి కాంతి వెనక్కి తిరిగి రావడం.', 9),
  g('refraction', 'Refraction of light', 'కాంతి వక్రీభవనం', 'Bending of light as it passes from one medium into another.', 'ఒక యానకం నుండి మరొక యానకంలోకి వెళ్ళేటప్పుడు కాంతి వంగడం.', 12),
  g('refractive-index', 'Refractive index', 'వక్రీభవన గుణకం', 'n = speed of light in vacuum ÷ speed in the medium.', 'n = శూన్యంలో కాంతి వడి ÷ యానకంలో కాంతి వడి.', 12),
  g('focal-length', 'Focal length', 'నాభ్యంతరం', 'Distance from a mirror or lens to its principal focus.', 'దర్పణం లేదా కటకం నుండి ప్రధాన నాభికి దూరం.', 10),
  g('frequency-phy', 'Frequency (of a wave)', 'పౌనఃపున్యం (తరంగం)', 'Number of vibrations per second; measured in hertz (Hz).', 'సెకనుకు కంపనాల సంఖ్య; హెర్ట్జ్‌లలో కొలుస్తాం.', 11),
  g('wavelength', 'Wavelength', 'తరంగదైర్ఘ్యం', 'Distance between two neighbouring crests of a wave.', 'తరంగంలో రెండు వరుస శృంగాల మధ్య దూరం.', 11),

];

/** Glossary terms relevant up to a class level (older classes see the full list). */
export const glossaryFor = (level: ClassLevel): GlossaryTerm[] => glossary.filter((t) => t.from <= level);
