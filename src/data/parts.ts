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
}

// A simplified educational assembly, not a service or disassembly guide.
export const parts: Part[] = [
  { id: 'top-case', name: 'Top case', system: 'enclosure', description: 'The main structural shell.', detail: 'Supports the keyboard, trackpad, and internal assembly while forming the palm rest.', material: 'Aluminum' },
  { id: 'bottom-cover', name: 'Bottom cover', system: 'enclosure', description: 'Closes the underside of the notebook.', detail: 'Protects the internal components and completes the enclosure.', material: 'Aluminum' },
  { id: 'display', name: 'Display', system: 'display', description: 'The screen and its lid assembly.', detail: 'Combines the display panel, backlight, protective layers, and lid into one simplified component.', material: 'Glass, display layers, and aluminum' },
  { id: 'keyboard', name: 'Keyboard', system: 'enclosure', description: 'Turns key presses into input.', detail: 'A matrix of keys and switches sends typing commands to the computer.', material: 'Plastic keycaps and electronic assembly' },
  { id: 'trackpad', name: 'Trackpad', system: 'enclosure', description: 'A touch surface for pointing and gestures.', detail: 'Detects finger movement and pressure, with haptic feedback for clicks.', material: 'Glass and electronic assembly' },
  { id: 'logic-board', name: 'Logic board', system: 'computing', description: 'Connects the notebook’s electronics.', detail: 'Carries the main computing components and routes power and signals throughout the notebook.', material: 'Printed circuit board, copper, and electronic components' },
  { id: 'processor', name: 'Processor', system: 'computing', description: 'The central computing package.', detail: 'Apple silicon brings processing functions together in a compact package. Shown separately here to explain its role.', material: 'Silicon and semiconductor packaging' },
  { id: 'left-fan', name: 'Left fan', system: 'cooling', description: 'Moves air through the cooling assembly.', detail: 'Works with the other fan to carry heat out of the enclosure.', material: 'Polymer impeller, metal housing, and motor' },
  { id: 'right-fan', name: 'Right fan', system: 'cooling', description: 'Moves air through the cooling assembly.', detail: 'Works with the other fan to carry heat out of the enclosure.', material: 'Polymer impeller, metal housing, and motor' },
  { id: 'heatsink', name: 'Heatsink', system: 'cooling', description: 'Transfers heat toward the airflow.', detail: 'Conducts heat away from the computing components so moving air can remove it.', material: 'Thermally conductive metal' },
  { id: 'left-speaker', name: 'Left speaker', system: 'enclosure', description: 'Produces the left side of the sound.', detail: 'Represents the left speaker assembly, which converts electrical signals into sound.', material: 'Acoustic enclosure, magnets, and diaphragms' },
  { id: 'right-speaker', name: 'Right speaker', system: 'enclosure', description: 'Produces the right side of the sound.', detail: 'Represents the right speaker assembly, which converts electrical signals into sound.', material: 'Acoustic enclosure, magnets, and diaphragms' },
  { id: 'battery-left', name: 'Left battery group', system: 'power', description: 'Stores energy for portable use.', detail: 'One of three simplified groups representing the notebook’s battery assembly.', material: 'Lithium-ion polymer cells' },
  { id: 'battery-center', name: 'Center battery group', system: 'power', description: 'Stores energy for portable use.', detail: 'One of three simplified groups representing the notebook’s battery assembly.', material: 'Lithium-ion polymer cells' },
  { id: 'battery-right', name: 'Right battery group', system: 'power', description: 'Stores energy for portable use.', detail: 'One of three simplified groups representing the notebook’s battery assembly.', material: 'Lithium-ion polymer cells' },
  { id: 'left-io', name: 'Left I/O', system: 'computing', description: 'Connects external devices on the left.', detail: 'A simplified grouping of the left-side data and peripheral connections.', material: 'Metal connectors and electronic components' },
  { id: 'right-io', name: 'Right I/O', system: 'computing', description: 'Connects external devices on the right.', detail: 'A simplified grouping of the right-side data and peripheral connections.', material: 'Metal connectors and electronic components' },
  { id: 'magsafe', name: 'MagSafe', system: 'power', description: 'A magnetic connection for charging.', detail: 'Connects an external power cable to the notebook’s charging system.', material: 'Metal contacts, magnets, and insulating materials' },
  { id: 'left-hinge', name: 'Left hinge', system: 'enclosure', description: 'Connects the display lid to the base.', detail: 'Works with the right hinge to support the lid as it opens and closes.', material: 'Metal' },
  { id: 'right-hinge', name: 'Right hinge', system: 'enclosure', description: 'Connects the display lid to the base.', detail: 'Works with the left hinge to support the lid as it opens and closes.', material: 'Metal' },
]

export function getPart(id: string): Part | undefined {
  return parts.find((part) => part.id === id)
}
