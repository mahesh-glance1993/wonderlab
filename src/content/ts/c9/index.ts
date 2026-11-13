// Telangana SCERT Class 9 units (board 'ts'). Each subject lives in its own file.
import type { USpec } from '../../lib/kit';
import { units as telugu } from './telugu';
import { units as hindi } from './hindi';
import { units as english } from './english';
import { units as maths } from './maths';
import { units as physical } from './physical';
import { units as biological } from './biological';
import { units as social } from './social';

export const tsClass9: USpec[] = [...telugu, ...hindi, ...english, ...maths, ...physical, ...biological, ...social].map((u) => ({ ...u, board: 'ts' as const }));
