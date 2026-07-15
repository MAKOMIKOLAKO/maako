export default function SectionHeader({
  index,
}: {
  index: string;
  title?: string;
}) {
  return (
    <div className="mb-8">
      <p className="font-mono text-sm text-secondary">// {index}</p>
      <div className="mt-3 h-px w-10 bg-accent" />
    </div>
  );
}
