import Link from 'next/link'
import { FadeIn } from './FadeIn'

export function CTASection() {
  return (
    <section className="py-[100px] px-6">
      <FadeIn className="max-w-[900px] mx-auto text-center">
        <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold mb-4 text-[#e6edf3]">
          Ready to organize your<br />
          <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            developer knowledge?
          </span>
        </h2>
        <p className="text-[1.05rem] text-[#8b949e] mb-9">
          Join thousands of developers who stopped losing their best work.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-[10px] px-[30px] py-[14px] text-base font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] hover:-translate-y-px transition-all"
        >
          Get Started Free
        </Link>
      </FadeIn>
    </section>
  )
}
