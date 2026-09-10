export const ADMIN_EMAILS = [
  "ghalmenandkumar@gmail.com",
  "xasancobalt@gmail.com",
].map(e => e.toLowerCase());

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Also check env ADMIN_EMAILS comma-separated for future flexibility
export function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS?.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) || [];
  return Array.from(new Set([...ADMIN_EMAILS, ...env]));
}

export function isAdmin(email?: string | null) {
  return isAdminEmail(email);
}
