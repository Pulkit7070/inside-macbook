export const DEMO_DURATION = 45;
const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };

export function sampleTimeline(seconds: number) {
  const t = Math.max(0, Math.min(DEMO_DURATION, seconds));
  const opening = smooth((t - 3) / 5);
  const explosion = t < 35 ? smooth((t - 10) / 9) : 1 - smooth((t - 35) / 6);
  return {
    lid: 0.035 + opening * 1.91,
    explosion,
    angle: 0.62 + Math.sin(t / DEMO_DURATION * Math.PI * 2) * 0.25,
    selectedId: t >= 22 && t < 27 ? 'left-fan' : t >= 27 && t < 32 ? 'processor' : null,
    caption: t < 5 ? 'A familiar silhouette.' : t < 10 ? 'A different perspective.' : t < 20 ? 'Every layer has a purpose.' : t < 27 ? 'Designed to keep its cool.' : t < 35 ? 'An entire system. On a chip.' : t < 41 ? 'Everything, working together.' : 'Inside a MacBook.',
  };
}
