import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })
  : null;

// Prices in paise (₹199 = 19900)
export const RAZORPAY_PLANS = {
  monthly: { amount: 19900, currency: "INR", name: "LINGAUX Pro Monthly" },
  annual: { amount: 149000, currency: "INR", name: "LINGAUX Pro Annual" }, // ₹1490
  lifetime: { amount: 399900, currency: "INR", name: "LINGAUX Lifetime" },
} as const;

export type RazorpayPlan = keyof typeof RAZORPAY_PLANS;

export function getRazorpayPlan(plan: string) {
  return RAZORPAY_PLANS[plan as RazorpayPlan] || RAZORPAY_PLANS.monthly;
}

export function isRazorpayConfigured() {
  return !!razorpay && !!process.env.RAZORPAY_KEY_ID;
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const body = orderId + "|" + paymentId;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}
