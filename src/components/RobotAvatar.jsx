import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

/* ---------------------------------------------------------------------------
   RobotAvatar — the vintage robot paper-doll.

   Desktop: fixed companion. Starts big & centered at the top (waves and says
   "hi" on load, head follows the cursor). On scroll it shrinks and glides to
   the robot's left (viewer's right) and fades out, handing over to the
   sitting scene (DockedRobot) that Hero anchors in the document beside the
   bio — tilted on a chair at a table, typing on a laptop whose screen glow
   flickers on his face — so it stops there and scrolls away with the hero.

   Mobile / reduced motion: static standing robot in normal flow.

   Performance optimizations:
   - Uses WebP slices (~93% smaller than PNG) with PNG <picture> fallback
   - Mounts only the active layout variant (desktop OR mobile, never both)
   - Coalesces pointermove to rAF and pauses listeners/blink/CSS animations
     whenever a rig is faded out or scrolled offscreen
--------------------------------------------------------------------------- */
const IMG = (n) => `${import.meta.env.BASE_URL}images/${n}?v=2`;

function RobotImg({ name, className = '', imgClassName = 'block h-full w-full', style, eager = false }) {
  return (
    <picture className={className} style={style}>
      <source srcSet={IMG(`${name}.webp`)} type="image/webp" />
      <img
        src={IMG(`${name}.png`)}
        alt=""
        draggable={false}
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        className={imgClassName}
      />
    </picture>
  );
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setDesktop(mq.matches);
    const onChange = (e) => setDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

function usePointerTracking(active, mx, my) {
  useEffect(() => {
    if (!active) return undefined;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    let winW = window.innerWidth || 1;
    let winH = window.innerHeight || 1;

    const onResize = () => {
      winW = window.innerWidth || 1;
      winH = window.innerHeight || 1;
    };
    const commit = () => {
      raf = 0;
      mx.set((lastX / winW) * 2 - 1);
      my.set((lastY / winH) * 2 - 1);
    };
    const onMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(commit);
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, mx, my]);
}

function useBlink(active) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (!active) {
      setBlink(false);
      return undefined;
    }
    let t1;
    let t2;
    const loop = () => {
      t1 = setTimeout(() => {
        setBlink(true);
        t2 = setTimeout(() => {
          setBlink(false);
          loop();
        }, 150);
      }, 2600 + Math.random() * 1600);
    };
    loop();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);
  return blink;
}

function Rig({ blink, talking, headStyle, reduced, paused }) {
  return (
    <div className={`relative w-full ${paused ? 'robot-paused' : ''}`} style={{ aspectRatio: '1024 / 1536' }}>
      {/* body base (movable parts erased, breathing) */}
      <RobotImg
        name="robot-body"
        eager
        className={`absolute inset-0 block h-full w-full ${reduced ? '' : 'robot-breathe'}`}
      />

      {/* antennas wobble behind the head */}
      <RobotImg
        name="robot-ant-l"
        eager
        className={`absolute block ${reduced ? '' : 'robot-ant robot-ant--l'}`}
        imgClassName="block h-auto w-full"
        style={{ left: '22%', top: '10.7%', width: '5.3%' }}
      />
      <RobotImg
        name="robot-ant-r"
        eager
        className={`absolute block ${reduced ? '' : 'robot-ant robot-ant--r'}`}
        imgClassName="block h-auto w-full"
        style={{ left: '72.7%', top: '10.7%', width: '5.3%' }}
      />

      {/* arms: the waving arm renders above the head so it never clips behind it */}
      <RobotImg
        name="robot-arm-l"
        eager
        className={`absolute block ${reduced ? '' : 'robot-arm robot-arm--l'}`}
        imgClassName="block h-auto w-full"
        style={{ left: '12.2%', top: '33.5%', width: '17.1%', zIndex: 6 }}
      />
      <RobotImg
        name="robot-arm-r"
        eager
        className={`absolute block ${reduced ? '' : 'robot-arm robot-arm--r'}`}
        imgClassName="block h-auto w-full"
        style={{ left: '70.7%', top: '33.5%', width: '17.1%' }}
      />

      {/* head follows the cursor; mouth says hi; eyelids blink */}
      <motion.div className="absolute" style={{ left: '23%', top: '6%', width: '54%', ...headStyle }}>
        <RobotImg name="robot-head" eager className="block h-full w-full" />
        <span className="robot-mouth" data-talking={talking || undefined} style={{ left: '35.8%', top: '83.8%', width: '27.4%', height: '7.6%' }} />
        <span className="robot-eyelid" data-closed={blink || undefined} style={{ left: '21.7%', top: '47.6%', width: '18%', height: '26%' }} />
        <span className="robot-eyelid" data-closed={blink || undefined} style={{ left: '59.6%', top: '47.6%', width: '18%', height: '26%' }} />
      </motion.div>
    </div>
  );
}

/* Sitting scene: chair + table + laptop. The head slice follows the cursor,
   the hand slices alternate in a typing bob, and the screen glow flickers on
   the face. Base image has those parts erased and filled. */
function LaptopScene({ tilt, blink, headStyle, paused }) {
  return (
    <motion.div
      className={`relative w-full ${tilt ? 'robot-type' : ''} ${paused ? 'robot-paused' : ''}`}
      style={{ aspectRatio: '1 / 1', rotate: tilt ?? 0 }}
    >
      <RobotImg name="robot-laptop-base" className="robot-laptop-fade block w-full" imgClassName="block h-auto w-full" />

      {/* typing hands bob alternately over the erased base */}
      <RobotImg
        name="robot-sit-hand-l"
        className="robot-hand--l absolute block"
        imgClassName="block h-auto w-full"
        style={{ left: '31.7%', top: '48.3%', width: '6.7%' }}
      />
      <RobotImg
        name="robot-sit-hand-r"
        className="robot-hand--r absolute block"
        imgClassName="block h-auto w-full"
        style={{ left: '61.5%', top: '48.3%', width: '6.9%' }}
      />

      {/* light spilling over the lid when he switches tabs */}
      <div className="robot-screenflash" style={{ left: '40%', top: '41.5%', width: '20%', height: '7%' }} />

      {/* head follows the cursor; eyelids blink; glow rides on the face */}
      <motion.div className="absolute" style={{ left: '35.6%', top: '5.4%', width: '27.9%', aspectRatio: '286 / 301', ...headStyle }}>
        <RobotImg name="robot-sit-head" className="block h-full w-full" />
        <span className="robot-eyelid" data-closed={blink || undefined} style={{ left: '20.8%', top: '68.7%', width: '17.9%', height: '19%', background: '#64879a' }} />
        <span className="robot-eyelid" data-closed={blink || undefined} style={{ left: '58.1%', top: '68.7%', width: '17.9%', height: '19%', background: '#64879a' }} />
        <div className="robot-glow" style={{ left: '20%', top: '64%', width: '60%', height: '32%' }} />
      </motion.div>
    </motion.div>
  );
}

/* Sitting scene anchored in the document beside the bio (Hero positions it).
   Fades in as the standing robot fades out, then scrolls away with the page
   like ordinary content instead of following the visitor to the footer. */
export function DockedRobot() {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [scrollVisible, setScrollVisible] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [560, 720], [0, 1]);

  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v >= 520;
    setScrollVisible((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    if (!isDesktop || reduced || !wrapRef.current) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px' }
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [isDesktop, reduced]);

  const active = isDesktop && !reduced && inView && scrollVisible;
  const blink = useBlink(active);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  usePointerTracking(active, mx, my);

  const tilt = useSpring(useTransform(mx, [-1, 1], [-1.5, 1.5]), { stiffness: 100, damping: 16 });
  const headStyle = {
    transformPerspective: 500,
    rotateY: useSpring(useTransform(mx, [-1, 1], [-12, 12]), { stiffness: 120, damping: 14 }),
    rotateX: useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 120, damping: 14 }),
    rotate: useSpring(useTransform(mx, [-1, 1], [-2, 2]), { stiffness: 120, damping: 14 }),
    x: useSpring(useTransform(mx, [-1, 1], ['-4%', '4%']), { stiffness: 120, damping: 14 }),
    y: useSpring(useTransform(my, [-1, 1], ['-2%', '3%']), { stiffness: 120, damping: 14 }),
  };

  if (reduced || !isDesktop) return null;
  return (
    <motion.div ref={wrapRef} style={{ opacity }} aria-hidden="true">
      <LaptopScene tilt={tilt} blink={blink} headStyle={headStyle} paused={!active} />
    </motion.div>
  );
}

export default function RobotAvatar() {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const mobileRef = useRef(null);
  const [talking, setTalking] = useState(false);
  const [standingHidden, setStandingHidden] = useState(false);
  const [mobileInView, setMobileInView] = useState(true);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v >= 580;
    setStandingHidden((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    if (isDesktop || reduced || !mobileRef.current) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setMobileInView(entry.isIntersecting),
      { rootMargin: '120px' }
    );
    io.observe(mobileRef.current);
    return () => io.disconnect();
  }, [isDesktop, reduced]);

  const active = !reduced && (isDesktop ? !standingHidden : mobileInView);
  const blink = useBlink(active);

  // cursor tracking → head follows (only while visible/active)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  usePointerTracking(active, mx, my);

  const headStyle = {
    transformPerspective: 500,
    rotateY: useSpring(useTransform(mx, [-1, 1], [-16, 16]), { stiffness: 120, damping: 14 }),
    rotateX: useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 120, damping: 14 }),
    rotate: useSpring(useTransform(mx, [-1, 1], [-3, 3]), { stiffness: 120, damping: 14 }),
    x: useSpring(useTransform(mx, [-1, 1], ['-6%', '6%']), { stiffness: 120, damping: 14 }),
    y: useSpring(useTransform(my, [-1, 1], ['-4%', '5%']), { stiffness: 120, damping: 14 }),
  };

  // "hi" window synced with the wave
  useEffect(() => {
    if (reduced) return undefined;
    const on = setTimeout(() => setTalking(true), 1800);
    const off = setTimeout(() => setTalking(false), 4600);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [reduced]);

  // scroll: shrink + glide to the robot's left (viewer right), then fade out —
  // the sitting scene (DockedRobot) is anchored in the document beside the bio
  const x = useSpring(useTransform(scrollY, [0, 600], ['0vw', '38vw']), { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(useTransform(scrollY, [0, 600], ['0vh', '38vh']), { stiffness: 60, damping: 20, mass: 0.6 });
  const scale = useSpring(useTransform(scrollY, [0, 600], [1, 0.55]), { stiffness: 60, damping: 20, mass: 0.6 });
  const standO = useTransform(scrollY, [420, 560], [1, 0]);

  if (reduced || !isDesktop) {
    return (
      <div ref={mobileRef} aria-hidden="true" className="pointer-events-none mx-auto w-[min(85vw,520px)] print:hidden">
        <div className="robot-crop w-full" style={{ aspectRatio: '1024 / 1536' }}>
          <Rig blink={blink} talking={talking} headStyle={reduced ? undefined : headStyle} reduced={!!reduced} paused={!active} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* desktop: spacer keeps the layout while the robot is fixed */}
      <div aria-hidden="true" className="hidden lg:block" style={{ height: 'calc(min(36vw, 520px) * 1.5)' }} />

      {/* desktop: fixed companion — stands at top, docks left-of-bio as a typer */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed left-1/2 top-[56px] z-[5] hidden w-[min(36vw,520px)] -translate-x-1/2 lg:block print:hidden ${
          standingHidden ? 'invisible' : ''
        }`}
      >
        <motion.div style={{ x, y, scale }}>
          <motion.div style={{ opacity: standO }}>
            <div className="robot-crop w-full" style={{ aspectRatio: '1024 / 1536' }}>
              <Rig blink={blink} talking={talking} headStyle={headStyle} reduced={false} paused={standingHidden} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
