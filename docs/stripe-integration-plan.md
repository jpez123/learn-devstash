# Stripe Integration Plan — DevStash Pro

## Current State Summary

The codebase already has the foundation in place:

- **Prisma schema** — `User` model has `isPro` (Boolean, default false), `stripeCustomerId` (String?, unique), `stripeSubscriptionId` (String?, unique)
- **NextAuth v5** — JWT strategy with Prisma adapter, GitHub OAuth + Credentials; JWT callback currently syncs only `sub` (user ID)
- **`.env.example`** — already documents `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`
- **Server actions pattern** — `{ success: true, data } | { success: false, error: string }` (see `src/actions/items.ts`, `src/actions/collections.ts`)
- **API routes** — under `src/app/api/` (auth, upload, download, items)
- **Settings page** — `src/app/(dashboard)/settings/page.tsx` has ChangePasswordForm and DeleteAccountSection
- **No existing Stripe code** — `src/lib/stripe.ts` does not exist yet

---

## Implementation Order

1. Install Stripe package
2. Add environment variables
3. Create `src/lib/stripe.ts` (client singleton)
4. Create `src/lib/stripe-util.ts` (helper functions)
5. Create `src/actions/stripe.ts` (server actions)
6. Update `src/auth.ts` — JWT callback to sync `isPro` from DB
7. Create `src/app/api/webhooks/stripe/route.ts` (webhook handler)
8. Create `src/app/(dashboard)/settings/BillingSection.tsx`
9. Update `src/app/(dashboard)/settings/page.tsx` to include BillingSection
10. Add free tier limits to `src/lib/db/items.ts` and `src/lib/db/collections.ts`
11. Add `isPro` guard to `src/app/api/upload/route.ts`
12. Update `.env.example` with all Stripe vars

---

## Phase 1: Stripe Dashboard Setup

Before writing code, configure Stripe:

1. Create two Products in the Stripe Dashboard:
   - **DevStash Pro Monthly** — $8/month recurring
   - **DevStash Pro Yearly** — $72/year recurring
2. Enable Webhooks at `https://yourdomain.com/api/webhooks/stripe`, subscribing to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
3. Copy the **Webhook Signing Secret** (`whsec_...`)
4. Copy **Price IDs** for monthly and yearly plans

---

## Phase 2: Core Integration Files

### Install dependency

```bash
npm install stripe
```

### `src/lib/stripe.ts` — Stripe client singleton

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});
```

### `src/lib/stripe-util.ts` — Helper functions

```typescript
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, stripeCustomerId: true },
  });

  if (!user?.email) throw new Error('User email not found');

  const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name);

  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: { metadata: { userId } },
  });
}

export async function createPortalSession(userId: string, returnUrl: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) throw new Error('No Stripe customer found');

  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });
}
```

---

## Phase 3: Server Actions

### `src/actions/stripe.ts`

```typescript
'use server';

import { auth } from '@/auth';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe-util';
import { prisma } from '@/lib/prisma';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createCheckoutAction(
  priceId: string
): Promise<ActionResult<{ url: string | null }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true },
    });

    if (user?.isPro) return { success: false, error: 'Already a Pro subscriber' };

    const checkoutSession = await createCheckoutSession(
      session.user.id,
      priceId,
      `${process.env.NEXTAUTH_URL}/settings?upgraded=true`,
      `${process.env.NEXTAUTH_URL}/settings`
    );

    return { success: true, data: { url: checkoutSession.url } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Checkout failed' };
  }
}

export async function getPortalSessionAction(): Promise<ActionResult<{ url: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const portalSession = await createPortalSession(
      session.user.id,
      `${process.env.NEXTAUTH_URL}/settings`
    );
    return { success: true, data: { url: portalSession.url } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to open billing portal' };
  }
}
```

---

## Phase 4: Session Sync — JWT Callback

Update `src/auth.ts` to always sync `isPro` from the database. This ensures the session stays in sync after Stripe webhook updates without relying on the unreliable `trigger === "update"` pattern.

```typescript
// In the callbacks section of auth.ts:
async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
  }

  // Always sync isPro from database to catch webhook updates
  if (token.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { isPro: true, passwordChangedAt: true },
    });

    token.isPro = dbUser?.isPro ?? false;

    // Existing password change invalidation logic
    if (dbUser?.passwordChangedAt && token.iat) {
      const changedAt = Math.floor(dbUser.passwordChangedAt.getTime() / 1000);
      if ((token.iat as number) < changedAt) return null;
    }
  }

  return token;
},

session({ session, token }) {
  if (token.sub) {
    session.user.id = token.sub;
    (session.user as any).isPro = token.isPro ?? false;
  }
  return session;
},
```

Also extend the `Session` type in `src/types/auth.ts` (or wherever it's extended):

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession['user'];
  }
}
```

**Trade-off**: One extra DB query per session validation. Acceptable given the benefit of guaranteed sync after webhook updates. A simple page reload after checkout is sufficient to pick up Pro status.

---

## Phase 5: Webhook Handler

### `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: isActive,
            stripeSubscriptionId: subscription.id,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: false,
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(`Payment failed for customer ${invoice.customer}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

> The webhook must **not** use `bodyParser` — `req.text()` must read the raw body for signature verification to work. Next.js App Router does not parse the body by default, so this works out of the box.

---

## Phase 6: Feature Gating

### Free tier limits

| Feature | Free | Pro |
|---------|------|-----|
| Items | 50 total | Unlimited |
| Collections | 3 total | Unlimited |
| File/Image uploads | ❌ | ✅ |
| AI features | ❌ | ✅ |
| Export | ❌ | ✅ |

### `src/lib/db/items.ts` — createItem (add before the prisma.item.create call)

```typescript
// Add at the start of createItem:
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isPro: true },
});

if (!user?.isPro) {
  const count = await prisma.item.count({ where: { userId } });
  if (count >= 50) {
    throw new Error('Free tier limit reached: 50 items. Upgrade to Pro for unlimited items.');
  }
}
```

### `src/lib/db/collections.ts` — createCollection (add before prisma.collection.create)

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isPro: true },
});

if (!user?.isPro) {
  const count = await prisma.collection.count({ where: { userId } });
  if (count >= 3) {
    throw new Error('Free tier limit reached: 3 collections. Upgrade to Pro for unlimited collections.');
  }
}
```

### `src/app/api/upload/route.ts` — Add isPro guard

```typescript
// After auth check, before processing the file:
const dbUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
});

if (!dbUser?.isPro) {
  return NextResponse.json(
    { error: 'File uploads require a Pro subscription. Upgrade to Pro to upload files and images.' },
    { status: 403 }
  );
}
```

---

## Phase 7: Billing UI

### `src/app/(dashboard)/settings/BillingSection.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCheckoutAction, getPortalSessionAction } from '@/actions/stripe';

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!;
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!;

export default function BillingSection({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async (priceId: string) => {
    setLoading(true);
    const result = await createCheckoutAction(priceId);
    if (result.success && result.data.url) {
      router.push(result.data.url);
    } else {
      toast.error(result.success ? 'No checkout URL' : result.error);
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    const result = await getPortalSessionAction();
    if (result.success) {
      router.push(result.data.url);
    } else {
      toast.error(result.error);
      setLoading(false);
    }
  };

  if (isPro) {
    return (
      <div className="rounded-lg border border-border p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Subscription</h3>
          <p className="text-sm text-muted-foreground">You are on the Pro plan.</p>
        </div>
        <Button onClick={handleManageBilling} disabled={loading} variant="outline">
          Manage Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
        <p className="text-sm text-muted-foreground">
          Unlimited items, file uploads, AI features, and more.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => handleUpgrade(MONTHLY_PRICE_ID)} disabled={loading}>
          Monthly — $8/mo
        </Button>
        <Button onClick={() => handleUpgrade(YEARLY_PRICE_ID)} disabled={loading} variant="outline">
          Yearly — $72/yr (save 25%)
        </Button>
      </div>
    </div>
  );
}
```

Update `src/app/(dashboard)/settings/page.tsx` to import and render `<BillingSection isPro={session.user.isPro} />`.

---

## Environment Variables

Add to `.env.local` and `.env.example`:

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY="price_..."
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY="price_..."
```

> `STRIPE_PUBLISHABLE_KEY` is not needed server-side. The `NEXT_PUBLIC_` prefix exposes price IDs to the browser for the BillingSection component.

---

## Testing Checklist

### Setup
- [ ] Stripe API keys populated in `.env.local`
- [ ] Two Price IDs created in Stripe Dashboard (monthly + yearly)
- [ ] Webhook endpoint registered, events subscribed, signing secret in env

### Session sync
- [ ] `session.user.isPro` is present and defaults to `false` for new users
- [ ] After manually setting `isPro = true` in DB, next page reload shows Pro status

### Checkout flow
- [ ] "Monthly" button redirects to Stripe Checkout
- [ ] "Yearly" button redirects to Stripe Checkout
- [ ] Successful checkout redirects to `/settings?upgraded=true`
- [ ] Cancelled checkout redirects to `/settings`

### Webhooks (test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [ ] `customer.subscription.created` sets `isPro = true` in DB
- [ ] `customer.subscription.updated` (active → canceled) sets `isPro = false`
- [ ] `customer.subscription.deleted` sets `isPro = false` and clears `stripeSubscriptionId`
- [ ] Page reload after webhook reflects updated Pro status

### Feature gating
- [ ] Free user creating 51st item → error toast "Free tier limit reached"
- [ ] Free user creating 4th collection → error toast "Free tier limit reached"
- [ ] Free user uploading file → 403 with clear error message
- [ ] Pro user can exceed all limits freely

### Billing portal
- [ ] Pro user sees "Manage Billing" button
- [ ] Click redirects to Stripe Customer Portal
- [ ] Portal return URL brings back to `/settings`

### End-to-end
- [ ] New user → free tier limits enforced → upgrade → Pro status within one page reload → limits lifted
- [ ] Cancel subscription via portal → `customer.subscription.deleted` webhook → next session shows free again
