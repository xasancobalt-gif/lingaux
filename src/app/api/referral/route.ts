import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { ensureReferralCode } from "@/lib/referral";
export const dynamic = 'force-dynamic';

// GET /api/referral — wallet + code + list
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const code = await ensureReferralCode(user.id, user.name || user.email!);
  const referrals = await prisma.referral.findMany({
    where: { referrerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { referred: { select: { email: true, name: true, createdAt: true } } },
    take: 50,
  });
  const tx = await prisma.coinTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const origin = req.headers.get("origin") || process.env.AUTH_URL || "http://localhost:3000";
  const link = `${origin}/?ref=${code}`;

  return NextResponse.json({
    code,
    link,
    coins: user.coins,
    referrals: referrals.map(r => ({
      id: r.id, coins: r.coins, createdAt: r.createdAt,
      referredEmail: r.referred.email, referredName: r.referred.name,
    })),
    transactions: tx,
    message: "80 coins = 80rs per signup — usable for subscription & products only (platform wallet)",
  });
}

// POST /api/referral { code } — manually claim referral (if user came via link, we auto-claim on signup, but this allows retro)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(()=>({}));
  const code = (body.code as string)?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.referredById) return NextResponse.json({ error: "Already referred" }, { status: 400 });

  const { creditReferral } = await import("@/lib/referral");
  const ref = await creditReferral(code, user.id);
  if (!ref) return NextResponse.json({ error: "Invalid code or self-referral or already claimed" }, { status: 400 });
  return NextResponse.json({ ok: true, referral: ref, coins: 80 });
}
