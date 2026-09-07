export const DEMO_DURATION = 24;
const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
export function sampleTimeline(seconds: number) {
 const t = Math.max(0, Math.min(DEMO_DURATION, seconds));
 return {lid: .035 + smooth((t-1)/3)*1.91, explosion: smooth((t-5)/6), angle: .62 + Math.sin(t/24*Math.PI)*.18,
 selectedId: t>=13 && t<16 ? 'left-fan' : t>=16 && t<19 ? 'right-fan' : t>=19 && t<22 ? 'processor' : null,
 caption: t<4 ? 'MacBook Pro. M5 Pro. 2026.' : t<8 ? 'Look beneath the surface.' : t<12 ? 'Every piece, in its place.' : t<16 ? 'Left fan. Rear-facing exhaust.' : t<19 ? 'Right fan. Mirrored, precisely.' : t<22 ? 'Meet the M5 Pro.' : '20 pieces. Ready to explore.'};
}
