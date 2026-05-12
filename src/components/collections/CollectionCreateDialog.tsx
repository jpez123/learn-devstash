'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createCollection } from '@/actions/collections';
import { createCheckoutByInterval } from '@/actions/stripe';

interface CollectionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CollectionCreateDialog({ open, onOpenChange }: CollectionCreateDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  function handleOpenChange(value: boolean) {
    if (!value) {
      setName('');
      setDescription('');
      setShowUpgrade(false);
    }
    onOpenChange(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await createCollection({
      name,
      description: description || null,
    });

    setSaving(false);

    if (!result.success) {
      if (result.code === 'FREE_TIER_LIMIT') {
        setShowUpgrade(true);
        return;
      }
      toast.error(result.error);
      return;
    }

    toast.success('Collection created');
    handleOpenChange(false);
    router.refresh();
  }

  async function handleUpgrade(interval: 'month' | 'year') {
    setUpgrading(true);
    const result = await createCheckoutByInterval(interval);
    setUpgrading(false);
    if (result.url) {
      router.push(result.url);
    } else {
      toast.error(result.error ?? 'Failed to start checkout');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showUpgrade ? 'Upgrade to Pro' : 'New Collection'}</DialogTitle>
        </DialogHeader>

        {showUpgrade ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-sm font-medium">You&apos;ve reached the 3-collection limit on the free plan.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upgrade to Pro for unlimited collections, file uploads, AI features, and more.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUpgrade('month')}
                disabled={upgrading}
                className="flex flex-col items-center rounded-lg border border-border p-3 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
              >
                <span className="text-base font-bold">$8</span>
                <span className="text-xs text-muted-foreground">per month</span>
              </button>
              <button
                onClick={() => handleUpgrade('year')}
                disabled={upgrading}
                className="flex flex-col items-center rounded-lg border border-primary bg-primary/5 p-3 text-center transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <span className="text-base font-bold">$72</span>
                <span className="text-xs text-muted-foreground">per year · save 25%</span>
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={upgrading}>
                Maybe later
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React Patterns"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Description
              </label>
              <input
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
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
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? 'Creating…' : 'Create Collection'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
