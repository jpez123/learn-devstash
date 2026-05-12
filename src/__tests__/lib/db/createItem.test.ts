import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    itemType: { findFirst: vi.fn() },
    item: { count: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { createItem } from '@/lib/db/items';

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockFindFirst = vi.mocked(prisma.itemType.findFirst);
const mockCreate = vi.mocked(prisma.item.create);

const mockItemType = { id: 'type-1', name: 'snippet', icon: 'Code', color: '#3b82f6' };

const createdItem = {
  id: 'item-new',
  title: 'My Snippet',
  description: null,
  content: 'const x = 1;',
  language: 'typescript',
  url: null,
  isFavorite: false,
  isPinned: false,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [{ tag: { name: 'react' } }],
  collections: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUserFindUnique.mockResolvedValue({ isPro: true } as never);
});

describe('createItem', () => {
  it('throws when item type is not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    await expect(
      createItem('user-1', {
        title: 'Test',
        description: null,
        content: null,
        url: null,
        language: null,
        typeName: 'snippet',
        tags: [],
        collectionIds: [],
      })
    ).rejects.toThrow('Unknown item type: snippet');
  });

  it('calls prisma.item.create with correct userId and itemTypeId', async () => {
    mockFindFirst.mockResolvedValue(mockItemType as never);
    mockCreate.mockResolvedValue(createdItem as never);

    await createItem('user-1', {
      title: 'My Snippet',
      description: null,
      content: 'const x = 1;',
      url: null,
      language: 'typescript',
      typeName: 'snippet',
      tags: ['react'],
      collectionIds: [],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'My Snippet',
          userId: 'user-1',
          itemTypeId: 'type-1',
        }),
      })
    );
  });

  it('looks up item type by name with isSystem:true', async () => {
    mockFindFirst.mockResolvedValue(mockItemType as never);
    mockCreate.mockResolvedValue(createdItem as never);

    await createItem('user-1', {
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      typeName: 'snippet',
      tags: [],
      collectionIds: [],
    });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { name: 'snippet', isSystem: true },
    });
  });

  it('maps tag names from nested tag relation', async () => {
    mockFindFirst.mockResolvedValue(mockItemType as never);
    mockCreate.mockResolvedValue(createdItem as never);

    const result = await createItem('user-1', {
      title: 'My Snippet',
      description: null,
      content: null,
      url: null,
      language: null,
      typeName: 'snippet',
      tags: ['react'],
      collectionIds: [],
    });

    expect(result.tags).toEqual(['react']);
  });

  it('returns item with all expected fields', async () => {
    mockFindFirst.mockResolvedValue(mockItemType as never);
    mockCreate.mockResolvedValue(createdItem as never);

    const result = await createItem('user-1', {
      title: 'My Snippet',
      description: null,
      content: 'const x = 1;',
      url: null,
      language: 'typescript',
      typeName: 'snippet',
      tags: [],
      collectionIds: [],
    });

    expect(result).toMatchObject({
      id: 'item-new',
      title: 'My Snippet',
      content: 'const x = 1;',
      language: 'typescript',
      isFavorite: false,
      isPinned: false,
      itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
      collections: [],
    });
  });
});
