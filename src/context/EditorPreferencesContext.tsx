'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { updateEditorPreferences } from '@/actions/settings';
import type { EditorPreferences } from '@/types/editor';

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreference: <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null);

export function EditorPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences: EditorPreferences;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(initialPreferences);

  const updatePreference = useCallback(
    async <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);

      const result = await updateEditorPreferences(updated);
      if (result.success) {
        toast.success('Editor preference saved');
      } else {
        toast.error('Failed to save preference');
        setPreferences(preferences);
      }
    },
    [preferences],
  );

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  const ctx = useContext(EditorPreferencesContext);
  if (!ctx) throw new Error('useEditorPreferences must be used within EditorPreferencesProvider');
  return ctx;
}
