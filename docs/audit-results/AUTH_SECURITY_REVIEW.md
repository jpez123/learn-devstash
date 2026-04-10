# Auth Security Review

**Last audit:** 2026-04-09  
**Auditor:** auth-auditor agent  
**Scope:** NextAuth v5 credentials flow, email verification, password reset, profile page

---

## Critical Findings

None found.

---

## High Findings

### [HIGH] Password Reset Does Not Invalidate Existing Sessions

**File:** `src/app/api/auth/reset-password/route.ts:39-44`  
**Issue:** After a successful password reset, the user's existing JWT sessions remain valid. An attacker who has already hijacked a session (e.g., via token theft) will remain authenticated even after the victim resets their password. Because this app uses `strategy: "jwt"`, there is no server-side session table to clear — invalidation requires either a per-user JWT secret rotation field or a `passwordChangedAt` timestamp checked in the JWT callback.  
**Fix:** Add a `passwordChangedAt DateTime?` column to the `User` model. Set it in both the reset-password and change-password routes. In the `session` callback in `src/auth.ts`, compare `token.iat` (issued-at) against `user.passwordChangedAt`; if `iat < passwordChangedAt`, return `null` to force re-authentication.

```ts
// src/auth.ts — inside callbacks
async session({ session, token }) {
  const user = await prisma.user.findUnique({
    where: { id: token.sub },
    select: { passwordChangedAt: true },
  });
  if (user?.passwordChangedAt && token.iat) {
    const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (token.iat < changedAt) return null; // force re-login
  }
  if (token.sub) session.user.id = token.sub;
  return session;
},
```

---

## Medium Findings

### [MEDIUM] No Rate Limiting on Login, Password Reset, or Registration Endpoints

**Files:** `src/app/api/auth/[...nextauth]/route.ts` (credentials authorize in `src/auth.ts:31-48`), `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/register/route.ts`  
**Issue:** There is no rate limiting on any auth endpoint. This enables:
- Brute-force credential stuffing against the sign-in flow (unlimited attempts, timing is consistent thanks to bcrypt but volume is unconstrained).
- Password reset token flooding: an attacker can call `POST /api/auth/forgot-password` in a loop to spam a victim's inbox and exhaust Resend quota.
- Account registration spam with disposable emails.

**Fix:** Add an edge-compatible rate limiter. The simplest production-ready option with Vercel/Neon is [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) backed by Upstash Redis, or use Vercel's built-in rate limiting. Apply per-IP limits in middleware or at the route level:

```ts
// Example: 10 attempts per 15 minutes per IP on forgot-password
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"),
});
const ip = req.headers.get("x-forwarded-for") ?? "unknown";
const { success } = await ratelimit.limit(`forgot-password:${ip}`);
if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
```

### [MEDIUM] No Server-Side Input Validation (Missing Zod)

**Files:** `src/app/api/auth/register/route.ts:8-13`, `src/app/api/auth/change-password/route.ts:12-17`, `src/app/api/auth/forgot-password/route.ts:7`, `src/app/api/auth/reset-password/route.ts:6-11`  
**Issue:** All API routes cast `req.json()` directly to TypeScript types using `as { ... }` without runtime validation. TypeScript types are erased at runtime, so a malformed or missing field simply becomes `undefined`, which can lead to unexpected behavior:
- In `register/route.ts` an empty-string email (e.g., `""`) passes the `if (!email)` guard and would attempt a DB lookup.
- There is no email format validation — any non-empty string is accepted.
- Password length is enforced in `change-password` and `reset-password` but not in `register`.

**Fix:** Add Zod validation at the top of each route handler:

```ts
// register/route.ts example
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
});

const parsed = RegisterSchema.safeParse(await req.json());
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
}
const { name, email, password, confirmPassword } = parsed.data;
```

---

## Low Findings

### [LOW] Register Route Does Not Enforce Minimum Password Length

**File:** `src/app/api/auth/register/route.ts:15-27`  
**Issue:** The change-password and reset-password routes enforce `password.length < 8` on the server side, but `register/route.ts` does not. The `minLength={8}` on the client-side `<Input>` is trivially bypassed by any HTTP client hitting the API directly. A user could register with a 1-character password.  
**Fix:** Add `if (password.length < 8) { return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 }); }` before hashing in `register/route.ts`.

### [LOW] Email Verification Token Is Not Deleted Before Marking emailVerified

**File:** `src/app/api/auth/verify-email/route.ts:22-27`  
**Issue:** The route updates `emailVerified` first and then deletes the token. If the delete fails (transient DB error), the token remains in the table but the email is already verified — leaving an orphaned, technically still-valid token. While the impact is low (a stale verification link that does nothing harmful beyond calling `update` on an already-verified user), the correct pattern is to perform both operations atomically.  
**Fix:** Wrap both operations in a Prisma transaction:

```ts
await prisma.$transaction([
  prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } }),
  prisma.verificationToken.delete({ where: { token } }),
]);
```

### [LOW] Change Password Success Does Not Invalidate Existing Sessions

**File:** `src/app/api/auth/change-password/route.ts:45-49`  
**Issue:** Same session-invalidation gap as the password reset flow (see High finding above). When a user changes their own password, all other active sessions (e.g., a session on another device) remain valid.  
**Fix:** Same as the High finding — set `passwordChangedAt` and check it in the `session` callback.

### [LOW] Proxy Matcher Does Not Protect All Profile Sub-Paths

**File:** `src/proxy.ts:14`  
**Issue:** The middleware matcher is `["/dashboard/:path*", "/profile"]`. The `/profile` entry does not include `/:path*`, so any future sub-routes under `/profile/` (e.g., `/profile/settings`) would not be protected by the middleware. The profile page itself performs an additional server-side `auth()` check, so there is no current bypass, but the middleware gap is a latent issue.  
**Fix:** Change the matcher to `["/dashboard/:path*", "/profile/:path*"]` (or `"/profile{/:path}*"` depending on the Next.js version's path-to-regexp syntax).

---

## Passed Checks

- **Password hashing**: bcryptjs used with cost factor **12** in `src/app/api/auth/register/route.ts:37`, `src/app/api/auth/change-password/route.ts:45`, and `src/app/api/auth/reset-password/route.ts:37`. Factor 12 exceeds the minimum recommended value of 10.
- **Timing-safe password comparison**: `bcrypt.compare()` used in `src/auth.ts:41` and `src/app/api/auth/change-password/route.ts:40`. Not a custom string comparison.
- **Cryptographically random tokens**: `crypto.randomUUID()` (Web Crypto API) used for both verification and reset tokens in `src/app/api/auth/register/route.ts:51` and `src/app/api/auth/forgot-password/route.ts:22`. Not `Math.random()`.
- **Token expiry enforced at use time**: Both `verify-email/route.ts:17` and `reset-password/route.ts:31` check `record.expires < new Date()` before proceeding. Expired tokens are also deleted.
- **Password reset tokens are single-use**: Token is deleted immediately after use in `reset-password/route.ts:44`, before the success response is returned.
- **No user enumeration in forgot-password**: `src/app/api/auth/forgot-password/route.ts` always returns `{ success: true }` regardless of whether the email exists. The comment confirms this is intentional.
- **Session user ID used for all account mutations**: `change-password/route.ts` and `delete-account/route.ts` both call `await auth()` and use `session.user.id` — not a client-supplied userId — when querying/updating the database.
- **Profile page double-checks session server-side**: `src/app/(dashboard)/profile/page.tsx:11` calls `await auth()` and redirects to `/sign-in` if no session, even though the middleware already protects `/profile`.
- **Separate reset token namespace**: Forgot-password tokens use the `reset:${email}` identifier prefix, preventing a verification token from being used as a password reset token and vice versa.
- **Existing reset tokens cleared on new request**: `forgot-password/route.ts:18-20` calls `deleteMany` on old reset tokens for the address before issuing a new one, preventing token accumulation.
- **Credentials authorize returns null (not throws) on failure**: `src/auth.ts:42-45` returns `null` on bad credentials, which is the correct NextAuth v5 pattern and avoids leaking error details via exceptions.
- **Edge-safe config split**: `src/auth.config.ts` (edge-safe, no bcrypt) and `src/auth.ts` (Node.js, full bcrypt) are correctly separated for middleware compatibility.
- **OAuth users cannot use change-password**: `change-password/route.ts:36-38` checks `if (!user?.password)` and returns a 400 error, preventing OAuth-only accounts from reaching the bcrypt operations.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 1     |
| Medium   | 2     |
| Low      | 4     |
