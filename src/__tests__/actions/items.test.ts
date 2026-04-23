import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/items', () => ({
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { auth } from '@/auth';
import { createItem as createItemDb, updateItem as updateItemDb, deleteItem as deleteItemDb } from '@/lib/db/items';
import { createItem, updateItem, deleteItem } from '@/actions/items';

const mockAuth = vi.mocked(auth);
const mockCreateItemDb = vi.mocked(createItemDb);
const mockUpdateItemDb = vi.mocked(updateItemDb);
const mockDeleteItemDb = vi.mocked(deleteItemDb);

const validSession = { user: { id: 'user-1' } };

const updatedItem = {
  id: 'item-1',
  title: 'Updated',
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

beforeEach(() => {
  vi.clearAllMocks();
});

const createdItem = {
  id: 'item-new',
  title: 'New Snippet',
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

describe('createItem action', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns error when title is empty', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    const result = await createItem({ typeName: 'snippet', title: '   ', tags: [] });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain('Title');
  });

  it('returns error when typeName is invalid', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    const result = await createItem({ typeName: 'custom', title: 'Test', tags: [] });
    expect(result.success).toBe(false);
  });

  it('returns error when url is invalid', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    const result = await createItem({ typeName: 'link', title: 'Test', url: 'not-a-url', tags: [] });
    expect(result.success).toBe(false);
  });

  it('returns success with created item', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockCreateItemDb.mockResolvedValue(createdItem);
    const result = await createItem({ typeName: 'snippet', title: 'New Snippet', tags: [] });
    expect(result).toEqual({ success: true, data: createdItem });
  });

  it('returns error when db throws', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockCreateItemDb.mockRejectedValue(new Error('DB error'));
    const result = await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(result).toEqual({ success: false, error: 'Failed to create item' });
  });

  it('passes typeName and tags to db function', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockCreateItemDb.mockResolvedValue(createdItem);
    await createItem({ typeName: 'prompt', title: 'My Prompt', tags: ['ai', 'gpt'] });
    expect(mockCreateItemDb).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ typeName: 'prompt', tags: ['ai', 'gpt'] })
    );
  });
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

describe('deleteItem action', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns error when item not found', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockDeleteItemDb.mockResolvedValue(false);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: false, error: 'Item not found or access denied' });
  });

  it('returns success when item deleted', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockDeleteItemDb.mockResolvedValue(true);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: true, data: null });
  });

  it('calls db deleteItem with itemId and userId', async () => {
    mockAuth.mockResolvedValue(validSession as never);
    mockDeleteItemDb.mockResolvedValue(true);
    await deleteItem('item-1');
    expect(mockDeleteItemDb).toHaveBeenCalledWith('item-1', 'user-1');
  });
});
