export const MODEL = { name: 'MacBook Pro', size: '14-inch', year: 2026, chip: 'M5 Pro' } as const

export type SystemId = 'enclosure' | 'power' | 'cooling' | 'computing' | 'display'

export const systems: { id: SystemId; label: string; color: string; description: string }[] = [
  { id: 'enclosure', label: 'Enclosure', color: '#c8ccd2', description: 'The structure, controls, and acoustic components you interact with.' },
  { id: 'power', label: 'Power', color: '#e7bc73', description: 'Stores energy and connects the notebook to external power.' },
  { id: 'cooling', label: 'Cooling', color: '#91c5d3', description: 'Moves heat away from the computing components.' },
  { id: 'computing', label: 'Computing', color: '#a8ba9a', description: 'Processes information and connects the internal components.' },
  { id: 'display', label: 'Display', color: '#b4a5d4', description: 'Turns the computer’s output into a visible image.' },
]

export interface Part {
  id: string
  name: string
  system: SystemId
  description: string
  detail: string
  material: string
  location: string
}

// Original, simplified educational geometry based on the 2026 14-inch M5 Pro model.
// Left/right always mean the seated user facing the keyboard; rear means the display hinges.
// Apple underside service photographs reverse viewer left/right relative to this perspective.
// Exploded groups illustrate function, not a service or disassembly sequence.
export const parts: Part[] = [
  { id: 'top-case', name: 'Top case', system: 'enclosure', description: 'The main structural shell.', detail: 'Supports the keyboard, trackpad, and internal assembly. Shown in Silver; the 2026 model also comes in Space Black. The whole closed notebook measures 31.26 × 22.12 × 1.55 cm.', material: 'Aluminum', location: 'Main base, surrounding the keyboard and palm rest.' },
  { id: 'bottom-cover', name: 'Bottom cover', system: 'enclosure', description: 'Closes the underside of the notebook.', detail: 'Protects the internal components and completes the enclosure.', material: 'Aluminum', location: 'Underside of the base.' },
  { id: 'display', name: 'Display', system: 'display', description: 'The screen and its lid assembly.', detail: 'Combines the display panel, backlight, protective layers, and lid into one simplified component.', material: 'Glass, display layers, and aluminum', location: 'Above the rear hinge edge when open.' },
  { id: 'keyboard', name: 'Keyboard', system: 'enclosure', description: 'Turns key presses into input.', detail: 'The recessed black keyboard has a full-height function row and Touch ID. Keys and switches send typing commands to the computer.', material: 'Plastic keycaps and electronic assembly', location: 'Recessed black area behind the trackpad.' },
  { id: 'trackpad', name: 'Trackpad', system: 'enclosure', description: 'A touch surface for pointing and gestures.', detail: 'Detects finger movement and pressure, with haptic feedback for clicks.', material: 'Glass and electronic assembly', location: 'Front center, between the palm rests.' },
  { id: 'logic-board', name: 'Logic board', system: 'computing', description: 'Connects the notebook’s electronics.', detail: 'Carries the main computing components and routes power and signals throughout the notebook.', material: 'Printed circuit board, copper, and electronic components', location: 'Rear interior, with its center between the two fans.' },
  { id: 'processor', name: 'M5 Pro', system: 'computing', description: 'The central computing package.', detail: 'The M5 Pro combines CPU, GPU, and other computing functions. This soldered package is shown separately for explanation; it is not a removable module.', material: 'Silicon and semiconductor packaging', location: 'On the rear-center logic board, beneath the heatsink.' },
  { id: 'left-fan', name: 'Left fan', system: 'cooling', description: 'Moves air through the cooling assembly.', detail: 'Works with the other fan to carry heat out of the enclosure.', material: 'Polymer impeller, metal housing, and motor', location: 'Rear left, beside the logic board center.' },
  { id: 'right-fan', name: 'Right fan', system: 'cooling', description: 'Moves air through the cooling assembly.', detail: 'Works with the other fan to carry heat out of the enclosure.', material: 'Polymer impeller, metal housing, and motor', location: 'Rear right, beside the logic board center.' },
  { id: 'heatsink', name: 'Heatsink', system: 'cooling', description: 'Transfers heat toward the airflow.', detail: 'Conducts heat away from the computing components so moving air can remove it.', material: 'Thermally conductive metal', location: 'Across the rear logic board, linking the chip to the fan airflow.' },
  { id: 'left-speaker', name: 'Left speaker', system: 'enclosure', description: 'Produces the left side of the sound.', detail: 'Represents the left acoustic assembly within the six-speaker sound system, converting electrical signals into sound.', material: 'Acoustic enclosure, magnets, and diaphragms', location: 'Along the left interior side, outside the battery.' },
  { id: 'right-speaker', name: 'Right speaker', system: 'enclosure', description: 'Produces the right side of the sound.', detail: 'Represents the right acoustic assembly within the six-speaker sound system, converting electrical signals into sound.', material: 'Acoustic enclosure, magnets, and diaphragms', location: 'Along the right interior side, outside the battery.' },
  { id: 'battery-left', name: 'Left battery group', system: 'power', description: 'Stores energy for portable use.', detail: 'One of three illustrated groups representing a single six-cell battery assembly. The complete battery stores 72.4 Wh; this is not a separate battery pack.', material: 'Lithium-ion polymer cells', location: 'Front-left interior, below the keyboard and palm rest.' },
  { id: 'battery-center', name: 'Center battery group', system: 'power', description: 'Stores energy for portable use.', detail: 'One of three illustrated groups representing a single six-cell battery assembly. The complete battery stores 72.4 Wh; this is not a separate battery pack.', material: 'Lithium-ion polymer cells', location: 'Front-center interior, above the trackpad assembly.' },
  { id: 'battery-right', name: 'Right battery group', system: 'power', description: 'Stores energy for portable use.', detail: 'One of three illustrated groups representing a single six-cell battery assembly. The complete battery stores 72.4 Wh; this is not a separate battery pack.', material: 'Lithium-ion polymer cells', location: 'Front-right interior, below the keyboard and palm rest.' },
  { id: 'left-io', name: 'Left I/O', system: 'computing', description: 'Connects external devices on the left.', detail: 'Represents the two left-side Thunderbolt 5 USB-C ports. Nearby MagSafe and the headphone connection are separate hardware; this educational grouping simplifies the boards.', material: 'Metal connectors and electronic components', location: 'Left edge, between MagSafe and the headphone connection.' },
  { id: 'right-io', name: 'Right I/O', system: 'computing', description: 'Connects external devices on the right.', detail: 'Groups one Thunderbolt 5 USB-C port, HDMI, and SDXC for explanation. HDMI and SDXC belong to the logic board, not one removable right-side I/O board.', material: 'Metal connectors and electronic components', location: 'Right edge: Thunderbolt, HDMI, and SDXC connections.' },
  { id: 'magsafe', name: 'MagSafe', system: 'power', description: 'A magnetic connection for charging.', detail: 'Connects an external power cable to the notebook’s charging system.', material: 'Metal contacts, magnets, and insulating materials', location: 'Left edge near the rear display hinge.' },
  { id: 'left-hinge', name: 'Left hinge', system: 'enclosure', description: 'Connects the display lid to the base.', detail: 'Works with the right hinge to support the lid as it opens and closes.', material: 'Metal', location: 'Rear-left corner, joining the lid and base.' },
  { id: 'right-hinge', name: 'Right hinge', system: 'enclosure', description: 'Connects the display lid to the base.', detail: 'Works with the left hinge to support the lid as it opens and closes.', material: 'Metal', location: 'Rear-right corner, joining the lid and base.' },
]

export function getPart(id: string): Part | undefined {
  return parts.find((part) => part.id === id)
}
