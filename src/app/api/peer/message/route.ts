export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ sessionId: z.string().min(5), text: z.string().min(1).max(500) });

// POST /api/peer/message { sessionId, text } — Pro-only chat inside an active
// peer session. Free users get voice time only (chat is a Pro perk).
export async function POST(req: NextRequest) {
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const me = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() }, select:{ id:true, plan:true } });
  if(!me) return NextResponse.json({error:"User not found"},{status:404});
  if(me.plan !== "pro") return NextResponse.json({ error:"Pro required for peer chat", code:"PAYWALL" },{status:402});

  const parsed = schema.safeParse(await req.json().catch(()=>({})));
  if(!parsed.success) return NextResponse.json({error:"Invalid"},{status:400});

  const active = await prisma.peerSession.findFirst({
    where: { id: parsed.data.sessionId, active: true, OR: [{ userAId: me.id }, { userBId: me.id }] },
  });
  if(!active) return NextResponse.json({error:"No active session"},{status:404});

  const msg = await prisma.peerMessage.create({
    data: { sessionId: active.id, userId: me.id, text: parsed.data.text.trim() },
  });
  return NextResponse.json({ ok: true, message: { id: msg.id, userId: me.id, text: msg.text, createdAt: msg.createdAt } });
}
