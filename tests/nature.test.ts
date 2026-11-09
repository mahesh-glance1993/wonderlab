import { describe, expect, it } from 'vitest';
import { AMBIENCES, NATURE, impulseResponse, renderNature, type NatureName } from '../src/lib/nature';

const SR = 16000;
const names = Object.keys(NATURE) as NatureName[];
const stats = (ch: Float32Array) => {
  let sum = 0, peak = 0, bad = 0;
  for (const v of ch) { if (!Number.isFinite(v)) bad++; sum += v * v; peak = Math.max(peak, Math.abs(v)); }
  return { rms: Math.sqrt(sum / ch.length), peak, bad };
};

describe('nature sounds', () => {
  for (const name of names) {
    it(`${name}: finite, audible, never clips, stereo`, () => {
      const [l, r] = renderNature(name, SR);
      const spec = NATURE[name];
      expect(l.length).toBe(r.length);
      expect(Math.abs(l.length / SR - spec.dur)).toBeLessThan(0.05);
      for (const ch of [l, r]) {
        const s = stats(ch);
        expect(s.bad).toBe(0);
        expect(s.peak).toBeLessThanOrEqual(0.98);
        expect(s.rms).toBeGreaterThan(0.01);
      }
      // left and right are not identical (a sense of space)
      let diff = 0;
      for (let i = 0; i < l.length; i += 7) diff += Math.abs(l[i] - r[i]);
      expect(diff).toBeGreaterThan(0);
    });
  }

  it('is deterministic for the same name and seed, different for another seed', () => {
    const a = renderNature('drizzle', SR), b = renderNature('drizzle', SR), c = renderNature('drizzle', SR, 9);
    expect(a[0].slice(0, 2000)).toEqual(b[0].slice(0, 2000));
    expect(a[0].slice(0, 2000)).not.toEqual(c[0].slice(0, 2000));
  });

  it('loops seamlessly: the wrap-around step is no bigger than ordinary sample steps', () => {
    for (const name of names.filter((n) => NATURE[n].loop)) {
      const [l] = renderNature(name, SR);
      let maxStep = 0;
      for (let i = 1; i < l.length; i++) maxStep = Math.max(maxStep, Math.abs(l[i] - l[i - 1]));
      expect(Math.abs(l[0] - l[l.length - 1]), name).toBeLessThanOrEqual(maxStep + 1e-6);
    }
  });

  it('every background bed is a looping sound', () => {
    for (const a of AMBIENCES) expect(NATURE[a].loop, a).toBe(true);
  });

  it('reverb impulse decays', () => {
    const [l] = impulseResponse(SR);
    const head = stats(l.slice(0, SR * 0.2)).rms, tail = stats(l.slice(-SR * 0.2)).rms;
    expect(head).toBeGreaterThan(tail * 20);
  });
});
