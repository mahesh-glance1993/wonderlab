// Telangana SCERT Class 6 units (board 'ts'). Each subject lives in its own file.
import type { USpec } from '../../lib/kit';
import { units as telugu } from './telugu';
import { units as hindi } from './hindi';
import { units as english } from './english';
import { units as maths } from './maths';
import { units as science } from './science';
import { units as social } from './social';

export const tsClass6: USpec[] = [...telugu, ...hindi, ...english, ...maths, ...science, ...social].map((u) => ({ ...u, board: 'ts' as const }));
