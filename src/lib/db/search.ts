import { prisma } from '@/lib/prisma';

export type SearchItem = {
  id: string;
  title: string;
  contentPreview: string | null;
  itemType: { name: string; icon: string; color: string };
};

export type SearchCollection = {
  id: string;
  name: string;
  itemCount: number;
};

export type SearchData = {
  items: SearchItem[];
  collections: SearchCollection[];
};

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        itemType: { select: { name: true, icon: true, color: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      contentPreview: item.content ? item.content.slice(0, 100) : null,
      itemType: item.itemType,
    })),
    collections: collections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    })),
  };
}
