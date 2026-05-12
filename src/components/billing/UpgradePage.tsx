'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Check, X } from 'lucide-react';
import { createCheckoutByInterval } from '@/actions/stripe';
import { toast } from 'sonner';

const BLUE = '#3b82f6';

const freeFeatures = [
  { included: true, text: '50 items total' },
  { included: true, text: '3 collections' },
  { included: true, text: 'All text item types' },
  { included: true, text: 'Basic search' },
  { included: false, text: 'File & image uploads' },
  { included: false, text: 'AI features' },
];

const proFeatures = [
  'Unlimited items',
  'Unlimited collections',
  'File & image uploads',
  'AI auto-tagging',
  'AI code explanation',
  'Prompt optimizer & summaries',
];

export default function UpgradePage() {
  const [yearly, setYearly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUpgrade() {
    startTransition(async () => {
      const result = await createCheckoutByInterval(yearly ? 'year' : 'month');
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        router.push(result.url);
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap className="h-6 w-6" style={{ color: BLUE }} />
          <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
        </div>
        <p className="text-muted-foreground">Unlock unlimited items, AI features, file uploads, and more.</p>

        {/* Billing toggle */}
        <div className="flex items-center gap-3 justify-center mt-6">
          <span className={`text-sm transition-colors ${yearly ? 'text-muted-foreground' : 'text-foreground'}`}>
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={yearly}
            aria-label="Toggle yearly billing"
            onClick={() => setYearly(!yearly)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: yearly ? 'rgba(59,130,246,0.2)' : '#21262d',
              border: yearly ? `1px solid ${BLUE}` : '1px solid #30363d',
            }}
          >
            <span
              className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full transition-all duration-200"
              style={{
                background: yearly ? BLUE : '#8b949e',
                transform: yearly ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
          <span className={`text-sm flex items-center gap-2 transition-colors ${yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
              Save 25%
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free card */}
        <div className="rounded-xl p-8 flex flex-col border border-border bg-card">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Free</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold">$0</span>
            <span className="text-sm text-muted-foreground">/ forever</span>
          </div>
          <p className="text-xs mb-6 text-muted-foreground min-h-[1.2em]">&nbsp;</p>
          <ul className="flex flex-col gap-2.5 mb-7 flex-1">
            {freeFeatures.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5 text-sm">
                {f.included ? (
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span className={f.included ? 'text-foreground' : 'text-muted-foreground'}>{f.text}</span>
              </li>
            ))}
          </ul>
          <div className="block w-full text-center rounded-lg py-2.5 text-sm font-medium text-muted-foreground border border-border">
            Current plan
          </div>
        </div>

        {/* Pro card */}
        <div
          className="rounded-xl p-8 flex flex-col relative"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.05), var(--card))',
            border: `1px solid ${BLUE}`,
          }}
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3.5 py-[3px] rounded-full whitespace-nowrap"
            style={{ background: BLUE, color: '#fff' }}
          >
            Most Popular
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-muted-foreground">Pro</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold">{yearly ? '$72' : '$8'}</span>
            <span className="text-sm text-muted-foreground">{yearly ? '/ year' : '/ month'}</span>
          </div>
          <p className="text-xs mb-6 text-muted-foreground min-h-[1.2em]">
            {yearly ? '$6/mo billed annually — save $24' : ' '}
          </p>
          <ul className="flex flex-col gap-2.5 mb-7 flex-1">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check className="h-4 w-4 shrink-0 text-green-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={isPending}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: BLUE }}
          >
            {isPending ? 'Redirecting...' : `Upgrade — ${yearly ? '$72/yr' : '$8/mo'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
