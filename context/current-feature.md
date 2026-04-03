# Current Feature: Add Pro Badge to Sidebar

## Status

In Progress

## Goals

- Add a PRO badge to the File and Image item types in the sidebar
- Use ShadCN UI Badge component
- Badge should be clean and subtle
- "PRO" text must be uppercase

## Notes

- Only File and Image types are Pro-only (per project spec)
- Badge should not be visually noisy — keep it minimal

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
