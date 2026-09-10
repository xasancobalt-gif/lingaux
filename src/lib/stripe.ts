import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Prices in smallest unit (cents for USD, paise for INR if you use INR)
// For global we use USD; for IN use INR via Razorpay. So Stripe is USD.
export const STRIPE_PLANS = {
  monthly: { amount: 1900, currency: "usd", name: "LINGAUX Pro Monthly", interval: "month" as const }, // $19.00
  annual: { amount: 14900, currency: "usd", name: "LINGAUX Pro Annual", interval: "year" as const }, // $149.00
  lifetime: { amount: 39900, currency: "usd", name: "LINGAUX Lifetime", interval: null }, // one-time
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;

export function getStripePlan(plan: string) {
  return STRIPE_PLANS[plan as StripePlan] || STRIPE_PLANS.monthly;
}

export function isStripeConfigured() {
  return !!stripe && !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
