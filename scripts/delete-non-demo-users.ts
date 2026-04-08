import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!demoUser) {
    console.error(`✗ Demo user (${DEMO_EMAIL}) not found — aborting`);
    process.exit(1);
  }

  const usersToDelete = await prisma.user.findMany({
    where: { id: { not: demoUser.id } },
    select: { id: true, email: true, name: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No non-demo users found. Nothing to delete.");
    return;
  }

  console.log(`Found ${usersToDelete.length} user(s) to delete:`);
  for (const u of usersToDelete) {
    console.log(`  - ${u.email ?? "(no email)"} (${u.name ?? "unnamed"}) [${u.id}]`);
  }

  const userIds = usersToDelete.map((u) => u.id);

  // Delete in dependency order (cascade-safe, explicit)
  const deletedTagsOnItems = await prisma.tagsOnItems.deleteMany({
    where: { item: { userId: { in: userIds } } },
  });

  const deletedItemCollections = await prisma.itemCollection.deleteMany({
    where: { item: { userId: { in: userIds } } },
  });

  const deletedItems = await prisma.item.deleteMany({
    where: { userId: { in: userIds } },
  });

  const deletedCollections = await prisma.collection.deleteMany({
    where: { userId: { in: userIds } },
  });

  const deletedItemTypes = await prisma.itemType.deleteMany({
    where: { userId: { in: userIds } },
  });

  const deletedSessions = await prisma.session.deleteMany({
    where: { userId: { in: userIds } },
  });

  const deletedAccounts = await prisma.account.deleteMany({
    where: { userId: { in: userIds } },
  });

  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });

  console.log("\nDeleted:");
  console.log(`  ${deletedTagsOnItems.count} tag-item links`);
  console.log(`  ${deletedItemCollections.count} item-collection links`);
  console.log(`  ${deletedItems.count} items`);
  console.log(`  ${deletedCollections.count} collections`);
  console.log(`  ${deletedItemTypes.count} custom item types`);
  console.log(`  ${deletedSessions.count} sessions`);
  console.log(`  ${deletedAccounts.count} OAuth accounts`);
  console.log(`  ${deletedUsers.count} users`);
  console.log("\nDone ✓ Demo user and their content preserved.");
}

main()
  .catch((e) => {
    console.error("✗ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
