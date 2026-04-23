import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileItems = await prisma.item.findMany({
    where: { userId: session.user.id, fileUrl: { not: null } },
    select: { fileUrl: true },
  });

  await Promise.allSettled(
    fileItems.map((item) => deleteFromR2(item.fileUrl!))
  );

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}
