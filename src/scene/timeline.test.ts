import { describe, expect, it } from 'vitest';
import { DEMO_DURATION, sampleTimeline } from './timeline';

describe('cinematic timeline', () => {
  it('starts closed and assembled, and ends open and reassembled', () => {
    expect(sampleTimeline(0).lid).toBeCloseTo(0.035);
    expect(sampleTimeline(0).explosion).toBe(0);
    expect(sampleTimeline(DEMO_DURATION).lid).toBeCloseTo(1.945);
    expect(sampleTimeline(DEMO_DURATION).explosion).toBe(0);
  });
  it('holds the fully exploded assembly for the component tour', () => {
    expect(sampleTimeline(22).explosion).toBe(1);
    expect(sampleTimeline(30).explosion).toBe(1);
    expect(sampleTimeline(24).selectedId).toBe('left-fan');
    expect(sampleTimeline(29).selectedId).toBe('processor');
  });
  it('keeps explosion and lid in range throughout the animation', () => {
    for (let t = -1; t < 47; t += 0.125) {
      const frame = sampleTimeline(t);
      expect(frame.explosion).toBeGreaterThanOrEqual(0);
      expect(frame.explosion).toBeLessThanOrEqual(1);
      expect(frame.lid).toBeGreaterThanOrEqual(0.035);
      expect(frame.lid).toBeLessThanOrEqual(1.946);
    }
  });
});
