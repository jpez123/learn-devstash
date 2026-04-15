import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/items', () => ({
  updateItem: vi.fn(),
}));

import { auth } from '@/auth';
import { updateItem as updateItemDb } from '@/lib/db/items';
import { updateItem } from '@/actions/items';

const mockAuth = vi.mocked(auth);
const mockUpdateItemDb = vi.mocked(updateItemDb);

const validSession = { user: { id: 'user-1' } };

const updatedItem = {
  id: 'item-1',
  title: 'Updated',
  description: null,
  content: null,
  language: null,
  url: null,
  isFavorite: false,
  isPinned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  tags: [],
  collections: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateItem action', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateItem('item-1', { title: 'Test', tags: [] });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns error when title is empty', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    const result = await updateItem('item-1', { title: '   ', tags: [] });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain('Title');
  });

  it('returns error when url is invalid', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    const result = await updateItem('item-1', { title: 'Test', url: 'not-a-url', tags: [] });
    expect(result.success).toBe(false);
  });

  it('returns success with updated item', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockUpdateItemDb.mockResolvedValue(updatedItem);
    const result = await updateItem('item-1', { title: 'Updated', tags: [] });
    expect(result).toEqual({ success: true, data: updatedItem });
  });

  it('returns error when item not found (db returns null)', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockUpdateItemDb.mockResolvedValue(null);
    const result = await updateItem('item-1', { title: 'Updated', tags: [] });
    expect(result).toEqual({ success: false, error: 'Item not found or access denied' });
  });

  it('accepts empty url and converts to null', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockUpdateItemDb.mockResolvedValue(updatedItem);
    await updateItem('item-1', { title: 'Test', url: '', tags: [] });
    expect(mockUpdateItemDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({ url: null })
    );
  });

  it('passes tags array to db function', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockUpdateItemDb.mockResolvedValue(updatedItem);
    await updateItem('item-1', { title: 'Test', tags: ['react', 'hooks'] });
    expect(mockUpdateItemDb).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      expect.objectContaining({ tags: ['react', 'hooks'] })
    );
  });
});
