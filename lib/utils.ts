export function formatCurrency(amount: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function daysUntil(date: Date | string | null | undefined) {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ISO week number (Mon-Sun), used to compare "same week" for weekly recurring tasks.
function isoWeekKey(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-${weekNo}`;
}

/**
 * For recurring tasks, "done" isn't a permanent flag — it's whether
 * lastCompletedAt falls within the current period (today for DAILY,
 * this week for WEEKLY). Non-recurring tasks just use the `done` flag.
 */
export function isDoneForPeriod(
  recurrence: "NONE" | "DAILY" | "WEEKLY",
  done: boolean,
  lastCompletedAt: Date | string | null | undefined
): boolean {
  if (recurrence === "NONE") return done;
  if (!lastCompletedAt) return false;
  const last = typeof lastCompletedAt === "string" ? new Date(lastCompletedAt) : lastCompletedAt;
  const now = new Date();
  if (recurrence === "DAILY") {
    return (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    );
  }
  // WEEKLY
  return isoWeekKey(last) === isoWeekKey(now);
}
