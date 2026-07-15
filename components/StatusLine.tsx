import type { Status } from "@/lib/content";

const LIVE_STATUSES: Status[] = ["live", "active", "current"];

const STATUS_TEXT: Record<Status, string> = {
  live: "live",
  active: "active",
  current: "current",
  dev: "in dev",
  closed: "closed",
};

export default function StatusLine({
  status,
  dateRange,
  suffix,
}: {
  status: Status;
  dateRange: string;
  suffix?: string;
}) {
  const isLive = LIVE_STATUSES.includes(status);
  return (
    <div className="flex items-center gap-2 font-mono text-xs text-secondary">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          isLive ? "bg-status-live" : "bg-status-idle"
        }`}
        aria-hidden="true"
      />
      <span>
        {STATUS_TEXT[status]} · {dateRange}
        {suffix ? ` · ${suffix}` : ""}
      </span>
    </div>
  );
}
