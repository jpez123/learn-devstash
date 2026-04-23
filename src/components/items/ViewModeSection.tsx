'use client';

import { FolderOpen, Calendar, File as FileIcon } from 'lucide-react';
import CodeEditor from '@/components/ui/CodeEditor';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import { formatFileSize } from '@/lib/utils';
import type { ItemDetail } from '@/lib/db/items';

const CODE_TYPES = ['snippet', 'command'];
const MARKDOWN_TYPES = ['note', 'prompt'];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {children}
    </p>
  );
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ViewModeSection({ item }: { item: ItemDetail }) {
  return (
    <>
      {item.description && (
        <section>
          <SectionLabel>Description</SectionLabel>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        </section>
      )}

      {item.itemType.name === 'image' && item.fileUrl && (
        <section>
          <SectionLabel>Preview</SectionLabel>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/download?key=${encodeURIComponent(item.fileUrl)}`}
            alt={item.fileName ?? item.title}
            className="max-h-80 w-auto rounded-md border border-border object-contain"
          />
        </section>
      )}

      {item.itemType.name === 'file' && item.fileUrl && (
        <section>
          <SectionLabel>File</SectionLabel>
          <div className="flex items-center gap-3 rounded-md border border-border bg-accent/40 px-3 py-2.5">
            <FileIcon size={16} className="shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.fileName ?? 'File'}</p>
              {item.fileSize != null && (
                <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {item.content && (
        <section>
          <SectionLabel>Content</SectionLabel>
          {CODE_TYPES.includes(item.itemType.name) ? (
            <CodeEditor value={item.content} language={item.language || undefined} readOnly />
          ) : MARKDOWN_TYPES.includes(item.itemType.name) ? (
            <MarkdownEditor value={item.content} readOnly />
          ) : (
            <pre className="overflow-x-auto rounded-md bg-accent/60 p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
              <code>{item.content}</code>
            </pre>
          )}
        </section>
      )}

      {item.tags.length > 0 && (
        <section>
          <SectionLabel>Tags</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-accent px-2.5 py-1 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {item.collections.length > 0 && (
        <section>
          <SectionLabel>Collections</SectionLabel>
          <div className="flex flex-col gap-1">
            {item.collections.map((col) => (
              <div key={col.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderOpen size={13} className="shrink-0" />
                <span>{col.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionLabel>Details</SectionLabel>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="shrink-0" />
            <span className="text-xs text-muted-foreground/70">Created</span>
            <span className="ml-auto text-xs">{formatDate(item.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="shrink-0" />
            <span className="text-xs text-muted-foreground/70">Updated</span>
            <span className="ml-auto text-xs">{formatDate(item.updatedAt)}</span>
          </div>
        </div>
      </section>
    </>
  );
}
