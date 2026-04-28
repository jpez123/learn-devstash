'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TypeIcon from '@/components/ui/TypeIcon';
import FileUpload, { type UploadResult } from '@/components/ui/FileUpload';
import CollectionPicker from '@/components/ui/CollectionPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CodeEditor from '@/components/ui/CodeEditor';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import { createItem } from '@/actions/items';
import { getCollections } from '@/actions/collections';
import type { CollectionSummary } from '@/lib/db/collections';

const SELECTABLE_TYPES = [
  { name: 'snippet', label: 'Snippet', icon: 'Code', color: '#3b82f6' },
  { name: 'prompt', label: 'Prompt', icon: 'Sparkles', color: '#8b5cf6' },
  { name: 'command', label: 'Command', icon: 'Terminal', color: '#f97316' },
  { name: 'note', label: 'Note', icon: 'StickyNote', color: '#fde047' },
  { name: 'link', label: 'Link', icon: 'Link', color: '#10b981' },
  { name: 'file', label: 'File', icon: 'File', color: '#6b7280' },
  { name: 'image', label: 'Image', icon: 'Image', color: '#ec4899' },
] as const;

export type TypeName = (typeof SELECTABLE_TYPES)[number]['name'];
export { SELECTABLE_TYPES };

const TEXT_TYPES: TypeName[] = ['snippet', 'prompt', 'command', 'note'];
const CODE_TYPES: TypeName[] = ['snippet', 'command'];
const MARKDOWN_TYPES: TypeName[] = ['note', 'prompt'];
const URL_TYPES: TypeName[] = ['link'];
const FILE_TYPES: TypeName[] = ['file', 'image'];

type FormState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  content: '',
  url: '',
  language: '',
  tags: '',
};

interface ItemCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: TypeName;
}

export default function ItemCreateDialog({ open, onOpenChange, initialType = 'snippet' }: ItemCreateDialogProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TypeName>(initialType);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [uploadedFile, setUploadedFile] = useState<UploadResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      getCollections().then((result) => {
        if (result.success) setCollections(result.data);
      });
    }
  }, [open]);

  function handleOpenChange(value: boolean) {
    if (!value) {
      setForm(DEFAULT_FORM);
      setSelectedType(initialType);
      setUploadedFile(null);
      setSelectedCollectionIds([]);
    }
    onOpenChange(value);
  }

  function set(field: keyof FormState, value: string) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function handleTypeChange(type: TypeName) {
    setSelectedType(type);
    setUploadedFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      typeName: selectedType,
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      url: form.url || null,
      language: form.language || null,
      tags,
      collectionIds: selectedCollectionIds,
      fileUrl: uploadedFile?.key ?? null,
      fileName: uploadedFile?.fileName ?? null,
      fileSize: uploadedFile?.fileSize ?? null,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success('Item created');
    handleOpenChange(false);
    router.refresh();
  }

  const typeConfig = SELECTABLE_TYPES.find((t) => t.name === selectedType)!;
  const isFileType = FILE_TYPES.includes(selectedType);
  const submitDisabled =
    saving ||
    !form.title.trim() ||
    (URL_TYPES.includes(selectedType) && !form.url.trim()) ||
    (isFileType && !uploadedFile);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {SELECTABLE_TYPES.map((t) => {
                const active = selectedType === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleTypeChange(t.name)}
                    className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                    style={
                      active
                        ? { borderColor: t.color, backgroundColor: `${t.color}20`, color: t.color }
                        : {}
                    }
                  >
                    <TypeIcon iconName={t.icon} color={active ? t.color : 'currentColor'} size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Item title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Description
            </label>
            <input
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* File upload — file/image types */}
          {isFileType && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                File <span className="text-destructive">*</span>
              </label>
              <FileUpload
                accept={selectedType === 'image' ? 'image' : 'file'}
                onUpload={setUploadedFile}
                onClear={() => setUploadedFile(null)}
                uploadedFile={uploadedFile}
              />
            </div>
          )}

          {/* Language — snippet/command only */}
          {CODE_TYPES.includes(selectedType) && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Language
              </label>
              <input
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.language}
                onChange={(e) => set('language', e.target.value)}
                placeholder="e.g. typescript, python"
              />
            </div>
          )}

          {/* Content — text types only */}
          {TEXT_TYPES.includes(selectedType) && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Content
              </label>
              {CODE_TYPES.includes(selectedType) ? (
                <CodeEditor
                  value={form.content}
                  language={form.language || undefined}
                  onChange={(val) => set('content', val)}
                />
              ) : MARKDOWN_TYPES.includes(selectedType) ? (
                <MarkdownEditor
                  value={form.content}
                  onChange={(val) => set('content', val)}
                />
              ) : (
                <textarea
                  className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
                  rows={6}
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  placeholder="Content"
                />
              )}
            </div>
          )}

          {/* URL — link type only */}
          {URL_TYPES.includes(selectedType) && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                URL <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                type="url"
                value={form.url}
                onChange={(e) => set('url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Tags
            </label>
            <input
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="mt-1 text-[11px] text-muted-foreground/60">Comma-separated</p>
          </div>

          {/* Collections */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Collections
            </label>
            <CollectionPicker
              collections={collections}
              selectedIds={selectedCollectionIds}
              onChange={setSelectedCollectionIds}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitDisabled}
              style={{ backgroundColor: typeConfig.color }}
            >
              {saving ? 'Creating…' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
