# Current Feature

Seed Script — Populate the database with sample data for development and demos.

## Status

In Progress

## Goals

Create `prisma/seed.ts` that populates the database with realistic sample data:

- **Demo user**: `demo@devstash.io` / `Demo User` / password `12345678` (bcryptjs, 12 rounds), `isPro: false`, `emailVerified: now`
- **System item types**: snippet, prompt, command, note, file, image, link (with correct icons/colors, `isSystem: true`)
- **Collections & items**:
  - **React Patterns** — 3 TypeScript snippets (custom hooks, component patterns, utility functions)
  - **AI Workflows** — 3 prompts (code review, documentation generation, refactoring assistance)
  - **DevOps** — 1 snippet (Docker/CI-CD config), 1 command (deployment scripts), 2 links (real docs URLs)
  - **Terminal Commands** — 4 commands (git ops, docker, process management, package manager utilities)
  - **Design Resources** — 4 links (real URLs: CSS/Tailwind refs, component libs, design systems, icon libs)

## Notes

- Use `upsert` or `deleteMany` + `create` to make the script idempotent (safe to re-run)
- Wire up in `package.json` via `prisma.seed` field: `"seed": "tsx prisma/seed.ts"`
- System item types are already partially seeded — the script should handle that gracefully (upsert by name)
- Use real, working URLs for links

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-23** — Initial Next.js project setup (Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Compiler)
- **2026-03-23** — Completed Dashboard UI Phase 1: ShadCN UI setup, /dashboard route, dark mode, top bar with logo/search/actions, responsive sidebar placeholder
- **2026-03-25** — Completed Dashboard UI Phase 2: Collapsible sidebar with icon-only mode, item type links, collapsible Types/Collections sections, favorite collections, all collections, user avatar area, mobile drawer with slide animation, sidebar toggle inside sidebar, mobile hamburger in top bar
- **2026-03-25** — Completed Dashboard UI Phase 3: Stats cards, recent collections grid, pinned items section, recent items list; extracted StatsCard, CollectionCard, ItemRow, and shared TypeIcon components
- **2026-03-26** — Completed Prisma 7 + Neon PostgreSQL setup: full schema with all models and indexes, two migrations (init + ItemType unique constraint), seeded 7 system item types, Prisma client singleton with PrismaPg adapter, prisma.config.ts, db scripts
