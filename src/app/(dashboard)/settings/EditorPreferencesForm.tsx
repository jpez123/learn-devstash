'use client';

import { useEditorPreferences } from '@/context/EditorPreferencesContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20];
const TAB_SIZES = [1, 2, 4, 8];
const THEMES = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'github-dark', label: 'GitHub Dark' },
] as const;

export default function EditorPreferencesForm() {
  const { preferences, updatePreference } = useEditorPreferences();

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Editor Preferences</h2>
      <p className="mb-6 text-sm text-muted-foreground">Customize the code editor appearance and behavior.</p>

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">Theme</Label>
            <p className="text-xs text-muted-foreground">Color theme for the code editor</p>
          </div>
          <Select
            value={preferences.theme}
            onValueChange={(v) => updatePreference('theme', v as typeof preferences.theme)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">Font Size</Label>
            <p className="text-xs text-muted-foreground">Editor font size in pixels</p>
          </div>
          <Select
            value={String(preferences.fontSize)}
            onValueChange={(v) => updatePreference('fontSize', Number(v))}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">Tab Size</Label>
            <p className="text-xs text-muted-foreground">Number of spaces per tab</p>
          </div>
          <Select
            value={String(preferences.tabSize)}
            onValueChange={(v) => updatePreference('tabSize', Number(v))}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">Word Wrap</Label>
            <p className="text-xs text-muted-foreground">Wrap long lines to fit the editor width</p>
          </div>
          <Switch
            checked={preferences.wordWrap}
            onCheckedChange={(v) => updatePreference('wordWrap', v)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm font-medium">Minimap</Label>
            <p className="text-xs text-muted-foreground">Show scrollable code overview on the right</p>
          </div>
          <Switch
            checked={preferences.minimap}
            onCheckedChange={(v) => updatePreference('minimap', v)}
          />
        </div>
      </div>
    </div>
  );
}
