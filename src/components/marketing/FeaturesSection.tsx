'use client'

import { FadeIn } from './FadeIn'

const features = [
  {
    color: '#3b82f6',
    title: 'Code Snippets',
    description: 'Save reusable code with syntax highlighting. Never rewrite the same function twice.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    color: '#f59e0b',
    title: 'AI Prompts',
    description: 'Store your best prompts, system messages, and AI workflows — ready to copy in a click.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M12 3l1.5 4.5H18l-3.75 2.75L15.75 15 12 12.25 8.25 15l1.5-4.75L6 7.5h4.5z" />
      </svg>
    ),
  },
  {
    color: '#22c55e',
    title: 'Instant Search',
    description: 'Full-text search across titles, content, tags, and types. Find anything in milliseconds.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    color: '#06b6d4',
    title: 'Commands',
    description: 'Never dig through .bash_history again. Store CLI commands, scripts, and one-liners.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    color: '#64748b',
    title: 'Files & Docs',
    description: 'Upload context files, PDFs, and images. Keep your reference materials alongside your code.',
    pro: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    color: '#6366f1',
    title: 'Collections',
    description: 'Group any item type into named collections. One snippet can live in multiple collections.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-[100px] px-0" style={{ background: '#161b22' }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold mb-3.5 text-[#e6edf3]">
            Everything a developer needs,{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in one place
            </span>
          </h2>
          <p className="text-[#8b949e] text-[1.05rem]">
            Seven item types, purpose-built for how developers actually think and work.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 60}>
              <div
                className="rounded-2xl p-7 transition-all duration-200 cursor-default h-full"
                style={{ background: '#0d1117', border: '1px solid #30363d' }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = f.color
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#30363d'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-[10px] flex items-center justify-center mb-4"
                  style={{ background: `${f.color}26`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-[1.05rem] mb-2 flex items-center gap-2 text-[#e6edf3]">
                  {f.title}
                  {f.pro && (
                    <span
                      className="text-[0.7rem] font-bold px-1.5 py-px rounded align-middle"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', letterSpacing: '0.05em' }}
                    >
                      Pro
                    </span>
                  )}
                </h3>
                <p className="text-[0.88rem] leading-[1.55] text-[#8b949e]">{f.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
