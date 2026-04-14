# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run unit tests (server actions + utilities)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Stack

- **Next.js 16** with App Router, TypeScript, React 19
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **React Compiler** enabled (`babel-plugin-react-compiler`, `reactCompiler: true` in `next.config.ts`)
