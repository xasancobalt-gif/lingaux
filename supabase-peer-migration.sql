-- Run this in Supabase -> SQL Editor (production database).
-- LINGAUX : Peer-to-peer practice (PeerQueue, PeerSession, PeerMessage).
-- Safe to re-run? NO - run exactly once, before deploying the peer APIs.

CREATE TABLE "PeerQueue" (
    "id"        TEXT    NOT NULL,
    "userId"    TEXT    NOT NULL,
    "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PeerQueue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PeerSession" (
    "id"        TEXT    NOT NULL,
    "userAId"   TEXT    NOT NULL,
    "userBId"   TEXT    NOT NULL,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt"   TIMESTAMP(3),
    CONSTRAINT "PeerSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PeerMessage" (
    "id"        TEXT    NOT NULL,
    "sessionId" TEXT    NOT NULL,
    "userId"    TEXT    NOT NULL,
    "text"      TEXT    NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PeerMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PeerQueue_userId_key" ON "PeerQueue"("userId");

CREATE INDEX "PeerSession_userAId_idx" ON "PeerSession"("userAId");
CREATE INDEX "PeerSession_userBId_idx" ON "PeerSession"("userBId");
CREATE INDEX "PeerSession_active_idx" ON "PeerSession"("active");
CREATE INDEX "PeerMessage_sessionId_idx" ON "PeerMessage"("sessionId");

ALTER TABLE "PeerQueue" ADD CONSTRAINT "PeerQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PeerSession" ADD CONSTRAINT "PeerSession_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PeerSession" ADD CONSTRAINT "PeerSession_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PeerMessage" ADD CONSTRAINT "PeerMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PeerSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PeerMessage" ADD CONSTRAINT "PeerMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
