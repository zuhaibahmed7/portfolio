import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { learningByCategory, skillCategories } from '../data/content.js';

const CATEGORY_COLORS = ['#7C3AED', '#22D3EE', '#EC4899', '#A78BFA', '#67E8F9', '#F9A8D4', '#F5F5F7'];

const mouse = { x: 0, y: 0 };

function buildNodes() {
  const nodes = [];
  const total = skillCategories.length;
  skillCategories.forEach((cat, c) => {
    const color = CATEGORY_COLORS[c % CATEGORY_COLORS.length];
    const baseAngle = (c / total) * Math.PI * 2;

    const place = (skill, i, n, { radius, size }) => {
      const angle = baseAngle + (i - (n - 1) / 2) * 0.16;
      nodes.push({
        key: `${c}-${nodes.length}`,
        name: skill,
        cat: cat.name,
        color,
        size,
        position: [
          Math.cos(angle) * radius,
          (((i * 13 + c * 7) % 3) - 1) * 0.6,
          Math.sin(angle) * radius,
        ],
      });
    };

    const n = cat.skills.length;
    cat.skills.forEach((skill, i) =>
      place(skill, i, n, { radius: 2.7 + ((i * 37 + c * 11) % 4) * 0.38, size: 0.09 + ((i * 29 + c) % 3) * 0.025 })
    );
    (learningByCategory[cat.name] ?? []).forEach((skill, i) =>
      place(skill, i, n, { radius: 4.3 + ((i * 23) % 3) * 0.3, size: 0.055 })
    );
  });
  return nodes;
}

function Node({ node, hoveredKey, onHover }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const target = hoveredKey === node.key ? 2.1 : 1;
    ref.current.scale.setScalar(ref.current.scale.x + (target - ref.current.scale.x) * 0.18);
  });
  return (
    <mesh
      ref={ref}
      position={node.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(node);
      }}
      onPointerOut={() => onHover(null)}
    >
      <sphereGeometry args={[node.size, 12, 12]} />
      <meshBasicMaterial color={node.color} transparent opacity={0.9} />
    </mesh>
  );
}

function Galaxy({ hoveredKey, onHover }) {
  const group = useRef();
  const nodes = useMemo(buildNodes, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.06;
    // Base tilt faces the disc toward the camera; mouse adds parallax
    group.current.rotation.x += (0.85 + mouse.y * 0.12 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (mouse.x * -0.06 - group.current.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.85} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial color="#22D3EE" wireframe transparent opacity={0.25} />
      </mesh>
      {nodes.map((n) => (
        <Node key={n.key} node={n} hoveredKey={hoveredKey} onHover={onHover} />
      ))}
    </group>
  );
}

export default function SkillGalaxy() {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.8, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Galaxy hoveredKey={hovered?.key ?? null} onHover={setHovered} />
      </Canvas>

      <p
        className={`pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-base/70 px-4 py-1.5 font-mono text-[11px] backdrop-blur transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-60'
        }`}
      >
        {hovered ? (
          <>
            <span className="text-ink">{hovered.name}</span>
            <span className="text-muted"> · {hovered.cat}</span>
          </>
        ) : (
          <span className="text-muted">hover a node — every star is a tool</span>
        )}
      </p>

      <ul className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {skillCategories.map((cat, c) => (
          <li key={cat.name} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: CATEGORY_COLORS[c % CATEGORY_COLORS.length] }}
              aria-hidden="true"
            />
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
