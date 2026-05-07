import { FadeIn } from './FadeIn'

const checklist = [
  { title: 'Auto-tagging', description: 'AI suggests relevant tags as you save. Never forget to categorize again.' },
  { title: 'Code Explanation', description: 'Plain-English explanations of any snippet. Great for onboarding or revisiting old code.' },
  { title: 'Prompt Optimizer', description: 'Rewrite and improve your AI prompts for better results.' },
  { title: 'AI Summaries', description: 'One-line summary for any note or snippet, generated automatically.' },
]

export function AISection() {
  return (
    <section className="py-[100px] px-0">
      <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
        <FadeIn>
          <span
            className="inline-block text-[0.82rem] font-semibold px-3.5 py-1 rounded-full mb-5"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            ✨ Pro Feature
          </span>
          <h2 className="text-[clamp(1.7rem,3vw,2.4rem)] font-extrabold mb-7 leading-[1.25] text-[#e6edf3]">
            AI that actually<br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              understands code
            </span>
          </h2>
          <ul className="flex flex-col gap-5">
            {checklist.map((item) => (
              <li key={item.title} className="flex gap-3.5 items-start">
                <span className="flex-shrink-0 font-bold mt-0.5 text-[#22c55e]">✓</span>
                <div>
                  <strong className="block text-[0.95rem] mb-0.5 text-[#e6edf3]">{item.title}</strong>
                  <p className="text-[0.85rem] text-[#8b949e]">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={150}>
          <div
            className="rounded-[14px] overflow-hidden font-mono"
            style={{ background: '#0d1117', border: '1px solid #30363d' }}
          >
            <div
              className="flex items-center gap-1.5 px-3.5 py-2.5"
              style={{ background: '#21262d', borderBottom: '1px solid #30363d' }}
            >
              <span className="w-[11px] h-[11px] rounded-full flex-shrink-0" style={{ background: '#ff5f57' }} />
              <span className="w-[11px] h-[11px] rounded-full flex-shrink-0" style={{ background: '#febc2e' }} />
              <span className="w-[11px] h-[11px] rounded-full flex-shrink-0" style={{ background: '#28c840' }} />
              <span className="text-[0.78rem] ml-2 text-[#8b949e]">useDebounce.ts</span>
            </div>

            <div className="px-4 py-4 overflow-x-auto">
              <pre className="text-[0.78rem] leading-[1.65] whitespace-pre text-[#e6edf3]">
                <span style={{ color: '#ff7b72' }}>import</span>
                {' { useState, useEffect } '}
                <span style={{ color: '#ff7b72' }}>from</span>
                {' '}
                <span style={{ color: '#a5d6ff' }}>&apos;react&apos;</span>
                {'\n\n'}
                <span style={{ color: '#ff7b72' }}>export function</span>
                {' '}
                <span style={{ color: '#d2a8ff' }}>useDebounce</span>
                {'<T>(\n  value: T,\n  delay: '}
                <span style={{ color: '#79c0ff' }}>number</span>
                {'): T {\n  '}
                <span style={{ color: '#ff7b72' }}>const</span>
                {' [debouncedValue, setDebouncedValue] =\n    '}
                <span style={{ color: '#d2a8ff' }}>useState</span>
                {'<T>(value)\n\n  '}
                <span style={{ color: '#d2a8ff' }}>useEffect</span>
                {'(() => {\n    '}
                <span style={{ color: '#ff7b72' }}>const</span>
                {' timer = '}
                <span style={{ color: '#d2a8ff' }}>setTimeout</span>
                {'(() => {\n      '}
                <span style={{ color: '#d2a8ff' }}>setDebouncedValue</span>
                {'(value)\n    }, delay)\n    '}
                <span style={{ color: '#ff7b72' }}>return</span>
                {' () => '}
                <span style={{ color: '#d2a8ff' }}>clearTimeout</span>
                {'(timer)\n  }, [value, delay])\n\n  '}
                <span style={{ color: '#ff7b72' }}>return</span>
                {' debouncedValue\n}'}
              </pre>
            </div>

            <div
              className="px-4 py-3"
              style={{ borderTop: '1px solid #30363d', background: 'rgba(245,158,11,0.05)' }}
            >
              <p className="text-[0.75rem] mb-2 font-mono text-[#f59e0b]">✨ AI Generated Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {['react', 'hooks', 'debounce', 'typescript', 'performance'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.72rem] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
