// Telangana SCERT Class 10 units (board 'ts'). Each subject lives in its own file.
import type { USpec } from '../../lib/kit';
import { units as maths } from './maths';
import { units as physical } from './physical';
import { units as biological } from './biological';
import { units as social } from './social';
import { units as english } from './english';

export const tsClass10: USpec[] = [...maths, ...physical, ...biological, ...social, ...english].map((u) => ({ ...u, board: 'ts' as const }));
