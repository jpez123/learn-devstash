import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Navbar } from '@/components/marketing/Navbar'
import { HeroSection } from '@/components/marketing/HeroSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { AISection } from '@/components/marketing/AISection'
import { PricingSection } from '@/components/marketing/PricingSection'
import { CTASection } from '@/components/marketing/CTASection'
import { Footer } from '@/components/marketing/Footer'

export const metadata = {
  title: 'DevStash — Your Developer Knowledge Hub',
  description: 'One fast, searchable, AI-enhanced hub for all dev knowledge & resources.',
}

export default async function HomePage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen text-[#e6edf3]" style={{ background: '#0d1117' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AISection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
