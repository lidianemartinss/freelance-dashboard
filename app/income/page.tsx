"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, classNames } from "@/lib/utils";

type Project = { id: string; name: string; client: string };
type Payment = {
  id: string;
  amount: number;
  status: "PENDING" | "INVOICED" | "PAID";
  date: string;
  notes: string | null;
  projectId: string | null;
  project: Project | null;
};

const STATUS_STYLES: Record<Payment["status"], string> = {
  PENDING: "bg-gray-100 text-gray-600",
  INVOICED: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
};

export default function IncomePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    projectId: "",
    amount: "",
    status: "PAID",
    date: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    const [pRes, prRes] = await Promise.all([fetch("/api/payments"), fetch("/api/projects")]);
    setPayments(await pRes.json());
    setProjects(await prRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount) return;
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ projectId: "", amount: "", status: "PAID", date: "", notes: "" });
    setShowForm(false);
    load();
  }

  async function updateStatus(id: string, status: Payment["status"]) {
    await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this payment entry?")) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    load();
  }

  const paidTotal = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const pendingTotal = payments
    .filter((p) => p.status !== "PAID")
    .reduce((s, p) => s + p.amount, 0);

  const bySource = payments
    .filter((p) => p.status === "PAID")
    .reduce<Record<string, number>>((acc, p) => {
      const key = p.project ? p.project.name : "Sem fonte";
      acc[key] = (acc[key] || 0) + p.amount;
      return acc;
    }, {});
  const sourceEntries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Income</h2>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Log payment"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400">Total received</p>
          <p className="text-2xl font-semibold mt-1">{formatCurrency(paidTotal)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400">Invoiced / pending</p>
          <p className="text-2xl font-semibold mt-1">{formatCurrency(pendingTotal)}</p>
        </div>
      </div>

      {sourceEntries.length > 0 && (
        <div className="card">
          <p className="text-sm text-gray-400 mb-2">Por fonte de renda</p>
          <ul className="space-y-2">
            {sourceEntries.map(([name, total]) => {
              const pct = paidTotal > 0 ? (total / paidTotal) * 100 : 0;
              return (
                <li key={name} className="flex items-center justify-between text-sm gap-3">
                  <span className="font-medium w-32 truncate">{name}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-accent2 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-500 w-20 text-right">{formatCurrency(total)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showForm && (
        <form onSubmit={addPayment} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            className="input"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">No linked project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.client}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Amount (EUR)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PENDING">Pending</option>
            <option value="INVOICED">Invoiced</option>
            <option value="PAID">Paid</option>
          </select>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            className="input sm:col-span-2"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="btn">
              Save payment
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-400">No payments logged yet.</p>
      ) : (
        <div className="card divide-y divide-gray-100">
          {payments.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{formatCurrency(p.amount)}</p>
                <p className="text-sm text-gray-400">
                  {p.project ? p.project.name : "No project"} · {formatDate(p.date)}
                </p>
                {p.notes && <p className="text-sm text-gray-500">{p.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={p.status}
                  onChange={(e) => updateStatus(p.id, e.target.value as Payment["status"])}
                  className={classNames(
                    "text-xs font-medium rounded-full px-2 py-1 border-none",
                    STATUS_STYLES[p.status]
                  )}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="INVOICED">INVOICED</option>
                  <option value="PAID">PAID</option>
                </select>
                <button
                  onClick={() => remove(p.id)}
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
