import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── System Item Types ────────────────────────────────────────────────────────

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", category: "TEXT" as const, isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", category: "TEXT" as const, isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", category: "TEXT" as const, isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", category: "TEXT" as const, isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", category: "URL" as const, isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", category: "FILE" as const, isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", category: "FILE" as const, isSystem: true },
];

async function main() {
  // ─── System Item Types ──────────────────────────────────────────────────────

  console.log("Seeding system item types...");
  const itemTypeMap: Record<string, string> = {};

  for (const itemType of systemItemTypes) {
    const record = await prisma.itemType.upsert({
      where: { name_isSystem: { name: itemType.name, isSystem: true } },
      update: itemType,
      create: itemType,
    });
    itemTypeMap[itemType.name] = record.id;
    console.log(`  ✓ ${itemType.name}`);
  }

  // ─── Demo User ─────────────────────────────────────────────────────────────

  console.log("\nSeeding demo user...");
  const passwordHash = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ ${user.email}`);

  // ─── Clean up existing demo data so seed is idempotent ────────────────────

  console.log("\nCleaning up existing demo collections & items...");
  await prisma.collection.deleteMany({ where: { userId: user.id } });
  await prisma.item.deleteMany({ where: { userId: user.id } });

  // ─── Helper ────────────────────────────────────────────────────────────────

  async function createCollection(
    name: string,
    description: string,
    isFavorite = false
  ) {
    return prisma.collection.create({
      data: { name, description, isFavorite, userId: user.id },
    });
  }

  async function createItem(data: {
    title: string;
    description?: string;
    content?: string;
    url?: string;
    language?: string;
    typeName: string;
    isFavorite?: boolean;
    isPinned?: boolean;
  }) {
    const { typeName, ...rest } = data;
    return prisma.item.create({
      data: {
        ...rest,
        userId: user.id,
        itemTypeId: itemTypeMap[typeName],
      },
    });
  }

  async function linkItems(collectionId: string, itemIds: string[]) {
    await prisma.itemCollection.createMany({
      data: itemIds.map((itemId) => ({ itemId, collectionId })),
    });
  }

  // ─── React Patterns ────────────────────────────────────────────────────────

  console.log("\nSeeding React Patterns collection...");
  const reactPatterns = await createCollection(
    "React Patterns",
    "Reusable React patterns and hooks",
    true
  );

  const useDebounce = await createItem({
    title: "useDebounce & useLocalStorage hooks",
    description: "Custom hooks for debouncing values and persisting state in localStorage",
    language: "typescript",
    typeName: "snippet",
    isPinned: true,
    content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(stored) : value;
    setStored(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [stored, setValue] as const;
}`,
  });

  const contextPattern = await createItem({
    title: "Context Provider + compound component pattern",
    description: "Typed context with a custom hook and compound component structure",
    language: "typescript",
    typeName: "snippet",
    content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
  });

  const utilFunctions = await createItem({
    title: "React utility functions",
    description: "cn helper, formatDate, truncate, and other commonly used utilities",
    language: "typescript",
    typeName: "snippet",
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date relative to now (e.g. "2 hours ago") */
export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return \`\${minutes}m ago\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours}h ago\`;
  return \`\${Math.floor(hours / 24)}d ago\`;
}

/** Truncate a string to maxLength, appending "…" if needed */
export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : str.slice(0, maxLength - 1) + "…";
}`,
  });

  await linkItems(reactPatterns.id, [
    useDebounce.id,
    contextPattern.id,
    utilFunctions.id,
  ]);
  console.log("  ✓ React Patterns (3 snippets)");

  // ─── AI Workflows ──────────────────────────────────────────────────────────

  console.log("\nSeeding AI Workflows collection...");
  const aiWorkflows = await createCollection(
    "AI Workflows",
    "AI prompts and workflow automations",
    true
  );

  const codeReviewPrompt = await createItem({
    title: "Code review prompt",
    description: "Structured prompt for thorough AI code reviews",
    typeName: "prompt",
    isFavorite: true,
    content: `You are a senior software engineer conducting a code review. Analyze the following code and provide feedback on:

1. **Correctness** – Does it work as intended? Edge cases?
2. **Security** – Any vulnerabilities (injections, exposed secrets, auth issues)?
3. **Performance** – Unnecessary re-renders, N+1 queries, blocking operations?
4. **Readability** – Naming, structure, complexity?
5. **Best practices** – Language/framework conventions followed?

Format your response as:
- 🔴 **Critical** (must fix)
- 🟡 **Warning** (should fix)
- 🟢 **Suggestion** (nice to have)

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\``,
  });

  const docsPrompt = await createItem({
    title: "Documentation generation prompt",
    description: "Generate comprehensive JSDoc/TSDoc for a function or module",
    typeName: "prompt",
    content: `Generate complete TypeScript documentation for the following code. Include:

- A concise one-line summary
- A detailed description (2–3 sentences) explaining purpose and behavior
- @param tags for every parameter with type and description
- @returns tag describing the return value and shape
- @throws tags for any errors that may be raised
- @example with a realistic usage snippet

Keep descriptions developer-focused and precise. Do not add filler phrases.

Code:
\`\`\`typescript
[PASTE CODE HERE]
\`\`\``,
  });

  const refactorPrompt = await createItem({
    title: "Refactoring assistance prompt",
    description: "Get targeted refactoring suggestions with before/after examples",
    typeName: "prompt",
    content: `You are an expert software engineer. Refactor the following code to improve:
- Readability and clarity
- Separation of concerns
- Reusability
- TypeScript type safety

Rules:
- Preserve all existing behavior (no feature changes)
- Keep the same public API/exports
- Prefer composition over inheritance
- Show a before/after diff with a brief explanation of each change

Code:
\`\`\`typescript
[PASTE CODE HERE]
\`\`\``,
  });

  await linkItems(aiWorkflows.id, [
    codeReviewPrompt.id,
    docsPrompt.id,
    refactorPrompt.id,
  ]);
  console.log("  ✓ AI Workflows (3 prompts)");

  // ─── DevOps ────────────────────────────────────────────────────────────────

  console.log("\nSeeding DevOps collection...");
  const devops = await createCollection(
    "DevOps",
    "Infrastructure and deployment resources"
  );

  const dockerSnippet = await createItem({
    title: "Dockerfile + GitHub Actions CI/CD",
    description: "Production-ready Dockerfile and CI workflow for a Node.js app",
    language: "dockerfile",
    typeName: "snippet",
    content: `# ── Dockerfile ──────────────────────────────────────────
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]

# ── .github/workflows/deploy.yml ────────────────────────
# name: Deploy
# on:
#   push:
#     branches: [main]
# jobs:
#   deploy:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-node@v4
#         with:
#           node-version: 20
#           cache: npm
#       - run: npm ci
#       - run: npm run build
#       - run: npm run test
#       - uses: cloudflare/wrangler-action@v3 # or your deploy target`,
  });

  const deployCommand = await createItem({
    title: "Zero-downtime deployment script",
    description: "Deploy and migrate a Next.js + Prisma app with zero downtime",
    typeName: "command",
    content: `# Pull latest code and deploy with zero downtime
git pull origin main && \\
  npm ci --omit=dev && \\
  npm run db:migrate:deploy && \\
  npm run build && \\
  pm2 reload ecosystem.config.js --update-env`,
  });

  const prismaDocsLink = await createItem({
    title: "Prisma Migrate docs",
    description: "Official Prisma migration guide",
    typeName: "link",
    url: "https://www.prisma.io/docs/orm/prisma-migrate/getting-started",
  });

  const githubActionsLink = await createItem({
    title: "GitHub Actions – Node.js workflow",
    description: "Official GitHub Actions starter for Node.js CI",
    typeName: "link",
    url: "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs",
  });

  await linkItems(devops.id, [
    dockerSnippet.id,
    deployCommand.id,
    prismaDocsLink.id,
    githubActionsLink.id,
  ]);
  console.log("  ✓ DevOps (1 snippet, 1 command, 2 links)");

  // ─── Terminal Commands ─────────────────────────────────────────────────────

  console.log("\nSeeding Terminal Commands collection...");
  const terminalCommands = await createCollection(
    "Terminal Commands",
    "Useful shell commands for everyday development"
  );

  const gitOps = await createItem({
    title: "Git operations cheatsheet",
    description: "Frequently used git commands for branching, stashing, and history",
    typeName: "command",
    isPinned: true,
    content: `# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Stash untracked files too
git stash -u

# Interactive rebase last N commits
git rebase -i HEAD~3

# Clean merged branches
git branch --merged main | grep -v main | xargs git branch -d

# Find commit that introduced a bug
git bisect start && git bisect bad && git bisect good <good-sha>

# Show file history with diffs
git log -p -- path/to/file`,
  });

  const dockerCmds = await createItem({
    title: "Docker everyday commands",
    description: "Container management, cleanup, and inspection commands",
    typeName: "command",
    content: `# Remove all stopped containers, unused images, networks, and build cache
docker system prune -af --volumes

# Follow logs for a container
docker logs -f <container_name>

# Shell into a running container
docker exec -it <container_name> sh

# Inspect container env vars
docker inspect <container_name> | jq '.[0].Config.Env'

# Build and tag
docker build -t myapp:latest .

# Run with env file and port mapping
docker run --env-file .env -p 3000:3000 myapp:latest`,
  });

  const processCmd = await createItem({
    title: "Process management",
    description: "Find, monitor, and kill processes by port or name",
    typeName: "command",
    content: `# Find and kill process on a port
lsof -ti:3000 | xargs kill -9

# Watch CPU/memory usage live
top -o cpu

# List all node processes
ps aux | grep node

# Kill all node processes
pkill -f node

# Check what's listening on all ports
lsof -i -P -n | grep LISTEN

# PM2 — start, list, logs, restart
pm2 start ecosystem.config.js
pm2 list
pm2 logs --lines 50
pm2 restart all`,
  });

  const npmCmds = await createItem({
    title: "Package manager utilities",
    description: "npm, pnpm, and npx commands for dependency management",
    typeName: "command",
    content: `# Check for outdated packages
npm outdated

# Update all deps to latest (respects semver)
npm update

# Interactive upgrade (npm-check-updates)
npx npm-check-updates -i

# Audit and auto-fix vulnerabilities
npm audit fix

# List installed package versions
npm list --depth=0

# Clear npm cache
npm cache clean --force

# Run a package binary without installing globally
npx <package> [args]

# pnpm equivalents
pnpm outdated
pnpm update --interactive --latest`,
  });

  await linkItems(terminalCommands.id, [
    gitOps.id,
    dockerCmds.id,
    processCmd.id,
    npmCmds.id,
  ]);
  console.log("  ✓ Terminal Commands (4 commands)");

  // ─── Design Resources ──────────────────────────────────────────────────────

  console.log("\nSeeding Design Resources collection...");
  const designResources = await createCollection(
    "Design Resources",
    "UI/UX resources and references"
  );

  const tailwindLink = await createItem({
    title: "Tailwind CSS v4 docs",
    description: "Official Tailwind CSS v4 documentation",
    typeName: "link",
    isFavorite: true,
    url: "https://tailwindcss.com/docs",
  });

  const shadcnLink = await createItem({
    title: "shadcn/ui component library",
    description: "Accessible, composable React components built on Radix UI",
    typeName: "link",
    isFavorite: true,
    url: "https://ui.shadcn.com/docs",
  });

  const radixLink = await createItem({
    title: "Radix UI design system",
    description: "Unstyled, accessible component primitives for React",
    typeName: "link",
    url: "https://www.radix-ui.com/themes/docs/overview/getting-started",
  });

  const lucideLink = await createItem({
    title: "Lucide icon library",
    description: "Beautiful & consistent open-source icons for React",
    typeName: "link",
    url: "https://lucide.dev/icons/",
  });

  await linkItems(designResources.id, [
    tailwindLink.id,
    shadcnLink.id,
    radixLink.id,
    lucideLink.id,
  ]);
  console.log("  ✓ Design Resources (4 links)");

  console.log("\nSeeding complete! ✓");
  console.log(`  Demo user: demo@devstash.io / 12345678`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
