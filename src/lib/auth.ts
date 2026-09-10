import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import LinkedIn from "next-auth/providers/linkedin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  token: z.string().optional(), // 2FA code (optional)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    // OAuth — only enabled if env vars present, to avoid crash in dev without keys
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })] : []),
    ...(process.env.APPLE_CLIENT_ID ? [Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    })] : []),
    ...(process.env.LINKEDIN_CLIENT_ID ? [LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })] : []),

    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA Code", type: "text" },
      },
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds);
        if (!parsed.success) return null;
        const { email, password, token } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        // 2FA optional: if enabled, require valid token
        if ((user as any).twoFactorEnabled) {
          if (!token) throw new Error("2FA_REQUIRED");
          const { verifyToken } = await import("@/lib/2fa");
          const secret = (user as any).twoFactorSecret as string | null;
          if (!secret || !verifyToken(secret, token)) throw new Error("INVALID_2FA");
        }
        return { id: user.id, email: user.email!, name: user.name, image: user.image };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      // Auto-promote admin emails on any sign-in (OAuth or credentials)
      const email = (user.email || "").toLowerCase();
      if (email && isAdmin(email)) {
        try { await prisma.user.update({ where: { email }, data: { role: "admin", plan: "pro" } }); } catch {}
      }
    },
    async createUser({ user }) {
      const email = (user.email || "").toLowerCase();
      if (email && isAdmin(email)) {
        try { await prisma.user.update({ where: { id: user.id }, data: { role: "admin", plan: "pro" } }); } catch {}
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
          if (dbUser) {
            (token as any).plan = dbUser.plan;
            (token as any).xp = dbUser.xp;
            (token as any).level = dbUser.level;
            (token as any).role = dbUser.role;
            // Ensure admin email always has role admin + pro
            if (dbUser.email && isAdmin(dbUser.email) && dbUser.role !== "admin") {
              await prisma.user.update({ where: { id: dbUser.id }, data: { role: "admin", plan: "pro" } }).catch(()=>{});
              (token as any).role = "admin";
              (token as any).plan = "pro";
            }
          }
        } catch {}
      } else if (token.email && token.id) {
        // Refresh role on existing session
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (dbUser) {
            (token as any).role = dbUser.role;
            (token as any).plan = dbUser.plan;
          }
        } catch {}
      }
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).plan = (token as any).plan || "free";
        (session.user as any).xp = (token as any).xp || 0;
        (session.user as any).level = (token as any).level || 1;
        (session.user as any).role = (token as any).role || "user";
        (session.user as any).isAdmin = (token as any).role === "admin" || isAdmin(token.email as string);
      }
      return session;
    },
  },
  pages: {
    signIn: "/?auth=signin",
    error: "/?auth=error",
  },
});
