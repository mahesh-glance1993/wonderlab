// Original colouring pages (simple SVG line art drawn for WonderLab). Outlines only — no fills —
// because the outline is rasterised onto a locked template layer that sits above the colours.
export type PageCategory = 'animals' | 'nature' | 'vehicles' | 'patterns' | 'science';
export interface ColoringPage { id: string; title: string; titleTe: string; category: PageCategory; level: 'easy' | 'detailed'; svg: string }

export const CATEGORIES: { id: PageCategory; label: string; labelTe: string }[] = [
  { id: 'animals', label: 'Animals', labelTe: 'జంతువులు' },
  { id: 'nature', label: 'Nature', labelTe: 'ప్రకృతి' },
  { id: 'vehicles', label: 'Vehicles', labelTe: 'వాహనాలు' },
  { id: 'patterns', label: 'Patterns', labelTe: 'నమూనాలు' },
  { id: 'science', label: 'Science', labelTe: 'సైన్స్' },
];

const doc = (inner: string, sw = 6) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600"><g fill="none" stroke="#1d1d1d" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
const text = (x: number, y: number, t: string, size = 24, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" fill="#1d1d1d" stroke="none" text-anchor="${anchor}">${t}</text>`;
const mirror = (inner: string) => `${inner}<g transform="translate(800,0) scale(-1,1)">${inner}</g>`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const f = (v: number) => v.toFixed(1);
const starShape = (cx: number, cy: number, R: number, r = R * 0.45) =>
  `<path d="M${range(10).map((i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R; return `${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`; }).join(' L')} Z"/>`;
const sunRays = (cx: number, cy: number, r1: number, r2: number, n = 8) =>
  range(n).map((i) => { const a = (i / n) * Math.PI * 2; return `<path d="M${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))} L${f(cx + r2 * Math.cos(a))} ${f(cy + r2 * Math.sin(a))}"/>`; }).join('');
const cloud = (x: number, y: number, s = 1) =>
  `<path d="M${x} ${y} q${-40 * s} 0 ${-40 * s} ${-30 * s} q0 ${-30 * s} ${35 * s} ${-30 * s} q${10 * s} ${-35 * s} ${55 * s} ${-30 * s} q${30 * s} ${-25 * s} ${65 * s} ${5 * s} q${40 * s} ${-5 * s} ${40 * s} ${30 * s} q${5 * s} ${25 * s} ${-25 * s} ${25 * s} Z"/>`;

const cat = doc(`
<circle cx="400" cy="230" r="120"/>
<path d="M305 165 L285 55 L365 118 Z"/><path d="M495 165 L515 55 L435 118 Z"/>
<ellipse cx="355" cy="220" rx="18" ry="24"/><ellipse cx="445" cy="220" rx="18" ry="24"/>
<path d="M388 262 L412 262 L400 278 Z"/>
<path d="M400 278 Q385 305 365 295 M400 278 Q415 305 435 295"/>
<path d="M330 270 L250 255 M330 282 L250 290 M470 270 L550 255 M470 282 L550 290"/>
<ellipse cx="400" cy="462" rx="150" ry="115"/>
<path d="M540 500 Q690 480 650 330 Q640 300 615 320 Q645 440 548 455"/>
<ellipse cx="340" cy="565" rx="42" ry="22"/><ellipse cx="460" cy="565" rx="42" ry="22"/>`);

const fish = doc(`
<path d="M180 300 Q330 120 520 300 Q330 480 180 300 Z"/>
<path d="M512 300 L650 200 L630 300 L650 400 Z"/>
<circle cx="260" cy="280" r="22"/><circle cx="262" cy="280" r="8"/>
<path d="M310 222 Q345 300 310 378"/>
<path d="M350 216 Q390 110 460 228 Z"/><path d="M360 384 Q400 470 445 372 Z"/>
<path d="M380 260 Q400 280 380 300 M420 260 Q440 280 420 300 M400 300 Q420 320 400 340 M440 300 Q460 320 440 340"/>
<circle cx="150" cy="200" r="18"/><circle cx="120" cy="140" r="12"/><circle cx="160" cy="90" r="9"/>
<path d="M80 600 Q55 520 90 460 Q120 400 92 340"/><path d="M720 600 Q745 530 715 470 Q690 420 720 370"/>
<path d="M0 560 Q200 530 400 560 Q600 590 800 555"/>`);

const owl = doc(`
<ellipse cx="400" cy="320" rx="170" ry="210"/>
<path d="M275 180 L250 85 L335 145 Z"/><path d="M525 180 L550 85 L465 145 Z"/>
<circle cx="330" cy="240" r="62"/><circle cx="470" cy="240" r="62"/>
<circle cx="335" cy="245" r="26"/><circle cx="465" cy="245" r="26"/>
<circle cx="343" cy="236" r="7"/><circle cx="473" cy="236" r="7"/>
<path d="M380 295 L420 295 L400 342 Z"/>
<ellipse cx="400" cy="430" rx="105" ry="95"/>
${[380, 420, 460].map((y, r) => range(4 - (r === 2 ? 1 : 0)).map((i) => { const x = 325 + i * 50 + (r % 2) * 25; return `<path d="M${x} ${y} Q${x + 12} ${y + 22} ${x + 25} ${y}"/>`; }).join('')).join('')}
<path d="M235 300 Q185 430 285 505 Q258 400 292 318 Z"/><path d="M565 300 Q615 430 515 505 Q542 400 508 318 Z"/>
<path d="M60 540 L740 540 L740 572 L60 572 Z"/>
<ellipse cx="350" cy="532" rx="30" ry="12"/><ellipse cx="450" cy="532" rx="30" ry="12"/>`);

const turtle = doc(`
<path d="M200 380 Q220 170 400 160 Q580 170 600 380 Z"/>
<path d="M340 260 L400 225 L460 260 L460 320 L400 355 L340 320 Z"/>
<path d="M340 260 L262 228 M460 260 L538 228 M340 320 L232 360 M460 320 L568 360 M400 225 L400 162 M400 355 L400 380"/>
<path d="M190 380 L610 380 Q622 398 600 412 L200 412 Q178 398 190 380 Z"/>
<ellipse cx="672" cy="330" rx="72" ry="56"/><circle cx="695" cy="314" r="9"/><path d="M695 352 Q715 362 732 346"/>
<ellipse cx="270" cy="445" rx="42" ry="36"/><ellipse cx="530" cy="445" rx="42" ry="36"/>
<path d="M196 388 L128 408 L196 406 Z"/>
<path d="M0 478 L800 478"/>
<circle cx="110" cy="100" r="45"/>${sunRays(110, 100, 60, 85)}`);

const butterflyHalf = `
<path d="M385 262 Q250 80 150 140 Q88 232 200 300 Q300 332 385 302 Z"/>
<path d="M385 322 Q252 330 200 420 Q210 505 300 482 Q372 452 390 372 Z"/>
<circle cx="230" cy="200" r="30"/><circle cx="305" cy="255" r="18"/><circle cx="275" cy="420" r="28"/>
<path d="M390 136 Q362 72 332 62"/><circle cx="326" cy="58" r="10"/>`;
const butterfly = doc(`${mirror(butterflyHalf)}
<ellipse cx="400" cy="322" rx="22" ry="140"/><circle cx="400" cy="160" r="30"/>
<path d="M0 560 Q200 520 400 560 Q600 600 800 550"/>
<path d="M120 600 Q130 560 110 520 M150 600 Q160 560 175 530 M650 600 Q660 560 640 525 M690 600 Q690 560 710 530"/>`);

const petals = (cx: number, cy: number, n: number, d: number, rx: number, ry: number) =>
  range(n).map((i) => `<ellipse cx="${cx}" cy="${cy - d}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`).join('');
const flower = doc(`
${petals(400, 200, 6, 105, 48, 66)}
<circle cx="400" cy="200" r="55"/>
<path d="M392 300 L392 482 M408 300 L408 482"/>
<path d="M408 410 Q485 350 545 380 Q485 445 408 410 Z"/><path d="M392 440 Q315 380 255 410 Q315 475 392 440 Z"/>
<path d="M285 480 L515 480 L515 510 L285 510 Z"/><path d="M300 510 L500 510 L470 592 L330 592 Z"/>`);

const tree = doc(`
<path d="M360 560 L376 330 L424 330 L440 560 Z"/>
<path d="M392 420 L340 360 M410 400 L460 350"/>
<path d="M300 340 Q220 330 230 260 Q200 190 270 160 Q290 90 370 100 Q420 50 480 100 Q560 100 560 170 Q620 220 570 290 Q570 345 500 340 Z"/>
<circle cx="300" cy="220" r="18"/><circle cx="420" cy="160" r="18"/><circle cx="500" cy="250" r="18"/><circle cx="360" cy="290" r="18"/><circle cx="510" cy="160" r="18"/>
<path d="M0 560 Q400 530 800 560"/>
<path d="M100 560 L110 535 L120 560 M600 556 L612 530 L624 556 M180 553 L188 532 L196 553"/>
<circle cx="680" cy="90" r="45"/>${sunRays(680, 90, 60, 85)}`);

const rainbow = doc(`
${[330, 290, 250, 210, 170, 130].map((r) => `<path d="M${400 - r} 470 A${r} ${r} 0 0 1 ${400 + r} 470"/>`).join('')}
<path d="M0 470 L800 470"/>
${cloud(140, 470, 1.4)}${cloud(720, 470, 1.4)}
<path d="M0 530 Q200 480 400 530 Q600 580 800 515"/>
<circle cx="110" cy="100" r="48"/>${sunRays(110, 100, 62, 88)}
<path d="M560 110 Q575 95 590 110 Q605 95 620 110 M640 80 Q652 68 664 80 Q676 68 688 80"/>`);

const pine = (x: number, y: number, s: number) =>
  `<path d="M${x} ${y - 90 * s} L${x - 30 * s} ${y - 45 * s} L${x + 30 * s} ${y - 45 * s} Z"/><path d="M${x} ${y - 65 * s} L${x - 40 * s} ${y - 10 * s} L${x + 40 * s} ${y - 10 * s} Z"/><path d="M${x - 6 * s} ${y - 10 * s} L${x - 6 * s} ${y + 8 * s} L${x + 6 * s} ${y + 8 * s} L${x + 6 * s} ${y - 10 * s}"/>`;
const mountains = doc(`
<circle cx="620" cy="110" r="45"/>
<path d="M0 420 L180 160 L330 420 Z"/><path d="M230 420 L450 110 L670 420 Z"/><path d="M560 420 L700 220 L800 330 L800 420 Z"/>
<path d="M139 219 L180 160 L222 220 L202 240 L181 222 L160 240 Z"/>
<path d="M403 177 L450 110 L497 177 L472 197 L450 178 L428 197 Z"/>
<path d="M672 260 L700 220 L728 252 L712 268 L699 255 L686 270 Z"/>
<path d="M0 420 L800 420"/>
<ellipse cx="400" cy="505" rx="300" ry="55"/>
<path d="M330 500 Q360 490 390 500 M430 520 Q460 510 490 520"/>
${pine(70, 440, 1)}${pine(140, 450, 0.8)}${pine(720, 445, 1)}
<path d="M560 600 L565 555 M575 600 L582 548 M590 600 L592 560"/>
${cloud(200, 110, 0.9)}`);

const car = doc(`
<path d="M90 400 L90 330 Q100 300 150 296 L250 290 L320 200 L540 200 L620 290 L700 300 Q730 310 730 350 L730 400 Z"/>
<path d="M270 290 L335 222 L420 222 L420 290 Z"/><path d="M440 222 L530 222 L588 290 L440 290 Z"/>
<path d="M430 290 L430 395"/><path d="M450 320 L480 320"/>
<circle cx="220" cy="405" r="58"/><circle cx="220" cy="405" r="24"/>
<circle cx="600" cy="405" r="58"/><circle cx="600" cy="405" r="24"/>
<path d="M700 320 L728 320 L728 346 L700 346 Z"/><path d="M92 322 L112 322 L112 346 L92 346 Z"/>
<path d="M0 470 L800 470"/>
<path d="M40 530 L120 530 M200 530 L280 530 M360 530 L440 530 M520 530 L600 530 M680 530 L760 530"/>
${cloud(160, 120)}${cloud(680, 90, 0.8)}`);

const sailboat = doc(`
<path d="M150 420 L650 420 L580 500 L220 500 Z"/>
<path d="M400 420 L400 92"/>
<path d="M390 104 L390 400 L188 400 Z"/><path d="M410 132 L410 400 L590 400 Z"/>
<path d="M400 92 L460 106 L400 122 Z"/>
<circle cx="300" cy="460" r="14"/><circle cx="400" cy="460" r="14"/><circle cx="500" cy="460" r="14"/>
<path d="M0 520 ${range(8).map((i) => `Q${i * 100 + 50} ${i % 2 ? 550 : 490} ${i * 100 + 100} 520`).join(' ')}"/>
<path d="M60 570 Q90 555 120 570 M300 580 Q330 565 360 580 M560 572 Q590 557 620 572"/>
<circle cx="680" cy="100" r="50"/>${sunRays(680, 100, 64, 90)}
<path d="M120 120 Q135 105 150 120 Q165 105 180 120"/>`);

const rocket = doc(`
<path d="M340 450 L340 220 Q340 120 400 60 Q460 120 460 220 L460 450 Z"/>
<path d="M346 175 Q400 160 454 175"/>
<circle cx="400" cy="262" r="38"/><circle cx="400" cy="262" r="24"/>
<path d="M340 340 L262 470 L340 450 Z"/><path d="M460 340 L538 470 L460 450 Z"/>
<path d="M385 450 L385 490 L415 490 L415 450"/>
<path d="M350 455 Q360 540 400 582 Q440 540 450 455"/><path d="M372 462 Q382 520 400 548 Q418 520 428 462"/>
${starShape(120, 110, 26)}${starShape(650, 200, 20)}${starShape(180, 420, 18)}${starShape(700, 480, 24)}
<circle cx="640" cy="90" r="45"/><ellipse cx="640" cy="90" rx="80" ry="18"/>`);

const train = doc(`
<path d="M220 290 L430 290 L430 420 L220 420 Z"/>
<path d="M430 220 L600 220 L600 420 L430 420 Z"/>
<path d="M260 290 L250 210 L310 210 L300 290 Z"/>
<path d="M470 250 L560 250 L560 320 L470 320 Z"/>
<path d="M415 220 L615 220 L615 196 L415 196 Z"/>
<path d="M220 420 L168 462 L220 462 Z"/>
<circle cx="225" cy="330" r="14"/>
<circle cx="270" cy="452" r="34"/><circle cx="380" cy="452" r="34"/><circle cx="520" cy="442" r="44"/>
<circle cx="270" cy="452" r="10"/><circle cx="380" cy="452" r="10"/><circle cx="520" cy="442" r="14"/>
<path d="M600 380 L630 380"/>
<path d="M630 280 L780 280 L780 420 L630 420 Z"/><path d="M650 300 L760 300 L760 360 L650 360 Z"/>
<circle cx="670" cy="452" r="28"/><circle cx="740" cy="452" r="28"/>
<circle cx="290" cy="172" r="25"/><circle cx="330" cy="130" r="32"/><circle cx="392" cy="92" r="40"/>
<path d="M0 488 L800 488 M0 504 L800 504"/>
${range(10).map((i) => `<path d="M${i * 82 + 10} 504 L${i * 82 + 10} 520 L${i * 82 + 50} 520 L${i * 82 + 50} 504"/>`).join('')}`);

const mandala = doc(`
${[40, 90, 150, 215, 270].map((r) => `<circle cx="400" cy="300" r="${r}"/>`).join('')}
${petals(400, 300, 8, 65, 16, 22)}
${petals(400, 300, 12, 120, 22, 30)}
${range(16).map((i) => { const a = (i / 16) * Math.PI * 2; return `<circle cx="${f(400 + 182 * Math.cos(a))}" cy="${f(300 + 182 * Math.sin(a))}" r="20"/>`; }).join('')}
${range(24).map((i) => { const a0 = (i / 24) * Math.PI * 2, a1 = ((i + 1) / 24) * Math.PI * 2, am = (a0 + a1) / 2; return `<path d="M${f(400 + 215 * Math.cos(a0))} ${f(300 + 215 * Math.sin(a0))} Q${f(400 + 262 * Math.cos(am))} ${f(300 + 262 * Math.sin(am))} ${f(400 + 215 * Math.cos(a1))} ${f(300 + 215 * Math.sin(a1))}"/>`; }).join('')}
${starShape(400, 300, 30, 14)}`, 5);

const quilt = doc(`
${range(4).map((c) => range(3).map((r) => { const x = 80 + c * 160, y = 60 + r * 160; const k = (c + r) % 3; const inner = k === 0 ? `<path d="M${x} ${y} L${x + 160} ${y + 160} M${x + 160} ${y} L${x} ${y + 160}"/>` : k === 1 ? `<path d="M${x + 80} ${y} L${x + 160} ${y + 80} L${x + 80} ${y + 160} L${x} ${y + 80} Z"/>` : `<circle cx="${x + 80}" cy="${y + 80}" r="50"/><path d="M${x} ${y + 80} L${x + 30} ${y + 80} M${x + 130} ${y + 80} L${x + 160} ${y + 80}"/>`; return `<path d="M${x} ${y} L${x + 160} ${y} L${x + 160} ${y + 160} L${x} ${y + 160} Z"/>${inner}`; }).join('')).join('')}`, 5);

const hex = (cx: number, cy: number, r: number) => `<path d="M${range(6).map((i) => { const a = (Math.PI / 3) * i; return `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`; }).join(' L')} Z"/>`;
const honeycomb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600"><defs><clipPath id="c"><rect x="30" y="30" width="740" height="540"/></clipPath></defs><g fill="none" stroke="#1d1d1d" stroke-width="5" stroke-linejoin="round"><rect x="30" y="30" width="740" height="540"/><g clip-path="url(#c)">${range(11).map((c) => range(8).map((r) => hex(30 + c * 75, 30 + r * 86.6 + (c % 2) * 43.3, 50)).join('')).join('')}</g></g></svg>`;

const planets: [string, number, number][] = [['Mercury', 190, 10], ['Venus', 240, 16], ['Earth', 298, 17], ['Mars', 352, 13], ['Jupiter', 445, 48], ['Saturn', 575, 36], ['Uranus', 680, 24], ['Neptune', 752, 23]];
const solar = doc(`
<circle cx="-30" cy="300" r="160"/>${sunRays(-30, 300, 175, 200, 18)}
${planets.map(([n, x, r], i) => `<circle cx="${x}" cy="300" r="${r}"/>${text(x, i % 2 ? 300 - r - 18 : 300 + r + 34, n, 17)}`).join('')}
<ellipse cx="575" cy="300" rx="68" ry="15"/>
<path d="M410 285 Q445 278 480 285 M405 312 Q445 320 485 312"/>
<circle cx="322" cy="270" r="5"/>
${starShape(250, 80, 14)}${starShape(520, 120, 12)}${starShape(700, 70, 16)}${starShape(380, 520, 14)}${starShape(640, 500, 12)}${starShape(200, 520, 10)}
${text(470, 50, 'The Solar System', 30)}`, 4);

const plantParts = doc(`
${petals(400, 118, 6, 42, 20, 28)}
<circle cx="400" cy="118" r="26"/>
<path d="M394 160 L394 420 M406 160 L406 420"/>
<path d="M406 262 Q480 202 540 232 Q480 292 406 262 Z"/><path d="M394 322 Q320 262 260 292 Q320 352 394 322 Z"/>
<path d="M0 420 L800 420"/>
<path d="M400 420 Q380 480 338 540 M400 420 Q420 490 470 552 M400 420 L402 566 M386 470 Q352 482 326 468 M416 482 Q452 494 474 480"/>
<path d="M442 112 L560 100"/>${text(615, 108, 'Flower')}
<path d="M545 232 L600 232"/>${text(640, 240, 'Leaf')}
<path d="M392 210 L250 210"/>${text(205, 218, 'Stem')}
<path d="M472 548 L590 528"/>${text(630, 534, 'Root')}
${text(110, 470, 'Soil')}
<path d="M120 520 Q140 512 160 520 M600 470 Q620 462 640 470 M220 560 Q240 552 260 560"/>`, 5);

const magnetLoops = range(3).map((k0) => {
  const k = k0 + 1;
  const top = `<path d="M250 272 C${250 - 70 * k} ${272 - 95 * k} ${550 + 70 * k} ${272 - 95 * k} 550 272"/>`;
  const bot = `<path d="M250 328 C${250 - 70 * k} ${328 + 95 * k} ${550 + 70 * k} ${328 + 95 * k} 550 328"/>`;
  const ty = 272 - 0.75 * 95 * k, by = 328 + 0.75 * 95 * k;
  return `${top}${bot}<path d="M392 ${ty - 10} L408 ${ty} L392 ${ty + 10}"/><path d="M392 ${by - 10} L408 ${by} L392 ${by + 10}"/>`;
}).join('');
const magnet = doc(`
<path d="M250 262 L400 262 L400 338 L250 338 Z"/><path d="M400 262 L550 262 L550 338 L400 338 Z"/>
${text(325, 312, 'N', 40)}${text(475, 312, 'S', 40)}
${magnetLoops}
<path d="M250 300 L110 300 M550 300 L690 300"/>
<path d="M140 290 L160 300 L140 310 M660 290 L680 300 L660 310"/>
${text(400, 590, 'Magnetic field lines go from N to S', 24)}`, 5);

const circuit = doc(`
<path d="M110 250 L190 250 L190 372 L110 372 Z"/><path d="M135 234 L165 234 L165 250 L135 250 Z"/>
${text(150, 300, '+', 30)}${text(150, 352, '–', 30)}
<path d="M150 234 L150 150 L380 150"/>
<path d="M380 136 L420 136 L420 166 L380 166 Z"/>
<circle cx="400" cy="96" r="40"/>
<path d="M388 136 L388 120 L394 100 L400 118 L406 100 L412 120 L412 136"/>
<path d="M420 150 L650 150 L650 292"/>
<circle cx="650" cy="300" r="8"/><circle cx="650" cy="380" r="8"/><path d="M656 306 L702 366"/>
<path d="M650 388 L650 450 L150 450 L150 372"/>
${text(240, 318, 'Battery', 24, 'start')}${text(480, 90, 'Bulb', 24, 'start')}${text(715, 340, 'Switch', 24, 'start')}${text(400, 490, 'Wire', 24)}
${text(400, 570, 'Close the switch to light the bulb!', 24)}`, 5);

const waterCycle = doc(`
<circle cx="110" cy="100" r="48"/>${sunRays(110, 100, 62, 86)}
${cloud(560, 160, 1.6)}
${range(6).map((i) => `<path d="M${480 + i * 22} 195 L${468 + i * 22} 232"/>`).join('')}
<path d="M480 450 L605 260 L730 450"/><path d="M574 307 L605 260 L637 307 L620 322 L605 308 L590 322 Z"/>
<path d="M0 450 L800 450"/>
<path d="M20 485 Q50 470 80 485 Q110 500 140 485 M200 515 Q230 500 260 515 Q290 530 320 515 M60 560 Q90 545 120 560"/>
<path d="M200 430 Q170 330 232 250"/><path d="M216 262 L232 250 L238 270"/>
<path d="M300 430 Q270 330 332 250"/><path d="M316 262 L332 250 L338 270"/>
<path d="M270 160 Q360 96 440 112"/><path d="M424 100 L440 112 L422 122"/>
<path d="M640 446 Q560 520 420 505"/><path d="M436 495 L420 505 L438 516"/>
${text(160, 220, 'Evaporation', 22)}${text(340, 80, 'Condensation', 22)}${text(700, 190, 'Precipitation', 22)}${text(560, 570, 'Collection', 22)}`, 5);

export const PAGES: ColoringPage[] = [
  { id: 'cat', title: 'Happy cat', titleTe: 'పిల్లి', category: 'animals', level: 'easy', svg: cat },
  { id: 'fish', title: 'Little fish', titleTe: 'చేప', category: 'animals', level: 'easy', svg: fish },
  { id: 'turtle', title: 'Turtle', titleTe: 'తాబేలు', category: 'animals', level: 'easy', svg: turtle },
  { id: 'owl', title: 'Owl on a branch', titleTe: 'గుడ్లగూబ', category: 'animals', level: 'detailed', svg: owl },
  { id: 'butterfly', title: 'Butterfly', titleTe: 'సీతాకోకచిలుక', category: 'animals', level: 'detailed', svg: butterfly },
  { id: 'flower', title: 'Flower pot', titleTe: 'పూల కుండీ', category: 'nature', level: 'easy', svg: flower },
  { id: 'tree', title: 'Apple tree', titleTe: 'ఆపిల్ చెట్టు', category: 'nature', level: 'easy', svg: tree },
  { id: 'rainbow', title: 'Rainbow', titleTe: 'ఇంద్రధనుస్సు', category: 'nature', level: 'detailed', svg: rainbow },
  { id: 'mountains', title: 'Mountain lake', titleTe: 'కొండలు, సరస్సు', category: 'nature', level: 'detailed', svg: mountains },
  { id: 'car', title: 'Car', titleTe: 'కారు', category: 'vehicles', level: 'easy', svg: car },
  { id: 'sailboat', title: 'Sailboat', titleTe: 'పడవ', category: 'vehicles', level: 'easy', svg: sailboat },
  { id: 'rocket', title: 'Rocket', titleTe: 'రాకెట్', category: 'vehicles', level: 'easy', svg: rocket },
  { id: 'train', title: 'Steam train', titleTe: 'రైలు', category: 'vehicles', level: 'detailed', svg: train },
  { id: 'quilt', title: 'Quilt squares', titleTe: 'చతురస్రాల నమూనా', category: 'patterns', level: 'easy', svg: quilt },
  { id: 'mandala', title: 'Mandala', titleTe: 'మండలం', category: 'patterns', level: 'detailed', svg: mandala },
  { id: 'honeycomb', title: 'Honeycomb', titleTe: 'తేనెపట్టు', category: 'patterns', level: 'detailed', svg: honeycomb },
  { id: 'solar-system', title: 'Solar system', titleTe: 'సౌర కుటుంబం', category: 'science', level: 'detailed', svg: solar },
  { id: 'plant-parts', title: 'Parts of a plant', titleTe: 'మొక్క భాగాలు', category: 'science', level: 'easy', svg: plantParts },
  { id: 'magnet', title: 'Magnet field', titleTe: 'అయస్కాంత క్షేత్రం', category: 'science', level: 'detailed', svg: magnet },
  { id: 'circuit', title: 'Simple circuit', titleTe: 'సాధారణ విద్యుత్ వలయం', category: 'science', level: 'detailed', svg: circuit },
  { id: 'water-cycle', title: 'Water cycle', titleTe: 'నీటి చక్రం', category: 'science', level: 'detailed', svg: waterCycle },
];

export const pageById = (id: string) => PAGES.find((p) => p.id === id);
export const pageUrl = (p: ColoringPage) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(p.svg)}`;
