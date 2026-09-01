import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/* -------------------------------------------------------------------
   CardTilt — wraps any card with a subtle 3D perspective tilt that
   follows the cursor, plus a cursor-tracking white glare on top and
   an accent-colored spotlight beneath the content. Uses framer-motion
   springs for smooth, jank-free animation. Respects reduced motion.
   No external dependencies.
------------------------------------------------------------------- */

export default function CardTilt({ children, className = '', intensity = 12 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [intensity, -intensity]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensity, intensity]), {
    stiffness: 200,
    damping: 20,
  });

  const glareBg = useTransform(
    [x, y],
    ([px, py]) => `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.14), transparent 55%)`
  );
  const spotBg = useTransform(
    [x, y],
    ([px, py]) =>
      `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(124,58,237,0.10), rgba(34,211,238,0.06) 45%, transparent 70%)`
  );

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setHovered(false);
  };

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: spotBg, opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease' }}
      />
      {children}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        style={{ background: glareBg, opacity: hovered ? 1 : 0, transition: 'opacity 0.35s ease' }}
      />
    </motion.div>
  );
}
