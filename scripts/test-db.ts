import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Test connection by fetching system item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`✓ Connected to database`);
  console.log(`✓ Found ${itemTypes.length} system item types:\n`);

  for (const type of itemTypes) {
    console.log(`  ${type.color}  ${type.name.padEnd(10)} | ${type.category} | icon: ${type.icon}`);
  }
}

main()
  .catch((e) => {
    console.error("✗ Database connection failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
