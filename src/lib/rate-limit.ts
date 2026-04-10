import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Limiter = Ratelimit | null;

function createLimiter(
  requests: number,
  window: `${number} ${"ms" | "s" | "m" | "h" | "d"}`
): Limiter {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null; // fail open when not configured
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  });
}

export const limiters = {
  login: createLimiter(5, "15 m"),
  register: createLimiter(3, "1 h"),
  forgotPassword: createLimiter(3, "1 h"),
  resetPassword: createLimiter(5, "15 m"),
};

export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

/**
 * Returns null if the request is allowed.
 * Returns { retryAfter } (in seconds) if rate limited.
 * Fails open (returns null) if the limiter is not configured.
 */
export async function applyRateLimit(
  limiter: Limiter,
  key: string
): Promise<{ retryAfter: number } | null> {
  if (!limiter) return null;
  try {
    const { success, reset } = await limiter.limit(key);
    if (!success) {
      return { retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
    }
    return null;
  } catch {
    return null; // fail open on Upstash errors
  }
}

export function tooManyRequestsResponse(retryAfter: number): Response {
  const minutes = Math.ceil(retryAfter / 60);
  return Response.json(
    {
      error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}
