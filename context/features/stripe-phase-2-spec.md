# Stripe Integration — Phase 2: Webhooks, Feature Gating & Billing UI

## Overview

Wire up the Stripe webhook handler, build the BillingSection UI on the settings page, and verify the end-to-end subscription flow. This phase requires the Stripe CLI for local webhook testing and depends on Phase 1 being fully implemented.

## Prerequisites

- Phase 1 complete (Stripe singleton, helpers, server actions, session sync, usage limits)
- Stripe CLI installed (`brew install stripe/stripe-cli/stripe`)
- `.env.local` populated with real or test Stripe keys and price IDs
- Two Stripe products created in the Dashboard (monthly $8/mo, yearly $72/yr)
- Webhook endpoint registered at `https://yourdomain.com/api/webhooks/stripe` with events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

## Requirements

- Create Stripe webhook handler API route
- Build `BillingSection` client component (upgrade flow + billing portal)
- Integrate `BillingSection` into the settings page

## Files to Create

1. `src/app/api/webhooks/stripe/route.ts` — POST handler with signature verification
2. `src/app/(dashboard)/settings/BillingSection.tsx` — client component for upgrade/manage billing

## Files to Modify

3. `src/app/(dashboard)/settings/page.tsx` — import and render `<BillingSection isPro={session.user.isPro} />`

## Webhook Handler Details

- Read raw body with `req.text()` — **do not** use `req.json()`; Next.js App Router does not pre-parse, so signature verification works out of the box
- Verify signature with `stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)`
- Handle these events:

| Event | Action |
| --- | --- |
| `customer.subscription.created` | Set `isPro = true`, store `stripeSubscriptionId` |
| `customer.subscription.updated` | Set `isPro` based on `status === 'active' \| 'trialing'`, update `stripeSubscriptionId` |
| `customer.subscription.deleted` | Set `isPro = false`, clear `stripeSubscriptionId` |
| `invoice.payment_failed` | Log error (no DB update needed) |

- Always return `{ received: true }` on success
- Return 400 for missing or invalid signature
- Return 500 if DB update throws

## BillingSection Component

**Free user view:**
- Heading: "Upgrade to Pro"
- Description: "Unlimited items, file uploads, AI features, and more."
- Two buttons: "Monthly — $8/mo" and "Yearly — $72/yr (save 25%)"
- Clicking either calls `createCheckoutAction(priceId)` and redirects to Stripe Checkout URL

**Pro user view:**
- Heading: "Subscription"
- Description: "You are on the Pro plan."
- Single button: "Manage Billing" → calls `getPortalSessionAction()` and redirects to portal

Both states disable buttons and show a loading state during the async call. Use `toast.error` for failure cases.

Price IDs come from `process.env.STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`.

## Settings Page Update

Add `BillingSection` below the existing `ChangePasswordForm` and above `DeleteAccountSection`:

```tsx
<BillingSection isPro={(session.user as any).isPro ?? false} />
```

## Testing with Stripe CLI

Start the listener in a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the displayed webhook signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Webhook Test Commands

```bash
# Simulate subscription created
stripe trigger customer.subscription.created

# Simulate subscription cancelled
stripe trigger customer.subscription.deleted

# Simulate payment failure
stripe trigger invoice.payment_failed
```

## Testing Checklist

### Session sync (from Phase 1 — verify before proceeding)
- [ ] `session.user.isPro` defaults to `false` for new users
- [ ] Manually set `isPro = true` in DB → next reload shows Pro

### Checkout flow
- [ ] "Monthly" button redirects to Stripe Checkout
- [ ] "Yearly" button redirects to Stripe Checkout
- [ ] Successful checkout redirects to `/settings?upgraded=true`
- [ ] Cancelled checkout redirects to `/settings`

### Webhooks
- [ ] `customer.subscription.created` sets `isPro = true` in DB
- [ ] `customer.subscription.updated` (active → canceled) sets `isPro = false`
- [ ] `customer.subscription.deleted` sets `isPro = false` + clears `stripeSubscriptionId`
- [ ] Page reload after webhook reflects updated Pro status

### Feature gating (from Phase 1 — verify end-to-end)
- [ ] Free user creating 51st item → error toast
- [ ] Free user creating 4th collection → error toast
- [ ] Free user uploading file → 403

### Billing portal
- [ ] Pro user sees "Manage Billing" button
- [ ] Click redirects to Stripe Customer Portal
- [ ] Portal return URL lands on `/settings`

### End-to-end
- [ ] New user → free limits enforced → upgrade → Pro within one reload → limits lifted
- [ ] Cancel via portal → webhook → next session is free again

## Key Gotchas

- Webhook route must **not** call `bodyParser` or `req.json()` — raw body required for HMAC verification
- `subscription.metadata.userId` must be set at checkout time (`subscription_data: { metadata: { userId } }` in `createCheckoutSession`) — webhook handler depends on this
- The Stripe CLI signing secret (`whsec_...` from `stripe listen`) differs from the Dashboard signing secret — use the CLI secret for local dev, Dashboard secret in production
- `router.push(url)` does a client-side navigation; for external Stripe URLs this works correctly in Next.js App Router

## References

- Stripe Webhooks: https://stripe.com/docs/webhooks
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
