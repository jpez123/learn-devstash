import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getSearchData } from '@/lib/db/search';

const mockItemFindMany = vi.mocked(prisma.item.findMany);
const mockCollectionFindMany = vi.mocked(prisma.collection.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

const baseItem = {
  id: 'item-1',
  title: 'useAuth Hook',
  content: 'export function useAuth() {}',
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
};

const baseCollection = {
  id: 'col-1',
  name: 'React Patterns',
  _count: { items: 4 },
};

describe('getSearchData', () => {
  it('queries items and collections with userId', async () => {
    mockItemFindMany.mockResolvedValue([]);
    mockCollectionFindMany.mockResolvedValue([]);

    await getSearchData('user-1');

    expect(mockItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
    expect(mockCollectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
  });

  it('maps _count.items to itemCount for collections', async () => {
    mockItemFindMany.mockResolvedValue([]);
    mockCollectionFindMany.mockResolvedValue([baseCollection as never]);

    const result = await getSearchData('user-1');

    expect(result.collections).toEqual([
      { id: 'col-1', name: 'React Patterns', itemCount: 4 },
    ]);
  });

  it('returns contentPreview as null when item has no content', async () => {
    mockItemFindMany.mockResolvedValue([{ ...baseItem, content: null } as never]);
    mockCollectionFindMany.mockResolvedValue([]);

    const result = await getSearchData('user-1');

    expect(result.items[0].contentPreview).toBeNull();
  });

  it('returns full content as preview when content is under 100 chars', async () => {
    const shortContent = 'const x = 1;';
    mockItemFindMany.mockResolvedValue([{ ...baseItem, content: shortContent } as never]);
    mockCollectionFindMany.mockResolvedValue([]);

    const result = await getSearchData('user-1');

    expect(result.items[0].contentPreview).toBe(shortContent);
  });

  it('truncates contentPreview to 100 chars when content exceeds 100 chars', async () => {
    const longContent = 'a'.repeat(150);
    mockItemFindMany.mockResolvedValue([{ ...baseItem, content: longContent } as never]);
    mockCollectionFindMany.mockResolvedValue([]);

    const result = await getSearchData('user-1');

    expect(result.items[0].contentPreview).toBe('a'.repeat(100));
    expect(result.items[0].contentPreview?.length).toBe(100);
  });

  it('returns empty arrays when user has no items or collections', async () => {
    mockItemFindMany.mockResolvedValue([]);
    mockCollectionFindMany.mockResolvedValue([]);

    const result = await getSearchData('user-1');

    expect(result.items).toEqual([]);
    expect(result.collections).toEqual([]);
  });

  it('maps item type fields correctly', async () => {
    mockItemFindMany.mockResolvedValue([baseItem as never]);
    mockCollectionFindMany.mockResolvedValue([]);

    const result = await getSearchData('user-1');

    expect(result.items[0].itemType).toEqual({
      name: 'snippet',
      icon: 'Code',
      color: '#3b82f6',
    });
  });
});
