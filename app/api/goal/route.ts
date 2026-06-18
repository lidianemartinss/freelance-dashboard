import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Single-row goal: fetch the first one, or null
export async function GET() {
  const goal = await prisma.goal.findFirst();
  return NextResponse.json(goal);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await prisma.goal.findFirst();

  const data = {
    name: body.name ?? "Master's in Italy",
    targetAmount: Number(body.targetAmount),
    targetDate: body.targetDate ? new Date(body.targetDate) : null,
    currency: body.currency ?? "EUR",
    notes: body.notes || null,
  };

  const goal = existing
    ? await prisma.goal.update({ where: { id: existing.id }, data })
    : await prisma.goal.create({ data });

  return NextResponse.json(goal);
}
