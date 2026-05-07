# Homepage Spec

## Overview

Build the public marketing homepage at `/` (root route) based on the prototype at `prototypes/homepage/`. The page is for unauthenticated visitors — authenticated users should be redirected to `/dashboard`.

## Route

- `src/app/(marketing)/page.tsx` — homepage
- `src/app/(marketing)/layout.tsx` — minimal layout (no sidebar/dashboard shell)

## Auth Redirect

In the root page, check the session. If the user is authenticated, redirect to `/dashboard`.

## Component Breakdown

### Server Components (no interactivity)

- `Navbar` — logo, nav links, Sign In / Get Started buttons
- `HeroSection` — headline, subtext, CTAs, chaos box + dashboard mockup visual
- `FeaturesSection` — section header + 6 feature cards grid
- `AISection` — pro badge, checklist, code editor mockup with AI tags
- `CTASection` — final call-to-action banner
- `Footer` — brand, link columns, copyright

### Client Components (`'use client'`)

- `HeroChaosAnimation` — the 8 floating icons with drift/bounce/mouse-repulsion animation (wraps the chaos arena visual only)
- `PricingSection` — monthly/yearly billing toggle that swaps the Pro price ($8/mo vs $72/yr)
- `MobileNav` — hamburger toggle for mobile menu open/close state

## Sections & Content

### Navbar
- Logo: ⚡ DevStash (links to `/`)
- Nav links: Features (`#features`), Pricing (`#pricing`)
- Sign In → `/sign-in`
- Get Started → `/register`
- Mobile: hamburger opens dropdown with same links

### Hero
- Headline: "Stop Losing Your Developer Knowledge"
- Subtext: from prototype
- CTAs: "Get Started Free" → `/register`, "See Features →" → `#features`
- Visual: chaos box (animated icons via `HeroChaosAnimation`) → arrow → dashboard mockup

### Features (6 cards)
1. Code Snippets — blue `#3b82f6`
2. AI Prompts — amber `#f59e0b`
3. Instant Search — green `#22c55e`
4. Commands — cyan `#06b6d4`
5. Files & Docs (Pro badge) — slate `#64748b`
6. Collections — indigo `#6366f1`

Use Lucide icons matching the project's item type icons where they align (Code, Sparkles, Search, Terminal, File, Briefcase).

### AI Section
- "Pro Feature" badge
- Headline + 4 checklist items (Auto-tagging, Code Explanation, Prompt Optimizer, AI Summaries)
- Code editor mockup with `useDebounce.ts` snippet (static, styled with Tailwind dark panel)
- AI-generated tags displayed below the code

### Pricing
- Monthly/Yearly toggle — client component
- Free card: $0/forever, features list, "Get Started Free" → `/register`
- Pro card: $8/mo or $6/mo billed yearly ($72/yr), features list, "Start Pro Trial" → `/register`
- Pro card highlighted with "Most Popular" badge

### CTA Section
- Headline + subtext from prototype
- "Get Started Free" → `/register`

### Footer
- Logo + tagline
- Three link columns: Product (Features, Pricing), Company (placeholder hrefs), Legal (placeholder hrefs)
- Copyright year (static or via `new Date().getFullYear()` in a client span if needed — keep it simple, static is fine)

## Styling

- Tailwind CSS v4 + shadcn/ui
- Dark background matching dashboard dark theme (`bg-background`)
- Gradient text on key headline words: use `bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`
- Feature cards: dark card with colored top border or left accent matching type color
- Navbar: sticky, dark bg with border-bottom, slight backdrop blur
- Fully responsive: mobile-first stacking, hamburger nav on small screens

## Links Summary

| Element | Destination |
|---|---|
| Logo | `/` |
| Sign In | `/sign-in` |
| Get Started / CTA buttons | `/register` |
| Features nav link | `#features` |
| Pricing nav link | `#pricing` |
| See Features hero link | `#features` |
| Footer product links | `#features`, `#pricing` |
| Footer company/legal links | `#` (placeholder) |

## Notes

- No data fetching needed — fully static content
- Keep animation JS minimal; use CSS transitions where possible, `requestAnimationFrame` only for the chaos icon drift
- Do not reuse the dashboard layout — this page has its own minimal layout
- Run `npm run build` after implementation to verify no type errors
