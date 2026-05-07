import Link from 'next/link'
import { MobileNav } from './MobileNav'

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ background: 'rgba(13,17,23,0.6)', borderBottom: '1px solid #30363d' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-8 relative">
        <Link href="/" className="flex items-center gap-2 font-bold text-[1.1rem] text-[#e6edf3]">
          <span className="text-[1.3rem]">⚡</span>
          <span>DevStash</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 ml-auto">
          <a href="#features" className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className="text-sm px-[18px] py-[10px] rounded-[10px] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-[22px] py-[10px] rounded-[10px] font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] hover:-translate-y-px transition-all"
          >
            Get Started
          </Link>
        </div>

        <MobileNav />
      </div>
    </nav>
  )
}
