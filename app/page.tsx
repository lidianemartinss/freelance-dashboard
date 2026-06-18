import Link from "next/link";
import type { Payment } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [goal, payments, projects, tasks] = await Promise.all([
    prisma.goal.findFirst(),
    prisma.payment.findMany({ orderBy: { date: "desc" } }),
    prisma.project.findMany({
      where: { status: { in: ["ACTIVE", "LEAD"] } },
      orderBy: { deadline: "asc" },
    }),
    prisma.task.findMany({
      where: { done: false },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { project: true },
    }),
  ]);

  const paidTotal = payments
    .filter((p: Payment) => p.status === "PAID")
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const now = new Date();
  const monthTotal = payments
    .filter(
      (p: Payment) =>
        p.status === "PAID" &&
        new Date(p.date).getMonth() === now.getMonth() &&
        new Date(p.date).getFullYear() === now.getFullYear()
    )
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const pendingTotal = payments
    .filter((p: Payment) => p.status !== "PAID")
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const goalPercent = goal && goal.targetAmount > 0 ? (paidTotal / goal.targetAmount) * 100 : 0;
  const remaining = goal ? Math.max(goal.targetAmount - paidTotal, 0) : null;
  const daysLeft = goal?.targetDate ? daysUntil(goal.targetDate) : null;

  return (
    <div className="space-y-6">
      <section className="card">
        {goal ? (
          <>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm text-gray-400">Savings goal</p>
                <h2 className="text-xl font-semibold">{goal.name}</h2>
              </div>
              <Link href="/goal" className="btn-ghost text-sm">
                Edit goal
              </Link>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold">
                {formatCurrency(paidTotal, goal.currency)}{" "}
                <span className="text-base text-gray-400 font-normal">
                  of {formatCurrency(goal.targetAmount, goal.currency)}
                </span>
              </p>
              <p className="text-sm text-gray-500">{goalPercent.toFixed(0)}% there</p>
            </div>
            <div className="mt-3">
              <ProgressBar percent={goalPercent} />
            </div>
            <div className="mt-3 flex gap-6 text-sm text-gray-500 flex-wrap">
              <span>{formatCurrency(remaining ?? 0, goal.currency)} remaining</span>
              {goal.targetDate && (
                <span>
                  Target: {formatDate(goal.targetDate)}
                  {daysLeft !== null && daysLeft >= 0 ? ` (${daysLeft} days left)` : ""}
                </span>
              )}
              {pendingTotal > 0 && (
                <span>{formatCurrency(pendingTotal, goal.currency)} invoiced/pending</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-gray-500">No savings goal set yet.</p>
            <Link href="/goal" className="btn">
              Set your goal
            </Link>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400">This month</p>
          <p className="text-2xl font-semibold mt-1">
            {formatCurrency(monthTotal, goal?.currency)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400">Active projects</p>
          <p className="text-2xl font-semibold mt-1">{projects.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400">Open tasks</p>
          <p className="text-2xl font-semibold mt-1">{tasks.length}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Active projects</h3>
            <Link href="/projects" className="btn-ghost text-sm">
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400">No active projects. Add one to get started.</p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 6).map((p) => {
                const dl = p.deadline ? daysUntil(p.deadline) : null;
                return (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-gray-400">{p.client}</p>
                    </div>
                    <div className="text-right">
                      {p.budget ? <p>{formatCurrency(p.budget, goal?.currency)}</p> : null}
                      {p.deadline && (
                        <p className={dl !== null && dl < 7 ? "text-danger" : "text-gray-400"}>
                          due {formatDate(p.deadline)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Upcoming tasks</h3>
            <Link href="/tasks" className="btn-ghost text-sm">
              View all
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing on your plate. Nice.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    {t.project && <p className="text-gray-400">{t.project.name}</p>}
                  </div>
                  <div className="text-right text-gray-400">
                    {t.dueDate ? formatDate(t.dueDate) : t.priority}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
