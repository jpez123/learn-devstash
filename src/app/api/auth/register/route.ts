import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/resend";
import { limiters, getIP, applyRateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limited = await applyRateLimit(limiters.register, `register:${ip}`);
  if (limited) return tooManyRequestsResponse(limited.retryAfter);

  const body = await req.json();
  const { name, email, password, confirmPassword } = body as {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false";

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      emailVerified: verificationEnabled ? null : new Date(),
    },
  });

  if (verificationEnabled) {
    // Generate a verification token (expires in 24h)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    try {
      await sendVerificationEmail(email, token);
    } catch {
      // Roll back the user and token so the address can be re-registered once the issue is fixed
      await prisma.verificationToken.delete({ where: { token } });
      await prisma.user.delete({ where: { email } });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: true, emailVerificationRequired: verificationEnabled },
    { status: 201 }
  );
}
