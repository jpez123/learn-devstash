import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #30363d' }} className="pt-[60px] pb-6">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-[60px] mb-12">
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-[1.1rem] text-[#e6edf3] mb-2.5">
              <span className="text-[1.3rem]">⚡</span>
              <span>DevStash</span>
            </Link>
            <p className="text-[0.875rem] text-[#8b949e]">Your developer knowledge hub.</p>
          </div>

          <div className="flex gap-12 flex-wrap">
            <div className="flex flex-col gap-2.5">
              <p className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[#8b949e] mb-1">Product</p>
              <a href="#features" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Features</a>
              <a href="#pricing" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Pricing</a>
              <a href="#" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Changelog</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[#8b949e] mb-1">Company</p>
              <a href="#" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">About</a>
              <a href="#" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Blog</a>
              <a href="#" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Contact</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[#8b949e] mb-1">Legal</p>
              <a href="#" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Privacy</a>
              <a href="#" className="text-[0.875rem] text-[#8b949e] hover:text-[#e6edf3] transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="pt-5 text-[0.8rem] text-[#8b949e]" style={{ borderTop: '1px solid #30363d' }}>
          © {new Date().getFullYear()} DevStash. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
