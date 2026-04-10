import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body as { email: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return success to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: { identifier: `reset:${email}`, token, expires },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch {
      // Clean up token on send failure but still return success to avoid enumeration
      await prisma.verificationToken.delete({ where: { token } });
    }
  }

  return NextResponse.json({ success: true });
}
