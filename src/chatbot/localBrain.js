// ---------------------------------------------------------------------------
// Local knowledge "brain" — zero-config fallback answerer.
//
// Used server-side when no LLM_API_KEY is configured (or the LLM provider
// fails), so the chatbot is never dead on static-only deploys. It pattern-
// matches the visitor's last question against the same content.js data that
// powers the whole site — one source of truth, no invented facts.
//
// Returns a reply string, or null when nothing sensible can be answered
// (the client then shows the friendly fallback message).
// ---------------------------------------------------------------------------
import { profile, education, nowItems, skillCategories, certifications, awards, hackathons, projects, socials } from '../data/content.js';

const LIST = (items) => items.map((i) => `• ${i}`).join('\n');

const CONTACT_BLOCK = `You can reach Zuhaib at:
• Email — ${profile.email}
• Phone — ${profile.phone}
• LinkedIn — ${socials.linkedin.href}
• GitHub — ${socials.github.href}

He usually responds fastest on email. 📩`;

/* The site summary is written in Zuhaib's first-person voice; when the bot
   quotes it, convert to third person so the assistant never sounds like it
   IS Zuhaib. Adjust the replacements if the summary wording changes. */
function thirdPersonSummary() {
  return profile.summary
    .split('. ')
    .slice(0, 2)
    .join('. ')
    .replace(/\bI build and deploy\b/, 'He builds and deploys')
    .replace(/\bMy current focus\b/, 'His current focus');
}

function summaryBlock() {
  return `${profile.name} is an ${profile.title.split(' / ')[0]} from ${profile.location}. ${thirdPersonSummary()}.${''}

Ask me about his projects, skills, education, or certifications for more!`;
}

/* Topic matchers — checked in priority order (specific → general). */
const TOPICS = [
  {
    // Featured project gets the richest answer
    test: /\b(research\s?pilot|multi[-\s]?agent|agents?\s+league|reasoning\s+agent)\b/i,
    reply: () => {
      const p = projects[0];
      return `${p.title} is Zuhaib's featured project — a ${p.subtitle.toLowerCase()} built for the Microsoft Agents League Hackathon (Reasoning Agents track). 🚀

It runs a 4-agent pipeline — Planner, Researcher, Critic, Synthesizer — that decomposes research questions, retrieves sourced evidence, and produces structured, cited reports. A self-critique loop re-researches whenever the Critic detects gaps.

Tech: ${p.tech.join(', ')}.
Try it live: ${socials.huggingface.href}`;
    },
  },
  {
    test: /\b(agro\s?vision|plant|disease|leaf|cnn)\b/i,
    reply: () => `AgroVision is an AI plant-disease prediction system. A CNN trained on 54,000+ leaf images across 38 disease classes hits 88% validation accuracy (98% training). Built with ${projects[1].tech.join(', ')} — Streamlit UI, Dockerized for deployment. 🌿`,
  },
  {
    test: /\b(canteen|token|queue)\b/i,
    reply: () => `The Canteen Token / Order Queue System is a web app Zuhaib built for Sukkur IBA University to replace manual queuing. It uses a three-tier architecture with role-based access (Customer / Staff / Admin), automatic token generation, FIFO order tracking and live notifications — applying Singleton, Factory, and Observer design patterns with full UML documentation. 🎫`,
  },
  {
    test: /\b(fit\s?wise|fitness|workout)\b/i,
    reply: () => `FitWise is an AI-powered fitness assistant that generates customized workout plans based on your fitness level, goals, and available equipment — plus AI-driven healthcare advice and weight-tracking visualizations. Built with ${projects[3].tech.join(', ')}. 💪`,
  },
  {
    test: /\b(movie|film)\b/i,
    reply: () => `The Movie Discovery App is a React 19 web app with real-time search, add/remove favorites, and persistence via LocalStorage + Context API — so your watchlist survives refreshes. 🎬`,
  },
  {
    test: /\b(script\s?flow|video script)\b/i,
    reply: () => `ScriptFlow AI generates platform-aware video scripts — hooks, scenes, and CTAs — for YouTube, TikTok, Instagram, and Ads in under 30 seconds. Built with ${projects[5].tech.join(', ')}. ⚡`,
  },
  {
    test: /\b(task\s+(manage|manager|app)|tkinter|desktop\s+app)\b/i,
    reply: () => `Zuhaib's Task Management App is a desktop app with add / update / delete / view features, built in Python with Tkinter using OOP principles. ✅`,
  },
  {
    test: /\b(figma|wireframe|prototype|portfolio\s+(website\s+)?(ui\s+)?design)\b/i,
    reply: () => `Beyond code, Zuhaib designed a Personal Portfolio Website UI in Figma (Nov 2024) — wireframes, prototypes, and three responsive interfaces, applying color theory and user-centered design principles. 🎨`,
  },
  {
    // Recruiter: graduation timing (derived from 2024–2028 education window)
    test: /\b(gradua|class\s+of\s+20|when\s+will\s+he\s+finish|finish\s+his\s+degree)/i,
    reply: () => `Zuhaib is expected to graduate in 2028 with his BS in Computer Software Engineering from Sukkur IBA University (he started in 2024). 🎓`,
  },
  {
    // Recruiter: student vs working professional
    test: /\b(student|enrolled|undergrad(uate)?|working\s+professional|what\s+does\s+he\s+do)\b/i,
    reply: () => `He's a full-time undergraduate student — actively building and shipping real AI/ML and full-stack projects alongside his coursework (7+ shipped projects, 5 certifications, and a Microsoft Agents League hackathon build). 📚`,
  },
  {
    // "What is he doing now?" — mirrors the About section's "now" card,
    // reading the same nowItems list so page and chatbot never drift apart.
    // Note: "currently" only matches with a learning/working verb so it
    // doesn't hijack "Is he currently available?" (availability topic).
    test: /\b(doing\s+now|up\s+to|right\s+now|what'?s\s+new|these\s+days|what\s+is\s+he\s+learning|currently\s+(learning|studying|working|building|focused))\b/i,
    reply: () =>
      `Right now, Zuhaib is:\n${LIST(nowItems)}\nWant the deeper story? Ask about ResearchPilot or his agentic AI skills. 🚀`,
  },
  {
    // Recruiter: availability
    test: /\b(available|availability|internships?|part[-\s]?time|freelance|contract\s+work|open\s+to)\b/i,
    reply: () => `Yes — Zuhaib is open to internships, part-time roles, freelance/contract AI-ML work, hackathons, and collaborative open-source projects while completing his degree (expected 2028). For full-time timing and specifics, email him at ${profile.email} or connect on LinkedIn. 🤝`,
  },
  {
    // Recruiter: strongest area
    test: /\b(strongest|best\s+(at|area|skill)|specializ\w*|expertise|main\s+(area|focus)|core\s+strength)\b/i,
    reply: () => `His strongest area is agentic AI / multi-agent LLM systems and applied machine learning — backed by full-stack skills (React, FastAPI) and deployment experience (Docker, Hugging Face Spaces). He builds complete, deployed products, not just models — his ResearchPilot multi-agent system is live on Hugging Face. 🚀`,
  },
  {
    // Recruiter: what makes him different
    test: /\b(different|stand\s+out|unique|why\s+(should\s+)?(hire|work\s+with)|separates\s+him)\b/i,
    reply: () => `Zuhaib builds end-to-end — from model/agent logic through backend APIs to deployed, containerized frontends — and documents his process publicly on YouTube (@aiwithzuhaib). That combination of technical depth and communication ability is what sets him apart from other junior candidates. ✨`,
  },
  {
    test: /\b(projects?|built|portfolio\s+work|apps?)\b/i,
    reply: () => `Zuhaib has built ${projects.length} shipped projects. Highlights:\n${LIST([
      `${projects[0].title} — multi-agent autonomous research system (deployed on Hugging Face)`,
      `${projects[1].title} — CNN plant-disease predictor, 88% validation accuracy`,
      `${projects[2].title} — three-tier queue system for Sukkur IBA University`,
      `${projects[3].title} — AI-powered fitness assistant`,
      'Movie Discovery App — React 19 + Context API',
      'ScriptFlow AI — platform-aware video script generator',
      'Task Management App — Python/Tkinter desktop app',
    ])}\nAsk about any one of them for details!`,
  },
  {
    test: /\b(skills?|tech\s?stack|technologies|languages?|frameworks?|tools?)\b/i,
    reply: () => `Zuhaib's toolkit, grouped:\n${LIST(skillCategories.map((c) => `${c.name}: ${c.skills.slice(0, 4).join(', ')}${c.skills.length > 4 ? ', …' : ''}`))}\nWant the deep-dive on any category?`,
  },
  {
    test: /\b(agents?\b|multi[-\s]?agent|llms?|gpt|prompts?|orchestrat\w*|sse|generative)/i,
    reply: () => `In Agentic AI & LLMs, Zuhaib works with ${skillCategories[1].skills.join(', ')}. He put this to work in ResearchPilot — a 4-agent reasoning pipeline (Planner → Researcher → Critic → Synthesizer) deployed on Hugging Face. 🤖`,
  },
  {
    // Hackathons — all three submitted; no confirmed placements, phrased honestly
    test: /\b(hackathons?|devpost|agents\s+league|qwen\s+cloud|build\s+small|medi\s?assist|photo\s+analyz)/i,
    reply: () =>
      `Yes — three hackathons so far, all submitted:
${LIST(
        hackathons.map((h) => `${h.title} — ${h.event} (${h.track}) · ${h.status}`)
      )}
None have confirmed placement results yet. Ask about any one of them for details! 🏆`,
  },
  {
    // Scholarships & awards — placed before certifications so award questions
    // lead with the SEEF scholarship (matches the page's ordering)
    test: /\b(scholarships?|award(s|ed|ing)?|seef|honou?rs?|recogni\w*)/i,
    reply: () =>
      `Yes — Zuhaib was awarded the SEEF Sindh Government Scholarship (July 2026), a merit- and need-based award from the Sindh Education Endowment Fund (Government of Sindh). 🎓\nHe also holds 5 certifications across generative AI, ML, SQL and AI productivity — ask "what certifications does he have" for those.`,
  },
  {
    // Note: stems like certifica\w* (no trailing \b) so "certifications",
    // "certificate", "certified" etc. all match
    test: /\b(certifica\w*|certs?|courses?|badges?|credentials?)/i,
    reply: () =>
      `Zuhaib's certifications & awards:\n${LIST([
        ...awards.map((a) => `${a.title} — ${a.issuer} (${a.date}) — ${a.tag}`),
        ...certifications.map((c) => `${c.title} — ${c.issuer} (${c.date})`),
      ])}`,
  },
  {
    test: /\b(educat|university|degree|studies?|studying|student|iba|academic)\b/i,
    reply: () => `Zuhaib is pursuing a ${education.degree} at ${education.school}, ${education.location} (${education.period}). Alongside his degree, he's currently focused on LLM engineering, RAG, AI evals, and agent memory systems. 🎓`,
  },
  {
    test: /\b(contact|email|reach|phone|call|hire|connect|linkedin)\b/i,
    reply: () => CONTACT_BLOCK,
  },
  {
    test: /\b(resume|cv)\b/i,
    reply: () => `You can grab Zuhaib's resume from the "Resume" button in the navbar (top right). It covers his summary, education, skills, all ${projects.length} projects, and certifications. 📄`,
  },
  {
    test: /\b(youtube|channel|videos?|subscribe)\b/i,
    reply: () => `Zuhaib runs a YouTube channel — AI with Zuhaib — where he shares AI content: ${socials.youtube.href} ▶️`,
  },
  {
    test: /\b(where|located?|live|from|based|city|country)\b/i,
    reply: () => `Zuhaib is based in ${profile.location}. 📍`,
  },
  {
    // Recruiter: work experience (framed honestly per knowledge base)
    test: /\b(experience|work\s+history|employment|employed|worked|jobs?)\b/i,
    reply: () => `His experience so far comes from self-directed and academic projects — 7+ shipped projects, including the Microsoft Agents League hackathon — plus 5 completed certifications, rather than traditional employment (consistent with being a full-time student). Check the Projects section for the full list! 💼`,
  },
  {
    test: /\b(who\s+is|about|tell\s+me\s+about|introduce|background|himself|summary)\b/i,
    reply: summaryBlock,
  },
  {
    test: /\b(thanks?|thank\s+you|great|awesome|nice|cool|bye|goodbye)\b/i,
    reply: () => `You're welcome! 😊 If you'd like to work with Zuhaib or have more questions, just ask — or email him at ${profile.email}.`,
  },
];

const DONT_KNOW = (q) =>
  `I don't have that information in my knowledge base about Zuhaib. 🤔 I can help with his projects, skills, education, certifications, or how to contact him — or you can email him directly at ${profile.email}.`;

/**
 * @param {Array<{role: string, content: string}>} history sanitized chat history
 * @returns {string | null}
 */
export function localAnswer(history) {
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUser) return null;

  const q = lastUser.content.toLowerCase().trim();

  // Short greeting → welcome instead of a topic dump
  if (/^(hi+|hello+|hey+|salam|assalam[- ]?o?-?alaikum|yo|sup|good\s?(morning|afternoon|evening))[!., ]*$/i.test(q)) {
    return `Hey there! 👋 I'm Zuhaib's AI assistant. Ask me about his projects, skills, education — or how to get in touch with him.`;
  }

  // Follow-up questions like "how can I see it?" / "got a link?" — resolve
  // the project from EARLIER turns so multi-turn chat feels contextual.
  if (/\b(link|links|live|demo|try\s+it|see\s+it|check\s+it|visit|url|where\s+can\s+i\s+(see|try|find))\b/i.test(q)) {
    const convo = history.map((m) => m.content).join(' ').toLowerCase();
    if (/research\s?pilot|multi[-\s]?agent|agents?\s+league/.test(convo)) {
      return `You can try ResearchPilot live here: ${socials.huggingface.href} 🚀 It's deployed on Hugging Face Spaces via Docker, with real-time pipeline streaming via SSE.`;
    }
    if (/agro\s?vision|plant|disease/.test(convo)) {
      return `AgroVision's code is on Zuhaib's GitHub: ${socials.github.href} 🌿 (CNN plant-disease predictor — Dockerized Streamlit app).`;
    }
    return `Most of Zuhaib's work is on GitHub (${socials.github.href}), and his featured ResearchPilot is live on Hugging Face: ${socials.huggingface.href} 🔗`;
  }

  for (const topic of TOPICS) {
    if (topic.test.test(q)) return topic.reply();
  }
  return DONT_KNOW(q);
}
