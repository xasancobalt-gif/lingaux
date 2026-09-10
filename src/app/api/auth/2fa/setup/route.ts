import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { generateSecret, generateQRDataURL } from "@/lib/2fa";
export const dynamic = 'force-dynamic';

// POST /api/auth/2fa/setup — authenticated, generate secret + QR (optional)
// Does not enable until verify succeeds
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { secret, uri } = generateSecret(email);
  const qr = await generateQRDataURL(uri);

  // Store secret temp (not yet enabled)
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } });

  return NextResponse.json({ secret, uri, qr, enabled: user.twoFactorEnabled });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { twoFactorEnabled: true } });
  return NextResponse.json({ enabled: user?.twoFactorEnabled || false });
}
