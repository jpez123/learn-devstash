'use server';

import { auth } from '@/auth';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe-util';
import { headers } from 'next/headers';

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

export async function createCheckoutByInterval(interval: 'month' | 'year') {
  const priceId =
    interval === 'month'
      ? process.env.STRIPE_PRICE_ID_MONTHLY ?? ''
      : process.env.STRIPE_PRICE_ID_YEARLY ?? '';
  return createCheckoutAction(priceId);
}

export async function createCheckoutAction(priceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const origin = await getOrigin();
    const url = await createCheckoutSession(session.user.id, priceId, `${origin}/settings`);
    return { url };
  } catch {
    return { error: 'Failed to create checkout session' };
  }
}

export async function getPortalSessionAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  try {
    const origin = await getOrigin();
    const url = await createPortalSession(session.user.id, `${origin}/settings`);
    return { url };
  } catch {
    return { error: 'Failed to create portal session' };
  }
}
