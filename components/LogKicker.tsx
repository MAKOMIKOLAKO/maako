export default function LogKicker({
  index,
  label,
}: {
  index: string;
  label?: string;
}) {
  return (
    <p className="font-mono text-xs text-muted mb-1.5">
      // {index}
      {label ? ` — ${label}` : ""}
    </p>
  );
}
