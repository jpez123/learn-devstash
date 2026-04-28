import { prisma } from '@/lib/prisma';

export type CollectionSummary = {
  id: string;
  name: string;
};

export async function getUserCollections(userId: string): Promise<CollectionSummary[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null }
): Promise<CollectionDetail> {
  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type SidebarCollection = {
  id: string;
  name: string;
  dominantType: { color: string } | null;
};

export async function getSidebarCollections(userId: string): Promise<{
  favorites: SidebarCollection[];
  recents: SidebarCollection[];
}> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: { select: { id: true, color: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const withDominant = collections.map((col) => {
    const typeCounts = new Map<string, { color: string; count: number }>();
    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) existing.count++;
      else typeCounts.set(t.id, { color: t.color, count: 1 });
    }
    const sorted = [...typeCounts.values()].sort((a, b) => b.count - a.count);
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      dominantType: sorted[0] ? { color: sorted[0].color } : null,
    };
  });

  return {
    favorites: withDominant.filter((c) => c.isFavorite),
    recents: withDominant.slice(0, 4),
  };
}

export type CollectionWithMeta = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantType: { icon: string; color: string } | null;
  types: { icon: string; color: string }[];
};

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionWithMeta[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: {
                select: { id: true, icon: true, color: true },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { icon: string; color: string; count: number }>();

    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, { icon: t.icon, color: t.color, count: 1 });
      }
    }

    const sorted = [...typeCounts.values()].sort((a, b) => b.count - a.count);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantType: sorted[0] ? { icon: sorted[0].icon, color: sorted[0].color } : null,
      types: sorted.map(({ icon, color }) => ({ icon, color })),
    };
  });
}
