export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ plan: z.enum(["monthly","annual","lifetime"]) });
// Must match subscription priceMap (INR).
const AMOUNTS: Record<string, number> = { monthly: 199, annual: 1490, lifetime: 3999 };

function baseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "lingaux.vercel.app";
  return `${proto}://${host}`;
}

// POST /api/checkout/cashfree { plan } — create a Cashfree PG order and
// return its paymentSessionId for cashfree.js checkout.
// Env: CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV=sandbox|production.
export async function POST(req: NextRequest){
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const parsed = schema.safeParse(await req.json().catch(()=>({})));
  if(!parsed.success) return NextResponse.json({error:"Invalid plan"},{status:400});

  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if(!appId || !secret){
    return NextResponse.json({ error:"Cashfree not configured.", code:"NOT_CONFIGURED" }, {status:503});
  }
  const mode = process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
  const apiBase = mode === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";

  const user = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() } });
  if(!user) return NextResponse.json({error:"User not found"},{status:404});

  const { plan } = parsed.data;
  const orderId = `LX${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const returnUrl = `${baseUrl(req)}/subscription/success?provider=cashfree&order_id=${orderId}&plan=${plan}`;

  try{
    const res = await fetch(`${apiBase}/pg/orders`,{
      method:"POST",
      headers:{ "Content-Type":"application/json", "x-client-id":appId, "x-client-secret":secret, "x-api-version":"2023-08-01" },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: AMOUNTS[plan],
        order_currency: "INR",
        customer_details: { customer_id: user.id, customer_email: user.email, customer_name: user.name || undefined },
        order_meta: { return_url: returnUrl },
      }),
    });
    const j = await res.json().catch(()=>({}));
    if(!res.ok || !j?.payment_session_id){
      console.error("[cashfree] order failed", res.status, j);
      return NextResponse.json({error: j?.message || "Cashfree order failed"},{status:502});
    }
    return NextResponse.json({ paymentSessionId: j.payment_session_id, orderId, mode });
  }catch(e:any){
    console.error("[cashfree]", e?.message || e);
    return NextResponse.json({error:"Cashfree unreachable"},{status:502});
  }
}
