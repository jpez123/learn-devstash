'use client';

import CodeEditor from '@/components/ui/CodeEditor';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import type { EditState } from '@/hooks/useEditMode';

const TEXT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const CODE_TYPES = ['snippet', 'command'];
const MARKDOWN_TYPES = ['note', 'prompt'];
const URL_TYPES = ['link'];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {children}
    </p>
  );
}

interface EditModeSectionProps {
  typeName: string;
  editState: EditState;
  onChange: (field: keyof EditState, value: string) => void;
}

export default function EditModeSection({ typeName, editState, onChange }: EditModeSectionProps) {
  return (
    <>
      <section>
        <SectionLabel>Description</SectionLabel>
        <textarea
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
          rows={2}
          value={editState.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Optional description"
        />
      </section>

      {TEXT_TYPES.includes(typeName) && (
        <section>
          <SectionLabel>Content</SectionLabel>
          {CODE_TYPES.includes(typeName) ? (
            <CodeEditor
              value={editState.content}
              language={editState.language || undefined}
              onChange={(val) => onChange('content', val)}
            />
          ) : MARKDOWN_TYPES.includes(typeName) ? (
            <MarkdownEditor
              value={editState.content}
              onChange={(val) => onChange('content', val)}
            />
          ) : (
            <textarea
              className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
              rows={8}
              value={editState.content}
              onChange={(e) => onChange('content', e.target.value)}
              placeholder="Content"
            />
          )}
        </section>
      )}

      {CODE_TYPES.includes(typeName) && (
        <section>
          <SectionLabel>Language</SectionLabel>
          <input
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={editState.language}
            onChange={(e) => onChange('language', e.target.value)}
            placeholder="e.g. typescript, python"
          />
        </section>
      )}

      {URL_TYPES.includes(typeName) && (
        <section>
          <SectionLabel>URL</SectionLabel>
          <input
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            type="url"
            value={editState.url}
            onChange={(e) => onChange('url', e.target.value)}
            placeholder="https://..."
          />
        </section>
      )}

      <section>
        <SectionLabel>Tags</SectionLabel>
        <input
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          value={editState.tags}
          onChange={(e) => onChange('tags', e.target.value)}
          placeholder="react, hooks, typescript"
        />
        <p className="mt-1 text-[11px] text-muted-foreground/60">Comma-separated</p>
      </section>
    </>
  );
}
