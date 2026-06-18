import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const payments = await prisma.payment.findMany({
    orderBy: { date: "desc" },
    include: { project: true },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payment = await prisma.payment.create({
    data: {
      projectId: body.projectId || null,
      amount: Number(body.amount),
      status: body.status ?? "PAID",
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes || null,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
