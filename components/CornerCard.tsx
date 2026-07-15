import { ReactNode } from "react";

export default function CornerCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`log-card p-5 ${className}`}>
      <span className="corner-marks" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {children}
    </div>
  );
}
