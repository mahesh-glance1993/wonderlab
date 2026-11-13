// Telangana SCERT Class 4 units (board 'ts'). Each subject lives in its own file.
import type { USpec } from '../../lib/kit';
import { units as telugu } from './telugu';
import { units as english } from './english';
import { units as maths } from './maths';
import { units as evs } from './evs';

export const tsClass4: USpec[] = [...telugu, ...english, ...maths, ...evs].map((u) => ({ ...u, board: 'ts' as const }));
