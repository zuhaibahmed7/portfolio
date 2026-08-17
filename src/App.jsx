import { ViewProvider } from './context/ViewContext.jsx';
import { SectionGate } from './components/ui.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Intro from './components/Intro.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Experience from './components/Experience.jsx';
import GitHubFeed from './components/GitHubFeed.jsx';
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

function Site() {
  // SPA-without-router 404: any path other than "/" renders the themed
  // not-found page (hosts with SPA fallbacks always serve index.html).
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

      <Navbar />

      <main id="main">
        <Hero />
        <About />
        <Skills />

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
