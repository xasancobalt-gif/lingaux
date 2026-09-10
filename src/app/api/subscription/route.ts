import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';
import { z } from "zod";
export const dynamic = 'force-dynamic';

const schema = z.object({
  provider: z.enum(["stripe","paypal","razorpay","bank","coins"]),
  plan: z.enum(["monthly","annual","lifetime"]),
  amount: z.number().optional(),
  currency: z.string().optional(),
});

// POST /api/subscription — mock upgrade (real webhooks will set this). For demo, instantly upgrades user.plan to pro
export async function POST(req: NextRequest){
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const user = await prisma.user.findUnique({where:{email:session.user.email.toLowerCase()}});
  if(!user) return NextResponse.json({error:"User not found"},{status:404});

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Invalid", issues:parsed.error.issues},{status:400});
  const { provider, plan } = parsed.data;

  // Coins: 80 coins = 80rs, price 19900 paise → 199 coins etc. Check balance.
  if (provider === "coins") {
    const priceMap: Record<string, number> = { monthly: 199, annual: 1490, lifetime: 3999 };
    const needed = priceMap[plan];
    if (user.coins < needed) {
      return NextResponse.json({ error: `Not enough coins. Need ${needed}, you have ${user.coins}. Refer friends: 80 coins per signup.`, code: "INSUFFICIENT_COINS" }, { status: 402 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { coins: { decrement: needed } } });
    await prisma.coinTransaction.create({ data: { userId: user.id, amount: -needed, reason: "subscription", meta: plan } });
  }

  // Bank manual stays pending
  const status = provider==="bank" ? "pending_bank" : "active";
  const newPlan = status==="active" ? "pro" : user.plan;

  const sub = await prisma.subscription.create({
    data:{
      userId: user.id,
      provider,
      plan,
      status,
      amount: parsed.data.amount,
      currency: parsed.data.currency || (provider==="razorpay"?"INR":"USD"),
      currentPeriodEnd: plan==="lifetime" ? null : new Date(Date.now() + (plan==="annual"?365:30)*24*60*60*1000),
    }
  });

  if(status==="active"){
    await prisma.user.update({where:{id:user.id}, data:{ plan: "pro" }});
  }

  return NextResponse.json({subscription: sub, status, plan: newPlan}, {status:201});
}

export async function GET(){
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const user = await prisma.user.findUnique({where:{email:session.user.email.toLowerCase()}});
  const subs = await prisma.subscription.findMany({where:{userId:user?.id}, orderBy:{createdAt:"desc"}});
  return NextResponse.json({subscriptions: subs});
}
