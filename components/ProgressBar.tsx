import { classNames } from "@/lib/utils";

export default function ProgressBar({
  percent,
  colorClass = "bg-accent",
}: {
  percent: number;
  colorClass?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={classNames("h-full rounded-full transition-all", colorClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
