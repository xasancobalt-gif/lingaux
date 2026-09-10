import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { z } from "zod";
export const dynamic = 'force-dynamic';

const BLOCKED = ["fuck","shit","bitch","asshole","slut","whore","nude","porn","sex","harass","chut","bhenchod","madarchod"];
function flagText(t:string){
  const low=t.toLowerCase();
  for(const w of BLOCKED) if(low.includes(w)) return w;
  return null;
}

// GET /api/messages?conversationId=xxx  — list
export async function GET(req: NextRequest){
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const cid = new URL(req.url).searchParams.get("conversationId");
  if(!cid) return NextResponse.json({error:"conversationId required"},{status:400});
  const messages = await prisma.message.findMany({
    where:{ conversationId: cid },
    orderBy:{ createdAt:"asc" },
    take: 100,
    include:{ sender:{ select:{ id:true, name:true, image:true } } }
  });
  return NextResponse.json({messages});
}

const sendSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest){
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const user = await prisma.user.findUnique({where:{email:session.user.email.toLowerCase()}});
  if(!user) return NextResponse.json({error:"User not found"},{status:404});
  if(user.plan==="free") return NextResponse.json({error:"Pro required for private chat", code:"PAYWALL"},{status:403});

  const body = await req.json();
  const parsed = sendSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Invalid", issues:parsed.error.issues},{status:400});
  const { conversationId, content } = parsed.data;

  const blocked = flagText(content);
  if(blocked) return NextResponse.json({error:`Message blocked: contains "${blocked}". Keep it respectful.`, code:"MODERATED"},{status:422});

  const msg = await prisma.message.create({
    data:{ conversationId, senderId: user.id, content },
    include:{ sender:{ select:{ id:true, name:true, image:true } } }
  });
  // Touch conversation updatedAt
  await prisma.conversation.update({where:{id:conversationId}, data:{updatedAt:new Date()}}).catch(()=>{});
  return NextResponse.json({message:msg},{status:201});
}
