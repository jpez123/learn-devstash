import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // ─── System Item Types ──────────────────────────────────────────────────────

  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`✓ Connected to database`);
  console.log(`✓ Found ${itemTypes.length} system item types:\n`);
  for (const type of itemTypes) {
    console.log(`  ${type.color}  ${type.name.padEnd(10)} | ${type.category} | icon: ${type.icon}`);
  }

  // ─── Demo User ─────────────────────────────────────────────────────────────

  console.log();
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });

  if (!user) {
    console.log("✗ Demo user not found — run npm run db:seed first");
    return;
  }

  console.log(`✓ Demo user found:`);
  console.log(`  email:         ${user.email}`);
  console.log(`  name:          ${user.name}`);
  console.log(`  isPro:         ${user.isPro}`);
  console.log(`  emailVerified: ${user.emailVerified?.toISOString() ?? "null"}`);
  console.log(`  password hash: ${user.password ? "set" : "missing"}`);

  // ─── Collections ───────────────────────────────────────────────────────────

  console.log();
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { items: { include: { item: { include: { itemType: true } } } } },
    orderBy: { name: "asc" },
  });

  console.log(`✓ Found ${collections.length} collections:\n`);
  for (const col of collections) {
    const itemCount = col.items.length;
    console.log(`  ${col.name} (${itemCount} item${itemCount === 1 ? "" : "s"})${col.isFavorite ? " ★" : ""}`);
    for (const { item } of col.items) {
      const type = item.itemType.name.padEnd(8);
      const pinned = item.isPinned ? " 📌" : "";
      const fav = item.isFavorite ? " ★" : "";
      console.log(`    [${type}] ${item.title}${pinned}${fav}`);
    }
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log();
  const totalItems = await prisma.item.count({ where: { userId: user.id } });
  console.log(`✓ Total items: ${totalItems}`);
  console.log("\nAll checks passed ✓");
}

main()
  .catch((e) => {
    console.error("✗ Database connection failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
