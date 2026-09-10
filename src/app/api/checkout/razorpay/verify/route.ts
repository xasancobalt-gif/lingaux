import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
  plan: z.enum(["monthly", "annual", "lifetime"]),
});

// Client callback after Razorpay checkout success — verify signature and activate pro immediately (webhook is backup)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "RAZORPAY_KEY_SECRET not set" }, { status: 503 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { orderId, paymentId, signature, plan } = parsed.data;
  const ok = verifyRazorpaySignature(orderId, paymentId, signature, secret);
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email!.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Idempotent
  const existing = await prisma.subscription.findFirst({ where: { providerId: paymentId, provider: "razorpay" } });
  if (!existing) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        provider: "razorpay",
        providerId: paymentId,
        plan,
        status: "active",
        currency: "INR",
        currentPeriodEnd: plan === "lifetime" ? null : new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { plan: "pro" } });
  }

  return NextResponse.json({ ok: true, plan: "pro" });
}
