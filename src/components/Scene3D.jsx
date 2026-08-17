import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ---------------------------------------------------------------------------
   ParticleField — a sphere of additive-blended points in the palette colors.
   Slowly rotates forever; the whole group tilts toward the mouse via lerp.
--------------------------------------------------------------------------- */
function ParticleField() {
  const group = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 1300 : 2600;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#7C3AED'), // electric violet
      new THREE.Color('#22D3EE'), // cyan
      new THREE.Color('#EC4899'), // magenta pop
      new THREE.Color('#5B21B6'), // deep violet filler
    ];

    for (let i = 0; i < count; i++) {
      // Random point in a hollow spherical shell (radius 4 → 11)
      const r = 4 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Constant slow spin
    group.current.rotation.y += delta * 0.045;
    // Ease toward the pointer for a subtle parallax tilt
    const { x, y } = state.pointer;
    group.current.rotation.x += (y * 0.18 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (x * -0.08 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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
