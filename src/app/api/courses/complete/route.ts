export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ lessonId: z.string().min(5) });

// POST /api/courses/complete { lessonId } — mark a lesson done (idempotent).
// Free gating: lesson must be free (free course or order<=3) or user must be Pro.
export async function POST(req: NextRequest) {
  const session = await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const parsed = schema.safeParse(await req.json().catch(()=>({})));
  if(!parsed.success) return NextResponse.json({error:"Invalid"},{status:400});

  const user = await prisma.user.findUnique({ where:{ email: session.user.email.toLowerCase() }, select:{ id:true, plan:true } });
  if(!user) return NextResponse.json({error:"User not found"},{status:404});

  const lesson = await prisma.lesson.findUnique({ where:{ id: parsed.data.lessonId }, include:{ course:{ select:{ free:true } } } });
  if(!lesson) return NextResponse.json({error:"Lesson not found"},{status:404});

  const isFree = lesson.course.free || lesson.order <= 3;
  if(!isFree && user.plan !== "pro") return NextResponse.json({error:"Pro required", code:"PAYWALL"},{status:402});

  await prisma.lessonProgress.upsert({
    where:{ userId_lessonId:{ userId:user.id, lessonId:lesson.id } },
    update:{},
    create:{ userId:user.id, lessonId:lesson.id },
  });

  const total = await prisma.lessonProgress.count({ where:{ userId:user.id } });
  return NextResponse.json({ ok:true, completedLessons: total });
}
