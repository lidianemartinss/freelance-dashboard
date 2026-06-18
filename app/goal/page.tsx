"use client";

import { useEffect, useState } from "react";

type Goal = {
  name: string;
  targetAmount: number;
  targetDate: string | null;
  currency: string;
  notes: string | null;
};

export default function GoalPage() {
  const [form, setForm] = useState<Goal>({
    name: "Master's in Italy",
    targetAmount: 0,
    targetDate: "",
    currency: "EUR",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/goal")
      .then((r) => r.json())
      .then((g) => {
        if (g) {
          setForm({
            name: g.name,
            targetAmount: g.targetAmount,
            targetDate: g.targetDate ? g.targetDate.slice(0, 10) : "",
            currency: g.currency,
            notes: g.notes || "",
          });
        }
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/goal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold">Your goal</h2>
      <p className="text-sm text-gray-500">
        This is the target your dashboard tracks progress against — e.g. the funds you need for
        your master's program in Italy (tuition, visa funds, living costs).
      </p>
      <form onSubmit={save} className="card space-y-3">
        <div>
          <label className="text-sm text-gray-500">Goal name</label>
          <input
            className="input mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500">Target amount</label>
            <input
              className="input mt-1"
              type="number"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Currency</label>
            <select
              className="input mt-1"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-500">Target date (e.g. enrollment deadline)</label>
          <input
            className="input mt-1"
            type="date"
            value={form.targetDate ?? ""}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            className="input mt-1"
            placeholder="e.g. program name, university, scholarship status"
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button type="submit" className="btn">
          Save goal
        </button>
        {saved && <span className="text-sm text-accent2 ml-3">Saved ✓</span>}
      </form>
    </div>
  );
}
