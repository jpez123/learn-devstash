import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getItemTypesWithCounts } from '@/lib/db/items';
import UserAvatar from '@/components/ui/UserAvatar';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;

  const [user, itemTypes, totalItems, totalCollections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true },
    }),
    getItemTypesWithCounts(userId),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  if (!user) redirect('/sign-in');

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Your profile and usage stats</p>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
        <UserAvatar name={user.name} image={user.image} size={64} />
        <div className="space-y-1">
          <p className="text-lg font-semibold">{user.name ?? 'No name'}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Member since{' '}
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Usage Stats */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Usage</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-xs text-muted-foreground">Total items</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{totalCollections}</p>
            <p className="text-xs text-muted-foreground">Collections</p>
          </div>
        </div>

        {/* Per-type breakdown */}
        <div className="mt-3 rounded-lg border border-border bg-card">
          {itemTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-sm capitalize">{t.name}s</span>
              </div>
              <span className="text-sm font-medium tabular-nums">{t.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
