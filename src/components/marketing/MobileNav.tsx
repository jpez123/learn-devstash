'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden p-1 transition-colors ml-auto text-[#8b949e] hover:text-[#e6edf3]"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          className="md:hidden absolute top-full left-0 right-0 z-50 flex flex-col gap-1 py-3 px-6"
          style={{ background: '#0d1117', borderTop: '1px solid #30363d' }}
        >
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#features" className="text-[0.95rem] py-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors" onClick={() => setOpen(false)}>
            Features
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#pricing" className="text-[0.95rem] py-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors" onClick={() => setOpen(false)}>
            Pricing
          </a>
          <Link href="/sign-in" className="text-[0.95rem] py-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors" onClick={() => setOpen(false)}>
            Sign In
          </Link>
          <Link
            href="/register"
            className="mt-2 text-center text-sm py-2.5 px-4 rounded-[10px] font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </>
  )
}
