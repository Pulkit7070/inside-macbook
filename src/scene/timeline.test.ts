import { describe, expect, it } from 'vitest';
import { DEMO_DURATION, sampleTimeline } from './timeline';

describe('cinematic timeline', () => {
  it('starts closed and assembled, and ends with the circuit study fully separated', () => {
    expect(sampleTimeline(0).lid).toBeCloseTo(0.035);
    expect(sampleTimeline(0).explosion).toBe(0);
    expect(sampleTimeline(0).board).toBe(false);
    expect(DEMO_DURATION).toBe(24);
    const end = sampleTimeline(DEMO_DURATION);
    expect(end.lid).toBeCloseTo(1.945);
    expect(end.explosion).toBe(1);
    expect(end.selectedId).toBe('logic-board');
    expect(end.board).toBe(true);
    expect(end.boardProgress).toBe(1);
    expect(end.boardSelectedId).toBe('board-traces');
  });

  it('opens the assembly before touring both fans and entering the logic board', () => {
    expect(sampleTimeline(4).explosion).toBe(0);
    expect(sampleTimeline(6.5).explosion).toBeCloseTo(0.5);
    expect(sampleTimeline(9).explosion).toBe(1);
    expect(sampleTimeline(9.5).selectedId).toBe('left-fan');
    expect(sampleTimeline(10.5).selectedId).toBe('right-fan');
    expect(sampleTimeline(11.5).selectedId).toBe('logic-board');
    expect(sampleTimeline(11.99).board).toBe(false);
    expect(sampleTimeline(12).board).toBe(true);
    expect(sampleTimeline(12).boardProgress).toBe(0);
  });

  it('visits all eight circuit groups while continuously separating the board', () => {
    const groups = ['board-soc', 'board-memory', 'board-storage', 'board-power', 'board-thunderbolt', 'board-wireless', 'board-audio', 'board-traces'];
    groups.forEach((id, index) => expect(sampleTimeline(12 + index * 1.5).boardSelectedId).toBe(id));
    let previous = 0;
    for (let t = 12; t <= 24; t += 0.125) {
      const progress = sampleTimeline(t).boardProgress;
      expect(progress).toBeGreaterThanOrEqual(previous);
      expect(progress - previous).toBeLessThan(0.02);
      previous = progress;
    }
    expect(sampleTimeline(18).boardProgress).toBeCloseTo(0.5);
  });

  it('clamps out-of-range times and keeps transforms in range', () => {
    expect(sampleTimeline(-1)).toEqual(sampleTimeline(0));
    expect(sampleTimeline(25)).toEqual(sampleTimeline(24));
    for (let t = -1; t < DEMO_DURATION + 2; t += 0.125) {
      const frame = sampleTimeline(t);
      expect(frame.explosion).toBeGreaterThanOrEqual(0);
      expect(frame.explosion).toBeLessThanOrEqual(1);
      expect(frame.boardProgress).toBeGreaterThanOrEqual(0);
      expect(frame.boardProgress).toBeLessThanOrEqual(1);
      expect(frame.lid).toBeGreaterThanOrEqual(0.035);
      expect(frame.lid).toBeLessThanOrEqual(1.946);
    }
  });
});
