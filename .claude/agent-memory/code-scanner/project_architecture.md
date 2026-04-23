---
name: DevStash Architecture Overview
description: Key architectural decisions, auth patterns, confirmed safe patterns, and known issues discovered during audits
type: project
---

## Auth Status (as of April 2026 audit)

Auth IS fully wired up via NextAuth v5 with the split-config pattern:
- `src/auth.config.ts` — edge-safe providers stub (for middleware)
- `src/auth.ts` — full server auth with PrismaAdapter, bcrypt credentials, JWT callbacks
- `src/proxy.ts` — middleware protecting `/dashboard/*` and `/profile` routes

Rate limiting via Upstash on: register (3/hr), forgot-password (3/hr), reset-password (5/15min), login pre-flight (5/15min). Fails open when env vars absent — intentional for local dev.

`passwordChangedAt` field used in JWT callback to invalidate old tokens after password change. Correctly implemented security pattern — do NOT flag as missing.

## Known Scaffolding / In-Progress (updated April 2026, second audit)

- `src/app/(dashboard)/dashboard/page.tsx` NOW uses `session.user.id` correctly — getDemoUser() call was removed. FIXED.
- `src/lib/mock-data.ts` exists but is not imported anywhere — dead code from early dev. Still present.
- `updateItem` and `deleteItem` server actions now have try/catch. FIXED.
- `toItemDetail()` mapper extracted. FIXED.
- `getItemTypesWithCounts` now uses Prisma `_count`. FIXED.
- `formatFileSize` consolidated into `src/lib/utils.ts`. FIXED.

## Confirmed Correct Patterns (avoid false positives)

- No `tailwind.config.ts` — correct for Tailwind v4 (CSS-based config in globals.css)
- `.env*` in `.gitignore` — no exposed secrets
- `src/generated/` in `.gitignore` — correct for Prisma generated client
- React Compiler enabled in `next.config.ts` — intentional
- Tags are global (no userId on Tag model) — intentional per schema design
- `getItemTypesWithCounts` uses Prisma _count now — correct
- Download route ownership check (key.startsWith userId/) — correct and safe with UUID keys

## Remaining Issues (found in second audit, April 2026)

### High
- `DELETE /api/auth/delete-account` deletes the User DB record but does NOT clean up R2 files. User's files and images in Cloudflare R2 become permanently orphaned. Prisma cascade deletes Item rows but does not trigger R2 deletion.

### Medium
- `getSidebarCollections` in `src/lib/db/collections.ts` loads ALL user collections with full ItemCollection+ItemType join just to get dominant color. No `take` limit. Power users with many collections will experience slow sidebar loads.
- Missing DB index: `Item.createdAt` has no index. `getRecentItems` orders by `createdAt DESC` per-user. Should add `@@index([userId, createdAt])`.
- `formatDate()` is duplicated in 4 files: ItemCard.tsx, ItemRow.tsx, ItemDrawer.tsx, FileListRow.tsx. Should be in `src/lib/utils.ts`.
- `TEXT_TYPES`, `CODE_TYPES`, `MARKDOWN_TYPES` are duplicated between ItemDrawer.tsx and ItemCreateDialog.tsx.

### Low
- `ItemDrawer.tsx` line 113: `null as unknown as ItemDetail` on fetch error — unsound type cast. Should use a proper error state (`| 'error'`) instead.
- `src/lib/mock-data.ts` is dead code — never imported.
- `src/lib/db/user.ts` (getDemoUser) is also dead code — no longer called by any live page.
- `proxy.ts` matcher only covers `/dashboard/:path*` and `/profile`. The `/items/:path*` routes are NOT in the middleware matcher. They are protected only by the server-component auth check in the page. This is acceptable (defense in depth still present at the page level) but the middleware does not cover them.
- `register/route.ts` uses type assertion cast `body as { name, email, password, confirmPassword }` without Zod validation on the input body fields (only length/match checks done manually). Email format is not validated on the server side.
