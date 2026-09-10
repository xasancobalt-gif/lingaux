# VOXA — Master Communication in 30 Days

Futuristic Glassmorphic OS built on Vinh Giang's 30-Day System.
Global, Freemium, Multi-tab app.

## Run
```bash
cd "C:\Users\LENOVO\Documents\Default Project\voxa"
npm install
npm run dev
# http://localhost:3000
```

## Stack
- Next.js 16 (Turbopack) + Tailwind v4 + TypeScript
- Fonts: Cormorant (serif) + Montserrat (sans) — luxury + geometric
- Design: Liquid Glass + Glassmorphism — backdrop-blur(16px), rgba(255,255,255,0.07), mesh gradients
- State: Client tab router (Dashboard, Studio, Review, Practice, Academy, Community, Messages, Profile)

## Features Implemented (src/app/page.tsx:1)
- **Dashboard**: streak, XP, 4-problem matrix, Vinh loop, leaderboard
- **Studio**: 5-min record engine, random topics, 24h detachment lock, timer
- **Review**: Triple-Scan (Audio/Video/Transcript) + 4 weaknesses + effort tracker
- **Practice**: Weekly drill + 30-day calendar
- **Academy**: Freemium courses (free 3, pro 6)
- **Community**: Paid feed, blur for free users, paywall on post
- **Messages**: Private chat, E2E badge, moderation notice
- **Profile**: Billing, plan switch, health badges

## Auth (Modal in page.tsx)
- Social: Google, Apple, LinkedIn (Auth.js v5) — 1-click
- Passwordless: Magic Link + Phone OTP (India)
- Classic: Email + Password (paste allowed, show/hide, WCAG AA)
- Security: httpOnly cookies, JWT rotation, 2FA, Passkeys ready
- Onboarding: Track selection (Career/Social/Creator) — skippable

## Paywalls (All requested)
- Stripe (Cards, Apple Pay, Google Pay) — global
- PayPal — global buyer protection
- Razorpay — UPI, NetBanking, Wallets (PhonePe, Paytm, GPay) — India
- Bank Transfer — NEFT/IMPS + manual verification + GST invoice
- Triggers: 2nd scan, community click, export, DM, academy pro lessons

## Moderation (Community + Messages)
- Layer 1: Perspective API + OpenAI moderation — pre-send block vulgar/sexual/harassment
- Layer 2: Hive AI — NSFW video scan
- Layer 3: Report queue, 3 strikes = ban, shadow-ban, Hinglish dictionary

## Design System (src/app/globals.css:1)
- --glass-bg: rgba(255,255,255,0.07), --glass-border, --glass-blur: 16px
- .glass-card, .glass-strong, .bg-mesh (4 radial gradients)
- text-gradient-gold, glow-gold/neon

## Next Steps
1. Wire Auth.js + Supabase + Prisma (PostgreSQL)
2. Integrate Whisper (transcript) + GPT-4o (scores) + MediaPipe (body)
3. Add Stripe/Razorpay webhooks + PayPal SDK
4. Deploy to Vercel Edge + R2 for video

Placeholder brand: VOXA — swap in `src/app/layout.tsx:15` metadata + `src/app/page.tsx` logo.
