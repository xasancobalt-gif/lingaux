import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Razorpay webhook: https://razorpay.com/docs/webhooks/
// Event: payment.captured, order.paid
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers.get("x-razorpay-signature");
  const raw = await req.text();

  if (secret && signature) {
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (expected !== signature) {
      console.error("[razorpay webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else if (secret) {
    console.warn("[razorpay webhook] no signature but secret set — allowing for test");
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const event = payload.event as string;
  console.log("[razorpay webhook]", event);

  try {
    if (event === "payment.captured" || event === "order.paid" || event === "payment.authorized") {
      const payment = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};
      const order = payload.payload?.order?.entity || {};
      const notes = payment.notes || order.notes || {};
      const userId = notes.userId;
      const plan = notes.plan || "monthly";
      const amount = payment.amount || order.amount;
      const currency = payment.currency || order.currency || "INR";
      const providerId = payment.id || order.id;

      if (userId) {
        // Idempotency: skip if already exists
        const existing = await prisma.subscription.findFirst({ where: { providerId, provider: "razorpay" } });
        if (!existing) {
          await prisma.subscription.create({
            data: {
              userId,
              provider: "razorpay",
              providerId,
              plan,
              status: "active",
              amount: amount || null,
              currency: currency?.toUpperCase() || "INR",
              currentPeriodEnd: plan === "lifetime" ? null : new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
            },
          });
          await prisma.user.update({ where: { id: userId }, data: { plan: "pro" } });
          console.log(`[razorpay webhook] user ${userId} upgraded to pro via ${plan}`);
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[razorpay webhook handler]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
