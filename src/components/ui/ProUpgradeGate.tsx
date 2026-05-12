'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createCheckoutAction } from '@/actions/stripe';

interface ProUpgradeGateProps {
  title: string;
  description: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export default function ProUpgradeGate({ title, description, monthlyPriceId, yearlyPriceId }: ProUpgradeGateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);

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

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => handleCheckout('monthly')}
          disabled={loading !== null}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {loading === 'monthly' ? 'Loading…' : 'Upgrade to Pro — $8/mo'}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCheckout('yearly')}
          disabled={loading !== null}
          className="gap-2"
        >
          <Zap className="h-4 w-4" />
          {loading === 'yearly' ? 'Loading…' : 'Yearly — $72/yr (save 25%)'}
        </Button>
      </div>
    </div>
  );
}
