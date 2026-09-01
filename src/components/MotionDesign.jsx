import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, AnimatePresence } from 'framer-motion';

/* ---------------------------------------------------------------------------
   Card3D — a rounded rectangular card that moves through 3D space.
   Accepts rotation, position, and glow props for complex animations.
--------------------------------------------------------------------------- */
export function Card3D({
  children,
  className = '',
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  x = 0,
  y = 0,
  z = 0,
  scale = 1,
  glowColor = '#7C3AED',
  glowIntensity = 0,
  shadowDepth = 20,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
      animate={{
        opacity: 1,
        scale,
        rotateX,
        rotateY,
        rotateZ,
        x,
        y,
        z,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative rounded-3xl ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        boxShadow: `
          0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0,0,0,0.4),
          0 ${shadowDepth / 2}px ${shadowDepth}px rgba(0,0,0,0.3),
          ${glowIntensity > 0 ? `0 0 ${glowIntensity * 30}px ${glowColor}${Math.round(glowIntensity * 60).toString(16).padStart(2, '0')}` : ''}
        `,
      }}
    >
      {/* Edge glow overlay */}
      {glowIntensity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            border: `1px solid ${glowColor}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')}`,
            boxShadow: `inset 0 0 ${glowIntensity * 20}px ${glowColor}20`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   FanCards — a group of cards that fan out from a central point.
   Like spreading a deck of cards with elegant rotation offsets.
--------------------------------------------------------------------------- */
export function FanCards({
  cards,
  className = '',
  fanAngle = 8,
  spread = 120,
  hoverScale = 1.05,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{ perspective: 1200 }}
    >
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {cards.map((card, i) => {
          const offset = i - (cards.length - 1) / 2;
          const rotation = offset * fanAngle;
          const xPos = offset * spread;
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              key={card.id || i}
              initial={{ opacity: 0, rotateY: -90, x: 0, scale: 0.6 }}
              animate={isInView ? {
                opacity: 1,
                rotateY: isHovered ? 0 : rotation,
                x: isHovered ? 0 : xPos,
                scale: isHovered ? hoverScale : 1,
                z: isHovered ? 100 : 0,
              } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="absolute"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center bottom',
              }}
            >
              <div className="glass-card rounded-2xl p-6 transition-shadow duration-300 hover:shadow-glow">
                {card.content}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   HorizontalCarousel — smooth horizontal scroll section with snap points.
   Creates a premium scrolling experience like Apple's product pages.
--------------------------------------------------------------------------- */
export function HorizontalCarousel({
  items,
  className = '',
  itemWidth = 350,
  gap = 24,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = itemWidth + gap;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto pb-4 scrollbar-hide"
        style={{
          gap: `${gap}px`,
          scrollPaddingInline: '1rem',
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex-none snap-center"
            style={{ width: itemWidth }}
          >
            <Card3D
              glowColor={item.glowColor || '#7C3AED'}
              glowIntensity={0.3}
              shadowDepth={16}
              className="h-full"
            >
              <div className="p-6">{item.content}</div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`pointer-events-auto rounded-full border border-white/10 bg-[#0a0a0f]/80 p-3 backdrop-blur transition-all duration-300 ${
            canScrollLeft ? 'hover:border-accent-violet/50 hover:shadow-glow' : 'opacity-0'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 4L6 8L10 12" />
          </svg>
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`pointer-events-auto rounded-full border border-white/10 bg-[#0a0a0f]/80 p-3 backdrop-blur transition-all duration-300 ${
            canScrollRight ? 'hover:border-accent-violet/50 hover:shadow-glow' : 'opacity-0'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4L10 8L6 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   ParallaxCard — card with depth-based parallax on scroll.
   Inner elements move at different speeds creating a 3D layered effect.
--------------------------------------------------------------------------- */
export function ParallaxCard({
  children,
  className = '',
  intensity = 30,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [intensity, -intensity]);
  const y2 = useTransform(scrollYProgress, [0, 1], [intensity * 0.5, -intensity * 0.5]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -5]);

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, transformStyle: 'preserve-3d' }}
      className={`relative overflow-hidden rounded-3xl ${className}`}
    >
      {/* Background layer (moves slowest) */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0"
      >
        <div className="h-full w-full bg-gradient-to-br from-accent-violet/20 to-accent-cyan/10" />
      </motion.div>

      {/* Content layer (moves faster) */}
      <motion.div
        style={{ y: y2, transformStyle: 'preserve-3d' }}
        className="relative p-6"
      >
        {children}
      </motion.div>

      {/* Edge glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      />
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
   DepthStack — a stack of cards with depth shadow layers.
   Creates a layered paper effect with increasing shadows.
--------------------------------------------------------------------------- */
export function DepthStack({
  cards,
  className = '',
  stackOffset = 8,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ perspective: 1000, minHeight: 400 }}
    >
      {cards.map((card, i) => {
        const offset = i - activeIndex;
        const isActive = i === activeIndex;

        return (
          <motion.div
            key={card.id || i}
            animate={{
              y: offset * stackOffset,
              scale: 1 - Math.abs(offset) * 0.05,
              rotateX: offset * -3,
              z: -Math.abs(offset) * 50,
              opacity: Math.abs(offset) > 2 ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={() => setActiveIndex(i)}
            className="absolute cursor-pointer"
            style={{
              transformStyle: 'preserve-3d',
              width: '85%',
              maxWidth: 500,
            }}
          >
            <div
              className="glass-card rounded-2xl p-6 transition-shadow duration-300"
              style={{
                boxShadow: `
                  0 ${4 + Math.abs(offset) * 4}px ${8 + Math.abs(offset) * 8}px rgba(0,0,0,${0.3 + Math.abs(offset) * 0.1}),
                  ${isActive ? '0 0 30px rgba(124,58,237,0.2)' : ''}
                `,
              }}
            >
              {card.content}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
