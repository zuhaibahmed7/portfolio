// ---------------------------------------------------------------------------
// Central content file — ALL site copy lives here (single source of truth).
// Copy is taken verbatim from the provided data sheet; do not fabricate facts.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Zuhaib Ahmed',
  firstName: 'Zuhaib',
  lastName: 'Ahmed',
  title: 'AI Engineer / Data Scientist / AI & Full-Stack Developer',
  location: "Khairpur Mir's, Sindh, Pakistan (Karachi Division)",
  email: 'zuhaibmahar234@gmail.com',
  phone: '+92-327-3302678',
  phoneHref: '+923273302678',
  summary:
    'AI Engineer and Data Scientist with a strong foundation in machine learning, statistical analysis, and full-stack development. I build and deploy real AI systems end-to-end — from model training and backend architecture to containerized, production-ready deployment. My current focus is agentic AI: designing multi-agent LLM pipelines that plan, research, self-critique, and synthesize, rather than relying on single-prompt wrappers. Equal parts data scientist and systems builder, I care as much about whether something ships cleanly as whether it works in a notebook.',
  bio: "I'm a Computer Software Engineering student, passionate about AI, Machine Learning, and full-stack development. I spend my time building AI-powered applications, training ML models, and shipping them with clean interfaces and real deployment. Currently deepening my skills in AI, Deep Learning, and MLOps. My goal is to become an AI/ML engineer who doesn't just build models — but builds products that actually work in the real world.",
};

// Rotating typewriter roles in the Hero
export const roles = [
  'AI Engineer',
  'Data Scientist',
  'Full-Stack Developer',
  'Multi-Agent Systems Builder',
];

export const socials = {
  github: { label: 'GitHub', href: 'https://github.com/zuhaibahmed7' },
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/zuhaib-ahmed-69951a39a' },
  youtube: { label: 'YouTube', href: 'https://www.youtube.com/@aiwithzuhaib' },
  huggingface: {
    label: 'Hugging Face',
    href: 'https://huggingface.co/spaces/zuhaibahmed7/researchpilot',
  },
  instagram: { label: 'Instagram', href: 'https://www.instagram.com/aiwithzuhaib/' },
  x: { label: 'X (Twitter)', href: 'https://x.com/ZohaibAhmedMah2' },
  facebook: {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1C6SUjEjxX/',
  },
  kaggle: { label: 'Kaggle', href: 'https://www.kaggle.com/zuhaib123' },
  hackerrank: { label: 'HackerRank', href: 'https://www.hackerrank.com/profile/shoaibmahar347' },
  replit: { label: 'Replit', href: 'https://replit.com/@zuhaibmahar234' },
  lovable: { label: 'Lovable', href: 'https://lovable.dev/@zulodro_z' },
  leetcode: { label: 'LeetCode', href: 'https://leetcode.com/u/zuhaibahmed347/' },
};

export const education = {
  school: 'Sukkur IBA University',
  location: 'Sukkur, Pakistan',
  degree: 'Bachelor of Science in Computer Software Engineering',
  period: '2024 – Present',
  now: 'Currently deepening skills in AI, Deep Learning, and MLOps.',
};

export const skillCategories = [
  {
    name: 'Programming Languages',
    icon: 'code',
    skills: ['Python', 'C++', 'Java', 'JavaScript'],
  },
  {
    name: 'Agentic AI & LLMs',
    icon: 'bot',
    skills: [
      'Multi-Agent Systems',
      'Reasoning Pipelines',
      'Prompt Engineering',
      'OpenAI SDK',
      'GitHub Models (GPT-4o/GPT-4o-mini)',
      'LLM Orchestration',
      'Server-Sent Events (SSE)',
    ],
  },
  {
    name: 'Data Science & ML',
    icon: 'brain',
    skills: [
      'Machine Learning',
      'Statistical Data Analysis',
      'TensorFlow',
      'Keras',
      'Matplotlib',
      'Seaborn',
      'Pandas',
      'NumPy',
      'Scikit-learn',
      'Deep Learning (CNN)',
      'Model Training & Evaluation',
    ],
  },
  {
    name: 'Web & Backend',
    icon: 'server',
    skills: [
      'FastAPI',
      'Uvicorn',
      'React 19',
      'React Router',
      'Context API',
      'Django',
      'HTML5',
      'CSS',
      'Tailwind CSS',
      'Streamlit',
    ],
  },
  {
    name: 'DevOps & Deployment',
    icon: 'container',
    skills: [
      'Docker',
      'Docker Desktop',
      'Containerization',
      'Hugging Face Spaces',
      'Image Building',
      'Port Mapping',
      'Container Deployment',
    ],
  },
  {
    name: 'Databases & Tools',
    icon: 'database',
    skills: ['SQL', 'Git', 'GitHub', 'Google Cloud', 'Google Gemini', 'API Integration', 'Microsoft Office'],
  },
  {
    name: 'Concepts & Design',
    icon: 'design',
    skills: ['OOP', 'Data Structures', 'Tkinter', 'Figma (UI/UX)', 'Prototyping', 'Wireframing', 'Color Theory'],
  },
];

// Two-tier skill indicators: "core" (filled dot) vs "actively learning"
// (outlined dot, dashed pill) — deliberately understated, no percentage bars.
export const learningByCategory = {
  'Agentic AI & LLMs': ['RAG', 'AI Evals', 'LLM Security', 'Agent Memory'],
  'DevOps & Deployment': ['MLOps'],
};

// Site maintenance badge (Footer)
export const siteLastUpdated = 'Aug 2026'; // TODO: update this date manually when making meaningful content changes

// Awards — rendered above course certifications (recruiters weight them higher)
export const awards = [
  {
    title: 'SEEF Sindh Government Scholarship',
    issuer: 'Sindh Education Endowment Fund (Government of Sindh)',
    date: 'July',
    tag: 'Merit- & Need-Based Award',
  },
];

export const certifications = [
  {
    title: 'Google Cloud Gen AI Academy APAC Edition (Cohort 1)',
    issuer: 'Hack2Skill',
    date: 'Apr 2026',
    credentialId: '2026H2S04GCGENAIAPACC1-P00917',
  },
  { title: 'Intro to Machine Learning', issuer: 'Kaggle', date: 'Apr 2026' },
  { title: 'Claude 101', issuer: 'Anthropic', date: 'Mar 2026', credentialId: 'qagzx8ygpkae' },
  { title: 'Maximize Productivity With AI Tools', issuer: 'Google via Coursera', date: 'Jul 2025' },
  { title: 'Introduction to SQL', issuer: 'DataCamp', date: 'Feb 2026' },
  {
    title: 'Agents League – Reasoning Agents',
    issuer: 'Global AI Community',
    date: 'Jul 2026',
    credentialId: '973a7853-ae4a-4c5c-81ee-3cd7a55a22f8',
  },
  {
    title: 'Build Small — Certificate of Participation',
    issuer: 'Hugging Face × Gradio',
    date: 'Jun 2026',
  },
];

export const projects = [
  {
    id: 'researchpilot',
    title: 'ResearchPilot',
    subtitle: 'Multi-Agent Autonomous Research System',
    featured: true,
    tech: ['Python', 'GitHub Models', 'FastAPI', 'OpenAI SDK', 'SSE', 'Docker'],
    bullets: [
      'Built a multi-agent AI reasoning system (Microsoft Agents League Hackathon, Reasoning Agents track) that autonomously decomposes research questions, retrieves sourced evidence, self-critiques coverage, and synthesizes structured reports with citations.',
      'Architected a 4-agent pipeline — Planner, Researcher, Critic, Synthesizer — using the OpenAI Python SDK against the GitHub Models free inference endpoint.',
      'Implemented a self-critique re-research loop: the Critic agent detects knowledge gaps and triggers additional research when confidence falls below threshold.',
      'Real-time web frontend using FastAPI + Server-Sent Events (SSE) streaming live pipeline progress; deployed on Hugging Face Spaces via Docker.',
    ],
    demo: socials.huggingface.href,
  },
  {
    id: 'agrovision',
    title: 'AgroVision',
    subtitle: 'AI Plant Disease Prediction System',
    tech: ['Python', 'TensorFlow', 'Streamlit', 'Docker'],
    bullets: [
      'End-to-end AI web app predicting plant diseases from leaf images using a CNN trained on 54,000+ images across 38 disease classes; 88% validation accuracy, 98% training accuracy.',
      'Interactive Streamlit interface for real-time image upload, preprocessing (224x224 resize, normalization), and instant prediction; containerized with Docker.',
    ],
  },
  {
    id: 'canteen',
    title: 'Canteen Token / Order Queue System',
    subtitle: 'Web-based queue system for Sukkur IBA University',
    tech: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript', 'XAMPP'],
    bullets: [
      'Web-based canteen token and order queue system for Sukkur IBA University, replacing manual queuing.',
      'Three-Tier Architecture (Presentation, Business Logic, Data) with role-based access for Customer, Staff, and Admin.',
      'Automatic sequential token generation, FIFO queue with real-time tracking, order status lifecycle, live notifications.',
      'Applied Singleton, Factory, and Observer design patterns; full SDA documentation (Use Case, Class, Sequence, Activity, State UML diagrams).',
    ],
  },
  {
    id: 'fitwise',
    title: 'FitWise',
    subtitle: 'AI-Powered Fitness Assistant',
    tech: ['Python', 'AI', 'Data Analysis'],
    bullets: [
      'Fitness app generating customized workout plans based on fitness level, goals, and equipment; AI-driven healthcare advice and a weight-tracking visualization interface.',
    ],
  },
  {
    id: 'movie',
    title: 'Movie Discovery App',
    subtitle: 'Search, favorites & persistence',
    tech: ['React 19', 'React Router', 'Context API', 'LocalStorage'],
    bullets: [
      'Movie discovery web app with real-time search, add/remove favorites, and persistence via LocalStorage + Context API.',
    ],
  },
  {
    id: 'scriptflow',
    title: 'ScriptFlow AI',
    subtitle: 'Video Script Generator',
    tech: ['Python', 'AI', 'API Integration'],
    bullets: [
      'AI-powered video script generator producing platform-aware scripts with hooks, scenes, and CTAs for YouTube, TikTok, Instagram, and Ads in under 30 seconds.',
    ],
  },
  {
    id: 'taskmanager',
    title: 'Task Management App with GUI',
    subtitle: 'Desktop productivity app',
    tech: ['Python', 'Tkinter', 'OOP'],
    bullets: [
      'Desktop task management app with add/update/delete/view features, built with OOP principles.',
    ],
  },
];

export const interests = [
  'Data Science & Machine Learning',
  'Agentic AI & Multi-Agent Systems',
  'Generative AI & LLMs',
  'Full-stack Development (Python, React, SQL)',
  'DevOps & Containerization',
  'User-centered Design and Analytics',
];

// "What I'm doing now" items (Feature #9)
export const nowItems = [
  'Deepening LLM Engineering — context windows, tool use, and agent orchestration patterns',
  'Studying RAG (Retrieval-Augmented Generation) — chunking strategies, embeddings, and retrieval evaluation',
  'Exploring AI evals — building test sets to measure agent reliability, not just vibes-based testing',
  'Learning AI/LLM security — prompt injection, jailbreak resistance, and safe tool-calling design',
  'Building memory systems for agents — short-term context vs. long-term persistent memory',
  'Continuing BS in Computer Software Engineering at Sukkur IBA University',
];
export const nowUpdated = 'Aug 2026'; // TODO: update this date whenever the "now" items change

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Paid booking system config — single source of truth (imported by BOTH the
// client BookingFlow and the server /api/bookings handlers).
// Availability window is 10:00 PM - 1:00 AM Pakistan Time (UTC+5, no DST).
// A "session date" is the date the window OPENS: its 00:00/00:30 slots belong
// to the NEXT calendar day but are stored under the opening date.
// ---------------------------------------------------------------------------
export const bookingConfig = {
  windowStartHourPKT: 22, // 10:00 PM PKT
  windowEndHourPKT: 25,   // 1:00 AM next day (24 + 1)
  slotMinutes: 30,
  maxDaysAhead: 14,       // date picker horizon
  blockPKR: 5000,         // per 30-minute block
  blockUSD: 18,           // approximate, per 30-minute block
  holdMinutes: 15,        // slot hold while completing payment
};

// Paid consultation pricing & payment methods (Book a Call modal).
// Payoneer settles in USD, the bank account in PKR — each method shows its
// OWN currency (a single converted price for both would be inaccurate).
// TODO: update the USD estimates if the ~278 PKR/USD rate drifts significantly.
// ---------------------------------------------------------------------------
export const paymentDetails = {
  payoneer: {
    label: 'Payoneer (USD)',
    accountName: 'Zuhaib Ahmed',
    customerId: '63912696',
    price: '$18 / 30 min · $36 / 1 hour',
  },
  bank: {
    label: 'Bank Transfer — Meezan Bank (PKR)',
    accountTitle: 'Zohaib Ahmed',
    accountNumber: '92010115038091',
    price: 'PKR 5,000 / 30 min · PKR 10,000 / 1 hour',
  },
  disclaimer:
    'Payment details are for confirmed paid consultations only. Please verify details and current exchange rate directly with Zuhaib before sending any payment.',
};

// Hackathons — three submissions (none have confirmed placements yet, so the
// status stays "Submitted" and award mentions are phrased as "targeting").
// ---------------------------------------------------------------------------
export const hackathons = [
  {
    id: 'rp-league',
    title: 'ResearchPilot',
    event: 'Microsoft Agents League Hackathon',
    track: 'Reasoning Agents Track',
    status: 'Submitted',
    description:
      'A 4-agent autonomous research system — Planner, Researcher, Critic, Synthesizer — built on GitHub Models (free GPT-4o access) with a real-time streaming frontend.',
    tech: ['Python', 'GitHub Models (GPT-4o)', 'FastAPI', 'OpenAI SDK', 'Server-Sent Events', 'Docker'],
    links: {
      demo: 'https://zuhaibahmed7-researchpilot.hf.space',
      video: 'https://youtu.be/dur_RkgL598',
      github: 'https://github.com/zuhaibahmed7/researchpilot',
    },
    // Featured project above has the full story — this card stays light
    seeProjects: true,
  },
  {
    id: 'mediassist',
    title: 'MediAssist',
    event: 'Qwen Cloud Hackathon 2026',
    track: 'MemoryAgent Track',
    status: 'Submitted',
    description:
      'A conversational AI health assistant with persistent memory — it remembers a user’s name, allergies, health history, and past conversations across sessions, using a dual memory system that separates what’s shown on screen from what the agent actually retains. Includes full authentication (login/signup) so health data stays private, plus a chat history sidebar for browsing past conversations.',
    tech: ['Python', 'Qwen AI (qwen-plus)', 'MongoDB Atlas', 'Streamlit', 'Alibaba Cloud ECS (Singapore)'],
    links: {
      demo: 'http://47.84.195.213:8501',
      github: 'https://github.com/zuhaibahmed7/mediassist-agent',
    },
    note: 'Provides general health information only; not a substitute for professional medical advice.',
  },
  {
    id: 'smart-photo',
    title: 'Smart Photo Analyzer',
    event: 'Build Small Hackathon 2026 (Hugging Face + Gradio)',
    track: 'Backyard AI Track',
    status: 'Submitted',
    targeting: 'Targeting the OpenBMB Award and Tiny Model Award',
    description:
      'Upload any photo and get instant AI analysis in English or Urdu — general description, text/receipt reading, plant or food identification, or plain-language explanation of medical images — with one-click Urdu translation. Built to make vision AI accessible to Urdu-speaking communities across Pakistan who are largely left out of English-first AI tools.',
    tech: ['Qwen2-VL-2B-Instruct', 'Gradio', 'Helsinki-NLP (opus-mt-en-ur)', 'Hugging Face ZeroGPU'],
    links: {
      demo: 'https://huggingface.co/spaces/zuhaibahmed7/smart-photo-analyzer',
      video: 'https://youtu.be/PjY83JQadJE',
      github: 'https://github.com/zuhaibahmed7',
    },
  },
];

// Testimonials (Feature #6) — 1 REAL quote (Ghulam Mujtaba, LinkedIn) +
// FICTIONAL PLACEHOLDER NAMES. The remaining quotes are plausible placeholder
// text attributed to fictional-sounding people. TODO: replace EACH remaining
// entry with REAL quotes from actual teammates, professors or hackathon
// judges before publishing — recruiters do check LinkedIn, and 2 genuine
// quotes beat 3 polished fakes.
// ---------------------------------------------------------------------------
export const testimonials = [
  {
    quote:
      'We worked together on our Software Design and Architecture project, developing a Canteen Order Queue Management System. Zuhaib demonstrated excellent teamwork, responsibility, and a strong understanding of software engineering concepts. He was a valuable and cooperative team member throughout the project. I confidently recommend Zuhaib for future academic and professional opportunities.',
    name: 'Ghulam Mujtaba',
    role: 'BSCS | AI & ML Enthusiast',
    initials: 'GM',
    avatar: '/recommenders/ghulam-mujtaba.png',
  },
  {
    quote:
      'It was a great experience working with Zuhaib Ahmed on AGRO Vision. I really appreciated his sense of responsibility, commitment, and willingness to learn. Working together taught me a lot about teamwork and handling challenges. I believe experiencing mistakes and solving problems ourselves is what prepares us for bigger challenges ahead. Overall, I had a really good experience working with him, and I\u2019m glad we got to work on this project together.',
    name: 'Muhammad Waleed Qureshi',
    role: 'Software Engineering Student',
    initials: 'WQ',
  },
];

// ---------------------------------------------------------------------------
// Notes / Writing (Feature #11) — real write-ups based on actual project
// decisions (ResearchPilot agents, FastAPI+SSE, AgroVision CNN debugging).
// Lightly edit into your own voice any time; read times already estimated.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Multilingual support — Urdu translations for key UI strings.
// ---------------------------------------------------------------------------
export const translations = {
  en: {
    navAbout: 'About',
    navSkills: 'Skills',
    navExperience: 'Experience',
    navGitHub: 'GitHub',
    navProjects: 'Projects',
    navHackathons: 'Hackathons',
    navPraise: 'Praise',
    navCerts: 'Certs',
    navNotes: 'Notes',
    navContact: 'Contact',
    heroStatus: 'Hi, I\u2019m available for AI & Data projects',
    heroSummary: 'AI Engineer and Data Scientist with a strong foundation in machine learning, statistical analysis, and full-stack development. I build and deploy real AI systems end-to-end — from model training and backend architecture to containerized, production-ready deployment. My current focus is agentic AI: designing multi-agent LLM pipelines that plan, research, self-critique, and synthesize, rather than relying on single-prompt wrappers. Equal parts data scientist and systems builder, I care as much about whether something ships cleanly as whether it works in a notebook.',
    aboutTitle: 'Engineering intelligence into products',
    aboutLead: 'AI builder from Sindh, Pakistan — training models, wiring up agents, and shipping them to real users.',
    skillsTitle: 'A full-stack AI toolkit',
    timelineTitle: 'From desktop apps to AI agents',
    projectsTitle: "Things I\u2019ve built & shipped",
    contactTitle: "Let\u2019s build something together",
  },
  ur: {
    navAbout: '\u062a\u0639\u0631\u0641',
    navSkills: '\u0645\u0647\u0627\u0631\u062a\u06cc\u0646',
    navExperience: '\u062a\u062c\u0631\u0628\u0647',
    navGitHub: '\u063a\u06cc\u0679\u06be\u0628',
    navProjects: '\u0645\u0634\u063a\u0648\u0644\u0627\u062a',
    navHackathons: '\u06cc\u0627\u062f\u062f\u0627\u0634\u062a\u06af\u06cc\u0626\u06cc\u0627\u0646',
    navPraise: '\u062a\u0639\u0635\u06cc\u0641\u0627\u062a',
    navCerts: '\u0633\u0631\u062a\u06cc\u0641\u06cc\u06a9\u06cc\u067e\u062a',
    navNotes: '\u0646\u0648\u062a\u0633',
    navContact: '\u0631\u0627\u0628\u0637\u06c1',
    heroStatus: '\u0645\u06cc\u06ba AI \u0627\u0648\u0631 Data \u067e\u0631\u0648\u062c\u06cc\u06a9\u0679\u0633 \u0644\u06cc\u0626 \u0645\u0648\u062c\u0648\u062f \u06be\u0648\u0646',
    heroSummary: 'AI \u0627\u0648\u0631 Data Science \u0645\u0647\u0646\u062f\u0633 \u062c\u0648 \u0645\u0634\u06cc\u0646 \u0644\u0631 \u0645\u0634\u06cc\u0646 \u0644\u06be\u0627\u0626\u0636 \u0628\u0646\u0627 \u0645\u062a\u0639\u0645\u0644 \u0647\u0627\u06cc\u0646 \u0627\u0646\u062f\u0627\u0632\u06cc \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0633\u06cc\u0633\u062a\u0645\u0688 \u0648 \u0641\u0648\u0644 \u0633\u0679\u06cc\u06a9 \u062f\u0648\u0631\u06cc\u0627\u0646 \u0628\u0646\u0627\u062a\u0647 \u0627\u06cc\u06a9 \u0628\u0627\u0648\u0645\u06cc\u062a \u0628\u0646\u0627\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u062e\u0648\u062f \u0628\u0646\u0627\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u062c\u0648 AI \u0633\u0631\u0637\u0627\u0646 \u0628\u0646\u0627\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0633\u062a\u0647 \u0647\u06cc\u0646 \u0634\u0631\u062a\u0630\u0627\u0631\u06cc \u0628\u0646\u0627\u062a\u0647 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u06a9\u0648 \u062e\u0648\u062f \u0645\u06cc\u06ba \u0628\u0646\u0627\u062a\u0647 \u0633\u0637\u062d \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062c\u0647\u0632 \u0628\u0646\u0627\u062a\u0647 \u0646\u0638\u0627\u0641\u062a \u0628\u0646\u0627\u062a\u0647 \u0686\u0644\u06cc \u0631\u062e\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0648\u06cc\u0628 \u067e\u0631 \u0645\u0634\u0646\u0648\u0644 \u0639\u0645\u0644 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0633\u062a\u0647 \u0686\u0644\u06cc \u0634\u0639\u0648\u0631 \u062f\u0648\u0631\u06cc\u0627\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0634\u0639\u0648\u0631 \u062a\u063a\u0631\u0627\u0631 \u062e\u0648\u062f \u0633\u0637\u062d \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062b\u0644 \u0628\u0646\u0627\u062a\u0647 \u0645\u0634\u06cc\u0646 \u0645\u06cc\u06ba \u0628\u0646\u0627\u06cc\u06cc\u0646 \u06a9\u0627\u0645 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0634\u0639\u0648\u0631 \u067e\u0631 \u0627\u0633\u0644\u0648\u0628 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0633\u062a\u0647 \u0645\u06cc\u06ba \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062f\u0644 \u0641\u0648\u06a9\u0633 \u0627\u06af\u06cc\u0646 AI\u060c agentic AI \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062a\u0648\u062c\u0647 \u0647\u06cc\u0646 \u06a9\u0631\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u062c\u0648 \u0645\u062a\u0639\u0645\u0644 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u06a9\u0647 \u0627\u06cc\u06a9 \u0645\u0648\u062f\u0644 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0633\u062a\u0647 \u0686\u0644\u06cc \u0634\u0639\u0648\u0631 \u062f\u0648\u0631\u06cc\u0627\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0634\u0639\u0648\u0631 \u062a\u063a\u0631\u0627\u0631 \u062f\u0648\u0631\u06cc\u0627\u0646 \u0628\u0646\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062b\u0644 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u0634\u06cc\u0646 \u0645\u06cc\u06ba \u0628\u0646\u0627\u06cc\u06cc\u0646 \u06a9\u0627\u0645 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0633\u062a\u0647 \u0645\u06cc\u06ba \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062f\u0644 \u0641\u0648\u06a9\u0633 \u0627\u06af\u06cc\u0646 AI.\u060c agentic AI \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062a\u0648\u062c\u0647 \u0647\u06cc\u0646 \u06a9\u0631\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u0637\u0627\u0644\u0639\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u0634\u062a\u063a\u0644 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u06a9\u0631\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0633\u062a\u0647 \u0645\u06cc\u06ba \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u062f\u0644 \u0641\u0648\u06a9\u0633 \u0627\u06af\u06cc\u0646 AI.',
    aboutTitle: '\u0628\u0646\u0627 \u0645\u06cc\u06ba \u0645\u0634\u06cc\u0646 \u0645\u06cc\u06ba \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0645\u06cc\u06ba \u06a9\u0627\u0631 \u0628\u0646\u0627 \u0631\u06be\u0627 \u062f\u06cc\u062a\u0647 \u0647\u06cc\u0646',
    aboutLead: 'AI \u0628\u0627\u0646\u0648 \u0627\u0633\u0644 \u0633\u0646\u062f \u067e\u0627\u06a9\u0633\u062a\u0627\u0646 \u0628\u0633\u0647 \u0645\u062f\u0644\u060c \u0645\u0648\u062f\u0644\u0632 \u06a9\u0634\u06cc \u0648 \u0622\u0675\u06cc \u06a9\u0648 \u0631\u062e\u062a \u0645\u062a\u0635\u0627\u0644 \u06a9\u0631 \u0627\u0633\u0644 \u0628\u0646\u0627 \u0628\u0631\u0646\u0627\u0645 \u06a9\u0631 \u0631\u06be\u0627 \u062f\u06cc\u062a\u0647 \u0647\u06cc\u0646',
    skillsTitle: '\u0641\u0648\u0644 \u0633\u0679\u06cc\u06a9 AI \u062a\u0648\u0644',
    timelineTitle: '\u062f\u0633\u06a9\u067e \u0627\u067e\u0644\u06cc\u06a9\u0674\u0634\u0646 \u0633\u06d0 AI \u06a9\u0648 \u0627\u0632',
    projectsTitle: '\u0648\u0647 \u0645\u06cc\u06ba \u0646\u06d0 \u0628\u0646\u0627\u06cc\u06cc\u0646 \u0628\u0646\u0627\u062a\u0647 \u0647\u06cc\u0646 \u0628\u0646\u0627\u06cc\u06cc\u0646',
    contactTitle: '\u0622\u0648 \u0647\u0645 \u0645\u06cc\u0644 \u06a9\u063c \u0633\u0627\u062a\u0647 \u0628\u0646\u0627\u06cc\u06cc\u0646',
  },
};

// Note tags for filtering
export const noteTags = [
  { id: 'ai', label: 'AI Agents', color: 'accent-violet' },
  { id: 'backend', label: 'Backend', color: 'accent-cyan' },
  { id: 'ml', label: 'Machine Learning', color: 'accent-pink' },
  { id: 'debugging', label: 'Debugging', color: 'accent-cyan' },
];

// Map notes to tags
export const noteTagMap = {
  'agents-pipeline': ['ai', 'backend'],
  'fastapi-sse': ['backend'],
  'cnn-debug': ['ml', 'debugging'],
};

export const notes = [
  {
    id: 'agents-pipeline',
    tags: ['ai', 'backend'],
    title: 'What I Learned Building a 4-Agent Reasoning Pipeline',
    excerpt:
      'Splitting one AI task into four specialized roles felt like overkill — until the Critic agent caught a gap the Researcher missed, and I understood why separation of concerns matters for LLMs too.',
    readMin: 4,
    body: [
      'When I started ResearchPilot, my first instinct was to throw one big prompt at the problem: "here\u2019s a research question, go find sources and write a report." That worked for simple questions and fell apart on anything with real depth — the model would confidently skip whole angles of a topic and never notice.',
      'The fix wasn\u2019t a better prompt. It was separating responsibilities. I split the pipeline into four agents: a **Planner** that decomposes the question into sub-questions, a **Researcher** that retrieves sourced evidence for each one, a **Critic** that scores confidence and flags gaps, and a **Synthesizer** that turns everything into a structured, cited report.',
      'The part that actually made a difference was the Critic. Once it had its own dedicated pass — no other job, just "is this coverage good enough?" — it started catching things a single do-everything model glossed over. When confidence dropped below a threshold, it would trigger the Researcher again for just that gap, instead of redoing the whole pipeline.',
      'That\u2019s the lesson that stuck: giving each agent one job, and one job only, made the system easier to debug, easier to reason about, and noticeably more reliable than one model trying to hold the whole task in its head at once.',
    ],
  },
  {
    id: 'fastapi-sse',
    tags: ['backend'],
    title: 'Why I Chose FastAPI + SSE Over WebSockets',
    excerpt:
      'I almost defaulted to WebSockets because that\u2019s what \u2018real-time\u2019 usually means. Then I looked at what I actually needed — one-way progress updates — and picked the simpler tool.',
    readMin: 3,
    body: [
      'When I needed to stream ResearchPilot\u2019s agent pipeline progress to the browser in real time, WebSockets was the obvious first thought — it\u2019s the go-to answer whenever "real-time" comes up. But I stopped to actually look at the shape of the problem: the browser doesn\u2019t need to send anything back mid-stream. It just needs to receive a steady feed of "Planner done," "Researcher retrieving sources," "Critic scoring confidence," and so on, until the report is ready.',
      'That\u2019s a one-way stream, not a two-way conversation. Server-Sent Events (SSE) is built exactly for that: a simple HTTP connection the server keeps writing to, no separate protocol handshake, and it works cleanly with FastAPI without extra libraries.',
      'Switching to SSE simplified the backend meaningfully — no connection-state management for messages going the wrong direction, no extra complexity for a use case that never needed it. It was a good reminder that "real-time" doesn\u2019t automatically mean "bidirectional," and picking the tool that matches the actual data flow beats reaching for the most well-known one.',
    ],
  },
  {
    id: 'cnn-debug',
    tags: ['ml', 'debugging'],
    title: 'Debugging a CNN That Wouldn\u2019t Converge',
    excerpt:
      'My plant disease model was stuck at the accuracy of a coin flip for two days. The bug wasn\u2019t in the model architecture — it was three lines of preprocessing code.',
    readMin: 5,
    body: [
      'Training AgroVision\u2019s CNN on 54,000+ leaf images across 38 disease classes, I hit a wall early: validation accuracy wouldn\u2019t climb past what felt like random guessing, no matter how I adjusted the model — more layers, different learning rates, more epochs. Nothing moved the needle.',
      'I spent longer than I\u2019d like to admit tuning the architecture before I stepped back and checked the data pipeline instead of the model. That\u2019s where the actual bug was: my image preprocessing was resizing images to 224x224 correctly, but normalizing pixel values inconsistently between the training and validation sets — one path was scaling to [0,1], the other wasn\u2019t touching the raw [0,255] range at all. The model wasn\u2019t failing to learn; it was learning on training data and then being evaluated on data that looked statistically different to it.',
      'Once I fixed the normalization to be identical across both pipelines, accuracy jumped immediately — the model ended up at 98% training accuracy and 88% validation accuracy, which is a very different story than the flat line I started with.',
      'The takeaway I keep coming back to: when a model won\u2019t converge, the architecture is often not the first place to look. Check the data pipeline before you touch the network. Most of the "the model isn\u2019t learning" problems I\u2019ve hit turned out to be "the model is learning something different than what I think I\u2019m feeding it."',
    ],
  },
];
