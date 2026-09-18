import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email().max(254) });

function codeHashFor(code: string): string {
  return crypto.createHash("sha256").update(code + (process.env.AUTH_SECRET || "voxa-reset")).digest("hex");
}

// POST /api/auth/otp/request { email } — send a 6-digit Gmail OTP.
// Always 200 (never reveals whether the email is registered).
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const parsed = schema.safeParse(body);
    const email = parsed.success ? parsed.data.email.trim().toLowerCase() : "";

    if (!email) return NextResponse.json({ ok: true });

    const ip = clientIp(req);
    if (!rateLimit(`otp:req:ip:${ip}`, 20, 60 * 60 * 1000) || !rateLimit(`otp:req:email:${email}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ ok: false, error: "Too many requests — try again later." }, { status: 429 });
    }

    const now = new Date();
    // Cooldown: if a live code was created <60s ago, don't resend (still ok).
    const recent = await prisma.emailOtp.findFirst({
      where: { email, usedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
    }).catch(() => null);
    if (recent && now.getTime() - recent.createdAt.getTime() < 60 * 1000) {
      return NextResponse.json({ ok: true });
    }

    // Rotate prior unused codes for this email.
    await prisma.emailOtp.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: now },
    }).catch(() => {});

    const code = String(crypto.randomInt(100000, 1000000));
    await prisma.emailOtp.create({
      data: { email, codeHash: codeHashFor(code), expiresAt: new Date(now.getTime() + 10 * 60 * 1000) },
    });

    const { isEmailConfigured, sendEmail } = await import("@/lib/email");
    if (isEmailConfigured()) {
      try {
        await sendEmail({
          to: email,
          subject: `Your LINGAUX code: ${code}`,
          text: `Your LINGAUX sign-in code:\n\n${code}\n\nValid for 10 minutes. If you didn't ask for this, ignore it.`,
          html: `<div style="background:#0A0A0F;color:#fff;font-family:sans-serif;padding:32px;text-align:center;"><h1 style="font-size:20px;">Your LINGAUX code</h1><div style="font-size:36px;font-weight:800;letter-spacing:8px;margin:20px 0;">${code}</div><p style="color:#666;font-size:12px;">Valid for 10 minutes. Ignore if not requested.</p></div>`,
        });
      } catch (e) {
        console.error("otp: email send failed", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("otp/request:", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
