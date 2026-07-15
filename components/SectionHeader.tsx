export default function SectionHeader({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs text-muted mb-1">// {index}</p>
      <h2 className="text-xl sm:text-2xl font-medium text-graphite tracking-tight">
        {title}
      </h2>
      <div className="mt-3 h-px w-10 bg-accent" />
    </div>
  );
}
