import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const ok = await verifyPayPalWebhook(req.headers, raw);
  if (!ok) {
    console.error("[paypal webhook] verification failed");
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const eventType = payload.event_type as string;
  console.log("[paypal webhook]", eventType);

  try {
    if (eventType === "PAYMENT.CAPTURE.COMPLETED" || eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = payload.resource as any;
      // resource.custom_id or resource.purchase_units
      const customId = resource.custom_id || resource.purchase_units?.[0]?.custom_id;
      let userId: string | null = null;
      let plan: string = "monthly";
      if (customId) {
        try { const c = JSON.parse(customId); userId = c.userId; plan = c.plan || plan; } catch {}
      }
      // Fallback via payer email
      if (!userId && resource.payer?.email_address) {
        const u = await prisma.user.findUnique({ where: { email: resource.payer.email_address.toLowerCase() } });
        userId = u?.id || null;
      }
      if (userId) {
        const amount = resource.amount?.value ? Math.round(parseFloat(resource.amount.value) * 100) : null;
        const currency = resource.amount?.currency_code || "USD";
        const providerId = resource.id as string;
        const existing = await prisma.subscription.findFirst({ where: { providerId, provider: "paypal" } });
        if (!existing) {
          await prisma.subscription.create({
            data: {
              userId,
              provider: "paypal",
              providerId,
              plan,
              status: "active",
              amount: amount || null,
              currency,
              currentPeriodEnd: plan === "lifetime" ? null : new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
            },
          });
          await prisma.user.update({ where: { id: userId }, data: { plan: "pro" } });
          console.log(`[paypal webhook] user ${userId} upgraded to pro via ${plan}`);
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("[paypal webhook handler]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
