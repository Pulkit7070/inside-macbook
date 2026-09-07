export const DEMO_DURATION = 24;
const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
export function sampleTimeline(seconds: number) {
 const t = Math.max(0, Math.min(DEMO_DURATION, seconds));
 const boardIds = ['board-soc','board-memory','board-storage','board-power','board-thunderbolt','board-wireless','board-audio','board-traces'];
 const index = Math.min(7, Math.max(0, Math.floor((t-12)/1.5)));
 return {lid: .035 + smooth((t-1)/2.5)*1.91, explosion: smooth((t-4)/5), angle: .62 + Math.sin(t/24*Math.PI)*.18,
 selectedId: t>=9 && t<10 ? 'left-fan' : t>=10 && t<11 ? 'right-fan' : t>=11 ? 'logic-board' : null,
 board: t>=12, boardProgress:smooth((t-12)/12), boardSelectedId:boardIds[index],
 caption: t<3 ? 'MacBook Pro. M5 Pro. 2026.' : t<6 ? 'Beneath the aluminum.' : t<9 ? '20 assemblies. One system.' : t<10 ? 'Left fan. Rear-facing exhaust.' : t<11 ? 'Right fan. Mirrored airflow.' : t<12 ? 'Now, one level deeper.' : ['The M5 Pro computing package.','Unified memory. Shared across the chip.','NAND storage. Your data, retained.','Power delivery. Every rail, regulated.','Thunderbolt. Data, display and power.','N1. Wireless connectivity.','Audio. From signal to sound.','Copper traces. Connecting everything.'][index]};
}
