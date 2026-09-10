import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { requireAdmin } from "@/lib/admin-guard";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [users, posts, recordings, subs, flagged, pendingBank] = await Promise.all([
    prisma.user.count(),
    prisma.communityPost.count(),
    prisma.recording.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.message.count({ where: { isFlagged: true } }),
    prisma.subscription.count({ where: { status: "pending_bank" } }),
  ]);

  const revenue = await prisma.subscription.aggregate({
    _sum: { amount: true },
    where: { status: "active" },
  });

  return NextResponse.json({
    users, posts, recordings, activeSubs: subs, flagged, pendingBank,
    revenuePaise: revenue._sum.amount || 0,
  });
}
