import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/* ---------------------------------------------------------------------------
   RobotAvatar — the vintage robot paper-doll.

   Desktop: fixed companion. Starts big & centered at the top (waves and says
   "hi" on load, head follows the cursor). On scroll it shrinks and glides to
   the robot's left (viewer's right) and fades out, handing over to the
   sitting scene (DockedRobot) that Hero anchors in the document beside the
   bio — tilted on a chair at a table, typing on a laptop whose screen glow
   flickers on his face — so it stops there and scrolls away with the hero.

   Mobile / reduced motion: static standing robot in normal flow.

   Parts are transparent PNG slices of robot-cut.png; robot-body.png has the
   movable parts erased (shoulder caps kept) so nothing ghosts or holes.
--------------------------------------------------------------------------- */
const IMG = (n) => `${import.meta.env.BASE_URL}images/${n}?v=2`;

function Rig({ blink, talking, headStyle, reduced }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1024 / 1536' }}>
      {/* body base (movable parts erased, breathing) */}
      <img src={IMG('robot-body.png')} alt="" draggable={false} className={`absolute inset-0 h-full w-full ${reduced ? '' : 'robot-breathe'}`} />

      {/* antennas wobble behind the head */}
      <img src={IMG('robot-ant-l.png')} alt="" draggable={false} className={`absolute ${reduced ? '' : 'robot-ant robot-ant--l'}`} style={{ left: '22%', top: '10.7%', width: '5.3%' }} />
      <img src={IMG('robot-ant-r.png')} alt="" draggable={false} className={`absolute ${reduced ? '' : 'robot-ant robot-ant--r'}`} style={{ left: '72.7%', top: '10.7%', width: '5.3%' }} />

      {/* arms: the waving arm renders above the head so it never clips behind it */}
      <img src={IMG('robot-arm-l.png')} alt="" draggable={false} className={`absolute ${reduced ? '' : 'robot-arm robot-arm--l'}`} style={{ left: '12.2%', top: '33.5%', width: '17.1%', zIndex: 6 }} />
      <img src={IMG('robot-arm-r.png')} alt="" draggable={false} className={`absolute ${reduced ? '' : 'robot-arm robot-arm--r'}`} style={{ left: '70.7%', top: '33.5%', width: '17.1%' }} />

      {/* head follows the cursor; mouth says hi; eyelids blink */}
      <motion.div className="absolute" style={{ left: '23%', top: '6%', width: '54%', ...headStyle }}>
        <img src={IMG('robot-head.png')} alt="" draggable={false} className="h-full w-full" />
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
function LaptopScene({ tilt, blink, headStyle }) {
  return (
    <motion.div className={`relative w-full ${tilt ? 'robot-type' : ''}`} style={{ aspectRatio: '1 / 1', rotate: tilt ?? 0 }}>
      <img src={IMG('robot-laptop-base.png')} alt="" draggable={false} className="robot-laptop-fade w-full" />

      {/* typing hands bob alternately over the erased base */}
      <img src={IMG('robot-sit-hand-l.png')} alt="" draggable={false} className="robot-hand--l absolute" style={{ left: '31.7%', top: '48.3%', width: '6.7%' }} />
      <img src={IMG('robot-sit-hand-r.png')} alt="" draggable={false} className="robot-hand--r absolute" style={{ left: '61.5%', top: '48.3%', width: '6.9%' }} />

      {/* light spilling over the lid when he switches tabs */}
      <div className="robot-screenflash" style={{ left: '40%', top: '41.5%', width: '20%', height: '7%' }} />

      {/* head follows the cursor; eyelids blink; glow rides on the face */}
      <motion.div className="absolute" style={{ left: '35.6%', top: '5.4%', width: '27.9%', aspectRatio: '286 / 301', ...headStyle }}>
        <img src={IMG('robot-sit-head.png')} alt="" draggable={false} className="h-full w-full" />
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
  const [blink, setBlink] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [560, 720], [0, 1]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  useEffect(() => {
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my]);
  const tilt = useSpring(useTransform(mx, [-1, 1], [-1.5, 1.5]), { stiffness: 100, damping: 16 });
  const headStyle = {
    transformPerspective: 500,
    rotateY: useSpring(useTransform(mx, [-1, 1], [-12, 12]), { stiffness: 120, damping: 14 }),
    rotateX: useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 120, damping: 14 }),
    rotate: useSpring(useTransform(mx, [-1, 1], [-2, 2]), { stiffness: 120, damping: 14 }),
    x: useSpring(useTransform(mx, [-1, 1], ['-4%', '4%']), { stiffness: 120, damping: 14 }),
    y: useSpring(useTransform(my, [-1, 1], ['-2%', '3%']), { stiffness: 120, damping: 14 }),
  };

  useEffect(() => {
    if (reduced) return undefined;
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
  }, [reduced]);

  if (reduced) return null;
  return (
    <motion.div style={{ opacity }} aria-hidden="true">
      <LaptopScene tilt={tilt} blink={blink} headStyle={headStyle} />
    </motion.div>
  );
}

export default function RobotAvatar() {
  const reduced = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const [talking, setTalking] = useState(false);

  // cursor tracking → head follows
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  useEffect(() => {
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my]);
  const headStyle = {
    transformPerspective: 500,
    rotateY: useSpring(useTransform(mx, [-1, 1], [-16, 16]), { stiffness: 120, damping: 14 }),
    rotateX: useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 120, damping: 14 }),
    rotate: useSpring(useTransform(mx, [-1, 1], [-3, 3]), { stiffness: 120, damping: 14 }),
    x: useSpring(useTransform(mx, [-1, 1], ['-6%', '6%']), { stiffness: 120, damping: 14 }),
    y: useSpring(useTransform(my, [-1, 1], ['-4%', '5%']), { stiffness: 120, damping: 14 }),
  };

  // blink loop + "hi" window synced with the wave
  useEffect(() => {
    if (reduced) return undefined;
    let t1;
    let t2;
    const loop = () => {
      t1 = setTimeout(() => {
        setBlink(true);
        t2 = setTimeout(() => {
          setBlink(false);
          loop();
        }, 150);
      }, 2800 + Math.random() * 1400);
    };
    loop();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduced]);
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
  const { scrollY } = useScroll();
  const x = useSpring(useTransform(scrollY, [0, 600], ['0vw', '38vw']), { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(useTransform(scrollY, [0, 600], ['0vh', '38vh']), { stiffness: 60, damping: 20, mass: 0.6 });
  const scale = useSpring(useTransform(scrollY, [0, 600], [1, 0.55]), { stiffness: 60, damping: 20, mass: 0.6 });
  const standO = useTransform(scrollY, [420, 560], [1, 0]);

  const staticRobot = (
    <div aria-hidden="true" className="pointer-events-none mx-auto w-[min(85vw,520px)] print:hidden">
      <div className="robot-crop w-full" style={{ aspectRatio: '1024 / 1536' }}>
        <Rig blink={blink} talking={talking} headStyle={reduced ? undefined : headStyle} reduced={!!reduced} />
      </div>
    </div>
  );

  if (reduced) return staticRobot;

  return (
    <>
      {/* mobile: static standing robot in flow */}
      <div className="lg:hidden">{staticRobot}</div>

      {/* desktop: spacer keeps the layout while the robot is fixed */}
      <div aria-hidden="true" className="hidden lg:block" style={{ height: 'calc(min(36vw, 520px) * 1.5)' }} />

      {/* desktop: fixed companion — stands at top, docks left-of-bio as a typer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[56px] z-[5] hidden w-[min(36vw,520px)] -translate-x-1/2 lg:block print:hidden"
      >
        <motion.div style={{ x, y, scale }}>
          <motion.div style={{ opacity: standO }}>
            <div className="robot-crop w-full" style={{ aspectRatio: '1024 / 1536' }}>
              <Rig blink={blink} talking={talking} headStyle={headStyle} reduced={false} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
