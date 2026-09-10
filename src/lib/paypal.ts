const PAYPAL_PLANS = {
  monthly: { amount: "19.00", currency: "USD", name: "LINGAUX Pro Monthly" },
  annual: { amount: "149.00", currency: "USD", name: "LINGAUX Pro Annual" },
  lifetime: { amount: "399.00", currency: "USD", name: "LINGAUX Lifetime" },
} as const;

export type PayPalPlan = keyof typeof PAYPAL_PLANS;

export function getPayPalPlan(plan: string) {
  return PAYPAL_PLANS[plan as PayPalPlan] || PAYPAL_PLANS.monthly;
}

export function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export function isPayPalConfigured() {
  return !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_SECRET;
}

export async function getPayPalAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  const base = getPayPalBaseUrl();
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.access_token as string;
}

export async function createPayPalOrder(plan: string, userId: string, email: string) {
  const cfg = getPayPalPlan(plan);
  const base = getPayPalBaseUrl();
  const token = await getPayPalAccessToken();
  const origin = process.env.AUTH_URL || "http://localhost:3000";

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `LINGAUX_${userId}_${Date.now()}`,
          custom_id: JSON.stringify({ userId, plan, provider: "paypal" }),
          description: cfg.name,
          amount: { currency_code: cfg.currency, value: cfg.amount },
        },
      ],
      application_context: {
        brand_name: "LINGAUX",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${origin}/api/checkout/paypal/capture?plan=${plan}&userId=${userId}`,
        cancel_url: `${origin}/subscription/cancel`,
      },
    }),
  });

  if (!res.ok) throw new Error(`PayPal create order failed: ${await res.text()}`);
  const order = await res.json();
  // order.links contains approve
  const approve = order.links?.find((l: any) => l.rel === "approve")?.href as string | undefined;
  return { order, approveUrl: approve, orderId: order.id as string };
}

export async function capturePayPalOrder(orderId: string) {
  const base = getPayPalBaseUrl();
  const token = await getPayPalAccessToken();
  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`PayPal capture failed: ${await res.text()}`);
  return res.json();
}

export async function verifyPayPalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  // For production, call PayPal's /v1/notifications/verify-webhook-signature
  // Requires webhookId. If not configured, skip verification and allow (with log)
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("[paypal webhook] no PAYPAL_WEBHOOK_ID — skipping signature verification (allow for sandbox test)");
    return true;
  }
  try {
    const base = getPayPalBaseUrl();
    const token = await getPayPalAccessToken();
    const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_time: headers.get("paypal-transmission-time"),
        cert_id: headers.get("paypal-cert-id"),
        auth_algo: headers.get("paypal-auth-algo"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });
    const j = await res.json();
    return j.verification_status === "SUCCESS";
  } catch (e) {
    console.error("[paypal webhook verify]", e);
    return false;
  }
}
