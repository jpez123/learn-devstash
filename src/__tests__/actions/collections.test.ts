import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/collections', () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

import { auth } from '@/auth';
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
} from '@/lib/db/collections';
import { createCollection, updateCollection, deleteCollection } from '@/actions/collections';

const mockAuth = vi.mocked(auth);
const mockCreateCollectionDb = vi.mocked(createCollectionDb);
const mockUpdateCollectionDb = vi.mocked(updateCollectionDb);
const mockDeleteCollectionDb = vi.mocked(deleteCollectionDb);

const validSession = { user: { id: 'user-1' } };

const createdCollection = {
  id: 'col-1',
  name: 'React Patterns',
  description: 'Useful React patterns',
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createCollection', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await createCollection({ name: 'Test' });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns validation error for empty name', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const result = await createCollection({ name: '   ' });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe('Name is required');
  });

  it('creates collection and returns it', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockCreateCollectionDb.mockResolvedValueOnce(createdCollection);

    const result = await createCollection({ name: 'React Patterns', description: 'Useful React patterns' });

    expect(mockCreateCollectionDb).toHaveBeenCalledWith('user-1', {
      name: 'React Patterns',
      description: 'Useful React patterns',
    });
    expect(result).toEqual({ success: true, data: createdCollection });
  });

  it('nullifies missing description', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockCreateCollectionDb.mockResolvedValueOnce({ ...createdCollection, description: null });

    await createCollection({ name: 'React Patterns' });

    expect(mockCreateCollectionDb).toHaveBeenCalledWith('user-1', {
      name: 'React Patterns',
      description: null,
    });
  });

  it('returns error when db throws', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockCreateCollectionDb.mockRejectedValueOnce(new Error('DB error'));

    const result = await createCollection({ name: 'Test' });
    expect(result).toEqual({ success: false, error: 'Failed to create collection' });
  });
});

describe('updateCollection', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await updateCollection('col-1', { name: 'Updated' });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns validation error for empty name', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const result = await updateCollection('col-1', { name: '   ' });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toBe('Name is required');
  });

  it('returns not found when db returns null', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockUpdateCollectionDb.mockResolvedValueOnce(null);
    const result = await updateCollection('col-1', { name: 'Updated' });
    expect(result).toEqual({ success: false, error: 'Collection not found' });
  });

  it('updates collection and returns it', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const updated = { ...createdCollection, name: 'Updated' };
    mockUpdateCollectionDb.mockResolvedValueOnce(updated);

    const result = await updateCollection('col-1', { name: 'Updated', description: 'New desc' });

    expect(mockUpdateCollectionDb).toHaveBeenCalledWith('col-1', 'user-1', {
      name: 'Updated',
      description: 'New desc',
    });
    expect(result).toEqual({ success: true, data: updated });
  });

  it('returns error when db throws', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockUpdateCollectionDb.mockRejectedValueOnce(new Error('DB error'));
    const result = await updateCollection('col-1', { name: 'Updated' });
    expect(result).toEqual({ success: false, error: 'Failed to update collection' });
  });
});

describe('deleteCollection', () => {
  it('returns unauthorized when no session', async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await deleteCollection('col-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns not found when db returns false', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockDeleteCollectionDb.mockResolvedValueOnce(false);
    const result = await deleteCollection('col-1');
    expect(result).toEqual({ success: false, error: 'Collection not found' });
  });

  it('deletes collection and returns success', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockDeleteCollectionDb.mockResolvedValueOnce(true);

    const result = await deleteCollection('col-1');

    expect(mockDeleteCollectionDb).toHaveBeenCalledWith('col-1', 'user-1');
    expect(result).toEqual({ success: true, data: null });
  });

  it('returns error when db throws', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockDeleteCollectionDb.mockRejectedValueOnce(new Error('DB error'));
    const result = await deleteCollection('col-1');
    expect(result).toEqual({ success: false, error: 'Failed to delete collection' });
  });
});
