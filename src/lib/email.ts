import nodemailer from "nodemailer";

// ============================================================================
// Shared email transport — Gmail SMTP via nodemailer (App Password).
// Replace the old Resend path. Env:
//   GMAIL_USER  — the Gmail address that sends (e.g. ghalmenandkumar@gmail.com)
//   GMAIL_PASS  — a 16-char Google App Password (myaccount.google.com → App
//                 Passwords; requires 2-Step Verification on the account)
// Deprecated env that is no longer read: RESEND_API_KEY, EMAIL_FROM.
// ============================================================================

export function isEmailConfigured(): boolean {
  const user = (process.env.GMAIL_USER || "").trim();
  const pass = (process.env.GMAIL_PASS || "").trim();
  return user.includes("@") && pass.length >= 8 && !pass.includes("...");
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: (process.env.GMAIL_USER || "").trim(),
      pass: (process.env.GMAIL_PASS || "").trim(),
    },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (!isEmailConfigured()) return;
  const from = `LINGAUX <${(process.env.GMAIL_USER || "").trim()}>`;
  try {
    const transporter = makeTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      // Deliverability: one-click unsubscribe signal (RFC 8058) + list headers
      // reduce Gmail's spam scoring for transactional auth mails.
      headers: {
        "List-Unsubscribe": "<mailto:lingauxofficial@gmail.com?subject=unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
  } catch (err) {
    console.error("sendEmail (Gmail SMTP) error:", err);
    throw new Error("Failed to send email");
  }
}