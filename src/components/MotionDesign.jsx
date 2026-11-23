import { motion, useReducedMotion } from 'framer-motion';

/* ---------------------------------------------------------------------------
   Card3D — subtle 3D perspective container with configurable edge glow and
   depth shadow. Respects prefers-reduced-motion.
--------------------------------------------------------------------------- */
export function Card3D({
  children,
  className = '',
  rotateY = 0,
  glowColor = '#7C3AED',
  glowIntensity = 0.25,
  shadowDepth = 18,
}) {
  const reduced = useReducedMotion();
  const alpha = Math.round(Math.min(1, Math.max(0, glowIntensity)) * 255)
    .toString(16)
    .padStart(2, '0');

  return (
    <motion.div
      initial={reduced ? undefined : { rotateY }}
      whileHover={reduced ? undefined : { rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      style={{
        perspective: 1000,
        boxShadow: `0 ${shadowDepth}px ${shadowDepth * 2}px -12px ${glowColor}${alpha}`,
      }}
      className={`rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   HorizontalCarousel — responsive horizontal snap carousel for Quick View cards
--------------------------------------------------------------------------- */
export function HorizontalCarousel({ items = [], itemWidth = 320, gap = 20, className = '' }) {
  return (
    <div
      className={`flex snap-x snap-mandatory overflow-x-auto pb-4 ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{ minWidth: `${itemWidth}px`, maxWidth: `${itemWidth}px` }}
          className="snap-start shrink-0"
        >
          <Card3D glowColor={item.glowColor || '#7C3AED'} glowIntensity={0.28} shadowDepth={16} className="h-full">
            <div className="glass-card flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-violet/40">
              {item.content}
            </div>
          </Card3D>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   DepthStack — layered card stack wrapper
--------------------------------------------------------------------------- */
export function DepthStack({ children, className = '' }) {
  return <div className={`relative ${className}`}>{children}</div>;
}
