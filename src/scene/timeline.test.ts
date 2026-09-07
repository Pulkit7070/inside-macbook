import { describe, expect, it } from 'vitest';
import { DEMO_DURATION, sampleTimeline } from './timeline';

describe('cinematic timeline', () => {
  it('starts closed and assembled, and ends open with all parts presented', () => {
    expect(sampleTimeline(0).lid).toBeCloseTo(0.035);
    expect(sampleTimeline(0).explosion).toBe(0);
    expect(sampleTimeline(DEMO_DURATION).lid).toBeCloseTo(1.945);
    expect(DEMO_DURATION).toBe(24);
    expect(sampleTimeline(DEMO_DURATION).explosion).toBe(1);
    expect(sampleTimeline(DEMO_DURATION).selectedId).toBeNull();
  });
  it('holds the fully exploded assembly for the component tour', () => {
    for (const time of [14, 17, 20, 24]) expect(sampleTimeline(time).explosion).toBe(1);
    expect(sampleTimeline(14).selectedId).toBe('left-fan');
    expect(sampleTimeline(17).selectedId).toBe('right-fan');
    expect(sampleTimeline(20).selectedId).toBe('processor');
  });
  it('keeps explosion and lid in range throughout the animation', () => {
    for (let t = -1; t < DEMO_DURATION + 2; t += 0.125) {
      const frame = sampleTimeline(t);
      expect(frame.explosion).toBeGreaterThanOrEqual(0);
      expect(frame.explosion).toBeLessThanOrEqual(1);
      expect(frame.lid).toBeGreaterThanOrEqual(0.035);
      expect(frame.lid).toBeLessThanOrEqual(1.946);
    }
  });
});
