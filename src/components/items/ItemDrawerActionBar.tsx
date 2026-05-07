'use client';

import { useState } from 'react';
import { Star, Pin, Copy, Pencil, Trash2, Check, X, Download } from 'lucide-react';
import type { ItemDetail } from '@/lib/db/items';

const TEXT_TYPES = ['snippet', 'prompt', 'command', 'note'];

const FILE_TYPES = ['file', 'image'];

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

interface ItemDrawerActionBarProps {
  item: ItemDetail;
  isEditMode: boolean;
  saving: boolean;
  editTitleEmpty: boolean;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onPin: () => void;
}

export default function ItemDrawerActionBar({
  item,
  isEditMode,
  saving,
  editTitleEmpty,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onFavorite,
  onPin,
}: ItemDrawerActionBarProps) {
  const [copied, setCopied] = useState(false);

  const copyValue =
    item.itemType.name === 'link'
      ? item.url
      : TEXT_TYPES.includes(item.itemType.name)
      ? item.content
      : null;

  async function handleCopy() {
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 py-2">
      {isEditMode ? (
        <>
          <ActionButton
            icon={<Check size={14} />}
            label="Save"
            onClick={onSave}
            disabled={saving || editTitleEmpty}
          />
          <ActionButton
            icon={<X size={14} />}
            label="Cancel"
            onClick={onCancelEdit}
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
            onClick={onFavorite}
          />
          <ActionButton
            icon={<Pin size={14} className={item.isPinned ? 'fill-foreground' : ''} />}
            label="Pin"
            active={item.isPinned}
            onClick={onPin}
          />
          {copyValue && (
            <ActionButton
              icon={copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              label="Copy"
              onClick={handleCopy}
            />
          )}
          {FILE_TYPES.includes(item.itemType.name) && item.fileUrl && (
            <a
              href={`/api/download?key=${encodeURIComponent(item.fileUrl)}`}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Download size={14} />
              Download
            </a>
          )}
          <ActionButton icon={<Pencil size={14} />} label="Edit" onClick={onEdit} />
          <ActionButton icon={<Trash2 size={14} />} label="Delete" danger onClick={onDelete} />
        </>
      )}
    </div>
  );
}
