import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { socials } from '../data/content.js';
import { Reveal, SectionHeading } from './ui.jsx';

/* ---------------------------------------------------------------------------
   YouTube embed (Feature #10).
   Set YOUTUBE_VIDEO_ID below to your best/latest video to embed the player
   (lazy-loads only when scrolled into view). While it's null the section
   renders a styled channel card instead — never a broken iframe.
--------------------------------------------------------------------------- */

// Featured video — https://www.youtube.com/watch?v=PjY83JQadJE
// (change this ID any time to feature a different video)
const YOUTUBE_VIDEO_ID = 'PjY83JQadJE';

export default function YouTubeSection() {
  const frameRef = useRef(null);
  const inView = useInView(frameRef, { once: true, margin: '250px' });
  const [mountIframe, setMountIframe] = useState(false);

  // Lazy-load: only create the iframe once the frame is near the viewport
  useEffect(() => {
    if (inView && YOUTUBE_VIDEO_ID) setMountIframe(true);
  }, [inView]);

  return (
    <section id="youtube" className="relative overflow-hidden py-24 sm:py-28 print:hidden" aria-label="YouTube channel">
      <div className="aura left-1/4 top-0 h-[300px] w-[520px] bg-accent-violet/50" aria-hidden="true" />

      <div className="container-x relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div>
            <SectionHeading
              index={9}
              eyebrow="YouTube"
              title="I share what I'm building on YouTube"
              lead="Build logs, AI experiments and lessons from shipping real projects — documented in public."
            />
            <Reveal delay={0.15}>
              <a
                href={socials.youtube.href}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost mt-7 !px-6 !py-2.5"
              >
                <Play size={15} strokeWidth={2} />
                youtube.com/@aiwithzuhaib
                <ArrowUpRight size={14} strokeWidth={2.2} />
              </a>
            </Reveal>
          </div>

          {/* Glass video frame */}
          <Reveal delay={0.1}>
            <div ref={frameRef} className="glass-card--border-gradient glass-card overflow-hidden rounded-3xl p-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-base/70">
                {YOUTUBE_VIDEO_ID && mountIframe ? (
                  /* Sandbox per embed: playback + fullscreen presentation,
                     without top-navigation or popups from the player UI. */
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`}
                    title="Latest video from AI with Zuhaib"
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    loading="lazy"
                  />
                ) : (
                  /* Placeholder until a video ID is set — links out to the channel */
                  <a
                    href={socials.youtube.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group absolute inset-0 grid place-items-center"
                    aria-label="Visit the AI with Zuhaib YouTube channel"
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18),transparent_70%)]" />
                    <span className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-accent-diag text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                      <Play size={28} className="ml-1" strokeWidth={2} fill="currentColor" />
                    </span>
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
