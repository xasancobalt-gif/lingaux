import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/admin/posts — all posts including hidden, with pin/featured
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const posts = await prisma.communityPost.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
  return NextResponse.json({ posts });
}

const patchSchema = z.object({
  postId: z.string(),
  content: z.string().min(1).max(5000).optional(),
  isPinned: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  likes: z.number().int().optional(),
});

// PATCH /api/admin/posts — edit / pin / feature / hide / likes
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid", issues: parsed.error.issues }, { status: 400 });
  const { postId, ...data } = parsed.data;
  const post = await prisma.communityPost.update({ where: { id: postId }, data });
  return NextResponse.json({ post });
}

// DELETE /api/admin/posts?postId=xxx
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const postId = new URL(req.url).searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });
  await prisma.communityPost.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true });
}

// POST /api/admin/posts — admin can create post as system
export async function POST(req: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const content = body.content as string;
  if (!content || content.length < 3) return NextResponse.json({ error: "content required" }, { status: 400 });
  const post = await prisma.communityPost.create({
    data: {
      userId: user!.id,
      content,
      videoUrl: body.videoUrl || null,
      isPinned: !!body.isPinned,
      isFeatured: !!body.isFeatured,
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
