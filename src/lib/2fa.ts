import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export function generateSecret(email: string) {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: "LINGAUX",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  return { secret: secret.base32, uri: totp.toString() };
}

export function verifyToken(secretBase32: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: "LINGAUX",
      label: "LINGAUX",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });
    const delta = totp.validate({ token, window: 1 }); // allow ±30s
    return delta !== null;
  } catch {
    return false;
  }
}

export async function generateQRDataURL(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 260, margin: 1, color: { dark: "#000000", light: "#FFFFFF" } });
}
