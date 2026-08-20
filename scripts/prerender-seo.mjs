// ---------------------------------------------------------------------------
// Post-build prerender: injects real, crawlable content into dist/index.html
// inside <div id="root"> so search engines that don't execute JavaScript still
// see Zuhaib's profile, projects, skills and certifications.
//
// Content comes from src/data/content.js (single source of truth) — this runs
// after `vite build` and never touches the running app. React's createRoot
// replaces the block when the page mounts, so real visitors are unaffected.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  profile,
  roles,
  projects,
  skillCategories,
  certifications,
  awards,
  hackathons,
  education,
} from '../src/data/content.js';

const DIST = fileURLToPath(new URL('../dist/index.html', import.meta.url));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function buildSeoBlock() {
  const lines = [];
  lines.push(`<article class="seo-snapshot" style="max-width:900px;margin:0 auto;padding:96px 24px;color:#d6d6e0;font-family:Inter,system-ui,sans-serif;line-height:1.7;">`);
  lines.push(`<h1 style="font-size:2.4rem;margin:0 0 .5rem;color:#fff;">${esc(profile.name)}</h1>`);
  lines.push(`<p style="font-size:1.1rem;color:#a5a5b8;">${esc(profile.title)}</p>`);
  lines.push(`<p>${esc(roles.join(' · '))}</p>`);
  lines.push(`<p style="margin-top:1.25rem;">${esc(profile.summary)}</p>`);

  lines.push(`<h2 style="margin-top:3rem;color:#fff;">Education</h2>`);
  lines.push(`<p><strong>${esc(education.degree)}</strong> — ${esc(education.school)}, ${esc(education.location)} (${esc(education.period)})</p>`);

  lines.push(`<h2 style="margin-top:3rem;color:#fff;">Projects</h2>`);
  for (const p of projects) {
    lines.push(`<h3 style="margin-bottom:.35rem;color:#e2e2ef;">${esc(p.title)} — ${esc(p.subtitle)}</h3>`);
    lines.push(`<p style="margin-top:0;">${esc(p.tech.join(', '))}</p>`);
    for (const b of p.bullets) lines.push(`<p style="margin:.35rem 0;">${esc(b)}</p>`);
  }

  lines.push(`<h2 style="margin-top:3rem;color:#fff;">Skills</h2>`);
  for (const cat of skillCategories) {
    lines.push(`<p><strong>${esc(cat.name)}:</strong> ${esc(cat.skills.join(', '))}</p>`);
  }

  if (awards.length) {
    lines.push(`<h2 style="margin-top:3rem;color:#fff;">Awards</h2>`);
    for (const a of awards) lines.push(`<p><strong>${esc(a.title)}</strong> — ${esc(a.issuer)} (${esc(a.date)})</p>`);
  }

  if (certifications.length) {
    lines.push(`<h2 style="margin-top:3rem;color:#fff;">Certifications</h2>`);
    for (const c of certifications) {
      lines.push(`<p><strong>${esc(c.title)}</strong> — ${esc(c.issuer)} (${esc(c.date)})</p>`);
    }
  }

  if (hackathons.length) {
    lines.push(`<h2 style="margin-top:3rem;color:#fff;">Hackathons</h2>`);
    for (const h of hackathons) {
      lines.push(`<p><strong>${esc(h.title)}</strong> — ${esc(h.event)} (${esc(h.track)}): ${esc(h.description)}</p>`);
    }
  }

  lines.push(`<p style="margin-top:3rem;color:#8a8aa0;">Contact: ${esc(profile.email)}</p>`);
  lines.push(`</article>`);
  return lines.join('\n');
}

const html = readFileSync(DIST, 'utf-8');
const block = buildSeoBlock();
const injected = html.replace(
  '<div id="root"></div>',
  `<div id="root">\n${block}\n</div>`
);
if (injected === html) {
  console.error('prerender-seo: could not find <div id="root"></div> in dist/index.html');
  process.exit(1);
}
writeFileSync(DIST, injected, 'utf-8');
console.log(`prerender-seo: injected ${block.length} chars of crawlable content`);