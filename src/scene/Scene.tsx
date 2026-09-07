import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import MacBook from './MacBook';
import { type ExplorerState } from '../state/explorer';

export type View = 'perspective' | 'top' | 'front';

class CanvasBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    return this.state.error ? <div className="canvas-fallback"><strong>The 3D view couldn’t start.</strong><p>Try a browser with WebGL enabled. You can still explore every component in the parts list.</p></div> : this.props.children;
  }
}

function CameraRig({ view, resetKey, isolatedId, explosion, demoAngle, reducedMotion, zoom }: {
  view: View; resetKey: number; isolatedId: string | null; explosion: number; demoAngle?: number; reducedMotion: boolean; zoom: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.15, 0));
  const destination = useRef(new THREE.Vector3(9, 7.5, 11));
  const active = useRef(true);
  const isDemo = demoAngle !== undefined;
  useEffect(() => {
    const isSmall = size.width < 550;
    const distance = (isolatedId ? ['top-case', 'bottom-cover', 'keyboard', 'display', 'heatsink'].includes(isolatedId) ? 11 : 5.5 : 14.5 + explosion * 3.8) * (isSmall ? 1.34 : 1) / zoom;
    const centerY = isolatedId ? isolatedId === 'display' ? 2 : 0.5 : 1.15 + explosion * 0.65;
    const centerZ = isolatedId ? 0 : view === 'top' ? -0.7 - explosion * 0.75 : -0.1;
    target.current.set(0, centerY, centerZ);
    if (view === 'top') destination.current.set(0, centerY + distance, centerZ + 0.001);
    else if (view === 'front') destination.current.set(0, centerY + distance * 0.2, distance);
    else destination.current.set(distance * 0.53, centerY + distance * 0.44, distance * 0.72);
    active.current = true;
    invalidate();
  }, [view, resetKey, isolatedId, explosion, size.width, zoom, isDemo, invalidate]);
  useFrame((frame, dt) => {
    if (!controls.current) return;
    if (demoAngle !== undefined) {
      const d = (size.width < 550 ? 18.2 : 14.7) + explosion * 2.8;
      camera.position.set(Math.sin(demoAngle) * d, 6.8 + explosion * 2.1, Math.cos(demoAngle) * d);
      controls.current.target.set(0, 1.1 + explosion * 0.8, -0.1); controls.current.update(); return;
    }
    if (!active.current) return;
    const a = reducedMotion ? 1 : 1 - Math.exp(-7 * dt);
    camera.position.lerp(destination.current, a); controls.current.target.lerp(target.current, a); controls.current.update();
    if (camera.position.distanceTo(destination.current) < 0.01) active.current = false;
    else frame.invalidate();
  });
  return <OrbitControls ref={controls} makeDefault enabled={demoAngle === undefined} enablePan={false} minDistance={2.5} maxDistance={30}
    minPolarAngle={0.01} maxPolarAngle={Math.PI / 2 + 0.17} enableDamping={!reducedMotion} dampingFactor={0.09}
    onStart={() => { active.current = false; }} />;
}

export default function Scene({ state, onSelect, view, resetKey, reducedMotion, lid, demoAngle, zoom }: {
  state: ExplorerState; onSelect: (id: string) => void; view: View; resetKey: number; reducedMotion: boolean; lid?: number; demoAngle?: number; zoom: number;
}) {
  return <CanvasBoundary><Canvas shadows frameloop="demand" dpr={[1, 1.7]} camera={{ position: [8, 7.5, 11], fov: 36, near: 0.1, far: 100 }}
    gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} aria-label="Interactive three-dimensional MacBook model"
    fallback={<div className="canvas-fallback">WebGL is unavailable. Use the component list to explore the parts.</div>}>
    <ambientLight intensity={0.9} />
    <directionalLight position={[3, 9, 5]} intensity={3.1} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
    <directionalLight position={[-7, 5, -3]} intensity={1.3} color="#e2e9ee" />
    <Suspense fallback={null}>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={3} position={[-7, 2, 1]} rotation={[0, Math.PI / 2, 0]} scale={[5, 9, 1]} />
        <Lightformer form="rect" intensity={2} position={[7, 4, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 9, 1]} />
      </Environment>
      <MacBook state={state} onSelect={onSelect} reducedMotion={reducedMotion} lid={lid} />
      <ContactShadows position={[0, -1.15, 0]} opacity={0.28} scale={17} blur={2.6} far={8} resolution={256} color="#464b41" />
    </Suspense>
    <CameraRig view={view} resetKey={resetKey} isolatedId={state.isolatedId} explosion={state.explosion} demoAngle={demoAngle} reducedMotion={reducedMotion} zoom={zoom} />
  </Canvas></CanvasBoundary>;
}
