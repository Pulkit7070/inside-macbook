import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getPart } from '../data/parts';
import { type ExplorerState, visibleParts } from '../state/explorer';
import { Battery, BottomCover, Display, Fan, HeatSink, Hinge, IOBoard, Keyboard, LogicBoard, Processor, Speaker, TopCase, Trackpad } from './geometry';

type Vec3 = [number, number, number];
export const transforms: Record<string, { at: Vec3; spread: Vec3 }> = {
  'top-case': { at: [0, 0.12, 0], spread: [-0.35, 2.05, -1.5] },
  'bottom-cover': { at: [0, -0.18, 0], spread: [0, -0.85, 0] },
  display: { at: [0, 0.26, -2.06], spread: [0, 2.3, -2.8] },
  keyboard: { at: [0, 0.25, -0.58], spread: [-0.35, 2.65, -1.5] },
  trackpad: { at: [0, 0.25, 1.19], spread: [-0.35, 2.65, -1.2] },
  'logic-board': { at: [0, -0.02, -1.1], spread: [0, 0.65, 1.65] },
  processor: { at: [0, 0.065, -1.1], spread: [0, 1.35, 1.65] },
  'left-fan': { at: [-2.04, -0.01, -1.17], spread: [-0.7, 0.58, 1.55] },
  'right-fan': { at: [2.04, -0.01, -1.17], spread: [0.7, 0.58, 1.55] },
  heatsink: { at: [0, 0.14, -1.76], spread: [0, 1.2, 1.4] },
  'left-speaker': { at: [-2.78, -0.01, 0.72], spread: [-0.56, 0.42, 0.22] },
  'right-speaker': { at: [2.78, -0.01, 0.72], spread: [0.56, 0.42, 0.22] },
  'battery-left': { at: [-1.68, -0.025, 0.93], spread: [-0.12, 0.32, 1.65] },
  'battery-center': { at: [0, -0.025, 0.93], spread: [0, 0.32, 1.65] },
  'battery-right': { at: [1.68, -0.025, 0.93], spread: [0.12, 0.32, 1.65] },
  'left-io': { at: [-3.02, -0.005, -0.42], spread: [-0.9, 0.72, 0] },
  'right-io': { at: [3.02, -0.005, -0.42], spread: [0.9, 0.72, 0] },
  magsafe: { at: [-3.02, -0.005, -1.57], spread: [-0.95, 0.82, -0.15] },
  'left-hinge': { at: [-2.33, 0.14, -2.04], spread: [-0.2, 1.24, -0.7] },
  'right-hinge': { at: [2.33, 0.14, -2.04], spread: [0.2, 1.24, -0.7] },
};

function Assembly({ id, explosion, selected, isolated, reducedMotion, onSelect, children }: {
  id: string; explosion: number; selected: boolean; isolated: boolean; reducedMotion: boolean; onSelect: (id: string) => void; children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const { at, spread } = transforms[id];
  useLayoutEffect(() => { invalidate(); }, [explosion, isolated, reducedMotion, invalidate]);
  useFrame((frame, dt) => {
    if (!group.current) return;
    const p = isolated ? [0, 0.5, 0] : at.map((v, i) => v + spread[i] * explosion);
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-12 * dt);
    const destination = new THREE.Vector3(...p);
    group.current.position.lerp(destination, alpha);
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
    {children}
    {selected && !isolated && <Html position={[0, 0.4, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: 'none' }}>
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
    'left-io': <IOBoard />, 'right-io': <IOBoard />, magsafe: <IOBoard magsafe />,
    'left-hinge': <Hinge />, 'right-hinge': <Hinge />,
  }), []);
  return <group>{visibleParts(state).map(part => <Assembly key={part.id} id={part.id} explosion={state.explosion}
    selected={state.selectedId === part.id} isolated={state.isolatedId === part.id} reducedMotion={reducedMotion} onSelect={onSelect}>
    {part.id === 'display' ? <Display lid={lid} /> : models[part.id]}
  </Assembly>)}</group>;
}
