export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// FREE_DAILY_SECONDS — free plan gets 3 minutes/day of peer time (server-enforced).
const FREE_DAILY_SECONDS = 180;

function todayStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function dailyUsageSeconds(userId: string): Promise<number> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE("endedAt", NOW()) - "startedAt"))), 0)::int AS s
     FROM "PeerSession"
     WHERE ("userAId" = $1 OR "userBId" = $1) AND "startedAt" >= $2`,
    userId, todayStart()
  ) as any[];
  return rows[0]?.s || 0;
}

// GET /api/peer/status — poll while queued/in-session. Returns session state,
// partner, messages (Pro), time left (free), and auto-ends over-limit sessions.
export async function GET() {
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const me = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() }, select:{ id:true, plan:true, name:true } });
  if(!me) return NextResponse.json({error:"User not found"},{status:404});

  const isPro = me.plan === "pro";
  const active = await prisma.peerSession.findFirst({
    where: { active: true, OR: [{ userAId: me.id }, { userBId: me.id }] },
    include: {
      userA: { select: { id: true, name: true, image: true } },
      userB: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 50, include: { user: { select: { id: true, name: true } } } },
    },
  });

  if (!active) {
    const queued = await prisma.peerQueue.findUnique({ where: { userId: me.id } });
    const waitingCount = await prisma.peerQueue.count();
    return NextResponse.json({ state: queued ? "waiting" : "idle", waitingCount, freeLimitSeconds: isPro ? null : FREE_DAILY_SECONDS });
  }

  const partner = active.userAId === me.id ? active.userB : active.userA;
  const elapsed = Math.floor((Date.now() - active.startedAt.getTime()) / 1000);
  const used = await dailyUsageSeconds(me.id);
  const timeLeft = isPro ? null : Math.max(0, FREE_DAILY_SECONDS - used);

  // Free plan over limit (or 3-min session cap for everyone to keep rotations fair):
  const sessionCap = 180; // each pairing lasts max 3 min, then re-queue
  if (!isPro && timeLeft !== null && timeLeft <= 0) {
    await prisma.peerSession.update({ where: { id: active.id }, data: { active: false, endedAt: new Date() } }).catch(() => {});
    await prisma.peerQueue.deleteMany({ where: { userId: me.id } }).catch(() => {});
    return NextResponse.json({ state: "limit", message: "Daily free peer time used (3 min). Upgrade to Pro for unlimited practice + chat.", freeLimitSeconds: 0 });
  }
  if (elapsed >= sessionCap) {
    await prisma.peerSession.update({ where: { id: active.id }, data: { active: false, endedAt: new Date() } }).catch(() => {});
    return NextResponse.json({ state: "ended", message: "Session complete (3 min) — rejoin the queue to meet someone new." });
  }

  return NextResponse.json({
    state: "matched",
    sessionId: active.id,
    partner: { name: partner.name || "Peer", image: partner.image },
    startedAt: active.startedAt,
    elapsed,
    timeLeft,
    isPro,
    chatEnabled: isPro,
    messages: isPro ? active.messages.map((m: any) => ({ id: m.id, userId: m.userId, name: m.user?.name || "Peer", text: m.text, createdAt: m.createdAt })) : [],
  });
}
