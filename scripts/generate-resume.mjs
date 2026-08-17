/**
 * Generates public/resume.pdf — a clean two-column-ish single-source resume
 * built from the same data used by the website (src/data/content.js values
 * inlined below to keep the script dependency-free).
 *
 * Run: npm run generate:resume
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Writes to resume-generated.pdf — public/resume.pdf is Zuhaib's REAL,
// manually-formatted resume and must never be overwritten by this script.
const OUT = join(ROOT, 'public', 'resume-generated.pdf');

/* ----------------------------- data -------------------------------------- */
const DATA = {
  name: 'Zuhaib Ahmed',
  title: 'AI Engineer / Data Scientist / AI & Full-Stack Developer',
  contact1: 'zuhaibmahar234@gmail.com  ·  +92-327-3302678',
  contact2: "Khairpur Mir's, Sindh, Pakistan  ·  github.com/zuhaibahmed7  ·  linkedin.com/in/zuhaib-ahmed-69951a39a  ·  youtube.com/@aiwithzuhaib",
  summary:
    'AI Engineer and Data Scientist with a strong foundation in machine learning, statistical analysis, and full-stack development. I build and deploy real AI systems end-to-end — from model training and backend architecture to containerized, production-ready deployment. My current focus is agentic AI: designing multi-agent LLM pipelines that plan, research, self-critique, and synthesize, rather than relying on single-prompt wrappers. Equal parts data scientist and systems builder, I care as much about whether something ships cleanly as whether it works in a notebook.',
  education: 'Sukkur IBA University, Sukkur, Pakistan — Bachelor of Science in Computer Software Engineering, 2024-2028 (Expected)',
  hackathons: [
    ['ResearchPilot — Microsoft Agents League Hackathon (Reasoning Agents Track)', 'Python, GitHub Models (GPT-4o), FastAPI, OpenAI SDK, SSE, Docker — see Projects for full details'],
    ['MediAssist — Qwen Cloud Hackathon 2026 (MemoryAgent Track)', 'Python, Qwen AI (qwen-plus), MongoDB Atlas, Streamlit, Alibaba Cloud ECS — AI health assistant with persistent cross-session memory'],
    ['Smart Photo Analyzer — Build Small Hackathon 2026 (Hugging Face + Gradio, Backyard AI Track)', 'Qwen2-VL-2B-Instruct, Gradio, Helsinki-NLP, HF ZeroGPU — English/Urdu image analysis for Urdu-speaking communities'],
  ],
  awards: [
    ['SEEF Sindh Government Scholarship — Sindh Education Endowment Fund (Government of Sindh)', 'July 2026 · Merit- & Need-Based Award'],
  ],
  skills: [
    ['Programming Languages', 'Python, C++, Java, JavaScript'],
    ['Agentic AI & LLMs', 'Multi-Agent Systems, Reasoning Pipelines, Prompt Engineering, OpenAI SDK, GitHub Models (GPT-4o/GPT-4o-mini), LLM Orchestration, Server-Sent Events (SSE)'],
    ['Data Science & ML', 'Machine Learning, Statistical Data Analysis, TensorFlow, Keras, Matplotlib, Seaborn, Pandas, NumPy, Scikit-learn, Deep Learning (CNN), Model Training & Evaluation'],
    ['Web & Backend', 'FastAPI, Uvicorn, React 19, React Router, Context API, Django, HTML5, CSS, Tailwind CSS, Streamlit'],
    ['DevOps & Deployment', 'Docker, Docker Desktop, Containerization, Hugging Face Spaces, Image Building, Port Mapping, Container Deployment'],
    ['Databases & Tools', 'SQL, Git, GitHub, Google Cloud, Google Gemini, API Integration, Microsoft Office'],
    ['Concepts & Design', 'OOP, Data Structures, Tkinter, Figma (UI/UX), Prototyping, Wireframing, Color Theory'],
  ],
  projects: [
    ['ResearchPilot — Multi-Agent Autonomous Research System', 'Python, GitHub Models, FastAPI, OpenAI SDK, SSE, Docker',
      'Multi-agent AI reasoning system (Microsoft Agents League Hackathon, Reasoning Agents track). 4-agent pipeline (Planner, Researcher, Critic, Synthesizer) using the OpenAI Python SDK against GitHub Models; self-critique re-research loop triggers additional research when confidence falls below threshold. FastAPI + SSE real-time frontend; deployed on Hugging Face Spaces via Docker.'],
    ['AgroVision — AI Plant Disease Prediction System', 'Python, TensorFlow, Streamlit, Docker',
      'CNN trained on 54,000+ images across 38 disease classes; 88% validation accuracy. Interactive Streamlit interface for image upload, preprocessing and instant prediction; containerized with Docker.'],
    ['Canteen Token / Order Queue System', 'PHP, MySQL, HTML, CSS, JavaScript, XAMPP',
      'Web-based canteen token and order queue system for Sukkur IBA University. Three-Tier Architecture with role-based access (Customer/Staff/Admin); FIFO queue, token generation, order lifecycle, live notifications. Singleton, Factory and Observer patterns; full UML documentation.'],
    ['FitWise — AI-Powered Fitness Assistant', 'Python, AI, Data Analysis',
      'Customized workout plans based on fitness level, goals and equipment; AI-driven healthcare advice and weight-tracking visualization.'],
    ['Movie Discovery App', 'React 19, React Router, Context API, LocalStorage',
      'Movie discovery web app with real-time search, add/remove favorites and persistence via LocalStorage + Context API.'],
    ['ScriptFlow AI — Video Script Generator', 'Python, AI, API Integration',
      'Platform-aware video scripts with hooks, scenes and CTAs for YouTube, TikTok, Instagram and Ads in under 30 seconds.'],
    ['Task Management App with GUI', 'Python, Tkinter, OOP',
      'Desktop task management app with add/update/delete/view features, built with OOP principles.'],
  ],
  certifications: [
    'Google Cloud Gen AI Academy APAC Edition (Cohort 1) — Hack2Skill (Apr 2026) · ID: 2026H2S04GCGENAIAPACC1-P00917',
    'Intro to Machine Learning — Kaggle (Apr 2026)',
    'Claude 101 — Anthropic (Mar 2026) · ID: qagzx8ygpkae',
    'Maximize Productivity With AI Tools — Google via Coursera (Jul 2025)',
    'Introduction to SQL — DataCamp (Feb 2026)',
  ],
  interests:
    'Data Science & Machine Learning · Agentic AI & Multi-Agent Systems · Generative AI & LLMs · Full-stack Development (Python, React, SQL) · DevOps & Containerization · User-centered Design and Analytics',
};

/* --------------------------- pdf helpers ---------------------------------- */
const INK = '0.13 0.13 0.16'; // near-black text
const VIOLET = '0.49 0.23 0.93';
const CYAN = '0.13 0.83 0.93';
const GRAY = '0.42 0.42 0.46';

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

// Approximate Helvetica advance widths (good enough for wrapping)
const charW = (s, size, bold) => s.length * size * (bold ? 0.56 : 0.5);

function wrap(text, size, bold, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (charW(test, size, bold) > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ------------------------- content builder ------------------------------- */
const PAGE_W = 612;
const PAGE_H = 792;
const M = 50;
const MAXW = PAGE_W - M * 2;
const pages = [];
let ops = [];
let y = PAGE_H - 52;

const op = (s) => ops.push(s);
const newPage = () => {
  pages.push(ops.join('\n'));
  ops = [];
  y = PAGE_H - 52;
};

const need = (h) => {
  if (y - h < 44) newPage();
};

const text = (str, { size = 9.5, bold = false, color = INK, x = M, gapBefore = 0 } = {}) => {
  const font = bold ? '/F1' : '/F2';
  for (const line of wrap(str, size, bold, PAGE_W - x - M)) {
    need(size + 3);
    y -= size + gapBefore;
    gapBefore = 0;
    op(`${color} rg`);
    op(`BT ${font} ${size} Tf 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${esc(line)}) Tj ET`);
  }
};

const heading = (label) => {
  need(34);
  y -= 20;
  op(`${VIOLET} rg`);
  op(`BT /F1 11 Tf 1 0 0 1 ${M} ${y.toFixed(1)} Tm (${esc(label.toUpperCase())}) Tj ET`);
  y -= 6;
  // gradient rule under the heading
  op(`${VIOLET} RG 1.4 w`);
  op(`${M} ${y.toFixed(1)} m ${(M + 90).toFixed(1)} ${y.toFixed(1)} l S`);
  op(`${CYAN} RG`);
  op(`${M + 90} ${y.toFixed(1)} m ${(M + 170).toFixed(1)} ${y.toFixed(1)} l S`);
  op(`${INK} RG`);
  y -= 8;
};

const bullet = (str, opts = {}) => {
  const lines = wrap(str, opts.size ?? 9.5, false, MAXW - 14);
  lines.forEach((line, i) => {
    need(13);
    y -= 12.5;
    if (i === 0) {
      op(`${CYAN} rg`);
      op(`BT /F1 9 Tf 1 0 0 1 ${M} ${y.toFixed(1)} Tm (\u2022) Tj ET`);
    }
    op(`${opts.color ?? INK} rg`);
    op(`BT /F2 9.5 Tf 1 0 0 1 ${M + 14} ${y.toFixed(1)} Tm (${esc(line)}) Tj ET`);
  });
};

/* ---- header ---- */
op(`${VIOLET} rg`);
op(`BT /F1 24 Tf 1 0 0 1 ${M} ${y - 24} Tm (${esc(DATA.name)}) Tj ET`);
y -= 34;
text(DATA.title, { size: 11, bold: true, color: CYAN });
text(DATA.contact1, { size: 8.5, color: GRAY });
text(DATA.contact2, { size: 8.5, color: GRAY });

/* ---- summary ---- */
heading('Summary');
text(DATA.summary, { size: 9.5 });

/* ---- education ---- */
heading('Education');
text(DATA.education, { size: 9.5 });

/* ---- awards ---- */
heading('Awards');
for (const [title, detail] of DATA.awards) {
  text(title, { size: 10, bold: true });
  text(detail, { size: 8.5, color: VIOLET });
}

/* ---- skills ---- */
heading('Skills');
for (const [cat, list] of DATA.skills) {
  const lines = wrap(`${cat}: ${list}`, 9.5, false, MAXW - 14);
  lines.forEach((line, i) => {
    need(13);
    y -= 12.5;
    if (i === 0) {
      op(`${INK} rg`);
      op(`BT /F1 9.5 Tf 1 0 0 1 ${M} ${y.toFixed(1)} Tm (${esc(cat)}:) Tj ET`);
      // continuation starts after the bold category label
      op(`BT /F2 9.5 Tf 1 0 0 1 ${M + charW(`${cat}:`, 9.5, true) + 4} ${y.toFixed(1)} Tm (${esc(list)}) Tj ET`);
    } else {
      op(`${INK} rg`);
      op(`BT /F2 9.5 Tf 1 0 0 1 ${M + 14} ${y.toFixed(1)} Tm (${esc(line)}) Tj ET`);
    }
  });
}

/* ---- projects ---- */
heading('Projects');
for (const [name, tech, desc] of DATA.projects) {
  need(30);
  text(name, { size: 10, bold: true });
  text(tech, { size: 8.5, color: VIOLET });
  text(desc, { size: 9 });
  y -= 4;
}

/* ---- hackathons ---- */
heading('Hackathons');
for (const [title, detail] of DATA.hackathons) {
  text(title, { size: 10, bold: true });
  text(detail, { size: 8.5, color: VIOLET });
}

/* ---- certifications ---- */
heading('Certifications');
for (const cert of DATA.certifications) bullet(cert);

/* ---- interests ---- */
heading('Interests');
text(DATA.interests, { size: 9 });

pages.push(ops.join('\n'));

/* --------------------------- assemble pdf -------------------------------- */
const objects = [];
const pageObjIds = pages.map((_, i) => 5 + i * 2);

// 1: catalog, 2: pages, 3: Helvetica-Bold, 4: Helvetica, then page/content pairs
objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
objects[2] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

pages.forEach((content, i) => {
  const pageId = 5 + i * 2;
  const contentId = pageId + 1;
  objects[pageId] =
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
    `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
  objects[contentId] = `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`;
});

let out = '%PDF-1.4\n';
const offsets = [];
for (let i = 1; i < objects.length; i++) {
  offsets[i] = Buffer.byteLength(out, 'latin1');
  out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefPos = Buffer.byteLength(out, 'latin1');
out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
for (let i = 1; i < objects.length; i++) {
  out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(out, 'latin1'));
console.log(`✓ resume.pdf written → ${OUT} (${pages.length} page${pages.length > 1 ? 's' : ''})`);
