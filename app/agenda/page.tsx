"use client";

import { useEffect, useMemo, useState } from "react";
import {
  classNames,
  isDoneForPeriod,
  startOfWeek,
  addDays,
  isSameDay,
  weekdayPT,
  formatDayMonth,
} from "@/lib/utils";

type Project = { id: string; name: string };
type Recurrence = "NONE" | "DAILY" | "WEEKLY";
type Task = {
  id: string;
  title: string;
  done: boolean;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  recurrence: Recurrence;
  lastCompletedAt: string | null;
  projectId: string | null;
  project: Project | null;
};

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export default function AgendaPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dia" | "semana">("dia");
  const [weekOffset, setWeekOffset] = useState(0);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleDone(t: Task) {
    const currentlyDone = isDoneForPeriod(t.recurrence, t.done, t.lastCompletedAt);
    if (t.recurrence === "NONE") {
      await fetch(`/api/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !currentlyDone }),
      });
    } else {
      await fetch(`/api/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastCompletedAt: currentlyDone ? null : new Date().toISOString() }),
      });
    }
    load();
  }

  const today = useMemo(() => new Date(), []);

  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.recurrence === "DAILY" || (t.dueDate && isSameDay(t.dueDate, today)))
      .sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      });
  }, [tasks, today]);

  const weeklyTasks = useMemo(() => tasks.filter((t) => t.recurrence === "WEEKLY"), [tasks]);

  const weekStart = useMemo(() => addDays(startOfWeek(today), weekOffset * 7), [today, weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  function tasksForDay(day: Date) {
    return tasks
      .filter((t) => t.recurrence === "DAILY" || (t.dueDate && isSameDay(t.dueDate, day)))
      .sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      });
  }

  /**
   * `editable` controls whether the checkbox reflects real, toggleable state.
   * The schema only stores ONE `lastCompletedAt` per recurring task — there's
   * no per-day history. So a DAILY task can only be meaningfully checked on
   * the column that represents *today*. On any other day (past or future)
   * we show it as a plain reminder, not a checkbox tied to "today's" status —
   * otherwise checking it today would visually show as "done" on every day.
   */
  function TaskRow({ t, editable }: { t: Task; editable: boolean }) {
    const done = editable && isDoneForPeriod(t.recurrence, t.done, t.lastCompletedAt);
    return (
      <div className="flex items-center justify-between gap-2 text-sm py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {editable ? (
            <input type="checkbox" checked={done} onChange={() => toggleDone(t)} />
          ) : (
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-300 shrink-0"
              title="Recorrente — marque na coluna de hoje"
            />
          )}
          <div className="min-w-0">
            <p className={classNames("font-medium truncate", done && "line-through text-gray-400")}>
              {t.title}
            </p>
            {t.project && <p className="text-xs text-gray-400 truncate">{t.project.name}</p>}
          </div>
        </div>
        <span
          className={classNames(
            "text-xs font-medium rounded-full px-2 py-0.5 shrink-0",
            PRIORITY_STYLES[t.priority]
          )}
        >
          {t.priority}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Agenda</h2>
        <div className="flex gap-1">
          <button
            className={classNames(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition",
              view === "dia" ? "bg-accent text-white" : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setView("dia")}
          >
            Hoje
          </button>
          <button
            className={classNames(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition",
              view === "semana" ? "bg-accent text-white" : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => setView("semana")}
          >
            Semana
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : view === "dia" ? (
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm text-gray-400 mb-3">
              {weekdayPT(today)}, {formatDayMonth(today)} — tarefas diárias + vencimentos de hoje
            </p>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-gray-400">Nada para hoje. Aproveite o tempo livre.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {todayTasks.map((t) => (
                  <TaskRow key={t.id} t={t} editable />
                ))}
              </div>
            )}
          </div>

          {weeklyTasks.length > 0 && (
            <div className="card">
              <p className="text-sm text-gray-400 mb-3">Tarefas semanais (concluir uma vez nesta semana)</p>
              <div className="divide-y divide-gray-100">
                {weeklyTasks.map((t) => (
                  <TaskRow key={t.id} t={t} editable />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button className="btn-ghost text-sm" onClick={() => setWeekOffset((w) => w - 1)}>
              ← Semana anterior
            </button>
            <p className="text-sm text-gray-500">
              {formatDayMonth(weekDays[0])} – {formatDayMonth(weekDays[6])}
              {weekOffset !== 0 && (
                <button className="ml-2 text-accent" onClick={() => setWeekOffset(0)}>
                  (voltar para hoje)
                </button>
              )}
            </p>
            <button className="btn-ghost text-sm" onClick={() => setWeekOffset((w) => w + 1)}>
              Próxima semana →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayTasks = tasksForDay(day);
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={classNames("card", isToday && "ring-2 ring-accent")}
                >
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {weekdayPT(day, true).toUpperCase()} · {formatDayMonth(day)}
                    {isToday && <span className="ml-1 text-accent">(hoje)</span>}
                  </p>
                  {dayTasks.length === 0 ? (
                    <p className="text-xs text-gray-400">—</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {dayTasks.map((t) => (
                        <TaskRow key={t.id} t={t} editable={isToday || t.recurrence === "NONE"} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {weeklyTasks.length > 0 && (
            <div className="card">
              <p className="text-sm text-gray-400 mb-3">Tarefas semanais (sem dia fixo — concluir uma vez nesta semana)</p>
              <div className="divide-y divide-gray-100">
                {weeklyTasks.map((t) => (
                  <TaskRow key={t.id} t={t} editable />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
