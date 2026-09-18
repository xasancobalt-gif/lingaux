-- Run this in Supabase → SQL Editor (production database).
-- LINGAUX : email-OTP sign-in (matches prisma/schema.prisma EmailOtp model)
-- Safe to re-run? NO — run exactly once, before deploying the OTP routes.

CREATE TABLE "EmailOtp" (
    "id"        TEXT      NOT NULL,
    "email"     TEXT      NOT NULL,
    "codeHash"  TEXT      NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts"  INTEGER   NOT NULL DEFAULT 0,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailOtp_email_idx" ON "EmailOtp"("email");

CREATE INDEX "EmailOtp_expiresAt_idx" ON "EmailOtp"("expiresAt");
