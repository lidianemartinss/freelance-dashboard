"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, classNames } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  client: string;
  status: "LEAD" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  budget: number | null;
  deadline: string | null;
  notes: string | null;
};

const STATUS_OPTIONS: Project["status"][] = ["LEAD", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];

const STATUS_STYLES: Record<Project["status"], string> = {
  LEAD: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", client: "", budget: "", deadline: "", notes: "" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/projects");
    setProjects(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.client) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", client: "", budget: "", deadline: "", notes: "" });
    setShowForm(false);
    load();
  }

  async function updateStatus(id: string, status: Project["status"]) {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this project? This won't delete its payments, just unlinks them.")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addProject} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Client (ou fonte de renda, ex: Shopee)"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Budget (EUR)"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
          <input
            className="input"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <textarea
            className="input sm:col-span-2"
            placeholder="Notes (scope, rate, etc.)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="btn">
              Add project
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-400">{p.client}</p>
                </div>
                <select
                  value={p.status}
                  onChange={(e) => updateStatus(p.id, e.target.value as Project["status"])}
                  className={classNames(
                    "text-xs font-medium rounded-full px-2 py-1 border-none",
                    STATUS_STYLES[p.status]
                  )}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex gap-4 text-sm text-gray-500">
                {p.budget != null && <span>{formatCurrency(p.budget)}</span>}
                {p.deadline && <span>due {formatDate(p.deadline)}</span>}
              </div>
              {p.notes && <p className="mt-2 text-sm text-gray-600">{p.notes}</p>}
              <button
                onClick={() => remove(p.id)}
                className="mt-3 text-xs text-gray-400 hover:text-danger"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
