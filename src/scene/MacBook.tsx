import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getPart, parts } from '../data/parts';
import { type ExplorerState, visibleParts } from '../state/explorer';
import { Battery, BottomCover, Display, Fan, HeatSink, Hinge, IOBoard, Keyboard, LogicBoard, Processor, Speaker, TopCase, Trackpad } from './geometry';

type Vec3 = [number, number, number];
export const transforms: Record<string, { at: Vec3; spread: Vec3 }> = {
  "top-case": {
    "at": [
      0,
      0.2,
      0
    ],
    "spread": [
      0,
      3,
      -0.5
    ]
  },
  "bottom-cover": {
    "at": [
      0,
      0.0075,
      0
    ],
    "spread": [
      0,
      -1.2,
      0
    ]
  },
  "display": {
    "at": [
      0,
      0.26,
      -2.06
    ],
    "spread": [
      0,
      3,
      -1.5
    ]
  },
  "keyboard": {
    "at": [
      0,
      0.207,
      -0.72
    ],
    "spread": [
      0,
      2.3,
      0
    ]
  },
  "trackpad": {
    "at": [
      0,
      0.206,
      1.29
    ],
    "spread": [
      0,
      2.3,
      0.3
    ]
  },
  "logic-board": {
    "at": [
      0,
      0.08,
      -0.98
    ],
    "spread": [
      0,
      0.6,
      0
    ]
  },
  "processor": {
    "at": [
      0,
      0.14,
      -1.0
    ],
    "spread": [
      0,
      1.5,
      0
    ]
  },
  "left-fan": {
    "at": [
      -1.96,
      0.045,
      -0.98
    ],
    "spread": [
      -0.4,
      0.65,
      0.2
    ]
  },
  "right-fan": {
    "at": [
      1.96,
      0.045,
      -0.98
    ],
    "spread": [
      0.4,
      0.65,
      0.2
    ]
  },
  "heatsink": {
    "at": [
      0,
      0.12,
      -0.98
    ],
    "spread": [
      0,
      1.9,
      0
    ]
  },
  "left-speaker": {
    "at": [
      -2.84,
      0.085,
      1.02
    ],
    "spread": [
      -0.4,
      0.65,
      0.2
    ]
  },
  "right-speaker": {
    "at": [
      2.84,
      0.085,
      1.02
    ],
    "spread": [
      0.4,
      0.65,
      0.2
    ]
  },
  "battery-left": {
    "at": [
      -1.87,
      0.075,
      1.16
    ],
    "spread": [
      0,
      0.65,
      0.2
    ]
  },
  "battery-center": {
    "at": [
      0,
      0.075,
      1.16
    ],
    "spread": [
      0,
      0.65,
      0.2
    ]
  },
  "battery-right": {
    "at": [
      1.87,
      0.075,
      1.16
    ],
    "spread": [
      0,
      0.65,
      0.2
    ]
  },
  "left-io": {
    "at": [
      -2.96,
      0.07,
      -0.45
    ],
    "spread": [
      -0.4,
      0.65,
      0.2
    ]
  },
  "right-io": {
    "at": [
      2.96,
      0.07,
      -0.45
    ],
    "spread": [
      0.4,
      0.65,
      0.2
    ]
  },
  "magsafe": {
    "at": [
      -2.96,
      0.07,
      -1.57
    ],
    "spread": [
      0,
      0.65,
      0.2
    ]
  },
  "left-hinge": {
    "at": [
      -2.35,
      0.2,
      -2.065
    ],
    "spread": [
      -0.4,
      0.65,
      0.2
    ]
  },
  "right-hinge": {
    "at": [
      2.35,
      0.2,
      -2.065
    ],
    "spread": [
      0.4,
      0.65,
      0.2
    ]
  }
};

function Assembly({ id, explosion, selected, isolated, reducedMotion, onSelect, children }: {
  id: string; explosion: number; selected: boolean; isolated: boolean; reducedMotion: boolean; onSelect: (id: string) => void; children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const size = useThree(s => s.size);
  const inventory = explosion > .65 && !isolated;
  const tray = isolated ? 0 : THREE.MathUtils.smoothstep(explosion, .65, 1);
  const index = parts.findIndex(p => p.id === id);
  const columns = size.width < 550 ? 4 : 5;
  const rows = Math.ceil(20 / columns);
  const worldHeight = 10;
  const cellW = worldHeight * size.width / size.height / columns;
  const cellH = worldHeight / rows;
  const widths: Record<string, number> = {display:6.3, "top-case":6.3,"bottom-cover":6.3,keyboard:5.6,trackpad:2.7,"logic-board":6,heatsink:5.3,processor:1.2};
  const width = widths[id] || (id.includes("battery") ? 2.3 : id.includes("fan") ? 1.8 : id.includes("speaker") ? 1.9 : 1);
  const miniatureScale = Math.min(cellW * .78 / width, cellH * .53 / (id === "display" ? 4.3 : width * .7));
  const { at, spread } = transforms[id];
  useLayoutEffect(() => { invalidate(); }, [explosion, isolated, reducedMotion, invalidate]);
  useFrame((frame, dt) => {
    if (!group.current) return;
    const p = inventory ? [((index % columns) - (columns - 1) / 2) * cellW, ((rows - 1) / 2 - Math.floor(index / columns)) * cellH + .15, 0] : isolated ? [0, 0.5, 0] : at.map((v, i) => v + spread[i] * explosion);
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-12 * dt);
    const destination = new THREE.Vector3(...p);
    if (inventory) destination.lerpVectors(new THREE.Vector3(...at.map((v, i) => v + spread[i] * .65) as Vec3), destination, tray);
    group.current.position.lerp(destination, inventory ? 1 : alpha);
    group.current.scale.setScalar(1 + (miniatureScale - 1) * tray);
    group.current.rotation.set(id !== "display" ? 1.1 * tray : 0, -.12 * tray, 0);
    if (group.current.position.distanceTo(destination) > 0.001) frame.invalidate();
  });
  useLayoutEffect(() => {
    group.current?.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(mat => {
        if ('emissive' in mat) { (mat as THREE.MeshStandardMaterial).emissive.set(selected && !isolated ? '#e5753d' : '#000000'); (mat as THREE.MeshStandardMaterial).emissiveIntensity = selected && !isolated ? 0.075 : 0; }
      });
    });
    invalidate();
  }, [selected, isolated, invalidate]);
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); if (event.delta < 5) onSelect(id);
  };
  return <group ref={group} position={at} onClick={click}>
    <group position={inventory && id === "display" ? [0,-1.95 * tray,.7 * tray] : [0,0,0]}>{children}</group>
    {selected && !isolated && !inventory && <Html position={[0, 0.4, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: 'none' }}>
      <span className="part-pin"><i />{getPart(id)?.name}</span>
    </Html>}
  </group>;
}

export default function MacBook({ state, lid = 1.945, onSelect, reducedMotion }: {
  state: ExplorerState; lid?: number; onSelect: (id: string) => void; reducedMotion: boolean;
}) {
  const models = useMemo<Record<string, ReactNode>>(() => ({
    'top-case': <TopCase />, 'bottom-cover': <BottomCover />,
    keyboard: <Keyboard />, trackpad: <Trackpad />, 'logic-board': <LogicBoard />, processor: <Processor />,
    'left-fan': <Fan />, 'right-fan': <Fan flipped />, heatsink: <HeatSink />,
    'left-speaker': <Speaker />, 'right-speaker': <Speaker />,
    'battery-left': <Battery />, 'battery-center': <Battery center />, 'battery-right': <Battery />,
    'left-io': <IOBoard />, 'right-io': <IOBoard right />, magsafe: <IOBoard magsafe />,
    'left-hinge': <Hinge />, 'right-hinge': <Hinge />,
  }), []);
  return <group>{visibleParts(state).map(part => <Assembly key={part.id} id={part.id} explosion={state.explosion}
    selected={state.selectedId === part.id} isolated={state.isolatedId === part.id} reducedMotion={reducedMotion} onSelect={onSelect}>
    {part.id === 'display' ? <Display lid={lid} /> : models[part.id]}
  </Assembly>)}</group>;
}
