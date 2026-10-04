export function PlayerSkeleton() { return <div className="skeleton aspect-video w-full" aria-hidden />; }
export function CardsSkeleton({ n = 8 }: { n?: number }) {
  return (<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-hidden>{Array.from({ length: n }, (_, i) => <div key={i} className="skeleton h-52" />)}</div>);
}
export function StatsSkeleton() { return <div className="grid grid-cols-2 gap-2" aria-hidden>{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14" />)}</div>; }
export function SearchSkeleton() { return <div className="skeleton h-10 w-full" aria-hidden />; }
