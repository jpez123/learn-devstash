import { prisma } from '@/lib/prisma';
import type { ItemWithMeta } from '@/lib/db/items';

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

export async function updateCollection(
  id: string,
  userId: string,
  data: { name: string; description?: string | null }
): Promise<CollectionDetail | null> {
  const existing = await prisma.collection.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.collection.update({
    where: { id },
    data: { name: data.name, description: data.description ?? null },
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

export async function deleteCollection(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.collection.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.collection.delete({ where: { id } });
  return true;
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

export type PaginatedCollections = {
  collections: CollectionWithMeta[];
  total: number;
};

export async function getAllCollections(
  userId: string,
  page = 1,
  pageSize = 21
): Promise<PaginatedCollections> {
  const total = await prisma.collection.count({ where: { userId } });
  const collections = await getCollectionList(userId, pageSize, (page - 1) * pageSize);
  return { collections, total };
}

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionWithMeta[]> {
  return getCollectionList(userId, limit);
}

export type CollectionWithItems = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  types: { icon: string; color: string }[];
  items: ItemWithMeta[];
};

export async function getCollectionWithItems(
  id: string,
  userId: string,
  page = 1,
  pageSize = 21
): Promise<CollectionWithItems | null> {
  const col = await prisma.collection.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
    },
  });

  if (!col) return null;

  // Get type breakdown across ALL items (for header icons)
  const allTypeRows = await prisma.itemCollection.findMany({
    where: { collectionId: id },
    select: { item: { select: { itemType: { select: { icon: true, color: true } } } } },
  });

  const typeCounts = new Map<string, { icon: string; color: string; count: number }>();
  for (const row of allTypeRows) {
    const t = row.item.itemType;
    const existing = typeCounts.get(t.icon);
    if (existing) existing.count++;
    else typeCounts.set(t.icon, { icon: t.icon, color: t.color, count: 1 });
  }
  const types = [...typeCounts.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ icon, color }) => ({ icon, color }));

  const itemCount = allTypeRows.length;

  // Paginated items for display
  const pageRows = await prisma.itemCollection.findMany({
    where: { collectionId: id },
    orderBy: { addedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      item: {
        include: {
          itemType: { select: { name: true, icon: true, color: true } },
          tags: { include: { tag: { select: { name: true } } } },
        },
      },
    },
  });

  const items: ItemWithMeta[] = pageRows.map((ic) => ({
    id: ic.item.id,
    title: ic.item.title,
    description: ic.item.description,
    content: ic.item.content,
    url: ic.item.url,
    isFavorite: ic.item.isFavorite,
    isPinned: ic.item.isPinned,
    createdAt: ic.item.createdAt,
    fileUrl: ic.item.fileUrl,
    fileName: ic.item.fileName,
    fileSize: ic.item.fileSize,
    itemType: ic.item.itemType,
    tags: ic.item.tags.map((t) => t.tag.name),
  }));

  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    itemCount,
    types,
    items,
  };
}

export type FavoriteCollection = {
  id: string;
  name: string;
  itemCount: number;
  createdAt: Date;
};

export async function getFavoriteCollections(userId: string): Promise<FavoriteCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return collections.map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col._count.items,
    createdAt: col.createdAt,
  }));
}

async function getCollectionList(userId: string, limit?: number, offset?: number): Promise<CollectionWithMeta[]> {
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
    skip: offset,
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
