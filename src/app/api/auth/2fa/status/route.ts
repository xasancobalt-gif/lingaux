import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
    select: { twoFactorEnabled: true, role: true, email: true },
  });
  return NextResponse.json({ enabled: user?.twoFactorEnabled || false, role: user?.role, email: user?.email });
}
