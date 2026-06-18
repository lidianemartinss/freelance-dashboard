import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.status !== undefined) data.status = body.status;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.projectId !== undefined) data.projectId = body.projectId || null;

  const payment = await prisma.payment.update({ where: { id: params.id }, data });
  return NextResponse.json(payment);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.payment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
