import { lazy, Suspense, useEffect } from 'react';
import { ViewProvider } from './context/ViewContext.jsx';
import { SectionGate } from './components/ui.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Intro from './components/Intro.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import CinematicBackground from './components/CinematicBackground.jsx';
import Navbar from './components/Navbar.jsx';
import ScrollRail from './components/ScrollRail.jsx';
import { initSmoothScroll } from './lib/smoothScroll.js';

import Hero from './components/Hero.jsx';
import About from './components/About.jsx';

// Below-the-fold sections & secondary widgets are code-split so initial JS
// parses & executes much faster while keeping the entire experience identical.
const StatsCounter = lazy(() => import('./components/StatsCounter.jsx'));
const TechMarquee = lazy(() => import('./components/TechMarquee.jsx'));
const Skills = lazy(() => import('./components/Skills.jsx'));
const SkillRadar = lazy(() => import('./components/SkillRadar.jsx'));
const ProjectTimeline = lazy(() => import('./components/ProjectTimeline.jsx'));
const Experience = lazy(() => import('./components/Experience.jsx'));
const GitHubFeed = lazy(() => import('./components/GitHubFeed.jsx'));
const Projects = lazy(() => import('./components/Projects.jsx'));
const ActivityHeatmap = lazy(() => import('./components/ActivityHeatmap.jsx'));
const Hackathons = lazy(() => import('./components/Hackathons.jsx'));
const Testimonials = lazy(() => import('./components/Testimonials.jsx'));
const Certifications = lazy(() => import('./components/Certifications.jsx'));
const YouTubeSection = lazy(() => import('./components/YouTubeSection.jsx'));
const NotesSection = lazy(() => import('./components/NotesSection.jsx'));
const ResumeQR = lazy(() => import('./components/ResumeQR.jsx'));
const Contact = lazy(() => import('./components/Contact.jsx'));
const Footer = lazy(() => import('./components/Footer.jsx'));
const Chatbot = lazy(() => import('./components/Chatbot.jsx'));
const NotFound = lazy(() => import('./components/NotFound.jsx'));

function SmoothScroll() {
  useEffect(() => {
    initSmoothScroll();
  }, []);
  return null;
}

function Site() {
  // SPA-without-router: handle /demo routes + 404
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : '';

  if (path !== '') {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  return (
    <>
      {/* Intro plays once on page load (~1.2s), self-removes; click to skip */}
      <Intro />
      {/* Accent cursor ring — desktop (fine pointer) only, native cursor stays */}
      <CustomCursor />

      <a href="#about" className="skip-link">
        Skip to content
      </a>

      {/* Lenis smooth scrolling (skipped for reduced-motion users) */}
      <SmoothScroll />

      {/* Top scroll progress bar + right section dot-rail */}
      <ScrollRail />

      {/* Full-page cinematic neural-network backdrop (sits behind all content) */}
      <CinematicBackground />

      <Navbar />

      <main id="main">
        <Hero />
        <About />
        <Suspense fallback={null}>
          <StatsCounter />
          <TechMarquee />
          <Skills />
          <SkillRadar />
          <ProjectTimeline />

          {/* These sections are hidden in Quick View (recruiter toggle) —
              SectionGate fades them out when switching to 'quick' */}
          <SectionGate>
            <Experience />
          </SectionGate>
          {/* ErrorBoundary: a malformed GitHub API payload degrades this section
              only — it can never crash the whole page */}
          <SectionGate>
            <ErrorBoundary>
              <GitHubFeed />
            </ErrorBoundary>
          </SectionGate>

          <Projects />

          <SectionGate>
            <ActivityHeatmap />
          </SectionGate>

          <SectionGate>
            <Hackathons />
          </SectionGate>

          <SectionGate>
            <Testimonials />
          </SectionGate>
          <SectionGate>
            <Certifications />
          </SectionGate>
          <SectionGate>
            <YouTubeSection />
          </SectionGate>
          <SectionGate>
            <NotesSection />
          </SectionGate>

          <SectionGate>
            <section className="relative overflow-hidden py-20 sm:py-24 print:hidden" aria-label="Resume">
              <div className="container-x relative">
                <div className="flex flex-col items-center text-center">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-cyan/90">
                    13 &middot; Resume
                  </span>
                  <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
                    Quick resume scan <span className="text-gradient">.</span>
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
                    Scan the QR code to download my resume, or click the button in the navbar.
                  </p>
                </div>
                <div className="mt-10 flex justify-center">
                  <ResumeQR />
                </div>
              </div>
            </section>
          </SectionGate>

          <Contact />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />

        {/* Floating "Ask Me Anything" AI chatbot */}
        <Chatbot />
      </Suspense>

      {/* Global texture layers for depth */}
      <div className="noise-overlay pointer-events-none fixed inset-0 z-[5]" aria-hidden="true" />
    </>
  );
}

export default function App() {
  return (
    <ViewProvider>
      <Site />
    </ViewProvider>
  );
}
