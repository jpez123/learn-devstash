import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { updateItem } from '@/lib/db/items';

const mockFindFirst = vi.mocked(prisma.item.findFirst);
const mockUpdate = vi.mocked(prisma.item.update);

const baseExisting = { id: 'item-1', userId: 'user-1' };

const baseUpdated = {
  id: 'item-1',
  title: 'Updated Title',
  description: 'Updated desc',
  content: 'Updated content',
  language: 'typescript',
  url: null,
  isFavorite: false,
  isPinned: false,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-16'),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [{ tag: { name: 'react' } }],
  collections: [{ collection: { id: 'col-1', name: 'React Patterns' } }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateItem', () => {
  it('returns null when item does not belong to user', async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await updateItem('item-1', 'wrong-user', {
      title: 'New',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });
    expect(result).toBeNull();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('calls prisma.item.update with correct data', async () => {
    mockFindFirst.mockResolvedValue(baseExisting as never);
    mockUpdate.mockResolvedValue(baseUpdated as never);

    await updateItem('item-1', 'user-1', {
      title: 'Updated Title',
      description: 'Updated desc',
      content: 'Updated content',
      url: null,
      language: 'typescript',
      tags: ['react'],
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1' },
        data: expect.objectContaining({
          title: 'Updated Title',
          description: 'Updated desc',
          content: 'Updated content',
          language: 'typescript',
          url: null,
        }),
      })
    );
  });

  it('returns mapped ItemDetail on success', async () => {
    mockFindFirst.mockResolvedValue(baseExisting as never);
    mockUpdate.mockResolvedValue(baseUpdated as never);

    const result = await updateItem('item-1', 'user-1', {
      title: 'Updated Title',
      description: 'Updated desc',
      content: 'Updated content',
      url: null,
      language: 'typescript',
      tags: ['react'],
    });

    expect(result).toMatchObject({
      id: 'item-1',
      title: 'Updated Title',
      tags: ['react'],
      collections: [{ id: 'col-1', name: 'React Patterns' }],
    });
  });

  it('includes deleteMany for tags to replace all existing tags', async () => {
    mockFindFirst.mockResolvedValue(baseExisting as never);
    mockUpdate.mockResolvedValue({ ...baseUpdated, tags: [] } as never);

    await updateItem('item-1', 'user-1', {
      title: 'Title',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ['newtag'],
    });

    const callArgs = mockUpdate.mock.calls[0][0];
    expect(callArgs.data.tags).toHaveProperty('deleteMany');
    expect(callArgs.data.tags).toHaveProperty('create');
  });
});
