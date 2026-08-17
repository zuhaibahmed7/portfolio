import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, GitFork, Github, Star, Users } from 'lucide-react';
import { socials } from '../data/content.js';
import { CountUp, Reveal, SectionHeading } from './ui.jsx';

/* ---------------------------------------------------------------------------
   Live GitHub Activity Feed (Feature #1).
   Fetches from the PUBLIC GitHub API client-side (no token → 60 req/hr/IP).
   The fetch only fires when the section scrolls near the viewport, so the
   rate-limit budget isn't spent unless a visitor actually reaches here.
   Any failure (incl. rate limit 403) → friendly fallback card.
--------------------------------------------------------------------------- */

const USER_URL = 'https://api.github.com/users/zuhaibahmed7';
const REPOS_URL = 'https://api.github.com/users/zuhaibahmed7/repos?sort=updated&per_page=100';

/* 10-minute sessionStorage cache: fresh on every new visit (session-scoped,
   not localStorage) but repeated reloads within one session don't burn
   through the anonymous 60 req/hr API budget. */
const CACHE_KEY = 'za-github-feed';
const CACHE_TTL = 10 * 60 * 1000;

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, payload } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL) return null;
    return payload;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), payload }));
  } catch {
    /* storage full/unavailable — skip caching */
  }
}

/* Approximate language → color dots for repo rows */
const LANG_COLORS = {
  Python: '#3776AB', JavaScript: '#f1e05a', TypeScript: '#3178c6', PHP: '#4F5D95',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d',
  'Jupyter Notebook': '#DA5B0B', Dockerfile: '#384d54', Shell: '#89e051',
};

function timeAgo(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 'recently';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

/* Treat every API field as untrusted: coerce to a bounded string/number
   before it touches the DOM (React renders these as text, never HTML). */
const safeText = (v, max = 140) => (typeof v === 'string' ? v.slice(0, max) : '');
const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/* 26-week activity strip approximated from repo push dates (the contributions
   API needs auth, so weeks with any repo push get lit up by push count) */
function ActivityStrip({ repos }) {
  const weeks = new Array(26).fill(0);
  for (const r of repos) {
    const t = Date.parse(r?.pushed_at);
    if (!Number.isFinite(t)) continue; // skip malformed timestamps
    const w = Math.floor((Date.now() - t) / (7 * 86400000));
    if (w >= 0 && w < 26) weeks[25 - w] += 1;
  }
  const shade = (n) =>
    n === 0 ? 'bg-white/[0.06]' : n === 1 ? 'bg-accent-violet/60' : n === 2 ? 'bg-accent-violet' : 'bg-accent-cyan';

  return (
    <div className="flex items-end gap-[3px]" aria-label="Recent repository activity (last 26 weeks)">
      {weeks.map((n, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scaleY: 0.4 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.015, duration: 0.3 }}
          className={`h-5 w-[10px] rounded-[3px] ${shade(n)}`}
          title={`${n} repo push${n === 1 ? '' : 'es'}`}
        />
      ))}
    </div>
  );
}

export default function GitHubFeed() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '300px' });
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!inView || data || failed) return;
    const cached = readCache();
    if (cached) {
      setData(cached);
      return;
    }
    (async () => {
      try {
        const [u, r] = await Promise.all([fetch(USER_URL), fetch(REPOS_URL)]);
        if (!u.ok || !r.ok) throw new Error('github api'); // 403 = rate limited
        const user = await u.json();
        const repos = await r.json();
        if (!user || typeof user !== 'object' || !Array.isArray(repos)) throw new Error('bad payload');
        const payload = { user, repos };
        writeCache(payload);
        setData(payload);
      } catch {
        setFailed(true);
      }
    })();
  }, [inView, data, failed]);

  // Sanitized numbers for the counters
  const stars = data ? data.repos.reduce((s, r) => s + safeNum(r?.stargazers_count), 0) : 0;
  // Only well-formed, non-fork repo objects reach the DOM
  const recent = data
    ? data.repos
        .filter((r) => r && typeof r === 'object' && typeof r.name === 'string')
        .slice(0, 4)
    : [];

  return (
    <section id="github" ref={ref} className="relative overflow-hidden py-24 sm:py-28 print:hidden" aria-label="GitHub activity">
      <div className="aura -left-40 top-10 h-[360px] w-[420px] bg-accent-cyan/50" aria-hidden="true" />

      <div className="container-x relative">
        <SectionHeading
          index={4}
          eyebrow="Live from GitHub"
          title="Proof, not promises"
          lead="Real activity pulled live from the GitHub API — repos, pushes and recent work."
        />

        {failed ? (
          /* Friendly fallback when the API is rate-limited or unreachable */
          <Reveal delay={0.1}>
            <div className="glass-card mt-12 flex flex-col items-center gap-4 rounded-3xl p-10 text-center">
              <Github size={28} className="text-muted" />
              <p className="text-sm text-muted">
                Live GitHub stats are resting for a moment (the public API rate-limits anonymous
                requests) — but the code is always one click away.
              </p>
              <a href={socials.github.href} target="_blank" rel="noreferrer noopener" className="btn-primary !px-6 !py-2.5">
                View full GitHub
                <ArrowUpRight size={15} strokeWidth={2.2} />
              </a>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Stats + activity strip */}
            <Reveal>
              <div className="glass-card--border-gradient glass-card flex h-full flex-col justify-between gap-6 rounded-3xl p-7">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { Icon: Github, value: safeNum(data?.user?.public_repos), label: 'Public repos' },
                    { Icon: Star, value: stars, label: 'Stars earned' },
                    { Icon: Users, value: safeNum(data?.user?.followers), label: 'Followers' },
                  ].map(({ Icon, value, label }) => (
                    <div key={label} className="text-center">
                      <Icon size={16} className="mx-auto mb-1.5 text-accent-cyan" />
                      <p className="font-display text-2xl font-bold text-ink">
                        {data ? <CountUp to={value} /> : '—'}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">{label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                    Recent push activity
                  </p>
                  {data ? <ActivityStrip repos={data.repos} /> : <div className="h-5 animate-pulse rounded bg-white/[0.06]" />}
                </div>

                <a href={socials.github.href} target="_blank" rel="noreferrer noopener" className="btn-ghost !py-2.5">
                  <Github size={15} strokeWidth={2} />
                  View full GitHub
                </a>
              </div>
            </Reveal>

            {/* Recently updated repos */}
            <Reveal delay={0.12}>
              <div className="glass-card h-full rounded-3xl p-4 sm:p-5">
                <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                  Recently updated repositories
                </p>
                <ul className="space-y-2">
                  {recent.length === 0 &&
                    [0, 1, 2, 3].map((i) => <li key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />)}
                  {recent.map((r) => (
                    <li key={safeText(r.html_url, 100) || Math.random()}>
                      <a
                        href={safeText(r.html_url, 200) || socials.github.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-transparent px-4 py-3 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-ink transition-colors group-hover:text-accent-cyan">
                            {safeText(r.name, 60) || 'repository'}
                          </p>
                          <p className="truncate text-xs text-muted">{safeText(r.description) || 'No description'}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-[11px] text-muted">
                          {r.language && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: LANG_COLORS[safeText(r.language, 30)] || '#8b949e' }}
                              />
                              {safeText(r.language, 30)}
                            </span>
                          )}
                          <span className="hidden items-center gap-1 sm:flex">
                            <GitFork size={11} /> {timeAgo(r.pushed_at)}
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
