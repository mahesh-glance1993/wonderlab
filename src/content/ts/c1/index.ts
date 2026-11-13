// Telangana SCERT Class 1 units (board 'ts'). Each subject lives in its own file.
import type { USpec } from '../../lib/kit';
import { units as telugu } from './telugu';
import { units as english } from './english';
import { units as maths } from './maths';

export const tsClass1: USpec[] = [...telugu, ...english, ...maths].map((u) => ({ ...u, board: 'ts' as const }));
