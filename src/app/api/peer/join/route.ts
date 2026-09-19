export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/peer/join — enter the matchmaking queue (FIFO pairing).
// Two waiting users are matched into an active session; both leave the queue.
// Free daily cap (3 min) is enforced in /api/peer/status.
export async function POST() {
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const me = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() }, select:{ id:true, name:true } });
  if(!me) return NextResponse.json({error:"User not found"},{status:404});

  // Already in an active session? Return it (idempotent join).
  const existing = await prisma.peerSession.findFirst({
    where: { active: true, OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: { userA: { select: { id: true, name: true } }, userB: { select: { id: true, name: true } } },
  });
  if (existing) {
    const partner = existing.userAId === me.id ? existing.userB : existing.userA;
    return NextResponse.json({ matched: true, sessionId: existing.id, partner: { name: partner.name || "Peer" } });
  }

  // Find the longest-waiting other user in queue (and clean stale >10min entries).
  const staleCut = new Date(Date.now() - 10 * 60 * 1000);
  await prisma.peerQueue.deleteMany({ where: { joinedAt: { lt: staleCut } } }).catch(() => {});

  const candidate = await prisma.peerQueue.findFirst({
    where: { userId: { not: me.id } },
    orderBy: { joinedAt: "asc" },
  });

  if (candidate) {
    const other = await prisma.user.findUnique({ where: { id: candidate.userId }, select: { id: true, name: true } }).catch(() => null);
    // Atomic-ish: delete the candidate first; if delete removed a row, we own the match.
    const del = await prisma.peerQueue.deleteMany({ where: { id: candidate.id, userId: candidate.userId } });
    if (del.count === 1 && other) {
      const s = await prisma.peerSession.create({ data: { userAId: other.id, userBId: me.id } });
      return NextResponse.json({ matched: true, sessionId: s.id, partner: { name: other.name || "Peer" } });
    }
  }

  // No partner: join/refresh the queue.
  await prisma.peerQueue.upsert({
    where: { userId: me.id },
    update: { joinedAt: new Date() },
    create: { userId: me.id },
  });
  return NextResponse.json({ matched: false, waiting: true });
}
