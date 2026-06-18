import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
    include: { payments: true, tasks: true },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      client: body.client,
      status: body.status ?? "ACTIVE",
      budget: body.budget ? Number(body.budget) : null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(project, { status: 201 });
}
