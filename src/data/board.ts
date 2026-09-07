/** Functional teaching model, not a reverse-engineered board schematic. */
export interface BoardPart {
  id: string;
  name: string;
  shortName: string;
  description: string;
  location: string;
  detail: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number];
  spread: [number, number, number];
  source: string;
}

export const BOARD_DISCLAIMER = 'Illustrative circuit layout. Groups, package shapes, positions and separation are educational; they do not establish chip counts, exact routing or repairability. Memory is separated conceptually from the processor package.';
export const BOARD_SOURCES = [
  { title: 'Apple · 2026 technical specifications', url: 'https://support.apple.com/en-us/126318' },
  { title: 'Apple · Logic board repair reference', url: 'https://support.apple.com/en-us/125802' },
  { title: 'Apple · M5 Pro and M5 Max introduction', url: 'https://www.apple.com/newsroom/2026/03/apple-introduces-macbook-pro-with-all-new-m5-pro-and-m5-max/' },
];

const specs = BOARD_SOURCES[0].url;
const repair = BOARD_SOURCES[1].url;
export const boardParts: BoardPart[] = [
  { id: 'board-soc', name: 'M5 Pro system on a chip', shortName: 'M5 PRO', description: 'CPU, GPU, Neural Engine and media processing share one integrated system.', location: 'Central processor region', detail: 'M5 Pro supports up to 18 CPU cores and 20 GPU cores. The marked surface is a conceptual package, not a die photograph.', color: '#e3b987', position: [-.5,.18,0], size: [1.5,.14,1.45], spread: [-.4,1.4,-.1], source: specs },
  { id: 'board-memory', name: 'Unified memory', shortName: 'MEMORY', description: 'A shared working memory pool serves the processor and graphics.', location: 'Processor package region · conceptually separated', detail: 'M5 Pro offers 307 GB/s memory bandwidth and configurations up to 64GB. The visual blocks do not indicate package count.', color: '#a8c7d4', position: [.85,.15,0], size: [.75,.11,1.4], spread: [1.25,1.1,.1], source: specs },
  { id: 'board-storage', name: 'NAND flash storage', shortName: 'STORAGE', description: 'Nonvolatile flash retains applications, documents and the operating system after shutdown.', location: 'Illustrative storage region', detail: 'This model supports SSD configurations up to 4TB with M5 Pro. NAND package arrangement and capacity per package are not asserted.', color: '#b8b79e', position: [-2.75,.13,-1.36], size: [1.25,.12,.42], spread: [-1.25,.85,-1.1], source: specs },
  { id: 'board-power', name: 'Power management', shortName: 'POWER', description: 'Regulation circuitry supplies the different voltages required by logic and memory.', location: 'Illustrative regulator region', detail: 'Small controllers, inductors and capacitors represent a functional power stage. Apple’s repair guide does not identify these individual packages.', color: '#caad72', position: [-2.75,.13,1.36], size: [1.4,.12,.42], spread: [-1.2,.65,1.1], source: repair },
  { id: 'board-thunderbolt', name: 'Thunderbolt / USB interface', shortName: 'I/O', description: 'High-speed interface circuitry connects the system to external devices.', location: 'Illustrative port interface region', detail: 'The computer has three Thunderbolt 5 ports. This group represents interface functions, not a verified discrete controller or controller count.', color: '#9fb6c5', position: [2.85,.13,-1.36], size: [1.1,.12,.42], spread: [1.4,.7,-1.05], source: specs },
  { id: 'board-wireless', name: 'Apple N1 wireless', shortName: 'N1', description: 'Apple’s wireless networking chip supports Wi-Fi 7, Bluetooth 6 and Thread.', location: 'Illustrative radio region', detail: 'N1 is confirmed in Apple’s 2026 specifications. Its position and package appearance here are illustrative.', color: '#a7bd9d', position: [2.9,.13,1.36], size: [1.1,.12,.42], spread: [1.35,1,1], source: specs },
  { id: 'board-audio', name: 'Audio conversion & amplification', shortName: 'AUDIO', description: 'Audio electronics convert digital sound into analog signals and drive outputs.', location: 'Illustrative audio signal path', detail: 'The computer includes a separate audio board connection. This is a system-level function group, not a verified DAC package on this logic board.', color: '#c9aebd', position: [-.5,.13,1.32], size: [1.2,.12,.42], spread: [.15,.5,1.7], source: repair },
  { id: 'board-traces', name: 'PCB interconnects', shortName: 'TRACES', description: 'Conductive paths connect components across the printed circuit board.', location: 'Across the board · illustrative exposed layer', detail: 'The separated copper paths explain connectivity. They are not actual signal routing, layer count or manufacturing geometry.', color: '#c5a36b', position: [.55,.08,-1.32], size: [1.3,.025,.42], spread: [-.4,.4,-1.65], source: repair },
];
