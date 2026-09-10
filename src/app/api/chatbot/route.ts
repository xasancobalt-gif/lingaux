export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// POST /api/chatbot { message } — AI answers, if can't → create ticket + mail to admin (admin emails hidden from user)
const KNOWLEDGE = `
LINGAUX — Speak • Learn • Progress — 30 Day Communication OS.
Steps: 1) Record 5-min impromptu, 2) Wait 24h, 3) Triple-Scan (audio/muted video/transcript) finds 4 weaknesses, 4) Fix 1 weakness/week with drills.
Freemium: Free 3 recordings/week + 1 Triple-Scan + 3 academy lessons. Pro (₹199/mo, $19) unlocks unlimited, community posting, private chat, certificates.
Paywalls: Stripe (global), Razorpay UPI (India), PayPal, Bank Transfer.
Refer & Earn: 1 signup = 80 coins = 80rs, platform wallet only, usable for subs/products. Coins 1:1 rs.
Community: Paid, moderated (vulgar/sexual/harassment blocked). Private 1:1 chat Pro only.
Studio: Needs camera/mic permission, 720p. 24h lock is by design (detachment).
2FA: Optional TOTP for extra security.
If user asks about refund, say 7-day refund via support. If user asks human, raise ticket.
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  const message = (body.message as string)?.trim();
  if (!message || message.length < 2) return NextResponse.json({ error: "message required" }, { status: 400 });

  const session = await auth().catch(()=>null);
  const email = session?.user?.email || body.email || "guest@lingaux.app";

  // Try OpenAI if key
  let answer: string | null = null;
  let usedAI = false;
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: `You are LINGAUX helper bot. Knowledge: ${KNOWLEDGE}\nAnswer in 2-3 sentences, friendly, 3D glassmorphic vibe. If you truly can't answer or user asks human, say "I’ll raise a ticket to our support team." Never mention admin emails.` },
          { role: "user", content: message },
        ],
      });
      answer = completion.choices[0].message.content || null;
      usedAI = true;
    } catch (e) { console.warn("[chatbot openai]", e); }
  }

  // Fallback mock logic
  if (!answer) {
    const low = message.toLowerCase();
    if (low.includes("price") || low.includes("cost") || low.includes("pro")) answer = "Pro is ₹199/mo (India) or $19/mo global — unlimited Triple-Scan + paid community + private chat. Free gives 3 recordings/week + 1 scan. Use 80 coins per referral (1 coin=1rs) to pay!";
    else if (low.includes("refer") || low.includes("coin") || low.includes("earn")) answer = "Refer & Earn: share your link `/?ref=LINGAUX-XXX`. When friend signs up, you get 80 coins = 80rs instantly. Coins work only on LINGAUX for subs & products. Check Wallet in Dashboard.";
    else if (low.includes("camera") || low.includes("record")) answer = "Studio needs camera/mic permission. Allow in Chrome → lock icon → Allow. Record 5-min impromptu, wait 24h (detachment lock), then Triple-Scan finds your 4 leaks.";
    else if (low.includes("refund")) answer = "7-day refund via support — Stripe/Razorpay/PayPal auto, bank manual in 12h.";
    else if (low.includes("admin") || low.includes("human") || low.includes("ticket")) answer = null; // force ticket
    else if (low.includes("leaderboard") || low.includes("rank")) answer = "Leaderboard ranks by XP (record + review + posts). See Dashboard → Global Leaderboard or /leaderboard for full table. Weekly Boss Battle every Monday.";
    else if (low.includes("guide") || low.includes("how to start") || low.includes("challenge")) answer = "Start: Dashboard → Studio → pick random topic → Record 5 mins → wait 24h → Review → Fix 1 weakness/week in Practice → repeat 30 days. See /guide for step-by-step.";
    else answer = "I can help with LINGAUX: pricing, referral coins, recording, 24h lock, community. Ask me anything, or say 'human' to raise a ticket to our support team.";
  }

  const forceTicket = /human|ticket|talk to.*person/i.test(message);

  if (forceTicket || (!answer && !usedAI)) {
    const ticket = await prisma.ticket.create({
      data: {
        userId: session?.user ? (await prisma.user.findUnique({ where: { email: email.toLowerCase() } }))?.id || null : null,
        email,
        subject: message.slice(0, 80),
        message,
        status: "open",
        via: "chatbot",
      },
    });

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: ["ghalmenandkumar@gmail.com", "xasancobalt@gmail.com"].join(","),
          subject: `[LINGAUX Ticket #${ticket.id.slice(0,8)}] ${ticket.subject}`,
          text: `From: ${email}\nMessage: ${message}\nTicket ID: ${ticket.id}\n\nView in /admin`,
        });
      } else {
        console.log(`[ticket] Would mail support: ${ticket.id} — ${message} — from ${email}`);
      }
    } catch (e) { console.warn("[ticket mail]", e); }

    return NextResponse.json({
      answer: "I couldn’t solve this — I’ve raised a ticket to our support team. We’ll get back within 12h. Ticket ID: " + ticket.id.slice(0,8),
      ticketId: ticket.id,
      raised: true,
    });
  }

  return NextResponse.json({ answer, raised: false });
}
