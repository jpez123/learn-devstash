# Current Feature

## Prisma + Neon PostgreSQL Setup

Set up Prisma ORM with Neon PostgreSQL (serverless) database. Includes initial schema based on project data models, NextAuth tables, indexes, and cascade deletes. Using Prisma 7 with migration-based workflow (no `db push`).

## Status

In Progress

## Goals

- Install and configure Prisma 7 with Neon PostgreSQL (serverless)
- Create initial schema based on data models in `project-overview.md` (User, Item, ItemType, Collection, ItemCollection, Tag, TagsOnItems)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Create initial migration using `prisma migrate dev` (never `db push`)
- Set up Prisma client singleton in `src/lib/prisma.ts`
- Configure `DATABASE_URL` environment variable for Neon dev branch

## Notes

- Use Prisma 7 — has breaking changes vs v6. Read the upgrade guide before implementing.
- We use a **development branch** in Neon (`DATABASE_URL`) and a separate **production branch**. Always create migrations, never push directly.
- All schema changes must go through `prisma migrate dev` in development and `prisma migrate deploy` in production.
- Reference: `context/features/database-spec.md`

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-23** — Initial Next.js project setup (Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Compiler)
- **2026-03-23** — Completed Dashboard UI Phase 1: ShadCN UI setup, /dashboard route, dark mode, top bar with logo/search/actions, responsive sidebar placeholder
- **2026-03-25** — Completed Dashboard UI Phase 2: Collapsible sidebar with icon-only mode, item type links, collapsible Types/Collections sections, favorite collections, all collections, user avatar area, mobile drawer with slide animation, sidebar toggle inside sidebar, mobile hamburger in top bar
- **2026-03-25** — Completed Dashboard UI Phase 3: Stats cards, recent collections grid, pinned items section, recent items list; extracted StatsCard, CollectionCard, ItemRow, and shared TypeIcon components
