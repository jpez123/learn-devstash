# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all dev knowledge & resources.**
> A SaaS for developers who are tired of their snippets in VS Code, prompts in chat history, commands in `.txt` files, and docs scattered across folders.

---

## Table of Contents

- [The Problem](#the-problem)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Data Models & Prisma Schema](#data-models--prisma-schema)
- [Item Types](#item-types)
- [Features](#features)
- [Monetization](#monetization)
- [UI/UX Guidelines](#uiux-guidelines)
- [Project Structure](#project-structure)
- [Useful Links](#useful-links)

---

## The Problem

Developers keep their essentials scattered across too many places:

| What          | Where it ends up                  |
| ------------- | --------------------------------- |
| Code snippets | VS Code, Notion, GitHub Gists     |
| AI prompts    | Chat history, random `.txt` files |
| Context files | Buried in project folders         |
| Useful links  | Browser bookmarks                 |
| Commands      | `.bash_history`, sticky notes     |
| Docs & notes  | Random folders, Notion, Obsidian  |

This creates **context switching**, **lost knowledge**, and **inconsistent workflows**. DevStash solves this with a single, unified, searchable hub.

---

## Target Users

| User                           | Pain Point                                      | Primary Use                                             |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| **Everyday Developer**         | Can't find that snippet they wrote 3 months ago | Quick grab of snippets, commands, links                 |
| **AI-first Developer**         | Prompts buried in chat history                  | Save prompts, system messages, context files, workflows |
| **Content Creator / Educator** | Course notes spread across tools                | Store code blocks, explanations, course notes           |
| **Full-stack Builder**         | Copy-pasting boilerplate between projects       | Collect patterns, boilerplates, API examples            |

## DevStash Project Specifications

## Problem (Core Idea)

Developers keep their essentials scattered:

- Code snippets in VS Code or Notion
- AI prompts in chats
- Context files buried in projects
- Useful links in bookmarks
- Docs in random folders
- Commands in .txt files
- Project templates in GitHu gists
- Terminal commands in bash history

This creates context switching, lost knowledge, and inconsistent workflows. DevStash provides ONE fast, searchable, AI-enhanced hub for all dev knowledge & resources.

## Users

- **Everyday Developer**:
  Needs a fast way to grab snippets, prompts, commands, links.

- **AI-first Developer**:
  Saves prompts, contexts, workflows, system messages.

- **Content Creator / Educator**:
  Stores code blocks, explanations, course notes.

- **Full-stack Builder**:
  Collects patterns, boilerplates, API examples.

## Features

Here is a list of features for DevStash.

A. **Items/Item Types**
Items can have types. Users will be able to create custom types, but we will start with the following system types that can not be changed:

- snippet
- prompt
- note
- command
- file (pro only)
- image (pro only)
- link

A type can be text (snippet, note, etc), url (link) or a file (file, image) URLs should look like - `/items/snippets`.

Items should be quick to access and create within a drawer.

B. **Collections**

Users can create collections that can have items of any type. An item can belong to multiple collections (e.g., a React snippet could be in both "React Patterns" and "Interview Prep").

Some examples may be:

- React Patterns (snippets, notes)
- Context Files (files)
- Python Snippets (snippets)

C. **Search**

Powerful search across:

- Content
- Tags
- Titles
- Types

D. **Authentication**

-Email/password or GitHub sign-in.

E. **Other Features**

- Collection and item favorites
- Items pin to top
- Recently used
- Import code from a file
- Markdown editor for text types
- File upload for file types (file/image)
- Export data as different formats
- Dark mode (default for devs)
- Add/remove items to/from multiple collections
- View which collections an item belongs to

F. **AI Features (Pro only)**

- AI auto-tag suggestions
- AI Summaries
- AI Explain This Code
- Prompt optimizer

## Data

This is a rough mockup of what the data will look like. This is not set in stone:

**USER** (extends NextAuth)

- isPro (for paid users)
- stripeCustomerId (for payments)
- stripeSubscriptionId (for - subscription management)

**ITEM**

- id
- title
- contentType (text | file)
- content (text content or null if file)
- fileUrl (R2 URL or null if text)
- fileName (original filename or null)
- fileSize (bytes or null)
- url (for link types)
- description
- isFavorite
- isPinned
- language (optional for code)
- createdAt
- updatedAt
- \*fields for user, itemType, tag relations (collection relation handled via join table)

**ITEMTYPE**

- id
- name
- icon
- color
- isSystem
- \*fields for user, item relations - user will be null for system types

**COLLECTION**

- id
- name ("React Hooks", "Prototype Prompts", "Context Files")
- description (optional)
- isFavorite
- defaultTypeId (for new - collections with no items)
- createdAt
- updatedAt
- \*fields for user relation (item relation handled via join table)

**ITEMCOLLECTION** (join table)

- itemId
- collectionId
- addedAt (tracks when item was added to collection)

**TAG**

- id
- name

## Tech Stack

- Framework Next.js 16 / React 19
- SSR pages with dynamic components.
- API routes for backend needs (storing items, file uploads, AI calls)
- One codebase/repo for less overhead
- TypeScript for type safety

**Database & ORM Neon**
PostgreSQL & Prisma

- Database in the cloud
- Prisma ORM for database connection and interaction
- Prisma 7 latest (Fetch latest docs)
- Redis for caching (Maybe)
- File Storage Cloudflare R2 for file uploads
- Authentication Next-Auth v5
- Email/password
- GitHub Oauth
- IMPORTANT: NEVER use db push or directly update db structure. We will create migrations that will be run in dev and then in prod.

**AI Integration**
OpenAI gpt-5-nano model

**CSS Frameworks**
Tailwind CSS v4 with ShadCN UI

## Monetization

We will work on a freemium system.

**Free:**

- 50 items total
- 3 collections
- All system types except files/images
- Basic search
- No file or image uploads
- No AI features

**Pro ($8/month or $72/year):**

- Unlimited items
- Unlimited collections
- File & Image uploads
- Custom types (Will come later)
- AI auto-tagging
- AI code explanation
- AI prompt optimizer
- Export data (JSON/ZIP)
- Priority support

Setup the foundation for pro users, but during development, all users can access everything.

## UI/UX

**General**

- Modern, minimal, developer-focused
- Dark mode by default, light mode optional
- Clean typography, generous whitespace
- Subtle borders and shadows
- Reference: Notion, Linear, Raycast
- Syntax highlighting for codeblocks

**Layout**

- Sidebar + main content (collapsible sidebar)
- Sidebar: Item types with links to items (Snippets, commands, etc), latest collections
- Main: Grid of color coded collection cards based on the items they hold the most of (background color). Items display under collections in color coded cards (border color)
- Individual items open in a quick to access drawer

**Type Colors & Icons**

- Snippet Color: #3b82f6 (blue)
- Snippet Icon: Code
- Prompt Color: #8b5cf6 (purple)
- Prompt Icon: Sparkles
- Command Color: #f97316 (orange)
- Command Icon: Terminal
- Note Color: #fde047 (yellow)
- Note Icon: StickyNote
- File Color: #6b7280 (gray)
- File Icon: File
- Image Color: #ec4899 (pink)
- Image Icon: Image
- Link Color: #10b981 (emerald)
- Link Icon: Link

**Responsive**

- Desktop-first but mobile usable
- Sidebar becomes drawer on mobile

**Micro-interactions:**

- Smooth transitions
- Hover states on cards
- Toast notifications for actions
- Loading skeletons

---

## Tech Stack

| Layer            | Technology                                                                            | Notes                                              |
| ---------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Framework**    | [Next.js 16](https://nextjs.org/docs) + React 19                                      | SSR + API routes in one repo                       |
| **Language**     | TypeScript                                                                            | Strict mode                                        |
| **Database**     | [Neon](https://neon.tech/docs) (PostgreSQL)                                           | Serverless Postgres                                |
| **ORM**          | [Prisma 7](https://www.prisma.io/docs)                                                | Migrations only — never `db push` in prod          |
| **Caching**      | Redis (optional)                                                                      | For search + session caching                       |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/)                                | File & image uploads (Pro)                         |
| **Auth**         | [NextAuth v5](https://authjs.dev/)                                                    | Email/password + GitHub OAuth                      |
| **AI**           | [OpenAI](https://platform.openai.com/docs) `gpt-4o-mini`                              | Tagging, summaries, code explain, prompt optimizer |
| **CSS**          | [Tailwind CSS v4](https://tailwindcss.com/docs) + [shadcn/ui](https://ui.shadcn.com/) | Dark mode default                                  |
| **Payments**     | [Stripe](https://stripe.com/docs)                                                     | Subscriptions + customer portal                    |

> ⚠️ **Migration rule:** Always create Prisma migrations (`prisma migrate dev`) — never use `prisma db push` against production.

---

## Data Models & Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── User ────────────────────────────────────────────────────────────────────

model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String?   @unique
  emailVerified         DateTime?
  image                 String?
  password              String?   // hashed, null for OAuth users
  isPro                 Boolean   @default(false)
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]
}

// ─── NextAuth tables ─────────────────────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── ItemType ────────────────────────────────────────────────────────────────

model ItemType {
  id       String      @id @default(cuid())
  name     String      // "snippet", "prompt", "command", etc.
  icon     String      // Lucide icon name, e.g. "Code", "Sparkles"
  color    String      // Hex color, e.g. "#3b82f6"
  category TypeCategory
  isSystem Boolean     @default(false)
  userId   String?     // null for system types

  user  User?  @relation(fields: [userId], references: [id], onDelete: Cascade)
  items Item[]
}

enum TypeCategory {
  TEXT
  URL
  FILE
}

// ─── Item ─────────────────────────────────────────────────────────────────────

model Item {
  id          String   @id @default(cuid())
  title       String
  description String?
  content     String?  @db.Text  // text content (null for file types)
  fileUrl     String?             // Cloudflare R2 URL
  fileName    String?             // original filename
  fileSize    Int?                // bytes
  url         String?             // for link types
  language    String?             // e.g. "typescript", "python"
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId     String
  itemTypeId String

  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType    ItemType         @relation(fields: [itemTypeId], references: [id])
  tags        TagsOnItems[]
  collections ItemCollection[]
}

// ─── Collection ───────────────────────────────────────────────────────────────

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?  // default ItemType for new items added to this collection
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String

  user  User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  items ItemCollection[]
}

// ─── ItemCollection (join table) ──────────────────────────────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

---

## Item Types

These are the **system types** (built-in, non-editable). Custom types come later as a Pro feature.

| Type        | Icon         | Color               | Category | Route             | Notes                        |
| ----------- | ------------ | ------------------- | -------- | ----------------- | ---------------------------- |
| **Snippet** | `Code`       | `#3b82f6` (blue)    | TEXT     | `/items/snippets` | Syntax-highlighted code      |
| **Prompt**  | `Sparkles`   | `#8b5cf6` (purple)  | TEXT     | `/items/prompts`  | AI prompts & system messages |
| **Command** | `Terminal`   | `#f97316` (orange)  | TEXT     | `/items/commands` | CLI commands & scripts       |
| **Note**    | `StickyNote` | `#fde047` (yellow)  | TEXT     | `/items/notes`    | Markdown notes               |
| **Link**    | `Link`       | `#10b981` (emerald) | URL      | `/items/links`    | Bookmarked URLs              |
| **File**    | `File`       | `#6b7280` (gray)    | FILE     | `/items/files`    | ⭐ Pro only                  |
| **Image**   | `Image`      | `#ec4899` (pink)    | FILE     | `/items/images`   | ⭐ Pro only                  |

> All icons reference [Lucide React](https://lucide.dev/icons/).

---

## Features

### Core

- **Items** — Create, view, edit, and delete items of any type. Items open in a **quick-access drawer** (no full page nav). Items can be pinned to the top.
- **Collections** — Group items of any type into named collections. One item can belong to multiple collections (e.g. a React snippet can live in both "React Patterns" and "Interview Prep").
- **Search** — Full-text search across title, content, tags, and type.
- **Tags** — Add/remove tags on any item; AI can suggest them (Pro).
- **Favorites** — Star collections and items.
- **Recently Used** — Track `lastUsedAt` on items; surface a "Recent" view.
- **Markdown editor** — For TEXT type items (snippet, note, prompt, command).
- **File uploads** — For FILE type items (Pro), stored on Cloudflare R2.
- **Import** — Import code from a file when creating a snippet.
- **Export** — Export all data as JSON or ZIP (Pro).
- **Dark mode** — Default. Light mode toggle available.

### Authentication

- Email + password (hashed with bcrypt)
- GitHub OAuth via NextAuth v5
- Session-based auth

### AI Features (Pro only)

| Feature               | Description                                | Model         |
| --------------------- | ------------------------------------------ | ------------- |
| **Auto-tag**          | Suggest relevant tags when saving an item  | `gpt-4o-mini` |
| **Summary**           | One-line AI summary for notes and snippets | `gpt-4o-mini` |
| **Explain This Code** | Plain-English explanation of any snippet   | `gpt-4o-mini` |
| **Prompt Optimizer**  | Rewrite and improve AI prompts             | `gpt-4o-mini` |

---

## Monetization

### Free Tier

- 50 items total
- 3 collections
- All system types **except** File & Image
- Basic search
- No AI features

### Pro — $8/month or $72/year (~25% off)

- Unlimited items & collections
- File & Image uploads (Cloudflare R2)
- All AI features
- Export as JSON / ZIP
- Custom item types _(future)_
- Priority support

> 💡 **Dev note:** During development, all users have full Pro access. Gate features behind `user.isPro` check once ready for launch.

### Stripe Integration

- `stripeCustomerId` — links the Anthropic user to a Stripe customer
- `stripeSubscriptionId` — tracks active subscription for webhook handling
- Webhook events to handle: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## UI/UX Guidelines

### Design Reference

Inspired by **[Notion](https://notion.so)**, **[Linear](https://linear.app)**, **[Raycast](https://raycast.com)**.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (collapsible)  │  Main Content              │
│                         │                            │
│  ▸ Snippets             │  [Collections Grid]        │
│  ▸ Prompts              │                            │
│  ▸ Commands             │  ┌──────┐ ┌──────┐        │
│  ▸ Notes                │  │  🔵  │ │  🟣  │        │
│  ▸ Links                │  │React │ │AI Pro│        │
│  ─────────────          │  └──────┘ └──────┘        │
│  Collections            │                            │
│  ▸ React Patterns       │  [Item Cards]              │
│  ▸ Interview Prep       │                            │
│  ▸ AI Workflows         │  ┌─────────────────────┐  │
│                         │  │ useCallback hook    │  │
│                         │  │ snippet · #react    │  │
│                         │  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
                               ↕ Click → Drawer opens
```

- **Sidebar** → collapses to icon-only on desktop, becomes a bottom drawer on mobile.
- **Collection cards** → color-coded by the most common item type they contain (background tint).
- **Item cards** → color-coded border by item type.
- **Item drawer** → slides in from the right on click. Fast to open, fast to close.

### Visual Style

- Dark mode default; light mode toggle
- Syntax highlighting for code blocks ([highlight.js](https://highlightjs.org/) or [Shiki](https://shiki.matsu.io/))
- Clean typography, generous whitespace
- Subtle borders and shadows
- Smooth transitions & hover states on cards
- Toast notifications for all CRUD actions
- Loading skeletons for async content

### Micro-interactions

- Card hover: subtle lift + border brighten
- Drawer: smooth slide-in animation
- Toast: non-blocking, bottom-right
- Search: debounced, instant results

---

## Project Structure

```
devstash/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + main shell
│   │   ├── page.tsx             # Home / all collections
│   │   ├── items/
│   │   │   ├── [type]/          # /items/snippets, /items/prompts, etc.
│   │   │   └── [id]/
│   │   └── collections/
│   │       └── [id]/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── items/
│       ├── collections/
│       ├── upload/              # R2 file upload handler
│       ├── ai/                  # AI feature endpoints
│       └── webhooks/stripe/
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── items/
│   │   ├── ItemCard.tsx
│   │   ├── ItemDrawer.tsx
│   │   └── ItemForm.tsx
│   ├── collections/
│   │   └── CollectionCard.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── SearchBar.tsx
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # NextAuth config
│   ├── r2.ts                    # Cloudflare R2 client
│   ├── openai.ts                # OpenAI client
│   └── stripe.ts                # Stripe client
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── types/
│   └── index.ts
└── middleware.ts                # Auth protection
```

## Screenshots

Refer to the screenshoots below as a base for the dashbaord UI. It does not have to be exact. Use it as a reference.

- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-drawer.png

---

## Useful Links

### Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Migrations Guide](https://www.prisma.io/docs/orm/prisma-migrate)
- [NextAuth v5 (Auth.js)](https://authjs.dev/getting-started)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Neon Postgres](https://neon.tech/docs/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Stripe Docs](https://stripe.com/docs)

### Design Reference

- [Linear](https://linear.app) — sidebar UX, item cards
- [Raycast](https://raycast.com) — command palette, search UX
- [Notion](https://notion.so) — content editing, collections
- [Shiki](https://shiki.matsu.io/) — syntax highlighting for code

---

_Last updated: March 2026_
