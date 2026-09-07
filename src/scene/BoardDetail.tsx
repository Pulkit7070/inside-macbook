import { useEffect, useMemo } from 'react';
import { Shape, Path, CanvasTexture, SRGBColorSpace } from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, Line, RoundedBox } from '@react-three/drei';
import { boardParts, type BoardPart } from '../data/board';

export interface BoardDetailProps {
  progress: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function Camera({ progress }: { progress: number }) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const scale = size.width < 600 ? 1.4 : 1;
    const angle = -.12 + progress * .16;
    camera.position.set(Math.sin(angle) * 8 * scale, (11.5 + progress * 2) * scale, (7.3 + progress * 1.6) * scale);
    camera.lookAt(0, .55, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, progress, invalidate]);
  return null;
}

function Package({ part, index, progress, selected, onSelect }: {
  part: BoardPart; index: number; progress: number; selected: boolean; onSelect: (id: string) => void;
}) {
  const p: [number, number, number] = part.position.map((value, i) => value + part.spread[i] * progress) as [number, number, number];
  const [w, h, d] = part.size;
  const trace = part.id === 'board-traces';
  const marking = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = part.id === 'board-soc' ? '#a9b0ad' : '#303936'; context.fillRect(0,0,512,256);
      context.fillStyle = part.id === 'board-soc' ? '#202a27' : '#c5cbc7'; context.textAlign = 'center';
      context.font = '600 44px monospace'; context.fillText(part.shortName,256,122);
      context.font = '14px monospace'; context.fillText(`FUNCTION ${String(index+1).padStart(2,'0')} · CONCEPT`,256,159);
    }
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }, [part.id,part.shortName,index]);
  useEffect(() => () => marking.dispose(), [marking]);
  return <>
    {progress > .02 && <Line points={[[part.position[0], .05, part.position[2]], p]} color={part.color} transparent opacity={.3} lineWidth={1} dashed dashSize={.07} gapSize={.06} />}
    <group position={p} onClick={e => { e.stopPropagation(); onSelect(part.id); }}>
      <RoundedBox args={[w, h, d]} radius={.035} smoothness={2}>
        <meshStandardMaterial color={trace ? '#183c31' : '#18211f'} roughness={.57} metalness={.4} emissiveIntensity={0} />
      </RoundedBox>
      {!trace && <mesh position={[0, h / 2 + .012, 0]}>
        <boxGeometry args={[w * .84, .025, d * .8]} />
        <meshStandardMaterial color={part.id === 'board-soc' ? '#a9b0ad' : '#303936'} metalness={.7} roughness={.37} />
      </mesh>}
      {Array.from({ length: 10 }, (_, i) => <group key={i}>
        <mesh position={[-w / 2 + .08 + i * (w - .16) / 9, -.01, -d / 2 - .025]}><boxGeometry args={[.035,.025,.07]} /><meshStandardMaterial color="#b7ab80" metalness={.75} roughness={.4} /></mesh>
        <mesh position={[-w / 2 + .08 + i * (w - .16) / 9, -.01, d / 2 + .025]}><boxGeometry args={[.035,.025,.07]} /><meshStandardMaterial color="#b7ab80" metalness={.75} roughness={.4} /></mesh>
      </group>)}
      {trace && Array.from({ length: 6 }, (_, i) => <Line key={i} points={[[-.56,.02,-.18+i*.06],[-.2,.02,-.18+i*.06],[.02,.02,.01+i*.025],[.56,.02,.01+i*.025]]} color="#bd965a" lineWidth={1.5} />)}
      {!trace && <mesh position={[0,h / 2 + .027,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[w*.79,d*.72]} />
        <meshStandardMaterial map={marking} roughness={.48} metalness={.3} />
      </mesh>}
      <Html position={[0,.18,d / 2 + .22]} center zIndexRange={[30,10]}>
        <button type="button" aria-label={`Explore ${part.name}`} aria-pressed={selected} onClick={e => { e.stopPropagation(); onSelect(part.id); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 9px', border: `1px solid ${selected ? part.color : '#58625b'}`, borderRadius: 4, color: '#edf1eb', background: selected ? '#34423b' : '#141d19ed', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, boxShadow: '0 2px 9px #0005' }}>
          <span style={{ color: part.color, fontFamily: 'monospace', fontSize: 9 }}>{String(index + 1).padStart(2, '0')}</span>{part.shortName}
        </button>
      </Html>
    </group>
  </>;
}

function Board() {
  const outline = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-3.95,-1.7); shape.lineTo(3.95,-1.7);
    shape.quadraticCurveTo(4.1,-1.7,4.1,-1.55); shape.lineTo(4.1,1.55);
    shape.quadraticCurveTo(4.1,1.7,3.95,1.7); shape.lineTo(.85,1.7);
    shape.lineTo(.85,1.56); shape.lineTo(-.45,1.56); shape.lineTo(-.45,1.7);
    shape.lineTo(-3.95,1.7); shape.quadraticCurveTo(-4.1,1.7,-4.1,1.55);
    shape.lineTo(-4.1,-1.55); shape.quadraticCurveTo(-4.1,-1.7,-3.95,-1.7);
    for (const x of [-2.65,2.65]) {
      const hole = new Path(); hole.absarc(x,0,1,0,Math.PI*2,true); shape.holes.push(hole);
    }
    return shape;
  }, []);
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.12,0]}>
      <extrudeGeometry args={[outline,{depth:.12,bevelEnabled:false,curveSegments:48}]} />
      <meshStandardMaterial color="#172821" roughness={.74} metalness={.25} />
    </mesh>
    {[-2.65,2.65].map(x => <mesh key={x} position={[x,.005,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[1,1.025,64]} /><meshStandardMaterial color="#60715a" metalness={.35} roughness={.7} />
    </mesh>)}
    {Array.from({ length: 10 }, (_, i) => {
      const z = -1.52 + i * .031;
      return <group key={i}>
        <Line points={[[-3.85,.008,z],[-1.45,.008,z],[-1.25,.008,z+.2],[1.4,.008,z+.2],[1.6,.008,z],[3.85,.008,z]]} color={i%3 ? '#426047' : '#6c7250'} lineWidth={.65} transparent opacity={.65} />
        <Line points={[[-3.85,.008,-z],[-1.45,.008,-z],[-1.25,.008,-z-.2],[1.4,.008,-z-.2],[1.6,.008,-z],[3.85,.008,-z]]} color="#426047" lineWidth={.65} transparent opacity={.65} />
      </group>;
    })}
    {Array.from({ length: 8 }, (_, i) => <Line key={i} points={[[-1.5+i*.038,.008,-1.1],[-1.5+i*.038,.008,.85],[-1.3+i*.038,.008,1.1]]} color="#607357" lineWidth={.65} transparent opacity={.6} />)}
    {Array.from({ length: 54 }, (_, i) => {
      const x = -3.7 + (i % 27) * .285;
      const z = i < 27 ? -1.61 : 1.61;
      if (x > -.55 && x < .95 && z > 0) return null;
      return <group key={i} position={[x,.03,z]}>
        <mesh><boxGeometry args={[.095,.055,.065]} /><meshStandardMaterial color={i % 3 ? '#9e9674' : '#404943'} metalness={.45} roughness={.5} /></mesh>
        <mesh position={[.045,0,0]}><boxGeometry args={[.018,.06,.07]} /><meshStandardMaterial color="#b8b9a5" metalness={.8} roughness={.4} /></mesh>
      </group>;
    })}
    {[-3.9,3.9].flatMap(x => [-1.45,1.45].map(z => <mesh key={`${x}-${z}`} position={[x,.008,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.065,.13,24]} /><meshStandardMaterial color="#a79a6a" metalness={.7} roughness={.4} /></mesh>))}
    {[-1,0,1].map(i => <group key={i} position={[i*2.7,.03,-1.67]}>
      <mesh><boxGeometry args={[.65,.1,.14]} /><meshStandardMaterial color="#b3b2a7" metalness={.8} roughness={.35} /></mesh>
      <mesh position={[0,.06,0]}><boxGeometry args={[.49,.03,.1]} /><meshStandardMaterial color="#1d201e" /></mesh>
    </group>)}
  </group>;
}

export default function BoardDetail({ progress, selectedId, onSelect }: BoardDetailProps) {
  const amount = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  return <Canvas resize={{ debounce: 0 }} frameloop="demand" dpr={[1,1.7]} camera={{ position: [0,12,8], fov: 40, near: .1, far: 100 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} aria-label="Illustrative logic board with eight selectable circuit groups" fallback={<div className="canvas-fallback">The 3D board needs WebGL. Explore its functional groups in the component list.</div>}>
    <ambientLight intensity={1.6} />
    <directionalLight position={[2,8,4]} intensity={3.2} color="#f2eee2" />
    <directionalLight position={[-5,4,-3]} intensity={2} color="#b7d6de" />
    <Board />
    {boardParts.map((part,index) => <Package key={part.id} part={part} index={index} progress={amount} selected={selectedId === part.id} onSelect={onSelect} />)}
    <Camera progress={amount} />
  </Canvas>;
}
