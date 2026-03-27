import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const systemItemTypes = [
  {
    name: "snippet",
    icon: "Code",
    color: "#3b82f6",
    category: "TEXT" as const,
    isSystem: true,
  },
  {
    name: "prompt",
    icon: "Sparkles",
    color: "#8b5cf6",
    category: "TEXT" as const,
    isSystem: true,
  },
  {
    name: "command",
    icon: "Terminal",
    color: "#f97316",
    category: "TEXT" as const,
    isSystem: true,
  },
  {
    name: "note",
    icon: "StickyNote",
    color: "#fde047",
    category: "TEXT" as const,
    isSystem: true,
  },
  {
    name: "link",
    icon: "Link",
    color: "#10b981",
    category: "URL" as const,
    isSystem: true,
  },
  {
    name: "file",
    icon: "File",
    color: "#6b7280",
    category: "FILE" as const,
    isSystem: true,
  },
  {
    name: "image",
    icon: "Image",
    color: "#ec4899",
    category: "FILE" as const,
    isSystem: true,
  },
];

async function main() {
  console.log("Seeding system item types...");

  for (const itemType of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { name_isSystem: { name: itemType.name, isSystem: true } },
      update: itemType,
      create: itemType,
    });
    console.log(`  ✓ ${itemType.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
