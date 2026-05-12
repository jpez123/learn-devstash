import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    item: { count: vi.fn(), create: vi.fn() },
    itemType: { findFirst: vi.fn() },
    collection: { count: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { createItem } from '@/lib/db/items';
import { createCollection } from '@/lib/db/collections';

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockItemCount = vi.mocked(prisma.item.count);
const mockItemCreate = vi.mocked(prisma.item.create);
const mockItemTypeFindFirst = vi.mocked(prisma.itemType.findFirst);
const mockCollectionCount = vi.mocked(prisma.collection.count);
const mockCollectionCreate = vi.mocked(prisma.collection.create);

const mockItemType = { id: 'type-1', name: 'snippet', icon: 'Code', color: '#3b82f6' };
const mockCreatedItem = {
  id: 'item-1',
  title: 'Test',
  description: null,
  content: null,
  language: null,
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  isFavorite: false,
  isPinned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [],
  collections: [],
};

const itemData = {
  title: 'Test Item',
  description: null,
  content: null,
  url: null,
  language: null,
  typeName: 'snippet',
  tags: [],
  collectionIds: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createItem free-tier limits', () => {
  it('allows free user with 49 items', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never);
    mockItemCount.mockResolvedValue(49);
    mockItemTypeFindFirst.mockResolvedValue(mockItemType as never);
    mockItemCreate.mockResolvedValue(mockCreatedItem as never);

    await expect(createItem('user-1', itemData)).resolves.toBeDefined();
  });

  it('blocks free user at 50 items', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never);
    mockItemCount.mockResolvedValue(50);

    await expect(createItem('user-1', itemData)).rejects.toThrow(
      'Free tier limit reached: 50 items'
    );
  });

  it('allows pro user with 50+ items', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: true } as never);
    mockItemTypeFindFirst.mockResolvedValue(mockItemType as never);
    mockItemCreate.mockResolvedValue(mockCreatedItem as never);

    await expect(createItem('user-1', itemData)).resolves.toBeDefined();
    expect(mockItemCount).not.toHaveBeenCalled();
  });
});

const mockCreatedCollection = {
  id: 'col-1',
  name: 'My Collection',
  description: null,
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const collectionData = { name: 'My Collection' };

describe('createCollection free-tier limits', () => {
  it('allows free user with 2 collections', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never);
    mockCollectionCount.mockResolvedValue(2);
    mockCollectionCreate.mockResolvedValue(mockCreatedCollection as never);

    await expect(createCollection('user-1', collectionData)).resolves.toBeDefined();
  });

  it('blocks free user at 3 collections', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: false } as never);
    mockCollectionCount.mockResolvedValue(3);

    await expect(createCollection('user-1', collectionData)).rejects.toThrow(
      'Free tier limit reached: 3 collections'
    );
  });

  it('allows pro user with 3+ collections', async () => {
    mockUserFindUnique.mockResolvedValue({ isPro: true } as never);
    mockCollectionCreate.mockResolvedValue(mockCreatedCollection as never);

    await expect(createCollection('user-1', collectionData)).resolves.toBeDefined();
    expect(mockCollectionCount).not.toHaveBeenCalled();
  });
});
