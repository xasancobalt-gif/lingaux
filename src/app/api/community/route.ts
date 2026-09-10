export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
// Simple profanity + harassment filter (expand with Perspective API)
const BLOCKED = [
  "fuck","shit","bitch","asshole","slut","whore","nude","porn","sex","harass","kill","die",
  // Hinglish
  "chut","bhenchod","madarchod","gaand","lund","randi"
];
function isFlagged(text: string): { flagged: boolean; reason?: string }{
  const low = text.toLowerCase();
  for (const w of BLOCKED) if (low.includes(w)) return { flagged: true, reason: `Contains blocked word: ${w}` };
  return { flagged: false };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "20"));
  // Hide isHidden posts for non-admins; pin/featured first
  const session = await auth().catch(()=>null);
  const email = session?.user?.email?.toLowerCase();
  let isAdminUser = false;
  if(email){
    try{
      const u = await prisma.user.findUnique({ where:{ email }});
      isAdminUser = u?.role==="admin" || ["ghalmenandkumar@gmail.com","xasancobalt@gmail.com"].includes(email);
    }catch{}
  }
  const where = isAdminUser ? {} : { isHidden: false };
  const posts = await prisma.communityPost.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { user: { select: { id: true, name: true, image: true } }, comments: true },
  });
  return NextResponse.json({ posts });
}

const postSchema = z.object({
  content: z.string().min(3).max(2000),
  videoUrl: z.string().url().optional().or(z.literal("")),
  day: z.number().int().min(1).max(30).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized — sign in to post" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.plan === "free") return NextResponse.json({ error: "Pro required to post. Upgrade to join community.", code: "PAYWALL" }, { status: 403 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid", issues: parsed.error.issues }, { status: 400 });

  const { content, videoUrl, day } = parsed.data;

  const check = isFlagged(content);
  if (check.flagged) return NextResponse.json({ error: `Blocked: ${check.reason}. Be kind and constructive.`, code: "MODERATED" }, { status: 422 });

  // NSFW video check placeholder — in prod call Hive AI
  // if (videoUrl) { const nsfw = await hiveCheck(videoUrl); ... }

  const post = await prisma.communityPost.create({
    data: {
      userId: user.id,
      content,
      videoUrl: videoUrl || null,
      day: day || null,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  // XP for posting
  await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: 20 } } });

  return NextResponse.json({ post }, { status: 201 });
}
