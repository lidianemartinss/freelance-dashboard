"use client";

import { useEffect, useState } from "react";
import { formatDate, classNames } from "@/lib/utils";

type Project = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  done: boolean;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  projectId: string | null;
  project: Project | null;
};

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hideDone, setHideDone] = useState(true);
  const [form, setForm] = useState({ title: "", projectId: "", dueDate: "", priority: "MEDIUM" });

  async function load() {
    setLoading(true);
    const [tRes, pRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/projects")]);
    setTasks(await tRes.json());
    setProjects(await pRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", projectId: "", dueDate: "", priority: "MEDIUM" });
    setShowForm(false);
    load();
  }

  async function toggleDone(t: Task) {
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !t.done }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    load();
  }

  const visible = hideDone ? tasks.filter((t) => !t.done) : tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
            />
            Hide completed
          </label>
          <button className="btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ New task"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addTask} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="input sm:col-span-2"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            className="input"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">No linked project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input
            className="input sm:col-span-2"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="btn">
              Add task
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-400">Nothing here.</p>
      ) : (
        <div className="card divide-y divide-gray-100">
          {visible.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={t.done} onChange={() => toggleDone(t)} />
                <div>
                  <p className={classNames("font-medium", t.done && "line-through text-gray-400")}>
                    {t.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t.project ? t.project.name : "No project"}
                    {t.dueDate ? ` · due ${formatDate(t.dueDate)}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={classNames(
                    "text-xs font-medium rounded-full px-2 py-1",
                    PRIORITY_STYLES[t.priority]
                  )}
                >
                  {t.priority}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-xs text-gray-400 hover:text-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
