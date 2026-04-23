import { prisma } from '@/lib/prisma';
import { deleteFromR2 } from '@/lib/r2';

export type CreateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  typeName: string;
  tags: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

export async function createItem(userId: string, data: CreateItemData): Promise<ItemDetail> {
  const itemType = await prisma.itemType.findFirst({
    where: { name: data.typeName, isSystem: true },
  });
  if (!itemType) throw new Error(`Unknown item type: ${data.typeName}`);

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      userId,
      itemTypeId: itemType.id,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: { where: { name }, create: { name } },
          },
        })),
      },
    },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({ id: c.collection.id, name: c.collection.name })),
  };
}

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
};

export async function updateItem(
  id: string,
  userId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({ id: c.collection.id, name: c.collection.name })),
  };
}

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: string[];
  collections: { id: string; name: string }[];
};

export async function deleteItem(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.item.delete({ where: { id } });

  if (existing.fileUrl) {
    await deleteFromR2(existing.fileUrl).catch(() => {});
  }

  return true;
}

export async function getItemById(id: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => ({ id: c.collection.id, name: c.collection.name })),
  };
}

export type ItemTypeWithCount = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

const TYPE_ORDER = ['snippet', 'prompt', 'command', 'note', 'file', 'image', 'link'];

export async function getItemTypesWithCounts(userId: string): Promise<ItemTypeWithCount[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      items: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  const mapped = types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: t.items.length,
  }));

  return mapped.sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.name);
    const bi = TYPE_ORDER.indexOf(b.name);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: string[];
};

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  }));
}

export async function getItemsByType(userId: string, typeName: string): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  }));
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    include: {
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    itemType: item.itemType,
    tags: item.tags.map((t) => t.tag.name),
  }));
}
