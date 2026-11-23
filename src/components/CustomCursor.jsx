import { useEffect, useRef, useState } from 'react';

/**
 * Custom cursor accent: a small gradient dot glued to the pointer plus a larger
 * lagging ring that "eases" behind it (linear interpolation in a rAF loop).
 * The ring scales up over interactive elements (a / button / [data-hover]).
 * Only enabled for fine pointers (desktop) without reduced-motion preference;
 * the native cursor is intentionally kept visible for usability.
 *
 * Performance optimizations:
 * - Avoids reading offsetWidth inside rAF (eliminates 60Hz forced reflows)
 * - Auto-pauses rAF loop once the ring catches up to the cursor
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return undefined;
    setEnabled(true);

    // Mutable target/current positions shared by the rAF loop
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let ringHalf = 18; // 36px / 2 default; 28 when hovering (56px / 2)
    let raf = 0;

    const loop = () => {
      const dx = target.x - ring.x;
      const dy = target.y - ring.y;
      ring.x += dx * 0.16;
      ring.y += dy * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - ringHalf}px, ${ring.y - ringHalf}px, 0)`;
      }
      if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x - 4}px, ${target.y - 4}px, 0)`;
      }
      wake();
    };

    // Grow the ring when entering links/buttons via event delegation
    const onOver = (e) => {
      const hovering = !!e.target.closest('a, button, [data-hover]');
      const nextHalf = hovering ? 28 : 18;
      if (nextHalf === ringHalf) return;
      ringHalf = nextHalf;
      if (ringRef.current) {
        ringRef.current.style.width = hovering ? '56px' : '36px';
        ringRef.current.style.height = hovering ? '56px' : '36px';
        ringRef.current.style.borderColor = hovering
          ? 'rgba(34,211,238,0.9)'
          : 'rgba(124,58,237,0.55)';
      }
      wake();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 rounded-full border transition-[width,height,border-color] duration-200 will-change-transform print:hidden"
        style={{ borderColor: 'rgba(124,58,237,0.55)' }}
      />
      {/* Center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] h-2 w-2 rounded-full bg-gradient-accent will-change-transform print:hidden"
      />
    </>
  );
}
