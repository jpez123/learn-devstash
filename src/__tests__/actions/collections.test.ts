import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/collections', () => ({
  createCollection: vi.fn(),
}));

import { auth } from '@/auth';
import { createCollection as createCollectionDb } from '@/lib/db/collections';
import { createCollection } from '@/actions/collections';

const mockAuth = vi.mocked(auth);
const mockCreateCollectionDb = vi.mocked(createCollectionDb);

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
    mockAuth.mockResolvedValueOnce(null);
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
