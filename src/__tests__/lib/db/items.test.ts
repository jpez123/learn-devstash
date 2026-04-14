import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getItemById } from '@/lib/db/items';

const mockFindFirst = vi.mocked(prisma.item.findFirst);

const baseItem = {
  id: 'item-1',
  title: 'useAuth Hook',
  description: 'Custom authentication hook',
  content: 'export function useAuth() {}',
  language: 'typescript',
  url: null,
  isFavorite: true,
  isPinned: false,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [
    { tag: { name: 'react' } },
    { tag: { name: 'hooks' } },
  ],
  collections: [
    { collection: { id: 'col-1', name: 'React Patterns' } },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getItemById', () => {
  it('returns null when item is not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getItemById('missing-id', 'user-1');
    expect(result).toBeNull();
  });

  it('queries with both id and userId for ownership check', async () => {
    mockFindFirst.mockResolvedValue(baseItem as never);
    await getItemById('item-1', 'user-1');
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1', userId: 'user-1' },
      })
    );
  });

  it('maps tag names from nested tag relation', async () => {
    mockFindFirst.mockResolvedValue(baseItem as never);
    const result = await getItemById('item-1', 'user-1');
    expect(result?.tags).toEqual(['react', 'hooks']);
  });

  it('maps collections to flat id/name objects', async () => {
    mockFindFirst.mockResolvedValue(baseItem as never);
    const result = await getItemById('item-1', 'user-1');
    expect(result?.collections).toEqual([{ id: 'col-1', name: 'React Patterns' }]);
  });

  it('returns empty arrays for items with no tags or collections', async () => {
    mockFindFirst.mockResolvedValue({ ...baseItem, tags: [], collections: [] } as never);
    const result = await getItemById('item-1', 'user-1');
    expect(result?.tags).toEqual([]);
    expect(result?.collections).toEqual([]);
  });

  it('returns all item fields correctly', async () => {
    mockFindFirst.mockResolvedValue(baseItem as never);
    const result = await getItemById('item-1', 'user-1');
    expect(result).toMatchObject({
      id: 'item-1',
      title: 'useAuth Hook',
      description: 'Custom authentication hook',
      content: 'export function useAuth() {}',
      language: 'typescript',
      url: null,
      isFavorite: true,
      isPinned: false,
      itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
    });
  });
});
