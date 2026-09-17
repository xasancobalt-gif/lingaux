import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function sendResetEmail(email: string, url: string) {
  const { isEmailConfigured, sendEmail } = await import("@/lib/email");
  if (!isEmailConfigured()) return;
  try {
    await sendEmail({
      to: email,
      subject: "Reset your LINGAUX password",
      text: `Reset your LINGAUX password:\n\n${url}\n\nThis link is valid for 1 hour and works once. If you didn't ask for this, ignore it.`,
      html: `<div style="background:#0A0A0F;color:#fff;font-family:sans-serif;padding:32px;"><a href="${url}" style="display:inline-block;padding:14px 32px;background:#fff;color:#000;border-radius:999px;text-decoration:none;font-weight:bold;">Reset my password</a><p style="color:#666;font-size:12px;margin-top:24px;">Valid for 1 hour, single use. Ignore if not requested.</p></div>`,
    });
  } catch (e) {
    console.error("forgot: email send failed", e);
  }
}

// Timed + single-use + hashed at rest. The raw token only ever exists in the
// email link — never in our DB.
export async function POST(req: NextRequest) {
  try {
    const t0 = Date.now();
    let body: any = {};
    try { body = await req.json(); } catch {}

    const parsed = z
      .object({ email: z.string().email().max(254).optional() })
      .safeParse(body);
    const email = parsed.success && parsed.data.email
      ? parsed.data.email.trim().toLowerCase()
      : "";

    // No-existence-reveal: same response + same timing regardless of whether
    // an account exists. (P0 from the spec.)
    const dummy = () => new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
    await dummy();

    let user = null;
    if (email) {
      try {
        user = await prisma.user.findUnique({ where: { email } });
      } catch {}
    }

    if (user) {
      const raw = crypto.randomBytes(32).toString("base64url");
      const tokenHash = crypto
        .createHash("sha256")
        .update(raw + (process.env.AUTH_SECRET || "voxa-reset"))
        .digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

      // Rotate: any existing unused reset token for this user is invalidated,
      // so a stolen older link can't apply twice.
      try {
        await prisma.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        });
      } catch {}

      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const base = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://lingaux.vercel.app";
      const cb = encodeURIComponent(`/reset-password?token=${raw}`);
      await sendResetEmail(email, `${base}${cb}`);
    }

    // Always 200 (uniform timing above). Never reveal whether the email exists.
    const wait = Math.max(0, 1300 - (Date.now() - t0));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("forgot:", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
