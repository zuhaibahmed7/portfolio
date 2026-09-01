import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/* ---------------------------------------------------------------------------
   ShimmerBorderCard — animated gradient border that rotates continuously.
   The border uses a conic gradient that spins, creating a shimmer effect.
--------------------------------------------------------------------------- */
export function ShimmerBorderCard({ children, className = '', colors = ['#7C3AED', '#22D3EE', '#EC4899'] }) {
  const reduced = useReducedMotion();

  return (
    <div className={`relative rounded-2xl p-[1px] ${className}`}>
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 rounded-2xl ${reduced ? '' : 'animate-spin-slow'}`}
        style={{
          background: `conic-gradient(from 0deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
          animation: reduced ? 'none' : 'spin 4s linear infinite',
        }}
      />
      {/* Inner content */}
      <div className="relative rounded-2xl bg-[#0a0a0f] p-6">
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   GlowCard — border glow that follows the cursor position.
   Uses a radial gradient mask to create a localized glow effect.
--------------------------------------------------------------------------- */
export function GlowCard({ children, className = '', glowColor = '#7C3AED' }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const glowBg = useTransform(
    [x, y],
    ([px, py]) =>
      `radial-gradient(300px circle at ${px * 100}% ${py * 100}%, ${glowColor}40, transparent 60%)`
  );

  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const onLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
    setHovered(false);
  }, [x, y]);

  if (reduced) {
    return <div className={`glass-card rounded-2xl p-6 ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden rounded-2xl ${className}`}
    >
      {/* Glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: glowBg, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}
      />
      {/* Border */}
      <div
        className="absolute inset-0 rounded-2xl border border-white/10"
        style={{
          borderColor: hovered ? `${glowColor}60` : undefined,
          transition: 'border-color 0.3s',
        }}
      />
      {/* Content */}
      <div className="relative rounded-2xl bg-[#0a0a0f]/90 p-6 backdrop-blur">
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SpringCard — cards that spring/bounce on hover with scale and rotation.
   Uses framer-motion spring physics for natural-feeling motion.
--------------------------------------------------------------------------- */
export function SpringCard({ children, className = '' }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      whileHover={reduced ? {} : { scale: 1.03, rotateX: -2, rotateY: 2 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card rounded-2xl p-6 ${className}`}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   GradientShiftCard — background gradient shifts and intensifies on hover.
   Creates a subtle color temperature change that draws attention.
--------------------------------------------------------------------------- */
export function GradientShiftCard({ children, className = '' }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${className}`}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.1), rgba(236,72,153,0.08))'
          : 'rgba(255,255,255,0.02)',
        borderColor: hovered ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.1), transparent 60%)',
          opacity: hovered ? 1 : 0,
        }}
      />
      {/* Content */}
      <div className="relative p-6">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   MagneticCard — card physically follows cursor with spring physics.
   Creates a magnetic/interactive feel similar to hover.dev's spring cards.
--------------------------------------------------------------------------- */
export function MagneticCard({ children, className = '', strength = 15 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(((e.clientX - centerX) / rect.width) * strength);
    y.set(((e.clientY - centerY) / rect.height) * strength);
  }, [x, y, strength]);

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduced) {
    return <div className={`glass-card rounded-2xl p-6 ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={`glass-card rounded-2xl p-6 transition-shadow duration-300 hover:shadow-glow ${className}`}
    >
      {children}
    </motion.div>
  );
}
