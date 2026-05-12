# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install Stripe and create the core integration files: client singleton, helper utilities, server actions, and session sync. This phase does not require Stripe CLI or a live webhook endpoint — all pieces can be tested independently with unit tests and a seeded `.env.local`.

## Requirements

- Install `stripe` npm package
- Create Stripe client singleton (`src/lib/stripe.ts`)
- Create helper utilities (`src/lib/stripe-util.ts`) for customer, checkout, and portal session management
- Create server actions (`src/actions/stripe.ts`) for checkout and billing portal
- Update `src/auth.ts` JWT callback to always sync `isPro` from the database
- Extend `Session` type with `isPro`
- Add free-tier usage limits to `src/lib/db/items.ts` and `src/lib/db/collections.ts`
- Add `isPro` guard to `src/app/api/upload/route.ts`
- Unit tests for the usage-limits module

## Files to Create

1. `src/lib/stripe.ts` — Stripe client singleton (throws if `STRIPE_SECRET_KEY` missing)
2. `src/lib/stripe-util.ts` — `getOrCreateStripeCustomer`, `createCheckoutSession`, `createPortalSession`
3. `src/actions/stripe.ts` — `createCheckoutAction`, `getPortalSessionAction`

## Files to Modify

4. `src/auth.ts` — JWT callback: always query DB for `isPro` + existing `passwordChangedAt` invalidation
5. `src/types/next-auth.d.ts` — extend `Session` with `isPro: boolean`
6. `src/lib/db/items.ts` — add 50-item free-tier guard at the top of `createItem`
7. `src/lib/db/collections.ts` — add 3-collection free-tier guard at the top of `createCollection`
8. `src/app/api/upload/route.ts` — add `isPro` check after auth, return 403 for free users
9. `.env.example` — add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`

## Unit Tests

File: `src/__tests__/lib/usage-limits.test.ts`

Test `createItem` and `createCollection` DB functions for free-tier enforcement:

- Free user with 49 items → item created successfully
- Free user with 50 items → throws "Free tier limit reached: 50 items..."
- Pro user with 50+ items → item created successfully (no limit)
- Free user with 2 collections → collection created successfully
- Free user with 3 collections → throws "Free tier limit reached: 3 collections..."
- Pro user with 3+ collections → collection created successfully

Mock Prisma; do not hit the real database.

## Free Tier Limits

| Resource    | Free | Pro       |
| ----------- | ---- | --------- |
| Items       | 50   | Unlimited |
| Collections | 3    | Unlimited |
| File upload | No   | Yes       |

## Session Sync Strategy

Always fetch `isPro` from DB in the JWT callback (one extra query per session validation). This guarantees the session reflects the latest DB state after a webhook update — a page reload is sufficient to pick up Pro status without requiring `trigger === "update"`.

```typescript
async jwt({ token, user }) {
  if (user) token.sub = user.id;

  if (token.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { isPro: true, passwordChangedAt: true },
    });

    token.isPro = dbUser?.isPro ?? false;

    if (dbUser?.passwordChangedAt && token.iat) {
      const changedAt = Math.floor(dbUser.passwordChangedAt.getTime() / 1000);
      if ((token.iat as number) < changedAt) return null;
    }
  }

  return token;
},
```

## Environment Variables

Add to `.env.local` (never commit real keys):

```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."
```

## Key Gotchas

- `STRIPE_PUBLISHABLE_KEY` is not needed server-side — omit it
- `NEXT_PUBLIC_` prefix is required for price IDs used in the BillingSection client component
- Stripe API version: `2024-04-10` — pin it explicitly in the singleton
- `getOrCreateStripeCustomer` must be idempotent: check DB first, only call `stripe.customers.create` if no existing ID
- Upload guard reads from DB directly (not session) to avoid stale session edge cases

## Testing (Manual)

1. `session.user.isPro` is `false` for a fresh user
2. Manually set `isPro = true` in DB → next page reload shows Pro status in session
3. Free user hitting the 51st item → action returns error with limit message
4. Free user hitting 4th collection → action returns error with limit message
5. Free user uploading a file → API returns 403 with clear message

## References

- Stripe SDK: https://stripe.com/docs/api
- Checkout Sessions: https://stripe.com/docs/payments/checkout
- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
