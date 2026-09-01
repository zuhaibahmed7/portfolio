import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ---------------------------------------------------------------------------
   ParticleField — additive-blended points that morph between three
   formations as the visitor scrolls through the hero:
   sphere shell → DNA double helix → flat data grid.
   The whole group also tilts toward the mouse via lerp.
--------------------------------------------------------------------------- */
// Window-level mouse (canvas is pointer-events:none so R3F pointer won't fire)
const mouse = { x: 0, y: 0 };

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function buildTargets(count) {
  const sphere = new Float32Array(count * 3);
  const helix = new Float32Array(count * 3);
  const grid = new Float32Array(count * 3);
  const cols = Math.ceil(Math.sqrt(count * 1.8));
  const rows = Math.ceil(count / cols);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Random point in a hollow spherical shell (radius 4 → 11)
    const r = 4 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    sphere[i3] = r * Math.sin(phi) * Math.cos(theta);
    sphere[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    sphere[i3 + 2] = r * Math.cos(phi);

    // Double helix: two strands offset by π along the vertical axis
    const t = i / count;
    const ang = t * Math.PI * 7 + (i % 2) * Math.PI;
    helix[i3] = Math.cos(ang) * 2.6;
    helix[i3 + 1] = (t - 0.5) * 9;
    helix[i3 + 2] = Math.sin(ang) * 2.6;

    // Flat "data wall" grid facing the camera
    grid[i3] = ((i % cols) - cols / 2) * 0.34;
    grid[i3 + 1] = (Math.floor(i / cols) - rows / 2) * 0.34;
    grid[i3 + 2] = 0;
  }
  return { sphere, helix, grid };
}
function ParticleField() {
  const group = useRef(null);
  const points = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 1300 : 2600;

  const { initial, colors, targets } = useMemo(() => {
    const targets = buildTargets(count);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#7C3AED'), // electric violet
      new THREE.Color('#22D3EE'), // cyan
      new THREE.Color('#EC4899'), // magenta pop
      new THREE.Color('#5B21B6'), // deep violet filler
    ];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { initial: new Float32Array(targets.sphere), colors: col, targets };
  }, [count]);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Constant slow spin
    group.current.rotation.y += delta * 0.045;
    // Ease toward the pointer for a subtle parallax tilt
    const { x, y } = mouse;
    group.current.rotation.x += (y * 0.18 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (x * -0.08 - group.current.rotation.z) * 0.04;

    // Morph formations with scroll progress across the hero;
    // past the hero the canvas is offscreen — skip buffer writes
    const p = Math.min(window.scrollY / (window.innerHeight * 1.1), 1);
    if (p >= 1 || !points.current) return;
    const m1 = smooth(0.08, 0.45, p);
    const m2 = smooth(0.5, 0.95, p);
    const { sphere, helix, grid } = targets;
    const attr = points.current.geometry.attributes.position;
    const arr = attr.array;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < count * 3; i += 3) {
      const ax = sphere[i] + (helix[i] - sphere[i]) * m1;
      const ay = sphere[i + 1] + (helix[i + 1] - sphere[i + 1]) * m1;
      const az = sphere[i + 2] + (helix[i + 2] - sphere[i + 2]) * m1;
      arr[i] = ax + (grid[i] - ax) * m2;
      arr[i + 1] = ay + (grid[i + 1] - ay) * m2 + Math.sin(time * 0.6 + i) * 0.04;
      arr[i + 2] = az + (grid[i + 2] - az) * m2;
    }
    attr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[initial, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

/* ---------------------------------------------------------------------------
   FloatingShapes — low-poly wireframe / metallic solids gently bobbing.
   drei's <Float> handles the idle float/rotation animation.
--------------------------------------------------------------------------- */
function FloatingShapes() {
  return (
    <>
      <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.6}>
        <mesh position={[3.4, 0.9, -1.4]}>
          <icosahedronGeometry args={[1.05, 0]} />
          <meshBasicMaterial color="#22D3EE" wireframe transparent opacity={0.45} />
        </mesh>
      </Float>

      <Float speed={1.1} rotationIntensity={0.9} floatIntensity={1.9}>
        <mesh position={[-3.6, -0.7, -1.8]} rotation={[0.6, 0.3, 0]}>
          <torusGeometry args={[0.85, 0.28, 16, 48]} />
          <meshStandardMaterial color="#7C3AED" roughness={0.25} metalness={0.85} />
        </mesh>
      </Float>

      <Float speed={1.7} rotationIntensity={1.4} floatIntensity={1.3}>
        <mesh position={[-2.3, 1.9, -2.6]}>
          <octahedronGeometry args={[0.62, 0]} />
          <meshBasicMaterial color="#EC4899" wireframe transparent opacity={0.4} />
        </mesh>
      </Float>

      <Float speed={0.9} rotationIntensity={0.7} floatIntensity={1.4}>
        <mesh position={[2.5, -1.9, -3]}>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color="#4C1D95"
            roughness={0.35}
            metalness={0.7}
            emissive="#7C3AED"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Float>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Scene3D — the hero background canvas.
   Mounted lazily by Hero (React.lazy) and skipped for reduced-motion users,
   who get a static CSS aurora fallback instead.
--------------------------------------------------------------------------- */
export default function Scene3D() {
  useEffect(() => {
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Fog fades distant particles into the background color */}
      <fog attach="fog" args={['#0A0A0F', 9, 17]} />

      <ambientLight intensity={0.6} />
      <pointLight position={[6, 5, 5]} intensity={42} color="#7C3AED" distance={24} decay={2} />
      <pointLight position={[-6, -4, 4]} intensity={36} color="#22D3EE" distance={24} decay={2} />

      <ParticleField />
      <FloatingShapes />
    </Canvas>
  );
}
