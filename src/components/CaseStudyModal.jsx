import Modal from './Modal.jsx';
import ArchitectureDiagram from './ArchitectureDiagram.jsx';
import { socials } from '../data/content.js';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

/* ---------------------------------------------------------------------------
   ResearchPilot Case Study (Feature #7) — narrative deep-dive opened via
   "Read full case study" on the featured project card.
   Pull-quote-style section headers, the architecture diagram inline, and an
   honest "what I'd improve next" reflection (recruiters love that).
--------------------------------------------------------------------------- */

const SECTIONS = [
  {
    title: 'The Problem',
    body: [
      'Manual research is slow, unreliable, and hard to verify. You paste a question into a search box, open ten tabs, skim abstracts, and still can\u2019t be sure you covered the space — citations get lost, gaps go unnoticed, and the final write-up depends entirely on the researcher\u2019s stamina.',
      'The Microsoft Agents League Hackathon (Reasoning Agents track) asked for exactly this: autonomous systems that reason over research questions instead of just retrieving documents. That\u2019s the gap ResearchPilot was built to close.',
    ],
  },
  {
    title: 'The Approach',
    body: [
      'One big model call can answer a question — but it can\u2019t check itself. So ResearchPilot is architected as a pipeline of four specialised agents, each with a single job:',
      'The Planner decomposes the question into sub-queries. The Researcher retrieves sourced evidence for each one. The Critic scores coverage and confidence. The Synthesizer assembles everything into a structured, cited report.',
      'This is a systems-design choice, not a gimmick: separating roles makes each step testable, lets the pipeline intervene exactly where quality drops, and keeps every claim traceable to a source.',
    ],
  },
  {
    title: 'The Challenge',
    body: [
      'The hard part was the self-critique loop. After the Researcher gathers evidence, the Critic asks: what\u2019s missing? Which sub-questions still have low confidence?',
      'If confidence falls below threshold, the pipeline doesn\u2019t just push forward and hope — it generates new sub-queries and loops back into research. That mechanism is what turns a fancy autocomplete into a system you can actually trust for coverage.',
    ],
  },
  {
    title: 'The Result',
    body: [
      'A real-time streaming experience: FastAPI + Server-Sent Events push live pipeline progress to the browser, so you watch each agent think — plan, retrieve, critique, synthesise — as it happens.',
      'The whole system is containerized with Docker and deployed on Hugging Face Spaces, running against GitHub Models for inference. Not a demo video — a live system you can use right now.',
    ],
  },
  {
    title: 'What I\u2019d improve next',
    body: [
      'Two things are at the top of the list: source-diversity scoring, so the Critic doesn\u2019t just check coverage but also whether evidence comes from a healthy mix of origins — and caching repeated sub-queries, since overlapping research questions currently re-fetch identical evidence.',
    ],
  },
];

export default function CaseStudyModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ResearchPilot — Case Study"
      subtitle="How a 4-agent reasoning system researches, self-critiques and writes cited reports"
      wide
    >
      <div className="space-y-9">
        {SECTIONS.map((s, si) => (
          <section key={s.title} className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,4fr)]">
            {/* Pull-quote-style header with gradient accent bar */}
            <h4 className="relative pl-5 font-display text-xl font-bold leading-tight text-ink">
              <span className="absolute left-0 top-1 h-[calc(100%-8px)] w-1 rounded-full bg-gradient-to-b from-accent-violet to-accent-cyan" aria-hidden="true" />
              <span className="font-mono text-xs font-normal text-muted">{String(si + 1).padStart(2, '0')}</span>
              <br />
              {s.title}
            </h4>
            <div className="space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {/* Embed the architecture diagram inside the Approach section */}
              {si === 1 && <ArchitectureDiagram variant="researchpilot" className="pt-3" />}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap gap-3 border-t border-white/[0.07] pt-5">
          <a
            href={socials.huggingface.href}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-primary !px-6 !py-2.5"
          >
            Try it live
            <ArrowUpRight size={15} strokeWidth={2.2} />
          </a>
          <a
            href={socials.github.href}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost !px-6 !py-2.5"
          >
            View source on GitHub
            <ChevronRight size={15} />
          </a>
        </div>
      </div>
    </Modal>
  );
}
