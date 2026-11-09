import { describe, expect, it } from 'vitest';
import { wheelColor, wheelPos } from '../src/features/art/paint/ColorWheel';

describe('colour wheel', () => {
  it('centre is white-ish (no strength), edge is full strength', () => {
    expect(wheelColor(0, 0, 100, 1)![1]).toBe(0);
    expect(wheelColor(100, 0, 100, 1)![1]).toBeCloseTo(1);
  });
  it('angle maps to hue all the way round', () => {
    expect(wheelColor(50, 0, 100, 1)![0]).toBeCloseTo(0);
    expect(wheelColor(0, 50, 100, 1)![0]).toBeCloseTo(90);
    expect(wheelColor(-50, 0, 100, 1)![0]).toBeCloseTo(180);
    expect(wheelColor(0, -50, 100, 1)![0]).toBeCloseTo(270);
  });
  it('ignores taps outside the circle', () => { expect(wheelColor(90, 90, 100, 1)).toBeNull(); });
  it('position and colour are inverses for every hue/strength', () => {
    for (let h = 0; h < 360; h += 17) for (const s of [0.2, 0.6, 1]) {
      const [x, y] = wheelPos(h, s, 120);
      const c = wheelColor(x, y, 120, 0.7)!;
      expect(c[0]).toBeCloseTo(h, 5); expect(c[1]).toBeCloseTo(s, 5); expect(c[2]).toBe(0.7);
    }
  });
});
