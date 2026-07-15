import { ReactNode } from "react";

export default function CornerCard({
  children,
  className = "",
  hint = false,
}: {
  children: ReactNode;
  className?: string;
  hint?: boolean;
}) {
  return (
    <div className={`log-card p-5 ${className}`}>
      <span className="corner-marks" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {hint && (
        <span
          className="card-hint absolute top-3 right-3 flex items-center gap-1 font-mono text-[10px] tracking-wide"
          aria-hidden="true"
        >
          details
          <svg
            viewBox="0 0 16 16"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <path
              d="M6 2H2v4M10 14h4v-4M2 14l5-5M14 2l-5 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
}
