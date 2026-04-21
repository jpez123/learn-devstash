'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Pin, Copy, Pencil, Trash2, FolderOpen, Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import TypeIcon from '@/components/ui/TypeIcon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CodeEditor from '@/components/ui/CodeEditor';
import { updateItem, deleteItem } from '@/actions/items';
import type { ItemDetail } from '@/lib/db/items';

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-accent" />
        <div className="h-5 w-40 rounded bg-accent" />
        <div className="ml-2 h-5 w-16 rounded bg-accent" />
      </div>
      <div className="flex gap-2 border-y border-border py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded bg-accent" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-accent" />
        <div className="h-4 w-full rounded bg-accent" />
        <div className="h-4 w-3/4 rounded bg-accent" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-10 rounded bg-accent" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-12 rounded bg-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const TEXT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const CODE_TYPES = ['snippet', 'command'];
const URL_TYPES = ['link'];

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    title: '',
    description: '',
    content: '',
    url: '',
    language: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setIsEditMode(false);
      return;
    }
    setLoading(true);
    setItem(null);
    setIsEditMode(false);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  function enterEditMode() {
    if (!item) return;
    setEditState({
      title: item.title,
      description: item.description ?? '',
      content: item.content ?? '',
      url: item.url ?? '',
      language: item.language ?? '',
      tags: item.tags.join(', '),
    });
    setIsEditMode(true);
  }

  function cancelEdit() {
    setIsEditMode(false);
  }

  async function handleDelete() {
    if (!itemId) return;
    setDeleting(true);
    const result = await deleteItem(itemId);
    setDeleting(false);
    setDeleteDialogOpen(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Item deleted');
    onClose();
    router.refresh();
  }

  async function handleSave() {
    if (!item || !itemId) return;
    setSaving(true);

    const tags = editState.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(itemId, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      tags,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setItem(result.data);
    setIsEditMode(false);
    toast.success('Item updated');
    router.refresh();
  }

  return (
    <>
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full !max-w-2xl overflow-y-auto p-0" showCloseButton>
        {loading || (itemId && !item) ? (
          <DrawerSkeleton />
        ) : item ? (
          <div className="flex flex-col gap-0">
            {/* Header */}
            <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
              <div className="flex items-start gap-3 pr-8">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${item.itemType.color}25` }}
                >
                  <TypeIcon iconName={item.itemType.icon} color={item.itemType.color} size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  {isEditMode ? (
                    <input
                      className="w-full rounded border border-border bg-background px-2 py-1 text-base font-semibold leading-tight focus:outline-none focus:ring-1 focus:ring-ring"
                      value={editState.title}
                      onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                      placeholder="Title"
                    />
                  ) : (
                    <SheetTitle className="text-base font-semibold leading-tight">
                      {item.title}
                    </SheetTitle>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${item.itemType.color}25`, color: item.itemType.color }}
                    >
                      {item.itemType.name}
                    </span>
                    {!isEditMode && item.language && (
                      <span className="rounded bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                        {item.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Action bar */}
            <div className="flex items-center gap-1 border-b border-border px-4 py-2">
              {isEditMode ? (
                <>
                  <ActionButton
                    icon={<Check size={14} />}
                    label="Save"
                    onClick={handleSave}
                    disabled={saving || !editState.title.trim()}
                  />
                  <ActionButton
                    icon={<X size={14} />}
                    label="Cancel"
                    onClick={cancelEdit}
                    disabled={saving}
                  />
                </>
              ) : (
                <>
                  <ActionButton
                    icon={<Star size={14} className={item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''} />}
                    label="Favorite"
                    active={item.isFavorite}
                    activeColor="text-yellow-400"
                  />
                  <ActionButton
                    icon={<Pin size={14} className={item.isPinned ? 'fill-foreground' : ''} />}
                    label="Pin"
                    active={item.isPinned}
                  />
                  <ActionButton icon={<Copy size={14} />} label="Copy" />
                  <ActionButton icon={<Pencil size={14} />} label="Edit" onClick={enterEditMode} />
                  <div className="ml-auto">
                    <ActionButton
                      icon={<Trash2 size={14} />}
                      label="Delete"
                      danger
                      onClick={() => setDeleteDialogOpen(true)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 px-5 py-5">
              {isEditMode ? (
                <>
                  {/* Description */}
                  <section>
                    <SectionLabel>Description</SectionLabel>
                    <textarea
                      className="w-full rounded border border-border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
                      rows={2}
                      value={editState.description}
                      onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </section>

                  {/* Content — text types only */}
                  {TEXT_TYPES.includes(item.itemType.name) && (
                    <section>
                      <SectionLabel>Content</SectionLabel>
                      {CODE_TYPES.includes(item.itemType.name) ? (
                        <CodeEditor
                          value={editState.content}
                          language={editState.language || undefined}
                          onChange={(val) => setEditState((s) => ({ ...s, content: val }))}
                        />
                      ) : (
                        <textarea
                          className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
                          rows={8}
                          value={editState.content}
                          onChange={(e) => setEditState((s) => ({ ...s, content: e.target.value }))}
                          placeholder="Content"
                        />
                      )}
                    </section>
                  )}

                  {/* Language — snippet/command only */}
                  {CODE_TYPES.includes(item.itemType.name) && (
                    <section>
                      <SectionLabel>Language</SectionLabel>
                      <input
                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={editState.language}
                        onChange={(e) => setEditState((s) => ({ ...s, language: e.target.value }))}
                        placeholder="e.g. typescript, python"
                      />
                    </section>
                  )}

                  {/* URL — link type only */}
                  {URL_TYPES.includes(item.itemType.name) && (
                    <section>
                      <SectionLabel>URL</SectionLabel>
                      <input
                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        type="url"
                        value={editState.url}
                        onChange={(e) => setEditState((s) => ({ ...s, url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </section>
                  )}

                  {/* Tags */}
                  <section>
                    <SectionLabel>Tags</SectionLabel>
                    <input
                      className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={editState.tags}
                      onChange={(e) => setEditState((s) => ({ ...s, tags: e.target.value }))}
                      placeholder="react, hooks, typescript"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground/60">Comma-separated</p>
                  </section>
                </>
              ) : (
                <>
                  {/* Description */}
                  {item.description && (
                    <section>
                      <SectionLabel>Description</SectionLabel>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </section>
                  )}

                  {/* Content */}
                  {item.content && (
                    <section>
                      <SectionLabel>Content</SectionLabel>
                      {CODE_TYPES.includes(item.itemType.name) ? (
                        <CodeEditor
                          value={item.content}
                          language={item.language || undefined}
                          readOnly
                        />
                      ) : (
                        <pre className="overflow-x-auto rounded-md bg-accent/60 p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                          <code>{item.content}</code>
                        </pre>
                      )}
                    </section>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <section>
                      <SectionLabel>Tags</SectionLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-accent px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Collections */}
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

                  {/* Details */}
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
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{item?.title}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The item will be permanently deleted and removed from all collections.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {children}
    </p>
  );
}

function ActionButton({
  icon,
  label,
  active,
  activeColor,
  danger,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeColor?: string;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        danger
          ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          : active
          ? `text-foreground hover:bg-accent ${activeColor ?? ''}`
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}
