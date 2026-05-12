import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { update: vi.fn() },
  },
}));

import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/webhooks/stripe/route';

const mockConstructEvent = vi.mocked(stripe.webhooks.constructEvent);
const mockUserUpdate = vi.mocked(prisma.user.update);

function makeRequest(signature: string | null, body = 'raw-body') {
  return {
    text: () => Promise.resolve(body),
    headers: { get: (key: string) => (key === 'stripe-signature' ? signature : null) },
  } as unknown as Request;
}

function makeEvent(type: string, data: object) {
  return { type, data: { object: data } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Bad signature'); });
    const res = await POST(makeRequest('bad-sig'));
    expect(res.status).toBe(400);
  });

  it('sets isPro=true on customer.subscription.created', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.created', { id: 'sub-1', metadata: { userId: 'user-1' } }) as never
    );
    mockUserUpdate.mockResolvedValue({} as never);

    const res = await POST(makeRequest('valid-sig'));
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPro: true, stripeSubscriptionId: 'sub-1' },
    });
  });

  it('skips DB update on subscription.created when userId is missing', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.created', { id: 'sub-1', metadata: {} }) as never
    );

    const res = await POST(makeRequest('valid-sig'));
    expect(res.status).toBe(200);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('sets isPro=true on subscription.updated with active status', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.updated', {
        id: 'sub-1',
        status: 'active',
        metadata: { userId: 'user-1' },
      }) as never
    );
    mockUserUpdate.mockResolvedValue({} as never);

    await POST(makeRequest('valid-sig'));
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPro: true, stripeSubscriptionId: 'sub-1' },
    });
  });

  it('sets isPro=false on subscription.updated with canceled status', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.updated', {
        id: 'sub-1',
        status: 'canceled',
        metadata: { userId: 'user-1' },
      }) as never
    );
    mockUserUpdate.mockResolvedValue({} as never);

    await POST(makeRequest('valid-sig'));
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPro: false, stripeSubscriptionId: 'sub-1' },
    });
  });

  it('sets isPro=false and clears subscriptionId on subscription.deleted', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.deleted', {
        id: 'sub-1',
        metadata: { userId: 'user-1' },
      }) as never
    );
    mockUserUpdate.mockResolvedValue({} as never);

    await POST(makeRequest('valid-sig'));
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPro: false, stripeSubscriptionId: null },
    });
  });

  it('returns 200 on invoice.payment_failed without DB update', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('invoice.payment_failed', { customer: 'cus-1' }) as never
    );

    const res = await POST(makeRequest('valid-sig'));
    expect(res.status).toBe(200);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it('returns 500 when DB update throws', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.created', { id: 'sub-1', metadata: { userId: 'user-1' } }) as never
    );
    mockUserUpdate.mockRejectedValue(new Error('DB error'));

    const res = await POST(makeRequest('valid-sig'));
    expect(res.status).toBe(500);
  });
});
