export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/peer/leave — leave the queue and/or end the active session for
// both participants.
export async function POST() {
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const me = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() }, select:{ id:true } });
  if(!me) return NextResponse.json({error:"User not found"},{status:404});

  await prisma.peerQueue.deleteMany({ where: { userId: me.id } });
  await prisma.peerSession.updateMany({
    where: { active: true, OR: [{ userAId: me.id }, { userBId: me.id }] },
    data: { active: false, endedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
