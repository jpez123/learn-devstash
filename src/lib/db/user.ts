import { prisma } from '@/lib/prisma';

const DEMO_EMAIL = 'demo@devstash.io';

/**
 * Temporary helper until real auth is implemented.
 * Returns the demo user or throws if the DB is not seeded.
 */
export async function getDemoUser() {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    throw new Error(`Demo user not found. Run: npm run db:seed`);
  }
  return user;
}
