// Renders nature sounds off the main thread so animations never stutter.
import { renderNature, type NatureName } from './nature';

self.onmessage = (e: MessageEvent<{ name: NatureName; sr: number }>) => {
  const { name, sr } = e.data;
  try {
    const [l, r] = renderNature(name, sr);
    (self as unknown as Worker).postMessage({ name, l, r }, [l.buffer, r.buffer]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ name, error: String(err) });
  }
};
