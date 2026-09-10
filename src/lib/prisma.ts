import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  // Lazy — only called at request time, not at build import time
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

// Proxy so `import { prisma } from "@/lib/prisma"` still works but doesn't instantiate at build
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getPrisma() as any;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;

export default prisma;
