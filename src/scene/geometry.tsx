import { useEffect, useMemo, type ReactNode } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

type Vec3 = [number, number, number];
type SolidProps = { size: Vec3; position?: Vec3; color?: string; radius?: number; metalness?: number; roughness?: number; children?: ReactNode };

export function Solid({ size, position, color = '#a6a9ac', radius = 0.05, metalness = 0.7, roughness = 0.32, children }: SolidProps) {
  return <RoundedBox args={size} radius={Math.min(radius, Math.min(...size) / 2.1)} smoothness={3} position={position} castShadow receiveShadow>
    <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />{children}
  </RoundedBox>;
}

function Screw({ position }: { position: Vec3 }) {
  return <group position={position}>
    <mesh><cylinderGeometry args={[0.035, 0.035, 0.012, 12]} /><meshStandardMaterial color="#8d9092" metalness={0.85} roughness={0.27} /></mesh>
    <mesh position={[0, 0.007, 0]}><boxGeometry args={[0.04, 0.002, 0.008]} /><meshStandardMaterial color="#333635" /></mesh>
  </group>;
}

function Perforations({ x }: { x: number }) {
  const geometry = useMemo(() => new THREE.CircleGeometry(0.011, 5), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#444746', roughness: 0.9, side: THREE.DoubleSide }), []);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  const ref = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 11; i++) for (let j = 0; j < 46; j++) {
      dummy.position.set(x + (i - 5) * 0.035, 0.126, -1.59 + j * 0.046);
      dummy.rotation.x = -Math.PI / 2;
      dummy.updateMatrix();
      mesh.setMatrixAt(i * 46 + j, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  return <instancedMesh ref={ref} args={[geometry, material, 506]} />;
}

export function TopCase() {
  return <group>
    <Solid size={[6.4, 0.2, 4.45]} radius={0.17} />
    <Solid size={[4.91, 0.012, 2.02]} position={[0, 0.108, -0.58]} color="#161918" radius={0.12} metalness={0.1} />
    <Perforations x={-2.74} /><Perforations x={2.74} />
    <Solid size={[0.85, 0.018, 0.08]} position={[0, 0.11, 2.205]} color="#85898b" />
    {[-1, 1].map(s => <group key={s}>
      <Solid size={[0.015, 0.07, 0.24]} position={[s * 3.203, -0.01, -1.15]} color="#242828" />
      <Solid size={[0.015, 0.07, 0.24]} position={[s * 3.203, -0.01, -0.66]} color="#242828" />
    </group>)}
  </group>;
}

export function BottomCover() {
  return <group>
    <Solid size={[6.38, 0.105, 4.43]} radius={0.18} color="#959a9d" />
    {[-2.65, 2.65].flatMap(x => [-1.65, 1.65].map(z => <group key={`${x}${z}`} position={[x, -0.062, z]}>
      <mesh><cylinderGeometry args={[0.24, 0.23, 0.045, 32]} /><meshStandardMaterial color="#343735" roughness={0.85} /></mesh>
    </group>))}
    {[-2.96, 2.96].flatMap(x => [-1.95, 0, 1.95].map(z => <Screw key={`${x}${z}`} position={[x, 0.06, z]} />))}
  </group>;
}

export function Keyboard() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1536; canvas.height = 640;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#131514'; c.fillRect(0, 0, canvas.width, canvas.height);
    const rows = [
      ['esc', '◌', '☼', '▦', '⌕', '◉', '☾', '◀', '▷', '▶', '◁', '♪', '♫', '◯'],
      ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '+', 'delete'],
      ['tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'return'],
      ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'shift'],
      ['fn', 'control', 'option', '⌘', '', '⌘', 'option', '◀', '▲', '▶'],
    ];
    rows.forEach((row, ri) => {
      const widths = row.map((_, i) => ri === 5 && i === 4 ? 5 : ri === 3 && i === 12 ? 1.7 : ri === 4 && (i === 0 || i === 11) ? 1.8 : 1);
      const total = widths.reduce((a, b) => a + b, 0); let x = 14;
      row.forEach((letter, i) => {
        const w = widths[i] / total * 1508 - 8, h = ri === 0 ? 68 : 91, y = ri === 0 ? 12 : 90 + (ri - 1) * 106;
        c.fillStyle = '#353836'; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill();
        c.fillStyle = '#202321'; c.beginPath(); c.roundRect(x + 1, y + 1, w - 2, h - 4, 9); c.fill();
        c.fillStyle = '#d1d5d1'; c.font = `${letter.length > 2 ? 18 : 25}px Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letter, x + w / 2, y + h / 2);
        x += w + 8;
      });
    });
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group>
    <Solid size={[4.82, 0.07, 1.92]} color="#111412" radius={0.08} metalness={0.2} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.039, 0]}><planeGeometry args={[4.78, 1.89]} /><meshStandardMaterial map={texture} roughness={0.65} /></mesh>
  </group>;
}

export function Trackpad() {
  return <group>
    <Solid size={[2.63, 0.045, 1.28]} color="#727779" radius={0.085} />
    <Solid size={[2.60, 0.02, 1.25]} position={[0, 0.03, 0]} color="#b1b5b7" radius={0.08} roughness={0.48} />
  </group>;
}

export function Display({ lid }: { lid: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1400; canvas.height = 900;
    const c = canvas.getContext('2d')!;
    const base = c.createLinearGradient(0, 0, 1400, 900); base.addColorStop(0, '#211f1d'); base.addColorStop(0.5, '#645548'); base.addColorStop(1, '#dbcec1'); c.fillStyle = base; c.fillRect(0, 0, 1400, 900);
    const bands = [
      { x: 170, y: 1050, rx: 1500, ry: 1050, color: ['#fbf0da', '#cebda7', '#766f65'] },
      { x: 230, y: 1040, rx: 1180, ry: 875, color: ['#eac8a0', '#f19556', '#9d3d20'] },
      { x: 260, y: 1070, rx: 970, ry: 770, color: ['#ffd6a3', '#eb7f3c', '#ab391d'] },
      { x: 300, y: 1100, rx: 750, ry: 650, color: ['#f7b56e', '#ba4825', '#47271f'] },
      { x: 340, y: 1110, rx: 535, ry: 490, color: ['#dc8650', '#672d1f', '#271e1b'] },
    ];
    bands.forEach(b => { const g = c.createLinearGradient(b.x, b.y - b.ry, b.x + b.rx * 0.7, b.y); g.addColorStop(0, b.color[0]); g.addColorStop(0.4, b.color[1]); g.addColorStop(1, b.color[2]); c.fillStyle = g; c.beginPath(); c.ellipse(b.x, b.y, b.rx, b.ry, -0.35, 0, Math.PI * 2); c.fill(); });
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group rotation={[-lid, 0, 0]}>
    <Solid size={[6.4, 0.105, 4.25]} position={[0, 0, 2.05]} radius={0.16} color="#a6aaac" />
    <Solid size={[6.28, 0.025, 4.12]} position={[0, -0.065, 2.05]} radius={0.13} color="#111412" metalness={0.15} />
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.08, 2.085]}><planeGeometry args={[6.05, 3.84]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <Solid size={[0.72, 0.012, 0.16]} position={[0, -0.09, 3.94]} radius={0.05} color="#111412" metalness={0.1} />
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.099, 3.95]}><circleGeometry args={[0.022, 16]} /><meshBasicMaterial color="#253b44" /></mesh>
  </group>;
}

export function Fan({ flipped = false }: { flipped?: boolean }) {
  return <group rotation={[0, flipped ? Math.PI : 0, 0]}>
    <Solid size={[1.45, 0.13, 1.35]} radius={0.17} color="#222827" metalness={0.5} />
    <mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.59, 0.61, 0.06, 64]} /><meshStandardMaterial color="#0e1413" roughness={0.6} /></mesh>
    {Array.from({ length: 39 }, (_, i) => <group key={i} rotation={[0, i / 39 * Math.PI * 2, 0]} position={[0, 0.135, 0]}>
      <mesh position={[0.34, 0, 0]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.42, 0.055, 0.026]} /><meshStandardMaterial color="#4b5350" metalness={0.5} roughness={0.44} /></mesh>
    </group>)}
    <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.19, 0.2, 0.07, 32]} /><meshStandardMaterial color="#242b29" metalness={0.6} /></mesh>
    <Screw position={[-0.59, 0.08, -0.53]} /><Screw position={[0.59, 0.08, 0.53]} />
    <Solid size={[1.28, 0.18, 0.12]} position={[0, 0, -0.7]} color="#3b4240" />
  </group>;
}

export function LogicBoard() {
  return <group>
    <Solid size={[2.45, 0.06, 1.52]} color="#143c35" radius={0.08} metalness={0.3} />
    {Array.from({ length: 16 }, (_, i) => {
      const x = (i % 8 - 3.5) * 0.28, z = Math.floor(i / 8) === 0 ? -0.54 : 0.53;
      return <group key={i} position={[x, 0.06, z]}>
        <Solid size={[0.21, 0.065, 0.21]} color="#252b28" radius={0.012} metalness={0.15} />
        {[0, 1, 2].map(j => <Solid key={j} size={[0.015, 0.018, 0.07]} position={[(j - 1) * 0.055, 0, -0.14]} color="#b4ae81" radius={0.003} />)}
      </group>;
    })}
    {[-1, 1].map(s => <group key={s}>
      <Solid size={[0.3, 0.1, 0.55]} position={[s * 0.88, 0.09, 0]} color="#2b302e" radius={0.018} />
      <Screw position={[s * 1.1, 0.04, 0.62]} />
      {Array.from({ length: 8 }, (_, i) => <Solid key={i} size={[0.05, 0.03, 0.06]} position={[s * 1.1, 0.05, -0.42 + i * 0.12]} color="#babda1" radius={0.003} />)}
    </group>)}
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0, 0.033, (i - 4) * 0.08]}><boxGeometry args={[2.2, 0.002, 0.008]} /><meshStandardMaterial color="#376052" /></mesh>)}
  </group>;
}

export function Processor() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#878e88'; ctx.fillRect(0, 0, 256, 256); ctx.fillStyle = '#252d29'; ctx.textAlign = 'center'; ctx.font = 'bold 45px Arial'; ctx.fillText('M1 Pro', 128, 141); ctx.font = '14px Arial'; ctx.fillText('APPLE SILICON', 128, 177);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group><Solid size={[0.99, 0.06, 0.84]} color="#233e35" radius={0.025} />
    <Solid size={[0.85, 0.05, 0.71]} position={[0, 0.05, 0]} color="#858e89" radius={0.025} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.077, 0]}><planeGeometry args={[0.81, 0.68]} /><meshStandardMaterial map={texture} metalness={0.55} roughness={0.35} /></mesh>
  </group>;
}

export function HeatSink() {
  return <group>
    <Solid size={[4.8, 0.09, 0.16]} color="#393e38" radius={0.04} />
    <Solid size={[1.14, 0.09, 0.71]} position={[0, 0.01, 0.19]} color="#54574d" radius={0.06} />
    {[-1, 1].map(s => <group key={s} position={[s * 2.13, 0, 0]}>
      {Array.from({ length: 25 }, (_, i) => <Solid key={i} size={[0.025, 0.18, 0.43]} position={[(i - 12) * 0.042, 0, -0.12]} color="#656557" radius={0.003} />)}
    </group>)}
  </group>;
}

export function Battery({ center = false }: { center?: boolean }) {
  const w = center ? 1.65 : 1.53;
  return <group>
    <Solid size={[w, 0.12, 1.83]} color="#1c2421" radius={0.09} metalness={0.05} roughness={0.82} />
    <Solid size={[w - 0.12, 0.015, 1.7]} position={[0, 0.068, 0]} color="#29312d" radius={0.07} metalness={0.08} roughness={0.8} />
    <Solid size={[w - 0.12, 0.025, 0.02]} position={[0, 0.08, 0.28]} color="#121a16" />
    <Solid size={[0.25, 0.01, 0.1]} position={[0, 0.08, 0.78]} color="#a2a59a" />
    <Solid size={[0.21, 0.025, 0.27]} position={[0, 0.045, -1.01]} color="#956e35" radius={0.01} />
    {[0, 1, 2, 3].map(i => <mesh key={i} position={[-0.12, 0.08, -0.45 + i * 0.057]}><boxGeometry args={[i === 0 ? 0.68 : 0.47, 0.003, 0.012]} /><meshStandardMaterial color="#73796e" /></mesh>)}
  </group>;
}

export function Speaker() {
  return <group><Solid size={[0.48, 0.18, 2.38]} color="#222925" radius={0.15} metalness={0.1} roughness={0.7} />
    {[-0.72, 0.56].map(z => <mesh key={z} position={[0, 0.1, z]}><cylinderGeometry args={[0.17, 0.17, 0.03, 32]} /><meshStandardMaterial color="#101914" roughness={0.9} /></mesh>)}
  </group>;
}

export function IOBoard({ magsafe = false }: { magsafe?: boolean }) {
  return <group><Solid size={[0.25, 0.045, magsafe ? 0.32 : 0.83]} color="#1a4c3d" radius={0.015} />
    <Solid size={[0.3, 0.12, magsafe ? 0.23 : 0.64]} position={[0, 0.065, 0]} color="#9ea4a0" radius={0.025} />
    <Solid size={[0.31, 0.068, magsafe ? 0.16 : 0.48]} position={[0, 0.065, 0]} color="#1a221d" radius={0.02} />
  </group>;
}

export function Hinge() {
  return <group><Solid size={[0.63, 0.06, 0.38]} color="#8c928f" radius={0.03} />
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.08, -0.1]}><cylinderGeometry args={[0.095, 0.095, 0.6, 24]} /><meshStandardMaterial color="#585f5b" metalness={0.85} roughness={0.25} /></mesh>
    <Screw position={[-0.2, 0.04, 0.1]} /><Screw position={[0.2, 0.04, 0.1]} />
  </group>;
}
