// Downloadable offline packs. At build time a Vite plugin resolves each pack's module patterns
// to the real output files and their sizes (dist/packs.json); the service worker caches them.
import type { ClassLevel } from './levels';

export type PackKind = 'lessons' | 'games' | 'lab' | 'art' | 'tracing' | 'coloring' | 'narration';
export interface PackDef {
  id: string;
  kind: PackKind;
  title: string;
  titleTe?: string;
  classLevels: ClassLevel[];
  /** substrings of source module paths whose output chunks belong to this pack */
  modules: string[];
  /** extra static files (relative to site root) */
  files?: string[];
}

const LESSON_KEYS = ['nursery', 'lkg', 'ukg', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];
const LESSON_TITLES = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const PACKS: PackDef[] = [
  ...LESSON_KEYS.map((k, i): PackDef => ({
    id: `lessons-${k}`,
    kind: 'lessons',
    title: `${LESSON_TITLES[i]} lessons`,
    classLevels: [i as ClassLevel],
    modules: [`/src/content/classes/${k}.`, '/src/content/lib/', '/src/content/index', '/src/features/lesson/'],
  })),
  { id: 'play-learn', kind: 'games', title: 'Play & Learn (pictures, stories, shapes)', titleTe: 'ఆడుతూ నేర్చుకో', classLevels: [0, 1, 2], modules: ['/src/features/early/'] },
  { id: 'lang-telugu-english', kind: 'lessons', title: 'Telugu & English courses', titleTe: 'తెలుగు & ఇంగ్లీష్', classLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], modules: ['/src/features/language/'] },
  { id: 'games', kind: 'games', title: 'Games & puzzles', titleTe: 'ఆటలు & పజిల్స్', classLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], modules: ['/src/features/games/'] },
  { id: 'physics-lab', kind: 'lab', title: 'Physics Lab', classLevels: [5, 6, 7, 8, 9, 10, 11, 12], modules: ['/src/features/lab/'] },
  { id: 'art-studio', kind: 'art', title: 'Art Studio', titleTe: 'ఆర్ట్ స్టూడియో', classLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], modules: ['/src/features/art/'] },
  { id: 'tracing-sheets', kind: 'tracing', title: 'Tracing sheets', titleTe: 'ట్రేసింగ్ షీట్లు', classLevels: [0, 1, 2, 3, 4, 5], modules: ['/src/features/art/tracing'] },
  { id: 'coloring-pack', kind: 'coloring', title: 'Colouring pages', titleTe: 'రంగుల పేజీలు', classLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], modules: ['/src/features/art/coloring'] },
  { id: 'narration-te', kind: 'narration', title: 'Telugu narration', titleTe: 'తెలుగు వివరణ', classLevels: [0, 1, 2, 3, 4, 5], modules: ['/src/i18n/te'], files: ['audio/te/manifest.json'] },
];
