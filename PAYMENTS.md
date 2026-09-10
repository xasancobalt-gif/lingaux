# VOXA Payments — Stripe + Razorpay + PayPal Wiring

Build `✓ 19 routes` — real checkout wired for all 3 gateways + UPI + Bank Transfer, fallback mock when keys missing (demo never breaks).

## Routes
- `POST /api/checkout/stripe {plan}` → Stripe Checkout Session (subscription or one-time) → `301` to `stripe.checkout.url` → success `/subscription/success?session_id=...` `src/app/api/checkout/stripe/route.ts:1`
- `POST /api/checkout/razorpay {plan}` → Razorpay Order (₹ paise) → return `orderId + keyId` → open `Razorpay Checkout` modal → on success `POST /api/checkout/razorpay/verify {orderId, paymentId, signature, plan}` → HMAC → upgrade `src/app/api/checkout/razorpay/route.ts:1`
- `POST /api/checkout/paypal {plan}` → PayPal Order (USD $19/$149/$399) → return `approveUrl` → redirect → PayPal approves → `GET /api/checkout/paypal/capture?token=ORDER_ID` → capture → upgrade → redirect `/subscription/success` `src/app/api/checkout/paypal/route.ts:1` + `src/lib/paypal.ts:1`
- `POST /api/webhooks/stripe` → verify `stripe-signature` `src/app/api/webhooks/stripe/route.ts:1`
- `POST /api/webhooks/razorpay` → verify `x-razorpay-signature` `src/app/api/webhooks/razorpay/route.ts:1`
- `POST /api/webhooks/paypal` → verify `paypal-transmission-sig` via `/v1/notifications/verify-webhook-signature` `src/app/api/webhooks/paypal/route.ts:1` → on `PAYMENT.CAPTURE.COMPLETED` create `Subscription` + `user.plan=pro`
- `POST /api/subscription` → mock fallback (bank transfer `pending_bank`, or when keys not set) `src/app/api/subscription/route.ts:1`

## Env — `.env.example`
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # stripe listen
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_WEBHOOK_SECRET=... # Razorpay Dashboard → Webhooks
```

## Test Locally (with real test keys)

### Stripe (global cards)
1. `stripe login` + `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → copy `whsec_...` to `.env`
2. Fill `sk_test`/`pk_test` in `.env`, `npm run dev`
3. Click Upgrade → Stripe → Choose Monthly → redirect to Stripe Checkout (test card `4242 4242 4242 4242` 12/34 123) → success → webhook upgrades DB → `/subscription/success`

Without keys: paywall shows “Stripe keys not set — mock pro unlock” → still upgrades via mock (so Stallone demo works).

### Razorpay (India UPI)
1. Fill `rzp_test` keys in `.env`, `npm run dev`
2. Click Upgrade → Razorpay → Choose Monthly → server creates Order → loads `https://checkout.razorpay.com/v1/checkout.js` → modal → pay with test UPI `success@razorpay` → `handler` calls `/api/checkout/razorpay/verify` (HMAC) → pro.
3. Webhook: In Razorpay Dashboard → Webhooks → add `https://your-domain/api/webhooks/razorpay` + secret → test `payment.captured`

Without keys: same mock fallback + toast.

### Bank Transfer
Paywall → Bank Transfer → creates `Subscription` with `status=pending_bank` → admin verifies in `prisma studio` and manually flips `user.plan=pro`. Shows `Bank transfer pending — verify in 12h`.

## Frontend — `src/app/page.tsx:124`
- `handleSubscribe` now real: stripe redirect vs razorpay modal vs paypal/bank mock. `loadRazorpayScript()` dynamically injects checkout.js.
- `isPro` derived from `session.user.plan` (DB) + `isProLocal` fallback. After payment, `window.location.reload()` refreshes session.
- Success page `src/app/subscription/success/page.tsx:1` auto-upgrades if webhook delayed (demo mode).

## Deploy Checklist
- Vercel → Env vars: all keys + `AUTH_SECRET` + `DATABASE_URL` (Supabase pooler) + `NEXT_PUBLIC_*`
- Stripe Dashboard → Webhooks → `https://voxa.app/api/webhooks/stripe`
- Razorpay Dashboard → Webhooks → `https://voxa.app/api/webhooks/razorpay`
- Supabase Storage → bucket `recordings` public

## Prisma
- `plan` field on `User` is `free | pro`. Webhooks set `pro`. Admin can downgrade via `prisma studio` or `POST /api/subscription` mock.
