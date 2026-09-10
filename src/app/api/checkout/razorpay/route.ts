import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay, getRazorpayPlan, isRazorpayConfigured } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["monthly", "annual", "lifetime"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isRazorpayConfigured() || !razorpay) {
    return NextResponse.json(
      { error: "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env. Using mock for now.", code: "NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan = parsed.data.plan;
  const cfg = getRazorpayPlan(plan);
  const userId = (session.user as any).id as string;

  try {
    const order = await razorpay!.orders.create({
      amount: cfg.amount,
      currency: cfg.currency,
      receipt: `LINGAUX_${userId}_${Date.now()}`,
      notes: { userId, plan, provider: "razorpay", email: session.user.email! },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      user: { name: session.user.name, email: session.user.email },
    });
  } catch (e: any) {
    console.error("[razorpay order]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
