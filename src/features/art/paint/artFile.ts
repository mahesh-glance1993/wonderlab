// Off-screen rendering of a saved artwork (gallery export & print).
import { deserialize } from '../engine/project';
import { LayerStack } from '../engine/render';
import { resolveTemplate } from '../coloring/template';
import { loadArtwork } from '../storage';

export async function renderArtwork(pid: string, id: string): Promise<{ title: string; canvas: HTMLCanvasElement } | null> {
  const a = await loadArtwork(pid, id);
  if (!a) return null;
  const p = deserialize(a.data);
  const st = new LayerStack(p, resolveTemplate);
  await st.renderAll();
  return { title: a.title, canvas: st.flatten(true) };
}

export const safeName = (t: string) => (t || 'picture').replace(/[^\w\- ]+/g, '').trim() || 'picture';

export function downloadCanvas(c: HTMLCanvasElement, title: string) {
  c.toBlob((b) => {
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = `${safeName(title)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}
