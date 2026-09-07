import { useEffect, useMemo, type ReactNode } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

type V3 = [number, number, number];
const ALUMINUM = '#b4b8bb';
export function Solid({ size, position, color = ALUMINUM, radius = 0.035, metalness = 0.65, roughness = 0.36, children }: { size: V3; position?: V3; color?: string; radius?: number; metalness?: number; roughness?: number; children?: ReactNode }) {
  return <RoundedBox args={size} radius={Math.min(radius, Math.min(...size) / 2.1)} smoothness={3} position={position} castShadow receiveShadow><meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />{children}</RoundedBox>;
}
function rounded(w: number, h: number, r: number, x = 0, y = 0) {
  const s = new THREE.Shape(), l = x - w / 2, b = y - h / 2;
  s.moveTo(l + r, b); s.lineTo(l + w - r, b); s.quadraticCurveTo(l + w, b, l + w, b + r); s.lineTo(l + w, b + h - r); s.quadraticCurveTo(l + w, b + h, l + w - r, b + h); s.lineTo(l + r, b + h); s.quadraticCurveTo(l, b + h, l, b + h - r); s.lineTo(l, b + r); s.quadraticCurveTo(l, b, l + r, b); return s;
}
function Plate({ shape, depth, y = 0, color = ALUMINUM, metalness = 0.65, tapered = false }: { shape: THREE.Shape; depth: number; y?: number; color?: string; metalness?: number; tapered?: boolean }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {depth, steps:8, bevelEnabled:false, curveSegments:32});
    if (tapered) { const p = g.attributes.position; for(let i=0;i<p.count;i++) { const t=THREE.MathUtils.smoothstep(p.getZ(i)/depth,.65,1);p.setXY(i,p.getX(i)*(1-.013*t),p.getY(i)*(1-.018*t)); } g.computeVertexNormals(); }
    return g;
  }, [shape,depth,tapered]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]} castShadow receiveShadow><meshStandardMaterial color={color} metalness={metalness} roughness={0.38} /></mesh>;
}

function Screw({ position }: { position: V3 }) {
  return <group position={position}><mesh><cylinderGeometry args={[0.029, 0.029, 0.008, 12]} /><meshStandardMaterial color="#a7aaa5" metalness={0.85} roughness={0.3} /></mesh><mesh position={[0, 0.005, 0]}><boxGeometry args={[0.03, 0.002, 0.006]} /><meshStandardMaterial color="#282d28" /></mesh></group>;
}
function Grille({ x }: { x: number }) {
  const g = useMemo(() => new THREE.CircleGeometry(0.006, 5), []), m = useMemo(() => new THREE.MeshStandardMaterial({ color: '#666b6b', side: THREE.DoubleSide }), []);
  useEffect(() => () => { g.dispose(); m.dispose(); }, [g, m]);
  return <instancedMesh args={[g, m, 900]} ref={mesh => {
    if (!mesh) return; const o = new THREE.Object3D();
    for (let i = 0; i < 10; i++) for (let j = 0; j < 90; j++) { o.position.set(x + (i - 4.5) * 0.018, 0.021, -1.83 + j * 0.025); o.rotation.x = -Math.PI / 2; o.updateMatrix(); mesh.setMatrixAt(i * 90 + j, o.matrix); } mesh.instanceMatrix.needsUpdate = true;
  }} />;
}
function Port({side,z,width,height}: {side:number;z:number;width:number;height:number}) {
  const outline=useMemo(()=>rounded(width+.035,height+.026,Math.min(.04,height/2)),[width,height]);
  const opening=useMemo(()=>rounded(width,height,Math.min(.03,height/2)),[width,height]);
  return <group position={[side*3.128,-.092,z]} rotation={[0,side*Math.PI/2,0]}><mesh><shapeGeometry args={[outline]} /><meshStandardMaterial color="#737a7e" side={THREE.DoubleSide} /></mesh><mesh position={[0,0,.001]}><shapeGeometry args={[opening]} /><meshStandardMaterial color="#101718" side={THREE.DoubleSide} /></mesh></group>;
}
export function TopCase() {
  const deck = useMemo(() => { const s = rounded(6.252, 4.424, 0.17); s.holes.push(rounded(5.59, 2.30, 0.085, 0, -0.72)); s.holes.push(rounded(2.62, 1.63, 0.10, 0, 1.29)); return s; }, []);
  const walls = useMemo(() => { const s = rounded(6.252, 4.424, 0.17); s.holes.push(rounded(6.13, 4.30, 0.13)); return s; }, []);
  return <group>
    <Plate shape={deck} depth={0.032} y={0.02} /><Plate shape={walls} tapered depth={0.185} y={0.005} />
    <Grille x={-2.96} /><Grille x={2.96} />
    <Solid size={[0.96, 0.014, 0.085]} position={[0, 0.014, 2.185]} color="#959b9c" radius={0.006} />
    <Solid size={[5.15, 0.07, 0.13]} position={[0, -0.022, -2.14]} color="#161a19" />
    <Port side={-1} z={-1.60} width={.33} height={.073}/><Port side={-1} z={-1.10} width={.24} height={.073}/><Port side={-1} z={-.60} width={.24} height={.073}/>
    <mesh rotation={[0,0,Math.PI/2]} position={[-3.129,-.092,-.15]}><cylinderGeometry args={[.04,.04,.004,24]}/><meshStandardMaterial color="#131719"/></mesh>
    <Port side={1} z={-1.49} width={.37} height={.08}/><Port side={1} z={-.92} width={.24} height={.072}/><Port side={1} z={-.19} width={.48} height={.025}/>

  </group>;
}
export function BottomCover() {
  const outline = useMemo(() => rounded(6.15,4.31,.22), []);
  const texture = useMemo(() => { const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d')!;c.font='500 84px Arial';c.fillStyle='#737a7e';c.textAlign='center';c.fillText('MacBook Pro',512,145);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;}, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group><Plate shape={outline} depth={.012} y={.012} color="#aab0b3" />
    {[-2.65,2.65].flatMap(x=>[-1.71,1.71].map(z=><mesh key={`${x}${z}`} position={[x,-.007,z]}><cylinderGeometry args={[.13,.14,.014,40]} /><meshStandardMaterial color="#222729" roughness={.9} /></mesh>))}
    <mesh rotation={[Math.PI/2,0,0]} position={[0,-.001,0]}><planeGeometry args={[2.3,.575]} /><meshStandardMaterial map={texture} transparent roughness={.9} depthWrite={false} /></mesh>
    {[-2.9,-1.1,1.1,2.9].flatMap(x=>[-1.94,1.94].map(z=><group key={`${x}${z}`} position={[x,-.001,z]} rotation={[Math.PI,0,0]}><Screw position={[0,0,0]} /></group>))}
  </group>;
}

export function Keyboard() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1680; canvas.height = 700; const c = canvas.getContext('2d')!;
    c.fillStyle = '#090c0c'; c.fillRect(0, 0, 1680, 700);
    const rows = [
      ['esc', '☼', '☀', '▦', '⌕', '♩', '☾', '◀◀', '▷Ⅱ', '▶▶', '◁', '♪', '♫', '◯'],
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '=', 'delete'],
      ['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['caps lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'return'],
      ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'shift'],
      ['◎ fn', 'control', 'option', '⌘ command', '', '⌘ command', 'option', '◀', '▲\n▼', '▶'],
    ];
    rows.forEach((row, ri) => {
      const weights = row.map((_, i) => ri === 5 ? [1, 1, 1, 1.25, 4.75, 1.25, 1, 1, 1, 1][i] : ri === 4 && (i === 0 || i === 11) ? 1.95 : ri === 3 && (i === 0 || i === 12) ? 1.5 : 1);
      const total = weights.reduce((a, b) => a + b, 0); let x = 14;
      row.forEach((letter, i) => {
        const w = weights[i] / total * 1652 - 8, y = 13 + ri * 113, h = 103;
        c.fillStyle = '#343838'; c.beginPath(); c.roundRect(x, y, w, h, 13); c.fill();
        const gradient = c.createLinearGradient(0, y, 0, y + h); gradient.addColorStop(0, '#232727'); gradient.addColorStop(1, '#141818'); c.fillStyle = gradient; c.beginPath(); c.roundRect(x + 2, y + 2, w - 4, h - 5, 11); c.fill();
        c.fillStyle = '#c9cece'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `${letter.length > 2 ? 16 : 26}px Arial`;
        letter.split('\n').forEach((line, li, a) => c.fillText(line, x + w / 2, y + h / 2 + (li - (a.length - 1) / 2) * 27));
        if (ri === 0 && i > 0 && i < 13) { c.font = '12px Arial'; c.fillStyle = '#818a87'; c.fillText(`F${i}`, x + w / 2, y + 80); }
        x += w + 8;
      });
    });
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group><Solid size={[5.55, 0.02, 2.265]} radius={0.009} color="#0b1010" metalness={0.15} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}><planeGeometry args={[5.49, 2.23]} /><meshStandardMaterial map={texture} roughness={0.56} /></mesh>
  </group>;
}
export function Trackpad() {
  return <group><Solid size={[2.596, 0.022, 1.603]} radius={0.01} color="#9da4a7" roughness={0.47} />
    <Solid size={[2.575, 0.003, 1.58]} position={[0, 0.013, 0]} color="#b4babe" radius={0.001} roughness={0.58} />
  </group>;
}
export function Display({ lid }: { lid: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1512; canvas.height = 982; const c = canvas.getContext('2d')!;
    c.fillStyle = '#050709'; c.fillRect(0, 0, 1512, 982);
    // Original dark metallic ribbons, informed by the restrained 2026 product imagery.
    for (let i = 0; i < 5; i++) {
      c.save(); c.translate(756, 491); c.rotate(-0.16); const x = -860 + i * 225, y = -480 + i * 100;
      c.strokeStyle = '#10151c'; c.lineWidth = 145; c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, 750); c.lineTo(x, y + 210); c.quadraticCurveTo(x, y, x + 210, y); c.lineTo(x + 620, y); c.quadraticCurveTo(x + 790, y, x + 790, y - 160); c.stroke();
      const g = c.createLinearGradient(x - 70, 0, x + 90, 0); g.addColorStop(0, '#090c10'); g.addColorStop(0.5, '#353f4b'); g.addColorStop(0.8, '#7b8897'); g.addColorStop(1, '#11161e'); c.strokeStyle = g; c.lineWidth = 91; c.stroke(); c.restore();
    }
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group rotation={[-lid, 0, 0]}>
    <Solid size={[6.252, 0.065, 4.20]} position={[0, 0, 2.01]} radius={0.03} color="#aeb4b8" />
    <Solid size={[6.19, 0.014, 4.115]} position={[0, -0.04, 2.01]} radius={0.006} color="#080b0b" metalness={0.08} />
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.049, 2.034]}><planeGeometry args={[6.06, 3.936]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <Solid size={[0.70, 0.008, 0.19]} position={[0, -0.056, 3.925]} radius={0.003} color="#080b0b" metalness={0.1} />
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.062, 3.95]}><circleGeometry args={[0.015, 16]} /><meshBasicMaterial color="#14232b" /></mesh>
  </group>;
}
export function Fan({ flipped = false }: { flipped?: boolean }) {
  const cover = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-0.66, -0.80); s.lineTo(0.64, -0.80); s.lineTo(0.64, -0.2); s.bezierCurveTo(0.92, 0.4, 0.45, 0.84, -0.05, 0.83); s.bezierCurveTo(-0.74, 0.83, -0.87, 0.25, -0.66, -0.2); s.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0.12, 0.385, 0, Math.PI * 2, true); s.holes.push(hole); return s;
  }, []);
  return <group scale={[flipped ? -1 : 1, 1, 1]}>
    <mesh position={[0, 0, 0.12]}><cylinderGeometry args={[0.71, 0.69, 0.12, 64]} /><meshStandardMaterial color="#22272a" metalness={0.42} roughness={0.47} /></mesh>
    <Plate shape={cover} depth={0.025} y={0.10} color="#2c3033" metalness={0.42} />
    <mesh position={[0, 0.108, 0.12]}><cylinderGeometry args={[0.385, 0.385, 0.013, 48]} /><meshStandardMaterial color="#080d10" /></mesh>
    {Array.from({ length: 43 }, (_, i) => <group key={i} position={[0, 0.12, 0.12]} rotation={[0, i / 43 * Math.PI * 2, 0]}><mesh position={[0.285, 0, 0]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.18, 0.024, 0.013]} /><meshStandardMaterial color="#62696e" roughness={0.42} metalness={0.5} /></mesh></group>)}
    <mesh position={[0, 0.137, 0.12]}><cylinderGeometry args={[0.172, 0.18, 0.032, 40]} /><meshStandardMaterial color="#bfc1c1" roughness={0.29} metalness={0.82} /></mesh>
    <Solid size={[1.28, 0.19, 0.35]} position={[0, 0.01, -0.71]} color="#202529" radius={0.015} />
    {Array.from({ length: 34 }, (_, i) => <Solid key={i} size={[0.014, 0.11, 0.10]} position={[(i - 16.5) * 0.035, 0.02, -0.893]} radius={0.003} color="#6e7575" />)}
    {[[-0.74, -0.33], [0.71, -0.25], [-0.49, 0.69], [0.57, 0.68]].map(([x, z]) => <group key={`${x}${z}`}><Solid size={[0.21, 0.035, 0.16]} position={[x, 0.04, z]} color="#33393c" /><Screw position={[x, 0.068, z]} /></group>)}
  </group>;
}
export function LogicBoard() {
  const board = useMemo(() => { const s = rounded(5.90, 2.25, 0.08); for (const x of [-1.96, 1.96]) { const h = new THREE.Path(); h.absarc(x, 0, 0.80, 0, Math.PI * 2, true); s.holes.push(h); } return s; }, []);
  return <group><Plate shape={board} depth={0.035} y={0} color="#252c29" metalness={0.25} />
    <Solid size={[1.36, 0.055, 1.53]} position={[0, 0.025, -0.03]} color="#202426" radius={0.03} metalness={0.12} />
    {[-1, 1].map(s => <group key={s}><Solid size={[0.40, 0.04, 0.82]} position={[s * 0.96, 0.023, 0.07]} color="#1b2022" radius={0.015} />
      {Array.from({ length: 14 }, (_, i) => <Solid key={i} size={[0.12, 0.025, i % 3 ? 0.07 : 0.15]} position={[s * (0.3 + (i % 7) * 0.35), 0.024, 0.88 + Math.floor(i / 7) * 0.13]} color={i % 3 ? '#a7a68b' : '#414943'} radius={0.002} />)}
      {Array.from({ length: 7 }, (_, i) => <Solid key={i} size={[0.15, 0.045, 0.14]} position={[s * 2.77, 0.02, -0.75 + i * 0.24]} color={i % 2 ? '#51584f' : '#9c9e90'} radius={0.005} />)}
      <Screw position={[s * 2.81, 0.02, -1.02]} /><Screw position={[s * 2.81, 0.02, 1.02]} />
    </group>)}
    {[-2.26, -1.85].map(x => <Solid key={x} size={[0.29, 0.07, 0.31]} position={[x, 0.038, 0.9]} color="#bcbeba" radius={0.012} />)}
    <Solid size={[0.20, 0.025, 0.45]} position={[0, 0.025, 1.15]} color="#242726" />
  </group>;
}
export function Processor() {
  const texture = useMemo(() => { const c = document.createElement('canvas'); c.width = 512; c.height = 384; const x = c.getContext('2d')!; x.fillStyle = '#858b8d'; x.fillRect(0, 0, 512, 384); x.textAlign = 'center'; x.fillStyle = '#1f272c'; x.font = '600 70px Arial'; x.fillText('M5 Pro', 256, 201); x.font = '18px Arial'; x.fillText('APPLE SILICON', 256, 250); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group><Solid size={[1.10, 0.028, 0.86]} color="#233531" radius={0.012} /><Solid size={[0.98, 0.035, 0.73]} position={[0, 0.023, 0]} color="#8c9294" radius={0.015} /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.042, 0]}><planeGeometry args={[0.95, 0.70]} /><meshStandardMaterial map={texture} metalness={0.65} roughness={0.36} /></mesh></group>;
}
export function HeatSink() {
  const pipe = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-2.45, 0, -0.74), new THREE.Vector3(-1.25, 0, -0.61), new THREE.Vector3(-0.65, 0, 0.20), new THREE.Vector3(0, 0, 0.31), new THREE.Vector3(0.65, 0, 0.20), new THREE.Vector3(1.25, 0, -0.61), new THREE.Vector3(2.45, 0, -0.74)]), []);
  return <group><mesh scale={[1, 0.45, 1]}><tubeGeometry args={[pipe, 70, 0.12, 10, false]} /><meshStandardMaterial color="#32373a" metalness={0.65} roughness={0.42} /></mesh><Solid size={[1.16, 0.06, 0.90]} position={[0, -0.014, -0.10]} color="#33383a" />
    {[-1.96, 1.96].map(x => <group key={x} position={[x, 0, -0.88]}>{Array.from({ length: 30 }, (_, i) => <Solid key={i} size={[0.018, 0.14, 0.27]} position={[(i - 14.5) * 0.044, 0, 0]} color="#535a5e" radius={0.003} />)}</group>)}
  </group>;
}
export function Battery({ center = false }: { center?: boolean }) {
  const w = center ? 2.23 : 1.40;
  return <group>{(center ? [0] : [-0.45, 0.45]).map((z, i) => <group key={z} position={[0, 0, z]}><Solid size={[w, 0.092, center ? 1.77 : 0.86]} color="#32373b" radius={0.04} metalness={0.07} roughness={0.86} /><Solid size={[w - 0.08, 0.006, center ? 1.67 : 0.77]} position={[0, 0.049, 0]} color="#3d4247" radius={0.002} metalness={0.1} roughness={0.86} />{Array.from({ length: 4 }, (_, j) => <mesh key={j} position={[-0.1, 0.054, (j - 1.5) * 0.048]}><boxGeometry args={[j ? 0.40 : 0.57, 0.001, 0.009]} /><meshStandardMaterial color="#919895" /></mesh>)}<Solid size={[0.16, 0.008, 0.13]} position={[0, 0.05, center ? 0.78 : i ? 0.33 : -0.33]} color="#b9bfbc" /></group>)}
    {center && <Solid size={[0.014, 0.003, 1.69]} position={[0, 0.055, 0]} color="#151d1b" />}
  </group>;
}
export function Speaker() {
  return <group><Solid size={[0.32, 0.13, 1.78]} color="#21272a" radius={0.06} metalness={0.2} /><Solid size={[0.50, 0.12, 0.57]} position={[0, 0.01, 0.62]} color="#272d30" radius={0.055} /><mesh position={[0, 0.079, 0.62]}><cylinderGeometry args={[0.16, 0.16, 0.012, 32]} /><meshStandardMaterial color="#101719" /></mesh></group>;
}
export function IOBoard({ magsafe = false, right = false }: { magsafe?: boolean; right?: boolean }) {
  return <group><Solid size={[0.25, 0.026, magsafe ? 0.32 : right ? 0.42 : 0.80]} color="#222d29" radius={0.01} />{(magsafe || right ? [0] : [-0.25, 0.25]).map(z => <group key={z} position={[0, 0.032, z]}><Solid size={[0.28, 0.072, magsafe ? 0.28 : 0.21]} color="#acb0ac" radius={0.03} /><Solid size={[0.282, 0.037, magsafe ? 0.21 : 0.15]} color="#101718" radius={0.015} /></group>)}</group>;
}
export function Hinge() {
  return <group><Solid size={[0.62, 0.029, 0.24]} color="#9fa6a7" radius={0.01} /><mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.03, -0.08]}><cylinderGeometry args={[0.052, 0.052, 0.59, 24]} /><meshStandardMaterial color="#5f696b" metalness={0.82} roughness={0.30} /></mesh><Screw position={[-0.22, 0.022, 0.06]} /><Screw position={[0.22, 0.022, 0.06]} /></group>;
}
