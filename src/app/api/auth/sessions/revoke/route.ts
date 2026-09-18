import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/auth/sessions/revoke — bump sessionVersion: every JWT/session on
// every device (including this one) stops validating on next refresh.
// The client signs out right after calling this.
export async function POST(){
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const user = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() } });
  if(!user) return NextResponse.json({error:"User not found"},{status:404});
  await prisma.user.update({ where:{ id: user.id }, data:{ sessionVersion:{ increment:1 } } });
  return NextResponse.json({ ok:true });
}
