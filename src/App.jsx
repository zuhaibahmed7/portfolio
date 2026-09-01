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
import StatsCounter from './components/StatsCounter.jsx';
import TechMarquee from './components/TechMarquee.jsx';
import Skills from './components/Skills.jsx';
import SkillRadar from './components/SkillRadar.jsx';
import ProjectTimeline from './components/ProjectTimeline.jsx';
import Experience from './components/Experience.jsx';
import GitHubFeed from './components/GitHubFeed.jsx';
import ActivityHeatmap from './components/ActivityHeatmap.jsx';
import ResumeQR from './components/ResumeQR.jsx';
import Projects from './components/Projects.jsx';
import Hackathons from './components/Hackathons.jsx';
import Testimonials from './components/Testimonials.jsx';
import Certifications from './components/Certifications.jsx';
import YouTubeSection from './components/YouTubeSection.jsx';
import NotesSection from './components/NotesSection.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import NotFound from './components/NotFound.jsx';

function SmoothScroll() {
  useEffect(() => {
    initSmoothScroll();
  }, []);
  return null;
}

function Site() {
  // SPA-without-router: handle /demo routes + 404
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : '';

  if (path !== '') return <NotFound />;

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
      </main>

      <Footer />

      {/* Floating "Ask Me Anything" AI chatbot */}
      <Chatbot />

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
