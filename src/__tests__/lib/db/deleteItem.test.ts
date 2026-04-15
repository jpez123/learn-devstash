import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { deleteItem } from '@/lib/db/items';

const mockFindFirst = vi.mocked(prisma.item.findFirst);
const mockDelete = vi.mocked(prisma.item.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('deleteItem', () => {
  it('returns false when item not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await deleteItem('item-1', 'user-1');
    expect(result).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns true and calls delete when item exists', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item-1' } as never);
    mockDelete.mockResolvedValue({} as never);
    const result = await deleteItem('item-1', 'user-1');
    expect(result).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
  });

  it('queries with both id and userId for ownership check', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item-1' } as never);
    mockDelete.mockResolvedValue({} as never);
    await deleteItem('item-1', 'user-1');
    expect(mockFindFirst).toHaveBeenCalledWith({ where: { id: 'item-1', userId: 'user-1' } });
  });
});
