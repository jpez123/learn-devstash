import { prisma } from '@/lib/prisma';

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
