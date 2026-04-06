---
name: DevStash Architecture Overview
description: Key architectural decisions and patterns discovered during initial audit — prevents false positives and guides future scans
type: project
---

Auth is NOT yet implemented — no NextAuth config, no middleware.ts, no API routes, no auth checks exist. The entire app runs off a hardcoded DEMO_EMAIL constant. Do not flag missing auth on routes as a security issue until auth is wired up.

**Why:** Project is in early development. Auth is planned (NextAuth v5 + email/password + GitHub OAuth per spec) but not yet built.

**How to apply:** When auditing auth, only report issues if auth code is actually present. The DEMO_EMAIL pattern is intentional dev scaffolding.

---

## Key Patterns Observed

- `DEMO_EMAIL = 'demo@devstash.io'` hardcoded in both `src/app/(dashboard)/layout.tsx` and `src/app/(dashboard)/dashboard/page.tsx` — intentional dev placeholder, not a credential leak (no password in source)
- No API routes exist yet (`src/app/api/` is empty)
- No Server Actions exist yet (`src/actions/` does not exist)
- No middleware.ts exists
- `src/lib/mock-data.ts` exists but is NOT imported anywhere in the app — leftover from earlier dev phase
- DB query functions correctly placed in `src/lib/db/collections.ts` and `src/lib/db/items.ts`
- Prisma client uses singleton pattern with PrismaPg adapter for Neon

## Confirmed Correct Patterns (avoid false positives)

- No `tailwind.config.ts` — correct for Tailwind v4 (CSS-based config in globals.css)
- `.env` in `.gitignore` — no exposed secrets
- `src/generated/` in `.gitignore` — correct for Prisma generated client
- React Compiler enabled in next.config.ts — intentional
- `DATABASE_URL` read from env via `process.env.DATABASE_URL!` — correct

## Schema: Missing Index

- `Item.createdAt` has no dedicated index. `getRecentItems` orders by `createdAt DESC` but the only related index is `userId_lastUsedAt`. A `@@index([userId, createdAt])` would help this query.

## Datasource URL

- `prisma/schema.prisma` datasource block has NO `url` field — relies on `prisma.config.ts` for the URL at migrate time. This is the Prisma 7 style with a separate config file. Not a bug.
