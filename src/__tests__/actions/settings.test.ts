import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateEditorPreferences } from '@/actions/settings';
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';

const mockAuth = vi.mocked(auth);
const mockUserUpdate = vi.mocked(prisma.user.update);

const validSession = { user: { id: 'user-1' } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateEditorPreferences', () => {
  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await updateEditorPreferences(DEFAULT_EDITOR_PREFERENCES);
    expect(result).toEqual({ success: false, error: 'Not authenticated' });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('saves valid preferences and returns success', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockUserUpdate.mockResolvedValueOnce({} as never);

    const result = await updateEditorPreferences(DEFAULT_EDITOR_PREFERENCES);

    expect(result).toEqual({ success: true });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: DEFAULT_EDITOR_PREFERENCES },
    });
  });

  it('saves non-default preferences correctly', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    mockUserUpdate.mockResolvedValueOnce({} as never);

    const prefs = { fontSize: 16, tabSize: 4, wordWrap: false, minimap: true, theme: 'monokai' as const };
    const result = await updateEditorPreferences(prefs);

    expect(result).toEqual({ success: true });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: prefs },
    });
  });

  it('rejects font size below minimum', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const result = await updateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, fontSize: 4 });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects font size above maximum', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const result = await updateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, fontSize: 100 });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects invalid theme', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const result = await updateEditorPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      theme: 'light' as never,
    });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('rejects tab size above maximum', async () => {
    mockAuth.mockResolvedValueOnce(validSession as never);
    const result = await updateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, tabSize: 16 });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
