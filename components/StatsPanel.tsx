import { StatsSkeleton } from "./LoadingSkeleton";
export default function StatsPanel({ stats, loading }: { stats: { label: string; value: number }[]; loading?: boolean }) {
  if (loading) return <StatsSkeleton />;
  return (
    <dl className="grid grid-cols-2 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl bg-line/5 p-2.5">
          <dd className="text-lg font-semibold leading-none">{s.value.toLocaleString()}</dd>
          <dt className="mt-1 text-[11px] text-muted">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
