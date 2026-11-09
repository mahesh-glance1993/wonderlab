// Resolves template references (colouring pages) to images for the locked outline layer.
import { loadImage, type TemplateResolver } from '../engine/render';
import { pageById, pageUrl } from './pages';

export const resolveTemplate: TemplateResolver = async (ref) => {
  if (ref.kind !== 'coloring') return null;
  const p = pageById(ref.id);
  return p ? loadImage(pageUrl(p)) : null;
};
