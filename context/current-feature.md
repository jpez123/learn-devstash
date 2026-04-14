# Current Feature: Fix GitHub OAuth Redirect Issue

## Status

In Progress

## Goals

- GitHub sign-in works on the first click (no double-click required)
- Redirect to `/dashboard` is reliable after GitHub OAuth completes
- Server action `signInWithGitHub` created in `src/actions/auth.ts`
- Sign-in page GitHub button converted from `onClick` handler to `<form action={...}>`
- Client-side `isGitHubLoading` state and `handleGitHub` function removed

## Notes

- Root cause: client-side `signIn` from `next-auth/react` has unreliable redirect behavior
- Fix: use server-side `signIn` from `@/auth` via a Server Action (NextAuth v5 recommended pattern)
- Use `redirectTo` (NextAuth v5), not `callbackUrl` (v4)
- No SessionProvider needed
- Credentials login stays as-is (`redirect: false` pattern works fine)
- Files to change: `src/actions/auth.ts` (new), `src/app/(auth)/sign-in/page.tsx` (update)

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-23** — Initial Next.js project setup (Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Compiler)
- **2026-03-23** — Completed Dashboard UI Phase 1: ShadCN UI setup, /dashboard route, dark mode, top bar with logo/search/actions, responsive sidebar placeholder
- **2026-03-25** — Completed Dashboard UI Phase 2: Collapsible sidebar with icon-only mode, item type links, collapsible Types/Collections sections, favorite collections, all collections, user avatar area, mobile drawer with slide animation, sidebar toggle inside sidebar, mobile hamburger in top bar
- **2026-03-25** — Completed Dashboard UI Phase 3: Stats cards, recent collections grid, pinned items section, recent items list; extracted StatsCard, CollectionCard, ItemRow, and shared TypeIcon components
- **2026-03-26** — Completed Prisma 7 + Neon PostgreSQL setup: full schema with all models and indexes, two migrations (init + ItemType unique constraint), seeded 7 system item types, Prisma client singleton with PrismaPg adapter, prisma.config.ts, db scripts
- **2026-03-26** — Completed seed script: demo user (demo@devstash.io), all 7 system item types upserted, 5 collections with 15 items (snippets, prompts, commands, links); installed bcryptjs + tsx, wired prisma.seed in package.json; script is idempotent
- **2026-04-01** — Completed Dashboard Collections: created src/lib/db/collections.ts with getRecentCollections (dominant type + all types per collection), updated CollectionCard to use DB type and show all type icons, updated dashboard page to async server component fetching real collections and stats from Neon via Prisma demo user
- **2026-04-01** — Completed Dashboard Items: created src/lib/db/items.ts with getPinnedItems and getRecentItems, updated ItemRow to use DB ItemWithMeta type, replaced all mock item data in dashboard page with real Neon/Prisma data, pinned section hidden when empty, favorite icon on CollectionCard changed from star to heart for consistency
- **2026-04-01** — Completed Stats & Sidebar: added getItemTypesWithCounts to items.ts (system types with per-user counts, ordered: snippets/prompts/commands/notes/files/images/links), added getSidebarCollections to collections.ts (favorites + 4 most recent), updated dashboard layout to async server component passing sidebar data as props, replaced all mock-data usage in Sidebar with real DB data; recents show colored circle based on dominant item type, favorites show heart icon, added "View all collections" link
- **2026-04-02** — Completed Pro Badge in Sidebar: installed ShadCN Badge component, added subtle outline PRO badge next to File and Image type names in the sidebar (Pro-only types); item counts preserved for all types
- **2026-04-05** — Completed Code Quality Quick Wins: extracted getDemoUser() utility to src/lib/db/user.ts (throws on missing seed data); fixed stable React key in CollectionCard (t.icon vs index); guarded UserAvatar against empty/whitespace name; removed dead toggle() from SidebarProvider; added dev-mode console.warn in TypeIcon for unknown icon names
- **2026-04-07** — Completed Auth Phase 1: NextAuth v5 with GitHub OAuth and Prisma adapter; split config pattern for edge compatibility (auth.config.ts / auth.ts); proxy.ts protects /dashboard/* routes with redirect to sign-in; Session type extended with user.id; /api/auth/[...nextauth] route handler wired up
- **2026-04-07** — Completed Auth Phase 2: Credentials provider added (placeholder in auth.config.ts, bcrypt validation in auth.ts); POST /api/auth/register route validates inputs, checks uniqueness, hashes password with bcryptjs, creates user
- **2026-04-07** — Completed Auth Phase 3: Custom /sign-in and /register pages with form validation and error display; Sonner toast on successful registration; reusable UserAvatar component (GitHub image or initials fallback); sidebar user area uses real session data with sign-out dropdown; auth.ts and proxy.ts updated to use /sign-in
- **2026-04-07** — Completed Email Verification: Resend sends verification email on register; token stored in VerificationToken (24h expiry); GET /api/auth/verify-email?token= marks emailVerified and deletes token; credentials sign-in blocked for unverified users with clear error; register toast updated to prompt checking email
- **2026-04-09** — Completed Email Verification Toggle: added EMAIL_VERIFICATION_ENABLED env var; when "false", skips Resend send and auto-sets emailVerified on registration, removes sign-in block; when "true" (default), full verification flow runs with error handling — failed sends roll back user+token and surface error to the register form
- **2026-04-09** — Completed Forgot Password: "Forgot password?" link on sign-in page; /forgot-password page (email form, always shows success to prevent enumeration); POST /api/auth/forgot-password generates 1h VerificationToken (identifier prefixed reset:) and sends Resend email; /reset-password?token= page (new + confirm password form, toast on success); POST /api/auth/reset-password validates token, hashes and updates password, deletes token
- **2026-04-09** — Completed Profile Page: /profile route (protected via proxy + layout auth check); user info card with avatar/name/email/join date; usage stats (total items, total collections, per-type breakdown with color dots); ChangePasswordForm (email users only, gated on user.password); DeleteAccountSection with confirmation dialog; POST /api/auth/change-password and DELETE /api/auth/delete-account API routes; installed ShadCN Dialog (base-ui)
- **2026-04-09** — Completed Rate Limiting for Auth: installed @upstash/ratelimit + @upstash/redis; created src/lib/rate-limit.ts with sliding window limiters (fail-open when unconfigured); protected register (3/hr IP), forgot-password (3/hr IP), reset-password (5/15min IP); added /api/auth/login-rate-check pre-flight endpoint (5/15min IP+email) called by sign-in form before signIn() to surface 429 messages; login rate limiting uses pre-flight pattern due to NextAuth swallowing errors from authorize
