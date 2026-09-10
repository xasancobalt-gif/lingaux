export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
// GET /api/tickets — user sees own, admin sees all
export async function GET() {
  const session = await auth().catch(()=>null);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = session.user.email.toLowerCase();
  const isAdmin = ["ghalmenandkumar@gmail.com","xasancobalt@gmail.com"].includes(email);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (isAdmin || user.role==="admin") {
    const tickets = await prisma.ticket.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { email: true, name: true } } } });
    return NextResponse.json({ tickets, isAdmin: true });
  }
  const tickets = await prisma.ticket.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ tickets, isAdmin: false });
}

// POST /api/tickets — create manually
export async function POST(req: NextRequest) {
  const session = await auth().catch(()=>null);
  const body = await req.json();
  const email = session?.user?.email || body.email;
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const ticket = await prisma.ticket.create({
    data: {
      userId: session?.user ? (await prisma.user.findUnique({ where: { email: email.toLowerCase() } }))?.id || null : null,
      email,
      subject: (body.subject as string)?.slice(0,120) || "Support",
      message: body.message as string,
      via: body.via || "chatbot",
    },
  });
  return NextResponse.json({ ticket }, { status: 201 });
}

// PATCH /api/tickets — admin reply/close
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const { ticketId, status } = body as { ticketId: string; status: string };
  if (!ticketId || !status) return NextResponse.json({ error: "ticketId + status required" }, { status: 400 });
  const ticket = await prisma.ticket.update({ where: { id: ticketId }, data: { status } });
  return NextResponse.json({ ticket });
}
