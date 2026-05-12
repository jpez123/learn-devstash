'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createCheckoutAction, getPortalSessionAction } from '@/actions/stripe';

interface BillingSectionProps {
  isPro: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export default function BillingSection({ isPro, monthlyPriceId, yearlyPriceId }: BillingSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'monthly' | 'yearly' | 'portal' | null>(null);

  async function handleCheckout(plan: 'monthly' | 'yearly') {
    const priceId = plan === 'monthly' ? monthlyPriceId : yearlyPriceId;
    setLoading(plan);
    const result = await createCheckoutAction(priceId);
    setLoading(null);

    if (!result.url) {
      toast.error(result.error ?? 'Failed to start checkout');
      return;
    }

    router.push(result.url);
  }

  async function handlePortal() {
    setLoading('portal');
    const result = await getPortalSessionAction();
    setLoading(null);

    if (!result.url) {
      toast.error(result.error ?? 'Failed to open billing portal');
      return;
    }

    router.push(result.url);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Billing</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isPro ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'}`}>
          {isPro ? 'Pro' : 'Free'}
        </span>
      </div>
      {isPro ? (
        <>
          <p className="text-sm text-muted-foreground">You are on the Pro plan.</p>
          <Button onClick={handlePortal} disabled={loading === 'portal'}>
            {loading === 'portal' ? 'Loading…' : 'Manage Billing'}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Unlimited items, file uploads, AI features, and more.
          </p>
          <div className="flex gap-3 flex-wrap mt-2">
            <Button
              variant="outline"
              onClick={() => handleCheckout('monthly')}
              disabled={loading !== null}
            >
              {loading === 'monthly' ? 'Loading…' : 'Monthly — $8/mo'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCheckout('yearly')}
              disabled={loading !== null}
            >
              {loading === 'yearly' ? 'Loading…' : 'Yearly — $72/yr (save 25%)'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

