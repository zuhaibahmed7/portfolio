import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
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
   OrbitalRings — concentric wireframe rings rotating at different angles.
   Creates a sci-fi / HUD aesthetic around the center of the scene.
--------------------------------------------------------------------------- */
function OrbitalRings() {
  const group = useRef(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Each ring rotates on a different axis at a different speed
    group.current.children.forEach((ring, i) => {
      ring.rotation.x = t * (0.15 + i * 0.08) + i * 1.2;
      ring.rotation.y = t * (0.1 + i * 0.05) + i * 0.8;
      ring.rotation.z = t * 0.03 + i * 0.5;
    });
  });

  const ringConfigs = [
    { radius: 3.2, tube: 0.015, color: '#7C3AED', opacity: 0.35 },
    { radius: 4.0, tube: 0.012, color: '#22D3EE', opacity: 0.25 },
    { radius: 4.8, tube: 0.01, color: '#EC4899', opacity: 0.18 },
  ];

  return (
    <group ref={group}>
      {ringConfigs.map((cfg, i) => (
        <mesh key={i}>
          <torusGeometry args={[cfg.radius, cfg.tube, 32, 100]} />
          <meshBasicMaterial
            color={cfg.color}
            transparent
            opacity={cfg.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------------------
   GlowingCore — a central pulsing sphere with distortion.
   Pulses in size and emissive intensity, reacting to mouse position.
--------------------------------------------------------------------------- */
function GlowingCore() {
  const mesh = useRef(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    // Pulse scale
    const scale = 1 + Math.sin(t * 1.2) * 0.12 + Math.sin(t * 2.7) * 0.06;
    mesh.current.scale.setScalar(scale);
    // Subtle rotation
    mesh.current.rotation.x = t * 0.2;
    mesh.current.rotation.y = t * 0.35;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -1]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <MeshDistortMaterial
        color="#7C3AED"
        emissive="#7C3AED"
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.9}
        distort={0.3}
        speed={2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

/* ---------------------------------------------------------------------------
   EnergyBeams — thin glowing lines connecting nearby particles.
   Creates a neural-network / constellation effect.
--------------------------------------------------------------------------- */
function EnergyBeams() {
  const linesRef = useRef(null);
  const maxLines = 120;
  const maxDist = 3.5;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(maxLines * 6); // 2 vertices per line
    const col = new Float32Array(maxLines * 6); // 2 colors per line
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const t = state.clock.elapsedTime;
    const geo = linesRef.current.geometry;
    const posAttr = geo.attributes.position;
    const colAttr = geo.attributes.color;
    const posArr = posAttr.array;
    const colArr = colAttr.array;

    // Generate beam endpoints that orbit and pulse
    for (let i = 0; i < maxLines; i++) {
      const i6 = i * 6;
      const angle1 = (i / maxLines) * Math.PI * 2 + t * 0.15;
      const angle2 = angle1 + 0.4 + Math.sin(t * 0.5 + i) * 0.3;
      const r1 = 2.5 + Math.sin(t * 0.8 + i * 0.7) * 1.5;
      const r2 = 2.5 + Math.cos(t * 0.6 + i * 0.5) * 1.5;
      const yOff1 = Math.sin(t * 0.4 + i * 1.1) * 2;
      const yOff2 = Math.cos(t * 0.3 + i * 0.9) * 2;

      posArr[i6] = Math.cos(angle1) * r1;
      posArr[i6 + 1] = yOff1;
      posArr[i6 + 2] = Math.sin(angle1) * r1 - 2;
      posArr[i6 + 3] = Math.cos(angle2) * r2;
      posArr[i6 + 4] = yOff2;
      posArr[i6 + 5] = Math.sin(angle2) * r2 - 2;

      // Color gradient along the beam
      const brightness = 0.3 + Math.sin(t * 2 + i * 0.3) * 0.2;
      const isViolet = i % 3 === 0;
      const isCyan = i % 3 === 1;
      if (isViolet) {
        colArr[i6] = 0.486 * brightness; colArr[i6+1] = 0.227 * brightness; colArr[i6+2] = 0.929 * brightness;
        colArr[i6+3] = 0.486 * brightness; colArr[i6+4] = 0.227 * brightness; colArr[i6+5] = 0.929 * brightness;
      } else if (isCyan) {
        colArr[i6] = 0.133 * brightness; colArr[i6+1] = 0.827 * brightness; colArr[i6+2] = 0.929 * brightness;
        colArr[i6+3] = 0.133 * brightness; colArr[i6+4] = 0.827 * brightness; colArr[i6+5] = 0.929 * brightness;
      } else {
        colArr[i6] = 0.925 * brightness; colArr[i6+1] = 0.282 * brightness; colArr[i6+2] = 0.6 * brightness;
        colArr[i6+3] = 0.925 * brightness; colArr[i6+4] = 0.282 * brightness; colArr[i6+5] = 0.6 * brightness;
      }
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        linewidth={1}
      />
    </lineSegments>
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
      <OrbitalRings />
      <GlowingCore />
      <EnergyBeams />
    </Canvas>
  );
}
