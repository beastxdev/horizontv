export default function ErrorState({ message, hint, lastCount, onRetry }: { message: string; hint?: string; lastCount?: number; onRetry: () => void }) {
  return (
    <div role="alert" className="mx-auto mt-16 max-w-lg glass rounded-3xl p-8 text-center animate-fadeIn">
      <div className="text-5xl" aria-hidden>📡</div>
      <h2 className="mt-4 text-xl font-semibold">Couldn&apos;t load the playlist</h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {lastCount ? <p className="mt-3 text-xs text-muted">Last successful load: {lastCount.toLocaleString()} channels</p> : null}
      <button className="btn btn-primary mt-6" onClick={onRetry}>↻ Retry</button>
    </div>
  );
}
