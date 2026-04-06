export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-zinc-800" />

      {/* Header skeleton */}
      <div className="flex gap-5 mb-10">
        <div className="h-36 w-28 animate-pulse rounded-xl bg-zinc-800" />
        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="h-7 w-3/4 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-800/50" />
          <div className="flex gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-3 flex-1 animate-pulse rounded-sm bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>

      {/* Evaluaciones skeleton */}
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
