import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.done !== undefined) data.done = body.done;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.projectId !== undefined) data.projectId = body.projectId || null;
  if (body.recurrence !== undefined) data.recurrence = body.recurrence;
  if (body.lastCompletedAt !== undefined)
    data.lastCompletedAt = body.lastCompletedAt ? new Date(body.lastCompletedAt) : null;

  const task = await prisma.task.update({ where: { id: params.id }, data });
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
