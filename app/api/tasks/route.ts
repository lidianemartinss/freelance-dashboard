import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ done: "asc" }, { dueDate: "asc" }],
    include: { project: true },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      projectId: body.projectId || null,
      title: body.title,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      priority: body.priority ?? "MEDIUM",
      recurrence: body.recurrence ?? "NONE",
    },
  });
  return