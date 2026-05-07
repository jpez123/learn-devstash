'use client'

import { useState } from 'react'
import Link from 'next/link'

const freeFeatures = [
  { included: true, text: '50 items total' },
  { included: true, text: '3 collections' },
  { included: true, text: 'All text item types' },
  { included: true, text: 'Basic search' },
  { included: false, text: 'File & image uploads' },
  { included: false, text: 'AI features' },
]

const proFeatures = [
  'Unlimited items',
  'Unlimited collections',
  'File & image uploads',
  'AI auto-tagging',
  'AI code explanation',
  'Prompt optimizer & summaries',
]

export function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="py-[100px] px-0" style={{ background: '#161b22' }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold mb-3.5 text-[#e6edf3]">
            Simple, honest{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              pricing
            </span>
          </h2>
          <p className="text-[#8b949e] text-[1.05rem] mb-6">Start free. Upgrade when you need more power.</p>

          {/* Toggle */}
          <div className="flex items-center gap-3 justify-center mt-6">
            <span className={`text-[0.9rem] transition-colors ${yearly ? 'text-[#8b949e]' : 'text-[#e6edf3]'}`}>Monthly</span>
            <button
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly(!yearly)}
              className="relative w-[44px] h-6 rounded-full transition-colors duration-200 cursor-pointer"
              style={{
                background: yearly ? 'rgba(59,130,246,0.2)' : '#21262d',
                border: yearly ? '1px solid #3b82f6' : '1px solid #30363d',
              }}
            >
              <span
                className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full transition-all duration-200"
                style={{
                  background: yearly ? '#3b82f6' : '#8b949e',
                  transform: yearly ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
            <span className={`text-[0.9rem] flex items-center gap-2 transition-colors ${yearly ? 'text-[#e6edf3]' : 'text-[#8b949e]'}`}>
              Yearly
              <span
                className="text-[0.7rem] font-semibold px-[7px] py-px rounded-[10px]"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                Save 25%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[760px] mx-auto">
          {/* Free */}
          <div
            className="rounded-2xl p-9 flex flex-col relative"
            style={{ background: '#0d1117', border: '1px solid #30363d' }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.08em] mb-3 text-[#8b949e]">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[2.6rem] font-extrabold text-[#e6edf3]">$0</span>
              <span className="text-[0.9rem] text-[#8b949e]">/ forever</span>
            </div>
            <p className="text-[0.78rem] mb-6 text-[#8b949e]" style={{ minHeight: '1.2em' }}>&nbsp;</p>
            <ul className="flex flex-col gap-2.5 mb-7 flex-1">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5 text-[0.88rem]">
                  <span className="font-bold flex-shrink-0" style={{ color: f.included ? '#22c55e' : '#30363d' }}>
                    {f.included ? '✓' : '✗'}
                  </span>
                  <span className={f.included ? 'text-[#e6edf3]' : 'text-[#8b949e]'}>{f.text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full text-center rounded-[10px] py-3 font-semibold text-[0.95rem] text-[#e6edf3] transition-colors hover:border-[#3b82f6] hover:bg-[rgba(59,130,246,0.05)]"
              style={{ border: '1px solid #30363d' }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl p-9 flex flex-col relative"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), #0d1117)', border: '1px solid #3b82f6' }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.72rem] font-bold px-3.5 py-[3px] rounded-full whitespace-nowrap text-white"
              style={{ background: '#3b82f6' }}
            >
              Most Popular
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] mb-3 text-[#8b949e]">Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-[2.6rem] font-extrabold text-[#e6edf3]">{yearly ? '$72' : '$8'}</span>
              <span className="text-[0.9rem] text-[#8b949e]">{yearly ? '/ year' : '/ month'}</span>
            </div>
            <p className="text-[0.78rem] mb-6 text-[#8b949e]" style={{ minHeight: '1.2em' }}>
              {yearly ? '$6/mo billed annually — save $24' : ' '}
            </p>
            <ul className="flex flex-col gap-2.5 mb-7 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[0.88rem] text-[#e6edf3]">
                  <span className="font-bold flex-shrink-0 text-[#22c55e]">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full text-center rounded-[10px] py-3 font-semibold text-[0.95rem] text-white bg-[#3b82f6] hover:bg-[#2563eb] hover:-translate-y-px transition-all"
            >
              Start Pro Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
