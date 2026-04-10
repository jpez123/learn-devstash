import { NextRequest } from "next/server";
import { limiters, getIP, applyRateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body as { email?: string };
  if (!email) return Response.json({ ok: true });

  const ip = getIP(req);
  const limited = await applyRateLimit(limiters.login, `login:${ip}:${email}`);
  if (limited) return tooManyRequestsResponse(limited.retryAfter);

  return Response.json({ ok: true });
}
