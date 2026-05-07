import Link from 'next/link'
import { FadeIn } from './FadeIn'
import { HeroChaosAnimation } from './HeroChaosAnimation'

export function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-24 px-6 gap-16">
      {/* Text — centered */}
      <FadeIn className="text-center max-w-2xl">
        <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.15] mb-5 text-[#e6edf3]">
          Stop Losing Your<br />
          <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Developer Knowledge
          </span>
        </h1>
        <p className="text-lg text-[#8b949e] mb-8 max-w-[520px] mx-auto">
          Snippets in VS Code. Prompts in chat history. Commands in .txt files. Links in bookmarks.
          It&apos;s time to bring it all together.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-[10px] px-[30px] py-[14px] text-base font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] hover:-translate-y-px transition-all"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-[10px] px-[30px] py-[14px] text-base font-semibold text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
          >
            See Features →
          </a>
        </div>
      </FadeIn>

      {/* Visual — full width below */}
      <FadeIn delay={150} className="flex items-center gap-5 w-full max-w-[900px]">
        {/* Chaos box */}
        <div className="flex-1 min-w-0">
          <p className="text-[0.72rem] text-[#8b949e] uppercase tracking-[0.08em] mb-2.5 text-center">
            Your knowledge today...
          </p>
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{ height: 280, background: '#161b22', border: '1px solid #30363d' }}
          >
            <HeroChaosAnimation />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 text-[#3b82f6]">
          <svg viewBox="0 0 36 24" fill="none" className="w-9 h-6 hero-arrow">
            <path
              d="M0 12 H26 M14 2 L26 12 L14 22"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Dashboard mockup */}
        <div className="flex-1 min-w-0">
          <p className="text-[0.72rem] text-[#8b949e] uppercase tracking-[0.08em] mb-2.5 text-center">
            ...with DevStash
          </p>
          <div
            className="flex overflow-hidden rounded-2xl"
            style={{ height: 280, background: '#161b22', border: '1px solid #30363d' }}
          >
            <div
              className="w-[120px] flex-shrink-0 flex flex-col gap-1 p-2"
              style={{ background: '#21262d', borderRight: '1px solid #30363d' }}
            >
              <div className="text-[0.65rem] font-bold text-[#8b949e] px-1 pb-2 mb-1" style={{ borderBottom: '1px solid #30363d' }}>
                ⚡ DevStash
              </div>
              <div className="text-[0.62rem] rounded px-1.5 py-[5px] text-[#3b82f6]" style={{ background: 'rgba(59,130,246,0.15)' }}>📁 Snippets</div>
              <div className="text-[0.62rem] px-1.5 py-[5px] text-[#8b949e]">✨ Prompts</div>
              <div className="text-[0.62rem] px-1.5 py-[5px] text-[#8b949e]">⚡ Commands</div>
              <div className="text-[0.62rem] px-1.5 py-[5px] text-[#8b949e]">📝 Notes</div>
              <div className="text-[0.62rem] px-1.5 py-[5px] text-[#8b949e]">🔗 Links</div>
            </div>
            <div className="flex-1 p-3 grid grid-cols-3 gap-2 content-start overflow-hidden">
              {['#3b82f6', '#f59e0b', '#06b6d4', '#22c55e', '#ec4899', '#6366f1'].map((color) => (
                <div
                  key={color}
                  className="rounded-[6px] p-2"
                  style={{ background: '#21262d', border: '1px solid #30363d', borderTop: `3px solid ${color}` }}
                >
                  <div className="h-[6px] rounded w-[60%] mb-1.5" style={{ background: '#30363d' }} />
                  <div className="h-1 rounded mb-1" style={{ background: '#161b22' }} />
                  <div className="h-1 rounded w-[70%]" style={{ background: '#161b22' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      <style>{`
        .hero-arrow { animation: pulse-arrow 2s ease-in-out infinite; }
        @keyframes pulse-arrow {
          0%, 100% { opacity: 0.5; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.1); }
        }
      `}</style>
    </section>
  )
}
